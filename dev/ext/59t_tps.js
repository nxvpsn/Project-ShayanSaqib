// =====================================================================
// THIRD-PERSON TEST (Ali's road, the Nathan fight): a behind-the-back camera like a 3D action game, in pixels.
// - the camera sits behind Ali and looks past him at Nathan (wider lens while it's on), easing as he moves;
// - soulslike lock-on: Ali always faces Nathan, his swings and Getsugas aim at him; W/S close in / back off,
//   A/D run circles around him (the radius holds); Ali's run is 3x his normal speed;
// - every flat sprite turns to face the camera (Sprite3D planes, Nathan's mech), and the flower tufts do too (a
//   billboard vertex shader, set the first time it's on);
// - Nathan's base AI is off here: phase I (59v_nbp1.js) drives him.
// - Ali's sprite facing is picked relative to this camera; his slash tears move with him.
// It's on while Ali fights Nathan in play (no cutscene camera); everything goes back when it's off.
// =====================================================================
const TPS={FOV:55,on:0,fov0:null,p:null,l:null,bb:0,off:null,side:0,f:1,yaw:null};
function tpsFight(){ return typeof NB!=='undefined'&&NB&&NB.alive&&ALI()&&!Game.mech&&L&&L.key==='flowers'; }
function tpsOn(){ return tpsFight()&&!NB.inv&&(Game.state==='play'||Game.state==='dead')&&!Cam.cine&&!Game.script; }
function tpsFwd(){ const P=Player, dx=NB.x-P.x, dz=NB.z-P.z, d=Math.hypot(dx,dz)||1; return [dx/d,dz/d,d]; }
// movement: camera-relative (up = toward Nathan, right = circle right), 3x speed
(function(){ const iv=inputVec; inputVec=function(){ const v=iv.apply(this,arguments); if(!tpsOn()) return v;
    const [fx,fz]=tpsFwd(), rx=-fz, rz=fx, x=v[0], z=v[1]; return [(rx*x-fx*z)*3,(rz*x-fz*z)*3]; }; })();
// lock-on: face him; a pure strafe keeps the radius (a circle, not a spiral)
(function(){ const up=updatePlayer; updatePlayer=function(dt){ const on=tpsOn(), P=Player; let r0=0, raw=null;
    if(on){ r0=Math.hypot(P.x-NB.x,P.z-NB.z); raw=[(held.right?1:0)-(held.left?1:0)+Stick.x,(held.down?1:0)-(held.up?1:0)+Stick.z]; }
    const r=up.apply(this,arguments);
    try{ if(on&&tpsOn()){ if(Math.abs(raw[0])>.3&&Math.abs(raw[1])<.3&&!P.dash&&r0>1.5){ const d=Math.hypot(P.x-NB.x,P.z-NB.z)||1; P.x=NB.x+(P.x-NB.x)*r0/d; P.z=NB.z+(P.z-NB.z)*r0/d; }
        if(!P.dash){ P.ang=Math.atan2(NB.z-P.z,NB.x-P.x); } } }catch(e){ console.error('tps move',e); }
    return r; }; })();
// aim: the lock-on target
(function(){ const aa=twAimAng; twAimAng=function(){ if(tpsOn()){ const P=Player; return Math.atan2(NB.z-P.z,NB.x-P.x); } return aa.apply(this,arguments); }; })();
// Nathan, the training dummy
(function(){ const un=updateNB; updateNB=function(dt){ if(tpsFight()){ NB.gen=null; NB.busyAtk=0; NB.cd=99; NB.dodgeCd=99; NB.leashCd=99; } /* the base AI stays off; phase I (59v) drives him, and his quickboosts fly (NB.dsh is left alone) */ return un.apply(this,arguments); }; })();
(function(){ const nd=nbDamage; nbDamage=function(d,ult){ if(!tpsFight()||NB.inv) return nd.apply(this,arguments);
    NB.flash=.07; FX.spark(NB.x+rnd(-.6,.6),NB.y+rnd(1,3),NB.z+.3); Game.dmgNums.push({x:NB.x,y:NB.y+4,z:NB.z,n:'-'+(Math.round(d*100)/100),t:0,big:!!ult,col:'#9ff8ff'}); addSP(ult?0:.18); }; })();
// the flower tufts (instanced, flat planes): a billboard vertex shader
function tpsBillboardTufts(){ if(!L||!L.root) return; for(const m of L.root.children){ if(!m.isInstancedMesh||!m.material||m.material.userData.tpsBB) continue; const mat=m.material; mat.userData.tpsBB=1;
    mat.onBeforeCompile=sh=>{ sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>',`
      vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.0,0.0,0.0,1.0);
      float bsx = length(instanceMatrix[0].xyz) * (instanceMatrix[0].x < 0.0 ? -1.0 : 1.0);
      float nearK = clamp((-mvPosition.z - 2.5) / 4.0, 0.0, 1.0); /* tufts close to the lens shrink away: a clear line to Ali */
      mvPosition.xy += vec2(transformed.x*bsx, transformed.y*length(instanceMatrix[1].xyz)) * nearK;
      gl_Position = projectionMatrix * mvPosition;`); };
    mat.customProgramCacheKey=()=>'tpsBB2'; mat.needsUpdate=true; } }
// the camera
(function(){ const uc=updateCamera; updateCamera=function(dt){ const on=tpsOn();
    if(!on){ if(TPS.on){ TPS.on=0; if(TPS.fov0!=null){ camera.fov=TPS.fov0; camera.updateProjectionMatrix(); } TPS.yaw=null; for(const s of SPRITES) if(s&&s.mesh) s.mesh.rotation.set(TILT,0,0); if(NB&&NB.mesh) NB.mesh.rotation.set(TILT,0,0); TPS.p=null; if(TPS.ret) TPS.ret.visible=false; } return uc.apply(this,arguments); }
    try{ const P=Player, V=NB.mesh?NB.mesh.position:NB, ty=Math.atan2(V.z-P.z,V.x-P.x);
      if(!TPS.on){ TPS.on=1; TPS.fov0=camera.fov; camera.fov=TPS.FOV; camera.updateProjectionMatrix(); tpsBillboardTufts(); TPS.yaw=null; }
      // it follows where Nathan is drawn (a quickboost flies there; it doesn't jump) and turns at a damped rate, never snapping
      if(TPS.yaw==null) TPS.yaw=ty; TPS.yaw+=Math.atan2(Math.sin(ty-TPS.yaw),Math.cos(ty-TPS.yaw))*(1-Math.exp(-dt*3.2)); const fx=Math.cos(TPS.yaw), fz=Math.sin(TPS.yaw);
      // further back, aimed at Ali's chest a third of the way toward Nathan: Ali sits in the lower middle, Nathan above him
      const py=Math.max(P.y,groundY(P.x,P.z)), up=clamp(((V.y||0)-py-1.5)*.35,0,6), near=Math.max(0,4-Math.hypot(V.x-P.x,V.z-P.z))*.4; /* he's high up: tilt up to keep him in frame; right on top of Ali: ease back */
      TPS.sh=lerp(TPS.sh||0,(TPS.side||0)*.6,1-Math.exp(-dt*3)); /* a slight lead into a strafe */
      const back=8+near, hgt=3.5+up*.3, /* a touch further out: Nathan clears the top bar */ want=[P.x-fx*back-fz*TPS.sh,py+hgt,P.z-fz*back+fx*TPS.sh], ly=py+1.3+up, look=[lerp(P.x,V.x,.35),ly,lerp(P.z,V.z,.35)];
      if(!TPS.p){ TPS.p=[camera.position.x,camera.position.y,camera.position.z]; TPS.l=look.slice(); }
      const k=1-Math.exp(-dt*(TPS.fast||7)); /* TPS.fast: riding right behind Ali (the Full Counter's dash) */ for(let i=0;i<3;i++){ TPS.p[i]=lerp(TPS.p[i],want[i],k); TPS.l[i]=lerp(TPS.l[i],look[i],1-Math.exp(-dt*(TPS.fast||6))); }
      const sh=FX.shake, sx=sh?rnd(-sh,sh)*.4:0, sy=sh?rnd(-sh,sh)*.4:0;
      // TPS.kick: a punch toward the look point (hits, parries; negative = recoil), TPS.fovK: a lens punch; both spring back
      const kk=TPS.kick||0, kd=Math.hypot(TPS.l[0]-TPS.p[0],TPS.l[1]-TPS.p[1],TPS.l[2]-TPS.p[2])||1, kx=(TPS.l[0]-TPS.p[0])/kd*kk, ky=(TPS.l[1]-TPS.p[1])/kd*kk, kz=(TPS.l[2]-TPS.p[2])/kd*kk; TPS.kick=Math.abs(kk)<.01?0:kk*Math.exp(-dt*9);
      camera.position.set(TPS.p[0]+sx+kx,TPS.p[1]+sy+ky,TPS.p[2]+kz); camera.lookAt(TPS.l[0],TPS.l[1],TPS.l[2]);
      if(TPS.fovK){ TPS.fovK=Math.abs(TPS.fovK)<.05?0:TPS.fovK*Math.exp(-dt*7); if(!TPS.fast&&!(typeof NP1!=='undefined'&&NP1.seq)){ camera.fov=TPS.FOV+TPS.fovK+(TPS.fovRun||0); camera.updateProjectionMatrix(); } } else if(TPS.fovRun&&!TPS.fast&&!(typeof NP1!=='undefined'&&NP1.seq)){ camera.fov=TPS.FOV+TPS.fovRun; camera.updateProjectionMatrix(); } /* TPS.fovRun: the lens opens a little with Ali's speed */
      // the lock-on marker: a slow cyan ring on the ground under Nathan (and a diamond over him, drawn in the UI)
      if(!TPS.ret){ const g=new THREE.Group(); for(const [r0,r1,op] of [[1.55,1.7,.85],[1.85,1.9,.45]]){ const m=new THREE.Mesh(new THREE.RingGeometry(r0,r1,48,1,0,Math.PI*1.7),new THREE.MeshBasicMaterial({color:0x7fe8ff,transparent:true,opacity:op,depthWrite:false,side:THREE.DoubleSide,fog:false})); m.rotation.x=-Math.PI/2; g.add(m); } scene.add(g); TPS.ret=g; }
      TPS.ret.visible=true; TPS.ret.position.set(V.x,groundY(V.x,V.z)+.06,V.z); TPS.ret.rotation.y+=dt*.8;
      // keep the normal camera's state moving underneath, so leaving TPS doesn't jump far
      Cam.look.set(P.x,P.y,P.z);
      // every flat sprite faces the camera
      for(const s of SPRITES) if(s&&s.mesh) s.mesh.quaternion.copy(camera.quaternion);
      if(NB&&NB.mesh){ NB.mesh.quaternion.copy(camera.quaternion); NB.mesh.scale.x=1; }
    }catch(e){ console.error('tps camera',e); return uc.apply(this,arguments); } }; })();
// Ali's facing, relative to this camera: strafing shows his east/west run (screen right/left, held with hysteresis so it
// can't flicker); otherwise he faces away toward Nathan with a steady side (a facing right on the left/right boundary used
// to flip its mirror every frame: the random direction swapping)
(function(){ const da=drawAliHD; drawAliHD=function(c,cx,by,f,s){ const P=Player; if(!tpsOn()||!TPS.p||!s||s.t!==P.t||s.anim!==P.anim) return da.apply(this,arguments);
    const sx=(held.right?1:0)-(held.left?1:0)+(Stick.x||0); if(Math.abs(sx)>.35) TPS.side=Math.sign(sx); else if(Math.abs(sx)<.15) TPS.side=0;
    const a0=P.ang, fy=Math.atan2(TPS.l[2]-TPS.p[2],TPS.l[0]-TPS.p[0]); let a=(P.ang||0)-fy-Math.PI/2;
    if(TPS.side&&P.anim==='run') a=TPS.side>0?0:Math.PI; /* the side run */
    const ca=Math.cos(a); if(ca>.25) TPS.f=1; else if(ca<-.25) TPS.f=-1; const ff=TPS.f||1;
    try{ P.ang=a; return da.call(this,c,cx,by,ff,s); } finally{ P.ang=a0; } }; })();
// his slash tears follow him (at this run speed they'd be left behind): their arcs are re-centred on him every frame
(function(){ const ap=twArcPts; twArcPts=function(){ const o=TPS.off; if(!o) return ap.apply(this,arguments); const a=[...arguments]; a[0]+=o[0]; a[1]+=o[1]; a[2]+=o[2]; return ap.apply(this,a); }; })();
(function(){ const sf=aliSlashFX; aliSlashFX=function(){ const n0=TW_GASH.length, r=sf.apply(this,arguments);
    try{ if(tpsOn()){ const P=Player, x0=P.x, y0=P.y, z0=P.z; for(let i=n0;i<TW_GASH.length;i++){ const g=TW_GASH[i], f=g.pts; g.pts=()=>{ TPS.off=[P.x-x0,P.y-y0,P.z-z0]; try{ return f(); } finally{ TPS.off=null; } }; } } }catch(e){ console.error('tps slash',e); }
    return r; }; })();
// the lock-on diamond over Nathan (screen space, so it reads at any distance)
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ if(!tpsOn()||!TPS.on||!NB||!NB.mesh||Game.letter>.5) return; const V=NB.mesh.position, q=toScreen(V.x,V.y+4.9,V.z); if(q[2]>1) return;
      const t=performance.now()/1000, s=7+Math.sin(t*5)*1.2; D.save(); D.translate(q[0],q[1]); D.rotate(Math.PI/4); D.strokeStyle='rgba(6,16,28,.8)'; D.lineWidth=4; D.strokeRect(-s,-s,s*2,s*2); D.strokeStyle='#7fe8ff'; D.lineWidth=2; D.strokeRect(-s,-s,s*2,s*2); D.restore(); }catch(e){ console.error('tps marker',e); } }; })();
// ---------- the endless field (this fight only) ----------
// The flower field tiles: its ground, flowers and stones are cloned into a 3x3 grid of copies that follows Ali (identical copies,
// so crossing into the next one is seamless), the ground lookup wraps (no walls at the old edges), the sky and far planes
// follow him (they stay on the horizon), and the fog comes in a little so the outer copies' edges never show.
const TPI={on:0,lv:null,tiles:[],ground:[],sky:[],W:0,D:0,fog:null};
function tpiSetup(){ const W=L.w, Dd=L.d; Object.assign(TPI,{lv:L,W,D:Dd,ground:[],sky:[]}); TPI.tiles.forEach(g=>scene.remove(g)); TPI.tiles=[];
  const box=new THREE.Box3();
  for(const c of L.root.children){ let ground=false; if(!c.isPoints&&!c.isSprite){ box.setFromObject(c); ground=box.min.x>-6&&box.max.x<W+6&&box.min.z>-6&&box.max.z<Dd+6&&box.max.y<12; }
    if(ground) TPI.ground.push(c); else TPI.sky.push({o:c,x:c.position.x,z:c.position.z}); }
  for(let k=0;k<9;k++){ const g=new THREE.Group(); for(const c of TPI.ground) g.add(c.clone()); scene.add(g); TPI.tiles.push(g); } }
function tpiOn(){ if(TPI.lv!==L) tpiSetup(); TPI.on=1; for(const c of TPI.ground) c.visible=false; TPI.tiles.forEach(g=>g.visible=true);
  if(scene.fog){ TPI.fog=[scene.fog.near,scene.fog.far]; scene.fog.near=30; scene.fog.far=100; } }
function tpiOff(){ TPI.on=0; for(const c of TPI.ground) c.visible=true; TPI.tiles.forEach(g=>g.visible=false); for(const s of TPI.sky) s.o.position.set(s.x,s.o.position.y,s.z);
  if(scene.fog&&TPI.fog){ scene.fog.near=TPI.fog[0]; scene.fog.far=TPI.fog[1]; TPI.fog=null; } }
function tpiUpdate(){ const P=Player, W=TPI.W, Dd=TPI.D, ci=Math.floor(P.x/W), cj=Math.floor(P.z/Dd); let k=0;
  for(let i=-1;i<=1;i++) for(let j=-1;j<=1;j++) TPI.tiles[k++].position.set((ci+i)*W,0,(cj+j)*Dd);
  for(const s of TPI.sky) s.o.position.set(s.x+P.x-W/2,s.o.position.y,s.z+P.z-Dd/2); }
(function(){ const uc=updateCamera; updateCamera=function(){ const r=uc.apply(this,arguments); try{ const on=tpsFight()&&L&&L.key==='flowers';
      if(on){ if(!TPI.on) tpiOn(); tpiUpdate(); } else if(TPI.on) tpiOff(); }catch(e){ console.error('endless field',e); TPI.on=0; } return r; }; })();
// the ground lookup wraps around the field while it is endless
(function(){ const ch=cellH; cellH=function(x,z){ if(TPI.on&&TPI.W){ x=((x%TPI.W)+TPI.W)%TPI.W; z=((z%TPI.D)+TPI.D)%TPI.D; } return ch(x,z); }; })();
