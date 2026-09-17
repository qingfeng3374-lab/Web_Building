<script lang="ts">
  /**
   * 三 Tab 控制器（讲解 / 关键代码 / 演示）
   *
   * 架构说明（重要）：
   *   三个面板由 Astro 渲染成静态 HTML，**不**作为本组件的 slot 传入。
   *   原因：@astrojs/svelte 会把 slot 内容作为 raw snippet 再序列化一份给岛屿，
   *   讲解面板动辄 8~15KB，五个小节就是 ~70KB 的纯重复字节。
   *   本组件只拥有「tablist + 键盘模型 + 可见性」，通过确定性的 id 操作兄弟面板。
   *
   *   收益：岛屿 JS < 2KB；无内容重复；无 JS 时三个面板全部可读（渐进增强）。
   */
  import { onMount } from 'svelte';

  type PanelKey = 'explain' | 'code' | 'demo';

  let {
    sectionId,
    labels,
    groupLabel,
    initial = 'explain',
  }: {
    sectionId: string;
    labels: Record<PanelKey, string>;
    /** tablist 自身的可访问名。必须是「这组控件是干什么的」，
     *  而不是某一个 tab 的文字 —— 之前这里错用了 labels.explain，
     *  屏幕阅读器读出来是「📖 讲解 选项卡组」，等于没说。 */
    groupLabel: string;
    initial?: PanelKey;
  } = $props();

  const KEYS: PanelKey[] = ['explain', 'code', 'demo'];
  // Astro 岛屿的 props 在挂载后不会变，此处捕获初值即可
  // svelte-ignore state_referenced_locally
  let active = $state<PanelKey>(initial);
  let tablist: HTMLDivElement;

  const panelId = (k: PanelKey) => `${sectionId}-panel-${k}`;
  const tabId = (k: PanelKey) => `${sectionId}-tab-${k}`;

  function applyVisibility(key: PanelKey) {
    for (const k of KEYS) {
      const el = document.getElementById(panelId(k));
      if (el) el.hidden = k !== key;
    }
  }

  function select(key: PanelKey, updateHash = true) {
    active = key;
    applyVisibility(key);
    if (updateHash) {
      // 深链格式：#s-1-2--demo  —— 可分享、切换语言后能停在同一面板
      history.replaceState(null, '', `#${sectionId}--${key}`);
    }
  }

  /** WAI-ARIA Tabs 键盘模型：← → 循环切换，Home / End 跳首尾 */
  function onKeydown(e: KeyboardEvent) {
    const i = KEYS.indexOf(active);
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = (i + 1) % KEYS.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + KEYS.length) % KEYS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = KEYS.length - 1;
    if (next === null) return;
    e.preventDefault();
    select(KEYS[next]!);
    (tablist.querySelector(`#${CSS.escape(tabId(KEYS[next]!))}`) as HTMLElement | null)?.focus();
  }

  function readHash(): PanelKey | null {
    const m = location.hash.match(/^#(.+?)--(explain|code|demo)$/);
    return m && m[1] === sectionId ? (m[2] as PanelKey) : null;
  }

  onMount(() => {
    // 把 SSR 阶段写好的 aria 关系补上（面板由 Astro 渲染，这里只补动态部分）
    for (const k of KEYS) {
      const el = document.getElementById(panelId(k));
      el?.setAttribute('aria-labelledby', tabId(k));
    }
    const fromHash = readHash();
    if (fromHash) select(fromHash, false);
    else applyVisibility(active);

    const onHash = () => {
      const k = readHash();
      if (k) select(k, false);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  });
</script>

<div
  class="tabs"
  role="tablist"
  tabindex="-1"
  aria-label={groupLabel}
  bind:this={tablist}
  onkeydown={onKeydown}
>
  {#each KEYS as key (key)}
    <button
      type="button"
      class="tab"
      role="tab"
      id={tabId(key)}
      aria-selected={active === key}
      aria-controls={panelId(key)}
      tabindex={active === key ? 0 : -1}
      onclick={() => select(key)}
    >
      {labels[key]}
    </button>
  {/each}
</div>
