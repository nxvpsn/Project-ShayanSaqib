// =====================================================================
// THE DUO: CROSSFIRE. The fight is meant to be hectic: on top of the twins' choreographed move, the other things they can
// do keep arriving from everywhere, more often each phase: Omar's Getsugas from two edges, Caotan's blue line (jump) or a
// pink one (step off), scythes from the sky round you. Not during limit cuts, cutscenes, transitions, or when Debug holds
// them idle.
// =====================================================================
const DCH={gap:[0,5,3.4,2.4]};
function dchTick(F,dt){ if(!F||F.kind!=='duo'||F.lc||F.pend||!F.director||Game.script||Game.state!=='play'||!twPlay()) return; const C=F.C, O=F.O, ph=Math.min(3,F.phase||1), P=Player;
  F.chT=(F.chT==null?DCH.gap[ph]:F.chT)-dt; if(F.chT>0) return; F.chT=DCH.gap[ph]*rnd(.8,1.2);
  if(!F.chHint){ F.chHint=1; twBig('CROSSFIRE',{size:46,col:'#c08aff',y:UH*.24,dur:1.5,sub:'They never stop: watch every side'}); }
  const okO=O&&O.hp>0&&!O.down&&!O.gone, okC=C&&C.hp>0&&!C.down&&!C.gone, opts=[]; if(okO) opts.push('gets','sky'); if(okC) opts.push('blue','pink'); if(!opts.length) return;
  const k=opts[Math.floor(Math.random()*opts.length)];
  if(k==='gets'){ for(let i=0;i<(ph>=3?3:2);i++){ const e=twEdgePt(10); twGetsuga(O,Math.atan2(P.z-e.z,P.x-e.x)+rnd(-.12,.12),{x:e.x,z:e.z,warn:.7+i*.15,sp:13,len:22}); } Sound.sfx('void'); }
  else if(k==='sky'){ for(let i=0;i<(ph>=3?6:4);i++){ const a=rnd(0,6.28), r=i?rnd(1.2,4.5):0; twSkyScythe(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,.9+i*.08); } Sound.sfx('charge'); }
  else if(k==='blue'){ const a=rnd(0,Math.PI); twBlue(P.x,P.z,a,{warn:.8,dmg:2}); if(ph>=3) twBlue(P.x,P.z,a+Math.PI/2,{warn:1.1,dmg:2}); }
  else { const e=twEdgePt(9); twPink(e.x,e.z,Math.atan2(P.z-e.z,P.x-e.x),{warn:.85,dmg:2}); if(ph>=2){ const e2=twEdgePt(9); twPink(e2.x,e2.z,Math.atan2(P.z-e2.z,P.x-e2.x),{warn:1.15,dmg:2}); } } }
(function(){ const tu=twUpdate; twUpdate=function(dt){ const r=tu.apply(this,arguments); try{ dchTick(TW.fight,dt); }catch(e){ console.error('duo crossfire',e); } return r; }; })();
