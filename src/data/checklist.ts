import type { L } from '@/i18n/locales';

/**
 * 布局自检清单（案例馆）。
 *
 * 按「布局的六层」分组，每条都指回论证过它的那一小节。
 * 可勾选、可持久化、可导出 Markdown —— 设计成「上线前真的会用一遍」的形态。
 *
 * 排序有意与课程一致：**先内容，后间距，再尺度、结构、视觉、适应**。
 * 从上往下走一遍，本身就是一次分层复核。
 */

export interface CheckItem {
  id: string;
  /** 所属层 = 章节序号。与 Lesson.order 一样放宽为 number：
   *  写成联合类型只会让「加一章」多一处必须同步修改的地方。 */
  group: number;
  text: L;
  section: string;
  /** 能否被自动检测（CI 可覆盖的项） */
  automatable: boolean;
}

export const checklist: CheckItem[] = [
  /* ── 第 1 层 · 内容层 ───────────────────────────────────────── */
  { id: 'c1', group: 1, section: '1.1', automatable: true,
    text: { zh: '没有用 `overflow: hidden` 来清浮动或造 BFC（改用 `display: flow-root`）', en: 'No `overflow: hidden` used to clear floats or force a BFC (use `display: flow-root`)' } },
  { id: 'c2', group: 1, section: '1.1', automatable: true,
    text: { zh: '`position: fixed` 的祖先链上没有 `transform` / `filter` / `will-change`', en: 'No `transform` / `filter` / `will-change` on any ancestor of a `position: fixed` element' } },
  { id: 'c3', group: 1, section: '1.2', automatable: false,
    text: { zh: '长度不可预知的内容（来自接口 / 用户 / 翻译）用的是内在尺寸，没有固定高度', en: 'Content of unpredictable length (from an API, a user, a translator) uses intrinsic sizing, never a fixed height' } },
  { id: 'c4', group: 1, section: '1.2', automatable: true,
    text: { zh: '可能被压缩的网格 / 弹性子项写了 `min-inline-size: 0`（默认的 `auto` 会拒绝收缩）', en: 'Grid and flex children that may be squeezed carry `min-inline-size: 0` (the default `auto` refuses to shrink)' } },
  { id: 'c5', group: 1, section: '1.3', automatable: true,
    text: { zh: '正文行长在 45–75 字符（中文 25–40 汉字）之间', en: 'Body measure falls between 45 and 75 characters (25–40 Han characters)' } },
  { id: 'c6', group: 1, section: '1.3', automatable: false,
    text: { zh: '「紧凑模式」只压缩微观留白，宏观区块间距保持不变', en: 'Any compact mode compresses micro whitespace only; macro block gaps stay put' } },
  { id: 'c7', group: 1, section: '1.4', automatable: false,
    text: { zh: '关掉全部布局 CSS 之后，页面仍然能读、顺序仍然正确', en: 'With every layout rule switched off, the page is still readable and still in the right order' } },

  /* ── 第 2 层 · 间距层 ───────────────────────────────────────── */
  { id: 'c8', group: 2, section: '2.1', automatable: true,
    text: { zh: '组间间距 ÷ 组内间距 ≥ 2（低于 1.5 时分组读不出来）', en: 'Between-group gap ÷ within-group gap is at least 2 (below 1.5 the grouping does not read)' } },
  { id: 'c9', group: 2, section: '2.1', automatable: false,
    text: { zh: '分组优先用间距表达，其次用面色，最后才用边框', en: 'Grouping uses spacing first, then surface tint, and borders only as a last resort' } },
  { id: 'c10', group: 2, section: '2.2', automatable: true,
    text: { zh: '所有间距来自设计令牌，没有字面量（0 与 1px 边框除外）', en: 'All spacing comes from design tokens, with no literals (apart from 0 and 1px borders)' } },
  { id: 'c11', group: 2, section: '2.2', automatable: false,
    text: { zh: '每个间距档位都能说出它的唯一用途', en: 'Every step of the spacing scale has a stated, single job' } },
  { id: 'c12', group: 2, section: '2.3', automatable: true,
    text: { zh: '`line-height` 用无单位值，不用 px', en: '`line-height` is unitless, never in px' } },
  { id: 'c13', group: 2, section: '2.3', automatable: false,
    text: { zh: '垂直间距是基线单位的整数倍或半倍，没有 17px 这类目测值', en: 'Vertical gaps are whole or half multiples of the baseline unit — no eyeballed 17px' } },

  /* ── 第 3 层 · 尺度层 ───────────────────────────────────────── */
  { id: 'c14', group: 3, section: '3.1', automatable: true,
    text: { zh: '没有任何魔数宽度（如 23.7%），所有跨度用 `span n` 表达', en: 'No magic-number widths (like 23.7%); every span is expressed as `span n`' } },
  { id: 'c15', group: 3, section: '3.1', automatable: true,
    text: { zh: 'Grid 轨道写的是 `minmax(0, 1fr)` 而不是 `1fr`', en: 'Grid tracks are written `minmax(0, 1fr)`, not `1fr`' } },
  { id: 'c16', group: 3, section: '3.2', automatable: true,
    text: { zh: '已用列宽公式验算过：最窄目标视口下每一列都装得下内容', en: 'Verified with the column formula that every column fits its content at the narrowest target viewport' } },
  { id: 'c17', group: 3, section: '3.3', automatable: true,
    text: { zh: '所有字号来自音阶档位，相邻层级比值 ≥ 1.5', en: 'All type sizes come from the scale, with adjacent hierarchy levels at a ratio ≥ 1.5' } },
  { id: 'c18', group: 3, section: '3.4', automatable: false,
    text: { zh: '页面上的每一个数值都能说出它来自哪一档标尺', en: 'Every number on the page can name the scale step it came from' } },

  /* ── 第 4 层 · 结构层 ───────────────────────────────────────── */
  { id: 'c19', group: 4, section: '4.1', automatable: false,
    text: { zh: '每个布局容器都能回答「为什么是 Flex 而不是 Grid」（或反之）', en: 'Every layout container can answer “why Flex rather than Grid?” (or the reverse)' } },
  { id: 'c20', group: 4, section: '4.1', automatable: false,
    text: { zh: '没有为了修补 Flex 最后一行而插入空占位元素', en: 'No empty placeholder elements inserted to patch a Flex layout’s last row' } },
  { id: 'c21', group: 4, section: '4.2', automatable: false,
    text: { zh: '主骨架用 `grid-template-areas` 写成，非工程师读得懂', en: 'The main skeleton is written as `grid-template-areas`, readable by a non-engineer' } },
  { id: 'c22', group: 4, section: '4.3', automatable: true,
    text: { zh: '位置关系用对齐属性表达，而不是 `position: absolute` + 坐标', en: 'Positional relationships use alignment properties, not `position: absolute` with coordinates' } },
  { id: 'c23', group: 4, section: '4.4', automatable: true,
    text: { zh: '没有用 `order` / `*-reverse` / `dense` 重排有语义的内容；焦点顺序逆序对数 = 0', en: 'No `order`, `*-reverse` or `dense` reordering of meaningful content; focus-order inversions = 0' } },
  { id: 'c24', group: 4, section: '4.5', automatable: false,
    text: { zh: 'DOM 顺序 = 阅读顺序 = 业务重要度降序，三者一致', en: 'DOM order equals reading order equals descending business importance — all three agree' } },

  /* ── 第 5 层 · 视觉层 ───────────────────────────────────────── */
  { id: 'c25', group: 5, section: '5.1', automatable: false,
    text: { zh: '页面存在的理由能用一句话说清，并且那件事出现在主视区（LTR 下的左上）', en: 'The page’s reason for existing fits in one sentence, and that thing sits in the primary optical area (top-left in LTR)' } },
  { id: 'c26', group: 5, section: '5.2', automatable: false,
    text: { zh: '做过 5 秒测试：没见过这页的人能说出最重要的信息', en: 'Passed the five-second test: someone new can state the most important information' } },
  { id: 'c27', group: 5, section: '5.2', automatable: true,
    text: { zh: '视觉层级分 > 0.7，且每一级至少同时动了两根杠杆', en: 'Hierarchy score above 0.7, with every level moving at least two levers at once' } },
  { id: 'c28', group: 5, section: '5.2', automatable: false,
    text: { zh: '眯眼测试（8px 模糊）能看出 3 个明显的明暗层次，而不是一片均匀的灰', en: 'The squint test (8px blur) reveals three distinct tiers rather than a uniform grey field' } },
  { id: 'c29', group: 5, section: '5.3', automatable: true,
    text: { zh: '视觉重心偏离容器中线 < 8%（已计入阅读引力）', en: 'The visual centroid drifts less than 8% from the container midline (reading gravity included)' } },
  { id: 'c30', group: 5, section: '5.4', automatable: true,
    text: { zh: '暗色模式下层次由亮度承担，不依赖阴影', en: 'In dark mode, layering is carried by luminance rather than shadow' } },
  { id: 'c31', group: 5, section: '5.6', automatable: false,
    text: { zh: '每一处装饰都通过了「去掉它会丢信息吗」这一问', en: 'Every decoration passed the test “would removing it lose information?”' } },

  /* ── 第 6 层 · 适应层 ───────────────────────────────────────── */
  { id: 'c32', group: 6, section: '6.1', automatable: false,
    text: { zh: '每一条断点都能说出它对应的内容约束，而不是设备型号', en: 'Every breakpoint can name the content constraint behind it, not a device model' } },
  { id: 'c33', group: 6, section: '6.1', automatable: true,
    text: { zh: '断点用 `rem` 而不是 `px`，随用户默认字号缩放', en: 'Breakpoints are in `rem`, not `px`, so they scale with the user’s default font size' } },
  { id: 'c34', group: 6, section: '6.2', automatable: true,
    text: { zh: '`clamp()` 的常数项用 `rem`，不是纯 `vw`（否则浏览器缩放失效，违反 WCAG 1.4.4）', en: 'The constant term of every `clamp()` is in `rem`, not raw `vw` (otherwise zoom stops working — WCAG 1.4.4)' } },
  { id: 'c35', group: 6, section: '6.3', automatable: true,
    text: { zh: '可复用组件的响应式依据是容器查询，不是媒体查询', en: 'Reusable components base their responsiveness on container queries, not media queries' } },
  { id: 'c36', group: 6, section: '6.4', automatable: false,
    text: { zh: '能用算法布局原语解决的，没有额外写媒体查询', en: 'Nothing gets a media query that an algorithmic primitive already solves' } },
  { id: 'c37', group: 6, section: '6.5', automatable: true,
    text: { zh: '320px 宽（= 1280px 下 400% 缩放）零横向滚动；所有点击目标 ≥ 24×24px', en: 'Zero horizontal scroll at 320px (= 400% zoom at 1280px); every pointer target at least 24×24px' } },
  { id: 'c38', group: 6, section: '6.6', automatable: true,
    text: { zh: '所有媒体有尺寸或 `aspect-ratio`；骨架屏与真实内容共用同一个高度契约；CLS < 0.1', en: 'Every media element has dimensions or an `aspect-ratio`; skeletons share one height contract with the real content; CLS below 0.1' } },
  { id: 'c39', group: 6, section: '6.7', automatable: false,
    text: { zh: '涉及布局的 JS 遵循「批量读 → 算 → 批量写」；`content-visibility` 都配了 `contain-intrinsic-size`', en: 'Layout-touching JavaScript follows batch read → compute → batch write; every `content-visibility` is paired with `contain-intrinsic-size`' } },
];

/* 分组名曾经在这里硬编码一份：
     1: { zh: '第 1 层 · 内容层', ... }  …
   那是**同一份数据的第二个副本** —— 层名的真身在 content/lessons/chN.ts 的
   `layer` 字段里。两份副本迟早漂移（改了章节名忘了改这里，没有任何检查会发现）。
   现在改由案例馆页面在构建期从 lessons 派生后传进来。

   为什么不在这里直接 import '@/content'：Checklist 是客户端岛，
   那样会把六章正文（约 420KB）整个打进客户端包。 */
export interface ChecklistGroup {
  order: number;
  label: L;
}
