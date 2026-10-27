// =====================================================================
// PORTRAITS for He's Day Old Kojima (id 'grimmaw') and his soldiers (id 'hound', a Snake): see 03k_kojima.js
// =====================================================================
PT_DRAW.grimmaw=function(c,ex,op){ const P=ptP(c), sk='#f0c4a0', skD='#d8a07c', skH='#ffe0c8', hair='#14121a', mus='#2a1a14';
  // the suit, shoulders far too small for the head
  P(14,48,28,8,'#24263a'); P(14,48,8,8,'#3a3e58'); P(25,48,6,8,'#f2eee6'); P(27,49,2,7,'#c8202e'); P(18,51,2,2,'#e0b040');
  // the enormous head
  ell(c,28,27,25,23,skD); ell(c,28,26,24,22,sk); ell(c,19,16,9,6,skH); P(2,24,4,9,skD);
  ell(c,28,9,22,8,hair); P(4,8,7,14,hair); ptPoly(c,[[12,4],[44,5],[50,14],[36,10],[20,11]],hair); P(18,4,14,2,'#34303e'); P(27,0,2,4,hair); P(29,0,4,2,hair); P(32,1,2,3,hair);
  // round glasses (eyes behind them, by expression)
  for(const x0 of [18,38]){ ell(c,x0,25,8,7,'#101014'); ell(c,x0,25,7,6,'#cfe6ff'); ell(c,x0+1,26,5,3,'#9ab8d8');
    if(ex==='happy'||ex==='blush') P(x0-3,25,6,1,'#14121a'); else if(ex==='surprised'){ P(x0-1,23,3,4,'#14121a'); } else { P(x0-1,24,3,3,'#14121a'); P(x0,24,1,1,'#ffffff'); } P(x0-5,21,2,1,'#ffffff'); }
  P(25,24,6,2,'#101014');
  if(ex==='angry'){ pline(c,11,16,23,19,hair,2); pline(c,45,16,33,19,hair,2); } else if(ex==='sad'||ex==='worried'){ pline(c,11,18,23,15,hair,2); pline(c,45,18,33,15,hair,2); } else { P(12,16,11,2,hair); P(33,16,11,2,hair); }
  P(26,30,4,5,skD); ell(c,12,34,3,2,'#f4a0a0'); ell(c,44,34,3,2,'#f4a0a0');
  // the moustache, waxed into curls
  ell(c,21,38,8,3,mus); ell(c,35,38,8,3,mus); P(11,35,3,3,mus); P(42,35,3,3,mus); P(10,33,2,2,mus); P(44,33,2,2,mus); P(17,36,8,1,'#4a3024'); P(31,36,8,1,'#4a3024');
  if(op){ P(23,41,10,4,'#5a1a24'); P(24,41,8,1,'#ffffff'); } else if(ex==='happy') { P(22,42,12,1,'#7a3a2a'); P(21,41,1,1,'#7a3a2a'); P(34,41,1,1,'#7a3a2a'); } else P(24,42,8,1,'#9a5a44');
  if(ex==='blush'){ ell(c,12,33,4,2,'#ff7a8a'); ell(c,44,33,4,2,'#ff7a8a'); } };
PT_DRAW.hound=function(c,ex,op){ const P=ptP(c), sk='#d8a888', skD='#b08060', hair='#5a3a24', band='#1a2234';
  ptBody(c,'#3e4a5e','#2c3646','#5a6a82'); pline(c,10,48,24,56,'#141820',2); pline(c,46,48,32,56,'#141820',2);
  ptHead(c,28,29,12,14,sk,skD,'#e8c0a0'); P(15,12,26,6,hair); P(13,16,4,16,hair); P(40,16,3,10,hair); P(11,30,4,12,'#3a2416');
  P(14,17,28,4,band); P(8,18,7,2,band); P(4,20,6,2,band); P(8,22,5,2,band);
  ptEyes(c,19,31,25,'#4a5a6a',ex==='happy'?'normal':ex,{line:'#2a1a14',brow:'#3a2416'});
  P(18,35,20,5,'#8a6a50'); P(20,36,16,1,'#9a7a5a'); ptMouth(c,28,38,ex==='happy'?'normal':ex,op,{line:'#5a2a1e'}); P(27,30,2,3,skD); };
