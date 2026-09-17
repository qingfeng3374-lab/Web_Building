import type { L } from '@/i18n/locales';

/**
 * 参考文献表。
 *
 * 每个小节的 `theory: string[]` 必须引用这里的 id（构建期校验）。
 * /about 页会反向渲染「这条理论在第几节被引用」，方便教师备课。
 */

export interface Reference {
  id: string;
  authors: string;
  year: string;
  title: L;
  source: L;
  /** 一句话说明这条理论在本课程中被用来论证什么 */
  usedFor: L;
  url?: string;
  group: 'perception' | 'typography' | 'engineering' | 'accessibility' | 'information';
}

export const references: Reference[] = [
  {
    id: 'nielsen-f-pattern',
    authors: 'Nielsen, J.',
    year: '2006',
    title: { zh: 'F 型阅读模式', en: 'F-Shaped Pattern For Reading Web Content' },
    source: { zh: 'Nielsen Norman Group 眼动研究', en: 'Nielsen Norman Group eye-tracking study' },
    usedFor: {
      zh: '论证首屏左上区域的注意力密度最高，以及它在卡片式看板中为何会失效',
      en: 'Why the upper-left of the fold carries the most attention — and why that breaks down on card dashboards',
    },
    url: 'https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/',
    group: 'perception',
  },
  {
    id: 'gutenberg-diagram',
    authors: 'Arnold, E. C.',
    year: '1960s',
    title: { zh: '古腾堡图与阅读重力', en: 'The Gutenberg Diagram and Reading Gravity' },
    source: { zh: '报纸版面设计理论', en: 'Newspaper layout theory' },
    usedFor: {
      zh: '解释视线从左上「主视区」沿对角线滑向右下「终端区」的默认路径',
      en: 'The default diagonal path from the primary optical area to the terminal area',
    },
    group: 'perception',
  },
  {
    id: 'gestalt',
    authors: 'Wertheimer, M.; Koffka, K.',
    year: '1923',
    title: { zh: '格式塔知觉组织律', en: 'Laws of Organization in Perceptual Forms' },
    source: { zh: '格式塔心理学', en: 'Gestalt psychology' },
    usedFor: {
      zh: '接近 / 相似 / 共同区域 / 连续 / 闭合五律，以及它们在界面中的强度排序',
      en: 'Proximity / similarity / common region / continuity / closure, and their relative strength in UI',
    },
    group: 'perception',
  },
  {
    id: 'ware-perception',
    authors: 'Ware, C.',
    year: '2012',
    title: { zh: '信息可视化：设计的知觉基础（第 3 版）', en: 'Information Visualization: Perception for Design, 3rd ed.' },
    source: { zh: 'Morgan Kaufmann', en: 'Morgan Kaufmann' },
    usedFor: {
      zh: '前注意属性、视觉搜索成本，用于量化「视觉重量」模型',
      en: 'Preattentive attributes and visual search cost, used to model "visual weight"',
    },
    group: 'perception',
  },
  {
    id: 'muller-brockmann',
    authors: 'Müller-Brockmann, J.',
    year: '1981',
    title: { zh: '平面设计中的网格系统', en: 'Grid Systems in Graphic Design' },
    source: { zh: 'Niggli', en: 'Niggli' },
    usedFor: {
      zh: '模块网格的构造方法与「为什么每个位置都要有理由」的设计伦理',
      en: 'How modular grids are constructed, and the ethic that every position must be justified',
    },
    group: 'typography',
  },
  {
    id: 'bringhurst',
    authors: 'Bringhurst, R.',
    year: '2004',
    title: { zh: '排版风格的要素', en: 'The Elements of Typographic Style' },
    source: { zh: 'Hartley & Marks', en: 'Hartley & Marks' },
    usedFor: {
      zh: '45–75 字符行长区间、模块音阶、垂直节奏的经典论述',
      en: 'The 45–75 character measure, modular scales, and vertical rhythm',
    },
    group: 'typography',
  },
  {
    id: 'tinker-legibility',
    authors: 'Tinker, M. A.',
    year: '1963',
    title: { zh: '印刷可读性研究', en: 'Legibility of Print' },
    source: { zh: 'Iowa State University Press', en: 'Iowa State University Press' },
    usedFor: {
      zh: '行长与阅读速度关系的实验依据（过长导致回扫失败，过短打断语块）',
      en: 'Experimental basis for measure vs. reading speed (long lines break return sweeps, short lines break phrases)',
    },
    group: 'typography',
  },
  {
    id: 'intrinsic-design',
    authors: 'Simmons, J.',
    year: '2018',
    title: { zh: '内在式网页设计', en: 'Intrinsic Web Design' },
    source: { zh: 'An Event Apart 讲座', en: 'An Event Apart talk' },
    usedFor: {
      zh: '「让内容决定尺寸」的范式转变，以及对设备断点思维的批判',
      en: 'The shift to content-determined sizing and the critique of device-breakpoint thinking',
    },
    group: 'engineering',
  },
  {
    id: 'every-layout',
    authors: 'Bell, H.; Andrew, A.',
    year: '2019',
    title: { zh: 'Every Layout：布局原语', en: 'Every Layout: Layout Primitives' },
    source: { zh: 'everylayout.dev', en: 'everylayout.dev' },
    usedFor: {
      zh: 'Stack / Sidebar / Switcher / Cover 等算法布局原语及其阈值推导',
      en: 'Stack / Sidebar / Switcher / Cover primitives and the maths behind their thresholds',
    },
    url: 'https://every-layout.dev/',
    group: 'engineering',
  },
  {
    id: 'css-box-alignment',
    authors: 'W3C CSS WG',
    year: '2023',
    title: { zh: 'CSS 盒对齐模块 Level 3', en: 'CSS Box Alignment Module Level 3' },
    source: { zh: 'W3C 工作草案', en: 'W3C Working Draft' },
    usedFor: {
      zh: 'justify/align × content/items/self 的统一模型：对齐分配的是剩余空间',
      en: 'The unified justify/align × content/items/self model: alignment distributes leftover space',
    },
    url: 'https://www.w3.org/TR/css-align-3/',
    group: 'engineering',
  },
  {
    id: 'css-grid-2',
    authors: 'W3C CSS WG',
    year: '2023',
    title: { zh: 'CSS 网格布局模块 Level 2（subgrid）', en: 'CSS Grid Layout Module Level 2 (subgrid)' },
    source: { zh: 'W3C 候选推荐', en: 'W3C Candidate Recommendation' },
    usedFor: { zh: 'subgrid 如何解决「卡片内部跨卡片对齐」问题', en: 'How subgrid solves cross-card internal alignment' },
    url: 'https://www.w3.org/TR/css-grid-2/',
    group: 'engineering',
  },
  {
    id: 'css-containment',
    authors: 'W3C CSS WG',
    year: '2023',
    title: { zh: 'CSS 隔离模块 Level 3', en: 'CSS Containment Module Level 3' },
    source: { zh: 'W3C 工作草案', en: 'W3C Working Draft' },
    usedFor: { zh: 'contain / content-visibility 如何把布局计算限制在子树内', en: 'How contain / content-visibility scope layout work to a subtree' },
    url: 'https://www.w3.org/TR/css-contain-3/',
    group: 'engineering',
  },
  {
    id: 'css-conditional-5',
    authors: 'W3C CSS WG',
    year: '2023',
    title: { zh: 'CSS 条件规则模块 Level 5（容器查询）', en: 'CSS Conditional Rules Module Level 5 (container queries)' },
    source: { zh: 'W3C 工作草案', en: 'W3C Working Draft' },
    usedFor: { zh: '把响应式的判断依据从视口还给组件容器', en: 'Moving the responsive condition from the viewport back to the component container' },
    url: 'https://www.w3.org/TR/css-conditional-5/',
    group: 'engineering',
  },
  {
    id: 'wcag-22',
    authors: 'W3C WAI',
    year: '2023',
    title: { zh: 'WCAG 2.2 —— 1.3.2 / 1.4.10 / 2.4.3 / 2.5.8', en: 'WCAG 2.2 — 1.3.2 / 1.4.10 / 2.4.3 / 2.5.8' },
    source: { zh: 'W3C 推荐标准', en: 'W3C Recommendation' },
    usedFor: {
      zh: '有意义的序列、重排（320px / 400%）、焦点顺序、目标尺寸最小值',
      en: 'Meaningful sequence, reflow (320px / 400%), focus order, minimum target size',
    },
    url: 'https://www.w3.org/TR/WCAG22/',
    group: 'accessibility',
  },
  {
    id: 'web-vitals-cls',
    authors: 'Google Chrome team',
    year: '2020',
    title: { zh: '累计布局偏移（CLS）', en: 'Cumulative Layout Shift (CLS)' },
    source: { zh: 'web.dev / Web Vitals', en: 'web.dev / Web Vitals' },
    usedFor: { zh: 'CLS = 影响分数 × 距离分数，以及三大抖动来源', en: 'CLS = impact fraction × distance fraction, and the three sources of shift' },
    url: 'https://web.dev/articles/cls',
    group: 'accessibility',
  },
  {
    id: 'forced-reflow',
    authors: 'Irish, P.',
    year: '2011',
    title: { zh: '哪些操作会强制同步布局', en: 'What forces layout / reflow' },
    source: { zh: 'Gist（社区权威清单）', en: 'Gist (community reference list)' },
    usedFor: { zh: '读写交替造成 layout thrashing 的机制与批处理修复', en: 'How interleaved reads/writes cause layout thrashing, and the batching fix' },
    url: 'https://gist.github.com/paulirish/5d52fb081b3570c81e3a',
    group: 'engineering',
  },
  {
    id: 'tufte',
    authors: 'Tufte, E. R.',
    year: '1983',
    title: { zh: '定量信息的视觉呈现', en: 'The Visual Display of Quantitative Information' },
    source: { zh: 'Graphics Press', en: 'Graphics Press' },
    usedFor: { zh: 'data-ink ratio 思想迁移为界面的「内容-外壳比」', en: 'Transferring the data-ink ratio idea to an interface "content-chrome ratio"' },
    group: 'information',
  },
  {
    id: 'universal-principles',
    authors: 'Lidwell, W.; Holden, K.; Butler, J.',
    year: '2010',
    title: { zh: '通用设计法则', en: 'Universal Principles of Design' },
    source: { zh: 'Rockport', en: 'Rockport' },
    usedFor: { zh: '层级、对称与平衡、希克定律等法则的统一表述', en: 'Hierarchy, symmetry and balance, Hick’s law, in a unified vocabulary' },
    group: 'information',
  },
  {
    id: 'apca-contrast',
    authors: 'Somers, A. (Myndex)',
    year: '2022',
    title: { zh: 'APCA 感知对比度算法', en: 'APCA Perceptual Contrast Algorithm' },
    source: { zh: 'WCAG 3 候选方法', en: 'Candidate method for WCAG 3' },
    usedFor: { zh: '比 WCAG 2 对比度更贴近感知的层次可辨识度度量', en: 'A more perceptually accurate measure of layer distinguishability than WCAG 2 contrast' },
    group: 'accessibility',
  },
  {
    id: 'fitts-law',
    authors: 'Fitts, P. M.',
    year: '1954',
    title: { zh: '费茨定律', en: "Fitts's Law" },
    source: { zh: '实验心理学杂志', en: 'Journal of Experimental Psychology' },
    usedFor: { zh: '目标尺寸与距离决定获取时间 —— 布局中「边角是黄金位置」的依据', en: 'Target size and distance determine acquisition time — why screen edges are prime real estate' },
    group: 'perception',
  },
];

export const referenceIds = new Set(references.map((r) => r.id));
export const referenceById = new Map(references.map((r) => [r.id, r]));
