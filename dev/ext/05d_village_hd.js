// =====================================================================
// LANTERNBROOK, REBUILT (the HD-2D look, village only; the proof before the other maps). Collision, props' hit boxes, NPCs
// and the level layout are untouched: this is what the place is made of.
//   walls    vhWall: 64 px a unit (was 32): shaded plaster with grime and cracks, a stone footing, a timber frame with a lit
//            edge and a cast shadow, bigger lit windows with frames, mullions and curtains, a plank door with iron bands
//   roofs    vhRoof: staggered slate with per-shingle colour, a warm sunset edge on every row, moss
//   houses   real geometry on top of the box: a stone plinth, corner posts, mid and top beams, window sills and shutters,
//            a door frame with a small porch roof and a hanging sign, bargeboards along the gables
//   light    warm pools on the ground under every lantern and in front of every house (additive decals: the ground is
//            vertex-lit, real point lights barely show on it), a halo on every lamp; the dusk ambient a little cooler
//            and darker so the warm light carries
//   depth    a row of tall grass and flowers in front of the camera (the tilt-shift blurs it), puddles on the path
// VH.low (touch devices): textures and light only, none of the small boxes. localStorage 'msb_vh'='0' turns it all off.
// =====================================================================
const VH={on:1,low:0,mats:{},decals:[]};
(function(){ try{ if(typeof localStorage!=='undefined'&&localStorage.getItem('msb_vh')==='0') VH.on=0; VH.low=typeof IS_TOUCH==='function'&&IS_TOUCH()?1:0; }catch(e){} })();
function vhOn(){ return VH.on&&typeof L!=='undefined'&&L&&L.biome==='village'; }
function vhMat(k){ if(VH.mats[k]) return VH.mats[k]; const C={beam:0x5a3b28,beamD:0x40291b,sill:0x7a5a3a,slate:0x39425f,sh0:0x3f6a5a,sh1:0x8a4038,sh2:0x3d5486,sh3:0x7a6a2c,sign:0x8a6a44,signD:0x4a3020,iron:0x2d2a30};
  if(k==='stone'){ const S=64,[cv,c]=mkCanvas(S,S); R(c,0,0,S,S,'#5d584f'); let y=0, r=0; while(y<S){ const h=14+Math.floor(hash(r,91)*5); let x=-Math.floor(hash(r,92)*12); while(x<S){ const w=12+Math.floor(hash(x+90,r)*12), col=['#8f8a80','#7d786e','#a09a8e','#878074'][Math.floor(hash(x,r+7)*4)]; R(c,x+1,y+1,w-2,h-2,col); R(c,x+1,y+1,w-2,2,'rgba(255,255,255,.22)'); R(c,x+1,y+h-3,w-2,2,'rgba(0,0,0,.25)'); if(hash(x,r)>.6) R(c,x+3,y+5,3,2,'rgba(60,90,50,.55)'); x+=w; } y+=h; r++; }
    const t=tex(cv,1); t.repeat.set(3,1); return VH.mats[k]=new THREE.MeshLambertMaterial({map:t}); }
  return VH.mats[k]=new THREE.MeshLambertMaterial({color:C[k]}); }
// ---------- the wall ----------
function vhWall(wu,hu,seed,door){ const S=64, W=wu*S, H=hu*S, [cv,c]=mkCanvas(W,H), [ev,e]=mkCanvas(W,H); R(e,0,0,W,H,'#000');
  // plaster: lit from above, grimy at the foot, darker under the eave
  for(let y=0;y<H;y+=4){ const k=y<18?-.16+y/18*.16:y>H-70?-(y-(H-70))/70*.2:0; R(c,0,y,W,4,cShade('#e0cfa8',k)); }
  noiseFill(c,W,H,['#cdb992','#ead9b6','#d3bf9a','#c2ac84','#e6d6b4'],wu*hu*300,seed);
  for(let i=0;i<wu*2;i++){ let x=Math.floor(hash(i,seed+3)*W), y=Math.floor(hash(seed+3,i)*(H-90))+20; for(let k=0;k<9+Math.floor(hash(i,7)*8);k++){ R(c,x,y,1,1,'rgba(90,70,50,.5)'); y+=1; x+=hash(k,i+seed)>.6?1:hash(k,i)>.7?-1:0; } } /* hairline cracks */
  for(let i=0;i<wu;i++){ const x=Math.floor(hash(i,seed+11)*W), w=10+Math.floor(hash(i,5)*16); R(c,x,H-34,w,16,'rgba(110,130,80,.16)'); R(c,x+2,H-28,w-4,10,'rgba(90,120,70,.16)'); } /* damp at the foot */
  // the stone footing
  { const fh=18; R(c,0,H-fh,W,fh,'#5d584f'); let x=-Math.floor(hash(seed,1)*10); while(x<W){ const w=14+Math.floor(hash(x+50,seed)*14), col=['#8f8a80','#7d786e','#a09a8e','#878074'][Math.floor(hash(x,seed+2)*4)]; R(c,x+1,H-fh+1,w-2,fh-2,col); R(c,x+1,H-fh+1,w-2,2,'rgba(255,255,255,.25)'); R(c,x+1,H-3,w-2,2,'rgba(0,0,0,.28)'); if(hash(x,seed+9)>.55) R(c,x+3,H-fh+6,4,2,'rgba(70,100,60,.6)'); x+=w; } R(c,0,H-fh-2,W,2,'rgba(0,0,0,.22)'); }
  // the timber frame: a lit edge, a dark edge, a shadow thrown on the plaster
  const bm='#5a3b28', bmH='#7c563a', bmD='#3a2416', sh='rgba(40,24,10,.22)';
  const vbeam=(x,y0,y1,w)=>{ R(c,x+w,y0,3,y1-y0,sh); R(c,x,y0,w,y1-y0,bm); R(c,x,y0,1,y1-y0,bmH); R(c,x+w-1,y0,1,y1-y0,bmD); for(let k=0;k<3;k++){ const yy=y0+Math.floor(hash(x+k,seed)*(y1-y0-12)); R(c,x+2+k%2*2,yy,1,9,bmD); } };
  const hbeam=(y,h)=>{ R(c,0,y+h,W,3,sh); R(c,0,y,W,h,bm); R(c,0,y,W,1,bmH); R(c,0,y+h-1,W,1,bmD); for(let k=0;k<wu*2;k++){ const xx=Math.floor(hash(k,y+seed)*(W-14)); R(c,xx,y+2+k%3,10,1,bmD); } };
  for(let x=0;x<wu;x++){ const x0=x*S+8, x1=x*S+S-2, y0=Math.floor(H/2)+6, y1=H-22; if((x+seed)%2){ pline(c,x0+2,y0+2,x1+2,y1+2,sh,5); pline(c,x0,y0,x1,y1,bm,5); pline(c,x0,y0-1,x1,y1-1,bmH,1); } else { pline(c,x1+2,y0+2,x0+2,y1+2,sh,5); pline(c,x1,y0,x0,y1,bm,5); pline(c,x1,y0-1,x0,y1-1,bmH,1); } }
  for(let x=0;x<=wu;x++) vbeam(Math.min(x*S,W-8),0,H-18,8);
  hbeam(0,9); hbeam(Math.floor(H/2)-4,8); hbeam(H-24,6);
  // windows: the same places the base game puts them (twice the pixels): frame, lit glass, mullions, curtains, a sill
  const win=(x,y)=>{ const ww=32, wh=38; R(c,x-4,y-4,ww+8,wh+8,bmD); R(c,x-3,y-3,ww+6,wh+6,bm); R(c,x-3,y-3,ww+6,1,bmH);
    for(let r=0;r<wh;r+=2){ const k=r/wh; R(c,x,y+r,ww,2,`rgb(255,${Math.round(236-k*70)},${Math.round(160-k*90)})`); R(e,x,y+r,ww,2,`rgb(${Math.round(190-k*30)},${Math.round(130-k*50)},${Math.round(60-k*36)})`); } /* the glow is amber, not white: at full strength the bloom washed the panes out */
    R(c,x+3,y+3,10,12,'#fff0b8'); R(e,x+3,y+3,10,12,'#d8b070'); R(c,x,y,5,wh,'rgba(246,226,190,.75)'); R(c,x+ww-5,y,5,wh,'rgba(246,226,190,.75)'); R(c,x+1,y+wh-9,4,3,'rgba(200,170,130,.8)'); R(c,x+ww-5,y+wh-9,4,3,'rgba(200,170,130,.8)');
    R(c,x+ww/2-1,y,3,wh,bm); R(c,x,y+Math.floor(wh*.42),ww,3,bm); R(e,x+ww/2-1,y,3,wh,'#000'); R(e,x,y+Math.floor(wh*.42),ww,3,'#000'); R(c,x,y,ww,2,'rgba(0,0,0,.25)');
    R(c,x-6,y+wh+3,ww+12,5,'#8a6a48'); R(c,x-6,y+wh+3,ww+12,1,'#a8865e'); R(c,x-5,y+wh+8,ww+10,3,sh); };
  for(let x=0;x<wu;x++){ const mid=x*S+S/2;
    if(door&&x===Math.floor(wu/2)){ const dw=36, dh=62, dx=mid-dw/2, dy=H-dh; R(c,dx-5,dy-6,dw+10,dh+6,bmD); R(c,dx-4,dy-5,dw+8,dh+5,bm); R(c,dx-4,dy-5,dw+8,1,bmH);
      for(let k=0;k<6;k++){ R(c,dx+k*6,dy,6,dh,k%2?'#5a3a26':'#4e3120'); R(c,dx+k*6,dy,1,dh,'rgba(0,0,0,.3)'); } R(c,dx,dy,dw,3,'rgba(0,0,0,.3)');
      for(const yy of [dy+12,dy+42]){ R(c,dx,yy,dw,4,'#2d2a30'); R(c,dx,yy,dw,1,'#4a464e'); for(let k=0;k<4;k++) R(c,dx+4+k*9,yy+1,2,2,'#6a666e'); }
      R(c,dx+dw-9,dy+30,4,4,'#e0b94e'); R(c,dx+dw-9,dy+30,2,2,'#fff0a0'); R(c,dx+10,dy+6,16,5,'#ffcf6b'); R(e,dx+10,dy+6,16,5,'#ffb84a'); continue; }
    if(hash(x,seed)>.25) win(mid-16,H-60); if(hu>2&&hash(seed,x)>.2) win(mid-16,16); }
  return [tex(cv),tex(ev)]; }
function vhRoof(seed){ const S=128, [cv,c]=mkCanvas(S,S); R(c,0,0,S,S,'#2b3350'); const cols=['#4b5874','#43506b','#56638a','#3f4a66','#5a5f86','#4a4f78'];
  for(let y=0,r=0;y<S;y+=16,r++){ const off=(r%2)*10; for(let x=-20;x<S;x+=20){ const k=hash(x+r*31,seed+r), col=k>.93?'#34405a':cols[Math.floor(k*cols.length)]; R(c,x+off+1,y,18,14,col); R(c,x+off+1,y,18,2,'rgba(255,255,255,.1)'); R(c,x+off+1,y+11,18,3,'rgba(255,176,120,.2)'); R(c,x+off+1,y+14,18,2,'#1d2338'); R(c,x+off+18,y+2,1,11,'rgba(0,0,0,.25)');
      if(hash(x,y+seed)>.86){ R(c,x+off+4,y+8,6,4,'rgba(90,130,80,.6)'); R(c,x+off+6,y+6,3,2,'rgba(110,150,90,.6)'); } } }
  const t=tex(cv,1); return t; }
(function(){ const wt=wallTexture; wallTexture=function(wu,hu,seed,door){ try{ if(vhOn()) return vhWall(wu,hu,seed,door); }catch(e){ console.error('vh wall',e); } return wt.apply(this,arguments); }; })();
(function(){ const rt=roofTexture; roofTexture=function(seed){ try{ if(vhOn()) return vhRoof(seed); }catch(e){ console.error('vh roof',e); } return rt.apply(this,arguments); }; })();
// ---------- the house: geometry over the box ----------
function vhHouse(G,x,z,w,d,h,seed){ const hu=Math.ceil(h), fz=z+d, rh=d*.55, B=vhMat('beam'), BD=vhMat('beamD'), cx=x+w/2, cz=z+d/2;
  addBox(G,w+.14,.42,d+.14,vhMat('stone'),cx,0,cz);                                           /* the plinth */
  for(const px of [x-.02,x+w+.02]) for(const pz of [z-.02,fz+.02]) addBox(G,.2,h,.2,B,px,0,pz);    /* corner posts */
  for(const y of [h/2-.07,h-.16]){ addBox(G,w+.1,.16,.1,B,cx,y,fz+.03,false); for(const px of [x-.03,x+w+.03]) addBox(G,.1,.16,d+.1,B,px,y,cz,false); }
  if(VH.low) return;
  const shut=vhMat('sh'+(seed%4)), sill=vhMat('sill'), unit=h/(hu*32);
  const dress=(u,yb,yt)=>{ const wx=x+u+.5, hh=yt-yb; addBox(G,.66,.06,.16,sill,wx,yb-.07,fz+.07,false); addBox(G,.6,.06,.1,BD,wx,yt+.02,fz+.05,false);
    for(const sd of [-1,1]){ const m=addBox(G,.2,hh,.05,shut,wx+sd*.37,yb,fz+.04,false); m.rotation.y=sd*-.22; addBox(G,.16,.03,.06,BD,wx+sd*.37,yb+hh*.3,fz+.06,false); addBox(G,.16,.03,.06,BD,wx+sd*.37,yb+hh*.7,fz+.06,false); } };
  for(let u=0;u<w;u++){ const dr=u===Math.floor(w/2); if(!dr&&hash(u,seed)>.25) dress(u,unit*11,unit*31); if(hu>2&&hash(seed,u)>.2) dress(u,h-unit*28,h-unit*7.5);
    if(dr){ const dx=x+u+.5; for(const sd of [-1,1]) addBox(G,.09,2,.12,BD,dx+sd*.34,0,fz+.06,false); addBox(G,.86,.1,.14,BD,dx,1.96,fz+.07,false);
      const aw=addBox(G,1.25,.07,.62,vhMat('slate'),dx,2.12,fz+.3); aw.rotation.x=.42; for(const sd of [-1,1]){ const br=addBox(G,.06,.06,.5,BD,dx+sd*.52,1.86,fz+.24,false); br.rotation.x=-.6; }
      // a hanging sign
      const sx=dx+(seed%2?1.05:-1.05); addBox(G,.06,.06,.5,vhMat('iron'),sx,2.3,fz+.25,false); addBox(G,.03,.16,.03,vhMat('iron'),sx,2.14,fz+.42,false);
      const bd=addBox(G,.5,.36,.05,vhMat('sign'),sx,1.78,fz+.42,false); addBox(G,.54,.04,.07,vhMat('signD'),sx,2.12,fz+.42,false); addBox(G,.2,.16,.06,vhMat('sh'+((seed+1)%4)),sx,1.88,fz+.43,false); bd.castShadow=true; } }
  // bargeboards along both gables
  const hd=d/2+.4, len=Math.hypot(hd,rh), an=Math.atan2(rh,hd); for(const px of [x-.37,x+w+.37]) for(const sg of [-1,1]){ const m=addBox(G,.08,.16,len+.1,BD,px,h+rh/2-.02,cz+sg*hd/2,false); m.rotation.x=sg*an; } }
(function(){ const ah=addHouse; addHouse=function(G,x,z,w,d,h,seed){ const r=ah.apply(this,arguments); try{ if(VH.on&&G&&G.biome==='village') vhHouse(G,x,z,w,d,h,seed); }catch(e){ console.error('vh house',e); } return r; }; })();
// ---------- light on the ground, halos, depth ----------
function vhDecal(G,x,z,w,dp,col,op,owner){ const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:GLOW,color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); m.rotation.x=-Math.PI/2; m.position.set(x,groundY(x,z)+.045,z); m.scale.set(w,dp,1); m.renderOrder=1; G.root.add(m); VH.decals.push({m,op,owner,ph:Math.random()*6.28}); return m; }
function vhOwner(G,kind,x,z){ for(const p of G.destr||[]) if(p.kind===kind&&x>=p.x0-.3&&x<=p.x1+.3&&z>=p.z0-.3&&z<=p.z1+.3) return p; return null; }
function vhVillage(G){ VH.decals.length=0;
  // houses: the windows' light lies on the ground in front of them
  [[3,5,6,4],[11,4,7,5],[23,5,6,4],[31,4,7,5]].forEach(([x,z,w,d])=>{ const o=vhOwner(G,'house',x+w/2,z+d/2); vhDecal(G,x+w/2,z+d+1.25,w*1.25,3.4,0xff8c3c,.3,o); vhDecal(G,x+Math.floor(w/2)+.5,z+d+.8,2,2.2,0xffa050,.22,o); });
  // lanterns: a pool under each and a halo round the lamp
  [[7,10],[15.5,10.2],[24.5,10.2],[33,10],[10,15.2],[29,15.2],[37,14.6]].forEach(([x,z])=>{ const o=vhOwner(G,'lantern',x+.2,z); vhDecal(G,x+.5,z+.1,6.2,6.2,0xff8436,.34,o).userData.flick=1;
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xffb060,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); s.position.set(x+.5,groundY(x,z)+2,z+.05); s.scale.set(2.2,2.2,1); G.root.add(s); VH.decals.push({m:s,op:.4,owner:o,ph:Math.random()*6.28,flick:1}); });
  // the fountain throws a little cool light back
  vhDecal(G,20,11.2,6.5,6.5,0x5aa0ff,.22,vhOwner(G,'fountain',20,11.2));
  // puddles on the path: a dark wet patch with the sky in it
  if(!VH.low) [[9.3,12.9,1.5,.7],[21.6,13.3,1.1,.5],[27.8,12.7,1.7,.8],[35.2,13.2,1.2,.6]].forEach(([x,z,w,dp])=>{ const m=new THREE.Mesh(new THREE.CircleGeometry(.5,14),new THREE.MeshBasicMaterial({color:0x3a2c58,transparent:true,opacity:.55,depthWrite:false})); m.rotation.x=-Math.PI/2; m.position.set(x,groundY(x,z)+.035,z); m.scale.set(w,dp,1); G.root.add(m);
      const g=new THREE.Mesh(new THREE.CircleGeometry(.5,14),new THREE.MeshBasicMaterial({color:0xffb27a,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false})); g.rotation.x=-Math.PI/2; g.position.set(x-.1*w,groundY(x,z)+.04,z-.08*dp); g.scale.set(w*.55,dp*.5,1); G.root.add(g); });
  // the foreground: tall grass and flowers between the camera and the street (out of focus in the tilt-shift)
  try{ scatterTufts(G,0,[{kind:'tall',cols:['#2f5a26','#44782f','#5a9a3a'],n:VH.low?60:170,s:2.3},{kind:'grass',cols:['#3f7a2a','#5a9a3a','#6dab45'],n:VH.low?60:160,s:1.7},{kind:'flower',cols:['#f2c14e','#ec8fb0','#ffffff','#9fd0ff'],n:VH.low?20:70,s:1.6}],[1,21.4,39,23.6]); }catch(e){ console.error('vh foreground',e); }
  G.anim.push(()=>{ try{ const t=Game.time; for(const dcl of VH.decals){ const dead=dcl.owner&&dcl.owner.dead; dcl.m.visible=!dead; if(dead) continue; const fl=dcl.flick||dcl.m.userData.flick; dcl.m.material.opacity=dcl.op*(fl?.86+.14*Math.sin(t*9+dcl.ph)*Math.sin(t*5.3+dcl.ph*2):1); } }catch(e){ console.error('vh light',e); } }); }
(function(){ const vb=LEVELDEF.village; LEVELDEF.village=function(){ const G=vb.apply(this,arguments); try{ if(VH.on) vhVillage(G); }catch(e){ console.error('vh village',e); } return G; }; })();
// the dusk: a little cooler and darker in the shade, the same warm low sun, so lamps and windows read as light sources
(function(){ try{ if(VH.on&&typeof LOOKS!=='undefined'&&LOOKS.village){ LOOKS.village.hemi=[0x7c78d2,0x3c2a36,.55]; LOOKS.village.sun=[0xff9a66,1.45,LOOKS.village.sun[2]]; } }catch(e){} })();
// =====================================================================
// PASS 2 (v1.67): everything that is not a house. The ground (grass, path and cobbles redrawn at 64 px a unit over 2x2
// cells, so no tile repeats next to itself; ragged grass hanging over every path and cobble edge), the trees (bigger,
// leaf clusters lit from the low sun, a dark underside, bark), the lamp posts, the fountain, the stalls, new props (a
// woodpile, hay bales, a cart, a bench, a clothesline, flower beds along the houses), soft contact shadows under
// everything that stands on the ground, a wall of pines behind the houses, twice the grass.
// =====================================================================
function vhTiles(T,P,fl){ P=P||PAL.village; const S=128, put=(k,cv)=>{ const t=tex(cv,1); t.repeat.set(.5,.5); T[k]=t; };
  // grass: broad tonal patches, blades in three tones, clover, the odd flower and pebble
  { const [cv,c]=mkCanvas(S,S), g=P===PAL.village?['#4e8c34','#447e2e','#5f9f3e','#74b24a','#3a6e28','#8cc45a']:[P.g[0],P.g[1],P.g[2],P.g[3],cShade(P.g[1],-.22),cShade(P.g[3],.14)]; R(c,0,0,S,S,g[0]);
    /* tonal clumps: small, ragged and only in the walk-through maps (in a boss arena, recoloured pale, 8 px blocks read as a checkerboard under the telegraphs) */
    if(fl!=='arena') for(let by=0;by<S;by+=4) for(let bx=0;bx<S;bx+=4){ const k=hash(Math.floor(bx/24)+3,Math.floor(by/24)+9)*.5+hash(Math.floor(bx/8),Math.floor(by/8)+5)*.3+hash(bx,by)*.2; if(k>.66) R(c,bx,by,4,4,g[2]); else if(k<.3) R(c,bx,by,4,4,g[1]); }
    noiseFill(c,S,S,[g[1],g[2],g[0],g[4]],1500,31);
    for(let i=0;i<(fl==='arena'?200:420);i++){ const x=Math.floor(hash(i,61)*S), y=Math.floor(hash(61,i)*(S-5))+1, h=2+Math.floor(hash(i,62)*4), k=hash(i,63); R(c,x,y,1,h,k>.66?g[3]:k>.33?g[2]:g[5]); R(c,x,y+h,1,1,g[4]); if(i%5===0) R(c,(x+1)%S,y+h-1,1,2,g[4]); }
    for(let i=0;i<(fl==='arena'?0:14);i++){ const x=Math.floor(hash(i,71)*(S-8))+2, y=Math.floor(hash(71,i)*(S-8))+2; R(c,x,y,5,3,g[4]); R(c,x+1,y-1,3,1,g[4]); R(c,x+1,y,2,2,g[1]); R(c,x+3,y+1,2,2,g[2]); }
    if(fl===true&&P!==PAL.keep) for(let i=0;i<9;i++){ const x=Math.floor(hash(i,73)*(S-6))+2, y=Math.floor(hash(73,i)*(S-6))+2; R(c,x,y,2,2,P.flower[i%P.flower.length]); R(c,x,y+2,1,2,g[4]); R(c,x,y,1,1,'#fff6c8'); }
    for(let i=0;i<5;i++){ const x=Math.floor(hash(i,77)*(S-6))+2, y=Math.floor(hash(77,i)*(S-6))+2; R(c,x,y,3,2,P.stone[0]); R(c,x,y,3,1,P.stone[2]); R(c,x,y+2,3,1,'rgba(0,0,0,.25)'); }
    put('grass',cv); }
  // the path: packed earth, two wheel ruts, pebbles with a lit top and a shadow, cracks, grass seeding in
  { const [cv,c]=mkCanvas(S,S), d=[P.path[0],P.path[1],P.path[2],cShade(P.path[1],-.16),cShade(P.path[2],.08)]; R(c,0,0,S,S,d[0]); noiseFill(c,S,S,[d[1],d[2],d[0],d[4]],1700,33);
    for(const ry of [40,88]) for(let x=0;x<S;x++){ const y=ry+Math.round(Math.sin(x/S*6.283*2)*2); R(c,x,y,1,5,'rgba(0,0,0,.16)'); R(c,x,y+5,1,1,'rgba(255,255,255,.12)'); if(hash(x,ry)>.6) R(c,x,y+2,1,1,d[3]); }
    for(let i=0;i<46;i++){ const x=Math.floor(hash(i,81)*(S-5)), y=Math.floor(hash(81,i)*(S-5)), w=2+Math.floor(hash(i,82)*3); R(c,x,y+w-1,w,2,'rgba(60,40,20,.3)'); R(c,x,y,w,w-1,P.stone[i%3]); R(c,x,y,w,1,'rgba(255,255,255,.3)'); }
    for(let i=0;i<7;i++){ let x=Math.floor(hash(i,85)*(S-20))+6, y=Math.floor(hash(85,i)*(S-20))+6; for(let k=0;k<12;k++){ R(c,x,y,1,1,'rgba(0,0,0,.3)'); x+=hash(k,i+5)>.45?1:-1; y+=1; } }
    for(let i=0;i<16;i++){ const x=Math.floor(hash(i,87)*(S-3)), y=Math.floor(hash(87,i)*(S-4)); R(c,x,y,1,3,P.g[2]); R(c,x+1,y+1,1,2,P.g[1]); }
    put('path',cv); }
  // cobbles: rounded stones, each lit from the top with a dark foot, moss and dirt in the joints
  { const [cv,c]=mkCanvas(S,S); R(c,0,0,S,S,cShade(P.stone[1],-.55)); const cols=[P.stone[0],P.stone[1],P.stone[2],cShade(P.stone[0],-.06),cShade(P.stone[2],-.06)];
    for(let r=0,y=0;y<S;r++){ const h=18+Math.floor(hash(r,91)*8); let x=-Math.floor(hash(r,92)*14); while(x<S){ const w=18+Math.floor(hash(x+200,r)*14), col=cols[Math.floor(hash(x,r+3)*cols.length)];
        R(c,x+2,y+1,w-3,h-1,col); R(c,x+1,y+2,w-1,h-3,col); R(c,x+2,y+1,w-3,2,'rgba(255,255,255,.2)'); R(c,x+3,y+3,Math.floor(w/3),1,'rgba(255,255,255,.22)'); R(c,x+2,y+h-3,w-3,3,'rgba(0,0,0,.22)'); R(c,x+w-2,y+3,1,h-6,'rgba(0,0,0,.14)');
        if(hash(x,r)>.55){ c.globalAlpha=.8; R(c,x,y+Math.floor(h/2),2,3,P.g[2]); R(c,x+Math.floor(w/2),y,3,1,P.g[2]); c.globalAlpha=1; } if(hash(r,x)>.8) R(c,x+5,y+6,3,2,'rgba(0,0,0,.12)'); x+=w; } y+=h; }
    put('cobble',cv); } }
(function(){ const mt=makeTileTextures; makeTileTextures=function(biome){ const T=mt.apply(this,arguments); try{ if(VH.on&&PAL[biome]&&T.grass&&T.path&&T.cobble) vhTiles(T,PAL[biome],['keep','twins','flowers'].includes(biome)?'arena':true); }catch(e){ console.error('vh tiles',e); } return T; }; })();
// grass hanging over the path and cobble edges: one merged strip of small ragged quads on the road side of every border
function vhEdges(G){ const PG=(PAL[G.biome]||PAL.village).g, [cv,c]=mkCanvas(64,24), g=G.biome==='village'?['#4e8c34','#5f9f3e','#447e2e','#74b24a']:[PG[0],PG[2],PG[1],PG[3]]; for(let x=0;x<64;x++){ const h=5+Math.floor(hash(x,5)*13)+(x%7===0?5:0); R(c,x,24-Math.min(24,h),1,Math.min(24,h),g[Math.floor(hash(x,9)*4)]); if(hash(x,11)>.7) R(c,x,24-Math.min(24,h),1,2,G.biome==='village'?'#8cc45a':cShade(PG[3],.12)); }
  const t=tex(cv), p=[], uv=[], n=[], dp=.42, q=(a,b,cc,d,u0)=>{ for(const [v,w] of [[a,[u0,0]],[b,[u0+.5,0]],[cc,[u0+.5,1]],[a,[u0,0]],[cc,[u0+.5,1]],[d,[u0,1]]]){ p.push(...v); uv.push(...w); n.push(0,1,0); } };
  const road=(x,z)=>x>=0&&z>=0&&x<G.w&&z<G.d&&(G.T[z][x]==='path'||G.T[z][x]==='cobble');
  const gr=(x,z,h)=>x>=0&&z>=0&&x<G.w&&z<G.d&&G.T[z][x]==='grass'&&Math.abs(G.H[z][x]-h)<.01;
  for(let z=1;z<G.d-1;z++) for(let x=1;x<G.w-1;x++){ if(!road(x,z)||G.H[z][x]<-50||G.H[z][x]>500) continue; const y=G.H[z][x]+.022, u0=hash(x,z)>.5?0:.5, h=G.H[z][x];
    if(gr(x,z-1,h)) q([x,y,z+dp],[x+1,y,z+dp],[x+1,y,z],[x,y,z],u0);
    if(gr(x,z+1,h)) q([x+1,y,z+1-dp],[x,y,z+1-dp],[x,y,z+1],[x+1,y,z+1],u0);
    if(gr(x-1,z,h)) q([x+dp,y,z],[x+dp,y,z+1],[x,y,z+1],[x,y,z],u0);
    if(gr(x+1,z,h)) q([x+1-dp,y,z+1],[x+1-dp,y,z],[x+1,y,z],[x+1,y,z+1],u0); }
  if(!p.length) return; const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geo.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));
  const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:t,alphaTest:.5,side:THREE.DoubleSide})); m.receiveShadow=true; G.root.add(m); }
// ---------- trees ----------
function vhTreeSprite(kind,seed){ const W=128, H=152, [cv,c]=mkCanvas(W,H), cx=W/2, bl=kind==='blossom', L=bl?['#8a3e62','#b8587e','#dd86a6','#f6b8ce','#ffe2ec']:['#1f4a2a','#2f6a35','#458c42','#66ab52','#9ad070'], warm=bl?'#ffd0b8':'#d8d66a';
  // trunk: bark in three tones, roots, two limbs
  for(let y=H-58;y<H;y++){ const w=6+Math.round((y-(H-58))/58*4); R(c,cx-w,y,w*2,1,'#5a3b28'); R(c,cx-w,y,2,1,'#7a563a'); R(c,cx+w-4,y,4,1,'#3c2618'); if((y+seed)%7===0) R(c,cx-w+3,y,w,1,'#46301f'); }
  R(c,cx-16,H-5,32,5,'#5a3b28'); R(c,cx-16,H-5,5,2,'#7a563a'); R(c,cx+8,H-4,8,4,'#3c2618'); pline(c,cx-2,H-52,cx-26,H-84,'#5a3b28',5); pline(c,cx+2,H-56,cx+24,H-90,'#4a3020',5); pline(c,cx,H-58,cx+2,H-96,'#5a3b28',6);
  // the canopy: many leaf clusters, dark below, lit and warm on the sun's side (upper left)
  const blob=(x,y,r)=>{ ell(c,x+2,y+3,r,r*.82,L[0]); ell(c,x,y,r,r*.8,L[1]); ell(c,x-r*.18,y-r*.2,r*.8,r*.62,L[2]); ell(c,x-r*.34,y-r*.36,r*.52,r*.38,L[3]); ell(c,x-r*.46,y-r*.5,r*.24,r*.16,L[4]); ell(c,x-r*.62,y-r*.34,r*.1,r*.08,warm); };
  const B=[[cx,62,30],[cx-30,72,22],[cx+30,70,23],[cx-18,42,22],[cx+18,40,22],[cx,30,20],[cx-40,56,15],[cx+42,54,15],[cx,84,22],[cx-22,92,14],[cx+24,90,14],[cx-8,54,18],[cx+10,66,16]];
  B.sort((a,b)=>b[1]-a[1]).forEach(([x,y,r],i)=>blob(x+Math.round((hash(i,seed)-.5)*6),y+Math.round((hash(seed,i)-.5)*5),r));
  for(let i=0;i<150;i++){ const x=Math.floor(hash(i,seed+40)*W), y=Math.floor(hash(seed+40,i)*100)+10; R(c,x,y,2,1,i%3?L[4]:L[0]); }
  try{ removeOrphans(c,W,H); outlinePass(c,W,H,[10,16,14]); }catch(e){} return cv; }
(function(){ const at=addTree; addTree=function(G,x,z,kind,s){ try{ if(VH.on&&G&&(kind==='oak'||kind==='blossom')){ const v=Math.floor(hash(x,z)*3), key=kind+v, cv=(VH.trees||(VH.trees={}))[key]||(VH.trees[key]=vhTreeSprite(kind,v));
        const m=billboard(cv,cv.width/PPU,cv.height/PPU,{foot:.1}); m.position.set(x,groundY(x,z),z); if(s&&s<1) m.scale.setScalar(s/1.1+.1); G.root.add(m); try{ if(G.biome!=='village'){ G._vhT=(G._vhT||0)+1; if(G._vhT<=70){ const sd=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:vhSoftTex(),color:0x0a0614,transparent:true,opacity:.28,depthWrite:false,fog:false})); sd.rotation.x=-Math.PI/2; sd.position.set(x,groundY(x,z)+.03,z+.2); sd.scale.set(3.4,2,1); G.root.add(sd); } } }catch(e){} return m; } }catch(e){ console.error('vh tree',e); } return at.apply(this,arguments); }; })();
// ---------- lamp posts, the fountain, the stalls ----------
(function(){ const al=addLantern; addLantern=function(G,x,z){ const r=al.apply(this,arguments); try{ if(VH.on&&G&&!VH.low){ const y=groundY(x,z), I=vhMat('iron');
        addBox(G,.36,.16,.36,vhMat('stone'),x,y,z); addBox(G,.2,.1,.2,I,x,y+.16,z,false); addBox(G,.18,.06,.18,I,x,y+2.3,z,false); addBox(G,.06,.3,.06,I,x+.2,y+1.98,z,false); addBox(G,.3,.05,.05,I,x+.33,y+2.08,z,false);
        const cap=new THREE.Mesh(new THREE.ConeGeometry(.27,.2,4),I); cap.rotation.y=Math.PI/4; cap.position.set(x+.5,y+2.28,z); G.root.add(cap); addBox(G,.34,.04,.34,I,x+.5,y+1.8,z,false); addBox(G,.05,.08,.05,I,x+.5,y+2.38,z,false);
        for(const [ox,oz] of [[-.13,-.13],[.13,-.13],[-.13,.13],[.13,.13]]) addBox(G,.03,.36,.03,I,x+.5+ox,y+1.82,z+oz,false); } }catch(e){ console.error('vh lantern',e); } return r; }; })();
(function(){ const af=addFountain; addFountain=function(G,cx,cz){ const r=af.apply(this,arguments); try{ if(VH.on&&G&&G.biome==='village'){ const st=vhMat('stone');
        for(let i=0;i<14;i++){ const a=i/14*6.283, m=addBox(G,.78,.2,.3,st,cx+Math.cos(a)*1.86,.58,cz+Math.sin(a)*1.86,false); m.rotation.y=-a+Math.PI/2; }
        const sh=new THREE.Mesh(new THREE.RingGeometry(.5,1.45,28),new THREE.MeshBasicMaterial({color:0xbfe4ff,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); sh.rotation.x=-Math.PI/2; sh.position.set(cx,.565,cz); G.root.add(sh);
        const top=new THREE.Mesh(new THREE.CylinderGeometry(.16,.22,.34,8),st); top.position.set(cx,2.2,cz); G.root.add(top);
        for(let i=0;i<4;i++){ const a=i*1.57+.5, pad=new THREE.Mesh(new THREE.CircleGeometry(.16,8),new THREE.MeshLambertMaterial({color:0x4f9a4a})); pad.rotation.x=-Math.PI/2; pad.position.set(cx+Math.cos(a)*1.05,.57,cz+Math.sin(a)*1.05); G.root.add(pad); }
        G.anim.push(()=>{ sh.material.opacity=.16+.08*Math.sin(Game.time*2.2); sh.rotation.z=Game.time*.3; }); } }catch(e){ console.error('vh fountain',e); } return r; }; })();
(function(){ const as=addStall; addStall=function(G,x,z,col){ const r=as.apply(this,arguments); try{ if(VH.on&&G&&G.biome==='village'&&!VH.low){ const cm=new THREE.MeshLambertMaterial({color:col}), wm=new THREE.MeshLambertMaterial({color:0xf2ece0}), cr=tpMat('crate');
        for(let i=0;i<8;i++){ const m=addBox(G,.36,.16,.03,i%2?wm:cm,x+.2+i*.4,1.5,z+1.02,false); m.rotation.x=.2; }                       /* the awning's fringe */
        addBox(G,.5,.42,.46,cr,x-.42,0,z+.55); addBox(G,.4,.32,.4,cr,x-.4,.42,z+.55); addBox(G,.46,.4,.44,cr,x+3.42,0,z+.5);                     /* crates either side */
        for(const [sx,sc] of [[x+3.4,0xd9c08a],[x+3.75,0xc8a870]]){ const s=new THREE.Mesh(new THREE.CylinderGeometry(.17,.21,.46,8),new THREE.MeshLambertMaterial({color:sc})); s.position.set(sx,.63+(sx>x+3.6?-.4:0),z+.5+(sx>x+3.6?.3:0)); s.castShadow=true; G.root.add(s); }
        addBox(G,.05,.34,.05,vhMat('iron'),x+2.85,1.5,z+.75,false); addBox(G,.16,.2,.16,new THREE.MeshLambertMaterial({color:0x2a2420,emissive:0xffb24a,emissiveIntensity:2.2}),x+2.85,1.3,z+.75,false); } }catch(e){ console.error('vh stall',e); } return r; }; })();
// ---------- props, contact shadows, the backdrop ----------
function vhSoftTex(){ if(VH.soft) return VH.soft; const S=64, cv=document.createElement('canvas'); cv.width=cv.height=S; const c=cv.getContext('2d'); try{ const g=c.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.55,'rgba(255,255,255,.5)'); g.addColorStop(1,'rgba(255,255,255,0)'); c.fillStyle=g; c.fillRect(0,0,S,S); }catch(e){} return VH.soft=new THREE.CanvasTexture(cv); } /* a smooth falloff: the stepped pixel glow, in black, drew hard dark blocks */
function vhShade(G,x,z,w,dp,op,owner){ op*=.62; const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:vhSoftTex(),color:0x0a0614,transparent:true,opacity:op,depthWrite:false,fog:false})); m.rotation.x=-Math.PI/2; m.position.set(x,groundY(x,z)+.03,z); m.scale.set(w,dp,1); G.root.add(m); VH.decals.push({m,op,owner,ph:0}); return m; }
function vhVillage2(G){ const RZ=VH.raise=[], blk=(x,z,h,o)=>{ if(x>=0&&z>=0&&x<G.w&&z<G.d) RZ.push({x,z,h,o:o||null,h0:G.H[z][x],on:0}); }; /* a prop is a raised cell, not a wall: you can mantle onto it like onto the stalls and the roofs (the raise is applied last, after the grass and the shadows are laid on the flat ground) */
  try{ vhEdges(G); }catch(e){ console.error('vh edges',e); }
  // contact shadows: houses, trees, stalls, the fountain, the lamp posts
  [[3,5,6,4],[11,4,7,5],[23,5,6,4],[31,4,7,5]].forEach(([x,z,w,d])=>{ const o=vhOwner(G,'house',x+w/2,z+d/2); vhShade(G,x+w/2,z+d+.25,w+1.6,1.7,.5,o); });
  [[2,3],[10,2.5],[19.5,2.8],[22,3],[30,2.6],[38,3],[1.5,8],[15.4,8.6],[25.2,8.8]].forEach(([x,z])=>vhShade(G,x,z+.2,3.4,2,.45,vhOwner(G,'tree',x,z)));
  [[13.5,17.5],[26.5,17.5]].forEach(([x,z])=>vhShade(G,x,z+.3,4.6,2.4,.45,vhOwner(G,'stall',x,z))); vhShade(G,20,11.2,5.6,5,.42,vhOwner(G,'fountain',20,11.2));
  [[7,10],[15.5,10.2],[24.5,10.2],[33,10],[10,15.2],[29,15.2],[37,14.6]].forEach(([x,z])=>vhShade(G,x,z,1.1,.9,.5,vhOwner(G,'lantern',x+.2,z)));
  if(!VH.low){ const wood=vhMat('beam'), woodL=vhMat('sill'), I=vhMat('iron');
    // a woodpile in the gap between the first two houses
    for(let r=0;r<3;r++) for(let i=0;i<4-r;i++){ const m=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,1.1,8),(i+r)%2?wood:woodL); m.rotation.x=Math.PI/2; m.position.set(9.35+i*.34+r*.17,.16+r*.29,5.7); m.castShadow=true; G.root.add(m); } blk(9,5,.78); blk(10,5,.78); vhShade(G,9.9,5.9,2,1.5,.45,null);
    // hay bales in the other gap
    { const hay=new THREE.MeshLambertMaterial({color:0xd8b04a}), band=new THREE.MeshLambertMaterial({color:0x8a6a2a}); for(const [hx,hy,hz] of [[29.4,0,5.7],[30.25,0,5.75],[29.8,.56,5.7]]){ addBox(G,.8,.56,.6,hay,hx,hy,hz); addBox(G,.82,.05,.62,band,hx,hy+.14,hz,false); addBox(G,.82,.05,.62,band,hx,hy+.38,hz,false); } blk(29,5,1.12); blk(30,5,.56); vhShade(G,29.85,5.9,2.2,1.5,.45,null); }
    // a hand cart below the fountain
    { const bx=20.6, bz=18.6; addBox(G,1.5,.12,.86,wood,bx,.46,bz); for(const sz of [-.43,.43]) addBox(G,1.5,.3,.06,woodL,bx,.58,bz+sz); addBox(G,.06,.3,.86,woodL,bx-.75,.58,bz); for(const sz of [-.3,.3]){ const hd=addBox(G,.9,.06,.06,wood,bx+1.1,.52,bz+sz,false); hd.rotation.z=-.18; }
      for(const sz of [-.5,.5]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.08,12),wood); w.rotation.x=Math.PI/2; w.position.set(bx-.15,.34,bz+sz); w.castShadow=true; G.root.add(w); const hub=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.1,8),I); hub.rotation.x=Math.PI/2; hub.position.set(bx-.15,.34,bz+sz); G.root.add(hub); }
      for(const [ox,oc] of [[-.35,0xe0a040],[0,0xd05a4a],[.35,0x9ac05a]]) addBox(G,.3,.22,.3,new THREE.MeshLambertMaterial({color:oc}),bx+ox,.58,bz,false); blk(19,18,.8); blk(20,18,.8); blk(21,18,.6); vhShade(G,bx,bz+.2,2.6,1.8,.45,null); }
    // a bench facing the fountain
    { const bx=16.45, bz=11.3; addBox(G,.42,.07,1.5,woodL,bx,.42,bz); addBox(G,.07,.5,1.5,wood,bx-.2,.48,bz); for(const sz of [-.6,.6]){ addBox(G,.4,.42,.07,I,bx,0,bz+sz); } blk(16,10,.5); blk(16,11,.5); vhShade(G,bx,bz,1.3,2.1,.4,null); }
    // washing on a line between the first two houses
    { const y=2.5, z=9.15; addBox(G,2.1,.02,.02,I,10,y,z,false); const cl=[0xf2ece0,0xc8423a,0x8ad0ff,0xf2c14e,0xf2ece0]; for(let i=0;i<5;i++){ const h=.34+hash(i,3)*.3, m=addBox(G,.3,h,.02,new THREE.MeshLambertMaterial({color:cl[i],side:THREE.DoubleSide}),9.2+i*.4,y-h,z,false); G.anim.push(()=>{ m.rotation.x=Math.sin(Game.time*1.6+i)*.12; }); } }
    // flower beds along the house fronts, and twice the grass everywhere
    try{ [[3,5,6,4],[11,4,7,5],[23,5,6,4],[31,4,7,5]].forEach(([x,z,w,d])=>scatterTufts(G,0,[{kind:'flower',cols:['#f2c14e','#ec8fb0','#ffffff','#9fd0ff','#e85a5a'],n:26,s:1.15},{kind:'fern',cols:['#2a5a2a','#3a7036'],n:10,s:1}],[x,z+d,x+w,z+d+.75]));
      scatterTufts(G,0,[{kind:'grass',cols:['#3f7a2a','#4e8c34','#5f9f3e'],n:620,s:.85},{kind:'fern',cols:['#2a5a2a','#3a7036'],n:70,s:1.1},{kind:'tall',cols:['#3a6e28','#4e8c34'],n:120,s:1.5}],[1,5,39,22]); }catch(e){ console.error('vh tufts',e); } }
  // the backdrop: pines standing close behind the houses and round the edges
  try{ for(let i=0;i<17;i++){ const x=1+i*2.35+hash(i,5)*.8, z=.7+hash(5,i)*1.5, m=addTree(G,x,z,'pine',1); if(m){ m.scale.setScalar(1.1+hash(i,9)*.5); } } }catch(e){ console.error('vh pines',e); }
  // the crates and sacks beside each stall stand on the ground too (they go when the stall is smashed)
  if(!VH.low) for(const sx of [12,25]){ const o=vhOwner(G,'stall',sx+1.5,17.5); blk(sx-1,17,.74,o); blk(sx+3,17,.5,o); }
  for(const r of RZ){ if(r.o&&r.o.dead) continue; G.H[r.z][r.x]=Math.max(G.H[r.z][r.x],r.h0+r.h); r.on=1; }
  G.anim.push(()=>{ try{ for(const r of RZ) if(r.on&&r.o&&r.o.dead){ r.on=0; L.H[r.z][r.x]=r.h0; } }catch(e){} }); }
(function(){ const vb=LEVELDEF.village; LEVELDEF.village=function(){ const G=vb.apply(this,arguments); try{ if(VH.on) vhVillage2(G); }catch(e){ console.error('vh village 2',e); } return G; }; })();
// =====================================================================
// THE REST OF THE WORLD (v1.68). Every map gets what carries over safely: the ground textures in its own palette (same
// average colours, so telegraphs keep their contrast), grass hanging over road edges, the new trees, the dressed lamp
// posts. The maps you only walk through (the meadow, the ruins, the lake) also get more grass and a pool of light under
// every light source. Boss arenas get no extra grass and no light pools: nothing new lies on the ground where telegraphs do.
// =====================================================================
function vhWorld(G,key){ if(key==='village') return; try{ vhEdges(G); }catch(e){ console.error('vh edges',e); }
  if(!['meadow','ruins','lake'].includes(key)) return; const P=PAL[G.biome];
  try{ if(P&&!VH.low){ const n=Math.min(900,Math.floor(G.w*G.d*.3)); scatterTufts(G,0,[{kind:'grass',cols:[P.g[1],P.g[0],P.g[2]],n,s:.85},{kind:'tall',cols:[cShade(P.g[1],-.15),P.g[0]],n:Math.floor(n*.2),s:1.5}],[1,1,G.w-1,G.d-1]); } }catch(e){ console.error('vh tufts',e); }
  try{ const L0=G.lightSrc.slice(0,40), ds=[]; for(const s of L0){ const gy=groundY(s.x,s.z); if(gy>500||gy<-50||s.y-gy>5) continue; const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:GLOW,color:s.col,transparent:true,opacity:.26,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); m.rotation.x=-Math.PI/2; m.position.set(s.x,gy+.045,s.z); m.scale.set(s.r*.9,s.r*.9,1); m.renderOrder=1; G.root.add(m); ds.push({m,s,ph:Math.random()*6.28}); }
    if(ds.length) G.anim.push(()=>{ try{ const t=Game.time; for(const d of ds){ const on=G.lightSrc.includes(d.s); d.m.visible=on; if(on) d.m.material.opacity=.26*(d.s.flick?.86+.14*Math.sin(t*9+d.ph):1); } }catch(e){} }); }catch(e){ console.error('vh pools',e); } }
(function(){ for(const k of Object.keys(LEVELDEF)){ if(k==='village') continue; const f=LEVELDEF[k]; LEVELDEF[k]=function(){ const G=f.apply(this,arguments); try{ if(VH.on&&G) vhWorld(G,k); }catch(e){ console.error('vh world',e); } return G; }; } })();
