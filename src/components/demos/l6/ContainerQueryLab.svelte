<script lang="ts">
  /**
   * 4.3 演示 · 容器查询 vs 媒体查询
   *
   * 同一张卡片放进三个可独立拖宽的容器：
   *   上排用 @container —— 每张卡片按**自己容器**的宽度切换形态
   *   下排用 @media     —— 三张卡片形态完全相同，因为窗口没变
   * 拖动任意一个容器，差别立刻显现。
   */
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      w1: '容器 A 宽度',
      w2: '容器 B 宽度',
      w3: '容器 C 宽度',
      cq: '① 容器查询：各自按自己的宽度切换',
      mq: '② 媒体查询：三张卡片形态完全相同',
      wide: '宽版',
      narrow: '紧凑版',
      cardTitle: '地球科学与技术学院',
      value: '612',
      label: '录取人数',
      delta: '较去年 +4.2%',
      hint: '拖动「容器 A 宽度」：上排的 A 会在 26rem 处切换成紧凑版，而下排三张纹丝不动 —— 因为浏览器窗口宽度一点没变。组件被放在哪里，媒体查询是不知道的。',
      note: '@container 查询的是最近的祖先容器，所以 container-type 必须写在**父元素**上，不能写在被查询的元素自己身上。',
      state: '当前形态',
    },
    en: {
      w1: 'Container A width',
      w2: 'Container B width',
      w3: 'Container C width',
      cq: '① Container queries: each switches on its own width',
      mq: '② Media queries: all three look identical',
      wide: 'Wide',
      narrow: 'Compact',
      cardTitle: 'School of Geosciences and Technology',
      value: '612',
      label: 'Admitted',
      delta: '+4.2% year on year',
      hint: 'Drag “Container A width”: the top A switches to compact at 26rem while all three below stay put — the browser window never changed. A media query cannot know where a component was placed.',
      note: '@container looks at the nearest ancestor container, so container-type must live on the **parent**, never on the element being queried.',
      state: 'Current form',
    },
  }[locale]);

  let w1 = $state(420);
  let w2 = $state(260);
  let w3 = $state(620);

  const THRESHOLD = 416; // 26rem
  const state1 = $derived(w1 >= THRESHOLD ? T.wide : T.narrow);
  const state2 = $derived(w2 >= THRESHOLD ? T.wide : T.narrow);
  const state3 = $derived(w3 >= THRESHOLD ? T.wide : T.narrow);
</script>

<div class="stack-5">
  <div class="controls">
    <Slider label={T.w1} bind:value={w1} min={180} max={760} step={10} unit="px" />
    <Slider label={T.w2} bind:value={w2} min={180} max={760} step={10} unit="px" />
    <Slider label={T.w3} bind:value={w3} min={180} max={760} step={10} unit="px" />
  </div>

  <section>
    <p class="control__label" style="margin-block-end: var(--space-2)"><span>{T.cq}</span></p>
    <div class="cq__row">
      {#each [{ w: w1, s: state1, n: 'A' }, { w: w2, s: state2, n: 'B' }, { w: w3, s: state3, n: 'C' }] as c (c.n)}
        <div class="cq__slot" style={`inline-size:${c.w}px`}>
          <span class="cq__tag">{c.n} · {c.w}px · {c.s}</span>
          <article class="card card--cq">
            <h5 class="card__title">{T.cardTitle}</h5>
            <div class="card__body">
              <span class="card__value">{T.value}</span>
              <span class="card__label">{T.label}</span>
              <span class="card__delta">{T.delta}</span>
            </div>
          </article>
        </div>
      {/each}
    </div>
  </section>

  <section>
    <p class="control__label" style="margin-block-end: var(--space-2)"><span>{T.mq}</span></p>
    <div class="cq__row">
      {#each [{ w: w1, n: 'A' }, { w: w2, n: 'B' }, { w: w3, n: 'C' }] as c (c.n)}
        <div class="cq__slot cq__slot--plain" style={`inline-size:${c.w}px`}>
          <span class="cq__tag">{c.n} · {c.w}px</span>
          <article class="card card--mq">
            <h5 class="card__title">{T.cardTitle}</h5>
            <div class="card__body">
              <span class="card__value">{T.value}</span>
              <span class="card__label">{T.label}</span>
              <span class="card__delta">{T.delta}</span>
            </div>
          </article>
        </div>
      {/each}
    </div>
  </section>

  <p class="key-point" style="margin:0">{T.note}</p>
  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .cq__row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    align-items: start;
    overflow-x: auto;
    padding-block-end: var(--space-2);
  }
  .cq__slot {
    flex: none;
    max-inline-size: 100%;
    /* ★ container-type 写在**父容器**上，这是关键 */
    container-type: inline-size;
    border: 1px dashed var(--line-2);
    border-radius: var(--radius);
    padding: var(--space-3);
    background: var(--surface-0);
  }
  .cq__slot--plain {
    container-type: normal; /* 下排刻意不建立容器，只能靠媒体查询 */
  }
  .cq__tag {
    display: block;
    font-family: var(--font-mono);
    font-size: 9.5px;
    color: var(--ink-4);
    margin-block-end: var(--space-2);
  }

  .card {
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-3);
    display: grid;
    gap: var(--space-2);
  }
  .card__title {
    font-size: var(--step--1);
    color: var(--ink-1);
    /* 窄版时允许换行，宽版时单行 */
  }
  .card__body {
    display: grid;
    gap: 2px;
  }
  .card__value {
    font-size: var(--step-1);
    font-weight: 700;
    color: var(--ink-1);
    font-variant-numeric: tabular-nums;
  }
  .card__label,
  .card__delta {
    font-size: var(--step--2);
    color: var(--ink-3);
  }

  /* ① 容器查询：按各自容器宽度切换 */
  @container (min-width: 26rem) {
    .card--cq {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
    }
    .card--cq .card__title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card--cq .card__body {
      text-align: end;
    }
    .card--cq .card__value {
      font-size: var(--step-3);
    }
  }

  /* ② 媒体查询：按浏览器窗口宽度切换 —— 与卡片实际宽度无关 */
  @media (min-width: 26rem) {
    .card--mq {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
    }
    .card--mq .card__title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card--mq .card__body {
      text-align: end;
    }
    .card--mq .card__value {
      font-size: var(--step-3);
    }
  }
</style>
