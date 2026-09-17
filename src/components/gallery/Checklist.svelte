<script lang="ts">
  /**
   * 案例馆 · 布局自检清单
   *
   * 32 条，按章节分组，勾选状态存 localStorage，可导出 Markdown。
   * 标了「可自动检测」的条目，说明它应该进 CI 而不是靠人记。
   */
  import { checklist, type ChecklistGroup } from '@/data/checklist';
  import type { Locale } from '@/i18n/locales';

  /** sectionHrefs 由 Astro 页面在构建期算好传入 —— 理由同 DecisionTree */
  let {
    locale = 'zh',
    sectionHrefs = {},
    groupNames = [],
  }: {
    locale?: Locale;
    sectionHrefs?: Record<string, string>;
    /** 分组名由页面从 lessons 派生后传入 —— 见 data/checklist.ts 的说明 */
    groupNames?: ChecklistGroup[];
  } = $props();

  const groupLabel = $derived((g: number) => groupNames.find((x) => x.order === g)?.label[locale] ?? String(g));

  const T = $derived({
    zh: {
      progress: '完成进度',
      auto: '可自动检测',
      autoNote: '这类条目应该进 CI，而不是靠人记',
      export: '导出 Markdown',
      exported: '已复制',
      clear: '清空勾选',
      onlyAuto: '只看可自动检测的',
      all: '全部',
      title: '布局自检清单',
      hint: '上线前过一遍。标了 ⚙ 的条目可以被自动检测 —— 如果你的项目里还没有对应的检查，那就是下一个该补的工程投入。',
    },
    en: {
      progress: 'Progress',
      auto: 'Machine-checkable',
      autoNote: 'These belong in CI, not in someone’s memory',
      export: 'Export Markdown',
      exported: 'Copied',
      clear: 'Clear all',
      onlyAuto: 'Machine-checkable only',
      all: 'All',
      title: 'Layout checklist',
      hint: 'Run through this before shipping. Items marked ⚙ can be checked automatically — if your project has no such check yet, that is the next piece of engineering worth funding.',
    },
  }[locale]);

  const KEY = 'lc-checklist';
  let checked = $state<Set<string>>(new Set());
  let onlyAuto = $state(false);
  let exported = $state(false);

  $effect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) checked = new Set(JSON.parse(raw) as string[]);
    } catch {
      /* 无痕模式下不持久化 */
    }
  });

  function toggle(id: string) {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    checked = next;
    try {
      localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  }

  const visible = $derived(onlyAuto ? checklist.filter((c) => c.automatable) : checklist);
  const groups = $derived([...new Set(visible.map((c) => c.group))].sort());
  const doneCount = $derived(visible.filter((c) => checked.has(c.id)).length);
  const pct = $derived(visible.length ? Math.round((doneCount / visible.length) * 100) : 0);
  const autoCount = $derived(checklist.filter((c) => c.automatable).length);

  const sectionHref = (sec: string) => sectionHrefs[sec] ?? "#";

  async function exportMd() {
    const md =
      `# ${T.title}\n\n` +
      groups
        .map((g) => {
          const items = visible.filter((c) => c.group === g);
          return (
            `## ${groupLabel(g)}\n\n` +
            items.map((c) => `- [${checked.has(c.id) ? 'x' : ' '}] ${c.text[locale]} (§${c.section})`).join('\n')
          );
        })
        .join('\n\n');
    try {
      await navigator.clipboard.writeText(md);
      exported = true;
      setTimeout(() => (exported = false), 1600);
    } catch {
      /* ignore */
    }
  }
</script>

<div class="stack-5">
  <div class="controls">
    <div class="control" style="flex: 1 1 14rem">
      <span class="control__label">
        <span>{T.progress}</span>
        <span class="control__value">{doneCount} / {visible.length} · {pct}%</span>
      </span>
      <div class="cl__bar" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
        <i style={`inline-size:${pct}%`}></i>
      </div>
    </div>
    <div class="control" style="flex: 0 1 20rem">
      <span class="control__label"><span>&nbsp;</span></span>
      <div class="cluster" style="--gap: var(--space-2)">
        <button class="chip" type="button" aria-pressed={!onlyAuto} onclick={() => (onlyAuto = false)}>{T.all}</button>
        <button class="chip" type="button" aria-pressed={onlyAuto} onclick={() => (onlyAuto = true)}>
          ⚙ {T.onlyAuto} ({autoCount})
        </button>
        <button class="btn" type="button" onclick={exportMd}>{exported ? `✓ ${T.exported}` : T.export}</button>
        <button class="btn" type="button" onclick={() => { checked = new Set(); try { localStorage.removeItem(KEY); } catch {} }}>
          {T.clear}
        </button>
      </div>
    </div>
  </div>

  <div class="cl__groups">
    {#each groups as g (g)}
      <section class="cl__group">
        <h4>{groupLabel(g)}</h4>
        <ul>
          {#each visible.filter((c) => c.group === g) as item (item.id)}
            <li class:is-done={checked.has(item.id)}>
              <label>
                <input type="checkbox" checked={checked.has(item.id)} onchange={() => toggle(item.id)} />
                <span class="cl__text">{item.text[locale]}</span>
              </label>
              <span class="cl__meta">
                {#if item.automatable}<span class="cl__auto" title={T.autoNote}>⚙</span>{/if}
                <a href={sectionHref(item.section)}>§{item.section}</a>
              </span>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>

  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .cl__bar {
    block-size: 8px;
    background: var(--surface-3);
    border-radius: 4px;
    overflow: hidden;
  }
  .cl__bar i {
    display: block;
    block-size: 100%;
    background: var(--good);
    transition: inline-size var(--motion-base) var(--ease-out);
  }
  .cl__groups {
    display: grid;
    gap: var(--space-5);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
    align-items: start;
  }
  .cl__group h4 {
    font-size: var(--step--1);
    color: var(--ink-1);
    margin-block-end: var(--space-2);
  }
  .cl__group ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 2px;
  }
  .cl__group li {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
    padding: var(--space-3);
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius-sm);
    font-size: var(--step--2);
    margin: 0;
  }
  .cl__group li.is-done {
    background: var(--good-wash);
    border-color: color-mix(in srgb, var(--good) 35%, var(--line-1));
  }
  .cl__group li.is-done .cl__text {
    color: var(--ink-4);
    text-decoration: line-through;
  }
  .cl__group label {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
    cursor: pointer;
    flex: 1;
    min-inline-size: 0;
  }
  .cl__group input {
    inline-size: 18px;
    block-size: 18px;
    margin-block-start: 1px;
    accent-color: var(--good);
    flex: none;
  }
  .cl__meta {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    flex: none;
    font-family: var(--font-mono);
    color: var(--ink-4);
  }
  .cl__auto {
    color: var(--accent);
    cursor: help;
  }
</style>
