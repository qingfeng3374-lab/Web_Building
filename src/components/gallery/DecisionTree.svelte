<script lang="ts">
  /**
   * 案例馆 · 布局决策树
   *
   * 左：D3 画的树形结构，当前路径高亮
   * 右：当前问题 / 结论（含可复制的 CSS 与回到课程小节的链接）
   */
  import { cssVar } from '@/lib/color';
  import { treeById, type TreeNode } from '@/data/decision-tree';
  import type { Locale } from '@/i18n/locales';
  import ResponsiveChart from '@/components/viz/ResponsiveChart.svelte';

  /**
   * sectionHrefs 由 Astro 页面在**构建期**算好后作为 prop 传入。
   *
   * 为什么不在这里 import '@/content' 自己算：那会把六章正文（约 420KB）
   * 全部打进客户端包 —— 一个讲性能预算的站点不能犯这个错。
   * 岛屿只该接收它真正需要的那点数据。
   */
  let {
    locale = 'zh',
    sectionHrefs = {},
  }: { locale?: Locale; sectionHrefs?: Record<string, string> } = $props();

  const T = $derived({
    zh: { restart: '重新开始', back: '返回上一步', result: '推荐原语', why: '为什么', goto: '回到课程', copy: '复制 CSS', copied: '已复制', pathLabel: '当前路径' },
    en: { restart: 'Start over', back: 'Back', result: 'Recommended primitive', why: 'Why', goto: 'Go to the lesson', copy: 'Copy CSS', copied: 'Copied', pathLabel: 'Current path' },
  }[locale]);

  let trail = $state<string[]>(['root']);
  const current = $derived(treeById.get(trail[trail.length - 1]!)! as TreeNode);
  const isLeaf = $derived(Boolean(current.answer));

  function choose(next: string) {
    trail = [...trail, next];
  }
  function back() {
    if (trail.length > 1) trail = trail.slice(0, -1);
  }

  const sectionHref = (sec: string) => sectionHrefs[sec] ?? "#";

  let copied = $state(false);
  async function copyCss() {
    if (!current.answer) return;
    try {
      await navigator.clipboard.writeText(current.answer.css);
      copied = true;
      setTimeout(() => (copied = false), 1400);
    } catch {
      /* ignore */
    }
  }

  let themeTick = $state(0);
  $effect(() => {
    const on = () => themeTick++;
    document.addEventListener('lc:themechange', on);
    return () => document.removeEventListener('lc:themechange', on);
  });
  const colors = $derived.by(() => {
    themeTick;
    return {
      accent: cssVar('--accent', '#2563eb'),
      ink: cssVar('--ink-3', '#64748b'),
      ink1: cssVar('--ink-1', '#0f172a'),
      line: cssVar('--line-2', '#cbd5e1'),
      surface: cssVar('--surface-1', '#fff'),
      good: cssVar('--good', '#059669'),
    };
  });

  /** 简单的三层布局：root → 分支 → 叶子 */
  const LAYOUT: Array<{ id: string; col: number; row: number; label: string }> = [
    { id: 'root', col: 0, row: 1.5, label: '?' },
    { id: 'grid-kind', col: 1, row: 0.4, label: '2D' },
    { id: 'flex-kind', col: 1, row: 1.8, label: '1D' },
    { id: 'leaf-stack', col: 1, row: 3.1, label: 'Stack' },
    { id: 'leaf-areas', col: 2, row: 0 , label: 'areas' },
    { id: 'leaf-ram', col: 2, row: 0.75, label: 'RAM' },
    { id: 'leaf-subgrid', col: 2, row: 1.5, label: 'subgrid' },
    { id: 'leaf-cluster', col: 2, row: 2.25, label: 'Cluster' },
    { id: 'leaf-sidebar', col: 2, row: 3.0, label: 'Sidebar' },
    { id: 'leaf-switcher', col: 2, row: 3.75, label: 'Switcher' },
  ];
  const EDGES: Array<[string, string]> = [
    ['root', 'grid-kind'],
    ['root', 'flex-kind'],
    ['root', 'leaf-stack'],
    ['grid-kind', 'leaf-areas'],
    ['grid-kind', 'leaf-ram'],
    ['grid-kind', 'leaf-subgrid'],
    ['flex-kind', 'leaf-cluster'],
    ['flex-kind', 'leaf-sidebar'],
    ['flex-kind', 'leaf-switcher'],
  ];
</script>

<div class="dt__split">
  <ResponsiveChart
    title={locale === 'zh' ? '布局决策树' : 'Layout decision tree'}
    desc={locale === 'zh' ? '从根问题出发到各布局原语的决策路径，高亮的是当前选择。' : 'Decision paths from the root question to each layout primitive; the highlighted path is your current one.'}
    ratio={1.4}
    minHeight={280}
  >
    {#snippet children({ width, height })}
      {@const colW = (width - 90) / 2}
      {@const rowH = (height - 40) / 4}
      {@const px = (c: number) => 46 + c * colW}
      {@const py = (r: number) => 20 + r * rowH}
      {#each EDGES as [a, b] (a + b)}
        {@const na = LAYOUT.find((n) => n.id === a)!}
        {@const nb = LAYOUT.find((n) => n.id === b)!}
        {@const active = trail.includes(a) && trail.includes(b)}
        <path
          d={`M ${px(na.col) + 22} ${py(na.row)} C ${px(na.col) + 60} ${py(na.row)}, ${px(nb.col) - 60} ${py(nb.row)}, ${px(nb.col) - 22} ${py(nb.row)}`}
          fill="none"
          stroke={active ? colors.accent : colors.line}
          stroke-width={active ? 2.5 : 1.2}
          opacity={active ? 1 : 0.6}
        />
      {/each}
      {#each LAYOUT as n (n.id)}
        {@const active = trail.includes(n.id)}
        {@const isCurrent = trail[trail.length - 1] === n.id}
        <g>
          <rect
            x={px(n.col) - 30}
            y={py(n.row) - 13}
            width="60"
            height="26"
            rx="13"
            fill={isCurrent ? colors.accent : active ? colors.surface : colors.surface}
            stroke={active ? colors.accent : colors.line}
            stroke-width={isCurrent ? 2.5 : 1.5}
          />
          <text
            x={px(n.col)}
            y={py(n.row) + 4}
            text-anchor="middle"
            font-size="10"
            font-weight={active ? 700 : 500}
            fill={isCurrent ? colors.surface : active ? colors.accent : colors.ink}
          >
            {n.label}
          </text>
        </g>
      {/each}
    {/snippet}
  </ResponsiveChart>

  <div class="dt__panel">
    {#if isLeaf && current.answer}
      <p class="control__label"><span>{T.result}</span></p>
      <h4 class="dt__primitive">{current.answer.primitive}</h4>
      <p class="control__label" style="margin-block-start: var(--space-3)"><span>{T.why}</span></p>
      <p class="dt__why">{current.answer.why[locale]}</p>
      <pre class="console">{current.answer.css}</pre>
      <div class="cluster" style="--gap: var(--space-2)">
        <button class="btn" type="button" onclick={copyCss}>{copied ? `✓ ${T.copied}` : T.copy}</button>
        <a class="btn btn--primary" href={sectionHref(current.answer.section)}>
          {T.goto} §{current.answer.section} →
        </a>
        <button class="btn" type="button" onclick={back}>← {T.back}</button>
        <button class="btn" type="button" onclick={() => (trail = ['root'])}>{T.restart}</button>
      </div>
    {:else if current.question && current.options}
      <p class="control__label"><span>{T.pathLabel}: {trail.length} / 3</span></p>
      <p class="dt__question">{current.question[locale]}</p>
      <div class="dt__options">
        {#each current.options as opt (opt.next)}
          <button class="dt__option" type="button" onclick={() => choose(opt.next)}>
            {opt.label[locale]}
            <span aria-hidden="true">→</span>
          </button>
        {/each}
      </div>
      {#if trail.length > 1}
        <button class="btn" type="button" onclick={back} style="margin-block-start: var(--space-4)">← {T.back}</button>
      {/if}
    {/if}
  </div>
</div>

<style>
  .dt__split {
    display: grid;
    gap: var(--space-5);
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
    align-items: start;
  }
  @media (max-width: 58rem) {
    .dt__split {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .dt__panel {
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-5);
  }
  .dt__question {
    font-size: var(--step-0);
    color: var(--ink-1);
    margin-block: var(--space-2) var(--space-4);
    max-inline-size: var(--measure-narrow);
  }
  .dt__options {
    display: grid;
    gap: var(--space-2);
  }
  .dt__option {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    align-items: center;
    text-align: start;
    padding: var(--space-3) var(--space-4);
    border: var(--hairline) solid var(--line-2);
    border-radius: var(--radius);
    background: var(--surface-2);
    color: var(--ink-2);
    font-size: var(--step--1);
    cursor: pointer;
    min-block-size: 44px;
    transition: border-color var(--motion-fast), background var(--motion-fast);
  }
  .dt__option:hover {
    border-color: var(--accent);
    background: var(--accent-wash);
    color: var(--accent-ink);
  }
  .dt__primitive {
    font-size: var(--step-2);
    color: var(--accent-ink);
    font-family: var(--font-mono);
  }
  .dt__why {
    font-size: var(--step--1);
    color: var(--ink-2);
    margin-block: var(--space-2) var(--space-3);
  }
</style>
