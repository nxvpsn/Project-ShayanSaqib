// =====================================================================
// OMAR, ROUND THREE: rally scythes, timed reaps, the black hole, the hovering sentence, rifts in the sky
// =====================================================================

// ---------- deflected scythes do half damage (everywhere) ----------
(function(){ const rp=reflectProj; reflectProj=function(b,how){ const was=b.friendly; const r=rp.apply(this,arguments); if(b.kind==='scythe'&&b.friendly&&!was){ b.dmg*=.5; if(b.rally) twRallyBack(b); } return r; }; })();

// ---------- the red rally scythes: they follow you; deflect one and Omar knocks it straight back ----------
// Your 4th deflect (after three returns) flies back at him super fast and hurts him. Phase III adds a second, faster red scythe;
// the slow one's third return in phase III is FAST, with a glint first.
function twRallyLook(b){ const piv=b.spin; if(!piv) return; const [bl,ed,po]=piv.children; if(bl) bl.material.color.setHex(0x0c0812); if(ed) ed.material.color.setHex(0xff2a3a); if(po) po.material.color.setHex(0x2a1a30); if(b.gl) b.gl.material.color.setHex(0xff1a2a); }
function twRallyAlive(kind){ return BOLTS.some(b=>b.rally&&!b.dead&&(!kind||b.rally.kind===kind)); }
function twRallySpawn(T,kind,delay){ const v=kind==='fast'?7:4.2, b=twBolt(T,{kind:'scythe',x:T.x,y:T.y+2.2,z:T.z,vx:0,vz:0,delay:delay||.9,spd:v,homing:kind==='fast'?1.8:1.4,col:0xff2a3a,dmg:2,life:10});
  b.rally={n:0,T,kind,v}; twRallyLook(b); if(b.gl) b.gl.scale.set(2.4,2.4,1); return b; }
// the player just deflected it
function twRallyBack(b){ const R=b.rally; R.n++;
  if(R.n>=4){ R.final=1; b.life=3; b.t=0; Game.dmgNums.push({x:b.x,y:b.y+1,z:b.z,n:'RALLY WON',t:0,big:true,col:'#ffd45a'}); Sound.sfx('beam'); shake(.3); FX.flash=Math.max(FX.flash,.15); grade.uniforms.flashCol.value.set(.6,.9,1); }
  else { b.life=30; b.t=0; Game.dmgNums.push({x:b.x,y:b.y+1,z:b.z,n:'RALLY '+R.n+'/3',t:0,big:true,col:'#ff8a9a'}); }
  const T=R.T, v=R.final?30:Math.max(4.5,R.v), d=Math.hypot(T.x-b.x,T.z-b.z)||1; b.vx=(T.x-b.x)/d*v; b.vz=(T.z-b.z)/d*v; b.vy=0; }
(function(){ const ub=updateBolts; updateBolts=function(dt){ if(TW.fight) for(const b of BOLTS){ const R=b.rally; if(!R||b.dead||!b.friendly) continue; const T=R.T;
      if(!T||T.gone||T.hp<=0||T.inv||T.state==='lc'){ b.dead=1; FX.burst(b.x,b.y,b.z,12,0xff2a3a,3,.25); continue; }
      if(T.hide&&!R.final) continue;
      const v=R.final?30:Math.max(4.5,R.v), dx=T.x-b.x, dz=T.z-b.z, d=Math.hypot(dx,dz)||1, cur=Math.atan2(b.vz,b.vx); let turn=Math.atan2(dz,dx)-cur; while(turn>Math.PI) turn-=Math.PI*2; while(turn<-Math.PI) turn+=Math.PI*2;
      const na=cur+clamp(turn,-(R.final?12:4)*dt,(R.final?12:4)*dt); b.vx=Math.cos(na)*v; b.vz=Math.sin(na)*v; b.vy=((T.y+1.2)-b.y)*2; // steady speed, homing on Omar wherever he drifts
      if(R.final){ for(let i=0;i<3;i++) FX.spawn(b.x,b.y,b.z,-b.vx*.05,0,-b.vz*.05,.3,i?0x9fe0ff:0xffffff,.3,0,true); if(T.hide){ b.dead=1; } continue; } // the winning return: the normal bolt hit lands on him
      if(d<1.3){ // Omar knocks it back to you
        const fast=R.n>=3&&T.phase>=3&&R.kind==='slow'; b.friendly=false; b.t=0; b.life=10; b.delay=fast?.45:.15; b.spd=fast?16:R.v; b.homing=fast?0:(R.kind==='fast'?1.8:1.4); b.dmg=2; b.ret=0; b.curl=0; twRallyLook(b);
        T.flash=.25; T.swing=1; Sound.sfx('deflect'); FX.spark(b.x,b.y,b.z); Game.dmgNums.push({x:T.x,y:T.y+3.2*(T.scale||1),z:T.z,n:'RETURNED '+R.n+'/3',t:0,col:'#ff8a9a'});
        if(fast){ twGlint(T,1,.01).next(); twBark('omar',"This one... is not slow.",true); } } }
    return ub(dt); }; })();

// ---------- Scythes ----------
// Two scythes curve in on you from the sides, one fast one fires straight (dodge it and it flies home), plus the red rally scythe.
// Phase II+: the fast one fires twice. Phase III: a second, faster red scythe, and the slow one's third return is fast.
TWK.omar.scythes=function*(T,ph){ const sp=twSp(T); if(Math.random()<.5) twBark('omar',ph>=2?"They always come back. Like my sadness.":"Rise, my scythes.");
  { const P=Player, a=Math.atan2(T.z-P.z,T.x-P.x), p=twClampXZ(P.x+Math.cos(a)*8,P.z+Math.sin(a)*6.5,1); twBlink(T,p.x,p.z); yield .3; } // he blinks away from you first
  T.cast=.8; T.scythe=0;
  if(!twRallyAlive('slow')) twRallySpawn(T,'slow'); if(ph>=3&&!twRallyAlive('fast')) twRallySpawn(T,'fast',1.4);
  const hold=[]; for(const s of [-1,1]){ const hx=T.x+s*1.4, hy=T.y+2, hz=T.z; hold.push([hx,hy,hz,s]); FX.burst(hx,hy,hz,10,0x7a2acc,2.5,.25); } Sound.sfx('charge'); yield .55/sp;
  for(const [hx,hy,hz,s] of hold){ const P=Player, y=groundY(hx,hz)+1.1, a=Math.atan2(P.z-hz,P.x-hx), d=Math.max(3,Math.hypot(P.x-hx,P.z-hz)), off=.95*s, v=10.5*sp;
    twBolt(T,{kind:'scythe',x:hx,y,z:hz,vx:Math.cos(a+off)*v,vz:Math.sin(a+off)*v,curl:-2*off*v/(d*1.1),dmg:2,life:d*1.25/v+1,col:0x8a3aff}); Sound.sfx('swing'); yield .12; }
  const fasts=ph>=2?2:1; for(let i=0;i<fasts;i++){ const P=Player, d=Math.hypot(P.x-T.x,P.z-T.z); twAimBolt(T,'scythe',T.x,T.y+2,T.z,0,0,{delay:.35/sp,spd:18*sp,col:0x8a3aff,ret:d/(18*sp)+.25,life:4}); yield .5; }
  yield .5; };

// ---------- Reap: teleports behind you on a steady beat, timed parries ----------
// Phase II+: three reaps, same rhythm.
TWK.omar.reap=function*(T,ph){ const sp=twSp(T), n=ph>=2?3:2; twBark('omar',ph>=2?"Reap. Reap. And... REAP.":"Behind you. Always behind you.");
  for(let i=0;i<n;i++){ const from=Game.time+TW_STRICT.grace, P=Player, a=(P.ang||0)+Math.PI+rnd(-.6,.6), p=twClampXZ(P.x+Math.cos(a)*2.1,P.z+Math.sin(a)*2.1,.6); FX.marker(p.x,p.z,1,0x8a3aff,.45/sp);
    FX.burst(T.x,T.y+1.4,T.z,22,0x140a1a,4,.45,false); T.hide=1; Sound.sfx('dash'); yield .4/sp; T.x=p.x; T.z=p.z; T.y=groundY(p.x,p.z)+T.hy; T.hide=0; FX.burst(T.x,T.y+1.4,T.z,22,0x140a1a,4,.45,false);
    T.scythe=1; T.swing=0; const P2=Player, aa=Math.atan2(P2.z-T.z,P2.x-T.x), tell=.45/sp; T.lockF=1; T.f=Math.cos(aa)>0?1:-1; T.parried=0; FX.line(T.x,T.z,aa,2.8,2.6,0xb06aff,tell);
    yield tell;
    T.swing=1; Sound.sfx('swing'); FX.arc(T.x,groundY(T.x,T.z),T.z,aa,0,true); twStrictDo(from,()=>twReapHit(T.x,T.z,aa,2.8,T)); yield .32/sp; T.lockF=0; T.scythe=0; if(T.parried) return; }
  yield .5; };

// ---------- Hands: spirals; phase II+ a second spiral runs in the gaps of the first, from the same centre ----------
// Getting grabbed roots you for 2s. A hand that lands while you are already rooted still hurts but does not extend the root.
function* twHandChase(T,sp){ for(let i=0;i<7;i++){ const P=Player, p=twClampXZ(P.x+P.vx*.25,P.z+P.vz*.25,.4); twBlast(p.x,p.z,.95,.55/sp,{col:0x9a5aff,burst:0xd8c8f0,ring:'#c08aff',dmg:2,sfx:'crash',shake:.1,onBoom(x,z){ twHandRise(x,z); }}); yield .27/sp; } }
function twHandRoot(){ const P=Player; if(!(P.rootT>Game.time)){ P.rootT=Game.time+2; Game.dmgNums.push({x:P.x,y:P.y+2.4,z:P.z,n:'GRABBED',t:0,col:'#c08aff'}); } P.hurt=Math.max(P.hurt,P.rootT-Game.time); P.vx=P.vz=0; }
function* twHandSpiral(T,sp,a0,ox,oz,arms){ for(let k=0;k<11;k++){ for(let m=0;m<arms;m++){ const a=a0+m*6.283/arms+k*.33, r=1.2+k*1.05, p={x:ox+Math.cos(a)*r,z:oz+Math.sin(a)*r}; const A=twLock(); if(p.x<A.x0||p.x>A.x1||p.z<A.z0||p.z>A.z1) continue;
      twBlast(p.x,p.z,.95,.55/sp,{col:0x9a5aff,burst:0xd8c8f0,ring:'#c08aff',dmg:2,sfx:k%2?'crash':'hit',shake:.06,quiet:m>0,onBoom(x,z){ twHandRise(x,z); },onHit:twHandRoot}); }
    yield .12/sp; } }
TWK.omar.hands=function*(T,ph){ const sp=twSp(T); twBark('omar',ph>=2?"The graveyard has a firm handshake.":"The dead rise... for ME."); T.cast=.6;
  if(ph<2){ yield* twHandChase(T,sp); yield .5; return; }
  const a0=rnd(0,6.28), arms=ph>=3?4:3, ox=T.x, oz=T.z;
  yield* twHandSpiral(T,sp,a0,ox,oz,arms); yield .35; T.cast=.6;
  yield* twHandSpiral(T,sp,a0+Math.PI/arms,ox,oz,arms); // the gaps, same centre even if Omar has moved
  if(ph>=3){ yield .5; yield* twHandChase(T,sp); }
  yield .7; };

// ---------- Collapse (phase II+): the black hole and three rushes. Phase I no longer has this move ----------
{ const p1=TWPOOL.omar[1], k=p1.indexOf('orbs'); if(k>=0) p1.splice(k,1); }
TWK.omar.orbs=function*(T,ph){ yield* twOmarCollapse(T,Math.max(2,ph)); };
// It opens 8 units from you. The pull (none while dashing) is 10/s at 8 units, stronger further out (up to 14.4), never weaker than 8.8 inside:
// dashing twice a second holds you about 9 units out; walking alone gets you eaten.
const TW_BH={pull:10,at:8,slope:2.4,min:8.8,max:14.4,eat:1,dur:5.6,spawn:8};
function* twOmarCollapse(T,ph){ const sp=twSp(T), P=Player; twBark('omar',"Collapse. Dash, little star. Dash or be eaten.",true);
  // TW_BH.spawn units from you, on the side that leaves you the most room to run (behind you if the arena is open)
  let c=null, best=-1; const A=twBounds(), ray=(ux,uz)=>Math.min(ux>1e-4?(A.x1-P.x)/ux:ux<-1e-4?(A.x0-P.x)/ux:1e9,uz>1e-4?(A.z1-P.z)/uz:uz<-1e-4?(A.z0-P.z)/uz:1e9);
  for(let k=0;k<16;k++){ const a=(P.ang||0)+Math.PI+k*Math.PI/8, x=P.x+Math.cos(a)*TW_BH.spawn, z=P.z+Math.sin(a)*TW_BH.spawn; if(x<A.x0+1.5||x>A.x1-1.5||z<A.z0+1.5||z>A.z1-1.5) continue;
    const room=Math.min(ray(-Math.cos(a),-Math.sin(a)),6)-k*.01; if(room>best){ best=room; c={x,z}; } }
  if(!c) c=twClampXZ(P.x+Math.cos((P.ang||0)+Math.PI)*TW_BH.spawn,P.z+Math.sin((P.ang||0)+Math.PI)*TW_BH.spawn,1.5); const gy=groundY(c.x,c.z);
  const core=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:0x000000})); core.userData.tw=1; core.scale.setScalar(.01); scene.add(core); const halo=twGlow(0x8a2aff,1);
  const BH=TW.bh={x:c.x,z:c.z,live:true,t:0}; twBig('DASH!',{size:64,col:'#c08aff',y:UH*.26,dur:1.2,sub:'The black hole pulls you in. Keep dashing away, and parry his rushes.'}); Sound.sfx('void');
  twHz({upd(dt,play){ if(play) BH.t+=dt; const k=Math.min(1,BH.t*2)*(BH.live?1:Math.max(0,1-(BH.t-BH.endT)*4)); core.scale.setScalar(Math.max(.01,1.3*k)); core.position.set(c.x,gy+1.3,c.z); halo.position.copy(core.position); halo.scale.setScalar(5*k+Math.sin(BH.t*20)*.3);
      for(let i=0;i<4;i++){ const a=rnd(0,6.28), r=rnd(2,6); FX.spawn(c.x+Math.cos(a)*r,gy+1.3+rnd(-1,1),c.z+Math.sin(a)*r,-Math.cos(a)*r*1.6,0,-Math.sin(a)*r*1.6,.5,i%2?0x8a2aff:0x1a0a2a,.3,0,i%2===0); }
      if(BH.live) twBHSuck(c,gy); // nothing else may fly while the hole is open: it all gets eaten
      const Pl=Player; if(play&&BH.live&&!Pl.hidden&&Pl.dash<=0&&!(Pl.bhLaunch>Game.time)&&!(Pl.bhPause>Game.time)){ const dx=c.x-Pl.x, dz=c.z-Pl.z, d=Math.hypot(dx,dz)||1, ramp=Math.min(1,BH.t/.5);
        if(d>.3){ const k=clamp(TW_BH.pull+TW_BH.slope*(d-TW_BH.at),TW_BH.min,TW_BH.max)*ramp, s=twClampXZ(Pl.x+dx/d*k*dt,Pl.z+dz/d*k*dt,.3); Pl.x=s.x; Pl.z=s.z; }
        if(d<TW_BH.eat&&Pl.y<gy+2.2) twBHEat(BH,c); }
      if(BH.live&&BH.t>=TW_BH.dur){ BH.live=false; BH.endT=BH.t; Sound.sfx('crossboom'); shake(.5); twWave(c.x,c.z,{col:0x8a2aff,sp:8,max:12}); }
      return BH.live||BH.t<BH.endT+.3; }, kill(){ scene.remove(core); scene.remove(halo); if(TW.bh===BH) TW.bh=null; }});
  T.hide=1; FX.burst(T.x,T.y+1.4,T.z,22,0x140a1a,4,.45,false);
  for(const [at,side] of [[1.2,0],[2.6,Math.PI/4],[4,-Math.PI/4]]){ while(BH.live&&BH.t<at/sp) yield .016; if(!BH.live) break; yield* twBHRush(T,BH,c,side,sp); }
  while(BH.live) yield .05; T.hide=0; if(TW.bh===BH) TW.bh=null; yield .6; }
// enemy projectiles (red rally scythes included, either way they fly), harvest souls and hovering sentence scythes are sucked in at once
function twSuckFx(x,y,z,c,gy,col){ const g=twGlow(col||0xff2a3a,1.4), k={t:0}; twHz({upd(dt){ k.t+=dt; const u=Math.min(1,k.t/.15); g.position.set(lerp(x,c.x,u),lerp(y,gy+1.3,u),lerp(z,c.z,u)); g.scale.setScalar(1.4*(1-u)+.1);
    FX.spawn(g.position.x,g.position.y,g.position.z,0,0,0,.25,col||0xff2a3a,.25,0,true); return u<1; }, kill(){ scene.remove(g); }}); }
function twBHSuck(c,gy){ for(const b of BOLTS){ if(b.dead||(b.friendly&&!b.rally)) continue; b.dead=1; twSuckFx(b.x,b.y,b.z,c,gy,b.rally?0xff2a3a:0x8a3aff); }
  for(const o of TW._harvest||[]){ if(o.st==='gone') continue; o.st='gone'; scene.remove(o.m); twSuckFx(o.x,groundY(o.x,o.z)+1,o.z,c,gy,0xbfe8ff); }
  for(const H of TW.hovers||[]){ if(H.st==='gone'||H.st==='suck') continue; H.st='suck'; H.ft=0; if(H.blast) H.blast.upd=()=>false; } }
(function(){ const at=aliTeleport; aliTeleport=function(){ Player.bhPause=Game.time+.18; return at.apply(this,arguments); }; })(); // Ali's teleport counts as a dash against the pull
function twBHEat(BH,c){ const P=Player; BH.live=false; BH.endT=BH.t; P.inv=0; P.dash=0; FX.burst(P.x,P.y+1,P.z,50,0x8a2aff,7,.4); Sound.sfx('chomp'); Sound.sfx('crossboom'); shake(1);
  twBark('omar',"Delicious. You taste like effort.",true); Game.dmgNums.push({x:P.x,y:P.y+2.6,z:P.z,n:'EATEN',t:0,big:true,col:'#c08aff'});
  hurtPlayer(6,c.x,c.z); // then spat out diagonally, three dashes away, through the air
  const a=Math.PI/4+Math.floor(Math.random()*4)*Math.PI/2, air=.78; P.vx=Math.cos(a)*7.5/air; P.vz=Math.sin(a)*7.5/air; P.vy=9.4; P.onGround=false; P.hurt=air; P.bhLaunch=Game.time+air; }
// Omar appears ahead of where you are looking (or 45° to the side), aims, and rushes. Dashing does not save you here: parry it.
function* twBHRush(T,BH,c,side,sp){ const P=Player, from=Game.time+TW_STRICT.grace, a0=(P.ang||0)+side, p=twClampXZ(P.x+Math.cos(a0)*7,P.z+Math.sin(a0)*7,.8);
  T.x=p.x; T.z=p.z; T.y=groundY(p.x,p.z)+T.hy; T.hide=0; T.scythe=1; T.mv=null; FX.burst(T.x,T.y+1.4,T.z,24,0x140a1a,4,.45,false); Sound.sfx('dash');
  let a=Math.atan2(P.z-T.z,P.x-T.x); const tell=.6/sp; let t=0, ln=null; T.lockF=1;
  while(t<tell){ const P2=Player; if(t<tell-.15) a=Math.atan2(P2.z-T.z,P2.x-T.x); T.f=Math.cos(a)>0?1:-1; if(!ln||t-ln>.1){ ln=t; FX.line(T.x,T.z,a,Math.hypot(P2.x-T.x,P2.z-T.z)+4,2.6,0xb06aff,.12); } yield .016; t+=.016; if(!BH.live){ T.hide=1; return; } }
  const s={t:0,hit:false,dur:(Math.hypot(Player.x-T.x,Player.z-T.z)+4)/20}; Sound.sfx('swing'); T.swing=1; T.parried=0;
  twHz({upd(dt,play){ if(!play) return true; s.t+=dt; T.x+=Math.cos(a)*20*dt; T.z+=Math.sin(a)*20*dt; const q=twClampXZ(T.x,T.z,.5); T.x=q.x; T.z=q.z; if(!s.hit) twRushTell(T,a); FX.spawn(T.x,T.y+1.4,T.z,0,0,0,.35,0x2a0a3a,.6,0,false);
    const P2=Player; T.rushEta=s.hit?null:Game.time+twRealAhead(Math.max(0,(P2.x-T.x)*Math.cos(a)+(P2.z-T.z)*Math.sin(a)-TW_DASH_R)/20); // when it reaches you (the test bot reads this)
    if(!s.hit&&Math.hypot(P2.x-T.x,P2.z-T.z)<TW_DASH_R&&Math.abs(P2.y-groundY(T.x,T.z))<2.4){ const dash=P2.dash; P2.dash=0; if(P2.inv<5) P2.inv=0; // the black hole eats your i-frames
      const r=twStrictDo(from,()=>twHitP(2,T.x,T.z,{melee:true,heavy:true,win:TW_DASH_WIN,onParry:()=>{ T.parried=1; const dx=P2.x-c.x, dz=P2.z-c.z, d=Math.hypot(dx,dz)||1, w=twClampXZ(P2.x+dx/d*1.5,P2.z+dz/d*1.5,.3); P2.x=w.x; P2.z=w.z; }}));
      if(r==='parry') P2.dash=dash; else if(r==='hit'){ const dx=P2.x-c.x, dz=P2.z-c.z, d=Math.hypot(dx,dz)||1; P2.vx=dx/d*6; P2.vz=dz/d*6; } // a missed parry knocks you away from the hole, not into it
      s.hit=true; }
    return s.t<s.dur&&!T.parried; }, kill(){ T.rushEta=null; }});
  let w=0; while(w<s.dur+.05&&!T.parried){ yield .016; w+=.016; } T.rushEta=null;
  T.swing=0; T.lockF=0; FX.burst(T.x,T.y+1.4,T.z,22,0x140a1a,4,.45,false); T.hide=1; if(T.parried) Sound.sfx('clash'); }
(function(){ const tl=twLCPrep; twLCPrep=function(T){ BOLTS.forEach(b=>{ if(b.rally) b.dead=1; }); TW.bh=null; return tl.apply(this,arguments); }; })();

// ---------- Death Sentence: the giant scythe hovers over you through 3-2-1, then locks and drops (0.35s). Phase II+: two, one after the other ----------
function twHoverScythe(){ const g=new THREE.Group(); const bl=new THREE.Mesh(new THREE.TorusGeometry(1.5,.18,4,24,Math.PI*.9),new THREE.MeshBasicMaterial({color:0x0c0812})); const ed=new THREE.Mesh(new THREE.TorusGeometry(1.62,.06,4,24,Math.PI*.9),new THREE.MeshBasicMaterial({color:0xff3a4a}));
  const pole=new THREE.Mesh(new THREE.BoxGeometry(.14,3.2,.14),new THREE.MeshBasicMaterial({color:0x2a1a30})); pole.position.set(1.5,1.4,0); g.add(bl,ed,pole); g.userData.tw=1; scene.add(g);
  const P=Player, H={x:P.x,z:P.z,st:'track',t:0,ft:0}; (TW.hovers=(TW.hovers||[]).filter(h=>h.st!=='gone')).push(H);
  twHz({upd(dt,play){ if(play) H.t+=dt; const P2=Player;
      if(H.st==='suck'){ const B=TW.bh; H.ft+=dt; const u=Math.min(1,H.ft/.2); if(B){ H.x=lerp(H.x,B.x,u); H.z=lerp(H.z,B.z,u); } g.position.set(H.x,groundY(H.x,H.z)+lerp(6,1.3,u),H.z); g.scale.setScalar(Math.max(.01,1-u)); g.rotation.z+=dt*20; if(u>=1){ H.st='gone'; return false; } return true; }
      if(H.st==='track'){ const k=Math.min(1,dt*16); H.x=lerp(H.x,P2.x,k); H.z=lerp(H.z,P2.z,k); g.position.set(H.x,groundY(H.x,H.z)+6.4+Math.sin(H.t*3)*.2,H.z); g.rotation.z=Math.sin(H.t*2)*.15; if(Math.random()<.5) FX.spawn(H.x+rnd(-1,1),groundY(H.x,H.z)+6,H.z,0,-1,0,.5,0xff2a3a,.25,0,true); return true; }
      if(play) H.ft+=dt; const u=Math.min(1,H.ft/.35); g.position.set(H.x,groundY(H.x,H.z)+.6+(1-u*u)*5.8,H.z); g.rotation.z=-u*2.4; if(H.ft>=.65){ H.st='gone'; return false; } return true; }, kill(){ scene.remove(g); if(H.st!=='suck') H.st='gone'; }});
  H.drop=()=>{ if(H.st!=='track') return; H.st='fall'; Sound.sfx('swing'); H.blast=twBlast(H.x,H.z,1.7,.35,{col:0xff1a3a,burst:0x2a0010,ring:'#ff2a3a',dmg:99,allyDmg:4,dark:1,shake:.5,sfx:'crossboom',onBoom(){ const P=Player; if(P.inv<5) P.inv=0; }}); }; // the sentence is death: it one-shots
  return H; }
TWK.omar.sentence=function*(T,ph){ const sp=twSp(T); twBark('omar',ph>=2?"Double jeopardy. You will be executed... twice. It is legal. I checked.":"Your sentence... is death. In three.",true); Sound.sfx('gong');
  const S=TW.sentence={n:3,pulse:1}, hs=[twHoverScythe()]; if(ph>=2) hs.push(twHoverScythe());
  for(let n=3;n>=1;n--){ S.n=n; S.pulse=1; Sound.sfx('tick'); for(let k=0;k<10;k++){ if(k===4&&n===2) for(let i=0;i<2;i++) twAimBolt(T,'scythe',T.x,T.y+2,T.z,0,0,{delay:.4+i*.2,spd:11,col:0x8a3aff}); yield .095/sp; } }
  S.n=0; Sound.sfx('gong'); hs[0].drop();
  if(hs[1]){ yield .6; hs[1].drop(); twBark('omar',"Objection overruled.",true); }
  yield .9; TW.sentence=null; };

// ---------- Shadow Requiem (clones): they start far out and arrive one per beat; each one is a timed parry, its eyes flash when the window opens ----------
// Attacking early while standing in a clone's line: that clone blinks behind you, grabs you and lifts you up, and every clone that has not
// dashed yet flies through you (half a heart each). Not pressing at all just means the clone hits you (1 heart), or you dodge out of its line.
TWK.omar.clones=function*(T,ph){ const sp=twSp(T); twBark('omar',"Shadow Requiem. My clones are also emotionally unavailable.",true); T.cast=1; Sound.sfx('howl');
  const P=Player, n=ph>=3?5:4, a0=rnd(0,6.28), tell=.55/sp, vel=18*sp, gap=.7, t0=Game.time, cl=[], S={done:false,grab:null}; TW._clones=cl;
  for(let i=0;i<n;i++){ const a=a0+i*6.283/n, p=twClampXZ(P.x+Math.cos(a)*13,P.z+Math.sin(a)*10.4,.8), Sp=new Sprite3D(128,128,28); Sp.mesh.material.color.setHex(0x6a3aa8); Sp.glow(.35);
    cl.push({i,x:p.x,z:p.z,y:0,S:Sp,st:'wait',hit:false,d0:0,a:0,res:0,glint:false,dist:Math.hypot(p.x-P.x,p.z-P.z)}); FX.burst(p.x,groundY(p.x,p.z)+1.6,p.z,18,0x1a0a24,3,.4,false); }
  // an even beat (0.7s): clone i reaches you at t0+lead+i*gap; one clamped closer by a wall waits a little longer; its eyes flash (0.17s before it reaches you) to say: press now
  const trav=c=>Math.max(0,c.dist-1.15)/vel, lead=.3+tell+Math.max(...cl.map(trav)); cl.forEach(c=>{ c.ts=t0+lead+c.i*gap-tell-trav(c); });
  const inLine=(c,P2)=>{ const rx=P2.x-c.lx, rz=P2.z-c.lz, ux=Math.cos(c.a), uz=Math.sin(c.a), al=rx*ux+rz*uz; return al>-.5&&al<15.5&&Math.abs(rx*uz-rz*ux)<.9; };
  const ahead=(c,P2,now)=>(c.st==='tell'?c.ts+tell-now:0)+Math.max(0,(P2.x-c.x)*Math.cos(c.a)+(P2.z-c.z)*Math.sin(c.a)-1.15)/vel;
  twHz({upd(dt,play){ const now=Game.time, P2=Player; let alive=false;
      if(S.grab){ twCloneGrab(S,cl,dt,play); alive=!S.done; }
      else { const act=cl.find(c=>!c.res&&!c.gone);
        for(const c of cl){ if(c.gone) continue; alive=true; const gy=groundY(c.x,c.z), prev=cl[c.i-1];
          if(c.st==='wait'&&now>=c.ts){ c.st='tell'; c.a=Math.atan2(P2.z-c.z,P2.x-c.x); c.dist=Math.hypot(P2.x-c.x,P2.z-c.z); c.lx=c.x; c.lz=c.z; FX.line(c.x,c.z,c.a,15,1.2,0xa04aff,tell); Sound.sfx('charge');
            c.from=Math.max(c.ts+TW_STRICT.grace,prev&&prev.res?prev.res+.15:0); }
          else if(c.st==='tell'&&now>=c.ts+tell){ c.st='dash'; Sound.sfx('dash'); }
          if(c.st!=='wait'&&!c.glint&&twRealAhead(ahead(c,P2,now))<=.17){ c.glint=true; Sound.sfx('ting'); const g=twGlow(0xffffff,2.4); g.position.set(c.x,gy+2.2,c.z); twHz({upd(d2){ this.t+=d2; g.material.opacity=Math.max(0,1-this.t/.3); return this.t<.3; }, kill(){ scene.remove(g); }}); }
          // the next clone to arrive judges the first press made in its line: early = the grab
          if(c===act&&c.st!=='wait'&&!c.decided&&play){ if(prev&&prev.res) c.from=Math.max(c.from,prev.res+.15);
            for(let g=0;g<40;g++){ const p=twStrictFirst(c.from); if(!p) break; if(!inLine(c,P2)){ c.from=p.t; continue; } c.decided=true; if(twRealAhead(ahead(c,P2,now))+(now-p.t)>TW_STRICT.win){ twCloneGrabStart(S,cl,c); } break; }
            if(S.grab) return true; }
          if(c.st==='dash'&&play){ c.x+=Math.cos(c.a)*vel*dt; c.z+=Math.sin(c.a)*vel*dt; c.d0+=vel*dt; if(!c.hit) twRushTell(c,c.a); if(Math.random()<.9) FX.spawn(c.x,gy+rnd(.4,3),c.z,0,0,0,.35,0x2a0a3a,.8,0,false);
            if(!c.hit&&Math.hypot(P2.x-c.x,P2.z-c.z)<1.15&&Math.abs(P2.y-gy)<1.8){ const r=twStrictDo(c.from,()=>twHitP(2,c.x,c.z,{heavy:true,melee:true,onParry:()=>{ c.d0=99; Game.dmgNums.push({x:c.x,y:gy+3,z:c.z,n:'SHATTER',t:0,col:'#d0a0ff'}); }})); if(r!=='none'){ c.hit=true; c.res=now; } }
            if(!c.res&&c.d0>c.dist+1.2) c.res=now;
            if(c.d0>c.dist+6){ if(!c.res) c.res=now; FX.burst(c.x,gy+1.6,c.z,22,0x2a0a3a,4,.45,false); c.S.dispose(); c.gone=1; continue; } } } }
      for(const c of cl){ if(c.gone) continue; const gy=groundY(c.x,c.z); c.S.draw((cv,cx,by)=>drawOmarBoss(cv,cx,by,Math.cos(c.a)>0?1:-1,{t:now-t0+3,scythe:1,swing:c.st==='dash'||c.st==='fly'?1:0,cast:c.st==='tell'||c.st==='rise'?1:0,flash:0,form:2})); c.S.place(c.x,(c.y||gy)+1.1,c.z,gy); }
      if(!alive) S.done=true; return alive; }, kill(){ cl.forEach(c=>{ if(!c.gone) c.S.dispose(); }); S.done=true; if(S.grab){ Player.cineFly=false; Player.cineAnim=null; } }});
  let w=0; while(!S.done&&w<20){ yield .05; w+=.05; } yield .4; };
function twCloneGrabStart(S,cl,c){ const P=Player; twBark('omar',"Too eager. Hold still. We're all coming through.",true); Sound.sfx('void'); Game.dmgNums.push({x:P.x,y:P.y+2.8,z:P.z,n:'TOO EARLY',t:0,big:true,col:'#c08aff'});
  const a=(P.ang||0)+Math.PI; c.x=P.x+Math.cos(a)*1; c.z=P.z+Math.sin(a)*1; c.st='grab'; c.res=Game.time; FX.burst(c.x,groundY(c.x,c.z)+1.6,c.z,24,0x140a1a,4,.45,false); Sound.sfx('dash');
  const rest=cl.filter(o=>o!==c&&!o.gone&&(o.st==='wait'||o.st==='tell')); cl.forEach(o=>{ if(o!==c&&!o.gone&&!rest.includes(o)){ FX.burst(o.x,groundY(o.x,o.z)+1.6,o.z,18,0x2a0a3a,4,.4,false); o.S.dispose(); o.gone=1; } });
  rest.forEach((o,k)=>{ o.st='rise'; o.sx=o.x; o.sz=o.z; o.k=k; o.res=Game.time; });
  S.grab={c,rest,t:0,gy:groundY(P.x,P.z),px:P.x,pz:P.z}; P.cineFly=true; P.cineAnim='hurt'; P.atk=null; P.charge=0; P.dash=0; }
function twCloneGrab(S,cl,dt,play){ const G=S.grab, P=Player, c=G.c; if(play) G.t+=dt; const t=G.t, lift=Math.min(1,Math.max(0,(t-.15)/.45)), e=lift*(2-lift), y=G.gy+e*4;
  P.x=G.px; P.z=G.pz; P.y=y; c.x=G.px-Math.cos(P.ang||0)*1; c.z=G.pz-Math.sin(P.ang||0)*1; c.y=y;
  G.rest.forEach(o=>{ const a=o.k*6.283/Math.max(1,G.rest.length)+.4, rx=G.px+Math.cos(a)*4, rz=G.pz+Math.sin(a)*3, ft=.7+o.k*.22;
    if(o.st==='rise'){ const u=Math.min(1,t/.6); o.x=lerp(o.sx,rx,u); o.z=lerp(o.sz,rz,u); o.y=G.gy+u*4; o.a=Math.atan2(G.pz-o.z,G.px-o.x); if(t>=ft){ o.st='fly'; o.ft=0; o.fx=o.x; o.fz=o.z; } }
    else if(o.st==='fly'){ o.ft+=dt; const u=Math.min(1,o.ft/.14); o.x=lerp(o.fx,2*G.px-o.fx,u); o.z=lerp(o.fz,2*G.pz-o.fz,u); o.y=y; FX.spawn(o.x,y+1.4,o.z,0,0,0,.3,0x2a0a3a,.6,0,false);
      if(u>=.5&&!o.hit){ o.hit=true; P.inv=0; P.dash=0; P.cineFly=false; twHitP(1,o.x,o.z,{ub:true,pierce:true}); P.cineFly=true; P.vx=P.vz=P.vy=0; Sound.sfx('swing'); FX.cut(P.x,y+1.2,P.z); }
      if(u>=1){ o.st='done'; FX.burst(o.x,y+1.6,o.z,18,0x2a0a3a,4,.4,false); o.S.dispose(); o.gone=1; } } });
  const end=.7+G.rest.length*.22+.35;
  if(t>=end){ P.cineFly=false; P.cineAnim=null; P.vy=-2; P.inv=Math.max(P.inv,.4); FX.burst(c.x,y+1.6,c.z,22,0x140a1a,4,.45,false); c.S.dispose(); c.gone=1; cl.forEach(o=>{ if(!o.gone){ o.S.dispose(); o.gone=1; } }); S.grab=null; S.done=true; } }

// ---------- Lights Out: fake eyes explode (3 hearts, wherever you are). Found him: 3s stun. Not found: no stun ----------
TWK.omar.lc1=function*(T){ twLCPrep(T); Game.letterTo=.35; twCutin('omar','LIGHTS OUT','Limit Break  ·  Eclipse of the Edge','#5a1a9a',2.2); twBark('omar',"You fear the dark? Good. The dark... is my whole personality.",true); Sound.sfx('gong'); yield 1.4;
  FX.burst(T.x,T.y+1.4,T.z,40,0x140a1a,6,.5,false); T.hide=1; const K=TW.dark={k:0,r:170,eyes:[],lantern:'✦ your lantern is the only light left ✦'}; Sound.sfx('void');
  twHz({upd(dt){ if(!TW.dark) return false; TW.dark.k=Math.min(1,TW.dark.k+dt*1.2); return true; }}); yield 1;
  const P=Player, ring=n=>{ K.eyes=[]; const a0=rnd(0,6.28); for(let i=0;i<n;i++){ const a=a0+i*6.283/n, p=twClampXZ(P.x+Math.cos(a)*7.2,P.z+Math.sin(a)*5.6,.6); K.eyes.push({x:p.x,y:groundY(p.x,p.z)+2,z:p.z,ph:rnd(0,6),s:1}); } };
  for(let w=0;w<3;w++){ ring(5+w); twBark('omar',["Where am I? Everywhere. Like depression.","Left. No, right. No... behind.","The dark has many eyes. All of them are mine."][w],true); yield .6;
    const pick=K.eyes.slice().sort(()=>Math.random()-.5).slice(0,3+w);
    for(const e of pick){ e.s=1.6; Sound.sfx('charge'); twBolt(T,{kind:'scythe',x:e.x,y:e.y,z:e.z,vx:0,vz:0,delay:.55,spd:11.5*twSp(T),col:0x8a3aff,dmg:2,life:4}); yield .32; e.s=1; }
    if(w>=1){ for(let i=0;i<5;i++){ const p=twClampXZ(P.x+P.vx*.25,P.z+P.vz*.25,.4); twBlast(p.x,p.z,.95,.6,{col:0x9a5aff,dmg:2,sfx:'crash',shake:.08,onBoom(x,z){ twHandRise(x,z); }}); yield .28; } }
    yield 1; }
  // which pair of eyes is the real one? only the real Omar wears eyeliner
  ring(6); const real=K.eyes[Math.floor(Math.random()*K.eyes.length)]; real.real=true; twBig('FIND THE REAL ONE',{size:54,col:'#ff4a5a',y:UH*.24,dur:1.8,sub:'Strike the true eyes. Only the real Omar wears eyeliner. Fakes explode.'}); twBark('omar',"Which one is me? Hint: the one with eyeliner. Oh no. I said that out loud.",true);
  let found=false, tt=0, tellT=0;
  while(tt<8.5&&!found){ const dt=.05; tt+=dt; tellT+=dt; K.tell=(tellT%1.6)<.18; for(const e of K.eyes){ e.x+=Math.sin(tt*1.3+e.ph)*.02; }
    const P2=Player; for(const e of K.eyes){ if(e.dead) continue; let struck=P2.atk&&P2.atk.t<.2&&Math.hypot(P2.x-e.x,P2.z-e.z)<2.4;
      if(!struck) for(const b of BEAMS){ if(Math.hypot(b.x-e.x,b.z-e.z)<1.6) struck=true; } if(!struck) for(const b of BOLTS){ if(b.friendly&&!b.dead&&Math.hypot(b.x-e.x,b.z-e.z)<1.4) struck=true; }
      if(!struck) for(const f of TW.fb||[]){ if(f.life>0&&Math.hypot(f.x-e.x,f.z-e.z)<1.4) struck=true; }
      if(struck){ if(e.real){ found=true; break; } e.dead=1; Sound.sfx('wrong'); Sound.sfx('crossboom'); shake(.5); FX.burst(e.x,e.y,e.z,40,0xff2a3a,7,.4); FX.ring(e.x,groundY(e.x,e.z)+.1,e.z,'#ff2a3a',2.6,.4);
        Game.dmgNums.push({x:e.x,y:e.y+1,z:e.z,n:'FAKE EDGE',t:0,col:'#ff6a7a'}); FX.burst(P2.x,P2.y+1.2,P2.z,30,0xff2a3a,5,.35); P2.inv=0; P2.dash=0; twHitP(6,e.x,e.z,{ub:true,pierce:true}); } }
    yield dt; }
  if(found){ Sound.sfx('crossboom'); impactFrame([[1,2],[2,2]]); FX.flash=.6; grade.uniforms.flashCol.value.set(1,1,1); T.x=real.x; T.z=real.z; T.hide=0; FX.burst(T.x,T.y+1.4,T.z,50,0xff2a3a,7,.4); twBark('omar',"My eyeliner... SMUDGED! How did you KNOW?!",true); twBig('FOUND YOU',{size:60,col:'#ffd45a',sub:'Omar is exposed'}); }
  else { twBark('omar',"Too slow. The darkness wins. As always. *sigh*",true); twBig('JUMP!',{size:80,col:'#ff4a5a'}); const P3=Player; twWave(P3.x,P3.z,{sp:10,max:12,col:0xb06aff,dmg:3}); twWave(P3.x,P3.z,{sp:10,max:12,col:0xb06aff,dmg:3,delay:.7}); yield 1.4; T.hide=0; }
  K.eyes=[]; twHz({upd(dt){ if(!TW.dark) return false; TW.dark.k-=dt*1.5; if(TW.dark.k<=0){ TW.dark=null; return false; } return true; }});
  Game.letterTo=0; T.inv=false; T.lcDone[2]=1; if(found){ T.stun=3; T.state='stun'; yield T.stun; } else { T.stun=0; T.state='idle'; } };

// ---------- Harvest: dodge the souls. Swords pass through them; a soul you dodge flies on into Omar ----------
// A soul that hits you: half a heart and a 1s slow. Each wave locks onto where you are; the last wave is fast enough to need a dash.
TWK.omar.harvest=function*(T,ph){ if(TW._harvest&&TW._harvest.some(o=>o.st!=='gone')){ yield .2; return; } const sp=twSp(T); twBark('omar',"Lanternbrook's souls... they taste like bread.",true); Sound.sfx('choir'); T.cast=1;
  twBig('DODGE THE SOULS',{size:46,col:'#bfe8ff',y:UH*.24,dur:1.5,sub:'Blades pass through them. Dodged souls fly into Omar.'});
  const N=12, R=9, tell=(ph>=3?.38:.45)/sp, H={a:rnd(0,6.28),k:0,live:true,t:0,w:0,pend:null}, souls=[];
  for(let i=0;i<N;i++) souls.push({i,st:'orbit',x:Player.x,z:Player.z,t:0,m:twBB(texSoul(),.9,1.1)}); TW._harvest=souls;
  // the waves run inside the hazard, so Omar keeps moving and attacking while the souls circle you: a quarter flashes every 3s, then rushes
  const launch=(pick,last)=>{ const P=Player, v=(last?26:ph>=3?19:16)*sp, lead=last?.35:.15;
    pick.forEach(o=>{ if(o.st!=='tell') return; const tx=P.x+P.vx*lead, tz=P.z+P.vz*lead, dx=tx-o.x, dz=tz-o.z, d=Math.hypot(dx,dz)||1; o.st='rush'; o.t=0; o.vx=dx/d*v; o.vz=dz/d*v; o.trav=0; o.len=d+3; }); Sound.sfx('whoosh'); };
  twHz({upd(dt,play){ const P=Player; if(play){ H.a+=dt*.85; H.k=Math.min(1,H.k+dt*1.5); H.t+=dt;
        if(H.w<4&&H.t>=2+3*H.w){ const w=H.w++, pick=souls.filter(o=>o.i%4===w&&o.st==='orbit'); pick.forEach(o=>{ o.st='tell'; o.t=0; }); Sound.sfx('charge'); H.pend={at:H.t+tell,pick,last:w===3}; }
        if(H.pend&&H.t>=H.pend.at){ launch(H.pend.pick,H.pend.last); H.pend=null; } }
      let any=false;
      if(play&&P.soulSlowT>Game.time){ P.x-=P.vx*dt*.5; P.z-=P.vz*dt*.5; }
      for(const o of souls){ if(o.st==='gone') continue; any=true; const gy=groundY(o.x,o.z); if(play) o.t+=dt;
        if(o.st==='orbit'||o.st==='tell'){ const a=H.a+o.i*6.283/N, r=R*H.k; o.x=P.x+Math.cos(a)*r; o.z=P.z+Math.sin(a)*r; }
        else if(o.st==='rush'&&play){ o.x+=o.vx*dt; o.z+=o.vz*dt; o.trav+=Math.hypot(o.vx,o.vz)*dt; if(Math.random()<.9) FX.spawn(o.x,gy+1,o.z,0,.4,0,.3,0xff8ab0,.25,0,true);
          if(Math.hypot(P.x-o.x,P.z-o.z)<.9&&P.y<gy+2.2){ const r=twHitP(1,o.x,o.z,{ub:true}); if(r==='hit'||r==='block'){ P.soulSlowT=Game.time+1; Game.dmgNums.push({x:P.x,y:P.y+2.4,z:P.z,n:'DRAINED',t:0,col:'#ff8ab0'}); FX.burst(o.x,gy+1,o.z,16,0xff8ab0,4,.3); o.st='gone'; scene.remove(o.m); continue; } }
          if(o.trav>o.len){ o.st='home'; o.t=0; } }
        else if(o.st==='home'&&play){ const dx=T.x-o.x, dz=T.z-o.z, d=Math.hypot(dx,dz)||1, v=14; o.x+=dx/d*v*dt; o.z+=dz/d*v*dt; if(Math.random()<.8) FX.spawn(o.x,gy+1,o.z,0,.4,0,.3,0xbfe8ff,.25,0,true);
          if(d<1||o.t>2){ if(d<1&&!T.hide){ twHurt(T,1.5,'bolt'); Game.dmgNums.push({x:o.x,y:gy+2.2,z:o.z,n:'FREED',t:0,col:'#bfe8ff'}); } FX.burst(o.x,gy+1,o.z,14,0xbfe8ff,4,.3); Sound.sfx('hit'); o.st='gone'; scene.remove(o.m); continue; } }
        const tl=o.st==='tell'; o.m.position.set(o.x,groundY(o.x,o.z)+1+(tl?Math.sin(o.t*40)*.15:Math.sin(H.a*3+o.i)*.15),o.z); o.m.scale.setScalar(tl?1.35:o.st==='rush'?1.2:1);
        o.m.material.color.setHex(o.st==='home'?0xbfe8ff:tl||o.st==='rush'?0xffb0c8:0xbfe8ff); }
      return any&&H.live; }, kill(){ souls.forEach(o=>scene.remove(o.m)); }});
  yield 1; T.cast=0; };

// =====================================================================
// PLANTED SCYTHES (Omar's solo fight): a purple scythe you hit bounces up and sticks in the ground, black and dull.
// It no longer flies back at Omar. At 12 planted, his next move is SCYTHE STORM: they all rise high above you and dive at you one
// after another, very fast. From up there you can only deflect one if you jump and catch it from the side; those fly back into Omar.
// =====================================================================
TW.planted=[];
function twPlantOn(b){ const F=TW.fight; return !!F&&F.kind==='solo'&&b.kind==='scythe'&&!b.rally&&!b.storm&&!!b.src&&b.src.who==='omar'; }
function twScytheMesh(dull){ const g=new THREE.Group(), piv=new THREE.Group(); g.add(piv);
  piv.add(new THREE.Mesh(new THREE.TorusGeometry(.6,.1,4,16,Math.PI*.95),new THREE.MeshBasicMaterial({color:0x0c0812})));
  piv.add(new THREE.Mesh(new THREE.TorusGeometry(.68,.035,4,16,Math.PI*.95),new THREE.MeshBasicMaterial({color:dull?0x1a1420:0xb06aff})));
  const pole=new THREE.Mesh(new THREE.BoxGeometry(.07,1.2,.07),new THREE.MeshBasicMaterial({color:0x2a1a30})); pole.position.set(.6,-.55,0); piv.add(pole); g.userData.tw=1; scene.add(g); return g; }
function twPlantFly(x,y,z){ const P=Player, a=Math.atan2(z-P.z,x-P.x), m=twScytheMesh(true), s={x,y,z,vx:Math.cos(a)*2.4,vz:Math.sin(a)*2.4,vy:7,spin:0};
  twHz({upd(dt){ const gy=groundY(s.x,s.z); if(s.done) return true; s.vy-=20*dt; s.x+=s.vx*dt; s.z+=s.vz*dt; s.y+=s.vy*dt; const c=twClampXZ(s.x,s.z,.6); s.x=c.x; s.z=c.z; s.spin+=dt*16; m.position.set(s.x,s.y,s.z); m.rotation.z=s.spin;
      if(s.vy<0&&s.y<=gy+.45){ s.done=true; s.y=gy+.45; m.position.set(s.x,s.y,s.z); m.rotation.set(0,rnd(0,6.28),2.3+rnd(-.3,.3)); m.userData.tw=0; m.userData.plant=1; FX.burst(s.x,gy+.2,s.z,12,0x2a1a30,3,.3,false); Sound.sfx('hit'); TW.planted.push({x:s.x,y:s.y,z:s.z,m}); return false; }
      return true; }, kill(){ if(!s.done) scene.remove(m); }}); }
(function(){ const rp=reflectProj; reflectProj=function(b,how){ if(!b.friendly&&!b.noParry&&twPlantOn(b)){ b.dead=1; Sound.sfx(how==='deflect'?'deflect':'parry'); if(how==='deflect') addSP(2); FX.spark(b.x,b.y,b.z); FX.burst(b.x,b.y,b.z,10,0x9a3aff,4,.2);
      Game.dmgNums.push({x:b.x,y:b.y+.6,z:b.z,n:'DEFLECT',t:0,col:'#9fe0ff'}); Game.slowT=Math.max(Game.slowT,.12); twPlantFly(b.x,b.y,b.z); return; } return rp.apply(this,arguments); }; })();
// planted scythes stay through a limit cut (twLCPrep clears the field), and go on a phase change, retry or leaving the fight
(function(){ const ch=twClearHz; twClearHz=function(){ if(!TW._lcPrep){ TW.planted.forEach(o=>scene.remove(o.m)); TW.planted=[]; } TW.storming=0; return ch.apply(this,arguments); }; })();
(function(){ const sw=twSweep; twSweep=function(){ TW.planted.forEach(o=>scene.remove(o.m)); TW.planted=[]; return sw.apply(this,arguments); }; })();
(function(){ const lp=twLCPrep; twLCPrep=function(){ TW._lcPrep=1; try{ return lp.apply(this,arguments); } finally{ TW._lcPrep=0; } }; })();
// a purple scythe that has flown past you turns and keeps coming back until you deflect it (or it hits you). Not during Lights Out.
(function(){ const ub=updateBolts; updateBolts=function(dt){ const P=Player;
    if(TW.fight&&Game.state==='play') for(const b of BOLTS){ if(b.dead||b.friendly||b.delay>0||!twPlantOn(b)) continue;
      if(!b.track){ if(TW.dark||b.src.state==='lc'||b.t<.15) continue; const dx=P.x-b.x, dz=P.z-b.z; if(dx*b.vx+dz*b.vz<0&&Math.hypot(dx,dz)<7){ b.track=Game.time; b.homing=2.4; b.ret=0; b.curl=0; } }
      if(b.track){ if(Game.time-b.track<25) b.life=b.t+3; if(Math.random()<.4) FX.spawn(b.x,b.y,b.z,0,0,0,.3,0xb06aff,.3,0,true); } }
    return ub(dt); }; })();
(function(){ const pk=twPick; twPick=function(T){ const F=TW.fight; if(T&&T.who==='omar'&&F&&F.kind==='solo'&&!TW.storming&&TW.planted.length>=12) return 'storm'; return pk.apply(this,arguments); }; })();
TWK.omar.storm=function*(T,ph){ const sp=twSp(T), list=TW.planted.splice(0), P=Player; TW.storming=1; T.cast=1.4; T.scythe=0;
  twBark('omar',"Every scythe you swatted away... I kept them. Look up.",true); Sound.sfx('howl'); Sound.sfx('charge');
  twBig('LOOK UP',{size:56,col:'#c08aff',y:UH*.24,dur:1.6,sub:'Keep running, or jump and hit them from the side.'});
  // they tear out of the ground and rise to a ring high above you
  const n=list.length; list.forEach((o,i)=>{ o.sx=o.x; o.sy=o.y; o.sz=o.z; const a=i*6.283/n; o.ox=Math.cos(a)*4.5; o.oz=Math.sin(a)*3.5; o.m.rotation.set(0,0,0); FX.burst(o.x,o.y,o.z,10,0x2a1a30,3,.3,false); });
  const H={t:0,live:true}; twHz({upd(dt,play){ if(play) H.t+=dt; const P2=Player, u=Math.min(1,H.t/.9), e=u*(2-u);
      for(const o of list){ if(o.gone) continue; const tx=P2.x+o.ox, tz=P2.z+o.oz, ty=groundY(P2.x,P2.z)+7.5; o.x=lerp(o.sx,tx,e); o.z=lerp(o.sz,tz,e); o.y=lerp(o.sy,ty,e); o.m.position.set(o.x,o.y,o.z); o.m.rotation.z+=dt*(6+u*14);
        if(Math.random()<.3) FX.spawn(o.x,o.y,o.z,0,0,0,.3,0x7a2aff,.25,0,true); }
      return H.live&&list.some(o=>!o.gone); }, kill(){ list.forEach(o=>{ if(!o.gone) scene.remove(o.m); }); }});
  yield 1.1;
  // one after another, very fast, straight at you
  for(const o of list){ const P2=Player, dx=P2.x-o.x, dy=(P2.y+1.1)-o.y, dz=P2.z-o.z, d=Math.hypot(dx,dy,dz)||1, v=26*sp; o.gone=1; scene.remove(o.m);
    const b=twBolt(T,{kind:'scythe',x:o.x,y:o.y,z:o.z,vx:dx/d*v,vy:dy/d*v,vz:dz/d*v,col:0x8a3aff,dmg:2,life:2}); b.storm=1; Sound.sfx('swing'); yield .26/sp; }
  H.live=false; yield .8; TW.storming=0; T.cast=0; };
