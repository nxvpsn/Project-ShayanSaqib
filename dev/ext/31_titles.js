// =====================================================================
// THE TWINS' OWN TITLE DROPS AND ARENAS (solo fights; the duo and everyone else keep the Evangelion cards)
// - Caotan: Persona 5 title cards (ransom-note letters on a tilted red band) that SHATTER into the next phase (~2.1s).
//   Domain Expansion: Unlimited Cum Works. After the intro dialogue he spins, white goo splats spread until the whole
//   field is covered, then his hand wipes the screen and the arena is a round stained-glass mural of Hikari-chan
//   (Dive to the Heart style), as wide as the square arena, floating in the dark. The fight is kept inside the circle.
// - Omar: Zelda boss titles (subtitle + name panning across the lower screen and fading, ornament lines extending,
//   the camera drifting) and his health bar extends from empty when the phase starts.
//   Bankai: Kuroyuri Gekkō. A pulse runs out from him: every flower it passes turns black and the ground freezes into
//   ice, tile by tile, then snow keeps falling. The arena stays square.
// Everything 3D lives on the level root (gone with the level) and is undone by twEndFight; overlays clear in twClearCine.
// =====================================================================
const TWT={p5:null,zc:null,dom:null,circle:null,mural:null,ice:null,tufts:null};

// ---------- Persona 5 card ----------
function twP5Card(lines,dur){ TWT.p5={lines,t:0,dur:dur||2.1,shards:null,oc:null}; Sound.sfx('slam'); }
function twP5Rand(i){ const s=Math.sin(i*12.9898+78.233)*43758.5453; return s-Math.floor(s); }
function twP5Draw(c,P,u){ // the card itself on ctx c; u = letter reveal time
  const W=UW, H=UH; c.save(); c.translate(W/2,H/2); c.rotate(-.12);
  // black jagged backing, then the red band with halftone dots
  c.fillStyle='#0a0a0a'; c.beginPath(); c.moveTo(-W,-150); for(let x=-W;x<=W;x+=60) c.lineTo(x+30,-150-(twP5Rand(x)*30+10)); c.lineTo(W,150); for(let x=W;x>=-W;x-=60) c.lineTo(x-30,150+(twP5Rand(x+7)*30+10)); c.closePath(); c.fill();
  c.fillStyle='#e5191c'; c.fillRect(-W,-128,W*2,256); c.fillStyle='rgba(0,0,0,.22)'; for(let y=-120;y<128;y+=14) for(let x=-W;x<W;x+=14){ const r=2+2.5*((y+128)/256); c.beginPath(); c.arc(x+(y/14%2?7:0),y,r,0,7); c.fill(); }
  // white star bursts
  for(const [sx,sy,sr] of [[-430,-70,70],[460,60,90],[-80,100,40]]){ c.fillStyle='rgba(255,255,255,.9)'; c.beginPath(); for(let i=0;i<20;i++){ const a=i/20*6.2832, r=i%2?sr*.35:sr; c.lineTo(sx+Math.cos(a)*r,sy+Math.sin(a)*r); } c.closePath(); c.fill(); }
  // line 1: ransom-note letters popping in one by one
  const L1=P.lines[0]||'', L2=P.lines[1]||''; let x=0; const sz=[]; c.font=`900 76px ${FD}`; for(let i=0;i<L1.length;i++){ const k=.85+twP5Rand(i+3)*.3; sz.push(k); x+=(L1[i]===' '?30:c.measureText(L1[i]).width*k+14); }
  let cx=-x/2; for(let i=0;i<L1.length;i++){ const ch=L1[i], k=sz[i]; if(ch===' '){ cx+=30; continue; } c.font=`900 ${Math.round(76*k)}px ${FD}`; const w=c.measureText(ch).width; const show=u>.08+i*.025; if(show){
      const st=Math.floor(twP5Rand(i+11)*3), rot=(twP5Rand(i+5)-.5)*.3, y=-28+(twP5Rand(i+9)-.5)*16, pop=Math.min(1,(u-.08-i*.025)*12), s2=1+(1-pop)*.6;
      c.save(); c.translate(cx+w/2,y); c.rotate(rot); c.scale(s2,s2); const bw=w+14, bh=76*k*.95; c.fillStyle=st===0?'#0a0a0a':st===1?'#ffffff':'#e5191c'; c.fillRect(-bw/2,-bh*.72,bw,bh);
      if(st===2){ c.strokeStyle='#0a0a0a'; c.lineWidth=4; c.strokeRect(-bw/2,-bh*.72,bw,bh); } c.fillStyle=st===1?'#0a0a0a':'#ffffff'; c.textAlign='center'; c.fillText(ch,0,bh*.2); c.restore(); }
    cx+=w+14; }
  // line 2: white text on a skewed black strip
  if(L2&&u>.3){ c.font=`italic 900 32px ${FB}`; const w2=c.measureText(L2).width+48; c.save(); c.translate(40,62); c.transform(1,0,-.25,1,0,0); c.fillStyle='#0a0a0a'; c.fillRect(-w2/2,-28,w2,44); c.fillStyle='#ffffff'; c.textAlign='center'; c.fillText(L2,0,6); c.restore(); }
  c.restore(); }
function twP5Frame(){ const P=TWT.p5; if(!P) return; P.t+=1/60; const t=P.t, sh=P.dur-.55;
  if(t>=P.dur){ TWT.p5=null; return; }
  if(t<sh){ // slam in: black bars sweep across, a red flash, then the card
    const k=Math.min(1,t/.18); D.save(); D.fillStyle=`rgba(229,25,28,${Math.max(0,.55-t*2.5)})`; D.fillRect(0,0,UW,UH);
    D.globalAlpha=1; D.fillStyle='#0a0a0a'; D.save(); D.translate(UW/2,UH/2); D.rotate(-.12); D.fillRect(-UW*1.5+UW*k,-190,UW,26); D.fillRect(UW*.5-UW*k,170,UW,26); D.restore();
    D.save(); D.translate(UW/2*(1-k)*(-1),0); twP5Draw(D,P,t); D.restore(); D.restore(); return; }
  // shatter: the card breaks into shards that fly apart and fade, the next phase behind it
  if(!P.shards){ Sound.sfx('shatter'); Sound.sfx('glass'); FX.flash=Math.max(FX.flash,.35); P.oc=document.createElement('canvas'); P.oc.width=UW; P.oc.height=UH; try{ twP5Draw(P.oc.getContext('2d'),P,9); }catch(e){}
    P.shards=[]; const nx=9, ny=5; for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){ const x0=i*UW/nx, y0=j*UH/ny, x1=x0+UW/nx, y1=y0+UH/ny, jx=(a,b)=>[a+(twP5Rand(a*7+b)-.5)*40,b+(twP5Rand(b*3+a)-.5)*40];
        for(const tri of [[jx(x0,y0),jx(x1,y0),jx(x1,y1)],[jx(x0,y0),jx(x1,y1),jx(x0,y1)]]){ const mx=(tri[0][0]+tri[1][0]+tri[2][0])/3, my=(tri[0][1]+tri[1][1]+tri[2][1])/3, dx=mx-UW/2, dy=my-UH/2, d=Math.hypot(dx,dy)||1;
          P.shards.push({tri,mx,my,vx:dx/d*rnd(500,1100),vy:dy/d*rnd(400,900)-200,rot:rnd(-6,6)}); } } }
  const u=(t-sh)/.55; D.save(); for(const s of P.shards){ D.save(); D.globalAlpha=Math.max(0,1-u*1.1); D.translate(s.mx+s.vx*u,s.my+s.vy*u+500*u*u); D.rotate(s.rot*u); D.translate(-s.mx,-s.my);
    D.beginPath(); D.moveTo(s.tri[0][0],s.tri[0][1]); D.lineTo(s.tri[1][0],s.tri[1][1]); D.lineTo(s.tri[2][0],s.tri[2][1]); D.closePath(); D.clip(); if(P.oc) D.drawImage(P.oc,0,0);
    D.strokeStyle='rgba(255,255,255,.8)'; D.lineWidth=2; D.stroke(); D.restore(); } D.restore(); }

// ---------- Zelda card ----------
function twZeldaCard(top,name,bottom,dur){ TWT.zc={top,name,bottom,t:0,dur:dur||2.6}; Sound.sfx('choir'); }
function twZeldaFrame(){ const Z=TWT.zc; if(!Z) return; Z.t+=1/60; const t=Z.t; if(t>=Z.dur){ TWT.zc=null; return; }
  const a=Math.min(1,t/.35)*Math.min(1,(Z.dur-t)/.5), u=t/Z.dur, px=lerp(36,-36,u), cy=UH*.72, ln=Math.min(1,t/.6)*300;
  D.save(); const g=D.createLinearGradient(0,cy-120,0,UH); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,`rgba(0,0,0,${.55*a})`); D.fillStyle=g; D.fillRect(0,cy-120,UW,UH-cy+120);
  D.globalAlpha=a; D.textAlign='center'; D.shadowColor='rgba(0,0,0,.85)'; D.shadowBlur=14;
  if(Z.top){ D.font=`italic 600 24px ${FB}`; D.fillStyle='#e8d6a0'; D.fillText(Z.top,UW/2+px*.6,cy-40); }
  D.font=`700 66px ${FD}`; try{ D.letterSpacing='4px'; }catch(e){} D.fillStyle='#fbf6ea'; D.fillText(Z.name,UW/2+px,cy+18); try{ D.letterSpacing='0px'; }catch(e){}
  D.shadowBlur=0; D.strokeStyle='rgba(232,214,160,.85)'; D.lineWidth=1.5; D.beginPath(); D.moveTo(UW/2-ln-20,cy-26); D.lineTo(UW/2-20,cy-26); D.moveTo(UW/2+20,cy-26); D.lineTo(UW/2+ln+20,cy-26); D.stroke();
  D.fillStyle='#e8d6a0'; D.beginPath(); D.moveTo(UW/2,cy-34); D.lineTo(UW/2+8,cy-26); D.lineTo(UW/2,cy-18); D.lineTo(UW/2-8,cy-26); D.closePath(); D.fill();
  if(Z.bottom){ D.font=`italic 500 20px ${FB}`; D.fillStyle='#cfc4dc'; D.fillText(Z.bottom,UW/2+px*1.3,cy+52); }
  D.restore(); }
// the camera drifts past the boss while the title shows
function* twZeldaPan(T,dur){ const gy=groundY(T.x,T.z); cineSet(T.x-3.2,gy+1.5,T.z+8.5,T.x-1.2,gy+1.9,T.z); yield cineTo([T.x+3.2,gy+1.9,T.z+7.6],[T.x+1.2,gy+2.1,T.z],dur,t=>t); }
// Omar's bar extends from empty when a phase starts (T.zBar = start time)
(function(){ const bf=twBarFor; twBarFor=function(T,x,y,w,big){ if(!T||!T.zBar) return bf.apply(this,arguments); const g=Math.min(1,(performance.now()-T.zBar)/950), e=1-Math.pow(1-g,3);
    if(g>=1){ T.zBar=0; return bf.apply(this,arguments); }
    D.save(); D.beginPath(); D.rect(0,0,UW,y-2); D.rect(0,y+17,UW,UH); D.rect(0,y-2,x+w*e,19); D.clip(); const r=bf.apply(this,arguments); D.restore();
    D.save(); D.fillStyle='rgba(255,255,255,.85)'; D.fillRect(x+w*e-3,y-3,4,21); D.restore(); return r; }; })();

// ---------- Domain Expansion: Unlimited Cum Works ----------
function twMuralTex(){ if(TWT.muralTex) return TWT.muralTex; const S=768, C=S/2, cv=document.createElement('canvas'); cv.width=cv.height=S; const c=cv.getContext('2d');
  try{ const TAU=6.2832, ink='#1c1028', fill=(f,path)=>{ c.fillStyle=f; c.beginPath(); path(); c.fill(); c.strokeStyle=ink; c.lineWidth=5; c.stroke(); }, ell=(x,y,rx,ry)=>()=>c.ellipse(x,y,rx,ry,0,0,TAU), poly=pts=>()=>{ pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.closePath(); };
    // sunburst of pink glass, lighter towards the middle
    for(let i=0;i<32;i++){ c.fillStyle=i%2?'#ffc8e6':'#f2b0da'; c.beginPath(); c.moveTo(C,C); c.arc(C,C,302,i/32*TAU,(i+1)/32*TAU); c.closePath(); c.fill(); }
    const gr=c.createRadialGradient(C,C,20,C,C,300); gr.addColorStop(0,'rgba(255,250,255,.8)'); gr.addColorStop(1,'rgba(255,255,255,0)'); c.fillStyle=gr; c.beginPath(); c.arc(C,C,300,0,TAU); c.fill();
    // the outer band with medallions (hearts, glasses, stars) and a gold rim
    c.fillStyle='#26265e'; c.beginPath(); c.arc(C,C,374,0,TAU); c.arc(C,C,300,0,TAU,true); c.fill(); c.fillStyle='#e8c060'; c.beginPath(); c.arc(C,C,384,0,TAU); c.arc(C,C,372,0,TAU,true); c.fill();
    for(let i=0;i<12;i++){ const a=i/12*TAU-Math.PI/2, mx=C+Math.cos(a)*337, my=C+Math.sin(a)*337, col=['#ff8ac8','#7ab8ff','#ffe08a'][i%3]; fill(col,ell(mx,my,27,27));
      c.fillStyle=ink; c.strokeStyle=ink; c.lineWidth=3; if(i%3===0){ c.fillStyle='#ff3a6a'; c.beginPath(); c.moveTo(mx,my+11); c.bezierCurveTo(mx-20,my-2,mx-9,my-16,mx,my-6); c.bezierCurveTo(mx+9,my-16,mx+20,my-2,mx,my+11); c.fill(); }
      else if(i%3===1){ c.beginPath(); c.arc(mx-9,my,7,0,TAU); c.stroke(); c.beginPath(); c.arc(mx+9,my,7,0,TAU); c.stroke(); c.beginPath(); c.moveTo(mx-2,my); c.lineTo(mx+2,my); c.stroke(); }
      else { c.fillStyle='#fff8d8'; c.beginPath(); for(let k=0;k<10;k++){ const r=k%2?6:14, b=k/10*TAU-Math.PI/2; c.lineTo(mx+Math.cos(b)*r,my+Math.sin(b)*r); } c.closePath(); c.fill(); } }
    // halo behind her head
    fill('#fff4c8',ell(C,250,150,150)); for(let i=0;i<16;i++){ c.strokeStyle='rgba(255,220,140,.9)'; c.lineWidth=6; const a=i/16*TAU; c.beginPath(); c.moveTo(C+Math.cos(a)*112,250+Math.sin(a)*112); c.lineTo(C+Math.cos(a)*146,250+Math.sin(a)*146); c.stroke(); }
    // Hikari-chan, eyes closed, holding a heart: pink hair, sailor uniform, navy skirt
    fill('#ff8ac8',()=>{ c.ellipse(C,250,120,122,0,0,TAU); }); fill('#ff8ac8',()=>{ c.moveTo(268,250); c.lineTo(274,478); c.quadraticCurveTo(300,500,330,470); c.lineTo(438,470); c.quadraticCurveTo(468,500,494,478); c.lineTo(500,250); c.closePath(); });
    fill('#ffe2d0',ell(C,265,80,88)); fill('#ffe2d0',poly([[366,338],[402,338],[402,366],[366,366]]));
    fill('#ff8ac8',poly([[300,236],[318,190],[350,160],[384,150],[418,160],[450,190],[468,236],[452,268],[432,232],[410,274],[384,236],[358,274],[336,232],[316,268]]));
    c.strokeStyle='#2a1a4a'; c.lineWidth=6; for(const ex of [350,418]){ c.beginPath(); c.arc(ex,278,16,.15*Math.PI,.85*Math.PI); c.stroke(); }
    c.fillStyle='#ff9aa8'; for(const bx of [334,434]){ c.beginPath(); c.ellipse(bx,304,15,7,0,0,TAU); c.fill(); } c.lineWidth=4; c.beginPath(); c.arc(C,316,9,.2*Math.PI,.8*Math.PI); c.stroke();
    fill('#ffffff',ell(298,410,28,52)); fill('#ffffff',ell(470,410,28,52)); fill('#ffffff',poly([[316,362],[452,362],[472,474],[296,474]]));
    fill('#3a3a8a',poly([[316,362],[452,362],[384,424]])); fill('#ff3a5a',poly([[384,412],[346,396],[346,432]])); fill('#ff3a5a',poly([[384,412],[422,396],[422,432]])); fill('#ff3a5a',ell(C,412,10,10));
    fill('#3a3a8a',poly([[296,474],[472,474],[502,566],[266,566]])); c.strokeStyle='#26265e'; c.lineWidth=4; for(const [a,b] of [[330,318],[368,364],[400,404],[438,450]]){ c.beginPath(); c.moveTo(a,476); c.lineTo(b,564); c.stroke(); }
    fill('#ff3a8a',()=>{ c.moveTo(C,478); c.bezierCurveTo(C-44,450,C-30,416,C,434); c.bezierCurveTo(C+30,416,C+44,450,C,478); }); fill('#ffe2d0',ell(356,456,15,15)); fill('#ffe2d0',ell(412,456,15,15));
    fill('#ffe2d0',poly([[338,566],[368,566],[368,624],[338,624]])); fill('#ffe2d0',poly([[400,566],[430,566],[430,624],[400,624]]));
    fill('#ffffff',poly([[336,620],[370,620],[370,660],[336,660]])); fill('#ffffff',poly([[398,620],[432,620],[432,660],[398,660]])); fill('#5a3020',ell(352,666,24,11)); fill('#5a3020',ell(416,666,24,11));
    for(const [sx,sy,sr] of [[230,330,16],[540,320,20],[250,520,12],[520,540,14],[384,96,10]]){ c.fillStyle='#ffffff'; c.beginPath(); for(let k=0;k<8;k++){ const r=k%2?sr*.3:sr, b=k/8*TAU; c.lineTo(sx+Math.cos(b)*r,sy+Math.sin(b)*r); } c.closePath(); c.fill(); }
    // stained glass: every piece shaded a little differently, with dark leading between the pieces (jittered-grid Voronoi)
    const id=c.getImageData(0,0,S,S), d=id.data, g=22, N=Math.ceil(S/g)+1, hs=(i,j,k)=>{ const s=Math.sin(i*127.1+j*311.7+k*74.7)*43758.5453; return s-Math.floor(s); };
    for(let y=0;y<S;y++) for(let x=0;x<S;x++){ const i=(y*S+x)*4, r=Math.hypot(x+.5-C,y+.5-C); if(r>384){ d[i+3]=0; continue; }
      if(r>381||Math.abs(r-300)<2.6||Math.abs(r-373)<2.2){ d[i]=28; d[i+1]=16; d[i+2]=40; d[i+3]=255; continue; }
      const gx=Math.floor(x/g), gy=Math.floor(y/g); let d1=1e9, d2=1e9, best=0; for(let oy=-1;oy<=1;oy++) for(let ox=-1;ox<=1;ox++){ const cx=gx+ox, cy=gy+oy; if(cx<0||cy<0||cx>=N||cy>=N) continue;
        const sx=(cx+hs(cx,cy,1))*g, sy=(cy+hs(cx,cy,2))*g, q=(x-sx)*(x-sx)+(y-sy)*(y-sy); if(q<d1){ d2=d1; d1=q; best=cx*N+cy; } else if(q<d2) d2=q; }
      const e=Math.sqrt(d2)-Math.sqrt(d1); if(e<1.7){ d[i]=28; d[i+1]=16; d[i+2]=40; continue; } const f=.86+hs(best,7,3)*.24+(e<4?.08:0); d[i]=Math.min(255,d[i]*f); d[i+1]=Math.min(255,d[i+1]*f); d[i+2]=Math.min(255,d[i+2]*f); }
    c.putImageData(id,0,0); }catch(e){}
  const t=new THREE.CanvasTexture(cv); t.encoding=THREE.sRGBEncoding; t.anisotropy=4; return TWT.muralTex=t; }
// the screen-filling goo for the wipe, and Caotan's hand
function twGooCanvas(){ if(TWT.gooCv) return TWT.gooCv; const cv=document.createElement('canvas'); cv.width=UW; cv.height=UH; const c=cv.getContext('2d');
  try{ c.fillStyle='#f3f1f8'; c.fillRect(0,0,UW,UH); for(let i=0;i<160;i++){ const x=twP5Rand(i)*UW, y=twP5Rand(i+.5)*UH, r=20+twP5Rand(i+.7)*90; c.fillStyle=['#e6e3ef','#fbfaff','#dcd9e8','#ffffff'][i%4]; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); }
    for(let i=0;i<40;i++){ const x=twP5Rand(i+3.3)*UW, y=twP5Rand(i+4.4)*UH; c.fillStyle='rgba(255,255,255,.95)'; c.beginPath(); c.ellipse(x,y,10+twP5Rand(i)*16,5+twP5Rand(i+1)*7,-.5,0,7); c.fill(); } }catch(e){}
  return TWT.gooCv=cv; }
function twDrawHand(x,y,s){ D.save(); D.translate(x,y); D.scale(s,s); D.rotate(-.12); D.fillStyle='#f0c8a8'; D.strokeStyle='#3a2018'; D.lineWidth=6;
  const f=(fx,fy,w,h)=>{ D.beginPath(); D.ellipse(fx,fy,w,h,0,0,7); D.fill(); D.stroke(); };
  f(-70,-120,22,70); f(-24,-150,24,86); f(24,-140,24,80); f(66,-105,21,62); D.beginPath(); D.ellipse(0,20,92,110,0,0,7); D.fill(); D.stroke(); f(-108,10,22,55);
  D.fillStyle='#f0c8a8'; D.fillRect(-60,40,120,200); D.fillStyle='#ffffff'; D.fillRect(-66,150,132,120); D.restore(); }
function twDomFrame(){ const M=TWT.dom; if(!M) return; const cv=twGooCanvas();
  if(M.mode==='cover'){ M.k=Math.min(1,M.k+1/60/.35); D.save(); D.globalAlpha=M.k; D.drawImage(cv,0,0); D.restore(); return; }
  if(M.mode==='wipe'){ M.t+=1/60; const u=Math.min(1,M.t/1.05), hx=-260+(UW+520)*(u*u*(3-2*u)); if(u>=1){ TWT.dom=null; return; }
    D.save(); D.beginPath(); D.moveTo(hx,0); for(let y=0;y<=UH;y+=30) D.lineTo(hx+Math.sin(y*.05+M.t*9)*22+30,y); D.lineTo(UW,UH); D.lineTo(UW,0); D.closePath(); D.clip(); D.drawImage(cv,0,0); D.restore();
    for(let i=0;i<6;i++){ D.fillStyle='rgba(243,241,248,.9)'; D.beginPath(); D.arc(hx-20-i*24,UH*twP5Rand(i+M.t)*1,8+i,0,7); D.fill(); } twDrawHand(hx-40,UH*.62,1.55); } }
function twTufts(){ return (L&&L.root?L.root.children:[]).filter(o=>o.isInstancedMesh); }
function twGoopSpread(cx,cz,dur){ const tex=twSplatTex(0), A=twBounds(), n=1500, geo=new THREE.PlaneGeometry(1,1), mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.1,depthWrite:false,fog:false});
  const im=new THREE.InstancedMesh(geo,mat,n), o=new THREE.Object3D(), P=[]; for(let i=0;i<n;i++){ const x=A.x0-6+Math.random()*(A.x1-A.x0+12), z=A.z0-6+Math.random()*(A.z1-A.z0+12); P.push({x,z,d:Math.hypot(x-cx,z-cz)+rnd(0,8),s:rnd(3,6.5),r:rnd(0,6.28)});
    o.position.set(x,.06+i*.00002,z); o.rotation.set(-Math.PI/2,0,P[i].r); o.scale.set(0,0,0); o.updateMatrix(); im.setMatrixAt(i,o.matrix); }
  im.renderOrder=3; L.root.add(im); const maxd=Math.max(...P.map(p=>p.d)), k={t:0};
  Game.fxUpd.push(dt=>{ if(!im.parent) return false; k.t+=dt; const R=maxd*Math.min(1,k.t/dur); let ch=false;
    for(let i=0;i<n;i++){ const p=P[i]; if(p.on||p.d>R) continue; p.on=1; ch=true; o.position.set(p.x,.06+i*.00002,p.z); o.rotation.set(-Math.PI/2,0,p.r); o.scale.set(p.s,p.s,1); o.updateMatrix(); im.setMatrixAt(i,o.matrix); }
    if(ch) im.instanceMatrix.needsUpdate=true; return k.t<dur+.2; }); return im; }
function twMuralOn(){ const A=twBounds(), cx=(A.x0+A.x1)/2, cz=(A.z0+A.z1)/2, r=(A.x1-A.x0)/2; if(TWT.mural) return;
  const hid=[]; for(const o of (L.root?L.root.children:[])){ if(o.isInstancedMesh||(o.isMesh&&o.geometry&&o.geometry.type==='DodecahedronGeometry')){ if(o.visible){ o.visible=false; hid.push(o); } } }
  const g=new THREE.Group(); const vo=new THREE.Mesh(new THREE.PlaneGeometry((L.w||120)+80,(L.d||110)+80),new THREE.MeshBasicMaterial({color:0x04020a,fog:false})); vo.rotation.x=-Math.PI/2; vo.position.set((L.w||116)/2,.02,(L.d||108)/2);
  const mu=new THREE.Mesh(new THREE.CircleGeometry(r,96),new THREE.MeshBasicMaterial({map:twMuralTex(),transparent:true,fog:false})); mu.rotation.x=-Math.PI/2; mu.position.set(cx,.04,cz);
  const rim=new THREE.Mesh(new THREE.RingGeometry(r,r+2.5,96),new THREE.MeshBasicMaterial({color:0xffb0e0,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); rim.rotation.x=-Math.PI/2; rim.position.set(cx,.05,cz);
  g.add(vo,mu,rim); L.root.add(g); TWT.mural={g,hid}; TWT.circle={x:cx,z:cz,r}; }
function* twCaoDomain(T){ const P=Player, A=twBounds(), cx=(A.x0+A.x1)/2, cz=(A.z0+A.z1)/2; twMuralTex(); /* build the glass now, while he talks */
  yield say('caotan',"Senpai... have you ever seen a man's soul? Let me show you mine.");
  twCamT(T,6,0); yield say('caotan',"Domain Expansion...",'angry');
  // he spins and the goo goes everywhere
  Sound.sfx('squelch'); Sound.sfx('drone'); T.cast=1; const sp={on:1,t:0}; Game.fxUpd.push(dt=>{ if(!sp.on) return false; sp.t+=dt; if(Math.floor(sp.t/.07)%2) T.f=-T.f;
      for(let i=0;i<8;i++){ const a=rnd(0,6.28), v=rnd(6,16); FX.spawn(T.x,T.y+1.2,T.z,Math.cos(a)*v,rnd(2,7),Math.sin(a)*v,rnd(.4,.9),i%3?0xffffff:0xe6e3ef,rnd(.25,.5),12,false); } if(Math.random()<.2) Sound.sfx('squelch'); return true; });
  yield wait(.5); cineSet(cx,62,cz+34,cx,0,cz-2); twGoopSpread(T.x,T.z,2.1); yield wait(2.2);
  // the whole screen goes white, the floor is swapped underneath, and his hand wipes it clean
  TWT.dom={mode:'cover',k:0}; yield wait(.4); sp.on=0; T.cast=0; T.f=-1;
  for(const o of L.root.children.slice()) if(o.isInstancedMesh&&o.material&&o.material.map===twSplatTex(0)) L.root.remove(o); twMuralOn();
  cineSet(cx,48,cz+40,cx,0,cz-4); twP5Card(['UNLIMITED CUM WORKS','DOMAIN EXPANSION'],2.1); yield wait(2.1);
  TWT.dom={mode:'wipe',t:0}; Sound.sfx('whoosh'); yield wait(1.1); Sound.sfx('choir'); Sound.sfx('sparkle'); yield cineTo([cx,30,cz+38],[cx,0,cz],1.1,twEIO);
  twCamT(T,7,1.2); if(ALI()) yield say('ali',"...That is your body pillow. On the floor. In stained glass."); else yield say('shayan',"Is that... HIKARI-CHAN? In STAINED GLASS?! Who PAID for this?!");
  yield say('caotan',"Every senpai deserves a cathedral. This one's yours. As in, your grave. ♡",'happy'); }
// the fight stays inside the circle
(function(){ const cl=twClampXZ; twClampXZ=function(x,z,m){ const r=cl.apply(this,arguments), C=TWT.circle; if(!C) return r; const dx=r.x-C.x, dz=r.z-C.z, d=Math.hypot(dx,dz), R=C.r-(m||.8); if(d>R&&d>0){ r.x=C.x+dx/d*R; r.z=C.z+dz/d*R; } return r; };
  const uw=updateWorld; updateWorld=function(dt){ uw.apply(this,arguments); const C=TWT.circle; if(!C||!TW.fight) return; try{ for(const o of [Player].concat(TW.foes,TW.allies)){ if(!o||o.hidden) continue; const dx=o.x-C.x, dz=o.z-C.z, d=Math.hypot(dx,dz), R=C.r-.8; if(d>R){ o.x=C.x+dx/d*R; o.z=C.z+dz/d*R; } } }catch(e){ console.error('circle',e); } }; })();

// ---------- Bankai: Kuroyuri Gekkō ----------
function twIceTex(){ if(TWT.iceTex) return TWT.iceTex; const S=128, cv=document.createElement('canvas'); cv.width=cv.height=S; const c=cv.getContext('2d');
  try{ c.fillStyle='#bcd8ee'; c.fillRect(0,0,S,S); for(let i=0;i<70;i++){ c.fillStyle=['#c8e2f4','#aecde6','#d8ecfa','#a4c4e0'][i%4]; c.beginPath(); c.arc(twP5Rand(i)*S,twP5Rand(i+.3)*S,6+twP5Rand(i+.6)*18,0,7); c.fill(); }
    c.strokeStyle='rgba(255,255,255,.85)'; c.lineWidth=1.5; for(let i=0;i<7;i++){ let x=twP5Rand(i+9)*S, y=twP5Rand(i+19)*S; c.beginPath(); c.moveTo(x,y); for(let k=0;k<5;k++){ x+=(twP5Rand(i*5+k)-.5)*50; y+=(twP5Rand(i*7+k+3)-.5)*50; c.lineTo(x,y); } c.stroke(); }
    c.strokeStyle='rgba(90,130,170,.6)'; c.lineWidth=1; for(let i=0;i<5;i++){ let x=twP5Rand(i+29)*S, y=twP5Rand(i+39)*S; c.beginPath(); c.moveTo(x,y); for(let k=0;k<4;k++){ x+=(twP5Rand(i*3+k+50)-.5)*40; y+=(twP5Rand(i*9+k+60)-.5)*40; c.lineTo(x,y); } c.stroke(); } }catch(e){}
  const t=new THREE.CanvasTexture(cv); t.encoding=THREE.sRGBEncoding; t.magFilter=THREE.NearestFilter; return TWT.iceTex=t; }
function twBankaiPulse(cx,cz,dur){ const W=L.w||116, Dd=L.d||108, st=4, nx=Math.ceil(W/st), nz=Math.ceil(Dd/st), n=nx*nz, im=new THREE.InstancedMesh(new THREE.PlaneGeometry(st+.05,st+.05),new THREE.MeshLambertMaterial({map:twIceTex(),emissive:0x2a3a50,emissiveIntensity:.5}),n), o=new THREE.Object3D(), T=[];
  for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ const x=i*st+st/2, z=j*st+st/2, k=j*nx+i; T.push({x,z,d:Math.hypot(x-cx,z-cz)+rnd(-1.5,1.5),r:Math.floor(Math.random()*4)}); o.position.set(x,.015,z); o.rotation.set(-Math.PI/2,0,0); o.scale.set(0,0,0); o.updateMatrix(); im.setMatrixAt(k,o.matrix); }
  L.root.add(im); const fl=twTufts().filter(m=>m!==im), cols=[]; const c0=new THREE.Color(1,1,1), mtx=new THREE.Matrix4(), p=new THREE.Vector3();
  for(const m of fl){ const lily=m.material&&m.material.emissiveIntensity>0, ps=[]; for(let i=0;i<m.count;i++){ m.getMatrixAt(i,mtx); p.setFromMatrixPosition(mtx); ps.push([p.x,p.z]); m.setColorAt(i,c0); } m.instanceColor.needsUpdate=true; m.material.needsUpdate=true; cols.push({m,ps,lily,done:new Uint8Array(m.count),e0:m.material.emissiveIntensity}); }
  TWT.ice={im,cols}; const ring=new THREE.Mesh(new THREE.RingGeometry(.9,1,96),new THREE.MeshBasicMaterial({color:0xbfe8ff,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false})); ring.rotation.x=-Math.PI/2; ring.position.set(cx,.3,cz); L.root.add(ring);
  const black=new THREE.Color(.09,.05,.13), frost=new THREE.Color(.72,.82,.95), maxd=Math.hypot(Math.max(cx,W-cx),Math.max(cz,Dd-cz))+3, k={t:0};
  Game.fxUpd.push(dt=>{ try{ if(!im.parent){ ring.parent&&ring.parent.remove(ring); return false; } k.t+=dt; const R=maxd*Math.min(1,k.t/dur); ring.scale.set(R+.01,R+.01,1); ring.material.opacity=.8*(1-Math.min(1,k.t/dur));
      let ch=false; for(let i=0;i<T.length;i++){ const q=T[i]; if(q.on||q.d>R) continue; q.on=1; ch=true; o.position.set(q.x,.015,q.z); o.rotation.set(-Math.PI/2,0,q.r*Math.PI/2); o.scale.set(1,1,1); o.updateMatrix(); im.setMatrixAt(i,o.matrix);
        if(Math.random()<.25) FX.spawn(q.x,.3,q.z,0,rnd(.5,1.5),0,.6,0xe8f6ff,.3,0,true); } if(ch) im.instanceMatrix.needsUpdate=true;
      for(const C of cols){ let cc=false; for(let i=0;i<C.ps.length;i++){ if(C.done[i]) continue; const [x,z]=C.ps[i]; if(Math.hypot(x-cx,z-cz)>R) continue; C.done[i]=1; C.m.setColorAt(i,C.lily?black:frost); cc=true; } if(cc) C.m.instanceColor.needsUpdate=true; if(C.lily) C.m.material.emissiveIntensity=C.e0*(1-Math.min(1,k.t/dur)); }
      if(k.t>=dur+.1){ ring.parent&&ring.parent.remove(ring); return false; } return true; }catch(e){ console.error('bankai',e); return false; } });
  return im; }
function* twOmarBankai(T){ const P=Player;
  yield say('omar',"You want to see the Edge... at its sharpest?");
  twCamT(T,6.5,-1); T.scythe=1; T.cast=1; Sound.sfx('drone'); yield say('omar',"Ban... kai.",'angry');
  Sound.sfx('void'); Sound.sfx('crossboom'); shake(1); FX.flash=.7; grade.uniforms.flashCol.value.set(.75,.9,1); impactFrame([[2,2],[1,1]]); FX.burst(T.x,T.y+1.5,T.z,60,0xbfe8ff,8,.45); FX.burst(T.x,T.y+1.5,T.z,40,0x0a0410,6,.5,false);
  const A=twBounds(); cineSet((A.x0+A.x1)/2,40,T.z+36,(A.x0+A.x1)/2,0,T.z-6); twBankaiPulse(T.x,T.z,2.4); TWT.snow=true; yield wait(1.3);
  twZeldaCard('Bankai','Kuroyuri Gekkō','Black Lily Moonlight',2.6); yield* twZeldaPan(T,2.4); T.cast=0;
  grade.uniforms.tint.value.set(.94,.98,1.1); twCamT(T,7,1.2);
  if(ALI()) yield say('ali',"You froze the flowers. They did nothing to you."); else yield say('shayan',"Dude. You froze the FLOWERS. What did the flowers ever do to you?!");
  yield say('omar',"They bloomed. Without permission.",'angry'); }
// snow while the Bankai holds
(function(){ const uw=updateWorld; updateWorld=function(dt){ uw.apply(this,arguments); if(!TWT.snow||!TW.fight) return; try{ const P=Player; for(let i=0;i<3;i++) FX.spawn(P.x+rnd(-14,14),P.y+rnd(6,10),P.z+rnd(-10,6),rnd(-.4,.4),-rnd(1,2),rnd(-.4,.4),rnd(3,5),0xf0f8ff,.18,0,true); }catch(e){} }; })();

// ---------- the solo phase cards: Caotan = Persona 5, Omar = Zelda (with his bar extending once the phase starts) ----------
(function(){ const pc=twPhaseCine; twPhaseCine=function*(F,T){ yield* pc.apply(this,arguments); if(T&&T.who==='omar'&&T.hp>0&&TW.fight) T.zBar=performance.now(); }; })();

// ---------- drawing, and cleanup ----------
(function(){ const du=drawUI; drawUI=function(){ du(); try{ twDomFrame(); twP5Frame(); twZeldaFrame(); }catch(e){ console.error('title cards',e); TWT.p5=TWT.zc=TWT.dom=null; } }; })();
function twArenaRestore(){ TWT.circle=null; TWT.snow=false; const M=TWT.mural; if(M){ if(M.g.parent) M.g.parent.remove(M.g); M.hid.forEach(o=>o.visible=true); TWT.mural=null; }
  const I=TWT.ice; if(I){ if(I.im.parent) I.im.parent.remove(I.im); const w=new THREE.Color(1,1,1); for(const C of I.cols){ for(let i=0;i<C.ps.length;i++) C.m.setColorAt(i,w); if(C.m.instanceColor) C.m.instanceColor.needsUpdate=true; if(C.lily) C.m.material.emissiveIntensity=C.e0; } TWT.ice=null; } }
(function(){ const ef=twEndFight; twEndFight=function(){ try{ twArenaRestore(); }catch(e){} return ef.apply(this,arguments); };
  const cc=twClearCine; twClearCine=function(){ TWT.p5=TWT.zc=TWT.dom=null; return cc.apply(this,arguments); }; })();
