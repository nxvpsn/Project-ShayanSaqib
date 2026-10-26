// =====================================================================
// PIXEL VFX: hand-made-looking pixel effects rendered offline from dev/vfx/recipes (the scenario-pixel-vfx
// skill; python3 vfx/build_vfx.py) into sprite sheets in img/vfx, played here as camera-facing sprites
// (or ground decals). Every hook falls back to the old effect until its sheet has loaded.
// Replaced: Shayan's basic slashes (3 combo swings, a burning set while ignited), other fighters' swings
// (FX.arc: steel, or a heavy pink arc), hit sparks (FX.spark), ground shockwaves (FX.ring), quick cuts
// (FX.cut), the Getsuga crescent (all Getsugas), parries (blue, red for Ali's guard), Ali's teleport,
// fireball explosions.
// Untouched on purpose: Judgement Cut (the slash pass and twGash), the black hole, Shayan's dash trail,
// and everything Grimmaw does (while Game.boss, his fight, is on the field the old effects play).
// =====================================================================
const PXV={tex:{},ready:{},list:[]};
function pxvLegacy(){ return !!Game.boss; }
(function(){ for(const n in PXV_ATLAS){ try{ const t=new THREE.TextureLoader().load('img/vfx/'+n+'.png',()=>{ PXV.ready[n]=1; if(n==='getsuga') pxvCresc(); });
    t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.encoding=THREE.sRGBEncoding; PXV.tex[n]=t; }catch(e){} } })();
function pxvOk(n){ return !!(PXV.ready[n]&&PXV.tex[n]&&PXV_ATLAS[n])&&!pxvLegacy(); }
// play a sheet. o: {x,y,z, size (world height), rot (screen radians, CCW), flip, ground, groundRot, color, add, speed, dur, depth}
function pxvPlay(n,o){ if(!pxvOk(n)) return null; const A=PXV_ATLAS[n], t=PXV.tex[n].clone(); t.needsUpdate=true; t.repeat.set(1/A.cols,1); o=o||{};
  const mo={map:t,transparent:true,depthWrite:false,depthTest:o.depth===true||!!o.ground,color:o.color==null?0xffffff:o.color,fog:false,blending:o.add?THREE.AdditiveBlending:THREE.NormalBlending};
  let m; const sz=o.size||2, ar=A.w/A.h;
  if(o.ground){ m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial(Object.assign(mo,{side:THREE.DoubleSide}))); m.rotation.set(-Math.PI/2,0,o.groundRot||0); m.scale.set(sz*ar,sz,1); }
  else { m=new THREE.Sprite(new THREE.SpriteMaterial(Object.assign(mo,{rotation:o.rot||0}))); m.scale.set(sz*ar*(o.flip?-1:1),sz,1); if(A.pivot) m.center.set(A.pivot[0],1-A.pivot[1]); }
  m.position.set(o.x,o.y,o.z); m.renderOrder=o.ro||8; scene.add(m);
  const e={m,t,A,f:-1,time:0,sp:(o.dur?(A.n/A.fps)/o.dur:1)*(o.speed||1)}; pxvFrame(e,0); PXV.list.push(e); return e; }
function pxvFrame(e,i){ if(e.f===i) return; e.f=i; e.t.offset.set((i%e.A.cols)/e.A.cols,0); }
function pxvKill(e){ scene.remove(e.m); try{ e.m.material.dispose(); e.t.dispose(); if(e.m.geometry&&e.m.isMesh) e.m.geometry.dispose(); }catch(x){} }
function pxvUpdate(dt){ for(let i=PXV.list.length-1;i>=0;i--){ const e=PXV.list[i]; e.time+=dt*e.sp; const f=Math.floor(e.time*e.A.fps); if(f>=e.A.n&&!e.A.loop){ pxvKill(e); PXV.list.splice(i,1); continue; } pxvFrame(e,f%e.A.n); } }
function pxvClear(){ PXV.list.forEach(pxvKill); PXV.list.length=0; }
(function(){ const fu=FX.update; FX.update=function(dt){ const r=fu.apply(this,arguments); try{ pxvUpdate(dt); }catch(e){ console.error('pxv',e); } return r; };
  const cm=FX.clearMeshes; FX.clearMeshes=function(){ pxvClear(); return cm.apply(this,arguments); }; })();
// which way a world direction points on screen: the sheet's +x is "forward"; facing left mirrors it instead of turning it upside down
function pxvAim(x,y,z,ang){ const a=toScreen(x,y,z), b=toScreen(x+Math.cos(ang),y,z+Math.sin(ang)), dx=b[0]-a[0], dy=b[1]-a[1];
  return dx>=0?{rot:Math.atan2(-dy,dx),flip:false}:{rot:Math.atan2(dy,-dx),flip:true}; }

// ---------- the shared helpers ----------
(function(){
  const sp=FX.spark; FX.spark=function(x,y,z){ if(!pxvOk('spark')) return sp.apply(this,arguments); pxvPlay('spark',{x,y,z,size:1.5});
    for(let i=0;i<5;i++){ const a=Math.random()*6.283; this.spawn(x,y,z,Math.cos(a)*rnd(4,8),rnd(0,5),Math.sin(a)*rnd(4,8),.22,i%2?0xfff6c8:0xffc04a,.16,4,true,3); } };
  const rg=FX.ring; FX.ring=function(x,y,z,c,r,life){ if(!pxvOk('ring')) return rg.apply(this,arguments);
    pxvPlay('ring',{x,y:y+.06,z,ground:true,size:(r||3)*2.08,color:new THREE.Color(c||'#fff'),add:true,dur:life||.5,groundRot:rnd(0,6.28)}); };
  const ar=FX.arc; FX.arc=function(x,y,z,ang,n,big){ const k=big?'bigarc':'arc'; if(!pxvOk(k)) return ar.apply(this,arguments); const d=big?1.1:.9, cx=x+Math.cos(ang)*d, cz=z+Math.sin(ang)*d, s=pxvAim(cx,y+.9,cz,ang);
    pxvPlay(k,{x:cx,y:y+.95,z:cz,size:big?4.8:3.6,rot:s.rot+(n===1?.35:n===2?-.35:0),flip:s.flip}); };
  const ct=FX.cut; FX.cut=function(x,y,z){ if(!pxvOk('cut')) return ct.apply(this,arguments); pxvPlay('cut',{x,y,z,size:3.2,rot:rnd(-1.2,1.2),flip:Math.random()<.5}); }; })();

// ---------- Shayan's basic slash: three combo swings (black blade, red border), burning while ignited ----------
(function(){ const sa=shArc; shArc=function(x,y,z,ang,n){ n=n|0; const k=(Player.ignite>0?'sh_fslash':'sh_slash')+Math.min(2,n); if(!pxvOk(k)) return sa.apply(this,arguments);
    const cx=x+Math.cos(ang)*1.05, cz=z+Math.sin(ang)*1.05, s=pxvAim(cx,y+1,cz,ang); pxvPlay(k,{x:cx,y:y+1.05,z:cz,size:n===2?4.8:4.3,rot:s.rot,flip:s.flip});
    if(Player.ignite>0) for(let i=0;i<10;i++){ const a=ang+rnd(-1,1), r=rnd(1.2,2); FX.spawn(x+Math.cos(a)*r,y+1+rnd(-.3,.4),z+Math.sin(a)*r,Math.cos(a)*rnd(.4,1.5),rnd(1.5,3.5),Math.sin(a)*rnd(.4,1.5),rnd(.3,.5),[0xff2a10,0xff7a1a,0xffc040][i%3],rnd(.18,.32),-3,true,2); } }; })();

// ---------- the Getsuga crescent: the pixel sheet's 4 frames become CRESC's flicker frames (every Getsuga uses it) ----------
function pxvCresc(){ try{ const img=PXV.tex.getsuga&&PXV.tex.getsuga.image, A=PXV_ATLAS.getsuga; if(!img||!A||typeof TW_CRESC==='undefined'||TW_CRESC.frames.length<4) return;
  for(let k=0;k<4;k++){ const cv=TW_CRESC.frames[k], c=cv.getContext('2d'), S=cv.width, f=k%A.n; c.clearRect(0,0,S,S); c.imageSmoothingEnabled=false; c.drawImage(img,f*A.w,0,A.w,A.h,0,0,S,S); } }catch(e){ console.error('pxv cresc',e); } }

// ---------- parries: a clash star (blue; red for Ali's guard) ----------
(function(){ const ph=playerHit; playerHit=function(){ const r=ph.apply(this,arguments); if(r==='parry'){ const P=Player; pxvPlay(ALI()?'parry_ali':'parry',{x:P.x+Math.cos(P.ang||0)*.6,y:P.y+1.3,z:P.z+Math.sin(P.ang||0)*.6,size:2.6}); } return r; }; })();

// ---------- Ali's teleport: he folds into a red-black seam, then bursts out where he lands ----------
(function(){ const at=aliTeleport; aliTeleport=function(){ const P=Player, ox=P.x, oy=P.y, oz=P.z, r=at.apply(this,arguments);
    if(pxvOk('tp_out')){ pxvPlay('tp_out',{x:ox,y:oy+1.4,z:oz,size:3.4,depth:true}); pxvPlay('tp_in',{x:P.x,y:P.y+1.4,z:P.z,size:3.4,depth:true}); } return r; }; })();

// ---------- fireball explosions (orange; the full charge's is neon red) ----------
(function(){ const fh=twFireballHit; twFireballHit=function(f,x,y,z){ const r=fh.apply(this,arguments); pxvPlay(f.big?'boom_big':'boom',{x,y,z,size:f.big?6:2.4}); return r; }; })();

// ---------- area blasts: a pixel detonation in the attack's own colour (skinned blasts keep their look) ----------
(function(){ const tb=twBlast; twBlast=function(x,z,r,delay,o){ if(o&&o.skin) return tb.apply(this,arguments); o=Object.assign({},o||{}); const ob=o.onBoom, col=o.col||0xff3a6a;
    o.onBoom=function(bx,bz){ if(ob) ob.apply(this,arguments); const gy=groundY(bx,bz); pxvPlay('blast',{x:bx,y:gy+r*.55,z:bz,size:Math.max(2.4,r*1.9),color:new THREE.Color(o.burst||col),depth:true}); };
    return tb.call(this,x,z,r,delay,o); }; })();
