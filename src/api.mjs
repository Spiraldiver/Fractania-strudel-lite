// Chainable fractal() API (lite) — hydra-style: every numeric argument accepts
// a plain number, a function (t) => number, or a Strudel pattern/signal
// (queried at scheduler time each frame, like hydra's H()).
//
// Lite surface: 2 variants (Bulb, Power2), 2 transforms (lowres, wobble),
// 1 fold (boxfold), basic + pbr render (pbr default), z-based color.

const RENDER_MODES = { basic: 0, direct: 0, pbr: 1 };

export class FractalChain {
  constructor(engine, variant = 0) {
    this._engine = engine;
    this._spec = {
      variant,
      staticVariant: (typeof variant === 'number') ? variant : null,
      params: { uRenderMode: 1 },   // lite defaults to PBR
      transforms: [], folds: [],
      feedback: 0, chromatic: 0, orbitSpeed: 0, speed: 1,
    };
  }

  _p(name, value) { this._spec.params[name] = value; return this; }
  _v(name, comps) { this._spec.params[name] = comps; return this; }
  _tr(type, ...vecs) {
    if (this._spec.transforms.length >= 6) { console.warn('[fractania] max 6 transforms'); return this; }
    this._spec.transforms.push({ type, vecs }); return this;
  }
  _fd(type, ...vecs) {
    if (this._spec.folds.length >= 6) { console.warn('[fractania] max 6 folds'); return this; }
    this._spec.folds.push({ type, vecs }); return this;
  }

  // ── fractal core ──
  power(v) { return this._p('uPower', v); }
  iterations(v) { return this._p('uIterations', v); }
  bailout(v) { return this._p('uBailout', v); }
  thetashift(v) { return this._p('uThetaShift', v); }
  phishift(v) { return this._p('uPhiShift', v); }
  offset(x = 0, y = 0, z = 0) { return this._v('uOffset', [x, y, z]); }
  scale(v) { return this._p('uScale', v); }
  rotate(x = 0, y = 0, z = 0) { return this._v('uRotateFractal', [x, y, z]); }
  prerotate(x = 0, y = 0, z = 0) { return this._v('uPreRotation', [x, y, z]); }
  translate(x = 0, y = 0, z = 0) { return this._v('uTranslate', [x, y, z]); }

  // ── camera ──
  camera(x = 0, y = 0, z = 4) {
    this._p('uCamMode', 1); this._p('uCamOrbit', 1);
    return this._v('uCamPos', [x, y, z]);
  }
  camrot(x = 0, y = 0, z = 0) {
    this._p('uCamMode', 1); this._p('uCamOrbit', 0);
    return this._v('uCamRot', [x, y, z]);
  }
  fov(v) { return this._p('uFOV', v); }
  zoom(v) { return this._p('uZoom', v); }
  orbit(speed = 0.2) { this._spec.orbitSpeed = speed; return this; }
  dof(aperture = 0.05, focal = 4) {
    this._p('uDofEnabled', 1); this._p('uAperture', aperture);
    return this._p('uFocalDist', focal);
  }

  // ── shading / material ──
  light(x = 4, y = 6, z = -3) { return this._v('uLightPos', [x, y, z]); }
  metallic(v) { return this._p('uMetallic', v); }
  roughness(v) { return this._p('uRoughness', v); }
  reflection(v) { return this._p('uReflection', v); }

  // ── color (z-based) ──
  color(r = 1, g = 1, b = 1, r2, g2, b2) {
    this._p('uUseDiffuseGradient', 1);
    this._v('uDiffColor1', [r, g, b]);
    if (r2 !== undefined) this._v('uDiffColor2', [r2, g2 ?? 0, b2 ?? 0]);
    return this;
  }
  hue(v) { return this._p('uDiffuseHue', v); }
  glow(strength = 1, threshold = 0.25) {
    this._p('uUseEmissionGradient', 2);
    this._p('uSelfIllumination', strength);
    return this._p('uEmissionThreshold', threshold);
  }
  glowcolor(r = 1, g = 0.5, b = 0.1) {
    this._p('uUseEmissionGradient', 2);
    return this._v('uEmColor', [r, g, b]);
  }
  background(r = 0, g = 0, b = 0) { return this._v('uBgColor', [r, g, b]); }

  // ── renderer / march quality ──
  render(mode = 'pbr') {
    const m = (typeof mode === 'string') ? (RENDER_MODES[mode.toLowerCase()] ?? 1) : mode;
    return this._p('uRenderMode', m);
  }
  resolution(w = 1280, h = 720) { this._spec.resolution = [w, h]; return this; }
  epsilon(v) { return this._p('uEpsilon', v); }
  steps(v) { return this._p('uMaxSteps', v); }
  maxdist(v) { return this._p('uMaxDist', v); }

  // ── transform slots (max 6, applied in call order) ──
  lowres(scale = 8, blend = 1) { return this._tr(2, [blend, scale, 0, 0]); }
  wobble(amp = 0.2, freq = 3, phase = 0, gain = 1) {
    return this._tr(4, [amp, freq, phase, amp], [freq, phase, amp, freq], [phase, gain, 0, 0]);
  }

  // ── fold slots (max 6, applied per iteration) ──
  boxfold(limit = 1, blend = 1) { return this._fd(1, [limit, limit, limit, blend]); }

  // ── post (web-side) ──
  feedback(v = 0.9) { this._spec.feedback = v; return this; }
  chromatic(v = 0.01) { this._spec.chromatic = v; return this; }
  speed(v = 1) { this._spec.speed = v; return this; }

  // ── activate ──
  out() { this._engine.setSpec(this._spec); return this; }
}

// linear remap helper: pattern.map(inMin, inMax, outMin, outMax)
export function installPatternMap() {
  const P = globalThis.Pattern;
  if (P && P.prototype && !P.prototype.map) {
    P.prototype.map = function (inMin, inMax, outMin, outMax) {
      return this.fmap((v) => outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin));
    };
  }
}
