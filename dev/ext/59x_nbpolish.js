// =====================================================================
// NATHAN FIGHT POLISH (phase I on Ali's road, the third-person fight). Cosmetic only: feel, VFX, framing.
// One section per polish pass; the camera's punch (TPS.kick), lens punch (TPS.fovK), tilt-up framing and strafe lead
// live in 59t_tps.js. Per-frame work runs from one np1Update wrapper (npFrame).
// =====================================================================
const NPP={marks:[],t:0,glow:null,wasStun:0,ground:true,last:null,dustT:0,shockT:0,ret:null};
function npOn(){ return typeof np1On==='function'&&np1On()&&!!NB; }
// ---------- 1. hits on him land: metal sparks thrown away from Ali, coolant spray, a camera punch, a clank ----------
(function(){ const nd=nbDamage; nbDamage=function(d,ult){ const on=npOn()&&!NP1.done, h0=NP1.hp, mel=!!NP1.melee; const r=nd.apply(this,arguments);
    try{ if(on&&NP1.hp<h0){ const P=Player, dx=NB.x-P.x, dz=NB.z-P.z, l=Math.hypot(dx,dz)||1, ux=dx/l, uz=dz/l, cx=lerp(NB.x,P.x,.3), cz=lerp(NB.z,P.z,.3), cy=NB.y+rnd(1.6,2.6), big=!!ult||h0-NP1.hp>=4;
        for(let i=0;i<(big?14:7);i++) FX.spawn(cx,cy,cz,ux*rnd(2,7)+rnd(-3,3),rnd(1,6),uz*rnd(2,7)+rnd(-3,3),rnd(.25,.45),i%3?0xfff0b0:0xffffff,.16,14,true);
        for(let i=0;i<(big?6:3);i++) FX.spawn(cx,cy,cz,ux*rnd(1,4)+rnd(-2,2),rnd(2,5),uz*rnd(1,4)+rnd(-2,2),.6,0x3ff4ff,.22,16,true);
        if(typeof TPS!=='undefined') TPS.kick=Math.min(.6,Math.max(0,TPS.kick||0)+(big?.32:mel?.16:.08));
        if(mel) Sound.tone('square',2400,1100,.05,.035); NB.flash=Math.max(NB.flash||0,big?.14:.09); } }catch(e){ console.error('np hit fx',e); }
    return r; }; })();
// ---------- 2. parries read in 3D: a clash star at the contact, a ring of sparks, a camera punch and a lens squeeze ----------
function npStar(x,y,z,col,s,dur){ const mk=c=>{ const g=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:c,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); g.userData.temp=1; scene.add(g); return g; };
  const a=mk(col), b=mk(0xffffff), h=mk(col), k={t:0}; dur=dur||.28;
  const o={upd(dt){ k.t+=dt; const u=k.t/dur, f=Math.max(0,1-u); for(const g of [a,b,h]) g.position.set(x,y,z);
      a.scale.set(s*3.2*(1+u),s*.32*f+.01,1); b.scale.set(s*.3*f+.01,s*2.2*(1+u*.5),1); h.scale.setScalar(s*(1.2+u*1.5)); a.material.opacity=f; b.material.opacity=f; h.material.opacity=.6*f; return u<1; },
    kill(){ scene.remove(a); scene.remove(b); scene.remove(h); }};
  if(npOn()) np1Obj(o); else Game.fxUpd.push(dt=>{ const keep=o.upd(dt); if(!keep) o.kill(); return keep; }); }
(function(){ const mp=twMeleeParry; twMeleeParry=function(sx,sz,opt){ const r=mp.apply(this,arguments);
    try{ if(npOn()){ const P=Player, mx=lerp(P.x,sx,.45), mz=lerp(P.z,sz,.45), my=P.y+1.4; npStar(mx,my,mz,0xff5a6a,1.2,.3); TPS.kick=Math.min(.7,Math.max(0,TPS.kick||0)+.4); TPS.fovK=-5;
        for(let i=0;i<12;i++){ const a=i/12*6.283; FX.spawn(mx,my,mz,Math.cos(a)*7,Math.sin(a*2)*3+1.5,Math.sin(a)*7,.25,i%2?0xffffff:0xff8a9a,.18,0,true); } } }catch(e){ console.error('np parry fx',e); }
    return r; }; })();
// ---------- 3. quickboosts: a thruster blast behind him, a dust ring when he's low, a shock ring on the long ones ----------
function npShock(x,y,z,dx,dz,s){ const m=new THREE.Mesh(new THREE.RingGeometry(.7,.95,28),new THREE.MeshBasicMaterial({color:0xdff8ff,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  m.userData.temp=1; m.position.set(x,y,z); m.lookAt(x+dx,y,z+dz); scene.add(m); const k={t:0};
  np1Obj({upd(dt){ k.t+=dt; const u=k.t/.3; m.scale.setScalar(Math.max(.01,s*(1+u*3))); m.material.opacity=.8*Math.max(0,1-u); return u<1; }, kill(){ scene.remove(m); m.geometry.dispose(); }}); }
(function(){ const nb=nbBoost; nbBoost=function(){ const r=nb.apply(this,arguments);
    try{ if(npOn()&&NB.dsh){ const D=NB.dsh, dx=D.tx-D.fx, dz=D.tz-D.fz, l=Math.hypot(dx,dz)||1, ux=dx/l, uz=dz/l, y=NB.y+2.2, gy=groundY(D.fx,D.fz);
        for(let i=0;i<10;i++) FX.spawn(D.fx-ux*.8+rnd(-.3,.3),y+rnd(-.5,.5),D.fz-uz*.8+rnd(-.3,.3),-ux*rnd(4,10)+rnd(-1.5,1.5),rnd(-1,1.5),-uz*rnd(4,10)+rnd(-1.5,1.5),rnd(.2,.35),i%3?0x3ff4ff:0xffffff,.3,0,true);
        if(NB.y-gy<3){ FX.ring(D.fx,gy+.08,D.fz,'#d8e8f0',2.2,.35); for(let i=0;i<8;i++){ const a=rnd(0,6.283); FX.spawn(D.fx+Math.cos(a)*.6,gy+.2,D.fz+Math.sin(a)*.6,Math.cos(a)*rnd(2,5),rnd(.3,1.2),Math.sin(a)*rnd(2,5),.55,0x9a9080,.45,0,false); } }
        if(l>7) npShock(D.fx+ux*1.2,y,D.fz+uz*1.2,ux,uz,1.1); } }catch(e){ console.error('np boost fx',e); }
    return r; }; })();
// ---------- 4. threats you can't see: a red or blue tell off screen (or behind the camera) puts an arrow on the screen's edge ----------
(function(){ const g=np1Glint; np1Glint=function(x,y,z,col){ try{ if(npOn()&&(col===0xff2a3a||col===0xc0001c||col===0x3a8aff)) NPP.marks.push({x,y,z,col:col===0x3a8aff?'#4a9aff':'#ff3a4a',t:0}); }catch(e){} return g.apply(this,arguments); }; })();
function npMarks(){ if(!NPP.marks.length||!camera.getWorldDirection) return; const fw=new THREE.Vector3(); camera.getWorldDirection(fw); const cp=camera.position;
  for(let i=NPP.marks.length-1;i>=0;i--){ const M=NPP.marks[i]; M.t+=1/60; if(M.t>.7){ NPP.marks.splice(i,1); continue; }
    const behind=(M.x-cp.x)*fw.x+(M.y-cp.y)*fw.y+(M.z-cp.z)*fw.z<0, q=toScreen(M.x,M.y,M.z); let sx=q[0], sy=q[1];
    if(!behind&&sx>30&&sx<UW-30&&sy>30&&sy<UH-30) continue;
    let dx=sx-UW/2, dy=sy-UH/2; if(behind){ dx=-dx; dy=-dy; } if(Math.abs(dx)+Math.abs(dy)<1) dy=1;
    const a=Math.atan2(dy,dx), m=40, r=Math.min((UW/2-m)/Math.max(1e-3,Math.abs(Math.cos(a))),(UH/2-m)/Math.max(1e-3,Math.abs(Math.sin(a)))), al=Math.min(1,(.7-M.t)*4)*(.6+.4*Math.sin(M.t*30));
    D.save(); D.globalAlpha=Math.max(0,al); D.translate(UW/2+Math.cos(a)*r,UH/2+Math.sin(a)*r); D.rotate(a); D.fillStyle=M.col; D.strokeStyle='#08060c'; D.lineWidth=3;
    D.beginPath(); D.moveTo(18,0); D.lineTo(-10,-14); D.lineTo(-4,0); D.lineTo(-10,14); D.closePath(); D.stroke(); D.fill(); D.restore(); } }
// ---------- 5. the field breathes: pollen drifting around Ali; a cyan light pooled on the ground under Nathan ----------
function npAmbient(dt){ const P=Player; NPP.t+=dt;
  if(Math.random()<dt*14){ const a=rnd(0,6.283), r=rnd(2,14), x=P.x+Math.cos(a)*r, z=P.z+Math.sin(a)*r, y=groundY(x,z)+rnd(.3,3); FX.spawn(x,y,z,rnd(.4,1.2),rnd(-.1,.3),rnd(-.3,.3),rnd(2,3.5),Math.random()<.5?0xfff4d0:0xffd0e0,.1,-.05,true); }
  if(!NPP.glow){ const m=new THREE.Mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial({map:GLOW,color:0x3ff4ff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false})); m.rotation.x=-Math.PI/2; m.userData.temp=1; scene.add(m); NPP.glow=m; }
  const g=NPP.glow, gy=groundY(NB.x,NB.z), h=Math.max(0,NB.y-gy), boost=typeof NBS!=='undefined'&&NBS.boostT>0?1:0;
  g.visible=true; g.position.set(NB.x,gy+.06,NB.z); g.scale.setScalar(Math.max(.01,(2.2+boost*1.2)*(1+.06*Math.sin(NPP.t*9)))); g.material.opacity=Math.max(0,(.42+boost*.3)*(1-h/14)); }
function npGlowOff(){ if(NPP.glow){ scene.remove(NPP.glow); NPP.glow=null; } NPP.marks.length=0; }
// ---------- the per-frame hook, the UI hook, cleanup ----------
function npFrame(dt){ npAmbient(dt); }
(function(){ const nu=np1Update; np1Update=function(dt){ const r=nu.apply(this,arguments); try{ if(npOn()) npFrame(dt); }catch(e){ console.error('np polish',e); } return r; }; })();
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ if(npOn()&&Game.letter<=.5) npMarks(); }catch(e){ console.error('np marks',e); } }; })();
(function(){ const nr=np1Reset; np1Reset=function(){ npGlowOff(); return nr.apply(this,arguments); }; })();
