<script lang="ts">
  /**
   * 4.2 演示 · clamp() 折线绘图仪
   *
   * 全站最「数学」的一个演示：把 clamp 的三段折线完整画出来，
   * 标注两个拐点与中段斜率，并对照纯 vw 写法在用户放大字号时的失效。
   */
  import { scaleLinear, line as d3line, range } from '@/lib/d3-kit';
  import { cssVar } from '@/lib/color';
  import { fluid, fluidSlope, fluidIntercept, fluidValueAt } from '@/lib/fluid';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      minPx: '最小字号',
      maxPx: '最大字号',
      vwMin: '最小视口锚点',
      vwMax: '最大视口锚点',
      viewport: '当前视口',
      rootSize: '用户浏览器默认字号',
      title: 'fontSize(viewport) 折线',
      desc: 'clamp 的三段折线：恒定段、线性段、恒定段；圆点是当前视口下的取值。',
      slope: '中段斜率 k',
      intercept: '截距 b',
      current: '当前取值',
      css: '生成的 CSS',
      compare: '与纯 vw 写法对比',
      remWay: 'rem + vw（本站写法）',
      vwWay: '纯 vw（错误写法）',
      atRoot: '用户把默认字号调到',
      unchanged: '完全不变（违反 WCAG 1.4.4）',
      scaled: '跟着放大',
      hint: '把「用户浏览器默认字号」从 16 拖到 24 —— 左边的值跟着变大，右边纹丝不动。这就是为什么 clamp 的常数项必须用 rem。',
      note: 'k = (MAX − MIN) / (vwMax − vwMin)，b = MIN − k·vwMin。PREFERRED = b + k·100vw。就这么两行初中数学。',
    },
    en: {
      minPx: 'Minimum size',
      maxPx: 'Maximum size',
      vwMin: 'Lower viewport anchor',
      vwMax: 'Upper viewport anchor',
      viewport: 'Current viewport',
      rootSize: 'User’s browser default size',
      title: 'fontSize(viewport) polyline',
      desc: 'The three parts of a clamp: constant, linear, constant. The dot marks the value at the current viewport.',
      slope: 'Slope k',
      intercept: 'Intercept b',
      current: 'Current value',
      css: 'Generated CSS',
      compare: 'Against a pure-vw version',
      remWay: 'rem + vw (this site)',
      vwWay: 'Pure vw (wrong)',
      atRoot: 'User sets default size to',
      unchanged: 'completely unchanged (violates WCAG 1.4.4)',
      scaled: 'scales with it',
      hint: 'Drag “user’s browser default size” from 16 to 24 — the left value grows and the right one does not move. That is why the constant term of a clamp must be in rem.',
      note: 'k = (MAX − MIN) / (vwMax − vwMin), b = MIN − k·vwMin, PREFERRED = b + k·100vw. Two lines of school algebra.',
    },
  }[locale]);

  let minPx = $state(15);
  let maxPx = $state(17);
  let vwMin = $state(360);
  let vwMax = $state(1400);
  let viewport = $state(900);
  let rootSize = $state(16);

  const spec = $derived({ minPx, maxPx, vwMin, vwMax });
  const k = $derived(fluidSlope(spec));
  const b = $derived(fluidIntercept(spec));
  const current = $derived(fluidValueAt(viewport, spec));
  const css = $derived(fluid(minPx, maxPx, vwMin, vwMax));

  /** rem+vw 写法在用户改根字号后的实际值：rem 项按比例放大，vw 项不变 */
  const remWayAt = $derived.by(() => {
    const scale = rootSize / 16;
    const raw = b * scale + k * viewport;
    return Math.min(maxPx * scale, Math.max(minPx * scale, raw));
  });
  /** 纯 px/vw 写法：三个值都与根字号无关 */
  const vwWayAt = $derived(current);

  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });
  const colors = $derived.by(() => {
    themeTick;
    return {
      curve: cssVar('--ch4', '#d97706'),
      guide: cssVar('--line-2', '#cbd5e1'),
      ink: cssVar('--ink-3', '#64748b'),
      accent: cssVar('--accent', '#2563eb'),
      bad: cssVar('--bad', '#dc2626'),
      good: cssVar('--good', '#059669'),
      line: cssVar('--line-1', '#e2e8f0'),
    };
  });

  const XS = range(280, 2001, 10);
  const tableRows = $derived([
    [locale === 'zh' ? '视口' : 'Viewport', locale === 'zh' ? '字号' : 'Size'],
    ...[320, 480, 768, 1024, 1440, 1920].map((v) => [`${v} px`, `${fluidValueAt(v, spec).toFixed(2)} px`]),
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <Slider label={T.minPx} bind:value={minPx} min={10} max={40} step={0.5} unit="px" />
    <Slider label={T.maxPx} bind:value={maxPx} min={12} max={80} step={0.5} unit="px" />
    <Slider label={T.vwMin} bind:value={vwMin} min={280} max={800} step={10} unit="px" />
    <Slider label={T.vwMax} bind:value={vwMax} min={900} max={2000} step={20} unit="px" />
    <Slider label={T.viewport} bind:value={viewport} min={280} max={2000} step={10} unit="px" />
  </div>

  <ResponsiveChart title={T.title} desc={T.desc} ratio={2.2} minHeight={230} rows={tableRows}>
    {#snippet children({ width, height })}
      {@const padL = 46}
      {@const padR = 18}
      {@const padT = 18}
      {@const padB = 28}
      {@const yMax = Math.max(maxPx * 1.25, 20)}
      {@const x = scaleLinear().domain([280, 2000]).range([padL, width - padR])}
      {@const y = scaleLinear().domain([0, yMax]).range([height - padB, padT])}
      {@const curve =
        d3line<number>()
          .x((v) => x(v))
          .y((v) => y(fluidValueAt(v, spec)))(XS) ?? ''}

      <!-- 网格线 -->
      {#each [0, 10, 20, 30, 40, 50, 60] .filter((t) => t <= yMax) as t (t)}
        <line x1={padL} y1={y(t)} x2={width - padR} y2={y(t)} stroke={colors.line} />
        <text x={padL - 6} y={y(t) + 3} text-anchor="end" font-size="9" fill={colors.ink}>{t}</text>
      {/each}
      {#each [320, 768, 1024, 1440, 1920] as t (t)}
        <line x1={x(t)} y1={padT} x2={x(t)} y2={height - padB} stroke={colors.line} stroke-dasharray="2 4" />
        <text x={x(t)} y={height - 10} text-anchor="middle" font-size="9" fill={colors.ink}>{t}</text>
      {/each}

      <!-- MIN / MAX 水平参考 -->
      <line x1={padL} y1={y(minPx)} x2={width - padR} y2={y(minPx)} stroke={colors.guide} stroke-dasharray="5 4" />
      <line x1={padL} y1={y(maxPx)} x2={width - padR} y2={y(maxPx)} stroke={colors.guide} stroke-dasharray="5 4" />
      <text x={width - padR} y={y(minPx) - 4} text-anchor="end" font-size="9" fill={colors.ink}>MIN {minPx}px</text>
      <text x={width - padR} y={y(maxPx) - 4} text-anchor="end" font-size="9" fill={colors.ink}>MAX {maxPx}px</text>

      <!-- 三段折线 -->
      <path d={curve} fill="none" stroke={colors.curve} stroke-width="2.8" />

      <!-- 两个拐点 -->
      <circle cx={x(vwMin)} cy={y(minPx)} r="4.5" fill={colors.curve} />
      <circle cx={x(vwMax)} cy={y(maxPx)} r="4.5" fill={colors.curve} />
      <text x={x(vwMin)} y={y(minPx) + 16} text-anchor="middle" font-size="9" fill={colors.curve}>
        ({vwMin}, {minPx})
      </text>
      <text x={x(vwMax)} y={y(maxPx) - 10} text-anchor="middle" font-size="9" fill={colors.curve}>
        ({vwMax}, {maxPx})
      </text>

      <!-- 当前视口指针 -->
      <line x1={x(viewport)} y1={padT} x2={x(viewport)} y2={height - padB} stroke={colors.accent} stroke-width="1.5" opacity="0.7" />
      <circle cx={x(viewport)} cy={y(current)} r="5.5" fill={colors.accent} />
      <text x={x(viewport) + 7} y={y(current) - 7} font-size="10" font-weight="700" fill={colors.accent}>
        {current.toFixed(2)}px
      </text>
    {/snippet}
  </ResponsiveChart>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.slope}</p>
      <p class="readout__value">{(k * 100).toFixed(3)}<span style="font-size:.5em">vw</span></p>
      <p class="readout__note">k = ({maxPx} − {minPx}) / ({vwMax} − {vwMin})</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.intercept}</p>
      <p class="readout__value">{(b / 16).toFixed(3)}<span style="font-size:.5em">rem</span></p>
      <p class="readout__note">b = {minPx} − k×{vwMin} = {b.toFixed(2)}px</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.current}</p>
      <p class="readout__value readout__value--good">{current.toFixed(2)}<span style="font-size:.5em">px</span></p>
      <p class="readout__note">@ {viewport}px</p>
    </div>
  </div>

  <div>
    <p class="control__label" style="margin-block-end: var(--space-2)"><span>{T.css}</span></p>
    <pre class="console">font-size: {css};</pre>
  </div>

  <!-- 可达性对照 -->
  <div class="cp__a11y">
    <div class="controls" style="margin:0">
      <Slider label={T.rootSize} bind:value={rootSize} min={16} max={32} unit="px" />
    </div>
    <p class="control__label" style="margin-block: var(--space-3) var(--space-2)"><span>{T.compare}</span></p>
    <div class="cp__cmp">
      <div class="cp__cell cp__cell--good">
        <p class="readout__label">{T.remWay}</p>
        <p style={`font-size:${remWayAt}px; line-height:1.2; color:var(--ink-1); font-weight:600`}>
          {locale === 'zh' ? '新生总人数 4,286' : 'Total enrolment 4,286'}
        </p>
        <p class="readout__note">
          {T.atRoot} {rootSize}px → {remWayAt.toFixed(1)}px · <strong style="color:var(--good)">{T.scaled}</strong>
        </p>
      </div>
      <div class="cp__cell cp__cell--bad">
        <p class="readout__label">{T.vwWay}</p>
        <p style={`font-size:${vwWayAt}px; line-height:1.2; color:var(--ink-1); font-weight:600`}>
          {locale === 'zh' ? '新生总人数 4,286' : 'Total enrolment 4,286'}
        </p>
        <p class="readout__note">
          {T.atRoot} {rootSize}px → {vwWayAt.toFixed(1)}px · <strong style="color:var(--bad)">{T.unchanged}</strong>
        </p>
      </div>
    </div>
  </div>

  <p class="key-point" style="margin:0">{T.note}</p>
  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .cp__a11y {
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-4);
  }
  .cp__cmp {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  }
  .cp__cell {
    padding: var(--space-4);
    border-radius: var(--radius);
    border: var(--hairline) solid var(--line-1);
    min-block-size: 8rem;
  }
  .cp__cell--good {
    background: var(--good-wash);
    border-color: color-mix(in srgb, var(--good) 40%, var(--line-1));
  }
  .cp__cell--bad {
    background: var(--bad-wash);
    border-color: color-mix(in srgb, var(--bad) 40%, var(--line-1));
  }
</style>
