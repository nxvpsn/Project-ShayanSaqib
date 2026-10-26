// =====================================================================
// PIXEL VFX: hand-made-looking pixel effects rendered offline from dev/vfx/recipes (the scenario-pixel-vfx
// skill; python3 vfx/build_vfx.py) into sprite sheets in img/vfx, played here as camera-facing sprites
// (or ground decals). Every hook falls back to the old effect until its sheet has loaded.
// Replaced: Shayan's basic slash (a silver arc on the original swing's plane and size; burning, with flames
// riding the sword, while ignited) and, as the same silver slash, every parryable melee attack (FX.arc swings,
// and melee hits without a swing: rushes, dashes, lunges), Shayan's Getsuga Tenshou (black blade, red border), hit sparks (FX.spark), ground shockwaves (FX.ring), quick cuts (FX.cut),
// the shared crescent texture (CRESC), parries (blue, red for Ali's guard), Ali's teleport, fireball explosions.
// Hits, clashes and the basic slash are kept small on purpose: readability first.
// Untouched on purpose: Judgement Cut (the slash pass and twGash), the black hole, Shayan's dash trail,
// and everything Grimmaw does (while Game.boss, his fight, is on the field the old effects play).
// =====================================================================
const PXV={tex:{},ready:{},list:[]};
function pxvLegacy(){ return !!Game.boss; }
(function(){ for(const n in PXV_ATLAS){ try{ const t=new THREE.TextureLoader().load('img/vfx/'+n+'.png',()=>{ PXV.ready[n]=1; if(n==='cresc') pxvCresc(); });
    t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.encoding=THREE.sRGBEncoding; PXV.tex[n]=t; }catch(e){} } })();
function pxvRdy(n){ return !!(PXV.ready[n]&&PXV.tex[n]&&PXV_ATLAS[n]); }
function pxvOk(n){ return pxvRdy(n)&&!pxvLegacy(); }
// play a sheet. o: {x,y,z, size (world height), rot (screen radians, CCW), flip, ground, groundRot, plane (a mesh the caller turns), op, color, add, speed, dur, depth,
//   fade (seconds: fade out and die, frozen on frame o.frame), any (play even while Grimmaw is on the field)}
function pxvPlay(n,o){ if(!(o&&o.any?pxvRdy(n):pxvOk(n))) return null; const A=PXV_ATLAS[n], t=PXV.tex[n].clone(); t.needsUpdate=true; t.repeat.set(1/A.cols,1); o=o||{};
  const mo={map:t,transparent:true,depthWrite:false,depthTest:o.depth===true||!!o.ground||!!o.plane,opacity:o.op==null?1:o.op,color:o.color==null?0xffffff:o.color,fog:false,blending:o.add?THREE.AdditiveBlending:THREE.NormalBlending};
  let m; const sz=o.size||2, ar=A.w/A.h;
  if(o.plane){ m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial(Object.assign(mo,{side:THREE.DoubleSide}))); m.scale.set(sz*ar,sz,1); }
  else if(o.ground){ m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial(Object.assign(mo,{side:THREE.DoubleSide}))); m.rotation.set(-Math.PI/2,0,o.groundRot||0); m.scale.set(sz*ar,sz,1); }
  else { m=new THREE.Sprite(new THREE.SpriteMaterial(Object.assign(mo,{rotation:o.rot||0}))); m.scale.set(sz*ar*(o.flip?-1:1),sz,1); if(A.pivot) m.center.set(A.pivot[0],1-A.pivot[1]); }
  m.position.set(o.x,o.y,o.z); m.renderOrder=o.ro||8; scene.add(m);
  const e={m,t,A,f:-1,time:0,sp:(o.dur?(A.n/A.fps)/o.dur:1)*(o.speed||1),op:o.op==null?1:o.op}; if(o.fade){ e.fade=o.fade; e.age=0; e.sp=0; e.time=(o.frame||0)/A.fps; } pxvFrame(e,Math.floor(e.time*A.fps)%A.n); PXV.list.push(e); return e; }
function pxvFrame(e,i){ if(e.f===i) return; e.f=i; e.t.offset.set((i%e.A.cols)/e.A.cols,0); }
function pxvKill(e){ if(e.m.parent) e.m.parent.remove(e.m); try{ e.m.material.dispose(); e.t.dispose(); if(e.m.geometry&&e.m.isMesh) e.m.geometry.dispose(); }catch(x){} }
function pxvUpdate(dt){ for(let i=PXV.list.length-1;i>=0;i--){ const e=PXV.list[i]; if(e.fade){ e.age+=dt; if(e.age>=e.fade){ pxvKill(e); PXV.list.splice(i,1); continue; } e.m.material.opacity=e.op*(1-e.age/e.fade); continue; } if(e.g){ let o=e.g; while(o.parent) o=o.parent; if(o!==scene){ pxvKill(e); PXV.list.splice(i,1); continue; } pxvFollow(e); } e.time+=dt*e.sp; const f=Math.floor(e.time*e.A.fps); if(f>=e.A.n&&!e.A.loop){ pxvKill(e); PXV.list.splice(i,1); continue; } pxvFrame(e,f%e.A.n); } }
function pxvStop(e){ const i=PXV.list.indexOf(e); if(i<0) return; PXV.list.splice(i,1); pxvKill(e); }
function pxvClear(){ PXV.list.forEach(pxvKill); PXV.list.length=0; }
(function(){ const fu=FX.update; FX.update=function(dt){ const r=fu.apply(this,arguments); try{ pxvUpdate(dt); }catch(e){ console.error('pxv',e); } return r; };
  const cm=FX.clearMeshes; FX.clearMeshes=function(){ pxvClear(); return cm.apply(this,arguments); }; })();
// which way a world direction points on screen: the sheet's +x is "forward"; facing left mirrors it instead of turning it upside down
function pxvAim(x,y,z,ang){ const a=toScreen(x,y,z), b=toScreen(x+Math.cos(ang),y,z+Math.sin(ang)), dx=b[0]-a[0], dy=b[1]-a[1];
  return dx>=0?{rot:Math.atan2(-dy,dx),flip:false}:{rot:Math.atan2(dy,-dx),flip:true}; }

// ---------- the shared helpers ----------
(function(){
  const sp=FX.spark; FX.spark=function(x,y,z){ if(!pxvOk('spark')) return sp.apply(this,arguments); pxvPlay('spark',{x,y,z,size:1});
    for(let i=0;i<3;i++){ const a=Math.random()*6.283; this.spawn(x,y,z,Math.cos(a)*rnd(3,5),rnd(0,3),Math.sin(a)*rnd(3,5),.18,i%2?0xfff6c8:0xffc04a,.12,4,true,3); } };
  const rg=FX.ring; FX.ring=function(x,y,z,c,r,life){ if(!pxvOk('ring')) return rg.apply(this,arguments);
    pxvPlay('ring',{x,y:y+.06,z,ground:true,size:(r||3)*2.08,color:new THREE.Color(c||'#fff'),add:true,dur:life||.5,groundRot:rnd(0,6.28)}); };
  // every melee swing (enemies, allies, Ali) is Shayan's silver slash: a silver slash always means "parry this"
  const ar=FX.arc; FX.arc=function(x,y,z,ang,n,big){ if(!pxvOk('sh_slash')) return ar.apply(this,arguments); pxvSlash('sh_slash',x,y,z,ang,n|0,big?5.6:4.5); };
  const ct=FX.cut; FX.cut=function(x,y,z){ if(!pxvOk('cut')) return ct.apply(this,arguments); pxvPlay('cut',{x,y,z,size:2.2,rot:rnd(-1.2,1.2),flip:Math.random()<.5}); }; })();

// ---------- the silver slash: Shayan's basic attack, and every parryable melee attack in the game ----------
// laid on the original swing's plane (ring 1.0..2.08, tilted per combo step, mirrored for the rising swing), slightly see-through
const PXV_TELL=[]; // recent slashes (x,z,time): a melee hit right after one doesn't draw a second
function pxvSlash(k,x,y,z,ang,n,size){ const e=pxvPlay(k,{x,y:y+.9,z,size,plane:true,op:.82}); if(!e) return null; const m=e.m;
  m.rotation.x=-Math.PI/2+(n===1?.25:n===2?-.25:0); m.rotation.z=-ang; if(n===1) m.scale.y*=-1; PXV_TELL.push({x,z,t:Game.time}); if(PXV_TELL.length>16) PXV_TELL.shift(); return e; }
// parryable melee hits that have no swing of their own (rushes, dashes, lunges, bites) get the same silver slash as they reach you
function pxvMeleeTell(sx,sz){ if(!pxvOk('sh_slash')) return; const P=Player, t=Game.time; if(PXV_TELL.some(o=>t-o.t<.35&&Math.hypot(o.x-sx,o.z-sz)<2.2)) return;
  pxvSlash('sh_slash',sx,groundY(sx,sz),sz,Math.atan2(P.z-sz,P.x-sx),Math.random()<.5?1:0,4.5); }
(function(){ const ph=playerHit; playerHit=function(dmg,sx,sz,opt){ try{ if(opt&&opt.melee&&!opt.pierce&&!opt.unblockable&&sx!=null) pxvMeleeTell(sx,sz); }catch(e){ console.error('pxv tell',e); } return ph.apply(this,arguments); }; })();
// Shayan's swing: the silver slash; ignited, it burns and a flame rides the sword along the swing
(function(){ const sa=shArc; shArc=function(x,y,z,ang,n){ n=n|0; const ig=Player.ignite>0, k=ig?'sh_fslash':'sh_slash'; if(!pxvOk(k)) return sa.apply(this,arguments);
    const e=pxvSlash(k,x,y,z,ang,n,4.5), m=e.m, th=SH_SL.TH;
    if(!ig) return; const fl=pxvPlay('swordfire',{x,y:y+.9,z,size:1.5}), k2={t:0}, v=new THREE.Vector3(), T=.24;
    Game.fxUpd.push(dt=>{ try{ k2.t+=dt; const p=Math.min(1,k2.t/T), h=1-(1-p)*(1-p), a=-th/2+h*th; m.updateMatrixWorld(); /* local angle; the mirror (scale.y) flips it for the rising swing */
        v.set(Math.cos(a)*1.75/4.5,Math.sin(a)*1.75/4.5,0); m.localToWorld(v); if(fl) fl.m.position.set(v.x,v.y-.1,v.z);
        for(let i=0;i<3;i++) FX.spawn(v.x+rnd(-.15,.15),v.y+rnd(-.1,.2),v.z+rnd(-.15,.15),rnd(-.6,.6),rnd(1.5,3.5),rnd(-.6,.6),rnd(.25,.45),[0xff2a10,0xff7a1a,0xffc040][i],rnd(.18,.3),-3,true,2);
        if(p>=1){ if(fl) pxvStop(fl); return false; } return true; }catch(er){ console.error('pxv swordfire',er); if(fl) pxvStop(fl); return false; } }); }; })();

// ---------- the shared crescent texture: the 'cresc' sheet's 4 frames become CRESC's flicker frames (enemy fans, allies, Omar) ----------
function pxvCresc(){ try{ const img=PXV.tex.cresc&&PXV.tex.cresc.image, A=PXV_ATLAS.cresc; if(!img||!A||typeof TW_CRESC==='undefined'||TW_CRESC.frames.length<4) return;
  for(let k=0;k<4;k++){ const cv=TW_CRESC.frames[k], c=cv.getContext('2d'), S=cv.width, f=k%A.n; c.clearRect(0,0,S,S); c.imageSmoothingEnabled=false; c.drawImage(img,f*A.w,0,A.w,A.h,0,0,S,S); } }catch(e){ console.error('pxv cresc',e); } }

// ---------- the Getsugas: a violent, crackling crescent (shape shifts every frame, lightning crawls over it) rides each projectile ----------
// Shayan's (black blade, red border), Ali's Getsuga Jujishou (gold, riding the Judgement Cut tear, which is untouched) and Omar's
// (violet; twGetsugaMesh, also used by the 2v2 clash). The sprite is a child of the projectile's group, so it moves, fades and
// disappears with it; it twitches in size and angle every frame.
function pxvAttach(n,g,size){ const e=pxvPlay(n,{x:0,y:0,z:0,size}); if(!e) return null; g.add(e.m); e.m.position.set(0,0,0); e.g=g; e.sz=size; return e; }
function pxvFollow(e){ const g=e.g, A=e.A; g.updateMatrixWorld(); const p0=new THREE.Vector3().setFromMatrixPosition(g.matrixWorld), p1=g.localToWorld(new THREE.Vector3(1,0,0));
  const a=toScreen(p0.x,p0.y,p0.z), b=toScreen(p1.x,p1.y,p1.z), dx=b[0]-a[0], dy=b[1]-a[1], fl=dx<0, jt=1+rnd(-.06,.06);
  e.m.material.rotation=(fl?Math.atan2(dy,-dx):Math.atan2(-dy,dx))+rnd(-.05,.05); e.m.scale.set(e.sz*jt*(A.w/A.h)*(fl?-1:1),e.sz*jt,1); }
(function(){ const fb=fireBeam; fireBeam=function(big,quiet,o){ const n0=BEAMS.length, r=fb.apply(this,arguments); const b=BEAMS[BEAMS.length-1];
    if(BEAMS.length>n0&&b){ const jj=b.jj, k=jj?'getsuga_jj':'getsuga';
      if((jj||!b.ali)&&pxvOk(k)){ if(jj) b.g.visible=true; b.g.children.forEach(c=>c.visible=false); b.pxv=pxvAttach(k,b.g,jj?4.2:big?4.4:3.6); /* the group grows over its flight (and Jujishou's is x1.25) */ } }
    return r; }; })();
(function(){ const gm=twGetsugaMesh; twGetsugaMesh=function(s,col){ const g=gm.apply(this,arguments); try{ const k=(col==null||col===0x9a4aff)?'getsuga_omar':'getsuga';
    if(pxvOk(k)){ const mats=g.userData.mats; g.children.forEach(c=>c.visible=false); const e=pxvAttach(k,g,s*1.2); if(e&&mats) mats.push(e.m.material); } }catch(e){ console.error('pxv getsugaMesh',e); } return g; }; })();

// ---------- parries: a clash star (blue; red for Ali's guard) ----------
(function(){ const ph=playerHit; playerHit=function(){ const r=ph.apply(this,arguments); if(r==='parry'){ const P=Player; pxvPlay(ALI()?'parry_ali':'parry',{x:P.x+Math.cos(P.ang||0)*.6,y:P.y+1.3,z:P.z+Math.sin(P.ang||0)*.6,size:1.6}); } return r; }; })();

// ---------- Ali's teleport: he folds into a red-black seam, then bursts out where he lands ----------
(function(){ const at=aliTeleport; aliTeleport=function(){ const P=Player, ox=P.x, oy=P.y, oz=P.z, r=at.apply(this,arguments);
    if(pxvOk('tp_out')){ pxvPlay('tp_out',{x:ox,y:oy+1.4,z:oz,size:3.4,depth:true}); pxvPlay('tp_in',{x:P.x,y:P.y+1.4,z:P.z,size:3.4,depth:true}); } return r; }; })();

// ---------- fireball explosions: tight and small (orange; the full charge's is deep crimson like the ball) ----------
(function(){ const fh=twFireballHit; twFireballHit=function(f,x,y,z){ const k=f.big?'boom_big':'boom'; if(!pxvOk(k)) return fh.apply(this,arguments); pxvPlay(k,{x,y,z,size:f.big?3.2:1.5});
    FX.burst(x,y,z,f.big?12:4,f.big?0xa0081e:0xff7a1a,f.big?3.5:2,f.big?.26:.18); if(f.big){ FX.ring(x,y-.6,z,'#a0102a',1.4,.3); shake(.35); Sound.sfx('slam'); } else Sound.sfx('hit'); }; })();

// ---------- area blasts: a pixel detonation in the attack's own colour (skinned blasts keep their look) ----------
(function(){ const tb=twBlast; twBlast=function(x,z,r,delay,o){ if(o&&o.skin) return tb.apply(this,arguments); o=Object.assign({},o||{}); const ob=o.onBoom, col=o.col||0xff3a6a;
    o.onBoom=function(bx,bz){ if(ob) ob.apply(this,arguments); const gy=groundY(bx,bz); pxvPlay('blast',{x:bx,y:gy+r*.55,z:bz,size:Math.max(2.4,r*1.9),color:new THREE.Color(o.burst||col),depth:true}); };
    return tb.call(this,x,z,r,delay,o); }; })();
