#!/usr/bin/env node
/**
 * 设计令牌门禁（CI 必跑）。
 *
 * 规则：间距与字号只能来自设计令牌，不能是字面量。
 *
 * 为什么做成脚本而不是写进规范文档：
 *   规范会被忘记，脚本不会。第 2.3 节论证过，间距标尺的价值在于
 *   「把连续的决策空间离散化」—— 只要允许一个字面量漏进来，离散化就失效了。
 *
 * 白名单说明（见 2.3 节「好的门禁要区分违规与规则不适用」）：
 *   em / ch 是**相对于局部字号**的单位：列表缩进 1.2em、行内代码内边距 0.1em
 *   必须随所在文本的字号一起缩放，而 --space-* 是 rem（相对根字号）的，
 *   在这里用反而是错的。所以 em / ch 不在检查范围内。
 *   0 / 1px / 2px / 3px 是**结构性**取值（边框、轮廓、发丝线），
 *   不属于间距系统，强行纳入标尺反而荒谬。
 *   一个动不动误报的检查，团队第二周就会把它关掉。
 *
 * 用法：node scripts/check-token-usage.mjs [--verbose]
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VERBOSE = process.argv.includes('--verbose');

/** 结构性取值与无量纲关键字：规则不适用，不是违规 */
const ALLOWED = new Set([
  '0',
  '0px',
  'auto',
  'inherit',
  'initial',
  'unset',
  'revert',
  'none',
  '1px',
  '2px',
  '3px',
  '-1px',
  '-2px',
  '-3px',
  '100%',
  '50%',
  '-50%',
  '1fr',
]);

/** 这些路径本来就是定义令牌 / 展示反面教材的地方，豁免 */
const EXEMPT = [
  'src/styles/tokens.css', // 令牌定义本身
  'src/components/case/', // 案例组件刻意保留 v0 的魔数作为教学素材
  'src/components/demos/', // 演示需要展示「任意间距 vs 标尺间距」的对照
];

const SPACING_PROP = /(?:^|[\s;{])((?:padding|margin|gap|inset|row-gap|column-gap)[a-z-]*)\s*:\s*([^;}]+)/g;
const SIZE_PROP = /(?:^|[\s;{])(font-size)\s*:\s*([^;}]+)/g;
const FUNCTIONAL = /\b(var|calc|clamp|min|max|env|minmax|repeat)\s*\(/;
const LITERAL = /^-?\d*\.?\d+(px|rem|%|vw|vh)$/;

const problems = [];
let scanned = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue;
      walk(full);
      continue;
    }
    if (/\.(css|svelte|astro)$/.test(name)) check(full);
  }
}

function check(file) {
  const rel = relative(ROOT, file).split(sep).join('/');
  if (EXEMPT.some((e) => rel.startsWith(e))) return;
  const src = readFileSync(file, 'utf8');
  scanned++;

  for (const re of [SPACING_PROP, SIZE_PROP]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) {
      const prop = m[1];
      const value = m[2].trim();
      // 含 var() / calc() / clamp() 的值本就是令牌的组合，跳过
      if (FUNCTIONAL.test(value)) continue;
      const line = src.slice(0, m.index).split('\n').length;
      for (const token of value.split(/\s+/)) {
        if (ALLOWED.has(token)) continue;
        if (LITERAL.test(token)) {
          problems.push(
            `${rel}:${line} ${prop} 使用了字面量 "${token}"（应改用 var(--space-*) / var(--step-*)）`,
          );
        }
      }
    }
  }
}

walk(join(ROOT, 'src'));

console.log(`\n  token usage: 扫描了 ${scanned} 个样式文件\n`);

if (problems.length) {
  console.error(`  ✗ ${problems.length} 处硬编码：`);
  for (const p of VERBOSE ? problems : problems.slice(0, 25)) console.error(`    · ${p}`);
  if (!VERBOSE && problems.length > 25) {
    console.error(`    …（还有 ${problems.length - 25} 处，加 --verbose 查看）`);
  }
  console.error('');
  process.exit(1);
}

console.log('  ✓ 所有间距与字号都来自设计令牌\n');
