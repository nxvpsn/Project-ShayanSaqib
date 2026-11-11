// =====================================================================
// CAST REDRAWS (in code, one character at a time; a redraw replaces the old painter only once the owner has approved its
// preview). Same rig, same poses and state flags as the painter it replaces, so every move and cutscene keeps working.
//   drawOmarV2: Omar the Edge. A deep cowl with the face lost in it, lit jaw, eyes that bleed light; a long coat in five
//   tones with folds that sway, a violet lining at the opening, a belt and a chain of real links, a hem in long tatters;
//   feathered shoulder wings in rows; bell sleeves and bony hands; a scythe with a wrapped shaft and a blade that goes
//   from black through violet to a white edge.
// =====================================================================
function drawOmarV2(c,cx,by,f,s){ const p=SH(c,cx,by,f), t=s.t||0, fl=s.flash>0, dn=s.down>0, tk=cTalk('omar'), form=s.form||0;
  const C=cFlash({k0:'#07050b',k1:'#110d18',k2:'#1b1526',k3:'#2a2238',k4:'#3d3352',lin:'#4a1a86',linH:'#7a2ac0',trim:'#9a4aff',trimH:'#d0a8ff',skin:'#d4c0b8',skinS:'#a8948c',skinD:'#7a6a70',chain:'#b8b8c8',chainS:'#6a6a7a',steel:'#2a2436',edge:'#f4ecff'},fl);
  const st=s.stun>0, cast=s.cast>0, sc=!!s.scythe, sw=cFollow(s,'sw',s.swing?1:0,t,14), hv=dn?0:Math.sin(t*2.6+1)*2;
  const P={b:Math.round(hv),lean:0,F:[[-2,-5],[3,-6]],ua:[.2,.25+Math.sin(t*1.7)*.05],el:[.2,.3],hd:0,hx:0};
  if(dn){ P.b=10; P.lean=6; P.hd=6; P.hx=2; P.F=[[-8,0],[6,0]]; P.ua=[.5,.8]; P.el=[.2,.3]; }
  else if(st){ const w=Math.sin(t*5); P.lean=Math.round(w*3); P.hd=3; P.ua=[.2,.3]; }
  else if(sc){ P.ua[1]=-2.4+sw*4.0; P.el[1]=.4-sw*.3; P.ua[0]=-.6+sw*.6; P.el[0]=1.2; P.lean=Math.round(-2+sw*5); }
  else if(cast){ P.ua[1]=2.6+Math.sin(t*9)*.08; P.el[1]=.1; P.ua[0]=-.4; P.hd=-1; }
  else if(tk){ P.ua[1]=.9+Math.sin(t*3)*.3; P.el[1]=1.2; }
  const D={hip:30,torso:26,thigh:12,shin:12,uarm:11,farm:10,sep:3,ssep:9,neck:1}, J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy, sway=Math.sin(t*2.2);
  // ---- the wings: three rows of feathers each, dark to lit
  const wf=Math.round(Math.sin(t*6)*3), wy=sy-6;
  const wing=(dir,span,drop,big)=>{ const tones=big?[C.k0,C.k1,C.lin]:[C.k1,C.k2,C.k3];
    for(let r=0;r<3;r++){ const n=big?7:5, sp=span*(1-r*.2), dr=drop*(1-r*.22); for(let i=n;i>=0;i--){ const k=i/n, x=sx+dir*(6+sp*k), y=wy-2-wf*k*1.3-Math.sin(k*3.14)*(big?10:7)+r*2, len=dr*(.45+.55*Math.sin(Math.min(1,k*1.15)*3.14))+(i%2?3:0), w=Math.max(2,Math.round(sp/n)+1);
        for(let q=0;q<len;q++){ const ww=Math.max(1,Math.round(w*(1-q/len*.75))); p(Math.round(x-ww/2),Math.round(y+q),ww,1,tones[r]); } p(Math.round(x-w/2),Math.round(y),1,Math.max(1,Math.round(len*.6)),r===2?(big?C.linH:C.k4):tones[Math.min(2,r+1)]); } }
    cSeg(p,sx+dir*6,wy+1,sx+dir*span*.55,wy-9-wf,2,big?C.k1:C.k3); cSeg(p,sx+dir*span*.55,wy-9-wf,sx+dir*(6+span),wy-3-wf*1.3,1,big?C.lin:C.k4); p(Math.round(sx+dir*span*.55)-1,wy-10-wf,3,3,big?C.trim:C.k4); };
  if(form>=2){ wing(-1,52,28,1); wing(1,48,26,1); }
  wing(-1,30,17,0); wing(1,26,15,0);
  // ---- far arm (bell sleeve), boots
  { const A=J.A[0]; cSeg(p,A.x,A.y,A.kx,A.ky,5,C.k1,C.k0); cSeg(p,A.kx,A.ky,A.ex,A.ey,6,C.k1,C.k0); const x=Math.round(A.ex), y=Math.round(A.ey); p(x-3,y-1,7,3,C.k0); p(x-1,y+1,3,3,C.skinS); p(x-1,y+3,1,2,C.skinD); p(x+1,y+3,1,2,C.skinD); }
  for(const Lg of J.L){ const x=Math.round(Lg.ex), y=Math.round(Lg.ey); p(x-2,y-7,5,7,C.k0); p(x-3,y-2,7,2,C.k2); p(x-3,y-2,7,1,C.k3); p(x+2,y-1,2,1,C.k4); }
  // ---- the coat: body, folds, lining, tatters
  const hemY=-6+P.b, L0=J.hx-13, R0=J.hx+12;
  cPoly(p,[[sx-11,sy],[sx+11,sy],[R0,hemY],[L0,hemY]],C.k1);
  cPoly(p,[[sx-11,sy],[sx-8,sy],[L0+3,hemY],[L0,hemY]],C.k3); cPoly(p,[[sx-8,sy],[sx-6,sy],[L0+6,hemY],[L0+3,hemY]],C.k2);     /* the lit side */
  cPoly(p,[[sx+7,sy],[sx+11,sy],[R0,hemY],[R0-5,hemY]],C.k0);                                                                   /* the dark side */
  for(let i=0;i<5;i++){ const k=(i+1)/6, x0=sx-9+k*18, x1=L0+2+k*(R0-L0-3)+sway*(i%2?1.5:-1.5), y0=sy+10+(i%2)*6; cSeg(p,x0,y0,x1,hemY-1,1,i%2?C.k0:C.k2); }   /* folds, swaying */
  cPoly(p,[[sx-2,sy+2],[sx+3,sy+2],[J.hx+5+sway,hemY],[J.hx-3+sway,hemY]],C.lin); cSeg(p,sx-2,sy+2,J.hx-3+sway,hemY,1,C.linH); cSeg(p,sx+3,sy+2,J.hx+5+sway,hemY,1,C.k0);   /* the violet lining at the opening */
  cSeg(p,sx,sy+2,J.hx+1+sway,hemY-1,1,C.trimH);
  for(let i=0;i<9;i++){ const x=L0+i*3, len=3+((i*5+Math.floor(t*5))%4)*2+(i%3===0?4:0); p(x,hemY,2,len,i%3?C.k1:C.k0); p(x,hemY,1,Math.max(1,len-2),i%3===1?C.k2:C.k1); if(i===4||i===5) p(x,hemY,2,len-1,C.lin); }
  // collar, belt, buckle, the chain in links
  cPoly(p,[[sx-11,sy],[sx+11,sy],[sx+7,sy+5],[sx-7,sy+5]],C.k2); p(sx-10,sy,20,1,C.k4); p(sx-4,sy+3,9,2,C.lin); p(sx-1,sy+2,3,3,C.trim); p(sx,sy+3,1,1,C.trimH);
  p(J.hx-12,hy-13,24,3,C.k0); p(J.hx-12,hy-13,24,1,C.k3); p(J.hx-3,hy-14,6,5,C.chainS); p(J.hx-2,hy-13,4,3,C.chain); p(J.hx-1,hy-12,2,1,C.k0);
  for(let i=0;i<8;i++){ const k=i/7, x=J.hx-10+k*18, y=hy-9+Math.round(Math.sin(k*3.14)*4+sway*(.5-Math.abs(k-.5))); p(Math.round(x),y,2,2,i%2?C.chain:C.chainS); p(Math.round(x),y,1,1,'#ffffff'); }
  // ---- the cowl: the face is down inside it
  const hx=Math.round(J.headX), h0=Math.round(J.headY), ep=Math.sin(t*4)>0?'#ff2a3a':'#ff5a6a', dark=form>=3?'#000000':'#0c0812';
  cPoly(p,[[hx-11,h0+2],[hx-11,h0-11],[hx-7,h0-18],[hx-1,h0-23],[hx+3,h0-22],[hx+7,h0-17],[hx+11,h0-11],[hx+10,h0+2]],C.k1);
  cPoly(p,[[hx-11,h0+2],[hx-11,h0-11],[hx-7,h0-18],[hx-4,h0-20],[hx-7,h0-11],[hx-8,h0+2]],C.k3); p(hx-10,h0-10,1,10,C.k4); p(hx-2,h0-23,4,1,C.k4);     /* the lit rim */
  cPoly(p,[[hx+6,h0-17],[hx+11,h0-11],[hx+10,h0+2],[hx+7,h0+2],[hx+8,h0-10]],C.k0); cSeg(p,hx+1,h0-22,hx+5,h0-12,1,C.k0); cSeg(p,hx-4,h0-20,hx-6,h0-12,1,C.k2);
  cPoly(p,[[hx-7,h0-1],[hx-7,h0-11],[hx-3,h0-15],[hx+3,h0-15],[hx+7,h0-11],[hx+7,h0-1]],dark);                                    /* the opening */
  if(form<3){ p(hx-5,h0-5,10,4,C.skinS); p(hx-4,h0-5,7,3,C.skin); p(hx-5,h0-2,10,1,C.skinD); p(hx+3,h0-5,2,3,C.skinD); p(hx-2,h0-3,4,1,tk===2?'#3a1018':C.skinD); if(tk===2) p(hx-1,h0-2,3,1,'#3a1018'); p(hx-6,h0-6,12,1,'#1a1220'); }
  const eye=form>=3?'#ffffff':ep, bl=cBlink(t,2.2)&&form<3;
  if(!bl){ for(const ex of [hx-5,hx+2]){ p(ex-1,h0-11,6,4,form>=3?'rgba(255,255,255,.25)':'rgba(255,40,60,.28)'); p(ex,h0-10,4,2,eye); p(ex+(ex<hx?0:2),h0-10,2,1,'#ffffff'); p(ex+1,h0-8,1,2+(Math.floor(t*3+ex)%2),form>=3?'rgba(255,255,255,.5)':'rgba(255,60,80,.55)'); } }
  else { p(hx-5,h0-9,4,1,'#5a1018'); p(hx+2,h0-9,4,1,'#5a1018'); }
  if(form>=3) for(let i=0;i<4;i++){ const a=t*2+i*1.57; p(Math.round(Math.cos(a)*20),h0-3+Math.round(Math.sin(a)*20),3,3,'#b06aff'); }
  // ---- near arm and the scythe
  const A=J.A[1];
  if(sc){ const sa=-2.7+sw*3.8, len=32, ex=A.ex+Math.sin(sa)*len*.8, ey=A.ey+Math.cos(sa)*len*.8, bx=A.ex-Math.sin(sa)*len*.25, byy=A.ey-Math.cos(sa)*len*.25;
    cSeg(p,bx,byy,ex,ey,3,C.k0); cSeg(p,bx,byy,ex,ey,1,C.k4); for(let i=1;i<6;i++){ const k=i/6; p(Math.round(bx+(ex-bx)*k)-1,Math.round(byy+(ey-byy)*k)-1,3,2,i%2?C.lin:C.chainS); } p(Math.round(bx)-2,Math.round(byy)-2,4,4,C.chainS); p(Math.round(bx)-1,Math.round(byy)-1,2,2,C.trim);
    p(Math.round(ex)-3,Math.round(ey)-3,6,6,C.steel); p(Math.round(ex)-2,Math.round(ey)-2,4,4,C.trim); p(Math.round(ex)-1,Math.round(ey)-1,2,2,C.trimH);
    const ba=sa+1.75, N=26; for(let i=0;i<N;i++){ const k=i/N, a=ba-k*1.15, r=k*27, w=Math.max(1,Math.round(6*(1-k*k)+.5)); for(let q=0;q<w;q++){ const rr=r, ox=Math.sin(a+1.57)*q*-1, oy=Math.cos(a+1.57)*q*-1; p(Math.round(ex+Math.sin(a)*rr+ox),Math.round(ey+Math.cos(a)*rr+oy),2,2,q===0?C.edge:q===1?C.trimH:q<3?C.lin:C.steel); } }
    for(let i=3;i<N;i+=5){ const k=i/N, a=ba-k*1.15; p(Math.round(ex+Math.sin(a)*(k*27+2)),Math.round(ey+Math.cos(a)*(k*27+2)),1,1,'#ffffff'); }
    if(sw>.15&&sw<.95) for(let i=0;i<14;i++){ const k=i/14, a0=-2.4+sw*3.6-k*1.2, a1=a0-.1; cSeg(p,A.x+Math.sin(a0)*36,A.y+Math.cos(a0)*36,A.x+Math.sin(a1)*36,A.y+Math.cos(a1)*36,k<.3?3:2,'rgba(200,140,255,'+(.75*(1-k)).toFixed(2)+')'); cSeg(p,A.x+Math.sin(a0)*38,A.y+Math.cos(a0)*38,A.x+Math.sin(a1)*38,A.y+Math.cos(a1)*38,1,'rgba(255,255,255,'+(.6*(1-k)).toFixed(2)+')'); } }
  cSeg(p,A.x,A.y,A.kx,A.ky,5,C.k2,C.k3); cSeg(p,A.kx,A.ky,A.ex,A.ey,6,C.k2,C.k3); { const x=Math.round(A.ex), y=Math.round(A.ey); p(x-3,y-2,7,3,C.k1); p(x-3,y-2,7,1,C.k4); p(x-2,y+1,4,3,C.skin); p(x+1,y+1,1,3,C.skinS); p(x-2,y+4,1,2,C.skin); p(x,y+4,1,2,C.skinS); p(x-3,y,1,1,C.lin); }
  if(cast&&!sc){ const x=Math.round(A.ex), y=Math.round(A.ey); for(let r=6;r>0;r-=2) p(x-r,y-4-r,r*2+1,r,'rgba(170,80,255,'+(.25+.1*(6-r)).toFixed(2)+')'); p(x-2,y-8,5,3,'rgba(230,200,255,.9)'); p(x-1,y-7,2,1,'#ffffff'); for(let i=0;i<3;i++){ const a=t*8+i*2.1; p(x+Math.round(Math.cos(a)*7),y-6+Math.round(Math.sin(a)*4),1,1,'#ffffff'); } }
  if(dn) cStars(p,h0-28,t,'#c08aff'); else if(st) cStars(p,h0-28,t,'#c08aff',8); }
