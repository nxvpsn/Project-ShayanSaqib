// =====================================================================
// NATHAN vs COSMIC HAMZA, remade as a vertical bullet hell (Touhou style). The cutscenes are untouched.
// The camera rolls so world +x (toward Hamza) is screen-up and looks straight down the fight plane (z=0):
// field coords (u right, v up) map to world x=TH.CX+v, y=-u. Only the middle strip is the play field;
// the UI canvas covers the sides with Touhou-style panels (score, lives, drill, power, graze, boss info).
// Two phases, each a rotation of attack patterns (they yield seconds; no spell-card naming on screen), with piglets and eldritch minions.
// When a phase ends the camera zooms into Nathan and rolls back into the cutscene's first shot; the next
// phase starts with the reverse. Hits use a tiny hitbox (the dot); grazing fills the drill gauge.
// Controls: move, focus (hold magic: slow, tighter bits), shoot (hold attack;
// a full 1.5s charge fires a piercing blue Power Shot on release), special = Heavenly Drill (full gauge). No dash, no item drops.
// The right panel shows Nathan in his cockpit (thCockpit): he flinches when hit, it smokes at 3-4 hearts and burns at 1-2 (his face follows), it explodes when he dies. The bits turn red (and ding) when the Power Shot is charged; the shot also fires four red bit lasers (minions first).
// =====================================================================
function thFocusKeys(){ return K('block')+' or '+K('dash'); }
const TH={W:9,H:12,CX:-6,CZ:26,DZ:14,VH:8.6,HS:.42,HIT:.15,GRAZE:1.05,LIVES:5,FULL:1.5};
TH.K=TH.HS*TH.CZ/(TH.CZ+TH.DZ); // world size on Hamza's plane -> field size
function thOn(){ return !!(Game.mech&&Game.mech.th); }
function thW(u,v){ return [TH.CX+v,-u,0]; }
function thBossC(){ const T=Game.mech.th; return {u:T.sway,v:TH.VH}; }
function thEye(i){ const T=Game.mech.th; return {u:T.sway+i*4.2*TH.K,v:TH.VH+3.2*TH.K}; }
function thMouth(){ const T=Game.mech.th; return {u:T.sway,v:TH.VH-6.5*TH.K}; }
function thAim(u,v){ const N=NAT; return Math.atan2(N.tv-v,N.tu-u); }
function thB(u,v,a,sp,o){ const T=Game.mech&&Game.mech.th; if(!T||T.eb.length>1500) return null; const b=Object.assign({u,v,vu:Math.cos(a)*sp,vv:Math.sin(a)*sp,r:.26,col:0xff5a8a,t:0,x:0,y:0,z:0},o||{}); T.eb.push(b); return b; }
function thFx(u,v,n,col,sp,life){ FX.burst(TH.CX+v,-u,.4,n,col,sp,life||.3); }

// ---------- textures for the tiny things ----------
let TH_TEX=null;
function thTex(){ if(TH_TEX) return TH_TEX; const mk=(S,f)=>{ const [cv,c]=mkCanvas(S,S); f(c,S); const t=tex(cv); t.encoding=THREE.sRGBEncoding; t.magFilter=t.minFilter=THREE.NearestFilter; return t; };
  const mkBit=(body,hi,glow,gl)=>mk(16,(c)=>{ c.fillStyle='#0c1424'; c.fillRect(6,1,4,1); c.fillRect(5,2,6,9); c.fillRect(4,11,8,3); c.fillStyle=body; c.fillRect(6,2,4,9); c.fillStyle=hi; c.fillRect(6,3,1,7); c.fillStyle='#3a4670'; c.fillRect(5,11,6,2);
    c.fillStyle=glow; c.fillRect(7,0,2,2); c.fillStyle=gl; c.fillRect(7,0,1,1); c.fillStyle=glow; c.fillRect(6,13,4,2); });
  const bit=mkBit('#5d6f9e','#8fa0c8','#3ff4ff','#d8ffff'), bitR=mkBit('#c8303a','#ff8a8a','#ff2a2a','#ffd8d8'); /* red: the Power Shot is charged */
  const eld=(fr)=>mk(32,(c)=>{ c.strokeStyle='#1a0420'; c.lineWidth=3; for(let k=0;k<6;k++){ const a=Math.PI*.15+k*Math.PI*.14, w=Math.sin(fr*2+k)*3; c.beginPath(); c.moveTo(16,18); c.quadraticCurveTo(16+Math.cos(a)*10+w,18+Math.sin(a)*8,16+Math.cos(a)*14-w,18+Math.sin(a)*13); c.stroke(); }
    c.strokeStyle='#6a1a7a'; c.lineWidth=1.5; for(let k=0;k<6;k++){ const a=Math.PI*.15+k*Math.PI*.14, w=Math.sin(fr*2+k)*3; c.beginPath(); c.moveTo(16,18); c.quadraticCurveTo(16+Math.cos(a)*10+w,18+Math.sin(a)*8,16+Math.cos(a)*14-w,18+Math.sin(a)*13); c.stroke(); }
    c.fillStyle='#1a0420'; c.beginPath(); c.arc(16,14,11,0,7); c.fill(); c.fillStyle='#4a1050'; c.beginPath(); c.arc(16,14,9.5,0,7); c.fill(); c.fillStyle='#f4e8d8'; c.beginPath(); c.ellipse(16,14,7,5.5,0,0,7); c.fill();
    c.fillStyle='#ff2a4a'; c.beginPath(); c.arc(16+(fr?1:-1),14,3.4,0,7); c.fill(); c.fillStyle='#120008'; c.fillRect(15+(fr?1:-1),11,2,6); c.fillStyle='#fff'; c.fillRect(13,11,2,2); });
  TH_TEX={bit,bitR,eld:[eld(0),eld(1)]}; return TH_TEX; }
function thPlane(size,map){ const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({map,transparent:true,alphaTest:.4,depthWrite:false,fog:false})); m.renderOrder=6; m.rotation.z=-Math.PI/2; scene.add(m); return m; }

// ---------- setup / teardown ----------
function thClear(T){ if(!T) return; for(const m of T.mn) scene.remove(m.mesh); for(const b of T.bits) scene.remove(b.mesh); T.mn=[]; T.bits=[]; T.eb=[]; T.pb=[]; T.items=[]; if(T.drillD) T.drillD.dead=1; }
function thHzPose(k){ const v=L.vd; if(!v) return; const T=Game.mech&&Game.mech.th, sw=T?T.sway:0, f=(TH.CZ+TH.DZ)/TH.CZ;
  v.hz.position.set(lerp(14,TH.CX+TH.VH*f,k),lerp(1,-sw*f,k),-14); v.hz.rotation.set(0,0,-Math.PI/2*k); v.hz.scale.setScalar(lerp(1,TH.HS,k)); }
// touch: shooting and the Power Shot are automatic (the sword button is hidden), the shield button focuses
function thTouchButtons(on){ try{ const a=document.getElementById('tbAttack'), g=document.getElementById('tbGuard'); if(!a||!g||!a.dataset) return;
  if(on){ if(a.dataset.thOrig==null){ a.dataset.thOrig=a.innerHTML; a.dataset.thLab=a.getAttribute('aria-label')||''; } a.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/></svg>'; a.setAttribute('aria-label','Shoot (automatic)'); a.style.visibility='hidden';
    g.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>'; g.setAttribute('aria-label','Focus: hold to slow down'); }
  else if(a.dataset.thOrig!=null){ a.innerHTML=a.dataset.thOrig; a.setAttribute('aria-label',a.dataset.thLab); a.style.visibility=''; delete a.dataset.thOrig; } }catch(e){} }
function thSetup(ph,animate){ const G=Game.mech, N=NAT; if(!G||!N||!L.vd) return; thClear(G.th);
  const T=G.th={ph,t:0,eb:[],pb:[],mn:[],items:[],bits:[],sway:0,gen:null,wait:1.2,spell:null,si:-1,lives:TH.LIVES,score:G.thScore||0,power:2,graze:G.thGraze||0,
    fire:0,hold:0,pk:1,cam:null,panel:animate?0:1,ready:!animate,miss:0,spellMiss:0,bonus:null,tip:null,shield:0};
  const B=G.boss; if(B){ B.hp=B.maxHp=thPhaseHp(ph); B.vuln=true; } T.tick=0; T.pops=[]; T.finDone=0; T.finT=0;
  if(animate||!G.thCp||G.thCp.ph!==ph){ if(animate) G.thCp=null; } else if(B){ T.tick=G.thCp.tick; B.hp=thTickFloor(T,T.tick-1); T.fromCp=1; }
  N.tu=0; N.tv=-8; N.x=TH.CX+N.tv; N.y=-N.tu; N.vx=N.vy=0; N.qb=0; N.inv=animate?99:2; N.boostN=3; N.charge=N.shot=0; N.atk=null; N.pull=0; N.show=1; N.sp=Math.max(N.sp||0,100); /* one drill ready at the start of every phase */
  if(N.coreMk) N.coreMk.visible=false; if(N.coreRing) N.coreRing.visible=false;
  const TX=thTex(); for(let i=0;i<4;i++){ const mesh=thPlane(.75,TX.bit); T.bits.push({mesh,u:N.tu+(i-1.5)*1.6,v:N.tv-.6,tu:0,tv:0,cd:.4+i*.3,ang:Math.PI/2,i,wt:0}); }
  Game.mechTip=0; Game.hintT=0; G.busy=animate?1:0; thTouchButtons(true);
  if(animate){ thHzPose(0); const d=new THREE.Vector3(); camera.getWorldDirection(d); const p0=camera.position.clone(), l0=p0.clone().add(d.multiplyScalar(12)), up0=camera.up.clone(), [nx,ny]=thW(N.tu,N.tv);
    T.cam={t:0,keys:[{t:0,p:p0.toArray(),l:l0.toArray(),up:up0.toArray()},{t:.9,p:[nx-1.5,ny,10],l:[nx+.5,ny,0],up:[1,0,0]},{t:2,p:[TH.CX,0,TH.CZ],l:[TH.CX,0,0],up:[1,0,0]}],
      upd:(k)=>{ thHzPose(clamp((k-.9)/1.1,0,1)); T.pk=lerp(1,.26,clamp(k/1.4,0,1)); T.panel=clamp((k-1.2)/.8,0,1); },
      done:()=>{ T.cam=null; T.ready=true; G.busy=0; N.inv=1.5; Game.banner={name:'Phase '+['','I','II'][ph],sub:ph===1?'Gluttony':'The Devourer',t:0,small:1}; }}; }
  else { thHzPose(1); T.pk=.26; } }

// ---------- player ----------
function thPlayer(dt){ const N=NAT, G=Game.mech, T=G.th, ctl=Game.state==='play'&&!Game.dlg&&!G.busy&&T.ready&&!T.drill; N.t+=dt; N.inv=Math.max(0,N.inv-dt); N.flash=Math.max(0,N.flash-dt);
  let [ix,iz]=ctl?inputVec():[0,0]; const iv=-iz, foc=ctl&&!!(held.block||held.dash); T.focus=foc; /* focus: right click or Shift (dash is off here) */
  consume('dash'); /* no dash in the bullet hell */
  const sp=foc?4.8:11.5; let vu,vv; if(N.qb>0){ N.qb-=dt; vu=N.qbx*34; vv=N.qby*34; } else { vu=ix*sp; vv=iv*sp; }
  N.tu=clamp(N.tu+vu*dt,-TH.W+.45,TH.W-.45); N.tv=clamp(N.tv+vv*dt,-TH.H+.7,TH.VH-6.5*TH.K-2.2);
  [N.x,N.y]=thW(N.tu,N.tv);
  // shooting: hold to fire a needle stream; a full charge releases a Power Shot
  // (touch: both are automatic: the bits charge by themselves and fire the Power Shot a beat after they turn red)
  const tch=IS_TOUCH();
  if(ctl&&(held.attack||tch)){ T.fire-=dt; if(held.attack||tch){ const b=T.hold; T.hold+=dt; if(b<TH.FULL&&T.hold>=TH.FULL){ Sound.tone('sine',1568,1568,.3,.18); Sound.tone('sine',2349,2349,.5,.14,.08); for(const bt of T.bits) thFx(bt.u,bt.v,10,0xff3a3a,3,.25); thFx(N.tu,N.tv+.6,14,0xff8a8a,3,.25); } /* ding! the bits turn red */ }
    if(T.fire<=0){ T.fire=.07; const n=1+Math.floor(T.power), spread=foc?.08:.2; for(let k=0;k<=n;k++){ const o=(k-n/2); T.pb.push({u:N.tu+o*(foc?.18:.3),v:N.tv+.5,vu:o*spread*20,vv:46,r:.16,col:0x8ff8ff,dmg:.042,t:0}); } if(Math.random()<.4) Sound.sfx('mechshot'); } }
  if(tch){ if(!ctl) T.hold=0; else if(T.hold>=TH.FULL+.35){ thPowerShot(); T.hold=0; } }
  else if(!(ctl&&held.attack)){ if(T.hold>=TH.FULL&&ctl) thPowerShot(); T.hold=0; T.fire=0; }
  if(ctl&&consume('special')){ if(N.sp>=100) run(thDrill); else { Sound.sfx('block'); Game.dmgNums.push({x:N.x+1.5,y:N.y,z:0,n:'DRILL '+Math.floor(N.sp)+'%',t:0,col:'#8fc8ff'}); } }
  // engine sparks, behind him (screen-down)
  if(Math.random()<.7){ const [x,y]=thW(N.tu+rnd(-.12,.12),N.tv-.55); FX.spawn(x,y,.2,-rnd(4,8),rnd(-.5,.5),0,.18,Math.random()<.5?0x3ff4ff:0xbff8ff,rnd(.12,.22),0,true); } }
function thPowerShot(){ const N=NAT, T=Game.mech.th; T.pb.push({u:N.tu,v:N.tv+.8,vu:0,vv:30,r:.95,col:0x3a8aff,dmg:3.2,pierce:true,hit:new Set(),t:0,big:1});
  Sound.sfx('beam'); Sound.sfx('mechshot'); shake(.25); thFx(N.tu,N.tv+.8,30,0x3a8aff,7,.35); thFx(N.tu,N.tv+.8,16,0xffffff,5,.25); thBitLasers(); }
// the bits answer the Power Shot: a red line laser each, at the minions first (one each, nearest first), else at Hamza
function thBitLasers(){ const T=Game.mech.th, B=Game.mech.boss, C=thBossC(), live=T.mn.filter(m=>m.hp>0); Sound.sfx('beam');
  for(const b of T.bits){ let tg=null; if(live.length){ live.sort((p,q)=>Math.hypot(p.u-b.u,p.v-b.v)-Math.hypot(q.u-b.u,q.v-b.v)); tg=live.length>1?live.shift():live[0]; }
    const tu=tg?tg.u:C.u+rnd(-1.2,1.2), tv=tg?tg.v:C.v-1.2, [x0,y0]=thW(b.u,b.v), [x1,y1]=thW(tu,tv);
    thSpGain(1.1); if(tg){ tg.hp-=8; tg.flash=.1; T.score+=300; if(tg.hp<=0) thKill(tg); } else if(B){ const was=B.hp; mechDamage(1.1*(T.stun>0?1.5:1),x1,y1,0,false); if(B.hp<was) T.score+=Math.round((was-B.hp)*1000); }
    thFx(tu,tv,12,0xff3a3a,4,.25); thLine(x0,y0,x1,y1); } }
function thLine(x0,y0,x1,y1){ const len=Math.hypot(x1-x0,y1-y0), ms=[]; for(const [col,w] of [[0xff2a2a,.26],[0xffe0e0,.08]]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:col,transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending}));
    m.renderOrder=7; m.position.set((x0+x1)/2,(y0+y1)/2,.45); m.rotation.z=Math.atan2(y1-y0,x1-x0); m.scale.set(Math.max(.01,len),w,1); m.userData.temp=1; scene.add(m); ms.push(m); }
  const s={t:0}; Game.fxUpd.push(dt=>{ s.t+=dt; const k=Math.max(0,1-s.t/.3); ms.forEach(m=>{ m.material.opacity=k; m.scale.y=Math.max(.01,m.scale.y*(1-dt*2)); }); if(k<=0){ ms.forEach(m=>scene.remove(m)); return false; } return true; }); }
function thBits(dt){ const N=NAT, T=Game.mech.th, TX=thTex(); for(const b of T.bits){ b.wt-=dt;
    if(b.wt<=0){ /* focus no longer pulls them in: they keep their spread */ b.wt=rnd(.8,1.6); b.tu=clamp(N.tu+rnd(-6,6),-TH.W+.8,TH.W-.8); b.tv=clamp(rnd(-TH.H+1.5,-1.5),-TH.H+1,-1); }
    b.u=lerp(b.u,b.tu,Math.min(1,dt*2.2)); b.v=lerp(b.v,b.tv,Math.min(1,dt*2.2));
    // fire at the nearest minion, else at Hamza
    let tg=null,bd=1e9; for(const m of T.mn){ if(m.hp<=0) continue; const d=Math.hypot(m.u-b.u,m.v-b.v); if(d<bd){ bd=d; tg=m; } } const C=thBossC(), tu=tg?tg.u:C.u+rnd(-2,2), tv=tg?tg.v:C.v-1.5;
    const ta=Math.atan2(tv-b.v,tu-b.u); b.ang=ta; b.cd-=dt;
    if(T.ready&&!T.drill&&Game.state==='play'&&b.cd<=0){ b.cd=(T.focus?.55:1.05)+rnd(0,.4); T.pb.push({u:b.u,v:b.v,vu:Math.cos(ta)*38,vv:Math.sin(ta)*38,r:.2,col:0x3ff4ff,dmg:.1,t:0}); thFx(b.u,b.v,4,0x3ff4ff,2,.15); }
    const [x,y]=thW(b.u,b.v); b.mesh.position.set(x,y,.35); const dx=Math.sin(ta), dy=-Math.cos(ta); b.mesh.rotation.z=Math.atan2(-dx,dy); b.mesh.visible=!!N.show&&T.pk<.5; const want=T.hold>=TH.FULL&&!T.drill?TX.bitR:TX.bit; if(b.mesh.material.map!==want) b.mesh.material.map=want; } }
function thHurt(){ const N=NAT, G=Game.mech, T=G.th; if(N.inv>0||Game.state!=='play'||T.drill) return; T.miss++; T.spellMiss++;
  N.flash=.3; shake(.6); Sound.sfx('hurt'); Sound.sfx('crash'); thFx(N.tu,N.tv,40,0xff5a8a,8,.35); thFx(N.tu,N.tv,24,0xffffff,6,.3); FX.flash=.25; grade.uniforms.flashCol.value.set(1,.2,.3);
  // Touhou-style: losing a life clears the bullets around you
  for(const b of T.eb) if(Math.hypot(b.u-N.tu,b.v-N.tv)<5){ b.dead=1; thFx(b.u,b.v,2,0xffffff,1,.15); }
  if(!TW.god) T.lives--; N.inv=2.4; T.hitT=performance.now(); thGrunt(); if(T.lives<=2&&T.burnCd==null) T.burnCd=3.5; if(T.lives===2) thOp('low2'); else if(T.lives===1) thOp('low1'); else if(T.lives===0) thOp('last');
  if(T.lives<0){ T.lives=0; T.deadT=performance.now(); thFx(N.tu,N.tv,90,0x3ff4ff,12,.5); Sound.sfx('crossboom'); N.show=0; G.thScore=0; Game.onDeath(); }
  else if(Math.random()<.4) Voice.bark(Math.random()<.5?'nhurt1':'nhurt2'); }

// ---------- the Heavenly Drill: one line, the drill grows over his head, then flies up and hits the whole screen ----------
function* thDrill(){ const N=NAT, G=Game.mech, T=G.th, B=G.boss; if(!T) return; N.sp=Math.max(0,N.sp-100); T.drill=1; N.inv=99; T.hold=0;
  const [x0,y0]=thW(N.tu,N.tv+1.4), d=makeTrueDrill(); T.drillD=d; d.x=x0; d.y=y0; d.z=1; d.s=.1; d.spin=12; d.dir.set(1,0,0); d.fire=.4;
  twBark('nathan',"Heavenly Drill of Eternal Annihilation!",true); Sound.sfx('charge'); Sound.sfx('drone'); T.slow=.25;
  const g={k:0}; Game.fxUpd.push(()=>{ if(g.done) return false; const [x,y]=thW(N.tu,N.tv+1.4+g.k*1.6); d.x=x; d.y=y; d.s=.1+g.k*1.25; d.spin=12+g.k*90; d.fire=.4+g.k*2.4; return true; });
  yield tween(g,{k:1},1.9,t=>t*t); g.done=1; yield wait(.12);
  // it fires straight up the field
  Sound.sfx('skyopen'); Sound.sfx('beam'); FX.flash=.5; grade.uniforms.flashCol.value.set(.55,.85,1); shake(.6);
  const fl={u:0}, sx=d.x; Game.fxUpd.push(()=>{ if(fl.done) return false; d.x=lerp(sx,TH.CX+TH.H+6,fl.u); return true; }); yield tween(fl,{u:1},.32,t=>t*t); fl.done=1;
  // and hits the entire screen
  impactFrame([[1,2],[3,2],[2,1],[3,3],[1,1],[2,2],[3,2]]); FX.hitstop=.15; Sound.sfx('crossboom'); Sound.sfx('slam'); Sound.sfx('gore');
  for(const b of T.eb){ if(Math.random()<.35) thFx(b.u,b.v,2,0x9ff8ff,2,.2); T.score+=10; } T.eb=[];
  for(const m of T.mn) if(m.hp>0) thKill(m);
  for(let k=0;k<5;k++) for(let i=0;i<6;i++) thFx(rnd(-TH.W,TH.W),rnd(-TH.H,TH.H),10,[0x3ff4ff,0xffffff,0x2a6aff][i%3],8,.4);
  if(B){ const was=B.vuln; B.vuln=true; B.flash=1.2; const c=thBossC(), [bx,by]=thW(c.u,c.v); mechDamage(3*(3.2+T.bits.length*1.1),bx,by,0,true); /* three Power Shots (with their bit lasers) */ if(!was&&B.hp>0) B.vuln=false; }
  for(let k=0;k<8;k++){ shake(1.3-k*.12); FX.flash=k%2?.8:.2; grade.uniforms.flashCol.value.set(.5,.9,1); yield wait(.06); }
  d.dead=1; T.drillD=null; T.slow=1; T.drill=0; if(Game.mech&&Game.mech.th===T) N.inv=1.2; }

// ---------- minions ----------
function thMinion(kind,u,v,fn,o){ const T=Game.mech.th, TX=thTex(); const pig=kind==='pig', mesh=thPlane(pig?1.5:2.1,pig?pigletTex()[0]:TX.eld[0]);
  const m=Object.assign({kind,u,v,vu:0,vv:0,hp:pig?1.3:6,maxHp:pig?1.3:6,r:pig?.6:.95,t:0,mesh,fn,cd:rnd(.6,1.4),flash:0},o||{}); T.mn.push(m); thFx(u,v,8,pig?0xff8aa8:0xb06aff,3,.25); return m; }
function thKill(m){ const T=Game.mech.th; m.hp=0; thFx(m.u,m.v,26,m.kind==='pig'?0xff5a8a:0xb06aff,6,.35); thFx(m.u,m.v,10,0x1a0420,4,.4); Sound.sfx('gore'); T.score+=m.kind==='pig'?2000:6000; 
 }
function thMinions(dt){ const T=Game.mech.th, TX=thTex(), sl=T.slow||1;
  for(const m of T.mn){ if(m.hp<=0) continue; m.t+=dt*sl; m.flash=Math.max(0,m.flash-dt); if(m.fn) m.fn(m,dt*sl); m.u+=m.vu*dt*sl; m.v+=m.vv*dt*sl;
    if(m.kind==='eld') m.mesh.material.map=TX.eld[Math.floor(m.t*4)%2]; else m.mesh.material.map=pigletTex()[Math.floor(m.t*6)%2];
    const [x,y]=thW(m.u,m.v); m.mesh.position.set(x,y,.25); m.mesh.material.color.setRGB(1,m.flash>0?.5:1,m.flash>0?.6:1);
    if(m.u<-TH.W-4||m.u>TH.W+4||m.v<-TH.H-4||m.v>TH.H+6) m.gone=1;
    if(m.kind==='pig'&&!m.gone&&Math.hypot(m.u-NAT.tu,m.v-NAT.tv)<m.r*.6+TH.HIT) thHurt(); }
  for(const m of T.mn) if(m.hp<=0||m.gone){ scene.remove(m.mesh); } T.mn=T.mn.filter(m=>m.hp>0&&!m.gone);
  T.shield=T.mn.some(m=>m.shield)?1:0; const B=Game.mech.boss; if(B&&T.ready&&!T.drill&&B.hp>0) B.vuln=!T.shield; }
// a piglet flying a curve: enters from a top corner, swoops, fires one aimed 3-way, leaves
function thPigCurve(side,delay){ return (m,dt)=>{ const t=m.t-delay; if(t<0){ m.vu=m.vv=0; return; } m.vu=-side*Math.cos(t*1.3)*6; m.vv=-5+Math.sin(t*1.3)*1.5;
  m.cd-=dt; if(m.cd<=0&&t>.5){ m.cd=9; const a=thAim(m.u,m.v); for(const o of [-.25,0,.25]) thB(m.u,m.v,a+o,6.5,{col:0xffd04a,r:.22}); } }; }
// kamikaze piglet: hovers, then dives at Nathan
function thPigDive(m,dt){ if(m.t<.9){ m.vu=0; m.vv=-2; return; } if(!m.dove){ m.dove=1; const a=thAim(m.u,m.v); m.vu=Math.cos(a)*13; m.vv=Math.sin(a)*13; Sound.sfx('oink'); } }
// three kamikaze piglets at once (they arrive staggered)
function thPigDive3(){ for(let k=0;k<3;k++) thMinion('pig',rnd(-7,7),TH.H+k*.9,thPigDive); }
// eldritch eye: drifts to a spot, then fires rings and aimed lines
function thEldHover(tu,tv,o){ o=o||{}; return (m,dt)=>{ m.vu=(tu-m.u)*2.5; m.vv=(tv-m.v)*2.5; m.cd-=dt; if(m.cd>0||m.t<1) return; m.cd=o.rate||1.9; m.k=(m.k||0)+1;
  if(m.k%2){ for(let i=0;i<16;i++) thB(m.u,m.v,i/16*6.283+m.k*.2,3.6,{col:0xb06aff,r:.26}); } else { const a=thAim(m.u,m.v); for(let j=0;j<7;j++) thB(m.u,m.v,a,5+j*.7,{col:0xff3aff,r:.2}); }
  if(o.leave&&m.t>o.leave){ m.fn=(mm)=>{ mm.vv=6; }; } }; }

// ---------- attack patterns (TH_SPELLS: name, seconds, pattern key; names only show in Debug Mode) ----------
const TH_SPELLS={
  1:[['Snout Spiral',22,'spiral'],['Feeding Trough',16,'trough'],['Oink-Oink Crossfire',22,'cross'],['Piglet Parade',22,'parade'],['Bacon Downpour',22,'rain'],['Event Horizon',22,'horizon']],
  2:[['Eight Billion Lullabies',24,'lullaby'],['Eyes That Keep the Pig',30,'ward'],['Narrow Throat',18,'throat'],['Mitosis',22,'mitosis'],['Six Skeletal Wings',24,'wings'],['Oink Oink Oink',99,'final']]};
// ---------- AIRE, Nathan's operator (a calm, synthetic voice in his ear): phase starts, drill ready, low hull, checkpoints ----------
NAMES.operator='Aire';
function thOp(k){ const T=Game.mech&&Game.mech.th; if(!T) return; T.opT=T.opT||{}; if(T.opT[k]!=null&&T.t-T.opT[k]<8) return; T.opT[k]=T.t;
  if(k==='p1') twBark('operator',"Systems green, Nathan. Hamza's mass is larger than projected. One drill is loaded. Let's begin.",true);
  else if(k==='p2') twBark('operator',"Phase two. He's still growing. I've loaded another drill for you.",true);
  else if(k==='drill') twBark('operator',"Drill charged, Nathan. Show him how deep the sky goes.",true);
  else if(k==='drill2') twBark('operator',"Second drill charged. You could just... use them.",true);
  else if(k==='low2') twBark('operator',"Hull integrity critical. Please be careful, Nathan. I'd miss your voice.",true);
  else if(k==='low1') twBark('operator',"Shields are gone. One more hit and we're both just light.",true);
  else if(k==='last') twBark('operator',"This is the last one, Nathan. Breathe. I'm right here.",true);
  else if(k==='cp') twBark('operator',"Checkpoint logged. If we fall, we come back to here.",true);
  else if(k==='retry') twBark('operator',"Rebooting from the checkpoint. Let's try that again. Together.",true); }
// Nathan hurts: a grunt on every hit (voice only, no subtitle); while his cockpit burns (2 spare lives or fewer) he talks about the memories he carries
const TH_GRUNTS=[['nathan',"Agh!"],['nathan',"Ugh!"],['nathan',"Gah, damn it!"],['nathan',"Argh!"],['nathan',"Hnn... hold together!"]];
function thGrunt(){ try{ const g=TH_GRUNTS[Math.floor(Math.random()*TH_GRUNTS.length)]; Voice.overlay(g[0],g[1],.95); }catch(e){} }
function thBurnLine(i){ const k=i%5;
  if(k===0) twBark('nathan',"The cockpit's on fire... Doesn't matter. I have to protect their memories.",true);
  else if(k===1) twBark('nathan',"If I go down, they go with me. Every face. Every name. I won't let them burn.",true);
  else if(k===2) twBark('nathan',"Hold together... Just a little longer. They're all in here with me.",true);
  else if(k===3) twBark('nathan',"I'll burn. Fine. But not them. Never them.",true);
  else twBark('nathan',"I remember all of you. I'm not letting go. Not even now.",true); }
// checkpoints: after Oink-Oink Crossfire (phase I) and Narrow Throat (phase II) a retry starts from the next attack
const TH_CP={1:3,2:3};

// ---------- ticks: each attack is its own chunk of Hamza's HP ----------
// A chunk is what perfect play deals to him in 15 s of that attack (measured in the harness: Power Shot fired the frame it is full,
// recharged at once, focused, right under him), so clearing an attack in 15 s takes perfect play; most players take a little longer.
// Clearing the chunk pops its tick on the HP bar and moves on to the next attack. Phase II ends with the finale: survive 20 s.
const TH_TICK={spiral:107,trough:115,cross:115,parade:89,rain:114,horizon:114,lullaby:115,ward:121,throat:115,mitosis:116,wings:115};
const TH_FINALE=20;
function thTicks(ph){ return (TH_SPELLS[ph]||TH_SPELLS[2]).filter(e=>e[2]!=='final'); }
function thPhaseHp(ph){ return thTicks(ph).reduce((s,e)=>s+(TH_TICK[e[2]]||100),0)+(ph===2?1:0); } // phase II keeps 1 HP for the finale
// his HP once tick i is cleared
function thTickFloor(T,i){ const L1=thTicks(T.ph); let f=T.ph===2&&!T.finDone?1:0; for(let j=i+1;j<L1.length;j++) f+=TH_TICK[L1[j][2]]||100; return f; }
// the Drill gauge fills only from shots that land (boss-damage worth): about one Drill per 35 s of good shooting, up to 2 charges
const TH_SP_K=100/(6.5*35), TH_SP_MAX=200;
function thSpGain(d){ const N=NAT; if(!N) return; const b=N.sp||0; N.sp=Math.min(TH_SP_MAX,b+d*TH_SP_K); if(b<100&&N.sp>=100) thOp('drill'); else if(b<200&&N.sp>=200) thOp('drill2'); }
const TH_PAT={
  *spiral(T){ let a=0; for(;;){ const m=thMouth(); T.jaw=.5; for(let k=0;k<5;k++) thB(m.u,m.v,a+k*1.2566,5.2,{col:0xff5a8a,r:.28}); for(let k=0;k<5;k++) thB(m.u,m.v,-a*1.3+k*1.2566+.6,3.8,{col:0xb06aff,r:.22}); a+=.21; yield .1; } },
  *trough(T){ T.tip='Hold '+thFocusKeys()+' to focus, then slide along with the gap'; let gu=0, dir=1; const row=()=>{ for(let k=0;;k++){ const o=1.65+k*.8, /* two bullet widths more room each side than at first (.85) */ l=gu-o, r=gu+o; if(l<-TH.W-.3&&r>TH.W+.3) break; if(l>=-TH.W-.3) thB(l,TH.H+.6,-Math.PI/2,9,{col:0x7ab8ff,r:.2}); if(r<=TH.W+.3) thB(r,TH.H+.6,-Math.PI/2,9,{col:0x7ab8ff,r:.2}); } };
    for(;;){ row(); gu+=dir*.3; if(Math.abs(gu)>TH.W-1.9){ dir=-dir; gu=clamp(gu,-(TH.W-1.9),TH.W-1.9); } yield .07; /* the gap slides at 4.3/s: focused (4.8/s) you can always catch up */ } },
  *cross(T){ for(let w=0;;w++){ const e=thEye(w%2?1:-1), a0=thAim(e.u,e.v); for(let k=-3;k<=3;k++) thB(e.u,e.v,a0+k*.16,7.2,{col:0xff3a3a,r:.24});
      if(w%3===0){ const m=thMouth(); T.jaw=.7; for(let k=0;k<28;k++) thB(m.u,m.v,k/28*6.283+w*.1,2.8,{col:0xffd04a,r:.3}); } Sound.sfx('swing'); yield .34; } },
  *parade(T){ for(let w=0;w<4;w++){ const side=w%2?1:-1; for(let ln=0;ln<3;ln++) for(let i=0;i<6;i++) thMinion('pig',side*(TH.W+1),TH.H-1-i*.2-ln*1.5,thPigCurve(side,i*.28+ln*.14)); /* three lanes of six: triple the piglets */
      for(let k=0;k<6;k++){ const m=thMouth(); for(let j=0;j<20;j++) thB(m.u,m.v,j/20*6.283+k*.15+w,2.6,{col:0xff8ab0,r:.26}); yield .9; } } for(;;) yield 1; },
  *rain(T){ for(let w=0;;w++){ for(let i=0;i<9;i++) thB(rnd(-TH.W,TH.W),TH.H+.5,-Math.PI/2+rnd(-.15,.15),rnd(4,7),{col:i%3?0xff9a5a:0xffd0a0,r:rnd(.18,.3)});
      if(w%6===0){ const m=thMouth(), a=thAim(m.u,m.v); T.jaw=.8; for(let k=-1;k<=1;k++) thB(m.u,m.v,a+k*.3,4.5,{col:0xff2a3a,r:.65}); Sound.sfx('howl'); } yield .14; } },
  *horizon(T){ T.pull=1; const W=TH.W-.3, H=TH.H-.3, per=4*(W+H); for(let w=0;;w++){ const m=thMouth(); for(let i=0;i<16;i++){ let s=((i/16+w*.037)%1)*per, u, v; /* around the field's border, curling in to the mouth */
        if(s<2*W){ u=-W+s; v=H; } else if((s-=2*W)<2*H){ u=W; v=H-s; } else if((s-=2*H)<2*W){ u=W-s; v=-H; } else { s-=2*W; u=-W; v=-H+s; }
        thB(u,v,Math.atan2(m.v-v,m.u-u)-.5,2.6,{col:0x9a5aff,r:.24,curl:.35,life:9}); }
      if(w%4===0){ const a=thAim(m.u,m.v); for(let k=0;k<5;k++) thB(m.u,m.v,a,4+k*.6,{col:0xff5a8a,r:.3}); } yield .45; } },
  *lullaby(T){ let a=0,b=0; for(let w=0;;w++){ const m=thMouth(); T.jaw=.6; for(let k=0;k<8;k++){ thB(m.u,m.v,a+k*.785,4.6,{col:0xff4a7a,r:.24}); thB(m.u,m.v,b+k*.785+.39,3.4,{col:0x6ab0ff,r:.24}); } a+=.13; b-=.17;
      if(w%12===0){ for(const i of [-1,1]){ const e=thEye(i), at=thAim(e.u,e.v); for(let k=-2;k<=2;k++) thB(e.u,e.v,at+k*.12,8,{col:0xffffff,r:.2}); } } yield .1; } },
  *ward(T){ T.tip='Hamza is shielded: kill the eyes!'; Sound.sfx('howl'); for(let i=0;i<12;i++){ const tu=-7.2+(i%6)*2.88, tv=2.4+Math.floor(i/6)*2.4+(i%2)*.7; thMinion('eld',tu,TH.H+1+Math.floor(i/6),thEldHover(tu,tv,{rate:3.6}),{shield:1,hp:7,maxHp:7,cd:rnd(.6,3.6)}); } /* 12 eyes (triple), two rows; each fires less often so the screen stays readable */
      for(let w=0;;w++){ if(!T.shield&&w>4) break; if(w%5===4) thPigDive3(); const m=thMouth(); for(let j=0;j<14;j++) thB(m.u,m.v,j/14*6.283+w*.2,3,{col:0xff8ab0,r:.24}); yield .8; }
      const B=Game.mech.boss; if(B){ B.flash=1; } T.tip=null; Sound.sfx('glass'); Game.dmgNums.push({x:TH.CX+TH.VH,y:0,z:0,n:'SHIELD BROKEN',t:0,big:true,col:'#ffd45a'}); T.stun=4; yield 1.6; yield* TH_PAT.meatball(T); },
  // MEATBALL MAYHEM (after the shield breaks): he is FURIOUS; big meatballs bounce off the walls three times and burst into rings on every bounce,
  // while the eyes curl white fans in from the sides
  *meatball(T){ T.tip='He is FURIOUS. Meatballs bounce off the walls!'; Sound.sfx('howl'); for(let w=0;;w++){ const m=thMouth(), a=thAim(m.u,m.v)+rnd(-.55,.55); T.jaw=1;
      thB(m.u,m.v,a,5.4,{col:0xc0603a,r:.72,bounce:3,life:14,onB:b=>{ for(let j=0;j<9;j++) thB(b.u,b.v,j/9*6.283+b.t,2.5,{col:0xffb08a,r:.2}); thFx(b.u,b.v,8,0xff8a5a,3,.2); Sound.sfx('squelch'); }});
      if(w%2===1){ for(const i of [-1,1]){ const e=thEye(i); for(let k=0;k<4;k++) thB(e.u,e.v,-Math.PI/2+i*(.3+k*.22),4.6,{col:0xffffff,r:.21,curl:-i*.28}); } }
      if(w%5===4) thPigDive3(); yield 1.05; } },
  *throat(T){ T.tip='Focus ('+thFocusKeys()+') and thread the throat'; let t=0; for(;;){ const gu=Math.sin(t*.8)*4.6+Math.sin(t*.37)*1.3, gw=1.25; /* half-width: 3 bullet widths (0.4 each) narrower in all than the 1.85 it had (1.05 at first); it sways at most 4.2/s, under focused speed (4.8/s) */
      for(let k=0;;k++){ const o=gw+k*.75, l=gu-o, r=gu+o; if(l<-TH.W-.3&&r>TH.W+.3) break; if(l>=-TH.W-.3) thB(l,TH.H+.6,-Math.PI/2,8,{col:0xff6a9a,r:.2}); if(r<=TH.W+.3) thB(r,TH.H+.6,-Math.PI/2,8,{col:0xff6a9a,r:.2}); }
      t+=.085; yield .085; } },
  *mitosis(T){ for(let w=0;;w++){ const m=thMouth(), a=thAim(m.u,m.v)+rnd(-.3,.3); T.jaw=.9; thB(m.u,m.v,a,3.6,{col:0xff2a5a,r:.8,split:.9+rnd(0,.4)}); Sound.sfx('squelch'); if(w%3===2){ for(const i of [-1,1]){ const e=thEye(i); thB(e.u,e.v,thAim(e.u,e.v),5.5,{col:0xffd04a,r:.5,split:.7}); } } yield .75; } },
  *wings(T){ let a=0; for(let w=0;;w++){ const C=thBossC(); for(let i=0;i<6;i++){ const side=i%2?1:-1, lv=Math.floor(i/2), u=C.u+side*(4.5+lv*1.6), v=C.v-1-lv*1.2; thB(u,v,-Math.PI/2+side*(.5+Math.sin(a+i)*.6),4.2,{col:[0xff5a5a,0xff9a5a,0xb06aff][lv],r:.22,curl:-side*.35}); }
      a+=.12; if(w%25===0){ const m=thMouth(); for(let j=0;j<24;j++) thB(m.u,m.v,j/24*6.283,3.2,{col:0xffffff,r:.28}); } yield .09; } },
  *final(T){ let a=0; Sound.sfx('howl'); for(let w=0;;w++){ const m=thMouth(); T.jaw=.9; for(let k=0;k<6;k++) thB(m.u,m.v,a+k*1.047,4.4,{col:0xff3a5a,r:.24}); a+=.19;
      if(w%8===0){ for(const i of [-1,1]){ const e=thEye(i), at=thAim(e.u,e.v); for(let k=-2;k<=2;k++) thB(e.u,e.v,at+k*.18,7,{col:0xffffff,r:.22}); } }
      if(w%30===0) thPigDive3(); if(w%3===0) thB(rnd(-TH.W,TH.W),TH.H+.5,-Math.PI/2,5,{col:0xff9a5a,r:.22}); yield .1; } } };
function* thBossLoop(T){ const B=Game.mech.boss, ticks=thTicks(T.ph), fin=TH_SPELLS[2].find(e=>e[2]==='final'); if(!T.opStart){ T.opStart=1; thOp(T.fromCp?'retry':T.ph===1?'p1':'p2'); } yield 1.4;
  for(;;){ let ent=T.tick<ticks.length?ticks[T.tick]:T.ph===2?fin:null; if(!ent) return; // phase I: the last tick took him to 0
    if(T.dbgSpell){ ent=TH_SPELLS[1].concat(TH_SPELLS[2]).find(s=>s[2]===T.dbgSpell)||ent; if(!T.dbgLoop) T.dbgSpell=null; } // debug mode can pick the attack
    const [name,,key]=ent, tk=T.tick, isFin=key==='final';
    T.spell={name,dur:isFin?TH_FINALE:15,t:0,key}; T.spellMiss=0; T.tip=isFin?'Survive!':null; T.pull=0; T.stun=0; Sound.sfx('secret'); Game.cineMark='spell';
    const g=TH_PAT[key](T); let el=0; for(;;){ const s=g.next(); if(s.done) break; const w=s.value||.1; yield w; el+=w; T.finT=isFin?el:0; if(isFin?el>=TH_FINALE:T.tick!==tk) break; }
    // attack over: the bullets fizzle, a bonus if no life was lost
    for(const b of T.eb){ if(Math.random()<.3) thFx(b.u,b.v,2,0xffffff,1,.2); } T.eb=[]; T.pull=0; T.tip=null; for(const m of T.mn){ if(m.hp>0) thFx(m.u,m.v,8,0xb06aff,3,.25); m.gone=1; }
    if(isFin&&el>=TH_FINALE){ T.finDone=1; T.spell=null; if(B){ B.vuln=true; mechDamage(B.hp+1,TH.CX+TH.VH,0,0,true); } return; } // he falls once you outlast it
    if(T.tick===tk){ T.spell=null; continue; } // the attack ran out before its tick was cleared: it starts again
    if(!T.spellMiss){ const bonus=(T.ph*1000000)+Math.round(Math.max(0,15-el)*20000); T.score+=bonus; T.bonus={t:0,n:bonus}; Sound.sfx('ready'); } T.spell=null; yield 1.3; } }

// a hit can't carry past the current tick: the chunk empties, the tick pops, the next attack starts (the one-hit-kill cheat skips this)
(function(){ const md=mechDamage; mechDamage=function(d,x,y,z,b){ try{ const G=Game.mech, T=G&&G.th, B=G&&G.boss;
    if(T&&B&&B.vuln&&!TW.otk&&T.tick!=null){ const n=thTicks(T.ph).length; while(T.tick<n&&B.hp<=thTickFloor(T,T.tick)+1e-6) T.tick++; /* HP set from outside (Debug Mode): catch up */ const f=thTickFloor(T,T.tick); d=Math.max(0,Math.min(d,B.hp-f)); if(d<=0) return;
      if(B.hp-d<=f+1e-6&&T.tick<thTicks(T.ph).length){ const i=T.tick; T.tick++; T.pops.push({i,t:0}); if(TH_CP[T.ph]===T.tick&&G){ G.thCp={ph:T.ph,tick:T.tick}; thOp('cp'); Game.dmgNums.push({x:NAT.x,y:NAT.y+2.2,z:0,n:'CHECKPOINT',t:0,big:true,col:'#9fe0ff'}); } Sound.sfx('ting'); Sound.sfx('ready'); const C=thBossC(); thFx(C.u,C.v,30,0xffd45a,6,.4); } } }catch(e){ console.error('ticks',e); }
  return md.call(this,d,x,y,z,b); }; })();

// ---------- per-frame ----------
function thUpdate(dt){ const G=Game.mech, T=G.th, N=NAT, v=L.vd; T.t+=dt;
  if(T.burnCd!=null&&T.lives<=2&&T.lives>=0&&T.ready&&!T.drill&&!T.deadT){ T.burnCd-=dt; if(T.burnCd<=0&&!Voice.speaking){ T.burnCd=16; thBurnLine(T.burnN=(T.burnN||0)+1); } } const sl=T.slow||1;
  T.sway=Math.sin(T.t*.35)*1.6; if(T.ready) thHzPose(1); v.o.jaw=lerp(v.o.jaw,T.jaw||.1,Math.min(1,dt*6)); T.jaw=Math.max(.1,(T.jaw||.1)-dt*.8); v.o.look=1;
  if(T.cam){ T.cam.t+=dt; const keys=T.cam.keys, K1=keys[keys.length-1].t, k=Math.min(T.cam.t,K1); T.cam.upd(k); if(T.cam.t>=K1){ const d=T.cam.done; T.cam.upd(K1); T.cam.cur=null; d(); } }
  const B=G.boss; if(B){ B.flash=Math.max(0,B.flash-dt); }
  if(N.show) thPlayer(dt);
  const play=Game.state==='play'&&T.ready&&!G.busy;
  if(play&&B&&B.vuln!==undefined&&!G.dbgIdle){ if(!T.gen) T.gen=thBossLoop(T); T.wait-=dt*sl; while(T.wait<=0&&T.gen){ const s=T.gen.next(); if(s.done){ T.gen=null; break; } T.wait+=s.value||.1; } }
  if(T.spell) T.spell.t+=dt; if(T.bonus){ T.bonus.t+=dt; if(T.bonus.t>2.6) T.bonus=null; }
  thBits(dt); thMinions(dt);
  // enemy bullets
  const hu=N.tu, hv=N.tv; for(const b of T.eb){ b.t+=dt*sl;
    if(b.curl){ const a=Math.atan2(b.vv,b.vu)+b.curl*dt*sl, s=Math.hypot(b.vu,b.vv); b.vu=Math.cos(a)*s; b.vv=Math.sin(a)*s; }
    if(b.split&&b.t>=b.split){ b.dead=1; const n=b.r>.7?14:9; for(let i=0;i<n;i++) thB(b.u,b.v,i/n*6.283+rnd(0,.4),2.6+rnd(0,1),{col:b.r>.7?0xff8aa8:0xffe08a,r:.22}); thFx(b.u,b.v,8,b.col,3,.2); continue; }
    b.u+=b.vu*dt*sl; b.v+=b.vv*dt*sl;
    if(b.bounce>0){ let hit=0; if((b.u<-TH.W+b.r&&b.vu<0)||(b.u>TH.W-b.r&&b.vu>0)){ b.vu=-b.vu; hit=1; } if(b.v<-TH.H+b.r&&b.vv<0){ b.vv=-b.vv; hit=1; } if(hit){ b.bounce--; if(b.onB) b.onB(b); } }
    if(b.u<-TH.W-1.5||b.u>TH.W+1.5||b.v<-TH.H-1.5||b.v>TH.H+3||(b.life&&b.t>b.life)) { b.dead=1; continue; }
    if(N.show&&Game.state==='play'){ const d=Math.hypot(b.u-hu,b.v-hv); if(d<b.r*.6+TH.HIT){ b.dead=1; thHurt(); }
      else if(!b.gz&&d<b.r+TH.GRAZE&&T.ready){ b.gz=1; T.graze++; T.score+=500; if(T.graze%2===0) Sound.tone('square',2200,2600,.025,.035); const [x,y]=thW(hu+(b.u-hu)*.5,hv+(b.v-hv)*.5); FX.spawn(x,y,.4,rnd(-3,3),rnd(-3,3),0,.15,0xffffff,.16,0,true); } }
    [b.x,b.y]=thW(b.u,b.v); b.z=0; }
  T.eb=T.eb.filter(b=>!b.dead);
  // Event Horizon pulls you toward the mouth
  if(T.pull&&play&&N.qb<=0){ const m=thMouth(), du=m.u-N.tu, dv=m.v-N.tv, d=Math.hypot(du,dv)||1; N.tu+=du/d*1.6*dt; N.tv=Math.min(N.tv+dv/d*1.6*dt,TH.VH-6.5*TH.K-2.2); }
  // player bullets
  const C=thBossC(); for(const p of T.pb){ p.t+=dt; p.u+=p.vu*dt; p.v+=p.vv*dt; if(p.v>TH.H+2||p.u<-TH.W-1||p.u>TH.W+1){ p.dead=1; continue; }
    if(p.big&&Math.random()<.9){ const [x,y]=thW(p.u+rnd(-.4,.4),p.v-.6); FX.spawn(x,y,.3,-rnd(3,8),rnd(-1,1),0,.25,Math.random()<.5?0x3a8aff:0xbff8ff,rnd(.3,.6),0,true); }
    for(const m of T.mn){ if(m.hp<=0||(p.hit&&p.hit.has(m))) continue; if(Math.hypot(m.u-p.u,m.v-p.v)<m.r+p.r){ m.hp-=p.big?6:p.dmg*6; m.flash=.08; thSpGain(p.dmg); T.score+=100; if(m.hp<=0) thKill(m); if(p.pierce) p.hit.add(m); else { p.dead=1; break; } } }
    if(p.dead) continue;
    if(B&&p.v>C.v-4.6&&Math.hypot(p.u-C.u,(p.v-C.v)*.8)<4.4&&!(p.hit&&p.hit.has(B))){ const [x,y]=thW(p.u,p.v); const was=B.hp; mechDamage(p.dmg*(T.stun>0?1.5:1),x,y,0,!!p.big); if(B.hp<was) T.score+=Math.round((was-B.hp)*1000); thSpGain(p.dmg); if(p.pierce) p.hit.add(B); else p.dead=1; } }
  T.pb=T.pb.filter(p=>!p.dead); if(T.stun>0) T.stun-=dt;
  // items: red P raises power, blue points score; above the top third they fly to you
  for(const it of T.items){ it.t+=dt; const near=N.tv>TH.H*.2||it.auto||Math.hypot(it.u-N.tu,it.v-N.tv)<2.2; if(near&&N.show){ const du=N.tu-it.u, dv=N.tv-it.v, d=Math.hypot(du,dv)||1; it.u+=du/d*22*dt; it.v+=dv/d*22*dt; } else { it.vv=Math.max(-3.5,it.vv-dt*6); it.v+=it.vv*dt; }
    if(Math.hypot(it.u-N.tu,it.v-N.tv)<.7&&N.show){ it.dead=1; if(it.k==='p'){ T.power=Math.min(4,T.power+.05); T.score+=10; } else T.score+=it.auto?100:3000; } if(it.v<-TH.H-2) it.dead=1; }
  T.items=T.items.filter(i=>!i.dead);
  G.thScore=T.score; G.thPower=T.power; G.thGraze=T.graze; if(T.score>(SAVE.settings.thHi||0)){ SAVE.settings.thHi=T.score; if(T.t%2<dt) saveWrite(); }
  thPlace(); MB.layE&&MB.layE.write(T.eb); if(MB.layP){ for(const p of T.pb){ [p.x,p.y]=thW(p.u,p.v); p.z=.1; } MB.layP.write(T.pb); } }
function thGhosts(dt){ if(!MB.gh||!MB.gh.length) return; for(const g of MB.gh){ g.t+=dt; g.m.material.opacity=Math.max(0,.45-g.t*2.2); if(g.t>.22){ scene.remove(g.m); g.m.geometry.dispose(); g.m.material.dispose(); g.dead=1; } } MB.gh=MB.gh.filter(g=>!g.dead); }
function thPlace(){ const N=NAT, T=Game.mech.th; if(!N||!N.mesh) return; if(MECHTEX&&!N.mat.map){ N.mat.map=MECHTEX; N.mat.needsUpdate=true; }
  const blink=N.inv>0&&N.inv<2.4&&T.ready&&Math.floor(N.inv*16)%2===0; const s=T.pk; N.mesh.visible=!!N.show&&!blink&&!!MECHTEX; N.mesh.scale.set(s,s,1);
  N.mesh.position.set(N.x-.75*s,N.y-.6*s,0); N.mesh.rotation.z=0; N.mat.color.setRGB(1,N.flash>0?.45:1,N.flash>0?.5:1);
  N.thr.visible=!!N.show; N.thr.position.set(N.x-1.9*s,N.y+.4*s,-.1); const th=(1.6+Math.sin(N.t*30)*.3)*s; N.thr.scale.set(th*1.6,th,1); if(N.coreMk) N.coreMk.visible=false; if(N.coreRing) N.coreRing.visible=false; }
// camera: the play view, or a keyframed move (zoom into Nathan + roll) during transitions
function thCam(){ const T=Game.mech.th, sh=FX.shake, j=()=>sh?rnd(-sh,sh)*.5:0;
  if(T.cam){ const ks=T.cam.keys, t=Math.min(T.cam.t,ks[ks.length-1].t); let i=0; while(i<ks.length-2&&t>ks[i+1].t) i++; const a=ks[i], b=ks[i+1], u=clamp((t-a.t)/(b.t-a.t),0,1), e=u*u*(3-2*u), L3=(p,q)=>[lerp(p[0],q[0],e),lerp(p[1],q[1],e),lerp(p[2],q[2],e)];
    const p=L3(a.p,b.p), l=L3(a.l,b.l), up=L3(a.up,b.up); camera.up.set(up[0],up[1],up[2]).normalize(); camera.position.set(p[0]+j(),p[1]+j(),p[2]); camera.lookAt(l[0],l[1],l[2]); return; }
  camera.up.set(1,0,0); camera.position.set(TH.CX+j(),j(),TH.CZ); camera.lookAt(TH.CX,0,0); }
// phase over: zoom into Nathan and roll back into the cutscene's first shot, then play the cutscene
function* thPhaseOut(ph){ const G=Game.mech, T=G.th, N=NAT, B=G.boss; if(!T) return;
  G.busy=1; G.st='cut'; T.ready=false; T.gen=null; T.spell=null; T.tip=null; N.inv=99; N.qb=0; T.hold=0; Game.banner=null; Game.subtitle=null; Game.chant=null; clearMechFire();
  for(const b of T.eb) if(Math.random()<.4) thFx(b.u,b.v,2,0xffffff,2,.2); T.eb=[]; T.pb=[]; for(const m of T.mn) if(m.hp>0) thKill(m); T.items=[];
  if(B){ B.lunge=-.4; B.flash=.6; } Voice.stop(); Voice.bark('hzScream'); Sound.sfx('shriek'); shake(.8); Game.letterTo=1; L.vd.o.jaw=1;
  const [nx,ny]=thW(N.tu,N.tv), NX=-14, NY=0, E=ph===1?{p:[NX+4,NY+.6,10],l:[NX+.3,NY+1,0]}:{p:[NX+3.5,NY+.5,9],l:[NX+.3,NY+1,0]}, u0=N.tu, v0=N.tv;
  T.cam={t:0,keys:[{t:0,p:[TH.CX,0,TH.CZ],l:[TH.CX,0,0],up:[1,0,0]},{t:.9,p:[nx-1.2,ny,7.5],l:[nx+.4,ny,0],up:[1,0,0]},{t:2.3,p:E.p,l:E.l,up:[0,1,0]}],
    upd:(k)=>{ const q=clamp((k-.9)/1.4,0,1), e=q*q*(3-2*q); T.panel=1-clamp(k/.6,0,1); T.pk=lerp(.26,1,e); thHzPose(1-e); N.tu=lerp(u0,0,e); N.tv=lerp(v0,-8,e); [N.x,N.y]=thW(N.tu,N.tv); for(const b of T.bits) b.mesh.visible=false; },
    done:()=>{ T.done=1; }};
  while(!T.done) yield wait(.05);
  // hand the camera to the cutscene exactly where it starts
  thClear(T); G.th=null; camera.up.set(0,1,0); thHzPose(0); N.x=NX; N.y=NY; N.vx=N.vy=0; N.mesh.scale.set(1,1,1); cineSet(E.p[0],E.p[1],E.p[2],E.l[0],E.l[1],E.l[2]); N.charge=N.shot=0; N.atk=null; L.vd.o.jaw=.1;
  yield wait(.5);
  if(ph===1) yield* soulburn(); else if(ph===2) yield* cosmicBlade(); else yield* blackHoleFinale(); }

// ---------- HUD: the side panels and the field furniture ----------
function thHUD(){ const G=Game.mech, T=G.th, N=NAT; if(!T||!N) return; const a=T.panel; if(a<=0.01) return;
  const F=thField(), fx=F.x, fw=F.w, fy=F.y, fh=F.h;
  D.save(); D.globalAlpha=a;
  // side panels
  const pg=D.createLinearGradient(0,0,0,UH); pg.addColorStop(0,'#160a24'); pg.addColorStop(1,'#08040e'); D.fillStyle=pg; D.fillRect(0,0,fx,UH); D.fillRect(fx+fw,0,UW-fx-fw,UH);
  D.strokeStyle='rgba(176,106,255,.08)'; D.lineWidth=1; for(let i=-UH;i<UW;i+=26){ D.beginPath(); D.moveTo(i,0); D.lineTo(i+UH,UH); D.stroke(); }
  D.fillStyle='rgba(8,4,14,1)'; D.fillRect(fx,0,fw,Math.max(0,fy)); D.fillRect(fx,fy+fh,fw,UH-fy-fh); // keep the panels neat if the field is shorter than the screen
  D.strokeStyle='#e3b65a'; D.lineWidth=2; D.strokeRect(fx-1,fy-1,fw+2,fh+2); D.strokeStyle='rgba(227,182,90,.3)'; D.lineWidth=1; D.strokeRect(fx-6,fy-6,fw+12,fh+12);
  // right panel: score, lives, drill, graze, shot, and Nathan's cockpit
  const tch=IS_TOUCH(), ps=tch?1.3:1; let R0=fx+fw+28, RW=UW-R0-28; let y=46; D.save(); if(tch){ D.translate(R0,0); D.scale(ps,ps); R0=0; RW=RW/ps; } const row=(lab,val,col)=>{ uText(lab,R0,y,`700 15px ${FB}`,'#b9a8d8'); uText(val,R0+RW,y,`800 18px ${FB}`,col||'#fff','right'); y+=30; };
  uText('東方大豚',R0,y,`900 26px ${FB}`,'#f6dca0'); uText('~ The Endless Hunger',R0+2,y+20,`italic 600 13px ${FB}`,'#b9a8d8'); y+=60;
  const fmt=n=>String(Math.floor(n)).padStart(10,'0'); row('HiScore',fmt(Math.max(SAVE.settings.thHi||0,T.score)),'#d8d0f0'); row('Score',fmt(T.score)); y+=8;
  uText('Player',R0,y,`700 15px ${FB}`,'#b9a8d8'); for(let i=0;i<TH.LIVES;i++){ thStar(R0+RW-10-i*22,y-6,8,i<T.lives?'#ff6ab0':'rgba(255,255,255,.12)'); } y+=30;
  uText('Drill',R0,y,`700 15px ${FB}`,'#b9a8d8'); const dw=RW-60; uRR(R0+60,y-11,dw,12,6); D.fillStyle='rgba(255,255,255,.08)'; D.fill(); for(let c=0;c<2;c++){ const k=clamp((N.sp-c*100)/100,0,1), cx=R0+60+c*(dw/2+2), cw=dw/2-2; if(k>0){ uRR(cx,y-11,Math.max(6,cw*k),12,6); D.fillStyle=k>=1?`hsl(${195+Math.sin(T.t*8+c)*20},100%,65%)`:'#3a8aff'; D.fill(); } } y+=22;
  uText(N.sp>=100?K('special')+'  DRILL READY ×'+Math.floor(N.sp/100):Math.floor(N.sp)+'%',R0+RW,y,`800 12px ${FB}`,N.sp>=100?'#9ff8ff':'#8f95ab','right'); y+=26;
  row('Graze',String(T.graze),'#fff');
  uText('Shot',R0,y,`700 15px ${FB}`,'#b9a8d8'); const cw=RW-60, ck=clamp(T.hold/TH.FULL,0,1); uRR(R0+60,y-11,cw,12,6); D.fillStyle='rgba(255,255,255,.08)'; D.fill(); if(ck>0){ uRR(R0+60,y-11,Math.max(6,cw*ck),12,6); D.fillStyle=ck>=1?'#9ff8ff':'#5a8aff'; D.fill(); }
  y+=22; uText(tch?(ck>=1?'POWER SHOT!':'Power Shot charges by itself'):ck>=1?'POWER SHOT · release':'hold '+K('attack')+' to charge',R0+RW,y,`700 12px ${FB}`,ck>=1?'#9ff8ff':'#8f95ab','right'); y+=18;
  try{ const ch=Math.min(RW*.8,(tch?UH/ps:UH)-y-24); if(ch>60) thCockpit(R0,y,RW,ch,T,N); }catch(e){ console.error('cockpit',e); } D.restore();
  // left panel: the boss and the controls
  let L0=28, LW=fx-56, ly=46; D.save(); if(tch){ D.translate(L0,0); D.scale(ps,ps); L0=0; LW=LW/ps; } uCaps('BOSS',L0,ly,'#b9a8d8',11); ly+=34; uText('Hamza',L0,ly,`900 30px ${FD}`,'#f6dca0'); ly+=22; uText('the Endless Hunger',L0,ly,`italic 600 14px ${FB}`,'#b9a8d8'); ly+=30;
  uText('Phase '+['','I','II'][T.ph]+(T.ph===1?' · Gluttony':' · The Devourer'),L0,ly,`700 15px ${FB}`,'#fff'); ly+=34;
  if(T.shield){ uText('◆ SHIELDED · kill the eyes',L0,ly,`800 13px ${FB}`,'#ff8aff'); ly+=24; } else if(T.stun>0){ uText('◆ STUNNED · 1.5× damage',L0,ly,`800 13px ${FB}`,'#ffd45a'); ly+=24; }
  if(tch){ ly+=8; uCaps('TOUCH',L0,ly,'#b9a8d8',11); for(const l of ['Left thumb: move','Shots + Power Shot: automatic','Hold Focus: slow + hitbox','Drill (blue)']){ ly+=22; uText(l,L0,ly,`600 13px ${FB}`,'#d8d0f0'); } }
  else { ly=UH-206; uCaps('CONTROLS',L0,ly,'#b9a8d8',11); ly+=10; for(const [k,l] of [['WASD','Move'],[[K('block'),K('dash')],'Focus (slow, hitbox)'],[K('attack'),'Shoot (hold: power shot)'],[K('special'),'Heavenly Drill']]){ ly+=28; let kx=L0; for(const kk of [].concat(k)) kx+=uKey(kk,kx,ly-5,false)+6; /* focus has two keys */ uText(l,kx+4,ly,`600 14px ${FB}`,'#d8d0f0'); } }
  D.restore();
  // boss bar across the top of the field
  const B=G.boss; if(B&&T.ready){ const k=clamp(B.hp/B.maxHp,0,1), bx=fx+10, bw=fw-20, byy=fy+10; D.fillStyle='rgba(0,0,0,.5)'; D.fillRect(bx,byy,bw,7); D.fillStyle=T.shield?'#b06aff':B.flash>0?'#fff':'#ff4a7a'; D.fillRect(bx,byy,bw*k,7);
    // a tick between every attack's chunk; the ones you have reached pop and fade
    const n=thTicks(T.ph).length; for(let i=0;i<n;i++){ const f=thTickFloor(T,i)/B.maxHp, tx=bx+bw*f, done=i<T.tick, cur=i===T.tick;
      if(done) continue; D.fillStyle=cur?'#ffd45a':'rgba(255,255,255,.7)'; D.beginPath(); D.moveTo(tx,byy-4); D.lineTo(tx+4,byy+3.5); D.lineTo(tx,byy+11); D.lineTo(tx-4,byy+3.5); D.closePath(); D.fill(); }
    for(const q of T.pops||[]){ q.t+=1/60; const f=thTickFloor(T,q.i)/B.maxHp, tx=bx+bw*f, u=Math.min(1,q.t/.55), r=4+u*22; D.globalAlpha=a*(1-u); D.strokeStyle='#ffd45a'; D.lineWidth=3*(1-u)+1;
      D.beginPath(); D.arc(tx,byy+3.5,r,0,7); D.stroke(); D.fillStyle='#fff'; D.beginPath(); D.arc(tx,byy+3.5,Math.max(0,6*(1-u*1.6)),0,7); D.fill(); D.globalAlpha=a; }
    if(T.pops) T.pops=T.pops.filter(q=>q.t<.55);
    uText('HAMZA',bx,byy+24,`800 12px ${FB}`,'#ffd0e0'); uText(T.tick<n?(T.tick+1)+' / '+n:T.ph===2?'SURVIVE '+Math.max(0,Math.ceil(TH_FINALE-(T.finT||0))):'',bx+bw,byy+24,`800 12px ${FB}`,T.tick<n?'#ffd45a':'#ff8a9a','right'); }
  if(T.bonus){ const k=T.bonus.t; D.globalAlpha=a*Math.min(1,(2.6-k)*2); uText('No-Hit Bonus!',fx+fw/2,fy+fh*.32,`900 26px ${FB}`,'#ffd45a','center'); uText('+'+T.bonus.n.toLocaleString(),fx+fw/2,fy+fh*.32+28,`800 18px ${FB}`,'#fff','center'); D.globalAlpha=a; }
  if(T.tip&&T.ready){ uText(T.tip,fx+fw/2,fy+fh-18,`700 14px ${FB}`,'#bfe8ff','center'); }
  D.restore();
  // field furniture: the focus sigil, the hitbox dot
  D.save(); D.beginPath(); D.rect(fx,fy,fw,fh); D.clip();
  if(N.show&&T.ready){ const [sx,sy]=toScreen(N.x,N.y,0), [gx]=toScreen(N.x,N.y-TH.GRAZE,0), gr=Math.abs(gx-sx);
    if(T.focus){ D.save(); D.translate(sx,sy); D.rotate(T.t*1.6); D.strokeStyle='rgba(255,106,176,.75)'; D.lineWidth=1.5; D.strokeRect(-gr*.72,-gr*.72,gr*1.44,gr*1.44); D.rotate(-T.t*3.2); D.strokeRect(-gr*.72,-gr*.72,gr*1.44,gr*1.44); D.restore();
      D.strokeStyle='rgba(255,255,255,.35)'; D.beginPath(); D.arc(sx,sy,gr,0,7); D.stroke(); }
    if(T.hold>.15){ const ck=clamp(T.hold/TH.FULL,0,1); D.strokeStyle=ck>=1?'#9ff8ff':'rgba(90,140,255,.85)'; D.lineWidth=3; D.beginPath(); D.arc(sx,sy,15,-Math.PI/2,-Math.PI/2+ck*Math.PI*2); D.stroke(); }
    const [hx,hy]=toScreen(N.x,N.y-TH.HIT,0), r=Math.max(1,Math.hypot(hx-sx,hy-sy)); /* the white dot is the true hitbox (TH.HIT), the same in and out of focus */ D.fillStyle='#ff2a4a'; D.beginPath(); D.arc(sx,sy,r+1.6,0,7); D.fill(); D.fillStyle='#fff'; D.beginPath(); D.arc(sx,sy,r,0,7); D.fill(); }
  D.restore(); }
// the play field on the UI canvas, from the play camera's fixed geometry (during camera moves the live projection is meaningless)
function thField(){ const ppu=(UH/2)/(TH.CZ*Math.tan(camera.fov*Math.PI/360)), w=Math.round(TH.W*2*ppu), h=Math.round(Math.min(UH,TH.H*2*ppu)); return {x:Math.round((UW-w)/2),y:Math.round((UH-h)/2),w,h}; }
function thStar(x,y,r,col){ D.fillStyle=col; D.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, rr=i%2?r*.45:r; D.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr); } D.closePath(); D.fill(); }

// ---------- hooks into the mech fight ----------
(function(){
  // the 3D "Dimension Break" phases are replaced: never enter them
  m3Enter=function(){};
  const smp=startMechPhase; startMechPhase=function(ph){ const G=Game.mech, resp=!!(G&&G._resp); smp(ph); if(!Game.mech) return; if(ph<=2) Sound.play('mp3:hamza'); thSetup(Math.min(ph,2),!resp); }; /* the Hamza song through both bullet-hell phases (carries on where it was) */
  const mpe=mechPhaseEnd; mechPhaseEnd=function*(ph){ if(thOn()){ yield* thPhaseOut(ph); return; } yield* mpe(ph); };
  const um=updateMech; updateMech=function(dt){ const G=Game.mech; thGhosts(dt); if(G&&G.th&&L.vd){ for(const f of L.anim) f(dt); try{ thUpdate(dt); }catch(e){ console.error('touhou update',e); } return; } return um(dt); };
  const mc=mechCam; mechCam=function(dt){ if(thOn()) return thCam(); return mc(dt); };
  const dh=drawMechHUD; drawMechHUD=function(){ if(thOn()){ try{ thHUD(); }catch(e){ console.error('touhou hud',e); } return; } return dh(); };
  const nd=natDrill; natDrill=function*(){ if(thOn()){ yield* thDrill(); return; } yield* nd(); };
  const em=exitMech; exitMech=function(q){ const G=Game.mech; if(G&&G.th){ thClear(G.th); G.th=null; camera.up.set(0,1,0); } thTouchButtons(false); return em(q); };
  // the drill and the death-retry may clear temp scene objects: rebuild on respawn
  const mr=mechRespawn; mechRespawn=function(){ const G=Game.mech; if(G&&G.th){ thClear(G.th); G.th=null; } return mr(); }; })();
// ---------- Nathan's cockpit (right panel): flinches when hit, smokes at 3-4 hearts, burns at 1-2, explodes when he dies ----------
function thCockpit(x,y,w,h,T,N){ thCockpitOn(D,x,y,w,h,T,N); }
function thCockpitOn(D,x,y,w,h,T,N){ const now=performance.now(), t=now/1000, hitK=T.hitT?Math.max(0,1-(now-T.hitT)/550):0, dead=T.deadT?(now-T.deadT)/1000:-1, last=T.lives<=2&&dead<0, smoke=T.lives<=4&&dead<0; /* 1-2 hearts: burning; 3-4: smoking; 5: fine */
  let jx=0, jy=0; if(hitK>0){ jx=rnd(-6,6)*hitK; jy=rnd(-4,4)*hitK; } if(dead>=0&&dead<1.2){ jx=rnd(-9,9)*(1-dead/1.2); jy=rnd(-7,7)*(1-dead/1.2); }
  D.save(); D.translate(Math.round(x+jx),Math.round(y+jy)); uCaps('COCKPIT',0,-4,'#b9a8d8',11);
  D.beginPath(); D.rect(0,4,w,h-4); D.clip();
  // space through the canopy, stars streaking past
  const g=D.createLinearGradient(0,4,0,h); g.addColorStop(0,'#05030f'); g.addColorStop(1,'#1a0a2e'); D.fillStyle=g; D.fillRect(0,4,w,h);
  for(let i=0;i<26;i++){ const sx=(twP5Rand(i)*w+t*(60+twP5Rand(i+3)*90))%w, sy=4+twP5Rand(i+7)*h*.7; D.fillStyle=i%5?'rgba(220,220,255,.5)':'#ffffff'; D.fillRect(Math.round(sx),Math.round(sy),i%5?2:3,1); }
  if(dead<0||dead<.15){
    // Nathan in the seat (his portrait, pixel-scaled): flinches when hit; worried while it smokes, in pain while it burns
    const ex=hitK>.3?'surprised':last?'sad':smoke?'worried':'normal', pc=portrait('nathan',ex), ps=Math.max(1,Math.floor(Math.min(w*.62,h*.78)/56)), pw=56*ps, px=Math.round(w/2-pw/2+(hitK>0?-hitK*8:0)), py=Math.round(h-pw-h*.14+(hitK>0?hitK*4:0));
    D.fillStyle='#120c1c'; D.fillRect(Math.round(w/2-pw*.42),py+pw*.2,Math.round(pw*.84),h); /* the seat */
    D.imageSmoothingEnabled=false; if(pc&&pc.width) D.drawImage(pc,px,py,pw,pw);
    const Q=(u,v,uw,vh,col)=>{ D.fillStyle=col; D.fillRect(px+u*ps,py+v*ps,uw*ps,vh*ps); };
    if(smoke&&hitK<=.3){ const dy=(t*14)%6; Q(42,20+dy,2,3,'#8fd8ff'); Q(42,23+dy,1,1,'#d8f4ff'); }
    if(last&&hitK<=.3){ // squeezed-shut eyes, gritted teeth, sweat and soot
      Q(18,22,8,8,'#c48a5c'); Q(30,22,8,8,'#c48a5c'); for(const [u,v] of [[19,24],[20,25],[21,26],[20,27],[19,28],[36,24],[35,25],[34,26],[35,27],[36,28]]) Q(u,v,1,1,'#1a1626');
      Q(18,21,3,1,'#1a1626'); Q(21,22,3,1,'#1a1626'); Q(32,22,3,1,'#1a1626'); Q(35,21,3,1,'#1a1626');
      Q(22,34,13,5,'#c48a5c'); Q(23,35,11,3,'#ffffff'); Q(23,34,11,1,'#3a0a14'); Q(23,38,11,1,'#3a0a14'); for(let k=0;k<4;k++) Q(25+k*2.5,35,1,3,'#b8b0b0');
      const dy=(t*20)%7; Q(41,18+dy,2,3,'#8fd8ff'); Q(14,21+((t*17+3)%7),2,3,'#8fd8ff'); Q(16,30,4,2,'rgba(30,20,20,.55)'); Q(36,32,3,2,'rgba(30,20,20,.55)'); }
    if(hitK>0){ D.fillStyle=`rgba(255,40,60,${(.45*hitK).toFixed(3)})`; D.fillRect(0,4,w,h); }
    // the console across the bottom, lights blinking (red when it is going badly)
    const cy=Math.round(h-h*.16); D.fillStyle='#1c1428'; D.fillRect(0,cy,w,h-cy); D.fillStyle='#2e2440'; D.fillRect(0,cy,w,3);
    for(let i=0;i<10;i++){ const on=(Math.floor(t*(last?6:2)+i*1.7)%3)>0; D.fillStyle=last?(on?'#ff3a3a':'#5a1010'):(on?(i%3?'#3ff4ff':'#8aff8a'):'#1a3a3a'); D.fillRect(Math.round(8+i*(w-16)/10),cy+8,6,4); }
    // canopy struts
    D.strokeStyle='#3a2e4e'; D.lineWidth=5; D.beginPath(); D.moveTo(0,cy); D.lineTo(w*.18,4); D.moveTo(w,cy); D.lineTo(w*.82,4); D.stroke(); D.strokeStyle='rgba(180,220,255,.12)'; D.lineWidth=2; D.beginPath(); D.moveTo(w*.3,10); D.lineTo(w*.1,cy-8); D.stroke();
    if(smoke){ // smoke out of the console (3-4 hearts); fire, sparks and the alarm too (1-2 hearts)
      T.ck=T.ck||[]; if(Math.random()<(last?.5:.22)) T.ck.push({x:w*(.15+Math.random()*.7),y:cy,r:6+Math.random()*7,vy:-(22+Math.random()*30),vx:rnd(-8,8),a:last?.9:.6,sp:last&&Math.random()<.25});
      if(last){ T.cf=T.cf||[]; for(let i=0;i<3;i++) T.cf.push({x:w*(.08+Math.random()*.84),y:cy+2,h:18+Math.random()*22,a:1});
        for(const f of T.cf){ f.y-=40/60; f.a-=.05; } T.cf=T.cf.filter(f=>f.a>0); if(T.cf.length>90) T.cf.splice(0,T.cf.length-90); }
      for(const p of T.ck){ p.y+=p.vy/60; p.x+=p.vx/60; p.r+=.25; p.a-=.009; } T.ck=T.ck.filter(p=>p.a>0&&p.y>-20);
      for(const p of T.ck){ if(p.sp){ D.fillStyle=`rgba(255,210,90,${Math.max(0,p.a).toFixed(3)})`; D.fillRect(Math.round(p.x),Math.round(p.y),2,2); } else { D.fillStyle=`rgba(52,48,60,${Math.max(0,p.a*.9).toFixed(3)})`; D.beginPath(); D.arc(p.x,p.y,Math.max(0,p.r),0,7); D.fill(); } }
      if(last&&T.cf) for(const f of T.cf){ const k=Math.max(0,f.a), hh=f.h*k, wv=Math.sin(t*20+f.x)*3; D.fillStyle=`rgba(255,${Math.round(90+120*k)},40,${(.85*k).toFixed(3)})`; D.beginPath(); D.moveTo(f.x-8*k,f.y); D.lineTo(f.x+wv,f.y-hh); D.lineTo(f.x+8*k,f.y); D.fill();
          if(k>.6){ D.fillStyle=`rgba(255,240,170,${(.7*k).toFixed(3)})`; D.fillRect(Math.round(f.x-1),Math.round(f.y-hh*.4),2,Math.max(1,Math.round(hh*.3))); } }
      if(last&&Math.floor(t*3)%2){ D.fillStyle='rgba(255,30,40,.18)'; D.fillRect(0,4,w,h); uText('⚠ WARNING',w/2,22,`900 15px ${FB}`,'#ff4a4a','center'); } }
  }
  if(dead>=0){ // the cockpit blows up, then the feed dies
    if(dead<1.4){ const k=dead/1.4; for(let i=0;i<7;i++){ const a=i*.9+1, r=Math.max(0,(18+i*9)*Math.min(1,dead*3)*(1-k*.3)); D.fillStyle=['#ffffff','#ffe08a','#ff9a3a','#ff4a2a','#5a2a1a'][Math.min(4,Math.floor(k*4+i%2))]; D.beginPath(); D.arc(w/2+Math.cos(a*3)*i*7,h*.55+Math.sin(a*2)*i*5,r,0,7); D.fill(); }
      for(let i=0;i<14;i++){ const a=i/14*6.283, d=dead*(90+twP5Rand(i)*80); D.fillStyle=i%2?'#3a2e4e':'#ffb04a'; D.fillRect(Math.round(w/2+Math.cos(a)*d),Math.round(h*.55+Math.sin(a)*d+dead*dead*60),4,3); } }
    else { D.fillStyle='#08060c'; D.fillRect(0,4,w,h); for(let i=0;i<220;i++){ const v=Math.floor(Math.random()*80); D.fillStyle=`rgb(${v},${v},${v})`; D.fillRect(Math.floor(Math.random()*w),4+Math.floor(Math.random()*h),2,1); } uText('SIGNAL LOST',w/2,h/2,`900 18px ${FB}`,'#ff6a6a','center'); } }
  D.restore(); D.save(); D.strokeStyle='#e3b65a'; D.lineWidth=2; D.strokeRect(Math.round(x+jx)-1,Math.round(y+jy)+3,w+2,h-2); D.restore(); }


// the Hamza song keeps going through this section's cutscenes (they used to switch to the requiem)
(function(){ const pl=Sound.play; Sound.play=function(name){ if(name==='requiem'&&Game.mech&&MP3.want&&MP3.want.name==='hamza') return; return pl.apply(this,arguments); }; })();
// ---------- subtitles in the bullet hell: off the playfield (your ship sits low; the usual bottom-centre box could cover your hitbox) ----------
// in the empty left panel when it's wide enough, otherwise along the top edge of the field
(function(){ const ds=drawSubtitle; drawSubtitle=function(){ const s=Game.subtitle, T=Game.mech&&Game.mech.th; if(!s||Game.dlg||!T||!(T.panel>.01)) return ds.apply(this,arguments);
    try{ s.t+=1/60; if(s.t>2.6){ Game.subtitle=null; return; } const F=thField(), nm=NAMES[s.who]||'', side=F.x-32>=170;
      const x=side?16:F.x+10, w=side?F.x-32:F.w-20; D.save(); D.globalAlpha=Math.min(1,(2.6-s.t)*3)*Math.min(1,T.panel);
      D.font=`600 17px ${FB}`; const lines=wrap(s.text,w-20), lh=22, h=(nm?26:8)+lines.length*lh+10, y=side?Math.round(UH*.42-h/2):F.y+8;
      D.fillStyle='rgba(8,4,14,.82)'; D.fillRect(x,y,w,h); D.fillStyle='#e3b65a'; D.fillRect(x,y,w,2);
      let ty=y+8; if(nm){ uText(nm,x+10,ty+14,`800 15px ${FB}`,'#f3dfae'); ty+=22; } D.font=`600 17px ${FB}`; D.fillStyle='#f6f0ff'; D.textAlign='left'; lines.forEach((l,i)=>D.fillText(l,x+10,ty+16+i*lh)); D.restore(); }
    catch(e){ console.error('th subtitle',e); return ds.apply(this,arguments); } }; })();
