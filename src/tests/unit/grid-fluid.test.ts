import { describe, it, expect } from 'vitest';
import {
  columnWidth,
  spanWidth,
  spanFor,
  contentBreakpoint,
  divisorsOf,
  spacingScale,
  distinguishableSteps,
  typeStep,
  baselineHitRate,
  snapLeading,
} from '@/lib/grid';
import {
  fluid,
  fluidSlope,
  fluidIntercept,
  fluidValueAt,
  sidebarStackWidth,
  ramColumns,
  ramTrackWidth,
  switcherIsRow,
} from '@/lib/fluid';

/** 本站的真实网格参数 */
const GRID = { columns: 12, gutter: 24, margin: 32, max: 1440 };

describe('columnWidth · 列宽公式（第 2.2 节）', () => {
  it('1440px 视口下单列约 92.67px', () => {
    // (1440 − 2×32 − 11×24) / 12
    expect(columnWidth(1440, GRID)).toBeCloseTo(92.667, 2);
  });

  it('超过 max 时按 max 计算，不会无限增长', () => {
    expect(columnWidth(2560, GRID)).toBeCloseTo(columnWidth(1440, GRID), 5);
  });

  it('列数越多，单列越窄', () => {
    expect(columnWidth(1440, { ...GRID, columns: 16 })).toBeLessThan(columnWidth(1440, GRID));
  });
});

describe('spanWidth · 跨列宽度', () => {
  it('跨列要把中间的水槽算回来（最常被漏掉的一项）', () => {
    const col = columnWidth(1440, GRID);
    expect(spanWidth(3, 1440, GRID)).toBeCloseTo(3 * col + 2 * GRID.gutter, 4);
  });

  it('span 3 在 1440px 下约 326px', () => {
    expect(spanWidth(3, 1440, GRID)).toBeCloseTo(326, 0);
  });

  it('span 1 等于单列宽', () => {
    expect(spanWidth(1, 1440, GRID)).toBeCloseTo(columnWidth(1440, GRID), 5);
  });

  it('span 12 等于内容区总宽', () => {
    expect(spanWidth(12, 1440, GRID)).toBeCloseTo(1440 - 2 * GRID.margin, 4);
  });
});

describe('spanFor / contentBreakpoint · 反问（第 2.2 / 4.1 节）', () => {
  it('247px 的学院名在 1440px 下 3 列就够', () => {
    expect(spanFor(247, 1440, GRID)).toBeLessThanOrEqual(3);
  });

  it('同样的内容在 1024px 下需要更多列', () => {
    expect(spanFor(247, 1024, GRID)).toBeGreaterThan(spanFor(247, 1440, GRID));
  });

  it('span 3 装下 247px 内容的内容断点落在 1024–1200 之间', () => {
    const bp = contentBreakpoint(3, 247, GRID);
    expect(bp).toBeGreaterThan(1000);
    expect(bp).toBeLessThan(1200);
  });

  it('最大宽度都装不下时返回 Infinity，而不是一个假数字', () => {
    expect(contentBreakpoint(1, 5000, GRID)).toBe(Infinity);
  });

  it('v0 的 bug 可以被这条断言抓住：1024px 下 span 3 装不下最长学院名', () => {
    expect(spanWidth(3, 1024, GRID)).toBeLessThan(247);
  });
});

describe('divisorsOf · 为什么是 12 列（第 2.1 节）', () => {
  it('12 同时支持二分、三分、四分、六分', () => {
    expect(divisorsOf(12)).toEqual([2, 3, 4, 6]);
  });

  it('10 列做不出三等分', () => {
    expect(divisorsOf(10)).not.toContain(3);
  });

  it('16 列同样做不出三等分', () => {
    expect(divisorsOf(16)).not.toContain(3);
  });
});

describe('spacingScale / distinguishableSteps · 间距标尺（第 2.3 节）', () => {
  it('几何增长的九档全部可辨', () => {
    const scale = spacingScale(8, 'ratio-1.5', 9);
    expect(distinguishableSteps(scale)).toBe(9);
  });

  it('线性 +4 的九档里有近一半是冗余的', () => {
    const scale = spacingScale(4, 'linear-4', 9); // 4 8 12 16 20 24 28 32 36
    // 只有 5 档真正可辨（4 → 8 → 12 → 20 → 32），其余 4 档是白给的选项
    expect(distinguishableSteps(scale)).toBe(5);
  });

  it('同样九档，几何增长的可辨识度严格优于线性增长', () => {
    const geometric = distinguishableSteps(spacingScale(8, 'ratio-1.5', 9));
    const linear = distinguishableSteps(spacingScale(4, 'linear-4', 9));
    expect(geometric).toBeGreaterThan(linear);
  });

  it('本站的实际标尺（4/8/12/16/24/32/48/64/96）相邻比值都足够', () => {
    const actual = [4, 8, 12, 16, 24, 32, 48, 64, 96];
    // 小端 4→8→12 的比值是 2 和 1.5，大端都是 1.33~1.5
    expect(distinguishableSteps(actual, 1.3)).toBe(9);
  });
});

describe('typeStep · 排版音阶（第 2.5 节）', () => {
  it('1.25 音阶从 16 出发：16 / 20 / 25 / 31', () => {
    expect(typeStep(16, 1.25, 0)).toBeCloseTo(16, 5);
    expect(typeStep(16, 1.25, 1)).toBeCloseTo(20, 5);
    expect(typeStep(16, 1.25, 2)).toBeCloseTo(25, 5);
    expect(typeStep(16, 1.25, 3)).toBeCloseTo(31.25, 5);
  });

  it('隔三档比值约 1.95 —— 接近「明确可辨」的 2 倍阈值', () => {
    expect(1.25 ** 3).toBeCloseTo(1.953, 3);
  });

  it('黄金比第 4 档已经超过 110px，在屏幕上不可用', () => {
    expect(typeStep(16, 1.618, 4)).toBeGreaterThan(108);
  });
});

describe('baselineHitRate / snapLeading · 垂直节奏（第 2.4 节）', () => {
  it('16px 字号 × 1.5 行高 = 24px，正好落在 24px 基线上', () => {
    expect(baselineHitRate(16, 1.5, 24, 10)).toBe(1);
  });

  it('1.42 行高（22.72px）会脱离基线', () => {
    expect(baselineHitRate(16, 1.42, 24, 10)).toBeLessThan(0.5);
  });

  it('snapLeading 能把目标行高吸附到最近的整数倍', () => {
    expect(snapLeading(16, 24, 1.42)).toBeCloseTo(1.5, 5);
    expect(baselineHitRate(16, snapLeading(16, 24, 1.42), 24, 10)).toBe(1);
  });
});

describe('fluid · clamp() 的数学（第 4.2 节）', () => {
  const spec = { minPx: 15, maxPx: 17, vwMin: 360, vwMax: 1400 };

  it('斜率 = (MAX − MIN) / (vwMax − vwMin)', () => {
    expect(fluidSlope(spec)).toBeCloseTo(2 / 1040, 8);
  });

  it('截距 = MIN − k·vwMin', () => {
    expect(fluidIntercept(spec)).toBeCloseTo(15 - (2 / 1040) * 360, 5);
  });

  it('在两个锚点上精确等于 MIN 与 MAX', () => {
    expect(fluidValueAt(360, spec)).toBeCloseTo(15, 5);
    expect(fluidValueAt(1400, spec)).toBeCloseTo(17, 5);
  });

  it('锚点之外被截断（三段折线的两端是常数）', () => {
    expect(fluidValueAt(320, spec)).toBeCloseTo(15, 5);
    expect(fluidValueAt(2560, spec)).toBeCloseTo(17, 5);
  });

  it('生成的 CSS 与本站 --step-0 一致', () => {
    expect(fluid(15, 17)).toBe('clamp(0.94rem, 0.89rem + 0.19vw, 1.06rem)');
  });

  it('输出总是 rem + vw 的组合 —— 保证用户可以放大字号（WCAG 1.4.4）', () => {
    const css = fluid(24, 40);
    expect(css).toMatch(/rem/);
    expect(css).toMatch(/vw/);
    expect(css).not.toMatch(/\dpx/);
  });
});

describe('算法布局原语的阈值（第 4.4 节）', () => {
  it('Sidebar 堆叠阈值：15rem 侧栏 + 2rem 水槽 + 60% 主区下限 → 680px', () => {
    expect(sidebarStackWidth(240, 32, 0.6)).toBeCloseTo(680, 0);
  });

  it('主区下限越高，堆叠得越早（阈值越大）', () => {
    expect(sidebarStackWidth(240, 32, 0.7)).toBeGreaterThan(sidebarStackWidth(240, 32, 0.6));
  });

  it('RAM 列数：900px 容器 + 288px 最小轨道 + 24px 水槽 → 2 列', () => {
    expect(ramColumns(900, 288, 24)).toBe(2);
  });

  it('RAM 列数随容器宽度单调不减', () => {
    let prev = 0;
    for (let w = 300; w <= 2000; w += 50) {
      const n = ramColumns(w, 288, 24);
      expect(n).toBeGreaterThanOrEqual(prev);
      prev = n;
    }
  });

  it('极窄容器至少保留 1 列，不会返回 0', () => {
    expect(ramColumns(100, 288, 24)).toBe(1);
  });

  it('RAM 轨道宽度铺满容器（列宽 × n + 水槽 = 容器宽）', () => {
    const w = 1000;
    const n = ramColumns(w, 288, 24);
    expect(ramTrackWidth(w, 288, 24) * n + (n - 1) * 24).toBeCloseTo(w, 4);
  });

  it('Switcher 在阈值两侧给出相反结论，没有中间态', () => {
    expect(switcherIsRow(520, 512)).toBe(true);
    expect(switcherIsRow(511, 512)).toBe(false);
  });
});
