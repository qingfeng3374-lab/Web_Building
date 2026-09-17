<script lang="ts">
  /**
   * 1.1 演示 · 扫视路径实验室
   *
   * 真实计算的部分：
   *   ① 显著性场（salience field）：每个区块按「面积 × 对比度 × 位置权重」产生
   *      一个高斯核，叠加成一张热力图 —— 用 D3 的连续色标渲染。
   *   ② 预测扫视路径：从入口点出发，反复选择「显著性 / (1 + 距离代价)」最大的
   *      未访问区块（带回返抑制），这是注意力模型里最常用的贪心近似。
   *   ③ 命中代价：走到「最重要的那个区块」需要几次注视 —— 本演示的核心指标。
   */
  import { scaleLinear, interpolateRgb, line, curveCatmullRom } from '@/lib/d3-kit';
  import { cssVar } from '@/lib/color';
  import { gutenbergWeight } from '@/lib/layout-metrics';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  /* ── 文案 ─────────────────────────────────────────────────────────── */
  const T = $derived({
    zh: {
      title: '注视热力图与预测扫视路径',
      template: '布局模板',
      density: '首屏信息密度',
      show: '叠加显示',
      heat: '热力图',
      pathL: '扫视路径',
      labels: '区块标签',
      tpl: { article: '长文页（F 型的原产地）', landing: '落地页（Z 型）', dash: '看板 stage4（本案例）' },
      seen: '前 3 次注视看到的',
      cost: '看到最重要信息需要',
      costUnit: '次注视',
      target: '最重要的区块',
      hint: '每加一个等重的区块，视线就多一次无效跳转 —— 这就是「信息密度没有节奏」的代价。',
      good: '很好',
      bad: '太晚了',
      ok: '还行',
      desc: '一张按区块显著性叠加高斯核得到的注视热力图，以及贪心模型预测出的扫视顺序。',
    },
    en: {
      title: 'Attention heat map and predicted scan path',
      template: 'Layout template',
      density: 'Information density',
      show: 'Overlays',
      heat: 'Heat map',
      pathL: 'Scan path',
      labels: 'Block labels',
      tpl: { article: 'Article (home of the F-pattern)', landing: 'Landing page (Z-pattern)', dash: 'Dashboard stage4 (our case)' },
      seen: 'Seen in the first 3 fixations',
      cost: 'Fixations needed to reach the key item',
      costUnit: '',
      target: 'Most important block',
      hint: 'Every extra equally-weighted block costs one more wasted jump — that is the price of density without rhythm.',
      good: 'good',
      bad: 'too late',
      ok: 'so-so',
      desc: 'An attention heat map built by summing per-block Gaussian kernels of salience, plus the scan order predicted by a greedy model.',
    },
  }[locale]);

  /* ── 区块模型 ─────────────────────────────────────────────────────── */
  interface Block {
    id: string;
    label: { zh: string; en: string };
    /** 归一化坐标与尺寸 ∈ [0,1] */
    x: number;
    y: number;
    w: number;
    h: number;
    /** 视觉对比度强度 ∈ [0,1]，模拟字重/颜色/背景带来的显著性 */
    contrast: number;
    /** 业务重要度，5 = 页面存在的理由 */
    importance: number;
  }

  const TEMPLATES: Record<string, Block[]> = {
    article: [
      { id: 'h1', label: { zh: '标题', en: 'Headline' }, x: 0.06, y: 0.06, w: 0.6, h: 0.1, contrast: 0.95, importance: 5 },
      { id: 'lead', label: { zh: '导语', en: 'Lead' }, x: 0.06, y: 0.2, w: 0.6, h: 0.08, contrast: 0.5, importance: 4 },
      { id: 'p1', label: { zh: '正文段', en: 'Body' }, x: 0.06, y: 0.32, w: 0.6, h: 0.14, contrast: 0.3, importance: 3 },
      { id: 'p2', label: { zh: '正文段', en: 'Body' }, x: 0.06, y: 0.5, w: 0.6, h: 0.14, contrast: 0.3, importance: 2 },
      { id: 'p3', label: { zh: '正文段', en: 'Body' }, x: 0.06, y: 0.68, w: 0.6, h: 0.14, contrast: 0.3, importance: 1 },
      { id: 'aside', label: { zh: '侧栏', en: 'Sidebar' }, x: 0.72, y: 0.2, w: 0.22, h: 0.4, contrast: 0.35, importance: 1 },
    ],
    landing: [
      { id: 'logo', label: { zh: '品牌', en: 'Logo' }, x: 0.05, y: 0.05, w: 0.14, h: 0.08, contrast: 0.8, importance: 2 },
      { id: 'nav', label: { zh: '导航', en: 'Nav' }, x: 0.62, y: 0.05, w: 0.33, h: 0.08, contrast: 0.4, importance: 2 },
      { id: 'hero', label: { zh: '主张', en: 'Value prop' }, x: 0.05, y: 0.28, w: 0.5, h: 0.24, contrast: 0.95, importance: 5 },
      { id: 'img', label: { zh: '主图', en: 'Hero image' }, x: 0.6, y: 0.24, w: 0.35, h: 0.34, contrast: 0.7, importance: 3 },
      { id: 'cta', label: { zh: '行动号召', en: 'CTA' }, x: 0.62, y: 0.72, w: 0.24, h: 0.12, contrast: 0.9, importance: 4 },
    ],
    dash: [
      { id: 'title', label: { zh: '页面标题', en: 'Page title' }, x: 0.04, y: 0.04, w: 0.3, h: 0.08, contrast: 0.6, importance: 2 },
      { id: 'filters', label: { zh: '筛选器', en: 'Filters' }, x: 0.38, y: 0.04, w: 0.58, h: 0.08, contrast: 0.45, importance: 3 },
      { id: 'k1', label: { zh: '男女比', en: 'Gender ratio' }, x: 0.04, y: 0.2, w: 0.21, h: 0.16, contrast: 0.55, importance: 1 },
      { id: 'k2', label: { zh: '平均年龄', en: 'Mean age' }, x: 0.28, y: 0.2, w: 0.21, h: 0.16, contrast: 0.55, importance: 1 },
      { id: 'k3', label: { zh: '省份数', en: 'Provinces' }, x: 0.52, y: 0.2, w: 0.21, h: 0.16, contrast: 0.55, importance: 1 },
      { id: 'k4', label: { zh: '学院数', en: 'Schools' }, x: 0.76, y: 0.2, w: 0.2, h: 0.16, contrast: 0.55, importance: 1 },
      { id: 'chart', label: { zh: '趋势图', en: 'Trend chart' }, x: 0.04, y: 0.42, w: 0.6, h: 0.3, contrast: 0.5, importance: 3 },
      { id: 'table', label: { zh: '明细表', en: 'Detail table' }, x: 0.04, y: 0.76, w: 0.6, h: 0.18, contrast: 0.35, importance: 2 },
      { id: 'total', label: { zh: '★ 新生总人数 4,286', en: '★ Total enrolment 4,286' }, x: 0.68, y: 0.62, w: 0.28, h: 0.16, contrast: 0.55, importance: 5 },
      { id: 'misc', label: { zh: '更新时间', en: 'Updated at' }, x: 0.68, y: 0.82, w: 0.28, h: 0.1, contrast: 0.3, importance: 1 },
    ],
  };

  /* ── 交互状态 ─────────────────────────────────────────────────────── */
  let template = $state<'article' | 'landing' | 'dash'>('dash');
  let density = $state(0);
  let showHeat = $state(true);
  let showPath = $state(true);
  let showLabels = $state(true);

  /** 密度滑块加入的「等重填充块」—— 模拟把更多同等响度的信息塞进首屏 */
  const blocks = $derived.by(() => {
    const base = TEMPLATES[template]!;
    if (density === 0) return base;
    const extra: Block[] = [];
    for (let i = 0; i < density; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      extra.push({
        id: `fill-${i}`,
        label: { zh: '附加卡片', en: 'Extra card' },
        x: 0.04 + col * 0.24,
        y: 0.36 + row * 0.1,
        w: 0.2,
        h: 0.07,
        contrast: 0.5,
        importance: 1,
      });
    }
    return [...base, ...extra];
  });

  /* ── ① 显著性 ─────────────────────────────────────────────────────── */
  function salience(b: Block): number {
    const area = Math.sqrt(b.w * b.h);
    const pos = gutenbergWeight(b.x + b.w / 2, b.y + b.h / 2);
    return area * (0.35 + b.contrast) * pos;
  }

  /* ── ② 预测扫视路径（贪心 + 距离代价 + 回返抑制） ──────────────────── */
  const scan = $derived.by(() => {
    const items = blocks.map((b) => ({
      b,
      s: salience(b),
      cx: b.x + b.w / 2,
      cy: b.y + b.h / 2,
    }));
    const visited = new Set<string>();
    const order: typeof items = [];
    // 入口点：LTR 语言的视线起点在左上角外侧
    let px = 0.0;
    let py = 0.0;
    const STEPS = Math.min(items.length, 10);

    for (let step = 0; step < STEPS; step++) {
      let best: (typeof items)[number] | null = null;
      let bestScore = -Infinity;
      for (const it of items) {
        if (visited.has(it.b.id)) continue;
        const d = Math.hypot(it.cx - px, it.cy - py);
        // 距离代价：跳得越远越不划算；0.9 是让「显著性」仍能压过短距离惯性
        const score = it.s / (1 + d * 0.9);
        if (score > bestScore) {
          bestScore = score;
          best = it;
        }
      }
      if (!best) break;
      visited.add(best.b.id);
      order.push(best);
      px = best.cx;
      py = best.cy;
    }
    return order;
  });

  const target = $derived(blocks.reduce((a, b) => (b.importance > a.importance ? b : a), blocks[0]!));
  const hitIndex = $derived(scan.findIndex((s) => s.b.id === target.id));
  const hitCost = $derived(hitIndex < 0 ? scan.length + 1 : hitIndex + 1);
  const hitTone = $derived(hitCost <= 2 ? 'good' : hitCost <= 4 ? 'warn' : 'bad');

  /* ── ③ 热力场：每个区块一个各向异性高斯核，网格上叠加 ──────────────── */
  const GRID_X = 44;
  const GRID_Y = 26;

  const field = $derived.by(() => {
    const cells = new Float64Array(GRID_X * GRID_Y);
    let peak = 0;
    for (let gy = 0; gy < GRID_Y; gy++) {
      for (let gx = 0; gx < GRID_X; gx++) {
        const nx = (gx + 0.5) / GRID_X;
        const ny = (gy + 0.5) / GRID_Y;
        let v = 0;
        for (const b of blocks) {
          const cx = b.x + b.w / 2;
          const cy = b.y + b.h / 2;
          const sx = Math.max(0.05, b.w * 0.75);
          const sy = Math.max(0.05, b.h * 0.75);
          const e = ((nx - cx) / sx) ** 2 + ((ny - cy) / sy) ** 2;
          v += salience(b) * Math.exp(-e * 1.6);
        }
        cells[gy * GRID_X + gx] = v;
        if (v > peak) peak = v;
      }
    }
    return { cells, peak: peak || 1 };
  });

  /* ── 取色：随主题切换自动更新 ────────────────────────────────────── */
  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });

  const colors = $derived.by(() => {
    themeTick;
    return {
      cool: cssVar('--surface-2', '#f1f5f9'),
      warm: cssVar('--ch1', '#7c3aed'),
      hot: cssVar('--bad', '#dc2626'),
      line: cssVar('--line-2', '#cbd5e1'),
      ink: cssVar('--ink-2', '#334155'),
      accent: cssVar('--accent', '#2563eb'),
      surface: cssVar('--surface-1', '#fff'),
    };
  });

  const heatColor = $derived.by(() => {
    const a = interpolateRgb(colors.cool, colors.warm);
    const b = interpolateRgb(colors.warm, colors.hot);
    return (t: number) => (t < 0.6 ? a(t / 0.6) : b((t - 0.6) / 0.4));
  });

  const pathGen = line<[number, number]>()
    .x((d) => d[0])
    .y((d) => d[1])
    .curve(curveCatmullRom.alpha(0.5));

  const tableRows = $derived([
    [locale === 'zh' ? '顺序' : 'Order', locale === 'zh' ? '区块' : 'Block', locale === 'zh' ? '显著性' : 'Salience'],
    ...scan.map((s, i) => [String(i + 1), s.b.label[locale], s.s.toFixed(3)]),
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <div class="control" style="flex: 1 1 14rem">
      <span class="control__label"><span>{T.template}</span></span>
      <div class="chip-group">
        {#each Object.entries(T.tpl) as [key, label] (key)}
          <button
            class="chip"
            type="button"
            aria-pressed={template === key}
            onclick={() => (template = key as typeof template)}
          >
            {label}
          </button>
        {/each}
      </div>
    </div>

    <Slider
      label={T.density}
      bind:value={density}
      min={0}
      max={8}
      unit={locale === 'zh' ? ' 个附加区块' : ' extra blocks'}
    />

    <div class="control" style="flex: 0 1 12rem">
      <span class="control__label"><span>{T.show}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" aria-pressed={showHeat} onclick={() => (showHeat = !showHeat)}>{T.heat}</button>
        <button class="chip" type="button" aria-pressed={showPath} onclick={() => (showPath = !showPath)}>{T.pathL}</button>
        <button class="chip" type="button" aria-pressed={showLabels} onclick={() => (showLabels = !showLabels)}>{T.labels}</button>
      </div>
    </div>
  </div>

  <ResponsiveChart title={T.title} desc={T.desc} ratio={16 / 9.6} minHeight={260} rows={tableRows}>
    {#snippet children({ width, height })}
      {@const cw = width / GRID_X}
      {@const chh = height / GRID_Y}

      <!-- 页面底 -->
      <rect x="0" y="0" {width} {height} fill={colors.surface} />

      <!-- ① 热力场 -->
      {#if showHeat}
        <g opacity="0.85">
          {#each Array(GRID_Y) as _, gy (gy)}
            {#each Array(GRID_X) as _, gx (gx)}
              {@const v = field.cells[gy * GRID_X + gx]! / field.peak}
              {#if v > 0.04}
                <rect
                  x={gx * cw}
                  y={gy * chh}
                  width={cw + 0.6}
                  height={chh + 0.6}
                  fill={heatColor(Math.min(1, v))}
                  opacity={0.18 + v * 0.55}
                />
              {/if}
            {/each}
          {/each}
        </g>
      {/if}

      <!-- 区块轮廓 -->
      <g>
        {#each blocks as b (b.id)}
          {@const isTarget = b.id === target.id}
          <rect
            x={b.x * width}
            y={b.y * height}
            width={b.w * width}
            height={b.h * height}
            fill="none"
            stroke={isTarget ? colors.accent : colors.line}
            stroke-width={isTarget ? 2.5 : 1}
            stroke-dasharray={isTarget ? undefined : '3 3'}
            rx="3"
          />
          {#if showLabels}
            <text
              x={b.x * width + 6}
              y={b.y * height + 14}
              font-size="10.5"
              fill={isTarget ? colors.accent : colors.ink}
              font-weight={isTarget ? 700 : 500}
            >
              {b.label[locale]}
            </text>
          {/if}
        {/each}
      </g>

      <!-- ② 扫视路径 -->
      {#if showPath}
        {@const pts = scan.map((s) => [s.cx * width, s.cy * height] as [number, number])}
        <path
          d={pathGen(pts) ?? ''}
          fill="none"
          stroke={colors.ink}
          stroke-width="2"
          stroke-linecap="round"
          opacity="0.55"
          stroke-dasharray="6 4"
        />
        {#each scan as s, i (s.b.id)}
          <g>
            <circle
              cx={s.cx * width}
              cy={s.cy * height}
              r={13 - Math.min(6, i)}
              fill={s.b.id === target.id ? colors.accent : colors.ink}
              opacity={0.9 - i * 0.05}
            />
            <text
              x={s.cx * width}
              y={s.cy * height + 4}
              text-anchor="middle"
              font-size="11"
              font-weight="700"
              fill={colors.surface}
            >
              {i + 1}
            </text>
          </g>
        {/each}
      {/if}
    {/snippet}
  </ResponsiveChart>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.cost}</p>
      <p class={`readout__value readout__value--${hitTone}`}>
        {hitCost}
        <span style="font-size:.6em">{T.costUnit}</span>
      </p>
      <p class="readout__note">
        {hitTone === 'good' ? T.good : hitTone === 'warn' ? T.ok : T.bad}
      </p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.target}</p>
      <p class="readout__value" style="font-size: var(--step-0)">{target.label[locale]}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.seen}</p>
      <p class="readout__value" style="font-size: var(--step--1); font-weight:600">
        {scan.slice(0, 3).map((s) => s.b.label[locale]).join(locale === 'zh' ? '、' : ', ')}
      </p>
    </div>
  </div>

  <p class="note" style="margin:0">{T.hint}</p>
</div>
