// =====================================================================
// KOJIMA'S OWN LOOK for the moves 40k borrowed from the twins (the attacks are untouched: same lines, timings, damage, pull):
//   tape      Caotan's blue beam  -> RED TAPE: a ribbon unrolls across the floor during the warning, then snaps taut at knee height (jump it)
//   wall      Caotan's pink beam  -> the PAYWALL: a row of file boxes rises along the line, then they slam up and burst into paper (step off it)
//   shredder  the twins' black hole -> a paper shredder: a grey box with a red light and a slot, strips of paper spiralling into it (walk out of the pull)
// The beam helpers keep building their meshes; kjTrap catches what they add to the scene and hides it, and a Kojima visual runs beside the hazard.
// =====================================================================
(function(){ const kt=kjTex; kjTex=function(){ const T=kt.apply(this,arguments); if(T.tape) return T; const mk=(w,h,f)=>{ const [cv,c]=mkCanvas(w,h); f(c); const t=tex(cv); t.magFilter=t.minFilter=THREE.NearestFilter; return t; };
    T.tape=mk(96,8,c=>{ c.fillStyle='#c8202e'; c.fillRect(0,0,96,8); c.fillStyle='#8a1020'; for(let i=0;i<96;i+=12) c.fillRect(i,0,2,8); c.fillStyle='#fff4f4'; c.font='bold 7px monospace'; c.textBaseline='middle'; c.fillText('RED TAPE',4,4); c.fillText('DO NOT',52,4); c.fillStyle='#ffd0d0'; c.fillRect(0,0,96,1); c.fillRect(0,7,96,1); });
    T.tape.wrapS=THREE.RepeatWrapping;
    T.box=mk(16,12,c=>{ c.fillStyle='#8a6a42'; c.fillRect(0,0,16,12); c.fillStyle='#d8b887'; c.fillRect(1,1,14,10); c.fillStyle='#b89468'; c.fillRect(1,5,14,1); c.fillStyle='#f6f4ee'; c.fillRect(4,2,8,3); c.fillStyle='#c8202e'; c.fillRect(5,3,2,1); c.fillRect(8,3,3,1); c.fillStyle='#6a4a2a'; c.fillRect(7,8,2,3); });
    return T; }; })();
function kjTrap(fn){ const caught=[], sa=scene.add; scene.add=function(m){ try{ if(m&&m.userData&&m.userData.tw) m.visible=false; }catch(e){} caught.push(m); return sa.apply(this,arguments); }; try{ return fn(); } finally{ scene.add=sa; } }
// a beam hazard with its own visual: vis = {upd(dt,play,t), kill()}; the hazard's meshes stay hidden through its life
function kjSkinBeam(call,make){ let h=null; kjTrap(()=>{ h=call(); }); if(!h) return null; const u=h.upd, k=h.kill, vis=make(); let t=0;
  h.upd=function(dt,play){ const r=kjTrap(()=>u.call(h,dt,play)); try{ if(play) t+=dt; vis.upd(dt,play,t); }catch(e){ console.error('kj skin',e); } return r; };
  h.kill=function(){ try{ vis.kill(); }catch(e){} return k?k.apply(h,arguments):undefined; }; return h; }
// RED TAPE (the blue beam: x,z is the line's start 15 back, len 30, warn, dur, y .45)
function kjTapeVis(x,z,a,len,warn,dur){ const T=kjTex(), gy=groundY(x,z), rib=twBB(T.tape,1,.55,{flat:true,ro:5}); rib.geometry.translate(.5,0,0); rib.material.map=T.tape.clone(); rib.material.map.needsUpdate=true; rib.material.map.wrapS=THREE.RepeatWrapping; rib.material.map.repeat.set(len/4,1);
  rib.position.set(x,gy+.07,z); rib.rotation.z=-a; const roll=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.5,10),new THREE.MeshLambertMaterial({color:0xc8202e})); roll.rotation.z=Math.PI/2; roll.userData.tw=1; scene.add(roll); let done=0;
  return {upd(dt,play,t){ const unroll=Math.min(1,t/.35), L=len*unroll, act=t>=warn&&t<warn+dur; rib.scale.x=Math.max(.01,L); rib.visible=true;
      if(!act&&t<warn){ rib.position.y=gy+.07; rib.material.color.setHex(t>warn-.3&&Math.floor(t*14)%2?0xffffff:0xffffff); rib.material.opacity=t>warn-.3&&Math.floor(t*14)%2?.55:1; roll.visible=unroll<1; roll.position.set(x+Math.cos(a)*L,gy+.32,z+Math.sin(a)*L); roll.rotation.y=-a; roll.rotation.x+=dt*18; }
      else if(act){ if(!done){ done=1; Sound.sfx('swing'); Sound.sfx('ting'); for(let i=0;i<10;i++){ const u=rnd(0,len); FX.spawn(x+Math.cos(a)*u,gy+.5,z+Math.sin(a)*u,0,rnd(2,5),0,.4,i%2?0xc8202e:0xffffff,.2,0,false); } } rib.position.y=gy+.5; rib.material.opacity=1; rib.scale.y=1.5; roll.visible=false; }
      else { rib.position.y=Math.max(gy+.07,rib.position.y-dt*2); rib.material.opacity=Math.max(0,rib.material.opacity-dt*2.5); roll.visible=false; } },
    kill(){ twRm(rib); twRm(roll); }}; }
// the PAYWALL (the pink beam: from x,z along a, len, warn, dur)
function kjWallVis(x,z,a,len,warn,dur){ const T=kjTex(), n=Math.max(2,Math.floor(len/1.25)), boxes=[], geo=new THREE.BoxGeometry(.95,.62,1.05), mat=new THREE.MeshLambertMaterial({map:T.box});
  for(let i=0;i<n;i++){ const m=new THREE.Mesh(geo,mat); m.userData.tw=1; m.rotation.y=-a+rnd(-.12,.12); scene.add(m); boxes.push({m,u:rnd(0,1),ph:rnd(0,6.28)}); } let fired=0;
  return {upd(dt,play,t){ const act=t>=warn&&t<warn+dur; for(let i=0;i<n;i++){ const b=boxes[i], d=(i+.5)*len/n, bx=x+Math.cos(a)*d, bz=z+Math.sin(a)*d, gy=groundY(bx,bz), rise=Math.min(1,Math.max(0,(t-i/n*warn*.6)/.3));
        let y=gy-.4+rise*.7; if(t>warn-.3&&t<warn) y+=.08*Math.sin(t*40+b.ph); if(act){ if(!fired){ fired=1; Sound.sfx('crash'); Sound.sfx('slam'); } y=gy+.31+Math.min(1.4,(t-warn)*14); } else if(t>=warn+dur){ y=gy+1.7-(t-warn-dur)*6; b.m.visible=y>gy-.6; }
        b.m.position.set(bx,y,bz); b.m.visible=b.m.visible&&rise>0; }
      if(t>=warn+dur&&!this.burst){ this.burst=1; for(const b of boxes){ FX.burst(b.m.position.x,b.m.position.y+.3,b.m.position.z,8,0xf6f4ee,3,.3,false); FX.burst(b.m.position.x,b.m.position.y+.3,b.m.position.z,4,0xd8b887,3,.3,false); } } },
    kill(){ for(const b of boxes) scene.remove(b.m); try{ geo.dispose(); mat.dispose(); }catch(e){} }}; }
// the SHREDDER (a twMiniHole visual: same interface as twHoleVis)
function kjShredVis(x,y,z,r){ const body=new THREE.Group(); const bx=new THREE.Mesh(new THREE.BoxGeometry(1.5,1,1.1),new THREE.MeshLambertMaterial({color:0x3a3a44})); body.add(bx);
  const slot=new THREE.Mesh(new THREE.BoxGeometry(1.1,.08,.3),new THREE.MeshBasicMaterial({color:0x0a0a0e})); slot.position.set(0,.54,0); body.add(slot); const led=new THREE.Mesh(new THREE.BoxGeometry(.18,.1,.18),new THREE.MeshBasicMaterial({color:0xff2030})); led.position.set(.5,.56,.3); body.add(led);
  const bin=new THREE.Mesh(new THREE.BoxGeometry(1.3,.7,.9),new THREE.MeshLambertMaterial({color:0x2a2a32,transparent:true,opacity:.85})); bin.position.set(0,-.8,0); body.add(bin); body.userData.tw=1; scene.add(body); const glow=twGlow(0xff2030,1);
  return {x,y,z,r,k:0,t:0,set(k){ this.k=k; const s=Math.max(.01,k); body.scale.setScalar(s); body.position.set(this.x,this.y-.2,this.z); body.rotation.y=Math.sin(this.t*2)*.15; led.material.color.setHex(Math.floor(this.t*8)%2?0xff2030:0x801018); glow.position.set(this.x+.5*s,this.y+.4*s,this.z+.3*s); glow.scale.setScalar(Math.max(.01,s*(1.2+.3*Math.sin(this.t*16))));
      if(k>.1){ for(let i=0;i<3;i++){ const a=rnd(0,6.28), rr=rnd(1.5,4); FX.spawn(this.x+Math.cos(a)*rr,this.y+rnd(-.5,1),this.z+Math.sin(a)*rr,-Math.cos(a)*rr*1.6,.3,-Math.sin(a)*rr*1.6,.5,i%2?0xf6f4ee:0xd8d4ca,.22,0,false); } if(Math.random()<.5) FX.spawn(this.x+rnd(-.5,.5),this.y+.6,this.z,0,.8,0,.3,0xffffff,.12,0,false); } },
    kill(){ scene.remove(body); scene.remove(glow); }}; }
// the three moves, re-skinned (the generators are 40k's, with the helper swapped for the call)
(function(){ const tape=KJM.tape, wall=KJM.wall, shred=KJM.shredder;
  KJM.tape=function*(b,ph){ const tb=twBeam; twBeam=function(o){ return kjSkinBeam(()=>tb(o),()=>kjTapeVis(o.x,o.z,o.ang,o.len,o.warn,o.dur)); }; try{ yield* tape.call(this,b,ph); } finally{ twBeam=tb; } };
  KJM.wall=function*(b,ph){ const tb=twBeam; twBeam=function(o){ return kjSkinBeam(()=>tb(o),()=>kjWallVis(o.x,o.z,o.ang,o.len,o.warn,o.dur)); }; try{ yield* wall.call(this,b,ph); } finally{ twBeam=tb; } };
  KJM.shredder=function*(b,ph){ const hv=twHoleVis; twHoleVis=function(x,y,z,r){ return kjShredVis(x,y,z,r); }; try{ yield* shred.call(this,b,ph); } finally{ twHoleVis=hv; } }; })();
