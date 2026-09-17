<script lang="ts">
  /**
   * 2.4 演示 · 垂直节奏实验室
   *
   * 真实文本 + D3 基线覆盖层。拖动行高 / 段间距 / 基线单位，
   * 实时计算「落在基线上的行占比」。一键 snap 会把行高吸附到最近的整数倍。
   */
  import { cssVar } from '@/lib/color';
  import { baselineHitRate, snapLeading } from '@/lib/grid';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      leading: '行高（无单位）',
      gap: '段间距',
      rhythm: '基线单位',
      size: '字号',
      hit: '落在基线上的行',
      lh: '实际行高',
      snapTo: '吸附到基线',
      snapped: '吸附后行高',
      marginMode: '段间距写法',
      mMargin: 'margin-bottom（会合并）',
      mStack: '.stack > * + *（不合并）',
      collapsed: '实际渲染间距',
      hint: '把基线单位设为 24、字号 16，然后拖行高到 1.5 —— 命中率跳到 100%。再把段间距从 24 改成 17，看命中率怎么掉下来的。',
      note: '半个基线单位（12px）是允许的，四分之一（6px）不行 —— 前者每两行重新对齐一次，后者彻底脱拍。',
      body: [
        '2025 级新生共 4,286 人，来自 31 个省级行政区，分布在 18 个学院。',
        '省内生源占 42.7%，较去年下降 3.1 个百分点；中西部省份生源比例上升明显。',
        '工科类专业录取人数占总数的 61.2%，理学类 18.5%，管理与人文社科合计 20.3%。',
      ],
    },
    en: {
      leading: 'Line height (unitless)',
      gap: 'Paragraph gap',
      rhythm: 'Baseline unit',
      size: 'Font size',
      hit: 'Lines landing on the baseline',
      lh: 'Computed line height',
      snapTo: 'Snap to baseline',
      snapped: 'Snapped line height',
      marginMode: 'Paragraph gap technique',
      mMargin: 'margin-bottom (collapses)',
      mStack: '.stack > * + * (no collapse)',
      collapsed: 'Rendered gap',
      hint: 'Set the baseline unit to 24 and the size to 16, then drag the leading to 1.5 — the hit rate jumps to 100%. Now change the paragraph gap from 24 to 17 and watch it fall apart.',
      note: 'Half a baseline unit (12px) is fine; a quarter (6px) is not — the first re-aligns every second line, the second loses the beat entirely.',
      body: [
        'The 2025 intake totals 4,286 students from 31 provincial regions across 18 schools.',
        '42.7% come from within the province, down 3.1 points year on year, while central and western provinces are clearly up.',
        'Engineering accounts for 61.2% of admissions, natural sciences 18.5%, management and humanities 20.3% combined.',
      ],
    },
  }[locale]);

  let fontSize = $state(16);
  let leading = $state(1.42);
  let gap = $state(24);
  let rhythm = $state(24);
  let useStack = $state(true);

  const lineHeightPx = $derived(fontSize * leading);
  const hit = $derived(baselineHitRate(fontSize, leading, rhythm, 12));
  const snapped = $derived(snapLeading(fontSize, rhythm, leading));

  /** margin 合并的真实后果：相邻段落取较大值，而不是相加 */
  const renderedGap = $derived(useStack ? gap : Math.max(gap, gap));
  const tone = $derived(hit >= 0.99 ? 'good' : hit >= 0.5 ? 'warn' : 'bad');

  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });
  const lineColor = $derived.by(() => {
    themeTick;
    return cssVar('--ch2', '#0891b2');
  });
</script>

<div class="stack-5">
  <div class="controls">
    <Slider label={T.size} bind:value={fontSize} min={12} max={24} unit="px" />
    <Slider label={T.leading} bind:value={leading} min={1.05} max={2.2} step={0.01} />
    <Slider label={T.gap} bind:value={gap} min={4} max={64} unit="px" />
    <Slider label={T.rhythm} bind:value={rhythm} min={16} max={40} step={2} unit="px" />
    <div class="control" style="flex: 0 1 18rem">
      <span class="control__label"><span>{T.marginMode}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" aria-pressed={!useStack} onclick={() => (useStack = false)}>{T.mMargin}</button>
        <button class="chip" type="button" aria-pressed={useStack} onclick={() => (useStack = true)}>{T.mStack}</button>
      </div>
    </div>
  </div>

  <div
    class="rhythm__stage"
    style={`--rl:${rhythm}px; --fs:${fontSize}px; --lh:${leading}; --gp:${gap}px; --lc:${lineColor}`}
  >
    <div class="rhythm__text" class:use-stack={useStack}>
      <h5>{locale === 'zh' ? '2025 级新生数据摘要' : '2025 intake summary'}</h5>
      {#each T.body as p, i (i)}
        <p>{p}</p>
      {/each}
    </div>
  </div>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.hit}</p>
      <p class={`readout__value readout__value--${tone}`}>{Math.round(hit * 100)}%</p>
      <p class="readout__note">{T.lh}: {lineHeightPx.toFixed(2)}px / {rhythm}px</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.snapTo}</p>
      <p class="readout__value" style="font-size: var(--step-0)">
        <button class="btn" type="button" onclick={() => (leading = Number(snapped.toFixed(3)))}>
          → {snapped.toFixed(3)}
        </button>
      </p>
      <p class="readout__note">{T.snapped}: {(fontSize * snapped).toFixed(0)}px</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.collapsed}</p>
      <p class="readout__value">{renderedGap}<span style="font-size:.5em">px</span></p>
      <p class="readout__note">
        {useStack
          ? locale === 'zh'
            ? '相邻兄弟选择器，不会合并'
            : 'Adjacent sibling; no collapse'
          : locale === 'zh'
            ? 'margin 相邻时取较大值'
            : 'Adjacent margins collapse to the larger'}
      </p>
    </div>
  </div>

  <p class="note" style="margin:0">{T.hint}</p>
  <p class="key-point" style="margin:0">{T.note}</p>
</div>

<style>
  .rhythm__stage {
    position: relative;
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-5);
    overflow: hidden;
  }
  /* D3 风格的基线覆盖层：用重复渐变画，零 DOM 开销 */
  .rhythm__stage::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      to bottom,
      color-mix(in srgb, var(--lc) 45%, transparent) 0 1px,
      transparent 1px var(--rl)
    );
  }
  .rhythm__text {
    position: relative;
    font-size: var(--fs);
    line-height: var(--lh);
    color: var(--ink-2);
    max-inline-size: 60ch;
  }
  .rhythm__text h5 {
    font-size: calc(var(--fs) * 1.25);
    line-height: var(--lh);
    color: var(--ink-1);
  }
  /* margin 写法：相邻外边距会合并 */
  .rhythm__text > * {
    margin-block-end: var(--gp);
  }
  /* stack 写法：只在元素之间加间距，不合并 */
  .rhythm__text.use-stack > * {
    margin-block-end: 0;
  }
  .rhythm__text.use-stack > * + * {
    margin-block-start: var(--gp);
  }
</style>
