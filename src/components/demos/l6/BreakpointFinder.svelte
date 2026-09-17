<script lang="ts">
  /**
   * 4.1 演示 · 内容断点探测器
   *
   * 拖动视口宽度，对四条内容约束逐一求值，D3 把「内容受损」的区间画成红带。
   * 红带的边界就是内容断点候选 —— 并与常见设备断点线做对照。
   */
  import { scaleLinear, range } from '@/lib/d3-kit';
  import { cssVar } from '@/lib/color';
  import { spanWidth } from '@/lib/grid';
  import { measureComfort } from '@/lib/layout-metrics';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      viewport: '视口宽度',
      title: '内容约束随视口宽度的满足情况',
      desc: '四条内容约束的满足曲线；红色区间表示至少一条约束被违反。',
      checks: '当前宽度下的内容检查',
      ok: '通过',
      fail: '违反',
      c: {
        measure: '正文行长在 45–75ch',
        card: 'KPI 卡片装得下最长学院名（247px）',
        chart: '图表宽度 ≥ 320px（6 个刻度可读）',
        target: '操作按钮 ≥ 24×24px',
      },
      found: '探测到的内容断点',
      device: '常见设备断点',
      deviceNote: '注意它们几乎都不与内容断点重合',
      hint: '慢慢把视口从 1920 拖到 320，盯着下面四条检查 —— 第一条变红的宽度，就是你真正该写断点的地方。它不会是 768。',
      none: '当前宽度下所有约束都满足',
    },
    en: {
      viewport: 'Viewport width',
      title: 'Whether each content constraint holds, by viewport width',
      desc: 'Satisfaction curves for four content constraints; red bands mark widths where at least one is violated.',
      checks: 'Content checks at this width',
      ok: 'pass',
      fail: 'violated',
      c: {
        measure: 'Measure within 45–75ch',
        card: 'KPI card fits the longest school name (247px)',
        chart: 'Chart at least 320px (six legible ticks)',
        target: 'Action buttons at least 24×24px',
      },
      found: 'Detected content breakpoints',
      device: 'Common device breakpoints',
      deviceNote: 'Note how rarely they coincide with the content ones',
      hint: 'Drag the viewport slowly from 1920 to 320 and watch the four checks — the width where the first turns red is where a breakpoint actually belongs. It will not be 768.',
      none: 'All constraints hold at this width',
    },
  }[locale]);

  let viewport = $state(1200);

  const GRID = { columns: 12, gutter: 24, margin: 32, max: 1440 };
  const DEVICE_BPS = [480, 768, 1024, 1280];

  /** 四条内容约束：返回 true 表示满足 */
  function checks(w: number) {
    const bodyWidth = Math.min(spanWidth(8, w, GRID), 68 * 8.2); // 正文最多 8 列，且限宽 68ch
    const ch = bodyWidth / 8.2; // 8.2px ≈ 当前字体下 1ch
    const cardW = spanWidth(3, w, GRID);
    const chartW = spanWidth(7, w, GRID);
    const targetOk = w >= 360; // 更窄时按钮组会被压到不足 24px
    return {
      measure: ch >= 45 && ch <= 75,
      card: cardW >= 247,
      chart: chartW >= 320,
      target: targetOk,
      ch,
      cardW,
      chartW,
    };
  }

  const now = $derived(checks(viewport));
  const failing = $derived(
    (['measure', 'card', 'chart', 'target'] as const).filter((k) => !now[k]),
  );

  const XS = range(320, 1921, 8);

  /** 扫描整个区间，找出「从满足变成违反」的边界 = 内容断点 */
  const foundBps = $derived.by(() => {
    const keys = ['measure', 'card', 'chart', 'target'] as const;
    const out: Array<{ w: number; key: string }> = [];
    for (const key of keys) {
      let prev = checks(XS[0]!)[key];
      for (const w of XS) {
        const cur = checks(w)[key];
        if (cur !== prev) {
          out.push({ w, key });
          prev = cur;
        }
      }
    }
    return out.sort((a, b) => a.w - b.w);
  });

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
      bad: cssVar('--bad', '#dc2626'),
      accent: cssVar('--ch4', '#d97706'),
      ink: cssVar('--ink-3', '#64748b'),
      line: cssVar('--line-1', '#e2e8f0'),
      device: cssVar('--ink-4', '#94a3b8'),
    };
  });

  const tableRows = $derived([
    [locale === 'zh' ? '约束' : 'Constraint', locale === 'zh' ? '当前' : 'Now'],
    [T.c.measure, now.measure ? T.ok : T.fail],
    [T.c.card, now.card ? T.ok : T.fail],
    [T.c.chart, now.chart ? T.ok : T.fail],
    [T.c.target, now.target ? T.ok : T.fail],
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <Slider label={T.viewport} bind:value={viewport} min={320} max={1920} step={4} unit="px" />
  </div>

  <ResponsiveChart title={T.title} desc={T.desc} ratio={2.6} minHeight={200} rows={tableRows}>
    {#snippet children({ width, height })}
      {@const padL = 116}
      {@const padR = 14}
      {@const padT = 10}
      {@const padB = 26}
      {@const x = scaleLinear().domain([320, 1920]).range([padL, width - padR])}
      {@const keys = [
        { k: 'measure' as const, label: T.c.measure },
        { k: 'card' as const, label: T.c.card },
        { k: 'chart' as const, label: T.c.chart },
        { k: 'target' as const, label: T.c.target },
      ]}
      {@const rowH = (height - padT - padB) / keys.length}

      <!-- 每条约束一条带：绿=满足，红=违反 -->
      {#each keys as row, i (row.k)}
        {@const y = padT + i * rowH}
        {#each XS as w, j (j)}
          {#if j < XS.length - 1}
            <rect
              x={x(w)}
              y={y + rowH * 0.18}
              width={Math.max(1, x(XS[j + 1]!) - x(w) + 0.6)}
              height={rowH * 0.5}
              fill={checks(w)[row.k] ? colors.good : colors.bad}
              opacity={checks(w)[row.k] ? 0.5 : 0.75}
            />
          {/if}
        {/each}
        <text x={padL - 8} y={y + rowH * 0.5} text-anchor="end" font-size="9.5" fill={colors.ink}>
          {row.label.length > 22 ? row.label.slice(0, 21) + '…' : row.label}
        </text>
      {/each}

      <!-- 设备断点（灰虚线） -->
      {#each DEVICE_BPS as d (d)}
        <line x1={x(d)} y1={padT} x2={x(d)} y2={height - padB} stroke={colors.device} stroke-dasharray="3 4" />
        <text x={x(d)} y={height - 14} text-anchor="middle" font-size="8.5" fill={colors.device}>{d}</text>
      {/each}

      <!-- 内容断点（橙实线） -->
      {#each foundBps as bp (bp.key + bp.w)}
        <line x1={x(bp.w)} y1={padT} x2={x(bp.w)} y2={height - padB} stroke={colors.accent} stroke-width="2" />
        <text x={x(bp.w)} y={padT - 1} text-anchor="middle" font-size="9" font-weight="700" fill={colors.accent}>
          {bp.w}
        </text>
      {/each}

      <!-- 当前视口 -->
      <line x1={x(viewport)} y1={padT - 6} x2={x(viewport)} y2={height - padB} stroke={colors.ink} stroke-width="2" />
      <circle cx={x(viewport)} cy={padT - 6} r="4" fill={colors.ink} />
    {/snippet}
  </ResponsiveChart>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.checks}</p>
      <p class={`readout__value readout__value--${failing.length ? 'bad' : 'good'}`} style="font-size: var(--step-0)">
        {failing.length ? `${failing.length} ${T.fail}` : T.none}
      </p>
      <p class="readout__note">
        {locale === 'zh' ? '行长' : 'measure'} {now.ch.toFixed(0)}ch ·
        {locale === 'zh' ? '卡片' : 'card'} {now.cardW.toFixed(0)}px ·
        {locale === 'zh' ? '图表' : 'chart'} {now.chartW.toFixed(0)}px
      </p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.found}</p>
      <p class="readout__value" style="font-size: var(--step-0); color: var(--ch4)">
        {foundBps.map((b) => b.w).join(' · ') || '—'}
      </p>
      <p class="readout__note">{T.device}: {DEVICE_BPS.join(' · ')} — {T.deviceNote}</p>
    </div>
  </div>

  <ul class="bf__checks">
    {#each [['measure', T.c.measure], ['card', T.c.card], ['chart', T.c.chart], ['target', T.c.target]] as [key, label] (key)}
      <li class={now[key as 'measure'] ? 'is-ok' : 'is-bad'}>
        <span>{now[key as 'measure'] ? '✓' : '✗'}</span>{label}
      </li>
    {/each}
  </ul>

  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .bf__checks {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 2px;
    font-size: var(--step--2);
  }
  .bf__checks li {
    display: flex;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    border: var(--hairline) solid var(--line-1);
    background: var(--surface-1);
    margin: 0;
  }
  .bf__checks li span {
    font-weight: 700;
    flex: none;
  }
  .bf__checks .is-ok {
    border-color: color-mix(in srgb, var(--good) 35%, var(--line-1));
  }
  .bf__checks .is-ok span {
    color: var(--good);
  }
  .bf__checks .is-bad {
    border-color: var(--bad);
    background: var(--bad-wash);
  }
  .bf__checks .is-bad span {
    color: var(--bad);
  }
</style>
