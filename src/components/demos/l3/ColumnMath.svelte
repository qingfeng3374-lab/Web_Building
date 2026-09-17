<script lang="ts">
  /**
   * 2.2 演示 · 列宽函数与内容断点
   *
   * D3 画出三条曲线：单列宽、span 3 宽、span 6 宽 随视口宽度的变化，
   * 并把「内容最小需求宽度」画成横线 —— 两线交点就是**内容断点**。
   * 这条交点线正是第 4.1 节要讲的东西，在这里先用数学的方式遇见它。
   */
  import { scaleLinear, line as d3line, curveLinear, range } from '@/lib/d3-kit';
  import { cssVar } from '@/lib/color';
  import { columnWidth, spanWidth, contentBreakpoint, spanFor } from '@/lib/grid';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      viewport: '当前视口',
      need: '内容最小需求宽度',
      gutter: '水槽',
      margin: '外边距',
      title: '列宽随视口宽度的变化',
      desc: '单列、span 3、span 6 的宽度曲线，以及内容最小需求宽度所决定的内容断点。',
      col: '单列',
      bp: '内容断点',
      bpNote: '低于此宽度，span 3 装不下内容',
      need3: 'span 3 当前宽度',
      should: '此宽度下应跨',
      cols: '列',
      presets: '内容预设',
      p: { label: '最长学院名 247px', chart: '折线图最小 320px', kpi: 'KPI 数字 120px', table: '数据表 560px' },
      hint: '把「内容最小需求宽度」调到 247（案例里最长的学院名），再看内容断点 —— 它落在 1024px 附近，正是这张表开始横向溢出的宽度。这个数字不是猜的，是算出来的。',
      fits: '装得下',
      clipped: '会被截断',
    },
    en: {
      viewport: 'Current viewport',
      need: 'Minimum content width',
      gutter: 'Gutter',
      margin: 'Margin',
      title: 'Column width as a function of viewport width',
      desc: 'Width curves for one column, span 3 and span 6, plus the content breakpoint implied by the minimum content width.',
      col: 'One column',
      bp: 'Content breakpoint',
      bpNote: 'Below this width, span 3 cannot hold the content',
      need3: 'span 3 at this width',
      should: 'At this width it should span',
      cols: ' columns',
      presets: 'Content presets',
      p: { label: 'Longest school name 247px', chart: 'Line chart min 320px', kpi: 'KPI number 120px', table: 'Data table 560px' },
      hint: 'Set the minimum content width to 247 (the longest school name in the case) and read off the content breakpoint — it lands near 1024px, exactly where that table starts to overflow. That number was computed, not guessed.',
      fits: 'fits',
      clipped: 'gets clipped',
    },
  }[locale]);

  let viewport = $state(1024);
  let need = $state(247);
  let gutter = $state(24);
  let margin = $state(32);

  const spec = $derived({ columns: 12, gutter, margin, max: 1440 });
  const bp = $derived(contentBreakpoint(3, need, spec));
  const current3 = $derived(spanWidth(3, viewport, spec));
  const shouldSpan = $derived(spanFor(need, viewport, spec));
  const fits = $derived(current3 >= need);

  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });
  const colors = $derived.by(() => {
    themeTick;
    return {
      c1: cssVar('--ink-4', '#94a3b8'),
      c3: cssVar('--accent', '#2563eb'),
      c6: cssVar('--ch2', '#0891b2'),
      need: cssVar('--bad', '#dc2626'),
      ink: cssVar('--ink-3', '#64748b'),
      line: cssVar('--line-1', '#e2e8f0'),
    };
  });

  const XS = range(320, 1921, 20);
  const tableRows = $derived([
    [locale === 'zh' ? '量' : 'Quantity', locale === 'zh' ? '值' : 'Value'],
    [T.need3, `${current3.toFixed(0)} px`],
    [T.need, `${need} px`],
    [T.bp, bp === Infinity ? '—' : `${bp} px`],
    [T.should, `${shouldSpan}`],
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <Slider label={T.viewport} bind:value={viewport} min={320} max={1920} step={10} unit="px" />
    <Slider label={T.need} bind:value={need} min={80} max={700} step={1} unit="px" />
    <Slider label={T.gutter} bind:value={gutter} min={0} max={48} step={4} unit="px" />
    <Slider label={T.margin} bind:value={margin} min={0} max={96} step={8} unit="px" />
    <div class="control" style="flex: 0 1 18rem">
      <span class="control__label"><span>{T.presets}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" onclick={() => (need = 247)}>{T.p.label}</button>
        <button class="chip" type="button" onclick={() => (need = 320)}>{T.p.chart}</button>
        <button class="chip" type="button" onclick={() => (need = 120)}>{T.p.kpi}</button>
        <button class="chip" type="button" onclick={() => (need = 560)}>{T.p.table}</button>
      </div>
    </div>
  </div>

  <ResponsiveChart title={T.title} desc={T.desc} ratio={2.3} minHeight={230} rows={tableRows}>
    {#snippet children({ width, height })}
      {@const padL = 44}
      {@const padR = 16}
      {@const padT = 14}
      {@const padB = 30}
      {@const x = scaleLinear().domain([320, 1920]).range([padL, width - padR])}
      {@const y = scaleLinear().domain([0, 760]).range([height - padB, padT])}
      {@const mk = (k: number) =>
        d3line<number>()
          .x((v) => x(v))
          .y((v) => y(spanWidth(k, v, spec)))
          .curve(curveLinear)(XS) ?? ''}

      <!-- 坐标轴 -->
      {#each [0, 200, 400, 600] as t (t)}
        <line x1={padL} y1={y(t)} x2={width - padR} y2={y(t)} stroke={colors.line} stroke-width="1" />
        <text x={padL - 6} y={y(t) + 3} text-anchor="end" font-size="9" fill={colors.ink}>{t}</text>
      {/each}
      {#each [320, 768, 1024, 1440, 1920] as t (t)}
        <text x={x(t)} y={height - 10} text-anchor="middle" font-size="9" fill={colors.ink}>{t}</text>
        <line x1={x(t)} y1={padT} x2={x(t)} y2={height - padB} stroke={colors.line} stroke-width="1" stroke-dasharray="2 4" />
      {/each}

      <!-- 三条列宽曲线 -->
      <path d={mk(1)} fill="none" stroke={colors.c1} stroke-width="1.8" />
      <path d={mk(3)} fill="none" stroke={colors.c3} stroke-width="2.6" />
      <path d={mk(6)} fill="none" stroke={colors.c6} stroke-width="1.8" />
      <text x={width - padR - 4} y={y(spanWidth(1, 1920, spec)) - 5} text-anchor="end" font-size="9.5" fill={colors.c1}>{T.col}</text>
      <text x={width - padR - 4} y={y(spanWidth(3, 1920, spec)) - 5} text-anchor="end" font-size="9.5" fill={colors.c3}>span 3</text>
      <text x={width - padR - 4} y={y(spanWidth(6, 1920, spec)) - 5} text-anchor="end" font-size="9.5" fill={colors.c6}>span 6</text>

      <!-- 内容最小需求线 -->
      <line x1={padL} y1={y(need)} x2={width - padR} y2={y(need)} stroke={colors.need} stroke-width="1.8" stroke-dasharray="6 4" />
      <text x={padL + 4} y={y(need) - 5} font-size="9.5" fill={colors.need}>{T.need} {need}px</text>

      <!-- 内容断点 -->
      {#if bp !== Infinity && bp >= 320 && bp <= 1920}
        <line x1={x(bp)} y1={padT} x2={x(bp)} y2={height - padB} stroke={colors.need} stroke-width="2" />
        <circle cx={x(bp)} cy={y(need)} r="4.5" fill={colors.need} />
        <text x={x(bp) + 6} y={padT + 12} font-size="10" font-weight="700" fill={colors.need}>{T.bp} {bp}px</text>
      {/if}

      <!-- 当前视口指针 -->
      <line x1={x(viewport)} y1={padT} x2={x(viewport)} y2={height - padB} stroke={colors.c3} stroke-width="1.5" opacity="0.6" />
      <circle cx={x(viewport)} cy={y(current3)} r="5" fill={colors.c3} />
    {/snippet}
  </ResponsiveChart>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.need3}</p>
      <p class={`readout__value readout__value--${fits ? 'good' : 'bad'}`}>
        {current3.toFixed(0)}<span style="font-size:.5em">px</span>
      </p>
      <p class="readout__note">{fits ? T.fits : T.clipped}（{T.need} {need}px）</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.bp}</p>
      <p class="readout__value readout__value--warn">{bp === Infinity ? '—' : bp}<span style="font-size:.5em">px</span></p>
      <p class="readout__note">{T.bpNote}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.should}</p>
      <p class="readout__value">{shouldSpan}<span style="font-size:.5em">{T.cols}</span></p>
    </div>
  </div>

  <p class="note" style="margin:0">{T.hint}</p>
</div>
