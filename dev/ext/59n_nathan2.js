// =====================================================================
// NATHAN, REMASTERED (Ali's final boss; Shayan's Oddities fight gets it too)
//   Built for Ali: his guard parries anything that is not piercing, and he teleports. So Nathan's new moves are lasers
//   (piercing), positional pressure and grabs; the melee ones stay parryable for the stun.
//   New moves: Memory Railgun, Requiem Funnels, Quickboost Star, Memory Shards, Singularity, Grapple Anchor (the grab:
//   MEMORY LANE, a sky-high meteor slam). Limit cuts: TIMELINE STORM (phase II, 600 bars), BIT HEAVEN (phase III, 250 bars).
//   At zero: NOTHING LEFT, 15 seconds of overdrive to survive, then the finale.
// =====================================================================
const NB2={m:[]};
function nb2Mesh(m){ m.userData.temp=1; scene.add(m); NB2.m.push(m); return m; }
function nb2Rm(m){ scene.remove(m); const i=NB2.m.indexOf(m); if(i>=0) NB2.m.splice(i,1); }
(function(){ const nc=nbClear; nbClear=function(){ NB2.m.forEach(m=>scene.remove(m)); NB2.m=[]; if(!TW.fight) twClearHz(); return nc.apply(this,arguments); }; })();
function nbSp(){ return 1+(((NB&&NB.phase)||1)-1)*.06; }

// ---------- MEMORY RAILGUN: a red aiming line tracks you, turns white and locks for a beat, then a piercing beam ----------
function* nbRailgun(n,o){ o=o||{}; for(let i=0;i<n;i++){ const src=o.src||NB, ln=nb2Mesh(beamMesh(0xff2a3a,.05)); Sound.sfx('charge'); let t=0, lx=Player.x, lz=Player.z; const track=(NB.phase>=3?.62:.75), lock=.26;
    while(t<track+lock){ const P=Player; if(t<track){ lx=P.x; lz=P.z; } const fy=src.y+2.2, a=Math.atan2(lz-src.z,lx-src.x); twBeamTo(ln,src.x,fy,src.z,src.x+Math.cos(a)*26,groundY(lx,lz)+1,src.z+Math.sin(a)*26,t<track?1:2.6); ln.material.color.setHex(t<track?0xff2a3a:0xffffff); yield .03; t+=.03; }
    nb2Rm(ln); const a=Math.atan2(lz-src.z,lx-src.x); nbLaser({x0:src.x,z0:src.z,x1:src.x+Math.cos(a)*26,z1:src.z+Math.sin(a)*26,warn:.02,dur:.2,w:1.25,dmg:3}); Sound.sfx('beam'); shake(.4); FX.flash=.2; grade.uniforms.flashCol.value.set(.7,1,1);
    yield .22; if(!o.src&&i<n-1){ const P=Player, b=rnd(0,6.28); nbBoost(P.x+Math.cos(b)*rnd(6,8),P.z+Math.sin(b)*rnd(4,6)); yield .18; } } }
// ---------- REQUIEM FUNNELS: bits ring you and fire one after another, then all at once ----------
function* nbFunnels(){ const P=Player, n=NB.phase>=3?10:8, bs=[]; Sound.sfx('charge'); twBark('nathan',"Funnels! Surround him!",true);
  for(let i=0;i<n;i++) bs.push(nbBit(NB.x,NB.y+2.5,NB.z));
  const a0=rnd(0,6.28), dir=Math.random()<.5?1:-1, cx=P.x, cz=P.z, tg=bs.map((b,i)=>{ const a=a0+dir*i/n*6.283; return {x:cx+Math.cos(a)*6.5,z:cz+Math.sin(a)*5}; }), fr=bs.map(b=>({x:b.x,z:b.z}));
  for(let k=1;k<=6;k++){ bs.forEach((b,i)=>{ b.x=lerp(fr[i].x,tg[i].x,k/6); b.z=lerp(fr[i].z,tg[i].z,k/6); b.y=groundY(b.x,b.z)+1.4; b.m.position.set(b.x,b.y,b.z); }); yield .05; }
  for(let i=0;i<n;i++){ const b=bs[i]; if(!b) continue; const P2=Player, a=Math.atan2(P2.z-b.z,P2.x-b.x); b.m.lookAt(P2.x,b.y,P2.z); nbLaser({x0:b.x,z0:b.z,x1:b.x+Math.cos(a)*16,z1:b.z+Math.sin(a)*16,warn:.55,dur:.25,w:.9,dmg:2}); Sound.sfx('mechshot'); yield .17/nbSp(); }
  yield .5; const P3=Player; bs.forEach(b=>{ const a=Math.atan2(P3.z-b.z,P3.x-b.x); b.m.lookAt(P3.x,b.y,P3.z); nbLaser({x0:b.x,z0:b.z,x1:b.x+Math.cos(a)*16,z1:b.z+Math.sin(a)*16,warn:.85,dur:.3,w:1,dmg:3}); }); Sound.sfx('charge');
  yield 1.2; bs.forEach(b=>{ if(NBB.includes(b)) nbKillBit(b); }); }
// ---------- QUICKBOOST STAR: he cuts through you from the points of a star (piercing), the last one is a real slash: parry it ----------
function* nbStarDash(){ const C={n:1,par:0}, n=NB.phase>=3?5:4; twBark('nathan',"Quickboost Star! Try to keep up!",true);
  for(let i=0;i<n;i++){ const P=Player, a=i*2.513+rnd(-.3,.3); nbBoost(P.x+Math.cos(a)*7,P.z+Math.sin(a)*5.5); yield .18;
    const P2=Player, b=Math.atan2(P2.z-NB.z,P2.x-NB.x), ex=NB.x+Math.cos(b)*14, ez=NB.z+Math.sin(b)*14;
    if(i<n-1){ nbLaser({x0:NB.x,z0:NB.z,x1:ex,z1:ez,warn:.42/nbSp(),dur:.12,w:1.5,dmg:3}); Sound.sfx('charge'); yield .42/nbSp(); nbBoost(ex,ez); yield .14; }
    else { FX.spawn(NB.x,NB.y+3.6,NB.z,0,0,0,.25,0xffffff,1,0,true); Sound.sfx('ting'); yield .22; const P3=Player; nbBoost(P3.x-Math.cos(b)*1.9,P3.z-Math.sin(b)*1.9); FX.line(NB.x,NB.z,b,3.4,2.4,0x3ff4ff,.3); yield .3;
      if(nbStrike(C)){ twComboBroken(NB.x,NB.z); twBark('nathan',"You read the STAR?!",true); yield* nbStunned(2.4); return; } } }
  yield .4; }
// ---------- MEMORY SHARDS: burning memories fall in a checkerboard (twice, flipped), then a ring and the centre ----------
function* nbMemoryRain(){ twBark('nathan',"Every memory I burned... falls on YOU!",true); const cs=2.2;
  for(let w=0;w<3;w++){ const cx=Player.x, cz=Player.z, par=w%2; for(let gx=-3;gx<=3;gx++) for(let gz=-2;gz<=2;gz++){ if(((gx+gz)&1)!==par) continue;
      twBlast(cx+gx*cs,cz+gz*cs,1.05,.85,{col:0x3ff4ff,burst:0x9ff8ff,ring:'#9ff8ff',dmg:2,quiet:!(gx===0&&gz===0),sfx:'crash',shake:.1}); } yield 1; }
  const P2=Player; for(let k=0;k<8;k++){ const a=k*.785; twBlast(P2.x+Math.cos(a)*2.1,P2.z+Math.sin(a)*2.1,1,.7,{col:0x3ff4ff,dmg:2,quiet:k>0}); } twBlast(P2.x,P2.z,1,1.2,{col:0xff2a4a,dmg:3,sfx:'crash'}); yield 1.3; }
// ---------- SINGULARITY (phase III+): a small black hole pulls you in while he sweeps and snipes ----------
function* nbSingularity(){ twBark('nathan',"Micro singularity. Batteries not included.",true); const P=Player, a=rnd(0,6.28); twMiniHole(P.x+Math.cos(a)*4.5,P.z+Math.sin(a)*3.5,{r:.9,pull:4.6,range:9,dur:5.5,eat:1,dmg:ALI()?4:6,disk:1}); yield .8; yield* nbSweep(); yield* nbRailgun(2); yield .4; }
// ---------- GRAPPLE ANCHOR: a yellow line locks, a hook flies down it (it pierces any guard). Caught = MEMORY LANE ----------
function* nbGrapple(){ twBark('nathan',"Grapple anchor! Come HERE!",true); let t=0, a=0; const ln=nb2Mesh(beamMesh(0xffd040,.06)); Sound.sfx('charge');
  while(t<.8){ const P2=Player; if(t<.58) a=Math.atan2(P2.z-NB.z,P2.x-NB.x); const f=nbFace(); twBeamTo(ln,f.x,f.y-.6,f.z,f.x+Math.cos(a)*20,f.y-.6,f.z+Math.sin(a)*20,t<.58?1:2.2); yield .03; t+=.03; }
  nb2Rm(ln); const hook=nb2Mesh(new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),new THREE.MeshBasicMaterial({color:0xffd040}))), cable=nb2Mesh(beamMesh(0x9aa4b8,.035)), s={x:NB.x,z:NB.z,d:0,hit:false}; Sound.sfx('quickboost');
  while(s.d<20&&!s.hit){ const st=26/30; s.x+=Math.cos(a)*st; s.z+=Math.sin(a)*st; s.d+=st; const gy=groundY(s.x,s.z); hook.position.set(s.x,gy+1.2,s.z); twBeamTo(cable,NB.x,NB.y+1.6,NB.z,s.x,gy+1.2,s.z,1); FX.spawn(s.x,gy+1.2,s.z,0,0,0,.25,0xffd040,.3,0,true);
    const P2=Player; if(Math.hypot(P2.x-s.x,P2.z-s.z)<.95&&P2.y<gy+2.2&&playerHit(0,s.x,s.z,{pierce:true,unblockable:true})==='hit') s.hit=true; yield 1/30; }
  nb2Rm(hook); nb2Rm(cable); if(s.hit&&Game.state==='play'){ run(function*(){ yield* nbGrabCine(); }); yield .1; } else yield .3; }
function* nbGrabCine(){ const P=Player, gy=groundY(P.x,P.z), dt=1/60, x0=P.x, z0=P.z; P.inv=99; P.cineFly=true; P.cineAnim=ALI()?'fall':'hurt'; P.atk=null; P.charge=0; P.dash=0; P.vx=P.vz=P.vy=0; Game.letterTo=.5; NB.dsh=null; const hov0=NB.hov;
  // reeled in
  impactFrame([[1,2]]); Sound.sfx('slam'); const sx=P.x, sz=P.z;
  for(let t=0;t<.45;t+=dt){ const u=twEIn2(t/.45); P.x=lerp(sx,NB.x-NB.face*1.4,u); P.z=lerp(sz,NB.z+.3,u); P.y=gy+.4; cineSet(P.x+NB.face*2.5,gy+1.5,P.z+4.5,(P.x+NB.x)/2,gy+1.6,P.z); yield wait(dt*.5); }
  twBark('nathan',"Gotcha. Let's go somewhere with a VIEW.",true);
  // straight up, the camera spiralling around you both
  Sound.sfx('quickboost'); Sound.sfx('beam');
  for(let t=0;t<1.2;t+=dt){ const u=twEIO(t/1.2); NB.hov=hov0+u*22; NB.y=groundY(NB.x,NB.z)+NB.hov; P.y=NB.y+1.2; P.x=NB.x-NB.face*1.1; P.z=NB.z+.3; const ca=u*Math.PI*1.6;
    cineSet(NB.x+Math.sin(ca)*7,NB.y+2-u*3,NB.z+Math.cos(ca)*7,NB.x,NB.y+1.5,NB.z); for(let i=0;i<4;i++) FX.spawn(NB.x+rnd(-.8,.8),NB.y-rnd(0,1),NB.z,0,-12,0,.4,i%2?0x3ff4ff:0xffffff,.5,0,true); yield wait(dt*.5); }
  cineSet(NB.x-4,NB.y+1,NB.z+8,NB.x,NB.y+1.5,NB.z);
  if(ALI()) twBark('nathan',"Every memory I burned... I'll burn into YOU, wanderer!",true); else twBark('nathan',"Every memory I burned... I'll burn into YOU, blacksmith!",true); yield wait(1.5);
  if(ALI()) twBark('ali',"You talk a lot for someone about to fall.",true); else twBark('shayan',"Why are we so HIGH UP?!",true); yield wait(1.2);
  // the meteor: the camera on the ground, looking up as you both come down
  Sound.sfx('quickboost'); Sound.sfx('crossboom'); const top=NB.hov;
  for(let t=0;t<.5;t+=dt){ const u=twEIn2(t/.5); NB.hov=lerp(top,1.4,u); NB.y=groundY(NB.x,NB.z)+NB.hov; P.y=Math.max(gy,NB.y-.6); P.x=NB.x+NB.face*.4; for(let i=0;i<6;i++) FX.spawn(P.x+rnd(-.6,.6),P.y+rnd(0,2),P.z,rnd(-2,2),18,rnd(-2,2),.4,i%2?0xff6a2a:0xffd060,.6,0,true); cineSet(x0+3,gy+.6,z0+9,P.x,P.y+.5,P.z); yield wait(dt*.5); }
  P.y=gy; impactFrame([[3,3],[1,2],[2,2]]); FX.flash=.8; grade.uniforms.flashCol.value.set(1,.6,.3); Sound.sfx('slam'); Sound.sfx('crash'); shake(1.4); for(let k=0;k<3;k++) FX.ring(P.x,gy+.1,P.z,k%2?'#3ff4ff':'#ffd060',4+k*3,.5); FX.burst(P.x,gy+.4,P.z,80,0xd8c0a0,8,.5,false);
  // point-blank Soulburn
  cineSet(P.x+2,gy+1,P.z+3.5,P.x,gy+.8,P.z); yield wait(.35); twBark('nathan',"Soulburn. Point blank.",true); const bm=[nb2Mesh(beamMesh(0x3ff4ff,.6)),nb2Mesh(beamMesh(0xffffff,.25))]; Sound.sfx('beam'); Sound.sfx('charge');
  for(let t=0;t<.6;t+=dt){ const f=nbFace(); bm.forEach(m=>twBeamTo(m,f.x,f.y,f.z,P.x,gy+.6,P.z,1+Math.sin(t*60)*.15)); shake(.2); yield wait(dt*.5); } bm.forEach(nb2Rm);
  FX.burst(P.x,gy+1,P.z,40,0x3ff4ff,6,.4); P.cineFly=false; P.cineAnim=null; P.inv=0; P.dash=0; Cam.cine=null; Game.letterTo=0; NB.hov=1.4; Game.dmgNums.push({x:P.x,y:P.y+2.6,z:P.z,n:'MEMORY LANE',t:0,big:true,col:'#9ff8ff'});
  hurtPlayer(ALI()?5:8,NB.x,NB.z); if(Game.state==='play'){ if(ALI()) twBark('ali',"Hm. Warm.",true); else twBark('shayan',"OW. Okay. Ow.",true); }
  const a=Math.atan2(P.z-NB.z,P.x-NB.x); nbBoost(NB.x-Math.cos(a)*6,NB.z-Math.sin(a)*4); }

(function(){ const np=nbPattern; nbPattern=function(k){ if(k==='railgun') return nbRailgun(NB.phase>=3?4:3); if(k==='funnels') return nbFunnels(); if(k==='starDash') return nbStarDash();
    if(k==='memoryRain') return nbMemoryRain(); if(k==='singularity') return nbSingularity(); if(k==='grapple') return nbGrapple(); return np(k); };
  NB_POOL[1].push('railgun','grapple','memoryRain'); NB_POOL[2].push('railgun','funnels','starDash','grapple','memoryRain');
  for(const k of [3,4]) NB_POOL[k].push('railgun','funnels','starDash','grapple','memoryRain','singularity','railgun'); })();

// =====================================================================
// LIMIT CUTS: they trigger mid-phase, like the twins'. Nathan is untouchable until the end, then stunned.
// =====================================================================
(function(){ const nd=nbDamage; nbDamage=function(d,u){ const r=nd.apply(this,arguments);
    if(NB&&NB.alive&&!NB.inv&&!NB.pend){ if(NB.phase===2&&NB.bars<=600&&!NB.lcA){ NB.lcA=1; NB.inv=true; nbClear(); NB.pend=nbStorm; nbPend(); } else if(NB.phase===3&&NB.bars<=250&&!NB.lcB){ NB.lcB=1; NB.inv=true; nbClear(); NB.pend=nbHeaven; nbPend(); } }
    return r; };
  const nr=nbRespawn; nbRespawn=function(){ const r=nr.apply(this,arguments); if(NB){ NB.lcA=0; NB.lcB=0; NB.stunned=0; TW.hg=null; if(NB.overCk){ NB.alive=false; NB.inv=true; NB.bars=0; NB.over=0; NB.pend=nbFinale; nbPend(); } } return r; }; })();
function nbGhostMech(x,z){ const H=4.6, W=H*447/484, m=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:MECHTEX,transparent:true,depthWrite:false,opacity:.75,color:0x3ff4ff,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
  m.geometry.translate(0,H/2,0); m.rotation.x=TILT; nb2Mesh(m); const g={x,z,y:groundY(x,z)+1.4,m,face:-1,put(){ this.face=Player.x>this.x?1:-1; m.position.set(this.x,this.y,this.z); m.scale.x=this.face; }}; g.put(); return g; }
// TIMELINE STORM: three Nathans from three dead timelines. Railguns in turn, a four-way convergence, then they cut through you one by one (the real one last: parry him)
function* nbStorm(){ const P=Player, gy=groundY(P.x,P.z); Game.letterTo=1; Game.state='cut'; NB.barShow=0;
  cineSet(NB.x-3,1.8,NB.z+6,NB.x,3,NB.z); yield say('nathan',"In every timeline, I lost. Every single one.",'angry'); yield say('nathan',"So I brought them ALL.",'angry');
  OV.cr=makeCracks(UW/2,UH*.22,300,9); Sound.sfx('glass'); Sound.sfx('skyopen'); shake(.6); const gh=[];
  for(let i=0;i<3;i++){ const a=i*2.094+rnd(-.3,.3)+Math.PI/2, x=P.x+Math.cos(a)*7.5, z=P.z+Math.sin(a)*5.5, g=nbGhostMech(x,z); g.ty=g.y; g.y+=26; gh.push(g); }
  cineSet(P.x,gy+1.2,P.z+14,P.x,gy+8,P.z-4); for(let t=0;t<1.2;t+=1/60){ const u=twEOut3(Math.min(1,t/1)); gh.forEach((g,i)=>{ g.y=lerp(g.ty+26,g.ty,Math.min(1,u*(1+i*.15))); g.put(); }); yield wait(1/120); }
  OV.cr=null; Sound.sfx('slam'); shake(1); gh.forEach(g=>FX.ring(g.x,groundY(g.x,g.z)+.1,g.z,'#3ff4ff',5,.5)); yield cineTo([P.x,gy+3,P.z+12],[P.x,gy+1.5,P.z],.6);
  cineSet(P.x+1.3,gy+1.3,P.z+3.6,P.x,gy+1.6,P.z); if(ALI()) yield say('ali',"Four of you. Still one of me. Sounds fair."); else yield say('shayan',"There's FOUR of him now?! Is that legal?!",'surprised');
  evaCard(['TIMELINE STORM','EVERY NATHAN THAT EVER LOST'],1.6,1); Sound.sfx('slam'); yield wait(1.6);
  Cam.cine=null; Game.letterTo=.3; Game.state='play'; NB.barShow=1; Game.banner={name:'Timeline Storm',sub:'Watch the white lines. The real Nathan strikes last: parry him.',t:0,small:1};
  const run2=function*(g){ for(;;){ const r=g.next(); if(r.done) return; yield wait(r.value); } };
  const all=[NB].concat(gh);
  // a) railguns in turn
  for(const src of all){ if(src!==NB) src.put(); yield* run2(nbRailgun(1,{src})); }
  yield wait(.4);
  // b) convergence: all four at once, through where you stand
  Sound.sfx('charge'); for(let k=0;k<2;k++){ const P2=Player; for(const s of all){ const a=Math.atan2(P2.z-s.z,P2.x-s.x); nbLaser({x0:s.x,z0:s.z,x1:s.x+Math.cos(a)*26,z1:s.z+Math.sin(a)*26,warn:1-k*.15,dur:.3,w:1.2,dmg:3}); } yield wait(1.4); }
  // c) the ghosts cut through you one by one, the real Nathan last (a slash: parry it)
  for(const g of gh){ const P2=Player, a=Math.atan2(P2.z-g.z,P2.x-g.x), ex=g.x+Math.cos(a)*15, ez=g.z+Math.sin(a)*15; nbLaser({x0:g.x,z0:g.z,x1:ex,z1:ez,warn:.5,dur:.12,w:1.6,dmg:3}); Sound.sfx('charge'); yield wait(.5);
    const sx=g.x, sz=g.z; for(let t=0;t<.12;t+=1/60){ g.x=lerp(sx,ex,t/.12); g.z=lerp(sz,ez,t/.12); g.put(); yield wait(1/120); } FX.burst(g.x,g.y+2,g.z,40,0x3ff4ff,6,.4); nb2Rm(g.m); g.dead=1; Sound.sfx('shatter'); }
  const C={n:1,par:0}, P3=Player, b=rnd(0,6.28); nbBoost(P3.x+Math.cos(b)*2.2,P3.z+Math.sin(b)*2.2); yield wait(.2); FX.spawn(NB.x,NB.y+3.6,NB.z,0,0,0,.25,0xffffff,1,0,true); Sound.sfx('ting'); FX.line(NB.x,NB.z,Math.atan2(Player.z-NB.z,Player.x-NB.x),3.4,2.4,0x3ff4ff,.34); yield wait(.34);
  const par=nbStrike(C); gh.forEach(g=>{ if(!g.dead) nb2Rm(g.m); });
  twBig(par?'TIMELINES CUT':'STORM SURVIVED',{size:54,col:'#9ff8ff',sub:par?'Nathan is reeling. Punish!':'Nathan is open',dur:1.6}); twBark('nathan',par?"You cut... all of them...":"Tch. Even four of me isn't enough.",true);
  Game.letterTo=0; NB.inv=false; NB.gen=nbStunned(par?4:2.5); NB.wait=0; NB.busyAtk=1; }
// BIT HEAVEN: every bit he has. Spinning spokes from your feet (run with them), the grid, then LAST LIGHT three times (get out of the cross)
function* nbHeaven(){ const P=Player, gy=groundY(P.x,P.z); Game.letterTo=1; Game.state='cut'; NB.barShow=0;
  cineSet(NB.x-3,1.6,NB.z+6,NB.x,3,NB.z); yield say('nathan',"One hundred percent of my bits. Zero percent of my sanity.",'angry');
  const bs=[]; for(let i=0;i<20;i++) bs.push(nbBit(NB.x,NB.y+2.5,NB.z)); const ring={u:0,on:1};
  Game.fxUpd.push(d=>{ if(!ring.on) return false; ring.t=(ring.t||0)+d; bs.forEach((b,i)=>{ if(!NBB.includes(b)) return; const a=i/20*6.283+ring.t*.5, r=lerp(0,10,ring.u); b.x=Player.x+Math.cos(a)*r; b.z=Player.z+Math.sin(a)*r*.7; b.y=groundY(b.x,b.z)+5.5+Math.sin(a*3+ring.t)*1.2; b.m.position.set(b.x,b.y,b.z); b.m.lookAt(Player.x,Player.y,Player.z); }); return true; });
  cineSet(P.x,gy+1,P.z+6,P.x,gy+8,P.z-6); Sound.sfx('charge'); Sound.sfx('drone'); yield tween(ring,{u:1},1.4,t=>t*(2-t));
  if(ALI()) yield say('ali',"Twenty toys. Still toys."); else yield say('shayan',"I hate this. I hate this so much.",'surprised');
  evaCard(['BIT HEAVEN','THE SKY IS ALL GUNS'],1.6,1); Sound.sfx('slam'); yield wait(1.6);
  Cam.cine=null; Game.letterTo=.3; Game.state='play'; NB.barShow=1; Game.banner={name:'Bit Heaven',sub:'Run with the spokes. Then get out of every cross.',t:0,small:1};
  const run2=function*(g){ for(;;){ const r=g.next(); if(r.done) return; yield wait(r.value); } };
  try{
    // a) spokes: four beams spin out from where you stand
    const cx=Player.x, cz=Player.z, dir=Math.random()<.5?1:-1, a0=rnd(0,6.28); for(let k=0;k<4;k++) nbLaser({x0:cx,z0:cz,ang:t=>a0+k*Math.PI/2+Math.max(0,t-1)*.85*dir,len:14,warn:1,dur:4.2,w:1.1,dmg:3}); Sound.sfx('charge'); yield wait(5.3);
    // b) the grid
    yield* run2(nbGrid(2)); yield wait(.3);
    // c) LAST LIGHT: every bit fires through you, three times, faster each time
    for(let k=0;k<3;k++){ const P2=Player; Sound.sfx('charge'); bs.forEach((b,i)=>{ if(i%(k?2:3)||!NBB.includes(b)) return; const a=Math.atan2(P2.z-b.z,P2.x-b.x); nbLaser({x0:b.x,z0:b.z,x1:b.x+Math.cos(a)*24,z1:b.z+Math.sin(a)*24,warn:1.05-k*.15,dur:.3,w:1,dmg:3}); }); yield wait(1.5-k*.15); }
  } finally { ring.on=0; bs.forEach(b=>{ if(NBB.includes(b)) nbKillBit(b); }); }
  twBig('HEAVEN FELL',{size:54,col:'#9ff8ff',sub:'Nathan overheated. Punish!',dur:1.6}); twBark('nathan',"Core temperature... critical... give me a second!",true);
  Game.letterTo=0; NB.inv=false; NB.gen=nbStunned(4); NB.wait=0; NB.busyAtk=1; }

// =====================================================================
// NOTHING LEFT: at zero bars, fifteen seconds of overdrive. He cannot be hurt; survive until the core gives out.
// =====================================================================
(function(){ const nf=nbFinale; nbFinale=function*(){ if(NB&&!NB.over){ NB.over=1; NB.overCk=1; yield* nbOverdrive(); NB.overCk=0; } yield* nf.apply(this,arguments); }; })();
function* nbOverdrive(){ const P=Player; Sound.stop(); Game.letterTo=1; Game.state='cut'; NB.barShow=0; nbClear(); NB.red=1; NB.hov=1.4;
  cineSet(NB.x-3,1.4,NB.z+5,NB.x,2.6,NB.z); for(let i=0;i<4;i++){ NB.flash=i%2?.1:0; FX.burst(NB.x+rnd(-1,1),NB.y+rnd(1,4),NB.z,20,0xff3a4a,4,.3); Sound.sfx('hit'); yield wait(.12); }
  yield say('nathan',"Zero bars. Zero memories. And I'm STILL HERE!",'angry');
  if(ALI()) yield say('ali',"Then stay. For fifteen seconds."); else yield say('shayan',"He's at ZERO! Why is he still glowing?!",'surprised');
  evaCard(['NOTHING LEFT','SURVIVE 15 SECONDS'],1.6,1); Sound.sfx('slam'); FX.flash=.6; grade.uniforms.flashCol.value.set(1,.3,.35); shake(1); yield wait(1.6);
  Cam.cine=null; Game.letterTo=0; Game.state='play'; Sound.play('diva'); P.inv=1; const H=TW.hg={left:15,total:15,label:'NOTHING LEFT · SURVIVE'};
  const gens=[], add=g=>gens.push({g,w:0}); let next=0, k=0, boostT=0; const plan=[[0,()=>nbSpiral(4,14,5.5,1.1)],[0,()=>nbRailgun(3)],[3.6,()=>nbFunnels()],[7.2,()=>nbMemoryRain()],[10.6,()=>nbGrid(2)],[13,()=>nbSweep()]];
  const said={};
  while(H.left>0){ yield wait(1/120); if(Game.state!=='play'||!NB) continue; const dt=1/60; H.left=Math.max(0,H.left-dt); const el=15-H.left;
    while(k<plan.length&&el>=plan[k][0]){ add(plan[k][1]()); k++; }
    if(el>4&&!said.a){ said.a=1; twBark('nathan',"OVERDRIVE! OVERDRIVE! OVERDRIVE!",true); } if(el>12.5&&!said.b){ said.b=1; twBark('nathan',"Core... failing... not... YET!",true); }
    boostT-=dt; if(boostT<=0&&el<13){ boostT=1.3; const a=rnd(0,6.28); nbBoost(Player.x+Math.cos(a)*rnd(5,8),Player.z+Math.sin(a)*rnd(4,6)); }
    for(const o of gens){ if(o.done) continue; o.w-=dt; let n=0; while(o.w<=0&&!o.done&&n++<40){ const r=o.g.next(); if(r.done) o.done=1; else o.w+=r.value; } } }
  TW.hg=null; nbClear(); twBig('SYSTEM FAILURE',{size:64,col:'#ff6a7a',y:UH*.3,dur:1.4}); Sound.sfx('shatter'); FX.burst(NB.x,NB.y+2,NB.z,80,0x2a2a30,6,.5,false); NB.hov=.6; yield wait(1); Game.state='cut'; }
