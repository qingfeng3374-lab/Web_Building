# ADR-0004 · p5.js 的边界：只做装饰，不做信息

**状态**：已采纳 · 2026-09-16

## 决策

p5.js 只用于**页面美化**（门户 Hero 的呼吸网格、章节页头的流场丝带、5.3 节的节奏图案）。
所有承载信息的图形一律由 D3 生成 SVG。

## 理由

p5 是**即时模式**画布：画完就没有结构了。这意味着

- 读屏器读不到任何内容
- 测试抓不到任何元素（E2E 无法断言）
- 无法被浏览器内查找命中
- 无法被复制、无法被检查

对装饰层这些都不重要；对信息层这些全都致命。

## 强制措施

`P5Canvas.svelte` 写死了 8 条约束，任何草图都绕不过去：

1. 实例模式，不污染 `window`
2. 动态 `import('p5')`，只在 `client:visible` 之后
3. `prefers-reduced-motion: reduce` → **完全不加载 p5**，渲染静态 SVG 兜底
4. 离开视口 → `noLoop()`
5. 标签页隐藏 → `noLoop()`
6. `pixelDensity ≤ 2`、`frameRate(24)`
7. canvas `aria-hidden` + `pointer-events: none`
8. 容器固定高度 → canvas 加载前后零布局偏移

第 3、8 两条尤其重要：一门讲 CLS 与 reduced-motion 的课程，自家的装饰层不能是反面教材。
