// =====================================================================
// BIG BACK HAMZA, PHASE II (round 6). Two phases again, the twins still kill him at the end of II (59j's finale):
//   I   bounce, flop, stampede, babies, lane rolls, baby ring
//   II  KAWAII BULK: he eats Hikari-chan (Caotan's body pillow) and goes pink. Adds meteor, baby rain, the Big Bite and
//       KAWAII STOMP (pink rings along the ground: jump them). Limit cut at 50%: MUKBANG LIVE (piglet donations rain
//       while he stomps, then SMASH THAT LIKE BUTTON: three belly flops on you, faster each, parry the landings; then
//       FOOD COMA, 5s stunned)
// The transition is a script (say/wait/tween); the limit cut is his generator (seconds), cleaned up by TW.lcCleanup.
// =====================================================================
HZG.kawaiiStomp=function*(G,ph){ const gy=groundY(G.x,G.z); twBark('hamza',"Kawaii... STOMP! Uwu! Bismillah!",true); G.mouth=1; Sound.sfx('pigroar');
  for(let k=0;k<3;k++){ G.air=1.6; yield .32; G.air=0; Sound.sfx('slam'); shake(.6); FX.burst(G.x,gy+.3,G.z,30,0xff6ab0,6,.35); FX.burst(G.x,gy+.3,G.z,16,0xffffff,5,.3);
    twWave(G.x,G.z,{sp:k===2?9:7.5,max:13,col:0xff3a8a,dmg:2}); yield .5; }
  G.mouth=0; yield .5; };
HZG_POOL[1]=['bounce','flop','stampede','babies','laneRolls','babyRing'];
HZG_POOL[2]=['bounce','flop','stampede','babies','meteor','babyRain','laneRolls','bigBite','babyRing','kawaiiStomp','kawaiiStomp'];

// ---------- I -> II: KAWAII BULK ----------
hzgPhase2=function*(){ const G=TW.giant, P=Player, C=hzgAlly('caotan'), O=hzgAlly('omar'); if(!G) return; const gy=groundY(G.x,G.z);
  hzgClearBabies(); twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); Sound.stop(); Game.letterTo=1; P.inv=99; G.inv=true; G.gen=null; G.roll=0; G.air=0; G.mouth=.3; for(const A of [C,O]) if(A){ A.hold=1; A.air=0; }
  cineSet(G.x+2,gy+2,G.z+9,G.x,gy+2.6,G.z); yield wait(.4); yield say('hamza',"Oink... Hamza is... not... full...");
  if(C&&O){ C.x=G.x-4.5; C.z=G.z+2.5; O.x=G.x+4.5; O.z=G.z+2.5; cineSet(C.x-1,gy+1.5,C.z+3.4,C.x,gy+1.6,C.z);
    yield say('caotan',"Senpai, I'll pin him! HIKARI-CHAN, BODY PILLOW SLAM!",'angry');
    // the pillow flies... into his mouth
    const pil=new THREE.Mesh(new THREE.BoxGeometry(.5,1.6,.25),new THREE.MeshLambertMaterial({color:0xffb0d8})); pil.userData.tw=1; scene.add(pil); const fl={u:0};
    Game.fxUpd.push(()=>{ if(fl.done){ scene.remove(pil); return false; } const u=fl.u; pil.position.set(lerp(C.x,G.x,u),lerp(gy+1.6,gy+2.6,u)+Math.sin(u*Math.PI)*2.5,lerp(C.z,G.z+.6,u)); pil.rotation.z=u*12; pil.rotation.x=u*5; return true; });
    cineSet(G.x-3,gy+2,G.z+8,G.x-1,gy+2.6,G.z); Sound.sfx('whoosh'); yield tween(fl,{u:1},.7,t=>t); fl.done=1;
    G.mouth=1; Sound.sfx('chomp'); impactFrame([[1,2],[2,1]]); shake(.7); FX.burst(G.x,gy+2.6,G.z+.8,40,0xffb0d8,6,.4); yield wait(.3); Sound.sfx('chomp'); yield wait(.25); Sound.sfx('chomp');
    cineSet(C.x-.8,gy+1.5,C.z+2.6,C.x,gy+1.6,C.z); yield say('caotan',"...He ate Hikari-chan.",'sad');
    cineSet(O.x+.8,gy+1.5,O.z+2.6,O.x,gy+1.7,O.z); yield say('omar',"Rest in pillow."); }
  cineSet(G.x+1.5,gy+2.2,G.z+7,G.x,gy+2.8,G.z); yield say('hamza',"Soft. Tastes like anime. Hamza feels... KAWAII.");
  // he goes pink and bigger
  Sound.sfx('choir'); const gl={on:1}; Game.fxUpd.push(()=>{ if(!gl.on||!TW.giant) return false; G.flash=.12+.12*Math.sin(Game.time*24); for(let i=0;i<5;i++){ const a=rnd(0,6.28), r=rnd(2,6); FX.spawn(G.x+Math.cos(a)*r,G.y+rnd(.5,5),G.z+Math.sin(a)*r,0,rnd(1,3),0,.7,i%2?0xff6ab0:0xffffff,.32,0,true); } return true; });
  cineSet(G.x,gy+.5,G.z+11,G.x,gy+5,G.z); yield tween(G,{gs:(G.gs||.55)*1.25},1.1,t=>1-Math.pow(1-t,3)); gl.on=0; G.flash=0; Sound.sfx('pigroar'); shake(1); impactFrame([[3,2],[1,2]]);
  try{ grade.uniforms.tint.value.set(1.08,.94,1.04); }catch(e){}
  evaCard(['PHASE II','KAWAII BULK'],1.8,1); yield wait(1.8);
  twCamP(6.2,1.2); yield say('shayan',"Hamza, buddy. Spit out the waifu.",'angry');
  if(C){ cineSet(C.x-.8,gy+1.5,C.z+2.6,C.x,gy+1.6,C.z); yield say('caotan',"I'LL AVENGE YOU, HIKARI-CHAN!!",'angry'); }
  G.phase=2; G.hp=G.maxHp=HZG_HP[2]; G.inv=false; G.pend=null; G.bag=[]; G.cd=1.2; G.mouth=0; G.lcDone=0; G.air=0; Sound.play('diva'); for(const A of [C,O]) if(A){ A.hold=0; A.air=0; }
  yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.7); Cam.cine=null; Game.letterTo=0; P.inv=1; };

// ---------- LIMIT CUT (II, 50%): MUKBANG LIVE ----------
hzgBuffet=function*(G){ const c=G.center||twCenter(), P=Player, gy=groundY(c.x,c.z); G.inv=true; G.mouth=0; G.mv=null; G.roll=0; /* this generator IS G.gen: never null it here */
  const C=hzgAlly('caotan'), O=hzgAlly('omar'), cleanup=()=>{ Game.letterTo=0; G.mouth=0; G.air=0; G.roll=0; G.landParry=0; TW.hg=null; P.inv=Math.min(P.inv,1); twCamFree(1.32); for(const A of [C,O]) if(A){ A.hold=0; A.air=0; } };
  TW.lcCleanup=cleanup;
  try{
    Game.letterTo=.4; P.inv=Math.max(P.inv,5); for(const A of [C,O]) if(A){ A.hold=1; A.air=1.3; }
    yield* twGenCam([G.x+3,gy+2.4,G.z+13],[G.x,gy+3,G.z],.7); Sound.sfx('pigroar'); shake(.6); twBark('hamza',"Hello chat! Today's mukbang... is YOU. Bismillah!",true); yield 1.4;
    if(C) twBark('caotan',"Chat, report this stream. Senpai is NOT on the menu.",true);
    yield* twGenCam([c.x,gy+13,c.z+20],[c.x,gy+1,c.z],1.1); twCutin('hamza','MUKBANG LIVE','Limit Break  ·  smash that like button','#ff3a6a',1.8); yield 1.1;
    Game.letterTo=0; twCamFree(1.55); P.inv=1.2; for(const A of [C,O]) if(A){ A.hold=0; A.air=0; }
    // part one: DONATIONS: piglets rain everywhere while he stomps
    twBig('LIVE · DONATIONS',{size:48,col:'#ff3a6a',y:UH*.24,dur:1.4,sub:'Piglets rain. He stomps: jump the pink rings'}); twBark('hamza',"Thank you for the twenty piglets! Children, bite!",true);
    TW.hg={left:20,total:20,label:'DONATIONS'}; hzgRain(20,5); G.inv=false;
    yield* HZG.kawaiiStomp(G,2); if(TW.hg) TW.hg.left=10; yield 1; if(O) twBark('omar',"I donated nothing. I want that on record.",true); yield* HZG.kawaiiStomp(G,2); TW.hg=null; yield .6;
    // part two: SMASH THAT LIKE BUTTON: three belly flops on you, faster each, parry the landings
    twBig('SMASH THAT LIKE BUTTON',{size:46,col:'#ffd45a',y:UH*.24,dur:1.4,sub:'Three flops on you: attack as he lands'}); twBark('hamza',"SMASH THAT LIKE BUTTON! Hamza is the button!",true);
    G.landParry=1; TW.hg={left:3,total:3,label:'LIKES'};
    try{ for(let k=0;k<3;k++){ const Pp=Player; yield* hzgLeap(G,Pp.x+Pp.vx*.35,Pp.z+Pp.vz*.35,[1,.85,.7][k],k===2?7:5,2.6,3,k===2?2:0,true); TW.hg.left=2-k; yield .35; } } finally{ G.landParry=0; }
    TW.hg=null; yield .4;
  } finally { TW.lcCleanup=null; cleanup(); }
  twBig('FOOD COMA',{size:60,col:'#ffd45a',sub:'Stream ended. Hamza is stunned: go!'}); twBark('hamza',"...Like and subscribe... zzz...",true); G.inv=false; G.stun=5; yield 5; };
