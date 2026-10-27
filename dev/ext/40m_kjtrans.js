// =====================================================================
// HE'S DAY OLD KOJIMA'S PHASE TRANSITIONS (no more fade to black; patched into toPhase2/execution by build.py, both roads):
// - into phase II (kjToLake): his glasses turn red and glow, the camera dives into his eye, a red iris swallows the
//   screen and its pupil opens on the blood lake (the hole opens where the red moon hangs);
// - into phase III (kjToFlowers): he stomps; the lake (a snapshot of the last frame) splashes away from his feet in a
//   jagged crown with droplets, revealing the flower field and the night sky underneath.
// The overlays draw on the UI canvas (KJT, drawn after everything else); the snapshot is taken right after the 3D render.
// =====================================================================
let KJT=null;
TW_SFX.splash=function(){ Sound.hiss(900,.5,.22,'bandpass'); Sound.hiss(2600,.35,.12,'bandpass',.05); Sound.tone('sine',90,40,.5,.25); };
// his eyes in the world (from the cells drawKojimaCast recorded: offsets in sprite pixels, 28 px per unit)
function kjEyeWorld(B){ const f=B.f||1, E=B._eyes||[[3,-90],[15,-90]], y0=B.y+(B.hover||0);
  return E.map(([dx,dy])=>({x:B.x+(dx+2)*f/28, y:y0-(dy-1)/28, z:B.z+.06})); }
function* kjToLake(){ const B=Game.boss; if(!B){ enterArena('lake',2); return; }
  B.redEye=1; Sound.sfx('heartbeat'); const eyes=kjEyeWorld(B), gl=[];
  try{ for(const e of eyes){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xff1a2a,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:0})); s.position.set(e.x,e.y,e.z); s.scale.set(.1,.1,1); s.userData.temp=1; scene.add(s); gl.push(s); } }catch(e){}
  const glow={k:0}; Game.fxUpd.push(dt=>{ try{ if(glow.done){ gl.forEach(s=>scene.remove(s)); return false; } glow.k=Math.min(1,glow.k+dt*1.6); const p=.8+.2*Math.sin(performance.now()/90);
      for(const s of gl){ s.material.opacity=glow.k*p; s.scale.setScalar(Math.max(.01,1.4*glow.k*p)); } return true; }catch(e){ return false; } });
  const e=eyes[0]; cineSet(B.x+.8,e.y-.2,B.z+5.5,e.x,e.y,e.z); yield wait(.7); Sound.sfx('howl');
  // the camera dives into his eye
  yield cineTo([e.x,e.y,e.z+.9],[e.x,e.y,e.z],1.0,t=>t*t*t);
  KJT={mode:'iris',t:0}; Sound.sfx('drone'); shake(.3); yield wait(1.0);
  // the pupil opens on the blood lake
  glow.done=1; B.redEye=0; grade.uniforms.red.value=0; enterArena('lake',2); cineSet(60,1.2,70,60,10,20); Game.fade=0;
  const m=L.moon?L.moon.position:{x:60,y:14,z:-110}; KJT={mode:'reveal',t:0,wx:m.x,wy:m.y,wz:m.z}; Sound.sfx('crossboom'); yield wait(1.1); KJT=null; }
function* kjToFlowers(){ const B=Game.boss, P=Player;
  if(B){ cineSet(B.x+.5,2.4,B.z+9,B.x,1.6,B.z); B.anim='leapPrep'; yield wait(.35); const y0=B.y; yield tween(B,{y:y0+1.4},.28,t=>1-(1-t)*(1-t)); B.anim='slash'; yield tween(B,{y:y0},.12,t=>t*t); }
  // the stomp: grab the frame, then splash the lake away to the flowers beneath
  Sound.sfx('slam'); Sound.sfx('splash'); shake(1.3); impactFrame([[1,1],[3,1],[2,1]]); const sc=B?toScreen(B.x,B.y,B.z):[UW/2,UH*.7];
  KJT={mode:'snap',x:sc[0],y:sc[1]}; yield wait(.02);
  enterArena('flowers',3); cineSet(58,1,74,58,14,20); Game.fade=0; Sound.play('boss'); if(KJT&&KJT.mode==='snap') KJT=null; else if(KJT) { KJT.mode='splash'; KJT.t=0; }
  yield wait(1.4); KJT=null; }
// ---------- the overlays ----------
function kjDrawIris(k){ const cx=UW/2, cy=UH/2, R=Math.hypot(UW,UH)*.62*(1-Math.pow(1-k,3)), pr=R*(.3+.7*Math.pow(k,3));
  D.save(); D.beginPath(); D.arc(cx,cy,Math.max(1,R),0,7); D.fillStyle='#ff2a3a'; D.fill();
  for(let i=0;i<48;i++){ const a=i/48*6.283, w=.03; D.beginPath(); D.moveTo(cx+Math.cos(a)*pr,cy+Math.sin(a)*pr); D.lineTo(cx+Math.cos(a-w)*R*.97,cy+Math.sin(a-w)*R*.97); D.lineTo(cx+Math.cos(a+w)*R*.97,cy+Math.sin(a+w)*R*.97); D.closePath(); D.fillStyle=i%2?'#a00a1c':'#ff6a6a'; D.fill(); }
  D.lineWidth=Math.max(2,R*.05); D.strokeStyle='#4a0008'; D.beginPath(); D.arc(cx,cy,Math.max(1,R),0,7); D.stroke();
  D.beginPath(); D.arc(cx,cy,Math.max(1,pr),0,7); D.fillStyle='#14000a'; D.fill(); D.fillStyle='rgba(255,220,220,.8)'; D.beginPath(); D.arc(cx-pr*.35,cy-pr*.35,Math.max(1,pr*.12),0,7); D.fill(); D.restore(); }
function kjDrawReveal(k){ const q=toScreen(KJT.wx,KJT.wy,KJT.wz), cx=q[0], cy=q[1], R=Math.hypot(UW,UH)*1.1*(1-Math.pow(1-k,2.5));
  D.save(); D.beginPath(); D.rect(0,0,UW,UH); D.arc(cx,cy,Math.max(1,R),0,7,true); D.fillStyle='#14000a'; D.fill('evenodd');
  D.lineWidth=Math.max(3,26*(1-k)); D.strokeStyle='#ff2a3a'; D.beginPath(); D.arc(cx,cy,Math.max(1,R),0,7); D.stroke(); D.restore(); }
function kjDrawSplash(){ const T=KJT, k=Math.min(1,T.t/1.25), R=Math.hypot(UW,UH)*1.15*(1-Math.pow(1-k,2.2)); if(!T.snap) return;
  if(!T.work){ T.work=document.createElement('canvas'); T.work.width=T.snap.width; T.work.height=T.snap.height; T.drops=[]; T.spk=[]; for(let i=0;i<36;i++) T.spk.push(.75+Math.random()*.55);
    for(let i=0;i<70;i++){ const a=Math.random()*6.283, v=rnd(380,1100); T.drops.push({x:T.x,y:T.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-rnd(150,500),r:rnd(4,14),c:Math.random()<.5?'#8a0a18':'#d02a3a'}); } }
  const w=T.work.getContext('2d'), sx=T.work.width/UW, sy=T.work.height/UH; w.globalCompositeOperation='source-over'; w.clearRect(0,0,T.work.width,T.work.height); w.drawImage(T.snap,0,0);
  w.globalCompositeOperation='destination-out'; w.beginPath(); const n=T.spk.length;
  for(let i=0;i<=n;i++){ const a=i/n*6.283, r=R*(i%2?T.spk[i%n]:1); const x=(T.x+Math.cos(a)*r)*sx, y=(T.y+Math.sin(a)*r*.8)*sy; if(i) w.lineTo(x,y); else w.moveTo(x,y); } w.closePath(); w.fill();
  D.save(); D.drawImage(T.work,0,0,UW,UH);
  const dt=1/60; for(const d of T.drops){ d.vy+=1400*dt; d.x+=d.vx*dt; d.y+=d.vy*dt; D.fillStyle=d.c; D.beginPath(); D.ellipse(d.x,d.y,d.r,d.r*1.3,Math.atan2(d.vy,d.vx),0,7); D.fill(); }
  D.restore(); }
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ const T=KJT; if(!T) return; const dt=1/60;
      if(T.mode==='snap'){ /* the 3D frame of this very moment (still in the drawing buffer right after composer.render) */ const c=document.createElement('canvas'); c.width=renderer.domElement.width; c.height=renderer.domElement.height;
        c.getContext('2d').drawImage(renderer.domElement,0,0); T.snap=c; T.mode='hold'; D.drawImage(c,0,0,UW,UH); return; }
      if(T.mode==='hold'){ if(T.snap) D.drawImage(T.snap,0,0,UW,UH); return; }
      T.t+=dt; if(T.mode==='iris') kjDrawIris(Math.min(1,T.t/.9)); else if(T.mode==='reveal') kjDrawReveal(Math.min(1,T.t/1.0)); else if(T.mode==='splash') kjDrawSplash(); }catch(e){ console.error('kojima transition',e); KJT=null; } }; })();
// the transitions cut the camera: a sword tear still on screen (re-projected every frame) would stretch into a long black line
(function(){ for(const S of [SCR,SCR_BASE,SCRA]) for(const k of ['toPhase2','execution']){ const f=S[k]; if(typeof f==='function') S[k]=function*(){ try{ twClearCutFX(); }catch(e){} yield* f.apply(this,arguments); }; } })();
