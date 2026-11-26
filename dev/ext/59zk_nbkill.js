// =====================================================================
// ALI'S ROAD, THE LAST CHOICE: SAVE or KILL Nathan (after phase III, before the finale).
// SAVE = the road's normal ending (nbFinale). KILL = `nkEnding`: a pixel-art film drawn on its own 384x216 canvas (NK.cv,
// shown over the game by a drawUI wrapper, the dialogue box drawn again on top). Scenes are functions NKS[id](c,t,p)
// (t = seconds in the scene, p = values the script tweens). The one playable beat is the first-person beating (`nkPunchOut`:
// attack = left fist, block = right fist; the face gets worse every 4 punches). The stomp is only ever a silhouette and a cut to black.
// Inspired-by screens only: the JRPG and the RTS on his monitor are generic stand-ins drawn here, no real game's art.
// =====================================================================
const NK={on:0,scene:'',t:0,p:{},cv:null,c:null,sub:null,shake:0,fade:0,flash:0,bars:1};
NAMES.nathanirl='Nathan (Real Life)';
(function(){ const pf=portrait; portrait=function(who,ex){ return pf.call(this,who==='nathanirl'?'nathanraw':who,ex); }; })();
function nkPx(c,x,y,w,h,col){ c.fillStyle=col; c.fillRect(Math.round(x),Math.round(y),Math.max(0,Math.round(w)),Math.max(0,Math.round(h))); }
function nkRnd(i,k){ const s=Math.sin(i*127.1+k*311.7)*43758.5453; return s-Math.floor(s); }
function nkStars(c,n,ox,oy,seed,col){ for(let i=0;i<n;i++){ const x=((nkRnd(i,seed)*384+ox)%384+384)%384, y=((nkRnd(i,seed+7)*216+oy)%216+216)%216; nkPx(c,x,y,nkRnd(i,seed+3)<.12?2:1,1,col||(i%5?'#cfd8ff':'#ffffff')); } }
function nkScene(id,p){ NK.scene=id; NK.t=0; NK.p=Object.assign({zoom:1,zx:192,zy:108},p||{}); /* the camera always has numbers: a tween from an unset zoom was NaN and blanked the frame */ NK.sub=null; }
function nkSub(who,text,dur){ NK.sub={who,text,t:0,dur:dur||2.2}; }
// ---------- the cast, drawn small and simple so every pose is possible ----------
// o: kind 'gn' game Nathan (jacket, scarf) | 'rn' real Nathan (hoodie, headset) ; f facing ; sc scale ; rot radians ; sil silhouette colour ;
//    arms 'down'|'up'|'fwd'|'guard' ; face 'calm'|'shock'|'ko'|'none' ; sit ; hood (gn wearing the hoodie) ; nohead
function nkGuy(c,x,y,o){ o=o||{}; const sil=o.sil, K=(col)=>sil||col, rn=o.kind==='rn'||o.hood, sc=o.sc||1; c.save(); c.translate(Math.round(x),Math.round(y)); c.scale((o.f||1)*sc,sc); if(o.rot) c.rotate(o.rot);
  const top=rn?'#6a7684':'#7a4a2a', top2=rn?'#4c5662':'#5a3418', leg='#1c2440', skin='#d89a6a';
  if(o.sit){ nkPx(c,-5,-12,11,5,K(leg)); nkPx(c,4,-12,4,12,K(leg)); nkPx(c,4,-2,6,2,K('#14141c')); }
  else { const w=o.walk?Math.round(Math.sin(o.walk)*2):0; nkPx(c,-5,-13,4,13,K(leg)); nkPx(c,1,-13,4,13,K(leg)); nkPx(c,-6+w,-2,6,2,K('#14141c')); nkPx(c,1-w,-2,6,2,K('#14141c')); }
  const ty=o.sit?-26:-27; nkPx(c,-7,ty,14,15,K(top)); nkPx(c,-7,ty+12,14,3,K(top2));
  if(!rn){ nkPx(c,-1,ty+1,2,13,K('#3ff4ff')); nkPx(c,-7,ty-1,14,3,K('#e8e2d2')); } else { nkPx(c,-3,ty+7,6,4,K(top2)); nkPx(c,-2,ty,1,5,K('#d8dde4')); nkPx(c,1,ty,1,5,K('#d8dde4')); }
  const A=o.arms||'down'; if(A==='up'){ nkPx(c,-10,ty-9,3,12,K(top)); nkPx(c,7,ty-9,3,12,K(top)); nkPx(c,-10,ty-12,3,3,K(skin)); nkPx(c,7,ty-12,3,3,K(skin)); }
  else if(A==='fwd'){ nkPx(c,5,ty+2,12,3,K(top)); nkPx(c,17,ty+2,3,3,K(skin)); nkPx(c,-10,ty+1,3,10,K(top)); }
  else if(A==='guard'){ nkPx(c,3,ty-4,3,9,K(top)); nkPx(c,-6,ty-4,3,9,K(top)); nkPx(c,3,ty-7,3,3,K(skin)); nkPx(c,-6,ty-7,3,3,K(skin)); }
  else { nkPx(c,-10,ty+1,3,11,K(top)); nkPx(c,7,ty+1,3,11,K(top)); nkPx(c,-10,ty+12,3,3,K(skin)); nkPx(c,7,ty+12,3,3,K(skin)); }
  if(!o.nohead){ const hy=ty-12; nkPx(c,-6,hy,12,11,K(skin)); nkPx(c,-7,hy-3,14,6,K('#16141e')); nkPx(c,-8,hy-1,3,6,K('#16141e')); nkPx(c,5,hy-1,3,5,K('#16141e')); nkPx(c,-5,hy-5,3,3,K('#16141e')); nkPx(c,0,hy-6,4,4,K('#16141e')); nkPx(c,4,hy-4,3,2,K('#16141e'));
    if(!sil){ const F=o.face||'calm'; if(F==='shock'){ nkPx(c,-3,hy+4,3,3,'#ffffff'); nkPx(c,2,hy+4,3,3,'#ffffff'); nkPx(c,-2,hy+5,1,1,'#16141e'); nkPx(c,3,hy+5,1,1,'#16141e'); nkPx(c,-1,hy+8,3,3,'#3a1418'); }
      else if(F==='ko'){ nkPx(c,-3,hy+5,3,1,'#16141e'); nkPx(c,2,hy+5,3,1,'#16141e'); nkPx(c,-1,hy+8,3,1,'#3a1418'); }
      else if(F!=='none'){ nkPx(c,-3,hy+4,2,2,'#16141e'); nkPx(c,2,hy+4,2,2,'#16141e'); nkPx(c,-1,hy+8,3,1,'#8a4a3a'); }
      if(!rn) nkPx(c,-4,hy+6,2,1,'#3ff4ff'); }
    if(o.kind==='rn'||o.headset){ nkPx(c,-8,hy-4,16,2,K('#22242c')); nkPx(c,-9,hy+1,3,6,K('#22242c')); nkPx(c,6,hy+1,3,6,K('#22242c')); if(!sil) nkPx(c,-9,hy+3,1,2,'#5aff8a'); nkPx(c,6,hy+7,5,1,K('#22242c')); } }
  c.restore(); }
// Ali: the hat, the robe, the sword. pose 'stand'|'kick'|'fly'|'reach'|'kneel'|'stomp'; arm 0..1 (the raised fist or the lifted foot)
function nkAli(c,x,y,o){ o=o||{}; const sil=o.sil, K=(col)=>sil||col, sc=o.sc||1, P=o.pose||'stand', a=o.arm||0; c.save(); c.translate(Math.round(x),Math.round(y)); c.scale((o.f||1)*sc,sc); if(o.rot) c.rotate(o.rot);
  const robe='#2a3048', robe2='#1c2034', sash='#b0182a';
  if(P==='kneel'){ nkPx(c,-7,-8,16,8,K(robe2)); nkPx(c,-6,-24,13,17,K(robe)); nkPx(c,-6,-12,13,2,K(sash)); const ay=-30-a*10; nkPx(c,5,ay+6,3,Math.max(2,-12-ay),K(robe)); nkPx(c,4,ay+2,5,5,K('#d8b088')); nkPx(c,-9,-20,3,10,K(robe)); }
  else { const lift=P==='stomp'?Math.round(a*13):0; nkPx(c,-5,-13,4,13,K(robe2)); if(P==='kick'){ nkPx(c,1,-14,15,4,K(robe2)); nkPx(c,15,-15,4,6,K('#14141c')); } else { nkPx(c,1,-13-lift,4,13,K(robe2)); nkPx(c,0,-2-lift,7,2,K('#14141c')); } nkPx(c,-6,-2,6,2,K('#14141c'));
    nkPx(c,-7,-28,14,16,K(robe)); nkPx(c,-7,-15,14,2,K(sash)); nkPx(c,-8,-13,16,3,K(robe2));
    if(P==='reach'){ nkPx(c,6,-25,13,3,K(robe)); nkPx(c,18,-26,4,4,K('#d8b088')); } else nkPx(c,7,-26,3,11,K(robe)); nkPx(c,-10,-26,3,11,K(robe));
    c.fillStyle=K('#1a1a22'); c.fillRect(-12,-16,2,1); c.save(); c.translate(-9,-15); c.rotate(-.5); c.fillRect(-16,0,20,2); c.restore(); }
  const hy=P==='kneel'?-35:-39; nkPx(c,-5,hy,10,9,K('#3a2a22')); if(!sil){ nkPx(c,-5,hy+6,10,3,'#c89878'); nkPx(c,-1,hy+7,3,1,'#5a2a22'); }
  c.fillStyle=K('#c8a060'); c.beginPath(); c.moveTo(-14,hy+3); c.lineTo(0,hy-7); c.lineTo(14,hy+3); c.closePath(); c.fill(); nkPx(c,-14,hy+3,28,2,K('#8a6a38'));
  c.restore(); }
function nkEarth(c,x,y,r){ c.save(); c.beginPath(); c.arc(x,y,Math.max(1,r),0,7); c.clip(); nkPx(c,x-r,y-r,r*2,r*2,'#1c4a9a'); nkPx(c,x-r,y-r,r*2,r*.5,'#2a62b8');
  const L=[[-.5,-.45,.55,.5],[-.35,.05,.3,.6],[.15,-.5,.6,.45],[.35,.0,.4,.35],[.55,.4,.25,.2],[-.8,.5,.3,.2]]; for(const [a,b,w,h] of L){ nkPx(c,x+a*r,y+b*r,w*r,h*r,'#3a8a4a'); nkPx(c,x+(a+.05)*r,y+(b+.08)*r,w*r*.6,h*r*.5,'#58a85a'); }
  for(let i=0;i<9;i++) nkPx(c,x+(nkRnd(i,3)*2-1)*r,y+(nkRnd(i,5)*2-1)*r,r*.5,Math.max(1,r*.08),'rgba(255,255,255,.55)'); nkPx(c,x-r,y+r*.86,r*2,r*.2,'#e8f0ff'); nkPx(c,x-r,y-r,r*2,r*.12,'#e8f0ff');
  const g=c.createLinearGradient(x-r,y,x+r,y); g.addColorStop(0,'rgba(0,0,10,0)'); g.addColorStop(1,'rgba(0,0,10,.7)'); c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); c.restore(); }
// the bedroom, shared by five scenes. o: screen fn(c,x,y,w,h), hole, dark 0..1, tarp, clean, morning
function nkRoom(c,t,o){ o=o||{}; nkPx(c,0,0,384,216,o.morning?'#4a4658':'#2a2438'); for(let i=0;i<8;i++) nkPx(c,i*48,0,1,150,'rgba(0,0,0,.14)'); nkPx(c,0,150,384,66,'#3a2e30'); for(let i=0;i<12;i++) nkPx(c,i*34-((i*13)%9),150+((i*7)%5)*13,30,1,'rgba(0,0,0,.2)'); nkPx(c,0,148,384,3,'#1c1622');
  nkPx(c,20,24,46,60,'#16203a'); nkPx(c,23,27,40,54,o.morning?'#8ab8e8':'#0c1430'); if(!o.morning){ c.fillStyle='#e8ecff'; c.beginPath(); c.arc(50,44,7,0,7); c.fill(); } nkPx(c,42,27,2,54,'#16203a'); nkPx(c,23,53,40,2,'#16203a');
  nkPx(c,300,30,50,66,'#3a1c2c'); nkPx(c,304,34,42,58,'#141024'); c.fillStyle='#e8ecff'; c.beginPath(); c.arc(325,54,10,0,7); c.fill(); nkPx(c,318,72,14,16,'#2a3048'); nkPx(c,308,86,34,3,'#c8a060');
  nkPx(c,96,112,128,6,'#5a4030'); nkPx(c,100,118,6,34,'#3e2c20'); nkPx(c,214,118,6,34,'#3e2c20'); nkPx(c,186,120,26,30,'#22222c'); nkPx(c,190,124,3,3,'#5aff8a');
  nkPx(c,122,62,78,48,'#14141c'); nkPx(c,156,108,10,5,'#14141c'); if(o.screen) o.screen(c,125,65,72,42); else nkPx(c,125,65,72,42,'#060810');
  nkPx(c,128,113,34,3,'#2c2c38'); nkPx(c,170,113,7,3,'#2c2c38'); if(!o.dark||o.dark<.6){ const gl=c.createRadialGradient(161,86,4,161,86,90); gl.addColorStop(0,'rgba(120,170,255,.22)'); gl.addColorStop(1,'rgba(120,170,255,0)'); c.fillStyle=gl; c.fillRect(60,10,210,170); }
  if(o.hole){ c.fillStyle='#0a0c1c'; c.beginPath(); c.moveTo(232,0); c.lineTo(246,16); c.lineTo(262,9); c.lineTo(280,20); c.lineTo(298,8); c.lineTo(306,0); c.closePath(); c.fill(); nkStars(c,8,0,0,91,'#ffffff'); if(o.tarp){ nkPx(c,228,0,84,22,'#2a6ad8'); for(let i=0;i<5;i++) nkPx(c,226+i*20,3+(i%2)*9,12,3,'#b8bcc4'); }
    else { const sh=c.createLinearGradient(0,0,0,170); sh.addColorStop(0,'rgba(200,215,255,.20)'); sh.addColorStop(1,'rgba(200,215,255,0)'); c.fillStyle=sh; c.beginPath(); c.moveTo(236,0); c.lineTo(302,0); c.lineTo(330,170); c.lineTo(220,170); c.closePath(); c.fill(); }
    if(!o.clean){ for(let i=0;i<16;i++){ const rx=232+nkRnd(i,2)*90, ry=150+nkRnd(i,4)*22; nkPx(c,rx,ry-nkRnd(i,6)*8,5+nkRnd(i,8)*9,4+nkRnd(i,9)*6,i%3?'#5a5058':'#7a6a5a'); } } }
  if(o.dark){ nkPx(c,0,0,384,216,'rgba(4,4,12,'+o.dark+')'); } }
function nkTitleScreen(c,x,y,w,h,t){ nkPx(c,x,y,w,h,'#0a0c24'); c.fillStyle='#e8ecff'; c.beginPath(); c.arc(x+w/2,y+15,8,0,7); c.fill(); nkPx(c,x+w/2-1,y+10,6,10,'#0a0c24'); for(let i=0;i<10;i++) nkPx(c,x+nkRnd(i,1)*w,y+nkRnd(i,2)*20,1,1,'#ffffff'); nkPx(c,x+10,y+28,w-20,2,'#d8b46a'); nkPx(c,x+16,y+32,w-32,1,'#d8b46a'); if(Math.sin(t*5)>0) nkPx(c,x+w/2-8,y+37,16,1,'#ffffff'); }
function nkJrpgScreen(c,x,y,w,h,t){ nkPx(c,x,y,w,h,'#7ab8e8'); nkPx(c,x,y+16,w,h-16,'#5aa84a'); nkPx(c,x,y+16,w,3,'#8ad06a'); c.fillStyle='#4a6a8a'; c.beginPath(); c.moveTo(x+8,y+17); c.lineTo(x+20,y+4); c.lineTo(x+26,y+8); c.lineTo(x+30,y+1); c.lineTo(x+36,y+9); c.lineTo(x+44,y+17); c.closePath(); c.fill(); nkPx(c,x+29,y-1+2,2,7,'#4a6a8a');
  for(let i=0;i<3;i++){ nkPx(c,x+26+i*8,y+26-(i===1?2:0),3,6,['#c83a3a','#3a5ac8','#e8c84a'][i]); nkPx(c,x+26+i*8,y+24-(i===1?2:0),3,2,'#e8c8a0'); } nkPx(c,x+52,y+20,7,8,'#6a3a7a'); nkPx(c,x+50,y+18,3,3,'#6a3a7a');
  const n=Math.floor(t*2)%3; c.fillStyle='#ffffff'; c.font='6px monospace'; c.fillText(['128','64','999'][n],x+50,y+15-((t*2)%1)*4);
  for(let i=0;i<7;i++) nkPx(c,x+8+i*8,y+h-8,6,6,i===Math.floor(t*1.5)%7?'#ffe06a':['#c83a3a','#3a8ac8','#5ac86a','#c86ac8'][i%4]); for(let i=0;i<3;i++){ nkPx(c,x+2,y+2+i*4,14,2,'#102030'); nkPx(c,x+2,y+2+i*4,14-i*3,2,'#6aff8a'); } }
function nkRtsScreen(c,x,y,w,h,t){ nkPx(c,x,y,w,h,'#3a2c22'); for(let i=0;i<14;i++) nkPx(c,x+nkRnd(i,11)*w,y+nkRnd(i,12)*(h-10),5,3,'#4a3a2c'); for(let i=0;i<4;i++){ nkPx(c,x+6+i*3,y+8+i*2,3,5,'#5ad8ff'); nkPx(c,x+7+i*3,y+7+i*2,1,2,'#c8f4ff'); }
  nkPx(c,x+26,y+10,12,9,'#5a6a8a'); nkPx(c,x+28,y+8,8,3,'#8a9ab8'); nkPx(c,x+42,y+18,8,6,'#5a6a8a'); for(let i=0;i<6;i++){ const u=(t*.5+i*.17)%1; nkPx(c,x+12+u*16,y+14+Math.sin(i*2+t*3)*2,2,2,'#e8e8ff'); } for(let i=0;i<5;i++) nkPx(c,x+52+i*3,y+26+(i%2)*3,2,3,'#c83a3a');
  nkPx(c,x,y+h-10,w,10,'#14181c'); nkPx(c,x+1,y+h-9,12,8,'#0a2a14'); nkPx(c,x+4,y+h-6,2,2,'#5aff8a'); nkPx(c,x+9,y+h-4,2,1,'#ff5a5a'); for(let i=0;i<6;i++) nkPx(c,x+w-20+(i%3)*6,y+h-9+Math.floor(i/3)*4,5,3,'#2a3a5a'); c.fillStyle='#8af0ff'; c.font='5px monospace'; c.fillText('350  125',x+w-28,y+6); }
function nkDiscord(c,x,y,w,h,t,joined){ nkPx(c,x,y,w,h,'#23252c'); nkPx(c,x,y,10,h,'#1a1b20'); for(let i=0;i<4;i++){ c.fillStyle=['#5865f2','#3aa85a','#c8683a','#8a8a92'][i]; c.beginPath(); c.arc(x+5,y+6+i*9,3,0,7); c.fill(); }
  c.font='5px monospace'; c.fillStyle='#8a8e9a'; c.fillText('#dailies',x+13,y+7); c.fillStyle='#b8bcc8'; c.fillText('VOICE',x+13,y+16); c.fillStyle='#5aff8a'; c.fillText('o Shayan',x+14,y+24); if(joined){ c.fillStyle=Math.sin(t*8)>0?'#5aff8a':'#b8bcc8'; c.fillText('o Nathan',x+14,y+31); } }
// ---------- the scenes ----------
const NKS={
  // the field: he is on his knees; the kick sends him up
  field(c,t,p){ nkPx(c,0,0,384,216,'#060818'); nkStars(c,70,0,0,1); const cam=(p.cam||0)*150; c.fillStyle='#dfe6ff'; for(let i=0;i<5;i++){ c.beginPath(); c.arc(290+i*9-(i%2)*14,40+cam+(i*7)%13,5+(i%3)*2,0,7); c.fill(); }
    nkPx(c,0,168+cam,384,60,'#122044'); for(let i=0;i<60;i++){ const x=nkRnd(i,21)*384, y=170+nkRnd(i,22)*44+cam; nkPx(c,x,y,1,3,'#2a4a7a'); nkPx(c,x-1,y-1,3,1,i%3?'#8ab0e8':'#e8f0ff'); }
    const ny=176+cam-(p.up||0)*420; if(p.up>0){ for(let i=1;i<7;i++) nkPx(c,238-1,ny+i*14,3,10,'rgba(255,255,255,'+(.5-i*.07)+')'); } nkGuy(c,238,ny,{kind:'gn',f:-1,face:p.up>0?'shock':'ko',arms:p.up>0?'up':'down',rot:p.up>0?t*14:0,sit:!(p.up>0)});
    nkAli(c,196,176+cam,{f:1,pose:p.kick?'kick':'stand'}); if(p.star>0){ const s=p.star*9; nkPx(c,238-s/2,14,s,1,'#ffffff'); nkPx(c,238,14-s/2,1,s,'#ffffff'); } },
  // space: he tumbles; Ali arrives; the planet waits
  space(c,t,p){ nkPx(c,0,0,384,216,'#02030c'); nkStars(c,120,-t*6,0,3); nkStars(c,40,-t*18,0,5,'#8a9ad8'); c.fillStyle='#dfe6ff'; for(let i=0;i<4;i++){ c.beginPath(); c.arc(40+i*13,170+((i*9)%11)-t*2,6+(i%2)*3,0,7); c.fill(); }
    nkEarth(c,300+(p.ex||0),70+(p.ey||0),20+(p.er||0)); const nx=p.nx==null?170:p.nx, ny=p.ny==null?110:p.ny; if(p.comet){ for(let i=1;i<9;i++) nkPx(c,nx-i*7*(p.cdx||1),ny+i*3*(p.cdy||-1),6-i*.5,3,i<3?'#ffe6a0':'#ff8a3a'); }
    if(!p.held) nkGuy(c,nx,ny,{kind:'gn',face:'shock',arms:'up',rot:p.spin!=null?p.spin:t*5,sc:p.ns||1});
    if(p.ali){ const ax=p.ax, ay=p.ay; if(p.streak){ for(let i=1;i<10;i++) nkPx(c,ax-i*9,ay-20+i,8,2,'rgba(255,60,80,'+(.6-i*.06)+')'); } if(p.held){ const a=p.swing||0; nkGuy(c,ax+Math.cos(a)*30,ay-18+Math.sin(a)*30,{kind:'gn',face:'shock',arms:'up',rot:a+1.57}); } nkAli(c,ax,ay,{f:1,pose:p.held?'reach':'stand',rot:p.lean||0}); } },
  // the planet fills the screen; the comet goes in
  earth(c,t,p){ nkPx(c,0,0,384,216,'#02030c'); nkStars(c,60,0,0,9); nkEarth(c,192,150+(1-(p.z||0))*40,90+(p.z||0)*240); const u=p.u||0, x=40+u*150, y=20+u*90; for(let i=1;i<12;i++) nkPx(c,x-i*6,y-i*3.6,8-i*.5,4-i*.2,i<4?'#ffffff':i<8?'#ffd06a':'#ff6a2a'); nkPx(c,x-2,y-2,5,5,'#ffffff'); },
  // a quiet street; then not
  house(c,t,p){ nkPx(c,0,0,384,216,'#0a1028'); nkStars(c,50,0,0,13); c.fillStyle='#e8ecff'; c.beginPath(); c.arc(60,40,12,0,7); c.fill(); nkPx(c,0,176,384,40,'#16241c'); nkPx(c,0,190,384,26,'#22222a'); for(let i=0;i<6;i++) nkPx(c,i*70+10,202,30,2,'#c8c8a0');
    for(const hx of [20,290]){ nkPx(c,hx,130,70,46,'#1c2238'); c.fillStyle='#141828'; c.beginPath(); c.moveTo(hx-6,130); c.lineTo(hx+35,104); c.lineTo(hx+76,130); c.closePath(); c.fill(); nkPx(c,hx+12,144,12,12,'#0c1020'); }
    const sh=(p.hit||0)>0?Math.round(Math.sin(t*60)*2*(1-Math.min(1,t))):0; nkPx(c,130+sh,112,124,64,'#3a3448'); nkPx(c,130+sh,112,124,4,'#2a2434'); c.fillStyle='#5a2a2a'; c.beginPath(); c.moveTo(120+sh,114); c.lineTo(192+sh,70); c.lineTo(264+sh,114); c.closePath(); c.fill(); for(let i=0;i<5;i++) nkPx(c,138+i*26+sh,104-i*0,20,2,'rgba(0,0,0,.2)');
    nkPx(c,150+sh,128,26,22,'#8ab8ff'); nkPx(c,152+sh,130,22,18,p.hit?'#ffffff':'#a8ccff'); nkPx(c,162+sh,128,2,22,'#3a3448'); nkPx(c,206+sh,140,20,36,'#2a1c1c'); nkPx(c,222+sh,158,2,2,'#d8b46a'); nkPx(c,96,160,3,16,'#5a5a62'); nkPx(c,92,154,11,7,'#8a2a2a');
    if(p.hit){ c.fillStyle='#0a0c1c'; c.beginPath(); c.moveTo(196,84); c.lineTo(210,74); c.lineTo(226,88); c.lineTo(216,100); c.lineTo(200,98); c.closePath(); c.fill(); for(let i=0;i<22;i++){ const a=nkRnd(i,31)*6.28, v=20+nkRnd(i,32)*70, q=Math.min(1.6,t); nkPx(c,210+Math.cos(a)*v*q,90+Math.sin(a)*v*q*.7+q*q*38,3+nkRnd(i,33)*4,3,i%2?'#5a2a2a':'#7a6a5a'); } const d=Math.min(1,t/1.2); c.fillStyle='rgba(200,200,210,'+(.5*(1-d))+')'; c.beginPath(); c.arc(210,88,10+d*46,0,7); c.fill(); }
    else { const u=p.u||0, x=384-u*176, y=-20+u*108; for(let i=1;i<12;i++) nkPx(c,x+i*7,y-i*4.3,8-i*.5,4,i<4?'#ffffff':i<8?'#ffd06a':'#ff6a2a'); nkPx(c,x-2,y-2,6,6,'#ffffff'); } },
  // his room. He is playing the game.
  room(c,t,p){ nkRoom(c,t,{hole:p.hole,screen:(c2,x,y,w,h)=>nkTitleScreen(c2,x,y,w,h,t),dark:p.dark}); if(p.hole) nkGuy(c,276,172,{kind:'gn',rot:-1.5,face:'ko',f:1});
    if(p.rn!==0){ const rx=p.rx==null?150:p.rx, ry=p.ry==null?150:p.ry; if(p.chair!==0){ nkPx(c,138,120,26,4,'#22222c'); nkPx(c,136,96,5,28,'#22222c'); nkPx(c,149,124,3,24,'#22222c'); nkPx(c,138,148,26,3,'#22222c'); } nkGuy(c,rx,ry,{kind:'rn',f:p.rf||1,sit:p.rsit!==0,face:p.rface||'calm',arms:p.rarms||'fwd',rot:p.rrot||0}); }
    if(p.ali){ nkAli(c,p.ax,p.ay,{f:p.af||-1,pose:p.apose||'stand',arm:p.aarm||0}); } },
  // first person. Two fists, one face.
  fpv(c,t,p){ const F=NK.fp||{n:0,l:0,r:0,st:0,hitT:9}, st=F.st, jx=F.hitT<.12?(F.side>0?-5:5):0, jy=F.hitT<.12?2:0; nkPx(c,0,0,384,216,'#3a2e30'); for(let i=0;i<16;i++) nkPx(c,i*30-((i*13)%9),((i*37)%11)*20,26,1,'rgba(0,0,0,.2)');
    for(let i=0;i<st*5;i++){ const a=nkRnd(i,41)*6.28, r=60+nkRnd(i,42)*120; nkPx(c,192+Math.cos(a)*r,100+Math.sin(a)*r*.7,3+nkRnd(i,43)*9,2+nkRnd(i,44)*5,i%3?'#7a0c16':'#a8141e'); }
    c.save(); c.translate(192+jx,96+jy); c.rotate((F.hitT<.12?F.side*.06:0)+Math.sin(t*1.3)*.01);
    nkPx(c,-70,34,140,90,'#6a7684'); nkPx(c,-70,34,140,8,'#4c5662'); nkPx(c,-8,34,4,40,'#d8dde4'); nkPx(c,6,34,4,40,'#d8dde4'); nkPx(c,-16,22,32,16,'#c88a5c');
    nkPx(c,-44,-52,88,84,'#d89a6a'); nkPx(c,-44,24,88,8,'#c88a5c'); nkPx(c,-50,-70,100,30,'#16141e'); nkPx(c,-54,-52,14,40,'#16141e'); nkPx(c,42,-52,12,34,'#16141e'); nkPx(c,-34,-82,22,16,'#16141e'); nkPx(c,-2,-86,26,18,'#16141e'); nkPx(c,26,-78,18,12,'#16141e');
    nkPx(c,-60,-76,120,8,'#22242c'); nkPx(c,-64,-50,14,40,'#22242c'); nkPx(c,50,-50,14,40,'#22242c'); nkPx(c,-62,-36,3,8,'#5aff8a');
    const eyeL=st>=3, eyeR=st>=5; if(eyeL){ nkPx(c,-32,-24,24,16,'#5a2a5a'); nkPx(c,-30,-16,20,3,'#16141e'); } else { nkPx(c,-30,-24,20,14,'#ffffff'); nkPx(c,-22+(F.hitT<.3?2:0),-20,8,8,'#16141e'); } if(eyeR){ nkPx(c,8,-24,24,16,'#5a2a5a'); nkPx(c,10,-16,20,3,'#16141e'); } else { nkPx(c,10,-24,20,14,'#ffffff'); nkPx(c,14+(F.hitT<.3?-2:0),-20,8,8,'#16141e'); }
    nkPx(c,-32,-34+(st?2:-3),22,4,'#16141e'); nkPx(c,10,-34+(st?2:-3),22,4,'#16141e'); nkPx(c,-6,-8,12,14,'#c88a5c'); if(st>=1){ nkPx(c,-4,6,4,10+st*3,'#a8141e'); nkPx(c,2,6,3,6+st*2,'#a8141e'); } if(st>=2){ nkPx(c,-38,0,16,10,'#8a4a6a'); nkPx(c,22,-4,14,10,'#8a4a6a'); }
    const mo=F.hitT<.4||st>=4; nkPx(c,-16,14,32,mo?12:4,'#3a1418'); if(mo) nkPx(c,-12,14,24,3,'#ffffff'); if(st>=4){ nkPx(c,-2,14,5,3,'#3a1418'); nkPx(c,-14,24,10,8,'#a8141e'); nkPx(c,-20,26,6,12,'#a8141e'); } if(st>=5){ nkPx(c,-40,-48,20,5,'#a8141e'); nkPx(c,-44,-44,5,30,'#a8141e'); nkPx(c,20,10,18,6,'#7a0c16'); } if(st>=6){ nkPx(c,-44,-52,88,84,'rgba(140,10,20,.38)'); nkPx(c,-30,-40,60,6,'#7a0c16'); nkPx(c,4,-10,30,5,'#7a0c16'); }
    if(st<5){ const hu=Math.sin(t*9)*2; nkPx(c,-96,40+hu,22,30,'#d89a6a'); nkPx(c,74,40-hu,22,30,'#d89a6a'); nkPx(c,-98,66+hu,26,60,'#6a7684'); nkPx(c,72,66-hu,26,60,'#6a7684'); } c.restore();
    for(const s of [-1,1]){ const k=Math.max(0,1-(s<0?F.l:F.r)/.16), e=k*k*(3-2*k), bx=192+s*(150-e*118), by=216-e*118, w=58-e*14; c.save(); c.translate(bx,by); c.rotate(-s*(.5-e*.4)); nkPx(c,-w/2+4,10,w-8,150,'#2a3048'); nkPx(c,-w/2+2,8,w-4,8,'#b0182a'); nkPx(c,-w/2,-w*.62,w,w*.72,'#d8b088'); for(let i=0;i<4;i++) nkPx(c,-w/2+2+i*(w-4)/4,-w*.62,(w-4)/4-2,5,'#b8906a'); nkPx(c,s<0?w/2-10:-w/2,-w*.3,10,w*.3,'#c8a078'); if(st>=2) nkPx(c,-w/2+4,-w*.62,w-8,6,'#a8141e'); c.restore(); }
    if(F.hitT<.07){ nkPx(c,0,0,384,216,'rgba(255,255,255,.5)'); } if(st>=3){ const v=c.createRadialGradient(192,108,60,192,108,230); v.addColorStop(0,'rgba(90,0,8,0)'); v.addColorStop(1,'rgba(90,0,8,'+(.12*st)+')'); c.fillStyle=v; c.fillRect(0,0,384,216); } },
  // only shapes against the window
  sil(c,t,p){ nkPx(c,0,0,384,216,'#020206'); nkPx(c,116,18,152,128,'#0c1024'); nkPx(c,122,24,140,116,'#1c2850'); c.fillStyle='#c8d0f0'; c.beginPath(); c.arc(206,64,22,0,7); c.fill(); nkPx(c,190,24,4,116,'#0c1024'); nkPx(c,122,80,140,4,'#0c1024'); for(let i=0;i<5;i++){ nkPx(c,104+i*5,14,5,138-i*14,'#06060e'); nkPx(c,276-i*5,14,5,138-i*14,'#06060e'); }
    const fl=c.createLinearGradient(0,146,0,216); fl.addColorStop(0,'#141a34'); fl.addColorStop(1,'#04040a'); c.fillStyle=fl; c.fillRect(0,146,384,70); c.fillStyle='rgba(120,140,220,.30)'; c.beginPath(); c.moveTo(122,146); c.lineTo(262,146); c.lineTo(330,216); c.lineTo(54,216); c.closePath(); c.fill();
    const K='#000000', sh=(p.thud||0)>0?Math.round(p.thud*2):0; c.fillStyle=K; c.fillRect(232,165+sh,28,12); c.fillRect(258,168+sh,26,9); c.fillRect(280,162+sh,5,10); c.fillRect(238,176+sh,4,2); if(!p.black){ c.beginPath(); c.ellipse(224,170+sh,8,7,0,0,7); c.fill(); c.fillRect(216,163+sh,6,5); } /* he lies along the floor, head towards the window's light; Ali is over his chest, the fist comes down where the head is */ if(p.stand){ nkAli(c,234,176,{f:-1,pose:'stomp',arm:p.foot||0,sil:K,sc:1.3}); } else nkAli(c,240,170+sh,{f:-1,pose:'kneel',arm:p.arm||0,sil:K,sc:1.3});
    if(p.black) nkPx(c,0,0,384,216,'rgba(0,0,0,'+p.black+')'); },
  // he wakes up
  wake(c,t,p){ nkRoom(c,t,{hole:1,morning:1,screen:(c2,x,y,w,h)=>nkTitleScreen(c2,x,y,w,h,t)}); nkGuy(c,170,178,{kind:'rn',rot:-1.5708,arms:'down',nohead:1}); c.fillStyle='#8a0c16'; c.beginPath(); c.ellipse(124,170,20,9,0,0,7); c.fill(); for(let i=0;i<14;i++){ const a=nkRnd(i,51)*6.28, r=14+nkRnd(i,52)*22; nkPx(c,124+Math.cos(a)*r,170+Math.sin(a)*r*.45,2+nkRnd(i,53)*5,2,i%2?'#8a0c16':'#a8141e'); } nkPx(c,112,166,10,4,'#a8141e');
    const up=p.up||0; nkGuy(c,276,172,{kind:'gn',rot:-1.5*(1-up),face:p.gface||'ko',f:-1,arms:p.garms||'down',sit:up>.9}); if(p.scream){ for(let i=0;i<8;i++){ const a=i/8*6.28+t*3; nkPx(c,270+Math.cos(a)*(26+Math.sin(t*20)*3),128+Math.sin(a)*(22+Math.sin(t*20)*3),4,2,'#ffffff'); } } },
  // the montage: five small jobs
  mont(c,t,p){ const k=p.k||0, q=(t*1.2)%1, sw=Math.sin(t*9);
    if(k===0){ nkRoom(c,t,{hole:1,morning:1,clean:0,screen:(c2,x,y,w,h)=>nkPx(c2,x,y,w,h,'#060810')}); c.fillStyle='rgba(138,12,22,'+(.8-(p.u||0)*.8)+')'; c.beginPath(); c.ellipse(124,170,20,9,0,0,7); c.fill(); const mx=150+sw*26; nkGuy(c,mx+18,178,{kind:'gn',f:-1,arms:'fwd',walk:t*9}); nkPx(c,mx-14,150,2,28,'#c8a060'); nkPx(c,mx-22,176,16,5,'#e8e8f0'); nkPx(c,60,160,14,18,'#5a8ac8'); nkPx(c,58,158,18,3,'#8ab0e8'); }
    else if(k===1){ nkRoom(c,t,{hole:1,morning:1,clean:1,screen:(c2,x,y,w,h)=>nkPx(c2,x,y,w,h,'#060810')}); const x=300-(t*40)%220; nkPx(c,x+16,164,74,14,'#8a3a4a'); nkPx(c,x+16,164,74,3,'#a85a6a'); nkPx(c,x+88,166,8,4,'#14141c'); nkPx(c,x+88,172,8,4,'#14141c'); for(let i=0;i<4;i++) nkPx(c,x+26+i*16,164,2,14,'#6a2a3a'); nkGuy(c,x,178,{kind:'gn',f:-1,arms:'fwd',walk:t*10,face:'shock'}); }
    else if(k===2){ nkPx(c,0,0,384,216,'#0a1028'); nkStars(c,50,0,0,61); c.fillStyle='#e8ecff'; c.beginPath(); c.arc(310,40,14,0,7); c.fill(); nkPx(c,0,150,384,66,'#16241c'); nkPx(c,0,96,384,54,'#141c2c'); for(let i=0;i<20;i++) nkPx(c,i*20,96,2,54,'#1e2a40'); nkPx(c,0,110,384,3,'#1e2a40'); c.fillStyle='#2a2018'; c.beginPath(); c.ellipse(200,186,46,12,0,0,7); c.fill(); c.fillStyle='#3e3024'; c.beginPath(); c.ellipse(120,180,30,14,0,3.14,6.28); c.fill(); const dg=Math.max(0,sw); nkGuy(c,238,184,{kind:'gn',f:-1,arms:'fwd'}); c.save(); c.translate(216,166); c.rotate(-.5-dg*.7); nkPx(c,-22,0,24,2,'#c8a060'); nkPx(c,-30,-3,9,8,'#b8bcc4'); c.restore(); if(dg>.8) for(let i=0;i<5;i++) nkPx(c,150+i*8,160-i*5-q*10,3,3,'#3e3024'); nkPx(c,176,174,50,10,'#8a3a4a'); }
    else if(k===3){ nkPx(c,0,0,384,216,'#7ab8e8'); for(let i=0;i<4;i++) nkPx(c,30+i*100+((t*6)%100),30+(i%2)*20,50,10,'#e8f0ff'); c.fillStyle='#5a2a2a'; c.beginPath(); c.moveTo(0,216); c.lineTo(192,60); c.lineTo(384,216); c.closePath(); c.fill(); for(let i=0;i<9;i++) nkPx(c,192-i*20,76+i*16,i*40,2,'rgba(0,0,0,.2)'); nkPx(c,150,106,90,60,'#2a6ad8'); nkPx(c,150,106,90,4,'#4a8af0'); for(let i=0;i<4;i++){ nkPx(c,142+i*26,100+(i%2)*4,22,8,'#b8bcc4'); nkPx(c,142+i*26,164-(i%2)*4,22,8,'#b8bcc4'); } nkGuy(c,262,170,{kind:'gn',f:-1,arms:sw>0?'up':'fwd'}); nkPx(c,238,140+(sw>0?-12:4),14,6,'#b8bcc4'); }
    else { nkPx(c,0,0,384,216,'#3a3448'); nkPx(c,110,20,164,176,'#c8a060'); nkPx(c,118,28,148,160,'#8ab0c8'); nkPx(c,118,28,148,160,'rgba(255,255,255,.12)'); for(let i=0;i<3;i++) nkPx(c,130+i*40,28,10,160,'rgba(255,255,255,.08)'); c.save(); c.beginPath(); c.rect(118,28,148,160); c.clip(); nkGuy(c,192,236,{kind:'gn',hood:1,headset:1,sc:3,arms:sw>.2?'up':'down',face:sw>.2?'calm':'shock'}); c.restore(); } },
  // some time later
  pc(c,t,p){ nkRoom(c,t,{hole:1,tarp:1,clean:1,screen:(c2,x,y,w,h)=>{ if(p.game===2) nkRtsScreen(c2,x,y,w,h,t); else nkJrpgScreen(c2,x,y,w,h,t); if(p.disc){ nkDiscord(c2,x,y,40,h,t,p.disc>1); } }});
    nkPx(c,138,120,26,4,'#22222c'); nkPx(c,136,96,5,28,'#22222c'); nkPx(c,149,124,3,24,'#22222c'); nkPx(c,138,148,26,3,'#22222c'); nkGuy(c,150,150,{kind:'gn',hood:1,headset:1,f:1,sit:1,arms:p.phone===2?'guard':'fwd',face:p.gface||'calm'});
    if(p.phone){ const b=p.phone===1?Math.round(Math.sin(t*50)*1.5):0; nkPx(c,200+b,108,9,5,'#14141c'); nkPx(c,201+b,109,7,3,p.phone===1?'#5aff8a':'#2a2a34'); if(p.phone===1){ for(let i=0;i<3;i++) nkPx(c,196+b-i*3,104-i*2,2,2,'#ffffff'); c.fillStyle='rgba(8,10,20,.9)'; c.fillRect(214,84,62,22); c.fillStyle='#5aff8a'; c.font='7px monospace'; c.fillText('INCOMING',218,93); c.fillStyle='#ffffff'; c.fillText('SHAYAN',218,102); } } },
  card(c,t,p){ nkPx(c,0,0,384,216,'#000000'); c.textAlign='center'; c.fillStyle='rgba(255,255,255,'+Math.min(1,t*1.5)+')'; c.font='700 16px Georgia,serif'; c.fillText(p.a||'',192,104); c.font='italic 9px Georgia,serif'; c.fillStyle='rgba(216,180,106,'+Math.min(1,Math.max(0,t-.5)*1.5)+')'; c.fillText(p.b||'',192,124); c.textAlign='left'; },
  black(c){ nkPx(c,0,0,384,216,'#000000'); } };
// ---------- drawing it over the game ----------
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); if(!NK.on) return; try{ if(!NK.cv){ NK.cv=document.createElement('canvas'); NK.cv.width=384; NK.cv.height=216; NK.c=NK.cv.getContext('2d'); } const c=NK.c, dt=1/60; NK.t+=dt; NK.shake=Math.max(0,NK.shake-dt*4); NK.flash=Math.max(0,NK.flash-dt*3);
      c.save(); c.setTransform(1,0,0,1,0,0); c.globalAlpha=1; c.textAlign='left'; c.fillStyle='#000'; c.fillRect(0,0,384,216); { /* the film's own camera: zoom about a point of the scene */ const z=Math.max(.2,NK.p.zoom||1), zx=NK.p.zx==null?192:NK.p.zx, zy=NK.p.zy==null?108:NK.p.zy, hx=192/z, hy=108/z, cx=Math.max(hx,Math.min(384-hx,zx)), cy=Math.max(hy,Math.min(216-hy,zy)); c.translate(192,108); c.scale(z,z); c.translate(-cx,-cy); } const f=NKS[NK.scene]||NKS.black; f(c,NK.t,NK.p); c.restore();
      if(NK.bars){ nkPx(c,0,0,384,14,'#000000'); nkPx(c,0,202,384,14,'#000000'); }
      D.save(); D.setTransform(RW/UW,0,0,RH/UH,0,0); D.imageSmoothingEnabled=false; const sx=NK.shake>0?(Math.random()-.5)*NK.shake*18:0, sy=NK.shake>0?(Math.random()-.5)*NK.shake*18:0; D.fillStyle='#000'; D.fillRect(0,0,UW,UH); D.drawImage(NK.cv,sx,sy,UW,UH);
      if(NK.flash>0){ D.fillStyle='rgba(255,255,255,'+Math.min(1,NK.flash)+')'; D.fillRect(0,0,UW,UH); } if(NK.fade>0){ D.fillStyle='rgba(0,0,0,'+Math.min(1,NK.fade)+')'; D.fillRect(0,0,UW,UH); }
      const F=NK.fp; if(F&&NK.scene==='fpv'&&!F.done){ D.textAlign='center'; D.font=`800 ${IS_TOUCH()?22:24}px ${FB}`; D.lineWidth=5; D.strokeStyle='#08040a'; const a=.75+.25*Math.sin(NK.t*8), G6=nkPadOn()?((PAD_GLYPH[PAD.glyph]||PAD_GLYPH.xb)[6]):K('attack'), G7=nkPadOn()?((PAD_GLYPH[PAD.glyph]||PAD_GLYPH.xb)[7]):K('block'), tx=G6+':  LEFT          '+G7+':  RIGHT'; D.globalAlpha=a; D.strokeText(tx,UW/2,UH-64); D.fillStyle='#ffffff'; D.fillText(tx,UW/2,UH-64); D.globalAlpha=1;
        const w=320, x=UW/2-w/2, y=UH-44; D.fillStyle='rgba(0,0,0,.6)'; D.fillRect(x-2,y-2,w+4,14); D.fillStyle='#a8141e'; D.fillRect(x,y,w*Math.min(1,F.n/F.need),10); D.textAlign='left'; }
      const S=NK.sub; if(S){ S.t+=dt; if(S.t>S.dur) NK.sub=null; else { const al=Math.min(1,S.t*6,(S.dur-S.t)*4); D.globalAlpha=al; D.textAlign='center'; D.font=`700 22px ${FB}`; const tx=(NAMES[S.who]?NAMES[S.who]+':  ':'')+S.text, w=D.measureText(tx).width+28; D.fillStyle='rgba(8,8,16,.82)'; D.fillRect(UW/2-w/2,UH*.16-22,w,34); D.fillStyle='#f0e8d8'; D.fillText(tx,UW/2,UH*.16+2); D.globalAlpha=1; D.textAlign='left'; } }
      D.restore(); if(Game.dlg) drawDialog(); }catch(e){ console.error('nk draw',e); } }; })();
function nkPadOn(){ try{ return typeof PAD!=='undefined'&&PAD.mode!=='kbm'&&!!twPadGet(); }catch(e){ return false; } }
// ---------- the playable beat ----------
function* nkPunchOut(){ const F=NK.fp={n:0,need:28,l:9,r:9,st:0,hitT:9,side:1,done:0,idle:0}; const lines=[[3,"Wait. WAIT. Who ARE you?!"],[7,"I didn't even WRITE the game! I just PLAY it!"],[11,"I have WORK tomorrow!"],[15,"Is this about the mech? You can HAVE the mech!"],[19,"...ow."],[23,"...save... file..."]];
  hit.attack=false; hit.block=false;
  while(F.n<F.need){ F.l+=1/60; F.r+=1/60; F.hitT+=1/60; F.idle+=1/60; let s=0; const pad=nkPadOn(); if(pad){ /* a controller: LT is the left fist, RT the right (read straight from the triggers, whatever they are bound to) */ let bl=false, br=false; try{ const gp=twPadGet(), b=gp&&gp.buttons; bl=!!(b&&b[6]&&(b[6].pressed||b[6].value>.4)); br=!!(b&&b[7]&&(b[7].pressed||b[7].value>.4)); }catch(e){} if(bl&&!F.pl&&F.l>.14) s=-1; else if(br&&!F.pr&&F.r>.14) s=1; F.pl=bl; F.pr=br; consume('attack'); consume('block'); } else if(consume('attack')&&F.l>.14) s=-1; else if(consume('block')&&F.r>.14) s=1; hit.confirm=false;
    if(s){ if(s<0) F.l=0; else F.r=0; F.n++; F.side=s; F.hitT=0; F.idle=0; F.st=Math.min(6,Math.floor(F.n/4)); NK.shake=Math.min(1,.35+F.st*.08); Sound.sfx(F.n%3?'hit':'slam'); if(F.st>=2&&F.n%2===0) Sound.sfx('gore'); const L=lines.find(q=>q[0]===F.n); if(L) nkSub('nathanirl',L[1],1.8); }
    yield wait(0); }
  F.done=1; yield wait(.5); }
// ---------- the film ----------
function* nkEnding(){ const P=Player; Sound.stop(); try{ twClearCine&&twClearCine(); }catch(e){} NK.on=1; NK.fade=0; NK.bars=1; NK.fp=null; Game.letterTo=0; P.inv=999; Cam.cine=Cam.cine||null;
  nkScene('field',{zoom:2.3,zx:218,zy:152}); yield wait(.8);
  yield say('nathanraw',"...Do it, then. Finish the arc. At least make it MEAN something.");
  yield say('ali',"It doesn't.");
  yield say('nathanraw',"...What?");
  yield say('ali',"Mean something. Hold still.");
  yield tween(NK.p,{zoom:1,zx:192,zy:108},.35,t=>t*t); NK.p.kick=1; Sound.sfx('dash'); yield wait(.12); Sound.sfx('crossboom'); NK.shake=1; NK.flash=.6; yield tween(NK.p,{up:1},.55,t=>t*t); NK.p.star=0; Sound.sfx('secret'); yield tween(NK.p,{star:1},.2); yield tween(NK.p,{star:0},.3); yield wait(.4);
  yield say('ali',"Too low.");
  Sound.sfx('dash'); NK.flash=.5; yield tween(NK.p,{cam:1},.5,t=>t*t);
  // space
  nkScene('space',{nx:120,ny:150}); Sound.sfx('drone'); yield tween(NK.p,{nx:190,ny:104},1.6,t=>1-(1-t)*(1-t)); yield tween(NK.p,{zoom:2.4,zx:190,zy:84},.5,t=>t*t*(3-2*t));
  yield say('nathanraw',"I'M IN SPACE! WITHOUT THE MECH! I NEED THE MECH FOR SPACE!");
  yield tween(NK.p,{zoom:1.5,zx:170,zy:112},.3); NK.p.ali=1; NK.p.ax=-30; NK.p.ay=150; NK.p.streak=1; Sound.sfx('quickboost'); yield tween(NK.p,{ax:168,ay:124},.35,t=>1-(1-t)*(1-t)); NK.p.streak=0; NK.shake=.6; Sound.sfx('slam'); NK.p.held=1; NK.p.swing=-.4; yield tween(NK.p,{zoom:2.3,zx:178,zy:104},.4,t=>t*t*(3-2*t));
  yield say('nathanraw',"Oh thank God. You came to get m");
  yield tween(NK.p,{zoom:1.25,zx:230,zy:96},.5,t=>t*t*(3-2*t)); yield say('ali',"That one. The blue one.");
  yield say('nathanraw',"The blue wh... no. No no no. People LIVE there.");
  yield say('ali',"Yes.");
  NK.p.zoom=1.5; NK.p.zx=180; NK.p.zy=108; Sound.sfx('swing'); yield tween(NK.p,{swing:12.2},1.5,t=>t*t); NK.p.zoom=1; Sound.sfx('crossboom'); NK.shake=1; NK.flash=.8; NK.p.held=0; NK.p.nx=NK.p.ax+30; NK.p.ny=NK.p.ay-30; NK.p.comet=1; NK.p.cdx=1; NK.p.cdy=1; NK.p.spin=.6;
  yield tween(NK.p,{nx:296,ny:74,ns:.25},.7,t=>t*t); NK.flash=.4; Sound.sfx('secret'); yield wait(.5);
  nkScene('earth',{u:0,z:0}); Sound.sfx('howl'); yield tween(NK.p,{u:1,z:1},1.6,t=>t*t); NK.flash=1;
  // the street
  nkScene('house',{u:0}); yield wait(1.1); Sound.sfx('howl'); yield tween(NK.p,{u:1},.55,t=>t*t); nkScene('house',{hit:1}); Sound.sfx('crash'); Sound.sfx('crossboom'); NK.shake=1; NK.flash=.9; yield wait(1.6);
  // his room, one second earlier
  nkScene('room',{zoom:2.5,zx:160,zy:104}); NK.fade=1; yield tween(NK,{fade:0},.4); yield wait(.5);
  yield say('nathanirl',"Okay. Phase three. No hits this time. I have studied the gunkata.");
  yield say('nathanirl',"...Why did my guy just leave the screen?");
  Sound.sfx('crash'); Sound.sfx('slam'); NK.shake=1; NK.flash=1; NK.p.zoom=1; NK.p.hole=1; NK.p.rf=1; NK.p.rface='shock'; NK.p.rarms='up'; yield wait(1.2);
  yield tween(NK.p,{zoom:2.6,zx:150,zy:122},.3); yield say('nathanirl',"MY ROOF! That's... that's a guy. That's MY guy. That's literally my character.");
  NK.p.ali=1; NK.p.ax=268; NK.p.ay=-10; NK.p.af=-1; Sound.sfx('drone'); yield tween(NK.p,{zoom:1.7,zx:262,zy:70},.4); Game.fxUpd.push(()=>{ if(NK.scene!=='room'||NK.p.ay>=150) return false; NK.p.zy=Math.max(70,NK.p.ay-34); return true; }); yield tween(NK.p,{ay:150},2.2,t=>t); yield tween(NK.p,{zoom:2.6,zx:266,zy:126},.5,t=>t*t*(3-2*t)); Sound.sfx('step'); yield wait(.5);
  yield tween(NK.p,{zoom:1.35,zx:210,zy:120},.5,t=>t*t*(3-2*t)); yield say('nathanirl',"...And that's the samurai. From the route I didn't pick.");
  yield tween(NK.p,{zoom:2.8,zx:268,zy:122},.25); yield say('ali',"You were holding the controller."); yield tween(NK.p,{zoom:2.6,zx:150,zy:122},.25);
  yield say('nathanirl',"It's a keyboard. Listen. It's a GAME. He's not REAL. I'm real. You can't just");
  yield tween(NK.p,{zoom:1.6,zx:190,zy:130},.2); Sound.sfx('dash'); NK.p.chair=0; yield tween(NK.p,{ax:176},.18); NK.p.apose='reach'; NK.p.rsit=0; NK.shake=.5; Sound.sfx('hit'); yield tween(NK.p,{ry:118},.25,t=>1-(1-t)*(1-t)); yield wait(.35);
  Sound.sfx('swing'); NK.p.rrot=-1.5708; yield tween(NK.p,{rx:206,ry:176},.16,t=>t*t); Sound.sfx('slam'); NK.shake=1; NK.flash=.6; NK.p.rface='ko'; NK.p.rarms='down'; NK.p.apose='stand'; yield wait(.7);
  yield tween(NK.p,{zoom:2.6,zx:182,zy:136},.5,t=>t*t*(3-2*t)); yield say('ali',"Ten seconds. I'll count slow.");
  // first person
  nkScene('fpv',{}); NK.bars=0; NK.flash=.4; yield* nkPunchOut(); NK.bars=1;
  // only shapes
  Sound.stop(); NK.fade=1; nkScene('sil',{arm:0,zoom:2.1,zx:236,zy:140}); yield wait(.9); Game.fxUpd.push(dt=>{ if(NK.scene!=='sil') return false; NK.p.zoom=Math.max(1.15,NK.p.zoom-(dt||1/60)*.05); NK.p.zx=Math.max(200,NK.p.zx-(dt||1/60)*2.2); NK.p.zy=Math.max(112,NK.p.zy-(dt||1/60)*1.4); return true; }); yield tween(NK,{fade:0},1.4);
  for(let i=0;i<7;i++){ yield tween(NK.p,{arm:1},i<4?.42:.6,t=>t*t); yield tween(NK.p,{arm:0},.09); Sound.sfx('hit'); Sound.sfx('gore'); NK.p.thud=1; NK.shake=.25; yield tween(NK.p,{thud:0},.2); yield wait(i<4?.16:.4); }
  yield wait(1.1); NK.p.stand=1; NK.p.foot=0; Sound.sfx('step'); yield wait(1.3); yield tween(NK.p,{foot:1},1.5,t=>t*(2-t)); yield wait(.7);
  NK.p.black=1; Sound.sfx('slam'); Sound.sfx('gore'); NK.shake=.5; yield wait(2.4);
  nkScene('card',{a:'',b:''}); yield wait(.4);
  // morning
  nkScene('wake',{up:0,zoom:2.4,zx:272,zy:150}); NK.fade=1; yield tween(NK,{fade:0},1.6); yield wait(.8); yield tween(NK.p,{up:1},1.1,t=>t*t*(3-2*t)); NK.p.gface='calm';
  yield say('nathanraw',"...Ugh. My everything. Where's the sky? Why is there a ceiling? Why is there a HOLE in the ceiling?");
  yield wait(.5); yield tween(NK.p,{zoom:1.15,zx:200,zy:130},1.2,t=>t*t*(3-2*t)); NK.p.gface='shock'; NK.p.garms='up'; Sound.sfx('heartbeat'); yield wait(.9);
  yield say('nathanraw',"...Who's that. On the floor.");
  yield tween(NK.p,{zoom:2.6,zx:140,zy:166},1.1,t=>t*t*(3-2*t)); yield say('nathanraw',"That's my jacket. No. That's a hoodie. That's my HAIR. That's... where's the rest of the hair. Where's the HEAD.");
  NK.p.zoom=3; NK.p.zx=276; NK.p.zy=132; NK.p.scream=1; NK.shake=.7; Sound.sfx('howl'); yield say('nathanraw',"THAT'S ME! THAT'S ME WITH NO HEAD! I'M DEAD AND I'M WATCHING!");
  NK.p.scream=0; yield tween(NK.p,{zoom:1.3,zx:210,zy:130},.6,t=>t*t*(3-2*t)); yield say('nathanraw',"...No. No, I'm here. I'm fine. So that's... the OTHER me. The one with the rent.");
  yield say('nathanraw',"...I am going to need a mop.");
  // the montage
  try{ Sound.play('ending'); }catch(e){} nkScene('card',{a:'CLEANUP MONTAGE',b:'(four hours, one mop)'}); yield wait(1.5);
  nkScene('mont',{k:0,u:0,zoom:1.9,zx:140,zy:150}); yield tween(NK.p,{u:1},2.4); nkScene('mont',{k:1,zoom:1.7,zx:230,zy:150}); yield tween(NK.p,{zx:130},2.3,t=>t); nkScene('mont',{k:2,zoom:1.8,zx:200,zy:160}); yield wait(2.6); nkScene('mont',{k:3,zoom:1.5,zx:220,zy:140}); yield wait(2.3); nkScene('mont',{k:4}); yield wait(1.4);
  yield say('nathanraw',"Hi, Mom. It is I. Your son. The regular one. I enjoy... rent.");
  yield wait(.6); nkScene('card',{a:'THREE WEEKS LATER',b:''}); yield wait(1.9);
  // the replacement
  nkScene('pc',{game:1,zoom:1.2,zx:180,zy:110}); NK.fade=1; yield tween(NK,{fade:0},.8); yield tween(NK.p,{zoom:3.2,zx:161,zy:88},1.8,t=>t*t*(3-2*t)); yield wait(.8);
  yield say('nathanraw',"A giant sword. On a giant. On a bigger giant. ...Their tragic arcs have SIDE QUESTS.");
  yield tween(NK.p,{zoom:2.2,zx:176,zy:108},.5,t=>t*t*(3-2*t)); NK.p.phone=1; Sound.sfx('blip'); yield wait(.5); Sound.sfx('blip'); yield wait(.5); Sound.sfx('blip'); yield wait(.6); NK.p.phone=2; NK.p.gface='shock'; Sound.sfx('select');
  yield say('shayan',"Yo. Nathan. Hop on. StarCraft dailies.");
  yield say('nathanraw',"...Dailies. Yes. The thing I do. Daily. As Nathan.");
  yield say('shayan',"You good? You sound like you're about to burn your memories.");
  yield say('nathanraw',"I'm normal Nathan. Normal Nathan is launching the game.");
  NK.p.gface='calm'; NK.p.phone=0; yield tween(NK.p,{zoom:3.2,zx:161,zy:88},.6,t=>t*t*(3-2*t)); NK.p.game=2; Sound.sfx('select'); yield wait(1.1); NK.p.disc=1; Sound.sfx('blip'); yield wait(.9); NK.p.disc=2; Sound.sfx('secret'); yield wait(.8);
  yield say('shayan',"There he is. Hey, why's there a tarp on your roof?"); yield tween(NK.p,{zoom:1.25,zx:215,zy:90},.9,t=>t*t*(3-2*t));
  yield say('nathanraw',"...Skill issue.");
  yield say('shayan',"Fair. You're on creep. Don't feed.");
  yield say('nathanraw',"I have never fed anyone in my life. I only take.");
  yield wait(.8); yield tween(NK,{fade:1},1.6); nkScene('card',{a:'ENDING: THE REPLACEMENT',b:'Somewhere, a samurai walks on. He does not play StarCraft.'}); NK.fade=0; yield wait(4.2); yield tween(NK,{fade:1},1.2);
  Game.aliOld=0; Game.ending=3; Game.fade=1; Game.fadeTo=1; NK.on=0; NK.fade=0; Game.state='end'; Game.endT=0; Game.script=null; }
// the choice: after phase III on Ali's road, before the finale
(function(){ const nf=nbFinale; nbFinale=function*(){ let kill=false; try{ kill=ALI()&&typeof NP1!=='undefined'&&(NP1.ph||1)>=3; }catch(e){}
    if(kill){ Game.letterTo=1; try{ if(NB) cineSet(NB.x-2.5,NB.y+1.2,NB.z+7,NB.x,NB.y+1,NB.z); }catch(e){} yield wait(.6);
      yield say('nathanraw',"...It's over. The pig's gone. The arc's gone. I've got nothing left to burn.");
      yield say('ali',"Hm.");
      const c=yield choose([{t:"Save him. (Sheathe the sword.)",aff:0},{t:"Kill him. (He asked for an ending.)",aff:0}]);
      if(c===1){ yield* nkEnding(); return; } }
    yield* nf.apply(this,arguments); }; })();
