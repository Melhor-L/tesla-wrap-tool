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

// 内置默认切割模板：针对某个车型的预设切割结果，页面加载该车型时自动应用
// key = 模板 URL，value = 被切割像素索引数组
const DEFAULT_CUT_TEMPLATES = {
  './assets/template_model3_2022.png': [126228,127251,128275,128750,129299,130323,131347,131819,131820,131821,132371,133395,134419,135443,136467,137491,137492,138516,138517,138518,138519,696956,696957,696958,696959,696960,696961,696962,696963,696964,696965],
  './assets/template.png': [927999,929021,929022,929023,930045,931069,932093,933117,934140,935164],
  './assets/template_model3_perf.png': [559192,559193,559194,559195,559196,559197,559198,559199,559200,559201,559202,559203,559204,559205,559206,559207,559208,559209,559210,559211,559212,559213,559214,559215,559216,559217,560241,560242,560243,560244,560245,560246,560247,560248,560249,560250,560251,561250,561251,561252,561253,561254,561255,561256,561257,561258,561259,561260,561261,561262,561263,561264,561265,561266,561267,561268,561269,561270,561271,561272,561273,561274,561275,561276,561277,561278,561279,561280,561281,561282,561283,561284,561285,561286,561287,561288,561289,561290,561291,561292,561293,561294,561295,561296,561297,561298,561299,561300,561301,561302,561303,561304,562329,563336,563337,563338,563354,563355,563356,563357,563358,563359,563360,563361,563362,563363,563364,563365,563366,563367,563368,563369,563370,563371,563372,563373,563374,563375,563376,564400,564401,564402,564403,564404,564405,564406,564407,564408,564409,565082,565083,565084,565100,565101,565102,565103,565104,565105,565106,565107,565108,565109,565110,565111,565112,565113,565114,565115,565116,565117,565118,565119,565120,565121,565122,565123,565124,565125,565126,565127,565128,565129,565130,565131,565132,565133,565134,565135,565136,565137,565138,565139,565140,565141,565142,565143,565144,565145,565146,565147,565148,565149,565150,565151,565152,565153,565154,565155,565156,565157,565158,565159,565160,565161,565162,565163,565433,565434,565435,565436,565437,565438,565439,565440,565441,566465,567491,567492,567493,567494,567495,567496,567497,567498,567499,567500,567501,568526,568527,568528,568529,568530,568531,569556,569557,569558,569559,569560,569561,569562,569563,570588,570589,571614,572639,572640,572641,572642,572643,573667,573668,573669,573670,573671,573672,573673,573674,926976,928000,929023,929024,930047,931071,932095,933119,934141,934142,934143,935165,936189,937213],
  './assets/template_modely_2022.png': [646463,647487,648511,648512,648900,648901,649536,649537,649538,649923,649924,650562,650947,651586,651587,651961,651967,651968,651969,651970,651971,652612,652613,652614,652985,652986,652987,652988,652989,652990,908929,909693,909952,909953,909958,910717,910976,910981,911741,912000,912005,912766,912767,912769,913023,913024,913028,913791,913793,914045,914046,914047,914050,914051,914052,914815,914816,914817,915069,915074,915841,916093,916098,916865,916866,917116,917117,917121,917889,917890,918139,918140,918144,918145,918914,918915,918916,918917,919163,919165,919166,919167,919168,919938,919939,919941,920187,920189,920963,920965,921211,921213,921987,921989,921990,922234,922235,922236,922237,923011,923012,923013,923014,923258,923259,923260,924037,924038,924282,924283,925061,925062,925306,925307,926085,926086,926087,926329,926330,926331,927110,927111,927352,927353,927354,928134,928135,928136,928375,928376,929159,929160,929399,929400,930183,930184,930423,930424,931207,931208,931209,931210,931446,931447,931448,932231,932232,932234,932470,932471,932472,933256,933258,933259,933491,933492,933493,933494,933495,934280,934283,934515,934518,934519,935304,935307,935539,935542,936328,936329,936330,936332,936563,936566,937354,937355,937356,937357,937587,937589,937590,938380,938381,938610,938611,938613,939404,939634,939637,940428,940658,940661,941452,941453,941682,941683,941684,941685,942706,942707,943730,943731,944753,944754,945777,945778,946801,946802,947825,948849,950895],
  './assets/template_modely_perf.png': [113085,113086,113087,113088,113089,113090,113091,113092,113093,113094,113095,113096,113097,113098,113099,113100,113101,113102,113103,113104,113105,113106,113107,113108,113109,113110,113111,113112,113113,113114,113115,113116,113117,113118,113119,113120,113121,113122,113123,113124,113125,113126,113127,113128,113129,113130,113131,113132,113133,113134,113135,113136,113137,113138,113139,113140,113141,113142,113143,113144,113145,113146,113147,113148,113149,113150,113151,113152,113153,113154,113155,113156,113157,113158,113159,113160,113161,113162,113163,113164,113165,113166,113167,113168,113169,113170,113171,113172,113173,113174,113175,113176,113177,113178,113179,113180,113181,113182,113183,113184,113185,113186,113187,113188,113189,113190,113191,113192,113193,113194,113195,113196,113197,113198,113199,113200,113201,113202,113203,113204,113205,113206,113207,113208,113209,373503,374524,374525,374526,375547,376571,377593,377594,378615,378616,378617,379638,379639,897143,897922,898167,898946,899191,899970,900215,900216,900993,900994,902017,903041,904065,905089,906113,907137,908161,909185,910209,911233,912257,913281,914305,915329,916353,917377,918401,919425,919674,919675,920449,920699,921473,921723,922497,922747,923521,923771,924545,924795,925569,925819,926593,926843,927617,927867,928641,928891,929665,930689,931713,932737,932988,933761,934012,934785,935036,935809,936060,936833,937084,937857,944003,945027],
};

// 手动切割：cutMask 记录用户画的切割线经过的膜片像素，连通域分析时视为"非膜片"，从而切开实心块
let cutMask = null;   // Uint8Array，被切割的像素标记
let cutMode = false;  // 是否处于切割模式
let cutting = false;  // 是否正在画切割线
let cutLastPos = null; // 上一条切割点（用于 Bresenham 连线）
let cutHistory = [];  // 切割历史快照（每次切割前保存 cutMask 副本，用于回退）

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
const cutModeBtn = $('cutModeBtn');
const undoCutBtn = $('undoCutBtn');
const exportCutBtn = $('exportCutBtn');
const importCutBtn = $('importCutBtn');
const importCutInput = $('importCutInput');
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

  // 初始化切割掩码（切换模板时重置）
  if (!cutMask || cutMask.length !== W * H) cutMask = new Uint8Array(W * H);

  // 若当前模板有内置默认切割，自动应用（仅当切割掩码为空时，不覆盖用户手动切割/导入）
  const defaultCut = DEFAULT_CUT_TEMPLATES[currentTemplateUrl];
  if (defaultCut && customTemplateImage === null) {
    let hasCut = false;
    for (let i = 0; i < cutMask.length; i++) if (cutMask[i]) { hasCut = true; break; }
    if (!hasCut) {
      for (const idx of defaultCut) {
        if (idx >= 0 && idx < W * H) cutMask[idx] = 1;
      }
    }
  }

  // 边缘
  const edge = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    if (mask[i] && (!mask[i - 1] || !mask[i + 1] || !mask[i - W] || !mask[i + W])) edge[i] = 1;
  }

  // 连通域（被切割的像素 cutMask 视为"非膜片"，从而把实心块拆开）
  const visited = new Uint8Array(W * H);
  const components = [];
  let cid = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const idx = y * W + x;
    if (!mask[idx] || cutMask[idx] || visited[idx]) continue;
    const q = [[x, y]];
    visited[idx] = 1;
    const cmask = new Uint8Array(W * H);
    let minX = x, maxX = x, minY = y, maxY = y, cnt = 0;
    while (q.length) {
      const [cx, cy] = q.pop();
      const ci = cy * W + cx;
      cmask[ci] = 1;
      cnt++;
      if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        const ni = ny * W + nx;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H && mask[ni] && !cutMask[ni] && !visited[ni]) {
          visited[ni] = 1;
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
  // 描边画在部件外侧的透明间隙里，而不是部件内部边缘，避免窄间隙视觉粘连
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

// 重新分析连通域（切割后调用）：不重新加载图片，只重算 components
function reanalyzeComponents() {
  if (!templatePrep) return;
  const { W, H, mask, edge } = templatePrep;
  const visited = new Uint8Array(W * H);
  const components = [];
  let cid = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const idx = y * W + x;
    if (!mask[idx] || cutMask[idx] || visited[idx]) continue;
    const q = [[x, y]];
    visited[idx] = 1;
    const cmask = new Uint8Array(W * H);
    let minX = x, maxX = x, minY = y, maxY = y, cnt = 0;
    while (q.length) {
      const [cx, cy] = q.pop();
      const ci = cy * W + cx;
      cmask[ci] = 1;
      cnt++;
      if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        const ni = ny * W + nx;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H && mask[ni] && !cutMask[ni] && !visited[ni]) {
          visited[ni] = 1;
          q.push([nx, ny]);
        }
      }
    }
    components.push({ id: cid++, mask: cmask, bbox: { minX, minY, maxX, maxY }, area: cnt });
  }
  components.sort((a, b) => b.area - a.area);
  components.forEach((c, i) => c.id = i);

  // 间隙外缘描边（与 prepareTemplate 一致）
  for (const c of components) {
    const edgePixels = [];
    const cm = c.mask;
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        if (!cm[i] && (cm[i - 1] || cm[i + 1] || cm[i - W] || cm[i + W])) {
          edgePixels.push(i);
        }
      }
    }
    c.edgePixels = edgePixels;
  }

  templatePrep.components = components;
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
  const p = getCanvasPos(e);
  activePointers.set(e.pointerId, p);
  try { previewCanvas.setPointerCapture(e.pointerId); } catch (_) {}

  // 切割模式：开始画切割线（最高优先级）
  if (cutMode) {
    cutting = true;
    cutLastPos = p;
    // 保存切割前的快照，用于回退
    if (cutMask) cutHistory.push(new Uint8Array(cutMask));
    e.preventDefault();
    return;
  }

  const region = getActiveRegion();
  if (!region) return;

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
  const p = getCanvasPos(e);
  if (activePointers.has(e.pointerId)) activePointers.set(e.pointerId, p);

  // 切割模式：沿路径标记切割线
  if (cutMode && cutting && cutLastPos) {
    markCutLine(cutLastPos, p);
    cutLastPos = p;
    renderPreview();
    return;
  }

  const region = getActiveRegion();
  if (!region || !region.image || region.fixed) return;

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

  // 切割结束：重新分析连通域
  if (cutMode && cutting) {
    cutting = false;
    cutLastPos = null;
    reanalyzeComponents();
    renderPreview();
    renderTabs();
    setStatus('切割完成，已重新划分部件');
    return;
  }

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

// 沿两点连线（Bresenham）标记切割线经过的膜片像素
function markCutLine(p1, p2) {
  if (!templatePrep || !cutMask) return;
  const W = templatePrep.W, H = templatePrep.H;
  let x0 = Math.round(p1.x), y0 = Math.round(p1.y);
  let x1 = Math.round(p2.x), y1 = Math.round(p2.y);
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  for (let n = 0; n < 100000; n++) {
    if (x0 >= 0 && x0 < W && y0 >= 0 && y0 < H) {
      const i = y0 * W + x0;
      if (templatePrep.mask[i]) cutMask[i] = 1;
    }
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}

// 切割模式切换按钮
cutModeBtn.addEventListener('click', () => {
  cutMode = !cutMode;
  cutModeBtn.textContent = cutMode ? '退出切割' : '切割模式';
  cutModeBtn.classList.toggle('danger', cutMode);
  previewCanvas.style.cursor = cutMode ? 'crosshair' : 'pointer';
  setStatus(cutMode ? '切割模式：在预览图上画线切开连成一片的区域' : '已退出切割模式');
});

// 回退上一步切割
undoCutBtn.addEventListener('click', () => {
  if (cutHistory.length === 0) {
    setStatus('没有可回退的切割操作', true);
    return;
  }
  cutMask = cutHistory.pop();
  reanalyzeComponents();
  renderPreview();
  renderTabs();
  setStatus('已回退上一步切割');
});

// ---------- 导出 / 导入切割模板（永久复用）----------
// 导出：把切割结果 + 模板指纹 保存为 JSON 文件
// cutMask 存为稀疏索引数组（只记录被切割的像素），体积远小于全量 Uint8Array
function getTemplateFingerprint() {
  // 模板指纹：用像素数 + 非零 alpha 数量 作为轻量校验，导入时验证是否匹配
  if (!templatePrep) return null;
  const { W, H, mask } = templatePrep;
  let alpha = 0;
  for (let i = 0; i < W * H; i++) if (mask[i]) alpha++;
  return { W, H, alpha };
}

exportCutBtn.addEventListener('click', () => {
  if (!templatePrep) { setStatus('请先加载模板', true); return; }
  // 收集所有被切割的像素索引
  const indices = [];
  for (let i = 0; i < cutMask.length; i++) if (cutMask[i]) indices.push(i);
  const payload = {
    type: 'tesla-wrap-cut-template',
    version: 1,
    template: currentTemplateUrl,
    fingerprint: getTemplateFingerprint(),
    cutCount: indices.length,
    cutIndices: indices,
    savedAt: new Date().toISOString(),
  };
  const json = JSON.stringify(payload);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const name = '切割模板_' + (new Date().toISOString().slice(0, 10).replace(/-/g, '')) + '.json';
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
  setStatus('已导出切割模板（' + indices.length + ' 个切割像素）');
});

importCutBtn.addEventListener('click', () => importCutInput.click());

importCutInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      if (payload.type !== 'tesla-wrap-cut-template') {
        setStatus('不是有效的切割模板文件', true); return;
      }
      if (!templatePrep || !cutMask) {
        setStatus('请先加载与模板对应的车型', true); return;
      }
      // 校验尺寸匹配
      const fp = payload.fingerprint;
      if (!fp || fp.W !== templatePrep.W || fp.H !== templatePrep.H) {
        setStatus('模板尺寸不匹配，请先切换到对应的车型模板', true); return;
      }
      // 重建 cutMask
      const newMask = new Uint8Array(templatePrep.W * templatePrep.H);
      for (const idx of payload.cutIndices) {
        if (idx >= 0 && idx < newMask.length) newMask[idx] = 1;
      }
      cutMask = newMask;
      cutHistory = []; // 清空旧切割历史
      reanalyzeComponents();
      renderPreview();
      renderTabs();
      setStatus('已导入切割模板（' + payload.cutIndices.length + ' 个切割像素），可直接点选部件');
    } catch (err) {
      setStatus('导入失败：文件解析错误', true);
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // 允许重复导入同一文件
});

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
        if (c.mask[i] && !cutMask[i]) { // 切割线像素不填充，显示为透明缝
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
        if (c.mask[i] && !cutMask[i]) { // 切割线像素不填充
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
  cutMask = null; // 清空切割线
  cutHistory = []; // 清空切割历史
  cutMode = false;
  cutting = false;
  cutLastPos = null;
  cutModeBtn.textContent = '切割模式';
  cutModeBtn.classList.remove('danger');
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
