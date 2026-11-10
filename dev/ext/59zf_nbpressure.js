// =====================================================================
// NATHAN, PRESSURE (phases II and III on Ali's road): like the twins' solo fights, his attacks now overlap. A sun funnel
// circles high above and marks the ground while he fights: GOLD circles (move out), one on you every few seconds in II,
// two or three in III, through his own moves. Gold only: it never collides with the red parry beat. He also waits less
// between moves. Not during limit cuts, the Starbreaker, sequences (dodges, flurries), stuns or cutscenes.
// =====================================================================
const NPR={gap:[0,0,5,3.2],cd:[0,9,.55,.3]};
function nprTick(dt){ if(!(typeof npOn==='function'&&npOn())||NP1.done||!NB||!NB.alive||NB.inv) return; const ph=NP1.ph||1; if(ph<2) return;
  if(NP1.seq||NP1.lcInv||NP1.cur==='lc'||NP1.ex||NP1.stunT>0||NB.stunned||Game.script||Cam.cine||NP1.cam||Game.state!=='play') return;
  if(!NP1.gen&&NP1.cd>NPR.cd[ph]&&NP1.cd<50) NP1.cd=NPR.cd[ph];
  NP1.prT=(NP1.prT==null?NPR.gap[ph]:NP1.prT)-dt; if(NP1.prT>0) return; NP1.prT=NPR.gap[ph]*rnd(.85,1.2); const P=Player;
  np1Hint('press','GOLD circles keep falling while he fights: keep moving');
  npStarCircle(P.x+P.vx*.3,P.z+P.vz*.3,2,1.15); if(ph>=3){ const n=1+(Math.random()<.5?1:0); for(let i=0;i<n;i++){ const a=rnd(0,6.28), r=rnd(2.6,5); npStarCircle(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,2,1.25+i*.1); } }
  Sound.sfx('charge'); }
(function(){ const nu=np1Update; np1Update=function(dt){ const r=nu.apply(this,arguments); try{ nprTick(dt); }catch(e){ console.error('np pressure',e); } return r; }; })();
