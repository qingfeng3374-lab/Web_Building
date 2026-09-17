import type { L } from './locales';

/**
 * 站点外壳文案（导航、按钮、通用标签）。
 *
 * 类型 `Record<string, L>` 强制每个键都必须同时提供 zh 与 en ——
 * 漏译在 `astro check` / `tsc` 阶段就是编译错误，进不了构建。
 */
export const ui = {
  'site.title':        { zh: '页面布局之道', en: 'The Craft of Page Layout' },
  'site.subtitle':     { zh: '一门用案例串起来的交互式布局课', en: 'An interactive layout course built around one case study' },
  'site.tagline':      { zh: '理论 · 关键代码 · 可交互演示', en: 'Theory · Key Code · Live Demo' },

  'nav.home':          { zh: '课程门户', en: 'Course Home' },
  'nav.case':          { zh: '案例馆', en: 'Case Gallery' },
  'nav.about':         { zh: '关于与参考', en: 'About & References' },
  'nav.toc':           { zh: '本章目录', en: 'In This Chapter' },
  'nav.skip':          { zh: '跳到主内容', en: 'Skip to main content' },
  'nav.lang':          { zh: '切换语言', en: 'Switch language' },
  'nav.theme':         { zh: '切换明暗主题', en: 'Toggle theme' },
  'nav.chapters':      { zh: '章节', en: 'Chapters' },
  'nav.scrollPrev':    { zh: '向前滚动章节条', en: 'Scroll chapters back' },
  'nav.scrollNext':    { zh: '向后滚动章节条', en: 'Scroll chapters forward' },

  'tab.explain':       { zh: '📖 讲解', en: '📖 Explain' },
  'tab.code':          { zh: '⌨️ 关键代码', en: '⌨️ Key Code' },
  'tab.demo':          { zh: '▶️ 演示', en: '▶️ Demo' },
  'tab.group':         { zh: '内容视图切换', en: 'Content view' },

  'common.theory':     { zh: '理论依据', en: 'Theory' },
  'common.loading':    { zh: '演示加载中…', en: 'Loading demo…' },
  'common.copy':       { zh: '复制', en: 'Copy' },
  'common.copied':     { zh: '已复制', en: 'Copied' },
  'common.prev':       { zh: '上一章', en: 'Previous' },
  'common.next':       { zh: '下一章', en: 'Next' },
  'common.backHome':   { zh: '返回门户', en: 'Back to home' },
  'common.sections':   { zh: '个小节', en: ' sections' },
  'common.tryIt':      { zh: '动手试试', en: 'Try it' },

  'case.title':        { zh: 'NeoCampus 新生数据看板', en: 'NeoCampus Freshman Dashboard' },
  'case.metrics':      { zh: '指标变化', en: 'Metric changes' },
  'case.openGallery':  { zh: '在案例馆查看完整演进 →', en: 'See the full evolution in the gallery →' },

  'metric.grouping':   { zh: '分组比', en: 'Grouping ratio' },
  'metric.consistency':{ zh: '取值种类数', en: 'Distinct values' },
  'metric.hierarchy':  { zh: '视觉层级分', en: 'Hierarchy score' },
  'metric.measure':    { zh: '正文行长', en: 'Line measure' },
  'metric.cls':        { zh: '布局偏移 CLS', en: 'Layout shift (CLS)' },
  'metric.a11y':       { zh: '可达性问题数', en: 'A11y issues' },

  'portal.start':      { zh: '从第 1 章开始', en: 'Start with Chapter 1' },
  'portal.caseIntro':  { zh: '贯穿案例', en: 'The running case' },
  'portal.howto':      { zh: '怎么用这个网站', en: 'How to use this site' },

  'gallery.timeline':  { zh: '建造时间轴', en: 'Build timeline' },
  'gallery.compare':   { zh: '阶段对比', en: 'Stage comparison' },
  'gallery.tree':      { zh: '布局决策树', en: 'Layout decision tree' },
  'gallery.checklist': { zh: '布局自检清单', en: 'Layout checklist' },

  'about.refs':        { zh: '参考文献', en: 'References' },
  'about.citedIn':     { zh: '引用于', en: 'Cited in' },

  'footer.meta':       { zh: 'Astro + Svelte · D3.js 绘图 · p5.js 生成式装饰 · 纯静态部署', en: 'Astro + Svelte · Charts by D3.js · Generative decor by p5.js · Fully static' },
  'footer.selfDemo':   { zh: '本站遵守它所讲授的每一条规则 —— 按 G 叠加网格自行验证', en: 'This site obeys every rule it teaches — press G to overlay the grid and check' },

  'notfound.title':    { zh: '页面走丢了', en: 'Page not found' },
  'notfound.text':     { zh: '这个地址没有对应的内容。也许它在门户里。', en: 'Nothing lives at this address. It might be on the home page.' },
} as const satisfies Record<string, L>;

export type UIKey = keyof typeof ui;

/** 返回一个绑定了当前语言的取词函数 */
export function useUI(locale: 'zh' | 'en') {
  return (key: UIKey): string => ui[key][locale];
}
