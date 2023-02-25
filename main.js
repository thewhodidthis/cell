import { cast, rand } from "https://thewhodidthis.github.io/arithmetics/main.js"
import { poltocar, deg, rad, TAU } from "https://thewhodidthis.github.io/geometrics/main.js"

// Ninety, must've really thought about this!
const Q = deg(TAU * 0.25)

// Stuck with CSS custom properties for now.
const INPUT_PROPERTIES = [
  "bend",
  "fill-style",
  "greedy",
  "line-width",
  "rotate",
  "zoom",
  "spread",
  "stroke-style",
].map(p => `--cell-${p}`)

const lookup = (map, options = {
  // Controls likelihood each vertex is randomly placed along circumcircle (0.0, 1.0).
  bend: 0,
  // In degrees
  rotate: 0,
  // Controls shape collapse / expand (-1.0, 1.0).
  spread: 0,
  // In-geometry scaling (0.0, f)
  zoom: 1,
}) => {
  // Helps access the styles property map.
  const get = k => map.has(k) && map.get(k).toString().trim()

  // Marks if circumcircle is internal or external to host element.
  options.greedy = !!get("--cell-greedy")

  // Styles are `undefined` by default.
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

export class QuadPainter {
  static get inputProperties() {
    return INPUT_PROPERTIES
  }
  // Conventiently automatically called when geometry changes.
  paint(context, geometry, properties) {
    const { bend, zoom, spread, rotate, styles, greedy } = lookup(properties)
    const { width: w, height: h } = geometry

    // Base on host diagonal if greedy.
    const radius = zoom * (greedy ? Math.sqrt(2 * Math.pow(Math.max(w, h), 2)) : Math.min(w, h)) / 2
    const offset = cast(spread, -1, 1, 0, Q)

    // Set drawing context related options.
    Object.entries(styles).forEach(([k, v]) => {
      context[k] = v
    })

    // Move origin to geometry center, rotate and start drawing.
    context.translate(w / 2, h / 2)

    // Add to rotation when bend is high.
    const limit = bend * Q * 2
    const twist = rand(-limit, limit)

    context.rotate(rad(rotate + twist))
    context.beginPath()

    // Lay out vertices, anti-clockwise from the top right quadrant.
    Array.from({ length: 2 * 2 })
      .map((_, i) => {
        const shift = Math.random() >= bend ? 0 : rand(0, Q - offset)
        const q = i * Q
        const j = i % 2 ? (Q - (2 * offset)) : 0
        const d = offset + j + q + shift

        return poltocar(rad(d), radius)
      })
      .forEach(({ x, y }) => {
        context.lineTo(x, y)
      })

    context.closePath()
    context.stroke()
    context.fill()
  }
}

export class ArcPainter {
  static get inputProperties() {
    return INPUT_PROPERTIES
  }
  paint(context, geometry, properties) {
    const { bend, zoom, spread, rotate, styles } = lookup(properties)
    const { width: w, height: h } = geometry

    // Origin: host center
    const x = w / 2
    const y = h / 2

    const radius = zoom * Math.min(x, y)
    const offset = cast(spread, -1, 1, Q, 0)

    // Calculate start, end angles for the couple of arcs.
    const [s1, e1, s2, e2] = Array.from({ length: 2 * 2 })
      .map((_, i) => {
        const shift = Math.random() >= bend ? 0 : rand(Q / 2, -Q / 2)
        const q = i * Q
        const j = i % 2 ? (Q - (2 * offset)) : 0
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
