<script lang="ts">
  /**
   * 门户主展台：一张「正在被建造的纸」 + 右侧一条操作栏。
   *
   * 为什么是纸：这门课的案例本来就**是一张页面**。把它画成一张带折角、
   * 带装订线、微微倾斜的纸，比画成一块面板更贴题 —— 读者手里推的滑块，
   * 推的是这张纸上的排版规则。形式和内容在这里是同一件事。
   *
   * 选中第 N 层，纸上同步三件事：
   *   ① 色调 `--tone` 换成该章的章节色（装订线、编号、便签全部跟着变）
   *   ② 标题与说明换成该层的内容
   *   ③ p5 画布按「叠到第 N 层」的规则重排同一批方块
   *
   * 第 ③ 条是重点：首页说「顺序不能颠倒」，这块画布让你自己推着看。
   * 画布只在滚动到可视区时才下载 p5，`prefers-reduced-motion` 下完全不加载
   * （见 ADR-0004），退化成静态说明 —— 纸上的文字信息一条不少。
   */
  import P5Canvas from '@/components/decor/P5Canvas.svelte';

  interface Item {
    order: number;
    layerName: string;
    title: string;
    subtitle: string;
    adds: string;
    sections: number;
    accentVar: string;
    href: string;
    /** 本层推动的指标：名称 + 起止值 */
    moves: { name: string; from: string; to: string; unit: string }[];
  }

  /** 七个阶段的叙述文本（来自 case.ts，由门户页在构建期取好传入） */
  interface Stage {
    id: string;
    name: string;
    headline: string;
    changes: string[];
  }

  let {
    items,
    stageInfo = [],
    locale = 'zh',
  }: { items: Item[]; stageInfo?: Stage[]; locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      docTitle: '贯穿案例 · NeoCampus 新生数据看板',
      raw: '素材',
      rawVerb: '还没有布局',
      rawTitle: '一份只有内容、没有任何布局 CSS 的页面',
      rawAdds: '什么都没有 —— 只有内容与浏览器默认样式',
      rawMoves: '还没有可推动的指标：先得有东西可量',
      layerWord: '第 {n} 层',
      adds: '本层加上',
      changes: '具体改动',
      moves: '本层推动',
      canvas: '规则的结果',
      sections: '小节',
      go: '读这一章',
      slider: '叠到第几层',
      pick: '选择一层',
      callTitle: '建议从这里开始',
      callBody: '把滑块从 0 推到 6。方块始终是同一批，变的只有规则 —— 这正是这门课要说的全部。',
      note: '不是六个并列的主题，而是六层依次叠上去的能力。',
      stage: '阶段',
    },
    en: {
      docTitle: 'The running case · NeoCampus Freshman Dashboard',
      raw: 'Raw material',
      rawVerb: 'no layout yet',
      rawTitle: 'A page with content and not one line of layout CSS',
      rawAdds: 'Nothing — only content and the browser’s defaults',
      rawMoves: 'No metric to move yet — there has to be something to measure first',
      layerWord: 'Layer {n}',
      adds: 'Adds',
      changes: 'The concrete changes',
      moves: 'Moves',
      canvas: 'What the rules produce',
      sections: 'sections',
      go: 'Read this chapter',
      slider: 'Layers applied',
      pick: 'Pick a layer',
      callTitle: 'Start here',
      callBody: 'Push the slider from 0 to 6. The blocks never change — only the rules do, which is the whole argument of this course.',
      note: 'Not six parallel topics, but six layers stacked in order.',
      stage: 'Stage',
    },
  }[locale]);

  let n = $state(0);
  const active = $derived(items.find((i) => i.order === n) ?? null);
  const tone = $derived(active ? `var(${active.accentVar})` : 'var(--ink-3)');
  /** 标题里冒号前是层名，纸上已有编号，只留冒号后的那半句 */
  const chapterLine = $derived(
    active ? active.title.split(/[：:]/).slice(1).join('：') || active.title : T.rawTitle,
  );
  /** 当前阶段的叙述。这才是纸上真正该占最大字号的那句话 ——
   *  它说的是「页面现在是什么样」，而不是「这一章叫什么」。 */
  const stage = $derived(stageInfo[n] ?? null);
</script>

<div class="lb" style={`--tone: ${tone}`}>
  <!-- ══ 左：纸 ══════════════════════════════════════════════════════ -->
  <article class="lb__sheet">
    <!-- 折角。用两个三角叠出来：一个吃掉纸角，一个画翻起来的背面 -->
    <span class="lb__fold" aria-hidden="true"></span>

    <header class="lb__sheet-head">
      <span>{T.docTitle}</span>
      <span class="lb__sheet-no">{T.stage} {n} / 6</span>
    </header>

    <!-- 眉批：第几层 · 层名。小字，只负责定位 -->
    <p class="lb__verb">
      {n === 0 ? T.rawVerb : T.layerWord.replace('{n}', String(n))}
      {#if active}<span class="lb__verb-sep">·</span>{active.layerName}{/if}
    </p>

    <!-- 大字是**阶段的状态**，不是章节名。
         「文字终于可以舒服地读了」比「内容层」有信息量得多 ——
         前者说的是页面现在什么样，后者只是一个分类标签。 -->
    <h3 class="lb__headline">{stage ? stage.headline : T.rawTitle}</h3>
    <!-- stage0 不渲染副题：大标题已经把「它不是写坏了，是还没有布局」说过了，
         再重复一遍是把同一句话说两次，不是补充。 -->
    {#if active}<p class="lb__desc">{active.subtitle}</p>{/if}

    <dl class="lb__entries">
      <div class="lb__entry">
        <dt><span class="lb__entry-no">01</span>{T.adds}</dt>
        <dd class="lb__adds-line">{active ? active.adds : T.rawAdds}</dd>
      </div>

      <!-- 具体改动：case.ts 里每个阶段都写了三到四条，之前一条都没显示。
           这是这张纸上最有实质内容的部分。 -->
      <div class="lb__entry">
        <dt><span class="lb__entry-no">02</span>{T.changes}</dt>
        <dd>
          <ul class="lb__changes">
            {#each stage?.changes ?? [] as c (c)}
              <li>{c}</li>
            {/each}
          </ul>
        </dd>
      </div>

      <div class="lb__entry">
        <dt><span class="lb__entry-no">03</span>{T.moves}</dt>
        <dd>
          {#if active}
            {#each active.moves as m (m.name)}
              <span class="lb__metric">
                {m.name}
                <b>{m.from}{m.unit} → {m.to}{m.unit}</b>
              </span>
            {/each}
          {:else}
            <span class="lb__metric">{T.rawMoves}</span>
          {/if}
        </dd>
      </div>

      <div class="lb__entry">
        <dt><span class="lb__entry-no">04</span>{T.canvas}</dt>
        <dd>
          <div class="lb__canvas" data-layers={n}>
            <P5Canvas sketch="layerBuild" accentVar="--accent" fallback="hatch" fallbackHeight={220} />
          </div>
          {#if active}<p class="lb__cap">{chapterLine}</p>{/if}
        </dd>
      </div>
    </dl>

    <!-- 页脚步骤条：七个阶段，走到哪里一目了然 -->
    <footer class="lb__steps">
      {#each Array(7) as _, i (i)}
        <button
          class="lb__step"
          type="button"
          aria-label={`${T.stage} ${i}`}
          aria-current={i === n ? 'step' : undefined}
          style={`--step-tone: ${i === 0 ? 'var(--ink-4)' : `var(${items[i - 1]?.accentVar ?? '--accent'})`}`}
          onclick={() => (n = i)}
        >
          <i></i>
          <em>{stageInfo[i]?.id ?? `S${i}`}</em>
          <small>{stageInfo[i]?.name ?? ''}</small>
        </button>
      {/each}
    </footer>
  </article>

  <!-- ══ 右：操作栏 ══════════════════════════════════════════════════ -->
  <aside class="lb__rail">
    <p class="lb__rail-note">{T.note}</p>

    <ol class="lb__index" aria-label={T.pick}>
      <li>
        <button class="lb__row" type="button" aria-current={n === 0 ? 'true' : undefined} style="--row: var(--ink-3)" onclick={() => (n = 0)}>
          <span class="lb__n">00</span>
          <span class="lb__copy"><strong>{T.raw}</strong><small>{T.rawVerb}</small></span>
        </button>
      </li>
      {#each items as item (item.order)}
        <li>
          <button
            class="lb__row"
            type="button"
            aria-current={n === item.order ? 'true' : undefined}
            style={`--row: var(${item.accentVar})`}
            onclick={() => (n = item.order)}
          >
            <span class="lb__n">0{item.order}</span>
            <span class="lb__copy">
              <strong>{item.layerName}</strong>
              <small>{item.sections} {T.sections}</small>
            </span>
          </button>
        </li>
      {/each}
    </ol>

    <label class="lb__slider" for="lb-range">
      <span class="lb__slider-label">
        {T.slider}
        <output for="lb-range">{n} / 6</output>
      </span>
      <input id="lb-range" type="range" min="0" max="6" step="1" bind:value={n} />
    </label>

    <!-- 便签：图一那张卡里的黄色贴纸。它承担「从哪儿下手」这一句， -->
    <!-- 把入口从一堆同级选项里单独拎出来。 -->
    <div class="lb__callout">
      <strong>{T.callTitle}</strong>
      <p>{T.callBody}</p>
    </div>

    {#if active}
      <a class="btn btn--primary lb__go" href={active.href}>{T.go} ↗</a>
    {/if}
  </aside>
</div>

<style>
  /* ── 外框：柔色面板 ──────────────────────────────────────────────────
     不是白底卡片，而是一层按 --tone 轻微染色的渐变面 —— 纸压在它上面，
     两者的明度差就是「纸浮起来了」的全部来源（§5.4：亮度差在任何主题下都成立，
     阴影不是）。 */
  .lb {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.34fr);
    gap: clamp(var(--space-5), 3vw, var(--space-7));
    align-items: start;
    padding: clamp(var(--space-5), 3vw, var(--space-8));
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius-2xl);
    background: linear-gradient(
      145deg,
      color-mix(in srgb, var(--tone) 9%, var(--surface-2)),
      var(--surface-2)
    );
    transition: background var(--motion-base);
  }
  @media (max-width: 64rem) {
    .lb { grid-template-columns: minmax(0, 1fr); }
  }

  /* ── 纸 ─────────────────────────────────────────────────────────────
     四件事让它读起来像纸而不是卡片：
       ① 暖白底（不是纯白，纯白在浅灰面板上不成立）
       ② 左侧一条装订线，位置固定在 --gutter
       ③ 右上折角
       ④ 半度的倾斜 —— 只有半度，多一点就成了「贴歪了」 */
  .lb__sheet {
    --gutter: clamp(2.5rem, 5vw, 4rem);
    position: relative;
    display: grid;
    align-content: start;
    gap: var(--space-4);
    padding: var(--space-6) var(--space-6) var(--space-5) var(--gutter);
    border-radius: var(--radius-lg);
    background:
      /* ② 装订线：一条竖线钉在 --gutter 前一点 */
      linear-gradient(
          to right,
          transparent calc(var(--gutter) - var(--space-4)),
          color-mix(in srgb, var(--tone) 34%, transparent) calc(var(--gutter) - var(--space-4)),
          color-mix(in srgb, var(--tone) 34%, transparent) calc(var(--gutter) - var(--space-4) + 1px),
          transparent calc(var(--gutter) - var(--space-4) + 1px)
        )
        no-repeat,
      /* ① 暖白纸面 */
      linear-gradient(160deg, var(--paper-1), var(--paper-2));
    box-shadow:
      0 1px 0 rgb(255 255 255 / 0.5) inset,
      var(--elevation-float);
    rotate: -0.4deg; /* ④ */
    /* 折角靠 clip-path 切掉右上，背面由 .lb__fold 画 */
    clip-path: polygon(0 0, calc(100% - 2.2rem) 0, 100% 2.2rem, 100% 100%, 0 100%);
  }
  .lb {
    --paper-1: #fffdf7;
    --paper-2: #f7f3e9;
    --paper-ink: #2a2a28;
    --paper-ink-2: #5d5b55;
    --paper-line: #e4dfd1;
  }
  /* 暗色下纸不能是白的（一张白纸在暗页面上是刺眼的光源），
     改成「被灯照着的深色纸」：暖调深灰 + 更高的文字亮度。 */
  :global([data-theme='dark']) .lb {
    --paper-1: #1e1f24;
    --paper-2: #17181c;
    --paper-ink: #edeae2;
    --paper-ink-2: #a8a49a;
    --paper-line: #33343a;
  }

  /* 折角的「背面」：一个深一点的三角，贴在被切掉的那个角上 */
  .lb__fold {
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    inline-size: 2.2rem;
    block-size: 2.2rem;
    background: linear-gradient(225deg, color-mix(in srgb, var(--paper-line) 85%, var(--tone)), var(--paper-2));
    clip-path: polygon(0 0, 100% 100%, 0 100%);
    pointer-events: none;
  }

  .lb__sheet-head {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--space-3);
    padding-block-end: var(--space-3);
    border-block-end: var(--hairline) solid var(--paper-line);
    color: var(--paper-ink-2);
    font-family: var(--font-mono);
    font-size: var(--step--2);
    letter-spacing: 0.04em;
  }
  .lb__sheet-no { color: var(--tone); font-weight: 700; }

  .lb__verb {
    color: var(--tone);
    font-size: var(--step--2);
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .lb__verb-sep { margin-inline: var(--space-2); opacity: 0.5; }

  /* 改动清单：用短横而不是圆点 —— 这是一份工程清单，不是要点提示 */
  .lb__changes {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-2);
  }
  .lb__changes li {
    position: relative;
    padding-inline-start: var(--space-4);
    color: var(--paper-ink);
    font-size: var(--step--1);
    line-height: 1.7;
  }
  .lb__changes li::before {
    content: '';
    position: absolute;
    inset-block-start: 0.72em;
    inset-inline-start: 0;
    inline-size: var(--space-3);
    block-size: 1px;
    background: color-mix(in srgb, var(--tone) 60%, transparent);
  }

  /* 画布图注：把章节标题放在图下面，像一张插图的说明 */
  .lb__cap {
    margin-block-start: var(--space-2);
    color: var(--paper-ink-2);
    font-size: var(--step--2);
    font-style: italic;
  }

  /* 它是一**句话**而不是一个标题，所以比章节标题低一档、行距放宽。
     照着标题的排法排一整句，读起来会像在喊。 */
  .lb__headline {
    max-inline-size: 26ch;
    color: var(--paper-ink);
    font-size: var(--step-3);
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.25;
    text-wrap: balance;
  }
  .lb__desc {
    max-inline-size: 46ch;
    color: var(--paper-ink-2);
    font-size: var(--step--1);
    line-height: 1.75;
  }

  /* ── 纸上的编号条目 ───────────────────────────────────────────────── */
  .lb__entries {
    display: grid;
    gap: var(--space-4);
    margin: var(--space-2) 0 0;
    padding-block-start: var(--space-4);
    border-block-start: var(--hairline) solid var(--paper-line);
  }
  .lb__entry dt {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    color: var(--paper-ink-2);
    font-size: var(--step--2);
    font-weight: 700;
    letter-spacing: 0.06em;
  }
  .lb__entry-no {
    display: inline-grid;
    place-items: center;
    inline-size: 22px;
    block-size: 22px;
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    color: var(--tone);
    font-family: var(--font-mono);
    font-weight: 700;
  }
  .lb__entry dd {
    margin: var(--space-2) 0 0;
    padding-inline-start: calc(22px + var(--space-3));
    color: var(--paper-ink);
    font-size: var(--step--1);
    line-height: 1.7;
  }
  .lb__metric {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-2);
    margin-inline-end: var(--space-2);
    padding: 2px var(--space-3);
    border: var(--hairline) solid var(--paper-line);
    border-radius: var(--radius-pill);
    font-size: var(--step--2);
    color: var(--paper-ink-2);
  }
  .lb__metric b {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    color: var(--good);
  }

  /* 画布嵌在纸上，像一张贴上去的图 */
  .lb__canvas {
    position: relative;
    aspect-ratio: 2.4;
    min-block-size: 10rem;
    border: var(--hairline) solid var(--paper-line);
    border-radius: var(--radius);
    background:
      repeating-linear-gradient(to right, color-mix(in srgb, var(--paper-line) 60%, transparent) 0 1px, transparent 1px 24px),
      repeating-linear-gradient(to bottom, color-mix(in srgb, var(--paper-line) 60%, transparent) 0 1px, transparent 1px 24px),
      var(--paper-1);
    overflow: hidden;
  }

  /* ── 纸脚的步骤条 ─────────────────────────────────────────────────── */
  .lb__steps {
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
    margin-block-start: var(--space-3);
    padding-block-start: var(--space-4);
    border-block-start: var(--hairline) solid var(--paper-line);
  }
  .lb__step {
    appearance: none;
    flex: 1 1 0;
    display: grid;
    justify-items: center;
    gap: var(--space-1);
    padding: var(--space-1) 0;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--paper-ink-2);
    cursor: pointer;
  }
  .lb__step i {
    inline-size: 100%;
    block-size: 3px;
    border-radius: var(--radius-pill);
    background: var(--paper-line);
    transition: background var(--motion-base);
  }
  .lb__step em {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-style: normal;
    opacity: 0.55;
  }
  /* 阶段名：窄屏下它会先被牺牲掉（编号还在，信息不丢） */
  .lb__step small {
    font-size: var(--step--2);
    color: var(--paper-ink-2);
    white-space: nowrap;
    opacity: 0.75;
  }
  .lb__step[aria-current='step'] small { opacity: 1; color: var(--paper-ink); font-weight: 650; }
  @media (max-width: 60rem) {
    .lb__step small { display: none; }
  }
  /* 走过的段落染上那一层的颜色，当前之后的保持灰 —— 步骤条同时是进度条。
     只要两条规则：默认全染色，再用后继兄弟选择器把「还没走到」的刷回灰。
     （先写了四条互相覆盖的，那是把一个次序问题当成了四个特例。） */
  .lb__step i { background: var(--step-tone); }
  .lb__step[aria-current='step'] ~ .lb__step i { background: var(--paper-line); }
  .lb__step[aria-current='step'] em { opacity: 1; font-weight: 700; color: var(--tone); }
  .lb__step:hover i { outline: 2px solid color-mix(in srgb, var(--step-tone) 45%, transparent); }

  /* ── 右侧操作栏 ───────────────────────────────────────────────────── */
  .lb__rail {
    display: grid;
    align-content: start;
    gap: var(--space-4);
  }
  .lb__rail-note {
    padding-inline-start: var(--space-4);
    border-inline-start: 2px solid color-mix(in srgb, var(--tone) 55%, transparent);
    color: var(--ink-2);
    font-size: var(--step--1);
    line-height: 1.7;
  }

  .lb__index {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 2px;
  }
  .lb__row {
    appearance: none;
    inline-size: 100%;
    display: grid;
    grid-template-columns: 1.75rem minmax(0, 1fr);
    gap: var(--space-3);
    align-items: center;
    padding: var(--space-2) var(--space-3);
    border: var(--hairline) solid transparent;
    border-radius: var(--radius);
    background: transparent;
    color: var(--ink-3);
    text-align: start;
    cursor: pointer;
    transition: background var(--motion-fast), border-color var(--motion-fast);
  }
  .lb__row:hover { background: var(--surface-1); }
  .lb__row[aria-current='true'] {
    background: var(--surface-1);
    border-color: color-mix(in srgb, var(--row) 45%, transparent);
    color: var(--ink-1);
  }
  .lb__n {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 800;
    color: var(--ink-4);
    font-variant-numeric: tabular-nums;
  }
  .lb__row[aria-current='true'] .lb__n { color: var(--row); }
  .lb__copy { display: grid; min-inline-size: 0; }
  .lb__copy strong { font-size: var(--step--1); font-weight: 650; }
  .lb__copy small { font-size: var(--step--2); color: var(--ink-4); }

  .lb__slider { display: grid; gap: var(--space-2); }
  .lb__slider-label {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-3);
    color: var(--ink-3);
    font-size: var(--step--2);
    font-weight: 700;
    letter-spacing: 0.06em;
  }
  .lb__slider output {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    color: var(--tone);
    font-weight: 700;
  }
  .lb__slider input[type='range'] {
    --track-h: 6px;
    --thumb-d: 20px;
    appearance: none;
    inline-size: 100%;
    block-size: 24px;
    background: transparent;
    cursor: grab;
  }
  .lb__slider input[type='range']:active { cursor: grabbing; }
  .lb__slider input[type='range']::-webkit-slider-runnable-track {
    block-size: var(--track-h);
    border-radius: var(--radius-pill);
    background: var(--line-1);
  }
  .lb__slider input[type='range']::-moz-range-track {
    block-size: var(--track-h);
    border-radius: var(--radius-pill);
    background: var(--line-1);
  }
  .lb__slider input[type='range']::-webkit-slider-thumb {
    appearance: none;
    inline-size: var(--thumb-d);
    block-size: var(--thumb-d);
    margin-block-start: calc((var(--track-h) - var(--thumb-d)) / 2);
    border-radius: var(--radius-pill);
    background: var(--tone);
    border: 3px solid var(--surface-1);
    box-shadow: var(--elevation-2);
  }
  .lb__slider input[type='range']::-moz-range-thumb {
    inline-size: var(--thumb-d);
    block-size: var(--thumb-d);
    border-radius: var(--radius-pill);
    background: var(--tone);
    border: 3px solid var(--surface-1);
    box-shadow: var(--elevation-2);
  }

  /* 便签：图一那张黄色贴纸。它是这一块里唯一的暖色，
     所以读者的视线一定会先落在它上面 —— 而它说的正是「从哪儿下手」。 */
  .lb__callout {
    padding: var(--space-4);
    border-radius: var(--radius);
    border: var(--hairline) solid color-mix(in srgb, var(--warn) 34%, transparent);
    background: var(--warn-wash);
    /* 便签的右下角微微翘起 */
    box-shadow: var(--elevation-1);
    rotate: 0.5deg;
  }
  .lb__callout strong {
    display: block;
    color: var(--ink-1);
    font-size: var(--step--1);
  }
  .lb__callout p {
    margin-block-start: var(--space-2);
    color: var(--ink-2);
    font-size: var(--step--2);
    line-height: 1.7;
  }

  .lb__go { justify-self: start; }

  @media (max-width: 48rem) {
    .lb__sheet {
      rotate: 0deg;
      padding-inline: var(--space-4);
      --gutter: var(--space-5);
    }
    .lb__steps { overflow-x: auto; }
  }
</style>
