import { z } from 'zod';
import { referenceIds } from './references';
import type { Lesson } from './types';

/**
 * 构建期内容校验。
 *
 * 这不是装饰性的类型体操 —— 它把三条需求变成了**构建器**：
 *   R7「必须有理论、不能是纯语法」 → theory 至少 1 条，且必须是 references.ts 里存在的 id
 *   R4「三部分齐全」               → explain / code / demo 都不能为空
 *   R5「演示可交互」               → demo.id 必须能在演示注册表中找到
 * 违反任何一条，`npm run build` 直接失败。
 */

const lStr = z.object({ zh: z.string().min(1), en: z.string().min(1) });

const blockSchema: z.ZodType<any> = z.lazy(() =>
  z.discriminatedUnion('t', [
    z.object({ t: z.literal('p'), text: lStr }),
    z.object({ t: z.literal('h'), text: lStr }),
    z.object({ t: z.literal('h4'), text: lStr }),
    z.object({ t: z.literal('ul'), items: z.array(lStr).min(1) }),
    z.object({ t: z.literal('ol'), items: z.array(lStr).min(1) }),
    z.object({ t: z.literal('note'), text: lStr }),
    z.object({ t: z.literal('key'), text: lStr }),
    z.object({ t: z.literal('pitfall'), text: lStr }),
    z.object({ t: z.literal('quote'), text: lStr, cite: lStr }),
    z.object({ t: z.literal('table'), head: z.array(lStr).min(1), rows: z.array(z.array(lStr)).min(1) }),
    z.object({
      t: z.literal('versus'),
      good: z.object({ title: lStr, text: lStr }),
      bad: z.object({ title: lStr, text: lStr }),
    }),
    z.object({
      t: z.literal('code'),
      lang: z.enum(['css', 'html', 'js', 'ts', 'svelte', 'bash', 'text']),
      file: lStr.optional(),
      purpose: lStr.optional(),
      code: z.string().min(1),
      highlight: z.array(z.number().int().positive()).optional(),
      key: lStr.optional(),
      pitfall: lStr.optional(),
    }),
  ]),
);

const sectionSchema = z.object({
  id: z.string().regex(/^\d+\.\d+$/, 'section id 必须形如 "1.2"'),
  title: lStr,
  subtitle: lStr,
  theory: z
    .array(z.string())
    .min(1, '每个小节至少引用一条理论 —— 纯语法小节不允许存在')
    .refine((ids) => ids.every((id) => referenceIds.has(id)), {
      message: 'theory 引用了 references.ts 中不存在的 id',
    }),
  explain: z.array(blockSchema).min(3, '讲解面板至少 3 个内容块'),
  code: z.array(blockSchema).min(1, '关键代码面板不能为空'),
  demo: z.object({ id: z.string().min(1), hint: lStr }),
  caseStage: z.enum(['stage0', 'stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6']).optional(),
});

export const lessonSchema = z.object({
  slug: z.string().regex(/^[a-z-]+$/),
  order: z.number().int().min(1),
  layer: lStr,
  adds: lStr,
  accentVar: z.string().regex(/^--ch[1-6]$/),
  title: lStr,
  subtitle: lStr,
  summary: lStr,
  sections: z.array(sectionSchema).min(4, '每章至少 4 个小节'),
});

/** 校验并返回强类型的 Lesson；失败时抛出可读的错误（构建立即中断） */
export function validateLesson(input: Lesson): Lesson {
  const result = lessonSchema.safeParse(input);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  · ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`内容校验失败 [lesson ${input.slug}]:\n${issues}`);
  }
  return input;
}
