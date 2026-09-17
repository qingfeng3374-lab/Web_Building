<script lang="ts">
  /**
   * 5.1 演示 · 视觉重心与光学居中
   *
   * 左：可拖拽（也可用方向键）的元素画布，D3 实时算出重心并画出十字线与天平
   * 右：光学居中对照 —— 同一个播放三角，数学居中 vs 光学居中
   */
  import { cssVar } from '@/lib/color';
  import { centroid, imbalance, visualWeight, type MetricInput } from '@/lib/layout-metrics';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      drag: '拖动方块（或聚焦后用方向键）',
      imbalance: '重心偏离',
      imbalanceNote: '> 8% 时肉眼可感',
      balanced: '平衡',
      tilted: '失衡',
      preset: '预设',
      pSym: '对称平衡',
      pAsym: '非对称平衡',
      pBad: 'stage4（重心跑偏）',
      optical: '光学居中对照',
      mathCenter: '数学居中',
      optCenter: '光学居中',
      shift: '偏移量',
      opticalNote: '三角形的几何中心偏左于视觉中心，放进圆形按钮时需要右移约 6% 边长。',
      hint: '把大方块拖到左边、小方块拖到右边 —— 重心会往左跑。再试着用「小而重」配「大而轻」：小方块颜色调深、大方块调浅，就能在不对称的布局里重新取得平衡。',
      weight: '视觉重量',
      contrast: '对比度',
    },
    en: {
      drag: 'Drag the blocks (or focus and use arrow keys)',
      imbalance: 'Centroid drift',
      imbalanceNote: 'noticeable above 8%',
      balanced: 'balanced',
      tilted: 'off balance',
      preset: 'Presets',
      pSym: 'Symmetric',
      pAsym: 'Asymmetric',
      pBad: 'stage4 (centroid drifts)',
      optical: 'Optical centring',
      mathCenter: 'Mathematically centred',
      optCenter: 'Optically centred',
      shift: 'Offset',
      opticalNote: 'A triangle’s geometric centroid sits left of its visual centre, so inside a round button it needs about 6% of its width nudged right.',
      hint: 'Drag the large block left and the small one right — the centroid follows. Then try “small and heavy” against “large and light”: darken the small block and lighten the large one to rebalance an asymmetric composition.',
      weight: 'Visual weight',
      contrast: 'Contrast',
    },
  }[locale]);

  const W = 560;
  const H = 300;

  interface Block {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    tone: number; // 0..1 → 浅到深
  }

  const PRESETS: Record<string, Block[]> = {
    sym: [
      { id: 'a', x: 90, y: 150, w: 110, h: 110, tone: 0.7 },
      { id: 'b', x: 470, y: 150, w: 110, h: 110, tone: 0.7 },
      { id: 'c', x: 280, y: 60, w: 150, h: 50, tone: 0.9 },
    ],
    asym: [
      { id: 'a', x: 120, y: 110, w: 130, h: 90, tone: 0.95 },
      { id: 'b', x: 400, y: 150, w: 210, h: 130, tone: 0.35 },
      { id: 'c', x: 120, y: 215, w: 130, h: 40, tone: 0.5 },
    ],
    bad: [
      { id: 'a', x: 150, y: 80, w: 90, h: 50, tone: 0.3 },
      { id: 'b', x: 430, y: 220, w: 180, h: 110, tone: 0.95 },
      { id: 'c', x: 250, y: 90, w: 90, h: 50, tone: 0.3 },
    ],
  };

  let blocks = $state<Block[]>(PRESETS.asym!.map((b) => ({ ...b })));
  let dragging = $state<string | null>(null);
  let opticalShift = $state(6);

  let svgEl: SVGSVGElement | undefined = $state();

  function toSvg(e: PointerEvent): { x: number; y: number } {
    if (!svgEl) return { x: 0, y: 0 };
    const r = svgEl.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  }

  function move(id: string, x: number, y: number) {
    blocks = blocks.map((b) =>
      b.id === id
        ? { ...b, x: Math.max(b.w / 2, Math.min(W - b.w / 2, x)), y: Math.max(b.h / 2, Math.min(H - b.h / 2, y)) }
        : b,
    );
  }

  function onKey(e: KeyboardEvent, id: string) {
    const step = e.shiftKey ? 20 : 6;
    const b = blocks.find((x) => x.id === id);
    if (!b) return;
    if (e.key === 'ArrowLeft') move(id, b.x - step, b.y);
    else if (e.key === 'ArrowRight') move(id, b.x + step, b.y);
    else if (e.key === 'ArrowUp') move(id, b.x, b.y - step);
    else if (e.key === 'ArrowDown') move(id, b.x, b.y + step);
    else return;
    e.preventDefault();
  }

  /* ── 取色与度量 ───────────────────────────────────────────────────── */
  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });
  const colors = $derived.by(() => {
    themeTick;
    return {
      accent: cssVar('--ch5', '#db2777'),
      ink: cssVar('--ink-3', '#64748b'),
      ink1: cssVar('--ink-1', '#0f172a'),
      line: cssVar('--line-2', '#cbd5e1'),
      surface: cssVar('--surface-1', '#ffffff'),
      good: cssVar('--good', '#059669'),
      bad: cssVar('--bad', '#dc2626'),
    };
  });

  /** tone → 实际颜色（越深视觉重量越大） */
  function toneColor(t: number): string {
    const g = Math.round(235 - t * 200);
    return `rgb(${g}, ${g + 4}, ${g + 14})`;
  }

  const metrics = $derived.by((): MetricInput[] =>
    blocks.map((b) => ({
      id: b.id,
      width: b.w,
      height: b.h,
      cx: b.x,
      cy: b.y,
      vw: W,
      vh: H,
      fontWeight: 400,
      color: toneColor(b.tone),
      background: colors.surface,
      importance: 1,
    })),
  );

  const c = $derived(centroid(metrics));
  const drift = $derived(imbalance(metrics, W));
  const balanced = $derived(drift <= 0.08);
</script>

<div class="stack-5">
  <div class="controls">
    <div class="control" style="flex: 0 1 18rem">
      <span class="control__label"><span>{T.preset}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" onclick={() => (blocks = PRESETS.sym!.map((b) => ({ ...b })))}>{T.pSym}</button>
        <button class="chip" type="button" onclick={() => (blocks = PRESETS.asym!.map((b) => ({ ...b })))}>{T.pAsym}</button>
        <button class="chip" type="button" onclick={() => (blocks = PRESETS.bad!.map((b) => ({ ...b })))}>{T.pBad}</button>
      </div>
    </div>
    <Slider label={T.shift} bind:value={opticalShift} min={0} max={14} step={0.5} unit="%" />
  </div>

  <div class="bl__split">
    <figure class="chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        bind:this={svgEl}
        role="img"
        aria-labelledby="bl-t bl-d"
        onpointermove={(e) => dragging && move(dragging, toSvg(e).x, toSvg(e).y)}
        onpointerup={() => (dragging = null)}
        onpointerleave={() => (dragging = null)}
      >
        <title id="bl-t">{locale === 'zh' ? '视觉重心' : 'Visual centre of mass'}</title>
        <desc id="bl-d">
          {locale === 'zh'
            ? `三个方块的位置与视觉重量决定的重心，当前偏离中线 ${(drift * 100).toFixed(1)}%。`
            : `Centre of mass implied by three blocks’ positions and visual weights; currently ${(drift * 100).toFixed(1)}% off the midline.`}
        </desc>

        <rect x="0" y="0" width={W} height={H} fill={colors.surface} />
        <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke={colors.line} stroke-dasharray="4 4" />

        {#each blocks as b (b.id)}
          <g>
            <rect
              class="bl__block"
              x={b.x - b.w / 2}
              y={b.y - b.h / 2}
              width={b.w}
              height={b.h}
              rx="4"
              fill={toneColor(b.tone)}
              stroke={dragging === b.id ? colors.accent : 'transparent'}
              stroke-width="2"
              tabindex="0"
              role="button"
              aria-label={`${T.weight} ${visualWeight(metrics.find((m) => m.id === b.id)!).toFixed(0)}`}
              onpointerdown={() => (dragging = b.id)}
              onkeydown={(e) => onKey(e, b.id)}
            />
            <text
              x={b.x}
              y={b.y + 4}
              text-anchor="middle"
              font-size="11"
              fill={b.tone > 0.55 ? '#fff' : colors.ink1}
              pointer-events="none"
            >
              {visualWeight(metrics.find((m) => m.id === b.id)!).toFixed(0)}
            </text>
          </g>
        {/each}

        <!-- 重心十字线 -->
        <line x1={c.x} y1="0" x2={c.x} y2={H} stroke={balanced ? colors.good : colors.bad} stroke-width="2" />
        <line x1="0" y1={c.y} x2={W} y2={c.y} stroke={balanced ? colors.good : colors.bad} stroke-width="1" opacity="0.5" />
        <circle cx={c.x} cy={c.y} r="7" fill={balanced ? colors.good : colors.bad} />

        <!-- 天平：支点在中线，横梁按偏离量倾斜 -->
        <g transform={`translate(${W / 2}, ${H - 18})`}>
          <path d="M -8 8 L 8 8 L 0 -4 Z" fill={colors.ink} />
          <line
            x1="-70"
            y1="-4"
            x2="70"
            y2="-4"
            stroke={balanced ? colors.good : colors.bad}
            stroke-width="3"
            stroke-linecap="round"
            transform={`rotate(${Math.max(-18, Math.min(18, (c.x - W / 2) / W * 120))})`}
          />
        </g>
      </svg>
      <figcaption>{T.drag}</figcaption>
    </figure>

    <!-- 光学居中对照 -->
    <div class="bl__optical">
      <p class="control__label"><span>{T.optical}</span></p>
      <div class="bl__pair">
        <div>
          <div class="bl__btn">
            <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
              <circle cx="20" cy="20" r="19" fill={colors.accent} opacity="0.15" />
              <path d="M15 11 L30 20 L15 29 Z" fill={colors.accent} />
            </svg>
          </div>
          <p class="readout__note">{T.mathCenter}</p>
        </div>
        <div>
          <div class="bl__btn">
            <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
              <circle cx="20" cy="20" r="19" fill={colors.accent} opacity="0.15" />
              <path d="M15 11 L30 20 L15 29 Z" fill={colors.accent} transform={`translate(${(opticalShift / 100) * 15}, 0)`} />
            </svg>
          </div>
          <p class="readout__note">{T.optCenter} (+{opticalShift}%)</p>
        </div>
      </div>
      <p class="key-point" style="margin-block-start: var(--space-3)">{T.opticalNote}</p>
    </div>
  </div>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.imbalance}</p>
      <p class={`readout__value readout__value--${balanced ? 'good' : 'bad'}`}>
        {(drift * 100).toFixed(1)}%
      </p>
      <p class="readout__note">{balanced ? T.balanced : T.tilted} · {T.imbalanceNote}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{locale === 'zh' ? '重心坐标' : 'Centroid'}</p>
      <p class="readout__value" style="font-size: var(--step-0)">
        ({c.x.toFixed(0)}, {c.y.toFixed(0)})
      </p>
      <p class="readout__note">{locale === 'zh' ? '容器中线' : 'midline'} x = {W / 2}</p>
    </div>
  </div>

  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .bl__split {
    display: grid;
    gap: var(--space-5);
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
    align-items: start;
  }
  @container (max-width: 44rem) {
    .bl__split {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .bl__block {
    cursor: grab;
    touch-action: none;
  }
  .bl__block:active {
    cursor: grabbing;
  }
  .bl__optical {
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-4);
  }
  .bl__pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
    margin-block-start: var(--space-3);
    text-align: center;
  }
  .bl__btn {
    display: grid;
    place-items: center;
    padding: var(--space-3);
    background: var(--surface-2);
    border-radius: var(--radius);
  }
</style>
