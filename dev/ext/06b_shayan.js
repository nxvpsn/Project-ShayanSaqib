// =====================================================================
// SHAYAN EXTRAS (on top of his atlas animations, which stay as they were for everything else)
// - three different swings for the 3-hit combo, no spinning: 1 a diagonal downward cut with a step, 2 a rising
//   upper-cut with a hop, 3 a leaping overhead slam. Their slash is the base game's arc (same shape and timing),
//   now textured like a Getsuga (white-hot rim, red body, black core) instead of white: one VFX, not two.
// - double jump: a front flip with a wind ring. Glide: floats cross-legged in meditation, with the pixie-dust trail.
// - Full Counter: crouch, double spin with afterimages, overhead slam; slow-mo and a giant crescent made of
//   Judgement Cut gashes (twGash). Hitboxes are the base game's (meleeHits / twCounterSlash), untouched.
// =====================================================================
function shBlit(c,fr,cx,by,dx,dy,rot,sc,alpha){ if(!fr) return; const bt=(SHA.meta.bottom[fr.row]||[])[fr.col], bottom=bt!=null?bt:61;
  c.save(); if(alpha!=null) c.globalAlpha=alpha; c.translate(Math.round(cx+dx),Math.round(by-1-bottom+32+dy)); if(rot) c.rotate(rot); if(sc&&sc!==1) c.scale(sc,sc);
  c.drawImage(SHA.img,fr.col*64,fr.row*64,64,64,-32,-32,64,64); const cap=shCap(fr); if(cap) c.drawImage(cap,-32,-35); c.restore(); }
// the airborne jump frames (3-5) have the top of his hair cut off by the atlas cell: rebuild a 3px dome above each cut segment from the top row's colours
const SH_CAP={};
function shCap(fr){ const M=SHA.meta; if(!(fr.row>=M.jump&&fr.row<M.jump+8&&fr.col>=3&&fr.col<=5)) return null; const key=fr.row+'_'+fr.col; if(key in SH_CAP) return SH_CAP[key]; SH_CAP[key]=null;
  try{ const cv=document.createElement('canvas'); cv.width=64; cv.height=4; const x=cv.getContext('2d'); x.drawImage(SHA.img,fr.col*64,fr.row*64,64,1,0,3,64,1);
    const im=x.getImageData(0,0,64,4), d=im.data, on=i=>d[(3*64+i)*4+3]>0; let any=false;
    for(let i=0;i<64;){ if(!on(i)){ i++; continue; } let j=i; while(j<64&&on(j)) j++; const n=j-i, mid=(i+j-1)/2, half=n/2+.5, K=Math.min(3,n/4);
      for(let q=i;q<j;q++){ const t=(q-mid)/half, h=Math.round(K*Math.sqrt(Math.max(0,1-t*t))); for(let y=3-h;y<3;y++){ for(let k=0;k<4;k++) d[(y*64+q)*4+k]=d[(3*64+q)*4+k]; any=true; } }
      i=j; }
    if(any){ x.putImageData(im,0,0); SH_CAP[key]=cv; } }catch(e){}
  return SH_CAP[key]; }
// meditation: his front-facing upper body from the atlas over hand-drawn crossed legs
function shMeditate(c,cx,by,t){ const fl=Math.round(Math.sin(t*2.4)*1.5)+4, yw=by-1-12-fl, fr=shFrame('rot',0,0);
  const J='#2c3a68', JS='#1e2848', JH='#40548c', SH='#e8e8ee', SS='#a8a8b8';
  ell(c,cx,yw+6,14,5,JS); ell(c,cx,yw+5,13,4,J); R(c,cx-12,yw+3,7,2,JH); R(c,cx+5,yw+3,7,2,JH); R(c,cx-1,yw+2,2,6,JS);
  R(c,cx-7,yw+7,6,3,SH); R(c,cx-7,yw+9,6,1,SS); R(c,cx+2,yw+6,6,3,SH); R(c,cx+2,yw+8,6,1,SS);
  if(fr) c.drawImage(SHA.img,fr.col*64,fr.row*64,64,46,cx-32,yw-45,64,46);
  // a soft halo of calm
  c.globalAlpha=.35+.15*Math.sin(t*3); R(c,cx-15,yw+12,30,1,'#fff6c8'); c.globalAlpha=1; }
(function(){ const SH_DRAW=drawShayanHD;
  drawShayanHD=function(c,cx,by,f,s){ s=s||{}; const P=Player, isP=!!P&&s.t===P.t&&s.anim===P.anim&&!ALI();
    if(!SHA.ok||!SHA.img||!isP||Game.state==='dead'||Game.paulLock) return SH_DRAW(c,cx,by,f,s);
    try{ const a=s.anim||'idle', t=s.t||0; let dir=f>0?2:6;
      if(Game.state==='play'&&!P.cineFly&&!P.scripted){ const ang=P.ang||0, cs=Math.cos(ang); if(!(Math.abs(cs)>.3&&Math.sign(cs)!==Math.sign(f||1))) dir=shDirIdx(ang); }
      const A=P.atk, side=f>0?1:-1;
      if(P.fcT>0){ const k=1-P.fcT/SH_FC_T;
        if(k<.22) shBlit(c,shFrame('swing',dir,1),cx,by,-side*1,3,0,1);
        else if(k<.6){ const q=(k-.22)/.38, n=Math.floor(q*16); for(let g=2;g>=1;g--) shBlit(c,shFrame('rot',((dir-n+g)%8+8)%8,0),cx,by,0,-6*Math.sin(q*Math.PI)+g,0,1,.28/g);
          shBlit(c,shFrame('rot',((dir-n)%8+8)%8,0),cx,by,0,-6*Math.sin(q*Math.PI),0,1); }
        else { const q=(k-.6)/.4; shBlit(c,shFrame('swing',dir,Math.min(6,3+Math.floor(q*4))),cx,by,side*Math.round(3*Math.min(1,q*2)),0,0,1.06); }
        SHA.drawn=true; return; }
      if(a==='attack'&&A&&!A.big){ const u=Math.min(1,A.t/.24);
        if(A.n===1){ // rising upper-cut: low to high, with a hop and a lean back
          shBlit(c,shFrame('swing',dir,Math.max(0,6-Math.floor(u*7))),cx,by,side*Math.round(u*2),-Math.round(5*Math.sin(u*Math.PI)),-side*.12*Math.sin(u*Math.PI),1); }
        else if(A.n===2){ // leaping overhead slam
          if(u<.35) shBlit(c,shFrame('swing',dir,0),cx,by,side*Math.round(u*4),-Math.round(9*Math.sin(u/.35*Math.PI/2)),-side*.05,1);
          else { const q=(u-.35)/.65; shBlit(c,shFrame('swing',dir,Math.min(6,2+Math.floor(q*5))),cx,by,side*Math.round(2+q*2),-Math.round(9*Math.max(0,1-q*2.5)),side*.06*Math.max(0,1-q*3),1); } }
        else shBlit(c,shFrame('swing',dir,Math.min(6,1+Math.floor(u*6))),cx,by,side*Math.round(u*3),0,0,1); // diagonal downward cut
        SHA.drawn=true; return; }
      if(P.djT>0&&(a==='jump'||a==='fall')){ const k=1-P.djT/SH_DJ_T; shBlit(c,shFrame('jump',dir,k<.85?3:5),cx,by,0,-10,side*k*Math.PI*2,1); SHA.drawn=true; return; }
      if(a==='glide'){ shMeditate(c,cx,by,t); SHA.drawn=true; return; }
      if((a==='jump'||a==='fall')&&!((P.fbPose||0)>0)){ shBlit(c,shFrame('jump',dir,a==='jump'?4:5),cx,by,0,0,0,1); SHA.drawn=true; return; }
    }catch(e){}
    return SH_DRAW(c,cx,by,f,s); }; })();
const SH_FC_T=.5, SH_DJ_T=.42;
// timers: double jump flip, Full Counter, pixie dust
(function(){ const up=updatePlayer; updatePlayer=function(dt){ const P=Player, j0=P.jumps, g0=P.onGround; const r=up.apply(this,arguments);
    if(!ALI()){ if(j0>0&&P.jumps===0&&!P.onGround&&!g0&&P.vy>0){ P.djT=SH_DJ_T; FX.ring(P.x,P.y-.1,P.z,'#cfe9ff',1.6,.35); for(let i=0;i<14;i++){ const a=i/14*6.283; FX.spawn(P.x+Math.cos(a)*.4,P.y,P.z+Math.sin(a)*.4,Math.cos(a)*4,-.5,Math.sin(a)*4,.3,i%2?0xffffff:0x9fd8ff,.2,0,true,3); } }
      if(P.djT>0) P.djT=P.onGround?0:P.djT-dt;
      if(P.fcT>0) P.fcT-=dt;
      if(P.anim==='glide'&&Game.state==='play'){ for(let i=0;i<2;i++) FX.spawn(P.x+rnd(-.5,.5),P.y+rnd(.2,1.1),P.z+rnd(-.3,.3),rnd(-.3,.3),rnd(-.6,.1),rnd(-.3,.3),rnd(.5,1),i?0xffe680:0xfff6c8,rnd(.08,.16),2.5,true,1.5);
        if(Math.random()<.15) FX.spawn(P.x,P.y+1,P.z,rnd(-1,1),rnd(.5,1.5),rnd(-1,1),.6,0xffffff,.2,-1,true); } }
    return r; }; })();

// ---------- the basic slash: an animated black blade-swipe with a thin red rim ----------
// A shader sweeps a smear along the arc: a crisp blade edge with a thin red rim, then black speed-line streaks of uneven length and a frayed inner edge that fade behind it.
const SH_SL={TH:2.3,ROUT:1.95,TAIL:.95};
const SH_SL_VS="varying vec2 vP; void main(){ vP=position.xy; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }";
const SH_SL_FS=`uniform float uHead,uDir,uA,uW; varying vec2 vP;
const float TH=${SH_SL.TH.toFixed(3)}, ROUT=${SH_SL.ROUT.toFixed(3)}, TAIL=${SH_SL.TAIL.toFixed(3)};
float h1(float x){ return fract(sin(x*127.1)*43758.5453); }
float vn(float x){ float i=floor(x), f=x-i, u=f*f*(3.-2.*f); return mix(h1(i),h1(i+1.),u); }
void main(){ float r=length(vP), a=atan(vP.y,vP.x), s=(a+TH*.5)/TH; if(uDir<0.) s=1.-s;
  float d=uHead-s; if(d<0.||d>TAIL) discard; float kk=d/TAIL;
  float tw=uW*sin(3.14159*pow(kk,.45))*smoothstep(0.,.15,s)*(1.-smoothstep(.85,1.,s));
  vec3 red=vec3(1.,.06+.25*pow(1.-kk,4.),.12);
  if(r>ROUT){ float g=(r-ROUT)/.08; if(g>1.) discard; gl_FragColor=vec4(red,.35*(1.-g)*(1.-kk)*uA*smoothstep(0.,.05,tw)); return; }
  float fo=ROUT-r; if(tw<.001) discard; float q=fo/tw, n1=vn(r*26.), n2=vn(r*57.+3.7);
  float L=fo>.05?TAIL*(.5+.5*n1)*(1.-.35*smoothstep(.3,1.,q)):TAIL, k=d/L; if(k>1.) discard;
  float al=uA*pow(1.-pow(k,1.6),1.1);
  al*=1.-smoothstep(.6,1.05,q+.35*(n2-.5));
  al*=1.-(.55-.55*n2)*smoothstep(.15,.7,q);
  al*=smoothstep(0.,.01,fo); if(al<.003) discard;
  vec3 col=mix(red,vec3(.02,0.,.01),smoothstep(.02,.06,fo));
  col=mix(col,vec3(.45,0.,.04),smoothstep(.55,1.,q)*.55);
  gl_FragColor=vec4(col,al); }`;
function shArc(x,y,z,ang,n){ const th=SH_SL.TH, P=Player, ig=P.ignite>0, dir=n===1?-1:1;
  const mat=new THREE.ShaderMaterial({uniforms:{uHead:{value:0},uDir:{value:dir},uA:{value:1},uW:{value:[.8,.7,.92][n]||.8}},vertexShader:SH_SL_VS,fragmentShader:SH_SL_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});
  const m=new THREE.Mesh(new THREE.RingGeometry(1.0,2.08,48,1,-th/2,th),mat);
  m.rotation.x=-Math.PI/2+(n===1?.25:n===2?-.25:0); m.rotation.z=-ang; m.position.set(x,y+.9,z); scene.add(m); const k={t:0}, T=.24, v=new THREE.Vector3();
  Game.fxUpd.push(dt=>{ k.t+=dt; const p=Math.min(1,k.t/T), h=(1+SH_SL.TAIL)*(1-(1-p)*(1-p)); mat.uniforms.uHead.value=h; mat.uniforms.uA.value=1-Math.max(0,(p-.8)/.2); m.scale.setScalar(1+p*.08);
    // ignited (after a full fireball): flames pour off the blade's leading edge as it sweeps
    if(ig&&h<1.05){ const sa=-th/2+(dir>0?Math.min(1,h):1-Math.min(1,h))*th; m.updateMatrixWorld();
      for(let i=0;i<4;i++){ const rr=rnd(1.3,2.0); v.set(Math.cos(sa)*rr,Math.sin(sa)*rr,0); m.localToWorld(v);
        FX.spawn(v.x,v.y+rnd(-.1,.2),v.z,rnd(-.8,.8),rnd(1.5,4),rnd(-.8,.8),rnd(.3,.55),[0xff2a10,0xff7a1a,0xffc040,0xffffff][i],rnd(.2,.4),-3,true,2); } }
    if(p>=1){ scene.remove(m); m.geometry.dispose(); mat.dispose(); return false; } return true; }); }
(function(){ const sa=startAtk; startAtk=function(n){ if(ALI()||Game.paulLock) return sa.apply(this,arguments);
    const fa=FX.arc; FX.arc=function(x,y,z,ang,nn,big){ if(big) return fa.apply(FX,arguments); shArc(x,y,z,ang,nn); };
    try{ return sa.apply(this,arguments); } finally{ FX.arc=fa; } }; })();

// ---------- Full Counter: the animation and the big show (the hit: a 7-unit sphere around Shayan, patched in build.py) ----------
// the hit: a 7-unit sphere around him (build.py) plus a second 6-unit sphere centred 6 ahead, where the crescent flies (reach 12 in front)
let SH_FC_FRONT=0;
(function(){ const mh=meleeHits; meleeHits=function(x,z,y,rad,ang,arc,dmg,set){ const r=mh.apply(this,arguments); const A=Player.atk;
    if(SH_FC_FRONT||!A||!A.big||rad<7) return r; SH_FC_FRONT=1; let r2=false; try{ r2=meleeHits(x+Math.cos(ang)*6,z+Math.sin(ang)*6,y,6,ang,Math.PI,dmg,set); } finally{ SH_FC_FRONT=0; } return r||r2; }; })();
(function(){ const cs=twCounterSlash; twCounterSlash=function(){ const r=cs.apply(this,arguments); const P=Player; P.fcT=SH_FC_T; shFullCounterFX(); return r; }; })();
function shFullCounterFX(){ const P=Player, x=P.x, z=P.z, gy=P.y, ang=P.ang, ux=Math.cos(ang), uz=Math.sin(ang);
  Game.slowT=Math.max(Game.slowT||0,.22); FX.flash=Math.max(FX.flash,.45); grade.uniforms.flashCol.value.set(1,.35,.45); impactFrame([[3,1],[2,1],[1,1],[3,1]]); shake(.9);
  if(typeof twBig==='function') twBig('FULL COUNTER',{size:66,col:'#ff8aa0',y:UH*.24,dur:1.1});
  const at=(dt0,fn)=>{ let k=0; Game.fxUpd.push(dt=>{ k+=dt; if(k>=dt0){ fn(); return false; } return true; }); };
  // the slam: the Full Counter's crescent, torn into the screen like Judgement Cut (tall + ground sweep)
  at(.16,()=>{ JC.flash=Math.max(JC.flash||0,.55);
    // centred ahead of him with a narrower sweep, so the tear (and its distortion) stays out in front of the swing, never over Shayan
    twGash({life:.75,rev:.09,fade:.35,w:46,sparks:60,pts:()=>twArcPts(x+ux*1.7,gy+1.5,z+uz*1.7,ux,uz,4.2,-1.1,1.1,9)});
    twGash({life:.7,rev:.11,fade:.35,w:30,sparks:40,pts:()=>twArcPts(x+ux*1.5,gy+.9,z+uz*1.5,ux,uz,5,-1.2,1.2,9,true)});
    FX.hitstop=Math.max(FX.hitstop,.1); shake(1.2); Sound.sfx('crossboom'); }); }

// ---------- Getsuga projectiles: one crescent, not two crossed planes. A single camera-facing plane, turned to the travel direction on screen ----------
(function(){ const fb=fireBeam; fireBeam=function(){ const n0=BEAMS.length, r=fb.apply(this,arguments), b=BEAMS[BEAMS.length-1]; if(b&&BEAMS.length>n0&&b.g&&b.g.children.length>=2){
      const g=b.g, mA=g.children[0], mB=g.children[1]; g.rotation.set(0,0,0); mB.visible=false; const sx=b.dx, sy=-b.dz*.62; mA.rotation.set(TILT,0,Math.atan2(sy,sx)); }
    return r; }; })();
// ---------- parry i-frames don't blink (the i-frames stay) ----------
(function(){ const ph=playerHit; playerHit=function(){ const r=ph.apply(this,arguments); if(r==='parry') Player.parryIF=1; return r; };
  const up=updatePlayer; updatePlayer=function(dt){ const r=up.apply(this,arguments), P=Player; if(P.parryIF){ if(P.inv>0&&P.hurt<=0) P.noBlink=Game.time+.1; else P.parryIF=0; } return r; }; })();
