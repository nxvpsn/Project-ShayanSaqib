// =====================================================================
// THE DOUBLE FIGHT, REMASTERED (2/2): the grab, Scythe Rain, limit cuts, transitions, Burnout, the ending
// =====================================================================

// ---------- TWIN EXECUTION: glomped by Caotan -> spun -> tossed up -> Omar spikes you into a black hole -> Caotan lasers the hole ----------
function* twTwinExecution(F){ const P=Player, C=F.C, O=F.O, A=twAliAny(), gx=P.x, gz=P.z, gy=groundY(gx,gz), f=C.x<P.x?1:-1, dt=1/60;
  F.grabbed=1; P.inv=99; P.cineFly=true; P.cineAnim='hurt'; P.atk=null; P.charge=0; P.dash=0; P.vx=P.vz=P.vy=0; Game.letterTo=.5; if(A){ A.hold=1; A.face=gx>A.x?1:-1; }
  C.mv=null; C.x=gx-f*.6; C.z=gz+.15; C.lockF=1; C.f=f; C.heartEyes=1; P.y=gy+.4;
  // 1. the hug: freeze frame, extreme close-up, slow push in
  impactFrame([[1,2],[2,2]]); Sound.sfx('doki'); Sound.sfx('kyun'); twHeartBurst(gx,gz,30); FX.flash=.4; grade.uniforms.flashCol.value.set(1,.6,.85);
  const mx=(gx+C.x)/2; cineSet(mx+.4,gy+2.3,gz+3.4,mx,gy+1.6,gz); twBark('caotan',"GOTCHA, SENPAI! Hug level: MAXIMUM! Your ribs: MINIMUM! ♡",true);
  yield cineTo([mx+.1,gy+2,gz+2.3],[mx,gy+1.7,gz],1,twEIO);
  // 2. the spin: two turns, the camera orbiting the other way
  Sound.sfx('whoosh'); twBark('shayan',"LET GO OF ME! WHY ARE YOU SO MOIST?!",true);
  for(let t=0;t<1.1;t+=dt){ const u=t/1.1, a=u*Math.PI*4, r=.62; P.x=gx+Math.cos(a)*r; P.z=gz+Math.sin(a)*r*.6; C.x=gx-Math.cos(a)*r; C.z=gz-Math.sin(a)*r*.6; C.f=P.x>C.x?1:-1; P.y=gy+.4+u*.8;
    const ca=-u*Math.PI*1.2; cineSet(gx+Math.sin(ca)*4.4,gy+1.3+u,gz+Math.cos(ca)*4.4,gx,gy+1.5,gz); if(Math.random()<.7) twHeartBurst(gx,gz,2); yield wait(dt*.5); }
  // 3. the toss: straight up, the camera on the ground looking up
  twBark('caotan',"OMAR! SPIKE HIM!",true); Sound.sfx('dash'); const y0=P.y, y1=gy+9.5;
  for(let t=0;t<.6;t+=dt){ const u=twEOut3(t/.6); P.x=lerp(P.x,gx,.2); P.z=lerp(P.z,gz,.2); P.y=lerp(y0,y1,u); P.cineAnim='fall'; cineSet(gx+1.6,gy+.5,gz+4.2,P.x,P.y+1,P.z); FX.spawn(P.x,P.y+.5,P.z,0,-2,0,.3,0xffb0e0,.3,0,true); yield wait(dt*.5); }
  // 4. Omar above you, against the sky; the black hole opens on the ground below
  FX.burst(O.x,O.y+1.4,O.z,22,0x140a1a,4,.45,false); O.mv=null; O.x=gx+.5; O.z=gz-.2; O.hy=y1+2.2-groundY(O.x,O.z); O.y=y1+2.2; O.lockF=1; O.f=-1; O.scythe=1; O.swing=0; O.hide=0; Sound.sfx('dash'); FX.burst(O.x,O.y+1.4,O.z,30,0x140a1a,5,.45,false);
  const V=twHoleVis(gx,gy+1.3,gz,1.5,true), hk={k:0,t:0,live:1}; Game.fxUpd.push(d=>{ hk.t+=d; hk.k=hk.live?Math.min(1,hk.k+d*1.4):Math.max(0,hk.k-d*3); V.t=hk.t; V.set(hk.k); if(!hk.live&&hk.k<=0){ V.kill(); return false; } return true; }); Sound.sfx('void'); Sound.sfx('drone');
  cineSet(gx+3.2,gy+1.2,gz+7.5,gx,y1+1.2,gz); twBark('omar',"Volleyball. I despise volleyball. Too much teamwork. Too much sunlight.",true);
  yield cineTo([gx+2.4,gy+2,gz+6],[gx,y1+1.4,gz],.95,twEIO);
  // 5. the spike: a Getsuga point blank, you go straight down into the hole, the camera whips down with you
  O.swing=1; Sound.sfx('swing'); Sound.sfx('beam'); Sound.sfx('crossboom'); FX.flash=.8; grade.uniforms.flashCol.value.set(.6,.3,1); impactFrame([[3,2],[1,1]]); shake(.8);
  { const g=twGetsugaMesh(4,0x9a4aff); g.position.set(gx,P.y+1,gz); g.rotation.set(0,0,Math.PI/2); const k={t:0}; Game.fxUpd.push(d=>{ k.t+=d; g.userData.mats.forEach(m=>m.opacity=Math.max(0,1-k.t/.4)); g.scale.setScalar(1+k.t*2); if(k.t>.4){ scene.remove(g); return false; } return true; }); }
  P.cineAnim='hurt'; const sy=P.y; for(let t=0;t<.38;t+=dt){ const u=twEIn2(t/.38); P.y=lerp(sy,gy+1.1,u); cineSet(gx+3.6,lerp(sy,gy+1.4,u)+.6,gz+5.2,gx,P.y+.6,gz); FX.spawn(P.x,P.y+1,P.z,0,6,0,.3,0x8a3aff,.4,0,true); yield wait(dt*.5); }
  // 6. swallowed. Caotan glints and fires straight into the hole
  P.hidden=true; Sound.sfx('chomp'); shake(.6); O.hy=1.3; const op=twClampXZ(gx+3,gz-1.5,1); O.x=op.x; O.z=op.z; O.y=groundY(op.x,op.z)+1.3; O.swing=0;
  const cp=twClampXZ(gx-4.5,gz+1.5,1); C.x=cp.x; C.z=cp.z; C.f=1; C.heartEyes=0; cineSet(gx-1.2,gy+1.3,gz+5.4,gx-1.6,gy+1.5,gz); yield wait(.3);
  yield* twGlint(C,1,.25,1); twBark('caotan',"MEGANE... FINISH!",true);
  const bm=[beamMesh(0xff9ad8,.45),beamMesh(0xffffff,.18)]; bm.forEach(m=>{ m.userData.tw=1; scene.add(m); twBeamTo(m,C.x,C.y+1.9,C.z,gx,gy+1.3,gz,1); }); Sound.sfx('beam'); hk.k=1.3;
  for(let t=0;t<.45;t+=dt){ bm.forEach(m=>{ const s=1+Math.sin(t*60)*.15; m.scale.x=m.scale.y=s; }); yield wait(dt*.5); } bm.forEach(m=>scene.remove(m));
  // 7. it blows: spat out, 3 hearts
  hk.live=0; FX.flash=1; grade.uniforms.flashCol.value.set(1,.7,.9); impactFrame([[1,3],[2,2],[3,2]]); Sound.sfx('crossboom'); Sound.sfx('shatter'); shake(1.3); for(let i=0;i<3;i++) FX.ring(gx,gy+.1,gz,i%2?'#ff6ab0':'#8a3aff',4+i*2.5,.5);
  FX.burst(gx,gy+1.3,gz,80,0x8a2aff,9,.5); twHeartBurst(gx,gz,40);
  P.hidden=false; P.cineFly=false; P.cineAnim=null; P.x=gx; P.z=gz; P.y=gy+.5; P.inv=0; P.dash=0; Cam.cine=null; Game.letterTo=0; C.lockF=0; O.lockF=0; O.scythe=0; if(A){ A.hold=0; A.face=null; }
  Game.dmgNums.push({x:P.x,y:P.y+2.6,z:P.z,n:'TWIN EXECUTION',t:0,big:true,col:'#ff8ac8'}); F.grabbed=0;
  twHoleEat(gx,gz,6); if(Game.state==='play'&&P.hp>0&&A&&!F.revQ) twBark('ali',"That was embarrassing. For all four of us. Five, counting the pillow.",true); }

// ---------- falling scythes (Scythe Rain and Burnout) ----------
function twSkyScythe(x,z,warn,o){ o=o||{}; const p=twClampXZ(x,z,.6), gy=groundY(p.x,p.z), m=o.mesh||twScytheMesh(false), s={t:0}; m.userData.tw=1; m.visible=!!o.mesh;
  const sx=o.fx!=null?o.fx:p.x+rnd(-2,2), sy=o.fy!=null?o.fy:gy+12, sz=o.fz!=null?o.fz:p.z-3;
  twBlast(p.x,p.z,1,warn,{col:0xff2a3a,burst:0x8a3aff,ring:'#c08aff',dmg:o.dmg||2,sfx:'hit',shake:.12,quiet:o.quiet});
  twHz({upd(dt,play){ if(play) s.t+=dt;
    if(s.t>=warn){ if(!s.stuck){ s.stuck=1; m.visible=true; m.position.set(p.x,gy+.45,p.z); m.rotation.set(0,rnd(0,6.28),2.3+rnd(-.3,.3)); } /* it sticks in the ground, then shatters a second later */
      if(s.t<warn+1) return true; FX.burst(p.x,gy+.7,p.z,16,0xc08aff,5,.35); FX.burst(p.x,gy+.5,p.z,10,0x1a0a20,4,.3,false); if(!o.quiet) Sound.sfx('glass'); return false; }
    const u=clamp((s.t-(warn-.3))/.3,0,1); if(!o.mesh) m.visible=u>0; if(u>0||!o.mesh){ m.position.set(lerp(sx,p.x,u),lerp(sy,gy+.6,o.arc?u:u*u)+(o.arc?Math.sin(u*Math.PI)*o.arc:0),lerp(sz,p.z,u)); m.rotation.z=s.t*18; } return true; }, kill(){ scene.remove(m); }}); }
// a dark orb high in the sky: a thin red aiming line, then a black laser down through you (Omar's rift orb)
function twSkyOrb(x,z,o){ o=Object.assign({h:6.5,every:2.4,aim:.75,dur:20,delay:0},o||{}); const m=new THREE.Mesh(new THREE.SphereGeometry(.5,16,12),new THREE.MeshBasicMaterial({color:0x07020c})); m.userData.tw=1; scene.add(m); const g=twGlow(0x8a2aff,2.6);
  const Q={x,z,y:groundY(x,z)+o.h,t:0,next:o.delay+1,aim:null,ph:rnd(0,6)};
  return twHz({upd(dt,play){ if(play) Q.t+=dt; const k=Math.min(1,Q.t*2)*Math.min(1,Math.max(0,(o.dur-Q.t)*2)); if(play){ Q.x+=Math.sin(Q.t*.6+Q.ph)*dt*1.2; Q.z+=Math.cos(Q.t*.5+Q.ph)*dt*.8; } const c=twClampXZ(Q.x,Q.z,2); Q.x=c.x; Q.z=c.z; Q.y=groundY(Q.x,Q.z)+o.h+Math.sin(Q.t*2)*.15;
      m.position.set(Q.x,Q.y,Q.z); m.scale.setScalar(Math.max(.01,k)); g.position.copy(m.position); g.scale.setScalar(Math.max(.01,2.6*k)); if(Math.random()<.4) FX.spawn(Q.x+rnd(-.5,.5),Q.y+rnd(-.5,.5),Q.z,0,0,0,.4,0x8a2aff,.25,0,true);
      const P=Player; if(play&&!Q.aim&&Q.t>=Q.next&&Q.t<o.dur-1){ Q.next=Q.t+o.every; Q.aim={t:0,tx:P.x,ty:P.y+.9,tz:P.z,m:twTearBeam(0xff2020,.035,true)}; Sound.sfx('charge'); }
      if(Q.aim){ const a=Q.aim; if(play) a.t+=dt; if(a.t<o.aim-.2){ a.tx=P.x; a.ty=P.y+.9; a.tz=P.z; } const gy=groundY(a.tx,a.tz), kk=(Q.y-gy)/Math.max(.3,Q.y-a.ty), ex=Q.x+(a.tx-Q.x)*kk, ez=Q.z+(a.tz-Q.z)*kk;
        twBeamTo(a.m,Q.x,Q.y,Q.z,ex,gy,ez,1); a.m.material.opacity=.5+.5*Math.sin(a.t*40); if(a.t>=o.aim){ scene.remove(a.m); Q.aim=null; twTearFire(Q,ex,gy,ez,false); } }
      return Q.t<o.dur; }, kill(){ scene.remove(m); scene.remove(g); if(Q.aim) scene.remove(Q.aim.m); }}); }

// =====================================================================
// SCYTHE RAIN: at 50 planted, every blade rises into a halo over the arena, then they come down ten waves of five.
// Red circles first (always a gap). The glowing ones dive straight at you: deflect them and they fly back into the twins.
// =====================================================================
DUO.scytheRain=function*(C,O,ph){ const F=TW.fight, sp=twSp(O), list=TW.planted.splice(0,DUO3.rain); TW.storming=1; F.rains=(F.rains||0)+1; const c=twCenter(), gy=groundY(c.x,c.z);
  list.forEach((o,i)=>{ o.m.userData.tw=1; o.m.userData.plant=0; o.sx=o.x; o.sy=o.y; o.sz=o.z; o.slot=i; o.st='rise'; });
  const halo={t:0,live:true,u:0}; const slot=i=>{ const n=list.length, ring=i%2, a=i/n*6.283+halo.t*(ring?.35:-.25), r=ring?7:4.6; return {x:c.x+Math.cos(a)*r,y:gy+10.5+ring*1.2+Math.sin(halo.t*2+i)*.2,z:c.z+Math.sin(a)*r*.75}; };
  twHz({upd(dt){ halo.t+=dt; for(const o of list){ if(o.st!=='rise'&&o.st!=='halo') continue; const s=slot(o.slot); if(o.st==='rise'){ o.ru=(o.ru||0)+dt/(.9+o.slot*.012); const e=twEIO(Math.min(1,o.ru)); o.x=lerp(o.sx,s.x,e); o.y=lerp(o.sy,s.y,e)+Math.sin(e*Math.PI)*2; o.z=lerp(o.sz,s.z,e); if(o.ru>=1) o.st='halo'; }
        else { o.x=s.x; o.y=s.y; o.z=s.z; } o.m.position.set(o.x,o.y,o.z); o.m.rotation.set(0,0,halo.t*8+o.slot); if(Math.random()<.08) FX.spawn(o.x,o.y,o.z,0,0,0,.4,0x8a3aff,.3,0,true); }
      return halo.live; }, kill(){ list.forEach(o=>{ if(o.st!=='gone') scene.remove(o.m); }); }});
  run(function*(){ yield* twRainIntro(F,C,O,c,gy); }); yield .05;
  try{
    const rest=()=>list.filter(o=>o.st==='halo'||o.st==='rise'); if(ph>=3){ const dir=Math.random()<.5?1:-1, b0=rnd(0,6.28); twBeam({x:C.x,z:C.z,ang:t=>b0+Math.max(0,t-.9)*.55*dir,len:18,w:1,warn:.9,dur:6.2,dmg:3,col:0xbfe4ff}); }
    for(let w=0;w<10;w++){ const P=Player, warn=.85/sp, pts=[], a0=rnd(0,6.28), kind=w%3;
      if(kind===0){ pts.push([P.x,P.z]); for(let k=0;k<4;k++){ const a=a0+k*Math.PI/2; pts.push([P.x+Math.cos(a)*2.3,P.z+Math.sin(a)*2.3]); } }
      else if(kind===1){ const ux=Math.cos(a0), uz=Math.sin(a0); for(let k=-2;k<=2;k++) pts.push([P.x+ux*k*1.9,P.z+uz*k*1.9]); }
      else { pts.push([P.x,P.z]); pts.push([P.x+P.vx*.4,P.z+P.vz*.4]); pts.push([P.x+P.vx*.8,P.z+P.vz*.8]); for(let k=0;k<2;k++){ const a=a0+k*Math.PI; pts.push([P.x+Math.cos(a)*2.6,P.z+Math.sin(a)*2.6]); } }
      const avail=rest(); if(!avail.length) break; const homing=w%2===1;
      pts.forEach(([x,z],k)=>{ const o=avail[k]; if(!o) return; if(homing&&k===4){ // Gerald: dives at you, deflectable
          o.st='gone'; scene.remove(o.m); const b=twBolt(O,{kind:'scythe',x:o.x,y:o.y,z:o.z,vx:0,vz:0,delay:.35,spd:17*sp,col:0xd08aff,dmg:2,life:2.4}); b.rain=1; Sound.sfx('charge'); return; }
        o.st='gone'; twSkyScythe(x,z,warn,{mesh:o.m,fx:o.x,fy:o.y,fz:o.z,quiet:k>0}); });
      Sound.sfx('swing'); if(w===2) twBark('caotan',"GO GERALD! GO GERALD!",true); if(w===6) twBark('omar',"Gerald. No. That is Phil. Phil, you're out of order.",true); yield .62/sp; }
    yield 1;
  } finally { halo.live=false; TW.storming=0; }
  O.stun=Math.max(O.stun,2.6); O.state='stun'; O.cast=0; twBark('omar',"Fifty scythes... and I have to pick them all up again... with my back...",true); twBig('OMAR IS EXHAUSTED',{size:44,col:'#ffd45a',y:UH*.3,dur:1.3}); yield 2.6; };
function* twRainIntro(F,C,O,c,gy){ const P=Player, A=twAliAny(); Game.letterTo=.45; P.vx=P.vz=0; O.cast=3; O.scythe=0; if(A){ A.hold=1; A.face=O.x>A.x?1:-1; }
  cineSet(P.x+.8,P.y+1,P.z+5.5,O.x,O.y+1.6,O.z); Sound.sfx('howl'); Sound.sfx('gong'); twBark('omar',"Fifty scythes. Fifty names. Gerald... lead them.",true); yield wait(1.4);
  Sound.sfx('charge'); Sound.sfx('drone'); twBark('caotan',"Not GERALD! Gerald's the sharp one! Gerald has a CRIMINAL RECORD!",true); yield cineTo([c.x,gy+2.2,c.z+14],[c.x,gy+9.5,c.z],1.5,twEIO);
  if(A) twBark('ali',"Fifty. I counted. Move, blacksmith. Or become a pincushion. Your call.",true); else twBark('shayan',"That's a LOT of scythes! Does he have a scythe GUY?!",true); yield wait(1.1);
  twBig('SCYTHE RAIN',{size:70,col:'#c08aff',y:UH*.3,dur:1.6,sub:'Red circles. Deflect the glowing ones back.'}); yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.6);
  Cam.cine=null; Game.letterTo=0; if(A){ A.hold=0; A.face=null; } }

// =====================================================================
// LIMIT CUT I (phase II at 50%): EVENT HORIZON. Omar's Getsuga tears the sky open; a black hole hangs over the arena.
//   A) it pulls you in (the core burns): Getsugas run out of it, Caotan's blue chords cross the arena (jump)
//   B) four small holes orbit it; Omar rushes you three times (parry)
//   C) GETSUGA TENSHOU: EVENT HORIZON: a giant Getsuga down a lane, then the hole slams down: jump three rings
// =====================================================================
function* twDuoRush(O,sp){ const P=Player, from=Game.time+TW_STRICT.grace, a0=(P.ang||0)+rnd(-.8,.8), p=twClampXZ(P.x+Math.cos(a0)*7,P.z+Math.sin(a0)*7,.8);
  twBlink(O,p.x,p.z); O.hide=0; O.scythe=1; let a=Math.atan2(P.z-O.z,P.x-O.x); const tell=.6/sp; let t=0, ln=null; O.lockF=1;
  while(t<tell){ const P2=Player; if(t<tell-.15) a=Math.atan2(P2.z-O.z,P2.x-O.x); O.f=Math.cos(a)>0?1:-1; if(!ln||t-ln>.1){ ln=t; FX.line(O.x,O.z,a,Math.hypot(P2.x-O.x,P2.z-O.z)+4,2.6,0xb06aff,.12); } yield .016; t+=.016; }
  const s={t:0,hit:false,dur:(Math.hypot(Player.x-O.x,Player.z-O.z)+4)/20}; Sound.sfx('swing'); O.swing=1; O.parried=0;
  twHz({upd(dt,play){ if(!play) return true; s.t+=dt; O.x+=Math.cos(a)*20*dt; O.z+=Math.sin(a)*20*dt; const q=twClampXZ(O.x,O.z,.5); O.x=q.x; O.z=q.z; if(!s.hit) twRushTell(O,a); FX.spawn(O.x,O.y+1.4,O.z,0,0,0,.35,0x2a0a3a,.6,0,false);
    const P2=Player; if(!s.hit&&Math.hypot(P2.x-O.x,P2.z-O.z)<TW_DASH_R&&Math.abs(P2.y-groundY(O.x,O.z))<2.4){ s.hit=true; twStrictDo(from,()=>twHitP(2,O.x,O.z,{melee:true,heavy:true,win:TW_DASH_WIN,onParry:()=>{ O.parried=1; O.flash=.3; }})); }
    return s.t<s.dur&&!O.parried; }});
  let w=0; while(w<s.dur+.05&&!O.parried){ yield .016; w+=.016; } O.swing=0; O.lockF=0; if(O.parried) Sound.sfx('clash'); return O.parried; }
DUO.waltz=function*(C,O){ const F=TW.fight, c=twCenter(), gy=groundY(c.x,c.z), sp=1.1; F.mid=null; F.guard=null; F.kick=null;
  const hx=c.x, hz=c.z-.5, V=twHoleVis(hx,gy+6.5,hz,2.2,true), HV={k:0,t:0,live:true,y:gy+6.5,pull:3.2,zone:null};
  Game.fxUpd.push(d=>{ HV.t+=d; HV.k=HV.live?Math.min(1,HV.k+d*.8):Math.max(0,HV.k-d*2); V.t=HV.t; V.y=HV.y; V.set(HV.k); if(!HV.live&&HV.k<=0){ V.kill(); return false; } return true; });
  run(function*(){ yield* twHorizonIntro(F,C,O,c,gy,HV); }); yield .05;
  Game.letterTo=.35; Sound.sfx('void');
  // the pull, and the burning core under it
  const pullH=twHz({upd(dt,play){ const P=Player; if(play&&HV.live&&!P.hidden&&P.dash<=0&&!P.cineFly&&!(P.bhLaunch>Game.time)&&!(P.bhPause>Game.time)){ const dx=hx-P.x, dz=hz-P.z, d=Math.hypot(dx,dz)||1; if(d>.3){ const q=twClampXZ(P.x+dx/d*HV.pull*dt,P.z+dz/d*HV.pull*dt,.3); P.x=q.x; P.z=q.z; } }
    if(Math.random()<.6){ const a=rnd(0,6.28), r=rnd(3,9); FX.spawn(hx+Math.cos(a)*r,gy+rnd(.2,1.5),hz+Math.sin(a)*r,-Math.cos(a)*r*.8,rnd(.5,1.5),-Math.sin(a)*r*.8,.6,0x8a2aff,.25,0,true); } return HV.live; }});
  const core=twZone(hx,hz,2.3,30,{dmg:2,every:.5,col:0x05000a,op:.9});
  try{
    // A) Getsugas out of the hole, blue chords across the arena
    twBark('omar',"Everything falls into me eventually. Bills. Light. You.",true); let t=0, nG=0, nB=.6; const dur=8.5;
    while(t<dur){ t+=.05; if(t>=nG){ nG+=1.15/sp; const P=Player, a=Math.atan2(P.z-hz,P.x-hx)+(Math.random()<.5?.25:-.25); O.swing=0; twGetsuga(O,a,{x:hx,z:hz,warn:.5,sp:13*sp,len:20}); }
      if(t>=nB){ nB+=1.5/sp; const P=Player, a=rnd(0,Math.PI); C.push=.3; C.glintT=.3; Sound.sfx('ting'); twBlue(P.x,P.z,a,{warn:.55}); } yield .05; }
    yield .4;
    // B) four small holes orbit the big one; Omar rushes you
    twBark('caotan',"I'm charging something BIG! Don't look! Actually look, it's cool!",true); const mini=[], ma={a:rnd(0,6.28)};
    for(let k=0;k<4;k++){ const h=twMiniHole(hx+6.5,hz,{r:.75,pull:2.6,range:4,dur:9,eat:1,dmg:5}); mini.push(h); }
    const orbit=twHz({upd(dt,play){ if(play) ma.a+=dt*.45; mini.forEach((h,k)=>{ if(!h.hole) return; const a=ma.a+k*Math.PI/2; h.hole.x=hx+Math.cos(a)*6.5; h.hole.z=hz+Math.sin(a)*5; }); return HV.live&&mini.some(h=>TW.hz.includes(h)); }});
    let par=0; for(let i=0;i<3;i++){ yield .5; C.glintN=i+1; C.push=.3; C.glintT=.4; Sound.sfx('ting'); if(yield* twDuoRush(O,sp)) par++; } yield .6;
    mini.forEach(h=>{ h.upd=()=>false; }); orbit.upd=()=>false;
    // C) the finale
    twCutin('omar','GETSUGA TENSHOU','Event Horizon  ·  the hole is the blade','#3a0a6a',1.6); twBark('omar',"GETSUGA... TENSHOU... EVENT HORIZON!",true);
    twBlink(O,hx-1.2,hz-1); O.hy=4.6; O.scythe=1; C.push=.5; C.glintT=.8; Sound.sfx('ting'); { const bm=[beamMesh(0xff9ad8,.4),beamMesh(0xffffff,.16)]; bm.forEach(m=>{ m.userData.tw=1; scene.add(m); }); const k={t:0}; twHz({upd(dt){ k.t+=dt; bm.forEach(m=>twBeamTo(m,C.x,C.y+1.9,C.z,hx,HV.y,hz,1+Math.sin(k.t*50)*.15)); return k.t<1.3; }, kill(){ bm.forEach(m=>scene.remove(m)); }}); }
    const P=Player, lane=Math.random()<.5?0:Math.PI/2, ux=Math.cos(lane), uz=Math.sin(lane), A=twBounds(), sx=lane===0?A.x0:P.x, sz=lane===0?P.z:A.z0, L0=lane===0?A.x1-A.x0:A.z1-A.z0;
    FX.line(sx,sz,lane,L0,5,0x9a4aff,1.25); twBig('GET OUT OF THE LANE',{size:48,col:'#d0a0ff',y:UH*.28,dur:1.2}); yield 1.25;
    O.swing=1; shake(1); twGetsuga(O,lane,{x:sx,z:sz,warn:0,sp:24,len:L0,s:6.4,w:2.6,dmg:5}); yield .9;
    // the hole slams into the ground
    HV.live=false; Sound.sfx('crossboom'); Sound.sfx('skyopen'); FX.flash=.7; grade.uniforms.flashCol.value.set(.6,.3,1); impactFrame([[2,2],[1,2]]); shake(1.2);
    twBig('JUMP!',{size:80,col:'#ff4a5a',y:UH*.3,dur:1.6}); for(const [sp2,dl] of [[7,0],[9,.6],[11,1.2]]) twWave(hx,hz,{col:0xb06aff,sp:sp2,max:16,dmg:3,delay:dl,r0:2.5}); yield 2.6;
  } finally { HV.live=false; pullH.upd=()=>false; if(core) core.upd=()=>false; O.hy=1.3; }
  twBark('caotan',"My glasses! It ate my SPARE glasses!",true); twBig('EVENT HORIZON SURVIVED',{size:54,col:'#ffd45a',sub:'Both twins are dizzy. Go!'});
  Game.letterTo=0; F.lc=0; F.lcDone[2]=1; F.busy=0; O.scythe=0; O.swing=0; for(const T of [C,O]){ T.inv=false; T.stun=4.5; T.state='stun'; if(T.hp<=0) T.hp=.1; } yield 4.5; };
function* twHorizonIntro(F,C,O,c,gy,HV){ const P=Player, A=twAliAny(); Game.letterTo=.5; P.vx=P.vz=0;
  Object.assign(O,{x:c.x+1.6,z:c.z-3,mv:null,lockF:1,f:-1,scythe:1}); Object.assign(C,{x:c.x-3.4,z:c.z-2.4,mv:null,lockF:1,f:1});
  Object.assign(P,{x:c.x-.8,z:c.z+4.2}); P.y=groundY(P.x,P.z); P.f=1; if(A){ A.hold=1; A.x=c.x+.9; A.z=c.z+4.4; A.face=-1; }
  HV.k=0; HV.y=gy+12; cineSet(O.x+1.4,gy+.6,O.z+4.6,O.x,O.y+1.9,O.z); Sound.sfx('howl'); twBark('omar',"Brother. Hold my feelings. Carefully. They bite.",true); yield wait(1.4);
  twBark('caotan',"I'm ALWAYS holding your feelings!",true); yield wait(1.1);
  // the Getsuga goes straight up and tears the sky
  O.swing=1; Sound.sfx('swing'); Sound.sfx('beam'); const g=twGetsugaMesh(3.4,0x9a4aff), k={y:O.y+1}; g.rotation.set(0,0,0);
  Game.fxUpd.push(d=>{ k.y+=d*18; g.position.set(O.x,k.y,O.z); if(k.y>gy+12){ scene.remove(g); return false; } return true; });
  yield cineTo([O.x+2,gy+1,O.z+7],[O.x,gy+11,O.z-2],.7,twEIO); Sound.sfx('tear'); Sound.sfx('skyopen'); Sound.sfx('void'); shake(1); FX.flash=.6; grade.uniforms.flashCol.value.set(.5,.2,1); impactFrame([[3,2],[1,2]]);
  twAnim(HV,{k:1},1.2); yield wait(.6); twAnim(HV,{y:gy+6.5},1.4,twEIO); yield cineTo([c.x,gy+2,c.z+13],[c.x,gy+5.5,c.z],1.4,twEIO);
  // reverse shot: the heroes look up
  cineSet(P.x+.9,P.y+.9,P.z+3.4,(P.x+(A?A.x:P.x))/2,P.y+1.6,P.z); P.cineFly=true; P.cineAnim='idle';
  twBark('shayan',"Is that a BLACK HOLE?! In the FLOWER FIELD?!",true); yield wait(1.5);
  if(A){ twBark('ali',"It's a small one. Don't get sucked in. Or do. I'm not your father.",true); yield wait(1.3); } P.cineFly=false; P.cineAnim=null;
  twCutin('omar','EVENT HORIZON','Limit Break  ·  Everything falls in eventually','#3a0a6a',2); yield wait(.9);
  yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.6); Cam.cine=null; O.lockF=C.lockF=0; O.swing=0; if(A){ A.hold=0; A.face=null; } }

// =====================================================================
// LIMIT CUT II (phase III at 50%): HIKARI PRISM. Caotan's ultimate waifu, forty feet of memory foam.
//   A) she spins three blue beams (jump) while Caotan's laser feeds her; Omar's scythes from the edges (deflect)
//   B) Senpai Cage x3
//   C) MEGANE SUPERNOVA: hide in her shadow, but Omar's black hole is dragging her away (and you)
// =====================================================================
function twGiantHikari(x,z){ const H=twHikari(x,z,1); H.k=1; H.hov=0; H.put=function(){ this.m.position.set(this.x,this.y,this.z); this.m.rotation.z=this.spin; this.m.scale.setScalar(Math.max(.01,this.k)); }; return H; }
DUO.fusion=function*(C,O){ const F=TW.fight, c=twCenter(), gy=groundY(c.x,c.z), sp=1.15; F.mid=null; F.guard=null; F.kick=null;
  const H=twGiantHikari(c.x,c.z-1); H.k=.01; H.y=gy+1; H.put(); const live={on:true};
  Game.fxUpd.push(()=>{ if(!live.on||H.gone) return false; H.put(); if(Math.random()<.5) FX.spawn(H.x+rnd(-1,1)*H.k*.5,H.y+rnd(-1.3,1.3)*H.k,H.z,0,rnd(.3,1),0,.6,Math.random()<.5?0xff8ac8:0xffffff,.3,0,true); return true; });
  run(function*(){ yield* twPrismIntro(F,C,O,c,gy,H); }); yield .05; Game.letterTo=.35;
  let beamOn=true; const bm=[beamMesh(0xff9ad8,.3),beamMesh(0xffffff,.12)]; bm.forEach(m=>{ m.userData.tw=1; scene.add(m); }); const feed=twHz({upd(dt){ bm.forEach(m=>{ m.visible=beamOn; if(beamOn) twBeamTo(m,C.x,C.y+1.9,C.z,H.x,H.y,H.z,1+Math.sin(TW.t*50)*.12); }); return live.on; }, kill(){ bm.forEach(m=>scene.remove(m)); }});
  try{
    // A) Prism Spin
    twMoveTo(C,c.x-6,c.z-4,.6); twBark('caotan',"Shine, Hikari-chan! Shine for SENPAI!",true); const dir=Math.random()<.5?1:-1, b0=rnd(0,6.28), om=.8*sp;
    for(let k=0;k<3;k++) twBeam({x:H.x,z:H.z,ang:t=>b0+k*2.094+Math.max(0,t-.9)*om*dir,len:20,w:1,warn:.9,dur:7.6,dmg:3,col:0xbfe4ff});
    twHz({upd(dt){ this.t+=dt; H.spin+=dt*om*dir; return this.t<8.5&&live.on; }});
    for(let i=0;i<4;i++){ yield 1.9; const P=Player; O.cast=.5; const e=twClampXZ(P.x+rnd(-7,7),P.z+(Math.random()<.5?-6:6),1); twBlink(O,e.x,e.z);
      for(const s of [-1,1]){ const hx=O.x+s*1.4, hz=O.z, P2=Player, y=groundY(hx,hz)+1.1, aa=Math.atan2(P2.z-hz,P2.x-hx), d=Math.max(3,Math.hypot(P2.x-hx,P2.z-hz)), off=.9*s, v=9.5;
        twBolt(O,{kind:'scythe',x:hx,y,z:hz,vx:Math.cos(aa+off)*v,vz:Math.sin(aa+off)*v,curl:-2*off*v/(d*1.1),dmg:2,life:d*1.25/v+1,col:0x8a3aff}); } Sound.sfx('swing'); }
    yield 1.3; H.spin=0;
    // B) Love Lattice: three cages in a row
    beamOn=false; twAnim(H,{y:gy+7},.8); twBark('omar',"Brother. She is... beautiful.",true); yield .9; twBark('caotan',"I KNOW!",true);
    for(let i=0;i<3;i++){ yield* twCage(C,sp); yield .15; }
    // C) MEGANE SUPERNOVA x EVENT HORIZON
    const A=twBounds(), P=Player; let hp2=null; for(let g=0;g<30&&!hp2;g++){ const p=twRandIn(3); if(Math.hypot(p.x-P.x,p.z-P.z)>4&&Math.hypot(p.x-C.x,p.z-C.z)>6) hp2=p; } hp2=hp2||twClampXZ(P.x+5,P.z,3);
    twAnim(H,{x:hp2.x,z:hp2.z,y:groundY(hp2.x,hp2.z)+3.4},.7,twEIn2); yield .75; Sound.sfx('crash'); shake(.6); FX.burst(H.x,groundY(H.x,H.z)+.4,H.z,40,0xffffff,6,.4,false);
    twMoveTo(C,c.x,A.z0+1.5,.5); let bc=null; for(let g=0;g<30&&!bc;g++){ const p=twRandIn(2); if(Math.hypot(p.x-H.x,p.z-H.z)>7&&Math.hypot(p.x-P.x,p.z-P.z)>5) bc=p; } bc=bc||twClampXZ(H.x-7,H.z,2);
    twBark('omar',"Let me help. By ruining everything.",true); const hole=twMiniHole(bc.x,bc.z,{r:1.1,pull:4.8,range:14,dur:9,eat:1.05,dmg:5,disk:1,h:1.3});
    const safe={x:H.x,z:H.z}; TW.caoSafe=safe; const ring=new THREE.Mesh(new THREE.RingGeometry(1.25,1.5,40),new THREE.MeshBasicMaterial({color:0x5ab0ff,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.userData.tw=1; scene.add(ring);
    const drag=twHz({upd(dt,play){ if(play){ const dx=bc.x-H.x, dz=bc.z-H.z, d=Math.hypot(dx,dz)||1; if(d>2.6){ H.x+=dx/d*.85*dt+(-dz/d)*.5*dt; H.z+=dz/d*.85*dt+(dx/d)*.5*dt; } } H.y=groundY(H.x,H.z)+3.4;
        const ux=H.x-C.x, uz=H.z-C.z, ul=Math.hypot(ux,uz)||1; safe.x=H.x+ux/ul*1.6; safe.z=H.z+uz/ul*1.6; ring.position.set(safe.x,groundY(safe.x,safe.z)+.08,safe.z); ring.material.opacity=.55+.35*Math.sin(TW.t*12); return live.on; }, kill(){ scene.remove(ring); }});
    twBig('HIDE BEHIND HIKARI-CHAN!',{size:52,col:'#bfe4ff',dur:2,y:UH*.62,sub:'Stay in the blue ring. The black hole is dragging her away.'}); Sound.sfx('drone'); Sound.sfx('choir');
    for(let i=1;i<=5;i++){ C.push=.4; C.glintN=i; C.glintT=.7; C.showN=1; Sound.sfx('ting'); twBig('✦ '+i+' ✦',{size:50+i*8,y:UH*.2,dur:.8,col:i===5?'#ffffff':'#bfe4ff'}); FX.flash=.1+i*.08; grade.uniforms.flashCol.value.set(.85,.95,1); shake(.1+i*.05); if(i===3) twBark('caotan',"TEN GLINTS WAS TOO MANY. FIVE IS PERFECT. FIVE IS ART.",true); yield 1.05; }
    twBark('caotan',"MEGANE... SUPERNOVAAAA!",true); impactFrame([[1,3],[2,2],[1,2],[3,2]]); FX.flash=1; grade.uniforms.flashCol.value.set(.9,.97,1); Sound.sfx('crossboom'); Sound.sfx('skyopen'); shake(1.4); FX.hitstop=.12;
    const nb=[beamMesh(0xbfe4ff,3.5),beamMesh(0xffffff,1.6)]; nb.forEach(o=>{ o.userData.tw=1; o.position.set(C.x,C.y+2,C.z); o.lookAt(C.x,C.y+30,C.z); o.scale.set(1,1,40); }); twHz({upd(dt){ this.t+=dt; const k=Math.max(0,1-this.t/1.2); nb.forEach(o=>{ o.scale.x=o.scale.y=Math.max(.01,k*(1+Math.sin(this.t*50)*.1)); }); return this.t<1.2; }, kill(){ nb.forEach(o=>scene.remove(o)); }});
    const Pl=Player; if(Math.hypot(Pl.x-safe.x,Pl.z-safe.z)>1.7){ TW.caoSafe=null; if(TW.god){ Game.dmgNums.push({x:Pl.x,y:Pl.y+2.4,z:Pl.z,n:'∞ HP',t:0,col:'#7affb0'}); } else { Pl.inv=0; Pl.dash=0; hurtPlayer(99,C.x,C.z); } twBark('caotan',"Should've hugged the pillow, senpai.",true); }
    else { Game.dmgNums.push({x:Pl.x,y:Pl.y+2.4,z:Pl.z,n:'SHIELDED BY WAIFU',t:0,big:true,col:'#bfe4ff'}); }
    TW.caoSafe=null; drag.upd=()=>false; yield 1.2;
    // the hole eats her
    const hb={x:bc.x,z:bc.z}; twAnim(H,{x:hb.x,z:hb.z,k:.05,y:groundY(hb.x,hb.z)+1.3},.9,twEIn2); Sound.sfx('suck'); twBark('caotan',"HIKARI-CHAAAAAN! NOOOOO!",true); yield 1; Sound.sfx('chomp'); hole.upd=()=>false; H.kill();
    twBark('omar',"...She was delicious. Mostly feathers.",true); yield 1;
  } finally { live.on=false; feed.upd=()=>false; TW.caoSafe=null; H.kill(); C.showN=0; C.glintN=0; }
  twBig('PRISM SHATTERED',{size:56,col:'#ffd45a',sub:'Caotan is in mourning. Omar is full. Go!'}); Game.letterTo=0; F.lc=0; F.lcDone[3]=1; F.busy=0; for(const T of [C,O]){ T.inv=false; T.stun=5; T.state='stun'; if(T.hp<=0) T.hp=.1; } yield 5; };
function* twPrismIntro(F,C,O,c,gy,H){ const P=Player, A=twAliAny(); Game.letterTo=.5; P.vx=P.vz=0; Object.assign(C,{x:c.x-1.2,z:c.z-2.4,mv:null,lockF:1,f:1}); Object.assign(O,{x:c.x+3,z:c.z-3.2,mv:null});
  Object.assign(P,{x:c.x-1,z:c.z+4.4}); P.y=groundY(P.x,P.z); if(A){ A.hold=1; A.x=c.x+.8; A.z=c.z+4.6; A.face=-1; }
  cineSet(C.x+1,C.y+1.6,C.z+4,C.x,C.y+1.6,C.z); twBark('caotan',"Omar. It's time... for HER.",true); yield wait(1.4);
  cineSet(O.x-.6,O.y+1.6,O.z+3.6,O.x,O.y+1.7,O.z); twBark('omar',"...No. Not her. Anything but her.",true); yield wait(1.4);
  // she grows: a low hero shot, orbiting
  H.x=C.x+.8; H.z=C.z+.2; H.y=C.y+1; H.k=.4; Sound.sfx('sparkle'); Sound.sfx('choir'); Sound.sfx('fuse'); twAnim(H,{k:3.4,x:c.x,z:c.z-1,y:gy+4.6},1.8,twEIO);
  const orb=twOrbit({x:c.x,y:gy,z:c.z-1},11,1,-.8,.8,2.6,4.5); yield wait(1.9); shake(.8); impactFrame([[1,2],[3,2]]); Sound.sfx('slam'); twHikariBurst(H.x,H.y,H.z); yield wait(.8); orb.dead=1;
  cineSet(P.x+.8,P.y+.8,P.z+3.2,P.x+.4,P.y+2,P.z); P.cineFly=true; P.cineAnim='idle'; twBark('shayan',"She's... HUGE. Why is the pillow THICC?!",true); yield wait(1.1);
  if(A){ twBark('ali',"Her eyes follow you. I've cut a god. This bothers me more.",true); yield wait(1.4); } P.cineFly=false; P.cineAnim=null;
  cineSet(c.x,gy+1.2,c.z+9,c.x,gy+4.5,c.z-1); twBark('caotan',"Hikari-chan ULTIMATE FORM: PRISM MODE! ♡",true); twCutin('caotan','HIKARI PRISM','Limit Break  ·  forty feet of memory foam','#ff6ab0',2); yield wait(1.6);
  yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.6); Cam.cine=null; C.lockF=0; if(A){ A.hold=0; A.face=null; } }

// =====================================================================
// PHASE TRANSITIONS (camera + choreography, Shayan and Ali in every one)
// =====================================================================
twDuoPhaseCine=function*(F,C,O){ const P=Player, A=twAliAny(); Sound.stop(); Game.letterTo=1; P.inv=99; FX.flash=.7; impactFrame([[2,2],[1,1]]); Sound.sfx('crash'); shake(.7); F.mid=null; F.guard=null; F.kick=null; TW.sentence=null;
  if(F.phase===3){ if(!F.burned){ yield* twBurnoutIntro(F,C,O); return; } yield* twDuoEnding(F,C,O); return; }
  if(F.phase===1) yield* twDuo3Trans1(F,C,O); else yield* twDuo3Trans2(F,C,O);
  F.phase++; const ph=F.phase; for(const T of [C,O]) Object.assign(T,{phase:ph,hp:DUO_HP[ph],maxHp:DUO_HP[ph],down:0,inv:false,stun:0,gen:null,state:'idle',bag:[],hide:0,hy:1.3,lockF:0,scythe:0,swing:0});
  F.bag=[]; F.busy=0; F.dcd=1.4; F.director=1; F.lcDone[ph]=0; if(A){ A.hold=0; A.face=null; }
  if(F.bonusStun){ for(const T of F.bonusStun.who){ T.stun=F.bonusStun.t; T.state='stun'; } F.bonusStun=null; }
  card('Phase '+['','I','II','III'][ph],ph===2?'Sibling Sync':"Tuesday's Children"); Sound.play(['','boss','diva','seraph'][ph]);
  yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.7); Cam.cine=null; Game.letterTo=0; P.inv=1; P.cineFly=false; P.cineAnim=null; twDuoSeed(ph===3&&!F.rains?DUO3.rain:DUO3.seed[ph]); }; // no rain yet by phase III: it opens with a full graveyard
// I -> II: the charge, blocked by a scythe and a body pillow, then the Getsuga clash, then the sync
function* twDuo3Trans1(F,C,O){ const P=Player, A=twAliAny(), c=F.center, gy=groundY(c.x,c.z), dt=1/60;
  C.down=O.down=1; C.mv=O.mv=null; C.inv=O.inv=true; Object.assign(C,{x:c.x-1.5,z:c.z-1.6,lockF:1,f:1}); Object.assign(O,{x:c.x+1.6,z:c.z-1.6,lockF:1,f:-1});
  Object.assign(P,{x:c.x-3,z:c.z+5,vx:0,vz:0}); P.y=groundY(P.x,P.z); P.f=1; if(A){ A.hold=1; A.x=c.x+3; A.z=c.z+5.2; A.face=-1; }
  cineSet(c.x,gy+3.4,c.z+11,c.x,gy+1.3,c.z-1); yield wait(.4);
  yield say('caotan',"Omar... it's time."); yield say('omar',"...For what?"); yield say('caotan',"The SYNC.",'angry'); yield say('omar',"No.");
  cineSet(P.x+1.5,P.y+1.2,P.z+3.2,P.x+.4,P.y+1.3,P.z); yield say('shayan',"They're down! Ali, NOW!",'angry');
  // the charge: a low tracking shot behind Shayan, Ali blinking ahead in red afterimages
  P.cineFly=true; P.cineAnim='dash'; Sound.sfx('dash'); const p0={x:P.x,z:P.z}, tgt={x:C.x+.9,z:C.z+.9};
  for(let t=0;t<.75;t+=dt){ const u=twEIO(t/.75); P.x=lerp(p0.x,tgt.x,u); P.z=lerp(p0.z,tgt.z,u); P.y=groundY(P.x,P.z); cineSet(P.x-1.4,P.y+1,P.z+3.4,P.x+.6,P.y+1.2,P.z-3);
    if(A&&Math.floor(t/.22)!==Math.floor((t-dt)/.22)){ aliGhost(A.x,A.y,A.z); const u2=Math.min(1,(t+dt)/.66); A.x=lerp(c.x+3,O.x-.9,u2); A.z=lerp(c.z+5.2,O.z+.9,u2); Sound.sfx('dash'); FX.burst(A.x,A.y+1,A.z,12,0xb0182a,3,.3); }
    if(Math.random()<.8) FX.spawn(P.x,P.y+.2,P.z,rnd(-1,1),rnd(.5,1.5),2,.4,0xd8c0c8,.25,0,false); yield wait(dt*.5); }
  // blocked: Hikari-chan takes Shayan's sword, Omar's scythe takes Ali's
  C.down=O.down=0; const H=twHikari((P.x+C.x)/2,(P.z+C.z)/2+.1,1); P.cineAnim='charge'; O.scythe=1; O.swing=1; impactFrame([[1,2],[2,2],[3,1]]); Sound.sfx('block'); Sound.sfx('clash'); shake(.9); FX.flash=.5; grade.uniforms.flashCol.value.set(1,1,1);
  FX.burst(H.x,H.y,H.z,30,0xffffff,5,.35,false); if(A){ const mx=(A.x+O.x)/2, mz=(A.z+O.z)/2; for(let i=0;i<3;i++) FX.spark(mx,O.y+1.2,mz); }
  const m1=(P.x+C.x)/2; cineSet(m1+.3,gy+1.9,P.z+2.6,m1,gy+1.4,P.z-.3); yield say('caotan',"Hikari-chan, BLOCK!",'angry');
  yield say('shayan',"Did you just block my sword with a PILLOW?!",'surprised'); yield say('caotan',"She's memory foam, senpai. She REMEMBERS you.",'happy');
  if(A){ const mx=(A.x+O.x)/2, mz=(A.z+O.z)/2; cineSet(mx+.2,gy+1.9,mz+2.8,mx,gy+1.5,mz); for(let i=0;i<4;i++) FX.spark(mx,O.y+1.2,mz); Sound.sfx('clash'); yield say('omar',"Too slow, samurai."); yield say('ali',"Too edgy."); }
  // a double shockwave blows them back to where they started
  Sound.sfx('crossboom'); FX.flash=.7; grade.uniforms.flashCol.value.set(1,.7,.95); impactFrame([[3,2],[1,2]]); shake(1.2); for(let i=0;i<3;i++) FX.ring((C.x+O.x)/2,gy+.1,c.z-1.6,i%2?'#ff6ab0':'#8a3aff',5+i*3,.5);
  cineSet(c.x,gy+2.6,c.z+10,c.x,gy+1.3,c.z); P.cineAnim='hurt'; twAnim(P,{x:c.x-5,z:c.z+.4},.4,twEOut3); if(A) twAnim(A,{x:c.x-5.4,z:c.z-1.3},.4,twEOut3); H.kill(); yield wait(.55);
  P.cineFly=false; P.cineAnim=null; O.scythe=0; O.swing=0; C.lockF=O.lockF=0;
  yield* twGetsugaClash(F,C,O);
  // the sync (they finally high five)
  C.inv=O.inv=true; const mx=(C.x+O.x)/2, mz=(C.z+O.z)/2; cineSet(mx,gy+2.4,mz+8,mx,gy+1.4,mz);
  yield say('caotan',"Omar. It's TIME.",'angry'); yield say('omar',"...Fine.");
  twMoveTo(C,mx-1,mz,.4); C.x=mx-1; C.z=mz; O.x=mx+1; O.z=mz; yield wait(.4); Sound.sfx('whoosh'); yield wait(.3); Sound.sfx('block');
  yield say('',"They went for a high five. They missed. By a lot.");
  yield say('caotan',"...We don't high five. We're not that kind of found family."); yield say('omar',"We DON'T high five.");
  if(A) yield say('ali',"Are you done?"); yield say('shayan',"Let them have this, man.");
  Sound.sfx('slam'); FX.flash=1; grade.uniforms.flashCol.value.set(1,.8,1); impactFrame([[1,2],[3,2]]); shake(.8); yield say('',"The second high five connected. Somewhere, a thunderclap happened for no reason.");
  evaCard(['SYNC RATIO','400%'],1.8,1); yield wait(1.8); C.form=O.form=2; C.tint=0xffe8f4;
  // the clash scattered his scythes all over the field
  yield say('omar',"The clash scattered my scythes everywhere. I will be using them. All of them. Without a tetanus shot."); }
// II -> III: Caotan's domain (Hikari-chan's eyes glint, Ali takes the first one on his sword), then Omar's black hole eats the domain
function* twDuo3Trans2(F,C,O){ const P=Player, A=twAliAny(), c=F.center, gy=groundY(c.x,c.z), dt=1/60;
  C.down=O.down=0; C.inv=O.inv=true; C.mv=O.mv=null; Object.assign(C,{x:c.x,z:c.z-3,lockF:1,f:1}); Object.assign(O,{x:c.x+5,z:c.z-4.5});
  Object.assign(P,{x:c.x,z:c.z+3.6,vx:0,vz:0}); P.y=groundY(P.x,P.z); if(A){ A.hold=1; A.x=c.x-1.8; A.z=c.z+3.9; A.face=1; }
  cineSet(C.x,gy+1.9,C.z+4.2,C.x,gy+2,C.z); yield wait(.3);
  yield say('caotan',"Omar got a cool moment."); yield say('caotan',"Omar NEVER gets a cool moment. Do you know what that means?");
  yield say('omar',"Please don't."); yield say('caotan',"It means it's MY turn.",'angry');
  cineSet(C.x+.4,gy+2.3,C.z+2.2,C.x,gy+2.3,C.z); Sound.sfx('gong'); FX.flash=.5; grade.uniforms.flashCol.value.set(1,.6,.9); yield say('caotan',"Domain Expansion...");
  // the pink void, full of floating glasses, Hikari-chan towering behind him
  const g=new THREE.Group(); g.userData.tw=1; const dome=new THREE.Mesh(new THREE.SphereGeometry(30,32,16),new THREE.MeshBasicMaterial({color:0x2a0a24,side:THREE.BackSide,transparent:true,opacity:0,depthWrite:false})); g.add(dome);
  const lens=[]; for(let i=0;i<26;i++){ const r=new THREE.Mesh(new THREE.TorusGeometry(rnd(.6,1.6),.08,6,24),new THREE.MeshBasicMaterial({color:i%2?0xff9ad8:0xffffff,transparent:true,opacity:0})); const a=rnd(0,6.28), d=rnd(8,22); r.position.set(c.x+Math.cos(a)*d,gy+rnd(2,12),c.z+Math.sin(a)*d); r.userData.sp=rnd(.3,1.2); g.add(r); lens.push(r); }
  dome.position.set(c.x,gy,c.z); scene.add(g); const DM={t:0,k:0,out:0,eat:0};
  Game.fxUpd.push(d=>{ DM.t+=d; DM.k=DM.out?Math.max(0,DM.k-d*1.2):Math.min(1,DM.k+d*.8); dome.material.opacity=.85*DM.k; lens.forEach(r=>{ r.material.opacity=DM.k; r.rotation.y+=d*r.userData.sp; r.rotation.x+=d*r.userData.sp*.5; if(DM.eat){ r.position.x=lerp(r.position.x,c.x,d*2); r.position.y=lerp(r.position.y,gy+9,d*2); r.position.z=lerp(r.position.z,c.z-2,d*2); r.scale.multiplyScalar(1-d); } });
    if(Math.random()<.4*DM.k) FX.spawn(c.x+rnd(-12,12),gy+rnd(0,8),c.z+rnd(-10,10),0,rnd(.2,1),0,1.2,Math.random()<.5?0xff9ad8:0xffffff,.2,0,true); if(DM.out&&DM.k<=0){ scene.remove(g); return false; } return true; });
  const H=twGiantHikari(C.x,C.z-1.6); H.k=3; H.y=gy+4.4; H.put(); twCutin('caotan','INFINITE MEGANE VOID','Domain Expansion  ·  Hikari-chan is watching','#ff6ab0',2.4); Sound.sfx('skyopen'); grade.uniforms.tint.value.set(1.2,.85,1.1);
  yield say('caotan',"...INFINITE. MEGANE. VOID.",'angry');
  cineSet(H.x,gy+3,H.z+7,H.x,gy+4.2,H.z); yield say('caotan',"Inside my domain, every glint is GUARANTEED to hit. And Hikari-chan does the glinting now. She has CONSENTED.");
  yield say('shayan',"She's a PILLOW! She can't CONSENT, she's POLYESTER!",'angry');
  // Ali steps in front and takes the first glint on his blade
  const ex=H.x, ey=H.y+2.3, ez=H.z+.3;
  if(A){ cineSet(P.x+2.4,P.y+1.4,P.z+3.6,P.x,P.y+1.5,P.z-1); aliGhost(A.x,A.y,A.z); A.x=P.x+.2; A.z=P.z-1; A.face=-1; Sound.sfx('dash'); yield say('ali',"Stay behind me.");
    Sound.sfx('ting'); FX.flash=.4; const bm=[beamMesh(0xff9ad8,.45),beamMesh(0xffffff,.18)]; bm.forEach(m=>{ m.userData.tw=1; scene.add(m); twBeamTo(m,ex,ey,ez,A.x,A.y+1.2,A.z,1); }); Sound.sfx('beam'); Sound.sfx('parry'); shake(.6);
    const sp=[]; for(const k of [-.5,.5]){ const a=Math.atan2(A.z-ez,A.x-ex)+k, m=beamMesh(0xffb0e0,.25); m.userData.tw=1; scene.add(m); twBeamTo(m,A.x,A.y+1.2,A.z,A.x+Math.cos(a)*14,A.y+1.2,A.z+Math.sin(a)*14,1); sp.push(m); }
    for(let i=0;i<5;i++) FX.spark(A.x,A.y+1.2,A.z); yield wait(.6); bm.concat(sp).forEach(m=>scene.remove(m));
    yield say('ali',"Hm. Bright."); yield say('ali',"Your turn, blacksmith. Dash the moment her eyes flash."); aliGhost(A.x,A.y,A.z); A.x=P.x-1.8; A.z=P.z+.3; A.face=1; }
  // QTE: dash on each glint
  cineSet(P.x,gy+4.2,P.z+7.5,(P.x+C.x)/2,gy+1.8,(P.z+C.z)/2); twBig('DASH ON THE GLINT',{size:50,col:'#ffd0ec',y:UH*.28,dur:1.8,sub:IS_TOUCH()?'Tap the dash button the instant her eyes flash':K('dash')+' the instant her eyes flash'}); yield wait(1.6);
  let dodged=0; const N=5;
  for(let i=0;i<N;i++){ yield wait(rnd(.7,1.6)); const Q=TW.qte={g:0,ok:false,spam:-9,press(t){ if(!this.g){ this.spam=t; return; } if(!this.ok&&t-this.g<.42&&this.spam<this.g-.25) this.ok=true; }};
    const t0=performance.now()/1000; Q.g=t0; C.push=.4; C.glintT=.5; Sound.sfx('ting'); FX.flash=.35; grade.uniforms.flashCol.value.set(1,1,1); FX.burst(ex,ey,ez,16,0xffffff,4,.25); twHikariBurst(ex,ey,ez);
    while(performance.now()/1000-t0<.42&&!Q.ok) yield wait(1/120);
    const lz=P.z, lx=P.x, bm=[beamMesh(0xff9ad8,.5),beamMesh(0xffffff,.2)]; bm.forEach(m=>{ m.userData.tw=1; scene.add(m); twBeamTo(m,ex,ey,ez,lx,gy+1.1,lz,1); });
    const fb={t:0}; Game.fxUpd.push(d=>{ fb.t+=d; const kk=Math.max(.01,1-fb.t/.25); bm.forEach(m=>{ m.scale.x=m.scale.y=kk; }); if(fb.t>.25){ bm.forEach(m=>scene.remove(m)); return false; } return true; }); Sound.sfx('beam');
    if(Q.ok){ dodged++; const s=i%2?1:-1; FX.burst(P.x,P.y+1,P.z,14,0x8fd3ff,4,.25); P.x+=s*1.4; Sound.sfx('dash'); Game.dmgNums.push({x:P.x,y:P.y+2.6,z:P.z,n:'DODGED '+dodged+'/'+N,t:0,big:true,col:'#bfe8ff'}); }
    else { P.hp=Math.max(1,P.hp-2); FX.flash=.4; grade.uniforms.flashCol.value.set(.9,.1,.15); shake(.4); Sound.sfx('hurt'); Game.dmgNums.push({x:P.x,y:P.y+2.6,z:P.z,n:'GUARANTEED',t:0,big:true,col:'#ff8ab0'}); }
    TW.qte=null; }
  yield wait(.5);
  if(dodged>=N){ Sound.sfx('glass'); Sound.sfx('shatter'); FX.flash=1; impactFrame([[2,2],[1,2]]); shake(1); F.bonusStun={who:[C],t:3.5}; cineSet(C.x,gy+1.9,C.z+3.6,C.x,gy+2,C.z); yield say('caotan',"Five for five?! My domain... has a refund policy... I'm invoking it...",'surprised'); }
  else if(dodged>=3) yield say('caotan',"Not bad, senpai. Not GOOD. But not bad."); else yield say('caotan',"Guaranteed. Told you. It's in the name. The name is guaranteed.");
  // Omar: "My turn." A black hole opens above and swallows the domain, glasses, pillow and all
  cineSet(O.x-1,gy+1.4,O.z+4,O.x,O.y+1.8,O.z); yield say('omar',"Brother. You had your moment. Now... MY turn.");
  const V=twHoleVis(c.x,gy+9,c.z-2,.1,true), hv={k:0,t:0,r:.1,live:1}; Game.fxUpd.push(d=>{ hv.t+=d; hv.r=hv.live?Math.min(2.6,hv.r+d*2.4):Math.max(0,hv.r-d*3); V.r=hv.r; V.t=hv.t; V.set(hv.r>0?1:0); if(!hv.live&&hv.r<=0){ V.kill(); return false; } return true; });
  Sound.sfx('void'); Sound.sfx('suck'); shake(.8); DM.eat=1; twAnim(H,{x:c.x,z:c.z-2,y:gy+9,k:.05},1.6,twEIn2);
  yield cineTo([c.x,gy+1.5,c.z+12],[c.x,gy+7.5,c.z-2],1.6,twEIO); H.kill(); DM.out=1; Sound.sfx('chomp'); impactFrame([[3,2],[1,2]]); shake(1); C.noGlasses=0; applyLook(L.look);
  yield say('caotan',"MY DOMAIN! MY WAIFU! I had a YEARLY SUBSCRIPTION! NON-REFUNDABLE!",'angry');
  if(A) yield say('ali',"He ate her. Hm. Respect.");
  hv.live=0; C.lockF=0; C.down=O.down=1;
  yield say('caotan',"You wanna know why we look nothing alike?"); yield say('shayan',"Honestly? Yes. It's been bugging me all night.");
  yield say('omar',"We are not twins."); yield say('shayan',"...What?");
  yield say('caotan',"He was born on a Tuesday. I was born on a Tuesday.");
  if(A) yield say('ali',"That's just two people born on Tuesdays.");
  yield say('omar',"EXACTLY. Bound by fate."); yield say('caotan',"Different Tuesdays. Different years. Different hospitals. Different moms.");
  yield say('shayan',"That's not— that's literally just strangers!");
  yield say('omar',"Strangers... bound by FATE.",'angry'); C.down=O.down=0; Sound.sfx('void'); Sound.sfx('sparkle');
  const orb=twOrbit({x:(C.x+O.x)/2,y:gy,z:(C.z+O.z)/2},9,1.4,.9,-.9,2,2.2); yield tween(C,{hy:2.6},.8); orb.dead=1;
  evaCard(["PHASE III","TUESDAY'S CHILDREN"],1.8,1); impactFrame([[3,2],[1,2],[2,2]]); shake(1); yield wait(1.8); C.form=O.form=3; C.tint=0xffd8f0; C.hy=1.3; }

// =====================================================================
// BURNOUT: 0% at the end of phase III. Twenty seconds of spite, then they burn out.
// =====================================================================
function* twBurnoutIntro(F,C,O){ const P=Player, A=twAliAny(), c=F.center, gy=groundY(c.x,c.z); C.down=O.down=1; C.inv=O.inv=true; C.gen=O.gen=null; C.mv=O.mv=null;
  const mx=(C.x+O.x)/2, mz=(C.z+O.z)/2; yield cineTo([mx,gy+3.4,mz+10],[mx,gy+1.3,mz],.9,t=>t*(2-t)); yield wait(.3);
  yield say('caotan',"We're at zero percent... but we still have the power of SPITE! And an energy drink!",'angry'); C.down=O.down=0;
  yield say('omar',"Spite. My oldest friend. My only friend.",'angry');
  const aura={on:1}; Game.fxUpd.push(()=>{ if(!aura.on) return false; for(const T of [C,O]){ for(let i=0;i<3;i++){ const a=rnd(0,6.28), r=rnd(.6,1.4); FX.spawn(T.x+Math.cos(a)*r,T.y+rnd(0,3),T.z+Math.sin(a)*r,0,rnd(2,4),0,.6,T===C?(i%2?0xff3a8a:0xffffff):(i%2?0x8a3aff:0x050208),.35,0,T===C); } } return true; });
  Sound.sfx('fuse'); Sound.sfx('howl'); twAnim(C,{hy:2.8},1.2); twAnim(O,{hy:2.8},1.2); const orb=twOrbit({x:mx,y:gy,z:mz},9,1.6,-1,1,2.6,2.6); yield wait(1.4);
  evaCard(['BURNOUT','20 SECONDS OF PURE SPITE'],1.8,1); impactFrame([[3,2],[1,2],[2,2]]); shake(1.2); Sound.sfx('slam'); yield wait(1.8); orb.dead=1;
  twCamP(6.2,1.2); yield say('shayan',"They're out of HP! How are they STILL going?!",'surprised');
  if(A) yield say('ali',"Spite. Survive twenty seconds. They'll burn out.");
  aura.on=0; twAnim(C,{hy:1.3},.4); twAnim(O,{hy:1.3},.4); twCutin('caotan','BURNOUT','Survive 20 seconds  ·  they cannot be hurt','#ff3a6a',1.6);
  yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.6); Cam.cine=null; Game.letterTo=0; P.inv=1; if(A){ A.hold=0; A.face=null; }
  twBurnoutGo(F,C,O); }
function twBurnoutGo(F,C,O){ F.lc=1; F.director=0; F.burnCk=1; F.pend=null; C.down=O.down=0; C.inv=O.inv=true; C.stun=O.stun=0; C.gen=DUO.burnout(C,O); C.wait=0; C.state='lc'; O.gen=twWaitFor(C)(); O.wait=0; O.state='lc'; Sound.play('seraph'); }
const TW_BURN_BARKS=[[0,['caotan',"MAXIMUM OVERDRIVE! I CAN'T FEEL MY GLASSES!"]],[5,['omar',"BLACK HOLES. EVERYWHERE. I HAVE NO IMPULSE CONTROL."]],[10,['caotan',"HIKARI-CHAN! SAKURA-CHAN! ALL THE CHANS!"]],[13,['omar',"RAIN, MY CHILDREN! RAIN!"]],[15,['caotan',"FINAL SPITE!"]],[18.4,['caotan',"pew... pew... I'm out of pew..."]],[19.3,['omar',"My darkness... has run out of battery."]]];
DUO.burnout=function*(C,O){ const F=TW.fight, sp=1.15, H=TW.hg={left:20,total:20,label:'BURNOUT · SURVIVE'}, c=twCenter();
  twHz({upd(dt,play){ if(!TW.hg) return false; if(play) TW.hg.left=Math.max(0,TW.hg.left-dt); return true; }});
  const ev={orb:0,g:0,c:0,goo:0,pink:0,rain:0,holes:0,fin:0,nose:0,bark:0}; const edge=()=>{ const A=twBounds(), P=Player, a=rnd(0,6.28); return twClampXZ(P.x+Math.cos(a)*9,P.z+Math.sin(a)*7,1.5); };
  try{
    while(H.left>0){ const el=20-H.left, P=Player;
      // barks
      while(ev.bark<TW_BURN_BARKS.length&&el>=TW_BURN_BARKS[ev.bark][0]){ const b=TW_BURN_BARKS[ev.bark++][1]; twBark(b[0],b[1],true); }
      if(el<18.3){
        // Omar's sky orbs (one more every five seconds)
        while(ev.orb<3&&el>=ev.orb*5){ const p=twRandIn(3); twSkyOrb(p.x,p.z,{dur:20-el,every:2.6,delay:ev.orb*.8}); ev.orb++; }
        // Omar: Getsugas from the edges
        if(el<15&&el>=ev.g){ ev.g=el+(el<5?1.55:el<10?1.35:1.7); const e=edge(); twBlink(O,e.x,e.z); O.scythe=1; const a=Math.atan2(P.z-O.z,P.x-O.x); twGetsuga(O,a,{warn:.55,sp:14}); if(el>=10){ twGetsuga(O,a+.5,{warn:.6,sp:14}); twGetsuga(O,a-.5,{warn:.6,sp:14}); } }
        // Caotan, 0-5: two spinning blue beams and pillow fans
        if(el<5&&!ev.spin){ ev.spin=1; const dir=Math.random()<.5?1:-1, b0=rnd(0,6.28); for(let k=0;k<2;k++) twBeam({x:C.x,z:C.z,ang:t=>b0+k*Math.PI+Math.max(0,t-.8)*.95*dir,len:18,w:1,warn:.8,dur:4.4,dmg:3,col:0xbfe4ff}); }
        if((el<5||el>=10&&el<15)&&el>=ev.c){ ev.c=el+(el<5?1.7:1.45); const a=Math.atan2(P.z-C.z,P.x-C.x); for(const k of [-.38,0,.38]) twCaoPillowShot(C,a+k,10); C.cast=.4; }
        // 5-10: goo puddles and pink walls; black holes; a light rain
        if(el>=5&&el<10){ if(el>=ev.goo){ ev.goo=el+2; for(let i=0;i<3;i++){ const a=rnd(0,6.28), r=i?rnd(1.5,3.5):0, p=twClampXZ(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,.6), m=new THREE.Group(); m.userData.tw=1; scene.add(m); twSperm(m,1.5);
              twThrow({x:C.x,y:C.y+1,z:C.z,tx:p.x,tz:p.z,dur:.8,h:3.5,mesh:m,r:1.1,col:0xffffff,trail:0xffffff,onLand(x,z,play){ Sound.sfx('squelch'); twZone(x,z,1.15,4,{slow:.55,col:0xfaf6ff,op:.85,fx:.05,splat:1}); if(play&&twInR(x,z,.95,1.2)) twHitP(1,x,z,{ub:true}); }}); } C.fire=.3; }
          if(el>=ev.pink){ ev.pink=el+1.3; C.push=.3; C.glintT=.3; Sound.sfx('ting'); twPink(C.x,C.z,Math.atan2(P.z-C.z,P.x-C.x),{warn:.55}); }
          if(!ev.holes){ ev.holes=1; for(let k=0;k<3;k++){ const p=twRandIn(3), a=rnd(0,6.28); twMiniHole(p.x,p.z,{r:.7,pull:3.4,range:5,dur:10,eat:.95,dmg:4,vx:Math.cos(a)*1.1,vz:Math.sin(a)*1.1}); } }
          if(el>=ev.rain){ ev.rain=el+.5; const a=rnd(0,6.28), r=rnd(0,2.5); twSkyScythe(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,.8,{quiet:1}); } }
        // 10-15: heavy rain (the planted ones first) and nosebleed geysers
        if(el>=10&&el<15){ if(el>=ev.rain){ ev.rain=el+.3; const a=rnd(0,6.28), r=rnd(0,3), o=TW.planted.pop(); if(o){ o.m.userData.tw=1; twSkyScythe(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,.8,{mesh:o.m,fx:o.x,fy:o.y,fz:o.z,arc:6,quiet:1}); } else twSkyScythe(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,.8,{quiet:1}); }
          if(el>=ev.nose){ ev.nose=el+.85; twCaoNose(P.x+P.vx*.35,P.z+P.vz*.35,.65); } }
        // 15-18: FINAL SPITE: a huge blue sweep from Caotan, a giant Getsuga lane from Omar, in turn
        if(el>=15&&el>=ev.fin){ const k=Math.round((el-15)/1.6); ev.fin=el+1.6; if(k%2===0){ C.push=.5; C.glintT=.6; Sound.sfx('ting'); const dir=Math.random()<.5?1:-1, b0=Math.atan2(P.z-C.z,P.x-C.x)-dir*1.2; twBeam({x:C.x,z:C.z,ang:t=>b0+Math.max(0,t-.75)*1.6*dir,len:30,w:1.2,warn:.75,dur:1.5,dmg:3,col:0xbfe4ff}); }
          else { const e=edge(), a=Math.atan2(P.z-e.z,P.x-e.x); twBlink(O,e.x,e.z); O.scythe=1; twGetsuga(O,a,{warn:.8,sp:18,s:5,w:2.1,dmg:3,len:26}); } }
      }
      yield .05; }
  } finally { TW.hg=null; }
  // they burn out
  F.burned=1; F.burnCk=0; twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); for(const T of [C,O]){ T.down=1; T.scythe=0; T.inv=true; FX.burst(T.x,T.y+2,T.z,40,0x2a2a30,4,.6,false); } Sound.sfx('shatter'); C.cracked=1;
  twBig('BURNED OUT',{size:70,col:'#ffd45a',y:UH*.3,dur:1.6}); twHz({upd(dt,play){ if(play) this.t+=dt; if(this.t>1.2){ F.pend=()=>twDuoPhaseCine(F,C,O); return false; } return true; }}); };

// ---------- the ending: Ali stops time and kicks them into the sky, Shayan's Getsuga and Ali's Judgement Cut together ----------
twDuoEnding=function*(F,C,O){ const P=Player, A=twAliAny(), mi=Game.mira, gy=groundY(P.x,P.z); C.down=O.down=1; if(A){ A.hold=1; }
  const mx0=(C.x+O.x)/2, mz0=(C.z+O.z)/2; yield cineTo([mx0,gy+2.6,mz0+8],[mx0,gy+1.2,mz0],.8,t=>t*(2-t));
  yield say('caotan',"We... lost?"); yield say('omar',"Together. For once. We did something... together.");
  yield say('caotan',"...That's kind of nice, actually.",'happy'); yield say('omar',"Do not ruin it.");
  if(A){ A.x=P.x+1.5; A.z=P.z+.4; A.face=-1; twCamP(6.5,.4); yield say('ali',"Blacksmith. Together. On three."); yield say('shayan',"On three? Okay. One, tw—"); yield say('ali',"Three.");
    // time stops; Ali kicks both twins into the sky
    zwStart(); Sound.sfx('secret'); for(const T of [C,O]){ aliGhost(A.x,A.y,A.z); A.x=T.x+(T===C?-.8:.8); A.z=T.z+.3; FX.burst(A.x,A.y+1,A.z,20,0xb0182a,4,.3); Sound.sfx('dash'); Sound.sfx('punch'); FX.ring(T.x,groundY(T.x,T.z)+.1,T.z,'#ff3a4a',2.4,.4); T.down=0; twAnim(T,{hy:6},.5,twEOut3); yield wait(.22); }
    cineSet(mx0,gy+1,mz0+9,mx0,gy+5.5,mz0); yield wait(.6); aliGhost(A.x,A.y,A.z); A.x=P.x+1.2; A.z=P.z-.3; }
  P.ang=Math.atan2(((C.z+O.z)/2)-P.z,((C.x+O.x)/2)-P.x); P.f=Math.cos(P.ang)>0?1:-1; P.charge=2; cineSet(P.x-P.f*2.4,gy+1.3,P.z+3.4,P.x+P.f*1.2,gy+2.2,P.z); yield wait(.3);
  yield say('shayan',"GETSUGA...",'angry'); if(A) yield say('ali',"...TENSHOU.");
  if(A) zwEnd(); const mx=(C.x+O.x)/2, mz=(C.z+O.z)/2; cineSet(mx,gy+3,mz+11,mx,(C.y+O.y)/2+1,mz); Game.timeScale=.3; fireBeam(true,true); if(A) fireBeam(true,true,{ali:true}); P.charge=0; yield wait(.4); Game.timeScale=1;
  if(A){ JC.lines=[]; for(let i=0;i<14;i++){ const a=rnd(0,Math.PI), sx=UW/2+rnd(-220,220), sy=UH*.35+rnd(-120,120); JC.lines.push({x0:sx-Math.cos(a)*420,y0:sy-Math.sin(a)*420,x1:sx+Math.cos(a)*420,y1:sy+Math.sin(a)*420,t:0,ttl:.55}); } JC.flash=.6; Sound.sfx('swing'); }
  FX.flash=1; impactFrame([[1,3],[2,2],[3,3]]); Sound.sfx('crossboom'); Sound.sfx('gore'); shake(1.6);
  for(const T of [C,O]){ const w=T.who==='caotan'; for(let i=0;i<3;i++) FX.burst(T.x,T.y+1.4,T.z,60,w?0xffffff:0x1a0820,7+i*2,.5,w); if(w) twHeartBurst(T.x,T.z,40); } twRemoveFoe(C); twRemoveFoe(O); yield wait(1.6);
  yield say('',"The Gatekeeper Twins went out the way they came in: loudly, together, and arguing about whose fault it was.");
  TW._wipe=1; try{ twEndFight(); } finally{ TW._wipe=0; } Game.arena=null; if(A){ A.hold=0; A.face=null; }
  if(A){ cineSet(A.x+.6,A.y+1.7,A.z+5.6,A.x,A.y+1.1,A.z); yield say('ali',"Not bad, blacksmith. Next time, it's you and me."); yield say('shayan',"Who ARE you?!"); yield say('ali',"Ali."); Sound.sfx('dash'); aliGhost(A.x,A.y,A.z); twClearAllies(); yield wait(.6); yield say('shayan',"...That's it? Just 'Ali'?"); }
  if(mi){ mi.vis=true; mi.x=P.x+1.2; mi.z=P.z+.3; mi.y=P.y; mi.f=-1; mi.anim='idle'; twCamP(6,.6); Sound.play('ending');
    yield say('mira',"Shayan. Your pig is gone, your ex-enemies are gone, a mysterious rival just vanished, and I've been in a cage for most of the night.",'happy');
    yield say('mira',"...Best date ever?",'blush'); const ch=yield choose([{t:"Best date ever.",aff:2},{t:"Can the next one have fewer twins?",aff:1}]);
    yield say('mira',ch===0?"Then it's settled. Same time next eclipse.":"Fewer twins. More honey buns. Deal.",'happy'); }
  Game.ending=5; yield cineTo([P.x,6,P.z+16],[P.x,6,P.z-20],3); yield wait(.4);
  evaCard(['THE GATEKEEPER TWINS ROUTE','THE OTHER WAY'],3.2,1); yield wait(3.4); evaCard(['GG.'],2,3); yield wait(2.2); yield fadeOut(); Game.state='end'; Game.endT=0; Game.script=null; };

// ---------- retries: wipe the graveyard, re-seed it for the phase, and retry the Burnout straight into it ----------
(function(){ const dr=twDuoRestart; twDuoRestart=function(F,C,O){ TW._wipe=1; try{ dr.apply(this,arguments); } finally{ TW._wipe=0; }
    Object.assign(F,{heals:0,mid:null,guard:null,kick:null,grabbed:0,revQ:0}); TW.storming=0; TW.duoHole=null; TW.hg=null; TW.caoSafe=null; for(const T of [C,O]) T.showN=0;
    twDuoSeed(F.phase===3&&!F.rains?DUO3.rain:(DUO3.seed[F.phase]||0)); if(F.phase===3&&F.burnCk){ C.hp=O.hp=0; twBurnoutGo(F,C,O); Game.banner={name:'Burnout',sub:'Survive 20 seconds',t:0,small:1}; } }; })();

// ---------- the tear trap in the duo: Caotan gets a cameo (he fires into the hole) ----------
(function(){ const tt=twTearTrap; twTearTrap=function*(R){ const F=TW.fight; if(F&&F.kind==='duo'&&F.C) twBark('caotan',"Ooh! A trap! Can I shoot the hole? I'm shooting the hole.",true);
    yield* tt.apply(this,arguments); }; })();
