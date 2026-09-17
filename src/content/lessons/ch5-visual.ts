import type { Lesson } from '../types';

/**
 * 第 5 层 · 视觉层
 *
 * 前四层解决了「东西在哪」。这一层解决「先看哪个」。
 *
 * 这是全课程最容易变成「审美玄学」的一章，因此也是最需要度量的一章：
 * 每一节都给出一个可计算的判据（视觉重量、秩相关、质心、亮度差、内容像素占比），
 * 让「好看」这件事可以被讨论，而不只能被投票。
 *
 * 产出 stage5：层级。
 */
export const ch5: Lesson = {
  slug: 'visual',
  order: 5,
  layer: { zh: '视觉层', en: 'Visual layer' },
  adds: {
    zh: '三级层级、视觉平衡、深度层次、节奏与克制',
    en: 'Three levels of hierarchy, visual balance, depth, rhythm and restraint',
  },
  accentVar: '--ch5',
  title: { zh: '视觉层：让最重要的东西看起来最重要', en: 'The Visual Layer: Making the Most Important Thing Look Most Important' },
  subtitle: {
    zh: '结构决定了东西在哪，层级决定了眼睛先去哪。后者才是页面能不能用的关键。',
    en: 'Structure decides where things are; hierarchy decides where the eye goes first. The second is what makes a page usable.',
  },
  summary: {
    zh: '扫视路径、视觉重量与秩相关、光学居中与平衡、深度的四种编码、节奏与重复、装饰的克制。这一层把「好看」变成六个可以算出来的量 —— 特别是层级分：视觉重量序列与业务重要度序列的秩相关，从 0.34 推到 0.84。',
    en: 'Scan paths, visual weight and rank correlation, optical centring and balance, the four encodings of depth, rhythm and repetition, and restraint in decoration. This layer turns “looking good” into six computable quantities — above all the hierarchy score: the rank correlation between visual weight and business importance, pushed from 0.34 to 0.84.',
  },

  sections: [
    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '5.1',
      title: { zh: '眼睛怎么扫一个页面', en: 'How the Eye Sweeps a Page' },
      subtitle: {
        zh: 'F 型、Z 型、古腾堡图 —— 三个被滥用的模型，和它们真正的适用边界。',
        en: 'F-pattern, Z-pattern, the Gutenberg diagram — three overused models and where they actually apply.',
      },
      theory: ['nielsen-f-pattern', 'gutenberg-diagram', 'ware-perception'],
      demo: {
        id: 'scan-path',
        hint: {
          zh: '在三种页面类型之间切换，D3 用实际的注视点序列画出扫视路径与热区。**注意观察：同一份内容，只要视觉层级变了，扫视路径就完全不同** —— 路径不是由布局决定的，是由层级决定的。',
          en: 'Switch between three page types; D3 draws the fixation sequence and heat zones. **Watch closely: the same content under a different visual hierarchy produces a completely different path** — the path is decided by hierarchy, not by layout.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '眯起眼睛看是一片灰，然后呢', en: 'You squint, you see grey — now what?' } },
        {
          t: 'p',
          text: {
            zh: '上一章结尾给 stage4 的截图加了 8px 模糊，看到的是一片均匀的灰。结论很清楚：**这个页面没有告诉眼睛该先看哪里。** 那么问题就来了 —— 在没有人告诉它的时候，眼睛自己会去哪？',
            en: 'The previous chapter put an 8px blur over a screenshot of stage4 and got a uniform field of grey. The conclusion was plain: **this page does not tell the eye where to look first.** Which raises the question — when nobody tells it, where does the eye go on its own?',
          },
        },
        {
          t: 'p',
          text: {
            zh: '这个问题有现成的答案，而且被引用了几十年：F 型、Z 型、古腾堡图。它们是设计文章里出现频率最高的三张图，**也是被误用最多的三张图**，所以在搬用之前，得先说清楚它们各自在什么条件下才成立。',
            en: 'There are ready-made answers, quoted for decades: the F-pattern, the Z-pattern, the Gutenberg diagram. They are the three most reproduced diagrams in design writing — **and the three most misapplied** — so before borrowing them we should be clear about the conditions each one actually holds under.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '三者的共同前提是：**页面上没有强层级**。眼睛之所以走出 F 或 Z，是因为没有任何东西突出到值得先看，于是只好按阅读惯性走。**换句话说，这三个模型描述的正是 stage4 此刻的处境。**',
            en: 'All three share one premise: **the page has no strong hierarchy**. The eye traces an F or a Z precisely because nothing stands out enough to deserve going first, so it falls back on reading habit. **Which is to say: these three models describe exactly where stage4 stands right now.**',
          },
        },
        {
          t: 'quote',
          text: {
            zh: '用户以 F 型模式阅读，是网页设计失败的表现，而不是需要去迎合的规律。它意味着页面没有提供足以打断这种惯性扫视的视觉线索。',
            en: 'F-pattern reading is a sign of failed web design, not a law to be accommodated. It means the page offers no visual cue strong enough to interrupt that habitual sweep.',
          },
          cite: { zh: '基于 Nielsen Norman Group 眼动研究的解读', en: 'A reading of the Nielsen Norman Group eye-tracking studies' },
        },
        {
          t: 'key',
          text: {
            zh: '**本节的立场**：这些模型的价值不是「照着摆」，而是告诉你**没有层级时会发生什么**。你的目标不是顺应 F 型，而是**造出比 F 型更强的引力**。',
            en: '**The position taken here**: the value of these models is not as templates to arrange things by, but as a description of **what happens when hierarchy is absent**. Your goal is not to conform to the F-pattern but to **create a pull stronger than it**.',
          },
        },

        { t: 'h', text: { zh: '三个模型各自适用于什么', en: 'What each model is actually for' } },
        {
          t: 'table',
          head: [
            { zh: '模型', en: 'Model' },
            { zh: '适用', en: 'Applies to' },
            { zh: '不适用', en: 'Does not apply to' },
          ],
          rows: [
            [
              { zh: 'F 型', en: 'F-pattern' },
              { zh: '文本密集、层级扁平的页面：搜索结果、文章列表、纯文档', en: 'Text-dense, flat-hierarchy pages: search results, article lists, plain documents' },
              { zh: '有大图、大数字、强色块的页面 —— 它们会直接劫持第一注视点', en: 'Pages with large images, large numbers or strong colour blocks — they hijack the first fixation outright' },
            ],
            [
              { zh: 'Z 型', en: 'Z-pattern' },
              { zh: '内容极少的落地页：一个标题 + 一句话 + 一个按钮', en: 'Very sparse landing pages: one headline, one line, one button' },
              { zh: '任何有多个可比较元素的页面（看板、表格、列表）', en: 'Any page with multiple comparable elements (dashboards, tables, lists)' },
            ],
            [
              { zh: '古腾堡图', en: 'Gutenberg diagram' },
              { zh: '均质的长文本：书页、合同、报告正文', en: 'Homogeneous long text: book pages, contracts, report bodies' },
              { zh: '模块化界面 —— 它的前提是「页面是一整块连续文本」', en: 'Modular interfaces — it presumes the page is one continuous block of text' },
            ],
          ],
        },

        { t: 'h', text: { zh: '唯一值得记住的那条：主视区', en: 'The one thing worth remembering: the primary optical area' } },
        {
          t: 'p',
          text: {
            zh: '古腾堡图里真正可迁移的只有一个概念：**主视区（Primary Optical Area）**，即左上角区域 —— 横排从左到右的书写系统中，眼睛的默认起点。',
            en: 'Only one idea from the Gutenberg diagram transfers: the **primary optical area** — the top-left region, the default starting point of the eye in left-to-right writing systems.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '这不是文化习惯，是**阅读训练形成的运动定势**。也正因为它是默认值，所以有两种用法：把最重要的东西放在那里（顺势），或者用极强的视觉重量把眼睛从那里拽走（造势）。**没有第三种 —— 把最重要的东西放在右下角且不给任何视觉强调，是最常见的失败。**',
            en: 'This is not a cultural habit but a **motor set trained by reading**. Because it is the default, there are two ways to use it: put the most important thing there (go with it), or use overwhelming visual weight to pull the eye away from it (override it). **There is no third option — putting the most important thing bottom-right with no visual emphasis is the classic failure.**',
          },
        },
        {
          t: 'note',
          text: {
            zh: '**RTL 语言（阿拉伯语、希伯来语）的主视区在右上角。** 这就是为什么第 1 层坚持用 `margin-inline-start` 而不是 `margin-left` —— 逻辑属性让布局跟着书写方向走，而主视区也会跟着翻转。**一个在第 1 层看起来像洁癖的决定，在第 5 层才显出它的价值。**',
            en: '**In RTL languages (Arabic, Hebrew) the primary optical area is top-right.** This is why layer one insisted on `margin-inline-start` over `margin-left` — logical properties let the layout follow the writing direction, and the primary optical area flips with it. **A decision that looked like fussiness in layer one only pays off in layer five.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: '把「最重要」放进主视区', en: 'Putting “most important” in the primary optical area' },
          purpose: { zh: '案例中主指标卡的定位依据。', en: 'The reasoning behind the primary KPI card’s placement in the case.' },
          code: `/* KPI 区在第 4 层已经是网格。这里只做一件事：
   让 DOM 里的第一个（= 业务最重要的）占据主视区并跨两列 */
.dash__kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-5);
}
.kpi[data-rank='primary'] {
  grid-column: span 2;          /* 面积也是视觉重量的一部分 */
}`,
          highlight: [8],
          key: {
            zh: '**关键点**：注意这里没有用 `order`，也没有用 `grid-row-start`。**主视区是网格的第一格，而业务最重要的卡片在 DOM 里本来就是第一个** —— 第 4.4 节把 DOM 顺序写对之后，「放进主视区」这件事不需要任何额外代码。层级与顺序在这里天然对齐了，这不是巧合，是前一层的回报。',
            en: '**Key point**: no `order` here, and no `grid-row-start`. **The primary optical area is the grid’s first cell, and the most business-critical card is already first in the DOM** — once §4.4 got DOM order right, “put it in the primary optical area” needs no extra code at all. Hierarchy and order line up for free, which is not luck but the previous layer paying out.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '5.2',
      title: { zh: '视觉层级：把「好看」变成一个可以算的数', en: 'Hierarchy: Turning “Looks Good” into a Number' },
      subtitle: {
        zh: '六个杠杆，一个秩相关。本层负责的指标就在这一节定义。',
        en: 'Six levers and one rank correlation. The metric this layer owns is defined right here.',
      },
      theory: ['ware-perception', 'universal-principles', 'apca-contrast'],
      demo: {
        id: 'hierarchy',
        hint: {
          zh: '拖动六个杠杆（字号 / 字重 / 对比度 / 面积 / 留白 / 位置），D3 实时计算**视觉重量**并与业务重要度做**斯皮尔曼秩相关**。目标是把层级分推到 0.8 以上 —— 你会发现单靠字号推不上去。',
          en: 'Drag the six levers (size, weight, contrast, area, whitespace, position); D3 computes **visual weight** live and correlates it with business importance via **Spearman’s rank correlation**. Aim to push the score past 0.8 — and notice that size alone cannot get you there.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '为什么需要一个数', en: 'Why we need a number' } },
        {
          t: 'p',
          text: {
            zh: '「这个页面层级不清楚」是设计评审里最常见、也最无法推进的一句话。说的人说不清哪里不清楚，改的人不知道改到什么程度算好。**这一节把它变成一个 0 到 1 的数。**',
            en: '“The hierarchy is unclear” is the most common and least actionable sentence in a design review. The person saying it cannot say where, and the person fixing it cannot tell when it is fixed. **This section turns it into a number between 0 and 1.**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '做法很直接：给页面上每个元素算一个**视觉重量**（它有多吸引眼睛），再给它一个**业务重要度**（它有多值得被看）。如果两个序列的排序完全一致，层级就是完美的。衡量两个排序有多一致，用**斯皮尔曼秩相关系数**。',
            en: 'The method is direct: give every element a **visual weight** (how much it attracts the eye) and a **business importance** (how much it deserves attention). If the two orderings agree exactly, the hierarchy is perfect. The agreement of two orderings is measured by **Spearman’s rank correlation coefficient**.',
          },
        },

        { t: 'h', text: { zh: '视觉重量的六个杠杆', en: 'The six levers of visual weight' } },
        {
          t: 'table',
          head: [
            { zh: '杠杆', en: 'Lever' },
            { zh: '强度', en: 'Strength' },
            { zh: '代价', en: 'Cost' },
          ],
          rows: [
            [{ zh: '**字号**', en: '**Size**' }, { zh: '最强，且是唯一能被「一眼」感知的', en: 'Strongest, and the only one perceived at a glance' }, { zh: '占空间；音阶只有 8 档，用完就没了', en: 'Consumes space; the scale has only eight steps and they run out' }],
            [{ zh: '**面积**', en: '**Area**' }, { zh: '很强（跨列、更大的卡片）', en: 'Very strong (spanning columns, a bigger card)' }, { zh: '挤压其他元素，改变整页比例', en: 'Squeezes everything else and changes the page proportions' }],
            [{ zh: '**对比度**', en: '**Contrast**' }, { zh: '强，且不占任何空间', en: 'Strong, and costs no space at all' }, { zh: '下限受可读性约束（正文至少 4.5:1）', en: 'Bounded below by legibility (4.5:1 minimum for body text)' }],
            [{ zh: '**留白**', en: '**Whitespace**' }, { zh: '中等，但最「高级」', en: 'Moderate, but the most refined' }, { zh: '很贵 —— 一屏能放的东西变少', en: 'Expensive — less fits on a screen' }],
            [{ zh: '**字重**', en: '**Weight**' }, { zh: '中等', en: 'Moderate' }, { zh: '中文字体的字重档位往往不全', en: 'CJK fonts often lack the intermediate weights' }],
            [{ zh: '**位置**', en: '**Position**' }, { zh: '中等（主视区加成）', en: 'Moderate (the primary-optical-area bonus)' }, { zh: '受结构约束，不能随便挪', en: 'Constrained by structure; not freely movable' }],
          ],
        },
        {
          t: 'key',
          text: {
            zh: '**关键洞察：层级是多个杠杆的乘积，不是某一个杠杆的和。** 一个元素只靠字号大两档，层级感是弱的；同时大两档 + 深一级对比 + 多一圈留白，层级感是压倒性的。**演示里你会发现：只拖字号那一根杆，秩相关最多推到 0.6 左右就卡住了。**',
            en: '**The key insight: hierarchy is a product of levers, not the sum of one.** An element two steps larger reads weakly; two steps larger *and* one step darker *and* with an extra ring of whitespace reads overwhelmingly. **In the demo you will find that dragging size alone stalls the correlation around 0.6.**',
          },
        },

        { t: 'h', text: { zh: '三级原则', en: 'The rule of three levels' } },
        {
          t: 'p',
          text: {
            zh: '经验法则：**一屏之内最多三级层级**。主（一个）、次（三到五个）、辅（其余）。原因是工作记忆：人能同时保持的分组数量大约是 3–4 个，超过之后「层级」退化成「一堆不同大小的东西」。',
            en: 'A rule of thumb: **at most three levels of hierarchy per screen** — primary (one), secondary (three to five), tertiary (the rest). The reason is working memory: people hold about three or four groups at once, and beyond that “hierarchy” degrades into “an assortment of sizes”.',
          },
        },
        {
          t: 'pitfall',
          text: {
            zh: '**最常见的失败不是层级太少，而是「全部都是主」。** 每个业务方都要求自己的模块「更醒目一点」，于是所有模块都加粗、都放大、都用主色。**当一切都被强调，就等于什么都没有被强调** —— 这时秩相关会掉回接近 0，因为视觉重量序列变成了常数序列，跟任何重要度序列都不相关。',
            en: '**The usual failure is not too few levels but “everything is primary”.** Every stakeholder wants their module “a bit more prominent”, so everything gets bold, big and branded. **When everything is emphasised, nothing is** — and the correlation collapses toward zero, because a constant weight sequence correlates with no importance sequence at all.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '这个度量的实用价值就在这里：它把「都很重要」这句话变成一个可验证的命题。**如果所有模块的视觉重量相同，层级分就是 0 —— 这不是审美判断，是算出来的。**',
            en: 'That is where the metric earns its keep: it turns “they are all important” into a testable claim. **If every module carries the same visual weight, the hierarchy score is zero — and that is arithmetic, not taste.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'ts',
          file: { zh: 'src/lib/metrics/hierarchy.ts', en: 'src/lib/metrics/hierarchy.ts' },
          purpose: { zh: '视觉重量模型与层级分 —— 本站真实使用的实现。', en: 'The visual weight model and hierarchy score — the implementation this site actually uses.' },
          code: `/** 视觉重量：各杠杆归一化后加权求和。权重来自视知觉文献的相对显著度排序 */
export function visualWeight(el: WeightInput): number {
  const size     = Math.log2(el.fontSizePx / 16) / 3;   // 对数 —— 感知是对数的
  const weight   = (el.fontWeight - 400) / 500;
  const contrast = el.contrastRatio / 21;
  const area     = Math.sqrt(el.areaPx) / 40;           // 开方 —— 面积感知近似线性于边长
  const space    = el.surroundingSpacePx / 96;
  const position = el.isPrimaryOptical ? 1 : 0;

  return clamp01(
    0.30 * size + 0.12 * weight + 0.22 * contrast +
    0.20 * area + 0.10 * space  + 0.06 * position,
  );
}

/** 层级分：视觉重量序列与业务重要度序列的斯皮尔曼秩相关，∈[-1,1] */
export function hierarchyScore(els: WeightInput[]): number {
  return spearman(els.map(visualWeight), els.map((e) => e.importance));
}`,
          highlight: [3, 6],
          key: {
            zh: '**关键点在第 3 行和第 6 行的非线性。** 字号用 `log2`，是因为感知量与物理量呈对数关系（韦伯–费希纳定律）—— 32px 相对 16px 的「大一倍」感，和 64px 相对 32px 是一样的。面积用 `sqrt`，是因为人对面积的判断接近线性于边长而不是面积本身（这也是为什么面积编码在数据可视化里不被推荐）。**如果这两处写成线性，模型算出来的结果会和眼睛的判断明显不符。**',
            en: '**The non-linearity on lines 3 and 6 is the point.** Size uses `log2` because perceived magnitude is logarithmic in the physical one (the Weber–Fechner law) — 32px feels “twice” 16px in the same way 64px feels twice 32px. Area uses `sqrt` because people judge area roughly linearly in *side length*, not in area (the same reason area encoding is discouraged in data visualisation). **Written linearly, the model would visibly disagree with the eye.**',
          },
        },
        {
          t: 'code',
          lang: 'css',
          file: { zh: '三级层级的实现（乘积，不是单杠杆）', en: 'Three levels, implemented as a product' },
          purpose: { zh: '每一级同时动三根杠杆。', en: 'Each level moves three levers at once.' },
          code: `.kpi[data-rank='primary'] {
  font-size: var(--step-5);        /* 杠杆 1：字号 +3 档 */
  color: var(--ink-1);             /* 杠杆 2：最高对比 */
  grid-column: span 2;             /* 杠杆 3：面积 ×2 */
  padding: var(--space-6);         /* 杠杆 4：留白更多 */
}
.kpi[data-rank='secondary'] {
  font-size: var(--step-3);
  color: var(--ink-1);
  padding: var(--space-5);
}
.kpi[data-rank='tertiary'] {
  font-size: var(--step-1);
  color: var(--ink-3);             /* 降对比 —— 不占空间的降级手段 */
  padding: var(--space-5);
}`,
          highlight: [15],
          key: {
            zh: '**关键点**：注意 `tertiary` 只降了字号和对比度，**没有降留白** —— 如果连内边距都缩小，卡片会显得「被压扁」，读起来像是坏了而不是像次要。**降级要降「响度」，不要降「体面」。** 这个分寸感是层级设计里最难传授的部分，但它有一个可操作的判据：降级后的元素应该仍然看起来是完整的、刻意的，而不是剩下的。',
            en: '**Key point**: `tertiary` drops only size and contrast and **keeps its whitespace**. Shrink the padding too and the card looks squashed — broken rather than secondary. **De-emphasis should lower the volume, not the dignity.** That sense of proportion is the hardest part of hierarchy to teach, but it has a workable test: a de-emphasised element should still look complete and deliberate, not left over.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '5.3',
      title: { zh: '平衡与光学居中', en: 'Balance and Optical Centring' },
      subtitle: {
        zh: '数学上的居中经常看起来不居中 —— 这不是错觉，是可以算出来的。',
        en: 'Mathematically centred often does not look centred — and that is computable, not imaginary.',
      },
      theory: ['ware-perception', 'universal-principles', 'muller-brockmann'],
      demo: {
        id: 'balance-lab',
        hint: {
          zh: '拖动画布上的方块，D3 实时算出**视觉质心**并画出失衡向量。切换「阅读引力」开关，你会看到质心整体左移 —— 这是本节最反直觉、也最重要的一个事实。',
          en: 'Drag the blocks; D3 computes the **visual centroid** live and draws the imbalance vector. Toggle “reading gravity” and watch the centroid shift left — the most counter-intuitive and most important fact in this section.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '视觉质心', en: 'The visual centroid' } },
        {
          t: 'p',
          text: {
            zh: '把页面想象成一块板，每个元素是板上的一个重物，重量等于它的视觉重量（5.2 节那个数）。**所有重物的加权平均位置就是视觉质心。** 质心离几何中心越远，页面越「偏」。',
            en: 'Think of the page as a board and every element as a weight on it, its mass equal to its visual weight (the number from §5.2). **The weighted average position of all those masses is the visual centroid.** The further it sits from the geometric centre, the more the page tilts.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '但这里有一个关键修正：**眼睛不是均匀地对待左右两边的**。横排从左到右的阅读训练让左侧元素获得额外的注意力权重 —— 我们把这个系数叫「阅读引力」。',
            en: 'But there is a crucial correction: **the eye does not treat left and right equally.** Left-to-right reading training gives elements on the left extra attentional weight — a coefficient we call “reading gravity”.',
          },
        },
        {
          t: 'note',
          text: {
            zh: '**一个会让人第一次看到时以为是 bug 的推论**：一个左右完全对称的布局，它的视觉质心**不在中线上**，而是偏左的。本站的单元测试专门断言了这一点，并在注释里写明「这是正确行为，不要修」—— 因为它看起来太像一个浮点误差了。',
            en: '**A corollary that looks like a bug the first time you see it**: a perfectly left-right symmetric layout has its visual centroid **off the midline**, slightly to the left. This site’s unit tests assert exactly that, with a comment saying “this is correct, do not fix it” — because it looks far too much like a floating-point error.',
          },
        },

        { t: 'h', text: { zh: '光学居中：为什么要比中间高一点', en: 'Optical centring: why it must sit above the middle' } },
        {
          t: 'p',
          text: {
            zh: '把一个元素放在容器高度的正中间（50%），大多数人会觉得它「偏低」。传统排版的解法是把它放在约 **45%** 的位置 —— 这被称为光学中心。',
            en: 'Put an element at exactly 50% of a container’s height and most people find it “a bit low”. The traditional fix is to place it at roughly **45%** — the optical centre.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '原因有两个：其一，视野的上半部分在感知上被「压缩」了（和地平线以上的空间感知一致）；其二，阅读方向自上而下，上方先被扫到，因此上方需要更多的余裕来「起跑」。',
            en: 'Two reasons. First, the upper half of the visual field is perceptually compressed (the same effect as space above a horizon). Second, reading runs top to bottom, so the top is scanned first and needs more room to start.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '实践中的三个应用：对话框标题区、空状态插图、按钮内的图标 + 文字 —— 这三处用数学居中都会觉得「往下坠」。',
            en: 'Three places this shows up in practice: dialog headers, empty-state illustrations, and icon-plus-text inside buttons — all three feel like they sag when centred mathematically.',
          },
        },

        { t: 'h', text: { zh: '对称 vs 非对称：两种不同的工具', en: 'Symmetric vs asymmetric: two different tools' } },
        {
          t: 'versus',
          good: {
            title: { zh: '对称平衡：稳定、正式、安全', en: 'Symmetric balance: stable, formal, safe' },
            text: {
              zh: '适合表单、对话框、正式文档。代价是**缺乏方向性** —— 对称的构图不告诉眼睛该往哪走，所以它依赖字号层级来引导。',
              en: 'Right for forms, dialogs and formal documents. The cost is **no directionality** — a symmetric composition tells the eye nothing about where to go, so it must lean on type hierarchy instead.',
            },
          },
          bad: {
            title: { zh: '非对称平衡：有张力、有方向', en: 'Asymmetric balance: tension and direction' },
            text: {
              zh: '适合首页、看板、营销页。用「小而重」（高对比的小元素）平衡「大而轻」（大面积的浅色块）。**难点在于它必须被算，不能靠感觉 —— 本站首页的 7:5 分栏就是这么定的。**',
              en: 'Right for home pages, dashboards and marketing. Balance “small and heavy” (a high-contrast small element) against “large and light” (a big pale block). **The difficulty is that it must be computed rather than felt — this site’s 7:5 hero split was decided exactly that way.**',
            },
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：平衡不是「左右一样多」，而是「视觉重量的力矩相等」。一个高对比的小数字可以平衡一整块浅色的表格 —— **这就是为什么案例里主指标卡占两列就够了，不需要占四列。**',
            en: '**One line to take away**: balance is not “the same amount on each side” but “equal moments of visual weight”. One high-contrast number can balance an entire pale table — **which is why the primary KPI card in the case needs two columns, not four.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'ts',
          file: { zh: 'src/lib/metrics/balance.ts', en: 'src/lib/metrics/balance.ts' },
          purpose: { zh: '视觉质心与失衡度。', en: 'Visual centroid and imbalance.' },
          code: `const READING_GRAVITY = 0.12;   // 左侧注意力加成系数

export function visualCentroid(els: PlacedEl[], box: Box): Point {
  let mx = 0, my = 0, total = 0;
  for (const el of els) {
    // 越靠左，注意力权重越高；x=0 时 ×1.12，x=右边缘时 ×1.00
    const gravity = 1 + READING_GRAVITY * (1 - (el.cx - box.x) / box.w);
    const m = visualWeight(el) * gravity;
    mx += el.cx * m; my += el.cy * m; total += m;
  }
  return total === 0 ? centerOf(box) : { x: mx / total, y: my / total };
}

/** 失衡度：质心偏离几何中心的距离，按容器对角线归一化。< 0.06 视为平衡 */
export function imbalance(els: PlacedEl[], box: Box): number {
  const c = visualCentroid(els, box), g = centerOf(box);
  return Math.hypot(c.x - g.x, c.y - g.y) / Math.hypot(box.w, box.h);
}`,
          highlight: [1, 7],
          key: {
            zh: '**关键点**：`READING_GRAVITY = 0.12` 这个常数值得说明 —— 它不是从某篇论文里抄来的精确值，而是一个**刻意保守的量级估计**。视知觉文献能支持「左侧确实有加成」这个定性结论，但没有一个普适的定量值（它随任务、内容类型、被试的阅读方向而变）。选 0.12 是因为它足以让对称布局的质心可见地偏左，又不至于让模型的结论被这一个参数主导。**诚实地标注一个常数的来源和不确定性，比假装它精确更有用。**',
            en: '**Key point**: the constant `READING_GRAVITY = 0.12` deserves a note — it is not a precise figure lifted from a paper but a **deliberately conservative order-of-magnitude estimate**. The perception literature supports the qualitative claim that the left side gets a boost, but offers no universal quantity (it varies with task, content type and the reader’s script direction). 0.12 was chosen because it makes a symmetric layout’s centroid visibly left of centre without letting one parameter dominate the model’s conclusions. **Being honest about where a constant comes from is more useful than pretending it is exact.**',
          },
        },
        {
          t: 'code',
          lang: 'css',
          file: { zh: '光学居中的两种实现', en: 'Two ways to centre optically' },
          purpose: { zh: '一种给块，一种给行内文字。', en: 'One for blocks, one for inline text.' },
          code: `/* 块级：把容器的上内边距减去约 5% 的高度 */
.empty-state {
  display: grid;
  place-items: center;
  padding-block: calc(var(--space-8) * 0.9) var(--space-8);
}

/* 行内：图标与文字的光学对齐 —— 图标的视觉中心比几何中心低一点 */
.btn > .icon {
  translate: 0 -0.06em;   /* 用 em，随字号缩放 */
}`,
          highlight: [9],
          key: {
            zh: '**关键点**：第 9 行用 `translate` 而不是 `position: relative; top`，有两个理由。一是 `translate` 是独立属性，**不会覆盖别处写的 `transform`**（比如 hover 时的缩放），这是 CSS 近年少数实打实的人体工学改进；二是 `translate` 走合成层，不触发布局。单位用 `em` 而不是 `px`，是为了让这个补偿量随按钮字号自动缩放 —— **光学补偿必须是相对量，绝对量在别的字号上一定会错。**',
            en: '**Key point**: line 9 uses `translate` rather than `position: relative; top`, for two reasons. First, `translate` is an independent property and **will not clobber a `transform` set elsewhere** (a hover scale, say) — one of the few genuine ergonomic wins in recent CSS. Second, it runs on the compositor and triggers no layout. The unit is `em`, not `px`, so the compensation scales with the button’s type size — **optical compensation must be relative; an absolute value will be wrong at every other size.**',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '5.4',
      title: { zh: '深度与层次', en: 'Depth and Layering' },
      subtitle: {
        zh: '阴影只是深度的四种编码之一，而且是暗色模式下最不可靠的那一种。',
        en: 'Shadow is only one of four encodings of depth — and the least reliable one in dark mode.',
      },
      theory: ['ware-perception', 'apca-contrast', 'universal-principles'],
      demo: {
        id: 'elevation-ladder',
        hint: {
          zh: '五级海拔，四种编码可以独立开关。切到暗色模式，然后**只留阴影** —— D3 会算出各层的感知亮度差，你会看到层级差异直接塌成一条直线。',
          en: 'Five elevation levels with four encodings you can toggle independently. Switch to dark mode and **leave only the shadow on** — D3 computes the perceptual lightness difference between levels and you will watch it collapse to a flat line.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '第三个维度是借来的', en: 'The third dimension is borrowed' } },
        {
          t: 'p',
          text: {
            zh: '到这里为止，层级和平衡都发生在**一个平面**上：谁更大、谁更重、重心偏向哪边。但界面还需要回答另一类问题 —— 这个下拉菜单是「浮」在内容上面，还是页面的一部分？这个对话框打开时，后面的东西是不是应该退后？',
            en: 'So far, hierarchy and balance have all played out on **one plane**: what is larger, what is heavier, which way the centre of mass leans. But an interface has to answer another kind of question — is this dropdown *floating above* the content or part of the page? When this dialog opens, should everything behind it recede?',
          },
        },
        {
          t: 'p',
          text: {
            zh: '屏幕是平的，所谓「深度」全都是借来的错觉。值得知道的是，这个错觉一共只有四种造法，而大多数人只用其中一种 —— 并且是最不可靠的那一种。',
            en: 'A screen is flat; all “depth” on it is a borrowed illusion. What is worth knowing is that there are only four ways to produce that illusion — and most people use just one of them, which happens to be the least dependable.',
          },
        },
        {
          t: 'ol',
          items: [
            { zh: '**阴影**：模拟光照。最直觉，但依赖「背景比元素暗」这个前提。', en: '**Shadow**: simulated lighting. The most intuitive — and it presumes the background is darker than the element.' },
            { zh: '**亮度差**：越靠前越亮（暗色模式）或越白（亮色模式）。**在任何主题下都成立。**', en: '**Luminance**: nearer means lighter (dark mode) or whiter (light mode). **Valid under any theme.**' },
            { zh: '**遮挡**：前面的盖住后面的。最强的深度线索，但需要真的有重叠。', en: '**Occlusion**: the nearer thing covers the farther. The strongest depth cue, but it requires actual overlap.' },
            { zh: '**边框 / 描边**：最弱，但在高对比模式下是唯一幸存的。', en: '**Border / outline**: the weakest, but the only one that survives forced-colours mode.' },
          ],
        },

        { t: 'h', text: { zh: '为什么暗色模式下阴影会失效', en: 'Why shadows fail in dark mode' } },
        {
          t: 'p',
          text: {
            zh: '阴影的本质是「元素挡住了光，在它后面的表面上投下更暗的区域」。这要求**背景足够亮，才有可以被压暗的余量**。亮色模式下背景是 #FFF，压到 #E8E8E8 有明显差异；暗色模式下背景已经是 #121212，往下压到 #0A0A0A —— 感知亮度差几乎为零。',
            en: 'A shadow is “the element blocks light and darkens the surface behind it”. That requires **a background bright enough to have headroom to darken**. In light mode the ground is #FFF and darkening to #E8E8E8 reads clearly; in dark mode the ground is already #121212 and darkening to #0A0A0A produces almost no perceptual difference.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '所以暗色模式的正确做法是**反过来：越靠前的层越亮**。这在物理上也说得通 —— 在暗环境里，靠近光源（观察者）的表面接收到更多光。',
            en: 'So in dark mode the correct move is **the inverse: nearer layers are lighter**. This is physically sensible too — in a dark environment, surfaces closer to the light (the viewer) receive more of it.',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**这解释了一个常见现象**：很多网站的暗色模式「看起来是平的」。不是配色不好，而是它们的层次感**全部押在阴影上**，而阴影在暗底上不工作。**修复方法不是调阴影参数，是换一种编码。**',
            en: '**This explains a familiar symptom**: many sites’ dark modes “look flat”. The palette is not the problem — their entire sense of layering **rides on shadow**, which does not work on a dark ground. **The fix is not to tune the shadow parameters but to change the encoding.**',
          },
        },

        { t: 'h', text: { zh: '海拔系统：把深度做成有限档位', en: 'An elevation system: depth as a finite set of steps' } },
        {
          t: 'p',
          text: {
            zh: '和间距标尺、排版音阶一样，深度也应该是**有限档位**而不是连续值。原因相同：档位可以被解释，连续值只能被目测。',
            en: 'Like the spacing scale and the type scale, depth should be **a finite set of steps** rather than a continuum — for the same reason: steps can be explained, continuous values can only be eyeballed.',
          },
        },
        {
          t: 'table',
          head: [
            { zh: '海拔', en: 'Elevation' },
            { zh: '用途', en: 'Used for' },
            { zh: '编码', en: 'Encoding' },
          ],
          rows: [
            [{ zh: '0', en: '0' }, { zh: '页面背景', en: 'Page ground' }, { zh: '无', en: 'None' }],
            [{ zh: '1', en: '1' }, { zh: '卡片、面板', en: 'Cards, panels' }, { zh: '亮度差一级（无阴影）', en: 'One step of luminance (no shadow)' }],
            [{ zh: '2', en: '2' }, { zh: '悬浮、选中', en: 'Hover, selected' }, { zh: '亮度差两级 + 极轻阴影', en: 'Two steps of luminance plus a very light shadow' }],
            [{ zh: '3', en: '3' }, { zh: '下拉、气泡', en: 'Dropdowns, popovers' }, { zh: '亮度 + 阴影 + 遮挡', en: 'Luminance, shadow and occlusion' }],
            [{ zh: '4', en: '4' }, { zh: '对话框', en: 'Dialogs' }, { zh: '全部四种 + 遮罩', en: 'All four, plus a scrim' }],
          ],
        },
        {
          t: 'pitfall',
          text: {
            zh: '**卡片不需要阴影。** 这是本课程会明确反对的一个流行做法。卡片的作用是「把一组内容圈起来」，这在第 2 层已经用**间距**解决了；再加一层阴影是重复编码，而重复编码会稀释真正需要深度的元素（对话框、下拉）。**看板里每张卡都有阴影，等于每张卡都没有阴影。**',
            en: '**Cards do not need shadows.** This course takes an explicit position against a popular habit. A card’s job is to fence off a group of content, which layer two already achieved with **spacing**; adding a shadow encodes the same thing twice, and duplicate encoding dilutes the elements that genuinely need depth (dialogs, dropdowns). **When every card in a dashboard has a shadow, no card has one.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'src/styles/tokens.css（节选）', en: 'src/styles/tokens.css (excerpt)' },
          purpose: { zh: '用面色而不是阴影承担 1–2 级海拔，主题切换自动正确。', en: 'Surfaces rather than shadows carry elevation 1–2, so theme switching is correct for free.' },
          code: `:root {
  --surface-0: oklch(99% 0.004 265);   /* 页面背景 */
  --surface-1: oklch(97% 0.006 265);   /* 卡片：比背景暗一点点 */
  --surface-2: oklch(94% 0.008 265);   /* 悬浮 */
  --shadow-3: 0 8px 24px -8px oklch(30% 0.03 265 / 0.18);
}

[data-theme='dark'] {
  --surface-0: oklch(17% 0.012 265);
  --surface-1: oklch(21% 0.014 265);   /* 反过来：卡片比背景亮 */
  --surface-2: oklch(25% 0.016 265);
  --shadow-3: 0 8px 24px -8px oklch(0% 0 0 / 0.5);
}`,
          highlight: [3, 10],
          key: {
            zh: '**关键点**：用 `oklch` 而不是 `hsl` 或十六进制，是因为 **oklch 的 L 分量是感知均匀的** —— 97% 到 94% 的感知差和 21% 到 18% 的感知差是一致的。用 HSL 的话，`hsl(0 0% 97%)` 到 `hsl(0 0% 94%)` 在亮色下看得见，同样的 3 个百分点在暗色区间几乎看不见，于是你必须为每个主题手工调一套魔法数字。**选对颜色空间，能把「为暗色模式重调所有颜色」这件事变成「把 L 值倒过来写」。**',
            en: '**Key point**: `oklch` rather than `hsl` or hex, because **oklch’s L component is perceptually uniform** — the step from 97% to 94% reads the same as the step from 21% to 18%. With HSL, `hsl(0 0% 97%)` to `hsl(0 0% 94%)` is visible in light mode while the same three points are nearly invisible down in the dark range, so you end up hand-tuning magic numbers per theme. **Choosing the right colour space turns “retune every colour for dark mode” into “write the L values the other way round”.**',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '5.5',
      title: { zh: '节奏与重复', en: 'Rhythm and Repetition' },
      subtitle: {
        zh: '完全均匀是单调，完全随机是噪声。好的节奏在两者之间。',
        en: 'Perfectly even is monotony; perfectly random is noise. Good rhythm lives in between.',
      },
      theory: ['muller-brockmann', 'bringhurst', 'universal-principles'],
      demo: {
        id: 'rhythm-composer',
        hint: {
          zh: '拖动滑块编排一段垂直节奏，D3 画出间距序列的**自相关**。试试三种预设：全均匀，自相关曲线是平的，读作单调；全随机，没有峰值，读作噪声；分组重复，周期峰清晰，这才读作节奏。',
          en: 'Compose a vertical rhythm with the sliders while D3 plots the **autocorrelation** of the gap sequence. Try the three presets. All-even gives a flat curve, which reads as monotony. All-random gives no peak at all, which reads as noise. Grouped repetition gives a clean periodic peak — and that is what reads as rhythm.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '节奏是有周期的变化', en: 'Rhythm is variation with a period' } },
        {
          t: 'p',
          text: {
            zh: '第 2 层讲过垂直节奏（所有间距落在基线的整数倍上）。那解决的是**一致性**问题。这一节讲的是更进一步的东西：**在一致的基础上制造周期性的强弱变化**。',
            en: 'Layer two covered vertical rhythm — every gap landing on a multiple of the baseline. That solved **consistency**. This section goes one step further: **creating periodic variation on top of that consistency**.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '类比音乐：第 2 层是「所有音符都落在拍子上」，第 5 层是「强拍弱拍」。前者让你不走调，后者让人听出这是首曲子。',
            en: 'A musical analogy: layer two is “every note lands on the beat”; layer five is “strong beats and weak beats”. The first keeps you in time; the second makes it sound like a piece of music.',
          },
        },

        { t: 'h', text: { zh: '三种可用的节奏型', en: 'Three usable rhythm patterns' } },
        {
          t: 'table',
          head: [
            { zh: '节奏型', en: 'Pattern' },
            { zh: '间距序列', en: 'Gap sequence' },
            { zh: '适用', en: 'Suits' },
          ],
          rows: [
            [
              { zh: '**均匀**', en: '**Even**' },
              { zh: '24 24 24 24 24 24', en: '24 24 24 24 24 24' },
              { zh: '同级列表、表格行 —— 没有分组的地方', en: 'Peer lists and table rows — anywhere without grouping' },
            ],
            [
              { zh: '**分组**', en: '**Grouped**' },
              { zh: '8 8 48 8 8 48 —— 这就是第 2 层的比值原则', en: '8 8 48 8 8 48 — layer two’s ratio principle, restated' },
              { zh: '表单、卡片内部、任何有「组」概念的地方', en: 'Forms, card internals, anywhere with a notion of a group' },
            ],
            [
              { zh: '**渐进**', en: '**Progressive**' },
              { zh: '8 16 24 32 —— 逐级放大', en: '8 16 24 32 — widening step by step' },
              { zh: '时间线、步骤条、叙事性的长页面', en: 'Timelines, step indicators, narrative long-form pages' },
            ],
          ],
        },
        {
          t: 'note',
          text: {
            zh: '**注意第二行**：分组节奏和第 2.1 节的「组间/组内比值 ≥ 2」是同一件事的两种说法。**从格式塔角度看它是分组，从节奏角度看它是周期。** 这不是巧合 —— 我们能感知到分组，正是因为间距序列里存在周期。',
            en: '**Note the second row**: grouped rhythm and §2.1’s “between/within ratio ≥ 2” are two descriptions of one thing. **From the Gestalt side it is grouping; from the rhythm side it is periodicity.** Not a coincidence — we perceive the grouping *because* the gap sequence has a period.',
          },
        },

        { t: 'h', text: { zh: '重复建立的是「可预测性」', en: 'Repetition buys predictability' } },
        {
          t: 'p',
          text: {
            zh: '重复的价值常被表述为「统一感」，但它真正的收益是**认知负荷的下降**：读者第一次学会「这类卡片长这样、信息在这个位置」，之后每一张同类卡片都可以零成本地读。',
            en: 'Repetition’s value is usually described as “a sense of unity”, but its real payoff is **lower cognitive load**: the reader learns once that “this kind of card looks like this and the number sits here”, and every subsequent card of that kind is free to read.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '推论：**打破重复必须是有意图的，并且要打破得足够明显。** 轻微的不一致（这张卡片的内边距是 20px，其他都是 24px）不会被读成「强调」，只会被读成「没做好」。要么完全一致，要么明确不同。',
            en: 'The corollary: **breaking the repetition must be intentional and must be obvious.** A slight inconsistency (this card has 20px padding while the rest have 24px) never reads as emphasis — it reads as sloppiness. Either match exactly, or differ clearly.',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：节奏与层级是同一枚硬币的两面。**层级说的是「空间上的强弱」，节奏说的是「序列上的强弱」。** 一个页面如果层级清楚但节奏均匀，读起来会像一份正确但乏味的报表 —— 而这恰恰是大多数数据看板的现状。',
            en: '**One line to take away**: rhythm and hierarchy are two sides of one coin. **Hierarchy is emphasis across space; rhythm is emphasis across a sequence.** A page with clear hierarchy but flat rhythm reads like a correct but joyless report — which is exactly the state of most data dashboards.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: '用 :nth-child 制造周期', en: 'Creating a period with :nth-child' },
          purpose: { zh: '长列表里每 N 项加一次呼吸，让眼睛有落脚点。', en: 'A breath every N items in a long list, so the eye has somewhere to land.' },
          code: `/* 明细表：每 5 行加一次「呼吸」，长表格才有落脚点 */
.dash__table tbody tr:nth-child(5n)  { border-block-end: 1px solid var(--line-1); }
.dash__table tbody tr:nth-child(5n) td { padding-block-end: var(--space-4); }

/* ✗ 不要用斑马纹达成同样目的 */
/* tbody tr:nth-child(odd) { background: var(--surface-1); } */`,
          highlight: [2, 6],
          key: {
            zh: '**关键点：为什么反对斑马纹。** 斑马纹的周期是 2，太短了 —— 它制造的是「纹理」而不是「节奏」，眼睛会把整块表格读成一片条纹图案，反而更难定位某一行。周期 5 才能形成可数的段落（和电话号码分段、账号分段是同一个道理：**分段的价值在于让「第几个」变得可数**）。另外斑马纹给一半的行加了背景色，等于给一半的数据加了视觉重量 —— 而这些行并不比另一半更重要。',
            en: '**Key point: why zebra striping is rejected.** Its period is 2, which is far too short — it produces *texture*, not rhythm, and the eye reads the whole table as a striped pattern, making it harder to locate a row rather than easier. A period of 5 creates countable chunks (the same principle as grouping digits in a phone number: **chunking exists to make “which one” countable**). Zebra striping also tints half the rows, giving half the data extra visual weight — and those rows are not more important than the others.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '5.6',
      title: { zh: '装饰的克制', en: 'Restraint in Decoration' },
      subtitle: {
        zh: '每一条线、每一个阴影都要先回答：它承载了什么信息？',
        en: 'Every line and every shadow must first answer: what information does it carry?',
      },
      theory: ['tufte', 'universal-principles', 'muller-brockmann'],
      demo: {
        id: 'chrome-ratio',
        hint: {
          zh: '逐项关掉边框、阴影、圆角、分隔线、背景色，D3 实时算出**内容像素占比**。目标是在不损失任何信息的前提下把它推到 70% 以上 —— 你会发现大部分装饰可以直接删掉。',
          en: 'Switch off borders, shadows, radii, rules and background fills one by one while D3 recomputes the **content pixel share**. The goal is to push past 70% without losing any information — and most of the decoration turns out to be deletable.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '数据墨水比，搬到界面上', en: 'Data-ink ratio, brought to the interface' } },
        {
          t: 'quote',
          text: {
            zh: '图形中的每一滴墨水都应该承载信息。把不承载信息的墨水擦掉。',
            en: 'Every drop of ink on a graphic should carry information. Erase non-data ink.',
          },
          cite: { zh: 'Edward Tufte,《定量信息的视觉呈现》', en: 'Edward Tufte, The Visual Display of Quantitative Information' },
        },
        {
          t: 'p',
          text: {
            zh: 'Tufte 说的是统计图表，但这条原则对界面同样成立，只需要把「数据墨水」换成「内容像素」：**页面上有多少比例的像素在传递内容，多少在画自己？**',
            en: 'Tufte was talking about statistical graphics, but the principle transfers to interfaces once “data ink” becomes “content pixels”: **what fraction of the page’s pixels convey content, and what fraction draw themselves?**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '要说清楚一件事：**界面不是图表，100% 不是目标。** 界面需要一部分非内容像素来表达可交互性（按钮得看起来能按）、状态（选中、禁用）和边界。但 60% 以下几乎一定有冗余。',
            en: 'To be clear: **an interface is not a chart, and 100% is not the goal.** Interfaces need some non-content pixels to signal interactivity (a button must look pressable), state (selected, disabled) and boundaries. But below 60% there is almost certainly redundancy.',
          },
        },

        { t: 'h', text: { zh: '三条自查', en: 'Three self-checks' } },
        {
          t: 'ol',
          items: [
            {
              zh: '**这条线在表达什么？** 如果答案是「分隔」，先试试用间距分隔（第 2 层）。间距不占像素，且不会在暗色模式下变成噪点。',
              en: '**What does this line express?** If the answer is “separation”, try spacing first (layer two). Spacing costs no pixels and does not turn into noise in dark mode.',
            },
            {
              zh: '**这个阴影在表达什么？** 如果答案是「这是个卡片」，那是重复编码 —— 间距已经说过了。阴影应该留给真正浮起来的东西。',
              en: '**What does this shadow express?** If the answer is “this is a card”, that is duplicate encoding — spacing already said it. Save shadows for things that genuinely float.',
            },
            {
              zh: '**这个颜色在表达什么？** 如果答案是「品牌」，问问它有没有和「状态」抢语义。品牌色和危险色都很醒目时，用户分不清哪个是警告。',
              en: '**What does this colour express?** If the answer is “the brand”, ask whether it is competing with *state* for meaning. When the brand colour and the danger colour are equally loud, users cannot tell which is the warning.',
            },
          ],
        },

        { t: 'h', text: { zh: '删掉装饰之后，靠什么维持结构？', en: 'With the decoration gone, what holds the structure?' } },
        {
          t: 'p',
          text: {
            zh: '这是这一节最常收到的反驳，而答案在前四层：**间距（第 2 层）负责分组，网格（第 3 层）负责对齐，areas（第 4 层）负责骨架。** 当这三层都做对了之后，边框和阴影确实是多余的 —— 它们原本是在**代偿前几层没做好**。',
            en: 'This is the usual objection, and the answer lies in the earlier layers: **spacing (layer two) groups, the grid (layer three) aligns, areas (layer four) provide the skeleton.** With those three right, borders and shadows really are redundant — they were **compensating for earlier layers that were not done properly.**',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**这就是把「视觉」放在第 5 层而不是第 1 层的理由。** 如果一上来就做视觉，你会用边框和阴影去弥补结构的缺失，而且效果还不错 —— 差到足以让你永远不去修真正的问题。**顺序本身就是一种教学法。**',
            en: '**This is the reason “visual” is layer five and not layer one.** Start with visuals and you will paper over missing structure with borders and shadows — and it will work well enough that you never go back and fix the real problem. **The order is itself a pedagogy.**',
          },
        },
        {
          t: 'note',
          text: {
            zh: '**第 4.5 节留下的那条线，现在可以回头看了。** 当时为了在筛选区与图表区之间补足分隔，我们加了全页唯一的一条 `border`。到 stage5，图表区已经有了自己的面色（`--surface-1`），两个区域之间的边界由面色差异表达得很清楚 —— **那条线可以删掉了。** 这就是本节要求的自查在案例里的实际执行：装饰是临时的代偿，代偿的条件消失后就该撤掉。',
            en: '**The line left over from §4.5 can now be revisited.** We added the page’s only `border` there to shore up the separation between filters and charts. By stage5 the chart area has its own surface (`--surface-1`) and the boundary is expressed clearly by the surface difference — **so the line comes out.** That is this section’s self-check applied to the case: decoration is temporary compensation, and when the condition that required it disappears, it should go.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: '一次典型的「删掉装饰」', en: 'A typical decoration cleanup' },
          purpose: { zh: '减掉的每一行，都由前面某一层顶上。', en: 'Every removed line is covered by an earlier layer.' },
          code: `.kpi {
-  border: 1px solid var(--line-2);        /* 分组 → 第 2 层的间距已经做到了 */
-  box-shadow: 0 2px 8px rgb(0 0 0 / 0.08);/* 「是张卡片」→ 重复编码 */
-  border-radius: 12px;                    /* 12px 只是习惯，不是需求 */
+  background: var(--surface-1);           /* 共同区域：一个面色就够 */
+  border-radius: var(--radius-2);         /* 收进标尺：4 / 8 两档 */
   padding: var(--space-5);
}

/* 分隔线只保留一处：表格的表头与数据之间。
   这里必须用线，因为表头和数据的间距不能拉大到能表达分隔的程度 ——
   拉大会破坏行与表头的关联。这是本页唯一无法用间距解决的分隔。 */
.dash__table thead th { border-block-end: 2px solid var(--line-1); }`,
          highlight: [2, 3, 13],
          key: {
            zh: '**关键点在最后那条保留下来的线。** 本节的立场不是「不要用线」，而是「用线之前先证明间距不行」。表头这个场景恰好是间距解决不了的：加大表头与首行的距离会让表头看起来不属于这张表。**能说清楚为什么留下这一条，比删掉全部更有价值 —— 前者是判断，后者只是另一种教条。**',
            en: '**The point is the one line that stays.** This section’s position is not “never use rules” but “prove spacing cannot do it first”. The table header is precisely a case where it cannot: widening the gap between the header and the first row makes the header look like it belongs to something else. **Being able to say why this one stays is worth more than deleting them all — the first is judgement, the second is just a different dogma.**',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '5.7',
      title: { zh: '案例：让最重要的数字最重', en: 'Case: Making the Most Important Number Heaviest' },
      subtitle: {
        zh: 'stage4 → stage5。层级分 0.34 → 0.84。',
        en: 'stage4 → stage5. Hierarchy score 0.34 → 0.84.',
      },
      theory: ['ware-perception', 'tufte', 'apca-contrast'],
      caseStage: 'stage5',
      demo: {
        id: 'case-s5',
        hint: {
          zh: '对比 stage4 与 stage5，然后打开「模糊」开关 —— 加 8px 高斯模糊后，stage4 是一片均匀的灰，stage5 仍然能看出「先看哪个」。**这是检验层级最快的方法。**',
          en: 'Compare stage4 with stage5, then switch on “blur” — under an 8px Gaussian blur, stage4 is a uniform grey field while stage5 still tells you what to look at first. **The fastest test of hierarchy there is.**',
        },
      },
      explain: [
        { t: 'h', text: { zh: '这一层做了什么', en: 'What this layer did' } },
        {
          t: 'p',
          text: {
            zh: '前六节给了六根杠杆和四个判据。这一层的动作可以概括成一句话：**把杠杆用在最重要的那一块上，把装饰从其余所有地方拿掉。**',
            en: 'The six sections before this supplied six levers and four tests. What this layer does comes down to one sentence: **apply the levers to the one thing that matters most, and strip the decoration off everything else.**',
          },
        },
        {
          t: 'ol',
          items: [
            { zh: '主指标卡进入主视区、跨两列、字号跳到 `--step-5` —— 四根杠杆同时推（5.1、5.2）', en: 'The primary KPI card moves into the primary optical area, spans two columns and jumps to `--step-5` — four levers at once (§5.1, §5.2)' },
            { zh: '辅助指标同时降字号与降对比度，形成明确的三级（5.2）', en: 'Supporting metrics drop in both size and contrast, producing three clear levels (§5.2)' },
            { zh: '主指标跨两列同时解决了失衡：它的重量平衡了右侧整块表格（5.3）', en: 'The primary card’s two columns also fix the imbalance: its weight counterbalances the whole table on the right (§5.3)' },
            { zh: '海拔改用两级面色承担，暗色模式下层次由亮度表达（5.4）', en: 'Elevation shifts to two surface levels, with luminance carrying the layering in dark mode (§5.4)' },
            { zh: '明细表每 5 行一次呼吸，长表有了落脚点（5.5）', en: 'The table breathes every five rows, giving a long list somewhere to land (§5.5)' },
            { zh: '删除 8 处边框与 2 处阴影（含 4.5 节那条临时线），内容像素占比 +14%（5.6）', en: 'Eight borders and two shadows removed (including §4.5’s temporary rule); content pixel share up 14% (§5.6)' },
          ],
        },

        { t: 'h', text: { zh: '为什么是 0.84 而不是 1.0', en: 'Why 0.84 and not 1.0' } },
        {
          t: 'p',
          text: {
            zh: '层级分没有满分，也不该追求满分。剩下的 0.16 主要来自两个**刻意的妥协**：',
            en: 'The hierarchy score is not maxed out, and should not be. The remaining 0.16 comes mostly from two **deliberate compromises**:',
          },
        },
        {
          t: 'ul',
          items: [
            {
              zh: '**筛选器的视觉重量高于它的业务重要度。** 它在业务上排第 6，但它是交互入口，必须一眼能找到。**可交互性也是一种「重要」，只是不在业务重要度序列里。**',
              en: '**The filter bar carries more visual weight than its business importance.** It ranks sixth by business value but is the interaction entry point and must be findable at a glance. **Being interactive is its own kind of importance — one the business ranking does not encode.**',
            },
            {
              zh: '**更新时间的重量高于它的排序。** 它在业务上几乎垫底，但在数据看板里，「这份数据是什么时候的」影响读者对所有其他数字的信任度。',
              en: '**The “last updated” stamp outweighs its rank.** It is near the bottom of the business ordering, but on a data dashboard “how fresh is this?” conditions the reader’s trust in every other number.',
            },
          ],
        },
        {
          t: 'key',
          text: {
            zh: '**度量是用来发现问题的，不是用来被优化到满分的。** 如果硬把这两项压下去以换取 1.0，页面会变得更难用 —— 而指标会变得更好看。**任何度量被当成目标之后都会失效，这不是布局特有的问题。** 正确的用法是：指标异常时去看为什么，而不是去把指标调正常。',
            en: '**A metric exists to surface problems, not to be optimised to a perfect score.** Force those two down to buy 1.0 and the page gets harder to use while the number looks better. **Any metric turned into a target stops measuring — this is not specific to layout.** The correct use is: when the number looks wrong, go and find out why, not go and make the number look right.',
          },
        },

        { t: 'h', text: { zh: '下一层要解决什么', en: 'What the next layer solves' } },
        {
          t: 'p',
          text: {
            zh: '现在这个页面在 1440px 的屏幕上是好用的。但是：把窗口拖到 375px，12 列网格会把主指标卡挤成一条 60px 宽的竖条；加载时图表区从 0 高度跳到 320px，CLS 是 0.28；`--step-5` 在手机上大得离谱。',
            en: 'The page is now good on a 1440px screen. But: drag the window to 375px and the 12-column grid squeezes the primary card into a 60px strip; the chart area jumps from zero height to 320px on load, giving a CLS of 0.28; and `--step-5` is absurdly large on a phone.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '**前五层解决的都是「在一个确定尺寸下把页面做对」。第 6 层解决「在所有尺寸、所有加载时刻都保持对」。**',
            en: '**The first five layers make the page right at one particular size. Layer six makes it stay right at every size and at every moment of loading.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'stage4 → stage5 完整 diff', en: 'The complete stage4 → stage5 diff' },
          purpose: { zh: '加层级、减装饰 —— 这一层是全课程唯一「删的比加的多」的一层。', en: 'Add hierarchy, remove decoration — the only layer in the course that deletes more than it adds.' },
          code: `/* ── 加：三级层级 ── */
+ .kpi[data-rank='primary'] {
+   grid-column: span 2;
+   font-size: var(--step-5);
+   padding: var(--space-6);
+ }
+ .kpi[data-rank='tertiary'] { font-size: var(--step-1); color: var(--ink-3); }

/* ── 加：两级面色承担海拔 ── */
+ .kpi, .panel { background: var(--surface-1); border-radius: var(--radius-2); }

/* ── 加：长表的呼吸 ── */
+ .dash__table tbody tr:nth-child(5n) { border-block-end: 1px solid var(--line-1); }

/* ── 减：8 条边框、2 处阴影 ── */
- .kpi     { border: 1px solid var(--line-2); box-shadow: 0 2px 8px rgb(0 0 0 / .08); }
- .panel   { border: 1px solid var(--line-2); box-shadow: 0 2px 8px rgb(0 0 0 / .08); }
- .dash__filters { border-block-end: 1px solid var(--line-1); }   /* 4.5 节那条临时线 */`,
          highlight: [3, 4, 18],
          key: {
            zh: '**关键点**：注意第 3–4 行 —— 主指标同时动了「面积」和「字号」两根杠杆，这是 5.2 节「层级是乘积」的直接兑现。再注意第 18 行：第 4.5 节那条「临时补强」的线，在这一层被正式撤掉了，因为面色已经承担了同一件事。**一个跨章节的承诺在这里兑现 —— 这也是六层结构相比六个独立主题的价值：前面欠下的，后面必须还。**',
            en: '**Key point**: lines 3–4 move both the area and the size lever on the primary metric — §5.2’s “hierarchy is a product”, cashed in. Then line 18: the temporary rule added in §4.5 is formally withdrawn here, because the surface now does its job. **A promise made in one chapter is kept in another — which is the value of six layers over six independent topics: what an earlier layer borrows, a later one has to repay.**',
          },
        },
      ],
    },
  ],
};
