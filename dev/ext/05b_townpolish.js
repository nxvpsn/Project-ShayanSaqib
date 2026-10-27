// =====================================================================
// TOWN + STARFALL RIDGE POLISH (same pixel style, more detail):
// - ground tiles (both maps): grass blades, clumps and pebbles, worn paths with shaded pebbles and cracks,
//   cobbles with moss in the joints and a highlight per stone;
// - Lanternbrook houses: flower boxes under every window (they follow the wall texture's windows), a stone door
//   step, eave trim and a ridge cap on the roof, chimney smoke, barrels and crates by the walls (all part of the
//   house: smashing it takes them down too); strings of paper lanterns between the lamp posts;
// - Starfall Ridge (where the mobs ambush you): dark green grass and tufts, ferns, mushrooms by the trees.
// The first village of a session is built before ext.js runs; New Game / Continue rebuild it with all of this.
// =====================================================================
Object.assign(PAL.meadow,{g:['#2f6a2c','#285e27','#3b7a35','#4f8f42'],flower:['#fff','#d9e6ff','#f6c8e0','#f2c14e']});
function polishTiles(T,biome){ const P=PAL[biome], S=32, px=(c,x,y,w,h,col)=>{ c.fillStyle=col; c.fillRect(x,y,w,h); }, dk=cShade(P.g[1],-.28), hi=cShade(P.g[3],.12);
  // grass: blades (highlight over a shadow pixel), darker clumps, the odd pebble
  { const c=T.grass.image.getContext('2d'); for(let i=0;i<5;i++){ const x=Math.floor(hash(i,41)*28)+1, y=Math.floor(hash(41,i)*28)+2; px(c,x,y,4,2,dk); px(c,x+1,y-1,2,1,dk); }
    for(let i=0;i<34;i++){ const x=Math.floor(hash(i,43)*31), y=Math.floor(hash(43,i)*29)+1, h=1+Math.floor(hash(i,44)*3); px(c,x,y,1,h,i%3?P.g[3]:hi); px(c,x,y+h,1,1,P.g[1]); if(i%4===0) px(c,x+1,y+h-1,1,1,dk); }
    for(let i=0;i<2;i++){ const x=Math.floor(hash(i,47)*28)+2, y=Math.floor(hash(47,i)*28)+2; px(c,x,y,2,1,P.stone[2]); px(c,x,y+1,2,1,P.stone[1]); }
    T.grass.needsUpdate=true; }
  // paths: shaded pebbles, hairline cracks, darker wheel wear
  { const c=T.path.image.getContext('2d'); for(let i=0;i<3;i++){ const y=6+i*11+Math.floor(hash(i,51)*3); for(let x=0;x<S;x++) if(hash(x,y+i)>.45) px(c,x,y,1,1,cShade(P.path[1],-.12)); }
    for(let i=0;i<9;i++){ const x=Math.floor(hash(i,53)*29), y=Math.floor(hash(53,i)*29); px(c,x,y,2,2,P.stone[i%3]); px(c,x,y,1,1,'rgba(255,255,255,.35)'); px(c,x,y+2,2,1,'rgba(0,0,0,.25)'); }
    for(let i=0;i<2;i++){ let x=Math.floor(hash(i,57)*24)+4, y=Math.floor(hash(57,i)*24)+4; for(let k=0;k<5;k++){ px(c,x,y,1,1,'rgba(60,40,20,.35)'); x+=hash(k,i)>.5?1:-1; y+=1; } }
    T.path.needsUpdate=true; }
  // cobbles: moss in the joints, a highlight on each stone
  { const c=T.cobble.image.getContext('2d'); [[0,0,15,9],[16,0,16,7],[0,10,10,10],[11,8,12,12],[24,8,8,11],[0,21,13,11],[14,21,9,11],[24,20,8,12]].forEach(([x,y,w,h],i)=>{ px(c,x+2,y+2,2,1,'rgba(255,255,255,.28)'); px(c,x+w-2,y+h-2,1,1,'rgba(0,0,0,.25)');
      if(i%2===0){ px(c,x,y+Math.floor(h/2),1,2,'rgba(90,140,70,.85)'); px(c,x+Math.floor(w/2),y,2,1,'rgba(90,140,70,.75)'); } });
    T.cobble.needsUpdate=true; }
  // dirt: little roots and shaded stones
  { const c=T.dirt.image.getContext('2d'); for(let i=0;i<4;i++){ let x=Math.floor(hash(i,71)*26)+3, y=Math.floor(hash(71,i)*20)+4; for(let k=0;k<4;k++){ px(c,x,y,1,1,cShade(P.d[1],-.3)); x+=1; y+=hash(k,i+3)>.5?1:0; } }
    for(let i=0;i<6;i++){ const x=Math.floor(hash(i,3)*28), y=Math.floor(hash(3,i)*28); px(c,x,y+3,4,1,'rgba(0,0,0,.25)'); }
    T.dirt.needsUpdate=true; }
  return T; }
(function(){ const mt=makeTileTextures; makeTileTextures=function(biome){ const T=mt.apply(this,arguments); try{ if(biome==='village'||biome==='meadow') polishTiles(T,biome); }catch(e){ console.error('tiles',e); } return T; }; })();

// ---------- the houses ----------
const TPM={};   // shared materials
function tpMat(k){ if(TPM[k]) return TPM[k]; const M={plank:0x7a5232,plankD:0x5a3a22,stone:0x9a9286,iron:0x2d2a30,barrel:0x8a5a34,band:0x3a3530,crate:0xa8784a,soil:0x4a3424,beam:0x4a3020,cap:0x2c3550};
  return TPM[k]=k.startsWith('fl')?new THREE.MeshLambertMaterial({color:[0xf2c14e,0xec8fb0,0xffffff,0x9fd0ff,0xe85a5a,0xb88aff][+k.slice(2)%6],emissive:0x201010}):new THREE.MeshLambertMaterial({color:M[k]}); }
function tpFlowerBox(G,cx,y,z,w){ addBox(G,w,.13,.2,tpMat('plankD'),cx,y,z,false); addBox(G,w-.06,.04,.16,tpMat('soil'),cx,y+.12,z,false);
  const n=Math.max(2,Math.round(w/.13)); for(let i=0;i<n;i++){ const fx=cx-w/2+.07+i*(w-.14)/(n-1); addBox(G,.03,.08,.03,tpMat('plank'),fx,y+.14,z,false); addBox(G,.08,.07,.08,tpMat('fl'+Math.floor(hash(Math.round(fx*10),Math.round(z*10))*6)),fx,y+.2,z+(i%2?.03:-.03),false); } }
function tpBarrel(G,x,z){ const m=new THREE.Mesh(new THREE.CylinderGeometry(.27,.24,.62,10),tpMat('barrel')); m.position.set(x,.31,z); m.castShadow=true; G.root.add(m);
  for(const y of [.12,.5]){ const b=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.05,10),tpMat('band')); b.position.set(x,y,z); G.root.add(b); } }
(function(){ const ah=addHouse; addHouse=function(G,x,z,w,d,h,seed){ const r=ah.apply(this,arguments); try{ if(G.key==='village'||(G.biome==='village')) tpHouse(G,x,z,w,d,h,seed); }catch(e){ console.error('house polish',e); } return r; }; })();
function tpHouse(G,x,z,w,d,h,seed){ const hu=Math.ceil(h), fz=z+d+.1, rh=d*.55;
  // flower boxes under the windows the wall texture painted (same hash rule as wallTexture)
  for(let u=0;u<w;u++){ const door=u===Math.floor(w/2), cx=x+u+.5;
    if(!door&&hash(u,seed)>.25) tpFlowerBox(G,cx,h*(11/(hu*32))-.04,fz,.62);
    if(hu>2&&hash(seed,u)>.2) tpFlowerBox(G,cx,h*(1-27/(hu*32))-.04,fz,.62);
    if(door){ addBox(G,1.1,.1,.55,tpMat('stone'),cx,0,z+d+.28); addBox(G,.9,.08,.3,tpMat('stone'),cx,.1,z+d+.16,false); } }
  // eave trim and the ridge cap
  addBox(G,w+.8,.12,.12,tpMat('beam'),x+w/2,h-.06,z+d+.42,false); addBox(G,w+.8,.14,.22,tpMat('cap'),x+w/2,h+rh-.05,z+d/2,false);
  // barrels and a crate stack at one side (alternating sides)
  const sd=seed%2?-1:1, bx=sd>0?x+w+.35:x-.35; tpBarrel(G,bx,z+d-.5); tpBarrel(G,bx+sd*.05,z+d-1.1);
  addBox(G,.5,.45,.5,tpMat('crate'),bx,0,z+d-1.75); addBox(G,.38,.34,.38,tpMat('crate'),bx,.45,z+d-1.72);
  // chimney smoke
  const sx=x+w*.75, sy=h+rh+.85, sz=z+d*.4; G.anim.push(()=>{ if(Math.random()<.12) FX.spawn(sx+rnd(-.1,.1),sy,sz+rnd(-.1,.1),rnd(-.2,.3),rnd(.6,1.1),0,rnd(1.6,2.4),Math.random()<.5?0xb8b0a8:0x8a8480,rnd(.25,.4),-.15,false); }); }
// strings of paper lanterns between the lamp posts (each string belongs to the post it starts at: smash it and it falls)
(function(){ const vb=LEVELDEF.village; LEVELDEF.village=function(){ const G=vb.apply(this,arguments); try{ tpLanternStrings(G); }catch(e){ console.error('lantern strings',e); } return G; }; })();
function tpLanternStrings(G){ const posts=[[7,10],[15.5,10.2],[24.5,10.2],[33,10]], cols=[0xff6a5a,0xffc04a,0xff8ab0,0x8ad0ff], cord=new THREE.MeshBasicMaterial({color:0x2a2420});
  for(let i=0;i<posts.length-1;i++){ const [x0,z0]=posts[i], [x1,z1]=posts[i+1], p=(G.destr||[]).find(q=>q.kind==='lantern'&&Math.abs(q.cx-(x0+.25))<.6&&Math.abs(q.cz-z0)<.5); const n0=G.root.children.length, N=10;
    for(let k=0;k<=N*3;k++){ const u=k/(N*3), x=lerp(x0+.5,x1+.5,u), z=lerp(z0,z1,u), y=2.3-Math.sin(u*Math.PI)*.55; const c=new THREE.Mesh(new THREE.BoxGeometry(.06,.03,.03),cord); c.position.set(x,y,z); G.root.add(c); }
    for(let k=1;k<N;k++){ const u=k/N, x=lerp(x0+.5,x1+.5,u), z=lerp(z0,z1,u), y=2.3-Math.sin(u*Math.PI)*.55, col=cols[(k+i)%cols.length];
      const m=new THREE.Mesh(new THREE.BoxGeometry(.18,.22,.18),new THREE.MeshLambertMaterial({color:col,emissive:col,emissiveIntensity:.9})); m.position.set(x,y-.16,z); G.root.add(m);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(.2,.04,.2),cord); cap.position.set(x,y-.04,z); G.root.add(cap); }
    if(p){ const add=G.root.children.slice(n0); p.meshes.push(...add); p.base.push(...add.map(m=>m.position.clone())); } } }

// ---------- Starfall Ridge: darker tufts, ferns, mushrooms by the trees ----------
(function(){ const st=scatterTufts; scatterTufts=function(G,n,kinds){ if(G&&G.biome==='meadow'&&Array.isArray(kinds)) kinds=kinds.map(k=>k.kind==='flower'?k:Object.assign({},k,{cols:(k.cols||[]).map(c=>cShade(c,-.38))})); return st.call(this,G,n,kinds,...[].slice.call(arguments,3)); }; })();
(function(){ const mb=LEVELDEF.meadow; LEVELDEF.meadow=function(){ const G=mb.apply(this,arguments); try{ tpRidge(G); }catch(e){ console.error('ridge polish',e); } return G; }; })();
function tpRidge(G){ scatterTufts(G,0,[{kind:'fern',cols:['#2a5a2a','#3a7036'],n:140,s:1.2},{kind:'tall',cols:['#25502a','#336a30'],n:160,s:1.35},{kind:'grass',cols:['#2f6228','#3e7a34','#4f8c40'],n:420,s:1}],[1,6,80,22]);
  const cap=new THREE.MeshLambertMaterial({color:0xd8443a}), stem=new THREE.MeshLambertMaterial({color:0xf0e6d0}), dot=new THREE.MeshBasicMaterial({color:0xffffff});
  for(const [x,z] of [[3.4,6.9],[7.6,7.1],[17.4,6.9],[21.6,7],[29.5,6.9],[45.4,6.8],[48.5,7.1]]){ for(let k=0;k<3;k++){ const mx=x+k*.22-.2, mz=z+(k%2)*.12, s=.7+hash(k,Math.round(x))*.5, gy=groundY(mx,mz);
      addBox(G,.06*s,.14*s,.06*s,stem,mx,gy,mz,false); addBox(G,.2*s,.08*s,.2*s,cap,mx,gy+.14*s,mz,false); addBox(G,.04,.02,.04,dot,mx-.04*s,gy+.22*s,mz,false); } } }
