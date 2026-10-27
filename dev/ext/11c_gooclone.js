// =====================================================================
// CAOTAN'S GOO CLONE (Impregnate's punishment, 11b_impregnate.js). The pink sperm reaches you: you're knocked down for 3s
// (invulnerable, Caotan holds his attacks) and a white goo copy of you squeezes out and talks trash. As you get up it
// double dashes away, charges a full fireball and shoots it (parry it and it's deflected away, never back to him), its sword
// ignites and it rushes you slashing like a maniac (one timed parry = he swings three times like you do: an automatic triple
// parry, then he bursts into 4 sticky splotches of white goo). Dodge the rush or eat it: two jump dashes away, charge, repeat.
// Up close he auto-parries swings and projectiles (his charge keeps going); use the Drill and he drills back, cancelling yours.
// White goo (these splotches, Caotan's goo puddles and goo pellets) gives Omar's goop slow debuff (twGoopSlow, 22_omar3.js).
// =====================================================================
const IMPC={dash:18, charge:1.4, fbSp:15, fbDmg:3, rushSp:17, rushDmg:0, down:3};
IMP.down=null; IMP.clone=null;
NAMES.gooshayan='Goo Shayan'; NAMES.gooali='Goo Ali';
// the sperm got you
function impDown(){ const P=Player; Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'IMPREGNATED?!',t:0,big:true,col:'#ff8ac8'}); Sound.sfx('doki'); Sound.sfx('squelch');
  twHeartBurst(P.x,P.z,24); shake(.5); FX.hitstop=Math.max(FX.hitstop,.1); FX.burst(P.x,P.y+1,P.z,24,0xff8ac8,4,.3);
  twBark('caotan',"Congratulations, senpai! It's a... it's a YOU!",true);
  IMP.down={t:0,dur:IMPC.down}; P.atk=null; P.charge=0; P.fbHolding=false; P.dash=0; P.vx=P.vz=0; impClone(P.x,P.z); }
// downed: no input, invulnerable, lying there (Shayan's death frames, reversed as he gets up)
(function(){ const up=updatePlayer; updatePlayer=function(dt){ const D=IMP.down, P=Player; if(!D) return up.apply(this,arguments);
    try{ P.hurt=Math.max(P.hurt||0,.1); P.atk=null; P.charge=0; P.fbHolding=false; P.dash=0; }catch(e){}
    const r=up.apply(this,arguments);
    try{ P.anim='dead'; P.vx=P.vz=0; P.inv=Math.max(P.inv,.3); P.noBlink=Game.time+.3; P.atk=null; }catch(e){ console.error('imp down',e); } return r; }; })();
(function(){ const dd=drawShayanHD; drawShayanHD=function(c,cx,by,f,s){ const D=IMP.down, P=Player;
    if(D&&s&&s.anim==='dead'&&P&&s.t===P.t&&!ALI()&&SHA.ok&&SHA.img){ try{ const left=D.dur-D.t, k=left<.45?Math.max(0,left/.45):Math.min(1,D.t/.45);
        shBlit(c,shFrame('dead',Math.min(7,Math.floor(k*7.99))),cx,by,0,0,0,1); SHA.drawn=true; return; }catch(e){} }
    return dd.apply(this,arguments); }; })();
// Caotan holds his attacks while you're down, and doesn't Impregnate again while a clone is out
(function(){ const pk=twPick; twPick=function(T){ if(IMP.down&&T&&T.who==='caotan') return null; let k=pk.apply(this,arguments);
    const busy=()=>!!IMP.clone||IMP.list.length>0; for(let i=0;i<3&&k==='impregnate'&&busy();i++) k=pk.apply(this,arguments); return k==='impregnate'&&busy()?null:k; }; })();
// the clone: a hazard (twClearHz removes it with everything else)
function impClone(x,z){ const spr=new Sprite3D(96,96); spr.show(false);
  const C={x,z,y:groundY(x,z),gy:groundY(x,z),ang:0,st:'emerge',t:0,k:0,n:0,spr,al:ALI(),anim:'idle',ign:0,swU:0,swN:0,lastSw:Player.swingT||0,wasSw:false,sayT:0,emerge:0,ek:0,rushes:0,dead:false};
  IMP.clone=C;
  twHz({upd(dt,play){ try{ if(play) impCloneUpd(C,dt); impCloneDraw(C); }catch(e){ console.error('goo clone',e); C.dead=true; } if(C.dead){ impCloneEnd(C); return false; } return true; },
    kill(){ impCloneEnd(C); }});
  return C; }
function impCloneEnd(C){ if(C.ended) return; C.ended=1; try{ C.spr.dispose(); }catch(e){} if(C.fb) C.fb.dead=true; if(IMP.clone===C) IMP.clone=null;
  if(IMP.down){ IMP.down=null; const P=Player; P.hurt=0; P.inv=Math.max(P.inv,.5); } }
function impGo(C,st){ C.st=st; C.k=0; C.n=0; C.hopA=null; }
function impCloneUpd(C,dt){ const P=Player, T=TW.foes.find(t=>t.who==='caotan'), sp=T?twSp(T):1, toP=Math.atan2(P.z-C.z,P.x-C.x), away=toP+Math.PI;
  C.t+=dt; C.k+=dt; C.gy=groundY(C.x,C.z); C.swU=Math.min(1,C.swU+dt/.18); C.sayT-=dt;
  const step=(a,v)=>{ const q=twClampXZ(C.x+Math.cos(a)*v*dt,C.z+Math.sin(a)*v*dt,1); C.x=q.x; C.z=q.z; };
  if(C.ign&&Math.random()<.7) FX.spawn(C.x+Math.cos(C.ang)*.6,C.y+rnd(.8,1.6),C.z+Math.sin(C.ang)*.6,rnd(-.3,.3),rnd(1,2.5),rnd(-.3,.3),.35,Math.random()<.5?0xff5a1a:0xffc03a,.25,0,true);
  if(Math.random()<.25) FX.spawn(C.x+rnd(-.4,.4),C.y+rnd(.3,1.4),C.z,0,-1.5,0,.5,0xf4f0e6,.14,6,false); /* goo drips */
  if(['dash2','charge','shot','tell','retreat'].includes(C.st)) impAutoParry(C);
  if(C.st==='emerge'){ const D=IMP.down; if(D) D.t+=dt; C.ang=toP; C.anim='idle';
    if(!C.emerge&&C.t>.55){ C.emerge=1; const a=rnd(0,6.28), q=twClampXZ(P.x+Math.cos(a)*1.4,P.z+Math.sin(a)*1.4,1); C.x=q.x; C.z=q.z; C.gy=groundY(C.x,C.z); C.y=C.gy;
      Sound.sfx('squelch'); Sound.sfx('gore'); shake(.3); FX.burst(P.x,P.y+.8,P.z,36,0xffffff,5,.35,false); FX.burst(C.x,C.y+1,C.z,20,0xf4f0e6,3,.3,false);
      Game.dmgNums.push({x:C.x,y:C.y+3,z:C.z,n:"IT'S A... YOU?!",t:0,big:true,col:'#ffffff'}); }
    if(C.emerge) C.ek=Math.min(1,C.ek+dt/.45);
    if(C.t>.8&&!C.said1){ C.said1=1; if(C.al) twBark('gooali',"Hi, Dad. I'm four seconds old and I already want you dead.",true); else twBark('gooshayan',"Hi, Dad. I'm four seconds old and I already want you dead.",true); }
    if(C.t>2&&!C.said2){ C.said2=1; twBark('caotan',"He has your eyes, senpai! And my... everything else!",true); }
    if(!D||D.t>=D.dur){ IMP.down=null; P.hurt=0; P.inv=Math.max(P.inv,.5); P.anim='idle'; C.emerge=1; C.ek=1;
      if(C.al) twBark('gooali',"There's only room for one Ali in this fight. And I'm way stickier.",true); else twBark('gooshayan',"There's only room for one Shayan in this fight. And I'm way stickier.",true);
      impGo(C,'dash2'); } return; }
  if(C.st==='dash2'){ // two quick dashes away from you
    if(C.n>=2){ impGo(C,'charge'); return; }
    if(C.k<.2){ if(C.hopA==null){ C.hopA=away+rnd(-.5,.5); Sound.sfx('dash'); } C.ang=C.hopA; C.anim='run'; step(C.hopA,IMPC.dash); FX.spawn(C.x,C.y+rnd(.3,1.4),C.z,0,0,0,.25,0xffffff,.3,0,true); }
    else { C.anim='idle'; C.ang=toP; if(C.k>=.32){ C.n++; C.k=0; C.hopA=null; } } return; }
  if(C.st==='charge'){ C.ang=toP; C.anim='charge'; C.y=lerp(C.y,C.gy,Math.min(1,dt*10)); const T0=IMPC.charge/sp;
    if(!C.n){ C.n=1; Sound.sfx('charge'); }
    if(Math.hypot(P.x-C.x,P.z-C.z)<3.5) step(away,7); /* crowded: he backs off without breaking the charge */
    if(Math.random()<.8){ const a=rnd(0,6.28); FX.spawn(C.x+Math.cos(a)*.9,C.y+rnd(.6,1.6),C.z+Math.sin(a)*.9,-Math.cos(a)*2,1,-Math.sin(a)*2,.3,C.k>T0*.7?0xffd040:0xff6a1a,.22,0,true); }
    if(C.k>=T0){ Sound.sfx('ready'); FX.ring(C.x,C.y+.1,C.z,'#ff8a2a',2,.4); impShoot(C); C.ign=1; C.anim='shoot';
      Game.dmgNums.push({x:C.x,y:C.y+2.8,z:C.z,n:'SWORD IGNITED',t:0,col:'#ff5a2a'}); impGo(C,'shot'); } return; }
  if(C.st==='shot'){ C.anim=C.k<.3?'shoot':'idle'; C.ang=toP; if(C.k>=.55){ impRushBegin(C,sp); impGo(C,'tell'); } return; }
  if(C.st==='tell'){ const R=C.R; C.anim='idle'; impRushWatch(C); if(Game.time>=R.tEnd){ Sound.sfx('dash'); impGo(C,'rush');
      if(!C.rushes++){ if(C.al) twBark('gooali',"My sword's on fire too! HAHAHA! MURDER TIME!",true); else twBark('gooshayan',"My sword's on fire too! HAHAHA! MURDER TIME!",true); } } return; }
  if(C.st==='rush'){ const R=C.R; step(R.a,IMPC.rushSp); R.trav+=IMPC.rushSp*dt; C.ang=R.a; C.anim='swing'; twRushTell(C,R.a);
    R.slT-=dt; if(R.slT<=0){ R.slT=.09; C.swN++; C.swU=0; Sound.sfx('swing'); try{ pxvSlash('sh_fslash',C.x,C.gy,C.z,R.a+rnd(-.6,.6),C.swN%2,2.4); }catch(e){} }
    impRushWatch(C);
    if(Math.hypot(P.x-C.x,P.z-C.z)<TW_DASH_R&&Math.abs(P.y-C.gy)<2.4){ const r=twStrictDo(R.from,()=>twHitP(IMPC.rushDmg,C.x,C.z,{melee:true,win:TW_DASH_WIN}));
      if(r==='parry'){ const a=Math.atan2(C.z-P.z,C.x-P.x), q=twClampXZ(P.x+Math.cos(a)*1.5,P.z+Math.sin(a)*1.5,1); C.x=q.x; C.z=q.z; C.ang=a+Math.PI; impGo(C,'triple'); return; }
      if(r!=='none'){ if(twStrictFirst(R.from0)){ /* you swung, just not on time */ Game.dmgNums.push({x:C.x,y:C.y+3,z:C.z,n:'TOO EARLY!',t:0,big:true,col:'#ffffff'});
          if(C.al) twBark('gooali',"Too early! Rookie mistake. Trust me, I'd know. I'm you.",true); else twBark('gooshayan',"Too early! Rookie mistake. Trust me, I'd know. I'm you.",true); }
        impGo(C,'retreat'); C.ign=0; return; } }
    if(R.trav>=R.d){ impGo(C,'retreat'); C.ign=0; } return; }
  if(C.st==='triple'){ // he swings like you do, three times: every swing is parried for you
    C.ang=toP; C.anim='swing';
    if(C.n<2&&C.k>=.26*(C.n+1)){ C.n++; C.swU=0; C.swN++; Sound.sfx('swing'); try{ pxvSlash('sh_fslash',C.x,C.gy,C.z,toP,C.swN%2,2.4); }catch(e){} twMeleeParry(C.x,C.z,{});
      if(C.n===2){ if(C.al) twBark('gooali',"Wait, you can't parry yourself three ti- BLEGH!",true); else twBark('gooshayan',"Wait, you can't parry yourself three ti- BLEGH!",true); } }
    if(C.k>=.95){ impPop(C); C.dead=true; } return; }
  if(C.st==='retreat'){ // two jump dashes away from you
    if(C.n>=2){ C.y=C.gy; impGo(C,'charge'); return; }
    const u=Math.min(1,C.k/.38); if(C.hopA==null){ C.hopA=away+rnd(-.6,.6); Sound.sfx('djump'); FX.ring(C.x,C.gy+.05,C.z,'#ffffff',1.2,.3); }
    C.ang=C.hopA; C.anim='jump'; step(C.hopA,13); C.y=C.gy+Math.sin(u*Math.PI)*1.8; FX.spawn(C.x,C.y+rnd(.3,1.3),C.z,0,0,0,.25,0xffffff,.28,0,true);
    if(u>=1){ C.y=C.gy; C.n++; C.k=0; C.hopA=null; } return; }
  if(C.st==='drill'){ C.ang=toP; C.anim='jump'; return; } }
// up close: your swings and your projectiles get parried (no damage); his charge keeps going
function impAutoParry(C){ const P=Player, s=impSwinging(), sw=P.swingT||0, start=sw!==C.lastSw||(s&&!C.wasSw); C.lastSw=sw; C.wasSw=s;
  if(start&&Math.hypot(P.x-C.x,P.z-C.z)<2.7&&Math.abs(P.y-C.y)<2) impClash(C,lerp(C.x,P.x,.4),C.y+1.1,lerp(C.z,P.z,.4));
  for(const f of TW.fb||[]){ if(f.life>0&&Math.hypot(f.x-C.x,f.z-C.z)<f.r+.8&&Math.abs(f.y-(C.y+1.1))<1.8){ f.life=0; impClash(C,f.x,f.y,f.z); } }
  for(const b of (typeof BEAMS!=='undefined'?BEAMS:[])||[]){ if(b&&!b.dead&&b.hit&&!b.hit.has(C)&&Math.hypot(b.x-C.x,b.z-C.z)<1.6){ b.hit.add(C); impClash(C,b.x,C.y+1.1,b.z); } } }
function impClash(C,x,y,z){ C.anim='swing'; C.swU=0; C.swN++; Sound.sfx('parry'); FX.spark(x,y,z); FX.spark(x,y+.1,z); FX.ring(x,C.gy+.1,z,'#ffffff',1.6,.3); shake(.2);
  Game.dmgNums.push({x:C.x,y:C.y+2.6,z:C.z,n:'PARRIED',t:0,col:'#ffffff'});
  if(C.sayT<=0){ C.sayT=6; if(C.al) twBark('gooali',"Nope. I know all your moves. I AM your moves."); else twBark('gooshayan',"Nope. I know all your moves. I AM your moves."); } }
// the full fireball: parried or swung at, it's knocked away along your swing and fizzles (it never goes back to him)
function impShoot(C){ const P=Player, a=Math.atan2(P.z-C.z,P.x-C.x), d=Math.hypot(P.x-C.x,P.z-C.z), g=new THREE.Group(), y0=C.y+1.1, sp=IMPC.fbSp;
  const core=new THREE.Mesh(new THREE.SphereGeometry(.42,10,8),new THREE.MeshBasicMaterial({color:0xff3a5a})), inner=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),new THREE.MeshBasicMaterial({color:0xffd0d8}));
  g.add(core); g.add(inner); g.userData.tw=1; scene.add(g);
  const F={g,core,x:C.x+Math.cos(a)*.7,y:y0,z:C.z+Math.sin(a)*.7,vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:clamp(((P.y+1.1)-y0)/Math.max(.3,d/sp),-6,6),t:0,defl:false,dead:false};
  try{ const e=pxvPlay('fireball_burn',{x:0,y:0,z:0,size:2.3,depth:true}); if(e){ g.add(e.m); e.m.position.set(0,.3,0); e.g=g; e.noAim=true; } }catch(e){ console.error('goo clone fireball flames',e); } /* Shayan's charged fireball look (06c_pxvfx) */
  C.fb=F; Sound.sfx('bigfire'); shake(.3); FX.burst(C.x,C.y+1.1,C.z,24,0xff1a3a,5,.3);
  twHz({upd(dt,play){ if(play&&!F.dead){ try{ impFbUpd(F,dt); }catch(e){ console.error('goo clone fireball',e); F.dead=true; } } if(F.dead){ scene.remove(g); return false; } return true; }, kill(){ F.dead=true; scene.remove(g); }});
  return F; }
function impFbUpd(F,dt){ const P=Player; F.t+=dt; F.x+=F.vx*dt; F.y+=F.vy*dt; F.z+=F.vz*dt; F.g.position.set(F.x,F.y,F.z);
  if(Math.random()<.9) FX.spawn(F.x,F.y,F.z,-F.vx*.05,rnd(0,.6),-F.vz*.05,.25,F.defl?0x9fe0ff:(Math.random()<.5?0xff0a30:0xff5a70),.5,0,true);
  if(F.t>(F.defl?.9:2.2)||F.y<groundY(F.x,F.z)-.2||cellH(F.x,F.z)>F.y+.3){ FX.burst(F.x,F.y,F.z,20,F.defl?0x9fe0ff:0xff1a3a,5,.3); F.dead=true; return; }
  if(F.defl) return;
  const d=Math.hypot(P.x-F.x,P.z-F.z);
  if(d<2.4&&Math.abs(F.y-P.y-1)<1.9&&impSwinging()&&(d<.9||angDiff(Math.atan2(F.z-P.z,F.x-P.x),P.ang)<1.7)){ impDeflect(F); return; }
  if(d<.8&&F.y>P.y-.1&&F.y<P.y+2){ const r=twHitP(IMPC.fbDmg,F.x,F.z,{onParry:()=>impDeflect(F)}); if(r==='hit'||r==='block'){ twFireballHit({big:true},F.x,F.y,F.z); F.dead=true; } } }
function impDeflect(F){ const P=Player, a=P.ang||0; F.defl=true; F.t=0; F.vx=Math.cos(a)*22; F.vz=Math.sin(a)*22; F.vy=0; try{ F.core.material.color.setHex(0x9fe0ff); }catch(e){}
  Sound.sfx('deflect'); Sound.sfx('parry'); FX.spark(F.x,F.y,F.z); FX.burst(F.x,F.y,F.z,12,0x9fe0ff,4,.22); Game.slowT=Math.max(Game.slowT,.18); addSP(2);
  Game.dmgNums.push({x:F.x,y:F.y+.6,z:F.z,n:'DEFLECT',t:0,col:'#9fe0ff'}); }
// the rush: the usual rush timing (tell .6/sp, the first press in his lane after tell + grace is judged in TW_DASH_WIN)
function impRushBegin(C,sp){ const P=Player, a=Math.atan2(P.z-C.z,P.x-C.x), d=Math.min(15,Math.hypot(P.x-C.x,P.z-C.z)+3.5), tell=.6/sp;
  C.R={a,ux:Math.cos(a),uz:Math.sin(a),d,sx:C.x,sz:C.z,from:Game.time+TW_STRICT.grace,from0:Game.time+TW_STRICT.grace,tEnd:Game.time+tell,trav:0,slT:0};
  C.ang=a; FX.line(C.x,C.z,a,d,2.6,0xff8a3a,tell); Sound.sfx('ting'); }
function impRushWatch(C){ const R=C.R; for(let g=0;g<40;g++){ const p=twStrictFirst(R.from); if(!p) return; const P=Player, rx=P.x-R.sx, rz=P.z-R.sz, al=rx*R.ux+rz*R.uz, pe=Math.abs(rx*R.uz-rz*R.ux);
    if(al<-.5||al>R.d+.5||pe>1.6){ R.from=p.t; continue; } return; } }
// three parries: he bursts into 4 splotches of white goo that stay on the floor
function impPop(C){ Sound.sfx('squelch'); Sound.sfx('gore'); Sound.sfx('slam'); shake(.6); FX.hitstop=Math.max(FX.hitstop,.12);
  FX.burst(C.x,C.y+1,C.z,60,0xffffff,7,.4,false); FX.burst(C.x,C.y+1,C.z,30,0xf4f0e6,4,.35,false); FX.ring(C.x,C.gy+.1,C.z,'#ffffff',3,.4);
  Game.dmgNums.push({x:C.x,y:C.y+3,z:C.z,n:'SPLAT',t:0,big:true,col:'#ffffff'}); twBark('caotan',"JUNIOR?! ...That's okay. I can always make more.",true);
  const a0=rnd(0,6.28); for(let i=0;i<4;i++){ const a=a0+i*Math.PI/2+rnd(-.35,.35), r=rnd(1.8,3.2), q=twClampXZ(C.x+Math.cos(a)*r,C.z+Math.sin(a)*r,1);
    for(let j=0;j<8;j++) FX.spawn(C.x,C.y+1,C.z,(q.x-C.x)*2+rnd(-1,1),rnd(3,5),(q.z-C.z)*2+rnd(-1,1),.5,0xffffff,.3,12,false);
    twZone(q.x,q.z,1.25,999,{splat:1,op:.95,col:0xfaf6ff}); } }
// the Drill: he drills right back and the two cancel out
(function(){ const sa=specialAttack; specialAttack=function*(){ const C=IMP.clone; if(C&&!C.dead&&C.st!=='emerge'&&!ALI()&&TW.fight){ yield* impDrillClash(C); return; } yield* sa.apply(this,arguments); }; })();
function* impDrillClash(C){ const P=Player, pin=typeof drPin==='function'?drPin():null, gy=P.y; let d=null, e=null;
  try{ P.sp=0; P.inv=99; P.atk=null; P.charge=0; P.vx=P.vz=0; P.cineFly=true; P.cineAnim='jump'; Sound.sfx('djump'); impGo(C,'drill'); if(C.fb) C.fb.dead=true;
    twBark('gooshayan',"Oh, you're doing the drill? I'm doing the drill.",true);
    yield tween(P,{y:gy+2},.35,t=>1-Math.pow(1-t,3)); P.cineAnim='charge';
    d=makeDrill(); e=makeDrill(); for(const [q,o] of [[d,P],[e,C]]){ q.x=o.x; q.y=(o===C?C.gy:gy)+5.2; q.z=o.z; q.s=.1; q.spin=10; q.fire=.4; q.dir.set(0,-1,0); }
    Sound.sfx('charge'); for(let w=0;w<1;w+=.05){ d.s=e.s=.1+w*.55; d.spin=e.spin=10+w*40; d.fire=e.fire=.4+w; C.y=lerp(C.y,C.gy+2,.25); yield wait(.05); }
    const mx=(d.x+e.x)/2, my=Math.max(d.y,e.y)+.4, mz=(d.z+e.z)/2; d.dir.set(mx-d.x,my-d.y,mz-d.z); e.dir.set(mx-e.x,my-e.y,mz-e.z); d.spin=e.spin=55; d.fire=e.fire=2.2; Sound.sfx('beam'); yield wait(.2);
    const s0=[d.x,d.y,d.z,e.x,e.y,e.z]; for(let u=0;u<=1.001;u+=.125){ const k=u*u*.85; d.x=lerp(s0[0],mx,k); d.y=lerp(s0[1],my,k); d.z=lerp(s0[2],mz,k); e.x=lerp(s0[3],mx,k); e.y=lerp(s0[4],my,k); e.z=lerp(s0[5],mz,k); yield wait(.03); }
    impactFrame([[1,3],[2,3],[3,2]]); shake(1.2); FX.hitstop=.14; Sound.sfx('slam'); Sound.sfx('crossboom');
    FX.burst(mx,my,mz,80,0xffffff,10,.4,false); FX.burst(mx,my,mz,60,0xff3a1a,9,.35); for(let i=0;i<3;i++) FX.ring(mx,groundY(mx,mz)+.1,mz,i?'#ffffff':'#ff3a2a',3+i*2,.4+i*.1);
    Game.dmgNums.push({x:mx,y:my,z:mz,n:'DRILL CANCELLED',t:0,big:true,col:'#ffffff'});
    for(const q of [d,e]){ q.fire=0; q.dead=1; scene.remove(q.g); } d=e=null; try{ fxLights[1].intensity=0; }catch(err){}
    yield wait(.45);
  } finally { for(const q of [d,e]) if(q){ q.dead=1; scene.remove(q.g); } P.cineFly=false; P.cineAnim=null; P.inv=.8; P.vy=-2; if(pin) pin.dead=1; if(!C.dead&&C.st==='drill'){ C.y=C.gy; impGo(C,'charge'); } } }
// drawing: your sprite (8 directions for Shayan), soaked in white goo, dripping
function impCloneDraw(C){ const s=C.spr; if(!C.emerge){ s.show(false); return; } s.show(true);
  s.draw((c,cx,by)=>{ impCloneFig(C,c,cx,by); impGooTint(c,cx,by,C.t); });
  const sc=(C.al?ALS.ok:SHA.ok)?.8:1, k=C.ek; s.mesh.scale.set(sc*(1+.3*(1-k)),sc*Math.max(.05,k),1); s.place(C.x,C.y,C.z,C.gy); }
function impCloneFig(C,c,cx,by){ const f=Math.cos(C.ang)>=0?1:-1, a=C.anim, t=C.t;
  if(C.al){ drawAliHD(c,cx,by,f,{t,anim:a==='swing'?'attack':a==='shoot'?'beam':a}); return; }
  if(!(SHA.ok&&SHA.img)){ drawShayanHD(c,cx,by,f,{t,anim:a==='swing'?'attack':a==='shoot'?'beam':a,ap:a==='swing'?C.swU:0,combo:C.swN%3}); return; }
  const dir=shDirIdx(C.ang); let fr;
  if(a==='run') fr=shFrame('run',dir,Math.floor(t*14)%4);
  else if(a==='jump') fr=shFrame('jump',dir,4);
  else if(a==='swing') fr=shFrame('swing',dir,Math.min(6,Math.floor(C.swU*7)));
  else if(a==='charge') fr=shFrame('punch',dir,1);
  else if(a==='shoot') fr=shFrame('punch',dir,4);
  else fr=shFrame('rot',dir,0);
  shBlit(c,fr,cx,by,0,0,0,1); }
// the goo: every pixel recoloured into a solid white-goo ramp by its brightness (features stay readable, bands pushed bright), lumps on top, a wet highlight rim on top
// edges, cool shade on the bottom ones, glints sliding over him, a slow wobble, drips that stretch and fall, and a puddle at his feet
const IMP_GOO=[[124,122,146],[198,196,210],[234,232,226],[250,249,244]];
function impGooTint(c,cx,by,t){ const W=96, H=96; let im=null; try{ im=c.getImageData(0,0,W,H); }catch(e){} if(!im||!im.data||im.data.length<W*H*4) return;
  const d=im.data, src=new Uint8ClampedArray(d), on=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&src[(y*W+x)*4+3]>40, drips=[], bumps=[];
  for(let y=0;y<H;y++){ const sh=y<by-6?Math.round(Math.sin(t*5+y*.32)*.8):0; /* the wobble: rows sway by a pixel, the feet stay put */
    for(let x=0;x<W;x++){ const o=(y*W+x)*4, sx=x-sh; if(!on(sx,y)){ d[o+3]=0; continue; } const i=(y*W+sx)*4, L=(src[i]*.3+src[i+1]*.59+src[i+2]*.11)/255;
      let col=IMP_GOO[L<.07?0:L<.17?1:L<.42?2:3];
      if(!on(sx,y-1)||(!on(sx-1,y)&&L>.3)) col=[255,255,255]; else if(!on(sx,y+1)||!on(sx+1,y)) col=IMP_GOO[L<.07?0:1];
      if(((x*7+y*13+Math.floor(t*6))%61)===0) col=[255,255,255];
      d[o]=col[0]; d[o+1]=col[1]; d[o+2]=col[2]; d[o+3]=255;
      if(!on(sx,y-1)&&((x*29+y*7)%5)===0) bumps.push([x,y]);
      if(!on(sx,y+1)&&y<by-5&&((x*37+y*11)%4)===0) drips.push([x,y]); } }
  c.putImageData(im,0,0);
  for(const [x,y] of bumps){ c.fillStyle='#faf9f4'; c.fillRect(x-1,y-1,3,1); c.fillStyle='#ffffff'; c.fillRect(x,y-2,1,1); } /* lumpy top edges */
  for(const [x,y] of drips){ const ph=(t*.7+((x*13)%10)/10)%1, len=Math.max(0,Math.round(1+ph*7)); c.fillStyle='#e2dfd6'; c.fillRect(x,y+1,1,len); c.fillRect(x-1,y+len,3,2); c.fillStyle='#ffffff'; c.fillRect(x-1,y+len,1,1);
    if(ph>.8){ const fy=y+len+3+Math.round((ph-.8)*40); if(fy<by) { c.fillStyle='#f7f5ee'; c.fillRect(x,fy,1,2); } } }
  const pw=11+Math.round(Math.sin(t*2)*1.5); c.fillStyle='#b9b7c2'; c.fillRect(cx-pw,by-1,pw*2,2); c.fillStyle='#e2dfd6'; c.fillRect(cx-pw+2,by-2,pw*2-4,2); c.fillStyle='#ffffff'; c.fillRect(cx-pw+4,by-2,4,1); }
// white goo slows you (Omar's goop debuff): the goo splats on the floor and the goo pellets
(function(){ const zn=twZone; twZone=function(x,z,r,dur,o){ const h=zn.apply(this,arguments);
    try{ if(o&&o.splat&&h){ const u=h.upd; h.upd=function(dt,play){ const k=u.apply(this,arguments); try{ if(play&&this.t>.2&&!IMP.down&&twInR(x,z,r,.6)) twGoopSlow(); }catch(e){ console.error('goo slow',e); } return k; }; } }catch(e){}
    return h; };
  const ub=updateBolts; updateBolts=function(dt){ const P=Player; let near=false;
    try{ for(const b of BOLTS) if(b.kind==='goo'&&!b.friendly&&b.col===0xffffff&&Math.hypot(P.x-b.x,P.z-b.z)<1.6) near=true; }catch(e){}
    IMP._gooNear=near; try{ return ub.apply(this,arguments); } finally{ IMP._gooNear=false; } };
  const hp=hurtPlayer; hurtPlayer=function(){ const r=hp.apply(this,arguments); try{ if(IMP._gooNear) twGoopSlow(); }catch(e){ console.error('goo slow',e); } return r; }; })();
