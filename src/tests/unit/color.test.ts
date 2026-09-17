import { describe, it, expect } from 'vitest';
import {
  parseColor,
  relativeLuminance,
  contrastRatio,
  composite,
  meetsAA,
  perceptualLightness,
  layerSeparation,
  LAYER_DISCRIMINATION_THRESHOLD,
} from '@/lib/color';

describe('parseColor', () => {
  it('解析 6 位十六进制', () => {
    expect(parseColor('#2563eb')).toEqual({ r: 0x25, g: 0x63, b: 0xeb, a: 1 });
  });

  it('解析 3 位简写', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
  });

  it('解析 8 位（带 alpha）', () => {
    const c = parseColor('#00000080')!;
    expect(c.a).toBeCloseTo(0.502, 2);
  });

  it('解析 rgb() 与 rgba()', () => {
    expect(parseColor('rgb(37, 99, 235)')).toEqual({ r: 37, g: 99, b: 235, a: 1 });
    expect(parseColor('rgba(0, 0, 0, 0.5)')!.a).toBe(0.5);
  });

  it('解析现代空格语法 rgb(0 0 0 / 0.4)', () => {
    const c = parseColor('rgb(0 0 0 / 0.4)')!;
    expect(c.a).toBeCloseTo(0.4, 5);
  });

  it('无法解析时返回 null 而不是抛错', () => {
    expect(parseColor('not-a-color')).toBeNull();
    expect(parseColor('')).toBeNull();
  });
});

describe('contrastRatio · WCAG 2.x 对比度', () => {
  it('黑白对比度是 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('同色对比度是 1:1', () => {
    expect(contrastRatio('#2563eb', '#2563eb')).toBeCloseTo(1, 5);
  });

  it('顺序无关（对称）', () => {
    expect(contrastRatio('#333', '#fff')).toBeCloseTo(contrastRatio('#fff', '#333'), 5);
  });

  it('半透明前景先与背景合成，不会高估对比度', () => {
    const opaque = contrastRatio('#000000', '#ffffff');
    const translucent = contrastRatio('rgba(0,0,0,0.3)', '#ffffff');
    expect(translucent).toBeLessThan(opaque);
  });

  it('本站正文色在卡片面上达到 AAA（≥ 7:1）', () => {
    expect(contrastRatio('#334155', '#ffffff')).toBeGreaterThanOrEqual(7);
  });

  it('本站次要文字色在卡片面上达到 AA（≥ 4.5:1）', () => {
    expect(meetsAA('#64748b', '#ffffff')).toBe(true);
  });

  it('--ink-4 只用于大字与图表辅助标签，不作为正文 —— 它达不到 AA', () => {
    expect(meetsAA('#94a3b8', '#ffffff')).toBe(false);
    expect(meetsAA('#94a3b8', '#ffffff', true)).toBe(false);
  });
});

describe('composite · alpha 合成', () => {
  it('完全透明时等于背景', () => {
    const r = composite({ r: 255, g: 0, b: 0, a: 0 }, { r: 0, g: 0, b: 255, a: 1 });
    expect(r).toEqual({ r: 0, g: 0, b: 255, a: 1 });
  });

  it('50% 时取中点', () => {
    const r = composite({ r: 0, g: 0, b: 0, a: 0.5 }, { r: 255, g: 255, b: 255, a: 1 });
    expect(r.r).toBeCloseTo(127.5, 1);
  });
});

describe('relativeLuminance', () => {
  it('白 = 1，黑 = 0', () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255, a: 1 })).toBeCloseTo(1, 5);
    expect(relativeLuminance({ r: 0, g: 0, b: 0, a: 1 })).toBeCloseTo(0, 5);
  });

  it('绿色的贡献最大（人眼对绿最敏感）', () => {
    const g = relativeLuminance({ r: 0, g: 255, b: 0, a: 1 });
    const r = relativeLuminance({ r: 255, g: 0, b: 0, a: 1 });
    const b = relativeLuminance({ r: 0, g: 0, b: 255, a: 1 });
    expect(g).toBeGreaterThan(r);
    expect(r).toBeGreaterThan(b);
  });
});

describe('layerSeparation · 层次可辨识度（第 5.2 节）', () => {
  it('感知亮度：白 100，黑 0', () => {
    expect(perceptualLightness('#ffffff')).toBeCloseTo(100, 0);
    expect(perceptualLightness('#000000')).toBeCloseTo(0, 0);
  });

  /**
   * 这两条断言直接验证第 5.2 节正文里给出的数字。
   * 如果有人改了 tokens.css 的面色，这里会立刻失败 ——
   * 内容里写的「2.1」「4.8」就不会悄悄变成谎话。
   */
  it('明亮模式：页面底与卡片面只差约 2.1，低于可辨阈值 → 必须靠阴影补强', () => {
    const sep = layerSeparation('#f6f8fb', '#ffffff');
    expect(sep).toBeGreaterThan(1.5);
    expect(sep).toBeLessThan(2.6);
    expect(sep).toBeLessThan(LAYER_DISCRIMINATION_THRESHOLD);
  });

  it('暗色模式：同样两层差约 4.8，高于阈值 → 不需要阴影', () => {
    const sep = layerSeparation('#0b1120', '#131c2e');
    expect(sep).toBeGreaterThan(LAYER_DISCRIMINATION_THRESHOLD);
    expect(sep).toBeLessThan(6.5);
  });

  it('暗色模式的层次分离度高于明亮模式 —— 这就是「暗色靠亮度、明亮靠阴影」的量化依据', () => {
    expect(layerSeparation('#0b1120', '#131c2e')).toBeGreaterThan(layerSeparation('#f6f8fb', '#ffffff'));
  });

  it('顺序无关', () => {
    expect(layerSeparation('#000', '#fff')).toBeCloseTo(layerSeparation('#fff', '#000'), 5);
  });
});
