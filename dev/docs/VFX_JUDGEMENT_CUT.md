# Judgement Cut VFX: style and method

The Judgement Cut look (Ali's Judgement Cut, the moon cut, Shayan's Full Counter crescent, Getsuga Jujishou) is **not a sprite or a mesh**. It is a full-screen post-process pass that *tears the rendered image open* along straight line segments. This file records exactly how it works so it can be reused, tuned, or rebuilt anywhere. **Do not replace it with sprite VFX.**

## Where it lives

| Piece | File | What it does |
|---|---|---|
| `SlashShader` + `slashPass` | base game (`dev/game.js`, search `const SlashShader`) | The fragment shader and the `ShaderPass` added to the composer after the scene |
| `updateSlashPass(dt)` | base game | Every frame: turns `JC.lines` (and the screen split) into shader uniforms |
| `JC.lines` | base game | Straight cuts: `{x0,y0,x1,y1,t}` in UI pixels (1200×675); `t` counts up from 0 |
| `twGash(o)` + `twArcPts(...)` | `dev/ext/04_vfx.js` | Chains of overlapping segments that follow any screen polyline (crescents, arcs) |
| `shFullCounterFX` | `dev/ext/06b_shayan.js` | Full Counter: two crescents (tall + ground sweep), placed ahead of the swing |

## The idea in one paragraph

Up to 24 line segments (`SLASH_N`) are sent to a screen-space shader. For every pixel the shader measures where it sits relative to each segment (how far along it, and how far to the side). Pixels near a segment are **pushed sideways away from it**, so the background looks sliced and pulled apart. Pixels *inside* the opening show a **void**: dark violet-black space with drifting noise, thin glowing filaments and twinkling star specks. The lips of the cut are **red, going white-hot at the very edge**, with a soft red rim glow outside, and a little **chromatic aberration** (R and B channels offset) where the displacement is strongest. Each cut **draws on** from one end in ~0.07s, then fades.

## Per-segment data (uniforms)

- `L[i] = (x0, y0, x1, y1)`: endpoints in UV (0..1, y up).
- `Q[i] = (W, k, op, seed)`:
  - `W`: half-width as a fraction of screen height (`l.w/UH*.85`, with `l.w` 9–16 px for a normal cut).
  - `k`: reveal 0..1 (how much of the segment has been drawn on: `t/0.07`).
  - `op`: opacity (fades in over 0.05s, then down to 55% with age; ×1.35 while `JC.flash` is on).
  - `seed`: makes every cut's jagged edge and texture different.

## The shader, step by step

For each segment, with `u` = unit direction and `nn` = its normal:

1. **Local coordinates.** `tt = dot(P-a, u)/len` (0..1 along) and `s = dot(P-a, nn)` (signed distance across). Skip pixels past the drawn-on tip (`tt > k`).
2. **Shape.** Width profile `prof = pow(sin(π·tt), 0.5)`: fat in the middle, needle-sharp at both ends. Jagged edges come from two octaves of value noise along the length: `jag = (nz(tt·len·90 + seed·40) − .5)·.7 + (nz(tt·len·340) − .5)·.35`. Final half-width `w = W·prof·op·(1+jag)·tip`, where `tip` softens the drawing-on front.
3. **Tear (displacement).** Every pixel is pushed by `(−nn·side·w·1.1 + u·side·W·op·1.2)·fall`, with `fall = exp(−|s|/(4W))`. That shoves each side away from the cut and slightly along it (a shear), so the image looks sliced, not just painted on.
4. **Inside the gash (|s| < w)** the image is replaced by the void:
   - base `mix(#030008, #520a29, swirl²·1.3)`, where `swirl` is fbm noise scrolling along the cut over time;
   - plus pink filaments `pow(1 − |sin(s/w·7 + fbm·6 + t·3)|, 18)·0.55` in `(0.9, .25, .4)`;
   - plus star specks: a 300×300 hash grid, about 1.8% lit, twinkling;
   - the edge colour `mix(red (1, .1, .2), white (1, .95, .92), smoothstep(.82, .99, e))` takes over from `e > 0.6` (`e = |s|/w`), giving red lips with a white-hot rim.
5. **Outside the gash** a rim glow `exp(−(|s|−w)/(0.45W))` adds `(1, .16, .26)·1.15` plus a white core `rim⁴·0.9`.
6. **Composite.** Sample the scene at the displaced UV with R/B split `o = min(.012, displacement·.003)` (chromatic aberration), add the rim, then mix in the void colour where `gash = 1`.

## Making shapes other than straight lines (twGash)

`twGash({pts, life, rev, fade, w, taper, op, sparks, alive})` turns a screen polyline into overlapping segments:
- each segment is extended by half a segment at both joints (`ex0`/`ex1`), so the chain has no gaps or kinks;
- width along the whole chain follows `w·sin(π·(j+.5)/N)^taper` (taper 0.8 default): thin at both ends, full in the middle;
- `rev` is the time for the cut to travel the whole chain (draw-on); `fade` is the fade-out at the end of `life`;
- `pts()` is called every frame, so the gash can follow a moving thing (Jujishou follows its projectile);
- `twArcPts(cx,cy,cz, ux,uz, R, a0,a1, N, flatY)` makes the polyline: a world-space arc projected to the screen (`flatY` lays it on the ground plane);
- `sparks` spawns white-red 2D sparks off the cut when it finishes drawing.

Example (the Full Counter's tall crescent, placed ahead of the swing so it never covers Shayan):
```js
twGash({life:.75, rev:.09, fade:.35, w:46, sparks:60,
  pts:()=>twArcPts(x+ux*1.7, gy+1.5, z+uz*1.7, ux, uz, 4.2, -1.1, 1.1, 9)});
```

## Timing that makes it read

- Straight cuts: draw on in **0.07s**, full brightness at once, slow fade (opacity ×0.55 over ~1s), many cuts overlapping at random angles (a Judgement Cut sprays 10+).
- `JC.flash` makes every cut 35% brighter for a moment (use on the final hit).
- Pair it with: desaturating the screen (`grade.uniforms.sat`), a short `Game.timeScale` slow-mo, an `impactFrame`, and the sheathe sound.

## Palette

| Role | Colour |
|---|---|
| Void base | `#030008` → `#520a29` |
| Filaments | `rgb(230, 64, 102)` |
| Lips | `#ff1a33` → white-hot `#fff2eb` |
| Rim glow | `#ff2942` + white core |
| Stars | white |

## If you rebuild it elsewhere

Any engine with a full-screen pass can do this: Unity (URP renderer feature), Godot (a `CanvasItem`/screen shader with `hint_screen_texture`), or WebGL/three.js (an `EffectComposer` `ShaderPass` as here). Send line segments in screen UV, do steps 1–6 per pixel, and keep the segment count small (24 is plenty). Since the cut is computed per pixel, it stays sharp at any resolution.
