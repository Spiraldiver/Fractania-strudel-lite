# Fractania-strudel-lite

Live-codable 3D fractals for strudel.cc by Spiraldiver

![fractal](test_out/variant_0_Mandelbulb.png)

## Use in strudel.cc

Load with a plain dynamic import — single quotes, or the transpiler reads the
URL as mini-notation. The module boots itself; no `initFractania()` needed.
**Alt+drag** orbits the camera, `clearFractania()` removes the canvas.

### Mandelbulb

```js
// Hold Alt + Click to Rotate
await import('https://spiraldiver.github.io/Fractania-strudel-lite/dist/fractania-strudel-lite.js')
samples('github:Spiraldiver/samples_percs')

setcpm(85/4)
let mod = sine.slow(4)

// breakbeat
$: s("crate_bd ~ ~ crate_sd ~ crate_bd ~ crate_sd").cut(1).gain(0.9)
$: s("hh*8").gain("0.2 0.08 0.14 0.08").lpf(6000).cut(2)
$: s("~ ~ crate_hh ~ ~ ~ crate_hh ~").gain(0.16).lpf(7000).cut(2)
$: s("~ ~ ~ ~ ~ ~ crate_oh ~").cut(2).gain(0.26)
$: s("~ crate_rim ~ ~ ~ ~ ~ crate_rim").gain(0.25)

$: s("sawtooth:2!16")
  .note("<0 -12 0 7 0 1 8 0 -12 0 -12 1 0 7 8 -12>*16")
  .scale("e:phrygian")
  .cutoff(mod.range(500, 4695))
  .resonance(8.72)
  .delay(0.383, 0.8296)

fractal("Mandelbulb")
  .power(8)
  .thetashift(mod.range(-0.5, 0.5))
  .iterations(12)
  .bailout(16)
  .fov(45)
  .roughness(0.4).metallic(0.6)
  .out()
```

### Menger

```js
// Hold Alt + Click to Rotate
await import('https://spiraldiver.github.io/Fractania-strudel-lite/dist/fractania-strudel-lite.js')

setcpm(85/4)
let mod = sine.slow(4)

fractal("Menger")
  .mengerscale(mod.range(2.6, 3.4))
  .mengeroffset(1, 1, 1)
  .iterations(6)
  .color(0.95, 0.55, 0.2, 0.05, 0.15, 0.35)
  .hue(mod.range(0, 0.15))
  .glow(0.6, 0.3)
  .fov(50)
  .orbit(0.08)
  .roughness(0.7).metallic(0.2)
  .out()

$: note("c5 eb5 g5 bb5 g5 eb5 d5 f5 ab5 c6 ab5 f5 eb5 g5 bb5 d6")
  .s("triangle")
  .gain("<0.07 0.1 0.06 0.12>")
  .attack(0.005).decay(0.06).sustain(0).release(0.09)
  .lpf(mod.range(700, 2600))
  .delay(0.45).room(0.35)
```

## Fractals

Selected by name — `fractal("Mandelbulb")`, `fractal("Menger")`. Mini-notation
switches them per cycle: `fractal("<Mandelbulb Menger>")`.

## Commands

Every numeric argument accepts a number, a function `(t) => n`, or a Strudel
pattern/signal.

- **Core** — `.power` `.iterations` `.bailout` `.thetashift` `.phishift` `.offset(x,y,z)` `.scale` `.zradius` `.rotate(x,y,z)` `.prerotate(x,y,z)` `.translate(x,y,z)`
- **Menger only** — `.mengerscale` `.mengeroffset(x,y,z)` — `.power` and `.bailout` do nothing on this variant
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
