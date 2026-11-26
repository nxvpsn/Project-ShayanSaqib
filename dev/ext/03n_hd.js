// =====================================================================
// HD SPRITES (v1.82). The small cast (Mira, the villagers) was painted at 32 px per world unit on 64x64 canvases: a figure
// 37 px tall, which is where their detail stopped (Shayan's atlas is 40 px per unit, the twins are big enough at 32).
// An HD painter draws at K times the density (1.5 = 48 px per unit) and asks its sprite for the room:
//   const o=hdBegin(c,cx,by,K); if(!o) return oldPainter(...);   ...paint in HD pixels around o[0],o[1]...   hdEnd(c);
// The first time an HD painter runs on a plain Sprite3D it paints the old way and flags the sprite; Sprite3D.draw then
// regrows that sprite's canvas (same size in the world, K times the pixels) and repaints. Everything else that calls a
// painter (portraits, timeline art, the 2D cutscene canvases) has no HD canvas and keeps getting the old painter, so
// nothing outside the 3D world changes size. Old painters drawn on an HD sprite are scaled up by K.
// =====================================================================
const HDQ={req:0};
function hdUpgrade(S,k){ S.w0=S.w; S.h0=S.h; S.w=Math.round(S.w*k); S.h=Math.round(S.h*k); S.cv.width=S.w; S.cv.height=S.h; S.c.imageSmoothingEnabled=false; S.hd=k; try{ S.t.dispose(); }catch(e){} /* the GL texture is re-made at the new size on the next upload */ }
(function(){ const d=Sprite3D.prototype.draw;
  Sprite3D.prototype.draw=function(fn,outline){
    if(!this.hd){ HDQ.req=0; d.call(this,fn,outline); const k=HDQ.req; HDQ.req=0; if(!k) return; try{ hdUpgrade(this,k); }catch(e){ console.error('hd',e); return; } }
    const k=this.hd, c=this.c; c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,this.w,this.h); c.save(); c.scale(k,k); c.__hd=k;
    try{ fn(c,this.w0/2,this.h0-2); }finally{ c.restore(); c.__hd=0; }
    if(outline!==false) outlinePass(c,this.w,this.h,OUT); this.t.needsUpdate=true; }; })();
// returns the painter's origin in HD pixels (the context is left at identity + nothing else), or null if this canvas is not HD
function hdBegin(c,cx,by,k){ if(c.__hd!==k){ HDQ.req=k; return null; } c.save();
  if(c.getTransform){ const m=c.getTransform(); if(!m.b&&!m.c&&m.a>0&&m.d>0){ c.setTransform(1,0,0,1,0,0); return [Math.round(m.e+cx*m.a),Math.round(m.f+by*m.d)]; } /* rotated or mirrored by the caller: keep it */ c.translate(cx,by); c.scale(1/k,1/k); return [0,0]; }
  return [Math.round(cx*k),Math.round(by*k)]; }
function hdEnd(c){ c.restore(); }
// a 1x pose (cPose) for a rig K times the size
function hdPose(P,k){ P.b=Math.round(P.b*k); P.lean=Math.round(P.lean*k); P.F=P.F.map(q=>[q[0]*k,q[1]*k]); P.hd=Math.round((P.hd||0)*k); P.hx=Math.round((P.hx||0)*k); return P; }

// ================= MIRA (48 px per unit, 55 px tall) =================
// The same girl: cream hair down her back, one blonde ear and one cream, a teal dress with an apron, a choker with a bell,
// dark stockings, a long tail. Now with a face (two eyes in three-quarter view, lashes, a cat's mouth), a fringe with a
// lock down each cheek, pleats and a trimmed hem, a bow at the back of the waist, strapped shoes.
const MC3=Object.assign({},MC2,{hairD:'#b3945a',hairL:'#fffbea',skinD:'#c99078',skinL:'#fff0e2',dressL:'#72d2c0',aprD:'#b9af9c',stockD:'#261e2c',shoeH:'#8a5442',shoeD:'#3e2018',bellH:'#fff3b8',bellS:'#b98a26',rib:'#7a4a2e',ribH:'#a86a44',lash:'#4a2c22',pinkS:'#c9707f',lip:'#c2706a'});
function drawMiraV2(c,cx,by,f,s){ const K=1.5, o=hdBegin(c,cx,by,K); if(!o) return drawMiraCast(c,cx,by,f,s);
  try{ const p=SH(c,o[0],o[1],f), t=s.t||0, a=s.anim||'idle', C=MC3, tk=cTalk('mira'), R=Math.round, lp=(u,v,q)=>u+(v-u)*q;
    const k=tk&&a==='idle'?'talk':a, P=hdPose(cPose(k,t,0),K); if(a==='run'){ P.ua=P.ua.map(x=>x*.7); P.el=[.9,.9]; }
    const D={hip:15,torso:19,thigh:8,shin:8,uarm:8,farm:7,sep:3,ssep:6,neck:1}, J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy, mv=a==='run'?Math.sin(t*12):0;
    const hx=R(J.headX), h0=R(J.headY), bl=cBlink(t,1.9), sw=R(mv*2), sb=hy+7, wy=hy-9;
    // tail: a long S-curve, banded, a pale tip, a shadow along the underside
    for(let i=0;i<20;i++){ const x=J.hx-7-R(i*.85), y=hy-3-R(Math.sin(t*2.6+i*.32)*3)-R(i*i*.06), w=i>16?3:4; p(x,y,w,w,i>16?C.hairH:i%4===3?C.hairS:C.ear); p(x,y+w-1,w,1,i>16?C.hair:C.hairD); if(i%4===1) p(x+1,y,2,1,C.hairH); }
    // hair down the back, in three tones with loose strands
    { const e=R(mv*1.5); cPoly(p,[[hx-9,h0-13],[hx-1,h0-13],[sx-1,sy+13],[sx-9,sy+17+e]],C.hairS); cPoly(p,[[hx-9,h0-13],[hx-6,h0-13],[sx-7,sy+16+e],[sx-9,sy+17+e]],C.hairD); p(sx-5,sy+1,1,11,C.hair); p(sx-3,sy+3,1,8,C.hair); p(sx-7,sy+13+e,2,3,C.hairS); p(sx-4,sy+12,2,2,C.hairS); }
    // far arm
    { const A=J.A[0]; cArm(p,A,4,C.dressD,C.dressS,C.skinS,C.skinD); p(R(A.x)-3,R(A.y)-2,6,4,C.dressS); }
    // legs: stockings with a lit shin, strapped shoes
    const leg=(L,near)=>{ const u=near?C.stock:C.stockD, v=near?C.stockH:C.stock; cSeg(p,L.x,L.y,L.kx,L.ky,4,u,v); cSeg(p,L.kx,L.ky,L.ex,L.ey-2,4,u,v); if(near) p(R(L.kx),R(L.ky)-1,2,2,'#6a5e74');
      const x=R(L.ex), y=R(L.ey); p(x-3,y-3,7,3,near?C.shoe:C.shoeD); p(x+2,y-3,3,2,near?C.shoeH:C.shoe); p(x-3,y,8,1,C.shoeD); p(x-1,y-5,3,2,near?C.shoe:C.shoeD); if(near){ p(x-2,y-4,4,1,C.shoeH); p(x+1,y-3,1,1,C.bell); } };
    leg(J.L[0],0); leg(J.L[1],1);
    // skirt: flared, pleated, a pale trim above a dark hem with lace
    cPoly(p,[[J.hx-7,wy],[J.hx+7,wy],[J.hx+12+sw,sb],[J.hx-12+sw,sb+1]],C.dress);
    cPoly(p,[[J.hx+3,wy],[J.hx+7,wy],[J.hx+12+sw,sb],[J.hx+6+sw,sb]],C.dressS); cPoly(p,[[J.hx-7,wy],[J.hx-4,wy],[J.hx-9+sw,sb+1],[J.hx-12+sw,sb+1]],C.dressH);
    for(const q of [-9,-5,9]) cSeg(p,J.hx+q*.55,wy+3,J.hx+q+sw,sb-2,1,q>0?C.dressD:C.dressS); cSeg(p,J.hx-4,wy+3,J.hx-7+sw,sb-2,1,C.dressL);
    p(J.hx-12+sw,sb-1,24,1,C.dressL); p(J.hx-12+sw,sb,25,2,C.dressD); for(let i=-11;i<=11;i+=2) p(J.hx+i+sw,sb+2,1,1,C.apr);
    // apron: a panel down the front with a pocket and a scalloped edge
    cPoly(p,[[J.hx-2,wy],[J.hx+6,wy],[J.hx+8+sw,sb-3],[J.hx-3+sw,sb-3]],C.apr); cPoly(p,[[J.hx+4,wy],[J.hx+6,wy],[J.hx+8+sw,sb-3],[J.hx+6+sw,sb-3]],C.aprS);
    for(let i=-3;i<=8;i+=2) p(J.hx+i+sw,sb-3,1,1,C.aprD); p(J.hx-1+R(sw*.6),hy-3,5,4,C.aprS); p(J.hx-1+R(sw*.6),hy-3,5,1,C.aprD);
    // bodice, the apron's bib and straps
    cPoly(p,[[sx-7,sy],[sx+7,sy],[J.hx+7,wy],[J.hx-7,wy]],C.dress); cPoly(p,[[sx+3,sy],[sx+7,sy],[J.hx+7,wy],[J.hx+4,wy]],C.dressS); cPoly(p,[[sx-7,sy],[sx-5,sy],[J.hx-5,wy],[J.hx-7,wy]],C.dressH);
    cPoly(p,[[sx-2,sy+4],[sx+4,sy+4],[J.hx+5,wy],[J.hx-2,wy]],C.apr); p(R(lp(sx,J.hx,.5))+3,sy+5,1,Math.max(0,wy-sy-5),C.aprS); p(sx-2,sy+4,6,1,C.aprD); p(sx-2,sy,1,4,C.apr); p(sx+4,sy,1,4,C.aprS); p(sx-5,sy+7,2,1,C.dressD); p(sx-6,sy+8,2,1,C.dressD);
    // waist ribbon with a bow at the back
    p(J.hx-7,wy-1,15,2,C.rib); p(J.hx-7,wy-1,15,1,C.ribH); p(J.hx-10,wy-3,3,2,C.rib); p(J.hx-10,wy-3,2,1,C.ribH); p(J.hx-10,wy+1,2,4,C.rib); p(J.hx-8,wy+1,1,3,C.ribH); p(J.hx-8,wy-1,1,2,'#5a321e');
    // neck, choker and bell
    p(sx-2,sy-3,5,3,C.skinS); p(sx-4,sy-2,8,2,'#3a2238'); p(sx-4,sy-2,8,1,'#5a3a58'); p(sx,sy,4,4,C.bell); p(sx+1,sy,2,1,C.bellH); p(sx,sy+3,4,1,C.bellS); p(sx+1,sy+2,2,1,'#5a3a10');
    // head: a lit cheek, a shadowed jaw
    p(hx-7,h0-15,15,13,C.skin); p(hx-5,h0-2,12,1,C.skin); p(hx-3,h0-1,9,1,C.skinS); p(hx+4,h0-12,4,8,C.skinH); p(hx+6,h0-10,2,4,C.skinL); p(hx-7,h0-5,5,3,C.skinS); p(hx-5,h0-2,4,1,C.skinS); p(hx+8,h0-7,1,3,C.skin); p(hx+8,h0-5,1,1,C.skinS);
    // eyes (three-quarter view: the near one wide, the far one narrow at the edge of the face)
    if(bl){ p(hx-2,h0-8,5,1,C.lash); p(hx+5,h0-8,3,1,C.lash); }
    else { p(hx-1,h0-10,4,5,'#ffffff'); p(hx,h0-10,3,5,C.eye); p(hx+1,h0-9,2,3,C.eyeD); p(hx,h0-10,1,2,'#d6fff0'); p(hx+2,h0-6,1,1,'#7ff0c0'); p(hx-2,h0-11,6,1,C.lash); p(hx-2,h0-10,1,2,C.lash); p(hx-1,h0-5,4,1,C.skinS);
      p(hx+5,h0-10,2,5,C.eye); p(hx+6,h0-9,1,3,C.eyeD); p(hx+5,h0-10,1,1,'#d6fff0'); p(hx+5,h0-11,3,1,C.lash); }
    p(hx-1,h0-13,4,1,C.hairD); p(hx+5,h0-13,2,1,C.hairD);
    // nose, mouth, blush
    if(tk===2){ p(hx+3,h0-4,3,3,'#5a1a24'); p(hx+3,h0-4,3,1,'#ffffff'); p(hx+4,h0-2,1,1,'#e88a90'); } else { p(hx+3,h0-3,3,1,C.lip); p(hx+6,h0-4,1,1,C.lip); p(hx+2,h0-4,1,1,C.lip); }
    if(s.blush){ p(hx-1,h0-4,3,1,'#f6909c'); p(hx+6,h0-5,2,1,'#f6909c'); p(hx,h0-3,1,1,'#f6909c'); }
    // hair: the cap, a fringe in points, a lock down the cheek, highlights
    p(hx-8,h0-19,16,6,C.hair); p(hx-9,h0-17,3,15,C.hair); p(hx-9,h0-9,1,8,C.hairD); p(hx-8,h0-2,2,3,C.hairS);
    p(hx-6,h0-13,14,1,C.hair); p(hx-6,h0-12,4,2,C.hair); p(hx-5,h0-10,2,1,C.hair); p(hx+3,h0-12,2,1,C.hair); p(hx+7,h0-13,2,4,C.hair); p(hx+8,h0-9,1,2,C.hairS);
    p(hx-6,h0-11,3,9,C.hair); p(hx-6,h0-3,3,2,C.hairS); p(hx-4,h0-10,1,8,C.hairS);
    p(hx-5,h0-18,9,1,C.hairH); p(hx-2,h0-17,6,1,C.hairL); p(hx+5,h0-16,2,1,C.hairH); p(hx-7,h0-15,2,1,C.hairH); p(hx-8,h0-14,15,1,C.hairS);
    // ears: one blonde, one cream, pink inside; the far one twitches, both fold back on the run
    const tw=Math.sin(t*1.7)>.96?1:0, er=a==='run'?1:0;
    const ear=(x,y,col,sh)=>{ p(x,y+4,6,3,col); p(x,y+2,5,2,col); p(x+1,y,3,2,col); p(x+1,y-1,2,1,col); p(x+1,y+3,3,3,C.pink); p(x+2,y+1,2,2,C.pink); p(x+1,y+5,1,1,C.pinkS); p(x,y+3,1,4,sh); };
    ear(hx-8-er,h0-25+tw,C.ear,C.hairD); ear(hx+1-er,h0-25,C.hair,C.hairS);
    // near arm: a puffed sleeve, a white cuff, a small hand
    { const A=J.A[1]; cArm(p,A,4,C.dressS,C.dressH,C.skin,C.skinS); p(R(A.x)-3,R(A.y)-2,6,5,C.dressH); p(R(A.x)-3,R(A.y)+2,6,1,C.dress); p(R(A.x)-2,R(A.y)-2,3,1,C.dressL); p(R(lp(A.kx,A.ex,.7))-2,R(lp(A.ky,A.ey,.7))-1,4,2,C.apr); }
  }catch(e){ console.error('mira v2',e); } finally{ hdEnd(c); } }
drawMiraHD=drawMiraV2;

// ================= VILLAGERS, PAUL, KENJI, THE ELDER (48 px per unit) =================
// Same looks table as before (cloth, skin, pants, hair, hood, robe, apron, belt, hat, beard, staff, kid). New: a face
// in three-quarter view, three-tone tunics with folds, a V collar, a trimmed hem, a belt with a buckle and a pouch,
// trousers and cuffed boots, layered hair, a proper chef's hat, brimmed hats with a band, a fuller beard, a taller staff.
function drawVillagerV2(c,cx,by,f,s,v){ v=v||{}; const K=1.5, o=hdBegin(c,cx,by,K); if(!o) return drawVillagerCast(c,cx,by,f,s,v);
  try{ const p=SH(c,o[0],o[1],f), t=s.t||0, kid=!!v.kid, paul=v===PAUL_LOOK, who=paul?'paul':s.who||'', R=Math.round;
    const tk=who?cTalk(who):0, mv=!!s.moving, k=s.flee>0?'run':mv?'walk':tk?'talk':'idle', P=hdPose(cPose(k,t+(cx%7)*.3,0),K);
    if(v.staff&&!mv){ P.ua[1]=.35; P.el[1]=.9; }
    const D=kid?{hip:11,torso:15,thigh:6,shin:6,uarm:6,farm:6,sep:3,ssep:6,neck:1}:{hip:15,torso:21,thigh:8,shin:8,uarm:9,farm:8,sep:3,ssep:7,neck:1};
    const J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy, W=kid?8:9;
    const cl=v.cloth||'#7a6a5a', clS=v.clothS||cShade(cl,-.25), clH=cShade(cl,.18), clD=cShade(cl,-.42), sk=v.skin||'#d8a07a', skS=cShade(sk,-.18), skH=cShade(sk,.15), skD=cShade(sk,-.34);
    const pa=v.pants||'#4a3a2e', paS=v.pantsS||cShade(pa,-.25), paD=cShade(pa,-.42), hair=v.hair||'#3a2a1a', hairH=cShade(hair,.22), hairS=cShade(hair,-.3), belt=v.belt||'#5a3a22';
    // far arm
    { const A=J.A[0]; cArm(p,A,4,clD,clS,skS,skD); }
    // legs: trousers, cuffed boots
    const leg=(L,near)=>{ const u=near?paS:paD, w=near?pa:paS; cSeg(p,L.x,L.y,L.kx,L.ky,5,u,w); cSeg(p,L.kx,L.ky,L.ex,L.ey-3,4,u,w); const x=R(L.ex), y=R(L.ey);
      p(x-3,y-4,7,4,near?'#3a2618':'#22160c'); p(x+2,y-3,3,3,near?'#5a3e28':'#3a2618'); p(x-3,y,8,1,'#140c06'); p(x-3,y-5,6,1,near?'#6a4a30':'#3a2618'); };
    leg(J.L[0],0); leg(J.L[1],1);
    if(v.hood) cPoly(p,[[sx-10,sy-1],[sx+4,sy-1],[J.hx+3,hy+5],[J.hx-13,hy+8]],cShade(v.hood,-.2));
    // body: a tunic to the thigh or a long robe, three tones, two folds, a trimmed hem
    const hem=v.robe?-2:hy+6, hw=v.robe?12:10;
    cPoly(p,[[sx-W,sy],[sx+W,sy],[J.hx+hw,hem],[J.hx-hw,hem]],cl);
    cPoly(p,[[sx+3,sy],[sx+W,sy],[J.hx+hw,hem],[J.hx+4,hem]],clS); cPoly(p,[[sx-W,sy],[sx-W+3,sy],[J.hx-hw+3,hem],[J.hx-hw,hem]],clH);
    cSeg(p,sx-2,sy+7,J.hx-3,hem-3,1,clS); cSeg(p,sx+6,sy+6,J.hx+8,hem-3,1,clD); p(J.hx-hw,hem-2,hw*2,1,clH); p(J.hx-hw,hem-1,hw*2,2,clD);
    cPoly(p,[[sx-3,sy],[sx+4,sy],[sx+1,sy+5]],skS); p(sx-4,sy,1,4,clH); p(sx+4,sy,1,4,clD); p(sx,sy+5,1,3,clD);
    if(v.apron){ cPoly(p,[[J.hx-3,sy+6],[J.hx+6,sy+6],[J.hx+8,hem-2],[J.hx-3,hem-2]],'#ede5d4'); p(J.hx+5,sy+7,1,Math.max(0,hem-sy-10),'#c8bfae'); p(J.hx-3,sy+6,9,1,'#c8bfae'); p(J.hx,hy-1,4,3,'#d8cfbe'); p(J.hx-3,sy+1,1,5,'#ede5d4'); p(J.hx+5,sy+1,1,5,'#d8cfbe'); }
    p(J.hx-9,hy-6,19,3,belt); p(J.hx-9,hy-6,19,1,cShade(belt,.25)); p(J.hx+1,hy-7,4,5,'#c8a050'); p(J.hx+2,hy-6,2,3,'#7a5a20'); if(!v.robe&&!v.apron){ p(J.hx-8,hy-4,4,5,cShade(belt,-.15)); p(J.hx-8,hy-4,4,1,cShade(belt,.2)); }
    if(v.hood){ cPoly(p,[[sx-9,sy-2],[sx+9,sy-2],[sx+8,sy+7],[sx-10,sy+9]],v.hood); p(sx-9,sy-2,18,1,cShade(v.hood,.2)); p(sx-9,sy+7,17,1,cShade(v.hood,-.25)); }
    // head
    const hx=R(J.headX), h0=R(J.headY), bl=cBlink(t,cx*.13);
    p(hx-7,h0-16,16,14,sk); p(hx-5,h0-2,13,1,sk); p(hx-3,h0-1,10,1,skS); p(hx+5,h0-14,4,10,skH); p(hx-7,h0-6,5,4,skS); p(hx-5,h0-2,4,1,skS); p(hx+9,h0-8,1,3,sk); p(hx+9,h0-6,1,1,skS); p(hx-6,h0-10,2,4,skS); p(hx-6,h0-9,1,2,skD);
    if(v.hat==='#3ff4ff'){ p(hx-3,h0-13,13,6,'#1a1e2e'); p(hx-2,h0-12,11,3,'#3ff4ff'); p(hx-2,h0-12,11,1,'#b8fbff'); p(hx+7,h0-11,2,1,'#ffffff'); p(hx-8,h0-11,5,2,'#1a1e2e'); p(hx-3,h0-8,13,1,'#0c0e18'); } // Kenji's VR visor
    else if(bl){ p(hx,h0-10,4,1,skD); p(hx+6,h0-10,2,1,skD); p(hx,h0-13,4,1,hairS); p(hx+6,h0-13,2,1,hairS); }
    else { p(hx,h0-11,4,3,'#f4efe6'); p(hx+1,h0-11,2,3,'#20140c'); p(hx+1,h0-11,1,1,'#ffffff'); p(hx+6,h0-11,2,3,'#f4efe6'); p(hx+7,h0-11,1,3,'#20140c'); p(hx,h0-12,4,1,skD); p(hx,h0-13,4,1,hairS); p(hx+6,h0-13,2,1,hairS); }
    if(tk===2){ p(hx+3,h0-5,4,3,'#4a1a14'); p(hx+3,h0-5,4,1,'#f2ece8'); p(hx+4,h0-3,2,1,'#b85a5a'); } else { p(hx+3,h0-4,4,1,'#7a3a2a'); p(hx+7,h0-5,1,1,'#7a3a2a'); }
    // hair
    if(!v.hood){ p(hx-8,h0-20,17,6,hair); p(hx-9,h0-18,4,13,hair); p(hx-5,h0-14,3,2,hair); p(hx+1,h0-14,7,1,hair); p(hx+7,h0-15,2,3,hair); p(hx-5,h0-19,8,1,hairH); p(hx-2,h0-18,6,1,hairH); p(hx-9,h0-8,3,3,hairS); p(hx-9,h0-13,1,6,hairS); p(hx-6,h0-16,1,3,hairS); }
    if(v.beard){ const bw=tk===2?1:0; cPoly(p,[[hx-2,h0-7],[hx+10,h0-7],[hx+9,h0+5+bw],[hx+5,h0+10+bw],[hx,h0+3]],'#ecebe6'); p(hx+1,h0-7,8,1,'#d8d4cc'); p(hx+3,h0-1,4,1,'#b8b0a4'); p(hx+2,h0+3,4,1,'#b8b0a4'); p(hx+4,h0+6+bw,2,1,'#b8b0a4'); p(hx+2,h0-6,7,2,'#f8f7f2'); if(tk===2) p(hx+4,h0-3,3,2,'#5a3a30'); }
    if(v.hat==='chef'){ p(hx-8,h0-21,17,4,'#ffffff'); p(hx-9,h0-29,19,9,'#ffffff'); p(hx-7,h0-31,15,2,'#ffffff'); p(hx-8,h0-18,17,1,'#d8d8d8'); p(hx-4,h0-28,1,6,'#e2e2e2'); p(hx+2,h0-28,1,6,'#e2e2e2'); p(hx+7,h0-28,2,7,'#e8e8e8'); p(hx-9,h0-22,19,1,'#e2e2e2'); }
    else if(v.hood){ const H=v.hood; cPoly(p,[[hx-11,h0-1],[hx-10,h0-19],[hx-3,h0-23],[hx+7,h0-22],[hx+11,h0-13],[hx+10,h0-8],[hx+6,h0-16],[hx-4,h0-16],[hx-7,h0-1]],H); p(hx-4,h0-21,10,1,cShade(H,.2)); p(hx-5,h0-16,12,4,'rgba(0,0,0,.4)'); p(hx-10,h0-12,1,10,cShade(H,-.25)); }
    else if(v.hat&&v.hat!=='#3ff4ff'){ p(hx-11,h0-19,23,3,v.hat); cPoly(p,[[hx-7,h0-19],[hx+7,h0-19],[hx+6,h0-27],[hx-6,h0-27]],v.hat); p(hx-7,h0-21,14,2,cShade(v.hat,-.3)); p(hx-4,h0-26,7,1,cShade(v.hat,.25)); p(hx-11,h0-17,23,1,cShade(v.hat,-.25)); p(hx+4,h0-26,2,5,cShade(v.hat,-.15)); }
    // near arm (holding the staff if there is one)
    const A=J.A[1];
    if(v.staff){ const x=R(A.ex)+1, bob=R(Math.sin(t*2.3)); p(x,-69+bob,3,69-bob,'#6b4a2b'); p(x,-69+bob,1,69-bob,'#8a6238'); p(x-2,-75+bob,7,6,'#8fd3ff'); p(x-1,-74+bob,3,3,'#e8f8ff'); p(x-3,-70+bob,9,2,'#4a3018'); if(Math.sin(t*3)>.7) p(x+5,-78+bob,2,2,'#ffffff'); }
    cArm(p,A,4,clS,cl,sk,skS); p(R(A.x)-3,R(A.y)-2,6,4,cl); p(R(A.x)-2,R(A.y)-2,3,1,clH);
  }catch(e){ console.error('villager v2',e); } finally{ hdEnd(c); } }
drawVillagerHD=drawVillagerV2;

// ================= HAMZA: the fairy pig (64 px per unit) and the giant pig (32 px per unit, was 16) =================
// Same pigs, same poses and flags, twice the pixels: round bodies instead of stepped ones, feathered wings, trotters,
// an eye with a pupil and a glint, nostrils, an ear with an inside. The giant's layout is the old one exactly doubled
// (the fight reads his mouth and feet off it), with the detail painted on top.
function drawFairyV2(c,cx,by,f,t,fl){ const K=2, o=hdBegin(c,cx,by,K); if(!o) return drawFairyCast(c,cx,by,f,t,fl);
  try{ const X=o[0], Y=o[1], p=SH(c,X,Y,f), tk=cTalk('hamza'), R=Math.round, E=(x,y,rx,ry,col)=>ell(c,X+x*f,Y+y,rx,ry,col);
    const PK=fl?'#fff':'#f4a6c0', PD=fl?'#fff':'#d8809e', PH=fl?'#fff':'#ffd0e0', PL=fl?'#fff':'#ffe6ee', PS=fl?'#fff':'#b8607e', PX=fl?'#fff':'#8e4460', bob=R(Math.sin(t*5)*3), w=Math.sin(t*28);
    // wings: three layers, flapping
    const wy=-34+bob, wl=R(w*6);
    cPoly(p,[[-4,wy],[-18,wy-12-wl],[-27,wy-7-wl],[-21,wy+2],[-6,wy+4]],'rgba(220,240,255,.9)'); cPoly(p,[[-3,wy+2],[-13,wy-6+wl],[-19,wy+3+wl],[-6,wy+6]],'rgba(170,210,255,.8)');
    cPoly(p,[[-5,wy+1],[-16,wy-8-wl],[-18,wy-5-wl],[-7,wy+3]],'#ffffff'); p(-21,wy-8-wl,3,2,'#ffffff'); p(-24,wy-4-wl,2,2,'rgba(190,220,255,.9)');
    // curly tail
    const tw=R(Math.sin(t*8)*1.5); p(-17,-25+bob+tw,3,2,PD); p(-19,-28+bob+tw,2,4,PD); p(-18,-30+bob+tw,4,2,PD); p(-15,-29+bob+tw,2,2,PS); p(-18,-29+bob+tw,1,1,PH);
    // far legs, body, near legs with trotters
    const kk=R(Math.sin(t*9)*1.5); p(-9,-11+bob,4,6-kk,PS); p(7,-11+bob,4,6+kk,PS); p(-9,-6+bob-kk,4,2,PX); p(7,-6+bob+kk,4,2,PX);
    E(0,-20+bob,16,12,PS); E(0,-21+bob,16,11,PD); E(0,-22+bob,14,10,PK); E(-3,-26+bob,8,4,PH); E(-5,-27+bob,4,2,PL); E(2,-13+bob,9,2,PD);
    p(-13,-12+bob,4,7+kk,PD); p(3,-12+bob,4,7-kk,PD); p(-13,-12+bob,1,6+kk,PK); p(3,-12+bob,1,6-kk,PK); p(-13,-6+bob+kk,4,2,PX); p(3,-6+bob-kk,4,2,PX);
    // head, ears, snout
    E(12,-28+bob,10,10,PD); E(12,-29+bob,10,9,PK); E(10,-33+bob,5,3,PH);
    const ew=Math.sin(t*2.3)>.8?2:0; cPoly(p,[[5,-36+bob],[6,-44+bob+ew],[11,-37+bob]],PD); p(7,-41+bob+ew,2,3,PS); cPoly(p,[[12,-37+bob],[16,-45+bob],[19,-36+bob]],PK); cPoly(p,[[14,-38+bob],[16,-43+bob],[18,-37+bob]],fl?'#fff':'#e07a98');
    E(20,-26+bob,6,5,PD); E(20,-27+bob,5,4,fl?'#fff':'#f8b8cc'); p(18,-28+bob,2,3,'#7a3a4a'); p(22,-28+bob,2,3,'#7a3a4a'); p(17,-31+bob,5,1,PH);
    // eye, cheek, mouth
    if(cBlink(t,.8)) p(9,-30+bob,4,1,'#1a1018'); else { p(9,-32+bob,4,4,'#1a1018'); p(9,-32+bob,2,2,'#fff'); p(12,-29+bob,1,1,'#6a4a8a'); } p(8,-34+bob,5,1,PS);
    E(9,-25+bob,2,1,fl?'#fff':'#ff8aa8');
    if(tk===2){ p(15,-22+bob,5,4,'#7a2a3a'); p(16,-20+bob,3,2,'#e86a80'); } else { p(15,-21+bob,5,1,PS); p(14,-22+bob,1,1,PS); }
    // halo, a beat behind, lit at the front
    const hb=R(Math.sin(t*5-.6)*3); for(let i=0;i<28;i++){ const a=i/28*6.283; c.fillStyle=Math.sin(a)>.2?'#fff6c0':'#ffe680'; c.fillRect(R(X+10*f+Math.cos(a)*8)-1,R(Y-46+hb+Math.sin(a)*2.6),2,2); }
    if(Math.sin(t*3)>.85){ const q=R(Math.sin(t*7)*18); p(q,-53+bob,1,5,'#ffffff'); p(q-2,-51+bob,5,1,'#ffffff'); }
  }catch(e){ console.error('fairy v2',e); } finally{ hdEnd(c); } }
function drawGiantPigV2(c,cx,by,f,s){ if(s.front) return CST.pig0(c,cx,by,f,s); const K=2, o=hdBegin(c,cx,by,K); if(!o) return drawGiantPigCast(c,cx,by,f,s);
  try{ const X=o[0], Y=o[1], p=SH(c,X,Y,f), E=(x,y,rx,ry,col)=>ell(c,X+x*f,Y+y,rx,ry,col), R=Math.round, t=s.t||0, fl=!!s.flash, tk=cTalk('hamza');
    const PK=fl?'#fff':'#f09ab6', PD=fl?'#fff':'#c87090', PH=fl?'#fff':'#ffc8da', PL=fl?'#fff':'#ffe0ea', PS=fl?'#fff':'#a85878', PX=fl?'#fff':'#86405c', DK='#5a2032', HO='#3a1a24';
    const bb=R(Math.sin(t*2)*2), sh=R(Math.sin(t*1.3)*3);
    // legs: far pair darker, weight shifting, a crease at the knee, split hooves
    [[-68,0],[32,0],[-36,1],[60,1]].forEach(([lx,n],i)=>{ const lift=Math.max(0,R(Math.sin(t*1.3+i*1.6)*4)), x=lx+sh*(n?1:-1);
      p(x,-48-lift,20,44,n?PD:PS); p(x,-48-lift,6,40,n?PK:PD); p(x+16,-46-lift,4,38,n?PS:PX); p(x+3,-28-lift,12,2,n?PS:PX); p(x-1,-10-lift,22,10,HO); p(x-1,-10-lift,22,2,'#5e3040'); p(x+9,-9-lift,2,9,DK); p(x+1,-3-lift,6,2,'#22080e'); });
    // body: a round barrel, lit along the back, a shadowed belly, bristles down the spine
    E(-8,-84+bb,96,60,PD); E(-8,-90+bb,92,54,PK); E(-28,-120+bb,40,14,PH); E(-36,-126+bb,20,5,PL); E(-12,-52+bb,72,12,PS);
    for(let i=0;i<12;i++) p(-62+i*9,-143+bb+R(Math.abs(i-5.5)*1.3),1,5,PS);
    cPoly(p,[[-96,-96+bb],[-90,-110+bb],[-88,-70+bb],[-94,-64+bb]],PD);
    // tail: a wagging curl
    const tw=R(Math.sin(t*6)*4); p(-108,-104+bb+tw,8,6,PD); p(-116,-112+bb+tw,8,8,PD); p(-108,-120+bb+tw,8,6,PD); p(-104,-116+bb+tw,4,4,PS); p(-114,-110+bb+tw,3,2,PK); p(-106,-119+bb+tw,4,1,PK);
    // head
    const m=Math.max(s.mouth||0,tk===2?.25:0), jaw=R(m*44), ef=R(Math.sin(t*3)*3);
    E(80,-112+bb,44,40,PK); E(68,-128+bb,16,10,PH); E(64,-132+bb,8,4,PL); E(80,-84+bb,36,10,PD); E(50,-104+bb,6,22,PD);
    // ears flopping, pink inside
    cPoly(p,[[60,-140+bb],[76,-172+bb-ef],[84,-140+bb]],PD); cPoly(p,[[64,-144+bb],[74,-164+bb-ef],[80,-144+bb]],fl?'#fff':'#e07a98'); p(60,-141+bb,24,2,PS);
    cPoly(p,[[88,-140+bb],[104,-168+bb+ef],[112,-136+bb]],PK); cPoly(p,[[92,-142+bb],[102,-160+bb+ef],[106,-140+bb]],fl?'#fff':'#e8a0b8'); p(100,-150+bb+ef,2,10,fl?'#fff':'#d07a98');
    // eye: a heavy lid, a pupil with a glint
    if(cBlink(t,1.1)){ p(92,-124+bb,12,3,DK); p(90,-128+bb,16,3,PD); } else { p(92,-128+bb,12,12,'#fff'); p(96,-126+bb,6,8,'#1a1018'); p(96,-126+bb,3,3,'#fff'); p(100,-120+bb,2,2,'#6a4a8a'); p(90,-133+bb,16,4,PD); p(92,-116+bb,12,1,PS); }
    if(m>.05){ p(96,-104+bb,56,12,PK); p(96,-104+bb,56,3,PH); p(146,-101+bb,4,5,DK); p(138,-101+bb,4,5,DK); p(100,-92+bb,48,jaw,'#3a0010'); p(104,-92+bb,40,Math.max(2,jaw-8),'#7a1020');
      for(let i=0;i<5;i++){ p(104+i*8,-92+bb,4,6,'#f2efe6'); p(104+i*8,-92+bb,1,6,'#ffffff'); p(104+i*8,-92+jaw+bb,4,6,'#f2efe6'); p(107+i*8,-92+jaw+bb,1,6,'#cfcabc'); }
      p(96,-92+jaw+bb,56,12,PD); p(96,-92+jaw+bb,56,2,PS); p(96,-82+jaw+bb,56,2,PX); p(124,-94+jaw+bb,12,4,'#ff6a8a'); p(126,-94+jaw+bb,6,1,'#ffa0b4'); }
    else { E(120,-100+bb,20,16,fl?'#fff':'#e07a98'); E(120,-102+bb,16,12,fl?'#fff':'#f0a0b8'); E(118,-109+bb,7,2,PH); E(128,-100+bb,4,6,DK); E(116,-100+bb,4,6,DK); p(127,-103+bb,2,2,'#8a3a52'); p(115,-103+bb,2,2,'#8a3a52'); p(92,-80+bb,36,3,DK); p(124,-80+bb,4,2,DK); p(90,-83+bb,3,3,DK); }
    if(s.drip){ for(let i=0;i<3;i++){ const L=8+2*Math.floor((t*20+i*7)%8); p(104+i*12,-80+bb+(i%2)*2,4,L,'#9a0010'); p(104+i*12,-80+bb+(i%2)*2,1,L,'#d0283a'); p(104+i*12,-80+bb+(i%2)*2+L,4,2,'#7a000c'); } }
    // the comically tiny wings and the halo
    const w=R(Math.sin(t*20)*8); cPoly(p,[[-8,-140+bb],[-40,-164+bb-w],[-48,-152+bb-w],[-16,-132+bb]],'rgba(220,240,255,.9)'); cPoly(p,[[-12,-136+bb],[-32,-148+bb+w],[-36,-140+bb+w]],'rgba(170,210,255,.8)'); cPoly(p,[[-10,-139+bb],[-36,-160+bb-w],[-39,-156+bb-w],[-13,-135+bb]],'#ffffff');
    for(let i=0;i<56;i++){ const a=i/56*6.283; c.fillStyle=Math.sin(a)>.2?'#fff6c0':'#ffe680'; c.fillRect(R(X+80*f+Math.cos(a)*28)-1,R(Y-180+bb+Math.sin(a)*8)-1,3,3); }
  }catch(e){ console.error('giant pig v2',e); } finally{ hdEnd(c); } }
drawHamzaFairy=drawFairyV2; drawGiantPig=drawGiantPigV2;
