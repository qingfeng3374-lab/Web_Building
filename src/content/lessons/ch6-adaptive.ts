import type { Lesson } from '../types';

/**
 * 第 6 层 · 适应层
 *
 * 前五层解决的都是「在一个确定尺寸下把页面做对」。
 * 这一层解决「在所有尺寸、所有加载时刻、所有设备能力下保持对」。
 *
 * 它同时是全课程唯一涉及「时间」的一层 ——
 * CLS 与性能讲的不是页面长什么样，而是页面**在变成那个样子的过程中**发生了什么。
 *
 * 产出 stage6：可交付。
 */
export const ch6: Lesson = {
  slug: 'adaptive',
  order: 6,
  layer: { zh: '适应层', en: 'Adaptive layer' },
  adds: {
    zh: '内容断点、流体音阶、容器查询、稳定性与性能',
    en: 'Content breakpoints, a fluid type scale, container queries, stability and performance',
  },
  accentVar: '--ch6',
  title: { zh: '适应层：在所有尺寸上都保持对', en: 'The Adaptive Layer: Staying Right at Every Size' },
  subtitle: {
    zh: '响应式不是「给手机再写一套」，是让同一套规则在所有尺寸下都成立。',
    en: 'Responsive design is not “write a second version for phones” — it is one set of rules that holds at every size.',
  },
  summary: {
    zh: '内容断点的测量方法、clamp() 的斜率反解、容器查询与组件自治、算法布局原语、重排与目标尺寸、CLS 的三个来源、布局抖动的成因与修法。这一层把前五层的成果固定下来 —— 让它们在 320px 到 2560px、在首字节到完全加载的每一刻都成立。',
    en: 'How to measure content breakpoints, solving the slope of a clamp(), container queries and component autonomy, algorithmic layout primitives, reflow and target size, the three sources of CLS, and what causes layout thrashing. This layer locks in the previous five — making them hold from 320px to 2560px and from first byte to fully loaded.',
  },

  sections: [
    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '6.1',
      title: { zh: '断点应该由内容决定', en: 'Breakpoints Come From Content' },
      subtitle: {
        zh: '768 / 1024 / 1280 是某几台设备的尺寸，不是你的内容的尺寸。',
        en: '768 / 1024 / 1280 are the sizes of certain devices, not the sizes of your content.',
      },
      theory: ['intrinsic-design', 'every-layout'],
      demo: {
        id: 'breakpoint-finder',
        hint: {
          zh: '拖动容器宽度，D3 实时画出**行长、列宽、溢出量**三条曲线，并自动标出它们离开安全区的那个点 —— **那个点就是你的断点**。注意它落在 624px，而不是任何一个「标准」数值。',
          en: 'Drag the container width; D3 plots **measure, column width and overflow** live and marks where each leaves its safe zone — **that point is your breakpoint**. Note that it lands at 624px, not at any “standard” number.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '布局到底是在哪一刻坏掉的', en: 'At what width does a layout actually break?' } },
        {
          t: 'p',
          text: {
            zh: '上一章结尾留下的问题是：这个看板在 1440px 上已经很好，窗口一拖窄就散架。所以这一层的第一件事，是回答一个听起来很简单的问题 —— **它到底是在哪一个宽度上坏掉的？**',
            en: 'The previous chapter closed on this: the dashboard is good at 1440px and falls apart as soon as the window narrows. So the first job of this layer is to answer a question that sounds simple — **at exactly what width does it break?**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '绝大多数项目不回答这个问题，而是直接抄一组数字过来。几乎所有 CSS 框架都提供一组预设断点：576 / 768 / 992 / 1200。这些数字来自 2012 年前后几款流行设备的屏幕宽度。十几年过去，设备尺寸已经连成一片连续谱，但这组数字还在被抄。',
            en: 'Nearly every CSS framework ships a preset set of breakpoints: 576 / 768 / 992 / 1200. Those numbers come from the screen widths of a few popular devices around 2012. More than a decade on, device sizes form a continuous spectrum — and the numbers are still being copied.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '更根本的问题是：**断点应该回答「布局什么时候开始坏掉」，而这个问题的答案只取决于内容，不取决于设备。** 一张有 6 列的表格和一段纯文本，坏掉的位置显然不一样。用同一组断点服务所有内容，等于承认没有为任何一种内容做过测量。',
            en: 'The deeper issue: **a breakpoint should answer “when does this layout start to break”, and that answer depends on the content, never on the device.** A six-column table and a paragraph of prose break at obviously different widths. Using one set of breakpoints for all content is an admission that none of it was measured.',
          },
        },

        { t: 'h', text: { zh: '怎么测', en: 'How to measure' } },
        {
          t: 'ol',
          items: [
            { zh: '从最宽开始，缓慢拖窄窗口（或用演示里的滑块）。', en: 'Start at the widest and drag the window narrower slowly (or use the demo’s slider).' },
            { zh: '盯住三件事：**行长是否跌破 45ch**、**某一列是否窄到装不下内容**、**是否出现横向溢出**。', en: 'Watch three things: **does the measure drop below 45ch**, **does a column get too narrow for its content**, **does anything overflow horizontally**.' },
            { zh: '**第一个出问题的宽度，就是第一个断点。** 记下它。', en: '**The first width at which something goes wrong is your first breakpoint.** Write it down.' },
            { zh: '在那个宽度改变布局，然后继续拖窄，重复。', en: 'Change the layout at that width, then keep narrowing and repeat.' },
          ],
        },
        {
          t: 'note',
          text: {
            zh: '**一个好的布局通常只需要 1–2 个断点。** 如果你需要 5 个，说明布局本身不够有弹性 —— 每个断点都是一次「这套规则到这里失效了」的承认。**减少断点的正确方法不是删掉媒体查询，而是让规则本身更有弹性**（这就是 6.4 节算法布局原语要解决的）。',
            en: '**A good layout usually needs one or two breakpoints.** If you need five, the layout is not flexible enough — every breakpoint is an admission that a rule stopped working. **The way to reduce breakpoints is not to delete media queries but to make the rules themselves more elastic** — which is what §6.4’s algorithmic primitives are for.',
          },
        },

        { t: 'h', text: { zh: '案例的断点是怎么来的', en: 'Where the case’s breakpoint came from' } },
        {
          t: 'p',
          text: {
            zh: '拖动案例的看板，第一个坏掉的是趋势图。它在第 4 层被定为占 7 列；当容器窄到 **624px** 时，这 7 列的实际宽度只剩约 340px。在这个宽度上，横轴的刻度开始互相重叠，趋势也就读不出来了。',
            en: 'Narrowing the case dashboard, the first thing to break is the trend chart. Layer four gave it seven columns; once the container reaches **624px**, those seven columns are about 340px wide, and the x-axis ticks start overlapping so the trend stops being readable.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '所以 624px 是这个看板的断点。它不等于任何设备宽度，也不需要等于 —— **它等于「趋势图读不出来」的那个点**。换一份内容（比如换成柱状图），这个数字就会变。',
            en: 'So 624px is this dashboard’s breakpoint. It matches no device width, and it does not need to — **it is the point at which the trend chart stops being readable.** Change the content (to a bar chart, say) and the number changes with it.',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：断点是**测出来的**，不是**抄来的**。写 `@media (max-width: 39rem)` 时，你应该能说出「39rem 是因为趋势图在这里读不出来了」——**如果说不出来，这个断点就不该存在。**',
            en: '**One line to take away**: breakpoints are **measured**, not **copied**. When you write `@media (max-width: 39rem)` you should be able to say “39rem because the trend chart stops being readable there”. **If you cannot, the breakpoint should not exist.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: '断点用 rem，不用 px', en: 'Breakpoints in rem, not px' },
          purpose: { zh: '一个容易被忽略的可达性细节。', en: 'An accessibility detail that is easy to miss.' },
          code: `/* ✗ px 断点：用户把浏览器默认字号调大到 20px 时，断点位置不变，
       但文字变大了 —— 于是在断点触发前布局就已经挤爆了 */
@media (max-width: 624px) { /* … */ }

/* ✓ rem 断点：随用户字号缩放。默认 16px 时 = 624px；
       用户调到 20px 时 ≈ 780px —— 断点自动提前，正好补偿变大的文字 */
@media (max-width: 39rem) { /* … */ }`,
          highlight: [7],
          key: {
            zh: '**关键点**：媒体查询里的 `rem` **始终以浏览器默认字号为准**，不受根元素 `font-size` 影响 —— 这是规范的规定，也是它可靠的原因（否则会形成循环依赖：布局依赖字号，字号又依赖布局）。**所以 rem 断点精确地捕捉到了「用户觉得字有多大」这件事，而这正是断点该响应的东西。**',
            en: '**Key point**: `rem` inside a media query **always resolves against the browser’s default font size**, not the root element’s `font-size` — a deliberate rule, and the reason it is dependable (otherwise layout would depend on type size which depends on layout). **So a rem breakpoint captures exactly “how large the user finds the text”, which is what a breakpoint should respond to.**',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '6.2',
      title: { zh: 'clamp() 的数学', en: 'The Mathematics of clamp()' },
      subtitle: {
        zh: '流体排版不是「大概试一个 vw」，斜率是可以反解出来的。',
        en: 'Fluid typography is not “try some vw and see” — the slope can be solved for.',
      },
      theory: ['intrinsic-design', 'bringhurst'],
      demo: {
        id: 'clamp-plotter',
        hint: {
          zh: '设定两个锚点（360px 时 16px、1400px 时 20px），D3 画出 clamp 曲线与生成的 CSS。打开「用户缩放」开关会看到纯 `vw` 方案的致命问题：**页面完全不响应浏览器缩放**。',
          en: 'Set two anchors (16px at 360px, 20px at 1400px); D3 plots the clamp curve and the generated CSS. Switch on “user zoom” to see the fatal flaw of a pure `vw` approach: **the page stops responding to browser zoom entirely.**',
        },
      },
      explain: [
        { t: 'h', text: { zh: '问题：断点式字号的台阶', en: 'The problem: stepped type' } },
        {
          t: 'p',
          text: {
            zh: '传统做法是在每个断点重设字号：手机 16px，平板 18px，桌面 20px。问题是**在断点处会跳变** —— 窗口宽度变化 1px，标题突然大了 8px，而且 1399px 和 1400px 之间的所有宽度都得不到合适的字号。',
            en: 'The traditional approach resets type at each breakpoint: 16px on phones, 18px on tablets, 20px on desktops. The problem is the **jump at the breakpoint** — one pixel of window change and the heading grows 8px, while every width between 1399px and 1400px gets a size chosen for something else.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '`clamp(min, preferred, max)` 让字号在两个锚点之间**连续插值**：小于下锚点取 min，大于上锚点取 max，中间线性过渡。',
            en: '`clamp(min, preferred, max)` **interpolates continuously** between two anchors: below the lower anchor it is min, above the upper it is max, and in between it moves linearly.',
          },
        },

        { t: 'h', text: { zh: '反解斜率', en: 'Solving for the slope' } },
        {
          t: 'p',
          text: {
            zh: '已知两个锚点 (视口 w₁, 字号 s₁) 和 (w₂, s₂)，要求出 `preferred = A + B·vw` 中的 A 和 B。这是一条直线过两点的问题：',
            en: 'Given two anchors (viewport w₁, size s₁) and (w₂, s₂), find A and B in `preferred = A + B·vw`. This is just a line through two points:',
          },
        },
        {
          t: 'code',
          lang: 'text',
          code: `斜率   B = (s₂ − s₁) / (w₂ − w₁)        单位：px per px
截距   A = s₁ − B · w₁                     单位：px

写成 CSS：  clamp(s₁, A·rem + (B×100)·vw, s₂)
                        ↑ A 换算成 rem     ↑ B 换算成 vw 系数

例：(360, 16) 与 (1400, 20)
  B = (20 − 16) / (1400 − 360) = 0.003846
  A = 16 − 0.003846 × 360 = 14.615px = 0.9135rem
  → clamp(1rem, 0.9135rem + 0.3846vw, 1.25rem)`,
        },
        {
          t: 'p',
          text: {
            zh: '注意 `min` 写 `1rem` 而不是 `0.9135rem` —— **min 与 max 是你真正想要的两个端点值，A 只是为了让直线穿过它们而反解出来的截距，它本身不对应任何设计意图。** 混淆这两者是使用 clamp 时最常见的错误。',
            en: 'Note that `min` is `1rem`, not `0.9135rem` — **min and max are the two end values you actually want, while A is merely the intercept solved for to make the line pass through them, and corresponds to no design intent of its own.** Confusing the two is the commonest mistake with clamp.',
          },
        },

        { t: 'h', text: { zh: '为什么 A 必须带 rem', en: 'Why A must carry a rem' } },
        {
          t: 'pitfall',
          text: {
            zh: '**这是流体排版最严重的可达性陷阱。** 如果写成 `clamp(1rem, 4vw, 1.25rem)`（截距为 0，纯 vw），那么在中间区段字号**完全由视口宽度决定**。用户按 Ctrl+加号放大时，视口的 CSS 像素宽度会变小、`4vw` 跟着变小 —— 结果是**放大之后字号几乎没变**，缩放功能形同失效。WCAG 1.4.4 要求页面支持 200% 缩放，纯 vw 方案会直接违反它。',
            en: '**This is the most serious accessibility trap in fluid typography.** Written as `clamp(1rem, 4vw, 1.25rem)` — zero intercept, pure vw — the middle range is **determined entirely by viewport width**. When a user presses Ctrl-plus, the viewport’s CSS-pixel width shrinks and `4vw` shrinks with it, so **the text barely grows** and zoom is effectively disabled. WCAG 1.4.4 requires 200% zoom support, and a pure-vw approach violates it outright.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '带上 rem 截距之后，公式变成 `A·rem + B·vw`：缩放时 `A·rem` 那一项会跟着变大，用户的缩放意图得到了保留。**经验法则：rem 部分至少占目标字号的一半。**',
            en: 'With the rem intercept in place the formula is `A·rem + B·vw`: on zoom the `A·rem` term grows and the user’s intent survives. **Rule of thumb: the rem part should be at least half the target size.**',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：`clamp()` 不只是排版工具 —— 它适用于任何「有上下限的连续量」：间距、圆角、图表高度、甚至网格列数（配合 `minmax`）。**凡是你想写三条媒体查询来调的东西，先问问能不能用一个 clamp 表达。**',
            en: '**One line to take away**: `clamp()` is not only a typography tool — it fits any bounded continuous quantity: spacing, radii, chart heights, even column counts (with `minmax`). **Whenever you are about to write three media queries to tune something, ask whether one clamp expresses it.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'src/styles/tokens.css —— 流体音阶', en: 'src/styles/tokens.css — the fluid type scale' },
          purpose: { zh: '把第 3 层的八档音阶整体流体化，比例在两端都保持 1.25。', en: 'Making layer three’s eight-step scale fluid while keeping the 1.25 ratio at both ends.' },
          code: `:root {
  /* 锚点：360px 视口 → 16px 正文；1400px 视口 → 18px 正文 */
  --step-0: clamp(1rem,     0.958rem + 0.19vw,  1.125rem);
  --step-1: clamp(1.25rem,  1.183rem + 0.30vw,  1.406rem);
  --step-2: clamp(1.563rem, 1.461rem + 0.45vw,  1.758rem);
  --step-3: clamp(1.953rem, 1.803rem + 0.67vw,  2.197rem);
  --step-4: clamp(2.441rem, 2.222rem + 0.97vw,  2.746rem);
  --step-5: clamp(3.052rem, 2.735rem + 1.41vw,  3.433rem);

  /* 间距也流体化，但只动大档 —— 小档必须保持精确 */
  --space-7: clamp(3rem, 2.5rem + 2.2vw, 4rem);
  --space-8: clamp(4rem, 3.2rem + 3.5vw, 6rem);
}`,
          highlight: [11, 12],
          key: {
            zh: '**关键点在第 11–12 行的注释**：小间距（4/8/12/16px）**不应该**流体化。理由有两个：一是它们的作用是精确对齐（图标与文字的间隙、按钮内边距），差 1px 都看得出来；二是它们本来就很小，流体化带来的变化量还不到 2px，收益为零而复杂度翻倍。**流体化只对「大到能看出差别」的量有意义 —— 大间距、字号、容器宽度。**',
            en: '**The point is the comment on lines 11–12**: small gaps (4/8/12/16px) **should not** be fluid. Two reasons. They exist for precise alignment (an icon–text gap, a button’s padding), where one pixel shows. And they are small enough that fluidity would move them less than 2px — no benefit, twice the complexity. **Fluidity is only worth it for quantities big enough for the change to register: large gaps, type sizes, container widths.**',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '6.3',
      title: { zh: '容器查询：组件的自治', en: 'Container Queries: Component Autonomy' },
      subtitle: {
        zh: '组件不应该关心窗口多宽，只应该关心自己被放在多宽的地方。',
        en: 'A component should not care how wide the window is — only how wide the space it was put in.',
      },
      theory: ['css-containment', 'css-conditional-5', 'intrinsic-design'],
      demo: {
        id: 'container-query',
        hint: {
          zh: '同一个卡片组件被同时放进三个不同宽度的容器。拖动任意一个容器的宽度，**只有它内部的卡片会重排** —— 而媒体查询版本的三个卡片会一起变，哪怕其中两个的空间根本没变。',
          en: 'One card component placed in three containers of different widths. Drag any one container and **only the card inside it re-lays out** — while the media-query version changes all three at once, even though two of them have the same space they always had.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '媒体查询的结构性缺陷', en: 'The structural flaw in media queries' } },
        {
          t: 'p',
          text: {
            zh: '媒体查询问的是「**窗口**多宽」，但组件真正需要知道的是「**我**多宽」。这两者在单栏页面里碰巧相等，一旦组件可以被放进侧栏、模态框、分栏，就不再相等了。',
            en: 'A media query asks how wide the **window** is, while a component needs to know how wide **it** is. Those happen to coincide in a single-column page, and stop coinciding the moment a component can be dropped into a sidebar, a modal, or a split pane.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '后果是组件无法真正复用：同一个卡片在主区（900px）和侧栏（300px）需要不同的布局，但媒体查询只能看到「窗口 1440px」这一个事实。常见的绕法是给组件加 `.card--compact` 修饰类，由**父级**决定 —— 于是组件的布局知识泄漏到了调用方。',
            en: 'The consequence is that components cannot really be reused: the same card needs different layouts in a 900px main area and a 300px sidebar, but the media query only sees “window is 1440px”. The usual workaround is a `.card--compact` modifier decided by the **parent** — which leaks the component’s layout knowledge to its callers.',
          },
        },

        { t: 'h', text: { zh: '容器查询的两步', en: 'Container queries in two steps' } },
        {
          t: 'ol',
          items: [
            { zh: '**声明容器**：`container-type: inline-size`，把某个祖先标记为查询基准。', en: '**Declare the container**: `container-type: inline-size` marks an ancestor as the query basis.' },
            { zh: '**查询它**：`@container (min-width: 30rem) { … }`，条件对的是容器宽度。', en: '**Query it**: `@container (min-width: 30rem) { … }` tests the container’s width.' },
          ],
        },
        {
          t: 'pitfall',
          text: {
            zh: '**为什么是 `inline-size` 而不是 `size`**：容器查询要求容器在被查询的轴上**独立于内容**（否则会循环：容器宽度决定子元素布局，子元素又决定容器宽度）。`inline-size` 只约束横轴 —— 横向宽度本来就由外部决定，纵向仍然由内容撑开，符合直觉。如果写 `container-type: size`，**纵向也会被约束，容器高度会塌成 0**，这是初学容器查询最常踩的坑。',
            en: '**Why `inline-size` and not `size`**: a container query needs the container to be **independent of its contents** on the queried axis (otherwise it loops — container width decides child layout which decides container width). `inline-size` constrains only the inline axis: width comes from outside anyway, while height still grows with content, as you would expect. Write `container-type: size` and **the block axis is constrained too, collapsing the container’s height to zero** — the classic first stumble with container queries.',
          },
        },

        { t: 'h', text: { zh: '容器查询单位', en: 'Container query units' } },
        {
          t: 'p',
          text: {
            zh: '`cqi`（容器行内尺寸的 1%）、`cqb`（块向）、`cqmin` / `cqmax`。它们让组件内部的尺寸也相对于容器，而不是视口。',
            en: '`cqi` (1% of the container’s inline size), `cqb` (block axis), `cqmin` / `cqmax`. They let sizes inside the component be relative to the container rather than the viewport.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '这补上了 6.2 节的最后一块：`clamp(1rem, 0.9rem + 1cqi, 1.5rem)` —— 字号跟着**容器**而不是窗口流动，于是同一个组件放在侧栏时字号自动变小。**这才是「组件自治」的完整形态。**',
            en: 'This completes §6.2’s last piece: `clamp(1rem, 0.9rem + 1cqi, 1.5rem)` — type flows with the **container** rather than the window, so the same component in a sidebar automatically uses smaller type. **That is component autonomy in its complete form.**',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：媒体查询适合**页面级**决策（整站骨架、导航形态、打印样式），容器查询适合**组件级**决策（卡片内部、图表配置）。**判据很简单：如果这条规则写在组件的样式文件里，它几乎一定应该是容器查询。**',
            en: '**One line to take away**: media queries suit **page-level** decisions (the site skeleton, the shape of navigation, print styles); container queries suit **component-level** ones (a card’s internals, a chart’s configuration). **The test is simple: if the rule lives in a component’s stylesheet, it should almost certainly be a container query.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: '案例：看板变成自治组件', en: 'The case: the dashboard becomes an autonomous component' },
          purpose: { zh: '同一个看板，放进主区和放进侧栏都正确。', en: 'One dashboard, correct in the main area and correct in a sidebar.' },
          code: `.dash {
  container-type: inline-size;
  container-name: dash;
}

/* 窄容器：单列，areas 重写一遍（第 4.2 节讲过的手法） */
@container dash (max-width: 39rem) {
  .dash {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'head' 'filt' 'summ' 'kpis' 'trnd' 'brkd' 'tabl' 'acts';
  }
  .kpi[data-rank='primary'] { grid-column: span 1; }   /* 单列时跨两列无意义 */
}

/* 极窄容器（侧栏场景）：隐藏趋势图，只保留关键数字 */
@container dash (max-width: 22rem) {
  .dash__trend, .dash__breakdown { display: none; }
}`,
          highlight: [12, 17],
          key: {
            zh: '**关键点在第 12 行和第 17 行，它们是两种不同性质的适应。** 第 12 行是**重排**：单列时「跨两列」失去意义，但主指标的其他三根层级杠杆（字号、留白、对比）都还在，层级不受影响。第 17 行是**取舍**：容器窄到 22rem 时，趋势图已经不可读（6.1 节的测量结论），此时**隐藏它比画一张读不出来的图更诚实**。注意这是「隐藏不可读的图表」，不是「隐藏内容」—— 数字本身仍然全部保留。**在小屏上砍掉真正的信息，是响应式设计里最常见的傲慢。**',
            en: '**Lines 12 and 17 are two different kinds of adaptation.** Line 12 is **re-ranking**: spanning two columns is meaningless in a single column, but the primary metric’s other three levers (size, whitespace, contrast) are untouched, so the hierarchy survives. Line 17 is a **trade-off**: below 22rem the trend chart is already unreadable (§6.1’s measurement), and **hiding it is more honest than drawing a chart nobody can read**. Note this hides an unreadable *chart*, not *content* — every number stays. **Cutting real information on small screens is the commonest arrogance in responsive design.**',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '6.4',
      title: { zh: '算法布局：不用断点的适应', en: 'Algorithmic Layout: Adapting Without Breakpoints' },
      subtitle: {
        zh: '最好的响应式代码，是一条媒体查询都没有的那种。',
        en: 'The best responsive code is the kind with no media queries at all.',
      },
      theory: ['every-layout', 'intrinsic-design', 'css-box-alignment'],
      demo: {
        id: 'intrinsic-patterns',
        hint: {
          zh: '四个原语（Switcher / RAM / Sidebar / Reel）并排，拖动宽度观察它们各自的切换时刻。**这四段 CSS 加起来不到 20 行，覆盖了日常布局里大约 80% 的响应式需求 —— 而且没有一条媒体查询。**',
          en: 'Four primitives (Switcher, RAM, Sidebar, Reel) side by side; drag the width and watch each switch on its own. **Together they are under 20 lines of CSS and cover roughly 80% of everyday responsive needs — with not one media query.**',
        },
      },
      explain: [
        { t: 'h', text: { zh: '把条件写进算式', en: 'Putting the condition inside the arithmetic' } },
        {
          t: 'p',
          text: {
            zh: '媒体查询和容器查询都是**显式条件**：「宽度小于 X 时做 Y」。而 CSS 还有另一条路 —— 把条件**编码进算式本身**，让布局在阈值处自动翻转，不需要任何查询。',
            en: 'Media and container queries are **explicit conditions**: “when width is below X, do Y”. CSS offers another route — **encode the condition into the arithmetic** so the layout flips at a threshold on its own, with no query at all.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '这类写法通常依赖 `min()` / `max()` / `minmax()` 与 `flex-basis` 的相互作用，效果是**根据可用空间自动切换**，且切换点由内容需求推导。这比查询更符合第 6.1 节的立场：断点由内容决定 —— 而这里干脆没有断点这个概念。',
            en: 'These techniques usually rely on the interplay of `min()`, `max()`, `minmax()` and `flex-basis`, producing **automatic switching based on available space**, with the switch point derived from what the content needs. This sits even better with §6.1’s position than queries do: breakpoints come from content — and here there is no breakpoint at all.',
          },
        },

        { t: 'h', text: { zh: '四个原语', en: 'The four primitives' } },
        {
          t: 'table',
          head: [
            { zh: '原语', en: 'Primitive' },
            { zh: '行为', en: 'Behaviour' },
            { zh: '案例中的用处', en: 'Where the case uses it' },
          ],
          rows: [
            [
              { zh: '**Switcher**', en: '**Switcher**' },
              { zh: '空间够时横排，不够时**整体**竖排（不是逐个换行）', en: 'Horizontal when there is room; **all-or-nothing** vertical when there is not (never one item at a time)' },
              { zh: '趋势图 + 分布图这一对', en: 'The trend / breakdown pair' },
            ],
            [
              { zh: '**RAM**', en: '**RAM**' },
              { zh: '`repeat(auto-fit, minmax(min(100%, Npx), 1fr))`，列数自适应', en: '`repeat(auto-fit, minmax(min(100%, Npx), 1fr))` — the column count adapts' },
              { zh: 'KPI 卡片区', en: 'The KPI cards' },
            ],
            [
              { zh: '**Sidebar**', en: '**Sidebar**' },
              { zh: '一侧固定、一侧填满，主区窄于阈值时自动堆叠', en: 'One side fixed, one side fills; stacks automatically when the main side falls below a threshold' },
              { zh: '明细表 + 操作区', en: 'The table plus the actions panel' },
            ],
            [
              { zh: '**Reel**', en: '**Reel**' },
              { zh: '横向滚动而不是换行，配 `scroll-snap`', en: 'Scrolls horizontally rather than wrapping, with `scroll-snap`' },
              { zh: '窄屏下的筛选器标签行', en: 'The filter chips on narrow screens' },
            ],
          ],
        },
        {
          t: 'note',
          text: {
            zh: '**Switcher 的「整体切换」是关键差异。** 普通的 `flex-wrap` 是逐个换行：三栏变成「两栏 + 一栏」这种半吊子状态，最后一个元素被拉成两倍宽（第 4.1 节批评过的那个破绽）。Switcher 用 `flex-basis: calc((阈值 - 100%) * 999)` 这个技巧，让所有元素**同时**翻转 —— **要么全横排，要么全竖排，没有中间态。**',
            en: '**Switcher’s all-or-nothing behaviour is the crucial difference.** Ordinary `flex-wrap` wraps one item at a time, so three columns become an awkward “two plus one” and the last item stretches to double width (the tell criticised in §4.1). Switcher uses the `flex-basis: calc((threshold - 100%) * 999)` trick so every item flips **at once** — **all horizontal or all vertical, never in between.**',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：这些原语能取代大部分媒体查询，因为**它们的切换条件是「空间够不够」，而这正是你本来想表达的意思**。媒体查询是用「窗口多宽」去**近似**「空间够不够」—— 一层不必要的间接。**案例最终只剩一条媒体查询，就是这个原因。**',
            en: '**One line to take away**: these primitives replace most media queries because **their condition is “is there enough room”, which is what you meant all along**. A media query uses “how wide is the window” to **approximate** “is there enough room” — an unnecessary layer of indirection. **That is why the case ends with exactly one media query.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'src/styles/primitives.css（节选）', en: 'src/styles/primitives.css (excerpt)' },
          purpose: { zh: '四个原语的完整实现。', en: 'The four primitives, complete.' },
          code: `/* Switcher：低于 --switch-at 时整体竖排 */
.switcher {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
  --switch-at: 34rem;
}
.switcher > * {
  flex-grow: 1;
  flex-basis: calc((var(--switch-at) - 100%) * 999);
}

/* RAM：列数自适应，且永不溢出 */
.ram {
  display: grid;
  gap: var(--space-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
}

/* Sidebar：主区低于 50% 时自动堆叠 */
.with-sidebar { display: flex; flex-wrap: wrap; gap: var(--space-5); }
.with-sidebar > :first-child { flex-grow: 1; flex-basis: 18rem; }
.with-sidebar > :last-child  { flex-grow: 999; flex-basis: 0; min-inline-size: 50%; }`,
          highlight: [10, 17, 23],
          key: {
            zh: '**第 10 行是全课程最值得拆解的一行。** `calc((34rem - 100%) * 999)`：当容器宽度 < 34rem 时括号为正，乘 999 后得到一个巨大的正数，`flex-basis` 被钳到 100%，于是每个元素独占一行；当容器 > 34rem 时括号为负，乘 999 得到巨大的负数，`flex-basis` 被钳到 0，于是元素靠 `flex-grow: 1` 平分一行。**这是用一个乘法实现的 if 语句** —— 999 的作用是把过渡区间压缩到几乎不存在，使切换看起来是瞬时的。第 17 行的 `min(100%, 15rem)` 同理：它保证在容器窄于 15rem 时轨道也不会溢出 —— **裸写 `minmax(15rem, 1fr)` 在 320px 手机上会横向溢出，这是 RAM 模式最常见的漏写。**',
            en: '**Line 10 is the single line in this course most worth unpacking.** `calc((34rem - 100%) * 999)`: below 34rem the bracket is positive, ×999 makes it enormous, `flex-basis` clamps to 100%, and every item takes a full line. Above 34rem the bracket is negative, ×999 makes it hugely negative, `flex-basis` clamps to 0, and items share one line via `flex-grow: 1`. **It is an if-statement implemented with a multiplication** — the 999 squeezes the transition band to near nothing so the switch looks instantaneous. Line 17’s `min(100%, 15rem)` works on the same logic: it keeps the track from overflowing when the container is narrower than 15rem — **bare `minmax(15rem, 1fr)` overflows horizontally on a 320px phone, the commonest omission in the RAM pattern.**',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '6.5',
      title: { zh: '重排、缩放与目标尺寸', en: 'Reflow, Zoom and Target Size' },
      subtitle: {
        zh: '400% 缩放不是边缘场景 —— 它是低视力用户的日常。',
        en: '400% zoom is not an edge case — it is how low-vision users work every day.',
      },
      theory: ['wcag-22', 'fitts-law'],
      demo: {
        id: 'reflow-audit',
        hint: {
          zh: '把缩放推到 400%，D3 自动标出**横向溢出区域**与**小于 24×24px 的点击目标**。这正是 WCAG 1.4.10 和 2.5.8 的机器化检查。',
          en: 'Push the zoom to 400% and D3 flags **horizontal overflow** and **targets smaller than 24×24px** — a machine check of WCAG 1.4.10 and 2.5.8.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '手机适配和 400% 缩放是同一件事', en: 'Phone support and 400% zoom are the same job' } },
        {
          t: 'p',
          text: {
            zh: '前四节一直在讲「让布局在各种宽度下都成立」，理由说的是设备多样性。但还有一个更硬的理由，它写在规范里：**有人会把页面放大四倍来读。**',
            en: 'The last four sections have been about making a layout hold at any width, justified by the variety of devices. There is a harder reason, and it is written into a standard: **some people read your page magnified four times.**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '低视力用户使用浏览器缩放，是日常，不是边缘场景。而缩放在技术上等同于把视口变窄 —— 这就是为什么这一节属于「适应层」，而不属于某个单独的可达性章节。',
            en: 'Browser zoom is daily life for low-vision users, not an edge case. And zooming is technically identical to narrowing the viewport — which is why this section belongs to the adaptive layer rather than to some separate accessibility chapter.',
          },
        },
        {
          t: 'quote',
          text: {
            zh: '内容可以在不损失信息或功能、且无需在两个维度上滚动的情况下呈现：垂直滚动内容的宽度等效于 320 CSS 像素，水平滚动内容的高度等效于 256 CSS 像素。',
            en: 'Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for vertically scrolling content at a width equivalent to 320 CSS pixels.',
          },
          cite: { zh: 'WCAG 2.2，成功准则 1.4.10「重排」（AA 级）', en: 'WCAG 2.2, Success Criterion 1.4.10 Reflow (Level AA)' },
        },
        {
          t: 'p',
          text: {
            zh: '320px 这个数字是怎么来的？**1280px 宽的桌面浏览器放大到 400%，视口的 CSS 像素宽度就是 320px。** 所以这条准则的真实含义是：**低视力用户把页面放大四倍之后，仍然不需要左右滚动。**',
            en: 'Where does 320px come from? **A 1280px desktop browser at 400% zoom has a viewport 320 CSS pixels wide.** So the real meaning of this criterion is: **after magnifying the page fourfold, a low-vision user still should not have to scroll sideways.**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '**这也意味着「手机适配」和「400% 缩放适配」在技术上是同一件事** —— 都是 320px 视口。你为手机做的响应式工作，同时也在服务低视力用户；反过来，如果你的响应式只做到 768px 就停了，那是两类用户一起丢掉。',
            en: '**It also means “phone support” and “400% zoom support” are technically the same job** — both are a 320px viewport. The responsive work you do for phones serves low-vision users too; conversely, stopping your responsive work at 768px loses both groups at once.',
          },
        },

        { t: 'h', text: { zh: '两个例外与一条红线', en: 'Two exemptions and one hard line' } },
        {
          t: 'ul',
          items: [
            { zh: '**例外**：需要二维布局才能理解的内容 —— 数据表格、地图、五线谱、代码块。这些允许横向滚动。', en: '**Exempt**: content that needs two dimensions to make sense — data tables, maps, musical notation, code blocks. These may scroll horizontally.' },
            { zh: '**红线**：例外是「这个元素可以横向滚动」，不是「整个页面可以横向滚动」。**表格必须放在自己的 `overflow-x: auto` 容器里**，滚动它不应该带动整页。', en: '**The hard line**: the exemption is “this element may scroll”, not “the page may scroll”. **A table belongs in its own `overflow-x: auto` container**, and scrolling it must not move the page.' },
          ],
        },
        {
          t: 'pitfall',
          text: {
            zh: '**最隐蔽的横向溢出来源不是表格，是 `min-width`。** 一个写在深层组件里的 `min-width: 480px`，在 1280px 下完全看不出来，到 320px 时会把整个页面撑宽 —— 而且因为它不在顶层，排查时很难定位。**自查方法**：`* { outline: 1px solid red }` 配合 320px 视口，第一眼就能看到哪个盒子越界了。',
            en: '**The most insidious source of horizontal overflow is not tables but `min-width`.** A `min-width: 480px` buried in a deep component is invisible at 1280px and stretches the whole page at 320px — and being deep in the tree, it is hard to find. **A quick check**: `* { outline: 1px solid red }` at a 320px viewport shows immediately which box is over the edge.',
          },
        },

        { t: 'h', text: { zh: '目标尺寸：2.5.8', en: 'Target size: SC 2.5.8' } },
        {
          t: 'p',
          text: {
            zh: 'WCAG 2.2 新增的 AA 级准则要求点击目标至少 **24×24 CSS 像素**（AAA 级要求 44×44）。这条准则的理论基础是**费茨定律**：指点时间与目标距离成正比、与目标尺寸成反比。目标越小，所需时间越长、误击率越高。',
            en: 'A new AA criterion in WCAG 2.2 requires pointer targets of at least **24×24 CSS pixels** (44×44 at AAA). Its theoretical basis is **Fitts’s law**: pointing time grows with distance and shrinks with target size. Smaller targets take longer and are missed more often.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '注意 24px 是**目标区域**，不是**视觉尺寸**。一个 16×16 的图标按钮完全可以通过 `padding` 或伪元素把可点击区域扩到 24×24，视觉上仍然是 16px。**这是布局问题，不是视觉问题 —— 所以它属于这一层。**',
            en: 'Note that 24px is the **target area**, not the **visual size**. A 16×16 icon button can expand its hit area to 24×24 with padding or a pseudo-element while still looking 16px. **That is a layout problem, not a visual one — which is why it belongs to this layer.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: '扩大点击区而不改变视觉尺寸', en: 'Growing the hit area without changing the look' },
          purpose: { zh: '案例里剩下的 2 个可达性问题就是这么解决的。', en: 'How the case’s last two accessibility issues were solved.' },
          code: `.icon-btn {
  inline-size: 1rem; block-size: 1rem;   /* 视觉仍然是 16px */
  position: relative;
}
.icon-btn::after {
  content: '';
  position: absolute;
  /* 向四周各扩 4px → 命中区 24×24，视觉不变 */
  inset: -0.25rem;
}

/* 密集排列时还要保证目标之间不重叠：间距 ≥ 与扩展量匹配 */
.toolbar { display: flex; gap: var(--space-3); }  /* 12px > 2×4px */`,
          highlight: [9, 13],
          key: {
            zh: '**关键点在第 13 行。** 用伪元素扩大命中区有个隐患：**相邻按钮的扩展区可能重叠**，重叠处的点击会命中层级更高的那一个，于是「点了 A 却触发了 B」。更糟的是扩展区不可见，用户完全没有线索去理解刚才发生了什么。所以扩展命中区必须和间距一起设计：**间距 ≥ 两侧扩展量之和。** 这里 12px 的间距大于 4+4=8px，安全。**可达性修复本身也需要被检查，这是最容易被忽略的一环。**',
            en: '**Line 13 is the point.** Expanding a hit area with a pseudo-element has a hazard: **adjacent buttons’ expanded areas can overlap**, and in the overlap the topmost one wins, so “I clicked A and B fired” — and because the expansion is invisible, the user cannot possibly understand why. So hit-area expansion must be designed together with spacing: **gap ≥ the sum of the two expansions.** Here 12px beats 4+4=8px, so it is safe. **An accessibility fix needs checking too — the step most often skipped.**',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '6.6',
      title: { zh: '布局稳定性：CLS', en: 'Layout Stability: CLS' },
      subtitle: {
        zh: '页面加载过程中的每一次跳动，都是一次对用户注意力的背叛。',
        en: 'Every jump during load is a small betrayal of the reader’s attention.',
      },
      theory: ['web-vitals-cls', 'wcag-22'],
      demo: {
        id: 'cls-lab',
        hint: {
          zh: '模拟三种典型的加载时序，D3 实时累计 CLS 分数并画出每次偏移的**影响区域 × 距离分数**。然后逐项打开修复方案，看着分数从 0.31 掉到 0.004。',
          en: 'Simulate three typical load sequences while D3 accumulates the CLS score and draws each shift’s **impact fraction × distance fraction**. Then switch the fixes on one by one and watch the score fall from 0.31 to 0.004.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '前面六节讲的是空间，这一节讲时间', en: 'Six sections about space; this one is about time' } },
        {
          t: 'p',
          text: {
            zh: '到目前为止，这门课讨论的一直是**页面最终长什么样**。但读者并不是一下子看到那个最终状态的 —— 他看到的是一个过程：HTML 先到，字体后到，图片再后到，接口数据最后到。**每一次「到」都可能让已经画好的东西挪位置。**',
            en: 'Up to now this course has been about **what the page finally looks like**. But a reader never sees that final state arrive all at once — they see a process: the HTML lands, then the fonts, then the images, and the API data last of all. **Every one of those arrivals can shove what is already on screen.**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '这就是本课程唯一一个带时间维度的指标要度量的东西：**累计布局偏移（CLS）**。它回答的问题是「页面在成型的过程中，把读者的目标挪走了多少次、挪了多远」。',
            en: 'That is what the one time-dependent metric in this course measures: **Cumulative Layout Shift (CLS)**. The question it answers is “while the page was coming together, how often and how far did it move the thing the reader was aiming at?”',
          },
        },
        {
          t: 'p',
          text: {
            zh: '单次布局偏移分数 = **影响区域占比 × 移动距离占比**。前者是「受影响的元素占视口的多大面积」，后者是「它们移动了视口尺寸的百分之几」。CLS 取一个会话窗口（最多 5 秒、间隔不超过 1 秒）内偏移分数之和的最大值。',
            en: 'A single layout-shift score is **impact fraction × distance fraction**: how much of the viewport the affected elements cover, times how far they moved as a share of viewport size. CLS is the largest sum of those scores within a session window (at most five seconds, with gaps under one second).',
          },
        },
        {
          t: 'p',
          text: {
            zh: '两个要点常被忽略：**一，用户交互后 500ms 内的偏移不计入**（点击「展开」导致的位移是预期内的）。**二，取的是窗口最大值而不是总和** —— 所以一次严重的跳动比五次轻微的更致命。',
            en: 'Two details often missed. **First, shifts within 500ms of a user interaction do not count** (movement after clicking “expand” is expected). **Second, it takes the window maximum rather than the total** — so one severe jump is worse than five mild ones.',
          },
        },

        { t: 'h', text: { zh: '三个来源与三个修法', en: 'Three sources, three fixes' } },
        {
          t: 'table',
          head: [
            { zh: '来源', en: 'Source' },
            { zh: '症状', en: 'Symptom' },
            { zh: '修法', en: 'Fix' },
          ],
          rows: [
            [
              { zh: '**无尺寸的媒体**', en: '**Media without dimensions**' },
              { zh: '图片加载完成的瞬间，下方所有内容被推走', en: 'The instant an image lands, everything below is pushed down' },
              { zh: '`aspect-ratio` + `width: 100%`，或写死 `width`/`height` 属性', en: '`aspect-ratio` with `width: 100%`, or explicit `width`/`height` attributes' },
            ],
            [
              { zh: '**异步注入的内容**', en: '**Async-injected content**' },
              { zh: '数据返回后图表从 0 高度撑开到 320px', en: 'The chart expands from zero to 320px when the data arrives' },
              { zh: '骨架屏预留**等高**空间 —— 关键是等高，不是「有个骨架」', en: 'A skeleton reserving the **same height** — equal height is the point, not merely having a skeleton' },
            ],
            [
              { zh: '**字体切换（FOUT）**', en: '**Font swap (FOUT)**' },
              { zh: '自定义字体加载完成时，所有文本行高与宽度变化', en: 'Line heights and widths change when the custom font lands' },
              { zh: '`font-display: optional` + `size-adjust` 对齐回退字体度量', en: '`font-display: optional` plus `size-adjust` to match the fallback’s metrics' },
            ],
          ],
        },
        {
          t: 'note',
          text: {
            zh: '**关于骨架屏的常见误用**：很多骨架屏的高度和真实内容不一致（骨架 200px、真实内容 280px），结果是**把一次大跳动换成了一次小跳动**，而不是消除它。骨架屏的价值在于**尺寸契约**，不在于那个灰色的动画。**如果你的骨架屏高度是随手写的，它只是一个安慰剂。**',
            en: '**A common misuse of skeletons**: the skeleton’s height often does not match the real content (200px versus 280px), which **trades a big jump for a small one** rather than removing it. A skeleton’s value is the **size contract**, not the shimmering grey. **If its height was picked casually, it is a placebo.**',
          },
        },

        { t: 'h', text: { zh: '案例：0.31 → 0.004', en: 'The case: 0.31 → 0.004' } },
        {
          t: 'p',
          text: {
            zh: 'stage0 的 0.31 来自三处：学院 logo 没有尺寸（0.14）、两张图表异步撑开（0.13）、自定义字体切换（0.04）。逐项修复之后剩下 0.004 —— 这部分来自字体切换的残余，用 `size-adjust` 已经压到几乎不可见。',
            en: 'stage0’s 0.31 came from three places: the school logo with no dimensions (0.14), two charts expanding asynchronously (0.13), and the font swap (0.04). Fixing each leaves 0.004 — the residue of the font swap, already pressed to near invisibility with `size-adjust`.',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：CLS 的本质不是性能问题，是**尺寸契约问题**。每一个「加载后才知道多大」的元素，都是一次违约。**修复 CLS 的过程，就是把所有隐式的尺寸假设变成显式的声明** —— 这也是为什么它属于布局课程，而不是性能课程。',
            en: '**One line to take away**: CLS is not really a performance problem but a **size-contract problem**. Every element whose size is only known after loading is a breach. **Fixing CLS means turning every implicit size assumption into an explicit declaration** — which is why it belongs in a layout course rather than a performance one.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: '三处修复', en: 'The three fixes' },
          purpose: { zh: '全部是「提前声明尺寸」，没有一处是运行时补救。', en: 'All three declare size up front; none of them patch at runtime.' },
          code: `/* 1. 媒体：aspect-ratio 让浏览器在图片到达前就知道要留多高 */
.dash__logo { inline-size: 3rem; aspect-ratio: 1; }
.dash__hero-img { inline-size: 100%; aspect-ratio: 16 / 9; }

/* 2. 异步图表：骨架与真实图表共用同一个高度变量 —— 契约写在一处 */
.chart-slot { --chart-h: 20rem; block-size: var(--chart-h); }
.chart-slot > .skeleton,
.chart-slot > svg { block-size: 100%; }

/* 3. 字体：用 size-adjust 让回退字体的度量对齐自定义字体 */
@font-face {
  font-family: 'Inter fallback';
  src: local('Arial');
  size-adjust: 107%;      /* 实测值：让 Arial 的 x-height 对齐 Inter */
  ascent-override: 90%;
  descent-override: 22%;
}
body { font-family: 'Inter', 'Inter fallback', sans-serif; }`,
          highlight: [6, 14],
          key: {
            zh: '**关键点在第 6 行的做法：把高度契约写成一个变量，让骨架和真实内容都引用它。** 这样契约只有一处定义，不可能出现「改了图表高度忘了改骨架」的漂移 —— **而这正是骨架屏在真实项目里失效的主要方式**（第一版对齐了，三次迭代之后就不对了）。第 14 行的 `size-adjust: 107%` 是**实测值**：用 Chrome DevTools 对比两种字体的 x-height 调出来的，不同字体组合的数值完全不同，抄别人的没有意义。',
            en: '**Line 6 is the technique: write the height contract once as a variable that both the skeleton and the real content reference.** With one definition there is no way to “change the chart height and forget the skeleton” — **which is exactly how skeletons stop working in real projects** (aligned in version one, drifted three iterations later). Line 14’s `size-adjust: 107%` is a **measured** value, derived by comparing x-heights in DevTools; it differs for every font pairing, so copying someone else’s is pointless.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '6.7',
      title: { zh: '布局性能：抖动与包含', en: 'Layout Performance: Thrashing and Containment' },
      subtitle: {
        zh: '布局是浏览器渲染流水线里最贵的一步，而抖动能让它变成 O(n²)。',
        en: 'Layout is the most expensive step in the rendering pipeline — and thrashing makes it O(n²).',
      },
      theory: ['forced-reflow', 'css-containment'],
      demo: {
        id: 'thrash-lab',
        hint: {
          zh: '同一段操作 200 个元素的代码，切换「读写交替」与「先读后写」，D3 画出实测耗时对比。**差距通常在一个数量级以上** —— 而两段代码的逻辑完全等价。',
          en: 'The same code over 200 elements, run interleaved and then batched; D3 charts the measured times. **The gap is usually more than an order of magnitude** — and the two versions are logically identical.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '上一节是「别乱动」，这一节是「别乱问」', en: 'The last section said stop moving things; this one says stop asking' } },
        {
          t: 'p',
          text: {
            zh: '上一节处理的是布局**发生得不是时候**。这一节处理的是布局**发生得太多次**。两者的根源其实相同：浏览器很想把布局计算攒起来一次做完，而我们总有办法打断它。',
            en: 'The previous section dealt with layout happening **at the wrong moment**. This one deals with layout happening **far too many times**. The root cause is the same in both: the browser would very much like to batch its layout work, and we keep finding ways to interrupt it.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '布局是渲染流水线里最贵的一步 —— 它要为整棵树重新求解几何。所以浏览器会把样式修改**批量累积**，等到下一帧统一计算布局。但如果你在修改之后**立刻读取**一个依赖布局的属性（`offsetWidth`、`getBoundingClientRect()`、`scrollTop`…），浏览器不得不**立即**执行一次完整的布局计算才能给出正确答案。这就是「强制同步布局」。',
            en: 'The browser **batches** style changes and computes layout once on the next frame. But read a layout-dependent property **immediately** after a write (`offsetWidth`, `getBoundingClientRect()`, `scrollTop`…) and it must run a full layout **right then** to answer correctly. That is forced synchronous layout.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '在循环里读写交替，就成了**布局抖动**：每次迭代强制一次全量布局，n 个元素触发 n 次布局，每次布局的成本又与元素总数相关 —— **总复杂度退化成 O(n²)**。',
            en: 'Interleave reads and writes in a loop and you get **layout thrashing**: every iteration forces a full layout, n elements trigger n layouts, and each layout costs in proportion to the total element count — **degrading the whole thing to O(n²)**.',
          },
        },

        { t: 'h', text: { zh: '修法：读写分离', en: 'The fix: separate reads from writes' } },
        {
          t: 'p',
          text: {
            zh: '把所有读操作集中在前面，所有写操作集中在后面。这样只触发一次布局。这个模式有个名字叫 **read-then-write**，也是 FastDOM 这类库的全部内容。',
            en: 'Group all reads first and all writes after, so layout runs once. The pattern is called **read-then-write**, and it is the entire content of libraries like FastDOM.',
          },
        },
        {
          t: 'note',
          text: {
            zh: '**Svelte / React 用户注意**：框架的批量更新机制已经帮你做了大部分读写分离。但**你自己写的 `$effect` / `useEffect` 里如果混用 `getBoundingClientRect()` 和样式写入，抖动照样发生** —— 框架管不到你手写的 DOM 操作。本站的 D3 演示组件全部遵守这条规则，因为它们确实需要直接读取布局。',
            en: '**A note for Svelte / React users**: the framework’s batched updates already do most of the separation for you. But **if your own `$effect` / `useEffect` mixes `getBoundingClientRect()` with style writes, thrashing happens anyway** — the framework cannot police hand-written DOM work. Every D3 demo on this site follows the rule, because they genuinely do need to read layout directly.',
          },
        },

        { t: 'h', text: { zh: 'contain 与 content-visibility', en: 'contain and content-visibility' } },
        {
          t: 'p',
          text: {
            zh: '`contain` 告诉浏览器「这个子树的变化不会影响外部」，于是布局计算可以**局部化**：改动一个卡片内部，不需要重算整页。',
            en: '`contain` tells the browser “changes in this subtree do not affect the outside”, so layout can be **localised**: change a card’s internals and the page need not be recomputed.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '`content-visibility: auto` 更进一步：**屏幕外的元素完全跳过渲染**（布局、绘制都跳过）。对长列表效果显著 —— 但必须配 `contain-intrinsic-size` 给出尺寸估计，**否则滚动条长度会随滚动不断跳变，而且会直接制造 CLS**（回到 6.6 节：又是一次尺寸契约的违约）。',
            en: '`content-visibility: auto` goes further: **off-screen elements skip rendering entirely** — no layout, no paint. The effect on long lists is dramatic — but it must be paired with `contain-intrinsic-size` to supply an estimate, **or the scrollbar length jumps around as you scroll and you generate CLS directly** (back to §6.6: another breach of the size contract).',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：布局性能问题几乎都来自**打断浏览器的批量优化**。浏览器已经很努力了 —— 不要在它准备批量处理的时候问它「现在多宽？」。**这条原则的适用范围远超布局：任何批量系统都讨厌中途查询。**',
            en: '**One line to take away**: layout performance problems almost all come from **interrupting the browser’s batching**. The browser is already trying hard — do not ask it “how wide is it now?” while it is preparing to batch. **The principle extends well past layout: every batching system resents a mid-flight query.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'js',
          file: { zh: '抖动与修复', en: 'Thrashing and its fix' },
          purpose: { zh: '两段逻辑完全等价的代码，性能差一个数量级。', en: 'Two logically identical snippets, an order of magnitude apart.' },
          code: `// ✗ 布局抖动：每次迭代都强制一次全量布局 → O(n²)
for (const el of items) {
  el.style.height = el.offsetWidth * 0.618 + 'px';
  //                ↑ 读（强制布局）  ↑ 写（弄脏布局）
}

// ✓ 读写分离：只触发一次布局 → O(n)
const widths = items.map((el) => el.offsetWidth);          // 全部读
items.forEach((el, i) => {                                  // 全部写
  el.style.height = widths[i] * 0.618 + 'px';
});`,
          highlight: [3, 8],
          key: {
            zh: '**关键点：这两段代码的逻辑完全等价，性能差一个数量级。** 在 200 个元素上，前者约 180ms（丢掉 11 帧），后者约 8ms。**注意第 3 行的隐蔽之处：它看起来只是一行普通赋值。** 强制同步布局在代码里没有任何视觉标记，不会报警告，只有在性能面板里才会显示成一片紫色的 "Recalculate Style / Layout"。**这是为数不多必须靠知识而不是靠工具发现的问题。**',
            en: '**Key point: the two are logically identical and an order of magnitude apart in cost.** Over 200 elements the first takes about 180ms (eleven dropped frames), the second about 8ms. **Note how well line 3 hides: it looks like an ordinary assignment.** Forced synchronous layout carries no visual marker in the source and raises no warning; it only shows up as a purple band of “Recalculate Style / Layout” in the performance panel. **One of the few problems you must catch with knowledge rather than tooling.**',
          },
        },
        {
          t: 'code',
          lang: 'css',
          file: { zh: '长列表的包含', en: 'Containment for a long list' },
          purpose: { zh: '案例的明细表有 800 行，这是它能流畅滚动的原因。', en: 'The case’s table has 800 rows; this is why it scrolls smoothly.' },
          code: `.dash__table tbody tr {
  content-visibility: auto;
  /* 尺寸估计：必须给，否则滚动条长度会跳变并制造 CLS */
  contain-intrinsic-size: auto 2.5rem;
}

/* 卡片：布局与绘制都不外溢，改一张卡不会波及整页 */
.kpi { contain: layout paint; }`,
          highlight: [4],
          key: {
            zh: '**关键点：`contain-intrinsic-size: auto 2.5rem` 里的 `auto` 关键字很重要。** 它表示「一旦这个元素被实际渲染过一次，就记住它的真实尺寸，之后用真实值而不是 2.5rem」。没有 `auto` 的话，元素每次滚出视口都会退回估计值，**滚动条长度会反复变化**。**这是一个「多写四个字母就能避免的体验问题」，但默认值恰好是不带 auto 的那个。**',
            en: '**Key point: the `auto` keyword in `contain-intrinsic-size: auto 2.5rem` matters.** It means “once this element has actually been rendered, remember its real size and use that instead of 2.5rem”. Without `auto`, an element falls back to the estimate every time it leaves the viewport and **the scrollbar length keeps changing**. **A user-experience problem four extra letters would prevent — and the default is the version without them.**',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '6.8',
      title: { zh: '案例：让它在所有地方都成立', en: 'Case: Making It Hold Everywhere' },
      subtitle: {
        zh: 'stage5 → stage6。六个指标全部进入目标区，可以交付了。',
        en: 'stage5 → stage6. All six metrics enter their target zones. Shippable.',
      },
      theory: ['intrinsic-design', 'web-vitals-cls', 'wcag-22'],
      caseStage: 'stage6',
      demo: {
        id: 'case-s6',
        hint: {
          zh: '把宽度从 2560px 一路拖到 320px，再模拟一次冷加载。**注意整个过程只有一次布局形态的切换，而且加载时没有任何跳动。** 这就是六层叠加之后的结果。',
          en: 'Drag the width from 2560px down to 320px, then simulate a cold load. **Note that the layout changes shape exactly once, and nothing jumps while loading.** That is what six layers add up to.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '这一层做了什么', en: 'What this layer did' } },
        {
          t: 'p',
          text: {
            zh: '前七节处理的是同一个威胁的七种形态：**页面在你没看着的时候会变**。窗口会被拖动，字体会被放大，数据会晚到，用户会缩放到 400%。这一层做的全部事情，就是让前五层的成果在这些变化里继续成立。',
            en: 'The seven sections before this dealt with seven forms of the same threat: **the page changes when you are not looking.** Windows get dragged, type gets enlarged, data arrives late, someone zooms to 400%. Everything this layer does is aimed at keeping the previous five layers true through all of it.',
          },
        },
        {
          t: 'ol',
          items: [
            { zh: '断点从三个减到一个，且这一个是实测的 624px（6.1）', en: 'Breakpoints go from three to one, and that one is the measured 624px (§6.1)' },
            { zh: '八档音阶与两档大间距流体化，小间距保持精确（6.2）', en: 'The eight type steps and two large spacing steps become fluid; small gaps stay exact (§6.2)' },
            { zh: '响应式依据从视口改为容器 —— 看板放进侧栏也正确（6.3）', en: 'Responsiveness keys off the container rather than the viewport — correct inside a sidebar too (§6.3)' },
            { zh: 'KPI 区改用 RAM、图表对改用 Switcher —— 这两处不再需要任何查询（6.4）', en: 'The KPI area becomes a RAM grid and the chart pair a Switcher — neither needs a query any more (§6.4)' },
            { zh: '点击目标全部扩到 32px，400% 缩放下无横向溢出（6.5）', en: 'Every target grows to 32px, and there is no horizontal overflow at 400% zoom (§6.5)' },
            { zh: '媒体补齐 `aspect-ratio`、图表槽位预留等高、字体度量对齐（6.6）', en: 'Media gets `aspect-ratio`, the chart slot reserves matching height, font metrics are aligned (§6.6)' },
            { zh: '长表加 `content-visibility`，卡片加 `contain`（6.7）', en: 'The long table gets `content-visibility` and the cards get `contain` (§6.7)' },
          ],
        },

        { t: 'h', text: { zh: '六个指标的最终状态', en: 'Where the six metrics end up' } },
        {
          t: 'table',
          head: [
            { zh: '指标', en: 'Metric' },
            { zh: 'stage0 → stage6', en: 'stage0 → stage6' },
            { zh: '由哪一层推动', en: 'Pushed by' },
          ],
          rows: [
            [{ zh: '行长 (ch)', en: 'Measure (ch)' }, { zh: '138 → 64', en: '138 → 64' }, { zh: '第 1 层', en: 'Layer 1' }],
            [{ zh: '分组比', en: 'Grouping ratio' }, { zh: '1.0 → 2.0', en: '1.0 → 2.0' }, { zh: '第 2 层', en: 'Layer 2' }],
            [{ zh: '取值种类', en: 'Distinct values' }, { zh: '3 → 17', en: '3 → 17' }, { zh: '第 3 层', en: 'Layer 3' }],
            [{ zh: '可达性问题', en: 'A11y issues' }, { zh: '6 → 0', en: '6 → 0' }, { zh: '第 4 层 + 第 6 层', en: 'Layers 4 and 6' }],
            [{ zh: '层级分', en: 'Hierarchy score' }, { zh: '0.05 → 0.84', en: '0.05 → 0.84' }, { zh: '第 5 层', en: 'Layer 5' }],
            [{ zh: 'CLS', en: 'CLS' }, { zh: '0.31 → 0.004', en: '0.31 → 0.004' }, { zh: '第 6 层', en: 'Layer 6' }],
          ],
        },
        {
          t: 'p',
          text: {
            zh: '**注意「取值种类」是唯一一个上升的指标：3 → 17。** 这不是退步。stage0 只有 3 种取值，是因为它几乎没有样式 —— 「一致」得毫无表达力。第 3 层把它从 3 推到 17，是把**随意的值**换成了**一套有结构的标尺**。**一致性的正确目标不是「越少越好」，而是「每一个值都能被解释」。**',
            en: '**Note that “distinct values” is the one metric that rises: 3 → 17.** That is not a regression. stage0 had only three values because it had almost no styling — “consistent” to the point of having nothing to say. Layer three pushing it from 3 to 17 replaced **arbitrary values** with **a structured scale**. **The right target for consistency is not “as few as possible” but “every value can be explained”.**',
          },
        },

        { t: 'h', text: { zh: '回头看这六层', en: 'Looking back at the six layers' } },
        {
          t: 'p',
          text: {
            zh: '从 stage0 到 stage6，**HTML 一个字符都没有改过**。同一份 DOM、同一份数据，只有 CSS 在生长。这不是为了炫技，而是本课程最核心的主张的证明：',
            en: 'From stage0 to stage6, **not one character of HTML changed**. The same DOM, the same data — only the CSS grew. That is not a stunt but the proof of this course’s central claim:',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**布局是一层可以独立生长的能力，而不是写页面时顺手做的事。** 它有自己的顺序（内容 → 间距 → 尺度 → 结构 → 视觉 → 适应），有自己的判据（六个可计算的指标），也有自己的失败模式（每一层都有一节在讲）。**跳过任何一层，后面的层都会被迫去代偿它** —— 视觉层用边框代偿缺失的间距，适应层用媒体查询代偿不够弹性的结构。这就是为什么顺序本身就是内容。',
            en: '**Layout is a capability that grows on its own, not something done in passing while writing a page.** It has an order (content → spacing → scale → structure → visual → adaptive), its own criteria (six computable metrics) and its own failure modes (a section in every layer). **Skip any layer and the later ones are forced to compensate for it** — the visual layer papering over missing spacing with borders, the adaptive layer papering over inflexible structure with media queries. Which is why the order is itself the content.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '最后一句，关于那六个指标：**它们是用来发现问题的，不是用来被优化到满分的。** 层级分停在 0.84 是因为筛选器必须比它的业务排位更醒目；可达性问题数降到 0 不代表这个页面对所有人都好用 —— 它只代表我们能自动检查的那部分都通过了。**度量的价值在于它把「我觉得这里不太对」变成了「这个数不对，我们去看看为什么」。**',
            en: 'One last word about the six metrics: **they exist to surface problems, not to be optimised to perfect scores.** The hierarchy score stops at 0.84 because the filter bar must read louder than its business rank; the accessibility count reaching zero does not mean the page works for everyone — only that the part we can check automatically passes. **A metric earns its keep by turning “something feels off here” into “this number is off, let us go and find out why”.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'stage5 → stage6 完整 diff', en: 'The complete stage5 → stage6 diff' },
          purpose: { zh: '最后一层：把前五层的成果固定在所有尺寸和所有加载时刻上。', en: 'The last layer: locking five layers of work into every size and every moment of loading.' },
          code: `/* ── 容器查询取代视口查询 ── */
+ .dash { container-type: inline-size; container-name: dash; }
+ @container dash (max-width: 39rem) { /* 单列 areas，见 6.3 */ }

/* ── 用原语消掉两处查询 ── */
+ .dash__kpis  { grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr)); }
+ .dash__charts{ display: flex; flex-wrap: wrap; --switch-at: 34rem; }
+ .dash__charts > * { flex-grow: 1; flex-basis: calc((var(--switch-at) - 100%) * 999); }

/* ── 尺寸契约 ── */
+ .dash__logo  { aspect-ratio: 1; }
+ .chart-slot  { --chart-h: 20rem; block-size: var(--chart-h); }

/* ── 目标尺寸与包含 ── */
+ .icon-btn::after { content: ''; position: absolute; inset: -0.5rem; }
+ .dash__table tbody tr { content-visibility: auto; contain-intrinsic-size: auto 2.5rem; }

/* ── 减：三条视口媒体查询，只留一条实测断点 ── */
- @media (max-width: 1200px) { /* … */ }
- @media (max-width: 992px)  { /* … */ }
- @media (max-width: 768px)  { /* … */ }`,
          highlight: [19, 20, 21],
          key: {
            zh: '**关键点在最后三行被删掉的东西。** 那三条媒体查询是 stage0 就在那里的、从框架模板抄来的设备断点 —— 它们从头到尾没有对应过这个页面的任何真实需求。**六层走完之后它们被删掉，不是因为我们「优化」了它们，而是因为前面每一层都让布局更有弹性，弹性到它们没有存在的理由。** 这是本课程最想传达的工作方式：**大多数复杂度不是被优化掉的，是被更好的结构挤掉的。**',
            en: '**The point is what the last three lines delete.** Those media queries had been there since stage0, copied from a framework template — device breakpoints that never corresponded to a single real need of this page. **They come out at the end not because we “optimised” them but because each layer made the layout more elastic, until they had no reason to exist.** That is the working method this course most wants to convey: **most complexity is not optimised away — it is squeezed out by better structure.**',
          },
        },
      ],
    },
  ],
};
