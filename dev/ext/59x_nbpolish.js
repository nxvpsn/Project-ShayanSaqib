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
// ---------- 6. the last hit of phase I: slow motion, the world drained to grey for a beat, the camera orbiting him, colour slams back ----------
(function(){ const nd=np1Down; np1Down=function(){ const r=nd.apply(this,arguments); try{ if(npOn()&&!NP1.cam&&!Game.script) npFinisher(); }catch(e){ console.error('np finisher',e); } return r; }; })();
function npFinisher(){ const g=grade.uniforms, s0=g.sat?g.sat.value:null, a0=Math.atan2(camera.position.z-NB.z,camera.position.x-NB.x), C={x:camera.position.x,y:camera.position.y,z:camera.position.z,lx:NB.x,ly:NB.y+2.2,lz:NB.z}, k={t:0};
  NP1.cam=C; Game.slowT=Math.max(Game.slowT||0,1.2); if(g.sat) g.sat.value=.1; impactFrame([[1,2],[3,2],[2,1]]); FX.hitstop=Math.max(FX.hitstop,.2); npStar(NB.x,NB.y+2.4,NB.z,0xffffff,2.2,.5); Sound.tone('sine',90,40,1.4,.2);
  Game.fxUpd.push(dt=>{ k.t+=dt; if(NP1.cam!==C){ if(!k.col&&g.sat&&s0!=null) g.sat.value=s0; return false; }
    const u=Math.min(1,k.t/2.2), e=u*u*(3-2*u), a=a0+e*1.9, R=7.5-e*1.5; C.x=NB.x+Math.cos(a)*R; C.z=NB.z+Math.sin(a)*R; C.y=NB.y+2.6+e*1.2; C.lx=NB.x; C.ly=NB.y+2.2; C.lz=NB.z;
    if(k.t>.55&&!k.col){ k.col=1; if(g.sat&&s0!=null) g.sat.value=s0; FX.flash=.7; g.flashCol.value.set(.6,.95,1); shake(.8); FX.burst(NB.x,NB.y+2,NB.z,60,0x3ff4ff,9,.5); FX.burst(NB.x,NB.y+2,NB.z,40,0xffffff,7,.4); }
    if(u>=1){ NP1.cam=null; return false; } return true; }); }
// ---------- 7. staggered, he looks broken: a gold break flash, sparks shorting out of him, smoke, a pulsing ring under him ----------
function npStagger(dt){ const st=!!NB.stunned&&!NP1.done;
  if(st&&!NPP.wasStun){ npStar(NB.x,NB.y+2.5,NB.z,0xffd45a,1.6,.4); FX.ring(NB.x,groundY(NB.x,NB.z)+.1,NB.z,'#ffd45a',3,.45); Sound.tone('square',900,300,.18,.06); }
  NPP.wasStun=st; if(!st) return;
  if(Math.random()<dt*20){ const a=rnd(0,6.283), y=NB.y+rnd(1,3.6); FX.spawn(NB.x+Math.cos(a)*.7,y,NB.z+Math.sin(a)*.7,Math.cos(a)*rnd(3,7),rnd(-2,4),Math.sin(a)*rnd(3,7),.12,Math.random()<.5?0x9ff8ff:0xffffff,.12,0,true); }
  if(Math.random()<dt*6) FX.spawn(NB.x+rnd(-.5,.5),NB.y+rnd(2.5,3.6),NB.z+rnd(-.5,.5),rnd(-.3,.3),rnd(1,2),rnd(-.3,.3),1.2,0x2a2830,.5,0,false);
  NPP.stunRing=(NPP.stunRing||0)-dt; if(NPP.stunRing<=0){ NPP.stunRing=.7; FX.ring(NB.x,groundY(NB.x,NB.z)+.1,NB.z,'#ffd45a',2.2,.5); } }
// ---------- 8. his fast flights leave a cyan streak; the fastest (the meteor's hops) crack the air with shock rings ----------
function npSpeed(dt){ const L=NPP.last; NPP.last={x:NB.x,y:NB.y,z:NB.z}; if(!L||dt<=0) return; const dx=NB.x-L.x, dy=NB.y-L.y, dz=NB.z-L.z, v=Math.hypot(dx,dy,dz)/dt;
  if(v<16||v>90) return; /* standing, or a blink */
  for(let i=0;i<3;i++){ const u=Math.random(); FX.spawn(L.x+dx*u,L.y+dy*u+rnd(1.5,3),L.z+dz*u,0,0,0,.18,0x9ff8ff,.35,0,true); }
  NPP.shockT-=dt; if(v>26&&NPP.shockT<=0){ NPP.shockT=.12; const l=Math.hypot(dx,dz)||1; npShock(NB.x,NB.y+2.2,NB.z,dx/l,dz/l,.9); Sound.hiss(3000,.08,.06,'highpass'); } }
// ---------- 9. tells hit the screen too: the lock-on ring flushes the tell's colour and the screen's edges pulse with it ----------
(function(){ const g=np1Glint; np1Glint=function(x,y,z,col){ try{ if(npOn()&&(col===0xff2a3a||col===0xc0001c||col===0x3a8aff)) NPP.ret={col,t:0}; }catch(e){} return g.apply(this,arguments); }; })();
function npRet(dt){ const R=NPP.ret, T=typeof TPS!=='undefined'?TPS.ret:null; if(!R) return; R.t+=dt; const k=Math.min(1,R.t/.6);
  if(T&&T.children) T.children.forEach(m=>{ try{ m.material.color.setHex(R.col); m.material.color.lerp(new THREE.Color(0x7fe8ff),k); }catch(e){} }); if(k>=1) NPP.ret=null; }
function npDanger(){ const R=NPP.ret; if(!R||R.t>.6) return; const a=.28*(1-R.t/.6), c=R.col===0x3a8aff?'40,120,255':'255,30,50', R0=Math.hypot(UW,UH)*.55;
  const vg=D.createRadialGradient(UW/2,UH/2,R0*.55,UW/2,UH/2,R0); vg.addColorStop(0,`rgba(${c},0)`); vg.addColorStop(1,`rgba(${c},${a})`); D.save(); D.fillStyle=vg; D.fillRect(0,0,UW,UH); D.restore(); }
// ---------- 10. Ali's weight: dust kicked up as he runs, a dust ring and a camera dip on landing, recoil on charged releases ----------
function npAli(dt){ const P=Player, sp=Math.hypot(P.vx||0,P.vz||0), gy=groundY(P.x,P.z);
  if(P.onGround&&!P.cineFly&&sp>4){ NPP.dustT-=dt; if(NPP.dustT<=0){ NPP.dustT=.08; FX.spawn(P.x+rnd(-.2,.2),gy+.1,P.z+rnd(-.2,.2),-(P.vx||0)*.1+rnd(-.4,.4),rnd(.3,.9),-(P.vz||0)*.1+rnd(-.4,.4),.45,0xa89a80,.3,0,false); } }
  if(P.onGround&&!NPP.ground&&!P.cineFly){ FX.ring(P.x,gy+.08,P.z,'#d8ccb0',1.4,.3); for(let i=0;i<8;i++){ const a=i/8*6.283; FX.spawn(P.x,gy+.15,P.z,Math.cos(a)*3,rnd(.3,1),Math.sin(a)*3,.4,0xa89a80,.35,0,false); }
    if(typeof TPS!=='undefined') TPS.kick=Math.min(TPS.kick||0,-.12); Sound.tone('sine',140,60,.1,.06); }
  NPP.ground=!!P.onGround; }
(function(){ const cr=aliChargeRelease; aliChargeRelease=function(lv){ const r=cr.apply(this,arguments); try{ if(npOn()&&!Game.script){ TPS.kick=-(.15+lv*.15); TPS.fovK=2+lv*2; } }catch(e){} return r; }; })();
// ---------- 11. hit-stop by weight: Ali's heavy hits on him (charged Getsugas, the Jujishou, ults) freeze the frame longer ----------
(function(){ const nd=nbDamage; nbDamage=function(d,ult){ const on=npOn()&&!NP1.done, h0=NP1.hp; const r=nd.apply(this,arguments);
    try{ if(on&&NP1.hp<h0){ const dd=h0-NP1.hp; if(dd>=10){ FX.hitstop=Math.max(FX.hitstop,.12); Game.slowT=Math.max(Game.slowT||0,.12); impactFrame([[3,1]]); } else if(dd>=4) FX.hitstop=Math.max(FX.hitstop,.07); } }catch(e){} return r; }; })();
// ---------- 12. his slashes cut the air: a cyan tear sweeps from him toward Ali as each red slash lands, and scars the ground ----------
(function(){ const hr=np1HitRed; np1HitRed=function(dmg,fx,fz){ const r=hr.apply(this,arguments);
    try{ if(npOn()&&Math.hypot(fx-NB.x,fz-NB.z)<1){ const P=Player, dx=P.x-NB.x, dz=P.z-NB.z, l=Math.hypot(dx,dz)||1, ux=dx/l, uz=dz/l, gy=groundY(NB.x,NB.z);
        twGash({life:.35,rev:.05,fade:.16,w:16,op:.85,sparks:8,col:0x9ff8ff,pts:()=>twArcPts(NB.x+ux*1.2,NB.y+2.2,NB.z+uz*1.2,ux,uz,2.6,-1,1,7)});
        FX.line(NB.x+ux*2.2,NB.z+uz*2.2,Math.atan2(uz,ux)+Math.PI/2,3.4,.18,0x3ff4ff,.5); for(let i=0;i<6;i++) FX.spawn(NB.x+ux*rnd(1,3),gy+.1,NB.z+uz*rnd(1,3),rnd(-1,1),rnd(1,3),rnd(-1,1),.4,0x9a9080,.3,0,false); } }catch(e){ console.error('np slash fx',e); }
    return r; }; })();
// ---------- 13. the grab's slam: a crater ring, a dust wall and a heavy camera dip when Ali hits the ground ----------
function npGrabSlam(){ const S=NP1.seq; if(!S||S.k!=='grab'){ NPP.slamSeen=0; return; } if(!S.slam||NPP.slamSeen) return; NPP.slamSeen=1; const P=Player, gy=groundY(P.x,P.z);
  FX.ring(P.x,gy+.1,P.z,'#d8ccb0',4.5,.5); FX.ring(P.x,gy+.12,P.z,'#4a9aff',3,.4); for(let i=0;i<30;i++){ const a=i/30*6.283; FX.spawn(P.x+Math.cos(a)*.8,gy+.2,P.z+Math.sin(a)*.8,Math.cos(a)*rnd(3,7),rnd(1,3.5),Math.sin(a)*rnd(3,7),.7,0x9a8e78,.45,0,false); }
  for(let i=0;i<6;i++) FX.line(P.x,P.z,i/6*6.283+rnd(-.2,.2),rnd(2,4),.14,0x4a9aff,.6); if(typeof TPS!=='undefined') TPS.kick=-.5; impactFrame([[3,2],[1,1]]); }
// ---------- 14. his sword glows: a cyan light rides the blade through every slash (and burns brighter on the tell) ----------
function npBladeGlow(dt){ if(!NPP.blade){ const g=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0x7ff4ff,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); g.userData.temp=1; scene.add(g); NPP.blade=g; }
  const g=NPP.blade, sl=typeof NBS!=='undefined'&&NBS.slashA!=null, tell=Game.time<(NP1.redEnd||0); if(!sl&&!tell){ g.visible=false; return; }
  const P=Player, dx=P.x-NB.x, dz=P.z-NB.z, l=Math.hypot(dx,dz)||1, u=sl?Math.min(1,(NBS.clock-NBS.slashA)/NBS.slashD):0, swing=Math.sin(u*Math.PI);
  g.visible=true; g.position.set(NB.x+dx/l*(.6+swing*1.4),NB.y+3.2-u*1.6,NB.z+dz/l*(.6+swing*1.4)); const sc=(tell?1.6:1.1)*(1+.15*Math.sin(Game.time*40)); g.scale.set(sc,sc,1); g.material.opacity=tell?.9:.6;
  if(sl&&Math.random()<.6) FX.spawn(g.position.x,g.position.y,g.position.z,rnd(-1,1),rnd(-1,1),rnd(-1,1),.2,0x9ff8ff,.22,0,true); }
// ---------- 15. the funnels: a muzzle flash when one fires and a scorch where the beam hits the ground ----------
(function(){ const nb=np1Beam; np1Beam=function(ax,ay,az,bx,by,bz,col){ const r=nb.apply(this,arguments);
    try{ if(npOn()){ npStar(ax,ay,az,col||0xff2a3a,.7,.18); const gx=bx, gz=bz, gy=groundY(gx,gz); if(by<gy+2.5){ FX.ring(gx,gy+.08,gz,'#ff3a4a',1.2,.3); for(let i=0;i<5;i++) FX.spawn(gx,gy+.15,gz,rnd(-2,2),rnd(1,3),rnd(-2,2),.5,0x3a3030,.3,0,false); } } }catch(e){} return r; }; })();
// ---------- 16. the cage shows its shape: a cyan ring of light threads the six funnels while they circle ----------
function npCage(){ if(NP1.last!=='cage'||!NP1.gen||NBB.length<4) return; const L=NBB.filter(b=>!b.gone); if(L.length<4) return;
  for(let i=0;i<L.length;i++){ const a=L[i], b=L[(i+1)%L.length], u=Math.random(); FX.spawn(lerp(a.x,b.x,u),lerp(a.y,b.y,u)-.3,lerp(a.z,b.z,u),0,0,0,.14,0x3ff4ff,.16,0,true); } }
// ---------- 17. the meteor: his shadow grows on the ground as he comes down, and a sonic boom cracks when he arrives ----------
function npMeteor(dt){ const on=NP1.last==='meteor'&&NP1.alt!=null&&!NP1.seq; if(!NPP.shadow){ const m=new THREE.Mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial({color:0x08060c,transparent:true,opacity:.55,depthWrite:false})); m.rotation.x=-Math.PI/2; m.userData.temp=1; scene.add(m); m.visible=false; NPP.shadow=m; }
  const m=NPP.shadow; if(!on){ if(NPP.metHigh&&NP1.alt==null&&!NP1.seq){ NPP.metHigh=0; npShock(NB.x,NB.y+2,NB.z,1,0,1.6); npShock(NB.x,NB.y+2,NB.z,0,1,1.6); Sound.hiss(900,.25,.3,'bandpass'); Sound.tone('sawtooth',60,30,.3,.14); shake(.5); } m.visible=false; return; }
  const gy=groundY(NB.x,NB.z), h=Math.max(0,NP1.alt-gy); if(h>6) NPP.metHigh=1; m.visible=true; m.position.set(NB.x,gy+.05,NB.z); const sc=Math.max(.3,2.6-h*.18); m.scale.setScalar(sc); m.material.opacity=Math.max(.15,.65-h*.035); }
// ---------- 18. the auto-parry: the clashes alternate cyan and red stars, growing, and the 5th throws a shockwave across the ground ----------
(function(){ const mp=twMeleeParry; twMeleeParry=function(sx,sz){ const S=NP1.seq, a5=npOn()&&S&&S.k==='auto5'; const r=mp.apply(this,arguments);
    try{ if(a5){ const P=Player, mx=lerp(P.x,sx,.45), mz=lerp(P.z,sz,.45), n=S.n||1; npStar(mx,P.y+1.5,mz,n%2?0x3ff4ff:0xff3a4a,1+n*.3,.3);
        if(n>=5){ const gy=groundY(mx,mz); FX.ring(mx,gy+.1,mz,'#ffffff',9,.6); FX.ring(mx,gy+.12,mz,'#ff3a4a',6,.5); for(let i=0;i<40;i++){ const a=i/40*6.283; FX.spawn(mx,gy+.2,mz,Math.cos(a)*rnd(6,12),rnd(.5,3),Math.sin(a)*rnd(6,12),.6,i%2?0xffffff:0x9a8e78,.4,0,i%2===0); } } } }catch(e){} return r; }; })();
// ---------- 19. the dodge counter's finish: judgement-cut tears rip the ground around him on the boom ----------
function npCounterBoom(){ const S=NP1.seq; if(!S||S.k!=='counter'){ NPP.boomSeen=0; return; } if(!S.boom||NPP.boomSeen) return; NPP.boomSeen=1; const gy=groundY(NB.x,NB.z);
  for(let i=0;i<5;i++){ const a=rnd(0,6.283), ux=Math.cos(a), uz=Math.sin(a); twGash({life:.6,rev:.06,fade:.25,w:14,op:.8,sparks:10,pts:()=>twArcPts(NB.x,gy+.4+i*.5,NB.z,ux,uz,3.5,-1.2,1.2,7,true)}); }
  FX.ring(NB.x,gy+.1,NB.z,'#ff3a4a',7,.6); if(typeof TPS!=='undefined'){ TPS.kick=.5; TPS.fovK=-6; } }
// ---------- 20. the Starbreaker at level 3: cracks of light race out from under him and the ground shudders ----------
(function(){ const nl=npxLevel; npxLevel=function(E,lv){ const r=nl.apply(this,arguments);
    try{ if(lv===3&&npOn()){ const gy=groundY(NB.x,NB.z); for(let i=0;i<12;i++){ const a=i/12*6.283+rnd(-.15,.15); FX.line(NB.x+Math.cos(a)*1.5,NB.z+Math.sin(a)*1.5,a,rnd(5,11),.16,0x3ff4ff,2.2); }
        FX.ring(NB.x,gy+.1,NB.z,'#ffffff',12,.9); for(let i=0;i<40;i++){ const a=rnd(0,6.283), d=rnd(2,9); FX.spawn(NB.x+Math.cos(a)*d,gy+.2,NB.z+Math.sin(a)*d,0,rnd(2,6),0,.9,i%2?0x9a9080:0x3ff4ff,.35,6,i%2===0); } if(typeof TPS!=='undefined') TPS.fovK=5; } }catch(e){} return r; }; })();
function npPass2(dt){ npGrabSlam(); npBladeGlow(dt); npCage(); npMeteor(dt); npCounterBoom(); }
function npGlowOff2(){ for(const k of ['blade','shadow']) if(NPP[k]){ scene.remove(NPP[k]); NPP[k]=null; } }
// ---------- 21. engage: when phase I starts the lock-on ring snaps down onto him from wide, with a tick ----------
(function(){ const ns=np1Start; np1Start=function(){ const r=ns.apply(this,arguments); try{ NPP.engage={t:0}; Sound.tone('square',1800,900,.12,.05); Sound.tone('sine',2600,2600,.08,.04); }catch(e){} return r; }; })();
function npEngage(dt){ const E=NPP.engage, T=typeof TPS!=='undefined'?TPS.ret:null; if(!E||!T) return; E.t+=dt; const u=Math.min(1,E.t/.45), e=1-Math.pow(1-u,3); T.scale.setScalar(1+3*(1-e)); if(u>=1){ NPP.engage=null; T.scale.setScalar(1); Sound.sfx('ting'); npStar(NB.x,groundY(NB.x,NB.z)+.3,NB.z,0x7fe8ff,1.2,.25); } }
// ---------- 22. his bar remembers: a white chip trails behind each hit and drains away, so the damage reads ----------
function npChip(){ if(!NP1.live||NP1.done||Game.letter>.5) return; const k=Math.max(0,NP1.hp/NP1.max); if(NPP.chip==null||NPP.chip<k) NPP.chip=k; NPP.chipT=(NPP.chipT||0);
  if(NPP.chip>k){ NPP.chipHold=(NPP.chipHold||0)+1/60; if(NPP.chipHold>.35) NPP.chip=Math.max(k,NPP.chip-1/60*.25); } else NPP.chipHold=0;
  if(NPP.chip<=k+1e-4) return; const bw=Math.min(UW*.6,560), bx=(UW-bw)/2, by=6; D.save(); D.globalAlpha=NP1.bar; D.fillStyle='#ffffff'; D.fillRect(bx+bw*k,by,bw*(NPP.chip-k),4); D.restore(); }
// ---------- 23. cleaner trails: his afterimages are tinted cyan and thinner, so the flight reads as speed, not clutter ----------
(function(){ const na=nbAfterimage; nbAfterimage=function(){ const r=na.apply(this,arguments); try{ if(npOn()&&NBG.length){ const m=NBG[NBG.length-1].m; m.material.color.setHex(0x8ff4ff); m.material.opacity=.38; } }catch(e){} return r; }; })();
// ---------- 24. the lens opens with Ali's speed: a run or a blink widens the view a touch, standing still tightens it ----------
function npRunFov(dt){ const P=Player, sp=P.cineFly?0:Math.hypot(P.vx||0,P.vz||0), want=Math.min(4,sp*.22); TPS.fovRun=lerp(TPS.fovRun||0,want,1-Math.exp(-dt*5)); }
// ---------- 25. low health: the screen's edges pulse red with a slow heartbeat ----------
function npLowHp(){ const P=Player; if(!NP1.live||NP1.done||P.hp>3||P.hp<=0||Game.state!=='play') return; const b=Math.pow(Math.max(0,Math.sin(Game.time*4.2)),6), R0=Math.hypot(UW,UH)*.55;
  const vg=D.createRadialGradient(UW/2,UH/2,R0*.5,UW/2,UH/2,R0); vg.addColorStop(0,'rgba(200,0,20,0)'); vg.addColorStop(1,`rgba(200,0,20,${.22+.25*b})`); D.save(); D.fillStyle=vg; D.fillRect(0,0,UW,UH); D.restore();
  NPP.beat=(NPP.beat||0)-1/60; if(NPP.beat<=0){ NPP.beat=1.5; Sound.tone('sine',62,40,.22,.14); setTimeout(()=>{ try{ Sound.tone('sine',56,36,.18,.1); }catch(e){} },160); } }
// ---------- 26. Ali's Getsugas burn the field: embers and a scorched line trail under each crescent ----------
function npEmbers(){ for(const b of BEAMS){ if(!b.ali||b.life<=0) continue; const gy=groundY(b.x,b.z); if(b.y-gy>3) continue; const gold=b.tier===2, n=b.big||b.chLv?3:1;
    for(let i=0;i<n;i++) FX.spawn(b.x+rnd(-.5,.5),gy+.15,b.z+rnd(-.5,.5),rnd(-.6,.6),rnd(.8,2.4),rnd(-.6,.6),rnd(.4,.8),gold?0xffd45a:i%2?0xff2a3a:0x1a0608,.2,-2,i%2===0);
    if(Math.random()<.5) FX.spawn(b.x,gy+.1,b.z,0,0,0,.9,0x1a1216,.35,0,false); } }
// ---------- 27. funnels die properly: shards tumble out with a crack and a flash ----------
(function(){ const kb=nbKillBit; nbKillBit=function(b){ try{ if(npOn()&&b){ npStar(b.x,b.y,b.z,0x9ff8ff,.9,.22); for(let i=0;i<9;i++) FX.spawn(b.x,b.y,b.z,rnd(-5,5),rnd(2,7),rnd(-5,5),rnd(.5,.9),i%3?0xbfefff:0x3ff4ff,.22,14,false); Sound.tone('square',1400,400,.1,.05); } }catch(e){} return kb.apply(this,arguments); }; })();
// ---------- 28. an opening you can read: PUNISH pulses over him while he's staggered ----------
function npPunish(){ if(!NB.stunned||NP1.done||!NP1.live||Game.letter>.5||NP1.seq) return; const q=toScreen(NB.x,NB.y+5.2,NB.z); if(q[0]<-50||q[0]>UW+50||q[1]<-50) return; const pu=1+.08*Math.sin(Game.time*14);
  D.save(); D.translate(q[0],q[1]); D.scale(pu,pu); D.font=`900 ${IS_TOUCH()?22:26}px ${FB}`; D.textAlign='center'; D.textBaseline='bottom'; D.lineWidth=5; D.strokeStyle='#2a1800'; D.strokeText('PUNISH',0,0); D.fillStyle='#ffd45a'; D.fillText('PUNISH',0,0); D.restore(); }
// ---------- 29. contrast: a soft dark vignette frames this fight, so the bright field doesn't wash out the tells ----------
function npVignette(){ if(!NP1.live||Game.letter>.5) return; const R0=Math.hypot(UW,UH)*.55; if(!NPP.vg||NPP.vgW!==UW||NPP.vgH!==UH){ NPP.vg=D.createRadialGradient(UW/2,UH/2,R0*.45,UW/2,UH/2,R0); NPP.vg.addColorStop(0,'rgba(4,8,20,0)'); NPP.vg.addColorStop(1,'rgba(4,8,20,.42)'); NPP.vgW=UW; NPP.vgH=UH; }
  D.save(); D.fillStyle=NPP.vg; D.fillRect(0,0,UW,UH); D.restore(); }
// ---------- 30. he's alive while he hovers: thruster flicker under his feet and a lazy drift of light when he's still ----------
function npIdle(dt){ if(NB.dsh||NB.stunned||(typeof NBS!=='undefined'&&NBS.boostT>0)||NP1.seq) return; if(Math.random()<dt*16){ const a=rnd(0,6.283); FX.spawn(NB.x+Math.cos(a)*.35,NB.y+.15,NB.z+Math.sin(a)*.35,rnd(-.4,.4),rnd(-2.5,-1),rnd(-.4,.4),.22,Math.random()<.7?0x3ff4ff:0xffffff,.16,0,true); }
  if(Math.random()<dt*3){ const a=rnd(0,6.283), r=rnd(.8,1.6); FX.spawn(NB.x+Math.cos(a)*r,NB.y+rnd(1,3.5),NB.z+Math.sin(a)*r,0,rnd(.2,.5),0,1.2,0x9ff8ff,.1,0,true); } }
function npPass3(dt){ npEngage(dt); npRunFov(dt); npEmbers(); npIdle(dt); }
// ---------- the per-frame hook, the UI hook, cleanup ----------
function npFrame(dt){ npAmbient(dt); npStagger(dt); npSpeed(dt); npRet(dt); npAli(dt); npPass2(dt); npPass3(dt); }
(function(){ const nu=np1Update; np1Update=function(dt){ const r=nu.apply(this,arguments); try{ if(npOn()) npFrame(dt); }catch(e){ console.error('np polish',e); } return r; }; })();
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ if(npOn()&&Game.letter<=.5){ npVignette(); npDanger(); npMarks(); npChip(); npPunish(); npLowHp(); } }catch(e){ console.error('np marks',e); } }; })();
(function(){ const nr=np1Reset; np1Reset=function(){ npGlowOff(); npGlowOff2(); NPP.chip=null; NPP.engage=null; if(typeof TPS!=='undefined') TPS.fovRun=0; return nr.apply(this,arguments); }; })();
