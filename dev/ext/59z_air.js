// =====================================================================
// THE AIR (Nathan phase I on Ali's road, v1.16):
// - Nathan deflects Getsugas: a standing Nathan parries every Getsuga Tenshou (not the LEVEL 3 Jujishou) and sends it off
//   at an angle behind him (no posture). Down, OPEN, or in a sequence he takes them.
// - He flies: between moves his hover height drifts (NP1.hovT, 1.4 to 4.2 units), so he's often out of a ground swing's reach;
//   his melee moves (combo, grab, the meteor's end) bring him down to Ali's level, or up to Ali if Ali is in the air.
// - Ali's forward blink: with lock-on, a blink toward Nathan goes to him, up to his height (so a floating or air-staggered
//   Nathan can be hit). It stops 1.6 in front of him, never past; already on him, a second forward blink passes through to
//   his far side.
// - The flip dodge: blinking INTO him in the grab's window is the perfect dodge as a front flip over his head. Attack during
//   it = the flip counter: Ali keeps flying away, somersaulting, facing the camera (which has swung round in front of him),
//   firing three Jujishous back over his shoulder into Nathan; then the camera swings back behind Ali.
// =====================================================================
function npDeflect(b){ const P=Player, [dx,dz]=np1Dir(); NP1.deflSide=-(NP1.deflSide||1); const back=Math.atan2(-dz,-dx)+NP1.deflSide*.7; /* behind him, left and right in turn */
  b.hit.add(NB); b.deflected=1; b.dx=Math.cos(back); b.dz=Math.sin(back); b.x=NB.x+b.dx*1.4; b.z=NB.z+b.dz*1.4; b.g.position.set(b.x,b.y,b.z); b.g.rotation.y=-back; b.life=Math.max(b.life,.8); b.mul=0;
  if(typeof nbsSlash==='function') nbsSlash(.22,.35); npStar(NB.x+dx*.8,NB.y+1.6,NB.z+dz*.8,0x9ff8ff,1.3,.25); FX.spark(NB.x+dx*.8,NB.y+1.6,NB.z+dz*.8); Sound.sfx('deflect'); Sound.tone('square',1700,800,.07,.05);
  Game.dmgNums.push({x:NB.x,y:NB.y+4,z:NB.z,n:'DEFLECTED',t:0,col:'#9ff8ff'}); /* no posture: Getsuga spam isn't the answer either */ }
// he parries every wave that isn't a punish: not while stunned, OPEN, kicked, in a counter of Ali's (dodge counter, Full Counter, flip counter), in a cutscene or past the Starbreaker's charge.
// The catch radius covers a frame of flight (the base hit, rad+1.2, has no height check either), so a wave can't skip from outside it into his body at a low frame rate.
const NP_DEFL_HIT=new Set(['counter','fc','flipctr']);
(function(){ const ub=updateBeams; updateBeams=function(dt){ try{ if(npoOn()&&!NB.stunned&&!(NP1.openT>0)&&!(NP1.seq&&NP_DEFL_HIT.has(NP1.seq.k))&&!Game.script&&!(NP1.ex&&NP1.ex.phase!=='charge')&&!NPO.kick) for(const b of BEAMS){ if(!b.ali||b.ctr||b.hit.has(NB)||b.life<=0||(b.chLv||0)>=3||b.deflected) continue;
        const rad=(b.big?1.6:1.15)+1.2+Math.max(0,b.sp*dt)+.3; if(Math.hypot(NB.x-b.x,NB.z-b.z)<rad) npDeflect(b); } }catch(e){ console.error('np deflect',e); } return ub.apply(this,arguments); }; })();
// ---------- he flies ----------
const NP_MELEE={combo:1,grab:1,meteor:1};
function npAir(dt){ if(NB.stunned||NP1.seq||NP1.alt!=null||NP1.ex||Game.script) return;
  if(NP1.gen){ if(NP_MELEE[NP1.cur]||NP1.charging){ const P=Player, ah=P.y-groundY(P.x,P.z), gy=groundY(NB.x,NB.z); NP1.hovT=ah>1?ah+1.4:1.4; NB.hov=lerp(NB.hov,NP1.hovT,1-Math.exp(-dt*8)); NB.y=lerp(NB.y,gy+NB.hov,1-Math.exp(-dt*10)); if(NB.mesh) NB.mesh.position.y=NB.y; } return; } /* melee: down to Ali's level (up only if he's in the air) */
  NP1.hovC=(NP1.hovC||0)-dt;
  if(NP1.hovC<=0){ NP1.hovC=rnd(2,4); NP1.hovT=Math.random()<.4?1.4:rnd(2.4,4.2); } if(NP1.hovT!=null) NB.hov=lerp(NB.hov,NP1.hovT,1-Math.exp(-dt*1.5)); }
(function(){ const nu=np1Update; np1Update=function(dt){ const r=nu.apply(this,arguments); try{ if(npoOn()) npAir(dt); }catch(e){ console.error('np air',e); } return r; }; })();
(function(){ const ns=np1Start; np1Start=function(){ const r=ns.apply(this,arguments); NP1.hovT=1.4; NP1.hovC=1.5; return r; }; })();
// ---------- the forward blink ----------
function npFwdBlink(ux,uz,d){ const P=Player, D=5, on=d<2.6; let tx,tz,ty;
  if(on){ tx=NB.x+ux*2; tz=NB.z+uz*2; Game.dmgNums.push({x:P.x,y:P.y+2.4,z:P.z,n:'THROUGH',t:0,col:'#8fc4ff'}); } /* already on him: through to his far side */
  else { const g=Math.min(D,Math.max(0,d-1.6)); tx=P.x+ux*g; tz=P.z+uz*g; } /* never past him: it stops 1.6 in front */
  const gy=groundY(tx,tz), reach=on||d-1.6<=D+.01; ty=reach?Math.max(gy,NB.y-1.1):Math.max(gy,P.y); /* reaching him: up to his height */
  P.x=tx; P.z=tz; P.y=ty; P.vy=0; P.vx=ux*3; P.vz=uz*3; P.inv=Math.max(P.inv,.22); P.atk=null; P.ang=Math.atan2(uz,ux); if(P.y>gy+.4) P.alFlipT=null; Sound.sfx('dash'); }
(function(){ const at=aliTeleport; aliTeleport=function(mx,mz){ try{ if(np1On()&&typeof TPS!=='undefined'&&TPS.lock&&!NP1.seq&&!Player.cineFly&&!(NP1.lunge&&NP1.grabLand-Game.time<=NP1_WIN+.1)){ const [dx,dz,d]=np1Dir(), ux=-dx, uz=-dz, l=Math.hypot(mx||0,mz||0);
      if(l>.1&&((mx||0)*ux+(mz||0)*uz)/l>.5){ NP1.blinkT=Game.time; npFwdBlink(ux,uz,d); return; } } }catch(e){ console.error('np fwd blink',e); } return at.apply(this,arguments); }; })();
// ---------- the flip dodge (the grab, blinking into him) ----------
function npFlipDodge(){ const P=Player, [dx,dz]=np1Dir(); np1PerfectDodge(-dx,-dz); const S=NP1.seq; if(!S||S.k!=='pdodge') return; const gy=groundY(NB.x-dx*3.2,NB.z-dz*3.2), high=NB.y-groundY(NB.x,NB.z)>2.5;
  Object.assign(S,{flip:1,ex:NB.x-dx*3.2,ez:NB.z-dz*3.2,sy:P.y,ey:high?Math.max(gy,NB.y-1.1):gy,top:NB.y+3.6,nx:0,nz:0}); P.alFlipT=Game.time; P.cineAnim='jump'; Sound.sfx('djump'); }
// the flip, in real time through the slow-mo: he vaults up to the top of the arc over his head (NPF_RISE), hangs there upside
// down while time crawls (to NPF_HOLD); attack = the flip counter from the top (pressed on the way up, it fires at the top).
// No press: time snaps back and he finishes the vault to the far side (NPF_FIN)
const NPF_RISE=.4, NPF_HOLD=1.35, NPF_FIN=.3;
function npFlipUpd(S,rdt,wdt){ const P=Player, t=S.t; let u, fk, bob=0; S.end=NPF_HOLD;
  if(S.fin==null){ if(t<NPF_RISE){ const k=t/NPF_RISE; u=.5*(1-(1-k)*(1-k)); fk=.5*k; } else { u=.5+.02*Math.min(1,(t-NPF_RISE)/(NPF_HOLD-NPF_RISE)); fk=.5; bob=Math.sin((t-NPF_RISE)*5)*.07; Game.slowT=Math.max(Game.slowT,.2); } }
  else { const k=Math.min(1,(t-S.fin)/NPF_FIN); u=.52+.48*k*k; fk=.5+.5*k; }
  P.x=lerp(S.sx,S.ex,u); P.z=lerp(S.sz,S.ez,u); const base=lerp(S.sy,S.ey,u); P.y=base+Math.sin(u*Math.PI)*Math.max(.5,S.top-Math.max(S.sy,S.ey))+bob;
  P.cineAnim='jump'; P.alFlipT=fk<1?Game.time-.55*Math.min(.99,fk):null; /* the front flip, frozen upside down at the top */ P.ang=Math.atan2(S.ez-S.sz,S.ex-S.sx); if(typeof TPS!=='undefined'&&TPS.f) P.f=TPS.f;
  const moving=t<NPF_RISE||S.fin!=null; S.gt-=rdt; if(moving&&S.gt<=0){ S.gt=.035; try{ const g=aliGhost(P.x,P.y,P.z); if(g&&g.mesh) g.mesh.material.color.setHex(0x6ab8ff); }catch(e){} }
  if(moving) for(let i=0;i<3;i++) FX.spawn(P.x+rnd(-.3,.3),P.y+rnd(.2,1.6),P.z+rnd(-.3,.3),0,0,0,.3,i%2?0x3a8aff:0xffffff,.3,0,true);
  else if(Math.random()<.5) FX.spawn(P.x+rnd(-.5,.5),P.y+rnd(.2,1.8),P.z+rnd(-.5,.5),0,rnd(.2,.6),0,.5,0x6ab8ff,.22,0,true);
  try{ if(typeof TPS!=='undefined'&&TPS.on&&S.fin==null){ camera.fov=t<.1?TPS.FOV+16*(t/.1):TPS.FOV+6+10*Math.exp(-(t-.1)*7); camera.updateProjectionMatrix(); } }catch(e){}
  if(NP1.pdFx) NP1.pdFx.t=t; if(typeof NBS!=='undefined') NBS.fixRow=4; /* his hand still out, grabbing air */
  if(S.fin==null&&t>.1&&consume('attack')) S.q=1;
  if(S.q&&t>=NPF_RISE){ np1PdLook(false); npFlipCounter(S.ex-S.sx,S.ez-S.sz); return; }
  if(S.fin==null&&t>=NPF_HOLD){ S.fin=t; np1PdLook(false); Game.slowT=0; Sound.hiss(1800,.3,.12,'bandpass'); Sound.tone('sine',90,420,.25,.12); /* time snaps back */ }
  if(S.fin!=null&&t-S.fin>=NPF_FIN){ NP1.seq=null; Game.slowT=0; P.cineFly=false; P.cineAnim=null; P.inv=.35; P.vy=0; if(typeof NBS!=='undefined') NBS.fixRow=null; } }
(function(){ const pu=np1PdUpd; np1PdUpd=function(S,rdt,wdt){ if(S&&S.flip) return npFlipUpd(S,rdt,wdt); return pu.apply(this,arguments); }; })();
// the flip counter: from the top of the vault on over and away from him, somersaulting, three Jujishous down into him as he
// passes over, the camera swung round in front. vx,vz: the vault's direction (default: away from Nathan)
function npFlipCounter(vx,vz){ const P=Player, [dx,dz]=np1Dir(), vl=Math.hypot(vx||0,vz||0), ux=vl>.1?vx/vl:dx, uz=vl>.1?vz/vl:dz, px=-uz, pz=ux; NP1.pdT=-9; NP1.gen=null; NB.dsh=null; NB.stunned=1; if(typeof NBS!=='undefined') NBS.fixRow=null;
  P.aliAtk=null; P.cineFly=true; P.cineAnim='jump'; P.inv=99; P.vx=P.vz=P.vy=0; Game.slowT=0; P.alFlipT=Game.time-.55*.5; /* on from the upside-down top of the flip */ const gy=groundY(P.x+ux*8,P.z+uz*8);
  NP1.seq={k:'flipctr',t:0,sx:P.x,sz:P.z,sy:P.y,ex:P.x+ux*8,ez:P.z+uz*8,ey:gy,ux,uz,px,pz,n:0,fired:[],bump:P.y-gy>2?.9:2.2}; Game.letterTo=.5;
  NP1.cam={x:P.x+ux*5.5+px*1.2,y:P.y+1.6,z:P.z+uz*5.5+pz*1.2,lx:P.x,ly:P.y+1.2,lz:P.z}; Sound.sfx('whoosh'); Sound.sfx('secret'); FX.flash=.3; grade.uniforms.flashCol.value.set(1,.2,.3);
  Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'FLIP COUNTER',t:0,big:true,col:'#ff6a7a'}); }
const NP_FLIP_T=[.04,.26,.48]; /* the first on the press, over his head */
function npFlipCtrUpd(S,dt){ const P=Player, k=Math.min(1,S.t/1.25), e=k*(2-k); P.x=lerp(S.sx,S.ex,e); P.z=lerp(S.sz,S.ez,e); P.y=Math.max(groundY(P.x,P.z),lerp(S.sy,S.ey,k*k)+Math.sin(Math.min(1,S.t/1.25)*Math.PI)*(S.bump||2.2));
  for(const b of S.fired) if(b.life>0&&!b.deflected){ b.y=lerp(b.y,NB.y+1.6,Math.min(1,dt*9)); b.g.position.y=b.y; } /* the shots dive down into him */
  if(S.t>.62&&!S.flip2){ S.flip2=1; P.alFlipT=Game.time; } P.cineAnim='jump'; P.ang=Math.atan2(S.uz,S.ux); P.f=S.ux>=0?1:-1; /* he faces the camera (his flight), the shots go back over his shoulder */
  const C=NP1.cam; if(C&&S.t<1.3){ C.x=lerp(C.x,P.x+S.ux*5.5+S.px*1.2,Math.min(1,dt*6)); C.z=lerp(C.z,P.z+S.uz*5.5+S.pz*1.2,Math.min(1,dt*6)); C.y=lerp(C.y,P.y+1.4,Math.min(1,dt*6)); C.lx=P.x; C.ly=P.y+1.2; C.lz=P.z; }
  while(S.n<3&&S.t>=NP_FLIP_T[S.n]){ S.n++; const a0=P.ang, f0=P.f, n0=BEAMS.length; try{ aliGetsuga(true); }catch(e){ console.error('flip shot',e); } P.ang=a0; P.f=f0; const b=BEAMS.length>n0?BEAMS[BEAMS.length-1]:null;
    if(b){ b.mul=6; b.ctr=1; S.fired.push(b); b.y=P.y+1.4; b.g.position.y=b.y; } Sound.sfx('crossboom'); shake(.4); FX.burst(P.x,P.y+1.4,P.z,24,0xff1a2a,6,.35); FX.burst(P.x,P.y+1.4,P.z,14,0x0a0006,5,.4,false); if(typeof TPS!=='undefined') TPS.fovK=4; }
  if(Math.random()<.9) FX.spawn(P.x+rnd(-.3,.3),P.y+rnd(.3,1.6),P.z+rnd(-.3,.3),0,0,0,.25,Math.random()<.5?0xff2a3a:0x3a8aff,.35,0,true);
  // the camera swings back behind Ali, then the fight's camera takes over
  if(S.t>=1.3&&S.t<1.75&&C){ const yaw=Math.atan2(NB.z-P.z,NB.x-P.x), fx=Math.cos(yaw), fz=Math.sin(yaw), py=Math.max(P.y,groundY(P.x,P.z)), W={x:P.x-fx*8,y:py+3.5,z:P.z-fz*8,lx:lerp(P.x,NB.x,.35),ly:py+1.3,lz:lerp(P.z,NB.z,.35)}, q=Math.min(1,dt*7); for(const key in W) C[key]=lerp(C[key],W[key],q); }
  if(S.t>=1.75){ NP1.seq=null; NP1.cam=null; Game.letterTo=0; P.cineFly=false; P.cineAnim=null; P.inv=.6; P.vy=0; if(typeof TPS!=='undefined') TPS.yaw=Math.atan2(NB.z-P.z,NB.x-P.x); if(!NP1.done) np1Stun(1.2,'COUNTERED'); } }
(function(){ const su=np1SeqUpd; np1SeqUpd=function(dt){ const S=NP1.seq; if(S&&S.k==='flipctr'){ S.t+=dt; npFlipCtrUpd(S,dt); return; } return su.apply(this,arguments); }; })();
// the flip counter's shots land on him whatever his state
(function(){ const nd=nbDamage; nbDamage=function(d){ if(npoOn()&&TW._beamHit&&NP1.seq&&NP1.seq.k==='flipctr'){ NB.stunned=1; } return nd.apply(this,arguments); }; })();
