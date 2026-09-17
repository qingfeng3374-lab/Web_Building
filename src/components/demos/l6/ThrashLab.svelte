<script lang="ts">
  /**
   * 6.4 演示 · 布局抖动实测
   *
   * 对 N 个真实元素做同一批操作，两种模式各跑一次，用 performance.now() 实测耗时。
   * 这不是模拟 —— 交替读写是真的在强制同步布局，数字是真的。
   */
  import { scaleLinear } from '@/lib/d3-kit';
  import { cssVar } from '@/lib/color';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      count: '元素数量',
      run: '运行两种模式',
      running: '运行中…',
      interleaved: '读写交替',
      batched: '批量读 → 算 → 写',
      title: '实测耗时对比',
      desc: '两种模式在相同元素数量下的实测耗时（毫秒），越低越好。',
      speedup: '提速倍数',
      ms: '毫秒',
      cv: 'content-visibility',
      cvOn: '长列表启用 content-visibility',
      cvNote: '视口外的子树跳过渲染；需配 contain-intrinsic-size 占位',
      hint: '把元素数量从 100 调到 2000，再点运行 —— 两条柱子的差距会从「几乎看不出」变成「一个数量级」。性能 bug 的典型特征就是在小数据集上永远复现不出来。',
      note: '这不是优化技巧，是理解浏览器工作方式之后的自然写法：读会强制布局，写会使布局失效，所以读和写必须分开。',
      notRun: '点「运行」开始实测',
      cvWarn: '注意：视口外内容不渲染，也就可能无法被 Ctrl+F 命中 —— 对长列表是好事，对文档页是灾难。',
    },
    en: {
      count: 'Element count',
      run: 'Run both modes',
      running: 'Running…',
      interleaved: 'Interleaved read/write',
      batched: 'Batched read → compute → write',
      title: 'Measured duration',
      desc: 'Measured duration in milliseconds for both modes at the same element count; lower is better.',
      speedup: 'Speed-up',
      ms: 'ms',
      cv: 'content-visibility',
      cvOn: 'Enable content-visibility on the long list',
      cvNote: 'Off-screen subtrees skip rendering; pair with contain-intrinsic-size to reserve space',
      hint: 'Raise the element count from 100 to 2000 and run again — the gap goes from “barely visible” to “an order of magnitude”. Performance bugs characteristically never reproduce on small datasets.',
      note: 'This is not a trick but the natural way to write once you know how the browser works: reads force layout, writes invalidate it, so reads and writes must be separated.',
      notRun: 'Press Run to measure',
      cvWarn: 'Note: off-screen content is not rendered and may therefore not be findable with Ctrl+F — good for long lists, disastrous for documentation.',
    },
  }[locale]);

  let count = $state(600);
  let running = $state(false);
  let cvOn = $state(false);
  let result = $state<{ interleaved: number; batched: number } | null>(null);

  let bench: HTMLDivElement | undefined = $state();

  async function run() {
    if (!bench) return;
    running = true;
    result = null;
    await new Promise((r) => requestAnimationFrame(r));

    const els = [...bench.querySelectorAll<HTMLElement>('.tl__item')];

    // ── 模式一：读写交替（每次读都强制同步布局） ──
    const t0 = performance.now();
    for (const el of els) {
      const w = el.offsetWidth; // 读 → 强制布局
      el.style.paddingInlineStart = (w % 7) + 'px'; // 写 → 使布局失效
    }
    const t1 = performance.now();

    // 复位，避免第二轮受益于第一轮的缓存状态
    for (const el of els) el.style.paddingInlineStart = '';
    await new Promise((r) => requestAnimationFrame(r));

    // ── 模式二：批量读 → 算 → 批量写 ──
    const t2 = performance.now();
    const widths = els.map((el) => el.offsetWidth); // 只读
    const next = widths.map((w) => (w % 7) + 'px'); // 纯计算
    els.forEach((el, i) => (el.style.paddingInlineStart = next[i]!)); // 只写
    const t3 = performance.now();

    for (const el of els) el.style.paddingInlineStart = '';
    result = { interleaved: t1 - t0, batched: t3 - t2 };
    running = false;
  }

  const speedup = $derived(
    result && result.batched > 0 ? result.interleaved / result.batched : 0,
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
      bad: cssVar('--bad', '#dc2626'),
      good: cssVar('--good', '#059669'),
      ink: cssVar('--ink-3', '#64748b'),
      line: cssVar('--line-1', '#e2e8f0'),
    };
  });

  const tableRows = $derived([
    [locale === 'zh' ? '模式' : 'Mode', T.ms],
    [T.interleaved, result ? result.interleaved.toFixed(1) : '—'],
    [T.batched, result ? result.batched.toFixed(1) : '—'],
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <Slider label={T.count} bind:value={count} min={100} max={2000} step={100} />
    <div class="control" style="flex: 0 1 20rem">
      <span class="control__label"><span>&nbsp;</span></span>
      <div class="cluster" style="--gap: var(--space-2)">
        <button class="btn btn--primary" type="button" onclick={run} disabled={running}>
          {running ? T.running : `▶ ${T.run}`}
        </button>
        <button class="chip" type="button" aria-pressed={cvOn} onclick={() => (cvOn = !cvOn)}>{T.cvOn}</button>
      </div>
    </div>
  </div>

  <ResponsiveChart title={T.title} desc={T.desc} ratio={3} minHeight={140} rows={tableRows}>
    {#snippet children({ width, height })}
      {@const padL = 10}
      {@const padB = 26}
      {@const maxV = result ? Math.max(result.interleaved, result.batched, 1) : 1}
      {@const y = scaleLinear().domain([0, maxV]).range([height - padB, 18])}
      {@const bw = (width - padL * 2) / 2 - 30}
      {#if result}
        {#each [{ v: result.interleaved, label: T.interleaved, c: colors.bad }, { v: result.batched, label: T.batched, c: colors.good }] as b, i (i)}
          <rect x={padL + 20 + i * (bw + 40)} y={y(b.v)} width={bw} height={height - padB - y(b.v)} fill={b.c} opacity="0.85" rx="3" />
          <text x={padL + 20 + i * (bw + 40) + bw / 2} y={y(b.v) - 6} text-anchor="middle" font-size="12" font-weight="700" fill={b.c}>
            {b.v.toFixed(1)} {T.ms}
          </text>
          <text x={padL + 20 + i * (bw + 40) + bw / 2} y={height - 8} text-anchor="middle" font-size="9.5" fill={colors.ink}>
            {b.label}
          </text>
        {/each}
      {:else}
        <text x={width / 2} y={height / 2} text-anchor="middle" font-size="11" fill={colors.ink}>{T.notRun}</text>
      {/if}
      <line x1={padL} y1={height - padB} x2={width - padL} y2={height - padB} stroke={colors.line} />
    {/snippet}
  </ResponsiveChart>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.speedup}</p>
      <p class={`readout__value ${speedup > 2 ? 'readout__value--good' : ''}`}>
        {speedup ? `${speedup.toFixed(1)}×` : '—'}
      </p>
      <p class="readout__note">{count} {locale === 'zh' ? '个元素' : 'elements'}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.cv}</p>
      <p class={`readout__value ${cvOn ? 'readout__value--good' : ''}`} style="font-size: var(--step-0)">
        {cvOn ? 'auto' : 'visible'}
      </p>
      <p class="readout__note">{T.cvNote}</p>
    </div>
  </div>

  <!-- 被测的真实元素（高度受限，滚动可见 content-visibility 的效果） -->
  <div class="tl__bench" class:cv={cvOn} bind:this={bench}>
    {#each Array(count) as _, i (i)}
      <div class="tl__item">{i + 1}</div>
    {/each}
  </div>

  {#if cvOn}<p class="pitfall" style="margin:0">{T.cvWarn}</p>{/if}
  <p class="key-point" style="margin:0">{T.note}</p>
  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .tl__bench {
    max-block-size: 180px;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(3.2rem, 1fr));
    gap: 3px;
    padding: var(--space-3);
    background: var(--surface-0);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
  }
  .tl__bench.cv .tl__item {
    content-visibility: auto;
    contain-intrinsic-size: auto 22px;
  }
  .tl__item {
    background: var(--surface-1);
    border: 1px solid var(--line-1);
    border-radius: 3px;
    font-size: 9.5px;
    color: var(--ink-4);
    text-align: center;
    padding-block: 3px;
    min-block-size: 20px;
  }
</style>
