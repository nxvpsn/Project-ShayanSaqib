// =====================================================================
// TIMED PARRIES: mashing no longer works. Each strike judges the FIRST attack press made after its tell
// (plus a short grace, so a swing already in progress is never punished): inside the window = parry,
// earlier = whiff. A second tap cannot save an early first one.
// =====================================================================
const TW_STRICT={grace:.2,win:.26};
// every fresh attack press (not held, not queued combo swings)
(function(){ const up=updatePlayer; updatePlayer=function(dt){ if(hit.attack&&Game.state==='play'){ const a=TW.presses||(TW.presses=[]); a.push({t:Game.time}); if(a.length>40) a.shift(); } return up.apply(this,arguments); }; })();
function twStrictFirst(from){ for(const p of TW.presses||[]) if(p.t>from) return p; return null; }
// 'ok' (first press inside the window), 'early', or 'none' (no press yet)
function twStrictJudge(from,win){ const p=twStrictFirst(from); if(!p) return 'none'; return Game.time-p.t<=(win||TW_STRICT.win)?'ok':'early'; }
// world seconds until something arrives -> real seconds (parry slow-mo runs the world at 0.3x and hitstop freezes it; the parry window is real time)
function twRealAhead(w){ const h=Math.max(0,FX.hitstop||0), sl=Math.max(0,Game.slowT||0); return h+(w<=sl*.3?w/.3:sl+(w-sl*.3)); }
// run fn with strict judging from time `from` (melee parries need a well-timed first press). Ali's guard is left alone.
function twStrictDo(from,fn){ const prev=TW._strictFrom; TW._strictFrom=from; try{ return fn(); } finally{ TW._strictFrom=prev; } }
(function(){ const hk=twPlayerHitHook; twPlayerHitHook=function(dmg,sx,sz,opt){
  if(TW._strictFrom!=null&&opt&&opt.melee&&!ALI()&&twStrictJudge(TW._strictFrom,opt.win)!=='ok') return null; return hk.apply(this,arguments); }; })();

// ---------- Caotan: Tsundere Triple Rush, timed ----------
// Pressing attack early while standing in his arrow: he blinks behind you and Hikari-chan hits you point blank (unblockable).
TWK.caotan.tsun=function*(T,ph){ const sp=twSp(T); T.heartEyes=1; twBark('caotan',"I-it's not like I WANTED to hit you! B-baka!!",true); Sound.sfx('doki'); twComboStart(T,3);
  for(let i=0;i<3;i++){ yield* twTsunSetup(T,i===0);
    const P=Player, a=Math.atan2(P.z-T.z,P.x-T.x), d=Math.min(15,Math.hypot(P.x-T.x,P.z-T.z)+3.5), tell=(i?.45:.6)/sp+(i===2?.25:0), ux=Math.cos(a), uz=Math.sin(a);
    FX.line(T.x,T.z,a,d,2.6,0xff6ab0,tell); T.lockF=1; T.f=ux>0?1:-1;
    const tEnd=Game.time+tell, sx=T.x, sz=T.z, S={from:Game.time+TW_STRICT.grace,done:false,early:false,dash:false};
    // the first press made while standing in the arrow decides: early = punished (presses outside the arrow are skipped)
    const watch=()=>{ for(let g=0;g<40&&!S.done;g++){ const p=twStrictFirst(S.from); if(!p) return; const P2=Player, rx=P2.x-sx, rz=P2.z-sz, al=rx*ux+rz*uz, pe=Math.abs(rx*uz-rz*ux);
      if(al<-.5||al>d+.5||pe>1.6){ S.from=p.t; continue; } S.done=true;
      const cx=S.dash?T.x:sx, cz=S.dash?T.z:sz, ahead=Math.max(0,(P2.x-cx)*ux+(P2.z-cz)*uz-TW_DASH_R), left=(S.dash?0:Math.max(0,tEnd-p.t))+ahead/17;
      if(left>TW_DASH_WIN) S.early=true; } };
    while(Game.time<tEnd){ watch(); if(S.early) break; yield .016; }
    if(S.early){ yield* twTsunPunish(T); return; }
    const s={t:0,hit:false,dur:d/17}; Sound.sfx('dash'); T.parried=0; S.dash=true;
    twHz({upd(dt,play){ if(!play) return true; s.t+=dt; T.x+=ux*17*dt; T.z+=uz*17*dt; const c=twClampXZ(T.x,T.z,.5); T.x=c.x; T.z=c.z; FX.spawn(T.x,T.y+1.4,T.z,0,0,0,.35,0xff8ac8,.6,0,true);
      watch(); if(S.early) return false;
      const P2=Player; if(!s.hit&&Math.hypot(P2.x-T.x,P2.z-T.z)<TW_DASH_R&&Math.abs(P2.y-groundY(T.x,T.z))<2.4){ const r=twStrictDo(S.from,()=>twComboHit(T,2,T.x,T.z,{win:TW_DASH_WIN,onParry:()=>{ T.parried=1; }})); if(r!=='none') s.hit=true; }
      return s.t<s.dur&&!T.parried; }});
    let w=0; while(w<s.dur+.1&&!S.early){ yield .016; w+=.016; }
    if(S.early){ yield* twTsunPunish(T); return; }
    if(T.parried&&i<2) twBark('caotan',["Hmph! Lucky!","AGAIN?! Stop deflecting my feelings!"][i],true); }
  T.lockF=0;
  if(twComboEnd(T,2.5)){ twBark('caotan',"Three parries... my heart... it's going doki doki for the wrong reasons...",true); T.heartEyes=0; return; }
  twBark('caotan',"*SLAP*",true); twBlast(T.x,T.z,2.4,.35,{col:0xff3a7a,dmg:3,shake:.5,h:.45}); twWave(T.x,T.z,{sp:8,max:9,col:0xff6ab0,delay:.35,r0:2.4}); /* the ring starts at the slap's edge, so one jump clears whichever reaches you */ yield .9; T.heartEyes=0; };
// the tell: two short blinks where he stands, then he blinks out to about 9 units from you (before every rush, so it is never point blank)
function twTsunFar(T){ const P=Player, base=Math.atan2(T.z-P.z,T.x-P.x); let best=null, bd=-1;
  for(let k=0;k<12;k++){ const a=base+(k%2?1:-1)*Math.ceil(k/2)*Math.PI/6, p=twClampXZ(P.x+Math.cos(a)*9,P.z+Math.sin(a)*9,1), d=Math.hypot(p.x-P.x,p.z-P.z); if(d>=8.5){ best=p; break; } if(d>bd){ bd=d; best=p; } } return best; }
function* twTsunSetup(T,first){ if(first){ for(let k=0;k<2;k++){ const a=rnd(0,6.28), r=rnd(1.2,2.2); twBlink(T,T.x+Math.cos(a)*r,T.z+Math.sin(a)*r); Sound.sfx('ting'); yield .22; } }
  const p=twTsunFar(T); twBlink(T,p.x,p.z); T.lockF=0; yield first?.2:.12; }
function* twTsunPunish(T){ const P=Player; T.combo=null; twBlinkTo(T,'back',1.3,0xffb0e0); T.f=P.x<T.x?-1:1; T.lockF=1; T.cast=.5;
  twBark('caotan',"Too eager, senpai! Hikari-chan, point blank!",true); Sound.sfx('whoosh');
  const m=twBB(texPillow(),.95,2.6), gy=groundY(P.x,P.z); m.userData.tw=1; m.position.set(T.x,gy+1.1,T.z); scene.add(m);
  twHz({upd(dt){ this.t+=dt; const u=Math.min(1,this.t/.12), P2=Player; m.position.set(lerp(T.x,P2.x,u),gy+1.1,lerp(T.z,P2.z,u)); m.rotation.z+=dt*20; return this.t<.35; }, kill(){ scene.remove(m); }});
  twHitP(3,T.x,T.z,{ub:true}); Game.dmgNums.push({x:P.x,y:P.y+2.8,z:P.z,n:'TOO EARLY',t:0,big:true,col:'#ff6a9a'});
  yield .8; T.lockF=0; T.heartEyes=0; T.cast=0; }
