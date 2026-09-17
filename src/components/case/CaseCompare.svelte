<script lang="ts">
  /**
   * 案例阶段对比器。
   *
   * 两侧是**同一个 Dashboard 组件**，只有 data-s 不同 ——
   * 读者可以确认「我们只加了 CSS，内容一个字没动」。
   *
   * 高度一致性（上一版的缺陷）：叠加模式下两层内容高度不同会错位。
   * 现在两层放进同一个 grid 单元格（`grid-area: 1/1`），
   * 容器高度自动取两者较大值 —— 这正是「用网格而不是绝对定位表达重叠」
   * 的一次自我应用。
   */
  import Dashboard from './Dashboard.svelte';
  import { stageById } from '@/content/case';
  import type { CaseStage } from '@/content/types';

  let {
    before = 'stage0',
    after = 'stage1',
    locale = 'zh',
    overlays = ['grid', 'baseline'],
  }: {
    before?: CaseStage;
    after?: CaseStage;
    locale?: 'zh' | 'en';
    overlays?: Array<'grid' | 'baseline'>;
  } = $props();

  const T = $derived({
    zh: {
      split: '对比位置',
      before: '这一章之前',
      after: '这一章之后',
      grid: '12 列网格',
      baseline: '24px 基线',
      both: '并排',
      overlay: '叠加',
    },
    en: {
      split: 'Split',
      before: 'Before this chapter',
      after: 'After this chapter',
      grid: '12-column grid',
      baseline: '24px baseline',
      both: 'Side by side',
      overlay: 'Wipe',
    },
  }[locale]);

  let split = $state(50);
  let showGrid = $state(false);
  let showBaseline = $state(false);
  let mode = $state<'wipe' | 'side'>('wipe');

  const bInfo = $derived(stageById.get(before)!);
  const aInfo = $derived(stageById.get(after)!);
</script>

<div class="cmp">
  <div class="controls">
    <div class="control" style="flex: 1 1 16rem">
      <label class="control__label" for={`cmp-${before}-${after}`}>
        <span>{T.split}</span>
        <span class="control__value">{split}%</span>
      </label>
      <input
        id={`cmp-${before}-${after}`}
        type="range"
        min="0"
        max="100"
        bind:value={split}
        disabled={mode === 'side'}
        aria-valuetext={`${T.before} ${split}% / ${T.after} ${100 - split}%`}
      />
    </div>
    <div class="control" style="flex: 0 1 20rem">
      <span class="control__label"><span>{locale === 'zh' ? '视图与叠加' : 'View and overlays'}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" aria-pressed={mode === 'wipe'} onclick={() => (mode = 'wipe')}>{T.overlay}</button>
        <button class="chip" type="button" aria-pressed={mode === 'side'} onclick={() => (mode = 'side')}>{T.both}</button>
        {#if overlays.includes('grid')}
          <button class="chip" type="button" aria-pressed={showGrid} onclick={() => (showGrid = !showGrid)}>{T.grid}</button>
        {/if}
        {#if overlays.includes('baseline')}
          <button class="chip" type="button" aria-pressed={showBaseline} onclick={() => (showBaseline = !showBaseline)}>
            {T.baseline}
          </button>
        {/if}
      </div>
    </div>
  </div>

  {#if mode === 'wipe'}
    <div class="cmp__stage" style={`--split:${split}%`}>
      <div class="cmp__cell">
        <Dashboard stage={before} {locale} />
      </div>
      <div class="cmp__cell cmp__cell--clip">
        <Dashboard stage={after} {locale} />
      </div>
      <div class="cmp__handle" aria-hidden="true"></div>
      <span class="cmp__tag cmp__tag--l">{T.before} · {bInfo.name[locale]}</span>
      <span class="cmp__tag cmp__tag--r">{T.after} · {aInfo.name[locale]}</span>
      {#if showGrid}<div class="cmp__grid" aria-hidden="true">{#each Array(12) as _, i (i)}<i></i>{/each}</div>{/if}
      {#if showBaseline}<div class="cmp__baseline" aria-hidden="true"></div>{/if}
    </div>
  {:else}
    <div class="cmp__side">
      <figure>
        <figcaption>{T.before} · {bInfo.name[locale]}</figcaption>
        <div class="cmp__pane">
          <Dashboard stage={before} {locale} />
          {#if showGrid}<div class="cmp__grid" aria-hidden="true">{#each Array(12) as _, i (i)}<i></i>{/each}</div>{/if}
          {#if showBaseline}<div class="cmp__baseline" aria-hidden="true"></div>{/if}
        </div>
      </figure>
      <figure>
        <figcaption>{T.after} · {aInfo.name[locale]}</figcaption>
        <div class="cmp__pane">
          <Dashboard stage={after} {locale} />
          {#if showGrid}<div class="cmp__grid" aria-hidden="true">{#each Array(12) as _, i (i)}<i></i>{/each}</div>{/if}
          {#if showBaseline}<div class="cmp__baseline" aria-hidden="true"></div>{/if}
        </div>
      </figure>
    </div>
  {/if}
</div>

<style>
  .cmp {
    display: grid;
    gap: var(--space-4);
  }
  .cmp__stage {
    position: relative;
    display: grid;
    isolation: isolate;
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    overflow: hidden;
  }
  /* 关键：两层占同一个格子，容器高度自动取较大者，两层永不错位 */
  .cmp__cell {
    grid-area: 1 / 1;
    min-inline-size: 0;
  }
  .cmp__cell--clip {
    clip-path: inset(0 0 0 var(--split));
  }
  .cmp__handle {
    position: absolute;
    inset-block: 0;
    inset-inline-start: var(--split);
    inline-size: 2px;
    background: var(--accent);
    box-shadow: 0 0 0 1px rgb(255 255 255 / 0.5);
    z-index: 3;
  }
  .cmp__tag {
    position: absolute;
    inset-block-start: var(--space-2);
    z-index: 4;
    font-size: var(--step--2);
    font-weight: 700;
    padding: 2px var(--space-2);
    border-radius: var(--radius-sm);
    background: var(--surface-inverse);
    color: var(--ink-inverse);
    opacity: 0.85;
  }
  .cmp__tag--l {
    inset-inline-start: var(--space-2);
  }
  .cmp__tag--r {
    inset-inline-end: var(--space-2);
  }
  .cmp__side {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
    align-items: start;
  }
  .cmp__side figure {
    margin: 0;
  }
  .cmp__side figcaption {
    font-size: var(--step--2);
    font-weight: 700;
    color: var(--ink-3);
    margin-block-end: var(--space-2);
  }
  .cmp__pane {
    position: relative;
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .cmp__grid {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: var(--grid-gutter);
    padding-inline: var(--space-5);
  }
  .cmp__grid i {
    background: rgb(219 39 119 / 0.09);
    border-inline: 1px solid rgb(219 39 119 / 0.22);
  }
  .cmp__baseline {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    background: repeating-linear-gradient(
      to bottom,
      rgb(8 145 178 / 0.18) 0 1px,
      transparent 1px var(--rhythm)
    );
  }
</style>
