// =====================================================================
// THIRD-PERSON TEST (Ali's road, the Nathan fight): a behind-the-back camera like a 3D action game, in pixels.
// - the camera sits behind Ali and looks past him at Nathan (wider lens while it's on), easing as he moves;
// - soulslike lock-on: Ali always faces Nathan, his swings and Getsugas aim at him; W/S close in / back off,
//   A/D run circles around him (the radius holds); Ali's run is 3x his normal speed;
// - every flat sprite turns to face the camera (Sprite3D planes, Nathan's mech), and the flower tufts do too (a
//   billboard vertex shader, set the first time it's on);
// - Nathan is a training dummy for now: he stays put, never attacks, hits flash and show numbers but take no HP.
// - Ali's sprite facing is picked relative to this camera; his slash tears move with him.
// It's on while Ali fights Nathan in play (no cutscene camera); everything goes back when it's off.
// =====================================================================
const TPS={on:0,fov0:null,p:null,l:null,bb:0,off:null};
function tpsFight(){ return typeof NB!=='undefined'&&NB&&NB.alive&&ALI()&&!Game.mech&&L&&L.key==='flowers'; }
function tpsOn(){ return tpsFight()&&!NB.inv&&Game.state==='play'&&!Cam.cine&&!Game.script; }
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
(function(){ const un=updateNB; updateNB=function(dt){ if(tpsFight()){ NB.gen=null; NB.busyAtk=0; NB.cd=99; NB.dodgeCd=99; NB.leashCd=99; NB.dsh=null; } return un.apply(this,arguments); }; })();
(function(){ const nd=nbDamage; nbDamage=function(d,ult){ if(!tpsFight()||NB.inv) return nd.apply(this,arguments);
    NB.flash=.07; FX.spark(NB.x+rnd(-.6,.6),NB.y+rnd(1,3),NB.z+.3); Game.dmgNums.push({x:NB.x,y:NB.y+4,z:NB.z,n:'-'+(Math.round(d*100)/100),t:0,big:!!ult,col:'#9ff8ff'}); addSP(ult?0:.18); }; })();
// the flower tufts (instanced, flat planes): a billboard vertex shader
function tpsBillboardTufts(){ if(!L||!L.root) return; for(const m of L.root.children){ if(!m.isInstancedMesh||!m.material||m.material.userData.tpsBB) continue; const mat=m.material; mat.userData.tpsBB=1;
    mat.onBeforeCompile=sh=>{ sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>',`
      vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.0,0.0,0.0,1.0);
      float bsx = length(instanceMatrix[0].xyz) * (instanceMatrix[0].x < 0.0 ? -1.0 : 1.0);
      mvPosition.xy += vec2(transformed.x*bsx, transformed.y*length(instanceMatrix[1].xyz));
      gl_Position = projectionMatrix * mvPosition;`); };
    mat.customProgramCacheKey=()=>'tpsBB'; mat.needsUpdate=true; } }
// the camera
(function(){ const uc=updateCamera; updateCamera=function(dt){ const on=tpsOn();
    if(!on){ if(TPS.on){ TPS.on=0; if(TPS.fov0!=null){ camera.fov=TPS.fov0; camera.updateProjectionMatrix(); } for(const s of SPRITES) if(s&&s.mesh) s.mesh.rotation.set(TILT,0,0); if(NB&&NB.mesh) NB.mesh.rotation.set(TILT,0,0); TPS.p=null; } return uc.apply(this,arguments); }
    try{ const P=Player, [fx,fz,d]=tpsFwd();
      if(!TPS.on){ TPS.on=1; TPS.fov0=camera.fov; camera.fov=50; camera.updateProjectionMatrix(); tpsBillboardTufts(); }
      const back=6.2, hgt=2.7, py=Math.max(P.y,groundY(P.x,P.z)), want=[P.x-fx*back,py+hgt,P.z-fz*back], ly=lerp(py+1.4,NB.y+2.2,.5), look=[lerp(P.x,NB.x,.45),ly,lerp(P.z,NB.z,.45)];
      if(!TPS.p){ TPS.p=[camera.position.x,camera.position.y,camera.position.z]; TPS.l=look.slice(); }
      const k=1-Math.exp(-dt*7); for(let i=0;i<3;i++){ TPS.p[i]=lerp(TPS.p[i],want[i],k); TPS.l[i]=lerp(TPS.l[i],look[i],Math.min(1,k*1.6)); }
      const sh=FX.shake, sx=sh?rnd(-sh,sh)*.4:0, sy=sh?rnd(-sh,sh)*.4:0;
      camera.position.set(TPS.p[0]+sx,TPS.p[1]+sy,TPS.p[2]); camera.lookAt(TPS.l[0],TPS.l[1],TPS.l[2]);
      // keep the normal camera's state moving underneath, so leaving TPS doesn't jump far
      Cam.look.set(P.x,P.y,P.z);
      // every flat sprite faces the camera
      for(const s of SPRITES) if(s&&s.mesh) s.mesh.quaternion.copy(camera.quaternion);
      if(NB&&NB.mesh){ NB.mesh.quaternion.copy(camera.quaternion); NB.mesh.scale.x=1; }
    }catch(e){ console.error('tps camera',e); return uc.apply(this,arguments); } }; })();
// Ali's facing: picked relative to this camera (he faces Nathan, so you see his back), not the top-down screen
(function(){ const da=drawAliHD; drawAliHD=function(c,cx,by,f,s){ const P=Player; if(!tpsOn()||!TPS.p||!s||s.t!==P.t||s.anim!==P.anim) return da.apply(this,arguments);
    const a0=P.ang, fy=Math.atan2(TPS.l[2]-TPS.p[2],TPS.l[0]-TPS.p[0]), a=(P.ang||0)-fy-Math.PI/2;
    try{ P.ang=a; return da.call(this,c,cx,by,Math.cos(a)>=0?1:-1,s); } finally{ P.ang=a0; } }; })();
// his slash tears follow him (at this run speed they'd be left behind): their arcs are re-centred on him every frame
(function(){ const ap=twArcPts; twArcPts=function(){ const o=TPS.off; if(!o) return ap.apply(this,arguments); const a=[...arguments]; a[0]+=o[0]; a[1]+=o[1]; a[2]+=o[2]; return ap.apply(this,a); }; })();
(function(){ const sf=aliSlashFX; aliSlashFX=function(){ const n0=TW_GASH.length, r=sf.apply(this,arguments);
    try{ if(tpsOn()){ const P=Player, x0=P.x, y0=P.y, z0=P.z; for(let i=n0;i<TW_GASH.length;i++){ const g=TW_GASH[i], f=g.pts; g.pts=()=>{ TPS.off=[P.x-x0,P.y-y0,P.z-z0]; try{ return f(); } finally{ TPS.off=null; } }; } } }catch(e){ console.error('tps slash',e); }
    return r; }; })();
