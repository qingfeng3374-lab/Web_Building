/**
 * i18n 基础设施
 *
 * 设计决策（ADR-0002）：放弃样例的「双 DOM + JS 隐藏」方案，改用路由级 i18n。
 *   - /zh/lessons/perception/  与  /en/lessons/perception/  是两个独立的静态页
 *   - DOM 不翻倍、可被搜索引擎分别索引、切换语言是纯 <a> 跳转（零 JS）
 *   - slug 语言无关 → 切语言时可停留在同一小节同一面板
 */

export const LOCALES = ['zh', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'zh';

export const LOCALE_META: Record<Locale, { htmlLang: string; label: string; short: string }> = {
  zh: { htmlLang: 'zh-CN', label: '中文', short: '中' },
  en: { htmlLang: 'en-US', label: 'English', short: 'EN' },
};

/** 双语字符串对：内容模型中每一个面向用户的字符串都是这个类型。
 *  中英在同一处相邻书写 —— 漏译在代码评审时肉眼可见，在 CI 中可机器检出。 */
export interface L {
  zh: string;
  en: string;
}

/** 取出当前语言的文本 */
export function pick(value: L, locale: Locale): string {
  return value[locale];
}

/** 站内路径拼接（自动带上 Astro 的 base，支持子目录部署） */
export function path(base: string, locale: Locale, ...segments: string[]): string {
  const clean = segments.filter(Boolean).map((s) => s.replace(/^\/+|\/+$/g, ''));
  const prefix = base.replace(/\/+$/, '');
  return `${prefix}/${locale}/${clean.join('/')}${clean.length ? '/' : ''}`;
}

/** 把当前路径切换到另一种语言（用于语言切换按钮的 href） */
export function switchLocalePath(currentPath: string, target: Locale, base = '/'): string {
  const prefix = base.replace(/\/+$/, '');
  const rest = currentPath.slice(prefix.length).replace(/^\/(zh|en)(?=\/|$)/, '');
  return `${prefix}/${target}${rest || '/'}`;
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
