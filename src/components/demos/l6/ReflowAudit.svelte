<script lang="ts">
  /**
   * 6.2 演示 · 重排与目标尺寸审计
   *
   * 把内容压到 320px（等价于 1280px 显示器放大 400%），
   * 实测哪些元素横向溢出、哪些目标小于 24×24px，并高亮。
   * 目标尺寸检测实现了 WCAG 2.5.8 的「间距例外」—— 孤立的小目标不算违规。
   */
  import { cssVar } from '@/lib/color';
  import Slider from '@/components/viz/Slider.svelte';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      width: '内容区宽度',
      zoom: '等效缩放',
      fixed: '包含固定宽度元素',
      nowrap: '包含不可断词',
      overflow: '横向溢出元素',
      small: '过小的点击目标',
      compliant: '符合 WCAG 1.4.10 / 2.5.8',
      violations: '发现违规',
      report: '审计条目',
      copy: '复制审计条目',
      hint: '320px 不是「小手机」，它等于 1280px 显示器放大到 400%。这条准则表面在说手机，实质保护的是需要放大四倍才能阅读的低视力用户。',
      note: '孤立的小目标是合规的（周围没有别的目标，误触风险低）；又小又挤才算违规 —— 这是 2.5.8 的间距例外。',
      sample: { title: '筛选与操作', name: '2025 级新生数据看板 · 地球科学与技术学院', url: 'https://neocampus.example.edu/enrolment/2025', btns: ['导出', '打印', '分享', '订阅', '设置'] },
      none: '无',
    },
    en: {
      width: 'Content width',
      zoom: 'Equivalent zoom',
      fixed: 'Include a fixed-width element',
      nowrap: 'Include an unbreakable string',
      overflow: 'Overflowing elements',
      small: 'Undersized targets',
      compliant: 'Meets WCAG 1.4.10 / 2.5.8',
      violations: 'Violations found',
      report: 'Audit entries',
      copy: 'Copy audit entries',
      hint: '320px is not “a small phone” — it equals a 1280px display at 400% zoom. The criterion appears to be about phones; what it protects is low-vision users who need four-times magnification.',
      note: 'An isolated small target is compliant (nothing nearby to mis-hit); small *and* crowded is the violation — that is 2.5.8’s spacing exception.',
      sample: { title: 'Filters and actions', name: '2025 intake dashboard · School of Geosciences and Technology', url: 'https://neocampus.example.edu/enrolment/2025', btns: ['Export', 'Print', 'Share', 'Subscribe', 'Settings'] },
      none: 'none',
    },
  }[locale]);

  let width = $state(320);
  let withFixed = $state(true);
  let withNowrap = $state(true);
  let bigTargets = $state(false);

  const zoom = $derived(Math.round((1280 / width) * 100));

  let stage: HTMLDivElement | undefined = $state();
  let overflowing = $state<string[]>([]);
  let smallTargets = $state<string[]>([]);

  const MIN_TARGET = 24;

  function audit() {
    if (!stage) return;
    const box = stage.getBoundingClientRect();

    // ① 横向溢出（排除刻意允许横向滚动的容器）
    const over: string[] = [];
    for (const el of stage.querySelectorAll<HTMLElement>('[data-audit]')) {
      if (el.closest('[data-allow-x-scroll]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.right > box.right + 1 || r.left < box.left - 1) over.push(el.dataset.audit!);
    }
    overflowing = over;

    // ② 目标尺寸 + 间距例外
    const targets = [...stage.querySelectorAll<HTMLElement>('button, a[href], select')];
    const boxes = targets.map((el) => ({ el, r: el.getBoundingClientRect() }));
    const small: string[] = [];
    for (const { el, r } of boxes) {
      if (r.width >= MIN_TARGET && r.height >= MIN_TARGET) continue;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const crowded = boxes.some(
        (o) => o.el !== el && Math.hypot(o.r.left + o.r.width / 2 - cx, o.r.top + o.r.height / 2 - cy) < MIN_TARGET,
      );
      if (crowded) small.push(el.textContent?.trim() || el.tagName.toLowerCase());
    }
    smallTargets = small;
  }

  $effect(() => {
    void width;
    void withFixed;
    void withNowrap;
    void bigTargets;
    const id = requestAnimationFrame(audit);
    return () => cancelAnimationFrame(id);
  });

  $effect(() => {
    if (!stage) return;
    const ro = new ResizeObserver(() => audit());
    ro.observe(stage);
    return () => ro.disconnect();
  });

  const violations = $derived(overflowing.length + smallTargets.length);
  const report = $derived(
    [
      ...overflowing.map((id) => `[1.4.10] ${locale === 'zh' ? '横向溢出' : 'Horizontal overflow'}: ${id} @ ${width}px`),
      ...smallTargets.map((t) => `[2.5.8] ${locale === 'zh' ? '目标过小且拥挤' : 'Target too small and crowded'}: "${t}" < ${MIN_TARGET}px`),
    ].join('\n') || (locale === 'zh' ? '✓ 未发现违规' : '✓ No violations found'),
  );

  let copied = $state(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(report);
      copied = true;
      setTimeout(() => (copied = false), 1400);
    } catch {
      /* 剪贴板不可用时静默失败 */
    }
  }
</script>

<div class="stack-5">
  <div class="controls">
    <Slider label={T.width} bind:value={width} min={280} max={900} step={10} unit="px" />
    <div class="control" style="flex: 1 1 22rem">
      <span class="control__label"><span>{locale === 'zh' ? '注入问题' : 'Inject problems'}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" aria-pressed={withFixed} onclick={() => (withFixed = !withFixed)}>{T.fixed}</button>
        <button class="chip" type="button" aria-pressed={withNowrap} onclick={() => (withNowrap = !withNowrap)}>{T.nowrap}</button>
        <button class="chip" type="button" aria-pressed={bigTargets} onclick={() => (bigTargets = !bigTargets)}>
          {locale === 'zh' ? '目标 ≥ 32px' : 'Targets ≥ 32px'}
        </button>
      </div>
    </div>
  </div>

  <div class="ra__frame">
    <div class="ra__ruler">{width}px · {T.zoom} {zoom}%</div>
    <div class="ra__stage" style={`inline-size:${width}px`} bind:this={stage} class:big={bigTargets}>
      <h5 data-audit="title" class:is-over={overflowing.includes('title')}>{T.sample.title}</h5>
      <p data-audit="name" class:is-over={overflowing.includes('name')}>{T.sample.name}</p>
      {#if withNowrap}
        <p data-audit="url" class="ra__nowrap" class:is-over={overflowing.includes('url')}>{T.sample.url}</p>
      {/if}
      {#if withFixed}
        <div data-audit="fixed" class="ra__fixed" class:is-over={overflowing.includes('fixed')}>
          {locale === 'zh' ? 'width: 360px 的固定宽度盒子' : 'A box with width: 360px'}
        </div>
      {/if}
      <div class="ra__btns" data-audit="btns" class:is-over={overflowing.includes('btns')}>
        {#each T.sample.btns as b (b)}
          <button type="button">{b}</button>
        {/each}
      </div>
      <div class="reel" data-allow-x-scroll>
        <table data-audit="table">
          <thead><tr><th>{locale === 'zh' ? '专业' : 'Programme'}</th><th>{locale === 'zh' ? '录取' : 'Admitted'}</th><th>{locale === 'zh' ? '报到' : 'Checked in'}</th><th>{locale === 'zh' ? '报到率' : 'Rate'}</th></tr></thead>
          <tbody><tr><td>{locale === 'zh' ? '石油工程' : 'Petroleum Engineering'}</td><td>186</td><td>186</td><td>100%</td></tr></tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="readout">
    <div class="readout__item">
      <p class="readout__label">{T.overflow}</p>
      <p class={`readout__value ${overflowing.length ? 'readout__value--bad' : 'readout__value--good'}`}>
        {overflowing.length}
      </p>
      <p class="readout__note">{overflowing.join(', ') || T.none}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{T.small}</p>
      <p class={`readout__value ${smallTargets.length ? 'readout__value--bad' : 'readout__value--good'}`}>
        {smallTargets.length}
      </p>
      <p class="readout__note">{smallTargets.join(', ') || T.none}</p>
    </div>
    <div class="readout__item">
      <p class="readout__label">{violations ? T.violations : T.compliant}</p>
      <p class={`readout__value ${violations ? 'readout__value--bad' : 'readout__value--good'}`}>
        {violations ? violations : '✓'}
      </p>
    </div>
  </div>

  <div>
    <div class="cluster" style="--gap: var(--space-2); margin-block-end: var(--space-2)">
      <span class="control__label"><span>{T.report}</span></span>
      <button class="btn" type="button" onclick={copy}>{copied ? '✓' : T.copy}</button>
    </div>
    <pre class="console">{report}</pre>
  </div>

  <p class="key-point" style="margin:0">{T.note}</p>
  <p class="note" style="margin:0">{T.hint}</p>
</div>

<style>
  .ra__frame {
    overflow-x: auto;
    background: var(--surface-0);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    padding: var(--space-4);
  }
  .ra__ruler {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--ink-4);
    margin-block-end: var(--space-2);
  }
  .ra__stage {
    max-inline-size: 100%;
    background: var(--surface-1);
    border: 1px dashed var(--line-2);
    padding: var(--space-3);
    display: grid;
    gap: var(--space-3);
    font-size: var(--step--2);
    /* 刻意不写 overflow —— 溢出要看得见 */
  }
  .ra__stage h5 {
    font-size: var(--step--1);
    color: var(--ink-1);
  }
  .ra__nowrap {
    white-space: nowrap;
  }
  .ra__fixed {
    inline-size: 360px;
    padding: var(--space-2);
    background: var(--warn-wash);
    border: 1px solid var(--warn);
    border-radius: var(--radius-sm);
  }
  .ra__btns {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
  }
  .ra__btns button {
    padding: 2px 6px;
    font-size: 11px;
    border: 1px solid var(--line-2);
    border-radius: 3px;
    background: var(--surface-2);
    cursor: pointer;
  }
  .ra__stage.big .ra__btns {
    gap: var(--space-2);
  }
  .ra__stage.big .ra__btns button {
    min-block-size: 32px;
    min-inline-size: 56px;
    padding: var(--space-2) var(--space-3);
  }
  .is-over {
    outline: 2px solid var(--bad);
    outline-offset: 2px;
    background: var(--bad-wash);
  }
  .ra__stage table {
    inline-size: 100%;
    border-collapse: collapse;
    font-size: 11px;
    min-inline-size: 26rem;
  }
  .ra__stage th,
  .ra__stage td {
    border: 1px solid var(--line-1);
    padding: 2px 6px;
    text-align: start;
    white-space: nowrap;
  }
</style>
