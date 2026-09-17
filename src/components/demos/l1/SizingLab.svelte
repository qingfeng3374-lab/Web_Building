<script lang="ts">
  /**
   * 3.2 演示 · 内在尺寸与外在尺寸
   *
   * 上：四个真实盒子，宽度分别是 min-content / max-content / fit-content / 100%
   *     —— 用 ResizeObserver 实测它们的渲染宽度（不是算的）
   * 下：D3 把四条「宽度随容器宽度变化」的曲线画出来，交点就是行为分界
   */
  import { scaleLinear, line } from '@/lib/d3-kit';
  import { cssVar } from '@/lib/color';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      container: '容器宽度',
      content: '内容',
      c: { short: '短词', school: '长学院名（案例里最长的那个）', url: '长 URL（不可断词）', para: '一段话' },
      title: '四种尺寸模式的实测宽度',
      desc: '当前容器宽度下，四种尺寸关键字实际渲染出的宽度对比。',
      measured: '实测渲染宽度',
      hint: '把内容切到「长 URL」，再把容器拖到 240px —— min-content 也压不下去了，因为 URL 不可断词。这时候 100% 的盒子会溢出，而 fit-content 会贴着容器。溢出不是样式问题，是设计没为这种内容做准备。',
      overflowing: '溢出容器',
      note: 'fit-content = min(max-content, max(min-content, 可用空间))。它是绝大多数场景想要的行为，却是最少被写出来的那个。',
    },
    en: {
      container: 'Container width',
      content: 'Content',
      c: { short: 'Short word', school: 'Long school name (the longest in the case)', url: 'Long URL (unbreakable)', para: 'A paragraph' },
      title: 'Measured width of the four sizing modes',
      desc: 'Actual rendered widths of the four sizing keywords at the current container width.',
      measured: 'Measured rendered width',
      hint: 'Switch the content to “long URL” and drag the container down to 240px — even min-content cannot shrink, because the URL has no break opportunity. The 100% box now overflows while fit-content hugs the container. Overflow is not a styling problem; it is a design that did not plan for this content.',
      overflowing: 'overflows the container',
      note: 'fit-content = min(max-content, max(min-content, available)). It is what most situations want and the one people write least often.',
    },
  }[locale]);

  type ContentKey = 'short' | 'school' | 'url' | 'para';
  const CONTENT: Record<ContentKey, { zh: string; en: string }> = {
    short: { zh: '报到率', en: 'Rate' },
    school: { zh: '地球科学与技术学院', en: 'School of Geosciences and Technology' },
    url: { zh: 'https://neocampus.example.edu/enrolment/2025/summary', en: 'https://neocampus.example.edu/enrolment/2025/summary' },
    para: {
      zh: '2025 级新生共 4,286 人，来自 31 个省级行政区，分布在 18 个学院，报到率 98.2%。',
      en: 'The 2025 intake totals 4,286 students from 31 provincial regions across 18 schools, with a 98.2% check-in rate.',
    },
  };

  let containerW = $state(520);
  let content = $state<ContentKey>('school');

  const MODES = [
    { key: 'min', css: 'min-content', label: 'min-content' },
    { key: 'max', css: 'max-content', label: 'max-content' },
    { key: 'fit', css: 'fit-content', label: 'fit-content' },
    { key: 'full', css: '100%', label: '100%' },
  ] as const;

  /* ── 实测：四个盒子的真实渲染宽度 ────────────────────────────────── */
  let boxes = $state<Record<string, number>>({ min: 0, max: 0, fit: 0, full: 0 });
  let stage: HTMLDivElement | undefined = $state();

  function measure() {
    if (!stage) return;
    const next: Record<string, number> = {};
    for (const m of MODES) {
      const el = stage.querySelector(`[data-mode="${m.key}"] .sz__box`);
      next[m.key] = el ? Math.round(el.getBoundingClientRect().width) : 0;
    }
    boxes = next;
  }

  $effect(() => {
    void containerW;
    void content;
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  });

  $effect(() => {
    if (!stage) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(stage);
    return () => ro.disconnect();
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
      min: cssVar('--ink-4', '#94a3b8'),
      max: cssVar('--bad', '#dc2626'),
      fit: cssVar('--ch3', '#0d9488'),
      full: cssVar('--accent', '#2563eb'),
      ink: cssVar('--ink-3', '#64748b'),
      line: cssVar('--line-1', '#e2e8f0'),
    };
  });

  const tableRows = $derived([
    [locale === 'zh' ? '模式' : 'Mode', T.measured],
    ...MODES.map((m) => [m.label, `${boxes[m.key] ?? 0} px`]),
  ]);
</script>

<div class="stack-5">
  <div class="controls">
    <Slider label={T.container} bind:value={containerW} min={200} max={900} step={10} unit="px" />
    <div class="control" style="flex: 1 1 20rem">
      <span class="control__label"><span>{T.content}</span></span>
      <div class="chip-group">
        {#each Object.entries(T.c) as [key, label] (key)}
          <button class="chip" type="button" aria-pressed={content === key} onclick={() => (content = key as ContentKey)}>
            {label}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div class="sz__stage" bind:this={stage} style={`--cw:${containerW}px`}>
    {#each MODES as m (m.key)}
      <div class="sz__row" data-mode={m.key}>
        <span class="sz__label">{m.label}</span>
        <div class="sz__container">
          <div class="sz__box" style={`inline-size: ${m.css}`}>{CONTENT[content][locale]}</div>
        </div>
        <span
          class="sz__num"
          class:is-over={(boxes[m.key] ?? 0) > containerW + 1}
        >
          {boxes[m.key] ?? 0}px
        </span>
      </div>
    {/each}
  </div>

  <ResponsiveChart title={T.title} desc={T.desc} ratio={2.6} minHeight={170} rows={tableRows}>
    {#snippet children({ width, height })}
      {@const padL = 90}
      {@const padR = 56}
      {@const padT = 12}
      {@const maxW = Math.max(containerW, ...MODES.map((m) => boxes[m.key] ?? 0)) * 1.05}
      {@const x = scaleLinear().domain([0, maxW]).range([padL, width - padR])}
      {@const bandH = (height - padT * 2) / MODES.length}

      <!-- 容器宽度参考线 -->
      <rect x={padL} y={padT} width={x(containerW) - padL} height={height - padT * 2} fill={colors.line} opacity="0.35" rx="3" />
      <text x={x(containerW) + 4} y={padT + 10} font-size="9" fill={colors.ink}>{T.container} {containerW}px</text>

      {#each MODES as m, i (m.key)}
        {@const w = boxes[m.key] ?? 0}
        {@const y = padT + i * bandH}
        {@const over = w > containerW + 1}
        <rect
          x={padL}
          y={y + bandH * 0.2}
          width={Math.max(1, x(w) - padL)}
          height={bandH * 0.5}
          fill={colors[m.key]}
          opacity={over ? 1 : 0.75}
          rx="2"
        />
        <text x={padL - 8} y={y + bandH * 0.55} text-anchor="end" font-size="10.5" fill={colors.ink} font-family="var(--font-mono)">
          {m.label}
        </text>
        <text x={x(w) + 5} y={y + bandH * 0.58} font-size="10" fill={over ? colors.max : colors.ink} font-weight={over ? 700 : 400}>
          {w}px{over ? ' ⚠' : ''}
        </text>
      {/each}
    {/snippet}
  </ResponsiveChart>

  <p class="key-point" style="margin:0">{T.note}</p>
  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .sz__stage {
    background: var(--surface-0);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-4);
    display: grid;
    gap: var(--space-3);
    overflow-x: auto;
  }
  .sz__row {
    display: grid;
    grid-template-columns: 7rem minmax(0, 1fr) 4rem;
    gap: var(--space-3);
    align-items: center;
  }
  .sz__label {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--ink-3);
  }
  .sz__container {
    inline-size: var(--cw);
    max-inline-size: 100%;
    border: 1px dashed var(--line-2);
    background: var(--surface-1);
    padding: 2px;
  }
  .sz__box {
    background: color-mix(in srgb, var(--ch3) 16%, transparent);
    border: 1px solid var(--ch3);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
    font-size: var(--step--2);
    color: var(--ink-1);
    /* 刻意不设 overflow：溢出要看得见，这正是本节的论点 */
  }
  .sz__num {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--ink-3);
    text-align: end;
  }
  .sz__num.is-over {
    color: var(--bad);
    font-weight: 700;
  }
</style>
