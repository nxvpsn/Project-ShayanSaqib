// =====================================================================
// NEW COMBAT: Shayan's fireballs, melee parries, Full Counter, Ali's mini Judgement Cut
// plus the secret toggles (numpad 1 = infinite health, numpad 3 = one-hit phases, numpad 2 = unlock every timeline branch)
// =====================================================================
TW.god=false; TW.otk=false; TW.fb=[]; TW._ally=0;
TW_SFX.fire=function(){ Sound.hiss(1800,.12,.12,'bandpass'); Sound.tone('sawtooth',320,120,.12,.07); };
TW_SFX.bigfire=function(){ Sound.hiss(600,.5,.22,'lowpass'); Sound.tone('sawtooth',160,50,.5,.16); Sound.hiss(2600,.3,.1,'bandpass',.05); };
TW_SFX.counter=function(){ Sound.tone('square',660,1320,.12,.12); Sound.tone('square',990,1980,.18,.1,.08); Sound.hiss(5000,.2,.12,'highpass'); };
TW_SFX.punch=function(){ Sound.tone('sine',160,60,.09,.22); Sound.hiss(1200,.06,.1,'bandpass'); };

// ---------- one-hit phases + infinite health (numpad 1: you still get hit, HP just refills before it runs out), and route every player hit through the parry check ----------
function twPlayerHitHook(dmg,sx,sz,opt){ const P=Player;
  if(opt&&opt.melee&&!Game.paulLock){ const since=Game.time-twParryClock(), win=opt.win||.26, ok=ALI()?((P.block&&!opt.noGuard)||since<win):(since<win&&P.hurt<=0); if(ok){ twMeleeParry(sx,sz,opt); return 'parry'; } }
  return null; }
function twMeleeParry(sx,sz,opt){ const P=Player, mx=lerp(P.x,sx,.45), mz=lerp(P.z,sz,.45);
  FX.hitstop=Math.max(FX.hitstop,.14); Game.slowT=Math.max(Game.slowT,.28); P.inv=Math.max(P.inv,.4); P.noBlink=Game.time+.45; Sound.sfx('parry'); Sound.sfx('deflect'); shake(.45);
  for(let i=0;i<3;i++) FX.spark(mx,P.y+1.1,mz); FX.ring(mx,P.y+.1,mz,ALI()?'#ff3a4a':'#8fd8ff',2.4,.35); FX.flash=.32; grade.uniforms.flashCol.value.set(1,1,1); impactFrame([[2,1]]);
  P.counter=Math.min(5,(P.counter||0)+1); Game.dmgNums.push({x:P.x,y:P.y+2.4,z:P.z,n:'PARRY '+P.counter+'/5',t:0,big:true,col:ALI()?'#ff8a9a':'#bfe8ff'});
  if(P.counter>=5){ Sound.sfx('counter'); Sound.sfx('ready'); FX.ring(P.x,P.y+.1,P.z,'#3a8aff',3.4,.6); TW.cReadyT=0; }
  if(opt.onParry) opt.onParry(); }
// damage multipliers for the numpad 3 toggle: huge damage, every system already clamps at its next checkpoint
(function(){ const th=twHurt; twHurt=function(T,d,src){ if(TW.otk&&!TW._ally&&!['ally','ff','test'].includes(src)) d=9999; return th(T,d,src); };
  const db=damageBoss; damageBoss=function(d,o){ if(TW.otk&&!TW._ally) d=9999; return db(d,o); };
  const nb=nbDamage; nbDamage=function(d,u){ if(TW.otk&&!TW._ally) d=9999; return nb(d,u); };
  const md=mechDamage; mechDamage=function(d,x,y,z,b){ if(TW.otk) d=9999; return md(d,x,y,z,b); };
  const od=Game.onDeath; Game.onDeath=function(){ if(TW.god){ twGodRefill(); if(NAT){ NAT.ap=NAT.maxAp; NAT.show=1; } return; } return od.call(Game); }; })();
// infinite health: top HP back up whenever the next hit (or a -2 fall) could empty it
function twGodRefill(){ const P=Player; P.hp=P.maxHp; Game.dmgNums.push({x:P.x,y:P.y+2.6,z:P.z,n:'∞ HP',t:0,col:'#7affb0'}); }
function hzgHurtGod(d,src){ return (TW.otk&&!TW._ally&&src!=='ally'&&src!=='test')?9999:d; }

// ---------- the swing clock (parry window) + Full Counter / mini Judgement Cut ----------
(function(){ const sa=startAtk; startAtk=function(n){ const P=Player; P.swingT=Game.time; if(!ALI()&&!Game.paulLock&&(P.counter||0)>=5){ twCounterSlash(); return; } return sa(n); };
  const ag=aliGetsuga; aliGetsuga=function(big){ const P=Player; P.swingT=Game.time; if(!big&&!Game.paulLock&&(P.counter||0)>=5){ twMiniJC(); return; } return ag(big); }; })();
function twCounterSlash(){ const P=Player; P.counter=0; const tg=nearestFoe(7); if(tg) P.ang=Math.atan2(tg.z-P.z,tg.x-P.x); P.f=Math.cos(P.ang)>=0?1:-1;
  P.atk={t:0,n:2,hit:new Set(),q:false,big:1}; P.combo=2; P.charge=0; Sound.sfx('swing'); Sound.sfx('beam'); Sound.sfx('counter'); shake(.5);
  // the huge crescent itself is drawn as a Judgement Cut gash in 06b_shayan.js (shFullCounterFX)
  for(let i=0;i<40;i++){ const a=P.ang+rnd(-1.5,1.5), r=rnd(1,5.7); FX.spawn(P.x+Math.cos(a)*r,P.y+rnd(.3,3),P.z+Math.sin(a)*r,Math.cos(a)*4,rnd(0,2),Math.sin(a)*4,.4,i%3?0x5ab4ff:0xffffff,.35,0,true); }
  if(typeof NB!=='undefined'&&NB&&NB.alive&&Math.hypot(NB.x-P.x,NB.z-P.z)<7) nbDamage(40,true); }
(function(){ const mh=meleeHits; meleeHits=function(x,z,y,rad,ang,arc,dmg,set){ const any=mh(x,z,y,rad,ang,arc,dmg,set); const A=Player.atk;
    if(any&&A&&A.big&&!A.boomed){ A.boomed=1; FX.hitstop=Math.max(FX.hitstop,.18); impactFrame([[2,1],[1,1],[3,1]]); shake(1.1); FX.flash=.55; grade.uniforms.flashCol.value.set(.55,.8,1); Sound.sfx('crossboom'); Sound.sfx('slam');
      Game.dmgNums.push({x:Player.x,y:Player.y+3,z:Player.z,n:'FULL COUNTER',t:0,big:true,col:'#7ac8ff'}); }
    return any; }; })();
function twMiniJC(){ const P=Player; P.counter=0; Sound.sfx('secret'); const sat=grade.uniforms.sat.value; grade.uniforms.sat.value=.15; Game.timeScale=.02; JC.flash=.6;
  const tg=aliTargets().filter(T=>Math.hypot(T.x-P.x,T.z-P.z)<11); let t=0, n=0;
  const hit=T=>{ if(TW.foes.includes(T)) twHurt(T,4,'counter'); else if(T===TW.giant) hzgHurt(4,'counter'); else if(T===Game.boss) damageBoss(3.5); else if(typeof NB!=='undefined'&&T===NB) nbDamage(10,true); else if(T.hp>0) damageMob(T,4,Math.atan2(T.z-P.z,T.x-P.x)); };
  Game.fxUpd.push(dt=>{ t+=dt; if(t>.13&&Game.timeScale<1){ Game.timeScale=1; grade.uniforms.sat.value=sat; }
    while(n<5&&t>.15+n*.075){ n++; const T=tg.length?tg[n%tg.length]:null; let sx=UW/2, sy=UH/2; if(T){ const s=toScreen(T.x,(T.y||0)+1.4,T.z); sx=s[0]; sy=s[1]; }
      const a=rnd(0,Math.PI); JC.lines.push({x0:sx-Math.cos(a)*320,y0:sy-Math.sin(a)*320,x1:sx+Math.cos(a)*320,y1:sy+Math.sin(a)*320,t:0,ttl:.32}); JC.flash=.35; Sound.sfx('swing'); Sound.sfx('hit'); shake(.25);
      if(T){ FX.cut(T.x,(T.y||0)+1.4,T.z); FX.burst(T.x,(T.y||0)+1.4,T.z,18,0xff2a3a,6,.3); hit(T); } }
    if(n>=5&&t>.62){ impactFrame([[3,1],[1,1]]); Sound.sfx('crossboom'); shake(.6); Game.dmgNums.push({x:P.x,y:P.y+2.8,z:P.z,n:'JUDGEMENT CUT',t:0,big:true,col:'#ff6a7a'}); return false; } return true; }); }

// ---------- Shayan's fireballs (the old block button) ----------
const TW_FB_FULL=3; // seconds of holding for the big fireball (it also ignites the sword)
function shFire(dt,ctl){ const P=Player; P.fbCd=(P.fbCd||0)-dt; if(Game.paulLock||Game.mech) return;
  if(ctl&&consume('block')){ P.fbHolding=true; P.fbHold=0; if(P.fbCd<=0&&P.hurt<=0){ twFireball(false); P.fbCd=1/3; } }
  if(P.fbHolding){ if(ctl&&held.block){ const b=P.fbHold; P.fbHold+=dt; if(b<.35&&P.fbHold>=.35) Sound.sfx('charge'); if(b<TW_FB_FULL&&P.fbHold>=TW_FB_FULL){ Sound.sfx('ready'); FX.ring(P.x,P.y+.1,P.z,'#ff8a2a',2,.4); }
      if(P.fbHold>.35&&Math.random()<.6){ const a=rnd(0,6.28); FX.spawn(P.x+Math.cos(a)*.9,P.y+rnd(.6,1.6),P.z+Math.sin(a)*.9,-Math.cos(a)*2,1,-Math.sin(a)*2,.3,P.fbHold>=TW_FB_FULL?0xffd040:0xff6a1a,.22,0,true); } }
    else { if(P.fbHold>=TW_FB_FULL&&ctl){ twFireball(true); twIgnite(); } P.fbHolding=false; P.fbHold=0; } } }
function twFireball(big){ const P=Player, tg=nearestFoe(18); let a=P.ang; if(tg) a=Math.atan2(tg.z-P.z,tg.x-P.x); P.ang=a; P.f=Math.cos(a)>=0?1:-1;
  const g=new THREE.Group(), core=new THREE.Mesh(new THREE.SphereGeometry(big?.42:.15,10,8),new THREE.MeshBasicMaterial({color:big?0xff3a5a:0xffd060})), gl=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:big?0xff0828:0xff7a20,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));
  gl.scale.setScalar(1.1); g.add(core); if(!big) g.add(gl); if(big){ const inner=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),new THREE.MeshBasicMaterial({color:0xffd0d8})); g.add(inner); } /* the charged one is a deep neon red ball, no glow around it */ g.userData.temp=1; scene.add(g); const sp=big?15:25, y0=P.y+1.1, ty=tg?((tg.y||0)+(tg===Game.boss?2:1.2)):y0, d=tg?Math.hypot(tg.x-P.x,tg.z-P.z):10;
  TW.fb.push({g,big,x:P.x+Math.cos(a)*.7,y:y0,z:P.z+Math.sin(a)*.7,vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:clamp((ty-y0)/Math.max(.3,d/sp),-6,6),life:big?1.7:.95,dmg:big?4:.2,hit:new Set(),r:big?.75:.35});
  Sound.sfx(big?'bigfire':'fire'); if(big){ shake(.3); P.vx-=Math.cos(a)*3; P.vz-=Math.sin(a)*3; FX.burst(P.x,P.y+1.1,P.z,24,0xff1a3a,5,.3); } P.beamPose=.12; }
function twFireballHit(f,x,y,z){ FX.burst(x,y,z,f.big?40:8,f.big?0xff1a3a:0xff7a1a,f.big?8:3,f.big?.4:.22); if(f.big){ FX.ring(x,y-.6,z,'#ff2a4a',3,.4); shake(.35); Sound.sfx('slam'); } else Sound.sfx('hit'); }
function twUpdateFireballs(dt){ const P=Player, B=Game.boss;
  for(const f of TW.fb){ f.life-=dt; f.x+=f.vx*dt; f.y+=f.vy*dt; f.z+=f.vz*dt; f.g.position.set(f.x,f.y,f.z); if(Math.random()<.9) FX.spawn(f.x,f.y,f.z,-f.vx*.05,rnd(0,.6),-f.vz*.05,.25,f.big?(Math.random()<.5?0xff0a30:0xff5a70):0xff7a20,f.big?.5:.2,0,true);
    let dead=f.life<=0||f.y<groundY(f.x,f.z)-.2||cellH(f.x,f.z)>f.y+.3;
    for(const b of BOLTS){ if(dead) break; if(b.dead||b.friendly) continue; if(Math.hypot(b.x-f.x,b.y-f.y,b.z-f.z)<f.r+.45){ if(f.big){ b.dead=1; FX.spark(b.x,b.y,b.z); } else { dead=true; FX.spark(f.x,f.y,f.z); } } }
    const tryHit=(o,r,fn)=>{ if(dead||f.hit.has(o)) return; if(Math.hypot(o.x-f.x,o.z-f.z)<r+f.r){ f.hit.add(o); fn(); twFireballHit(f,f.x,f.y,f.z); if(!f.big) dead=true; } };
    for(const m of MOBS) if(m.hp>0) tryHit(m,.6,()=>damageMob(m,f.dmg,Math.atan2(f.vz,f.vx)));
    if(B&&B.hp>0&&!B.vanish) tryHit(B,1.1,()=>damageBoss(f.dmg));
    for(const T of TW.foes) if(T.hp>0&&!T.hide&&!T.gone) tryHit(T,.9*T.scale,()=>twHurt(T,f.dmg,'fire'));
    if(TW.giant&&TW.giant.hp>0) tryHit(TW.giant,2.3,()=>hzgHurt(f.dmg,'fire'));
    if(typeof NB!=='undefined'&&NB&&NB.alive) tryHit(NB,1.4,()=>nbDamage(f.dmg*.35));
    for(const n of NPCS.slice()) tryHit(n,.5,()=>hitNPC(n,f.dmg,Math.atan2(f.vz,f.vx)));
    if(L.dummy) tryHit(L.dummy,.5,()=>{ L.dummy.hits++; L.dummy.flash=.3; });
    if(dead){ f.dead=1; scene.remove(f.g); } }
  TW.fb=TW.fb.filter(f=>!f.dead); }
(function(){ const uw=updateWorld; updateWorld=function(dt){ uw(dt); if(!Game.mech&&!Game.zw){ twUpdateFireballs(dt); if(TW.god&&Player.hp<=Math.max(2.01,Player.maxHp*.2)) twGodRefill(); } else if(TW.god&&NAT&&NAT.ap<=NAT.maxAp*.3) NAT.ap=NAT.maxAp; }; })();

// ---------- HUD: fireball charge, parry pips, FULL COUNTER READY ----------
function twDrawCombatHUD(){ const P=Player, t=performance.now()/1000; if(Game.state!=='play'||P.hidden||Game.paulLock) return;
  if(!ALI()&&P.fbHolding&&P.fbHold>.35){ const [sx,sy]=toScreen(P.x,P.y+2.1,P.z), k=clamp((P.fbHold-.35)/(TW_FB_FULL-.35),0,1); D.lineWidth=5; D.strokeStyle='rgba(10,8,20,.6)'; D.beginPath(); D.arc(sx,sy,24,0,7); D.stroke();
    D.strokeStyle=k>=1?'#ffe080':'#ff7a2a'; D.beginPath(); D.arc(sx,sy,24,-Math.PI/2,-Math.PI/2+k*Math.PI*2); D.stroke(); if(k>=1){ D.font=`700 13px ${FB}`; D.fillStyle='#ffd8a0'; D.textAlign='center'; D.fillText('BIG FIREBALL',sx,sy-32); D.textAlign='left'; } }
  const n=P.counter||0, gx=24, gy=82; for(let i=0;i<5;i++){ D.save(); D.translate(gx+8+i*20,gy+8); D.rotate(Math.PI/4); D.fillStyle=i<n?(n>=5?`hsl(${205+Math.sin(t*8)*15},100%,65%)`:(ALI()?'#ff5a6a':'#7ac8ff')):'rgba(10,14,30,.7)'; D.fillRect(-6,-6,12,12); D.strokeStyle='rgba(216,180,106,.8)'; D.lineWidth=1.5; D.strokeRect(-6,-6,12,12); D.restore(); }
  D.font=`700 13px ${FB}`; D.fillStyle=n>=5?'#cfe8ff':'#9ab0d0'; D.fillText(n>=5?(ALI()?'JUDGEMENT CUT READY · attack':'FULL COUNTER READY · attack'):'MELEE PARRIES',gx+110,gy+13);
  if(n>=5){ const [sx,sy,z]=toScreen(P.x,P.y+2.9,P.z); if(z<1){ D.save(); D.textAlign='center'; D.font=`900 ${20+Math.sin(t*10)*2}px ${FB}`; D.lineWidth=5; D.strokeStyle='#081428'; D.strokeText(ALI()?'JUDGEMENT CUT READY':'FULL COUNTER READY',sx,sy); D.fillStyle=ALI()?'#ff8a9a':'#8fd8ff'; D.fillText(ALI()?'JUDGEMENT CUT READY':'FULL COUNTER READY',sx,sy); D.restore(); } } }
(function(){ const dh=drawHUD; drawHUD=function(){ dh(); try{ twDrawCombatHUD(); }catch(e){ console.error('combatHUD',e); } }; })();

// ---------- secret keys (numpad; never shown in on-screen key lists) ----------
// 0 infinite HP · 1 infinite Full Counter (Judgement Cut for Ali) · 2 one-hit kill (empties the bar, skipping limit cuts) · 3 timeline unlock checkboxes · 5 debug mode (99e_debug.js)
// A capture listener registered this early runs ahead of the menus' own key handlers, so the toggles also work with the Esc menu open.
TW.infFC=false; TW.unlockMode=false;
function twCheatToast(text,on){ TW.cheatToast={text,on,t:performance.now()}; Sound.sfx(on?'secret':'block'); }
addEventListener('keydown',e=>{ if(e.repeat||(typeof twRebinding==='function'&&twRebinding())) return; let k=null;
  if(e.code==='Numpad0'){ TW.god=!TW.god; k=['INFINITE HP',TW.god]; }
  else if(e.code==='Numpad1'){ TW.infFC=!TW.infFC; if(!TW.infFC) Player.counter=0; k=[ALI()?'INFINITE JUDGEMENT CUT':'INFINITE FULL COUNTER',TW.infFC]; }
  else if(e.code==='Numpad2'){ TW.otk=!TW.otk; k=['ONE-HIT KILL',TW.otk]; }
  else if(e.code==='Numpad3'){ TW.unlockMode=!TW.unlockMode; k=['TIMELINE UNLOCK',TW.unlockMode]; }
  else if(e.code==='Numpad5'&&typeof dbgToggle==='function'&&Game.state!=='title'){ k=['DEBUG MODE',dbgToggle()]; }
  if(!k) return; e.preventDefault(); e.stopImmediatePropagation(); twCheatToast(k[0]+': '+(k[1]?'ON':'OFF'),k[1]); },true);
(function(){ const up=updatePlayer; updatePlayer=function(dt){ const r=up.apply(this,arguments); if(TW.infFC&&!Game.paulLock) Player.counter=5; return r; }; })();
// one-hit kill skips every limit cut and empties the bar it hits (phase changes and finales still play)
function twOtkSkipLC(T){ if(!TW.otk||TW._ally) return; const F=TW.fight; if(T&&T.lcDone) T.lcDone[T.phase]=1; if(F&&F.lcDone) F.lcDone[F.phase]=1;
  const G=TW.giant; if(G&&G.phase>=2) G.lcDone=1; if(typeof NB!=='undefined'&&NB){ if(NB.phase===2) NB.lcA=1; if(NB.phase===3) NB.lcB=1; } if(Game.boss&&Game.boss.phase===3) Game.boss.domeDone=1; }
(function(){ const th=twHurt; twHurt=function(T,d,src){ if(!['ally','ff','test'].includes(src)) twOtkSkipLC(T); return th.apply(this,arguments); };
  const hh=hzgHurt; hzgHurt=function(d,src){ if(src!=='ally'&&src!=='test') twOtkSkipLC(null); return hh.apply(this,arguments); };
  const nd=nbDamage; nbDamage=function(){ twOtkSkipLC(null); return nd.apply(this,arguments); };
  const db=damageBoss; damageBoss=function(){ twOtkSkipLC(null); return db.apply(this,arguments); }; })();

// ---------- Ignite: releasing a full 6s fireball sets Shayan's sword on fire (8s of double-damage swings, red numbers) ----------
const TW_IGNITE=8;
function twIgnite(){ const P=Player; P.ignite=TW_IGNITE; Sound.sfx('bigfire'); Sound.sfx('ready'); FX.ring(P.x,P.y+.1,P.z,'#ff3a1a',2.6,.45); FX.burst(P.x,P.y+1.2,P.z,30,0xff4a1a,5,.35);
  Game.dmgNums.push({x:P.x,y:P.y+2.8,z:P.z,n:'SWORD IGNITED',t:0,big:true,col:'#ff5a2a'}); }
(function(){ const mh=meleeHits; meleeHits=function(x,z,y,rad,ang,arc,dmg,set){ const P=Player, A=P.atk;
    if(ALI()||!(P.ignite>0)||!A||A.big||set!==A.hit) return mh.apply(this,arguments);
    const n0=Game.dmgNums.length, any=mh(x,z,y,rad,ang,arc,dmg*2,set);
    for(let i=n0;i<Game.dmgNums.length;i++){ const d=Game.dmgNums[i]; if(typeof d.n==='number') d.col='#ff3a2a'; }
    if(any) FX.burst(x+Math.cos(ang)*1.2,y+1.1,z+Math.sin(ang)*1.2,10,0xff5a1a,4,.25); return any; }; })();
// the swing arc burns red while ignited
(function(){ const sa=startAtk; startAtk=function(){ TW._ignArc=!ALI()&&Player.ignite>0; try{ return sa.apply(this,arguments); } finally{ TW._ignArc=false; } };
  const fa=FX.arc; FX.arc=function(){ const n0=scene.children.length, r=fa.apply(FX,arguments); if(TW._ignArc) for(let i=n0;i<scene.children.length;i++){ const m=scene.children[i]; if(m.material&&m.material.color) m.material.color.setHex(0xff3a1a); } return r; }; })();
(function(){ const uw=updateWorld; updateWorld=function(dt){ uw(dt); const P=Player; if(!(P.ignite>0)) return;
    if(ALI()||Game.state==='title'){ P.ignite=0; return; } if(Game.state==='play') P.ignite=Math.max(0,P.ignite-dt);
    if(!P.hidden&&Math.random()<.8){ const hx=P.x+Math.cos(P.ang||0)*.55, hz=P.z+Math.sin(P.ang||0)*.55; FX.spawn(hx+rnd(-.2,.2),P.y+rnd(.8,1.6),hz+rnd(-.2,.2),rnd(-.3,.3),rnd(1,2.4),rnd(-.3,.3),.3,Math.random()<.5?0xff3a1a:0xffb040,.22,0,true); } }; })();
// the buff icon: a small flame above Shayan with a clock wipe that winds down over the 8 seconds
function twDrawIgniteIcon(){ const P=Player; if(ALI()||!(P.ignite>0)||P.hidden||Game.state!=='play') return; const [sx,sy0,z]=toScreen(P.x,P.y+2.1,P.z); if(z>1) return;
  const k=clamp(P.ignite/TW_IGNITE,0,1), r=11, sx2=sx+30, sy=sy0-16, t=performance.now()/1000; D.save();
  D.fillStyle='rgba(20,6,4,.85)'; D.beginPath(); D.arc(sx2,sy,r+2,0,7); D.fill();
  D.fillStyle=`hsl(${16+Math.sin(t*9)*6},100%,52%)`; D.beginPath(); D.moveTo(sx2,sy); D.arc(sx2,sy,r,-Math.PI/2,-Math.PI/2+k*Math.PI*2); D.closePath(); D.fill();
  D.fillStyle='#ffe08a'; D.beginPath(); D.moveTo(sx2,sy-7); D.quadraticCurveTo(sx2+6,sy-1,sx2+3.5,sy+5); D.quadraticCurveTo(sx2,sy+7,sx2-3.5,sy+5); D.quadraticCurveTo(sx2-6,sy-1,sx2,sy-7); D.fill();
  D.fillStyle='#ff5a1a'; D.beginPath(); D.moveTo(sx2,sy-2); D.quadraticCurveTo(sx2+3,sy+2,sx2+1.6,sy+4.5); D.quadraticCurveTo(sx2,sy+5.5,sx2-1.6,sy+4.5); D.quadraticCurveTo(sx2-3,sy+2,sx2,sy-2); D.fill();
  D.strokeStyle=k<.25&&Math.floor(t*6)%2?'#ffffff':'#ffb050'; D.lineWidth=2; D.beginPath(); D.arc(sx2,sy,r+2,-Math.PI/2,-Math.PI/2+k*Math.PI*2); D.stroke(); D.restore(); }
(function(){ const dh=drawHUD; drawHUD=function(){ dh(); try{ twDrawIgniteIcon(); }catch(e){ console.error('igniteHUD',e); } }; })();

// ---------- melee hits on Shayan: keep the flinch, drop the long i-frames, so the next swing of a combo can still be parried ----------
(function(){ const ph=playerHit; playerHit=function(dmg,sx,sz,opt){ const r=ph.apply(this,arguments), P=Player;
    if(!ALI()&&opt&&opt.melee&&(r==='hit'||r==='block')&&P.hp>0&&P.inv<5){ P.inv=Math.min(P.inv,.12); P.hurt=Math.min(P.hurt,.15); } return r; }; })();

// ---------- chorded mouse buttons: holding one button and pressing the other fires no pointerdown/up, only a pointermove with new e.buttons ----------
const TW_MB={attack:false,block:false};
function twSyncMouse(e){ if(e.pointerType!=='mouse'||typeof e.buttons!=='number'||(typeof TLM!=='undefined'&&TLM.open&&e.buttons)) return; const want={attack:!!(e.buttons&1),block:!!(e.buttons&2)};
  for(const a of ['attack','block']) if(want[a]!==TW_MB[a]){ TW_MB[a]=want[a]; if(want[a]) press(a); else release(a); } }
['pointermove','pointerdown','pointerup'].forEach(ev=>ui.addEventListener(ev,twSyncMouse));

// ---------- parry pips never carry over between tries (or into a new level/warp) ----------
(function(){ const rs=respawn; respawn=function(){ Player.counter=0; TW.cReadyT=0; return rs.apply(this,arguments); };
  const rp=resetPlayer; resetPlayer=function(){ const r=rp.apply(this,arguments); Player.counter=0; return r; }; })();
