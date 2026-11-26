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
// the giant facing you (the eating close-ups): the old shapes doubled, with real curves, lids, nostrils, cheeks and a lit halo
function pigFrontV2(c,X,Y,s){ const E=(x,y,rx,ry,col)=>ell(c,X+x,Y+y,rx,ry,col), fl=!!s.flash, PK=fl?'#fff':'#f09ab6', PD=fl?'#fff':'#c87090', PH=fl?'#fff':'#ffc8da', PL=fl?'#fff':'#ffe0ea', PS=fl?'#fff':'#a85878', DK='#5a2032', t=s.t||0;
  const tri=(pts,col)=>{ c.fillStyle=col; c.beginPath(); c.moveTo(X+pts[0][0],Y+pts[0][1]); c.lineTo(X+pts[1][0],Y+pts[1][1]); c.lineTo(X+pts[2][0],Y+pts[2][1]); c.closePath(); c.fill(); };
  for(const sx of [-1,1]){ tri([[sx*60,-164],[sx*104,-216],[sx*92,-148]],PD); tri([[sx*68,-168],[sx*96,-204],[sx*88,-156]],fl?'#fff':'#e07a98'); tri([[sx*78,-172],[sx*93,-194],[sx*88,-164]],fl?'#fff':'#d06888'); }
  E(0,-92,116,92,PD); E(0,-100,108,84,PK); E(-28,-140,36,20,PH); E(-38,-147,18,7,PL); E(0,-24,76,14,PS); E(-74,-84,16,30,PD); E(74,-84,16,30,PD); E(-64,-92,14,9,fl?'#fff':'rgba(255,110,150,.45)'); E(64,-92,14,9,fl?'#fff':'rgba(255,110,150,.45)');
  for(const sx of [-1,1]){ const x=sx*40; E(x,-124,18,14,'#ffffff'); E(x,-122,10,10,'#3a2030'); E(x,-122,6,6,'#1a1018'); c.fillStyle='#ffffff'; c.fillRect(X+x-4,Y-128,4,4); c.fillRect(X+x+3,Y-119,2,2); c.fillStyle=PK; c.fillRect(X+x-20,Y-140,40,12); c.fillStyle=PD; c.fillRect(X+x-20,Y-142,40,3); c.fillStyle=DK; c.fillRect(X+x-20,Y-130,40,4); c.fillStyle=PS; c.fillRect(X+x-18,Y-108,36,2); }
  E(0,-76,40,28,fl?'#fff':'#e07a98'); E(0,-78,36,24,PH); E(-8,-92,16,5,PL); E(-14,-76,8,10,DK); E(14,-76,8,10,DK); E(-14,-74,5,6,'#2e0c18'); E(14,-74,5,6,'#2e0c18'); E(0,-54,30,3,fl?'#fff':'#d87a98');
  c.strokeStyle=DK; c.lineWidth=6; c.lineCap='round'; c.beginPath(); c.moveTo(X-48,Y-40); c.quadraticCurveTo(X+8,Y-20,X+60,Y-48); c.stroke(); c.lineWidth=3; c.beginPath(); c.moveTo(X+56,Y-54); c.lineTo(X+64,Y-44); c.stroke();
  if(s.drip){ for(let i=0;i<5;i++){ const L=12+2*Math.floor((t*20+i*7)%10), x=X-36+i*18, y=Y-40+(i%2)*4; c.fillStyle='#9a0010'; c.fillRect(x,y,6,L); c.fillStyle='#d0283a'; c.fillRect(x,y,2,L); c.fillStyle='#7a000c'; c.fillRect(x-1,y+L,8,3); } }
  c.lineWidth=6; c.strokeStyle='#ffe680'; c.beginPath(); c.ellipse(X,Y-208,52,14,0,0,7); c.stroke(); c.lineWidth=2; c.strokeStyle='#fff6c0'; c.beginPath(); c.ellipse(X,Y-209,52,14,0,.4,2.7); c.stroke(); }
function drawGiantPigV2(c,cx,by,f,s){ if(s.front){ const o2=hdBegin(c,cx,by,2); if(!o2) return CST.pig0(c,cx,by,f,s); try{ pigFrontV2(c,o2[0],o2[1],s); }catch(e){ console.error('pig front',e); } finally{ hdEnd(c); } return; }
  const K=2, o=hdBegin(c,cx,by,K); if(!o) return drawGiantPigCast(c,cx,by,f,s);
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

// ================= NATHAN on foot (the pilot; also real-life Nathan in the Kill ending) =================
// One painter in HD pixels (1.5x the old rig: about 70 px tall), used three ways: on a regrown Sprite3D (`drawNathanV2`),
// on the on-foot fight's own canvas (59zh: 168x120, 32 px per unit instead of 21) and in the Kill ending's film (59zk).
// Same flags as drawNathanCast (frost, jacket, scarf, still, closed, pose in the old 1x units, out.J) plus:
//   irl (a grey hoodie, jeans, a green headset light), face 'shock'|'ko'|'none', nohead, noset, sil (one colour).
function nathanV2Paint(c,X,Y,f,s){ s=s||{}; const p=SH(c,X,Y,f), R=Math.round, t=s.t||0, fr=s.frost||0, Jk=s.jacket==null?1:s.jacket, SC=s.scarf==null?1:s.scarf, still=!!s.still, irl=!!s.irl, K=1.5;
  const ice=hex=>{ if(s.sil) return s.sil; if(fr<=0) return hex; const n=parseInt(hex.slice(1),16), r=n>>16&255, g=n>>8&255, b=n&255, k=Math.min(1,fr); return `rgb(${R(r+(200-r)*k)},${R(g+(232-g)*k)},${R(b+(255-b)*k)})`; };
  const C={skin:'#c48a5c',skinD:'#9a6440',skinH:'#d9a272',skinL:'#ecc09a',hair:'#1a1626',hairH:'#34304a',hairL:'#544e70',suit:'#232a4a',suitL:'#34406a',suitD:'#161a30',suitH:'#4a5a8c',stripe:'#3ff4ff',stripeD:'#1a8a9a',jac:'#5a3a28',jacL:'#7a523a',jacD:'#3e271a',fur:'#e0d2b8',furS:'#b8a888',scarf:'#e8e4dc',scarfS:'#b8b4ac',boot:'#14121c',bootH:'#2e2a3a',bootS:'#464256',hd:'#6a7684',hdS:'#4c5662',hdH:'#8a96a4',hdD:'#3a424c',str:'#d8dde4',jean:'#1c2440',jeanL:'#2c3860',jeanD:'#121830',set:'#22242c',setH:'#3c404c',led:'#5aff8a',white:'#ffffff',eye:'#14101a',mouth:'#6a3a2a',mouthO:'#4a1a14',teeth:'#f2ece8',tongue:'#c86a6a'};
  for(const k in C) C[k]=ice(C[k]);
  const tk=s.sil?0:cTalk(irl?'nathanirl':'nathan'), sh=fr>.5&&!still?R(Math.sin(t*40)*.6):0, dr=still?0:Math.sin(t*1.3), ar=still?0:Math.sin(t*1.1);
  let P={b:-6+R(dr),lean:0,F:[[-3,-2+R(dr*2)],[4,-4-R(dr*2)]],ua:[-.9+ar*.3,1.1-ar*.3],el:[.5,.6+ar*.2],hd:0,hx:sh};
  if(tk){ P.ua[1]=.9+Math.sin(t*3.4)*.35; P.el[1]=1.3; }
  if(s.pose) Object.assign(P,s.pose); P=hdPose(Object.assign({},P,{F:P.F.map(q=>q.slice())}),K);
  const D={hip:21,torso:24,thigh:11,shin:11,uarm:9,farm:9,sep:3,ssep:8,neck:1}, J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy; if(s.out) s.out.J=J;
  const top=irl?[C.hdD,C.hdS,C.hd,C.hdH]:Jk>.5?[C.jacD,C.jacD,C.jac,C.jacL]:[C.suitD,C.suitD,C.suit,C.suitL], lg=irl?[C.jeanD,C.jean,C.jeanL]:[C.suitD,C.suit,C.suitL];
  // scarf trailing behind; the hoodie's hood bunched at the neck
  if(!irl&&SC>.05){ c.globalAlpha=SC; for(let i=0;i<9;i++){ const yy=sy+1+R(Math.sin(t*2+i*.8)*3)+R(i*1.4); p(sx-9-i*4,yy,6,3,i%2?C.scarfS:C.scarf); p(sx-9-i*4,yy+2,6,1,C.scarfS); } c.globalAlpha=1; }
  if(irl){ p(sx-11,sy-5,10,8,C.hdS); p(sx-11,sy-5,10,2,C.hd); p(sx-11,sy+2,9,1,C.hdD); }
  // far arm
  { const A=J.A[0]; cArm(p,A,6,top[0],top[1],C.skinD,C.skinD); p(R(A.ex)-2,R(A.ey)-2,5,5,C.skinD); }
  // legs: the flight suit's stripe and knee pad (or jeans), boots with a cuff and a toe
  const leg=(L,near)=>{ const u=near?lg[1]:lg[0], w=near?lg[2]:lg[1]; cSeg(p,L.x,L.y,L.kx,L.ky,7,u,w); cSeg(p,L.kx,L.ky,L.ex,L.ey-4,6,u,w);
    if(near&&!irl){ cSeg(p,L.x+2,L.y+1,L.kx+2,L.ky,1,C.stripe); p(R(L.kx)-3,R(L.ky)-2,7,4,C.suitH); p(R(L.kx)-3,R(L.ky)-2,7,1,C.stripeD); } if(near&&irl){ p(R(L.kx)-2,R(L.ky)-1,5,2,C.jeanL); }
    const x=R(L.ex), y=R(L.ey); p(x-4,y-6,9,6,C.boot); p(x+3,y-4,4,4,near?C.bootH:C.boot); p(x-4,y-7,8,2,near?C.bootS:C.bootH); p(x-4,y,10,1,irl?C.white:C.bootS); if(near) p(x-2,y-5,3,1,C.bootS); };
  leg(J.L[0],0); leg(J.L[1],1);
  const mid=R((sx+J.hx)/2);
  if(irl){ // hoodie: a kangaroo pocket, two strings, a ribbed hem
    cPoly(p,[[sx-11,sy],[sx+11,sy],[J.hx+10,hy+2],[J.hx-10,hy+2]],C.hd); cPoly(p,[[sx-11,sy],[sx-7,sy],[J.hx-6,hy+2],[J.hx-10,hy+2]],C.hdH); cPoly(p,[[sx+7,sy],[sx+11,sy],[J.hx+10,hy+2],[J.hx+7,hy+2]],C.hdS);
    p(J.hx-6,hy-10,13,7,C.hdS); p(J.hx-6,hy-10,13,1,C.hdD); p(J.hx-6,hy-10,1,7,C.hdD); p(J.hx-10,hy,20,3,C.hdS); p(J.hx-10,hy+2,20,1,C.hdD); p(sx-3,sy+1,1,9,C.str); p(sx+2,sy+1,1,8,C.str); p(sx-3,sy+10,1,2,C.hdD); p(sx+2,sy+9,1,2,C.hdD); cSeg(p,sx-6,sy+6,J.hx-7,hy-11,1,C.hdS); p(sx-6,sy-1,12,3,C.hdS); p(sx-4,sy-1,8,1,C.hdD); }
  else { // flight suit: a lit panel, a zip of light, a belt with a lit buckle
    cPoly(p,[[sx-10,sy],[sx+10,sy],[J.hx+9,hy+1],[J.hx-9,hy+1]],C.suit); cPoly(p,[[sx-10,sy],[sx-5,sy],[J.hx-5,hy+1],[J.hx-9,hy+1]],C.suitL); cPoly(p,[[sx+6,sy],[sx+10,sy],[J.hx+9,hy+1],[J.hx+6,hy+1]],C.suitD);
    p(mid-1,sy+2,2,Math.max(0,hy-sy-5),C.stripe); p(mid+1,sy+2,1,Math.max(0,hy-sy-5),C.stripeD); p(sx-8,sy+8,5,1,C.suitH); p(sx+3,sy+8,5,1,C.suitD); p(sx-8,sy+13,4,3,C.suitD); p(sx-8,sy+13,4,1,C.suitH); p(sx-5,sy-1,10,3,C.suitL); p(sx-5,sy+1,10,1,C.suitD);
    p(J.hx-9,hy-4,18,3,C.boot); p(J.hx-9,hy-4,18,1,C.bootS); p(J.hx-2,hy-5,4,5,C.stripe); p(J.hx-1,hy-4,2,3,C.stripeD);
    if(Jk>.05){ c.globalAlpha=Jk; cPoly(p,[[sx-12,sy-1],[sx-3,sy-1],[J.hx-4,hy+3],[J.hx-12,hy+3]],C.jac); cPoly(p,[[sx+4,sy-1],[sx+12,sy-1],[J.hx+12,hy+3],[J.hx+5,hy+3]],C.jac);
      p(sx-12,sy-1,3,Math.max(0,hy-sy+4),C.jacL); p(sx+9,sy,3,Math.max(0,hy-sy+3),C.jacD); p(J.hx-12,hy+2,8,2,C.jacD); p(J.hx+5,hy+2,7,2,C.jacD); p(sx+5,hy-9,5,1,C.jacD); p(sx-10,hy-10,5,1,C.jacD);
      p(sx-12,sy-3,9,5,C.fur); p(sx+4,sy-3,8,5,C.fur); p(sx-12,sy+1,9,1,C.furS); p(sx+4,sy+1,8,1,C.furS); p(sx-10,sy-2,2,1,C.white); p(sx+6,sy-2,2,1,C.white); c.globalAlpha=1; }
    if(SC>.05){ c.globalAlpha=SC; p(sx-9,sy-4,18,5,C.scarf); p(sx-9,sy,18,1,C.scarfS); p(sx-3,sy-3,1,3,C.scarfS); p(sx+4,sy-2,1,2,C.scarfS); p(sx-9,sy-4,18,1,C.white); c.globalAlpha=1; } }
  // head
  const hx=R(J.headX), h0=R(J.headY);
  if(!s.nohead){ const face=s.face||(s.closed||cBlink(t,.3)?'shut':'calm');
    p(hx-9,h0-18,18,16,C.skin); p(hx-7,h0-2,14,1,C.skin); p(hx-5,h0-1,10,1,C.skinD); p(hx+4,h0-16,4,12,C.skinH); p(hx+6,h0-13,2,6,C.skinL); p(hx-9,h0-18,3,14,C.skinD); p(hx-8,h0-4,16,2,C.skinD); p(hx-10,h0-12,2,5,C.skinD); p(hx,h0-9,1,3,C.skinD);
    if(!s.sil){
      if(face==='shock'){ p(hx-6,h0-14,6,6,C.white); p(hx+2,h0-14,6,6,C.white); p(hx-4,h0-12,2,2,C.eye); p(hx+4,h0-12,2,2,C.eye); p(hx-6,h0-18,6,1,C.hair); p(hx+2,h0-18,6,1,C.hair); p(hx-2,h0-7,6,6,C.mouthO); p(hx-2,h0-7,6,1,C.teeth); p(hx-1,h0-3,4,1,C.tongue); }
      else if(face==='ko'){ p(hx-6,h0-12,5,1,C.eye); p(hx-4,h0-13,1,3,C.eye); p(hx+2,h0-12,5,1,C.eye); p(hx+4,h0-13,1,3,C.eye); p(hx-1,h0-6,5,2,C.mouthO); p(hx+3,h0-4,1,3,'#a8141e'); p(hx-7,h0-9,3,2,'#8a4a6a'); }
      else if(face!=='none'){ if(face==='shut'){ p(hx-5,h0-11,5,1,C.eye); p(hx+2,h0-11,5,1,C.eye); } else { p(hx-5,h0-13,5,4,C.white); p(hx-3,h0-13,3,4,C.eye); p(hx-3,h0-13,1,1,C.white); p(hx+2,h0-13,5,4,C.white); p(hx+4,h0-13,3,4,C.eye); p(hx+4,h0-13,1,1,C.white); p(hx-5,h0-14,5,1,C.hair); p(hx+2,h0-14,5,1,C.hair); }
        p(hx-6,h0-16,6,1,C.hair); p(hx+2,h0-16,6,1,C.hair);
        if(tk===2){ p(hx-2,h0-7,6,4,C.mouthO); p(hx-2,h0-7,6,1,C.teeth); p(hx-1,h0-4,3,1,C.tongue); } else { p(hx-1,h0-6,5,1,C.mouth); p(hx+4,h0-7,1,1,C.mouth); } } }
    // hair: a dark mop in spikes, lit on top
    p(hx-10,h0-21,20,7,C.hair); p(hx-11,h0-18,4,9,C.hair); p(hx+8,h0-18,3,7,C.hair); p(hx+5,h0-24,6,5,C.hair); p(hx-5,h0-26,6,6,C.hair); p(hx-1,h0-23,5,3,C.hair); p(hx-9,h0-23,4,3,C.hair); p(hx+1,h0-27,3,3,C.hair); p(hx-6,h0-15,3,2,C.hair); p(hx+4,h0-15,4,1,C.hair);
    p(hx-6,h0-21,9,1,C.hairH); p(hx+6,h0-22,3,1,C.hairH); p(hx-4,h0-25,2,1,C.hairL); p(hx+2,h0-26,1,1,C.hairL); p(hx-8,h0-22,2,1,C.hairH);
    if(!s.noset){ p(hx-11,h0-23,2,9,C.set); p(hx-10,h0-24,14,2,C.set); p(hx-9,h0-24,12,1,C.setH); p(hx-13,h0-15,4,8,C.set); p(hx-13,h0-15,4,1,C.setH); p(hx-12,h0-8,9,1,C.set); p(hx-4,h0-9,3,3,C.set); if(!s.sil) p(hx-3,h0-8,1,1,irl?C.led:(Math.sin(t*5)>0?C.stripe:C.stripeD)); } }
  // near arm
  { const A=J.A[1]; cArm(p,A,6,top[2],top[3],C.skin,C.skinD); p(R(A.x)-4,R(A.y)-3,8,5,top[3]); p(R(A.ex)-2,R(A.ey)-2,5,5,C.skin); p(R(A.ex)+1,R(A.ey)-2,2,2,C.skinH); if(!irl&&Jk<=.5){ p(R(A.x)-3,R(A.y)+3,6,2,C.stripeD); } }
  if(fr>.15&&!s.sil){ const n=Math.floor(fr*30); for(let i=0;i<n;i++){ const x=Math.floor(hash(i,7)*36)-18, y=-Math.floor(hash(7,i)*74)-5; p(x,y,1,1,'#ffffff'); if(i%3===0) p(x-1,y,3,1,'rgba(220,240,255,.8)'); } } }
function drawNathanV2(c,cx,by,f,s){ const K=1.5, o=hdBegin(c,cx,by,K); if(!o) return drawNathanCast(c,cx,by,f,s); try{ nathanV2Paint(c,o[0],o[1],f,s); }catch(e){ console.error('nathan v2',e); } finally{ hdEnd(c); } }
drawNathanPilot=drawNathanV2;

// ================= KOJIMA'S FILM CREW (48 px per unit): the Boxheads and the Silverbobs =================
// Same designs, flags and poses as drawSoldierCast (03k). The box now has flaps, a tape seam, a FRAGILE stamp with its
// lines and a this-way-up arrow; the jumpsuit a zip, a pocket and harness buckles; the boom pole a fuzzy windscreen.
// The Silverbob's bob has a shine and a fringe line; the coat has lapels over the turtleneck; the camera a lens with glass.
function drawSoldierV2(c,cx,by,f,s,arch){ const K=1.5, o=hdBegin(c,cx,by,K); if(!o) return drawSoldierCast(c,cx,by,f,s,arch);
  try{ const p=SH(c,o[0],o[1],f), R=Math.round, t=s.t||0, a=s.anim||'idle', fl=s.flash>0, rip=arch==='shaman', rai=!!arch;
    const C=cFlash(rai?{suit:'#ece8e0',suitD:'#c4bcb0',suitX:'#a49c90',suitH:'#ffffff',line:rip?'#ffd45a':'#8fe0ff',plate:'#2a2c36',plateH:'#454856',plateX:'#16171e',hair:'#c8ccd8',hairD:'#9aa0b0',hairH:'#f4f6fa',skin:'#f0d0b8',skinD:'#d0a888',boot:'#14141a',bootH:'#2e2e3a'}
      :{suit:'#5a5e3a',suitD:'#3e4228',suitX:'#2c301c',suitH:'#7a7e52',line:'#1c1c22',plate:'#2a2a30',plateH:'#44444c',hair:'#5a3a24',hairD:'#3a2416',skin:'#c8a064',skinD:'#8a6a42',skinH:'#e0bc80',boot:'#18151c',bootH:'#2e2a34',band:'#c8202e',bandD:'#8a1420',bandH:'#e84a56',tape:'#e8d0a0'},fl);
    const k=a==='run'?'run':a==='tell'?'charge':a==='lunge'?'dash':a==='hurt'?'hurt':'idle', P0=cPose(k,t,0); if(a==='tell'){ P0.b=2; P0.lean=-1; } if(a==='lunge'){ P0.lean=5; P0.b=1; } const P=hdPose(P0,K);
    const D={hip:17,torso:21,thigh:8,shin:9,uarm:8,farm:7,sep:3,ssep:8,neck:1}, J=cRig(D,P), hy=J.hy, sx=J.sx, sy=J.sy;
    { const A=J.A[0]; cArm(p,A,5,C.suitX,C.suitD,rai?C.skinD:C.suitX,rai?C.skinD:C.suitX); }
    const leg=(L,near)=>{ const u=near?C.suitD:C.suitX, w=near?C.suit:C.suitD; cSeg(p,L.x,L.y,L.kx,L.ky,6,u,w); cSeg(p,L.kx,L.ky,L.ex,L.ey-3,5,u,w); if(near){ p(R(L.kx)-3,R(L.ky)-2,6,4,C.plate); p(R(L.kx)-3,R(L.ky)-2,6,1,C.plateH); }
      const x=R(L.ex), y=R(L.ey); p(x-3,y-5,8,5,C.boot); p(x+2,y-4,4,4,near?C.bootH:C.boot); p(x-3,y,9,1,'#0a0a0e'); p(x-3,y-6,7,1,near?C.bootH:C.boot); };
    leg(J.L[0],0); leg(J.L[1],1);
    // torso
    cPoly(p,[[sx-10,sy],[sx+10,sy],[J.hx+9,hy+2],[J.hx-9,hy+2]],C.suit); cPoly(p,[[sx+5,sy],[sx+10,sy],[J.hx+9,hy+2],[J.hx+5,hy+2]],C.suitD); cPoly(p,[[sx-10,sy],[sx-7,sy],[J.hx-6,hy+2],[J.hx-9,hy+2]],C.suitH);
    if(rai){ cPoly(p,[[sx-4,sy],[sx+5,sy],[J.hx+4,hy+2],[J.hx-3,hy+2]],C.plate); p(sx-3,sy-1,8,3,C.plateH); p(sx-3,sy+1,8,1,C.plateX); cPoly(p,[[sx-9,sy],[sx-4,sy],[sx-1,sy+10],[sx-5,sy+8]],C.suitH); cPoly(p,[[sx+10,sy],[sx+5,sy],[sx+2,sy+10],[sx+6,sy+8]],C.suitD);
      cSeg(p,sx-5,sy+1,sx,sy+13,1,'#3a3a44'); cSeg(p,sx+6,sy+1,sx+1,sy+13,1,'#3a3a44'); p(sx-3,sy+13,7,5,C.line); p(sx-2,sy+14,5,1,'#ffffff'); p(sx-2,sy+16,3,1,'#ffffff'); p(sx-3,sy+13,7,1,'#ffffff'); p(J.hx-9,hy+1,18,1,C.suitX); p(sx+6,hy-9,3,4,C.suitD); }
    else { cSeg(p,sx-8,sy+1,J.hx+7,hy-3,2,C.line); cSeg(p,sx+8,sy+1,J.hx-7,hy-3,2,C.line); p(J.hx-9,hy-5,19,3,C.line); p(J.hx-9,hy-5,19,1,'#34343e'); p(J.hx+3,hy-6,4,5,C.plateH); p(J.hx+4,hy-5,2,3,C.plate); p(R((sx+J.hx)/2)-1,R((sy+hy)/2)-3,3,3,C.plateH);
      p(sx-12,sy-2,6,5,C.suitH); p(sx+7,sy-2,6,5,C.suitH); p(sx-12,sy+2,6,1,C.suitD); p(sx+7,sy+2,6,1,C.suitD); p(sx-7,sy+6,5,5,C.suitD); p(sx-7,sy+6,5,1,C.suitX); p(sx,sy+1,1,Math.max(0,hy-sy-7),C.suitX); }
    const hx=R(J.headX), h0=R(J.headY), mo=a==='tell'||a==='lunge'?3:0, bl=cBlink(t,cx*.21);
    if(rai){ p(hx-6,h0-17,15,17,C.skin); p(hx-6,h0-17,4,15,C.skinD); p(hx+8,h0-10,2,4,C.skin); p(hx-4,h0-1,11,1,C.skinD);
      p(hx-9,h0-23,20,8,C.hair); p(hx-11,h0-17,5,18,C.hair); p(hx-13,h0-11,4,12,C.hairD); p(hx-5,h0-15,15,4,C.hair); p(hx+3,h0-12,7,1,C.hairD); p(hx-5,h0-11,2,2,C.hair); p(hx+1,h0-11,2,1,C.hair);
      p(hx-8,h0-23,11,1,C.hairH); p(hx-6,h0-21,6,1,C.hairH); p(hx-10,h0-15,1,10,C.hairH); p(hx+9,h0-20,2,6,C.hairD); const sw=R(Math.sin(t*6)*1.5); p(hx-15,h0-5+sw,4,7,C.hairD); p(hx-14,h0-5+sw,1,6,C.hair);
      if(mo){ p(hx+3,h0-5,6,3,'#5a1a24'); p(hx+3,h0-5,6,1,'#f2efe6'); } else { p(hx+3,h0-4,6,1,C.skinD); p(hx+8,h0-5,1,1,C.skinD); } p(hx+6,h0-8,1,2,C.skinD);
      if(rip&&a==='tell'){ p(hx+4,h0-12,3,2,'#ffd45a'); p(hx+5,h0-12,1,1,'#ffffff'); } }
    else { p(hx-9,h0-20,20,20,C.skin); p(hx-9,h0-20,3,20,C.skinD); p(hx+9,h0-20,2,20,C.skinD); p(hx-9,h0-2,20,2,C.skinD); p(hx-9,h0-20,20,2,C.tape); p(hx-1,h0-20,3,20,C.tape); p(hx-1,h0-20,1,20,'#f6e6c0'); p(hx-6,h0-18,4,1,C.skinH); p(hx+4,h0-18,3,1,C.skinH);
      p(hx-12,h0-22,10,2,C.skinD); p(hx+3,h0-22,10,2,C.skin); p(hx-12,h0-21,10,1,'#6a5030'); /* the flaps, half open */
      p(hx-11,h0-9,4,13,C.hair); p(hx-14,h0-5,3,9,C.hairD); p(hx-11,h0-9,1,12,'#7a5234'); /* the mullet */
      const eye=a==='tell'||a==='lunge'?'#ff2a3a':(bl?'#1a1418':'#3a2e34'); p(hx-5,h0-14,4,3,'#0a0a0c'); p(hx+3,h0-14,4,3,'#0a0a0c'); p(hx-4,h0-13,2,2,eye); p(hx+4,h0-13,2,2,eye); if(!bl){ p(hx-4,h0-13,1,1,'#ffffff'); p(hx+4,h0-13,1,1,'#ffffff'); }
      p(hx-8,h0-17,17,3,C.band); p(hx-8,h0-17,17,1,C.bandH); const tw=R(Math.sin(t*9)*2); p(hx-10,h0-17,3,4,C.bandD); p(hx-14,h0-17+tw,5,2,C.band); p(hx-18,h0-15+tw,4,2,C.bandD); p(hx-13,h0-13-tw,5,2,C.band); p(hx-17,h0-11-tw,3,2,C.bandD);
      p(hx-6,h0-8,13,5,'#c8202e'); p(hx-5,h0-7,11,1,'#ffd0d0'); p(hx-5,h0-5,8,1,'#ffd0d0'); p(hx-6,h0-8,13,1,'#8a1420'); p(hx+4,h0-2,1,1,'#5a4a2e'); p(hx+5,h0-11,1,4,'#5a4a2e'); p(hx+4,h0-10,3,1,'#5a4a2e'); /* FRAGILE, and this way up */
      if(a==='tell'){ const on=Math.floor(t*8)%2; p(hx-5,h0-33,14,9,'#1a1418'); p(hx-5,h0-33,14,1,'#3a3438'); p(hx-3,h0-31,3,3,on?'#ff2a2a':'#5a1016'); p(hx+1,h0-31,7,1,'#f2efe6'); p(hx+1,h0-29,7,1,'#f2efe6'); p(hx+1,h0-27,5,1,'#f2efe6'); } }
    const A=J.A[1];
    if(rai&&!rip){ const ang=a==='lunge'?0:a==='tell'?-.35:-.2, ex=R(A.ex), ey=R(A.ey)-9, on=Math.floor(t*6)%2; p(ex-6,ey-5,15,10,C.plate); p(ex-6,ey-5,15,1,C.plateH); p(ex-6,ey+4,15,1,C.plateX); p(ex+9,ey-4,5,7,'#3a3a44'); p(ex+10,ey-3,4,5,a==='tell'?'#bff4ff':'#8fb8d8'); p(ex+10,ey-3,2,2,'#ffffff'); p(ex+13,ey-4,1,7,'#22222a');
      p(ex-5,ey-8,5,3,C.plate); p(ex-4,ey-7,2,2,on?'#ff2a2a':'#5a1016'); p(ex-3,ey-1,6,3,C.plateH); p(ex+1,ey-8,6,2,C.plateH); cSeg(p,ex,ey+5,ex+Math.cos(ang)*6,ey+5+Math.sin(ang)*6,2,C.plateH); }
    else if(rip){ const ex=R(A.ex), ey=R(A.ey); p(ex-2,ey-11,11,14,'#6a4a2a'); p(ex-2,ey-11,11,1,'#8a6a44'); p(ex-1,ey-9,9,11,'#f2efe6'); for(let i=0;i<4;i++) p(ex+1,ey-7+i*2,5+(i%2),1,'#b8b4aa'); p(ex+1,ey-12,5,3,'#3a3a44'); p(ex+2,ey-12,3,1,'#6a6a78'); p(ex+5,ey-3,3,3,'#ffd45a');
      if(a==='tell') for(let i=0;i<3;i++){ const aa=t*8+i*2.1; p(ex+R(Math.cos(aa)*9),ey-9+R(Math.sin(aa)*9),4,3,i%2?'#ffd45a':'#ff8ab0'); } }
    else { const ang=a==='lunge'?0:a==='tell'?-.45:.9, x1=A.ex+Math.cos(ang)*14, y1=A.ey+Math.sin(ang)*14; cSeg(p,A.ex-Math.cos(ang)*4,A.ey-Math.sin(ang)*4,x1,y1,2,'#b8bcc8'); cSeg(p,A.ex,A.ey-1,x1,y1-1,1,'#e0e4ec'); const fx=R(x1), fy=R(y1); p(fx-3,fy-3,8,7,'#2a2a30'); p(fx-2,fy-4,6,1,'#2a2a30'); p(fx-2,fy+4,6,1,'#2a2a30'); for(let i=0;i<7;i++) p(fx-2+(i*3)%7,fy-3+(i*5)%7,1,1,'#55555e'); p(fx-1,fy-2,3,2,'#44444c'); }
    cArm(p,A,5,C.suitD,C.suit,rai?C.skin:C.suitD,rai?C.skinD:C.suitX); p(R(A.x)-3,R(A.y)-2,7,4,C.suit); p(R(A.x)-2,R(A.y)-2,4,1,C.suitH);
  }catch(e){ console.error('soldier v2',e); } finally{ hdEnd(c); } }
drawHoundHD=drawSoldierV2;

// ================= THE TRAINING DUMMY (48 px per unit) =================
function drawDummyV2(c,cx,by,s){ const K=1.5, o=hdBegin(c,cx,by,K); if(!o) return drawDummyCast(c,cx,by,s);
  try{ const t=s.t||0, hit=s.flash>0, w=hit?Math.sin(t*40)*.18:Math.sin(t*1.3)*.03, X=o[0], Y=o[1]; const p=(x,y,ww,hh,col)=>{ c.fillStyle=col; c.fillRect(X+Math.round(x+Math.sin(w)*(-y)*.9),Y+y,ww,hh); };
    const ST='#d6b468', SD='#bf9a54', SX='#a07e40', SH2='#e6c888', WD='#6b4a2b', WH='#8a6a3a', RP='#8a6a34';
    p(-2,-39,4,39,WD); p(-1,-39,1,39,WH); p(-7,-5,14,5,'#4a3420'); p(-7,-5,14,1,'#6a4a30'); p(-9,-1,18,1,'#2e2014');
    p(-15,-30,30,4,WD); p(-15,-30,30,1,WH); p(-18,-31,5,10,ST); p(13,-31,5,10,ST); p(-18,-23,5,2,SD); p(13,-23,5,2,SD); p(-18,-31,1,10,SD); p(-17,-27,3,1,RP); p(14,-27,3,1,RP);
    p(-12,-36,24,16,ST); p(-12,-36,4,16,SD); p(8,-36,4,16,SD); p(-12,-27,24,1,RP); p(-12,-24,24,1,RP); p(-12,-31,24,1,RP); p(-3,-36,1,16,SD); p(4,-36,1,16,SX); for(let i=0;i<6;i++) p(-10+i*4,-35+(i%3)*4,1,3,SH2); p(-9,-22,3,3,'#8a2a2a'); p(-8,-21,1,1,'#c84a4a');
    p(-10,-57,21,21,ST); p(6,-52,5,10,SD); p(-10,-57,4,20,SD); p(-5,-57,12,2,SH2); p(-10,-38,21,2,SX); p(-10,-47,21,1,RP); for(let i=0;i<5;i++) p(-8+i*4,-56+(i%2)*3,1,4,SH2);
    p(-11,-63,6,6,SD); p(3,-63,6,6,ST); p(4,-62,3,3,SD); p(-10,-62,2,2,SX);
    const eye=hit?'#ff4a4a':'#2a1d16'; p(-6,-52,3,1,eye); p(-5,-53,1,3,eye); p(4,-52,3,1,eye); p(5,-53,1,3,eye); p(-4,-44,10,1,RP); for(let i=0;i<4;i++) p(-3+i*3,-45,1,3,RP); p(-9,-47,1,6,SH2); p(9,-40,3,1,SH2);
    if(hit){ for(let i=0;i<6;i++){ c.fillStyle=SH2; c.fillRect(X+Math.round(Math.sin(t*20+i*1.7)*18),Y-30-Math.round(Math.abs(Math.cos(t*13+i))*30),1,3); } }
  }catch(e){ console.error('dummy v2',e); } finally{ hdEnd(c); } }
drawDummyHD=drawDummyV2;

// ================= ALI'S DESCENDANTS (64 px per unit): the twenty kids of his ending =================
function drawAliKidV2(c,cx,by,f,s){ const K=2, o=hdBegin(c,cx,by,K); if(!o) return drawAliKidCast(c,cx,by,f,s);
  try{ const p=SH(c,o[0],o[1],f), R=Math.round, t=s.t||0, i=s.i||0, ears=i%3!==1, hat=i%4===0, tk=cTalk('kids')||cTalk('kid14');
    const cloth=['#2e8a7e','#1c1a2a','#8a1a2a','#4a6fa8','#d0a03a'][i%5], clS=cShade(cloth,-.25), clH=cShade(cloth,.2), hair=i%2?'#e8cf98':'#14101a', hairS=cShade(hair,-.25), hairH=cShade(hair,.25), sk='#d8a07a', skH='#ecbc94', skS='#b8825e';
    const ph=t*7+i, run=Math.sin(ph), hop=R(Math.abs(Math.sin(ph))*4), lg=R(run*4), ar=R(Math.sin(ph+1.5)*4);
    p(-6-lg,-12-hop,5,12-(lg>0?2:0),'#2a2438'); p(2+lg,-12-hop,5,12-(lg<0?2:0),'#2a2438'); p(-6-lg,-12-hop,2,10,'#3a3450'); p(2+lg,-12-hop,2,10,'#3a3450'); p(-6-lg,-2-hop,6,2,'#1a1420'); p(2+lg,-2-hop,7,2,'#1a1420');
    p(-12,-24-hop-ar,4,8,clS); p(-12,-17-hop-ar,4,4,skS);
    p(-8,-26-hop,16,16,cloth); p(2,-26-hop,6,16,clS); p(-8,-26-hop,2,16,clH); p(-8,-11-hop,16,1,clS); p(-8,-18-hop,16,2,'#e8e4dc'); p(-8,-17-hop,16,1,'#b8b4ac'); p(-3,-16-hop,3,5,'#e8e4dc'); p(-2,-26-hop,5,3,sk); p(-1,-23-hop,3,1,skS);
    p(8,-24-hop+ar,4,8,cloth); p(8,-24-hop+ar,1,8,clH); p(8,-17-hop+ar,4,4,sk);
    p(-6,-38-hop,14,12,sk); p(4,-38-hop,4,10,skH); p(-6,-28-hop,13,2,skS); p(-4,-26-hop,9,1,skS); p(-7,-41-hop,15,5,hair); p(-8,-38-hop,4,8,hairS); p(-4,-41-hop,7,1,hairH); p(4,-37-hop,4,1,hair); p(-2,-37-hop,3,2,hair);
    p(1,-34-hop,4,3,'#ffffff'); p(2,-34-hop,2,3,i%4===2?'#ff2a3a':'#2a1a10'); p(2,-34-hop,1,1,'#ffffff'); p(-4,-34-hop,2,3,'#2a1a10'); p(1,-35-hop,4,1,hairS); p(5,-32-hop,1,1,'#f6909c');
    if(tk===2&&(i+Math.floor(t*6))%2){ p(-1,-30-hop,5,3,'#5a1a24'); p(-1,-30-hop,5,1,'#ffffff'); } else { p(-1,-29-hop,4,1,'#7a3a2a'); p(3,-30-hop,1,1,'#7a3a2a'); }
    if(ears){ p(-8,-46-hop,4,6,hair); p(4,-46-hop,4,6,hair); p(-7,-47-hop,2,1,hair); p(5,-47-hop,2,1,hair); p(-7,-44-hop,2,3,'#e89aa8'); p(5,-44-hop,2,3,'#e89aa8'); }
    if(hat){ p(-14,-42-hop,28,2,'#9a7a3a'); p(-10,-44-hop,20,2,'#c8a860'); p(-4,-46-hop,8,2,'#e2c47a'); p(-14,-41-hop,28,1,'#6a5222'); p(-8,-44-hop,4,1,'#e2c47a'); }
    if(i%5===3){ cSeg(p,-3,-17-hop,-18,-8-hop,2,'#0c0a10'); cSeg(p,-3,-19-hop,-16,-12-hop,1,'#3a3048'); p(-5,-19-hop,3,3,'#d8b46a'); }
  }catch(e){ console.error('kid v2',e); } finally{ hdEnd(c); } }
drawAliKid=drawAliKidV2;
