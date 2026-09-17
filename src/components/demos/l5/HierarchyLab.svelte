<script lang="ts">
  /**
   * 1.3 演示 · 视觉层级实验室
   *
   * 左：真实 DOM 渲染的 KPI 卡片（所以「眯眼测试」可以用 CSS filter: blur 真做）
   * 右：D3 条形图，实时显示每张卡片的视觉重量，并把层级倒挂的条标红
   * 下：Spearman 层级分 —— 与案例四项指标中的「视觉层级分」是同一个函数
   */
  import { scaleLinear, max as d3max } from '@/lib/d3-kit';
  import { cssVar, contrastRatio } from '@/lib/color';
  import { visualWeight, hierarchyScore, inversions, type MetricInput } from '@/lib/layout-metrics';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      chartTitle: '各卡片的视觉重量',
      chartDesc: '按 √面积 × log₂(对比度) × 字重 × 位置权重 计算的视觉重量条形图，红色表示层级倒挂。',
      blur: '眯眼测试（高斯模糊）',
      selected: '正在调整',
      size: '字号档位',
      weight: '字重',
      tone: '文字色阶',
      span: '占据列数',
      score: '视觉层级分',
      inv: '层级倒挂对数',
      preset: '预设',
      pv0: 'stage4：八张一样重',
      pv4: 'stage5：三级层级',
      tones: ['主色 ink-1', '次色 ink-3', '弱色 ink-4'],
      hint: '点击任意卡片再调参数。把模糊拉到 6px 以上：如果还能看出哪张最重要，层级就是成立的。',
      imp: '业务重要度',
      note0: '负分意味着「越重要的东西看起来越轻」—— 这正是 stage0 的状态。',
      note1: '0.7 以上说明视觉响度基本按业务重要度排好了序。',
    },
    en: {
      chartTitle: 'Visual weight per card',
      chartDesc: 'Bar chart of visual weight computed as √area × log₂(contrast) × font weight × position factor; red bars mark hierarchy inversions.',
      blur: 'Squint test (Gaussian blur)',
      selected: 'Editing',
      size: 'Type scale step',
      weight: 'Font weight',
      tone: 'Text tone',
      span: 'Columns spanned',
      score: 'Hierarchy score',
      inv: 'Inverted pairs',
      preset: 'Presets',
      pv0: 'stage4: eight equal cards',
      pv4: 'stage5: three levels',
      tones: ['Primary ink-1', 'Secondary ink-3', 'Muted ink-4'],
      hint: 'Click a card, then adjust. Push the blur past 6px: if you can still tell which card matters most, the hierarchy holds.',
      imp: 'Business importance',
      note0: 'A negative score means the more important a thing is, the lighter it looks — exactly where stage0 sits.',
      note1: 'Above 0.7, visual loudness broadly matches business importance.',
    },
  }[locale]);

  interface Card {
    id: string;
    label: { zh: string; en: string };
    value: string;
    importance: number;
    step: number; // 0..5 → --step-0 .. --step-5
    weight: number;
    tone: 0 | 1 | 2;
    span: number; // 3 | 6 | 12
  }

  const V0: Card[] = [
    { id: 'total', label: { zh: '新生总人数', en: 'Total enrolment' }, value: '4,286', importance: 5, step: 1, weight: 600, tone: 0, span: 3 },
    { id: 'schools', label: { zh: '学院数', en: 'Schools' }, value: '18', importance: 2, step: 1, weight: 600, tone: 0, span: 3 },
    { id: 'gender', label: { zh: '男女比', en: 'Gender ratio' }, value: '1.4 : 1', importance: 3, step: 1, weight: 600, tone: 0, span: 3 },
    { id: 'age', label: { zh: '平均年龄', en: 'Mean age' }, value: '18.3', importance: 1, step: 1, weight: 600, tone: 0, span: 3 },
    { id: 'prov', label: { zh: '生源省份', en: 'Provinces' }, value: '31', importance: 2, step: 1, weight: 600, tone: 0, span: 3 },
    { id: 'rate', label: { zh: '报到率', en: 'Check-in rate' }, value: '98.2%', importance: 4, step: 1, weight: 600, tone: 0, span: 3 },
  ];

  const V4: Card[] = [
    { id: 'total', label: { zh: '新生总人数', en: 'Total enrolment' }, value: '4,286', importance: 5, step: 5, weight: 700, tone: 0, span: 6 },
    { id: 'rate', label: { zh: '报到率', en: 'Check-in rate' }, value: '98.2%', importance: 4, step: 2, weight: 650, tone: 0, span: 6 },
    { id: 'gender', label: { zh: '男女比', en: 'Gender ratio' }, value: '1.4 : 1', importance: 3, step: 2, weight: 650, tone: 0, span: 3 },
    { id: 'schools', label: { zh: '学院数', en: 'Schools' }, value: '18', importance: 2, step: 0, weight: 600, tone: 1, span: 3 },
    { id: 'prov', label: { zh: '生源省份', en: 'Provinces' }, value: '31', importance: 2, step: 0, weight: 600, tone: 1, span: 3 },
    { id: 'age', label: { zh: '平均年龄', en: 'Mean age' }, value: '18.3', importance: 1, step: 0, weight: 600, tone: 2, span: 3 },
  ];

  let cards = $state<Card[]>(structuredClone(V0));
  let selectedId = $state('total');
  let blur = $state(0);

  const selected = $derived(cards.find((c) => c.id === selectedId) ?? cards[0]!);

  function applyPreset(which: 'v0' | 'v4') {
    cards = structuredClone(which === 'v0' ? V0 : V4);
    selectedId = 'total';
  }

  /* ── 取色 + 主题跟随 ──────────────────────────────────────────────── */
  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });
  const colors = $derived.by(() => {
    themeTick;
    return {
      surface: cssVar('--surface-1', '#ffffff'),
      inks: [cssVar('--ink-1', '#0f172a'), cssVar('--ink-3', '#64748b'), cssVar('--ink-4', '#94a3b8')],
      accent: cssVar('--accent', '#2563eb'),
      bad: cssVar('--bad', '#dc2626'),
      line: cssVar('--line-1', '#e2e8f0'),
      ink3: cssVar('--ink-3', '#64748b'),
    };
  });

  /** 音阶档位 → 近似 px（与 tokens.css 的 1.25 音阶一致，用于度量与预览） */
  const STEP_PX = [17, 21, 26, 33, 41, 52];

  /* ── 把卡片参数翻译成 MetricInput，喂给和案例同一套度量函数 ─────────── */
  const metrics = $derived.by((): MetricInput[] => {
    const VW = 1200;
    const VH = 600;
    const colW = VW / 12;
    let cursorX = 0;
    let cursorY = 40;
    let rowH = 0;
    return cards.map((c) => {
      const w = colW * c.span - 16;
      const h = 56 + STEP_PX[c.step]! * 1.1;
      if (cursorX + colW * c.span > VW) {
        cursorX = 0;
        cursorY += rowH + 16;
        rowH = 0;
      }
      const x = cursorX;
      const y = cursorY;
      cursorX += colW * c.span;
      rowH = Math.max(rowH, h);
      return {
        id: c.id,
        width: w,
        height: h,
        cx: x + w / 2,
        cy: y + h / 2,
        vw: VW,
        vh: VH,
        fontWeight: c.weight,
        color: colors.inks[c.tone]!,
        background: colors.surface,
        importance: c.importance,
      };
    });
  });

  const score = $derived(hierarchyScore(metrics));
  const invPairs = $derived(inversions(metrics));
  const invIds = $derived(new Set(invPairs.flat()));
  const scoreTone = $derived(score >= 0.7 ? 'good' : score >= 0.3 ? 'warn' : 'bad');

  const tableRows = $derived([
    [
      locale === 'zh' ? '卡片' : 'Card',
      T.imp,
      locale === 'zh' ? '视觉重量' : 'Visual weight',
      locale === 'zh' ? '对比度' : 'Contrast',
    ],
    ...metrics.map((m, i) => [
      cards[i]!.label[locale],
      String(m.importance),
      visualWeight(m).toFixed(0),
      `${contrastRatio(m.color, m.background).toFixed(1)}:1`,
    ]),
  ]);
</script>

<div class="hier">
  <div class="controls">
    <Slider label={T.blur} bind:value={blur} min={0} max={10} step={0.5} unit="px" />
    <div class="control" style="flex: 0 1 15rem">
      <span class="control__label"><span>{T.preset}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" onclick={() => applyPreset('v0')}>{T.pv0}</button>
        <button class="chip" type="button" onclick={() => applyPreset('v4')}>{T.pv4}</button>
      </div>
    </div>
  </div>

  <div class="hier__split">
    <!-- 左：真实 DOM 卡片 —— 眯眼测试用 CSS filter 真做 -->
    <div class="hier__stage" style={`filter: blur(${blur}px)`}>
      <div class="grid-12" style="--grid-gutter: var(--space-3)">
        {#each cards as card (card.id)}
          <button
            class="kpi"
            class:is-selected={card.id === selectedId && blur === 0}
            style={`grid-column: span ${card.span}; --v-size:${STEP_PX[card.step]}px; --v-weight:${card.weight}; --v-color:${colors.inks[card.tone]}`}
            onclick={() => (selectedId = card.id)}
            type="button"
            aria-pressed={card.id === selectedId}
          >
            <span class="kpi__label">{card.label[locale]}</span>
            <span class="kpi__value">{card.value}</span>
            <span class="kpi__imp" aria-label={`${T.imp} ${card.importance}`}>
              {'★'.repeat(card.importance)}<span class="kpi__imp-dim">{'★'.repeat(5 - card.importance)}</span>
            </span>
          </button>
        {/each}
      </div>
    </div>

    <!-- 右：D3 视觉重量条形图 -->
    <ResponsiveChart
      title={T.chartTitle}
      desc={T.chartDesc}
      ratio={0.95}
      minHeight={260}
      rows={tableRows}
    >
      {#snippet children({ width, height })}
        {@const padL = 96}
        {@const padR = 16}
        {@const padT = 8}
        {@const padB = 8}
        {@const weights = metrics.map(visualWeight)}
        {@const x = scaleLinear().domain([0, d3max(weights) ?? 1]).range([padL, width - padR])}
        {@const bandH = (height - padT - padB) / Math.max(1, cards.length)}
        {#each metrics as m, i (m.id)}
          {@const w = visualWeight(m)}
          {@const y = padT + i * bandH}
          {@const bad = invIds.has(m.id)}
          <rect
            x={padL}
            y={y + bandH * 0.18}
            width={Math.max(1, x(w) - padL)}
            height={bandH * 0.44}
            fill={bad ? colors.bad : colors.accent}
            opacity={m.id === selectedId ? 1 : 0.68}
            rx="2"
          />
          <text x={padL - 8} y={y + bandH * 0.45} text-anchor="end" font-size="11" fill={colors.ink3}>
            {cards[i]!.label[locale]}
          </text>
          <text x={padL - 8} y={y + bandH * 0.72} text-anchor="end" font-size="9.5" fill={colors.ink3} opacity="0.7">
            {T.imp} {m.importance}
          </text>
        {/each}
      {/snippet}
    </ResponsiveChart>
  </div>

  <div class="controls">
    <div class="control" style="flex:0 0 auto">
      <span class="control__label"><span>{T.selected}</span></span>
      <strong style="font-size: var(--step-0)">{selected.label[locale]}</strong>
    </div>
    <Slider label={T.size} bind:value={selected.step} min={0} max={5} format={(v) => `--step-${v} (${STEP_PX[v]}px)`} />
    <Slider label={T.weight} bind:value={selected.weight} min={400} max={800} step={50} />
    <Slider label={T.tone} bind:value={selected.tone} min={0} max={2} format={(v) => T.tones[v] ?? ''} />
    <Slider label={T.span} bind:value={selected.span} min={3} max={12} step={3} format={(v) => `span ${v}`} />
  </div>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.score}</p>
      <p class={`readout__value readout__value--${scoreTone}`}>{score.toFixed(2)}</p>
      <p class="readout__note">{score >= 0.7 ? T.note1 : T.note0}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.inv}</p>
      <p class={`readout__value ${invPairs.length ? 'readout__value--bad' : 'readout__value--good'}`}>
        {invPairs.length}
      </p>
    </div>
  </div>

  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .hier {
    display: grid;
    gap: var(--space-5);
  }
  .hier__split {
    display: grid;
    gap: var(--space-5);
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  }
  @container (max-width: 44rem) {
    .hier__split {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .hier__stage {
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-4);
    transition: filter var(--motion-fast) linear;
    align-self: start;
  }
  .kpi {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    text-align: start;
    padding: var(--space-3) var(--space-4);
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius-sm);
    cursor: pointer;
    min-block-size: 44px;
  }
  .kpi.is-selected {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
  .kpi__label {
    font-size: var(--step--2);
    color: var(--ink-3);
  }
  .kpi__value {
    font-size: var(--v-size);
    font-weight: var(--v-weight);
    color: var(--v-color);
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
  .kpi__imp {
    font-size: 9px;
    color: var(--warn);
    letter-spacing: 1px;
  }
  .kpi__imp-dim {
    opacity: 0.25;
  }
</style>
