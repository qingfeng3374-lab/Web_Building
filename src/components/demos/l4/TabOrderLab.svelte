<script lang="ts">
  /**
   * 6.1 演示 · Tab 焦点路径
   *
   * 真实的可聚焦按钮 + 真实的 CSS（order / dense / row-reverse）。
   * 量出每个按钮的实际矩形，D3 把 **DOM 顺序连成的折线** 画在它们上面，
   * 并用 focusOrderInversions() 算出逆序对数。读者可以直接按 Tab 验证。
   */
  import { cssVar } from '@/lib/color';
  import { focusOrderInversions, visualOrder, type FocusTarget } from '@/lib/layout-metrics';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      mode: '布局手段',
      none: '无（DOM 顺序 = 视觉顺序）',
      order: 'order 重排',
      reverse: 'row-reverse',
      dense: 'grid-auto-flow: dense',
      inversions: '焦点逆序对数',
      invNote: '0 表示「看到的顺序」与「摸到的顺序」一致',
      visual: '视觉顺序',
      dom: 'DOM / Tab 顺序',
      tryTab: '把焦点放到第一个按钮，然后连续按 Tab —— 焦点环走的路就是图上这条线。',
      hint: 'dense 最隐蔽：它不需要你写任何数字，却会把后面的小卡片塞进前面的空隙，而且乱的程度随容器宽度变化 —— 测试时极难复现。',
      fix: '正确做法：把元素在 DOM 里放到正确的位置，再用 grid-area / grid-column 决定它显示在哪。Grid 定位不改变 DOM 顺序，也就不影响焦点顺序。',
      card: '卡片',
      wcag: 'WCAG 2.2 · 1.3.2 有意义的序列（A 级）',
    },
    en: {
      mode: 'Layout technique',
      none: 'None (DOM order = visual order)',
      order: 'order reshuffle',
      reverse: 'row-reverse',
      dense: 'grid-auto-flow: dense',
      inversions: 'Focus-order inversions',
      invNote: '0 means what you see and what you reach agree',
      visual: 'Visual order',
      dom: 'DOM / Tab order',
      tryTab: 'Focus the first button and press Tab repeatedly — the focus ring traces exactly the line drawn here.',
      hint: 'dense is the sneakiest: it needs no number from you, tucks later cards into earlier gaps, and the disorder changes with container width — nearly impossible to reproduce in testing.',
      fix: 'The fix: put elements in the right place in the DOM, then use grid-area / grid-column to decide where they appear. Grid placement does not change DOM order, so it does not affect focus order.',
      card: 'Card',
      wcag: 'WCAG 2.2 · 1.3.2 Meaningful Sequence (Level A)',
    },
  }[locale]);

  type Mode = 'none' | 'order' | 'reverse' | 'dense';
  let mode = $state<Mode>('order');

  const COUNT = 9;
  /** 为 dense 制造空隙：让部分卡片跨两列 */
  const spans = [2, 1, 1, 1, 2, 1, 1, 1, 2];

  let stage: HTMLDivElement | undefined = $state();
  let rects = $state<FocusTarget[]>([]);
  let host = $state({ w: 1, h: 1 });

  function measure() {
    if (!stage) return;
    const hb = stage.getBoundingClientRect();
    host = { w: hb.width, h: hb.height };
    rects = [...stage.querySelectorAll<HTMLElement>('.to__card')].map((el, i) => {
      const r = el.getBoundingClientRect();
      return {
        id: String(i),
        tabIndex: i, // DOM 顺序
        x: r.left - hb.left,
        y: r.top - hb.top,
        width: r.width,
        height: r.height,
      };
    });
  }

  $effect(() => {
    void mode;
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  });

  $effect(() => {
    if (!stage) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(stage);
    return () => ro.disconnect();
  });

  const inversions = $derived(focusOrderInversions(rects));
  const vOrder = $derived(visualOrder(rects));
  const tone = $derived(inversions === 0 ? 'good' : inversions <= 3 ? 'warn' : 'bad');

  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });
  const colors = $derived.by(() => {
    themeTick;
    return {
      path: cssVar('--ch6', '#dc2626'),
      good: cssVar('--good', '#059669'),
      ink: cssVar('--ink-1', '#0f172a'),
      surface: cssVar('--surface-1', '#fff'),
    };
  });

  /** 折线上的点：按 DOM 顺序连接各卡片中心 */
  const pathD = $derived(
    rects
      .map((r, i) => `${i === 0 ? 'M' : 'L'} ${(r.x + r.width / 2).toFixed(1)} ${(r.y + r.height / 2).toFixed(1)}`)
      .join(' '),
  );
</script>

<div class="stack-5">
  <div class="controls">
    <div class="control" style="flex: 1 1 24rem">
      <span class="control__label"><span>{T.mode}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" aria-pressed={mode === 'none'} onclick={() => (mode = 'none')}>{T.none}</button>
        <button class="chip" type="button" aria-pressed={mode === 'order'} onclick={() => (mode = 'order')}>{T.order}</button>
        <button class="chip" type="button" aria-pressed={mode === 'reverse'} onclick={() => (mode = 'reverse')}>{T.reverse}</button>
        <button class="chip" type="button" aria-pressed={mode === 'dense'} onclick={() => (mode = 'dense')}>{T.dense}</button>
      </div>
    </div>
  </div>

  <div class="to__wrap">
    <div class="to__stage" data-mode={mode} bind:this={stage}>
      {#each Array(COUNT) as _, i (i)}
        <button class="to__card" type="button" style={`--span:${spans[i]}`} data-i={i}>
          {T.card} {i + 1}
        </button>
      {/each}
    </div>

    <!-- 焦点路径覆盖层：绝对定位，不拦截指针 -->
    <svg class="to__overlay" viewBox={`0 0 ${host.w} ${host.h}`} aria-hidden="true" preserveAspectRatio="none">
      <path d={pathD} fill="none" stroke={inversions ? colors.path : colors.good} stroke-width="2.5" stroke-linejoin="round" opacity="0.85" />
      {#each rects as r, i (r.id)}
        <circle cx={r.x + r.width / 2} cy={r.y + r.height / 2} r="11" fill={inversions ? colors.path : colors.good} />
        <text
          x={r.x + r.width / 2}
          y={r.y + r.height / 2 + 4}
          text-anchor="middle"
          font-size="11"
          font-weight="700"
          fill={colors.surface}
        >
          {i + 1}
        </text>
      {/each}
    </svg>
  </div>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.inversions}</p>
      <p class={`readout__value readout__value--${tone}`}>{inversions}</p>
      <p class="readout__note">{T.invNote} · {T.wcag}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.visual}</p>
      <p class="readout__value" style="font-size: var(--step--1); font-family: var(--font-mono)">
        {vOrder.map((id) => Number(id) + 1).join(' → ')}
      </p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.dom}</p>
      <p class="readout__value" style="font-size: var(--step--1); font-family: var(--font-mono)">
        {Array.from({ length: COUNT }, (_, i) => i + 1).join(' → ')}
      </p>
    </div>
  </div>

  <p class="demo-hint" style="margin:0">⌨ {T.tryTab}</p>
  {#if mode === 'dense'}<p class="pitfall" style="margin:0">{T.hint}</p>{/if}
  <p class="key-point" style="margin:0">{T.fix}</p>
</div>

<style>
  .to__wrap {
    position: relative;
  }
  .to__stage {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--surface-0);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
  }
  .to__card {
    grid-column: span var(--span);
    padding: var(--space-4) var(--space-3);
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius-sm);
    font-size: var(--step--2);
    color: var(--ink-2);
    cursor: pointer;
    min-block-size: 44px;
  }
  .to__card:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 2px;
    z-index: 2;
  }
  /* ✗ order：任意重排视觉顺序 */
  .to__stage[data-mode='order'] .to__card[data-i='0'] { order: 6; }
  .to__stage[data-mode='order'] .to__card[data-i='4'] { order: -2; }
  .to__stage[data-mode='order'] .to__card[data-i='7'] { order: -1; }
  .to__stage[data-mode='order'] .to__card[data-i='2'] { order: 5; }
  /* ✗ row-reverse：整体反向 */
  .to__stage[data-mode='reverse'] {
    display: flex;
    flex-direction: row-reverse;
    flex-wrap: wrap;
  }
  .to__stage[data-mode='reverse'] .to__card {
    flex: 1 1 8rem;
  }
  /* ✗ dense：为填满空隙而回填后面的项 */
  .to__stage[data-mode='dense'] {
    grid-auto-flow: dense;
  }
  .to__overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
</style>
