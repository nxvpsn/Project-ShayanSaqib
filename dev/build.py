#!/usr/bin/env python3
"""Build: patch the original game (dev/base/original.html) and inject dev/ext/*.js.
Voice clips are files in audio/v/ (listed in audio/v/manifest.json); the page only embeds that list.
Also writes game.js (patched main script, voices stripped) + ext.js for the Node harness."""
import subprocess, os, sys, glob, json
S = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(S)
# the original game before any extension (its voice data stripped); every patch below applies to it
def base_html(): return open(os.path.join(S, 'base', 'original.html'), encoding='utf8').read()
src = base_html()

def patch(s, old, new, count=1):
    n = s.count(old)
    if n != count:
        sys.exit(f'patch anchor found {n}x (want {count}): {old[:90]!r}')
    return s.replace(old, new)

# 1) Shayan route: Grimmaw's death -> (betrayal fight) -> the rest of the victory scene
s = src
s = patch(s, """the red light drained from every window.");
    const cage=Game.actors.find(a=>a.kind==='cage'); cage.open=1; Sound.sfx('secret');""",
"""the red light drained from every window.");
    twMarkGrimmaw(); if(twBetrayalPending()){ yield* twBetrayal(); return; }
    yield* SCR.victory2(); },
  *victory2(){ const P=Player;
    const cage=Game.actors.find(a=>a.kind==='cage'); cage.open=1; Sound.sfx('secret');""")
s = patch(s, """    yield* pigEpilogue();
    yield* nathanIntro(); }""", """    if(Game.flags.twinPact){ yield* twPactHamza(); return; }
    yield* pigEpilogue();
    yield* nathanIntro(); }""")
# 2) Ali route
s = patch(s, """as if too embarrassed to look at the others.");
    const cage=""", """as if too embarrassed to look at the others.");
    twMarkGrimmaw(); if(twBetrayalPending()){ yield* twBetrayal(); return; }
    yield* SCR.victory2(); },
  *victory2(){ const P=Player;
    const cage=""")
# 3) the twins react when Ali bisects Hamza
s = patch(s, """yield say('ali',"...GG.");""", """yield say('ali',"...GG."); if(TW.allies.length) yield* twAllyReactHamza();""")
# 4) allies bow out before Nathan's finale
s = patch(s, "function* nbFinale(){ const P=Player, mi=Game.mira;", "function* nbFinale(){ const P=Player, mi=Game.mira; twAllyLeave();")

# ---- combat rework hooks (round 2) ----
import re as _re
s = patch(s, "function playerHit(dmg,sx,sz,opt){ opt=opt||{}; const P=Player; if(Game.state!=='play'||P.inv>0||P.dash>0) return 'none';",
  "function playerHit(dmg,sx,sz,opt){ opt=opt||{}; const P=Player; if(Game.state!=='play'||P.inv>0||P.dash>0) return 'none'; if(typeof twPlayerHitHook==='function'){ const hk=twPlayerHitHook(dmg,sx,sz,opt); if(hk) return hk; }")
s = patch(s, "if(ctl&&consume('block')) P.blockT=0; P.block=ctl&&held.block&&P.dash<=0&&!P.atk;",
  "if(ALI()){ if(ctl&&consume('block')) P.blockT=0; P.block=ctl&&held.block&&P.dash<=0&&!P.atk; } else { P.block=false; if(typeof shFire==='function') shFire(dt,ctl); }")
s = patch(s, "if(a.t>.05&&a.t<.16) meleeHits(P.x,P.z,P.y,1.9,P.ang,1.35,a.n===2?2:1,a.hit);",
  "if(a.t>.05&&a.t<.16) meleeHits(P.x,P.z,P.y,a.big?5.7:1.9,P.ang,a.big?1.6:1.35,a.big?18:(a.n===2?2:1),a.hit);")
s = patch(s, "Math.abs(m.y-y)>1.6||!inArc(m.x,m.z,.3)", "Math.abs(m.y-y)>(rad>4?3.2:1.6)||!inArc(m.x,m.z,.3)")
for a,b in [("const r=playerHit(2,b.x,b.z,{heavy:true,onParry:()=>stagger(b,1.4)});","const r=playerHit(2,b.x,b.z,{heavy:true,melee:true,onParry:()=>stagger(b,1.4)});"),
  ("const r=playerHit(3,b.x,b.z,{heavy:true,onParry:()=>{ stagger(b,1.6); }});","const r=playerHit(3,b.x,b.z,{heavy:true,melee:true,onParry:()=>{ stagger(b,1.6); }});"),
  ("const r=playerHit(2,c.x,c.z,{heavy:true,onParry:()=>{ c.d0=99;","const r=playerHit(2,c.x,c.z,{heavy:true,melee:true,onParry:()=>{ c.d0=99;"),
  ("if(playerHit(2,b.x,b.z,{heavy:true})!=='none') D.hit=true;","if(playerHit(2,b.x,b.z,{heavy:true,melee:true})!=='none') D.hit=true;"),
  ("const r=playerHit(2,m.x,m.z,{onParry:","const r=playerHit(2,m.x,m.z,{melee:true,onParry:"),
  ("playerHit(2,m.x,m.z,{heavy:true,onParry:()=>{ m.state='stun'; m.st=-1;","playerHit(2,m.x,m.z,{heavy:true,melee:true,onParry:()=>{ m.state='stun'; m.st=-1;"),
  ("playerHit(3,NB.x,NB.z,{pierce:true})","playerHit(3,NB.x,NB.z,{pierce:true,melee:true})")]:
    s = patch(s, a, b)
# Grimmaw has more HP when Shayan has fireballs
s = patch(s, "const PHASE_HP=67;", "const PHASE_HP_F=()=>ALI()?67:100;")
s = _re.sub(r'\bPHASE_HP\b(?!_F)', 'PHASE_HP_F()', s)
# control hints: block is now the fireball
s = patch(s, "'Right click  guard, tap right as a hit lands to parry'", "'Right click  fireball, hold 2s for a big one'")
s = patch(s, "'Attack incoming projectiles to deflect them'", "'Attack just before a melee hit lands to parry it'")
s = patch(s, "'Shield: guard, tap as a hit lands to parry'", "'Shield: fireball, hold for a big one'")
s = patch(s, "<b>Right click</b> block, tap just before a hit to parry", "<b>Right click</b> fireball, hold for a big one (Ali: block) · attack just before a melee hit to parry")
s = patch(s, "['Guard / parry','Right click or L  (tap just before a hit)']", "['Fireball / guard','Right click or L  (Shayan: fireball, hold to charge. Ali: guard)']")

# Hamza mech fight: no phase III fight; the black hole finale follows the cosmic blade cutscene directly
s = patch(s, "v.o.look=.5; Game.banner={name:'Phase III',sub:'Oblivion',t:0}; startMechPhase(3); }", "v.o.look=.5; yield* blackHoleFinale(); }")
# Shayan's Heavenly Drill chant plays at double speed
s = patch(s, "const T=Math.max(6,(Voice.cur&&Voice.cur.buffer)?Voice.cur.buffer.duration-.15:8.4);", "const T=Math.max(3,(Voice.cur&&Voice.cur.buffer)?Voice.cur.buffer.duration-.15:4.2);")

# a parry's brief invulnerability no longer blinks the player (it looked like taking damage)
s = patch(s, "!(P.inv>0&&P.inv<5&&P.hurt<=0&&Math.floor(P.t*18)%2)", "!(P.inv>0&&P.inv<5&&P.hurt<=0&&!(P.noBlink>Game.time)&&Math.floor(P.t*18)%2)")
s = patch(s, "Game.slowT=.35; P.inv=.3; P.parryFlash=.3;", "Game.slowT=.35; P.inv=.3; P.noBlink=Game.time+.35; P.parryFlash=.3;")
s = patch(s, "Game.dmgNums.push({x:P.x,y:P.y+2.2,z:P.z,n:'TOO SLOW',t:0,col:'#ff8a9a'}); P.inv=.25;", "Game.dmgNums.push({x:P.x,y:P.y+2.2,z:P.z,n:'TOO SLOW',t:0,col:'#ff8a9a'}); P.inv=.25; P.noBlink=Game.time+.3;")

ext = ''
for f in sorted(glob.glob(os.path.join(S, 'ext', '*.js'))):
    ext += f'// ----- {os.path.basename(f)} -----\n' + open(f, encoding='utf8').read() + '\n'
open(os.path.join(S, 'ext.js'), 'w', encoding='utf8').write('"use strict";\n' + ext)

end = "toTitle(); ui.focus(); requestAnimationFrame(loop);\n</script>"
# keep a handle on the white-flowers sky moon so Omar can eat it in the phase 3 cutscene
s = patch(s, "farPlane(G,moonTex('#f2f4ff','200,210,255'),40,40,-20,24,-130,{ro:-7,add:true});", "G.skyMoon=farPlane(G,moonTex('#f2f4ff','200,210,255'),40,40,-20,24,-130,{ro:-7,add:true});")
# title screen: New Game / Load Game menu lives in ext/96_menu.js
s = patch(s, "if(st==='title'){ if(consume('confirm')||consume('attack')||consume('jump')){", "if(st==='title'){ if(typeof twTitleMenu==='function') twTitleMenu(dt); else if(consume('confirm')||consume('attack')||consume('jump')){")
# no more SKIP TO BOSS sign behind the house north of the spawn
s = patch(s, "for(let x=1;x<=10;x++) G.B[4][x]=false; addSkipSign(G,5.6,4.45);", "")
# the controls box on a new game: current controls (the numpad cheat keys stay secret)
s = patch(s, "['WASD  move      Space  jump, again in the air to double jump','Hold Space after the double jump to glide','Left click  attack (hold, then release for Getsuga Tenshou)','Right click  fireball, hold 2s for a big one','Shift  dash   Q  special   E  talk','Attack just before a melee hit lands to parry it']",
  "['WASD  move    Space  jump (again: double jump, hold: glide)','Mouse  aim    Left click  attack (hold + release: Getsuga)','Right click  fireball (hold 3s: big one + flaming sword)','Attack right before a hit lands to parry (5 = Full Counter)','Shift  dash    Q  special    E  talk    P  pause','Hold F  fast-forward dialogue    Esc  timeline']")
# rebindable controls (ext/99_controls.js): mouse buttons and the voices key go through the binding table
s = patch(s, "if(e.button===0) press('attack'); if(e.button===2) press('block');", "twMouse(e.button,true);")
s = patch(s, "if(e.button===0) release('attack'); if(e.button===2) release('block');", "twMouse(e.button,false);")
s = patch(s, "addEventListener('keydown',e=>{ if(e.code==='KeyV'){", "addEventListener('keydown',e=>{ if(twBound('voices',e.code)){")
# the player sprite gets headroom (96x96, feet in the same place): sword raises, hops, the flip no longer clip at the top; the shadow keeps its old size
# Ali's landing (he falls from the moon and takes over the story) becomes its own scene, so the timeline's "Ali's Road" can start there
s = patch(s, "  // the wanderer returns to earth\n  yield fadeOut(); fol.on=0; al.dispose();\n", "  yield fadeOut(); fol.on=0; al.dispose(); yield* aliLanding(fl,aff,kills,H); }\nfunction* aliLanding(fl,aff,kills,H){ const P=Player;\n")
s = patch(s, "if(!pSprite) pSprite=new Sprite3D(64,64);", "if(!pSprite){ pSprite=new Sprite3D(96,96); pSprite.shadow.geometry=new THREE.PlaneGeometry(.88,.44); }")
# Nathan rests less between patterns (ext/59o_nathan3.js makes him harder)
s = patch(s, "NB.cd=[0,.8,.6,.45,.35][NB.phase];", "NB.cd=[0,.5,.38,.28,.2][NB.phase];")
# ---------- Ali, reworked (dev/ext/08b_ali.js): left click = his own 3-hit combo, right click = Getsuga (hold: Black Getsuga),
# no guard / blade storm, a teleport with no VFX, small Getsuga Jujishous hung in the frozen air, and a final cut in his ultimate
s = patch(s, "if(ALI()){ if(ctl&&consume('block')) P.blockT=0; P.block=ctl&&held.block&&P.dash<=0&&!P.atk; } else {", "if(ALI()){ P.block=false; } else {")
s = patch(s, "  if(ALI()&&P.block) aliBlockStorm(dt);\n", "")
s = patch(s, "    if(ALI()){ if(consume('attack')&&!P.block) aliGetsuga(false); }", "    if(ALI()) aliInput(dt);")
s = patch(s, "    if(held.attack&&!P.atk&&!P.block&&P.dash<=0){ const before=P.charge;", "    if(!ALI()&&held.attack&&!P.atk&&!P.block&&P.dash<=0){ const before=P.charge;")
s = patch(s, "    if(!held.attack){ if(P.charge>=.75){ if(ALI()) aliGetsuga(true); else fireBeam(P.charge>=1.5); } P.charge=0; }", "    if(!ALI()&&!held.attack){ if(P.charge>=.75) fireBeam(P.charge>=1.5); P.charge=0; }")
s = patch(s, "  } else if(!held.attack) P.charge=0;", "  } else if(!held.attack&&!(ALI()&&held.block)) P.charge=0;")
s = patch(s, "  FX.burst(ox,oy+1,oz,22,0x0c0814,3,.35,false); FX.burst(ox,oy+1,oz,10,0xb0182a,3,.25); aliGhost(ox,oy,oz);\n", "")
s = patch(s, "  FX.burst(tx,P.y+1,tz,16,0x0c0814,3,.3,false); FX.ring(tx,P.y+.05,tz,'#b0182a',1.2,.2); Sound.sfx('dash'); }", "  Sound.sfx('dash'); }")
s = patch(s, "const m=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),new THREE.MeshBasicMaterial({map:CRESC,transparent:true,depthWrite:false,side:THREE.DoubleSide,color:0xff3a4a,fog:false})); m.position.set(x,y+1.1,z); m.rotation.y=-Math.atan2(cz-z,cx-x); m.userData.temp=1; scene.add(m);", "const m=aliHungJJ(x,y+1.1,z,cx,cz);")
s = patch(s, "yield wait(.35); Voice.bark('aliJudgement'); Sound.sfx('secret'); yield wait(.7);", "yield wait(.35); Voice.bark('aliJudgement'); Sound.sfx('secret'); yield wait(.35); yield* aliFinalCut(); yield wait(.2);")
s = patch(s, "['ATTACK','Getsuga Tenshou. Spam it.'],['HOLD ATTACK','Black Getsuga'],['JUMP','Twice as high. Hold to float in place.'],['BLOCK','Blade storm. Deflects every projectile.'],['DASH','Teleport. No cooldown.']",
  "['ATTACK','Three cuts: a slash, a double cut, a spin.'],[T?'GETSUGA BUTTON':'RIGHT CLICK','Getsuga Tenshou. Hold: Black Getsuga.'],['JUMP','Twice as high. Hold to ride a Getsuga.'],['PARRY','Attack right before a hit lands.'],['DASH','Teleport. No cooldown.']")
s = patch(s, end, end + "\n<script>\n\"use strict\";\n" + ext + "</script>")

# harness copy of the main script (voices stripped)
lines = s.split('\n')
start = lines.index('<script>', 120) + 1
stop = next(i for i in range(start, len(lines)) if lines[i] == '</script>')
main = [('const VOICES={};' if l.startswith('const VOICES=') else l) for l in lines[start:stop]]
open(os.path.join(S, 'game.js'), 'w', encoding='utf8').write('\n'.join(main) + '\n')
if '--write' in sys.argv:
    # the page lists which voice clips exist (audio/v/<key>.mp3); the game fetches a clip the first time its line plays
    out = os.path.join(REPO, 'index.html'); mf = os.path.join(REPO, 'audio', 'v', 'manifest.json')
    man = json.load(open(mf)) if os.path.exists(mf) else {}
    n = _re.search(r'^const VOICES=\{.*?\};$', s, _re.M)
    if n: s = s[:n.start()] + 'const VOICES=' + json.dumps(man, separators=(',', ':'), sort_keys=True) + ';' + s[n.end():]
    open(out, 'w', encoding='utf8').write(s)
    print('wrote index.html', len(s))
print('ok', len(ext), 'bytes of extension')
