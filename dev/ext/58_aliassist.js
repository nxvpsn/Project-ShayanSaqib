// =====================================================================
// AI ALI, THE ASSIST (duo fight only, never the co-op friend):
//   - Shayan dies: Ali cuts through his injuries (full heal), three times per try
//   - 25% of moves: Ali stands guard, the hits of that move on Shayan are parried by Ali (up to three)
//   - 25% of ranged moves: after a moment Ali teleports in and kicks the shooter into the ground (stunned),
//     and every projectile and summon of that move is cut by a tiny Judgement Cut
// Judgement Cut slashes on screen can have a ttl: they draw, then shrink away (no more lingering lines).
// =====================================================================
(function(){ const us=updateSlashPass; updateSlashPass=function(dt){
    if(JC.lines.some(l=>l.ttl)){ JC.lines=JC.lines.filter(l=>{ if(!l.ttl) return true; if(l.born==null) l.born=l.t; const age=l.t-l.born; if(age>l.ttl) return false;
        if(l.w!=null){ if(l.w0==null) l.w0=l.w; l.w=Math.max(.01,l.w0*clamp((l.ttl-age)/(l.ttl*.55),0,1)); } return true; }); }
    return us.apply(this,arguments); }; })();
// a tiny slash on screen over a world point (fades on its own)
function twTinyJC(x,y,z,len){ const s=toScreen(x,y,z); if(s[2]>1) return; const a=rnd(0,Math.PI), L0=len||110; JC.lines.push({x0:s[0]-Math.cos(a)*L0,y0:s[1]-Math.sin(a)*L0,x1:s[0]+Math.cos(a)*L0,y1:s[1]+Math.sin(a)*L0,t:0,ttl:.3}); }

function twAliReady(A){ return !!A&&!A.gone&&!A.hidden; }
// at the start of every duo move
function twDuo3Roll(F,k,mid){ const A=twAliAI(); if(!twAliReady(A)||F.lc) return;
  if(Math.random()<.25) F.guard={mid,n:0};
  const who=DUO3_RANGED[k]; if(who&&Math.random()<.25) F.kick={mid,who,at:Game.time+rnd(.9,1.3)}; }
function twDuo3Assist(F,dt,play){ if(!play) return; const A=twAliAI();
  if(F.revQ&&!Game.script&&Game.state==='play'){ const n=F.revQ; F.revQ=0; run(function*(){ yield* twAliRevive(F,n); }); return; }
  const K=F.kick; if(K&&Game.time>=K.at){ F.kick=null; if(K.mid===F.mid&&F.busy&&!F.lc&&!F.grabbed&&twAliReady(A)&&(F.C.gen||F.O.gen)) twAliKick(F,A,K); } }

// ---------- the kick ----------
function twAliKick(F,A,K){ const T=K.who==='caotan'?F.C:F.O, o=T===F.C?F.O:F.C, mid=K.mid, gy=groundY(T.x,T.z);
  // the move stops dead
  F.C.gen=null; F.O.gen=null; for(const X of [F.C,F.O]){ X.state='idle'; X.lockF=0; X.swing=0; X.cast=0; X.fire=0; X.heartEyes=0; if(X.hide){ X.hide=0; } X.hy=1.3; } TW.sentence=null; TW.caoSafe=null;
  aliGhost(A.x,A.y,A.z); const side=A.x<T.x?-1:1; A.x=T.x+side*.9; A.z=T.z+.3; A.f=-side; A.flash=.2; Sound.sfx('dash'); Sound.sfx('secret'); FX.burst(A.x,A.y+1,A.z,24,0xb0182a,5,.35);
  Game.slowT=Math.max(Game.slowT,.4); FX.hitstop=Math.max(FX.hitstop,.1);
  // every bolt and hazard of that move gets cut
  const cuts=[]; for(const b of BOLTS){ if(b.dead||b.friendly||b.mid!==mid) continue; b.dead=1; cuts.push([b.x,b.y,b.z]); }
  for(const h of TW.hz.slice()){ if(h.mid!==mid) continue; if(h._x!=null) cuts.push([h._x,groundY(h._x,h._z)+1,h._z]); try{ h.kill&&h.kill(); }catch(e){} const i=TW.hz.indexOf(h); if(i>=0) TW.hz.splice(i,1); }
  const seq={t:0,n:0}; Game.fxUpd.push(dt=>{ seq.t+=dt; while(seq.n<Math.min(cuts.length,16)&&seq.t>seq.n*.035){ const [x,y,z]=cuts[seq.n++]; twTinyJC(x,y,z,90); FX.cut(x,y,z); FX.burst(x,y,z,10,0xff2a3a,4,.25); if(seq.n%2) Sound.sfx('swing'); } return seq.n<Math.min(cuts.length,16); });
  // the kick: down he goes
  T.down=1; T.stun=Math.max(T.stun,2.6); T.state='stun'; T.flash=.4; T.mv=null; Sound.sfx('punch'); Sound.sfx('crash'); shake(.7); impactFrame([[2,1],[1,1]]); FX.ring(T.x,gy+.1,T.z,'#ff3a4a',3,.45); FX.burst(T.x,gy+.4,T.z,40,0xd8c0c8,6,.4,false);
  Game.dmgNums.push({x:T.x,y:gy+3.4,z:T.z,n:'KICKED DOWN',t:0,big:true,col:'#ff6a7a'}); TW._ally=1; try{ twHurt(T,3,'ally'); } finally{ TW._ally=0; }
  o.stun=Math.max(o.stun,.9); o.state='stun';
  const r=Math.floor(Math.random()*3); if(r===0) twBark('ali',"Sit.",true); else if(r===1) twBark('ali',"No.",true); else twBark('ali',"Down. Stay.",true);
  const up={t:0}; twHz({upd(dt){ up.t+=dt; if(up.t>.7&&!up.said){ up.said=1; if(T.who==='caotan') twBark('caotan',"He kicked me! In the GLASSES!",true); else twBark('omar',"I have been... grounded.",true); } if(up.t>=2.4){ T.down=0; return false; } return true; }, kill(){ T.down=0; }}); }

// ---------- the guard: Ali parries for Shayan ----------
(function(){ const ph=playerHit; playerHit=function(dmg,sx,sz,opt){ const F=TW.fight, P=Player, G=F&&F.kind==='duo'?F.guard:null;
  if(G&&G.mid===F.mid&&G.n<3&&Game.state==='play'&&P.inv<=0&&P.dash<=0&&!P.cineFly&&!ALI()){ const A=twAliAI();
    if(twAliReady(A)&&A.down<=0&&!(opt&&opt.melee&&Game.time-twParryClock()<(opt.win||.26))){ G.n++; twAliGuard(A,sx,sz); return 'parry'; } }
  return ph.apply(this,arguments); }; })();
function twAliGuard(A,sx,sz){ const P=Player, a=Math.atan2(sz-P.z,sx-P.x); aliGhost(A.x,A.y,A.z); const p=twClampXZ(P.x+Math.cos(a)*.8,P.z+Math.sin(a)*.8,.4); A.x=p.x; A.z=p.z; A.f=Math.cos(a)>0?1:-1; A.flash=.2;
  P.inv=Math.max(P.inv,.5); Sound.sfx('parry'); Sound.sfx('deflect'); for(let i=0;i<3;i++) FX.spark(A.x,A.y+1.1,A.z); FX.ring(A.x,A.y+.1,A.z,'#ff3a4a',2,.3); Game.slowT=Math.max(Game.slowT,.18);
  Game.dmgNums.push({x:A.x,y:A.y+2.6,z:A.z,n:'ALI: TOO SLOW',t:0,big:true,col:'#ff8a9a'}); if(Math.random()<.35){ const r=Math.floor(Math.random()*3); if(r===0) twBark('ali',"Mine.",true); else if(r===1) twBark('ali',"Stay behind me.",true); else twBark('ali',"You're welcome.",true); } }

// ---------- the revive ----------
(function(){ const od=Game.onDeath; Game.onDeath=function(){ const F=TW.fight, A=twAliAI(), P=Player;
  if(F&&F.kind==='duo'&&A&&!TW.god&&!ALI()&&(F.heals||0)<3){ F.heals=(F.heals||0)+1; P.hp=1; P.inv=99; P.dash=0; P.atk=null; if(Game.script) F.revQ=F.heals; else run(function*(){ yield* twAliRevive(F,F.heals); }); return; }
  return od.apply(this,arguments); }; })();
function* twAliRevive(F,n){ const P=Player, A=twAliAI(), gy=groundY(P.x,P.z), sat=grade.uniforms.sat.value; if(!A){ P.hp=P.maxHp; P.inv=1; return; }
  Game.letterTo=.5; P.cineFly=true; P.cineAnim='hurt'; P.vx=P.vz=P.vy=0; P.y=gy; A.hold=1; A.down=0; A.hp=A.maxHp; grade.uniforms.sat.value=.25; Sound.sfx('drone');
  cineSet(P.x+2.4,gy+.7,P.z+3.6,P.x,gy+.8,P.z); yield wait(.45);
  // he is already there
  aliGhost(A.x,A.y,A.z); A.x=P.x-1.3; A.z=P.z+.35; A.face=1; FX.burst(A.x,A.y+1,A.z,30,0xb0182a,5,.35); Sound.sfx('dash');
  yield cineTo([P.x-.6,gy+1.4,P.z+3.2],[P.x-.6,gy+1.1,P.z],.35,twEIO);
  if(n===1) twBark('ali',"Don't move. I'm cutting through your injuries. They had it coming.",true);
  else if(n===2) twBark('ali',"I sliced your wounds in half. Both halves surrendered.",true);
  else twBark('ali',"Last one. I cut the death off you. It was a sloppy death anyway.",true);
  yield wait(1.6);
  Sound.sfx('secret'); JC.flash=.35; for(let i=0;i<6;i++){ twTinyJC(P.x,P.y+1,P.z,180+i*20); FX.cut(P.x,P.y+1,P.z); Sound.sfx(i%2?'swing':'hit'); yield wait(.06); }
  grade.uniforms.sat.value=sat; P.hp=P.maxHp; P.cineAnim='idle'; FX.ring(P.x,gy+.1,P.z,'#8affb0',3,.5); FX.burst(P.x,gy+1,P.z,40,0x8affb0,5,.3); Sound.sfx('heart'); FX.flash=.4; grade.uniforms.flashCol.value.set(.5,1,.6);
  Game.dmgNums.push({x:P.x,y:P.y+2.8,z:P.z,n:'FULL HP · ALI '+(3-n)+' LEFT',t:0,big:true,col:'#8affb0'});
  cineSet(P.x+1.4,gy+1.5,P.z+3.6,P.x,gy+1.3,P.z);
  if(n===1) twBark('shayan',"Did you just heal me... with a SWORD?!",true); else if(n===2) twBark('shayan',"That is NOT how medicine works!",true); else twBark('shayan',"...I'm not even gonna ask.",true);
  yield wait(1.3); P.cineFly=false; P.cineAnim=null; A.hold=0; A.face=null; Cam.cine=null; Game.letterTo=0; P.inv=1.5; }
