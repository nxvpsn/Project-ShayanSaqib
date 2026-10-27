// =====================================================================
// CONTINUITY: things the story breaks stay broken.
// - Props smashed in a level stay smashed when the story reloads that level in the same run (Shayan wrecks the town,
//   gets kicked to the moon, and Ali lands in the same wrecked town). A new game or a timeline warp starts clean.
// - Once Ali has cut the moon, every sky that has a moon shows the fragments instead.
// =====================================================================
const CTY={smash:{}};
function contReset(){ CTY.smash={}; }
(function(){ const sp=smashProp; smashProp=function(p){ try{ if(L&&L.destr&&!CTY.quiet){ const i=L.destr.indexOf(p); if(i>=0) (CTY.smash[L.key]=CTY.smash[L.key]||new Set()).add(i); } }catch(e){ console.error('cont smash',e); } return sp.apply(this,arguments); };
  const ng=newGame; newGame=function(){ contReset(); return ng.apply(this,arguments); };
  const wr=twWarpReset; twWarpReset=function(){ contReset(); return wr.apply(this,arguments); };
  const ll=loadLevel; loadLevel=function(){ const r=ll.apply(this,arguments); try{ contApply(); }catch(e){ console.error('continuity',e); } return r; }; })();
// re-smash quietly: no sound, no shake, no debris, gone at once
function contApply(){ const set=CTY.smash[L.key]; if(set&&L.destr){ const s0=Sound.sfx, sh=shake, fs=FX.spawn, fb=FX.burst, nd=Game.debris.length; CTY.quiet=1;
    Sound.sfx=()=>{}; shake=()=>{}; FX.spawn=()=>{}; FX.burst=()=>{};
    try{ for(const i of set){ const p=L.destr[i]; if(!p||p.dead) continue; smashProp(p); p.meshes.forEach(m=>L.root.remove(m)); p.meshes=[]; p.dying=null; } }
    finally{ Sound.sfx=s0; shake=sh; FX.spawn=fs; FX.burst=fb; CTY.quiet=0; FX.hitstop=0; Game.debris.splice(nd).forEach(g=>scene.remove(g.m)); } }
  if(Game.flags&&Game.flags.moonCut&&L.skyMoon&&L.skyMoon.visible){ const M=L.skyMoon, mt=M.material.map, w=M.geometry.parameters?M.geometry.parameters.width:40; M.visible=false; L.moonFrags=[];
    for(let i=0;i<11;i++){ const s=w*(.14+hash(i,1)*.28), f=farPlane(L,mt,s,s,M.position.x+(hash(i,2)-.5)*w*2.4,M.position.y+(hash(2,i)-.5)*w*.9,M.position.z-hash(i,3)*20,{ro:-7,add:true}); f.rotation.z=hash(i,4)*6; L.moonFrags.push(f); } } }
