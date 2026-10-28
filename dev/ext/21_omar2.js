// =====================================================================
// OMAR, REWORKED: Shadow Step Execution (front cut, back cut; parry both = stun)
// =====================================================================
TWK.omar.blinkcut=function*(T,ph){ const sp=twSp(T); twBark('omar',ph>=2?"Front. Back. Grave.":"I am in front of you. I am behind you. I am... everywhere you regret.",true);
  twComboStart(T,2); const tf=.44/sp, tb=.36/sp; let from=Game.time+TW_STRICT.grace;
  FX.burst(T.x,T.y+1.4,T.z,22,0x140a1a,4,.45,false); T.hide=1; Sound.sfx('dash'); yield .22;
  twBlinkTo(T,'front',1.6,0x140a1a); T.hide=0; T.scythe=1; T.swing=0; let P=Player, a=Math.atan2(P.z-T.z,P.x-T.x); T.lockF=1; T.f=Math.cos(a)>0?1:-1;
  FX.line(T.x,T.z,a,2.9,2.6,0xb06aff,tf); Sound.sfx('charge'); yield tf; twStrictDo(from,()=>twSlash(T,3,2.9,{col:'#b06aff'})); from=Game.time+TW_STRICT.grace; yield .42;
  FX.burst(T.x,T.y+1.4,T.z,22,0x140a1a,4,.45,false); T.hide=1; T.swing=0; Sound.sfx('dash'); yield .16/sp;
  twBlinkTo(T,'back',1.6,0x140a1a); T.hide=0; P=Player; a=Math.atan2(P.z-T.z,P.x-T.x); T.f=Math.cos(a)>0?1:-1; twBark('omar',"Behind you.",true);
  FX.line(T.x,T.z,a,2.9,2.6,0xb06aff,tb); yield tb; twStrictDo(from,()=>twSlash(T,3,2.9,{col:'#b06aff'})); yield .35;
  T.scythe=0; T.swing=0; T.lockF=0;
  if(twComboEnd(T,3.4)){ twBark('omar',"Both...? You read me like... a sad poem.",true); return; }
  yield .45; };
for(const k of [1,2,3]) TWPOOL.omar[k].push('blinkcut');

// =====================================================================
// SEKIRO STANCE (all phases): he auto-parries everything you throw at him. Three parries = FULLMOON COUNTER.
// =====================================================================
function twSekiroParry(T,src){ if((T.skCd||0)>Game.time) return; T.skCd=Game.time+.12; const P=Player, mx=lerp(T.x,P.x,.4), mz=lerp(T.z,P.z,.4); T.skN=(T.skN||0)+1; T.flash=.2;
  FX.hitstop=Math.max(FX.hitstop,.14); Game.slowT=Math.max(Game.slowT,.28); Sound.sfx('parry'); Sound.sfx('deflect'); shake(.45);
  for(let i=0;i<3;i++) FX.spark(mx,T.y+1.3,mz); FX.ring(T.x,groundY(T.x,T.z)+.1,T.z,'#b06aff',2.4,.35); FX.flash=.32; grade.uniforms.flashCol.value.set(1,1,1); impactFrame([[2,1]]);
  const need=T.skNeed||3; Game.dmgNums.push({x:T.x,y:T.y+3.2*(T.scale||1),z:T.z,n:'PARRIED '+Math.min(need,T.skN)+'/'+need,t:0,big:true,col:'#d0a0ff'});
  if(src==='melee'){ const a=Math.atan2(P.z-T.z,P.x-T.x); P.vx+=Math.cos(a)*5; P.vz+=Math.sin(a)*5; } }
(function(){ const th=twHurt; twHurt=function(T,d,src){ if(T&&T.who==='omar'&&T.sekiroT>Game.time&&T.state==='atk'&&T.last==='sekiro'&&T.hp>0&&!TW._ally&&!['ally','ff','test','soul'].includes(src)){ twSekiroParry(T,src); return false; } /* freed Harvest souls never feed his Fullmoon Counter */ return th.apply(this,arguments); }; })();
function texBlackCrescent(){ if(TW._bcTex) return TW._bcTex; const S=256, cv=document.createElement('canvas'); cv.width=cv.height=S; const c=cv.getContext('2d');
  const shape=()=>{ c.beginPath(); c.arc(S/2,S/2,104,0,7); c.arc(S/2+46,S/2-30,92,0,7,true); };
  c.save(); c.shadowColor='rgba(140,60,230,.9)'; c.shadowBlur=8; c.fillStyle='#8a3aff'; shape(); c.fill('evenodd'); c.restore(); /* black, with a thin purple outline */
  c.fillStyle='#050208'; c.beginPath(); c.arc(S/2,S/2,100,0,7); c.arc(S/2+46,S/2-30,94,0,7,true); c.fill('evenodd');
  const t=new THREE.CanvasTexture(cv); TW._bcTex=t; return t; }
TWK.omar.sekiro=function*(T,ph){ twBark('omar',"I am Sekiro.",true); Sound.sfx('gong'); const dur=ph>=3?4.2:3.6, need=ph>=3?2:3; T.skN=0; T.skNeed=need; T.sekiroT=Game.time+dur; T.scythe=1; T.swing=0; T.cast=0; T.mv=null;
  twBig('PARRY STANCE',{size:46,col:'#c08aff',y:UH*.24,dur:1.5,sub:'Every hit is parried. '+(need===2?'Two':'Three')+' parries and he counters.'});
  const m=twBB(texBlackCrescent(),2.6,2.6,{add:false}), g=twGlow(0x6a1aff,4); m.userData.tw=1;
  twHz({upd(dt){ const on=T.sekiroT>Game.time&&T.state==='atk'&&T.last==='sekiro'&&!T.gone; m.visible=g.visible=on; m.position.set(T.x,T.y+2.2*(T.scale||1),T.z-.3); m.rotation.z=Math.sin(Game.time*2)*.2; g.position.copy(m.position); g.material.opacity=.45+.25*Math.sin(Game.time*8);
      if(on&&Math.random()<.6) FX.spawn(T.x+rnd(-1,1),T.y+rnd(.2,2.6),T.z,0,rnd(.4,1.2),0,.5,Math.random()<.5?0x8a3aff:0x140a1a,.3,0,true); return on; }, kill(){ scene.remove(m); scene.remove(g); }});
  let t=0; while(t<dur&&(T.skN||0)<need&&T.hp>0){ yield .05; t+=.05; }
  const n=T.skN||0; T.sekiroT=0; T.skN=0; T.scythe=0;
  if(n<need){ twBark('omar',"...Nobody swung. The stance is very lonely.",true); yield .6; return; }
  yield* twFullmoonCounter(T); };
// lock the player with dark magic, then a Getsuga three times the size of the player's
function* twFullmoonCounter(T){ const P=Player; twBark('omar',"Fullmoon Counter!",true); twCutin('omar','FULLMOON COUNTER','Sekiro Stance  ·  Parried one time too many','#3a0a6a',1.4); Sound.sfx('void'); Sound.sfx('charge');
  const lock={x:P.x,z:P.z,done:false,t:0}; Game.dmgNums.push({x:P.x,y:P.y+2.6,z:P.z,n:'BOUND BY DARKNESS',t:0,big:true,col:'#b06aff'});
  TW.bound=1; twHz({upd(dt){ lock.t+=dt; const P2=Player; if(lock.done||lock.t>5){ TW.bound=0; return false; } P2.x=lock.x; P2.z=lock.z; P2.vx=P2.vz=0; P2.dash=0; P2.dashCd=Math.max(P2.dashCd||0,.4);
      if(Math.random()<.9){ const a=rnd(0,6.28); FX.spawn(lock.x+Math.cos(a)*1.1,P2.y+rnd(0,2),lock.z+Math.sin(a)*1.1,-Math.cos(a)*1.5,rnd(-.5,.5),-Math.sin(a)*1.5,.4,a<3?0x8a3aff:0x0a0410,.3,0,a<3); } return true; }, kill(){ TW.bound=0; }});
  FX.ring(lock.x,groundY(lock.x,lock.z)+.1,lock.z,'#8a3aff',1.4,1.2); T.lockF=1; T.scythe=1; T.swing=0; T.cast=1;
  twBig('BRACE YOURSELF',{size:56,col:'#d0a0ff',y:UH*.3,dur:1.2,sub:'Bound by darkness: you cannot move or attack.'}); yield 1.1;
  const a=Math.atan2(lock.z-T.z,lock.x-T.x), s=3.6*3, g=new THREE.Group();
  const mA=new THREE.Mesh(new THREE.PlaneGeometry(s,s),new THREE.MeshBasicMaterial({map:CRESC,color:0x9a4aff,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false,blending:THREE.AdditiveBlending}));
  const mD=new THREE.Mesh(new THREE.PlaneGeometry(s*.82,s*.82),new THREE.MeshBasicMaterial({map:CRESC,color:0x05010a,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false})); mD.position.z=.02;
  const mB=mA.clone(); mB.rotation.y=Math.PI/2; mB.scale.set(.75,1,1); const gl=new THREE.Mesh(new THREE.PlaneGeometry(s*1.6,s*1.6),new THREE.MeshBasicMaterial({map:GLOW,color:0x6a1aff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); gl.rotation.x=TILT;
  g.add(mA,mD,mB,gl); g.rotation.y=-a; g.userData.tw=1; scene.add(g); twGetsugaSkin(g,GS*3,'getsuga_omar'); T.swing=1; Sound.sfx('beam'); Sound.sfx('crossboom'); shake(.8); FX.flash=.35; grade.uniforms.flashCol.value.set(.6,.3,1);
  const b={x:T.x+Math.cos(a)*1.2,z:T.z+Math.sin(a)*1.2,t:0,hit:false}; const sp=16, life=Math.hypot(lock.x-b.x,lock.z-b.z)/sp+.9;
  twHz({upd(dt,play){ if(play) b.t+=dt; b.x+=Math.cos(a)*sp*dt; b.z+=Math.sin(a)*sp*dt; const gy=groundY(b.x,b.z); g.position.set(b.x,gy+2.6,b.z); const k=Math.min(1,(life-b.t)*3); [mA,mB,mD,gl].forEach(o=>o.material.opacity=Math.max(0,k));
      for(let i=0;i<5;i++) FX.spawn(b.x+rnd(-1,1),gy+rnd(.2,5),b.z+rnd(-1,1),-Math.cos(a)*3,rnd(-.5,.5),-Math.sin(a)*3,.45,i%2?0x8a3aff:0x0a0010,.45,0,i%2===1);
      const P2=Player; if(play&&!b.hit){ const px=P2.x-b.x, pz=P2.z-b.z, al=px*Math.cos(a)+pz*Math.sin(a), pe=Math.abs(px*Math.sin(a)-pz*Math.cos(a));
        if(al<1.4&&al>-2&&pe<3.2){ b.hit=true; lock.done=true; P2.inv=0; P2.dash=0; const r=twHitP(9,b.x,b.z,{ub:true,pierce:true});
          if(r==='hit'){ shake(1); FX.burst(P2.x,P2.y+1.2,P2.z,40,0x8a3aff,6,.4); } } }
      if(b.t>=life){ lock.done=true; return false; } return true; }, kill(){ scene.remove(g); lock.done=true; }});
  yield life+.2; T.lockF=0; T.scythe=0; T.swing=0; T.cast=0; yield .3; }
for(const k of [1,2,3]) TWPOOL.omar[k].push('sekiro');

// =====================================================================
// LIMIT CUT II (phase 3): BLACK CRESCENT
//   1) Moon match: Omar's moon turns red or dark purple (yours starts black); dye yours the same colour with his curving scythes before the meter runs out
//   2) Double flood: two 3.8s rounds back to back (OM_WAVE23), his moon flips colour in between; 2 extra wrong-colour scythes and a second right one in each. The Death Sentence loops the whole time
//      (the moon scythes stay on screen). Then the black crescent swallows the sky and the dark covers the screen
//   3) Iai in the dark: small glints preview a combo, the large glint fires it; slash the white beats, never the red. 15 parries -> Getsuga clash
// =====================================================================
// the two moon colours: red (w) and dark purple (p); no colour = the black base moon
const OM_WAVE23=3.8; // waves 2 and 3 of the moon match: the same length, the same scythes
const OM_MOON={w:'#ff2a3a',p:'#6a1fc8'}, OM_MOON_HEX={w:0xff2a3a,p:0x6a1fc8}, OM_MOON_FLASH={w:[1,.2,.25],p:[.45,.15,.85]};
TW_SFX.iaiReal=function(){ Sound.tone('square',3400,4600,.04,.07); Sound.tone('sine',5200,4900,.3,.08); Sound.tone('triangle',2600,2600,.18,.06); Sound.hiss(9000,.07,.12,'highpass'); };
TW_SFX.iaiFeint=function(){ Sound.hiss(500,.22,.12,'lowpass'); Sound.tone('sine',180,120,.2,.08); };
function twMoonIcon(col){ TW._mi=TW._mi||{}; const k=col||'none'; if(TW._mi[k]) return TW._mi[k]; const S=64, cv=document.createElement('canvas'); cv.width=cv.height=S; const c=cv.getContext('2d');
  c.shadowColor=col?OM_MOON[col]:'#8a3aff'; c.shadowBlur=12; c.fillStyle=col?OM_MOON[col]:'#0c0614'; c.beginPath(); c.arc(32,32,22,0,7); c.fill(); c.shadowBlur=0;
  c.globalCompositeOperation='destination-out'; c.beginPath(); c.arc(43,25,19,0,7); c.fill(); c.globalCompositeOperation='source-over';
  if(!col){ c.strokeStyle='#8a3aff'; c.lineWidth=1.5; c.beginPath(); c.arc(32,32,22,.55,4.1); c.stroke(); } TW._mi[k]=cv; return cv; }
function twDrawMoons(){ const M=TW.moon; if(!M||Game.state==='title') return; const T=M.T, P=Player, t=performance.now()/1000;
  if(T&&!T.hide){ const [x,y,z]=toScreen(T.x,T.y+3.4*(T.scale||1),T.z); if(z<1){ const s=1+(M.pulse>0?M.pulse*.5:0); D.drawImage(twMoonIcon(M.om),x-24*s,y-24*s,48*s,48*s); } }
  if(!P.hidden){ const [x,y,z]=toScreen(P.x,P.y+2.7,P.z); if(z<1) D.drawImage(twMoonIcon(M.pl),x-18,y-18,36,36); }
  if(T&&M.total>0&&!T.hide){ const [x,y,z]=toScreen(T.x,groundY(T.x,T.z),T.z); if(z<1){ const k=clamp(M.left/M.total,0,1), w=130, yy=y+18;
      D.fillStyle='rgba(8,4,14,.85)'; D.fillRect(x-w/2-3,yy-3,w+6,14); D.fillStyle=M.om?OM_MOON[M.om]:'#8a3aff'; if(k<.25&&Math.floor(t*10)%2) D.fillStyle='#ff3a4a'; D.fillRect(x-w/2,yy,w*k,8);
      D.font=`700 13px ${FB}`; D.textAlign='center'; D.fillStyle='#e8dcff'; D.fillText(M.left.toFixed(1)+'s',x,yy+24); D.textAlign='left'; } } }
function twGlintIcon(col){ TW._gi=TW._gi||{}; if(TW._gi[col]) return TW._gi[col]; const S=96, cv=document.createElement('canvas'); cv.width=cv.height=S; const c=cv.getContext('2d');
  c.shadowColor=col; c.shadowBlur=22; c.fillStyle=col; c.beginPath(); c.arc(48,48,30,0,7); c.fill(); c.shadowBlur=0; c.globalCompositeOperation='destination-out'; c.beginPath(); c.arc(62,38,27,0,7); c.fill();
  c.globalCompositeOperation='source-over'; TW._gi[col]=cv; return cv; }
function twDrawIai(){ const I=TW.iai; if(!I) return; const P=Player, g=I.prev;
  if(g){ const age=Game.time-g.t0, life=g.L?.55:.42; if(age>=0&&age<life){ const [px,py,pz]=toScreen(P.x,P.y+1.2,P.z); if(pz<1){ const x=clamp(px+Math.cos(g.a)*UW*.25,110,UW-110), y=clamp(py+Math.sin(g.a)*UH*.3,110,UH-110), col=g.real?'#ffffff':'#ff2a3a';
        const k=age<.06?age/.06:Math.max(0,1-(age-life*.55)/(life*.45)), base=g.L?220:95, s=base*(age<.06?1.4-age/.06*.4:1); D.save(); D.globalAlpha=k*(g.L?1:.8); D.drawImage(twGlintIcon(col),x-s/2,y-s/2,s,s); if(g.L){ D.globalCompositeOperation='lighter'; D.drawImage(twGlintIcon(col),x-s/2,y-s/2,s,s); D.globalCompositeOperation='source-over'; }
        D.globalAlpha=k*.6; D.strokeStyle=col; D.lineWidth=g.L?4:2; D.beginPath(); D.arc(x,y,s*.55+age*(g.L?160:60),0,7); D.stroke();
        if(g.L){ D.globalAlpha=k; D.lineWidth=3; for(let i=0;i<8;i++){ const a=i*Math.PI/4+age*3, r1=s*.28, r2=s*(i%2?.7:1); D.beginPath(); D.moveTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1); D.lineTo(x+Math.cos(a)*r2,y+Math.sin(a)*r2); D.stroke(); } }
        D.restore(); } } }
  D.save(); D.font=`900 20px ${FB}`; D.textAlign='center'; D.fillStyle='#e8dcff'; D.fillText('PARRIES  '+I.par+' / '+I.need,UW/2,UH-90); D.restore(); }
function twDrawMash(){ const M=TW.mash; if(!M||!M.omarClash) return; const w=420, x=UW/2-w/2, y=UH*.7, k=(M.v+1)/2; D.save();
  D.fillStyle='rgba(8,4,14,.85)'; D.fillRect(x-4,y-4,w+8,26); D.fillStyle='#6ac8ff'; D.fillRect(x,y,w*k,18); D.fillStyle='#a04aff'; D.fillRect(x+w*k,y,w*(1-k),18); D.fillStyle='#fff'; D.fillRect(x+w*k-2,y-6,4,30);
  D.font=`900 26px ${FB}`; D.textAlign='center'; D.fillStyle=Math.floor(performance.now()/120)%2?'#ffffff':'#ffd45a'; D.fillText('MASH ATTACK!',UW/2,y-16); D.restore(); }
// these overlays only exist while Omar is inside this limit cut
function twOmarLCLive(){ return !!TW.fight&&TW.foes.some(T=>T.who==='omar'&&T.state==='lc'&&T.hp>0); }
function twOmarLCClear(){ TW.moon=null; TW.iai=null; TW.blackout=null; if(TW.mash&&TW.mash.omarClash) TW.mash=null; }
(function(){ const dh=drawHUD; drawHUD=function(){ dh(); if(!twOmarLCLive()){ if(TW.moon||TW.iai||(TW.mash&&TW.mash.omarClash)) twOmarLCClear(); return; } try{ twDrawMoons(); twDrawIai(); twDrawMash(); twDrawBlackout(); }catch(e){ console.error('omarLC',e); } }; })();
// count attack presses for the Iai, with the direction of the swing (mouse aim, else movement, else facing)
function twSwingDir(){ const a=typeof twAimAng==='function'?twAimAng():null; if(a!=null) return a; const [mx,mz]=inputVec(); if(mx||mz) return Math.atan2(mz,mx); return Player.ang||0; }
(function(){ const pr=press; press=function(a){ if(a==='attack'&&!held[a]&&TW.iai) TW.iai.presses.push({t:Game.time,a:twSwingDir()}); return pr(a); }; })();
function twDarkTo(k,r){ if(!TW.dark) TW.dark={k:0,r:r||200,eyes:[]}; if(!TW.hz.includes(TW._darkHz)){ TW._darkHz=twHz({upd(dt){ const K=TW.dark; if(!K) return false; K.k=lerp(K.k,K.want,Math.min(1,dt*2.5)); if(K.want<=0&&K.k<.03){ TW.dark=null; return false; } return true; }}); }
  TW.dark.want=k; if(r) TW.dark.r=r; }
// one curving scythe of colour col: it sweeps out to one side, then curls in on you. Parried or not, its colour dyes your moon.
// the part of the arena the camera shows: moon scythes never leave it, so the one you need is always reachable
function twViewBox(){ const B=twBounds(), x=Cam.look.x, z=Cam.look.z; return {x0:Math.max(B.x0+.5,x-8.5),x1:Math.min(B.x1-.5,x+8.5),z0:Math.max(B.z0+.5,z-5),z1:Math.min(B.z1-.5,z+3.5)}; }
// a solid pixel crescent (outline a darker shade of its own colour, shaded body, bright inner edge) instead of a glow, plus a shadow + coloured ring on the ground,
// so you can see which colour it is, that it spins, and where it is in depth
function twMoonTex(col){ TW._mt=TW._mt||{}; if(TW._mt[col]) return TW._mt[col]; const S=48, cv=document.createElement('canvas'); cv.width=cv.height=S; const c=cv.getContext('2d');
  const pal=col==='w'?['#8a1424','#c01c2c','#ff2a3a','#ffb0b8']:['#2e0c5c','#4a14a0','#6a1fc8','#b07aff'];
  try{ const id=c.getImageData(0,0,S,S), d=id.data; if(d&&d.length===S*S*4){ const R=S*.44, cx=S/2, cy=S/2, ox=S*.2, r2=R*.86;
      for(let y=0;y<S;y++) for(let x=0;x<S;x++){ const a=Math.hypot(x+.5-cx,y+.5-cy), b=Math.hypot(x+.5-cx+ox,y+.5-cy); let k=-1;
        if(a<=R&&b>=r2){ const e=Math.min(R-a,b-r2); k=e<1.6?0:e<3?1:(b-r2<5)?3:2; } else if(a<=R+1.6&&b>=r2-1.6) k=0;
        if(k>=0){ const h=pal[k], i=(y*S+x)*4; d[i]=parseInt(h.slice(1,3),16); d[i+1]=parseInt(h.slice(3,5),16); d[i+2]=parseInt(h.slice(5,7),16); d[i+3]=255; } }
      c.putImageData(id,0,0); } }catch(e){}
  const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.encoding=THREE.sRGBEncoding; return TW._mt[col]=t; }
function twMoonShadow(col){ const g=new THREE.Group(), sh=new THREE.Mesh(new THREE.CircleGeometry(.5,20),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.45,depthWrite:false,fog:false})),
    rg=new THREE.Mesh(new THREE.RingGeometry(.54,.65,28),new THREE.MeshBasicMaterial({color:OM_MOON_HEX[col],transparent:true,opacity:.7,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  sh.rotation.x=rg.rotation.x=-Math.PI/2; g.add(sh,rg); g.userData.tw=1; scene.add(g); return g; }
// moon scythes of opposite colours never run into each other: their centres stay OM_MOON_GAP apart (touch radius 1 each,
// so their hitboxes never overlap); same-colour ones pass through each other as before
const OM_MOON_SLOW=.75, OM_MOON_HIT=1.6, OM_MOON_REACH=2.6; /* touching one (body) / swinging at one (sword reach) dyes your moon */ /* moon scythes fly 25% slower (curve and swirl) */
const OM_MOON_GAP=2.2; /* a little over 2: they settle a hair inside it, still clear of touching */
function twMoonSep(s,x,z){ let ax=0, az=0; for(const o of (TW._moonS||[])){ if(o===s||o.done||o.px==null||o.col===s.col) continue; const dx=x-o.px, dz=z-o.pz, d=Math.hypot(dx,dz);
    if(d<OM_MOON_GAP){ const a=d>1e-3?Math.atan2(dz,dx):s.turn*9, k=(OM_MOON_GAP-d)/2; ax+=Math.cos(a)*k; az+=Math.sin(a)*k; twMoonClink(s,o,x,z,Math.cos(a),Math.sin(a)); } } /* each moves half, so both together make the full gap */
  return [ax,az]; }
// when they meet they bounce off each other with a spark (no sound) (at most every .5s per moon)
function twMoonClink(s,o,x,z,nx,nz){ const t=Game.time; if((s.clinkT||0)>t||(o.clinkT||0)>t) return; s.clinkT=o.clinkT=t+.5;
  const mx=(x+o.px)/2, mz=(z+o.pz)/2, my=groundY(mx,mz)+1.2; FX.spark(mx,my,mz); /* silent: no clink */ FX.burst(mx,my,mz,8,OM_MOON_HEX[s.col],4,.2); FX.burst(mx,my,mz,8,OM_MOON_HEX[o.col],4,.2);
  for(const [q,k] of [[s,1],[o,-1]]){ const dot=q.vx*nx*k+q.vz*nz*k; if(dot<0){ q.vx-=2*dot*nx*k; q.vz-=2*dot*nz*k; } /* swirling: its heading bounces off */
    q.ox=(q.ox||0)+nx*k*.6; q.oz=(q.oz||0)+nz*k*.6; } } /* curving: a little knock off its path, which fades */
function twMoonScythe(T,col,side,dur){ dur/=OM_MOON_SLOW; const m=twBB(twMoonTex(col),1.5,1.5,{ro:6}), g=twMoonShadow(col); m.userData.tw=1; const P=Player, V=twViewBox(), cl=(x,z)=>[clamp(x,V.x0,V.x1),clamp(z,V.z0,V.z1)];
  const a=Math.atan2(P.z-T.z,P.x-T.x), px=-Math.sin(a)*side, pz=Math.cos(a)*side, [x0,z0]=cl(T.x+px*1.2,T.z+pz*1.2), d=Math.hypot(P.x-T.x,P.z-T.z), [cx,cz]=cl((T.x+P.x)/2+px*Math.max(5,d*.7),(T.z+P.z)/2+pz*Math.max(5,d*.7));
  const s={col,t:0,done:false,ex:P.x,ez:P.z,px:x0,pz:z0,vx:0,vz:0,ox:0,oz:0,turn:(Math.random()<.5?1:-1)*rnd(.6,1.2)}; Sound.sfx('swing'); (TW._moonS=(TW._moonS||[]).filter(o=>!o.done&&o.t<4)).push(s);
  return twHz({upd(dt,play){ if(play) s.t+=dt; const P2=Player, u=Math.min(1,s.t/dur); if(u<.75){ s.ex=P2.x; s.ez=P2.z; }
      let x, z; if(u<1){ x=(1-u)*(1-u)*x0+2*(1-u)*u*cx+u*u*s.ex+s.ox; z=(1-u)*(1-u)*z0+2*(1-u)*u*cz+u*u*s.ez+s.oz; }
      else { // after its curve it keeps flying around inside the view: a slow swirl, bouncing off the edges of the screen
        const V2=twViewBox(), sp=9*OM_MOON_SLOW, k=play?dt:0; let a2=Math.atan2(s.vz,s.vx)+s.turn*k; s.vx=Math.cos(a2)*sp; s.vz=Math.sin(a2)*sp; x=s.px+s.vx*k; z=s.pz+s.vz*k;
        if(x<V2.x0){ x=V2.x0; s.vx=Math.abs(s.vx); } if(x>V2.x1){ x=V2.x1; s.vx=-Math.abs(s.vx); } if(z<V2.z0){ z=V2.z0; s.vz=Math.abs(s.vz); } if(z>V2.z1){ z=V2.z1; s.vz=-Math.abs(s.vz); } }
      if(play) try{ const [ax,az]=twMoonSep(s,x,z), V3=twViewBox(); s.ox=(s.ox+ax)*Math.max(0,1-dt*.6); s.oz=(s.oz+az)*Math.max(0,1-dt*.6); /* the push fades once they are clear */
        x=clamp(x+ax,V3.x0,V3.x1); z=clamp(z+az,V3.z0,V3.z1); }catch(e){ console.error('moon gap',e); }
      if(u<1&&play&&dt>0){ s.vx=(x-s.px)/dt; s.vz=(z-s.pz)/dt; }
      s.px=x; s.pz=z; const gy=groundY(x,z); m.position.set(x,gy+1.2,z); m.rotation.z+=dt*14; g.position.set(x,gy+.05,z);
      if(s.t>=3&&!s.done){ s.done=true; Sound.sfx('crossboom'); shake(.25); FX.burst(x,gy+1.2,z,30,OM_MOON_HEX[col],6,.35); FX.ring(x,gy+.1,z,OM_MOON[col],2.2,.35); if(play&&twInR(x,z,1.6,2.4)) twHitP(2,x,z,{ub:true}); return false; }
      if(Math.random()<.8) FX.spawn(x,gy+1.2,z,0,.3,0,.35,OM_MOON_HEX[col],.25,0,true);
      const dP=Math.hypot(P2.x-x,P2.z-z), swung=Game.time-twParryClock()<.15; /* easier to catch: a bigger body hitbox, and a swing reaches them */
      if(play&&!s.done&&P2.y<gy+2&&(dP<OM_MOON_HIT||(swung&&dP<OM_MOON_REACH))){ const r=dP<OM_MOON_HIT?twHitP(2,x,z,{melee:true,pierce:true,noGuard:true,win:.3}):(twMeleeParry(x,z,{}),'parry');
        if(r==='parry'||r==='hit'){ s.done=true; const M=TW.moon; if(M&&M.pl!==col){ M.pl=col; Game.dmgNums.push({x:P2.x,y:P2.y+3,z:P2.z,n:col==='w'?'RED MOON':'DARK PURPLE MOON',t:0,big:true,col:OM_MOON[col]}); }
          FX.burst(x,gy+1.2,z,24,OM_MOON_HEX[col],5,.3); return false; } }
      return true; }, kill(){ scene.remove(m); scene.remove(g); }}); }
// a barrage: one of each colour, left and right, arriving half a second apart so you can pick one
function twMoonBarrage(T,dur){ const L=Math.random()<.5?'w':'p', R=L==='w'?'p':'w'; twMoonScythe(T,L,1,dur); twMoonScythe(T,R,-1,dur+.55); }
// the whole-map flood: the ground flashes in his colour; wrong moon = dead
function* twMoonFlood(T){ const M=TW.moon, P=Player, c=twCenter(), gy=groundY(c.x,c.z); M.left=0; FX.flash=.9; grade.uniforms.flashCol.value.set(...OM_MOON_FLASH[M.om]);
  Sound.sfx('crossboom'); Sound.sfx('skyopen'); shake(1.3); impactFrame([[1,2],[2,2],[3,1]]); for(let k=0;k<5;k++) FX.ring(c.x,gy+.1,c.z,OM_MOON[M.om],5+k*4,.5+k*.1);
  for(let i=0;i<60;i++) FX.spawn(c.x+rnd(-12,12),gy+.2,c.z+rnd(-9,9),0,rnd(4,10),0,.6,OM_MOON_HEX[M.om],.4,6,true);
  if(M.pl===M.om){ Game.dmgNums.push({x:P.x,y:P.y+3.2,z:P.z,n:'MOON MATCHED',t:0,big:true,col:OM_MOON[M.om]}); return true; }
  twBig('WRONG MOON',{size:60,col:'#ff4a5a',dur:1.2}); twBark('omar',"Wrong moon. Wrong life choices.",true); P.inv=0; P.dash=0; hurtPlayer(99,c.x,c.z); return false; }
// extra scythes of the WRONG colour, spread through a round (waves 2 and 3): dodge them, take only the right one
function twMoonWrongs(T,n,t0){ const M=TW.moon, wrong=M.om==='w'?'p':'w'; for(let i=0;i<n;i++){ const at=t0+.35*i, side=i%2?1:-1, dur=rnd(1.1,1.5), k={t:0};
    twHz({upd(dt,play){ if(play) k.t+=dt; if(k.t>=at&&!k.done){ k.done=1; if(TW.moon) twMoonScythe(T,wrong,side,dur); } return !k.done; }}); } }
// a second scythe of the RIGHT colour later in the round (wave 2): a second chance
function twMoonRight(T,at){ const k={t:0}; twHz({upd(dt,play){ if(play) k.t+=dt; if(k.t>=at&&!k.done){ k.done=1; const M=TW.moon; if(M) twMoonScythe(T,M.om,Math.random()<.5?1:-1,1.25); } return !k.done; }}); }
function* twMoonRound(T,dur,salvos,wrongs,rights){ const M=TW.moon; M.om=Math.random()<.5?'w':'p'; M.left=M.total=dur; M.pulse=1; Sound.sfx('gong'); FX.flash=.3; grade.uniforms.flashCol.value.set(...OM_MOON_FLASH[M.om]);
  twBig(M.om==='w'?'HIS MOON IS RED':'HIS MOON IS DARK PURPLE',{size:48,col:OM_MOON[M.om],y:UH*.24,dur:1.4,sub:'Parry the matching scythe'}); T.cast=.6; if(wrongs) twMoonWrongs(T,wrongs,.45); for(let i=0;i<(rights||0);i++) twMoonRight(T,1.3+i*.6);
  let t=0, i=0; while(t<dur){ if(i<salvos.length&&t>=salvos[i]){ T.cast=.6; twMoonBarrage(T,dur>=5?1.7:1.25); i++; } yield .05; t+=.05; M.left=Math.max(0,dur-t); M.pulse=Math.max(0,M.pulse-.05*3); }
  return yield* twMoonFlood(T); }
// the Death Sentence on a loop for the whole moon phase: two hovering scythes, 3-2-1, drop, drop, again
function twSentenceLoop(){ const L={t:0,stop:false,hs:null,n:4,d1:0,d2:0}; twHz({upd(dt,play){ if(L.stop){ TW.sentence=null; return false; } if(!play) return true; L.t+=dt;
    if(!L.hs){ L.hs=[twHoverScythe(),twHoverScythe()]; L.t=0; L.n=4; L.d1=L.d2=0; }
    const n=L.t<.95?3:L.t<1.9?2:L.t<2.85?1:0; if(n!==L.n){ L.n=n; TW.sentence={n,pulse:1}; Sound.sfx(n?'tick':'gong'); }
    if(L.t>=2.85&&!L.d1){ L.d1=1; L.hs[0].drop(); } if(L.t>=3.45&&!L.d2){ L.d2=1; L.hs[1].drop(); } if(L.t>=4.35){ L.hs=null; TW.sentence=null; } return true; },
    kill(){ TW.sentence=null; }}); return L; }
// after the floods: the dark pours out of the giant crescent over the whole screen
function twDrawBlackout(){ const B=TW.blackout; if(!B) return; D.save(); D.globalAlpha=B.a; D.fillStyle='#000'; D.beginPath(); D.arc(B.x,B.y,Math.max(0,B.r),0,7); D.fill(); D.restore(); }
// Iai: Omar previews a combo with glints in the 4 directions around you (N/S/E/W), then plays it back in the dark.
// Small glint = part of the combo (nothing fires yet). Large glint = the combo fires: after it, Omar strikes every beat again,
// same directions, same rhythm, with only a tick for each beat. Slash toward the WHITE beats; never swing on a RED one.
// Combos always end on a large white glint; a large red glint only ever appears on its own.
const IAI_DIR={E:0,SE:1,S:2,SW:3,W:4,NW:5,N:6,NE:7};
// each pattern is a list of combos; each beat is [colour w/r, direction]. The last beat of a combo is the large glint.
// every beat is IAI_GAP apart, in the preview and in the playback: one steady rhythm, at most 5 glints, never two reds in a row, only N/S/E/W
const IAI_GAP=.5;
const IAI_PAT=[
  {name:'Opening',c:[[['w','N']],[['w','S']]]},
  {name:'Lone Feint',c:[[['r','E']],[['w','W']]]},
  {name:'Echo',c:[[['w','E'],['w','E'],['w','W']]]},
  {name:'Clock',c:[[['w','N'],['w','E'],['w','S'],['w','W']]]},
  {name:'Hesitation',c:[[['w','S'],['r','N'],['w','N'],['w','S']]]},
  {name:'Zigzag',c:[[['w','W'],['w','E'],['w','W'],['w','E']]]},
  {name:'Cross',c:[[['w','N'],['w','S'],['w','E'],['w','W']]]},
  {name:'Double Feint',c:[[['w','E'],['r','W'],['w','W'],['r','E'],['w','E']]]},
  {name:'Hammer',c:[[['w','N'],['w','N'],['w','S'],['w','S']]]},
  {name:'Requiem',c:[[['w','S'],['r','N'],['w','N'],['w','E'],['w','W']]]}];
// opening order: 1, 2, 3 or 4, 5 or 6, then 7-10 at random until the parries run out. Every pattern is randomly rotated (90° steps) and mirrored.
function twIaiQueue(){ const q=[0,1,Math.random()<.5?2:3,Math.random()<.5?4:5]; let last=-1; for(let i=0;i<12;i++){ let k; do k=6+Math.floor(Math.random()*4); while(k===last); q.push(k); last=k; } return q; }
function twIaiBeats(pat){ const rot=Math.floor(Math.random()*4)*2, mir=Math.random()<.5;
  return pat.c.map(cb=>cb.map(([c,d],i)=>{ let k=IAI_DIR[d]; if(mir) k=(12-k)%8; k=(k+rot)%8; return {real:c==='w',a:k*Math.PI/4,gap:IAI_GAP,L:i===cb.length-1}; })); }
TW_SFX.iaiSmall=function(){ Sound.tone('sine',4200,4400,.12,.04); Sound.tone('triangle',2800,2900,.08,.03); };
TW_SFX.iaiSmallRed=function(){ Sound.tone('sine',900,800,.12,.04); Sound.hiss(700,.08,.05,'lowpass'); };
TW_SFX.iaiLarge=function(){ Sound.tone('sawtooth',220,160,.5,.07); Sound.tone('sine',1800,2400,.35,.06); Sound.hiss(6000,.25,.1,'highpass'); };
TW_SFX.iaiTick=function(){ Sound.tone('square',1600,1500,.05,.05); };
function* twOmarIai(T){ TW.iaiCk=1; const P=Player; TW.moon=null; TW.hg=null; twDarkTo(.985,70); T.hide=1; T.scythe=1; Game.letterTo=.45;
  twBark('omar',"Small glints, remember them. The big one is when I strike. White, cut. Red, don't you dare.",true);
  twBig('IAI IN THE DARK',{size:54,col:'#e8dcff',y:UH*.26,dur:3.4,sub:'Small glints: remember them. Large glint: he strikes the whole combo. Slash the WHITE beats, never swing on RED.'}); yield 3.6;
  const I=TW.iai={presses:[],par:0,need:15,cur:null,prev:null}; let dead=false;
  const appear=(a,real)=>{ const x=P.x+Math.cos(a)*1.4, z=P.z+Math.sin(a)*1.4; T.x=x; T.z=z; T.y=groundY(x,z)+T.hy; T.hide=0; T.lockF=1; T.f=P.x<x?-1:1; T.swing=real?1:0; T.flash=real?0:.4;
    FX.burst(x,T.y+1.4,z,18,real?0x140a1a:0xff2a3a,4,.3,!real); Sound.sfx('dash'); const h={t:0}; twHz({upd(dt){ h.t+=dt; if(h.t>.22){ FX.burst(T.x,T.y+1.4,T.z,14,0x140a1a,3,.3,false); T.hide=1; T.swing=0; return false; } return true; }}); };
  const kill=(x,z)=>{ dead=true; FX.flash=.8; grade.uniforms.flashCol.value.set(1,.1,.15); Sound.sfx('crossboom'); twBig('COUNTERED',{size:64,col:'#ff2a3a',dur:1.2,sub:'You swung on a red moon'}); twBark('omar',"A feint. You bit. You died. Classic.",true); P.inv=0; P.dash=0; hurtPlayer(99,x,z); };
  const parry=b=>{ I.par++; FX.hitstop=Math.max(FX.hitstop,.14); Game.slowT=Math.max(Game.slowT,.2); Sound.sfx('parry'); Sound.sfx('deflect'); shake(.45); FX.spark(P.x+Math.cos(b.a)*.7,P.y+1.2,P.z+Math.sin(b.a)*.7); FX.ring(P.x,P.y+.1,P.z,'#ffffff',1.6,.25);
    FX.flash=.35; grade.uniforms.flashCol.value.set(1,1,1); impactFrame([[2,1]]); Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'PARRY '+Math.min(I.need,I.par)+'/'+I.need,t:0,big:true,col:'#ffffff'}); };
  const queue=twIaiQueue(); let qi=0, first=true;
  while(I.par<I.need&&!(dead&&!TW.god)){
    const combos=twIaiBeats(IAI_PAT[queue[Math.min(qi++,queue.length-1)]]); if(qi>=queue.length){ queue.push(...twIaiQueue().slice(4)); }
    for(const cb of combos){ if(I.par>=I.need||(dead&&!TW.god)) break;
      yield first?.5:rnd(1,1.4); first=false;
      // 1) the preview: the glints, nothing strikes yet (swings here are ignored)
      for(const b of cb){ I.prev={a:b.a,real:b.real,L:b.L,t0:Game.time}; Sound.sfx(b.L?(b.real?'iaiReal':'iaiFeint'):(b.real?'iaiSmall':'iaiSmallRed')); if(b.L) Sound.sfx('iaiLarge');
        FX.flash=Math.max(FX.flash,b.L?(b.real?.2:.12):.06); grade.uniforms.flashCol.value.set(...(b.real?[1,1,1]:[1,.2,.25])); yield IAI_GAP; }
      // 2) the playback: every beat again, same directions and rhythm, in the dark
      const base=Game.time; let bt=0, prevEnd=-9; const ev=[];
      cb.forEach((b,i)=>{ const at=base+bt; b.at=at; b.open=Math.max(at-(b.real?.3:.2),prevEnd+.01); b.end=at+(b.real?.12:.25); prevEnd=b.end; bt+=b.gap;
        ev.push({t:b.open,f:()=>{ I.cur={a:b.a,real:b.real,t0:b.open,sT:at}; Sound.sfx('iaiTick'); }},{t:at,f:()=>appear(b.a,b.real)},{t:b.end,f:()=>{
          const ps=I.presses.filter(q=>!q.used&&q.t>=b.open&&q.t<=b.end);
          if(b.real){ const p=ps[0]; if(p) p.used=1; if(p&&angDiff(p.a,b.a)<.6) parry(b);
            else { Sound.sfx('swing'); FX.cut(P.x,P.y+1.2,P.z); Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:p?'WRONG WAY':'TOO LATE',t:0,col:'#ff6a7a'}); P.inv=0; P.dash=0; hurtPlayer(4,T.x,T.z); } }
          else if(ps.length){ ps.forEach(q=>q.used=1); kill(T.x,T.z); }
          if(I.cur&&I.cur.t0===b.open) I.cur=null; }}); });
      ev.sort((a,b)=>a.t-b.t); I.prev=null;
      while(ev.length){ while(ev.length&&ev[0].t<=Game.time&&I.par<I.need) ev.shift().f(); if(dead&&!TW.god){ TW.iai=null; return; } if(!ev.length||I.par>=I.need) break; yield .016; } // the last parry ends it at once, mid-combo
      I.cur=null; } }
  TW.iai=null; }
// the clash: two Getsuga crescents meet in the middle and grind; mash to push yours through
function twGetsugaMesh(s,col,dark,glowCol){ const g=new THREE.Group();
  const mA=new THREE.Mesh(new THREE.PlaneGeometry(s,s),new THREE.MeshBasicMaterial({map:CRESC,color:col,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false,blending:THREE.AdditiveBlending}));
  const mD=new THREE.Mesh(new THREE.PlaneGeometry(s*.8,s*.8),new THREE.MeshBasicMaterial({map:CRESC,color:dark,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false})); mD.position.z=.02;
  const mB=mA.clone(); mB.rotation.y=Math.PI/2; mB.scale.set(.75,1,1); const gl=new THREE.Mesh(new THREE.PlaneGeometry(s*1.7,s*1.7),new THREE.MeshBasicMaterial({map:GLOW,color:glowCol,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); gl.rotation.x=TILT;
  g.add(gl,mA,mD,mB); g.userData.tw=1; scene.add(g); return g; }
function* twOmarClash(T){ const P=Player, B=twBounds(); twDarkTo(0); TW.iai=null; T.hide=0; T.scythe=1; T.lockF=1; T.mv=null;
  const px=clamp(P.x,B.x0+2,B.x1-11), pz=P.z; Object.assign(P,{x:px,vx:0,vz:0,f:1,ang:0}); P.y=groundY(px,pz); T.x=px+10; T.z=pz; T.y=groundY(T.x,T.z)+T.hy; T.f=-1;
  const gy=groundY(px+5,pz), by=gy+1.5; FX.flash=1; grade.uniforms.flashCol.value.set(1,1,1); impactFrame([[1,2],[2,2]]); Sound.sfx('shatter');
  cineSet(px+5,gy+2.2,pz+11,px+5,gy+1.5,pz); twBark('omar',"GETSUGA... TENSHOU.",true); if(ALI()) twBark('ali',"Getsuga... Tenshou."); else twBark('shayan',"GETSUGA... TENSHOU!");
  T.cast=1; P.cineAnim='charge'; P.charge=2; Sound.sfx('charge'); yield .7; P.charge=0; P.cineAnim='beam';
  TW._gsc=2; const mine=ALI()?twGetsugaMesh(5.2,0xff2a3a,0x14020a,0xff1a2a):twGetsugaMesh(5.2,0xff3a5a,0x2a0010,0xff2040), his=twGetsugaMesh(5.6,0x9a4aff,0x05010a,0x6a1aff); TW._gsc=0; /* clash crescents: twice the normal size */
  mine.rotation.y=0; his.rotation.y=-Math.PI; Sound.sfx('beam'); Sound.sfx('crossboom'); shake(.8); FX.flash=.5; T.swing=1;
  const st={a:px+1,b:T.x-1,cx:px+5,t:0,ph:'fly',win:null}; Game.fxUpd.push(dt=>{ if(st.dead){ scene.remove(mine); scene.remove(his); return false; } st.t+=dt; const j=st.ph==='grind'?Math.sin(st.t*60)*.08:0;
    mine.position.set(st.a+j,by,pz); his.position.set(st.b-j,by,pz); const k=1+(st.ph==='grind'?Math.sin(st.t*40)*.05:0); mine.scale.setScalar(k); his.scale.setScalar(k*1.04);
    for(const [o,c] of [[st.a,0xff3a5a],[st.b,0x9a4aff]]) if(Math.random()<.7) FX.spawn(o+rnd(-.5,.5),by+rnd(-2,2),pz+rnd(-.5,.5),0,rnd(-.5,.5),0,.35,c,.35,0,true);
    if(st.ph==='grind'){ for(let i=0;i<4;i++) FX.spawn(st.cx,by+rnd(-2.2,2.2),pz+rnd(-.4,.4),rnd(-6,6),rnd(-3,5),rnd(-3,3),.45,[0xffffff,0xff3a5a,0x9a4aff,0xffd45a][i],.3,6,true); if(Math.random()<.08) FX.ring(st.cx,gy+.1,pz,Math.random()<.5?'#ff3a5a':'#9a4aff',3,.3); }
    return true; });
  // they fly at each other
  yield* (function*(){ const a0=st.a, b0=st.b; for(let t=0;t<.45;t+=1/30){ const u=t/.45; st.a=lerp(a0,st.cx-1.1,u); st.b=lerp(b0,st.cx+1.1,u); yield 1/30; } })();
  st.ph='grind'; twIceMelt(st.cx,pz,12,1.2); FX.flash=1; impactFrame([[1,2],[3,2]]); Sound.sfx('crossboom'); Sound.sfx('clash'); shake(1.4); FX.hitstop=.12;
  const M=TW.mash={v:0,n:0,t:0,dur:4.6,omarClash:1}; twClashWarp(st.cx,by,pz); hit.attack=false; const lo=px+2.6, hi=T.x-2.6;
  while(M.t<M.dur){ const dt=1/30; yield dt; M.t+=dt; const pushes=M.n; M.n=0; M.v=clamp(M.v+pushes*.09-dt*.25,-1,1); st.cx=lerp(st.cx,lerp(lo,hi,(M.v+1)/2),.25); st.a=st.cx-1.1; st.b=st.cx+1.1;
    P.vx=P.vz=0; if(pushes){ Sound.sfx('hit'); shake(.15); } if(Math.random()<.15) Sound.sfx('slam'); FX.flash=Math.max(FX.flash,.06); }
  const win=M.v>.15; TW.mash=null; hit.attack=false; st.ph='fly';
  // the winner's crescent bursts through the other and keeps going
  const loser=win?his:mine; for(let i=0;i<40;i++) FX.spawn(st.cx+rnd(-1,1),by+rnd(-2,2),pz,rnd(-8,8),rnd(-4,6),rnd(-3,3),.6,win?0x9a4aff:0xff3a5a,.4,8,true); loser.visible=false;
  Sound.sfx('shatter'); Sound.sfx('crossboom'); FX.flash=1; grade.uniforms.flashCol.value.set(1,1,1); impactFrame([[1,3],[2,2],[3,3]]); shake(1.6); FX.hitstop=.15;
  for(let t=0;t<.35;t+=1/30){ if(win) st.a=lerp(st.a,T.x,.3); else st.b=lerp(st.b,P.x,.3); yield 1/30; }
  st.dead=1; const hx=win?T.x:P.x; for(let i=0;i<5;i++) FX.ring(hx,gy+.3,pz,i%2?'#b06aff':'#ff3a5a',3+i*2.5,.5+i*.1); FX.burst(hx,by,pz,90,win?0xff3a5a:0x9a4aff,10,.5); FX.burst(hx,by,pz,50,0x1a0626,8,.5,false);
  P.cineAnim=null; Cam.cine=null;
  if(win){ twBig('CLASH WON',{size:58,col:'#9fd8ff',sub:'The black crescent shatters'}); twBark('omar',"My... my moon... it's full of holes...",true); T.hp=Math.max(1,T.hp-T.maxHp*.15); T.flash=.6; }
  else { twBig('CLASH LOST',{size:58,col:'#ff6a7a'}); twBark('omar',"Edge... wins... barely.",true); P.inv=0; hurtPlayer(3,T.x,T.z); }
  T.lockF=0; T.swing=0; T.cast=0; return win; }
TWK.omar.lc2=function*(T){ twLCPrep(T); const A=twLock(), c=twCenter(), gy0=groundY(c.x,c.z);
  if(TW.iaiCk){ Game.letterTo=.45; twBark('omar',"Again? Fine. The lights go out... again.",true); yield 1; }
  else { Game.letterTo=.45; twCutin('omar','BLACK CRESCENT','Limit Break  ·  Requiem of the Dark Moon','#1a0030',2.4); Sound.sfx('gong'); Sound.sfx('void');
    twBark('omar',"The moon I ate? It was only the appetizer. Behold... the BLACK CRESCENT.",true);
    yield twMoveTo(T,c.x,A.z0+2.5,.8); T.scythe=1;
    const moon=twBB(texBlackCrescent(),1,1), halo=twGlow(0x6a1aff,1); halo.visible=false; /* black, not a purple glow */ moon.userData.tw=1; moon.renderOrder=-1; const MN={s:.1,y:gy0+1};
    twHz({upd(dt){ moon.position.set(c.x,MN.y,A.z0-.5); moon.scale.set(MN.s,MN.s,1); halo.position.copy(moon.position); halo.scale.setScalar(MN.s*1.8); halo.material.opacity=.35+.15*Math.sin(Game.time*3); return !MN.gone; }, kill(){ scene.remove(moon); scene.remove(halo); }});
    cineSet(c.x,gy0+.8,A.z1+2,c.x,gy0+4.5,A.z0); const rise={k:0}; twHz({upd(dt){ rise.k=Math.min(1,rise.k+dt*.6); MN.s=.1+rise.k*9; MN.y=gy0+1+rise.k*6.5; return rise.k<1; }});
    grade.uniforms.tint.value.set(.75,.7,1.05); grade.uniforms.sat.value=.7; Sound.sfx('choir'); shake(.6); yield 1.8; impactFrame([[2,2],[1,2]]); FX.flash=.5; grade.uniforms.flashCol.value.set(.6,.3,1); yield .5; Cam.cine=null;
    // 1) moon match, 10 seconds, two barrages
    TW.moon={T,om:null,pl:null,left:0,total:0,pulse:0}; twBark('omar',"Your moon is black. Like your future. Paint it to match mine... or be erased.",true); const SL=twSentenceLoop(); yield 1.6;
    yield* twMoonRound(T,8,[.9,4.1]); yield 1.4;
    if(TW.moon.pl===TW.moon.om) twBark('omar',"...You matched. Like a couple's outfit. Disgusting.",true);
    // 2) double flood: 5 seconds, then his moon flips and it runs again at once
    TW.moon.pl=null; TW.moon.total=0; twBark('omar',"Double moon. Double flood. Double the edge.",true); yield 1.6;
    yield* twMoonRound(T,OM_WAVE23,[.15],1,1); /* one wrong-colour scythe (was 2) */ const prev=TW.moon.om; TW.moon.om=prev==='w'?'p':'w';
    { const M=TW.moon; M.left=M.total=OM_WAVE23; M.pulse=1; Sound.sfx('gong'); twBig(M.om==='w'?'NOW RED':'NOW DARK PURPLE',{size:52,col:OM_MOON[M.om],y:UH*.24,dur:1}); let t=0, fired=false;
      twMoonWrongs(T,1,.45); twMoonRight(T,1.3); while(t<OM_WAVE23){ if(!fired&&t>=.15){ fired=true; twMoonBarrage(T,1.25); } yield .05; t+=.05; M.left=Math.max(0,OM_WAVE23-t); M.pulse=Math.max(0,M.pulse-.15); } yield* twMoonFlood(T); }
    yield .8; SL.stop=true; TW.moon=null;
    // the black crescent swells over the sky, and the dark pours out of it over the whole screen: into the Iai
    twBark('omar',"Now my moon swallows the sky.",true); Sound.sfx('void'); Sound.sfx('drone'); cineSet(c.x,gy0+.8,A.z1+3,c.x,gy0+8,A.z0-3);
    { const g={k:0}; while(g.k<1){ g.k=Math.min(1,g.k+.016/1.4); const e=g.k*g.k*(3-2*g.k); MN.s=9+e*22; MN.y=gy0+7.5+e*5; shake(.15); yield .016; } }
    impactFrame([[2,2],[1,2]]); Sound.sfx('crossboom'); const B=TW.blackout={x:UW/2,y:UH*.3,r:0,a:1}, diag=Math.hypot(UW,UH);
    for(let t=0;t<1.1;t+=.016){ const [mx,my]=toScreen(c.x,MN.y,A.z0-.5); B.x=mx; B.y=my; B.r=diag*1.1*Math.pow(t/1.1,1.6); yield .016; }
    B.r=diag*1.2; twDarkTo(.985,70); TW.dark.k=.985; MN.gone=1; Cam.cine=null; yield .3;
    for(let t=0;t<.5;t+=.016){ B.a=1-t/.5; yield .016; } TW.blackout=null; }
  // 3) Iai in the dark, then the clash (retries start here)
  yield* twOmarIai(T); yield .3; const win=yield* twOmarClash(T); TW.iaiCk=0; yield 1.4;
  grade.uniforms.sat.value=1; applyLook(L.look); T.scythe=0; T.hide=0; Game.letterTo=0; T.inv=false; T.stun=2; T.state='stun'; T.lcDone[3]=1; yield T.stun; };
// dying in the Iai restarts phase III straight into the Iai; leaving the fight forgets it
(function(){ const ef=twEndFight; twEndFight=function(){ twOmarLCClear(); TW.iaiCk=0; TW.sentence=null; return ef.apply(this,arguments); };
  const wr=twWarpReset; twWarpReset=function(){ twOmarLCClear(); TW.iaiCk=0; return wr.apply(this,arguments); };
  const ng=newGame; newGame=function(){ twOmarLCClear(); TW.iaiCk=0; return ng.apply(this,arguments); };
  const tt=toTitle; toTitle=function(){ twOmarLCClear(); TW.iaiCk=0; return tt.apply(this,arguments); }; })();
(function(){ const sr=twSoloRestart; twSoloRestart=function(F,T){ TW.moon=null; TW.iai=null; TW.mash=null; sr(F,T); if(T.who==='omar'&&T.phase===3&&TW.iaiCk){ T.hp=T.maxHp/2; T.state='lc'; T.inv=true; T.gen=TWK.omar.lc2(T); T.wait=0; } };
  const ss=twStartSolo; twStartSolo=function(){ TW.iaiCk=0; TW.moon=null; TW.iai=null; return ss.apply(this,arguments); }; })();

// Omar's death-sentence counter must not outlive the attack: limit cuts and phase cutscenes interrupt it
(function(){ const lp=twLCPrep; twLCPrep=function(T){ TW.sentence=null; return lp.apply(this,arguments); };
  const pc=twPhaseCine; twPhaseCine=function*(F,T){ TW.sentence=null; yield* pc.apply(this,arguments); }; })();
// while bound by the Fullmoon Counter: no swings, no charging, no fireballs
TW.bound=0;
(function(){ const up=updatePlayer; updatePlayer=function(dt){ const P=Player; if(TW.bound){ hit.attack=false; hit.block=false; P.atk=null; P.charge=0; P.fbHolding=false; P.fbHold=0; }
    const r=up.apply(this,arguments); if(TW.bound){ P.atk=null; P.charge=0; P.fbHolding=false; } return r; };
  const cl=twOmarLCClear; twOmarLCClear=function(){ TW.bound=0; return cl.apply(this,arguments); };
  const sr=twSoloRestart; twSoloRestart=function(){ TW.bound=0; return sr.apply(this,arguments); }; })();
