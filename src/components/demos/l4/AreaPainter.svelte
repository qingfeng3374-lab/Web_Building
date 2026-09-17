<script lang="ts">
  /**
   * 3.4 演示 · grid-template-areas 画笔
   *
   * 在 6×6 网格上刷区域名，实时生成合法的 `grid-template-areas` 并渲染成真实骨架。
   * 校验器会检查「区域必须是矩形」—— 非法时给出提示，这是 areas 最常见的静默失败。
   *
   * 键盘可达：方向键移动光标，空格/回车落笔（WCAG 2.1.1，见第 6 章）。
   */
  import { cssVar } from '@/lib/color';

  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();

  const T = $derived({
    zh: {
      brush: '当前画笔',
      empty: '留空 (.)',
      preset: '预设',
      pDash: 'stage4 看板骨架',
      pHoly: '圣杯布局',
      pNarrow: '窄屏单列',
      clear: '清空',
      css: '生成的 CSS',
      valid: '✓ 所有区域都是矩形，CSS 合法',
      invalid: '✗ 区域不是矩形，浏览器会静默忽略整条规则',
      invalidWhich: '非矩形区域：',
      preview: '渲染结果',
      hint: '试着把 trnd 刷成 L 形 —— 校验器会立刻报错。浏览器遇到这种写法不会在控制台提示任何信息，只会让整个布局「莫名其妙不生效」，这是 areas 最难排查的坑。',
      kbd: '方向键移动 · 空格落笔 · 数字键 1–7 切换画笔',
    },
    en: {
      brush: 'Current brush',
      empty: 'Empty (.)',
      preset: 'Presets',
      pDash: 'stage4 dashboard skeleton',
      pHoly: 'Holy grail',
      pNarrow: 'Narrow single column',
      clear: 'Clear',
      css: 'Generated CSS',
      valid: '✓ every region is rectangular — the CSS is valid',
      invalid: '✗ a region is not rectangular — the browser will silently drop the whole declaration',
      invalidWhich: 'Non-rectangular: ',
      preview: 'Rendered result',
      hint: 'Try painting `trnd` into an L shape — the validator flags it instantly. A browser meeting that declaration says nothing in the console and simply “mysteriously does not apply” the layout. It is the hardest areas bug to find.',
      kbd: 'Arrow keys to move · Space to paint · 1–7 to switch brush',
    },
  }[locale]);

  const ROWS = 6;
  const COLS = 6;

  const BRUSHES = [
    { name: 'head', color: '#7c3aed' },
    { name: 'filt', color: '#0891b2' },
    { name: 'kpis', color: '#0d9488' },
    { name: 'trnd', color: '#d97706' },
    { name: 'brkd', color: '#db2777' },
    { name: 'tabl', color: '#2563eb' },
    { name: 'acts', color: '#dc2626' },
  ];

  const PRESETS: Record<string, string[][]> = {
    dash: [
      ['head', 'head', 'head', 'head', 'head', 'head'],
      ['filt', 'filt', 'filt', 'filt', 'filt', 'filt'],
      ['kpis', 'kpis', 'kpis', 'kpis', 'kpis', 'kpis'],
      ['trnd', 'trnd', 'trnd', 'trnd', 'brkd', 'brkd'],
      ['trnd', 'trnd', 'trnd', 'trnd', 'brkd', 'brkd'],
      ['tabl', 'tabl', 'tabl', 'tabl', 'acts', 'acts'],
    ],
    holy: [
      ['head', 'head', 'head', 'head', 'head', 'head'],
      ['filt', 'kpis', 'kpis', 'kpis', 'kpis', 'trnd'],
      ['filt', 'kpis', 'kpis', 'kpis', 'kpis', 'trnd'],
      ['filt', 'kpis', 'kpis', 'kpis', 'kpis', 'trnd'],
      ['filt', 'kpis', 'kpis', 'kpis', 'kpis', 'trnd'],
      ['acts', 'acts', 'acts', 'acts', 'acts', 'acts'],
    ],
    narrow: [
      ['head', 'head', 'head', 'head', 'head', 'head'],
      ['filt', 'filt', 'filt', 'filt', 'filt', 'filt'],
      ['kpis', 'kpis', 'kpis', 'kpis', 'kpis', 'kpis'],
      ['trnd', 'trnd', 'trnd', 'trnd', 'trnd', 'trnd'],
      ['brkd', 'brkd', 'brkd', 'brkd', 'brkd', 'brkd'],
      ['tabl', 'tabl', 'tabl', 'tabl', 'tabl', 'tabl'],
    ],
  };

  let cells = $state<string[][]>(PRESETS.dash!.map((r) => [...r]));
  let brush = $state('trnd');
  let cursor = $state({ r: 0, c: 0 });
  let painting = $state(false);

  function paint(r: number, c: number) {
    const next = cells.map((row) => [...row]);
    next[r]![c] = brush;
    cells = next;
  }

  function onKeydown(e: KeyboardEvent) {
    const k = e.key;
    if (k === 'ArrowUp') cursor = { ...cursor, r: Math.max(0, cursor.r - 1) };
    else if (k === 'ArrowDown') cursor = { ...cursor, r: Math.min(ROWS - 1, cursor.r + 1) };
    else if (k === 'ArrowLeft') cursor = { ...cursor, c: Math.max(0, cursor.c - 1) };
    else if (k === 'ArrowRight') cursor = { ...cursor, c: Math.min(COLS - 1, cursor.c + 1) };
    else if (k === ' ' || k === 'Enter') paint(cursor.r, cursor.c);
    else if (/^[1-7]$/.test(k)) brush = BRUSHES[Number(k) - 1]!.name;
    else return;
    e.preventDefault();
    // roving tabindex：焦点必须跟着光标走，否则键盘用户会"失焦"
    queueMicrotask(() => {
      const sel = `.ap__cell[data-rc='${cursor.r}-${cursor.c}']`;
      (document.querySelector(sel) as HTMLElement | null)?.focus();
    });
  }

  /* ── 校验：每个区域必须是矩形 ────────────────────────────────────── */
  const invalidAreas = $derived.by(() => {
    const bad: string[] = [];
    const names = new Set(cells.flat().filter((n) => n !== '.'));
    for (const name of names) {
      let r0 = ROWS;
      let r1 = -1;
      let c0 = COLS;
      let c1 = -1;
      let count = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (cells[r]![c] === name) {
            r0 = Math.min(r0, r);
            r1 = Math.max(r1, r);
            c0 = Math.min(c0, c);
            c1 = Math.max(c1, c);
            count++;
          }
        }
      }
      // 矩形的充要条件：单元格数量 = 包围盒面积
      if (count !== (r1 - r0 + 1) * (c1 - c0 + 1)) bad.push(name);
    }
    return bad;
  });

  const valid = $derived(invalidAreas.length === 0);

  const css = $derived(
    'grid-template-areas:\n' +
      cells.map((row) => `  "${row.join(' ')}"`).join('\n') +
      ';',
  );

  const usedBrushes = $derived([...new Set(cells.flat().filter((n) => n !== '.'))]);
  const colorOf = (name: string) => BRUSHES.find((b) => b.name === name)?.color ?? '#94a3b8';
</script>

<div class="stack-5">
  <div class="controls">
    <div class="control" style="flex: 1 1 22rem">
      <span class="control__label"><span>{T.brush}</span></span>
      <div class="chip-group">
        {#each BRUSHES as b, i (b.name)}
          <button
            class="chip"
            type="button"
            aria-pressed={brush === b.name}
            onclick={() => (brush = b.name)}
            style={`--chip-c:${b.color}`}
          >
            <span class="swatch" style={`background:${b.color}`}></span>{b.name}
            <kbd>{i + 1}</kbd>
          </button>
        {/each}
        <button class="chip" type="button" aria-pressed={brush === '.'} onclick={() => (brush = '.')}>{T.empty}</button>
      </div>
    </div>
    <div class="control" style="flex: 0 1 18rem">
      <span class="control__label"><span>{T.preset}</span></span>
      <div class="chip-group">
        <button class="chip" type="button" onclick={() => (cells = PRESETS.dash!.map((r) => [...r]))}>{T.pDash}</button>
        <button class="chip" type="button" onclick={() => (cells = PRESETS.holy!.map((r) => [...r]))}>{T.pHoly}</button>
        <button class="chip" type="button" onclick={() => (cells = PRESETS.narrow!.map((r) => [...r]))}>{T.pNarrow}</button>
        <button class="chip" type="button" onclick={() => (cells = Array.from({ length: ROWS }, () => Array(COLS).fill('.')))}>
          {T.clear}
        </button>
      </div>
    </div>
  </div>

  <div class="ap__split">
    <!-- 画布 -->
    <div class="ap__canvas" role="group" aria-label={T.kbd}>
      {#each cells as row, r (r)}
        {#each row as cell, c (c)}
          <button
            class="ap__cell"
            class:is-cursor={cursor.r === r && cursor.c === c}
            class:is-empty={cell === '.'}
            style={`background:${cell === '.' ? 'transparent' : colorOf(cell) + '33'}; border-color:${cell === '.' ? 'var(--line-2)' : colorOf(cell)}`}
            type="button"
            tabindex={cursor.r === r && cursor.c === c ? 0 : -1}
            onkeydown={onKeydown}
            onpointerup={() => (painting = false)}
            data-rc={`${r}-${c}`}
            aria-label={`${r + 1},${c + 1}: ${cell}`}
            onpointerdown={() => {
              painting = true;
              cursor = { r, c };
              paint(r, c);
            }}
            onpointerenter={() => painting && paint(r, c)}
          >
            {cell === '.' ? '' : cell}
          </button>
        {/each}
      {/each}
    </div>

    <!-- 真实渲染 -->
    <div class="ap__preview">
      <p class="control__label"><span>{T.preview}</span></p>
      <div
        class="ap__render"
        style={`grid-template-areas: ${cells.map((r) => `"${r.join(' ')}"`).join(' ')}`}
      >
        {#each usedBrushes as name (name)}
          <div class="ap__block" style={`grid-area:${name}; --c:${colorOf(name)}`}>{name}</div>
        {/each}
      </div>
    </div>
  </div>

  <p class={valid ? 'key-point' : 'pitfall'} style="margin:0">
    {valid ? T.valid : `${T.invalid} — ${T.invalidWhich}${invalidAreas.join(', ')}`}
  </p>

  <div>
    <p class="control__label" style="margin-block-end: var(--space-2)"><span>{T.css}</span></p>
    <pre class="console">{css}</pre>
  </div>

  <p class="note" style="margin:0">{T.hint}</p>
  <p class="demo-legend" style="margin:0"><span>⌨ {T.kbd}</span></p>
</div>

<style>
  .ap__split {
    display: grid;
    gap: var(--space-5);
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  @container (max-width: 42rem) {
    .ap__split {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .ap__canvas {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 3px;
    padding: var(--space-3);
    background: var(--surface-0);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
    aspect-ratio: 1;
  }
  .ap__cell {
    border: 1.5px solid var(--line-2);
    border-radius: 3px;
    font-family: var(--font-mono);
    font-size: 9.5px;
    color: var(--ink-2);
    cursor: crosshair;
    touch-action: none;
    padding: 0;
    min-block-size: 0;
  }
  .ap__cell.is-cursor {
    outline: 2px solid var(--ink-1);
    outline-offset: 1px;
  }
  .ap__preview {
    display: grid;
    gap: var(--space-2);
    align-content: start;
  }
  .ap__render {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 4px;
    aspect-ratio: 1;
    padding: var(--space-3);
    background: var(--surface-1);
    border: var(--hairline) solid var(--line-1);
    border-radius: var(--radius);
  }
  .ap__block {
    background: color-mix(in srgb, var(--c) 18%, transparent);
    border: 1.5px solid var(--c);
    border-radius: var(--radius-sm);
    display: grid;
    place-items: center;
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--ink-1);
    min-inline-size: 0;
  }
  .chip kbd {
    font-family: var(--font-mono);
    font-size: 9px;
    opacity: 0.55;
    margin-inline-start: 3px;
  }
  .chip .swatch {
    margin-inline-end: 4px;
  }
</style>
