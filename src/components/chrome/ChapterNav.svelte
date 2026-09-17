<script lang="ts">
  /**
   * 左侧小节目录：滚动同步高亮 + 阅读进度打点。
   *
   * 用 IntersectionObserver 而不是 scroll 事件 —— scroll 里读
   * getBoundingClientRect() 会强制同步布局，正是第 6.4 节讲的性能反模式。
   * 讲性能的站点不能在自己的导航里犯这个错。
   */
  import { onMount } from 'svelte';

  let {
    items,
    tocLabel,
    lessonSlug,
  }: {
    items: Array<{ id: string; anchor: string; title: string }>;
    tocLabel: string;
    lessonSlug: string;
  } = $props();

  // svelte-ignore state_referenced_locally
  let activeAnchor = $state(items[0]?.anchor ?? '');
  let visited = $state<Set<string>>(new Set());

  const storeKey = $derived(`lc-progress:${lessonSlug}`);

  function markVisited(anchor: string) {
    if (visited.has(anchor)) return;
    const next = new Set(visited);
    next.add(anchor);
    visited = next;
    try {
      localStorage.setItem(storeKey, JSON.stringify([...next]));
    } catch {
      /* 无痕模式下不持久化，不影响本次阅读 */
    }
  }

  onMount(() => {
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) visited = new Set(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }

    const targets = items
      .map((i) => document.getElementById(i.anchor))
      .filter((el): el is HTMLElement => Boolean(el));

    const io = new IntersectionObserver(
      (entries) => {
        // 取当前可见区域中最靠上的那个小节作为 active
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          activeAnchor = visible[0].target.id;
          markVisited(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
</script>

<nav class="chapter-nav" aria-label={tocLabel}>
  <p class="chapter-nav__title">{tocLabel}</p>
  <ul>
    {#each items as item (item.anchor)}
      <li>
        <a
          href={`#${item.anchor}`}
          class:is-active={activeAnchor === item.anchor}
          aria-current={activeAnchor === item.anchor ? 'true' : undefined}
        >
          <span class="chapter-nav__num">{item.id}</span>
          <span>{item.title}</span>
          {#if visited.has(item.anchor)}
            <span class="chapter-nav__dot" aria-hidden="true"></span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>
</nav>
