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
  if(form>=3){ /* what is left of the moon hangs behind his head: a bitten crescent */ for(let i=0;i<44;i++){ const a=-2.2+i/43*4.6, r=19+Math.sin(t*3+i)*.4, w=Math.max(1,Math.round(4*Math.sin(i/43*3.14)+1)); p(hx+Math.round(Math.sin(a)*r)-1,h0-9-Math.round(Math.cos(a)*r)-1,w,w,i%7===3?'#9aa6d0':'#eef2ff'); } }
  if(form>=2){ /* horns of hardened shadow, violet at the tips */ for(const d of [-1,1]){ cSeg(p,hx+d*6,h0-18,hx+d*12,h0-24,3,C.k0); cSeg(p,hx+d*12,h0-24,hx+d*13,h0-31,2,C.k0); cSeg(p,hx+d*6,h0-18,hx+d*12,h0-24,1,C.k3); p(hx+d*13-1,h0-33,2,3,C.trim); p(hx+d*13-1,h0-33,1,1,C.trimH); } }
  cPoly(p,[[hx-11,h0+2],[hx-11,h0-11],[hx-7,h0-18],[hx-1,h0-23],[hx+3,h0-22],[hx+7,h0-17],[hx+11,h0-11],[hx+10,h0+2]],C.k1);
  cPoly(p,[[hx-11,h0+2],[hx-11,h0-11],[hx-7,h0-18],[hx-4,h0-20],[hx-7,h0-11],[hx-8,h0+2]],C.k3); p(hx-10,h0-10,1,10,C.k4); p(hx-2,h0-23,4,1,C.k4);     /* the lit rim */
  cPoly(p,[[hx+6,h0-17],[hx+11,h0-11],[hx+10,h0+2],[hx+7,h0+2],[hx+8,h0-10]],C.k0); cSeg(p,hx+1,h0-22,hx+5,h0-12,1,C.k0); cSeg(p,hx-4,h0-20,hx-6,h0-12,1,C.k2);
  cPoly(p,[[hx-7,h0-1],[hx-7,h0-11],[hx-3,h0-15],[hx+3,h0-15],[hx+7,h0-11],[hx+7,h0-1]],dark);                                    /* the opening */
  if(form<3){ p(hx-5,h0-5,10,4,C.skinS); p(hx-4,h0-5,7,3,C.skin); p(hx-5,h0-2,10,1,C.skinD); p(hx+3,h0-5,2,3,C.skinD); p(hx-2,h0-3,4,1,tk===2?'#3a1018':C.skinD); if(tk===2) p(hx-1,h0-2,3,1,'#3a1018'); p(hx-6,h0-6,12,1,'#1a1220'); }
  if(form>=3){ for(let i=0;i<7;i++){ const x=hx-6+Math.floor(hash(i,3)*12), y=h0-14+Math.floor(hash(3,i)*12); if(Math.sin(t*5+i*2)>-.3) p(x,y,1,1,i%3?'#b06aff':'#ffffff'); } } /* stars in the void where his face was */
  const eye=form>=3?'#ffffff':ep, bl=cBlink(t,2.2)&&form<3;
  if(!bl){ for(const ex of [hx-5,hx+2]){ p(ex-1,h0-11,6,4,form>=3?'rgba(255,255,255,.25)':'rgba(255,40,60,.28)'); p(ex,h0-10,4,2,eye); p(ex+(ex<hx?0:2),h0-10,2,1,'#ffffff'); p(ex+1,h0-8,1,2+(Math.floor(t*3+ex)%2),form>=3?'rgba(255,255,255,.5)':'rgba(255,60,80,.55)'); } }
  else { p(hx-5,h0-9,4,1,'#5a1018'); p(hx+2,h0-9,4,1,'#5a1018'); }
  if(form>=3) for(let i=0;i<4;i++){ const a=t*2+i*1.57; p(Math.round(Math.cos(a)*20),h0-3+Math.round(Math.sin(a)*20),3,3,'#b06aff'); }
  // ---- near arm and the scythe
  const A=J.A[1];
  if(sc){ const sa=-2.7+sw*3.8, len=50, ex=A.ex+Math.sin(sa)*len*.66, ey=A.ey+Math.cos(sa)*len*.66, bx=A.ex-Math.sin(sa)*len*.34, byy=A.ey-Math.cos(sa)*len*.34; /* a staff: as long as he is tall, held a third of the way up */
    cSeg(p,bx,byy,ex,ey,3,C.k0); cSeg(p,bx,byy,ex,ey,1,C.k4); for(let i=1;i<9;i++){ const k=i/9; p(Math.round(bx+(ex-bx)*k)-1,Math.round(byy+(ey-byy)*k)-1,3,2,i%2?C.lin:C.chainS); } p(Math.round(bx)-2,Math.round(byy)-2,4,4,C.chainS); p(Math.round(bx)-1,Math.round(byy)-1,2,2,C.trim);
    p(Math.round(ex)-3,Math.round(ey)-3,6,6,C.steel); p(Math.round(ex)-2,Math.round(ey)-2,4,4,C.trim); p(Math.round(ex)-1,Math.round(ey)-1,2,2,C.trimH);
    /* a real scythe: the blade leaves the top of the shaft at a right angle, long, widest at the heel, curving in to a point; the spine is dark steel, the inside edge is the sharp one (violet to white) */
    const ux=Math.sin(sa), uy=Math.cos(sa), nx=Math.sin(sa+1.5708), ny=Math.cos(sa+1.5708), N=30;
    for(let i=0;i<N;i++){ const k=i/(N-1), along=k*31, dip=k*k*13, w=Math.max(1,Math.round(8*(1-k)*(1-k*.35)+1)), bx0=ex+nx*along-ux*dip, by0=ey+ny*along-uy*dip;
      for(let q=0;q<w;q++){ p(Math.round(bx0-ux*q)-1,Math.round(by0-uy*q)-1,2,2,q===w-1?C.edge:q===w-2&&w>2?C.trimH:q===0?C.k4:q<w*.45?C.steel:C.lin); } }
    for(let i=4;i<N;i+=6){ const k=i/(N-1), w=Math.max(1,Math.round(8*(1-k)*(1-k*.35)+1)); p(Math.round(ex+nx*k*31-ux*(k*k*13+w)),Math.round(ey+ny*k*31-uy*(k*k*13+w)),1,1,'#ffffff'); }
    p(Math.round(ex-nx*3)-2,Math.round(ey-ny*3)-2,5,5,C.steel); p(Math.round(ex-nx*3)-1,Math.round(ey-ny*3)-1,3,3,C.chainS); /* the heel's counterweight */
    if(sw>.15&&sw<.95) for(let i=0;i<14;i++){ const k=i/14, a0=-2.4+sw*3.6-k*1.2, a1=a0-.1; cSeg(p,A.x+Math.sin(a0)*36,A.y+Math.cos(a0)*36,A.x+Math.sin(a1)*36,A.y+Math.cos(a1)*36,k<.3?3:2,'rgba(200,140,255,'+(.75*(1-k)).toFixed(2)+')'); cSeg(p,A.x+Math.sin(a0)*38,A.y+Math.cos(a0)*38,A.x+Math.sin(a1)*38,A.y+Math.cos(a1)*38,1,'rgba(255,255,255,'+(.6*(1-k)).toFixed(2)+')'); } }
  cSeg(p,A.x,A.y,A.kx,A.ky,5,C.k2,C.k3); cSeg(p,A.kx,A.ky,A.ex,A.ey,6,C.k2,C.k3); { const x=Math.round(A.ex), y=Math.round(A.ey); p(x-3,y-2,7,3,C.k1); p(x-3,y-2,7,1,C.k4); p(x-2,y+1,4,3,C.skin); p(x+1,y+1,1,3,C.skinS); p(x-2,y+4,1,2,C.skin); p(x,y+4,1,2,C.skinS); p(x-3,y,1,1,C.lin); }
  if(cast&&!sc){ const x=Math.round(A.ex), y=Math.round(A.ey); for(let r=6;r>0;r-=2) p(x-r,y-4-r,r*2+1,r,'rgba(170,80,255,'+(.25+.1*(6-r)).toFixed(2)+')'); p(x-2,y-8,5,3,'rgba(230,200,255,.9)'); p(x-1,y-7,2,1,'#ffffff'); for(let i=0;i<3;i++){ const a=t*8+i*2.1; p(x+Math.round(Math.cos(a)*7),y-6+Math.round(Math.sin(a)*4),1,1,'#ffffff'); } }
  if(dn) cStars(p,h0-28,t,'#c08aff'); else if(st) cStars(p,h0-28,t,'#c08aff',8); }
// ================= CAOTAN, REDRAWN (not wired in until the owner approves the preview) =================
// Same rig, poses and flags as drawCaotanCast (flash, down, stun, fire, push, state 'atk', heartEyes, noGlasses, cracked, glintT, nose,
// maid, form null/1/2/3). More in every part: four skin tones with a shoulder cap, biceps and knuckles; a scooped tank with armholes
// and folds; jeans with seams, knee fades and rolled cuffs; trainers with soles and laces; six-spike hair in three tones; a knotted
// headband with two tails in the wind; framed glasses with a lit lower lens. Form II adds what the transformation promises (a big
// bow, a sailor collar, a heart brooch, pink wrist cuffs); form III what the chains left (torn hem, broken shackles, pink hair tips).
function drawCaotanV2(c,cx,by,f,s){ const p=SH(c,cx,by,f), t=s.t||0, fl=s.flash>0, dn=s.down>0, tk=cTalk('caotan'), base=s.form==null, form=s.form||0;
  const C=cFlash({skin:'#c98a5e',skinS:'#a46a44',skinH:'#e3ab7e',skinD:'#7e4c2c',skinL:'#f2c89e',tank:'#f6f3ec',tankS:'#d6cfc2',tankD:'#a8a094',jean:'#4a6fa8',jeanS:'#34558a',jeanD:'#26406c',jeanH:'#7399d2',hair:'#22160f',hairH:'#4a3220',hairL:'#73512f',shoe:'#eeeef4',shoeS:'#9aa0b0',sole:'#cfd2de',belt:'#3a2a20',beltH:'#5e4634',buckle:'#e0c870',band:'#ffffff',bandS:'#c4c8d6',pink:'#ff6ab0',pinkS:'#c83a82',pinkL:'#ffc4e2',steel:'#b8bcc8',steelS:'#7c808e'},fl);
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
  const D={hip:30,torso:24,thigh:12,shin:12,uarm:11,farm:10,sep:4,ssep:11,neck:2}, J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy, R=Math.round, lp=(a,b,k)=>a+(b-a)*k;
  const cuff=(A,far)=>{ const x=R(A.ex), y=R(A.ey), ax=R(lp(A.kx,A.ex,.72)), ay=R(lp(A.ky,A.ey,.72)); if(form===2){ p(ax-3,ay-1,7,3,far?C.pinkS:C.pink); p(ax-3,ay-1,7,1,far?C.pink:C.pinkL); }
    else if(form>=3){ p(ax-3,ay-1,7,3,far?C.steelS:C.steel); p(ax-3,ay-1,7,1,far?C.steel:'#eef0f6'); const sw=R(Math.sin(t*4+(far?1:0))*1.5); p(ax-1+sw,ay+2,2,3,C.steelS); p(ax+sw*2,ay+5,2,3,C.steel); } return [x,y]; };
  // far arm: darker, behind the body
  { const A=J.A[0]; cArm(p,A,7,C.skinD,C.skinS,C.skinS,C.skinD); p(R(A.x)-3,R(A.y)-3,6,4,C.skinS); cuff(A,1); }
  // legs: jeans with a side seam, a faded knee, a rolled cuff; trainers with a sole, a toe cap and laces
  const leg=(L,near)=>{ const a=near?C.jeanS:C.jeanD, b=near?C.jean:C.jeanS; cSeg(p,L.x,L.y,L.kx,L.ky,8,a,b); cSeg(p,L.kx,L.ky,L.ex,L.ey-3,7,a,b);
    if(near){ cSeg(p,L.x+2,L.y+1,L.kx+2,L.ky,1,C.jeanH); cSeg(p,L.kx+2,L.ky,L.ex+2,L.ey-5,1,C.jeanH); p(R(L.kx)-2,R(L.ky)-2,5,3,C.jeanH); p(R(L.kx)-1,R(L.ky)-1,3,1,'#9ab8e6'); p(R(L.x)-2,R(L.y)+2,4,1,C.jeanD); p(R(L.x)-2,R(L.y)+3,1,2,C.jeanD); }
    const x=R(L.ex), y=R(L.ey); p(x-4,y-6,9,2,near?C.jeanH:C.jean); p(x-4,y-5,9,1,near?C.jeanS:C.jeanD);
    p(x-4,y-4,11,4,near?C.shoe:C.shoeS); p(x+4,y-4,3,3,near?'#ffffff':C.shoe); p(x-5,y,13,2,near?C.sole:'#8a8e9c'); p(x-5,y+1,13,1,'#6c707e'); p(x-2,y-3,4,1,near?C.pink:C.pinkS); if(near){ p(x,y-5,3,1,'#ffffff'); p(x+1,y-4,1,1,C.shoeS); p(x-4,y-4,2,4,C.shoeS); } };
  leg(J.L[0],0); leg(J.L[1],1);
  // belt + buckle (the volleys come out of it)
  p(J.hx-11,hy-4,22,5,C.belt); p(J.hx-11,hy-4,22,1,C.beltH); p(J.hx-8,hy-5,2,6,C.beltH); p(J.hx+7,hy-5,2,6,C.beltH); p(J.hx-3,hy-4,7,5,fire?'#ffffff':C.buckle); p(J.hx-2,hy-3,5,3,fire?'#ffffff':'#b89a48'); p(J.hx-2,hy-3,2,1,'#fff8d0');
  if(fire){ p(J.hx-5,hy-6,11,9,'rgba(255,255,255,.55)'); p(J.hx+4,hy-3,8,2,'rgba(255,255,255,.35)'); }
  // tank top: shoulders, scooped neck, armholes, the pecs' shadow, folds down to the belt
  cPoly(p,[[sx-13,sy],[sx+13,sy],[J.hx+11,hy-4],[J.hx-11,hy-4]],C.tank);
  cPoly(p,[[sx-13,sy],[sx-8,sy],[J.hx-7,hy-4],[J.hx-11,hy-4]],C.tankS); cPoly(p,[[sx+9,sy],[sx+13,sy],[J.hx+11,hy-4],[J.hx+8,hy-4]],C.tankS);
  p(sx-13,sy,3,7,C.skinS); p(sx+11,sy,3,6,C.skin); p(sx-10,sy+1,1,7,C.tankD); p(sx+10,sy+1,1,6,C.tankS);
  p(sx-5,sy,11,3,C.skin); p(sx-4,sy+3,9,1,C.skin); p(sx-3,sy+4,7,1,C.skin); p(sx-4,sy+1,9,1,C.skinS); p(sx-1,sy+2,3,2,C.skinH); p(sx-5,sy+3,1,1,C.tankD); p(sx+5,sy+3,1,1,C.tankD);
  p(sx-8,sy+9,7,1,C.tankD); p(sx+1,sy+9,7,1,C.tankD); p(sx,sy+6,1,4,C.tankD); p(sx-7,sy+8,5,1,C.tankS); p(sx+2,sy+8,5,1,C.tankS);
  for(let i=0;i<3;i++){ const k=(i+1)/4, yy=R(lp(sy+11,hy-6,i/2)), xx=R(lp(sx,J.hx,k)); p(xx-2,yy,5,1,C.tankS); p(xx-10,yy+1,3,1,C.tankD); p(xx+7,yy,3,1,C.tankS); }
  if(form>=3){ p(J.hx-9,hy-8,4,4,C.skin); p(J.hx-8,hy-9,2,1,C.skin); p(J.hx-9,hy-5,4,1,C.skinS); p(J.hx+3,hy-7,5,3,C.skin); p(J.hx+4,hy-8,2,1,C.skin); p(J.hx+3,hy-5,5,1,C.skinS); p(J.hx-4,hy-6,2,2,C.tankD); }
  if(form>=2){ cPoly(p,[[sx-12,sy-1],[sx+12,sy-1],[sx+6,sy+7],[sx,sy+11],[sx-6,sy+7]],C.pink); cPoly(p,[[sx-10,sy],[sx+10,sy],[sx+5,sy+6],[sx,sy+9],[sx-5,sy+6]],C.pinkL); cPoly(p,[[sx-8,sy],[sx+8,sy],[sx+4,sy+5],[sx,sy+8],[sx-4,sy+5]],C.pink);
    cPoly(p,[[sx-5,sy],[sx+5,sy],[sx,sy+6]],C.skin); p(sx-3,sy+1,7,1,C.skinS); p(sx-2,sy+10,2,2,'#ff3a7a'); p(sx+1,sy+10,2,2,'#ff3a7a'); p(sx-2,sy+11,5,2,'#ff3a7a'); p(sx-1,sy+13,3,1,'#ff3a7a'); p(sx,sy+14,1,1,'#ff3a7a'); p(sx-2,sy+10,1,1,'#ffffff'); }
  if(s.maid){ cPoly(p,[[J.hx-10,hy-18],[J.hx+10,hy-18],[J.hx+12,hy+4],[J.hx-12,hy+4]],'#ffffff'); p(J.hx-10,hy-18,20,2,'#ff8ac8'); p(J.hx-3,hy-22,6,4,'#ff3a7a'); p(J.hx-12,hy+3,24,1,'#ff8ac8'); for(let i=0;i<6;i++) p(J.hx-11+i*4,hy+4,3,2,'#ffffff'); p(J.hx-8,hy-10,16,1,'#e8e2ee'); }
  // head: jaw and ear in shadow, a lit cheek and nose
  const hx=R(J.headX), h0=R(J.headY);
  p(hx-7,h0-15,15,15,C.skin); p(hx+4,h0-14,3,11,C.skinH); p(hx+5,h0-12,2,5,C.skinL); p(hx-7,h0-3,15,3,C.skinS); p(hx-6,h0-1,13,1,C.skinD); p(hx-7,h0-15,2,12,C.skinS); p(hx-9,h0-10,2,4,C.skinS); p(hx-9,h0-9,1,2,C.skinD); p(hx+8,h0-9,1,3,C.skinH); p(hx+8,h0-6,1,1,C.skinS); p(hx-4,h0+0,7,2,C.skinS);
  // hair: six spikes, three tones, a sideburn; pink tips once he is unchained
  p(hx-8,h0-18,17,5,C.hair); p(hx-9,h0-16,4,7,C.hair); p(hx-8,h0-12,2,4,C.hair); p(hx+5,h0-21,4,4,C.hair); p(hx-3,h0-22,4,5,C.hair); p(hx+1,h0-20,3,3,C.hair); p(hx-7,h0-20,3,3,C.hair); p(hx-6,h0-23,2,3,C.hair); p(hx+3,h0-23,2,3,C.hair); p(hx+8,h0-19,2,3,C.hair); p(hx-1,h0-24,2,2,C.hair);
  p(hx-2,h0-21,2,2,C.hairH); p(hx+6,h0-20,2,2,C.hairH); p(hx-6,h0-19,2,1,C.hairH); p(hx+2,h0-19,2,1,C.hairH); p(hx-5,h0-17,9,1,C.hairH); p(hx+1,h0-17,5,1,C.hairL); p(hx-1,h0-23,1,1,C.hairL); p(hx+4,h0-22,1,1,C.hairL);
  if(form>=3){ p(hx-3,h0-22,3,1,C.pink); p(hx+5,h0-21,3,1,C.pink); p(hx-6,h0-23,2,1,C.pink); p(hx+3,h0-23,2,1,C.pinkL); p(hx-1,h0-24,2,1,C.pinkL); p(hx+8,h0-19,2,1,C.pink); }
  // headband: knotted at the back, two tails in the wind
  { const bd=form>=3?C.pinkL:C.band, bs=form>=3?C.pink:C.bandS, n=form>=3?5:3; p(hx-8,h0-13,17,2,bd); p(hx-8,h0-12,17,1,bs); p(hx-11,h0-14,3,4,bd); p(hx-11,h0-11,3,1,bs);
    for(let i=0;i<n+1;i++){ /* two thin ribbons trailing down and back (two-pixel blocks read as a white hand) */ p(hx-13-i*2,h0-12+i+R(Math.sin(t*7+i*.9)*1.2),3,1,bd); p(hx-12-i*2,h0-8+i*2+R(Math.sin(t*7+1.3+i*.9)*1.2),2,2,i%2?bs:bd); } }
  // face: brows, framed glasses with a lit lower lens (or the base shades), the grin
  const g=h0-(push?2:0), ln=s.glintT>0?'#ffffff':(form>=2?'#ffc8ec':'#bfe4ff'), lnL=s.glintT>0?'#ffffff':(form>=2?'#ffe6f6':'#e6f6ff'), fr='#14141e';
  if(s.noGlasses){ for(const ex of [-6,2]){ p(hx+ex-1,h0-12,6,1,fr); p(hx+ex,h0-11,4,3,fr); p(hx+ex+1,h0-10,2,2,'#ff8ac8'); p(hx+ex+1,h0-11,1,1,'#ffffff'); } }
  else if(base){ p(hx-7,h0-11,16,4,'#0e0e16'); p(hx-6,h0-11,14,1,'#2a2a3a'); p(hx+3,h0-10,4,1,'#7ab0ff'); p(hx-4,h0-9,2,1,'#4a6a9a'); p(hx-9,h0-10,2,1,'#0e0e16'); }
  else { p(hx-6,g-15,5,1,C.hair); p(hx+3,g-15,5,1,C.hair); p(hx-8,g-13,7,6,fr); p(hx+1,g-13,7,6,fr); p(hx-8,g-13,7,1,'#34344a'); p(hx+1,g-13,7,1,'#34344a'); p(hx-7,g-12,5,4,ln); p(hx+2,g-12,5,4,ln); p(hx-7,g-10,5,2,lnL); p(hx+2,g-10,5,2,lnL); p(hx-1,g-11,2,1,fr); p(hx-10,g-11,2,1,fr); p(hx-6,g-12,2,1,'#ffffff'); p(hx+3,g-12,2,1,'#ffffff');
    if(s.cracked){ p(hx+3,g-12,1,4,fr); p(hx+4,g-10,2,1,fr); p(hx+5,g-9,1,1,fr); } }
  if(s.heartEyes){ for(const ex of [-7,2]){ p(hx+ex,h0-12,2,2,'#ff3a7a'); p(hx+ex+3,h0-12,2,2,'#ff3a7a'); p(hx+ex,h0-11,5,2,'#ff3a7a'); p(hx+ex+1,h0-9,3,1,'#ff3a7a'); p(hx+ex+2,h0-8,1,1,'#ff3a7a'); p(hx+ex,h0-12,1,1,'#ffffff'); } }
  if(tk===2||st){ p(hx-2,h0-5,8,3,'#3a1010'); p(hx-1,h0-5,6,1,'#ffffff'); p(hx,h0-3,4,1,'#c84a5a'); } else { p(hx-2,h0-5,8,1,'#7a3a2a'); p(hx+5,h0-6,1,1,'#7a3a2a'); p(hx-1,h0-4,6,1,'#ffffff'); p(hx+2,h0-4,1,1,'#d8d8e0'); }
  if(s.nose){ p(hx-1,h0-7,2,6+R(Math.sin(t*20)*2),'#d0102a'); }
  if(s.glintT>0&&!s.noGlasses){ const k=R(s.glintT*10); p(hx+4-k,g-11,8+2*k,1,'#ffffff'); p(hx+4,g-15-k,1,9+2*k,'#ffffff'); }
  if(s.glintT>0&&s.noGlasses){ const k=R(s.glintT*10); for(const ex of [-5,3]){ p(hx+ex-k,h0-10,2+2*k,1,'#ffffff'); p(hx+ex,h0-14-k,1,7+2*k,'#ffffff'); } }
  if(form>=2){ cPoly(p,[[hx,h0-26],[hx-9,h0-31],[hx-10,h0-22]],C.pink); cPoly(p,[[hx,h0-26],[hx+9,h0-31],[hx+10,h0-22]],C.pink); p(hx-8,h0-29,3,1,C.pinkL); p(hx+6,h0-29,3,1,C.pinkL); p(hx-8,h0-24,4,1,C.pinkS); p(hx+5,h0-24,4,1,C.pinkS); p(hx-2,h0-28,4,4,C.pinkS); p(hx-1,h0-28,2,1,C.pinkL); p(hx-3,h0-24,2,3,C.pinkS); p(hx+2,h0-24,2,3,C.pinkS); }
  if(s.maid){ p(hx-8,h0-21,17,3,'#ffffff'); p(hx-6,h0-23,3,2,'#ffffff'); p(hx+1,h0-23,3,2,'#ffffff'); p(hx-8,h0-19,17,1,'#ff8ac8'); }
  // near arm: shoulder cap, biceps, a real fist; pointing, pushing the glasses or holding them
  const A=J.A[1]; cArm(p,A,7,C.skinS,C.skin,C.skin,C.skinS); p(R(A.x)-3,R(A.y)-3,7,4,C.skin); p(R(A.x)-2,R(A.y)-3,4,1,C.skinH); cSeg(p,A.x+1,A.y,A.kx+1,A.ky,1,C.skinH);
  if(!fire&&!dn&&!st&&!push&&!atk&&!tk&&!s.heartEyes){ const mx=R((A.x+A.kx)/2), my=R((A.y+A.ky)/2)-3; p(mx-2,my,5,3,C.skinH); p(mx-1,my,3,1,C.skinL); }
  { const [x,y]=cuff(A,0); p(x-2,y-2,5,5,C.skin); p(x-2,y+2,5,1,C.skinS); p(x-1,y-2,3,1,C.skinH); p(x+2,y-1,1,3,C.skinS); }
  if(s.noGlasses){ const x=R(A.ex), y=R(A.ey); p(x-1,y+1,7,3,fr); p(x,y+2,2,1,ln); p(x+3,y+2,2,1,ln); }
  if(form>=3) for(let i=0;i<3;i++){ const a=t*3+i*2.1, ox=R(Math.cos(a)*16), oy=h0-18+R(Math.sin(a)*6); p(ox-2,oy,2,2,'#ff4aa0'); p(ox+1,oy,2,2,'#ff4aa0'); p(ox-2,oy+1,5,2,'#ff4aa0'); p(ox-1,oy+3,3,1,'#ff4aa0'); p(ox,oy+4,1,1,'#ff4aa0'); p(ox-2,oy,1,1,'#ffd0e8'); }
  if(dn) cStars(p,h0-26,t,'#ffe066'); else if(st) cStars(p,h0-26,t,'#ffe066',8); }
// approved by the owner (v1.70): Omar is this painter everywhere he is drawn (solo, duo, the fusion's Omar half, afterimages, portraits that reuse it)
drawOmarCast=drawOmarV2; drawOmarHD=drawOmarV2; drawOmarBoss=drawOmarV2;
