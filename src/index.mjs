// Fractania-strudel-lite — Fractania renderer for strudel.cc.
//
// Load with a plain dynamic import; the module boots itself:
//
//   await import('https://spiraldiver.github.io/Fractania-strudel-lite/dist/fractania-strudel-lite.js')
//   fractal("mandelbulb").power(8).out()
//
// Strudel's transpiler does not rewrite import expressions, so this is ordinary
// JavaScript. Note the SINGLE quotes: a double-quoted string would be rewritten
// into mini-notation and a URL is not valid mini-notation.
// https://github.com/Spiraldiver/Fractania-strudel   License: AGPL-3.0
import { FractaniaRenderer, variantIndex, VARIANT_NAMES } from './engine.mjs';
import { FractalChain, installPatternMap } from './api.mjs';

let engine = null;
let latestOptions = null;

const CANVAS_ID = 'fractania-canvas';

// clone of @strudel/draw getDrawContext() canvas handling so the fractal
// canvas behaves exactly like hydra's on strudel.cc
function ensureCanvas(pixelRatio, pixelated) {
  let canvas = document.getElementById(CANVAS_ID);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = CANVAS_ID;
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style = 'pointer-events:none;width:100%;height:100%;position:fixed;top:0;left:0';
    if (pixelated) canvas.style.imageRendering = 'pixelated';
    document.body.prepend(canvas);
  }
  return canvas;
}

function boot(canvas, options) {
  engine = new FractaniaRenderer({ canvas, ...options });
  globalThis.fractaniaRenderer = engine;
  installGlobals();
  return engine;
}

export async function initFractania(options = {}) {
  // reset if options changed since last init (mirrors initHydra)
  if (latestOptions && JSON.stringify(latestOptions) !== JSON.stringify(options)) {
    clearFractania();
  }
  latestOptions = options;
  if (!engine) {
    const { pixelRatio = 0.75, pixelated = true, canvas: userCanvas, ...rest } = options;
    if (rest.detectAudio) console.warn('[fractania] detectAudio not implemented yet — drive params with strudel signals instead');
    if (rest.feedStrudel) console.warn('[fractania] feedStrudel not implemented yet');
    const canvas = userCanvas || ensureCanvas(pixelRatio, pixelated);
    boot(canvas, { pixelRatio, fps: rest.fps ?? 0 });
  }
  return engine;
}

export function clearFractania() {
  if (engine) { engine.destroy(); engine = null; }
  document.getElementById(CANVAS_ID)?.remove();
  latestOptions = null;
}

// explicit Pattern → per-frame function bridge (identical to @strudel/hydra H;
// rarely needed since every fractal() argument accepts patterns directly)
export const F = (p) => () => {
  const t = (typeof globalThis.getTime === 'function') ? globalThis.getTime() : performance.now() / 1000;
  const haps = p.queryArc(t, t);
  return haps && haps.length ? haps[haps.length - 1].value : undefined;
};

const PATTERN_CHARS = /[<>\s*[\]~{}!@|]/;

export function fractal(variant = 0) {
  if (!engine) throw new Error('[fractania] call `await initFractania()` first');
  let v = variant;
  let staticIdx = null;
  if (typeof v === 'number') staticIdx = variantIndex(v);
  else if (typeof v === 'string') {
    if (PATTERN_CHARS.test(v.trim()) && typeof globalThis.mini === 'function') {
      v = globalThis.mini(v); // mini-notation → pattern of variant strings
    } else {
      staticIdx = variantIndex(v);
    }
  }
  const chain = new FractalChain(engine, v);
  chain._spec.staticVariant = staticIdx;
  return chain;
}

function installGlobals() {
  installPatternMap();
  globalThis.fractal = fractal;
  globalThis.fractania = fractal;
  globalThis.initFractania = initFractania;
  globalThis.clearFractania = clearFractania;
  if (!globalThis.F) globalThis.F = F;
}

// ── Hydra-masquerade bootstrap ──
// strudel's built-in initHydra({ src }) imports ANY url and then calls
// `new Hydra({ canvas, ... })`. Exporting a Hydra-compatible class means
// fractania runs on strudel.cc today with zero strudel changes:
//   await initHydra({ src: 'https://cdn.jsdelivr.net/gh/Spiraldiver/fractania-engine@main/dist/fractania-engine.js' })
class FractaniaAsHydra {
  constructor(config = {}) {
    const { canvas, ...rest } = config;
    if (engine) engine.destroy();
    let target = null;
    if (canvas) {
      // strudel's initHydra binds a WebGL1 context to its canvas via
      // getDrawContext(contextType:'webgl') BEFORE constructing us — and a
      // canvas can only hold one context type. Probe with the same attrs
      // FractaniaRenderer uses; on failure keep the hydra canvas as initHydra's
      // idempotence guard (hidden) and render on our own canvas instead.
      const gl2 = canvas.getContext('webgl2', {
        alpha: true, antialias: false, premultipliedAlpha: false,
        preserveDrawingBuffer: false, powerPreference: 'high-performance',
      });
      if (gl2) target = canvas;
      else if (canvas.id === 'hydra-canvas') canvas.style.display = 'none';
    }
    // strudel's initHydra consumes its own pixelRatio option, but unknown
    // keys pass through to the constructor config — so `pixelratio` (lower
    // case) and `fps` give a render-quality/heat control through the
    // masquerade: initHydra({ src, pixelratio: 0.4, fps: 24 })
    const pr = rest.pixelRatio ?? rest.pixelratio ?? 0.75;
    boot(target || ensureCanvas(pr, true), { pixelRatio: pr, fps: rest.fps ?? 0 });
  }
  hush() { engine?.hush(); }
}

// Backwards compatibility only. Earlier versions were loaded through strudel's
// initHydra({src}), which imports a url and then calls `new Hydra()`. That path
// still works, but the global is now claimed ONLY when nothing else owns it —
// claiming it unconditionally broke real Hydra for anyone who loaded this
// bundle alongside it.
if (typeof globalThis.Hydra === 'undefined') globalThis.Hydra = FractaniaAsHydra;

globalThis.fractal = fractal;
globalThis.fractania = fractal;
globalThis.initFractania = initFractania;
globalThis.clearFractania = clearFractania;
if (!globalThis.F) globalThis.F = F;

// Self-boot on import: importing IS the setup, so no initFractania() call is
// needed. Guarded so a second import does not tear down a running engine.
if (!globalThis.__fractaniaLoaded) {
  globalThis.__fractaniaLoaded = true;
  await initFractania();
}

export { FractaniaRenderer, FractalChain, VARIANT_NAMES, FractaniaAsHydra };
