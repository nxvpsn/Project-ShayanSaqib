// =====================================================================
// NATHAN'S POSTURE (phase I on Ali's road; Sekiro's): a gold bar under his HP that grows from the centre. He parries Ali's
// sword himself while he stands (no damage; +posture), and after NPO.nmax strikes (6) a bright strong parry kicks Ali
// back 4.5 units and he goes straight into a random move. Posture comes from Ali's parries (+14), hits in OPEN windows, Getsuga hits in OPEN windows (+8), the Full Counter (+35), the dodge counter (+25), full parries
// (+20/+15), the auto-parry's finish (+40) and the Starbreaker clash (+100). It decays after NPO.grace seconds without a
// gain. Full = POSTURE BREAK: he's down 5s and everything lands at 2x (it was 1.5x while staggered).
// =====================================================================
const NPO={max:100,decay:6,grace:1.5,lv:0,t:9,npar:0,nmax:6,kick:null,flash:0,broken:0,inv:.4}; /* inv: Ali's i-frames after a hit in this fight (the base gives 1s, which let the next laser pass unparryable) */
function npoOn(){ return typeof np1On==='function'&&np1On()&&!NP1.done; }
function npPosture(n,why){ if(!npoOn()||NB.stunned||n<=0) return; NPO.lv=Math.min(NPO.max,NPO.lv+n); NPO.t=0; NPO.flash=.3; if(NPO.lv>=NPO.max) npBreak(why); }
function npBreak(why){ NPO.lv=0; NPO.broken=1; const x=NB.x, y=NB.y+2.2, z=NB.z, gy=groundY(x,z);
  np1Stun(5,'POSTURE BREAK'); if(typeof twBig==='function') twBig('POSTURE BREAK',{size:60,col:'#ffd45a',y:UH*.3,dur:1.3});
  npStar(x,y,z,0xffd45a,3,.5); npStar(x,y,z,0xffffff,1.8,.35); FX.burst(x,y,z,60,0xffd45a,9,.4); FX.burst(x,y,z,30,0xffffff,7,.3); FX.ring(x,gy+.1,z,'#ffd45a',8,.6); FX.ring(x,gy+.12,z,'#ffffff',5,.45);
  for(let i=0;i<14;i++) FX.spawn(x,y,z,rnd(-6,6),rnd(2,8),rnd(-6,6),rnd(.6,1),0xffd45a,.22,14,false); /* gold shards */
  Sound.sfx('glass'); Sound.sfx('crossboom'); Sound.tone('sawtooth',90,20,.8,.22); Sound.tone('square',1200,300,.3,.08); impactFrame([[1,2],[3,2],[2,1]]); FX.hitstop=Math.max(FX.hitstop,.22); shake(1.2); FX.flash=Math.max(FX.flash,.6); grade.uniforms.flashCol.value.set(1,.85,.4);
  if(typeof TPS!=='undefined'){ TPS.kick=.6; TPS.fovK=-7; } twBark('nathan',["Gh... my footing...","Impossible... hold... HOLD!"][Math.floor(Math.random()*2)],true); }
// ---------- his parry of Ali's sword ----------
function npNathanParry(){ const P=Player, [dx,dz]=np1Dir(), mx=lerp(NB.x,P.x,.45), mz=lerp(NB.z,P.z,.45), my=NB.y+1.6; NPO.npar++; const strong=NPO.npar>=NPO.nmax;
  P.aliAtk=null; P.comboT=0; if(typeof nbsSlash==='function') nbsSlash(.22,.35);
  if(!strong){ npStar(mx,my,mz,0x9ff8ff,1.1,.25); FX.spark(mx,my,mz); Sound.sfx('deflect'); Sound.tone('square',1900,900,.07,.05); FX.hitstop=Math.max(FX.hitstop,.05); shake(.2); if(typeof TPS!=='undefined') TPS.kick=Math.min(TPS.kick||0,-.15);
    Game.dmgNums.push({x:NB.x,y:NB.y+4,z:NB.z,n:'PARRIED',t:0,col:'#9ff8ff'}); P.x-=dx*.5; P.z-=dz*.5; return; } /* no posture for swinging into his guard */
  // the strong one: a blinding star, the kick (4.5 units back, no damage), then straight into a move
  NPO.npar=0; NPO.nmax=6; npStar(mx,my,mz,0xffffff,2.6,.4); npStar(mx,my,mz,0x9ff8ff,1.6,.3); FX.burst(mx,my,mz,40,0xffffff,8,.3); FX.flash=.6; grade.uniforms.flashCol.value.set(.7,.95,1); FX.hitstop=Math.max(FX.hitstop,.14); impactFrame([[3,1],[1,1]]); shake(.9);
  Sound.sfx('parry'); Sound.sfx('crossboom'); Sound.sfx('slam'); Sound.tone('sawtooth',120,40,.3,.12); if(typeof TPS!=='undefined'){ TPS.kick=-.5; TPS.fovK=-6; }
  Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'KICKED',t:0,big:true,col:'#9ff8ff'}); twBark('nathan',["Off.","My turn.","Predictable."][Math.floor(Math.random()*3)],true);
  nbAfterimage(NB.x,NB.y,NB.z); NB.x=P.x-dx*1.2; NB.z=P.z-dz*1.2; NB.dsh=null; /* he steps in for the kick */
  const K={t:0,sx:P.x,sz:P.z}; NPO.kick=K; P.hurt=.4; P.aliAtk=null; P.charge=0; P.vx=P.vz=0; FX.ring(P.x,groundY(P.x,P.z)+.1,P.z,'#9ff8ff',2,.3);
  Game.fxUpd.push(dt=>{ if(NPO.kick!==K) return false; K.t+=dt; const u=Math.min(1,K.t/.32), e=1-Math.pow(1-u,3); P.x=K.sx+dx*4.5*e; P.z=K.sz+dz*4.5*e; P.y=Math.max(groundY(P.x,P.z),P.y);
    if(u<1&&Math.random()<.8) FX.spawn(P.x,P.y+rnd(.3,1.5),P.z,0,0,0,.25,0x9ff8ff,.3,0,true); if(u>=1){ NPO.kick=null; return false; } return true; });
  NP1.gen=null; NP1.cd=.15; if(NP1.order&&NP1.order.length>1) NP1.order.length=0; /* straight into a random move */ }
// ---------- hooks ----------
// the damage model: his parry of the sword, Getsugas at half (+posture), 2x while he's down
(function(){ const nd=nbDamage; nbDamage=function(d,ult){ if(npoOn()&&NP1.melee&&NP1.charging&&!NB.stunned){ try{ np1Interrupt(); }catch(e){ console.error('np interrupt',e); } return nd.apply(this,arguments); }
    if(npoOn()&&NP1.melee&&!NB.stunned&&!(NP1.openT>0)&&!NP1.seq&&!Game.script&&!NPO.kick){ if(Game.time<(NP1.redEnd||0)||Game.time-(NPO.lastParryT||-9)<.4) return; /* the parry swing (a red strike on its way, or just parried): not a raw attack, no count */ try{ npNathanParry(); }catch(e){ console.error('np parry',e); } return; }
    if(npoOn()&&TW._beamHit&&!NB.stunned&&!(NP1.openT>0)){ d*=.5; npPosture(8,'getsuga'); } else if(npoOn()&&NP1.openT>0&&!NB.stunned) npPosture(NP1.melee?6:8,'open'); if(npoOn()&&NB.stunned) d*=4/3; /* 1.5x in 59v: 2x in all */
    return nd.apply(this,arguments); }; })();
(function(){ const ub=updateBeams; updateBeams=function(){ TW._beamHit=1; try{ return ub.apply(this,arguments); } finally{ TW._beamHit=0; } }; })();
(function(){ const mp=twMeleeParry; twMeleeParry=function(){ const r=mp.apply(this,arguments); try{ if(npoOn()){ NPO.lastParryT=Game.time; npPosture(14,'parry'); } }catch(e){} return r; }; })();
(function(){ const fc=np1FullCounter; np1FullCounter=function(){ const r=fc.apply(this,arguments); try{ npPosture(35,'fullcounter'); }catch(e){} return r; }; })();
(function(){ const st=np1Stun; np1Stun=function(t,why){ try{ const g={'PARRIED ×5':40,'COUNTERED':25,'FULL PARRY':20,'CAGE BROKEN':15,'FULL COUNTER':0,'BLADE CUT':0}[why]; if(g) npPosture(g,why); }catch(e){} return st.apply(this,arguments); }; })();
// the bar: decay, the break's end
(function(){ const nu=np1Update; np1Update=function(dt){ const r=nu.apply(this,arguments); try{ if(npoOn()){ NPO.flash=Math.max(0,NPO.flash-dt*2); if(!NB.stunned){ NPO.t+=dt; if(NPO.t>NPO.grace&&NPO.lv>0) NPO.lv=Math.max(0,NPO.lv-NPO.decay*dt); if(NPO.broken){ NPO.broken=0; NPO.t=0; } } } }catch(e){ console.error('np posture',e); } return r; }; })();
(function(){ const ns=np1Start; np1Start=function(){ const r=ns.apply(this,arguments); Object.assign(NPO,{lv:0,t:9,npar:0,nmax:6,kick:null,flash:0,broken:0});
    try{ np1Hint('posture','Break his POSTURE (the gold bar): parry, counter and clash. He parries your sword while he stands; he\'s open when he\'s down'); if(!IS_TOUCH()) np1Hint('lock','Middle click: lock-on on / off'); }catch(e){} return r; }; })();
(function(){ const nr=np1Reset; np1Reset=function(){ Object.assign(NPO,{lv:0,t:9,npar:0,kick:null,flash:0,broken:0}); return nr.apply(this,arguments); }; })();
// the bar under his HP line, growing from the centre
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ if(!npoOn()||!NP1.live||Game.letter>.5) return; const bw=Math.min(UW*.6,560), bx=(UW-bw)/2, by=13, k=NPO.lv/NPO.max, hot=k>.8, pu=NPO.flash>0?1+NPO.flash*.5:1, a=NP1.bar;
      D.save(); D.globalAlpha=a; D.fillStyle='rgba(20,14,4,.7)'; D.fillRect(bx,by,bw,3); const w=bw*k*.5; D.fillStyle=NB.stunned?'#ffffff':hot&&Math.floor(Game.time*12)%2?'#fff0a0':'#ffb020'; D.fillRect(UW/2-w,by-(pu-1)*2,w*2,3+(pu-1)*4);
      D.font=`800 10px ${FB}`; D.textAlign='left'; D.textBaseline='middle'; D.lineWidth=3; D.strokeStyle='rgba(0,0,0,.6)'; D.strokeText('POSTURE',bx+bw+6,by+1); D.fillStyle='#ffd45a'; D.fillText('POSTURE',bx+bw+6,by+1); D.restore();
      if(NP1.openT>0&&!NB.stunned&&!NP1.seq){ const q=toScreen(NB.x,NB.y+5.2,NB.z); if(q[0]>-50&&q[0]<UW+50&&q[1]>-50){ const pu=1+.08*Math.sin(Game.time*16); D.save(); D.translate(q[0],q[1]); D.scale(pu,pu); D.font=`900 ${IS_TOUCH()?22:26}px ${FB}`; D.textAlign='center'; D.textBaseline='bottom'; D.lineWidth=5; D.strokeStyle='#08121c'; D.strokeText('OPEN',0,0); D.fillStyle='#ffffff'; D.fillText('OPEN',0,0); D.restore(); } } }catch(e){ console.error('np posture ui',e); } }; })();
// ---------- Ali's i-frames in this fight (the top-down game keeps its own) ----------
// After a hit, 0.4s of invulnerability instead of the base 1s, and a well-timed press always parries, i-frames or not: a missed
// laser never leaves the next one unparryable, and a laser and a slash landing together are each judged on their own timing.
// Every red attack, melee or laser, goes through twHitP with melee:true, so one rule covers both and any mix of them.
(function(){ const hp=hurtPlayer; hurtPlayer=function(){ const r=hp.apply(this,arguments); try{ if(typeof tpsFight==='function'&&tpsFight()&&Player.inv>0&&Player.inv<=1) Player.inv=Math.min(Player.inv,NPO.inv); }catch(e){} return r; }; })();
// Strict timing (Shayan's rule, 12_strict, applied to Ali here): the FIRST attack press after a red tell decides. Inside the
// last NP1_WIN before the strike = parry; earlier = a whiff that no later press can save. So mashing never parries.
(function(){ const ph=playerHit; playerHit=function(dmg,sx,sz,opt){ const P=Player;
    try{ if(typeof tpsFight==='function'&&tpsFight()&&opt&&opt.melee&&!opt.pierce&&!P.cineFly&&Game.state==='play'){ const win=opt.win||.26;
        let strictOk=null; if(NP1.tellT!=null&&Game.time-NP1.tellT<3){ const p=twStrictFirst(NP1.tellT); strictOk=!!p&&Game.time-p.t<=win; }
        if(strictOk===false){ const a0=P.atkPressT, s0=P.swingT; P.atkPressT=-9; P.swingT=-9; try{ return ph.apply(this,arguments); } finally{ P.atkPressT=a0; P.swingT=s0; } } /* the first press was early (or there was none): no parry */
        if(P.inv>0&&P.inv<=1){ const since=Game.time-twParryClock(), ok=strictOk===true||(P.block&&!opt.noGuard)||since<win;
          if(ok){ const inv0=P.inv; P.inv=0; let r; try{ r=ph.apply(this,arguments); } finally{ P.inv=Math.max(P.inv,inv0); } return r; } } } }catch(e){ console.error('np iframes',e); }
    return ph.apply(this,arguments); }; })();
