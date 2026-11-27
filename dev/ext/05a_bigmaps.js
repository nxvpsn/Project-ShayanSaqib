// =====================================================================
// BIGGER MAPS (v1.93). The owner: "expand the first map and dungeon map substantially... more platforming, more mobs... things
// that hint at how to solve mechanics in the caotan and omar solo boss fights (a laser trap with caotan's lasers you jump over, a
// portal you walk through, a portal you can't reach so you shoot a fireball through it to hit a switch)".
// Starfall Ridge grows from 82 to 154 wide: between the first gap and the overlook there is now a soldiers' camp (hounds, an archer
// on a stack of crates), a fence of lasers (blue = jump, pink = dash through, one that turns), and a broken bridge of stone steps
// over a chasm (jump, double jump, glide). The overlook and the ambush arena moved east by MZ_S; nothing in them changed.
// Boxwood Ruins grows from 60 to 150 wide, eastward: a barracks behind a gate that opens when the room is dead, a pit crossed
// by a rift in the floor, a bell across a pit that only a shot through a small rift can ring, and three scars of which one glows.
// The two level functions below are the base game's own text with the sizes and the east-side marks changed (generated once
// from game.js, so every tree and lamp of the old part stands where it stood); `mzTerrain/mzDress` and `rzTerrain/rzDress` add
// the new parts. This file loads before 05b/05c, which decorate whatever these build.
// GADGETS (`gz*`, all per level in `G.gz`, run from one `G.anim` hook):
//   gzLaser   a beam between two posts on a cycle (warn, on, off), Caotan's colours and rules: blue sits low and misses anyone
//             in the air, pink is stacked and misses nobody but a dash. `spin` turns it round its first post.
//   gzPortal  a rift. Walk into a ground one and you are at its exit; `shots` ones are too small for you, but fireballs and
//             Getsugas go through and come out aimed at `aim`.
//   gzSwitch  a bell: any player shot within reach rings it once (onHit).   gzGate  bars across cells until opened.
//   gzZone    opens a gate when no enemy is left alive between two x.         'gzck' triggers set the respawn point.
// =====================================================================
const MZ_S=72, RZ_W=150, RZ_D=26;
function gzInit(G){ if(!G.gz){ G.gz={lasers:[],portals:[],switches:[],gates:[],zones:[],pcd:0}; G.anim.push(dt=>{ try{ gzUpdate(G,dt); }catch(e){ console.error('gadgets',e); } }); } return G.gz; }
function gzBeamMesh(G,col,rad){ const g=new THREE.CylinderGeometry(rad,rad,1,10,1,true); g.rotateX(Math.PI/2); g.translate(0,0,.5); const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); m.visible=false; G.root.add(m); return m; }
function gzPost(G,x,z,col,h){ const y=groundY(x,z); if(y<-50) return; addBox(G,.36,h||.95,.36,solidMat(0x1a1d2a),x,y,z); addBox(G,.46,.1,.46,solidMat(0x2c3044),x,y+(h||.95),z,false); const lens=new THREE.Mesh(new THREE.SphereGeometry(.15,8,6),new THREE.MeshBasicMaterial({color:col})); lens.position.set(x,y+.45,z); G.root.add(lens); G.lightSrc.push({x,y:y+.7,z,col,i:.7,r:2.4}); }
function gzLaser(G,o){ const Z=gzInit(G); o=Object.assign({on:.6,off:1.4,warn:.7,phase:0,pink:0,spin:0,w:1},o); const dx=o.x1-o.x0, dz=o.z1-o.z0; o.ang=Math.atan2(dz,dx); o.len=Math.hypot(dx,dz); o.t=o.phase; o.col=o.pink?0xff5aa8:0x9fd8ff; o.gy=groundY(o.x0,o.z0);
  gzPost(G,o.x0,o.z0,o.col,o.pink?2.1:.95); if(!o.spin) gzPost(G,o.x1,o.z1,o.col,o.pink?2.1:.95);
  o.strip=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:o.col,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})); o.strip.geometry.translate(.5,0,0); o.strip.rotation.x=-Math.PI/2; G.root.add(o.strip);
  o.mm=[[gzBeamMesh(G,o.col,.3*o.w),0],[gzBeamMesh(G,0xffffff,.11*o.w),0]]; if(o.pink) o.mm.push([gzBeamMesh(G,o.col,.27*o.w),1.5],[gzBeamMesh(G,0xffffff,.1*o.w),1.5]); Z.lasers.push(o); return o; }
function gzPortal(G,o){ const Z=gzInit(G); o=Object.assign({r:o.shots?.95:1.1,col:0x8a4aff,glow:0},o); const gy=groundY(o.x,o.z); o.y=o.y!=null?o.y:(gy>-50?gy:0);
  const grp=new THREE.Group(), dark=new THREE.Mesh(new THREE.CircleGeometry(o.r,28),new THREE.MeshBasicMaterial({color:0x06030c,side:THREE.DoubleSide})), rim=new THREE.Mesh(new THREE.RingGeometry(o.r*.92,o.r*1.12,36),new THREE.MeshBasicMaterial({color:o.col,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})), in2=new THREE.Mesh(new THREE.RingGeometry(o.r*.45,o.r*.55,24),new THREE.MeshBasicMaterial({color:o.col,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  rim.position.z=.01; in2.position.z=.02; grp.add(dark,rim,in2); if(o.shots){ grp.position.set(o.x,o.y,o.z); grp.rotation.y=o.face||0; } else { grp.rotation.x=-Math.PI/2; grp.scale.set(1,.72,1); grp.position.set(o.x,o.y+.05,o.z); }
  G.root.add(grp); o.grp=grp; o.rim=rim; o.in2=in2; G.lightSrc.push({x:o.x,y:o.y+.8,z:o.z,col:o.glow?0xff3a2a:o.col,i:o.glow?1.6:1.1,r:4.5,flick:1}); Z.portals.push(o); return o; }
function gzSwitch(G,o){ const Z=gzInit(G); o=Object.assign({r:1.1,done:0},o); const br=lam(G.tx.brick); addBox(G,.16,.9,.16,br,o.x,o.y-1.2,o.z,false); addBox(G,.7,.12,.16,br,o.x,o.y+.34,o.z,false);
  o.bell=new THREE.Mesh(new THREE.ConeGeometry(.34,.5,10,1,true),new THREE.MeshLambertMaterial({color:0xe0b94e,emissive:0x6a4a10,side:THREE.DoubleSide})); o.bell.position.set(o.x,o.y,o.z); G.root.add(o.bell); const knob=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),solidMat(0x8a6a2a)); knob.position.set(o.x,o.y-.28,o.z); G.root.add(knob);
  G.lightSrc.push({x:o.x,y:o.y,z:o.z,col:0xffd060,i:.9,r:3.5}); Z.switches.push(o); return o; }
function gzGate(G,o){ const Z=gzInit(G); o=Object.assign({h:3.2,open:0,k:0,bars:[]},o); const iron=solidMat(0x22242e), gy=groundY(o.x-1,o.z0); o.gy=gy;
  for(let z=o.z0;z<=o.z1;z++){ G.B[z][o.x]=true; for(const dz of [.2,.5,.8]){ const b=addBox(G,.12,o.h,.12,iron,o.x+.5,gy,z+dz); o.bars.push(b); } }
  o.top=addBox(G,.3,.24,o.z1-o.z0+1,iron,o.x+.5,gy+o.h,(o.z0+o.z1+1)/2,false); o.rune=new THREE.Mesh(new THREE.BoxGeometry(.34,.34,.5),new THREE.MeshBasicMaterial({color:o.col||0xff4a3a})); o.rune.position.set(o.x+.5,gy+o.h+.12,(o.z0+o.z1+1)/2); G.root.add(o.rune); Z.gates.push(o); return o; }
function gzOpen(G,g){ if(!g||g.open) return; g.open=1; for(let z=g.z0;z<=g.z1;z++) G.B[z][g.x]=false; try{ Sound.sfx('slam'); Sound.sfx('check'); shake(.3); g.rune.material.color.setHex(0x7affb0); FX.burst(g.x+.5,g.gy+1.5,(g.z0+g.z1+1)/2,40,0xc8d0e0,5,.3,false); }catch(e){} }
function gzZone(G,o){ const Z=gzInit(G); Z.zones.push(Object.assign({seen:0,done:0},o)); }
function gzUpdate(G,dt){ const Z=G.gz, P=Player, play=Game.state==='play'&&!Game.script, tm=performance.now()/1000; if(L!==G) return;
  for(const o of Z.lasers){ const near=Math.abs(P.x-(o.x0+o.x1)/2)<30; if(!near){ o.strip.visible=false; for(const q of o.mm) q[0].visible=false; continue; }
    const per=o.warn+o.on+o.off; if(Game.state==='play'||Game.state==='cut') o.t+=dt; let u=o.t%per, a=o.ang, act, k=1; if(o.spin){ a=o.ang+o.t*o.spin; act=true; u=o.warn+.2; } else act=u>=o.warn&&u<o.warn+o.on; if(act&&!o.spin) k=Math.min(1,(u-o.warn)/.06)*Math.min(1,(o.warn+o.on-u)/.1);
    const warn=!act&&u<o.warn; o.strip.visible=act||warn; o.strip.position.set(o.x0,o.gy+.06,o.z0); o.strip.rotation.z=-a; o.strip.scale.set(o.len,o.w*(act?1:.3+.25*(Math.floor(u*14)%2)),1); o.strip.material.opacity=act?.2:.45;
    if(act&&!o.was&&!o.spin&&Math.hypot(P.x-o.x0,P.z-(o.z0+o.z1)/2)<12){ try{ Sound.tone('sawtooth',880,440,.12,.05); }catch(e){} } o.was=act;
    for(const [m,up] of o.mm){ m.visible=act; if(!act) continue; const yy=o.gy+(o.pink?1:.45)+up, wob=1+Math.sin(tm*60)*.1; m.position.set(o.x0,yy,o.z0); m.lookAt(o.x0+Math.cos(a),yy,o.z0+Math.sin(a)); m.scale.set(Math.max(.01,k*wob),Math.max(.01,k*wob),o.len); }
    if(act&&play){ const ux=Math.cos(a), uz=Math.sin(a), px=P.x-o.x0, pz=P.z-o.z0, al=px*ux+pz*uz, pe=Math.abs(px*uz-pz*ux); if(al>-.2&&al<o.len&&pe<o.w*.5+.22&&(o.pink?P.y<o.gy+3.4:P.y<o.gy+1)) twHitP(1,o.x0+ux*al-ux*.3,o.z0+uz*al,{ub:true});
      if(Math.random()<.5) FX.spawn(o.x0+ux*rnd(0,o.len),o.gy+(o.pink?1:.45),o.z0+uz*rnd(0,o.len),rnd(-1,1),rnd(.4,1.6),rnd(-1,1),.3,o.col,.25,0,true); } }
  for(const o of Z.portals){ const pulse=1+Math.sin(tm*3+o.x)*.06; o.rim.scale.setScalar(pulse); o.in2.rotation.z=tm*1.5; o.in2.scale.setScalar(.8+.3*Math.sin(tm*2.2+o.z)); if(o.glow){ const g=.5+.5*Math.sin(tm*2.4); o.rim.material.color.setRGB(1,.18+.2*g,.14+.1*g); }
    if(Math.abs(P.x-o.x)<26&&Math.random()<.25){ if(o.shots) FX.spawn(o.x+rnd(-o.r,o.r)*.7,o.y+rnd(-o.r,o.r)*.7,o.z,0,0,rnd(-.6,.6),.5,o.glow?0xff4a3a:o.col,.2,0,true); else FX.spawn(o.x+rnd(-o.r,o.r)*.8,o.y+.1,o.z+rnd(-o.r,o.r)*.6,0,rnd(.6,1.6),0,.7,o.glow?0xff4a3a:o.col,.22,0,true); }
    if(o.tx==null) continue;
    if(!o.shots&&play&&Game.time>Z.pcd&&!P.cineFly&&Math.hypot(P.x-o.x,(P.z-o.z)/.72)<o.r*.8&&Math.abs(P.y-o.y)<1.2){ Z.pcd=Game.time+1.1; FX.burst(P.x,P.y+1,P.z,30,o.col,5,.3,true); try{ Sound.sfx('tear'); }catch(e){} P.x=o.tx; P.z=o.tz; P.y=groundY(o.tx,o.tz)+.05; P.vx=P.vz=0; P.vy=0; P.inv=Math.max(P.inv,.5); P.lastSafe={x:P.x,z:P.z}; try{ snapCam(); }catch(e){} FX.burst(P.x,P.y+1,P.z,30,o.col,5,.3,true); FX.flash=.25; try{ grade.uniforms.flashCol.value.set(.6,.3,1); }catch(e){} if(o.onUse){ try{ o.onUse(o); }catch(e){ console.error('portal',e); } } }
    if(o.shots||o.both){ const ty=o.ty!=null?o.ty:o.y, aim=o.aim, send=(q,isBeam)=>{ if(q.gz===o) return; const d=Math.hypot(q.x-o.x,q.y-o.y,q.z-o.z); if(d>o.r+.35) return; q.gz=o; FX.burst(q.x,q.y,q.z,16,o.col,4,.25,true); q.x=o.tx; q.y=ty; q.z=o.tz; let dx=aim?aim[0]-o.tx:1, dy=aim?aim[1]-ty:0, dz=aim?aim[2]-o.tz:0; const dd=Math.hypot(dx,dz)||1;
          if(isBeam){ q.dx=dx/dd; q.dz=dz/dd; q.life=Math.max(q.life,.7); try{ q.g.rotation.y=-Math.atan2(q.dz,q.dx); }catch(e){} } else { const sp=Math.hypot(q.vx,q.vz)||20, T=dd/sp; q.vx=dx/dd*sp; q.vz=dz/dd*sp; q.vy=dy/Math.max(.05,T); q.life=Math.max(q.life,T+.3); }
          FX.burst(o.tx,ty,o.tz,16,o.col,4,.25,true); try{ Sound.sfx('tear'); }catch(e){} };
      try{ for(const f of TW.fb) send(f,false); for(const b of BEAMS) send(b,true); }catch(e){ console.error('portal shots',e); } } }
  for(const o of Z.switches){ o.bell.rotation.z=Math.sin(tm*1.3+o.x)*.06+(o.ring>0?Math.sin(tm*30)*.3*o.ring:0); o.ring=Math.max(0,(o.ring||0)-dt*1.2); if(o.done) continue; let hitIt=false; try{ for(const f of TW.fb) if(Math.hypot(f.x-o.x,f.y-o.y,f.z-o.z)<o.r){ hitIt=true; f.life=0; } for(const b of BEAMS) if(Math.hypot(b.x-o.x,b.z-o.z)<o.r+.3&&Math.abs(b.y-o.y)<1.6) hitIt=true; }catch(e){}
    if(hitIt){ o.done=1; o.ring=1; try{ Sound.sfx('bell'); Sound.sfx('secret'); o.bell.material.emissive.setHex(0xffd060); FX.burst(o.x,o.y,o.z,40,0xffe08a,5,.3,true); FX.ring(o.x,o.y-.6,o.z,'#ffd060',2.2,.5); }catch(e){} if(o.onHit){ try{ o.onHit(o); }catch(e){ console.error('switch',e); } } } }
  for(const g of Z.gates){ if(g.open&&g.k<1){ g.k=Math.min(1,g.k+dt*1.4); const d=g.k*g.k*(g.h+.4); for(const b of g.bars) b.position.y=g.gy+g.h/2-d; g.top.position.y=g.gy+g.h+.12-d; g.rune.position.y=g.gy+g.h+.24-d; } }
  for(const z of Z.zones){ if(z.done) continue; if(P.x>z.x0&&P.x<z.x1) z.seen=1; if(z.seen&&play&&!MOBS.some(m=>m.hp>0&&m.x>z.x0&&m.x<z.x1)){ z.done=1; gzOpen(G,z.gate); if(z.onClear){ try{ z.onClear(); }catch(e){ console.error('zone',e); } } } } }
// shamans (and anything else in G.gzMobs) are spawned with the level's own hounds and archers, on load and on every retry
(function(){ const sm=spawnMobsFromLevel; spawnMobsFromLevel=function(){ const r=sm.apply(this,arguments); try{ for(const e of (L.gzMobs||[])) MOBS.push(makeMob(e[0],e[1],e[2])); }catch(e){ console.error('gz mobs',e); } return r; }; })();
// 'gzck': a checkpoint line. 'gz:<name>' runs GZ_SCR[name] (a cutscene for whoever is the hero) once.
const GZ_SCR={};
(function(){ const gt=Game.trigger; Game.trigger=function(id){ try{ if(id==='gzck'){ const t=L.trig.filter(q=>q.id==='gzck'&&q.done).pop(); if(t){ L.check={x:t.cx,z:t.cz}; Game.dmgNums.push({x:Player.x,y:Player.y+2.6,z:Player.z,n:'CHECKPOINT',t:0,col:'#9fe0ff'}); Sound.sfx('check'); } return; }
      if(typeof id==='string'&&id.slice(0,3)==='gz:'){ const f=GZ_SCR[id.slice(3)]; if(f) run(f); return; } }catch(e){ console.error('gz trigger',e); } return gt.apply(this,arguments); }; })();
// ---------- the two levels: the base game's text, resized (see the header) ----------
LEVELDEF.meadow=function(){ const S=MZ_S, W=82+S; const G=newGrid(W,26,'meadow'); G.tx=makeTileTextures('meadow'); Object.assign(G,{cam:{y:3.7,z:15.5,up:1.9},key:'meadow',look:'meadow',music:'field',name:'Starfall Ridge',sub:'Where the moonpetals bloom',spawn:[2.5,10.5],bottom:-14});
    const H=x=>x<12?0:x<20?1:x<28?2:x<34?4:x<42?-99:x<92?3:x<114?-99:2, isGap=x=>(x>=34&&x<42)||(x>=92&&x<114);
    for(let z=0;z<26;z++) for(let x=0;x<W;x++){ const gap=isGap(x); G.H[z][x]=z<=4?-99:(z>=23||(z>=17&&x<49+S))?H(x)+(gap?-999:.6):H(x); }
    boxH(G,37,9,38,11,3.4,'flag'); blockB(G,0,5,W-1,5); for(let x=0;x<W;x++) if(G.H[5][x]<-50) G.B[5][x]=false;
    blockB(G,0,17,48+S,21); blockB(G,0,23,W-1,25); for(let z=17;z<26;z++) for(let x=0;x<W;x++) if(isGap(x)){ G.B[z][x]=false; G.H[z][x]=-99; }
    for(let x=0;x<W;x++) if(isGap(x)){ G.B[16][x]=false; }
    blockB(G,0,0,0,25); blockB(G,W-1,0,W-1,25);
    for(let x=56+S;x<63+S;x++) G.B[5][x]=false; boxH(G,56+S,4,62+S,4,2,'grass'); blockB(G,56+S,3,62+S,3);
    for(let x=0;x<56+S;x++){ const zc=11+Math.sin(x*.22)*2.2+Math.sin(x*.07)*1; for(let z=Math.round(zc-.9);z<=Math.round(zc+.6);z++) if(z>5&&z<17&&G.H[z][x]>-50) G.T[z][x]='path'; }
    mzTerrain(G);
    buildTerrain(G,G.tx);
    [[3,6,'oak'],[7,6.3,'blossom'],[11,6,'pine'],[17,6,'oak'],[21,6.2,'blossom'],[25,6.4,'pine'],[45,6,'oak'],[48,6.3,'blossom'],[52,6.2,'pine'],[29,6.1,'oak']].forEach(([x,z,k])=>{ addTree(G,x+.5,z+.5,k,k==='pine'?1.1:1.05); G.B[Math.floor(z)][Math.floor(x)]=true; });
    [[1.5,16.3,'blossom'],[13.5,16.4,'oak'],[24,16.5,'blossom']].forEach(([x,z,k])=>addTree(G,x,z,k,.8));
    const BC={}; for(let i=0;i<22;i++){ const x=1+hash(i,21)*54, z=hash(21,i)<.5?6.4+hash(i,22)*1.2:15.2+hash(i,22)*1.2; if((x>33&&x<42)||(x>43&&z>12)) continue; const k=i%3; const cv=BC[k]||(BC[k]=bushSprite(k,k===1?['#3a6a2a','#4f8a3a','#78ae52','#a8d070']:null)); const m=billboard(cv,1.6,1.05,{foot:.05}); m.position.set(x,groundY(x,z),z); G.root.add(m); }
    [[6,15.5],[15,16],[26,15.6],[31,15.2],[19.5,7.2],[44,7.1]].forEach(([x,z],i)=>{ addRock(G,x,z,.32+hash(i,2)*.25,0x8a8478); addRock(G,x+.45,z+.2,.18,0x7a7468); });
    // pond with reeds and lily pads
    const pond=new THREE.Mesh(new THREE.CircleGeometry(1,28),new THREE.MeshLambertMaterial({color:0x4a90c8,emissive:0x0a2a48,transparent:true,opacity:.86})); pond.scale.set(2.6,1.5,1); pond.rotation.x=-Math.PI/2; pond.position.set(6,.03,12.6); G.root.add(pond);
    for(let i=0;i<6;i++){ const a=i*1.1, pad=new THREE.Mesh(new THREE.CircleGeometry(.22,8),new THREE.MeshLambertMaterial({color:0x4a8a3a})); pad.rotation.x=-Math.PI/2; pad.position.set(6+Math.cos(a)*1.7,.05,12.6+Math.sin(a)*.9); G.root.add(pad); }
    for(let z=11;z<=13;z++) for(let x=4;x<=7;x++) if(Math.hypot((x+.5-6)/2.6,(z+.5-12.6)/1.5)<.85) G.B[z][x]=true;
    const log=new THREE.Mesh(new THREE.CylinderGeometry(.28,.3,2.6,10),lam(G.tx.wood)); log.rotation.z=Math.PI/2; log.rotation.y=.4; log.position.set(16,1.28,14.6); log.castShadow=true; G.root.add(log);
    const sign=new THREE.Group(); const wd=lam(G.tx.wood); const post=new THREE.Mesh(new THREE.BoxGeometry(.12,1.3,.12),wd); post.position.y=.65; sign.add(post); const bd=new THREE.Mesh(new THREE.BoxGeometry(1,.34,.06),wd); bd.position.set(.25,1.15,0); sign.add(bd); sign.position.set(10.5,1,8); sign.traverse(o=>o.castShadow=true); G.root.add(sign);
    G.anim.push(dt=>{ if(Math.random()<.18){ const x=Player.x+rnd(-10,10), z=rnd(7,16), h=cellH(x,z); if(h<50&&h>-50) FX.spawn(x,h+rnd(.4,1.4),z,rnd(-.8,.8),rnd(-.2,.4),rnd(-.3,.3),rnd(2,4),[0xffe08a,0xf6b0d0,0xbfe0ff,0xffffff][Math.floor(Math.random()*4)],.13,-.05,false); } });
    scatterTufts(G,0,[{kind:'grass',cols:['#4a8a3a','#6eb04c','#9ccc64'],n:900,s:1},{kind:'flower',cols:['#ffffff','#d9e6ff','#f6c8e0','#f2c14e'],n:380,s:1},{kind:'flower',cols:['#e86a8a','#f6b0d0','#ffd86a','#b88aff'],n:240,s:1.1},{kind:'tall',cols:['#3f7a2e','#5a9a3a','#7ab04a'],n:220,s:1.45},{kind:'fern',cols:['#3a7a3a','#4f9a48'],n:110,s:1.3}],[0,4,W,26]);
    G.trig.push({x:30,id:'glideHint'},{x:43,id:'meadowTalk'},{x:57+S,id:'overlook'});
    G.spots.overlook={x:61.5+S,z:6.4,y:2}; G.spots.arenaSafe={x:78+S,z:20.5};
    G.arena={x0:49.3+S,x1:80.7+S,z0:6.2,z1:22.6};
    [[66+S,6.6,'oak'],[72+S,6.4,'blossom'],[78+S,6.5,'pine'],[57,6.3,'pine'],[73,6.2,'oak'],[86,6.2,'blossom'],[116,6.3,'pine']].forEach(([x,z,k])=>{ addTree(G,x,z,k,1.05); G.B[Math.floor(z)][Math.floor(x)]=true; });
    [[58+S,9],[70+S,13],[75+S,9.5],[64+S,19],[54+S,18],[52,15.6],[72.5,15.4],[75,7.2],[92.2,15.5]].forEach(([x,z],i)=>addRock(G,x,z,.3+hash(i,5)*.2,0x8a8478));
    G.root.add(skyDome(LOOKS.meadow.sky,LOOKS.meadow.sunDir,LOOKS.meadow.sunCol,LOOKS.meadow.sunSize));
    const fields=new THREE.Mesh(new THREE.PlaneGeometry(900,500),new THREE.MeshLambertMaterial({map:fieldsTex(),color:0x5a6a9a})); fields.material.map.repeat.set(9,5); fields.rotation.x=-Math.PI/2; fields.position.set(32,-46,-200); G.root.add(fields);
    G.colossus=colossusPlane(G,'night',{bone:'#c8d4f0',shade:'#7a88b6',dark:'#22264c',halo:'#bacefe',glow:'#78c8ff',hazeTop:'rgba(40,56,130,.4)',hazeBot:'rgba(30,44,110,.62)'},360,180,30,-14,-235,{ro:-7});
    farPlane(G,ridgeTex(['#0a0e22','#141a36'],1,3,0),800,170,20,-6,-260,{ro:-7}); farPlane(G,ridgeTex(['#05071a','#0a0e24'],4,4,0),700,120,30,-24,-170,{ro:-6});
    if(typeof nightSky==='function') nightSky(G,{x:W/2,moon:1,stars:2600});
    [[-30,-10,-80,6],[70,-4,-110,9],[110,6,-160,12],[10,0,-130,5]].forEach(([x,y,z,s])=>islandMesh(G,x,y,z,s));
    mzDress(G);
    return G; };
LEVELDEF.ruins=function(){ const W=RZ_W, D=RZ_D, G=newGrid(W,D,'ruins'); G.tx=makeTileTextures('ruins'); Object.assign(G,{cam:{y:5.6,z:15.5,up:1.1},key:'ruins',look:'ruins',music:'night',name:'Boxwood Ruins',sub:'The road to Day Old Keep',spawn:[2.5,9.5],bottom:-14});
    const H=x=>x<10?0:x<14?1:x<22?2.2:x<29?0:x<36?2:x<42?-99:3;
    for(let z=0;z<D;z++) for(let x=0;x<W;x++){ G.H[z][x]=z>=14?-99:H(x); G.T[z][x]=x>=22&&x<29?'thorn':'flag'; }
    for(let z=3;z<=5;z++) for(let x=0;x<W;x++){ G.H[z][x]=Math.max(G.H[z][x],0)+4; G.T[z][x]='brick'; } blockB(G,0,0,W-1,5); for(let z=0;z<3;z++) for(let x=0;x<W;x++) G.H[z][x]=-99;
    for(let z=6;z<14;z++) for(let x=36;x<42;x++) G.H[z][x]=-99;
    boxH(G,23,8,24,9,2,'flag'); boxH(G,25,10,26,11,2.4,'flag'); boxH(G,27,7,28,8,2,'flag'); boxH(G,38,9,39,10,3,'flag');
    blockB(G,0,0,0,D-1); blockB(G,W-1,0,W-1,D-1); rzTerrain(G);
    buildTerrain(G,G.tx);
    [[4,6.4,3,0],[12,6.4,2.4,1],[20,6.5,3,0],[31,6.4,2.6,1],[44,6.4,3.4,0],[52,6.4,2,1],[57,12.6,3,0],[64,6.4,3,1],[87,6.4,2.6,0]].forEach(([x,z,h,b])=>{ if(groundY(x,z)<-50) return; addPillar(G,x,z,h,b); G.B[Math.floor(z)][Math.floor(x)]=true; });
    [[6,7.2],[19,7.2],[33,7.2],[47,7.2],[55,12.4]].forEach(([x,z])=>{ addSpiritLamp(G,x,z); G.B[Math.floor(z)][Math.floor(x)]=true; });
    for(let i=0;i<34;i++) addTree(G,2+i*4.3,1.4,i%3?'pine':'dead',1.2);
    for(let x=22.2;x<29;x+=.55) for(let z=6.2;z<14;z+=.7) if(cellT(x,z)==='thorn'&&cellH(x,z)<.1){ const c=document.createElement('canvas'); }
    scatterTufts(G,0,[{kind:'grass',cols:['#2f584a','#467862'],n:760,s:1},{kind:'fern',cols:['#2f6a54','#3e8a6a'],n:300,s:1.4},{kind:'flower',cols:['#9fd8ff','#c8b8ff'],n:180,s:1,glow:0x6ab0ff}],[0,6,W,20],(t)=>t==='flag');
    scatterTufts(G,0,[{kind:'tall',cols:['#5a2a4a','#7a2a5a'],n:220,s:1.3}],[22,6,29,14],(t)=>t==='thorn');
    G.ents.push({type:'hound',x:8,z:9},{type:'hound',x:17,z:9.5},{type:'archer',x:33,z:11},{type:'hound',x:46,z:8},{type:'archer',x:55,z:9},{type:'hound',x:53,z:7},{type:'shrine',x:31,z:9});
    G.pick.push({kind:'heart',x:25.5,z:10.5},{kind:'heart',x:43,z:12});
    addArch(G,W-1.6,10.5,0xff4a3a); G.lightSrc.push({x:W-2,y:10,z:10.5,col:0xff4a3a,i:2,r:8});
    G.trig.push({x:W-2.6,id:'keepGate'}); rzDress(G);
    G.root.add(skyDome(LOOKS.ruins.sky,LOOKS.ruins.sunDir,LOOKS.ruins.sunCol,LOOKS.ruins.sunSize)); stars(G,1400,0xdde6ff,1.6);
    G.skyMoon=farPlane(G,moonTex('#e8eefc','200,215,255'),60,60,-40,70,-260,{ro:-8,add:true});
    const [kc,kx]=mkCanvas(256,256); kx.fillStyle='#0c1026'; kx.fillRect(110,80,40,120); kx.fillRect(90,110,24,90); kx.fillRect(146,100,26,100); kx.fillRect(126,50,8,40);
    for(let i=0;i<70;i++){ const w=Math.max(0,120-Math.abs(i-35)*3.4); kx.fillRect(128-w,190+i,w*2,1); } kx.fillStyle='#ff4a3a'; [[118,110],[134,130],[96,140],[154,124],[124,160]].forEach(([x,y])=>kx.fillRect(x,y,4,6));
    farPlane(G,texSmooth(kc),120,120,80,10,-220,{ro:-7});
    farPlane(G,ridgeTex(['#141a36','#1e2648'],3,4,0),700,140,20,-20,-180,{ro:-6});
    return G; };
// ---------- Starfall Ridge: what is new between the first gap and the overlook ----------
function mzTerrain(G){ /* the broken bridge: three steps up, then a long drop to the far side; a low stone off to one side with a heart on it */
  boxH(G,94,9,96,12,3,'grass'); boxH(G,99,10,100,11,4.2,'flag'); boxH(G,103,8,104,9,5.2,'flag'); boxH(G,108,13,109,14,2.6,'grass'); boxH(G,68,7,69,8,4.6,'flag'); /* the archer's stack of crates */ }
function mzTent(G,x,z,col){ const y=groundY(x,z), m=new THREE.Mesh(new THREE.ConeGeometry(1.25,1.5,4),new THREE.MeshLambertMaterial({color:col,flatShading:true})); m.position.set(x,y+.75,z); m.rotation.y=Math.PI/4; m.castShadow=true; G.root.add(m); addBox(G,.5,.8,.06,solidMat(0x1a1410),x,y,z+.9,false); G.B[Math.floor(z)][Math.floor(x)]=true; }
function mzDress(G){ const S=MZ_S;
  try{ mzTent(G,55,7.6,0x5a6a4a); mzTent(G,59.2,7.4,0x4a5a6a); mzTent(G,63.6,7.7,0x5a6a4a);
    { /* the fire, a camera on a tripod pointed at it, the director's chair nobody is allowed to sit in */ const y=groundY(61,11.2), wood=lam(G.tx.wood); for(let i=0;i<3;i++){ const l=addBox(G,.9,.14,.14,wood,61,y,11.2,false); l.rotation.y=i*1.05; } G.lightSrc.push({x:61,y:y+.6,z:11.2,col:0xff7a3a,i:2.2,r:8,flick:1,fire:1}); G.anim.push(()=>{ if(L===G&&Math.abs(Player.x-61)<24&&Math.random()<.5) FX.spawn(61+rnd(-.2,.2),y+.2,11.2+rnd(-.2,.2),rnd(-.2,.2),rnd(1,2.2),0,.5,Math.random()<.5?0xff8a3a:0xffd45a,.22,0,true); });
      addBox(G,.06,1.1,.06,solidMat(0x22222a),57.3,y,12.6,false); addBox(G,.06,1.1,.06,solidMat(0x22222a),57.7,y,12.6,false); addBox(G,.06,1.1,.06,solidMat(0x22222a),57.5,y,12.9,false); addBox(G,.5,.34,.36,solidMat(0x14141c),57.5,y+1.1,12.7); addBox(G,.16,.16,.2,solidMat(0x3a3a48),57.82,y+1.2,12.7,false); G.B[12][57]=true;
      addBox(G,.5,.06,.5,solidMat(0x8a2a2a),59,y+.5,13.2,false); addBox(G,.5,.5,.06,solidMat(0x8a2a2a),59,y+.56,13.44,false); for(const [ax,az] of [[-.22,-.22],[.22,-.22],[-.22,.22],[.22,.22]]) addBox(G,.05,.5,.05,solidMat(0x2a2a30),59+ax,y,13.2+az,false);
      for(const [cx,cz,ch] of [[66,13.4,.7],[66.7,13.6,.5],[66.2,13.5,.5]]) addBox(G,.7,ch,.7,wood,cx,y+(ch===.5&&cx===66.2?.7:0),cz); G.B[13][66]=true; }
    G.ents.push({type:'hound',x:56,z:10},{type:'hound',x:62.5,z:14},{type:'hound',x:65,z:9.5},{type:'archer',x:68.6,z:8},{type:'hound',x:71,z:12});
    G.pick.push({kind:'heart',x:53.5,z:15.2},{kind:'heart',x:108.6,z:13.6});
    /* the fence of lights: blue ones fire low, the pink one is stacked, one blue turns on its post */
    gzLaser(G,{x0:77,z0:6.15,x1:77,z1:16.75,on:.55,off:1.5}); gzLaser(G,{x0:80,z0:6.15,x1:80,z1:16.75,on:2.2,off:.9,phase:.5});
    gzLaser(G,{x0:83,z0:6.15,x1:83,z1:16.75,on:.7,off:.9}); gzLaser(G,{x0:84.6,z0:6.15,x1:84.6,z1:16.75,on:.7,off:.9,phase:1.15});
    gzLaser(G,{x0:87.6,z0:11.4,x1:87.6,z1:16.4,spin:1.5}); gzLaser(G,{x0:90.4,z0:6.15,x1:90.4,z1:16.75,on:1.1,off:1.7,pink:1});
    G.ents.push({type:'hound',x:117,z:13.5}); G.gzMobs=[['shaman',125,10]]; /* far enough back that he only wakes once you have landed */
    G.trig.push({x:50.5,id:'gz:mzCamp'},{x:50.6,id:'gzck',cx:50,cz:11},{x:74,id:'gz:mzLasers'},{x:74.1,id:'gzck',cx:73.6,cz:11},{x:91.2,id:'gz:mzChasm'},{x:91.3,id:'gzck',cx:91,cz:11},{x:114.6,id:'gzck',cx:115.4,cz:11});
  }catch(e){ console.error('ridge dress',e); } }
const gzEase=t=>t*t*(3-2*t);
function* gzShot(p,l,dur){ Game.letterTo=1; Player.scripted={x:0,z:0}; yield cineTo(p,l,dur||1,gzEase); yield wait(.25); }
function gzShotEnd(){ Cam.cine=null; Game.letterTo=0; Player.scripted=null; }
GZ_SCR.mzCamp=function*(){ yield* gzShot([61,6.6,21],[61,3.4,10.5],1.1);
  if(ALI()){ yield say('mira',"Soldiers. Those are Kojima's colours."); yield say('ali',"Four. One on high ground. I've had worse mornings."); yield say('mira',"Shayan would have made a plan."); yield say('ali',"This is the plan."); }
  else { yield say('mira',"Soldiers. Those are Kojima's colours.",'worried'); yield say('shayan',"Why do they have a camera on a tripod?"); yield say('mira',"He films everything. Then he adds forty minutes of somebody walking."); yield say('shayan',"Sword for the close ones. Something that flies for the one on the crates."); }
  gzShotEnd(); };
GZ_SCR.mzLasers=function*(){ yield* gzShot([83.5,6.4,21.5],[83.5,3.4,11],1);
  if(ALI()){ yield say('mira',"Wait! Tripwire lights. Caotan sells those."); yield say('ali',"Blue is low. Jump it."); yield say('mira',"And the pink one?"); yield say('ali',"Pink is rude. Step through it faster than it can count."); }
  else { yield say('mira',"Wait! Tripwire lights. Caotan sells those. He demonstrated them at the harvest festival. On himself. For an hour.",'worried'); yield say('shayan',"Blue ones sit low. I can jump blue."); yield say('mira',"And the pink one?"); yield say('shayan',"...I was going to ask it nicely."); yield say('mira',"You don't jump pink. You go through pink. Fast, like you owe it money."); }
  gzShotEnd(); };
GZ_SCR.mzChasm=function*(){ yield* gzShot([101,8.6,22],[102,4,10.5],1.1);
  if(ALI()){ yield say('mira',"The bridge is gone."); yield say('ali',"Stones. Good. I prefer them to bridges. Bridges have opinions."); }
  else { yield say('mira',"The bridge is gone.",'worried'); yield say('shayan',"The bridge is in pieces. That's still most of a bridge."); yield say('mira',"Jump, jump again, then hold. Like the kid on the watchtower said."); }
  gzShotEnd(); };

// ---------- Boxwood Ruins: the four rooms east of the old road ----------
function rzTerrain(G){ const fl=(x0,x1,z0,z1,h)=>{ for(let z=z0;z<=z1;z++) for(let x=x0;x<=x1;x++){ G.H[z][x]=h; G.T[z][x]='flag'; G.B[z][x]=false; } }, vd=(x0,x1,z0,z1)=>{ for(let z=z0;z<=z1;z++) for(let x=x0;x<=x1;x++){ G.H[z][x]=-99; } }, wall=(x0,x1,h)=>{ for(let z=3;z<=5;z++) for(let x=x0;x<=x1;x++){ G.H[z][x]=h; G.T[z][x]='brick'; } };
  fl(58,75,6,19,3); /* the barracks */ fl(76,83,6,19,3); vd(84,88,6,25); fl(89,95,6,19,8); wall(89,95,12); /* the pit and the black wall beyond it */
  fl(96,116,6,13,3); vd(109,112,6,13); fl(104,106,6,6,6.2); /* a pit before the gate; the bell's ledge, high on the back wall */ fl(117,126,6,13,3); vd(127,131,6,25); fl(132,RZ_W-2,6,15,8); wall(132,RZ_W-1,12); /* the scars, the last pit, the gate's terrace */
  for(const x of [76,114]) for(let z=14;z<RZ_D;z++){ if(G.H[z][x]<-50) G.B[z][x]=true; } /* nobody floats round the end of a gate */ }
function rzDress(G){ try{ const hero=()=>ALI()?'ali':'shayan';
    for(const x of [62,71,80,92,99,109,120,135,143]){ addSpiritLamp(G,x,7.2); G.B[7][x]=true; }
    G.ents.push({type:'hound',x:62,z:9.5},{type:'hound',x:66,z:13},{type:'hound',x:70,z:16.5},{type:'hound',x:72.5,z:8.5},{type:'archer',x:73.5,z:17.5},{type:'hound',x:99,z:9},{type:'archer',x:103,z:12},{type:'hound',x:124,z:8.5});
    G.gzMobs=(G.gzMobs||[]).concat([['shaman',50,11],['shaman',68.5,18],['shaman',125,12]]);
    G.pick.push({kind:'heart',x:74.2,z:7.6},{kind:'heart',x:93.4,z:8.2},{kind:'heart',x:112.4,z:7.4},{kind:'heart',x:144,z:13});
    /* 1) the barracks: the bars drop when the room is dead */ const g1=gzGate(G,{x:76,z0:6,z1:19}); gzZone(G,{x0:58,x1:76,gate:g1});
    /* 2) the pit: a rift in the floor is the only way up the black wall */ gzPortal(G,{x:81.5,z:12.5,tx:91.6,tz:12.5,onUse(o){ if(!o.said){ o.said=1; if(ALI()) twBark('ali',"Hm. Efficient.",true); else twBark('shayan',"...I'm fine. My stomach is still back there.",true); } }}); gzPortal(G,{x:91.6,z:14.6,r:.8});
    /* 3) the bell: out of reach on its pillar; a small rift over the pit carries a shot to it */ const g2=gzGate(G,{x:114,z0:6,z1:13,col:0xffd060});
    gzPortal(G,{x:110.5,y:4.15,z:10,shots:1,face:Math.PI/2,tx:100.4,ty:7.5,tz:6.7,aim:[105,7.5,6.6]}); gzPortal(G,{x:100.1,y:7.5,z:6.7,shots:1,r:.7,face:Math.PI/2});
    gzSwitch(G,{x:105,y:7.5,z:6.6,onHit(){ gzOpen(G,g2); if(ALI()) twBark('ali',"Hm.",true); else twBark('shayan',"Ha! Still got it.",true); }});
    /* 4) three scars: the one that glows goes on, the other two put you back at the door with company */ const back=(o)=>{ if(ALI()) twBark('ali',"Liar.",true); else twBark('shayan',"Wrong hole.",true); if(!o.amb){ o.amb=1; MOBS.push(makeMob('hound',120.5,8),makeMob('hound',120.5,12)); } };
    gzPortal(G,{x:122,z:8.2,tx:118,tz:10,onUse:back}); gzPortal(G,{x:124.4,z:11.6,tx:134.5,tz:10.5,glow:1}); gzPortal(G,{x:121.6,z:12.4,tx:118,tz:10,onUse:back}); gzPortal(G,{x:134.5,z:13,r:.8});
    gzLaser(G,{x0:139,z0:6.15,x1:139,z1:15.8,on:.7,off:1.1}); gzLaser(G,{x0:142,z0:6.15,x1:142,z1:15.8,on:1,off:1.5,pink:1,phase:.6});
    G.anim.push(dt=>{ if(L!==G||!G.cam) return; if(G.cam.up0==null) G.cam.up0=G.cam.up; const want=(Player.x>96&&Player.x<114)?1.3:0; G.camK=(G.camK||0)+(want-(G.camK||0))*Math.min(1,dt*2); G.cam.up=G.cam.up0+G.camK; });
    G.trig.push({x:58.6,id:'gz:rzBarracks'},{x:58.7,id:'gzck',cx:58.6,cz:9.5},{x:77.4,id:'gz:rzPortal'},{x:77.5,id:'gzck',cx:78,cz:10},{x:90,id:'gzck',cx:91.6,cz:11},{x:97.6,id:'gz:rzSwitch'},{x:97.7,id:'gzck',cx:98,cz:9.5},{x:115.4,id:'gz:rzScars'},{x:115.5,id:'gzck',cx:116,cz:9.5},{x:133,id:'gzck',cx:134.5,cz:9});
  }catch(e){ console.error('ruins dress',e); } }
GZ_SCR.rzBarracks=function*(){ yield* gzShot([70,8.6,24],[72,4.6,12],1.1);
  if(!ALI()) yield say('shayan',"More of them. And that door has no handle.");
  yield say('',"Carved across the bars, in very large letters: EVERYONE IN THIS ROOM IS A SPEED BUMP.");
  if(ALI()) yield say('ali',"Then I will be brief."); else yield say('shayan',"...Rude. Accurate, but rude.");
  gzShotEnd(); };
GZ_SCR.rzPortal=function*(){ yield* gzShot([85,10,25],[87,6,12],1.2);
  yield say('',"The floor ends. Across the pit stands a wall of black stone, five times your height. At your feet, a wound in the ground hums like a held note.");
  if(ALI()) yield say('ali',"A rift. The reaper twin leaves them around like socks."); else yield say('shayan',"A hole that goes somewhere else. That's Omar's. It smells like eyeliner.");
  gzShotEnd(); };
GZ_SCR.rzSwitch=function*(){ yield* gzShot([106,8.6,24],[106,6,9],1.2);
  yield say('',"A bell hangs on a ledge high on the wall, far above reach. Ahead, out over the pit, a tear in the air no wider than a shield hums at head height.");
  if(ALI()) yield say('ali',"Too small for a man. Not for a cut."); else yield say('shayan',"Too small for a blacksmith. Not too small for a fireball.");
  gzShotEnd(); };
GZ_SCR.rzScars=function*(){ yield* gzShot([122.5,7.6,20],[122.5,3.4,10.4],1.1);
  yield say('',"Three scars in the floor. Two of them are liars.");
  if(ALI()) yield say('ali',"One of them glows. Something beyond it is taking aim. That is the honest one."); else yield say('shayan',"One of them is glowing. Like something on the other side is looking back.");
  gzShotEnd(); };
