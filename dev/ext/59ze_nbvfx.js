// =====================================================================
// NATHAN VFX (Ali's road; the funnel and beam upgrades also reach Shayan's Nathan fights as enhancements):
// - beams (np1Beam): a wide soft halo round the core, a muzzle flash, an impact flare with sparks, a shock ring
// - funnels (nbBit): a glow and a hot core on every bit (they take the bit's colour, so a red tell glows red)
// - thrusters: two flickering jets behind him while he boosts (cyan; orange-red in phase III)
// - phase auras: II: cold sparks round him; III: embers and heat shimmer off him
// - parry clash: a cross-shaped anime glint at the contact point on every parry in this fight
// =====================================================================
function npSprite(col,s,add){ const g=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:col,blending:add===false?THREE.NormalBlending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); g.scale.set(s,s,1); g.userData.temp=1; return g; }
// ---------- beams ----------
function npBeamFx(ax,ay,az,bx,by,bz,col,w,life){ const halo=beamMesh(col,w*3.2); halo.material.transparent=true; halo.material.opacity=.28; halo.material.blending=THREE.AdditiveBlending; halo.material.depthWrite=false; halo.userData.temp=1;
  halo.position.set(ax,ay,az); halo.lookAt(bx,by,bz+1e-4); const L=Math.max(.01,Math.hypot(bx-ax,by-ay,bz-az)); halo.scale.set(1,1,L); scene.add(halo);
  const mz=npSprite(col,w*22), mzc=npSprite(0xffffff,w*9), im=npSprite(col,w*26), imc=npSprite(0xffffff,w*12); for(const g of [mz,mzc]) { g.position.set(ax,ay,az); scene.add(g); } for(const g of [im,imc]){ g.position.set(bx,by,bz); scene.add(g); }
  for(let i=0;i<10;i++) FX.spawn(bx,by,bz,rnd(-5,5),rnd(-1,6),rnd(-5,5),rnd(.2,.4),i%2?col:0xffffff,.22,10,true);
  if(typeof npShock==='function'&&Math.abs(by-groundY(bx,bz))<2.5) try{ npShock(bx,groundY(bx,bz)+.1,bz,0,1,.9); }catch(e){}
  const k={t:0}, T=Math.max(.12,life||.2)+.12, all=[halo,mz,mzc,im,imc];
  const obj={upd(dt){ k.t+=dt; const a=Math.max(0,1-k.t/T); halo.material.opacity=.28*a; halo.scale.x=halo.scale.y=Math.max(.01,1+.4*(1-a)); mz.material.opacity=a; mzc.material.opacity=a; im.material.opacity=a; imc.material.opacity=a;
      const s=1+(1-a)*.6; im.scale.set(w*26*s,w*26*s,1); return k.t<T; }, kill(){ all.forEach(m=>scene.remove(m)); }};
  if(typeof NP1!=='undefined'&&NP1.live) np1Obj(obj); else { Game.fxUpd.push(dt=>{ const on=obj.upd(dt||1/60); if(!on) obj.kill(); return on; }); } }
(function(){ const nb=np1Beam; np1Beam=function(ax,ay,az,bx,by,bz,col,w,life){ const r=nb.apply(this,arguments); try{ npBeamFx(ax,ay,az,bx,by,bz,col,w||.14,life); }catch(e){ console.error('np beam fx',e); } return r; }; })();
// ---------- funnels ----------
(function(){ const nbb=nbBit; nbBit=function(){ const b=nbb.apply(this,arguments); try{ if(b&&b.m&&b.m.add){ const g=npSprite(0x3ff4ff,1.3), c=npSprite(0xffffff,.45); g.userData.temp=0; c.userData.temp=0; b.m.add(g); b.m.add(c); } }catch(e){ console.error('np bit fx',e); } return b; }; })();
// ---------- thrusters + phase auras + clash glints (per frame, Ali's road) ----------
const NPV={jets:null,t:0};
function npJets(){ if(!NPV.jets){ NPV.jets=[npSprite(0x3ff4ff,1.1),npSprite(0x3ff4ff,1.1),npSprite(0xffffff,.5),npSprite(0xffffff,.5)]; NPV.jets.forEach(j=>{ j.userData.temp=0; scene.add(j); }); } return NPV.jets; }
function npVfxFrame(dt){ NPV.t+=dt; const on=typeof npOn==='function'&&npOn()&&NB&&NB.mesh&&NB.mesh.visible, J=npJets(), boost=on&&typeof NBS!=='undefined'&&(NBS.boostT>0||NB.dsh);
  const hot=on&&(NP1.ph||1)>=3, col=hot?0xff5a2a:0x3ff4ff;
  if(boost){ const a=NBS.bdir!=null?NBS.bdir:0, bx=-Math.cos(a), bz=-Math.sin(a), px=-bz, pz=bx, p=NB.mesh.position, fl=.8+Math.random()*.5;
    [[.32,2.4],[-.32,2.4]].forEach(([s,h],i)=>{ const j=J[i], c=J[i+2]; j.visible=c.visible=true; j.material.color.setHex(col); j.position.set(p.x+bx*.7+px*s,p.y+h-.6,p.z+bz*.7+pz*s); j.scale.set(1.3*fl,1.3*fl,1); c.position.copy(j.position); c.scale.set(.5*fl,.5*fl,1); });
    if(Math.random()<.7) FX.spawn(p.x+bx*1.1+rnd(-.2,.2),p.y+1.7+rnd(-.2,.2),p.z+bz*1.1+rnd(-.2,.2),bx*6,rnd(-.5,.5),bz*6,.25,col,.2,0,true); }
  else J.forEach(j=>j.visible=false);
  if(!on||NP1.done) return; const p=NB.mesh.position, ph=NP1.ph||1;
  if(ph===2&&Math.random()<dt*14) FX.spawn(p.x+rnd(-.8,.8),p.y+rnd(.6,3.8),p.z+rnd(-.8,.8),0,rnd(.4,1.2),0,.6,Math.random()<.5?0x9ff8ff:0xffffff,.16,0,true);
  if(ph>=3){ if(Math.random()<dt*30) FX.spawn(p.x+rnd(-.9,.9),p.y+rnd(.4,3.8),p.z+rnd(-.9,.9),rnd(-.4,.4),rnd(1.5,3.5),rnd(-.4,.4),rnd(.5,.9),Math.random()<.6?0xff5a2a:0xffd27a,.18,-1,true);
    if(Math.random()<dt*6) FX.spawn(p.x+rnd(-.5,.5),p.y+rnd(2,3.5),p.z+rnd(-.5,.5),0,rnd(.5,1.2),0,1.1,0x3a1408,.6,0,false); } }
(function(){ const nu=np1Update; np1Update=function(dt){ const r=nu.apply(this,arguments); try{ npVfxFrame(dt); }catch(e){ console.error('np vfx',e); } return r; }; })();
(function(){ const un=updateNB; updateNB=function(dt){ const r=un.apply(this,arguments); try{ if(!(typeof npOn==='function'&&npOn())&&NPV.jets) NPV.jets.forEach(j=>j.visible=false); }catch(e){} return r; }; })();
// the clash glint: two stretched stars in an X and a white core where the blades met
function npClashGlint(x,y,z,col){ const a=npSprite(col||0xffffff,1), b=npSprite(col||0xffffff,1), c=npSprite(0xffffff,1.6); for(const g of [a,b,c]){ g.position.set(x,y,z); scene.add(g); } a.material.rotation=.6; b.material.rotation=-.6;
  const k={t:0}, obj={upd(dt){ k.t+=dt; const u=k.t/.32, e=Math.max(0,1-u); a.scale.set(7*(.4+u),.32*e+.01,1); b.scale.set(7*(.4+u),.32*e+.01,1); c.scale.set(2.2*e+.01,2.2*e+.01,1); for(const g of [a,b,c]) g.material.opacity=e; return u<1; }, kill(){ for(const g of [a,b,c]) scene.remove(g); }};
  if(typeof NP1!=='undefined'&&NP1.live) np1Obj(obj); else Game.fxUpd.push(dt=>{ const on=obj.upd(dt||1/60); if(!on) obj.kill(); return on; }); }
(function(){ const mp=twMeleeParry; twMeleeParry=function(sx,sz){ const r=mp.apply(this,arguments); try{ if(typeof npOn==='function'&&npOn()){ const P=Player, mx=lerp(P.x,sx,.45), mz=lerp(P.z,sz,.45); npClashGlint(mx,P.y+1.3,mz,(NP1.ph||1)>=3?0xffb07a:0xbfefff); } }catch(e){ console.error('np clash glint',e); } return r; }; })();
// the jets go when the fight does
(function(){ const nr=typeof nbRemove==='function'?nbRemove:null; if(!nr) return; nbRemove=function(){ try{ if(NPV.jets){ NPV.jets.forEach(j=>scene.remove(j)); NPV.jets=null; } }catch(e){} return nr.apply(this,arguments); }; })();
