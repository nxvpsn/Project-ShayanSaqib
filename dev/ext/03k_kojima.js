// =====================================================================
// HE'S DAY OLD KOJIMA replaces Grimmaw (same id 'grimmaw' everywhere in code, same fight and effects):
// a baby in a tailored suit with a head far too big for him, a moustache, round glasses, and a giant gold fountain pen
// for a sword (he signs things with it; people, mostly). His soldiers (the old hound pack, id 'hound') are now
// sneaking-suit Snakes (spear: knife, '!' on the tell) and cyborg Raidens (archer: HF blade; shaman: the red "Ripper" one).
// The nine-headed Hydrahound is a nine-headed Hydra of Snakes. Portraits are in 98c_kojima_pt.js.
// =====================================================================
function drawKojimaCast(c,cx,by,f,s){ const p=SH(c,cx,by,f), t=s.t||0, a=s.anim||'idle', fl=s.flash>0, tk=cTalk('grimmaw'), E=(dx,dy,rx,ry,col)=>ell(c,cx+dx*f,by+dy,rx,ry,col);
  const C=cFlash({suit:'#24263a',suitD:'#181a28',suitH:'#3a3e58',shirt:'#f2eee6',tie:'#c8202e',tieD:'#8a1420',skin:'#f0c4a0',skinD:'#d8a07c',skinH:'#ffe0c8',hair:'#14121a',hairH:'#34303e',
    mus:'#2a1a14',musH:'#4a3024',frame:'#101014',lens:'#cfe6ff',lensD:'#9ab8d8',gold:'#e0b040',goldD:'#a07a20',goldH:'#fff0a0',nib:'#2a2a30',diaper:'#f6f2ea',shoe:'#121016',blush:'#f4a0a0'},fl);
  const P=cPose('idle',t,0);
  if(a==='charge'||a==='run'){ Object.assign(P,cPose('run',t*(a==='charge'?1.3:1.1),0)); P.lean=a==='charge'?4:2; }
  else if(a==='leapPrep'){ P.b=4; P.lean=2; P.F=[[-5,0],[5,0]]; }
  else if(a==='winded'){ P.b=3; P.lean=3; P.F=[[-4,0],[4,0]]; P.ua[0]=.6; P.el[0]=.8; }
  else if(a==='howl'){ P.lean=-2; P.ua=[-2.6,-2.4]; P.el=[.3,.3]; P.F=[[-4,0],[4,0]]; }
  else if(a==='windup'){ P.b=1; P.lean=-2; P.F=[[-5,0],[4,0]]; }
  else if(a==='slash'){ P.b=1; P.lean=Math.round(-2+(s.ap!=null?s.ap:1)*4); P.F=[[-5,0],[5,0]]; }
  else if(tk){ P.ua[0]=-.8+Math.sin(t*3)*.4; P.el[0]=1.4; }
  const ang=a==='windup'||a==='leapPrep'?-2.25:a==='slash'?(s.ap!=null?-2.25+s.ap*3.3:.9):a==='charge'?.12:a==='winded'?1.35:a==='howl'?-1.6:1.22;
  const sa=Math.PI/2-ang; P.ua[1]=sa*.55; P.el[1]=sa*.35;
  const D={hip:12,torso:15,thigh:6,shin:6,uarm:7,farm:6,sep:4,ssep:9,neck:0}, J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy;
  // far arm, stubby legs with polished shoes, the diaper peeking out under the jacket
  cArm(p,J.A[0],5,C.suitD,C.suitD,C.skinD);
  const leg=(L,n)=>{ cSeg(p,L.x,L.y,L.kx,L.ky,6,n?C.suit:C.suitD,n?C.suitH:C.suit); cSeg(p,L.kx,L.ky,L.ex,L.ey-2,5,n?C.suit:C.suitD,n?C.suitH:C.suit); const x=Math.round(L.ex), y=Math.round(L.ey); p(x-3,y-3,9,3,C.shoe); p(x,y-3,3,1,'#5a5a66'); };
  leg(J.L[0],0); leg(J.L[1],1); p(J.hx-8,hy-3,16,5,C.diaper); p(J.hx+5,hy-2,3,2,'#9fd0ff');
  // the suit: a round little jacket, white shirt, red tie, a gold lapel pin
  cPoly(p,[[sx-11,sy],[sx+11,sy],[J.hx+10,hy],[J.hx-10,hy]],C.suit); cPoly(p,[[sx+5,sy],[sx+11,sy],[J.hx+10,hy],[J.hx+4,hy]],C.suitD); cPoly(p,[[sx-11,sy],[sx-8,sy],[J.hx-8,hy-2],[J.hx-10,hy-2]],C.suitH);
  cPoly(p,[[sx-3,sy],[sx+5,sy],[sx+1,sy+9]],C.shirt); p(sx,sy+1,2,9,C.tie); p(sx-1,sy+1,4,2,C.tieD); p(sx-6,sy+3,2,2,C.gold);
  // the head: far too big, slicked side part, round glasses, a magnificent moustache
  const hx=Math.round(J.headX)+2, hc=Math.round(J.headY)-19+(a==='winded'?3:0), bl=cBlink(t,.6), laugh=a==='howl', mo=laugh?4:tk===2?2:a==='slash'||a==='charge'?1:0;
  E(hx-1,hc+1,24,23,C.skinD); E(hx,hc,23,22,C.skin); E(hx-7,hc-8,8,6,C.skinH); p(hx-23,hc-2,5,7,C.skinD); p(hx-22,hc-1,3,4,C.skin);
  E(hx-2,hc-15,20,8,C.hair); p(hx-21,hc-14,6,14,C.hair); cPoly(p,[[hx-14,hc-22],[hx+16,hc-20],[hx+20,hc-10],[hx+8,hc-14],[hx-6,hc-13]],C.hair); p(hx-6,hc-21,14,2,C.hairH); p(hx+1,hc-27,2,5,C.hair); p(hx+3,hc-28,4,2,C.hair); p(hx+6,hc-27,2,3,C.hair); p(hx+4,hc-25,2,1,C.hair); /* the baby curl */ p(hx+2,hc-14,1,3,C.skinD);
  const gt=a==='winded'?2:0, ex1=hx+3, ex2=hx+15, ey=hc-1;
  for(const [x0,y0] of [[ex1,ey],[ex2,ey+gt]]){ E(x0,y0,6,5,C.frame); E(x0,y0,5,4,C.lens); E(x0+1,y0+1,4,2,C.lensD); if(bl||laugh) p(x0-2,y0,5,1,C.frame); else { p(x0-1,y0-1,3,3,'#14121a'); p(x0,y0-1,1,1,'#ffffff'); } p(x0-3,y0-3,2,1,'#ffffff'); }
  p(ex1+5,ey-1,5,2,C.frame); p(ex1-8,ey-1,3,1,C.frame); if(a!=='winded') { p(ex1-3,ey-7,6,2,C.hair); p(ex2-3,ey-8,6,2,C.hair); } else { p(ex1-3,ey-6,6,2,C.hair); p(ex2-2,ey-5,6,2,C.hair); }
  p(hx+9,hc+3,3,4,C.skinD); E(hx-5,hc+6,3,2,C.blush); E(hx+20,hc+6,2,2,C.blush);
  E(hx+5,hc+10,8,3,C.mus); E(hx+15,hc+10,7,3,C.mus); p(hx-4,hc+9,3,2,C.mus); p(hx+21,hc+9,3,2,C.mus); p(hx-5,hc+7,2,2,C.mus); p(hx+23,hc+7,2,2,C.mus); p(hx+2,hc+8,6,1,C.musH); p(hx+12,hc+8,6,1,C.musH);
  if(mo){ p(hx+6,hc+13,8,mo+1,'#5a1a24'); p(hx+7,hc+13,6,1,'#ffffff'); } else p(hx+7,hc+14,6,1,'#9a5a44');
  if(a==='winded'&&Math.sin(t*5)>0){ p(hx-14,hc-6+Math.round((t*12)%6),2,3,'#9fd8ff'); p(hx+24,hc-8+Math.round((t*9)%6),2,3,'#9fd8ff'); }
  // near arm and the giant gold fountain pen (his sword)
  const A=J.A[1], L=54, ex=A.ex+Math.cos(ang)*L, ey2=A.ey+Math.sin(ang)*L;
  cSeg(p,A.ex-Math.cos(ang)*8,A.ey-Math.sin(ang)*8,ex-Math.cos(ang)*8,ey2-Math.sin(ang)*8,5,C.goldD,C.gold); cSeg(p,A.ex+Math.sin(ang),A.ey-1,ex-Math.cos(ang)*10,ey2-Math.sin(ang)*10-1,1,C.goldH);
  cSeg(p,ex-Math.cos(ang)*9,ey2-Math.sin(ang)*9,ex,ey2,3,C.nib); p(Math.round(ex)-1,Math.round(ey2)-1,2,2,'#c8ccd8');
  const bx=A.ex+Math.cos(ang)*20, byy=A.ey+Math.sin(ang)*20; p(Math.round(bx)-3,Math.round(byy)-3,6,6,C.goldH); p(Math.round(bx)-2,Math.round(byy)-2,4,4,C.tie);
  if(a==='slash'&&s.ap!=null&&s.ap<.9) for(let i=1;i<14;i++){ const a0=ang-i*.08, a1=a0-.09, r=48; cSeg(p,A.ex+Math.cos(a0)*r,A.ey+Math.sin(a0)*r,A.ex+Math.cos(a1)*r,A.ey+Math.sin(a1)*r,i<5?4:i<9?3:2,'rgba(255,230,150,'+(.75-i*.05).toFixed(2)+')'); }
  cArm(p,A,5,C.suitD,C.suit,C.skin,C.skinD); }

// ---------- his soldiers: Snakes (spear) and Raidens (archer, shaman) ----------
function drawSoldierCast(c,cx,by,f,s,arch){ const p=SH(c,cx,by,f), t=s.t||0, a=s.anim||'idle', fl=s.flash>0, rip=arch==='shaman', rai=!!arch;
  const C=cFlash(rai?{suit:'#2a2c36',suitD:'#1c1e26',suitH:'#454856',line:rip?'#ff3a4a':'#8fe0ff',plate:'#c8ccd8',plateH:'#ffffff',hair:'#e8ecf2',hairD:'#b8c0cc',skin:'#f0d0b8',skinD:'#d0a888',boot:'#14141a'}
    :{suit:'#3e4a5e',suitD:'#2c3646',suitH:'#5a6a82',line:'#141820',plate:'#1a1c22',plateH:'#3a3e48',hair:'#5a3a24',hairD:'#3a2416',skin:'#d8a888',skinD:'#b08060',boot:'#18151c',band:'#1a2234'},fl);
  const k=a==='run'?'run':a==='tell'?'charge':a==='lunge'?'dash':a==='hurt'?'hurt':'idle', P=cPose(k,t,0);
  if(a==='tell'){ P.b=2; P.lean=-1; } if(a==='lunge'){ P.lean=5; P.b=1; }
  const D={hip:11,torso:14,thigh:5,shin:6,uarm:5,farm:5,sep:2,ssep:5,neck:1}, J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy;
  cArm(p,J.A[0],3,C.suitD,C.suitD,C.skinD);
  cLeg(p,J.L[0],4,C.suitD,C.suitD,C.boot,null,5); cLeg(p,J.L[1],4,C.suitD,C.suit,C.boot,'#2a2630',5);
  { const L=J.L[1]; p(Math.round(L.kx)-2,Math.round(L.ky)-1,4,2,C.plate); }
  // the torso: a sneaking suit with harness straps, or cyborg plates with glowing seams
  cPoly(p,[[sx-7,sy],[sx+7,sy],[J.hx+6,hy+1],[J.hx-6,hy+1]],C.suit); cPoly(p,[[sx+3,sy],[sx+7,sy],[J.hx+6,hy+1],[J.hx+3,hy+1]],C.suitD); cPoly(p,[[sx-7,sy],[sx-5,sy],[J.hx-4,hy+1],[J.hx-6,hy+1]],C.suitH);
  if(rai){ p(sx-5,sy+2,10,4,C.plate); p(sx-5,sy+2,10,1,C.plateH); p(J.hx-5,hy-4,11,1,C.line); p(sx-1,sy+6,1,hy-sy-6,C.line); p(sx-8,sy-2,5,4,C.plate); p(sx+4,sy-2,5,4,C.plate); }
  else { cSeg(p,sx-6,sy+1,J.hx+5,hy-2,1,C.line); cSeg(p,sx+6,sy+1,J.hx-5,hy-2,1,C.line); p(J.hx-6,hy-3,13,2,C.line); p(J.hx+2,hy-3,3,3,'#3a3e48'); p(sx-8,sy-1,4,3,C.suitH); p(sx+5,sy-1,4,3,C.suitH); }
  // the head in profile
  const hx=Math.round(J.headX), h0=Math.round(J.headY), mo=a==='tell'||a==='lunge'?2:0, bl=cBlink(t,cx*.21);
  p(hx-4,h0-11,10,11,C.skin); p(hx-4,h0-11,3,10,C.skinD); p(hx+5,h0-7,2,3,C.skin); p(hx+6,h0-5,1,1,C.skinD);
  p(hx+2,h0-8,2,1,bl?C.skinD:(rip&&!bl?'#ff2a3a':'#1a1418')); p(hx+1,h0-9,4,1,C.hairD);
  if(mo){ p(hx+2,h0-3,4,2,'#5a1a24'); p(hx+2,h0-3,4,1,'#f2efe6'); } else p(hx+2,h0-2,4,1,C.skinD);
  if(rai){ // long white hair streaming back
    p(hx-5,h0-14,11,4,C.hair); p(hx-7,h0-12,4,13,C.hair); p(hx-9,h0-9,3,9,C.hairD); p(hx-5,h0-14,6,1,'#ffffff'); p(hx+4,h0-12,2,4,C.hair);
    const sw=Math.round(Math.sin(t*6)); p(hx-11,h0-4+sw,3,6,C.hairD); }
  else { // brown mullet, stubble, the bandana with its tails in the wind
    p(hx-5,h0-14,11,4,C.hair); p(hx-6,h0-11,3,11,C.hair); p(hx-7,h0-6,2,6,C.hairD); p(hx,h0-3,6,3,'#8a6a50'); p(hx+1,h0-3,4,1,C.skinD);
    p(hx-5,h0-11,11,2,C.band); const tw=Math.round(Math.sin(t*9)*1.5); p(hx-9,h0-11+tw,4,1,C.band); p(hx-12,h0-10+tw,3,1,C.band); p(hx-8,h0-9-tw,4,1,C.band); p(hx-11,h0-8-tw,2,1,C.band);
    if(a==='tell'){ p(hx-2,h0-32,7,12,'#ffffff'); p(hx,h0-31,3,9,'#ff2a2a'); p(hx-2,h0-19,7,6,'#ffffff'); p(hx,h0-18,3,3,'#ff2a2a'); } }
  // the weapon and the near arm
  const A=J.A[1];
  if(rai){ const ang=a==='lunge'?0:a==='tell'?-1.9:-1.05, x0=A.ex-Math.cos(ang)*4, y0=A.ey-Math.sin(ang)*4, x1=A.ex+Math.cos(ang)*22, y1=A.ey+Math.sin(ang)*22;
    cSeg(p,x0,y0,x1,y1,2,'#d8e0ea'); cSeg(p,A.ex,A.ey,x1,y1,1,a==='tell'?(rip?'#ff4a5a':'#bff4ff'):'#ffffff'); p(Math.round(A.ex)-2,Math.round(A.ey)-1,4,3,'#2a2c36');
    if(rip&&a==='tell') for(let i=0;i<3;i++){ const aa=t*8+i*2.1; p(Math.round(A.ex)+Math.round(Math.cos(aa)*6),Math.round(A.ey)-4+Math.round(Math.sin(aa)*6),1,1,'#ff5a6a'); } }
  else { const ang=a==='lunge'?0:a==='tell'?-.45:.9, x1=A.ex+Math.cos(ang)*8, y1=A.ey+Math.sin(ang)*8; cSeg(p,A.ex,A.ey,x1,y1,2,'#c8cbd6'); p(Math.round(x1),Math.round(y1),1,1,'#ffffff'); }
  cArm(p,A,3,C.suitD,C.suit,C.skin,C.skinD); }

// ---------- the Hydra of Snakes ----------
drawHydraHead=function(c,hx,hy,f,open){ const H=(dx,dy,w,h,col)=>R(c,f>0?hx+dx:hx-dx-w,hy+dy,w,h,col), sk='#d8a888', skD='#b08060', hr='#5a3a24', band='#1a2234';
  ell(c,hx,hy,13,12,skD); ell(c,hx+2*f,hy,12,11,sk); H(-14,-14,22,7,hr); H(-15,-8,7,16,hr); H(-17,0,4,8,'#3a2416'); H(-10,-10,26,4,band);
  const tw=Math.round(Math.sin(performance.now()/120+hx)*2); H(-20,-9+tw,7,2,band); H(-25,-7+tw,6,2,band); H(-19,-6-tw,7,2,band);
  H(4,-5,6,3,'#ffffff'); H(6,-5,3,3,'#1a1418'); H(3,-7,9,2,'#2a1a14'); H(12,-2,3,6,skD);
  if(open){ H(3,4,13,8,'#3a0010'); H(4,4,11,2,'#f2efe6'); H(4,10,11,1,'#f2efe6'); H(6,7,7,2,'#c8404a'); H(0,2,4,6,'#8a6a50'); }
  else { H(4,6,10,1,'#6a3a2a'); H(0,3,14,5,'#8a6a50'); H(2,4,10,1,'#9a7a5a'); } };
drawHydra=function(c,cx,by,t,open,cut){ const body='#3e4a5e', bodyL='#5a6a82', rim='#141820';
  ell(c,cx,by-16,86,30,'#2c3646'); ell(c,cx,by-34,64,30,bodyL); ell(c,cx,by-30,70,26,body);
  for(let i=-5;i<=5;i++){ const x=cx+i*12, y=by-50+Math.abs(i)*4; R(c,x-5,y,10,3,rim); R(c,x-2,y-1,4,2,'#3a3e48'); }
  for(let i=0;i<9;i++){ const q=hydraHead(i,t,cx,by), severed=cut&&cut[i], len=severed?.62:1;
    for(let k=0;k<=16*len;k++){ const u=k/16, x=lerp(q.nx,q.hx,u)+Math.sin(u*3+t*2+i)*7*(1-u), y=lerp(q.ny,q.hy,u)-Math.sin(u*Math.PI)*18, r=9-u*3;
      ell(c,x,y,r,r,body); ell(c,x-1,y-2,r*.6,r*.4,bodyL); if(k%4===0) R(c,x-r,y-1,r*2,2,rim);
      if(severed&&k>=Math.floor(16*len)){ ell(c,x,y,r*.8,r*.8,'#6a0a1a'); ell(c,x,y,r*.4,r*.4,'#ff3a4a'); for(let d=0;d<4;d++) R(c,x-1+Math.sin(t*20+d)*2,y+3+d*3,2,2,'#5a0010'); } }
    if(!severed) drawHydraHead(c,q.hx,q.hy,q.hx<cx?-1:1,open); } };

drawGrimmawCast=drawKojimaCast; drawGrimmawHD=drawKojimaCast; drawHoundCast=drawSoldierCast; drawHoundHD=drawSoldierCast;
