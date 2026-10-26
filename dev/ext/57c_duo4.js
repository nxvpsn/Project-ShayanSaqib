// =====================================================================
// THE DOUBLE FIGHT, ROUND 3 (on top of 57/57b/58):
// - 1.5x shared HP, Ali deals 1.1x, AI Ali revives Shayan every time he falls (no limit)
// - co-op: the friend playing Ali gets the 25% assists too (the game briefly takes Ali over, then hands him back)
// - more moves, more lasers, more scythes; tighter gaps between moves
// - Scythe Rain at 100 planted, cast mid-fight (no counter on screen, no cutscene)
// - the Getsuga clash is a real clash of crescents (bigger), with its mash bar
// - both limit cuts rebuilt, cinematics included, run inside the fight with wide shots:
//     EVENT HORIZON (Omar, phase II): five black suns, 21 Getsugas, 200 scythes, a falling sun
//     MEGANE APOCALYPSE (Caotan, phase III): twenty glints (his solo ten, then worse) with Omar on top, a giant
//       Hikari-chan, and a Megane Supernova you survive only in her shadow while a black hole drags her away
// - camera: a tracked, zoomed-out follow cam during the limit cuts, always restored (also on retry and on leaving)
// =====================================================================
DUO3.hp=[0,345,390,435]; DUO3.gap=[0,.8,.6,.45]; DUO3.rain=100; DUO3.seed=[0,0,30,45];
for(const k of [1,2,3]) DUO_HP[k]=DUO_SHARED_HP[k]=DUO3.hp[k];
DUO3_POOL[1].push('laserStorm');
DUO3_POOL[2].push('laserStorm','scytheCyclone','getsugaGauntlet');
DUO3_POOL[3].push('laserStorm','scytheCyclone','getsugaGauntlet','pillowHoles','doubleCage');
Object.assign(DUO3_RANGED,{laserStorm:'caotan',scytheCyclone:'omar',getsugaGauntlet:'omar',pillowHoles:'caotan',doubleCage:'caotan'});
twDrawGraveyard=function(){}; // no counter: the rain just happens

// ---------- Ali: 1.1x damage in the duo, revives without limit ----------
(function(){ const th=twHurt; twHurt=function(T,d,src){ const F=TW.fight; if(TW._ally&&F&&F.kind==='duo') d*=1.1; return th.call(this,T,d,src); }; })();
// (installed when a duo fight starts, so it sits outside 58's three-revive wrapper and keeps it from ever running out)
(function(){ const ds=twDuoStart; twDuoStart=function(){ if(!TW._odInf){ TW._odInf=1; const od=Game.onDeath; Game.onDeath=function(){ const F=TW.fight; if(F&&F.kind==='duo') F.heals=Math.min(F.heals||0,2); return od.apply(this,arguments); }; } return ds.apply(this,arguments); }; })();
const TW_REV_BARKS=[["Don't move. I'm cutting through your injuries. They had it coming.","Did you just heal me... with a SWORD?!"],["I sliced your wounds in half. Both halves surrendered.","That is NOT how medicine works!"],
  ["I cut the death off you. It was a sloppy death anyway.","...I'm not even gonna ask."],["Again? You're making this a hobby.","It's a lifestyle at this point."],["Get up. They're laughing at you.","They're laughing at EVERYTHING!"]];
twAliRevive=function*(F){ const P=Player, A=twAliAI(), gy=groundY(P.x,P.z), sat=grade.uniforms.sat.value; F.revN=(F.revN||0)+1; const B=TW_REV_BARKS[(F.revN-1)%TW_REV_BARKS.length];
  if(!A){ P.hp=P.maxHp; P.inv=1; return; }
  Game.letterTo=.4; P.cineFly=true; P.cineAnim='hurt'; P.vx=P.vz=P.vy=0; P.y=gy; A.hold=1; A.down=0; A.hp=A.maxHp; grade.uniforms.sat.value=.25; Sound.sfx('drone');
  try{ cineSet(P.x+2.6,gy+2.4,P.z+8,P.x,gy+.9,P.z); yield wait(.4);
    aliGhost(A.x,A.y,A.z); A.x=P.x-1.3; A.z=P.z+.35; A.face=1; FX.burst(A.x,A.y+1,A.z,30,0xb0182a,5,.35); Sound.sfx('dash'); twBark('ali',B[0],true); yield wait(1.4);
    Sound.sfx('secret'); JC.flash=.35; for(let i=0;i<6;i++){ twTinyJC(P.x,P.y+1,P.z,180+i*20); FX.cut(P.x,P.y+1,P.z); Sound.sfx(i%2?'swing':'hit'); yield wait(.06); }
    P.hp=P.maxHp; P.cineAnim='idle'; FX.ring(P.x,gy+.1,P.z,'#8affb0',3,.5); FX.burst(P.x,gy+1,P.z,40,0x8affb0,5,.3); Sound.sfx('heart'); FX.flash=.4; grade.uniforms.flashCol.value.set(.5,1,.6);
    Game.dmgNums.push({x:P.x,y:P.y+2.8,z:P.z,n:'ALI: GET UP',t:0,big:true,col:'#8affb0'}); twBark('shayan',B[1],true); yield wait(1.1);
  } finally { grade.uniforms.sat.value=sat; P.hp=Math.max(P.hp,1); P.cineFly=false; P.cineAnim=null; A.hold=0; A.face=null; Cam.cine=null; Game.letterTo=0; P.inv=1.5; } };

// ---------- co-op: the friend's Ali gets the assists (the host rolls them and briefly drives him) ----------
function twAliAssister(){ const a=twAliAI(); if(a) return a; if(!TW.coop) return null; return TW.allies.find(x=>x.who==='ali'&&x.remote&&!x.gone&&!x.hidden)||null; }
twDuo3Roll=function(F,k,mid){ const A=twAliAssister(); if(!twAliReady(A)||F.lc) return; if(Math.random()<.25) F.guard={mid,n:0};
  const who=DUO3_RANGED[k]; if(who&&Math.random()<.25) F.kick={mid,who,at:Game.time+rnd(.9,1.3)}; };
twDuo3Assist=function(F,dt,play){ if(!play) return; const A=twAliAssister();
  if(F.revQ&&!Game.script&&Game.state==='play'){ F.revQ=0; run(function*(){ yield* twAliRevive(F); }); return; }
  const K=F.kick; if(K&&Game.time>=K.at){ F.kick=null; if(K.mid===F.mid&&F.busy&&!F.lc&&!F.grabbed&&twAliReady(A)&&(F.C.gen||F.O.gen)){ twAliKick(F,A,K); twAssistSync(A,1); } } };
function twAssistSync(A,lock){ if(A&&A.remote&&typeof mpSend==='function'&&typeof NS!=='undefined'&&NS.host){ mpSend({t:'assist',x:A.x,z:A.z,f:A.f,lock:lock||.8}); Game.dmgNums.push({x:A.x,y:A.y+3,z:A.z,n:'AUTO-ASSIST',t:0,col:'#ff8a9a'}); } }
(function(){ const ph=playerHit; playerHit=function(dmg,sx,sz,opt){ const F=TW.fight, P=Player, G=F&&F.kind==='duo'?F.guard:null, A=twAliAssister();
  if(G&&A&&A.remote&&G.mid===F.mid&&G.n<3&&Game.state==='play'&&P.inv<=0&&P.dash<=0&&!P.cineFly&&!ALI()&&twAliReady(A)&&!(opt&&opt.melee&&Game.time-twParryClock()<(opt.win||.26))){ G.n++; twAliGuard(A,sx,sz); twAssistSync(A,.6); return 'parry'; }
  return ph.apply(this,arguments); }; })();
// guest side: the host teleports our Ali for an assist and holds the controls for a moment
(function(){ if(typeof nsGuestMsg!=='function') return; const gm=nsGuestMsg; nsGuestMsg=function(m){ if(m&&m.t==='assist'){ const P=Player; FX.burst(P.x,P.y+1,P.z,20,0xb0182a,4,.3);
      P.x=m.x; P.z=m.z; P.vx=P.vz=0; if(m.f) P.f=m.f; P.assistLock=Game.time+(m.lock||.8); Sound.sfx('dash'); Game.banner={name:'AUTO-ASSIST',sub:'',t:0,small:1}; return true; } return gm.apply(this,arguments); }; })();
(function(){ const up=updatePlayer; updatePlayer=function(dt){ const P=Player; if(P.assistLock>Game.time){ clearHits(); for(const k of ['left','right','up','down','attack','block','dash','jump']) held[k]=false; P.vx=P.vz=0; } return up.apply(this,arguments); }; })();

// ---------- camera discipline ----------
function twCamFree(z){ if(TW.camK){ TW.camK.dead=1; TW.camK=null; } if(TW.camFrameOff){ TW.camFrameOff=null; if(TW.fight&&TW.fight.frame===false) TW.fight.frame=undefined; } Cam.cine=null; Cam.focus=null; if(z) Cam.zoom=z; }
// tracked follow: between Shayan and the arena centre (w = pull to the centre), zoomed out
function twCamTrack(w,zoom){ twCamFree(); if(TW.fight&&TW.fight.frame!==false){ TW.fight.frame=false; TW.camFrameOff=1; } const F=TW.fight, c=(F&&F.center)||twCenter(), o={x:Player.x,y:0,z:Player.z}, k={}; TW.camK=k; Cam.focus=o; Cam.zoom=zoom||1.5;
  Game.fxUpd.push(()=>{ if(k.dead){ if(Cam.focus===o) Cam.focus=null; return false; } const P=Player; o.x=lerp(P.x,c.x,w); o.z=lerp(P.z,c.z,w); o.y=Math.max(0,P.y*.7); return true; }); }
// a camera move inside a fight generator (yields seconds, one frame at a time)
function* twGenCam(p,l,dur,ez){ ez=ez||twEIO; const c=Cam.cine, f=c?{px:c.px,py:c.py,pz:c.pz,lx:c.lx,ly:c.ly,lz:c.lz}:{px:+camera.position.x||p[0],py:+camera.position.y||p[1],pz:+camera.position.z||p[2],lx:+Cam.look.x||l[0],ly:+Cam.look.y||l[1],lz:+Cam.look.z||l[2]};
  if(TW.camK){ TW.camK.dead=1; TW.camK=null; } Cam.focus=null;
  for(let t=0;t<dur;t+=1/60){ const e=ez(Math.min(1,t/dur)); cineSet(lerp(f.px,p[0],e),lerp(f.py,p[1],e),lerp(f.pz,p[2],e),lerp(f.lx,l[0],e),lerp(f.ly,l[1],e),lerp(f.lz,l[2],e)); yield 1/60; }
  cineSet(p[0],p[1],p[2],l[0],l[1],l[2]); }
// a limit cut registers its cleanup; a retry or leaving the fight runs it even if the generator was dropped mid-way
function twLcCleanupRun(){ const f=TW.lcCleanup; TW.lcCleanup=null; if(f) try{ f(); }catch(e){ console.error('lc cleanup',e); } }
(function(){ const dr=twDuoRestart; twDuoRestart=function(){ twLcCleanupRun(); twCamFree(1.3); Game.letterTo=0; TW.mash=null; return dr.apply(this,arguments); };
  const ef=twEndFight; twEndFight=function(){ twLcCleanupRun(); return ef.apply(this,arguments); }; })();
function twEdgePt(d){ const P=Player, a=rnd(0,6.28); return twClampXZ(P.x+Math.cos(a)*(d||9),P.z+Math.sin(a)*(d||9)*.78,1.5); }
function twScytheRing(O,x,z,n,v,gapA,gapN,o){ o=o||{}; for(let i=0;i<n;i++){ if(gapN&&i<gapN) continue; const a=gapA+i*6.283/n; twBolt(O,Object.assign({kind:'scythe',x,y:groundY(x,z)+1.1,z,vx:Math.cos(a)*v,vz:Math.sin(a)*v,dmg:2,life:4.2,col:0x8a3aff,storm:1},o)); } }

// =====================================================================
// NEW MOVES
// =====================================================================
// LASER STORM: a dozen beams from every edge at you, alternating blue (jump) and pink (move); Omar's scythes in the gaps
DUO.laserStorm=function*(C,O,ph){ const sp=twSp(C); yield* twGlint(C,3,.1); twBark('caotan',"LASER STORM! Every angle is my good angle!",true); const n=8+ph*2;
  for(let i=0;i<n;i++){ const P=Player, a=rnd(0,6.28); C.push=.25; Sound.sfx('ting'); if(i%2) twPink(P.x-Math.cos(a)*12,P.z-Math.sin(a)*12,a,{warn:.55/sp}); else twBlue(P.x,P.z,a,{warn:.5/sp});
    if(i%3===2){ O.cast=.4; const P2=Player; for(const s of [-1,1]) twAimBolt(O,'scythe',O.x+s*1.2,O.y+1.1,O.z,10*sp,s*.25,{col:0x8a3aff,storm:1}); Sound.sfx('swing'); }
    yield .3/sp; }
  yield .7; };
// SCYTHE CYCLONE: Omar spins in place and sprays three spiral arms of scythes; Caotan sweeps a slow blue beam (jump it)
DUO.scytheCyclone=function*(C,O,ph){ const sp=twSp(O), F=TW.fight, c=F.center; twBark('omar',"Cyclone of regret. Mostly regret.",true); twMoveTo(O,c.x+rnd(-2,2),c.z+rnd(-2,2),.5); yield .55;
  O.cast=3; O.scythe=1; const dir=Math.random()<.5?1:-1, b0=rnd(0,6.28); twBeam({x:C.x,z:C.z,ang:t=>b0+Math.max(0,t-.8)*.7*dir,len:20,w:1,warn:.8,dur:3.6,dmg:3,col:0xbfe4ff});
  const arms=ph>=3?4:3, steps=12+ph*2; let a=rnd(0,6.28); for(let s=0;s<steps;s++){ for(let k=0;k<arms;k++){ const aa=a+k*6.283/arms, v=7*sp; twBolt(O,{kind:'scythe',x:O.x,y:O.y+.6,z:O.z,vx:Math.cos(aa)*v,vz:Math.sin(aa)*v,dmg:2,life:3.6,col:0x8a3aff,storm:1}); }
    a+=.26*dir; Sound.sfx('swing'); yield .22/sp; }
  O.cast=0; O.scythe=0; yield .6; };
// GETSUGA GAUNTLET: Omar blinks to four edges and fires a Getsuga fan from each; Caotan pins the lanes with pink walls
DUO.getsugaGauntlet=function*(C,O,ph){ const sp=twSp(O); twBark('omar',"Getsuga Tenshou. From every direction. Like guilt.",true); O.scythe=1;
  for(let r=0;r<4;r++){ const e=twEdgePt(9.5); twBlink(O,e.x,e.z); yield .2; const P=Player, a=Math.atan2(P.z-O.z,P.x-O.x); O.lockF=1; O.f=Math.cos(a)>0?1:-1; O.swing=0;
    for(const k of ph>=3?[-.5,0,.5]:[-.35,.35]) twGetsuga(O,a+k,{warn:.55/sp,sp:15*sp,len:24});
    if(r%2){ C.push=.3; Sound.sfx('ting'); const P2=Player; twPink(C.x,C.z,Math.atan2(P2.z-C.z,P2.x-C.x)+rnd(-.3,.3),{warn:.65/sp}); } yield .75/sp; }
  O.lockF=0; O.scythe=0; O.swing=0; yield .5; };
// PILLOW HOLES (phase III): three black holes drift and bounce; Caotan fires rings of body pillows and nosebleed geysers
DUO.pillowHoles=function*(C,O,ph){ const sp=twSp(C); twBark('caotan',"Hikari-chan! Sakura-chan! Mitsuki-chan! Into the void, my loves!",true); O.cast=2;
  for(let k=0;k<3;k++){ const p=twRandIn(3), a=rnd(0,6.28); twMiniHole(p.x,p.z,{r:.7,pull:3,range:5,dur:7,eat:.95,dmg:4,vx:Math.cos(a)*1.4,vz:Math.sin(a)*1.4}); }
  for(let r=0;r<3;r++){ const a0=rnd(0,6.28); for(let k=0;k<6;k++) twCaoPillowShot(C,a0+k*1.047,9*sp); C.cast=.4; const P=Player; twCaoNose(P.x+P.vx*.35,P.z+P.vz*.35,.65); yield 1.1/sp; }
  O.cast=0; yield .8; };
// DOUBLE CAGE (phase III): the Senpai Cage, while Omar closes a circle of scythes in on you from outside
DUO.doubleCage=function*(C,O,ph){ const sp=twSp(C), P=Player, cx=P.x, cz=P.z; twBark('omar',"A cage inside a cage. Like my heart.",true); O.cast=1;
  const n=18, R=9, gap=rnd(0,6.28); for(let i=0;i<n;i++){ if(i<2) continue; const a=gap+i*6.283/n, x=cx+Math.cos(a)*R, z=cz+Math.sin(a)*R, v=6.5*sp; twBolt(O,{kind:'scythe',x,y:groundY(x,z)+1.1,z,vx:0,vz:0,spd:v,dmg:2,life:R/v+1.2,col:0x8a3aff,storm:1,delay:.6}); }
  yield* twCage(C,sp,cx,cz); O.cast=0; yield .4; };

// =====================================================================
// SCYTHE RAIN AT 100, CAST MID-FIGHT
// =====================================================================
DUO.scytheRain=function*(C,O,ph){ const F=TW.fight, sp=twSp(O), list=TW.planted.splice(0,DUO3.rain); TW.storming=1; F.rains=(F.rains||0)+1; const c=F.center, gy=groundY(c.x,c.z);
  list.forEach((o,i)=>{ o.m.userData.tw=1; o.m.userData.plant=0; o.sx=o.x; o.sy=o.y; o.sz=o.z; o.slot=i; o.st='rise'; });
  const halo={t:0,live:true}; const slot=i=>{ const n=list.length, ring=i%3, a=i/n*6.283+halo.t*(ring===1?.35:-.25), r=[4.6,7,9.4][ring]; return {x:c.x+Math.cos(a)*r,y:gy+10.5+ring*1.2+Math.sin(halo.t*2+i)*.2,z:c.z+Math.sin(a)*r*.75}; };
  twHz({upd(dt){ halo.t+=dt; for(const o of list){ if(o.st!=='rise'&&o.st!=='halo') continue; const s=slot(o.slot); if(o.st==='rise'){ o.ru=(o.ru||0)+dt/(.9+o.slot*.008); const e=twEIO(Math.min(1,o.ru)); o.x=lerp(o.sx,s.x,e); o.y=lerp(o.sy,s.y,e)+Math.sin(e*Math.PI)*2; o.z=lerp(o.sz,s.z,e); if(o.ru>=1) o.st='halo'; }
        else { o.x=s.x; o.y=s.y; o.z=s.z; } o.m.position.set(o.x,o.y,o.z); o.m.rotation.set(0,0,halo.t*8+o.slot); if(Math.random()<.05) FX.spawn(o.x,o.y,o.z,0,0,0,.4,0x8a3aff,.3,0,true); }
      return halo.live; }, kill(){ list.forEach(o=>{ if(o.st!=='gone') scene.remove(o.m); }); }});
  O.cast=3; O.scythe=0; Sound.sfx('howl'); Sound.sfx('gong'); twBark('omar',"One hundred blades. One hundred names. Gerald... lead them.",true);
  twBig('SCYTHE RAIN',{size:64,col:'#c08aff',y:UH*.26,dur:1.4,sub:'Red circles. Deflect the glowing ones back.'}); yield 1.5;
  try{
    const rest=()=>list.filter(o=>o.st==='halo'||o.st==='rise');
    if(ph>=3){ const dir=Math.random()<.5?1:-1, b0=rnd(0,6.28); twBeam({x:C.x,z:C.z,ang:t=>b0+Math.max(0,t-.9)*.55*dir,len:18,w:1,warn:.9,dur:9,dmg:3,col:0xbfe4ff}); }
    for(let w=0;w<20;w++){ const P=Player, warn=.8/sp, pts=[], a0=rnd(0,6.28), kind=w%3;
      if(kind===0){ pts.push([P.x,P.z]); for(let k=0;k<4;k++){ const a=a0+k*Math.PI/2; pts.push([P.x+Math.cos(a)*2.3,P.z+Math.sin(a)*2.3]); } }
      else if(kind===1){ const ux=Math.cos(a0), uz=Math.sin(a0); for(let k=-2;k<=2;k++) pts.push([P.x+ux*k*1.9,P.z+uz*k*1.9]); }
      else { pts.push([P.x,P.z]); pts.push([P.x+P.vx*.4,P.z+P.vz*.4]); pts.push([P.x+P.vx*.8,P.z+P.vz*.8]); for(let k=0;k<2;k++){ const a=a0+k*Math.PI; pts.push([P.x+Math.cos(a)*2.6,P.z+Math.sin(a)*2.6]); } }
      const avail=rest(); if(!avail.length) break; const homing=w%2===1;
      pts.forEach(([x,z],k)=>{ const o=avail[k]; if(!o) return; if(homing&&k===4){ o.st='gone'; scene.remove(o.m); const b=twBolt(O,{kind:'scythe',x:o.x,y:o.y,z:o.z,vx:0,vz:0,delay:.35,spd:17*sp,col:0xd08aff,dmg:2,life:2.4}); b.rain=1; Sound.sfx('charge'); return; }
        o.st='gone'; twSkyScythe(x,z,warn,{mesh:o.m,fx:o.x,fy:o.y,fz:o.z,quiet:k>0}); });
      if(w%3===1){ C.push=.3; Sound.sfx('ting'); const P2=Player; twBlue(P2.x,P2.z,rnd(0,Math.PI),{warn:.55}); }
      Sound.sfx('swing'); if(w===4) twBark('caotan',"GO GERALD! GO GERALD!",true); if(w===12) twBark('omar',"Gerald. No. That is Phil. Phil, you're out of order.",true); yield .55/sp; }
    yield 1;
  } finally { halo.live=false; TW.storming=0; O.cast=0; }
  O.stun=Math.max(O.stun,2.6); O.state='stun'; twBark('omar',"A hundred scythes... and I have to pick them all up again...",true); twBig('OMAR IS EXHAUSTED',{size:44,col:'#ffd45a',y:UH*.3,dur:1.3}); yield 2.6; };

// =====================================================================
// THE GETSUGA CLASH (phase I -> II): two crescents against one giant black one; mash to push them through
// =====================================================================
twGetsugaClash=function*(F,C,O){ const P=Player, A=TW.allies.find(a=>a.who==='ali'), c=F.center, gy=groundY(c.x,c.z);
  C.down=O.down=0; C.inv=O.inv=true; C.mv=O.mv=null; C.gen=O.gen=null;
  Object.assign(P,{x:c.x-6,z:c.z+.4,vx:0,vz:0,f:1,ang:0}); P.y=groundY(P.x,P.z); if(A){ A.x=c.x-6.4; A.z=c.z-1.3; A.f=1; A.hold=1; }
  Object.assign(O,{x:c.x+6,z:c.z,lockF:1,f:-1}); Object.assign(C,{x:c.x+8,z:c.z-1.9,lockF:1,f:-1});
  cineSet(c.x,gy+3.2,c.z+15,c.x,gy+1.5,c.z); yield wait(.4);
  yield say('shayan',"They're wide open! Ali, you thinking what I'm thinking?"); yield say('ali',"I'm thinking you talk too much.");
  cineSet(P.x+1,gy+2.2,P.z+8,P.x+3,gy+1.6,P.z); P.charge=2; Sound.sfx('charge'); yield say('shayan',"GETSUGA...",'angry'); yield say('ali',"...TENSHOU.");
  // two red crescents fly, merge into one, and stop dead in the air
  const S=7.5, by=gy+S*.42, mine=twGetsugaMesh(S*.7,0xff3a5a), ali=twGetsugaMesh(S*.7,0xff1a2a), his=twGetsugaMesh(S*1.15,0x9a4aff); his.rotation.y=Math.PI; his.visible=false;
  const st={a:P.x+1,b:O.x-1,cx:c.x+2.4,t:0,ph:'fly',merge:0,dead:0}; P.charge=0; P.cineAnim='beam'; Sound.sfx('beam'); Sound.sfx('crossboom'); FX.flash=.6; grade.uniforms.flashCol.value.set(1,.4,.5); shake(.6);
  Game.fxUpd.push(dt=>{ if(st.dead){ scene.remove(mine); scene.remove(ali); scene.remove(his); return false; } st.t+=dt; const j=st.ph==='grind'?Math.sin(st.t*60)*.1:0, z0=c.z;
    const mz=lerp(P.z,z0,st.merge), az=lerp(A?A.z:P.z,z0,st.merge); mine.position.set(st.a+j,by,mz+.05); ali.position.set(st.a+j-.2,by+.15,az); const k=1+st.merge*.55+(st.ph==='grind'?Math.sin(st.t*40)*.05:0); mine.scale.setScalar(k); ali.scale.setScalar(k*.98);
    his.position.set(st.b-j,by,z0); his.scale.setScalar(1+(st.ph==='grind'?Math.sin(st.t*37)*.06:0));
    if(Math.random()<.8) FX.spawn(st.a+rnd(-.8,.8),by+rnd(-3,3),z0+rnd(-.8,.8),rnd(-2,0),rnd(-.5,.5),0,.4,Math.random()<.5?0xff3a5a:0xffe0e8,.4,0,true);
    if(his.visible&&Math.random()<.8) FX.spawn(st.b+rnd(-.8,.8),by+rnd(-3.5,3.5),z0+rnd(-.8,.8),rnd(0,2),rnd(-.5,.5),0,.4,Math.random()<.5?0x9a4aff:0x0a0010,.45,0,true);
    if(st.ph==='grind'){ for(let i=0;i<6;i++) FX.spawn(st.cx,by+rnd(-3,3),z0+rnd(-.5,.5),rnd(-8,8),rnd(-3,6),rnd(-4,4),.5,[0xffffff,0xff3a5a,0x9a4aff,0xffd45a][i%4],.35,6,true); if(Math.random()<.1) FX.ring(st.cx,gy+.1,z0,Math.random()<.5?'#ff3a5a':'#9a4aff',4,.35); }
    return true; });
  for(let t=0;t<.5;t+=1/60){ st.merge=Math.min(1,t/.4); st.a=lerp(P.x+1,c.x-.5,t/.5); yield wait(1/60); } st.merge=1; Sound.sfx('fuse'); FX.flash=.4; P.cineAnim=null;
  cineSet(c.x,gy+3.6,c.z+16,c.x+1.5,gy+2,c.z); yield wait(.3);
  // Omar walks into it
  cineSet(O.x+1,gy+2.4,O.z+8,O.x,gy+2,O.z); yield say('omar',"Getsuga Tenshou?"); yield say('omar',"You think you're the only ones who can use Getsuga Tenshou?",'angry');
  yield say('caotan',"Omar, NO! You don't even have the right sword for that!"); yield say('omar',"I have a scythe. And a dark past. That is ninety percent of the technique.");
  O.scythe=1; O.cast=1; Sound.sfx('void'); FX.burst(O.x,O.y+1.5,O.z,40,0x1a0626,6,.5,false); yield say('omar',"GETSUGA... TENSHOU.",'angry');
  // his giant black crescent meets theirs
  his.visible=true; O.swing=1; Sound.sfx('crossboom'); Sound.sfx('beam'); FX.flash=.8; grade.uniforms.flashCol.value.set(.6,.3,1); impactFrame([[3,2],[1,2]]); shake(1);
  for(let t=0;t<.4;t+=1/60){ const u=t/.4; st.a=lerp(c.x-.5,st.cx-2.4,u); st.b=lerp(O.x-1,st.cx+2.6,u); yield wait(1/60); }
  st.ph='grind'; FX.flash=1; impactFrame([[1,2],[3,2]]); Sound.sfx('crossboom'); Sound.sfx('clash'); shake(1.4);
  cineSet(st.cx,gy+3.6,c.z+16,st.cx,gy+2.2,c.z); twClashTear(()=>st.cx,by,c.z,()=>!!TW.mash&&!st.dead,1.3);
  // ---------- the mash ----------
  const M=TW.mash={v:0,n:0,t:0,dur:4.6,shown:0,duoClash:1}; hit.attack=false; const lo=P.x+3.5, hi=O.x-3.5;
  while(M.t<M.dur){ const dt=1/30; yield wait(dt); M.t+=dt; const pushes=M.n; M.n=0; M.v=clamp(M.v+pushes*.08-dt*.5,-1,1); M.shown+=pushes;
    st.cx=lerp(st.cx,lerp(lo,hi,(M.v+1)/2),.25); st.a=st.cx-2.4; st.b=st.cx+2.6; if(pushes){ Sound.sfx('hit'); shake(.12); } if(Math.random()<.2) Sound.sfx('slam'); FX.flash=Math.max(FX.flash,.08); }
  const win=M.v>.15; TW.mash=null; hit.attack=false; st.ph='fly';
  // the winner tears through
  (win?his:mine).visible=false; if(win) ali.visible=false; for(let i=0;i<60;i++) FX.spawn(st.cx+rnd(-1,1),by+rnd(-3,3),c.z,rnd(-9,9),rnd(-4,7),rnd(-3,3),.6,win?0x9a4aff:0xff3a5a,.45,8,true);
  Sound.sfx('shatter'); Sound.sfx('crossboom'); FX.flash=1; grade.uniforms.flashCol.value.set(1,1,1); impactFrame([[1,3],[2,2],[3,3]]); shake(1.6); FX.hitstop=.15; twClashRip(st.cx,by,c.z,win?1:-1,1.3);
  for(let t=0;t<.35;t+=1/30){ if(win) st.a=lerp(st.a,O.x,.3); else st.b=lerp(st.b,P.x,.3); yield wait(1/30); }
  st.dead=1; const hx=win?O.x:P.x; for(let i=0;i<5;i++) FX.ring(hx,gy+.3,c.z,i%2?'#b06aff':'#ff3a5a',3+i*2.5,.5+i*.1); FX.burst(hx,by,c.z,90,win?0xff3a5a:0x9a4aff,10,.5);
  if(win) O.flash=.6; else { P.hp=Math.max(1,P.hp-3); }
  cineSet(c.x,gy+3,c.z+14,c.x,gy+1.5,c.z); yield wait(.6);
  yield say('shayan',"He CAN do it?!",'surprised'); yield say('ali',"...He copied my homework.");
  cineSet(O.x+.6,gy+2.4,O.z+7.5,O.x,gy+1.9,O.z); yield say('omar',win?"...My scythe is chipped. That was a rental.":"I watched one episode.");
  yield say('caotan',"He watched ALL the episodes. Twice. He cried at the Hollowfication."); yield say('omar',"...I did not cry.");
  if(win){ F.bonusStun={who:[O],t:3}; twBig('CLASH WON',{size:56,col:'#9fd8ff',sub:'Omar starts the next phase dazed',dur:1.6}); } else twBig('CLASH LOST',{size:56,col:'#ff6a7a',dur:1.4});
  if(A) A.hold=0; O.scythe=0; O.swing=0; O.cast=0; O.lockF=C.lockF=0; P.cineAnim=null; };
function twDrawDuoMash(){ const M=TW.mash; if(!M||!M.duoClash) return; const w=460, x=UW/2-w/2, y=UH*.74, k=(M.v+1)/2, t=performance.now()/1000; D.save();
  D.fillStyle='rgba(8,4,14,.88)'; D.fillRect(x-6,y-6,w+12,30); D.fillStyle='#ff3a5a'; D.fillRect(x,y,w*k,18); D.fillStyle='#a04aff'; D.fillRect(x+w*k,y,w*(1-k),18); D.fillStyle='#fff'; D.fillRect(x+w*k-2,y-8,4,34);
  D.strokeStyle='#ffe6b0'; D.lineWidth=2; D.strokeRect(x-6,y-6,w+12,30); D.textAlign='center'; D.font=`900 ${28+Math.round(Math.sin(t*20)*2)}px ${FB}`; D.fillStyle=Math.floor(t*8)%2?'#ffffff':'#ffd45a';
  D.lineWidth=5; D.strokeStyle='#1a0e24'; const s='MASH '+K('attack')+'!'; D.strokeText(s,UW/2,y-18); D.fillText(s,UW/2,y-18);
  D.font=`700 14px ${FB}`; D.fillStyle='#ffd0d8'; D.textAlign='left'; D.fillText('SHAYAN + ALI',x,y+38); D.textAlign='right'; D.fillStyle='#d0b0ff'; D.fillText('OMAR',x+w,y+38); D.restore(); }
(function(){ const du=drawUI; drawUI=function(){ du(); try{ twDrawDuoMash(); }catch(e){} }; })();

// =====================================================================
// LIMIT CUT I (phase II at 50%): EVENT HORIZON
// =====================================================================
DUO.waltz=function*(C,O){ const F=TW.fight, c=F.center, gy=groundY(c.x,c.z), sp=1.1, P=Player, B=twBounds(), rx=Math.min(8,(B.x1-B.x0)/2-2.5), rz=Math.min(6,(B.z1-B.z0)/2-2.2);
  F.mid=null; F.guard=null; F.kick=null; const holes=[], keep={on:true}, extra=[]; let big=null;
  const cleanup=()=>{ keep.on=false; holes.forEach(h=>{ h.upd=()=>false; }); extra.forEach(h=>{ h.upd=()=>false; }); if(big){ big.live=false; } O.hy=1.3; O.cast=0; O.scythe=0; O.swing=0; O.lockF=0; C.lockF=0; Game.letterTo=0; P.inv=Math.min(P.inv,1); try{ applyLook(L.look); }catch(e){} twCamFree(1.3); };
  TW.lcCleanup=cleanup;
  try{
    // ---- the cinematic: Omar rises over the arena and the sky goes violet ----
    Game.letterTo=.4; P.inv=Math.max(P.inv,5); twMoveTo(O,c.x,c.z-2.5,.6); twMoveTo(C,c.x-6.5,c.z-3.5,.6); C.lockF=1; C.f=1;
    yield* twGenCam([c.x,gy+2.4,c.z+16],[c.x,gy+3,c.z-2.5],.7);
    O.scythe=1; O.cast=4; Sound.sfx('void'); Sound.sfx('gong'); twBark('omar',"Brother. Hold my feelings. All of them.",true); twAnim(O,{hy:5.2},1.4,twEIO);
    const sw={t:0}; extra.push(twHz({upd(dt){ sw.t+=dt; for(let i=0;i<4;i++){ const a=sw.t*5+i*1.57, r=2.6+Math.sin(sw.t*3+i)*.5; FX.spawn(O.x+Math.cos(a)*r,O.y+.6+Math.sin(sw.t*4+i),O.z+Math.sin(a)*r*.6,0,0,0,.35,i%2?0x8a3aff:0x14081c,.4,0,i%2===1); } return sw.t<2.6&&keep.on; }}));
    yield* twGenCam([c.x+4,gy+1.4,c.z+13],[c.x,gy+5.5,c.z-2.5],1.3);
    twBark('caotan',"I'm ALWAYS holding your feelings!",true);
    grade.uniforms.tint.value.set(.82,.72,1.12); Sound.sfx('skyopen'); Sound.sfx('tear'); shake(.9); FX.flash=.6; grade.uniforms.flashCol.value.set(.6,.3,1); impactFrame([[3,2],[1,2]]);
    twCutin('omar','EVENT HORIZON','Limit Break  ·  five black suns, two hundred blades','#3a0a6a',1.8);
    yield* twGenCam([c.x,gy+11,c.z+19],[c.x,gy+1,c.z],1.2);
    Game.letterTo=0; twCamTrack(.35,1.6); P.inv=1.2;
    // ---- A) FIVE BLACK SUNS + Getsugas, Caotan's blue chords ----
    const orb={a:rnd(0,6.28)};
    for(let k=0;k<5;k++){ const a=orb.a+k*6.283/5, h=twMiniHole(c.x+Math.cos(a)*rx,c.z+Math.sin(a)*rz,{r:.9,pull:2.2,range:6,dur:60,eat:1,dmg:4,disk:1,h:1.6}); holes.push(h); Sound.sfx('void'); shake(.3); FX.flash=.2; yield .3; }
    extra.push(twHz({upd(dt,play){ if(play) orb.a+=dt*.3; holes.forEach((h,k)=>{ if(!h.hole) return; const a=orb.a+k*6.283/5; h.hole.x=c.x+Math.cos(a)*rx; h.hole.z=c.z+Math.sin(a)*rz; }); return keep.on; }}));
    twMoveTo(O,c.x,c.z,.6); twBark('caotan',"Five?! Omar, that's four too many holes!",true);
    let t=0, nG=0, nB=.9, g=0; while(g<10){ t+=.05; if(t>=nG){ nG+=.85/sp; g++; if(g%3===1){ const e=twEdgePt(8); twBlink(O,e.x,e.z); } const P2=Player, a=Math.atan2(P2.z-O.z,P2.x-O.x)+(g%2?.16:-.16); O.lockF=1; O.f=Math.cos(a)>0?1:-1; O.swing=0; twGetsuga(O,a,{warn:.5,sp:15*sp,len:24}); }
      if(t>=nB){ nB+=1.45/sp; C.push=.3; C.glintT=.3; Sound.sfx('ting'); const P3=Player; twBlue(P3.x,P3.z,rnd(0,Math.PI),{warn:.55}); } yield .05; }
    O.lockF=0; yield .9;
    // ---- B) REQUIEM OF TWO HUNDRED BLADES: ten rings of twenty from the middle, every ring with a turning gap ----
    twMoveTo(O,c.x,c.z,.5); yield .55; O.cast=4; O.hy=3; twBig('200 BLADES',{size:60,col:'#c08aff',y:UH*.24,dur:1.3,sub:'Find the gap in every ring'}); twBark('omar',"Two hundred blades. I named every one. Gerald is the sharp one.",true);
    twCamTrack(.5,1.75); let gap=rnd(0,6.28); const gd=Math.random()<.5?1:-1; yield .8;
    for(let r=0;r<10;r++){ gap+=gd*.55; twScytheRing(O,O.x,O.z,22,6.5*sp,gap,2); Sound.sfx('swing'); FX.ring(O.x,gy+.1,O.z,'#9a4aff',2.5,.3); if(r%3===0) shake(.2);
      if(r===4) twBark('caotan',"GO GERALD!",true); if(r%2===1){ C.push=.3; Sound.sfx('ting'); const P2=Player; twPink(C.x,C.z,Math.atan2(P2.z-C.z,P2.x-C.x),{warn:.6}); } yield .9/sp; }
    yield 1.4;
    // ---- C) GETSUGA TENSHOU: EVENT HORIZON. The five suns fall into one, ten Getsugas run out of it, it falls ----
    twBark('omar',"All five... into one. GETSUGA... TENSHOU...",true); keep.on=false; const conv={t:0}, from=holes.map(h=>h.hole?{x:h.hole.x,z:h.hole.z}:{x:c.x,z:c.z});
    extra.push(twHz({upd(dt){ conv.t+=dt; const u=twEIO(Math.min(1,conv.t/1.2)); holes.forEach((h,k)=>{ if(!h.hole) return; h.hole.x=lerp(from[k].x,c.x,u); h.hole.z=lerp(from[k].z,c.z,u); }); return conv.t<1.2; }}));
    twMoveTo(O,c.x,c.z-4.2,.8); yield 1.25; holes.forEach(h=>{ h.upd=()=>false; }); Sound.sfx('crossboom'); FX.flash=.7; shake(1.1); impactFrame([[2,2],[1,2]]);
    const V=twHoleVis(c.x,gy+5,c.z,2.4,true); big={k:0,t:0,live:true}; Game.fxUpd.push(d=>{ big.t+=d; big.k=big.live?Math.min(1,big.k+d*1.5):Math.max(0,big.k-d*2); V.t=big.t; V.set(big.k); if(!big.live&&big.k<=0){ V.kill(); return false; } return true; });
    extra.push(twHz({upd(dt,play){ const P2=Player; if(play&&big.live&&!P2.hidden&&P2.dash<=0&&!P2.cineFly){ const dx=c.x-P2.x, dz=c.z-P2.z, d=Math.hypot(dx,dz)||1; if(d>.3){ const q=twClampXZ(P2.x+dx/d*2.4*dt,P2.z+dz/d*2.4*dt,.3); P2.x=q.x; P2.z=q.z; } } return big.live; }}));
    extra.push(twZone(c.x,c.z,2.2,9,{dmg:2,every:.5,col:0x05000a,op:.9}));
    twCamTrack(.55,1.85); twCutin('omar','GETSUGA TENSHOU','Event Horizon  ·  the hole is the blade','#3a0a6a',1.4);
    for(let w=0;w<2;w++){ const a0=rnd(0,6.28)+w*.63; for(let k=0;k<5;k++) twGetsuga(O,a0+k*1.2566,{x:c.x,z:c.z,warn:.75,sp:13*sp,len:20,s:3.8}); O.swing=1; Sound.sfx('beam'); shake(.6); yield 1.5; }
    // one more, down a lane, the size of a house
    const lane=Math.random()<.5?0:Math.PI/2, PP=Player, sx=lane===0?B.x0:PP.x, sz=lane===0?PP.z:B.z0, L0=lane===0?B.x1-B.x0:B.z1-B.z0;
    FX.line(sx,sz,lane,L0,5,0x9a4aff,1.1); twBig('GET OUT OF THE LANE',{size:48,col:'#d0a0ff',y:UH*.28,dur:1.1}); yield 1.1;
    O.swing=1; shake(1); twGetsuga(O,lane,{x:sx,z:sz,warn:0,sp:24,len:L0,s:6.4,w:2.6,dmg:5}); yield .9;
    // the sun falls
    big.live=false; Sound.sfx('crossboom'); Sound.sfx('skyopen'); FX.flash=.8; grade.uniforms.flashCol.value.set(.6,.3,1); impactFrame([[2,2],[1,2],[3,1]]); shake(1.3);
    twBig('JUMP!',{size:80,col:'#ff4a5a',y:UH*.3,dur:1.6}); for(const [sp2,dl] of [[7,0],[9,.6],[11,1.2],[13,1.8]]) twWave(c.x,c.z,{col:0xb06aff,sp:sp2,max:18,dmg:3,delay:dl,r0:2.5}); yield 3;
  } finally { TW.lcCleanup=null; cleanup(); }
  twBark('caotan',"My glasses! It ate my SPARE glasses!",true); twBig('EVENT HORIZON SURVIVED',{size:54,col:'#ffd45a',sub:'Both twins are dizzy. Go!'});
  F.lc=0; F.lcDone[2]=1; F.busy=0; for(const T of [C,O]){ T.inv=false; T.stun=4.5; T.state='stun'; if(T.hp<=0) T.hp=.1; } yield 4.5; };

// =====================================================================
// LIMIT CUT II (phase III at 50%): MEGANE APOCALYPSE
// =====================================================================
DUO.fusion=function*(C,O){ const F=TW.fight, c=F.center, gy=groundY(c.x,c.z), sp=1.15, P=Player, extra=[]; F.mid=null; F.guard=null; F.kick=null;
  const H=twGiantHikari(c.x,c.z-4.5); H.k=.01; H.y=gy+1; H.put(); const live={on:true}; let hole=null, ring=null;
  Game.fxUpd.push(()=>{ if(!live.on||H.gone) return false; H.put(); if(Math.random()<.5) FX.spawn(H.x+rnd(-1,1)*H.k*.5,H.y+rnd(-1.3,1.3)*H.k,H.z,0,rnd(.3,1),0,.6,Math.random()<.5?0xff8ac8:0xffffff,.3,0,true); return true; });
  const cleanup=()=>{ live.on=false; H.kill(); extra.forEach(h=>{ h.upd=()=>false; }); if(hole) hole.upd=()=>false; if(ring) scene.remove(ring); TW.caoSafe=null; C.showN=0; C.glintN=0; C.hy=1.3; O.cast=0; O.scythe=0; O.lockF=0; C.lockF=0; Game.letterTo=0; P.inv=Math.min(P.inv,1); try{ applyLook(L.look); }catch(e){} twCamFree(1.3); };
  TW.lcCleanup=cleanup;
  const glint=(i)=>{ C.push=.4; C.glintN=i; C.glintT=.7; C.showN=1; Sound.sfx('ting'); FX.flash=Math.max(FX.flash,.12+i*.015); grade.uniforms.flashCol.value.set(1,1,1); twBig('✦ '+i+' ✦',{size:46+i*3,y:UH*.18,dur:.7,col:i>=20?'#ffffff':i>10?'#ffc8ec':'#bfe4ff'}); shake(.08+i*.02); };
  try{
    // ---- the cinematic: forty feet of memory foam rises behind him ----
    Game.letterTo=.4; P.inv=Math.max(P.inv,6); twMoveTo(C,c.x,c.z-2.5,.6); twMoveTo(O,c.x+6.5,c.z-3.5,.6); O.lockF=1; O.f=-1;
    yield* twGenCam([c.x,gy+2,c.z+15],[c.x,gy+2.4,c.z-2.5],.7);
    twBark('caotan',"Omar. It's time... for HER.",true); C.hy=2.6; Sound.sfx('sparkle'); Sound.sfx('choir'); Sound.sfx('fuse');
    twAnim(H,{k:3.6,y:gy+5.2},1.8,twEIO); yield* twGenCam([c.x-4,gy+1.2,c.z+12],[c.x,gy+5,c.z-3.5],1.8);
    twBark('omar',"...No. Not her. Anything but her.",true); shake(.8); impactFrame([[1,2],[3,2]]); Sound.sfx('slam'); twHikariBurst(H.x,H.y,H.z); grade.uniforms.tint.value.set(1.06,1,1.18);
    twCutin('caotan','MEGANE APOCALYPSE','Limit Break  ·  twenty glints  ·  Hikari-chan is watching','#ff6ab0',1.8);
    yield* twGenCam([c.x,gy+11,c.z+19],[c.x,gy+1,c.z],1.1);
    Game.letterTo=0; twCamTrack(.35,1.65); P.inv=1.2; yield .3;
    const hikBeam=(n,spin,dur,warn)=>{ const dir=Math.random()<.5?1:-1, b0=rnd(0,6.28); for(let k=0;k<n;k++) twBeam({x:H.x,z:H.z+1,ang:t=>b0+k*6.283/n+Math.max(0,t-warn)*spin*dir,len:20,w:1,warn,dur,dmg:3,col:0xbfe4ff}); };
    for(let i=1;i<=19;i++){ glint(i); const Pl=Player;
      if(i===5) twBark('caotan',"Five glints! That's my solo record! WE'RE JUST WARMING UP!",true);
      if(i===10) twBark('caotan',"TEN! The old limit! Hikari-chan, take us PAST IT!",true);
      if(i===15) twBark('omar',"Brother. Your glasses are smoking.",true);
      if(i<=5){ const a0=Math.atan2(Pl.z-C.z,Pl.x-C.x); for(const k of [-.8,-.4,0,.4,.8]){ const a=a0+k+(i%2?.2:0); twBeam({x:C.x,z:C.z,ang:a,len:Math.max(4,twRayWall(C.x,C.z,Math.cos(a),Math.sin(a)).t),w:1.1,warn:.6,dur:.2,dmg:3,col:k?0xffa0d8:0x9fd8ff,jump:!k}); }
        for(const k of [-1.1,1.1]) twCaoPillowShot(C,a0+k,10); twCaoNose(Pl.x+Pl.vx*.4,Pl.z+Pl.vz*.4,.7);
        O.cast=.5; for(const s of [-1,1]){ const hx=O.x+s*1.4, hz=O.z, P2=Player, aa=Math.atan2(P2.z-hz,P2.x-hx), d=Math.max(3,Math.hypot(P2.x-hx,P2.z-hz)), off=.9*s, v=10; twBolt(O,{kind:'scythe',x:hx,y:groundY(hx,hz)+1.1,z:hz,vx:Math.cos(aa+off)*v,vz:Math.sin(aa+off)*v,curl:-2*off*v/(d*1.1),dmg:2,life:d*1.25/v+1,col:0x8a3aff,storm:1}); }
        yield 1.0/sp; }
      else if(i<=10){ for(const k of [0,Math.PI/4,Math.PI/2,Math.PI*.75]){ const b=Math.PI/8+k+i*.3; twBeam({x:Pl.x-Math.cos(b)*15,z:Pl.z-Math.sin(b)*15,ang:b,len:30,w:1.1,warn:.75,dur:.28,dmg:3,col:0xffa0d8}); }
        hikBeam(2,1.1,1.3,.7); const a0=rnd(0,6.28); for(let k=0;k<4;k++) twCaoPillowShot(C,a0+k*Math.PI/2,8.5);
        if(i%2===0){ const e=twEdgePt(9); twBlink(O,e.x,e.z); const P2=Player; O.scythe=1; twGetsuga(O,Math.atan2(P2.z-O.z,P2.x-O.x),{warn:.6,sp:14}); }
        yield 1.25/sp; }
      else if(i<=15){ hikBeam(i-8,.95,1.6,.8); const b=rnd(0,Math.PI); for(const k of [0,Math.PI/2]) twBeam({x:Pl.x-Math.cos(b+k)*15,z:Pl.z-Math.sin(b+k)*15,ang:b+k,len:30,w:1.1,warn:.7,dur:.25,dmg:3,col:0xffa0d8});
        if(i===11||i===13){ const p=twRandIn(3), a=rnd(0,6.28); extra.push(twMiniHole(p.x,p.z,{r:.7,pull:3,range:5,dur:7,eat:.95,dmg:4,vx:Math.cos(a)*1.2,vz:Math.sin(a)*1.2})); O.cast=2; }
        twCaoNose(Pl.x+Pl.vx*.35,Pl.z+Pl.vz*.35,.6); yield 1.4/sp; }
      else { O.cast=1; const P2=Player;
        const n=16, R=9, gp=rnd(0,6.28); for(let k=0;k<n;k++){ if(k<2) continue; const a=gp+k*6.283/n, x=P2.x+Math.cos(a)*R, z=P2.z+Math.sin(a)*R, v=6.5; twBolt(O,{kind:'scythe',x,y:groundY(x,z)+1.1,z,vx:0,vz:0,spd:v,dmg:2,life:R/v+1.2,col:0x8a3aff,storm:1,delay:.6}); }
        yield* twCage(C,sp,P2.x,P2.z); yield .2; } }
    // ---- glint 20: MEGANE SUPERNOVA. Hide in her shadow while Omar's black hole drags her away ----
    glint(20); twBark('caotan',"TWENTY. MEGANE... SUPERNOVAAAA!",true); twCamTrack(.45,1.75);
    const A=twBounds(), Pn=Player; let hp2=null; for(let gg=0;gg<30&&!hp2;gg++){ const p=twRandIn(3); if(Math.hypot(p.x-Pn.x,p.z-Pn.z)>4&&Math.hypot(p.x-C.x,p.z-C.z)>6) hp2=p; } hp2=hp2||twClampXZ(Pn.x+5,Pn.z,3);
    twAnim(H,{x:hp2.x,z:hp2.z,y:groundY(hp2.x,hp2.z)+3.4,k:2.6},.7,twEIn2); yield .75; Sound.sfx('crash'); shake(.6); FX.burst(H.x,groundY(H.x,H.z)+.4,H.z,40,0xffffff,6,.4,false);
    twMoveTo(C,c.x,A.z0+1.5,.5); let bc=null; for(let gg=0;gg<30&&!bc;gg++){ const p=twRandIn(2); if(Math.hypot(p.x-H.x,p.z-H.z)>7&&Math.hypot(p.x-Pn.x,p.z-Pn.z)>5) bc=p; } bc=bc||twClampXZ(H.x-7,H.z,2);
    twBark('omar',"Let me help. By ruining everything.",true); hole=twMiniHole(bc.x,bc.z,{r:1.1,pull:4.8,range:14,dur:9,eat:1.05,dmg:5,disk:1,h:1.3});
    const safe={x:H.x,z:H.z}; TW.caoSafe=safe; ring=new THREE.Mesh(new THREE.RingGeometry(1.25,1.5,40),new THREE.MeshBasicMaterial({color:0x5ab0ff,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.userData.tw=1; scene.add(ring);
    const drag=twHz({upd(dt,play){ if(play){ const dx=bc.x-H.x, dz=bc.z-H.z, d=Math.hypot(dx,dz)||1; if(d>2.6){ H.x+=dx/d*.85*dt+(-dz/d)*.5*dt; H.z+=dz/d*.85*dt+(dx/d)*.5*dt; } } H.y=groundY(H.x,H.z)+3.4;
        const ux=H.x-C.x, uz=H.z-C.z, ul=Math.hypot(ux,uz)||1; safe.x=H.x+ux/ul*1.6; safe.z=H.z+uz/ul*1.6; ring.position.set(safe.x,groundY(safe.x,safe.z)+.08,safe.z); ring.material.opacity=.55+.35*Math.sin(TW.t*12); return live.on; }}); extra.push(drag);
    twBig('HIDE BEHIND HIKARI-CHAN!',{size:52,col:'#bfe4ff',dur:2,y:UH*.62,sub:'Stay in the blue ring. The black hole is dragging her away.'}); Sound.sfx('drone'); Sound.sfx('choir');
    // scythes rain everywhere but her shadow while he charges
    for(let k=0;k<14;k++){ const Pl=Player; for(let q=0;q<2;q++){ const a=rnd(0,6.28), r=rnd(2.2,6), x=safe.x+Math.cos(a)*r, z=safe.z+Math.sin(a)*r; twSkyScythe(x,z,.7,{quiet:1}); }
      const ch=k/14; FX.flash=Math.max(FX.flash,ch*.5); grade.uniforms.flashCol.value.set(.85,.95,1); for(let m=0;m<5;m++){ const aa=rnd(0,6.28), rr=rnd(1,10); FX.spawn(C.x+Math.cos(aa)*rr,C.y+rnd(0,4),C.z+Math.sin(aa)*rr,-Math.cos(aa)*rr*1.4,0,-Math.sin(aa)*rr*1.4,.6,0xffffff,.35,0,true); }
      yield .25; }
    impactFrame([[1,3],[2,2],[1,2],[3,2]]); FX.flash=1; grade.uniforms.flashCol.value.set(.9,.97,1); Sound.sfx('crossboom'); Sound.sfx('skyopen'); shake(1.4); FX.hitstop=.12;
    const nb=[beamMesh(0xbfe4ff,3.5),beamMesh(0xffffff,1.6)]; nb.forEach(o=>{ o.userData.tw=1; o.position.set(C.x,C.y+2,C.z); o.lookAt(C.x,C.y+30,C.z); o.scale.set(1,1,40); });
    extra.push(twHz({upd(dt){ this.t+=dt; const k=Math.max(0,1-this.t/1.2); nb.forEach(o=>{ o.scale.x=o.scale.y=Math.max(.01,k*(1+Math.sin(this.t*50)*.1)); }); return this.t<1.2; }, kill(){ nb.forEach(o=>scene.remove(o)); }}));
    for(let k=0;k<5;k++) FX.ring(C.x,groundY(C.x,C.z)+.1,C.z,k%2?'#ffffff':'#9fd8ff',6+k*4,.6+k*.1);
    const Pl=Player; if(Math.hypot(Pl.x-safe.x,Pl.z-safe.z)>1.7){ TW.caoSafe=null; if(TW.god) Game.dmgNums.push({x:Pl.x,y:Pl.y+2.4,z:Pl.z,n:'∞ HP',t:0,col:'#7affb0'}); else { Pl.inv=0; Pl.dash=0; hurtPlayer(99,C.x,C.z); } twBark('caotan',"Should've hugged the pillow, senpai.",true); }
    else Game.dmgNums.push({x:Pl.x,y:Pl.y+2.4,z:Pl.z,n:'SHIELDED BY WAIFU',t:0,big:true,col:'#bfe4ff'});
    TW.caoSafe=null; drag.upd=()=>false; scene.remove(ring); ring=null; yield 1.2;
    // the hole eats her
    twAnim(H,{x:bc.x,z:bc.z,k:.05,y:groundY(bc.x,bc.z)+1.3},.9,twEIn2); Sound.sfx('suck'); twBark('caotan',"HIKARI-CHAAAAAN! NOOOOO!",true); yield 1; Sound.sfx('chomp'); hole.upd=()=>false; H.kill();
    twBark('omar',"...She was delicious. Mostly feathers.",true); yield 1;
  } finally { TW.lcCleanup=null; cleanup(); }
  C.cracked=1; twBig('MEGANE APOCALYPSE SURVIVED',{size:52,col:'#ffd45a',sub:'Caotan is in mourning. Omar is full. Go!'}); F.lc=0; F.lcDone[3]=1; F.busy=0; for(const T of [C,O]){ T.inv=false; T.stun=5; T.state='stun'; if(T.hp<=0) T.hp=.1; } yield 5; };
