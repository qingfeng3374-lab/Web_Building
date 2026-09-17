# 新增一章（或一节）要改哪些地方

这份清单存在的理由：项目里「一共有几章」这件事，天然会渗进好几个不相干的文件。
下面把它们一次列清，并标出**哪些已经不需要你管了**（因为已经改成从数据派生）。

---

## 目录结构与它的分层

```
src/
├─ pages/            路由。只做「取数据 → 交给布局」，不含业务逻辑
├─ layouts/          页壳。BaseLayout（全站）+ LessonLayout（章节页）
├─ content/          ← 内容层：纯数据，不碰 DOM
│  ├─ types.ts         Block / Section / Lesson 的形状
│  ├─ schema.ts        Zod 校验，构建第一秒执行
│  ├─ index.ts         注册表 + 序号/slug 唯一性自检
│  ├─ case.ts          贯穿案例的阶段与指标
│  ├─ references.ts    参考文献
│  └─ lessons/         每章一个文件
├─ lib/              ← 纯函数层：不碰 DOM，可被 vitest 覆盖
├─ components/       ← 视图层，按**职责**分而不是按页面分
│  ├─ chrome/          站点外壳（顶栏、侧栏目录、主题、网格叠加）
│  ├─ lesson/          教学结构（三 Tab、代码块、演示外壳）
│  ├─ case/            贯穿案例（看板、对比器、章首弹窗）
│  ├─ demos/lN/        演示，按层分目录
│  ├─ gallery/         案例馆
│  ├─ portal/          门户
│  ├─ viz/             D3 复用层
│  └─ decor/           p5 装饰层
├─ data/             决策树、自检清单（与课程正文平行的「工具」）
├─ i18n/             路由级 i18n
├─ styles/           tokens.css 是全站唯一的数值来源
└─ tests/unit/       只测 lib/ 的纯函数
```

**依赖方向是单向的**：`pages → layouts → components → (content | lib | i18n)`。
`content` 和 `lib` 互不依赖，也都不依赖 `components`。
这条约束的价值在于：改视图永远不会弄坏内容校验，改内容永远不会弄坏单元测试。

---

## 加一整章

### 1. 写内容（唯一真正花时间的一步）

新建 `src/content/lessons/ch7-<slug>.ts`，导出一个 `Lesson`。
照抄任意一章的骨架即可 —— `types.ts` 的类型会逼着你把该填的都填上。

### 2. 注册

`src/content/index.ts`：加一行 import，加进 `lessons` 数组。
数组顺序不重要 —— 注册表会按 `order` 自动排序，并校验序号与 slug 不重复。

### 3. 章节色

`src/styles/tokens.css`：加 `--ch7`（**亮色与暗色两处都要加**）。
然后在章节文件里写 `accentVar: '--ch7'`。

> 这是唯一还需要手工同步的地方。没有把它自动化，是因为颜色要人挑 ——
> 自动生成的第七个色相大概率和前六个打架。

### 4. 演示

- 新建 `src/components/demos/l7/`，放该章的演示组件
- `src/components/demos/registry.ts`：每个演示加一行 `'demo-id': () => import('./l7/Xxx.svelte')`

演示 id 写错不会变成运行时空白 —— `check-i18n-parity.mjs` 会在 CI 里挡住。

### 5. 案例阶段（如果这一章要推进贯穿案例）

`src/content/case.ts`：
- `CaseStage` 类型加 `'stage7'`（在 `types.ts`）
- `stages` 数组加一项
- 若这一章负责一项新指标，在 `metricSpecs` 里加，并写明 `ownedBy: 7`
- `Dashboard.svelte` 的 CSS 追加 `[data-s='7']` 及以上的规则（**只能加，不能改写更早的层**）

### 6. 自检清单（可选）

`src/data/checklist.ts`：加若干条 `group: 7` 的条目。
分组名**不用管** —— 它从 `lessons` 派生。

---

## 已经不需要你管的（曾经需要）

| 曾经的硬编码 | 现在 |
|---|---|
| `Lesson.order: 1\|2\|3\|4\|5\|6` | 放宽为 `number`，Zod 校验正整数 |
| `CheckItem.group: 1\|2\|3\|4\|5\|6` | 同上 |
| `GROUP_NAMES` 手抄一份层名 | 由案例馆页面从 `lessons` 派生 |
| `CaseStage` 拼 `var(--ch${lesson})` | 改用 `Lesson.accentVar` |
| 顶栏 `ZH_NUM` 数组越界 | 已扩到「十」，且越界退回阿拉伯数字 |

最后一条值得说明：原先写的是 `ZH_NUM[n]`，加到第七章会静默渲染成
**「第undefined章」**。数组越界在 JS 里不抛错，这类 bug 只能靠人眼在页面上撞见。

---

## 加一节（不加章）

只改一个文件：在对应的 `chN-*.ts` 的 `sections` 数组里加一项，
再按上面第 4 步注册演示。**其余全部自动跟随** ——
侧栏目录、章首弹窗的「本章路线」、门户卡片上的小节数、
案例馆的交叉引用，都是从 `sections` 派生的。

---

## 章节文件已经偏大

六章正文现在是 4500 行，单章 600–1000 行。再往上加内容之前，建议
把单章拆成 `chN/index.ts` + `chN/s1.ts`…：`Lesson` 只是个对象，
`sections` 从别处 import 拼进来即可，不需要改任何类型或渲染逻辑。
现在还没拆，是因为 600–1000 行尚在可读范围内，提前拆只会增加跳转成本。

---

## 改完怎么验

```bash
npm run verify
```

四道门禁会依次挡住：中英漏译、设计令牌字面量、类型错误、单元测试，
最后 Zod 在构建的第一秒校验内容完整性（缺理论 / 缺代码 / 缺演示都会失败）。
