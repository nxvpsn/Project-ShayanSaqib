// =====================================================================
// NATHAN ON FOOT (phase III of Ali's road): once the armour is purged he is the pilot himself, not the mech sheet. The
// cast's Nathan (drawNathanCast, flight suit, no jacket, the scarf) is drawn with fight poses into his own canvas: standing
// with the laser sword low and the pistol in the off hand, the slash (driven by the same nbsSlash clock as the mech's),
// the pistol levelled (fixRow 13), the low iai/stance crouch (2), the sword raised (3), the open grabbing hand (4), the
// run (boosts) and the stagger. He faces Ali left/right on screen. NP1.human switches it (set by the purge in npCine23
// and by npSetPhase for phase III; off in phases I-II and on reset).
// =====================================================================
const NBH={cv:null,c:null,tex:null,geo:null,W:112,H:80,f:1,key:'',K:1.5};
function nbhOn(){ return typeof nbsOn==='function'&&nbsOn()&&typeof NP1!=='undefined'&&!!NP1.human; }
function nbhInit(){ NBH.cv=document.createElement('canvas'); NBH.cv.width=NBH.W; NBH.cv.height=NBH.H; NBH.c=NBH.cv.getContext('2d'); NBH.c.imageSmoothingEnabled=false;
  const t=new THREE.CanvasTexture(NBH.cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.encoding=THREE.sRGBEncoding; NBH.tex=t;
  const u=PPU/NBH.K, w=NBH.W/u, h=NBH.H/u; NBH.geo=new THREE.PlaneGeometry(w,h); NBH.geo.translate(0,h/2-2/u,0); }
// the pose for his state: {pose (cRig overrides), blade (angle: 0 down, + forward, PI up; null = no sword in hand), gun}
function nbhPose(r,stun,fix){ const t=NBS.clock; /* fix: r is a held pose (NBS.fixRow), not a slash frame */
  if(stun) return {pose:{F:[[-5,0],[2,0]],b:-2,lean:3,ua:[.5,.7],el:[.3,.4],hd:3,hx:1},blade:.25,gun:1};
  if(!fix&&r>=1&&r<=12){ const u=(r-1)/11, e=u<.35?0:Math.min(1,(u-.35)/.4), A=2.9-2.7*e*e*(3-2*e); return {pose:{b:-5,lean:Math.round(1+e*4),F:[[-5,0],[5,-1]],ua:[-1,A],el:[.5,.15],hd:0,hx:Math.round(e*2)},blade:A+.2,gun:1,trail:e>0&&e<1}; }
  if(fix&&r===13) return {pose:{b:-5,lean:1,F:[[-4,0],[4,0]],ua:[1.5,-.5],el:[.06,-.5],hd:0,hx:0},blade:-.9,gun:1,aim:1};
  if(fix&&r===2) return {pose:{b:-2,lean:4,F:[[-7,0],[5,0]],ua:[.4,-1.1],el:[.9,-.7],hd:1,hx:2},blade:-.75,gun:1};
  if(fix&&r===3) return {pose:{b:-6,lean:0,F:[[-3,0],[4,0]],ua:[-.6,2.95],el:[.5,.1],hd:-1,hx:0},blade:3.05,gun:1};
  if(fix&&r===4) return {pose:{b:-5,lean:3,F:[[-5,0],[5,-1]],ua:[-.8,2.1],el:[.4,.35],hd:0,hx:1},blade:null,gun:0,hand:1};
  if(!fix&&r>=13){ const k=Math.floor(t*14)%2; return {pose:{b:-4,lean:6,F:k?[[-8,-3],[5,0]]:[[-2,0],[8,-4]],ua:[-1.3,-1.1],el:[-.3,-.4],hd:1,hx:3},blade:-1.4,gun:1}; }
  return {pose:{ua:[-.25,.55+Math.sin(t*1.1)*.06],el:[.95,.75]},blade:2.25,gun:1}; }
function nbhDraw(){ if(!NBH.cv) nbhInit(); const P=Player, c=NBH.c, r=nbsRow();
  try{ const rt=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion), boost=(NBS.boostT>0||NB.dsh)&&NBS.bdir!=null, dx=boost?Math.cos(NBS.bdir):P.x-NB.x, dz=boost?Math.sin(NBS.bdir):P.z-NB.z, sd=rt.x*dx+rt.z*dz; if(Math.abs(sd)>.25) NBH.f=sd>0?1:-1; }catch(e){}
  if(NB.mat.map!==NBH.tex){ NB.mat.map=NBH.tex; NB.mat.needsUpdate=true; } if(NB.mesh.geometry!==NBH.geo) NB.mesh.geometry=NBH.geo; NB.mesh.scale.x=1; if(NB.glow) NB.glow.visible=false; NBS.key='';
  try{ if(NB.mat.color.getHex()===0xffb4b0) NB.mat.color.setHex(0xffffff); }catch(e){} /* phase III tints the mech pink: the pilot keeps his own colours */
  try{ const gy=groundY(NB.x,NB.z); if(NP1.alt==null&&NB.y-gy<1) NB.mesh.position.y=gy; if(NB.sh) NB.sh.scale.set(.5,.5,1); }catch(e){} /* feet on the ground, no hover bob */
  if(NB.stunned){ NB.mesh.position.x+=rnd(-.03,.03); }
  const idle=r===0&&!NB.stunned, key=NBH.f+','+r+(NBS.fixRow!=null?'f':'')+','+(NB.stunned?1:0)+','+(idle||r>=13?Math.floor(NBS.clock*10):0)+','+(NB.flash>0?1:0); if(key===NBH.key) return; NBH.key=key;
  c.clearRect(0,0,NBH.W,NBH.H); nbhPaint(c,NBH.W/2,NBH.H-2,NBH.f,nbhPose(r,NB.stunned,NBS.fixRow!=null),!idle,NB.flash>0);
  if(NB.flash>0){ c.globalCompositeOperation='source-atop'; c.fillStyle='rgba(255,255,255,.55)'; c.fillRect(0,0,NBH.W,NBH.H); c.globalCompositeOperation='source-over'; }
  NBH.tex.needsUpdate=true; }
function nbhPaint(c,cx,by,f,S,still,fire){ const out={}; drawNathanCast(c,cx,by,f,{t:NBS.clock,jacket:0,scarf:1,pose:S.pose,out,still});
  const J=out.J; if(!J) return; const p=SH(c,cx,by,f), g=J.A[0], h=J.A[1];
  if(S.gun){ const gx=Math.round(g.ex), gyy=Math.round(g.ey); if(S.aim){ p(gx,gyy-2,7,2,'#20222e'); p(gx,gyy,2,3,'#20222e'); p(gx+6,gyy-2,1,1,'#ffd27a'); if(fire){ p(gx+7,gyy-3,4,4,'#fff2c0'); p(gx+11,gyy-2,3,2,'#ffb04a'); } } else { p(gx-1,gyy,2,6,'#20222e'); p(gx-1,gyy,4,2,'#20222e'); } }
  if(S.blade!=null){ const hx=h.ex, hy=h.ey, sa=Math.sin(S.blade), ca=Math.cos(S.blade); p(Math.round(hx)-1,Math.round(hy)-1,3,3,'#c8d4e0');
    if(S.trail){ for(let k=1;k<=3;k++){ const a2=S.blade+k*.22, s2=Math.sin(a2), c2=Math.cos(a2); c.globalAlpha=.34-k*.08; for(let i=4;i<=19;i+=1) p(Math.round(hx+s2*i)-1,Math.round(hy+c2*i)-1,3,3,'#3ff4ff'); } c.globalAlpha=1; }
    for(let i=2;i<=19;i++) p(Math.round(hx+sa*i)-1,Math.round(hy+ca*i)-1,3,3,'#3ff4ff'); for(let i=2;i<=18;i++) p(Math.round(hx+sa*i),Math.round(hy+ca*i),1,1,'#ffffff'); }
  if(S.hand){ const x=Math.round(h.ex), y=Math.round(h.ey); p(x-1,y-3,4,4,'#d9a272'); p(x+2,y-4,1,2,'#d9a272'); p(x,y-5,1,2,'#d9a272'); } }
(function(){ const nd=nbsDraw; nbsDraw=function(dt){ if(nbhOn()){ NBS.boostT=Math.max(0,NBS.boostT-dt); if(NB.dsh) NBS.bdir=Math.atan2(NB.dsh.tz-NB.dsh.fz,NB.dsh.tx-NB.dsh.fx); nbhDraw(); return; } if(NB&&NB.sh&&NB.sh.scale.x!==1) NB.sh.scale.set(1,1,1); return nd.apply(this,arguments); }; })();
// afterimages: a still of the pilot, not of the mech
(function(){ const na=nbAfterimage; nbAfterimage=function(){ if(!(nbhOn()&&NBH.cv)) return na.apply(this,arguments); const cv=NBS.cv, w=NBS.CW, h=NBS.CH; NBS.cv=NBH.cv; NBS.CW=NBH.W; NBS.CH=NBH.H; try{ return na.apply(this,arguments); } finally{ NBS.cv=cv; NBS.CW=w; NBS.CH=h; } }; })();
(function(){ const sp=npSetPhase; npSetPhase=function(n){ const r=sp.apply(this,arguments); try{ NP1.human=n>=3?1:0; NBS.key=''; NBH.key=''; }catch(e){} return r; }; })();
(function(){ const nr=np1Reset; np1Reset=function(){ NP1.human=0; return nr.apply(this,arguments); }; })();
// ---------- a dropped move still cleans up ----------
// np1Stun, the Full Counter, a phase change and the ultimate drop his move by nulling NP1.gen. A generator dropped that way
// never runs its `finally`, so whatever the move had set stayed: the iai's grey screen, the stance's gold ring, a held pose
// (the sprite frozen with the pistol up), a limit cut's invulnerability. The move that was running last frame and is no
// longer the current one is closed here (return() runs its finally blocks; on a finished generator it does nothing).
(function(){ const nu=np1Update; np1Update=function(dt){ try{ const g=NP1._g; if(g&&g!==NP1.gen){ NP1._g=null; try{ g.return(); }catch(e){} if(!NP1.gen&&typeof NBS!=='undefined'&&NBS.fixRow!=null&&!NP1.seq&&!NP1.ex) NBS.fixRow=null; } }catch(e){ console.error('np drop',e); }
    const r=nu.apply(this,arguments); NP1._g=NP1.gen; return r; }; })();
(function(){ const nc=np1Clear; np1Clear=function(){ const g=NP1._g; NP1._g=null; if(g&&g!==NP1.gen){ try{ g.return(); }catch(e){} } return nc.apply(this,arguments); }; })();
// a held pose never outlives its move (some paths left the grabbing hand or the pistol up between moves)
(function(){ const nu=np1Update; np1Update=function(dt){ const r=nu.apply(this,arguments); try{ if(!NP1.gen&&!NP1.seq&&!NP1.ex&&typeof NBS!=='undefined'&&NBS.fixRow!=null) NBS.fixRow=null; }catch(e){} return r; }; })();
// the Full Counter and the ultimate keep for after a limit cut: firing either inside one dropped the whole limit cut
(function(){ const mj=twMiniJC; twMiniJC=function(){ try{ if(typeof np1On==='function'&&np1On()&&NB&&NB.alive&&!NP1.done&&(NP1.lcInv||NP1.cur==='lc')){ if(Game.time-(NP1.fcNoT||-9)>1.2){ NP1.fcNoT=Game.time; Game.dmgNums.push({x:Player.x,y:Player.y+2.6,z:Player.z,n:'NOT DURING A LIMIT CUT',t:0,col:'#ffd45a'}); } return; } }catch(e){} return mj.apply(this,arguments); }; })();
(function(){ const ok=npUltOk; npUltOk=function(){ return ok.apply(this,arguments)&&!(NP1.lcInv||NP1.cur==='lc'); }; })();
// on foot there are no thrusters: no jets behind him, and his dash is a footstep rush, not a rocket
(function(){ const vf=npVfxFrame; npVfxFrame=function(dt){ const r=vf.apply(this,arguments); try{ if(NP1.human&&NPV.jets) NPV.jets.forEach(j=>j.visible=false); }catch(e){} return r; }; })();
(function(){ const q=TW_SFX.qbRoar; TW_SFX.qbRoar=function(){ if(typeof NP1!=='undefined'&&NP1.human){ Sound.hiss(2600,.12,.16,'bandpass'); Sound.tone('triangle',220,90,.1,.08); return; } return q.apply(this,arguments); }; })();
