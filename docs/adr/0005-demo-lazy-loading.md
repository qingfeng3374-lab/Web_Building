# ADR-0005 · 演示懒加载：用 client:visible 而不是手写逻辑

**状态**：已采纳 · 2026-09-16

## 决策

每个演示由 `DemoHost.svelte` 宿主，宿主本身用 `client:visible` 挂载，内部再按 `demoId` 动态 `import()`。

## 理由

「演示」面板在未激活时是 `hidden` 的，而 `hidden` 元素不会触发 IntersectionObserver。
于是 `client:visible` 天然实现了「读者真的打开演示面板，那个演示的 JS 才会被下载」——
**不需要手写任何「是否已加载」的状态管理**。

样例的做法是在 `lesson.js` 里维护一个 `DEMOS` 注册表 + `data-rendered` 标记 + 手动调用。
本站用同样一个注册表，但加载时机交给声明式指令，逻辑少了一半。

## 代价

`registry.ts` 的 key 是字符串，写错不会在类型层面报错。
因此 `check-i18n-parity.mjs` 增加了一项检查：每个小节的 `demo.id` 必须能在注册表中找到，否则 CI 失败。
