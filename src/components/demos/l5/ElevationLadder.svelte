<script lang="ts">
  /**
   * 5.2 演示 · 层次阶梯：面 / 影 / 线
   *
   * 三种手段的四级阶梯并排，可切换明暗。
   * D3 画出相邻层的**实测感知亮度差**，低于阈值的标红 ——
   * 暗色模式下阴影阶梯会明显躺平，这就是「阴影在暗色下失效」的量化证据。
   */
  import { scaleLinear } from '@/lib/d3-kit';
  import { cssVar, layerSeparation, LAYER_DISCRIMINATION_THRESHOLD } from '@/lib/color';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      theme: '主题',
      light: '明亮',
      dark: '暗色',
      surface: '面色',
      shadow: '阴影',
      border: '边框',
      title: '相邻层的感知亮度差',
      desc: '三种分层手段各自相邻层之间的感知亮度差；低于 3 的相邻层人眼分辨不出。',
      sep: '相邻层亮度差',
      threshold: '可辨阈值',
      usable: '可用层数',
      hint: '切到暗色模式：阴影阶梯的四根柱子几乎一样高（因为暗底上加暗看不出来），而面色阶梯依然清晰。这就是为什么暗色模式的层次必须由亮度承担。',
      note: '本站明亮模式下页面底与卡片面只差 2.1 —— 低于阈值，所以必须靠一点点阴影补强。暗色模式下这两层差 4.8，不需要阴影。',
      level: '层',
      belowThreshold: '低于阈值',
    },
    en: {
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      surface: 'Surface',
      shadow: 'Shadow',
      border: 'Border',
      title: 'Perceptual lightness difference between adjacent layers',
      desc: 'Lightness difference between adjacent steps for each layering device; below 3 the eye cannot tell them apart.',
      sep: 'Adjacent separation',
      threshold: 'Discrimination threshold',
      usable: 'Usable levels',
      hint: 'Switch to dark mode: the four shadow bars flatten to almost the same height (darkening a dark ground is invisible) while the surface ladder stays clear. That is why dark-mode layering must be carried by luminance.',
      note: 'In this site’s light theme, page ground and card surface differ by only 2.1 — below the threshold, so a faint shadow does necessary work. In dark mode the same pair differs by 4.8 and needs none.',
      level: 'Level',
      belowThreshold: 'below threshold',
    },
  }[locale]);

  let theme = $state<'light' | 'dark'>('light');

  const SURFACES = {
    light: ['#f6f8fb', '#ffffff', '#f1f5f9', '#e2e8f0'],
    dark: ['#0b1120', '#131c2e', '#1b2639', '#263349'],
  };
  /** 阴影在各自底色上的「有效亮度」—— 阴影本质是把背景变暗 */
  const SHADOW_EFFECT = {
    light: ['#f6f8fb', '#f1f3f7', '#e9ecf2', '#dfe3ec'],
    dark: ['#0b1120', '#0a1019', '#090e17', '#080d15'],
  };
  const BORDERS = {
    light: ['#f6f8fb', '#ffffff', '#ffffff', '#ffffff'],
    dark: ['#0b1120', '#131c2e', '#131c2e', '#131c2e'],
  };

  function seps(list: string[]): number[] {
    return list.slice(1).map((c, i) => layerSeparation(list[i]!, c));
  }

  const data = $derived([
    { key: 'surface', label: T.surface, seps: seps(SURFACES[theme]) },
    { key: 'shadow', label: T.shadow, seps: seps(SHADOW_EFFECT[theme]) },
    { key: 'border', label: T.border, seps: seps(BORDERS[theme]) },
  ]);

  const usable = $derived(
    data.map((d) => ({
      key: d.key,
      n: 1 + d.seps.filter((s) => s >= LAYER_DISCRIMINATION_THRESHOLD).length,
    })),
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
      bar: cssVar('--ch5', '#db2777'),
      bad: cssVar('--bad', '#dc2626'),
      ink: cssVar('--ink-3', '#64748b'),
      line: cssVar('--line-1', '#e2e8f0'),
      warn: cssVar('--warn', '#d97706'),
    };
  });

  const tableRows = $derived([
    [locale === 'zh' ? '手段' : 'Device', '1→2', '2→3', '3→4'],
    ...data.map((d) => [d.label, ...d.seps.map((s) => s.toFixed(1))]),
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <div class="control" style="flex: 0 1 12rem">
      <span class="control__label"><span>{T.theme}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" aria-pressed={theme === 'light'} onclick={() => (theme = 'light')}>{T.light}</button>
        <button class="chip" type="button" aria-pressed={theme === 'dark'} onclick={() => (theme = 'dark')}>{T.dark}</button>
      </div>
    </div>
  </div>

  <!-- 三种手段的四级阶梯（真实渲染） -->
  <div class="el__ladders" data-theme-preview={theme}>
    {#each [{ key: 'surface', label: T.surface }, { key: 'shadow', label: T.shadow }, { key: 'border', label: T.border }] as dev (dev.key)}
      <div class="el__col">
        <p class="control__label"><span>{dev.label}</span></p>
        <div class="el__stack">
          {#each [0, 1, 2, 3] as lvl (lvl)}
            <div
              class="el__layer"
              data-dev={dev.key}
              data-lvl={lvl}
              style={dev.key === 'surface' ? `background:${SURFACES[theme][lvl]}` : ''}
            >
              {T.level} {lvl + 1}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <ResponsiveChart title={T.title} desc={T.desc} ratio={2.8} minHeight={170} rows={tableRows}>
    {#snippet children({ width, height })}
      {@const padL = 62}
      {@const padB = 24}
      {@const padT = 14}
      {@const maxV = Math.max(6, ...data.flatMap((d) => d.seps))}
      {@const y = scaleLinear().domain([0, maxV]).range([height - padB, padT])}
      {@const groupW = (width - padL - 12) / data.length}

      <!-- 阈值线 -->
      <line
        x1={padL}
        y1={y(LAYER_DISCRIMINATION_THRESHOLD)}
        x2={width - 12}
        y2={y(LAYER_DISCRIMINATION_THRESHOLD)}
        stroke={colors.warn}
        stroke-width="1.5"
        stroke-dasharray="5 4"
      />
      <text x={padL - 6} y={y(LAYER_DISCRIMINATION_THRESHOLD) + 3} text-anchor="end" font-size="9" fill={colors.warn}>
        {T.threshold} {LAYER_DISCRIMINATION_THRESHOLD}
      </text>

      {#each data as d, gi (d.key)}
        {@const gx = padL + gi * groupW}
        {@const bw = (groupW - 18) / d.seps.length}
        {#each d.seps as s, i (i)}
          <rect
            x={gx + i * bw + 4}
            y={y(s)}
            width={bw - 5}
            height={height - padB - y(s)}
            fill={s >= LAYER_DISCRIMINATION_THRESHOLD ? colors.bar : colors.bad}
            opacity={s >= LAYER_DISCRIMINATION_THRESHOLD ? 0.85 : 0.5}
            rx="2"
          />
          <text x={gx + i * bw + 4 + (bw - 5) / 2} y={y(s) - 4} text-anchor="middle" font-size="9" fill={colors.ink}>
            {s.toFixed(1)}
          </text>
        {/each}
        <text x={gx + groupW / 2 - 6} y={height - 8} text-anchor="middle" font-size="10" fill={colors.ink}>
          {d.label}
        </text>
      {/each}
      <line x1={padL} y1={height - padB} x2={width - 12} y2={height - padB} stroke={colors.line} />
    {/snippet}
  </ResponsiveChart>

  <div class="readout">
    {#each usable as u, i (u.key)}
      <div class="readout__item">
        <p class="readout__label">{data[i]!.label} · {T.usable}</p>
        <p class={`readout__value readout__value--${u.n >= 3 ? 'good' : 'bad'}`}>{u.n}</p>
        <p class="readout__note">
          {u.n < 4 ? `${4 - u.n} ${T.belowThreshold}` : ''}
        </p>
      </div>
    {/each}
  </div>

  <p class="key-point" style="margin:0">{T.note}</p>
  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .el__ladders {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
    gap: var(--space-4);
    padding: var(--space-4);
    border-radius: var(--radius);
    background: var(--surface-0);
    border: var(--hairline) solid var(--line-1);
  }
  .el__ladders[data-theme-preview='dark'] {
    background: #0b1120;
    color: #cbd5e1;
  }
  .el__stack {
    display: grid;
    gap: var(--space-3);
    margin-block-start: var(--space-2);
  }
  .el__layer {
    padding: var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--step--2);
    text-align: center;
  }
  /* 面色：靠 background（由内联样式给） */
  [data-theme-preview='dark'] .el__layer[data-dev='surface'] {
    color: #cbd5e1;
  }
  /* 阴影：底色相同，只有阴影强度递增 */
  [data-theme-preview='light'] .el__layer[data-dev='shadow'] {
    background: #ffffff;
  }
  [data-theme-preview='dark'] .el__layer[data-dev='shadow'] {
    background: #131c2e;
    color: #cbd5e1;
  }
  .el__layer[data-dev='shadow'][data-lvl='0'] { box-shadow: none; }
  .el__layer[data-dev='shadow'][data-lvl='1'] { box-shadow: 0 1px 2px rgb(15 23 42 / 0.06); }
  .el__layer[data-dev='shadow'][data-lvl='2'] { box-shadow: 0 2px 8px rgb(15 23 42 / 0.10); }
  .el__layer[data-dev='shadow'][data-lvl='3'] { box-shadow: 0 10px 28px rgb(15 23 42 / 0.16); }
  /* 边框：底色相同，只有边框粗细递增 */
  [data-theme-preview='light'] .el__layer[data-dev='border'] {
    background: #ffffff;
  }
  [data-theme-preview='dark'] .el__layer[data-dev='border'] {
    background: #131c2e;
    color: #cbd5e1;
  }
  .el__layer[data-dev='border'][data-lvl='0'] { border: 0; }
  .el__layer[data-dev='border'][data-lvl='1'] { border: 1px solid currentColor; }
  .el__layer[data-dev='border'][data-lvl='2'] { border: 2px solid currentColor; }
  .el__layer[data-dev='border'][data-lvl='3'] { border: 3px solid currentColor; }
</style>
