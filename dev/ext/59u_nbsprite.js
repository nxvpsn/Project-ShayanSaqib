// =====================================================================
// NATHAN IN 8 DIRECTIONS (Ali's road only; Shayan's Oddities and the mech fight keep the original art).
// img/nathan/nathan.png (made by nathan_sprite.py: a 3D model rendered as pixel art): 176x192 cells, columns =
// facings S,SE,E,NE,N,NW,W,SW, rows: idle 0-3, dash 4-5, slash 6-8, hurt 9. His facing (toward Ali) is taken
// relative to the camera, so it holds in the behind-the-back view too. No cyan halo over him on this road.
// =====================================================================
const NBS={img:null,ok:false,cv:null,c:null,tex:null,geo:null,nb:null,key:'',slashT:0,CW:176,CH:192};
(function(){ try{ const im=new Image(); im.onload=()=>{ NBS.ok=true; }; im.src='img/nathan/nathan.png'; NBS.img=im; }catch(e){} })();
function nbsOn(){ return NBS.ok&&typeof NB!=='undefined'&&NB&&NB.mesh&&ALI(); }
// his facing on the sheet: the angle toward Ali, measured from the camera's side of him
function nbsDir(){ const P=Player, cp=camera.position, a=Math.atan2(P.z-NB.z,P.x-NB.x), ca=Math.atan2(cp.z-NB.z,cp.x-NB.x);
  return ((Math.round(-(a-ca)/(Math.PI/4))%8)+8)%8; }
function nbsRow(){ if(NB.stunned) return 9; if(NBS.slashT>0) return NBS.slashT>.22?7:8; if(NB.dsh) return 4+(Math.floor(Game.time*12)%2); return Math.floor(Game.time*6)%4; }
function nbsInit(){ if(!NBS.cv){ NBS.cv=document.createElement('canvas'); NBS.cv.width=NBS.CW; NBS.cv.height=NBS.CH; NBS.c=NBS.cv.getContext('2d'); NBS.c.imageSmoothingEnabled=false;
    const t=new THREE.CanvasTexture(NBS.cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.encoding=THREE.sRGBEncoding; NBS.tex=t;
    // the body as tall as the old art's (3.7 units feet to head): 31 px per model unit, 0.925 units each; feet 6 px up
    const k=.925/31, w=NBS.CW*k, h=NBS.CH*k; NBS.geo=new THREE.PlaneGeometry(w,h); NBS.geo.translate(0,h/2-6*k,0); }
  NB.mat.map=NBS.tex; NB.mat.needsUpdate=true; NB.mesh.geometry=NBS.geo; NBS.nb=NB; NBS.key=''; }
function nbsDraw(dt){ if(NBS.nb!==NB) nbsInit(); NBS.slashT=Math.max(0,NBS.slashT-dt);
  const d=nbsDir(), r=nbsRow(), key=d+','+r; NB.mesh.scale.x=1; if(NB.glow) NB.glow.visible=false;
  if(key!==NBS.key){ NBS.key=key; NBS.c.clearRect(0,0,NBS.CW,NBS.CH); NBS.c.drawImage(NBS.img,d*NBS.CW,r*NBS.CH,NBS.CW,NBS.CH,0,0,NBS.CW,NBS.CH); NBS.tex.needsUpdate=true; } }
(function(){ const ds=drawSprites; drawSprites=function(){ const r=ds.apply(this,arguments); try{ if(nbsOn()) nbsDraw(1/60); }catch(e){ console.error('nathan sprite',e); } return r; }; })();
// the slash frames: on every strike
(function(){ const ns=nbStrike; nbStrike=function(){ NBS.slashT=.36; return ns.apply(this,arguments); }; })();
// afterimages: a still of the current frame instead of the old art
(function(){ const na=nbAfterimage; nbAfterimage=function(){ const r=na.apply(this,arguments); try{ if(nbsOn()&&NBS.cv&&NBG.length){ const g=NBG[NBG.length-1].m, cv=document.createElement('canvas'); cv.width=NBS.CW; cv.height=NBS.CH;
      cv.getContext('2d').drawImage(NBS.cv,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; g.material.map=t; g.material.needsUpdate=true; g.scale.x=1; } }catch(e){} return r; }; })();
