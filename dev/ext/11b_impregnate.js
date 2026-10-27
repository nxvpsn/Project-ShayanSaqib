// =====================================================================
// CAOTAN: IMPREGNATE (solo, phases I-III). A womb (pink line drawing) flashes over your head, then he fires a pink smiley sperm at you,
// twice as fast as his goo. Hit it (any swing) and it's smacked into the ground half a screen away, dormant, under "BURN IT!":
// burn it down: 10 hits (slashes, fireballs of any size, Getsugas; one each) and it ignites,
// writhes and dies. Left alone for 12s it wriggles back up and comes at you again. If it reaches you: IMPREGNATED?! You go down and a goo clone of you pops out (11c_gooclone.js).
// =====================================================================
const IMP={hp:10, speed:22, tell:.9, dormant:12, list:[], womb:null};
// the pink sperm: the goo sperm's shape, pink, bigger head with a smiley face; 4 tail frames
const IMP_TEX=[];
function impTex(f){ if(IMP_TEX[f]) return IMP_TEX[f]; const W=64, H=24, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d');
  try{ c.lineCap='round'; const pts=[]; for(let i=0;i<=16;i++){ const u=i/16; pts.push([44-u*42,H/2+Math.sin(u*8.5-f*1.5708)*u*5.5]); }
    for(const [w,col] of [[6,'#7a1a44'],[3.4,'#ff8ac8']]) for(let i=0;i<16;i++){ c.strokeStyle=col; c.lineWidth=Math.max(1,w*(1-i/16*.75)); c.beginPath(); c.moveTo(pts[i][0],pts[i][1]); c.lineTo(pts[i+1][0],pts[i+1][1]); c.stroke(); }
    const el=(x,y,rx,ry,col)=>{ c.fillStyle=col; c.beginPath(); c.ellipse(x,y,rx,ry,0,0,7); c.fill(); };
    el(51,H/2,12,9.5,'#7a1a44'); el(51,H/2,10.4,8,'#ff8ac8'); el(49,H/2+3,7,3,'#e86aa8'); el(54,H/2-3.6,3,1.8,'#ffd6ec');
    c.fillStyle='#2a0618'; c.fillRect(48,H/2-3,2,3); c.fillRect(54,H/2-3,2,3); /* eyes */
    c.strokeStyle='#2a0618'; c.lineWidth=1.4; c.beginPath(); c.arc(52,H/2+1,3.6,.25,Math.PI-.25); c.stroke(); /* the smile */ }catch(e){}
  const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.encoding=THREE.sRGBEncoding; return IMP_TEX[f]=t; }
// the move
TWK.caotan.impregnate=function*(T,ph){ const sp=twSp(T); twBark('caotan',"Impregnate! ...Wait, that came out wrong. FIRE!",true);
  T.cast=1; T.heartEyes=1; IMP.womb={t:0,dur:IMP.tell/sp}; Sound.sfx('doki'); Sound.sfx('charge'); yield IMP.tell/sp;
  T.cast=0; T.heartEyes=0; const S=impLaunch(T); Sound.sfx('whoosh'); Sound.sfx('squelch');
  for(let w=0;w<3&&S.st==='fly'&&!S.dead;w+=.05) yield .05; yield .4; };
for(const k of [1,2,3]) if(TWPOOL.caotan[k]&&!TWPOOL.caotan[k].includes('impregnate')) TWPOOL.caotan[k].push('impregnate');
// one sperm: fly (homing a little) -> smacked (an arc half a screen away) -> dormant (BURN IT!) -> burning -> gone; or it gets you
function impLaunch(T){ const P=Player, gy=groundY(T.x,T.z), s=new THREE.Sprite(new THREE.SpriteMaterial({map:impTex(0),transparent:true,alphaTest:.1,depthWrite:false,fog:false}));
  s.scale.set(1.9,1.9*24/64,1); s.renderOrder=6; s.userData.tw=1; scene.add(s);
  const a=Math.atan2(P.z-T.z,P.x-T.x), S={st:'fly',s,x:T.x+Math.cos(a)*.8,y:gy+1.1,z:T.z+Math.sin(a)*.8,vx:Math.cos(a)*IMP.speed,vz:Math.sin(a)*IMP.speed,hp:IMP.hp,t:0,f:0,ft:0,rot:0,trav:0,dead:false};
  IMP.list.push(S);
  twHz({upd(dt,play){ try{ if(play) impUpd(S,dt); }catch(e){ console.error('impregnate',e); S.dead=true; } if(S.dead){ scene.remove(s); IMP.list.splice(IMP.list.indexOf(S),1); return false; } return true; },
    kill(){ scene.remove(s); const i=IMP.list.indexOf(S); if(i>=0) IMP.list.splice(i,1); IMP.womb=null; }});
  return S; }
function impSwinging(){ const P=Player; return !!(P.atk&&P.atk.t<.22)||!!(P.aliAtk&&P.aliAtk.t<.22)||(P.atkGrace||0)>0; }
function impUpd(S,dt){ const P=Player, s=S.s; S.t+=dt; S.ft+=dt;
  const face=()=>{ const a=toScreen(S.x,S.y,S.z), b=toScreen(S.x+S.vx*.05,S.y,S.z+S.vz*.05), dx=b[0]-a[0], dy=b[1]-a[1]; if(dx*dx+dy*dy>.01) S.rot=Math.atan2(-dy,dx); };
  if(S.ft>(S.st==='burn'?.03:.055)){ S.ft=0; S.f=(S.f+1)%4; s.material.map=impTex(S.f); }
  if(S.st==='fly'){ const sp=Math.hypot(S.vx,S.vz), cur=Math.atan2(S.vz,S.vx); let d=Math.atan2(P.z-S.z,P.x-S.x)-cur; while(d>Math.PI) d-=6.283; while(d<-Math.PI) d+=6.283;
      const ad=Math.abs(d), close=Math.hypot(P.x-S.x,P.z-S.z)<3.5&&ad<2, tr=close?99:ad>Math.PI/2?5:2.8, na=cur+clamp(d,-tr*dt,tr*dt), v=IMP.speed*(ad>Math.PI/3&&!close?.45:1); /* homes in; dodge through it and it brakes, loops back round and comes again */ S.vx=Math.cos(na)*v; S.vz=Math.sin(na)*v; S.x+=S.vx*dt; S.z+=S.vz*dt; { const q=twClampXZ(S.x,S.z,.8); S.x=q.x; S.z=q.z; } S.trav+=sp*dt; S.y=lerp(S.y,P.y+1.1,Math.min(1,dt*6)); face();
      if(Math.random()<.6) FX.spawn(S.x,S.y,S.z,0,.2,0,.25,0xff8ac8,.22,0,true);
      const d2=Math.hypot(P.x-S.x,P.z-S.z);
      if(d2<2.1&&impSwinging()){ impSmack(S); return; }
      if(d2<.9&&Math.abs(P.y+1-S.y)<1.6&&!(P.inv>0)&&!(P.dash>0)&&!IMP.down&&!IMP.clone){ S.dead=true; impDown(); return; }
    }
  else if(S.st==='smack'){ S.k+=dt/.5; const u=Math.min(1,S.k); S.x=lerp(S.sx,S.tx,u); S.z=lerp(S.sz,S.tz,u); S.y=lerp(S.sy,groundY(S.tx,S.tz)+.25,u)+Math.sin(u*Math.PI)*2.6; S.rot+=dt*26;
      if(u>=1){ S.st='dormant'; S.t=0; S.rot=0; S.lastSw=Player.swingT||0; S.wasSw=impSwinging(); Sound.sfx('slam'); shake(.35); FX.burst(S.x,S.y,S.z,18,0xff8ac8,4,.3); FX.ring(S.x,S.y-.2,S.z,'#ff8ac8',1.6,.3); } }
  else if(S.st==='dormant'){ S.rot=Math.sin(S.t*9)*.12; impBurnHits(S);
      if(S.hp<=1e-6){ S.st='burn'; S.t=0; Sound.sfx('fire'); Sound.sfx('bigfire'); twBark('caotan',"NOOO! He had a NAME! It was Caotan Junior!",true); return; }
      if(S.t>IMP.dormant){ S.st='fly'; S.trav=0; S.hp=IMP.hp; const a=Math.atan2(P.z-S.z,P.x-S.x); S.vx=Math.cos(a)*IMP.speed; S.vz=Math.sin(a)*IMP.speed; S.y=groundY(S.x,S.z)+1.1; IMP.womb={t:0,dur:.6};
        twBark('caotan',"He's ALIVE! Go, Junior! Find your father's senpai!",true); Sound.sfx('squelch'); } }
  else if(S.st==='burn'){ const k=Math.min(1,S.t/1.2); S.rot=Math.sin(S.t*38)*(.6*(1-k)+.1); s.material.color.setRGB(1-.75*k,1-.9*k,1-.9*k); s.scale.set(Math.max(.05,1.9*(1-k*.7)),Math.max(.02,1.9*24/64*(1-k*.7)),1);
      for(let i=0;i<3;i++) FX.spawn(S.x+rnd(-.6,.6),S.y+rnd(0,.3),S.z+rnd(-.2,.2),rnd(-.3,.3),rnd(1.5,3.5),0,rnd(.3,.6),[0xff7a1a,0xffc03a,0xff3a1a][i],rnd(.2,.38),-1,true);
      if(k>=1){ FX.burst(S.x,S.y+.3,S.z,22,0x2a2a2a,4,.4,false); FX.burst(S.x,S.y+.3,S.z,12,0xff7a1a,3,.3); Sound.sfx('crash'); S.dead=true; return; } }
  s.position.set(S.x,S.y,S.z); s.material.rotation=S.rot; }
function impSmack(S){ const P=Player, a=P.ang||Math.atan2(S.z-P.z,S.x-P.x), q=twClampXZ(P.x+Math.cos(a)*12,P.z+Math.sin(a)*12,1.2);
  S.st='smack'; S.k=0; S.sx=S.x; S.sy=S.y; S.sz=S.z; S.tx=q.x; S.tz=q.z; Sound.sfx('punch'); Sound.sfx('parry'); FX.hitstop=Math.max(FX.hitstop,.08); FX.spark(S.x,S.y,S.z); shake(.3);
  Game.dmgNums.push({x:S.x,y:S.y+1,z:S.z,n:'SMACKED',t:0,big:true,col:'#ffd0ec'}); twBark('caotan',"My son! You hit my SON!",true); }
// fireballs (and Ali's Getsugas) on the dormant sperm
// every hit is one pip of ten: a slash, a fireball (any size) or a Getsuga
function impBurnHits(S){ const gy=S.y, P=Player;
  for(const f of TW.fb||[]){ if(f.hit.has(S)||f.life<=0) continue; if(Math.hypot(f.x-S.x,f.z-S.z)<f.r+.7&&Math.abs(f.y-gy)<1.6){ f.hit.add(S); S.hp-=1; twFireballHit(f,f.x,f.y,f.z); if(!f.big) f.life=0; S.flash=.1; } }
  for(const b of BEAMS||[]){ if(!b||b.dead||!b.hit||b.hit.has(S)) continue; if(Math.hypot(b.x-S.x,b.z-S.z)<1.4){ b.hit.add(S); S.hp-=1; FX.burst(S.x,S.y+.3,S.z,10,0xff3a2a,3,.25); Sound.sfx('hit'); } }
  const sw=impSwinging(), st=(P.swingT||0)!==S.lastSw||(sw&&!S.wasSw); S.lastSw=P.swingT||0; S.wasSw=sw;
  if(st){ const d=Math.hypot(S.x-P.x,S.z-P.z), big=!!(P.atk&&P.atk.big); if(d<(big?7:2.4)&&Math.abs(P.y-gy)<2.2&&(d<1||angDiff(Math.atan2(S.z-P.z,S.x-P.x),P.ang||0)<1.4)){
      S.hp-=1; S.flash=.1; Sound.sfx('hit'); FX.burst(S.x,S.y+.3,S.z,12,0xff8ac8,4,.25); FX.spark(S.x,S.y+.3,S.z); shake(.12); } } }
// the womb over your head (a flashing pink line drawing) and BURN IT! over a dormant sperm
function impDrawWomb(cx,cy,s,al){ D.save(); D.globalAlpha=al; D.lineJoin='round'; D.lineCap='round';
  const path=()=>{ D.beginPath(); // the body (an upturned pear), the cervix, the tubes curling out to the ovaries
    D.moveTo(cx-s*.42,cy-s*.32); D.bezierCurveTo(cx-s*.46,cy+s*.12,cx-s*.18,cy+s*.3,cx-s*.1,cy+s*.42); D.lineTo(cx-s*.1,cy+s*.62); D.moveTo(cx+s*.1,cy+s*.62); D.lineTo(cx+s*.1,cy+s*.42);
    D.bezierCurveTo(cx+s*.18,cy+s*.3,cx+s*.46,cy+s*.12,cx+s*.42,cy-s*.32); D.quadraticCurveTo(cx,cy-s*.12,cx-s*.42,cy-s*.32);
    D.moveTo(cx-s*.42,cy-s*.32); D.bezierCurveTo(cx-s*.62,cy-s*.5,cx-s*.86,cy-s*.42,cx-s*.84,cy-s*.12); D.moveTo(cx+s*.42,cy-s*.32); D.bezierCurveTo(cx+s*.62,cy-s*.5,cx+s*.86,cy-s*.42,cx+s*.84,cy-s*.12);
    D.moveTo(cx-s*.84+s*.11,cy-s*.04); D.ellipse(cx-s*.84,cy-s*.04,s*.11,s*.08,0,0,7); D.moveTo(cx+s*.84+s*.11,cy-s*.04); D.ellipse(cx+s*.84,cy-s*.04,s*.11,s*.08,0,0,7); };
  path(); D.strokeStyle='#2a0618'; D.lineWidth=7; D.stroke(); path(); D.strokeStyle='#ff6ab0'; D.lineWidth=3.5; D.shadowColor='#ff6ab0'; D.shadowBlur=14; D.stroke(); D.restore(); }
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ if(Game.state!=='play') return; const P=Player, W=IMP.womb;
    if(W){ W.t+=1/60; if(W.t>W.dur+.15) IMP.womb=null; else { const q=toScreen(P.x,P.y+3.4,P.z); if(q[2]<1){ const al=.55+.45*Math.abs(Math.sin(W.t*Math.PI*3.4)); impDrawWomb(q[0],q[1]-20,46,al); } } }
    for(const S of IMP.list){ if(S.st!=='dormant') continue; const q=toScreen(S.x,S.y+1.5,S.z); if(!(q[2]<1)) continue; const pu=1+.08*Math.sin(Game.time*10);
      D.save(); D.translate(q[0],q[1]); D.scale(pu,pu); uText('BURN IT!',0,0,`900 22px ${FB}`,'#ff7a1a','center'); D.restore();
      const n=10, k=Math.max(0,S.hp/IMP.hp); for(let i=0;i<n;i++){ D.fillStyle=i<Math.ceil(k*n)?'#ff8ac8':'rgba(255,255,255,.18)'; D.fillRect(q[0]-n*5+i*10,q[1]+8,8,6); } } }catch(e){ console.error('impregnate ui',e); } }; })();
