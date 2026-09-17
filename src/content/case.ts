import type { L } from '@/i18n/locales';
import type { CaseStage } from './types';

/**
 * 贯穿案例：NeoCampus 新生数据看板
 *
 * 叙事是**建造**，不是批判。
 *
 * 起点 stage0 是一份真实的、没有任何布局 CSS 的数据文档 ——
 * 它不是「写坏了的页面」，而是「还没有布局的页面」。这两者的区别很重要：
 * 前者让读者学会挑毛病，后者让读者学会动手。
 *
 * 之后每一章给它加一层能力，六层之后成为一个可以交付的看板。
 * 同一份 DOM、同一份数据，**只有 CSS 在生长**。
 */

/* ── 六项指标：每一层负责推动其中一项 ────────────────────────────────
   这是本课程编排的核心检验：如果某一层推不动任何指标，
   说明那一层要么不该存在，要么讲错了地方。                          */

export type MetricKey = 'measure' | 'grouping' | 'consistency' | 'hierarchy' | 'a11y' | 'cls';

export interface MetricSpec {
  key: MetricKey;
  unit: string;
  /** 由哪一层负责推动（章节序号） */
  ownedBy: number;
  direction: 'up' | 'down' | 'target';
  target?: [number, number];
  digits: number;
  explain: L;
}

export const metricSpecs: MetricSpec[] = [
  {
    key: 'measure',
    unit: 'ch',
    ownedBy: 1,
    direction: 'target',
    target: [45, 75],
    digits: 0,
    explain: {
      zh: '正文块的平均行长（字符数）。舒适区 45–75ch，超出后回扫失败率上升。**内容层**负责它。',
      en: 'Average characters per line in body text. The comfort zone is 45–75ch; beyond it the return sweep starts failing. Owned by the **content layer**.',
    },
  },
  {
    key: 'grouping',
    unit: '×',
    ownedBy: 2,
    direction: 'up',
    digits: 2,
    explain: {
      zh: '组间间距 ÷ 组内间距。比值 < 1.5 时分组读不出来，≥ 2 时几乎不会误判。**间距层**负责它。',
      en: 'Between-group gap ÷ within-group gap. Below 1.5 the grouping does not read; at 2 or more it is unambiguous. Owned by the **spacing layer**.',
    },
  },
  {
    key: 'consistency',
    unit: '',
    ownedBy: 3,
    direction: 'down',
    digits: 0,
    explain: {
      zh: '页面上出现的不同间距 / 字号取值的**种类数**。种类越少，每个取值越能被解释。**尺度层**负责它。',
      en: 'How many *distinct* spacing and type values appear on the page. Fewer kinds means every value can be explained. Owned by the **scale layer**.',
    },
  },
  {
    key: 'hierarchy',
    unit: '',
    ownedBy: 5,
    direction: 'up',
    digits: 2,
    explain: {
      zh: '「视觉重量」序列与「业务重要度」序列的秩相关，∈[-1,1]。1 表示最重要的东西确实看起来最重。**视觉层**负责它。',
      en: 'Rank correlation between visual weight and business importance, in [-1,1]. 1 means the most important thing really does look heaviest. Owned by the **visual layer**.',
    },
  },
  {
    key: 'a11y',
    unit: '',
    ownedBy: 4,
    direction: 'down',
    digits: 0,
    explain: {
      zh: '焦点顺序与视觉顺序的逆序对数 + 小于 24×24px 的目标数。**结构层**（顺序）与**适应层**（尺寸）共同负责。',
      en: 'Focus-order inversions plus targets under 24×24px. Shared between the **structure layer** (order) and the **adaptive layer** (size).',
    },
  },
  {
    key: 'cls',
    unit: '',
    ownedBy: 6,
    direction: 'down',
    digits: 3,
    explain: {
      zh: '累计布局偏移。Google 的「良好」阈值是 < 0.1，本课程要求 < 0.01。**适应层**负责它。',
      en: 'Cumulative Layout Shift. Google’s “good” threshold is < 0.1; this course targets < 0.01. Owned by the **adaptive layer**.',
    },
  },
];

/* ── 七个阶段 ───────────────────────────────────────────────────────── */

export interface StageInfo {
  id: CaseStage;
  /** 产出这一阶段的章节序号；stage0 是起点，没有章节 */
  fromLesson: number | null;
  /** 阶段名 */
  name: L;
  /** 这一层加上了什么能力 */
  adds: L;
  /** 一句话概括这一阶段的页面是什么样 */
  headline: L;
  /** 具体改动 */
  changes: L[];
  /** 本层主要推动的指标 */
  moves: MetricKey[];
  metrics: Record<MetricKey, number>;
}

export const stages: StageInfo[] = [
  {
    id: 'stage0',
    fromLesson: null,
    name: { zh: '素材', en: 'Raw material' },
    adds: { zh: '什么都没有 —— 只有内容与浏览器默认样式', en: 'Nothing — only content and the browser’s default styles' },
    headline: {
      zh: '仅有内容与浏览器默认样式的数据文档，尚未施加任何布局规则。',
      en: 'A data document carrying content and browser defaults only, with no layout rules applied.',
    },
    changes: [
      { zh: '真实的新生数据，语义正确的 HTML，零布局样式', en: 'Real freshman data, semantically correct HTML, zero layout styling' },
      { zh: '常规流已经让它在 320px 到 4K 上都能读 —— 这是起点，不是问题', en: 'Normal flow already makes it readable from 320px to 4K — that is the starting point, not the problem' },
    ],
    moves: [],
    metrics: { measure: 138, grouping: 1.0, consistency: 3, hierarchy: 0.05, a11y: 6, cls: 0.31 },
  },
  {
    id: 'stage1',
    fromLesson: 1,
    name: { zh: '内容层', en: 'Content layer' },
    adds: { zh: '行长约束、内在尺寸、常规流的正确用法', en: 'A measure constraint, intrinsic sizing, and normal flow used correctly' },
    headline: {
      zh: '行长受控、尺寸由内容决定，已具备作为文档的可读性。',
      en: 'The measure is constrained and sizing is intrinsic; the page is legible as a document.',
    },
    changes: [
      { zh: '正文限宽 `min(100%, 68ch)` —— 行长从 138ch 回到舒适区', en: 'Body capped at `min(100%, 68ch)` — the measure returns from 138ch to the comfort zone' },
      { zh: '行高从默认 1.2 提到 1.7，中文字形密度需要更大的行距', en: 'Leading rises from the default 1.2 to 1.7; denser CJK glyphs need more of it' },
      { zh: '所有盒子用内在尺寸，长学院名不再需要被截断', en: 'Every box uses intrinsic sizing, so long school names never need clipping' },
      { zh: '用 `.stack > * + *` 表达元素之间的关系，而不是给每个元素写 margin', en: 'Relationships between elements are expressed with `.stack > * + *`, not per-element margins' },
    ],
    moves: ['measure'],
    metrics: { measure: 66, grouping: 1.0, consistency: 4, hierarchy: 0.12, a11y: 6, cls: 0.31 },
  },
  {
    id: 'stage2',
    fromLesson: 2,
    name: { zh: '间距层', en: 'Spacing layer' },
    adds: { zh: '分组、呼吸、垂直节奏', en: 'Grouping, breathing room, vertical rhythm' },
    headline: {
      zh: '分组关系仅由间距建立，未引入任何边框或分隔线。',
      en: 'Grouping is established by spacing alone, with no borders or rules introduced.',
    },
    changes: [
      { zh: '三级间距：区块之间 48px、同级之间 24px、卡片内部 8px，相邻两级比值 ≥ 2', en: 'Three levels of gap: 48px between blocks, 24px between siblings, 8px inside a card — each adjacent pair at a ratio ≥ 2' },
      { zh: '筛选区与图表区拉开一整级，读者不再误以为它们是一组', en: 'Filters and charts are separated by a full step, so nobody mistakes them for one group' },
      { zh: '用面色而不是边框表达「共同区域」—— 零条线达成分组', en: 'Common region expressed with a surface tint rather than borders — grouping with zero lines' },
      { zh: '所有垂直间距落在 24px 基线的整数倍或半倍上', en: 'Every vertical gap lands on a whole or half multiple of the 24px baseline' },
    ],
    moves: ['grouping'],
    metrics: { measure: 66, grouping: 2.0, consistency: 7, hierarchy: 0.2, a11y: 6, cls: 0.31 },
  },
  {
    id: 'stage3',
    fromLesson: 3,
    name: { zh: '尺度层', en: 'Scale layer' },
    adds: { zh: '12 列网格、8pt 间距标尺、1.25 排版音阶', en: 'A 12-column grid, an 8pt spacing scale, a 1.25 type scale' },
    headline: {
      zh: '位置与尺寸均可追溯至网格、间距标尺与排版音阶。',
      en: 'Every position and size traces back to the grid, the spacing scale or the type scale.',
    },
    changes: [
      { zh: '容器 1440px / 外边距 32px / 水槽 24px，卡片改为 `grid-column: span n`', en: 'Container 1440px, margin 32px, gutter 24px; cards switch to `grid-column: span n`' },
      { zh: '间距取值收敛为 9 档标尺，字号收敛为 8 档音阶', en: 'Spacing collapses into a nine-step scale and type into an eight-step scale' },
      { zh: '「占几列」由内容的最小需求宽度推导，不再目测', en: 'How many columns a block spans is derived from its minimum content width, not eyeballed' },
    ],
    moves: ['consistency'],
    metrics: { measure: 66, grouping: 2.0, consistency: 17, hierarchy: 0.24, a11y: 6, cls: 0.31 },
  },
  {
    id: 'stage4',
    fromLesson: 4,
    name: { zh: '结构层', en: 'Structure layer' },
    adds: { zh: 'areas 骨架、Flex/Grid 分工、对齐系统、正确的 DOM 顺序', en: 'An areas skeleton, the Flex/Grid division of labour, Box Alignment, and a correct DOM order' },
    headline: {
      zh: '骨架以 grid-template-areas 显式声明，可作为文本被评审。',
      en: 'The skeleton is declared explicitly as grid-template-areas, reviewable as text.',
    },
    changes: [
      { zh: '主布局改写为 `grid-template-areas`，六行字符画就是页面地图', en: 'The main layout becomes `grid-template-areas`: six lines of ASCII art that *are* the page map' },
      { zh: 'KPI 区用 Grid（二维、要跨行对齐），筛选器与按钮组用 Flex（一维、宽度跟着文字）', en: 'Grid for the KPI area (two-dimensional, needs cross-row alignment), Flex for filters and buttons (one-dimensional, widths follow the labels)' },
      { zh: '位置关系全部用 Box Alignment 表达，全页没有一处 `position:absolute` 坐标', en: 'All positional relationships are expressed with Box Alignment; not one `position:absolute` coordinate remains on the page' },
      { zh: 'DOM 顺序按业务重要度降序写定 —— 焦点顺序与阅读顺序自此永远一致', en: 'DOM order is fixed to descending business importance — focus order and reading order agree from here on' },
    ],
    moves: ['a11y'],
    metrics: { measure: 66, grouping: 2.0, consistency: 17, hierarchy: 0.34, a11y: 2, cls: 0.28 },
  },
  {
    id: 'stage5',
    fromLesson: 5,
    name: { zh: '视觉层', en: 'Visual layer' },
    adds: { zh: '三级层级、视觉平衡、深度层次、节奏与克制', en: 'Three levels of hierarchy, visual balance, depth, rhythm and restraint' },
    headline: {
      zh: '视觉重量与业务重要度对齐，主次关系在模糊状态下仍可辨认。',
      en: 'Visual weight is aligned with business importance; the hierarchy survives an 8px blur.',
    },
    changes: [
      { zh: '主指标提到主视区、跨两列、跳到 `--step-5`，形成明确的三级层级', en: 'The primary metric moves to the primary optical area, spans two columns and jumps to `--step-5`, establishing three clear levels' },
      { zh: '辅助指标同时降字号与降对比度 —— 层级是多个杠杆的乘积', en: 'Supporting metrics drop in both size and contrast — hierarchy is a product of levers, not a sum' },
      { zh: '删除 8 处边框与 2 处阴影，改用两级面色，内容像素占比 +14%', en: 'Eight borders and two shadows removed in favour of two surface levels; the content pixel share rises 14%' },
      { zh: '暗色模式下层次改由亮度承担 —— 阴影在暗底上本就不可见', en: 'In dark mode, layering shifts to luminance — shadows are invisible on a dark ground anyway' },
    ],
    moves: ['hierarchy'],
    metrics: { measure: 64, grouping: 2.0, consistency: 17, hierarchy: 0.84, a11y: 2, cls: 0.28 },
  },
  {
    id: 'stage6',
    fromLesson: 6,
    name: { zh: '适应层', en: 'Adaptive layer' },
    adds: { zh: '内容断点、流体音阶、容器查询、稳定性与性能', en: 'Content breakpoints, a fluid type scale, container queries, stability and performance' },
    headline: {
      zh: '在 320–2560px 区间稳定，加载期间无偏移，键盘可达全程。',
      en: 'Stable from 320 to 2560px, free of shift during load, and fully reachable by keyboard.',
    },
    changes: [
      { zh: '字号全部流体化为 `clamp()`，由 360/1400 两个锚点反解斜率', en: 'All type becomes fluid `clamp()`, with the slope solved from 360/1400 anchors' },
      { zh: '响应式依据从视口改为容器 —— 同一个看板放进侧栏也正确', en: 'Responsiveness keys off the container rather than the viewport — the same dashboard is correct inside a sidebar' },
      { zh: '媒体查询只剩一条，且它的值是实测的内容断点 624px，不是某台设备', en: 'One media query remains, and its value is the measured content breakpoint of 624px — not a device' },
      { zh: '媒体补齐 `aspect-ratio`，目标提到 32px，长列表加 `content-visibility`', en: 'Media gets `aspect-ratio`, targets reach 32px, long lists get `content-visibility`' },
    ],
    moves: ['cls', 'a11y'],
    metrics: { measure: 64, grouping: 2.0, consistency: 17, hierarchy: 0.84, a11y: 0, cls: 0.004 },
  },
];

export const stageById = new Map(stages.map((s) => [s.id, s]));

/** 某一章产出的阶段 */
export function stageOfLesson(order: number): StageInfo | undefined {
  return stages.find((s) => s.fromLesson === order);
}

/** 某一章开始时页面所处的阶段（= 上一章的产出） */
export function stageBeforeLesson(order: number): StageInfo {
  const i = stages.findIndex((s) => s.fromLesson === order);
  return stages[Math.max(0, i - 1)]!;
}

/** 指标由哪一层负责 */
export function ownerOf(key: MetricKey): number {
  return metricSpecs.find((m) => m.key === key)?.ownedBy ?? 0;
}
