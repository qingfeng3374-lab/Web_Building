<script lang="ts">
  /**
   * 2.5 演示 · 排版音阶实验室
   *
   * 选比率 → D3 画音阶柱 + 相邻/隔档比值标注 + 实时字号阶梯预览 + 输出 CSS 变量。
   * 「三级层级检查」直接复用第 1.3 节的阈值：隔两档比值需 ≈2 才算强对比。
   */
  import { scaleLinear } from '@/lib/d3-kit';
  import { cssVar } from '@/lib/color';
  import { typeScale, TYPE_RATIOS } from '@/lib/grid';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      base: '基准字号',
      ratio: '比率',
      title: '音阶档位与比值',
      desc: '当前比率下各档位的字号，以及相邻档、隔一档、隔两档的比值。',
      adjacent: '相邻档比值',
      two: '隔两档比值',
      twoNote: '≈2 时形成强对比，正好够三级层级',
      largest: '最大档位',
      tooBig: '在 375px 屏上会超过半行',
      css: '生成的 CSS 变量',
      preview: '字号阶梯预览',
      sample: '新生总人数',
      hint: '把比率调到 1.618（黄金比），看 --step-4 变成多少 —— 在手机上它会占掉大半行。黄金比属于海报，不属于界面。',
      levels: '三级层级检查',
      ok: '✓ 三级可靠区分',
      weak: '⚠ 层级对比偏弱',
    },
    en: {
      base: 'Base size',
      ratio: 'Ratio',
      title: 'Scale steps and ratios',
      desc: 'Type sizes at each step for the current ratio, with adjacent, two-step and three-step ratios.',
      adjacent: 'Adjacent ratio',
      two: 'Three-step ratio',
      twoNote: '≈2 gives strong contrast — exactly enough for three levels',
      largest: 'Largest step',
      tooBig: 'Exceeds half a line on a 375px screen',
      css: 'Generated CSS variables',
      preview: 'Type ladder preview',
      sample: 'Total enrolment',
      hint: 'Set the ratio to 1.618 (golden) and look at --step-4 — on a phone it eats most of a line. The golden ratio belongs on posters, not in interfaces.',
      levels: 'Three-level check',
      ok: '✓ three levels reliably separable',
      weak: '⚠ hierarchy contrast is weak',
    },
  }[locale]);

  const RATIOS = Object.keys(TYPE_RATIOS).map(Number);
  let ratioIndex = $state(2); // 1.25
  let base = $state(16);

  const ratio = $derived(RATIOS[ratioIndex]!);
  const ratioName = $derived(TYPE_RATIOS[ratio as keyof typeof TYPE_RATIOS][locale]);
  const STEPS = [-2, -1, 0, 1, 2, 3, 4, 5];
  const scale = $derived(typeScale(base, ratio, STEPS));
  const threeStep = $derived(ratio ** 3);
  const largest = $derived(scale[scale.length - 1]!.px);

  const css = $derived(
    scale.map((s) => `  --step-${s.step}: ${(s.px / 16).toFixed(3)}rem;  /* ${s.px.toFixed(1)}px */`).join('\n'),
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
      bar: cssVar('--ch2', '#0891b2'),
      accent: cssVar('--accent', '#2563eb'),
      ink: cssVar('--ink-3', '#64748b'),
      line: cssVar('--line-1', '#e2e8f0'),
      good: cssVar('--good', '#059669'),
      warn: cssVar('--warn', '#d97706'),
    };
  });

  const tableRows = $derived([
    [locale === 'zh' ? '档位' : 'Step', 'px', 'rem'],
    ...scale.map((s) => [`--step-${s.step}`, s.px.toFixed(1), (s.px / 16).toFixed(3)]),
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <Slider label={T.base} bind:value={base} min={13} max={20} unit="px" />
    <Slider
      label={T.ratio}
      bind:value={ratioIndex}
      min={0}
      max={RATIOS.length - 1}
      format={(v) => `${RATIOS[v]} · ${TYPE_RATIOS[RATIOS[v] as keyof typeof TYPE_RATIOS][locale]}`}
    />
  </div>

  <ResponsiveChart title={T.title} desc={T.desc} ratio={2.8} minHeight={190} rows={tableRows}>
    {#snippet children({ width, height })}
      {@const padB = 40}
      {@const padL = 10}
      {@const maxPx = scale[scale.length - 1]!.px}
      {@const x = scaleLinear().domain([0, scale.length]).range([padL, width - 10])}
      {@const bw = (width - padL - 10) / scale.length - 8}
      {@const y = scaleLinear().domain([0, maxPx]).range([height - padB, 20])}

      {#each scale as s, i (s.step)}
        {@const isBody = s.step === 0}
        <rect
          x={x(i)}
          y={y(s.px)}
          width={bw}
          height={height - padB - y(s.px)}
          fill={isBody ? colors.accent : colors.bar}
          opacity={isBody ? 0.95 : 0.6}
          rx="2"
        />
        <text x={x(i) + bw / 2} y={y(s.px) - 5} text-anchor="middle" font-size="9.5" fill={colors.ink}>
          {s.px.toFixed(0)}
        </text>
        <text x={x(i) + bw / 2} y={height - padB + 14} text-anchor="middle" font-size="8.5" fill={colors.ink}>
          {s.step}
        </text>
        {#if i >= 3}
          <text x={x(i) + bw / 2} y={height - padB + 30} text-anchor="middle" font-size="8.5" fill={threeStep >= 1.8 ? colors.good : colors.warn}>
            ×{(s.px / scale[i - 3]!.px).toFixed(2)}
          </text>
        {/if}
      {/each}
      <line x1={padL} y1={height - padB} x2={width - 10} y2={height - padB} stroke={colors.line} />
      <text x={padL} y={12} font-size="9.5" fill={colors.ink}>{locale === 'zh' ? '底部数字 = 与隔两档的比值' : 'Bottom row = ratio to three steps below'}</text>
    {/snippet}
  </ResponsiveChart>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.adjacent}</p>
      <p class="readout__value">×{ratio.toFixed(3)}</p>
      <p class="readout__note">{ratioName}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.two}</p>
      <p class={`readout__value readout__value--${threeStep >= 1.8 && threeStep <= 2.6 ? 'good' : 'warn'}`}>
        ×{threeStep.toFixed(2)}
      </p>
      <p class="readout__note">{T.twoNote}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.largest}</p>
      <p class={`readout__value ${largest > 56 ? 'readout__value--bad' : ''}`}>{largest.toFixed(0)}<span style="font-size:.5em">px</span></p>
      <p class="readout__note">{largest > 56 ? T.tooBig : ''}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.levels}</p>
      <p class={`readout__value ${threeStep >= 1.8 ? 'readout__value--good' : 'readout__value--warn'}`} style="font-size: var(--step--1)">
        {threeStep >= 1.8 ? T.ok : T.weak}
      </p>
    </div>
  </div>

  <div class="ladder">
    <p class="control__label"><span>{T.preview}</span></p>
    {#each [...scale].reverse() as s (s.step)}
      <p class="ladder__row" style={`font-size:${s.px}px`}>
        <span class="ladder__tag">--step-{s.step}</span>
        {T.sample} 4,286
      </p>
    {/each}
  </div>

  <div>
    <p class="control__label" style="margin-block-end: var(--space-2)"><span>{T.css}</span></p>
    <pre class="console">:root {'{'}
{css}
{'}'}</pre>
  </div>

  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .ladder {
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-4);
    overflow-x: auto;
  }
  .ladder__row {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
    line-height: 1.25;
    color: var(--ink-1);
    white-space: nowrap;
    margin-block-start: var(--space-3);
  }
  .ladder__tag {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--ink-4);
    flex: none;
    inline-size: 6.5rem;
  }
</style>
