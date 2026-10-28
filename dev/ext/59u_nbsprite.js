// =====================================================================
// NATHAN IN 8 DIRECTIONS (Ali's road only; Shayan's Oddities and the mech fight keep the original art).
// img/nathan/nathan.png: the white mech with the cyan laser sword, 168px cells, columns = facings S,SE,E,NE,N,NW,W,SW,
// rows: 0 = standing, 1-12 = the laser-sword slash (the blade trail peaks around row 7), 13-20 = the thruster boost
// (13-14 lift-off, 15-20 the flight pose, looped). His facing is taken relative to the camera, so it holds in the
// behind-the-back view; while boosting he faces where he flies. No cyan halo over him on this road.
// Slashes: nbsSlash(dur,u0) plays the swing from u0 (0 = wind-up) over dur seconds; nbStrike plays its second half.
// =====================================================================
const NBS={img:null,ok:false,cv:null,c:null,tex:null,geo:null,nb:null,key:'',slashA:null,slashD:.36,slashU:0,boostT:0,bdir:null,CW:168,CH:168,SL:12,BO:8};
(function(){ try{ const im=new Image(); im.onload=()=>{ NBS.ok=true; }; im.src='img/nathan/nathan.png'; NBS.img=im; }catch(e){} })();
function nbsOn(){ return NBS.ok&&typeof NB!=='undefined'&&NB&&NB.mesh&&ALI(); }
function nbsSlash(dur,u0){ NBS.slashA=Game.time; NBS.slashD=Math.max(.05,dur); NBS.slashU=u0||0; }
// his facing on the sheet: toward Ali (or where he flies while boosting), measured from the camera's side of him
function nbsDir(){ const P=Player, cp=camera.position, a=NBS.boostT>0&&NBS.bdir!=null?NBS.bdir:Math.atan2(P.z-NB.z,P.x-NB.x), ca=Math.atan2(cp.z-NB.z,cp.x-NB.x);
  return ((Math.round(-(a-ca)/(Math.PI/4))%8)+8)%8; }
function nbsRow(){ if(NBS.slashA!=null){ const u=NBS.slashU+(Game.time-NBS.slashA)/NBS.slashD*(1-NBS.slashU); if(u>=0&&u<1) return 1+Math.min(NBS.SL-1,Math.floor(u*NBS.SL)); NBS.slashA=null; }
  if(NBS.boostT>0||NB.dsh) return 15+(Math.floor(Game.time*14)%6);
  return 0; }
function nbsInit(){ if(!NBS.cv){ NBS.cv=document.createElement('canvas'); NBS.cv.width=NBS.CW; NBS.cv.height=NBS.CH; NBS.c=NBS.cv.getContext('2d'); NBS.c.imageSmoothingEnabled=false;
    const t=new THREE.CanvasTexture(NBS.cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.encoding=THREE.sRGBEncoding; NBS.tex=t;
    // the body 4.4 units feet to head (110 px of art), feet 29 px above the cell's bottom
    const k=4.4/110, w=NBS.CW*k, h=NBS.CH*k; NBS.geo=new THREE.PlaneGeometry(w,h); NBS.geo.translate(0,h/2-29*k,0); }
  NB.mat.map=NBS.tex; NB.mat.needsUpdate=true; NB.mesh.geometry=NBS.geo; NBS.nb=NB; NBS.key=''; }
function nbsDraw(dt){ if(NBS.nb!==NB) nbsInit(); NBS.boostT=Math.max(0,NBS.boostT-dt); if(NB.dsh) NBS.bdir=Math.atan2(NB.dsh.tz-NB.dsh.fz,NB.dsh.tx-NB.dsh.fx);
  const d=nbsDir(), r=nbsRow(), key=d+','+r; NB.mesh.scale.x=1; if(NB.glow) NB.glow.visible=false;
  if(NB.stunned){ NB.mesh.position.x+=rnd(-.06,.06); NB.mesh.position.y+=rnd(-.04,.04); } /* staggered: he shudders */
  if(key!==NBS.key){ NBS.key=key; NBS.c.clearRect(0,0,NBS.CW,NBS.CH); NBS.c.drawImage(NBS.img,d*NBS.CW,r*NBS.CH,NBS.CW,NBS.CH,0,0,NBS.CW,NBS.CH); NBS.tex.needsUpdate=true; } }
(function(){ const ds=drawSprites; drawSprites=function(){ const r=ds.apply(this,arguments); try{ if(nbsOn()) nbsDraw(1/60); }catch(e){ console.error('nathan sprite',e); } return r; }; })();
// the slash frames on every strike (the follow-through half), the flight pose on every quickboost
(function(){ const ns=nbStrike; nbStrike=function(){ if(NBS.slashA==null) nbsSlash(.36,.5); return ns.apply(this,arguments); }; })();
(function(){ const nb=nbBoost; nbBoost=function(){ NBS.boostT=Math.max(NBS.boostT,.3); return nb.apply(this,arguments); }; })();
// afterimages: a still of the current frame instead of the old art
(function(){ const na=nbAfterimage; nbAfterimage=function(){ const r=na.apply(this,arguments); try{ if(nbsOn()&&NBS.cv&&NBG.length){ const g=NBG[NBG.length-1].m, cv=document.createElement('canvas'); cv.width=NBS.CW; cv.height=NBS.CH;
      cv.getContext('2d').drawImage(NBS.cv,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; g.material.map=t; g.material.needsUpdate=true; g.scale.x=1; } }catch(e){} return r; }; })();
