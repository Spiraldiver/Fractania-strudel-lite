// FractaniaRenderer — WebGL2 renderer for the Fractania Mandelbulb family.
import {
  PREAMBLE, STUBS, FORMULA_UNIFORMS, MAIN, MAIN_PT, VARIANTS, VARIANT_NAMES,
  TRANSFORM_SNIPPETS, FOLD_SNIPPETS,
} from './generated/glsl.mjs';

// Compose a transform/fold dispatcher containing ONLY the used type ids —
// an all-types dispatcher inlined into every fractal_sdf call site never
// finishes compiling on ANGLE/D3D.
function composeDispatcher(transformTypes, foldTypes) {
  let src = '\nvec3 applySlotTransform(vec3 z, int tp, int vi, vec4 A, vec4 B, vec4 C, vec4 D, vec4 E, vec4 F) {\n';
  for (const t of transformTypes) {
    if (TRANSFORM_SNIPPETS[t]) src += `  if (tp == ${t}) {\n${TRANSFORM_SNIPPETS[t]}\n  }\n`;
  }
  src += '  return z;\n}\n';
  src += 'vec3 DE_applyTransforms(vec3 z) {\n';
  for (let s = 0; s < 6; s++) {
    src += `  z = applySlotTransform(z, int(uSlot${s}Type), int(uSlot${s}Vi), uSlot${s}A, uSlot${s}B, uSlot${s}C, uSlot${s}D, uSlot${s}E, uSlot${s}F);\n`;
  }
  src += '  return z;\n}\n';
  src += 'void applySlotFold(inout vec3 z, inout float dr, int tp, int vi, vec4 A, vec4 B) {\n  if (tp == 0) return;\n';
  for (const t of foldTypes) {
    if (FOLD_SNIPPETS[t]) src += `  if (tp == ${t}) {\n${FOLD_SNIPPETS[t]}\n  }\n`;
  }
  src += '}\n';
  src += 'void DE_applyFolds(inout vec3 z, inout float dr) {\n';
  for (let s = 0; s < 6; s++) {
    src += `  applySlotFold(z, dr, int(uFold${s}Type), int(uFold${s}Vi), uFold${s}A, uFold${s}B);\n`;
  }
  src += '}\n';
  return src;
}

const HEADER = `#version 300 es
precision highp float;
precision highp int;
#define outputSwizzle(v) (v)
uniform sampler2D uDiffuseTex;
uniform sampler2D uEmissionTex;
`;

const QUAD_VERT = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const COMPOSITE_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform sampler2D uPrev;
uniform float uFeedbackAmt;
in vec2 vUv;
out vec4 o;
void main() {
  vec4 s = texture(uScene, vUv);
  // decay floor guarantees trails fade fully to black instead of ghosting
  vec3 p = max(texture(uPrev, vUv).rgb * uFeedbackAmt - 0.004, 0.0);
  vec3 col = max(s.rgb, p);
  float a = max(s.a, min(1.0, (p.r + p.g + p.b) * 10.0));
  o = vec4(col, a);
}`;

const DISPLAY_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform float uChroma;
uniform vec2 uCover; // aspect-preserving cover-crop scale (1,1 = no-op)
in vec2 vUv;
out vec4 o;
void main() {
  vec2 cUv = 0.5 + (vUv - 0.5) * uCover;
  vec2 d = (cUv - 0.5) * uChroma;
  float r = texture(uTex, cUv + d).r;
  float g = texture(uTex, cUv).g;
  float b = texture(uTex, cUv - d).b;
  float a = texture(uTex, cUv).a;
  o = vec4(r, g, b, a);
}`;

// Defaults for every uniform; march/scene values are tuned so a fullscreen
// raymarch coexists with the strudel audio thread.
const WEB_DEFAULTS = {
  uIterations: 12, uBailout: 16.0, uPower: 8.0,
  uThetaShift: 0, uPhiShift: 0,
  uOffset: [0, 0, 0], uScale: 1.0, uZRadius: 1.0, uTranslate: [0, 0, 0],
  uPreRotation: [0, 0, 0], uRotateFractal: [0, 0, 0],
  uFamOffset: [0.4, 0, 0], uFamA: 0, uFamB: 0, uFamC: 0, uFamD: 0,
  uFamI: 0, uFamRot: 0,
  uMengerScale: 3.0, uMengerOffset: [1, 1, 1],
  uMBScale: 2.0, uMinRad2: 0.25, uABScale: 1.5,
  uZoom: 1.0, uFOV: 45.0,
  uCamMode: 1, uCamPos: [1.6, 1.0, 3.5], uCamRot: [0, 0, 0], uCamOrbit: 1,
  uDofEnabled: 0, uAperture: 0.01, uFocalDist: 4.0,
  UseEquirectangularCamera: 0, EquirectangularFOV: 6.2831853, EquirectangularBlend: 1,
  uLightPos: [-5, 4, 3],
  uAoStrength: 1.0, uAoSteps: 4,
  uGradientMode: 2, uDiffuseHue: 0.5,
  uDiffOrbitMethod: 3, uEmOrbitMethod: 3,
  uDiffMinIter: 0, uDiffMaxIter: 0, uEmMinIter: 0, uEmMaxIter: 0,
  uBgColor: [0, 0, 0], uBlackFill: 0,
  uDiffusePeriod: 3.0, uDiffuseOffset: 0.0,
  uEmissionHue: 0.5, uEmissionPeriod: 3.0, uEmissionOffset: 0.0,
  uEmissionThreshold: 0.25, uSelfIllumination: 1.0,
  uDiffColor1: [1, 1, 1], uDiffColor2: [0.2, 0.2, 0.2], uEmColor: [1.0, 0.5, 0.1],
  uUseDiffuseGradient: 0, uUseEmissionGradient: 0,
  uEpsilon: 0.0005, uMaxSteps: 256, uMaxDist: 100.0,
  uRenderMode: 0,
  uShadowSoft: 16.0, uShadowSteps: 32,
  uDiffuseStr: 1.0, uSpecularStr: 0.3,
  uReflection: 0.0, uMetallic: 0.0, uRoughness: 0.5,
  uPTBounces: 2, uPTGIStr: 0.5, uPTEmMult: 1.0,
  uTaaSamples: 1,
  uSoftness: 0.02,
  uCompEnabled: 0, uCompScale: 1, uCompTranslate: [0, 0], uCompRotate: 0, uCompAlpha: 1,
  uMouse: [0, 0, 0, 0],
  uSlot0Type: 0, uSlot1Type: 0, uSlot2Type: 0, uSlot3Type: 0, uSlot4Type: 0, uSlot5Type: 0,
  uFold0Type: 0, uFold1Type: 0, uFold2Type: 0, uFold3Type: 0, uFold4Type: 0, uFold5Type: 0,
};

// value | function(t) | strudel Pattern → number (queried at scheduler time)
export function resolveValue(v, t) {
  try {
    if (typeof v === 'function') return resolveValue(v(t), t);
    if (v && typeof v.queryArc === 'function') {
      let qt = t;
      try {
        if (typeof globalThis.getTime === 'function') {
          const st = globalThis.getTime();
          // strudel's clock returns null/NaN until the scheduler starts —
          // querying with that would blow up inside Fraction parsing
          if (typeof st === 'number' && Number.isFinite(st)) qt = st;
        }
      } catch (e) { /* fall back to render clock */ }
      const haps = v.queryArc(qt, qt);
      const val = haps && haps.length ? haps[haps.length - 1].value : undefined;
      return resolveValue(val, t);
    }
    return v;
  } catch (e) {
    return undefined; // param falls back to its default this frame
  }
}

export function variantIndex(v) {
  if (typeof v === 'number') return Math.max(0, Math.min(VARIANT_NAMES.length - 1, v | 0));
  if (typeof v !== 'string') return 0;
  let s = v.trim().toLowerCase();
  // "mandelbulb", "mandelbulb:3", "mandelbulb:kali", "kali", "3"
  const colon = s.lastIndexOf(':');
  if (colon >= 0) s = s.slice(colon + 1);
  else if (s === 'mandelbulb' || s === 'fractal' || s === '') return 0;
  const n = Number(s);
  if (!Number.isNaN(n)) return Math.max(0, Math.min(VARIANT_NAMES.length - 1, n | 0));
  const idx = VARIANT_NAMES.findIndex((name) => name.toLowerCase() === s);
  if (idx >= 0) return idx;
  const aliases = { bulb: 0, abs: 1, atan2: 2, julia: 3, kali: 4, pow2: 5, sincos: 6, quat: 7 };
  return aliases[s] ?? 0;
}

export class FractaniaRenderer {
  constructor(config = {}) {
    const { canvas, pixelRatio = 0.75, fps = 0 } = config;
    if (!canvas) throw new Error('[fractania] FractaniaRenderer needs a { canvas }');
    this.canvas = canvas;
    this.pixelRatio = pixelRatio;
    this.fps = fps; // 0 = uncapped (rAF rate); >0 throttles renders
    this._lastRender = 0;
    const gl = canvas.getContext('webgl2', {
      alpha: true, antialias: false, premultipliedAlpha: false,
      preserveDrawingBuffer: false, powerPreference: 'high-performance',
    });
    if (!gl) {
      throw new Error('[fractania] could not get a WebGL2 context — if this canvas already holds a different context type (e.g. hydra\'s WebGL1), pass a fresh canvas or let initFractania() create one');
    }
    this.gl = gl;
    this.spec = null;
    this.programs = {};        // variant index -> {prog, uniforms}
    this._passes = {
      composite: this._buildPass(COMPOSITE_FRAG),
      display: this._buildPass(DISPLAY_FRAG),
    };
    this._fbos = null;
    this._dummyTex = this._makeTex(1, 1, new Uint8Array([255, 255, 255, 255]));
    this._t0 = performance.now();
    this._speed = 1;
    this._orbit = { az: 0, el: 0, dragging: false, lastX: 0, lastY: 0 };
    this._installMouse();
    this._raf = 0;
    this._running = true;
    this._errStreak = 0;
    const loop = () => {
      if (!this._running) return;
      const now = performance.now();
      if (!this.fps || now - this._lastRender >= 1000 / this.fps) {
        this._lastRender = now;
        try {
          this._frame();
          this._errStreak = 0;
        } catch (e) {
          // never let one bad frame kill the visuals — log, skip, keep going
          if (this._errStreak === 0) console.error('[fractania] frame error (loop continues):', e);
          if (++this._errStreak > 300) { console.error('[fractania] 300 consecutive frame errors — stopping'); this._running = false; }
        }
      }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  // ── public ──
  setSpec(spec) {
    this.spec = spec;
    if (spec && spec.staticVariant != null) {
      const mode = (typeof spec.params.uRenderMode === 'number') ? spec.params.uRenderMode : 0;
      this._ensureProgram(spec.staticVariant, this._slotKey(spec), mode === 2);
    }
  }

  // "t3.f1" = transform types 3 + fold types 1 in use; '' = stubs (fast path)
  _slotKey(spec) {
    if (!spec) return '';
    const tt = [...new Set((spec.transforms || []).map((x) => x.type))].sort((a, b) => a - b);
    const ft = [...new Set((spec.folds || []).map((x) => x.type))].sort((a, b) => a - b);
    if (!tt.length && !ft.length) return '';
    return `t${tt.join('.')}_f${ft.join('.')}`;
  }

  hush() { this.spec = null; }

  // Render one frame and read it back from the feedback FBO (which retains
  // its contents, unlike the default framebuffer). Used for testing.
  probe() {
    this._frame();
    const gl = this.gl;
    const f = this._fbos;
    if (!f) return null;
    const latest = f[f.prev]; // after _frame's swap, prev = just-rendered
    gl.bindFramebuffer(gl.FRAMEBUFFER, latest.fbo);
    const { w, h } = f;
    const px = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    let nz = 0, sum = 0;
    for (let i = 0; i < px.length; i += 4) {
      const l = px[i] + px[i + 1] + px[i + 2];
      sum += l; if (l > 10) nz++;
    }
    const ci = (((h >> 1) * w) + (w >> 1)) * 4;
    return {
      w, h, nonzero: nz, total: w * h,
      avg: sum / (w * h),
      center: [px[ci], px[ci + 1], px[ci + 2], px[ci + 3]],
      pixels: px,
    };
  }

  destroy() {
    this._running = false;
    cancelAnimationFrame(this._raf);
    this._removeMouse?.();
  }

  // ── shader plumbing ──
  _compile(type, src) {
    const gl = this.gl;
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh);
      const numbered = src.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n');
      console.error('[fractania] shader compile failed:\n' + log + '\n' + numbered.slice(0, 4000));
      throw new Error('[fractania] shader compile failed: ' + log.split('\n')[0]);
    }
    return sh;
  }

  _link(fragSrc) {
    const gl = this.gl;
    const prog = gl.createProgram();
    gl.attachShader(prog, this._compile(gl.VERTEX_SHADER, QUAD_VERT));
    gl.attachShader(prog, this._compile(gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error('[fractania] program link failed: ' + gl.getProgramInfoLog(prog));
    }
    const uniforms = {};
    const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(prog, i);
      const name = info.name.replace(/\[0\]$/, '');
      uniforms[name] = { loc: gl.getUniformLocation(prog, info.name), type: info.type };
    }
    return { prog, uniforms };
  }

  _buildPass(fragSrc) { return this._link(fragSrc); }

  // Tiered builds: the default build glues in the no-op transform/fold stubs
  // and compiles fast everywhere; chains that use slot commands get a
  // dispatcher composed with ONLY their types.
  _ensureProgram(idx, slotKey = '', pt = false) {
    const key = `${idx}:${slotKey || 'lite'}:${pt ? 'pt' : 'std'}`;
    if (!this.programs[key]) {
      const name = VARIANT_NAMES[idx];
      let dispatcher = STUBS;
      if (slotKey) {
        const spec = this.spec;
        const tt = [...new Set((spec?.transforms || []).map((x) => x.type))];
        const ft = [...new Set((spec?.folds || []).map((x) => x.type))];
        dispatcher = composeDispatcher(tt, ft);
      }
      const src = HEADER + PREAMBLE + dispatcher
        + FORMULA_UNIFORMS + VARIANTS[name] + (pt ? MAIN_PT : MAIN);
      const t0 = performance.now();
      this.programs[key] = this._link(src);
      const dt = performance.now() - t0;
      if (dt > 500) console.log(`[fractania] compiled ${name} (${key}) in ${(dt / 1000).toFixed(1)}s`);
    }
    return this.programs[key];
  }

  _makeTex(w, h, data = null) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }

  _ensureFbos(w, h) {
    const gl = this.gl;
    if (this._fbos && this._fbos.w === w && this._fbos.h === h) return this._fbos;
    if (this._fbos) {
      for (const k of ['scene', 'a', 'b']) {
        gl.deleteTexture(this._fbos[k].tex);
        gl.deleteFramebuffer(this._fbos[k].fbo);
      }
    }
    const make = () => {
      const tex = this._makeTex(w, h);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { tex, fbo };
    };
    this._fbos = { w, h, scene: make(), a: make(), b: make(), prev: 'a', curr: 'b' };
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return this._fbos;
  }

  // ── uniform application ──
  _apply(pass, vals) {
    const gl = this.gl;
    for (const name in pass.uniforms) {
      const u = pass.uniforms[name];
      if (u.type === gl.SAMPLER_2D) continue; // bound explicitly per pass
      let v = vals[name];
      if (v === undefined) continue;
      switch (u.type) {
        case gl.FLOAT: gl.uniform1f(u.loc, Number(v) || 0); break;
        case gl.INT:
        case gl.BOOL: gl.uniform1i(u.loc, Number(v) | 0); break;
        case gl.FLOAT_VEC2: gl.uniform2f(u.loc, Number(v[0]) || 0, Number(v[1]) || 0); break;
        case gl.FLOAT_VEC3: gl.uniform3f(u.loc, Number(v[0]) || 0, Number(v[1]) || 0, Number(v[2]) || 0); break;
        case gl.FLOAT_VEC4: gl.uniform4f(u.loc, Number(v[0]) || 0, Number(v[1]) || 0, Number(v[2]) || 0, Number(v[3]) || 0); break;
        default: break;
      }
    }
  }

  // ── mouse orbit (Alt+drag anywhere; canvas has pointer-events:none) ──
  _installMouse() {
    const down = (e) => {
      if (!e.altKey) return;
      this._orbit.dragging = true;
      this._orbit.lastX = e.clientX; this._orbit.lastY = e.clientY;
      e.preventDefault();
    };
    const move = (e) => {
      if (!this._orbit.dragging) return;
      const dx = (e.clientX - this._orbit.lastX) / window.innerWidth;
      const dy = (e.clientY - this._orbit.lastY) / window.innerHeight;
      this._orbit.az += dx * Math.PI * 2.0;
      this._orbit.el = Math.max(-1.55, Math.min(1.55, this._orbit.el + dy * Math.PI));
      this._orbit.lastX = e.clientX; this._orbit.lastY = e.clientY;
    };
    const up = () => { this._orbit.dragging = false; };
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    this._removeMouse = () => {
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }

  // ── per-frame ──
  _frame() {
    const gl = this.gl;
    const canvas = this.canvas;
    const spec = this.spec;
    const t = spec ? ((performance.now() - this._t0) / 1000) * (resolveValue(spec.speed, 0) ?? 1) : 0;

    // backing-store size: .resolution(w,h) wins; else viewport * pixelRatio
    let cw, ch;
    if (spec && spec.resolution) {
      cw = Math.max(8, Math.min(4096, Math.round(resolveValue(spec.resolution[0], t) || 1280)));
      ch = Math.max(8, Math.min(4096, Math.round(resolveValue(spec.resolution[1], t) || 720)));
    } else {
      cw = Math.max(8, Math.round((canvas.clientWidth || window.innerWidth) * this.pixelRatio));
      ch = Math.max(8, Math.round((canvas.clientHeight || window.innerHeight) * this.pixelRatio));
    }
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }

    if (!spec) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, cw, ch);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }

    // resolve all uniform values: defaults ← spec params
    const vals = { ...WEB_DEFAULTS };
    vals.iTime = t;
    vals.iResolution = [cw, ch];
    for (const name in spec.params) {
      const raw = spec.params[name];
      if (Array.isArray(raw)) {
        const def = vals[name];
        vals[name] = raw.map((c, i) => {
          const rv = resolveValue(c, t);
          return rv === undefined ? (Array.isArray(def) ? def[i] : 0) : rv;
        });
      } else {
        const rv = resolveValue(raw, t);
        if (rv !== undefined) vals[name] = rv; // failed query → keep default
      }
    }

    // resolve variant + program (path-tracer mode uses its own program tier)
    const vIdx = variantIndex(resolveValue(spec.variant, t));
    const pass = this._ensureProgram(vIdx, this._slotKey(spec), (vals.uRenderMode | 0) === 2);

    // transform / fold slots
    const slotLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    (spec.transforms || []).slice(0, 6).forEach((tr, i) => {
      vals[`uSlot${i}Type`] = tr.type;
      (tr.vecs || []).forEach((vec, j) => {
        vals[`uSlot${i}${slotLetters[j]}`] = vec.map((c) => resolveValue(c, t));
      });
    });
    (spec.folds || []).slice(0, 6).forEach((fd, i) => {
      vals[`uFold${i}Type`] = fd.type;
      (fd.vecs || []).forEach((vec, j) => {
        vals[`uFold${i}${slotLetters[j]}`] = vec.map((c) => resolveValue(c, t));
      });
    });

    // JS-side persistent orbit: mouse drag + .orbit(speed) rotate the eye
    const orbitSpeed = resolveValue(spec.orbitSpeed, t) || 0;
    const az = this._orbit.az + orbitSpeed * t;
    const el = this._orbit.el;
    if (az !== 0 || el !== 0) {
      const p = vals.uCamPos;
      const r = Math.max(1e-4, Math.hypot(p[0], p[1], p[2]));
      const az0 = Math.atan2(p[0], p[2]);
      const el0 = Math.asin(Math.max(-1, Math.min(1, p[1] / r)));
      const a = az0 + az;
      const e = Math.max(-1.55, Math.min(1.55, el0 + el));
      vals.uCamPos = [r * Math.sin(a) * Math.cos(e), r * Math.sin(e), r * Math.cos(a) * Math.cos(e)];
    }

    const fbos = this._ensureFbos(cw, ch);

    // pass 1: fractal → scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.scene.fbo);
    gl.viewport(0, 0, cw, ch);
    gl.disable(gl.BLEND);
    gl.useProgram(pass.prog);
    this._apply(pass, vals);
    if (pass.uniforms.uDiffuseTex) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this._paletteTex || this._dummyTex);
      gl.uniform1i(pass.uniforms.uDiffuseTex.loc, 0);
    }
    if (pass.uniforms.uEmissionTex) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this._emissionTex || this._dummyTex);
      gl.uniform1i(pass.uniforms.uEmissionTex.loc, 1);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // pass 2: composite scene + feedback → curr
    const prev = fbos[fbos.prev];
    const curr = fbos[fbos.curr];
    const comp = this._passes.composite;
    gl.bindFramebuffer(gl.FRAMEBUFFER, curr.fbo);
    gl.useProgram(comp.prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbos.scene.tex);
    gl.uniform1i(comp.uniforms.uScene.loc, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, prev.tex);
    gl.uniform1i(comp.uniforms.uPrev.loc, 1);
    gl.uniform1f(comp.uniforms.uFeedbackAmt.loc,
      Math.max(0, Math.min(0.99, resolveValue(spec.feedback, t) || 0)));
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // pass 3: display curr → canvas (chromatic aberration display-only)
    const disp = this._passes.display;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, cw, ch);
    gl.useProgram(disp.prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, curr.tex);
    gl.uniform1i(disp.uniforms.uTex.loc, 0);
    gl.uniform1f(disp.uniforms.uChroma.loc, resolveValue(spec.chromatic, t) || 0);
    // keep the image undistorted when buffer aspect != window aspect
    // (.resolution() buffers get cover-cropped instead of stretched)
    const dispA = (canvas.clientWidth || window.innerWidth) / Math.max(1, canvas.clientHeight || window.innerHeight);
    const bufA = cw / ch;
    let sx = 1, sy = 1;
    if (dispA > bufA) sy = bufA / dispA; else sx = dispA / bufA;
    gl.uniform2f(disp.uniforms.uCover.loc, sx, sy);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // swap feedback buffers
    const tmp = fbos.prev; fbos.prev = fbos.curr; fbos.curr = tmp;
  }
}

export { VARIANT_NAMES };
