// =====================================================================
// HE'S DAY OLD KOJIMA replaces Grimmaw (same id 'grimmaw' everywhere in code, same fight and effects):
// a baby in a tailored suit with a head far too big for him, a moustache, round glasses, and a giant gold fountain pen
// for a sword (he signs things with it; people, mostly). His soldiers (the old hound pack, id 'hound') are now
// his film crew: Boxheads (spear: a boom-mic pole, a REC light on the tell) and Silverbobs (archer: a shoulder camera; shaman: a clipboard).
// The nine-headed Hydrahound is the Hydra of Boxes (cardboard-box heads on cable necks). Portraits are in 98c_kojima_pt.js.
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
  const red=!!s.redEye; s._eyes=[[ex1,ey],[ex2,ey+gt]]; // red: his phase II transition (40m_kjtrans.js)
  for(const [x0,y0] of [[ex1,ey],[ex2,ey+gt]]){ E(x0,y0,6,5,C.frame); E(x0,y0,5,4,red?'#ff2a3a':C.lens); E(x0+1,y0+1,4,2,red?'#9a0a18':C.lensD); if(red){ p(x0-1,y0-1,3,3,'#3a0006'); p(x0,y0-1,1,1,'#ffd0d0'); } else if(bl||laugh) p(x0-2,y0,5,1,C.frame); else { p(x0-1,y0-1,3,3,'#14121a'); p(x0,y0-1,1,1,'#ffffff'); } p(x0-3,y0-3,2,1,'#ffffff'); }
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

// ---------- his soldiers: the Boxheads (spear: a boom-mic pole) and the Silverbobs (archer: a shoulder camera, shaman: a clipboard) ----------
// His film crew. A Boxhead is a stuntman in an olive jumpsuit with a cardboard box over his head (two eyeholes, a FRAGILE stamp, a red bandana
// knotted round the box, a mullet out the back). A Silverbob is a lanky intern: a silver bob with bangs over the eyes, a white coat over a dark
// turtleneck, a lanyard with a glowing CREW badge; the archer shoulders a camera, the shaman waves a clipboard with sticky notes.
function drawSoldierCast(c,cx,by,f,s,arch){ const p=SH(c,cx,by,f), t=s.t||0, a=s.anim||'idle', fl=s.flash>0, rip=arch==='shaman', rai=!!arch;
  const C=cFlash(rai?{suit:'#ece8e0',suitD:'#c4bcb0',suitH:'#ffffff',line:rip?'#ffd45a':'#8fe0ff',plate:'#2a2c36',plateH:'#454856',hair:'#c8ccd8',hairD:'#9aa0b0',skin:'#f0d0b8',skinD:'#d0a888',boot:'#14141a'}
    :{suit:'#5a5e3a',suitD:'#3e4228',suitH:'#7a7e52',line:'#1c1c22',plate:'#2a2a30',plateH:'#44444c',hair:'#5a3a24',hairD:'#3a2416',skin:'#c8a064',skinD:'#8a6a42',boot:'#18151c',band:'#c8202e',bandD:'#8a1420',tape:'#e8d0a0'},fl);
  const k=a==='run'?'run':a==='tell'?'charge':a==='lunge'?'dash':a==='hurt'?'hurt':'idle', P=cPose(k,t,0);
  if(a==='tell'){ P.b=2; P.lean=-1; } if(a==='lunge'){ P.lean=5; P.b=1; }
  const D={hip:11,torso:14,thigh:5,shin:6,uarm:5,farm:5,sep:2,ssep:5,neck:1}, J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy;
  cArm(p,J.A[0],3,C.suitD,C.suitD,rai?C.skinD:C.suitD);
  cLeg(p,J.L[0],4,C.suitD,C.suitD,C.boot,null,5); cLeg(p,J.L[1],4,C.suitD,C.suit,C.boot,'#2a2630',5);
  { const L=J.L[1]; p(Math.round(L.kx)-2,Math.round(L.ky)-1,4,2,C.plate); } /* knee pad */
  // the torso: an olive jumpsuit with a harness, or a white coat open over a dark turtleneck with a lanyard
  cPoly(p,[[sx-7,sy],[sx+7,sy],[J.hx+6,hy+1],[J.hx-6,hy+1]],C.suit); cPoly(p,[[sx+3,sy],[sx+7,sy],[J.hx+6,hy+1],[J.hx+3,hy+1]],C.suitD); cPoly(p,[[sx-7,sy],[sx-5,sy],[J.hx-4,hy+1],[J.hx-6,hy+1]],C.suitH);
  if(rai){ p(sx-3,sy,6,hy-sy,C.plate); p(sx-1,sy+1,2,3,C.plateH); cSeg(p,sx-4,sy+1,sx,sy+9,1,'#3a3a44'); cSeg(p,sx+4,sy+1,sx,sy+9,1,'#3a3a44'); p(sx-2,sy+9,4,3,C.line); p(sx-1,sy+10,2,1,'#ffffff'); }
  else { cSeg(p,sx-6,sy+1,J.hx+5,hy-2,1,C.line); cSeg(p,sx+6,sy+1,J.hx-5,hy-2,1,C.line); p(J.hx-6,hy-3,13,2,C.line); p(J.hx+2,hy-3,3,3,C.plateH); p(sx-8,sy-1,4,3,C.suitH); p(sx+5,sy-1,4,3,C.suitH); }
  const hx=Math.round(J.headX), h0=Math.round(J.headY), mo=a==='tell'||a==='lunge'?2:0, bl=cBlink(t,cx*.21);
  if(rai){ // the Silverbob: skin, a silver bob with bangs over the eyes, a glint of a mouth
    p(hx-4,h0-11,10,11,C.skin); p(hx-4,h0-11,3,10,C.skinD); p(hx+5,h0-7,2,3,C.skin);
    p(hx-6,h0-15,13,5,C.hair); p(hx-7,h0-11,3,12,C.hair); p(hx-9,h0-7,3,8,C.hairD); p(hx-3,h0-10,10,3,C.hair); p(hx+2,h0-9,5,1,C.hairD); p(hx-6,h0-15,7,1,'#ffffff');
    const sw=Math.round(Math.sin(t*6)); p(hx-10,h0-3+sw,3,5,C.hairD);
    if(mo){ p(hx+2,h0-3,4,2,'#5a1a24'); p(hx+2,h0-3,4,1,'#f2efe6'); } else p(hx+2,h0-2,4,1,C.skinD);
    if(rip&&a==='tell'){ p(hx+3,h0-8,2,1,'#ffd45a'); } }
  else { // the Boxhead: the box, its eyeholes and stamp, the bandana round it, the mullet out the back
    p(hx-6,h0-13,13,13,C.skin); p(hx-6,h0-13,13,1,C.tape); p(hx-6,h0-13,2,13,C.skinD); p(hx-6,h0-1,13,1,C.skinD); p(hx+6,h0-13,1,13,C.skinD); p(hx-1,h0-13,2,13,C.tape); /* the tape seam */
    p(hx-7,h0-6,3,9,C.hair); p(hx-9,h0-3,2,6,C.hairD); /* the mullet */
    const eye=a==='tell'||a==='lunge'?'#ff2a3a':(bl?'#1a1418':'#2a2228'); p(hx-3,h0-9,2,2,'#0a0a0c'); p(hx+2,h0-9,2,2,'#0a0a0c'); p(hx-3,h0-9,1,1,eye); p(hx+2,h0-9,1,1,eye);
    p(hx-5,h0-11,11,2,C.band); const tw=Math.round(Math.sin(t*9)*1.5); p(hx-9,h0-11+tw,4,1,C.band); p(hx-12,h0-10+tw,3,1,C.bandD); p(hx-8,h0-9-tw,4,1,C.band); p(hx-11,h0-8-tw,2,1,C.bandD);
    p(hx-4,h0-5,9,3,'#c8202e'); p(hx-3,h0-4,7,1,'#ffd0d0'); /* the FRAGILE stamp */ p(hx+1,h0-3,3,1,'#5a4a2e');
    if(a==='tell'){ const on=Math.floor(t*8)%2; p(hx-3,h0-22,9,6,'#1a1418'); p(hx-2,h0-21,2,2,on?'#ff2a2a':'#5a1016'); p(hx+1,h0-21,5,1,'#f2efe6'); p(hx+1,h0-19,5,1,'#f2efe6'); } } /* a REC light blinks over the box */
  // the weapon and the near arm
  const A=J.A[1];
  if(rai&&!rip){ // the shoulder camera: a dark box with a lens ring and a blinking red light, pointed where he shoots
    const ang=a==='lunge'?0:a==='tell'?-.35:-.2, ex=Math.round(A.ex), ey=Math.round(A.ey)-6, on=Math.floor(t*6)%2; p(ex-4,ey-3,10,6,C.plate); p(ex-4,ey-3,10,1,C.plateH); p(ex+6,ey-2,3,4,'#3a3a44'); p(ex+7,ey-1,2,2,a==='tell'?'#bff4ff':'#8fb8d8');
    p(ex-3,ey-5,3,2,C.plate); p(ex-2,ey-5,1,1,on?'#ff2a2a':'#5a1016'); cSeg(p,ex,ey+3,ex+Math.cos(ang)*4,ey+3+Math.sin(ang)*4,1,C.plateH); }
  else if(rip){ // the clipboard, sticky notes lifting off it when he casts
    const ex=Math.round(A.ex), ey=Math.round(A.ey); p(ex-1,ey-7,7,9,'#6a4a2a'); p(ex,ey-6,5,7,'#f2efe6'); p(ex+1,ey-4,3,1,'#b8b4aa'); p(ex+1,ey-2,3,1,'#b8b4aa'); p(ex+1,ey-8,3,2,'#3a3a44');
    if(a==='tell') for(let i=0;i<3;i++){ const aa=t*8+i*2.1; p(ex+Math.round(Math.cos(aa)*6),ey-6+Math.round(Math.sin(aa)*6),3,2,i%2?'#ffd45a':'#ff8ab0'); } }
  else { // the boom-mic pole: a long grey pole with a fuzzy windscreen on the end
    const ang=a==='lunge'?0:a==='tell'?-.45:.9, x1=A.ex+Math.cos(ang)*9, y1=A.ey+Math.sin(ang)*9; cSeg(p,A.ex,A.ey,x1,y1,2,'#b8bcc8'); const fx=Math.round(x1), fy=Math.round(y1); p(fx-2,fy-2,5,5,'#2a2a30'); p(fx-1,fy-3,3,1,'#2a2a30'); p(fx-1,fy-1,2,2,'#44444c'); }
  cArm(p,A,3,C.suitD,C.suit,rai?C.skin:C.suitD,rai?C.skinD:C.suitD); }

// ---------- the Hydra of Boxes: nine cardboard-box heads on cable necks, out of a pile of taped boxes ----------
drawHydraHead=function(c,hx,hy,f,open){ const H=(dx,dy,w,h,col)=>R(c,f>0?hx+dx:hx-dx-w,hy+dy,w,h,col), bx='#c8a064', bxD='#8a6a42', tape='#e8d0a0', band='#c8202e';
  H(-13,-12,26,24,bxD); H(-12,-11,24,22,bx); H(-12,-11,2,22,bxD); H(-12,10,24,1,bxD); H(-1,-11,3,22,tape); H(-12,-11,24,1,tape);
  const tw=Math.round(Math.sin(performance.now()/120+hx)*2); H(-12,-9,24,3,band); H(-20,-9+tw,8,2,band); H(-26,-7+tw,6,2,'#8a1420'); H(-19,-6-tw,7,2,band);
  H(-7,-5,4,4,'#0a0a0c'); H(3,-5,4,4,'#0a0a0c'); H(-6,-4,2,2,open?'#ff2a3a':'#f2efe6'); H(4,-4,2,2,open?'#ff2a3a':'#f2efe6');
  if(open){ H(-8,1,17,9,'#3a0010'); for(let i=0;i<5;i++){ H(-7+i*4,1,2,3,'#f2efe6'); H(-6+i*4,7,2,3,'#f2efe6'); } H(-4,4,9,2,'#c8404a'); }
  else { H(-8,2,17,6,bxD); H(-7,3,15,4,'#c8202e'); H(-6,4,13,2,'#ffd0d0'); /* FRAGILE across the flap */ } };
drawHydra=function(c,cx,by,t,open,cut){ const bx='#c8a064', bxD='#8a6a42', bxL='#dcb878', tape='#e8d0a0', cable='#2a2a30', cableL='#44444c';
  // the pile: taped boxes, THIS SIDE UP arrows, a FRAGILE stamp
  const box=(x,y,w,h)=>{ R(c,x-1,y-1,w+2,h+2,bxD); R(c,x,y,w,h,bx); R(c,x,y,w,2,bxL); R(c,x+Math.floor(w/2)-1,y,3,h,tape); R(c,x,y+Math.floor(h/2),w,1,bxD); };
  box(cx-78,by-30,52,30); box(cx-26,by-34,56,34); box(cx+30,by-28,48,28); box(cx-56,by-58,46,28); box(cx-10,by-62,52,28); box(cx+42,by-54,36,26); box(cx-32,by-82,60,24);
  R(c,cx-70,by-22,12,3,'#1c1c22'); R(c,cx-66,by-26,4,4,'#1c1c22'); R(c,cx+50,by-20,12,3,'#1c1c22'); R(c,cx+54,by-24,4,4,'#1c1c22'); /* THIS SIDE UP arrows */
  R(c,cx-20,by-50,32,7,'#c8202e'); R(c,cx-18,by-48,28,3,'#ffd0d0'); /* FRAGILE */
  for(let i=0;i<9;i++){ const q=hydraHead(i,t,cx,by), severed=cut&&cut[i], len=severed?.62:1;
    for(let k=0;k<=16*len;k++){ const u=k/16, x=lerp(q.nx,q.hx,u)+Math.sin(u*3+t*2+i)*7*(1-u), y=lerp(q.ny,q.hy,u)-Math.sin(u*Math.PI)*18, r=8-u*3;
      ell(c,x,y,r,r,cable); ell(c,x-1,y-2,r*.6,r*.4,cableL); if(k%4===0) R(c,x-r,y-1,r*2,3,tape); /* a cable neck, taped every so often */
      if(severed&&k>=Math.floor(16*len)){ ell(c,x,y,r*.8,r*.8,'#6a0a1a'); ell(c,x,y,r*.4,r*.4,'#ff3a4a'); for(let d=0;d<4;d++) R(c,x-1+Math.sin(t*20+d)*2,y+3+d*3,2,2,d%2?'#f2efe6':'#5a0010'); } } /* sparks of red and packing peanuts */
    if(!severed) drawHydraHead(c,q.hx,q.hy,q.hx<cx?-1:1,open); } };

drawGrimmawCast=drawKojimaCast; drawGrimmawHD=drawKojimaCast; drawHoundCast=drawSoldierCast; drawHoundHD=drawSoldierCast;
