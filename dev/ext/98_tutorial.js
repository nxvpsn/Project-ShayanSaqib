// =====================================================================
// TUTORIAL.EXE (v1.92; it was PARRY.EXE, a parry tutorial): the full gameplay tutorial. Kenji by the arcade hands you a headset;
// Ali (a hologram) runs the class on a stone disc in the void, with a course of platforms off its east side:
//   sword  combo, Getsuga (hold attack), full-charge Getsuga (pierces)          fire   fireballs, the 3s fireball, the ignited blade
//   parry  ranged x3, melee x5 into a Full Counter, teleport strike x3            dodge  dash through what cannot be parried
//   move   jump, double jump, glide, air dash, jump-dash-jump-dash                drill  one target (big drill), many (a swarm)
// Each lesson runs into the next; the first choice lets you take one block only. Targets are training bots (`tutBot`: mobs that
// never act). What you did is read from `T.ev` (every hit on a bot) and `T.sq` (what you did since leaving the ground).
// Infinite health the whole time; "Leave Tutorial" (top right) exits at any point.
// =====================================================================
NAMES.trainer='Kenji, VR Enthusiast';
(function(){ const pt=portrait; portrait=function(who,ex){ if(who!=='trainer') return pt(who,ex); const key='trainer:'+ex; if(portraitCache[key]) return portraitCache[key];
    const [cv,c]=mkCanvas(56,56); c.drawImage(pt('villagerm',ex),0,0); R(c,13,22,30,8,'#1a1d2a'); R(c,15,24,26,4,'#3ff4ff'); R(c,20,25,4,2,'#ffffff'); R(c,10,23,3,4,'#1a1d2a'); R(c,43,23,3,4,'#1a1d2a'); portraitCache[key]=cv; return cv; }; })();
const TUT_LOOK={cloth:'#2a2f4a',clothS:'#1c2036',skin:'#d8a882',hair:'#1a1410',hat:'#3ff4ff'};
// ---------- the trainer and his sign, by the first house ----------
(function(){ const lv=LEVELDEF.village; LEVELDEF.village=function(){ const G=lv.apply(this,arguments);
    const tp=(G.spots&&G.spots.trainer)||{x:11.4,z:19.3}; G.ents.push({type:'npc',who:'trainer',x:tp.x,z:tp.z,f:1,look:TUT_LOOK}); /* in front of the arcade (05a) */
    const [cv,c]=mkCanvas(96,56); R(c,46,30,4,26,'#5a3a20'); R(c,4,4,88,30,'#7a4e2c'); R(c,6,6,84,26,'#a8743e'); c.font='bold 11px monospace'; c.textAlign='center'; c.fillStyle='#1a0e06';
    c.fillText('GAMEPLAY',48,17); c.fillText('TUTORIAL',48,29); const m=billboard(cv,1.7,1,{foot:0}); m.position.set(tp.x+.45,groundY(tp.x,tp.z)+1.6,tp.z+.05); G.root.add(m); G.trainerSign=m;
    // the sign is in his hands: it follows him, and goes when he does
    G.anim.push(()=>{ if(!m.parent) return; const n=NPCS.find(o=>o.who==='trainer'); if(n){ m.position.set(n.x+.45,n.y+1.6,n.z+.05); return; }
      if(L===G){ m.parent.remove(m); FX.burst(m.position.x,m.position.y,m.position.z,26,0xa8743e,5,.4,false); Sound.sfx('crash'); } });
    return G; }; })();
SCR.trainer=function*(){ if(ALI()){ yield say('trainer',"Whoa, a samurai. You already know the trick, right? Swing right before the hit lands. My demo is for blacksmiths, man."); return; }
  yield say('trainer',"Yo! You look like someone who gets hit a lot. Want the full gameplay tutorial?");
  yield say('trainer',"Put on this VR headset. Ali's hologram runs the class. Sword, fire, parries, movement, the drill. Infinite health, zero consequences.");
  const c=yield choose([{t:"Put on the headset."},{t:"Maybe later."}]);
  if(c!==0){ yield say('trainer',"Your loss. It has RGB lighting."); return; }
  yield say('trainer',"Sick. There's a Leave Tutorial button in the top right if it gets weird. It always gets weird.");
  yield* twTutEnter(); };

// ---------- the VR arena: a floating stone disc in the void, ringed in neon ----------
LOOKS.vrtut=Object.assign({},LOOKS.void,{hemi:[0x7a8aff,0x101030,.85],sun:[0xe8f4ff,1.25,[20,30,15]],tint:[.95,1.02,1.12],sat:1.1});
const TUT_C={W:84,D:30,cx:15,cz:15,z0:12,z1:18, /* the course, west to east: [x0,x1,height] */ run:[[26,31,0],[32,34,.5],[35,37,2.5],[46,50,1.5],[57,61,1.5]], end:[70,81,9,21,1.5]};
LEVELDEF.vrtut=function(){ const C=TUT_C, W=C.W, G=newGrid(W,C.D,'keep'); G.tx=makeTileTextures('keep'); const c=15;
  for(let z=0;z<C.D;z++) for(let x=0;x<W;x++){ const d=Math.hypot(x+.5-c,z+.5-c); if(d>11){ G.H[z][x]=-99; G.B[z][x]=x<26; } else G.T[z][x]=d>10?'brick':'flag'; }
  for(const [x0,x1,h] of C.run) for(let z=C.z0;z<=C.z1;z++) for(let x=x0;x<=x1;x++){ G.H[z][x]=h; G.B[z][x]=false; G.T[z][x]=(z===C.z0||z===C.z1)?'brick':'flag'; }
  { const [x0,x1,z0,z1,h]=C.end; for(let z=z0;z<=z1;z++) for(let x=x0;x<=x1;x++){ G.H[z][x]=h; G.B[z][x]=false; G.T[z][x]=(x===x0||x===x1||z===z0||z===z1)?'brick':'flag'; } }
  for(let z=0;z<C.D;z++){ G.B[z][W-1]=true; G.B[z][W-2]=true; } for(let x=26;x<W;x++){ G.B[0][x]=G.B[1][x]=G.B[C.D-1][x]=G.B[C.D-2][x]=true; }
  Object.assign(G,{key:'vrtut',look:'vrtut',music:null,name:'TUTORIAL.EXE',sub:'Virtual Training Ground',spawn:[c,c+5],bottom:-12});
  buildTerrain(G,G.tx); G.root.add(skyDome(LOOKS.void.sky,LOOKS.void.sunDir,LOOKS.void.sunCol,LOOKS.void.sunSize)); stars(G,2500,0x8fd8ff,1.4); stars(G,600,0xffffff,2.2);
  for(const [r0,r1,col] of [[10.85,11.1,0x3ff4ff],[6.9,7,0x3f8aff],[3.45,3.5,0x3f8aff]]){ const m=new THREE.Mesh(new THREE.RingGeometry(r0,r1,96),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); m.rotation.x=-Math.PI/2; m.position.set(c,.06,c); G.root.add(m); }
  { /* a neon line along both edges of every platform of the course, so the gaps read against the void */ const strip=(x0,x1,z,h)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0+1,.06,.1),new THREE.MeshBasicMaterial({color:0x3ff4ff,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})); m.position.set((x0+x1+1)/2,h+.05,z); G.root.add(m); };
    for(const [x0,x1,h] of C.run){ strip(x0,x1,C.z0+.05,h); strip(x0,x1,C.z1+.95,h); } const [x0,x1,z0,z1,h]=C.end; strip(x0,x1,z0+.05,h); strip(x0,x1,z1+.95,h); }
  G.anim.push(dt=>{ if(Math.random()<.3) FX.spawn(Player.x+rnd(-14,14),rnd(-6,10),c+rnd(-14,14),0,rnd(.5,1.5),0,2,Math.random()<.5?0x3ff4ff:0x8a6aff,.25,-.1,true); });
  return G; };

// ---------- state ----------
TW.tut=null;
function twTutAli(){ const c={x:15,z:15}; const A={x:c.x,z:c.z-4,y:0,f:1,anim:'idle',t:0,hp:99,hide:0,spr:twAliSpr(),flash:0}; A.y=groundY(A.x,A.z); return A; }
function twTutDrawAli(dt){ const T=TW.tut; if(!T||!T.A) return; const A=T.A; A.t+=dt; A.flash=Math.max(0,A.flash-dt); A.y=groundY(A.x,A.z);
  A.spr.show(!A.hide&&Game.state!=='title'); if(A.hide) return; A.spr.draw((c,cx,by)=>drawAliHD(c,cx,by,A.f,{t:A.t,anim:A.anim,flash:A.flash})); A.spr.place(A.x,A.y,A.z,A.y); A.spr.glow(A.flash>0?.8:.12); }
function twTutCleanup(){ const T=TW.tut; if(!T) return; TW.bound=0; try{ tutClearBots(); }catch(e){} if(T.A&&T.A.spr) T.A.spr.dispose(); TW.tut=null; TW.vrGlitch=null; if(TW.fight&&TW.fight.kind==='tut'){ TW.fight=null; } Game.arena=null; twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); Player.counter=0; }
// put on the headset: glitchy boot, then into the arena
function* twTutEnter(){ const P=Player, keep={x:P.x,z:P.z,hp:P.hp,flags:Game.flags,aff:Game.aff,mira:Game.mira?Object.assign({},Game.mira):null,hmode:Game.hamza?Game.hamza.mode:null,music:Sound.want||null};
  Sound.sfx('select'); yield fadeOut(); TW.vrGlitch={t:0,dur:2.4,text:'BOOTING TUTORIAL.EXE'}; Sound.sfx('tear'); Sound.sfx('drone'); yield wait(2.4);
  loadLevel('vrtut'); Game.flags=keep.flags; Game.aff=keep.aff; if(Game.hamza) Game.hamza.mode='hidden'; if(hSprite) hSprite.show(false); Game.mira=null; if(mSprite) mSprite.show(false);
  resetPlayer({x:15,z:20},true); P.hp=P.maxHp; P.counter=0; P.f=1;
  const lock={x0:3.5,x1:26.5,z0:3.5,z1:26.5}; TW.fight={kind:'tut',lock,center:{x:15,z:15},respawn(){ Game.state='play'; Player.hp=Player.maxHp; }}; Game.arena={lock};
  TW.tut={keep,A:twTutAli(),stage:'intro',gen:null,obj:null,n:0,need:0,ev:[],sq:{g:1,j:1,d:0,s:''}}; TW.vrGlitch={t:0,dur:.8,text:'CONNECTED'}; Sound.sfx('secret'); yield fadeIn();
  const A=TW.tut.A; A.x=15; A.z=14; A.f=1; cineSet(15,2.6,23,15,1.4,15); yield wait(.4);
  yield say('ali',"Welcome to TUTORIAL.EXE. I'm a hologram. Don't think about it.");
  yield say('ali',"You have infinite health in here. Nothing can kill you. Your pride, maybe.");
  yield say('ali',"Sword, fire, parries, dodging, movement, the drill. About six minutes. Or pick the part you are bad at.");
  const c=yield choose([{t:"Teach me everything."},{t:"Just the sword and the fire."},{t:"Just the parries."},{t:"Just dodging and movement."},{t:"Just the drill."}]);
  Cam.cine=null; TW.tut.gen=twTutFlow(c||0); TW.tut.wait=0; }
// take off the headset
function twTutLeave(done){ if(!TW.tut||TW.tut.leaving) return; TW.tut.leaving=1; Object.assign(Game,{dlg:null,wait:null}); Voice.stop(); run(function*(){ yield* twTutExit(done); }); }
function* twTutExit(done){ const T=TW.tut, k=T.keep, P=Player; yield fadeOut(); TW.vrGlitch={t:0,dur:1,text:'DISCONNECTING'}; Sound.sfx('tear'); yield wait(1);
  twTutCleanup(); loadLevel('village',{keepHP:1}); Game.flags=k.flags; Game.aff=k.aff; resetPlayer({x:k.x,z:k.z},true); P.hp=k.hp||P.maxHp; P.f=1; P.counter=0;
  if(Game.hamza&&k.hmode){ Game.hamza.mode=k.hmode; } if(k.mira&&k.mira.follow){ Game.mira=Object.assign(k.mira,{x:P.x-1,z:P.z,y:P.y}); makeMiraSprite(); } else if(Game.flags.metMira&&Game.mira){ Game.mira.vis=false; if(mSprite) mSprite.show(false); }
  if(k.music) Sound.play(k.music); Game.banner=null; yield fadeIn();
  if(done){ yield say('trainer',"So? Worth it? You kept swinging at the air. It was beautiful."); yield say('shayan',"I think I actually get it now. Parry, parry, parry... COUNTER."); }
  else yield say('trainer',"Leaving already? The headset does that to people. Come back anytime."); }

// ---------- the lessons (a pattern generator: yields seconds, pauses during dialogue) ----------
function* tutParry(){ const T=TW.tut, A=T.A, P=Player; tutClearBots(); tutLock(0);
  run(function*(){ yield say('ali',"Parrying. The part people skip. Then they die, and blame the game."); yield say('ali',"When something flies at you, swing your sword at it right before it reaches you. It goes straight back where it came from."); yield say('ali',"I'll throw fireballs. Send three of them back."); }); yield .1;
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
  for(let round=0;round<1;round++){ P.counter=0; T.obj='MELEE PARRY: attack as his swing lands. 5 parries fill the Full Counter'; T.need=5;
    let i=0; while((P.counter||0)<5){ T.n=P.counter||0; const a=rnd(0,6.28)+i*1.3; A.x=P.x+Math.cos(a)*6; A.z=P.z+Math.sin(a)*6; const cl=twClampXZ(A.x,A.z,1.5); A.x=cl.x; A.z=cl.z; A.hide=0; FX.burst(A.x,A.y+1.2,A.z,16,0x140a1a,3,.3,false);
      const aa=Math.atan2(P.z-A.z,P.x-A.x), d=Math.hypot(P.x-A.x,P.z-A.z)+1.5, from=Game.time+TW_STRICT.grace; A.f=Math.cos(aa)>0?1:-1; A.anim='charge'; FX.line(A.x,A.z,aa,d,2,0xff2a3a,.6); Sound.sfx('charge'); yield .6; /* the same rush timing as the twins: strict, TW_DASH_WIN */
      const s={t:0,hit:false,dur:d/17}; A.anim='dash'; Sound.sfx('dash');
      twHz({upd(dt,play){ if(!play) return true; s.t+=dt; A.x+=Math.cos(aa)*17*dt; A.z+=Math.sin(aa)*17*dt; FX.spawn(A.x,A.y+1.2,A.z,0,0,0,.3,0xff4a5a,.5,0,true);
          const P2=Player; if(!s.hit&&Math.hypot(P2.x-A.x,P2.z-A.z)<1.6){ s.hit=true; A.anim='attack'; Sound.sfx('swing'); const r=twStrictDo(from,()=>twHitP(1,A.x,A.z,{melee:true,heavy:true,win:TW_DASH_WIN,onParry:()=>{ if((Player.counter||0)>=5){ TW.bound=1; hit.attack=false; } }})); if(r==='hit') s.miss=1; } return s.t<s.dur; }});
      yield s.dur+.15; A.anim='idle'; i++;
      if(s.miss) twBark('ali',["Too late. Swing a hair earlier.","Watch the red line. Swing as I arrive.","Not bad. Not good either. Again."][i%3],true); else if(!s.hit) twBark('ali',"You dodged. Cute. Parry it instead.",true);
      T.n=P.counter||0; yield .55; }
    // five charges: he stands still and takes the Full Counter
    // meter full: attacks stay locked, the game freezes, Ali blinks in front of you and tells you what to do
    TW.bound=1; hit.attack=false; T.n=5; T.obj=null; FX.burst(A.x,A.y+1.2,A.z,20,0x140a1a,4,.35,false); Sound.sfx('dash');
    const a2=P.ang||0; A.x=P.x+Math.cos(a2)*2.2; A.z=P.z+Math.sin(a2)*2.2; const c0=twClampXZ(A.x,A.z,1.2); A.x=c0.x; A.z=c0.z; A.f=P.x<A.x?-1:1; A.anim='block'; A.flash=.5; FX.burst(A.x,A.y+1.2,A.z,24,0x140a1a,4,.35,false);
    run(function*(){ yield say('ali',"Now hit me with your basic attack to unleash the Full Counter!"); }); yield .05;
    TW.bound=0; hit.attack=false; T.obj='FULL COUNTER READY: hit Ali with your basic attack';
    let w=0; while(!(P.atk&&P.atk.big&&Math.hypot(A.x-P.x,A.z-P.z)<6.2)){ yield .05; w+=.05; if(w>8){ twBark('ali',"Attack me. Left click. Toward me.",true); w=0; } if((P.counter||0)<5) break; }
    if(P.atk&&P.atk.big){ A.flash=.6; FX.burst(A.x,A.y+1.2,A.z,40,0x6ac8ff,6,.4); shake(.6); A.x+=Math.cos(a2)*3; A.z+=Math.sin(a2)*3; const cl=twClampXZ(A.x,A.z,1.5); A.x=cl.x; A.z=cl.z; A.anim='idle';
      Game.dmgNums.push({x:P.x,y:P.y+3.2,z:P.z,n:'FULL COUNTER',t:0,big:true,col:'#7ac8ff'}); yield .9; }
    else round--; }
  run(function*(){ yield say('ali',"Good. Last lesson. Some enemies teleport right into your face."); yield say('ali',"When I vanish, I reappear in front of you. A red mark flashes on the ground."); yield say('ali',"When it flashes, I'm about to swing. Attack right as I strike. Parry it three times and you graduate."); }); yield .1;
  // 3) teleport strike, front only
  T.obj='TELEPORT STRIKE: when the red mark flashes, attack as he swings'; T.n=0; T.need=3;
  while(T.n<3){ A.anim='idle'; A.hide=0; yield 2; const from=Game.time+TW_STRICT.grace; /* the same timing as Omar's reaps: vanish .4, tell .45, strict */
    FX.burst(A.x,A.y+1.2,A.z,22,0x140a1a,4,.4,false); A.hide=1; Sound.sfx('dash'); yield .4;
    const back=Math.atan2(A.z-P.z,A.x-P.x), fx=P.x+Math.cos(back)*1.5, fz=P.z+Math.sin(back)*1.5, c2=twClampXZ(fx,fz,1); A.x=c2.x; A.z=c2.z; A.f=P.x<A.x?-1:1; A.hide=0; A.anim='charge'; FX.burst(A.x,A.y+1.2,A.z,22,0x140a1a,4,.4,false);
    const mk=FX.marker((A.x+P.x)/2,(A.z+P.z)/2,1.3,0xff2a3a,.45); Sound.sfx('charge'); yield .45;
    A.anim='attack'; Sound.sfx('swing'); FX.arc(A.x,A.y,A.z,Math.atan2(P.z-A.z,P.x-A.x),0,true);
    let r='miss'; if(Math.hypot(P.x-A.x,P.z-A.z)<2.8) r=twStrictDo(from,()=>twHitP(1,A.x,A.z,{melee:true,heavy:true}));
    if(r==='parry'){ T.n++; Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'TELEPORT PARRY '+T.n+'/3',t:0,big:true,col:'#ffd45a'}); if(T.n<3) twBark('ali',T.n===1?"Yes. Again.":"Last one.",true); }
    else if(r==='hit') twBark('ali',["Wait for the flash, then swing.","Too early. Let me arrive first.","Almost. Swing as the blade comes down."][Math.floor(Math.random()*3)],true);
    else twBark('ali',"Stand your ground. Parry, don't run.",true);
    yield .35; // flash step back out
    FX.burst(A.x,A.y+1.2,A.z,18,0x140a1a,3,.3,false); const out=Math.atan2(A.z-P.z,A.x-P.x), c3=twClampXZ(P.x+Math.cos(out)*6.5,P.z+Math.sin(out)*6.5,1.5); A.x=c3.x; A.z=c3.z; A.anim='idle'; Sound.sfx('dash'); }
  T.obj=null; A.hide=0; A.anim='idle'; }

// ---------- training bots: mobs that never act, and a record of everything that hits them ----------
function tutBot(x,z,o){ o=o||{}; const m=makeMob('hound',x,z); m.bot=1; m.immortal=o.immortal?1:0; m.hp=m.maxHp=o.hp||30; m.state='idle'; m.cd=1e9; m.hx=x; m.hz=z; m.hits=0; MOBS.push(m); FX.burst(x,m.y+1,z,18,0x3ff4ff,4,.3); Sound.sfx('blip'); return m; }
function tutClearBots(){ let any=0; for(const m of MOBS) if(m.bot){ any=1; m.hp=0; FX.burst(m.x,m.y+1,m.z,12,0x3ff4ff,3,.25); try{ m.spr.dispose(); }catch(e){} } if(any) MOBS=MOBS.filter(m=>!m.bot); }
(function(){ const um=updateMob; updateMob=function(m,dt){ if(!m.bot) return um.apply(this,arguments); m.cd=1e9; if(m.state!=='stun') m.state='idle'; const r=um.apply(this,arguments);
    if(m.state!=='stun'){ m.vx*=.7; m.vz*=.7; m.x+=(m.hx-m.x)*Math.min(1,dt*4); m.z+=(m.hz-m.z)*Math.min(1,dt*4); m.f=Player.x<m.x?-1:1; } return r; }; })();
(function(){ const dm=damageMob; damageMob=function(m,dmg,ang){ const T=TW.tut; if(T&&m&&m.bot){ const P=Player, A=P.atk; try{ T.ev.push({m,d:dmg,t:Game.time,melee:!!(A&&A.hit&&A.hit.has(m)),n:A?A.n:-1,ign:P.ignite>0,beam:Game.time-(T.beamT||-9)<1.6&&!(A&&A.hit&&A.hit.has(m))&&dmg>=3,full:!!T.beamFull}); if(T.ev.length>60) T.ev.splice(0,20); }catch(e){}
      if(m.immortal&&m.hp-dmg<1) m.hp=m.maxHp+dmg; } return dm.apply(this,arguments); }; })();
(function(){ const fb=fireBeam; fireBeam=function(big){ const T=TW.tut; if(T){ T.beamT=Game.time; T.beamFull=!!big; } return fb.apply(this,arguments); }; const tf=twFireball; twFireball=function(big){ const T=TW.tut; if(T){ if(big) T.fbBigT=Game.time; else T.fbT=Game.time; } return tf.apply(this,arguments); };
  const cl=twChantless; twChantless=function(){ if(TW.tut&&TW.tut.chantless) return true; return cl.apply(this,arguments); }; })();
// how many recorded hits match, taking them off the record
function tutEv(fn){ const T=TW.tut; let n=0; T.ev=T.ev.filter(e=>{ if(fn(e)){ n++; return false; } return true; }); return n; }
// the player's box: the disc for the lessons that happen on it, the whole course for the rest
function tutLock(wide){ const F=TW.fight; if(!F) return; const lock=wide?{x0:3.5,x1:TUT_C.W-2.6,z0:8.6,z1:21.4}:{x0:3.5,x1:26.5,z0:3.5,z1:26.5}; F.lock=lock; Game.arena={lock}; }
function tutNum(text,col){ const P=Player; Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:text,t:0,big:true,col:col||'#9fe0ff'}); Sound.sfx('secret'); }
function tutAliTo(x,z){ const A=TW.tut.A; FX.burst(A.x,A.y+1.2,A.z,16,0x140a1a,3,.3,false); A.x=x; A.z=z; A.y=groundY(x,z); A.hide=0; A.anim='idle'; A.f=Player.x<x?-1:1; FX.burst(A.x,A.y+1.2,A.z,16,0x140a1a,3,.3,false); Sound.sfx('dash'); }

// ---------- sword: the combo, the Getsuga, the full charge ----------
function* tutSword(){ const T=TW.tut, A=T.A, P=Player; tutLock(0); tutClearBots(); tutAliTo(10.5,12); const b0=tutBot(15,11,{immortal:1}); T.ev=[];
  run(function*(){ yield say('ali',"Lesson one. The sword. You hit things with it. Revolutionary."); yield say('ali',"Three swings make a combo. The third one is the one that hurts. Hit the dummy."); }); yield .1;
  T.obj='COMBO: '+K('attack')+' three times on the dummy. Land the third swing'; T.n=0; T.need=2; let w=0;
  while(T.n<2){ yield .05; w+=.05; if(tutEv(e=>e.melee&&e.n===2)){ T.n++; tutNum('COMBO '+T.n+'/2'); w=0; } else tutEv(e=>e.melee); if(w>9){ twBark('ali',"Three swings. In a row. I believe in you, statistically.",true); w=0; } }
  run(function*(){ yield say('ali',"Now hold the attack. The blade hums, a ring goes blue. Let go. That is a Getsuga Tenshou."); yield say('ali',"Don't ask me about the name. I didn't name it. A lawyer might."); }); yield .1;
  T.obj='GETSUGA: hold '+K('attack')+' until the blue flash, then release at the dummy'; T.n=0; T.need=1; T.ev=[]; w=0;
  while(T.n<1){ yield .05; w+=.05; if(tutEv(e=>e.beam)){ T.n=1; tutNum('GETSUGA'); } else tutEv(e=>true); if(w>10){ twBark('ali',"Hold it down. Count to one. Release.",true); w=0; } }
  const b1=tutBot(17.5,11,{immortal:1}), b2=tutBot(20,11,{immortal:1}); FX.marker(11.5,11,1,0x3ff4ff,6);
  run(function*(){ yield say('ali',"Keep holding past the blue. It goes red. Red goes through everything in a line."); yield say('ali',"Three dummies, one line. Stand where they overlap and thread it."); }); yield .1;
  T.obj='FULL CHARGE: hold '+K('attack')+' until it turns red. Hit 2 dummies with one beam'; T.n=0; T.need=2; T.ev=[]; w=0; let seen=new Set(), bt=-9;
  while(T.n<2){ yield .05; w+=.05; if((T.beamT||-9)!==bt){ bt=T.beamT||-9; seen=new Set(); } for(const e of T.ev) if(e.beam&&e.full) seen.add(e.m); const weak=T.ev.some(e=>e.beam&&!e.full); T.ev=[]; T.n=seen.size;
    if(weak&&seen.size<2&&w>1){ twBark('ali',"That was the blue one. Hold longer. Red.",true); w=-4; } if(w>12){ twBark('ali',"Line them up, hold until red, release.",true); w=0; } }
  tutNum('PIERCED'); yield .8; T.obj=null; }

// ---------- fire: fireballs, the three-second one, the ignited blade ----------
function* tutFire(){ const T=TW.tut, A=T.A, P=Player; tutLock(0); tutClearBots(); tutAliTo(10.5,18); tutBot(16,18,{immortal:1}); tutBot(19,16,{immortal:1}); T.ev=[];
  run(function*(){ yield say('ali',"Fire. The other button. Tap it. Small, fast, wherever you are pointing."); yield say('ali',"They barely hurt. They keep a thing busy while you think."); }); yield .1;
  T.obj='FIREBALLS: tap '+K('block')+'. Land 6 on the dummies'; T.n=0; T.need=6; let w=0;
  while(T.n<6){ yield .05; w+=.05; const k=tutEv(e=>!e.melee&&e.d<1); if(k){ T.n+=k; w=0; } tutEv(e=>true); if(w>9){ twBark('ali',"The other button. The one that is not the sword.",true); w=0; } }
  tutNum('FIREBALLS'); run(function*(){ yield say('ali',"Now hold it. Three whole seconds. Yes, it is long. Find the time."); yield say('ali',"The big one hits like a cart, and it sets your sword on fire. On purpose."); }); yield .1;
  for(;;){ T.obj='BIG FIREBALL: hold '+K('block')+' for 3 seconds, then let go'; T.n=0; T.need=1; T.fbBigT=-9; w=0;
    while(Game.time-(T.fbBigT||-9)>1){ yield .05; w+=.05; if(w>12){ twBark('ali',"Hold. Three seconds. A gold ring tells you when.",true); w=0; } }
    T.n=1; tutNum('IGNITED','#ff8a3a'); twBark('ali',"Your sword is on fire. Eight seconds. Hit something.",true);
    T.obj='IGNITED BLADE: your swings burn for 8 seconds. Land 3 hits'; T.n=0; T.need=3; T.ev=[];
    while(T.n<3&&P.ignite>0){ yield .05; const k=tutEv(e=>e.melee&&e.ign); if(k) T.n=Math.min(3,T.n+k); tutEv(e=>true); }
    if(T.n>=3) break; twBark('ali',"It went out. Light it again.",true); yield .6; }
  tutNum('BURNING COMBO','#ff8a3a'); yield .8; T.obj=null; }

// ---------- dodge: what cannot be parried is dashed through ----------
function tutWave(x,z,a){ const w={s:.5,done:0,res:null}, gy=groundY(15,15), m=new THREE.Mesh(new THREE.BoxGeometry(.35,1.5,26),new THREE.MeshBasicMaterial({color:0xb04aff,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false})); m.userData.temp=1; m.rotation.y=-a; scene.add(m);
  const ca=Math.cos(a), sa=Math.sin(a), side=()=>(Player.x-x)*ca+(Player.z-z)*sa-w.s;
  twHz({upd(dt,play){ if(!play) return true; const P=Player, b=side(); w.s+=13*dt; const af=side(); m.position.set(x+ca*w.s,gy+.75,z+sa*w.s); for(let i=0;i<3;i++){ const q=rnd(-12,12); FX.spawn(x+ca*w.s-sa*q,gy+rnd(.1,1.5),z+sa*w.s+ca*q,-ca*2,rnd(0,1),-sa*2,.3,0xd08aff,.25,0,true); }
      if(!w.res&&b>0&&af<=0){ if(P.dash>0) w.res='dash'; else if(P.y>gy+1.15) w.res='jump'; else { w.res='hit'; twHitP(1,P.x-ca,P.z-sa,{}); } }
      if(w.s>25){ scene.remove(m); w.done=1; return false; } return true; }});
  return w; }
function* tutDodge(){ const T=TW.tut, A=T.A, P=Player; tutLock(0); tutClearBots();
  run(function*(){ yield say('ali',"Some things cannot be parried. Purple things. Wide things. Things with paperwork."); yield say('ali',"You dash. While you dash, nothing can touch you. Dash INTO it, not away from it."); }); yield .1;
  T.obj='DODGE: the purple wave cannot be parried. '+K('dash')+' through it as it arrives'; T.n=0; T.need=3;
  while(T.n<3){ const a0=Math.atan2(P.z-15,P.x-15)+Math.PI; tutAliTo(15+Math.cos(a0)*9,15+Math.sin(a0)*9); const aa=Math.atan2(P.z-A.z,P.x-A.x); A.f=Math.cos(aa)>0?1:-1; A.anim='charge'; A.flash=.3; Sound.sfx('charge'); FX.line(A.x,A.z,aa,22,6,0xb04aff,.85); yield .85;
    A.anim='attack'; Sound.sfx('swing'); Sound.sfx('fire'); const w=tutWave(A.x,A.z,aa); let t=0; while(!w.done&&!w.res&&t<3){ yield .05; t+=.05; } A.anim='idle';
    if(w.res==='dash'){ T.n++; tutNum('DODGED '+T.n+'/3','#d08aff'); } else if(w.res==='jump') twBark('ali',"Jumping over it works. On this one. Dash through it anyway.",true); else if(w.res==='hit') twBark('ali',["Into it. Dash as it reaches you.","You swung at it. It is purple. Dash.","Later. Dash when it is on top of you."][T.n%3],true); else twBark('ali',"You ran away. It works until the room ends.",true);
    yield 1; }
  T.obj=null; }

// ---------- movement: the course off the east side of the disc ----------
function* tutMove(){ const T=TW.tut, A=T.A, P=Player, C=TUT_C, mz=15.5, on=(x0,h)=>P.onGround&&P.x>=x0&&P.y>=h-.2; tutClearBots(); tutLock(1); tutAliTo(33.5,mz); T.did={};
  run(function*(){ yield say('ali',"Movement. Follow me east. Try not to fall into the void."); yield say('ali',"The void is also a hologram. It still judges you."); }); yield .1;
  T.obj='JUMP: '+K('jump')+' up onto the step'; T.n=0; T.need=0; let w=0; while(!on(32,.5)){ yield .05; w+=.05; if(w>12){ twBark('ali',"East. The bridge. Then jump.",true); w=0; } }
  tutAliTo(36.5,mz+1.5); twBark('ali',"Higher. Jump, then jump again in the air.",true); T.obj='DOUBLE JUMP: '+K('jump')+', then '+K('jump')+' again in mid-air'; while(!on(35,2.5)){ yield .05; }
  tutAliTo(48,mz); twBark('ali',"That gap is wide. Jump, jump again, then HOLD jump. You float.",true); T.obj='GLIDE: jump twice, then hold '+K('jump')+' to float across the gap'; while(!on(46,1.5)){ yield .05; }
  tutNum('GLIDE'); run(function*(){ yield say('ali',"Gliding is slow. Slow is how you get shot out of the sky."); yield say('ali',"Jump, then dash in the air. It is faster, and nothing can hit you during the dash."); }); yield .1;
  tutAliTo(59,mz); T.did={}; T.obj='AIR DASH: '+K('jump')+', then '+K('dash')+' in the air, across to me'; w=0;
  for(;;){ yield .05; w+=.05; if(T.did.jd&&on(57,1.5)) break; if(on(57,1.5)&&!T.did.jd){ if(w>1.5){ twBark('ali',"You floated. I said dash. Do it right here: jump, dash.",true); w=-6; } } }
  tutNum('AIR DASH'); run(function*(){ yield say('ali',"Last one. Jump. Dash. Jump again. Dash again. One breath."); yield say('ali',"It crosses anything, and you are untouchable for half of it. Half is a lot."); }); yield .1;
  tutAliTo(72.5,mz); T.did={}; T.obj='CHAIN: '+K('jump')+' · '+K('dash')+' · '+K('jump')+' · '+K('dash')+', one leap, across to me'; w=0;
  for(;;){ yield .05; w+=.05; if(T.did.jdjd&&on(70,1.5)) break; if(on(70,1.5)&&!T.did.jdjd){ if(w>1.5){ twBark('ali',"That was not the chain. Here, on the spot: jump, dash, jump, dash.",true); w=-7; } } }
  tutNum('JUMP · DASH · JUMP · DASH'); yield .8; T.obj=null; }

// ---------- the drill: one target, then many ----------
function* tutDrill(){ const T=TW.tut, A=T.A, P=Player, C=TUT_C, cx=75.5, cz=15.5; tutLock(1); tutClearBots();
  if(!(P.x>=C.end[0]&&P.onGround)){ resetPlayer({x:72,z:cz},true); P.f=1; } tutAliTo(73,12); tutBot(78,cz,{hp:40}); P.sp=20; T.chantless=0;
  run(function*(){ yield say('ali',"Graduation. The Heavenly Drill. The bar under your hearts fills when you hit things."); yield say('ali',"I filled it for you. Don't make it weird. One enemy gets one very large drill."); }); yield .1;
  T.obj='HEAVENLY DRILL: press '+K('special')+' (the special bar is full)'; T.n=0; T.need=0; let w=0; while(P.sp>=20){ yield .05; w+=.05; if(w>10){ twBark('ali',"The special button. It is glowing at you.",true); w=0; } } yield .4;
  if(Game.hamza){ Game.hamza.mode='hidden'; if(hSprite) hSprite.show(false); run(function*(){ yield say('ali',"...There was a pig. In my simulation. I am choosing not to log that."); }); yield .1; }
  tutClearBots(); for(let i=0;i<6;i++){ const a=-1.1+i*.44; tutBot(P.x+Math.cos(a)*5.2,clamp(P.z+Math.sin(a)*4.6,10.5,20.5),{hp:12}); } P.sp=20; T.chantless=1;
  run(function*(){ yield say('ali',"Many enemies: it splits. One drill each. Nobody gets left out."); }); yield .1;
  T.obj='DRILL SWARM: press '+K('special')+' again with enemies all around'; w=0; while(P.sp>=20){ yield .05; w+=.05; if(w>10){ twBark('ali',"Again. Same button. More drills.",true); w=0; } } yield .5;
  if(Game.hamza){ Game.hamza.mode='hidden'; if(hSprite) hSprite.show(false); } T.chantless=0; T.obj=null; tutClearBots(); }

// ---------- the flow: which blocks, in order ----------
function* twTutFlow(pick){ const T=TW.tut, A=T.A, P=Player, SETS=[[tutSword,tutFire,tutParry,tutDodge,tutMove,tutDrill],[tutSword,tutFire],[tutParry],[tutDodge,tutMove],[tutDrill]], list=SETS[pick]||SETS[0];
  for(const L2 of list){ yield* L2(); yield .4; }
  T.obj=null; tutClearBots(); Sound.sfx('counter'); twBig('TRAINING COMPLETE',{size:60,col:'#9fe0ff',sub:list.length>2?'Sword · Fire · Parry · Dodge · Movement · Drill':'Come back for the rest'});
  run(function*(){ if(list.length>2){ yield say('ali',"That's everything. Sword, fire, parries, dodging, movement, the drill. You're dangerous now. Slightly."); } else yield say('ali',"That part is done. The rest of the class is still here when your ego recovers."); yield say('ali',"Take the headset off before the battery dies. It's held together with tape."); }); yield .1;
  twTutLeave(true); }

// ---------- per frame: run the lesson, keep you alive, tidy fireballs ----------
(function(){ const uw=updateWorld; updateWorld=function(dt){ uw(dt); const T=TW.tut; if(!T) return; const P=Player; P.hp=P.maxHp; twTutDrawAli(dt);
    try{ const S=T.sq; if(P.onGround){ S.s=''; } else { if(S.g&&P.vy>2) S.s+='J'; else if(S.j===1&&P.jumps===0) S.s+='J'; if(P.dash>0&&!S.d) S.s+='D'; if(T.did){ if(/J.*D/.test(S.s)) T.did.jd=1; if(/J.*D.*J.*D/.test(S.s)) T.did.jdjd=1; } } S.g=P.onGround; S.j=P.jumps; S.d=P.dash>0; }catch(e){ console.error('tut seq',e); }
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
  if(G.text==='BOOTING TUTORIAL.EXE'){ const w=420, x=UW/2-w/2, y=UH/2+30; D.strokeStyle='#3ff4ff'; D.lineWidth=2; D.strokeRect(x,y,w,18); const pr=Math.min(1,k*1.15+(Math.random()<.1?-.2:0)); D.fillStyle='#3ff4ff'; D.fillRect(x+3,y+3,(w-6)*Math.max(0,pr),12);
    D.font=`700 14px monospace`; D.fillStyle='#8fd8ff'; D.fillText(Math.floor(Math.max(0,pr)*100)+'%   calibrating sword arm... ignoring pig...',UW/2,y+44); }
  D.restore(); }
(function(){ const du=drawUI; drawUI=function(){ du(); try{ twDrawTut(); twDrawVRGlitch(); }catch(e){ console.error('tutHUD',e); } }; })();
ui.addEventListener('pointerdown',e=>{ if(!TW.tut||TW.tut.leaving||(typeof TLM!=='undefined'&&TLM.open)) return; const r=ui.getBoundingClientRect(), x=(e.clientX-r.left)/r.width*UW, y=(e.clientY-r.top)/r.height*UH, B=TUT_BTN;
  if(x>=B.x&&x<=B.x+B.w&&y>=B.y&&y<=B.y+B.h){ e.preventDefault(); e.stopImmediatePropagation(); Sound.sfx('select'); twTutLeave(false); } },true);
