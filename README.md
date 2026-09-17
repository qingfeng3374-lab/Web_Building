# 页面布局之道 · The Craft of Page Layout

> 一门用**一个贯穿案例**串起来的交互式页面布局课程。
> 纯前端静态站点，中英双语，6 章 32 个知识小节，32 个真实计算的交互演示。

![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)
![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![D3](https://img.shields.io/badge/D3.js-模块化引入-F9A03C?logo=d3dotjs&logoColor=white)
![p5](https://img.shields.io/badge/p5.js-生成式装饰-ED225D)
![tests](https://img.shields.io/badge/tests-101%20passing-3FB950)

```
Astro 7 + Svelte 5 · D3.js（按子包引入）· p5.js（生成式装饰）· TypeScript · Zod
纯静态输出，无后端，21 个页面
```

---

## 这是什么

大多数「CSS 布局教程」讲的是语法：`display: grid` 怎么写、`flex-basis` 是什么。
这门课讲的是**判断**：这块内容该用哪个引擎、这个断点的依据是什么、这个装饰能不能删。

为此它做了三件在教程里不常见的事：

1. **一条贯穿案例，而且是「建造」不是「批判」**。全课程只用一个页面：NeoCampus 新生数据看板。它的起点 `stage0` 不是一个写坏了的页面，而是一个**还没有布局的页面** —— 真实数据、语义正确的 HTML、零布局 CSS。之后每一章给它加一层能力，六层之后成为可以交付的看板。同一份 DOM、同一份数据，**只有 CSS 在生长**。
2. **可测量的结论**。六项指标（行长 / 分组比 / 取值种类 / 层级分 / 可达性问题数 / CLS）贯穿 stage0→stage6，全部由 `src/lib/` 里的纯函数计算并被单元测试覆盖。课程的编排检验只有一条：**每一层都必须能推动一项指标** —— 推不动的层，要么不该存在，要么讲错了地方。
3. **站点即范例**。本站遵守它讲授的每一条规则 —— 12 列网格、8pt 间距标尺、1.25 排版音阶、24px 基线节奏、逻辑属性、容器查询、零 `order` 重排。**任意页面按 `G` 可以把网格叠加上去自行验证，按 `B` 叠加基线。**

---

## 快速开始

需要 Node ≥ 20.11。

```bash
git clone git@github.com:qingfeng3374-lab/Web_Building.git
cd Web_Building

npm install
npm run dev          # → http://localhost:4321
```

其余命令：

```bash
npm run build        # 产物在 dist/，可直接静态托管
npm run preview      # 本地预览打包产物
npm run verify       # 四道门禁：i18n 一致性 + 设计令牌 + 类型检查 + 测试 + 构建
```

开发服务器跑在后台，用 `npx astro dev status | logs | stop` 管理。
它监听 `0.0.0.0`，所以同一局域网的手机可以直接访问启动时打印的 Network 地址 ——
一门讲响应式布局的课，本来就该在真机上验证。

部署到子目录（如 GitHub Pages 的 `/Web_Building/`）：

```bash
SITE_BASE=/Web_Building/ SITE_URL=https://qingfeng3374-lab.github.io npm run build
```

---

## 内容结构

| 层 | 章节 | 加上了什么 | 产出 | 负责的指标 |
|---|---|---|---|---|
| 1 | 内容层 | 常规流与包含块、内在尺寸、行长与密度 | `stage1` | 行长 138 → 66 ch |
| 2 | 间距层 | 格式塔分组、8pt 间距标尺、垂直节奏 | `stage2` | 分组比 1.0 → 2.0 |
| 3 | 尺度层 | 12 列网格、列宽公式、1.25 排版音阶 | `stage3` | 取值种类 3 → 17 |
| 4 | 结构层 | Flex/Grid 分工、`areas` 骨架、Box Alignment、DOM 顺序 | `stage4` | 可达性问题 6 → 2 |
| 5 | 视觉层 | 扫视路径、视觉重量与层级、平衡、深度、克制 | `stage5` | 层级分 0.34 → 0.84 |
| 6 | 适应层 | 内容断点、`clamp()` 的数学、容器查询、CLS 与性能 | `stage6` | CLS 0.31 → 0.004 |

顺序本身就是内容：**跳过任何一层，后面的层都会被迫去代偿它** —— 视觉层用边框代偿缺失的间距，适应层用媒体查询代偿不够弹性的结构。

另有**案例馆**（建造时间轴、阶段对比、六层与指标归属表、布局决策树、39 条自检清单）与**参考文献页**（20 条文献 + 反向索引到引用它的小节）。

每个小节都是「📖 讲解 / ⌨️ 关键代码 / ▶️ 演示」三面板：

- **讲解**必含「理论出处 + 为什么有效 + 何时失效」，并落到案例当前阶段的具体改动上
- **关键代码**每段都配「这段解决什么问题」「关键点在哪」「坑在哪」，反例与正例并排
- **演示**全部是真实计算的 D3 图表：拖滑块、改参数，指标当场重算。没有一张静态截图

---

## 目录结构

```
src/
├─ content/              内容层：带类型的结构化模块（见 ADR-0006）
│  ├─ types.ts           Block / Section / Lesson 的类型定义
│  ├─ schema.ts          Zod 校验 —— 构建期强制「必须有理论、三面板齐全」
│  ├─ references.ts      20 条参考文献 + 反向索引
│  ├─ case.ts            贯穿案例：7 个建造阶段、6 项指标、每项指标的归属层
│  └─ lessons/ch1..ch6   六层内容（content/spacing/scale/structure/visual/adaptive）
│
├─ lib/                  纯函数层：不碰 DOM，可被 vitest 覆盖
│  ├─ layout-metrics.ts  视觉重量、层级分、行长、CLS、焦点逆序、视觉重心
│  ├─ grid.ts            列宽公式、内容断点、间距标尺、排版音阶、基线命中率
│  ├─ fluid.ts           clamp() 反解、算法布局原语的阈值
│  ├─ color.ts           对比度、感知亮度、层次可辨识度
│  ├─ d3-kit.ts          D3 的唯一入口（按子包再导出，见 ADR-0003）
│  └─ inline.ts          极小的行内标记渲染器（先转义再解析）
│
├─ components/
│  ├─ chrome/            站点外壳：悬浮玻璃药丸顶栏、章节导航、主题、网格叠加
│  ├─ portal/            门户：六层展台（LayerBrowser）、Hero 水波纹（HeroWaves）
│  ├─ lesson/            教学结构：三 Tab、代码块、演示外壳
│  ├─ viz/               D3 复用层：ResponsiveChart、Slider
│  ├─ decor/             p5 层：layoutGen / layerBuild 生成式展品（8 条硬约束，见 ADR-0004）
│  ├─ case/              贯穿案例：Dashboard(stage0..stage6)、对比器、章首弹窗、章末推进
│  ├─ gallery/           案例馆：时间轴、决策树、自检清单
│  └─ demos/             32 个演示，registry.ts 懒加载
│
├─ styles/               tokens.css 是全站唯一的数值来源
├─ i18n/                 路由级 i18n（见 ADR-0002）
├─ data/                 决策树、自检清单
└─ tests/unit/           101 个单元测试

scripts/
├─ check-i18n-parity.mjs   中英一致性门禁
└─ check-token-usage.mjs   设计令牌门禁

docs/
├─ DESIGN.md               设计与实施方案
└─ adr/                    架构决策记录
```

---

## 工程约束（都是可执行的，不是文档里的口号）

| 约束 | 由什么强制 | 失败后果 |
|---|---|---|
| 每个小节必须有理论出处 | `content/schema.ts` 的 Zod `theory.min(1)` + 引用有效性校验 | 构建失败 |
| 三面板必须齐全 | Zod `explain.min(3)` / `code.min(1)` / `demo` 必填 | 构建失败 |
| 演示 id 必须存在 | `check-i18n-parity.mjs` 比对注册表 | CI 失败 |
| 中英不得漏译 | 类型层面（`{zh, en}`）+ parity 脚本 | 编译 / CI 失败 |
| 间距字号必须来自令牌 | `check-token-usage.mjs` | CI 失败 |
| 布局度量函数必须可测 | vitest，覆盖率门槛 80% | CI 失败 |
| 首屏不含 D3 / p5 | 演示注册表全部动态 `import()` | 见下方产物体积 |

### 产物体积（`npm run build` 实测）

| 文件 | 原始 | 说明 |
|---|---|---|
| `SectionTabs` | 1.6 KB | 章节页首屏唯一的教学交互 |
| `P5Canvas` | 1.7 KB | p5 宿主本身；p5 库是另一个块 |
| `d3-kit`（共享块） | 34.9 KB | 全部 D3 子模块的并集，打开演示时才加载 |
| 单个演示 | 5–20 KB | 每个演示独立分包 |
| `p5.min` | 1022 KB | 只在门户与 §5.5 加载；`prefers-reduced-motion` 下完全不加载 |

CI 里有一条断言守着这件事：`SectionTabs` 超过 8KB 就构建失败 ——
那通常意味着有人不小心把 D3 打进了首屏块。

---

## 可访问性

- 三 Tab 严格实现 WAI-ARIA Tabs 模式（`←`/`→` 循环、`Home`/`End` 跳首尾）
- 所有拖拽交互都有键盘等价操作（`AreaPainter` 方向键 + 空格，`BalanceLab` 方向键）
- 每张 D3 图都有 `role="img"` + `<title>`/`<desc>`，并附视觉隐藏的数据表
- 全站逻辑属性（`inline-size` / `margin-block`），为 RTL 与竖排留了门
- `prefers-reduced-motion` 下：D3 过渡归零、p5 不加载、自动播放改手动
- 无 JS 时三个面板全部可读（渐进增强）

---

## 扩展内容

**加一节**只改一个文件：在对应 `src/content/lessons/chN-*.ts` 的 `sections` 里加一项
（中英相邻写），再到 `src/components/demos/registry.ts` 注册演示 id。
侧栏目录、章首弹窗的「本章路线」、门户卡片的小节数、案例馆的交叉引用全部自动跟随。

**加一章**要动六处，[docs/ADDING-A-CHAPTER.md](docs/ADDING-A-CHAPTER.md) 里逐条列清了。

改完跑 `npm run verify`：Zod 与两个门禁脚本会告诉你漏了什么 —— 不需要记规范。

---

## 文档

- [docs/DESIGN.md](docs/DESIGN.md) — 完整的设计与实施方案
- [docs/ADDING-A-CHAPTER.md](docs/ADDING-A-CHAPTER.md) — 新增一章 / 一节要改哪些地方，以及目录的分层约定
- [docs/adr/](docs/adr/) — 架构决策记录（为什么是 Astro+Svelte、为什么放弃双 DOM i18n、为什么不整包引 d3、p5 的边界在哪、演示为什么懒加载、内容为什么不用 MDX、主线为什么从「修病灶」改成「加层」）

---

## 说明

- 案例中的 **NeoCampus 数据为教学用途虚构**，不代表任何真实院校的招生情况。
- 课程结论的出处都列在站内的「关于与参考」页（20 条文献 + 反向索引到引用它的小节）。
  文献本身的版权归原作者所有，本仓库只引用其结论并注明来源。
- 项目启动时用于对照信息组织方式的那份参考样例网页（第三方站点存档）
  **不包含在本仓库中**，见 `.gitignore` 的说明。
