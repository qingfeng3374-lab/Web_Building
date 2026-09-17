<script lang="ts">
  /**
   * 演示宿主：按 id 懒加载演示组件。
   *
   * 放在「演示」面板内部，用 client:visible 挂载 —— 面板 hidden 时
   * IntersectionObserver 不会触发，所以**只有读者真的打开演示面板，
   * 那个演示的 JS 才会被下载**。这是声明式实现的按需加载，无需手写逻辑。
   */
  import { demoRegistry } from '@/components/demos/registry';
  import type { Component } from 'svelte';

  let {
    demoId,
    locale,
    loadingText,
    label = '',
  }: { demoId: string; locale: 'zh' | 'en'; loadingText: string; label?: string } = $props();

  let Demo = $state<Component<any> | null>(null);
  let failed = $state(false);

  $effect(() => {
    const loader = demoRegistry[demoId];
    if (!loader) {
      failed = true;
      return;
    }
    let alive = true;
    loader()
      .then((m) => {
        if (alive) Demo = m.default;
      })
      .catch((err) => {
        console.error(`[demo:${demoId}]`, err);
        if (alive) failed = true;
      });
    return () => {
      alive = false;
    };
  });
</script>

{#snippet statusDot()}
  <span class="demo-shell__dots" aria-hidden="true"><i></i><i></i><i></i></span>
{/snippet}

<figure class="demo-shell" data-demo={demoId} data-demo-ready={Demo ? 'true' : 'false'}>
  {#if label}
    {@render statusDot()}
    <figcaption class="demo-shell__bar">
      <span class="demo-shell__label">{label}</span>
      <span class="demo-shell__id">{demoId}</span>
    </figcaption>
  {/if}

  <div class="demo-shell__stage">
    {#if Demo}
      <Demo {locale} />
    {:else if failed}
      <p class="demo-fallback">
        {locale === 'zh' ? '演示加载失败，请刷新页面重试。' : 'The demo failed to load. Please refresh.'}
      </p>
    {:else}
      <p class="demo-fallback">{loadingText}</p>
    {/if}
  </div>
</figure>
