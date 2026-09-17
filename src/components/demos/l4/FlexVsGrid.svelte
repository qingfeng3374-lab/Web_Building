<script lang="ts">
  /**
   * 3.3 演示 · Flex 与 Grid 的实测差别
   *
   * 同一组卡片、同一个容器宽度，只切换引擎。
   * D3 画出每张卡片的**实测宽度分布** —— Flex 的最后一行与前面不一致，
   * Grid 的所有列轨道完全一致。这个差别用眼睛容易忽略，用数据一目了然。
   */
  import { scaleLinear, scaleBand } from '@/lib/d3-kit';
  import { cssVar } from '@/lib/color';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      engine: '布局引擎',
      width: '容器宽度',
      count: '卡片数量',
      basis: '卡片基准宽度',
      title: '每张卡片的实测宽度',
      desc: '当前引擎下各卡片的渲染宽度；宽度不一致时会出现高低不齐的柱子。',
      spread: '宽度离散度',
      spreadNote: '所有卡片宽度的极差；0 表示完全一致',
      rows: '实际行数',
      lastRow: '最后一行卡片数',
      hintFlex: 'Flex：最后一行只剩 2 张时，它们会各自拉伸填满整行 —— 与上面几行的列不再对齐。',
      hintGrid: 'Grid：列轨道对所有行统一，最后一行的卡片仍然停在原来的列上。',
      tryIt: '把卡片数量调成 7、容器宽度调到 900px，然后在两个引擎之间来回切 —— 差别最明显。',
    },
    en: {
      engine: 'Layout engine',
      width: 'Container width',
      count: 'Card count',
      basis: 'Card basis width',
      title: 'Measured width of every card',
      desc: 'Rendered width of each card under the current engine; uneven bars mean uneven widths.',
      spread: 'Width spread',
      spreadNote: 'Range across all card widths; 0 means perfectly uniform',
      rows: 'Rows produced',
      lastRow: 'Cards in the last row',
      hintFlex: 'Flex: when the last row holds only two cards they stretch to fill the line — no longer aligned with the columns above.',
      hintGrid: 'Grid: the column tracks are shared by every row, so the last row’s cards stay on their original columns.',
      tryIt: 'Set the card count to 7 and the container to 900px, then flip between the engines — that is where the difference is loudest.',
    },
  }[locale]);

  let engine = $state<'flex' | 'grid'>('flex');
  let containerW = $state(880);
  let count = $state(7);
  let basis = $state(200);

  let stage: HTMLDivElement | undefined = $state();
  let widths = $state<number[]>([]);
  let tops = $state<number[]>([]);

  function measure() {
    if (!stage) return;
    const els = [...stage.querySelectorAll<HTMLElement>('.fg__card')];
    widths = els.map((el) => Math.round(el.getBoundingClientRect().width));
    tops = els.map((el) => Math.round(el.getBoundingClientRect().top));
  }

  $effect(() => {
    void engine;
    void containerW;
    void count;
    void basis;
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  });

  $effect(() => {
    if (!stage) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(stage);
    return () => ro.disconnect();
  });

  const spread = $derived(widths.length ? Math.max(...widths) - Math.min(...widths) : 0);
  const rowCount = $derived(new Set(tops).size);
  const lastRowCount = $derived.by(() => {
    if (!tops.length) return 0;
    const last = Math.max(...tops);
    return tops.filter((t) => t === last).length;
  });

  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });
  const colors = $derived.by(() => {
    themeTick;
    return {
      bar: cssVar('--ch3', '#0d9488'),
      odd: cssVar('--accent', '#2563eb'),
      bad: cssVar('--bad', '#dc2626'),
      ink: cssVar('--ink-3', '#64748b'),
      line: cssVar('--line-1', '#e2e8f0'),
    };
  });

  const tableRows = $derived([
    [locale === 'zh' ? '卡片' : 'Card', locale === 'zh' ? '宽度' : 'Width'],
    ...widths.map((w, i) => [`#${i + 1}`, `${w} px`]),
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <div class="control" style="flex: 0 1 12rem">
      <span class="control__label"><span>{T.engine}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" aria-pressed={engine === 'flex'} onclick={() => (engine = 'flex')}>Flex</button>
        <button class="chip" type="button" aria-pressed={engine === 'grid'} onclick={() => (engine = 'grid')}>Grid</button>
      </div>
    </div>
    <Slider label={T.width} bind:value={containerW} min={320} max={1100} step={10} unit="px" />
    <Slider label={T.count} bind:value={count} min={2} max={12} />
    <Slider label={T.basis} bind:value={basis} min={120} max={320} step={10} unit="px" />
  </div>

  <div class="fg__stage" bind:this={stage} style={`--cw:${containerW}px; --basis:${basis}px`}>
    <div class="fg__cards" class:is-flex={engine === 'flex'} class:is-grid={engine === 'grid'}>
      {#each Array(count) as _, i (i)}
        <div class="fg__card">#{i + 1}</div>
      {/each}
    </div>
  </div>

  <ResponsiveChart title={T.title} desc={T.desc} ratio={3} minHeight={150} rows={tableRows}>
    {#snippet children({ width, height })}
      {@const padB = 22}
      {@const padT = 10}
      {@const maxW = Math.max(1, ...widths)}
      {@const x = scaleBand<number>()
        .domain(widths.map((_, i) => i))
        .range([8, width - 8])
        .padding(0.22)}
      {@const y = scaleLinear().domain([0, maxW]).range([height - padB, padT])}
      {@const lastTop = tops.length ? Math.max(...tops) : 0}

      {#each widths as w, i (i)}
        {@const inLastRow = tops[i] === lastTop && rowCount > 1}
        <rect
          x={x(i)}
          y={y(w)}
          width={x.bandwidth()}
          height={height - padB - y(w)}
          fill={inLastRow && spread > 1 ? colors.bad : inLastRow ? colors.odd : colors.bar}
          opacity="0.85"
          rx="2"
        />
        <text x={(x(i) ?? 0) + x.bandwidth() / 2} y={y(w) - 4} text-anchor="middle" font-size="9" fill={colors.ink}>
          {w}
        </text>
        <text x={(x(i) ?? 0) + x.bandwidth() / 2} y={height - 8} text-anchor="middle" font-size="9" fill={colors.ink}>
          {i + 1}
        </text>
      {/each}
      <line x1="8" y1={height - padB} x2={width - 8} y2={height - padB} stroke={colors.line} />
    {/snippet}
  </ResponsiveChart>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.spread}</p>
      <p class={`readout__value ${spread > 1 ? 'readout__value--bad' : 'readout__value--good'}`}>
        {spread}<span style="font-size:.5em">px</span>
      </p>
      <p class="readout__note">{T.spreadNote}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.rows}</p>
      <p class="readout__value">{rowCount}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.lastRow}</p>
      <p class="readout__value">{lastRowCount}</p>
    </div>
  </div>

  <p class="note" style="margin:0">{engine === 'flex' ? T.hintFlex : T.hintGrid}</p>
  <p class="key-point" style="margin:0">{T.tryIt}</p>
</div>

<style>
  .fg__stage {
    background: var(--surface-0);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-4);
    overflow-x: auto;
  }
  .fg__cards {
    inline-size: var(--cw);
    max-inline-size: 100%;
    gap: var(--space-4);
  }
  .fg__cards.is-flex {
    display: flex;
    flex-wrap: wrap;
  }
  .fg__cards.is-flex > * {
    flex: 1 1 var(--basis);
  }
  .fg__cards.is-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--basis)), 1fr));
  }
  .fg__card {
    background: color-mix(in srgb, var(--ch3) 14%, transparent);
    border: 1px solid var(--ch3);
    border-radius: var(--radius-sm);
    padding: var(--space-4) var(--space-3);
    text-align: center;
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--ink-1);
    min-inline-size: 0;
  }
</style>
