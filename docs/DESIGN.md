# 《页面布局之道》交互式教学网站 · 设计与实施方案

> ⚠️ **本文是项目启动时的设计方案（v1.0），保留为设计过程的记录。**
> 其中**章节编排**与**案例模型**两部分已被实现取代，以两份 ADR 为准：
> - [ADR-0006](adr/0006-typed-content-modules.md) —— 内容改用带类型的 TS 模块，不用 MDX（取代 §6）
> - [ADR-0007](adr/0007-six-layer-spine.md) —— 主线改为「六层能力叠加」，案例从 `v0..v6`（修 12 个病灶）
>   改为 `stage0..stage6`（加 6 层能力）（取代 §2 的章节编排与 §4 的案例模型）
>
> 其余部分（技术选型、i18n 策略、D3/p5 的使用边界、工程门禁、目录结构）仍然有效。

> **文档版本** v1.0 ｜ **日期** 2026-09-16 ｜ **状态** 待评审后进入实施
> **技术栈** Astro 5 + Svelte 5 + TypeScript + D3.js v7（模块化）+ p5.js（实例模式）
> **形态** 纯前端静态站点（SSG，无后端），中英双语，可独立部署

---

## 0. 一页纸摘要（TL;DR）

我们要做一个**讲「如何做好页面布局」的教学网站**。它模仿给定样例的信息组织方式（顶部章节栏 + 左侧目录 + 每小节「讲解 / 关键代码 / 演示」三 Tab），但在三处做了实质升级：

| 维度 | 样例做法 | 本方案做法 | 理由 |
|---|---|---|---|
| 工程形态 | 手写 HTML + 脚本注入 demo | Astro 内容集合 + Svelte 孤岛组件 | 可维护、可测试、可增量构建 |
| 双语 | 双 DOM（`data-lang` 中英节点同时存在）+ JS 隐藏 | **路由级 i18n**（`/zh/…` `/en/…`）+ 内容集合分语言 + **CI 一致性校验** | DOM 不翻倍、SEO 可索引、「内容一致」可被机器验证 |
| 内容 | 逐节独立知识点 | **一条贯穿案例**（NeoCampus 新生数据看板 v0 → v6），每章推进一版 | 满足「按案例展开」的加分项，知识点有因果链 |

**内容主线**：6 章 × 5~6 小节 ≈ **32 个知识小节**，每节都有「理论讲解 → 关键代码 → 可交互演示」。演示全部是真实计算的（D3 实时绘图 / 浏览器实测指标），不是静态图片。

**贯穿案例**：一个真实写坏了的数据看板。第 1 章诊断它，第 2~6 章每章修一层，最后在「案例馆」用 Before/After 对比与指标折线收尾。

**元设计彩蛋**：网站自身就是最后一个案例——按 `G` 键可把 12 列网格与 8pt 间距标尺叠加到当前页面上，读者能亲自验证「我们讲的规则，我们自己遵守了没有」。

---

## 1. 需求对照表

| # | 原始要求 | 方案落点 | 验收方式 |
|---|---|---|---|
| R1 | 教学网站，仅前端 | Astro `output: 'static'`，产物为纯 `dist/` | `npm run build` 后 `dist/` 可用任意静态服务器托管 |
| R2 | Svelte + Astro | Astro 负责路由/内容/SSG；Svelte 负责全部交互孤岛 | `astro.config.mjs` 集成 `@astrojs/svelte` |
| R3 | 模仿样例（目录网页） | 门户页 + 顶部章节栏 + 左侧章节目录 + 章节翻页器，视觉语言沿用 | 与样例并排截图对比 |
| R4 | 讲解 / 关键代码 / 演示 三部分 | `<SectionTabs>` 组件（ARIA tablist，三面板，URL 可深链） | 每小节三面板齐全，无空面板 |
| R5 | 演示动态可交互 | 32 个 Svelte + D3 演示，全部含输入控件（滑块/拖拽/切换/键盘） | 交互清单见 §4；Playwright 冒烟覆盖 |
| R6 | 中英双语，内容一致 | 路由级 i18n + 内容集合 `zh/` `en/` 同构 + `check-i18n-parity` CI 门禁 | CI 红灯即阻断合并 |
| R7 | 与布局相关的**理论**，非纯语法 | 每节「讲解」必含「理论出处 + 为什么 + 何时失效」三段式；附录 §14 列参考文献 | 每节 `theory` 字段非空（Zod 校验） |
| R8 | 案例式展开（加分） | NeoCampus 看板 v0→v6，每章底部 `<CaseProgress>` 显示 diff + 实测指标 | 案例馆可播放完整演进 |
| R9 | 页面布局合理 | 自有设计系统（tokens）＋ 网格叠加自检工具；Lighthouse/axe 门禁 | 见 §9 预算表 |
| R10 | D3.js 绘图 | 全部图表/示意图由 D3 生成（按模块引入） | 见 §4 每节的 D3 用法列 |
| R11 | p5.js 页面美化 | 门户 Hero、章节页头、5.3 节奏演示的生成式装饰层 | 见 §7.3；含 reduced-motion 降级 |
| R12 | 目录结构合理、符合软件工程实践 | 见 §6 目录树；含 ADR、测试、CI、脚手架脚本 | 见 §11 质量保障 |

---

## 2. 样例分析（继承什么、改什么）

### 2.1 样例结构拆解

```
.course-topbar        顶部粘性章节栏（brand + 章节 tabs + 语言切换）
.lesson-header        章节大标题 + 副标题 + 操作提示
.lesson-main          grid: 220px 1fr
  ├─ .chapter-nav     左侧小节目录（sticky，active 高亮）
  └─ .chapter-content
       └─ article.chapter#ch-1-1
            ├─ h2 + .chapter-subtitle
            ├─ .tabs        → 📖 讲解 / ⌨️ 关键代码 / ▶️ 演示
            └─ .tab-panels
                 ├─ [data-panel=explain]  原案例 → 嵌入理论 → 课堂要点(.note)
                 ├─ [data-panel=code]     .code-purpose → <pre><code> → .key-point
                 └─ [data-panel=demo]     .demo-hint → .demo-mount[data-demo=id]
.lesson-footer
.chapter-pager        上一章 / 门户 / 下一章
```

`lesson.js` 用 `DEMOS[id] = (mount) => {…}` 注册表 + `data-demo` 属性做惰性挂载；`i18n.js` 用 `data-i18n`（字典）与 `data-lang`（双 DOM 正文）两套机制并行。

### 2.2 值得继承的

1. **三 Tab 心智模型**：讲解 → 代码 → 演示，是教学页的最优信息节律，直接沿用（含 emoji 标识）。
2. **`.key-point` / `.note` / `.code-purpose` 语义块**：把「这段代码为什么这么写」「坑在哪」显式化，教学价值极高，保留并组件化。
3. **演示惰性挂载**：切到演示面板才初始化，性能友好；我们用动态 `import()` 做得更彻底（真正的代码分割）。
4. **视觉语言**：slate 灰阶 + 蓝色强调 + 8px 圆角 + 卡片化，克制、专业、适合课堂投影。沿用色相，但重建为设计令牌。
5. **章节翻页器 + 门户回链**：完整的浏览闭环。

### 2.3 必须改掉的

| 样例问题 | 后果 | 本方案 |
|---|---|---|
| 双 DOM 双语（每段中英各存一份，`hidden` 切换） | DOM 体积翻倍；演示内部文案无法双语；中英失配无人察觉 | 路由级 i18n + 内容集合同构 + CI 校验 |
| 手写 `<span class="kw">` 语法高亮 | 维护成本高、易错、无法复制纯代码 | Astro 内置 Shiki 编译期高亮（零运行时开销） |
| `import * as d3` 整包引入 | 全量 D3 进首屏 | 按 `d3-scale` / `d3-selection` 等子包引入 |
| 全局 `id` 硬编码（`d-3-1-log`） | 同页多实例冲突，无法复用 | Svelte 组件作用域 + `$props()`，演示可多实例 |
| 演示逻辑与 DOM 字符串拼接耦合 | 无法单测 | 计算逻辑抽到 `src/lib/`（纯函数，vitest 覆盖） |
| 无测试 / 无 CI / 无类型 | 回归无保障 | TS + vitest + Playwright + axe + Lighthouse CI |
| 演示中出现横向溢出、`width:100%` 的 SVG 未设 viewBox 上限 | 移动端破版 | 统一 `ResponsiveChart` 容器 + ResizeObserver |

---

## 3. 内容设计（本方案的核心）

### 3.1 贯穿案例：NeoCampus 新生数据看板

> **故事设定**：教务处要一个「新生数据看板」。后端同学两天赶出了 v0：能跑、数据对、但**没人看得懂**。产品经理的原话是——「信息都在，就是找不着」。
> 我们的任务：用 6 章的布局理论，把 v0 一步步重构成 v6。

v0 刻意埋入 **12 个真实世界的布局病灶**，每个都对应后面某一节的理论：

| # | 病灶 | 对应章节 |
|---|---|---|
| 1 | 最重要的「总人数」卡片被放在右下角 | 1.1 扫视路径 |
| 2 | 筛选器与图表的间距 = 图表与图表的间距 | 1.2 接近性原则 |
| 3 | 8 张卡片字号字重完全相同 | 1.3 视觉层级 |
| 4 | 正文行长 128 字符，段落无留白 | 1.4 信息密度 |
| 5 | 卡片宽度写成 `width: 23.7%` 这类魔数 | 2.1 / 2.2 网格 |
| 6 | 间距取 5 / 7 / 13 / 18px，毫无规律 | 2.3 间距标尺 |
| 7 | 用 `<br>` 和 `margin-top: 17px` 对齐文字 | 2.4 基线节奏 |
| 8 | 用 `float` + 百分比宽度做主布局 | 3.1 / 3.3 引擎选择 |
| 9 | 卡片内容溢出被 `overflow: hidden` 截断 | 3.2 内在尺寸 |
| 10 | 只有 768px 一个断点，1024px 处布局崩坏 | 4.1 内容断点 |
| 11 | 图片无 `width/height`，加载时页面跳动（CLS ≈ 0.31） | 6.3 布局稳定性 |
| 12 | 用 `order` 调视觉顺序，Tab 焦点乱跳 | 6.1 DOM 顺序 |

**版本演进轴**（每章结尾推进一版）：

```
v0 混沌 ──L1 诊断──▶ v1 骨架 ──L2──▶ v2 引擎 ──L3──▶
v3 自适应 ──L4──▶ v4 精修 ──L5──▶ v5 稳健 ──L6──▶ v6 成品
```

每章末尾固定渲染 `<CaseProgress version="v2" />`：

- D3 绘制的 7 段进度轴（当前版本高亮，可点击跳到案例馆）
- 本版改动的 CSS diff（Shiki 高亮，+/− 着色）
- **4 项实测指标**的变化（不是写死的数字，见 §3.2）

### 3.2 案例指标：可被真实测量的四个数

| 指标 | 定义 | 测量方式 | 好的方向 |
|---|---|---|---|
| **层级分** `hierarchy` | 首屏元素「视觉重量」序列的单调性 | `layout-metrics.ts` 对 iframe 内元素求 `w = f(面积, 对比度, 字重, 位置权重)`，计算 Spearman 相关系数 | ↑ |
| **行长** `measure` | 正文块平均字符数（ch） | `getBoundingClientRect().width / 单字符宽度` | → 45~75 |
| **CLS** | 累计布局偏移 | `PerformanceObserver({ type: 'layout-shift' })` 在 iframe 内实测 | ↓ |
| **触达** `a11y` | 焦点顺序与视觉顺序的逆序对数 + 小于 24px 的目标数 | 遍历可聚焦元素的 `rect` 与 Tab 序 | ↓ |

> **工程取舍**：iframe 实测受浏览器差异影响。`src/data/case-metrics.json` 存一份构建期基线值；运行期实测成功则覆盖显示并标注「实测」，失败则回落到基线值并标注「基线」。演示永远不会白屏。

### 3.3 章节大纲

> 记号：**讲** = 讲解面板要点；**码** = 关键代码面板；**演** = 演示面板（组件 · 交互 · D3 用法）

---

#### 第 1 章 · 视觉先于布局（Perception before Layout）

*副标题：人眼不是从左上角逐行扫描的——布局是对注意力的调度*

**1.1 扫视路径：F 型、Z 型与古腾堡图**

- **讲**：Nielsen (2006) 眼动研究的 F 型模式；Gutenberg 图的四象限与「阅读重力」；Z 型适用于低密度落地页而非高密度看板。**何时失效**：F 型结论来自长文本页，卡片式看板更接近「分区跳读」。
- **码**：用 CSS 显式表达优先级——`grid-template-areas` 把首要信息放进主视区；为什么不能用 `order` 做这件事（预告 6.1）。
- **演**：`ScanPathLab` — 三种布局模板切换 + 「首屏信息密度」滑块；D3 `d3-contour` 由元素权重生成注视热力图，`d3-path` 动画播放预测扫视路径，右侧列出「前 3 秒看到了什么」。

**1.2 格式塔：接近、相似、共同区域、连续、闭合**

- **讲**：五条定律在界面中的**强度排序**（接近 > 共同区域 > 相似 > 连续 > 闭合）；「间距是最便宜的分组手段，边框是最贵的」。
- **码**：用 `gap` 而非 `margin` 表达分组；`:has()` 与逻辑分组容器。
- **演**：`GestaltLab` — 24 个方块 + 4 个滑块（间距 / 色相差 / 边框 / 背景区域）；用并查集按感知阈值实时算出**人眼会分成几组**，D3 画分组包围盒。可亲手验证「加大间距 12px 胜过加一圈边框」。

**1.3 视觉层级与视觉重量**

- **讲**：层级的五个杠杆（尺寸、字重、颜色对比、位置、留白）与边际收益；**眯眼测试**的原理（保留低频信息）；「三级足够，五级过载」。
- **码**：用 `--step-*` 音阶令牌而非任意 `font-size`；`font-weight` 与 `color` 的替代关系。
- **演**：`HierarchyLab` — 模糊滑块做眯眼测试 + 逐元素调字号/字重/颜色；D3 条形图实时显示各元素**视觉重量**并标红「层级倒挂」处。

**1.4 留白、信息密度与行长**

- **讲**：宏观留白（区块间）vs 微观留白（行间/字间）；45–75 字符行长的实验依据（Tinker / Bringhurst）；中文行长按 `em` 而非 `ch` 计算的差异；「密度不是敌人，无节奏的密度才是」。
- **码**：`max-inline-size: 65ch`、`line-height` 无单位值的继承语义、`text-wrap: balance / pretty`。
- **演**：`DensityLab` — compact / cozy / comfortable 三档 + 无级滑块；D3 同步显示「内容像素占比」「平均行长(ch)」「可扫描性评分」三条仪表。

**1.5 案例 v0：给看板做一次视觉诊断**

- **讲**：诊断流程（5 秒测试 → 眯眼测试 → 分组测试 → 行长测试）。
- **码**：诊断脚本骨架（遍历 DOM 采集矩形与计算样式）。
- **演**：`CaseDiagnose` — 真实渲染的 v0 看板 + 12 个可点击标注热点；点击弹出「问题 / 违反了什么原则 / 去第几节修」并可跳转。D3 绘制标注引线与热区。

---

#### 第 2 章 · 秩序的骨架：网格与尺度（Grid & Scale）

*副标题：好布局不是「摆得好看」，是「每个位置都有理由」*

**2.1 从瑞士国际主义到 Web 网格**

- **讲**：Müller-Brockmann 的模块网格思想；印刷网格与 Web 网格的根本差异（纸张固定 / 视口连续）；为什么是 12 列（可被 2/3/4/6 整除）。
- **码**：`grid-template-columns: repeat(12, minmax(0, 1fr))` 与其中 `0` 的必要性。
- **演**：`GridBuilder` — 列数 / 水槽 / 边距 / 最大宽度四个滑块；D3 绘制网格图并实时输出可复制的 CSS，可一键叠加到真实卡片上。

**2.2 列宽数学与「占几列」决策**

- **讲**：`col = (W − 2M − (n−1)G) / n` 的推导；内容驱动的跨列决策（文字块 6~8 列、图表 4~6 列、KPI 3 列）。
- **码**：`grid-column: span 4` 与 `subgrid` 的对齐传递。
- **演**：`ColumnMath` — 拖动视口宽度，D3 同步画出列宽曲线与「此宽度下卡片应占几列」的阶梯函数。

**2.3 间距标尺与 8pt 网格**

- **讲**：为什么需要标尺（决策成本、一致性、可沟通性）；线性（4/8）vs 几何（1.5× / φ）标尺的适用场景；t-shirt 命名 vs 数字命名的团队成本。
- **码**：设计令牌 `--space-1 … --space-9`；「`gap` 只允许取令牌值」的 lint 规则。
- **演**：`SpacingScaleLab` — 选基数与增长方式，D3 画刻度尺；左右对照「任意间距的卡片」与「标尺间距的卡片」。

**2.4 基线网格与垂直节奏**

- **讲**：垂直节奏的本质是「行高的最小公倍数」；`margin` 合并如何破坏节奏；中文排版的基线偏移问题。
- **码**：`--leading: 1.5`、`> * + *` 的 Stack 原语、`flow-root` 阻断合并。
- **演**：`RhythmLab` — 文本块 + D3 基线覆盖层；拖 `line-height` / `margin`，实时显示**落在基线上的行占比**。

**2.5 排版音阶与模块比例**

- **讲**：模块音阶（1.125 / 1.2 / 1.25 / 1.333 / 1.5 / φ）；音阶比率与信息层级数的匹配；黄金比在屏幕上的实际局限。
- **码**：`--step-0: clamp(…)` 生成式音阶（预告 4.2）。
- **演**：`TypeScaleLab` — 选比率 → D3 画音阶柱 + 实时字号阶梯预览 + 可复制 CSS 变量。

**2.6 案例 v1：给看板套上骨架**

- **演**：`CaseV1` — Before/After 拖拽对比 + 网格叠加开关；`<CaseProgress version="v1" />` 显示四项指标变化。

---

#### 第 3 章 · 布局引擎：流、弹、格（Flow / Flex / Grid）

*副标题：三个引擎不是三种写法，是三种世界观*

**3.1 常规流、包含块、BFC 与外边距合并**

- **讲**：常规流是**默认且最强健**的布局（它天然自适应）；包含块链如何决定百分比的参照；BFC 的触发条件与三个用途；外边距合并的三种情形。
- **码**：`display: flow-root` 取代 `overflow: hidden` 的历史包袱。
- **演**：`FlowLab` — 可切换的盒子树；D3 绘制包含块链；开关 BFC / 合并条件，左侧盒子实时变形，右侧同步高亮对应 CSS 行。

**3.2 内在尺寸与外在尺寸**

- **讲**：`min-content` / `max-content` / `fit-content` 的定义与直觉；「内在式设计」（Jen Simmons）的主张：让内容决定尺寸，而非让尺寸裁剪内容；溢出是设计失败的信号，不是样式问题。
- **码**：`width: min(100%, 60ch)`、`flex-basis` 与 `min-width: 0` 的经典陷阱。
- **演**：`SizingLab` — 拖动容器宽度；D3 折线图画出四种尺寸模式随容器宽度的响应曲线，下方同步一个真实盒子。

**3.3 一维 vs 二维：什么时候用 Flex，什么时候用 Grid**

- **讲**：判据三问（是否需要跨行对齐？内容数量是否已知？谁决定尺寸——容器还是内容？）；常见误用（用 Grid 做一行按钮、用 Flex 做卡片矩阵）。
- **码**：同一组卡片的两种实现对照。
- **演**：`FlexVsGridLab` — 切换引擎 + 拖宽容器；D3 画出每张卡片的**实测宽度分布**，直观暴露「最后一行不对齐」与「列轨道一致」的差别。

**3.4 Grid 的表达力：areas / minmax / auto-fit / subgrid**

- **讲**：`grid-template-areas` 作为**可读的布局文档**；`auto-fill` 与 `auto-fit` 的区别（空轨道保留与否）；`subgrid` 解决的「卡片内部对齐」问题与降级策略。
- **码**：看板骨架的 areas 写法（本章要产出的 v2 核心代码）。
- **演**：`AreaPainter` — 在 6×4 网格上用鼠标刷区域名，实时生成 `grid-template-areas` 代码并渲染成看板骨架，可导出。

**3.5 对齐系统统一论**

- **讲**：Box Alignment 规范的二维表（`justify` / `align` × `content` / `items` / `self`）；「对齐分配的是**剩余空间**」这一统一心智；光学对齐留到 5.1。
- **码**：`place-content` / `place-items` 简写与可读性权衡。
- **演**：`AlignmentMatrix` — 3×3 组合切换；D3 用半透明色块标出**剩余空间被分配到哪里**——这是理解对齐的关键可视化。

**3.6 案例 v2：用 areas 重写看板骨架**（`CaseV2` + `CaseProgress`）

---

#### 第 4 章 · 自适应：从断点到内在式设计（Responsive → Intrinsic）

*副标题：断点是失败的补丁，不是设计的起点*

**4.1 内容断点 vs 设备断点**

- **讲**：设备尺寸列表为什么是陷阱（碎片化、分屏、缩放）；内容断点的定义——**布局在某个宽度开始伤害内容**；如何用行长与最小可用宽度找到它。
- **码**：容器优先的断点声明方式。
- **演**：`BreakpointFinder` — 拖动视口宽度；D3 画 measure(ch) 曲线并自动标出「内容撑不住」的宽度区间，与常见设备断点线对照。

**4.2 clamp() 的数学**

- **讲**：`clamp(min, k·vw + b, max)` 就是一条被截断的直线；如何由两个设计稿宽度反解 `k` 与 `b`；为什么 `vw` 单独用会破坏缩放可达性（必须配 `rem`）。
- **码**：流体音阶生成函数（编译期生成 CSS 变量）。
- **演**：`ClampPlotter` — 输入 min/max 字号与 min/max 视口；D3 画出 fontSize(viewport) 折线（标注两个拐点与斜率），下方文字实时预览。**全站最「数学」的一个演示。**

**4.3 容器查询：组件的自治**

- **讲**：媒体查询是「页面级」的，组件放进侧栏就失效；容器查询把响应式还给组件；`container-type: inline-size` 的布局影响与代价。
- **码**：`@container (min-width: 30rem)` 与容器命名。
- **演**：`ContainerQueryLab` — 同一张卡片放进三个可拖宽的容器；对照展示同样条件下媒体查询的失效。

**4.4 无查询的算法布局（Every Layout 原语）**

- **讲**：RAM 技法 `repeat(auto-fit, minmax(min(100%, 20rem), 1fr))` 的逐段解读；Sidebar / Switcher / Cover 三个原语的数学原理（`flex-basis` + `flex-wrap` 的换行阈值推导）。
- **码**：四个原语的最小实现（每个 ≤ 6 行 CSS）。
- **演**：`IntrinsicPatterns` — 四原语参数化演示；D3 在容器宽度轴上标出**换行 / 切换发生的精确阈值**，并给出阈值公式。

**4.5 案例 v3：看板的 320 → 2560 全域自适应**（`CaseV3`，含视口标尺播放动画）

---

#### 第 5 章 · 美感的工程：平衡、节奏与克制（Balance / Rhythm / Restraint）

*副标题：好看是可以计算的*

**5.1 对齐、平衡与光学居中**

- **讲**：对称平衡 vs 非对称平衡；视觉重心的计算模型；**光学居中**（按钮文字、播放三角、大写字母）与数学居中的差值从哪来。
- **码**：图标微调的正确位置（`translate` 而非 `margin`），以及为什么要用 `--optical-shift` 令牌把它记录下来。
- **演**：`BalanceLab` — 可拖拽元素画布；D3 实时计算并绘制视觉重心十字线与「天平」；一键对比数学居中 / 光学居中。

**5.2 深度与层次：elevation 与 surface**

- **讲**：三种表达层次的手段（阴影 / 边框 / 背景）的成本与语义差异；Material elevation 体系的可迁移部分与不可迁移部分；暗色模式下阴影失效、必须靠亮度分层。
- **码**：`--surface-1..4` 与 `--elevation-1..4` 令牌，暗色模式的层次翻转。
- **演**：`ElevationLadder` — 三种手段的阶梯对照 + 明暗模式切换；D3 画出相邻层的**实测对比度差**曲线，标出低于可辨识阈值的层。

**5.3 节奏与重复**

- **讲**：重复建立预期，打破重复制造重点；卡片网格的三种节奏（等距 / 递进 / 成组）；节奏与扫视速度的关系（回到 1.1）。
- **码**：`:nth-child()` 与 `grid-auto-flow: dense` 制造节奏的代价。
- **演**：`RhythmComposer` — 参数化节奏生成；**p5.js** 在背景实时绘制对应的节奏图案，D3 在前景画卡片网格，两者共享同一组参数——直观展示「平面构成」与「界面布局」是同一件事。

**5.4 装饰的克制：内容-外壳比**

- **讲**：借用 Tufte 的 data-ink 思想定义 **content-chrome ratio**；分隔手段的优先级替代顺序（留白 > 背景 > 分隔线 > 边框 > 阴影）。
- **码**：逐级移除装饰的重构 diff。
- **演**：`ChromeRatio` — 逐项开关装饰；D3 实时显示内容像素占比与「视觉噪声估计」，找出这个页面的最优点。

**5.5 案例 v4：精修与生成式背景**（`CaseV4`，引入 p5 纹理层 + reduced-motion 降级演示）

---

#### 第 6 章 · 稳健的布局：顺序、可达、稳定、性能

*副标题：布局的最后 20% 决定它能不能上线*

**6.1 DOM 顺序即语义顺序**

- **讲**：视觉顺序与源码顺序解耦是 Flex/Grid 的能力，也是它最大的陷阱；`order` / `row-reverse` / `dense` 对键盘与读屏用户的伤害；WCAG 1.3.2「有意义的序列」。
- **码**：正确做法——改 DOM 顺序 + 用 Grid 定位，而不是改 `order`。
- **演**：`TabOrderLab` — 开关 `order` / `dense`；D3 在真实元素上绘制 **Tab 焦点路径折线**，自动标红交叉与回跳次数；读者可以直接按 Tab 键实操验证。

**6.2 重排与目标尺寸（WCAG 1.4.10 / 2.5.8）**

- **讲**：320px 宽 / 400% 缩放下不得出现双向滚动；24×24 CSS px 最小目标；固定视口单位与缩放的冲突。
- **码**：`min-height: 44px` 与用伪元素扩大命中区。
- **演**：`ReflowAudit` — 视口缩放模拟器；自动检测横向溢出元素与过小目标并高亮，输出可复制的审计条目。

**6.3 布局稳定性：CLS**

- **讲**：CLS 的定义（影响分数 × 距离分数）；三大来源（无尺寸媒体、字体替换、动态插入）；`aspect-ratio` / `size-adjust` / 骨架屏的取舍。
- **码**：`aspect-ratio` + `font-display: optional` + `contain-intrinsic-size`。
- **演**：`CLSLab` — 播放三种抖动场景，用 `PerformanceObserver` **真实测量** CLS；D3 画偏移时间轴与分数仪表；一键应用修复后重测对比。

**6.4 布局性能：回流、抖动与隔离**

- **讲**：什么触发同步布局（读取 `offsetHeight` 等）；layout thrashing 的读写交替模式；`contain` / `content-visibility` 的隔离原理与副作用。
- **码**：批量读写模式（读 → 算 → 写）与 `requestAnimationFrame` 调度。
- **演**：`ThrashLab` — 1000 次操作，对照「交替读写」与「批量读写」的实测耗时；D3 画柱状对比与帧时间线；再叠加 `content-visibility` 看长列表收益。

**6.5 案例 v5：看板审计报告**

- **演**：`CaseAudit` — D3 雷达图（层级 / 行长 / CLS / 触达 / 性能 / 一致性）+ 修复清单；与 v0 的雷达轮廓叠加对照。

---

#### 案例馆（Case Gallery，独立页面）

- **演进时间轴**：D3 绘制 v0→v6，点击任一版本切换预览。
- **Before/After 滑块**：拖拽分割线对比任意两版。
- **指标小多图**：4 指标 × 7 版本的 D3 small multiples。
- **布局决策树**：`d3-hierarchy` 交互树——回答 5 个问题（内容量 / 维度 / 自适应要求 / 对齐要求 / 浏览器目标），得出推荐的布局原语与代码。
- **30 条自检清单**：可勾选，`localStorage` 持久化，可导出 Markdown。

---

## 4. 演示组件清单（32 个）

| 节 | 组件 | 主要交互 | D3 模块 | p5 |
|---|---|---|---|---|
| 1.1 | `ScanPathLab` | 模板切换 / 密度滑块 / 播放 | contour, path, transition, scale | – |
| 1.2 | `GestaltLab` | 4 滑块 | scale, polygon(hull), selection | – |
| 1.3 | `HierarchyLab` | 模糊滑块 / 逐元素调参 | scale, axis, transition | – |
| 1.4 | `DensityLab` | 三档 + 无级滑块 | scale, arc(仪表) | – |
| 1.5 | `CaseDiagnose` | 热点点击 / 跳转 | path(引线), selection | – |
| 2.1 | `GridBuilder` | 4 滑块 / 叠加开关 / 复制 CSS | scaleBand, axis | – |
| 2.2 | `ColumnMath` | 视口拖拽 | scaleLinear, line, step | – |
| 2.3 | `SpacingScaleLab` | 基数 + 增长方式 / 对照 | scalePow, axis | – |
| 2.4 | `RhythmLab` | line-height / margin 拖拽 | line, scale | – |
| 2.5 | `TypeScaleLab` | 比率选择 | scalePow, bar | – |
| 2.6 | `CaseV1` | Before/After 滑块 | – | – |
| 3.1 | `FlowLab` | 盒子树 / BFC 开关 | tree, link, transition | – |
| 3.2 | `SizingLab` | 容器宽度拖拽 | line, scale, legend | – |
| 3.3 | `FlexVsGridLab` | 引擎切换 / 容器拖拽 | scale, bar(宽度分布) | – |
| 3.4 | `AreaPainter` | 网格刷区域 / 导出 | selection, drag | – |
| 3.5 | `AlignmentMatrix` | 3×3 切换 | rect(剩余空间), transition | – |
| 3.6 | `CaseV2` | 对比 / 代码 diff | – | – |
| 4.1 | `BreakpointFinder` | 视口拖拽 | line, area, 标注 | – |
| 4.2 | `ClampPlotter` | 4 输入 | line, axis, scale | – |
| 4.3 | `ContainerQueryLab` | 三容器拖宽 | –（以 DOM 为主） | – |
| 4.4 | `IntrinsicPatterns` | 原语切换 / 容器拖宽 | scale, axis(阈值标注) | – |
| 4.5 | `CaseV3` | 视口播放动画 | transition | – |
| 5.1 | `BalanceLab` | 元素拖拽 | drag, path(重心) | – |
| 5.2 | `ElevationLadder` | 层级 / 明暗切换 | line(对比度曲线) | – |
| 5.3 | `RhythmComposer` | 节奏参数 | 网格绘制 | ✅ 背景图案 |
| 5.4 | `ChromeRatio` | 装饰开关 | bar, gauge | – |
| 5.5 | `CaseV4` | 对比 / 动效开关 | – | ✅ 纹理层 |
| 6.1 | `TabOrderLab` | order/dense 开关 / Tab 实操 | line, marker | – |
| 6.2 | `ReflowAudit` | 缩放模拟 | rect(高亮) | – |
| 6.3 | `CLSLab` | 场景播放 / 一键修复 | line(时间轴), arc(仪表) | – |
| 6.4 | `ThrashLab` | 模式切换 / 运行 | bar, line(帧) | – |
| 6.5 | `CaseAudit` | 版本对照 | lineRadial(雷达) | – |
| 馆 | `CaseTimeline` / `DecisionTree` / `Checklist` | 多种 | hierarchy, tree, line | – |

**统一可达性要求**：每个演示的控件必须可键盘操作；每张 D3 图都有 `role="img"` + `<title>` / `<desc>`，并提供视觉隐藏的数据表回退。

---

## 5. 信息架构与路由

```
/                                → 302/meta 跳转到 /zh/（按 navigator.language 猜测）
/{locale}/                       → 课程门户（Hero + 6 章卡片 + 案例引子 + 学习路径图）
/{locale}/lessons/{slug}/        → 章节页（左侧小节目录 + 小节三 Tab）
/{locale}/lessons/{slug}/#{sectionId}            → 深链到小节
/{locale}/lessons/{slug}/#{sectionId}--demo      → 深链到小节的某个面板
/{locale}/case/                  → 案例馆
/{locale}/toolbox/               → 布局工具箱（把 GridBuilder / ClampPlotter / TypeScaleLab 抽出来独立使用）
/{locale}/about/                 → 关于与参考文献
/{locale}/404
```

`locale ∈ { zh, en }`；slug 全站语言无关（`perception` / `grid` / `engines` / `responsive` / `aesthetics` / `robust`），保证切换语言时**停留在同一页同一小节同一面板**——这是双语站最容易翻车的地方，必须在路由层解决。

**导航元素**（对齐样例）：

- `TopBar`：门户回链 + 6 章 tabs（当前章高亮）+ 语言切换 + 明暗切换 + 网格叠加开关
- `ChapterNav`：左侧小节目录，sticky，滚动同步高亮（IntersectionObserver）
- `Pager`：上一章 / 门户 / 下一章
- **进度指示**：读过的小节在目录上打点（localStorage），门户显示总进度环（D3 arc）

---

## 6. 目录结构

```
web_build/
├─ README.md                      # 快速开始、脚本说明、架构总览
├─ CONTRIBUTING.md                # 新增一节 / 新增一个演示的标准流程
├─ package.json
├─ astro.config.mjs
├─ svelte.config.js
├─ tsconfig.json
├─ vitest.config.ts
├─ playwright.config.ts
├─ eslint.config.js / .prettierrc / .editorconfig
├─ lighthouserc.json              # 性能预算门禁
├─ .github/workflows/ci.yml
│
├─ docs/
│  ├─ DESIGN.md                   # 本文档
│  ├─ CONTENT-OUTLINE.md          # 32 节的逐节内容脚本（写作用）
│  ├─ COMPONENT-API.md            # 组件契约
│  └─ adr/
│     ├─ 0001-astro-svelte.md            # 为什么是 Astro + Svelte 孤岛
│     ├─ 0002-route-based-i18n.md        # 为什么放弃样例的双 DOM 方案
│     ├─ 0003-d3-modular-imports.md      # 为什么不整包引 d3
│     ├─ 0004-p5-scope-and-budget.md     # p5 的使用边界与性能预算
│     └─ 0005-demo-registry-lazy.md      # 演示懒加载与代码分割策略
│
├─ public/
│  ├─ favicon.svg
│  ├─ fonts/                      # 自托管可变字体（含 size-adjust 回退）
│  └─ case/                       # 案例各版本的独立 HTML（供 iframe 实测）
│     ├─ v0.html … v6.html
│     └─ case.css
│
├─ scripts/
│  ├─ check-i18n-parity.mjs       # 中英内容结构一致性校验（CI 门禁）
│  ├─ measure-case-metrics.mjs    # Playwright 跑 v0..v6，产出 case-metrics.json 基线
│  ├─ new-section.mjs             # 脚手架：生成 zh/en MDX + 演示组件 + 注册表条目
│  └─ check-token-usage.mjs       # 扫描 CSS，禁止硬编码间距/字号（自我约束）
│
└─ src/
   ├─ pages/
   │  ├─ index.astro
   │  └─ [locale]/
   │     ├─ index.astro
   │     ├─ lessons/[slug].astro
   │     ├─ case/index.astro
   │     ├─ toolbox/index.astro
   │     ├─ about.astro
   │     └─ 404.astro
   │
   ├─ layouts/
   │  ├─ BaseLayout.astro         # <html>、meta、字体预载、主题脚本、hreflang
   │  ├─ PortalLayout.astro
   │  └─ LessonLayout.astro       # TopBar + ChapterNav + main + Pager + Footer
   │
   ├─ components/
   │  ├─ chrome/                  # 站点外壳（多为 .astro，零 JS）
   │  │  ├─ TopBar.astro
   │  │  ├─ ChapterNav.svelte     # 需要滚动同步 → 孤岛
   │  │  ├─ Pager.astro
   │  │  ├─ Footer.astro
   │  │  ├─ LangSwitch.astro      # 纯 <a>，无 JS（路由级 i18n 的红利）
   │  │  ├─ ThemeToggle.svelte
   │  │  └─ GridOverlay.svelte    # 按 G 叠加网格（元设计彩蛋）
   │  │
   │  ├─ lesson/
   │  │  ├─ Section.astro         # 一个小节的容器（h2 + 副标题 + Tabs + CaseProgress）
   │  │  ├─ SectionTabs.svelte    # ARIA tablist，三面板，URL 同步，懒挂载演示
   │  │  ├─ CodeBlock.astro       # Shiki + 行高亮 + ⭐ 关键行 + 复制按钮
   │  │  ├─ KeyPoint.astro        # .key-point 语义块
   │  │  ├─ Note.astro            # .note 课堂要点
   │  │  ├─ TheoryTable.astro
   │  │  ├─ TheoryRef.astro       # 文献引用角标 → 链到 /about
   │  │  └─ CaseProgress.svelte   # 案例进度轴 + diff + 指标
   │  │
   │  ├─ viz/                     # D3 复用层（所有演示共享）
   │  │  ├─ ResponsiveChart.svelte  # ResizeObserver + viewBox + a11y 包装
   │  │  ├─ Axis.svelte
   │  │  ├─ Legend.svelte
   │  │  ├─ Tooltip.svelte
   │  │  ├─ Slider.svelte         # 无障碍滑块（键盘 + aria-valuetext）
   │  │  └─ DataTableFallback.svelte
   │  │
   │  ├─ decor/                   # p5 装饰层
   │  │  ├─ P5Canvas.svelte       # 懒加载 p5、实例模式、IO 暂停、reduced-motion
   │  │  └─ sketches/
   │  │     ├─ gridField.ts       # 门户 Hero：呼吸的瑞士网格
   │  │     ├─ ribbon.ts          # 章节页头：低透明度流场丝带
   │  │     └─ rhythm.ts          # 5.3 节奏图案
   │  │
   │  └─ demos/
   │     ├─ registry.ts           # demoId → () => import('./l1/ScanPathLab.svelte')
   │     ├─ l1/ … l6/             # 32 个演示组件
   │     └─ gallery/              # 案例馆的三个大组件
   │
   ├─ content/
   │  ├─ config.ts                # Zod schema（章节、小节、三面板、理论字段）
   │  └─ lessons/
   │     ├─ zh/{01-perception … 06-robust}.mdx
   │     └─ en/{01-perception … 06-robust}.mdx
   │
   ├─ i18n/
   │  ├─ ui.ts                    # 站点外壳文案字典
   │  ├─ demos.ts                 # 演示内部文案字典（按 demoId 分组）
   │  ├─ locales.ts               # 语言清单、默认值、路径工具
   │  └─ index.ts                 # t() / useTranslations() / localizedPath()
   │
   ├─ lib/
   │  ├─ layout-metrics.ts        # 视觉重量、行长、CLS、焦点逆序（纯函数，可单测）
   │  ├─ gestalt.ts               # 感知分组（并查集）
   │  ├─ clamp-math.ts            # clamp 反解与折线求值
   │  ├─ scale.ts                 # 音阶 / 间距标尺生成
   │  ├─ color.ts                 # 对比度（APCA/WCAG）、读 CSS 变量
   │  ├─ d3-kit.ts                # 统一 d3 子模块再导出（控制体积的唯一入口）
   │  └─ stores/                  # locale, theme, reducedMotion, gridOverlay, progress
   │
   ├─ data/
   │  ├─ case-versions.ts         # v0..v6 元数据（改动说明、diff、对应章节）
   │  ├─ case-metrics.json        # 构建期实测基线
   │  ├─ decision-tree.json       # 布局决策树
   │  └─ checklist.json           # 30 条自检清单（含中英两份文案 key）
   │
   ├─ styles/
   │  ├─ tokens.css               # ⚑ 设计令牌：间距/音阶/色彩/圆角/层次/动效
   │  ├─ reset.css
   │  ├─ base.css
   │  ├─ layout.css               # 布局原语类（.stack .cluster .sidebar .switcher .grid-12）
   │  ├─ prose.css                # 讲解面板排版（65ch、垂直节奏）
   │  ├─ code.css                 # Shiki 主题桥接到令牌
   │  └─ themes.css               # 明暗主题
   │
   └─ tests/
      ├─ unit/                    # vitest：lib/* 纯函数
      ├─ component/               # @testing-library/svelte：Tabs 键盘、Slider a11y
      └─ e2e/                     # Playwright：路由、切语言保位、演示冒烟、axe 扫描
```

**结构原则**：

1. **按职责分层**，不按文件类型堆放：`chrome`（外壳）/ `lesson`（教学结构）/ `viz`（可视化复用）/ `demos`（业务演示）/ `decor`（装饰）。
2. **纯计算与渲染分离**：任何能写成纯函数的逻辑都进 `src/lib/`，演示组件只负责绑定与绘制。这是全站可测试性的来源。
3. **单一收敛点**：所有 d3 导入只经 `lib/d3-kit.ts`；所有间距/字号只经 `tokens.css`。两者都有脚本做门禁。
4. **内容与代码解耦**：新增一节 = 写两份 MDX + 一个 Svelte 组件 + 注册表一行，`scripts/new-section.mjs` 自动生成骨架。

---

## 7. 技术架构

### 7.1 孤岛策略（Islands）

Astro 默认零 JS。每个组件必须显式声明为什么需要 JS，以及何时加载：

| 组件 | 指令 | 理由 |
|---|---|---|
| `TopBar` / `Pager` / `Footer` / `LangSwitch` | 无（`.astro`） | 纯链接与静态标记，语言切换靠路由而非 JS |
| `ThemeToggle` | `client:load` | 需在首屏可用；主题本身由 `<head>` 内联脚本先行应用，避免闪白 |
| `ChapterNav` | `client:idle` | 滚动高亮非关键路径 |
| `SectionTabs` | `client:visible` | 面板切换；未进入视口不加载 |
| 32 个演示 | **由 `SectionTabs` 在首次切到「演示」面板时动态 `import()`** | 真正的按需加载，首屏不含任何 D3 |
| `P5Canvas` | `client:visible` + 内部再动态 `import('p5')` | p5 体积大，且 `prefers-reduced-motion` 时完全不加载 |
| `CaseProgress` | `client:visible` | 指标实测需要 iframe，滚到才做 |

**效果预期**：章节页首屏 JS ≈ 12KB（仅主题 + 目录 + Tabs 壳），打开一个演示再追加 25~60KB。

### 7.2 D3 使用规范

**唯一入口** `src/lib/d3-kit.ts`：

```ts
// 只从子包导入，禁止 `import * as d3 from 'd3'`
export { select, selectAll, pointer } from 'd3-selection';
export { scaleLinear, scaleBand, scaleOrdinal, scalePow, scaleSequential } from 'd3-scale';
export { axisBottom, axisLeft } from 'd3-axis';
export { line, area, curveMonotoneX, arc, lineRadial } from 'd3-shape';
export { extent, max, min, range, group, rollup, ticks } from 'd3-array';
export { transition } from 'd3-transition';   // 副作用：为 selection 挂 .transition()
export { drag } from 'd3-drag';
export { contourDensity } from 'd3-contour';  // 仅 1.1 用，单独动态 import
export { hierarchy, tree } from 'd3-hierarchy'; // 仅 3.1 / 案例馆用
```

**绘制约定**（全站统一，写进 `CONTRIBUTING.md`）：

1. 所有图表用 `viewBox` + `preserveAspectRatio`，宽度 100%，**绝不写死 px 宽**。
2. 尺寸由 `ResponsiveChart` 通过 ResizeObserver 下发（`{ width, height }` 作为 props），组件内 `$effect` 重绘。
3. 配色从 CSS 变量读（`color.ts` 的 `cssVar()`），因此明暗主题切换时图表自动跟随。
4. 数据绑定统一用 `.join(enter, update, exit)`，不用旧式 `.enter().append()`。
5. 动画一律走 `prefersReducedMotion` 守卫：为真时 `duration = 0`。
6. 每张图必须提供 `title` / `desc` props 与 `<DataTableFallback>`。

### 7.3 p5.js 使用边界

p5 在本站的定位是**页面美化**，不承担信息传达（信息传达一律归 D3）。这条界线必须清楚，否则会出现「用 p5 画图表」的架构混乱。

**三处用途**：

| 位置 | 草图 | 视觉 |
|---|---|---|
| 门户 Hero | `gridField.ts` | 一片呼吸的瑞士网格模块：12 列 × N 行的矩形随柏林噪声缓慢明暗与位移，鼠标靠近处网格吸附对齐——隐喻「秩序与呼吸」 |
| 章节页头 | `ribbon.ts` | 低透明度流场丝带，颜色取自当前章节的强调色令牌，高度 120px，不遮挡文字 |
| 5.3 演示 | `rhythm.ts` | 与 D3 前景卡片共享节奏参数的生成式图案 |

**硬性约束**（写进 `P5Canvas.svelte`，不可绕过）：

```
1. 实例模式（new p5(sketch, el)），禁止全局模式污染 window
2. 动态 import('p5')，且仅在 client:visible 触发后
3. prefers-reduced-motion: reduce  → 不加载 p5，渲染一张静态 SVG 兜底图
4. IntersectionObserver 离开视口 → noLoop()；进入 → loop()
5. document.visibilitychange 隐藏 → noLoop()
6. pixelDensity(min(devicePixelRatio, 2))、frameRate(24)
7. canvas 设 aria-hidden="true"、pointer-events: none（装饰层不抢焦点、不产生 CLS）
8. 容器固定 aspect-ratio，canvas 绝对定位 → 加载前后零布局偏移
```

> **自洽性**：第 6 章讲 CLS 和性能，如果自家装饰层造成抖动就是笑话。以上 8 条正是第 6 章理论的自我应用，会在 6.3/6.4 的讲解里明写「本站的 p5 层就是这么做的」。

### 7.4 构建与部署

- `output: 'static'`，`build.format: 'directory'`（URL 带尾斜杠，便于任意静态托管）
- `site` + `base` 可配置，支持部署到子路径（GitHub Pages 子目录场景）
- 资源：字体自托管 + `preload` + `size-adjust` 回退度量（服务于 6.3 的 CLS 论证）
- 输出 `sitemap.xml` 与 `hreflang` 交叉引用（中英互指）

---

## 8. 设计系统与令牌

`src/styles/tokens.css` 是全站唯一的数值来源。它本身就是第 2 章理论的实现，**讲解页会直接引用这个文件的真实内容**。

```css
:root {
  /* ── 间距标尺：8pt 基数，几何+线性混合（2.3 节） ── */
  --space-1: 0.25rem;  /*  4px */
  --space-2: 0.5rem;   /*  8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.5rem;   /* 24px */
  --space-6: 2rem;     /* 32px */
  --space-7: 3rem;     /* 48px */
  --space-8: 4rem;     /* 64px */
  --space-9: 6rem;     /* 96px */

  /* ── 排版音阶：1.25（大三度），流体化（2.5 + 4.2 节） ── */
  --step--1: clamp(0.80rem, 0.77rem + 0.15vw, 0.89rem);
  --step-0:  clamp(1.00rem, 0.95rem + 0.25vw, 1.13rem);
  --step-1:  clamp(1.25rem, 1.17rem + 0.40vw, 1.41rem);
  --step-2:  clamp(1.56rem, 1.43rem + 0.65vw, 1.76rem);
  --step-3:  clamp(1.95rem, 1.75rem + 1.00vw, 2.20rem);
  --step-4:  clamp(2.44rem, 2.14rem + 1.50vw, 2.75rem);

  /* ── 行长与节奏（1.4 + 2.4 节） ── */
  --measure: 65ch;
  --leading-body: 1.65;
  --leading-tight: 1.25;
  --rhythm: 1.5rem;     /* 基线单位 = 24px */

  /* ── 网格（2.1 节） ── */
  --grid-columns: 12;
  --grid-gutter: var(--space-5);
  --grid-margin: var(--space-6);
  --grid-max: 1400px;

  /* ── 层次（5.2 节）：明暗两套，暗色靠亮度而非阴影 ── */
  --surface-0: #f8fafc;  --surface-1: #ffffff;  --surface-2: #f1f5f9;
  --elevation-1: 0 1px 2px rgb(15 23 42 / 0.06);
  --elevation-2: 0 4px 12px rgb(15 23 42 / 0.08);

  /* ── 色彩：继承样例的 slate + blue，补足可达对比 ── */
  --ink-1: #0f172a; --ink-2: #334155; --ink-3: #64748b;
  --accent: #2563eb; --accent-ink: #1d4ed8; --accent-wash: #eff6ff;
  --warn-wash: #fffbeb; --warn-line: #f59e0b;

  /* ── 章节强调色（供 p5 丝带与目录高亮取用） ── */
  --ch1: #7c3aed; --ch2: #0891b2; --ch3: #059669;
  --ch4: #d97706; --ch5: #db2777; --ch6: #dc2626;

  --radius: 8px;
  --motion-fast: 150ms; --motion-base: 240ms;
}

@media (prefers-reduced-motion: reduce) {
  :root { --motion-fast: 0ms; --motion-base: 0ms; }
}
```

`src/styles/layout.css` 提供**布局原语类**，第 3、4 章讲什么，站点就用什么：

```css
.stack      > * + *  { margin-block-start: var(--flow, var(--space-4)); }
.cluster    { display: flex; flex-wrap: wrap; gap: var(--gap, var(--space-3)); align-items: center; }
.sidebar    { display: flex; flex-wrap: wrap; gap: var(--gap, var(--space-5)); }
.sidebar > :first-child { flex-basis: var(--side, 14rem); flex-grow: 1; }
.sidebar > :last-child  { flex-basis: 0; flex-grow: 999; min-inline-size: var(--min, 50%); }
.switcher   { display: flex; flex-wrap: wrap; gap: var(--gap, var(--space-4)); }
.switcher > * { flex-grow: 1; flex-basis: calc((var(--threshold, 30rem) - 100%) * 999); }
.grid-auto  { display: grid; gap: var(--gap, var(--space-5));
              grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--min, 18rem)), 1fr)); }
.grid-12    { display: grid; gap: var(--grid-gutter);
              grid-template-columns: repeat(var(--grid-columns), minmax(0, 1fr)); }
.prose      { max-inline-size: var(--measure); line-height: var(--leading-body); }
```

**自我约束门禁**：`scripts/check-token-usage.mjs` 扫描 `src/**/*.{css,svelte,astro}`，发现 `padding` / `margin` / `gap` / `font-size` 使用了不在令牌表里的字面量就报错（白名单：`0`、`1px`、`100%`、`auto`）。这既是工程纪律，也是第 2.3 节的活教材。

---

## 9. 可访问性与性能预算

### 9.1 预算表（CI 门禁，超标即失败）

| 指标 | 门槛 | 工具 |
|---|---|---|
| Lighthouse Performance | ≥ 95（移动端节流） | Lighthouse CI |
| Lighthouse Accessibility | = 100 | Lighthouse CI |
| LCP | < 2.0s | Lighthouse CI |
| **CLS** | **< 0.01** | Lighthouse CI（讲 CLS 的站不能有 CLS） |
| 首屏 JS（章节页） | < 20KB gzip | `scripts` 读 build 产物 |
| 单个演示追加 JS | < 60KB gzip | 同上 |
| axe 违规 | 0 critical / 0 serious | `@axe-core/playwright` |
| 320px 视口横向滚动 | 0 处 | Playwright 断言 `scrollWidth <= clientWidth` |

### 9.2 可访问性清单

- 语义标签：`<nav aria-label>` / `<main>` / `<article>` / `<aside>`；每页唯一 `<h1>`，标题层级不跳级
- 三 Tab 严格实现 WAI-ARIA Tabs 模式：`role="tablist"`、`aria-selected`、`aria-controls`、`←→` 切换、`Home/End` 跳首尾、面板 `tabindex="0"`
- 跳转链接 `Skip to content`；焦点样式用 `:focus-visible` + 2px 轮廓 + 2px 偏移，绝不 `outline: none`
- 所有滑块为原生 `<input type="range">`，带 `aria-valuetext`（播报「间距 16 像素」而非「16」）
- D3 图：`role="img"` + `aria-labelledby` 指向 `<title>` / `<desc>`；旁附视觉隐藏数据表
- 拖拽交互**全部提供键盘等价操作**（`AreaPainter` 支持方向键 + 空格刷格，`BalanceLab` 支持方向键移动）
- 色彩不作为唯一信息载体（分组同时用形状/标签）；正文对比度 ≥ 7:1，大字 ≥ 4.5:1
- `prefers-reduced-motion` 下：D3 过渡归零、p5 不加载、自动播放的演示改为手动步进

---

## 10. 国际化方案与一致性保障

### 10.1 三层文案

| 层 | 载体 | 例子 |
|---|---|---|
| 站点外壳 | `src/i18n/ui.ts`（TS 常量，带类型） | 导航、按钮、Tab 标签、页脚 |
| 教学正文 | `src/content/lessons/{zh,en}/*.mdx` | 讲解、关键代码说明、要点 |
| 演示内部 | `src/i18n/demos.ts`，按 `demoId` 分组，以 **props 传入组件** | 滑块标签、图例、坐标轴标题 |

**演示组件永远不直接读全局 locale**，而是接收 `t: DemoStrings['gestaltLab']`。这样组件是纯的、可单测、可在两种语言下快照对比。

```ts
// src/i18n/demos.ts
export const demoStrings = {
  gestaltLab: {
    zh: { gap: '间距', hue: '色相差', border: '边框', region: '共同区域',
          groups: (n: number) => `人眼会分成 ${n} 组` },
    en: { gap: 'Gap', hue: 'Hue shift', border: 'Border', region: 'Common region',
          groups: (n: number) => `Perceived as ${n} groups` },
  },
} as const satisfies DemoStringTable;
```

类型 `DemoStringTable` 强制 `zh` 与 `en` 的**键集合完全相同**——中英不一致在 `tsc` 阶段就红。这是「内容一致」的第一道机器保障。

### 10.2 内容集合 Schema

```ts
// src/content/config.ts
const section = z.object({
  id: z.string().regex(/^\d+\.\d+$/),        // "1.2"
  title: z.string(),
  subtitle: z.string(),
  theory: z.array(z.string()).min(1),        // 理论出处 key → /about 参考文献
  demo: z.string(),                          // registry 中的 demoId
  caseVersion: z.enum(['v0','v1','v2','v3','v4','v5','v6']).optional(),
});

const lessons = defineCollection({
  type: 'content',
  schema: z.object({
    slug: z.string(),                        // 语言无关，中英必须相同
    order: z.number().int().min(1).max(6),
    title: z.string(),
    subtitle: z.string(),
    accent: z.string(),                      // --ch1 … --ch6
    sections: z.array(section).min(4),
  }),
});
```

> `theory` 非空是 Zod 强制的——**这是「必须有理论知识，不能是纯语法」这条要求的机器化落地**：一个只讲语法的小节根本通不过构建。

### 10.3 一致性校验脚本

`scripts/check-i18n-parity.mjs`（CI 门禁）比对 `zh/` 与 `en/` 的每一对文件：

1. `slug`、`order`、`accent` 必须相等
2. `sections[]` 的 `id` 序列、`demo`、`caseVersion`、`theory` 集合必须逐项相等
3. MDX 正文中三面板的结构必须同构：`<Explain>` / `<Code>` / `<Demo>` 块数量相同；`<CodeBlock>` 的**代码内容必须字节级相同**（代码不翻译，只翻译说明文字）
4. 启发式：任一小节中英字数比落在 [0.4, 2.5] 之外 → 警告（中文比英文短属正常，过度偏离说明漏译或多译）
5. `ui.ts` / `demos.ts` 的键集合差集必须为空

输出一张差异表并以非零码退出，CI 直接红灯。

### 10.4 语言切换的状态保持

`LangSwitch` 是纯 `<a href>`，目标由 `localizedPath(currentPath, targetLocale)` 在构建期算出，并在客户端追加当前 `location.hash`（小节 + 面板）。切语言后**停留在同一小节的同一面板**，滚动位置由 hash 自然恢复。用户偏好写入 `localStorage`，仅用于**根路径 `/` 的首次跳转**，不干扰显式 URL。

---

## 11. 质量保障：测试、CI 与门禁

### 11.1 测试分层

| 层 | 工具 | 覆盖 |
|---|---|---|
| 单元 | vitest | `lib/*` 全部纯函数：视觉重量计算、格式塔分组、clamp 反解、音阶生成、对比度、CLS 聚合。目标覆盖率 ≥ 85% |
| 组件 | vitest + @testing-library/svelte | `SectionTabs` 的 ARIA 与键盘行为、`Slider` 的 `aria-valuetext`、`P5Canvas` 在 reduced-motion 下不加载 p5 |
| 端到端 | Playwright（chromium + webkit） | 路由可达、语言切换保位、32 个演示逐个打开并断言「有 SVG/Canvas 且无控制台错误」、交互一次后图形发生变化 |
| 可访问性 | @axe-core/playwright | 每个路由 + 每个演示面板展开后各扫一次 |
| 性能 | Lighthouse CI | 门户 / 章节页 / 案例馆三条路径，预算见 §9.1 |
| 视觉回归（可选） | Playwright 截图对比 | 门户 + 每章首屏，容差 0.2% |

**演示冒烟测试的统一契约**：每个演示组件根节点带 `data-demo-ready="true"`（渲染完成后置位），E2E 只需遍历注册表即可，新增演示自动纳入测试，无需改测试代码。

### 11.2 CI 流水线

```
push / PR
  ├─ install (pnpm, 缓存)
  ├─ lint      : eslint + prettier --check + stylelint
  ├─ typecheck : astro check + tsc --noEmit + svelte-check
  ├─ parity    : node scripts/check-i18n-parity.mjs      ← 中英一致性门禁
  ├─ tokens    : node scripts/check-token-usage.mjs      ← 设计令牌门禁
  ├─ unit      : vitest run --coverage
  ├─ build     : astro build  (+ 产物体积断言)
  ├─ e2e       : playwright test（含 axe）
  └─ lhci      : lighthouse ci autorun
```

### 11.3 开发规范

- 提交信息 Conventional Commits（`feat(l2): add GridBuilder demo`）
- 分支：`main` 受保护，功能分支 + PR，CI 全绿方可合并
- 每个演示组件必须同时提交：组件 + `lib/` 纯函数 + 单测 + 中英文案 + 注册表条目（`new-section.mjs` 生成骨架，避免遗漏）
- ADR：任何影响架构的决定写进 `docs/adr/`，编号递增，不可删改只可 supersede

---

## 12. 关键组件契约与代码骨架

### 12.1 `SectionTabs.svelte`（全站最核心的组件）

```svelte
<script lang="ts">
  import { demoRegistry } from '@/components/demos/registry';
  let { sectionId, demoId, labels, initial = 'explain' } = $props<{
    sectionId: string;
    demoId: string;
    labels: { explain: string; code: string; demo: string };
    initial?: 'explain' | 'code' | 'demo';
  }>();

  let active = $state(initial);
  let DemoComponent = $state<any>(null);
  let loading = $state(false);

  // 演示面板首次激活时才真正下载组件代码
  $effect(() => {
    if (active === 'demo' && !DemoComponent && !loading) {
      loading = true;
      demoRegistry[demoId]()
        .then((m) => (DemoComponent = m.default))
        .finally(() => (loading = false));
    }
  });

  // URL 同步：#1.2--demo  → 可深链、可分享、切语言后保位
  $effect(() => {
    history.replaceState(null, '', `#${sectionId}--${active}`);
  });

  function onKeydown(e: KeyboardEvent) { /* ← → Home End 的标准 Tabs 键盘模式 */ }
</script>

<div class="tabs" role="tablist" aria-label={labels.explain} onkeydown={onKeydown}>
  {#each ['explain', 'code', 'demo'] as key}
    <button role="tab" id={`${sectionId}-tab-${key}`}
            aria-selected={active === key}
            aria-controls={`${sectionId}-panel-${key}`}
            tabindex={active === key ? 0 : -1}
            class:active={active === key}
            onclick={() => (active = key)}>{labels[key]}</button>
  {/each}
</div>

{#each ['explain', 'code', 'demo'] as key}
  <div role="tabpanel" id={`${sectionId}-panel-${key}`}
       aria-labelledby={`${sectionId}-tab-${key}`}
       tabindex="0" hidden={active !== key}>
    {#if key === 'demo'}
      {#if loading}<p class="demo-hint">…</p>{/if}
      {#if DemoComponent}<DemoComponent />{/if}
    {:else}
      <slot name={key} />
    {/if}
  </div>
{/each}
```

> 注意：`hidden` 而非 `display:none` 的切换 + 三面板同时存在于 DOM，是为了让浏览器内查找（Ctrl+F）与读屏器的「全文」模式仍能触达讲解与代码内容；演示面板则靠动态 import 保证不付出代价。

### 12.2 `ResponsiveChart.svelte`（D3 统一容器）

```svelte
<script lang="ts">
  let { title, desc, ratio = 16 / 9, children } = $props();
  let el: HTMLDivElement;
  let width = $state(0), height = $state(0);
  $effect(() => {
    const ro = new ResizeObserver(([e]) => {
      width = e.contentRect.width;
      height = width / ratio;
    });
    ro.observe(el); return () => ro.disconnect();
  });
</script>

<figure bind:this={el} class="chart" style:aspect-ratio={ratio}>
  <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="t d">
    <title id="t">{title}</title><desc id="d">{desc}</desc>
    {@render children?.({ width, height })}
  </svg>
</figure>
```

固定 `aspect-ratio` 让图表在数据到达前就占好位——**这本身就是 6.3 节 CLS 教学的实践**。

### 12.3 `registry.ts`（演示懒加载）

```ts
export const demoRegistry: Record<string, () => Promise<{ default: Component }>> = {
  'scan-path':   () => import('./l1/ScanPathLab.svelte'),
  'gestalt':     () => import('./l1/GestaltLab.svelte'),
  // … 32 条
};
export type DemoId = keyof typeof demoRegistry;
```

构建时 Astro/Vite 为每条生成独立 chunk；`content/config.ts` 的 `demo` 字段类型约束为 `DemoId`，**写错演示 id 在构建期就报错**。

### 12.4 `layout-metrics.ts`（纯函数示例，可单测）

```ts
/** 视觉重量：面积 × 对比度 × 字重权重 × 位置权重（古腾堡四象限） */
export function visualWeight(el: MetricInput): number {
  const area = Math.sqrt(el.width * el.height);              // 开方抑制大块主导
  const contrast = contrastRatio(el.color, el.background);   // 1..21
  const weight = 0.6 + (el.fontWeight / 400) * 0.4;
  const pos = gutenbergWeight(el.cx / el.vw, el.cy / el.vh); // 0.6..1.0
  return area * Math.log2(contrast + 1) * weight * pos;
}

/** 层级单调性得分：视觉重量序 与 语义重要度序 的 Spearman 相关，∈[-1,1] */
export function hierarchyScore(items: MetricInput[]): number { /* … */ }
```

所有这类函数都有对应的 `tests/unit/layout-metrics.test.ts`，用固定夹具断言——**这是「演示是真算的，不是画的」这一承诺的证据**。

---

## 13. 开发计划与里程碑

| 里程碑 | 交付物 | 估时 | 完成判据 |
|---|---|---|---|
| **M0 竖切** | Astro+Svelte+TS 脚手架、令牌、三个布局、TopBar/Nav/Tabs、i18n 路由、一个假章节跑通 | 1.0 d | `/zh/lessons/perception/` 与 `/en/…` 可访问，Tab 可切、可深链、语言切换保位 |
| **M1 内容骨架** | 内容集合 + Zod + 6 章 MDX 骨架（中文）+ CodeBlock/KeyPoint/Note/CaseProgress + 案例 v0~v6 静态页 | 1.5 d | 6 章可导航，32 节标题与三面板占位齐全 |
| **M2 演示批次 A** | L1（5）+ L2（6）共 11 个演示 + 对应 `lib/` 纯函数与单测 | 2.5 d | 11 个演示在两种语言下均可交互，单测通过 |
| **M3 演示批次 B** | L3（6）+ L4（5）共 11 个演示 | 2.5 d | 同上 |
| **M4 演示批次 C + 装饰** | L5（5）+ L6（5）共 10 个演示 + p5 三处装饰 + 明暗主题 | 2.5 d | 含 CLS/Thrash 实测类演示；reduced-motion 全链路验证 |
| **M5 案例馆** | 时间轴、Before/After、指标小多图、决策树、自检清单、工具箱页 | 1.5 d | 案例 v0→v6 可播放；`measure-case-metrics.mjs` 产出基线 |
| **M6 英文对齐** | 全部 en MDX + demos.ts 英文 + parity 脚本接入 CI | 1.5 d | `check-i18n-parity` 绿灯 |
| **M7 打磨与门禁** | a11y 修复、性能调优、Lighthouse/axe 达标、README/ADR、部署 | 1.5 d | §9.1 全部指标达标，CI 全绿 |

**合计约 14.5 个工作日**（单人）。

**并行建议**：M2/M3/M4 的演示之间彼此独立，若多人协作可按章分工；`lib/` 纯函数先行（有单测保护），组件后接。

**降级预案**（若工期压缩）：
- P0（必交）：M0 + M1 + L1/L2/L3 演示 + 中英对齐 + 案例 v0→v2 —— 已满足全部硬性要求
- P1：L4/L5/L6 演示
- P2：案例馆、工具箱、决策树、视觉回归测试

---

## 14. 参考文献（讲解面板的 `theory` 字段指向此表）

**感知与认知**
1. Nielsen, J. (2006). *F-Shaped Pattern For Reading Web Content*. NN/g.
2. Wertheimer, M. (1923). *Laws of Organization in Perceptual Forms*.（格式塔）
3. Ware, C. (2012). *Information Visualization: Perception for Design*, 3rd ed.
4. Arnold, E. C. *The Gutenberg Diagram*（阅读重力与四象限）

**网格与排版**
5. Müller-Brockmann, J. (1981). *Grid Systems in Graphic Design*.
6. Bringhurst, R. (2004). *The Elements of Typographic Style*.（行长 45–75）
7. Tinker, M. A. (1963). *Legibility of Print*.
8. Rutter, R. (2017). *Web Typography*.

**Web 布局工程**
9. Simmons, J. *Intrinsic Web Design*（内在式设计）
10. Bell, H. & Andrew, A. *Every Layout*（Stack / Sidebar / Switcher / Cover 原语）
11. CSS Box Alignment Module Level 3, W3C.
12. CSS Grid Layout Module Level 2（subgrid）, W3C.
13. CSS Containment Module Level 3（`content-visibility`）, W3C.

**可达性与性能**
14. WCAG 2.2 — 1.3.2 有意义的序列、1.4.10 重排、2.5.8 目标尺寸最小值.
15. Web Vitals: *Cumulative Layout Shift*, web.dev.
16. Irish, P. *What forces layout / reflow*（同步布局清单）.

**信息设计**
17. Tufte, E. (1983). *The Visual Display of Quantitative Information*.（data-ink → content-chrome）
18. Lidwell, W. et al. (2010). *Universal Principles of Design*.

> `/about` 页会渲染这张表，并为每条标注「在第几节被引用」——反向索引，方便教师备课。

---

## 15. 风险、取舍与替代方案

| 风险 | 影响 | 应对 |
|---|---|---|
| `subgrid` / 容器查询在旧浏览器不支持 | 3.4 / 4.3 演示失效 | 演示内置特性检测（`CSS.supports`），不支持时展示**降级对照**——这本身就是教学内容的一部分，把风险转成素材 |
| iframe 内实测 CLS 受浏览器差异影响 | 案例指标不稳定 | 构建期基线 JSON 兜底，UI 明确标注「实测/基线」（§3.2） |
| p5 体积（~900KB 未压缩） | 拖慢首屏 | 仅 3 处使用、`client:visible` + 动态 import、reduced-motion 下完全不加载；纳入体积门禁 |
| 32 个演示工作量大 | 工期风险 | `lib/` 纯函数 + `ResponsiveChart` + `Slider` 三件复用设施先行，单个演示均摊降到 ~1.5 小时；并提供 P0/P1/P2 降级预案（§13） |
| 中英内容漂移 | 违反硬性要求 | 三道机器门禁：TS 类型（demos）、parity 脚本（MDX）、E2E 双语冒烟 |
| 演示交互在触屏上不可用（拖拽） | 移动端体验 | 所有拖拽同时绑定 Pointer Events；并提供滑块/按钮等价操作（同时满足键盘可达性） |
| Svelte 5 Runes 与部分生态库的兼容 | 返工 | 演示只依赖 D3（框架无关）与原生 DOM，不引入 Svelte 生态 UI 库 |

**被否决的替代方案**（记录在 ADR 中）：

- **沿用样例的双 DOM i18n**：DOM 翻倍、演示内文案无解、无法机器校验一致性 → 否决（ADR-0002）
- **用 Nuxt/Next 等 SPA 框架**：教学站是内容站，SSG + 孤岛的首屏与 SEO 明显更优，且题目指定 Astro → 否决
- **用 p5 承担图表绘制**：p5 是即时模式画布，无 DOM 语义、不可访问、不可测；D3 生成 SVG 可被读屏器与测试触达 → 明确分工（ADR-0004）
- **演示写成 iframe 嵌入的独立 HTML**（样例的 `demo/` 目录做法）：隔离性好但状态无法与主题/语言联动、体积重复 → 仅案例版本页保留 iframe（那里恰恰需要隔离）

---

## 16. 验收自检表

提交前逐条核对：

**硬性要求**
- [ ] 纯前端；`npm run build` 产物可直接静态托管，无任何后端依赖
- [ ] 技术栈为 Astro + Svelte，且 Svelte 承担全部交互
- [ ] 门户 + 章节页结构与样例同构（顶部章节栏 / 左侧目录 / 三 Tab / 翻页器）
- [ ] 每个小节三面板齐全：讲解、关键代码、演示
- [ ] 32 个演示全部**可交互**（滑块/拖拽/切换/键盘），无静态占位
- [ ] 中英双语，路由级切换，`check-i18n-parity` 绿灯
- [ ] 讲解含理论（出处 + 为什么 + 何时失效），非语法手册
- [ ] 所有图表由 D3 绘制；p5 用于页面美化且不越界
- [ ] 目录结构分层清晰，含 ADR / 测试 / CI / 脚手架脚本

**加分项**
- [ ] 单一贯穿案例 v0→v6，每章推进一版，指标可量化
- [ ] 案例馆可播放完整演进与 Before/After 对比
- [ ] 布局决策树与 30 条自检清单可交互
- [ ] 网站自身遵守所讲规则，并提供 `G` 键网格叠加供读者验证
- [ ] 明暗主题、reduced-motion、键盘全可达
- [ ] Lighthouse 性能/可达性达标，CLS < 0.01

---

## 17. 下一步

评审本方案后，建议按 **M0 竖切** 启动：先把「一个假章节」从路由、三 Tab、双语、深链到一个真实演示完整跑通，验证架构假设，再批量灌内容。竖切跑通即锁定接口，后续 32 个演示就是重复劳动，可并行。

需要我现在开始搭 M0 脚手架，请直接说。
