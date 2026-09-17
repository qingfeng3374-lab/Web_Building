/**
 * 颜色工具：对比度计算 + 从 CSS 变量取色。
 *
 * 全站 D3 图表的配色都通过 cssVar() 读设计令牌，
 * 所以切换明暗主题时图表会自动跟随 —— 不需要在每个演示里写两套颜色。
 */

/** 读取 CSS 自定义属性的当前计算值（在 :root 上解析） */
export function cssVar(name: string, fallback = '#888'): string {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** 一次读多个令牌，构成一个图表调色板 */
export function palette<T extends Record<string, string>>(map: T): Record<keyof T, string> {
  const out = {} as Record<keyof T, string>;
  for (const key in map) out[key] = cssVar(map[key]!);
  return out;
}

/* ── 颜色解析 ───────────────────────────────────────────────────────── */

export interface RGB {
  r: number;
  g: number;
  b: number;
  a: number;
}

const NAMED: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'rgba(0,0,0,0)',
};

export function parseColor(input: string): RGB | null {
  if (!input) return null;
  let s = input.trim().toLowerCase();
  if (NAMED[s]) s = NAMED[s]!;

  if (s.startsWith('#')) {
    const hex = s.slice(1);
    const full =
      hex.length === 3 || hex.length === 4
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex;
    if (full.length !== 6 && full.length !== 8) return null;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1,
    };
  }

  const m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1]!.split(/[\s,/]+/).filter(Boolean).map(Number);
    if (parts.length < 3 || parts.some(Number.isNaN)) return null;
    return { r: parts[0]!, g: parts[1]!, b: parts[2]!, a: parts[3] ?? 1 };
  }
  return null;
}

/** sRGB 通道线性化（WCAG 2.x 的相对亮度定义） */
function linear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(c: RGB): number {
  return 0.2126 * linear(c.r) + 0.7152 * linear(c.g) + 0.0722 * linear(c.b);
}

/**
 * WCAG 2.x 对比度，范围 1:1 ~ 21:1。
 * 注意：前景若带透明度，需先与背景合成 —— 否则结果偏高。
 */
export function contrastRatio(fg: string, bg: string): number {
  const f = parseColor(fg);
  const b = parseColor(bg);
  if (!f || !b) return 1;
  const composited = f.a >= 1 ? f : composite(f, b);
  const l1 = relativeLuminance(composited);
  const l2 = relativeLuminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** 半透明前景与不透明背景的 alpha 合成 */
export function composite(fg: RGB, bg: RGB): RGB {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

/** 判定文字在给定背景上是否达标（AA：正文 4.5，大字 3.0） */
export function meetsAA(fg: string, bg: string, large = false): boolean {
  return contrastRatio(fg, bg) >= (large ? 3 : 4.5);
}

/* ── 层次可辨识度（第 5.2 节） ───────────────────────────────────────── */

/**
 * 感知亮度 L*（0–100）。
 * 比 relativeLuminance 更接近人眼的非线性响应，
 * 因此更适合判断「这两层看得出区别吗」。
 */
export function perceptualLightness(css: string): number {
  const c = parseColor(css);
  if (!c) return 0;
  const y = relativeLuminance(c);
  return y > 0.008856 ? 116 * Math.cbrt(y) - 16 : y * 903.3;
}

/** 相邻两层的感知亮度差；低于约 3 时人眼基本分不出 */
export function layerSeparation(a: string, b: string): number {
  return Math.abs(perceptualLightness(a) - perceptualLightness(b));
}

export const LAYER_DISCRIMINATION_THRESHOLD = 3;
