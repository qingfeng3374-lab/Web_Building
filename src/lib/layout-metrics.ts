import { contrastRatio } from './color';

/**
 * 布局度量：把「感觉」变成「可讨论的数」。
 *
 * 本文件全部是**纯函数** —— 不碰 DOM、不依赖浏览器。
 * 采集 DOM 的部分在 collect()，与计算严格分离，这样计算部分才能被 vitest 覆盖。
 * 案例的四项指标（层级分 / 行长 / CLS / 可达性）都从这里来。
 */

export interface MetricInput {
  id: string;
  width: number;
  height: number;
  /** 元素中心点（相对视口） */
  cx: number;
  cy: number;
  vw: number;
  vh: number;
  fontWeight: number;
  color: string;
  background: string;
  /** 业务重要度：由内容作者声明，越大越重要 */
  importance: number;
}

/* ── 位置权重：古腾堡四象限（见 1.1 节） ──────────────────────────────── */

/**
 * 归一化坐标 (x, y) ∈ [0,1]² 的阅读重力权重。
 * 主视区（左上）1.00 → 终端区（右下）0.75 → 强休息区（右上）0.70 → 弱休息区（左下）0.60
 * 用双线性插值而非硬分区，避免元素跨象限时权重跳变。
 */
export function gutenbergWeight(x: number, y: number): number {
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const px = clamp01(x);
  const py = clamp01(y);
  const topLeft = 1.0;
  const topRight = 0.7;
  const bottomLeft = 0.6;
  const bottomRight = 0.75;
  const top = topLeft + (topRight - topLeft) * px;
  const bottom = bottomLeft + (bottomRight - bottomLeft) * px;
  return top + (bottom - top) * py;
}

/**
 * 视觉重量。
 *
 *   weight = √(w·h) × log₂(contrast + 1) × fontWeightFactor × positionFactor
 *
 * 两处开方/取对数是刻意的：人对面积与对比度的感知都是次线性的，
 * 直接用线性值会让一个大色块碾压所有文字，得出荒谬的排序。
 * 系数不追求心理学精度 —— 层级分用的是**秩相关**，只要单调就够了。
 */
export function visualWeight(el: MetricInput): number {
  const area = Math.sqrt(Math.max(0, el.width * el.height));
  const contrast = contrastRatio(el.color, el.background);
  const weightFactor = 0.6 + (Math.min(900, Math.max(100, el.fontWeight)) / 400) * 0.4;
  const pos = gutenbergWeight(el.cx / (el.vw || 1), el.cy / (el.vh || 1));
  return area * Math.log2(contrast + 1) * weightFactor * pos;
}

/* ── 秩与相关 ───────────────────────────────────────────────────────── */

/** 返回每个元素的秩（1 = 最大），并列取平均秩 */
export function rank(values: number[]): number[] {
  const idx = values.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
  const out = new Array<number>(values.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1]!.v === idx[i]!.v) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) out[idx[k]!.i] = avg;
    i = j + 1;
  }
  return out;
}

/**
 * 层级分 = Spearman 秩相关(视觉重量序, 业务重要度序) ∈ [-1, 1]
 * 1 表示「越重要的东西看起来越重」，负数表示层级倒挂。
 */
export function hierarchyScore(items: MetricInput[]): number {
  if (items.length < 2) return 1;
  const byWeight = rank(items.map(visualWeight));
  const byImportance = rank(items.map((d) => d.importance));
  const n = items.length;
  const sumD2 = byWeight.reduce((acc, r, i) => acc + (r - byImportance[i]!) ** 2, 0);
  return 1 - (6 * sumD2) / (n * (n * n - 1));
}

/** 找出层级倒挂的元素对（演示里用来标红） */
export function inversions(items: MetricInput[]): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]!;
      const b = items[j]!;
      const impOrder = Math.sign(a.importance - b.importance);
      const visOrder = Math.sign(visualWeight(a) - visualWeight(b));
      if (impOrder !== 0 && visOrder !== 0 && impOrder !== visOrder) out.push([a.id, b.id]);
    }
  }
  return out;
}

/* ── 行长 ───────────────────────────────────────────────────────────── */

/** 由像素宽度与字符宽度求行长（ch） */
export function measureInCh(pixelWidth: number, chWidth: number): number {
  return chWidth > 0 ? pixelWidth / chWidth : 0;
}

/** 行长舒适度：45–75ch 为 1，两侧线性衰减到 0（在 20ch / 130ch 处触底） */
export function measureComfort(ch: number): number {
  if (ch >= 45 && ch <= 75) return 1;
  if (ch < 45) return Math.max(0, (ch - 20) / 25);
  return Math.max(0, (130 - ch) / 55);
}

/* ── 累计布局偏移（CLS） ─────────────────────────────────────────────── */

export interface ShiftEntry {
  /** 受影响区域占视口的比例 */
  impactFraction: number;
  /** 最大位移距离占视口较大边的比例 */
  distanceFraction: number;
  time: number;
}

/** 单次偏移分数 = 影响分数 × 距离分数（web.dev 的定义） */
export function shiftScore(e: ShiftEntry): number {
  return e.impactFraction * e.distanceFraction;
}

/**
 * CLS = 所有「会话窗口」中分数之和最大的那个窗口。
 * 会话窗口：相邻偏移间隔 < 1s，窗口总时长 ≤ 5s。
 * 很多自制实现直接把全部偏移求和 —— 那会高估分数，与 Lighthouse 对不上。
 */
export function cumulativeLayoutShift(entries: ShiftEntry[]): number {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => a.time - b.time);
  let best = 0;
  let windowSum = 0;
  let windowStart = sorted[0]!.time;
  let prev = sorted[0]!.time;

  for (const e of sorted) {
    if (e.time - prev > 1000 || e.time - windowStart > 5000) {
      best = Math.max(best, windowSum);
      windowSum = 0;
      windowStart = e.time;
    }
    windowSum += shiftScore(e);
    prev = e.time;
  }
  return Math.max(best, windowSum);
}

/* ── 焦点顺序 ───────────────────────────────────────────────────────── */

export interface FocusTarget {
  id: string;
  /** DOM / Tab 顺序中的序号 */
  tabIndex: number;
  /** 视觉位置 */
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 视觉阅读顺序：先按「行带」分组（y 相差小于半个行高算同一行带），
 * 行带内按 x 排序。不这样做的话，同一行里高度略有差异的卡片会被判成多行。
 */
export function visualOrder(targets: FocusTarget[]): string[] {
  const sorted = [...targets].sort((a, b) => a.y - b.y || a.x - b.x);
  const bands: FocusTarget[][] = [];
  for (const t of sorted) {
    const band = bands[bands.length - 1];
    const ref = band?.[0];
    if (band && ref && Math.abs(t.y - ref.y) < Math.max(ref.height, t.height) * 0.5) band.push(t);
    else bands.push([t]);
  }
  return bands.flatMap((b) => b.sort((a, c) => a.x - c.x).map((t) => t.id));
}

/** 焦点顺序与视觉顺序之间的逆序对数 —— 越大，键盘用户越迷路 */
export function focusOrderInversions(targets: FocusTarget[]): number {
  const visual = visualOrder(targets);
  const position = new Map(visual.map((id, i) => [id, i]));
  const byTab = [...targets].sort((a, b) => a.tabIndex - b.tabIndex).map((t) => position.get(t.id)!);
  let count = 0;
  for (let i = 0; i < byTab.length; i++) {
    for (let j = i + 1; j < byTab.length; j++) {
      if (byTab[i]! > byTab[j]!) count++;
    }
  }
  return count;
}

/** 小于 WCAG 2.5.8 最小目标尺寸（24×24 CSS px）的目标数 */
export function undersizedTargets(targets: FocusTarget[], min = 24): number {
  return targets.filter((t) => t.width < min || t.height < min).length;
}

/* ── DOM 采集（唯一接触浏览器的部分） ────────────────────────────────── */

/**
 * 一次性读完所有元素，中间不穿插任何写操作。
 * getBoundingClientRect / getComputedStyle 都会强制同步布局，
 * 读写交替就会触发 layout thrashing（第 6.4 节）—— 诊断工具自己不能成为问题。
 */
export function collect(doc: Document, selector = '[data-metric]'): MetricInput[] {
  const root = doc.documentElement;
  const vw = root.clientWidth;
  const vh = root.clientHeight;

  return [...doc.querySelectorAll<HTMLElement>(selector)].map((el) => {
    const rect = el.getBoundingClientRect();
    const cs = doc.defaultView!.getComputedStyle(el);
    return {
      id: el.dataset.metric || el.id || '',
      width: rect.width,
      height: rect.height,
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      vw,
      vh,
      fontWeight: Number(cs.fontWeight) || 400,
      color: cs.color,
      background: findBackground(el, doc),
      importance: Number(el.dataset.importance ?? 0),
    };
  });
}

function findBackground(el: Element, doc: Document): string {
  let node: Element | null = el;
  while (node) {
    const bg = doc.defaultView!.getComputedStyle(node).backgroundColor;
    if (bg && !/rgba?\([^)]*,\s*0(\.0+)?\)$/.test(bg) && bg !== 'transparent') return bg;
    node = node.parentElement;
  }
  return '#ffffff';
}

/* ── 视觉重心与平衡（第 5.1 节） ─────────────────────────────────────── */

/** 以视觉重量为质量的加权重心 */
export function centroid(items: MetricInput[]): { x: number; y: number } {
  let sw = 0;
  let sx = 0;
  let sy = 0;
  for (const it of items) {
    const w = visualWeight(it);
    sw += w;
    sx += w * it.cx;
    sy += w * it.cy;
  }
  return sw > 0 ? { x: sx / sw, y: sy / sw } : { x: 0, y: 0 };
}

/**
 * 重心偏离容器中线的比例（无量纲）。
 * 返回比例而非像素：失衡的感知是相对的，1440px 上偏 100px
 * 与 375px 上偏 100px 完全是两回事。经验阈值 0.08。
 */
export function imbalance(items: MetricInput[], containerWidth: number): number {
  if (containerWidth <= 0) return 0;
  return Math.abs(centroid(items).x - containerWidth / 2) / containerWidth;
}
