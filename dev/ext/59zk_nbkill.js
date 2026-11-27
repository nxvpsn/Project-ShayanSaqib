// =====================================================================
// ALI'S ROAD, THE LAST CHOICE: SAVE or KILL Nathan (after phase III, before the finale).
// SAVE = the road's normal ending (nbFinale). KILL = `nkEnding`: a pixel-art film drawn on its own 384x216 canvas (NK.cv,
// shown over the game by a drawUI wrapper, the dialogue box drawn again on top). Scenes are functions NKS[id](c,t,p)
// (t = seconds in the scene, p = values the script tweens). The one playable beat is the first-person beating (`nkPunchOut`:
// attack = left fist, block = right fist; the face gets worse every 4 punches). The stomp is only ever a silhouette and a cut to black.
// Inspired-by screens only: the JRPG and the RTS on his monitor are generic stand-ins drawn here, no real game's art.
// =====================================================================
const NK={on:0,scene:'',t:0,p:{},cv:null,c:null,sub:null,shake:0,fade:0,flash:0,bars:1,S:3};
NAMES.nathanirl='Nathan (Real Life)';
(function(){ const pf=portrait; portrait=function(who,ex){ return pf.call(this,who==='nathanirl'?'nathanraw':who,ex); }; })();
/* v1.84: the film is drawn at NK.S times 384x216 (1152x648): the scenes keep their 384x216 coordinates under a scale, rects snap to
   the fine grid instead of whole units, and text, arcs and gradients come out at full resolution */
function nkPx(c,x,y,w,h,col){ const q=NK.S||1; c.fillStyle=col; c.fillRect(Math.round(x*q)/q,Math.round(y*q)/q,Math.max(0,Math.round(w*q)/q),Math.max(0,Math.round(h*q)/q)); }
function nkRnd(i,k){ const s=Math.sin(i*127.1+k*311.7)*43758.5453; return s-Math.floor(s); }
function nkStars(c,n,ox,oy,seed,col){ for(let i=0;i<n;i++){ const x=((nkRnd(i,seed)*384+ox)%384+384)%384, y=((nkRnd(i,seed+7)*216+oy)%216+216)%216; const big=nkRnd(i,seed+3)<.12, r=big?.9:.34+nkRnd(i,seed+5)*.33; nkPx(c,x,y,r,r,col||(i%5?'#cfd8ff':'#ffffff')); if(big){ nkPx(c,x-.7,y+.3,2.3,.34,'rgba(255,255,255,.55)'); nkPx(c,x+.3,y-.7,.34,2.3,'rgba(255,255,255,.55)'); } } }
function nkScene(id,p){ NK.scene=id; NK.t=0; NK.p=Object.assign({zoom:1,zx:192,zy:108,arm:0,black:0,cr:0,eyes:0,foot:0,kd:0,kw:0,leap:0,ns:1,pool:0,pulse:0,star:0,swing:0,thud:0,u:0,up:0,z:0,rx:150,ry:150},p||{}); /* v1.87: EVERY value a tween moves starts as a number. Several did not (up, star, ry, ns...), so their tweens were NaN and the pose snapped at the end: the kick, the launch and the lift had no animation at all */ /* the camera always has numbers: a tween from an unset zoom was NaN and blanked the frame */ NK.sub=null; }
function nkSub(who,text,dur){ NK.sub={who,text,t:0,dur:dur||2.2}; }
// ---------- the cast, drawn small and simple so every pose is possible ----------
// o: kind 'gn' game Nathan (jacket, scarf) | 'rn' real Nathan (hoodie, headset) ; f facing ; sc scale ; rot radians ; sil silhouette colour ;
//    arms 'down'|'up'|'fwd'|'guard' ; face 'calm'|'shock'|'ko'|'none' ; sit ; hood (gn wearing the hoodie) ; nohead
function nkGuyOld(c,x,y,o){ o=o||{}; const sil=o.sil, K=(col)=>sil||col, rn=o.kind==='rn'||o.hood, sc=o.sc||1; c.save(); c.translate(Math.round(x),Math.round(y)); c.scale((o.f||1)*sc,sc); if(o.rot) c.rotate(o.rot);
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
function nkAliOld(c,x,y,o){ o=o||{}; const sil=o.sil, K=(col)=>sil||col, sc=o.sc||1, P=o.pose||'stand', a=o.arm||0; c.save(); c.translate(Math.round(x),Math.round(y)); c.scale((o.f||1)*sc,sc); if(o.rot) c.rotate(o.rot);
  const robe='#2a3048', robe2='#1c2034', sash='#b0182a';
  if(P==='kneel'){ nkPx(c,-7,-8,16,8,K(robe2)); nkPx(c,-6,-24,13,17,K(robe)); nkPx(c,-6,-12,13,2,K(sash)); const ay=-30-a*10; nkPx(c,5,ay+6,3,Math.max(2,-12-ay),K(robe)); nkPx(c,4,ay+2,5,5,K('#d8b088')); nkPx(c,-9,-20,3,10,K(robe)); }
  else { const lift=P==='stomp'?Math.round(a*13):0; nkPx(c,-5,-13,4,13,K(robe2)); if(P==='kick'){ nkPx(c,1,-14,15,4,K(robe2)); nkPx(c,15,-15,4,6,K('#14141c')); } else { nkPx(c,1,-13-lift,4,13,K(robe2)); nkPx(c,0,-2-lift,7,2,K('#14141c')); } nkPx(c,-6,-2,6,2,K('#14141c'));
    nkPx(c,-7,-28,14,16,K(robe)); nkPx(c,-7,-15,14,2,K(sash)); nkPx(c,-8,-13,16,3,K(robe2));
    if(P==='reach'){ nkPx(c,6,-25,13,3,K(robe)); nkPx(c,18,-26,4,4,K('#d8b088')); } else nkPx(c,7,-26,3,11,K(robe)); nkPx(c,-10,-26,3,11,K(robe));
    c.fillStyle=K('#1a1a22'); c.fillRect(-12,-16,2,1); c.save(); c.translate(-9,-15); c.rotate(-.5); c.fillRect(-16,0,20,2); c.restore(); }
  const hy=P==='kneel'?-35:-39; nkPx(c,-5,hy,10,9,K('#3a2a22')); if(!sil){ nkPx(c,-5,hy+6,10,3,'#c89878'); nkPx(c,-1,hy+7,3,1,'#5a2a22'); }
  c.fillStyle=K('#c8a060'); c.beginPath(); c.moveTo(-14,hy+3); c.lineTo(0,hy-7); c.lineTo(14,hy+3); c.closePath(); c.fill(); nkPx(c,-14,hy+3,28,2,K('#8a6a38'));
  c.restore(); }
// v1.84: the cast at the game's own fidelity. Nathan is the redrawn pilot painter (03n nathanV2Paint: jacket and scarf, or the
// hoodie for real-life Nathan), posed from the same options; Ali is his real sprite sheet (idle, the blade-less stance for a
// reach, a Front Flip frame for the flying kick, the crouch for kneeling). The old block figures stay as the fallback.
const NKG={cv:null}, NKA={cv:null};
function nkGuy(c,x,y,o){ o=o||{}; try{ if(!NKG.cv) NKG.cv=mkCanvas(150,130); const [gcv,gc]=NKG.cv; gc.setTransform(1,0,0,1,0,0); gc.clearRect(0,0,150,130);
    const rn=o.kind==='rn'||o.hood, A=o.arms||'down', w=o.walk?Math.sin(o.walk):0, pose={b:o.sit?6:0,lean:0,F:o.sit?[[7,0],[9,0]]:[[-2+w*3,-Math.max(0,w)*1.5],[2-w*3,-Math.max(0,-w)*1.5]],hd:0,hx:0};
    if(A==='up'){ pose.ua=[-2.7,2.7]; pose.el=[-.3,.3]; } else if(A==='fwd'){ pose.ua=[.2,1.45]; pose.el=[.3,.15]; } else if(A==='guard'){ pose.ua=[1.2,1.5]; pose.el=[1.7,1.6]; } else { pose.ua=[.12,-.1]; pose.el=[.25,.3]; }
    nathanV2Paint(gc,75,118,1,{t:NK.t,still:1,irl:rn,pose,face:o.face&&o.face!=='calm'?o.face:undefined,nohead:o.nohead,noset:!(o.kind==='rn'||o.headset),sil:o.sil,scarf:rn?0:1,jacket:1});
    const sc=(o.sc||1)*.66; c.save(); c.imageSmoothingEnabled=false; c.translate(x,y); c.scale((o.f||1)*sc,sc); if(o.rot) c.rotate(o.rot); c.drawImage(gcv,-75,-118); c.restore(); }catch(e){ console.error('nk guy',e); nkGuyOld(c,x,y,o); } }
function nkAli(c,x,y,o){ o=o||{}; if(!(ALS.ok&&ALS.img)) return nkAliOld(c,x,y,o);
  try{ const P=o.pose||'stand', a=o.arm||0, sc=(o.sc||1)*.75; let row=0, col=2, rot=o.rot||0, dy=0;
    if(P==='kick'){ rot-=.3+.22*a; } else if(P==='fly'){ row=3; col=1; } else if(P==='reach'){ row=18; col=2; } else if(P==='throw'){ row=18; col=2; rot+=.32; } else if(P==='crouch'){ row=11; col=0; } else if(P==='spin'){ col=((o.dir||0)%8+8)%8; }
    else if(P==='kneel'){ row=11; col=a>.5?3:0; dy=-a*5; rot-=a*.3; } else if(P==='stomp'){ dy=-a*7; rot-=a*.12; }
    if(!NKA.cv) NKA.cv=mkCanvas(96,96); const [ocv,oc]=NKA.cv; oc.globalCompositeOperation='source-over'; oc.clearRect(0,0,96,96); oc.imageSmoothingEnabled=false; oc.drawImage(ALS.img,col*96,row*96,96,96,0,0,96,96);
    if(o.sil){ oc.globalCompositeOperation='source-atop'; oc.fillStyle=o.sil; oc.fillRect(0,0,96,96); oc.globalCompositeOperation='source-over'; }
    const feet=(ALS.feet[row]||[])[col]||79; c.save(); if(o.alpha!=null) c.globalAlpha=o.alpha; c.imageSmoothingEnabled=false; c.translate(x,y+dy); c.scale((o.f||1)*sc,sc); if(rot) c.rotate(rot); c.drawImage(ocv,-48,-feet,96,96);
    const K=col2=>o.sil||col2;
    if(P==='kick'){ /* the kicking leg, painted over the stance: hakama to the knee, a greave, the sandal */ const hx=3, hy=-21, fx=30, fy=-25-a*13, kx=17, ky=(hy+fy)/2-3; nkLine(c,hx,hy,kx,ky,9,K('#1b1d28')); nkLine(c,kx,ky,fx-3,fy,7,K('#1b1d28')); nkLine(c,hx+1,hy-3,kx,ky-3,1.6,K('#33384a')); nkLine(c,kx+2,ky,fx-4,fy,5,K('#6a6f7c')); nkLine(c,kx+3,ky-1.6,fx-5,fy-1.6,1.3,K('#9aa0ac')); nkPoly(c,[[fx-4,fy-4.5],[fx+4,fy-5.5],[fx+5,fy+3.5],[fx-3,fy+4.5]],K('#c8a070')); nkPx(c,fx+3.4,fy-5,1.6,9,K('#8a6a40')); }
    if(o.hand){ /* an arm out to whatever he is holding, in his own local space: o.hand = [dx,dy] */ const hx=o.hand[0], hy=o.hand[1]; nkLine(c,4,-33,hx,hy,6,K('#1b1d28')); nkLine(c,5,-34.6,hx,hy-1.6,1.4,K('#33384a')); nkLine(c,(4+hx)/2,(-33+hy)/2,hx,hy,5,K('#6a6f7c')); nkEll(c,hx,hy,3.6,3.4,K('#c8a070')); }
    c.restore(); }catch(e){ console.error('nk ali',e); nkAliOld(c,x,y,o); } }
function nkEarth(c,x,y,r){ r=Math.max(1,r); const E=(ex,ey,rx,ry,col,rot)=>nkEll(c,x+ex*r,y+ey*r,rx*r,ry*r,col,rot);
  { const g=c.createRadialGradient(x,y,r*.96,x,y,r*1.16); g.addColorStop(0,'rgba(120,180,255,.5)'); g.addColorStop(1,'rgba(120,180,255,0)'); c.fillStyle=g; c.beginPath(); c.arc(x,y,r*1.16,0,7); c.fill(); } /* the air */
  c.save(); c.beginPath(); c.arc(x,y,r,0,7); c.clip();
  { const g=c.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r*1.05); g.addColorStop(0,'#3a86d8'); g.addColorStop(.6,'#1c4a9a'); g.addColorStop(1,'#0e2a66'); c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); }
  // continents: clusters of blobs, a darker shore, lighter highlands, a little desert
  const L=[[-.42,-.28,.3,.22,.3],[-.2,-.12,.24,.3,-.4],[-.5,.05,.16,.2,.2],[-.3,.3,.14,.26,.5],[.3,-.42,.3,.16,-.2],[.5,-.2,.2,.24,.4],[.28,-.1,.16,.12,0],[.52,.3,.18,.12,-.3],[.1,.5,.2,.1,.2],[-.75,.5,.14,.1,0]];
  for(const q of L) E(q[0],q[1]+.02,q[2]*1.08,q[3]*1.08,'#1e5a3a',q[4]); for(const q of L) E(q[0],q[1],q[2],q[3],'#3a8a4a',q[4]); for(const q of L) E(q[0]-.03,q[1]-.04,q[2]*.6,q[3]*.55,'#5aa85a',q[4]);
  E(-.28,-.2,.1,.06,'#b8a868',.3); E(.42,-.3,.08,.05,'#b8a868',-.2); E(.36,-.42,.07,.04,'#7aa06a',0);
  E(0,-.97,.6,.12,'#eef4ff'); E(0,.97,.7,.14,'#eef4ff'); E(.1,-.9,.3,.06,'#ffffff');
  // cloud bands, drifting
  for(let i=0;i<14;i++){ const cx=(nkRnd(i,3)*2-1), cy=(nkRnd(i,5)*2-1)*.85, w=.16+nkRnd(i,6)*.3; E(cx,cy,w,.035+nkRnd(i,7)*.03,'rgba(255,255,255,.6)',(nkRnd(i,8)-.5)*.5); E(cx+w*.4,cy+.03,w*.6,.03,'rgba(255,255,255,.45)',0); }
  { const g=c.createLinearGradient(x-r,y-r*.3,x+r,y+r*.3); g.addColorStop(0,'rgba(0,0,12,0)'); g.addColorStop(.55,'rgba(0,0,12,.12)'); g.addColorStop(1,'rgba(0,0,12,.86)'); c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); }
  for(let i=0;i<26;i++){ const a=nkRnd(i,61)*1.6-.8, d=.55+nkRnd(i,62)*.4; nkPx(c,x+Math.cos(a)*d*r,y+Math.sin(a)*d*r,Math.max(.34,r*.008),Math.max(.34,r*.008),'rgba(255,220,140,.8)'); } /* city lights on the night side */
  { const g=c.createRadialGradient(x-r*.45,y-r*.5,0,x-r*.45,y-r*.5,r*.7); g.addColorStop(0,'rgba(255,255,255,.22)'); g.addColorStop(1,'rgba(255,255,255,0)'); c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); }
  c.restore(); }
// the bedroom, shared by five scenes. o: screen fn(c,x,y,w,h), hole, dark 0..1, tarp, clean, morning
function nkRoom(c,t,o){ o=o||{}; const M=!!o.morning, R=(x,y,w,h,col)=>nkPx(c,x,y,w,h,col);
  // wall: paint that darkens to the corners, panel seams, a skirting board; the floor in planks with a rug under the desk
  { const g=c.createLinearGradient(0,0,0,150); g.addColorStop(0,M?'#565266':'#2e283e'); g.addColorStop(1,M?'#46425a':'#241e32'); c.fillStyle=g; c.fillRect(0,0,384,150); }
  for(let i=0;i<8;i++){ R(i*48,0,.7,146,'rgba(0,0,0,.16)'); R(i*48+.7,0,.5,146,'rgba(255,255,255,.03)'); }
  nkFloor(c,0,150,384,66,11); R(0,144,384,6,M?'#2a2434':'#1c1622'); R(0,144,384,.8,'rgba(255,255,255,.09)'); R(0,149.4,384,.8,'rgba(0,0,0,.5)');
  nkEll(c,160,170,86,13,'#2a2440'); nkEll(c,160,170,80,11,'#3a3058'); nkEll(c,160,170,64,8,'#32294c'); for(let i=0;i<22;i++){ const a=i/22*6.283; R(160+Math.cos(a)*84,170+Math.sin(a)*12.4,1.6,.7,'#4a4070'); }
  // the window: a deep frame, four panes, the moon (or morning), a sill, a curtain to each side
  R(16,20,54,68,'#0e1426'); R(18,22,50,64,'#16203a'); { const g=c.createLinearGradient(0,27,0,81); if(M){ g.addColorStop(0,'#6aa8e8'); g.addColorStop(1,'#c8e0f4'); } else { g.addColorStop(0,'#060a1e'); g.addColorStop(1,'#142048'); } c.fillStyle=g; c.fillRect(23,27,40,54); }
  if(M){ nkEll(c,34,44,9,3,'rgba(255,255,255,.8)'); nkEll(c,52,60,8,2.6,'rgba(255,255,255,.7)'); } else { nkEll(c,50,44,7.6,7.6,'rgba(232,236,255,.25)'); nkEll(c,50,44,6.4,6.4,'#e8ecff'); nkEll(c,48,42,1.6,1.6,'#c8cce6'); nkEll(c,52,46,2,2,'#c8cce6'); for(let i=0;i<9;i++) R(24+nkRnd(i,71)*37,28+nkRnd(i,72)*50,.5,.5,'#ffffff'); }
  R(42,27,2,54,'#16203a'); R(23,53,40,2,'#16203a'); R(42,27,.6,54,'#2a3a60'); R(23,53,40,.6,'#2a3a60'); for(let i=0;i<3;i++) nkLine(c,26+i*6,78,36+i*6,30,.5,'rgba(255,255,255,.07)');
  R(14,86,58,3.4,'#22304e'); R(14,86,58,.8,'#3a4a70'); for(const sd of [0,1]){ const x=sd?64:10; for(let i=0;i<4;i++){ R(x+i*2.6,18,2.6,72-(i%2)*2,i%2?'#3a2c4a':'#4a3860'); } R(x,18,10.4,1.4,'#6a5a80'); } R(8,16,68,2,'#14101c');
  // the poster: the game he is playing
  R(298,28,54,70,'#241018'); R(300,30,50,66,'#3a1c2c'); { const g=c.createLinearGradient(0,34,0,92); g.addColorStop(0,'#0c0a24'); g.addColorStop(1,'#241a44'); c.fillStyle=g; c.fillRect(304,34,42,58); }
  nkEll(c,325,54,11,11,'rgba(232,236,255,.2)'); nkEll(c,325,54,9.4,9.4,'#e8ecff'); nkEll(c,322,51,2.4,2.4,'#c8cce6'); nkEll(c,328,57,1.8,1.8,'#c8cce6'); for(let i=0;i<10;i++) R(305+nkRnd(i,75)*40,35+nkRnd(i,76)*34,.5,.5,'#ffffff');
  nkPoly(c,[[304,92],[304,78],[312,72],[318,76],[325,66],[333,75],[340,70],[346,78],[346,92]],'#141024'); R(320,70,10,18,'#2a3048'); R(323,64,4,7,'#2a3048'); R(324,74,2,3,'#ffd27a'); R(308,86,34,3,'#c8a060'); R(312,90.4,26,.9,'#8a7040'); R(298,28,54,.8,'#5a3040'); R(304,34,.7,58,'rgba(255,255,255,.1)');
  // the desk: a top with a lit edge, two legs, a drawer; the tower with its fans; the monitor on its stand; keys and a mouse
  R(94,111,132,7,'#5a4030'); R(94,111,132,1.2,'#7a5a44'); R(94,117,132,1,'#3a281c'); for(let i=0;i<7;i++) R(100+i*19,113+(i%3),12,.4,'rgba(0,0,0,.25)');
  for(const x of [100,214]){ R(x,118,6,32,'#3e2c20'); R(x,118,1.6,32,'#523c2c'); R(x+4.6,118,1.4,32,'#2a1c14'); } R(106,118,36,12,'#4a3426'); R(106,118,36,.8,'#644a38'); R(121,123,6,1.6,'#c8a060'); R(106,129.2,36,.8,'#2a1c14');
  R(186,119,27,31,'#1a1a24'); R(186,119,27,1,'#34343e'); R(188,121,23,27,'#22222c'); for(let i=0;i<2;i++){ const fy=128+i*11; nkEll(c,199.5,fy,4.6,4.6,'#0e0e16'); nkEll(c,199.5,fy,3.8,3.8,'rgba(90,255,138,'+(.25+.12*Math.sin(t*3+i))+')'); for(let k=0;k<3;k++){ const a=t*9+k*2.09+i; nkLine(c,199.5,fy,199.5+Math.cos(a)*3.6,fy+Math.sin(a)*3.6,.6,'#0e0e16'); } } R(190,122.4,3,1.6,'#5aff8a'); R(195,122.4,2,1.6,'#ff5a5a');
  R(120,60,82,52,'#0c0c12'); R(122,62,78,48,'#14141c'); R(122,62,78,.8,'#2e2e3a'); R(155,110,12,3,'#14141c'); R(150,112.4,22,1.4,'#22222c'); if(o.screen) o.screen(c,125,65,72,42); else R(125,65,72,42,'#060810');
  nkLine(c,128,104,150,67,.5,'rgba(255,255,255,.06)'); nkLine(c,134,104,156,67,.4,'rgba(255,255,255,.05)'); R(159,108,4,1,'#5aff8a');
  R(126,113,38,3.6,'#22222c'); R(126,113,38,.6,'#3a3a48'); for(let r2=0;r2<3;r2++) for(let k=0;k<12;k++) R(127+k*3.05+(r2%2)*.6,113.5+r2*.95,2.3,.6,(k+r2)%7===3?'#3ff4ff':'#4a4a5c'); R(168,112.6,12,4.6,'#1a1a24'); nkEll(c,174,114.6,3,1.8,'#2c2c38'); R(173.6,113.2,.8,1.2,'#5aff8a');
  R(206,104,6,7,'#c8c0b0'); R(206,104,6,1,'#e8e0d0'); R(211.6,105.6,2,3.4,'#c8c0b0'); R(207,104.6,4,1.4,'#3a2418');
  if(!o.dark||o.dark<.6){ const gl=c.createRadialGradient(161,86,4,161,86,96); gl.addColorStop(0,'rgba(120,170,255,.26)'); gl.addColorStop(1,'rgba(120,170,255,0)'); c.fillStyle=gl; c.fillRect(56,6,220,176); }
  if(o.hole){ // the hole he came through: torn plaster, snapped laths, the night (or a tarp), a shaft of light with dust in it, rubble
    nkPoly(c,[[228,0],[234,7],[243,17],[250,12],[262,10],[271,21],[281,19],[290,9],[299,10],[310,0]],'#1a1422'); nkPoly(c,[[232,0],[246,16],[262,9],[280,20],[298,8],[306,0]],M?'#8ab8e8':'#0a0c1c');
    if(!M) for(let i=0;i<9;i++) R(238+nkRnd(i,91)*62,1+nkRnd(i,92)*12,.5,.5,'#ffffff'); for(const q of [[240,0,247,13],[258,0,262,8],[276,0,279,17],[294,0,297,7]]) nkLine(c,q[0],q[1],q[2],q[3],1.3,'#5a4030'); for(const q of [[236,8,231,15],[272,21,268,27],[300,10,306,15]]) nkLine(c,q[0],q[1],q[2],q[3],.6,'#0e0a14');
    if(o.tarp){ nkPoly(c,[[224,0],[314,0],[312,23],[300,21],[286,25],[270,21],[254,25],[238,21],[226,24]],'#2a6ad8'); nkPoly(c,[[224,0],[314,0],[313,5],[225,5]],'#4a8af0'); for(let i=0;i<5;i++){ R(227+i*19,3+(i%2)*10,12,3,'#b8bcc4'); R(227+i*19,3+(i%2)*10,12,.7,'#e0e4ea'); } for(let i=0;i<4;i++) nkLine(c,240+i*20,5,238+i*20,22,.5,'rgba(0,0,40,.3)'); }
    else { const sh=c.createLinearGradient(0,0,0,176); sh.addColorStop(0,M?'rgba(255,240,200,.26)':'rgba(200,215,255,.24)'); sh.addColorStop(1,'rgba(200,215,255,0)'); c.fillStyle=sh; c.beginPath(); c.moveTo(236,0); c.lineTo(302,0); c.lineTo(334,176); c.lineTo(216,176); c.closePath(); c.fill();
      for(let i=0;i<26;i++){ const u=(nkRnd(i,95)+t*(.02+nkRnd(i,96)*.03))%1, x=236+nkRnd(i,97)*66+(u-.5)*(nkRnd(i,98)-.5)*60, y=u*170; R(x,y,.5,.5,'rgba(255,255,255,'+(.5*(1-u))+')'); } }
    if(!o.clean){ for(let i=0;i<20;i++){ const rx=228+nkRnd(i,2)*96, ry=152+nkRnd(i,4)*24, w=4+nkRnd(i,8)*10, h=3+nkRnd(i,9)*6, y=ry-nkRnd(i,6)*8, col=i%3?'#5a5058':'#7a6a5a'; R(rx,y,w,h,col); R(rx,y,w,.8,'rgba(255,255,255,.16)'); R(rx,y+h-.8,w,.8,'rgba(0,0,0,.35)'); if(i%4===0) nkLine(c,rx-2,y+h,rx+w+3,y+h-5,1,'#5a4030'); } for(let i=0;i<40;i++) R(222+nkRnd(i,12)*110,150+nkRnd(i,13)*30,.7,.7,'rgba(200,190,180,.5)'); } }
  if(o.dark){ R(0,0,384,216,'rgba(4,4,12,'+o.dark+')'); } }
// ---------- what is on his monitor (v1.87: drawn in detail; each paints in a 72x42 space clipped to the screen) ----------
function nkScr(c,x,y,w,h,fn){ c.save(); c.beginPath(); c.rect(x,y,w,h); c.clip(); c.translate(x,y); c.scale(w/72,h/42); try{ fn((a,b,d,e,col)=>nkPx(c,a,b,d,e,col),(a,b,rx,ry,col,rot)=>nkEll(c,a,b,rx,ry,col,rot),(pts,col)=>nkPoly(c,pts,col),(a,b,d,e,wd,col)=>nkLine(c,a,b,d,e,wd,col),(tx,a,b,sz,col,al,bold)=>{ c.font=(bold?'700 ':'')+sz+'px '+(typeof FB!=='undefined'?FB:'sans-serif'); c.textAlign=al||'left'; c.fillStyle=col; c.fillText(tx,a,b); c.textAlign='left'; }); }catch(e){ console.error('nk screen',e); } c.restore(); }
// the game he was playing: this one
function nkTitleScreen(c,x,y,w,h,t){ nkScr(c,x,y,w,h,(R,E,P,L,T)=>{ { const g=c.createLinearGradient(0,0,0,42); g.addColorStop(0,'#04061a'); g.addColorStop(1,'#1a1e52'); c.fillStyle=g; c.fillRect(0,0,72,42); }
    for(let i=0;i<40;i++) R(nkRnd(i,1)*72,nkRnd(i,2)*26,.25,.25,i%4?'#cfd8ff':'#ffffff'); E(36,13,9.6,9.6,'rgba(232,236,255,.16)'); E(36,13,7.4,7.4,'#e8ecff'); E(33.6,10.6,1.5,1.5,'#c8cce6'); E(38.4,15,1.9,1.9,'#c8cce6');
    P([[33.6,11],[38.4,11],[39.6,16.4],[32.4,16.4]],'#0a0c24'); R(35.4,9.2,1.2,2,'#0a0c24'); E(36,17.2,.8,.8,'#0a0c24'); /* the bell against the moon */
    P([[0,34],[10,28],[20,31],[30,27],[44,31],[56,26],[66,30],[72,28],[72,42],[0,42]],'#0c1030'); for(let i=0;i<60;i++){ const fx=nkRnd(i,5)*72, fy=33+nkRnd(i,6)*8; R(fx,fy,.2,.7,'#24406c'); R(fx-.2,fy-.2,.6,.3,'#c8d8ff'); }
    T("THE MOONSINGER'S BELL",36,25.6,3.5,'#f0e0b0','center',1); R(16,27,40,.25,'#d8b46a'); T('a game about a bread knife',36,29.4,1.7,'#a8b0d8','center'); if(Math.sin(t*5)>0) T('PRESS START',36,35.6,2,'#ffffff','center',1); T(typeof GAME_VERSION!=='undefined'?GAME_VERSION:'',70.6,41,1.2,'#5a6090','right'); }); }
// an open-world JRPG: a party of three on a plain, a colossus on the horizon standing on a bigger one, a monster with a level tag
function nkJrpgScreen(c,x,y,w,h,t){ nkScr(c,x,y,w,h,(R,E,P,L,T)=>{ { const g=c.createLinearGradient(0,0,0,24); g.addColorStop(0,'#4a94e0'); g.addColorStop(1,'#c4e2f8'); c.fillStyle=g; c.fillRect(0,0,72,42); }
    E(60,5,7,7,'rgba(255,250,220,.25)'); E(60,5,2.6,2.6,'#fffbe0');
    P([[0,24],[6,10],[18,6],[30,9],[38,4],[52,8],[60,5],[72,12],[72,24]],'#a9c6e4'); P([[30,9],[38,4],[52,8],[60,5],[72,12],[72,15],[58,10],[44,12],[36,9]],'#bcd4ec'); /* the bigger one: a shoulder as wide as the sky */
    P([[31,24],[31.6,13],[30.4,11.4],[31.4,9],[33,8.2],[33.4,6.4],[35.2,5.6],[37,6.4],[37.4,8.2],[39,9],[40.2,11.4],[39,13],[39.8,24]],'#7e9cc0'); P([[35.2,5.6],[37,6.4],[37.4,8.2],[39,9],[40.2,11.4],[39,13],[39.8,24],[37.6,24],[37.2,12],[36.4,8.8]],'#6a88ac'); P([[40.2,11.4],[44,3],[44.8,3.2],[41.6,12.4],[42.4,24],[41.6,24]],'#8fb0d0'); R(43.9,1.6,.9,2,'#5ad8ff'); /* the colossus, and the sword it holds */
    for(let i=0;i<5;i++){ const cx2=((i*19+t*1.2)%92)-10, cy2=9+(i%3)*4.4; E(cx2,cy2,6,1.3,'rgba(255,255,255,.85)'); E(cx2+2.4,cy2-.8,3.4,1.2,'rgba(255,255,255,.9)'); }
    P([[8,13],[12,12.4],[15,13],[13,15.4],[10,15.6]],'#5c8a50'); R(11.6,15.4,.5,4,'rgba(220,240,255,.7)'); P([[56,16],[61,15.4],[64,16.4],[61,18.4],[58,18.2]],'#5c8a50'); /* floating islands, a waterfall */
    P([[0,24],[10,21.6],[22,23],[34,21],[48,22.6],[60,20.6],[72,22.4],[72,42],[0,42]],'#4f9a4a'); P([[0,27],[14,25],[30,27.4],[46,25.6],[72,27.6],[72,42],[0,42]],'#44903f'); P([[0,32],[20,30],[44,32.4],[72,30.4],[72,42],[0,42]],'#3a8436');
    P([[30,24],[34,24],[41,42],[25,42]],'#c8b884'); P([[31,24],[32.2,24],[31,42],[27,42]],'#d8c894'); E(54,25.6,6,1.1,'#6ab4e0'); E(54,25.4,4.4,.6,'#a8d8f4');
    for(let i=0;i<70;i++){ const gx=nkRnd(i,41)*72, gy=24+nkRnd(i,42)*17, d=(gy-24)/17; R(gx,gy,.15+d*.2,.5+d*.8,i%3?'#5aae54':'#2f7230'); } for(let i=0;i<9;i++){ const tx=4+nkRnd(i,45)*64, ty=22.4+nkRnd(i,46)*3; E(tx,ty-1,1,1.3,'#2f6a34'); R(tx-.12,ty,.25,.8,'#4a3420'); }
    // the monster: plated, horned, a ring under it, its level and its bar
    const mb=Math.sin(t*2.4)*.3, mx=50, my=30+mb; E(mx,my+3.4,5.6,1,'rgba(255,60,60,.35)'); c.strokeStyle='#ff5a5a'; c.lineWidth=.3; c.beginPath(); c.ellipse(mx,my+3.4,5.6,1,0,t*2,t*2+5); c.stroke();
    E(mx,my,4.6,3.4,'#4a3a7a'); E(mx-.6,my-.8,3.8,2.2,'#6a58a8'); P([[mx-4.4,my-.6],[mx-7,my-3.2],[mx-5.6,my+.4]],'#3a2c62'); for(let i=0;i<4;i++) P([[mx-2.6+i*1.7,my-3],[mx-1.9+i*1.7,my-5.2+(i%2)],[mx-1.2+i*1.7,my-3]],'#c8bce8'); E(mx-5,my-1.2,1.7,1.5,'#5a4890'); R(mx-6,my-1.7,.6,.5,'#ffe06a'); P([[mx-6.4,my-2.4],[mx-7.6,my-4.2],[mx-5.8,my-2.8]],'#e8e0f4'); for(const lx of [-2.6,-.4,1.8,3.4]) R(mx+lx,my+2.2,1,1.6,'#3a2c62');
    R(mx-5,my-8,10,2.2,'rgba(8,12,28,.8)'); T('Lv.81  Ridge Stalker',mx-4.6,my-6.4,1.25,'#ffffff'); R(mx-5,my-5.6,10,.5,'#3a0a10'); R(mx-5,my-5.6,10*(.62+.05*Math.sin(t)),.5,'#ff4a4a');
    // the party, from behind: the boy with the red sword, the big one, the girl
    const sw=Math.sin(t*5), ph=Math.floor(t*1.3)%3, at=(t*1.3)%1;
    { const px=37, py=36; E(px,py+3.3,2.2,.5,'rgba(0,0,0,.3)'); R(px-1.1,py,.9,3.2,'#3a2a20'); R(px+.2,py,.9,3.2,'#3a2a20'); P([[px-1.6,py-3.6],[px+1.6,py-3.6],[px+1.9,py+.6],[px-1.9,py+.6]],'#c83a3a'); R(px-1.6,py-.4,3.4,.4,'#8a1c20'); E(px,py-4.6,1.25,1.25,'#e8c070'); R(px-1.2,py-5.4,2.4,.8,'#f4d488');
      c.save(); c.translate(px+.6,py-2.6); c.rotate(ph===0?-2.2+at*2.6:-.5); P([[-.5,0],[.5,0],[.7,-6.8],[0,-8],[-.7,-6.8]],'#b02020'); R(-.16,-7,.32,6.4,'#5af0ff'); R(-1,-.3,2,.5,'#d8b46a'); c.restore(); if(ph===0&&at>.3&&at<.6){ c.strokeStyle='rgba(120,240,255,.8)'; c.lineWidth=.5; c.beginPath(); c.arc(px+2,py-3,7,-1.9,-.3); c.stroke(); } }
    { const px=28, py=37; E(px,py+3.3,2.8,.6,'rgba(0,0,0,.3)'); R(px-1.6,py,1.3,3.2,'#4a3a2a'); R(px+.3,py,1.3,3.2,'#4a3a2a'); P([[px-2.4,py-4.2],[px+2.4,py-4.2],[px+2.7,py+.6],[px-2.7,py+.6]],'#8a6a3a'); R(px-2.4,py-4.2,4.8,.9,'#a8884e'); E(px,py-5.2,1.3,1.2,'#b88a5a'); R(px-1.3,py-6,2.6,.7,'#3a2a1a'); R(px+2.4,py-3.4+sw*.3,1,3,'#8a8e9a'); }
    { const px=44, py=37.4; E(px,py+2.9,1.9,.45,'rgba(0,0,0,.3)'); R(px-.8,py+.4,.7,2.4,'#e8e0d0'); R(px+.1,py+.4,.7,2.4,'#e8e0d0'); P([[px-1.4,py-3],[px+1.4,py-3],[px+2,py+.8],[px-2,py+.8]],'#f4f0f8'); R(px-1.9,py+.4,3.9,.4,'#f0a0c0'); E(px,py-3.9,1.1,1.1,'#f0d0b8'); P([[px-1.3,py-4.6],[px+1.3,py-4.6],[px+1.5,py-.6],[px+.8,py-3.6],[px-.8,py-3.6],[px-1.5,py-.6]],'#f08ab0'); if(ph===2){ E(px,py-7-at*2,.9*(1-at),.9*(1-at),'rgba(160,255,190,.9)'); } }
    const dn=[['1,284','#ffe06a',2.2],['632','#ffffff',1.7],['2,051','#ff9a4a',2.4]][ph]; T(dn[0],mx-2+ph,my-9.4-at*3.4,dn[2],dn[1],'left',1); if(ph===1) T('BREAK',mx-3,my-12.4-at*2,1.5,'#ff8ad0','left',1);
    // interface: the party at the left, the quest at the top, the map, the row of arts
    for(let i=0;i<3;i++){ const yy=3+i*5.2; R(1.2,yy,15,4.4,'rgba(8,14,32,.72)'); R(1.2,yy,.5,4.4,['#c83a3a','#a8884e','#f08ab0'][i]); R(2.2,yy+.5,3.4,3.4,['#e8c070','#b88a5a','#f0d0b8'][i]); R(2.2,yy+.5,3.4,1.1,['#f4d488','#3a2a1a','#f08ab0'][i]); T(['Rev','Dunn','Mio'][i],6.2,yy+1.7,1.3,'#ffffff','left',1); T('Lv '+[78,77,76][i],15.6,yy+1.7,1.05,'#a8c0e8','right'); R(6.2,yy+2.3,9.2,.7,'#12301c'); R(6.2,yy+2.3,9.2*[.82,.6+.05*Math.sin(t*2),.94][i],.7,'#5ae07a'); R(6.2,yy+3.3,9.2,.4,'#101c3a'); R(6.2,yy+3.3,9.2*[.4,.7,.55][i],.4,'#5ab0ff'); }
    R(20,1.2,25,3.4,'rgba(8,14,32,.6)'); T('◆ The Long Way Round',21,2.7,1.25,'#ffe8a0','left',1); T('Defeat the Ridge Stalker  0/1',21,4,1.05,'#d8e4f8'); T('14:32',46.4,2.7,1.2,'#ffffff');
    E(64.5,7,5.4,5.4,'rgba(8,14,32,.75)'); c.strokeStyle='#d8e4f8'; c.lineWidth=.3; c.beginPath(); c.arc(64.5,7,5.4,0,7); c.stroke(); P([[64.5,1.2],[65.1,2.6],[63.9,2.6]],'#ff5a5a'); P([[60.4,8],[63,6],[66,7.6],[68.6,5.6],[69,9],[64,10.6]],'#3a6a4a'); R(64.2,6.7,.6,.6,'#ffffff'); P([[64.5,5.8],[65.1,6.9],[63.9,6.9]],'#5af0ff'); R(67,5.8,.6,.6,'#ff4a4a'); R(62,8.6,.5,.5,'#ffe06a');
    R(17.5,35.4,37,6.2,'rgba(8,14,32,.6)'); for(let i=0;i<8;i++){ const ax2=20+i*4.6, col=['#e84a4a','#f08ad0','#e84a4a','#ffe06a','#5ae07a','#5ab0ff','#b07af0','#5ab0ff'][i], cd=((t*.35+i*.13)%1), hot=i===3; E(ax2,38.5,hot?2.3:1.8,hot?2.3:1.8,'#0c1228'); E(ax2,38.5,hot?1.9:1.45,hot?1.9:1.45,col); E(ax2-.4,38,.5,.4,'rgba(255,255,255,.6)');
      if(!hot&&cd<.7){ c.fillStyle='rgba(8,12,28,.72)'; c.beginPath(); c.moveTo(ax2,38.5); c.arc(ax2,38.5,1.5,-1.57,-1.57+6.283*(1-cd/.7)); c.closePath(); c.fill(); } if(hot){ c.strokeStyle='rgba(255,240,160,'+(.6+.4*Math.sin(t*8))+')'; c.lineWidth=.35; c.beginPath(); c.arc(ax2,38.5,2.5,0,7); c.stroke(); } }
    for(let i=0;i<3;i++){ R(30+i*4.2,34.2,3.8,.7,'#101c3a'); R(30+i*4.2,34.2,3.8*Math.min(1,Math.max(0,(t*.3)%1.4*3-i)),.7,'#5af0ff'); } T('CHAIN',28.8,34.9,1,'#a8e8ff','right',1);
    T('AUTO',56.4,39,1.2,'#8a96b8'); T('▲ 3 collectibles nearby',70.6,40.6,1,'#d8e4f8','right'); }); }
// a sci-fi RTS: a base, a mineral line, an army holding a ramp against a swarm
function nkRtsScreen(c,x,y,w,h,t){ nkScr(c,x,y,w,h,(R,E,P,L,T)=>{ R(0,0,72,42,'#2a2622'); for(let i=0;i<26;i++){ const gx=nkRnd(i,11)*72, gy=nkRnd(i,12)*32; E(gx,gy,2+nkRnd(i,13)*3,1+nkRnd(i,14)*1.6,i%2?'#322c26':'#262220'); } for(let i=0;i<40;i++) R(nkRnd(i,15)*72,nkRnd(i,16)*32,.3,.2,'#4a4238');
    P([[0,0],[26,0],[30,6],[28,16],[20,20],[0,19]],'#33363e'); for(let i=0;i<7;i++){ L(i*4.4,0,i*4.4-2,19.4,.12,'#40444e'); } for(let i=0;i<5;i++) L(0,i*4.2,29,i*4.2,.12,'#40444e'); P([[20,20],[28,16],[34,19],[31,24],[24,24]],'#3c3a36'); for(let i=0;i<4;i++) L(22+i*2.4,19.4-i*.6,25+i*2.2,24,.14,'#4a4640'); /* the base plate and its ramp */
    P([[46,8],[58,5],[72,8],[72,30],[56,32],[46,26],[43,16]],'#3a2440'); P([[50,11],[60,9],[72,12],[72,27],[58,28],[50,23]],'#4a2c52'); for(let i=0;i<14;i++){ const gx=48+nkRnd(i,21)*22, gy=9+nkRnd(i,22)*20; E(gx,gy,1+nkRnd(i,23),.6+nkRnd(i,23)*.5,'#5a3466'); R(gx,gy-.2,.3,.3,'#c86ad8'); } /* their ground */
    for(let i=0;i<7;i++){ const mx=2+i*1.9, my=2+(i%3)*1.5; P([[mx,my+2.4],[mx+.5,my],[mx+1.2,my+.7],[mx+1.5,my+2.4]],'#3ab8e8'); P([[mx+.5,my],[mx+.8,my+.4],[mx+.6,my+2.4],[mx,my+2.4]],'#9ae8ff'); if(Math.sin(t*4+i*1.9)>.9) R(mx+.4,my-.4,.3,.3,'#ffffff'); } E(4.4,13.4,2,1.1,'#2a4a2a'); E(4.4,13.2,1.3,.6,'#5aff8a'); for(let i=0;i<3;i++){ const q=(t*.5+i*.33)%1; E(4.4+Math.sin(i+t)*.6,12.6-q*3,.5+q*.8,.4+q*.6,'rgba(120,255,160,'+(.5*(1-q))+')'); }
    // the buildings
    P([[13,5.4],[16,3.6],[20.4,3.6],[23.4,5.4],[23.4,10.6],[20.4,12.4],[16,12.4],[13,10.6]],'#5a6a88'); P([[13,5.4],[16,3.6],[20.4,3.6],[23.4,5.4],[21,6.6],[15.4,6.6]],'#7a8cae'); R(15.4,6.6,5.6,4,'#3e4a66'); E(18.2,8.6,1.7,1.4,'#2a3248'); E(18.2,8.6,1,.8,Math.sin(t*3)>0?'#5af0ff':'#3aa8c8'); for(let i=0;i<4;i++) R(13.6+i*3,11,.5,.5,i%2?'#ffe06a':'#ff5a5a'); R(17.6,2.2,.3,1.6,'#aab4c8'); P([[17.9,2.2],[19.6,2.7],[17.9,3.2]],'#3a8aff');
    for(const [bx,by] of [[8,15.4],[11.6,15.4],[8,18],[11.6,18]]){ R(bx,by,3,2.1,'#4a566e'); R(bx,by,3,.5,'#6a7a98'); R(bx+.4,by+.9,2.2,.3,'#2a3248'); R(bx+2.3,by+1.4,.4,.4,'#5aff8a'); }
    R(15.6,14.6,6.6,4.2,'#566480'); R(15.6,14.6,6.6,.9,'#7a8cae'); R(17,16.4,3.8,2.4,'#2e3850'); R(21.2,15.2,.3,2.6,'#aab4c8'); P([[21.5,15.2],[23,15.6],[21.5,16.1]],'#ff5a5a'); R(17.4,17,3,.3,Math.sin(t*6)>0?'#ffe06a':'#8a7a3a');
    for(const [tx,ty] of [[26.4,14],[29.6,21.4]]){ E(tx,ty,1.5,1.2,'#4a566e'); E(tx,ty-.3,1,.8,'#7a8cae'); const ta=.2+Math.sin(t*1.4+tx)*.3; L(tx,ty-.3,tx+Math.cos(ta)*2.2,ty-.3+Math.sin(ta)*1,.4,'#aab4c8'); }
    for(let i=0;i<7;i++){ const q=(t*.22+i/7)%1, u=q<.5?q*2:2-q*2, wx=9+u*5.6, wy=6+Math.sin(i*2.1)*1.6+u*1.2; R(wx,wy,.8,.7,'#d8b84a'); R(wx+.5,wy+.1,.3,.3,'#fff0a0'); if(u<.08){ L(wx,wy+.3,wx-1.2,wy-.2,.14,'rgba(120,230,255,.9)'); } if(q>=.5) R(wx-.3,wy-.4,.5,.5,'#5ad8ff'); } /* workers on the line */
    // the army on the ramp, selected, firing; the swarm coming
    const fire=Math.floor(t*14), A=[]; for(let i=0;i<16;i++){ const ux=31+(i%4)*2+(Math.floor(i/4)%2)*.9, uy=13+Math.floor(i/4)*2.2+(i%4)*.4; A.push([ux,uy]); c.strokeStyle='#5aff8a'; c.lineWidth=.14; c.beginPath(); c.ellipse(ux+.4,uy+.9,.8,.4,0,0,7); c.stroke(); R(ux,uy,.8,.9,'#3a6ad8'); R(ux+.1,uy-.4,.6,.5,'#8ab0ff'); L(ux+.7,uy+.3,ux+1.5,uy+.2,.16,'#c8d0e0'); }
    for(const [tx,ty] of [[32,23.4],[36.4,24.6]]){ c.strokeStyle='#5aff8a'; c.lineWidth=.14; c.beginPath(); c.ellipse(tx+1.6,ty+1.8,2.2,.9,0,0,7); c.stroke(); R(tx,ty,3.2,1.9,'#4a5a78'); R(tx+.4,ty-.5,2,1.1,'#6a7a98'); L(tx+1.6,ty,tx+5,ty-.9,.4,'#aab4c8'); R(tx,ty+1.7,3.2,.4,'#22262e'); if(fire%9===(tx>33?4:0)){ E(tx+5.4,ty-1,1,.7,'#fff0a0'); } }
    const B=[]; for(let i=0;i<13;i++){ const sp=.9+nkRnd(i,31)*.6, q=(t*.06*sp+nkRnd(i,32))%1, ex=70-q*27, ey=10+nkRnd(i,33)*18+Math.sin(t*3+i)*.4, big=i%6===0; B.push([ex,ey]); E(ex,ey,big?1.6:.9,big?1.1:.6,'#7a2a2a'); E(ex-.2,ey-.2,big?1:.5,big?.6:.3,'#b84a3a'); for(const k of [-1,1]) L(ex,ey,ex+k*(big?1.6:1)*(Math.sin(t*12+i)>0?1:.7),ey+(big?1.2:.7),.14,'#5a1c1c'); P([[ex-(big?1.6:.9),ey],[ex-(big?2.6:1.6),ey-.5],[ex-(big?1.7:1),ey+.4]],'#e8d8c8');
      if(i%3===0){ R(ex-1,ey-1.6,2,.3,'#3a0a10'); R(ex-1,ey-1.6,2*(.3+nkRnd(i,34)*.6),.3,'#ff4a4a'); } }
    for(let i=0;i<6;i++){ const a2=A[(fire+i*3)%16], b2=B[(fire*2+i*5)%13]; if((fire+i)%3===0){ L(a2[0]+1.5,a2[1]+.2,b2[0],b2[1],.14,'rgba(255,240,150,.9)'); R(a2[0]+1.4,a2[1],.5,.4,'#ffffff'); E(b2[0],b2[1],.6,.5,'rgba(255,200,120,.8)'); } } for(let i=0;i<3;i++){ const q=(t*.9+i*.37)%1, bx=44+i*5, by=14+i*4; E(bx-q*8,by-Math.sin(q*3.14)*3,.5,.5,'#8aff5a'); if(q>.9) E(bx-8,by,1.4,.8,'rgba(140,255,90,.5)'); }
    { const q=(t*.25)%1; if(q<.35){ const k=q/.35; c.strokeStyle='#5aff8a'; c.lineWidth=.16; c.strokeRect(30.4,12.2,9.6*k,14.6*k); c.fillStyle='rgba(90,255,138,.08)'; c.fillRect(30.4,12.2,9.6*k,14.6*k); } }
    { const g=c.createRadialGradient(30,16,16,30,16,46); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.7)'); c.fillStyle=g; c.fillRect(0,0,72,32); } /* fog of war */
    // interface
    R(44,.6,27.4,2.6,'rgba(6,10,16,.8)'); P([[45,2.6],[45.5,1],[46.2,2.6]],'#5ad8ff'); T('1250',46.8,2.5,1.5,'#d8f4ff','left',1); E(53.6,1.9,.6,.6,'#5aff8a'); T('340',54.6,2.5,1.5,'#d8f4ff','left',1); R(60,1.2,1.2,1.2,'#ffe06a'); T('86/120',61.8,2.5,1.5,'#d8f4ff','left',1);
    for(let i=0;i<4;i++){ R(1+i*3.6,.6,3.2,2,'rgba(6,10,16,.8)'); R(1+i*3.6,.6,3.2,.3,i===0?'#5aff8a':'#3a4a5a'); T(String(i+1),1.5+i*3.6,2.2,1.2,'#ffffff','left',1); T(['16','2','7','—'][i],3.9+i*3.6,2.2,1,'#8ab0c8','right'); } T('APM 212',1.2,4.6,1,'#8ab0c8');
    R(0,32,72,10,'#12161c'); R(0,32,72,.4,'#3a4a5a'); R(.8,32.8,11.6,8.6,'#06140c'); P([[.8,32.8],[5,32.8],[5.6,35],[4.6,37.4],[.8,37]],'#1a2a22'); P([[8,34],[12.4,33.4],[12.4,40],[9,40.6]],'#2a1830'); for(let i=0;i<9;i++) R(1.6+nkRnd(i,51)*3.6,33.4+nkRnd(i,52)*3,.4,.4,'#5aff8a'); for(let i=0;i<7;i++) R(8.6+nkRnd(i,53)*3.4+Math.sin(t+i)*.3,34+nkRnd(i,54)*5,.4,.4,'#ff4a4a'); c.strokeStyle='#ffffff'; c.lineWidth=.14; c.strokeRect(3.6,34,4.6,3.2); if(Math.sin(t*9)>0){ c.strokeStyle='#ff4a4a'; c.lineWidth=.2; c.beginPath(); c.arc(6.6,36,1.4+((t*2)%1)*1.2,0,7); c.stroke(); }
    R(13.4,32.8,6.6,8.6,'#0a1220'); E(16.7,36,2,2.2,'#3a6ad8'); R(15.3,35.2,2.8,1.1,'#0a1a30'); R(15.6,35.5,2.2,.4,Math.sin(t*7)>0?'#5af0ff':'#3aa8c8'); T('Rifleman',16.7,40.6,1,'#8ab0c8','center');
    for(let i=0;i<16;i++){ const ix=21+(i%8)*3.6, iy=33.2+Math.floor(i/8)*4.1; R(ix,iy,3.2,3.6,'#0a1a14'); c.strokeStyle='#2a6a4a'; c.lineWidth=.12; c.strokeRect(ix,iy,3.2,3.6); R(ix+1.1,iy+.9,1,1.4,'#5aff8a'); R(ix+1.2,iy+.5,.8,.5,'#5aff8a'); R(ix+.4,iy+3,2.4,.25,'#123a22'); R(ix+.4,iy+3,2.4*(.5+nkRnd(i,61)*.5),.25,i%5===2?'#ffe06a':'#5aff8a'); }
    for(let i=0;i<9;i++){ const ix=51+(i%3)*4.2+8.4-8.4, iy=33.2+Math.floor(i/3)*2.9, hot=i===Math.floor(t*.8)%9; R(ix+7.8,iy,3.8,2.5,hot?'#3a4a22':'#1a2634'); c.strokeStyle=hot?'#ffe06a':'#3a5a7a'; c.lineWidth=.14; c.strokeRect(ix+7.8,iy,3.8,2.5); const gx=ix+9.7, gy=iy+1.25; if(i%3===0) P([[gx-.9,gy+.6],[gx,gy-.8],[gx+.9,gy+.6]],'#8ab0c8'); else if(i%3===1){ c.strokeStyle='#8ab0c8'; c.lineWidth=.2; c.beginPath(); c.arc(gx,gy,.7,0,7); c.stroke(); L(gx-1,gy,gx+1,gy,.16,'#8ab0c8'); } else { R(gx-.7,gy-.6,1.4,1.2,'#8ab0c8'); R(gx-.3,gy-.2,.6,.4,'#1a2634'); } }
    if(Math.sin(t*5)>-.2) T('Our forces are under attack',36,30.6,1.3,'#ff6a5a','center',1); }); }
function nkDiscord(c,x,y,w,h,t,joined){ c.save(); c.beginPath(); c.rect(x,y,w,h); c.clip(); c.translate(x,y); const R=(a,b,d,e,col)=>nkPx(c,a,b,d,e,col), T=(tx,a,b,sz,col,bold)=>{ c.font=(bold?'700 ':'')+sz+'px '+(typeof FB!=='undefined'?FB:'sans-serif'); c.fillStyle=col; c.fillText(tx,a,b); };
  R(0,0,w,h,'#2b2d31'); R(0,0,7,h,'#1e1f22'); for(let i=0;i<5;i++){ nkEll(c,3.5,4+i*6.4,2.4,2.4,['#5865f2','#3aa85a','#c8683a','#8a8a92','#e84a8a'][i]); if(i===1) R(0,2.6+i*6.4,.6,2.8,'#ffffff'); } nkPx(c,1.6,3,3.8,2,'#ffffff'); nkEll(c,2.6,5.4,.6,.6,'#5865f2'); nkEll(c,4.4,5.4,.6,.6,'#5865f2');
  R(7,0,w-7,4.4,'#232428'); T('the boys',8.4,3,2,'#ffffff',1); T('# general',9,8,1.6,'#8a8e9a'); T('# dailies',9,11,1.6,'#dbdee1',1); R(7.6,9.4,.5,2.2,'#ffffff'); T('# clips',9,14,1.6,'#8a8e9a');
  T('VOICE CHANNELS',8.4,18.4,1.2,'#8a8e9a',1); T('🔊 Dailies',9,21.6,1.6,'#dbdee1'); const user=(yy,name,col,talk)=>{ nkEll(c,12,yy-.6,1.6,1.6,col); if(talk){ c.strokeStyle='#3ad86a'; c.lineWidth=.4; c.beginPath(); c.arc(12,yy-.6,1.9,0,7); c.stroke(); } T(name,14.6,yy,1.6,talk?'#ffffff':'#a8acb4'); };
  user(25.4,'Shayan','#4a6fa8',Math.sin(t*9)>-.3); if(joined) user(29.2,'Nathan','#7a4a2a',Math.sin(t*8+1)>.2); if(joined&&((t*1.2)%3)<1.6){ R(9,31.4,w-11,3,'rgba(58,216,106,.16)'); T('Nathan joined the channel',10,33.4,1.25,'#3ad86a'); }
  R(7,h-5,w-7,5,'#232428'); nkEll(c,10,h-2.5,1.6,1.6,'#7a4a2a'); nkEll(c,11.1,h-1.5,.6,.6,'#3ad86a'); T('Nathan',12.6,h-2.6,1.4,'#ffffff',1); T('Online',12.6,h-1,1.1,'#a8acb4'); for(let i=0;i<3;i++) R(w-9+i*2.6,h-3.4,1.6,1.6,'#8a8e9a'); c.restore(); }
// ---------- the scenes ----------
// ---------- first person, drawn at the film's full resolution (v1.84) ----------
function nkPoly(c,pts,col){ c.fillStyle=col; c.beginPath(); for(let i=0;i<pts.length;i++){ if(i) c.lineTo(pts[i][0],pts[i][1]); else c.moveTo(pts[i][0],pts[i][1]); } c.closePath(); c.fill(); }
function nkEll(c,x,y,rx,ry,col,rot){ c.fillStyle=col; c.beginPath(); c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,7); c.fill(); }
function nkLine(c,x0,y0,x1,y1,w,col){ c.strokeStyle=col; c.lineWidth=w; c.lineCap='round'; c.beginPath(); c.moveTo(x0,y0); c.lineTo(x1,y1); c.stroke(); }
// floorboards: planks of ph height with staggered joints, grain and a lit edge. top: seen from above (the first-person shot)
function nkFloor(c,x,y,w,h,ph,top){ nkPx(c,x,y,w,h,'#3a2e30'); const n=Math.ceil(h/ph); for(let i=0;i<n;i++){ const yy=y+i*ph, tone=['#3e3134','#392c2f','#41343a','#372a2d'][i%4]; nkPx(c,x,yy,w,ph,tone); nkPx(c,x,yy,w,.7,'rgba(255,225,200,.07)'); nkPx(c,x,yy+ph-.8,w,.8,'rgba(0,0,0,.34)');
    for(let k=0;k<5;k++){ const jx=x+((k*97+i*53)%100)/100*w; nkPx(c,jx,yy,.8,ph,'rgba(0,0,0,.3)'); nkPx(c,jx+1.2,yy+2,.5,.5,'rgba(0,0,0,.4)'); nkPx(c,jx-1.6,yy+2,.5,.5,'rgba(0,0,0,.4)'); }
    for(let k=0;k<9;k++){ const gx=x+nkRnd(i*9+k,17)*w, gl=14+nkRnd(i*9+k,18)*46, gy=yy+2+nkRnd(i*9+k,19)*(ph-4); nkPx(c,gx,gy,gl,.4,k%3?'rgba(0,0,0,.16)':'rgba(255,220,190,.06)'); } }
  if(top){ const v=c.createRadialGradient(x+w/2,y+h/2,40,x+w/2,y+h/2,250); v.addColorStop(0,'rgba(255,230,210,.07)'); v.addColorStop(1,'rgba(0,0,0,.45)'); c.fillStyle=v; c.fillRect(x,y,w,h); } }
// real-life Nathan's face from above him. st 0..6 is how far the beating has gone.
function nkFace(c,t,F){ const st=F.st||0, hit=F.hitT<.3, P=(pts,col)=>nkPoly(c,pts,col), E=(x,y,rx,ry,col,rot)=>nkEll(c,x,y,rx,ry,col,rot), Ln=(a,b,d,e,w,col)=>nkLine(c,a,b,d,e,w,col), R=(x,y,w,h,col)=>nkPx(c,x,y,w,h,col);
  const SK='#d49868', SKS='#c08454', SKD='#a06a42', SKH='#e4ac7c', HR='#16141e', HRH='#34304a', BL='#a8141e', BLD='#7a0c16', BLH='#d0283a';
  // the hoodie: shoulders, a collar of hood, folds, the two strings
  P([[-90,132],[-84,62],[-56,42],[-20,34],[20,34],[56,42],[84,62],[90,132]],'#6a7684'); P([[-90,132],[-84,62],[-56,42],[-46,46],[-66,70],[-70,132]],'#7c8896'); P([[90,132],[84,62],[56,42],[46,46],[66,70],[70,132]],'#4c5662');
  P([[-38,38],[-22,20],[22,20],[38,38],[26,54],[0,60],[-26,54]],'#4c5662'); P([[-30,38],[-18,24],[18,24],[30,38],[20,49],[0,54],[-20,49]],'#3a424c');
  for(const q of [[-62,74,-44,126],[-32,62,-26,118],[32,64,38,118],[60,76,46,126],[-12,62,-10,122]]) Ln(q[0],q[1],q[2],q[3],1.3,'rgba(34,42,52,.5)'); Ln(-70,70,-58,60,1.2,'rgba(255,255,255,.14)');
  R(-9.6,42,3.2,44,'#d8dde4'); R(6.4,42,3.2,42,'#d8dde4'); R(-10.2,84,4.4,5,'#9aa2ae'); R(5.8,82,4.4,5,'#9aa2ae'); R(-8.6,42,.8,44,'#ffffff');
  // neck, ears
  P([[-17,16],[17,16],[19,40],[0,46],[-19,40]],'#b87a50'); P([[-17,16],[17,16],[14,27],[-14,27]],SKD);
  E(-45,-10,6.5,11,SK); E(45,-10,6.5,11,SKS); E(-45,-9,3,6.5,SKD); E(45,-9,3,6.5,SKD);
  // the head: a jaw that narrows to the chin, lit from the left
  P([[-44,-54],[44,-54],[45.5,-4],[39,17],[23,31],[-23,31],[-39,17],[-45.5,-4]],SK);
  P([[28,-54],[44,-54],[45.5,-4],[39,17],[23,31],[13,31],[31,10],[35,-12]],SKS); P([[-44,-54],[-37,-54],[-39,-6],[-31,13],[-39,17],[-45.5,-4]],SKH);
  E(0,27,19,3.4,SKS); E(-24,2,9,6,'rgba(228,150,120,.5)'); E(24,2,9,6,'rgba(196,120,96,.45)');
  // hair: a mop in spikes, strands picked out
  P([[-53,-38],[-56,-64],[-42,-85],[-24,-80],[-15,-93],[5,-86],[22,-95],[35,-80],[49,-78],[56,-58],[53,-38],[45,-34],[41,-51],[25,-45],[11,-54],[-6,-43],[-22,-53],[-38,-45],[-45,-33]],HR);
  for(const q of [[-37,-77,-27,-58],[-11,-85,-5,-62],[14,-87,16,-64],[34,-76,30,-57],[-47,-60,-45,-44],[46,-66,47,-48],[-22,-70,-18,-58]]) Ln(q[0],q[1],q[2],q[3],1.5,HRH); Ln(-2,-80,2,-66,1,'#544e70'); Ln(24,-84,24,-72,1,'#544e70');
  // headset: a band, two padded cups, a mic on a boom
  P([[-60,-58],[-52,-82],[52,-82],[60,-58],[54,-58],[48,-76],[-48,-76],[-54,-58]],'#22242c'); Ln(-46,-80,46,-80,1.2,'#4a4e5c');
  for(const sd of [-1,1]){ P([[sd*50,-50],[sd*66,-46],[sd*68,-8],[sd*50,-4]],'#22242c'); P([[sd*52,-46],[sd*57,-45],[sd*58,-10],[sd*52,-8]],'#3c404c'); P([[sd*62,-44],[sd*66,-43],[sd*67,-12],[sd*62,-11]],'#14161c'); }
  R(-64.5,-32,2.6,7,'#5aff8a'); R(-64.5,-32,2.6,2,'#c8ffd8'); Ln(-60,-6,-34,22,2.6,'#22242c'); E(-31,24,5.5,3.6,'#22242c',.7); E(-32,23,2.4,1.4,'#4a4e5c',.7);
  // brows: up in fear, then knotted
  { const y=st?-33:-39, k=st?4:-2; P([[-35,y+1],[-10,y+k],[-10,y+k+5],[-35,y+6]],HR); P([[35,y+1],[10,y+k],[10,y+k+5],[35,y+6]],HR); }
  // eyes: wide, then swollen shut one at a time
  for(const sd of [-1,1]){ const x=sd*21, shut=sd<0?st>=3:st>=5;
    if(shut){ E(x,-17,14,10,'#7a3a6a'); E(x,-18,11.5,7,'#5a2a5a'); E(x+sd*2,-20,6,3,'#8a4a7a'); P([[x-11,-17],[x+11,-17],[x+9,-14.4],[x-9,-14.4]],HR); Ln(x-8,-12.5,x+8,-12.5,.8,'#3a1a3a'); }
    else { const dx=hit?-sd*2.2:0, r=hit?4.2:5.2; E(x,-17,11.5,8.4,'#ffffff'); E(x,-10.4,11,2,'rgba(170,110,90,.35)'); E(x+dx,-17,r,r,'#5a3418'); E(x+dx,-17,r*.5,r*.5,'#0c0810'); E(x+dx-r*.36,-19,r*.26,r*.26,'#ffffff'); c.save(); c.beginPath(); c.ellipse(x,-17,11.5,8.4,0,0,7); c.clip(); R(x-12,-27,24,4.2,'rgba(60,30,20,.55)'); c.restore();
      c.strokeStyle=HR; c.lineWidth=1.7; c.beginPath(); c.ellipse(x,-17,11.8,8.6,0,Math.PI,Math.PI*2); c.stroke(); if(st>=1){ Ln(x-9,-13,x-5,-12,.5,'#c84a4a'); Ln(x+8,-20,x+4,-18,.5,'#c84a4a'); } } }
  // nose
  P([[-4,-12],[3.5,-12],[8,6],[0,10],[-8,6]],SKS); P([[-2.4,-12],[0,-12],[1,5],[-4,6]],SKH); E(-4.2,6.4,2.2,1.5,'#6a3a24'); E(4.2,6.4,2.2,1.5,'#6a3a24');
  if(st>=1){ R(-5.6,8,3,9+st*3,BL); R(-5.6,8,.9,9+st*3,BLH); R(2.6,8,2.4,5+st*2,BL); E(-4.1,17+st*3,1.9,2.2,BL); }
  if(st>=2){ E(-30,4,11,7.5,'rgba(126,62,102,.78)'); E(29,0,10,7.5,'rgba(126,62,102,.78)'); E(-30,3,6,4,'rgba(96,40,84,.7)'); E(29,-1,5.5,4,'rgba(96,40,84,.7)'); }
  // mouth
  { const mo=F.hitT<.4||st>=4; if(mo){ E(0,20,15.5,7.6,'#3a1418'); c.save(); c.beginPath(); c.ellipse(0,20,15.5,7.6,0,0,7); c.clip(); R(-13,12.6,26,4.4,'#f2ece8'); for(let i=-2;i<=2;i++) R(i*4.6-.3,12.6,.6,4.4,'#b8b0a8'); R(-11,24.4,22,3.4,'#e4dcd4'); E(0,23.6,7.4,2.6,'#b84a5a'); if(st>=4){ R(-2.6,12.6,4.8,4.6,'#3a1418'); R(6.6,24.4,4.4,3.4,'#3a1418'); E(0,22,15,5,'rgba(168,20,30,.45)'); } c.restore(); c.strokeStyle='#8a4a3a'; c.lineWidth=1.4; c.beginPath(); c.ellipse(0,20,15.5,7.6,0,0,7); c.stroke(); }
    else { P([[-13,18],[0,17],[13,18],[0,20.6]],'#7a3e2e'); E(0,23.4,8,1.6,SKS); } }
  if(st>=4){ P([[-14,25],[-6,25],[-8,37],[-13,34]],BL); R(-20.6,27,5,13,BL); R(-20.6,27,1.4,13,BLH); E(-18,41,3,3.4,BL); }
  if(st>=5){ P([[-41,-50],[-21,-49],[-22,-45],[-41,-45]],BL); R(-44.6,-46,4.4,32,BL); R(-44.6,-46,1.2,32,BLH); P([[19,9],[38,11],[36,16],[20,15]],BLD); }
  if(st>=6){ c.save(); c.beginPath(); c.moveTo(-44,-54); for(const q of [[44,-54],[45.5,-4],[39,17],[23,31],[-23,31],[-39,17],[-45.5,-4]]) c.lineTo(q[0],q[1]); c.closePath(); c.clip(); R(-46,-56,92,90,'rgba(140,10,20,.4)'); P([[-30,-41],[30,-40],[28,-34],[-30,-35]],BLD); P([[4,-10],[34,-9],[33,-4],[4,-5]],BLD); c.restore(); }
  // his hands, up, palms open, until he can no longer hold them there
  if(st<5){ const hu=Math.sin(t*9)*2; for(const sd of [-1,1]){ const x=sd*86, y=54+sd*hu; P([[x-13,y+12],[x+13,y+12],[x+15,y+74],[x-15,y+74]],sd<0?'#7c8896':'#5a6470'); R(x-14,y+10,28,5,sd<0?'#58626e':'#3a424c');
      P([[x-11,y-10],[x+11,y-10],[x+12,y+12],[x-12,y+12]],sd<0?SKH:SK); for(let i=0;i<4;i++){ const fx=x-10.4+i*5.4; P([[fx,y-24-(i===1||i===2?4:0)],[fx+4.4,y-24-(i===1||i===2?4:0)],[fx+4.6,y-9],[fx-.2,y-9]],sd<0?SKH:SK); R(fx+4.4,y-22,.6,13,SKD); R(fx+.6,y-15,3,.5,SKD); }
      P([[x+sd*-11,y-2],[x+sd*-18,y-8],[x+sd*-20,y-2],[x+sd*-12,y+8]],sd<0?SK:SKS); Ln(x-6,y+2,x+5,y,.6,SKD); Ln(x-7,y+6,x+6,y+5,.6,SKD); } } }
// Ali's fist coming in: a lamellar bracer, a cord at the wrist, four knuckles. w is its width this frame, s the side.
function nkFist(c,w,s,st){ const h=w/2, P=(pts,col)=>nkPoly(c,pts,col), R=(x,y,ww,hh,col)=>nkPx(c,x,y,ww,hh,col);
  R(-h+4,14,w-8,150,'#1c2034'); R(-h+4,14,(w-8)*.28,150,'#2a3048'); for(let i=0;i<9;i++){ const y=20+i*15; R(-h+3,y,w-6,11,'#3a4052'); R(-h+3,y,w-6,2,'#5c6478'); R(-h+3,y+9,w-6,2,'#22263a'); for(let k=0;k<3;k++){ R(-h+7+k*(w-14)/2.4,y+4,1.4,3,'#b0182a'); } }
  R(-h+2,8,w-4,8,'#b0182a'); R(-h+2,8,w-4,2,'#d8283a'); R(-h+2,14,w-4,1.4,'#6a0c18'); for(let i=0;i<5;i++) R(-h+5+i*(w-8)/5,9,1.2,6,'#8a1220');
  const top=-w*.62, fh=w*.72; P([[-h,top+4],[-h+3,top],[h-3,top],[h,top+4],[h,top+fh],[-h,top+fh]],'#d8b088'); P([[h-7,top],[h-3,top],[h,top+4],[h,top+fh],[h-7,top+fh]],'#b8906a'); R(-h,top+fh-5,w,5,'#b8906a');
  for(let i=0;i<4;i++){ const x=-h+2+i*(w-4)/4, kw=(w-4)/4-1.6; P([[x,top+2],[x+kw,top+2],[x+kw,top+9],[x,top+9]],'#e8c8a0'); R(x,top+9,kw,1.2,'#a07a54'); R(x+kw,top+3,1.2,fh*.5,'#a07a54'); R(x+1,top+3,kw-2,1.2,'#f6dcb8'); }
  P(s<0?[[h-11,-w*.3],[h+1,-w*.3],[h+1,0],[h-9,2]]:[[-h-1,-w*.3],[-h+11,-w*.3],[-h+9,2],[-h-1,0]],'#c8a078'); R(s<0?h-10:-h,-w*.3,10,1.2,'#a07a54');
  if(st>=2){ R(-h+3,top,w-6,6.4,'#a8141e'); R(-h+3,top,w-6,1.6,'#d0283a'); for(let i=0;i<4;i++) R(-h+5+i*(w-8)/4,top+6,2,4+((i*5)%4),'#a8141e'); if(st>=4){ R(-h+2,top+10,w-4,3,'rgba(168,20,30,.6)'); R(-h+6,8,w-12,5,'#7a0c16'); } } }
// the flower field at night, as in the fight: a deep sky, the pieces of Ali's moon, far ridges, white flowers on dark stems
function nkFieldBg(c,t,cam){ { const g=c.createLinearGradient(0,cam-150,0,170+cam); g.addColorStop(0,'#02030c'); g.addColorStop(.6,'#0a1030'); g.addColorStop(1,'#1c2a5c'); c.fillStyle=g; c.fillRect(0,0,384,216); } nkStars(c,90,0,cam*.5,1);
  { const g=c.createLinearGradient(40,60+cam,300,150+cam); g.addColorStop(0,'rgba(120,130,220,0)'); g.addColorStop(.5,'rgba(140,150,235,.13)'); g.addColorStop(1,'rgba(120,130,220,0)'); c.fillStyle=g; c.fillRect(0,cam-20,384,200); }
  for(let i=0;i<7;i++){ const x=286+i*9-(i%2)*15, y=40+cam+(i*7)%13, r=5+(i%3)*2.2, a=i*1.3; nkEll(c,x,y,r*1.5,r*1.5,'rgba(223,230,255,.08)'); c.fillStyle='#dfe6ff'; c.beginPath(); for(let k=0;k<7;k++){ const q=a+k/7*6.283, rr=r*(.7+nkRnd(i*7+k,33)*.45); c.lineTo(x+Math.cos(q)*rr,y+Math.sin(q)*rr); } c.closePath(); c.fill(); nkEll(c,x-r*.2,y-r*.2,r*.25,r*.2,'#b8c0e0'); nkEll(c,x+r*.25,y+r*.2,r*.16,r*.14,'#a8b0d4'); }
  nkPoly(c,[[0,168+cam],[0,150+cam],[40,140+cam],[84,152+cam],[130,136+cam],[170,150+cam],[228,132+cam],[280,148+cam],[330,138+cam],[384,152+cam],[384,168+cam]],'#0c1638'); nkPoly(c,[[0,170+cam],[0,160+cam],[60,154+cam],[120,162+cam],[200,152+cam],[270,162+cam],[340,154+cam],[384,160+cam],[384,170+cam]],'#101e46');
  { const g=c.createLinearGradient(0,166+cam,0,230+cam); g.addColorStop(0,'#13224a'); g.addColorStop(1,'#0a1430'); c.fillStyle=g; c.fillRect(0,166+cam,384,70); }
  for(let i=0;i<230;i++){ const d=nkRnd(i,22), x=nkRnd(i,21)*384, y=168+d*46+cam, sz=.5+d*1.1, sw=Math.sin(t*1.6+i)*.5*d; nkPx(c,x,y,.5,2.6*sz,'#24406c'); nkPx(c,x-sz+sw,y-sz,sz*2+.5,sz,i%3?'#8ab0e8':'#e8f0ff'); nkPx(c,x-.2+sw,y-sz*1.6,.9,sz*.7,'#ffffff'); if(i%5===0) nkPx(c,x+1.5,y+1,.5,2,'#1c3458'); } }
// a quiet street at night: his house between two neighbours, lit window, porch light, lawn, hedge, mailbox, the road
function nkHouseBg(c,t,p,sh){ const R=(x,y,w,h,col)=>nkPx(c,x,y,w,h,col);
  { const g=c.createLinearGradient(0,0,0,180); g.addColorStop(0,'#04061a'); g.addColorStop(1,'#16204a'); c.fillStyle=g; c.fillRect(0,0,384,216); } nkStars(c,70,0,0,13);
  nkEll(c,60,40,20,20,'rgba(232,236,255,.1)'); nkEll(c,60,40,12.4,12.4,'#e8ecff'); nkEll(c,56,36,2.6,2.6,'#c8cce6'); nkEll(c,64,43,3.2,3.2,'#c8cce6'); nkEll(c,58,46,1.6,1.6,'#c8cce6');
  for(let i=0;i<3;i++){ const x=((i*150+t*3)%460)-60; nkEll(c,x,30+i*16,34,4,'rgba(60,70,120,.4)'); nkEll(c,x+18,33+i*16,22,3,'rgba(60,70,120,.3)'); }
  nkPoly(c,[[0,176],[0,150],[30,138],[70,150],[110,136],[150,150],[384,150],[384,176]],'#0c1228'); for(const tx of [8,104,268,368]){ nkEll(c,tx,150,12,20,'#0a1020'); nkEll(c,tx-4,144,7,10,'#0e1630'); R(tx-1,160,2,16,'#0a0c18'); }
  // the neighbours
  for(const hx of [18,292]){ R(hx,130,72,46,'#1c2238'); for(let i=0;i<7;i++) R(hx,133+i*6,72,.6,'rgba(0,0,0,.28)'); nkPoly(c,[[hx-6,131],[hx+36,104],[hx+78,131]],'#141828'); for(let i=1;i<5;i++) nkLine(c,hx+36-i*8.4,104+i*5.4,hx+36+i*8.4,104+i*5.4,.5,'rgba(255,255,255,.05)'); R(hx+12,142,13,14,'#0c1020'); R(hx+12,142,13,.8,'#2a3050'); R(hx+18,142,.8,14,'#1c2238'); R(hx+46,150,12,26,'#141020'); R(hx+55,163,1.2,1.2,'#8a7040'); R(hx+48,121,6,9,'#141828'); }
  // the ground: lawn, a hedge, the path, the kerb, the road
  { const g=c.createLinearGradient(0,176,0,192); g.addColorStop(0,'#1a2c22'); g.addColorStop(1,'#12201a'); c.fillStyle=g; c.fillRect(0,176,384,16); } for(let i=0;i<150;i++){ const x=nkRnd(i,41)*384, y=177+nkRnd(i,42)*13; R(x,y,.5,1.6,i%3?'#2a4434':'#1c3226'); }
  R(0,190,384,3,'#3a3a44'); R(0,190,384,.7,'#5a5a66'); R(0,193,384,23,'#1c1c24'); for(let i=0;i<6;i++){ R(i*70+10,203,30,1.6,'#c8c8a0'); } for(let i=0;i<60;i++) R(nkRnd(i,45)*384,194+nkRnd(i,46)*21,1.2,.4,'rgba(255,255,255,.05)');
  nkPoly(c,[[208+sh,176],[224+sh,176],[236,190],[196,190]],'#4a4650'); for(let i=0;i<4;i++) nkLine(c,206+sh-i*2.4,179+i*3.4,226+sh+i*2.6,179+i*3.4,.4,'rgba(0,0,0,.35)');
  for(let i=0;i<9;i++){ nkEll(c,134+i*7.4,174,5,5.6,i%2?'#16301e':'#1c3a26'); nkEll(c,133+i*7.4,172,2.4,2,'#2a4c34'); } for(let i=0;i<4;i++){ nkEll(c,236+i*7,174,5,5.4,i%2?'#16301e':'#1c3a26'); }
  // his house: clapboard walls, a shingled roof with a chimney, the lit window with its curtains, the door and its light
  R(130+sh,112,124,64,'#3a3448'); for(let i=0;i<10;i++){ R(130+sh,116+i*6.2,124,.7,'rgba(0,0,0,.3)'); R(130+sh,116.7+i*6.2,124,.5,'rgba(255,255,255,.04)'); } R(130+sh,112,3,64,'#4a4458'); R(251+sh,112,3,64,'#2a2434'); R(128+sh,173,128,3,'#22202c');
  R(226+sh,76,10,22,'#4a3038'); R(225+sh,74,12,3,'#5a3a44'); for(let i=0;i<3;i++) R(226+sh,80+i*6,10,.6,'rgba(0,0,0,.4)');
  nkPoly(c,[[118+sh,115],[192+sh,69],[266+sh,115]],'#5a2a2a'); nkPoly(c,[[118+sh,115],[192+sh,69],[196+sh,72],[126+sh,115]],'#6e3636'); for(let i=1;i<8;i++){ const y=69+i*5.75, hw=i*9.25; nkLine(c,192+sh-hw,y,192+sh+hw,y,.6,'rgba(0,0,0,.3)'); for(let k=-i;k<i;k++) R(192+sh+k*9.25+(i%2)*4.6,y,.5,5.75,'rgba(0,0,0,.18)'); } R(116+sh,113,152,3,'#2a2434'); R(116+sh,113,152,.7,'#4a4458');
  R(147+sh,125,32,28,'#22202c'); R(149+sh,127,28,24,p.hit?'#ffffff':'#a8ccff'); if(!p.hit){ const g=c.createLinearGradient(0,127,0,151); g.addColorStop(0,'#b8d8ff'); g.addColorStop(1,'#7aa8e8'); c.fillStyle=g; c.fillRect(149+sh,127,28,24); nkPoly(c,[[149+sh,127],[156+sh,127],[152+sh,151],[149+sh,151]],'#6a7ab8'); nkPoly(c,[[177+sh,127],[170+sh,127],[174+sh,151],[177+sh,151]],'#6a7ab8'); R(160+sh,138,7,9,'#16141e'); nkEll(c,163.5+sh,136,3.4,3.4,'#16141e'); }
  R(162.4+sh,127,1.4,24,'#22202c'); R(149+sh,138.4,28,1.2,'#22202c'); R(145+sh,153,36,2.4,'#4a4458'); { const g=c.createRadialGradient(163+sh,139,4,163+sh,139,44); g.addColorStop(0,'rgba(140,190,255,.22)'); g.addColorStop(1,'rgba(140,190,255,0)'); c.fillStyle=g; c.fillRect(110,96,110,90); }
  R(204+sh,138,24,38,'#1c1418'); R(206+sh,140,20,36,'#3a2424'); R(208+sh,143,7,13,'#2e1c1c'); R(217+sh,143,7,13,'#2e1c1c'); R(208+sh,159,16,14,'#2e1c1c'); R(222+sh,158,1.6,1.6,'#d8b46a'); R(202+sh,176,28,2,'#5a5660');
  R(232+sh,134,3,4,'#22202c'); nkEll(c,233.5+sh,139,2,2,'#ffe6a0'); { const g=c.createRadialGradient(233.5+sh,139,1,233.5+sh,139,22); g.addColorStop(0,'rgba(255,220,140,.35)'); g.addColorStop(1,'rgba(255,220,140,0)'); c.fillStyle=g; c.fillRect(210,116,48,48); }
  R(97,160,2.4,17,'#5a5a62'); R(97,160,.7,17,'#7a7a84'); R(91,153,13,8,'#8a2a2a'); nkEll(c,97.5,153.4,6.5,3,'#8a2a2a'); R(91,153,13,.8,'#b84a4a'); R(104,151,.8,5,'#c83a3a'); R(104,151,3,2,'#c83a3a'); }
// a piece of the moon; a falling body on fire (head at x,y, tail to tx,ty)
function nkShard(c,x,y,r,i){ nkEll(c,x,y,r*1.5,r*1.5,'rgba(223,230,255,.08)'); c.fillStyle='#dfe6ff'; c.beginPath(); for(let k=0;k<7;k++){ const q=i*1.3+k/7*6.283, rr=r*(.7+nkRnd(i*7+k,33)*.45); c.lineTo(x+Math.cos(q)*rr,y+Math.sin(q)*rr); } c.closePath(); c.fill(); nkEll(c,x-r*.2,y-r*.2,r*.25,r*.2,'#b8c0e0'); nkEll(c,x+r*.25,y+r*.2,r*.16,r*.14,'#a8b0d4'); }
function nkComet(c,x,y,tx,ty,w){ const dx=tx-x, dy=ty-y, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L; for(const [k,ww,col] of [[1,1,'rgba(255,90,30,.5)'],[.72,.74,'rgba(255,160,60,.75)'],[.42,.5,'rgba(255,224,150,.9)'],[.2,.3,'#ffffff']]) nkPoly(c,[[x+nx*w*ww,y+ny*w*ww],[x-nx*w*ww,y-ny*w*ww],[x+dx*k,y+dy*k]],col);
  nkEll(c,x,y,w*1.5,w*1.5,'rgba(255,200,120,.3)'); nkEll(c,x,y,w*.75,w*.75,'#ffffff'); for(let i=0;i<10;i++){ const u=nkRnd(i,7+Math.floor(NK.t*12)), v=(nkRnd(i,9)-.5)*w*1.8; nkPx(c,x+dx*u+nx*v,y+dy*u+ny*v,.8,.8,i%2?'#ffe6a0':'#ff8a3a'); } }
// the back yard at night (the grave), the roof by day (the tarp), the bathroom mirror
function nkYardBg(c,t){ const R=(x,y,w,h,col)=>nkPx(c,x,y,w,h,col); { const g=c.createLinearGradient(0,0,0,150); g.addColorStop(0,'#04061a'); g.addColorStop(1,'#16204a'); c.fillStyle=g; c.fillRect(0,0,384,150); } nkStars(c,60,0,0,61);
  nkEll(c,310,40,22,22,'rgba(232,236,255,.1)'); nkEll(c,310,40,14,14,'#e8ecff'); nkEll(c,305,35,3,3,'#c8cce6'); nkEll(c,315,44,3.6,3.6,'#c8cce6'); for(const tx of [30,150,250,360]){ nkEll(c,tx,82,26,30,'#0a1020'); nkEll(c,tx-8,74,14,16,'#0e1630'); }
  R(0,96,384,54,'#141c2c'); for(let i=0;i<24;i++){ const x=i*16; R(x,94+(i%3),15,56,i%2?'#18223a':'#1c2840'); nkPoly(c,[[x,94+(i%3)],[x+7.5,89+(i%3)],[x+15,94+(i%3)]],i%2?'#18223a':'#1c2840'); R(x,94+(i%3),.7,56,'rgba(0,0,0,.4)'); R(x+4,104,.5,30,'rgba(0,0,0,.2)'); R(x+7,100,1,1,'#0c1220'); R(x+7,138,1,1,'#0c1220'); } R(0,108,384,3,'#101828'); R(0,136,384,3,'#101828');
  { const g=c.createLinearGradient(0,150,0,216); g.addColorStop(0,'#1a2c22'); g.addColorStop(1,'#0e1a14'); c.fillStyle=g; c.fillRect(0,150,384,66); } for(let i=0;i<260;i++){ const x=nkRnd(i,41)*384, y=151+nkRnd(i,42)*64, d=(y-150)/66; R(x,y,.5+d*.4,1.4+d*2,i%3?'#2a4434':'#1c3226'); } }
function nkRoofBg(c,t){ const R=(x,y,w,h,col)=>nkPx(c,x,y,w,h,col); { const g=c.createLinearGradient(0,0,0,216); g.addColorStop(0,'#4a98dc'); g.addColorStop(1,'#a8d4f4'); c.fillStyle=g; c.fillRect(0,0,384,216); }
  for(let i=0;i<4;i++){ const x=((30+i*100+t*6)%460)-40, y=30+(i%2)*20; nkEll(c,x+25,y+6,27,6,'#ffffff'); nkEll(c,x+14,y+3,12,7,'#ffffff'); nkEll(c,x+32,y+1,15,8,'#ffffff'); nkEll(c,x+25,y+9,24,3,'#dce8f6'); }
  nkPoly(c,[[0,216],[192,60],[384,216]],'#5a2a2a'); nkPoly(c,[[0,216],[192,60],[200,66],[14,216]],'#6e3636'); for(let i=1;i<14;i++){ const y=60+i*12, hw=i*14.8; nkLine(c,192-hw,y,192+hw,y,.7,'rgba(0,0,0,.3)'); nkLine(c,192-hw,y+.8,192+hw,y+.8,.4,'rgba(255,255,255,.05)'); for(let k=-i;k<i;k++) R(192+k*14.8+(i%2)*7.4,y,.6,12,'rgba(0,0,0,.2)'); }
  nkLine(c,192,60,192,58,3,'#3a1c1c'); }
function nkMirrorBg(c,t){ const R=(x,y,w,h,col)=>nkPx(c,x,y,w,h,col); R(0,0,384,216,'#3a3448'); for(let i=0;i<16;i++) for(let j=0;j<9;j++){ R(i*24+.6,j*24+.6,22.8,22.8,(i+j)%2?'#423c52':'#3e384e'); R(i*24+.6,j*24+.6,22.8,.7,'rgba(255,255,255,.06)'); }
  R(106,16,172,184,'#8a6a38'); R(110,20,164,176,'#c8a060'); R(110,20,164,1.4,'#e8c888'); R(110,20,1.4,176,'#e8c888'); R(272,20,2,176,'#8a6a38'); R(116,26,152,164,'#6a5230'); { const g=c.createLinearGradient(118,28,266,188); g.addColorStop(0,'#a8c8dc'); g.addColorStop(1,'#6a94b0'); c.fillStyle=g; c.fillRect(118,28,148,160); }
  nkPoly(c,[[130,28],[150,28],[122,188],[118,188],[118,140]],'rgba(255,255,255,.12)'); nkPoly(c,[[170,28],[178,28],[140,188],[132,188]],'rgba(255,255,255,.08)'); nkPoly(c,[[230,28],[266,28],[266,60]],'rgba(255,255,255,.07)'); for(let i=0;i<6;i++) R(122+nkRnd(i,5)*140,32+nkRnd(i,6)*150,1,1,'rgba(255,255,255,.3)'); }
// the rolled-up rug (with what is in it): a roll with a spiral end, rope ties, a fringe, two boots out of one end
function nkRug(c,x,y,w,h,boots){ const R=(a,b,d,e,col)=>nkPx(c,a,b,d,e,col); nkEll(c,x+w/2,y+h+1,w*.52,2,'rgba(0,0,0,.35)'); R(x,y,w,h,'#8a3a4a'); R(x,y,w,h*.22,'#b0606e'); R(x,y+h*.22,w,h*.14,'#9a4a5a'); R(x,y+h*.78,w,h*.22,'#5e2230');
  for(let i=0;i<Math.floor(w/9);i++){ R(x+4+i*9,y+h*.36,5,.7,'#6a2a3a'); R(x+7+i*9,y+h*.58,4,.7,'#a85a6a'); } for(const k of [.2,.5,.8]){ R(x+w*k,y-.6,2,h+1.2,'#c8b890'); R(x+w*k,y-.6,.7,h+1.2,'#e8dcb8'); R(x+w*k-.6,y+h*.4,3.2,1.6,'#a89868'); }
  nkEll(c,x,y+h/2,h*.3,h/2,'#6a2a3a'); nkEll(c,x,y+h/2,h*.2,h*.34,'#a85a6a'); nkEll(c,x,y+h/2,h*.1,h*.18,'#5e2230'); for(let i=0;i<6;i++) R(x+w,y+1+i*(h-2)/6,2.4,.7,'#d8c8a0');
  if(boots){ R(x+w-2,y+h*.16,10,h*.28,'#14141c'); R(x+w+6,y+h*.1,3,h*.34,'#22222c'); R(x+w-2,y+h*.56,10,h*.28,'#14141c'); R(x+w+6,y+h*.5,3,h*.34,'#22222c'); R(x+w-2,y+h*.16,10,.7,'#3a3a48'); } }
// The body on the floor, in silhouette: on his back, head to the left (a profile: brow, nose, lips, chin, the mop of hair,
// the headset cup), one knee up. p.gone + p.crT: the head is in pieces (shards that fly, turn and come to rest, a neck that
// ends, a splash across the boards), all of it only shapes.
function nkSilBody(c,t,p,sh,K){ const P=(pts)=>nkPoly(c,pts.map(q=>[q[0],q[1]+sh]),K);
  P([[230,171],[236,164.5],[247,163],[256,165.5],[262,168.5],[262,177],[232,177]]); P([[236,176],[252,175.2],[254,177.6],[236,178]]); nkEll(c,256,177+sh,2.6,1.6,K); /* chest, the near arm, a hand */
  P([[258,168],[271,159.5],[275,161.5],[265,171.5],[262,177],[258,177]]); P([[271,159.5],[275,161],[285,174],[281,177.5],[277,177]]); P([[279,174.5],[289,173.5],[290,177.5],[279,177.5]]); /* the raised knee and its shoe */
  P([[260,172],[288,172.5],[289,177.5],[260,177.5]]); P([[286,168.5],[289.6,168.2],[290.4,177.5],[286,177.5]]); /* the flat leg, toes up */
  if(!p.gone){ /* his head, on its back, crown to the left: the neck, the chin, lips, the nose pointing at the ceiling, the brow, then the mop of hair in spikes down to the floor */
    const H=[[231,170.5],[228.5,169.5],[227.6,167.2],[226.4,167.8],[225.6,166.6],[224.8,167.2],[224,166.4],[223.2,163.4],[221.4,165.8],[220,165],[217,165.2],[215.6,163],[214.6,165.6],[212.4,164],[212.6,167],[210,167.2],[211.8,169.6],[209.4,171.6],[212,172.6],[210.4,175.4],[213.4,175.2],[214,177.6],[220,177.8],[227,177.6],[231,177]];
    P(H.map(q=>[231+(q[0]-231)*1.3,177+(q[1]-177)*1.3])); return; }
  const e=Math.max(0,t-(p.crT==null?t:p.crT)), floor=177.4; P([[231,171.5],[229.4,172.6],[230.2,173.8],[228.6,174.8],[230,176],[229,177.4],[232,177.4]]); /* where the neck ends */
  { const g=Math.min(1,e/.14); nkEll(c,218,178,10+g*26,1.5+g*4.5,K); for(let i=0;i<16;i++){ const q=Math.PI+(nkRnd(i,201)-.5)*2.9, L=(14+nkRnd(i,202)*52)*g, w=1.2+nkRnd(i,203)*2.6, x1=223+Math.cos(q)*L, y1=178+Math.sin(q)*L*.2; nkPoly(c,[[223,178-w*.6],[223,178+w*.6],[x1,y1]],K); nkEll(c,x1,y1,w*.9,w*.42,K); } } /* the splash along the boards */
  for(let i=0;i<22;i++){ const big=i<5, q=-Math.PI*(.12+nkRnd(i,211)*.82), v=(big?70:95)+nkRnd(i,212)*(big?70:170), vx=Math.cos(q)*v*(nkRnd(i,216)<.75?1:-.5)-18, vy=Math.sin(q)*v, rest=floor+nkRnd(i,213)*4.5, g=330; let x=218+vx*e, y=169+vy*e+g*e*e/2, rot=e*(4+nkRnd(i,214)*9)*(i%2?1:-1);
    if(y>=rest){ const tl=(-vy+Math.sqrt(Math.max(0,vy*vy+2*g*(rest-170))))/g; x=218+vx*tl; y=rest; rot=nkRnd(i,215)*6; } const r=big?3.2+nkRnd(i,217)*2.6:1+nkRnd(i,217)*1.7; c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=K; c.beginPath();
    if(big&&i%2===0){ c.moveTo(-r,r*.5); c.lineTo(-r*.9,-r*.4); c.lineTo(-r*.3,-r*1.1); c.lineTo(0,-r*.4); c.lineTo(r*.5,-r*1.2); c.lineTo(r*.8,-r*.3); c.lineTo(r,r*.6); } /* a piece with hair on it */ else { c.moveTo(-r,r*.3); c.lineTo(-r*.2,-r); c.lineTo(r,-r*.2); c.lineTo(r*.4,r*.9); } c.closePath(); c.fill(); c.restore(); }
  for(let i=0;i<46;i++){ const q=-Math.PI*(.05+nkRnd(i,221)*.9), v=120+nkRnd(i,222)*260, x=218+Math.cos(q)*v*e, y=168+Math.sin(q)*v*e+360*e*e/2; if(y<177&&e<1.6) nkPx(c,x,y,.9+nkRnd(i,223)*1.3,1.2+nkRnd(i,223)*2.4,K); } /* and what was in it */
  for(let i=0;i<7;i++){ const x=124+nkRnd(i,231)*120, y0=28+nkRnd(i,232)*66, d0=.12+nkRnd(i,233)*.25; if(e<d0) continue; const r=2.2+nkRnd(i,234)*3.4, len=Math.min(16+nkRnd(i,235)*44,(e-d0)*(7+nkRnd(i,236)*9)); nkEll(c,x,y0,r,r*.85,K); for(let k=0;k<5;k++){ const qq=nkRnd(i*5+k,237)*6.28; nkEll(c,x+Math.cos(qq)*r*1.5,y0+Math.sin(qq)*r*1.3,r*.32,r*.3,K); } nkPx(c,x-.6,y0,1.2,len,K); nkEll(c,x,y0+len,1.3,1.6,K); } } /* it reaches the window */
const NKS={
  // the field: he is on his knees; the kick sends him up
  field(c,t,p){ const cam=(p.cam||0)*150; nkFieldBg(c,t,cam);
    /* v1.87: the kick is animated. kw: he sinks and slides back; kd: the step in; kick + hitT: the leg lands (a held frame, Nathan
       folded over it, lines and dust and petals off the impact); up: Nathan leaves along an arc with a smear; cr/leap: Ali crouches and goes after him */
    const kw=p.kw||0, kd=p.kd||0, kicked=!!p.kick, e=p.hitT!=null?t-p.hitT:99, up=p.up||0, leap=p.leap||0, cr=p.cr||0, gy=176+cam;
    const ax=196-10*kw*(1-kd)+25*kd, ay=gy-leap*330, nx=238+up*52+(p.fold?5:0), ny=gy-up*440;
    if(e<1.4){ const q=Math.min(1,e/.5); nkEll(c,232,gy+1,8+q*44,1.4+q*5,'rgba(200,215,255,'+(.4*(1-q))+')'); for(let i=0;i<34;i++){ const a2=nkRnd(i,301)*Math.PI, v=30+nkRnd(i,302)*110, sgn=i%2?1:-1, px=232+Math.cos(a2)*v*e*sgn*.9, py=gy-2-Math.sin(a2)*v*e*.55+70*e*e; if(py<gy+4) nkPx(c,px,py,1.3,.9,i%3?'rgba(232,240,255,'+(1-e/1.4)+')':'rgba(138,176,232,'+(1-e/1.4)+')'); } } /* a ring of dust, and the flowers it took with it */
    if(up>0){ const q=Math.min(1,up*3); nkPoly(c,[[nx-5,ny],[nx+5,ny],[238+up*26,gy-up*250+30],[236+up*20,gy-up*200+40]],'rgba(255,255,255,'+(.5*q*(1-up*.5))+')'); for(let i=1;i<6;i++){ const u2=Math.max(0,up-i*.05); c.save(); c.globalAlpha=.34-i*.055; nkGuy(c,238+u2*52,gy-u2*440,{kind:'gn',f:-1,face:'none',arms:'up',rot:(t-i*.03)*16,sc:1-i*.04}); c.restore(); } }
    if(p.fold&&up<=0) nkGuy(c,nx,gy-6,{kind:'gn',f:-1,face:'shock',arms:'fwd',rot:.75}); else nkGuy(c,nx,ny,{kind:'gn',f:-1,face:up>0||kicked?'shock':'ko',arms:up>0?'up':'down',rot:up>0?t*16:0,sit:!(up>0||kicked)});
    if(kd>0&&!kicked) for(let g=3;g>=1;g--) nkAli(c,ax-g*10,ay,{f:1,pose:'crouch',alpha:.34-g*.08}); if(leap>0) for(let g=1;g<=5;g++){ nkPx(c,ax-2+g*.3,ay+g*16,4-g*.5,13,'rgba(255,60,80,'+(.6-g*.1)+')'); }
    nkAli(c,ax,ay,{f:1,pose:leap>0?'fly':cr>.3?'crouch':kicked&&!p.kdone?'kick':kw>.3?'crouch':'stand',arm:Math.min(1,e/.22),rot:leap>0?-.5:0});
    if(kw>0&&!kicked){ for(let i=0;i<4;i++){ const q=(kw*1.4+i*.25)%1; nkEll(c,ax-10-q*16,gy-1-q*5,2+q*5,1.2+q*2.6,'rgba(200,215,255,'+(.35*(1-q))+')'); } } /* dust off his back foot */
    if(e<.22){ const q=e/.22, cx2=231, cy2=gy-21; for(let i=0;i<13;i++){ const a2=i/13*6.283+.2, r0=5+q*14, r1=r0+(14+nkRnd(i,311)*26)*(1-q*.4); nkPoly(c,[[cx2+Math.cos(a2-.07)*r0,cy2+Math.sin(a2-.07)*r0],[cx2+Math.cos(a2+.07)*r0,cy2+Math.sin(a2+.07)*r0],[cx2+Math.cos(a2)*r1,cy2+Math.sin(a2)*r1]],i%2?'rgba(255,255,255,'+(1-q)+')':'rgba(255,220,150,'+(1-q)+')'); } c.strokeStyle='rgba(255,255,255,'+(1-q)+')'; c.lineWidth=2*(1-q)+.3; c.beginPath(); c.ellipse(cx2,cy2,6+q*30,5+q*24,0,0,7); c.stroke(); }
    if(p.star>0){ const s2=p.star*9, sx2=238+52; nkPx(c,sx2-s2/2,14,s2,.8,'#ffffff'); nkPx(c,sx2-.4,14-s2/2,.8,s2,'#ffffff'); nkEll(c,sx2,14.4,s2*.14,s2*.14,'#ffffff'); } },
  // space: he tumbles; Ali arrives; the planet waits
  space(c,t,p){ nkPx(c,0,0,384,216,'#02030c'); nkStars(c,120,-t*6,0,3); nkStars(c,40,-t*18,0,5,'#8a9ad8'); for(let i=0;i<5;i++) nkShard(c,40+i*13,170+((i*9)%11)-t*2,6+(i%2)*3,i);
    nkEarth(c,300+(p.ex||0),70+(p.ey||0),20+(p.er||0)); const nx=p.nx==null?170:p.nx, ny=p.ny==null?110:p.ny; if(p.comet){ nkComet(c,nx,ny,nx-63*(p.cdx||1),ny+27*(p.cdy||-1),7); }
    if(!p.held) nkGuy(c,nx,ny,{kind:'gn',face:'shock',arms:'up',rot:p.spin!=null?p.spin:t*5,sc:p.ns||1});
    if(p.ali){ /* v1.87: the grab and the throw are animated. He arrives with a smear and brakes (a ring); an arm goes out and closes on
         Nathan's collar (a jolt, his tumbling stops, he dangles and flails); for the throw Ali turns on the spot, facing by facing, Nathan
         swinging round at arm's length faster and faster with a smear behind him; on release Ali is left leaning into it */
      const ax=p.ax, ay=p.ay, cx2=ax+2, cy2=ay-24, eb=p.brakeT!=null?t-p.brakeT:99, eg=p.grabT!=null?t-p.grabT:99, er=p.relT!=null?t-p.relT:99, R=31;
      if(p.streak){ for(let i=1;i<10;i++) nkPx(c,ax-i*9,ay-20+i,8,2,'rgba(255,60,80,'+(.6-i*.06)+')'); for(let g=3;g>=1;g--) nkAli(c,ax-g*13,ay+g*2,{f:1,pose:'fly',rot:.9,alpha:.3-g*.07}); }
      if(eb<.4){ const q=eb/.4; c.strokeStyle='rgba(255,255,255,'+(1-q)+')'; c.lineWidth=1.6*(1-q)+.3; c.beginPath(); c.ellipse(ax,ay-18,6+q*34,4+q*22,0,0,7); c.stroke(); for(let i=0;i<8;i++){ const a2=i/8*6.283; nkPx(c,ax+Math.cos(a2)*(10+q*40),ay-18+Math.sin(a2)*(8+q*28),1.4,1.4,'rgba(255,200,210,'+(1-q)+')'); } }
      if(p.held){ const sw=p.swing||0, spin=!!p.spinning, a=sw+(spin?0:Math.sin(t*3.1)*.09), hx2=cx2+Math.cos(a)*R, hy2=cy2+Math.sin(a)*R, sp=spin?Math.min(1,Math.max(0,sw)/7):0;
        if(sp>.05){ c.strokeStyle='rgba(255,255,255,'+(.2+.4*sp)+')'; c.lineWidth=1+sp*5; c.lineCap='round'; c.beginPath(); c.arc(cx2,cy2,R+4,a-.5-sp*2.2,a-.15); c.stroke(); c.strokeStyle='rgba(120,170,255,'+(.3*sp)+')'; c.lineWidth=7*sp; c.beginPath(); c.arc(cx2,cy2,R+4,a-.4-sp*1.6,a-.2); c.stroke();
          for(let g=4;g>=1;g--){ const ag=a-g*(.12+sp*.3); c.save(); c.globalAlpha=(.34-g*.07)*sp; nkGuy(c,cx2+Math.cos(ag)*R,cy2+Math.sin(ag)*R,{kind:'gn',face:'none',arms:'up',rot:ag+1.57}); c.restore(); } }
        nkGuy(c,hx2+Math.cos(a)*10,hy2+Math.sin(a)*10,{kind:'gn',face:'shock',arms:spin?'up':(Math.sin(t*11)>0?'up':'fwd'),rot:a+1.57+(spin?0:Math.sin(t*9)*.12)});
        const dir=((2-Math.round(a/(Math.PI/4)))%8+8)%8; nkAli(c,ax,ay,spin?{f:1,pose:'spin',dir,rot:Math.sin(t*20)*.04*sp}:{f:1,pose:'reach',rot:eg<.2?-.12*(1-eg/.2):0,hand:null});
        nkLine(c,cx2+Math.cos(a)*5,cy2+Math.sin(a)*5-3,hx2,hy2,4.2,'#1b1d28'); nkLine(c,cx2+Math.cos(a)*15,cy2+Math.sin(a)*15-1.5,hx2,hy2,3.6,'#6a6f7c'); nkEll(c,hx2,hy2,2.9,2.7,'#c8a070'); /* the arm, shoulder to fist */
        if(eg<.25){ const q=eg/.25; for(let i=0;i<9;i++){ const a2=i/9*6.283, r0=4+q*8, r1=r0+10+nkRnd(i,331)*12; nkLine(c,hx2+Math.cos(a2)*r0,hy2+Math.sin(a2)*r0,hx2+Math.cos(a2)*r1,hy2+Math.sin(a2)*r1,1.2*(1-q)+.2,'rgba(255,255,255,'+(1-q)+')'); } } }
      else { const thrown=er<1.2; nkAli(c,ax,ay,{f:1,pose:thrown?'throw':'stand',rot:(p.lean||0),hand:thrown?[30,-40]:null});
        if(er<.35){ const q=er/.35, tx2=cx2+R, ty2=cy2-12; c.strokeStyle='rgba(255,255,255,'+(1-q)+')'; c.lineWidth=2.4*(1-q)+.3; c.beginPath(); c.ellipse(tx2,ty2,8+q*50,6+q*36,-.37,0,7); c.stroke(); for(let i=0;i<10;i++){ const a2=-.37+(i-4.5)*.16; nkLine(c,tx2+Math.cos(a2)*(14+q*30),ty2+Math.sin(a2)*(14+q*30),tx2+Math.cos(a2)*(30+q*70),ty2+Math.sin(a2)*(30+q*70),1.4*(1-q)+.2,'rgba(255,240,210,'+(1-q)+')'); } } } } },
  // the planet fills the screen; the comet goes in
  earth(c,t,p){ nkPx(c,0,0,384,216,'#02030c'); nkStars(c,60,0,0,9); nkEarth(c,192,150+(1-(p.z||0))*40,90+(p.z||0)*240); const u=p.u||0, x=40+u*150, y=20+u*90; nkComet(c,x,y,x-72,y-43,6); },
  // a quiet street; then not
  house(c,t,p){ const sh=(p.hit||0)>0?Math.round(Math.sin(t*60)*2*(1-Math.min(1,t))):0; nkHouseBg(c,t,p,sh);
    if(p.hit){ c.fillStyle='#0a0c1c'; c.beginPath(); c.moveTo(196,84); c.lineTo(210,74); c.lineTo(226,88); c.lineTo(216,100); c.lineTo(200,98); c.closePath(); c.fill(); for(let i=0;i<22;i++){ const a=nkRnd(i,31)*6.28, v=20+nkRnd(i,32)*70, q=Math.min(1.6,t); nkPx(c,210+Math.cos(a)*v*q,90+Math.sin(a)*v*q*.7+q*q*38,3+nkRnd(i,33)*4,3,i%2?'#5a2a2a':'#7a6a5a'); } const d=Math.min(1,t/1.2); c.fillStyle='rgba(200,200,210,'+(.5*(1-d))+')'; c.beginPath(); c.arc(210,88,10+d*46,0,7); c.fill(); }
    else { const u=p.u||0, x=384-u*176, y=-20+u*108; nkComet(c,x,y,x+84,y-52,6); } },
  // his room. He is playing the game.
  room(c,t,p){ nkRoom(c,t,{hole:p.hole,screen:(c2,x,y,w,h)=>nkTitleScreen(c2,x,y,w,h,t),dark:p.dark}); if(p.hole) nkGuy(c,276,172,{kind:'gn',rot:-1.5,face:'ko',f:1});
    if(p.rn!==0){ const rx=p.rx==null?150:p.rx, ry=p.ry==null?150:p.ry; if(p.chair!==0){ nkPx(c,138,120,26,4,'#22222c'); nkPx(c,136,96,5,28,'#22222c'); nkPx(c,149,124,3,24,'#22222c'); nkPx(c,138,148,26,3,'#22222c'); } nkGuy(c,rx,ry,{kind:'rn',f:p.rf||1,sit:p.rsit!==0,face:p.rface||'calm',arms:p.rarms||'fwd',rot:p.rrot||0}); }
    if(p.ali){ nkAli(c,p.ax,p.ay,{f:p.af||-1,pose:p.apose||'stand',arm:p.aarm||0}); } },
  // first person. Two fists, one face.
  fpv(c,t,p){ const F=NK.fp||{n:0,l:0,r:0,st:0,hitT:9}, st=F.st, hq=F.hitT-.045, hk=hq>=0&&hq<.22?Math.pow(1-hq/.22,2):0 /* the head takes the punch when the fist arrives, and swings back */, jx=-(F.side||1)*13*hk, jy=3*hk; nkFloor(c,0,0,384,216,27,1);
    if(F.n>3){ const pr=Math.min(1,(F.n-3)/24); c.fillStyle='#5a060e'; c.beginPath(); c.ellipse(192,150,40+pr*170,20+pr*80,0,0,7); c.fill(); c.fillStyle='#7a0c16'; c.beginPath(); c.ellipse(186,146,30+pr*130,14+pr*60,0,0,7); c.fill(); } /* the pool under his head */ for(let i=0;i<F.n*4;i++){ const a=nkRnd(i,41)*6.28, r=50+nkRnd(i,42)*150; nkPx(c,192+Math.cos(a)*r,100+Math.sin(a)*r*.7,3+nkRnd(i,43)*11,2+nkRnd(i,44)*6,i%3?'#7a0c16':'#a8141e'); }
    c.save(); c.translate(192+jx,96+jy); c.rotate((F.side||1)*.15*hk+Math.sin(t*1.3)*.01); c.scale(1+.07*hk,1-.05*hk);
    nkFace(c,t,F); c.restore();
    /* the fists (v1.87: they used to appear on his face and slide back). A punch is thrown: 3 frames out with a smear behind it,
       4 frames buried in his face (squashed, a burst of lines where it lands), then it comes back; the other fist cocks back as this one goes */
    for(const s of [-1,1]){ const u=s<0?F.l:F.r, uo=s<0?F.r:F.l, T1=.045, T2=.115, T3=.36; let e=0, sq=0; if(u<T1) e=Math.pow(u/T1,.6); else if(u<T2){ e=1; sq=1-(u-T1)/(T2-T1); } else if(u<T3){ const q=(u-T2)/(T3-T2); e=1-q*q*(3-2*q); }
      const cock=uo<T2?1:uo<T3?1-(uo-T2)/(T3-T2):0, idle=Math.sin(t*2.2+(s<0?0:1.7))*2.2, rx=192+s*(150+cock*16), ry=214+cock*16+idle, tx=192+s*27, ty=96, bx=rx+(tx-rx)*e, by=ry+(ty-ry)*e, w=(60-e*18)*(1+sq*.22);
      if(u<T1+.02) for(let g=3;g>=1;g--){ const eg=Math.max(0,e-g*.2); c.save(); c.globalAlpha=.22-g*.05; c.translate(rx+(tx-rx)*eg,ry+(ty-ry)*eg); c.rotate(-s*(.5-eg*.42)); nkFist(c,60-eg*18,s,st); c.restore(); }
      c.save(); c.translate(bx,by); c.rotate(-s*(.5-e*.42)); c.scale(1,1-sq*.14); nkFist(c,w,s,st); c.restore();
      if(u>=T1&&u<T1+.13){ const q=(u-T1)/.13, cx2=192+s*20, cy2=92; for(let i=0;i<11;i++){ const a=i/11*6.283+s*.3, r0=14+q*26, r1=r0+(20+nkRnd(i,F.n+7)*34)*(1-q*.5); nkPoly(c,[[cx2+Math.cos(a-.05)*r0,cy2+Math.sin(a-.05)*r0],[cx2+Math.cos(a+.05)*r0,cy2+Math.sin(a+.05)*r0],[cx2+Math.cos(a)*r1,cy2+Math.sin(a)*r1]],i%2?'rgba(255,255,255,'+(1-q)+')':(st>=2?'rgba(255,120,110,':'rgba(255,236,170,')+(1-q)+')'); }
        c.strokeStyle='rgba(255,255,255,'+(.8*(1-q))+')'; c.lineWidth=2.4*(1-q)+.4; c.beginPath(); c.ellipse(cx2,cy2,10+q*46,8+q*36,0,0,7); c.stroke(); } }
    { const DR=F.drops||(F.drops=[]); for(const d of DR){ d.vy+=520/60; d.x+=d.vx/60; d.y+=d.vy/60; nkPx(c,d.x,d.y,d.r,d.r+1,d.k?'#a8141e':'#7a0c16'); } if(DR.length>420) DR.splice(0,DR.length-420); for(let i=DR.length-1;i>=0;i--) if(DR[i].y>230) DR.splice(i,1); } /* spray from every hit */
    { const LS=F.lens||[]; for(const q of LS){ q.t+=1/60; c.fillStyle='rgba(122,8,18,'+Math.min(.9,q.t*8)+')'; for(const b of q.b){ c.beginPath(); c.arc(q.x+b[0],q.y+b[1],b[2],0,7); c.fill(); } for(const b of q.d){ c.fillRect(q.x+b[0],q.y,2,Math.min(b[1],q.t*b[2])); } } } /* and it lands on your eyes: it stays, and runs */
    if(F.hitT<.07){ nkPx(c,0,0,384,216,st>=2?'rgba(255,200,200,.5)':'rgba(255,255,255,.5)'); } if(st>=3){ const v=c.createRadialGradient(192,108,60,192,108,230); v.addColorStop(0,'rgba(90,0,8,0)'); v.addColorStop(1,'rgba(90,0,8,'+(.12*st)+')'); c.fillStyle=v; c.fillRect(0,0,384,216); } },
  // only shapes against the window
  sil(c,t,p){ /* a red night: everything is black against a blood moon. Nothing is shown but shapes: flecks, a pool, a room that gets darker */ const pu=.5+.5*Math.sin(t*2.1), n=p.hits||0, K='#000000';
    nkPx(c,0,0,384,216,'#050001'); nkPx(c,112,14,160,134,'#120003'); const sk=c.createLinearGradient(0,22,0,142); sk.addColorStop(0,'#3a0006'); sk.addColorStop(.55,'#8a0a10'); sk.addColorStop(1,'#c81a14'); c.fillStyle=sk; c.fillRect(120,22,144,120);
    c.fillStyle='rgba(255,60,40,'+(.20+.08*pu)+')'; c.beginPath(); c.arc(200,74,46,0,7); c.fill(); c.fillStyle='#e02a1a'; c.beginPath(); c.arc(200,74,34,0,7); c.fill(); c.fillStyle='#ff5a3a'; c.beginPath(); c.arc(196,70,29,0,7); c.fill(); c.fillStyle='rgba(120,0,0,.5)'; for(const [mx,my,mr] of [[188,62,7],[210,80,9],[196,88,5],[214,60,4]]){ c.beginPath(); c.arc(mx,my,mr,0,7); c.fill(); }
    for(let i=0;i<4;i++){ const cx=(i*90+t*5)%230+90; nkPx(c,cx,40+i*22,60,3,'rgba(20,0,0,.55)'); nkPx(c,cx+14,43+i*22,34,2,'rgba(20,0,0,.4)'); } /* cloud bars crawling over the moon */
    for(let i=0;i<Math.min(11,n);i++){ /* one run per blow, short and thin: at four per blow the glass looked like prison bars */ const x=126+nkRnd(i,71)*132, y0=26+nkRnd(i,72)*60, len=Math.min(14+nkRnd(i,74)*34,(t-(p['h'+i]||t))*(5+nkRnd(i,73)*8)); if(len>0){ nkPx(c,x,y0,1,len,'#000'); nkPx(c,x-1,y0-2,3,3,'#000'); nkPx(c,x-1,y0+len,3,2,'#000'); } } /* what hits the glass runs down it */
    nkPx(c,190,22,5,120,'#120003'); nkPx(c,120,80,144,5,'#120003'); for(let i=0;i<6;i++){ nkPx(c,98+i*5,10,5,144-i*13,'#030000'); nkPx(c,282-i*5,10,5,144-i*13,'#030000'); }
    const fl=c.createLinearGradient(0,146,0,216); fl.addColorStop(0,'#2a0004'); fl.addColorStop(1,'#030000'); c.fillStyle=fl; c.fillRect(0,146,384,70); c.fillStyle='rgba(200,20,16,'+(.30+.08*pu)+')'; c.beginPath(); c.moveTo(120,146); c.lineTo(264,146); c.lineTo(340,216); c.lineTo(44,216); c.closePath(); c.fill();
    const sh=(p.thud||0)>0?Math.round(p.thud*2):0, pool=Math.min(1,(p.pool||0)); if(pool>0){ c.fillStyle=K; c.beginPath(); c.ellipse(226,178,10+pool*46,2+pool*7,0,0,7); c.fill(); for(let i=0;i<5;i++){ c.beginPath(); c.ellipse(226+(nkRnd(i,81)*2-1)*(20+pool*40),180+nkRnd(i,82)*8*pool,3+pool*9*nkRnd(i,83),1+pool*2,0,0,7); c.fill(); } }
    nkSilBody(c,t,p,sh,K);
    if(p.twitch){ const tw=Math.round(Math.sin(t*30)*1.5); c.fillRect(282,158+tw,4,6); } /* one hand still moving */
    if(p.stand){ nkAli(c,246,176,{f:-1,pose:'stand',sil:K,sc:1.3}); { /* the leg that stomps: hip, knee, a foot that rises over the head and comes down on it */ const a=p.foot||0, kx=232-a*10, ky=162-a*20, fx=228-a*9, fy=175-a*21; nkLine(c,243,150,kx,ky,7,K); nkLine(c,kx,ky,fx+1.5,fy,5.5,K); nkPoly(c,[[fx-6,fy-1.2],[fx+4,fy-2],[fx+4.6,fy+2.4],[fx-6.4,fy+2.4]],K); } if(p.eyes){ nkPx(c,235,128,3,2,'rgba(255,40,30,'+p.eyes+')'); nkPx(c,241,128,3,2,'rgba(255,40,30,'+p.eyes+')'); } } else { nkAli(c,246,172+sh*.5,{f:-1,pose:'kneel',arm:0,sil:K,sc:1.3}); { /* the arm that does the work: it rises slowly and comes down fast, the whole body following */ const a=p.arm||0, sx2=233, sy2=149+sh*.5, ex2=226-a*5, ey2=156-a*19, hx2=221-a*3, hy2=165-a*45+sh; nkLine(c,sx2,sy2,ex2,ey2,5.5,K); nkLine(c,ex2,ey2,hx2,hy2,4.8,K); nkEll(c,hx2,hy2,3.6,3.3,K); if(a<.12&&(p.thud||0)>.3){ for(let i=0;i<7;i++){ const q=-2.9+i*.36, r0=11, r1=19+nkRnd(i,(p.hits||0)+3)*14; nkLine(c,219+Math.cos(q)*r0,167+Math.sin(q)*r0,219+Math.cos(q)*r1,167+Math.sin(q)*r1,1.1,K); } } } }
    const FK=NK.flk||[]; c.fillStyle=K; for(const f of FK){ f.vy+=260/60; f.x+=f.vx/60; f.y+=f.vy/60; if(f.y<184) c.fillRect(Math.round(f.x),Math.round(f.y),f.r,f.r+(f.vy>40?2:0)); } if(FK.length>260) FK.splice(0,FK.length-260);
    const v=c.createRadialGradient(214,120,50,214,120,230); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,'+(.75+.15*pu)+')'); c.fillStyle=v; c.fillRect(0,0,384,216); if(p.pulse>0){ nkPx(c,0,0,384,216,'rgba(160,0,0,'+(p.pulse*.35)+')'); }
    if(p.black) nkPx(c,0,0,384,216,'rgba(0,0,0,'+p.black+')'); },
  // he wakes up
  wake(c,t,p){ nkRoom(c,t,{hole:1,morning:1,screen:(c2,x,y,w,h)=>nkTitleScreen(c2,x,y,w,h,t)}); nkGuy(c,170,178,{kind:'rn',rot:-1.5708,arms:'down',nohead:1}); c.fillStyle='#8a0c16'; c.beginPath(); c.ellipse(124,170,20,9,0,0,7); c.fill(); for(let i=0;i<14;i++){ const a=nkRnd(i,51)*6.28, r=14+nkRnd(i,52)*22; nkPx(c,124+Math.cos(a)*r,170+Math.sin(a)*r*.45,2+nkRnd(i,53)*5,2,i%2?'#8a0c16':'#a8141e'); } nkPx(c,112,166,10,4,'#a8141e');
    const up=p.up||0; nkGuy(c,276,172,{kind:'gn',rot:-1.5*(1-up),face:p.gface||'ko',f:-1,arms:p.garms||'down',sit:up>.9}); if(p.scream){ for(let i=0;i<8;i++){ const a=i/8*6.28+t*3; nkPx(c,270+Math.cos(a)*(26+Math.sin(t*20)*3),128+Math.sin(a)*(22+Math.sin(t*20)*3),4,2,'#ffffff'); } } },
  // the montage: five small jobs
  mont(c,t,p){ const k=p.k||0, q=(t*1.2)%1, sw=Math.sin(t*9);
    if(k===0){ nkRoom(c,t,{hole:1,morning:1,clean:0,screen:(c2,x,y,w,h)=>nkPx(c2,x,y,w,h,'#060810')}); c.fillStyle='rgba(138,12,22,'+(.8-(p.u||0)*.8)+')'; c.beginPath(); c.ellipse(124,170,20,9,0,0,7); c.fill(); const mx=150+sw*26; nkGuy(c,mx+18,178,{kind:'gn',f:-1,arms:'fwd',walk:t*9}); nkPx(c,mx-14,150,2,28,'#c8a060'); nkPx(c,mx-22,176,16,5,'#e8e8f0'); nkPx(c,60,160,14,18,'#5a8ac8'); nkPx(c,58,158,18,3,'#8ab0e8'); }
    else if(k===1){ nkRoom(c,t,{hole:1,morning:1,clean:1,screen:(c2,x,y,w,h)=>nkPx(c2,x,y,w,h,'#060810')}); const x=300-(t*40)%220; nkRug(c,x+16,164,74,14,1); nkGuy(c,x,178,{kind:'gn',f:-1,arms:'fwd',walk:t*10,face:'shock'}); }
    else if(k===2){ nkYardBg(c,t); c.fillStyle='#2a2018'; c.beginPath(); c.ellipse(200,186,46,12,0,0,7); c.fill(); c.fillStyle='#3e3024'; c.beginPath(); c.ellipse(120,180,30,14,0,3.14,6.28); c.fill(); const dg=Math.max(0,sw); nkGuy(c,238,184,{kind:'gn',f:-1,arms:'fwd'}); c.save(); c.translate(216,166); c.rotate(-.5-dg*.7); nkPx(c,-22,0,24,2,'#c8a060'); nkPx(c,-30,-3,9,8,'#b8bcc4'); c.restore(); if(dg>.8) for(let i=0;i<5;i++) nkPx(c,150+i*8,160-i*5-q*10,3,3,'#3e3024'); nkRug(c,176,174,50,10,0); }
    else if(k===3){ nkRoofBg(c,t); nkPx(c,150,106,90,60,'#2a6ad8'); nkPx(c,150,106,90,4,'#4a8af0'); for(let i=0;i<4;i++){ nkPx(c,142+i*26,100+(i%2)*4,22,8,'#b8bcc4'); nkPx(c,142+i*26,164-(i%2)*4,22,8,'#b8bcc4'); } nkGuy(c,262,170,{kind:'gn',f:-1,arms:sw>0?'up':'fwd'}); nkPx(c,238,140+(sw>0?-12:4),14,6,'#b8bcc4'); }
    else { nkMirrorBg(c,t); c.save(); c.beginPath(); c.rect(118,28,148,160); c.clip(); nkGuy(c,192,236,{kind:'gn',hood:1,headset:1,sc:3,arms:sw>.2?'up':'down',face:sw>.2?'calm':'shock'}); c.restore(); } },
  // some time later
  pc(c,t,p){ nkRoom(c,t,{hole:1,tarp:1,clean:1,screen:(c2,x,y,w,h)=>{ if(p.game===2) nkRtsScreen(c2,x,y,w,h,t); else nkJrpgScreen(c2,x,y,w,h,t); if(p.disc){ nkDiscord(c2,x,y,30,h,t,p.disc>1); } }});
    nkPx(c,138,120,26,4,'#22222c'); nkPx(c,136,96,5,28,'#22222c'); nkPx(c,149,124,3,24,'#22222c'); nkPx(c,138,148,26,3,'#22222c'); nkGuy(c,150,150,{kind:'gn',hood:1,headset:1,f:1,sit:1,arms:p.phone===2?'guard':'fwd',face:p.gface||'calm'});
    if(p.phone){ const b=p.phone===1?Math.round(Math.sin(t*50)*1.5):0; nkPx(c,200+b,108,9,5,'#14141c'); nkPx(c,201+b,109,7,3,p.phone===1?'#5aff8a':'#2a2a34'); if(p.phone===1){ for(let i=0;i<3;i++) nkPx(c,196+b-i*3,104-i*2,2,2,'#ffffff'); c.fillStyle='rgba(8,10,20,.9)'; c.fillRect(214,84,62,22); c.fillStyle='#5aff8a'; c.font='7px monospace'; c.fillText('INCOMING',218,93); c.fillStyle='#ffffff'; c.fillText('SHAYAN',218,102); } } },
  card(c,t,p){ nkPx(c,0,0,384,216,'#000000'); c.textAlign='center'; c.fillStyle='rgba(255,255,255,'+Math.min(1,t*1.5)+')'; c.font='700 16px Georgia,serif'; c.fillText(p.a||'',192,104); c.font='italic 9px Georgia,serif'; c.fillStyle='rgba(216,180,106,'+Math.min(1,Math.max(0,t-.5)*1.5)+')'; c.fillText(p.b||'',192,124); c.textAlign='left'; },
  black(c){ nkPx(c,0,0,384,216,'#000000'); } };
// ---------- drawing it over the game ----------
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); if(!NK.on) return; try{ if(!NK.cv){ NK.cv=document.createElement('canvas'); NK.cv.width=384*NK.S; NK.cv.height=216*NK.S; NK.c=NK.cv.getContext('2d'); } const c=NK.c, paused=Game.state==='paused', dt=paused?0:1/60; NK.t+=dt; NK.shake=Math.max(0,NK.shake-dt*4); NK.flash=Math.max(0,NK.flash-dt*3);
      c.save(); c.setTransform(NK.S,0,0,NK.S,0,0); c.imageSmoothingEnabled=false; c.globalAlpha=1; c.textAlign='left'; c.fillStyle='#000'; c.fillRect(0,0,384,216); c.save(); { /* the film's own camera: zoom about a point of the scene */ const z=Math.max(.2,NK.p.zoom||1), zx=NK.p.zx==null?192:NK.p.zx, zy=NK.p.zy==null?108:NK.p.zy, hx=192/z, hy=108/z, cx=Math.max(hx,Math.min(384-hx,zx)), cy=Math.max(hy,Math.min(216-hy,zy)); c.translate(192,108); c.scale(z,z); c.translate(-cx,-cy); } const f=NKS[NK.scene]||NKS.black; f(c,NK.t,NK.p); c.restore();
      if(NK.bars){ nkPx(c,0,0,384,14,'#000000'); nkPx(c,0,202,384,14,'#000000'); } c.restore();
      D.save(); D.setTransform(RW/UW,0,0,RH/UH,0,0); D.imageSmoothingEnabled=true; try{ D.imageSmoothingQuality='high'; }catch(e){} const sx=NK.shake>0?(Math.random()-.5)*NK.shake*18:0, sy=NK.shake>0?(Math.random()-.5)*NK.shake*18:0; D.fillStyle='#000'; D.fillRect(0,0,UW,UH); D.drawImage(NK.cv,sx,sy,UW,UH);
      if(NK.flash>0){ D.fillStyle='rgba(255,255,255,'+Math.min(1,NK.flash)+')'; D.fillRect(0,0,UW,UH); } if(NK.fade>0){ D.fillStyle='rgba(0,0,0,'+Math.min(1,NK.fade)+')'; D.fillRect(0,0,UW,UH); }
      const F=NK.fp; if(F&&NK.scene==='fpv'&&!F.done){ D.textAlign='center'; D.font=`800 ${IS_TOUCH()?22:24}px ${FB}`; D.lineWidth=5; D.strokeStyle='#08040a'; const a=.75+.25*Math.sin(NK.t*8), G6=nkPadOn()?((PAD_GLYPH[PAD.glyph]||PAD_GLYPH.xb)[6]):K('attack'), G7=nkPadOn()?((PAD_GLYPH[PAD.glyph]||PAD_GLYPH.xb)[7]):K('block'), tx=IS_TOUCH()&&!nkPadOn()?'TAP LEFT SIDE          TAP RIGHT SIDE':G6+':  LEFT          '+G7+':  RIGHT'; D.globalAlpha=a; D.strokeText(tx,UW/2,UH-64); D.fillStyle='#ffffff'; D.fillText(tx,UW/2,UH-64); D.globalAlpha=1;
        const w=320, x=UW/2-w/2, y=UH-44; D.fillStyle='rgba(0,0,0,.6)'; D.fillRect(x-2,y-2,w+4,14); D.fillStyle='#a8141e'; D.fillRect(x,y,w*Math.min(1,F.n/F.need),10); D.textAlign='left'; }
      const S=NK.sub; if(S){ S.t+=dt; if(S.t>S.dur) NK.sub=null; else { const al=Math.min(1,S.t*6,(S.dur-S.t)*4); D.globalAlpha=al; D.textAlign='center'; D.font=`700 22px ${FB}`; const tx=(NAMES[S.who]?NAMES[S.who]+':  ':'')+S.text, w=D.measureText(tx).width+28; D.fillStyle='rgba(8,8,16,.82)'; D.fillRect(UW/2-w/2,UH*.16-22,w,34); D.fillStyle='#f0e8d8'; D.fillText(tx,UW/2,UH*.16+2); D.globalAlpha=1; D.textAlign='left'; } }
      D.restore(); if(Game.dlg) drawDialog(); if(paused){ try{ drawPause(); }catch(e){} } /* the base UI drew its pause screen under the film */ }catch(e){ console.error('nk draw',e); } }; })();
function nkPadOn(){ try{ return typeof PAD!=='undefined'&&PAD.mode!=='kbm'&&!!twPadGet(); }catch(e){ return false; } }
// touch: a tap on the left half is the left fist, on the right half the right fist (the on-screen buttons are hidden in cutscenes)
try{ ui.addEventListener('pointerdown',e=>{ try{ const F=NK.fp; if(!NK.on||NK.scene!=='fpv'||!F||F.done||e.pointerType==='mouse') return; const r=ui.getBoundingClientRect(); F.tap=(e.clientX-r.left)<r.width/2?-1:1; e.preventDefault(); e.stopImmediatePropagation(); }catch(err){} },true); }catch(e){}
// ---------- the playable beat ----------
function* nkPunchOut(){ const F=NK.fp={n:0,need:28,l:9,r:9,st:0,hitT:9,side:1,done:0,idle:0}; const lines=[[3,"Wait. WAIT. Who ARE you?!"],[7,"I didn't even WRITE the game! I just PLAY it!"],[11,"I have WORK tomorrow!"],[15,"Is this about the mech? You can HAVE the mech!"],[19,"...ow."],[23,"...save... file..."]];
  hit.attack=false; hit.block=false;
  while(F.n<F.need){ F.l+=1/60; F.r+=1/60; F.hitT+=1/60; F.idle+=1/60; let s=0; const pad=nkPadOn(); if(F.tap){ if(F.tap<0&&F.l>.14) s=-1; else if(F.tap>0&&F.r>.14) s=1; F.tap=0; } if(pad){ /* a controller: LT is the left fist, RT the right (read straight from the triggers, whatever they are bound to) */ let bl=false, br=false; try{ const gp=twPadGet(), b=gp&&gp.buttons; bl=!!(b&&b[6]&&(b[6].pressed||b[6].value>.4)); br=!!(b&&b[7]&&(b[7].pressed||b[7].value>.4)); }catch(e){} if(bl&&!F.pl&&F.l>.14) s=-1; else if(br&&!F.pr&&F.r>.14) s=1; F.pl=bl; F.pr=br; consume('attack'); consume('block'); } else if(!s){ if(consume('attack')&&F.l>.14) s=-1; else if(consume('block')&&F.r>.14) s=1; } hit.confirm=false;
    if(s){ if(s<0) F.l=0; else F.r=0; F.n++; F.side=s; F.hitT=0; F.idle=0; F.st=Math.min(6,Math.floor(F.n/4)); NK.shake=Math.min(1,.35+F.st*.08); Sound.sfx(F.n%3?'hit':'slam'); if(F.st>=2&&F.n%2===0) Sound.sfx('gore'); const L=lines.find(q=>q[0]===F.n); if(L) nkSub('nathanirl',L[1],1.8); try{ const DR=F.drops||(F.drops=[]), nd=4+F.n*1.4; for(let k=0;k<nd;k++) DR.push({x:192+rnd(-22,22),y:96+rnd(-20,26),vx:-s*rnd(20,260)+rnd(-90,90),vy:rnd(-300,-30),r:1+Math.floor(Math.random()*(2+F.st*.6)),k:k%2}); if(F.n>=6&&F.n%2===0){ const LS=F.lens||(F.lens=[]), b=[], d=[], r=8+F.st*4; for(let k=0;k<8;k++){ const a=rnd(0,6.28), q=rnd(0,r); b.push([Math.cos(a)*q,Math.sin(a)*q,rnd(.2,.55)*r]); } for(let k=0;k<3;k++) d.push([rnd(-r*.6,r*.6),rnd(20,90),rnd(14,40)]); LS.push({x:rnd(30,354),y:rnd(20,180),b,d,t:0}); if(LS.length>16) LS.shift(); } }catch(e){} }
    yield wait(0); }
  F.done=1; yield wait(.5); }
// ---------- the film ----------
function* nkEnding(){ const P=Player; Sound.stop(); try{ twClearCine&&twClearCine(); }catch(e){} NK.on=1; NK.fade=0; NK.bars=1; NK.fp=null; Game.letterTo=0; P.inv=999; Cam.cine=Cam.cine||null;
  nkScene('field',{zoom:2.3,zx:218,zy:152}); try{ NP1.hint=null; nbRemove(); Game.arena=null; Cam.zoom=1; }catch(e){ console.error('nk cleanup',e); } /* the fight is over for good: without this his HP bar stayed on screen, over the end screen too (seen in the playtest rig) */ yield wait(.8);
  yield say('nathanraw',"...Do it, then. Finish the arc. At least make it MEAN something.");
  yield say('ali',"It doesn't.");
  yield say('nathanraw',"...What?");
  yield say('ali',"Mean something. Hold still.");
  yield tween(NK.p,{zoom:1.5,zx:214,zy:150},.3,t=>t*t); Sound.sfx('charge'); yield tween(NK.p,{kw:1},.42,t=>t*(2-t)); yield wait(.08); Sound.sfx('dash'); yield tween(NK.p,{kd:1},.08,t=>t*t);
  NK.p.kick=1; NK.p.fold=1; NK.p.hitT=NK.t; Sound.sfx('crossboom'); Sound.sfx('slam'); Sound.sfx('hit'); NK.shake=1; NK.flash=.7; yield wait(.22); /* the frame it lands is held */
  NK.p.fold=0; NK.p.zoom=1; NK.p.zx=192; NK.p.zy=108; Sound.sfx('quickboost'); NK.shake=.5; yield tween(NK.p,{up:1},.5,t=>t*t); NK.p.star=0; Sound.sfx('secret'); yield tween(NK.p,{star:1},.2); yield tween(NK.p,{star:0},.3); yield wait(.25); NK.p.kdone=1; yield wait(.3);
  yield say('ali',"Too low.");
  yield tween(NK.p,{cr:1},.28,t=>t*(2-t)); Sound.sfx('dash'); Sound.sfx('quickboost'); NK.shake=.5; NK.p.hitT=NK.t; Game.fxUpd.push(()=>{ if(NK.scene!=='field') return false; NK.p.cam=Math.min(1,(NK.p.leap||0)*1.4); return true; }); yield tween(NK.p,{leap:1},.55,t=>t*t); NK.flash=.5; /* he crouches, and goes after him: the ground rings again, the camera follows him up */
  // space
  nkScene('space',{nx:120,ny:150}); Sound.sfx('drone'); yield tween(NK.p,{nx:190,ny:104},1.6,t=>1-(1-t)*(1-t)); yield tween(NK.p,{zoom:2.4,zx:190,zy:84},.5,t=>t*t*(3-2*t));
  yield say('nathanraw',"I'M IN SPACE! WITHOUT THE MECH! I NEED THE MECH FOR SPACE!");
  yield tween(NK.p,{zoom:1.5,zx:170,zy:112},.3); NK.p.ali=1; NK.p.ax=-30; NK.p.ay=150; NK.p.streak=1; Sound.sfx('quickboost'); yield tween(NK.p,{ax:168,ay:124},.35,t=>1-(1-t)*(1-t)); NK.p.streak=0; NK.p.brakeT=NK.t; NK.shake=.4; Sound.sfx('dash'); yield wait(.22); NK.p.spin=NK.p.spin!=null?NK.p.spin:NK.t*5; Sound.sfx('swing'); yield wait(.06); NK.p.held=1; NK.p.swing=-.4; NK.p.grabT=NK.t; NK.shake=.7; NK.flash=.3; Sound.sfx('slam'); Sound.sfx('hit'); yield tween(NK.p,{zoom:2.3,zx:178,zy:104},.4,t=>t*t*(3-2*t));
  yield say('nathanraw',"Oh thank God. You came to get m");
  yield tween(NK.p,{zoom:1.25,zx:230,zy:96},.5,t=>t*t*(3-2*t)); yield say('ali',"That one. The blue one.");
  yield say('nathanraw',"The blue wh... no. No no no. People LIVE there.");
  yield say('ali',"Yes.");
  NK.p.zoom=1.5; NK.p.zx=180; NK.p.zy=108; NK.p.spinning=1; Sound.sfx('swing'); { const sw={n:0}; Game.fxUpd.push(()=>{ if(NK.scene!=='space'||!NK.p.spinning) return false; const k=Math.floor(((NK.p.swing||0)+.4)/6.283); if(k>sw.n){ sw.n=k; Sound.sfx('swing'); NK.shake=Math.max(NK.shake,.25); } return true; }); } yield tween(NK.p,{swing:18.48},1.9,t=>t*t); NK.p.spinning=0; NK.p.relT=NK.t; NK.p.zoom=1; Sound.sfx('crossboom'); Sound.sfx('quickboost'); NK.shake=1; NK.flash=.8; NK.p.held=0; NK.p.nx=NK.p.ax+30; NK.p.ny=NK.p.ay-30; NK.p.comet=1; NK.p.cdx=1; NK.p.cdy=1; NK.p.spin=.6;
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
  Sound.stop(); NK.fade=1; NK.flk=[]; nkScene('sil',{arm:0,zoom:2.1,zx:236,zy:140,twitch:1,hits:0,pool:0}); try{ Sound.sfx('drone'); Sound.sfx('heartbeat'); }catch(e){} yield wait(1.4); Game.fxUpd.push(dt=>{ if(NK.scene!=='sil') return false; if(NK.p.noDolly) return true; NK.p.zoom=Math.max(1.15,NK.p.zoom-(dt||1/60)*.05); NK.p.zx=Math.max(200,NK.p.zx-(dt||1/60)*2.2); NK.p.zy=Math.max(112,NK.p.zy-(dt||1/60)*1.4); return true; }); yield tween(NK,{fade:0},1.4);
  for(let i=0;i<11;i++){ yield tween(NK.p,{arm:1},i<5?.4:i<9?.62:.9,t=>{ t=Math.min(1,t); return t*t; }); yield tween(NK.p,{arm:0},.08); Sound.sfx('hit'); Sound.sfx('gore'); if(i>3) Sound.sfx('slam'); NK.p.thud=1; NK.shake=.3+i*.03; NK.p.hits=i+1; NK.p['h'+i]=NK.t; NK.p.pulse=1; if(i>=5) NK.p.twitch=0;
    for(let k=0;k<10+i*3;k++) NK.flk.push({x:224+rnd(-4,4),y:166,vx:rnd(-90,60)-i*4,vy:rnd(-190,-50)-i*6,r:1+Math.floor(Math.random()*2.4)}); /* black flecks against the red: the only thing that leaves him */
    yield tween(NK.p,{thud:0,pulse:0},.22); if(i>=4) NK.p.pool=Math.min(.55,(NK.p.pool||0)+.09); yield wait(i<5?.14:i<9?.45:.9); if(i===6) Sound.sfx('heartbeat'); }
  yield wait(1.6); NK.p.stand=1; NK.p.foot=0; Sound.sfx('step'); yield tween(NK.p,{pool:.7},1.6); NK.p.noDolly=1; /* the camera comes in for it: the head, the foot above it */ yield tween(NK.p,{zoom:2.5,zx:232,zy:156},1.2,t=>t*t*(3-2*t)); yield tween(NK.p,{foot:1},2.2,t=>{ t=Math.min(1,t); return t*(2-t); }); Sound.sfx('heartbeat'); yield wait(1.3);
  /* the stomp, shown (v1.87: it used to cut to black on the frame it landed): the foot comes down in three frames, the head breaks apart in silhouette, the pieces come to rest, and only then does the room go dark */
  yield tween(NK.p,{foot:-.04},.06,t=>t*t); NK.p.gone=1; NK.p.crT=NK.t; Sound.sfx('slam'); Sound.sfx('gore'); Sound.sfx('crash'); Sound.sfx('crossboom'); NK.shake=1; NK.p.pulse=1; NK.p.thud=1; for(let k=0;k<50;k++) NK.flk.push({x:223+rnd(-6,6),y:171,vx:rnd(-210,150),vy:rnd(-300,-40),r:1+Math.floor(Math.random()*2.4)}); yield tween(NK.p,{pulse:0,thud:0},.5); yield wait(.6); yield tween(NK.p,{foot:0},.5); yield tween(NK.p,{zoom:1.5,zx:214,zy:128},1.6,t=>t*t*(3-2*t)); yield wait(.5); yield tween(NK.p,{black:1},1.3); yield wait(.9);
  // the room afterwards: he stands over it; the glass is still running; then he looks at you
  NK.p.zoom=1.25; NK.p.zx=206; NK.p.zy=116; NK.p.pool=1; yield tween(NK.p,{black:0},2.2); yield wait(1.6); Sound.sfx('step'); yield tween(NK.p,{eyes:1},.5); yield wait(1.5); yield tween(NK.p,{black:1},1.6); yield wait(.8);
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
  Game.aliOld=0; Game.ending=7; Game.fade=1; Game.fadeTo=1; NK.on=0; NK.fade=0; Game.state='end'; Game.endT=0; Game.script=null; }
// the choice: after phase III on Ali's road, before the finale
(function(){ const nf=nbFinale; nbFinale=function*(){ let kill=false; try{ kill=ALI()&&typeof NP1!=='undefined'&&(NP1.ph||1)>=3; }catch(e){}
    if(kill){ Game.letterTo=1; try{ if(NB) cineSet(NB.x-2.5,NB.y+1.2,NB.z+7,NB.x,NB.y+1,NB.z); }catch(e){} yield wait(.6);
      yield say('nathanraw',"...It's over. The pig's gone. The arc's gone. I've got nothing left to burn.");
      yield say('ali',"Hm.");
      const c=yield choose([{t:"Sheathe the sword. Save him.",aff:0},{t:"He asked for an ending. Kill him.",aff:0}]); /* spoken aloud by the hero when picked: no stage directions in brackets */
      if(c===1){ yield* nkEnding(); return; } }
    yield* nf.apply(this,arguments); }; })();

// the Kill ending's own end screen (ending 7)
(function(){ const de=drawEnd; drawEnd=function(){ if(Game.ending!==7) return de();
  Game.endT+=1/60; const a=Math.min(1,Game.endT/2); D.fillStyle='#070102'; D.fillRect(0,0,UW,UH);
  for(const [x,y,b] of STARS2){ D.fillStyle=`rgba(255,120,110,${(.2+.4*b)*a})`; D.fillRect(x,y,2,2); } D.fillStyle=`rgba(210,40,30,${a})`; D.beginPath(); D.arc(UW/2,150,46,0,7); D.fill(); D.fillStyle=`rgba(120,0,0,${a*.6})`; D.beginPath(); D.arc(UW/2+10,160,12,0,7); D.fill(); D.beginPath(); D.arc(UW/2-14,138,8,0,7); D.fill();
  D.globalAlpha=a; const mins=Math.floor(Game.time/60), secs=Math.floor(Game.time%60);
  cText([['Secret Ending',`italic 500 22px ${FB}`,'#b89088',260],['The Replacement',`900 50px ${FD}`,'#ff8a7a',318],["Nathans at the start  2   ·   Nathans now  1   ·   Dailies done  yes",`700 21px ${FB}`,'#ff9a8a',380],
    [`Time  ${mins}:${String(secs).padStart(2,'0')}    ·    Falls  ${Game.deaths}`,`500 20px ${FB}`,'#cfc6b0',414],['Thank you for playing The Moonsinger\'s Bell.',`italic 500 22px ${FB}`,'#e9e2cf',480]]);
  if(Game.endT>3){ D.globalAlpha=.6+.4*Math.sin(performance.now()/300); cText([[IS_TOUCH()?'Tap to return to the title':'Click or press E to return to the title',`700 22px ${FB}`,'#fff4d6',560]]); } D.globalAlpha=1; }; })();
