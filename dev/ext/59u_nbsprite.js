// =====================================================================
// NATHAN IN 8 DIRECTIONS (Ali's road only; Shayan's Oddities and the mech fight keep the original art).
// img/nathan/nathan.png: the white mech with the cyan laser sword, 168px cells, columns = facings S,SE,E,NE,N,NW,W,SW,
// rows: 0 = standing, 1-12 = the laser-sword slash (the blade trail peaks around row 7), 13-20 = the thruster boost
// (13-14 lift-off, 15-20 the flight pose, looped). His facing is taken relative to the camera, so it holds in the
// behind-the-back view; while boosting he faces where he flies. No cyan halo over him on this road.
// Slashes: nbsSlash(dur,u0) plays the swing from u0 (0 = wind-up) over dur seconds; nbStrike plays its second half.
// =====================================================================
const NBS={img:null,ok:false,cv:null,c:null,tex:null,geo:null,nb:null,key:'',slashA:null,slashD:.36,slashU:0,clock:0,fixRow:null,boostT:0,boostA:-9,lastGhost:-9,bdir:null,CW:168,CH:168,SL:12,BO:8};
(function(){ try{ const im=new Image(); im.onload=()=>{ NBS.ok=true; }; im.src='img/nathan/nathan.png?v=2'; /* ?v: the old sheet had another layout; never draw it from a cache */ NBS.img=im; }catch(e){} })();
function nbsOn(){ return NBS.ok&&typeof NB!=='undefined'&&NB&&NB.mesh&&ALI(); }
// his animations run on the world clock (NBS.clock: game time as his attacks see it, so slow-mo and hit-stop pause it too)
function nbsSlash(dur,u0){ NBS.slashA=NBS.clock; NBS.slashD=Math.max(.05,dur); NBS.slashU=u0||0; }
// his facing on the sheet: toward Ali (or where he flies while boosting), measured from the camera's side of him
function nbsDir(){ const P=Player, cp=camera.position, a=NBS.boostT>0&&NBS.bdir!=null?NBS.bdir:Math.atan2(P.z-NB.z,P.x-NB.x), ca=Math.atan2(cp.z-NB.z,cp.x-NB.x);
  return ((Math.round(-(a-ca)/(Math.PI/4))%8)+8)%8; }
function nbsRow(){ if(NBS.fixRow!=null) return NBS.fixRow; if(NBS.slashA!=null){ const u=NBS.slashU+(NBS.clock-NBS.slashA)/NBS.slashD*(1-NBS.slashU); if(u>=0&&u<1) return 1+Math.min(NBS.SL-1,Math.floor(u*NBS.SL)); NBS.slashA=null; }
  if(NBS.boostT>0||NB.dsh) return NBS.clock-NBS.boostA<.07?13+Math.min(1,Math.floor((NBS.clock-NBS.boostA)/.035)):15+(Math.floor(NBS.clock*14)%6); /* lift-off, then the flight pose */
  return 0; }
function nbsInit(){ if(!NBS.cv){ NBS.cv=document.createElement('canvas'); NBS.cv.width=NBS.CW; NBS.cv.height=NBS.CH; NBS.c=NBS.cv.getContext('2d'); NBS.c.imageSmoothingEnabled=false;
    const t=new THREE.CanvasTexture(NBS.cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.encoding=THREE.sRGBEncoding; NBS.tex=t;
    // the body 4.4 units feet to head (110 px of art), feet 29 px above the cell's bottom
    const k=4.4/110, w=NBS.CW*k, h=NBS.CH*k; NBS.geo=new THREE.PlaneGeometry(w,h); NBS.geo.translate(0,h/2-29*k,0); }
  NB.mat.map=NBS.tex; NB.mat.needsUpdate=true; NB.mesh.geometry=NBS.geo; NBS.nb=NB; NBS.key=''; }
function nbsDraw(dt){ if(NBS.nb!==NB) nbsInit(); if(NB.mat.map!==NBS.tex){ NB.mat.map=NBS.tex; NB.mat.needsUpdate=true; } if(NB.mesh.geometry!==NBS.geo) NB.mesh.geometry=NBS.geo; /* the base re-applies the old mech texture every frame */ NBS.boostT=Math.max(0,NBS.boostT-dt); if(NB.dsh) NBS.bdir=Math.atan2(NB.dsh.tz-NB.dsh.fz,NB.dsh.tx-NB.dsh.fx);
  const d=nbsDir(), r=nbsRow(), key=d+','+r; NB.mesh.scale.x=1; if(NB.glow) NB.glow.visible=false;
  if(NB.stunned){ NB.mesh.position.x+=rnd(-.06,.06); NB.mesh.position.y+=rnd(-.04,.04); } /* staggered: he shudders */
  if(key!==NBS.key){ NBS.key=key; NBS.c.clearRect(0,0,NBS.CW,NBS.CH); NBS.c.drawImage(NBS.img,d*NBS.CW,r*NBS.CH,NBS.CW,NBS.CH,0,0,NBS.CW,NBS.CH); NBS.tex.needsUpdate=true; } }
// the flight drawn with a smooth thrust curve (the base eases out hard: a third of the way in the first frame looked like a blink)
(function(){ const un=updateNB; updateNB=function(dt){ NBS.clock+=dt; const r=un.apply(this,arguments); try{ const D=NB&&NB.dsh; if(D&&nbsOn()){ const u=Math.min(1,D.t/D.d), e=u*u*(3-2*u), x=lerp(D.fx,D.tx,e), z=lerp(D.fz,D.tz,e);
      NB.mesh.position.x=x; NB.mesh.position.z=z; NB.sh.position.x=x; NB.sh.position.z=z; } }catch(e){ console.error('nb flight',e); } return r; }; })();
(function(){ const ds=drawSprites; drawSprites=function(){ const r=ds.apply(this,arguments); try{ if(nbsOn()) nbsDraw(1/60); }catch(e){ console.error('nathan sprite',e); } return r; }; })();
// the slash frames on every strike (the follow-through half), the flight pose on every quickboost
(function(){ const ns=nbStrike; nbStrike=function(){ if(NBS.slashA==null) nbsSlash(.36,.5); return ns.apply(this,arguments); }; })();
// on Ali's road a quickboost is a visible flight (about 30 units/s, 0.12-0.3s), not a blink, with a thruster roar
TW_SFX.qbRoar=function(){ Sound.hiss(1400,.26,.3,'bandpass'); Sound.hiss(5200,.12,.12,'highpass'); Sound.tone('sawtooth',140,46,.24,.16); };
(function(){ const nb=nbBoost; nbBoost=function(){ const r=nb.apply(this,arguments);
    try{ if(nbsOn()){ const D=NB.dsh; let dur=.3; if(D){ D.d=clamp(Math.hypot(D.tx-D.fx,D.tz-D.fz)/30,.12,.3); dur=D.d+.12; NBS.bdir=Math.atan2(D.tz-D.fz,D.tx-D.fx); } if(NBS.boostT<=0) NBS.boostA=NBS.clock; NBS.boostT=Math.max(NBS.boostT,dur); Sound.sfx('qbRoar'); } else NBS.boostT=Math.max(NBS.boostT,.3); }catch(e){ console.error('nb boost',e); }
    return r; }; })();
// afterimages: a still of the current frame instead of the old art
(function(){ const na=nbAfterimage; nbAfterimage=function(){ if(nbsOn()){ if(Game.time-NBS.lastGhost<.035) return; NBS.lastGhost=Game.time; } /* a thinner trail over the longer flights */ const r=na.apply(this,arguments); try{ if(nbsOn()&&NBS.cv&&NBG.length){ const g=NBG[NBG.length-1].m, cv=document.createElement('canvas'); cv.width=NBS.CW; cv.height=NBS.CH;
      cv.getContext('2d').drawImage(NBS.cv,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; g.material.map=t; g.material.needsUpdate=true; g.scale.x=1; } }catch(e){} return r; }; })();
