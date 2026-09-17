<script lang="ts">
  /**
   * 1.2 演示 · 格式塔分组实验室
   *
   * 24 个方块本应读成 4 组。四个滑块分别提供四种分组线索，
   * 算法按「感知亲和度」把方块并成连通块（并查集），实时算出
   * **人眼会分成几组**，并用 D3 画出检测到的分组包围盒。
   *
   * 亲和度模型（可解释，且与 1.2 节讲的强度排序一致）：
   *   affinity = 接近性 + 相似性(色相) + 共同区域 − 闭合惩罚(边框)
   *   接近性的系数最大 —— 所以「加大间距」总是胜过「加边框」。
   */
  import { cssVar } from '@/lib/color';
  import { hsl } from '@/lib/d3-kit';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      title: '感知分组检测',
      desc: '24 个方块与算法检测到的分组包围盒；四种线索的强度由滑块控制。',
      gapIn: '组内间距',
      gapOut: '组间间距',
      hue: '组间色相差',
      border: '边框粗细',
      region: '共同区域底色',
      perceived: '人眼会分成',
      unit: '组',
      intended: '设计意图',
      ratio: '组间 / 组内 间距比',
      dominant: '当前起主导作用的线索',
      cues: { prox: '接近性', sim: '相似性', region: '共同区域', none: '无有效线索' },
      verdictOk: '✓ 分组成立，与意图一致',
      verdictBad: '✗ 分组失败：读者看到的不是 4 组',
      presetTitle: '一键验证',
      p1: '只靠间距',
      p2: '只靠边框',
      p3: '只靠颜色',
      p4: '全部堆上',
      lesson:
        '把「只靠间距」和「只靠边框」对比一下：前者用 0 条线达成分组，后者画了 24 圈线却仍然是 24 个独立方块。这就是 1.2 节「间距最便宜、边框最贵」的实证。',
    },
    en: {
      title: 'Perceptual grouping detector',
      desc: 'Twenty-four squares and the group bounds the algorithm detects; four sliders control the strength of each cue.',
      gapIn: 'Gap within group',
      gapOut: 'Gap between groups',
      hue: 'Hue shift between groups',
      border: 'Border weight',
      region: 'Shared background',
      perceived: 'A viewer perceives',
      unit: ' group(s)',
      intended: 'Design intent',
      ratio: 'Between / within gap ratio',
      dominant: 'Dominant cue right now',
      cues: { prox: 'Proximity', sim: 'Similarity', region: 'Common region', none: 'No effective cue' },
      verdictOk: '✓ Grouping reads as intended',
      verdictBad: '✗ Grouping fails: the reader does not see 4 groups',
      presetTitle: 'One-click tests',
      p1: 'Spacing only',
      p2: 'Borders only',
      p3: 'Colour only',
      p4: 'Everything at once',
      lesson:
        'Compare “spacing only” with “borders only”: the first creates the grouping with zero lines; the second draws 24 outlines and still reads as 24 separate squares. That is the empirical case for “spacing is cheapest, borders are dearest”.',
    },
  }[locale]);

  /* ── 参数 ─────────────────────────────────────────────────────────── */
  let gapIn = $state(6);
  let gapOut = $state(34);
  let hue = $state(0);
  let border = $state(0);
  let region = $state(0);

  function preset(p: 1 | 2 | 3 | 4) {
    if (p === 1) { gapIn = 6; gapOut = 34; hue = 0; border = 0; region = 0; }
    if (p === 2) { gapIn = 16; gapOut = 16; hue = 0; border = 4; region = 0; }
    if (p === 3) { gapIn = 16; gapOut = 16; hue = 120; border = 0; region = 0; }
    if (p === 4) { gapIn = 6; gapOut = 34; hue = 80; border = 2; region = 0.8; }
  }

  /* ── 布局：4 组 × (2 行 × 3 列) ───────────────────────────────────── */
  const GROUPS = 4;
  const COLS = 3;
  const ROWS = 2;
  const SIZE = 26;

  interface Sq { i: number; g: number; x: number; y: number; }

  const squares = $derived.by(() => {
    const out: Sq[] = [];
    const groupW = COLS * SIZE + (COLS - 1) * gapIn;
    const groupH = ROWS * SIZE + (ROWS - 1) * gapIn;
    for (let g = 0; g < GROUPS; g++) {
      const gx = g % 2;
      const gy = Math.floor(g / 2);
      const ox = gx * (groupW + gapOut);
      const oy = gy * (groupH + gapOut);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          out.push({
            i: out.length,
            g,
            x: ox + c * (SIZE + gapIn),
            y: oy + r * (SIZE + gapIn),
          });
        }
      }
    }
    return out;
  });

  const extent = $derived.by(() => {
    const w = Math.max(...squares.map((s) => s.x)) + SIZE;
    const h = Math.max(...squares.map((s) => s.y)) + SIZE;
    return { w, h };
  });

  /* ── 感知亲和度 ───────────────────────────────────────────────────── */
  /** 接近性：以方块边长为尺度，间隙小于 1 个边长时连接强度接近满值 */
  function proximity(a: Sq, b: Sq): number {
    const dx = Math.max(0, Math.abs(a.x - b.x) - SIZE);
    const dy = Math.max(0, Math.abs(a.y - b.y) - SIZE);
    const gap = Math.hypot(dx, dy);
    return Math.max(0, 1 - gap / (SIZE * 1.15));
  }

  /** 相似性：同组同色。色相差越大，「不同组」的信号越强，但上限低于接近性 */
  const simStrength = $derived(Math.min(1, hue / 70) * 0.45);
  /** 共同区域：底色越明显，同组的封闭感越强 */
  const regionStrength = $derived(region * 0.7);
  /** 闭合惩罚：每个方块自带一圈边框 → 它把自己封闭成独立单元，反而削弱成组 */
  const borderPenalty = $derived((border / 4) * 0.4);

  const THRESHOLD = 0.5;

  const detected = $derived.by(() => {
    const parent = squares.map((_, i) => i);
    const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i]!)));
    const union = (i: number, j: number) => {
      const a = find(i);
      const b = find(j);
      if (a !== b) parent[b] = a;
    };

    let maxCue: { name: keyof typeof T.cues; v: number } = { name: 'none', v: 0 };

    for (let i = 0; i < squares.length; i++) {
      for (let j = i + 1; j < squares.length; j++) {
        const a = squares[i]!;
        const b = squares[j]!;
        const same = a.g === b.g;
        const p = proximity(a, b);
        const s = same ? simStrength : 0;
        const r = same ? regionStrength : 0;
        const affinity = p + s + r - borderPenalty;

        if (p > maxCue.v) maxCue = { name: 'prox', v: p };
        if (s > maxCue.v) maxCue = { name: 'sim', v: s };
        if (r > maxCue.v) maxCue = { name: 'region', v: r };

        if (affinity > THRESHOLD) union(i, j);
      }
    }

    const comps = new Map<number, Sq[]>();
    for (const sq of squares) {
      const root = find(sq.i);
      if (!comps.has(root)) comps.set(root, []);
      comps.get(root)!.push(sq);
    }
    return { groups: [...comps.values()], dominant: maxCue.name };
  });

  const ok = $derived(detected.groups.length === GROUPS);
  const gapRatio = $derived(gapIn > 0 ? gapOut / gapIn : Infinity);

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
      base: cssVar('--accent', '#2563eb'),
      line: cssVar('--line-2', '#cbd5e1'),
      ink: cssVar('--ink-3', '#64748b'),
      good: cssVar('--good', '#059669'),
      bad: cssVar('--bad', '#dc2626'),
      wash: cssVar('--surface-2', '#f1f5f9'),
    };
  });

  function groupColor(g: number): string {
    const c = hsl(colors.base);
    c.h = (c.h + g * (hue / GROUPS) * (360 / 120)) % 360;
    return c.formatHex();
  }

  const tableRows = $derived([
    [locale === 'zh' ? '项' : 'Item', locale === 'zh' ? '值' : 'Value'],
    [T.perceived, `${detected.groups.length}`],
    [T.intended, `${GROUPS}`],
    [T.ratio, gapRatio === Infinity ? '∞' : gapRatio.toFixed(2)],
    [T.dominant, T.cues[detected.dominant]],
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <Slider label={T.gapIn} bind:value={gapIn} min={0} max={30} unit="px" />
    <Slider label={T.gapOut} bind:value={gapOut} min={0} max={60} unit="px" />
    <Slider label={T.hue} bind:value={hue} min={0} max={180} unit="°" />
    <Slider label={T.border} bind:value={border} min={0} max={4} step={0.5} unit="px" />
    <Slider label={T.region} bind:value={region} min={0} max={1} step={0.05} format={(v) => `${Math.round(v * 100)}%`} />
  </div>

  <div class="cluster" style="--gap: var(--space-2)">
    <span style="font-size: var(--step--2); color: var(--ink-3); font-weight:600">{T.presetTitle}</span>
    <button class="chip" type="button" onclick={() => preset(1)}>{T.p1}</button>
    <button class="chip" type="button" onclick={() => preset(2)}>{T.p2}</button>
    <button class="chip" type="button" onclick={() => preset(3)}>{T.p3}</button>
    <button class="chip" type="button" onclick={() => preset(4)}>{T.p4}</button>
  </div>

  <ResponsiveChart title={T.title} desc={T.desc} ratio={1.9} minHeight={240} rows={tableRows}>
    {#snippet children({ width, height })}
      {@const pad = 28}
      {@const scale = Math.min((width - pad * 2) / extent.w, (height - pad * 2) / extent.h, 1.6)}
      {@const ox = (width - extent.w * scale) / 2}
      {@const oy = (height - extent.h * scale) / 2}

      <!-- 检测到的分组包围盒 —— 算法输出，不是预设 -->
      <g>
        {#each detected.groups as grp, gi (gi)}
          {@const xs = grp.map((s) => s.x)}
          {@const ys = grp.map((s) => s.y)}
          {@const x0 = Math.min(...xs) * scale + ox - 7}
          {@const y0 = Math.min(...ys) * scale + oy - 7}
          {@const x1 = (Math.max(...xs) + SIZE) * scale + ox + 7}
          {@const y1 = (Math.max(...ys) + SIZE) * scale + oy + 7}
          <rect
            x={x0}
            y={y0}
            width={x1 - x0}
            height={y1 - y0}
            fill="none"
            stroke={ok ? colors.good : colors.bad}
            stroke-width="1.5"
            stroke-dasharray="5 4"
            rx="6"
            opacity="0.8"
          />
        {/each}
      </g>

      <!-- 共同区域底色（每个设计意图组一块面） -->
      {#if region > 0.02}
        <g>
          {#each Array(GROUPS) as _, g (g)}
            {@const grp = squares.filter((s) => s.g === g)}
            {@const xs = grp.map((s) => s.x)}
            {@const ys = grp.map((s) => s.y)}
            <rect
              x={Math.min(...xs) * scale + ox - 5}
              y={Math.min(...ys) * scale + oy - 5}
              width={(Math.max(...xs) + SIZE - Math.min(...xs)) * scale + 10}
              height={(Math.max(...ys) + SIZE - Math.min(...ys)) * scale + 10}
              fill={colors.wash}
              opacity={region}
              rx="5"
            />
          {/each}
        </g>
      {/if}

      <!-- 方块 -->
      {#each squares as sq (sq.i)}
        <rect
          x={sq.x * scale + ox}
          y={sq.y * scale + oy}
          width={SIZE * scale}
          height={SIZE * scale}
          fill={groupColor(sq.g)}
          stroke={border > 0 ? colors.ink : 'none'}
          stroke-width={border}
          rx="2"
        />
      {/each}
    {/snippet}
  </ResponsiveChart>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.perceived}</p>
      <p class={`readout__value ${ok ? 'readout__value--good' : 'readout__value--bad'}`}>
        {detected.groups.length}<span style="font-size:.55em">{T.unit}</span>
      </p>
      <p class="readout__note">{T.intended}: {GROUPS}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.ratio}</p>
      <p class={`readout__value ${gapRatio >= 2 ? 'readout__value--good' : 'readout__value--warn'}`}>
        {gapRatio === Infinity ? '∞' : gapRatio.toFixed(1)}×
      </p>
      <p class="readout__note">{locale === 'zh' ? '≥ 2 时分组几乎不会误判' : '≥ 2 makes grouping unambiguous'}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.dominant}</p>
      <p class="readout__value" style="font-size: var(--step-0)">{T.cues[detected.dominant]}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{locale === 'zh' ? '判定' : 'Verdict'}</p>
      <p class="readout__value" style={`font-size: var(--step--1); color: ${ok ? 'var(--good)' : 'var(--bad)'}`}>
        {ok ? T.verdictOk : T.verdictBad}
      </p>
    </div>
  </div>

  <p class="note" style="margin:0">{T.lesson}</p>
</div>
