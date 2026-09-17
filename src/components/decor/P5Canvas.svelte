<script lang="ts">
  /**
   * p5.js 宿主。
   *
   * 关键修复（相对上一版）：画布尺寸**完全跟随宿主容器**，
   * 由 ResizeObserver 下发给草图，而不是写死一个 height prop。
   * 上一版用 `min-block-size: var(--p5-h)` + `position:absolute; inset:0`，
   * 当容器比这个值矮时画布会比容器高 —— 这就是「页眉高度不一致」的来源。
   *
   * 边界（ADR-0004）：p5 不承担信息传达。
   * 8 条硬约束（实例模式 / 动态 import / reduced-motion 不加载 /
   * 离屏暂停 / 隐藏暂停 / 像素密度与帧率上限 / aria-hidden /
   * 容器先占位再绘制）在这里统一执行，任何草图都绕不过去。
   */
  import { onMount } from 'svelte';
  import type { SketchName } from './sketches';

  let {
    sketch,
    accentVar = '--accent',
    /** 仅在容器没有自身高度时作为兜底；有高度时完全跟随容器 */
    fallbackHeight = 160,
    /** 静态兜底纹样的强度（reduced-motion 或加载前） */
    fallback = 'hatch',
  }: {
    sketch: SketchName;
    accentVar?: string;
    fallbackHeight?: number;
    fallback?: 'hatch' | 'none';
  } = $props();

  let host: HTMLDivElement;
  let live = $state(false);

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // 约束 3

    let instance: any = null;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let onVis: (() => void) | null = null;
    let disposed = false;

    // 尺寸永远从宿主读，草图通过 getSize() 拿到最新值
    const size = { w: host.clientWidth, h: host.clientHeight || fallbackHeight };
    const getSize = () => size;

    (async () => {
      const [{ default: P5 }, { sketches }] = await Promise.all([
        import('p5'), // 约束 2
        import('./sketches'),
      ]);
      if (disposed) return;

      instance = new P5(sketches[sketch]({ accentVar, getSize }), host); // 约束 1
      live = true;

      ro = new ResizeObserver(([entry]) => {
        size.w = entry?.contentRect.width ?? host.clientWidth;
        size.h = entry?.contentRect.height || fallbackHeight;
      });
      ro.observe(host);

      io = new IntersectionObserver(
        ([entry]) => {
          if (!instance) return;
          entry?.isIntersecting ? instance.loop() : instance.noLoop(); // 约束 4
        },
        { threshold: 0 },
      );
      io.observe(host);

      onVis = () => {
        if (!instance) return;
        document.hidden ? instance.noLoop() : instance.loop(); // 约束 5
      };
      document.addEventListener('visibilitychange', onVis);
    })();

    return () => {
      disposed = true;
      io?.disconnect();
      ro?.disconnect();
      if (onVis) document.removeEventListener('visibilitychange', onVis);
      // 草图可以挂一个 cleanup（比如自己注册的 MutationObserver）。
      // p5 的 remove() 只管它自己创建的东西，草图的订阅得自己收。
      instance?.cleanup?.();
      instance?.remove();
    };
  });
</script>

<!-- 约束 8：容器由外部决定高度，画布填满它；加载前后零布局偏移 -->
<div
  class="p5-host"
  class:is-live={live}
  class:has-hatch={fallback === 'hatch'}
  bind:this={host}
  aria-hidden="true"
  style={`--p5-fallback-h:${fallbackHeight}px; --p5-accent: var(${accentVar})`}
></div>

<style>
  .p5-host {
    position: absolute;
    inset: 0;
    block-size: 100%;
    overflow: hidden;
    pointer-events: none; /* 约束 7 */
  }
  /* 加载前 / reduced-motion 下的静态兜底：一层极淡的斜向纹样 */
  .p5-host.has-hatch {
    background-image: repeating-linear-gradient(
      115deg,
      color-mix(in srgb, var(--p5-accent) 7%, transparent) 0 1px,
      transparent 1px 26px
    );
  }
  .p5-host.is-live {
    background-image: none;
  }
  .p5-host :global(canvas) {
    display: block;
    inline-size: 100% !important;
    block-size: 100% !important;
  }
</style>
