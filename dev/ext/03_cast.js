// =====================================================================
// CAST OVERHAUL: every character except Shayan is redrawn as shaded, articulated pixel art with real animations
// (run cycles with planted feet, attack wind-up / swing / follow-through, casting, hurt, knocked down, dialogue:
// mouths move while a character's line is typing or voiced, plus a talking gesture). Same canvases and sizes as
// before, so hitboxes, shadows and every caller stay the same. Preview offline: node preview_cast.js ext.js out.png
// Rig: feet by IK (knees bend forward), arms by angle (0 = hanging down, + = toward the facing side).
// =====================================================================
const CST={vwho:null};
(function(){ const vp=Voice.play; Voice.play=function(who){ CST.vwho=who; return vp.apply(this,arguments); }; })();
// 0 = not talking, 1 = in their line (mouth shut), 2 = mouth open
function cTalk(who){ const d=Game.dlg; let on=false, typing=false;
  if(d&&d.type==='say'&&d.who===who){ on=true; typing=d.shown<String(d.text||'').length; }
  if(Voice.speaking&&CST.vwho===who){ on=true; typing=true; }
  if(!on) return 0; return typing&&Math.floor(performance.now()/95)%3?2:1; }
function cBlink(t,seed){ const k=((t+(seed||0))/3.3)%1; return k>0&&k<.045; }
const cE=t=>t<0?0:t>1?1:t*t*(3-2*t);
function cJ(x,y,a,l){ return [x+Math.sin(a)*l,y+Math.cos(a)*l]; }
// two-bone IK, knee toward +x (the facing side)
function cIK(hx,hy,fx,fy,l1,l2){ let dx=fx-hx, dy=fy-hy, d=Math.hypot(dx,dy); const m=l1+l2-.01; if(d>m){ fx=hx+dx/d*m; fy=hy+dy/d*m; dx=fx-hx; dy=fy-hy; d=m; }
  if(d<.01) return [hx,hy+l1,fx,fy]; const base=Math.atan2(dy,dx), al=Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d))));
  const k1=[hx+Math.cos(base-al)*l1,hy+Math.sin(base-al)*l1], k2=[hx+Math.cos(base+al)*l1,hy+Math.sin(base+al)*l1]; const k=k1[0]>=k2[0]?k1:k2; return [k[0],k[1],fx,fy]; }
// a thick pixel segment; with cb, the front edge gets the base colour and the back keeps cs (shading)
function cSeg(p,x0,y0,x1,y1,w,cs,cb){ const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0))), o=Math.floor(w/2);
  for(let i=0;i<=n;i++){ const k=i/n; p(Math.round(x0+(x1-x0)*k)-o,Math.round(y0+(y1-y0)*k)-o,w,w,cs); }
  if(cb&&w>2) for(let i=0;i<=n;i++){ const k=i/n; p(Math.round(x0+(x1-x0)*k)-o+1,Math.round(y0+(y1-y0)*k)-o,w-1,w-1,cb); } }
// scanline polygon in local coordinates (flips with the painter)
function cPoly(p,pts,col){ let y0=1e9,y1=-1e9; for(const q of pts){ y0=Math.min(y0,q[1]); y1=Math.max(y1,q[1]); } y0=Math.round(y0); y1=Math.round(y1);
  for(let y=y0;y<=y1;y++){ const yy=y+.5, xs=[]; for(let i=0;i<pts.length;i++){ const a=pts[i], b=pts[(i+1)%pts.length]; if((a[1]<=yy&&b[1]>yy)||(b[1]<=yy&&a[1]>yy)) xs.push(a[0]+(yy-a[1])/(b[1]-a[1])*(b[0]-a[0])); }
    xs.sort((a,b)=>a-b); for(let i=0;i+1<xs.length;i+=2){ const xa=Math.round(xs[i]), xb=Math.round(xs[i+1]); if(xb>xa) p(xa,y,xb-xa,1,col); } } }
function cFlash(C,fl){ if(!fl) return C; const o={}; for(const k in C) o[k]='#ffffff'; return o; }
// ---------- poses ----------
// returns {b: body lift (neg = up), lean: shoulder shift, F:[[dx,dy] far foot, near foot] (dy from the ground, neg = up),
//          ua/el: [far, near] upper-arm angle and elbow bend, hd/hx: head offsets, tw: torso twist (0..1, near shoulder forward)}
function cPose(k,t,u){ u=u||0; const Pz={b:0,lean:0,F:[[-2,0],[2,0]],ua:[.1,-.08],el:[.25,.3],hd:0,hx:0};
  const br=Math.sin(t*2.3)>.35?-1:0;
  switch(k){
    case 'idle': Pz.b=br; Pz.ua=[.12+Math.sin(t*2.3)*.04,-.1]; break;
    case 'talk': Pz.b=br; Pz.ua=[.1,.55+Math.sin(t*3.1)*.3]; Pz.el=[.25,1.25+Math.sin(t*4.3)*.35]; Pz.hd=Math.sin(t*6)>.6?1:0; break;
    case 'run': case 'walk': { const sp=k==='run'?12:7, st=k==='run'?5.5:3.5, ph=t*sp; Pz.F=[0,1].map(i=>{ const a=ph+i*Math.PI; return [Math.sin(a)*st,-Math.max(0,Math.cos(a))*(k==='run'?3.2:1.6)]; });
      Pz.b=-Math.round(Math.abs(Math.cos(ph))*(k==='run'?1.4:.6)); Pz.lean=k==='run'?2:1; Pz.ua=[0,1].map(i=>-Math.sin(ph+i*Math.PI)*(k==='run'?.85:.45)); Pz.el=[k==='run'?1.1:.4,k==='run'?1.1:.4]; break; }
    case 'jump': Pz.F=[[-3,-4],[3,-6]]; Pz.b=-1; Pz.ua=[-.9,2.4]; Pz.el=[.6,.3]; break;
    case 'fall': Pz.F=[[-2,-1],[3,-3]]; Pz.ua=[-1.3,1.6]; Pz.el=[.5,.6]; break;
    case 'glide': Pz.F=[[-1,-2],[2,-3]]; Pz.ua=[2.9,3.05]; Pz.el=[0,0]; break;
    case 'dash': Pz.F=[[-8,-1],[5,-2]]; Pz.b=2; Pz.lean=4; Pz.ua=[-1.3,-1.0]; Pz.el=[.3,.3]; break;
    case 'attack': { const e=cE(u*1.15); Pz.F=[[-5,0],[5,0]]; Pz.b=1+Math.round(e); Pz.lean=Math.round(-1+e*4); Pz.ua=[-.6+e*.5,-2.7+e*4.1]; Pz.el=[.6,.25-e*.2]; Pz.tw=e; break; }
    case 'charge': Pz.F=[[-6,0],[5,0]]; Pz.b=3; Pz.lean=-1; Pz.ua=[-.5,-.9]; Pz.el=[.9,1.2]; break;
    case 'beam': Pz.F=[[-6,0],[5,0]]; Pz.b=2; Pz.lean=3; Pz.ua=[-.7,1.5]; Pz.el=[.4,0]; Pz.tw=1; break;
    case 'block': Pz.F=[[-5,0],[4,0]]; Pz.b=2; Pz.lean=1; Pz.ua=[.5,.9]; Pz.el=[1.4,1.6]; break;
    case 'cast': Pz.F=[[-4,0],[4,0]]; Pz.b=br; Pz.lean=-1; Pz.ua=[-.5,2.5+Math.sin(t*9)*.08]; Pz.el=[.4,.1]; Pz.hd=-1; break;
    case 'pray': Pz.b=br; Pz.ua=[.65,.7]; Pz.el=[1.7,1.7]; Pz.hd=1; break;
    case 'hurt': Pz.F=[[-5,0],[2,0]]; Pz.b=1; Pz.lean=-3; Pz.ua=[-1.4,-.9]; Pz.el=[.4,.8]; Pz.hd=1; Pz.hx=-1; break;
    case 'down': Pz.F=[[-7,0],[4,0]]; Pz.b=7; Pz.lean=3; Pz.ua=[.5,.7]; Pz.el=[.3,.4]; Pz.hd=3; Pz.hx=1; break;
  }
  return Pz; }
// lays out the joints for a humanoid D: {hip, torso, thigh, shin, uarm, farm, sep, ssep, neck}
function cRig(D,P){ const hy=-D.hip+P.b, hx=(P.hx0||0), sy=hy-D.torso, sx=hx+P.lean, J={hx,hy,sx,sy,P,D};
  J.L=[0,1].map(i=>{ const x=hx+(i?1:-1)*D.sep, F=P.F[i], fx=x+F[0], fy=F[1]; const [kx,ky,ex,ey]=cIK(x,hy,fx,fy,D.thigh,D.shin); return {x,y:hy,kx,ky,ex,ey}; });
  J.A=[0,1].map(i=>{ const tw=(P.tw||0)*(i?2:-1), x=sx+(i?1:-1)*D.ssep+tw, y=sy+2, a=P.ua[i], [kx,ky]=cJ(x,y,a,D.uarm), [ex,ey]=cJ(kx,ky,a+P.el[i],D.farm); return {x,y,kx,ky,ex,ey,a:a+P.el[i]}; });
  J.headX=sx+P.hx+(D.headX||0); J.headY=sy-(D.neck||0)+P.hd; return J; }
// standard limb painters
function cLeg(p,L,w,cs,cb,shoe,shoeH,sl){ cSeg(p,L.x,L.y,L.kx,L.ky,w,cs,cb); cSeg(p,L.kx,L.ky,L.ex,L.ey-1,w-1,cs,cb); const x=Math.round(L.ex), y=Math.round(L.ey); sl=sl||4;
  p(x-2,y-2,sl+1,2,shoe); if(shoeH) p(x-1,y-2,sl-1,1,shoeH); }
function cArm(p,A,w,cs,cb,hand,handS){ cSeg(p,A.x,A.y,A.kx,A.ky,w,cs,cb); cSeg(p,A.kx,A.ky,A.ex,A.ey,w-1,cs,cb); const x=Math.round(A.ex), y=Math.round(A.ey); p(x-1,y-1,3,3,hand); if(handS) p(x-1,y+1,3,1,handS); }
// a held blade along the forearm direction (+bend), from the hand
function cSword(p,A,len,ang,cols){ const a=A.a+(ang||0), ex=A.ex+Math.sin(a)*len, ey=A.ey+Math.cos(a)*len;
  cSeg(p,A.ex,A.ey,ex,ey,2,cols[0]); cSeg(p,A.ex+Math.sin(a)*1.5,A.ey+Math.cos(a)*1.5-1,ex,ey-1,1,cols[1]);
  const hx=A.ex-Math.sin(a)*3, hy=A.ey-Math.cos(a)*3; cSeg(p,A.ex,A.ey,hx,hy,2,cols[2]||'#3a2030'); p(Math.round(A.ex)-1,Math.round(A.ey)-1,3,3,cols[3]||'#d8b46a'); return [ex,ey]; }

// ================= ALI =================
const AC2=Object.assign({},AC,{hakS:'#1e1a2a',haoriS:'#100e18',innerS:'#5a0e1a',skinH:'#daa074',hatS:'#a88a48',scarfH:'#e0303e',hair2:'#2a2434'});
function drawAliCast(c,cx,by,f,s){ const p=SH(c,cx,by,f), t=s.t||0, a=s.anim||'idle', C=cFlash(AC2,s.flash>0), old=s.old;
  const tk=cTalk('ali'), ap=s.ap!=null?s.ap:(a==='attack'?(t*4)%1:0);
  const k=tk&&a==='idle'?'talk':a==='dead'?'down':a; const P=cPose(k,t,ap); if(a==='glide'){ P.ua=[2.5,2.6]; P.el=[.5,.5]; }
  const D={hip:14,torso:13,thigh:7,shin:8,uarm:6,farm:6,sep:2,ssep:4,neck:1};
  const J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy;
  // scarf trailing from the neck, longer when moving fast
  const sl=a==='run'||a==='dash'||a==='glide'||a==='beam'?14:8;
  for(let i=0;i<sl;i++){ const wy=Math.round(Math.sin(t*10-i*.55)*(i/3.2)), x=sx-4-i, y=sy+1+wy+Math.round(i*(a==='run'||a==='dash'?.05:.35)); p(x,y,1,3,i>sl-4?C.scarfD:i%3?C.scarf:C.scarfH); if(i%4===3) p(x,y+3,1,1,C.scarfD); }
  // ponytail
  const pt=Math.round(Math.sin(t*6)*1.5); p(J.headX-7,J.headY-6,3,4,C.hair); p(J.headX-9,J.headY-3+pt,3,5,C.hair); p(J.headX-9,J.headY+2+pt,2,2,C.hair2);
  // far arm
  cArm(p,J.A[0],4,C.haoriS,C.haori,C.skinS);
  // far leg (wide hakama)
  cLeg(p,J.L[0],6,C.hakS,C.hakS,C.sandal);
  // daisho at the hip unless a blade is out
  const out=a==='attack'||a==='beam'||a==='block'||a==='charge';
  const saya=(x0,y0,x1,y1)=>{ cSeg(p,x0,y0,x1,y1,1,'#3a3048'); cSeg(p,x0,y0+1,x1,y1+1,1,'#0c0a10'); };
  saya(J.hx-2,hy-4,J.hx-15,hy+2); if(!out){ saya(J.hx,hy-6,J.hx-17,hy-1); p(J.hx,hy-7,2,2,C.tsuba); p(J.hx+2,hy-7,3,1,'#e8e4dc'); } p(J.hx-2,hy-5,2,2,C.tsuba);
  // near leg
  cLeg(p,J.L[1],6,C.hak,C.hakL,C.sandal);
  // hakama flare at the shins
  for(const L of J.L){ const x=Math.round(L.ex), y=Math.round(L.ey); p(x-4,y-5,8,2,L===J.L[1]?C.hak:C.hakS); }
  // haori: back panel, body, open front with crimson inner and obi
  cPoly(p,[[sx-6,sy],[sx+6,sy],[J.hx+7,hy-1],[J.hx+6,hy+4],[J.hx-8,hy+5],[J.hx-7,hy-1]],C.haori);
  cPoly(p,[[sx-6,sy],[sx-2,sy],[J.hx-3,hy+4],[J.hx-8,hy+5],[J.hx-7,hy-1]],C.haoriL);
  cPoly(p,[[sx+1,sy],[sx+5,sy],[J.hx+5,hy-3],[J.hx+2,hy-3]],C.inner); cPoly(p,[[sx+2,sy],[sx+4,sy],[J.hx+3,hy-7]],C.skinS);
  p(sx+5,sy,1,6,C.innerS); p(J.hx-7,hy-4,15,3,C.obi); p(J.hx-7,hy-4,15,1,'#ffffff'); p(J.hx+4,hy-4,2,3,C.scarfD);
  for(let i=0;i<3;i++) p(J.hx-6+i*4,hy+1,1,3,C.haoriS);
  // head
  const hx=Math.round(J.headX), hy2=Math.round(J.headY), bl=cBlink(t,.7);
  p(hx-4,hy2-8,8,8,C.skin); p(hx+2,hy2-7,2,6,C.skinH); p(hx-4,hy2-2,8,2,C.skinS); p(hx-4,hy2-8,2,6,C.skinS);
  if(bl) p(hx+1,hy2-5,3,1,C.skinS); else { p(hx+1,hy2-5,3,1,C.eye); p(hx+3,hy2-5,1,1,'#ffb0b0'); p(hx+1,hy2-6,3,1,C.hair); }
  p(hx-2,hy2-5,1,1,'#1a1018');
  if(tk===2){ p(hx+1,hy2-3,3,3,'#3a1018'); p(hx+1,hy2-3,3,1,'#f2e8e8'); p(hx+2,hy2-1,1,1,'#c86a6a'); } else p(hx+1,hy2-2,3,1,'#5a2a20');
  if(old){ p(hx-5,hy2-8,2,4,'#c8c8d0'); p(hx+1,hy2-1,3,1,'#c8c8d0'); }
  // kasa: wide cone with weave lines and a band
  const hb=hy2-8; cPoly(p,[[hx-13,hb+1],[hx+13,hb+1],[hx+2,hb-8],[hx-2,hb-8]],C.hat);
  cPoly(p,[[hx-13,hb+1],[hx-3,hb+1],[hx-1,hb-8],[hx-2,hb-8]],C.hatS); cPoly(p,[[hx+3,hb-1],[hx+12,hb],[hx+2,hb-7]],C.hatL);
  p(hx-13,hb+1,26,1,C.hatD); p(hx-9,hb-1,18,1,C.band); for(let i=-10;i<=10;i+=4) p(hx+i,hb-2+Math.round(Math.abs(i)/4),1,2,C.hatD);
  // near arm, with a blade when fighting
  const A=J.A[1];
  if(a==='block'){ const k2=t*30; for(let q=0;q<4;q++){ const an=k2+q*1.57; cSeg(p,A.ex,A.ey,A.ex+Math.cos(an)*13,A.ey+Math.sin(an)*9,1,q%2?C.blade:C.bladeS); } }
  else if(out) cSword(p,A,a==='charge'?15:19,a==='charge'?2.6:a==='beam'?.1:.2,[C.bladeS,C.blade,C.saya,C.tsuba]);
  cArm(p,A,4,C.haoriS,C.haori,C.skin,C.skinS); }

// ================= MIRA =================
const MC2=Object.assign({},MC,{dressD:'#174a44',skinH:'#fbe4d0',stockH:'#4f4458',eye:'#2ea86a',eyeD:'#0f3a26'});
function drawMiraCast(c,cx,by,f,s){ const p=SH(c,cx,by,f), t=s.t||0, a=s.anim||'idle', C=MC2, tk=cTalk('mira');
  const k=tk&&(a==='idle')?'talk':a; const P=cPose(k,t,0); if(a==='run'){ P.ua=P.ua.map(x=>x*.7); P.el=[.9,.9]; }
  const D={hip:10,torso:13,thigh:5,shin:6,uarm:5,farm:5,sep:2,ssep:4,neck:1};
  const J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy, mv=a==='run'?Math.sin(t*12):0;
  // tail: a long swaying S-curve
  for(let i=0;i<14;i++){ const x=J.hx-5-Math.round(i*.8), y=hy-2-Math.round(Math.sin(t*2.6+i*.45)*2)-Math.round(i*i*.085); p(x,y,3,3,i>11?C.hairH:i%3?C.ear:C.hairS); }
  // long back hair
  cPoly(p,[[J.headX-6,J.headY-9],[J.headX-1,J.headY-9],[sx-1,sy+9],[sx-6,sy+11+Math.round(mv)]],C.hairS);
  // far arm, legs (dark stockings, brown shoes)
  cArm(p,J.A[0],3,C.dressS,C.dressS,C.skinS);
  cLeg(p,J.L[0],3,'#2a2230',C.stock,'#4a2a20',null,4); cLeg(p,J.L[1],3,C.stock,C.stockH,C.shoe,'#83503e',4);
  // skirt: flared, swishing with the run
  const sw=Math.round(mv*1.5), sb=hy+5;
  cPoly(p,[[J.hx-5,hy-6],[J.hx+5,hy-6],[J.hx+8+sw,sb],[J.hx-8+sw,sb+1]],C.dress);
  cPoly(p,[[J.hx+2,hy-6],[J.hx+5,hy-6],[J.hx+8+sw,sb],[J.hx+4+sw,sb]],C.dressS);
  cPoly(p,[[J.hx-5,hy-6],[J.hx-3,hy-6],[J.hx-6+sw,sb+1],[J.hx-8+sw,sb+1]],C.dressH);
  for(let i=-7;i<=7;i+=2) p(J.hx+i+sw,sb,1,1,C.apr); p(J.hx-8+sw,sb+1,17,1,C.dressD);
  // apron
  cPoly(p,[[J.hx-1,hy-6],[J.hx+4,hy-6],[J.hx+5+sw,sb-1],[J.hx-2+sw,sb-1]],C.apr); p(J.hx+3+sw,hy-5,1,8,C.aprS);
  // bodice with a waist ribbon
  cPoly(p,[[sx-5,sy],[sx+5,sy],[J.hx+5,hy-6],[J.hx-5,hy-6]],C.dress); cPoly(p,[[sx+2,sy],[sx+5,sy],[J.hx+5,hy-6],[J.hx+2,hy-6]],C.dressS);
  cPoly(p,[[sx-1,sy+1],[sx+2,sy+1],[J.hx+2,hy-7],[J.hx,hy-7]],C.apr); p(J.hx-5,hy-7,10,1,'#7a4a2e'); p(J.hx-6,hy-8,2,3,'#7a4a2e');
  // choker + bell
  p(sx-3,sy-1,7,1,'#3a2238'); p(sx,sy,3,3,C.bell); p(sx+1,sy,1,1,'#fff6c8'); p(sx+1,sy+2,1,1,'#a8862e');
  // head
  const hx=Math.round(J.headX), h0=Math.round(J.headY), bl=cBlink(t,1.9);
  p(hx-5,h0-10,11,10,C.skin); p(hx+3,h0-9,3,7,C.skinH); p(hx-5,h0-3,4,3,C.skinS);
  if(bl) p(hx+2,h0-6,4,1,'#5a3a2a'); else { p(hx+2,h0-7,3,3,'#ffffff'); p(hx+3,h0-7,2,3,C.eye); p(hx+3,h0-7,1,1,'#bff5d8'); p(hx+4,h0-6,1,2,C.eyeD); p(hx+2,h0-8,4,1,'#5a3a2a'); }
  p(hx+6,h0-4,1,1,C.skinS);
  if(tk===2){ p(hx+2,h0-3,3,3,'#5a1a24'); p(hx+2,h0-3,3,1,'#ffffff'); p(hx+3,h0-1,1,1,'#e88a90'); } else p(hx+3,h0-2,2,1,'#c2706a');
  if(s.blush){ p(hx+1,h0-4,3,1,'#f6909c'); p(hx+5,h0-4,1,1,'#f6909c'); }
  // hair: fringe, side lock, highlights
  p(hx-6,h0-13,12,5,C.hair); p(hx-1,h0-9,7,2,C.hair); p(hx+5,h0-8,2,5,C.hair); p(hx,h0-8,2,2,C.hair); p(hx-6,h0-11,3,10,C.hair);
  p(hx-3,h0-13,6,1,C.hairH); p(hx+1,h0-12,3,1,C.hairH); p(hx+6,h0-6,1,4,C.hairS); p(hx-3,h0-9,4,1,C.hairS); p(hx+1,h0-7,1,1,C.hairS); p(hx-3,h0-8,1,7,C.hairS); p(hx+5,h0-3,1,3,'#d9a88c');
  // ears: one blonde, one pink-lined; the left one twitches
  const tw=Math.sin(t*1.7)>.96?1:0, er=a==='run'?1:0;
  p(hx-5-er,h0-18+tw,4,5,C.ear); p(hx-5-er,h0-20+tw,3,2,C.ear); p(hx-5-er,h0-21+tw,2,1,C.ear); p(hx-4-er,h0-18+tw,2,3,C.pink);
  p(hx+2-er,h0-18,4,5,C.hair); p(hx+3-er,h0-20,3,2,C.hair); p(hx+4-er,h0-21,2,1,C.hair); p(hx+3-er,h0-18,2,3,C.pink);
  // near arm: puffed sleeve
  const A=J.A[1]; cArm(p,A,3,C.dressS,C.dressH,C.skin,C.skinS); p(Math.round(A.x)-2,Math.round(A.y)-1,4,3,C.dressH); }

// ================= VILLAGERS, PAUL, KENJI =================
function cShade(hex,k){ const n=parseInt(String(hex).slice(1,7),16); if(isNaN(n)||String(hex)[0]!=='#') return hex; const r=n>>16&255,g=n>>8&255,b=n&255, m=v=>Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k))));
  return '#'+[m(r),m(g),m(b)].map(v=>v.toString(16).padStart(2,'0')).join(''); }
function drawVillagerCast(c,cx,by,f,s,v){ v=v||{}; const p=SH(c,cx,by,f), t=s.t||0, kid=!!v.kid, paul=v===PAUL_LOOK, who=paul?'paul':s.who||'';
  const tk=who?cTalk(who):0, mv=!!s.moving, k=s.flee>0?'run':mv?'walk':tk?'talk':'idle'; const P=cPose(k,t+(cx%7)*.3,0);
  if(v.staff&&!mv){ P.ua[1]=.35; P.el[1]=.9; }
  const D=kid?{hip:7,torso:10,thigh:4,shin:4,uarm:4,farm:4,sep:2,ssep:4,neck:1}:{hip:10,torso:14,thigh:5,shin:6,uarm:6,farm:5,sep:2,ssep:5,neck:1};
  const J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy;
  const cl=v.cloth||'#7a6a5a', clS=v.clothS||cShade(cl,-.25), clH=cShade(cl,.18), sk=v.skin||'#d8a07a', skS=cShade(sk,-.18), skH=cShade(sk,.15);
  const pa=v.pants||'#4a3a2e', paS=v.pantsS||cShade(pa,-.25), hair=v.hair||'#3a2a1a', hairH=cShade(hair,.22), hairS=cShade(hair,-.3);
  // far arm, legs
  cArm(p,J.A[0],3,clS,clS,skS);
  cLeg(p,J.L[0],3,paS,paS,'#1e140c',null,4); cLeg(p,J.L[1],3,paS,pa,'#2a1a10','#4a3424',4);
  // hood / cloak behind
  if(v.hood){ cPoly(p,[[sx-7,sy-1],[sx+3,sy-1],[J.hx+2,hy+3],[J.hx-9,hy+5]],cShade(v.hood,-.2)); }
  // body: tunic with a hem, or a long robe
  const hem=v.robe?-1:hy+4;
  if(v.robe) cPoly(p,[[sx-6,sy],[sx+6,sy],[J.hx+8,hem],[J.hx-8,hem]],cl); else cPoly(p,[[sx-6,sy],[sx+6,sy],[J.hx+7,hem],[J.hx-7,hem]],cl);
  cPoly(p,[[sx+2,sy],[sx+6,sy],[J.hx+(v.robe?8:7),hem],[J.hx+3,hem]],clS); cPoly(p,[[sx-6,sy],[sx-4,sy],[J.hx-5,hem],[J.hx-(v.robe?8:7),hem]],clH);
  p(J.hx-(v.robe?8:7),hem-1,v.robe?16:14,1,clS);
  if(v.apron){ cPoly(p,[[J.hx-2,sy+3],[J.hx+4,sy+3],[J.hx+5,hem-1],[J.hx-2,hem-1]],'#ede5d4'); p(J.hx+3,sy+4,1,hem-sy-5,'#c8bfae'); p(J.hx-2,sy+3,6,1,'#c8bfae'); }
  p(J.hx-6,hy-4,13,2,v.belt||'#5a3a22'); p(J.hx+1,hy-4,2,2,'#c8a050');
  if(v.hood){ cPoly(p,[[sx-6,sy-1],[sx+6,sy-1],[sx+5,sy+5],[sx-7,sy+6]],v.hood); p(sx-6,sy-1,12,1,cShade(v.hood,.2)); }
  // head
  const hx=Math.round(J.headX), h0=Math.round(J.headY), bl=cBlink(t,cx*.13);
  p(hx-5,h0-11,11,11,sk); p(hx+3,h0-10,3,8,skH); p(hx-5,h0-4,4,4,skS); p(hx+5,h0-6,2,2,sk); p(hx+6,h0-5,1,1,skS);
  if(v.hat==='#3ff4ff'){ p(hx-1,h0-8,8,3,'#1a1e2e'); p(hx,h0-7,6,1,'#3ff4ff'); p(hx+5,h0-7,1,1,'#ffffff'); } // Kenji's VR visor
  else if(bl) p(hx+2,h0-7,3,1,skS); else { p(hx+2,h0-8,2,2,'#f4efe6'); p(hx+3,h0-8,1,2,'#20140c'); p(hx+2,h0-9,3,1,hairS); }
  if(tk===2){ p(hx+2,h0-4,3,3,'#4a1a14'); p(hx+2,h0-4,3,1,'#f2ece8'); } else p(hx+2,h0-3,3,1,'#7a3a2a');
  // hair
  if(!v.hood){ p(hx-6,h0-14,12,4,hair); p(hx-7,h0-12,4,8,hair); p(hx,h0-11,5,1,hair); p(hx-4,h0-14,6,1,hairH); p(hx-7,h0-6,2,2,hairS); }
  if(v.beard){ const bw=tk===2?1:0; cPoly(p,[[hx-1,h0-5],[hx+7,h0-5],[hx+6,h0+3+bw],[hx+3,h0+6+bw],[hx,h0+1]],'#ecebe6'); p(hx+2,h0-1,3,1,'#b8b0a4'); p(hx+1,h0-5,5,1,'#d8d4cc'); if(tk===2) p(hx+3,h0-2,2,1,'#5a3a30'); }
  if(v.hat==='chef'){ p(hx-6,h0-15,12,3,'#ffffff'); ell(c,cx+(hx)*f,by+h0-19,6,4,'#ffffff'); p(hx-6,h0-13,12,1,'#d8d8d8'); p(hx+2,h0-21,3,2,'#f2f2f2'); }
  else if(v.hood){ const H=v.hood; cPoly(p,[[hx-8,h0-1],[hx-7,h0-13],[hx-2,h0-16],[hx+5,h0-15],[hx+8,h0-9],[hx+7,h0-6],[hx+4,h0-11],[hx-3,h0-11],[hx-5,h0-1]],H);
    p(hx-3,h0-14,7,1,cShade(H,.2)); p(hx-4,h0-11,8,3,'rgba(0,0,0,.4)'); }
  else if(v.hat&&v.hat!=='#3ff4ff'){ p(hx-8,h0-13,16,2,v.hat); cPoly(p,[[hx-5,h0-13],[hx+5,h0-13],[hx+4,h0-18],[hx-4,h0-18]],v.hat); p(hx-5,h0-14,10,1,'rgba(0,0,0,.3)'); p(hx-3,h0-17,5,1,cShade(v.hat,.25)); }
  // near arm (holding the staff if there is one)
  const A=J.A[1];
  if(v.staff){ const x=Math.round(A.ex)+1; R(c,cx+x*f-(f<0?1:0),by-46+Math.round(Math.sin(t*2.3)),2,46,'#6b4a2b'); R(c,cx+x*f-2,by-49,6,4,'#8fd3ff'); R(c,cx+x*f-1,by-48,2,2,'#e8f8ff'); if(Math.sin(t*3)>.7) R(c,cx+x*f+2*f,by-51,1,1,'#ffffff'); }
  cArm(p,A,3,clS,cl,sk,skS); }

// ================= NATHAN (pilot): same design, now articulated =================
function drawNathanCast(c,cx,by,f,s){ const p=SH(c,cx,by,f), t=s.t||0, fr=s.frost||0, Jk=s.jacket==null?1:s.jacket, SC=s.scarf==null?1:s.scarf, still=!!s.still;
  const ice=hex=>{ if(fr<=0) return hex; const n=parseInt(hex.slice(1),16), r=n>>16&255, g=n>>8&255, b=n&255, k=Math.min(1,fr); return `rgb(${Math.round(r+(200-r)*k)},${Math.round(g+(232-g)*k)},${Math.round(b+(255-b)*k)})`; };
  const C={skin:ice('#c48a5c'),skinD:ice('#9a6440'),skinH:ice('#d9a272'),hair:ice('#1a1626'),hairH:ice('#34304a'),suit:ice('#232a4a'),suitL:ice('#34406a'),suitD:ice('#161a30'),stripe:ice('#3ff4ff'),jac:ice('#5a3a28'),jacL:ice('#7a523a'),jacD:ice('#3e271a'),scarf:ice('#e8e4dc'),scarfS:ice('#b8b4ac'),boot:ice('#14121c'),bootH:ice('#2e2a3a')};
  const tk=cTalk('nathan'), sh=fr>.5&&!still?Math.round(Math.sin(t*40)*.6):0; // shivering when frozen
  const dr=still?0:Math.sin(t*1.3), ar=still?0:Math.sin(t*1.1);
  const P={b:-6+Math.round(dr),lean:0,F:[[-3,-2+Math.round(dr*2)],[4,-4-Math.round(dr*2)]],ua:[-.9+ar*.3,1.1-ar*.3],el:[.5,.6+ar*.2],hd:0,hx:sh};
  if(tk){ P.ua[1]=.9+Math.sin(t*3.4)*.35; P.el[1]=1.3; }
  const D={hip:14,torso:16,thigh:7,shin:8,uarm:6,farm:6,sep:2,ssep:5,neck:1}, J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy;
  // scarf trailing
  if(SC>.05){ c.globalAlpha=SC; for(let i=0;i<7;i++) p(sx-6-i*3,sy+1+Math.round(Math.sin(t*2+i)*2)+i,4,2,i%2?C.scarfS:C.scarf); c.globalAlpha=1; }
  cArm(p,J.A[0],4,Jk>.5?C.jacD:C.suitD,Jk>.5?C.jacD:C.suitD,C.skinD);
  cLeg(p,J.L[0],4,C.suitD,C.suitD,C.boot,null,5); cLeg(p,J.L[1],4,C.suit,C.suitL,C.boot,C.bootH,5);
  for(const L of J.L){ const mx=Math.round((L.kx+L.x)/2), my=Math.round((L.ky+L.y)/2); p(mx-1,my,3,1,C.stripe); }
  // flight suit torso
  cPoly(p,[[sx-7,sy],[sx+7,sy],[J.hx+6,hy+1],[J.hx-6,hy+1]],C.suit); cPoly(p,[[sx-7,sy],[sx-3,sy],[J.hx-3,hy+1],[J.hx-6,hy+1]],C.suitL);
  p(Math.round((sx+J.hx)/2),sy+1,2,hy-sy-1,C.stripe); p(J.hx-6,hy-3,12,2,C.boot); p(J.hx-1,hy-3,2,2,C.stripe);
  // jacket over it
  if(Jk>.05){ c.globalAlpha=Jk; cPoly(p,[[sx-8,sy-1],[sx-2,sy-1],[J.hx-3,hy+2],[J.hx-8,hy+2]],C.jac); cPoly(p,[[sx+3,sy-1],[sx+8,sy-1],[J.hx+8,hy+2],[J.hx+3,hy+2]],C.jac);
    p(sx-8,sy-1,2,hy-sy+3,C.jacL); p(sx+6,sy,2,hy-sy+2,C.jacD); p(sx-2,sy-1,2,4,C.jacL); p(sx+3,sy-1,2,4,C.jacL); c.globalAlpha=1; }
  if(SC>.05){ c.globalAlpha=SC; p(sx-7,sy-2,14,3,C.scarf); p(sx-7,sy,14,1,C.scarfS); c.globalAlpha=1; }
  // head with headset
  const hx=Math.round(J.headX), h0=Math.round(J.headY), bl=s.closed||cBlink(t,.3);
  p(hx-6,h0-12,12,12,C.skin); p(hx+3,h0-11,3,9,C.skinH); p(hx-6,h0-4,12,2,C.skinD); p(hx-6,h0-12,2,8,C.skinD);
  if(bl){ p(hx-3,h0-8,3,1,C.skinD); p(hx+2,h0-8,3,1,C.skinD); } else { p(hx-3,h0-9,3,2,'#14101a'); p(hx+2,h0-9,3,2,'#14101a'); p(hx+3,h0-9,1,1,'#ffffff'); p(hx-2,h0-9,1,1,'#ffffff'); }
  if(tk===2){ p(hx-1,h0-6,4,3,'#4a1a14'); p(hx-1,h0-6,4,1,'#f2ece8'); p(hx,h0-4,2,1,'#c86a6a'); } else p(hx,h0-5,3,1,'#6a3a2a');
  p(hx-7,h0-14,14,5,C.hair); p(hx-8,h0-12,3,6,C.hair); p(hx+4,h0-16,4,4,C.hair); p(hx-3,h0-17,4,4,C.hair); p(hx+6,h0-12,3,5,C.hair); p(hx-1,h0-15,3,2,C.hair);
  p(hx-4,h0-14,6,1,C.hairH); p(hx+5,h0-15,2,1,C.hairH);
  p(hx-7,h0-10,2,5,'#2a2a38'); p(hx-7,h0-6,6,1,'#2a2a38'); p(hx-2,h0-6,2,1,Math.sin(t*5)>0?C.stripe:'#1a8a9a');
  cArm(p,J.A[1],4,Jk>.5?C.jac:C.suit,Jk>.5?C.jacL:C.suitL,C.skin,C.skinD);
  if(fr>.15){ const n=Math.floor(fr*18); for(let i=0;i<n;i++){ const x=Math.floor(hash(i,7)*24)-12, y=-Math.floor(hash(7,i)*50)-4; p(x,y,1,1,'#ffffff'); if(i%3===0) p(x-1,y,3,1,'rgba(220,240,255,.8)'); } } }

// smoothed 0..1 follower for on/off attack flags (so a swing animates instead of snapping)
function cFollow(o,key,target,t,rate){ const k='_cf_'+key, kt=k+'t'; let v=o[k]; if(v==null) v=target; const dt=Math.min(.1,Math.max(0,t-(o[kt]==null?t:o[kt]))); o[kt]=t;
  v+=(target-v)*Math.min(1,dt*rate); o[k]=v; return v; }
function cStars(p,y,t,col,r){ for(let i=0;i<3;i++){ const a=t*4+i*2.1; p(Math.round(Math.cos(a)*(r||10))-1,y+Math.round(Math.sin(a)*3),3,3,col); p(Math.round(Math.cos(a)*(r||10)),y+Math.round(Math.sin(a)*3)-1,1,5,col); } }

// ================= CAOTAN =================
function drawCaotanCast(c,cx,by,f,s){ const p=SH(c,cx,by,f), t=s.t||0, fl=s.flash>0, dn=s.down>0, tk=cTalk('caotan'), base=s.form==null;
  const C=cFlash({skin:'#c98a5e',skinS:'#a46a44',skinH:'#e0a476',skinD:'#86522f',tank:'#f6f3ec',tankS:'#cfc8bb',tankD:'#a8a094',jean:'#4a6fa8',jeanS:'#34558a',jeanH:'#6a8fc8',hair:'#22160f',hairH:'#4a3220',shoe:'#e8e8f0',shoeS:'#9aa0b0',belt:'#3a2a20',buckle:'#e0c870',band:'#ffffff'},fl);
  const st=s.stun>0, fire=s.fire>0, push=s.push>0, atk=s.state==='atk', hv=dn?0:Math.sin(t*3)*2;
  const P={b:Math.round(hv),lean:0,F:[[-3,-6+Math.round(Math.sin(t*5)*2)],[3,-6-Math.round(Math.sin(t*5)*2)]],ua:[-.55,1.75+Math.sin(t*2.2)*.12],el:[1.7,1.35+Math.sin(t*2.2)*.25],hd:0,hx:0};
  if(dn){ P.b=10; P.lean=6; P.hd=5; P.hx=2; P.F=[[-9,0],[6,0]]; P.ua=[.4,.8]; P.el=[.2,.3]; }
  else if(st){ const w=Math.sin(t*5); P.lean=Math.round(w*3); P.hd=2; P.ua=[.3+w*.2,.4-w*.2]; P.el=[.3,.3]; }
  else if(fire){ P.lean=-5; P.F=[[2,-8],[7,-7]]; P.ua=[-1.3,-1.1]; P.el=[.4,.3]; }
  else if(push){ P.ua[1]=.5; P.el[1]=2.55; }
  else if(s.heartEyes){ P.ua=[.7,.75]; P.el=[1.9,1.9]; P.hd=Math.round(Math.sin(t*6)); }
  else if(tk){ P.ua[1]=1.2+Math.sin(t*3.6)*.4; P.el[1]=.6; }
  else if(atk){ P.ua[1]=1.55; P.el[1]=.05; P.lean=2; }
  if(s.noGlasses&&!dn){ P.ua[1]=.25; P.el[1]=.9; }
  const D={hip:30,torso:24,thigh:12,shin:12,uarm:11,farm:10,sep:4,ssep:11,neck:2}, J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy;
  // far arm (big), legs in jeans with sneakers
  cArm(p,J.A[0],7,C.skinD,C.skinS,C.skinS,C.skinD);
  const leg=(L,near)=>{ cSeg(p,L.x,L.y,L.kx,L.ky,8,near?C.jeanS:'#2a4470',near?C.jean:C.jeanS); cSeg(p,L.kx,L.ky,L.ex,L.ey-3,7,near?C.jeanS:'#2a4470',near?C.jean:C.jeanS);
    if(near){ cSeg(p,L.kx+2,L.ky,L.ex+2,L.ey-4,1,C.jeanH); } const x=Math.round(L.ex), y=Math.round(L.ey); p(x-4,y-4,10,5,near?C.shoe:C.shoeS); p(x-4,y,10,1,'#8890a0'); p(x+3,y-4,3,2,'#ff4a6a'); };
  leg(J.L[0],0); leg(J.L[1],1);
  // belt + buckle (the volleys come out of it)
  p(J.hx-11,hy-4,22,5,C.belt); p(J.hx-3,hy-4,7,5,fire?'#ffffff':C.buckle); p(J.hx-2,hy-3,2,1,'#fff8d0');
  if(fire){ p(J.hx-5,hy-6,11,9,'rgba(255,255,255,.55)'); p(J.hx+4,hy-3,8,2,'rgba(255,255,255,.35)'); }
  // tank top torso: broad shoulders, pecs, abs shading
  cPoly(p,[[sx-13,sy],[sx+13,sy],[J.hx+11,hy-4],[J.hx-11,hy-4]],C.tank);
  cPoly(p,[[sx-13,sy],[sx-8,sy],[J.hx-7,hy-4],[J.hx-11,hy-4]],C.tankS); cPoly(p,[[sx+9,sy],[sx+13,sy],[J.hx+11,hy-4],[J.hx+8,hy-4]],C.tankS);
  p(sx-4,sy,9,4,C.skin); p(sx-3,sy+3,7,1,C.skinS); p(sx-8,sy+8,7,1,C.tankD); p(sx+1,sy+8,7,1,C.tankD); p(sx,sy+5,1,4,C.tankD);
  for(let i=0;i<3;i++) p(J.hx-2+Math.round(P.lean*(1-i/3)/2),sy+12+i*3,5,1,C.tankS);
  if(s.maid){ cPoly(p,[[J.hx-10,hy-18],[J.hx+10,hy-18],[J.hx+12,hy+4],[J.hx-12,hy+4]],'#ffffff'); p(J.hx-10,hy-18,20,2,'#ff8ac8'); p(J.hx-3,hy-22,6,4,'#ff3a7a'); p(J.hx-12,hy+3,24,1,'#ff8ac8'); }
  // head
  const hx=Math.round(J.headX), h0=Math.round(J.headY);
  p(hx-7,h0-15,15,15,C.skin); p(hx+4,h0-14,3,12,C.skinH); p(hx-7,h0-3,15,3,C.skinS); p(hx-7,h0-15,2,12,C.skinS); p(hx+8,h0-9,1,3,C.skinS);
  // hair: spiky, with the headband
  p(hx-8,h0-18,17,5,C.hair); p(hx-9,h0-16,4,6,C.hair); p(hx+5,h0-21,4,4,C.hair); p(hx-3,h0-22,4,5,C.hair); p(hx+1,h0-20,3,3,C.hair); p(hx-7,h0-20,3,3,C.hair); p(hx-2,h0-21,2,1,C.hairH); p(hx+6,h0-20,2,1,C.hairH);
  p(hx-8,h0-13,17,2,C.band); p(hx-10,h0-12,3,4,C.band); p(hx-12,h0-10+Math.round(Math.sin(t*7)),3,2,C.band);
  // face: eyes behind glasses or shades, grin
  const g=h0-(push?2:0), ln=s.glintT>0?'#ffffff':(s.form>=2?'#ffc8ec':'#bfe4ff'), fr='#14141e';
  if(s.noGlasses){ for(const ex of [-6,2]){ p(hx+ex-1,h0-12,6,1,fr); p(hx+ex,h0-11,4,3,fr); p(hx+ex+1,h0-10,2,2,'#ff8ac8'); p(hx+ex+1,h0-11,1,1,'#ffffff'); } }
  else if(base){ p(hx-6,h0-10,14,3,'#0e0e16'); p(hx+3,h0-10,3,1,'#7ab0ff'); }
  else { p(hx-8,g-13,7,6,fr); p(hx+1,g-13,7,6,fr); p(hx-7,g-12,5,4,ln); p(hx+2,g-12,5,4,ln); p(hx-1,g-11,2,1,fr); p(hx-6,g-12,2,1,'#ffffff'); p(hx+3,g-12,2,1,'#ffffff');
    if(s.cracked){ p(hx+3,g-12,1,4,fr); p(hx+4,g-10,2,1,fr); } }
  if(s.heartEyes){ for(const ex of [-7,2]){ p(hx+ex,h0-12,2,2,'#ff3a7a'); p(hx+ex+3,h0-12,2,2,'#ff3a7a'); p(hx+ex,h0-11,5,2,'#ff3a7a'); p(hx+ex+1,h0-9,3,1,'#ff3a7a'); p(hx+ex+2,h0-8,1,1,'#ff3a7a'); } }
  if(tk===2||st){ p(hx-2,h0-5,8,3,'#3a1010'); p(hx-1,h0-5,6,1,'#ffffff'); p(hx,h0-3,4,1,'#c84a5a'); } else { p(hx-2,h0-5,8,1,'#7a3a2a'); p(hx+5,h0-6,1,1,'#7a3a2a'); p(hx-1,h0-4,6,1,'#ffffff'); }
  if(s.nose){ p(hx-1,h0-7,2,6+Math.round(Math.sin(t*20)*2),'#d0102a'); }
  if(s.glintT>0&&!s.noGlasses){ const k=Math.round(s.glintT*10); p(hx+4-k,g-11,8+2*k,1,'#ffffff'); p(hx+4,g-15-k,1,9+2*k,'#ffffff'); }
  if(s.glintT>0&&s.noGlasses){ const k=Math.round(s.glintT*10); for(const ex of [-5,3]){ p(hx+ex-k,h0-10,2+2*k,1,'#ffffff'); p(hx+ex,h0-14-k,1,7+2*k,'#ffffff'); } }
  if(s.form>=2){ p(hx-10,h0-25,4,3,'#ff6ab0'); p(hx+7,h0-25,4,3,'#ff6ab0'); p(hx-12,h0-24,2,2,'#ff6ab0'); p(hx+11,h0-24,2,2,'#ff6ab0'); p(hx-6,h0-24,1,1,'#ffffff'); }
  if(s.maid){ p(hx-8,h0-21,17,3,'#ffffff'); p(hx-6,h0-23,3,2,'#ffffff'); p(hx+1,h0-23,3,2,'#ffffff'); p(hx-8,h0-19,17,1,'#ff8ac8'); }
  // near arm: flexing bicep, pointing, pushing the glasses or holding them
  const A=J.A[1]; cArm(p,A,7,C.skinS,C.skin,C.skin,C.skinS);
  if(!fire&&!dn&&!st&&!push&&!atk&&!tk&&!s.heartEyes){ const mx=Math.round((A.x+A.kx)/2), my=Math.round((A.y+A.ky)/2)-3; p(mx-2,my,5,3,C.skinH); }
  if(s.noGlasses){ const x=Math.round(A.ex), y=Math.round(A.ey); p(x-1,y+1,7,3,fr); p(x,y+2,2,1,ln); p(x+3,y+2,2,1,ln); }
  if(s.form>=3) for(let i=0;i<3;i++){ const a=t*3+i*2.1; p(Math.round(Math.cos(a)*16)-2,h0-18+Math.round(Math.sin(a)*6),4,4,'#ff4aa0'); p(Math.round(Math.cos(a)*16)-1,h0-19+Math.round(Math.sin(a)*6),2,1,'#ffb0d8'); }
  if(dn) cStars(p,h0-26,t,'#ffe066'); else if(st) cStars(p,h0-26,t,'#ffe066',8); }

// ================= OMAR =================
function drawOmarCast(c,cx,by,f,s){ const p=SH(c,cx,by,f), t=s.t||0, fl=s.flash>0, dn=s.down>0, tk=cTalk('omar'), form=s.form||0;
  const C=cFlash({coat:'#15111b',coatL:'#2a2234',coatD:'#0a0810',trim:'#7a2ac0',trimH:'#b06aff',skin:'#cdb8b0',skinS:'#a8948c',shade:'#2a2030',chain:'#a8a8b8',chainS:'#6a6a7a'},fl);
  const st=s.stun>0, cast=s.cast>0, sc=!!s.scythe, sw=cFollow(s,'sw',s.swing?1:0,t,14), hv=dn?0:Math.sin(t*2.6+1)*2;
  const P={b:Math.round(hv),lean:0,F:[[-2,-5],[3,-6]],ua:[.2,.25+Math.sin(t*1.7)*.05],el:[.2,.3],hd:0,hx:0};
  if(dn){ P.b=10; P.lean=6; P.hd=6; P.hx=2; P.F=[[-8,0],[6,0]]; P.ua=[.5,.8]; P.el=[.2,.3]; }
  else if(st){ const w=Math.sin(t*5); P.lean=Math.round(w*3); P.hd=3; P.ua=[.2,.3]; }
  else if(sc){ P.ua[1]=-2.4+sw*4.0; P.el[1]=.4-sw*.3; P.ua[0]=-.6+sw*.6; P.el[0]=1.2; P.lean=Math.round(-2+sw*5); }
  else if(cast){ P.ua[1]=2.6+Math.sin(t*9)*.08; P.el[1]=.1; P.ua[0]=-.4; P.hd=-1; }
  else if(tk){ P.ua[1]=.9+Math.sin(t*3)*.3; P.el[1]=1.2; }
  const D={hip:30,torso:26,thigh:12,shin:12,uarm:11,farm:10,sep:3,ssep:9,neck:1}, J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy;
  // tattered wings (bigger from form 2)
  const wf=Math.round(Math.sin(t*6)*3), wy=sy-6;
  const wing=(dir,span,drop,col,edge)=>{ const pts=[[sx+dir*6,wy+2],[sx+dir*span*.55,wy-9-wf],[sx+dir*span,wy-4-wf*1.4]]; const n=5;
      for(let i=0;i<=n;i++){ const k=i/n, x=sx+dir*span*(1-k*.82), y=wy-4-wf*1.4*(1-k)+drop*(.55+.45*Math.sin(k*3.14))+(i%2?6:0); pts.push([x,y]); } pts.push([sx+dir*6,wy+12]); cPoly(p,pts,col);
      for(let i=0;i<3;i++){ const k=(i+1)/4; cSeg(p,sx+dir*7,wy+2,sx+dir*span*(1-k*.7),wy-3-wf*(1-k)+drop*.7,1,edge); } cSeg(p,sx+dir*6,wy+2,sx+dir*span*.55,wy-9-wf,1,edge); cSeg(p,sx+dir*span*.55,wy-9-wf,sx+dir*span,wy-4-wf*1.4,1,edge); };
  if(form>=2){ wing(-1,52,26,'#0a0610',C.trim); wing(1,48,24,'#0a0610',C.trim); }
  wing(-1,30,16,C.coat,C.coatL); wing(1,26,14,C.coatL,C.coat);
  // far arm, then the long coat over the legs
  cArm(p,J.A[0],5,C.coatD,C.coat,C.skinS);
  for(const L of J.L){ const x=Math.round(L.ex), y=Math.round(L.ey); p(x-2,y-6,5,6,C.coatD); p(x-3,y-1,6,2,'#2a2236'); }
  const hemY=-6+P.b, flap=k=>((k+Math.floor(t*6))%3)*2;
  cPoly(p,[[sx-11,sy],[sx+11,sy],[J.hx+12,hemY],[J.hx-13,hemY]],C.coat);
  cPoly(p,[[sx-11,sy],[sx-7,sy],[J.hx-9,hemY],[J.hx-13,hemY]],C.coatL); cPoly(p,[[sx+8,sy],[sx+11,sy],[J.hx+12,hemY],[J.hx+8,hemY]],C.coatD);
  for(let i=0;i<7;i++) p(J.hx-13+i*4,hemY,3,3+flap(i),i%2?C.coat:C.coatD);
  cSeg(p,sx,sy,J.hx,hemY-1,2,C.trim); cSeg(p,sx+1,sy,J.hx+1,hemY-1,1,C.trimH);
  p(J.hx-11,hy-12,22,2,C.chain); p(J.hx-9,hy-8,18,1,C.chainS); p(J.hx+3,hy-18,3,3,C.chain); for(let i=0;i<5;i++) p(J.hx-10+i*5,hy-12,1,2,C.chainS);
  // hood with the glowing eyes
  const hx=Math.round(J.headX), h0=Math.round(J.headY), ep=Math.sin(t*4)>0?'#ff2a3a':'#ff5a6a';
  cPoly(p,[[hx-10,h0+1],[hx-10,h0-12],[hx-5,h0-19],[hx+1,h0-22],[hx+4,h0-18],[hx+10,h0-12],[hx+9,h0+1]],C.coat);
  p(hx-9,h0-12,2,12,C.coatL); p(hx-1,h0-21,3,2,C.coatL);
  p(hx-6,h0-13,12,11,form>=3?'#000000':C.shade); p(hx-6,h0-4,12,3,form>=3?'#000000':C.skin); p(hx-6,h0-2,12,1,C.skinS);
  const eye=form>=3?'#ffffff':ep, bl=cBlink(t,2.2)&&form<3;
  if(!bl){ p(hx-5,h0-10,4,2,eye); p(hx+2,h0-10,4,2,eye); p(hx-5,h0-10,1,1,'#ffffff'); p(hx+2,h0-10,1,1,'#ffffff'); } else { p(hx-5,h0-9,4,1,'#5a1018'); p(hx+2,h0-9,4,1,'#5a1018'); }
  if(tk===2) p(hx-1,h0-4,4,2,'#3a1018');
  if(form>=3) for(let i=0;i<4;i++){ const a=t*2+i*1.57; p(Math.round(Math.cos(a)*20),h0-3+Math.round(Math.sin(a)*20),3,3,'#b06aff'); }
  // near arm: raised to conjure, or swinging the scythe
  const A=J.A[1];
  if(sc){ const sa=-2.7+sw*3.8, len=30, ex=A.ex+Math.sin(sa)*len*.8, ey=A.ey+Math.cos(sa)*len*.8, bx=A.ex-Math.sin(sa)*len*.2, byy=A.ey-Math.cos(sa)*len*.2;
    cSeg(p,bx,byy,ex,ey,3,'#1a1020'); cSeg(p,bx,byy,ex,ey,1,'#4a3a58'); p(Math.round(ex)-2,Math.round(ey)-2,4,4,C.trim);
    const ba=sa+1.75; for(let i=0;i<22;i++){ const k=i/22, x=ex+Math.sin(ba-k*1.1)*k*24, y=ey+Math.cos(ba-k*1.1)*k*24, w=Math.max(1,Math.round(4*(1-k)+.5));
      p(Math.round(x)-1,Math.round(y)-1,w,w,'#0c0812'); } for(let i=2;i<22;i++){ const k=i/22, x=ex+Math.sin(ba-k*1.1)*(k*24+1.5), y=ey+Math.cos(ba-k*1.1)*(k*24+1.5); p(Math.round(x),Math.round(y),1,1,i%4?C.trimH:'#ffffff'); }
    if(sw>.15&&sw<.95) for(let i=0;i<12;i++){ const k=i/12, a0=-2.4+sw*3.6-k*1.2, a1=a0-.1; cSeg(p,A.x+Math.sin(a0)*34,A.y+Math.cos(a0)*34,A.x+Math.sin(a1)*34,A.y+Math.cos(a1)*34,k<.3?3:2,'rgba(200,140,255,'+(.75*(1-k)).toFixed(2)+')'); } }
  cArm(p,A,5,C.coat,C.coatL,C.skin,C.skinS);
  if(cast&&!sc){ const x=Math.round(A.ex), y=Math.round(A.ey); p(x-4,y-5,9,4,'rgba(170,80,255,.7)'); p(x-2,y-7,5,2,'rgba(220,180,255,.8)'); if(Math.sin(t*12)>0) p(x-6,y-9,1,1,'#ffffff'); }
  if(dn) cStars(p,h0-26,t,'#c08aff'); else if(st) cStars(p,h0-26,t,'#c08aff',8); }

// ================= CAOMAR (the fusion): Omar's wings + scythe, Caotan's tank top, glasses and headband =================
function drawCaomarCast(c,cx,by,f,s){ const o=Object.assign({},s,{form:2,scythe:1}); drawOmarCast(c,cx,by,f,o); s._cf_sw=o._cf_sw; s._cf_swt=o._cf_swt;
  const p=SH(c,cx,by,f), t=s.t||0, y=Math.round(Math.sin(t*2.6+1)*2), hx=0, h0=-57+y;
  p(-11,-52+y,22,6,'#f6f3ec'); p(-11,-47+y,22,1,'#cfc8bb'); p(-3,-50+y,6,4,'#ff3a7a');
  p(hx-8,h0-13,7,6,'#14141e'); p(hx+1,h0-13,7,6,'#14141e'); p(hx-7,h0-12,5,4,s.glintT>0?'#ffffff':'#ffc8ec'); p(hx+2,h0-12,5,4,s.glintT>0?'#ffffff':'#ffc8ec'); p(hx-1,h0-11,2,1,'#14141e');
  p(hx-9,h0-24,18,3,'#22160f'); p(hx-9,h0-21,18,2,'#ffffff'); if(s.glintT>0){ const k=Math.round(s.glintT*10); p(hx+4-k,h0-11,8+2*k,1,'#ffffff'); p(hx+4,h0-15-k,1,9+2*k,'#ffffff'); } }

// ================= GRIMMAW =================
function drawGrimmawCast(c,cx,by,f,s){ const p=SH(c,cx,by,f), t=s.t||0, a=s.anim||'idle', fl=s.flash>0, tk=cTalk('grimmaw');
  const C=cFlash({pl:'#3d3849',plD:'#2a2633',plH:'#5a546a',plHH:'#7a7490',gd:'#cfa64a',gdD:'#8a7230',gdH:'#f0d07a',fur:'#1d1b24',furL:'#36323f',furH:'#4a4558',cape:'#3a1c40',capeD:'#2a1230',capeH:'#4b2550',gem:'#ff5a6a',blade:'#9aa0b2',bladeH:'#e8edff',grip:'#5b1d2a'},fl);
  let k='idle'; const P=cPose('idle',t,0);
  if(a==='charge'||a==='run'){ Object.assign(P,cPose('run',t*(a==='charge'?1.25:1),0)); P.lean=a==='charge'?6:3; }
  else if(a==='leapPrep'){ P.b=7; P.lean=3; P.F=[[-8,0],[7,0]]; }
  else if(a==='winded'){ P.b=5; P.lean=4; P.hd=3; P.F=[[-6,0],[5,0]]; P.ua[0]=.6; P.el[0]=.8; }
  else if(a==='howl'){ P.lean=-3; P.hd=-4; P.hx=-2; P.ua=[-1.0,-.9]; P.el=[.6,.4]; P.F=[[-6,0],[6,0]]; }
  else if(a==='windup'){ P.b=2; P.lean=-2; P.F=[[-7,0],[6,0]]; }
  else if(a==='slash'){ P.b=2; P.lean=Math.round(-2+(s.ap!=null?s.ap:1)*6); P.F=[[-7,0],[7,0]]; }
  else if(tk){ P.ua[0]=.6+Math.sin(t*3)*.3; P.el[0]=1.0; P.hd=Math.sin(t*6)>.5?1:0; }
  // sword angle, in screen terms (0 = straight ahead, negative = up), as before
  const ang=a==='windup'||a==='leapPrep'?-2.25:a==='slash'?(s.ap!=null?-2.25+s.ap*3.3:.9):a==='charge'?.12:a==='winded'?1.35:a==='howl'?-1.4:1.22;
  const sa=Math.PI/2-ang; P.ua[1]=sa*.55; P.el[1]=sa*.35;
  const D={hip:22,torso:30,thigh:11,shin:12,uarm:11,farm:10,sep:5,ssep:14,neck:2}, J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy;
  // cape billowing behind
  const cw=Math.round(Math.sin(t*3.5)*3)+(a==='charge'?4:0);
  cPoly(p,[[sx-10,sy-2],[sx-2,sy-2],[J.hx-6,-6],[J.hx-16-cw,-2],[J.hx-24-cw,-8]],C.cape); cPoly(p,[[sx-10,sy-2],[sx-6,sy-2],[J.hx-18-cw,-4],[J.hx-24-cw,-8]],C.capeD);
  for(let i=0;i<5;i++) p(J.hx-24-cw+i*4,-6+(i%2)*2,3,3,C.capeD); p(sx-12,sy-4,10,6,C.capeH);
  // far arm and legs (greaves with gold knee caps)
  cArm(p,J.A[0],7,C.plD,C.pl,C.fur,C.furL);
  const leg=(L,n)=>{ cSeg(p,L.x,L.y,L.kx,L.ky,9,n?C.plD:'#1e1b26',n?C.pl:C.plD); cSeg(p,L.kx,L.ky,L.ex,L.ey-3,8,n?C.plD:'#1e1b26',n?C.pl:C.plD);
    p(Math.round(L.kx)-4,Math.round(L.ky)-3,9,5,n?C.gd:C.gdD); p(Math.round(L.kx)-2,Math.round(L.ky)-2,3,1,C.gdH); const x=Math.round(L.ex), y=Math.round(L.ey); p(x-5,y-4,12,4,'#141118'); p(x+4,y-3,3,2,'#2a2633'); };
  leg(J.L[0],0); leg(J.L[1],1);
  // cuirass with a gold band and the crest gem
  cPoly(p,[[sx-15,sy],[sx+15,sy],[J.hx+12,hy],[J.hx-12,hy]],C.pl);
  cPoly(p,[[sx+7,sy],[sx+15,sy],[J.hx+12,hy],[J.hx+6,hy]],C.plD); cPoly(p,[[sx-15,sy],[sx-11,sy],[J.hx-9,hy-4],[J.hx-12,hy-4]],C.plH);
  p(J.hx-13,hy-4,26,4,C.gd); p(J.hx-13,hy-4,26,1,C.gdH); for(let i=0;i<4;i++) p(J.hx-11+i*7,hy,5,4,i%2?C.plD:C.pl);
  const gx=Math.round((sx+J.hx)/2); p(gx-6,sy+4,12,8,C.gd); p(gx-4,sy+6,8,4,'#6a1a2a'); p(gx-2,sy+7,4,2,C.gem); if(Math.sin(t*4)>.6) p(gx-1,sy+7,1,1,'#ffffff');
  // pauldrons
  p(sx-20,sy-4,12,9,C.pl); p(sx-20,sy-4,12,2,C.plH); p(sx+9,sy-4,13,9,C.pl); p(sx+9,sy-4,13,2,C.gd); p(sx+10,sy+3,11,2,C.plD);
  // wolf head with the gold crown
  const hx=Math.round(J.headX), h0=Math.round(J.headY), mo=a==='howl'||tk===2?3:a==='idle'||a==='winded'?0:1;
  p(hx-9,h0-18,19,18,C.fur); p(hx-9,h0-6,6,6,C.furL); p(hx-7,h0-17,6,3,C.furH);
  p(hx+8,h0-12,13,7,C.fur); p(hx+8,h0-12,13,1,C.furL); p(hx+19,h0-12,3,3,'#0a0910');
  p(hx+8,h0-5+mo,13,3,'#141118'); if(mo){ p(hx+9,h0-5,11,mo,'#5a1a2a'); }
  p(hx+9,h0-5,12,1,'#f2efe6'); for(let i=0;i<3;i++) p(hx+10+i*4,h0-4,1,2+(mo?1:0),'#f2efe6');
  p(hx-9,h0-27,6,10,C.fur); p(hx-8,h0-24,2,6,'#3a2030'); p(hx+3,h0-29,6,12,C.furL); p(hx+5,h0-26,2,7,'#5b1d2a');
  p(hx-8,h0-21,17,3,C.gd); p(hx-8,h0-25,3,4,C.gd); p(hx,h0-27,3,6,C.gd); p(hx+6,h0-25,3,4,C.gd); p(hx+1,h0-25,1,2,'#e84a5a'); p(hx-8,h0-21,17,1,C.gdH);
  const bl=cBlink(t,.4); p(hx+4,h0-14,4,3,a==='winded'?'#9a8440':bl?C.fur:'#ffe066'); p(hx+3,h0-15,6,1,'#0a0910'); if(!bl&&a!=='winded') p(hx+6,h0-14,1,1,'#ffffff');
  // near arm with the greatsword
  const A=J.A[1], ex=A.ex+Math.cos(ang)*62, ey=A.ey+Math.sin(ang)*62;
  cSeg(p,A.ex,A.ey,ex,ey,4,C.blade); cSeg(p,A.ex+Math.sin(ang)*1,A.ey-1,ex,ey-1,1,C.bladeH); cSeg(p,A.ex-Math.cos(ang)*9,A.ey-Math.sin(ang)*9,A.ex,A.ey,3,C.grip);
  p(Math.round(A.ex)-4,Math.round(A.ey)-4,8,8,C.gd); p(Math.round(A.ex)-2,Math.round(A.ey)-2,4,4,C.gem);
  if(a==='slash'&&s.ap!=null&&s.ap<.9) for(let i=1;i<14;i++){ const a0=ang-i*.08, a1=a0-.09, r=56; cSeg(p,A.ex+Math.cos(a0)*r,A.ey+Math.sin(a0)*r,A.ex+Math.cos(a1)*r,A.ey+Math.sin(a1)*r,i<5?4:i<9?3:2,'rgba(255,210,220,'+(.75-i*.05).toFixed(2)+')'); }
  cArm(p,A,7,C.plD,C.pl,C.fur,C.furL); }

// ================= HAMZA: the fairy pig and the giant pig =================
function drawFairyCast(c,cx,by,f,t,fl){ const p=SH(c,cx,by,f), tk=cTalk('hamza');
  const PK=fl?'#fff':'#f4a6c0', PD=fl?'#fff':'#d8809e', PH=fl?'#fff':'#ffd0e0', PS=fl?'#fff':'#b8607e', bob=Math.round(Math.sin(t*5)*1.5), w=Math.sin(t*28);
  // wings: two layers, 4-step flap
  const wy=-17+bob, wl=Math.round(w*3);
  cPoly(p,[[-2,wy],[-9,wy-6-wl],[-13,wy-3-wl],[-10,wy+1],[-3,wy+2]],'rgba(220,240,255,.85)'); cPoly(p,[[-1,wy+1],[-6,wy-3+wl],[-9,wy+2+wl],[-3,wy+3]],'rgba(170,210,255,.7)');
  p(-10,wy-4-wl,2,1,'#ffffff');
  // body
  ell(c,cx,by-10+bob,8,6,PD); ell(c,cx,by-11+bob,7,5,PK); ell(c,cx-2*f,by-13+bob,3,2,PH);
  const kk=Math.round(Math.sin(t*9)); p(-6,-6+bob,2,3+kk,PD); p(-2,-5+bob,2,3-kk,PD); p(2,-6+bob,2,3+kk,PD); p(4,-5+bob,2,3-kk,PD); p(-6,-4+bob+kk,2,1,PS); p(4,-3+bob-kk,2,1,PS);
  // head: snout, ears, blinking eye, little mouth
  ell(c,cx+6*f,by-14+bob,5,5,PK); ell(c,cx+10*f,by-13+bob,3,2.5,PD); p(10,-14+bob,1,1,'#7a3a4a'); p(11,-12+bob,1,1,'#7a3a4a');
  if(cBlink(t,.8)) p(5,-15+bob,2,1,'#1a1018'); else { p(5,-16+bob,2,2,'#1a1018'); p(5,-16+bob,1,1,'#fff'); }
  if(tk===2) p(8,-11+bob,2,2,'#7a2a3a'); else p(8,-11+bob,2,1,PS);
  const ew=Math.sin(t*2.3)>.8?1:0; p(3,-20+bob+ew,3,3,PD); p(7,-20+bob,2,3,PK); p(4,-19+bob+ew,1,1,PH);
  // curly tail, wagging
  const tw=Math.round(Math.sin(t*8)); p(-8,-12+bob+tw,2,1,PD); p(-9,-13+bob+tw,1,2,PD); p(-8,-14+bob+tw,2,1,PD);
  // halo, bobbing a beat behind
  const hb=Math.round(Math.sin(t*5-.6)*1.5); c.fillStyle='#ffe680'; for(let i=0;i<12;i++){ const a=i/12*6.283; c.fillRect(Math.round(cx+5*f+Math.cos(a)*4),Math.round(by-23+hb+Math.sin(a)*1.3),1,1); }
  if(Math.sin(t*3)>.85) p(Math.round(Math.sin(t*7)*9),-26+bob,1,1,'#ffffff'); }
function drawGiantPigCast(c,cx,by,f,s){ if(s.front) return CST.pig0(c,cx,by,f,s);
  const p=SH(c,cx,by,f), t=s.t||0, fl=!!s.flash, tk=cTalk('hamza');
  const PK=fl?'#fff':'#f09ab6', PD=fl?'#fff':'#c87090', PH=fl?'#fff':'#ffc8da', PS=fl?'#fff':'#a85878', DK='#5a2032', HO='#3a1a24';
  const br=Math.sin(t*2), bb=Math.round(br), sh=Math.round(Math.sin(t*1.3)*1.5);
  // legs: far pair darker, weight shifting, hooves
  [[-34,0],[16,0],[-18,1],[30,1]].forEach(([lx,n],i)=>{ const lift=Math.max(0,Math.round(Math.sin(t*1.3+i*1.6)*2)); const col=n?PD:PS;
    p(lx+sh*(n?1:-1),-24-lift,10,22,col); p(lx+sh*(n?1:-1),-24-lift,3,20,n?PK:PD); p(lx+sh*(n?1:-1),-5-lift,10,5,HO); p(lx+4+sh*(n?1:-1),-5-lift,1,5,DK); });
  // body with belly shading and a few bristles
  ell(c,cx-4*f,by-42+bb,48,30,PD); ell(c,cx-4*f,by-45+bb,46,27,PK); ell(c,cx-14*f,by-60+bb,20,7,PH); ell(c,cx-6*f,by-26+bb,36,6,PS);
  for(let i=0;i<6;i++) p(-30+i*9,-71+bb+Math.round(Math.abs(i-2.5)),1,3,PS);
  // tail: wagging curl
  const tw=Math.round(Math.sin(t*6)*2); p(-54,-52+bb+tw,4,3,PD); p(-58,-56+bb+tw,4,4,PD); p(-54,-60+bb+tw,4,3,PD); p(-57,-55+bb+tw,1,1,PK);
  // head
  const m=Math.max(s.mouth||0,tk===2?.25:0), jaw=Math.round(m*22), ef=Math.round(Math.sin(t*3)*1.5);
  ell(c,cx+40*f,by-56+bb,22,20,PK); ell(c,cx+34*f,by-64+bb,8,5,PH); ell(c,cx+40*f,by-42+bb,18,5,PD);
  // ears flopping
  cPoly(p,[[30,-70+bb],[38,-86+bb-ef],[42,-70+bb]],PD); cPoly(p,[[32,-72+bb],[37,-82+bb-ef],[40,-72+bb]],'#e07a98');
  cPoly(p,[[44,-70+bb],[52,-84+bb+ef],[56,-68+bb]],PK); cPoly(p,[[46,-71+bb],[51,-80+bb+ef],[53,-70+bb]],'#e8a0b8');
  if(cBlink(t,1.1)){ p(46,-62+bb,6,2,DK); } else { p(46,-64+bb,6,6,'#fff'); p(48,-63+bb,3,4,'#1a1018'); p(48,-63+bb,1,1,'#fff'); p(45,-66+bb,8,2,PD); }
  if(m>.05){ p(48,-52+bb,28,6,PK); p(50,-46+bb,24,jaw,'#3a0010'); p(52,-46+bb,20,Math.max(1,jaw-4),'#7a1020'); for(let i=0;i<5;i++){ p(52+i*4,-46+bb,2,3,'#f2efe6'); p(52+i*4,-49+jaw+3+bb,2,3,'#f2efe6'); } p(48,-46+jaw+bb,28,6,PD); p(62,-47+jaw+bb,6,2,'#ff6a8a'); }
  else { ell(c,cx+60*f,by-50+bb,10,8,'#e07a98'); ell(c,cx+60*f,by-51+bb,8,6,'#f0a0b8'); ell(c,cx+64*f,by-50+bb,2,3,DK); ell(c,cx+58*f,by-50+bb,2,3,DK); p(46,-40+bb,18,2,DK); p(62,-40+bb,2,1,DK); }
  if(s.drip){ for(let i=0;i<3;i++) p(52+i*6,-40+bb+(i%2),2,4+Math.floor((t*20+i*7)%8),'#9a0010'); }
  // the comically tiny wings and the halo
  const w=Math.round(Math.sin(t*20)*4); cPoly(p,[[-4,-70+bb],[-20,-82+bb-w],[-24,-76+bb-w],[-8,-66+bb]],'rgba(220,240,255,.85)'); cPoly(p,[[-6,-68+bb],[-16,-74+bb+w],[-18,-70+bb+w]],'rgba(170,210,255,.7)');
  c.fillStyle='#ffe680'; for(let i=0;i<28;i++){ const a=i/28*6.283; c.fillRect(Math.round(cx+40*f+Math.cos(a)*14),Math.round(by-90+bb+Math.sin(a)*4),2,2); } }

// ================= HOUND SOLDIERS (spear / archer / shaman), THE TRAINING DUMMY, BABIES, ALI'S DESCENDANTS =================
function drawHoundCast(c,cx,by,f,s,arch){ const p=SH(c,cx,by,f), t=s.t||0, a=s.anim||'idle', fl=s.flash>0, sham=arch==='shaman', archer=arch&&!sham;
  const C=cFlash({fur:'#757079',furD:'#57525e',furH:'#948f99',arm:sham?'#4a2a6a':archer?'#4d6038':'#7c2a36',armD:sham?'#33184a':archer?'#37452a':'#5a1e28',armH:sham?'#6a4a8a':archer?'#6a8050':'#9a3a48',plate:'#5d5a68',plateH:'#8a8796',gold:'#c9a24a',pants:'#2c2830',pantsD:'#24212a',boot:'#18151c'},fl);
  const k=a==='run'?'run':a==='tell'?'charge':a==='lunge'?'dash':a==='hurt'?'hurt':'idle', P=cPose(k,t,0);
  if(a==='tell'){ P.b=2; P.lean=-1; } if(a==='lunge'){ P.lean=5; P.b=1; }
  const D={hip:11,torso:14,thigh:5,shin:6,uarm:5,farm:5,sep:2,ssep:5,neck:1}, J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy;
  // tail wagging (stiffens on a tell)
  const tw=a==='tell'?0:Math.round(Math.sin(t*9)*1.5); p(J.hx-9,hy-5+tw,5,3,C.furD); p(J.hx-12,hy-7+tw,4,2,C.fur); p(J.hx-13,hy-8+tw,2,1,C.furH);
  cArm(p,J.A[0],3,C.armD,C.armD,C.furD);
  cLeg(p,J.L[0],4,C.pantsD,C.pantsD,C.boot,null,5); cLeg(p,J.L[1],4,C.pantsD,C.pants,C.boot,'#2a2630',5);
  { const L=J.L[1]; p(Math.round(L.kx)-2,Math.round(L.ky)-1,4,2,C.plate); }
  // tabard + breastplate
  cPoly(p,[[sx-8,sy],[sx+8,sy],[J.hx+7,hy+1],[J.hx-7,hy+1]],C.arm); cPoly(p,[[sx+3,sy],[sx+8,sy],[J.hx+7,hy+1],[J.hx+3,hy+1]],C.armD); cPoly(p,[[sx-8,sy],[sx-6,sy],[J.hx-5,hy+1],[J.hx-7,hy+1]],C.armH);
  p(J.hx-7,hy-5,15,2,C.gold); p(J.hx-2,hy-4,4,5,C.arm); p(sx-3,sy+2,6,5,C.gold); p(sx-2,sy+3,4,3,C.armD);
  p(sx-10,sy-2,7,4,C.plate); p(sx+4,sy-2,7,4,C.plate); p(sx+4,sy-2,7,1,C.plateH); p(sx-10,sy-2,7,1,C.plateH);
  // wolf head in profile
  const hx=Math.round(J.headX), h0=Math.round(J.headY), mo=a==='tell'||a==='lunge'?2:0;
  p(hx-5,h0-11,11,11,C.fur); p(hx-5,h0-11,3,9,C.furD); p(hx-2,h0-11,6,2,C.furH);
  p(hx+4,h0-7,8,4,C.fur); p(hx+4,h0-7,8,1,C.furH); p(hx+4,h0-3+mo,8,2,C.furD); p(hx+11,h0-7,2,2,'#141118');
  if(mo){ p(hx+5,h0-3,7,mo,'#5a1a24'); p(hx+5,h0-3,7,1,'#f2efe6'); p(hx+6,h0-2+mo,1,1,'#f2efe6'); p(hx+10,h0-2+mo,1,1,'#f2efe6'); }
  p(hx-5,h0-16,3,6,C.furD); p(hx-4,h0-14,1,3,'#3a2a30'); p(hx+1,h0-17,3,7,C.fur); p(hx+2,h0-15,1,4,'#5a3a40');
  const bl=cBlink(t,cx*.21); p(hx+3,h0-8,2,2,bl?C.furD:a==='tell'?'#ff4a2a':'#ffd45a'); p(hx+2,h0-9,4,1,'#2a2430');
  // weapon + near arm
  const A=J.A[1];
  if(sham){ const x=Math.round(A.ex)+1; p(x,-40,2,40,'#5a3a2a'); const og=a==='tell'?4:3; ell(c,cx+(x+1)*f,by-43,og,og,'#ff3a4a'); R(c,cx+(x+1)*f-1,by-44,2,2,'#ffd0d0'); if(a==='tell') for(let i=0;i<3;i++){ const aa=t*8+i*2.1; p(x+Math.round(Math.cos(aa)*6),-43+Math.round(Math.sin(aa)*6),1,1,'#ff9aa0'); } }
  else if(archer){ const x=Math.round(A.ex), y=Math.round(A.ey), dr=a==='tell'?3:0; for(let i=-7;i<=7;i++) p(x+Math.round(2-Math.abs(i)*.25)+(dr?0:0),y+i,1,1,'#8a6a3a'); cSeg(p,x+1,y-7,x-dr,y,1,'#ede4cf'); cSeg(p,x-dr,y,x+1,y+7,1,'#ede4cf'); if(dr) p(x-dr,y,9,1,'#c8cbd6'); }
  else { const ang=a==='lunge'?0:a==='tell'?-.45:-1.25, hx2=A.ex, hy2=A.ey; cSeg(p,hx2-Math.cos(ang)*10,hy2-Math.sin(ang)*10,hx2+Math.cos(ang)*17,hy2+Math.sin(ang)*17,2,'#6b4a2b');
    const tx=hx2+Math.cos(ang)*17, ty=hy2+Math.sin(ang)*17; p(Math.round(tx)-2,Math.round(ty)-2,5,4,'#c8cbd6'); p(Math.round(tx),Math.round(ty)-1,2,2,'#ffffff'); }
  cArm(p,A,3,C.armD,C.arm,C.fur,C.furD); }
function drawDummyCast(c,cx,by,s){ const t=s.t||0, hit=s.flash>0, w=hit?Math.sin(t*40)*.18:Math.sin(t*1.3)*.03;
  const p=(x,y,ww,hh,col)=>{ const yy=-y; const sx2=Math.round(x+Math.sin(w)*yy*.9); R(c,cx+sx2,by+y,ww,hh,col); };
  p(-1,-26,3,26,'#6b4a2b'); p(0,-26,1,26,'#8a6a3a'); p(-4,-3,9,3,'#4a3420');
  p(-10,-20,20,3,'#6b4a2b'); p(-10,-20,20,1,'#8a6a3a'); p(-12,-20,3,6,'#d6b468'); p(10,-20,3,6,'#d6b468'); p(-12,-15,3,1,'#bf9a54'); p(10,-15,3,1,'#bf9a54');
  p(-8,-24,16,10,'#d6b468'); p(-8,-24,3,10,'#bf9a54'); p(-8,-18,16,1,'#8a6a34'); p(-8,-16,16,1,'#8a6a34'); p(-2,-24,1,10,'#bf9a54');
  p(-7,-38,14,14,'#d6b468'); p(4,-34,8,6,'#bf9a54'); p(-7,-38,3,13,'#bf9a54'); p(-3,-38,8,2,'#e6c888');
  p(-7,-42,4,4,'#bf9a54'); p(2,-42,4,4,'#d6b468'); p(3,-41,2,2,'#bf9a54');
  p(3,-34,2,2,hit?'#ff4a4a':'#2a1d16'); p(-4,-34,2,2,hit?'#ff4a4a':'#2a1d16'); p(10,-32,2,1,'#2a1d16'); p(-2,-29,7,1,'#8a6a34'); p(-1,-28,1,1,'#8a6a34'); p(3,-28,1,1,'#8a6a34');
  p(-6,-31,1,4,'#e6c888'); p(6,-26,2,1,'#e6c888');
  if(hit){ for(let i=0;i<4;i++) R(c,cx+Math.round(Math.sin(t*20+i*1.7)*12),by-20-Math.round(Math.abs(Math.cos(t*13+i))*20),1,2,'#e6c888'); } }
function drawBabyCast(c,cx,by,f,s){ const p=SH(c,cx,by,f), i=s.i||0, sk=['#e8b48a','#d89a70','#c8865e','#f0c8a0'][i%4], skS=cShade(sk,-.18), hair=i%3===0?'#f0d070':'#1a1210', ears=i%2===0;
  // swaddle, little arms up
  ell(c,cx,by-4,5,4,'#d8d2c4'); ell(c,cx,by-5,5,3,'#f4f0e8'); p(-4,-6,8,1,['#9fd8ff','#ffb0d0','#c8f0a0','#ffe680'][i%4]);
  p(-6,-11,2,4,sk); p(4,-11,2,4,sk); p(-6,-12,2,1,skS); p(4,-12,2,1,skS);
  ell(c,cx,by-13,5,5,skS); ell(c,cx-1*f,by-14,4,4,sk); p(-4,-19,9,3,hair); if(i%5===0) p(0,-21,2,3,hair);
  if(ears){ p(-4,-22,3,4,hair); p(3,-22,3,4,hair); p(-3,-21,1,2,'#f0a0b0'); p(4,-21,1,2,'#f0a0b0'); }
  p(-2,-15,2,2,'#1a1210'); p(2,-15,2,2,'#1a1210'); p(-2,-15,1,1,'#ffffff'); p(2,-15,1,1,'#ffffff');
  p(0,-11,2,1,i%7===0?'#ff6a7a':'#a05040'); p(-4,-12,2,1,'#f6a0b0'); p(4,-12,2,1,'#f6a0b0'); if(i%9===0) p(-5,-13,1,1,'#ff9ab0'); }
function drawAliKidCast(c,cx,by,f,s){ const p=SH(c,cx,by,f), t=s.t||0, i=s.i||0, ears=i%3!==1, hat=i%4===0, tk=cTalk('kids')||cTalk('kid14');
  const cloth=['#2e8a7e','#1c1a2a','#8a1a2a','#4a6fa8','#d0a03a'][i%5], clS=cShade(cloth,-.25), hair=i%2?'#e8cf98':'#14101a', hairS=cShade(hair,-.25);
  const ph=t*7+i, run=Math.sin(ph), hop=Math.round(Math.abs(Math.sin(ph))*2), lg=Math.round(run*2);
  p(-3-lg,-6-hop,3,6-(lg>0?1:0),'#2a2438'); p(1+lg,-6-hop,3,6-(lg<0?1:0),'#2a2438'); p(-3-lg,-1-hop,3,1,'#1a1420'); p(1+lg,-1-hop,4,1,'#1a1420');
  p(-4,-13-hop,8,8,cloth); p(1,-13-hop,3,8,clS); p(-4,-9-hop,8,1,'#e8e4dc');
  const ar=Math.round(Math.sin(ph+1.5)*2); p(-6,-12-hop-ar,2,4,cloth); p(4,-12-hop+ar,2,4,cloth); p(-6,-9-hop-ar,2,2,'#d8a07a'); p(4,-9-hop+ar,2,2,'#d8a07a');
  p(-3,-19-hop,7,6,'#d8a07a'); p(2,-19-hop,2,5,'#ecbc94'); p(-3,-20-hop,7,2,hair); p(-4,-19-hop,2,3,hairS);
  p(1,-17-hop,1,1,i%4===2?'#ff2a3a':'#2a1a10'); p(-2,-17-hop,1,1,'#2a1a10'); if(tk===2&&(i+Math.floor(t*6))%2) p(-1,-15-hop,3,2,'#5a1a24'); else p(-1,-15-hop,2,1,'#7a3a2a');
  if(ears){ p(-4,-23-hop,2,3,hair); p(2,-23-hop,2,3,hair); p(-3,-22-hop,1,1,'#e89aa8'); p(3,-22-hop,1,1,'#e89aa8'); }
  if(hat){ p(-7,-21-hop,14,1,'#9a7a3a'); p(-5,-22-hop,10,1,'#c8a860'); p(-2,-23-hop,4,1,'#e2c47a'); }
  if(i%5===3){ pline(c,cx-2*f,by-8-hop,cx-9*f,by-4-hop,'#0c0a10',1); pline(c,cx-2*f,by-9-hop,cx-8*f,by-6-hop,'#3a3048',1); } }

// ================= hook everything up (callers keep using the old names) =================
CST.pig0=drawGiantPig;
drawAliHD=drawAliCast; drawMiraHD=drawMiraCast; drawVillagerHD=drawVillagerCast; drawNathanPilot=drawNathanCast; drawGrimmawHD=drawGrimmawCast;
drawCaotanHD=drawCaotanCast; drawCaotanBoss=drawCaotanCast; drawOmarHD=drawOmarCast; drawOmarBoss=drawOmarCast; drawCaomar=drawCaomarCast;
drawHamzaFairy=drawFairyCast; drawGiantPig=drawGiantPigCast;
drawHoundHD=drawHoundCast; drawDummyHD=drawDummyCast; drawBaby=drawBabyCast; drawAliKid=drawAliKidCast;
