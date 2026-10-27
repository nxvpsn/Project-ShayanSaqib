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
// The right panel shows Nathan in his cockpit (thCockpit): he flinches when hit, it smokes on his last life, it explodes when he dies.
// =====================================================================
const TH={W:9,H:12,CX:-6,CZ:26,DZ:14,VH:8.6,HS:.42,HIT:.15,GRAZE:1.05,LIVES:5,FULL:1.5,HP:[0,170,210]};
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
  const bit=mk(16,(c)=>{ c.fillStyle='#0c1424'; c.fillRect(6,1,4,1); c.fillRect(5,2,6,9); c.fillRect(4,11,8,3); c.fillStyle='#5d6f9e'; c.fillRect(6,2,4,9); c.fillStyle='#8fa0c8'; c.fillRect(6,3,1,7); c.fillStyle='#3a4670'; c.fillRect(5,11,6,2);
    c.fillStyle='#3ff4ff'; c.fillRect(7,0,2,2); c.fillStyle='#d8ffff'; c.fillRect(7,0,1,1); c.fillStyle='#3ff4ff'; c.fillRect(6,13,4,2); });
  const eld=(fr)=>mk(32,(c)=>{ c.strokeStyle='#1a0420'; c.lineWidth=3; for(let k=0;k<6;k++){ const a=Math.PI*.15+k*Math.PI*.14, w=Math.sin(fr*2+k)*3; c.beginPath(); c.moveTo(16,18); c.quadraticCurveTo(16+Math.cos(a)*10+w,18+Math.sin(a)*8,16+Math.cos(a)*14-w,18+Math.sin(a)*13); c.stroke(); }
    c.strokeStyle='#6a1a7a'; c.lineWidth=1.5; for(let k=0;k<6;k++){ const a=Math.PI*.15+k*Math.PI*.14, w=Math.sin(fr*2+k)*3; c.beginPath(); c.moveTo(16,18); c.quadraticCurveTo(16+Math.cos(a)*10+w,18+Math.sin(a)*8,16+Math.cos(a)*14-w,18+Math.sin(a)*13); c.stroke(); }
    c.fillStyle='#1a0420'; c.beginPath(); c.arc(16,14,11,0,7); c.fill(); c.fillStyle='#4a1050'; c.beginPath(); c.arc(16,14,9.5,0,7); c.fill(); c.fillStyle='#f4e8d8'; c.beginPath(); c.ellipse(16,14,7,5.5,0,0,7); c.fill();
    c.fillStyle='#ff2a4a'; c.beginPath(); c.arc(16+(fr?1:-1),14,3.4,0,7); c.fill(); c.fillStyle='#120008'; c.fillRect(15+(fr?1:-1),11,2,6); c.fillStyle='#fff'; c.fillRect(13,11,2,2); });
  TH_TEX={bit,eld:[eld(0),eld(1)]}; return TH_TEX; }
function thPlane(size,map){ const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({map,transparent:true,alphaTest:.4,depthWrite:false,fog:false})); m.renderOrder=6; m.rotation.z=-Math.PI/2; scene.add(m); return m; }

// ---------- setup / teardown ----------
function thClear(T){ if(!T) return; for(const m of T.mn) scene.remove(m.mesh); for(const b of T.bits) scene.remove(b.mesh); T.mn=[]; T.bits=[]; T.eb=[]; T.pb=[]; T.items=[]; if(T.drillD) T.drillD.dead=1; }
function thHzPose(k){ const v=L.vd; if(!v) return; const T=Game.mech&&Game.mech.th, sw=T?T.sway:0, f=(TH.CZ+TH.DZ)/TH.CZ;
  v.hz.position.set(lerp(14,TH.CX+TH.VH*f,k),lerp(1,-sw*f,k),-14); v.hz.rotation.set(0,0,-Math.PI/2*k); v.hz.scale.setScalar(lerp(1,TH.HS,k)); }
// touch: the sword button shoots (auto-fire; hold to charge the Power Shot), the shield button focuses
function thTouchButtons(on){ try{ const a=document.getElementById('tbAttack'), g=document.getElementById('tbGuard'); if(!a||!g||!a.dataset) return;
  if(on){ if(a.dataset.thOrig==null){ a.dataset.thOrig=a.innerHTML; a.dataset.thLab=a.getAttribute('aria-label')||''; } a.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/></svg>'; a.setAttribute('aria-label','Shoot (automatic), hold to charge a Power Shot');
    g.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>'; g.setAttribute('aria-label','Focus: hold to slow down'); }
  else if(a.dataset.thOrig!=null){ a.innerHTML=a.dataset.thOrig; a.setAttribute('aria-label',a.dataset.thLab); delete a.dataset.thOrig; } }catch(e){} }
function thSetup(ph,animate){ const G=Game.mech, N=NAT; if(!G||!N||!L.vd) return; thClear(G.th);
  const T=G.th={ph,t:0,eb:[],pb:[],mn:[],items:[],bits:[],sway:0,gen:null,wait:1.2,spell:null,si:-1,lives:TH.LIVES,score:G.thScore||0,power:2,graze:G.thGraze||0,
    fire:0,hold:0,pk:1,cam:null,panel:animate?0:1,ready:!animate,miss:0,spellMiss:0,bonus:null,tip:null,shield:0};
  const B=G.boss; if(B){ B.hp=B.maxHp=TH.HP[ph]||TH.HP[2]; B.vuln=true; }
  N.tu=0; N.tv=-8; N.x=TH.CX+N.tv; N.y=-N.tu; N.vx=N.vy=0; N.qb=0; N.inv=animate?99:2; N.boostN=3; N.charge=N.shot=0; N.atk=null; N.pull=0; N.show=1; N.sp=N.sp||0;
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
  let [ix,iz]=ctl?inputVec():[0,0]; const iv=-iz, foc=ctl&&!!held.block; T.focus=foc;
  consume('dash'); /* no dash in the bullet hell */
  const sp=foc?4.8:11.5; let vu,vv; if(N.qb>0){ N.qb-=dt; vu=N.qbx*34; vv=N.qby*34; } else { vu=ix*sp; vv=iv*sp; }
  N.tu=clamp(N.tu+vu*dt,-TH.W+.45,TH.W-.45); N.tv=clamp(N.tv+vv*dt,-TH.H+.7,TH.VH-6.5*TH.K-2.2);
  [N.x,N.y]=thW(N.tu,N.tv);
  // shooting: hold to fire a needle stream; a full charge releases a Power Shot
  if(ctl&&(held.attack||IS_TOUCH())){ T.fire-=dt; if(held.attack){ const b=T.hold; T.hold+=dt; if(b<TH.FULL&&T.hold>=TH.FULL){ Sound.sfx('ready'); thFx(N.tu,N.tv+.6,14,0x8fd0ff,3,.25); } }
    if(T.fire<=0){ T.fire=.07; const n=1+Math.floor(T.power), spread=foc?.08:.2; for(let k=0;k<=n;k++){ const o=(k-n/2); T.pb.push({u:N.tu+o*(foc?.18:.3),v:N.tv+.5,vu:o*spread*20,vv:46,r:.16,col:0x8ff8ff,dmg:.042,t:0}); } if(Math.random()<.4) Sound.sfx('mechshot'); } }
  if(!(ctl&&held.attack)){ if(T.hold>=TH.FULL&&ctl) thPowerShot(); T.hold=0; if(!(ctl&&IS_TOUCH())) T.fire=0; }
  if(ctl&&consume('special')){ if(N.sp>=100) run(thDrill); else { Sound.sfx('block'); Game.dmgNums.push({x:N.x+1.5,y:N.y,z:0,n:'DRILL '+Math.floor(N.sp)+'%',t:0,col:'#8fc8ff'}); } }
  // engine sparks, behind him (screen-down)
  if(Math.random()<.7){ const [x,y]=thW(N.tu+rnd(-.12,.12),N.tv-.55); FX.spawn(x,y,.2,-rnd(4,8),rnd(-.5,.5),0,.18,Math.random()<.5?0x3ff4ff:0xbff8ff,rnd(.12,.22),0,true); } }
function thPowerShot(){ const N=NAT, T=Game.mech.th; T.pb.push({u:N.tu,v:N.tv+.8,vu:0,vv:30,r:.95,col:0x3a8aff,dmg:3.2,pierce:true,hit:new Set(),t:0,big:1});
  Sound.sfx('beam'); Sound.sfx('mechshot'); shake(.25); thFx(N.tu,N.tv+.8,30,0x3a8aff,7,.35); thFx(N.tu,N.tv+.8,16,0xffffff,5,.25); }
function thBits(dt){ const N=NAT, T=Game.mech.th; for(const b of T.bits){ b.wt-=dt;
    if(T.focus){ const a=T.t*2.4+b.i*Math.PI/2; b.tu=N.tu+Math.cos(a)*1.2; b.tv=N.tv+.4+Math.sin(a)*.5; }
    else if(b.wt<=0){ b.wt=rnd(.8,1.6); b.tu=clamp(N.tu+rnd(-6,6),-TH.W+.8,TH.W-.8); b.tv=clamp(rnd(-TH.H+1.5,-1.5),-TH.H+1,-1); }
    b.u=lerp(b.u,b.tu,Math.min(1,dt*(T.focus?9:2.2))); b.v=lerp(b.v,b.tv,Math.min(1,dt*(T.focus?9:2.2)));
    // fire at the nearest minion, else at Hamza
    let tg=null,bd=1e9; for(const m of T.mn){ if(m.hp<=0) continue; const d=Math.hypot(m.u-b.u,m.v-b.v); if(d<bd){ bd=d; tg=m; } } const C=thBossC(), tu=tg?tg.u:C.u+rnd(-2,2), tv=tg?tg.v:C.v-1.5;
    const ta=Math.atan2(tv-b.v,tu-b.u); b.ang=ta; b.cd-=dt;
    if(T.ready&&!T.drill&&Game.state==='play'&&b.cd<=0){ b.cd=(T.focus?.55:1.05)+rnd(0,.4); T.pb.push({u:b.u,v:b.v,vu:Math.cos(ta)*38,vv:Math.sin(ta)*38,r:.2,col:0x3ff4ff,dmg:.1,t:0}); thFx(b.u,b.v,4,0x3ff4ff,2,.15); }
    const [x,y]=thW(b.u,b.v); b.mesh.position.set(x,y,.35); const dx=Math.sin(ta), dy=-Math.cos(ta); b.mesh.rotation.z=Math.atan2(-dx,dy); b.mesh.visible=!!N.show&&T.pk<.5; } }
function thHurt(){ const N=NAT, G=Game.mech, T=G.th; if(N.inv>0||Game.state!=='play'||T.drill) return; T.miss++; T.spellMiss++;
  N.flash=.3; shake(.6); Sound.sfx('hurt'); Sound.sfx('crash'); thFx(N.tu,N.tv,40,0xff5a8a,8,.35); thFx(N.tu,N.tv,24,0xffffff,6,.3); FX.flash=.25; grade.uniforms.flashCol.value.set(1,.2,.3);
  // Touhou-style: losing a life clears the bullets around you
  for(const b of T.eb) if(Math.hypot(b.u-N.tu,b.v-N.tv)<5){ b.dead=1; thFx(b.u,b.v,2,0xffffff,1,.15); }
  if(!TW.god) T.lives--; N.inv=2.4; T.hitT=performance.now();
  if(T.lives<0){ T.lives=0; T.deadT=performance.now(); thFx(N.tu,N.tv,90,0x3ff4ff,12,.5); Sound.sfx('crossboom'); N.show=0; G.thScore=0; Game.onDeath(); }
  else if(Math.random()<.4) Voice.bark(Math.random()<.5?'nhurt1':'nhurt2'); }

// ---------- the Heavenly Drill: one line, the drill grows over his head, then flies up and hits the whole screen ----------
function* thDrill(){ const N=NAT, G=Game.mech, T=G.th, B=G.boss; if(!T) return; N.sp=0; T.drill=1; N.inv=99; T.hold=0;
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
  if(B){ const was=B.vuln; B.vuln=true; B.flash=1.2; const c=thBossC(), [bx,by]=thW(c.u,c.v); mechDamage(B.maxHp*.12,bx,by,0,true); if(!was&&B.hp>0) B.vuln=false; }
  for(let k=0;k<8;k++){ shake(1.3-k*.12); FX.flash=k%2?.8:.2; grade.uniforms.flashCol.value.set(.5,.9,1); yield wait(.06); }
  d.dead=1; T.drillD=null; T.slow=1; T.drill=0; if(Game.mech&&Game.mech.th===T) N.inv=1.2; }

// ---------- minions ----------
function thMinion(kind,u,v,fn,o){ const T=Game.mech.th, TX=thTex(); const pig=kind==='pig', mesh=thPlane(pig?1.5:2.1,pig?pigletTex()[0]:TX.eld[0]);
  const m=Object.assign({kind,u,v,vu:0,vv:0,hp:pig?1.3:6,maxHp:pig?1.3:6,r:pig?.6:.95,t:0,mesh,fn,cd:rnd(.6,1.4),flash:0},o||{}); T.mn.push(m); thFx(u,v,8,pig?0xff8aa8:0xb06aff,3,.25); return m; }
function thKill(m){ const T=Game.mech.th; m.hp=0; thFx(m.u,m.v,26,m.kind==='pig'?0xff5a8a:0xb06aff,6,.35); thFx(m.u,m.v,10,0x1a0420,4,.4); Sound.sfx('gore'); T.score+=m.kind==='pig'?2000:6000; NAT.sp=Math.min(100,NAT.sp+(m.kind==='pig'?3:8));
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
// eldritch eye: drifts to a spot, then fires rings and aimed lines
function thEldHover(tu,tv,o){ o=o||{}; return (m,dt)=>{ m.vu=(tu-m.u)*2.5; m.vv=(tv-m.v)*2.5; m.cd-=dt; if(m.cd>0||m.t<1) return; m.cd=o.rate||1.9; m.k=(m.k||0)+1;
  if(m.k%2){ for(let i=0;i<16;i++) thB(m.u,m.v,i/16*6.283+m.k*.2,3.6,{col:0xb06aff,r:.26}); } else { const a=thAim(m.u,m.v); for(let j=0;j<7;j++) thB(m.u,m.v,a,5+j*.7,{col:0xff3aff,r:.2}); }
  if(o.leave&&m.t>o.leave){ m.fn=(mm)=>{ mm.vv=6; }; } }; }

// ---------- attack patterns (TH_SPELLS: name, seconds, pattern key; names only show in Debug Mode) ----------
const TH_SPELLS={
  1:[['Snout Spiral',22,'spiral'],['Feeding Trough',16,'trough'],['Oink-Oink Crossfire',22,'cross'],['Piglet Parade',22,'parade'],['Bacon Downpour',22,'rain'],['Event Horizon',22,'horizon']],
  2:[['Eight Billion Lullabies',24,'lullaby'],['Eyes That Keep the Pig',30,'ward'],['Narrow Throat',18,'throat'],['Mitosis',22,'mitosis'],['Six Skeletal Wings',24,'wings'],['Oink Oink Oink',99,'final']]};
const TH_PAT={
  *spiral(T){ let a=0; for(;;){ const m=thMouth(); T.jaw=.5; for(let k=0;k<5;k++) thB(m.u,m.v,a+k*1.2566,5.2,{col:0xff5a8a,r:.28}); for(let k=0;k<5;k++) thB(m.u,m.v,-a*1.3+k*1.2566+.6,3.8,{col:0xb06aff,r:.22}); a+=.21; yield .1; } },
  *trough(T){ T.tip='Hold '+K('block')+' to focus, then slide along with the gap'; let gu=0, dir=1; const row=()=>{ for(let k=0;;k++){ const o=.85+k*.8, l=gu-o, r=gu+o; if(l<-TH.W-.3&&r>TH.W+.3) break; if(l>=-TH.W-.3) thB(l,TH.H+.6,-Math.PI/2,9,{col:0x7ab8ff,r:.2}); if(r<=TH.W+.3) thB(r,TH.H+.6,-Math.PI/2,9,{col:0x7ab8ff,r:.2}); } };
    for(;;){ row(); gu+=dir*.35; if(Math.abs(gu)>TH.W-1.6){ dir=-dir; gu=clamp(gu,-(TH.W-1.6),TH.W-1.6); } yield .07; } },
  *cross(T){ for(let w=0;;w++){ const e=thEye(w%2?1:-1), a0=thAim(e.u,e.v); for(let k=-3;k<=3;k++) thB(e.u,e.v,a0+k*.16,7.2,{col:0xff3a3a,r:.24});
      if(w%3===0){ const m=thMouth(); T.jaw=.7; for(let k=0;k<28;k++) thB(m.u,m.v,k/28*6.283+w*.1,2.8,{col:0xffd04a,r:.3}); } Sound.sfx('swing'); yield .34; } },
  *parade(T){ for(let w=0;w<4;w++){ const side=w%2?1:-1; for(let i=0;i<6;i++) thMinion('pig',side*(TH.W+1),TH.H-1-i*.2,thPigCurve(side,i*.28));
      for(let k=0;k<6;k++){ const m=thMouth(); for(let j=0;j<20;j++) thB(m.u,m.v,j/20*6.283+k*.15+w,2.6,{col:0xff8ab0,r:.26}); yield .9; } } for(;;) yield 1; },
  *rain(T){ for(let w=0;;w++){ for(let i=0;i<9;i++) thB(rnd(-TH.W,TH.W),TH.H+.5,-Math.PI/2+rnd(-.15,.15),rnd(4,7),{col:i%3?0xff9a5a:0xffd0a0,r:rnd(.18,.3)});
      if(w%6===0){ const m=thMouth(), a=thAim(m.u,m.v); T.jaw=.8; for(let k=-1;k<=1;k++) thB(m.u,m.v,a+k*.3,4.5,{col:0xff2a3a,r:.65}); Sound.sfx('howl'); } yield .14; } },
  *horizon(T){ T.pull=1; for(let w=0;;w++){ const m=thMouth(); for(let i=0;i<14;i++){ const a=i/14*6.283+w*.23, R=12, u=m.u+Math.cos(a)*R, v=m.v+Math.sin(a)*R; thB(u,v,a+Math.PI-.5,2.6,{col:0x9a5aff,r:.24,curl:.35,life:8}); }
      if(w%4===0){ const a=thAim(m.u,m.v); for(let k=0;k<5;k++) thB(m.u,m.v,a,4+k*.6,{col:0xff5a8a,r:.3}); } yield .45; } },
  *lullaby(T){ let a=0,b=0; for(let w=0;;w++){ const m=thMouth(); T.jaw=.6; for(let k=0;k<8;k++){ thB(m.u,m.v,a+k*.785,4.6,{col:0xff4a7a,r:.24}); thB(m.u,m.v,b+k*.785+.39,3.4,{col:0x6ab0ff,r:.24}); } a+=.13; b-=.17;
      if(w%12===0){ for(const i of [-1,1]){ const e=thEye(i), at=thAim(e.u,e.v); for(let k=-2;k<=2;k++) thB(e.u,e.v,at+k*.12,8,{col:0xffffff,r:.2}); } } yield .1; } },
  *ward(T){ T.tip='Hamza is shielded: kill the eyes!'; Sound.sfx('howl'); for(let i=0;i<4;i++) thMinion('eld',-6+i*4,TH.H+1,thEldHover(-6+i*4,3.2+(i%2)*1.4,{rate:2.1}),{shield:1,hp:7,maxHp:7});
      for(let w=0;;w++){ if(!T.shield&&w>4) break; if(w%5===4) thMinion('pig',rnd(-6,6),TH.H,thPigDive); const m=thMouth(); for(let j=0;j<14;j++) thB(m.u,m.v,j/14*6.283+w*.2,3,{col:0xff8ab0,r:.24}); yield .8; }
      const B=Game.mech.boss; if(B){ B.flash=1; } T.tip=null; Sound.sfx('glass'); Game.dmgNums.push({x:TH.CX+TH.VH,y:0,z:0,n:'SHIELD BROKEN',t:0,big:true,col:'#ffd45a'}); T.stun=4; yield 1.6; yield* TH_PAT.meatball(T); },
  // MEATBALL MAYHEM (after the shield breaks): he is FURIOUS; big meatballs bounce off the walls three times and burst into rings on every bounce,
  // while the eyes curl white fans in from the sides
  *meatball(T){ T.tip='He is FURIOUS. Meatballs bounce off the walls!'; Sound.sfx('howl'); for(let w=0;;w++){ const m=thMouth(), a=thAim(m.u,m.v)+rnd(-.55,.55); T.jaw=1;
      thB(m.u,m.v,a,5.4,{col:0xc0603a,r:.72,bounce:3,life:14,onB:b=>{ for(let j=0;j<9;j++) thB(b.u,b.v,j/9*6.283+b.t,2.5,{col:0xffb08a,r:.2}); thFx(b.u,b.v,8,0xff8a5a,3,.2); Sound.sfx('squelch'); }});
      if(w%2===1){ for(const i of [-1,1]){ const e=thEye(i); for(let k=0;k<4;k++) thB(e.u,e.v,-Math.PI/2+i*(.3+k*.22),4.6,{col:0xffffff,r:.21,curl:-i*.28}); } }
      if(w%5===4) thMinion('pig',rnd(-6,6),TH.H,thPigDive); yield 1.05; } },
  *throat(T){ T.tip='Focus ('+K('block')+') and thread the throat'; let t=0; for(;;){ const gu=Math.sin(t*1.35)*5.2+Math.sin(t*.55)*1.6, gw=1.05;
      for(let k=0;;k++){ const o=gw+k*.75, l=gu-o, r=gu+o; if(l<-TH.W-.3&&r>TH.W+.3) break; if(l>=-TH.W-.3) thB(l,TH.H+.6,-Math.PI/2,8,{col:0xff6a9a,r:.2}); if(r<=TH.W+.3) thB(r,TH.H+.6,-Math.PI/2,8,{col:0xff6a9a,r:.2}); }
      t+=.085; yield .085; } },
  *mitosis(T){ for(let w=0;;w++){ const m=thMouth(), a=thAim(m.u,m.v)+rnd(-.3,.3); T.jaw=.9; thB(m.u,m.v,a,3.6,{col:0xff2a5a,r:.8,split:.9+rnd(0,.4)}); Sound.sfx('squelch'); if(w%3===2){ for(const i of [-1,1]){ const e=thEye(i); thB(e.u,e.v,thAim(e.u,e.v),5.5,{col:0xffd04a,r:.5,split:.7}); } } yield .75; } },
  *wings(T){ let a=0; for(let w=0;;w++){ const C=thBossC(); for(let i=0;i<6;i++){ const side=i%2?1:-1, lv=Math.floor(i/2), u=C.u+side*(4.5+lv*1.6), v=C.v-1-lv*1.2; thB(u,v,-Math.PI/2+side*(.5+Math.sin(a+i)*.6),4.2,{col:[0xff5a5a,0xff9a5a,0xb06aff][lv],r:.22,curl:-side*.35}); }
      a+=.12; if(w%25===0){ const m=thMouth(); for(let j=0;j<24;j++) thB(m.u,m.v,j/24*6.283,3.2,{col:0xffffff,r:.28}); } yield .09; } },
  *final(T){ let a=0; Sound.sfx('howl'); for(let w=0;;w++){ const m=thMouth(); T.jaw=.9; for(let k=0;k<6;k++) thB(m.u,m.v,a+k*1.047,4.4,{col:0xff3a5a,r:.24}); a+=.19;
      if(w%8===0){ for(const i of [-1,1]){ const e=thEye(i), at=thAim(e.u,e.v); for(let k=-2;k<=2;k++) thB(e.u,e.v,at+k*.18,7,{col:0xffffff,r:.22}); } }
      if(w%30===0) thMinion('pig',rnd(-6,6),TH.H,thPigDive); if(w%3===0) thB(rnd(-TH.W,TH.W),TH.H+.5,-Math.PI/2,5,{col:0xff9a5a,r:.22}); yield .1; } } };
function* thBossLoop(T){ const B=Game.mech.boss, list=TH_SPELLS[T.ph]||TH_SPELLS[2]; yield 1.4;
  for(let n=0;;n++){ let i=n%(list.length-(T.ph===2?1:0)); if(T.ph===2&&B&&B.hp<=B.maxHp*.28) i=list.length-1; let ent=list[i]; if(T.dbgSpell){ ent=TH_SPELLS[1].concat(TH_SPELLS[2]).find(s=>s[2]===T.dbgSpell)||ent; if(!T.dbgLoop) T.dbgSpell=null; } const [name,dur,key]=ent; // debug mode can pick the spell
    T.spell={name,dur,t:0,key}; T.spellMiss=0; T.tip=null; T.pull=0; T.stun=0; Sound.sfx('secret'); Game.cineMark='spell';
    const g=TH_PAT[key](T); let el=0; for(;;){ const s=g.next(); if(s.done) break; const w=s.value||.1; yield w; el+=w; if(el>=dur) break; if(key!=='final'&&T.ph===2&&B&&B.hp<=B.maxHp*.28&&!T.dbgSpell) break; }
    // pattern over: the bullets fizzle, a bonus if no life was lost
    for(const b of T.eb){ if(Math.random()<.3) thFx(b.u,b.v,2,0xffffff,1,.2); } T.eb=[]; T.pull=0; T.tip=null; for(const m of T.mn){ if(m.hp>0) thFx(m.u,m.v,8,0xb06aff,3,.25); m.gone=1; }
    if(!T.spellMiss&&key!=='final'){ const bonus=(T.ph*1000000)+Math.round(Math.max(0,dur-el)*20000); T.score+=bonus; T.bonus={t:0,n:bonus}; Sound.sfx('ready'); } T.spell=null; yield 1.3; } }

// ---------- per-frame ----------
function thUpdate(dt){ const G=Game.mech, T=G.th, N=NAT, v=L.vd; T.t+=dt; const sl=T.slow||1;
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
      else if(!b.gz&&d<b.r+TH.GRAZE&&T.ready){ b.gz=1; T.graze++; T.score+=500; N.sp=Math.min(100,N.sp+.9); if(T.graze%2===0) Sound.tone('square',2200,2600,.025,.035); const [x,y]=thW(hu+(b.u-hu)*.5,hv+(b.v-hv)*.5); FX.spawn(x,y,.4,rnd(-3,3),rnd(-3,3),0,.15,0xffffff,.16,0,true); } }
    [b.x,b.y]=thW(b.u,b.v); b.z=0; }
  T.eb=T.eb.filter(b=>!b.dead);
  // Event Horizon pulls you toward the mouth
  if(T.pull&&play&&N.qb<=0){ const m=thMouth(), du=m.u-N.tu, dv=m.v-N.tv, d=Math.hypot(du,dv)||1; N.tu+=du/d*1.6*dt; N.tv=Math.min(N.tv+dv/d*1.6*dt,TH.VH-6.5*TH.K-2.2); }
  // player bullets
  const C=thBossC(); for(const p of T.pb){ p.t+=dt; p.u+=p.vu*dt; p.v+=p.vv*dt; if(p.v>TH.H+2||p.u<-TH.W-1||p.u>TH.W+1){ p.dead=1; continue; }
    if(p.big&&Math.random()<.9){ const [x,y]=thW(p.u+rnd(-.4,.4),p.v-.6); FX.spawn(x,y,.3,-rnd(3,8),rnd(-1,1),0,.25,Math.random()<.5?0x3a8aff:0xbff8ff,rnd(.3,.6),0,true); }
    for(const m of T.mn){ if(m.hp<=0||(p.hit&&p.hit.has(m))) continue; if(Math.hypot(m.u-p.u,m.v-p.v)<m.r+p.r){ m.hp-=p.big?6:p.dmg*6; m.flash=.08; T.score+=100; if(m.hp<=0) thKill(m); if(p.pierce) p.hit.add(m); else { p.dead=1; break; } } }
    if(p.dead) continue;
    if(B&&p.v>C.v-4.6&&Math.hypot(p.u-C.u,(p.v-C.v)*.8)<4.4&&!(p.hit&&p.hit.has(B))){ const [x,y]=thW(p.u,p.v); const was=B.hp; mechDamage(p.dmg*(T.stun>0?1.5:1),x,y,0,!!p.big); if(B.hp<was){ T.score+=Math.round((was-B.hp)*1000); N.sp=Math.min(100,N.sp+(p.big?4:.06)); } if(p.pierce) p.hit.add(B); else p.dead=1; } }
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
  uText('Drill',R0,y,`700 15px ${FB}`,'#b9a8d8'); const dw=RW-60; uRR(R0+60,y-11,dw,12,6); D.fillStyle='rgba(255,255,255,.08)'; D.fill(); uRR(R0+60,y-11,Math.max(6,dw*N.sp/100),12,6); D.fillStyle=N.sp>=100?`hsl(${195+Math.sin(T.t*8)*20},100%,65%)`:'#3a8aff'; D.fill(); y+=22;
  uText(N.sp>=100?K('special')+'  HEAVENLY DRILL READY':Math.floor(N.sp)+'%',R0+RW,y,`800 12px ${FB}`,N.sp>=100?'#9ff8ff':'#8f95ab','right'); y+=26;
  row('Graze',String(T.graze),'#fff');
  uText('Shot',R0,y,`700 15px ${FB}`,'#b9a8d8'); const cw=RW-60, ck=clamp(T.hold/TH.FULL,0,1); uRR(R0+60,y-11,cw,12,6); D.fillStyle='rgba(255,255,255,.08)'; D.fill(); if(ck>0){ uRR(R0+60,y-11,Math.max(6,cw*ck),12,6); D.fillStyle=ck>=1?'#9ff8ff':'#5a8aff'; D.fill(); }
  y+=22; uText(ck>=1?'POWER SHOT · release':tch?'hold Shoot to charge':'hold '+K('attack')+' to charge',R0+RW,y,`700 12px ${FB}`,ck>=1?'#9ff8ff':'#8f95ab','right'); y+=18;
  try{ const ch=Math.min(RW*.8,(tch?UH/ps:UH)-y-24); if(ch>60) thCockpit(R0,y,RW,ch,T,N); }catch(e){ console.error('cockpit',e); } D.restore();
  // left panel: the boss and the controls
  let L0=28, LW=fx-56, ly=46; D.save(); if(tch){ D.translate(L0,0); D.scale(ps,ps); L0=0; LW=LW/ps; } uCaps('BOSS',L0,ly,'#b9a8d8',11); ly+=34; uText('Hamza',L0,ly,`900 30px ${FD}`,'#f6dca0'); ly+=22; uText('the Endless Hunger',L0,ly,`italic 600 14px ${FB}`,'#b9a8d8'); ly+=30;
  uText('Phase '+['','I','II'][T.ph]+(T.ph===1?' · Gluttony':' · The Devourer'),L0,ly,`700 15px ${FB}`,'#fff'); ly+=34;
  if(T.shield){ uText('◆ SHIELDED · kill the eyes',L0,ly,`800 13px ${FB}`,'#ff8aff'); ly+=24; } else if(T.stun>0){ uText('◆ STUNNED · 1.5× damage',L0,ly,`800 13px ${FB}`,'#ffd45a'); ly+=24; }
  if(tch){ ly+=8; uCaps('TOUCH',L0,ly,'#b9a8d8',11); for(const l of ['Left thumb: move','Shoot fires by itself','Hold Shoot: Power Shot','Hold Focus: slow + hitbox','Drill (blue)']){ ly+=22; uText(l,L0,ly,`600 13px ${FB}`,'#d8d0f0'); } }
  else { ly=UH-206; uCaps('CONTROLS',L0,ly,'#b9a8d8',11); ly+=10; for(const [k,l] of [['WASD','Move'],[K('block'),'Focus (slow, hitbox)'],[K('attack'),'Shoot (hold: power shot)'],[K('special'),'Heavenly Drill']]){ ly+=28; const kw=uKey(k,L0,ly-5,false); uText(l,L0+kw+10,ly,`600 14px ${FB}`,'#d8d0f0'); } }
  D.restore();
  // boss bar across the top of the field
  const B=G.boss; if(B&&T.ready){ const k=clamp(B.hp/B.maxHp,0,1), bx=fx+10, bw=fw-20, byy=fy+10; D.fillStyle='rgba(0,0,0,.5)'; D.fillRect(bx,byy,bw,7); D.fillStyle=T.shield?'#b06aff':B.flash>0?'#fff':'#ff4a7a'; D.fillRect(bx,byy,bw*k,7);
    if(T.ph===2){ D.fillStyle='#ffd45a'; D.fillRect(bx+bw*.28-1,byy-3,2,13); } uText('HAMZA',bx,byy+24,`800 12px ${FB}`,'#ffd0e0'); }
  if(T.bonus){ const k=T.bonus.t; D.globalAlpha=a*Math.min(1,(2.6-k)*2); uText('No-Hit Bonus!',fx+fw/2,fy+fh*.32,`900 26px ${FB}`,'#ffd45a','center'); uText('+'+T.bonus.n.toLocaleString(),fx+fw/2,fy+fh*.32+28,`800 18px ${FB}`,'#fff','center'); D.globalAlpha=a; }
  if(T.tip&&T.ready){ uText(T.tip,fx+fw/2,fy+fh-18,`700 14px ${FB}`,'#bfe8ff','center'); }
  D.restore();
  // field furniture: the focus sigil, the hitbox dot
  D.save(); D.beginPath(); D.rect(fx,fy,fw,fh); D.clip();
  if(N.show&&T.ready){ const [sx,sy]=toScreen(N.x,N.y,0), [gx]=toScreen(N.x,N.y-TH.GRAZE,0), gr=Math.abs(gx-sx);
    if(T.focus){ D.save(); D.translate(sx,sy); D.rotate(T.t*1.6); D.strokeStyle='rgba(255,106,176,.75)'; D.lineWidth=1.5; D.strokeRect(-gr*.72,-gr*.72,gr*1.44,gr*1.44); D.rotate(-T.t*3.2); D.strokeRect(-gr*.72,-gr*.72,gr*1.44,gr*1.44); D.restore();
      D.strokeStyle='rgba(255,255,255,.35)'; D.beginPath(); D.arc(sx,sy,gr,0,7); D.stroke(); }
    if(T.hold>.15){ const ck=clamp(T.hold/TH.FULL,0,1); D.strokeStyle=ck>=1?'#9ff8ff':'rgba(90,140,255,.85)'; D.lineWidth=3; D.beginPath(); D.arc(sx,sy,15,-Math.PI/2,-Math.PI/2+ck*Math.PI*2); D.stroke(); }
    const r=T.focus?5:3.5; D.fillStyle='#ff2a4a'; D.beginPath(); D.arc(sx,sy,r+1.6,0,7); D.fill(); D.fillStyle='#fff'; D.beginPath(); D.arc(sx,sy,r,0,7); D.fill(); }
  D.restore(); }
// the play field on the UI canvas, from the play camera's fixed geometry (during camera moves the live projection is meaningless)
function thField(){ const ppu=(UH/2)/(TH.CZ*Math.tan(camera.fov*Math.PI/360)), w=Math.round(TH.W*2*ppu), h=Math.round(Math.min(UH,TH.H*2*ppu)); return {x:Math.round((UW-w)/2),y:Math.round((UH-h)/2),w,h}; }
function thStar(x,y,r,col){ D.fillStyle=col; D.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, rr=i%2?r*.45:r; D.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr); } D.closePath(); D.fill(); }

// ---------- hooks into the mech fight ----------
(function(){
  // the 3D "Dimension Break" phases are replaced: never enter them
  m3Enter=function(){};
  const smp=startMechPhase; startMechPhase=function(ph){ const G=Game.mech, resp=!!(G&&G._resp); smp(ph); if(!Game.mech) return; thSetup(Math.min(ph,2),!resp); };
  const mpe=mechPhaseEnd; mechPhaseEnd=function*(ph){ if(thOn()){ yield* thPhaseOut(ph); return; } yield* mpe(ph); };
  const um=updateMech; updateMech=function(dt){ const G=Game.mech; thGhosts(dt); if(G&&G.th&&L.vd){ for(const f of L.anim) f(dt); try{ thUpdate(dt); }catch(e){ console.error('touhou update',e); } return; } return um(dt); };
  const mc=mechCam; mechCam=function(dt){ if(thOn()) return thCam(); return mc(dt); };
  const dh=drawMechHUD; drawMechHUD=function(){ if(thOn()){ try{ thHUD(); }catch(e){ console.error('touhou hud',e); } return; } return dh(); };
  const nd=natDrill; natDrill=function*(){ if(thOn()){ yield* thDrill(); return; } yield* nd(); };
  const em=exitMech; exitMech=function(q){ const G=Game.mech; if(G&&G.th){ thClear(G.th); G.th=null; camera.up.set(0,1,0); } thTouchButtons(false); return em(q); };
  // the drill and the death-retry may clear temp scene objects: rebuild on respawn
  const mr=mechRespawn; mechRespawn=function(){ const G=Game.mech; if(G&&G.th){ thClear(G.th); G.th=null; } return mr(); }; })();
// ---------- Nathan's cockpit (right panel): flinches when hit, smokes on his last life, explodes when he dies ----------
function thCockpit(x,y,w,h,T,N){ thCockpitOn(D,x,y,w,h,T,N); }
function thCockpitOn(D,x,y,w,h,T,N){ const now=performance.now(), t=now/1000, hitK=T.hitT?Math.max(0,1-(now-T.hitT)/550):0, dead=T.deadT?(now-T.deadT)/1000:-1, last=T.lives<=0&&dead<0;
  let jx=0, jy=0; if(hitK>0){ jx=rnd(-6,6)*hitK; jy=rnd(-4,4)*hitK; } if(dead>=0&&dead<1.2){ jx=rnd(-9,9)*(1-dead/1.2); jy=rnd(-7,7)*(1-dead/1.2); }
  D.save(); D.translate(Math.round(x+jx),Math.round(y+jy)); uCaps('COCKPIT',0,-4,'#b9a8d8',11);
  D.beginPath(); D.rect(0,4,w,h-4); D.clip();
  // space through the canopy, stars streaking past
  const g=D.createLinearGradient(0,4,0,h); g.addColorStop(0,'#05030f'); g.addColorStop(1,'#1a0a2e'); D.fillStyle=g; D.fillRect(0,4,w,h);
  for(let i=0;i<26;i++){ const sx=(twP5Rand(i)*w+t*(60+twP5Rand(i+3)*90))%w, sy=4+twP5Rand(i+7)*h*.7; D.fillStyle=i%5?'rgba(220,220,255,.5)':'#ffffff'; D.fillRect(Math.round(sx),Math.round(sy),i%5?2:3,1); }
  if(dead<0||dead<.15){
    // Nathan in the seat (his portrait, pixel-scaled): flinches when hit, sweats on his last life
    const ex=hitK>.3?'surprised':last?'worried':'normal', pc=portrait('nathan',ex), ps=Math.max(1,Math.floor(Math.min(w*.62,h*.78)/56)), pw=56*ps, px=Math.round(w/2-pw/2+(hitK>0?-hitK*8:0)), py=Math.round(h-pw-h*.14+(hitK>0?hitK*4:0));
    D.fillStyle='#120c1c'; D.fillRect(Math.round(w/2-pw*.42),py+pw*.2,Math.round(pw*.84),h); /* the seat */
    D.imageSmoothingEnabled=false; if(pc&&pc.width) D.drawImage(pc,px,py,pw,pw);
    if(hitK>0){ D.fillStyle=`rgba(255,40,60,${(.45*hitK).toFixed(3)})`; D.fillRect(0,4,w,h); }
    // the console across the bottom, lights blinking (red when it is going badly)
    const cy=Math.round(h-h*.16); D.fillStyle='#1c1428'; D.fillRect(0,cy,w,h-cy); D.fillStyle='#2e2440'; D.fillRect(0,cy,w,3);
    for(let i=0;i<10;i++){ const on=(Math.floor(t*(last?6:2)+i*1.7)%3)>0; D.fillStyle=last?(on?'#ff3a3a':'#5a1010'):(on?(i%3?'#3ff4ff':'#8aff8a'):'#1a3a3a'); D.fillRect(Math.round(8+i*(w-16)/10),cy+8,6,4); }
    // canopy struts
    D.strokeStyle='#3a2e4e'; D.lineWidth=5; D.beginPath(); D.moveTo(0,cy); D.lineTo(w*.18,4); D.moveTo(w,cy); D.lineTo(w*.82,4); D.stroke(); D.strokeStyle='rgba(180,220,255,.12)'; D.lineWidth=2; D.beginPath(); D.moveTo(w*.3,10); D.lineTo(w*.1,cy-8); D.stroke();
    if(last){ // smoke and sparks out of the console, and the alarm
      T.ck=T.ck||[]; if(Math.random()<.5) T.ck.push({x:w*(.15+Math.random()*.7),y:cy,r:6+Math.random()*7,vy:-(22+Math.random()*30),vx:rnd(-8,8),a:.9,sp:Math.random()<.25});
      for(const p of T.ck){ p.y+=p.vy/60; p.x+=p.vx/60; p.r+=.25; p.a-=.009; } T.ck=T.ck.filter(p=>p.a>0&&p.y>-20);
      for(const p of T.ck){ if(p.sp){ D.fillStyle=`rgba(255,210,90,${Math.max(0,p.a).toFixed(3)})`; D.fillRect(Math.round(p.x),Math.round(p.y),2,2); } else { D.fillStyle=`rgba(52,48,60,${Math.max(0,p.a*.9).toFixed(3)})`; D.beginPath(); D.arc(p.x,p.y,Math.max(0,p.r),0,7); D.fill(); } }
      if(Math.floor(t*3)%2){ D.fillStyle='rgba(255,30,40,.18)'; D.fillRect(0,4,w,h); uText('⚠ WARNING',w/2,22,`900 15px ${FB}`,'#ff4a4a','center'); } }
  }
  if(dead>=0){ // the cockpit blows up, then the feed dies
    if(dead<1.4){ const k=dead/1.4; for(let i=0;i<7;i++){ const a=i*.9+1, r=Math.max(0,(18+i*9)*Math.min(1,dead*3)*(1-k*.3)); D.fillStyle=['#ffffff','#ffe08a','#ff9a3a','#ff4a2a','#5a2a1a'][Math.min(4,Math.floor(k*4+i%2))]; D.beginPath(); D.arc(w/2+Math.cos(a*3)*i*7,h*.55+Math.sin(a*2)*i*5,r,0,7); D.fill(); }
      for(let i=0;i<14;i++){ const a=i/14*6.283, d=dead*(90+twP5Rand(i)*80); D.fillStyle=i%2?'#3a2e4e':'#ffb04a'; D.fillRect(Math.round(w/2+Math.cos(a)*d),Math.round(h*.55+Math.sin(a)*d+dead*dead*60),4,3); } }
    else { D.fillStyle='#08060c'; D.fillRect(0,4,w,h); for(let i=0;i<220;i++){ const v=Math.floor(Math.random()*80); D.fillStyle=`rgb(${v},${v},${v})`; D.fillRect(Math.floor(Math.random()*w),4+Math.floor(Math.random()*h),2,1); } uText('SIGNAL LOST',w/2,h/2,`900 18px ${FB}`,'#ff6a6a','center'); } }
  D.restore(); D.save(); D.strokeStyle='#e3b65a'; D.lineWidth=2; D.strokeRect(Math.round(x+jx)-1,Math.round(y+jy)+3,w+2,h-2); D.restore(); }

