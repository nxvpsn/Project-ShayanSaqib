// =====================================================================
// LANTERNBROOK PARKOUR: in the town only, houses, trees and market stalls are solid ground on top.
// Run into one and you scramble straight up it (auto mantle), then walk around on the roofs.
// =====================================================================
function twVillageClimb(G){ if(!G||!G.destr) return; const edge=(ix,iz)=>iz<=4||iz>=G.d-2||ix<=0||ix>=G.w-1; // the town's outer wall stays a wall
  const set=(p,ix,iz,h)=>{ if(ix<0||iz<0||ix>=G.w||iz>=G.d) return; (p.climb=p.climb||[]).push([ix,iz]); G.B[iz][ix]=false; G.H[iz][ix]=h; };
  for(const p of G.destr){
    if(p.kind==='house'){ const h=p.h-2, d=p.z1-p.z0, rh=d*.55, mid=(p.z0+p.z1)/2;
      for(let iz=p.z0;iz<p.z1;iz++) for(let ix=p.x0;ix<p.x1;ix++){ const k=Math.max(0,1-Math.abs(iz+.5-mid)/(d/2)); set(p,ix,iz,h+rh*k); } }
    else if(p.kind==='tree'){ for(let iz=Math.floor(p.z0);iz<=Math.floor(p.z1-.01);iz++) for(let ix=Math.floor(p.x0);ix<=Math.floor(p.x1-.01);ix++) if(!edge(ix,iz)) set(p,ix,iz,p.h*.85); }
    else if(p.kind==='stall'){ for(let ix=Math.floor(p.x0);ix<Math.floor(p.x1);ix++) set(p,ix,Math.floor(p.z0),p.h); }
    // the fountain: stand on the rim, climb again onto the bowl in the middle
    else if(p.kind==='fountain'){ const cx=p.cx, cz=p.cz; for(let iz=Math.floor(cz-1.5);iz<=Math.floor(cz+1.5);iz++) for(let ix=Math.floor(cx-1.5);ix<=Math.floor(cx+1.5);ix++){ const r=Math.hypot(ix+.5-cx,iz+.5-cz); if(r<1.9) set(p,ix,iz,r<.7?2.05:.62); } }
    // fences: a rail you can hop up on and walk along
    else if(p.kind==='fence'){ const iz=Math.floor(p.cz); for(let ix=Math.floor(p.x0);ix<=Math.floor(p.x1);ix++) if(!edge(ix,iz)) set(p,ix,iz,1); } } }
(function(){ const ll=loadLevel; loadLevel=function(key){ const r=ll.apply(this,arguments); if(L&&L.key==='village') twVillageClimb(L); return r; };
  const sp=smashProp; smashProp=function(p){ if(p&&p.climb&&L&&L.key==='village'){ for(const [ix,iz] of p.climb){ L.H[iz][ix]=0; L.B[iz][ix]=false; } p.climb=null; } return sp.apply(this,arguments); }; })();
// the mantle: push into something taller than a step (and not taller than a roof) and you run up it (the village, or wherever TW._mantle is on: Ali's tree)
(function(){ const up=updatePlayer; updatePlayer=function(dt){ const P=Player, r=up.apply(this,arguments);
    if(!L||(L.key!=='village'&&!TW._mantle)||Game.state!=='play'||Game.dlg||P.cineFly||P.scripted||P.hidden){ P.mantle=null; return r; }
    const M=P.mantle;
    if(M){ M.t+=dt; const u=Math.min(1,M.t/M.dur), e=u*(2-u); P.y=lerp(M.y0,M.y1+.08,e); P.vy=0; P.onGround=false;
      if(Math.random()<.5) FX.spawn(P.x+rnd(-.2,.2),P.y+.1,P.z+rnd(-.2,.2),0,-1,0,.25,0xcfc0a0,.2,0,false);
      if(u>=1){ P.mantle=null; const nx=P.x+M.dx*.55, nz=P.z+M.dz*.55; if(supportH(nx,nz,.3)<=M.y1+.15){ P.x=nx; P.z=nz; } P.y=Math.max(P.y,supportH(P.x,P.z,.3)); P.onGround=true; P.jumps=1; }
      return r; }
    const [mx,mz]=inputVec(), m=Math.hypot(mx,mz); if(m<.3||P.hurt>0||P.dash>0) return r; const dx=mx/m, dz=mz/m;
    const h=supportH(P.x+dx*.75,P.z+dz*.75,.2); if(h>500) return r; const rise=h-P.y;
    if(rise>.5&&rise<7){ /* 7: Ali's tree (6.6) is the tallest climb */ P.mantle={t:0,dur:.16+rise*.07,y0:P.y,y1:h,dx,dz}; P.vx=P.vz=0; Sound.sfx('jump'); FX.burst(P.x,P.y+.2,P.z,8,0xcfc0a0,2,.25,false); }
    return r; }; })();
