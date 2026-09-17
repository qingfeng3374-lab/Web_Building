<script lang="ts">
  /**
   * 5.3 演示 · 节奏合成器（全站唯一 p5 与 D3 同框处）
   *
   * 同一组节奏参数驱动两件事：
   *   前景 —— D3 画的界面卡片网格
   *   背景 —— p5.js 生成的抽象图案
   * 两者同步变化，说明「平面构成的节奏」与「界面布局的节奏」是同一件事。
   */
  import { cssVar } from '@/lib/color';
  import P5Canvas from '@/components/decor/P5Canvas.svelte';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      mode: '节奏模式',
      even: '等距',
      progressive: '递进',
      grouped: '成组',
      count: '元素数量',
      breaks: '打破次数',
      title: '界面层：卡片网格',
      desc: '按当前节奏参数排布的卡片，宽度比例与背景图案同源。',
      pattern: '构成层：p5 生成的抽象图案',
      says: '这种节奏在说',
      msgs: {
        even: '「这些是同类，地位相等」—— 适合同级 KPI、图片墙、列表',
        progressive: '「有顺序、有强弱」—— 适合步骤条、排行榜、时间轴',
        grouped: '「有主有次，分批理解」—— 适合主指标 + 辅助指标',
      },
      scanCost: '预估扫描成本',
      scanNote: '重复度越高，学一次用 N 次，扫描成本越低',
      breakWarn: '打破超过 1 次：读者将无法判断哪个才是重点',
      hint: '把「节奏模式」切到成组，再把「打破次数」从 1 加到 3 —— 注意重点是怎么被稀释掉的。重点来自违反预期，而预期需要先被建立。',
      note: 'stage4 的 KPI 区用的是等距，但它想表达的其实是成组 —— 形式与意图不匹配，这就是层级分停在 0.34 的原因之一。',
    },
    en: {
      mode: 'Rhythm mode',
      even: 'Even',
      progressive: 'Progressive',
      grouped: 'Grouped',
      count: 'Item count',
      breaks: 'Pattern breaks',
      title: 'Interface layer: card grid',
      desc: 'Cards laid out with the current rhythm; their width proportions share a source with the background pattern.',
      pattern: 'Compositional layer: a generative p5 pattern',
      says: 'This rhythm says',
      msgs: {
        even: '“These are peers of equal standing” — for peer KPIs, photo grids, lists',
        progressive: '“There is an order and a gradient” — for steppers, rankings, timelines',
        grouped: '“There is a lead and supporters” — for a primary metric plus its context',
      },
      scanCost: 'Estimated scan cost',
      scanNote: 'More repetition means learn once, apply N times — and a lower scan cost',
      breakWarn: 'More than one break: readers can no longer tell which item is the point',
      hint: 'Switch the mode to grouped, then raise “pattern breaks” from 1 to 3 — and watch the emphasis dilute. Emphasis comes from violating an expectation, and the expectation has to be built first.',
      note: 'stage4’s KPI row uses an even rhythm while meaning grouped — form and intent do not match, and that mismatch is one reason the hierarchy score stalls at 0.34.',
    },
  }[locale]);

  type Mode = 'even' | 'progressive' | 'grouped';
  let mode = $state<Mode>('even');
  let count = $state(8);
  let breaks = $state(1);

  /** 宽度比例：与第 3.3 节的排版音阶同源（1.25 的幂） */
  function ratioAt(i: number): number {
    if (mode === 'progressive') return 1.25 ** (i % 4);
    if (mode === 'grouped') return i % 4 === 0 ? 1.95 : 0.85;
    return 1;
  }

  /** 被打破的索引：均匀分布在序列上 */
  const brokenSet = $derived.by(() => {
    const s = new Set<number>();
    for (let b = 0; b < breaks; b++) s.add(Math.round((b * count) / Math.max(1, breaks)));
    return s;
  });

  /** 扫描成本模型：结构种类数 × log(元素数) —— 结构越统一，成本越低 */
  const scanCost = $derived.by(() => {
    const kinds = new Set(Array.from({ length: count }, (_, i) => ratioAt(i).toFixed(2))).size + brokenSet.size;
    return kinds * Math.log2(count + 1);
  });
  const costTone = $derived(scanCost < 8 ? 'good' : scanCost < 14 ? 'warn' : 'bad');

  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });
  const colors = $derived.by(() => {
    themeTick;
    return {
      base: cssVar('--ch5', '#db2777'),
      accent: cssVar('--accent', '#2563eb'),
      ink: cssVar('--ink-3', '#64748b'),
      surface: cssVar('--surface-1', '#fff'),
    };
  });

  const tableRows = $derived([
    [locale === 'zh' ? '序号' : 'Index', locale === 'zh' ? '宽度比' : 'Width ratio', locale === 'zh' ? '是否打破' : 'Break'],
    ...Array.from({ length: count }, (_, i) => [
      String(i + 1),
      ratioAt(i).toFixed(2),
      brokenSet.has(i) ? '✓' : '',
    ]),
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <div class="control" style="flex: 1 1 16rem">
      <span class="control__label"><span>{T.mode}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" aria-pressed={mode === 'even'} onclick={() => (mode = 'even')}>{T.even}</button>
        <button class="chip" type="button" aria-pressed={mode === 'progressive'} onclick={() => (mode = 'progressive')}>
          {T.progressive}
        </button>
        <button class="chip" type="button" aria-pressed={mode === 'grouped'} onclick={() => (mode = 'grouped')}>
          {T.grouped}
        </button>
      </div>
    </div>
    <Slider label={T.count} bind:value={count} min={3} max={12} />
    <Slider label={T.breaks} bind:value={breaks} min={0} max={4} />
  </div>

  <!-- 构成层：p5 背景 + 前景卡片 -->
  <div class="rc__stage" data-rhythm-mode={mode} data-rhythm-count={count}>
    <P5Canvas sketch="rhythm" accentVar="--ch5" fallbackHeight={120} fallback="none" />
    <p class="rc__label">{T.pattern}</p>
  </div>

  <!-- 界面层：D3 卡片网格 -->
  <ResponsiveChart title={T.title} desc={T.desc} ratio={3.4} minHeight={130} rows={tableRows}>
    {#snippet children({ width, height })}
      {@const gap = 10}
      {@const ratios = Array.from({ length: count }, (_, i) => ratioAt(i))}
      {@const total = ratios.reduce((a, b) => a + b, 0)}
      {@const unit = (width - gap * (count - 1) - 8) / total}
      {@const padT = 14}
      {@const h = height - padT - 24}
      {#each ratios as r, i (i)}
        {@const x = 4 + ratios.slice(0, i).reduce((a, b) => a + b, 0) * unit + i * gap}
        {@const w = r * unit}
        {@const broken = brokenSet.has(i)}
        <rect
          x={x}
          y={padT + (broken ? 0 : h * 0.12)}
          width={Math.max(2, w)}
          height={broken ? h : h * 0.76}
          rx="3"
          fill={broken ? colors.accent : colors.base}
          opacity={broken ? 0.95 : 0.4}
        />
        {#if w > 22}
          <text
            x={x + w / 2}
            y={padT + h / 2 + 4}
            text-anchor="middle"
            font-size="10"
            fill={broken ? '#fff' : colors.ink}
          >
            {i + 1}
          </text>
        {/if}
      {/each}
    {/snippet}
  </ResponsiveChart>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.says}</p>
      <p class="readout__value" style="font-size: var(--step--1); font-weight:600">{T.msgs[mode]}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.scanCost}</p>
      <p class={`readout__value readout__value--${costTone}`}>{scanCost.toFixed(1)}</p>
      <p class="readout__note">{T.scanNote}</p>
    </div>
  </div>

  {#if breaks > 1}
    <p class="pitfall" style="margin:0">{T.breakWarn}</p>
  {/if}
  <p class="key-point" style="margin:0">{T.note}</p>
  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .rc__stage {
    position: relative;
    min-block-size: 120px;
    border-radius: var(--radius);
    overflow: hidden;
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
  }
  .rc__label {
    position: relative;
    z-index: 1;
    padding: var(--space-2) var(--space-3);
    font-size: var(--step--2);
    color: var(--ink-4);
  }
</style>
