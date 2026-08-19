# Fractania-strudel-lite

Live-codable 3D fractals for strudel.cc by Spiraldiver

![fractal](test_out/variant_0_Mandelbulb.png)

## Use in strudel.cc

```js
await import('https://spiraldiver.github.io/Fractania-strudel-lite/dist/fractania-strudel-lite.js')

let mod = sine.slow(4)

$: s("sawtooth:2!16")
  .note("<0 -12 0 7 0 1 8 0 -12 0 -12 1 0 7 8 -12>*16")
  .scale("e:phrygian")
  .cutoff(mod.range(500, 4695))
  .resonance(8.72)
  .delay(0.383, 0.8296)

fractal("Menger")
  .power(mod.range(4, 12))
  .iterations(12)
  .bailout(16)
  .camera(0, 0, 4).fov(45)
  .roughness(0.4).metallic(0.6)
  .out()
```

> **Single quotes matter.** Strudel's transpiler rewrites every double-quoted
> string into mini-notation, and a URL is not valid mini-notation, so
> `import("https://…")` fails with `[mini] parse error … but "/" found`.

Mirrors:

```js
await import('https://cdn.jsdelivr.net/gh/Spiraldiver/Fractania-strudel-lite@main/dist/fractania-strudel-lite.js')
```

> jsDelivr caches `@main` hard and can serve a stale build for hours — GitHub
> Pages is always fresh, and with jsDelivr you should pin a tag.

The module boots itself on import, so no `initFractania()` call is needed.
`clearFractania()`
stops and removes the canvas. **Alt+drag** orbits the camera.

## Fractals

Selected by name — `fractal("Mandelbulb")`, `fractal("Menger")`. Mini-notation
switches them per cycle: `fractal("<Mandelbulb Menger>")`.

## Commands

Every numeric argument accepts a number, a function `(t) => n`, or a Strudel
pattern/signal.

- **Core** — `.power` `.iterations` `.bailout` `.thetashift` `.phishift` `.offset(x,y,z)` `.scale` `.rotate(x,y,z)` `.prerotate(x,y,z)` `.translate(x,y,z)`
- **Camera** — `.camera(x,y,z)` `.camrot(x,y,z)` `.fov` `.zoom` `.orbit(speed)` `.dof(aperture,focal)`
- **Shading** — `.metallic` `.roughness` `.reflection` `.light(x,y,z)`
- **Color** — `.color(r,g,b[,r2,g2,b2])` `.hue` `.glow(strength,threshold)` `.glowcolor(r,g,b)` `.background(r,g,b)`
- **Render** — `.render('basic'|'pbr')` `.resolution(w,h)` `.steps` `.epsilon` `.maxdist`
- **Transforms** — `.lowres(scale,blend)` `.wobble(amp,freq,phase,gain)`
- **Folds** — `.boxfold(limit,blend)`
- **Post** — `.feedback(v)` `.chromatic(v)` `.speed(v)` `.out()`
- **Helpers** — `F(pattern)` · `pattern.map(inMin,inMax,outMin,outMax)` · `initFractania({pixelRatio,fps})` · `clearFractania()`

## License

AGPL-3.0-only.
