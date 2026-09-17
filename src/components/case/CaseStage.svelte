<script lang="ts">
  /**
   * 章节顶部的案例入口条 + 弹窗面板。
   *
   * 解决的问题：案例必须**随时可查**，但不该占掉每章开头的一屏。
   * 上一版把整块面板常驻展开，读者每次进入一章都要先滚过一大片
   * 自己已经看过的内容 —— 上下文变成了路障。
   *
   * 现在顶部只留一条窄入口（一眼看到「现在是哪一阶段 → 这一章要到哪一阶段」），
   * 点开才显示完整面板：
   *   ① 页面现在长什么样（上一层的成果，真实 DOM 实时渲染）
   *   ② 这一层要给它加什么
   *   ③ 学完之后会变成什么样（剧透开关，留给读者自己先想）
   *
   * 用原生 <dialog showModal()>：焦点陷阱、Esc 关闭、惰性化背景内容
   * 全部由浏览器负责 —— 手写一套这些行为几乎一定会漏掉其中一项。
   */
  import Dashboard from './Dashboard.svelte';
  import { stageBeforeLesson, stageOfLesson, metricSpecs } from '@/content/case';
  import { useUI } from '@/i18n/ui';

  let {
    lesson,
    locale = 'zh',
    lessonTitle = '',
    lessonSubtitle = '',
    lessonSummary = '',
    sectionTitles = [],
    accentVar = '',
  }: {
    lesson: number;
    locale?: 'zh' | 'en';
    /** 章节色由内容模型给出（Lesson.accentVar），不在这里拼 `--ch${lesson}`。
     *  拼字符串意味着「章节序号」和「令牌名」必须永远对得上 ——
     *  一旦有人调整章节顺序，颜色就会错位，而且不会有任何报错。 */
    accentVar?: string;
    /** 章节自己的文本由布局下发，而不是在这里 import '@/content' ——
     *  后者会把六章正文（约 420KB）整个打进客户端包。 */
    lessonTitle?: string;
    lessonSubtitle?: string;
    lessonSummary?: string;
    sectionTitles?: string[];
  } = $props();

  const t = $derived(useUI(locale));
  const tone = $derived(accentVar ? `var(${accentVar})` : 'var(--accent)');
  const from = $derived(stageBeforeLesson(lesson));
  const to = $derived(stageOfLesson(lesson)!);
  const owned = $derived(metricSpecs.filter((m) => m.ownedBy === lesson));

  const T = $derived({
    zh: {
      kicker: '贯穿案例',
      open: '查看案例现状',
      close: '关闭',
      now: '页面现在的样子',
      willAdd: '这一章要给它加上',
      about: '这一章在做什么',
      why: '为什么是现在',
      road: '本章路线',
      changes: '具体改动',
      owns: '这一章负责的指标',
      peek: '先剧透结果',
      hide: '收起剧透',
      after: '学完这一章之后',
      start: '起点',
      liveNote: '真实 DOM 实时渲染，不是截图 —— 可以按 G 叠加网格自己量',
    },
    en: {
      kicker: 'The running case',
      open: 'See where the case stands',
      close: 'Close',
      now: 'The page right now',
      willAdd: 'This chapter will add',
      about: 'What this chapter does',
      why: 'Why now',
      road: 'The route through it',
      changes: 'The concrete changes',
      owns: 'Metrics this chapter owns',
      peek: 'Spoil the ending',
      hide: 'Hide the spoiler',
      after: 'After this chapter',
      start: 'Starting point',
      liveNote: 'Live DOM, not a screenshot — press G to overlay the grid and measure it yourself',
    },
  }[locale]);

  let dialog = $state<HTMLDialogElement | null>(null);
  let peek = $state(false);

  function open() {
    peek = false;
    dialog?.showModal();
  }

  /** 点击背景关闭：<dialog> 的点击目标就是 dialog 本身时，说明点在 ::backdrop 上 */
  function onBackdrop(e: MouseEvent) {
    if (dialog && e.target === dialog) dialog.close();
  }
</script>

<div class="cse" style={`--ch: ${tone}`}>
  <button class="cse__bar" type="button" onclick={open}>
    <span class="cse__kicker">{T.kicker}</span>
    <span class="cse__flow">
      <span class="cse__from">{from.fromLesson === null ? T.start : from.name[locale]}</span>
      <span class="cse__arrow" aria-hidden="true">→</span>
      <span class="cse__to">{to.name[locale]}</span>
    </span>
    <span class="cse__cta">{T.open}</span>
  </button>
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialog} class="cse__dialog" onclick={onBackdrop} style={`--ch: ${tone}`}>
  <div class="cse__panel">
    <header class="cse__head">
      <h2>
        <span class="cse__kicker">{T.kicker}</span>
        <span class="cse__flow">
          <span class="cse__from">{from.fromLesson === null ? T.start : from.name[locale]}</span>
          <span class="cse__arrow" aria-hidden="true">→</span>
          <span class="cse__to">{to.name[locale]}</span>
        </span>
      </h2>
      <button class="cse__x" type="button" onclick={() => dialog?.close()} aria-label={T.close}>✕</button>
    </header>

    <div class="cse__body">
      <figure class="cse__preview">
        <figcaption>
          <span>{peek ? T.after : T.now}</span>
          <button class="btn cse__peek" type="button" onclick={() => (peek = !peek)} aria-pressed={peek}>
            {peek ? T.hide : T.peek}
          </button>
        </figcaption>
        <div class="cse__frame">
          <Dashboard stage={peek ? to.id : from.id} {locale} />
        </div>
        <p class="cse__live">{T.liveNote}</p>
      </figure>

      <div class="cse__side">
        <!-- ① 这一章在做什么：先给标题与一句话立论，再给整章导读。
             上一版右侧只有一张改动清单 —— 读者知道「改了什么」，
             但不知道「这一章想解决的是哪个问题」。 -->
        <section class="cse__block cse__block--about">
          <h3>{T.about}</h3>
          {#if lessonTitle}<p class="cse__lesson-title">{lessonTitle}</p>{/if}
          {#if lessonSubtitle}<p class="cse__lesson-sub">{lessonSubtitle}</p>{/if}
          {#if lessonSummary}<p class="cse__lesson-summary">{lessonSummary}</p>{/if}
        </section>

        <!-- ② 本章路线：把小节列出来，读者一眼看到「要走几步、经过哪里」 -->
        {#if sectionTitles.length}
          <section class="cse__block">
            <h3>{T.road}</h3>
            <ol class="cse__road">
              {#each sectionTitles as st (st)}
                <li>{st}</li>
              {/each}
            </ol>
          </section>
        {/if}

        <section class="cse__block">
          <h3>{T.willAdd}</h3>
          <p class="cse__adds">{to.adds[locale]}</p>
          <p class="cse__sub-label">{T.changes}</p>
          <ul>
            {#each to.changes as c, i (i)}
              <li>{c[locale]}</li>
            {/each}
          </ul>
        </section>

        <section class="cse__block">
          <h3>{T.owns}</h3>
          <ul class="cse__metrics">
            {#each owned as m (m.key)}
              <li>
                <strong>{t(`metric.${m.key}` as any)}</strong>
                <span>
                  {from.metrics[m.key].toFixed(m.digits)}{m.unit} → {to.metrics[m.key].toFixed(m.digits)}{m.unit}
                </span>
              </li>
            {:else}
              <li><span>—</span></li>
            {/each}
          </ul>
        </section>
      </div>
    </div>
  </div>
</dialog>

<style>
  /* ── 入口条：一行，不抢戏 ──────────────────────────────────────── */
  .cse {
    margin-block-end: var(--space-6);
  }
  .cse__bar {
    appearance: none;
    inline-size: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);
    padding: var(--space-3) var(--space-4);
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-inline-start: 3px solid var(--ch, var(--accent));
    border-radius: var(--radius);
    text-align: start;
    cursor: pointer;
    transition:
      background var(--motion-fast),
      border-color var(--motion-fast);
  }
  .cse__bar:hover {
    background: var(--surface-2);
    border-color: var(--ch, var(--accent));
  }
  .cse__kicker {
    font-size: var(--step--2);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ch, var(--accent));
    font-weight: 700;
    flex: none;
  }
  .cse__flow {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-2);
    font-size: var(--step--1);
  }
  .cse__from {
    color: var(--ink-3);
  }
  .cse__arrow {
    color: var(--ink-4);
  }
  .cse__to {
    color: var(--ink-1);
    font-weight: 700;
  }
  .cse__cta {
    margin-inline-start: auto;
    font-size: var(--step--1);
    font-weight: 650;
    color: var(--ch, var(--accent));
    white-space: nowrap;
  }
  .cse__cta::after {
    content: ' ↗';
  }

  /* ── 弹窗 ─────────────────────────────────────────────────────── */
  .cse__dialog {
    inline-size: min(78rem, 94vw);
    max-inline-size: none;
    max-block-size: 90dvh;
    padding: 0;
    border: none;
    border-radius: var(--radius-lg);
    background: var(--surface-0);
    color: var(--ink-1);
    overflow: hidden;
  }
  .cse__dialog::backdrop {
    background: rgb(15 23 42 / 0.55);
    backdrop-filter: blur(2px);
  }
  .cse__panel {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    max-block-size: 90dvh;
  }
  .cse__head {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5);
    background: var(--surface-1);
    border-block-end: var(--hairline) solid var(--line-1);
    border-block-start: 3px solid var(--ch, var(--accent));
  }
  .cse__head h2 {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-3);
    font-size: var(--step-0);
    margin: 0;
  }
  .cse__x {
    appearance: none;
    margin-inline-start: auto;
    inline-size: 32px;
    block-size: 32px;
    display: grid;
    place-items: center;
    border: var(--hairline) solid var(--line-2);
    border-radius: var(--radius);
    background: var(--surface-1);
    color: var(--ink-3);
    cursor: pointer;
  }
  .cse__x:hover {
    background: var(--surface-2);
    color: var(--ink-1);
  }

  .cse__body {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
    gap: var(--space-5);
    padding: var(--space-5);
    overflow: auto;
  }
  @media (max-width: 62rem) {
    .cse__body {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .cse__preview {
    margin: 0;
    display: grid;
    gap: var(--space-2);
    align-content: start;
  }
  .cse__preview figcaption {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    font-size: var(--step--2);
    font-weight: 700;
    color: var(--ink-3);
  }
  .cse__frame {
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    background: var(--surface-1);
    overflow: hidden;
  }
  .cse__live {
    font-size: var(--step--2);
    color: var(--ink-4);
  }
  .cse__side {
    display: grid;
    gap: var(--space-4);
    align-content: start;
  }
  /* 「这一章在做什么」用章节色的淡底框起来 —— 它是右栏的主块，
     其余两块是它的展开。不给它一点面色，三块会读成并列的三段。 */
  .cse__block--about {
    padding: var(--space-4);
    border-radius: var(--radius);
    border-inline-start: 3px solid var(--ch, var(--accent));
    background: color-mix(in srgb, var(--ch, var(--accent)) 7%, var(--surface-1));
  }
  .cse__lesson-title {
    font-size: var(--step-1);
    font-weight: 700;
    color: var(--ink-1);
    line-height: 1.25;
    text-wrap: balance;
  }
  .cse__lesson-sub {
    margin-block-start: var(--space-2);
    font-size: var(--step--1);
    color: var(--ch, var(--accent-ink));
    font-weight: 600;
  }
  .cse__lesson-summary {
    margin-block-start: var(--space-3);
    font-size: var(--step--1);
    color: var(--ink-2);
    line-height: 1.75;
  }
  .cse__road {
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: road;
    display: grid;
    gap: var(--space-1);
    font-size: var(--step--2);
    color: var(--ink-2);
  }
  .cse__road li {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    background: var(--surface-1);
  }
  .cse__sub-label {
    margin-block: var(--space-3) var(--space-2);
    font-size: var(--step--2);
    font-weight: 700;
    color: var(--ink-3);
    letter-spacing: 0.06em;
  }
  .cse__block h3 {
    font-size: var(--step--1);
    color: var(--ink-1);
    margin-block-end: var(--space-2);
  }
  .cse__adds {
    font-size: var(--step--1);
    color: var(--ch, var(--accent-ink));
    font-weight: 650;
    margin-block-end: var(--space-2);
  }
  .cse__block ul {
    margin: 0;
    padding-inline-start: 1.2em;
    font-size: var(--step--2);
    color: var(--ink-2);
  }
  .cse__block li + li {
    margin-block-start: var(--space-2);
  }
  .cse__metrics {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--space-2);
  }
  .cse__metrics li {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    background: var(--surface-1);
    border-radius: var(--radius-sm);
  }
  .cse__metrics span {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    color: var(--good);
    font-weight: 700;
  }
</style>
