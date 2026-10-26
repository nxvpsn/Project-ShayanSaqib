// =====================================================================
// PORTRAITS, REDRAWN: shaded 56x56 busts for every speaker but Shayan (his are the imported art), each with
// expression-specific eyes / brows / mouths and an open-mouth variant. While a character's line is typing or being
// voiced, the dialogue box (and the bark cut-ins) flap between the two, like their world sprites (cTalk in 03_cast.js).
// Shayan keeps his art; an open mouth is painted over it while he talks.
// =====================================================================
const PTC={};
const PT_LINE='#2a1620';
function ptP(c){ return (x,y,w,h,col)=>{ c.fillStyle=col; c.fillRect(x,y,w,h); }; }
function ptPoly(c,pts,col){ cPoly(SH(c,0,0,1),pts,col); }
function ptHead(c,x,y,rx,ry,sk,skS,skH){ ell(c,x,y,rx,ry,skS); ell(c,x-1,y-1,rx-1,ry-1,sk); if(skH) ell(c,x-4,y-5,Math.max(2,rx-8),Math.max(2,ry-9),skH); }
function ptBody(c,col,colS,colH,y0){ y0=y0||44; ptPoly(c,[[4,56],[8,y0+2],[18,y0-1],[38,y0-1],[48,y0+2],[52,56]],col); ptPoly(c,[[38,y0-1],[48,y0+2],[52,56],[40,56]],colS); if(colH) ptPoly(c,[[8,y0+2],[18,y0-1],[20,y0],[12,56],[4,56]],colH); }
// eyes: lx/rx = left x of each eye, y = top
function ptEyes(c,lx,rx,y,iris,ex,o){ o=o||{}; const P=ptP(c), ln=o.line||PT_LINE, irD=o.irisD||cShade(iris,-.35);
  const brow=(x,flip,kind)=>{ const s=flip?-1:1, X=(k)=>flip?x+5-k:x+k; // k from inner? flip mirrors
    if(kind==='angry') { pline(c,X(-1),y-4,X(5),y-1,o.brow||ln,2); }
    else if(kind==='sad') { pline(c,X(-1),y-2,X(5),y-4,o.brow||ln,1); }
    else if(kind==='surprised') { P(x,y-5,5,1,o.brow||ln); }
    else { P(x,y-3,5,1,o.brow||ln); P(flip?x:x+4,y-2,1,1,o.brow||ln); } };
  const kind=ex==='angry'?'angry':(ex==='sad'||ex==='worried')?'sad':ex==='surprised'?'surprised':'';
  [[lx,0],[rx,1]].forEach(([x,flip])=>{ if(!o.noBrow) brow(x,!flip,kind);
    if(ex==='happy'||ex==='blush'||o.closed){ P(x,y+3,1,1,ln); P(x+1,y+2,3,1,ln); P(x+4,y+3,1,1,ln); return; }
    if(kind==='angry'){ P(x,y+2,5,3,'#ffffff'); P(x+1,y+2,3,3,iris); P(x+2,y+3,2,2,'#14101a'); P(x+3,y+2,1,1,'#ffffff'); P(x-1,y+1,7,1,ln); P(x,y+2,flip?2:1,1,ln); return; }
    if(kind==='surprised'){ P(x,y-1,5,6,'#ffffff'); P(x+2,y+1,2,2,iris); P(x+2,y+2,1,1,'#14101a'); P(x,y-2,5,1,ln); return; }
    P(x,y,5,5,'#ffffff'); P(x+1,y,3,5,iris); P(x+1,y+3,3,2,irD); P(x+2,y+1,2,2,'#14101a'); P(x+3,y+1,1,1,'#ffffff'); P(x+1,y+3,1,1,'#ffffff');
    P(x-1,y-1,7,1,ln); P(flip?x+5:x-1,y,1,1,ln); if(kind==='sad') P(flip?x+3:x,y,2,1,ln); }); }
// mouth centred on x, at row y; open = talking
function ptMouth(c,x,y,ex,open,o){ o=o||{}; const P=ptP(c), ln=o.line||'#6a2a24', dk='#3a0a14', tn='#d0505e', th='#ffffff';
  if(open){ if(ex==='angry'){ P(x-4,y-2,9,5,dk); P(x-3,y-2,7,1,th); P(x-3,y+2,7,1,th); P(x-1,y,3,1,tn); }
    else if(ex==='surprised'){ P(x-1,y-2,3,5,dk); P(x-2,y-1,5,3,dk); P(x-1,y+1,3,1,tn); }
    else if(ex==='happy'||ex==='blush'){ P(x-3,y-1,7,2,dk); P(x-2,y+1,5,1,dk); P(x-2,y-1,5,1,th); P(x-1,y+1,3,1,tn); }
    else { P(x-2,y-1,5,3,dk); P(x-3,y,7,1,dk); P(x-2,y-1,4,1,th); P(x-1,y+1,3,1,tn); } return; }
  if(ex==='happy'||ex==='blush'){ P(x-3,y-1,1,1,ln); P(x-2,y,5,1,ln); P(x+3,y-1,1,1,ln); }
  else if(ex==='angry'){ P(x-3,y,7,2,'#ffffff'); P(x-3,y,7,1,ln); P(x-3,y+2,7,1,ln); P(x,y,1,2,'#c8c0c0'); }
  else if(ex==='sad'||ex==='worried'){ P(x-3,y+1,1,1,ln); P(x-2,y,5,1,ln); P(x+3,y+1,1,1,ln); }
  else if(ex==='surprised') P(x-1,y-1,3,3,dk);
  else P(x-2,y,5,1,ln); }
function ptBlush(c,y){ const P=ptP(c); P(14,y,6,2,'#f08a94'); P(36,y,6,2,'#f08a94'); P(15,y,1,1,'#ffd0d4'); P(37,y,1,1,'#ffd0d4'); }

// ---------- the cast ----------
const PT_DRAW={
  mira(c,ex,op,old){ const P=ptP(c), C=MC;
    ptBody(c,C.dress,C.dressS,C.dressH); ptPoly(c,[[20,43],[36,43],[34,56],[22,56]],C.apr); P(34,44,2,12,C.aprS);
    P(8,18,10,30,C.hairS); P(38,18,10,28,C.hairS); P(10,20,3,26,C.hair); P(40,22,3,22,C.hair);
    P(24,36,9,8,C.skinS); P(21,41,14,2,'#3a2238'); P(26,42,4,4,C.bell); P(27,43,1,1,'#fff6c8'); P(27,45,2,1,'#a8862e');
    ptHead(c,28,27,12,13,C.skin,'#e0ae92','#fbe4d0');
    ptEyes(c,18,31,24,'#2ea86a',ex,{brow:C.hairS,line:'#5a3a2a'}); P(27,31,2,1,'#d79a88');
    ptMouth(c,28,35,ex,op,{line:'#a8505a'}); if(ex==='blush'||ex==='happy') ptBlush(c,30);
    // fringe and side locks
    ptPoly(c,[[14,18],[16,11],[24,8],[34,8],[41,12],[43,20],[38,17],[35,21],[32,16],[28,20],[25,16],[20,21],[17,17]],C.hair);
    P(16,12,10,2,C.hairH); P(20,10,10,1,'#fff6da'); P(14,18,4,16,C.hair); P(39,18,4,14,C.hair); P(15,30,2,6,C.hairS);
    const eo=(ex==='sad'||ex==='worried')?3:0;
    for(let i=0;i<12;i++){ P(10+Math.round(i*.35)+eo,2+i+eo,8-Math.round(i*.55),1,C.ear); P(38+Math.round(i*.15)-eo,2+i+eo,Math.max(1,9-Math.round(i*.6)),1,C.hair); }
    P(12+eo,6+eo,3,7,C.pink); P(41-eo,6+eo,3,7,C.pink);
    if(old){ P(16,12,3,12,'#d8d8e0'); P(38,14,3,10,'#d8d8e0'); P(18,32,3,1,'#c88a7a'); P(35,32,3,1,'#c88a7a'); } },
  ali(c,ex,op,old){ const P=ptP(c), A=AC2;
    ptBody(c,A.haori,'#100e18',A.haoriL); ptPoly(c,[[22,42],[34,42],[31,56],[25,56]],A.inner); P(26,42,4,8,A.skinS);
    /* lamellar shoulder plates (the sprite model's armour) */ for(const [x0,w] of [[2,16],[38,16]]){ for(let k=0;k<3;k++){ P(x0+(x0<20?k:0),41+k*4,w-k,4,k%2?'#3a3e4a':'#4a4f5c'); P(x0+(x0<20?k:0),44+k*4,w-k,1,'#b8924a'); } P(x0+1,41,w-4,1,'#7a8090'); }
    P(26,30,4,12,A.skinS); ptHead(c,28,30,11,12,A.skin,A.skinS,A.skinH); P(18,36,20,5,A.skinS);
    for(let i=0;i<10;i++) P(19+i*2,38+(i%2),1,1,'#3a2a20');
    P(15,18,26,8,A.hair); P(13,22,4,16,A.hair); P(39,22,4,10,A.hair); P(10,26,4,10,A.hair); P(8,32,3,8,A.hair2);
    // the kasa's shadow over the eyes, with one red eye glowing through
    P(17,26,22,4,'#1a1018'); const gl=ex==='angry'?'#ff4a5a':A.eye;
    if(ex==='happy'||ex==='blush'){ P(30,27,5,1,gl); } else { P(30,26,6,2,gl); P(34,26,2,1,'#ffd0d0'); P(20,27,4,1,'#3a2030'); }
    if(ex==='angry'){ pline(c,29,24,36,25,gl,1); } if(ex==='surprised') P(30,25,6,3,gl);
    P(21,29,1,6,'#e0a090'); ptMouth(c,28,36,ex,op,{line:'#5a2a1e'});
    if(old){ P(14,24,3,10,'#c8c8d0'); P(39,24,3,8,'#c8c8d0'); P(22,40,12,2,'#c8c8d0'); P(17,32,3,1,A.skinS); P(36,32,3,1,A.skinS); }
    // kasa
    ptPoly(c,[[1,25],[55,25],[34,7],[22,7]],A.hat); ptPoly(c,[[1,25],[20,25],[24,8],[22,7]],A.hatS); ptPoly(c,[[34,9],[52,23],[40,24],[33,10]],A.hatL);
    P(1,24,54,2,A.hatD); P(6,21,44,1,A.band); for(let k=8;k<50;k+=6) P(k,19+(Math.abs(k-28)>14?2:0),1,3,A.hatD); P(26,5,4,3,A.hatL); },
  caotan(c,ex,op){ const P=ptP(c);
    ptBody(c,'#f6f3ec','#cfc8bb','#ffffff',45); P(0,46,8,10,'#c98a5e'); P(48,46,8,10,'#c98a5e'); P(1,46,3,10,'#e0a476'); P(22,40,12,6,'#a46a44'); P(20,46,16,3,'#c98a5e');
    ptHead(c,28,27,12,14,'#c98a5e','#a46a44','#e0a476'); P(15,32,4,6,'#a46a44');
    ptPoly(c,[[14,16],[13,9],[18,4],[22,6],[26,2],[30,5],[35,2],[38,7],[43,9],[42,16]],'#22160f'); P(18,5,3,2,'#4a3220'); P(29,4,4,2,'#4a3220'); P(12,12,5,8,'#22160f');
    P(14,16,28,3,'#ffffff'); P(10,17,5,3,'#ffffff'); P(8,19,4,2,'#e8e8e8');
    // the glasses
    P(16,21,11,7,'#14141e'); P(29,21,11,7,'#14141e'); P(17,22,9,5,'#bfe4ff'); P(30,22,9,5,'#bfe4ff'); P(27,23,2,1,'#14141e'); P(18,22,3,1,'#ffffff'); P(31,22,3,1,'#ffffff');
    const ey=ex==='angry'?'#3a3a5a':'#5a6a9a'; if(ex==='happy'||ex==='blush'){ P(19,25,5,1,ey); P(32,25,5,1,ey); } else { P(20,24,3,2,ey); P(33,24,3,2,ey); }
    if(ex==='angry'){ pline(c,16,19,25,21,'#22160f',2); pline(c,31,21,40,19,'#22160f',2); }
    P(27,29,2,3,'#a46a44'); if(op) ptMouth(c,28,35,ex==='surprised'?'surprised':'angry',1); else { P(22,34,12,2,'#7a3a2a'); P(33,33,2,2,'#7a3a2a'); P(23,35,10,1,'#ffffff'); }
    if(ex==='blush') ptBlush(c,30); },
  omar(c,ex,op){ const P=ptP(c);
    ptBody(c,'#15111b','#0a0810','#2a2234'); P(26,44,3,12,'#7a2ac0'); P(27,44,1,12,'#b06aff'); P(10,48,36,1,'#a8a8b8'); P(12,50,32,1,'#6a6a7a');
    ell(c,28,28,17,20,'#15111b'); ptPoly(c,[[12,30],[16,10],[24,2],[30,0],[34,4],[40,10],[44,30]],'#15111b'); P(14,12,3,24,'#2a2234'); P(26,1,4,3,'#2a2234');
    ell(c,28,30,10,11,'#2a2030'); ell(c,28,31,9,9,'#1e1824'); P(19,36,18,4,'#cdb8b0'); P(19,39,18,1,'#a8948c');
    const e=ex==='angry'?'#ff2a3a':ex==='sad'||ex==='worried'?'#c02a4a':'#ff2a3a';
    if(ex==='happy'||ex==='blush'){ P(20,27,6,1,e); P(31,27,6,1,e); } else { P(20,26,6,3,e); P(31,26,6,3,e); P(20,26,2,1,'#fff'); P(31,26,2,1,'#fff'); P(19,27,1,1,'rgba(255,42,58,.5)'); P(37,27,1,1,'rgba(255,42,58,.5)'); }
    if(ex==='angry'){ P(19,24,8,1,e); P(30,24,8,1,e); } if(ex==='surprised'){ P(21,25,4,5,e); P(32,25,4,5,e); }
    if(op) ptMouth(c,28,38,ex,1); else P(24,38,8,1,'#5a3a4a');
    if(ex==='blush'){ P(19,33,4,1,'#c06a8a'); P(33,33,4,1,'#c06a8a'); } },
  caomar(c,ex,op){ PT_DRAW.omar(c,ex,op); const P=ptP(c);
    P(16,22,10,7,'#14141e'); P(30,22,10,7,'#14141e'); P(17,23,8,5,'#ffc8ec'); P(31,23,8,5,'#ffc8ec'); P(26,24,4,1,'#14141e'); P(18,23,2,1,'#fff'); P(32,23,2,1,'#fff');
    P(14,12,28,3,'#ffffff'); P(14,44,28,6,'#f6f3ec'); P(25,45,6,4,'#ff3a7a'); },
  nathan(c,ex,op,raw){ const P=ptP(c);
    if(!raw){ P(0,0,56,56,'#0a1430'); for(let i=0;i<6;i++) P(0,8+i*8,56,1,'rgba(63,244,255,.18)'); P(0,0,56,2,'#3ff4ff'); P(0,54,56,2,'#3ff4ff'); }
    ptBody(c,'#232a4a','#161a30','#34406a'); ptPoly(c,[[6,47],[16,44],[19,56],[4,56]],'#5a3a28'); ptPoly(c,[[40,44],[50,47],[52,56],[37,56]],'#5a3a28'); P(8,47,3,9,'#7a523a');
    P(17,41,22,5,'#e8e4dc'); P(17,44,22,1,'#b8b4ac'); P(27,46,2,10,'#3ff4ff');
    ptHead(c,28,28,12,14,'#c48a5c','#9a6440','#d9a272');
    ptEyes(c,19,31,25,'#2a3a5a',ex,{line:'#1a1626',brow:'#1a1626'});
    ptMouth(c,28,36,ex,op,{line:'#6a3a2a'});
    ptPoly(c,[[13,22],[12,12],[18,6],[22,2],[26,6],[30,1],[34,5],[40,4],[43,13],[44,22],[38,15],[30,18],[22,14],[16,19]],'#1a1626'); P(20,6,6,2,'#34304a'); P(32,4,4,2,'#34304a');
    P(10,20,4,14,'#2a2a38'); pline(c,11,33,15,40,'#2a2a38',2); P(15,40,3,2,'#3ff4ff'); P(42,20,4,14,'#2a2a38'); if(ex==='blush') ptBlush(c,31); },
  grimmaw(c,ex,op){ const P=ptP(c);
    P(4,44,48,12,'#3b3646'); P(4,44,48,2,'#c9a24a'); P(4,46,48,1,'#f0d07a'); P(0,40,12,16,'#3a1c40'); P(44,40,12,16,'#3a1c40'); P(20,48,16,6,'#cfa64a'); P(24,50,8,3,'#6a1a2a'); P(26,51,4,1,'#ff5a6a');
    ell(c,26,28,15,15,'#1c1a22'); ell(c,24,25,10,10,'#2a2733'); P(30,28,22,12,'#1c1a22'); P(30,28,22,2,'#36323f'); P(48,28,4,4,'#0c0b10');
    P(10,4,7,16,'#1c1a22'); P(34,4,7,16,'#34313c'); P(36,8,3,8,'#5b1d2a'); P(12,8,2,8,'#3a2030');
    P(12,14,28,4,'#c9a24a'); P(12,8,4,6,'#c9a24a'); P(24,6,4,8,'#c9a24a'); P(36,8,4,6,'#c9a24a'); P(25,8,2,2,'#e84a5a'); P(12,14,28,1,'#f0d07a');
    const ey=ex==='happy'?'#ffe066':'#ffd45a'; if(ex==='happy'||ex==='blush'){ P(20,23,6,1,ey); P(32,23,6,1,ey); } else { P(20,22,6,3,ey); P(32,22,6,3,ey); P(21,22,1,1,'#fff'); P(33,22,1,1,'#fff'); }
    if(ex==='angry'){ P(18,20,9,2,'#0c0b10'); P(31,20,9,2,'#0c0b10'); } else { P(18,20,9,1,'#0c0b10'); P(31,20,9,1,'#0c0b10'); }
    const jaw=op?(ex==='angry'?5:3):0; P(30,38,22,2+jaw,'#141118'); if(jaw) P(31,39,20,jaw,'#5a1a2a');
    P(30,38,22,1,'#f2efe6'); for(let i=0;i<5;i++) P(32+i*4,39,1,2,'#f2efe6'); if(jaw) for(let i=0;i<5;i++) P(32+i*4,38+jaw,1,2,'#f2efe6');
    if(ex==='angry'){ P(36,35,10,2,'#5b1d2a'); } P(14,30,3,8,'#2a2733'); },
  hound(c,ex,op){ const P=ptP(c);
    P(6,44,44,12,'#7a2a35'); P(6,44,44,1,'#a84a55'); P(6,48,44,2,'#c9a24a'); ell(c,26,28,13,14,'#55525a'); ell(c,25,26,11,12,'#6d6a72'); P(30,28,20,10,'#55525a'); P(30,28,20,2,'#7a777f'); P(46,28,4,4,'#18151c');
    P(12,4,7,14,'#55525a'); P(14,7,3,9,'#3a2a30'); P(32,6,7,12,'#6d6a72'); P(34,9,3,7,'#4a3a40');
    P(31,23,7,4,'#18151c'); P(32,24,5,2,ex==='angry'?'#ff7a3a':'#ffd45a'); P(33,24,1,1,'#fff');
    const jaw=op?3:0; P(30,38,20,2+jaw,'#18151c'); if(jaw) P(31,39,18,jaw,'#5a1a2a'); P(32,38,16,1,'#f2efe6'); },
  elder(c,ex,op){ const P=ptP(c);
    ptBody(c,'#6a5a8a','#4a3a6a','#7a6a9a'); P(20,46,16,10,'#5a4a7a');
    ptHead(c,28,28,12,14,'#c99a78','#a87a5a','#ddb090'); P(17,30,3,1,'#a87a5a'); P(36,30,3,1,'#a87a5a'); P(20,19,4,1,'#a87a5a');
    ptEyes(c,19,31,24,'#4a3a2a',ex,{line:'#5a4030',brow:'#f2f2f2',noBrow:true}); P(17,20,9,2,'#f2f2f2'); P(30,20,9,2,'#f2f2f2'); if(ex==='angry'){ P(22,21,3,1,'#f2f2f2'); P(31,21,3,1,'#f2f2f2'); }
    const bw=op?1:0; ell(c,28,41+bw,12,9,'#e8e4dc'); P(22,33,12,3,'#e8e4dc'); P(18,36,3,8,'#d8d4cc'); P(35,36,3,8,'#d8d4cc'); P(26,46+bw,4,4,'#d8d4cc');
    if(op) { P(25,35,7,3,'#3a1a14'); P(26,35,5,1,'#f2f2f2'); } else P(24,36,8,1,'#b0a090');
    P(27,29,2,4,'#a87a5a'); ptPoly(c,[[12,19],[16,8],[22,4],[34,4],[40,8],[44,19]],'#4a6a8a'); P(12,17,32,3,'#3a5a7a'); P(18,6,10,2,'#6a8aaa'); },
  baker(c,ex,op){ const P=ptP(c);
    ptBody(c,'#c87a4a','#a05a30','#d88a5a'); ptPoly(c,[[18,44],[38,44],[36,56],[20,56]],'#ebe3d2'); P(18,44,20,1,'#c8bfae');
    P(12,14,6,20,'#2a1d16'); P(38,14,6,20,'#2a1d16');
    ptHead(c,28,28,12,14,'#8a5a3e','#6a4028','#a06a4a');
    ptEyes(c,19,31,24,'#2a1a10',ex,{line:'#1a100a'}); ptMouth(c,28,35,ex,op,{line:'#5a2a1e'}); P(27,29,2,3,'#6a4028');
    P(14,12,28,6,'#2a1d16'); P(14,6,28,6,'#ffffff'); ell(c,28,4,12,5,'#ffffff'); P(14,11,28,1,'#d8d8d8'); P(20,1,6,2,'#f2f2f2'); if(ex==='blush') ptBlush(c,30); },
  kid(c,ex,op){ const P=ptP(c);
    ptBody(c,'#d0a03a','#a87a20','#e0b850',46); ptHead(c,28,30,12,13,'#d8a07a','#b8805a','#ecbc94');
    ptEyes(c,19,31,26,'#2a1d16',ex,{line:'#2a1d16'}); ptMouth(c,28,37,ex,op,{line:'#7a3a2a'}); P(17,32,4,2,'#e08a7a'); P(35,32,4,2,'#e08a7a');
    ptPoly(c,[[14,24],[13,14],[20,8],[26,10],[30,6],[36,10],[43,14],[42,24],[36,18],[28,20],[20,18]],'#8a3a1e'); P(20,9,6,2,'#aa5a3a'); },
  villager(c,ex,op,fem){ const P=ptP(c), cl=fem?'#a84a6a':'#5a7a3a', sk=fem?'#f0c9a8':'#c48a5c', hr=fem?'#8a4a2a':'#3a2a1a';
    ptBody(c,cl,cShade(cl,-.25),cShade(cl,.15)); if(fem) ptPoly(c,[[20,44],[36,44],[35,56],[21,56]],'#ede5d4');
    if(fem){ P(12,14,6,24,hr); P(38,14,6,24,hr); }
    ptHead(c,28,28,12,14,sk,cShade(sk,-.18),cShade(sk,.12)); ptEyes(c,19,31,24,fem?'#4a6a3a':'#3a2a1a',ex,{line:'#2a1a10'}); ptMouth(c,28,35,ex,op);
    ptPoly(c,[[14,20],[14,12],[20,7],[36,7],[42,12],[42,20],[36,15],[22,15]],hr); P(20,8,8,1,cShade(hr,.25)); if(ex==='blush') ptBlush(c,30); },
  paul(c,ex,op){ const P=ptP(c);
    ptBody(c,'#3a3f4a','#2a2e36','#4a505c'); P(14,40,28,8,'#4b5160');
    ptHead(c,28,30,12,13,'#d8a882','#b8885e','#ecbc96'); P(18,30,20,6,'#c8956e');
    ptPoly(c,[[8,46],[8,16],[14,8],[28,5],[42,8],[48,16],[48,44],[40,44],[40,18],[34,13],[22,13],[16,18],[16,46]],'#4b5160'); P(12,8,32,3,'#5a6172'); P(16,18,24,6,'rgba(0,0,0,.45)');
    ptEyes(c,19,32,27,'#14101a',ex,{line:'#1a1410',noBrow:true}); if(ex==='angry'){ pline(c,18,25,24,27,'#1a1410',1); pline(c,32,27,38,25,'#1a1410',1); }
    ptMouth(c,28,38,ex,op,{line:'#7a4a3a'}); },
  trainer(c,ex,op){ const P=ptP(c);
    ptBody(c,'#2a2f4a','#1c2036','#3a4060'); P(26,44,4,12,'#3ff4ff');
    ptHead(c,28,29,12,13,'#d8a882','#b8885e','#ecbc96');
    P(14,21,28,8,'#1a1e2e'); P(16,23,24,3,'#3ff4ff'); P(18,23,4,1,'#ffffff'); P(12,22,3,5,'#2a2e44'); P(41,22,3,5,'#2a2e44');
    ptMouth(c,28,36,ex,op,{line:'#7a3a2a'});
    ptPoly(c,[[14,21],[14,12],[20,6],[30,4],[38,7],[42,12],[42,20],[36,16],[22,16]],'#1a1410'); P(22,6,8,1,'#3a3028'); },
  hamza(c,ex,op,giant){ const P=ptP(c);
    ell(c,28,32,20,18,'#d8809e'); ell(c,28,30,18,16,'#f4a6c0'); ell(c,22,24,8,5,'#ffd0e0');
    P(10,8,8,12,'#d8809e'); P(38,8,8,12,'#d8809e'); P(12,11,4,6,'#e07a98'); P(40,11,4,6,'#e07a98');
    if(ex==='happy'||ex==='blush'){ P(17,26,6,1,'#1a1018'); P(18,25,4,1,'#1a1018'); P(32,26,6,1,'#1a1018'); P(33,25,4,1,'#1a1018'); }
    else { P(17,23,6,6,'#ffffff'); P(32,23,6,6,'#ffffff'); P(19,24,3,4,'#1a1018'); P(34,24,3,4,'#1a1018'); P(20,24,1,1,'#ffffff'); P(35,24,1,1,'#ffffff'); if(ex!=='surprised'){ P(16,22,8,2,'#f4a6c0'); P(31,22,8,2,'#f4a6c0'); } }
    if(ex==='angry'){ pline(c,16,20,23,22,'#5a2032',1); pline(c,32,22,39,20,'#5a2032',1); }
    ell(c,28,38,9,6,'#e07a98'); ell(c,28,37,8,5,'#f0a0b8'); P(23,37,3,4,'#5a2032'); P(30,37,3,4,'#5a2032');
    if(op){ P(21,45,14,5,'#3a0010'); P(22,45,12,1,'#ffffff'); P(24,48,8,2,'#d0505e'); } else { P(20,47,16,2,'#5a2032'); if(ex==='happy') { P(19,46,1,1,'#5a2032'); P(36,46,1,1,'#5a2032'); } }
    if(ex==='blush') ptBlush(c,32);
    if(!giant){ c.fillStyle='#ffe680'; for(let i=0;i<36;i++){ const a=i/36*6.283; c.fillRect(Math.round(28+Math.cos(a)*12),Math.round(4+Math.sin(a)*3),1,1); } } },
  group(c,ex,op,kind){ const P=ptP(c), heads=kind==='kids'?[[12,30],[28,26],[44,30],[20,44],[36,44]]:kind==='kid14'?[[28,32]]:[[12,30],[28,24],[44,30],[20,44],[36,44]], sc=kind==='kid14'?1.8:1;
    heads.forEach(([hx,hy],i)=>{ const r=Math.round(6*sc), baby=kind==='babies', sk=baby?['#e8b48a','#d89a70','#c8865e','#f0c8a0','#e8b48a'][i%5]:AC.skin;
      ell(c,hx,hy,r,r,cShade(sk,-.15)); ell(c,hx-1,hy-1,r-1,r-1,sk);
      if(!baby) P(hx-r,hy+r-2,r*2,4,AC.haori); const ey=Math.round(sc*1.5); P(hx-2*sc,hy-1,ey,ey,'#1a1018'); P(hx+sc,hy-1,ey,ey,'#1a1018');
      const o=op&&((i+Math.floor(performance.now()/180))%2===0); if(o) P(hx-sc,hy+2*sc,Math.round(3*sc),Math.round(2*sc),'#3a0a14'); else P(hx-sc,hy+2*sc,Math.round(3*sc),1,'#5a2a1e');
      if(baby){ P(hx-r,hy-r-1,r*2,3,i%2?'#f0d070':'#1a1210'); P(hx-r-1,hy,2,2,'#f08a94'); P(hx+r-1,hy,2,2,'#f08a94'); }
      else { P(hx-r-3,hy-r+1,r*2+6,2,AC.hatD); P(hx-r,hy-r-1,r*2,2,AC.hat); P(hx-r/2,hy-r-3,r,2,AC.hatL); } }); },
};
// who -> drawing
function ptDraw(who,ex,op){ const D=PT_DRAW;
  switch(who){ case 'mira': return c=>D.mira(c,ex,op); case 'miraold': return c=>D.mira(c,ex,op,1); case 'ali': case 'alihelp': return c=>D.ali(c,ex,op); case 'aliold': return c=>D.ali(c,ex,op,1);
    case 'caotan': return c=>D.caotan(c,ex,op); case 'omar': return c=>D.omar(c,ex,op); case 'caomar': return c=>D.caomar(c,ex,op); case 'nathan': return c=>D.nathan(c,ex,op); case 'nathanraw': return c=>D.nathan(c,ex,op,1);
    case 'grimmaw': return c=>D.grimmaw(c,ex,op); case 'hound': return c=>D.hound(c,ex,op); case 'elder': return c=>D.elder(c,ex,op); case 'baker': return c=>D.baker(c,ex,op); case 'kid': return c=>D.kid(c,ex,op);
    case 'villagerm': return c=>D.villager(c,ex,op,0); case 'villagerf': return c=>D.villager(c,ex,op,1); case 'paul': return c=>D.paul(c,ex,op); case 'trainer': return c=>D.trainer(c,ex,op);
    case 'hamza': return c=>D.hamza(c,ex,op); case 'hamzagiant': return c=>D.hamza(c,ex,op,1); case 'babies': case 'kids': case 'kid14': return c=>D.group(c,ex,op,who); }
  return null; }
(function(){ const p0=portrait; portrait=function(who,ex){ ex=ex||'normal'; const tk=typeof cTalk==='function'?cTalk(who):0, op=tk===2?1:0;
    if(who==='shayan'){ const base=p0(who,ex); if(!op) return base; const key='shayan:'+ex+':o'; if(PTC[key]) return PTC[key]; if(!base||!base.width) return base;
      const [cv,c]=mkCanvas(56,56); c.drawImage(base,0,0); const P=ptP(c); if(ex==='angry'){ P(24,41,9,4,'#3a0a14'); P(25,41,7,1,'#ffffff'); } else { P(25,41,6,4,'#3a0a14'); P(26,41,4,1,'#ffffff'); P(26,43,4,1,'#c84a5a'); } PTC[key]=cv; return cv; }
    const fn=ptDraw(who,ex,op); if(!fn) return p0(who,ex); const key=who+':'+ex+':'+op; if(PTC[key]) return PTC[key];
    const [cv,c]=mkCanvas(56,56); try{ fn(c); outlinePass(c,56,56,OUT); }catch(e){ return p0(who,ex); } PTC[key]=cv; return cv; }; })();
