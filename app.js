// 特斯拉涂装生成器 - 固定区域 + 部件点选绑定 + 贴膜
// 支持多车型模板选择 + 自定义模板上传

// 内置模板
const BUILTIN_TEMPLATES = {
  model3: './assets/template.png',
  model3_perf: './assets/template_model3_perf.png',
  model3_2022: './assets/template_model3_2022.png',
  modely: './assets/template_modely.png',
  modely_perf: './assets/template_modely_perf.png',
  modely_premium: './assets/template_modely_premium.png',
  modely_2022: './assets/template_modely_2022.png',
  models: './assets/template_models.png',
  modelx: './assets/template_modelx.png',
  cybertruck: './assets/template_cybertruck.png',
};
let currentTemplateUrl = BUILTIN_TEMPLATES.model3_2022;
let customTemplateImage = null; // 自定义上传的模板 Image

// 模板预处理结果
let templatePrep = null;     // { W, H, mask, edge, components }
// components: 每个连通部件 { id, mask(Uint8Array), bbox }
// regions: 区域 { id, name, compIds(Set), image, scale, offsetX, offsetY, rotation, fixed, locked }

let regions = [];
let regionSeq = 0;
let activeRegionId = null;

let resultCanvas = null;

const $ = (id) => document.getElementById(id);
const tabsEl = $('tabs');
const dropZone = $('dropZone');
const fileInput = $('fileInput');
const templateSelect = $('templateSelect');
const customTemplateField = $('customTemplateField');
const templateDropZone = $('templateDropZone');
const templateFileInput = $('templateFileInput');
const editTools = $('editTools');
const scaleSlider = $('scaleSlider');
const scaleLabel = $('scaleLabel');
const rotateSlider = $('rotateSlider');
const rotateLabel = $('rotateLabel');
const resetBtn = $('resetBtn');
const centerBtn = $('centerBtn');
const fixBtn = $('fixBtn');
const unfixBtn = $('unfixBtn');
const lockBtn = $('lockBtn');
const downloadBtn = $('downloadBtn');
const shareBtn = $('shareBtn');
const statusEl = $('status');
const previewCanvas = $('previewCanvas');
const borderToggle = $('borderToggle');
const previewHint = $('previewHint');
const fillColor = $('fillColor');
const fillBtn = $('fillBtn');
const clearFillBtn = $('clearFillBtn');

let fillColorValue = null;

// ---------- 加载模板 + 连通域分析 ----------
async function prepareTemplate(force = false) {
  if (templatePrep && !force) return templatePrep;
  const img = customTemplateImage || (() => { const im = new Image(); im.src = currentTemplateUrl; return im; })();
  if (!customTemplateImage) {
    await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('模板加载失败')); });
  }
  const W = img.naturalWidth || img.width;
  const H = img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, W, H).data;

  const mask = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) if (data[i * 4 + 3] > 0) mask[i] = 1;

  // 边缘
  const edge = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    if (mask[i] && (!mask[i - 1] || !mask[i + 1] || !mask[i - W] || !mask[i + W])) edge[i] = 1;
  }

  // 连通域
  const visited = new Uint8Array(W * H);
  const components = [];
  let cid = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!mask[y * W + x] || visited[y * W + x]) continue;
    const q = [[x, y]];
    visited[y * W + x] = 1;
    const cmask = new Uint8Array(W * H);
    let minX = x, maxX = x, minY = y, maxY = y, cnt = 0;
    while (q.length) {
      const [cx, cy] = q.pop();
      cmask[cy * W + cx] = 1;
      cnt++;
      if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H && mask[ny * W + nx] && !visited[ny * W + nx]) {
          visited[ny * W + nx] = 1;
          q.push([nx, ny]);
        }
      }
    }
    components.push({ id: cid++, mask: cmask, bbox: { minX, minY, maxX, maxY }, area: cnt });
  }
  // 按面积降序排序，重新编号（大部件在前）
  components.sort((a, b) => b.area - a.area);
  components.forEach((c, i) => c.id = i);

  // 预计算每个部件的"间隙边缘"像素（描边用）
  // 描边画在部件外侧的透明间隙里，而不是部件内部边缘，
  // 这样窄间隙会被清晰的分隔线标记，不会视觉粘连
  for (const c of components) {
    const edgePixels = [];
    const cm = c.mask;
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        // 透明的像素，且上下左右有一个属于该部件的膜片像素
        if (!cm[i] && (cm[i - 1] || cm[i + 1] || cm[i - W] || cm[i + W])) {
          edgePixels.push(i);
        }
      }
    }
    c.edgePixels = edgePixels;
  }

  templatePrep = { W, H, mask, edge, components };
  return templatePrep;
}

// ---------- 区域管理（5 个固定区域）----------
const FIXED_REGIONS = ['车头', '左侧', '右侧', '车尾', '车顶'];

function initRegions() {
  regions = FIXED_REGIONS.map((name, i) => ({
    id: i,
    name,
    compIds: new Set(),
    image: null,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    fixed: false,
    locked: false,
  }));
  regionSeq = FIXED_REGIONS.length;
  activeRegionId = 0;
}

function renderTabs() {
  tabsEl.innerHTML = '';
  for (const r of regions) {
    const tab = document.createElement('div');
    const isActive = r.id === activeRegionId;
    tab.className = 'tab' + (isActive ? ' active' : ' inactive') + (r.fixed ? ' fixed' : '');
    tab.dataset.id = r.id;
    const count = r.compIds.size;
    tab.innerHTML = '<span class="dot"></span>' + r.name + (count ? ' (' + count + ')' : '');
    tab.addEventListener('click', () => switchRegion(r.id));
    tabsEl.appendChild(tab);
  }
}

function switchRegion(id) {
  activeRegionId = id;
  // 清空交互状态，避免拖拽/缩放状态残留影响新区域的点选
  dragMode = false;
  pinchState = null;
  activePointers.clear();
  renderTabs();
  renderPreview();
  updateRegionUI();
}

function getActiveRegion() {
  return regions.find(r => r.id === activeRegionId) || null;
}

// ---------- 部件点选 / 拖拽 / 双指缩放 ----------
let dragMode = false, dragStart = null, dragOrig = null;
let pinchState = null; // { startDist, startScale }
const activePointers = new Map(); // pointerId -> {x, y}（画布坐标）

function getCanvasPos(e) {
  const rect = previewCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (previewCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (previewCanvas.height / rect.height);
  return { x, y };
}

function pointersDistance() {
  const pts = [...activePointers.values()];
  if (pts.length < 2) return 0;
  return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
}

previewCanvas.addEventListener('pointerdown', (e) => {
  const region = getActiveRegion();
  if (!region) return;
  const p = getCanvasPos(e);
  activePointers.set(e.pointerId, p);
  try { previewCanvas.setPointerCapture(e.pointerId); } catch (_) {}

  // 未锁定：点击 = 点选/取消部件
  if (!region.locked) {
    const comp = hitComponent(p.x, p.y);
    if (comp) {
      if (region.compIds.has(comp.id)) {
        region.compIds.delete(comp.id);
        setStatus('已取消部件绑定');
      } else {
        region.compIds.add(comp.id);
        setStatus('已绑定部件到「' + region.name + '」（可继续点选，选完点锁定）');
      }
      renderPreview();
      renderTabs();
      updateRegionUI();
    }
    return;
  }

  // 锁定后：单指拖拽 / 双指缩放（固定后禁止）
  if (!region.image || region.fixed) return;

  if (activePointers.size === 1) {
    dragMode = true;
    dragStart = p;
    dragOrig = { x: region.offsetX, y: region.offsetY };
  } else if (activePointers.size === 2) {
    dragMode = false;
    pinchState = { startDist: pointersDistance(), startScale: region.scale };
  }
  e.preventDefault();
});

previewCanvas.addEventListener('pointermove', (e) => {
  const region = getActiveRegion();
  if (!region || !region.image || region.fixed) return;
  const p = getCanvasPos(e);
  if (activePointers.has(e.pointerId)) activePointers.set(e.pointerId, p);

  // 双指缩放
  if (activePointers.size === 2 && pinchState) {
    const dist = pointersDistance();
    if (pinchState.startDist > 0) {
      const newScale = pinchState.startScale * (dist / pinchState.startDist);
      region.scale = Math.max(0.1, Math.min(10, newScale));
      scaleSlider.value = Math.round(region.scale * 100);
      scaleLabel.textContent = scaleSlider.value + '%';
      renderPreview();
    }
    return;
  }

  // 单指拖拽
  if (dragMode && activePointers.size === 1) {
    region.offsetX = dragOrig.x + (p.x - dragStart.x);
    region.offsetY = dragOrig.y + (p.y - dragStart.y);
    renderPreview();
  }
});

previewCanvas.addEventListener('pointerup', (e) => {
  activePointers.delete(e.pointerId);
  if (activePointers.size < 2) pinchState = null;
  if (activePointers.size === 0) {
    if (dragMode) {
      dragMode = false;
      previewCanvas.style.cursor = 'pointer';
      updateResult();
    }
  }
});

previewCanvas.addEventListener('pointercancel', (e) => {
  activePointers.delete(e.pointerId);
  if (activePointers.size < 2) pinchState = null;
  if (activePointers.size === 0) {
    dragMode = false;
    previewCanvas.style.cursor = 'pointer';
  }
});

function hitComponent(x, y) {
  if (!templatePrep || x < 0 || y < 0 || x >= templatePrep.W || y >= templatePrep.H) return null;
  const i = Math.floor(y) * templatePrep.W + Math.floor(x);
  if (!templatePrep.mask[i]) return null;
  for (const c of templatePrep.components) {
    if (c.mask[i]) return c;
  }
  return null;
}

// ---------- 图片上传 ----------
function handleFile(file) {
  const region = getActiveRegion();
  if (!region) { setStatus('请先选择区域', true); return; }
  if (!file || !file.type.startsWith('image/')) { setStatus('请上传图片文件', true); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      region.image = img;
      region.scale = 1;
      region.offsetX = 0;
      region.offsetY = 0;
      region.rotation = 0;
      region.fixed = false;
      // 上传图片后自动锁定部件（避免拖拽时误触取消）
      if (region.compIds.size > 0) region.locked = true;
      scaleSlider.value = 100; scaleLabel.textContent = '100%';
      rotateSlider.value = 0; rotateLabel.textContent = '0°';
      updateRegionUI();
      renderTabs();
      renderPreview();
      setStatus('已上传图片到「' + region.name + '」，拖动/缩放/旋转调整后点「固定」');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag'));
dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag'); handleFile(e.dataTransfer.files[0]); });
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

function setStatus(msg, isErr = false) {
  statusEl.textContent = msg;
  statusEl.className = 'status' + (isErr ? ' err' : ' ok');
}

function updateRegionUI() {
  const region = getActiveRegion();
  const hasImage = region && region.image;
  editTools.style.display = hasImage ? 'flex' : 'none';
  fixBtn.disabled = !region || !hasImage || region.fixed;
  unfixBtn.disabled = !region || !region.fixed;
  // 锁定按钮：切换锁（未锁定→可锁定；已锁定→可解锁）
  if (region) {
    if (region.locked) {
      lockBtn.disabled = false;
      lockBtn.textContent = '解锁重新选';
      lockBtn.classList.add('ghost');
      lockBtn.classList.remove('fixed-btn');
    } else {
      lockBtn.disabled = region.compIds.size === 0;
      lockBtn.textContent = '锁定部件';
      lockBtn.classList.remove('ghost');
      lockBtn.classList.add('fixed-btn');
    }
  } else {
    lockBtn.disabled = true;
  }
  if (hasImage) {
    scaleSlider.value = Math.round(region.scale * 100);
    scaleLabel.textContent = scaleSlider.value + '%';
    rotateSlider.value = Math.round(region.rotation);
    rotateLabel.textContent = rotateSlider.value + '°';
  }
}

// ---------- 渲染 ----------
function getRegionMask(region) {
  if (!templatePrep) return null;
  const { W, H } = templatePrep;
  const rmask = new Uint8Array(W * H);
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (const cid of region.compIds) {
    const c = templatePrep.components.find(x => x.id === cid);
    if (!c) continue;
    for (let i = 0; i < W * H; i++) {
      if (c.mask[i]) {
        rmask[i] = 1;
        const x = i % W, y = (i / W) | 0;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  return { mask: rmask, bbox: { minX, minY, maxX, maxY } };
}

function getDrawRect(region, rmask) {
  const img = region.image;
  if (!img || !rmask) return null;
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const bw = rmask.bbox.maxX - rmask.bbox.minX + 1;
  const bh = rmask.bbox.maxY - rmask.bbox.minY + 1;
  const scale = Math.min(bw / sw, bh / sh) * region.scale;
  const dw = sw * scale;
  const dh = sh * scale;
  const cx = rmask.bbox.minX + bw / 2 + region.offsetX;
  const cy = rmask.bbox.minY + bh / 2 + region.offsetY;
  const dx = cx - dw / 2;
  const dy = cy - dh / 2;
  return { dx, dy, dw, dh, cx, cy };
}

// 渲染：部件着色 + 区域图片 + 边框
function renderPreview() {
  if (!templatePrep) return;
  const { W, H, mask, edge, components } = templatePrep;
  const ctx = previewCanvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const activeRegion = getActiveRegion();

  // 1) 填充色（未绑定到任何区域的部件）
  const fill = parseFillColor();
  // 收集所有已绑定到区域的部件（不管是否固定），填充时跳过
  const usedCompIds = new Set();
  for (const r of regions) for (const cid of r.compIds) usedCompIds.add(cid);

  if (fill) {
    const fd = ctx.getImageData(0, 0, W, H);
    for (const c of components) {
      if (usedCompIds.has(c.id)) continue; // 已绑定区域不填充
      for (let i = 0; i < W * H; i++) {
        if (c.mask[i]) {
          fd.data[i * 4] = fill.r;
          fd.data[i * 4 + 1] = fill.g;
          fd.data[i * 4 + 2] = fill.b;
          fd.data[i * 4 + 3] = 255;
        }
      }
    }
    ctx.putImageData(fd, 0, 0);
  }

  // 2) 各区域图片
  for (const r of regions) {
    if (!r.image) continue;
    if (!r.fixed && r.id !== activeRegionId) continue;
    const rmask = getRegionMask(r);
    if (!rmask) continue;
    const rect = getDrawRect(r, rmask);
    if (!rect) continue;

    const layer = document.createElement('canvas');
    layer.width = W; layer.height = H;
    const lctx = layer.getContext('2d');
    // 旋转绘制
    lctx.translate(rect.cx, rect.cy);
    lctx.rotate(r.rotation * Math.PI / 180);
    lctx.drawImage(r.image, -rect.dw / 2, -rect.dh / 2, rect.dw, rect.dh);
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    const ldata = lctx.getImageData(0, 0, W, H);
    for (let i = 0; i < W * H; i++) {
      if (!rmask.mask[i]) ldata.data[i * 4 + 3] = 0;
    }
    lctx.putImageData(ldata, 0, 0);
    ctx.drawImage(layer, 0, 0);
  }

  // 3) 边框/着色：区分部件状态（受「边框」开关控制）
  if (borderToggle.checked) {
    const overlay = ctx.getImageData(0, 0, W, H);
    for (const c of components) {
      let color = null;
      if (activeRegion && activeRegion.compIds.has(c.id)) {
        color = [226, 75, 74]; // 当前区域绑定：红
      } else if (usedCompIds.has(c.id)) {
        const owner = regions.find(r => r.compIds.has(c.id));
        if (owner && owner.fixed) color = [15, 110, 86]; // 已固定：绿
        else color = [237, 137, 54]; // 已绑定未固定：橙
      } else {
        color = [24, 95, 165]; // 未绑定：蓝
      }
      if (!color) continue;
      for (const i of c.edgePixels) {
        overlay.data[i * 4] = color[0];
        overlay.data[i * 4 + 1] = color[1];
        overlay.data[i * 4 + 2] = color[2];
        overlay.data[i * 4 + 3] = 255;
      }
    }
    ctx.putImageData(overlay, 0, 0);
  }
}

function parseFillColor() {
  if (!fillColorValue) return null;
  const r = parseInt(fillColorValue.slice(1, 3), 16);
  const g = parseInt(fillColorValue.slice(3, 5), 16);
  const b = parseInt(fillColorValue.slice(5, 7), 16);
  return { r, g, b };
}

// 更新最终结果（固定区域 + 填充色）
function updateResult() {
  if (!templatePrep) return;
  const { W, H, components } = templatePrep;
  if (!resultCanvas) {
    resultCanvas = document.createElement('canvas');
    resultCanvas.width = W; resultCanvas.height = H;
  }
  const ctx = resultCanvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const fill = parseFillColor();
  // 收集所有已绑定到区域的部件（填充时跳过）
  const usedCompIds = new Set();
  for (const r of regions) for (const cid of r.compIds) usedCompIds.add(cid);

  // 填充
  if (fill) {
    const fd = ctx.getImageData(0, 0, W, H);
    for (const c of components) {
      if (usedCompIds.has(c.id)) continue; // 已绑定区域不填充
      for (let i = 0; i < W * H; i++) {
        if (c.mask[i]) {
          fd.data[i * 4] = fill.r;
          fd.data[i * 4 + 1] = fill.g;
          fd.data[i * 4 + 2] = fill.b;
          fd.data[i * 4 + 3] = 255;
        }
      }
    }
    ctx.putImageData(fd, 0, 0);
  }

  // 固定区域图片
  for (const r of regions) {
    if (!r.image || !r.fixed) continue;
    const rmask = getRegionMask(r);
    if (!rmask) continue;
    const rect = getDrawRect(r, rmask);
    if (!rect) continue;
    const layer = document.createElement('canvas');
    layer.width = W; layer.height = H;
    const lctx = layer.getContext('2d');
    lctx.translate(rect.cx, rect.cy);
    lctx.rotate(r.rotation * Math.PI / 180);
    lctx.drawImage(r.image, -rect.dw / 2, -rect.dh / 2, rect.dw, rect.dh);
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    const ldata = lctx.getImageData(0, 0, W, H);
    for (let i = 0; i < W * H; i++) {
      if (!rmask.mask[i]) ldata.data[i * 4 + 3] = 0;
    }
    lctx.putImageData(ldata, 0, 0);
    ctx.drawImage(layer, 0, 0);
  }
}

// ---------- 缩放/旋转 ----------
previewCanvas.addEventListener('wheel', (e) => {
  const region = getActiveRegion();
  if (!region || !region.image || region.fixed) return;
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.05 : 0.05;
  region.scale = Math.max(0.1, Math.min(10, region.scale + delta));
  scaleSlider.value = Math.round(region.scale * 100);
  scaleLabel.textContent = scaleSlider.value + '%';
  renderPreview();
}, { passive: false });

scaleSlider.addEventListener('input', () => {
  const region = getActiveRegion();
  if (!region || region.fixed) return;
  region.scale = scaleSlider.value / 100;
  scaleLabel.textContent = scaleSlider.value + '%';
  renderPreview();
});

rotateSlider.addEventListener('input', () => {
  const region = getActiveRegion();
  if (!region || region.fixed) return;
  region.rotation = rotateSlider.value;
  rotateLabel.textContent = rotateSlider.value + '°';
  renderPreview();
});

resetBtn.addEventListener('click', () => {
  const region = getActiveRegion();
  if (!region || region.fixed) return;
  region.scale = 1; region.offsetX = 0; region.offsetY = 0; region.rotation = 0;
  scaleSlider.value = 100; scaleLabel.textContent = '100%';
  rotateSlider.value = 0; rotateLabel.textContent = '0°';
  renderPreview();
});

centerBtn.addEventListener('click', () => {
  const region = getActiveRegion();
  if (!region || region.fixed) return;
  region.offsetX = 0; region.offsetY = 0;
  renderPreview();
});

borderToggle.addEventListener('change', renderPreview);

// ---------- 锁定 / 解锁 ----------
lockBtn.addEventListener('click', () => {
  const region = getActiveRegion();
  if (!region) return;

  if (region.locked) {
    // 解锁：重新进入选部件模式
    region.locked = false;
    updateRegionUI();
    renderPreview();
    setStatus('已解锁，可重新点选部件');
  } else {
    // 锁定
    if (region.compIds.size === 0) { setStatus('请先在预览图点选要绑定的部件', true); return; }
    region.locked = true;
    updateRegionUI();
    renderPreview();
    setStatus('已锁定部件绑定，现在可以拖拽图片了');
  }
});

// ---------- 固定 ----------
fixBtn.addEventListener('click', () => {
  const region = getActiveRegion();
  if (!region || !region.image) return;
  if (region.compIds.size === 0) { setStatus('请先在预览图点选要绑定的部件', true); return; }
  region.fixed = true;
  region.locked = true; // 固定后同时锁定，禁止继续拖拽/缩放
  renderTabs();
  updateRegionUI();
  updateResult();
  downloadBtn.disabled = false;
  shareBtn.disabled = false;
  setStatus('已固定「' + region.name + '」');
});

unfixBtn.addEventListener('click', () => {
  const region = getActiveRegion();
  if (!region) return;
  region.fixed = false;
  renderTabs();
  updateRegionUI();
  updateResult();
  setStatus('已取消固定');
});

// ---------- 填充 ----------
fillBtn.addEventListener('click', () => {
  fillColorValue = fillColor.value;
  renderPreview();
  updateResult();
  setStatus('已填充未贴图区域');
});
clearFillBtn.addEventListener('click', () => {
  fillColorValue = null;
  renderPreview();
  updateResult();
  setStatus('已清除填充');
});

// ---------- 下载 ----------
downloadBtn.addEventListener('click', () => {
  const hasFixed = regions.some(r => r.fixed);
  if (!hasFixed) { setStatus('请先固定至少一个区域', true); return; }
  updateResult();
  const base = 'Tesla_Wrap_' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const name = base.slice(0, 30) + '.png';
  resultCanvas.toBlob((blob) => {
    if (blob.size > 1024 * 1024) { setStatus('⚠ 文件超过 1MB，自动压缩…', true); compressAndDownload(); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
    setStatus('已导出 ' + name);
  }, 'image/png');
});

function compressAndDownload() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(resultCanvas, 0, 0, 512, 512);
  const name = 'Tesla_Wrap_' + Date.now().toString().slice(-8) + '.png';
  canvas.toBlob((blob) => {
    if (blob.size > 1024 * 1024) { setStatus('仍超过 1MB，请换更简洁的图片', true); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
    setStatus('已导出（512 压缩版）' + name);
  }, 'image/png');
}

// ---------- 分享晒图 ----------
// 把涂装贴纸合成到一张带水印（工具名 + 链接）的分享图上
function shareImage() {
  if (!resultCanvas) return;
  updateResult();
  const hasFixed = regions.some(r => r.fixed);
  if (!hasFixed) { setStatus('请先固定至少一个区域', true); return; }

  const SHARE_LINK = 'tesla-wrap-tool.app.workbuddy.host';
  const SHARE_TITLE = '特斯拉涂装生成器';
  const SHARE_SUB = '免费在线设计你的特斯拉车衣涂装';

  // 分享图尺寸：1080×1440（竖版，适合朋友圈/小红书）
  const SW = 1080, SH = 1440;
  const canvas = document.createElement('canvas');
  canvas.width = SW; canvas.height = SH;
  const ctx = canvas.getContext('2d');

  // 背景：深色渐变
  const grad = ctx.createLinearGradient(0, 0, 0, SH);
  grad.addColorStop(0, '#1a1d21');
  grad.addColorStop(1, '#2a2f36');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SW, SH);

  // 顶部标题
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('我的特斯拉涂装', SW / 2, 100);

  // 涂装贴纸主体（居中，等比缩放）
  const tw = resultCanvas.width, th = resultCanvas.height;
  const maxW = SW - 120, maxH = SH - 380;
  const scale = Math.min(maxW / tw, maxH / th);
  const dw = tw * scale, dh = th * scale;
  const dx = (SW - dw) / 2, dy = 140 + (maxH - dh) / 2;
  ctx.drawImage(resultCanvas, dx, dy, dw, dh);

  // 底部水印条
  const barY = SH - 180;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, barY, SW, 180);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(SHARE_TITLE, SW / 2, barY + 60);
  ctx.font = '28px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#e0e4e8';
  ctx.fillText(SHARE_SUB, SW / 2, barY + 105);
  ctx.fillStyle = '#7ab8f5';
  ctx.fillText(SHARE_LINK, SW / 2, barY + 150);

  // 导出分享图
  const name = 'Tesla_涂装分享_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.png';
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
    setStatus('已生成分享图 ' + name);
  }, 'image/png');
}

shareBtn.addEventListener('click', shareImage);

// ---------- 车型模板切换 / 自定义上传 ----------
templateSelect.addEventListener('change', async () => {
  const val = templateSelect.value;
  if (val === 'custom') {
    customTemplateField.style.display = '';
    return;
  }
  customTemplateField.style.display = 'none';
  customTemplateImage = null;
  currentTemplateUrl = BUILTIN_TEMPLATES[val];
  await switchTemplate();
});

templateDropZone.addEventListener('click', () => templateFileInput.click());
templateDropZone.addEventListener('dragover', (e) => { e.preventDefault(); templateDropZone.classList.add('drag'); });
templateDropZone.addEventListener('dragleave', () => templateDropZone.classList.remove('drag'));
templateDropZone.addEventListener('drop', (e) => { e.preventDefault(); templateDropZone.classList.remove('drag'); handleTemplateFile(e.dataTransfer.files[0]); });
templateFileInput.addEventListener('change', (e) => handleTemplateFile(e.target.files[0]));

function handleTemplateFile(file) {
  if (!file || !file.type.startsWith('image/')) { setStatus('请上传 PNG 模板', true); return; }
  const reader = new FileReader();
  reader.onload = async (e) => {
    const img = new Image();
    img.onload = async () => {
      customTemplateImage = img;
      await switchTemplate();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function switchTemplate() {
  // 重置所有状态
  templatePrep = null;
  regions = [];
  regionSeq = 0;
  activeRegionId = null;
  resultCanvas = null;
  fillColorValue = null;
  initRegions();
  renderTabs();
  updateRegionUI();
  downloadBtn.disabled = true;
  shareBtn.disabled = true;
  try {
    await prepareTemplate(true);
    previewCanvas.width = templatePrep.W;
    previewCanvas.height = templatePrep.H;
    renderPreview();
    setStatus('已切换模板，点击区域标签并点选部件');
  } catch (e) {
    console.error('模板加载失败:', e);
    setStatus('模板加载失败：' + (e.message || e), true);
  }
}

// ---------- 初始化 ----------
(async () => {
  // 先初始化区域标签（不依赖模板），确保标签始终显示
  initRegions();
  renderTabs();
  updateRegionUI();

  try {
    await prepareTemplate();
    previewCanvas.width = templatePrep.W;
    previewCanvas.height = templatePrep.H;
    renderPreview();
    setStatus('点击区域标签，然后在预览图上点选要绑定的部件');
  } catch (e) {
    console.error('模板加载失败:', e);
    setStatus('模板加载失败，请刷新重试：' + (e.message || e), true);
  }
})();
