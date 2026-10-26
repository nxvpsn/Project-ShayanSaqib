// =====================================================================
// OMAR, PHASE III: TEAR. A rift in the sky, an orb that fires black lasers, and six scars on the ground that are portals.
// One ground scar leads up to the rift (it glows dull red whenever the orb takes aim, the laser light shining through); you fly out
// of the rift toward the orb (2.4 units away) with your speed, and slash it: 2 hits. Your double jump comes back on the way out.
// The other five lead high into the sky: you fall, Omar catches you halfway, summons a black hole and throws you into it (twTearTrap).
// =====================================================================
const TW_TEAR={h:6.5,life:14,every:2,aim:.7,scars:6,orbOff:2.4};
function texScar(){ if(TW._scarTex) return TW._scarTex; const W=64,H=160, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d');
  const path=()=>{ c.beginPath(); c.moveTo(32,4); const pts=[[38,30],[29,52],[40,78],[27,104],[37,128],[32,156],[26,128],[31,104],[22,78],[34,52],[25,30]]; pts.forEach(([x,y])=>c.lineTo(x,y)); c.closePath(); };
  c.save(); c.shadowColor='#9a3aff'; c.shadowBlur=16; c.fillStyle='#9a3aff'; path(); c.fill(); c.restore(); c.fillStyle='#05010a'; c.save(); c.translate(32,80); c.scale(.72,.94); c.translate(-32,-80); path(); c.fill(); c.restore();
  const t=new THREE.CanvasTexture(cv); TW._scarTex=t; return t; }
function twTearBeam(col,rad,add){ const g=new THREE.CylinderGeometry(rad,rad,1,8,1,true); g.rotateX(Math.PI/2); g.translate(0,0,.5);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:1,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,depthWrite:false,fog:false})); m.userData.tw=1; scene.add(m); return m; }
// scars never overlap (entry radius 1.4): the spacing relaxes from 3.6 down to 3 if the arena is crowded, and they keep away from you
function twTearSpots(n,avoid){ const A=twLock(), B=twBounds(), P=Player, out=[];
  for(const [sp,far,box] of [[3.6,3.2,A],[3.2,2.8,A],[3,2.5,B],[3,1.5,B]]) for(let g=0;g<400&&out.length<n;g++){ const x=rnd(box.x0+2,box.x1-2), z=rnd(box.z0+2,box.z1-2);
    if(Math.hypot(x-P.x,z-P.z)<far||Math.hypot(x-avoid.x,z-avoid.z)<2.5||out.some(o=>Math.hypot(o.x-x,o.z-z)<sp)) continue; out.push({x,z}); }
  return out; }
function twTearOpen(R,x,y,z,sky){ const m=twBB(texScar(),sky?1.54:1.26,sky?3.64:3.08), gl=twGlow(0x5a1010,3.6); m.userData.tw=1; m.rotation.x=TILT; m.position.set(x,y,z); m.scale.set(.01,1,1); gl.position.set(x,y,z+.05); gl.material.opacity=0;
  const s={x,y,z,m,gl,k:0,sky,link:null}; if(sky) R.skyScar=s; else R.scars.push(s); Sound.sfx('tear'); FX.burst(x,y,z,24,0x9a3aff,4,.35); FX.burst(x,y,z,16,0x05010a,3,.35,false); return s; }
TWK.omar.tear=function*(T,ph){ if(TW.tear){ yield .2; return; } const sp=twSp(T), A=twLock(), c=twCenter();
  twBark('omar',"I will tear this world... along the dotted line.",true);
  const sx=clamp(c.x+rnd(-3,3),A.x0+3,A.x1-3), sz=clamp(c.z+rnd(-2.5,.5),A.z0+3,A.z1-3), sgy=groundY(sx,sz);
  const R=TW.tear={x:sx,y:sgy+TW_TEAR.h,z:sz,scars:[],skyScar:null,orb:null,t:0,T,next:0,aim:null,done:0,linked:false};
  twTearRun(R);
  // up into the sky: the first scar
  FX.burst(T.x,T.y+1.4,T.z,22,0x140a1a,4,.45,false); T.hide=1; Sound.sfx('dash'); yield .25;
  T.x=sx-1.3; T.z=sz+.2; T.hy=TW_TEAR.h-.9; T.y=sgy+T.hy; T.mv=null; T.hide=0; T.scythe=1; T.lockF=1; T.f=1; FX.burst(T.x,T.y+1.4,T.z,22,0x140a1a,4,.45,false); yield .35/sp;
  T.swing=1; Sound.sfx('swing'); twTearOpen(R,sx,R.y,sz,true); yield .45/sp; T.swing=0;
  // six scars on the ground
  for(const p of twTearSpots(TW_TEAR.scars,{x:sx,z:sz})){ FX.burst(T.x,T.y+1.4,T.z,22,0x140a1a,4,.45,false); T.hide=1; Sound.sfx('dash'); yield .14;
    T.hy=1.3; T.x=p.x+1.1; T.z=p.z+.2; T.y=groundY(T.x,T.z)+T.hy; T.hide=0; T.f=-1; yield .18/sp; T.swing=1; Sound.sfx('swing'); twTearOpen(R,p.x,groundY(p.x,p.z)+1.2,p.z,false); yield .2/sp; T.swing=0; }
  // one leads to the rift, the other five lead very high up
  const k=Math.floor(Math.random()*R.scars.length); R.scars.forEach((s,i)=>{ s.link=i===k?'sky':'fake'; }); R.linked=true;
  T.hy=1.3; T.lockF=0; T.scythe=0; T.hide=0; twBark('omar',"One scar goes to the sky. The others go much, much higher. Pick wisely.",true); yield .5; };
function twTearRun(R){ twHz({upd(dt,play){ const P=Player, T=R.T; if(play) R.t+=dt;
    for(const s of [R.skyScar,...R.scars]){ if(!s) continue; s.k=Math.min(1,s.k+dt*5)*(R.done?Math.max(0,1-R.done*3):1); s.m.scale.set(Math.max(.01,s.k),Math.max(.01,s.k),1); }
    if(R.done){ if(play) R.done+=dt; return R.done<.4; }
    // the orb comes out of the sky scar a second after it opens
    if(R.skyScar&&!R.orb&&R.t>=1){ R.born=R.t; const m=new THREE.Mesh(new THREE.SphereGeometry(.5,16,12),new THREE.MeshBasicMaterial({color:0x07020c})); m.userData.tw=1; scene.add(m); const g=twGlow(0x8a2aff,2.6);
      const c=twCenter(), side=c.x>=R.x?1:-1; R.orb={x:R.x,y:R.y,z:R.z+.35,tx:R.x+side*TW_TEAR.orbOff,hp:2,m,g,flash:0,em:0}; R.next=R.t+.8; Sound.sfx('void'); FX.burst(R.x,R.y,R.z,30,0x8a2aff,4,.35); }
    const O=R.orb;
    if(O){ O.em=Math.min(1,O.em+dt*2); O.x=lerp(O.x,O.tx,Math.min(1,dt*4)); O.flash=Math.max(0,O.flash-dt); const s=.4+.6*O.em; O.m.scale.setScalar(s*(1+O.flash)); O.m.position.set(O.x,O.y+Math.sin(R.t*2)*.12,O.z); O.g.position.copy(O.m.position); O.g.scale.setScalar(2.6*s+Math.sin(R.t*9)*.2);
      if(Math.random()<.5) FX.spawn(O.x+rnd(-.6,.6),O.y+rnd(-.6,.6),O.z,0,rnd(-.3,.3),0,.5,Math.random()<.5?0x8a2aff:0x140a1a,.25,0,true);
      if(R.t-R.born>TW_TEAR.life){ twTearClose(R,false); return true; }
      // the laser: a skinny red aiming light, then a black beam with a purple edge
      if(play&&!R.aim&&R.t>=R.next){ R.next=R.t+TW_TEAR.every; R.aim={t:0,tx:P.x,tz:P.z,m:twTearBeam(0xff2020,.035,true)}; Sound.sfx('charge'); }
      if(R.aim){ const a=R.aim; if(play) a.t+=dt; const B=TW.bh&&TW.bh.live?TW.bh:null; a.hole=!!B; // during Collapse the orb fires into the black hole
        if(B){ a.tx=B.x; a.ty=groundY(B.x,B.z)+1.3; a.tz=B.z; } else if(a.t<TW_TEAR.aim-.2){ a.tx=P.x; a.ty=P.y+.9; a.tz=P.z; } // aimed through your body, on into the ground
        const gy=groundY(a.tx,a.tz), k=B?1:(O.y-gy)/Math.max(.3,O.y-a.ty), ex=O.x+(a.tx-O.x)*k, ez=O.z+(a.tz-O.z)*k, ey=B?a.ty:gy; twBeamTo(a.m,O.x,O.y,O.z,ex,ey,ez,1); a.m.material.opacity=.5+.5*Math.sin(a.t*40);
        const sk=R.scars.find(s=>s.link==='sky'); if(sk){ sk.gl.material.opacity=.55+.25*Math.sin(a.t*30); } // the laser light shows through the scar that leads to it
        if(a.t>=TW_TEAR.aim){ scene.remove(a.m); R.aim=null; if(sk) sk.gl.material.opacity=0; twTearFire(O,ex,ey,ez,a.hole); } }
      // portals: you
      if(P.riftFall&&P.onGround) P.riftFall=0; // coming back down from the rift, the scars ignore you until you land
      if(R.linked&&play&&!Game.script&&!(P.portalCd>Game.time)&&!P.hidden&&!P.riftFall) { let best=null, bd=1.4; for(const s of R.scars){ const d=Math.hypot(P.x-s.x,P.z-s.z); if(d<bd&&Math.abs(P.y+.8-s.y)<1.6){ bd=d; best=s; } } if(best) twTearEnter(R,best); }
      // portals: fireballs (each goes through once)
      if(R.linked) for(const f of TW.fb||[]){ if(f.life<=0||f.ported) continue; for(const s of R.scars){ if(Math.hypot(f.x-s.x,f.y-s.y,f.z-s.z)<.9){ f.ported=1; twTearFb(R,s,f); break; } } }
      // fireballs hitting the orb
      for(const f of TW.fb||[]){ if(f.life>0&&Math.hypot(f.x-O.x,f.y-O.y,f.z-O.z)<.6+f.r){ f.life=0; twFireballHit(f,f.x,f.y,f.z); twTearOrbHit(R,f.big?2:1); if(R.done) return true; } } }
    return true; }, kill(){ for(const s of [R.skyScar,...R.scars]){ if(s){ scene.remove(s.m); scene.remove(s.gl); } } if(R.orb){ scene.remove(R.orb.m); scene.remove(R.orb.g); } if(R.aim) scene.remove(R.aim.m); if(TW.tear===R) TW.tear=null; }}); }
function twTearFire(O,tx,ty,tz,hole){ const P=Player, dx=tx-O.x, dy=ty-O.y, dz=tz-O.z, L=Math.hypot(dx,dy,dz)||1, core=twTearBeam(0x05010a,.17,false), edge=twTearBeam(0x9a3aff,.3,true);
  Sound.sfx('beam'); shake(.25); FX.burst(tx,ty+.1,tz,20,0x8a2aff,4,.3); FX.burst(tx,ty+.1,tz,14,0x05010a,3,.3,false);
  const k={t:0}; twHz({upd(dt){ k.t+=dt; const w=Math.max(.01,1-k.t/.3); twBeamTo(core,O.x,O.y,O.z,tx,ty,tz,w); twBeamTo(edge,O.x,O.y,O.z,tx,ty,tz,w); return k.t<.3; }, kill(){ scene.remove(core); scene.remove(edge); }});
  // distance from your body to the beam
  const bx=P.x-O.x, by=P.y+.9-O.y, bz=P.z-O.z, u=clamp((bx*dx+by*dy+bz*dz)/(L*L),0,1), d=Math.hypot(bx-dx*u,by-dy*u,bz-dz*u); if(d<.6&&!hole) twHitP(2,tx,tz,{ub:true}); }
function twTearEnter(R,s){ const P=Player, sp=Math.hypot(P.vx,P.vz), ux=sp>.5?P.vx/sp:Math.cos(P.ang||0), uz=sp>.5?P.vz/sp:Math.sin(P.ang||0); P.portalCd=Game.time+.6;
  FX.burst(P.x,P.y+1,P.z,26,0x9a3aff,5,.35); FX.burst(P.x,P.y+1,P.z,16,0x05010a,4,.35,false); Sound.sfx('void');
  if(s.link==='sky'){ // out of the rift and on toward the orb (2.4 units away) with at least 11/s and the rest of your dash, so you fly past it
    const O=R.orb||R, dx=O.x-R.x, dz=O.z-R.z, d=Math.hypot(dx,dz)||1, vx=dx/d, vz=dz/d, v=Math.max(11,sp), e=twClampXZ(R.x,R.z,.5); P.x=e.x; P.z=e.z; P.y=R.y-1.1;
    P.ang=Math.atan2(vz,vx); P.vx=vx*v; P.vz=vz*v; P.vy=Math.max(P.vy,4.5); P.jumps=1; P.onGround=false; P.coyote=0; P.jbuf=0; P.riftFall=1;
    Game.dmgNums.push({x:P.x,y:P.y+2.4,z:P.z,n:'INTO THE RIFT',t:0,col:'#c08aff'}); FX.burst(P.x,P.y+1,P.z,26,0x9a3aff,5,.35); }
  else run(function*(){ yield* twTearTrap(R); }); }
function twTearFb(R,s,f){ const sp=Math.hypot(f.vx,f.vy,f.vz)||15;
  if(s.link==='sky'){ const O=R.orb; f.x=R.x; f.y=R.y; f.z=R.z; const dx=O.x-f.x, dy=O.y-f.y, dz=O.z-f.z, d=Math.hypot(dx,dy,dz)||1; f.vx=dx/d*sp; f.vy=dy/d*sp; f.vz=dz/d*sp; f.life=Math.max(f.life,.6); FX.burst(f.x,f.y,f.z,14,0x9a3aff,3,.25); return; }
  // a fake scar swallows it (it comes out somewhere far above)
  f.life=0; FX.burst(s.x,s.y,s.z,18,0x9a3aff,4,.3); Sound.sfx('void'); }
function twTearOrbHit(R,n){ const O=R.orb; if(!O||R.done) return; O.hp-=n; O.flash=.25; FX.hitstop=Math.max(FX.hitstop,.09); Sound.sfx('hit'); FX.burst(O.x,O.y,O.z,20,0x9a3aff,5,.3); Game.dmgNums.push({x:O.x,y:O.y+1,z:O.z,n:Math.max(0,O.hp)>0?'CRACK':'SHATTERED',t:0,big:O.hp<=0,col:'#d0a0ff'});
  if(O.hp<=0) twTearClose(R,true); }
function twTearClose(R,broken){ if(R.done) return; R.done=.001; if(R.aim){ scene.remove(R.aim.m); R.aim=null; }
  const O=R.orb; if(O){ FX.burst(O.x,O.y,O.z,broken?60:20,0x8a2aff,broken?8:4,.45); FX.burst(O.x,O.y,O.z,30,0x05010a,6,.4,false); scene.remove(O.m); scene.remove(O.g); R.orb=null; }
  if(broken){ Sound.sfx('shatter'); Sound.sfx('crossboom'); shake(.6); twBark('omar',"My rift! I had a whole aesthetic going!",true); } else Sound.sfx('void'); }
// slashing the orb in the air
(function(){ const mh=meleeHits; meleeHits=function(x,z,y,rad,ang,arc,dmg,set){ let any=mh(x,z,y,rad,ang,arc,dmg,set); const R=TW.tear, O=R&&R.orb;
    if(O&&!R.done&&!set.has(O)){ const d=Math.hypot(O.x-x,O.z-z), dv=O.y-(y+1); if(d<rad+.7&&Math.abs(dv)<1.7&&(d<1.4||angDiff(Math.atan2(O.z-z,O.x-x),ang)<arc)){ set.add(O); twTearOrbHit(R,1); any=true; } }
    return any; }; })();
// up by the orb, auto-aim (swings, fireballs) goes for the orb, not for Omar on the ground below: a swing must not turn your dash around
(function(){ const nf=nearestFoe; nearestFoe=function(r){ const R=TW.tear, O=R&&R.orb, P=Player;
    if(O&&!R.done&&P.y>groundY(P.x,P.z)+3&&Math.hypot(O.x-P.x,O.z-P.z)<Math.max(r,4)) return O; return nf.apply(this,arguments); }; })();
// Omar never stays up in the air if the tear is interrupted
(function(){ const tl=twLCPrep; twLCPrep=function(T){ if(T&&T.who==='omar') T.hy=1.3; return tl.apply(this,arguments); }; })();

// ---------- the fake scars: you come out three screens up, fall, Omar catches you halfway, summons a black hole and throws you into it ----------
function twCamRig(){ const z=Cam.zoom*(Game.boss?1.5:Game.arena&&Game.arena.lock?1.38:1.2), CP=L.cam||{y:CAM_OFF.y,z:CAM_OFF.z,up:0}; return {oy:CP.y*z,oz:CP.z*z,up:CP.up||0,vis:2*Math.hypot(CP.y*z,CP.z*z)*Math.tan((camera.fov||45)*Math.PI/360)}; }
function twCamAt(C,x,y,z){ cineSet(x,y+.8+C.up+C.oy,z+C.oz,x,y+.8+C.up,z); } // the normal gameplay framing, centred on (x,y,z)
function* twTearTrap(R){ const P=Player, T=R.T, C=twCamRig(), gy0=groundY(P.x,P.z), H=Math.min(80,3*C.vis), x=P.x, z=P.z, dt=1/60;
  const inv0=P.inv; P.inv=99; P.cineFly=true; P.cineAnim='fall'; P.dash=0; P.atk=null; P.vx=P.vz=P.vy=0; Game.letterTo=.35;
  FX.burst(P.x,P.y+1,P.z,26,0x9a3aff,5,.35); Sound.sfx('void'); P.y=gy0+H; twCamAt(C,x,P.y,z); FX.burst(x,P.y+1,z,30,0x9a3aff,5,.4);
  Game.dmgNums.push({x,y:P.y+2.4,z,n:'WRONG SCAR',t:0,big:true,col:'#ff8a9a'}); Sound.sfx('whoosh');
  // falling, the camera on you
  let vy=0; while(P.y>gy0+H/2){ vy=Math.max(vy-24*dt,-20); P.y+=vy*dt; twCamAt(C,x,P.y,z); yield wait(dt); }
  // Omar blinks up and catches you
  const hy=P.y; FX.burst(T.x,T.y+1.4,T.z,22,0x140a1a,4,.45,false); T.hide=0; T.x=x+.9; T.z=z+.1; T.hy=hy-groundY(T.x,T.z); T.y=hy; T.mv=null; T.lockF=1; T.f=-1; T.scythe=1;
  FX.burst(T.x,T.y+1.4,T.z,30,0x140a1a,5,.45,false); Sound.sfx('dash'); Sound.sfx('slam'); shake(.4); P.cineAnim='hurt';
  twBark('omar',"Caught you. You fell for it. Literally.",true); for(let t=0;t<.6;t+=dt){ twCamAt(C,x,hy,z); yield wait(dt); }
  // the black hole opens on the ground below: the camera goes down to watch it form, then comes back up
  const b=twClampXZ(x+rnd(-2.5,2.5),z+rnd(-2,2),2), bgy=groundY(b.x,b.z), core=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:0x000000})), halo=twGlow(0x8a2aff,1);
  core.userData.tw=1; core.scale.setScalar(.01); core.position.set(b.x,bgy+1.3,b.z); halo.position.copy(core.position); scene.add(core); const BH={k:0,t:0,live:true};
  Game.fxUpd.push(d=>{ if(!BH.live){ BH.k=Math.max(0,BH.k-d*3); } else BH.k=Math.min(1,BH.k+d*1.6); BH.t+=d; core.scale.setScalar(Math.max(.01,1.6*BH.k)); halo.scale.setScalar(6*BH.k+Math.sin(BH.t*20)*.3);
    for(let i=0;i<4;i++){ const a=rnd(0,6.28), r=rnd(2,6); FX.spawn(b.x+Math.cos(a)*r,bgy+1.3+rnd(-1,1),b.z+Math.sin(a)*r,-Math.cos(a)*r*1.6,0,-Math.sin(a)*r*1.6,.5,i%2?0x8a2aff:0x1a0a2a,.3,0,i%2===0); }
    if(!BH.live&&BH.k<=0){ scene.remove(core); scene.remove(halo); return false; } return true; });
  Sound.sfx('void'); Sound.sfx('drone'); const look=()=>({px:b.x,py:bgy+.8+C.up+C.oy,pz:b.z+C.oz,lx:b.x,ly:bgy+.8+C.up,lz:b.z});
  { const L0={...Cam.cine}, L1=look(); for(let t=0;t<.7;t+=dt){ const u=t/.7, e=u*u*(3-2*u); for(const k in L1) Cam.cine[k]=lerp(L0[k],L1[k],e); yield wait(dt); } }
  for(let t=0;t<.6;t+=dt){ yield wait(dt); }
  twBark('omar',"Down you go.",true);
  { const L0={...Cam.cine}; for(let t=0;t<.5;t+=dt){ const u=t/.5, e=u*u*(3-2*u); twCamAt(C,x,hy,z); const L1={...Cam.cine}; for(const k in L1) Cam.cine[k]=lerp(L0[k],L1[k],e); yield wait(dt); } }
  // the throw: hard and fast, the camera glued to you
  T.swing=1; Sound.sfx('swing'); Sound.sfx('whoosh'); shake(.5); const sx=x, sy=hy, sz=z, ex=b.x, ey=bgy+.6, ez=b.z;
  for(let t=0;t<.55;t+=dt){ const u=Math.min(1,t/.55), e=u*u; P.x=lerp(sx,ex,e); P.y=lerp(sy,ey,e); P.z=lerp(sz,ez,e); FX.spawn(P.x,P.y+1,P.z,0,0,0,.3,0x8a3aff,.4,0,true); twCamAt(C,P.x,P.y,P.z); yield wait(dt); }
  // impact: 3 hearts, then spat out three times as far and as high as Collapse does
  T.swing=0; T.lockF=0; T.scythe=0; FX.burst(T.x,T.y+1.4,T.z,22,0x140a1a,4,.45,false); T.hy=1.3; const tp=twClampXZ(b.x+rnd(-5,5),b.z-4,1); T.x=tp.x; T.z=tp.z; T.y=groundY(tp.x,tp.z)+1.3;
  BH.live=false; FX.burst(P.x,P.y+1,P.z,60,0x8a2aff,8,.45); Sound.sfx('chomp'); Sound.sfx('crossboom'); shake(1.2); FX.flash=.5; grade.uniforms.flashCol.value.set(.6,.3,1); impactFrame([[2,2],[1,2]]);
  P.cineFly=false; P.cineAnim=null; P.inv=0; P.dash=0; Cam.cine=null; Game.letterTo=0; Game.dmgNums.push({x:P.x,y:P.y+2.6,z:P.z,n:'EATEN',t:0,big:true,col:'#c08aff'});
  const B=twBounds(); let best=0, ba=0; for(let k=0;k<4;k++){ const a=Math.PI/4+k*Math.PI/2, ux=Math.cos(a), uz=Math.sin(a), room=Math.min(ux>0?(B.x1-P.x)/ux:(B.x0-P.x)/ux,uz>0?(B.z1-P.z)/uz:(B.z0-P.z)/uz); if(room>best){ best=room; ba=a; } }
  hurtPlayer(6,b.x,b.z); const air=1.36; P.vx=Math.cos(ba)*22.5/air; P.vz=Math.sin(ba)*22.5/air; P.vy=16.3; P.onGround=false; P.hurt=air; P.bhLaunch=Game.time+air; P.portalCd=Game.time+air+1.5; }
