#!/usr/bin/env node
/**
 * 中英内容一致性门禁（CI 必跑）。
 *
 * 本项目的内容模型把每个面向用户的字符串写成 `{ zh, en }`，
 * 所以「中文有三段、英文只有两段」这类结构性失配在**类型层面**就不可能发生。
 * 这个脚本负责类型管不到的那一半：
 *
 *   1. 任何一侧为空                    → 错误
 *   2. zh 与 en 完全相同（疑似漏译）    → 错误（zh 侧不含汉字的除外：文献、代码、符号）
 *   3. 篇幅比落在 [0.8, 4.5] 之外       → 警告（正常约 1.5–2.5 汉字 / 英文词）
 *   4. theory 引用了不存在的文献 id     → 错误
 *   5. demo.id 不在演示注册表中          → 错误
 *   6. ui.ts 有键只写了一种语言          → 错误
 *
 * 用法：node scripts/check-i18n-parity.mjs [--verbose]
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VERBOSE = process.argv.includes('--verbose');

const errors = [];
const warnings = [];

/* ── 工具 ──────────────────────────────────────────────────────────── */

const read = (p) => readFileSync(join(ROOT, p), 'utf8');

/** 粗略字数：中文按字符数，英文按空格分词 */
function wordCount(s, lang) {
  const clean = s
    .replace(/`[^`]*`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]/g, '')
    .trim();
  if (lang === 'zh') return [...clean].filter((c) => /\S/.test(c)).length;
  return clean.split(/\s+/).filter(Boolean).length;
}

/**
 * 允许中英相同的情形。
 *
 * 核心判据：**zh 侧不含任何汉字的字符串，本就不是翻译对象** ——
 * 它只可能是文献引用、规范标题、代码片段、数值或符号图形。
 * 这条规则比「白名单几种模式」更可靠，也更容易解释。
 */
function mayBeIdentical(zh) {
  return !/[一-鿿㐀-䶿]/.test(zh);
}

/**
 * 从内容源码里提取所有 `{ zh: '...', en: '...' }` 字面量。
 * 用正则而不是 AST：脚本要在没有构建产物的情况下也能跑（CI 的第一步）。
 */
function extractPairs(src, file) {
  const pairs = [];
  // 支持单行与跨行、单引号与反引号
  const re = /\{\s*zh:\s*(['`])((?:\\.|(?!\1)[\s\S])*?)\1\s*,\s*en:\s*(['`])((?:\\.|(?!\3)[\s\S])*?)\3\s*,?\s*\}/g;
  let m;
  while ((m = re.exec(src))) {
    const line = src.slice(0, m.index).split('\n').length;
    pairs.push({ zh: m[2], en: m[4], file, line });
  }
  return pairs;
}

/* ── 1–3：逐对检查 ─────────────────────────────────────────────────── */

const contentFiles = [
  ...readdirSync(join(ROOT, 'src/content/lessons')).map((f) => `src/content/lessons/${f}`),
  'src/content/case.ts',
  'src/content/references.ts',
  'src/i18n/ui.ts',
  'src/data/checklist.ts',
  'src/data/decision-tree.ts',
];

let pairCount = 0;
for (const file of contentFiles) {
  let src;
  try {
    src = read(file);
  } catch {
    continue;
  }
  for (const p of extractPairs(src, file)) {
    pairCount++;
    if (!p.zh.trim()) errors.push(`${p.file}:${p.line} zh 为空`);
    if (!p.en.trim()) errors.push(`${p.file}:${p.line} en 为空`);
    if (p.zh.trim() && p.zh.trim() === p.en.trim() && !mayBeIdentical(p.zh)) {
      errors.push(`${p.file}:${p.line} zh 与 en 完全相同（疑似漏译）: "${p.zh.slice(0, 48)}…"`);
    }
    const zhN = wordCount(p.zh, 'zh');
    const enN = wordCount(p.en, 'en');
    if (zhN > 20 && enN > 8) {
      const ratio = zhN / enN;
      if (ratio < 0.8 || ratio > 4.5) {
        warnings.push(
          `${p.file}:${p.line} 中英篇幅比异常（正常约 1.5–2.5 汉字/英文词） ${ratio.toFixed(2)} (zh ${zhN} 字 / en ${enN} 词): "${p.zh.slice(0, 32)}…"`,
        );
      }
    }
  }
}

/* ── 4：theory 引用有效性 ──────────────────────────────────────────── */

const refIds = new Set([...read('src/content/references.ts').matchAll(/^\s*id:\s*'([^']+)'/gm)].map((m) => m[1]));

for (const file of contentFiles.filter((f) => f.includes('lessons/'))) {
  const src = read(file);
  for (const m of src.matchAll(/theory:\s*\[([^\]]*)\]/g)) {
    const ids = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
    if (ids.length === 0) {
      errors.push(`${file} 有小节的 theory 为空 —— 纯语法小节不允许存在`);
    }
    for (const id of ids) {
      if (!refIds.has(id)) errors.push(`${file} theory 引用了不存在的文献 id: ${id}`);
    }
  }
}

/* ── 5：demo id 必须在注册表中 ─────────────────────────────────────── */

const registrySrc = read('src/components/demos/registry.ts');
const registered = new Set(
  [...registrySrc.matchAll(/^\s*(?:'([^']+)'|([A-Za-z][\w-]*)):\s*\(\)\s*=>\s*import/gm)].map((m) => m[1] ?? m[2]),
);

for (const file of contentFiles.filter((f) => f.includes('lessons/'))) {
  const src = read(file);
  for (const m of src.matchAll(/demo:\s*\{\s*id:\s*'([^']+)'/g)) {
    if (!registered.has(m[1])) errors.push(`${file} demo.id "${m[1]}" 不在演示注册表中`);
  }
}

/* ── 6：ui.ts 键完整性 ─────────────────────────────────────────────── */

const uiSrc = read('src/i18n/ui.ts');
for (const m of uiSrc.matchAll(/^\s*'([\w.-]+)':\s*\{([^}]*)\},?\s*$/gm)) {
  const body = m[2];
  if (!/\bzh:/.test(body)) errors.push(`src/i18n/ui.ts 键 "${m[1]}" 缺少 zh`);
  if (!/\ben:/.test(body)) errors.push(`src/i18n/ui.ts 键 "${m[1]}" 缺少 en`);
}

/* ── 报告 ──────────────────────────────────────────────────────────── */

console.log(`\n  i18n parity: 检查了 ${pairCount} 组双语字符串、${refIds.size} 条文献、${registered.size} 个演示\n`);

if (warnings.length) {
  console.log(`  ⚠ ${warnings.length} 条警告：`);
  for (const w of VERBOSE ? warnings : warnings.slice(0, 10)) console.log(`    · ${w}`);
  if (!VERBOSE && warnings.length > 10) console.log(`    …（还有 ${warnings.length - 10} 条，加 --verbose 查看）`);
  console.log('');
}

if (errors.length) {
  console.error(`  ✗ ${errors.length} 个错误：`);
  for (const e of errors) console.error(`    · ${e}`);
  console.error('');
  process.exit(1);
}

console.log('  ✓ 中英内容一致性检查通过\n');
