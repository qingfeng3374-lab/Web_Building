<script lang="ts">
  /**
   * 元设计彩蛋：按 G 把本站自己的 12 列网格与 24px 基线叠加到当前页面。
   *
   * 这不是装饰功能。第 2 章讲网格与垂直节奏，读者有权当场验证
   * 「你们自己遵守了吗」。把审查工具交到读者手里，是这门课的立场。
   */
  let { locale }: { locale: 'zh' | 'en' } = $props();

  let columns = $state(false);
  let baseline = $state(false);

  const copy = $derived({
    zh: { cols: '12 列网格', base: '24px 基线', hint: '再按一次 G 关闭 · B 切换基线', title: '布局审查' },
    en: { cols: '12-column grid', base: '24px baseline', hint: 'Press G again to close · B toggles baseline', title: 'Layout inspector' },
  }[locale]);

  function onKey(e: KeyboardEvent) {
    // 在输入框里打字时不劫持按键
    const el = e.target as HTMLElement | null;
    if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
    if (el?.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === 'g' || e.key === 'G') {
      columns = !columns;
      if (!columns) baseline = false;
    } else if ((e.key === 'b' || e.key === 'B') && columns) {
      baseline = !baseline;
    } else if (e.key === 'Escape') {
      columns = false;
      baseline = false;
    }
  }

  $effect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
</script>

{#if columns}
  <div class="grid-overlay" aria-hidden="true">
    {#each Array(12) as _, i (i)}<i></i>{/each}
  </div>
{/if}
{#if baseline}
  <div class="grid-overlay__baseline" aria-hidden="true"></div>
{/if}
{#if columns}
  <div class="grid-overlay__hud" role="status">
    <strong>{copy.title}</strong>
    <span>{copy.cols}</span>
    <span style="opacity:.55">{baseline ? `· ${copy.base}` : ''}</span>
    <span style="opacity:.55">{copy.hint}</span>
  </div>
{/if}
