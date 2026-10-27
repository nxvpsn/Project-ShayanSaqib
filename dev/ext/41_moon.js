// =====================================================================
// THE MOON (Ali kicks Shayan to it, then cuts it to pieces):
// - a detailed moon: img/moon.png (dev/skyart.py moon: craters with rims and central peaks, dark maria, ray systems)
//   painted on a 1024x512 canvas (`M.mc`, also the bump map) with a glow canvas (`M.ec`, the emissive map) for the gashes;
// - every cut leaves a gash where its slash lands on the moon: a JC slash line is projected onto the sphere
//   (`moonScreenGash`: screen line -> rays -> uv), the other cuts land at random on the visible face; dark groove,
//   chipped bright rim, a red-hot core that glows in the dark (`moonGash`); `moonCrater` marks where Shayan hits;
// - 1000 cuts in 15 s (paced by the clock); the explosion: long impact frames, shockwaves, 220 chunks (some with
//   glowing gash faces) flying everywhere, some straight past the camera (`moonBlast`);
// - Shayan (and Hamza, holding his scarf) shrink to nothing on the way and vanish on impact; the next shot is a
//   close-up, where they are back at full size.
// aliAwaken is the base cutscene with those changes (the dialogue is unchanged).
// =====================================================================
const MOON_W=1024, MOON_H=512, MOON_V=new THREE.Vector3();
function moonFallback(c){ c.fillStyle='#bcb6ac'; c.fillRect(0,0,MOON_W,MOON_H);
  for(let i=0;i<260;i++){ const x=hash(i,5)*MOON_W, y=hash(5,i)*MOON_H, r=4+hash(i,9)*30; c.fillStyle=i%3?'#a8a298':'#958f86'; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.fillStyle='#d8d4cc'; c.beginPath(); c.arc(x-r*.25,y-r*.25,r*.45,0,7); c.fill(); } }
LEVELDEF.moonsky=function(){ const G=newGrid(8,8,'flowers'); G.tx=makeTileTextures('flowers'); for(let z=0;z<8;z++) for(let x=0;x<8;x++) G.H[z][x]=-99;
  Object.assign(G,{key:'moonsky',look:'void',music:null,name:'',sub:'',spawn:[4,4],bottom:-99});
  G.root.add(skyDome(LOOKS.void.sky,LOOKS.void.sunDir,LOOKS.void.sunCol,LOOKS.void.sunSize)); stars(G,2600,0xffffff,1.5); stars(G,500,0xffd8c8,2.2);
  const [mc,c]=mkCanvas(MOON_W,MOON_H), [ec,e]=mkCanvas(MOON_W,MOON_H); moonFallback(c); e.fillStyle='#22222a'; e.fillRect(0,0,MOON_W,MOON_H);
  const mt=new THREE.CanvasTexture(mc), et=new THREE.CanvasTexture(ec); mt.encoding=et.encoding=THREE.sRGBEncoding; mt.magFilter=THREE.NearestFilter;
  const moon=new THREE.Mesh(new THREE.SphereGeometry(14,96,64),new THREE.MeshPhongMaterial({map:mt,bumpMap:mt,bumpScale:.4,emissive:0xffffff,emissiveMap:et,specular:0x000000,shininess:0}));
  moon.position.set(0,8,-44); moon.rotation.y=-1.5; G.root.add(moon);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xfff0d8,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.45})); halo.scale.set(52,52,1); halo.position.copy(moon.position); G.root.add(halo);
  const earth=new THREE.Mesh(new THREE.SphereGeometry(120,48,24),new THREE.MeshLambertMaterial({map:earthTex(),emissive:0x0a1020})); earth.position.set(0,-150,-20); G.root.add(earth);
  const M=G.mn={moon,mc,mt,ec,et,halo,earth,W:MOON_W,H:MOON_H,gashes:[],dirty:0,fr:0};
  try{ if(typeof Image!=='undefined'){ const img=new Image(); img.onload=()=>{ try{ c.drawImage(img,0,0,MOON_W,MOON_H); for(const g of M.gashes) moonGashDraw(M,g); M.dirty=1; }catch(err){ console.error('moon img',err); } }; img.src='img/moon.png'; } }catch(err){}
  G.anim.push(dt=>{ moon.rotation.y+=dt*.01; if(M.dirty&&(++M.fr%2===0)){ M.dirty=0; mt.needsUpdate=true; et.needsUpdate=true; } }); return G; };
// a gash along canvas points (already split at the texture seam)
function moonGashDraw(M,g){ const c=M.mc.getContext('2d'), e=M.ec.getContext('2d'), p=g.p, w=g.w;
  const path=(ctx,dx,dy)=>{ ctx.beginPath(); ctx.moveTo(p[0][0]+dx,p[0][1]+dy); for(let i=1;i<p.length;i++) ctx.lineTo(p[i][0]+dx,p[i][1]+dy); };
  c.lineCap=e.lineCap='round'; c.lineJoin=e.lineJoin='round';
  path(c,-1,-1); c.strokeStyle='rgba(240,236,226,.85)'; c.lineWidth=w*2.2; c.stroke();
  path(c,1,1); c.strokeStyle='#4a4048'; c.lineWidth=w*2; c.stroke();
  path(c,0,0); c.strokeStyle='#1e161c'; c.lineWidth=w*1.4; c.stroke(); c.strokeStyle='#8a1424'; c.lineWidth=w*.8; c.stroke(); c.strokeStyle='#ff5a6a'; c.lineWidth=Math.max(1,w*.35); c.stroke();
  path(e,0,0); e.strokeStyle='#c8182a'; e.lineWidth=w*.9; e.stroke(); e.strokeStyle='#ffc8cc'; e.lineWidth=Math.max(1,w*.3); e.stroke(); }
function moonGash(M,p,w){ if(!p||p.length<2) return; const g={p,w:w||rnd(2.2,4)}; M.gashes.push(g); moonGashDraw(M,g); M.dirty=1; }
// world point on the moon -> canvas pixel (three's sphere uv: u = phi/2pi from -x towards +z, v down from the north pole)
function moonUV(M,p){ const l=M.moon.worldToLocal(p.clone()).normalize(); let ph=Math.atan2(l.z,-l.x); if(ph<0) ph+=Math.PI*2; return [ph/(Math.PI*2)*M.W, Math.acos(clamp(l.y,-1,1))/Math.PI*M.H]; }
// screen point (UI coords) -> where its ray meets the moon, or null
function moonHit(M,sx,sy){ const o=camera.position, d=new THREE.Vector3(sx/UW*2-1,1-sy/UH*2,.5).unproject(camera).sub(o).normalize();
  const ctr=M.moon.getWorldPosition(MOON_V).clone(), r=14*M.moon.scale.x, oc=o.clone().sub(ctr), b=oc.dot(d), h=b*b-(oc.lengthSq()-r*r); if(!(h>=0)) return null;
  const t=-b-Math.sqrt(h); return t>0?o.clone().addScaledVector(d,t):null; }
function moonScreenGash(M,x0,y0,x1,y1,w){ const N=18, runs=[[]]; let mid=null;
  for(let i=0;i<=N;i++){ const u=i/N, p=moonHit(M,lerp(x0,x1,u),lerp(y0,y1,u)), run=runs[runs.length-1];
    if(!p){ if(run.length) runs.push([]); continue; } if(!mid||Math.abs(u-.5)<.2) mid=p; const q=moonUV(M,p);
    if(run.length&&Math.abs(q[0]-run[run.length-1][0])>M.W/2){ runs.push([q]); continue; } run.push(q); }
  for(const r of runs) moonGash(M,r,w); return mid; }
// the moon's disc on screen
function moonScreen(M){ const ctr=M.moon.getWorldPosition(MOON_V).clone(), dist=ctr.distanceTo(camera.position), v=ctr.clone().project(camera);
  return {x:(v.x+1)/2*UW, y:(1-v.y)/2*UH, r:14/(dist*Math.tan(camera.fov*Math.PI/360))*UH/2}; }
cutMoon=function(M,line){ try{ if(!M||!M.W) return null;
    if(line) return moonScreenGash(M,line.x0,line.y0,line.x1,line.y1,rnd(4,6));
    const s=moonScreen(M); if(!(s.r>4)) throw 0; const rr=s.r*.88*Math.sqrt(Math.random()), an=rnd(0,6.28), mx=s.x+Math.cos(an)*rr, my=s.y+Math.sin(an)*rr, a=rnd(0,Math.PI), l=rnd(.15,.7)*s.r;
    return moonScreenGash(M,mx-Math.cos(a)*l,my-Math.sin(a)*l,mx+Math.cos(a)*l,my+Math.sin(a)*l); }
  catch(e){ /* no camera maths (harness): a gash on the face we look at */ const x=M.W*rnd(.2,.45), y=M.H*rnd(.25,.75), a=rnd(0,Math.PI), l=rnd(20,90); moonGash(M,[[x-Math.cos(a)*l,y-Math.sin(a)*l],[x+Math.cos(a)*l,y+Math.sin(a)*l]]); return null; } };
// the crater Shayan leaves
function moonCrater(M,x,y,z){ try{ const ctr=M.moon.getWorldPosition(MOON_V).clone(), p=new THREE.Vector3(x,y,z).sub(ctr).setLength(14).add(ctr), [u,v]=moonUV(M,p), c=M.mc.getContext('2d'), R2=16;
    c.fillStyle='#ece6da'; c.beginPath(); c.arc(u-2,v-2,R2+3,0,7); c.fill(); c.fillStyle='#3a343a'; c.beginPath(); c.arc(u+1,v+1,R2,0,7); c.fill(); c.fillStyle='#6a6266'; c.beginPath(); c.arc(u+3,v+3,R2*.6,0,7); c.fill();
    c.strokeStyle='#2a2428'; c.lineWidth=2; for(let k=0;k<9;k++){ const a=k/9*6.28+rnd(-.2,.2); c.beginPath(); c.moveTo(u+Math.cos(a)*R2,v+Math.sin(a)*R2); c.lineTo(u+Math.cos(a)*R2*rnd(1.8,2.8),v+Math.sin(a)*R2*rnd(1.8,2.8)); c.stroke(); }
    M.dirty=1; }catch(e){ console.error('moon crater',e); } }
// the moon explodes
function moonBlast(M){ try{ const ctr=M.moon.getWorldPosition(MOON_V).clone(), cam=camera.position.clone(), mats=[0xc8c2b8,0x9a948a,0xb0aa9e,0x7a746c].map(c=>new THREE.MeshLambertMaterial({color:c,flatShading:true,emissive:0x1a1a20})), hot=new THREE.MeshLambertMaterial({color:0x5a0a12,flatShading:true,emissive:0xff2a3a,emissiveIntensity:.8}), ch=[];
    for(let i=0;i<220;i++){ const q=Math.random(), s=q<.7?rnd(.3,1.2):q<.95?rnd(1.2,3):rnd(3,6), m=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),i%5===0?hot:mats[i%4]);
      const dir=new THREE.Vector3(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize(); m.position.copy(ctr).addScaledVector(dir,14*Math.pow(Math.random(),.4)); m.userData.temp=1; scene.add(m);
      let vel=dir.clone().multiplyScalar(rnd(6,26)); if(i%3===0&&s<3) vel=cam.clone().add(new THREE.Vector3(rnd(-6,6),rnd(-4,4),0)).sub(m.position).normalize().multiplyScalar(rnd(16,34));
      ch.push({m,v:vel,r:new THREE.Vector3(rnd(-3,3),rnd(-3,3),rnd(-3,3))}); }
    const ring=(col,delay,to)=>{ const r=new THREE.Mesh(new THREE.RingGeometry(.9,1,96),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false})); r.position.copy(ctr); r.lookAt(cam); r.userData.temp=1; scene.add(r); return {r,delay,to}; };
    const rings=[ring(0xffffff,0,110),ring(0xff4a5a,.12,80),ring(0xbfe0ff,.3,140)], core=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xffe8d0,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:1})); core.position.copy(ctr); core.scale.set(70,70,1); core.userData.temp=1; scene.add(core);
    let t=0; Game.fxUpd.push(dt=>{ try{ t+=dt; const gone=!L.mn||t>7;
        if(gone){ ch.forEach(c=>scene.remove(c.m)); rings.forEach(q=>scene.remove(q.r)); scene.remove(core); return false; }
        for(const c of ch){ c.m.position.addScaledVector(c.v,dt); c.m.rotation.x+=c.r.x*dt; c.m.rotation.y+=c.r.y*dt; c.m.rotation.z+=c.r.z*dt; }
        for(const q of rings){ const u=clamp((t-q.delay)/.7,0,1), s=Math.max(.01,14+(q.to-14)*(1-Math.pow(1-u,3))); q.r.scale.set(s,s,1); q.r.material.opacity=u>0?.9*(1-u):0; }
        core.material.opacity=Math.max(0,1-t/.8); core.scale.setScalar(Math.max(.01,70+t*90)); return true; }catch(e){ console.error('moon blast',e); return false; } }); }
  catch(e){ console.error('moon blast',e); } }
// the sheathe: a ching (steel sliding home, then the ring) and a star-glint on the blade
TW_SFX.ching=function(){ Sound.hiss(4200,.12,.07,'bandpass'); Sound.tone('sine',3400,3340,.9,.13,.1); Sound.tone('sine',6800,6720,.6,.06,.1); Sound.tone('triangle',10200,10100,.35,.035,.1); Sound.hiss(9000,.2,.03,'highpass',.1); };
function moonGlintTex(){ if(moonGlintTex.t) return moonGlintTex.t; const [cv,c]=mkCanvas(32,32); c.fillStyle='#fff';
  for(let i=0;i<16;i++){ const w=Math.max(1,Math.round(3-i/6)); c.fillRect(16-w/2,i,w,1); c.fillRect(16-w/2,31-i,w,1); c.fillRect(i,16-w/2,1,w); c.fillRect(31-i,16-w/2,1,w); }
  c.fillRect(13,13,6,6); return moonGlintTex.t=tex(cv); }
function moonGlint(al){ try{ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:moonGlintTex(),color:0xffffff,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false})), g=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xd8e8ff,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false}));
    const x=al.x+.35, y=al.y+1.05, z=al.z+.15; s.position.set(x,y,z); g.position.set(x,y,z); s.userData.temp=g.userData.temp=1; scene.add(s); scene.add(g); if(al.glow) al.glow(.9); FX.spark(x,y,z); let t=0;
    Game.fxUpd.push(dt=>{ try{ t+=dt; const u=t/.55, k=u<.25?u/.25:Math.max(0,1-(u-.25)/.75); s.scale.setScalar(Math.max(.01,2.6*k)); s.material.rotation=t*2.5; g.scale.setScalar(Math.max(.01,3.4*k)); s.material.opacity=g.material.opacity=k;
        if(al.glow) al.glow(.9*k); if(u>=1){ scene.remove(s); scene.remove(g); return false; } return true; }catch(e){ console.error('glint',e); return false; } }); }catch(e){ console.error('glint',e); } }
aliAwaken=function*(){ const P=Player, n=NPCS.find(o=>o.who==='ali'), H=Game.hamza, fl=Game.flags; Sound.stop(); Voice.stop(); Game.letterTo=1; P.atk=null; P.charge=0; P.vx=P.vz=0;
  Cam.focus={x:(n.x+P.x)/2,y:n.perch?(n.y+aliTreeY())/2:n.y,z:(n.z+P.z)/2}; P.f=n.x>P.x?1:-1; n.fdir=-P.f;
  zwStart(); Sound.sfx('heartbeat'); yield wait(.7);
  yield say('ali',"...So. You chose this.",'angry');
  /* he drops from the top of his tree */ FX.burst(n.x,(n.perch?aliTreeY():n.y)+1,n.z,24,0x0c0814,4,.4,false); n.perch=0; n.x=P.x-P.f*1.1; n.z=P.z+.1; n.y=P.y; n.fdir=P.f; FX.burst(n.x,n.y+1,n.z,24,0x0c0814,4,.4,false); Sound.sfx('dash');
  Cam.focus={x:(n.x+P.x)/2,y:P.y,z:(n.z+P.z)/2}; yield wait(.4);
  P.f=-P.f; yield say('shayan',"W-wait! That was an accident! I was aiming at the straw dummy!",'surprised');
  yield say('ali',"While you were hammering horseshoes, I studied the blade.");
  yield say('ali',"There are no accidents. There is only the blade, and those who are beneath it.");
  if(H&&H.mode!=='hidden') yield say('hamza',"Oink oink! Shayan, apologize! That man has main character aura!",'happy');
  yield say('shayan',"I'm sorry! I'm so sorry! I'll fix your sandals for free!");
  yield say('ali',"Fly.",'angry');
  zwEnd(); Sound.sfx('slam'); Sound.sfx('crossboom'); impactFrame([[3,2],[1,2],[2,2]]); shake(1.4); FX.ring(P.x,P.y+.1,P.z,'#ffffff',4,.4); FX.burst(P.x,P.y+.4,P.z,60,0xd8d0c0,9,.4,false);
  P.cineFly=true; P.cineAnim='hurt'; Cam.focus=null; if(H){ H.mode='cine'; }
  const ky={y0:P.y}; cineSet(P.x+5,P.y+2,P.z+12,P.x,P.y+2,P.z);
  const trk=Game.fxUpd.push(()=>{ if(ky.done) return false; Cam.cine.ly=P.y+1; Cam.cine.py=P.y*.6+3; if(H){ H.x=P.x-.4; H.y=P.y-.8; H.z=P.z+.2; } FX.spawn(P.x,P.y,P.z,rnd(-1,1),-8,rnd(-1,1),.4,0xffffff,.4,0,true); return true; });
  Voice.bark('shayanFly'); yield tween(P,{y:P.y+60},1.4,t=>t*t); ky.done=1;
  OV.white=1; OV.wfade=1.4; yield wait(.15);
  // ===== the moon =====
  const aff=Game.aff, kills=Game.kills; loadLevel('moonsky'); Game.aff=aff; Game.flags=fl; Game.kills=kills; P.hidden=true; Game.mira=null; if(mSprite) mSprite.show(false); Game.banner=null;
  const M=L.mn, sh=spr64((c,cx,by,t)=>drawShayanHD(c,cx,by,1,{t,anim:'hurt'})), al=spr64((c,cx,by,t)=>drawAliHD(c,cx,by,1,{t,anim:t<0?'beam':'glide'}));
  sh.x=-2; sh.y=-34; sh.z=-10; al.x=-30; al.y=-60; al.z=0; al.show(false);
  if(H){ H.mode='cine'; H.x=-2.6; H.y=-35; H.z=-9.8; }
  cineSet(0,2,30,0,6,-40); Sound.play('requiem');
  const fol={on:1}; Game.fxUpd.push(dt=>{ if(!fol.on) return false; const tt=performance.now()/1000; sh.redraw(tt); sh.place(sh.x,sh.y,sh.z,sh.y-50); if(al.visible!==false) { al.redraw(fol.slash?-1:tt); al.place(al.x,al.y,al.z,al.y-50); } if(H&&fol.hz){ H.x=sh.x-.6; H.y=sh.y-.4; H.z=sh.z+.3; } return true; });
  fol.hz=1; Voice.bark('shayanScream');
  // he shrinks to a speck as he flies, and is gone when he hits (so is the pig hanging on to his scarf)
  const shr={on:1}; Game.fxUpd.push(()=>{ try{ if(!shr.on) return false; const u=clamp((sh.y+34)/42,0,1), k=Math.max(.001,Math.pow(1-u,1.6)); sh.mesh.scale.set(k,k,1); if(H&&hSprite) hSprite.mesh.scale.set(k,k,1); }catch(e){ console.error('moon shrink',e); } return true; });
  yield tween(sh,{y:8,z:-30.5},2.2,t=>t*(2-t)); shr.on=0; sh.mesh.scale.set(.001,.001,1); if(H&&hSprite) hSprite.mesh.scale.set(.001,.001,1);
  Sound.sfx('slam'); shake(.9); impactFrame([[1,1],[2,1]]); FX.burst(sh.x,sh.y,sh.z+1,60,0xd8d4cc,6,.5,false); FX.ring(sh.x,sh.y,sh.z+.6,'#ffffff',4,.5); moonCrater(M,sh.x,sh.y+.5,sh.z);
  fol.hz=0; if(H){ yield tween(H,{y:sh.y+1.6,x:sh.x-1.5},.5); }
  sh.mesh.scale.set(1,1,1); if(H&&hSprite) hSprite.mesh.scale.set(1,1,1);
  cineSet(2,8,-18,0,8,-31);
  yield say('shayan',"Ow. Okay. I'm on the moon. I'm on the actual moon.");
  if(H) yield say('hamza',"Bismillah. I came along. I was holding your scarf.",'happy');
  // Ali arrives
  al.x=4; al.y=6; al.z=-22; al.show(true); FX.burst(al.x,al.y+1,al.z,40,0x0c0814,6,.5,false); FX.burst(al.x,al.y+1,al.z,20,0xb0182a,6,.4); Sound.sfx('dash'); Sound.sfx('secret'); shake(.3);
  cineSet(9,7,-12,1,8,-28);
  yield say('ali',"The moon has watched over this world for four billion years.");
  yield say('ali',"Tonight it watches you.",'angry');
  yield say('shayan',"What does that even mean?!",'surprised');
  yield say('ali',"Judgement.");
  // 100 cuts in 10 seconds
  cineSet(0,4,6,0,8,-40); Game.moonCut={n:0,pulse:0}; fol.slash=1;
  // 1000 cuts in the time 150 used to take (15s): paced by the clock, several per frame; every cut leaves a gash where it lands
  const CUTS=1000, DUR=15, clk={t:0,done:0}; Game.fxUpd.push(dt=>{ clk.t+=dt; return !clk.done; }); let snd=-1;
  for(let i=0;i<CUTS;){ const due=Math.min(CUTS,Math.floor(clk.t/DUR*CUTS)+1);
    for(;i<due;i++){ const a=rnd(0,6.28), r=rnd(15,21); al.x=Math.cos(a)*r*.9; al.y=8+Math.sin(a)*r*.6; al.z=-34+rnd(-2,8);
      if(i%12===0) FX.burst(al.x,al.y+1,al.z,6,0x0c0814,3,.2,false);
      let line=null; if(i%4===0){ const aa=rnd(0,Math.PI), mx=UW/2+rnd(-200,200), my=UH/2+rnd(-140,140), L0=rnd(500,1100); JC.lines.push({x0:mx-Math.cos(aa)*L0/2,y0:my-Math.sin(aa)*L0/2,x1:mx+Math.cos(aa)*L0/2,y1:my+Math.sin(aa)*L0/2,t:0}); if(JC.lines.length>9) JC.lines.shift();  line=JC.lines[JC.lines.length-1]; }
      const hit=cutMoon(M,line); Game.moonCut.n=i+1; Game.moonCut.pulse=1; if(i%60===0) shake(.2);
      if(hit){ FX.spawn(hit.x,hit.y,hit.z+.5,rnd(-3,3),rnd(-3,3),rnd(1,3),.3,i%2?0xffffff:0xff4a5a,.5,0,true); if(i%3===0) FX.spawn(hit.x,hit.y,hit.z+.5,rnd(-4,4),rnd(-4,4),rnd(2,5),rnd(.5,.9),0xa8a29a,rnd(.15,.3),0,false); } }
    if(clk.t-snd>.09){ snd=clk.t; Sound.sfx(Math.random()<.5?'swing':'hit'); }
    yield wait(.01); }
  clk.done=1;
  JC.lines=[]; fol.slash=0; al.x=0; al.y=-3; al.z=-6; FX.burst(al.x,al.y+1,al.z,30,0x0c0814,5,.4,false);
  cineSet(-1.6,-1.2,0,1.2,6,-40); Sound.stop(); yield wait(.4);
  // no words: his sword flashes once and goes home with a ching
  moonGlint(al); Sound.sfx('ching'); yield wait(1.5);
  // the moon comes apart: impact frames, shockwaves, chunks everywhere (some straight past the camera)
  impactFrame([[3,3],[1,2],[2,2],[3,2],[1,2],[2,1],[3,2],[1,1],[2,1],[3,1]]); Sound.sfx('crossboom'); Sound.sfx('tear'); Sound.sfx('gore'); shake(2); OV.white=.9; OV.wfade=.7; Game.moonCut=null;
  M.moon.visible=false; M.halo.visible=false; sh.dispose(); moonBlast(M);
  for(let k=0;k<4;k++) FX.burst(0,8,-30,140,[0xffffff,0xff3a4a,0xd8d4cc,0xffb060][k],22,1.4);
  for(let i=0;i<90;i++) FX.spawn(0,8,-30,rnd(-12,12),rnd(-12,12),rnd(0,10),rnd(1,2),[0x7a000c,0xb0101a,0x2d5ea8][i%3],rnd(.4,.9),2,false);
  yield wait(.45); impactFrame([[1,2],[3,1],[2,1],[1,1]]); Sound.sfx('slam'); shake(1.2);
  yield wait(1.15); evaCard(['SHAYAN SAQIB','HAS LEFT THE STORY'],2.6,1); Sound.sfx('slam'); yield wait(2.8);
  // the pig survives, somehow
  cineSet(0,4,4,0,4,-10); if(H){ H.mode='cine'; H.x=-.5; H.y=12; H.z=-14; H.flash=1; }
  if(H){ Sound.sfx('oink'); yield tween(H,{y:4.2,x:.3},1.2,t=>t*(2-t)); H.flash=0; }
  if(H){ yield say('hamza',"Bismillah. I'm a fairy. Fairies have plot armor. It's in the contract.",'happy');
    al.x=2.2; al.y=3.4; al.z=-9.5; FX.burst(al.x,al.y+1,al.z,20,0x0c0814,4,.3,false);
    yield say('ali',"...The pig is beneath my blade.");
    yield say('hamza',"Rude. But fair. Oink."); }
  yield fadeOut(); fol.on=0; al.dispose(); yield* aliLanding(fl,aff,kills,H); };