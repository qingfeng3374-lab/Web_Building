<script lang="ts">
  /**
   * 2.3 演示 · 间距标尺实验室
   *
   * 左：D3 画的刻度尺 + 相邻档位比值（低于 1.5 的标红 = 冗余档位）
   * 右：同一张卡片的两种实现并排 —— 「任意间距」vs「标尺间距」
   */
  import { scaleLinear } from '@/lib/d3-kit';
  import { cssVar } from '@/lib/color';
  import { spacingScale, distinguishableSteps, type ScaleGrowth } from '@/lib/grid';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      growth: '增长方式',
      g: { 'linear-4': '线性 +4', 'linear-8': '线性 ×n（8 的倍数）', 'ratio-1.5': '几何 ×1.5', golden: '黄金比 ×1.618' },
      title: '标尺刻度与相邻比值',
      desc: '当前标尺的九个档位，以及相邻档位的比值（低于 1.5 的为冗余档位）。',
      distinguishable: '可区分档位数',
      total: '总档位数',
      waste: '冗余档位',
      maxv: '最大档位',
      adhoc: 'stage0：任意间距',
      scaled: 'stage2：标尺间距',
      hint: '试试「线性 +4」：九个档位里只有三四个是真正可区分的，其余全是冗余选项 —— 这就是为什么间距标尺的大端必须用几何增长。',
      ratioLabel: '比值',
      redundant: '冗余（比值 < 1.5）',
    },
    en: {
      growth: 'Growth rule',
      g: { 'linear-4': 'Linear +4', 'linear-8': 'Linear ×n (multiples of 8)', 'ratio-1.5': 'Geometric ×1.5', golden: 'Golden ×1.618' },
      title: 'Scale steps and adjacent ratios',
      desc: 'The nine steps of the current scale and the ratio between adjacent steps (below 1.5 means redundant).',
      distinguishable: 'Distinguishable steps',
      total: 'Total steps',
      waste: 'Redundant steps',
      maxv: 'Largest step',
      adhoc: 'stage0: ad-hoc gaps',
      scaled: 'stage2: scale gaps',
      hint: 'Try “Linear +4”: only three or four of the nine steps are actually distinguishable and the rest are redundant options — which is why the large end of a spacing scale must grow geometrically.',
      ratioLabel: 'Ratio',
      redundant: 'redundant (ratio < 1.5)',
    },
  }[locale]);

  let base = $state(8);
  let growth = $state<ScaleGrowth>('ratio-1.5');

  const scale = $derived(
    growth === 'linear-8'
      ? [4, 8, 12, 16, 24, 32, 48, 64, 96]
      : spacingScale(base, growth, 9),
  );
  const distinct = $derived(distinguishableSteps(scale));
  const ratios = $derived(scale.slice(1).map((v, i) => v / scale[i]!));

  /* stage0 的真实间距取值（本课程案例） */
  const ADHOC = [5, 6, 7, 10, 13, 16, 17, 18, 20, 24, 30];

  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });
  const colors = $derived.by(() => {
    themeTick;
    return {
      bar: cssVar('--ch2', '#0891b2'),
      bad: cssVar('--bad', '#dc2626'),
      good: cssVar('--good', '#059669'),
      ink: cssVar('--ink-3', '#64748b'),
      line: cssVar('--line-1', '#e2e8f0'),
    };
  });

  const tableRows = $derived([
    [locale === 'zh' ? '档位' : 'Step', 'px', T.ratioLabel],
    ...scale.map((v, i) => [`--space-${i + 1}`, String(Math.round(v)), i === 0 ? '—' : ratios[i - 1]!.toFixed(2)]),
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <div class="control" style="flex: 0 1 8rem">
      <span class="control__label"><span>{locale === 'zh' ? '基数' : 'Base'}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" aria-pressed={base === 4} onclick={() => (base = 4)}>4px</button>
        <button class="chip" type="button" aria-pressed={base === 8} onclick={() => (base = 8)}>8px</button>
      </div>
    </div>
    <div class="control" style="flex: 1 1 20rem">
      <span class="control__label"><span>{T.growth}</span></span>
      <div class="chip-group">
        {#each Object.entries(T.g) as [key, label] (key)}
          <button class="chip" type="button" aria-pressed={growth === key} onclick={() => (growth = key as ScaleGrowth)}>
            {label}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <ResponsiveChart title={T.title} desc={T.desc} ratio={2.6} minHeight={200} rows={tableRows}>
    {#snippet children({ width, height })}
      {@const padL = 12}
      {@const padB = 46}
      {@const maxV = Math.max(...scale)}
      {@const x = scaleLinear().domain([0, scale.length]).range([padL, width - 12])}
      {@const bw = (width - padL - 12) / scale.length - 8}
      {@const y = scaleLinear().domain([0, maxV]).range([height - padB, 18])}

      {#each scale as v, i (i)}
        {@const redundant = i > 0 && ratios[i - 1]! < 1.5}
        <rect
          x={x(i)}
          y={y(v)}
          width={bw}
          height={height - padB - y(v)}
          fill={redundant ? colors.bad : colors.bar}
          opacity={redundant ? 0.45 : 0.85}
          rx="2"
        />
        <text x={x(i) + bw / 2} y={y(v) - 5} text-anchor="middle" font-size="10" font-weight="600" fill={colors.ink}>
          {Math.round(v)}
        </text>
        <text x={x(i) + bw / 2} y={height - padB + 14} text-anchor="middle" font-size="8.5" fill={colors.ink}>
          {i + 1}
        </text>
        {#if i > 0}
          <text
            x={x(i)}
            y={height - padB + 30}
            text-anchor="middle"
            font-size="9"
            fill={redundant ? colors.bad : colors.good}
            font-weight={redundant ? 700 : 400}
          >
            ×{ratios[i - 1]!.toFixed(2)}
          </text>
        {/if}
      {/each}
      <line x1={padL} y1={height - padB} x2={width - 12} y2={height - padB} stroke={colors.line} />
    {/snippet}
  </ResponsiveChart>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.distinguishable}</p>
      <p class={`readout__value readout__value--${distinct >= 7 ? 'good' : distinct >= 5 ? 'warn' : 'bad'}`}>{distinct}</p>
      <p class="readout__note">{T.total}: {scale.length}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.waste}</p>
      <p class={`readout__value ${scale.length - distinct > 2 ? 'readout__value--bad' : 'readout__value--good'}`}>
        {scale.length - distinct}
      </p>
      <p class="readout__note">{T.redundant}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.maxv}</p>
      <p class="readout__value">{Math.round(Math.max(...scale))}<span style="font-size:.5em">px</span></p>
    </div>
  </div>

  <div class="cmp2">
    <figure>
      <figcaption>{T.adhoc} — {ADHOC.length} {locale === 'zh' ? '种取值' : 'values'}</figcaption>
      <div class="sample sample--adhoc">
        <h5>{locale === 'zh' ? '学院分布' : 'School breakdown'}</h5>
        <p>{locale === 'zh' ? '共 18 个学院，Top 5 合计占 52.3%。' : '18 schools; the top five account for 52.3%.'}</p>
        <div class="sample__row"><span>{locale === 'zh' ? '地球科学' : 'Geosciences'}</span><b>612</b></div>
        <div class="sample__row"><span>{locale === 'zh' ? '石油工程' : 'Petroleum'}</span><b>548</b></div>
        <button type="button">{locale === 'zh' ? '查看全部' : 'View all'}</button>
      </div>
    </figure>
    <figure>
      <figcaption>{T.scaled} — 9 {locale === 'zh' ? '级标尺' : 'steps'}</figcaption>
      <div class="sample sample--scaled">
        <h5>{locale === 'zh' ? '学院分布' : 'School breakdown'}</h5>
        <p>{locale === 'zh' ? '共 18 个学院，Top 5 合计占 52.3%。' : '18 schools; the top five account for 52.3%.'}</p>
        <div class="sample__row"><span>{locale === 'zh' ? '地球科学' : 'Geosciences'}</span><b>612</b></div>
        <div class="sample__row"><span>{locale === 'zh' ? '石油工程' : 'Petroleum'}</span><b>548</b></div>
        <button type="button">{locale === 'zh' ? '查看全部' : 'View all'}</button>
      </div>
    </figure>
  </div>

  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .cmp2 {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  }
  .cmp2 figure {
    margin: 0;
  }
  .cmp2 figcaption {
    font-size: var(--step--2);
    font-weight: 700;
    color: var(--ink-3);
    margin-block-end: var(--space-2);
  }
  .sample {
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    font-size: var(--step--2);
  }
  .sample h5 {
    font-size: var(--step--1);
    color: var(--ink-1);
  }
  .sample__row {
    display: flex;
    justify-content: space-between;
    border-block-end: 1px solid var(--line-1);
  }
  .sample button {
    border: 1px solid var(--line-2);
    border-radius: var(--radius-sm);
    background: var(--surface-2);
    cursor: pointer;
  }

  /* stage0：11 种随手写的间距 */
  .sample--adhoc {
    padding: 13px;
  }
  .sample--adhoc h5 {
    margin-bottom: 7px;
  }
  .sample--adhoc p {
    margin-bottom: 17px;
  }
  .sample--adhoc .sample__row {
    padding: 5px 0;
    margin-bottom: 6px;
  }
  .sample--adhoc button {
    margin-top: 18px;
    padding: 3px 10px;
  }

  /* stage2：全部来自 9 级标尺 */
  .sample--scaled {
    padding: var(--space-4);
  }
  .sample--scaled h5 {
    margin-block-end: var(--space-2);
  }
  .sample--scaled p {
    margin-block-end: var(--space-5);
  }
  .sample--scaled .sample__row {
    padding-block: var(--space-2);
  }
  .sample--scaled button {
    margin-block-start: var(--space-5);
    padding: var(--space-2) var(--space-3);
  }
</style>
