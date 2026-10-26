# The Moonsinger's Bell (Project-ShayanSaqib): notes for Claude

A single-page browser game (Three.js r147, pixel-art sprites, voice-acted with Kokoro TTS), published by GitHub Pages from `main`:
https://nxvpsn.github.io/Project-ShayanSaqib/ (repo `nxvpsn/Project-ShayanSaqib`). The owner tests only on the live site, so **finished work is pushed straight to `main`** (also push your session branch if you have one).

## Token budget: read the least you can

- **Never read `index.html`** (build output), `dev/ext.js` or `dev/ext/02_shsprite.js` (base64). `.claude/settings.json` blocks them.
- **Never read a big file whole.** `grep -n` first, then `sed -n 'a,bp' file | cut -c1-400`. `dev/game.js` is 790 KB.
- Search with `grep -rn PATTERN dev/ext dev/game.js --exclude=02_shsprite.js`. Never grep `index.html`.
- `dev/docs/ARCHITECTURE.md`: grep for the file or system row you need (`grep -n "59h_hamza" dev/docs/ARCHITECTURE.md`); don't open it whole.
- Don't re-read a file you just edited, don't re-run passing tests, don't explore code the request doesn't touch.
- No subagents, no Playwright (the owner asked). The Node harness covers logic; visuals are checked by the owner on the live site.

## Where things are

| Path | What it is |
|---|---|
| `index.html` | **Build output. Never read or edit.** Original game + extension + the voice list (~2.4 MB). |
| `dev/ext/*.js` | **Every change since the original game.** Concatenated in filename order after the base script. Edit these. |
| `dev/build.py` | Builds `index.html` from `dev/base/original.html` (the original game), `patch(s, old, new)` edits to it (anchor must match once), `dev/ext/*.js`, and the voice list `audio/v/manifest.json`. |
| `dev/game.js` | Generated base game (with patches), no voices. grep/sed only. Base function names: ARCHITECTURE.md §2. |
| `dev/build_voices.py` | Renders missing voiced lines with Kokoro into `audio/v/` + its manifest (`dev/docs/KOKORO_TTS_HANDOFF.md`); then `build.py --write`. |
| `dev/harness*.js`, `dev/bot2.js`, `dev/t_*.js` | Headless Node harness + tests. `setTimeout`, `addEventListener` and the DOM are mocks. |
| `dev/assets/shayan/` | Shayan's atlas/portraits; edit `sh_sprite_tpl.js`, regenerate with `make_sprite_module.py`. |
| `dev/docs/ARCHITECTURE.md` | One row per ext file + routes, fights, co-op, tests. Grep it. |

Setup once per container: `bash dev/setup.sh` (runs automatically at session start). Voice models only when voicing: `bash dev/setup.sh --voices`.

## Playbook by request type (do only the listed steps)

- **Boss / mechanic change:** grep ARCHITECTURE.md for the boss's ext file, grep that file for the move, edit. Test with the boss's test (`t_boss2.js ONLY=hamza|nathan`, `t_duo3.js ONLY=...`, `t_full2.js` route) or a short scratch harness script. **Update the Debug Mode NEW tags** (below).
- **New dialogue:** write it voice-ready: a literal speaker and literal text, e.g. `say('caotan',"…")` / `twBark('omar',"…")`, never `twBark(someVar,…)`. Voice it only when the owner asks; `python3 build_voices.py ../index.html --dry-run` lists unvoiced lines.
- **Art / sprites / VFX:** edit the drawing code in its ext file (cast: `03_cast.js`, portraits: `98b_portraits.js`, VFX: `04_vfx.js`). Check with `t_cast.js` / `t_sha.js`; a preview PNG can be made with `preview_cast.js` into the scratchpad.
- **Pre-rendered pixel VFX (sprite sheets):** the project skill `scenario-pixel-vfx` (`.claude/skills/`) renders them locally for free. Render into the scratchpad; commit only the final sheet PNG + atlas JSON (small, under `img/vfx/`), never the GIFs or previews. Its Scenario (paid art service) steps need a connector this repo doesn't have: skip them. Recipes live in `dev/vfx/recipes/*.json`; `python3 vfx/build_vfx.py [names]` (from `dev/`) renders them into `img/vfx/` and regenerates `ext/04p_pxv_atlas.js`; `ext/06c_pxvfx.js` plays them. A recipe's `"vary"` list (one override per frame) makes frames shift; the Getsuga family is written by `vfx/getsuga_family.py`. Hits, clashes and the basic slash stay small (readability). **A silver slash means parryable**: every parryable melee attack draws Shayan's silver slash (`pxvSlash`), so new melee hits must pass `melee:true` to `twHitP`/`playerHit`, and nothing that can't be parried may use the silver slash. Hands off: Judgement Cut (method in `dev/docs/VFX_JUDGEMENT_CUT.md`), the black hole, Shayan's dash trail, and all of Grimmaw's effects.
- **UI / menus:** `99d_ui.js` (title, pause, Esc hub, Controls), `99f_mobile.js` (phone layouts, touch Menu/Debug buttons, Cheats pop-up), `99_controls.js` / `99b_gamepad.js` (bindings, pad). Test `t_ui.js t_esc.js t_esc2.js t_pad.js`; run the touch paths too with `TOUCH=1` (the harness is desktop by default). Every menu change must work on both.
- **Save data:** `84_save.js` (`SAVE`, versioned; add a `SAVE_MIG` step when the layout changes).
- Always: `t_warp.js` before pushing.

## Build, test, release (from `dev/`)

```bash
python3 build.py && node --check ext.js          # compile check (writes ext.js + game.js)
REAL=1 node t_warp.js ext.js                     # every timeline warp reaches gameplay (~3 min), before every push
REAL=1 ROUTE=shayan CH=2 node t_full2.js ext.js  # a full story route (5-8 min), only if the route changed
python3 build.py --write                         # write ../index.html (keeps voice clips)
```
Then check that both `<script>` blocks of `index.html` pass `node --check` (snippet in ARCHITECTURE.md §7), commit, push to `main`.

## Debug Mode NEW tags (every patch)

Debug Mode (numpad 5, `dev/ext/99e_debug.js`) shows **NEW** next to mechanics the latest patch added or changed. **Every push that adds or changes a boss mechanic must replace `DBG_PATCH` and `DBG_NEW`** with exactly that patch's changes, as `'boss:move'` keys (`'boss:*'` = the whole boss; ids: caotan, omar, duo, hamza, nathan, mech; move ids are the pool keys / spell keys). New bosses or moves must also appear in Debug Mode's lists (they are read from the pools, so adding to the pool is usually enough). List the NEW items in the final report.

## Keep the repo small (it is the live site, and every push is kept forever in git history)

- **`index.html` must stay small (~2.5 MB).** Never embed audio, images or other base64 blobs in it or in `dev/ext/*.js`. If `python3 build.py --write` prints a page much bigger than that, find out why before pushing.
- **Voice clips are files:** `audio/v/<key>.mp3` (mono, 24 kHz, 40 kbps), listed in `audio/v/manifest.json`; `build_voices.py` writes both and the game fetches a clip when its line plays. Never re-render or rewrite clips that already exist.
- **Other assets:** prefer drawing in code (the cast, portraits and VFX are all procedural). If a file is truly needed: songs as MP3 at most 128 kbps, images as small indexed PNGs, put them under `audio/` or `dev/assets/`, and never commit a second copy (edit in place).
- **Don't commit generated files:** `dev/ext.js`, `dev/game.js`, `dev/voice_cache/`, `dev/tts/`, `node_modules/` are git-ignored; keep it that way. Scratch files and previews go in the scratchpad, not the repo.
- **One commit per finished request**, not one per small step: each commit of a changed file stores a new copy of it.
- Never `git add` a file over ~1 MB without saying why in the commit message. Check with `git diff --cached --stat` before committing.
- The original game is `dev/base/original.html` (voices stripped); `build.py` patches it. Don't edit it: change the base game through `patch()`.

## Code rules

- **Never edit `index.html`.** Base-game changes go through `patch()` in `build.py`.
- Wrap base functions by reassigning the global: `(function(){ const f=foo; foo=function(){ …; return f.apply(this,arguments); }; })();`. Later files wrap earlier ones; function declarations hoist across the whole script, `const`/`let` don't.
- Cutscenes are generators run with `run(gen)` yielding `say`, `choose`, `wait`, `tween`, `cineTo`. Fight patterns are generators that **yield plain numbers (seconds)**. Don't mix them.
- `pkill -f` / `pgrep -f` match their own command line: wait on a PID or a log file instead.
- Inline `//` comments inside one-line functions swallow the rest of the line: use `/* */` there.
- **One exception in a per-frame update or draw freezes the whole game** (the loop stops). Wrap new per-frame hooks in `try{ … }catch(e){ console.error('name',e); }`. The harness's 2D contexts throw on negative radii like a browser; other real-canvas-only errors are not caught, so guard computed sizes (`Math.max(0,…)`).
- Anything a cutscene puts on screen must be cleared when it is skipped: add new overlay state to `twClearCine()` (`85_progress.js`), which runs on every warp and on Exit to Title.

## The owner's preferences

- Tone: comedic, edgy, anime-cinematic; crude jokes are fine. Every boss has jokes, cut-ins, barks and voiced lines.
- Mechanics: FF14-style telegraphs, parry-heavy combat (combos that stun when fully parried, easy single parries), reactive tells (glints).
- **No bugs that block completion**: test what you touch with the harness, plus `t_warp`.
- A question ("can you…?", "answer and ask for approval") gets an answer and a wait. A work request gets done, tested and pushed live.
- Never ask the owner to run a server or commands. Final report: the outcome first, then a short list of what to check on the live site (and the Debug Mode NEW items).
- Keys: `Esc` menu (timeline, Controls, Options), `P` pause, `V` voices, `M` mute, hold `F` fast-forward. Secret numpad keys (never in on-screen key lists; on touch devices the same toggles are in Esc menu → Options → Cheats, and Debug Mode is a button there): `0` infinite HP, `1` infinite Full Counter, `2` one-hit kill (skips limit cuts), `3` timeline unlock checkboxes, `5` Debug Mode. Name rebindable keys on screen with `K('action')`.
