// =====================================================================
// ALI'S SPRITE MODEL: the 8-direction pixel sheet img/ali/ali.png (96px cells; rows: 0 = idle facings,
// 1-8 = Front Flip, 9-16 = Crouched Walking, 17 = sword-drawn stance, 18 = the stance with the blade erased;
// facings S, SE, E, NE, N, NW, W, SW) plus the animations made from it here: in a fight he stands in the stance
// (a glint runs up the blade); his cuts swing a drawn katana from his real grip on the blade-less stance (wind-up,
// cut, settle back), likewise the Getsuga release, charge and spin; hurt and death tilt the frame, hit flash tints it.
// Every jump is the Front Flip.
// The hand-drawn Ali (03_cast) stays as the fallback until the image loads, and for old Ali (Game.aliOld).
// =====================================================================
const ALS={ok:false,img:null,off:null,
  feet:[[78,79,79,78,77,78,79,79],[80,75,93,72,77,78],[81,76,89,67,74,79],[79,75,87,65,69,76],[77,77,87,77,68,78],[76,75,89,77,68,78],[77,77,87,77,68,78],[79,75,87,65,69,76],[81,76,89,67,74,79],
    [80,82,80,78,81,79],[78,78,77,78,81,80],[79,78,77,78,77,79],[75,78,75,77,82,82],[77,80,77,75,77,77],[75,78,75,77,82,82],[79,78,77,78,77,79],[78,78,77,78,81,80],
    [78,79,79,78,77,78,79,79],[78,79,79,78,77,78,79,79]],
  /* the stance's grip (guard) and blade tip per facing, in 96px cell pixels */
  guard:[[49.5,45],[60.5,47],[63.5,42],[63.5,40],[46.5,40],[31.5,40],[31.5,42],[33,47]], tip:[[49.5,16],[72.5,20],[67.5,16],[67.5,16],[46.5,16],[27.5,16],[27.5,16],[22,20]]};
(function(){ try{ const im=new Image(); im.onload=()=>{ ALS.ok=im.width>0; }; im.onerror=()=>{ ALS.ok=false; }; im.src='img/ali/ali.png'; ALS.img=im; }catch(e){} })();
const AL_OLD_DRAW=drawAliHD;
const AL_FX=[0,1,1,1,0,-1,-1,-1], AL_VEC=[[0,1],[.7,.7],[1,0],[.7,-.7],[0,-1],[-.7,-.7],[-1,0],[-.7,.7]];
const alEase=u=>1-Math.pow(1-Math.max(0,Math.min(1,u)),3), AL_REST=-1.42; /* the stance blade's angle: up, a little forward */
// in a fight (or right after he swung) he stands with the katana drawn
function alFighting(isP){ return !!(TW&&TW.fight)||!!Game.boss||(typeof NB!=='undefined'&&!!NB&&!!NB.alive)||(isP&&Game.time-(Player.swingT||-9)<3); }
// the stance as drawn, with the tip finished to a point (the source frames cut it off) and a glint running up the blade now and then
function alStanceFX(o,d,t){ const g=ALS.guard[d], p=ALS.tip[d]; if(d===4) return; const L=Math.hypot(p[0]-g[0],p[1]-g[1])||1, ux=(p[0]-g[0])/L, uy=(p[1]-g[1])/L;
  o.fillStyle='#dfe6ee'; for(let i=1;i<=3;i++) o.fillRect(Math.round(p[0]+ux*i-.5),Math.round(p[1]+uy*i),i<3?2:1,1);
  const k=(t%2.4)/.35; if(k<1){ const x=Math.round(g[0]+ux*L*k), y=Math.round(g[1]+uy*L*k); o.fillStyle='#ffffff'; o.fillRect(x-1,y,3,1); o.fillRect(x,y-1,1,3); } }
// the katana in his hand: a = angle (0 = straight ahead, negative = up), fx = which side he faces, trail = smear of earlier angles
function alBlade(o,hx,hy,a,fx,L,col,trail,grip){ const draw=(a,al)=>{ o.globalAlpha=al; const ca=Math.cos(a)*fx, sa=Math.sin(a);
    if(!grip) for(let i=1;i<=6;i++){ o.fillStyle=i%2?'#2a1a1a':'#120c10'; o.fillRect(Math.round(hx-ca*i),Math.round(hy-sa*i),2,2); }
    for(let i=2;i<=L;i++){ const x=Math.round(hx+ca*i), y=Math.round(hy+sa*i); o.fillStyle=col||'#dfe6ee'; o.fillRect(x,y,2,2); o.fillStyle='#7d8796'; o.fillRect(x,y+1,1,1); }
    o.fillStyle='#c8a050'; o.fillRect(Math.round(hx)-1,Math.round(hy)-1,3,3); o.fillStyle='#ffffff'; o.fillRect(Math.round(hx+ca*L),Math.round(hy+sa*L),1,1); };
  if(trail) for(let k=3;k>=1;k--) draw(a-trail*k*.33,.16*(4-k)/3);
  draw(a,1); o.globalAlpha=1; }
// one frame of the sheet onto the sprite canvas, feet on (cx,by); o: dx, dy, rot (around the feet), blade(ctx,feet), flash colour
function alPaint(c,cx,by,row,col,o){ o=o||{}; if(!ALS.off) ALS.off=mkCanvas(96,96); const [ocv,oc]=ALS.off; oc.clearRect(0,0,96,96); oc.imageSmoothingEnabled=false;
  oc.drawImage(ALS.img,col*96,row*96,96,96,0,0,96,96); const feet=(ALS.feet[row]||[])[col]||79;
  if(o.blade) o.blade(oc,feet);
  if(o.flash){ oc.save(); oc.globalCompositeOperation='source-atop'; oc.fillStyle=o.flash; oc.fillRect(0,0,96,96); oc.restore(); }
  c.save(); c.imageSmoothingEnabled=false; c.translate(Math.round(cx+(o.dx||0)),Math.round(by-1+(o.dy||0))); if(o.rot) c.rotate(o.rot);
  c.drawImage(ocv,-48,-feet,96,96); c.restore(); SHA.drawn=true; } /* SHA.drawn: the world sprite is scaled like Shayan's (0.8) */
// how far through the Front Flip the player is (0..1), from the moment he leaves the ground or kicks up again
function alFlipK(){ const P=Player; return P.alFlipT!=null?(Game.time-P.alFlipT)/.55:1; }
drawAliHD=function(c,cx,by,f,s){ s=s||{}; if(!ALS.ok||!ALS.img||s.old) return AL_OLD_DRAW(c,cx,by,f,s);
  try{ const P=Player, isP=!!P&&ALI()&&s.t===P.t&&s.anim===P.anim, a=s.anim||'idle', t=s.t||0;
    let dir=f>0?2:6; if(isP&&Game.state==='play'&&!P.cineFly&&!P.scripted){ const ang=P.ang||0, cs=Math.cos(ang); if(!(Math.abs(cs)>.3&&Math.sign(cs)!==Math.sign(f||1))) dir=shDirIdx(ang); }
    const side=dir===0?(f>0?1:7):dir===4?(f>0?3:5):dir, fx=AL_FX[side], fl=s.flash>0?'rgba(255,255,255,.85)':null;
    const u=s.ap!=null?s.ap:(/^aliS/.test(a)&&isP&&P.aliAtk?P.aliAtk.u:(t*2.5)%1);
    const cut=(a0,a1,u0,u1,lean,from,back)=>{ const k=alEase((u-u0)/(u1-u0)), on=u>=u0&&u<=u1+.12; let ang=a0+(a1-a0)*k;
        if(u<u0&&from!=null) ang=from+(a0-from)*(u/u0); /* wind-up out of the stance */ if(back!=null&&u>u1+.2) ang=a1+(back-a1)*alEase((u-u1-.2)/(1-u1-.2)); /* settle back */
        return {ang,lean:lean*Math.sin(Math.PI*Math.min(1,Math.max(0,(u-u0+.1)/(u1-u0+.3)))),trail:on&&k>.05&&k<.98?(a1-a0)*.35:0}; };
    const grip=d=>{ const g=ALS.guard[d]; return [g[0],g[1]]; }, fight=alFighting(isP);
    const swing=(S)=>alPaint(c,cx,by,18,side,{flash:fl,rot:fx*S.lean,dx:fx*S.lean*14,blade:(o)=>{ const [hx,hy]=grip(side); alBlade(o,hx,hy,S.ang,fx,28,null,S.trail,true); }});
    if(a==='run'||a==='walk') alPaint(c,cx,by,9+dir,Math.floor(t*(a==='run'?11:7))%6,{flash:fl});
    else if(a==='jump'||a==='fall'){ const k=isP?alFlipK():(a==='jump'?(t*1.8)%1:1);
      if(k<1) alPaint(c,cx,by,1+dir,Math.min(5,Math.floor(k*6)),{flash:fl}); else alPaint(c,cx,by,0,dir,{flash:fl}); }
    else if(a==='glide'||a==='aliSurf') alPaint(c,cx,by,0,dir,{flash:fl,dy:Math.round(Math.sin(t*3))});
    else if(a==='dash') alPaint(c,cx,by,9+dir,2,{flash:fl,rot:(AL_FX[dir]||fx)*.12});
    else if(a==='hurt') alPaint(c,cx,by,fight?17:0,dir,{flash:fl||'rgba(255,60,70,.22)',rot:-fx*.22,dx:-fx*2});
    else if(a==='dead'||a==='down') alPaint(c,cx,by,0,side,{flash:fl,rot:-fx*Math.PI/2,dx:fx*33,dy:-19});
    else if(a==='aliS1'||a==='attack') swing(cut(-2.3,1.05,.12,.5,.2,AL_REST,AL_REST));
    else if(a==='aliS2'){ const S=u<.45?cut(AL_REST,.95,.05,.32,.15):cut(.95,-1.7,.48,.74,.1,null,AL_REST); swing(S); }
    else if(a==='aliSpin'){ const d=(side+Math.floor(u*16))%8, v=AL_VEC[d], q=AL_FX[d]||1;
      alPaint(c,cx,by,18,d,{flash:fl,blade:(o,ft)=>{ const g=d===0||d===4?[48,44]:grip(d), hx=g[0], hy=g[1]+3, L=28; for(let k=3;k>=0;k--){ o.globalAlpha=k?.12*(4-k):1; const w=Math.atan2(v[1]*.45,v[0])-k*.32*q;
        o.fillStyle=k?'#ffffff':'#dfe6ee'; for(let i=3;i<=L;i++) o.fillRect(Math.round(hx+Math.cos(w)*i),Math.round(hy+Math.sin(w)*i),2,2); } o.globalAlpha=1; o.fillStyle='#c8a050'; o.fillRect(Math.round(hx)-1,hy-1,3,3); }}); }
    else if(a==='beam') alPaint(c,cx,by,18,side,{flash:fl,rot:fx*.12,dx:fx*2,blade:(o)=>{ const [hx,hy]=grip(side); alBlade(o,hx,hy,.45,fx,28,null,0,true); }});
    else if(a==='charge') alPaint(c,cx,by,18,side,{flash:fl,rot:-fx*.06,blade:(o)=>{ const [hx,hy]=grip(side); alBlade(o,hx,hy,2.6,fx,27,Math.floor(t*12)%2?'#ff5a6a':'#ffd0d4',0,true); }});
    else if(a==='block') alPaint(c,cx,by,17,side,{flash:fl,dx:fx,blade:(o)=>alStanceFX(o,side,t+1.2)});
    else if(fight&&(a==='idle'||a==='talk'||a==='cast')) alPaint(c,cx,by,17,dir,{flash:fl,dy:Math.sin(t*2.6)>.6?1:0,blade:(o)=>alStanceFX(o,dir,t)});
    else alPaint(c,cx,by,0,dir,{flash:fl,dy:a==='idle'&&Math.sin(t*2.6)>.6?1:0});
  }catch(e){ console.error('ali sprite',e); return AL_OLD_DRAW(c,cx,by,f,s); } };
// the Front Flip starts when he leaves the ground, or kicks upward again in the air
(function(){ const up=updatePlayer; updatePlayer=function(dt){ const P=Player, vy0=P.vy, g0=P.onGround; const r=up.apply(this,arguments);
    try{ if(ALI()){ if(P.onGround) P.alFlipT=null; else if(P.vy>0&&(g0||P.vy>vy0+4)) P.alFlipT=Game.time; } }catch(e){ console.error('ali flip',e); } return r; }; })();
