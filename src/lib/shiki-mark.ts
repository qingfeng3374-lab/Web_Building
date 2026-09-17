/**
 * 给指定行号加上 `highlighted` 类的 Shiki transformer。
 *
 * 为什么需要它：内容模型里的 `highlight: number[]` 是一个**承诺** ——
 * 「这几行是关键点」。Astro 的 <Code> 组件本身没有行高亮参数，
 * 如果不实现这个 transformer，那个字段就只是一个没人兑现的类型声明。
 *
 * 教学页的代码块常有二三十行，真正要看的往往只有两三行。
 * 行高亮把「读者要自己找」变成「作者已经指出来了」—— 这是第 1.3 节
 * 视觉层级那套道理在代码块内部的应用。
 *
 * 类型说明：`shiki` 是 astro 的传递依赖，不在本项目的直接依赖里。
 * 为一个类型引入一个直接依赖不划算，所以这里用结构化类型描述
 * transformer 的契约 —— 它只需要匹配 <Code transformers> 的形状。
 */

interface HastElement {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: unknown[];
}

interface TransformerContext {
  addClassToHast(node: HastElement, className: string): void;
}

export interface LineTransformer {
  name: string;
  line(this: TransformerContext, node: HastElement, lineNumber: number): void;
}

export function markLines(lines: number[] | undefined): LineTransformer[] {
  if (!lines?.length) return [];
  const targets = new Set(lines);
  return [
    {
      name: 'layout-course:mark-lines',
      line(node, lineNumber) {
        if (targets.has(lineNumber)) {
          this.addClassToHast(node, 'highlighted');
        }
      },
    },
  ];
}
