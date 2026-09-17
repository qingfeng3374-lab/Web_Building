import type { L } from '@/i18n/locales';

/**
 * 布局决策树（案例馆）。
 *
 * 回答几个问题，得出该用哪个布局原语。
 * 每个叶子都指回课程里的具体小节 —— 决策树不是替代理解，是理解之后的索引。
 */

export interface TreeNode {
  id: string;
  /** 分支节点的问题；叶子节点为空 */
  question?: L;
  /** 叶子节点的结论 */
  answer?: {
    primitive: string;
    css: string;
    why: L;
    section: string;
  };
  /** 分支：每个选项通向一个子节点 */
  options?: Array<{ label: L; next: string }>;
}

export const decisionTree: TreeNode[] = [
  {
    id: 'root',
    question: {
      zh: '这块内容需要在**两个方向**上都被安排吗？（也就是：第二行的第一个元素，要不要和第一行的第一个元素左边对齐？）',
      en: 'Does this content need arranging in **two directions**? (That is: must the first item of row two line up with the first item of row one?)',
    },
    options: [
      { label: { zh: '需要跨行对齐 → 二维', en: 'Yes, cross-row alignment → two-dimensional' }, next: 'grid-kind' },
      { label: { zh: '只需沿一个方向排列 → 一维', en: 'No, just a single direction → one-dimensional' }, next: 'flex-kind' },
      { label: { zh: '只是上下堆叠，没有横向关系', en: 'It only stacks vertically, with no horizontal relationship' }, next: 'leaf-stack' },
    ],
  },

  /* ── 二维分支 ─────────────────────────────────────────────────── */
  {
    id: 'grid-kind',
    question: {
      zh: '元素的数量与位置是**事先确定**的吗？',
      en: 'Are the number and positions of the items **known in advance**?',
    },
    options: [
      { label: { zh: '确定，且每块有固定语义（页头/侧栏/主区）', en: 'Yes, and each region has a fixed role (header / sidebar / main)' }, next: 'leaf-areas' },
      { label: { zh: '数量来自数据，位置无所谓', en: 'The count comes from data and positions do not matter' }, next: 'leaf-ram' },
      { label: { zh: '需要卡片内部跨卡片对齐', en: 'Items must align internally across cards' }, next: 'leaf-subgrid' },
    ],
  },

  /* ── 一维分支 ─────────────────────────────────────────────────── */
  {
    id: 'flex-kind',
    question: {
      zh: '尺寸由**内容**决定，还是需要在某个宽度整体切换形态？',
      en: 'Do sizes follow the **content**, or must the whole set switch form at some width?',
    },
    options: [
      { label: { zh: '内容决定（按钮、标签、面包屑）', en: 'Content decides (buttons, chips, breadcrumbs)' }, next: 'leaf-cluster' },
      { label: { zh: '一主一次，窄时堆叠', en: 'One main plus one aside, stacking when narrow' }, next: 'leaf-sidebar' },
      { label: { zh: '要么全部并排，要么全部堆叠，没有中间态', en: 'Either all in a row or all stacked — no in-between' }, next: 'leaf-switcher' },
    ],
  },

  /* ── 叶子 ─────────────────────────────────────────────────────── */
  {
    id: 'leaf-stack',
    answer: {
      primitive: 'Stack',
      css: `.stack > * + * {\n  margin-block-start: var(--flow, 1rem);\n}`,
      why: {
        zh: '纯垂直堆叠根本不需要布局模式 —— 常规流已经做对了，你只需要统一元素之间的间距。用相邻兄弟选择器而不是 margin-bottom，可以避免外边距合并，也不会在容器底部留下多余空隙。',
        en: 'Pure vertical stacking needs no layout mode at all — normal flow already does it. You only need a consistent gap between siblings. Using the adjacent-sibling selector rather than margin-bottom avoids margin collapse and leaves no stray gap at the container’s bottom edge.',
      },
      section: '1.1',
    },
  },
  {
    id: 'leaf-areas',
    answer: {
      primitive: 'Grid + areas',
      css: `.layout {\n  display: grid;\n  grid-template-columns: repeat(12, minmax(0, 1fr));\n  grid-template-areas:\n    "head head head head head head head head head head head head"\n    "side side side main main main main main main main main main";\n}`,
      why: {
        zh: '区域有固定语义时，`grid-template-areas` 的字符画就是页面地图 —— 它让布局决策变成可评审的文本，产品经理不用渲染就能读懂并提出质疑。响应式重排只需重写一段字符画，不必逐个元素改 grid-column。',
        en: 'When regions carry fixed roles, the ASCII art of `grid-template-areas` *is* the page map — it turns a layout decision into reviewable text that a product manager can read and challenge without rendering anything. Re-ranking for narrow screens means rewriting one block of art, not editing every element’s grid-column.',
      },
      section: '4.2',
    },
  },
  {
    id: 'leaf-ram',
    answer: {
      primitive: 'RAM (auto-fit + minmax)',
      css: `.grid-auto {\n  display: grid;\n  gap: var(--gap, 1.5rem);\n  grid-template-columns:\n    repeat(auto-fit, minmax(min(100%, 18rem), 1fr));\n}`,
      why: {
        zh: '列数由容器宽度自动决定，不需要任何媒体查询。`min(100%, 18rem)` 里的 `min()` 是必须的防御：容器比 18rem 还窄时（320px 手机），轨道最小值降为 100%，不会横向溢出。',
        en: 'The column count follows the container with no media query at all. The `min()` inside `min(100%, 18rem)` is a required defence: when the container is narrower than 18rem (a 320px phone) the track minimum drops to 100% and nothing overflows sideways.',
      },
      section: '6.4',
    },
  },
  {
    id: 'leaf-subgrid',
    answer: {
      primitive: 'subgrid',
      css: `.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));\n  grid-template-rows: auto 1fr auto;\n}\n@supports (grid-template-rows: subgrid) {\n  .card {\n    display: grid;\n    grid-row: span 3;\n    grid-template-rows: subgrid;\n  }\n}`,
      why: {
        zh: '标题一行还是两行，按钮都停在同一条水平线上。注意 `grid-row: span 3` 与 `grid-template-rows: subgrid` 必须成对出现，少写任何一句都不会报错，只是没有效果。',
        en: 'One-line title or two, the buttons stay on the same horizontal line. Note that `grid-row: span 3` and `grid-template-rows: subgrid` must appear together — omit either and nothing happens, silently.',
      },
      section: '4.2',
    },
  },
  {
    id: 'leaf-cluster',
    answer: {
      primitive: 'Cluster (Flex)',
      css: `.cluster {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--gap, 0.75rem);\n  align-items: center;\n}`,
      why: {
        zh: '按钮的宽度应该表达它的标签长度。用 Grid 把「确定」和「取消并返回上一步」拉成等宽，反而制造了误导 —— 等宽在这里不是一致性，是信息丢失。',
        en: 'A button’s width should express its label. Forcing “OK” and “Cancel and go back” to equal width with Grid actively misleads — equal width here is not consistency, it is information loss.',
      },
      section: '4.1',
    },
  },
  {
    id: 'leaf-sidebar',
    answer: {
      primitive: 'Sidebar',
      css: `.sidebar { display: flex; flex-wrap: wrap; gap: 2rem; }\n.sidebar > :first-child { flex-basis: 15rem; flex-grow: 1; }\n.sidebar > :last-child  { flex-basis: 0; flex-grow: 999; min-inline-size: 60%; }`,
      why: {
        zh: '堆叠阈值可以事先算出来：`W < (S + G) / (1 − M)`。取 15rem 侧栏、2rem 水槽、60% 主区下限，阈值是 680px —— 你可以拿它和实测的内容断点对比，若吻合就一条媒体查询都不用写。',
        en: 'The stacking threshold is computable in advance: `W < (S + G) / (1 − M)`. With a 15rem sidebar, a 2rem gutter and a 60% main minimum, it is 680px — compare that with your measured content breakpoint, and if they agree you need no media query at all.',
      },
      section: '6.4',
    },
  },
  {
    id: 'leaf-switcher',
    answer: {
      primitive: 'Switcher',
      css: `.switcher { display: flex; flex-wrap: wrap; gap: 1.5rem; }\n.switcher > * {\n  flex-grow: 1;\n  flex-basis: calc((32rem - 100%) * 999);\n}`,
      why: {
        zh: '`(阈值 − 100%) × 999`：容器宽于阈值时括号为负，被 clamp 到 0，所有项平分一行；窄于阈值时括号为正且极大，每项独占一行。**没有中间状态** —— 这正是「要么都并排、要么都堆叠」这类语义需要的。',
        en: '`(threshold − 100%) × 999`: above the threshold the bracket is negative, gets clamped to 0, and every item shares one line; below it the bracket is hugely positive and every item takes its own line. **There is no in-between** — which is exactly what “all together or all apart” semantics require.',
      },
      section: '6.4',
    },
  },
];

export const treeById = new Map(decisionTree.map((n) => [n.id, n]));
