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
s = patch(s, "b.big?7:4", "(b.big?7:4)*(b.mul||1)", 4)
s = patch(s, "b.friendly?0x9fe0ff:0x7a2aff", "b.rally?0xff2a3a:b.friendly?0x9fe0ff:0x7a2aff")  # rally scythes stay red when you send them back
s = patch(s, "if(b.friendly&&Math.random()<.8) FX.spawn(b.x,b.y,b.z,0,0,0,.3,0x9fe0ff,.25,0,true);", "if(b.friendly&&Math.random()<.8) FX.spawn(b.x,b.y,b.z,0,0,0,.3,b.rally?0xff2a3a:0x9fe0ff,.25,0,true);")
s = patch(s, "nbDamage(!b.ali&&Game.flags.aliSword?7.5:.75)", "nbDamage((!b.ali&&Game.flags.aliSword?7.5:.75)*(b.mul||1))")  # Getsuga damage multiplier (Ali's alternating chain)
s = patch(s, "p.cut=1; Game.caption={text:p.name.toUpperCase(),sub:'',t:0};", "p.cut=1;")  # no planet names under the cosmic blade's cuts
s = patch(s, "farPlane(G,moonTex('#e8eefc','200,215,255'),60,60,-40,70,-260,{ro:-8,add:true});", "G.skyMoon=farPlane(G,moonTex('#e8eefc','200,215,255'),60,60,-40,70,-260,{ro:-8,add:true});")  # the ruins moon, so a cut moon can hide it (97b_continuity)
# the Wrong Turn (Shayan vs Nathan): Shayan's road never cut the moon, so nobody talks about it being cut and it doesn't get mended
s = patch(s, """else { if(mi) yield say('mira',"Shayan?! Weren't you... on the moon? I thought a samurai kicked you into the moon.",'surprised');""", """else { if(mi) yield say('mira',"Shayan?! You were standing right next to me a second ago! Where did you GO?",'surprised');""")
s = patch(s, """yield say('nathan',"...Shayan? SHAYAN SAQIB? You're supposed to be on the moon! Or dead! Or both!");""", """yield say('nathan',"...Shayan? SHAYAN SAQIB? The BLACKSMITH? You're not even supposed to be in this timeline!");""")
s = patch(s, """yield say('',"The sky did not break. It mended. A hundred moon fragments drifted back toward each other, slow as snow, and the moon came home.");""", """if(ALI()) yield say('',"The sky did not break. It mended. A hundred moon fragments drifted back toward each other, slow as snow, and the moon came home."); else yield say('',"The sky did not break. It mended. The cracks Nathan had punched through it sealed shut one by one, and the moon, whole and a little embarrassed for everyone, kept shining.");""")
s = patch(s, "mn.position.set(P.x,60,P.z-140); mn.userData.temp=1;", "mn.position.set(P.x,60,P.z-140); mn.userData.temp=1; mn.visible=ALI();")
s = patch(s, "const frs=[]; for(let i=0;i<40;i++){ const m=new THREE.Mesh(new THREE.DodecahedronGeometry(rnd(1,3),0)", "const frs=[]; for(let i=0;i<(ALI()?40:0);i++){ const m=new THREE.Mesh(new THREE.DodecahedronGeometry(rnd(1,3),0)")
s = patch(s, "yield tween(mend,{u:1},4,t=>t*t*(3-2*t)); mend.done=1;", "yield tween(mend,{u:1},4,t=>t*t*(3-2*t)); mend.done=1; if(L.moonFrags) L.moonFrags.forEach(f=>f.visible=false);")  # the mended moon replaces the fragments in the sky
s = patch(s, "[T?'GETSUGA BUTTON':'RIGHT CLICK','Getsuga Tenshou. Hold: Black Getsuga.'],", "[T?'GETSUGA BUTTON':'RIGHT CLICK','Getsuga Tenshou. Hold: Black Getsuga.'],['RHYTHM','Cut, Getsuga, cut, Getsuga: each one hits harder.'],")  # Ali's alternating chain, in his first hint card
s = patch(s, "const w=430, h=40+rows.length*26, x=T?18:UW-w-18, y=T?128:86; D.globalAlpha=a; frame(x,y,w,h,.82);", "const w=500, h=40+rows.length*26, x=T?18:UW-w-18, y=T?128:86; D.globalAlpha=a; frame(x,y,w,h,.82);")
s = patch(s, "Game.letterTo=0; Sound.play('village'); Game.aliHintT=14; }", "Game.letterTo=0; Sound.play('village'); Game.aliHintT=20; }")
import story_kojima  # He's Day Old Kojima replaces Grimmaw in the base game's lines
for _a, _b, _n in story_kojima.PAIRS:
    assert s.count(_a) == _n, ('story_kojima', _n, s.count(_a), _a[:80]); s = s.replace(_a, _b)
s = patch(s, "D.font=`${sel?700:500} 24px ${FB}`; D.fillStyle=sel?'#fff4d6':'#cfc6b0'; D.fillText(wrap(o.act?o.t:'“'+o.t+'”',maxW-30)[0],tx+16,y);", "D.font=`${sel?700:500} 24px ${FB}`; D.fillStyle=o.lock?(sel?'#8a8496':'#5e5a6a'):sel?'#fff4d6':'#cfc6b0'; D.fillText(wrap((o.lock?'🔒 ':'')+(o.act?o.t:'“'+o.t+'”'),maxW-30)[0],tx+16,y);")  # locked choices are grayed out (40_story)
# the Sleeping Colossus: painted art instead of the procedural skeleton (colossus.py -> img/colossus_*.png); defined in the main script: the first village is built before ext.js runs
s = patch(s, "function catSkeletonTex(o){", "function colossusPlane(G,mode,fb,w,h,x,y,z,o){ let t=null;\n  try{ if(typeof Image!=='undefined'){ const img=new Image(); t=new THREE.Texture(img); t.encoding=THREE.sRGBEncoding; t.minFilter=THREE.LinearFilter; t.generateMipmaps=false;\n      img.onload=()=>{ t.needsUpdate=true; if(m) m.visible=true; }; img.src='img/colossus_'+mode+'.png'; } }catch(e){ t=null; }\n  const m=farPlane(G,t||catSkeletonTex(fb),w,h,x,y,z,o); if(t&&!(t.image&&t.image.complete&&t.image.naturalWidth)) m.visible=false; return m; }\n" + "function catSkeletonTex(o){")
s = patch(s, "farPlane(G,catSkeletonTex({bone:'#f0dccb',shade:'#b89a90',dark:'#5a4250',halo:'#ffd8a0',glow:'#ffb0e0',hazeTop:'rgba(200,120,170,.42)',hazeBot:'rgba(255,170,150,.55)'}),420,210,30,10,-300,{ro:-8})", "colossusPlane(G,'dusk',{bone:'#f0dccb',shade:'#b89a90',dark:'#5a4250',halo:'#ffd8a0',glow:'#ffb0e0',hazeTop:'rgba(200,120,170,.42)',hazeBot:'rgba(255,170,150,.55)'},460,230,30,14,-300,{ro:-8})")
s = patch(s, "G.colossus=farPlane(G,catSkeletonTex({bone:'#f4efe2',shade:'#b8b2a4',dark:'#5a5a68',halo:'#fff2c0',glow:'#8ff0ff',hazeTop:'rgba(170,195,235,.4)',hazeBot:'rgba(160,190,235,.62)'}),330,165,", "G.colossus=colossusPlane(G,'day',{bone:'#f4efe2',shade:'#b8b2a4',dark:'#5a5a68',halo:'#fff2c0',glow:'#8ff0ff',hazeTop:'rgba(170,195,235,.4)',hazeBot:'rgba(160,190,235,.62)'},360,180,")
# slash pass: a slash can skip the image distortion (Ali's basic cuts: sd >= 2 means "no distortion", the seed is its fraction)
s = patch(s, "op=Q[i].z, sd=Q[i].w;", "op=Q[i].z, sd0=Q[i].w, sd=fract(sd0), dk=1.-step(1.5,sd0);")
s = patch(s, "disp+=(-nn*sg*w*1.1+u*sg*W*op*1.2)*fall; ab+=fall*op;", "disp+=(-nn*sg*w*1.1+u*sg*W*op*1.2)*fall*dk; ab+=fall*op*dk;")
# Kojima's phase transitions (40m_kjtrans.js): no more fade to black (both roads)
s = patch(s, "yield fadeOut();\n    grade.uniforms.red.value=0; enterArena('lake',2); yield wait(.2);\n    cineSet(60,1.2,70,60,10,20); Game.fade=1; yield fadeIn();", "yield* kjToLake();", 2)
s = patch(s, "yield fadeOut(); enterArena('flowers',3); cineSet(58,1,74,58,14,20); Game.fade=1; Sound.play('boss'); yield fadeIn();", "yield* kjToFlowers();", 2)
# skies (05d_skies.js): Lanternbrook's dusk mountains, the night sky over Starfall Ridge and the flower field, the night colossus
s = patch(s, "farPlane(G,ridgeTex(['#6a5a90','#9a7aa0'],2,3,0),620,150,20,-10,-210,{ro:-7}); farPlane(G,ridgeTex(['#4a3a68','#6a5080'],5,4,0),520,110,20,-14,-140,{ro:-6});\n    for(let i=0;i<7;i++) farPlane(G,cloudTex(i,['255,210,200','220,150,170']),110+i*12,40,-140+i*55,30+hash(i,1)*30,-230+i*6,{ro:-6,op:.85});",
  "if(typeof villageSky==='function') villageSky(G); else { G.oldSky=[farPlane(G,ridgeTex(['#6a5a90','#9a7aa0'],2,3,0),620,150,20,-10,-210,{ro:-7}),farPlane(G,ridgeTex(['#4a3a68','#6a5080'],5,4,0),520,110,20,-14,-140,{ro:-6})];\n    for(let i=0;i<7;i++) G.oldSky.push(farPlane(G,cloudTex(i,['255,210,200','220,150,170']),110+i*12,40,-140+i*55,30+hash(i,1)*30,-230+i*6,{ro:-6,op:.85})); }")
s = patch(s, "G.colossus=colossusPlane(G,'day',{bone:'#f4efe2',shade:'#b8b2a4',dark:'#5a5a68',halo:'#fff2c0',glow:'#8ff0ff',hazeTop:'rgba(170,195,235,.4)',hazeBot:'rgba(160,190,235,.62)'},",
  "G.colossus=colossusPlane(G,'night',{bone:'#c8d4f0',shade:'#7a88b6',dark:'#22264c',halo:'#bacefe',glow:'#78c8ff',hazeTop:'rgba(40,56,130,.4)',hazeBot:'rgba(30,44,110,.62)'},")
s = patch(s, "farPlane(G,ridgeTex(['#8aa0cc','#b8c8e4'],1,3,1),800,170,20,-6,-260,{ro:-7}); farPlane(G,ridgeTex(['#5f7aa8','#86a0c0'],4,4,0),700,120,30,-24,-170,{ro:-6});\n    for(let i=0;i<9;i++) farPlane(G,cloudTex(i+20,['255,255,255','220,232,255']),120+i*10,46,-200+i*60,40+hash(i,4)*30,-250+i*4,{ro:-6,op:.9});",
  "farPlane(G,ridgeTex(['#0a0e22','#141a36'],1,3,0),800,170,20,-6,-260,{ro:-7}); farPlane(G,ridgeTex(['#05071a','#0a0e24'],4,4,0),700,120,30,-24,-170,{ro:-6});\n    if(typeof nightSky==='function') nightSky(G,{x:41,moon:1,stars:1800});")
s = patch(s, "new THREE.MeshLambertMaterial({map:fieldsTex()})", "new THREE.MeshLambertMaterial({map:fieldsTex(),color:0x5a6a9a})")
s = patch(s, "const gal=farPlane(G,galaxyTex(),900,400,60,10,-140,{ro:-8,add:true,op:.55}); gal.rotation.z=-.3; farPlane(G,galaxyTex(),1000,460,-30,120,-300,{ro:-9,add:true,op:.6});",
  "if(typeof nightSky==='function') nightSky(G,{x:58}); else { const gal=farPlane(G,galaxyTex(),900,400,60,10,-140,{ro:-8,add:true,op:.55}); gal.rotation.z=-.3; farPlane(G,galaxyTex(),1000,460,-30,120,-300,{ro:-9,add:true,op:.6}); }")
# every rush has the same timing: the boss charge tells 0.6s like the twins' rushes (strict judging in 40k_kojima)
s = patch(s, """case 'charge_w': b.anim='leapPrep'; b.vx=b.vz=0; if(b.st<dt*1.5){ b.ang=Math.atan2(dz,dx); b.lineMk=FX.line(b.x,b.z,b.ang,22,1.8,0xff3030,.7/sp); }
      if(b.st>.7/sp){ go('charge');""", """case 'charge_w': b.anim='leapPrep'; b.vx=b.vz=0; if(b.st<dt*1.5){ b.ang=Math.atan2(dz,dx); b.lineMk=FX.line(b.x,b.z,b.ang,22,1.8,0xff3030,.6/sp); }
      if(b.st>.6/sp){ go('charge');""")

# Shayan's Full Counter: the original half-circle in front (+-1.6 rad), reach 7 (its crescent reaches 6.5 ahead, 5.7 at the sides)
s = patch(s, """meleeHits(P.x,P.z,P.y,a.big?5.7:1.9,P.ang,a.big?1.6:1.35,a.big?18:(a.n===2?2:1),a.hit);""", """meleeHits(P.x,P.z,P.y,a.big?7:1.9,P.ang,a.big?1.6:1.35,a.big?18:(a.n===2?2:1),a.hit);""")
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
