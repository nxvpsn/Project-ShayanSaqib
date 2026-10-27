// =====================================================================
// BOXWOOD RUINS + KOJIMA'S THREE ARENAS POLISH (same pixel style, more detail):
// - Boxwood Ruins (the dungeon road): cracked flagstones with moss in the joints, mossy bricks, thorn roots;
//   ivy and torn spirit banners on the wall, rubble, glowing crystals at the spirit lamps, drifting spirit motes;
// - Day Old Keep (Kojima phase I): cracked, grimy flagstones and chipped bricks; iron fire bowls with flames on the
//   four pedestals, a wainscot with a gold rail, pilasters on the side walls, studio props (spotlight, film reels,
//   director's chair, clapperboard) in the back corners;
// - the blood lake (phase II): sunken torii gates, reed clumps, floating paper lanterns, all away from the arena;
// - the flower field (phase III, also Omar's / Caotan's solo fights, the duo and Nathan): darker ground detail and
//   more tall grass, ferns and small glowing bells. Only ground texture and instanced tufts here, so Omar's Bankai
//   ice covers / frosts them like the lilies (glowing tufts turn black) and Caotan's mural hides them; no new solid
//   props on this map.
// The floor of every boss arena keeps its colours (telegraph readability).
// =====================================================================
function mpTiles(T,biome){ const S=32, px=(c,x,y,w,h,col)=>{ c.fillStyle=col; c.fillRect(x,y,w,h); }, P=PAL[biome];
  const crack=(c,x,y,n,col,k)=>{ for(let i=0;i<n;i++){ px(c,x,y,1,1,col); if(hash(i,k)>.5) x+=hash(k,i)>.5?1:-1; else y+=1; } };
  if(T.flag){ const c=T.flag.image.getContext('2d');
    [[1,1],[17,1],[1,17],[17,17]].forEach(([x,y],i)=>{ crack(c,x+3+Math.floor(hash(i,81)*8),y+2,6+Math.floor(hash(81,i)*5),'rgba(0,0,0,.35)',i+81);
      px(c,x,y,1,1,'rgba(0,0,0,.3)'); px(c,x+13,y+13,1,1,'rgba(0,0,0,.3)'); px(c,x+2,y+2,3,1,'rgba(255,255,255,.12)'); });
    const seam=biome==='ruins'?['rgba(80,140,100,.8)','rgba(60,110,80,.8)']:biome==='keep'?['rgba(0,0,0,.28)','rgba(20,10,20,.3)']:['rgba(0,0,0,.2)'];
    for(let i=0;i<18;i++){ const v=hash(i,83)<.5, t=Math.floor(hash(83,i)*32), o=[0,15,16,31][i%4]; px(c,v?o:t,v?t:o,1,1,seam[i%seam.length]); }
    T.flag.needsUpdate=true; }
  if(T.brick){ const c=T.brick.image.getContext('2d');
    for(let r=0;r<4;r++){ const off=(r%2)*8; for(let k=-1;k<3;k++){ const x=off+k*16, y=r*8+1, h=hash(r,k+7);
      if(h<.3) px(c,x+1,y,15,7,'rgba(0,0,0,.18)'); else if(h>.85) px(c,x+2,y+1,12,1,'rgba(255,255,255,.1)');
      if(hash(k+7,r)>.6) px(c,x+3+Math.floor(h*8),y+6,2,1,'rgba(0,0,0,.35)');   /* chip */
      if(biome==='ruins'&&hash(r+3,k)>.55){ const mx=x+2+Math.floor(hash(k,r+5)*11); px(c,mx,y,3,1,'rgba(80,150,100,.85)'); px(c,mx+1,y+1,1,1+Math.floor(h*3),'rgba(70,130,90,.8)'); } } }
    T.brick.needsUpdate=true; }
  if(biome==='ruins'&&T.thorn){ const c=T.thorn.image.getContext('2d');
    for(let i=0;i<4;i++){ let x=Math.floor(hash(i,91)*28)+2, y=Math.floor(hash(91,i)*20)+2; for(let k=0;k<8;k++){ px(c,x,y,1,1,'#4a1a36'); if(k%3===1) px(c,x+1,y,1,1,'#7a2a5a'); x+=hash(k,i+9)>.5?1:0; y+=1; } } T.thorn.needsUpdate=true; }
  if(biome==='flowers'&&T.grass){ const c=T.grass.image.getContext('2d');
    for(let i=0;i<4;i++){ const x=Math.floor(hash(i,95)*27)+2, y=Math.floor(hash(95,i)*27)+2; px(c,x,y,4,2,cShade(P.g[1],-.25)); }
    for(let i=0;i<26;i++){ const x=Math.floor(hash(i,97)*31), y=Math.floor(hash(97,i)*29)+1, h=1+Math.floor(hash(i,98)*3); px(c,x,y,1,h,P.g[3]); px(c,x,y+h,1,1,P.g[1]); }
    for(let i=0;i<5;i++) px(c,Math.floor(hash(i,99)*31),Math.floor(hash(99,i)*31),1,1,'rgba(207,224,255,.7)');   /* dew in the moonlight */
    T.grass.needsUpdate=true; }
  return T; }
(function(){ const mt=makeTileTextures; makeTileTextures=function(biome){ const T=mt.apply(this,arguments); try{ if(biome==='ruins'||biome==='keep'||biome==='flowers') mpTiles(T,biome); }catch(e){ console.error('map tiles',e); } return T; }; })();
function mpWrap(key,fn){ const f=LEVELDEF[key]; LEVELDEF[key]=function(){ const G=f.apply(this,arguments); try{ fn(G); }catch(e){ console.error(key+' polish',e); } return G; }; }
function mpCanvasTex(w,h,draw){ const [cv,c]=mkCanvas(w,h); draw(c,(x,y,ww,hh,col)=>{ c.fillStyle=col; c.fillRect(x,y,ww,hh); }); return tex(cv); }

// ---------- Boxwood Ruins ----------
mpWrap('ruins',function(G){ const ivyT=[0,1,2].map(s=>mpCanvasTex(16,48,(c,R)=>{ let x=7+s; for(let y=0;y<48;y++){ R(x,y,2,1,'#2a4a3c'); if(hash(y,s)>.55) x+=hash(s,y)>.5?1:-1; x=clamp(x,3,11);
      if(y%5===s%3&&y<46){ const sd=hash(y,s+4)>.5?1:-1, lx=x+(sd>0?2:-3); R(lx,y,3,2,['#2f584a','#467862','#55907a'][(y+s)%3]); R(lx+(sd>0?2:0),y-1,1,1,'#55907a'); } } }));
  const ivyM=ivyT.map(t=>new THREE.MeshLambertMaterial({map:t,transparent:true,alphaTest:.5,side:THREE.DoubleSide}));
  for(let x=1.5;x<58;x+=2.1+hash(Math.round(x*10),3)*1.6){ const top=G.H[4][Math.floor(x)], len=1.6+hash(Math.round(x*10),5)*1.3, m=new THREE.Mesh(new THREE.PlaneGeometry(len/3,len),ivyM[Math.floor(hash(5,Math.round(x*10))*3)]);
    m.position.set(x,top-len/2+.05,6.02); G.root.add(m); }
  // torn spirit banners between the lamps
  const banT=mpCanvasTex(32,64,(c,R)=>{ R(0,0,32,58,'#1a2240'); R(0,0,32,3,'#8a7a5a'); R(2,3,2,55,'#141a34'); R(28,3,2,55,'#141a34');
    R(13,16,6,6,'#8fd8ff'); R(10,22,12,2,'#8fd8ff'); R(15,24,2,12,'#8fd8ff'); R(11,30,10,2,'#5aa0d0'); for(let i=0;i<8;i++) R(i*4,54+(i%3)*2,3,4+(i%2)*3,i%2?'#1a2240':'#141a34');
    for(let i=0;i<14;i++) R(Math.floor(hash(i,61)*30),Math.floor(hash(61,i)*52)+3,1,1,'#0c1026'); });
  const banM=new THREE.MeshLambertMaterial({map:banT,transparent:true,alphaTest:.5,emissive:0x1a3a5a,emissiveIntensity:.4});
  for(const x of [9.5,26,40.5,50]){ const top=G.H[4][Math.floor(x)], b=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2.2),banM); b.position.set(x,top-1.35,6.04); b.rotation.z=(hash(Math.round(x),2)-.5)*.08; G.root.add(b); }
  // rubble along the wall and at the pillars
  const rub=new THREE.MeshLambertMaterial({color:0x555a6e,flatShading:true}), rub2=new THREE.MeshLambertMaterial({color:0x3e4258,flatShading:true});
  const rock=(x,z,s,m)=>{ const y=groundY(x,z); if(y<-1) return; const r=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),m); r.position.set(x,y+s*.35,z); r.scale.y=.6; r.rotation.y=hash(Math.round(x*7),Math.round(z*7))*6; r.castShadow=true; G.root.add(r); };
  for(let i=0;i<22;i++){ const x=1+hash(i,71)*57, z=6.25+hash(71,i)*.35; rock(x,z,.1+hash(i,72)*.16,i%3?rub:rub2); }
  for(const [x,z] of [[4,6.4],[12,6.4],[20,6.5],[31,6.4],[44,6.4],[52,6.4],[57,12.6]]) for(let k=0;k<3;k++) rock(x+(hash(k,Math.round(x))-.5)*1.4,z+.6+hash(Math.round(x),k)*.5,.1+hash(k,Math.round(z*3))*.14,k%2?rub:rub2);
  // glowing crystals at the spirit lamps
  const cry=new THREE.MeshLambertMaterial({color:0x6ab0e0,emissive:0x8fd8ff,emissiveIntensity:1.1,flatShading:true});
  for(const [x,z] of [[6,7.2],[19,7.2],[33,7.2],[47,7.2],[55,12.4]]) for(let k=0;k<3;k++){ const cx=x+[-.35,.32,.1][k], cz=z+[.25,.3,-.3][k], s=[.16,.12,.1][k], y=groundY(cx,cz);
    const m=new THREE.Mesh(new THREE.OctahedronGeometry(s,0),cry); m.position.set(cx,y+s*.9,cz); m.scale.y=1.8; m.rotation.set(.15*(k-1),k,0); G.root.add(m); }
  // drifting spirit motes
  G.anim.push(()=>{ if(Math.random()<.22) FX.spawn(Player.x+rnd(-12,12),rnd(.3,2.5),rnd(6.5,13.5),rnd(-.2,.2),rnd(.1,.35),rnd(-.1,.1),rnd(2.5,4),Math.random()<.7?0x8fd8ff:0xc8b8ff,.12,-.05,true); }); });

// ---------- Day Old Keep (Kojima phase I) ----------
mpWrap('keep',function(G){ const iron=tpMat('iron'), gold=new THREE.MeshLambertMaterial({color:0xc9a24a,emissive:0x3a2a08}), coal=new THREE.MeshLambertMaterial({color:0xff6a2a,emissive:0xff5a1a,emissiveIntensity:1.4});
  const B=[[3.5,5],[16.5,5],[3.5,13.5],[16.5,13.5]];
  for(const [x,z] of B){ const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.55,.32,.3,10),iron); bowl.position.set(x,1.25,z); bowl.castShadow=true; G.root.add(bowl);
    const ember=new THREE.Mesh(new THREE.CylinderGeometry(.46,.46,.04,10),coal); ember.position.set(x,1.4,z); G.root.add(ember);
    for(const a of [0,2.1,4.2]){ const lg=new THREE.Mesh(new THREE.BoxGeometry(.06,.14,.06),iron); lg.position.set(x+Math.cos(a)*.42,1.12,z+Math.sin(a)*.42); G.root.add(lg); } }
  G.anim.push(()=>{ for(const [x,z] of B) if(Math.random()<.45) FX.spawn(x+rnd(-.25,.25),1.45,z+rnd(-.25,.25),rnd(-.15,.15),rnd(1.2,2.2),rnd(-.15,.15),rnd(.35,.6),[0xff7a2a,0xffc04a,0xff4a1a][Math.floor(Math.random()*3)],rnd(.16,.26),-1,true); });
  // back wall: a dark wainscot with a gold rail; side walls: pilasters with gold caps
  addBox(G,16,.9,.06,new THREE.MeshLambertMaterial({color:0x2a1a24}),10,0,4.03,false); addBox(G,16,.08,.1,gold,10,.88,4.05,false);
  for(const x of [2.12,17.88]) for(const z of [6.5,10,13.2]){ addBox(G,.24,5.6,.5,lam(G.tx.brick),x,0,z,false); addBox(G,.34,.14,.6,gold,x,5.6,z,false); addBox(G,.34,.18,.6,tpMat('band'),x,0,z,false); }
  // studio props in the back corners: a spotlight on a stand and film reels (left), the director's chair and a clapperboard (right)
  addBox(G,.06,1.5,.06,iron,2.9,0,4.9,false); addBox(G,.5,.06,.06,iron,2.9,0,4.9,false); addBox(G,.06,.06,.5,iron,2.9,0,4.9,false);
  const hd=addBox(G,.42,.36,.5,iron,2.9,1.5,4.9); hd.rotation.y=.7; const lens=new THREE.Mesh(new THREE.CircleGeometry(.14,12),new THREE.MeshBasicMaterial({color:0xfff2c8})); lens.position.set(3.08,1.68,5.08); lens.rotation.y=.7; G.root.add(lens);
  for(let k=0;k<3;k++){ const r=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.07,14),k===1?tpMat('band'):iron); r.position.set(3.7,.04+k*.08,4.75); G.root.add(r); }
  const ch=new THREE.MeshLambertMaterial({color:0x2a1a14}), cvs=new THREE.MeshLambertMaterial({color:0x8a2a2a});
  addBox(G,.05,.75,.05,ch,16.6,0,4.75,false); addBox(G,.05,.75,.05,ch,17.1,0,4.75,false); addBox(G,.05,.75,.05,ch,16.6,0,5.2,false); addBox(G,.05,.75,.05,ch,17.1,0,5.2,false);
  addBox(G,.56,.06,.5,cvs,16.85,.5,4.97,false); addBox(G,.56,.34,.04,cvs,16.85,.85,4.74,false);
  const clap=mpCanvasTex(16,16,(c,R)=>{ R(0,0,16,16,'#141418'); for(let i=0;i<4;i++) R(i*4,0,2,4,'#e8e8e8'); R(2,7,12,1,'#8a8a90'); R(2,10,12,1,'#8a8a90'); R(2,13,7,1,'#8a8a90'); });
  const cb=new THREE.Mesh(new THREE.PlaneGeometry(.42,.42),new THREE.MeshLambertMaterial({map:clap,side:THREE.DoubleSide})); cb.position.set(15.9,.22,4.6); cb.rotation.set(-.35,-.3,0); G.root.add(cb); });

// ---------- the blood lake (phase II) ----------
mpWrap('lake',function(G){ const red=new THREE.MeshLambertMaterial({color:0x5a1420,flatShading:true}), dk=new THREE.MeshLambertMaterial({color:0x2a0a10});
  for(const [x,z,s,tilt] of [[60,24,1.3,.04],[34,38,1,-.12],[87,34,1.1,.1]]){ const g=new THREE.Group();
    for(const sx of [-2.2,2.2]){ const p=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,4.2,8),red); p.position.set(sx,1.6,0); g.add(p); }
    const top=new THREE.Mesh(new THREE.BoxGeometry(6,.34,.42),red); top.position.y=3.75; g.add(top); const cap=new THREE.Mesh(new THREE.BoxGeometry(6.6,.16,.5),dk); cap.position.y=4; g.add(cap);
    const mid=new THREE.Mesh(new THREE.BoxGeometry(5,.22,.3),red); mid.position.y=3; g.add(mid);
    g.position.set(x,-.4,z); g.scale.setScalar(s); g.rotation.z=tilt; g.rotation.y=(hash(x,z)-.5)*.5; g.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); G.root.add(g); }
  // reed clumps (one instanced mesh)
  const N=26*6, reeds=new THREE.InstancedMesh(new THREE.BoxGeometry(.05,1,.05),dk,N), o=new THREE.Object3D(); let c=0;
  for(let i=0;i<60&&c<N;i++){ const x=8+hash(i,31)*104, z=8+hash(31,i)*100; if(Math.hypot(x-60,z-58)<15) continue;
    for(let k=0;k<6&&c<N;k++){ const h=.5+hash(i,k+40)*1.1; o.position.set(x+(hash(k,i)-.5)*.7,h/2-.05,z+(hash(i+3,k)-.5)*.7); o.rotation.set((hash(k,i+5)-.5)*.3,0,(hash(i+5,k)-.5)*.3); o.scale.set(1,h,1); o.updateMatrix(); reeds.setMatrixAt(c++,o.matrix); } }
  reeds.count=c; G.root.add(reeds);
  // floating paper lanterns, bobbing
  const L2=[], lm=new THREE.MeshLambertMaterial({color:0xff6a3a,emissive:0xff4a1a,emissiveIntensity:1.2});
  for(let i=0;i<70&&L2.length<22;i++){ const x=10+hash(i,51)*100, z=10+hash(51,i)*96; if(Math.hypot(x-60,z-58)<14) continue;
    const g=new THREE.Group(), b=new THREE.Mesh(new THREE.BoxGeometry(.3,.26,.3),lm), t=new THREE.Mesh(new THREE.BoxGeometry(.36,.05,.36),dk); t.position.y=.15; g.add(b); g.add(t); g.position.set(x,.15,z); G.root.add(g); L2.push({g,ph:hash(i,52)*6}); }
  G.anim.push(dt=>{ const t=performance.now()/1000; for(const q of L2){ q.g.position.y=.15+Math.sin(t*1.3+q.ph)*.05; q.g.rotation.y=Math.sin(t*.4+q.ph)*.4; } }); });

// ---------- the flower field (phase III; shared with the twins' solo fights, the duo and Nathan) ----------
mpWrap('flowers',function(G){ scatterTufts(G,0,[{kind:'tall',cols:['#1f3a3a','#284848'],n:900,s:1.3},{kind:'fern',cols:['#1a3232','#284848'],n:500,s:1.15},{kind:'flower',cols:['#9fb8ff','#c8d4ff'],n:600,s:.9,glow:0x4a5aa0}],[0,0,116,108],()=>true); });
