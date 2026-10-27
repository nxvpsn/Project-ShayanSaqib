// =====================================================================
// THE DUO GRABS (the double fight), wide and tracked by the camera (`dgCam`: it eases from wherever the camera was,
// keeps the whole action in frame, and lets go cleanly). Both end the same way: a black hole blows and launches you
// high into the air (6 damage, if that doesn't kill you).
// - TWIN EXECUTION (Caotan grabs: her glomp lands): she hugs you, throws you up to Omar, Omar opens a black hole below
//   and spikes you into it, Caotan lasers the hole, it explodes.
// - EDGE LORD'S EMBRACE (Omar grabs: a parry pressed too early against his rush): he holds you up, Caotan teleports
//   in and lasers you while you burn (your body chars), Omar throws you into a black hole that spits you out (uncharred).
// - Ali (the AI ally) cuts 25% of grabs short: Judgement Cuts through the grab and kicks the grabber down.
// =====================================================================
// the camera: s.want() -> [px,py,pz,lx,ly,lz]; it eases toward that every frame
function dgCam(want,k){ if(typeof twClearCutFX==='function') twClearCutFX(); /* a slash tear left on screen would stretch across the cut */ const L0=Cam.look||{x:Player.x,y:Player.y,z:Player.z}, cp=camera.position;
  const s={want,k:k||4,p:[cp.x,cp.y,cp.z],l:[L0.x,L0.y+.8,L0.z],dead:0};
  Game.fxUpd.push(dt=>{ try{ if(s.dead) return false; const w=s.want&&s.want(); if(w){ const e=1-Math.exp(-dt*s.k); for(let i=0;i<3;i++){ s.p[i]=lerp(s.p[i],w[i],e); s.l[i]=lerp(s.l[i],w[i+3],e); } }
      cineSet(s.p[0],s.p[1],s.p[2],s.l[0],s.l[1],s.l[2]); return true; }catch(e){ console.error('grab cam',e); return false; } });
  return s; }
// a wide shot that keeps every point in frame (pts: [[x,y,z],...]): look at their middle, back off with their spread
function dgFrame(pts,o){ o=o||{}; let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,zz=0; for(const p of pts){ x0=Math.min(x0,p[0]); x1=Math.max(x1,p[0]); y0=Math.min(y0,p[1]); y1=Math.max(y1,p[1]); zz+=p[2]; }
  const cx=(x0+x1)/2, cy=(y0+y1)/2, cz=zz/pts.length, spread=Math.max(x1-x0,(y1-y0)*1.6), d=Math.max(o.min||20,spread*2.6+8);
  return [cx+(o.side||0)*d*.3,cy+d*.45,cz+d,cx,cy,cz]; } // the fight camera sits ~30 back with a narrow lens: grabs stay in that range
function dgHeroAnim(){ return ALI()?'fall':'hurt'; }
// the player's body: charred (k 0..1) or back to normal
function dgChar(k){ try{ if(pSprite&&pSprite.mesh) pSprite.mesh.material.color.setRGB(1-.82*k,1-.85*k,1-.86*k); }catch(e){} }
// everything a grab holds, let go (also used when it is cut short)
function dgRelease(F,cam,o){ const P=Player, A=twAliAny(); if(cam) cam.dead=1; Cam.cine=null; Game.letterTo=0; dgChar(0);
  P.hidden=false; P.cineFly=false; P.cineAnim=null; P.dash=0; if(!o||!o.keepInv) P.inv=Math.max(0,Math.min(P.inv,1));
  for(const T of [F.C,F.O]){ if(!T) continue; T.lockF=0; T.heartEyes=0; T.scythe=0; T.swing=0; T.cast=0; if(T.hy!=null&&T.who==='omar') T.hy=1.3; }
  if(A){ A.hold=0; A.face=null; } F.grabbed=0; }
// the end of both grabs: the hole explodes, you fly high (the camera rides up with you, then lets go)
function* dgLaunch(F,cam,gx,gy,gz,hk,dmg){ const P=Player;
  hk.live=0; FX.flash=1; grade.uniforms.flashCol.value.set(1,.7,.9); impactFrame([[1,3],[2,2],[3,2]]); Sound.sfx('crossboom'); Sound.sfx('shatter'); shake(1.3);
  for(let i=0;i<3;i++) FX.ring(gx,gy+.1,gz,i%2?'#ff6ab0':'#8a3aff',4+i*2.5,.5); FX.burst(gx,gy+1.3,gz,80,0x8a2aff,9,.5); twHeartBurst(gx,gz,30);
  P.hidden=false; P.cineFly=false; P.cineAnim=null; P.x=gx; P.z=gz; P.y=gy+.6; dgChar(0);
  Game.dmgNums.push({x:P.x,y:P.y+2.6,z:P.z,n:F._grabName||'TWIN EXECUTION',t:0,big:true,col:'#ff8ac8'});
  twHoleEat(gx,gz,dmg); P.vy=Math.max(P.vy||0,27); P.vx*=.55; P.vz*=.55; // high up, a little sideways
  cam.k=3.2; cam.want=()=>[P.x,P.y+10,P.z+22,P.x,P.y+.6,P.z];
  for(let t=0;t<1.25&&P.hp>0;t+=1/60) yield wait(1/60);
  dgRelease(F,cam,{keepInv:1}); }
// Ali cuts the grab short (25%): Judgement Cuts through the grabber, then the kick (twAliKick knocks him down)
function dgAliRoll(F){ const A=twAliAI(); return !!A&&twAliReady(A)&&(A.down||0)<=0&&!ALI()&&!F.lc&&Math.random()<.25; }
function* dgAliSave(F,T,cam){ const P=Player, A=twAliAI(); if(!A) return;
  cam.want=()=>dgFrame([[P.x,P.y+1,P.z],[T.x,T.y+1,T.z],[A.x,A.y+1,A.z]],{min:20});
  for(let i=0;i<3;i++){ twTinyJC(T.x+rnd(-.6,.6),T.y+1.2+rnd(-.5,.5),T.z,220); FX.cut(T.x,T.y+1.2,T.z); Sound.sfx('swing'); yield wait(.07); }
  JC.flash=Math.max(JC.flash||0,.5); Sound.sfx('secret');
  twAliKick(F,A,{who:T.who,mid:F.mid}); twBark('ali',T.who==='caotan'?"Hands off.":"Put him down.",true);
  const gy=groundY(P.x,P.z); twAnim(P,{y:gy},.25,twEIn2); yield wait(.3); P.y=gy; P.inv=1.2; dgRelease(F,cam,{keepInv:1}); }

// ---------- TWIN EXECUTION: Caotan grabs ----------
twTwinExecution=function*(F){ const P=Player, C=F.C, O=F.O, A=twAliAny(), gx0=P.x, gz0=P.z, f=C.x<P.x?1:-1, dt=1/60, HA=dgHeroAnim();
  F.grabbed=1; F._grabName='TWIN EXECUTION'; P.inv=99; P.cineFly=true; P.cineAnim=HA; P.atk=null; P.charge=0; P.dash=0; P.vx=P.vz=P.vy=0; Game.letterTo=.4; if(A){ A.hold=1; A.face=gx0>A.x?1:-1; }
  const c0=twClampXZ(gx0,gz0,2.5), gx=c0.x, gz=c0.z, gy=groundY(gx,gz); P.x=gx; P.z=gz;
  C.mv=null; C.x=gx-f*.6; C.z=gz+.15; C.lockF=1; C.f=f; C.heartEyes=1; P.y=gy+.4;
  const cam=dgCam(()=>dgFrame([[P.x,P.y+1,P.z],[C.x,C.y+1,C.z]],{min:20}));
  // 1. the hug
  impactFrame([[1,2],[2,2]]); Sound.sfx('doki'); Sound.sfx('kyun'); twHeartBurst(gx,gz,30); FX.flash=.35; grade.uniforms.flashCol.value.set(1,.6,.85);
  twBark('caotan',"GOTCHA, SENPAI! Hug level: MAXIMUM! Your ribs: MINIMUM! ♡",true);
  for(let t=0;t<.7;t+=dt){ const a=t*9; P.x=gx+Math.cos(a)*.35; P.z=gz+Math.sin(a)*.2; if(Math.random()<.4) twHeartBurst(gx,gz,1); yield wait(dt); }
  if(dgAliRoll(F)){ yield* dgAliSave(F,C,cam); return; }
  if(!ALI()) twBark('shayan',"LET GO OF ME! WHY ARE YOU SO MOIST?!",true);
  // 2. Omar appears high above; she throws you up to him
  const y1=gy+8; FX.burst(O.x,O.y+1.4,O.z,22,0x140a1a,4,.45,false); O.mv=null; O.hide=0; O.x=gx+.6; O.z=gz-.2; O.hy=y1+1.6-groundY(O.x,O.z); O.y=y1+1.6; O.lockF=1; O.f=-1; O.scythe=1; O.swing=0;
  Sound.sfx('dash'); FX.burst(O.x,O.y+1.4,O.z,30,0x140a1a,5,.45,false); twBark('caotan',"OMAR! SPIKE HIM!",true);
  cam.want=()=>dgFrame([[gx,gy,gz],[P.x,P.y+1,P.z],[O.x,O.y+1,O.z]],{min:24}); Sound.sfx('whoosh');
  const y0=P.y; for(let t=0;t<.75;t+=dt){ const u=twEOut3(t/.75); P.x=lerp(P.x,gx,.15); P.z=lerp(P.z,gz,.15); P.y=lerp(y0,y1,u); P.cineAnim='fall'; FX.spawn(P.x,P.y+.5,P.z,0,-2,0,.3,0xffb0e0,.3,0,true); yield wait(dt); }
  C.heartEyes=0;
  // 3. Omar opens a black hole on the ground below
  const V=twHoleVis(gx,gy+1.3,gz,1.5,true), hk={k:0,t:0,live:1}; Game.fxUpd.push(d=>{ hk.t+=d; hk.k=hk.live?Math.min(1,hk.k+d*1.6):Math.max(0,hk.k-d*3); V.t=hk.t; V.set(hk.k); if(!hk.live&&hk.k<=0){ V.kill(); return false; } return true; });
  O.cast=1; Sound.sfx('void'); Sound.sfx('drone'); twBark('omar',"Volleyball. I despise volleyball. Too much teamwork. Too much sunlight.",true);
  for(let t=0;t<.9;t+=dt){ P.y=y1+Math.sin(t*6)*.08; yield wait(dt); } O.cast=0;
  // 4. the spike: a Getsuga point blank, straight down into the hole
  O.swing=1; Sound.sfx('swing'); Sound.sfx('beam'); FX.flash=.7; grade.uniforms.flashCol.value.set(.6,.3,1); impactFrame([[3,2],[1,1]]); shake(.8);
  { const g=twGetsugaMesh(4,0x9a4aff); g.position.set(gx,P.y+1,gz); g.rotation.set(0,0,Math.PI/2); const k={t:0}; Game.fxUpd.push(d=>{ k.t+=d; g.userData.mats&&g.userData.mats.forEach(m=>m.opacity=Math.max(0,1-k.t/.4)); g.scale.setScalar(1+k.t*2); if(k.t>.4){ scene.remove(g); return false; } return true; }); }
  P.cineAnim=HA; const sy=P.y; for(let t=0;t<.42;t+=dt){ const u=twEIn2(t/.42); P.y=lerp(sy,gy+1.1,u); FX.spawn(P.x,P.y+1,P.z,0,6,0,.3,0x8a3aff,.4,0,true); yield wait(dt); }
  P.hidden=true; Sound.sfx('chomp'); shake(.6); O.swing=0;
  // 5. Omar drops down beside it; Caotan glints and lasers the hole
  { const op=twClampXZ(gx+3,gz-1.5,1); O.x=op.x; O.z=op.z; O.hy=1.3; O.y=groundY(op.x,op.z)+1.3; const cp=twClampXZ(gx-5,gz+1.5,1); twBlink(C,cp.x,cp.z); C.f=1; }
  cam.want=()=>dgFrame([[gx,gy+1.3,gz],[C.x,C.y+1,C.z],[O.x,O.y+1,O.z]],{min:22}); yield wait(.35);
  yield* twGlint(C,1,.25,1); twBark('caotan',"MEGANE... FINISH!",true);
  const bm=[beamMesh(0xff9ad8,.45),beamMesh(0xffffff,.18)]; bm.forEach(m=>{ m.userData.tw=1; scene.add(m); twBeamTo(m,C.x,C.y+1.9,C.z,gx,gy+1.3,gz,1); }); Sound.sfx('beam'); hk.k=1.3;
  for(let t=0;t<.5;t+=dt){ bm.forEach(m=>{ const s=1+Math.sin(t*60)*.15; m.scale.x=m.scale.y=s; }); yield wait(dt); } bm.forEach(m=>scene.remove(m));
  // 6. it blows: you fly
  O.lockF=0; O.scythe=0; C.lockF=0; yield* dgLaunch(F,cam,gx,gy,gz,hk,6);
  if(Game.state==='play'&&P.hp>0&&A&&!F.revQ) twBark('ali',"That was embarrassing. For all four of us. Five, counting the pillow.",true); };

// ---------- EDGE LORD'S EMBRACE: Omar grabs ----------
function* twOmarExecution(F){ const P=Player, C=F.C, O=F.O, A=twAliAny(), dt=1/60, HA=dgHeroAnim();
  F.grabbed=1; F._grabName="EDGE LORD'S EMBRACE"; P.inv=99; P.cineFly=true; P.cineAnim=HA; P.atk=null; P.charge=0; P.dash=0; P.vx=P.vz=P.vy=0; Game.letterTo=.4; if(A){ A.hold=1; A.face=P.x>A.x?1:-1; }
  const c0=twClampXZ(P.x,P.z,3), gx=c0.x, gz=c0.z, gy=groundY(gx,gz), f=O.x<gx?1:-1;
  O.mv=null; O.hide=0; O.x=gx-f*.9; O.z=gz+.1; O.hy=1.3; O.y=groundY(O.x,O.z)+1.3; O.lockF=1; O.f=f; O.scythe=0; O.cast=1;
  const cam=dgCam(()=>dgFrame([[P.x,P.y+1,P.z],[O.x,O.y+1,O.z]],{min:20}));
  // 1. he holds you up, one hand
  impactFrame([[3,1],[1,1]]); Sound.sfx('punch'); Sound.sfx('void'); shake(.5); FX.burst(gx,gy+2,gz,26,0x140a1a,4,.4,false);
  twBark('omar',"Too early. You flinched. Everyone flinches. Except me. I have no feelings left to flinch with.",true);
  const hold=()=>{ P.x=O.x+O.f*.85; P.z=O.z+.05; P.y=gy+2.1+Math.sin(performance.now()/120)*.05; };
  for(let t=0;t<.7;t+=dt){ hold(); yield wait(dt); }
  if(dgAliRoll(F)){ yield* dgAliSave(F,O,cam); return; }
  // 2. Caotan teleports in and lasers you while he holds you: you burn, then char
  const cp=twClampXZ(gx+f*6,gz+1.2,1); twBlink(C,cp.x,cp.z); C.f=gx>C.x?1:-1; C.lockF=1; Sound.sfx('dash');
  cam.want=()=>dgFrame([[P.x,P.y+1,P.z],[O.x,O.y+1,O.z],[C.x,C.y+1,C.z]],{min:22});
  twBark('caotan',"Hold him still, Omar! Megane Beam: well done, senpai!",true); for(let t=0;t<.3;t+=dt){ hold(); yield wait(dt); }
  yield* twGlint(C,1,.2,1);
  const bm=[beamMesh(0xff9ad8,.36),beamMesh(0xffffff,.14)]; bm.forEach(m=>{ m.userData.tw=1; scene.add(m); }); Sound.sfx('beam'); Sound.sfx('drone');
  for(let t=0;t<1.6;t+=dt){ hold(); bm.forEach(m=>{ twBeamTo(m,C.x,C.y+1.9,C.z,P.x,P.y+1.1,P.z,1+Math.sin(t*60)*.15); }); dgChar(Math.min(1,t/1.3));
    for(let i=0;i<3;i++) FX.spawn(P.x+rnd(-.35,.35),P.y+rnd(.3,1.8),P.z+.1,rnd(-.4,.4),rnd(1.5,3.5),0,rnd(.3,.6),[0xff7a2a,0xffc04a,0xff3a1a][i],rnd(.15,.3),-1,true);
    if(t>.8&&Math.random()<.5) FX.spawn(P.x+rnd(-.3,.3),P.y+rnd(1,2),P.z,rnd(-.2,.2),rnd(.6,1.4),0,rnd(.8,1.4),0x2a2a2a,rnd(.25,.4),-.4,false);
    if(Math.random()<.12) Sound.sfx('hit'); yield wait(dt); }
  bm.forEach(m=>scene.remove(m)); C.lockF=0; Sound.sfx('crash'); if(!ALI()) twBark('shayan',"I'm... medium rare...",true);
  // 3. Omar opens a black hole beside him and throws you in
  const hp=twClampXZ(gx+f*3.2,gz-.6,1.2), hy=groundY(hp.x,hp.z)+1.3, V=twHoleVis(hp.x,hy,hp.z,1.5,true), hk={k:0,t:0,live:1};
  Game.fxUpd.push(d=>{ hk.t+=d; hk.k=hk.live?Math.min(1,hk.k+d*1.8):Math.max(0,hk.k-d*3); V.t=hk.t; V.set(hk.k); if(!hk.live&&hk.k<=0){ V.kill(); return false; } return true; });
  Sound.sfx('void'); cam.want=()=>dgFrame([[P.x,P.y+1,P.z],[O.x,O.y+1,O.z],[hp.x,hy,hp.z]],{min:22}); twBark('omar',"Into the void. It's cozy. I decorated.",true);
  for(let t=0;t<.6;t+=dt){ hold(); yield wait(dt); }
  O.cast=0; O.swing=1; Sound.sfx('whoosh'); const sx=P.x, sy=P.y, sz=P.z;
  for(let t=0;t<.5;t+=dt){ const u=t/.5; P.x=lerp(sx,hp.x,u); P.z=lerp(sz,hp.z,u); P.y=lerp(sy,hy,u)+Math.sin(u*Math.PI)*1.6; P.cineAnim='fall'; yield wait(dt); }
  P.hidden=true; Sound.sfx('chomp'); shake(.6); O.swing=0; O.lockF=0; yield wait(.55);
  // 4. it spits you out, high, uncharred
  yield* dgLaunch(F,cam,hp.x,groundY(hp.x,hp.z),hp.z,hk,6); }

// ---------- Omar's rush: a parry pressed too early gets you grabbed (outside the limit cuts) ----------
twDuoRush=(function(){ return function*(O,sp,K){ const P=Player, from=Game.time+TW_STRICT.grace, a0=(P.ang||0)+rnd(-.8,.8), p=twClampXZ(P.x+Math.cos(a0)*7,P.z+Math.sin(a0)*7,.8);
  twBlink(O,p.x,p.z); O.hide=0; O.scythe=1; let a=Math.atan2(P.z-O.z,P.x-O.x); const tell=.6/sp; let t=0, ln=null; O.lockF=1;
  while(t<tell){ const P2=Player; if(t<tell-.15) a=Math.atan2(P2.z-O.z,P2.x-O.x); O.f=Math.cos(a)>0?1:-1; if(!ln||t-ln>.1){ ln=t; FX.line(O.x,O.z,a,Math.hypot(P2.x-O.x,P2.z-O.z)+4,2.6,0xb06aff,.12); } yield .016; t+=.016; }
  const s={t:0,hit:false,grab:false,dur:(Math.hypot(Player.x-O.x,Player.z-O.z)+4)/20}; Sound.sfx('swing'); O.swing=1; O.parried=0;
  twHz({upd(dt,play){ if(!play) return true; s.t+=dt; O.x+=Math.cos(a)*20*dt; O.z+=Math.sin(a)*20*dt; const q=twClampXZ(O.x,O.z,.5); O.x=q.x; O.z=q.z; if(!s.hit) twRushTell(O,a); FX.spawn(O.x,O.y+1.4,O.z,0,0,0,.35,0x2a0a3a,.6,0,false);
    const P2=Player; if(!s.hit&&Math.hypot(P2.x-O.x,P2.z-O.z)<TW_DASH_R&&Math.abs(P2.y-groundY(O.x,O.z))<2.4){ s.hit=true; const F=TW.fight;
      if(F&&F.kind==='duo'&&!F.lc&&!F.grabbed&&!ALI()&&P2.inv<=0&&P2.dash<=0&&twStrictJudge(from,TW_DASH_WIN)==='early') s.grab=true;
      else twStrictDo(from,()=>twHitP(2,O.x,O.z,{melee:true,heavy:true,win:TW_DASH_WIN,onParry:()=>{ O.parried=1; O.flash=.3; if(K) twComboTick(K); }})); }
    return s.t<s.dur&&!O.parried&&!s.grab; }});
  let w=0; while(w<s.dur+.05&&!O.parried&&!s.grab){ yield .016; w+=.016; } O.swing=0; O.lockF=0;
  if(s.grab&&Game.state==='play'){ const F=TW.fight; run(function*(){ yield* twOmarExecution(F); }); yield .1; return 'grab'; }
  if(O.parried) Sound.sfx('clash'); return O.parried; }; })();
// ---------- a tag-team rush move, so the rushes (and their grabs) come up more often ----------
DUO.rushTag=function*(C,O,ph){ const sp=twSp(C), K={n:[0,2,3,4][ph],par:0}; twBark('omar',"Tag. You're it. You were always it.",true);
  for(let i=0;i<K.n;i++){ const r=i%2===0?yield* twDuoRush(O,sp,K):yield* twDuoGlomp(C,sp,[0,.62,.55,.48][ph],K); if(r==='grab') return; yield .3; }
  if(K.par>=K.n) twDuoBroken(C,O,K,2.4); };
for(const k of [1,2,3]) DUO3_POOL[k].push('rushTag');
// no new duo move starts while a grab runs
(function(){ const p=twDuo3Pre; twDuo3Pre=function(F,dt,play){ return p.call(this,F,dt,play&&!F.grabbed); }; })();
// a fight restart never leaves the player charred
(function(){ const r=twDuoRestart; twDuoRestart=function(){ dgChar(0); return r.apply(this,arguments); }; })();
