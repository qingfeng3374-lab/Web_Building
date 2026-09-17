<script lang="ts">
  /**
   * 1.3 演示 · 留白与密度实验室
   *
   * 关键点：三个指标都是**从真实 DOM 量出来的**，不是按公式假装算的。
   *   · 行长(ch) —— 用一把隐藏的「0 字符标尺」量出 1ch 的像素宽，再除文本盒宽度
   *   · 内容占比 —— 行盒总面积 ÷ 卡片总面积（Range.getClientRects 拿到每一行）
   *   · 舒适度 —— measureComfort()，45–75ch 区间为 1，两侧线性衰减
   */
  import { arc } from '@/lib/d3-kit';
  import { cssVar } from '@/lib/color';
  import { measureComfort } from '@/lib/layout-metrics';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      width: '文本容器宽度',
      leading: '行距（微观留白）',
      blockGap: '区块间距（宏观留白）',
      pad: '卡片内边距',
      presets: '密度预设',
      comfortable: '舒适',
      cosy: '适中',
      compact: '紧凑',
      v0: 'stage0 原状',
      measure: '实测行长',
      ratio: '内容像素占比',
      comfort: '阅读舒适度',
      chartTitle: '三项密度指标',
      chartDesc: '行长舒适度、内容占比与行距的实时仪表。',
      zone: '舒适区 45–75ch',
      body: [
        '2025 级新生共 4,286 人，来自 31 个省级行政区，分布在 18 个学院。男女比例为 1.4 比 1，平均年龄 18.3 岁，报到率 98.2%。',
        '从生源结构看，省内生源占 42.7%，较去年下降 3.1 个百分点；中西部省份生源比例上升明显，其中四川、陕西、河南三省合计贡献了 19.4% 的新生。',
        '学科分布方面，工科类专业录取人数占总数的 61.2%，理学类 18.5%，管理与人文社科类合计 20.3%。石油工程、计算机科学与技术两个专业的报到率均为 100%。',
      ],
      hint: '试试「紧凑」预设：卡片内边距和行距都变小了，但区块间距没有等比缩小 —— 这就是 1.3 节说的「压缩必须是各向异性的」。把区块间距也拉到最小，看看分组如何崩坏。',
      warnLong: '行长过长，回扫容易失败',
      warnShort: '行长过短，语块被切碎',
      ok: '在舒适区内',
    },
    en: {
      width: 'Text container width',
      leading: 'Leading (micro whitespace)',
      blockGap: 'Block gap (macro whitespace)',
      pad: 'Card padding',
      presets: 'Density presets',
      comfortable: 'Comfortable',
      cosy: 'Cosy',
      compact: 'Compact',
      v0: 'stage0 as-is',
      measure: 'Measured line length',
      ratio: 'Content pixel ratio',
      comfort: 'Reading comfort',
      chartTitle: 'Three density metrics',
      chartDesc: 'Live gauges for measure comfort, content ratio and leading.',
      zone: 'Comfort zone 45–75ch',
      body: [
        'The 2025 intake totals 4,286 students from 31 provincial regions across 18 schools. The gender ratio is 1.4 to 1, mean age 18.3, and the check-in rate 98.2%.',
        'By origin, 42.7% come from within the province, down 3.1 points year on year; central and western provinces are clearly up, with Sichuan, Shaanxi and Henan together supplying 19.4% of the intake.',
        'By discipline, engineering accounts for 61.2% of admissions, natural sciences 18.5%, and management plus humanities 20.3% combined. Petroleum Engineering and Computer Science both reached a 100% check-in rate.',
      ],
      hint: 'Try the “compact” preset: padding and leading both shrink, but the block gap does not scale down with them — that is the anisotropic compression from §1.3. Now drag the block gap to its minimum and watch the grouping collapse.',
      warnLong: 'Too long — return sweeps start failing',
      warnShort: 'Too short — phrases get chopped',
      ok: 'Inside the comfort zone',
    },
  }[locale]);

  let widthPx = $state(900);
  let leading = $state(1.7);
  let blockGap = $state(24);
  let pad = $state(24);

  function preset(p: 'comfortable' | 'cosy' | 'compact' | 'v0') {
    if (p === 'comfortable') { widthPx = 620; leading = 1.75; blockGap = 32; pad = 32; }
    if (p === 'cosy') { widthPx = 620; leading = 1.6; blockGap = 24; pad = 20; }
    if (p === 'compact') { widthPx = 620; leading = 1.45; blockGap = 24; pad = 12; }
    if (p === 'v0') { widthPx = 1100; leading = 1.2; blockGap = 16; pad = 16; }
  }

  /* ── 真实测量 ─────────────────────────────────────────────────────── */
  let cardEl: HTMLDivElement | undefined = $state();
  let rulerEl: HTMLSpanElement | undefined = $state();

  let measured = $state({ ch: 0, ratio: 0 });

  function remeasure() {
    if (!cardEl || !rulerEl) return;
    const chWidth = rulerEl.getBoundingClientRect().width / 10; // 标尺是 10 个 "0"
    const paras = [...cardEl.querySelectorAll<HTMLParagraphElement>('p')];
    if (!paras.length || chWidth <= 0) return;

    const textWidth = paras[0]!.getBoundingClientRect().width;

    // 内容占比：用 Range 拿到每一行的行盒，累加面积
    let inkArea = 0;
    for (const p of paras) {
      const range = document.createRange();
      range.selectNodeContents(p);
      for (const r of range.getClientRects()) inkArea += r.width * r.height;
      range.detach?.();
    }
    const box = cardEl.getBoundingClientRect();
    measured = {
      ch: textWidth / chWidth,
      ratio: box.width * box.height > 0 ? inkArea / (box.width * box.height) : 0,
    };
  }

  // 参数一变就重新量；用 ResizeObserver 兜住容器自身的尺寸变化
  $effect(() => {
    // 依赖收集：这四个参数任意变化都要重量
    void widthPx;
    void leading;
    void blockGap;
    void pad;
    const id = requestAnimationFrame(remeasure);
    return () => cancelAnimationFrame(id);
  });

  $effect(() => {
    if (!cardEl) return;
    const ro = new ResizeObserver(() => remeasure());
    ro.observe(cardEl);
    return () => ro.disconnect();
  });

  const comfort = $derived(measureComfort(measured.ch));
  const chTone = $derived(measured.ch > 75 ? 'bad' : measured.ch < 45 ? 'warn' : 'good');
  const chNote = $derived(measured.ch > 75 ? T.warnLong : measured.ch < 45 ? T.warnShort : T.ok);

  /* ── 取色 ─────────────────────────────────────────────────────────── */
  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });
  const colors = $derived.by(() => {
    themeTick;
    return {
      track: cssVar('--surface-3', '#e2e8f0'),
      good: cssVar('--good', '#059669'),
      warn: cssVar('--warn', '#d97706'),
      bad: cssVar('--bad', '#dc2626'),
      ink: cssVar('--ink-1', '#0f172a'),
      ink3: cssVar('--ink-3', '#64748b'),
    };
  });

  const gaugeArc = arc<{ start: number; end: number }>()
    .innerRadius(30)
    .outerRadius(42)
    .startAngle((d) => d.start)
    .endAngle((d) => d.end)
    .cornerRadius(6);

  const TAU = Math.PI * 2;
  function toneColor(v: number): string {
    return v >= 0.75 ? colors.good : v >= 0.4 ? colors.warn : colors.bad;
  }

  const gauges = $derived([
    { label: T.comfort, v: comfort, text: `${Math.round(comfort * 100)}%` },
    { label: T.ratio, v: Math.min(1, measured.ratio * 2.2), text: `${(measured.ratio * 100).toFixed(1)}%` },
    { label: T.leading, v: Math.min(1, (leading - 1.1) / 0.75), text: leading.toFixed(2) },
  ]);

  const tableRows = $derived([
    [locale === 'zh' ? '指标' : 'Metric', locale === 'zh' ? '值' : 'Value'],
    [T.measure, `${measured.ch.toFixed(0)} ch`],
    [T.ratio, `${(measured.ratio * 100).toFixed(1)}%`],
    [T.comfort, `${Math.round(comfort * 100)}%`],
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <Slider label={T.width} bind:value={widthPx} min={320} max={1200} step={10} unit="px" />
    <Slider label={T.leading} bind:value={leading} min={1.1} max={2} step={0.05} />
    <Slider label={T.blockGap} bind:value={blockGap} min={4} max={64} step={2} unit="px" />
    <Slider label={T.pad} bind:value={pad} min={0} max={48} step={2} unit="px" />
    <div class="control" style="flex: 0 1 16rem">
      <span class="control__label"><span>{T.presets}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" onclick={() => preset('comfortable')}>{T.comfortable}</button>
        <button class="chip" type="button" onclick={() => preset('cosy')}>{T.cosy}</button>
        <button class="chip" type="button" onclick={() => preset('compact')}>{T.compact}</button>
        <button class="chip" type="button" onclick={() => preset('v0')}>{T.v0}</button>
      </div>
    </div>
  </div>

  <div class="density__split">
    <div class="density__stage">
      <div
        class="density__card"
        bind:this={cardEl}
        style={`--w:${widthPx}px; --lh:${leading}; --gap:${blockGap}px; --pad:${pad}px`}
      >
        <h4>{locale === 'zh' ? '2025 级新生数据摘要' : '2025 intake summary'}</h4>
        {#each T.body as para, i (i)}
          <p>{para}</p>
        {/each}
      </div>
      <!-- 隐藏标尺：10 个 "0"，用于把像素宽换算成 ch -->
      <span class="density__ruler" bind:this={rulerEl} aria-hidden="true">0000000000</span>
    </div>

    <ResponsiveChart title={T.chartTitle} desc={T.chartDesc} ratio={1.5} minHeight={180} rows={tableRows}>
      {#snippet children({ width, height })}
        {@const step = width / gauges.length}
        {#each gauges as g, i (g.label)}
          {@const cx = step * (i + 0.5)}
          {@const cy = height * 0.46}
          <g transform={`translate(${cx},${cy})`}>
            <path d={gaugeArc({ start: 0, end: TAU }) ?? ''} fill={colors.track} opacity="0.5" />
            <path d={gaugeArc({ start: 0, end: TAU * Math.max(0.001, g.v) }) ?? ''} fill={toneColor(g.v)} />
            <text text-anchor="middle" y="5" font-size="14" font-weight="700" fill={colors.ink}>{g.text}</text>
            <text text-anchor="middle" y={64} font-size="10.5" fill={colors.ink3}>{g.label}</text>
          </g>
        {/each}
      {/snippet}
    </ResponsiveChart>
  </div>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.measure}</p>
      <p class={`readout__value readout__value--${chTone}`}>{measured.ch.toFixed(0)} <span style="font-size:.5em">ch</span></p>
      <p class="readout__note">{chNote} · {T.zone}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.ratio}</p>
      <p class="readout__value">{(measured.ratio * 100).toFixed(1)}%</p>
      <p class="readout__note">{locale === 'zh' ? '行盒总面积 ÷ 卡片面积（实测）' : 'Sum of line boxes ÷ card area (measured)'}</p>
    </div>
  </div>

  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .density__split {
    display: grid;
    gap: var(--space-5);
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
    align-items: start;
  }
  @container (max-width: 46rem) {
    .density__split {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .density__stage {
    position: relative;
    overflow-x: auto;
    background: var(--surface-0);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-3);
  }
  .density__card {
    inline-size: var(--w);
    max-inline-size: 100%;
    padding: var(--pad);
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius-sm);
    line-height: var(--lh);
    font-size: var(--step--1);
    color: var(--ink-2);
  }
  .density__card > * + * {
    margin-block-start: var(--gap);
  }
  .density__card h4 {
    font-size: var(--step-0);
  }
  .density__ruler {
    position: absolute;
    visibility: hidden;
    inset-block-start: 0;
    font-size: var(--step--1);
    font-family: inherit;
    white-space: pre;
  }
</style>
