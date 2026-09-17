<script lang="ts">
  /**
   * 4.4 演示 · 四个算法布局原语
   *
   * 每个原语都在真实 DOM 里跑，同时 D3 在宽度轴上标出**阈值的理论值**，
   * 并把实测的重排位置画上去 —— 两者应当重合。重合本身就是论证：
   * 「这些阈值是可以算出来的，不用拖窗口试」。
   */
  import { scaleLinear } from '@/lib/d3-kit';
  import { cssVar } from '@/lib/color';
  import { sidebarStackWidth, ramColumns, ramThresholds, switcherIsRow } from '@/lib/fluid';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      primitive: '原语',
      width: '容器宽度',
      param: '参数',
      p: { ram: 'RAM 网格', sidebar: 'Sidebar 侧栏', switcher: 'Switcher 切换器', cover: 'Cover 整屏' },
      minTrack: '最小轨道 / 侧栏基准 / 阈值',
      gap: '水槽',
      mainMin: '主区最小占比',
      title: '阈值与当前状态',
      desc: '当前原语的重排阈值（理论值）与当前容器宽度的位置关系。',
      threshold: '理论阈值',
      actual: '当前状态',
      cols: '列',
      row: '一行平分',
      stacked: '各占一行',
      side: '并排',
      formula: '公式',
      f: {
        ram: 'n = floor((W + G) / (A + G))',
        sidebar: 'W < (S + G) / (1 − M) 时堆叠',
        switcher: 'flex-basis: calc((阈值 − 100%) × 999)',
        cover: 'margin-block: auto 吃掉全部剩余纵向空间',
      },
      hint: '把容器宽度拖过橙色阈值线，观察下方真实 DOM 的重排时机 —— 它和理论值完全一致。这就是「算法布局」：重排时机由公式决定，不由你手写的断点决定。',
      main: '主内容区',
      nav: '侧栏导航',
      itemLabel: '卡片',
    },
    en: {
      primitive: 'Primitive',
      width: 'Container width',
      param: 'Parameters',
      p: { ram: 'RAM grid', sidebar: 'Sidebar', switcher: 'Switcher', cover: 'Cover' },
      minTrack: 'Min track / sidebar basis / threshold',
      gap: 'Gutter',
      mainMin: 'Main minimum share',
      title: 'Threshold and current state',
      desc: 'The theoretical re-flow threshold of the current primitive, against the current container width.',
      threshold: 'Theoretical threshold',
      actual: 'Current state',
      cols: ' columns',
      row: 'sharing one row',
      stacked: 'one per row',
      side: 'side by side',
      formula: 'Formula',
      f: {
        ram: 'n = floor((W + G) / (A + G))',
        sidebar: 'stacks when W < (S + G) / (1 − M)',
        switcher: 'flex-basis: calc((threshold − 100%) × 999)',
        cover: 'margin-block: auto absorbs all leftover vertical space',
      },
      hint: 'Drag the container past the orange threshold line and watch the real DOM below re-flow at exactly that point. That is algorithmic layout: the formula decides when, not a number you typed.',
      main: 'Main content',
      nav: 'Sidebar nav',
      itemLabel: 'Card',
    },
  }[locale]);

  type Prim = 'ram' | 'sidebar' | 'switcher' | 'cover';
  let prim = $state<Prim>('ram');
  let containerW = $state(760);
  let param = $state(288); // minTrack / sideBasis / threshold
  let gap = $state(24);
  let mainMin = $state(0.6);

  const thresholds = $derived.by(() => {
    if (prim === 'ram') return ramThresholds(param, gap, 1400);
    if (prim === 'sidebar') return [Math.round(sidebarStackWidth(param, gap, mainMin))];
    if (prim === 'switcher') return [param];
    return [];
  });

  const stateText = $derived.by(() => {
    if (prim === 'ram') return `${ramColumns(containerW, param, gap)}${T.cols}`;
    if (prim === 'sidebar')
      return containerW < sidebarStackWidth(param, gap, mainMin) ? T.stacked : T.side;
    if (prim === 'switcher') return switcherIsRow(containerW, param) ? T.row : T.stacked;
    return '—';
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
      accent: cssVar('--ch4', '#d97706'),
      ink: cssVar('--ink-3', '#64748b'),
      line: cssVar('--line-1', '#e2e8f0'),
      cur: cssVar('--accent', '#2563eb'),
    };
  });

  const tableRows = $derived([
    [locale === 'zh' ? '阈值' : 'Threshold', 'px'],
    ...thresholds.map((t, i) => [`#${i + 1}`, String(t)]),
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <div class="control" style="flex: 1 1 18rem">
      <span class="control__label"><span>{T.primitive}</span></span>
      <div class="chip-group">
        {#each Object.entries(T.p) as [key, label] (key)}
          <button class="chip" type="button" aria-pressed={prim === key} onclick={() => (prim = key as Prim)}>
            {label}
          </button>
        {/each}
      </div>
    </div>
    <Slider label={T.width} bind:value={containerW} min={240} max={1200} step={10} unit="px" />
    {#if prim !== 'cover'}
      <Slider label={T.minTrack} bind:value={param} min={120} max={560} step={8} unit="px" />
      <Slider label={T.gap} bind:value={gap} min={0} max={48} step={4} unit="px" />
    {/if}
    {#if prim === 'sidebar'}
      <Slider label={T.mainMin} bind:value={mainMin} min={0.3} max={0.85} step={0.05} format={(v) => `${Math.round(v * 100)}%`} />
    {/if}
  </div>

  {#if prim !== 'cover'}
    <ResponsiveChart title={T.title} desc={T.desc} ratio={5} minHeight={90} rows={tableRows}>
      {#snippet children({ width, height })}
        {@const x = scaleLinear().domain([240, 1200]).range([16, width - 16])}
        {@const mid = height * 0.55}
        <line x1={16} y1={mid} x2={width - 16} y2={mid} stroke={colors.line} stroke-width="2" />
        {#each [320, 480, 768, 1024] as t (t)}
          <text x={x(t)} y={height - 6} text-anchor="middle" font-size="8.5" fill={colors.ink}>{t}</text>
        {/each}
        {#each thresholds as t (t)}
          {#if t >= 240 && t <= 1200}
            <line x1={x(t)} y1={mid - 18} x2={x(t)} y2={mid + 14} stroke={colors.accent} stroke-width="2.5" />
            <text x={x(t)} y={mid - 23} text-anchor="middle" font-size="9.5" font-weight="700" fill={colors.accent}>{t}</text>
          {/if}
        {/each}
        <circle cx={x(containerW)} cy={mid} r="7" fill={colors.cur} />
        <text x={x(containerW)} y={mid + 26} text-anchor="middle" font-size="9.5" fill={colors.cur} font-weight="700">
          {containerW}px
        </text>
      {/snippet}
    </ResponsiveChart>
  {/if}

  <!-- 真实 DOM -->
  <div class="ip__stage">
    <div
      class="ip__box"
      style={`inline-size:${containerW}px; --gap:${gap}px; --min:${param}px; --side:${param}px; --threshold:${param}px; --main-min:${mainMin * 100}%`}
    >
      {#if prim === 'ram'}
        <div class="p-ram">
          {#each Array(8) as _, i (i)}<div class="ip__item">{T.itemLabel} {i + 1}</div>{/each}
        </div>
      {:else if prim === 'sidebar'}
        <div class="p-sidebar">
          <div class="ip__item ip__item--side">{T.nav}</div>
          <div class="ip__item ip__item--main">{T.main}</div>
        </div>
      {:else if prim === 'switcher'}
        <div class="p-switcher">
          {#each Array(3) as _, i (i)}<div class="ip__item">{T.itemLabel} {i + 1}</div>{/each}
        </div>
      {:else}
        <div class="p-cover">
          <div class="ip__item ip__item--slim">Logo</div>
          <div class="ip__item ip__item--centred">{T.main}</div>
          <div class="ip__item ip__item--slim">↓</div>
        </div>
      {/if}
    </div>
  </div>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.actual}</p>
      <p class="readout__value" style="font-size: var(--step-0)">{stateText}</p>
      <p class="readout__note">@ {containerW}px</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.threshold}</p>
      <p class="readout__value" style="font-size: var(--step-0); color: var(--ch4)">
        {thresholds.length ? thresholds.join(' · ') : '—'}
      </p>
      <p class="readout__note">{T.formula}: {T.f[prim]}</p>
    </div>
  </div>

  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .ip__stage {
    overflow-x: auto;
    background: var(--surface-0);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-4);
  }
  .ip__box {
    max-inline-size: 100%;
    border: 1px dashed var(--line-2);
    padding: var(--space-2);
  }
  .ip__item {
    background: color-mix(in srgb, var(--ch4) 16%, transparent);
    border: 1px solid var(--ch4);
    border-radius: var(--radius-sm);
    padding: var(--space-3);
    font-size: var(--step--2);
    color: var(--ink-1);
    text-align: center;
    min-inline-size: 0;
  }
  .ip__item--side {
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    border-color: var(--accent);
  }
  .ip__item--slim {
    padding: var(--space-2);
  }

  /* 四个原语的真实实现（与 layout.css 一致） */
  .p-ram {
    display: grid;
    gap: var(--gap);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--min)), 1fr));
  }
  .p-sidebar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap);
  }
  .p-sidebar > :first-child {
    flex-basis: var(--side);
    flex-grow: 1;
  }
  .p-sidebar > :last-child {
    flex-basis: 0;
    flex-grow: 999;
    min-inline-size: var(--main-min);
  }
  .p-switcher {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap);
  }
  .p-switcher > * {
    flex-grow: 1;
    flex-basis: calc((var(--threshold) - 100%) * 999);
  }
  .p-cover {
    display: flex;
    flex-direction: column;
    min-block-size: 200px;
    gap: var(--space-2);
  }
  .p-cover > * {
    margin-block: auto;
  }
  .p-cover > :first-child {
    margin-block-start: 0;
  }
  .p-cover > :last-child {
    margin-block-end: 0;
  }
</style>
