// =====================================================================
// BIG BACK HAMZA, ONE PHASE (round 5): no phase II, no limit cuts (ALL-YOU-CAN-EAT, LAST CALL). His one phase mixes his
// phase I moves with phase II's (meteor, baby rain) and pieces of the old limit cuts as moves of their own: two lane rolls
// to parry, the Big Bite, a ring of babies dropping round you. At zero he starts to ascend into SPACE HAMZA and the twins
// kill him first: Omar's black hole sucks him up, Caotan's mega laser goes in after him. Then the twins turn (twTwinsTurn).
// =====================================================================
HZG.laneRolls=function*(G,ph){ twBark('hamza',"PORK ROLLS! Two! Parry them or be the filling!",true); for(let k=0;k<2;k++){ yield* hzgLaneRoll(G,null); yield .25; } };
HZG.bigBite=function*(G,ph){ twBark('hamza',"Dessert. ...You. ITADAKIMASU!",true); yield* hzgBigBite(G,5.2); };
HZG.babyRing=function*(G,ph){ const P=Player, n=8, cx=P.x, cz=P.z; twBark('hamza',"Children! Hug the blacksmith! From ABOVE!",true); G.mouth=1; Sound.sfx('oink');
  for(let i=0;i<n;i++){ const a=i/n*6.283, q=twClampXZ(cx+Math.cos(a)*3.6,cz+Math.sin(a)*3.6,1); FX.ring(q.x,groundY(q.x,q.z)+.08,q.z,'#ffb0c8',1.2,.6); } yield .6;
  for(let i=0;i<n;i++){ const a=i/n*6.283, q=twClampXZ(cx+Math.cos(a)*3.6,cz+Math.sin(a)*3.6,1); hzgBaby(q.x,q.z,{drop:1,h:7}); } Sound.sfx('oink'); G.mouth=0; yield 1; };
HZG_POOL[1]=['bounce','flop','stampede','babies','meteor','babyRain','laneRolls','bigBite','babyRing'];
/* phase II: 59k_hamza6 */

// phase I at zero: the transition is 59k_hamza6's KAWAII BULK; phase II at zero: this finale
hzgFinale=function*(){ const G=TW.giant, P=Player, H=Game.hamza, C=hzgAlly('caotan'), O=hzgAlly('omar'); if(!G) return;
  hzgClearBabies(); twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); Sound.stop(); Game.letterTo=1; P.inv=99; G.inv=true; G.noBar=1; G.gen=null; G.roll=0; G.mouth=.4; G.frenzied=1;
  const gy=groundY(G.x,G.z); for(const A of [C,O]) if(A){ A.hold=1; A.air=0; }
  // he starts to ascend: glowing, floating, stars gathering
  FX.flash=.8; impactFrame([[1,2],[2,2]]); Sound.sfx('crash'); shake(1); hzGl(G.x+3,gy+1.6,G.z+9,G.x,gy+2.8,G.z); yield wait(.6);
  yield say('hamza',"Oink... you think... THIS is my final form?");
  const asc={on:1}; Game.fxUpd.push(()=>{ if(!asc.on||!TW.giant) return false; G.flash=.15+.15*Math.sin(Game.time*20); for(let i=0;i<4;i++){ const a=rnd(0,6.28), r=rnd(2,6); FX.spawn(G.x+Math.cos(a)*r,G.y+rnd(0,5),G.z+Math.sin(a)*r,-Math.cos(a)*r*.8,rnd(1,3),-Math.sin(a)*r*.8,.6,i%2?0xbfe8ff:0xffffff,.3,0,true); } return true; });
  Sound.sfx('choir'); Sound.sfx('charge'); hzGl(G.x,gy+.6,G.z+12,G.x,gy+4,G.z); yield tween(G,{air:2.2},1.2,twEIO);
  yield say('hamza',"Hamza is ascending! To SPACE! SPACE HAMZA! Eight billion lullabies, and I will EAT them ALL!",'angry');
  if(C&&O){ C.x=G.x-5; C.z=G.z+3; O.x=G.x+5; O.z=G.z+3; }
  hzGl(P.x-1,P.y+1.2,P.z+3.2,P.x,P.y+1.5,P.z); yield say('shayan',"Hamza, NO! If you go to space, you'll eat the—",'surprised');
  // Omar: a black hole over him
  if(O){ hzGl(O.x+1,gy+1.6,O.z+3,O.x,gy+1.8,O.z); yield say('omar',"Not today, pig. Void. Open."); O.cast=2; O.scythe=1; }
  const hy=gy+11, V=twHoleVis(G.x,hy,G.z,2.2,true); const hole={k:0,on:1}; Game.fxUpd.push(dt=>{ if(!hole.on){ V.kill(); return false; } V.t+=dt||1/60; V.set(hole.k); return true; });
  Sound.sfx('void'); Sound.sfx('suck'); shake(.6); hzGl(G.x+2,gy+1.2,G.z+16,G.x,gy+7,G.z); yield tween(hole,{k:1},.9,twEOut3);
  // it pulls him up and in, shrinking and spinning
  yield say('hamza',"Wait— my snacks— the SNACKS are getting sucked up too— NOOO—",'surprised');
  Sound.sfx('suck'); Game.fxUpd.push(()=>{ if(!hole.on||!TW.giant) return false; for(let i=0;i<6;i++){ const a=rnd(0,6.28), r=rnd(3,9); FX.spawn(G.x+Math.cos(a)*r,gy+rnd(.2,3),G.z+Math.sin(a)*r,-Math.cos(a)*r*1.2,rnd(4,9),-Math.sin(a)*r*1.2,.7,i%2?0x8a2aff:0xffb0c8,.3,0,i%2===0); } return true; });
  yield tween(G,{air:hy-gy-1.6,gs:.22},1.6,t=>t*t); asc.on=0; G.flash=0; shake(.5);
  // Caotan: the mega laser, into the hole
  if(C){ hzGl(C.x-1.2,gy+1.4,C.z+3.4,C.x,gy+1.8,C.z); yield say('caotan',"Senpai, close your eyes! MEGANE... MEGA... LASER!!!",'angry'); C.push=.8; C.glintT=1; Sound.sfx('ting'); }
  twCutin('caotan','MEGA LASER','Forbidden Twin Art  ·  black hole + megane','#ff6ab0',1.6); yield wait(1.2);
  const sx=C?C.x:P.x, sy=(C?C.y:P.y)+1.9, sz=C?C.z:P.z, beam=[beamMesh(0xff5aa8,1),beamMesh(0xffffff,.42)], bm={w:0};
  for(const m of beam){ m.userData.tw=1; scene.add(m); }
  Game.fxUpd.push(()=>{ if(bm.dead){ beam.forEach(m=>scene.remove(m)); return false; } const j=1+Math.sin(Game.time*60)*.08; beam.forEach((m,i)=>twBeamTo(m,sx,sy,sz,G.x,hy,G.z,Math.max(.01,bm.w*(i?1:1.8)*j))); for(let i=0;i<3;i++){ const u=Math.random(); FX.spawn(lerp(sx,G.x,u),lerp(sy,hy,u),lerp(sz,G.z,u),rnd(-2,2),rnd(-2,2),rnd(-2,2),.4,i%2?0xff5aa8:0xffffff,.35,0,true); } return true; });
  Sound.sfx('beam'); Sound.sfx('crossboom'); FX.flash=1; grade.uniforms.flashCol.value.set(1,.5,.8); impactFrame([[1,2],[2,1],[3,2]]); shake(1.4); hzGl(sx-6,gy+3,sz+12,(sx+G.x)/2,(sy+hy)/2,G.z);
  yield tween(bm,{w:1.2},.25,twEOut3); yield wait(1.1);
  // the hole collapses with him in it
  hzGl(G.x,gy+3,G.z+18,G.x,hy-1,G.z); impactFrame([[3,3],[1,2],[2,2],[3,2]]); Sound.sfx('crossboom'); Sound.sfx('gore'); Sound.sfx('slam'); shake(1.8); FX.hitstop=.15; FX.flash=1; grade.uniforms.flashCol.value.set(1,1,1);
  if(gpSprite){ gpSprite.draw((c,cx,by)=>drawGiantPig(c,cx,by,H?H.f:1,{t:H?H.t:0,mouth:.4,front:0,drip:0,flash:0})); gibsFromSprite(gpSprite,{cols:8,rows:6,n:40}); gpSprite.show(false); }
  for(let i=0;i<160;i++) FX.spawn(G.x+rnd(-1,1),hy-1+rnd(-1,1),G.z,rnd(-9,9),rnd(-4,9),rnd(-4,4),rnd(.6,1.4),[0x7a000c,0xb0101a,0xffb0c8][i%3],rnd(.3,.6),12,false);
  FX.burst(G.x,hy,G.z,90,0xff5aa8,10,.5); FX.burst(G.x,hy,G.z,60,0x1a0626,9,.5,false);
  TW.giant=null; TW.giantRespawn=null; if(H) H.mode='hidden'; Game.hamza=null; TW.fight=null;
  yield tween(bm,{w:0},.3); bm.dead=1; yield tween(hole,{k:0},.5,t=>t*t); hole.on=0; yield wait(.8);
  for(const A of [C,O]) if(A){ A.hold=0; A.air=0; A.cast=0; A.push=0; }
  hzGl(P.x+1.4,P.y+1.8,P.z+6.2,P.x,P.y+1.05,P.z); yield say('',"Hamza came apart into a fine pink mist, somewhere between a black hole and a laser. Space Hamza was never born. Eight billion lullabies were never eaten.");
  yield say('shayan',"...GG, Hamza.");
  twCineGlideEnd(); yield* twTwinsTurn(); };
