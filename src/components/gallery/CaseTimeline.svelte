<script lang="ts">
  /**
   * 案例馆 · 建造时间轴
   *
   * 顶部是一条 p5 绘制的「建造之路」：七个阶段沿一条起伏的轨道排开，
   * 走过的那一段发光、会一段段画过去，没走到的还是灰线。
   * 点任一阶段，切换下方的实时预览（真实 DOM，不是截图），
   * 右侧给出该阶段的改动清单与六项指标的当前值。
   *
   * 指标的**逐阶段轨迹**已移除：每章开头的案例面板已经讲清楚了本层推动哪一项，
   * 案例馆再画一遍六条折线是重复陈述，读者并不会从中读到新东西。
   */
  import { stages, metricSpecs, type MetricKey } from '@/content/case';
  import type { CaseStage } from '@/content/types';
  import Dashboard from '@/components/case/Dashboard.svelte';
  import P5Canvas from '@/components/decor/P5Canvas.svelte';
  import { useUI } from '@/i18n/ui';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();
  const t = $derived(useUI(locale));

  const T = $derived({
    zh: {
      pick: '选择阶段',
      adds: '这一层加上',
      preview: '实时预览（真实 DOM，非截图）',
      collapse: '收起预览',
      expand: '展开预览',
      owner: '负责层',
      layer: '第 {n} 章',
      start: '起点',
    },
    en: {
      pick: 'Pick a stage',
      adds: 'This layer adds',
      preview: 'Live preview (real DOM, not a screenshot)',
      collapse: 'Collapse preview',
      expand: 'Expand preview',
      owner: 'Owned by',
      layer: 'Chapter {n}',
      start: 'Start',
    },
  }[locale]);

  let selected = $state<CaseStage>('stage0');
  /** 预览可收起：看完一遍之后，读者往往只想对比右侧的改动清单与指标，
   *  这时那块 400px 高的看板就成了每次都要滚过去的路障。 */
  let previewOpen = $state(true);
  const info = $derived(stages.find((s) => s.id === selected)!);
  const index = $derived(stages.findIndex((s) => s.id === selected));

</script>

<div class="stack-6">
  <!-- 建造时间轴：p5 场景。
       原先是一条 D3 直线 —— 直线能表达顺序，表达不了「走过来」。
       现在走过的那一段是发光的、会一段段画过去的路径，剩下的还是灰线。
       `data-stage` 把当前阶段下发给草图；`prefers-reduced-motion` 下
       p5 完全不加载，退化为下面那排阶段按钮（信息一点不少）。 -->
  <figure class="gt__journey" data-stage={index}>
    <P5Canvas sketch="caseJourney" accentVar="--accent" fallback="none" fallbackHeight={200} />
    <figcaption class="gt__journey-cap">
      {#each stages as st, i (st.id)}
        <span class:is-on={i <= index}>
          <b>{st.id.replace('stage', 'S')}</b>
          {st.name[locale]}
        </span>
      {/each}
    </figcaption>
  </figure>

  <div class="chip-group" role="group" aria-label={T.pick}>
    {#each stages as s (s.id)}
      <button class="chip" type="button" aria-pressed={selected === s.id} onclick={() => (selected = s.id)}>
        {s.name[locale]}
      </button>
    {/each}
  </div>

  <!-- 收起时，左右**两栏一起收**。
       上一版只收左边的看板，右边的改动清单和指标卡还杵在那里，
       于是「收起」之后页面反而出现一大片空白 —— 那不是收起，是挖了个洞。
       这一整块是同一件事的两半（看板 + 它的读数），要收就一起收。 -->
  <p class="control__label gt__preview-head">
    <span>{T.preview}</span>
    <button
      class="btn gt__toggle"
      type="button"
      aria-expanded={previewOpen}
      aria-controls="gt-preview"
      onclick={() => (previewOpen = !previewOpen)}
    >
      {previewOpen ? T.collapse : T.expand}
    </button>
  </p>

  {#if previewOpen}
  <div class="gt__split" id="gt-preview">
    <div>
      <div class="gt__preview">
        <Dashboard stage={selected} {locale} />
      </div>
    </div>
    <div class="stack-3">
      <div class="box">
        <h4>{info.name[locale]}</h4>
        <p class="gt__adds">{T.adds} · {info.adds[locale]}</p>
        <p class="gt__headline">{info.headline[locale]}</p>
        <ul class="gt__changes">
          {#each info.changes as c, i (i)}<li>{c[locale]}</li>{/each}
        </ul>
      </div>
      <div class="readout">
        {#each metricSpecs as spec (spec.key)}
          <div class="readout__item" class:is-owned={spec.ownedBy === info.fromLesson}>
            <p class="readout__label">{t(`metric.${spec.key}` as any)}</p>
            <p class="readout__value" style="font-size: var(--step-0)">
              {info.metrics[spec.key].toFixed(spec.digits)}{spec.unit}
            </p>
            <p class="readout__note">{T.owner} · {T.layer.replace('{n}', String(spec.ownedBy))}</p>
          </div>
        {/each}
      </div>
    </div>
  </div>
  {/if}

</div>

<style>
  /* p5 画布的宿主：必须自己有高度（画布跟随容器，见 P5Canvas 的注释），
     并且比例按内容定 —— 七个节点横向铺开，纵向只需要够正弦起伏。 */
  .gt__journey {
    position: relative;
    margin: 0;
    aspect-ratio: 7;
    min-block-size: 9rem;
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius-lg);
    background: #0b1424;
    overflow: hidden;
  }
  /* 图注同时是 reduced-motion 下的信息兜底：
     画布不加载时，这一行仍然把七个阶段和「走到哪」说清楚。 */
  .gt__journey-cap {
    position: absolute;
    inset-block-end: 0;
    inset-inline: 0;
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-5) var(--space-3);
    font-size: var(--step--2);
    color: rgb(148 163 184 / 0.75);
  }
  .gt__journey-cap span {
    display: grid;
    justify-items: center;
    gap: 2px;
    text-align: center;
    min-inline-size: 0;
  }
  .gt__journey-cap b {
    font-family: var(--font-mono);
    font-weight: 700;
    color: rgb(148 163 184 / 0.6);
  }
  .gt__journey-cap .is-on { color: #e2e8f0; }
  .gt__journey-cap .is-on b { color: #7dd3fc; }
  @media (max-width: 48rem) {
    .gt__journey { aspect-ratio: 3.2; }
    .gt__journey-cap { font-size: 0; gap: 0; }
    .gt__journey-cap b { font-size: var(--step--2); }
  }

  .gt__split {
    display: grid;
    gap: var(--space-5);
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
    align-items: start;
  }
  @media (max-width: 62rem) {
    .gt__split {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .gt__preview-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }
  .gt__toggle {
    min-block-size: 28px;
    padding-block: 0;
    font-size: var(--step--2);
  }
  .gt__preview {
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    overflow: hidden;
    background: var(--surface-1);
  }
  .gt__adds {
    margin-block: var(--space-2);
    font-size: var(--step--2);
    color: var(--accent-ink);
    font-weight: 650;
  }
  .gt__headline {
    font-size: var(--step--1);
    color: var(--ink-2);
  }
  .gt__changes {
    margin: var(--space-3) 0 0;
    padding-inline-start: 1.2em;
    font-size: var(--step--2);
    color: var(--ink-2);
  }
  .gt__changes li + li {
    margin-block-start: var(--space-2);
  }
  .box h4 {
    font-size: var(--step-0);
    color: var(--ink-1);
  }
  .readout__item.is-owned {
    border-color: var(--accent);
    background: var(--accent-wash);
  }
</style>
