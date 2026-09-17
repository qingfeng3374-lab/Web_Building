/**
 * 流体值与算法布局的数学（第 4 章）。
 * 全部纯函数，可被 vitest 覆盖 —— 「这个布局在多宽时堆叠」不该靠拖窗口试。
 */

const ROOT_FONT_SIZE = 16;

export interface FluidSpec {
  minPx: number;
  maxPx: number;
  vwMin: number;
  vwMax: number;
}

/** clamp 中间那条直线的斜率（px per px） */
export function fluidSlope(s: FluidSpec): number {
  return (s.maxPx - s.minPx) / (s.vwMax - s.vwMin);
}

/** 直线截距（px） */
export function fluidIntercept(s: FluidSpec): number {
  return s.minPx - fluidSlope(s) * s.vwMin;
}

/** 由两个锚点反解出完整的 clamp() 字符串 */
export function fluid(minPx: number, maxPx: number, vwMin = 360, vwMax = 1400): string {
  const spec = { minPx, maxPx, vwMin, vwMax };
  const k = fluidSlope(spec);
  const bRem = fluidIntercept(spec) / ROOT_FONT_SIZE;
  const vw = k * 100;
  return `clamp(${(minPx / ROOT_FONT_SIZE).toFixed(2)}rem, ${bRem.toFixed(2)}rem + ${vw.toFixed(2)}vw, ${(maxPx / ROOT_FONT_SIZE).toFixed(2)}rem)`;
}

/** 在给定视口宽度下求值（三段折线） */
export function fluidValueAt(viewport: number, s: FluidSpec): number {
  const raw = fluidIntercept(s) + fluidSlope(s) * viewport;
  return Math.min(s.maxPx, Math.max(s.minPx, raw));
}

/* ── 算法布局原语的阈值 ─────────────────────────────────────────────── */

/**
 * Sidebar 原语的堆叠阈值：容器宽度低于此值时，侧栏会被挤到下一行。
 *   W < (S + G) / (1 − M)
 * @param sideBasis 侧栏 flex-basis（px）
 * @param gap 水槽（px）
 * @param mainMin 主区 min-inline-size 占容器的比例，如 0.6
 */
export function sidebarStackWidth(sideBasis: number, gap: number, mainMin: number): number {
  if (mainMin >= 1) return Infinity;
  return (sideBasis + gap) / (1 - mainMin);
}

/**
 * RAM 网格（repeat(auto-fit, minmax(A, 1fr))）在给定容器宽度下的实际列数：
 *   n = floor((W + G) / (A + G))
 */
export function ramColumns(containerW: number, minTrack: number, gap: number): number {
  return Math.max(1, Math.floor((containerW + gap) / (minTrack + gap)));
}

/** RAM 网格中每个轨道的实际宽度 */
export function ramTrackWidth(containerW: number, minTrack: number, gap: number): number {
  const n = ramColumns(containerW, minTrack, gap);
  return (containerW - (n - 1) * gap) / n;
}

/**
 * Switcher 原语：容器宽度是否已越过阈值（越过 = 一行平分，未越过 = 每项一行）。
 * flex-basis: calc((threshold - 100%) * 999) 的行为等价于这个判断。
 */
export function switcherIsRow(containerW: number, threshold: number): boolean {
  return containerW >= threshold;
}

/** 列数发生变化的所有容器宽度（用于在图上标注阈值） */
export function ramThresholds(minTrack: number, gap: number, maxWidth = 1920): number[] {
  const out: number[] = [];
  for (let n = 2; n <= 12; n++) {
    const w = n * minTrack + (n - 1) * gap;
    if (w > maxWidth) break;
    out.push(w);
  }
  return out;
}
