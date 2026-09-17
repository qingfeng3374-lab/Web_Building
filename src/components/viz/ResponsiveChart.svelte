<script lang="ts">
  /**
   * D3 图表的统一容器。
   *
   * 四件事，所有演示都不必再写一遍：
   *   ① ResizeObserver 下发尺寸（图表永远跟随容器，不写死 px）
   *   ② 固定 aspect-ratio → 数据到达前就占好位，CLS = 0（第 6.3 节的自我应用）
   *   ③ role="img" + <title>/<desc>，读屏器能读懂这张图是什么
   *   ④ 视觉隐藏的数据表回退（rows），图看不见时信息不丢
   */
  import type { Snippet } from 'svelte';

  let {
    title,
    desc,
    ratio = 16 / 9,
    minHeight = 160,
    caption,
    rows,
    children,
  }: {
    title: string;
    desc: string;
    ratio?: number;
    minHeight?: number;
    caption?: string;
    /** 无障碍数据表：第一行为表头 */
    rows?: string[][];
    children: Snippet<[{ width: number; height: number }]>;
  } = $props();

  let host: HTMLElement;
  let width = $state(0);
  const height = $derived(Math.max(minHeight, width / ratio));

  const uid = `chart-${Math.random().toString(36).slice(2, 9)}`;

  $effect(() => {
    if (!host) return;
    const ro = new ResizeObserver(([entry]) => {
      width = entry?.contentRect.width ?? 0;
    });
    ro.observe(host);
    return () => ro.disconnect();
  });
</script>

<figure class="chart" bind:this={host} style={`--ratio:${ratio}`}>
  <div class="chart__frame" style={`aspect-ratio:${ratio}; min-block-size:${minHeight}px`}>
    {#if width > 0}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${uid}-t ${uid}-d`}
        preserveAspectRatio="xMidYMid meet"
      >
        <title id={`${uid}-t`}>{title}</title>
        <desc id={`${uid}-d`}>{desc}</desc>
        {@render children({ width, height })}
      </svg>
    {/if}
  </div>

  {#if caption}<figcaption>{caption}</figcaption>{/if}

  {#if rows?.length}
    <table class="visually-hidden">
      <caption>{title}</caption>
      <thead>
        <tr>{#each rows[0]! as h (h)}<th scope="col">{h}</th>{/each}</tr>
      </thead>
      <tbody>
        {#each rows.slice(1) as row, i (i)}
          <tr>{#each row as cell, j (j)}<td>{cell}</td>{/each}</tr>
        {/each}
      </tbody>
    </table>
  {/if}
</figure>

<style>
  .chart__frame {
    inline-size: 100%;
  }
  .chart__frame > svg {
    inline-size: 100%;
    block-size: 100%;
  }
</style>
