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
  if(!TW.hzStompHint){ TW.hzStompHint=1; twBig('JUMP THE PINK RINGS',{size:44,col:'#ff6ab0',y:UH*.24,dur:1.6,sub:'Each stomp sends one along the ground'}); }
  for(let k=0;k<3;k++){ G.air=1.6; yield .32; G.air=0; Sound.sfx('slam'); shake(.6); FX.burst(G.x,gy+.3,G.z,30,0xff6ab0,6,.35); FX.burst(G.x,gy+.3,G.z,16,0xffffff,5,.3);
    twWave(G.x,G.z,{sp:k===2?9:7.5,max:13,col:0xff3a8a,dmg:2}); yield .5; }
  G.mouth=0; yield .5; };
HZG_POOL[1]=['bounce','flop','stampede','babies','laneRolls','babyRing'];
HZG_POOL[2]=['bounce','flop','stampede','babies','meteor','babyRain','laneRolls','bigBite','babyRing','kawaiiStomp','kawaiiStomp'];

// ---------- I -> II: KAWAII BULK ----------
hzgPhase2=function*(){ const G=TW.giant, P=Player, C=hzgAlly('caotan'), O=hzgAlly('omar'); if(!G) return; const gy=groundY(G.x,G.z);
  hzgClearBabies(); twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); Sound.stop(); Game.letterTo=1; P.inv=99; G.inv=true; G.gen=null; G.roll=0; G.air=0; G.mouth=.3; for(const A of [C,O]) if(A){ A.hold=1; A.air=0; }
  hzGl(G.x+2,gy+2,G.z+9,G.x,gy+2.6,G.z); yield wait(.5); yield say('hamza',"Oink... Hamza is... not... full...");
  if(C&&O){ C.x=G.x-5; C.z=G.z+2.5; O.x=G.x+5; O.z=G.z+2.5; hzGl(C.x-1,gy+1.5,C.z+3.4,C.x,gy+1.6,C.z);
    yield say('caotan',"He's down! Senpai, watch this! HIKARI-CHAN... FINAL BODY PILLOW SLAM!!",'angry');
    // the pillow spins across the field in slow motion... and he catches it in his teeth
    const pil=new THREE.Mesh(new THREE.BoxGeometry(.6,1.9,.3),new THREE.MeshLambertMaterial({color:0xffb0d8})); pil.userData.tw=1; scene.add(pil); const fl={u:0,sh:0,on:1};
    Game.fxUpd.push(()=>{ if(!fl.on){ scene.remove(pil); return false; } const u=fl.u; pil.position.set(lerp(C.x,G.x-.3,u)+rnd(-1,1)*fl.sh,lerp(gy+1.6,gy+2.7,u)+Math.sin(u*Math.PI)*3+rnd(-1,1)*fl.sh,lerp(C.z,G.z+.9,u)); pil.rotation.z=u*14+fl.sh*Math.sin(Game.time*40)*1.2; pil.rotation.x=u*5; if(u<1&&Math.random()<.5) FX.spawn(pil.position.x,pil.position.y,pil.position.z,0,.5,0,.4,0xffd0ec,.2,0,true); return true; });
    hzGl((C.x+G.x)/2,gy+3,G.z+12,(C.x+G.x)/2,gy+2.6,G.z); Sound.sfx('whoosh'); Game.slowT=Math.max(Game.slowT||0,.6); yield tween(fl,{u:1},1,t=>t*t*(3-2*t));
    G.mouth=1; Sound.sfx('chomp'); impactFrame([[1,2],[2,1]]); shake(.8); FX.hitstop=.1; hzGl(G.x-1.5,gy+2.6,G.z+7,G.x-.3,gy+2.7,G.z);
    yield wait(.35); yield say('caotan',"...Hamza? Hamza, that's not food. That's my WIFE.",'surprised');
    // he shakes her like a dog with a toy: feathers, then red
    fl.sh=.35; for(let i=0;i<7;i++){ Sound.sfx('chomp'); shake(.35); FX.burst(G.x-.3,gy+2.7,G.z+.9,14,0xffffff,5,.5,false); if(i>=2){ FX.burst(G.x-.3,gy+2.6,G.z+.9,18,i%2?0xb0101a:0x7a000c,6,.5,false); for(let k=0;k<6;k++) FX.spawn(G.x-.3+rnd(-.4,.4),gy+2.4,G.z+1,rnd(-2,2),rnd(-1,3),rnd(1,4),rnd(.5,1),0xb0101a,.3,14,false); } if(i===4){ impactFrame([[3,2],[1,1]]); FX.flash=.4; grade.uniforms.flashCol.value.set(.8,.05,.1); Sound.sfx('gore'); } yield wait(.16); }
    fl.on=0; Game.pigDrip=1; G.mouth=.2; Sound.sfx('gore'); yield wait(.3);
    hzGl(O.x+.8,gy+1.5,O.z+2.6,O.x,gy+1.7,O.z); yield say('omar',"...Caotan. The pillow is bleeding. Pillows do not bleed. What was IN that pillow?");
    hzGl(C.x-.8,gy+1.5,C.z+2.6,C.x,gy+1.6,C.z); yield say('caotan',"...Love.",'sad'); Sound.sfx('heartbeat'); yield wait(.4); yield say('caotan',"HIKARI-CHAAAAAN!!",'angry'); }
  // gulp. The pink takes him: he rises, swells, and the roar throws the twins back
  hzGl(G.x+1.5,gy+2.2,G.z+7,G.x,gy+2.8,G.z); Sound.sfx('squelch'); G.mouth=0; yield wait(.4); yield say('hamza',"Soft. Tastes like anime. Hamza feels... KAWAII.");
  Sound.sfx('choir'); const gl={on:1}; Game.fxUpd.push(()=>{ if(!gl.on||!TW.giant) return false; G.flash=.12+.12*Math.sin(Game.time*24); for(let i=0;i<5;i++){ const a=rnd(0,6.28), r=rnd(2,6); FX.spawn(G.x+Math.cos(a)*r,G.y+rnd(.5,5),G.z+Math.sin(a)*r,-Math.cos(a)*r*.8,rnd(1,3),-Math.sin(a)*r*.8,.7,i%2?0xff6ab0:0xffffff,.32,0,true); } return true; });
  hzGl(G.x,gy+3,G.z+15,G.x,gy+4,G.z); G.air=0; yield tween(G,{air:2.2,gs:(G.gs||.55)*1.25},1.3,t=>1-Math.pow(1-t,3)); gl.on=0; G.flash=0;
  Sound.sfx('pigroar'); shake(1.2); impactFrame([[3,2],[1,2],[2,1]]); FX.flash=.7; grade.uniforms.flashCol.value.set(1,.5,.8); for(let i=0;i<3;i++) FX.ring(G.x,gy+.1,G.z,i%2?'#ffffff':'#ff6ab0',5+i*4,.5+i*.12); twHeartBurst(G.x,G.z,30);
  if(C&&O){ twAnim(C,{x:C.x-3.5},.4,twEOut3); twAnim(O,{x:O.x+3.5},.4,twEOut3); } try{ grade.uniforms.tint.value.set(1.08,.94,1.04); }catch(e){} yield tween(G,{air:0},.35,t=>t*t); Sound.sfx('slam'); shake(1); FX.burst(G.x,gy+.4,G.z,60,0xff6ab0,9,.5);
  // the title rides a slow pull back from him
  twZeldaCard('Phase II','Kawaii Bulk','He ate the waifu',3); twCineGlide(G.x-5,gy+9,G.z+19,G.x,gy+3,G.z,.7); yield wait(3); Game.pigDrip=0;
  twCineGlide(P.x+1.2,P.y+5.5,P.z+9,P.x,P.y+1.05,P.z); yield say('shayan',"Hamza, buddy. Spit out the waifu.",'angry');
  if(C){ hzGl(C.x-.8,gy+1.5,C.z+2.6,C.x,gy+1.6,C.z); yield say('caotan',"I'LL AVENGE YOU, HIKARI-CHAN!! ...Senpai, hold me back. No. Don't. HOLD ME FORWARD.",'angry'); }
  G.phase=2; G.hp=G.maxHp=HZG_HP[2]; G.inv=false; G.pend=null; G.bag=[]; G.cd=1.2; G.mouth=0; G.lcDone=0; G.air=0; Sound.play('diva'); for(const A of [C,O]) if(A){ A.hold=0; A.air=0; }
  twCineGlideEnd(); yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.7); Cam.cine=null; Game.letterTo=0; P.inv=1; };

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
// phase II's look: pink sparkles and the odd heart drifting off him (cosmetic)
(function(){ const hu=hzgUpdate; hzgUpdate=function(dt,play){ const r=hu.apply(this,arguments); try{ const G=TW.giant; if(G&&G.phase>=2&&G.hp>0&&!G.noBar){ const s=(G.gs||.55)/.55;
      if(Math.random()<dt*18) FX.spawn(G.x+rnd(-2.4,2.4)*s,G.y+rnd(.6,4.6)*s,G.z+rnd(-1,1),0,rnd(.6,1.6),0,.8,Math.random()<.6?0xff6ab0:0xffffff,.22,-1,true);
      if(Math.random()<dt*2.2) FX.spawn(G.x+rnd(-1.6,1.6)*s,G.y+rnd(3,5)*s,G.z,rnd(-.3,.3),rnd(1,2),0,1.2,0xff3a8a,.4,-.5,true); } }catch(e){ console.error('hamza aura',e); } return r; }; })();
// MUKBANG LIVE's stream chat (cosmetic): a LIVE badge, a viewer count going up, chat scrolling top right while it runs
const HZG_CHAT=[['hamza_stan_420','POG'],['caotan_official','report this stream'],['omar_edge','...'],['xX_bacon_Xx','is he gonna eat the blacksmith??'],['mira_chan','SHAYAN DODGE'],['hikari_chan_rip','F'],['bismillah_bot','Bismillah x10'],['piglet_37','DAD WATCH ME'],['senpai_noticer','senpai is so brave ♡'],['dayoldkojima','my lawyers are watching'],['nathan_alt','mid mukbang tbh'],['big_back_fan','SMASH. THAT. LIKE.'],['omar_edge','I donated nothing'],['kenji','is this the festival?'],['caotan_official','HIKARI-CHAN DESERVED BETTER']];
(function(){ const hb=hzgBuffet; hzgBuffet=function*(G){ const C={t:0,n:0,v:1200,msgs:[]}; TW.hzChat=C; try{ yield* hb.apply(this,arguments); } finally{ if(TW.hzChat===C) TW.hzChat=null; } }; })();
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ const C=TW.hzChat; if(!C||!TW.giant||Game.state==='title') return; const dt=1/60; C.t+=dt; C.v+=Math.floor(rnd(0,40));
    if(C.t>C.n*.55){ C.n++; C.msgs.push(HZG_CHAT[Math.floor(Math.random()*HZG_CHAT.length)]); if(C.msgs.length>6) C.msgs.shift(); }
    const TT=IS_TOUCH(), fs=TT?16:14, w=TT?300:280, x=UW-w-12, y=TT?120:96, lh=fs+6; D.save(); D.globalAlpha=Math.min(1,C.t*3);
    D.fillStyle='rgba(10,8,16,.62)'; D.fillRect(x,y,w,lh*(C.msgs.length+1)+12); D.fillStyle='#ff2a3a'; D.beginPath(); D.arc(x+14,y+12,5,0,7); D.fill();
    D.font=`900 ${fs}px ${FB}`; D.textAlign='left'; D.textBaseline='middle'; D.fillStyle='#ffffff'; D.fillText('LIVE  ·  '+C.v.toLocaleString()+' watching',x+26,y+12);
    C.msgs.forEach(([u,m],i)=>{ const yy=y+12+lh*(i+1); D.font=`800 ${fs}px ${FB}`; D.fillStyle=['#ff8ac8','#8fd0ff','#ffd45a','#9affb0'][u.length%4]; D.fillText(u+':',x+10,yy); const uw=D.measureText(u+': ').width; D.font=`600 ${fs}px ${FB}`; D.fillStyle='#ffffff'; D.fillText(m,x+10+uw,yy); });
    D.restore(); }catch(e){ console.error('hz chat',e); } }; })();
// Hamza's cutscene shots, re-posed for 2D sprites: every shot keeps what it looks at but sits on the gameplay side (+z) at the
// fight camera's pitch, 8+ back: a billboard seen from low and close reads as a flat card
function hzGl(px,py,pz,lx,ly,lz){ const ox=px-lx, oz=pz-lz, d=Math.max(8,Math.hypot(ox,oz)*1.25), x=lx+clamp(ox,-d*.45,d*.45), z=lz+Math.sqrt(Math.max(1,d*d-clamp(ox,-d*.45,d*.45)**2)); return twCineGlide(x,ly+d*.5,z,lx,ly,lz,4); }
