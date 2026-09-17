<script lang="ts">
  /**
   * 3.1 演示 · 常规流、包含块与 BFC
   *
   * 左：真实 DOM 的盒子树，开关会真的改变 CSS，眼见为实
   * 右：D3 画的包含块链 —— 高亮当前 `position` 下，百分比到底相对谁计算
   * 下：外边距合并的实测结果（用 getBoundingClientRect 量，不是算的）
   */
  import { cssVar } from '@/lib/color';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      pos: '目标元素的 position',
      transform: '中间祖先加 transform',
      bfc: '父容器 display: flow-root',
      overflow: '父容器 overflow: hidden',
      title: '包含块链',
      desc: '从目标元素向上查找包含块的过程，高亮的那一层就是百分比的参照。',
      cb: '当前包含块',
      gap: '两段之间的实测间距',
      expect: '写的值',
      actual: '实际渲染',
      collapsed: '发生了外边距合并',
      notCollapsed: '未合并',
      hintFixed: '注意：给中间祖先加上 transform 之后，fixed 元素的包含块从「视口」变成了那个祖先 —— 这是弹窗突然定位错乱的真正原因。',
      clipped: '溢出被裁剪',
      visible: '溢出可见',
      overflowNote: 'overflow:hidden 同时做了两件事：创建 BFC（想要的）和裁剪溢出（不想要的）。flow-root 只做前者。',
      boxes: { vp: '视口 (ICB)', body: 'body', page: '.page (static)', panel: '.panel', target: '目标元素' },
    },
    en: {
      pos: 'Target element position',
      transform: 'transform on the middle ancestor',
      bfc: 'display: flow-root on the parent',
      overflow: 'overflow: hidden on the parent',
      title: 'Containing-block chain',
      desc: 'Walking up from the target to its containing block; the highlighted level is what percentages resolve against.',
      cb: 'Current containing block',
      gap: 'Measured gap between the two blocks',
      expect: 'Declared',
      actual: 'Rendered',
      collapsed: 'margins collapsed',
      notCollapsed: 'no collapse',
      hintFixed: 'Note: once the middle ancestor gets a transform, the fixed element’s containing block changes from the viewport to that ancestor — the real cause of modals suddenly mispositioning.',
      clipped: 'overflow clipped',
      visible: 'overflow visible',
      overflowNote: 'overflow:hidden does two things at once: creates a BFC (wanted) and clips overflow (unwanted). flow-root does only the first.',
      boxes: { vp: 'Viewport (ICB)', body: 'body', page: '.page (static)', panel: '.panel', target: 'Target' },
    },
  }[locale]);

  type Pos = 'static' | 'relative' | 'absolute' | 'fixed';
  let pos = $state<Pos>('absolute');
  let hasTransform = $state(false);
  let parentMode = $state<'none' | 'flow-root' | 'overflow'>('none');

  /** 包含块解析：把 CSS 规范的规则写成可执行代码 */
  const chain = $derived.by(() => {
    const levels = [
      { key: 'vp', label: T.boxes.vp, positioned: true },
      { key: 'body', label: T.boxes.body, positioned: false },
      { key: 'page', label: T.boxes.page, positioned: false },
      { key: 'panel', label: T.boxes.panel, positioned: hasTransform || pos === 'absolute' },
      { key: 'target', label: T.boxes.target, positioned: false },
    ];
    let cbIndex: number;
    if (pos === 'fixed') {
      // fixed 的包含块是视口 —— 除非某个祖先有 transform/filter/will-change
      cbIndex = hasTransform ? 3 : 0;
    } else if (pos === 'absolute') {
      // 最近的已定位祖先；本演示里 .panel 在 absolute 模式下被设为 relative
      cbIndex = 3;
    } else {
      // static / relative：最近的块级祖先
      cbIndex = 3;
    }
    return { levels, cbIndex };
  });

  /* ── 外边距合并实测 ─────────────────────────────────────────────── */
  let marginStage: HTMLDivElement | undefined = $state();
  let measuredGap = $state(0);
  const DECLARED_A = 24;
  const DECLARED_B = 32;

  function measure() {
    if (!marginStage) return;
    const a = marginStage.querySelector('[data-mb="a"]');
    const b = marginStage.querySelector('[data-mb="b"]');
    if (!a || !b) return;
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    measuredGap = Math.round(rb.top - ra.bottom);
  }

  $effect(() => {
    void parentMode;
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  });

  const collapsed = $derived(measuredGap > 0 && measuredGap < DECLARED_A + DECLARED_B - 1);

  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });
  const colors = $derived.by(() => {
    themeTick;
    return {
      accent: cssVar('--ch3', '#0d9488'),
      ink: cssVar('--ink-3', '#64748b'),
      ink1: cssVar('--ink-1', '#0f172a'),
      line: cssVar('--line-2', '#cbd5e1'),
      surface: cssVar('--surface-1', '#fff'),
      warn: cssVar('--warn', '#d97706'),
    };
  });

  const tableRows = $derived([
    [locale === 'zh' ? '层级' : 'Level', locale === 'zh' ? '是否包含块' : 'Is containing block'],
    ...chain.levels.map((l, i) => [l.label, i === chain.cbIndex ? '✓' : '']),
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <div class="control" style="flex: 1 1 16rem">
      <span class="control__label"><span>{T.pos}</span></span>
      <div class="chip-group">
        {#each ['static', 'relative', 'absolute', 'fixed'] as p (p)}
          <button class="chip" type="button" aria-pressed={pos === p} onclick={() => (pos = p as Pos)}>{p}</button>
        {/each}
      </div>
    </div>
    <div class="control" style="flex: 0 1 14rem">
      <span class="control__label"><span>{T.transform}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" aria-pressed={hasTransform} onclick={() => (hasTransform = !hasTransform)}>
          transform: translateZ(0)
        </button>
      </div>
    </div>
    <div class="control" style="flex: 1 1 18rem">
      <span class="control__label"><span>BFC</span></span>
      <div class="chip-group">
        <button class="chip" type="button" aria-pressed={parentMode === 'none'} onclick={() => (parentMode = 'none')}>
          {locale === 'zh' ? '无' : 'none'}
        </button>
        <button class="chip" type="button" aria-pressed={parentMode === 'flow-root'} onclick={() => (parentMode = 'flow-root')}>
          {T.bfc}
        </button>
        <button class="chip" type="button" aria-pressed={parentMode === 'overflow'} onclick={() => (parentMode = 'overflow')}>
          {T.overflow}
        </button>
      </div>
    </div>
  </div>

  <div class="flow__split">
    <!-- 真实 DOM：盒子树 -->
    <div class="flow__stage">
      <div class="lvl lvl--body">
        <span class="lvl__tag">body</span>
        <div class="lvl lvl--page">
          <span class="lvl__tag">.page</span>
          <div
            class="lvl lvl--panel"
            class:has-transform={hasTransform}
            class:is-relative={pos === 'absolute'}
          >
            <span class="lvl__tag">.panel {hasTransform ? '· transform' : ''}</span>
            <div class="lvl__target" data-pos={pos}>{T.boxes.target}<br /><code>width: 50%</code></div>
          </div>
        </div>
      </div>
    </div>

    <!-- D3：包含块链 -->
    <ResponsiveChart title={T.title} desc={T.desc} ratio={1.1} minHeight={230} rows={tableRows}>
      {#snippet children({ width, height })}
        {@const n = chain.levels.length}
        {@const boxH = (height - 20) / n}
        {#each chain.levels as lvl, i (lvl.key)}
          {@const inset = i * 10}
          {@const isCb = i === chain.cbIndex}
          <rect
            x={10 + inset}
            y={10 + i * boxH}
            width={width - 20 - inset * 2}
            height={boxH - 6}
            fill={isCb ? colors.accent : colors.surface}
            opacity={isCb ? 0.18 : 1}
            stroke={isCb ? colors.accent : colors.line}
            stroke-width={isCb ? 2.5 : 1}
            rx="4"
          />
          <text
            x={18 + inset}
            y={10 + i * boxH + boxH / 2 + 3}
            font-size="11"
            font-weight={isCb ? 700 : 500}
            fill={isCb ? colors.ink1 : colors.ink}
          >
            {lvl.label}{isCb ? ` ← ${T.cb}` : ''}
          </text>
        {/each}
        <!-- 从目标向上指到包含块的箭头 -->
        <path
          d={`M ${width - 26} ${10 + (n - 0.5) * boxH} L ${width - 26} ${10 + (chain.cbIndex + 0.5) * boxH}`}
          stroke={colors.accent}
          stroke-width="2"
          fill="none"
          marker-end="url(#fl-arrow)"
        />
        <defs>
          <marker id="fl-arrow" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={colors.accent} />
          </marker>
        </defs>
      {/snippet}
    </ResponsiveChart>
  </div>

  {#if pos === 'fixed'}
    <p class="note" style="margin:0">{T.hintFixed}</p>
  {/if}

  <!-- 外边距合并实测 -->
  <div class="flow__margins">
    <div
      class="flow__mstage"
      class:is-flowroot={parentMode === 'flow-root'}
      class:is-overflow={parentMode === 'overflow'}
      bind:this={marginStage}
    >
      <div class="mb" data-mb="a">margin-bottom: {DECLARED_A}px</div>
      <div class="mb" data-mb="b">margin-top: {DECLARED_B}px</div>
      <div class="mb mb--overflowing">{locale === 'zh' ? '一个刻意溢出的元素' : 'A deliberately overflowing element'}</div>
    </div>

    <div class="readout">
      <div class="readout__item">
        <p class="readout__label">{T.gap}</p>
        <p class={`readout__value ${collapsed ? 'readout__value--warn' : 'readout__value--good'}`}>
          {measuredGap}<span style="font-size:.5em">px</span>
        </p>
        <p class="readout__note">
          {T.expect}: {DECLARED_A} + {DECLARED_B} = {DECLARED_A + DECLARED_B}px ·
          {collapsed ? T.collapsed : T.notCollapsed}
        </p>
      </div>
      <div class="readout__item">
        <p class="readout__label">{locale === 'zh' ? '溢出行为' : 'Overflow behaviour'}</p>
        <p class={`readout__value ${parentMode === 'overflow' ? 'readout__value--bad' : 'readout__value--good'}`} style="font-size: var(--step-0)">
          {parentMode === 'overflow' ? T.clipped : T.visible}
        </p>
        <p class="readout__note">{T.overflowNote}</p>
      </div>
    </div>
  </div>
</div>

<style>
  .flow__split {
    display: grid;
    gap: var(--space-5);
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
  @container (max-width: 44rem) {
    .flow__split {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .flow__stage {
    background: var(--surface-0);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-3);
    min-block-size: 230px;
  }
  .lvl {
    position: relative;
    border: 1px dashed var(--line-2);
    border-radius: var(--radius-sm);
    padding: var(--space-4) var(--space-3) var(--space-3);
    background: var(--surface-1);
  }
  .lvl__tag {
    position: absolute;
    inset-block-start: 2px;
    inset-inline-start: 6px;
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--ink-4);
  }
  .lvl--panel.is-relative {
    position: relative;
  }
  .lvl--panel.has-transform {
    transform: translateZ(0);
    border-color: var(--warn);
  }
  .lvl__target {
    inline-size: 50%;
    padding: var(--space-2);
    background: color-mix(in srgb, var(--ch3) 18%, transparent);
    border: 1px solid var(--ch3);
    border-radius: var(--radius-sm);
    font-size: var(--step--2);
    color: var(--ink-1);
  }
  .lvl__target[data-pos='relative'] {
    position: relative;
    inset-inline-start: 8px;
  }
  .lvl__target[data-pos='absolute'] {
    position: absolute;
    inset-block-start: 20px;
    inset-inline-end: 8px;
  }
  .lvl__target[data-pos='fixed'] {
    position: fixed;
    inset-block-start: 30%;
    inset-inline-end: 24px;
    z-index: var(--z-overlay);
    box-shadow: var(--elevation-3);
  }

  .flow__margins {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  @container (max-width: 44rem) {
    .flow__margins {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .flow__mstage {
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding-inline: var(--space-3);
    block-size: 180px;
  }
  .flow__mstage.is-flowroot {
    display: flow-root;
  }
  .flow__mstage.is-overflow {
    overflow: hidden;
  }
  .mb {
    background: color-mix(in srgb, var(--ch3) 14%, transparent);
    border: 1px solid var(--ch3);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
    font-size: var(--step--2);
    font-family: var(--font-mono);
  }
  .mb[data-mb='a'] {
    margin-block-end: 24px;
  }
  .mb[data-mb='b'] {
    margin-block-start: 32px;
  }
  .mb--overflowing {
    margin-block-start: var(--space-3);
    inline-size: 150%;
    background: color-mix(in srgb, var(--warn) 18%, transparent);
    border-color: var(--warn);
  }
</style>
