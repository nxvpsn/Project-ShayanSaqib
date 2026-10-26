// =====================================================================
// NATHAN, ROUND 3: harder. More bit formations, more quickboosting, less rest (build.py trims his cooldowns).
//   BIT CAROUSEL: a ring of bits closes on you and fires inward in a turning wave (the gap follows the wave)
//   BIT WALL: a line of bits sweeps across the field firing ahead; one gap, and it moves
//   HEXAGRAM: six bits draw a star of lasers around you, then the star turns
//   AFTERIMAGE BARRAGE: he quickboosts around you eight times; every path he flies lights up as a laser
//   BIT SWARM: a dozen bits chase you and pepper you with shots while he railguns
//   PHANTOM RUSH: five piercing dashes through you, the last one is a real slash (parry it: he is stunned)
// =====================================================================
function* nbCarousel(){ const n=NB.phase>=3?14:12, bs=[], P=Player, cx=P.x, cz=P.z, a0=rnd(0,6.28), dir=Math.random()<.5?1:-1; twBark('nathan',"Bit carousel! Round and round!",true); Sound.sfx('charge');
  for(let i=0;i<n;i++) bs.push(nbBit(NB.x,NB.y+2.5,NB.z));
  const st={r:9,a:a0}; const live={on:1}; Game.fxUpd.push(d=>{ if(!live.on) return false; st.a+=d*.6*dir; bs.forEach((b,i)=>{ if(!NBB.includes(b)) return; const a=st.a+i*6.283/n; b.x=cx+Math.cos(a)*st.r; b.z=cz+Math.sin(a)*st.r*.78; b.y=groundY(b.x,b.z)+1.4; b.m.position.set(b.x,b.y,b.z); b.m.lookAt(cx,b.y,cz); }); return true; });
  try{ yield .6; for(let w=0;w<3;w++){ st.r=lerp(9,6,w/2); const gap=Math.floor(Math.random()*n); for(let i=0;i<n;i++){ if(i===gap||i===(gap+1)%n) continue; const b=bs[i]; if(!NBB.includes(b)) continue; const P2=Player, a=Math.atan2(P2.z-b.z,P2.x-b.x);
        nbLaser({x0:b.x,z0:b.z,x1:b.x+Math.cos(a)*18,z1:b.z+Math.sin(a)*18,warn:.7/nbSp(),dur:.22,w:.8,dmg:2}); Sound.sfx('mechshot'); yield .06; }
      yield .9/nbSp(); const P3=Player, b2=rnd(0,6.28); nbBoost(P3.x+Math.cos(b2)*7,P3.z+Math.sin(b2)*5); yield* nbRailgun(1); }
  } finally { live.on=0; bs.forEach(b=>{ if(NBB.includes(b)) nbKillBit(b); }); } yield .3; }
function* nbBitWall(){ const A=nbArea(), n=9, horiz=Math.random()<.5, dir=Math.random()<.5?1:-1, bs=[]; twBark('nathan',"Bit wall! There is no running from a WALL!",true); Sound.sfx('charge');
  for(let i=0;i<n;i++) bs.push(nbBit(NB.x,NB.y+2.5,NB.z)); let gap=Math.floor(rnd(1,n-2));
  try{ for(let s=0;s<6;s++){ const u=s/5, line=horiz?lerp(dir>0?A.z0:A.z1,dir>0?A.z1:A.z0,u*.55):lerp(dir>0?A.x0:A.x1,dir>0?A.x1:A.x0,u*.55);
      bs.forEach((b,i)=>{ if(!NBB.includes(b)) return; const k=lerp(horiz?A.x0+1:A.z0+1,horiz?A.x1-1:A.z1-1,i/(n-1)); b.x=horiz?k:line; b.z=horiz?line:k; b.y=groundY(b.x,b.z)+1.4; b.m.position.set(b.x,b.y,b.z); });
      gap=clamp(gap+(Math.random()<.5?-1:1),1,n-2); const fa=horiz?(dir>0?Math.PI/2:-Math.PI/2):(dir>0?0:Math.PI);
      bs.forEach((b,i)=>{ if(i===gap||!NBB.includes(b)) return; nbLaser({x0:b.x,z0:b.z,x1:b.x+Math.cos(fa)*20,z1:b.z+Math.sin(fa)*20,warn:.6/nbSp(),dur:.25,w:1.25,dmg:2}); }); Sound.sfx('mechshot');
      yield .85/nbSp(); }
  } finally { bs.forEach(b=>{ if(NBB.includes(b)) nbKillBit(b); }); } yield .3; }
function* nbHexagram(){ const P=Player, cx=P.x, cz=P.z, bs=[], R=6, a0=rnd(0,6.28), dir=Math.random()<.5?1:-1; twBark('nathan',"Hexagram formation! Pretty, isn't it?",true); Sound.sfx('charge');
  for(let i=0;i<6;i++){ const b=nbBit(NB.x,NB.y+2.5,NB.z), a=a0+i*1.047; b.x=cx+Math.cos(a)*R; b.z=cz+Math.sin(a)*R*.8; b.y=groundY(b.x,b.z)+1.4; b.m.position.set(b.x,b.y,b.z); bs.push(b); }
  const star=(rot,warn,dur)=>{ for(const [i,j] of [[0,2],[2,4],[4,0],[1,3],[3,5],[5,1]]){ const A0=a0+i*1.047+rot, B0=a0+j*1.047+rot; nbLaser({x0:cx+Math.cos(A0)*R,z0:cz+Math.sin(A0)*R*.8,x1:cx+Math.cos(B0)*R,z1:cz+Math.sin(B0)*R*.8,warn,dur,w:.9,dmg:3}); } };
  try{ yield .4; star(0,.9,.3); yield 1.3; for(let k=1;k<=3;k++){ star(dir*k*.35,.65/nbSp(),.3); bs.forEach((b,i)=>{ const a=a0+i*1.047+dir*k*.35; b.x=cx+Math.cos(a)*R; b.z=cz+Math.sin(a)*R*.8; b.m.position.set(b.x,b.y,b.z); }); yield 1; }
    const P2=Player; bs.forEach(b=>{ const a=Math.atan2(P2.z-b.z,P2.x-b.x); nbLaser({x0:b.x,z0:b.z,x1:b.x+Math.cos(a)*16,z1:b.z+Math.sin(a)*16,warn:.75,dur:.3,w:1,dmg:3}); }); yield 1.1;
  } finally { bs.forEach(b=>{ if(NBB.includes(b)) nbKillBit(b); }); } }
function* nbAfterimage(){ twBark('nathan',"Quickboost overdrive! Count my afterimages!",true); const n=NB.phase>=3?9:7;
  for(let i=0;i<n;i++){ const P=Player, a=rnd(0,6.28), r=rnd(5,8), x0=NB.x, z0=NB.z; nbBoost(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r*.75); const x1=NB.x, z1=NB.z;
    nbLaser({x0,z0,x1,z1,warn:.45/nbSp(),dur:.2,w:1.2,dmg:2}); if(i%3===2){ const P2=Player; for(let k=-1;k<=1;k++) nbShot(NB.x,NB.z,Math.atan2(P2.z-NB.z,P2.x-NB.x)+k*.25,9); Sound.sfx('mechshot'); } yield .26/nbSp(); }
  yield .7; }
function* nbSwarm(){ const n=NB.phase>=3?12:9, bs=[]; twBark('nathan',"Swarm! Bite him, bits!",true); Sound.sfx('charge'); for(let i=0;i<n;i++) bs.push(nbBit(NB.x,NB.y+2.5,NB.z));
  const s={t:0}; try{ while(s.t<4.2){ s.t+=.05; bs.forEach((b,i)=>{ if(!NBB.includes(b)) return; const P=Player, a=s.t*1.5+i*6.283/n, tx=P.x+Math.cos(a)*(3.5+Math.sin(s.t*2+i)*1.5), tz=P.z+Math.sin(a)*2.8; b.x=lerp(b.x,tx,.12); b.z=lerp(b.z,tz,.12); b.y=groundY(b.x,b.z)+1.6; b.m.position.set(b.x,b.y,b.z); b.m.lookAt(P.x,b.y,P.z);
        if(Math.random()<.035){ const aa=Math.atan2(P.z-b.z,P.x-b.x); spawnProj({kind:'orb',x:b.x,y:b.y-.4,z:b.z,vx:Math.cos(aa)*8,vz:Math.sin(aa)*8,col:0x3ff4ff,dmg:1,life:2,src:NB}); } });
      if(Math.abs(s.t-1.5)<.03||Math.abs(s.t-3.2)<.03) yield* nbRailgun(1); yield .05; }
  } finally { bs.forEach(b=>{ if(NBB.includes(b)) nbKillBit(b); }); } yield .3; }
function* nbPhantomRush(){ const C={n:1,par:0}; twBark('nathan',"Phantom rush! You can't parry what you can't SEE!",true);
  for(let i=0;i<5;i++){ const P=Player, a=i*1.257+rnd(-.3,.3); nbBoost(P.x+Math.cos(a)*7.5,P.z+Math.sin(a)*5.5); yield .12; const P2=Player, b=Math.atan2(P2.z-NB.z,P2.x-NB.x), ex=NB.x+Math.cos(b)*15, ez=NB.z+Math.sin(b)*15;
    if(i<4){ nbLaser({x0:NB.x,z0:NB.z,x1:ex,z1:ez,warn:.36/nbSp(),dur:.12,w:1.5,dmg:3}); Sound.sfx('charge'); yield .36/nbSp(); nbBoost(ex,ez); yield .1; }
    else { FX.spawn(NB.x,NB.y+3.6,NB.z,0,0,0,.25,0xffffff,1,0,true); Sound.sfx('ting'); yield .2; const P3=Player; nbBoost(P3.x-Math.cos(b)*1.9,P3.z-Math.sin(b)*1.9); FX.line(NB.x,NB.z,b,3.4,2.4,0x3ff4ff,.28); yield .28;
      if(nbStrike(C)){ twComboBroken(NB.x,NB.z); twBark('nathan',"You SAW that?!",true); yield* nbStunned(2.4); return; } } }
  yield .4; }
(function(){ const np=nbPattern; nbPattern=function(k){ const M={carousel:nbCarousel,bitWall:nbBitWall,hexagram:nbHexagram,afterimage:nbAfterimage,swarm:nbSwarm,phantom:nbPhantomRush}; if(M[k]) return M[k](); return np(k); };
  NB_POOL[1].push('afterimage','bitWall','phantom');
  NB_POOL[2].push('carousel','bitWall','hexagram','afterimage','swarm','phantom');
  for(const k of [3,4]) NB_POOL[k].push('carousel','bitWall','hexagram','afterimage','swarm','phantom','carousel','afterimage'); })();
// faster between moves: more quickboosts when idle, and he dodges Getsugas more often
(function(){ const ns=nbSp; nbSp=function(){ return ns()+.08; }; })();
