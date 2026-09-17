import type { Lesson } from '../types';

/**
 * 第 1 层 · 内容层
 *
 * 这一章的立场：**不写 CSS 的页面已经有布局了。**
 * 起点不是「一个写坏的页面」，而是「一个还没有布局的页面」——
 * 它已经能在 320px 到 4K 上读，我们要做的是在它之上加东西，而不是把它推倒。
 *
 * 产出 stage1：一份合格的文档。还没有任何「设计」，但每个字都能舒服地读。
 */
export const ch1: Lesson = {
  slug: 'content',
  order: 1,
  layer: { zh: '内容层', en: 'Content layer' },
  adds: {
    zh: '常规流的正确用法、内在尺寸、行长约束',
    en: 'Normal flow used correctly, intrinsic sizing, a measure constraint',
  },
  accentVar: '--ch1',
  title: { zh: '内容层：不写 CSS 就已经有的布局', en: 'The Content Layer: The Layout You Already Have' },
  subtitle: {
    zh: '常规流是默认且最强健的布局系统。先学会不破坏它。',
    en: 'Normal flow is the default and the most robust layout system. First, learn not to break it.',
  },
  summary: {
    zh: '从一份没有任何布局 CSS 的数据文档开始。常规流、包含块、内在尺寸、行长 —— 这一层不做任何「设计」，只把内容本身摆正。学完之后你会发现：大部分布局 bug 都来自我们从常规流手里拿走了某种能力，却没有还回去。',
    en: 'We start from a data document with no layout CSS at all. Normal flow, containing blocks, intrinsic sizing, measure — this layer does no “design”, it only gets the content itself right. By the end you will see that most layout bugs come from taking a capability away from normal flow without giving it back.',
  },

  sections: [
    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '1.1',
      title: { zh: '常规流：默认且最强健的布局', en: 'Normal Flow: The Default, and the Most Robust' },
      subtitle: {
        zh: '一个没有任何 CSS 的 HTML 文档，在手机和 4K 上都能读。这不是巧合。',
        en: 'An HTML document with no CSS reads fine on a phone and on a 4K monitor. That is not luck.',
      },
      theory: ['intrinsic-design', 'css-box-alignment'],
      demo: {
        id: 'flow-lab',
        hint: {
          zh: '左边是真实 DOM 的盒子树，右边是 D3 画的包含块链。切换目标元素的 `position`，看百分比到底相对谁计算；再开关 `flow-root` 与 `overflow: hidden`，看外边距何时合并、溢出何时被裁。',
          en: 'On the left, a real box tree; on the right, the containing-block chain drawn with D3. Change the target’s `position` to see what percentages resolve against, then toggle `flow-root` and `overflow: hidden` to watch margins collapse and overflow get clipped.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '先别写 CSS，先打开看看', en: 'Before writing any CSS, just open it' } },
        {
          t: 'p',
          text: {
            zh: '这门课的案例是一份新生数据文档：语义正确的 HTML，**一行布局 CSS 都没有**。按常理说，这应该是一团糟。但把它在浏览器里打开，你会看到别的东西。',
            en: 'The case for this course is a page of freshman data: semantically correct HTML with **not one line of layout CSS**. By rights it should be a mess. Open it in a browser, though, and you see something else.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '文字排满一行就换到下一行，段落各自占住一块地方，表格的列自动对齐，窗口拖到 320px 也不需要左右滚动。**这些规则没有任何人写过，但它们全都在生效。**',
            en: 'Text fills a line and wraps to the next. Each paragraph claims its own band of space. Table columns line themselves up. Drag the window down to 320px and there is still nothing to scroll sideways. **Nobody wrote any of those rules, and all of them are in force.**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '这套默认规则叫**常规流（normal flow）**，核心就四条：块级元素撑满可用宽度、高度由内容决定、行内内容超出即换行、页面超出即纵向滚动。四条合起来，已经是一个**完全响应式**的布局系统 —— 而且是浏览器白送的。',
            en: 'Those defaults are **normal flow**, and there are four of them at heart: block elements fill the available width, height comes from content, inline content wraps, and the page scrolls vertically when it overflows. Together they already make a **fully responsive** layout system — one the browser hands you for free.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '所以接下来六章要做的，不是**替换**这套系统，而是在它之上**逐层加约束**。这也是第一章不从 `display: grid` 讲起的原因：你得先知道手里已经有什么，才谈得上要改什么。',
            en: 'So the job of the next six chapters is not to **replace** that system but to **add constraints on top of it**, one layer at a time. Which is why this chapter does not open with `display: grid`: you cannot sensibly change what you have until you know what you have.',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**这一章的核心立场**：几乎所有布局 bug 的根源，都是我们从常规流手里拿走了某种能力，却没有把它还回去。`float` 拿走了「元素占据自己那一行」；`position: absolute` 拿走了「元素参与流」；`height: 46px` 拿走了「高度由内容决定」。**每一次剥夺都要付出代价 —— 问题只在于你有没有意识到代价是什么。**',
            en: '**The stance of this chapter**: nearly every layout bug traces back to taking a capability away from normal flow without giving it back. `float` removes “this element owns its line”; `position: absolute` removes “this element participates in flow”; `height: 46px` removes “height comes from content”. **Every removal has a price — the only question is whether you noticed what it was.**',
          },
        },

        { t: 'h', text: { zh: '包含块：百分比到底是谁的百分比', en: 'The containing block: a percentage of what, exactly?' } },
        {
          t: 'p',
          text: {
            zh: '在常规流之上要加的第一类约束是**尺寸**。而只要写下一个百分比，就立刻撞上一个必须先回答的问题：**50% 是谁的 50%？**',
            en: 'The first kind of constraint to add on top of normal flow is **size**. And the moment you write a percentage, you run straight into a question that has to be answered first: **fifty percent of what?**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '答案是**包含块**：每个元素都有一个，它是所有百分比、`auto` 与绝对定位偏移量的参照系。麻烦在于，哪个盒子当这个参照系，取决于元素自己的 `position`：',
            en: 'The answer is its **containing block**. Every element has one, and it is the frame of reference for every percentage, every `auto`, and every absolute offset. The catch is that which box plays that role depends on the element’s own `position`:',
          },
        },
        {
          t: 'table',
          head: [
            { zh: 'position', en: 'position' },
            { zh: '包含块是', en: 'Containing block' },
            { zh: '常见意外', en: 'Common surprise' },
          ],
          rows: [
            [
              { zh: '`static` / `relative`', en: '`static` / `relative`' },
              { zh: '最近的**块级祖先**的内容盒', en: 'Content box of the nearest **block** ancestor' },
              { zh: '祖先是 inline 时会跳过它', en: 'Inline ancestors are skipped' },
            ],
            [
              { zh: '`absolute`', en: '`absolute`' },
              { zh: '最近的**已定位**祖先的内边距盒', en: 'Padding box of the nearest **positioned** ancestor' },
              { zh: '没有已定位祖先时是初始包含块（视口）', en: 'With none, it is the initial containing block (the viewport)' },
            ],
            [
              { zh: '`fixed`', en: '`fixed`' },
              { zh: '视口', en: 'The viewport' },
              { zh: '**祖先有 `transform` / `filter` / `will-change` 时会变成那个祖先**', en: '**An ancestor with `transform`/`filter`/`will-change` becomes the containing block instead**' },
            ],
          ],
        },
        {
          t: 'pitfall',
          text: {
            zh: '**最后一行是很多人踩过的坑**：给某个容器加了一句 `transform: translateZ(0)`（常见的「开启 GPU 加速」偏方），页面里所有 `position: fixed` 的弹窗、抽屉、回到顶部按钮就全部失效 —— 它们变成相对那个容器定位了。这个 bug 极难排查，因为加 `transform` 的人和写 `fixed` 的人通常不是同一个。',
            en: '**That last row catches almost everyone**: add `transform: translateZ(0)` to a container (the folk remedy for “enable GPU acceleration”) and every `position: fixed` modal, drawer and back-to-top button silently starts positioning against that container. It is brutal to debug, because the person who added the transform is rarely the person who wrote the `fixed`.',
          },
        },

        { t: 'h', text: { zh: 'BFC：给一块区域划一条边界', en: 'BFC: drawing a boundary around a region' } },
        {
          t: 'p',
          text: {
            zh: '常规流的规则是**全局生效**的：一个元素的外边距会影响它的兄弟，一个浮动会影响它后面所有的行盒。大多数时候这正合我们的意 —— 它让一份文档读起来像一份文档，而不像一堆互不相干的盒子。但偶尔你需要一块区域「自己算自己的」。',
            en: 'Normal flow’s rules apply **globally**: one element’s margin affects its siblings, one float affects every line box after it. Most of the time that is exactly what we want — it is what makes a document read as a document rather than a pile of unrelated boxes. Occasionally, though, you need a region that settles its own affairs.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '这样的区域叫**块级格式化上下文（Block Formatting Context，BFC）**：里面的布局不外溢，外面的浮动也侵入不进来。它正好解决三件事：**① 包住浮动子元素**（父容器的高度能算上浮动）；**② 阻止外边距合并**；**③ 不与浮动重叠**。',
            en: 'Such a region is a **Block Formatting Context (BFC)**: what happens inside does not leak out, and floats outside cannot intrude. It solves exactly three things: **① containing floated children** (so the parent’s height includes them); **② stopping margin collapse**; **③ not overlapping floats**.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '触发它的常见方式：`overflow` 非 `visible`、`display: flow-root` / `flex` / `grid`、`position: absolute/fixed`、`contain: layout`。其中 **`display: flow-root` 是 2017 年为此专门加入 CSS 的关键字：它只做 BFC，不做别的。** 名字本身就是它的语义 ——「开启一棵新的流的根」。',
            en: 'Common triggers: any non-`visible` `overflow`, `display: flow-root` / `flex` / `grid`, `position: absolute/fixed`, and `contain: layout`. Of these, **`display: flow-root` was added to CSS in 2017 for exactly this purpose: it creates a BFC and nothing else.** The name is the semantics — “start a new root for flow”.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '为什么强调这一点：很多代码库里满是 `overflow: hidden`，写的人只想要 BFC，却顺带获得了「裁掉一切溢出」这个**他并不想要的副作用** —— 下拉菜单被切一半、焦点轮廓被削掉、`position: sticky` 莫名失效。',
            en: 'Why this matters: many codebases are full of `overflow: hidden` written by someone who only wanted a BFC and also got “clip everything that overflows” — a side effect they never wanted. Dropdowns get sliced in half, focus rings get shaved, and `position: sticky` mysteriously stops working.',
          },
        },

        { t: 'h', text: { zh: '外边距合并：常规流里唯一一条像 bug 的规则', en: 'Margin collapse: the one rule in normal flow that looks like a bug' } },
        {
          t: 'p',
          text: {
            zh: 'BFC 的第二个用途提到了「阻止外边距合并」。这条规则值得单独拿出来讲，因为它是常规流里唯一一条**会让人以为浏览器算错了**的规则 —— 而它其实是为排版服务的：两个段落之间应该只隔一个段间距，而不是两个相加。',
            en: 'The second use of a BFC was “stopping margin collapse”. That rule deserves a section of its own, because it is the one piece of normal flow that **looks like the browser got the arithmetic wrong** — while in fact it serves typography: two paragraphs should be separated by one paragraph gap, not by the sum of two.',
          },
        },
        { t: 'p', text: { zh: '它发生在三种情形下：', en: 'It happens in three situations:' } },
        {
          t: 'ol',
          items: [
            { zh: '**相邻兄弟**：上一个的 `margin-bottom` 与下一个的 `margin-top` 合并，取较大值。', en: '**Adjacent siblings**: the first’s `margin-bottom` and the next’s `margin-top` collapse to the larger.' },
            { zh: '**父与首子**：父元素没有 border / padding / BFC 隔开时，子元素的 `margin-top` 会「穿透」出去变成父元素的。', en: '**Parent and first child**: with no border, padding or BFC in between, the child’s `margin-top` “escapes” and becomes the parent’s.' },
            { zh: '**空块元素**：自身的上下外边距互相合并。', en: '**Empty blocks**: an element’s own top and bottom margins collapse together.' },
          ],
        },
        {
          t: 'note',
          text: {
            zh: '**情形 ② 是「我给子元素加了 margin-top，结果整张卡片往下跑了」的原因。** 解法有三：给父元素加内边距、加 `display: flow-root`、或者**干脆不用 margin 表达间距**。本课程选第三种，第 2.3 节会讲那个替代写法 —— 从根上避免，比记住规则更可靠。',
            en: '**Case ② is why “I added margin-top to a child and the whole card moved down”.** Three fixes: give the parent padding, give it `display: flow-root`, or **stop using margins for spacing altogether**. This course takes the third route — §2.3 shows the replacement. Avoiding a rule beats remembering it.',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：动手改布局之前，先问「常规流做不到这件事吗？」。大多数时候它做得到 —— 它只是需要一个正确的约束（比如下一节的 `max-inline-size`），而不是换一个引擎。',
            en: '**One line to take away**: before reaching for a layout mode, ask “can normal flow already do this?” Usually it can — it just needs the right constraint (such as the `max-inline-size` in the next section), not a different engine.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'html',
          file: { zh: 'stage0：案例的真实起点', en: 'stage0: the case’s real starting point' },
          purpose: {
            zh: '这就是我们要建造的东西的地基。注意：它没有一行布局 CSS，但它已经可以读。',
            en: 'This is the foundation we build on. Note: not one line of layout CSS, and it is already readable.',
          },
          code: `<div class="dash">
  <header>
    <h3>NeoCampus 新生数据看板</h3>
    <p>2025 级 · 数据截至 9 月 12 日</p>
  </header>

  <p>2025 级新生共 4,286 人，来自 31 个省级行政区…</p>

  <!-- DOM 顺序 = 业务重要度降序。从第一天就写对，后面永远不用改 -->
  <ul>
    <li data-importance="5">新生总人数 4,286</li>
    <li data-importance="4">报到率 98.2%</li>
    <li data-importance="3">男女比 1.4 : 1</li>
    …
  </ul>
</div>`,
          highlight: [8, 9],
          key: {
            zh: '**关键点：DOM 顺序从第一天就按业务重要度写对。** 这看起来是小事，但它让后面五层都省事了：全课程不需要用 `order` 去「调顺序」，因此也永远不会出现「看到的顺序」和「键盘走到的顺序」对不上的页面。第 4.4 节会展示那种对不上有多难受。**结构上的正确是最便宜的正确。**',
            en: '**Key point: the DOM order is written in descending business importance from day one.** It looks like a detail, but it saves the next five layers a lot of work — we never need `order` to “fix the sequence”, and therefore never build a page where what you see and what you reach are different orders (§4.4 shows how bad that feels). **Getting the structure right is the cheapest kind of right.**',
          },
        },
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'flow-root：只要 BFC，不要副作用', en: 'flow-root: the BFC without the side effects' },
          purpose: { zh: '当你确实需要 BFC 时的正确写法。', en: 'The right keyword when you genuinely need a BFC.' },
          code: `/* ✗ 有副作用：裁掉溢出、可能产生滚动条、阻断内部的 position: sticky */
.card { overflow: hidden; }

/* ✓ 只创建 BFC，其它什么都不做 */
.card { display: flow-root; }`,
          highlight: [5],
          key: {
            zh: '**关键点**：`overflow: hidden` 有一个少有人知的副作用 —— **它会让内部的 `position: sticky` 失效**（准确说是把 sticky 的滚动容器变成这个元素，而它自己不滚动，于是看起来像没生效）。本站左侧的章节目录用了 sticky，如果上层容器随手写了 `overflow: hidden`，目录就会「粘不住」。这类 bug 每个前端都会遇到一次。',
            en: '**Key point**: `overflow: hidden` has a lesser-known side effect — **it breaks `position: sticky` inside it** (strictly: it becomes the sticky element’s scroll container, and since it never scrolls, sticky appears to do nothing). This site’s chapter navigation is sticky; one stray `overflow: hidden` on an ancestor and it stops sticking. Every front-end developer meets this bug exactly once.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '1.2',
      title: { zh: '让内容决定尺寸', en: 'Let the Content Decide the Size' },
      subtitle: {
        zh: '你真的知道盒子里会装什么吗？不知道的时候，就不该由你来定尺寸。',
        en: 'Do you actually know what goes in the box? When you do not, you should not be the one deciding its size.',
      },
      theory: ['intrinsic-design', 'css-box-alignment'],
      demo: {
        id: 'sizing-lab',
        hint: {
          zh: '拖动容器宽度，四个真实盒子分别用 `min-content` / `max-content` / `fit-content` / `100%`，D3 画出它们的实测宽度对比。把内容切到「长 URL」再把容器拖到 240px —— 看溢出是怎么发生的。',
          en: 'Drag the container width; four real boxes use `min-content`, `max-content`, `fit-content` and `100%`, and D3 charts their measured widths. Switch the content to “long URL”, drag the container to 240px, and watch overflow happen.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '一个来自数据库的学院名', en: 'A school name that came from a database' } },
        {
          t: 'p',
          text: {
            zh: '上一节说，常规流已经把「高度由内容决定」这条规则送给了我们。这一节要问的是它的另一半：**宽度该由谁决定？**',
            en: 'The previous section pointed out that normal flow already hands us the rule “height comes from content”. This section asks about the other half: **who decides the width?**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '案例里有一份学院列表，其中一条是「地球科学与技术学院」。它有多长？前端不知道 —— 这行字来自数据库，明年可能改名，翻译成英文会更长。如果我们在 CSS 里写下一个固定宽度，就等于替一份自己看不到的数据做了决定。',
            en: 'The case contains a list of schools, one of which is the “School of Geosciences and Technology”. How long is that? The front-end has no idea — the string comes from a database, it may be renamed next year, and it gets longer in translation. Writing a fixed width in CSS means deciding on behalf of data we cannot see.',
          },
        },
        {
          t: 'p',
          text: {
            zh: 'CSS 对这个问题给了两套答案，它们的区别不在语法，而在**谁说了算**：',
            en: 'CSS offers two answers, and the difference between them is not syntax but **who gets the final say**:',
          },
        },
        {
          t: 'table',
          head: [
            { zh: '维度', en: 'Dimension' },
            { zh: '外在尺寸 Extrinsic', en: 'Extrinsic sizing' },
            { zh: '内在尺寸 Intrinsic', en: 'Intrinsic sizing' },
          ],
          rows: [
            [
              { zh: '谁决定', en: 'Decided by' },
              { zh: '容器 / 作者', en: 'The container / the author' },
              { zh: '内容', en: 'The content' },
            ],
            [
              { zh: '典型写法', en: 'Typical code' },
              { zh: '`width: 300px`、`width: 25%`', en: '`width: 300px`, `width: 25%`' },
              { zh: '`width: max-content`、`width: fit-content`', en: '`width: max-content`, `width: fit-content`' },
            ],
            [
              { zh: '内容太长时', en: 'When content is too long' },
              { zh: '溢出或被裁剪', en: 'It overflows or gets clipped' },
              { zh: '盒子变大', en: 'The box grows' },
            ],
            [
              { zh: '适合', en: 'Good for' },
              { zh: '需要严格对齐的结构（网格轨道）', en: 'Structures that must align strictly (grid tracks)' },
              { zh: '内容长度不可预知的地方（标签、按钮、卡片）', en: 'Anywhere content length is unpredictable (labels, buttons, cards)' },
            ],
          ],
        },
        {
          t: 'p',
          text: {
            zh: '判断用哪一种，只需要问一个问题：**我真的知道这个盒子里会装什么吗？** 知道（图标是 24×24，永远是）→ 外在尺寸没问题；不知道（学院名来自数据库、按钮文字会被翻译、用户可以自己命名）→ **必须**用内在尺寸。',
            en: 'Choosing between them takes one question: **do I actually know what goes in this box?** If yes (the icon is 24×24 and always will be), extrinsic sizing is fine. If not — the school name comes from a database, the button label will be translated, the user can rename it — intrinsic sizing is **mandatory**.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '案例里的「地球科学与技术学院」就是第二种：它的长度来自数据库，前端根本无法预知。如果在这里用固定宽度，剩下的只有两条路 —— 溢出，或者裁剪。**而这两条路都是设计失败，不是样式选择。**',
            en: 'The “School of Geosciences and Technology” in our case is the second kind: its length comes from a database and the front-end cannot know it. Fix its width here and only two roads remain — overflow, or clipping. **Both are design failures, not styling choices.**',
          },
        },

        { t: 'h', text: { zh: '三个关键字的准确含义', en: 'What the three keywords actually mean' } },
        {
          t: 'p',
          text: {
            zh: '把决定权交还给内容，用的就是下面三个关键字。它们经常被混用，但含义相差很远：',
            en: 'Handing the decision back to the content is done with three keywords. They get used interchangeably, and they do not mean remotely the same thing:',
          },
        },
        {
          t: 'ul',
          items: [
            {
              zh: '**`min-content`** —— 在不产生溢出的前提下能达到的最窄宽度。对文字来说就是「最长的那个不可断开的词」的宽度。',
              en: '**`min-content`** — the narrowest width that avoids overflow. For text, the width of the longest unbreakable word.',
            },
            {
              zh: '**`max-content`** —— 完全不换行时需要的宽度。对一段长文本来说，这可能是几千像素。',
              en: '**`max-content`** — the width needed with no wrapping at all. For a long paragraph that can be thousands of pixels.',
            },
            {
              zh: '**`fit-content`** —— 等价于 `min(max-content, max(min-content, 可用空间))`。人话：**能多宽就多宽，但不超过内容需要的宽度，也不超过容器**。这是绝大多数场景想要的行为，也是最少被写出来的那一个。',
              en: '**`fit-content`** — equivalent to `min(max-content, max(min-content, available))`. In plain terms: **as wide as possible, but no wider than the content needs and no wider than the container**. It is what most situations want, and the one people write least often.',
            },
          ],
        },
        {
          t: 'note',
          text: {
            zh: '**中文与内在尺寸**：`min-content` 对中文几乎没有约束力（几乎每个字都能断行），所以「长词把轨道撑破」这个经典问题在纯中文界面里不常见。但一旦混入英文专业名、URL、或者带 `white-space: nowrap` 的数字，问题立刻出现。**中英混排的界面必须显式写 `min-inline-size: 0`（第 4.1 节还会再遇到它）。**',
            en: '**CJK and intrinsic sizing**: `min-content` barely constrains Chinese (it breaks almost anywhere), so the classic “long word blows out the track” problem is rare in pure-Chinese interfaces. Mix in an English programme name, a URL, or a `white-space: nowrap` number and it appears instantly. **Bilingual interfaces must write `min-inline-size: 0` explicitly — §4.1 meets it again.**',
          },
        },

        { t: 'h', text: { zh: '溢出是信号，不是样式问题', en: 'Overflow is a signal, not a styling problem' } },
        {
          t: 'p',
          text: {
            zh: '用了内在尺寸，盒子会跟着内容长。但总有长到装不下的时候 —— 窗口只有 320px，而那个学院名就是那么长。这时的处理方式，决定了这个 bug 是被**解决**还是被**藏起来**。',
            en: 'With intrinsic sizing the box grows with its content. Sooner or later, though, it will not fit — the window is 320px wide and the school name is as long as it is. What you do at that moment decides whether the bug gets **solved** or merely **hidden**.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '有三种应对，代价从小到大：',
            en: 'There are three responses, in increasing order of cost:',
          },
        },
        {
          t: 'ol',
          items: [
            { zh: '**让盒子变大**（内在尺寸）—— 最好的默认选择', en: '**Let the box grow** (intrinsic sizing) — the best default' },
            { zh: '**让内容换行或缩小**（`text-wrap`、流体字号）—— 次选', en: '**Let the content wrap or shrink** (`text-wrap`, fluid type) — second choice' },
            { zh: '**滚动**（`overflow: auto`）—— 只对表格、代码块这类天然宽的内容', en: '**Scroll it** (`overflow: auto`) — only for genuinely wide content like tables and code' },
          ],
        },
        {
          t: 'p',
          text: {
            zh: '`overflow: hidden` **不在**这三种里 —— 它不是应对，是**隐瞒**。它让 bug 在测试环境里看不出来，在生产环境里变成「为什么我的学院名少了三个字」的工单。',
            en: '`overflow: hidden` is **not** on that list — it is not a response, it is **concealment**. It hides the bug in staging and turns it into a “why is my school name missing three characters?” ticket in production.',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：给盒子设尺寸之前先问「我知道里面装什么吗」。这一个问题的答案，决定了你一半的布局 bug 会不会发生。',
            en: '**One line to take away**: before you size a box, ask whether you know what goes inside. The answer to that single question decides whether half your layout bugs ever happen.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: '内在尺寸的四个实用配方', en: 'Four practical intrinsic-sizing recipes' },
          purpose: { zh: '这四条覆盖了日常 90% 的场景。', en: 'These four cover about 90% of day-to-day cases.' },
          code: `/* ① 按钮 / 标签：跟着文字走，但不超过容器 */
.chip { inline-size: fit-content; max-inline-size: 100%; }

/* ② 正文：以行长为准，窄屏让位给容器（下一节详述） */
.prose { max-inline-size: min(100%, 68ch); }

/* ③ Flex 子项：解除「不能小于内容」的默认限制 */
.flex-item { min-inline-size: 0; }

/* ④ Grid 轨道：同上，但写在轨道定义里 */
.grid { grid-template-columns: repeat(12, minmax(0, 1fr)); }`,
          highlight: [8, 11],
          key: {
            zh: '**关键点：③ 和 ④ 是同一件事的两种写法。** Flex 子项的 `min-width` 默认是 `auto`（= `min-content`），Grid 轨道的最小值默认也是 `auto`。这个默认值是**为了保护内容不被裁剪**而设计的，出发点很好；但当你已经用其它方式（换行、滚动、省略号）处理了长内容时，它就变成了溢出的来源。**写下 `min-*: 0` 就是在说：这里的溢出我已经另行处理了。**',
            en: '**Key point: ③ and ④ are the same thing in two syntaxes.** A flex item’s `min-width` defaults to `auto` (= `min-content`), and a grid track’s minimum defaults to `auto` too. That default exists **to protect content from being clipped** — a good intention. But once you have handled long content another way (wrapping, scrolling, ellipsis), it becomes the source of your overflow. **Writing `min-*: 0` says: I have handled overflow here by other means.**',
          },
          pitfall: {
            zh: '不要无脑给所有 flex 子项加 `min-inline-size: 0`。如果你**没有**给长内容准备后路（不换行、不滚动、不省略），加了它之后内容会被压到不可读 —— 你只是把「溢出」换成了「挤扁」。在两个坏结果之间选择，说明设计还没想清楚。',
            en: 'Do not add `min-inline-size: 0` reflexively to every flex item. If you have **not** given long content an escape route (no wrapping, no scrolling, no ellipsis), adding it squashes the content into illegibility — you have merely traded overflow for crushing. Having to choose between two bad outcomes means the design is not finished.',
          },
        },
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'stage1：案例里的内在尺寸', en: 'stage1: intrinsic sizing in the case' },
          purpose: {
            zh: '这一层不给卡片任何固定尺寸 —— 高度由内容决定，长学院名永远不必被截断。',
            en: 'This layer gives the cards no fixed size at all — height follows content, and long school names never need clipping.',
          },
          code: `.kpi,
.bars__label {
  block-size: auto;        /* 高度由内容决定 */
  min-inline-size: 0;      /* 允许被压缩（长内容另有后路） */
  text-wrap: pretty;       /* 换行时避免孤字成行 */
}`,
          key: {
            zh: '**关键点**：三条属性各自对应一个理论点 —— `block-size: auto` 是内在尺寸，`min-inline-size: 0` 是解除 `auto` 最小值，`text-wrap: pretty` 是排版层面的换行优化。**这一层没有加任何「布局」，只是把内容本身摆正了。** 而仅仅这样，页面就已经不会再截断任何东西。',
            en: '**Key point**: each property answers to a different principle — `block-size: auto` is intrinsic sizing, `min-inline-size: 0` releases the `auto` minimum, and `text-wrap: pretty` is a typographic wrapping refinement. **This layer adds no “layout” at all; it merely gets the content itself right.** And that alone is enough for the page to stop clipping anything, ever.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '1.3',
      title: { zh: '行长：第一个真正的布局决策', en: 'Measure: The First Real Layout Decision' },
      subtitle: {
        zh: '在你决定任何位置之前，先决定一行有多长。',
        en: 'Before you decide any position, decide how long a line is.',
      },
      theory: ['bringhurst', 'tinker-legibility', 'tufte'],
      demo: {
        id: 'density',
        hint: {
          zh: '三个指标全部是从真实 DOM 量出来的：用一把隐藏的「0 字符标尺」换算 ch，用 `Range.getClientRects()` 拿到每一行的行盒。拖动容器宽度找出 stage0 的 138ch 掉到舒适区的那个点。',
          en: 'All three metrics are measured from the real DOM: a hidden “ten zeroes” ruler converts to ch, and `Range.getClientRects()` gives the real line boxes. Drag the container width to find where stage0’s 138ch falls back into the comfort zone.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '为什么这是第一个布局决策', en: 'Why this is the first layout decision' } },
        {
          t: 'p',
          text: {
            zh: '常规流唯一没有替你做的决定，就是**一行有多长**。它默认让块级元素撑满容器 —— 在 1600px 的显示器上，这意味着一行 138 个字符。',
            en: 'The one decision normal flow does not make for you is **how long a line should be**. It lets block elements fill the container by default — on a 1600px monitor that means 138 characters per line.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '这不是浏览器的错。它不知道你的内容是一段需要逐字阅读的说明，还是一张需要横向扫视的表格。**这个决定必须由你来做，而且它应该是你做的第一个布局决定** —— 因为在行长确定之前，谈位置、谈层级、谈自适应都为时过早。',
            en: 'That is not the browser’s fault. It cannot know whether your content is prose to be read word by word or a table to be scanned across. **This decision is yours, and it should be your first layout decision** — because until the measure is settled, talking about position, hierarchy or adaptation is premature.',
          },
        },

        { t: 'h', text: { zh: '45–75 字符：这个数字从哪来', en: 'Where 45–75 characters comes from' } },
        {
          t: 'quote',
          text: {
            zh: '任何长度在 45 到 75 个字符之间的单栏文本，都被广泛认为是令人满意的。66 个字符（含空格与标点）是一个被普遍认可的理想值。',
            en: 'Anything from 45 to 75 characters is widely regarded as a satisfactory line length for a single-column page. 66 characters (counting both letters and spaces) is widely regarded as ideal.',
          },
          cite: { zh: 'Bringhurst, R.《排版风格的要素》', en: 'Bringhurst, R., The Elements of Typographic Style' },
        },
        {
          t: 'p',
          text: {
            zh: 'Tinker (1963) 的实验给出了机制层面的解释。行长过长时，眼睛要做一次长距离的**回扫（return sweep）**才能找到下一行的行首，而回扫的落点精度随距离下降 —— 超过一定长度，落错行的概率急剧上升。行长过短则相反：回扫过于频繁，每次都要重新定位，同时语块被迫断开。**两端都有代价，中间存在一个宽阔的舒适区。**',
            en: 'Tinker (1963) supplied the mechanism. When lines are long, the eye must make a long **return sweep** to find the start of the next line, and the landing accuracy of that saccade degrades with distance — past a certain length, landing on the wrong line becomes common. Short lines fail the other way: sweeps become too frequent, each needing re-fixation, and phrases get chopped mid-thought. **Both ends cost you; in between lies a broad comfort zone.**',
          },
        },
        {
          t: 'note',
          text: {
            zh: '**中文的特殊情况**：`ch` 单位测的是数字「0」的宽度，对等宽的中日韩字符并不准确。中文的经验区间是**每行 25–40 个汉字**（约等于 50–80 个 `ch`，因为一个汉字约等于两个 `ch`）。实践中直接用 `max-inline-size: 38em` 对中文更可靠。本站正文用的是 `68ch`，在中英混排下两者都落在舒适区。',
            en: '**A note on CJK**: the `ch` unit measures the width of the digit “0”, which is not meaningful for full-width CJK glyphs. The practical range for Chinese is **25–40 characters per line** (roughly 50–80 `ch`, since one Han character is about two `ch`). In practice `max-inline-size: 38em` is the more reliable constraint for Chinese. This site uses `68ch`, which keeps both scripts inside the comfort zone in mixed text.',
          },
        },

        { t: 'h', text: { zh: '行距：与行长配套的另一半', en: 'Leading: the other half of the pair' } },
        {
          t: 'p',
          text: {
            zh: '行长与行距必须一起调。**行越长，需要的行距越大** —— 因为回扫距离越长，越需要更明显的纵向间隔来帮眼睛找到下一行。这条关系常被忽略，导致「明明限了行长还是不好读」。',
            en: 'Measure and leading must be tuned together. **The longer the line, the more leading it needs** — a longer return sweep needs a clearer vertical gap to land on. Missing this relationship is why “I capped the measure and it still reads badly” happens.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '`stage0` 用的是浏览器默认的 1.2 —— 那是**标题**的合理行距（标题通常只有一两行，且字号大）。正文需要 1.5–1.75，中文因为字形密度更高（笔画填满字面框），建议取上限。本站正文用 1.7。',
            en: '`stage0` uses the browser default of 1.2 — sensible leading for a **heading** (one or two lines, large type). Body text needs 1.5–1.75, and Chinese, with its denser glyphs (strokes fill the em box), belongs at the upper end. This site uses 1.7.',
          },
        },

        { t: 'h', text: { zh: '密度不是敌人', en: 'Density is not the enemy' } },
        {
          t: 'p',
          text: {
            zh: '这一节最容易被误读的一点：限制行长**不等于**让页面变空。Tufte 毕生主张的是**高信息密度** —— 一张好图应该在有限的墨水里承载尽可能多的数据。彭博终端、飞行仪表、交易界面都是极高密度且极其好用的例子。',
            en: 'The most commonly misread point here: capping the measure is **not** the same as emptying the page. Tufte spent a career arguing *for* **high information density** — a good graphic carries as much data as possible per unit of ink. Bloomberg terminals, flight instruments and trading desks are extremely dense and extremely usable.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '所以问题从来不是「太密」，而是 **「密得没有节奏」**：同样是每屏 200 个数字，有分组、有层级、有对齐线的版本可以被熟练用户秒读。**而节奏正是下一层要做的事。**',
            en: 'So the problem is never “too dense” but **“dense without rhythm”**: two hundred numbers per screen can be read at a glance when they are grouped, ranked and aligned. **And rhythm is exactly what the next layer is for.**',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：行长约束不是「让页面留白好看」，是**降低阅读的生理成本**。它是唯一一条你在写任何位置代码之前就该写下的布局规则。',
            en: '**One line to take away**: a measure constraint is not about making the page look airy — it is about lowering the physiological cost of reading. It is the one layout rule you should write before writing any positioning code at all.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: '约束行长的三种写法', en: 'Three ways to constrain the measure' },
          purpose: { zh: '三种单位各有适用场景。关键是**必须选一个**，而不是不写。', en: 'Three units, three use cases. The point is that you must pick **one** — not that you may skip it.' },
          code: `/* ① ch —— 直接表达「多少个字符」，对西文最准 */
.prose { max-inline-size: 68ch; }

/* ② em —— 随字号缩放，对中文更可靠（1em ≈ 1 个汉字宽） */
.prose-cn { max-inline-size: 38em; }

/* ③ min() —— 窄屏时让位给容器，永不溢出（生产环境用这个） */
.prose { max-inline-size: min(100%, 68ch); }`,
          highlight: [8],
          key: {
            zh: '**关键点**：③ 是生产环境的正确写法。单独写 `68ch` 在 320px 视口下不会溢出（因为 `max-` 是上限），但如果有人把它改成 `inline-size: 68ch` 就会溢出。`min(100%, 68ch)` 是一个**防御性**写法：无论谁误用，都不会横向滚动。这与第 6.5 节的 WCAG 1.4.10 直接相关。',
            en: '**Key point**: ③ is the production-grade form. `68ch` alone will not overflow at 320px (because `max-` is a ceiling), but if someone later changes it to `inline-size: 68ch` it will. `min(100%, 68ch)` is **defensive**: whoever misuses it later, the page still never scrolls sideways. This connects directly to WCAG 1.4.10 in §6.5.',
          },
        },
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'stage1：行长 + 行距一起调', en: 'stage1: measure and leading, tuned together' },
          purpose: { zh: '这就是第 1 层对案例做的全部事情。两条规则。', en: 'This is everything layer one does to the case. Two rules.' },
          code: `.dash {
  line-height: 1.7;                        /* 从默认 1.2 提上来 */
}
.dash__summary {
  max-inline-size: min(100%, 68ch);        /* 138ch → 66ch */
}`,
          highlight: [2, 5],
          key: {
            zh: '**关键点**：两条规则，行长从 138ch 回到 66ch。**这一层没有动一个位置、没有加一个容器、没有引入任何布局模式** —— 但案例已经从「一堵字墙」变成了「一份可以读的文档」。第 1 层的全部意义就在这里：**先把内容摆正，再谈怎么安排它。**',
            en: '**Key point**: two rules take the measure from 138ch to 66ch. **This layer moves nothing, adds no container and introduces no layout mode** — yet the case has gone from a wall of text to a document you can read. That is the whole point of layer one: **get the content right before arranging it.**',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '1.4',
      title: { zh: '案例：把数据变成一份可读的文档', en: 'Case: Turning Data into a Readable Document' },
      subtitle: {
        zh: 'stage0 → stage1。两条 CSS 规则，一个指标。',
        en: 'stage0 → stage1. Two CSS rules, one metric.',
      },
      theory: ['bringhurst', 'intrinsic-design'],
      caseStage: 'stage1',
      demo: {
        id: 'case-s1',
        hint: {
          zh: '拖动分割线对比 stage0 与 stage1。左边是完全没有布局 CSS 的起点 —— 注意它并不是「坏」，只是「还没有布局」。右边只加了行长与行距两条规则。',
          en: 'Drag the divider to compare stage0 with stage1. On the left is the starting point with no layout CSS at all — note that it is not *bad*, merely *not yet laid out*. On the right, two rules have been added: measure and leading.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '这一层做了什么', en: 'What this layer did' } },
        {
          t: 'p',
          text: {
            zh: '前三节讲的都是同一件事的三个侧面：**别跟内容抢尺寸的决定权**。落到案例上，是四处改动 —— 全都只加约束，没有引入任何新的布局模式。',
            en: 'The three sections before this were three faces of one idea: **do not take sizing decisions away from the content.** On the case that becomes four changes — all of them constraints, none of them a new layout mode.',
          },
        },
        {
          t: 'ol',
          items: [
            { zh: '正文限宽 `min(100%, 68ch)` —— 行长从 138ch 回到舒适区（1.3）', en: 'Body capped at `min(100%, 68ch)` — the measure returns from 138ch to the comfort zone (§1.3)' },
            { zh: '行高从默认 1.2 提到 1.7 —— 与更短的行长配套（1.3）', en: 'Leading rises from 1.2 to 1.7 — paired with the shorter measure (§1.3)' },
            { zh: '所有盒子改用内在尺寸，长学院名不再需要被截断（1.2）', en: 'Every box switches to intrinsic sizing; long school names never need clipping (§1.2)' },
            { zh: '没有引入任何布局模式 —— 常规流全程在工作（1.1）', en: 'No layout mode was introduced — normal flow did all the work (§1.1)' },
          ],
        },

        { t: 'h', text: { zh: '为什么只推动了一个指标', en: 'Why only one metric moved' } },
        {
          t: 'p',
          text: {
            zh: '六项指标里，这一层只让**行长**从 138 变成 66。分组比还是 1.0（没有分组）、取值种类还是个位数（还没有标尺）、层级分只从 0.05 挪到 0.12（几乎没动）、CLS 一点没变。',
            en: 'Of the six metrics, this layer moves only **measure**, from 138 to 66. The grouping ratio is still 1.0 (there is no grouping), distinct values are still a handful (there is no scale yet), hierarchy crawls from 0.05 to 0.12, and CLS does not move at all.',
          },
        },
        {
          t: 'note',
          text: {
            zh: '**这是刻意的，而且是本课程编排的核心检验。** 每一层只负责推动它该负责的那一项，其余保持不动 —— 于是「哪个改动导致了哪个结果」始终可归因。如果某一层推不动任何指标，那说明它要么不该存在，要么讲错了地方。你可以在案例馆的「六项指标的完整轨迹」里横着读这件事。',
            en: '**This is deliberate, and it is the central check on how this course is ordered.** Each layer moves only the metric it owns and leaves the rest alone — so cause and effect stay attributable throughout. If a layer moves nothing, either it should not exist or it is teaching the wrong thing. You can read this across in the gallery’s “complete trace of all six metrics”.',
          },
        },

        { t: 'h', text: { zh: '下一层要解决什么', en: 'What the next layer solves' } },
        {
          t: 'p',
          text: {
            zh: '现在打开 stage1，问自己一个问题：**哪些内容是一伙的？** 筛选器和下面的图表是一组吗？八个数字之间有分组吗？你会发现答案是「看不出来」—— 因为所有东西之间的距离都一样。',
            en: 'Open stage1 and ask yourself one question: **what belongs with what?** Are the filters grouped with the charts below? Is there any grouping among the eight numbers? You will find the answer is “cannot tell”, because everything is the same distance from everything else.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '这正是第 2 层要做的事。而它用的工具，可能比你预期的便宜得多 —— **全程不画一条线。**',
            en: 'That is precisely what layer two is for. And its tool is far cheaper than you might expect — **it draws no lines at all.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'stage0 → stage1 完整 diff', en: 'The complete stage0 → stage1 diff' },
          purpose: { zh: '全课程最短的一次改动。注意它是纯粹的「加」，没有删任何东西。', en: 'The smallest change in the course. Note that it is purely additive — nothing was removed.' },
          code: `/* ─────────── 新增（全部） ─────────── */
+ .dash {
+   line-height: 1.7;
+ }
+ .dash__summary {
+   max-inline-size: min(100%, 68ch);
+ }
+ .kpi,
+ .bars__label {
+   block-size: auto;
+   min-inline-size: 0;
+   text-wrap: pretty;
+ }`,
          key: {
            zh: '**关键点：没有删除任何一行。** 这是整个课程的组织方式 —— 六层 CSS 是**累加**的，每一层只加规则，从不撤销下层的规则。这不只是叙事上的整洁，它也是一个真实的工程主张：**一个需要靠「覆盖上一版」才能演进的样式系统，本身就是有问题的。** 你可以在案例馆里逐层切换，验证这一点。',
            en: '**Key point: not one line was deleted.** That is how this whole course is organised — the six layers of CSS are **additive**; each layer only adds rules and never undoes the layer below. This is not just narrative tidiness, it is a real engineering claim: **a style system that can only evolve by overriding its previous version has something wrong with it.** Step through the layers in the gallery and check.',
          },
        },
      ],
    },
  ],
};
