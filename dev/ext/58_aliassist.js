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
const TW_ALI_CUT=.33, TW_ALI_SAVE=.4, TW_ALI_STUN=1.5; // Ali cuts a cuttable duo move this often; saves you from a grab this often (dgAliRoll); his kick stuns that twin this long
// he cuts at least once per phase: once 3 moves of a phase have gone by without a cut, the next cuttable move is his
function twAliCutRoll(F){ const ph=F.phase||1; F.mvN=F.mvN||{}; F.cutN=F.cutN||{}; F.mvN[ph]=(F.mvN[ph]||0)+1; return Math.random()<TW_ALI_CUT||(!F.cutN[ph]&&F.mvN[ph]>=3); }
// at the start of every duo move
function twDuo3Roll(F,k,mid){ const A=twAliAI(); if(!twAliReady(A)||F.lc) return;
  if(Math.random()<.25) F.guard={mid,n:0};
  const who=DUO3_RANGED[k]; if(who&&twAliCutRoll(F)) F.kick={mid,who,at:Game.time+rnd(.9,1.3)}; }
function twDuo3Assist(F,dt,play){ if(!play) return; const A=twAliAI();
  if(F.revQ&&!Game.script&&Game.state==='play'){ const n=F.revQ; F.revQ=0; run(function*(){ yield* twAliRevive(F,n); }); return; }
  const K=F.kick; if(K&&Game.time>=K.at){ F.kick=null; if(K.mid===F.mid&&F.busy&&!F.lc&&!F.grabbed&&twAliReady(A)&&(F.C.gen||F.O.gen)) twAliKick(F,A,K); } }

// ---------- the kick ----------
function twAliKick(F,A,K){ F.cutN=F.cutN||{}; F.cutN[F.phase||1]=1; const T=K.who==='caotan'?F.C:F.O, o=T===F.C?F.O:F.C, mid=K.mid, gy=groundY(T.x,T.z);
  // the move stops dead
  F.C.gen=null; F.O.gen=null; for(const X of [F.C,F.O]){ X.state='idle'; X.lockF=0; X.swing=0; X.cast=0; X.fire=0; X.heartEyes=0; if(X.hide){ X.hide=0; } X.hy=1.3; } TW.sentence=null; TW.caoSafe=null;
  aliGhost(A.x,A.y,A.z); const side=A.x<T.x?-1:1; A.x=T.x+side*.9; A.z=T.z+.3; A.f=-side; A.flash=.2; Sound.sfx('dash'); Sound.sfx('secret'); FX.burst(A.x,A.y+1,A.z,24,0xb0182a,5,.35);
  Game.slowT=Math.max(Game.slowT,.4); FX.hitstop=Math.max(FX.hitstop,.1);
  // every bolt and hazard of that move gets cut
  const cuts=[]; for(const b of BOLTS){ if(b.dead||b.friendly||b.mid!==mid) continue; b.dead=1; cuts.push([b.x,b.y,b.z]); }
  for(const h of TW.hz.slice()){ if(h.mid!==mid) continue; if(h._x!=null) cuts.push([h._x,groundY(h._x,h._z)+1,h._z]); try{ h.kill&&h.kill(); }catch(e){} const i=TW.hz.indexOf(h); if(i>=0) TW.hz.splice(i,1); }
  const seq={t:0,n:0}; Game.fxUpd.push(dt=>{ seq.t+=dt; while(seq.n<Math.min(cuts.length,16)&&seq.t>seq.n*.035){ const [x,y,z]=cuts[seq.n++]; twTinyJC(x,y,z,90); FX.cut(x,y,z); FX.burst(x,y,z,10,0xff2a3a,4,.25); if(seq.n%2) Sound.sfx('swing'); } return seq.n<Math.min(cuts.length,16); });
  // the kick: down he goes
  T.down=1; T.stun=Math.max(T.stun,TW_ALI_STUN); T.state='stun'; T.aliSaveT=Game.time+TW_ALI_STUN; /* only this twin; the 'Ali saved you' face over it meanwhile */ T.flash=.4; T.mv=null; Sound.sfx('punch'); Sound.sfx('crash'); shake(.7); impactFrame([[2,1],[1,1]]); FX.ring(T.x,gy+.1,T.z,'#ff3a4a',3,.45); FX.burst(T.x,gy+.4,T.z,40,0xd8c0c8,6,.4,false);
  Game.dmgNums.push({x:T.x,y:gy+3.4,z:T.z,n:'KICKED DOWN',t:0,big:true,col:'#ff6a7a'}); TW._ally=1; try{ twHurt(T,3,'ally'); } finally{ TW._ally=0; }
  o.state='idle';
  twBark('ali',"ISSEN!",true); /* every interrupt */
  const up={t:0}; twHz({upd(dt){ up.t+=dt; if(up.t>.7&&!up.said){ up.said=1; if(T.who==='caotan') twBark('caotan',"He kicked me! In the GLASSES! Those were PRESCRIPTION!",true); else twBark('omar',"I have been... grounded. Like when I was fourteen.",true); } if(up.t>=TW_ALI_STUN){ T.down=0; return false; } return true; }, kill(){ T.down=0; }}); }

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

// ---------- 'Ali saved you': Ali's own pixel head (his straw hat and face, from his sheet) in black and red, over the twin he just kicked ----------
function twAliSaveIcon(){ if(TWT_ALIFACE) return TWT_ALIFACE;
  if(typeof ALS!=='undefined'&&ALS.ok&&ALS.img&&ALS.img.width){ try{ const X=27,Y=16,W=43,H=18, /* the straw hat and face, above the shoulders */ cv=document.createElement('canvas'); cv.width=W+2; cv.height=H+2; const c=cv.getContext('2d');
      c.drawImage(ALS.img,X,Y,W,H,1,1,W,H); const id=c.getImageData(0,0,W+2,H+2), d=id.data, a0=new Uint8Array((W+2)*(H+2));
      for(let i=0;i<a0.length;i++){ const j=i*4; if(d[j+3]<40){ d[j+3]=0; continue; } a0[i]=1; const l=(d[j]*.3+d[j+1]*.59+d[j+2]*.11)/255;
        const col=l<.16?[0,0,0]:l<.34?[90,0,10]:l<.55?[192,16,32]:[255,70,70]; d[j]=col[0]; d[j+1]=col[1]; d[j+2]=col[2]; d[j+3]=255; }
      for(let y=0;y<H+2;y++) for(let x=0;x<W+2;x++){ const i=y*(W+2)+x; if(a0[i]) continue; if((x>0&&a0[i-1])||(x<W+1&&a0[i+1])||(y>0&&a0[i-W-2])||(y<H+1&&a0[i+W+2])){ const j=i*4; d[j]=d[j+1]=d[j+2]=0; d[j+3]=255; } } /* black outline */
      c.putImageData(id,0,0); return TWT_ALIFACE=cv; }catch(e){} }
  // until his sheet has loaded: a plain red face in a hat
  const cv=document.createElement('canvas'); cv.width=cv.height=24; const c=cv.getContext('2d'), P=(x,y,w,h,k)=>{ c.fillStyle=k; c.fillRect(x,y,w,h); };
  P(1,7,22,4,'#000'); P(6,1,12,8,'#000'); P(3,9,18,14,'#000'); P(5,22,14,2,'#000'); P(2,8,20,2,'#7a0a12'); P(7,2,10,6,'#9a1018'); P(4,10,16,12,'#e0202c'); P(8,13,2,3,'#000'); P(14,13,2,3,'#000'); P(9,18,6,2,'#000');
  return cv; }
let TWT_ALIFACE=null;
function drawAliSaves(){ const F=TW.fight; if(!F||F.kind!=='duo'||Game.state!=='play') return;
  for(const T of [F.C,F.O]){ if(!T||T.gone||!(T.aliSaveT>Game.time)) continue; const q=toScreen(T.x,T.y+3.7*(T.scale||1),T.z); if(!(q[2]<1)) continue;
    const left=T.aliSaveT-Game.time, k=Math.min(1,(TW_ALI_STUN-left)/.15), ic=twAliSaveIcon(), w=Math.round(2*ic.width*(.6+.4*k)), h=Math.round(w*ic.height/ic.width), bob=Math.sin(Game.time*6)*3;
    D.save(); D.imageSmoothingEnabled=false; D.globalAlpha=left<.3?left/.3:1; D.drawImage(ic,Math.round(q[0]-w/2),Math.round(q[1]-h+bob),w,h); D.restore(); } }
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ drawAliSaves(); }catch(e){ console.error('ali save icon',e); } }; })();
