// =====================================================================
// BIG BACK HAMZA, ROUND 4: the fight makes sense again
// - his moves' box: 26 x 20 around you, following you (it was the whole field, so Pork Roll bounced off the map's edges and Belly Slide
//   ran 50 units and left him a 20-second walk away). The babies, the slide and the edge drops all use it (twBounds). You are never walled in.
// - the silent contact hit (2 damage every 0.9s for standing near him) is gone: when you stay on his snout he does a SNOUT SHOVE
//   with a tell (a pink ring, a grunt, .45s), parryable (silver slash), a stagger when parried.
// - he never trudges after you at 2.2 u/s any more: 9.5+ away, he hops back to 4 units in front of you (a small shadow, 2 damage).
// - Debug Mode: the pig himself exists (newHamza) and the twins join, as in the story fight.
// - the twins: Caotan alternates his ray with a three-ball goo volley, Omar his cut with a thrown crescent; both shoot the babies
//   on sight (piglets within 7); cooldowns are shorter (07_allies) and they talk more.
// =====================================================================
function hzgArena(c){ return {x0:Math.max(3,c.x-13),x1:Math.min(L.w-3,c.x+13),z0:Math.max(3,c.z-10),z1:Math.min(L.d-3,c.z+10)}; }
(function(){ const hs=hzgStart; hzgStart=function(){ if(!Game.hamza&&typeof newHamza==='function'){ try{ newHamza(); }catch(e){ console.error('hamza fairy',e); } } /* Debug Mode warps in without him */
    const r=hs.apply(this,arguments); try{ const G=TW.giant; if(TW.fight) TW.fight.lock=hzgArena({x:Player.x,z:Player.z}); /* his moves' box; the player is never walled in (Game.arena stays the field) */
      if(typeof DBG!=='undefined'&&DBG.on&&!TW.allies.length&&typeof twSetParty==='function') twSetParty('both'); }catch(e){ console.error('hamza arena',e); } return r; }; })();
// the snout shove (close) and the hop back (far)
HZG.shove=function*(G,ph){ const P=Player; G.mouth=1; Sound.sfx('pigrumble'); FX.ring(G.x,groundY(G.x,G.z)+.1,G.z,'#ff6a9a',3.4,.45); const from=Game.time+TW_STRICT.grace; yield .45;
  const a=Math.atan2(Player.z-G.z,Player.x-G.x); Sound.sfx('swing'); Sound.sfx('oink'); G.mv={sx:G.x,sz:G.z,x:G.x+Math.cos(a)*1.1,z:G.z+Math.sin(a)*1.1,t:0,dur:.12}; FX.burst(G.x+Math.cos(a)*2.2,G.y+1.2,G.z+Math.sin(a)*2.2,16,0xffb0c8,4,.25);
  const s={t:0,hit:false}; twHz({upd(dt,play){ if(!play) return true; s.t+=dt; if(!s.hit) twRushTell(G,a,1.4); const Pp=Player;
      if(!s.hit&&Math.hypot(Pp.x-G.x,Pp.z-G.z)<3.6&&Pp.y<G.y+2){ if(twStrictDo(from,()=>twHitP(2,G.x,G.z,{heavy:true,melee:true,win:TW_DASH_WIN,onParry:()=>{ G.stun=Math.max(G.stun,1.2); Game.dmgNums.push({x:G.x,y:G.y+4,z:G.z,n:'STAGGERED',t:0,col:'#ffd45a'}); }}))!=='none') s.hit=true; }
      return s.t<.22; }}); yield .4; G.mouth=0; };
HZG.hop=function*(G,ph){ const P=Player, a=Math.atan2(P.z-G.z,P.x-G.x); yield* hzgLeap(G,P.x-Math.cos(a)*4,P.z-Math.sin(a)*4,.7,5,2.4,2,0,false); yield .25; };
(function(){ const hu=hzgUpdate; hzgUpdate=function(dt,play){ const G=TW.giant; if(G) G.touchT=1; /* the base contact hit stays off */ try{ if(G&&TW.fight&&TW.fight.kind==='giant'&&!TW.lcCleanup) TW.fight.lock=hzgArena({x:Player.x,z:Player.z}); }catch(e){} /* the box follows you: no invisible walls, his moves still stay near you */ const r=hu.apply(this,arguments);
    try{ if(!G||!play||G.hp<=0||G.inv||G.noAttack||G.gen||G.stun>0||G.pend||Game.script||Game.state!=='play'){ if(G) G.nearT=0; return r; }
      const P=Player, d=Math.hypot(P.x-G.x,P.z-G.z);
      if(d<2.9){ G.nearT=(G.nearT||0)+dt; if(G.nearT>.5){ G.nearT=0; G.gen=HZG.shove(G,G.phase); G.wait=0; } }
      else { G.nearT=0; if(d>9.5&&G.cd>.4){ G.gen=HZG.hop(G,G.phase); G.wait=0; } } }catch(e){ console.error('hamza 4',e); } return r; }; })();
// the twins against the babies and with a second move each
function hzgPigletNear(A,r){ let best=null, bd=r; for(const m of MOBS){ if(m.type!=='piglet'||m.hp<=0) continue; const d=Math.hypot(m.x-A.x,m.z-A.z); if(d<bd){ bd=d; best=m; } } return best; }
(function(){ const ua=twUpdateAlly; twUpdateAlly=function(A,dt,play){ try{ const G=TW.giant; if(play&&G&&G.hp>0&&TW.fight&&TW.fight.kind==='giant'&&(A.who==='caotan'||A.who==='omar')&&!(A.down>0)&&!A.hold&&!Player.hidden&&Game.state==='play'&&!Game.script&&A.cd-dt<=0){
        const m=hzgPigletNear(A,7);
        if(m){ A.cd=1.1; const ang=Math.atan2(m.z-A.z,m.x-A.x); if(A.who==='caotan'){ A.glintT=.3; Sound.sfx('ting'); twAllyRay(A.x,A.y+1.9,A.z,m.x,m.y+.6,m.z,0xffb0e0); } else { A.cast=.3; FX.arc(m.x,m.y,m.z,ang,0,true); FX.cut(m.x,m.y+.8,m.z); Sound.sfx('swing'); }
          damageMob(m,4,ang); twBark(A.who,A.who==='caotan'?["Not the babies! ...Okay, the babies.","Pew! Sorry, piglet. Senpai comes first."][Math.floor(Math.random()*2)]:["Small pig. Small problem.","Back to the void, little one."][Math.floor(Math.random()*2)],true); return ua.apply(this,arguments); }
        A.alt=!A.alt; if(A.alt){ const tg=twAllyTarget(); if(tg&&tg.o===G){ const o=G;
          if(A.who==='caotan'){ A.cd=rnd(2.4,3); A.push=.4; A.glintT=.4; Sound.sfx('beam'); A.anim='beam'; for(let i=0;i<3;i++) twAllyShot(A,o,tg,0xff8ab0,.9,'ball',i*.16); twBark('caotan',["Goo volley! For senpai!","Triple shot! I never miss! ...twice."][Math.floor(Math.random()*2)]); }
          else { A.cd=rnd(2.8,3.4); A.cast=.4; Sound.sfx('swing'); A.anim='beam'; twAllyShot(A,o,tg,0x9a4aff,2.2,'crescent',0); twBark('omar',["A crescent. Catch.","I throw these at my problems. You are a problem, pig."][Math.floor(Math.random()*2)]); }
          return ua.apply(this,arguments); } } } }catch(e){ console.error('hamza allies',e); } return ua.apply(this,arguments); }; })();

// ---------- round 4b: Pork Roll Stampede (one parryable rolling rush), no Quake, parryable Bounce/Flop landings, ten babies ----------
HZG_POOL[1]=['bounce','flop','stampede','babies','stampede']; HZG_POOL[2]=['bounce','flop','stampede','babies','meteor','babyRain','belly','stampede']; /* roll and quake are gone */
// the stampede is the roll now: he spins along the line (the sprite rolls), parryable with the silver slash, dropping babies on the way
HZG.stampede=function*(G,ph){ const sp=hzgSp2(G), n=ph>=2?4:3; twBark('hamza',["PORK ROLL! I'm a sushi now! A FAST sushi!","Bismillah... ROLL! Children, hold on to Daddy!"][Math.floor(Math.random()*2)],true);
  for(let k=0;k<n;k++){ const P=Player, a=Math.atan2(P.z-G.z,P.x-G.x), d=Math.min(18,Math.hypot(P.x-G.x,P.z-G.z)+4); FX.line(G.x,G.z,a,d,3.4,0xff3a5a,.6/sp); G.mouth=0; Sound.sfx('pigrumble'); const from=Game.time+TW_STRICT.grace; yield .6/sp;
    Sound.sfx('dash'); Sound.sfx('pigroar'); G.roll=1; const s={t:0,hit:false,dur:d/(20*sp),drop:ph>=2||k===1};
    twHz({upd(dt,play){ if(!play) return true; s.t+=dt; G.x+=Math.cos(a)*20*sp*dt; G.z+=Math.sin(a)*20*sp*dt; const c=twClampXZ(G.x,G.z,2); G.x=c.x; G.z=c.z; G.rollA=(G.rollA||0)-dt*14*(Math.cos(a)>=0?1:-1); if(!s.hit) twRushTell(G,a,1.6); FX.spawn(G.x+rnd(-1,1),groundY(G.x,G.z)+.3,G.z+rnd(-1,1),rnd(-2,2),rnd(1,3),rnd(-2,2),.5,0xd8c0c8,.4,8,false);
      const P2=Player; if(!s.hit&&Math.hypot(P2.x-G.x,P2.z-G.z)<2.3&&P2.y<G.y+2){ if(twStrictDo(from,()=>twHitP(3,G.x,G.z,{heavy:true,melee:true,win:TW_DASH_WIN,onParry:()=>{ G.stun=Math.max(G.stun,1.4); Game.dmgNums.push({x:G.x,y:G.y+4,z:G.z,n:'STAGGERED',t:0,col:'#ffd45a'}); }}))!=='none') s.hit=true; }
      if(s.drop&&s.t>s.dur*.5){ s.drop=false; hzgBaby(G.x,G.z,{vx:-Math.cos(a)*3+rnd(-2,2),vz:-Math.sin(a)*3+rnd(-2,2),vy:6}); Sound.sfx('oink'); } const on=s.t<s.dur; if(!on) G.roll=0; return on; }, kill(){ G.roll=0; }});
    yield d/(20*sp)+.25; G.roll=0; G.mouth=0; shake(.4); }
  G.rollA=0; yield .5; };
HZG.roll=HZG.stampede; HZG.quake=function*(G,ph){ yield* HZG.stampede(G,ph); }; /* the old keys run the roll stampede (Debug Mode lists, old bags) */
// the sprite spins while he rolls, about its centre (the plane's origin is at his feet: spinning there dug him into the ground)
(function(){ const ds=drawSprites; drawSprites=function(){ const r=ds.apply(this,arguments); try{ const G=TW.giant, m=gpSprite&&gpSprite.mesh; if(!m) return r;
      if(G&&G.roll){ const hh=((m.geometry&&m.geometry.parameters&&m.geometry.parameters.height)||3)/2, th=G.rollA||0; m.rotation.z=th; m.position.x+=hh*Math.sin(th); m.position.y+=hh-hh*Math.cos(th); }
      else if(m.rotation.z) m.rotation.z=0; }catch(e){} return r; }; })();
// Bounce and Flop: attack as he comes down and the landing is parried (he staggers); the silver slash shows on the way down
HZG.bounce=function*(G,ph){ const sp=hzgSp2(G); twBark('hamza',"Bismillah... BOUNCE! Bismillah... BOUNCE!",true); G.landParry=1;
  try{ for(let k=0;k<(ph>=2?4:3);k++){ const P=Player, last=k===(ph>=2?3:2); yield* hzgLeap(G,P.x+P.vx*.4,P.z+P.vz*.4,(k?.75:.95)/sp,last?7:4.5,2.6,3,last?2:0,true); yield .18; } } finally{ G.landParry=0; }
  yield .6; };
HZG.flop=function*(G,ph){ twBark('hamza',ph>=2?"DOUBLE FLOP. Bismillah.":"Belly flop! Oink!",true); G.landParry=1;
  try{ for(let k=0;k<(ph>=2?2:1);k++){ const P=Player; yield* hzgLeap(G,P.x+P.vx*.4,P.z+P.vz*.4,1,7,3,3,ph>=2?2:1,true); yield .55; } } finally{ G.landParry=0; } };
(function(){ const hl=hzgLand; hzgLand=function(G,r,dmg,rings){ if(!G.landParry||!dmg) return hl.apply(this,arguments); const P=Player, from=G.landFrom||Game.time;
    const gy=groundY(G.x,G.z); Sound.sfx('slam'); Sound.sfx('crash'); shake(r>3?1.1:.7); FX.burst(G.x,gy+.4,G.z,50,0xd8c0c8,8,.45,false); FX.ring(G.x,gy,G.z,'#ffb0c8',r*1.6,.5);
    for(let i=0;i<16;i++){ const a=i/16*6.283; FX.spawn(G.x+Math.cos(a)*r,gy+.3,G.z+Math.sin(a)*r,Math.cos(a)*5,rnd(2,5),Math.sin(a)*5,.6,i%2?0xffb0c8:0x8a6a44,.35,12,false); }
    if(twInR(G.x,G.z,r,99)) twStrictDo(from,()=>twHitP(dmg,G.x,G.z,{heavy:true,melee:true,win:TW_DASH_WIN,onParry:()=>{ G.stun=Math.max(G.stun,1.4); Game.dmgNums.push({x:G.x,y:G.y+4,z:G.z,n:'PARRIED',t:0,col:'#ffd45a'}); Sound.sfx('parry'); }}));
    for(let k=0;k<(rings||0);k++) twWave(G.x,G.z,{col:0xffb0c8,sp:8+k,max:13,delay:k*.45,r0:r}); }; })();
(function(){ const hl=hzgLeap; hzgLeap=function*(G,tx,tz,up,h,r,dmg,rings,track){ G.landFrom=Game.time+TW_STRICT.grace; const it=hl.apply(this,arguments); let rr; while(!(rr=it.next()).done){ try{ if(G.landParry&&G.air>0&&G.air<h*.7&&typeof twRushTell==='function'){ const P=Player; twRushTell(G,Math.atan2(P.z-G.z,P.x-G.x),1.6); } }catch(e){} yield rr.value; } }; })();
// ten babies
HZG.babies=function*(G,ph){ const n=10; twBark('hamza',"Go, my children! My beautiful piglet children! ALL TEN OF YOU! Bite the blacksmith!",true); G.mouth=1; Sound.sfx('oink');
  for(let i=0;i<n;i++){ const P=Player, a=rnd(0,6.28), r=rnd(2.5,4.5), p=twClampXZ(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,1), T=.8;
    hzgBaby(G.x,G.z,{vx:(p.x-G.x)/T,vz:(p.z-G.z)/T,vy:G_ACC*T/2}); FX.burst(G.x,G.y+3,G.z,10,0xffb0c8,3,.3); yield .14; }
  G.mouth=0; twBig('10 BABIES',{size:48,col:'#ffb0c8',y:UH*.26,dur:1.1,sub:'Take them out before they get back to Daddy'}); yield 1; };

// ---------- round 4c: no Belly Slide; Baby Rain rains everywhere; a new limit cut (ALL-YOU-CAN-EAT) and a new frenzy (LAST CALL) ----------
HZG_POOL[1]=['bounce','flop','stampede','babies','stampede']; HZG_POOL[2]=['bounce','flop','stampede','babies','meteor','babyRain','stampede','babyRain'];
HZG.belly=function*(G,ph){ yield* HZG.stampede(G,ph); }; /* the old key runs the roll */
// babies from the sky at random spots across the box, each with a pink ring a beat before it lands
function hzgRain(n,span){ const A=twBounds(); for(let i=0;i<n;i++){ const x=rnd(A.x0+1.5,A.x1-1.5), z=rnd(A.z0+1.5,A.z1-1.5), gy=groundY(x,z), at=i/n*span;
    twHz({t:0,w:0,upd(dt,play){ if(play) this.t+=dt; if(this.t>=at&&!this.w){ this.w=1; FX.ring(x,gy+.08,z,'#ffb0c8',1.3,.55); } if(this.t>=at+.55){ hzgBaby(x,z,{drop:1,h:9}); FX.burst(x,gy+8,z,6,0xffb0c8,3,.3); if(Math.random()<.4) Sound.sfx('oink'); return false; } return true; }}); } }
HZG.babyRain=function*(G,ph){ const n=ph>=2?22:16; twBark('hamza',"BABY RAIN! My children! From the SKY! Everywhere! They bite!",true); G.mouth=1; Sound.sfx('oink'); twBig('BABY RAIN',{size:48,col:'#ffb0c8',y:UH*.26,dur:1.1,sub:'Pink rings: a piglet lands there'});
  hzgRain(n,3.4); for(let i=0;i<6;i++){ FX.burst(G.x,G.y+3,G.z,10,0xffb0c8,3,.3); yield .55; } G.mouth=0; yield 1; };
// ONE PORK ROLL down a lane through you: a line, then the spinning rush (parryable); onPar is called on a parry
function* hzgLaneRoll(G,onPar){ const sp=hzgSp2(G), P=Player, a=rnd(0,6.283), L0=22, B=twBounds(); let sx=P.x-Math.cos(a)*11, sz=P.z-Math.sin(a)*11; const c=twClampXZ(sx,sz,2); sx=c.x; sz=c.z;
  FX.burst(G.x,G.y+2,G.z,24,0xffb0c8,5,.4); G.x=sx; G.z=sz; G.mv=null; FX.burst(G.x,G.y+2,G.z,24,0xffb0c8,5,.4); Sound.sfx('dash'); const aa=Math.atan2(P.z-sz,P.x-sx); FX.line(sx,sz,aa,L0,3.6,0xff3a5a,.75/sp); Sound.sfx('pigrumble'); const from=Game.time+TW_STRICT.grace; yield .75/sp;
  Sound.sfx('pigroar'); G.roll=1; const s={t:0,hit:false,dur:L0/(21*sp)};
  twHz({upd(dt,play){ if(!play) return true; s.t+=dt; G.x+=Math.cos(aa)*21*sp*dt; G.z+=Math.sin(aa)*21*sp*dt; const q=twClampXZ(G.x,G.z,2); G.x=q.x; G.z=q.z; G.rollA=(G.rollA||0)-dt*14*(Math.cos(aa)>=0?1:-1); if(!s.hit) twRushTell(G,aa,1.6); FX.spawn(G.x+rnd(-1,1),groundY(G.x,G.z)+.3,G.z+rnd(-1,1),rnd(-2,2),rnd(1,3),rnd(-2,2),.5,0xd8c0c8,.4,8,false);
      const P2=Player; if(!s.hit&&Math.hypot(P2.x-G.x,P2.z-G.z)<2.3&&P2.y<G.y+2){ if(twStrictDo(from,()=>twHitP(3,G.x,G.z,{heavy:true,melee:true,win:TW_DASH_WIN,onParry:()=>{ G.stun=Math.max(G.stun,.6); Game.dmgNums.push({x:G.x,y:G.y+4,z:G.z,n:'PARRIED',t:0,col:'#ffd45a'}); if(onPar) onPar(); }}))!=='none') s.hit=true; }
      const on=s.t<s.dur; if(!on) G.roll=0; return on; }, kill(){ G.roll=0; }});
  yield s.dur+.3; G.roll=0; G.rollA=0; }
// THE BIG BITE: he inhales you for 2.2s, then a red circle: get out of it or be eaten (hzgSwallow)
function* hzgBigBite(G,R){ const P=Player, gy=groundY(G.x,G.z); G.mouth=1; Sound.sfx('suck'); twBig('DASH AWAY!',{size:58,col:'#ffb0c8',y:UH*.26,dur:1.3,sub:'He inhales, then he bites: be outside the red circle'});
  const st={t:0}; twHz({upd(dt,play){ if(!play) return true; st.t+=dt; const P2=Player; if(!P2.hidden&&P2.dash<=0&&!P2.cineFly){ const dx=G.x-P2.x, dz=G.z-P2.z, d=Math.hypot(dx,dz)||1, k=5.2*Math.min(1,st.t*2); if(d>2.2){ const q=twClampXZ(P2.x+dx/d*k*dt,P2.z+dz/d*k*dt,.3); P2.x=q.x; P2.z=q.z; } }
      for(let i=0;i<4;i++){ const a=rnd(0,6.28), r=rnd(3,9); FX.spawn(G.x+Math.cos(a)*r,G.y+rnd(.3,2),G.z+Math.sin(a)*r,-Math.cos(a)*r*1.4,0,-Math.sin(a)*r*1.4,.5,i%2?0xffb0c8:0xffffff,.3,0,true); } return st.t<2.2; }});
  yield 2.2; FX.ring(G.x,gy+.1,G.z,'#ff2a3a',R,.95); const fe=twFence(G.x,G.z,R,0xff3a5a,1); Sound.sfx('pigrumble'); G.mouth=.3; yield .95; try{ fe.kill(); }catch(e){}
  Sound.sfx('chomp'); shake(1.2); impactFrame([[3,2],[1,2]]); FX.burst(G.x,gy+1.5,G.z,60,0xffb0c8,9,.45); FX.ring(G.x,gy+.1,G.z,'#ffffff',R,.4); G.mouth=1;
  const d=Math.hypot(P.x-G.x,P.z-G.z); if(d<R&&!P.hidden&&!P.cineFly&&Game.state==='play'){ run(function*(){ yield* hzgSwallow(G); }); for(let w=0;w<12&&Game.script;w+=.1) yield .1; } else { /* the swallow is a script (it yields waits); this runs as his move (numbers) */ twBig('MISSED',{size:50,col:'#ffd45a',y:UH*.26,dur:1,sub:'He bit the air'}); twBark('hamza',"...I bit a flower. Bismillah. It was a good flower.",true); }
  G.mouth=0; yield .6; }
// ---------- LIMIT CUT: ALL-YOU-CAN-EAT (phase II, 50%): three courses, each with its counter ----------
hzgBuffet=function*(G){ const c=G.center||twCenter(), P=Player, gy=groundY(c.x,c.z); G.inv=true; G.mouth=0; G.mv=null; G.roll=0; /* this generator IS G.gen: never null it here */
  const C=hzgAlly('caotan'), O=hzgAlly('omar'), cleanup=()=>{ Game.letterTo=0; G.mouth=0; G.air=0; G.roll=0; G.landParry=0; TW.hg=null; P.inv=Math.min(P.inv,1); twCamFree(1.32); for(const A of [C,O]) if(A){ A.hold=0; A.air=0; } };
  TW.lcCleanup=cleanup;
  try{
    Game.letterTo=.4; P.inv=Math.max(P.inv,5); for(const A of [C,O]) if(A){ A.hold=1; A.air=1.3; }
    yield* twGenCam([G.x+3,gy+2.4,G.z+15],[G.x,gy+3,G.z],.7); Sound.sfx('pigroar'); shake(.6); twBark('hamza',"Waiter! The buffet. ALL of it. Three courses. You are every course.",true); yield 1.4;
    if(C) twBark('caotan',"...I'll be the waiter. For senpai.",true);
    yield* twGenCam([c.x,gy+13,c.z+20],[c.x,gy+1,c.z],1.2); twCutin('hamza','ALL-YOU-CAN-EAT','Limit Break  ·  three courses  ·  you are on the menu','#ff6a9a',1.8); yield 1.1;
    Game.letterTo=0; twCamFree(1.55); P.inv=1.2; for(const A of [C,O]) if(A){ A.hold=0; A.air=0; }
    // course one: four pork rolls down lanes through you. Parry them.
    twBark('hamza',"Course one: PORK ROLLS. Four. Parry them or be the filling.",true); G.inv=false; let par=0; const H=TW.hg={left:4,total:4,label:'COURSE ONE · PARRY THE ROLLS'};
    for(let k=0;k<4;k++){ yield* hzgLaneRoll(G,()=>{ par++; H.left=Math.max(0,H.left-1); }); yield .25; }
    TW.hg=null; twBig(par>=3?"CHEF'S KISS":par+' / 4 PARRIED',{size:54,col:par>=3?'#ffd45a':'#ffb0c8',y:UH*.26,dur:1.2,sub:par>=3?'Every roll sent back to the kitchen':'The kitchen is disappointed'}); if(par>=3) G.stun=Math.max(G.stun,1.6); yield 1.4;
    // course two: baby shower: babies rain everywhere while he bounces on you (parry the landings)
    twBark('hamza',"Course two: BABY SHOWER. Children! From the SKY!",true); TW.hg={left:18,total:18,label:'COURSE TWO · BABY SHOWER'}; hzgRain(18,5); G.landParry=1;
    try{ for(let k=0;k<3;k++){ const Pp=Player; yield* hzgLeap(G,Pp.x+Pp.vx*.4,Pp.z+Pp.vz*.4,k?.8:1,k===2?7:4.5,2.6,3,k===2?2:0,true); TW.hg.left=Math.max(0,18-Math.round((k+1)*6)); yield .3; } } finally{ G.landParry=0; }
    TW.hg=null; yield .8;
    // course three: dessert. The Big Bite: he inhales, then a red circle; be outside it
    twBark('hamza',"Course three: DESSERT. ...You. ITADAKIMASU!",true); yield* hzgBigBite(G,5.2);
    yield .6;
  } finally { TW.lcCleanup=null; cleanup(); }
  twBig('FOOD COMA',{size:60,col:'#ffd45a',sub:'Hamza is stunned. Go!'}); G.inv=false; G.stun=5; yield 5; };
// a move generator (seconds) driven from a script (wait objects)
function* hzgScript(g){ let r; while(!(r=g.next()).done){ yield wait(typeof r.value==='number'?r.value:1/60); } }
// ---------- the Frenzy at zero: LAST CALL, 15 seconds of roll, bounce, baby ring, faster and faster ----------
hzgFrenzy=function*(G){ const P=Player, gy=groundY(G.x,G.z); G.inv=true; G.mouth=1; Game.letterTo=1; G.roll=0; G.gen=null;
  cineSet(G.x+3,gy+2.4,G.z+13,G.x,gy+3,G.z); for(let i=0;i<5;i++){ G.flash=i%2?.3:0; Sound.sfx('chomp'); yield wait(.12); }
  yield say('hamza',"Hamza is... still... HUNGRY!",'angry'); yield say('shayan',"He's at ZERO! How is he still eating?!",'surprised');
  yield say('omar',"Fifteen seconds. Even a stomach has limits."); evaCard(['LAST CALL','SURVIVE 15 SECONDS'],1.6,1); Sound.sfx('slam'); shake(1); yield wait(1.6);
  Cam.cine=null; Game.letterTo=0; Game.state='play'; Sound.play('diva'); P.inv=1; const H=TW.hg={left:15,total:15,label:'LAST CALL · SURVIVE'};
  const steps=['roll','bounce','ring'], tick={t:0}; const timer=twHz({upd(dt,play){ if(play){ tick.t+=dt; H.left=Math.max(0,15-tick.t); } return H.left>0; }}); let k=0;
  while(H.left>0&&TW.giant===G){ const kind=steps[k%3]; k++;
    if(kind==='roll'){ yield* hzgScript(hzgLaneRoll(G,null)); }
    else if(kind==='bounce'){ G.landParry=1; try{ const Pp=Player; yield* hzgScript(hzgLeap(G,Pp.x+Pp.vx*.4,Pp.z+Pp.vz*.4,.8,5,2.6,3,0,true)); } finally{ G.landParry=0; } }
    else { const Pp=Player, n=8; for(let i=0;i<n;i++){ const a=i/n*6.283+rnd(-.2,.2), x=Pp.x+Math.cos(a)*3.6, z=Pp.z+Math.sin(a)*3.6, q=twClampXZ(x,z,1); const gz=groundY(q.x,q.z); FX.ring(q.x,gz+.08,q.z,'#ffb0c8',1.2,.5); } yield wait(.5); for(let i=0;i<n;i++){ const a=i/n*6.283, q=twClampXZ(Pp.x+Math.cos(a)*3.6,Pp.z+Math.sin(a)*3.6,1); hzgBaby(q.x,q.z,{drop:1,h:7}); } Sound.sfx('oink'); yield wait(.6); }
    yield wait(Math.max(.15,.5-k*.05)); }
  TW.hg=null; timer.kill&&timer.kill(); twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); hzgClearBabies(); G.air=0; G.roll=0; G.mouth=.4; Game.state='cut'; twBig('ZZZ',{size:80,col:'#ffd0ec',y:UH*.3,dur:1.4,sub:'He fell asleep mid-chew.'}); Sound.sfx('pigrumble'); yield wait(1.2); };
