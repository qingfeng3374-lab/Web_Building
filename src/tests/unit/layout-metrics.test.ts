import { describe, it, expect } from 'vitest';
import {
  gutenbergWeight,
  visualWeight,
  rank,
  hierarchyScore,
  inversions,
  measureComfort,
  measureInCh,
  shiftScore,
  cumulativeLayoutShift,
  visualOrder,
  focusOrderInversions,
  undersizedTargets,
  centroid,
  imbalance,
  type MetricInput,
  type FocusTarget,
} from '@/lib/layout-metrics';

/** 构造一个测试用元素；默认值故意取中性，便于单独改一个维度做对照 */
function el(over: Partial<MetricInput> = {}): MetricInput {
  return {
    id: 'x',
    width: 100,
    height: 50,
    cx: 600,
    cy: 300,
    vw: 1200,
    vh: 600,
    fontWeight: 400,
    color: '#000000',
    background: '#ffffff',
    importance: 1,
    ...over,
  };
}

describe('gutenbergWeight · 阅读重力', () => {
  it('主视区（左上）权重最高', () => {
    expect(gutenbergWeight(0, 0)).toBeGreaterThan(gutenbergWeight(1, 1));
    expect(gutenbergWeight(0, 0)).toBeCloseTo(1.0, 5);
  });

  it('弱休息区（左下）权重最低', () => {
    const corners = [gutenbergWeight(0, 0), gutenbergWeight(1, 0), gutenbergWeight(0, 1), gutenbergWeight(1, 1)];
    expect(Math.min(...corners)).toBeCloseTo(0.6, 5); // 左下
  });

  it('终端区（右下）高于强休息区（右上）—— 视线终点比被跳过的区域重要', () => {
    expect(gutenbergWeight(1, 1)).toBeGreaterThan(gutenbergWeight(1, 0));
  });

  it('越界坐标被夹紧，不产生异常值', () => {
    expect(gutenbergWeight(-5, -5)).toBeCloseTo(gutenbergWeight(0, 0), 5);
    expect(gutenbergWeight(9, 9)).toBeCloseTo(gutenbergWeight(1, 1), 5);
  });
});

describe('visualWeight · 视觉重量', () => {
  it('面积越大越重', () => {
    expect(visualWeight(el({ width: 200 }))).toBeGreaterThan(visualWeight(el({ width: 100 })));
  });

  it('对面积的感知是次线性的（开方），不会让大色块碾压文字', () => {
    const small = visualWeight(el({ width: 100, height: 50 }));
    const big = visualWeight(el({ width: 400, height: 200 })); // 面积 16 倍
    expect(big / small).toBeCloseTo(4, 1); // 开方后只有 4 倍
  });

  it('对比度越高越重', () => {
    const high = visualWeight(el({ color: '#000000' }));
    const low = visualWeight(el({ color: '#bbbbbb' }));
    expect(high).toBeGreaterThan(low);
  });

  it('字重越大越重', () => {
    expect(visualWeight(el({ fontWeight: 700 }))).toBeGreaterThan(visualWeight(el({ fontWeight: 400 })));
  });

  it('同样的元素放在主视区比放在终端区重', () => {
    const topLeft = visualWeight(el({ cx: 100, cy: 60 }));
    const bottomRight = visualWeight(el({ cx: 1100, cy: 540 }));
    expect(topLeft).toBeGreaterThan(bottomRight);
  });
});

describe('rank · 秩', () => {
  it('最大值秩为 1', () => {
    expect(rank([10, 30, 20])).toEqual([3, 1, 2]);
  });

  it('并列取平均秩', () => {
    expect(rank([5, 5, 1])).toEqual([1.5, 1.5, 3]);
  });
});

describe('hierarchyScore · 层级分', () => {
  it('完全一致时为 1', () => {
    const items = [
      el({ id: 'a', importance: 3, width: 300, height: 120 }),
      el({ id: 'b', importance: 2, width: 200, height: 80 }),
      el({ id: 'c', importance: 1, width: 100, height: 40 }),
    ];
    expect(hierarchyScore(items)).toBeCloseTo(1, 5);
  });

  it('完全倒挂时为 -1', () => {
    const items = [
      el({ id: 'a', importance: 1, width: 300, height: 120 }),
      el({ id: 'b', importance: 2, width: 200, height: 80 }),
      el({ id: 'c', importance: 3, width: 100, height: 40 }),
    ];
    expect(hierarchyScore(items)).toBeCloseTo(-1, 5);
  });

  it('单个元素视为满分（无可比较对象）', () => {
    expect(hierarchyScore([el()])).toBe(1);
  });

  it('v0 的场景：最重要的元素在终端区、且与其它元素等大 → 分数为负', () => {
    const cards = [
      // 最重要的「总人数」被放在右下角
      el({ id: 'total', importance: 5, cx: 1050, cy: 520 }),
      el({ id: 'a', importance: 1, cx: 150, cy: 120 }),
      el({ id: 'b', importance: 1, cx: 400, cy: 120 }),
      el({ id: 'c', importance: 2, cx: 650, cy: 120 }),
    ];
    expect(hierarchyScore(cards)).toBeLessThan(0.3);
  });
});

describe('inversions · 层级倒挂对', () => {
  it('找出「更重要却更轻」的元素对', () => {
    const items = [
      el({ id: 'heavy-but-minor', importance: 1, width: 400, height: 200 }),
      el({ id: 'light-but-major', importance: 5, width: 60, height: 20 }),
    ];
    const pairs = inversions(items);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toContain('light-but-major');
  });

  it('层级正确时没有倒挂', () => {
    const items = [
      el({ id: 'a', importance: 5, width: 400, height: 200 }),
      el({ id: 'b', importance: 1, width: 60, height: 20 }),
    ];
    expect(inversions(items)).toHaveLength(0);
  });
});

describe('measureComfort · 行长舒适度', () => {
  it('45–75ch 区间为满分', () => {
    expect(measureComfort(45)).toBe(1);
    expect(measureComfort(66)).toBe(1);
    expect(measureComfort(75)).toBe(1);
  });

  it('v0 的 128ch 已经跌到很低', () => {
    expect(measureComfort(128)).toBeLessThan(0.1);
  });

  it('过短同样扣分（语块被切碎）', () => {
    expect(measureComfort(25)).toBeLessThan(0.3);
  });

  it('极端值不会变成负数', () => {
    expect(measureComfort(500)).toBe(0);
    expect(measureComfort(1)).toBe(0);
  });
});

describe('measureInCh', () => {
  it('像素宽除以字符宽', () => {
    expect(measureInCh(640, 8)).toBe(80);
  });

  it('字符宽为 0 时返回 0 而不是 Infinity', () => {
    expect(measureInCh(640, 0)).toBe(0);
  });
});

describe('cumulativeLayoutShift · CLS', () => {
  it('单次偏移分数 = 影响 × 距离', () => {
    expect(shiftScore({ impactFraction: 0.5, distanceFraction: 0.2, time: 0 })).toBeCloseTo(0.1, 5);
  });

  it('空数组为 0', () => {
    expect(cumulativeLayoutShift([])).toBe(0);
  });

  it('同一会话窗口内的偏移累加', () => {
    const cls = cumulativeLayoutShift([
      { impactFraction: 1, distanceFraction: 0.1, time: 0 },
      { impactFraction: 1, distanceFraction: 0.1, time: 300 },
      { impactFraction: 1, distanceFraction: 0.1, time: 600 },
    ]);
    expect(cls).toBeCloseTo(0.3, 5);
  });

  it('间隔超过 1 秒时开启新窗口，取最大窗口而非总和', () => {
    const cls = cumulativeLayoutShift([
      { impactFraction: 1, distanceFraction: 0.1, time: 0 },
      { impactFraction: 1, distanceFraction: 0.1, time: 200 },
      // 间隔 3 秒 → 新窗口
      { impactFraction: 1, distanceFraction: 0.05, time: 3200 },
    ]);
    // 若直接求和会得到 0.25 —— 那正是很多自制实现高估分数的原因
    expect(cls).toBeCloseTo(0.2, 5);
  });

  it('窗口总时长超过 5 秒也会开启新窗口', () => {
    const entries = Array.from({ length: 12 }, (_, i) => ({
      impactFraction: 1,
      distanceFraction: 0.05,
      time: i * 600, // 每 0.6s 一次，总跨度 6.6s
    }));
    const cls = cumulativeLayoutShift(entries);
    expect(cls).toBeLessThan(12 * 0.05); // 一定小于全部求和
  });
});

describe('visualOrder · 视觉阅读顺序', () => {
  const t = (id: string, x: number, y: number): FocusTarget => ({
    id,
    tabIndex: 0,
    x,
    y,
    width: 100,
    height: 40,
  });

  it('先按行带分组，行带内按 x 排序', () => {
    expect(visualOrder([t('c', 300, 0), t('a', 0, 0), t('b', 150, 0)])).toEqual(['a', 'b', 'c']);
  });

  it('高度略有差异的同一行不会被判成两行', () => {
    const items = [
      { ...t('b', 200, 8), height: 60 },
      t('a', 0, 0),
    ];
    expect(visualOrder(items)).toEqual(['a', 'b']);
  });

  it('真正的第二行排在第一行之后', () => {
    expect(visualOrder([t('b', 0, 200), t('a', 0, 0)])).toEqual(['a', 'b']);
  });
});

describe('focusOrderInversions · 焦点顺序逆序对', () => {
  const t = (id: string, tabIndex: number, x: number, y: number): FocusTarget => ({
    id,
    tabIndex,
    x,
    y,
    width: 100,
    height: 40,
  });

  it('DOM 顺序与视觉顺序一致时为 0', () => {
    expect(focusOrderInversions([t('a', 0, 0, 0), t('b', 1, 150, 0), t('c', 2, 300, 0)])).toBe(0);
  });

  it('用 order 把视觉第一项推到最后 → 产生逆序对', () => {
    // DOM 顺序 a,b,c；视觉顺序 b,c,a（a 被 order 推到末尾）
    const items = [t('a', 0, 400, 0), t('b', 1, 0, 0), t('c', 2, 200, 0)];
    expect(focusOrderInversions(items)).toBe(2);
  });

  it('完全反向时逆序对数 = n(n-1)/2', () => {
    const items = [t('a', 0, 400, 0), t('b', 1, 200, 0), t('c', 2, 0, 0)];
    expect(focusOrderInversions(items)).toBe(3);
  });
});

describe('undersizedTargets · WCAG 2.5.8', () => {
  const t = (w: number, h: number): FocusTarget => ({ id: 'x', tabIndex: 0, x: 0, y: 0, width: w, height: h });

  it('24×24 达标', () => {
    expect(undersizedTargets([t(24, 24)])).toBe(0);
  });

  it('任一边小于 24 即不达标', () => {
    expect(undersizedTargets([t(40, 19)])).toBe(1);
    expect(undersizedTargets([t(19, 40)])).toBe(1);
  });

  it('v0 的按钮（实测 19px 高）不达标', () => {
    expect(undersizedTargets([t(52, 19)])).toBe(1);
  });
});

describe('centroid / imbalance · 视觉重心', () => {
  /**
   * 这条断言记录了一个反直觉但重要的事实：
   * 因为视觉重量里含有阅读重力（左侧权重高于右侧），
   * **几何上完全对称的布局，视觉重心并不在中线上，而是略微偏左。**
   * 偏移量约 0.6%，远低于 8% 的可感阈值 —— 所以它读起来仍然是平衡的。
   * 把这条写成测试，是为了防止有人「修复」这个看似的 bug。
   */
  it('几何对称的布局，视觉重心略微偏左（阅读重力的必然结果）', () => {
    const items = [el({ id: 'l', cx: 300 }), el({ id: 'r', cx: 900 })];
    expect(centroid(items).x).toBeLessThan(600);
    expect(centroid(items).x).toBeGreaterThan(560);
    expect(imbalance(items, 1200)).toBeLessThan(0.08); // 仍在可感阈值内
  });

  it('重元素偏左时重心跟着左移', () => {
    const items = [
      el({ id: 'heavy', cx: 200, width: 400, height: 300 }),
      el({ id: 'light', cx: 1000, width: 80, height: 40 }),
    ];
    expect(centroid(items).x).toBeLessThan(600);
    expect(imbalance(items, 1200)).toBeGreaterThan(0.08); // 超过可感阈值
  });

  it('返回的是无量纲比例，跨屏幕尺寸可比', () => {
    const wide = [el({ cx: 500, vw: 1200 })];
    const narrow = [el({ cx: 156.25, vw: 375 })];
    // 两者都偏离中线约 8.3%
    expect(imbalance(wide, 1200)).toBeCloseTo(imbalance(narrow, 375), 2);
  });

  it('空数组不崩', () => {
    expect(centroid([])).toEqual({ x: 0, y: 0 });
    expect(imbalance([], 0)).toBe(0);
  });
});
