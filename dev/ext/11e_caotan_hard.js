// =====================================================================
// CAOTAN, HARDER PHASES II-III (solo fight; phase I and the gate fight keep the old moves, though goo now has the white-pulse tell everywhere)
// goo     II "Overflow Hose": he pulses white twice, then a low stream of goo sweeps across in front of him (jump it, dash it, or parry
//            pellets back), then his lobbed puddles.
//         III "Flood Warning": lobbed goo lands in four closing rings around you (outermost first) plus one on you, leaving one (unmarked) gap
//            to walk out of while slowed; then a big slow homing MEGA SPERM: swing at it (big hitbox) and it splats him (1s stun), ignore it and
//            it bursts into an 8-way ring of pellets.
// pillow  II "Return to Sender": the two curving pillows boomerang back through where you stand (a pink line shows it).
//         III the same, but each comes back through you twice.
// letters II and III "Unread Messages": phones land one after another on you like a chasing snake (no shockwaves); every third is
//            a red VOICE MAIL with a big unjumpable circle and a shockwave: swat it back or it blows up.
// =====================================================================
(function(){ const goo=TWK.caotan.goo, pil=TWK.caotan.pillow, let_=TWK.caotan.letters;
  TWK.caotan.goo=function*(T,ph){ if(ph>=3){ yield* caoGooFlood(T,ph); return; } if(ph>=2){ yield* caoGooHose(T,ph); return; } yield* caoPulse(T,twSp(T)); /* phase I (and the gate) get the same tell */ yield* goo.apply(this,arguments); };
  TWK.caotan.pillow=function*(T,ph){ if(ph>=2){ yield* caoPillowReturn(T,ph); return; } yield* pil.apply(this,arguments); };
  TWK.caotan.letters=function*(T,ph){ if(ph>=2){ yield* caoUnread(T,ph); return; } yield* let_.apply(this,arguments); }; })();

// ---------- goo ----------
// the goo tell: Caotan pulses white twice
function* caoPulse(T,sp){ for(let k=0;k<2;k++){ T.flash=.16; twBark('caotan',"UGH!",true); /* he grunts on each pulse (no glint sound) */ FX.burst(T.x,T.y+1.4,T.z,14,0xffffff,4,.25,false); yield .42/sp; } }
// one lobbed goo sperm: a marked landing (unjumpable splat) that leaves a slowing white puddle
function caoGooLob(T,x,z,sp,o){ o=o||{}; const m=new THREE.Group(); m.userData.tw=1; scene.add(m); twSperm(m,1.5); T.fire=.2; Sound.sfx('squelch');
  return twThrow({x:T.x,y:T.y+1,z:T.z,tx:x,tz:z,dur:(o.dur||.85)/sp,h:3.5,mesh:m,r:1.1,col:0xffffff,trail:0xffffff,fence:true,onLand(lx,lz,play){ Sound.sfx('squelch'); FX.burst(lx,groundY(lx,lz)+.2,lz,14,0xffffff,3,.3,false);
    twZone(lx,lz,1.15,o.life||4.5,{col:0xfaf6ff,op:.95,fx:.05,splat:1}); if(play&&twInR(lx,lz,.95,99)) twHitP(1,lx,lz,{ub:true}); }}); }
function* caoGooHose(T,ph){ const sp=twSp(T), P=Player;
  const a0=Math.atan2(P.z-T.z,P.x-T.x), sw=.85, dir=Math.random()<.5?1:-1, from=a0-sw*dir; T.cast=.85/sp; T.lockF=1; T.f=Math.cos(a0)>=0?1:-1;
  yield* caoPulse(T,sp); /* the tell: he pulses white twice (no ground marker) */ twBark('caotan',"Overflow mode! Hose time! I'm DRIPPING with power!",true);
  const dur=1.5/sp; for(let t=0;t<dur;t+=.05){ const a=from+dir*(t/dur)*sw*2+rnd(-.04,.04), gy=groundY(T.x,T.z);
    twBolt(T,{kind:'goo',x:T.x+Math.cos(a)*.6,y:gy+.5,z:T.z+Math.sin(a)*.6,vx:Math.cos(a)*10*sp,vz:Math.sin(a)*10*sp,vy:0,col:0xffffff,dmg:2,life:2.2}); /* low: jump it */
    T.fire=.1; if(Math.random()<.4) Sound.sfx('squelch'); yield .05; }
  T.lockF=0; yield .3/sp;
  for(let i=0;i<6;i++){ const P2=Player, a=rnd(0,6.28), r=i===0?0:rnd(1.2,3.4), p=twClampXZ(P2.x+P2.vx*.5+Math.cos(a)*r,P2.z+P2.vz*.5+Math.sin(a)*r,.6); caoGooLob(T,p.x,p.z,sp); yield .13; }
  yield .45; }
function* caoGooFlood(T,ph){ const sp=twSp(T), P=Player; twBark('caotan',"Flood warning! Senpai, you're in the splash zone!",true); T.cast=.6;
  const cx=P.x, cz=P.z, ag=rnd(0,6.28), dAng=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
  // one gap stays open in the rings (unmarked: find it)
  // four rings, thrown from the outermost in (8.4, 6.3, 4.2, 2.3), each open in the same direction (a ~2.6-wide gap), then one on you
  for(const [r,n] of [[8.4,24],[6.3,18],[4.2,12],[2.3,8]]){ const half=1.3/r;
    for(let i=0;i<n;i++){ const a=ag+(r<3?.39:0)+i/n*6.283; if(dAng(a,ag)<half) continue; const p=twClampXZ(cx+Math.cos(a)*r,cz+Math.sin(a)*r,.6); caoGooLob(T,p.x,p.z,sp,{life:6.5}); yield .035; }
    yield .22/sp; }
  caoGooLob(T,cx,cz,sp,{life:6.5}); /* and one right where you stood: move! */
  yield 1.4/sp;
  yield* caoMegaSperm(T,sp); }
// the MEGA SPERM: slow and homing; parry it (silver slash, wide window) and it flies back and splats him, otherwise it bursts into pellets
function* caoMegaSperm(T,sp){ twBark('caotan',"Behold! My ultimate swimmer! He's been training for MONTHS!",true); T.fire=.4; Sound.sfx('charge');
  const m=new THREE.Group(); m.userData.tw=1; scene.add(m); twSperm(m,3.4); const P=Player, a=Math.atan2(P.z-T.z,P.x-T.x);
  const S={x:T.x+Math.cos(a),y:T.y+1.1,z:T.z+Math.sin(a),a,v:6*sp,t:0,st:'go',done:false};
  const burst=()=>{ for(let k=0;k<8;k++){ const b=k/8*6.283; twBolt(T,{kind:'goo',x:S.x,y:S.y,z:S.z,vx:Math.cos(b)*7,vz:Math.sin(b)*7,vy:0,col:0xffffff,dmg:2,life:2.5}); }
    FX.burst(S.x,S.y,S.z,30,0xffffff,6,.35,false); Sound.sfx('squelch'); Sound.sfx('slam'); shake(.35); S.done=true; };
  twHz({upd(dt,play){ if(!play||S.done) return !S.done; S.t+=dt; const P2=Player;
    if(S.st==='go'){ let d=Math.atan2(P2.z-S.z,P2.x-S.x)-S.a; while(d>Math.PI) d-=6.283; while(d<-Math.PI) d+=6.283; S.a+=clamp(d,-1.2*dt,1.2*dt);
      S.x+=Math.cos(S.a)*S.v*dt; S.z+=Math.sin(S.a)*S.v*dt; S.y=lerp(S.y,P2.y+1.1,Math.min(1,dt*4)); { const q=twClampXZ(S.x,S.z,.6); S.x=q.x; S.z=q.z; }
      if(Math.random()<.7) FX.spawn(S.x,S.y,S.z,0,.2,0,.4,0xffffff,.3,0,true);
      const dd=Math.hypot(P2.x-S.x,P2.z-S.z), back=()=>{ S.st='back'; S.t=0; Sound.sfx('deflect'); FX.spark(S.x,S.y,S.z); Game.dmgNums.push({x:P2.x,y:P2.y+2.8,z:P2.z,n:'RETURN TO DADDY',t:0,big:true,col:'#ffffff'}); };
      if(dd<2.6&&Math.abs(P2.y+1-S.y)<2.2&&(Game.time-twParryClock()<.3||impSwinging())&&!(P2.hurt>0)){ back(); } /* a big target: any swing near it sends it back */
      else if(dd<1.3&&Math.abs(P2.y+1-S.y)<1.8){ const r=twHitP(3,S.x,S.z,{melee:true,heavy:true,win:.4,onParry:back}); if(S.st==='go'&&r!=='none') burst(); }
      if(S.t>5) burst(); }
    else { const dx=T.x-S.x, dz=T.z-S.z, d=Math.hypot(dx,dz)||1, v=20; S.x+=dx/d*v*dt; S.z+=dz/d*v*dt; S.y=lerp(S.y,T.y+1.2,Math.min(1,dt*8));
      if(d<1){ twHurt(T,4,'bolt'); T.stun=Math.max(T.stun||0,1); T.flash=.3; FX.burst(T.x,T.y+1.4,T.z,50,0xffffff,7,.45,false); Sound.sfx('squelch'); Sound.sfx('gore'); shake(.5);
        Game.dmgNums.push({x:T.x,y:T.y+3,z:T.z,n:'STUNNED',t:0,big:true,col:'#ffd45a'}); twBark('caotan',"Ew! EW! He came back to me! This is so embarrassing!",true); S.done=true; } }
    m.position.set(S.x,S.y,S.z); return !S.done; }, kill(){ scene.remove(m); }});
  let w=0; while(!S.done&&w<7){ yield .1; w+=.1; } yield .4; }

// ---------- pillows ----------
// a pillow out and back; ret 'player' = it comes back through where you are (pink line), else back to him; o.lane = a straight rush at head height (no jumping it)
function caoPillow(T,o){ const sp=twSp(T), m=twBB(texPillow(),o.big||.95,(o.big||.95)*2.75), s={x:o.x!=null?o.x:T.x,z:o.z!=null?o.z:T.z,a:o.a,v:o.v||15*sp,out:true,t:0,hit:false,phase:'out'};
  const aim=()=>{ const P2=Player; s.phase='aim'; s.t=0; s.tx=P2.x; s.tz=P2.z; s.ra=Math.atan2(s.tz-s.z,s.tx-s.x); FX.line(s.x,s.z,s.ra,Math.hypot(s.tx-s.x,s.tz-s.z)+4,.9,0xff6ab0,.4); Sound.sfx('ting'); s.hit=false; };
  return twHz({upd(dt,play){ if(!play) return true; s.t+=dt; const gy=groundY(s.x,s.z), P2=Player;
    if(o.lane){ s.x+=Math.cos(s.a)*s.v*dt; s.z+=Math.sin(s.a)*s.v*dt; if(s.t>o.lane) return false; }
    else if(s.phase==='out'){ s.a+=(o.curl||0)*dt; s.v-=15*dt*sp; s.x+=Math.cos(s.a)*Math.max(0,s.v)*dt; s.z+=Math.sin(s.a)*Math.max(0,s.v)*dt;
      if(s.v<=0){ if(o.ret==='player'){ s.rets=o.returns||1; aim(); } else s.phase='home'; } }
    else if(s.phase==='aim'){ if(s.t>.4){ s.phase='ret'; s.t=0; Sound.sfx('whoosh'); } }
    else if(s.phase==='ret'){ const v=17*sp; s.x+=Math.cos(s.ra)*v*dt; s.z+=Math.sin(s.ra)*v*dt; if(s.t>1.1){ if(--s.rets>0) aim(); else s.phase='home'; } }
    else { const dx=T.x-s.x, dz=T.z-s.z, d=Math.hypot(dx,dz)||1, v=Math.min(16,s.t*14+4); s.x+=dx/d*v*dt; s.z+=dz/d*v*dt; if(d<.8) return false; }
    const c=twClampXZ(s.x,s.z,.2); s.x=c.x; s.z=c.z; m.position.set(s.x,gy+1.1,s.z); m.rotation.z+=dt*14; if(Math.random()<.5) FX.spawn(s.x,gy+1,s.z,0,.5,0,.4,0xffd0ec,.25,0,true);
    if(!s.hit&&Math.hypot(P2.x-s.x,P2.z-s.z)<(o.big?1.3:1)&&(o.lane||P2.y<gy+.9)){ const r=twHitP(2,s.x,s.z); if(r!=='none') s.hit=true; }
    return s.t<6; }, kill(){ scene.remove(m); }}); }
function* caoPillowWait(){ let w=0; while(!Voice.speaking&&w<.6&&Voice.on){ yield .05; w+=.05; } if(Voice.speaking){ let v=0; while(Voice.speaking&&v<3){ yield .05; v+=.05; } } else yield Math.max(0,.9-w); }
function* caoPillowReturn(T,ph){ const sp=twSp(T), n=ph>=3?2:1; if(n>1) twBark('caotan',"Hikari, Sakura, GO! And COME BACK!",true); else twBark('caotan',"Hikari, Sakura, GO!",true); /* voiced: the shout is the tell, the pillows fly as it ends */ yield* caoPillowWait();
  const P=Player, a0=Math.atan2(P.z-T.z,P.x-T.x); T.cast=.5; Sound.sfx('whoosh');
  for(const off of [-.42,.42]) caoPillow(T,{a:a0+off,curl:off<0?1.1:-1.1,ret:'player',returns:n});
  yield (n>1?4.6:3)/sp; }

// ---------- letters ----------
function* caoUnread(T,ph){ const sp=twSp(T); twBark('caotan',"You have... TWELVE... unread messages! Senpai, READ THEM!",true); T.cast=.6;
  const st={caught:false,busy:false}, n=9;
  for(let i=0;i<n;i++){ const P=Player, p=twClampXZ(P.x+P.vx*.35,P.z+P.vz*.35,.6); T.fire=.15; Sound.sfx('swing'); twPhone(T,p.x,p.z,.95/sp,st,ph,{vm:i%3===2}); yield .32/sp; }
  yield 1.1; let w=0; while(st.busy&&w<40){ w++; yield .1; } yield .3; }
