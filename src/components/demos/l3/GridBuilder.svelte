<script lang="ts">
  /**
   * 2.1 演示 · 网格构造器
   *
   * 四个参数 → D3 实时绘制网格图 + 输出可复制的 CSS + 列宽公式代入结果。
   * 右侧「卡片试放」把随手写的 23.7% 与 span n 并排画出来，量化偏差。
   */
  import { scaleLinear } from '@/lib/d3-kit';
  import { cssVar } from '@/lib/color';
  import { columnWidth, spanWidth } from '@/lib/grid';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      cols: '列数',
      gutter: '水槽 G',
      margin: '外边距 M',
      viewport: '视口宽度 W',
      maxw: '容器最大宽 MAX',
      title: '网格与卡片试放',
      desc: '按当前参数绘制的列轨道，以及 span 3 卡片与随手写的 23.7% 宽度对照。',
      colw: '单列宽度',
      span3: 'span 3 卡片宽',
      magic: '随手写的 23.7%',
      drift: '偏差',
      formula: '代入公式',
      css: '生成的 CSS',
      divisible: '可整除性',
      divHint: '能被以下数整除：',
      hint: '把列数从 12 调到 10 试试：三等分立刻消失，你将无法做出「三卡片一排」的布局。这就是 12 列统治设计系统的原因。',
    },
    en: {
      cols: 'Columns',
      gutter: 'Gutter G',
      margin: 'Margin M',
      viewport: 'Viewport W',
      maxw: 'Container MAX',
      title: 'Grid and card fitting',
      desc: 'Column tracks for the current parameters, with a span-3 card compared against an ad-hoc 23.7% width.',
      colw: 'Column width',
      span3: 'span 3 card',
      magic: 'An ad-hoc 23.7%',
      drift: 'Drift',
      formula: 'Formula, substituted',
      css: 'Generated CSS',
      divisible: 'Divisibility',
      divHint: 'Divides evenly by: ',
      hint: 'Drop the column count from 12 to 10: thirds vanish instantly and “three cards per row” becomes impossible. That is why 12 rules design systems.',
    },
  }[locale]);

  let columns = $state(12);
  let gutter = $state(24);
  let margin = $state(32);
  let viewport = $state(1440);
  let maxw = $state(1440);

  const spec = $derived({ columns, gutter, margin, max: maxw });
  const col = $derived(columnWidth(viewport, spec));
  const span3 = $derived(spanWidth(3, viewport, spec));
  const magicWidth = $derived(Math.min(viewport, maxw) * 0.237);
  const drift = $derived(span3 - magicWidth);

  const divisors = $derived(
    [2, 3, 4, 5, 6].filter((d) => columns % d === 0),
  );

  const css = $derived(
    `.grid {\n` +
      `  display: grid;\n` +
      `  gap: ${gutter}px;\n` +
      `  grid-template-columns: repeat(${columns}, minmax(0, 1fr));\n` +
      `  max-inline-size: ${maxw}px;\n` +
      `  margin-inline: auto;\n` +
      `  padding-inline: ${margin}px;\n` +
      `}`,
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
      track: cssVar('--ch2', '#0891b2'),
      accent: cssVar('--accent', '#2563eb'),
      bad: cssVar('--bad', '#dc2626'),
      ink: cssVar('--ink-3', '#64748b'),
      line: cssVar('--line-2', '#cbd5e1'),
      surface: cssVar('--surface-1', '#fff'),
    };
  });

  const tableRows = $derived([
    [locale === 'zh' ? '量' : 'Quantity', locale === 'zh' ? '值' : 'Value'],
    [T.colw, `${col.toFixed(2)} px`],
    [T.span3, `${span3.toFixed(1)} px`],
    [T.magic, `${magicWidth.toFixed(1)} px`],
    [T.drift, `${drift.toFixed(1)} px`],
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <Slider label={T.cols} bind:value={columns} min={2} max={16} />
    <Slider label={T.gutter} bind:value={gutter} min={0} max={48} step={4} unit="px" />
    <Slider label={T.margin} bind:value={margin} min={0} max={96} step={8} unit="px" />
    <Slider label={T.viewport} bind:value={viewport} min={320} max={1920} step={10} unit="px" />
    <Slider label={T.maxw} bind:value={maxw} min={640} max={1920} step={40} unit="px" />
  </div>

  <ResponsiveChart title={T.title} desc={T.desc} ratio={3.2} minHeight={180} rows={tableRows}>
    {#snippet children({ width, height })}
      {@const page = Math.min(viewport, maxw)}
      {@const s = scaleLinear().domain([0, page]).range([0, width])}
      {@const gridTop = 22}
      {@const gridH = height * 0.32}
      {@const cardTop = gridTop + gridH + 34}
      {@const cardH = height * 0.2}

      <!-- 页面边界 -->
      <rect x="0" y={gridTop - 10} width={width} height={height - gridTop} fill={colors.surface} opacity="0.5" />
      <text x="0" y="12" font-size="10" fill={colors.ink}>W = {viewport}px{viewport > maxw ? ` → MAX ${maxw}px` : ''}</text>

      <!-- 外边距 -->
      <rect x={s(0)} y={gridTop} width={s(margin)} height={gridH} fill={colors.line} opacity="0.35" />
      <rect x={s(page - margin)} y={gridTop} width={s(margin)} height={gridH} fill={colors.line} opacity="0.35" />

      <!-- 列轨道 -->
      {#each Array(columns) as _, i (i)}
        {@const x = margin + i * (col + gutter)}
        <rect x={s(x)} y={gridTop} width={s(col)} height={gridH} fill={colors.track} opacity="0.28" rx="1" />
        {#if columns <= 12}
          <text x={s(x + col / 2)} y={gridTop + gridH / 2 + 3} text-anchor="middle" font-size="9" fill={colors.ink}>
            {i + 1}
          </text>
        {/if}
      {/each}

      <!-- 卡片试放：span 3 vs 23.7% -->
      <text x={s(margin)} y={cardTop - 8} font-size="10" fill={colors.ink}>span 3 = {span3.toFixed(0)}px</text>
      <rect x={s(margin)} y={cardTop} width={s(span3)} height={cardH} fill={colors.accent} opacity="0.55" rx="2" />

      <text x={s(margin)} y={cardTop + cardH + 22} font-size="10" fill={colors.bad}>
        23.7% = {magicWidth.toFixed(0)}px ({drift >= 0 ? '−' : '+'}{Math.abs(drift).toFixed(0)}px)
      </text>
      <rect
        x={s(margin)}
        y={cardTop + cardH + 28}
        width={s(magicWidth)}
        height={cardH * 0.55}
        fill="none"
        stroke={colors.bad}
        stroke-width="1.5"
        stroke-dasharray="4 3"
        rx="2"
      />
    {/snippet}
  </ResponsiveChart>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.colw}</p>
      <p class="readout__value">{col.toFixed(2)}<span style="font-size:.5em">px</span></p>
      <p class="readout__note">
        {T.formula}: ({Math.min(viewport, maxw)} − 2×{margin} − {columns - 1}×{gutter}) / {columns}
      </p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.drift}</p>
      <p class={`readout__value ${Math.abs(drift) > 8 ? 'readout__value--bad' : 'readout__value--good'}`}>
        {drift >= 0 ? '+' : ''}{drift.toFixed(0)}<span style="font-size:.5em">px</span>
      </p>
      <p class="readout__note">span 3 − 23.7%</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.divisible}</p>
      <p class={`readout__value ${divisors.includes(3) && divisors.includes(4) ? 'readout__value--good' : 'readout__value--warn'}`} style="font-size: var(--step-0)">
        {T.divHint}{divisors.join(' · ') || '—'}
      </p>
    </div>
  </div>

  <div>
    <p class="control__label" style="margin-block-end: var(--space-2)"><span>{T.css}</span></p>
    <pre class="console">{css}</pre>
  </div>

  <p class="note" style="margin:0">{T.hint}</p>
</div>
