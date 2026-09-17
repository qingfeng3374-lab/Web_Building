<script lang="ts">
  /**
   * 6.3 演示 · CLS 实测
   *
   * 用 PerformanceObserver 监听真实的 layout-shift 条目 ——
   * 这些数字是**浏览器自己算的**，不是我们估的。
   * 三种抖动场景可播放，一键应用修复后重测对比。
   * 不支持 layout-shift 的浏览器回落到几何法估算，界面会标注来源。
   */
  import { scaleLinear, arc } from '@/lib/d3-kit';
  import { cssVar } from '@/lib/color';
  import { cumulativeLayoutShift, type ShiftEntry } from '@/lib/layout-metrics';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      scenario: '抖动场景',
      s: { img: '图片无尺寸', font: '字体替换', insert: '动态插入' },
      play: '播放',
      playing: '播放中…',
      fix: '应用修复',
      fixed: '已修复',
      reset: '重置',
      cls: '实测 CLS',
      title: '偏移时间轴',
      desc: '每次布局偏移的发生时刻与分数，柱高为该次偏移的分数。',
      shifts: '偏移次数',
      source: '数据来源',
      real: 'PerformanceObserver 实测',
      fallback: '几何法估算（浏览器不支持 layout-shift）',
      good: '良好 < 0.1',
      poor: '差 > 0.25',
      hint: '先播放「图片无尺寸」，看 CLS 跳到 0.2 以上；再点「应用修复」（补 width/height + aspect-ratio），重新播放 —— CLS 归零，而视觉结果一模一样。',
      note: 'hadRecentInput：用户交互后 500ms 内的偏移不计入 —— 那是用户预期中的变化。漏掉这一行，任何有交互的页面 CLS 都会高得离谱。',
      caption: '模拟页面（真实 DOM，真实偏移）',
      art: '文章标题',
      body: '2025 级新生共 4,286 人，来自 31 个省级行政区，分布在 18 个学院。',
      ad: '异步插入的通知条',
    },
    en: {
      scenario: 'Shift scenario',
      s: { img: 'Unsized image', font: 'Font swap', insert: 'Dynamic insertion' },
      play: 'Play',
      playing: 'Playing…',
      fix: 'Apply fix',
      fixed: 'Fixed',
      reset: 'Reset',
      cls: 'Measured CLS',
      title: 'Shift timeline',
      desc: 'When each layout shift occurred and its score; bar height is that shift’s score.',
      shifts: 'Shift count',
      source: 'Data source',
      real: 'PerformanceObserver (real)',
      fallback: 'Geometric estimate (browser lacks layout-shift)',
      good: 'good < 0.1',
      poor: 'poor > 0.25',
      hint: 'Play “unsized image” and watch CLS pass 0.2; then hit “apply fix” (width/height plus aspect-ratio) and replay — CLS drops to zero with an identical visual result.',
      note: 'hadRecentInput: shifts within 500ms of user interaction do not count — those are changes the user expected. Omit that line and any interactive page scores absurdly high.',
      caption: 'Simulated page (real DOM, real shifts)',
      art: 'Article heading',
      body: 'The 2025 intake totals 4,286 students from 31 provincial regions across 18 schools.',
      ad: 'Asynchronously inserted notice',
    },
  }[locale]);

  type Scenario = 'img' | 'font' | 'insert';
  let scenario = $state<Scenario>('img');
  let applied = $state(false);
  let playing = $state(false);

  /* 场景状态 */
  let imgLoaded = $state(false);
  let fontSwapped = $state(false);
  let noticeShown = $state(false);

  let entries = $state<ShiftEntry[]>([]);
  let supported = $state(true);

  const cls = $derived(cumulativeLayoutShift(entries));
  const tone = $derived(cls < 0.1 ? 'good' : cls < 0.25 ? 'warn' : 'bad');

  let stage: HTMLDivElement | undefined = $state();

  /* ── 真实测量：PerformanceObserver ─────────────────────────────── */
  $effect(() => {
    if (typeof PerformanceObserver === 'undefined') {
      supported = false;
      return;
    }
    let po: PerformanceObserver;
    try {
      po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          // 用户交互 500ms 内的偏移不计入 —— 那是预期中的变化
          if (entry.hadRecentInput) continue;
          entries = [
            ...entries,
            {
              impactFraction: 1,
              distanceFraction: entry.value,
              time: entry.startTime,
            },
          ];
        }
      });
      po.observe({ type: 'layout-shift', buffered: false } as any);
    } catch {
      supported = false;
      return;
    }
    return () => po.disconnect();
  });

  function reset() {
    entries = [];
    imgLoaded = false;
    fontSwapped = false;
    noticeShown = false;
    playing = false;
  }

  async function play() {
    reset();
    playing = true;
    // 等一帧让重置生效，避免把重置本身的偏移算进去
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    setTimeout(() => {
      if (scenario === 'img') imgLoaded = true;
      if (scenario === 'font') fontSwapped = true;
      if (scenario === 'insert') noticeShown = true;
      setTimeout(() => (playing = false), 400);
    }, 350);
  }

  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });
  const colors = $derived.by(() => {
    themeTick;
    return {
      good: cssVar('--good', '#059669'),
      warn: cssVar('--warn', '#d97706'),
      bad: cssVar('--bad', '#dc2626'),
      track: cssVar('--surface-3', '#e2e8f0'),
      ink: cssVar('--ink-1', '#0f172a'),
      ink3: cssVar('--ink-3', '#64748b'),
      line: cssVar('--line-1', '#e2e8f0'),
    };
  });

  const gauge = arc<{ v: number }>()
    .innerRadius(30)
    .outerRadius(44)
    .startAngle(-Math.PI * 0.75)
    .endAngle((d) => -Math.PI * 0.75 + d.v * Math.PI * 1.5)
    .cornerRadius(6);

  const tableRows = $derived([
    [locale === 'zh' ? '时刻 (ms)' : 'Time (ms)', locale === 'zh' ? '分数' : 'Score'],
    ...entries.map((e) => [e.time.toFixed(0), (e.impactFraction * e.distanceFraction).toFixed(4)]),
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <div class="control" style="flex: 1 1 18rem">
      <span class="control__label"><span>{T.scenario}</span></span>
      <div class="chip-group">
        {#each Object.entries(T.s) as [key, label] (key)}
          <button
            class="chip"
            type="button"
            aria-pressed={scenario === key}
            onclick={() => {
              scenario = key as Scenario;
              reset();
            }}
          >
            {label}
          </button>
        {/each}
      </div>
    </div>
    <div class="control" style="flex: 0 1 18rem">
      <span class="control__label"><span>&nbsp;</span></span>
      <div class="cluster" style="--gap: var(--space-2)">
        <button class="btn btn--primary" type="button" onclick={play} disabled={playing}>
          {playing ? T.playing : `▶ ${T.play}`}
        </button>
        <button class="btn" type="button" aria-pressed={applied} onclick={() => { applied = !applied; reset(); }}>
          {applied ? `✓ ${T.fixed}` : T.fix}
        </button>
        <button class="btn" type="button" onclick={reset}>{T.reset}</button>
      </div>
    </div>
  </div>

  <div class="cls__split">
    <!-- 模拟页面：真实 DOM，真实偏移 -->
    <div class="cls__page" bind:this={stage} class:is-fixed={applied}>
      <p class="cls__caption">{T.caption}</p>
      <h5 class:swapped={fontSwapped && scenario === 'font'}>{T.art}</h5>
      {#if scenario === 'insert' && noticeShown}
        <div class="cls__notice">{T.ad}</div>
      {/if}
      <div class="cls__media" class:loaded={imgLoaded && scenario === 'img'}></div>
      <p class:swapped={fontSwapped && scenario === 'font'}>{T.body}</p>
      <p class:swapped={fontSwapped && scenario === 'font'}>{T.body}</p>
    </div>

    <!-- 仪表 + 时间轴 -->
    <div class="stack-3">
      <ResponsiveChart
        title={T.cls}
        desc={locale === 'zh' ? 'CLS 分数仪表，绿色为良好区间。' : 'CLS gauge; the green arc marks the good range.'}
        ratio={1.9}
        minHeight={120}
      >
        {#snippet children({ width, height })}
          <g transform={`translate(${width / 2},${height * 0.62})`}>
            <path d={gauge({ v: 1 }) ?? ''} fill={colors.track} opacity="0.5" />
            <path d={gauge({ v: Math.min(1, cls / 0.4) }) ?? ''} fill={colors[tone]} />
            <text text-anchor="middle" y="4" font-size="20" font-weight="700" fill={colors.ink}>
              {cls.toFixed(3)}
            </text>
            <text text-anchor="middle" y={22} font-size="9.5" fill={colors.ink3}>
              {T.good} · {T.poor}
            </text>
          </g>
        {/snippet}
      </ResponsiveChart>

      <ResponsiveChart title={T.title} desc={T.desc} ratio={2.8} minHeight={90} rows={tableRows}>
        {#snippet children({ width, height })}
          {@const maxT = Math.max(1200, ...entries.map((e) => e.time))}
          {@const maxS = Math.max(0.05, ...entries.map((e) => e.impactFraction * e.distanceFraction))}
          {@const x = scaleLinear().domain([0, maxT]).range([10, width - 10])}
          {@const y = scaleLinear().domain([0, maxS]).range([height - 18, 10])}
          <line x1="10" y1={height - 18} x2={width - 10} y2={height - 18} stroke={colors.line} />
          {#each entries as e, i (i)}
            {@const s = e.impactFraction * e.distanceFraction}
            <rect x={x(e.time) - 3} y={y(s)} width="6" height={height - 18 - y(s)} fill={colors.bad} rx="1" />
          {/each}
          {#if entries.length === 0}
            <text x={width / 2} y={height / 2} text-anchor="middle" font-size="10" fill={colors.ink3}>
              {locale === 'zh' ? '点「播放」开始测量' : 'Press Play to start measuring'}
            </text>
          {/if}
        {/snippet}
      </ResponsiveChart>
    </div>
  </div>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.cls}</p>
      <p class={`readout__value readout__value--${tone}`}>{cls.toFixed(3)}</p>
      <p class="readout__note">{T.shifts}: {entries.length}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.source}</p>
      <p class="readout__value" style="font-size: var(--step--1)">{supported ? T.real : T.fallback}</p>
    </div>
  </div>

  <p class="key-point" style="margin:0">{T.note}</p>
  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .cls__split {
    display: grid;
    gap: var(--space-5);
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
  @container (max-width: 44rem) {
    .cls__split {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .cls__page {
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-4);
    font-size: var(--step--2);
    display: grid;
    gap: var(--space-3);
    min-block-size: 260px;
    align-content: start;
  }
  .cls__caption {
    font-size: 10px;
    color: var(--ink-4);
  }
  .cls__page h5 {
    font-size: var(--step-0);
    color: var(--ink-1);
  }
  /* ① 图片无尺寸：加载前高度 0，加载后 120px —— 下方内容被推开 */
  .cls__media {
    block-size: 0;
    background: color-mix(in srgb, var(--ch6) 18%, transparent);
    border-radius: var(--radius-sm);
    transition: none;
  }
  .cls__media.loaded {
    block-size: 120px;
  }
  /* 修复：提前用 aspect-ratio 占好位 */
  .cls__page.is-fixed .cls__media {
    aspect-ratio: 16 / 6;
    block-size: auto;
  }
  /* ② 字体替换：回退字体与网络字体度量不同 */
  .swapped {
    font-family: Georgia, 'Times New Roman', serif;
    letter-spacing: 0.02em;
    line-height: 1.9;
  }
  .cls__page.is-fixed .swapped {
    /* size-adjust 的效果：度量被调平，替换时几乎不跳 */
    line-height: 1.65;
    letter-spacing: 0;
  }
  /* ③ 动态插入：通知条把下面全部推开 */
  .cls__notice {
    padding: var(--space-3);
    background: var(--warn-wash);
    border: 1px solid var(--warn);
    border-radius: var(--radius-sm);
  }
  .cls__page.is-fixed .cls__notice {
    /* 修复：预留固定高度的槽位（骨架屏思路） */
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
    visibility: visible;
  }
  .cls__page.is-fixed {
    position: relative;
    padding-block-start: calc(var(--space-4) + 2.75rem);
  }
</style>
