// =====================================================================
// HEAVENLY DRILL, pixel pass (Shayan's Q, makeDrill: also the finale's drill and the swarm of mini drills).
// The 3D drill keeps its spin and palette; around it: a spinning fire sheath (drill_aura, speed follows the spin), black and
// red lightning (drill_bolt, two sprites, fades in with the fire), a helix of fire particles winding down to the tip, motion
// smears when it flies, Hamza's golden arc onto it (pee_stream + pee_splash) while he pees in the chant, and a pixel impact
// (drill_boom + drill_crater) where it lands. Plays even while Grimmaw is on the field (it is Shayan's move).
// Impact is read from the drill itself: spin jumps to 90 when the big one lands; a drill that dies (shatter, mini hits) booms.
// =====================================================================
const DRX={};
function drxScreenLen(a,b){ const p=toScreen(a.x,a.y,a.z), q=toScreen(b.x,b.y,b.z); return [q[0]-p[0],q[1]-p[1]]; }
function drxPxPerUnit(v){ const up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion), p=toScreen(v.x,v.y,v.z), q=toScreen(v.x+up.x,v.y+up.y,v.z+up.z); return Math.max(1,Math.hypot(q[0]-p[0],q[1]-p[1])); }
(function(){ const md=makeDrill; makeDrill=function(){ const d=md.apply(this,arguments); try{ drxAttach(d); }catch(e){ console.error('drill fx',e); } return d; }; })();
// a retry, warp or reset wipes Game.fxUpd, and with it the updater that stops this drill's pixel sheets: they would stay on screen.
// Each updater checks in every frame (DRX_F counts FX.update calls); one that stops checking in has its sheets stopped.
const DRX_RECS=[]; let DRX_F=0;
(function(){ const fu=FX.update; FX.update=function(){ const r=fu.apply(this,arguments); try{ DRX_F++; for(let i=DRX_RECS.length-1;i>=0;i--){ const q=DRX_RECS[i]; if(!q.done&&DRX_F-q.seen>3) q.kill(); if(q.done) DRX_RECS.splice(i,1); } }catch(e){ console.error('drill fx sweep',e); } return r; }; })();
function drxAttach(d){ if(!d||!pxvRdy('drill_aura')) return; const o={any:true,x:d.x,y:d.y,z:d.z,size:1}, base=new THREE.Vector3(), tip=new THREE.Vector3(), mid=new THREE.Vector3(),
    e1=new THREE.Vector3(), e2=new THREE.Vector3(), last=new THREE.Vector3(d.x,d.y,d.z), H=()=>Game.hamza;
  const au=pxvPlay('drill_aura',Object.assign({op:.8,ro:9},o)), b1=pxvPlay('drill_bolt',Object.assign({ro:10},o)), b2=pxvPlay('drill_bolt',Object.assign({ro:10,speed:.8},o));
  let ph=0, boomed=0, pee=null, spl=null, smear=0;
  const kill=()=>{ rec.done=1; for(const x of [au,b1,b2,pee,spl]) if(x) pxvStop(x); }, rec={seen:DRX_F,done:0,kill:()=>kill()}; DRX_RECS.push(rec);
  Game.fxUpd.push(dt=>{ try{ rec.seen=DRX_F;
    base.set(d.x,d.y,d.z); const dn=d.dir.clone().normalize(), L=4.4*d.s; tip.copy(dn).multiplyScalar(L).add(base); mid.copy(dn).multiplyScalar(L*.5).add(base);
    // impact
    if(!boomed&&(d.spin>=90||d.dead)){ boomed=1; const big=d.spin>=90, gy=groundY(tip.x,tip.z), sz=big?9:d.s<.5?2.8:5.5;
      pxvPlay('drill_boom',{any:true,x:tip.x,y:big?gy+sz*.35:tip.y,z:tip.z,size:sz,depth:false});
      if(big||d.s<.5) pxvPlay('drill_crater',{any:true,x:tip.x,y:gy+.07,z:tip.z,size:big?8:2.6,ground:true,groundRot:rnd(0,6.28)}); }
    if(d.dead){ kill(); return false; }
    // the sheath: centred on the cone, along its axis on screen, sized from the projected axis
    const [sx,sy]=drxScreenLen(base,tip), ppu=drxPxPerUnit(mid), hgt=Math.max(L*.35,Math.hypot(sx,sy)/ppu)*1.14, rot=Math.atan2(-sy,sx)+Math.PI/2;
    if(au){ au.m.position.copy(mid); au.m.material.rotation=rot; au.m.scale.set(hgt*.5*(1+rnd(-.02,.02)),hgt,1); au.sp=clamp(d.spin/22,.5,4); au.m.material.opacity=.8*Math.min(1,d.fire*2+.3); }
    // lightning: two layers, turning and twitching, stronger as the fire builds
    const lk=clamp((d.fire-.3)*1.6,0,1), bs=L*1.35;
    for(const [b,k] of [[b1,1],[b2,-1]]) if(b){ b.m.position.copy(mid); b.m.material.rotation=rot+k*(Game.time*2.3%6.283)+rnd(-.15,.15); b.m.scale.set(bs*.75,bs,1); b.m.material.opacity=lk*(.75+Math.random()*.25); }
    // a helix of fire winding down to the tip with the spin
    ph+=d.spin*dt*.35; if(Math.abs(dn.y)<.95) e1.set(0,1,0).cross(dn).normalize(); else e1.set(1,0,0).cross(dn).normalize(); e2.copy(dn).cross(e1);
    const nh=Math.min(8,Math.ceil(2+d.fire*3)); for(let k=0;k<nh;k++){ const u=Math.random(), a=ph+(k%3)*2.094+u*7, r=(1-u)*d.s*1.18+.05, c=Math.cos(a), s=Math.sin(a);
      const px=base.x+dn.x*L*u+(e1.x*c+e2.x*s)*r, py=base.y+dn.y*L*u+(e1.y*c+e2.y*s)*r, pz=base.z+dn.z*L*u+(e1.z*c+e2.z*s)*r, tv=d.spin*.06*r;
      FX.spawn(px,py,pz,(-e1.x*s+e2.x*c)*tv-dn.x*1.5,(-e1.y*s+e2.y*c)*tv-dn.y*1.5,(-e1.z*s+e2.z*c)*tv-dn.z*1.5,rnd(.18,.34),[0xff2a10,0xff6a10,0xffc040,0xfff0c0,0xff1a3a][k%5],rnd(.14,.26)*Math.max(.7,d.s*1.4),0,true); }
    // motion smear: fading copies of the sheath when it moves fast
    const v=base.distanceTo(last)/Math.max(dt,1e-3); last.copy(base); smear-=dt;
    if(au&&v>9&&smear<=0){ smear=.025; const g=pxvPlay('drill_aura',{any:true,x:mid.x,y:mid.y,z:mid.z,size:1,op:.45,fade:.16,frame:au.f,ro:8}); if(g){ g.m.material.rotation=rot; g.m.scale.copy(au.m.scale); } }
    // Hamza's golden arc onto the drill while the chant has him peeing
    const h=H(), on=!!(h&&h.mode==='cine'&&Game.chant&&Game.chant.pee&&!Game.chant.fin);
    if(on&&!pee){ pee=pxvPlay('pee_stream',{any:true,x:h.x,y:h.y,z:h.z,size:1,ro:9}); spl=pxvPlay('pee_splash',{any:true,x:d.x,y:d.y,z:d.z,size:1.3,ro:9}); }
    if(!on&&pee){ pxvStop(pee); if(spl) pxvStop(spl); pee=spl=null; }
    if(pee){ const a=new THREE.Vector3(h.x+.25,h.y-.35,h.z), b=new THREE.Vector3().copy(dn).multiplyScalar(L*.3).add(base).add(new THREE.Vector3(-.45*d.s,0,0)), [qx,qy]=drxScreenLen(a,b), len=Math.hypot(qx,qy)/drxPxPerUnit(a), fl=qx<0;
      pee.m.position.set((a.x+b.x)/2,(a.y+b.y)/2+len*.12,(a.z+b.z)/2); pee.m.material.rotation=fl?Math.atan2(qy,-qx):Math.atan2(-qy,qx); pxvFlip(pee,fl); pee.m.scale.set(len*1.15,len*.58,1);
      if(spl){ spl.m.position.copy(b); } }
    return true; }catch(er){ console.error('drill fx',er); kill(); return false; } }); }
