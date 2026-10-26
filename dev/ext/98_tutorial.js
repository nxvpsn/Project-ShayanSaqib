// =====================================================================
// PARRY.EXE: a VR parry tutorial. A nerd by the first house hands you a headset; Ali (a hologram) teaches
//   1) ranged parry: hit 3 fireballs back      2) melee parry -> 5 charges -> Full Counter (twice)
//   3) the teleport strike: red mark, then he swings, parry 3 times
// Infinite health the whole time; "Leave Tutorial" (top right) exits at any point.
// =====================================================================
NAMES.trainer='Kenji, VR Enthusiast';
(function(){ const pt=portrait; portrait=function(who,ex){ if(who!=='trainer') return pt(who,ex); const key='trainer:'+ex; if(portraitCache[key]) return portraitCache[key];
    const [cv,c]=mkCanvas(56,56); c.drawImage(pt('villagerm',ex),0,0); R(c,13,22,30,8,'#1a1d2a'); R(c,15,24,26,4,'#3ff4ff'); R(c,20,25,4,2,'#ffffff'); R(c,10,23,3,4,'#1a1d2a'); R(c,43,23,3,4,'#1a1d2a'); portraitCache[key]=cv; return cv; }; })();
const TUT_LOOK={cloth:'#2a2f4a',clothS:'#1c2036',skin:'#d8a882',hair:'#1a1410',hat:'#3ff4ff'};
// ---------- the trainer and his sign, by the first house ----------
(function(){ const lv=LEVELDEF.village; LEVELDEF.village=function(){ const G=lv.apply(this,arguments);
    G.ents.push({type:'npc',who:'trainer',x:9.9,z:10.3,f:-1,look:TUT_LOOK});
    const [cv,c]=mkCanvas(96,56); R(c,46,30,4,26,'#5a3a20'); R(c,4,4,88,30,'#7a4e2c'); R(c,6,6,84,26,'#a8743e'); c.font='bold 11px monospace'; c.textAlign='center'; c.fillStyle='#1a0e06';
    c.fillText('PRACTICE PARRY',48,17); c.fillText('WITH ME',48,29); const m=billboard(cv,1.7,1,{foot:0}); m.position.set(10.35,groundY(10.35,10.3)+1.6,10.35); G.root.add(m); G.trainerSign=m;
    // the sign is in his hands: it follows him, and goes when he does
    G.anim.push(()=>{ if(!m.parent) return; const n=NPCS.find(o=>o.who==='trainer'); if(n){ m.position.set(n.x+.45,n.y+1.6,n.z+.05); return; }
      if(L===G){ m.parent.remove(m); FX.burst(m.position.x,m.position.y,m.position.z,26,0xa8743e,5,.4,false); Sound.sfx('crash'); } });
    return G; }; })();
SCR.trainer=function*(){ if(ALI()){ yield say('trainer',"Whoa. You already parry everything by just... existing. My demo can't handle you, man."); return; }
  yield say('trainer',"Yo! You look like someone who gets hit a lot. Want to practice parrying?");
  yield say('trainer',"Put on this VR headset. Ali's hologram runs the class. Infinite health, zero consequences.");
  const c=yield choose([{t:"Put on the headset."},{t:"Maybe later."}]);
  if(c!==0){ yield say('trainer',"Your loss. It has RGB lighting."); return; }
  yield say('trainer',"Sick. There's a Leave Tutorial button in the top right if it gets weird. It always gets weird.");
  yield* twTutEnter(); };

// ---------- the VR arena: a floating stone disc in the void, ringed in neon ----------
LOOKS.vrtut=Object.assign({},LOOKS.void,{hemi:[0x7a8aff,0x101030,.85],sun:[0xe8f4ff,1.25,[20,30,15]],tint:[.95,1.02,1.12],sat:1.1});
LEVELDEF.vrtut=function(){ const W=30, G=newGrid(W,W,'keep'); G.tx=makeTileTextures('keep'); const c=W/2;
  for(let z=0;z<W;z++) for(let x=0;x<W;x++){ const d=Math.hypot(x+.5-c,z+.5-c); if(d>11){ G.H[z][x]=-99; G.B[z][x]=true; } else G.T[z][x]=d>10?'brick':'flag'; }
  Object.assign(G,{key:'vrtut',look:'vrtut',music:null,name:'PARRY.EXE',sub:'Virtual Training Ground',spawn:[c,c+5],bottom:-99});
  buildTerrain(G,G.tx); G.root.add(skyDome(LOOKS.void.sky,LOOKS.void.sunDir,LOOKS.void.sunCol,LOOKS.void.sunSize)); stars(G,2500,0x8fd8ff,1.4); stars(G,600,0xffffff,2.2);
  for(const [r0,r1,col] of [[10.85,11.1,0x3ff4ff],[6.9,7,0x3f8aff],[3.45,3.5,0x3f8aff]]){ const m=new THREE.Mesh(new THREE.RingGeometry(r0,r1,96),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); m.rotation.x=-Math.PI/2; m.position.set(c,.06,c); G.root.add(m); }
  G.anim.push(dt=>{ if(Math.random()<.3) FX.spawn(c+rnd(-14,14),rnd(-6,10),c+rnd(-14,14),0,rnd(.5,1.5),0,2,Math.random()<.5?0x3ff4ff:0x8a6aff,.25,-.1,true); });
  return G; };

// ---------- state ----------
TW.tut=null;
function twTutAli(){ const c={x:15,z:15}; const A={x:c.x,z:c.z-4,y:0,f:1,anim:'idle',t:0,hp:99,hide:0,spr:new Sprite3D(64,64),flash:0}; A.y=groundY(A.x,A.z); return A; }
function twTutDrawAli(dt){ const T=TW.tut; if(!T||!T.A) return; const A=T.A; A.t+=dt; A.flash=Math.max(0,A.flash-dt); A.y=groundY(A.x,A.z);
  A.spr.show(!A.hide&&Game.state!=='title'); if(A.hide) return; A.spr.draw((c,cx,by)=>drawAliHD(c,cx,by,A.f,{t:A.t,anim:A.anim,flash:A.flash})); A.spr.place(A.x,A.y,A.z,A.y); A.spr.glow(A.flash>0?.8:.12); }
function twTutCleanup(){ const T=TW.tut; if(!T) return; TW.bound=0; if(T.A&&T.A.spr) T.A.spr.dispose(); TW.tut=null; TW.vrGlitch=null; if(TW.fight&&TW.fight.kind==='tut'){ TW.fight=null; } Game.arena=null; twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); Player.counter=0; }
// put on the headset: glitchy boot, then into the arena
function* twTutEnter(){ const P=Player, keep={x:P.x,z:P.z,hp:P.hp,flags:Game.flags,aff:Game.aff,mira:Game.mira?Object.assign({},Game.mira):null,hmode:Game.hamza?Game.hamza.mode:null,music:Sound.want||null};
  Sound.sfx('select'); yield fadeOut(); TW.vrGlitch={t:0,dur:2.4,text:'BOOTING PARRY.EXE'}; Sound.sfx('tear'); Sound.sfx('drone'); yield wait(2.4);
  loadLevel('vrtut'); Game.flags=keep.flags; Game.aff=keep.aff; if(Game.hamza) Game.hamza.mode='hidden'; if(hSprite) hSprite.show(false); Game.mira=null; if(mSprite) mSprite.show(false);
  resetPlayer({x:15,z:20},true); P.hp=P.maxHp; P.counter=0; P.f=1;
  const lock={x0:3.5,x1:26.5,z0:3.5,z1:26.5}; TW.fight={kind:'tut',lock,center:{x:15,z:15},respawn(){ Game.state='play'; Player.hp=Player.maxHp; }}; Game.arena={lock};
  TW.tut={keep,A:twTutAli(),stage:'intro',gen:null,obj:null,n:0,need:0}; TW.vrGlitch={t:0,dur:.8,text:'CONNECTED'}; Sound.sfx('secret'); yield fadeIn();
  const A=TW.tut.A; A.x=15; A.z=14; A.f=1; cineSet(15,2.6,23,15,1.4,15); yield wait(.4);
  yield say('ali',"Welcome to PARRY.EXE. I'm a hologram. Don't think about it.");
  yield say('ali',"You have infinite health in here. Nothing can kill you. Your pride, maybe.");
  yield say('ali',"Lesson one. The ranged parry.");
  yield say('ali',"When something flies at you, swing your sword at it right before it reaches you. It goes straight back where it came from.");
  yield say('ali',"Point your mouse where you want to swing. Your sword follows the cursor.");
  yield say('ali',"I'll throw fireballs. Send three of them back.");
  Cam.cine=null; TW.tut.gen=twTutFlow(); TW.tut.wait=0; }
// take off the headset
function twTutLeave(done){ if(!TW.tut||TW.tut.leaving) return; TW.tut.leaving=1; Object.assign(Game,{dlg:null,wait:null}); Voice.stop(); run(function*(){ yield* twTutExit(done); }); }
function* twTutExit(done){ const T=TW.tut, k=T.keep, P=Player; yield fadeOut(); TW.vrGlitch={t:0,dur:1,text:'DISCONNECTING'}; Sound.sfx('tear'); yield wait(1);
  twTutCleanup(); loadLevel('village',{keepHP:1}); Game.flags=k.flags; Game.aff=k.aff; resetPlayer({x:k.x,z:k.z},true); P.hp=k.hp||P.maxHp; P.f=1; P.counter=0;
  if(Game.hamza&&k.hmode){ Game.hamza.mode=k.hmode; } if(k.mira&&k.mira.follow){ Game.mira=Object.assign(k.mira,{x:P.x-1,z:P.z,y:P.y}); makeMiraSprite(); } else if(Game.flags.metMira&&Game.mira){ Game.mira.vis=false; if(mSprite) mSprite.show(false); }
  if(k.music) Sound.play(k.music); Game.banner=null; yield fadeIn();
  if(done){ yield say('trainer',"So? Worth it? You kept swinging at the air. It was beautiful."); yield say('shayan',"I think I actually get it now. Parry, parry, parry... COUNTER."); }
  else yield say('trainer',"Leaving already? The headset does that to people. Come back anytime."); }

// ---------- the lessons (a pattern generator: yields seconds, pauses during dialogue) ----------
function* twTutFlow(){ const T=TW.tut, A=T.A, P=Player;
  // 1) ranged parry
  T.obj='RANGED PARRY: swing at the fireball right before it hits you'; T.n=0; T.need=3;
  while(T.n<3){ const a=Math.atan2(P.z-15,P.x-15)+Math.PI; A.x=15+Math.cos(a)*6.5; A.z=15+Math.sin(a)*5.2; A.f=P.x<A.x?-1:1; A.anim='charge'; A.flash=.3; Sound.sfx('charge'); yield .7;
    A.anim='beam'; Sound.sfx('fire'); const b=twAimBolt(A,'orb',A.x+A.f*.4,A.y+1.2,A.z,7.5,0,{col:0xff7a20,life:3.5,dmg:1}); b.tut=1; T.ball=b; yield .2; A.anim='idle';
    let t=0; while(t<3.6&&!b.dead&&!b.friendly){ yield .05; t+=.05; }
    if(b.friendly){ T.n++; Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'RANGED PARRY '+T.n+'/3',t:0,big:true,col:'#9fe0ff'}); Sound.sfx('secret'); if(T.n<3) twBark('ali',T.n===1?"Good. Again.":"One more.",true); }
    else twBark('ali',"Swing when it's almost touching you. Not before.",true);
    yield 1.1; }
  run(function*(){ yield say('ali',"Clean. Lesson two. The melee parry."); yield say('ali',"When I swing at you, attack right before my hit lands. A red line on the ground shows where I'm coming from."); yield say('ali',"Every melee parry gives you a charge. Watch the five diamonds at the top left."); yield say('ali',"At five charges, your next attack becomes a Full Counter. Huge damage. Huge range."); yield say('ali',"I'll rush you five times from different sides. Parry all five, then hit me with the Full Counter."); yield say('ali',"Remember, aim with your mouse. Swing toward me, not toward your feelings."); }); yield .1;
  // 2) melee parry x5 into the Full Counter, twice
  for(let round=0;round<2;round++){ P.counter=0; T.obj='Land 5 melee parries to fill your Full Counter meter  ('+round+'/2)'; T.need=5;
    let i=0; while((P.counter||0)<5){ T.n=P.counter||0; const a=rnd(0,6.28)+i*1.3; A.x=P.x+Math.cos(a)*6; A.z=P.z+Math.sin(a)*6; const cl=twClampXZ(A.x,A.z,1.5); A.x=cl.x; A.z=cl.z; A.hide=0; FX.burst(A.x,A.y+1.2,A.z,16,0x140a1a,3,.3,false);
      const aa=Math.atan2(P.z-A.z,P.x-A.x), d=Math.hypot(P.x-A.x,P.z-A.z)+1.5; A.f=Math.cos(aa)>0?1:-1; A.anim='charge'; FX.line(A.x,A.z,aa,d,2,0xff2a3a,.6); Sound.sfx('charge'); yield .6;
      const s={t:0,hit:false,dur:d/16}; A.anim='dash'; Sound.sfx('dash');
      twHz({upd(dt,play){ if(!play) return true; s.t+=dt; A.x+=Math.cos(aa)*16*dt; A.z+=Math.sin(aa)*16*dt; FX.spawn(A.x,A.y+1.2,A.z,0,0,0,.3,0xff4a5a,.5,0,true);
          const P2=Player; if(!s.hit&&Math.hypot(P2.x-A.x,P2.z-A.z)<1.6){ s.hit=true; A.anim='attack'; Sound.sfx('swing'); const r=twHitP(1,A.x,A.z,{melee:true,heavy:true,win:.32,onParry:()=>{ if((Player.counter||0)>=5){ TW.bound=1; hit.attack=false; } }}); if(r==='hit') s.miss=1; } return s.t<s.dur; }});
      yield s.dur+.15; A.anim='idle'; i++;
      if(s.miss) twBark('ali',["Too late. Swing a hair earlier.","Watch the red line. Swing as I arrive.","Not bad. Not good either. Again."][i%3],true); else if(!s.hit) twBark('ali',"You dodged. Cute. Parry it instead.",true);
      T.n=P.counter||0; yield .55; }
    // five charges: he stands still and takes the Full Counter
    // meter full: attacks stay locked, the game freezes, Ali blinks in front of you and tells you what to do
    TW.bound=1; hit.attack=false; T.n=5; T.obj=null; FX.burst(A.x,A.y+1.2,A.z,20,0x140a1a,4,.35,false); Sound.sfx('dash');
    const a2=P.ang||0; A.x=P.x+Math.cos(a2)*2.2; A.z=P.z+Math.sin(a2)*2.2; const c0=twClampXZ(A.x,A.z,1.2); A.x=c0.x; A.z=c0.z; A.f=P.x<A.x?-1:1; A.anim='block'; A.flash=.5; FX.burst(A.x,A.y+1.2,A.z,24,0x140a1a,4,.35,false);
    run(function*(){ yield say('ali',"Now hit me with your basic attack to unleash the Full Counter!"); }); yield .05;
    TW.bound=0; hit.attack=false; T.obj='FULL COUNTER READY: hit Ali with your basic attack  ('+round+'/2)';
    let w=0; while(!(P.atk&&P.atk.big&&Math.hypot(A.x-P.x,A.z-P.z)<6.2)){ yield .05; w+=.05; if(w>8){ twBark('ali',"Attack me. Left click. Toward me.",true); w=0; } if((P.counter||0)<5) break; }
    if(P.atk&&P.atk.big){ A.flash=.6; FX.burst(A.x,A.y+1.2,A.z,40,0x6ac8ff,6,.4); shake(.6); A.x+=Math.cos(a2)*3; A.z+=Math.sin(a2)*3; const cl=twClampXZ(A.x,A.z,1.5); A.x=cl.x; A.z=cl.z; A.anim='idle';
      Game.dmgNums.push({x:P.x,y:P.y+3.2,z:P.z,n:'FULL COUNTER '+(round+1)+'/2',t:0,big:true,col:'#7ac8ff'}); yield .9; if(round===0) run(function*(){ yield say('ali',"Ow. That's the one. Do it one more time. Muscle memory."); }); yield .1; }
    else round--; }
  run(function*(){ yield say('ali',"Good. Last lesson. Some enemies teleport right into your face."); yield say('ali',"When I vanish, I reappear in front of you. A red mark flashes on the ground."); yield say('ali',"When it flashes, I'm about to swing. Attack right as I strike. Parry it three times and you graduate."); }); yield .1;
  // 3) teleport strike, front only
  T.obj='TELEPORT STRIKE: when the red mark flashes, attack as he swings'; T.n=0; T.need=3;
  while(T.n<3){ A.anim='idle'; A.hide=0; yield 2;
    FX.burst(A.x,A.y+1.2,A.z,22,0x140a1a,4,.4,false); A.hide=1; Sound.sfx('dash'); yield .25;
    const back=Math.atan2(A.z-P.z,A.x-P.x), fx=P.x+Math.cos(back)*1.5, fz=P.z+Math.sin(back)*1.5, c2=twClampXZ(fx,fz,1); A.x=c2.x; A.z=c2.z; A.f=P.x<A.x?-1:1; A.hide=0; A.anim='charge'; FX.burst(A.x,A.y+1.2,A.z,22,0x140a1a,4,.4,false);
    const mk=FX.marker((A.x+P.x)/2,(A.z+P.z)/2,1.3,0xff2a3a,.55); Sound.sfx('charge'); yield .55;
    A.anim='attack'; Sound.sfx('swing'); FX.arc(A.x,A.y,A.z,Math.atan2(P.z-A.z,P.x-A.x),0,true);
    let r='miss'; if(Math.hypot(P.x-A.x,P.z-A.z)<2.8) r=twHitP(1,A.x,A.z,{melee:true,heavy:true});
    if(r==='parry'){ T.n++; Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'TELEPORT PARRY '+T.n+'/3',t:0,big:true,col:'#ffd45a'}); if(T.n<3) twBark('ali',T.n===1?"Yes. Again.":"Last one.",true); }
    else if(r==='hit') twBark('ali',["Wait for the flash, then swing.","Too early. Let me arrive first.","Almost. Swing as the blade comes down."][Math.floor(Math.random()*3)],true);
    else twBark('ali',"Stand your ground. Parry, don't run.",true);
    yield .35; // flash step back out
    FX.burst(A.x,A.y+1.2,A.z,18,0x140a1a,3,.3,false); const out=Math.atan2(A.z-P.z,A.x-P.x), c3=twClampXZ(P.x+Math.cos(out)*6.5,P.z+Math.sin(out)*6.5,1.5); A.x=c3.x; A.z=c3.z; A.anim='idle'; Sound.sfx('dash'); }
  T.obj=null; Sound.sfx('counter'); twBig('TRAINING COMPLETE',{size:60,col:'#9fe0ff',sub:'Ranged parry · Melee parry · Full Counter · Teleport parry'});
  run(function*(){ yield say('ali',"That's everything. Ranged parry, melee parry, Full Counter, teleport parry. You're dangerous now. Slightly."); yield say('ali',"Take the headset off before the battery dies. It's held together with tape."); }); yield .1;
  twTutLeave(true); }

// ---------- per frame: run the lesson, keep you alive, tidy fireballs ----------
(function(){ const uw=updateWorld; updateWorld=function(dt){ uw(dt); const T=TW.tut; if(!T) return; const P=Player; P.hp=P.maxHp; twTutDrawAli(dt);
    for(const b of BOLTS) if(b.tut&&b.friendly&&!b.dead&&Math.hypot(b.x-T.A.x,b.z-T.A.z)<1.1){ b.dead=1; FX.burst(T.A.x,T.A.y+1.2,T.A.z,18,0xff8a2a,4,.3); T.A.flash=.3; Sound.sfx('hit'); }
    if(T.gen&&!Game.script&&Game.state==='play'&&!T.leaving){ T.wait-=dt; let g=0; while(T.gen&&T.wait<=0&&g++<20){ let r; try{ r=T.gen.next(); }catch(e){ console.error('tutorial',e); r={done:true}; } if(r.done){ T.gen=null; break; } T.wait+=(r.value||0); } } }; })();
(function(){ const od=Game.onDeath; Game.onDeath=function(){ if(TW.tut){ Player.hp=Player.maxHp; return; } return od.call(Game); }; })();
// leaving the tutorial any other way (warp, title, new game) tidies it up
(function(){ const wr=twWarpReset; twWarpReset=function(){ twTutCleanup(); return wr.apply(this,arguments); };
  const tt=toTitle; toTitle=function(){ twTutCleanup(); return tt.apply(this,arguments); }; const ng=newGame; newGame=function(){ twTutCleanup(); return ng.apply(this,arguments); }; })();

// ---------- HUD: objective, Leave Tutorial button, the glitchy headset screen ----------
const TUT_BTN={x:UW-210,y:20,w:190,h:40};
function twDrawTut(){ const T=TW.tut; if(!T||Game.state==='title') return; const B=TUT_BTN;
  D.save(); D.fillStyle='rgba(10,20,40,.88)'; D.fillRect(B.x,B.y,B.w,B.h); D.strokeStyle='#3ff4ff'; D.lineWidth=2; D.strokeRect(B.x+1,B.y+1,B.w-2,B.h-2); D.font=`800 17px ${FB}`; D.textAlign='center'; D.fillStyle='#bff8ff'; D.fillText('Leave Tutorial',B.x+B.w/2,B.y+26);
  if(T.obj&&!Game.dlg){ const w=Math.min(UW-80,D.measureText(T.obj).width+120), x=UW/2-w/2, y=UH-130; D.fillStyle='rgba(8,14,30,.85)'; D.fillRect(x,y,w,52); D.strokeStyle='#3f8aff'; D.strokeRect(x+1,y+1,w-2,50);
    D.font=`700 17px ${FB}`; D.fillStyle='#e8f4ff'; D.fillText(T.obj,UW/2,y+22); if(T.need){ D.font=`900 16px ${FB}`; D.fillStyle='#3ff4ff'; D.fillText(Math.min(T.n,T.need)+' / '+T.need,UW/2,y+43); } }
  D.restore(); }
function twDrawVRGlitch(){ const G=TW.vrGlitch; if(!G) return; G.t+=1/60; if(G.t>G.dur){ TW.vrGlitch=null; return; } const k=G.t/G.dur;
  D.save(); D.fillStyle='rgba(2,4,12,'+(G.text==='CONNECTED'?(1-k):1)+')'; D.fillRect(0,0,UW,UH);
  for(let i=0;i<14;i++){ D.fillStyle=['rgba(63,244,255,.5)','rgba(255,42,90,.45)','rgba(138,106,255,.5)','rgba(255,255,255,.3)'][i%4]; D.fillRect(rnd(-100,UW),rnd(0,UH),rnd(60,500),rnd(2,14)); }
  D.font=`900 34px monospace`; D.textAlign='center'; const jx=rnd(-4,4); D.fillStyle='#ff2a5a'; D.fillText(G.text,UW/2+jx+3,UH/2); D.fillStyle='#3ff4ff'; D.fillText(G.text,UW/2+jx-3,UH/2); D.fillStyle='#ffffff'; D.fillText(G.text,UW/2+jx,UH/2);
  if(G.text==='BOOTING PARRY.EXE'){ const w=420, x=UW/2-w/2, y=UH/2+30; D.strokeStyle='#3ff4ff'; D.lineWidth=2; D.strokeRect(x,y,w,18); const pr=Math.min(1,k*1.15+(Math.random()<.1?-.2:0)); D.fillStyle='#3ff4ff'; D.fillRect(x+3,y+3,(w-6)*Math.max(0,pr),12);
    D.font=`700 14px monospace`; D.fillStyle='#8fd8ff'; D.fillText(Math.floor(Math.max(0,pr)*100)+'%   calibrating sword arm... ignoring pig...',UW/2,y+44); }
  D.restore(); }
(function(){ const du=drawUI; drawUI=function(){ du(); try{ twDrawTut(); twDrawVRGlitch(); }catch(e){ console.error('tutHUD',e); } }; })();
ui.addEventListener('pointerdown',e=>{ if(!TW.tut||TW.tut.leaving||(typeof TLM!=='undefined'&&TLM.open)) return; const r=ui.getBoundingClientRect(), x=(e.clientX-r.left)/r.width*UW, y=(e.clientY-r.top)/r.height*UH, B=TUT_BTN;
  if(x>=B.x&&x<=B.x+B.w&&y>=B.y&&y<=B.y+B.h){ e.preventDefault(); e.stopImmediatePropagation(); Sound.sfx('select'); twTutLeave(false); } },true);
