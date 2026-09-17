import type { Lesson } from '../types';

/**
 * 第 4 层 · 结构层
 *
 * 前三层都在一维上做事：内容、间距、尺度。
 * 这一层第一次在**二维平面**上安排东西，并给页面一副可以被评审的骨架。
 *
 * 顺序也是结构的一部分 —— 所以「DOM 顺序」放在这一层，而不是可达性章节。
 *
 * 产出 stage4：骨架。
 */
export const ch4: Lesson = {
  slug: 'structure',
  order: 4,
  layer: { zh: '结构层', en: 'Structure layer' },
  adds: {
    zh: 'areas 骨架、Flex/Grid 分工、对齐系统、正确的 DOM 顺序',
    en: 'An areas skeleton, the Flex/Grid division of labour, Box Alignment, a correct DOM order',
  },
  accentVar: '--ch4',
  title: { zh: '结构层：把布局写成可评审的文本', en: 'The Structure Layer: Layout as Reviewable Text' },
  subtitle: {
    zh: '三个引擎不是三种写法，是三种世界观。而顺序，也是结构的一部分。',
    en: 'Three engines are not three syntaxes but three worldviews. And order, too, is part of structure.',
  },
  summary: {
    zh: '一维与二维的判据、grid-template-areas、Box Alignment 统一模型、DOM 顺序即语义顺序。这一层给页面一副骨架 —— 而且这副骨架是写在 CSS 里、产品经理不用渲染就能读懂并提出质疑的文本。',
    en: 'How to tell one dimension from two, grid-template-areas, the unified Box Alignment model, and DOM order as semantic order. This layer gives the page a skeleton — one written in CSS as text a product manager can read and challenge without rendering anything.',
  },

  sections: [
    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '4.1',
      title: { zh: '一维 vs 二维：Flex 与 Grid 的分工', en: 'One Dimension vs Two: Dividing Flex and Grid' },
      subtitle: {
        zh: '判据只有三个问题，但几乎没有人问过它们。',
        en: 'There are only three questions to ask — and almost nobody asks them.',
      },
      theory: ['css-box-alignment', 'every-layout'],
      demo: {
        id: 'flex-vs-grid',
        hint: {
          zh: '同一组卡片，切换 Flex 与 Grid，然后拖动容器宽度。D3 会画出每张卡片的**实测宽度分布** —— Flex 的最后一行宽度不一致，Grid 的列轨道始终一致。这个差别用眼睛不一定看得出，用数据一目了然。',
          en: 'The same cards under Flex and Grid; drag the container width. D3 plots the **measured width of every card** — Flex leaves the last row inconsistent while Grid keeps tracks identical. The difference is not always visible, but it is unmistakable in the data.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '第 3 层留下的那次「覆盖」', en: 'The override left over from layer three' } },
        {
          t: 'p',
            text: {
            zh: '上一层结尾我们做了全课程唯一一次覆盖：把 KPI 区的 `display: flex` 换成了 `display: grid`。当时说「第 4.1 节会解释为什么」—— 现在解释。',
            en: 'At the end of the previous layer we made the course’s only override: the KPI area’s `display: flex` became `display: grid`. We said §4.1 would explain why. Here it is.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '在 stage2，KPI 卡片只需要「排成一行，放不下就换行」—— 这是**一维**问题，Flex 是对的。到了 stage3，我们要求「每张卡片精确占 3 列」—— 这意味着**所有行共享同一套列轨道**，第二行的第一张卡必须和第一行的第一张卡左边对齐。这是**二维**问题，Flex 做不到。',
            en: 'At stage2 the KPI cards only needed to “sit in a row and wrap when they run out” — a **one-dimensional** problem, and Flex was right. At stage3 we require each card to occupy exactly three columns — which means **every row shares one set of column tracks**, and the first card of row two must align with the first card of row one. That is a **two-dimensional** problem, and Flex cannot do it.',
          },
        },

        { t: 'h', text: { zh: '三个问题', en: 'The three questions' } },
        {
          t: 'ol',
          items: [
            {
              zh: '**需要跨行对齐吗？** 第二行的第一个元素，要不要和第一行的第一个元素左边对齐？需要 → Grid。**Flex 的每一行是独立计算的，跨行对齐它做不到。**',
              en: '**Do you need alignment across rows?** Must the first item of row two line up with the first item of row one? If yes → Grid. **Flex computes each line independently and simply cannot align across them.**',
            },
            {
              zh: '**元素数量是否已知？** 已知且固定（导航的 5 个链接）→ Flex 足够；未知且来自数据（N 张卡片）→ Grid 的 `auto-fit` 更合适。',
              en: '**Is the item count known?** Known and fixed (five nav links) → Flex is enough. Unknown, coming from data (N cards) → Grid’s `auto-fit` fits better.',
            },
            {
              zh: '**尺寸由谁决定？** 内容决定（标签、按钮、面包屑）→ Flex；容器决定（等宽列、页面骨架）→ Grid。',
              en: '**Who decides the size?** The content (labels, buttons, breadcrumbs) → Flex. The container (equal columns, a page skeleton) → Grid.',
            },
          ],
        },
        {
          t: 'p',
          text: {
            zh: '一句话概括：**Flex 是「把东西排成一条线」，Grid 是「把东西放进一张表」。** 前者关心沿一个方向如何分配空间；后者关心二维平面上谁占哪一格。',
            en: 'In one line: **Flex arranges things along a line; Grid places things in a table.** One is about distributing space along a direction; the other about who occupies which cell on a plane.',
          },
        },

        { t: 'h', text: { zh: '两个最常见的误用', en: 'The two most common misuses' } },
        {
          t: 'versus',
          good: {
            title: { zh: '一行按钮 → Flex', en: 'A row of buttons → Flex' },
            text: {
              zh: '数量已知、尺寸由文字决定、不需要跨行对齐。`display: flex; gap: 8px` 一行搞定，按钮宽度各自贴合文字。',
              en: 'Count known, size set by the label, no cross-row alignment needed. `display: flex; gap: 8px` is the whole thing — each button hugs its text.',
            },
          },
          bad: {
            title: { zh: '一行按钮 → Grid', en: 'A row of buttons → Grid' },
            text: {
              zh: '`repeat(3, 1fr)` 会把「确定」和「取消并返回上一步」拉成一样宽 —— 按钮宽度应该表达内容长度，等宽反而制造了误导。',
              en: '`repeat(3, 1fr)` forces “OK” and “Cancel and go back” to the same width — but a button’s width should express its label. Equal width here actively misleads.',
            },
          },
        },
        {
          t: 'versus',
          good: {
            title: { zh: '卡片矩阵 → Grid', en: 'A card matrix → Grid' },
            text: {
              zh: '`repeat(auto-fit, minmax(240px, 1fr))`：列数自动适配容器，所有卡片等宽，**最后一行也和前面对齐**。',
              en: '`repeat(auto-fit, minmax(240px, 1fr))`: the column count adapts, every card is equal width, **and the last row still lines up**.',
            },
          },
          bad: {
            title: { zh: '卡片矩阵 → Flex', en: 'A card matrix → Flex' },
            text: {
              zh: '`flex: 1 1 240px` 看起来一样，但最后一行如果只有两张卡，它们会被拉成半屏宽 —— 这是 Flex 换行布局最经典的破绽。',
              en: '`flex: 1 1 240px` looks equivalent until the last row holds only two cards and they stretch to half the screen each — the classic tell of a wrapped Flex layout.',
            },
          },
        },
        {
          t: 'note',
          text: {
            zh: '**关于「最后一行」的补救**：网上流传的解法是给容器加若干个 `flex: 1 1 240px; height: 0` 的空占位子元素。这确实能用，但它是在**用 DOM 结构弥补引擎选择的错误** —— 空元素污染语义、影响读屏器、还得根据列数调整个数。**遇到需要这种补丁的时候，正确的反应是换引擎，而不是加补丁。**',
            en: '**On the “last row” workaround**: the common trick is to add several empty `flex: 1 1 240px; height: 0` placeholders. It works, but it **compensates for the wrong engine choice with DOM structure** — empty elements pollute the semantics, confuse screen readers, and must be re-counted whenever the column count changes. **When a patch like this is required, the right response is to change engines, not to apply the patch.**',
          },
        },

        { t: 'h', text: { zh: '案例里的引擎分工', en: 'How the case divides the engines' } },
        {
          t: 'table',
          head: [
            { zh: '区域', en: 'Region' },
            { zh: '引擎', en: 'Engine' },
            { zh: '理由', en: 'Why' },
          ],
          rows: [
            [{ zh: '页面骨架', en: 'Page skeleton' }, { zh: 'Grid（areas）', en: 'Grid (areas)' }, { zh: '二维、需要跨行对齐、区域命名即文档', en: 'Two-dimensional, needs cross-row alignment, named areas double as documentation' }],
            [{ zh: '筛选器行', en: 'Filter row' }, { zh: 'Flex', en: 'Flex' }, { zh: '一维、数量已知、宽度跟着标签长度走', en: 'One-dimensional, known count, widths follow label length' }],
            [{ zh: 'KPI 卡片区', en: 'KPI cards' }, { zh: 'Grid', en: 'Grid' }, { zh: '需要等宽与跨行对齐', en: 'Needs equal widths and cross-row alignment' }],
            [{ zh: '操作按钮组', en: 'Action buttons' }, { zh: 'Flex', en: 'Flex' }, { zh: '宽度必须表达标签长度', en: 'Width must express label length' }],
            [{ zh: '卡片内部', en: 'Inside a card' }, { zh: '常规流 / Stack', en: 'Normal flow / Stack' }, { zh: '纯垂直堆叠，用不着任何布局模式', en: 'Pure vertical stacking — no layout mode required' }],
          ],
        },
        {
          t: 'key',
          text: {
            zh: '**注意最后一行。** 一个页面里用得最多的「布局引擎」应该是常规流 —— 第 1 层学的那个。如果你的组件里每一层都是 `display: flex`，通常意味着你在用布局解决本该由间距解决的问题。**能不换引擎就不换。**',
            en: '**Note the last row.** The most-used layout engine in a page should be normal flow — the one from layer one. If every level of your component is `display: flex`, you are usually solving with layout what spacing should have solved. **Do not change engines unless you must.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: '同一组卡片的两种实现', en: 'The same cards, two implementations' },
          purpose: { zh: '把差别写在一起看最清楚。', en: 'The difference is clearest side by side.' },
          code: `/* Flex：一维。每一行独立分配空间 */
.cards--flex {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
}
.cards--flex > * { flex: 1 1 15rem; }
/* → 最后一行只剩 2 张时，它们会各自拉伸到半个容器宽 */

/* Grid：二维。列轨道对所有行统一 */
.cards--grid {
  display: grid;
  gap: var(--space-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
}
/* → 最后一行的卡片仍然对齐在原来的列轨道上 */`,
          highlight: [7, 8, 14, 16],
          key: {
            zh: '**关键点**：这两段代码的**意图**看起来一样（「15rem 起，能排几个排几个」），但**语义**完全不同。Flex 版本说的是「每一行自己看着办」，Grid 版本说的是「先定好列，再往里放」。演示里那张宽度分布图，就是在把这句话画出来。',
            en: '**Key point**: the two snippets look like the same **intent** (“start at 15rem, fit as many as possible”) but say completely different things. The Flex version says “each line works it out for itself”; the Grid version says “define the columns first, then fill them”. The width-distribution chart in the demo is that sentence, drawn.',
          },
        },
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'auto-fill 与 auto-fit 的区别', en: 'auto-fill versus auto-fit' },
          purpose: { zh: '两个词只差三个字母，行为差别却很大，而且只在「内容不足」时才显现。', en: 'Three letters apart, very different behaviour — and it only shows when there is not enough content.' },
          code: `/* auto-fill：轨道数量按容器算满，空轨道保留 */
grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
/* 1200px 容器 + 2 张卡片 → 创建 4 个轨道，卡片各占 15rem，右边空两格 */

/* auto-fit：空轨道被折叠，剩余空间分给实际存在的项 */
grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
/* 1200px 容器 + 2 张卡片 → 2 个轨道各占 600px 宽，铺满容器 */`,
          key: {
            zh: '**关键点：选哪个取决于「少量内容时希望它撑满还是保持原宽」。** 卡片式看板通常选 `auto-fit`（不希望右边留一大片空白）；而商品列表、图片墙常选 `auto-fill`（希望卡片保持一致尺寸，哪怕只有两件商品也不要拉成横幅）。**这是一个产品决策，不是技术决策** —— 但只有知道区别的人才有机会做这个决策。',
            en: '**Key point: the choice depends on whether sparse content should stretch or keep its size.** Card dashboards usually want `auto-fit` (no large void on the right); product grids and photo walls usually want `auto-fill` (keep cards a consistent size rather than stretching two items into banners). **This is a product decision, not a technical one** — but only someone who knows the difference gets to make it.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '4.2',
      title: { zh: 'areas：把布局写成字符画', en: 'areas: Layout as ASCII Art' },
      subtitle: {
        zh: 'CSS 里少有的、能直接承载设计意图的写法。',
        en: 'One of the rare places where CSS can carry design intent directly.',
      },
      theory: ['css-grid-2', 'muller-brockmann'],
      demo: {
        id: 'area-painter',
        hint: {
          zh: '在 6×6 网格上用鼠标（或方向键 + 空格）刷出区域，实时生成 `grid-template-areas` 并渲染成真实骨架。试着把某个区域刷成 L 形 —— 校验器会立刻报错，而浏览器遇到这种写法会**静默忽略整条规则**。',
          en: 'Paint regions on a 6×6 grid with the mouse (or arrow keys plus space); the `grid-template-areas` code and a real skeleton render live. Try painting a region into an L shape — the validator flags it instantly, whereas a browser would **silently drop the entire declaration**.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '大多数 CSS 描述元素，areas 描述页面', en: 'Most CSS describes elements; areas describes the page' } },
        {
          t: 'p',
          text: {
            zh: '绝大多数 CSS 描述的是「这个元素长什么样」。而 `grid-template-areas` 描述的是「**整个页面是什么结构**」。这个视角差别很大：',
            en: 'Most CSS describes “what this element looks like”. `grid-template-areas` describes “**what the whole page is**”. That shift in viewpoint matters:',
          },
        },
        {
          t: 'code',
          lang: 'css',
          code: `grid-template-areas:
  "head head head head head head"
  "filt filt filt filt filt filt"
  "summ summ summ summ summ summ"
  "kpis kpis kpis kpis kpis kpis"
  "trnd trnd trnd brkd brkd brkd"
  "tabl tabl tabl tabl acts acts";`,
        },
        {
          t: 'p',
          text: {
            zh: '这六行不需要注释、不需要渲染，产品经理和设计师都能读懂，而且能直接指出「为什么 acts 只占两列」。**CSS 能被非工程师评审，这件事本身就很稀有。**',
            en: 'Those six lines need no comment and no rendering. A product manager or designer can read them and immediately ask why `acts` only spans two columns. **CSS that non-engineers can review is a rare thing.**',
          },
        },

        { t: 'h', text: { zh: '三个实用细节', en: 'Three practical details' } },
        {
          t: 'ul',
          items: [
            {
              zh: '**用 `.` 表示留空**。一个点就是一个空单元格；多个点必须连写成 `...`（中间不能有空格），否则会被当成多个空格分隔符。',
              en: '**Use `.` for an empty cell.** One dot is one empty cell; several dots must be written together as `...` (no spaces between), otherwise they read as multiple separators.',
            },
            {
              zh: '**区域名要等长**。`"head head"` 比 `"header header"` 更容易对齐成字符画。本站统一用 4 个字符的缩写，就是为了让这段 CSS 在编辑器里看起来真的像一张图。',
              en: '**Keep area names the same length.** `"head head"` aligns into ASCII art better than `"header header"`. This site standardises on four-character names precisely so the CSS actually looks like a diagram.',
            },
            {
              zh: '**区域必须是矩形**。L 形、T 形的区域定义是非法的，浏览器会整条规则忽略 —— 而且大多数浏览器不会在控制台报错，你只会看到布局「莫名其妙没生效」。',
              en: '**Areas must be rectangular.** L-shaped or T-shaped definitions are invalid and the entire declaration is dropped — and most browsers say nothing in the console, so the layout simply “mysteriously does not apply”.',
            },
          ],
        },

        { t: 'h', text: { zh: 'areas 的第二个红利：重排只需重写字符画', en: 'The second dividend: re-ranking is one block of art' } },
        {
          t: 'p',
          text: {
            zh: '窄屏没有「左上右下」，只有「上下」。此时优先级序列必须重新表达一次。用 areas，这件事只是重写一段字符画，而不是给每个元素改 `grid-column`：',
            en: 'On a narrow screen there is no top-left/bottom-right, only top and bottom, so the priority sequence must be restated. With areas that is one block of art rather than per-element `grid-column` edits:',
          },
        },
        {
          t: 'code',
          lang: 'css',
          code: `@container (max-width: 39rem) {
  .dash {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'head' 'filt' 'summ' 'kpis' 'trnd' 'brkd' 'tabl' 'acts';
  }
}`,
        },
        {
          t: 'p',
          text: {
            zh: '注意 `filt` 在宽屏是第二行整行、窄屏是第二位 —— **同一个优先级，在不同几何形状下有不同的位置表达**。第 6 层会讲这条查询的阈值 39rem 是怎么来的（剧透：它是量出来的，不是抄设备尺寸表）。',
            en: 'Note that `filt` is a full second row on wide screens and second from the top on narrow ones — **the same priority, expressed by different positions under a different geometry**. Layer six explains where the 39rem threshold comes from (spoiler: it was measured, not copied from a device list).',
          },
        },

        { t: 'h', text: { zh: 'subgrid：解决卡片内部的跨卡片对齐', en: 'subgrid: aligning across cards from the inside' } },
        {
          t: 'p',
          text: {
            zh: '一个真实需求：一排卡片，每张有标题、正文、按钮。标题行数不同（有的一行有的两行），于是**按钮的纵向位置对不齐**。以前的解法是给标题设固定高度（回到第 1.2 节批评过的错误）或者用 JS 测高。',
            en: 'A real requirement: a row of cards, each with a title, body and button. Titles wrap differently, so **the buttons do not line up vertically**. The old fixes were a fixed title height (the mistake criticised in §1.2) or JavaScript measurement.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '`subgrid` 让卡片内部**继承父网格的行轨道**，于是所有卡片的标题行、正文行、按钮行天然对齐 —— 这是 CSS 第一次能在「容器内部」实现跨容器对齐。',
            en: '`subgrid` lets a card’s internals **inherit the parent’s row tracks**, so every card’s title row, body row and button row align automatically — the first time CSS can align across containers from inside them.',
          },
        },
        {
          t: 'note',
          text: {
            zh: '**降级策略**：`subgrid` 在主流浏览器已全面支持，但仍需为旧环境准备回退。推荐用 `@supports (grid-template-rows: subgrid)` 包裹增强部分 —— **注意是把「更好的效果」放进 `@supports`，而不是把「基础效果」放进去**。前者不支持时退化成可用，后者不支持时直接崩掉。',
            en: '**Fallback strategy**: `subgrid` now ships broadly, but older environments still need a path. Wrap the enhancement in `@supports (grid-template-rows: subgrid)` — **and note that the *better* effect goes inside `@supports`, not the *baseline* one**. Done that way, unsupported browsers degrade to usable; done the other way, they break.',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：Grid 的价值不只是「能做二维布局」，而是**它提供了一套描述结构的词汇**。`grid-area: headline` 比 `position: absolute; top: 0; left: 0` 多携带的那部分信息，就是设计意图。',
            en: '**One line to take away**: Grid’s value is not merely two-dimensional layout — it is that **it gives you a vocabulary for describing structure**. What `grid-area: headline` carries and `position: absolute; top: 0; left: 0` does not, is intent.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'stage4 骨架（本层的产出）', en: 'The stage4 skeleton (this layer’s deliverable)' },
          purpose: { zh: '六行字符画 + 八行 grid-area，就是整个页面的结构。', en: 'Six lines of art plus eight `grid-area` declarations are the entire page structure.' },
          code: `.dash {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-5);
  grid-template-areas:
    'head head head head head head head head head head head head'
    'filt filt filt filt filt filt filt filt filt filt filt filt'
    'summ summ summ summ summ summ summ summ summ summ summ summ'
    'kpis kpis kpis kpis kpis kpis kpis kpis kpis kpis kpis kpis'
    'trnd trnd trnd trnd trnd trnd trnd brkd brkd brkd brkd brkd'
    'tabl tabl tabl tabl tabl tabl tabl tabl acts acts acts acts';
}

.dash__head      { grid-area: head; }
.dash__filters   { grid-area: filt; }
.dash__summary   { grid-area: summ; }
.dash__kpis      { grid-area: kpis; }
.dash__trend     { grid-area: trnd; }
.dash__breakdown { grid-area: brkd; }
.dash__table     { grid-area: tabl; }
.dash__actions   { grid-area: acts; }`,
          highlight: [10, 11],
          key: {
            zh: '**关键点**：看第 10–11 行 —— 趋势图占 7 列、分布图占 5 列，明细表占 8 列、操作区占 4 列。这些比例不是随手写的：趋势图是折线，需要足够的横向分辨率（第 3.2 节「图表最少 5–7 列」）；分布图是横向条形，5 列足够。**areas 让这些决策变得可见，因此也变得可争论。**',
            en: '**Key point**: look at lines 10–11 — the trend chart takes seven columns and the breakdown five; the table eight and the actions four. These are not arbitrary: the trend is a line chart and needs horizontal resolution (§3.2’s “charts need 5–7 columns”), while the breakdown is horizontal bars and five suffice. **areas make these decisions visible, and therefore arguable.**',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '4.3',
      title: { zh: '对齐系统统一论', en: 'A Unified Theory of Alignment' },
      subtitle: {
        zh: '六个属性名看起来很乱，但它们说的是同一件事：剩余空间给谁。',
        en: 'Six property names look like chaos — but they all say one thing: who gets the leftover space.',
      },
      theory: ['css-box-alignment'],
      demo: {
        id: 'alignment-matrix',
        hint: {
          zh: '3×3 的组合切换器。D3 用半透明色块把**剩余空间被分配到哪里**画出来 —— 这是理解对齐的关键：你调的从来不是元素的位置，而是空白的位置。',
          en: 'A 3×3 combination switcher. D3 shades **where the leftover space goes** — the key to understanding alignment: you are never moving the elements, you are moving the emptiness.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '为什么这六个属性总是记不住', en: 'Why these six properties never stick' } },
        {
          t: 'p',
          text: {
            zh: '`justify-content`、`align-items`、`place-self`… 这一组属性几乎是前端最常查文档的东西。大多数人记不住它们，不是因为记性差，而是因为**它们通常是被一条条分开学的** —— 在 Flex 教程里学一遍，在 Grid 教程里再学一遍，于是脑子里存了两套互相冲突的规则。',
            en: '`justify-content`, `align-items`, `place-self` — few things in front-end work get looked up more often. People fail to remember them not from poor memory but because **they are usually learned one at a time**: once in a Flex tutorial, again in a Grid tutorial, leaving two mutually contradictory rule sets in your head.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '实际上它们出自同一份规范（CSS Box Alignment），是**一套**规则，由两个问题唯一确定：**动哪根轴**，以及**动的是容器里的整体、还是每个子项自己**。把这两个问题拆开，六个属性就塌缩成一张两行三列的表：',
            en: 'In fact they come from one specification (CSS Box Alignment) and form **a single** system, pinned down by two questions: **which axis** you are working on, and **whether you are moving the group inside the container or each item on its own**. Separate those two questions and the six properties collapse into one small table:',
          },
        },
        {
          t: 'table',
          head: [
            { zh: '作用对象', en: 'Applies to' },
            { zh: '`justify-*`（行内轴 / 主轴）', en: '`justify-*` (inline / main axis)' },
            { zh: '`align-*`（块轴 / 交叉轴）', en: '`align-*` (block / cross axis)' },
          ],
          rows: [
            [
              { zh: '`*-content`', en: '`*-content`' },
              { zh: '分配**轨道之间**的剩余空间', en: 'Distributes leftover space **between tracks**' },
              { zh: '同左，纵向', en: 'The same, vertically' },
            ],
            [
              { zh: '`*-items`', en: '`*-items`' },
              { zh: '所有子项**在各自格子内**如何对齐', en: 'How all items align **inside their own cell**' },
              { zh: '同左，纵向', en: 'The same, vertically' },
            ],
            [
              { zh: '`*-self`', en: '`*-self`' },
              { zh: '**单个**子项覆盖上面的设置', en: 'A **single** item overrides the above' },
              { zh: '同左，纵向', en: 'The same, vertically' },
            ],
          ],
        },
        {
          t: 'p',
          text: {
            zh: '记住两个维度就够了：**「哪个方向」×「谁来对齐」**。方向是 `justify`（横）还是 `align`（纵，在 Flex 里会随 `flex-direction` 翻转）；对齐的主体是整组轨道（`content`）、每个子项（`items`）、还是某一个子项（`self`）。',
            en: 'Two dimensions are all you need: **which axis × who is being aligned**. The axis is `justify` (inline) or `align` (block, and in Flex it flips with `flex-direction`). The subject is the whole set of tracks (`content`), every item (`items`), or one item (`self`).',
          },
        },

        { t: 'h', text: { zh: '统一心智：对齐分配的是「剩余空间」', en: 'The unifying idea: alignment distributes leftover space' } },
        {
          t: 'p',
          text: {
            zh: '如果容器里没有剩余空间，所有对齐属性都不会有任何效果。这解释了几个常见困惑：',
            en: 'If there is no leftover space in the container, no alignment property does anything. That explains several common confusions:',
          },
        },
        {
          t: 'ul',
          items: [
            { zh: '**「我写了 `align-items: center` 但没反应」** —— 通常是因为容器高度由内容撑起，纵向没有剩余空间。', en: '**“I set `align-items: center` and nothing happened”** — usually the container’s height comes from its content, so there is no vertical leftover.' },
            { zh: '**「`space-between` 在只有一个子项时不对称」** —— 一个子项没有「之间」，剩余空间全在它右边。', en: '**“`space-between` looks lopsided with one item”** — a single item has no “between”, so all the leftover sits to its right.' },
            { zh: '**「`justify-content` 和 `justify-items` 都写了，只有一个生效」** —— 如果轨道是 `1fr`，它们已经吃掉了所有剩余空间，`justify-content` 自然无事可做。', en: '**“I set both `justify-content` and `justify-items` and only one worked”** — if the tracks are `1fr` they have already consumed all leftover space, leaving `justify-content` nothing to distribute.' },
          ],
        },
        {
          t: 'p',
          text: {
            zh: '本节的演示就是把这件事画出来：切换任意组合时，**半透明色块标出的不是元素，而是空白**。看几次之后，这六个属性就不再需要记了。',
            en: 'The demo draws exactly this: as you switch combinations, **the shaded blocks are not the elements — they are the emptiness**. After a few passes, the six properties stop needing memorisation.',
          },
        },

        { t: 'h', text: { zh: '`stretch` 是默认值，而且它很重要', en: '`stretch` is the default, and it matters' } },
        {
          t: 'p',
          text: {
            zh: '`align-items` 在 Flex 和 Grid 里的默认值都是 `stretch`。这意味着**同一行的卡片天然等高** —— 第 1.2 节说「不要用固定高度求整齐」，这里给出了正确的替代：**等高应该由网格提供，而不是由固定高度提供。**',
            en: '`align-items` defaults to `stretch` in both Flex and Grid, which is why **cards in a row are equal height for free**. Section 1.2 said “do not use a fixed height to get tidiness”; here is the correct replacement: **equal height should come from the grid, not from a fixed height.**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '很多人写 `align-items: flex-start` 只是为了「让内容顶部对齐」，却顺手毁掉了等高 —— 正确做法是让卡片保持 `stretch`，在卡片**内部**用 Stack 把内容顶到上面。',
            en: 'Many people write `align-items: flex-start` just to top-align content and destroy that equal height in passing. The correct move is to leave the cards stretched and push the content to the top **inside** each card with a Stack.',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：`position: absolute` + `top/left` 曾经是唯一的居中方案，现在它是最后的方案。**能用对齐属性表达的位置关系，就不要用坐标表达** —— 因为坐标不会随内容变化，而对齐会。',
            en: '**One line to take away**: `position: absolute` with `top/left` used to be the only way to centre things; now it is the last resort. **Any positional relationship expressible with alignment should not be expressed with coordinates** — coordinates do not respond to content, alignment does.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: '居中：从五行到两行', en: 'Centring: from five lines to two' },
          purpose: { zh: '「垂直居中」曾经是前端面试题，现在是一个属性。', en: '“Vertical centring” used to be an interview question. Now it is one property.' },
          code: `/* 上古写法：需要知道元素尺寸，且脱离文档流 */
.center-old {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}

/* 现代写法：不脱流，不需要知道尺寸，内容变化自动跟随 */
.center-new {
  display: grid;
  place-items: center;   /* = align-items: center; justify-items: center */
}`,
          highlight: [11],
          key: {
            zh: '**关键点**：`place-items` 是 `align-items` + `justify-items` 的简写，**顺序是「块轴在前，行内轴在后」**（和 `margin` 的「上右下左」不是一个体系，这是最容易记错的地方）。写 `place-items: center` 时两个值相同所以没问题，但写 `place-items: start center` 就要想清楚哪个是纵向。',
            en: '**Key point**: `place-items` is shorthand for `align-items` + `justify-items`, **block axis first, inline axis second** — a different convention from `margin`’s top-right-bottom-left, and the easiest thing to misremember. `place-items: center` is safe because both values match, but `place-items: start center` demands you know which one is vertical.',
          },
        },
        {
          t: 'code',
          lang: 'css',
          file: { zh: '用对齐代替坐标', en: 'Alignment instead of coordinates' },
          purpose: { zh: '「把这个东西放到右边 / 底部」几乎从来不需要坐标。', en: '“Put this on the right / at the bottom” almost never needs coordinates.' },
          code: `/* ✗ 绝对定位：按钮脱离流，标题变长时内容会跑到它下面 */
.kpi       { position: relative; }
.kpi__more { position: absolute; top: 5px; right: 7px; }

/* ✓ 用对齐表达同一个关系：按钮占据真实的一列，标题自然会避开 */
.kpi {
  display: grid;
  grid-template-columns: 1fr auto;   /* 内容 | 按钮 */
  align-items: start;
  gap: var(--space-2);
}
.kpi__more { grid-column: 2; }`,
          highlight: [8, 12],
          key: {
            zh: '**关键点**：绝对定位的版本有一个隐藏成本 —— 按钮脱离了流，所以**卡片的内容可以跑到按钮下面去**（当标题变长时）。而网格版本里按钮占据了真实的一列，标题自然会避开它。**「看起来一样」的两种实现，在内容变化时表现完全不同 —— 这正是布局代码最该被推敲的地方。**',
            en: '**Key point**: the absolutely-positioned version has a hidden cost — the button is out of flow, so **the card’s content can slide underneath it** once the title grows. In the grid version the button occupies a real column and the title simply avoids it. **Two implementations that look identical behave completely differently as content changes — which is exactly where layout code deserves scrutiny.**',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '4.4',
      title: { zh: 'DOM 顺序也是结构', en: 'DOM Order Is Structure Too' },
      subtitle: {
        zh: '`order` 改的是你看到的顺序，改不了你摸到的顺序。',
        en: '`order` changes the order you see. It cannot change the order you reach.',
      },
      theory: ['wcag-22', 'css-box-alignment'],
      demo: {
        id: 'tab-order',
        hint: {
          zh: '开关 `order` / `dense` / `row-reverse`，D3 在真实元素上画出 **Tab 焦点路径折线**，自动标红交叉与回跳。你也可以直接在演示里按 Tab 实操验证 —— 画出来的线和你手指走的路完全一致。',
          en: 'Toggle `order`, `dense` and `row-reverse`, and D3 draws the actual **Tab focus path** over the real elements, flagging crossings and backtracks. You can also just press Tab inside the demo — the drawn line and your fingers agree exactly.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '为什么顺序属于结构层', en: 'Why order belongs to the structure layer' } },
        {
          t: 'p',
          text: {
            zh: '很多课程把「DOM 顺序」放在可达性章节里讲，好像它是一个补救措施。**这门课把它放在结构层，因为它就是结构的一部分** —— 一个页面的结构不只是「谁在哪」，还包括「谁在谁之前」。',
            en: 'Many courses file “DOM order” under accessibility, as if it were a remedy. **This course puts it in the structure layer, because that is what it is** — a page’s structure is not only “what goes where” but also “what comes before what”.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '好消息是：我们的案例从 `stage0` 起，DOM 顺序就按业务重要度降序写定了（第 1.1 节的代码里可以看到）。**所以这一层我们不需要修任何东西 —— 我们只需要知道，如果当初写错了，代价有多大。**',
            en: 'The good news: our case has had its DOM in descending business importance since `stage0` (you can see it in §1.1’s code). **So this layer has nothing to fix — we only need to understand how expensive getting it wrong would have been.**',
          },
        },

        { t: 'h', text: { zh: '规范怎么说', en: 'What the spec says' } },
        {
          t: 'quote',
          text: {
            zh: '当内容的呈现顺序影响其含义时，正确的阅读顺序必须能够通过程序确定。',
            en: 'When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.',
          },
          cite: { zh: 'WCAG 2.2，成功准则 1.3.2「有意义的序列」（A 级）', en: 'WCAG 2.2, Success Criterion 1.3.2 Meaningful Sequence (Level A)' },
        },
        {
          t: 'p',
          text: {
            zh: '注意这是 **A 级** —— 最低的合规等级。同时 CSS Flexbox 规范里也有一段非常罕见的、直接的警告：',
            en: 'Note that this is **Level A** — the lowest conformance tier. The CSS Flexbox specification also carries an unusually direct warning:',
          },
        },
        {
          t: 'quote',
          text: {
            zh: '作者不得使用 `order` 或 `*-reverse` 来重排那些在源码顺序中本就有意义的内容。这些属性仅用于视觉上的重新排序，不影响语音、导航或非视觉媒介的顺序。',
            en: 'Authors must not use order or the -reverse values to reorder content that is meaningful in source order. These properties are for visual reordering only, and do not affect speech, navigation, or non-visual media.',
          },
          cite: { zh: 'CSS Flexible Box Layout Module Level 1, §5.4', en: 'CSS Flexible Box Layout Module Level 1, §5.4' },
        },

        { t: 'h', text: { zh: '三个会造成顺序错位的属性', en: 'Three properties that break order' } },
        {
          t: 'table',
          head: [
            { zh: '属性', en: 'Property' },
            { zh: '影响', en: 'Effect' },
            { zh: '什么时候可以用', en: 'When it is acceptable' },
          ],
          rows: [
            [
              { zh: '`order`', en: '`order`' },
              { zh: '任意重排视觉顺序', en: 'Arbitrarily reorders visually' },
              { zh: '几乎从不。唯一合理场景：纯装饰元素', en: 'Almost never. The one fair case: purely decorative elements' },
            ],
            [
              { zh: '`flex-direction: *-reverse`', en: '`flex-direction: *-reverse`' },
              { zh: '整体反向', en: 'Reverses the whole line' },
              { zh: '视觉顺序与语义顺序确实相反时（如聊天记录倒序）', en: 'When visual order genuinely is the reverse of semantic order (a reversed chat log)' },
            ],
            [
              { zh: '`grid-auto-flow: dense`', en: '`grid-auto-flow: dense`' },
              { zh: '为填满空隙而回填后面的项', en: 'Backfills later items into earlier gaps' },
              { zh: '顺序无意义的画廊（图片墙）', en: 'Galleries where order carries no meaning (photo walls)' },
            ],
          ],
        },
        {
          t: 'pitfall',
          text: {
            zh: '**`dense` 特别隐蔽**。它不像 `order` 那样需要你显式写一个数字，而是「自动」把后面的小卡片塞进前面的空隙 —— 于是第 7 张卡片可能出现在第 3 张的位置。视觉上很整齐，Tab 顺序却完全乱了，而且**乱的程度随容器宽度变化**，测试时极难复现。',
            en: '**`dense` is especially insidious.** Unlike `order` it requires no explicit number — it “automatically” tucks later small items into earlier gaps, so card seven can appear where card three should be. It looks tidy and the Tab order is chaos — chaos that **changes with container width**, making it nearly impossible to reproduce in testing.',
          },
        },

        { t: 'h', text: { zh: '正确做法：改 DOM，不改 order', en: 'The right move: change the DOM, not the order' } },
        {
          t: 'p',
          text: {
            zh: '如果某个元素在视觉上应该排第一，那它在语义上也应该排第一 —— **那就把它在 DOM 里放到第一**。然后用 Grid 的定位能力（`grid-area` / `grid-column`）把它放到任何你想要的位置。**Grid 的定位不影响 DOM 顺序，也就不影响焦点顺序。**',
            en: 'If an element should come first visually, it should come first semantically — **so put it first in the DOM**. Then use Grid’s placement (`grid-area`, `grid-column`) to put it wherever you like. **Grid placement does not change DOM order, and therefore does not change focus order.**',
          },
        },
        {
          t: 'note',
          text: {
            zh: '**这就是为什么我们的案例从第一天就把 DOM 顺序写对。** 第 5 层要把主指标卡「提到最显眼的位置」时，我们只需要给它 `grid-column: span 2` 和更大的字号 —— 完全不需要 `order`，因为它在 DOM 里本来就是第一个。**结构上的正确，会在三章之后替你省事。**',
            en: '**This is why our case has had its DOM order right since day one.** When layer five promotes the primary card to the most prominent position, all it needs is `grid-column: span 2` and a larger size — no `order` at all, because it was already first in the DOM. **Getting the structure right pays you back three chapters later.**',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：视觉顺序与源码顺序解耦，是 Flex 和 Grid 送给你的能力 —— 也是它们埋给你的陷阱。**用这个能力去适配不同的几何形状（宽屏横排、窄屏竖排）是对的；用它去弥补 DOM 结构的错误是错的。**',
            en: '**One line to take away**: decoupling visual order from source order is a power Flex and Grid hand you — and a trap they set for you. **Using it to adapt one meaning to different geometries is right; using it to paper over a wrong DOM structure is not.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'html',
          file: { zh: '三层语义分离（本站真实写法）', en: 'Three kinds of semantics, separated (as written here)' },
          purpose: { zh: '把「重要度」「响度」「阅读顺序」分开表达，三者各司其职。', en: 'Importance, loudness and reading order each get their own expression.' },
          code: `<!-- DOM 顺序 = 阅读顺序 = 业务重要度降序，永远不变 -->
<ul class="dash__kpis">
  <li class="kpi" data-rank="primary"   data-importance="5">新生总人数 4,286</li>
  <li class="kpi" data-rank="secondary" data-importance="4">报到率 98.2%</li>
  <li class="kpi" data-rank="secondary" data-importance="3">男女比 1.4:1</li>
  <li class="kpi" data-rank="tertiary"  data-importance="2">生源省份 31</li>
</ul>`,
          highlight: [3],
          key: {
            zh: '**关键点**：`data-rank` 表达「该有多响」（第 5 层用它做层级），`data-importance` 表达「业务上多重要」（度量函数用它算层级分），**DOM 顺序表达「阅读顺序」**。三者分离之后，样式可以自由决定视觉呈现，而阅读顺序始终由结构保证。**同一套语义，服务于渲染、度量和可达性三个目的。**',
            en: '**Key point**: `data-rank` says how loud it should be (layer five uses it for hierarchy), `data-importance` says how much it matters to the business (the metric functions use it), and **DOM order says in what order it is read**. With those separated, styling is free to decide the visuals while reading order stays guaranteed by structure. **One set of semantics serving rendering, measurement and accessibility at once.**',
          },
        },
        {
          t: 'code',
          lang: 'css',
          file: { zh: '如果当初写错了，修复长这样', en: 'What the fix would look like, had we got it wrong' },
          purpose: { zh: '好消息是这一层不需要执行它 —— 但你需要知道它长什么样。', en: 'The good news is this layer does not need to run it — but you should know what it looks like.' },
          code: `/* ✗ 常见的「一行修复」：视觉对了，焦点顺序错了 */
- .kpi[data-k='total'] { order: -1; }

/* ✓ 正确做法：把它在 DOM 里放到第一，然后用 Grid 定位 */
+ .kpi[data-rank='primary'] { grid-column: span 2; }`,
          highlight: [2],
          key: {
            zh: '**关键点**：`order: -1` 这一行最危险的地方在于**它确实解决了你当时看到的问题**。视觉检查通过、设计评审通过、截图对比通过 —— 只有键盘用户和读屏用户会发现不对，而他们通常不在评审现场。**布局的可达性问题几乎全部具有这个特征：对看得见的人完全不可见。** 这也是为什么它必须由「结构」这一层负责，而不是等到最后做审计。',
            en: '**Key point**: the danger of `order: -1` is that **it genuinely fixes the problem you could see**. Visual check passes, design review passes, screenshot diff passes — only keyboard and screen-reader users notice, and they are usually not in the room. **Nearly every accessibility problem in layout shares this property: it is invisible to people who can see.** Which is exactly why it belongs to the structure layer rather than to a final audit.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '4.5',
      title: { zh: '案例：给页面一副骨架', en: 'Case: Giving the Page a Skeleton' },
      subtitle: {
        zh: 'stage3 → stage4。六行字符画替代了一堆位置声明。',
        en: 'stage3 → stage4. Six lines of ASCII art replace a pile of positioning declarations.',
      },
      theory: ['css-grid-2', 'css-box-alignment', 'wcag-22'],
      caseStage: 'stage4',
      demo: {
        id: 'case-s4',
        hint: {
          zh: '对比 stage3 与 stage4：趋势图与分布图并排了，操作按钮到了右下角。注意页面**不再只是从上到下的一串区块** —— 它有了平面上的结构。',
          en: 'Compare stage3 with stage4: the trend and breakdown charts now sit side by side and the actions moved to the bottom-right. Note that the page is **no longer just a vertical stack** — it has structure on a plane.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '这一层做了什么', en: 'What this layer did' } },
        {
          t: 'p',
          text: {
            zh: '前四节把「东西放在哪」这件事从零散的规则变成了一套可评审的结构。落到案例上，最大的变化不是外观 —— 而是**这份布局第一次可以被人读懂并提出质疑**。',
            en: 'The four sections before this turned “where things go” from scattered rules into a structure someone can review. On the case the biggest change is not visual — it is that **for the first time the layout can be read, and argued with, by a person**.',
          },
        },
        {
          t: 'ol',
          items: [
            { zh: '主布局改写为 `grid-template-areas` —— 六行字符画就是页面地图（4.2）', en: 'The main layout becomes `grid-template-areas` — six lines of art that *are* the page map (§4.2)' },
            { zh: '引擎分工落位：骨架与 KPI 用 Grid，筛选器与按钮组用 Flex，卡片内部用常规流（4.1）', en: 'Engines take their places: Grid for the skeleton and KPIs, Flex for filters and buttons, normal flow inside cards (§4.1)' },
            { zh: '位置关系全部用 Box Alignment 表达，没有一处 `position: absolute` 坐标（4.3）', en: 'All positional relationships use Box Alignment; not one `position: absolute` coordinate (§4.3)' },
            { zh: 'DOM 顺序确认无误 —— 它从 stage0 起就是对的，这一层不需要改（4.4）', en: 'DOM order verified — it has been right since stage0, so this layer changes nothing (§4.4)' },
          ],
        },

        { t: 'h', text: { zh: '可达性问题数：从 6 到 2', en: 'Accessibility issues: from 6 to 2' } },
        {
          t: 'p',
          text: {
            zh: '这一层负责的指标是**可达性问题数**，它从 6 降到 2。降掉的 4 个全部是「焦点顺序逆序对」—— 而它们之所以存在，是因为 stage3 的 KPI 区在窄容器下会用 Grid 的自动放置产生跨行错位。改成 areas 骨架并显式定位之后，焦点路径重新变成单调的。',
            en: 'The metric this layer owns is the **accessibility issue count**, which falls from 6 to 2. All four that went were focus-order inversions — they existed because stage3’s KPI area produced cross-row misplacement under Grid auto-placement in narrow containers. With an areas skeleton and explicit placement, the focus path is monotone again.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '剩下的 2 个是「点击目标小于 24×24px」—— 那属于**尺寸**问题，由第 6 层负责。**一个指标可以由两层共同负责，但每一层只动它该动的那一半。**',
            en: 'The remaining 2 are targets smaller than 24×24px — a **sizing** problem, owned by layer six. **A metric can be shared between two layers, but each layer moves only its own half.**',
          },
        },

        { t: 'h', text: { zh: '下一层要解决什么', en: 'What the next layer solves' } },
        {
          t: 'p',
          text: {
            zh: '现在的页面结构清楚、位置有理由、顺序正确。但把它眯起眼睛看（或者给截图加 8px 模糊）——**你看到的是一片均匀的灰。**',
            en: 'The page now has clear structure, justified positions and a correct order. But squint at it — or blur a screenshot by 8px — and **you see a uniform grey field.**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '八个数字一样大、一样黑、一样重。「新生总人数 4,286」这个页面存在的理由，和「更新时间 09-12」看起来一样重要。**结构解决了「东西在哪」，但没有解决「先看哪个」。** 那是第 5 层的事。',
            en: 'Eight numbers, all the same size, the same black, the same weight. “Total enrolment 4,286” — the reason this page exists — looks exactly as important as “Updated 09-12”. **Structure settled where things are; it did not settle what to look at first.** That is layer five.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'stage3 → stage4 完整 diff', en: 'The complete stage3 → stage4 diff' },
          purpose: { zh: '加上骨架，并把筛选区与图表区之间那一级分隔补强。', en: 'Add the skeleton, and shore up the one level of separation between filters and charts.' },
          code: `/* ─────────── 新增 ─────────── */
+ .dash {
+   grid-template-areas: /* …见 4.2 节的六行字符画… */;
+ }
+ .dash__head      { grid-area: head; }
+ .dash__filters   { grid-area: filt;
+                    padding-block-end: var(--space-6);
+                    border-block-end: 1px solid var(--line-1); }
+ .dash__summary   { grid-area: summ; }
+ .dash__kpis      { grid-area: kpis; }
+ .dash__trend     { grid-area: trnd; }
+ .dash__breakdown { grid-area: brkd; }
+ .dash__table     { grid-area: tabl; }
+ .dash__actions   { grid-area: acts;
+                    align-items: flex-end; justify-content: flex-end; }`,
          highlight: [7, 8],
          key: {
            zh: '**关键点**：第 7–8 行是一个真实的工程折中，值得说明。areas 把筛选区与图表区放进了相邻的两行，此时它们之间只有一个 `gap`（24px），而第 2.1 节要求区块之间应该是 48px。这个位置腾不出 48px —— 于是我们用 `padding-block-end` 撑出 32px，再**用一条最便宜的线补强**。**知道规则，才知道什么时候可以破例、破例的代价是什么。** 这条线是全页唯一的一条 `border`，第 5.6 节会重新审视它是否还有必要。',
            en: '**Key point**: lines 7–8 are a genuine engineering compromise worth naming. The areas layout puts filters and charts in adjacent rows, where only a single `gap` (24px) separates them — while §2.1 asks for 48px between blocks. There is no room for 48px here, so we add 32px of `padding-block-end` and **shore it up with the cheapest possible line**. **Knowing the rule is what lets you know when to break it, and what breaking it costs.** That line is the only `border` on the page; §5.6 revisits whether it is still needed.',
          },
        },
      ],
    },
  ],
};
