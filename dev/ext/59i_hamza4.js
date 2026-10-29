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
// the sprite spins while he rolls (after the draw places it)
(function(){ const ds=drawSprites; drawSprites=function(){ const r=ds.apply(this,arguments); try{ const G=TW.giant; if(gpSprite&&gpSprite.mesh){ const want=G&&G.roll?(G.rollA||0):0; gpSprite.mesh.rotation.z=G&&G.roll?want:gpSprite.mesh.rotation.z*(G?.8:0); if(!G||!G.roll){ if(Math.abs(gpSprite.mesh.rotation.z)<.02) gpSprite.mesh.rotation.z=0; } } }catch(e){} return r; }; })();
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
