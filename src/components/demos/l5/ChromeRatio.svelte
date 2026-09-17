<script lang="ts">
  /**
   * 5.4 演示 · 内容-外壳比
   *
   * 逐项开关装饰，用 Range.getClientRects() **实测**文字行盒面积，
   * 算出内容像素占比；同时用「可见边缘总长度 ÷ 面积」估算视觉噪声。
   * 两条曲线的交点附近，就是这张卡片的装饰最优点。
   */
  import { arc } from '@/lib/d3-kit';
  import { cssVar } from '@/lib/color';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      decor: '装饰开关',
      d: { border: '卡片边框', shadow: '阴影', rules: '行间分隔线', surface: '面色分层', radius: '圆角', icons: '图标背板' },
      title: '内容占比与视觉噪声',
      desc: '当前装饰组合下的内容像素占比与视觉噪声估计。',
      content: '内容像素占比',
      noise: '视觉噪声',
      noiseNote: '可见边缘总长度 ÷ 卡片面积',
      edges: '可见边缘',
      preset: '预设',
      pAll: '全开（装饰堆满）',
      pNone: '全关',
      pBest: 'stage5（克制）',
      hint: '先点「全开」，再点「stage5」—— 内容占比上升，噪声下降，而分组信息一点没丢（因为面色分层还在）。这就是第 5.6 节说的替代顺序：用更便宜的手段达成同样的传达。',
      order: '分隔手段的替代顺序：留白 > 面色 > 分隔线 > 边框 > 阴影。用到能解决问题的第一个就停。',
      lost: '⚠ 分组信息已丢失：留白与面色都关掉了，读者无法判断哪些内容是一组',
    },
    en: {
      decor: 'Decoration toggles',
      d: { border: 'Card border', shadow: 'Shadow', rules: 'Row rules', surface: 'Surface layering', radius: 'Rounded corners', icons: 'Icon plates' },
      title: 'Content share and visual noise',
      desc: 'Content pixel share and estimated visual noise for the current combination of decorations.',
      content: 'Content pixel share',
      noise: 'Visual noise',
      noiseNote: 'Total visible edge length ÷ card area',
      edges: 'Visible edges',
      preset: 'Presets',
      pAll: 'All on (maximal chrome)',
      pNone: 'All off',
      pBest: 'stage5 (restrained)',
      hint: 'Click “All on”, then “stage5” — the content share rises, the noise falls, and no grouping information is lost (the surface layering is still there). That is the substitution order from §5.6: achieve the same communication with a cheaper device.',
      order: 'Substitution order: whitespace > surface > rule > border > shadow. Stop at the first one that solves it.',
      lost: '⚠ Grouping information lost: with both whitespace and surface off, readers cannot tell what belongs together',
    },
  }[locale]);

  type Key = 'border' | 'shadow' | 'rules' | 'surface' | 'radius' | 'icons';
  let on = $state<Record<Key, boolean>>({
    border: true,
    shadow: true,
    rules: true,
    surface: false,
    radius: true,
    icons: true,
  });

  function preset(p: 'all' | 'none' | 'best') {
    if (p === 'all') on = { border: true, shadow: true, rules: true, surface: false, radius: true, icons: true };
    if (p === 'none') on = { border: false, shadow: false, rules: false, surface: false, radius: false, icons: false };
    if (p === 'best') on = { border: false, shadow: false, rules: false, surface: true, radius: true, icons: false };
  }

  /* ── 实测 ─────────────────────────────────────────────────────────── */
  let cardEl: HTMLDivElement | undefined = $state();
  let measured = $state({ ratio: 0, area: 1 });

  function measure() {
    if (!cardEl) return;
    let ink = 0;
    const walker = document.createTreeWalker(cardEl, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (!node.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) ink += r.width * r.height;
      range.detach?.();
    }
    const box = cardEl.getBoundingClientRect();
    const area = Math.max(1, box.width * box.height);
    measured = { ratio: ink / area, area };
  }

  $effect(() => {
    void on.border;
    void on.shadow;
    void on.rules;
    void on.surface;
    void on.radius;
    void on.icons;
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  });

  $effect(() => {
    if (!cardEl) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(cardEl);
    return () => ro.disconnect();
  });

  /** 视觉噪声估算：可见边缘总长度 ÷ 面积 */
  const ROWS = 4;
  const edgeLength = $derived.by(() => {
    if (!cardEl) return 0;
    const b = cardEl.getBoundingClientRect();
    let len = 0;
    if (on.border) len += 2 * (b.width + b.height);
    if (on.shadow) len += 2 * (b.width + b.height); // 阴影边缘与边框等长
    if (on.rules) len += b.width * (ROWS - 1);
    if (on.icons) len += ROWS * 4 * 28; // 每个图标背板四条边
    return len;
  });
  const noise = $derived(edgeLength / Math.sqrt(measured.area || 1) / 10);
  const groupingLost = $derived(!on.surface && !on.border && !on.rules);

  let themeTick = $state(0);
  $effect(() => {
    const on2 = () => themeTick++;
    document.addEventListener('lc:themechange', on2);
    return () => document.removeEventListener('lc:themechange', on2);
  });
  const colors = $derived.by(() => {
    themeTick;
    return {
      good: cssVar('--good', '#059669'),
      bad: cssVar('--bad', '#dc2626'),
      track: cssVar('--surface-3', '#e2e8f0'),
      ink: cssVar('--ink-1', '#0f172a'),
      ink3: cssVar('--ink-3', '#64748b'),
    };
  });

  const gauge = arc<{ v: number }>().innerRadius(28).outerRadius(40).startAngle(0).endAngle((d) => d.v * Math.PI * 2).cornerRadius(6);

  const tableRows = $derived([
    [locale === 'zh' ? '指标' : 'Metric', locale === 'zh' ? '值' : 'Value'],
    [T.content, `${(measured.ratio * 100).toFixed(1)}%`],
    [T.noise, noise.toFixed(2)],
    [T.edges, `${Math.round(edgeLength)} px`],
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <div class="control" style="flex: 1 1 24rem">
      <span class="control__label"><span>{T.decor}</span></span>
      <div class="chip-group">
        {#each Object.entries(T.d) as [key, label] (key)}
          <button
            class="chip"
            type="button"
            aria-pressed={on[key as Key]}
            onclick={() => (on = { ...on, [key]: !on[key as Key] })}
          >
            {label}
          </button>
        {/each}
      </div>
    </div>
    <div class="control" style="flex: 0 1 16rem">
      <span class="control__label"><span>{T.preset}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" onclick={() => preset('all')}>{T.pAll}</button>
        <button class="chip" type="button" onclick={() => preset('none')}>{T.pNone}</button>
        <button class="chip" type="button" onclick={() => preset('best')}>{T.pBest}</button>
      </div>
    </div>
  </div>

  <div class="cr__split">
    <div class="cr__stage" class:has-surface={on.surface}>
      <div
        class="cr__card"
        class:has-border={on.border}
        class:has-shadow={on.shadow}
        class:has-radius={on.radius}
        class:has-surface={on.surface}
        bind:this={cardEl}
      >
        <h5>{locale === 'zh' ? '学院分布 Top 4' : 'Top 4 schools'}</h5>
        {#each [['地球科学与技术学院', 'Geosciences & Technology', '612'], ['石油工程学院', 'Petroleum Engineering', '548'], ['计算机科学与技术学院', 'Computer Science', '503'], ['化学工程学院', 'Chemical Engineering', '421']] as row, i (i)}
          <div class="cr__row" class:has-rule={on.rules}>
            {#if on.icons}<span class="cr__icon" aria-hidden="true">◫</span>{/if}
            <span class="cr__name">{locale === 'zh' ? row[0] : row[1]}</span>
            <span class="cr__val">{row[2]}</span>
          </div>
        {/each}
      </div>
    </div>

    <ResponsiveChart title={T.title} desc={T.desc} ratio={1.5} minHeight={160} rows={tableRows}>
      {#snippet children({ width, height })}
        {@const cx1 = width * 0.3}
        {@const cx2 = width * 0.7}
        {@const cy = height * 0.45}
        <g transform={`translate(${cx1},${cy})`}>
          <path d={gauge({ v: 1 }) ?? ''} fill={colors.track} opacity="0.5" />
          <path d={gauge({ v: Math.min(1, measured.ratio * 3) }) ?? ''} fill={colors.good} />
          <text text-anchor="middle" y="5" font-size="14" font-weight="700" fill={colors.ink}>
            {(measured.ratio * 100).toFixed(1)}%
          </text>
          <text text-anchor="middle" y={60} font-size="10" fill={colors.ink3}>{T.content}</text>
        </g>
        <g transform={`translate(${cx2},${cy})`}>
          <path d={gauge({ v: 1 }) ?? ''} fill={colors.track} opacity="0.5" />
          <path d={gauge({ v: Math.min(1, noise / 6) }) ?? ''} fill={colors.bad} />
          <text text-anchor="middle" y="5" font-size="14" font-weight="700" fill={colors.ink}>
            {noise.toFixed(1)}
          </text>
          <text text-anchor="middle" y={60} font-size="10" fill={colors.ink3}>{T.noise}</text>
        </g>
      {/snippet}
    </ResponsiveChart>
  </div>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.edges}</p>
      <p class="readout__value">{Math.round(edgeLength)}<span style="font-size:.5em">px</span></p>
      <p class="readout__note">{T.noiseNote}</p>
    </div>
  </div>

  {#if groupingLost}
    <p class="pitfall" style="margin:0">{T.lost}</p>
  {/if}
  <p class="key-point" style="margin:0">{T.order}</p>
  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .cr__split {
    display: grid;
    gap: var(--space-5);
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    align-items: start;
  }
  @container (max-width: 42rem) {
    .cr__split {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .cr__stage {
    padding: var(--space-5);
    border-radius: var(--radius);
    background: var(--surface-0);
  }
  .cr__stage.has-surface {
    background: var(--surface-2);
  }
  .cr__card {
    padding: var(--space-4);
    background: transparent;
    transition: background var(--motion-fast);
  }
  .cr__card.has-surface {
    background: var(--surface-1);
  }
  .cr__card.has-border {
    border: 1px solid var(--line-1);
  }
  .cr__card.has-shadow {
    box-shadow: var(--elevation-2);
  }
  .cr__card.has-radius {
    border-radius: var(--radius);
  }
  .cr__card h5 {
    font-size: var(--step--1);
    color: var(--ink-1);
    margin-block-end: var(--space-3);
  }
  .cr__row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding-block: var(--space-2);
    font-size: var(--step--2);
  }
  .cr__row.has-rule + .cr__row.has-rule {
    border-block-start: 1px solid var(--line-1);
  }
  .cr__icon {
    display: grid;
    place-items: center;
    inline-size: 22px;
    block-size: 22px;
    border: 1px solid var(--line-2);
    border-radius: var(--radius-sm);
    color: var(--ink-4);
    flex: none;
  }
  .cr__name {
    flex: 1;
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cr__val {
    font-variant-numeric: tabular-nums;
    color: var(--ink-1);
    font-weight: 600;
  }
</style>
