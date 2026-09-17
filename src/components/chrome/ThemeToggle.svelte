<script lang="ts">
  /**
   * 明暗主题切换。
   * 真正的主题应用在 BaseLayout 的内联脚本里（防白闪），本组件只负责
   * 切换与持久化 —— 岛屿延迟到 client:idle 也不会有视觉问题。
   */
  let { label }: { label: string } = $props();

  let theme = $state<'light' | 'dark'>('light');

  $effect(() => {
    theme = (document.documentElement.dataset.theme as 'light' | 'dark') ?? 'light';
  });

  function toggle() {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('lc-theme', theme);
    } catch {
      /* 隐私模式下写入失败不影响本次切换 */
    }
    // 通知所有 D3 图表重新读取 CSS 变量取色
    document.dispatchEvent(new CustomEvent('lc:themechange', { detail: { theme } }));
  }
</script>

<button class="icon-btn" type="button" onclick={toggle} aria-label={label} title={label}>
  {#if theme === 'dark'}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  {:else}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  {/if}
</button>
