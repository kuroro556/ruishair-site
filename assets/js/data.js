/* ============================================================
   RUIS HAIR — 站点数据（源自参考站真实产品与公司信息）
   本地持久化：产品 / 询盘 / 管理员账号 均存于浏览器 localStorage
   ============================================================ */

const IMG = 'assets/img/';

// 尺寸（英寸），固定 7 档，每档价格独立
const SIZES = [16, 18, 20, 22, 24, 26, 28];
const SIZE_LABELS = { 16: '16"', 18: '18"', 20: '20"', 22: '22"', 24: '24"', 26: '26"', 28: '28"' };

// 生成某颜色 7 档尺寸的默认价格（base 为 16 寸价，每 +2 寸 +inc）
function genPrices(base, inc) {
  inc = inc || 2;
  var o = {};
  SIZES.forEach(function(s, i) { o[s] = +(base + i * inc).toFixed(2); });
  return o;
}

// ============================================================
// 真实价格表（每 100 克 / 100g，美元）
// 每个品类含深色（dark）与浅色（light）两列基础价，对应 16"~28" 共 7 档
// 颜色类别加价规则（在深/浅基础价上叠加）：
//   深色间色（P2-6、ESPRESSO）       → 深色基础 + 6
//   浅色间色（P4-27 等 7 个）        → 浅色基础 + 6
//   T 色（T2-60A 等 3 个）           → 浅色基础 + 6
//   混色（M18-22、M18-60）           → 浅色基础 + 6
//   B 色（DC 及 B 开头 10 个）       → 浅色基础 + 10
//   深色（#1 #1B #1C #2 #4 #4A #5 #6 #8）
//   浅色（其余全部 # 号色）
// 最终售价统一在「基础价 + 类别加价」之上再 + 20 美金（EXTRA_FEE）
// ============================================================
const EXTRA_FEE = 20; // 每 100 克最终额外加价（美金）

// 各品类深/浅色 7 档基础价表（16"~28"，来自供应商价格表）
const CATEGORY_PRICE_TABLE = {
  "genius-weft": {
    dark:  { 16: 96, 18: 115, 20: 135, 22: 159, 24: 179, 26: 201, 28: 221 },
    light: { 16: 116, 18: 135, 20: 160, 22: 176, 24: 198, 26: 216, 28: 239 }
  },
  "invisible-tape": {
    dark:  { 16: 110, 18: 130, 20: 149, 22: 172, 24: 194, 26: 213, 28: 235 },
    light: { 16: 129, 18: 148, 20: 174, 22: 187, 24: 211, 26: 230, 28: 253 }
  },
  "machine-weft": {
    dark:  { 16: 84, 18: 106, 20: 125, 22: 149, 24: 169, 26: 191, 28: 211 },
    light: { 16: 95, 18: 120, 20: 142, 22: 166, 24: 186, 26: 206, 28: 229 }
  },
  "butterfly-weft": {
    dark:  { 16: 102, 18: 121, 20: 141, 22: 165, 24: 185, 26: 207, 28: 227 },
    light: { 16: 121, 18: 141, 20: 166, 22: 182, 24: 204, 26: 222, 28: 245 }
  },
  "i-tips": {
    dark:  { 16: 89, 18: 111, 20: 131, 22: 155, 24: 175, 26: 197, 28: 217 },
    light: { 16: 103, 18: 125, 20: 148, 22: 172, 24: 192, 26: 212, 28: 235 }
  },
  "nano-ring": {
    dark:  { 16: 89, 18: 111, 20: 131, 22: 155, 24: 175, 26: 197, 28: 217 },
    light: { 16: 103, 18: 125, 20: 148, 22: 172, 24: 192, 26: 212, 28: 235 }
  },
  "flat-tip": {
    dark:  { 16: 89, 18: 111, 20: 131, 22: 155, 24: 175, 26: 197, 28: 217 },
    light: { 16: 103, 18: 125, 20: 148, 22: 172, 24: 192, 26: 212, 28: 235 }
  },
  "tape-ins": {
    dark:  { 16: 89, 18: 111, 20: 131, 22: 155, 24: 175, 26: 197, 28: 217 },
    light: { 16: 103, 18: 125, 20: 148, 22: 172, 24: 192, 26: 212, 28: 235 }
  },
  "volume-genius-weft": {
    dark:  { 16: 101, 18: 120, 20: 140, 22: 164, 24: 184, 26: 206, 28: 226 },
    light: { 16: 121, 18: 140, 20: 165, 22: 181, 24: 203, 26: 221, 28: 244 }
  }
};

// 深色基础色（9 个，其余 # 号色均为浅色）
const DARK_COLORS = ['#1', '#1B', '#1C', '#2', '#4', '#4A', '#5', '#6', '#8'];
// 深色间色：深色基础 + 6
const DARK_INTER_COLORS = ['P2-6', 'ESPRESSO'];
// 浅色间色：浅色基础 + 6
const LIGHT_INTER_COLORS = ['P4-27', 'P2-18', 'P8-60', 'P9-60A', 'P18-60A', 'P27-60', 'P16A-60A'];
// T 色：浅色基础 + 6
const T_COLORS = ['T2-60A', 'T4-60', 'T9-60'];
// 混色：浅色基础 + 6
const MIX_COLORS = ['M18-22', 'M18-60'];
// B 色：浅色基础 + 10（含 DC）
const B_COLORS = ['B2-4-27', 'DC', 'B4-6', 'B2-60A', 'B2-18', 'B4-8-60', 'B8-60', 'B9-60A', 'B18-60A', 'B6-27'];

// 判断颜色类别：返回 { base:'dark'|'light', add: 加价金额 }
function classifyColor(name) {
  name = String(name == null ? '' : name).trim();
  if (DARK_INTER_COLORS.indexOf(name) >= 0) return { base: 'dark', add: 6 };
  if (B_COLORS.indexOf(name) >= 0) return { base: 'light', add: 10 };
  if (LIGHT_INTER_COLORS.indexOf(name) >= 0 || T_COLORS.indexOf(name) >= 0 || MIX_COLORS.indexOf(name) >= 0) return { base: 'light', add: 6 };
  if (DARK_COLORS.indexOf(name) >= 0) return { base: 'dark', add: 0 };
  return { base: 'light', add: 0 }; // 其余全部按浅色
}

// 计算某品类某颜色 7 档尺寸的最终售价（基础价 + 类别加价 + 统一 +20）
function calcColorPrices(categoryId, colorName) {
  const table = CATEGORY_PRICE_TABLE[categoryId];
  const cls = classifyColor(colorName);
  const baseCol = cls.base; // 'dark' | 'light'
  const add = cls.add;
  const o = {};
  SIZES.forEach(function(s, i) {
    if (table && table[baseCol] && table[baseCol][s] != null) {
      o[s] = +(table[baseCol][s] + add + EXTRA_FEE).toFixed(2);
    } else {
      o[s] = 0;
    }
  });
  return o;
}

// 品类（9 个，后台可增删）。每个品类含：
//   name/sub 显示名，cover 封面图，desc 描述，
//   details 细节图数组，colors 颜色数组[{name, img, prices:{16,18,20,22,24,26,28}}]
const DEFAULT_CATEGORIES = [
  {
    id: "genius-weft",
    name: "Genius Weft",
    sub: "Invisible & thin",
    base: 28.5,
    inc: 2,
    desc: "Premium 100% virgin Remy human hair. Available in 40+ colors and 7 lengths (16\"~28\"). Factory price with low MOQ.",
    cover: "assets/img/categories/genius-weft/colors/c01.jpg",
    details: ["assets/img/categories/genius-weft/details/d01.jpg", "assets/img/categories/genius-weft/details/d02.jpg", "assets/img/categories/genius-weft/details/d03.jpg", "assets/img/categories/genius-weft/details/d04.jpg", "assets/img/categories/genius-weft/details/d05.jpg"],
    colors: [
      { name: "#1", img: "assets/img/categories/genius-weft/colors/c01.jpg", prices: calcColorPrices("genius-weft", "#1") },
      { name: "#1B", img: "assets/img/categories/genius-weft/colors/c04.jpg", prices: calcColorPrices("genius-weft", "#1B") },
      { name: "#1C", img: "assets/img/categories/genius-weft/colors/c05.jpg", prices: calcColorPrices("genius-weft", "#1C") },
      { name: "#2", img: "assets/img/categories/genius-weft/colors/c06.jpg", prices: calcColorPrices("genius-weft", "#2") },
      { name: "#4", img: "assets/img/categories/genius-weft/colors/c14.jpg", prices: calcColorPrices("genius-weft", "#4") },
      { name: "#4A", img: "assets/img/categories/genius-weft/colors/c15.jpg", prices: calcColorPrices("genius-weft", "#4A") },
      { name: "#5", img: "assets/img/categories/genius-weft/colors/c16.jpg", prices: calcColorPrices("genius-weft", "#5") },
      { name: "#6", img: "assets/img/categories/genius-weft/colors/c17.jpg", prices: calcColorPrices("genius-weft", "#6") },
      { name: "#8", img: "assets/img/categories/genius-weft/colors/c21.jpg", prices: calcColorPrices("genius-weft", "#8") },
      { name: "#9", img: "assets/img/categories/genius-weft/colors/c22.jpg", prices: calcColorPrices("genius-weft", "#9") },
      { name: "#16A", img: "assets/img/categories/genius-weft/colors/c02.jpg", prices: calcColorPrices("genius-weft", "#16A") },
      { name: "#18", img: "assets/img/categories/genius-weft/colors/c03.jpg", prices: calcColorPrices("genius-weft", "#18") },
      { name: "#24", img: "assets/img/categories/genius-weft/colors/c07.jpg", prices: calcColorPrices("genius-weft", "#24") },
      { name: "#27", img: "assets/img/categories/genius-weft/colors/c08.jpg", prices: calcColorPrices("genius-weft", "#27") },
      { name: "#30", img: "assets/img/categories/genius-weft/colors/c09.jpg", prices: calcColorPrices("genius-weft", "#30") },
      { name: "#33", img: "assets/img/categories/genius-weft/colors/c11.jpg", prices: calcColorPrices("genius-weft", "#33") },
      { name: "#33.1", img: "assets/img/categories/genius-weft/colors/c10.jpg", prices: calcColorPrices("genius-weft", "#33.1") },
      { name: "#34", img: "assets/img/categories/genius-weft/colors/c13.jpg", prices: calcColorPrices("genius-weft", "#34") },
      { name: "#34.1", img: "assets/img/categories/genius-weft/colors/c12.jpg", prices: calcColorPrices("genius-weft", "#34.1") },
      { name: "#60", img: "assets/img/categories/genius-weft/colors/c18.jpg", prices: calcColorPrices("genius-weft", "#60") },
      { name: "#60A", img: "assets/img/categories/genius-weft/colors/c19.jpg", prices: calcColorPrices("genius-weft", "#60A") },
      { name: "#99J", img: "assets/img/categories/genius-weft/colors/c24.jpg", prices: calcColorPrices("genius-weft", "#99J") },
      { name: "#99J.1", img: "assets/img/categories/genius-weft/colors/c23.jpg", prices: calcColorPrices("genius-weft", "#99J.1") },
      { name: "#613", img: "assets/img/categories/genius-weft/colors/c20.jpg", prices: calcColorPrices("genius-weft", "#613") },
      { name: "M18-22", img: "assets/img/categories/genius-weft/colors/c37.jpg", prices: calcColorPrices("genius-weft", "M18-22") },
      { name: "M18-60", img: "assets/img/categories/genius-weft/colors/c38.jpg", prices: calcColorPrices("genius-weft", "M18-60") },
      { name: "T2-60A", img: "assets/img/categories/genius-weft/colors/c46.jpg", prices: calcColorPrices("genius-weft", "T2-60A") },
      { name: "T4-60", img: "assets/img/categories/genius-weft/colors/c47.jpg", prices: calcColorPrices("genius-weft", "T4-60") },
      { name: "T9-60", img: "assets/img/categories/genius-weft/colors/c48.jpg", prices: calcColorPrices("genius-weft", "T9-60") },
      { name: "ESPRESSO", img: "assets/img/categories/genius-weft/colors/c25.jpg", prices: calcColorPrices("genius-weft", "ESPRESSO") },
      { name: "P2-18", img: "assets/img/categories/genius-weft/colors/c40.jpg", prices: calcColorPrices("genius-weft", "P2-18") },
      { name: "P2-6", img: "assets/img/categories/genius-weft/colors/c41.jpg", prices: calcColorPrices("genius-weft", "P2-6") },
      { name: "P4-27", img: "assets/img/categories/genius-weft/colors/c43.jpg", prices: calcColorPrices("genius-weft", "P4-27") },
      { name: "P8-60", img: "assets/img/categories/genius-weft/colors/c44.jpg", prices: calcColorPrices("genius-weft", "P8-60") },
      { name: "P9-60A", img: "assets/img/categories/genius-weft/colors/c45.jpg", prices: calcColorPrices("genius-weft", "P9-60A") },
      { name: "P16A-60A", img: "assets/img/categories/genius-weft/colors/c26.jpg", prices: calcColorPrices("genius-weft", "P16A-60A") },
      { name: "P18-60A", img: "assets/img/categories/genius-weft/colors/c39.jpg", prices: calcColorPrices("genius-weft", "P18-60A") },
      { name: "P27-60", img: "assets/img/categories/genius-weft/colors/c42.jpg", prices: calcColorPrices("genius-weft", "P27-60") },
      { name: "DC", img: "assets/img/categories/genius-weft/colors/c36.jpg", prices: calcColorPrices("genius-weft", "DC") },
      { name: "B2-18", img: "assets/img/categories/genius-weft/colors/c28.jpg", prices: calcColorPrices("genius-weft", "B2-18") },
      { name: "B2-4-27", img: "assets/img/categories/genius-weft/colors/c29.jpg", prices: calcColorPrices("genius-weft", "B2-4-27") },
      { name: "B2-60A", img: "assets/img/categories/genius-weft/colors/c30.jpg", prices: calcColorPrices("genius-weft", "B2-60A") },
      { name: "B4-6", img: "assets/img/categories/genius-weft/colors/c31.jpg", prices: calcColorPrices("genius-weft", "B4-6") },
      { name: "B4-8-60", img: "assets/img/categories/genius-weft/colors/c32.jpg", prices: calcColorPrices("genius-weft", "B4-8-60") },
      { name: "B6-27", img: "assets/img/categories/genius-weft/colors/c33.jpg", prices: calcColorPrices("genius-weft", "B6-27") },
      { name: "B8-60", img: "assets/img/categories/genius-weft/colors/c34.jpg", prices: calcColorPrices("genius-weft", "B8-60") },
      { name: "B9-60A", img: "assets/img/categories/genius-weft/colors/c35.jpg", prices: calcColorPrices("genius-weft", "B9-60A") },
      { name: "B18-60A", img: "assets/img/categories/genius-weft/colors/c27.jpg", prices: calcColorPrices("genius-weft", "B18-60A") },
    ]
  },
  {
    id: "machine-weft",
    name: "Machine Weft",
    sub: "Classic & durable",
    base: 22,
    inc: 2,
    desc: "Premium 100% virgin Remy human hair. Available in 40+ colors and 7 lengths (16\"~28\"). Factory price with low MOQ.",
    cover: "assets/img/categories/machine-weft/colors/c01.jpg",
    details: ["assets/img/categories/machine-weft/details/d01.jpg", "assets/img/categories/machine-weft/details/d02.jpg", "assets/img/categories/machine-weft/details/d03.jpg", "assets/img/categories/machine-weft/details/d04.jpg", "assets/img/categories/machine-weft/details/d05.jpg", "assets/img/categories/machine-weft/details/d06.jpg"],
    colors: [
      { name: "#1", img: "assets/img/categories/machine-weft/colors/c01.jpg", prices: calcColorPrices("machine-weft", "#1") },
      { name: "#1B", img: "assets/img/categories/machine-weft/colors/c04.jpg", prices: calcColorPrices("machine-weft", "#1B") },
      { name: "#1C", img: "assets/img/categories/machine-weft/colors/c05.jpg", prices: calcColorPrices("machine-weft", "#1C") },
      { name: "#2", img: "assets/img/categories/machine-weft/colors/c06.jpg", prices: calcColorPrices("machine-weft", "#2") },
      { name: "#4", img: "assets/img/categories/machine-weft/colors/c14.jpg", prices: calcColorPrices("machine-weft", "#4") },
      { name: "#4A", img: "assets/img/categories/machine-weft/colors/c15.jpg", prices: calcColorPrices("machine-weft", "#4A") },
      { name: "#5", img: "assets/img/categories/machine-weft/colors/c16.jpg", prices: calcColorPrices("machine-weft", "#5") },
      { name: "#6", img: "assets/img/categories/machine-weft/colors/c17.jpg", prices: calcColorPrices("machine-weft", "#6") },
      { name: "#8", img: "assets/img/categories/machine-weft/colors/c21.jpg", prices: calcColorPrices("machine-weft", "#8") },
      { name: "#9", img: "assets/img/categories/machine-weft/colors/c22.jpg", prices: calcColorPrices("machine-weft", "#9") },
      { name: "#16A", img: "assets/img/categories/machine-weft/colors/c02.jpg", prices: calcColorPrices("machine-weft", "#16A") },
      { name: "#18", img: "assets/img/categories/machine-weft/colors/c03.jpg", prices: calcColorPrices("machine-weft", "#18") },
      { name: "#24", img: "assets/img/categories/machine-weft/colors/c07.jpg", prices: calcColorPrices("machine-weft", "#24") },
      { name: "#27", img: "assets/img/categories/machine-weft/colors/c08.jpg", prices: calcColorPrices("machine-weft", "#27") },
      { name: "#30", img: "assets/img/categories/machine-weft/colors/c10.jpg", prices: calcColorPrices("machine-weft", "#30") },
      { name: "#30.1", img: "assets/img/categories/machine-weft/colors/c09.jpg", prices: calcColorPrices("machine-weft", "#30.1") },
      { name: "#33", img: "assets/img/categories/machine-weft/colors/c12.jpg", prices: calcColorPrices("machine-weft", "#33") },
      { name: "#33.1", img: "assets/img/categories/machine-weft/colors/c11.jpg", prices: calcColorPrices("machine-weft", "#33.1") },
      { name: "#34", img: "assets/img/categories/machine-weft/colors/c13.jpg", prices: calcColorPrices("machine-weft", "#34") },
      { name: "#60", img: "assets/img/categories/machine-weft/colors/c18.jpg", prices: calcColorPrices("machine-weft", "#60") },
      { name: "#60A", img: "assets/img/categories/machine-weft/colors/c19.jpg", prices: calcColorPrices("machine-weft", "#60A") },
      { name: "#99J", img: "assets/img/categories/machine-weft/colors/c23.jpg", prices: calcColorPrices("machine-weft", "#99J") },
      { name: "#613", img: "assets/img/categories/machine-weft/colors/c20.jpg", prices: calcColorPrices("machine-weft", "#613") },
      { name: "M18-22", img: "assets/img/categories/machine-weft/colors/c24.jpg", prices: calcColorPrices("machine-weft", "M18-22") },
      { name: "M18-60", img: "assets/img/categories/machine-weft/colors/c25.jpg", prices: calcColorPrices("machine-weft", "M18-60") },
      { name: "T4-60", img: "assets/img/categories/machine-weft/colors/c33.jpg", prices: calcColorPrices("machine-weft", "T4-60") },
      { name: "T9-60", img: "assets/img/categories/machine-weft/colors/c34.jpg", prices: calcColorPrices("machine-weft", "T9-60") },
      { name: "P2-18", img: "assets/img/categories/machine-weft/colors/c27.jpg", prices: calcColorPrices("machine-weft", "P2-18") },
      { name: "P2-6", img: "assets/img/categories/machine-weft/colors/c28.jpg", prices: calcColorPrices("machine-weft", "P2-6") },
      { name: "P4-27", img: "assets/img/categories/machine-weft/colors/c30.jpg", prices: calcColorPrices("machine-weft", "P4-27") },
      { name: "P8-60", img: "assets/img/categories/machine-weft/colors/c31.jpg", prices: calcColorPrices("machine-weft", "P8-60") },
      { name: "P9-60A", img: "assets/img/categories/machine-weft/colors/c32.jpg", prices: calcColorPrices("machine-weft", "P9-60A") },
      { name: "P18-60A", img: "assets/img/categories/machine-weft/colors/c26.jpg", prices: calcColorPrices("machine-weft", "P18-60A") },
      { name: "P27-60", img: "assets/img/categories/machine-weft/colors/c29.jpg", prices: calcColorPrices("machine-weft", "P27-60") },
      { name: "DC", img: "assets/img/categories/machine-weft/colors/c42.jpg", prices: calcColorPrices("machine-weft", "DC") },
      { name: "B2-18", img: "assets/img/categories/machine-weft/colors/c36.jpg", prices: calcColorPrices("machine-weft", "B2-18") },
      { name: "B2-4-27", img: "assets/img/categories/machine-weft/colors/c37.jpg", prices: calcColorPrices("machine-weft", "B2-4-27") },
      { name: "B4-6", img: "assets/img/categories/machine-weft/colors/c38.jpg", prices: calcColorPrices("machine-weft", "B4-6") },
      { name: "B4-8-60", img: "assets/img/categories/machine-weft/colors/c39.jpg", prices: calcColorPrices("machine-weft", "B4-8-60") },
      { name: "B8-60", img: "assets/img/categories/machine-weft/colors/c40.jpg", prices: calcColorPrices("machine-weft", "B8-60") },
      { name: "B9-60A", img: "assets/img/categories/machine-weft/colors/c41.jpg", prices: calcColorPrices("machine-weft", "B9-60A") },
      { name: "B18-60A", img: "assets/img/categories/machine-weft/colors/c35.jpg", prices: calcColorPrices("machine-weft", "B18-60A") },
    ]
  },
  {
    id: "butterfly-weft",
    name: "Butterfly Weft",
    sub: "Flat & flexible",
    base: 30,
    inc: 2,
    desc: "Premium 100% virgin Remy human hair. Available in 40+ colors and 7 lengths (16\"~28\"). Factory price with low MOQ.",
    cover: "assets/img/categories/butterfly-weft/colors/c01.jpg",
    details: ["assets/img/categories/butterfly-weft/details/d01.jpg", "assets/img/categories/butterfly-weft/details/d02.jpg", "assets/img/categories/butterfly-weft/details/d03.jpg", "assets/img/categories/butterfly-weft/details/d04.jpg", "assets/img/categories/butterfly-weft/details/d05.jpg", "assets/img/categories/butterfly-weft/details/d06.jpg", "assets/img/categories/butterfly-weft/details/d07.jpg", "assets/img/categories/butterfly-weft/details/d08.jpg", "assets/img/categories/butterfly-weft/details/d09.jpg", "assets/img/categories/butterfly-weft/details/d10.jpg"],
    colors: [
      { name: "#1", img: "assets/img/categories/butterfly-weft/colors/c01.jpg", prices: calcColorPrices("butterfly-weft", "#1") },
      { name: "#1B", img: "assets/img/categories/butterfly-weft/colors/c04.jpg", prices: calcColorPrices("butterfly-weft", "#1B") },
      { name: "#1C", img: "assets/img/categories/butterfly-weft/colors/c05.jpg", prices: calcColorPrices("butterfly-weft", "#1C") },
      { name: "#2", img: "assets/img/categories/butterfly-weft/colors/c06.jpg", prices: calcColorPrices("butterfly-weft", "#2") },
      { name: "#4", img: "assets/img/categories/butterfly-weft/colors/c15.jpg", prices: calcColorPrices("butterfly-weft", "#4") },
      { name: "#4A", img: "assets/img/categories/butterfly-weft/colors/c16.jpg", prices: calcColorPrices("butterfly-weft", "#4A") },
      { name: "#5", img: "assets/img/categories/butterfly-weft/colors/c17.jpg", prices: calcColorPrices("butterfly-weft", "#5") },
      { name: "#6", img: "assets/img/categories/butterfly-weft/colors/c18.jpg", prices: calcColorPrices("butterfly-weft", "#6") },
      { name: "#8", img: "assets/img/categories/butterfly-weft/colors/c22.jpg", prices: calcColorPrices("butterfly-weft", "#8") },
      { name: "#9", img: "assets/img/categories/butterfly-weft/colors/c23.jpg", prices: calcColorPrices("butterfly-weft", "#9") },
      { name: "#16A", img: "assets/img/categories/butterfly-weft/colors/c02.jpg", prices: calcColorPrices("butterfly-weft", "#16A") },
      { name: "#18", img: "assets/img/categories/butterfly-weft/colors/c03.jpg", prices: calcColorPrices("butterfly-weft", "#18") },
      { name: "#24", img: "assets/img/categories/butterfly-weft/colors/c07.jpg", prices: calcColorPrices("butterfly-weft", "#24") },
      { name: "#27", img: "assets/img/categories/butterfly-weft/colors/c08.jpg", prices: calcColorPrices("butterfly-weft", "#27") },
      { name: "#30", img: "assets/img/categories/butterfly-weft/colors/c10.jpg", prices: calcColorPrices("butterfly-weft", "#30") },
      { name: "#30.1", img: "assets/img/categories/butterfly-weft/colors/c09.jpg", prices: calcColorPrices("butterfly-weft", "#30.1") },
      { name: "#33", img: "assets/img/categories/butterfly-weft/colors/c12.jpg", prices: calcColorPrices("butterfly-weft", "#33") },
      { name: "#33.1", img: "assets/img/categories/butterfly-weft/colors/c11.jpg", prices: calcColorPrices("butterfly-weft", "#33.1") },
      { name: "#34", img: "assets/img/categories/butterfly-weft/colors/c14.jpg", prices: calcColorPrices("butterfly-weft", "#34") },
      { name: "#34.1", img: "assets/img/categories/butterfly-weft/colors/c13.jpg", prices: calcColorPrices("butterfly-weft", "#34.1") },
      { name: "#60", img: "assets/img/categories/butterfly-weft/colors/c19.jpg", prices: calcColorPrices("butterfly-weft", "#60") },
      { name: "#60A", img: "assets/img/categories/butterfly-weft/colors/c20.jpg", prices: calcColorPrices("butterfly-weft", "#60A") },
      { name: "#99J", img: "assets/img/categories/butterfly-weft/colors/c25.jpg", prices: calcColorPrices("butterfly-weft", "#99J") },
      { name: "#99J.1", img: "assets/img/categories/butterfly-weft/colors/c24.jpg", prices: calcColorPrices("butterfly-weft", "#99J.1") },
      { name: "#613", img: "assets/img/categories/butterfly-weft/colors/c21.jpg", prices: calcColorPrices("butterfly-weft", "#613") },
      { name: "M18-22", img: "assets/img/categories/butterfly-weft/colors/c34.jpg", prices: calcColorPrices("butterfly-weft", "M18-22") },
      { name: "M18-60", img: "assets/img/categories/butterfly-weft/colors/c35.jpg", prices: calcColorPrices("butterfly-weft", "M18-60") },
      { name: "T4-60", img: "assets/img/categories/butterfly-weft/colors/c43.jpg", prices: calcColorPrices("butterfly-weft", "T4-60") },
      { name: "T9-60", img: "assets/img/categories/butterfly-weft/colors/c44.jpg", prices: calcColorPrices("butterfly-weft", "T9-60") },
      { name: "P2-18", img: "assets/img/categories/butterfly-weft/colors/c37.jpg", prices: calcColorPrices("butterfly-weft", "P2-18") },
      { name: "P2-6", img: "assets/img/categories/butterfly-weft/colors/c38.jpg", prices: calcColorPrices("butterfly-weft", "P2-6") },
      { name: "P4-27", img: "assets/img/categories/butterfly-weft/colors/c40.jpg", prices: calcColorPrices("butterfly-weft", "P4-27") },
      { name: "P8-60", img: "assets/img/categories/butterfly-weft/colors/c41.jpg", prices: calcColorPrices("butterfly-weft", "P8-60") },
      { name: "P9-60A", img: "assets/img/categories/butterfly-weft/colors/c42.jpg", prices: calcColorPrices("butterfly-weft", "P9-60A") },
      { name: "P18-60A", img: "assets/img/categories/butterfly-weft/colors/c36.jpg", prices: calcColorPrices("butterfly-weft", "P18-60A") },
      { name: "P27-60", img: "assets/img/categories/butterfly-weft/colors/c39.jpg", prices: calcColorPrices("butterfly-weft", "P27-60") },
      { name: "DC", img: "assets/img/categories/butterfly-weft/colors/c33.jpg", prices: calcColorPrices("butterfly-weft", "DC") },
      { name: "B2-18", img: "assets/img/categories/butterfly-weft/colors/c27.jpg", prices: calcColorPrices("butterfly-weft", "B2-18") },
      { name: "B2-4-27", img: "assets/img/categories/butterfly-weft/colors/c28.jpg", prices: calcColorPrices("butterfly-weft", "B2-4-27") },
      { name: "B4-6", img: "assets/img/categories/butterfly-weft/colors/c29.jpg", prices: calcColorPrices("butterfly-weft", "B4-6") },
      { name: "B4-8-60", img: "assets/img/categories/butterfly-weft/colors/c30.jpg", prices: calcColorPrices("butterfly-weft", "B4-8-60") },
      { name: "B8-60", img: "assets/img/categories/butterfly-weft/colors/c31.jpg", prices: calcColorPrices("butterfly-weft", "B8-60") },
      { name: "B9-60A", img: "assets/img/categories/butterfly-weft/colors/c32.jpg", prices: calcColorPrices("butterfly-weft", "B9-60A") },
      { name: "B18-60A", img: "assets/img/categories/butterfly-weft/colors/c26.jpg", prices: calcColorPrices("butterfly-weft", "B18-60A") },
    ]
  },
  {
    id: "flat-tip",
    name: "Flat Tip",
    sub: "Slim & flexible tip",
    base: 32,
    inc: 2,
    desc: "Premium 100% virgin Remy human hair. Available in 40+ colors and 7 lengths (16\"~28\"). Factory price with low MOQ.",
    cover: "assets/img/categories/flat-tip/colors/c01.jpg",
    details: ["assets/img/categories/flat-tip/details/d01.jpg", "assets/img/categories/flat-tip/details/d02.jpg", "assets/img/categories/flat-tip/details/d03.jpg", "assets/img/categories/flat-tip/details/d04.jpg", "assets/img/categories/flat-tip/details/d05.jpg"],
    colors: [
      { name: "#1", img: "assets/img/categories/flat-tip/colors/c01.jpg", prices: calcColorPrices("flat-tip", "#1") },
      { name: "#1B", img: "assets/img/categories/flat-tip/colors/c04.jpg", prices: calcColorPrices("flat-tip", "#1B") },
      { name: "#1C", img: "assets/img/categories/flat-tip/colors/c05.jpg", prices: calcColorPrices("flat-tip", "#1C") },
      { name: "#2", img: "assets/img/categories/flat-tip/colors/c06.jpg", prices: calcColorPrices("flat-tip", "#2") },
      { name: "#4", img: "assets/img/categories/flat-tip/colors/c15.jpg", prices: calcColorPrices("flat-tip", "#4") },
      { name: "#4A", img: "assets/img/categories/flat-tip/colors/c16.jpg", prices: calcColorPrices("flat-tip", "#4A") },
      { name: "#5", img: "assets/img/categories/flat-tip/colors/c17.jpg", prices: calcColorPrices("flat-tip", "#5") },
      { name: "#6", img: "assets/img/categories/flat-tip/colors/c18.jpg", prices: calcColorPrices("flat-tip", "#6") },
      { name: "#8", img: "assets/img/categories/flat-tip/colors/c22.jpg", prices: calcColorPrices("flat-tip", "#8") },
      { name: "#9", img: "assets/img/categories/flat-tip/colors/c23.jpg", prices: calcColorPrices("flat-tip", "#9") },
      { name: "#16A", img: "assets/img/categories/flat-tip/colors/c02.jpg", prices: calcColorPrices("flat-tip", "#16A") },
      { name: "#18", img: "assets/img/categories/flat-tip/colors/c03.jpg", prices: calcColorPrices("flat-tip", "#18") },
      { name: "#24", img: "assets/img/categories/flat-tip/colors/c07.jpg", prices: calcColorPrices("flat-tip", "#24") },
      { name: "#27", img: "assets/img/categories/flat-tip/colors/c08.jpg", prices: calcColorPrices("flat-tip", "#27") },
      { name: "#30", img: "assets/img/categories/flat-tip/colors/c10.jpg", prices: calcColorPrices("flat-tip", "#30") },
      { name: "#30.1", img: "assets/img/categories/flat-tip/colors/c09.jpg", prices: calcColorPrices("flat-tip", "#30.1") },
      { name: "#33", img: "assets/img/categories/flat-tip/colors/c12.jpg", prices: calcColorPrices("flat-tip", "#33") },
      { name: "#33.1", img: "assets/img/categories/flat-tip/colors/c11.jpg", prices: calcColorPrices("flat-tip", "#33.1") },
      { name: "#34", img: "assets/img/categories/flat-tip/colors/c14.jpg", prices: calcColorPrices("flat-tip", "#34") },
      { name: "#34.1", img: "assets/img/categories/flat-tip/colors/c13.jpg", prices: calcColorPrices("flat-tip", "#34.1") },
      { name: "#60", img: "assets/img/categories/flat-tip/colors/c19.jpg", prices: calcColorPrices("flat-tip", "#60") },
      { name: "#60A", img: "assets/img/categories/flat-tip/colors/c20.jpg", prices: calcColorPrices("flat-tip", "#60A") },
      { name: "#99J", img: "assets/img/categories/flat-tip/colors/c24.jpg", prices: calcColorPrices("flat-tip", "#99J") },
      { name: "#613", img: "assets/img/categories/flat-tip/colors/c21.jpg", prices: calcColorPrices("flat-tip", "#613") },
      { name: "M18-22", img: "assets/img/categories/flat-tip/colors/c32.jpg", prices: calcColorPrices("flat-tip", "M18-22") },
      { name: "M18-60", img: "assets/img/categories/flat-tip/colors/c33.jpg", prices: calcColorPrices("flat-tip", "M18-60") },
      { name: "T2-60A", img: "assets/img/categories/flat-tip/colors/c46.jpg", prices: calcColorPrices("flat-tip", "T2-60A") },
      { name: "T4-60", img: "assets/img/categories/flat-tip/colors/c47.jpg", prices: calcColorPrices("flat-tip", "T4-60") },
      { name: "T9-60", img: "assets/img/categories/flat-tip/colors/c48.jpg", prices: calcColorPrices("flat-tip", "T9-60") },
      { name: "ESPRESSO", img: "assets/img/categories/flat-tip/colors/c31.jpg", prices: calcColorPrices("flat-tip", "ESPRESSO") },
      { name: "P2-18", img: "assets/img/categories/flat-tip/colors/c41.jpg", prices: calcColorPrices("flat-tip", "P2-18") },
      { name: "P2-6", img: "assets/img/categories/flat-tip/colors/c42.jpg", prices: calcColorPrices("flat-tip", "P2-6") },
      { name: "P4-27", img: "assets/img/categories/flat-tip/colors/c36.jpg", prices: calcColorPrices("flat-tip", "P4-27") },
      { name: "P8-60", img: "assets/img/categories/flat-tip/colors/c44.jpg", prices: calcColorPrices("flat-tip", "P8-60") },
      { name: "P9-60A", img: "assets/img/categories/flat-tip/colors/c45.jpg", prices: calcColorPrices("flat-tip", "P9-60A") },
      { name: "P16A-60A", img: "assets/img/categories/flat-tip/colors/c34.jpg", prices: calcColorPrices("flat-tip", "P16A-60A") },
      { name: "P18-60A", img: "assets/img/categories/flat-tip/colors/c35.jpg", prices: calcColorPrices("flat-tip", "P18-60A") },
      { name: "P27-60", img: "assets/img/categories/flat-tip/colors/c43.jpg", prices: calcColorPrices("flat-tip", "P27-60") },
      { name: "DC", img: "assets/img/categories/flat-tip/colors/c30.jpg", prices: calcColorPrices("flat-tip", "DC") },
      { name: "B2-18", img: "assets/img/categories/flat-tip/colors/c39.jpg", prices: calcColorPrices("flat-tip", "B2-18") },
      { name: "B2-4-27", img: "assets/img/categories/flat-tip/colors/c25.jpg", prices: calcColorPrices("flat-tip", "B2-4-27") },
      { name: "B4-6", img: "assets/img/categories/flat-tip/colors/c26.jpg", prices: calcColorPrices("flat-tip", "B4-6") },
      { name: "B4-8-60", img: "assets/img/categories/flat-tip/colors/c27.jpg", prices: calcColorPrices("flat-tip", "B4-8-60") },
      { name: "B6-27", img: "assets/img/categories/flat-tip/colors/c28.jpg", prices: calcColorPrices("flat-tip", "B6-27") },
      { name: "B8-60", img: "assets/img/categories/flat-tip/colors/c40.jpg", prices: calcColorPrices("flat-tip", "B8-60") },
      { name: "B9-60A", img: "assets/img/categories/flat-tip/colors/c29.jpg", prices: calcColorPrices("flat-tip", "B9-60A") },
      { name: "B18-60A", img: "assets/img/categories/flat-tip/colors/c38.jpg", prices: calcColorPrices("flat-tip", "B18-60A") },
      { name: "B-60A", img: "assets/img/categories/flat-tip/colors/c37.jpg", prices: calcColorPrices("flat-tip", "B-60A") },
    ]
  },
  {
    id: "volume-genius-weft",
    name: "Volume Genius Weft",
    sub: "Thick & full",
    base: 34,
    inc: 2,
    desc: "Premium 100% virgin Remy human hair. Available in 40+ colors and 7 lengths (16\"~28\"). Factory price with low MOQ.",
    cover: "assets/img/categories/volume-genius-weft/colors/c01.jpg",
    details: ["assets/img/categories/volume-genius-weft/details/d01.jpg", "assets/img/categories/volume-genius-weft/details/d02.jpg", "assets/img/categories/volume-genius-weft/details/d03.jpg", "assets/img/categories/volume-genius-weft/details/d04.jpg", "assets/img/categories/volume-genius-weft/details/d05.jpg"],
    colors: [
      { name: "#1", img: "assets/img/categories/volume-genius-weft/colors/c01.jpg", prices: calcColorPrices("volume-genius-weft", "#1") },
      { name: "#1B", img: "assets/img/categories/volume-genius-weft/colors/c04.jpg", prices: calcColorPrices("volume-genius-weft", "#1B") },
      { name: "#1C", img: "assets/img/categories/volume-genius-weft/colors/c05.jpg", prices: calcColorPrices("volume-genius-weft", "#1C") },
      { name: "#2", img: "assets/img/categories/volume-genius-weft/colors/c06.jpg", prices: calcColorPrices("volume-genius-weft", "#2") },
      { name: "#4", img: "assets/img/categories/volume-genius-weft/colors/c14.jpg", prices: calcColorPrices("volume-genius-weft", "#4") },
      { name: "#4A", img: "assets/img/categories/volume-genius-weft/colors/c15.jpg", prices: calcColorPrices("volume-genius-weft", "#4A") },
      { name: "#5", img: "assets/img/categories/volume-genius-weft/colors/c16.jpg", prices: calcColorPrices("volume-genius-weft", "#5") },
      { name: "#6", img: "assets/img/categories/volume-genius-weft/colors/c17.jpg", prices: calcColorPrices("volume-genius-weft", "#6") },
      { name: "#8", img: "assets/img/categories/volume-genius-weft/colors/c21.jpg", prices: calcColorPrices("volume-genius-weft", "#8") },
      { name: "#9", img: "assets/img/categories/volume-genius-weft/colors/c22.jpg", prices: calcColorPrices("volume-genius-weft", "#9") },
      { name: "#16A", img: "assets/img/categories/volume-genius-weft/colors/c02.jpg", prices: calcColorPrices("volume-genius-weft", "#16A") },
      { name: "#18", img: "assets/img/categories/volume-genius-weft/colors/c03.jpg", prices: calcColorPrices("volume-genius-weft", "#18") },
      { name: "#24", img: "assets/img/categories/volume-genius-weft/colors/c07.jpg", prices: calcColorPrices("volume-genius-weft", "#24") },
      { name: "#27", img: "assets/img/categories/volume-genius-weft/colors/c08.jpg", prices: calcColorPrices("volume-genius-weft", "#27") },
      { name: "#30", img: "assets/img/categories/volume-genius-weft/colors/c09.jpg", prices: calcColorPrices("volume-genius-weft", "#30") },
      { name: "#33", img: "assets/img/categories/volume-genius-weft/colors/c11.jpg", prices: calcColorPrices("volume-genius-weft", "#33") },
      { name: "#33.1", img: "assets/img/categories/volume-genius-weft/colors/c10.jpg", prices: calcColorPrices("volume-genius-weft", "#33.1") },
      { name: "#34", img: "assets/img/categories/volume-genius-weft/colors/c13.jpg", prices: calcColorPrices("volume-genius-weft", "#34") },
      { name: "#34.1", img: "assets/img/categories/volume-genius-weft/colors/c12.jpg", prices: calcColorPrices("volume-genius-weft", "#34.1") },
      { name: "#60", img: "assets/img/categories/volume-genius-weft/colors/c18.jpg", prices: calcColorPrices("volume-genius-weft", "#60") },
      { name: "#60A", img: "assets/img/categories/volume-genius-weft/colors/c19.jpg", prices: calcColorPrices("volume-genius-weft", "#60A") },
      { name: "#99J", img: "assets/img/categories/volume-genius-weft/colors/c24.jpg", prices: calcColorPrices("volume-genius-weft", "#99J") },
      { name: "#99J.1", img: "assets/img/categories/volume-genius-weft/colors/c23.jpg", prices: calcColorPrices("volume-genius-weft", "#99J.1") },
      { name: "#613", img: "assets/img/categories/volume-genius-weft/colors/c20.jpg", prices: calcColorPrices("volume-genius-weft", "#613") },
      { name: "M18-22", img: "assets/img/categories/volume-genius-weft/colors/c33.jpg", prices: calcColorPrices("volume-genius-weft", "M18-22") },
      { name: "M18-60", img: "assets/img/categories/volume-genius-weft/colors/c34.jpg", prices: calcColorPrices("volume-genius-weft", "M18-60") },
      { name: "T4-60", img: "assets/img/categories/volume-genius-weft/colors/c42.jpg", prices: calcColorPrices("volume-genius-weft", "T4-60") },
      { name: "T9-60", img: "assets/img/categories/volume-genius-weft/colors/c43.jpg", prices: calcColorPrices("volume-genius-weft", "T9-60") },
      { name: "P2-18", img: "assets/img/categories/volume-genius-weft/colors/c36.jpg", prices: calcColorPrices("volume-genius-weft", "P2-18") },
      { name: "P2-6", img: "assets/img/categories/volume-genius-weft/colors/c37.jpg", prices: calcColorPrices("volume-genius-weft", "P2-6") },
      { name: "P4-27", img: "assets/img/categories/volume-genius-weft/colors/c39.jpg", prices: calcColorPrices("volume-genius-weft", "P4-27") },
      { name: "P8-60", img: "assets/img/categories/volume-genius-weft/colors/c40.jpg", prices: calcColorPrices("volume-genius-weft", "P8-60") },
      { name: "P9-60A", img: "assets/img/categories/volume-genius-weft/colors/c41.jpg", prices: calcColorPrices("volume-genius-weft", "P9-60A") },
      { name: "P18-60A", img: "assets/img/categories/volume-genius-weft/colors/c35.jpg", prices: calcColorPrices("volume-genius-weft", "P18-60A") },
      { name: "P27-60", img: "assets/img/categories/volume-genius-weft/colors/c38.jpg", prices: calcColorPrices("volume-genius-weft", "P27-60") },
      { name: "DC", img: "assets/img/categories/volume-genius-weft/colors/c32.jpg", prices: calcColorPrices("volume-genius-weft", "DC") },
      { name: "B2-18", img: "assets/img/categories/volume-genius-weft/colors/c26.jpg", prices: calcColorPrices("volume-genius-weft", "B2-18") },
      { name: "B2-4-27", img: "assets/img/categories/volume-genius-weft/colors/c27.jpg", prices: calcColorPrices("volume-genius-weft", "B2-4-27") },
      { name: "B4-6", img: "assets/img/categories/volume-genius-weft/colors/c28.jpg", prices: calcColorPrices("volume-genius-weft", "B4-6") },
      { name: "B4-8-60", img: "assets/img/categories/volume-genius-weft/colors/c29.jpg", prices: calcColorPrices("volume-genius-weft", "B4-8-60") },
      { name: "B8-60", img: "assets/img/categories/volume-genius-weft/colors/c30.jpg", prices: calcColorPrices("volume-genius-weft", "B8-60") },
      { name: "B9-60A", img: "assets/img/categories/volume-genius-weft/colors/c31.jpg", prices: calcColorPrices("volume-genius-weft", "B9-60A") },
      { name: "B18-60A", img: "assets/img/categories/volume-genius-weft/colors/c25.jpg", prices: calcColorPrices("volume-genius-weft", "B18-60A") },
    ]
  },
  {
    id: "tape-ins",
    name: "Tape Ins",
    sub: "Quick to apply",
    base: 19.5,
    inc: 2,
    desc: "Premium 100% virgin Remy human hair. Available in 40+ colors and 7 lengths (16\"~28\"). Factory price with low MOQ.",
    cover: "assets/img/categories/tape-ins/colors/c01.jpg",
    details: ["assets/img/categories/tape-ins/details/d01.jpg", "assets/img/categories/tape-ins/details/d02.jpg", "assets/img/categories/tape-ins/details/d03.jpg", "assets/img/categories/tape-ins/details/d04.jpg", "assets/img/categories/tape-ins/details/d05.jpg"],
    colors: [
      { name: "#1", img: "assets/img/categories/tape-ins/colors/c01.jpg", prices: calcColorPrices("tape-ins", "#1") },
      { name: "#1B", img: "assets/img/categories/tape-ins/colors/c04.jpg", prices: calcColorPrices("tape-ins", "#1B") },
      { name: "#1C", img: "assets/img/categories/tape-ins/colors/c05.jpg", prices: calcColorPrices("tape-ins", "#1C") },
      { name: "#2", img: "assets/img/categories/tape-ins/colors/c06.jpg", prices: calcColorPrices("tape-ins", "#2") },
      { name: "#4", img: "assets/img/categories/tape-ins/colors/c13.jpg", prices: calcColorPrices("tape-ins", "#4") },
      { name: "#4A", img: "assets/img/categories/tape-ins/colors/c14.jpg", prices: calcColorPrices("tape-ins", "#4A") },
      { name: "#5", img: "assets/img/categories/tape-ins/colors/c15.jpg", prices: calcColorPrices("tape-ins", "#5") },
      { name: "#6", img: "assets/img/categories/tape-ins/colors/c16.jpg", prices: calcColorPrices("tape-ins", "#6") },
      { name: "#8", img: "assets/img/categories/tape-ins/colors/c20.jpg", prices: calcColorPrices("tape-ins", "#8") },
      { name: "#9", img: "assets/img/categories/tape-ins/colors/c21.jpg", prices: calcColorPrices("tape-ins", "#9") },
      { name: "#16A", img: "assets/img/categories/tape-ins/colors/c02.jpg", prices: calcColorPrices("tape-ins", "#16A") },
      { name: "#18", img: "assets/img/categories/tape-ins/colors/c03.jpg", prices: calcColorPrices("tape-ins", "#18") },
      { name: "#24", img: "assets/img/categories/tape-ins/colors/c07.jpg", prices: calcColorPrices("tape-ins", "#24") },
      { name: "#27", img: "assets/img/categories/tape-ins/colors/c08.jpg", prices: calcColorPrices("tape-ins", "#27") },
      { name: "#30", img: "assets/img/categories/tape-ins/colors/c09.jpg", prices: calcColorPrices("tape-ins", "#30") },
      { name: "#33", img: "assets/img/categories/tape-ins/colors/c10.jpg", prices: calcColorPrices("tape-ins", "#33") },
      { name: "#34", img: "assets/img/categories/tape-ins/colors/c12.jpg", prices: calcColorPrices("tape-ins", "#34") },
      { name: "#34.1", img: "assets/img/categories/tape-ins/colors/c11.jpg", prices: calcColorPrices("tape-ins", "#34.1") },
      { name: "#60", img: "assets/img/categories/tape-ins/colors/c17.jpg", prices: calcColorPrices("tape-ins", "#60") },
      { name: "#60A", img: "assets/img/categories/tape-ins/colors/c18.jpg", prices: calcColorPrices("tape-ins", "#60A") },
      { name: "#99J", img: "assets/img/categories/tape-ins/colors/c23.jpg", prices: calcColorPrices("tape-ins", "#99J") },
      { name: "#99J.1", img: "assets/img/categories/tape-ins/colors/c22.jpg", prices: calcColorPrices("tape-ins", "#99J.1") },
      { name: "#613", img: "assets/img/categories/tape-ins/colors/c19.jpg", prices: calcColorPrices("tape-ins", "#613") },
      { name: "M18-22", img: "assets/img/categories/tape-ins/colors/c31.jpg", prices: calcColorPrices("tape-ins", "M18-22") },
      { name: "M18-60", img: "assets/img/categories/tape-ins/colors/c32.jpg", prices: calcColorPrices("tape-ins", "M18-60") },
      { name: "T2-60A", img: "assets/img/categories/tape-ins/colors/c47.jpg", prices: calcColorPrices("tape-ins", "T2-60A") },
      { name: "T4-60", img: "assets/img/categories/tape-ins/colors/c41.jpg", prices: calcColorPrices("tape-ins", "T4-60") },
      { name: "T9-60", img: "assets/img/categories/tape-ins/colors/c42.jpg", prices: calcColorPrices("tape-ins", "T9-60") },
      { name: "ESPRESSO", img: "assets/img/categories/tape-ins/colors/c30.jpg", prices: calcColorPrices("tape-ins", "ESPRESSO") },
      { name: "P2-18", img: "assets/img/categories/tape-ins/colors/c35.jpg", prices: calcColorPrices("tape-ins", "P2-18") },
      { name: "P2-6", img: "assets/img/categories/tape-ins/colors/c36.jpg", prices: calcColorPrices("tape-ins", "P2-6") },
      { name: "P4-27", img: "assets/img/categories/tape-ins/colors/c38.jpg", prices: calcColorPrices("tape-ins", "P4-27") },
      { name: "P8-60", img: "assets/img/categories/tape-ins/colors/c39.jpg", prices: calcColorPrices("tape-ins", "P8-60") },
      { name: "P9-60A", img: "assets/img/categories/tape-ins/colors/c40.jpg", prices: calcColorPrices("tape-ins", "P9-60A") },
      { name: "P16A-60A", img: "assets/img/categories/tape-ins/colors/c33.jpg", prices: calcColorPrices("tape-ins", "P16A-60A") },
      { name: "P18-60A", img: "assets/img/categories/tape-ins/colors/c34.jpg", prices: calcColorPrices("tape-ins", "P18-60A") },
      { name: "P27-60", img: "assets/img/categories/tape-ins/colors/c37.jpg", prices: calcColorPrices("tape-ins", "P27-60") },
      { name: "DC", img: "assets/img/categories/tape-ins/colors/c29.jpg", prices: calcColorPrices("tape-ins", "DC") },
      { name: "B2-18", img: "assets/img/categories/tape-ins/colors/c24.jpg", prices: calcColorPrices("tape-ins", "B2-18") },
      { name: "B2-4-27", img: "assets/img/categories/tape-ins/colors/c25.jpg", prices: calcColorPrices("tape-ins", "B2-4-27") },
      { name: "B2-60A", img: "assets/img/categories/tape-ins/colors/c44.jpg", prices: calcColorPrices("tape-ins", "B2-60A") },
      { name: "B4-6", img: "assets/img/categories/tape-ins/colors/c45.jpg", prices: calcColorPrices("tape-ins", "B4-6") },
      { name: "B4-8-60", img: "assets/img/categories/tape-ins/colors/c26.jpg", prices: calcColorPrices("tape-ins", "B4-8-60") },
      { name: "B6-27", img: "assets/img/categories/tape-ins/colors/c46.jpg", prices: calcColorPrices("tape-ins", "B6-27") },
      { name: "B8-60", img: "assets/img/categories/tape-ins/colors/c27.jpg", prices: calcColorPrices("tape-ins", "B8-60") },
      { name: "B9-60A", img: "assets/img/categories/tape-ins/colors/c28.jpg", prices: calcColorPrices("tape-ins", "B9-60A") },
      { name: "B18-60A", img: "assets/img/categories/tape-ins/colors/c43.jpg", prices: calcColorPrices("tape-ins", "B18-60A") },
    ]
  },
  {
    id: "invisible-tape",
    name: "Invisible Tape",
    sub: "Seamless & flat",
    base: 18.5,
    inc: 2,
    desc: "Premium 100% virgin Remy human hair. Available in 40+ colors and 7 lengths (16\"~28\"). Factory price with low MOQ.",
    cover: "assets/img/categories/invisible-tape/colors/c01.jpg",
    details: ["assets/img/categories/invisible-tape/details/d01.jpg", "assets/img/categories/invisible-tape/details/d02.jpg", "assets/img/categories/invisible-tape/details/d03.jpg", "assets/img/categories/invisible-tape/details/d04.jpg", "assets/img/categories/invisible-tape/details/d05.jpg", "assets/img/categories/invisible-tape/details/d06.jpg"],
    colors: [
      { name: "#1", img: "assets/img/categories/invisible-tape/colors/c01.jpg", prices: calcColorPrices("invisible-tape", "#1") },
      { name: "#1B", img: "assets/img/categories/invisible-tape/colors/c04.jpg", prices: calcColorPrices("invisible-tape", "#1B") },
      { name: "#1C", img: "assets/img/categories/invisible-tape/colors/c05.jpg", prices: calcColorPrices("invisible-tape", "#1C") },
      { name: "#2", img: "assets/img/categories/invisible-tape/colors/c06.jpg", prices: calcColorPrices("invisible-tape", "#2") },
      { name: "#4", img: "assets/img/categories/invisible-tape/colors/c15.jpg", prices: calcColorPrices("invisible-tape", "#4") },
      { name: "#4A", img: "assets/img/categories/invisible-tape/colors/c16.jpg", prices: calcColorPrices("invisible-tape", "#4A") },
      { name: "#5", img: "assets/img/categories/invisible-tape/colors/c17.jpg", prices: calcColorPrices("invisible-tape", "#5") },
      { name: "#6", img: "assets/img/categories/invisible-tape/colors/c18.jpg", prices: calcColorPrices("invisible-tape", "#6") },
      { name: "#8", img: "assets/img/categories/invisible-tape/colors/c22.jpg", prices: calcColorPrices("invisible-tape", "#8") },
      { name: "#9", img: "assets/img/categories/invisible-tape/colors/c23.jpg", prices: calcColorPrices("invisible-tape", "#9") },
      { name: "#16A", img: "assets/img/categories/invisible-tape/colors/c02.jpg", prices: calcColorPrices("invisible-tape", "#16A") },
      { name: "#18", img: "assets/img/categories/invisible-tape/colors/c03.jpg", prices: calcColorPrices("invisible-tape", "#18") },
      { name: "#24", img: "assets/img/categories/invisible-tape/colors/c07.jpg", prices: calcColorPrices("invisible-tape", "#24") },
      { name: "#27", img: "assets/img/categories/invisible-tape/colors/c08.jpg", prices: calcColorPrices("invisible-tape", "#27") },
      { name: "#30", img: "assets/img/categories/invisible-tape/colors/c10.jpg", prices: calcColorPrices("invisible-tape", "#30") },
      { name: "#30.1", img: "assets/img/categories/invisible-tape/colors/c09.jpg", prices: calcColorPrices("invisible-tape", "#30.1") },
      { name: "#33", img: "assets/img/categories/invisible-tape/colors/c12.jpg", prices: calcColorPrices("invisible-tape", "#33") },
      { name: "#33.1", img: "assets/img/categories/invisible-tape/colors/c11.jpg", prices: calcColorPrices("invisible-tape", "#33.1") },
      { name: "#34", img: "assets/img/categories/invisible-tape/colors/c14.jpg", prices: calcColorPrices("invisible-tape", "#34") },
      { name: "#34.1", img: "assets/img/categories/invisible-tape/colors/c13.jpg", prices: calcColorPrices("invisible-tape", "#34.1") },
      { name: "#60", img: "assets/img/categories/invisible-tape/colors/c19.jpg", prices: calcColorPrices("invisible-tape", "#60") },
      { name: "#60A.1", img: "assets/img/categories/invisible-tape/colors/c20.jpg", prices: calcColorPrices("invisible-tape", "#60A.1") },
      { name: "#99J", img: "assets/img/categories/invisible-tape/colors/c25.jpg", prices: calcColorPrices("invisible-tape", "#99J") },
      { name: "#99J.1", img: "assets/img/categories/invisible-tape/colors/c24.jpg", prices: calcColorPrices("invisible-tape", "#99J.1") },
      { name: "#613", img: "assets/img/categories/invisible-tape/colors/c21.jpg", prices: calcColorPrices("invisible-tape", "#613") },
      { name: "M18-22", img: "assets/img/categories/invisible-tape/colors/c34.jpg", prices: calcColorPrices("invisible-tape", "M18-22") },
      { name: "M18-60", img: "assets/img/categories/invisible-tape/colors/c35.jpg", prices: calcColorPrices("invisible-tape", "M18-60") },
      { name: "T4-60", img: "assets/img/categories/invisible-tape/colors/c43.jpg", prices: calcColorPrices("invisible-tape", "T4-60") },
      { name: "T9-60", img: "assets/img/categories/invisible-tape/colors/c44.jpg", prices: calcColorPrices("invisible-tape", "T9-60") },
      { name: "P2-18", img: "assets/img/categories/invisible-tape/colors/c37.jpg", prices: calcColorPrices("invisible-tape", "P2-18") },
      { name: "P2-6", img: "assets/img/categories/invisible-tape/colors/c38.jpg", prices: calcColorPrices("invisible-tape", "P2-6") },
      { name: "P4-27", img: "assets/img/categories/invisible-tape/colors/c40.jpg", prices: calcColorPrices("invisible-tape", "P4-27") },
      { name: "P8-60", img: "assets/img/categories/invisible-tape/colors/c41.jpg", prices: calcColorPrices("invisible-tape", "P8-60") },
      { name: "P9-60A", img: "assets/img/categories/invisible-tape/colors/c42.jpg", prices: calcColorPrices("invisible-tape", "P9-60A") },
      { name: "P18-60A", img: "assets/img/categories/invisible-tape/colors/c36.jpg", prices: calcColorPrices("invisible-tape", "P18-60A") },
      { name: "P27-60", img: "assets/img/categories/invisible-tape/colors/c39.jpg", prices: calcColorPrices("invisible-tape", "P27-60") },
      { name: "DC", img: "assets/img/categories/invisible-tape/colors/c33.jpg", prices: calcColorPrices("invisible-tape", "DC") },
      { name: "B2-18", img: "assets/img/categories/invisible-tape/colors/c27.jpg", prices: calcColorPrices("invisible-tape", "B2-18") },
      { name: "B2-4-27", img: "assets/img/categories/invisible-tape/colors/c28.jpg", prices: calcColorPrices("invisible-tape", "B2-4-27") },
      { name: "B4-6", img: "assets/img/categories/invisible-tape/colors/c29.jpg", prices: calcColorPrices("invisible-tape", "B4-6") },
      { name: "B4-8-60", img: "assets/img/categories/invisible-tape/colors/c30.jpg", prices: calcColorPrices("invisible-tape", "B4-8-60") },
      { name: "B8-60", img: "assets/img/categories/invisible-tape/colors/c31.jpg", prices: calcColorPrices("invisible-tape", "B8-60") },
      { name: "B9-60A", img: "assets/img/categories/invisible-tape/colors/c32.jpg", prices: calcColorPrices("invisible-tape", "B9-60A") },
      { name: "B18-60A", img: "assets/img/categories/invisible-tape/colors/c26.jpg", prices: calcColorPrices("invisible-tape", "B18-60A") },
    ]
  },
  {
    id: "i-tips",
    name: "I-Tips",
    sub: "No damage",
    base: 21,
    inc: 2,
    desc: "Premium 100% virgin Remy human hair. Available in 40+ colors and 7 lengths (16\"~28\"). Factory price with low MOQ.",
    cover: "assets/img/categories/i-tips/colors/c01.jpg",
    details: ["assets/img/categories/i-tips/details/d01.jpg", "assets/img/categories/i-tips/details/d02.jpg", "assets/img/categories/i-tips/details/d03.jpg", "assets/img/categories/i-tips/details/d04.jpg", "assets/img/categories/i-tips/details/d05.jpg", "assets/img/categories/i-tips/details/d06.jpg", "assets/img/categories/i-tips/details/d07.jpg"],
    colors: [
      { name: "#1", img: "assets/img/categories/i-tips/colors/c01.jpg", prices: calcColorPrices("i-tips", "#1") },
      { name: "#1B", img: "assets/img/categories/i-tips/colors/c04.jpg", prices: calcColorPrices("i-tips", "#1B") },
      { name: "#1C", img: "assets/img/categories/i-tips/colors/c05.jpg", prices: calcColorPrices("i-tips", "#1C") },
      { name: "#2", img: "assets/img/categories/i-tips/colors/c06.jpg", prices: calcColorPrices("i-tips", "#2") },
      { name: "#4", img: "assets/img/categories/i-tips/colors/c15.jpg", prices: calcColorPrices("i-tips", "#4") },
      { name: "#4A", img: "assets/img/categories/i-tips/colors/c16.jpg", prices: calcColorPrices("i-tips", "#4A") },
      { name: "#5", img: "assets/img/categories/i-tips/colors/c17.jpg", prices: calcColorPrices("i-tips", "#5") },
      { name: "#6", img: "assets/img/categories/i-tips/colors/c18.jpg", prices: calcColorPrices("i-tips", "#6") },
      { name: "#8", img: "assets/img/categories/i-tips/colors/c22.jpg", prices: calcColorPrices("i-tips", "#8") },
      { name: "#9", img: "assets/img/categories/i-tips/colors/c23.jpg", prices: calcColorPrices("i-tips", "#9") },
      { name: "#16A", img: "assets/img/categories/i-tips/colors/c02.jpg", prices: calcColorPrices("i-tips", "#16A") },
      { name: "#18", img: "assets/img/categories/i-tips/colors/c03.jpg", prices: calcColorPrices("i-tips", "#18") },
      { name: "#24", img: "assets/img/categories/i-tips/colors/c07.jpg", prices: calcColorPrices("i-tips", "#24") },
      { name: "#27", img: "assets/img/categories/i-tips/colors/c08.jpg", prices: calcColorPrices("i-tips", "#27") },
      { name: "#30", img: "assets/img/categories/i-tips/colors/c10.jpg", prices: calcColorPrices("i-tips", "#30") },
      { name: "#30.1", img: "assets/img/categories/i-tips/colors/c09.jpg", prices: calcColorPrices("i-tips", "#30.1") },
      { name: "#33", img: "assets/img/categories/i-tips/colors/c12.jpg", prices: calcColorPrices("i-tips", "#33") },
      { name: "#33.1", img: "assets/img/categories/i-tips/colors/c11.jpg", prices: calcColorPrices("i-tips", "#33.1") },
      { name: "#34", img: "assets/img/categories/i-tips/colors/c14.jpg", prices: calcColorPrices("i-tips", "#34") },
      { name: "#34.1", img: "assets/img/categories/i-tips/colors/c13.jpg", prices: calcColorPrices("i-tips", "#34.1") },
      { name: "#60", img: "assets/img/categories/i-tips/colors/c19.jpg", prices: calcColorPrices("i-tips", "#60") },
      { name: "#60A", img: "assets/img/categories/i-tips/colors/c20.jpg", prices: calcColorPrices("i-tips", "#60A") },
      { name: "#99J", img: "assets/img/categories/i-tips/colors/c25.jpg", prices: calcColorPrices("i-tips", "#99J") },
      { name: "#99J.1", img: "assets/img/categories/i-tips/colors/c24.jpg", prices: calcColorPrices("i-tips", "#99J.1") },
      { name: "#613", img: "assets/img/categories/i-tips/colors/c21.jpg", prices: calcColorPrices("i-tips", "#613") },
      { name: "M18-22", img: "assets/img/categories/i-tips/colors/c41.jpg", prices: calcColorPrices("i-tips", "M18-22") },
      { name: "M18-60", img: "assets/img/categories/i-tips/colors/c42.jpg", prices: calcColorPrices("i-tips", "M18-60") },
      { name: "T4-60", img: "assets/img/categories/i-tips/colors/c39.jpg", prices: calcColorPrices("i-tips", "T4-60") },
      { name: "T9-60", img: "assets/img/categories/i-tips/colors/c40.jpg", prices: calcColorPrices("i-tips", "T9-60") },
      { name: "P2-18", img: "assets/img/categories/i-tips/colors/c43.jpg", prices: calcColorPrices("i-tips", "P2-18") },
      { name: "P2-6", img: "assets/img/categories/i-tips/colors/c35.jpg", prices: calcColorPrices("i-tips", "P2-6") },
      { name: "P4-27", img: "assets/img/categories/i-tips/colors/c36.jpg", prices: calcColorPrices("i-tips", "P4-27") },
      { name: "P8-60", img: "assets/img/categories/i-tips/colors/c37.jpg", prices: calcColorPrices("i-tips", "P8-60") },
      { name: "P9-60A", img: "assets/img/categories/i-tips/colors/c38.jpg", prices: calcColorPrices("i-tips", "P9-60A") },
      { name: "P18-60A", img: "assets/img/categories/i-tips/colors/c34.jpg", prices: calcColorPrices("i-tips", "P18-60A") },
      { name: "P27-60", img: "assets/img/categories/i-tips/colors/c44.jpg", prices: calcColorPrices("i-tips", "P27-60") },
      { name: "DC", img: "assets/img/categories/i-tips/colors/c33.jpg", prices: calcColorPrices("i-tips", "DC") },
      { name: "B2-18", img: "assets/img/categories/i-tips/colors/c27.jpg", prices: calcColorPrices("i-tips", "B2-18") },
      { name: "B2-4-27", img: "assets/img/categories/i-tips/colors/c28.jpg", prices: calcColorPrices("i-tips", "B2-4-27") },
      { name: "B4-6", img: "assets/img/categories/i-tips/colors/c29.jpg", prices: calcColorPrices("i-tips", "B4-6") },
      { name: "B4-8-60", img: "assets/img/categories/i-tips/colors/c30.jpg", prices: calcColorPrices("i-tips", "B4-8-60") },
      { name: "B8-60", img: "assets/img/categories/i-tips/colors/c31.jpg", prices: calcColorPrices("i-tips", "B8-60") },
      { name: "B9-60A", img: "assets/img/categories/i-tips/colors/c32.jpg", prices: calcColorPrices("i-tips", "B9-60A") },
      { name: "B18-60A", img: "assets/img/categories/i-tips/colors/c26.jpg", prices: calcColorPrices("i-tips", "B18-60A") },
    ]
  },
  {
    id: "nano-ring",
    name: "Nano Ring",
    sub: "Micro beads",
    base: 23,
    inc: 2,
    desc: "Premium 100% virgin Remy human hair. Available in 40+ colors and 7 lengths (16\"~28\"). Factory price with low MOQ.",
    cover: "assets/img/categories/nano-ring/colors/c01.jpg",
    details: ["assets/img/categories/nano-ring/details/d01.jpg", "assets/img/categories/nano-ring/details/d02.jpg", "assets/img/categories/nano-ring/details/d03.jpg", "assets/img/categories/nano-ring/details/d04.jpg", "assets/img/categories/nano-ring/details/d05.jpg", "assets/img/categories/nano-ring/details/d06.jpg", "assets/img/categories/nano-ring/details/d07.jpg", "assets/img/categories/nano-ring/details/d08.jpg"],
    colors: [
      { name: "#1", img: "assets/img/categories/nano-ring/colors/c01.jpg", prices: calcColorPrices("nano-ring", "#1") },
      { name: "#1B", img: "assets/img/categories/nano-ring/colors/c04.jpg", prices: calcColorPrices("nano-ring", "#1B") },
      { name: "#1C", img: "assets/img/categories/nano-ring/colors/c05.jpg", prices: calcColorPrices("nano-ring", "#1C") },
      { name: "#2", img: "assets/img/categories/nano-ring/colors/c06.jpg", prices: calcColorPrices("nano-ring", "#2") },
      { name: "#4", img: "assets/img/categories/nano-ring/colors/c15.jpg", prices: calcColorPrices("nano-ring", "#4") },
      { name: "#4A", img: "assets/img/categories/nano-ring/colors/c16.jpg", prices: calcColorPrices("nano-ring", "#4A") },
      { name: "#5", img: "assets/img/categories/nano-ring/colors/c17.jpg", prices: calcColorPrices("nano-ring", "#5") },
      { name: "#6", img: "assets/img/categories/nano-ring/colors/c18.jpg", prices: calcColorPrices("nano-ring", "#6") },
      { name: "#8", img: "assets/img/categories/nano-ring/colors/c22.jpg", prices: calcColorPrices("nano-ring", "#8") },
      { name: "#9", img: "assets/img/categories/nano-ring/colors/c23.jpg", prices: calcColorPrices("nano-ring", "#9") },
      { name: "#16A", img: "assets/img/categories/nano-ring/colors/c02.jpg", prices: calcColorPrices("nano-ring", "#16A") },
      { name: "#18", img: "assets/img/categories/nano-ring/colors/c03.jpg", prices: calcColorPrices("nano-ring", "#18") },
      { name: "#24", img: "assets/img/categories/nano-ring/colors/c07.jpg", prices: calcColorPrices("nano-ring", "#24") },
      { name: "#27", img: "assets/img/categories/nano-ring/colors/c08.jpg", prices: calcColorPrices("nano-ring", "#27") },
      { name: "#30", img: "assets/img/categories/nano-ring/colors/c10.jpg", prices: calcColorPrices("nano-ring", "#30") },
      { name: "#30.1", img: "assets/img/categories/nano-ring/colors/c09.jpg", prices: calcColorPrices("nano-ring", "#30.1") },
      { name: "#33", img: "assets/img/categories/nano-ring/colors/c12.jpg", prices: calcColorPrices("nano-ring", "#33") },
      { name: "#33.1", img: "assets/img/categories/nano-ring/colors/c11.jpg", prices: calcColorPrices("nano-ring", "#33.1") },
      { name: "#34", img: "assets/img/categories/nano-ring/colors/c14.jpg", prices: calcColorPrices("nano-ring", "#34") },
      { name: "#34.1", img: "assets/img/categories/nano-ring/colors/c13.jpg", prices: calcColorPrices("nano-ring", "#34.1") },
      { name: "#60", img: "assets/img/categories/nano-ring/colors/c19.jpg", prices: calcColorPrices("nano-ring", "#60") },
      { name: "#60A", img: "assets/img/categories/nano-ring/colors/c20.jpg", prices: calcColorPrices("nano-ring", "#60A") },
      { name: "#99J", img: "assets/img/categories/nano-ring/colors/c25.jpg", prices: calcColorPrices("nano-ring", "#99J") },
      { name: "#99J.1", img: "assets/img/categories/nano-ring/colors/c24.jpg", prices: calcColorPrices("nano-ring", "#99J.1") },
      { name: "#613", img: "assets/img/categories/nano-ring/colors/c21.jpg", prices: calcColorPrices("nano-ring", "#613") },
      { name: "M18-22", img: "assets/img/categories/nano-ring/colors/c35.jpg", prices: calcColorPrices("nano-ring", "M18-22") },
      { name: "M18-60", img: "assets/img/categories/nano-ring/colors/c36.jpg", prices: calcColorPrices("nano-ring", "M18-60") },
      { name: "T2-60A", img: "assets/img/categories/nano-ring/colors/c49.jpg", prices: calcColorPrices("nano-ring", "T2-60A") },
      { name: "T4-60", img: "assets/img/categories/nano-ring/colors/c40.jpg", prices: calcColorPrices("nano-ring", "T4-60") },
      { name: "T9-60", img: "assets/img/categories/nano-ring/colors/c41.jpg", prices: calcColorPrices("nano-ring", "T9-60") },
      { name: "ESPRESSO", img: "assets/img/categories/nano-ring/colors/c34.jpg", prices: calcColorPrices("nano-ring", "ESPRESSO") },
      { name: "P2-18", img: "assets/img/categories/nano-ring/colors/c45.jpg", prices: calcColorPrices("nano-ring", "P2-18") },
      { name: "P2-6", img: "assets/img/categories/nano-ring/colors/c38.jpg", prices: calcColorPrices("nano-ring", "P2-6") },
      { name: "P4-27", img: "assets/img/categories/nano-ring/colors/c46.jpg", prices: calcColorPrices("nano-ring", "P4-27") },
      { name: "P8-60", img: "assets/img/categories/nano-ring/colors/c47.jpg", prices: calcColorPrices("nano-ring", "P8-60") },
      { name: "P9-60A", img: "assets/img/categories/nano-ring/colors/c48.jpg", prices: calcColorPrices("nano-ring", "P9-60A") },
      { name: "P16A-60A", img: "assets/img/categories/nano-ring/colors/c37.jpg", prices: calcColorPrices("nano-ring", "P16A-60A") },
      { name: "P18-60A", img: "assets/img/categories/nano-ring/colors/c44.jpg", prices: calcColorPrices("nano-ring", "P18-60A") },
      { name: "P27-60", img: "assets/img/categories/nano-ring/colors/c39.jpg", prices: calcColorPrices("nano-ring", "P27-60") },
      { name: "DC", img: "assets/img/categories/nano-ring/colors/c43.jpg", prices: calcColorPrices("nano-ring", "DC") },
      { name: "B2-18", img: "assets/img/categories/nano-ring/colors/c27.jpg", prices: calcColorPrices("nano-ring", "B2-18") },
      { name: "B2-4-27", img: "assets/img/categories/nano-ring/colors/c28.jpg", prices: calcColorPrices("nano-ring", "B2-4-27") },
      { name: "B4-6", img: "assets/img/categories/nano-ring/colors/c29.jpg", prices: calcColorPrices("nano-ring", "B4-6") },
      { name: "B4-8-60", img: "assets/img/categories/nano-ring/colors/c30.jpg", prices: calcColorPrices("nano-ring", "B4-8-60") },
      { name: "B6-27", img: "assets/img/categories/nano-ring/colors/c31.jpg", prices: calcColorPrices("nano-ring", "B6-27") },
      { name: "B8-60", img: "assets/img/categories/nano-ring/colors/c32.jpg", prices: calcColorPrices("nano-ring", "B8-60") },
      { name: "B9-60A", img: "assets/img/categories/nano-ring/colors/c33.jpg", prices: calcColorPrices("nano-ring", "B9-60A") },
      { name: "B18-60A", img: "assets/img/categories/nano-ring/colors/c26.jpg", prices: calcColorPrices("nano-ring", "B18-60A") },
      { name: "B-60A", img: "assets/img/categories/nano-ring/colors/c42.jpg", prices: calcColorPrices("nano-ring", "B-60A") },
    ]
  },
];

// 公司信息
const COMPANY = {
  name: 'Ruis Hair Products Co., Ltd',
  founded: 2005,
  email: 'info@luxestarthair.com',
  phone: '(86) 181-2735-0913',
  instagram: 'ruishairfactory_offcial',
  address: 'First Human Hair Industrial Park, Juancheng County, Heze City, Shandong Province, China',
  // 业务员 WhatsApp 号码池（最多 10 个，纯数字，带国家码不含 +）
  // 每次打开聊天/点击浮动按钮会随机分配一名业务员，实现客户自动分流
  whatsapps: [
    '8618127350913',
    '8618127350914',
    '8618127350915',
    '8618127350916',
    '8618127350917',
    '8618127350918',
    '8618127350919',
    '8618127350920',
    '8618127350921',
    '8618127350922'
  ]
};

// 随机抽取一名业务员号码（供浮动按钮 / 聊天窗口调用）
function pickWhatsApp() {
  const list = getWhatsApps().filter(n => n && String(n).trim());
  if (!list.length) return '8618127350913';
  return list[Math.floor(Math.random() * list.length)];
}

// 全站内容（后台「内容管理」可编辑：首页 / 关于 / 联系 / FAQ / 公司信息）
// 结构：SITE = { home:{...}, about:{...}, contact:{...}, faq:{...}, company:{...} }
const DEFAULT_SITE_CONTENT = {
  home: {
    heroImg: IMG + 'hero/hero-catalog.jpg',
    // 主页大图轮播（多张，后台可增删）。留空则回退到 heroImg 单图
    heroImages: [IMG + 'hero/hero-catalog.jpg', IMG + 'hero/hero-bestseller.jpg', IMG + 'hero/hero-factory.jpg', IMG + 'hero/hero-team.jpg'],
    eyebrow: '100% Virgin Remy Hair · Since 2005',
    title1: 'Find Your Perfect',
    title2: 'Hair Supplier',
    lead: 'Cuticle-aligned Remy hair extensions direct from our own factory. Genius weft, handtied, tape ins and more — at factory price with low MOQ.',
    tag1: '100%|Virgin Remy Hair',
    tag2: 'Factory|Price',
    tag3: 'Low|MOQ',
    tag4: '1~3 Days|Fast Shipping',
    btn1: 'Shop Products',
    btn2: 'Get a Free Sample',
    // 卖点条（perks，4 条）
    perk1T: '100% Virgin Remy',   perk1D: 'Cuticle aligned, no tangling',
    perk2T: 'Double Drawn',       perk2D: 'Thick ends, full volume',
    perk3T: 'Fast Shipping',      perk3D: 'Ships within 48 hours',
    perk4T: 'Custom Branding',    perk4D: 'Packaging & color service',
    // 分类区标题
    catEyebrow: 'Explore', catTitle: 'Shop by Category',
    catDesc: 'From invisible genius wefts to clip-ins — find the perfect hair solution for your salon or brand.',
    // 热销区标题
    hotEyebrow: 'Best Sellers', hotTitle: 'Popular Products',
    hotDesc: 'Our most-loved hair extensions, trusted by salons and distributors worldwide.',
    // 关于预览
    aboutImg: IMG + 'factory.jpg',
    aboutEyebrow: 'About Us', aboutTitle: 'A Trusted Hair Partner Since 2005',
    aboutDesc: 'Ruis Hair Products Co., Ltd was founded in 2005, and our factory is located in Shandong Province, China. We specialize in providing 100% cuticle-aligned Remy hair extensions to salons and distributors all over the world.',
    aboutLi1: 'Mature production lines & skilled hand weavers',
    aboutLi2: 'Strict quality inspection procedures',
    aboutLi3: 'Custom packaging & color service for your brand',
    aboutBtn: 'Read More About Us',
    // 数据条（4 个）
    stat1N: '20+',  stat1L: 'Years of Experience',
    stat2N: '50+',  stat2L: 'Countries Served',
    stat3N: '100%', stat3L: 'Cuticle Aligned Remy',
    stat4N: '10k+', stat4L: 'Happy Clients',
    // 为什么选我们
    whyEyebrow: 'Why Choose Us', whyTitle: 'Quality You Can Trust, Prices You\'ll Love',
    why1T: 'Factory Direct Price', why1D: 'No middlemen. Source directly from our own factory in Shandong and save on every order.',
    why2T: 'Low MOQ',             why2D: 'Start with just one bundle or a single sample pack. Grow your business at your own pace.',
    why3T: 'Strict Quality Control', why3D: 'Every batch is inspected by hand — from cuticle alignment to double-drawn thickness.',
    why4T: 'Custom & OEM Service',  why4D: 'Your brand, your colors, your packaging. We help many clients build their own hair brands.',
    // 最新文章区标题（首页 Tips 板块）
    tipsEyebrow: 'From Our Blog', tipsTitle: 'Latest Hair Care Tips',
    tipsDesc: 'Practical advice to help you and your clients get the most from our Remy hair.',
    // 客户好评区标题（首页好评板块）
    revEyebrow: 'Testimonials', revTitle: 'What Our Clients Say',
    revDesc: 'Real feedback from salons, stylists and distributors around the world.'
  },
  about: {
    crumb: 'About Us', title: 'About Us',
    subtitle: 'Your trusted partner for premium Remy hair extensions since 2005.',
    img: IMG + 'factory.jpg', founded: '2005',
    eyebrow: 'Who We Are', heading: 'Ruis Hair Products Co., Ltd',
    p1: 'Ruis Hair Products Co., Ltd was founded in 2005, and our factory is located in Shandong Province, China. We are specialized in providing 100% cuticle-aligned Remy hair extensions to salons and distributors all over the world, and they are all satisfied with our quality.',
    p2: 'We have mature and professional production lines, skilled hand weavers, strict quality inspection procedures and perfect service. Many clients create their own brand with us — we offer packaging service and customized colors.',
    p3: 'We are willing to help you obtain greater achievement in your business, and wish to establish a long-term, stable and win-win cooperation with you.',
    ctaBtn: 'Contact Us Now',
    // 数据条
    stat1N: '20+',  stat1L: 'Years of Experience',
    stat2N: '50+',  stat2L: 'Countries Served',
    stat3N: '100%', stat3L: 'Cuticle Aligned Remy',
    stat4N: '10k+', stat4L: 'Happy Clients',
    // 里程碑
    mileEyebrow: 'Our Journey', mileTitle: 'Milestones',
    m1Y: '2005', m1T: 'Founded',       m1D: 'Ruis Hair established in Shandong, China.',
    m2Y: '2012', m2T: 'Global Export', m2D: 'Started supplying salons across Europe & America.',
    m3Y: '2018', m3T: 'New Product Lines', m3D: 'Launched genius weft, butterfly & flat weft.',
    m4Y: '2025', m4T: 'OEM & Custom',  m4D: 'Expanded packaging & custom color services.',
    // 优势
    strEyebrow: 'Our Strengths', strTitle: 'What Sets Us Apart',
    s1T: 'Own Factory',        s1D: 'Complete control over production, from raw hair to finished product.',
    s2T: 'Skilled Craftsmen',  s2D: 'Experienced hand weavers ensuring every weft is soft and durable.',
    s3T: 'Quality First',      s3D: 'Strict inspection at every stage — cuticle direction, drawing, color.',
    s4T: 'Win-Win Service',    s4D: 'Long-term partnerships with flexible MOQ and dedicated support.',
    // 展会风采图集（关于我们页）
    exEyebrow: 'Trade Shows', exTitle: 'Meet Us at Global Exhibitions',
    exDesc: 'We regularly attend international beauty & hair shows to meet clients face-to-face. Come visit our booth!',
    exhibition: [
      IMG + 'exhibition/ex-1.jpg',
      IMG + 'exhibition/ex-2.jpg',
      IMG + 'exhibition/ex-3.jpg',
      IMG + 'exhibition/ex-4.jpg',
      IMG + 'exhibition/ex-5.jpg'
    ]
  },
  contact: {
    crumb: 'Contact Us', title: 'Contact Us',
    subtitle: 'Get in touch for prices, samples and custom orders. We reply fast.',
    eyebrow: 'Get In Touch', heading: "We'd Love To Hear From You",
    emailLabel: 'Email', phoneLabel: 'Phone / WhatsApp', addrLabel: 'Factory Address',
    waBtn: 'Chat on WhatsApp',
    formTitle: 'Send Us a Message', formSub: "Fill in the form and we'll get back to you within 24 hours.",
    sendBtn: 'Send Message'
  },
  faq: {
    crumb: "FAQ's", title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know before ordering.',
    // 问答（最多 8 条）
    q1: 'Is your hair 100% human hair?', a1: 'Yes. All our extensions are made from 100% virgin Remy human hair with cuticles intact and aligned in one direction. No synthetic fiber, no animal hair.',
    q2: 'What is the minimum order quantity (MOQ)?', a2: 'Our MOQ is very low — you can start with just one bundle or one sample pack. We also offer samples so you can test the quality before placing a larger order.',
    q3: 'What is "double drawn" hair?', a3: 'Double drawn means short hairs are removed so that the majority of strands are the same length. The result is a full, thick bundle with even ends from top to bottom.',
    q4: 'Do you offer custom colors and packaging?', a4: 'Yes. We provide custom color matching and private-label packaging services. Many of our clients build their own brands with us. Contact us with your requirements.',
    q5: 'How fast will my order ship?', a5: 'Your order will ship within 48 hours, Monday through Friday. In-stock items usually go out in 1~3 days. Delivery time depends on your destination.',
    q6: 'Can I return or exchange items?', a6: 'We accept returns and exchanges on unused, unopened items within 7 days of delivery. Please contact us for a return authorization before sending anything back.',
    q7: 'How do I care for the extensions?', a7: 'Wash with sulfate-free shampoo in lukewarm water, condition the lengths, and air dry or use low heat. Avoid excessive bleaching. With proper care, our hair lasts 12 months or more.',
    q8: 'How can I get a price list or quote?', a8: 'Simply contact us via the form, email or WhatsApp with the products and quantities you need. We\'ll send you a competitive factory quote promptly.',
    bottomEyebrow: 'Still have questions?', bottomTitle: "We're Happy To Help", bottomBtn: 'Contact Us'
  },
  company: {
    logoText: 'RUIS HAIR', logoSub: 'VIRGIN REMY HAIR',
    ctaTitle: 'Ready to grow your hair business?',
    ctaDesc: 'Get factory price, low MOQ and a free color sample today.',
    ctaBtn: 'Contact Us Now',
    footerDesc: 'Ruis Hair Products Co., Ltd was founded in 2005. We specialize in 100% cuticle-aligned Remy hair extensions for salons and distributors worldwide — with mature production lines, skilled hand weavers and strict quality inspection.',
    copyright: 'Ruishair.com',
    // 社媒链接（后台「内容管理 → 公司信息」可编辑）
    instagram: 'https://www.instagram.com/ruishairfactory_offcial',
    facebook: 'https://www.facebook.com/ruishair',
    tiktok: 'https://www.tiktok.com/@ruishair',
    // ===== 收款 / 支付信息（后台「内容管理 → 公司信息」可编辑、可隐藏） =====
    // 是否在网站展示收款信息（关掉则联系页/详情页/发票页都不显示收款方式与银行信息）
    paymentVisible: true,
    // 收款方式列表（每行一个，格式：名称 | 说明 | 标签；标签可留空。留空说明=仅显示名称）
    paymentMethods: [
      { name: 'T/T Bank Transfer', note: 'Recommended for bulk orders · 30% deposit + 70% before shipment', tag: 'Recommended' },
      { name: 'PayPal', note: 'For small orders & samples under $200', tag: '' },
      { name: 'L/C (Letter of Credit)', note: 'For large first-time orders', tag: '' },
      { name: 'Western Union / MoneyGram', note: 'Instant & irreversible', tag: '' }
    ],
    // 银行收款信息（T/T）
    bankInfo: {
      beneficiary: 'Wanting Huang',
      bank: 'Zhejiang Chouzhou Commercial Bank Co., Ltd.',
      account: '1563 0142 1103 0001 8812',
      swift: 'CZCBCN2XXXX',
      address: 'No.532 Danxi Road, Yiwu City, Zhejiang Province, China (Postal code: 321013)',
      // 中间行（电汇至中国时通常需要，备注：VIA CITIUS33XXX）
      intermediaryBank: 'CITIBANK N.A, NEW YORK',
      intermediarySwift: 'CITIUS33XXX',
      notifyEmail: 'info@luxestarmir.com'
    }
  },
  // 首页弹窗（节假日活动等），后台「内容管理 → 首页弹窗」可编辑
  popup: {
    enabled: false,          // 是否启用弹窗（true 显示 / false 隐藏）
    showOnce: true,          // 每用户只显示一次（关掉后不再自动弹出）
    delay: 1500,             // 打开首页后多久弹出（毫秒）
    image: '',               // 弹窗图片（可留空，纯文字样式）（可留空，纯文字样式）
    badge: 'Holiday Special',// 顶部小标签（可留空）
    title: 'Holiday Season Sale',
    subtitle: 'Factory-direct savings up to 20% off on all Remy hair extensions.',
    btnText: 'Get the Offer',
    btnLink: 'contact.html', // 按钮跳转链接
    footerNote: 'Limited time · While stocks last'
  }
};

/* ============================================================
   本地持久化层（localStorage）
   —— 后台管理依赖以下存储键与函数
   ============================================================ */
const STORE = {
  products: 'ruis_products',
  categories: 'ruis_categories',
  inquiries: 'ruis_inquiries',
  adminUser: 'ruis_admin_user',
  adminPass: 'ruis_admin_pass',
  logged: 'ruis_admin_logged',
  whatsapps: 'ruis_whatsapps',
  siteContent: 'ruis_site_content',
  tips: 'ruis_tips',
  reviews: 'ruis_reviews',
  users: 'ruis_users',
  currentUser: 'ruis_current_user'
};

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
  catch (e) { return fallback; }
}
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

// ===== 品类存储（品类即产品，后台可增删品类、改颜色/尺寸价格） =====
// 价格表版本号：升级价格表后 +1，用于强制刷新用户浏览器里缓存的旧品类数据
const PRICE_VERSION = 3;
const PRICE_VERSION_KEY = 'ruis_price_version';
function loadCategories() {
  const saved = lsGet(STORE.categories, null);
  const ver = lsGet(PRICE_VERSION_KEY, 0);
  // 价格表升级后（版本号不符），丢弃旧缓存，使用最新默认品类（含新价格）
  if (ver !== PRICE_VERSION) {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
    lsSet(STORE.categories, fresh);
    lsSet(PRICE_VERSION_KEY, PRICE_VERSION);
    return fresh;
  }
  return Array.isArray(saved) && saved.length ? saved : JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
}
function saveCategories(arr) {
  lsSet(STORE.categories, arr);
  CATEGORIES = arr; PRODUCTS = arr; // 同步内存变量
  // 同步到云端（后台/前台保存时自动生效到全站）
  if (typeof cloudSet === 'function' && cloud) {
    cloudSet(CLOUD_KEYS.categories, arr);
  }
  return arr;
}
let CATEGORIES = loadCategories();

// 兼容旧命名：PRODUCTS = 品类列表（一个品类即一个产品）
function loadProducts() { return loadCategories(); }
function saveProducts(arr) { return saveCategories(arr); }
let PRODUCTS = CATEGORIES;

// 分类名查询（兼容旧代码 catName(id)）
function catName(id) {
  const c = CATEGORIES.find(x => x.id === id);
  return c ? c.name : id;
}

// 查找品类
function getCategory(id) { return CATEGORIES.find(c => c.id === id); }

// 把「品类 × 颜色」展开成独立的商品（列表页按颜色展示，显得丰富）
// 每个商品 = { key, catId, catName, catSub, name(颜色名), img, price(16寸起价), prices }
function allColorProducts() {
  const list = [];
  CATEGORIES.forEach(c => {
    (c.colors || []).forEach(cl => {
      list.push({
        key: c.id + '|' + cl.name,
        catId: c.id,
        catName: c.name,
        catSub: c.sub || '',
        name: cl.name,          // 颜色名作为商品名
        img: cl.img,
        price: Number(cl.prices && cl.prices[16] != null ? cl.prices[16] : 0),
        prices: cl.prices || {}
      });
    });
  });
  return list;
}

// 询盘
function getInquiries() { const v = lsGet(STORE.inquiries, []); return Array.isArray(v) ? v : []; }
function addInquiry(obj) { const all = getInquiries(); all.unshift(obj); lsSet(STORE.inquiries, all); }
function clearInquiries() { lsSet(STORE.inquiries, []); }

// 业务员 WhatsApp 号码池（后台可配置，最多 10 个）
function getWhatsApps() {
  const saved = lsGet(STORE.whatsapps, null);
  return Array.isArray(saved) && saved.length ? saved : (COMPANY.whatsapps || []);
}
function saveWhatsApps(arr) {
  const list = (arr || []).map(n => String(n).trim()).filter(n => /^\d{6,20}$/.test(n)).slice(0, 10);
  lsSet(STORE.whatsapps, list);
  if (typeof cloudSet === 'function' && cloud) cloudSet(CLOUD_KEYS.whatsapps, list);
  return list;
}

// 全站内容（首页/关于/联系/FAQ/公司），后台「内容管理」可编辑
// 深度合并：保存的数据逐层覆盖默认值；兼容旧版扁平字段（自动迁移到 home 下）
function _deepMerge(base, extra) {
  const out = JSON.parse(JSON.stringify(base));
  if (!extra || typeof extra !== 'object') return out;
  for (const k in extra) {
    if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k]) && out[k] && typeof out[k] === 'object') {
      out[k] = _deepMerge(out[k], extra[k]);
    } else {
      out[k] = extra[k];
    }
  }
  return out;
}
function getSiteContent() {
  let saved = lsGet(STORE.siteContent, null);
  if (!saved || typeof saved !== 'object') saved = {};
  // 兼容旧版：扁平字段（heroImg/title1/...）迁移到 home 下
  const FLAT = ['heroImg','eyebrow','title1','title2','lead','tag1','tag2','tag3','tag4','btn1','btn2'];
  if (FLAT.some(k => k in saved) && !(saved.home && saved.home.heroImg)) {
    const home = {};
    FLAT.forEach(k => { if (k in saved) { home[k] = saved[k]; delete saved[k]; } });
    saved.home = Object.assign({}, home, saved.home || {});
  }
  return _deepMerge(DEFAULT_SITE_CONTENT, saved);
}
function saveSiteContent(obj) {
  const cur = getSiteContent();
  const merged = _deepMerge(cur, obj || {});
  lsSet(STORE.siteContent, merged);
  // 同步到云端
  if (typeof cloudSet === 'function' && cloud) {
    cloudSet(CLOUD_KEYS.siteContent, merged);
  }
  return merged;
}

// 读取收款/支付信息（供联系页/详情页/发票页使用）
// 返回 { visible, methods, bank }，visible=false 时前台应隐藏支付相关展示
function getPaymentInfo() {
  const c = getSiteContent().company || {};
  const visible = (c.paymentVisible !== false);
  const methods = Array.isArray(c.paymentMethods) ? c.paymentMethods : [];
  const bank = c.bankInfo || {};
  return { visible: visible, methods: methods, bank: bank };
}

// 管理员账号（默认 admin / ruis1688）
function getAdminCred() {
  return { user: lsGet(STORE.adminUser, 'admin'), pass: lsGet(STORE.adminPass, 'ruis1688') };
}
function setAdminCred(user, pass) { lsSet(STORE.adminUser, user); lsSet(STORE.adminPass, pass); }
function isLoggedIn() { return lsGet(STORE.logged, false) === true; }
function adminLogin(user, pass) {
  const c = getAdminCred();
  if (user === c.user && pass === c.pass) { lsSet(STORE.logged, true); return true; }
  return false;
}
function adminLogout() { lsSet(STORE.logged, false); }

// 工具函数
function money(v) { return '$' + Number(v).toFixed(2); }

// ===== 护理 Tips 文章（后台可发布/编辑/删除，支持上传图片） =====
// 文章结构：{ id, title, excerpt, body, image, category, date, author }
const DEFAULT_TIPS = [
  {
    id: 'tip-1',
    title: 'How to Wash Virgin Remy Hair Extensions (Step by Step)',
    excerpt: 'Washing virgin Remy hair the right way keeps the cuticle aligned, prevents tangling and extends the life of your wefts.',
    body: 'Virgin Remy hair extensions have their cuticles intact and aligned in one direction, which is why they stay smooth and tangle-free. To keep them that way, follow these steps.\n\n1. Detangle first — use a wide-tooth comb or a loop brush and work from the ends upward before wetting the hair.\n2. Use sulfate-free shampoo — sulfate strips natural oils and dries out the hair. Massage gently in a downward motion, never rub in circles.\n3. Condition the mid-lengths and ends — avoid the roots or weft area to prevent the bonds from loosening.\n4. Rinse with cool water — cool water seals the cuticle and adds shine.\n5. Air-dry or blow-dry on low heat — pat with a towel, never wring or twist the wefts.\n\nWash your extensions every 15–20 wears, or once every 1–2 weeks for daily wear. The less you wash, the longer they last.',
    image: 'assets/img/categories/genius-weft/details/d01.jpg',
    category: 'Care',
    date: '2026-11-10',
    author: 'Ruis Hair Team'
  },
  {
    id: 'tip-2',
    title: 'How to Prevent Tangling in Remy Hair Wefts',
    excerpt: 'Tangling is usually caused by dryness, product buildup or rough handling. Here is how to keep your wefts silky.',
    body: 'The #1 complaint with hair extensions is tangling — but with virgin Remy hair, tangling is almost always avoidable.\n\n• Keep hair moisturized — use a lightweight leave-in conditioner or argan oil on the ends. Dry hair grabs onto itself and knots.\n• Brush daily — a loop brush or wide-tooth comb, always from the bottom up.\n• Braid before bed — a loose braid or ponytail stops the hair from rubbing against your pillow and matting overnight.\n• Avoid heavy silicones — they build up, attract dust and cause the hair to mat over time.\n• Don\'t sleep on wet hair — hair is at its weakest when wet and breaks or tangles easily.\n\nStore wefts flat or hang them when not in use. Never pile loose wefts into a bag.',
    image: 'assets/img/categories/machine-weft/details/d01.jpg',
    category: 'Care',
    date: '2026-11-12',
    author: 'Ruis Hair Team'
  },
  {
    id: 'tip-3',
    title: 'How to Color and Tone Remy Hair Extensions Safely',
    excerpt: 'Custom coloring is a big part of the hair business. Learn how to tone and color wefts without damaging the cuticle.',
    body: 'Remy hair can be colored and toned, but it has already been chemically processed once, so you must be gentler than you would with natural growing hair.\n\n• Always strand-test — cut a small piece and test your formula before committing.\n• Tone rather than bleach — for darker shades, use a demi-permanent toner instead of full bleach.\n• Never lift more than 2 levels — virgin Remy hair is already lightened; aggressive bleaching breaks the cuticle.\n• Use 10-volume developer max — higher volumes cause frizz and irreversible damage.\n• Deep-condition after every color — color opens the cuticle, so a deep mask is essential to seal it back.\n\nFor lightening multiple levels, we always recommend buying a lighter base shade and toning down, rather than bleaching up.',
    image: 'assets/img/categories/butterfly-weft/details/d01.jpg',
    category: 'Styling',
    date: '2026-11-14',
    author: 'Ruis Hair Team'
  },
  {
    id: 'tip-4',
    title: 'How to Store Your Hair Extensions Between Uses',
    excerpt: 'Proper storage is the secret to making your wefts and tape-ins last for months. Follow these simple rules.',
    body: 'How you store your extensions is just as important as how you wash and style them.\n\n• Keep them clean and dry — never store damp hair; it can mildew and smell.\n• Hang wefts — use a hanger or extension storage bag so the hair stays straight and untangled.\n• Store tape-ins flat — keep the adhesive panels protected with their original backing.\n• Keep away from direct sunlight and heat — UV fades color and heat dries out the cuticle.\n• Use a silk or satin bag — cotton draws moisture out of the hair and causes friction.\n\nA small investment in storage saves you from tangles, dryness and premature replacement.',
    image: 'assets/img/categories/flat-tip/details/d01.jpg',
    category: 'Care',
    date: '2026-11-16',
    author: 'Ruis Hair Team'
  },
  {
    id: 'tip-5',
    title: 'Heat Styling Remy Hair: How to Avoid Damage',
    excerpt: 'Remy hair can be curled and straightened — but only if you protect it. Here are the heat-styling rules to follow.',
    body: 'Virgin Remy hair can be heat-styled beautifully, but repeated high heat will eventually dry out the cuticle and cause frizz.\n\n• Always use a heat protectant — apply a heat-protectant spray before every use.\n• Keep heat under 180°C (356°F) — Remy hair doesn\'t need extreme heat to hold a style.\n• Style in small sections — this gives better results with less heat exposure.\n• Don\'t style wet hair — blow-dry or air-dry completely first.\n• Limit frequency — the more you heat-style, the faster the hair ages.\n\nFor daily wear, embrace heatless styles like overnight braids or rollers to keep your investment looking fresh.',
    image: 'assets/img/categories/volume-genius-weft/details/d01.jpg',
    category: 'Styling',
    date: '2026-11-18',
    author: 'Ruis Hair Team'
  },
  {
    id: 'tip-6',
    title: 'Choosing the Right Length & Weight for Your Client',
    excerpt: 'Helping your clients pick the right length and grams makes a huge difference in how natural and comfortable the install feels.',
    body: 'Choosing the right extension is about more than color — length and weight matter just as much.\n\n• Length guide — 16–18" falls at the shoulders, 20–22" at mid-back, 24–26" at the waist, 28" and longer at the hips.\n• Weight by hair type — fine hair needs 100–150g, medium hair 150–200g, thick hair 200g or more for a full look.\n• Match the texture — always recommend a texture that blends with the client\'s natural hair (straight, wavy or curly).\n• Consider lifestyle — active clients or those new to extensions often prefer lighter sets.\n\nAs a stylist, guiding clients on length and weight builds trust and leads to repeat business.',
    image: 'assets/img/categories/tape-ins/details/d01.jpg',
    category: 'Styling',
    date: '2026-11-20',
    author: 'Ruis Hair Team'
  }
];

function loadTips() {
  const saved = lsGet(STORE.tips, null);
  return Array.isArray(saved) && saved.length ? saved : JSON.parse(JSON.stringify(DEFAULT_TIPS));
}
function saveTips(arr) { lsSet(STORE.tips, arr); if (typeof cloudSet === 'function' && cloud) cloudSet(CLOUD_KEYS.tips, arr); return arr; }
function getTip(id) { return loadTips().find(t => t.id === id); }

// ===== 客户好评（后台可增删，支持图片；首页好评区滚动展示） =====
// 结构：{ id, name, country, role, rating(1-5), text, image, product, date }
const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Sophie Martin',
    country: 'France',
    role: 'Salon Owner',
    rating: 5,
    text: 'We have ordered genius wefts from Ruis Hair for over two years. The hair is always silky, tangle-free and the cuticle alignment is perfect. Our clients keep coming back.',
    avatar: 'assets/img/categories/genius-weft/colors/c14.jpg',
    image: 'assets/img/categories/genius-weft/colors/c14.jpg',
    product: 'Genius Weft',
    date: '2026-11-18'
  },
  {
    id: 'rev-2',
    name: 'Amara Johnson',
    country: 'USA',
    role: 'Hairstylist',
    rating: 5,
    text: 'The color range is incredible — I can always match my client\'s exact shade. Double drawn ends mean full, thick bundles with no thinning. Highly recommend.',
    avatar: 'assets/img/categories/flat-tip/colors/c22.jpg',
    image: 'assets/img/categories/flat-tip/colors/c22.jpg',
    product: 'Flat Tip',
    date: '2026-11-15'
  },
  {
    id: 'rev-3',
    name: 'Elena Rossi',
    country: 'Italy',
    role: 'Distributor',
    rating: 5,
    text: 'Fast shipping, low MOQ and factory-direct pricing made it easy to start my own hair brand. The custom packaging service is a real bonus.',
    avatar: 'assets/img/categories/butterfly-weft/colors/c15.jpg',
    image: 'assets/img/categories/butterfly-weft/colors/c15.jpg',
    product: 'Butterfly Weft',
    date: '2026-11-12'
  },
  {
    id: 'rev-4',
    name: 'Mei Lin',
    country: 'Australia',
    role: 'Salon Owner',
    rating: 5,
    text: 'Tape-ins that actually last. No shedding, no tangling — my clients are thrilled with how natural the color blends.',
    avatar: 'assets/img/categories/tape-ins/colors/c13.jpg',
    image: 'assets/img/categories/tape-ins/colors/c13.jpg',
    product: 'Tape Ins',
    date: '2026-11-10'
  },
  {
    id: 'rev-5',
    name: 'Gabriela Santos',
    country: 'Brazil',
    role: 'Hairstylist',
    rating: 4,
    text: 'Great quality for the price. The nano ring extensions are easy to install and the colors hold beautifully even after heat styling.',
    avatar: 'assets/img/categories/nano-ring/colors/c02.jpg',
    image: 'assets/img/categories/nano-ring/colors/c02.jpg',
    product: 'Nano Ring',
    date: '2026-11-08'
  },
  {
    id: 'rev-6',
    name: 'Hannah Müller',
    country: 'Germany',
    role: 'Salon Owner',
    rating: 5,
    text: 'We switched to Ruis Hair three years ago and never looked back. Consistent quality, honest communication and on-time delivery every single order.',
    avatar: 'assets/img/categories/machine-weft/colors/c19.jpg',
    image: 'assets/img/categories/machine-weft/colors/c19.jpg',
    product: 'Machine Weft',
    date: '2026-11-05'
  },
  {
    id: 'rev-7',
    name: 'Isabella García',
    country: 'Spain',
    role: 'Distributor',
    rating: 5,
    text: 'Building my own brand was easy thanks to their custom packaging and color service. My customers love the hair and keep reordering.',
    avatar: 'assets/img/categories/volume-genius-weft/colors/c11.jpg',
    image: 'assets/img/categories/volume-genius-weft/colors/c11.jpg',
    product: 'Volume Genius Weft',
    date: '2026-11-02'
  },
  {
    id: 'rev-8',
    name: 'Chloe Dubois',
    country: 'Canada',
    role: 'Hairstylist',
    rating: 5,
    text: 'The i-tip extensions blend seamlessly with natural hair. No one can tell where the extension starts. Outstanding quality.',
    avatar: 'assets/img/categories/i-tips/colors/c08.jpg',
    image: 'assets/img/categories/i-tips/colors/c08.jpg',
    product: 'I-Tips',
    date: '2026-10-30'
  },
  {
    id: 'rev-9',
    name: 'Yuki Tanaka',
    country: 'Japan',
    role: 'Salon Owner',
    rating: 5,
    text: 'Invisible tape is exactly as described — thin, flat and undetectable. My high-end clients are extremely satisfied.',
    avatar: 'assets/img/categories/invisible-tape/colors/c17.jpg',
    image: 'assets/img/categories/invisible-tape/colors/c17.jpg',
    product: 'Invisible Tape',
    date: '2026-10-28'
  },
  {
    id: 'rev-10',
    name: 'Olivia Smith',
    country: 'UK',
    role: 'Hairstylist',
    rating: 4,
    text: 'Shipping was faster than expected — arrived in 3 days. The hair texture is soft and holds curls beautifully. Will order again.',
    avatar: 'assets/img/categories/genius-weft/colors/c06.jpg',
    image: 'assets/img/categories/genius-weft/colors/c06.jpg',
    product: 'Genius Weft',
    date: '2026-10-25'
  },
  {
    id: 'rev-11',
    name: 'Priya Patel',
    country: 'India',
    role: 'Distributor',
    rating: 5,
    text: 'Reliable factory, competitive prices and a huge color chart. My salon clients have grown 40% since I started sourcing here.',
    avatar: 'assets/img/categories/flat-tip/colors/c24.jpg',
    image: 'assets/img/categories/flat-tip/colors/c24.jpg',
    product: 'Flat Tip',
    date: '2026-10-22'
  },
  {
    id: 'rev-12',
    name: 'Emma Wilson',
    country: 'Ireland',
    role: 'Salon Owner',
    rating: 5,
    text: 'The double drawn bundles are thick from top to bottom. No thinning ends — exactly what my clients pay for.',
    avatar: 'assets/img/categories/butterfly-weft/colors/c05.jpg',
    image: 'assets/img/categories/butterfly-weft/colors/c05.jpg',
    product: 'Butterfly Weft',
    date: '2026-10-20'
  },
  {
    id: 'rev-13',
    name: 'Lucia Fernández',
    country: 'Mexico',
    role: 'Hairstylist',
    rating: 5,
    text: 'Keratin tips bond perfectly and last for months. My extensions clients are the happiest they have ever been.',
    avatar: 'assets/img/categories/i-tips/colors/c12.jpg',
    image: 'assets/img/categories/i-tips/colors/c12.jpg',
    product: 'I-Tips',
    date: '2026-10-18'
  },
  {
    id: 'rev-14',
    name: 'Nina Bergström',
    country: 'Sweden',
    role: 'Distributor',
    rating: 5,
    text: 'As a growing distributor, the low MOQ let me test the market first. Now I order monthly. Great partner.',
    avatar: 'assets/img/categories/nano-ring/colors/c09.jpg',
    image: 'assets/img/categories/nano-ring/colors/c09.jpg',
    product: 'Nano Ring',
    date: '2026-10-15'
  },
  {
    id: 'rev-15',
    name: 'Grace Kim',
    country: 'South Korea',
    role: 'Salon Owner',
    rating: 5,
    text: 'The hand-tied wefts are invisible, thin and comfortable. My bridal clients absolutely love them.',
    avatar: 'assets/img/categories/volume-genius-weft/colors/c07.jpg',
    image: 'assets/img/categories/volume-genius-weft/colors/c07.jpg',
    product: 'Volume Genius Weft',
    date: '2026-10-12'
  },
  {
    id: 'rev-16',
    name: 'Charlotte Evans',
    country: 'New Zealand',
    role: 'Hairstylist',
    rating: 4,
    text: 'Beautiful color payoff and the hair stays soft after multiple washes. Minor shipping delay once, otherwise perfect.',
    avatar: 'assets/img/categories/machine-weft/colors/c16.jpg',
    image: 'assets/img/categories/machine-weft/colors/c16.jpg',
    product: 'Machine Weft',
    date: '2026-10-09'
  },
  {
    id: 'rev-17',
    name: 'Ana Costa',
    country: 'Portugal',
    role: 'Salon Owner',
    rating: 5,
    text: 'I have tried many suppliers over 10 years — Ruis Hair is the most consistent in color, texture and service.',
    avatar: 'assets/img/categories/tape-ins/colors/c10.jpg',
    image: 'assets/img/categories/tape-ins/colors/c10.jpg',
    product: 'Tape Ins',
    date: '2026-10-06'
  },
  {
    id: 'rev-18',
    name: 'Maria Ivanova',
    country: 'Russia',
    role: 'Distributor',
    rating: 5,
    text: 'Custom branding made my label look premium. The packaging impressed my customers from day one.',
    avatar: 'assets/img/categories/invisible-tape/colors/c21.jpg',
    image: 'assets/img/categories/invisible-tape/colors/c21.jpg',
    product: 'Invisible Tape',
    date: '2026-10-03'
  },
  {
    id: 'rev-19',
    name: 'Sofia Ricci',
    country: 'Switzerland',
    role: 'Hairstylist',
    rating: 5,
    text: 'The color chart is huge and accurate. I always find the perfect match for my clients\' hair. Truly professional.',
    avatar: 'assets/img/categories/genius-weft/colors/c18.jpg',
    image: 'assets/img/categories/genius-weft/colors/c18.jpg',
    product: 'Genius Weft',
    date: '2026-09-30'
  },
  {
    id: 'rev-20',
    name: 'Julia Novak',
    country: 'Poland',
    role: 'Salon Owner',
    rating: 5,
    text: 'Reliable quality, fair prices and a team that actually responds fast. Highly recommend to any salon looking for a long-term supplier.',
    avatar: 'assets/img/categories/flat-tip/colors/c20.jpg',
    image: 'assets/img/categories/flat-tip/colors/c20.jpg',
    product: 'Flat Tip',
    date: '2026-09-27'
  }
];
function loadReviews() {
  const saved = lsGet(STORE.reviews, null);
  return Array.isArray(saved) && saved.length ? saved : JSON.parse(JSON.stringify(DEFAULT_REVIEWS));
}
function saveReviews(arr) { lsSet(STORE.reviews, arr); if (typeof cloudSet === 'function' && cloud) cloudSet(CLOUD_KEYS.reviews, arr); return arr; }

// ===== 客户账号（邮箱注册 + 验证码登录，localStorage 本地存储） =====
// 用户结构：{ id, name, email, country, phone, address, avatar, createdAt }
// 密码：纯静态站点无后端，注册不设密码，登录一律走「邮箱 + 验证码」
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'France', 'Germany',
  'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Sweden', 'Norway',
  'Denmark', 'Finland', 'Poland', 'Ireland', 'Switzerland', 'Austria', 'Greece',
  'Brazil', 'Mexico', 'Argentina', 'Colombia', 'Chile', 'Japan', 'South Korea',
  'India', 'New Zealand', 'South Africa', 'United Arab Emirates', 'Saudi Arabia',
  'Russia', 'Ukraine', 'China', 'Hong Kong, China', 'Taiwan, China', 'Singapore',
  'Malaysia', 'Thailand', 'Vietnam', 'Indonesia', 'Philippines', 'Other'
];
function getUsers() { const v = lsGet(STORE.users, []); return Array.isArray(v) ? v : []; }
function saveUsers(arr) { lsSet(STORE.users, arr); return arr; }
function getUserByEmail(email) { return getUsers().find(u => (u.email||'').toLowerCase() === String(email||'').toLowerCase()); }
function getCurrentUser() { return lsGet(STORE.currentUser, null); }
function setCurrentUser(u) { lsSet(STORE.currentUser, u); }
function registerUser(obj) {
  const users = getUsers();
  if (getUserByEmail(obj.email)) return { ok: false, msg: 'This email is already registered. Please sign in instead.' };
  const user = {
    id: 'u-' + Date.now(),
    name: obj.name,
    email: obj.email,
    country: obj.country || '',
    phone: obj.phone || '',
    address: obj.address || '',
    avatar: obj.avatar || '',
    createdAt: new Date().toISOString()
  };
  users.unshift(user);
  saveUsers(users);
  setCurrentUser(user);
  // 同步到云端（供后台查看客户列表）
  cloudSyncCustomers(users);
  return { ok: true, user };
}
function loginUser(email) {
  const user = getUserByEmail(email);
  if (!user) return { ok: false, msg: 'No account found with this email. Please register first.' };
  setCurrentUser(user);
  return { ok: true, user };
}
function logoutUser() { lsSet(STORE.currentUser, null); }
// 生成 6 位数字验证码（纯前端演示；接入真实邮件/短信服务后可替换为后端下发）
function genCode() { return String(Math.floor(100000 + Math.random() * 900000)); }
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || ''); }

// 把客户列表同步到云端（后台客户管理用）
async function cloudSyncCustomers(users) {
  try {
    if (typeof cloudSet === 'function') await cloudSet(CLOUD_KEYS.customers, users);
  } catch (e) { /* 云端不可用则静默，本地仍有效 */ }
}
