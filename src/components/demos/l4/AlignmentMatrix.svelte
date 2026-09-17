<script lang="ts">
  /**
   * 3.5 演示 · 对齐系统：剩余空间去哪了
   *
   * 关键设计：**高亮的不是元素，是空白**。
   * 用真实 DOM 布局 + ResizeObserver 量出每个子项的矩形，
   * 再由 D3 把「容器里没有被子项占据的区域」画成半透明色块 ——
   * 一旦看见空白在动，六个对齐属性就不需要背了。
   */
  import { cssVar } from '@/lib/color';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      engine: '引擎',
      jc: 'justify-content（行内轴 · 轨道之间）',
      ai: 'align-items（块轴 · 格子内部）',
      title: '剩余空间分布',
      desc: '容器中未被子项占据的区域；对齐属性改变的正是这些空白的位置。',
      leftover: '剩余空间占比',
      note: '如果剩余空间为 0，所有对齐属性都不会有任何视觉效果 —— 这就是「我写了 align-items 但没反应」的答案。',
      hint: '把 align-items 设成 stretch（默认值），看剩余空间如何消失 —— 子项吃掉了全部纵向空白。这也是「同一行卡片天然等高」的原因。',
      selfOverride: '第 3 个子项用 align-self 覆盖',
      css: '当前 CSS',
    },
    en: {
      engine: 'Engine',
      jc: 'justify-content (inline axis · between tracks)',
      ai: 'align-items (block axis · inside the cell)',
      title: 'Where the leftover space goes',
      desc: 'Regions of the container not occupied by items; alignment properties move exactly this emptiness.',
      leftover: 'Leftover space',
      note: 'With zero leftover space, no alignment property has any visible effect — that is the answer to “I set align-items and nothing happened”.',
      hint: 'Set align-items to stretch (the default) and watch the leftover space vanish — the items ate all the vertical emptiness. That is also why cards in a row are equal height for free.',
      selfOverride: 'Third item overrides with align-self',
      css: 'Current CSS',
    },
  }[locale]);

  const JC = ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'] as const;
  const AI = ['stretch', 'start', 'center', 'end'] as const;

  let engine = $state<'flex' | 'grid'>('flex');
  let jc = $state<(typeof JC)[number]>('space-between');
  let ai = $state<(typeof AI)[number]>('center');
  let selfOverride = $state(false);

  const CONTAINER_H = 180;

  let stage: HTMLDivElement | undefined = $state();
  let rects = $state<Array<{ x: number; y: number; w: number; h: number }>>([]);
  let box = $state({ w: 1, h: 1 });

  function measure() {
    if (!stage) return;
    const host = stage.getBoundingClientRect();
    box = { w: host.width, h: host.height };
    rects = [...stage.querySelectorAll<HTMLElement>('.am__item')].map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - host.left, y: r.top - host.top, w: r.width, h: r.height };
    });
  }

  $effect(() => {
    void engine;
    void jc;
    void ai;
    void selfOverride;
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  });

  $effect(() => {
    if (!stage) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(stage);
    return () => ro.disconnect();
  });

  const occupied = $derived(rects.reduce((s, r) => s + r.w * r.h, 0));
  const leftoverRatio = $derived(box.w * box.h > 0 ? 1 - occupied / (box.w * box.h) : 0);

  const css = $derived(
    `.container {\n  display: ${engine};\n  ${engine === 'grid' ? 'grid-template-columns: repeat(3, auto);\n  ' : ''}justify-content: ${jc};\n  align-items: ${ai};\n  block-size: ${CONTAINER_H}px;\n}` +
      (selfOverride ? `\n\n.container > :nth-child(3) {\n  align-self: end;\n}` : ''),
  );

  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });
  const colors = $derived.by(() => {
    themeTick;
    return {
      gap: cssVar('--ch3', '#0d9488'),
      item: cssVar('--accent', '#2563eb'),
      ink: cssVar('--ink-3', '#64748b'),
      line: cssVar('--line-2', '#cbd5e1'),
    };
  });

  const tableRows = $derived([
    [locale === 'zh' ? '项' : 'Item', 'x', 'y', 'w', 'h'],
    ...rects.map((r, i) => [`#${i + 1}`, r.x.toFixed(0), r.y.toFixed(0), r.w.toFixed(0), r.h.toFixed(0)]),
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <div class="control" style="flex: 0 1 11rem">
      <span class="control__label"><span>{T.engine}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" aria-pressed={engine === 'flex'} onclick={() => (engine = 'flex')}>flex</button>
        <button class="chip" type="button" aria-pressed={engine === 'grid'} onclick={() => (engine = 'grid')}>grid</button>
      </div>
    </div>
    <div class="control" style="flex: 1 1 22rem">
      <span class="control__label"><span>{T.jc}</span></span>
      <div class="chip-group">
        {#each JC as v (v)}
          <button class="chip" type="button" aria-pressed={jc === v} onclick={() => (jc = v)}>{v}</button>
        {/each}
      </div>
    </div>
    <div class="control" style="flex: 1 1 16rem">
      <span class="control__label"><span>{T.ai}</span></span>
      <div class="chip-group">
        {#each AI as v (v)}
          <button class="chip" type="button" aria-pressed={ai === v} onclick={() => (ai = v)}>{v}</button>
        {/each}
        <button class="chip" type="button" aria-pressed={selfOverride} onclick={() => (selfOverride = !selfOverride)}>
          {T.selfOverride}
        </button>
      </div>
    </div>
  </div>

  <div class="am__wrap">
    <!-- 真实 DOM：对齐真的发生在这里 -->
    <div
      class="am__stage"
      bind:this={stage}
      style={`display:${engine}; justify-content:${jc}; align-items:${ai}; block-size:${CONTAINER_H}px; ${engine === 'grid' ? 'grid-template-columns: repeat(3, auto);' : ''}`}
    >
      <div class="am__item">A</div>
      <div class="am__item am__item--tall">B</div>
      <div class="am__item" style={selfOverride ? 'align-self: end' : ''}>C</div>
    </div>

    <!-- D3：把「空白」画出来 -->
    <ResponsiveChart title={T.title} desc={T.desc} ratio={2.4} minHeight={150} rows={tableRows}>
      {#snippet children({ width, height })}
        {@const sx = width / (box.w || 1)}
        {@const sy = height / (box.h || 1)}
        <!-- 整个容器：全部先当成剩余空间 -->
        <rect x="0" y="0" width={width} height={height} fill={colors.gap} opacity="0.22" />
        <!-- 再把子项占据的部分挖掉（用容器底色盖住） -->
        {#each rects as r, i (i)}
          <rect
            x={r.x * sx}
            y={r.y * sy}
            width={r.w * sx}
            height={r.h * sy}
            fill={colors.item}
            opacity="0.9"
            rx="2"
          />
          <text
            x={(r.x + r.w / 2) * sx}
            y={(r.y + r.h / 2) * sy + 4}
            text-anchor="middle"
            font-size="11"
            font-weight="700"
            fill="#fff"
          >
            {String.fromCharCode(65 + i)}
          </text>
        {/each}
        <rect x="0.5" y="0.5" width={width - 1} height={height - 1} fill="none" stroke={colors.line} stroke-dasharray="4 3" />
      {/snippet}
    </ResponsiveChart>
  </div>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.leftover}</p>
      <p class={`readout__value ${leftoverRatio < 0.02 ? 'readout__value--warn' : ''}`}>
        {(leftoverRatio * 100).toFixed(1)}%
      </p>
      <p class="readout__note">{T.note}</p>
    </div>
  </div>

  <div>
    <p class="control__label" style="margin-block-end: var(--space-2)"><span>{T.css}</span></p>
    <pre class="console">{css}</pre>
  </div>

  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .am__wrap {
    display: grid;
    gap: var(--space-5);
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
  @container (max-width: 44rem) {
    .am__wrap {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .am__stage {
    gap: var(--space-3);
    background: var(--surface-0);
    border: 1px dashed var(--line-2);
    border-radius: var(--radius);
    padding: var(--space-3);
  }
  .am__item {
    inline-size: 4.5rem;
    padding: var(--space-3);
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    border: 1px solid var(--accent);
    border-radius: var(--radius-sm);
    display: grid;
    place-items: center;
    font-family: var(--font-mono);
    font-weight: 700;
    color: var(--ink-1);
  }
  .am__item--tall {
    padding-block: var(--space-5);
  }
</style>
