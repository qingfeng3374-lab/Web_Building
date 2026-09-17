/**
 * 网格数学（第 2.2 节）。
 *
 * 纯函数，可被 vitest 覆盖 —— 这正是「布局可以被单元测试」的落点：
 * 「1024px 下这张卡装不下最长的学院名」是一条可自动验证的断言，
 * 而不是等测试同学在某台笔记本上偶然发现。
 */

export interface GridSpec {
  columns: number;
  /** 水槽 G */
  gutter: number;
  /** 单侧外边距 M */
  margin: number;
  /** 容器最大宽度 */
  max: number;
}

/** 单列宽度：col = (min(W, MAX) − 2M − (n−1)G) / n */
export function columnWidth(viewport: number, g: GridSpec): number {
  const inner = Math.min(viewport, g.max) - g.margin * 2;
  return (inner - (g.columns - 1) * g.gutter) / g.columns;
}

/**
 * 跨 k 列的元素宽度。
 * 注意 (k − 1) * gutter —— 跨列会把中间的水槽一起吃掉，这一项最常被漏掉。
 */
export function spanWidth(k: number, viewport: number, g: GridSpec): number {
  return k * columnWidth(viewport, g) + (k - 1) * g.gutter;
}

/** 反问：要装下 minContent 像素的内容，至少要跨几列？ */
export function spanFor(minContent: number, viewport: number, g: GridSpec): number {
  for (let k = 1; k <= g.columns; k++) {
    if (spanWidth(k, viewport, g) >= minContent) return k;
  }
  return g.columns;
}

/**
 * 内容断点：跨 k 列的元素在视口宽度降到多少时就装不下 minContent 了。
 * 这是第 4.1 节「内容断点而非设备断点」的计算基础。
 */
export function contentBreakpoint(k: number, minContent: number, g: GridSpec): number {
  // spanWidth 关于 viewport 单调递增（在 viewport ≤ max 区间内），二分即可
  let lo = 200;
  let hi = g.max;
  if (spanWidth(k, hi, g) < minContent) return Infinity; // 最大宽度都装不下
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (spanWidth(k, mid, g) >= minContent) hi = mid;
    else lo = mid;
  }
  return Math.ceil(hi);
}

/** 列数的可整除性 —— 为什么是 12（第 2.1 节） */
export function divisorsOf(columns: number, candidates = [2, 3, 4, 5, 6]): number[] {
  return candidates.filter((d) => columns % d === 0);
}

/* ── 间距标尺（第 2.3 节） ──────────────────────────────────────────── */

export type ScaleGrowth = 'linear-4' | 'linear-8' | 'ratio-1.5' | 'golden';

/** 按给定基数与增长方式生成间距标尺 */
export function spacingScale(base: number, growth: ScaleGrowth, steps = 9): number[] {
  const out: number[] = [];
  for (let i = 0; i < steps; i++) {
    switch (growth) {
      case 'linear-4':
        out.push(base + i * 4);
        break;
      case 'linear-8':
        out.push(base * (i + 1));
        break;
      case 'ratio-1.5':
        out.push(Math.round(base * 1.5 ** i));
        break;
      case 'golden':
        out.push(Math.round(base * 1.618 ** i));
        break;
    }
  }
  return out;
}

/**
 * 相邻档位可辨识的数量。
 * 韦伯定律：两个间距要读起来「明显不同」，比值大致需要 ≥ 1.5。
 * 比值不足的相邻档位，其中一个就是冗余选项。
 *
 * EPSILON 的必要性：标尺值会被取整（8 × 1.5⁵ = 60.75 → 61），
 * 于是 61/41 = 1.4878 这样「本该是 1.5」的比值会因为舍入而落在阈值之下。
 * 感知阈值本就不是一个精确常数，容忍 2% 的舍入误差是合理的 ——
 * 不容忍的话，这个函数衡量的就变成了「取整误差」而不是「可辨识度」。
 */
const WEBER_EPSILON = 0.02;

export function distinguishableSteps(scale: number[], threshold = 1.5): number {
  let n = 1;
  let last = scale[0] ?? 1;
  for (let i = 1; i < scale.length; i++) {
    if (scale[i]! / last >= threshold - WEBER_EPSILON) {
      n++;
      last = scale[i]!;
    }
  }
  return n;
}

/* ── 排版音阶（第 2.5 节） ─────────────────────────────────────────── */

export const TYPE_RATIOS = {
  1.125: { zh: '大二度', en: 'Major second' },
  1.2: { zh: '小三度', en: 'Minor third' },
  1.25: { zh: '大三度', en: 'Major third' },
  1.333: { zh: '完全四度', en: 'Perfect fourth' },
  1.5: { zh: '完全五度', en: 'Perfect fifth' },
  1.618: { zh: '黄金比', en: 'Golden ratio' },
} as const;

/** 第 n 档字号 = base × ratioⁿ */
export function typeStep(base: number, ratio: number, n: number): number {
  return base * ratio ** n;
}

export function typeScale(base: number, ratio: number, steps: number[]): Array<{ step: number; px: number }> {
  return steps.map((n) => ({ step: n, px: typeStep(base, ratio, n) }));
}

/* ── 垂直节奏（第 2.4 节） ─────────────────────────────────────────── */

/**
 * 落在基线上的行占比。
 * 允许半个基线单位的容差（第 2.4 节：半单位可接受，四分之一单位不行）。
 */
export function baselineHitRate(
  fontSize: number,
  lineHeight: number,
  rhythm: number,
  lines: number,
  offset = 0,
): number {
  const lh = fontSize * lineHeight;
  let hits = 0;
  for (let i = 0; i < lines; i++) {
    const y = offset + (i + 1) * lh;
    const nearest = Math.round(y / rhythm) * rhythm;
    if (Math.abs(y - nearest) <= 0.5) hits++;
  }
  return lines > 0 ? hits / lines : 0;
}

/** 给定字号与基线单位，求最接近目标行高、又能整除基线的那个行高比 */
export function snapLeading(fontSize: number, rhythm: number, target: number): number {
  const targetPx = fontSize * target;
  const units = Math.max(1, Math.round(targetPx / rhythm));
  return (units * rhythm) / fontSize;
}
