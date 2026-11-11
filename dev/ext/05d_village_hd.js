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
