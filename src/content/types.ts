import type { L } from '@/i18n/locales';

/**
 * 内容模型
 *
 * 设计决策（ADR-0006）：用「带类型的结构化 TS 模块」承载教学内容，
 * 而不是 MDX。理由：
 *   1. 每个面向用户的字符串都是 `L = {zh, en}` —— 中英在同一行相邻书写，
 *      **结构一致性由类型系统保证**，不可能出现「中文有三段、英文只有两段」。
 *   2. 渲染统一走 <Blocks/>，全站排版节奏一致，不会因为某篇 MDX 手写了
 *      奇怪的标记而破相（讲布局的站点尤其不能容忍这个）。
 *   3. demo id、理论引用 id 都是字面量联合类型，**写错在构建期就报错**。
 * 代价：作者不能随手写任意 HTML。这正是我们想要的约束。
 */

/* ── 行内标记 ────────────────────────────────────────────────────────────
   正文文本支持极小的行内语法（renderInline() 负责转义与解析）：
     **粗体**      → <strong>
     `代码`        → <code>
     *强调*        → <em>（渲染为高亮底色）
     [文本](链接)  → <a>
   不支持任何裸 HTML —— 内容与标记严格分离。                            */

export type Block =
  /** 段落 */
  | { t: 'p'; text: L }
  /** 小标题（渲染为 h3，带章节色竖线） */
  | { t: 'h'; text: L }
  /** 更小的标题（h4） */
  | { t: 'h4'; text: L }
  /** 无序列表 */
  | { t: 'ul'; items: L[] }
  /** 有序列表 */
  | { t: 'ol'; items: L[] }
  /** 课堂要点（黄色） */
  | { t: 'note'; text: L }
  /** 关键点解释（蓝色） */
  | { t: 'key'; text: L }
  /** 常见坑（红色） */
  | { t: 'pitfall'; text: L }
  /** 理论引文 */
  | { t: 'quote'; text: L; cite: L }
  /** 表格 */
  | { t: 'table'; head: L[]; rows: L[][] }
  /** 正误对照 */
  | { t: 'versus'; good: { title: L; text: L }; bad: { title: L; text: L } }
  /** 关键代码：purpose = 这段代码要解决什么；key = 关键点解释；pitfall = 坑 */
  | {
      t: 'code';
      lang: 'css' | 'html' | 'js' | 'ts' | 'svelte' | 'bash' | 'text';
      file?: L;
      purpose?: L;
      code: string;
      highlight?: number[];
      key?: L;
      pitfall?: L;
    };

/**
 * 案例的建造阶段。
 * stage0 是起点（只有内容、没有布局），之后每一章加一层能力。
 * 刻意不叫 v0..v6 —— 「版本」暗示修补，「阶段」暗示生长。
 */
export type CaseStage = 'stage0' | 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'stage5' | 'stage6';

export interface Section {
  /** 形如 "1.2"，同时用于锚点 #s-1-2 */
  id: string;
  title: L;
  subtitle: L;
  /** 引用的理论条目 id（见 src/content/references.ts），强制非空 —— 这是
   *  「必须有理论、不能是纯语法」这条硬性要求的机器化落地 */
  theory: string[];
  /** 讲解面板 */
  explain: Block[];
  /** 关键代码面板（至少一个 code 块） */
  code: Block[];
  /** 演示面板 */
  demo: { id: string; hint: L };
  /** 本节把案例推进到哪一阶段（仅案例小节有） */
  caseStage?: CaseStage;
}

export interface Lesson {
  /** 语言无关的 slug，中英共用，保证切语言时停在同一页 */
  slug: string;
  /** 章节序号，从 1 开始。
   *  曾经写成 `1|2|3|4|5|6` 的联合类型，本意是「保证有对应的 --chN 令牌」。
   *  但章节色其实由下面的 `accentVar` 显式给出，order 并不承担那个职责 ——
   *  于是那个联合类型唯一的效果，就是**加第七章时必须先改类型定义**。
   *  现在放宽为 number，由 schema.ts 校验它是正整数且全站不重复。 */
  order: number;
  /** 这一章在「布局的六层」里的层名 */
  layer: L;
  /** 本层给页面加上了什么能力（门户层叠图用） */
  adds: L;
  /** CSS 变量名，如 '--ch1' */
  accentVar: string;
  title: L;
  /** 章节副标题 —— 一句话点题，出现在页头与门户卡片 */
  subtitle: L;
  /** 门户卡片上的导读：这一章解决什么问题 */
  summary: L;
  sections: Section[];
}
