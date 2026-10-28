// =====================================================================
// ALI, REWORKED (the player's Ali; the AI and co-op Ali keep their own code)
// - Left click (attack): his own 3-hit combo, every cut drawn with the Judgement Cut tear (twGash):
//   1) one slash, twice Shayan's reach; 2) a double cut (two hits, a vertical and a horizontal tear);
//   3) a spin that hits all around him with the same reach. 5 banked parries: the next attack is a Judgement Cut.
// - Right click (block): Getsuga Tenshou (the same black-and-red crescent as Shayan's charged one); hold: the 3-stage charge (08d_alicharge.js), released at LV 1 / 2 / 3.
//   Alternating cut, Getsuga, cut, Getsuga... keeps his place in the combo and powers the Getsugas up: the 2nd is 1.5x with a gold
//   lining, the 3rd is 1.7x, a small Getsuga Jujishou, then it starts over. Mashing Getsuga (no cut between) is slower and 0.75x.
// - No guard / blade storm (no auto-parry): he parries like Shayan, by attacking right before a hit lands.
// - Teleport has no VFX (patched in build.py). Gliding: he rides a small Getsuga.
// - Ultimate: the Getsugas hung in the frozen air are small Getsuga Jujishous (aliHungJJ), and before time resumes he
//   makes one long Judgement Cut across half the screen (aliFinalCut).
// Base-game hooks are patched in build.py (aliInput is called from updatePlayer).
// =====================================================================
const ALI_R=3.8; // reach: double Shayan's swing
// each swing as quick as Shayan's (0.24s; it was .32/.38/.44), its hit windows scaled to match; the AI Ali in the twins' fight keeps the old pace (ALI_COMBO_AI)
const ALI_COMBO_AI=[{dur:.32,hits:[[.06,.15]],dmg:1.3,arc:1.25,anim:'aliS1'},{dur:.38,hits:[[.05,.12],[.18,.25]],dmg:1,arc:1.25,anim:'aliS2'},{dur:.44,hits:[[.08,.24]],dmg:2,arc:3.3,anim:'aliSpin'}];
const ALI_COMBO=ALI_COMBO_AI.map(C=>{ const k=.24/C.dur; return Object.assign({},C,{dur:.24,hits:C.hits.map(([a,b])=>[+(a*k).toFixed(3),+(b*k).toFixed(3)])}); });
function aliCombo(n){ const P=Player, tg=nearestFoe(ALI_R+1); if(tg) P.ang=Math.atan2(tg.z-P.z,tg.x-P.x); P.f=Math.cos(P.ang)>=0?1:-1; P.combo=n; P.swingT=Game.time;
  P.aliAtk={n,t:0,u:0,q:false,f0:P.f,ang:P.ang,sets:ALI_COMBO[n].hits.map(()=>new Set()),fx:0}; Sound.sfx('swing'); P.charge=0; P.gAct='b';
  if(P.onGround&&n<2&&!(Game.twins&&Game.twins.active)){ P.vx+=Math.cos(P.ang)*3; P.vz+=Math.sin(P.ang)*3; } }
// each cut is a Judgement Cut tear placed out in front (or around, for the spin), never over Ali
function aliSlashFX(n,i){ const P=Player, a=P.aliAtk; aliSlashFXAt(P.x,P.y,P.z,a&&a.ang!=null?a.ang:P.ang,n,i); }
function aliSlashFXAt(x,gy,z,ang,n,i){ const ux=Math.cos(ang), uz=Math.sin(ang); JC.flash=Math.max(JC.flash||0,.12);
  if(n===0) twGash({nodisp:1,life:.42,rev:.07,fade:.24,w:24,sparks:16,pts:()=>twArcPts(x,gy+1.1,z,ux,uz,ALI_R*.85,-1.05,1.05,7,true)});
  else if(n===1){ if(i===0) twGash({nodisp:1,life:.38,rev:.06,fade:.22,w:20,sparks:10,pts:()=>twArcPts(x+ux*1.5,gy+1.3,z+uz*1.5,ux,uz,1.9,1.15,-1.15,6)});
    else twGash({nodisp:1,life:.38,rev:.06,fade:.22,w:20,sparks:10,pts:()=>twArcPts(x,gy+1.2,z,ux,uz,ALI_R*.8,1,-1,6,true)}); }
  else twGash({nodisp:1,life:.48,rev:.15,fade:.24,w:22,sparks:26,pts:()=>twArcPts(x,gy+1,z,ux,uz,ALI_R*.85,-Math.PI,Math.PI,12,true)});
  Sound.sfx(n===2?'whoosh':'swing'); if(n===2) shake(.15); }
function aliAtkUpdate(dt){ const P=Player, a=P.aliAtk; if(!a) return; const C=ALI_COMBO[a.n]; a.t+=dt; a.u=Math.min(1,a.t/C.dur);
  // the swing keeps the aim it started with (the mouse), whatever direction he is running in
  if(a.ang!=null){ P.ang=a.ang; P.f=Math.cos(a.ang)>=0?1:-1; }
  C.hits.forEach(([t0,t1],i)=>{ if(a.t>=t0&&!(a.fx>>i&1)){ a.fx|=1<<i; aliSlashFX(a.n,i); } if(a.t>=t0&&a.t<t1) meleeHits(P.x,P.z,P.y,ALI_R,a.ang!=null?a.ang:P.ang,C.arc,C.dmg,a.sets[i]); });
  if(a.t>=C.dur){ P.aliAtk=null; P.f=a.f0; if(a.q) aliCombo((a.n+1)%3); else P.comboT=Math.max(.38,P.gAct==='g'?1.6-(Game.time-(P.gT||0)):0); } }
function aliInput(dt){ const P=Player;
  if(consume('attack')){ if((P.counter||0)>=5&&!Game.paulLock){ P.swingT=Game.time; twMiniJC(); } else if(!P.aliAtk) aliCombo(P.comboT>0?((P.combo||0)+1)%3:0); else if(P.aliAtk.t>.1) P.aliAtk.q=true; }
  consume('block'); /* the Getsuga fires on the release (08d: a tap = the base shot, the ticks = levels 1-3) */
  if(held.block&&!P.aliAtk&&P.dash<=0){ const before=P.charge; P.charge+=dt; aliChargeTick(before,P.charge); } /* the 3-stage charge: 08d_alicharge.js */
  if(!held.block){ const lv=aliChargeLv(P.charge); if(lv>0) aliChargeRelease(lv); else if(P.charge>0) aliChainGetsuga(); P.charge=0; } }
// the alternating chain: tier 0 = mashed (0.75x, slower), 1 = normal, 2 = 1.5x gold lining, 3 = 1.7x mini Jujishou, then back to 1
const ALI_GT={mul:[.75,1,1.5,1.7],size:[1,1,1.2,1.4],sheet:['getsuga','getsuga','getsuga_gold','getsuga_jj']};
function aliChainGetsuga(){ const P=Player, now=Game.time, since=now-(P.gT!=null?P.gT:-9), mashed=P.gAct==='g'&&since<1.6;
  if(since<(mashed?.33:.18)) return; // spam runs at three a second; right after a cut it is instant
  const tier=mashed?0:(P.gAct==='b'&&since<1.6&&(P.gTier||0)>=1)?(P.gTier>=3?1:P.gTier+1):1; P.gTier=tier; P.gT=now; P.gAct='g';
  const n0=BEAMS.length; TW._aliRC=1; try{ aliGetsuga(false); }finally{ TW._aliRC=0; } const b=BEAMS.length>n0?BEAMS[BEAMS.length-1]:null;
  if(b){ b.mul=ALI_GT.mul[tier]; b.tier=tier; const k=ALI_GT.sheet[tier], sz=GS*ALI_GT.size[tier];
    if(b.pxv&&(k!=='getsuga'||sz!==b.pxv.sz)){ pxvStop(b.pxv); b.pxv=pxvAttach(k,b.g,sz); if(b.pxv) b.pxv.dir=b; }
    if(tier===3){ twGash({life:2,rev:.06,fade:.15,w:13,op:.8,sparks:10,alive:()=>BEAMS.includes(b)&&b.life>0,pts:()=>twArcPts(b.x-b.dx*.45,b.y,b.z-b.dz*.45,b.dx,b.dz,1.5,-1.1,1.1,3)}); Sound.sfx('crossboom'); shake(.25); }
    if(tier>=2){ Sound.sfx('ready'); Game.dmgNums.push({x:P.x,y:P.y+2.6,z:P.z,n:tier===2?'GETSUGA ×1.5':'JUJISHOU ×1.7',t:0,big:tier===3,col:'#ffd45a'}); } }
  P.comboT=Math.max(P.comboT||0,1.6); } // he keeps his place in the combo
// aim the combo where the mouse points, like Shayan's swings
aliCombo=twAimed(aliCombo,ALI_R);
// his own animations, and riding a Getsuga while he glides
(function(){ const up=updatePlayer; updatePlayer=function(dt){ const r=up.apply(this,arguments); try{ const P=Player;
    if(!ALI()){ if(P.aliAtk) P.aliAtk=null; aliSurf(false); return r; }
    if(!P.hidden&&!P.cineFly) aliAtkUpdate(dt); else P.aliAtk=null; /* runs even while he is hit, like Shayan's swing */
    const A=P.aliAtk; if(A&&A.n===2) P.f=Math.floor(A.t/.055)%2?-A.f0:A.f0; /* the spin: he whips around */
    if(A&&P.anim!=='hurt'&&P.anim!=='dash') P.anim=ALI_COMBO[A.n].anim; else if(P.gliding&&P.anim==='glide') P.anim='aliSurf';
    aliSurf(P.gliding&&!P.hidden&&Game.state!=='title'); }catch(e){ console.error('ali',e); } return r; }; })();
function aliSurf(on){ const P=Player; if(!on){ if(P.surf){ pxvStop(P.surf); P.surf=null; } return; }
  if(!P.surf) P.surf=pxvPlay('getsuga',{any:true,x:P.x,y:P.y,z:P.z,size:1.5,op:.78,depth:true,ro:9});
  const e=P.surf; if(!e) return; e.m.position.set(P.x,P.y+.12,P.z+.12); e.m.material.rotation=-Math.PI/2+Math.sin(P.t*3)*.06; e.m.scale.set(1.5*(e.A.w/e.A.h),1.5,1);
  if(Math.random()<.35) FX.spawn(P.x+rnd(-.5,.5),P.y+.05,P.z,0,-rnd(.3,.8),0,.35,Math.random()<.5?0xff2a3a:0x1a0008,.18,0,true); }
// the ultimate: small Getsuga Jujishous hung in the frozen air (a gold crescent riding a little Judgement Cut tear)
function aliHungJJ(x,y,z,cx,cz){ const g=new THREE.Group(); g.position.set(x,y,z); g.userData.temp=1; scene.add(g); const dx=cx-x, dz=cz-z, d=Math.hypot(dx,dz)||1, ux=dx/d, uz=dz/d;
  const e=pxvPlay('getsuga_jj',{any:true,x:0,y:0,z:0,size:GS}); if(e){ g.add(e.m); e.m.position.set(0,0,0); e.g=g; e.sz=GS; e.dir={dx:ux,dz:uz}; }
  else { const m=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.2),new THREE.MeshBasicMaterial({map:CRESC,transparent:true,depthWrite:false,side:THREE.DoubleSide,color:0xffc838,fog:false})); m.rotation.y=-Math.atan2(dz,dx); g.add(m); }
  twGash({life:8,rev:.06,fade:.15,w:12,op:.75,sparks:6,alive:()=>!!g.parent,pts:()=>twArcPts(g.position.x-ux*.5,g.position.y,g.position.z-uz*.5,ux,uz,1.25,-1.1,1.1,3)});
  return g; }
// the final hit before time resumes: one long Judgement Cut, nearly level, across half the screen
function* aliFinalCut(){ const P=Player; P.cineAnim='beam'; Sound.sfx('swing'); Sound.sfx('beam'); aliGhost(P.x,P.y,P.z);
  const a=-.13, L=UW*.5, cx=UW/2, cy=UH*.5, x0=cx-Math.cos(a)*L/2, y0=cy-Math.sin(a)*L/2, x1=cx+Math.cos(a)*L/2, y1=cy+Math.sin(a)*L/2;
  JC.lines.push({x0,y0,x1,y1,t:0,w:46,seed:.61}); try{ twGashSparks([[x0,y0],[x1,y1]],110); }catch(e){}
  yield wait(.08); impactFrame([[3,2],[1,2],[2,2],[1,1]]); shake(1.5); FX.hitstop=Math.max(FX.hitstop,.12); Sound.sfx('crossboom'); Sound.sfx('slam'); Sound.sfx('tear');
  JC.flash=Math.max(JC.flash||0,.9); FX.flash=.45; grade.uniforms.flashCol.value.set(1,.3,.4); if(typeof twClashWarp==='function') twClashWarp(P.x+Math.cos(P.ang||0)*4,P.y+1.2,P.z+Math.sin(P.ang||0)*4,.8);
  yield wait(.45); }

// ---------- the words: controls, tips, labels ----------
(function(){ try{ const g=document.getElementById('tbGuard'); if(!g) return; let was=null;
  const du=drawUI; drawUI=function(){ du(); try{ const ali=ALI()&&!document.body.classList.contains('mech'); if(ali===was) return; was=ali;
      if(ali){ if(!g.dataset.sh) g.dataset.sh=g.innerHTML; g.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 4c8 2 12 8 10 16M6 4c4 4 5 10 3 16"/></svg>'; g.setAttribute('aria-label','Getsuga Tenshou, hold to charge (3 levels)'); }
      else if(g.dataset.sh){ g.innerHTML=g.dataset.sh; g.setAttribute('aria-label','Fireball, hold to charge'); } }catch(e){} }; }catch(e){} })();

// ---------- the co-op friend's Ali gets the same kit ----------
// the friend's own game runs this file; the host draws their tears when their animation starts a cut.
function aliRemoteSlashFX(A,anim){ const n=anim==='aliS1'?0:anim==='aliS2'?1:anim==='aliSpin'?2:-1; if(n<0) return; const ang=A.ang!=null?A.ang:(A.f>0?0:Math.PI), x=A.x, y=A.y, z=A.z;
  aliSlashFXAt(x,y,z,ang,n,0); if(n===1){ const k={t:0}; Game.fxUpd.push(dt=>{ k.t+=dt; if(k.t<.13) return true; aliSlashFXAt(x,y,z,ang,1,1); return false; }); } }
