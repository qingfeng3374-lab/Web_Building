import type p5 from 'p5';
import { cssVar } from '@/lib/color';

/**
 * p5 草图集合（实例模式）。
 *
 * 定位（ADR-0004）：p5 不承担信息传达，但**可以承担论证**。
 * 本站最主要的一支草图 `layoutGen` 就是一件有话要说的生成艺术：
 * 它用这门课教的规则（12 列网格、1.25 音阶、8pt 间距标尺）不断随机生成版面 ——
 * 每一帧都是合法的布局。读者看到的不是装饰纹理，而是「规则的解空间」。
 *
 * 共同约束：frameRate 受限、pixelDensity ≤ 2、只用设计令牌里的颜色、
 * 尺寸永远跟随宿主容器（不写死，见 P5Canvas 的 ResizeObserver）。
 */

export type SketchName = 'layoutGen' | 'layerBuild' | 'caseJourney' | 'ribbon' | 'rhythm';

interface Opts {
  accentVar: string;
  /** 宿主容器的当前尺寸；P5Canvas 会在容器变化时调用 onResize */
  getSize: () => { w: number; h: number };
}

export interface SketchInstance {
  (p: p5): void;
}

type Factory = (opts: Opts) => SketchInstance;

/* ═══════════════════════════════════════════════════════════════════════
   layoutGen —— 「规则的解空间」
   用课程自己的规则生成版面：12 列网格、span ∈ {3,4,6,8,12}、
   区块高度来自 1.25 音阶、间距来自 8pt 标尺。
   每隔几秒换一套，用缓动在两套版面之间插值。
   鼠标靠近时，网格线显形 —— 把「生成它的规则」露出来。
   ═══════════════════════════════════════════════════════════════════════ */
interface Block {
  col: number;
  span: number;
  row: number;
  rows: number;
  tone: number;
}

function generateLayout(p: p5, cols: number, maxRows: number): Block[] {
  const SPANS = [3, 4, 6, 8, 12];
  const out: Block[] = [];
  let row = 0;
  // 首块总是「主视区的大块」—— 第 5 章讲的层级，在生成规则里就体现
  let first = true;
  while (row < maxRows) {
    let col = 0;
    while (col < cols) {
      const remaining = cols - col;
      const candidates = SPANS.filter((s) => s <= remaining);
      if (!candidates.length) break;
      const span = first ? Math.min(8, remaining) : candidates[Math.floor(p.random(candidates.length))]!;
      const rows = first ? 2 : p.random() < 0.22 ? 2 : 1;
      out.push({
        col,
        span,
        row,
        rows: Math.min(rows, maxRows - row),
        // 主块最重，其余按 1/4 概率给一个次级块，其它都很轻 —— 三级层级
        tone: first ? 1 : p.random() < 0.25 ? 0.55 : 0.2,
      });
      col += span;
      first = false;
    }
    row += 1;
  }
  return out;
}

const layoutGen: Factory =
  ({ accentVar, getSize }) =>
  (p) => {
    const COLS = 12;
    const MAX_ROWS = 7;
    const PERIOD = 260; // 帧数：约 9 秒换一次版面

    let accent = '#2563eb';
    let ink = '#94a3b8';
    let surface = '#ffffff';
    let from: Block[] = [];
    let to: Block[] = [];
    let t = 0;

    const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

    p.setup = () => {
      const { w, h } = getSize();
      p.createCanvas(Math.max(1, w), Math.max(1, h));
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      p.frameRate(30);
      p.noStroke();
      accent = cssVar(accentVar, accent);
      ink = cssVar('--ink-4', ink);
      surface = cssVar('--surface-1', surface);
      from = generateLayout(p, COLS, MAX_ROWS);
      to = generateLayout(p, COLS, MAX_ROWS);
    };

    p.draw = () => {
      const { w, h } = getSize();
      if (Math.abs(w - p.width) > 1 || Math.abs(h - p.height) > 1) {
        p.resizeCanvas(Math.max(1, w), Math.max(1, h));
      }
      p.clear();

      // 8pt 标尺：水槽与外边距都来自标尺
      const gutter = 8;
      const margin = 16;
      const colW = (p.width - margin * 2 - gutter * (COLS - 1)) / COLS;
      const rowH = (p.height - margin * 2 - gutter * (MAX_ROWS - 1)) / MAX_ROWS;
      if (colW <= 0 || rowH <= 0) return;

      const phase = (t % PERIOD) / PERIOD;
      const k = easeInOut(Math.min(1, phase * 2.6)); // 前 38% 做过渡，其余静置

      const a = p.color(accent);
      const g = p.color(ink);

      // 鼠标靠近时露出网格线 —— 把「生成它的规则」显形
      const near = p.constrain(
        1 - p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2) / (p.width * 0.75),
        0,
        1,
      );
      if (near > 0.02) {
        p.noFill();
        p.stroke(p.red(g), p.green(g), p.blue(g), 26 * near);
        p.strokeWeight(1);
        for (let c = 0; c <= COLS; c++) {
          const x = margin + c * (colW + gutter) - gutter / 2;
          p.line(x, margin * 0.5, x, p.height - margin * 0.5);
        }
        p.noStroke();
      }

      // 在两套版面之间插值：按索引配对，多出来的块淡入淡出
      const n = Math.max(from.length, to.length);
      for (let i = 0; i < n; i++) {
        const A = from[i];
        const B = to[i];
        const src = A ?? B!;
        const dst = B ?? A!;
        const fade = A && B ? 1 : A ? 1 - k : k;

        const col = p.lerp(src.col, dst.col, k);
        const span = p.lerp(src.span, dst.span, k);
        const row = p.lerp(src.row, dst.row, k);
        const rows = p.lerp(src.rows, dst.rows, k);
        const tone = p.lerp(src.tone, dst.tone, k);

        const x = margin + col * (colW + gutter);
        const y = margin + row * (rowH + gutter);
        const bw = span * colW + (span - 1) * gutter;
        const bh = rows * rowH + (rows - 1) * gutter;

        // 层级：主块用强调色实心，次级半透明，其余只是极淡的面
        const strong = tone > 0.8;
        const col2 = strong ? a : g;
        p.fill(p.red(col2), p.green(col2), p.blue(col2), (strong ? 150 : 22 + tone * 70) * fade);
        p.rect(x, y, Math.max(0, bw), Math.max(0, bh), 3);

        // 主块里画两条「文字线」，暗示内容
        if (strong && bw > 60) {
          p.fill(255, 255, 255, 120 * fade);
          p.rect(x + 10, y + 12, Math.min(bw - 20, bw * 0.55), 5, 2);
          p.rect(x + 10, y + 24, Math.min(bw - 20, bw * 0.35), 5, 2);
        }
      }

      t++;
      if (t % PERIOD === 0) {
        from = to;
        to = generateLayout(p, COLS, MAX_ROWS);
      }
    };
  };

/* ═══════════════════════════════════════════════════════════════════════
   layerBuild —— 「六层叠加」的生成式演示（门户互动展品）

   这是全站唯一一支**读者可以操控**的 p5 草图，也是 ADR-0004 里
   「p5 不传达信息、但可以承担论证」的最完整例子：
   宿主用 `data-layers="0..6"` 告诉它「现在叠到第几层」，
   它就用那几层的规则重新计算同一份内容的版面，并在两种状态之间插值。

   读者亲手把滑块从 0 推到 6，看到的是这门课的全部主张在一块画布上发生：
   同一批方块，只因为依次获得了行长、间距、网格、骨架、层级、弹性，
   从一堆挤在一起的灰条变成一张有主次的版面。
   ═══════════════════════════════════════════════════════════════════════ */

/** 一块内容。role 决定它在第 4 层（骨架）里去哪个区域 */
interface Piece {
  role: 'head' | 'side' | 'main' | 'card' | 'foot';
  /** 内容的相对「份量」，第 5 层据此分配视觉重量 */
  weight: number;
  /** 卡片序号（同 role 内排序） */
  i: number;
}

interface Geom {
  x: number;
  y: number;
  w: number;
  h: number;
  tone: number;
  lines: number;
}

const PIECES: Piece[] = [
  { role: 'head', weight: 0.5, i: 0 },
  { role: 'main', weight: 1.0, i: 0 },
  { role: 'card', weight: 0.35, i: 0 },
  { role: 'card', weight: 0.35, i: 1 },
  { role: 'card', weight: 0.35, i: 2 },
  { role: 'side', weight: 0.3, i: 0 },
  { role: 'side', weight: 0.25, i: 1 },
  { role: 'foot', weight: 0.15, i: 0 },
];

const layerBuild: Factory =
  ({ accentVar, getSize }) =>
  (p) => {
    let accent = '#2563eb';
    let ink = '#94a3b8';
    let layers = 0;
    let shown = 0; // 平滑跟随 layers，避免拖动滑块时画面跳变
    let t = 0;
    let cur: Geom[] = [];

    /** 按「叠到第 L 层」计算每块的目标几何。L 是连续量，便于插值。 */
    function layout(L: number, W: number, H: number): Geom[] {
      // 第 6 层：容器宽度自己来回呼吸，演示同一套规则在不同宽度下都成立
      const breathe = L >= 5.5 ? 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(t * 0.018)) : 1;
      const narrow = breathe < 0.82;

      // 第 3 层之前没有标尺：外边距与水槽是随手写的；之后来自 8pt 标尺
      const margin = L < 2.5 ? 6 : 16;
      const gutter = L < 1.5 ? 2 : L < 2.5 ? 10 : 12;

      const boxW = W * breathe;
      const offX = (W - boxW) / 2;
      const inner = boxW - margin * 2;
      // 第 1 层：正文限宽（行长约束）。在画布上表现为内容不再铺满整幅宽度。
      const measure = L < 0.5 ? inner : Math.min(inner, W * 0.78);
      const contentX = offX + margin + (inner - measure) / 2;

      const cols = 12;
      const colW = (measure - gutter * (cols - 1)) / cols;
      const span = (n: number) => n * colW + (n - 1) * gutter;

      const out: Geom[] = [];
      let y = margin;
      // 组间 / 组内间距：第 2 层把它们拉开到 2 倍以上
      const gapIn = L < 1.5 ? 3 : 8;
      const gapOut = L < 1.5 ? 3 : L < 2.5 ? 12 : 24;

      const cards = PIECES.filter((q) => q.role === 'card');
      const sides = PIECES.filter((q) => q.role === 'side');

      for (const piece of PIECES) {
        // 第 5 层之前一切同重；之后按内容重要度分配色调
        const tone = L < 4.5 ? 0.3 : 0.18 + piece.weight * 0.82;
        let x = contentX;
        let w = measure;
        let h = 18;
        let lines = 0;

        if (piece.role === 'head') {
          h = L < 4.5 ? 16 : 22;
          lines = 1;
        } else if (piece.role === 'main') {
          // 第 4 层：主区与侧栏并置（骨架）；之前主区独占一行
          w = L < 3.5 || narrow ? measure : span(8);
          h = L < 4.5 ? 42 : 64;
          lines = 3;
        } else if (piece.role === 'side') {
          if (L < 3.5 || narrow) {
            w = measure;
            h = 20;
          } else {
            x = contentX + span(8) + gutter;
            w = span(4);
            h = piece.i === 0 ? 30 : 30;
          }
        } else if (piece.role === 'card') {
          // 第 3 层：卡片落到 12 列上，等分且对齐；之前宽度是随手写的
          if (L < 2.5) {
            w = measure * (0.26 + (piece.i % 2) * 0.09);
            x = contentX + piece.i * (measure * 0.33);
          } else if (narrow) {
            w = measure;
            x = contentX;
          } else {
            w = span(4);
            x = contentX + piece.i * (span(4) + gutter);
          }
          h = 34;
        } else {
          h = 12;
        }

        out.push({ x, y, w, h, tone, lines });

        // 纵向推进：同组内用小间距，跨组用大间距
        const isCardRow = piece.role === 'card';
        const isSideRow = piece.role === 'side';
        const lastCard = isCardRow && piece.i === cards.length - 1;
        const lastSide = isSideRow && piece.i === sides.length - 1;

        if (isCardRow && !lastCard && (L >= 2.5 || narrow)) {
          if (narrow) y += h + gapIn;
          // 宽屏下三张卡并排：不推进 y
        } else if (isSideRow && !lastSide) {
          y += narrow || L < 3.5 ? h + gapIn : h + gapIn;
        } else if (piece.role === 'side' && L >= 3.5 && !narrow) {
          y += h + gapIn;
        } else {
          y += h + (piece.role === 'head' ? gapOut : gapIn);
        }
        if (lastCard) y += gapOut - gapIn;
      }

      // 主区与侧栏并排时，侧栏应当与主区同一条基线开始 —— 修正 y
      if (L >= 3.5 && !narrow) {
        const mainIdx = PIECES.findIndex((q) => q.role === 'main');
        const main = out[mainIdx]!;
        let sy = main.y;
        PIECES.forEach((q, idx) => {
          if (q.role !== 'side') return;
          out[idx]!.y = sy;
          sy += out[idx]!.h + gapIn;
        });
      }

      // 整体垂直居中，避免画布下方留一大块空
      const bottom = Math.max(...out.map((g) => g.y + g.h));
      const shift = Math.max(0, (H - bottom - margin) / 2);
      return out.map((g) => ({ ...g, y: g.y + shift }));
    }

    p.setup = () => {
      const { w, h } = getSize();
      p.createCanvas(Math.max(1, w), Math.max(1, h));
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      p.frameRate(30);
      p.noStroke();
      accent = cssVar(accentVar, accent);
      ink = cssVar('--ink-4', ink);
      cur = layout(0, p.width, p.height);
    };

    p.draw = () => {
      const { w, h } = getSize();
      if (Math.abs(w - p.width) > 1 || Math.abs(h - p.height) > 1) {
        p.resizeCanvas(Math.max(1, w), Math.max(1, h));
      }
      // 同上：参数写在 P5Canvas 之外的容器上，必须往上找
      const host = (p as any).canvas?.closest('[data-layers]') as HTMLElement | null;
      layers = Number(host?.dataset.layers ?? 0);

      // 指数平滑：滑块跳一格，画面用几帧走过去，读者能看清是「哪里变了」
      shown += (layers - shown) * 0.12;
      t++;

      const target = layout(shown, p.width, p.height);
      if (cur.length !== target.length) cur = target;
      cur = cur.map((g, i) => {
        const d = target[i]!;
        const k = 0.18;
        return {
          x: g.x + (d.x - g.x) * k,
          y: g.y + (d.y - g.y) * k,
          w: g.w + (d.w - g.w) * k,
          h: g.h + (d.h - g.h) * k,
          tone: g.tone + (d.tone - g.tone) * k,
          lines: d.lines,
        };
      });

      p.clear();
      const a = p.color(accent);
      const gg = p.color(ink);

      // 第 3 层起，把生成这版面的 12 列网格淡淡画出来 —— 规则要看得见
      if (shown > 2.2) {
        const vis = Math.min(1, (shown - 2.2) / 0.8);
        const measure = Math.min(p.width - 32, p.width * 0.78);
        const x0 = (p.width - measure) / 2;
        const colW = (measure - 12 * 11) / 12;
        p.fill(p.red(a), p.green(a), p.blue(a), 14 * vis);
        for (let i = 0; i < 12; i++) p.rect(x0 + i * (colW + 12), 8, colW, p.height - 16);
      }

      for (const g of cur) {
        const strong = g.tone > 0.75;
        const c = strong ? a : gg;
        p.fill(p.red(c), p.green(c), p.blue(c), strong ? 210 : 30 + g.tone * 140);
        p.rect(g.x, g.y, Math.max(0, g.w), Math.max(0, g.h), 4);

        // 文字线：行长约束在这里看得最清楚 —— 第 1 层之后它们不再横贯全幅
        if (g.lines > 0 && g.w > 40) {
          p.fill(255, 255, 255, strong ? 150 : 90);
          for (let i = 0; i < g.lines; i++) {
            const lw = g.w * (i === g.lines - 1 ? 0.45 : 0.88) - 16;
            if (lw > 0) p.rect(g.x + 8, g.y + 10 + i * 12, lw, 4, 2);
          }
        }
      }
    };
  };

/* ═══════════════════════════════════════════════════════════════════════
   caseJourney —— 案例馆的建造时间轴（p5 场景）

   替掉原先那条 D3 直线时间轴。直线能表达顺序，但表达不了「建造」：
   七个阶段是一条**走过来的路**，走过的那一段应该看起来像走过了。

   画面分四层，自下而上：
     ① 夜空底：线性渐变 + 46 颗确定性「星」（用哈希而不是 random，
        保证每次重绘星位完全一致 —— 会动的星星会把注意力从主体上抢走）
     ② 轨道：七个节点之间的二次贝塞尔，未走到的部分是灰色细线
     ③ 已走过的路径：用相邻两个阶段的章节色做线性渐变，加 shadowBlur 发光；
        切换阶段时这一段会「画」过去（easeOutCubic），画完就 noLoop 停帧
     ④ 节点：已达的实心发光圆 + 外环，当前节点更大、环更亮

   p5 在这里只当画布与生命周期的封装，真正的绘制走 drawingContext（原生 2D）——
   p5 自己的 API 没有渐变描边和阴影模糊。
   ═══════════════════════════════════════════════════════════════════════ */
const caseJourney: Factory =
  ({ getSize }) =>
  (p) => {
    const STAGES = 7;
    const DURATION = 34;            // 过渡帧数（30fps → 约 1.1 秒）

    let toneOf: string[] = [];
    let ink = '#94a3b8';
    let active = 0;
    let shownFrom = 0;              // 过渡起点
    let progress = 1;               // 0→1
    let frame = 0;
    let watcher: MutationObserver | null = null;

    const easeOutCubic = (v: number) => 1 - (1 - v) ** 3;

    /** 确定性伪随机：同一个 index 永远得到同一个值，星位因此不会闪 */
    const hashUnit = (i: number, salt: number) => {
      const v = Math.sin((i + 1) * 127.1 + salt * 311.7) * 43758.5453;
      return v - Math.floor(v);
    };

    const nodes = () => {
      const padX = p.width < 560 ? 30 : 56;
      const usable = Math.max(1, p.width - padX * 2);
      const cy = p.height * 0.52;
      return Array.from({ length: STAGES }, (_, i) => ({
        i,
        x: padX + (usable * i) / (STAGES - 1),
        // 正弦位移：让路径有起伏，读起来像「走过来的」而不是标尺
        y: cy + Math.sin(i * 1.15 - 0.6) * Math.min(30, p.height * 0.13),
      }));
    };

    p.setup = () => {
      const { w, h } = getSize();
      p.createCanvas(Math.max(1, w), Math.max(1, h));
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      p.frameRate(30);
      p.noStroke();
      // stage0 用中性色，stage1..6 各取自己的章节色
      toneOf = [
        cssVar('--ink-4', '#94a3b8'),
        ...Array.from({ length: 6 }, (_, i) => cssVar(`--ch${i + 1}`, '#2563eb')),
      ];
      ink = cssVar('--ink-4', ink);

      /* 过渡结束后 draw() 会 noLoop() 停帧（§6.7：静态图没有理由一直重绘）。
         但停帧之后就没人再读 data-stage 了 —— 读者点下一个阶段，画面不会动。
         所以用 MutationObserver 盯住那个属性，变了就把循环叫醒。
         这是「省电」和「响应」的正确组合：不轮询，但也不装死。 */
      const host = (p as any).canvas?.closest('[data-stage]') as HTMLElement | null;
      if (host) {
        watcher = new MutationObserver(() => p.loop());
        watcher.observe(host, { attributes: true, attributeFilter: ['data-stage'] });
      }
    };

    /** p5 的 remove() 会调用它 —— 不解绑观察者就是泄漏 */
    (p as any).cleanup = () => watcher?.disconnect();

    p.draw = () => {
      const { w, h } = getSize();
      if (Math.abs(w - p.width) > 1 || Math.abs(h - p.height) > 1) {
        p.resizeCanvas(Math.max(1, w), Math.max(1, h));
      }

      const host = (p as any).canvas?.closest('[data-stage]') as HTMLElement | null;
      const want = Math.max(0, Math.min(STAGES - 1, Number(host?.dataset.stage ?? 0)));
      if (want !== active) {
        shownFrom = active;
        active = want;
        frame = 0;
        progress = 0;
        p.loop();
      }
      if (progress < 1) {
        frame += 1;
        progress = Math.min(1, frame / DURATION);
      }

      const ctx = (p as any).drawingContext as CanvasRenderingContext2D;
      const pts = nodes();
      const amount = easeOutCubic(progress);
      // 过渡期间「已走到」的连续位置，用它决定路径画到哪
      const head = shownFrom + (active - shownFrom) * amount;

      /* ① 夜空底 */
      ctx.clearRect(0, 0, p.width, p.height);
      const bg = ctx.createLinearGradient(0, 0, p.width, p.height);
      bg.addColorStop(0, '#071425');
      bg.addColorStop(0.5, '#10172f');
      bg.addColorStop(1, '#15112b');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, p.width, p.height);
      for (let i = 0; i < 46; i += 1) {
        const r = 0.4 + hashUnit(i, 3) * 1.2;
        ctx.fillStyle = `rgba(186, 230, 253, ${0.08 + hashUnit(i, 4) * 0.24})`;
        ctx.beginPath();
        ctx.arc(hashUnit(i, 1) * p.width, hashUnit(i, 2) * p.height, r, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ②③ 轨道与已走过的路径 */
      ctx.save();
      ctx.lineCap = 'round';
      for (let i = 0; i < pts.length - 1; i += 1) {
        const a = pts[i]!;
        const b = pts[i + 1]!;
        const cx = (a.x + b.x) / 2;
        const cy = Math.min(a.y, b.y) - 22;

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(cx, cy, b.x, b.y);
        ctx.stroke();

        // 这一段被走过了多少（0..1）
        const seg = Math.max(0, Math.min(1, head - i));
        if (seg <= 0) continue;
        const ex = a.x + (b.x - a.x) * seg;
        const ey = a.y + (b.y - a.y) * seg;
        const glow = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        glow.addColorStop(0, toneOf[i] ?? ink);
        glow.addColorStop(1, toneOf[i + 1] ?? ink);
        ctx.strokeStyle = glow;
        ctx.shadowColor = toneOf[i + 1] ?? ink;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(cx, cy, ex, ey);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      /* ④ 节点 */
      for (const n of pts) {
        const reached = n.i <= head + 0.001;
        const isActive = n.i === active;
        const pop = isActive ? 0.6 + 0.4 * amount : 1;
        const r = (isActive ? 11 : 7) * pop;
        ctx.save();
        ctx.globalAlpha = reached ? 1 : 0.42;
        ctx.shadowColor = toneOf[n.i] ?? ink;
        ctx.shadowBlur = isActive ? 22 : 8;
        ctx.fillStyle = reached ? (toneOf[n.i] ?? ink) : 'rgba(100, 116, 139, 0.7)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = isActive ? 2.5 : 1;
        ctx.strokeStyle = isActive ? '#f8fafc' : 'rgba(226, 232, 240, 0.45)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 过渡结束就停帧：这是一张静态图，没有理由一直重绘（§6.7）
      if (progress >= 1) p.noLoop();
    };
  };

/* ═══════════════════════════════════════════════════════════════════════
   ribbon —— 章节页头的流场丝带
   低透明度、取当前章节的强调色，不与标题争夺注意力。
   ═══════════════════════════════════════════════════════════════════════ */
const ribbon: Factory =
  ({ accentVar, getSize }) =>
  (p) => {
    let accent = '#2563eb';
    let t = 0;
    const LINES = 22;

    p.setup = () => {
      const { w, h } = getSize();
      p.createCanvas(Math.max(1, w), Math.max(1, h));
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      p.frameRate(24);
      p.noFill();
      accent = cssVar(accentVar, accent);
    };

    p.draw = () => {
      const { w, h } = getSize();
      if (Math.abs(w - p.width) > 1 || Math.abs(h - p.height) > 1) {
        p.resizeCanvas(Math.max(1, w), Math.max(1, h));
      }
      p.clear();
      const c = p.color(accent);
      for (let i = 0; i < LINES; i++) {
        const phase = i / LINES;
        p.stroke(p.red(c), p.green(c), p.blue(c), 16 + 30 * (1 - phase));
        p.strokeWeight(0.6 + phase * 1.4);
        p.beginShape();
        for (let x = -20; x <= p.width + 20; x += 22) {
          const n = p.noise(x * 0.0015, phase * 2.2, t);
          const y = p.height * (0.3 + phase * 0.5) + (n - 0.5) * p.height * 0.85;
          p.vertex(x, y);
        }
        p.endShape();
      }
      t += 0.0022;
    };
  };

/* ═══════════════════════════════════════════════════════════════════════
   rhythm —— 5.x 节奏演示的构成层
   与前景 D3 卡片网格共享同一组参数（通过宿主的 data-* 读取）。
   ═══════════════════════════════════════════════════════════════════════ */
const rhythm: Factory =
  ({ accentVar, getSize }) =>
  (p) => {
    let accent = '#2563eb';
    let lastKey = '';

    p.setup = () => {
      const { w, h } = getSize();
      p.createCanvas(Math.max(1, w), Math.max(1, h));
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      p.frameRate(20);
      p.noStroke();
      accent = cssVar(accentVar, accent);
    };

    p.draw = () => {
      const { w, h } = getSize();
      // 注意用 closest 而不是 parentElement：canvas 的直接父节点是 P5Canvas
      // 自己的 .p5-host，参数写在更外层的舞台元素上。
      const host = (p as any).canvas?.closest('[data-rhythm-mode]') as HTMLElement | null;
      const mode = host?.dataset.rhythmMode ?? 'even';
      const count = Number(host?.dataset.rhythmCount ?? 9);
      const key = `${w}x${h}:${mode}:${count}`;
      // 静态图案：参数不变就不重绘（不必要的重绘也是性能债，见 6.4 节）
      if (key === lastKey) return;
      lastKey = key;

      if (Math.abs(w - p.width) > 1 || Math.abs(h - p.height) > 1) {
        p.resizeCanvas(Math.max(1, w), Math.max(1, h));
      }
      p.clear();
      const a = p.color(accent);
      let x = 10;
      for (let i = 0; i < count; i++) {
        const ratio =
          mode === 'progressive' ? 1.25 ** (i % 4) : mode === 'grouped' ? (i % 4 === 0 ? 1.95 : 0.85) : 1;
        const bw = (p.width / count) * 0.5 * ratio;
        const bh = p.height * (0.3 + 0.45 * (ratio / 2));
        p.fill(p.red(a), p.green(a), p.blue(a), 34 + ratio * 34);
        p.rect(x, (p.height - bh) / 2, bw, bh, 4);
        x += bw + (p.width / count) * 0.3;
        if (x > p.width) break;
      }
    };
  };

export const sketches: Record<SketchName, Factory> = { layoutGen, layerBuild, caseJourney, ribbon, rhythm };
