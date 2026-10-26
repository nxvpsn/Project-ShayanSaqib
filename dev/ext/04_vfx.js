// =====================================================================
// VFX REWORK
// - Getsuga crescent (CRESC, used by Shayan's, Ali's and Omar's Getsugas and the cut flashes): a true crescent whose
//   two arcs meet in sharp tips (the old one closed with a straight chord and read as a bow). Same colours: hot pink-white
//   rim, red body, black core, red glow; plus flame wisps along the edge and streaks in the core, flickering over 4 frames.
// - Getsuga projectiles leave an ember trail in their own colour.
// Shapes are computed per pixel, so the hitboxes and mesh sizes are untouched.
// =====================================================================
function twCrescFrame(cv,fr){ const S=cv.width, c=cv.getContext('2d'); c.clearRect(0,0,S,S); const id=c.getImageData(0,0,S,S), d=id.data; if(!d||d.length!==S*S*4) return false;
  const ax=S*.38, ay=S/2, R=S*.41, th=1.22, tm=S*.15; // outer circle, tip angle, thickness at the middle
  const d0=(R*R-(R-tm)*(R-tm))/(2*((R-tm)-R*Math.cos(th))), r=R-tm+d0, bx=ax-d0, G=S*.075;
  const n1=(a,k)=>Math.sin(a*k+fr*1.7)*.5+Math.sin(a*k*2.3-fr*2.9+1)*.3+Math.sin(a*k*5.1+fr*.8)*.2;
  for(let y=0;y<S;y++) for(let x=0;x<S;x++){ const dx=x+.5-ax, dy=y+.5-ay, d1=Math.hypot(dx,dy), d2=Math.hypot(x+.5-bx,dy), a=Math.atan2(dy,dx);
    const inArc=Math.abs(a)<th+.02, out=R-d1, inn=d2-r; let col=null, al=0;
    if(out>=0&&inn>=0&&dx>-S*.02){ const f=out/(out+inn+.001), st=n1(a,26)>.55?1:0;
      if(f<.07) col=[255,240,246]; else if(f<.2) col=[255,Math.round(42+60*(1-(f-.07)/.13)),74];
      else { const k=Math.min(1,(f-.2)/.8), q=1-k; col=[Math.round(5+q*q*110+(st?40:0)),Math.round(0+q*q*10),Math.round(10+q*q*28+(st?12:0))]; }
      al=1; }
    else { // glow + flame wisps hugging the outer edge; past the tips it falls off around the tip points
      const tx=ax+Math.cos(th)*R, ty1=ay-Math.sin(th)*R, ty2=ay+Math.sin(th)*R, tipD=Math.min(Math.hypot(x+.5-tx,y+.5-ty1),Math.hypot(x+.5-tx,y+.5-ty2));
      const ed=inArc?(out<0?-out:Math.max(0,-inn)*1.4):tipD, wisp=inArc&&out<0?Math.max(0,n1(a,9))*G*1.3*(1-Math.abs(a)/(th+.3)):0, gl=G*(inArc?1:.6)+wisp;
      if(ed<gl){ const k=1-ed/gl; al=k*k*(out<0||!inArc?.95:.5); col=out<0&&inArc&&ed<2.2?[255,200,214]:[255,40,70]; } }
    if(col&&al>0){ const i=(y*S+x)*4; d[i]=col[0]; d[i+1]=col[1]; d[i+2]=col[2]; d[i+3]=Math.round(al*255); } }
  // embers flying off the back of the arc
  for(let i=0;i<14;i++){ const a=-th+hash(i,fr+3)*th*2, rr=R+4+hash(fr,i)*G*1.6, x=Math.round(ax+Math.cos(a)*rr), y=Math.round(ay+Math.sin(a)*rr); if(x<1||y<1||x>=S-2||y>=S-2) continue;
    for(const [ox,oy] of [[0,0],[1,0],[0,1],[1,1]]){ const j=((y+oy)*S+x+ox)*4; d[j]=255; d[j+1]=hash(i,fr)>.5?220:120; d[j+2]=hash(i,fr)>.5?230:130; d[j+3]=230; } }
  c.putImageData(id,0,0); }
const TW_CRESC={frames:[],i:0,n:0};
(function(){ try{ const S=CRESC.image&&CRESC.image.width||256; for(let k=0;k<4;k++){ const cv=document.createElement('canvas'); cv.width=cv.height=S; if(twCrescFrame(cv,k)===false) return; TW_CRESC.frames.push(cv); }
    const ctx=CRESC.image.getContext('2d'); ctx.clearRect(0,0,S,S); ctx.drawImage(TW_CRESC.frames[0],0,0); CRESC.needsUpdate=true; }catch(e){} })();
function twCrescTick(){ if(TW_CRESC.frames.length<4||++TW_CRESC.n%4) return; try{ TW_CRESC.i=(TW_CRESC.i+1)%4; const cv=CRESC.image, ctx=cv.getContext('2d'); ctx.clearRect(0,0,cv.width,cv.height); ctx.drawImage(TW_CRESC.frames[TW_CRESC.i],0,0); CRESC.needsUpdate=true; }catch(e){} }
(function(){ const ds=drawSprites; drawSprites=function(){ twCrescTick(); return ds.apply(this,arguments); }; })();
// ember trails behind Getsugas (Shayan's red, Ali's black/gold)
(function(){ const ub=updateBeams; updateBeams=function(dt){ ub(dt); for(const b of BEAMS){ if(b.life<=0) continue; const n=b.big?3:2, col=b.gold?0xffc838:b.ali?0xff1a2a:0xff2a4a;
      for(let i=0;i<n;i++){ const s=rnd(-1,1)*(b.big?1.5:1), px=-b.dz, pz=b.dx; FX.spawn(b.x-b.dx*rnd(.2,1)+px*s,b.y+rnd(-.9,.9)*(b.big?1.4:1),b.z-b.dz*rnd(.2,1)+pz*s,-b.dx*2+rnd(-.5,.5),rnd(-.3,.8),-b.dz*2+rnd(-.5,.5),rnd(.25,.45),i%2?col:0xffe8ee,b.big?.3:.22,-1,true,2); } } }; })();

// ---------- boss lasers (twBeam: Caotan's blue / pink, Omar's and the orb lasers): same hitbox, tells and coverage ----------
// adds a soft outer haze, a flowing energy sheath, a white-hot thread, flares at both ends and spiralling sparks
let TW_FLOWTEX=null;
function twFlowTex(){ if(TW_FLOWTEX) return TW_FLOWTEX; const cv=document.createElement('canvas'); cv.width=16; cv.height=64; const c=cv.getContext('2d');
  for(let y=0;y<64;y++){ const v=.35+.65*Math.pow(Math.max(0,Math.sin(y/64*Math.PI*4)),3)+.15*Math.sin(y*1.7); for(let x=0;x<16;x++){ const k=Math.max(0,Math.min(1,v*(.75+.25*Math.sin(x/16*Math.PI*2+y*.3)))); c.fillStyle=`rgba(255,255,255,${k.toFixed(3)})`; c.fillRect(x,y,1,1); } }
  const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; TW_FLOWTEX=t; return t; }
function twBeamExtra(o){ const out=[];
  const haze=beamMesh(o.col,.55*o.w); haze.material.opacity=.22; haze.userData.haze=1; out.push(haze);
  const sheath=beamMesh(o.col,.4*o.w); sheath.material.map=twFlowTex().clone(); sheath.material.map.needsUpdate=true; sheath.material.opacity=.75; sheath.material.needsUpdate=true; sheath.userData.flow=1; out.push(sheath);
  const hot=beamMesh(0xffffff,.05*o.w); out.push(hot);
  for(const end of [0,1]){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:o.col,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); s.userData.flare=end; scene.add(s); out.push(s);
    const s2=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xffffff,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); s2.userData.flare=end+2; scene.add(s2); out.push(s2); }
  return out; }
function twBeamFlare(m,x,y,z,a,o,k,tt){ const end=m.userData.flare%2, core=m.userData.flare>=2, L=end?o.len:0, px=x+Math.cos(a)*L, pz=z+Math.sin(a)*L;
  m.position.set(px,y,pz); const s=Math.max(.01,k*o.w*(core?1.1:2.6)*(end?.8:1.2)*(1+Math.sin(tt*37+end*2)*.15)); m.scale.set(s,s,1); }
function twBeamSparks(x,y,z,a,o,tt){ const ux=Math.cos(a), uz=Math.sin(a), px=-uz, pz=ux, r=.32*o.w;
  for(let i=0;i<2;i++){ const al=rnd(0,o.len), ph=al*2.2-tt*18+i*Math.PI, cs=Math.cos(ph)*r, sn=Math.sin(ph)*r;
    FX.spawn(x+ux*al+px*cs,y+sn,z+uz*al+pz*cs,ux*rnd(2,6),0,uz*rnd(2,6),.22,i?o.col:0xffffff,.22,0,true,4); }
  if(Math.random()<.5) FX.spawn(x+ux*o.len,y,z+uz*o.len,rnd(-3,3),rnd(0,4),rnd(-3,3),.3,o.col,.3,8,true); }

// ---------- Judgement Cut gashes in any shape ----------
// The JC slash post-shader only draws straight tears. twGash chains short, overlapping tears along a screen-space
// polyline (recomputed each frame, so it follows the world), widest in the middle and sharp at both ends:
// the Full Counter crescent and Ali's Getsuga Jujishou use it. o: {pts:()=>[[x,y],...], w:px, life, rev, fade, alive}
const TW_GASH=[];
function twGash(o){ o.t=0; o.sd=Math.random(); o.sparked=0; TW_GASH.push(o); return o; }
function twGashSparks(P,n){ JC.sp=JC.sp||[]; for(let i=0;i<n;i++){ const j=Math.floor(Math.random()*(P.length-1)), a=P[j], b=P[j+1], u=Math.random(), dx=b[0]-a[0], dy=b[1]-a[1], d=Math.hypot(dx,dy)||1, s=(Math.random()<.5?-1:1)*rnd(60,260);
    JC.sp.push({x:a[0]+dx*u,y:a[1]+dy*u,vx:-dy/d*s+dx/d*rnd(-90,90),vy:dx/d*s+rnd(-40,40),t:0,l:rnd(.25,.55)}); } }
(function(){ const us=updateSlashPass; updateSlashPass=function(dt){ us(dt); if(!TW_GASH.length) return; const U=slashPass.uniforms; let n=U.n.value;
    for(let i=TW_GASH.length-1;i>=0;i--){ const g=TW_GASH[i]; g.t+=dt; if(g.t>=g.life||(g.alive&&!g.alive())) TW_GASH.splice(i,1); }
    for(const g of TW_GASH){ let P; try{ P=g.pts(); }catch(e){ P=null; } if(!P||P.length<2) continue; const N=P.length-1, prog=Math.min(1,g.t/(g.rev||.08)), op=Math.max(0,Math.min(1,(g.life-g.t)/(g.fade||.25)))*(g.op||1);
      if(!g.sparked&&prog>=1){ g.sparked=1; twGashSparks(P,g.sparks||24); }
      for(let j=0;j<N&&n<SLASH_N;j++){ const a=P[j], b=P[j+1], ex0=j>0?.5:0, ex1=j<N-1?.5:0, dx=b[0]-a[0], dy=b[1]-a[1];
        const x0=a[0]-dx*ex0, y0=a[1]-dy*ex0, x1=b[0]+dx*ex1, y1=b[1]+dy*ex1, W=g.w*Math.pow(Math.sin(Math.PI*(j+.5)/N),g.taper==null?.8:g.taper), k=Math.max(0,Math.min(1,prog*N-j));
        if(k<=0) continue; U.L.value[n].set(x0/UW,1-y0/UH,x1/UW,1-y1/UH); U.Q.value[n].set(W/UH*.85,k,op,(g.sd+j*.137)%1); n++; } }
    U.n.value=n; slashPass.enabled=n>0; }; })();
// world-space arc -> screen polyline (center c, unit dir u for 'forward', up = screen up via world y)
function twArcPts(cx,cy,cz,ux,uz,R,a0,a1,N,flatY){ const P=[]; for(let i=0;i<=N;i++){ const a=lerp(a0,a1,i/N), f=Math.cos(a)*R, s=Math.sin(a)*R;
    const x=cx+ux*f+(flatY?-uz*s:0), y=cy+(flatY?0:s), z=cz+uz*f+(flatY?ux*s:0), q=toScreen(x,y,z); if(q[2]>=1) return null; P.push([q[0],q[1]]); } return P; }
// Getsuga clash distortion (Full Counter style): two Judgement Cut tears crossing where the crescents grind (cx() follows the
// contact point; they last while alive() holds), and twClashRip: one big crescent tear ripping the winner's way
function twClashTear(cx,y,z,alive,s){ s=s||1; for(const d of [1,-1]) twGash({life:8,rev:.08,fade:.25,w:28*s,op:.85,sparks:30,alive,pts:()=>twArcPts(cx()-d*2.6*s,y,z,d,0,2.8*s,-.95,.95,7)}); JC.flash=Math.max(JC.flash||0,.25); }
function twClashRip(x,y,z,dir,s){ s=s||1; twGash({life:.8,rev:.08,fade:.35,w:46*s,sparks:60,pts:()=>twArcPts(x-dir*1.5,y,z,dir,0,4.2*s,-1.1,1.1,9)}); JC.flash=Math.max(JC.flash||0,.4); }
// Getsuga Jujishou: the gold crescent + black lightning become a travelling Judgement Cut crescent
(function(){ const fb=fireBeam; fireBeam=function(big,quiet,o){ const n0=BEAMS.length; const r=fb.apply(this,arguments); const b=BEAMS[BEAMS.length-1];
    if(o&&o.ali&&big&&b&&BEAMS.length>n0){ b.g.visible=false; if(b.bolt) b.bolt.visible=false; b.jj=1;
      twGash({life:b.life+.05,rev:.06,fade:.12,w:30,sparks:40,alive:()=>BEAMS.includes(b)&&b.life>0,pts:()=>twArcPts(b.x-b.dx*1.2,b.y,b.z-b.dz*1.2,b.dx,b.dz,3.2,-1.25,1.25,7)});
      twGash({life:b.life+.05,rev:.06,fade:.12,w:16,op:.8,sparks:20,alive:()=>BEAMS.includes(b)&&b.life>0,pts:()=>twArcPts(b.x-b.dx*1.2,b.y,b.z-b.dz*1.2,b.dx,b.dz,3.2,-1.25,1.25,6,true)});
      JC.flash=Math.max(JC.flash||0,.25); }
    return r; }; })();
// the Judgement Cut ×100 counter (and any gashes) don't follow you into another part of the story
function twClearCutFX(){ Game.moonCut=null; TW_GASH.length=0; JC.lines=[]; JC.sp=[]; JC.flash=0; }
(function(){ for(const n of ['twWarpReset','toTitle','newGame']){ const f=globalThis[n]; if(typeof f!=='function') continue; globalThis[n]=function(){ twClearCutFX(); return f.apply(this,arguments); }; } })();

// ---------- skinned ground blasts: twBlast(..., {skin:'goop'|'frosting'|'crater'}) ----------
// Same timing, radius and hit test as twBlast; the plain marker circle becomes a decal that swells during the warning
// and erupts on the hit (goop: Omar's purple puddles with a sad face; frosting: Hamza's pink cake splats; crater: cracked earth)
const TW_SKINS={};
function twSkinTex(kind,v){ const key=kind+v; if(TW_SKINS[key]) return TW_SKINS[key]; const S=64, cv=document.createElement('canvas'); cv.width=cv.height=S; const c=cv.getContext('2d');
  const pal=kind==='goop'?['#1a0626','#4a1a7a','#7a3ac0','#c08aff']:kind==='frosting'?['#a8406a','#f08ab0','#ffc0d8','#ffffff']:['#2a1a12','#5a3a24','#8a6a44','#ffb050'];
  try{ const blob=(r,col,j)=>{ c.fillStyle=col; for(let y=-S/2;y<S/2;y++) for(let x=-S/2;x<S/2;x++){ const a=Math.atan2(y,x), d=Math.hypot(x,y), rr=r*(1+.13*Math.sin(a*5+v*1.7+j)+.07*Math.sin(a*11+v*3.1)); if(d<rr) c.fillRect(x+S/2,y+S/2,1,1); } };
    blob(30,pal[0],0); blob(27,pal[1],.4); blob(21,pal[2],1.1); c.fillStyle=pal[3]; c.fillRect(16,18,6,2); c.fillRect(14,20,3,2); c.fillRect(40,40,3,2);
    if(kind==='goop'){ c.fillStyle='#120418'; c.fillRect(22,24,5,6); c.fillRect(37,24,5,6); c.fillStyle='#e8d8ff'; c.fillRect(23,25,2,2); c.fillRect(38,25,2,2); // sad eyes + frown + a tear
      c.fillStyle='#120418'; c.fillRect(25,40,14,2); c.fillRect(23,42,3,2); c.fillRect(38,42,3,2); c.fillStyle='#9ad8ff'; c.fillRect(24,31,2,4); c.fillRect(24,35,1,1); }
    if(kind==='frosting'){ c.fillStyle='#ff4a7a'; for(let i=0;i<9;i++) c.fillRect(Math.round(32+Math.cos(i*.7+v)*16),Math.round(32+Math.sin(i*1.3+v)*14),2,1); c.fillStyle='#fff6a0'; for(let i=0;i<7;i++) c.fillRect(Math.round(32+Math.cos(i*2.1)*10),Math.round(32+Math.sin(i*1.9)*9),1,2); }
    if(kind==='crater'){ c.strokeStyle='#ffb050'; c.lineWidth=1; for(let i=0;i<7;i++){ const a=i/7*6.283+v; c.beginPath(); c.moveTo(32,32); c.lineTo(32+Math.cos(a)*14,32+Math.sin(a)*14); c.lineTo(32+Math.cos(a+.3)*26,32+Math.sin(a+.3)*26); c.stroke(); } } }catch(e){}
  const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.encoding=THREE.sRGBEncoding; TW_SKINS[key]=t; return t; }
function twDecal(x,z,r,kind){ const m=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:twSkinTex(kind,Math.floor(Math.random()*3)),transparent:true,depthWrite:false,alphaTest:.05}));
  m.rotation.x=-Math.PI/2; m.rotation.z=rnd(0,6.28); m.position.set(x,groundY(x,z)+.05,z); m.scale.setScalar(.01); m.userData.tw=1; scene.add(m); return m; }
(function(){ const tb=twBlast; twBlast=function(x,z,r,delay,o){ if(!o||!o.skin) return tb.apply(this,arguments); const kind=o.skin, col=o.col||0xff3a6a, dec=twDecal(x,z,r,kind);
    const pc=kind==='goop'?[0x7a3ac0,0x2a0a3a,0xc08aff]:kind==='frosting'?[0xff8ab0,0xffffff,0xffc0d8]:[0x8a6a44,0x3a2a1a,0xffb050];
    return twHz({upd(dt,play){ if(play) this.t+=dt; const gy=groundY(x,z);
        if(this.t<delay){ const k=Math.min(1,this.t/Math.max(.05,delay)); dec.scale.setScalar(Math.max(.01,r*(.35+.65*k)*(1+Math.sin(this.t*30)*.03*k))); dec.material.opacity=.55+.45*k;
          if(play&&Math.random()<.35) FX.spawn(x+rnd(-r,r)*.7,gy+.1,z+rnd(-r,r)*.7,0,rnd(.5,1.5),0,.4,pc[0],.18,-1,kind!=='goop'); return true; }
        if(!this.boomed){ this.boomed=1; this.bt=0; dec.scale.setScalar(r*1.15);
          for(let i=0;i<(o.n||26);i++){ const a=Math.random()*6.283, s=rnd(2,6); FX.spawn(x+Math.cos(a)*r*.5,gy+.2,z+Math.sin(a)*r*.5,Math.cos(a)*s*.6,rnd(4,9),Math.sin(a)*s*.6,rnd(.4,.8),pc[i%3],rnd(.2,.34),16,kind==='frosting',.5); }
          FX.ring(x,gy,z,o.ring||'#ffb0d0',r*1.3,.3);
          if(!o.quiet){ Sound.sfx(o.sfx||(kind==='goop'?'squelch':'slam')); shake(o.shake||.18); }
          if(o.onBoom) o.onBoom(x,z); if(play) twAllyAoE(x,z,r,o.allyDmg||o.dmg||2); if(play&&twInR(x,z,r,o.h||2.2)){ const res=twHitP(o.dmg||2,x,z,{ub:o.ub!==false}); if(o.onHit&&res==='hit') o.onHit(); } }
        this.bt+=dt; dec.material.opacity=Math.max(0,1-this.bt/.7); return this.bt<.7; },
      kill(){ scene.remove(dec); dec.geometry.dispose(); dec.material.dispose(); }}); }; })();
