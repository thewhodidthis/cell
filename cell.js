// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const lerp = (v, x1 = 0, x2 = 1) => x1 + (x2 - x1) * v
const norm = (v, x1 = 0, x2 = 1) => (v - x1) / (x2 - x1)
const cast = (v, x1, x2, y1, y2) => lerp(norm(v, x1, x2), y1, y2)
const randF = (hi = 0, lo = 0) => Math.random() * (hi - lo) + lo
const rand = (...args) => Math.floor(randF(...args))
const TAU = 2 * Math.PI
const RAD = 360 / TAU
const DEG = TAU / 360
const deg = (x) => x * RAD
const rad = (x) => x * DEG
function poltocar(a = 0, r = 1) {
  return {
    x: r * Math.cos(a),
    y: r * Math.sin(a),
  }
}
const Q = deg(TAU * 0.25)
const INPUT_PROPERTIES = [
  "bend",
  "fill-style",
  "greedy",
  "line-width",
  "rotate",
  "zoom",
  "spread",
  "stroke-style",
].map((p) => `--cell-${p}`)
const lookup = (map, options = {
  bend: 0,
  rotate: 0,
  spread: 0,
  zoom: 1,
}) => {
  const get = (k) => map.has(k) && map.get(k).toString().trim()
  options.greedy = !!get("--cell-greedy")
  options.styles = {}
  const bend = get("--cell-bend")
  if (bend) {
    options.bend = parseFloat(bend)
  }
  const rotate = get("--cell-rotate")
  if (rotate) {
    options.rotate = parseFloat(rotate)
  }
  const spread = get("--cell-spread")
  if (spread) {
    options.spread = spread
  }
  const zoom = get("--cell-zoom")
  if (zoom) {
    options.zoom = parseFloat(zoom)
  }
  const fillStyle = get("--cell-fill-style")
  if (fillStyle) {
    options.styles.fillStyle = fillStyle
  }
  const strokeStyle = get("--cell-stroke-style")
  if (strokeStyle) {
    options.styles.strokeStyle = strokeStyle
  }
  const lineWidth = get("--cell-line-width")
  if (lineWidth) {
    options.styles.lineWidth = parseFloat(lineWidth)
  }
  return options
}
class QuadPainter {
  static get inputProperties() {
    return INPUT_PROPERTIES
  }
  paint(context, geometry, properties) {
    const { bend, zoom, spread, rotate, styles, greedy } = lookup(properties)
    const { width: w, height: h } = geometry
    const radius = zoom * (greedy ? Math.sqrt(2 * Math.pow(Math.max(w, h), 2)) : Math.min(w, h)) / 2
    const offset = cast(spread, -1, 1, 0, Q)
    Object.entries(styles).forEach(([k, v]) => {
      context[k] = v
    })
    context.translate(w / 2, h / 2)
    const limit = bend * Q * 2
    const twist = rand(-limit, limit)
    context.rotate(rad(rotate + twist))
    context.beginPath()
    Array.from({
      length: 2 * 2,
    }).map((_, i) => {
      const shift = Math.random() >= bend ? 0 : rand(0, Q - offset)
      const q = i * Q
      const j = i % 2 ? Q - 2 * offset : 0
      const d = offset + j + q + shift
      return poltocar(rad(d), radius)
    }).forEach(({ x, y }) => {
      context.lineTo(x, y)
    })
    context.closePath()
    context.stroke()
    context.fill()
  }
}
class ArcPainter {
  static get inputProperties() {
    return INPUT_PROPERTIES
  }
  paint(context, geometry, properties) {
    const { bend, zoom, spread, rotate, styles } = lookup(properties)
    const { width: w, height: h } = geometry
    const x = w / 2
    const y = h / 2
    const radius = zoom * Math.min(x, y)
    const offset = cast(spread, -1, 1, Q, 0)
    const [s1, e1, s2, e2] = Array.from({
      length: 2 * 2,
    }).map((_, i) => {
      const shift = Math.random() >= bend ? 0 : rand(Q / 2, -Q / 2)
      const q = i * Q
      const j = i % 2 ? Q - 2 * offset : 0
      const d = offset + j + q + shift
      return rad(d)
    })
    Object.entries(styles).forEach(([k, v]) => {
      context[k] = v
    })
    context.translate(x, y)
    context.rotate(rad(rotate))
    context.beginPath()
    context.arc(0, 0, radius, s1, e1)
    context.stroke()
    context.fill()
    context.beginPath()
    context.arc(0, 0, radius, s2, e2)
    context.stroke()
    context.fill()
  }
}
registerPaint("quad", QuadPainter)
registerPaint("arc", ArcPainter)
export { QuadPainter as QuadPainter }
export { ArcPainter as ArcPainter }
