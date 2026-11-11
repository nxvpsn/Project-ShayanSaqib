// =====================================================================
// OMAR EATS THE MOON (his phase III transition, replaces 30_solo's twOmarEatMoon). It is THE moon: the one in the sky
// is the one that comes down. Four chains of void go up to it and latch on; he hauls it out of the sky until it hangs
// huge behind him; three bites take three chunks out of it (the disc itself is bitten: craters, rim and all), crumbs
// raining; the last sliver goes down the hood.
// =====================================================================
function omMoonCanvas(){ const S=128, cv=document.createElement('canvas'); cv.width=cv.height=S; const c=cv.getContext('2d');
  try{ c.fillStyle='#b8c2e6'; c.beginPath(); c.arc(64,64,58,0,7); c.fill(); c.fillStyle='#eef2ff'; c.beginPath(); c.arc(61,61,55,0,7); c.fill(); c.fillStyle='#ffffff'; c.beginPath(); c.arc(52,50,36,0,7); c.fill(); c.fillStyle='#eef2ff'; c.beginPath(); c.arc(58,58,36,0,7); c.fill();
    for(const [x,y,r] of [[44,48,11],[78,40,7],[84,76,13],[52,86,8],[30,72,5],[66,62,5],[98,54,4],[70,98,5],[38,30,4]]){ c.fillStyle='#9aa6d0'; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.fillStyle='#c8d2f0'; c.beginPath(); c.arc(x+1.5,y+1.5,r-1.5,0,7); c.fill(); c.fillStyle='#ffffff'; c.fillRect(x-r+1,y-r+2,Math.max(1,r-2),1); } }catch(e){}
  return cv; }
function omMoonBite(cv,ang){ try{ const c=cv.getContext('2d'); c.globalCompositeOperation='destination-out'; const bx=64+Math.cos(ang)*52, by=64+Math.sin(ang)*52; c.beginPath(); c.arc(bx,by,30,0,7); c.fill(); for(let i=-2;i<=2;i++){ const a=ang+Math.PI+i*.42; c.beginPath(); c.arc(bx+Math.cos(a)*30,by+Math.sin(a)*30,7,0,7); c.fill(); } c.globalCompositeOperation='source-over'; }catch(e){} }
twOmarEatMoon=function*(T){ const SM=L.skyMoon, mouth=()=>({x:T.x+(T.f||1)*.12,y:T.y+1.8*(T.scale||1),z:T.z+.3}), hand=()=>({x:T.x+(T.f||1)*.5,y:T.y+3.1,z:T.z+.2});
  const p0=SM?[SM.position.x,SM.position.y,SM.position.z]:[T.x-20,T.y+24,T.z-90], s0=SM&&SM.geometry&&SM.geometry.parameters?SM.geometry.parameters.width*.36:16;
  let dx=p0[0]-T.x, dz=p0[2]-T.z; const dl=Math.hypot(dx,dz)||1; dx/=dl; dz/=dl; const p1=[T.x+dx*6,T.y+7,T.z+dz*6], s1=9; /* it stops above and behind his head: he stands black against it */
  const cv=omMoonCanvas(), tx=new THREE.CanvasTexture(cv); tx.magFilter=THREE.NearestFilter; const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:tx,color:0xa4aed0,transparent:true,depthWrite:false,fog:false})), g=twGlow(0x8a9ad8,1); /* dimmed: at full white the bloom turned it into a blank glare with no craters */
  m.userData.tw=1; m.renderOrder=6; scene.add(m); if(SM) SM.visible=false; const st={u:0,t:0,dead:0,e:0,sh:0,p:p0.slice(),s:s0,chains:0}, ch=[]; for(let i=0;i<4;i++){ const b=beamMesh(i%2?0x8a3aff:0x2a0a4a,.12); b.userData.tw=1; b.visible=false; ch.push(b); }
  // the camera stands in front of him, looking past him up at the moon
  cineSet(T.x-dx*10.5+dz*1.5,T.y-.6,T.z-dz*10.5-dx*1.5,T.x+dx*2,T.y+4.8,T.z+dz*2);
  Game.fxUpd.push(dt=>{ if(st.dead){ scene.remove(m); scene.remove(g); ch.forEach(b=>scene.remove(b)); return false; } st.t+=dt; st.u=Math.max(0,Math.min(1,st.u)); st.e=Math.max(0,Math.min(1,st.e)); /* a long frame must never overshoot the easing (the moon flipped to a negative size) */ const k=st.u*st.u*(3-2*st.u), M=mouth(), H=hand();
    const x=lerp(lerp(p0[0],p1[0],k),M.x,st.e), y=lerp(lerp(p0[1],p1[1],k),M.y,st.e), z=lerp(lerp(p0[2],p1[2],k),M.z,st.e), s=lerp(lerp(s0,s1,k),.15,st.e)*(1-st.sh*.1), wob=Math.sin(st.t*38)*(st.chains?.004*s:0)+(st.jolt>0?rnd(-.06,.06)*s:0); st.jolt=Math.max(0,(st.jolt||0)-dt);
    st.p=[x,y,z]; st.s=s; m.position.set(x+wob,y,z); m.scale.set(s,s,1); m.quaternion.copy(camera.quaternion); g.position.set(x,y,z-.2); g.scale.setScalar(s*1.5); g.material.opacity=.14;
    ch.forEach((b,i)=>{ b.visible=i<st.chains&&st.e<.6; if(!b.visible) return; const a=i*1.57+.6, rx=x+Math.cos(a)*s*.42, ry=y+Math.sin(a)*s*.42; twBeamTo(b,H.x,H.y,H.z,rx,ry,z,1+.25*Math.sin(st.t*30+i)); if(Math.random()<.5){ const q=Math.random(); FX.spawn(lerp(H.x,rx,q),lerp(H.y,ry,q),lerp(H.z,z,q),0,0,0,.3,0x8a3aff,.25,0,true); } });
    if(st.u>0&&st.e<1&&Math.random()<.6) FX.spawn(x+rnd(-s*.4,s*.4),y-s*.45,z+.2,rnd(-.5,.5),rnd(-3,-1),0,.8,0xdfe6ff,.2,6,false); return true; });
  Sound.sfx('drone'); T.cast=6; shake(.3); yield wait(.7);
  // the chains go up, one by one
  for(let i=0;i<4;i++){ st.chains=i+1; st.jolt=.2; Sound.sfx('swing'); Sound.sfx('void'); shake(.3); FX.flash=Math.max(FX.flash,.2); grade.uniforms.flashCol.value.set(.6,.3,1); yield wait(.16); }
  yield wait(.3); twBark('omar',"Come down here.",true);
  // he hauls it out of the sky
  Sound.sfx('suck'); Sound.sfx('howl'); shake(.6); yield tween(st,{u:1},1.7,t=>{ t=Math.min(1,t); return t*t*t; }); shake(1.2); Sound.sfx('slam'); impactFrame([[1,2],[2,1]]); FX.flash=.2; grade.uniforms.flashCol.value.set(.85,.9,1); yield wait(.45);
  // three bites
  for(let i=0;i<3;i++){ yield tween(st,{e:.12+i*.12},.16,t=>{ t=Math.min(1,t); return t*t; }); omMoonBite(cv,[2.2,1.2,2.9][i]+rnd(-.15,.15)); tx.needsUpdate=true; st.sh=i+1; st.jolt=.25; Sound.sfx('chomp'); Sound.sfx('crash'); shake(1); impactFrame([[2,1],[1,1]]); FX.hitstop=Math.max(FX.hitstop,.08);
    const M=mouth(); for(let k=0;k<26;k++) FX.spawn(lerp(st.p[0],M.x,.4)+rnd(-1,1),lerp(st.p[1],M.y,.4)+rnd(-1,1),lerp(st.p[2],M.z,.4),rnd(-5,5),rnd(1,7),rnd(-2,3),rnd(.6,1.1),k%3?0xeef2ff:0x9aa6d0,rnd(.2,.4),14,false); yield wait(.34); }
  // the last of it goes down the hood
  Sound.sfx('suck'); yield tween(st,{e:1},.5,t=>{ t=Math.min(1,t); return t*t; }); st.dead=1; T.cast=0; };
