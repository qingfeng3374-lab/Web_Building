import type { Lesson } from '../types';

/**
 * 第 2 层 · 间距层
 *
 * 上一层把内容摆正了，但读者仍然看不出「哪些东西是一伙的」。
 * 这一层用**最便宜的手段**解决它：间距。全程不画一条线。
 *
 * 产出 stage2：有分组、有呼吸、有垂直节奏的页面。
 */
export const ch2: Lesson = {
  slug: 'spacing',
  order: 2,
  layer: { zh: '间距层', en: 'Spacing layer' },
  adds: {
    zh: '分组、呼吸、垂直节奏',
    en: 'Grouping, breathing room, vertical rhythm',
  },
  accentVar: '--ch2',
  title: { zh: '间距层：用空白说话', en: 'The Spacing Layer: Speaking with Emptiness' },
  subtitle: {
    zh: '间距是最便宜的分组手段，边框是最贵的。先把便宜的用尽。',
    en: 'Spacing is the cheapest way to group things; borders are the dearest. Exhaust the cheap one first.',
  },
  summary: {
    zh: '格式塔五律及其在界面中的强度排序、间距标尺、垂直节奏。这一层不画任何线、不加任何边框，只调整空白的分配 —— 页面就有了结构。学完之后你会有一条可以写进团队规范、并且能被机器检查的规则。',
    en: 'The five Gestalt laws and how strong each really is in a UI, the spacing scale, and vertical rhythm. This layer draws no lines and adds no borders — it only redistributes emptiness, and the page acquires structure. You will leave with one rule you can put in a style guide and have a machine check.',
  },

  sections: [
    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '2.1',
      title: { zh: '人眼如何自动分组', en: 'How the Eye Groups Things by Itself' },
      subtitle: {
        zh: '你不需要画边框告诉用户「这几个是一组」—— 间距已经说了。',
        en: 'You do not need a border to say “these belong together” — spacing already said it.',
      },
      theory: ['gestalt', 'ware-perception'],
      demo: {
        id: 'gestalt',
        hint: {
          zh: '四个滑块分别控制间距、色相差、边框粗细、共同区域底色。算法按感知阈值实时算出「人眼会分成几组」。一定要试一次「只靠间距」和「只靠边框」两个预设 —— 前者用 0 条线达成分组，后者画了 24 圈线却仍然是 24 个独立方块。',
          en: 'Four sliders control gap, hue shift, border weight and shared background; the algorithm computes how many groups a viewer perceives. Do try the “spacing only” and “borders only” presets — the first creates the grouping with zero lines, the second draws twenty-four outlines and still reads as twenty-four separate squares.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '从 stage1 出发：一个无法回答的问题', en: 'Starting from stage1: a question with no answer' } },
        {
          t: 'p',
          text: {
            zh: '打开上一层产出的 stage1，试着回答：**顶部那三个筛选器，管的是下面全部图表，还是只管紧挨着的那一张？**',
            en: 'Open stage1 from the previous layer and try to answer: **do those three filters at the top control all the charts below, or only the one immediately beneath them?**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '你答不出来。不是因为信息缺失 —— 所有内容都在页面上，而是因为**所有元素之间的距离都一样**。在感知层面，等距就等于同组；而「全都同组」等于「没有分组」。',
            en: 'You cannot. Not because information is missing — everything is on the page — but because **every element is the same distance from every other**. Perceptually, equal spacing means same group; and “everything is one group” means no grouping at all.',
          },
        },

        { t: 'h', text: { zh: '五条定律，以及它们真实的强度排序', en: 'Five laws, and how strong each one really is' } },
        {
          t: 'p',
          text: {
            zh: '格式塔心理学（Wertheimer, 1923）总结了知觉自动组织的若干规律。界面设计里最常用的是这五条 —— 下表**按在界面中的实际强度从强到弱排列**，并给出了每一条的实现成本：',
            en: 'Gestalt psychology (Wertheimer, 1923) catalogued how perception organises itself. Five laws dominate interface work. The table below lists them **from strongest to weakest in actual UI**, with the cost of each:',
          },
        },
        {
          t: 'table',
          head: [
            { zh: '定律', en: 'Law' },
            { zh: '含义', en: 'Meaning' },
            { zh: '实现成本', en: 'Cost' },
            { zh: '在案例中的用法', en: 'Use in the case' },
          ],
          rows: [
            [
              { zh: '**接近性** Proximity', en: '**Proximity**' },
              { zh: '靠得近的被看作一组', en: 'Things close together are one group' },
              { zh: '零（只是 `gap`）', en: 'Zero (just `gap`)' },
              { zh: '筛选区与图表区拉开一级间距', en: 'Separate filters from charts by one scale step' },
            ],
            [
              { zh: '**共同区域** Common region', en: '**Common region**' },
              { zh: '同一个封闭区域内的是一组', en: 'Things inside one enclosure are a group' },
              { zh: '低（一个底色）', en: 'Low (a background tint)' },
              { zh: '一张图与它的图例共享一个面', en: 'A chart and its legend share one surface' },
            ],
            [
              { zh: '**相似性** Similarity', en: '**Similarity**' },
              { zh: '长得像的被看作一类', en: 'Things that look alike form a class' },
              { zh: '中（需要一致的令牌）', en: 'Medium (needs consistent tokens)' },
              { zh: '所有 KPI 卡片同形，所有图表卡片同形', en: 'All KPI cards share a shape; all chart cards share another' },
            ],
            [
              { zh: '**连续性** Continuity', en: '**Continuity**' },
              { zh: '沿一条线排列的被看作一列', en: 'Things on a line read as a sequence' },
              { zh: '中（依赖对齐）', en: 'Medium (depends on alignment)' },
              { zh: '左对齐的标签形成一条隐形竖线', en: 'Left-aligned labels form an invisible vertical line' },
            ],
            [
              { zh: '**闭合性** Closure', en: '**Closure**' },
              { zh: '残缺的图形会被脑补完整', en: 'Incomplete shapes get completed mentally' },
              { zh: '高（要画边框）', en: 'High (you must draw borders)' },
              { zh: '只在前四条不够用时才动用', en: 'Reach for it only when the first four are not enough' },
            ],
          ],
        },
        {
          t: 'note',
          text: {
            zh: '**这张表的实用价值在第三列**：分组手段是有成本梯度的。留白免费、底色便宜、边框最贵（它增加视觉噪声、争夺对比度预算、在暗色模式下还要重新调）。**先用间距，不够再用面，最后才用线。** 第 5.6 节会把这条规则量化成一个可测的比值。',
            en: '**The value of this table is in the third column**: grouping devices have a cost gradient. Whitespace is free, a surface tint is cheap, a border is expensive (it adds visual noise, competes for the contrast budget, and needs retuning in dark mode). **Reach for spacing first, then surfaces, and only then lines.** Section 5.6 turns this into a measurable ratio.',
          },
        },

        { t: 'h', text: { zh: '接近性有多强？一个可以自己验证的实验', en: 'How strong is proximity? An experiment you can run' } },
        {
          t: 'p',
          text: {
            zh: '本节的演示给 24 个方块四个可调参数（间距、色相差、边框、底色），然后用一个**感知分组算法**（按距离阈值做并查集合并）实时算出「人眼会分成几组」。你会观察到两个结论：',
            en: 'The demo gives 24 squares four adjustable parameters (gap, hue shift, border, background) and runs a **perceptual grouping algorithm** (union-find over a distance threshold) to compute how many groups a viewer perceives. Two results emerge:',
          },
        },
        {
          t: 'ul',
          items: [
            {
              zh: '组内间距只要小于组间间距的 **1/2**，分组就成立 —— **不需要任何其它手段**。',
              en: 'As soon as the within-group gap drops below **half** the between-group gap, the grouping reads — **with no other device at all**.',
            },
            {
              zh: '反过来，如果组内间距 ≥ 组间间距，**再粗的边框也救不回来**：你会看到 24 个带框的方块，而不是 4 组。',
              en: 'Conversely, once the within-group gap equals or exceeds the between-group gap, **no border thickness rescues it**: you see 24 boxed squares, not four groups.',
            },
          ],
        },

        { t: 'h', text: { zh: '把定律写成一条可以被检查的规则', en: 'Turning the law into a checkable rule' } },
        {
          t: 'p',
          text: {
            zh: '一条足够简单、可以直接写进团队规范的规则：',
            en: 'One rule simple enough to put straight into a style guide:',
          },
        },
        {
          t: 'quote',
          text: {
            zh: '同级元素之间的间距，必须严格小于它们与上一级元素之间的间距，且至少相差一个标尺档位（比值 ≥ 2）。',
            en: 'The gap between siblings must be strictly smaller than the gap to their parent-level neighbour, by at least one step on the spacing scale (a ratio of 2 or more).',
          },
          cite: { zh: '本课程把它作为「分组比」指标，由第 2 层负责', en: 'This course tracks it as the “grouping ratio” metric, owned by layer two' },
        },
        {
          t: 'p',
          text: {
            zh: '为什么是 2 倍？感知实验表明，比值 < 1.5 时分组会变得模糊，≥ 2 时几乎不会误判。这个数字后面还会以另一种形式出现 —— 第 5.2 节讲层级时，相邻层级的对比也需要大约 2 倍。**这不是巧合：人对「明显不同」的判据，在各个维度上是相似的。**',
            en: 'Why two? Perceptual studies show grouping becomes ambiguous below a ratio of about 1.5 and is essentially unambiguous at 2 or more. The number reappears in another guise — §5.2 shows that adjacent hierarchy levels also need roughly a factor of two. **That is not a coincidence: the human threshold for “clearly different” is similar across dimensions.**',
          },
        },
        {
          t: 'pitfall',
          text: {
            zh: '**最常见的失败**：设计稿上分组清楚，是因为设计师在 Figma 里用了不同的间距；实现时前端用一个统一的 `gap: 16px` 把所有东西铺平，分组就消失了。**统一 gap 不是一致性，是信息丢失。**',
            en: '**The most common failure**: the mockup groups clearly because the designer used different gaps in Figma; then the front-end flattens everything with one uniform `gap: 16px` and the grouping evaporates. **A single uniform gap is not consistency — it is information loss.**',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: '用间距表达三级结构', en: 'Expressing three levels of structure with spacing' },
          purpose: {
            zh: '三级结构对应三个间距档位。数值来自下一节的标尺，不是拍脑袋。',
            en: 'Three structural levels map to three steps of the scale. The numbers come from the next section’s scale, not from guesswork.',
          },
          code: `.dash {
  display: grid;
  gap: var(--space-7);   /* 48px —— 区块之间（筛选区 ↔ 图表区） */
}

.dash__kpis {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);   /* 24px —— 同级卡片之间 */
}

.kpi {
  display: grid;
  gap: var(--space-2);   /* 8px  —— 卡片内部：标签 ↔ 数字 ↔ 变化率 */
}`,
          highlight: [3, 9, 15],
          key: {
            zh: '**关键点**：48 : 24 : 8 这个序列不是随便取的，相邻两级的比值都 ≥ 2 —— 正是上面那条规则的直接应用。你可以在案例里把 `--space-7` 改成 `--space-5`（让区块间距等于卡片间距），页面立刻退回 stage1 那种「什么都看不出来」的状态。**一个数字的改动，就能让结构消失。**',
            en: '**Key point**: the 48 : 24 : 8 sequence is deliberate — each adjacent ratio is ≥ 2, a direct application of the rule above. Change `--space-7` to `--space-5` in the case (making block gaps equal card gaps) and the page instantly reverts to stage1’s “cannot tell anything” state. **One number, and the structure disappears.**',
          },
        },
        {
          t: 'code',
          lang: 'css',
          file: { zh: '共同区域：比边框更便宜的封闭', en: 'Common region: enclosure cheaper than a border' },
          purpose: {
            zh: '当间距不够用（卡片必须紧挨着）时，用「面」来分组，仍然比用「线」便宜。',
            en: 'When spacing alone is not available (cards must sit close), group with a *surface* — still cheaper than a *line*.',
          },
          code: `/* ✗ 贵：每张卡一圈 1px 线，8 张卡 = 32 条线争夺注意力 */
.kpi--bordered { border: 1px solid var(--line-1); }

/* ✓ 便宜：一块底色，零条线 */
.dash { background: var(--surface-0); }   /* 页面底 */
.kpi  { background: var(--surface-1); }   /* 卡片面：比页面底亮一点点 */`,
          highlight: [5, 6],
          key: {
            zh: '**关键点**：`--surface-1` 与 `--surface-0` 之间只有很小的亮度差（#ffffff vs #f6f8fb），但这点差别足以让闭合性生效。**人眼对「面的边界」的敏感度远高于我们的直觉** —— 这也是为什么好的界面往往看不见线，却层次分明。第 5.4 节会把这个亮度差量化，并解释为什么它在暗色模式下要反过来调。',
            en: '**Key point**: `--surface-1` and `--surface-0` differ by only a sliver of luminance (#ffffff vs #f6f8fb), yet that is enough for closure to fire. **The eye is far more sensitive to surface boundaries than intuition suggests** — which is why good interfaces often show no lines at all and still read as layered. Section 5.4 quantifies that luminance gap and explains why it must invert in dark mode.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '2.2',
      title: { zh: '间距标尺：把连续决策离散化', en: 'The Spacing Scale: Discretising a Continuous Decision' },
      subtitle: {
        zh: '人在 9 个选项里做选择又快又一致；在 0–100 的连续区间里又慢又随机。',
        en: 'People choose fast and consistently among nine options, and slowly and randomly along a continuum.',
      },
      theory: ['muller-brockmann', 'universal-principles', 'gestalt'],
      demo: {
        id: 'spacing-scale',
        hint: {
          zh: '选基数（4 / 8）与增长方式（线性 / 1.5 倍 / 黄金比），D3 画出刻度尺与相邻比值，比值低于 1.5 的档位会标红 —— 那些就是冗余选项。下方两张卡片实时对照「任意间距」与「标尺间距」。',
          en: 'Pick a base (4 or 8) and a growth rule, and D3 draws the ruler with adjacent ratios — any step below 1.5 turns red, marking a redundant option. Two cards below compare ad-hoc spacing against scale spacing live.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '为什么需要标尺', en: 'Why you need a scale' } },
        {
          t: 'p',
          text: {
            zh: '上一节我们用了 48 / 24 / 8 三个数。问题来了：下一个组件该用多少？如果每次都重新想，会发生三件事：',
            en: 'The previous section used three numbers: 48 / 24 / 8. Which raises a question: what should the next component use? If you decide afresh every time, three things happen:',
          },
        },
        {
          t: 'ol',
          items: [
            { zh: '**决策成本** —— 每写一个新组件都要重新想「这里该留多少」', en: '**Decision cost** — every new component reopens the question “how much room here?”' },
            { zh: '**视觉不一致** —— 16 和 17 的差别肉眼看不出，但两个本该对齐的元素就是差了 1px', en: '**Visual inconsistency** — nobody can see the difference between 16 and 17, yet two elements that should align are off by a pixel' },
            { zh: '**无法沟通** —— 设计师说「这里松一点」，前端不知道该改成 18 还是 20', en: '**No shared language** — the designer says “a bit looser here” and the engineer cannot tell whether that means 18 or 20' },
          ],
        },
        {
          t: 'p',
          text: {
            zh: '标尺解决的正是这个：**把一个连续的决策空间离散化。** 这不是为了好看，是为了让决策变快、变一致、变得可以讨论。',
            en: 'A scale solves exactly this: **it discretises a continuous decision space.** Not for beauty — to make decisions faster, more consistent, and discussable.',
          },
        },

        { t: 'h', text: { zh: '为什么是 8', en: 'Why eight' } },
        {
          t: 'ol',
          items: [
            {
              zh: '**技术**：常见设备像素密度是 1×、1.5×、2×、3×。8 能被 2 整除多次，在 1.5× 屏上 8×1.5 = 12 仍是整数，不产生半像素模糊；而 5px 在 1.5× 下是 7.5px，会触发抗锯齿。',
              en: '**Technical**: common device pixel ratios are 1×, 1.5×, 2×, 3×. Eight halves cleanly, and at 1.5× it becomes 12 — still whole, so no half-pixel blur. Five becomes 7.5 at 1.5× and gets antialiased.',
            },
            {
              zh: '**感知**：韦伯-费希纳定律指出，人对差异的感知是相对的。要让两个间距「明显不同」，比值大约需要 ≥ 1.5。从 8 开始按这个比例增长，正好得到 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 —— **每一档都肉眼可辨，没有一档是浪费的**。',
              en: '**Perceptual**: the Weber–Fechner relation says difference perception is relative. For two gaps to read as clearly different, the ratio needs to be about ≥ 1.5. Growing from 8 at that ratio gives 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 — **every step is visibly distinct, and not one is redundant**.',
            },
          ],
        },
        {
          t: 'p',
          text: {
            zh: '反过来说：**如果你的标尺里同时有 16 和 18，其中一个一定是多余的。** 它们的比值是 1.125，谁也看不出来，却给每个开发者增加了一次无意义的选择。',
            en: 'Put the other way: **if your scale contains both 16 and 18, one of them is redundant.** Their ratio is 1.125 — invisible to everyone, and yet one more meaningless choice for every developer.',
          },
        },

        { t: 'h', text: { zh: '标尺不是等比数列', en: 'A scale is not a geometric series' } },
        {
          t: 'p',
          text: {
            zh: '一个常见误解是「标尺应该严格等比」。实际上好的间距标尺是**混合的**：小端线性（4 的倍数，用于组件内部微调），大端近似几何（×1.5，用于区块之间）。原因很实际 —— 组件内部需要 4px 这种精细档位，而区块之间需要 48 → 96 这种跨度大的档位，强行统一比例会让两端都不好用。',
            en: 'A common misconception is that a scale must be strictly geometric. Good spacing scales are **hybrid**: linear at the small end (multiples of 4, for tuning inside components) and roughly geometric at the large end (×1.5, for separating blocks). The reason is practical — components need fine 4px steps while block separation needs big 48 → 96 jumps; forcing one ratio makes both ends worse.',
          },
        },
        {
          t: 'table',
          head: [
            { zh: '令牌', en: 'Token' },
            { zh: '值', en: 'Value' },
            { zh: '唯一用途', en: 'Its one job' },
          ],
          rows: [
            [{ zh: '`--space-1`', en: '`--space-1`' }, { zh: '4px', en: '4px' }, { zh: '图标与文字之间', en: 'Icon to label' }],
            [{ zh: '`--space-2`', en: '`--space-2`' }, { zh: '8px', en: '8px' }, { zh: '卡片内部：行内元素成组', en: 'Inside a card: grouping inline elements' }],
            [{ zh: '`--space-3`', en: '`--space-3`' }, { zh: '12px', en: '12px' }, { zh: '紧凑控件内边距', en: 'Compact control padding' }],
            [{ zh: '`--space-4`', en: '`--space-4`' }, { zh: '16px', en: '16px' }, { zh: '标准内边距 / 段落间距', en: 'Standard padding, paragraph gap' }],
            [{ zh: '`--space-5`', en: '`--space-5`' }, { zh: '24px', en: '24px' }, { zh: '卡片内边距 / 同级之间 / **基线单位**', en: 'Card padding, sibling gap, **the baseline unit**' }],
            [{ zh: '`--space-6`', en: '`--space-6`' }, { zh: '32px', en: '32px' }, { zh: '子区块之间', en: 'Between sub-blocks' }],
            [{ zh: '`--space-7`', en: '`--space-7`' }, { zh: '48px', en: '48px' }, { zh: '区块之间', en: 'Between blocks' }],
            [{ zh: '`--space-8`', en: '`--space-8`' }, { zh: '64px', en: '64px' }, { zh: '章节之间', en: 'Between sections' }],
            [{ zh: '`--space-9`', en: '`--space-9`' }, { zh: '96px', en: '96px' }, { zh: '页面级留白', en: 'Page-level breathing room' }],
          ],
        },
        {
          t: 'note',
          text: {
            zh: '**「唯一用途」这一列才是标尺的灵魂。** 光有数字不叫系统 —— 一个团队如果对「什么时候用 24、什么时候用 32」没有共识，那么 9 个令牌只会退化成 9 个新的随意选项。本站的 `scripts/check-token-usage.mjs` 会扫描所有 CSS，出现不在这张表里的间距字面量就让 CI 失败。',
            en: '**The “its one job” column is the soul of the scale.** Numbers alone are not a system — if a team has no shared view on when to use 24 versus 32, nine tokens simply become nine new arbitrary options. This site’s `scripts/check-token-usage.mjs` scans every stylesheet and fails CI on any spacing literal that is not in this table.',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：标尺的价值不在于「好看」，而在于**把一次次重复的判断题变成选择题**。选择题只有 9 个选项，而且选错了也不会破坏系统。',
            en: '**One line to take away**: a scale is not about beauty — it turns a repeated open question into a multiple-choice one. Nine options, and picking the wrong one does not break the system.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: '标尺定义（本站 tokens.css 的真实内容）', en: 'The scale (verbatim from this site’s tokens.css)' },
          purpose: {
            zh: '注释里的「唯一用途」不是装饰 —— 它是这套令牌能被团队正确使用的前提。',
            en: 'The “one job” comments are not decoration — they are the precondition for a team using these tokens correctly.',
          },
          code: `:root {
  --space-1: 0.25rem;  /*  4px  图标与文字的间隙 */
  --space-2: 0.5rem;   /*  8px  卡片内部：行内元素成组 */
  --space-3: 0.75rem;  /* 12px  紧凑控件内边距 */
  --space-4: 1rem;     /* 16px  标准控件内边距 / 段落间距 */
  --space-5: 1.5rem;   /* 24px  卡片内边距 / 同级之间（= 基线单位） */
  --space-6: 2rem;     /* 32px  子区块之间 */
  --space-7: 3rem;     /* 48px  区块之间 */
  --space-8: 4rem;     /* 64px  章节之间 */
  --space-9: 6rem;     /* 96px  页面级留白 */
}`,
          key: {
            zh: '**关键点：为什么用 `rem` 而不是 `px`。** 用户在浏览器里把默认字号从 16px 调到 20px 时，`rem` 定义的间距会跟着放大，版面比例保持不变；写死 `px` 的间距不会变，结果是字变大了但呼吸空间没变，页面反而更挤。**这是间距系统里最容易被忽视的可达性问题** —— 第 6.2 节讲 `clamp()` 时会再遇到同一个道理。',
            en: '**Key point: why `rem`, not `px`.** When a user raises the browser’s default font size from 16px to 20px, `rem`-based spacing scales with it and the proportions hold. Hard-coded `px` spacing does not move, so the text grows while the breathing room stays put — and the page gets *more* cramped. **This is the most overlooked accessibility issue in a spacing system** — §6.2 meets the same principle again with `clamp()`.',
          },
        },
        {
          t: 'code',
          lang: 'js',
          file: { zh: '令牌门禁：让规则自动执行', en: 'The token gate: making the rule enforce itself' },
          purpose: { zh: '规范写在文档里会被忘记，写成脚本就不会。这是本站 CI 里真实跑的检查。', en: 'A convention in a document gets forgotten; a convention in a script does not. This check really runs in this site’s CI.' },
          code: `const ALLOWED = new Set(['0', '1px', '2px', '3px', '100%', 'auto']);

for (const [, prop, value] of css.matchAll(SPACING_PROPS)) {
  // 含 var() / calc() / clamp() 的值本就是令牌的组合，跳过
  if (FUNCTIONAL.test(value)) continue;
  for (const token of value.trim().split(/\\s+/)) {
    if (ALLOWED.has(token)) continue;
    if (LITERAL.test(token)) {
      problems.push(\`\${file}: \${prop} 使用了字面量 "\${token}"\`);
    }
  }
}`,
          highlight: [1, 5],
          key: {
            zh: '**关键点**：白名单里放行 `0 / 1px / 2px / 3px` 是刻意的 —— 边框、轮廓、发丝线这些「结构性 1px」不属于间距系统，强行纳入标尺反而荒谬。同理 `em` / `ch` 也不在检查范围内，因为它们是**相对于局部字号**的单位，用 `rem` 的标尺在那里反而是错的。**好的门禁要区分「违反规则」和「规则不适用」** —— 一个动不动误报的检查，团队第二周就会把它关掉。',
            en: '**Key point**: allowing `0 / 1px / 2px / 3px` is deliberate — borders, outlines and hairlines are structural, not spacing, and forcing them onto the scale would be absurd. Likewise `em` and `ch` are out of scope, because they are relative to *local* type size and a `rem`-based scale would be wrong there. **A good gate distinguishes “breaks the rule” from “the rule does not apply”** — a check that cries wolf gets switched off in week two.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '2.3',
      title: { zh: '垂直节奏：让纵向也有秩序', en: 'Vertical Rhythm: Order in the Other Direction' },
      subtitle: {
        zh: '横向的间距有了标尺，纵向的间距也该落在一条隐形的格线上。',
        en: 'Horizontal gaps have a scale; vertical gaps deserve an invisible grid of their own.',
      },
      theory: ['bringhurst', 'muller-brockmann'],
      demo: {
        id: 'rhythm',
        hint: {
          zh: '文本上叠加 24px 基线。拖动行高与段间距，实时显示「落在基线上的行占比」。把字号设 16、行高拖到 1.5 —— 命中率跳到 100%。再切换「margin」与「.stack」两种写法，看外边距合并如何悄悄吃掉你算好的间距。',
          en: 'A 24px baseline is overlaid on the text. Drag the leading and paragraph gap and watch the share of lines that land on it. Set the size to 16 and the leading to 1.5 — the hit rate jumps to 100%. Then switch between the `margin` and `.stack` techniques to see margin collapse quietly eat the gap you computed.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '标尺管住了大小，管不住位置', en: 'The scale fixes the sizes, not the positions' } },
        {
          t: 'p',
          text: {
            zh: '上一节的标尺解决了「间距该取多大」。但它没解决另一半问题：**这些间距落在哪里。**',
            en: 'The previous section settled how large a gap should be. It left the other half open: **where those gaps land.**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '举个例子：两个区块之间都用了 48px，取值完全合规。但如果第一个区块的标题行高是 1.2、第二个是 1.45，两块内容的文字就落在互不相干的位置上 —— 标尺管住了「隔多远」，却管不住「站在哪」。把页面截图叠起来看，你会看到一堆彼此错开几像素的横线。',
            en: 'An example: two blocks are both separated by 48px, perfectly compliant. But if the first block’s heading has a line-height of 1.2 and the second’s has 1.45, the text in the two blocks lands on unrelated positions — the scale governs “how far apart”, not “where”. Overlay screenshots of the page and you see a swarm of horizontal lines each off by a few pixels.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '解决这件事的办法叫**垂直节奏**，它的思想来自铅字时代的**行距（leading）** —— 字行之间垫的铅条厚度。整页所有文字的行距一致，视线纵向移动就有稳定的节拍。这与横向的间距标尺是同一件事，只是换了个方向。',
            en: 'Vertical rhythm comes from the metal-type notion of **leading** — the lead strips slotted between lines. When every line on the page sits on the same interval, the eye moves down at a steady beat. It is the same idea as the horizontal spacing scale, rotated ninety degrees.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '在 Web 上，它的可操作定义是：**页面上所有的垂直间距，都是基线单位的整数倍。** 本站的基线单位是 24px（= `--space-5`），所以：',
            en: 'On the web its operational definition is: **every vertical distance on the page is an integer multiple of the baseline unit.** This site’s unit is 24px (= `--space-5`), so:',
          },
        },
        {
          t: 'ul',
          items: [
            { zh: '正文行高 = 16 × 1.5 = 24px ＝ 1 个基线单位', en: 'Body line height = 16 × 1.5 = 24px = one unit' },
            { zh: '段落间距 = 16px？**不行**，改成 24px（1 单位）或 48px（2 单位）', en: 'Paragraph gap of 16px? **No** — make it 24px (1 unit) or 48px (2 units)' },
            { zh: '标题上方留白 = 48px（2 单位），下方 = 12px（半单位，允许）', en: 'Space above a heading = 48px (2 units), below = 12px (a half unit, permitted)' },
          ],
        },
        {
          t: 'note',
          text: {
            zh: '**半单位是允许的，四分之一单位不是。** 12px（半个 24）在视觉上仍然与基线同步（每两行对齐一次）；6px 就彻底脱节了。这条经验规则让节奏系统在「严格」与「可用」之间取得平衡 —— 完全严格的基线网格在 Web 上做不到，因为图片、图表、表单控件的高度不受你控制。',
            en: '**Half units are allowed; quarter units are not.** 12px (half of 24) still syncs with the baseline — it re-aligns every second line. Six pixels loses the beat entirely. This rule of thumb keeps the system between “strict” and “usable”: a truly strict baseline grid is unachievable on the web, because images, charts and form controls have heights you do not control.',
          },
        },

        { t: 'h', text: { zh: '外边距合并：节奏的隐形杀手', en: 'Margin collapse: the invisible rhythm killer' } },
        {
          t: 'p',
          text: {
            zh: '你精心设计了「段落下 24px、标题上 48px」，结果两者相邻时实际间距是 **48px 而不是 72px** —— 因为相邻的垂直外边距会合并，取较大值（第 1.1 节讲过的情形 ①）。这个行为本身是好的（防止双倍留白），但如果你不知道它存在，就会看到「明明算好了却对不上」。',
            en: 'You carefully specify 24px below paragraphs and 48px above headings, then find that adjacent pair renders at **48px, not 72px** — adjacent vertical margins collapse to the larger of the two (case ① from §1.1). The behaviour is helpful (it prevents doubled gaps), but if you do not know it exists you get “I did the maths and it still does not line up”.',
          },
        },
        {
          t: 'p',
          text: {
            zh: '本站的解决办法是**根本不用 `margin` 表达节奏**，改用相邻兄弟选择器。它有三个好处：① 不会合并，算多少就是多少；② 最后一个元素不会多出外边距，容器边界干净；③ 节奏值集中在一个变量里，改一次全局生效。',
            en: 'This site’s answer is to **not express rhythm with `margin` at all**, using the adjacent-sibling selector instead. Three benefits: ① nothing collapses, so the number you write is the number you get; ② the last child gets no trailing margin, so container edges stay clean; ③ the rhythm value lives in one variable and changes globally.',
          },
        },
        {
          t: 'key',
          text: {
            zh: '**本节要带走的一句话**：垂直间距不该是「元素的属性」，而该是「元素之间关系的属性」。`margin-bottom: 24px` 把间距绑在了元素上；`.stack` 把间距绑在了**关系**上 —— 后者才是它真正所属的地方。',
            en: '**One line to take away**: vertical spacing is not a property of an element, it is a property of the *relationship between* elements. `margin-bottom: 24px` attaches the gap to the element; `.stack` attaches it to the **relationship** — which is where it actually belongs.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'Stack 原语：本站全部垂直节奏的来源', en: 'The Stack primitive: the source of all vertical rhythm here' },
          purpose: { zh: '一行 CSS，取代整个项目里所有的 `margin-bottom`。', en: 'One line of CSS replacing every `margin-bottom` in the project.' },
          code: `.stack > * + * {
  margin-block-start: var(--flow, var(--space-4));
}

/* 用法：局部改节奏只要改变量，不用改选择器 */
.article { --flow: var(--space-5); }   /* 24px */
.tight   { --flow: var(--space-2); }   /*  8px */`,
          highlight: [2],
          key: {
            zh: '**关键点：`> * + *` 读作「有前一个兄弟的每一个子元素」。** 它精确表达了「只在元素之间加间距」这个意图 —— 第一个子元素不匹配（没有前驱），所以容器顶部不会多出空白。对比 `> * { margin-bottom }`：最后一个元素会在容器底部留下一段无法解释的空隙，这是卡片布局里最常见的「下面为什么多了一截」。',
            en: '**Key point: read `> * + *` as “every child that has a preceding sibling”.** It states exactly the intent “space *between* elements” — the first child does not match (no predecessor), so no stray gap appears at the top. Compare `> * { margin-bottom }`: the last child leaves an unexplained gap at the bottom of the container — the classic “why is there extra space down here?” in card layouts.',
          },
        },
        {
          t: 'code',
          lang: 'css',
          file: { zh: '让行高落在基线上', en: 'Snapping line height to the baseline' },
          purpose: { zh: '行高用无单位值，配合基线单位反推字号，让节奏自动成立。', en: 'Use a unitless line height, then derive the type size from the baseline so rhythm holds automatically.' },
          code: `:root {
  --rhythm: 1.5rem;          /* 基线单位 = 24px */
  --leading-body: 1.7;       /* 中文正文需要比英文更大的行距 */
}

.prose {
  font-size: var(--step-0);          /* ≈ 16px */
  line-height: var(--leading-body);  /* 无单位：随字号缩放 */
}

/* 标题：行高压紧，但上下留白仍是基线的整数倍 */
.prose h3 {
  line-height: var(--leading-tight);             /* 1.25 */
  margin-block-start: calc(var(--rhythm) * 2);   /* 48px */
  margin-block-end: calc(var(--rhythm) * 0.5);   /* 12px（半单位，允许） */
}`,
          highlight: [8, 14, 15],
          key: {
            zh: '**关键点：`line-height` 必须写无单位值。** 写 `line-height: 24px` 时，子元素会**继承这个计算后的 24px**；于是一个 32px 的标题也只有 24px 行高，字会叠在一起。写 `line-height: 1.7` 时，继承的是**比例**，每个元素用自己的字号去乘 —— 这几乎总是你想要的。',
            en: '**Key point: `line-height` must be unitless.** With `line-height: 24px`, children inherit the **computed 24px**, so a 32px heading also gets 24px of leading and the lines overlap. With `line-height: 1.7`, children inherit the **ratio** and multiply it by their own size — which is almost always what you want.',
          },
          pitfall: {
            zh: '`--leading-body: 1.7` 对中文是必要的，对英文偏松。如果你的站点是纯英文，1.5–1.6 更合适。中文字形的**视觉密度**高于拉丁字母（笔画填满字面框），同样的行距下感觉更挤，所以需要更大的值。这是中英混排站点必须单独考虑的一点。',
            en: '`--leading-body: 1.7` is necessary for Chinese and slightly loose for English. A purely English site is better at 1.5–1.6. Han glyphs have higher **visual density** than Latin letters (strokes fill the em box), so the same leading feels tighter and needs a larger value. Bilingual sites must decide this deliberately.',
          },
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════ */
    {
      id: '2.4',
      title: { zh: '案例：给页面分组', en: 'Case: Grouping the Page' },
      subtitle: {
        zh: 'stage1 → stage2。一条线都没画。',
        en: 'stage1 → stage2. Not a single line drawn.',
      },
      theory: ['gestalt', 'muller-brockmann', 'bringhurst'],
      caseStage: 'stage2',
      demo: {
        id: 'case-s2',
        hint: {
          zh: '对比 stage1 与 stage2，然后回答开头那个问题：筛选器管的是哪些内容？现在你能一眼看出来 —— 而这一层没有画任何边框、没有加任何分隔线。',
          en: 'Compare stage1 with stage2, then answer the question from the start of the chapter: which content do the filters control? You can see it at a glance now — and this layer drew no borders and added no rules.',
        },
      },
      explain: [
        { t: 'h', text: { zh: '这一层做了什么', en: 'What this layer did' } },
        {
          t: 'p',
          text: {
            zh: '这一章从一个具体的困惑出发：为什么 stage1 的看板「读不出哪些东西是一伙的」。答案是间距，而且**只**是间距 —— 下面这四处改动里，没有一条边框、没有一条分隔线。',
            en: 'This chapter started from one concrete confusion: why stage1’s dashboard gives no clue about what belongs with what. The answer was spacing, and **only** spacing — the four changes below contain no borders and no rules.',
          },
        },
        {
          t: 'ol',
          items: [
            { zh: '三级间距：区块之间 48px、同级之间 24px、卡片内部 8px，相邻比值 ≥ 2（2.1 + 2.2）', en: 'Three levels of gap: 48px between blocks, 24px between siblings, 8px inside a card, each adjacent pair at a ratio ≥ 2 (§2.1 + §2.2)' },
            { zh: '筛选区与图表区拉开一整级 —— 开头那个「答不出来」的问题消失了（2.1）', en: 'Filters and charts are separated by a full step — the unanswerable question from the start is gone (§2.1)' },
            { zh: '卡片用面色而不是边框表达共同区域，零条线达成分组（2.1）', en: 'Cards express common region with a surface tint rather than borders — grouping with zero lines (§2.1)' },
            { zh: '所有垂直间距落在 24px 基线的整数倍或半倍上（2.3）', en: 'Every vertical gap lands on a whole or half multiple of the 24px baseline (§2.3)' },
          ],
        },

        { t: 'h', text: { zh: '分组比：从 1.0 到 2.0', en: 'Grouping ratio: from 1.0 to 2.0' } },
        {
          t: 'p',
          text: {
            zh: '这一层负责的指标是**分组比** = 组间间距 ÷ 组内间距。stage1 是 1.0（所有间距都一样，等于没有分组），stage2 是 2.0（48 ÷ 24）。**跨过 1.5 这条线，分组就从「读不出来」变成「不会误判」。**',
            en: 'The metric this layer owns is the **grouping ratio** = between-group gap ÷ within-group gap. stage1 sits at 1.0 (all gaps equal, which is no grouping at all); stage2 reaches 2.0 (48 ÷ 24). **Crossing 1.5 takes the grouping from “cannot be read” to “cannot be misread”.**',
          },
        },
        {
          t: 'p',
          text: {
            zh: '同时，「取值种类数」这一项反而从 4 涨到了 7 —— **这一层让页面上的不同数值变多了**。这不是退步：我们引入了三级间距，自然需要三个数。真正的收敛要等下一层的标尺。**指标之间存在这种短期的此消彼长，是分层建造必然会遇到的现象** —— 重要的是每一层都清楚自己在换什么。',
            en: 'At the same time, “distinct values” rises from 4 to 7 — **this layer increased the number of different values on the page**. That is not a regression: introducing three levels of gap naturally needs three numbers. Real convergence waits for the next layer’s scale. **This kind of short-term trade between metrics is inherent to building in layers** — what matters is that each layer knows what it is trading.',
          },
        },

        { t: 'h', text: { zh: '下一层要解决什么', en: 'What the next layer solves' } },
        {
          t: 'p',
          text: {
            zh: '现在页面有结构了，但还有一个问题没人回答：**那些卡片为什么是那么宽？** 它们的宽度目前是 `flex: 1 1 8rem` 的结果 —— 能用，但说不出理由。「8rem」是哪来的？换个容器还对吗？',
            en: 'The page has structure now, but one question remains unanswered: **why are those cards that wide?** Their width currently comes from `flex: 1 1 8rem` — it works, but there is no reason behind it. Where did “8rem” come from? Will it still be right in a different container?',
          },
        },
        {
          t: 'p',
          text: {
            zh: '第 3 层要做的就是让**每一个尺寸都能被解释**。',
            en: 'Layer three exists to make **every size explicable**.',
          },
        },
      ],
      code: [
        {
          t: 'code',
          lang: 'css',
          file: { zh: 'stage1 → stage2 完整 diff', en: 'The complete stage1 → stage2 diff' },
          purpose: { zh: '同样是纯粹的「加」。注意没有任何一条 `border`。', en: 'Again, purely additive. Note there is not a single `border`.' },
          code: `/* ─────────── 新增（全部） ─────────── */
+ .dash {
+   display: grid;
+   gap: var(--space-7);          /* 48px 区块之间 */
+   padding: var(--space-5);
+ }
+ .dash__kpis {
+   display: flex; flex-wrap: wrap;
+   gap: var(--space-5);          /* 24px 同级之间 */
+ }
+ .kpi {
+   display: grid;
+   gap: var(--space-2);          /* 8px 卡片内部 */
+   padding: var(--space-3);
+   background: var(--surface-1); /* 共同区域：用面，不用线 */
+   border-radius: var(--radius-sm);
+ }
+ .dash__trend,
+ .dash__breakdown,
+ .dash__table {
+   display: grid;
+   gap: var(--space-3);
+   padding: var(--space-4);
+   background: var(--surface-1);
+ }`,
          highlight: [4, 9, 13, 15],
          key: {
            zh: '**关键点：这份 diff 里出现了 `display: flex` 和 `display: grid`，但它们不是这一层的主角。** 它们只是「能设 `gap`」的载体 —— 真正做事的是那三个 `gap` 值。第 4 层才会认真讨论「什么时候该用哪个引擎」。**在此之前，把 Flex/Grid 当成一个可以设间距的容器就够了** —— 这也是大多数人真实的学习路径。',
            en: '**Key point: this diff introduces `display: flex` and `display: grid`, but they are not what this layer is about.** They are merely the vehicles that let you set `gap` — the work is done by those three gap values. Layer four is where “which engine, and when” gets a serious answer. **Until then, treating Flex and Grid as “a container that can have gaps” is enough** — which is also how most people actually learn them.',
          },
        },
      ],
    },
  ],
};
