'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const TAU = 2 * Math.PI;

const RAD = 360 / TAU;
const DEG = TAU / 360;

// Convert radians to degrees
const deg = x => x * RAD;

// Convert degrees to radians
const rad = x => x * DEG;

// Linear interpolator
const lerp = (v, x1 = 0, x2 = 1) => x1 + ((x2 - x1) * v);

// Normalize values between 0 and 1
const norm = (v, x1 = 0, x2 = 1) => (v - x1) / (x2 - x1);

// Translate values from one coordinate space to another
const cast = (v, x1, x2, y1, y2) => lerp(norm(v, x1, x2), y1, y2);

// Get random integer in range, hi exclusive, lo inclusive
const rand = (hi = 0, lo = 0) => Math.floor((Math.random() * (hi - lo))) + lo;

/**
 * Helps covert from polar
 * @module poltocar
 * @param {Number} t - Angle (theta)
 * @param {Number} r - Radius
 * @returns {Object} - Vector like
 * @example
 * poltocar(Math.PI);
 */
const poltocar = (t = 0, r = 1) => ({
  x: r * Math.cos(t),
  y: r * Math.sin(t)
});

// Ninety, must've really thought about this!
const Q = deg(TAU * 0.25);

// Stuck with CSS custom properties for now
const INPUT_PROPERTIES = [
  'bend',
  'fill-style',
  'greedy',
  'line-width',
  'rotate',
  'zoom',
  'spread',
  'stroke-style'
].map(p => `--cell-${p}`);

const lookup = (map, options = {
  // Defaults exposed
  bend: 0,
  rotate: 0,
  spread: 0,
  zoom: 1
}) => {
  // Attempt at parsing key from style property map
  const get = k => map.has(k) && map.get(k).toString().trim();

  // Marks if circumcircle is internal or external to host element
  options.greedy = !!get('--cell-greedy');

  // Styles `undefined` by default
  options.styles = {};

  // Controls likelihood each vertex is randomly placed along circumcircle (0, 1)
  const bend = get('--cell-bend');

  if (bend) {
    options.bend = parseFloat(bend);
  }

  // In degrees
  const rotate = get('--cell-rotate');

  if (rotate) {
    options.rotate = parseFloat(rotate);
  }

  // Controls shape collapse / expand
  const spread = get('--cell-spread');

  if (spread) {
    options.spread = spread;
  }

  // In-geometry scaling
  const zoom = get('--cell-zoom');

  if (zoom) {
    options.zoom = parseFloat(zoom);
  }

  const fillStyle = get('--cell-fill-style');

  if (fillStyle) {
    options.styles.fillStyle = fillStyle;
  }

  const strokeStyle = get('--cell-stroke-style');

  if (strokeStyle) {
    options.styles.strokeStyle = strokeStyle;
  }

  const lineWidth = get('--cell-line-width');

  if (lineWidth) {
    options.styles.lineWidth = parseFloat(lineWidth);
  }

  return options
};

class QuadPainter {
  static get inputProperties() {
    return INPUT_PROPERTIES
  }

  // Conventiently automatically called after `window.onresize`
  paint(context, geometry, properties) {
    const { bend, zoom, spread, rotate, styles, greedy } = lookup(properties);
    const { width: w, height: h } = geometry;

    // Base on host diagonal if greedy
    const radius = zoom * (greedy ? Math.sqrt(2 * Math.pow(Math.max(w, h), 2)) : Math.min(w, h)) / 2;
    const offset = cast(spread, -1, 1, 0, Q);

    // Drawing context related options
    Object.entries(styles).forEach(([k, v]) => {
      context[k] = v;
    });

    // Move origin to geometry center, rotate and start drawing
    context.translate(w / 2, h / 2);

    // Add to rotation when bend is high
    const limit = bend * Q * 2;
    const twist = rand(-limit, limit);

    context.rotate(rad(rotate + twist));
    context.beginPath();

    // Lay out vertices, anticlockwise from top right quadrant
    Array.from({ length: 2 * 2 })
      .map((_, i) => {
        const shift = Math.random() >= bend ? 0 : rand(0, Q - offset);
        const q = i * Q;
        const j = i % 2 ? (Q - (2 * offset)) : 0;
        const d = offset + j + q + shift;

        return poltocar(rad(d), radius)
      })
      .forEach(({ x, y }) => {
        context.lineTo(x, y);
      });

    context.closePath();
    context.stroke();
    context.fill();
  }
}

class ArcPainter {
  static get inputProperties() {
    return INPUT_PROPERTIES
  }

  paint(context, geometry, properties) {
    const { bend, zoom, spread, rotate, styles } = lookup(properties);
    const { width: w, height: h } = geometry;

    // Origin: host center
    const x = w / 2;
    const y = h / 2;

    const radius = zoom * Math.min(x, y);
    const offset = cast(spread, -1, 1, Q, 0);

    // Start, end angles for the couple of arcs
    const [s1, e1, s2, e2] = Array.from({ length: 2 * 2 })
      .map((_, i) => {
        const shift = Math.random() >= bend ? 0 : rand(Q / 2, -Q / 2);
        const q = i * Q;
        const j = i % 2 ? (Q - (2 * offset)) : 0;
        const d = offset + j + q + shift;

        return rad(d)
      });

    Object.entries(styles).forEach(([k, v]) => {
      context[k] = v;
    });

    context.translate(x, y);
    context.rotate(rad(rotate));
    context.beginPath();
    context.arc(0, 0, radius, s1, e1);
    context.stroke();
    context.fill();
    context.beginPath();
    context.arc(0, 0, radius, s2, e2);
    context.stroke();
    context.fill();
  }
}

registerPaint('quad', QuadPainter);
registerPaint('arc', ArcPainter);

exports.ArcPainter = ArcPainter;
exports.QuadPainter = QuadPainter;
