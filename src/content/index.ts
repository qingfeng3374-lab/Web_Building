import { validateLesson } from './schema';
import type { Lesson, Section } from './types';

import { ch1 } from './lessons/ch1-content';
import { ch2 } from './lessons/ch2-spacing';
import { ch3 } from './lessons/ch3-scale';
import { ch4 } from './lessons/ch4-structure';
import { ch5 } from './lessons/ch5-visual';
import { ch6 } from './lessons/ch6-adaptive';


/**
 * 课程内容注册表。
 * 每一章在这里过一遍 Zod 校验 —— 校验发生在**模块求值时**，
 * 也就是 `astro build` 的第一秒。内容写错，构建当场失败，不会带病上线。
 */
export const lessons: Lesson[] = [ch1, ch2, ch3, ch4, ch5, ch6]
  .map(validateLesson)
  .sort((a, b) => a.order - b.order);

/* 注册表的两条自检。放在模块顶层执行 —— 构建的第一秒就会撞上，
   而不是等到某个页面渲染出「第 undefined 章」才被发现。
   加新章时这两条是第一道防线。 */
{
  const seen = new Map<number, string>();
  for (const l of lessons) {
    const dup = seen.get(l.order);
    if (dup) throw new Error(`章节序号重复：order ${l.order} 同时被 "${dup}" 与 "${l.slug}" 使用`);
    seen.set(l.order, l.slug);
  }
  const slugs = new Set(lessons.map((l) => l.slug));
  if (slugs.size !== lessons.length) throw new Error('章节 slug 重复 —— slug 同时是路由，必须唯一');
}

/** 章节总数。需要「一共几章」的地方都从这里取，不要另写字面量。 */
export const LESSON_COUNT = lessons.length;

export const lessonBySlug = new Map(lessons.map((l) => [l.slug, l]));

export function lessonByOrder(order: number): Lesson | undefined {
  return lessons.find((l) => l.order === order);
}

/** 章节的上一章 / 下一章（用于翻页器） */
export function neighbours(slug: string): { prev?: Lesson; next?: Lesson } {
  const i = lessons.findIndex((l) => l.slug === slug);
  return { prev: lessons[i - 1], next: lessons[i + 1] };
}

/** 小节锚点 id：1.2 → s-1-2 */
export function anchorOf(section: Section): string {
  return `s-${section.id.replace('.', '-')}`;
}

/** 反向索引：某条理论在哪些小节被引用（/about 页用） */
export function sectionsCitingReference(refId: string): Array<{ lesson: Lesson; section: Section }> {
  const out: Array<{ lesson: Lesson; section: Section }> = [];
  for (const lesson of lessons) {
    for (const section of lesson.sections) {
      if (section.theory.includes(refId)) out.push({ lesson, section });
    }
  }
  return out;
}

/** 全课程统计（门户页展示） */
export const stats = {
  lessons: lessons.length,
  sections: lessons.reduce((n, l) => n + l.sections.length, 0),
  demos: new Set(lessons.flatMap((l) => l.sections.map((s) => s.demo.id))).size,
};

export type { Lesson, Section };
