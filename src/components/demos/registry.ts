import type { Component } from 'svelte';

/**
 * 演示注册表 —— 全站唯一的 demoId → 组件 映射。
 *
 * 目录 l1..l6 对应「布局的六层」，与章节一一对应。
 *
 * 每一项都是 `() => import(...)`，Vite 会为每个演示生成独立 chunk：
 * 首屏不含任何 D3，读者打开某个「演示」面板时才下载对应的那一个。
 *
 * `scripts/check-i18n-parity.mjs` 会校验每个小节的 demo.id 都能在这里找到 ——
 * 写错 id 是 CI 失败，不是运行时空白。
 */
export type DemoLoader = () => Promise<{ default: Component<any> }>;

export const demoRegistry: Record<string, DemoLoader> = {
  /* ── 第 1 层 · 内容层 ───────────────────────────────────────── */
  'flow-lab': () => import('./l1/FlowLab.svelte'),
  'sizing-lab': () => import('./l1/SizingLab.svelte'),
  density: () => import('./l1/DensityLab.svelte'),
  'case-s1': () => import('./l1/CaseS1.svelte'),

  /* ── 第 2 层 · 间距层 ───────────────────────────────────────── */
  gestalt: () => import('./l2/GestaltLab.svelte'),
  'spacing-scale': () => import('./l2/SpacingScaleLab.svelte'),
  rhythm: () => import('./l2/RhythmLab.svelte'),
  'case-s2': () => import('./l2/CaseS2.svelte'),

  /* ── 第 3 层 · 尺度层 ───────────────────────────────────────── */
  'grid-builder': () => import('./l3/GridBuilder.svelte'),
  'column-math': () => import('./l3/ColumnMath.svelte'),
  'type-scale': () => import('./l3/TypeScaleLab.svelte'),
  'case-s3': () => import('./l3/CaseS3.svelte'),

  /* ── 第 4 层 · 结构层 ───────────────────────────────────────── */
  'flex-vs-grid': () => import('./l4/FlexVsGrid.svelte'),
  'area-painter': () => import('./l4/AreaPainter.svelte'),
  'alignment-matrix': () => import('./l4/AlignmentMatrix.svelte'),
  'tab-order': () => import('./l4/TabOrderLab.svelte'),
  'case-s4': () => import('./l4/CaseS4.svelte'),

  /* ── 第 5 层 · 视觉层 ───────────────────────────────────────── */
  'scan-path': () => import('./l5/ScanPathLab.svelte'),
  hierarchy: () => import('./l5/HierarchyLab.svelte'),
  'balance-lab': () => import('./l5/BalanceLab.svelte'),
  'elevation-ladder': () => import('./l5/ElevationLadder.svelte'),
  'rhythm-composer': () => import('./l5/RhythmComposer.svelte'),
  'chrome-ratio': () => import('./l5/ChromeRatio.svelte'),
  'case-s5': () => import('./l5/CaseS5.svelte'),

  /* ── 第 6 层 · 适应层 ───────────────────────────────────────── */
  'breakpoint-finder': () => import('./l6/BreakpointFinder.svelte'),
  'clamp-plotter': () => import('./l6/ClampPlotter.svelte'),
  'container-query': () => import('./l6/ContainerQueryLab.svelte'),
  'intrinsic-patterns': () => import('./l6/IntrinsicPatterns.svelte'),
  'reflow-audit': () => import('./l6/ReflowAudit.svelte'),
  'cls-lab': () => import('./l6/CLSLab.svelte'),
  'thrash-lab': () => import('./l6/ThrashLab.svelte'),
  'case-s6': () => import('./l6/CaseS6.svelte'),
};

export const demoIds = Object.keys(demoRegistry);

export function hasDemo(id: string): boolean {
  return id in demoRegistry;
}
