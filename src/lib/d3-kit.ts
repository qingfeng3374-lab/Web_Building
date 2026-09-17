/**
 * D3 的唯一入口（ADR-0003）。
 *
 * 全站禁止 `import * as d3 from 'd3'` —— 整包会把 ~270KB 的 d3 塞进演示 chunk，
 * 而每个演示实际只用到其中两三个子模块。这里按子包再导出，
 * Rollup 的 tree-shaking 才能真正生效。
 *
 * 用量最大的三个子包（scale / selection / shape）合计 gzip 后约 22KB。
 * 冷门子包（contour / hierarchy）不在这里导出，由使用它的演示单独动态 import。
 */

export { select, selectAll, pointer } from 'd3-selection';
export {
  scaleLinear,
  scaleBand,
  scaleOrdinal,
  scalePow,
  scaleSqrt,
  scaleLog,
  scaleSequential,
  scaleQuantize,
} from 'd3-scale';
export { axisBottom, axisLeft, axisTop, axisRight } from 'd3-axis';
export {
  line,
  area,
  arc,
  lineRadial,
  curveMonotoneX,
  curveLinear,
  curveCatmullRom,
  curveStep,
} from 'd3-shape';
export {
  extent,
  max,
  min,
  mean,
  sum,
  range,
  ticks,
  group,
  rollup,
  bisector,
  ascending,
  descending,
} from 'd3-array';
export { interpolate, interpolateNumber, interpolateRgb } from 'd3-interpolate';
export { color as d3color, rgb, hsl } from 'd3-color';
export { drag } from 'd3-drag';
export { easeCubicOut, easeQuadInOut } from 'd3-ease';
/** 副作用导入：让 selection 获得 .transition() 方法 */
import 'd3-transition';
export { transition } from 'd3-transition';
