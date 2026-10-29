# The Moonsinger's Bell (Project-ShayanSaqib): notes for Claude

A single-page browser game (Three.js r147, pixel art, Kokoro-voiced), live on GitHub Pages from `main` (last shipped: v1.39, Oct 29 2026):
https://nxvpsn.github.io/Project-ShayanSaqib/. The owner tests only on the live site, so **finished work is pushed to `main`** (and your session branch).
Details for everything here: `dev/docs/ARCHITECTURE.md` (grep it, never read it whole; §7 tests, §9 playbook by request type).

## Token budget
- Never read `index.html`, `dev/ext.js`, `dev/ext/02_shsprite.js` (blocked). Never read a big file whole: `grep -n`, then `sed -n 'a,bp' f | cut -c1-400` (`dev/game.js` is 790 KB).
- Search with `grep -rn PAT dev/ext dev/game.js --exclude=02_shsprite.js`. Grep ARCHITECTURE.md for the file or system row you need.
- Don't re-read a file you just edited, re-run passing tests, or explore code the request doesn't touch.
- No subagents. The Node harness covers logic; `preview_cast.js` renders sprites to a PNG; the owner checks visuals live.
- **Screenshots (`dev/shot.js`, headless Playwright on the real game) only when the owner says "use screenshot method"**, and even then only if it is worth it for the task (a visual change where a still would catch the bug). If missing the bug and fixing it in a later prompt would cost fewer tokens, ask "are you sure?" first. Never unasked. At most 4 shots a push; looking at a shot costs ~1.5k tokens.

## Where things are
- `dev/ext/*.js`: every change since the original game, concatenated in filename order. Edit these.
- `dev/build.py`: builds `index.html` from `dev/base/original.html` + `patch(s, old, new)` edits (anchor must match once) + `dev/ext` + the voice list. Base-game changes go through `patch()`; never edit `index.html` or `original.html`.
- `dev/game.js`: generated base game (grep/sed only; names in ARCHITECTURE §2). Tests: `dev/harness*.js`, `bot2.js`, `t_*.js`.
- Newest systems (rows in ARCHITECTURE §2): Nathan on Ali's road `59t`-`59z` (TPS camera, phase I moves, Starbreaker, polish, posture, air; the road ends after phase I in `nbFinale`), Big Back Hamza round 4 `59i_hamza4.js` (arena-free moves, snout shove, hop, rolling stampede, parryable landings, ALL-YOU-CAN-EAT, LAST CALL), Kojima `40k`-`40n` (skins for borrowed moves, the box hunt instead of the dome, the crew/hydra sprites in `03k`), the stun meter `01c_stunmeter.js`, the caged cursor `08e_cursorcage.js`, Ali's charge `08d_alicharge.js`.
- Project skills in `.claude/skills/`: `scenario-pixel-vfx` (pixel VFX sheets, free and local; skip its paid Scenario steps), `game-feel`, `game-ui-ux`, `shader-programming`, `performance-optimization`.
- Setup runs at session start (`bash dev/setup.sh`; `--voices` only when voicing: it downloads Kokoro, then `python3 build_voices.py ../index.html --dry-run` lists the lines, `--jobs 4` renders them; Hamza the pig is not in the voice cast, his barks are text).
- The skills under `.claude/skills/` are repo files: Claude Code loads them by itself, setup.sh does not touch them, nothing to install.

## Build, test, release (from `dev/`)
```bash
python3 build.py && node --check ext.js     # compile check
REAL=1 node t_warp.js ext.js                # every timeline warp reaches gameplay (~3 min), before every push
python3 build.py --write                    # writes ../index.html; then node --check both <script> blocks (§9)
```
Test what you touch with its test (§7; menus also with `TOUCH=1`). One commit per finished request (`git diff --cached --stat` first), push to `main`.

## Rules
- **Version:** every push bumps `GAME_VERSION` (`dev/ext/99z_version.js`, shown bottom right on every screen) by +0.01 (v1.05 → v1.06 → …); the final report says the version.
- **Debug Mode NEW tags:** every push that adds or changes a boss mechanic replaces `DBG_PATCH` and `DBG_NEW` (`dev/ext/99e_debug.js`) with exactly that patch's `'boss:move'` keys (ids: caotan, omar, duo, hamza, nathan, mech; `'boss:*'` = the whole boss; moves = pool keys). List them in the report.
- **A silver slash means parryable.** Every parryable melee attack shows Shayan's silver slash (`pxvSlash`): new melee hits pass `melee:true` to `twHitP`/`playerHit`, parryable rushes call `twRushTell(o,ang)` each frame. Nothing unparryable may use it.
- **Readability:** telegraphs and attacks must contrast with the arena (dark arenas under white attacks, solid dark telegraphs on bright ground). Check a new arena's colours against the boss's attack colours. Hits, clashes and the basic slash stay small.
- **Hands off:** Judgement Cut VFX, the black hole, Shayan's dash trail. (Grimmaw is now He's Day Old Kojima, id 'grimmaw': the easy tutorial boss, `40k_kojima.js`.)
- **New dialogue** is voice-ready (literal speaker and text: `say('caotan',"…")`, never a variable) and voiced only when the owner asks.
- **Menus** are phone-first (text >= 16 CSS px, taps >= 44 CSS px) and must work on desktop and `TOUCH=1`.
- **Per-frame code:** one exception freezes the game. Wrap new per-frame hooks in `try{ … }catch(e){ console.error('name',e); }` and guard computed sizes (`Math.max(0,…)`).
- Cutscenes are generators yielding `say`/`choose`/`wait`/`tween`/`cineTo`; fight patterns yield plain numbers (seconds). Anything a cutscene puts on screen is cleared in `twClearCine()` (`85_progress.js`).
- Wrap base functions by reassigning the global: `(function(){ const f=foo; foo=function(){ …; return f.apply(this,arguments); }; })();`. Function declarations hoist across the script, `const`/`let` don't.
- No `//` comments inside one-line functions (use `/* */`). `pkill -f`/`pgrep -f` match their own command line.
- Save layout changes need a `SAVE_MIG` step (`84_save.js`).
- Generators: a boss move (`G.gen`, `NP1.gen`, `T.gen`) yields seconds; a cutscene run with `run()` yields `wait()`/`say()` objects, and a plain number there hangs the game forever (`hzgScript` bridges a move into a script; a script inside a move is `run(...)` then `while(Game.script) yield .1`). Never null the generator that is currently running itself.
- Hit-stop pauses `updateWorld` but `Game.time` keeps running: re-anchor any landing/parry time after impact frames.
- Every parryable hit is a timed attack press (`melee:true`, `twStrictDo(from,…)` for rushes, `onParry` for the stagger); landings and rushes are parried by attacking on the way down/in. Stunned bosses show the stun meter (01c) except in the bullet hell.

## Pitfalls that cost time
- `node --check ext.js` misses a new top-level name that clashes with a base-game global (a `const MC` crashed the game): grep `game.js` for new top-level names.
- three.js sprites ignore a negative scale: mirror with `pxvFlip`.
- The harness: `setTimeout`/`addEventListener` do nothing; images never load (pixel VFX: `for(const n in PXV_ATLAS){ PXV.tex[n]=new THREE.Texture(); PXV.ready[n]=1; }`, Ali's sheet: `ALS.ok=true`); THREE objects are mocks, so colours can't be checked and `o.parent` never ends (cap such loops).
- Indexed PNGs must keep their transparency (§9), or sprites draw on black boxes.
- Harness: THREE mocks return 0 for positions and scales, so record what a test needs on the object (`b.wallH`); UI meters skip while `Game.letter>.5` (wait ~40 frames after a warp); the boss limit cuts trigger inside `damageBoss`/`hzgHurt` (deal damage to start one); the giant's `touchT` reset uses `setTimeout` (never fires).
- Shell: a heredoc ends a `&&` chain, so gate a push on test output written to a file (`tee out && grep -q "ALL PASS" out && …`) and use `python3 -c` inside chains. Run `t_warp` before `build.py --write`.
- `hzgLeap`/`twBeam`/`twMiniHole` build their own meshes: to reskin, trap `scene.add` (see `kjTrap`) rather than editing the helpers.

## Keep the repo small (it is the live site, and git history is kept forever)
- `index.html` stays ~2.5 MB: never embed audio, images or base64 in it or in `dev/ext/*.js`. Assets are files: voice clips `audio/v/` (never re-render existing ones), images as small indexed PNGs under `img/` or `dev/assets/`, never a second copy.
- Don't commit generated files (`dev/ext.js`, `dev/game.js`, caches); scratch files and previews go in the scratchpad. Never `git add` a file over ~1 MB without saying why.

## The owner's preferences
- Tone: comedic, edgy, anime-cinematic; crude jokes are fine. Every boss has jokes, cut-ins, barks and voiced lines. Mechanics: FF14-style telegraphs, parry-heavy combat (fully parried combos stun), reactive tells (glints).
- Visuals: do exactly what was asked; propose extras instead of adding them.
- Requests sent while you work are queued, then finished, tested and pushed together in one build.
- No bugs that block completion: test what you touch with the harness, plus `t_warp`.
- A question gets an answer and a wait. A work request gets done, tested and pushed live. Never ask the owner to run a server or commands.
- Final report: the outcome first, the version it shipped as, then a short list of what to check on the live site, and the Debug Mode NEW items.
- Fights never wall the player in (no `Game.arena` locks): keep a boss's moves near the player with a box that follows them instead. Bosses must not trudge or stutter: inertia, a homing boost, a hop back.
- References stay "inspired by, not copies of" (the Kojima crew, the hydra). A boss's borrowed moves get skins that fit the boss; the attack itself stays.
- Mechanics the owner removed: Hamza's quake, belly slide, roll-as-its-own-move, the laser dome; Nathan phases II-IV on Ali's road (phase I ends in the finale).
- Keys: `Esc` menu, `P` pause, `V` voices, `M` mute, hold `F` fast-forward. Secret numpad keys (never in on-screen key lists; on touch: Esc → Options → Cheats): `0` infinite HP, `1` infinite Full Counter, `2` one-hit kill (skips limit cuts), `3` timeline unlocks, `5` Debug Mode. Name rebindable keys on screen with `K('action')`.
