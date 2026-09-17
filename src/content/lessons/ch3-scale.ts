import type { Lesson } from '../types';

/**
 * 第 3 层 · 尺度层
 *
 * 上一层让页面有了结构，但尺寸还说不出理由。
 * 这一层建立两套标尺 —— 横向的网格与纵向的音阶 ——
 * 让页面上每一个数值都能被解释。
 *
 * 产出 stage3：每个位置、每个尺寸都有理由。
 */
export const ch3: Lesson = {
  slug: 'scale',
  order: 3,
  layer: { zh: '尺度层', en: 'Scale layer' },
  adds: {
    zh: '12 列网格、列宽公式、1.25 排版音阶',
    en: 'A 12-column grid, the column formula, a 1.25 type scale',
  },
  accentVar: '--ch3',
  title: { zh: '尺度层：让每个数值都有理由', en: 'The Scale Layer: Giving Every Number a Reason' },
  subtitle: {
    zh: '好布局不是「摆得好看」，是「每个位置都有理由」。',
    en: 'Good layout is not “arranged attractively” — it is “every position has a reason”.',
  },
  summary: {
    zh: '12 列网格的由来、列宽公式、排版音阶。这一层把「试出来的数字」换成「算出来的数字」—— 当同事问「为什么这张卡是这么宽」时，你的答案不该是「看着顺眼」。',
    en: 'Where twelve columns come from, the column-width formula, and the type scale. This layer replaces numbers you nudged into place with numbers you derived — so that when a colleague asks why a card is that wide, the answer is not “it looked right”.',
  },

  sections: [
    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '3.1',
      title: { zh: '从瑞士网格到 Web 网格', en: 'From the Swiss Grid to the Web Grid' },
      subtitle: {
        zh: '网格不是画在稿子上的辅助线，是一套关于「不该怎样」的纪律。',
        en: 'A grid is not a set of guides on a canvas — it is a discipline about what is *not* allowed.',
      },
      theory: ['muller-brockmann', 'universal-principles'],
      demo: {
        id: 'grid-builder',
        hint: {
          zh: '四个滑块调列数、水槽、外边距与最大宽度，D3 实时画出网格并输出可复制的 CSS。把列数从 12 调到 10 试试 —— 三等分立刻消失，你将无法做出「三卡片一排」的布局。',
          en: 'Four sliders control columns, gutter, margin and max width; D3 draws the grid live and emits copy-ready CSS. Drop the column count from 12 to 10 — thirds vanish instantly and “three cards per row” becomes impossible.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '从 stage2 出发：一个答不上来的问题', en: 'Starting from stage2: a question you cannot answer' } },
        {
          t: 'p',
          text: {
            zh: '上一层的卡片用的是 `flex: 1 1 8rem`。它工作得不错 —— 宽容器排四张、窄容器排两张。但如果有人问「为什么是 8rem」，你答不上来。8rem 是试出来的：试到四张一排刚好不换行。',
            en: 'The cards from the previous layer use `flex: 1 1 8rem`. It works well enough — four per row in a wide container, two in a narrow one. But if someone asks “why 8rem?”, you have no answer. It was nudged: nudged until four fitted without wrapping.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '这不是懒惰，这是**没有系统时的理性行为**。当没有任何可依据的规则，试错就是唯一可行的办法。网格系统的全部价值，就是把「试出来」换成「算出来」。',
            en: 'That is not laziness — it is **rational behaviour in the absence of a system**. With no rule to appeal to, trial and error is the only available method. The entire value of a grid system is replacing “nudged into place” with “derived”.',
          },
        },

        { t: 'h', text: { zh: '理论：Müller-Brockmann 的模块网格', en: 'Theory: Müller-Brockmann’s modular grid' } },
        {
          t: 'quote',
          text: {
            zh: '使用网格系统意味着：设计师愿意服从可被理解、可被推导的法则；意味着设计是可以被解释、被复现、被客观分析的。',
            en: 'To use the grid system is to submit to laws that are universally understandable; it means design that is explicable, reproducible, and open to objective analysis.',
          },
          cite: { zh: 'Müller-Brockmann, J.《平面设计中的网格系统》(1981)', en: 'Müller-Brockmann, J., Grid Systems in Graphic Design (1981)' },
        },
        {
          t: 'p',
          text: {
            zh: '注意「可被解释」这个词。它意味着：**当同事问「为什么这张卡片是这么宽」时，你必须能回答，而且答案不能是「看着顺眼」。** 这就是网格对工程团队的真正价值 —— 它把布局争论从审美层面拉到规则层面。',
            en: 'Note the word *explicable*. It means: **when a colleague asks why a card is that wide, you must be able to answer — and the answer cannot be “it looked right”.** That is the real value of a grid to an engineering team: it moves layout arguments off taste and onto rules.',
          },
        },

        { t: 'h', text: { zh: '印刷网格与 Web 网格的根本差异', en: 'How web grids differ from print grids, fundamentally' } },
        {
          t: 'table',
          head: [
            { zh: '维度', en: 'Dimension' },
            { zh: '印刷', en: 'Print' },
            { zh: 'Web', en: 'Web' },
            { zh: '后果', en: 'Consequence' },
          ],
          rows: [
            [
              { zh: '画布尺寸', en: 'Canvas size' },
              { zh: '固定（A4 就是 A4）', en: 'Fixed (A4 is A4)' },
              { zh: '连续可变（320–3840px）', en: 'Continuous (320–3840px)' },
              { zh: 'Web 的列宽必须是**函数**，不是常数', en: 'Web column width must be a **function**, not a constant' },
            ],
            [
              { zh: '内容长度', en: 'Content length' },
              { zh: '排版时已知', en: 'Known at typesetting' },
              { zh: '运行时才知道', en: 'Known only at runtime' },
              { zh: '必须为「比预期长」留余地（第 1.2 节）', en: 'You must leave room for “longer than expected” (§1.2)' },
            ],
            [
              { zh: '读者', en: 'Reader' },
              { zh: '被动接受版面', en: 'Accepts the layout' },
              { zh: '可缩放、可改字号、可竖屏', en: 'Can zoom, resize text, rotate' },
              { zh: '网格必须容忍被读者改变（第 6 层）', en: 'The grid must tolerate reader intervention (layer six)' },
            ],
          ],
        },
        {
          t: 'note',
          text: {
            zh: '**这张表解释了一个常见困惑**：为什么把 Figma 里完美的 1440px 设计稿实现出来，在同事的 1280px 笔记本上就不对了？因为设计稿是印刷思维的产物（固定画布），而实现必须是函数思维。第 6 层会把这件事彻底解决。',
            en: '**This table explains a common frustration**: why does a pixel-perfect 1440px Figma file fall apart on a colleague’s 1280px laptop? Because the mockup is a print-thinking artefact (fixed canvas) while the implementation must be function-thinking. Layer six settles this completely.',
          },
        },

        { t: 'h', text: { zh: '为什么是 12 列', en: 'Why twelve columns' } },
        {
          t: 'p',
          text: {
            zh: '12 不是传统，是**约数最多的小整数**。12 = 2×6 = 3×4 = 12×1，所以 12 列网格可以干净地切成：',
            en: 'Twelve is not tradition — it is **the small integer with the most divisors**. 12 = 2×6 = 3×4 = 12×1, so a 12-column grid divides cleanly into:',
          },
        },
        {
          t: 'ul',
          items: [
            { zh: '2 等分（6+6）—— 主次双栏', en: '2 equal parts (6+6) — primary/secondary split' },
            { zh: '3 等分（4+4+4）—— 三卡片一排', en: '3 equal parts (4+4+4) — three cards per row' },
            { zh: '4 等分（3+3+3+3）—— KPI 行', en: '4 equal parts (3+3+3+3) — a KPI row' },
            { zh: '非对称（8+4、9+3）—— 主内容 + 侧栏', en: 'Asymmetric (8+4, 9+3) — main plus sidebar' },
          ],
        },
        {
          t: 'p',
          text: {
            zh: '对比一下：10 列只能切 2 和 5，做不出三等分；16 列能切 2/4/8，也做不出三等分。**12 是唯一一个同时支持二分、三分、四分的小数字** —— 这就是它统治了几乎所有设计系统的原因。',
            en: 'Compare: ten columns divide only by 2 and 5 — no thirds. Sixteen divides by 2/4/8 — still no thirds. **Twelve is the only small number that supports halves, thirds and quarters at once** — which is why it dominates virtually every design system.',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：网格的作用不是告诉你「可以放在哪」，而是告诉你「**不可以放在哪**」。一个允许任意宽度的系统等于没有系统。**约束才是网格的产品。**',
            en: '**One line to take away**: a grid does not tell you where things *may* go — it tells you where they **may not**. A system that permits any width is not a system. **Constraint is what a grid actually delivers.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: '12 列网格的最小实现', en: 'The minimal 12-column grid' },
          purpose: {
            zh: '整个网格系统只需要这三行。注意 `minmax(0, 1fr)` 里的 `0` —— 它不是可选的。',
            en: 'The entire grid system is three lines. Note the `0` inside `minmax(0, 1fr)` — it is not optional.',
          },
          code: `.grid-12 {
  display: grid;
  gap: var(--grid-gutter);
  grid-template-columns: repeat(12, minmax(0, 1fr));
}`,
          highlight: [4],
          key: {
            zh: '**关键点：为什么必须是 `minmax(0, 1fr)` 而不是 `1fr`。** `1fr` 的完整含义是 `minmax(auto, 1fr)`，而 `auto` 作为最小值等于 `min-content` —— 也就是第 1.2 节讲过的那个默认值。一旦某个单元格里有长 URL 或不可断词，这一列就会被撑破，整个网格溢出容器。**这是 Grid 最经典、也最难自己查出来的溢出原因**，而它的解法我们在第 1 层就已经学过了。',
            en: '**Key point: why it must be `minmax(0, 1fr)` and not `1fr`.** `1fr` means `minmax(auto, 1fr)`, and `auto` as a minimum resolves to `min-content` — the very default discussed in §1.2. The moment a cell contains a long URL or an unbreakable string, the track blows past its share and the whole grid overflows. **This is the classic Grid overflow and the hardest to diagnose** — and we learned its fix back in layer one.',
          },
        },
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'stage2 → stage3：卡片宽度的改写', en: 'stage2 → stage3: rewriting the card width' },
          purpose: { zh: '左边是试出来的，右边是推导出来的。功能几乎一样，可维护性天差地别。', en: 'Left: nudged into place. Right: derived. Nearly identical result, incomparable maintainability.' },
          code: `/* stage2：能用，但说不出「8rem 是哪来的」 */
.kpi { flex: 1 1 8rem; }

/* stage3：占 3 列 = 12/4，语义明确，容器变宽变窄都成立 */
.dash__kpis { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); }
.kpi        { grid-column: span 3; }`,
          highlight: [6],
          key: {
            zh: '**关键点**：`span 3` 携带了 `8rem` 完全没有的信息 —— **意图**。读到 `span 3` 的人立刻知道「这是四分之一幅」，读到 `8rem` 的人只能猜。**代码的可读性不只是命名，也包括数值是否自解释。**',
            en: '**Key point**: `span 3` carries information `8rem` simply does not — **intent**. Anyone reading `span 3` immediately knows “a quarter of the width”; anyone reading `8rem` can only guess. **Readability is not just naming — it is also whether your numbers explain themselves.**',
          },
        },
        {
          t: 'code',
          lang: 'css',
          file: { zh: '容器：把网格钉在页面中间', en: 'The container: centring the grid on the page' },
          purpose: { zh: '网格需要一个有最大宽度、有外边距的容器。', en: 'A grid needs a container with a max width and side margins.' },
          code: `.center {
  box-sizing: content-box;          /* ← 让 max-inline-size 只约束内容 */
  max-inline-size: var(--grid-max); /* 1440px */
  margin-inline: auto;
  padding-inline: var(--gutter, var(--space-5));
}`,
          highlight: [2],
          key: {
            zh: '**关键点**：`box-sizing: content-box` 在这里是刻意的，而且与全局的 `border-box` 相反。原因：我们希望 `max-inline-size: 1440px` 表示「**内容区**最宽 1440」，两侧的 padding 是额外加上去的呼吸空间。如果用 `border-box`，1440 会把 padding 算进去，内容区实际只有 1392px，和设计稿对不上。**全局规则也有该被局部推翻的时候，前提是你说得出理由。**',
            en: '**Key point**: `box-sizing: content-box` here is deliberate, and it deliberately contradicts the global `border-box`. Why: we want `max-inline-size: 1440px` to mean “the **content area** is at most 1440”, with side padding added outside it. Under `border-box` the 1440 would swallow the padding and the real content area would be 1392px — off by enough to miss the mockup. **Global rules can be overridden locally, provided you can state the reason.**',
          },
          pitfall: {
            zh: '不要在 `.center` 上再写 `width: 100%`。`max-inline-size` 已经保证了「不超过 1440」，而块级元素默认就撑满可用宽度。多写的 `width: 100%` 在 `content-box` 下会让元素总宽变成 `100% + padding`，直接横向溢出。',
            en: 'Do not add `width: 100%` to `.center`. `max-inline-size` already caps it at 1440, and block elements fill the available width by default. The extra `width: 100%` under `content-box` makes the total width `100% + padding` — instant horizontal overflow.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '3.2',
      title: { zh: '列宽数学与「占几列」', en: 'Column Maths and “How Many Columns”' },
      subtitle: {
        zh: '列宽是一个关于视口宽度的函数。知道这个函数，才能预判布局什么时候会坏。',
        en: 'Column width is a function of viewport width. Know the function and you can predict where the layout will break.',
      },
      theory: ['muller-brockmann', 'bringhurst'],
      demo: {
        id: 'column-math',
        hint: {
          zh: '拖动视口宽度，D3 同步画出列宽曲线与「此宽度下卡片应占几列」的阶梯函数。把「内容最小需求宽度」调到 247（案例里最长的学院名），看内容断点落在哪 —— 那个数字会在第 6 层再次出现。',
          en: 'Drag the viewport width; D3 plots the column-width curve alongside the step function for “how many columns this card should span”. Set the minimum content width to 247 (the longest school name in the case) and read off the content breakpoint — that number returns in layer six.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '「占几列」不该靠目测', en: '“How many columns” should not be eyeballed' } },
        {
          t: 'p',
          text: {
            zh: '上一节把页面切成了 12 列。但切完之后立刻有一个新问题：**一张卡片该占几列？**',
            en: 'The previous section cut the page into twelve columns. Which immediately raises a new question: **how many of them should a card occupy?**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '常见的做法是在浏览器里试 —— span 3 太挤，span 4 看着差不多，就定 4。这跟上一节批评的「8rem 是试出来的」是同一个毛病，只是换了个单位。**要把它变成算出来的，只需要知道一列到底有多宽。**',
            en: 'The usual method is trial in the browser: span 3 feels cramped, span 4 looks about right, so span 4 it is. That is the same failing the previous section criticised in “8rem was arrived at by trying”, just in different units. **To make it computable, you only need to know how wide one column actually is.**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '给定视口宽 `W`、外边距 `M`、列数 `n`、水槽 `G`，一列的宽度是：',
            en: 'Given viewport width `W`, side margin `M`, column count `n` and gutter `G`, one column is:',
          },
        },
        { t: 'code', lang: 'text', code: `col = ( min(W, MAX) − 2M − (n − 1)·G ) / n` },
        {
          t: 'p',
          text: {
            zh: '一个跨 `k` 列的元素，宽度是 `k·col + (k−1)·G` —— 注意跨列时**把中间的水槽也吃掉了**，这是最容易算错的地方。',
            en: 'An element spanning `k` columns is `k·col + (k−1)·G` wide — note that spanning **swallows the gutters in between**. This is the step people get wrong most often.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '代入本站的参数（MAX=1440, M=32, G=24, n=12）：在 1440px 视口下 `col = (1440 − 64 − 264)/12 = 92.67px`；一张 3 列卡片宽 `3×92.67 + 2×24 = 326px`。**这就是为什么 KPI 卡片在宽屏下看起来「刚好」—— 不是调出来的，是算出来的。**',
            en: 'Plug in this site’s values (MAX=1440, M=32, G=24, n=12): at a 1440px viewport, `col = (1440 − 64 − 264)/12 = 92.67px`, and a 3-column card is `3×92.67 + 2×24 = 326px`. **That is why the KPI cards look “just right” on a wide screen — not tuned, computed.**',
          },
        },

        { t: 'h', text: { zh: '反过来用：从内容推列数', en: 'Running it backwards: from content to column count' } },
        {
          t: 'p',
          text: {
            zh: '实践中更有用的是反向问题：**这块内容需要占几列？** 判据来自内容本身，而不是设计稿：',
            en: 'The more useful question in practice is the inverse: **how many columns does this block need?** The answer comes from the content, not the mockup:',
          },
        },
        {
          t: 'table',
          head: [
            { zh: '内容类型', en: 'Content type' },
            { zh: '约束来自', en: 'Constraint comes from' },
            { zh: '典型跨列', en: 'Typical span' },
            { zh: '理由', en: 'Reason' },
          ],
          rows: [
            [
              { zh: '正文段落', en: 'Body paragraph' },
              { zh: '行长 45–75ch', en: 'Measure 45–75ch' },
              { zh: '6–8 列', en: '6–8 columns' },
              { zh: '再宽就超出舒适区（第 1.3 节）', en: 'Wider leaves the comfort zone (§1.3)' },
            ],
            [
              { zh: '折线 / 柱状图', en: 'Line / bar chart' },
              { zh: '最少可分辨刻度数', en: 'Minimum distinguishable ticks' },
              { zh: '5–7 列', en: '5–7 columns' },
              { zh: '窄于 ~320px 时刻度标签会重叠', en: 'Below ~320px the tick labels collide' },
            ],
            [
              { zh: 'KPI 数字卡', en: 'KPI number card' },
              { zh: '最长数字 + 标签的宽度', en: 'Longest value plus its label' },
              { zh: '3 列', en: '3 columns' },
              { zh: '内容很短，再宽就是浪费', en: 'The content is short; wider is waste' },
            ],
            [
              { zh: '数据表', en: 'Data table' },
              { zh: '列数 × 最小列宽', en: 'Columns × minimum column width' },
              { zh: '8–12 列', en: '8–12 columns' },
              { zh: '装不下就横向滚动，不要压缩字号', en: 'If it will not fit, scroll it — do not shrink the type' },
            ],
          ],
        },
        {
          t: 'note',
          text: {
            zh: '**注意最后一行。** 数据表装不下时，正确的做法是把它放进一个横向滚动容器，而不是把字号压到 10px 或者把列藏起来。这是全站唯一允许横向滚动的场景 —— 第 6.5 节会解释为什么它不违反 WCAG 1.4.10。',
            en: '**Note the last row.** When a table will not fit, the right answer is a horizontally scrollable container — not 10px type and not hidden columns. This is the one place horizontal scrolling is allowed; §6.5 explains why it does not violate WCAG 1.4.10.',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：列宽公式的真正用途不是排版，是**预测**。知道了 `col(W)`，你可以在写代码之前就算出「什么宽度下内容会装不下」，而不是等测试同学在某台笔记本上发现它。',
            en: '**One line to take away**: the point of the column formula is not typesetting, it is **prediction**. Once you know `col(W)`, you can compute where content stops fitting *before* you write the code — instead of finding out when a tester opens it on some laptop.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'ts',
          file: { zh: '把公式写成函数（本站真实使用）', en: 'The formula as code (used by this site)' },
          purpose: { zh: '有了这个函数，「多宽的视口会让卡片装不下内容」就是一行断言，可以写进单元测试。', en: 'With this function, “at what width does the card stop fitting?” becomes a one-line assertion you can put in a unit test.' },
          code: `export interface GridSpec {
  columns: number; gutter: number; margin: number; max: number;
}

/** 单列宽度 */
export function columnWidth(viewport: number, g: GridSpec): number {
  const inner = Math.min(viewport, g.max) - g.margin * 2;
  return (inner - (g.columns - 1) * g.gutter) / g.columns;
}

/** 跨 k 列的元素宽度（注意要把中间的水槽加回来） */
export function spanWidth(k: number, viewport: number, g: GridSpec): number {
  return k * columnWidth(viewport, g) + (k - 1) * g.gutter;
}

/** 反问：要装下 minContent 像素，至少要跨几列？ */
export function spanFor(minContent: number, viewport: number, g: GridSpec): number {
  for (let k = 1; k <= g.columns; k++) {
    if (spanWidth(k, viewport, g) >= minContent) return k;
  }
  return g.columns;
}`,
          highlight: [13, 18],
          key: {
            zh: '**关键点**：`spanWidth` 里的 `(k - 1) * g.gutter` 是新手最常漏的一项。漏掉它会让你低估跨列元素的宽度，于是在设计稿里看着装得下的内容，实现出来反而有富余 —— 然后有人会用负 margin 去「修正」，把网格彻底搞乱。',
            en: '**Key point**: the `(k - 1) * g.gutter` term in `spanWidth` is the one people forget. Omit it and you underestimate the width of spanning elements, so content that looked tight in the mockup ends up with slack — at which point someone “corrects” it with a negative margin and the grid is gone.',
          },
        },
        {
          t: 'code',
          lang: 'ts',
          file: { zh: '用它写一条断言', en: 'Turning it into an assertion' },
          purpose: { zh: '布局是可以被单元测试的 —— 前提是你先把它变成函数。', en: 'Layout can be unit-tested — once you have turned it into a function.' },
          code: `import { expect, test } from 'vitest';
import { spanWidth } from '@/lib/grid';

const GRID = { columns: 12, gutter: 24, margin: 32, max: 1440 };

test('KPI 卡片在 1024px 下能装下最长的学院名', () => {
  const LONGEST_LABEL_PX = 247;   // 用 canvas.measureText 量出来的
  const cardInner = spanWidth(3, 1024, GRID) - 24; // 减去卡片自身内边距
  expect(cardInner).toBeGreaterThanOrEqual(LONGEST_LABEL_PX);
});`,
          highlight: [7, 9],
          key: {
            zh: '**关键点**：`247` 这个数字必须**量出来**，不能拍脑袋 —— 用 `canvas.measureText()` 在真实字体下测。**响应式设计的严谨程度，取决于这类输入数字的来源是否可追溯。** 这条断言在本站的测试里是真实存在的，它也是第 6.1 节「内容断点」的基础。',
            en: '**Key point**: the number `247` must be **measured**, not guessed — with `canvas.measureText()` in the real font. **The rigour of a responsive design depends entirely on whether inputs like this are traceable.** This assertion really exists in this site’s test suite, and it is the basis for §6.1’s content breakpoints.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '3.3',
      title: { zh: '排版音阶：纵向的标尺', en: 'The Type Scale: A Ruler for the Other Axis' },
      subtitle: {
        zh: '字号不是一个一个挑出来的，是一个比率生成出来的。',
        en: 'Type sizes are not picked one by one — they are generated by a ratio.',
      },
      theory: ['bringhurst', 'universal-principles'],
      demo: {
        id: 'type-scale',
        hint: {
          zh: '选择比率（1.125 到 φ），D3 画出音阶柱状图与比值标注，下方实时预览字号阶梯并输出 CSS 变量。注意「隔两档比值」那一栏 —— 它决定了你能做出几级清晰的层级。',
          en: 'Pick a ratio (1.125 up to φ) and D3 plots the scale with ratio annotations, previewing the type ladder live and emitting CSS variables. Watch the “three-step ratio” readout — it decides how many clear hierarchy levels you can build.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '横向有标尺，纵向也该有', en: 'The horizontal axis has a scale; so should the vertical' } },
        {
          t: 'p',
          text: {
            zh: '第 2.2 节给了间距一套标尺，第 3.1 节给了宽度一套网格。还剩一个维度没有规则：**字号**。',
            en: 'Section 2.2 gave spacing a scale; §3.1 gave width a grid. One dimension still has no rule: **type size**.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '问题和间距完全一样：如果字号是一个一个挑的，你会得到 `11 / 12 / 13 / 14 / 15 / 18 / 20 / 24px` 这种序列 —— 13 和 14 之间的差别谁也看不出来，但它们让整个系统多了一个无意义的分支。',
            en: 'The problem is identical to spacing: pick sizes one at a time and you end up with `11 / 12 / 13 / 14 / 15 / 18 / 20 / 24px` — nobody can see the difference between 13 and 14, yet the pair adds a meaningless branch to the system.',
          },
        },

        { t: 'h', text: { zh: '模块音阶：一个比率生成整套字号', en: 'The modular scale: one ratio generates the whole set' } },
        {
          t: 'p',
          text: {
            zh: '选一个基准字号 `base` 和一个比率 `r`，第 n 档的字号就是 `base × rⁿ`。Bringhurst 从音乐音程里借来了一组常用比率：',
            en: 'Pick a base size and a ratio `r`; step *n* is `base × rⁿ`. Bringhurst borrowed a set of familiar ratios from musical intervals:',
          },
        },
        {
          t: 'table',
          head: [
            { zh: '比率', en: 'Ratio' },
            { zh: '名称', en: 'Name' },
            { zh: '特征', en: 'Character' },
            { zh: '适用', en: 'Good for' },
          ],
          rows: [
            [{ zh: '1.125', en: '1.125' }, { zh: '大二度', en: 'Major second' }, { zh: '极细腻，层级多但对比弱', en: 'Very fine; many levels, weak contrast' }, { zh: '信息密集的后台系统', en: 'Dense back-office systems' }],
            [{ zh: '1.200', en: '1.200' }, { zh: '小三度', en: 'Minor third' }, { zh: '稳健', en: 'Steady' }, { zh: '文档站、长文', en: 'Docs and long-form' }],
            [{ zh: '**1.250**', en: '**1.250**' }, { zh: '**大三度**', en: '**Major third**' }, { zh: '**平衡点**', en: '**The balance point**' }, { zh: '**通用界面（本站选它）**', en: '**General interfaces (this site’s choice)**' }],
            [{ zh: '1.333', en: '1.333' }, { zh: '完全四度', en: 'Perfect fourth' }, { zh: '对比明显', en: 'Clear contrast' }, { zh: '营销页、落地页', en: 'Marketing and landing pages' }],
            [{ zh: '1.618', en: '1.618' }, { zh: '黄金比', en: 'Golden ratio' }, { zh: '戏剧性强，但档位很快变得过大', en: 'Dramatic, but sizes explode quickly' }, { zh: '封面、海报', en: 'Covers and posters' }],
          ],
        },
        {
          t: 'p',
          text: {
            zh: '本站选 1.25：从 16px 出发得到 `16 → 20 → 25 → 31 → 39 → 49`。注意这些数字**自动满足下一层的层级要求** —— 相邻两档比值 1.25（可辨），隔一档 1.56（明显），隔两档 1.95（≈2 倍，强对比）。**这个 2 倍，和第 2.1 节的分组比值 2 是同一个阈值。**',
            en: 'This site uses 1.25: from 16px that gives `16 → 20 → 25 → 31 → 39 → 49`. Note these numbers **automatically satisfy the hierarchy requirement of the next layer** — adjacent steps differ by 1.25 (perceptible), two steps by 1.56 (obvious), three steps by 1.95 (≈2×, strong). **That factor of two is the same threshold as §2.1’s grouping ratio.**',
          },
        },
        {
          t: 'note',
          text: {
            zh: '**关于黄金比的祛魅**：φ ≈ 1.618 在屏幕上很难用。从 16px 出发第 4 档就是 110px —— 在 1440px 宽的页面上这个字号只能放三四个字。黄金比在海报和书籍封面上有效，是因为那些媒介的尺寸固定且巨大。**「黄金比最美」是一个被过度传播的说法，在界面设计里它经常是错的选择。**',
            en: '**Demystifying the golden ratio**: φ ≈ 1.618 is hard to use on screen. From 16px, step 4 is already 110px — on a 1440px page that fits three or four words. The golden ratio works on posters and book covers because those media are large and fixed. **“The golden ratio is the most beautiful” is an over-transmitted claim; in interface design it is frequently the wrong choice.**',
          },
        },

        { t: 'h', text: { zh: '音阶档位 ≠ 层级数', en: 'Scale steps are not hierarchy levels' } },
        {
          t: 'p',
          text: {
            zh: '音阶提供 6–8 个档位，但这不意味着页面有 8 级层级。**档位是词汇表，层级是语法**：',
            en: 'A scale offers six to eight steps, but that does not mean the page has eight levels. **Steps are the vocabulary; levels are the grammar**:',
          },
        },
        {
          t: 'ul',
          items: [
            { zh: '`--step--2` / `--step--1`：辅助信息（标签、脚注、图例）', en: '`--step--2` / `--step--1`: ancillary text (labels, footnotes, legends)' },
            { zh: '`--step-0`：正文，页面 90% 的文字', en: '`--step-0`: body — 90% of the words on the page' },
            { zh: '`--step-1` / `--step-2`：小标题、次级强调', en: '`--step-1` / `--step-2`: sub-headings, secondary emphasis' },
            { zh: '`--step-3` 以上：每页最多出现一到两次', en: '`--step-3` and above: at most once or twice per page' },
          ],
        },
        {
          t: 'p',
          text: {
            zh: '也就是说，**8 个档位服务于 3 个层级**，其中大部分档位用于同一层级内部的微调。「为什么只有 3 级」是第 5.2 节的话题 —— 这一层只负责把词汇表准备好。',
            en: 'In other words, **eight steps serve three levels**, with most of the steps used for fine distinctions *inside* a level. Why only three levels is §5.2’s topic — this layer only prepares the vocabulary.',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：音阶把「这里该多大」从一个审美问题变成了一个**选档问题**。选档只有 8 个选项，而且选错了也不会破坏系统 —— 这是它比「自由选择字号」优越的全部原因。',
            en: '**One line to take away**: a scale turns “how big should this be?” from an aesthetic question into a **step-selection** question. There are only eight options, and picking the wrong one does not break the system. That is the entire argument against choosing sizes freely.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'ts',
          file: { zh: '生成音阶（构建期跑一次）', en: 'Generating the scale (runs once at build time)' },
          purpose: { zh: '手写 8 个档位容易出错，且改比率要重算全部。生成它。', en: 'Hand-writing eight steps is error-prone, and changing the ratio means recomputing all of them. Generate instead.' },
          code: `interface ScaleOptions {
  baseMin: number;   // 小视口下的基准字号 (px)
  baseMax: number;   // 大视口下的基准字号 (px)
  ratioMin: number;  // 小视口下的比率（更小，省空间）
  ratioMax: number;  // 大视口下的比率（更大，层级更明显）
  steps: number[];   // 例如 [-2, -1, 0, 1, 2, 3, 4, 5]
}

export function typeScale(o: ScaleOptions): Record<string, string> {
  const out: Record<string, string> = {};
  for (const n of o.steps) {
    const min = o.baseMin * o.ratioMin ** n;
    const max = o.baseMax * o.ratioMax ** n;
    out[\`--step-\${n}\`] = fluid(min, max);   // fluid() 见第 6.2 节
  }
  return out;
}`,
          highlight: [4, 5],
          key: {
            zh: '**关键点：小视口用更小的比率。** 手机上 `--step-4` 如果按 1.25 算是 39px，在 375px 宽的屏幕上会占掉三分之一的行；而小视口本来就不需要那么强的层级对比（内容是单列的，位置本身已经提供了层级）。**「响应式排版」不只是字号变小，是整条音阶的比率都变小** —— 这是绝大多数流体排版实现漏掉的一步，第 6.2 节会把它画出来。',
            en: '**Key point: use a smaller ratio on small viewports.** At 1.25, `--step-4` is 39px — on a 375px screen that eats a third of the line. And a small viewport needs less hierarchical contrast anyway: the content is a single column, so position already carries the hierarchy. **Responsive typography is not just smaller sizes — it is a smaller ratio across the whole scale.** Most fluid-type implementations miss this; §6.2 plots it.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '3.4',
      title: { zh: '案例：套上尺度', en: 'Case: Fitting the Scales' },
      subtitle: {
        zh: 'stage2 → stage3。所有「试出来的数字」被换成「算出来的数字」。',
        en: 'stage2 → stage3. Every nudged number becomes a derived one.',
      },
      theory: ['muller-brockmann', 'bringhurst'],
      caseStage: 'stage3',
      demo: {
        id: 'case-s3',
        hint: {
          zh: '对比 stage2 与 stage3，然后打开「12 列网格」叠加 —— 每张卡片的左右边界都精确落在列轨道上。这不是对齐工具调出来的，是 `span 3` 算出来的。',
          en: 'Compare stage2 with stage3, then turn on the 12-column overlay — every card edge lands exactly on a track. That was not achieved with an alignment tool; it was computed by `span 3`.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '这一层做了什么', en: 'What this layer did' } },
        {
          t: 'p',
          text: {
            zh: '这一章要解决的是「答不上来为什么是 8rem」。三套标尺建立之后，案例上的每一个数值都能回答这个问题了。',
            en: 'This chapter set out to fix “I cannot say why it is 8rem”. With three scales in place, every number in the case can now answer that question.',
          },
        },
        {
          t: 'ol',
          items: [
            { zh: '容器：`max-inline-size: 1440px`，外边距 32px，水槽 24px（3.1）', en: 'Container: `max-inline-size: 1440px`, 32px margin, 24px gutter (§3.1)' },
            { zh: '卡片：`flex: 1 1 8rem` → `grid-column: span 3`，跨列关系显式化（3.1 + 3.2）', en: 'Cards: `flex: 1 1 8rem` → `grid-column: span 3`, spans made explicit (§3.1 + §3.2)' },
            { zh: '字号：全部改用音阶档位，不再有任意值（3.3）', en: 'Type: every size moves to a scale step; no arbitrary values remain (§3.3)' },
          ],
        },

        { t: 'h', text: { zh: '为什么「取值种类数」反而涨了', en: 'Why “distinct values” went up, not down' } },
        {
          t: 'p',
          text: {
            zh: '这一层负责的指标是**取值种类数**，它从 7 涨到了 17。看起来像是退步 —— 但不是。',
            en: 'The metric this layer owns is **distinct values**, and it rose from 7 to 17. That looks like a regression. It is not.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '区别在于**这 17 个数值的性质**：stage2 的 7 个是零散的、各自为政的；stage3 的 17 个全部来自两套标尺（9 档间距 + 8 档音阶），**每一个都能说出它是第几档、为什么选那一档**。',
            en: 'The difference is **what kind of numbers they are**: stage2’s seven were scattered and independent; stage3’s seventeen all come from two scales (nine spacing steps plus eight type steps), and **every one of them can say which step it is and why that step was chosen**.',
          },
        },
        {
          t: 'note',
          text: {
            zh: '**这也说明了一个指标的局限**：「取值种类数」衡量的是收敛程度，但它分不清「17 个有系统的值」和「17 个随手写的值」。任何单一指标都有这种盲区 —— 这正是本课程用六项指标而不是一项综合分的原因。**度量工具要能被质疑，才值得信任。**',
            en: '**This also exposes a limit of the metric**: “distinct values” measures convergence but cannot tell seventeen systematic values from seventeen ad-hoc ones. Every single metric has a blind spot like this — which is exactly why this course tracks six metrics rather than one composite score. **A measuring instrument is only trustworthy if it can be questioned.**',
          },
        },

        { t: 'h', text: { zh: '下一层要解决什么', en: 'What the next layer solves' } },
        {
          t: 'p',
          text: {
            zh: '现在每个尺寸都有理由了，但页面整体还只是**从上到下的一串区块**。趋势图和分布图并排会更好读，操作按钮应该待在右下角 —— 这些都需要在**二维平面**上安排，而不是一维地堆叠。',
            en: 'Every size has a reason now, but the page as a whole is still **a vertical stack of blocks**. The trend and breakdown charts would read better side by side; the action buttons belong in the bottom-right — and all of that requires arranging things on a **plane**, not stacking them along a line.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '第 4 层会给它一副骨架，而且这副骨架会是**写在 CSS 里、可以被产品经理读懂的文本**。',
            en: 'Layer four gives it a skeleton — and that skeleton will be **text in the CSS that a product manager can read**.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'stage2 → stage3 完整 diff', en: 'The complete stage2 → stage3 diff' },
          purpose: { zh: '依然是纯粹的「加」。上一层的 flex 与 gap 全部保留，只是卡片宽度换了来源。', en: 'Still purely additive. The previous layer’s flex and gaps all survive; only where the card width comes from has changed.' },
          code: `/* ─────────── 新增 ─────────── */
+ .dash {
+   max-inline-size: var(--grid-max);   /* 1440px */
+   margin-inline: auto;
+ }
+ .dash__kpis {
+   display: grid;                                        /* 覆盖上一层的 flex */
+   grid-template-columns: repeat(12, minmax(0, 1fr));
+ }
+ .kpi        { grid-column: span 3; }                    /* 12 / 4 */
+ .kpi__value { font-size: var(--step-1); }               /* 音阶档位 */
+ .dash__title{ font-size: var(--step-2); }`,
          highlight: [7, 10, 11],
          key: {
            zh: '**关键点**：第 7 行是全课程唯一一处「后一层覆盖前一层」的地方 —— `display: grid` 覆盖了 stage2 的 `display: flex`。**这是一个诚实的例外，值得说明**：从「一维堆叠」升级到「二维网格」确实是换引擎，不是加规则。第 4.1 节会解释为什么这次换是必要的，以及怎么判断什么时候该换。**能做到「只加不改」当然最好，但当结构本身升级时，覆盖是正当的 —— 前提是你说得清为什么。**',
            en: '**Key point**: line 7 is the only place in the entire course where a later layer overrides an earlier one — `display: grid` replaces stage2’s `display: flex`. **This is an honest exception worth naming**: going from one-dimensional stacking to a two-dimensional grid genuinely is an engine change, not an added rule. Section 4.1 explains why this particular change is necessary and how to tell when one is. **Additive-only is the ideal, but when the structure itself is upgraded, overriding is legitimate — provided you can say why.**',
          },
        },
      ],
    },
  ],
};
