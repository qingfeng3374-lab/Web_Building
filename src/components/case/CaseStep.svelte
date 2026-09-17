<script lang="ts">
  /**
   * 每章末尾的案例小节装置：**这一层给页面加了什么**。
   *
   * 与上一版（列举「修掉了哪几个病灶」）的区别是根本性的：
   * 那个版本让读者学会挑毛病，这个版本让读者学会动手。
   *
   * 三块内容：
   *   ① 对比器：这一章之前 ↔ 之后
   *   ② 本层加上的能力清单
   *   ③ 六项指标 —— 并标出「本层负责哪一项」
   */
  import CaseCompare from './CaseCompare.svelte';
  import { stages, stageById, metricSpecs, type MetricKey } from '@/content/case';
  import type { CaseStage } from '@/content/types';
  import { useUI } from '@/i18n/ui';

  let {
    before,
    after,
    locale = 'zh',
  }: { before: CaseStage; after: CaseStage; locale?: 'zh' | 'en' } = $props();

  const t = $derived(useUI(locale));
  const bInfo = $derived(stageById.get(before)!);
  const aInfo = $derived(stageById.get(after)!);
  const idx = $derived(stages.findIndex((s) => s.id === after));

  const T = $derived({
    zh: {
      adds: '本层加上',
      built: '建造进度',
      owned: '本层负责',
      carried: '沿用',
      pending: '后面的层负责',
      unchanged: '本层不动它 —— 这是刻意的：一次只推动一件事，改动与结果才能对应得上。',
      of: '层',
    },
    en: {
      adds: 'This layer adds',
      built: 'Build progress',
      owned: 'owned here',
      carried: 'carried over',
      pending: 'owned by a later layer',
      unchanged:
        'This layer deliberately leaves it alone — moving one thing at a time is what keeps cause and effect attributable.',
      of: 'layers',
    },
  }[locale]);

  function delta(key: MetricKey) {
    const spec = metricSpecs.find((s) => s.key === key)!;
    const now = aInfo.metrics[key];
    const prev = bInfo.metrics[key];
    const diff = now - prev;
    const moved = Math.abs(diff) >= 10 ** -spec.digits / 2;

    let improved = false;
    if (spec.direction === 'up') improved = diff > 0;
    else if (spec.direction === 'down') improved = diff < 0;
    else {
      const [lo, hi] = spec.target!;
      const dist = (v: number) => (v < lo ? lo - v : v > hi ? v - hi : 0);
      improved = dist(now) < dist(prev);
    }

    return {
      moved,
      improved,
      owned: spec.ownedBy === aInfo.fromLesson,
      text: moved
        ? `${prev.toFixed(spec.digits)} → ${now.toFixed(spec.digits)}`
        : now.toFixed(spec.digits),
      unit: spec.unit,
      ownerLesson: spec.ownedBy,
    };
  }
</script>

<div class="stack-5">
  <CaseCompare {before} {after} {locale} />

  <div class="cs__grid">
    <section class="cs__panel cs__panel--adds">
      <h4>{T.adds}</h4>
      <p class="cs__headline">{aInfo.headline[locale]}</p>
      <ul>
        {#each aInfo.changes as c, i (i)}
          <li>{c[locale]}</li>
        {/each}
      </ul>
    </section>

    <section class="cs__panel">
      <h4>{t('case.metrics')}</h4>
      <dl class="cs__metrics">
        {#each metricSpecs as spec (spec.key)}
          {@const d = delta(spec.key)}
          <div class:is-owned={d.owned}>
            <dt>
              {t(`metric.${spec.key}` as any)}
              {#if d.owned}<span class="cs__badge">{T.owned}</span>{/if}
            </dt>
            <dd class:is-up={d.moved && d.improved} class:is-down={d.moved && !d.improved}>
              {d.text}{d.unit}
            </dd>
          </div>
        {/each}
      </dl>
      <p class="cs__note">{T.unchanged}</p>
    </section>
  </div>

  <!-- 建造进度：六层里走到哪了 -->
  <div class="cs__progress" role="group" aria-label={T.built}>
    {#each stages as s, i (s.id)}
      <span
        class="cs__dot"
        class:is-done={i <= idx}
        class:is-current={i === idx}
        title={s.name[locale]}
      >
        <i></i>
        <b>{s.name[locale]}</b>
      </span>
    {/each}
  </div>
</div>

<style>
  .cs__grid {
    display: grid;
    gap: var(--space-5);
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    align-items: start;
  }
  @container (max-width: 44rem) {
    .cs__grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .cs__panel {
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-5);
  }
  .cs__panel--adds {
    border-inline-start: 3px solid var(--ch, var(--accent));
  }
  .cs__panel h4 {
    font-size: var(--step--1);
    color: var(--ink-1);
  }
  .cs__headline {
    margin-block: var(--space-2) var(--space-3);
    font-size: var(--step-0);
    color: var(--ink-1);
    font-weight: 650;
  }
  .cs__panel ul {
    margin: 0;
    padding-inline-start: 1.2em;
    font-size: var(--step--1);
    color: var(--ink-2);
  }
  .cs__panel li + li {
    margin-block-start: var(--space-2);
  }
  .cs__metrics {
    margin: var(--space-3) 0 0;
    display: grid;
    gap: var(--space-2);
  }
  .cs__metrics div {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    align-items: baseline;
    padding: var(--space-2) var(--space-3);
    background: var(--surface-2);
    border-radius: var(--radius-sm);
    font-size: var(--step--2);
  }
  .cs__metrics div.is-owned {
    background: var(--accent-wash);
    outline: 1px solid var(--accent-line);
  }
  .cs__metrics dt {
    color: var(--ink-3);
    display: flex;
    gap: var(--space-2);
    align-items: baseline;
  }
  .cs__badge {
    font-size: 9px;
    padding: 1px var(--space-1);
    border-radius: 3px;
    background: var(--accent);
    color: #fff;
    font-weight: 700;
    white-space: nowrap;
  }
  .cs__metrics dd {
    margin: 0;
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    color: var(--ink-4);
    text-align: end;
  }
  .cs__metrics dd.is-up {
    color: var(--good);
    font-weight: 700;
  }
  .cs__metrics dd.is-down {
    color: var(--bad);
    font-weight: 700;
  }
  .cs__note {
    margin-block-start: var(--space-3);
    font-size: var(--step--2);
    color: var(--ink-4);
  }

  .cs__progress {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: stretch;
  }
  .cs__dot {
    flex: 1 1 5rem;
    display: grid;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    font-size: var(--step--2);
    color: var(--ink-4);
  }
  .cs__dot i {
    display: block;
    block-size: 3px;
    border-radius: 2px;
    background: var(--line-2);
  }
  .cs__dot.is-done i {
    background: var(--ch, var(--accent));
  }
  .cs__dot.is-done b {
    color: var(--ink-2);
  }
  .cs__dot.is-current {
    border-color: var(--ch, var(--accent));
    background: var(--accent-wash);
  }
  .cs__dot.is-current b {
    color: var(--ink-1);
  }
  .cs__dot b {
    font-weight: 650;
  }
</style>
