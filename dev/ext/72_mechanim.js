// =====================================================================
// NATHAN'S MECH, ANIMATED (the pixel art itself is unchanged)
// MECH_PNG is split once into layers: the cyan energy wings, the cyan lights and blade, the head, and the rest.
// Every frame they are recomposed onto a canvas that MECHTEX now shows (Nathan the boss, the mech-fight Nathan and
// their afterimages all use that texture): the mech breathes, the head bobs a pixel, the wings flicker, pulse and
// spit sparks, the lights throb, and he leans into his slashes with the blade flaring white.
// =====================================================================
const MA={ok:false,cv:null,c:null,L:{},t:0};
function maInit(){ if(MA.ok||MA.bad||!MECHTEX||!MECHTEX.image||!MECHTEX.image.width) return; try{
    const img=MECHTEX.image, W=img.width, H=img.height, mk=()=>{ const cv=document.createElement('canvas'); cv.width=W; cv.height=H; return cv; };
    const src=mk(), sc=src.getContext('2d'); sc.drawImage(img,0,0); const d=sc.getImageData(0,0,W,H).data; if(!d||d.length!==W*H*4){ MA.bad=1; return; }
    const lay={}, ids={}; for(const k of ['base','wing','glow','head']){ lay[k]=mk(); ids[k]=lay[k].getContext('2d').createImageData(W,H); }
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]<20) continue; const r=d[i], g=d[i+1], b=d[i+2];
      const cyan=b>170&&g>160&&r<g-30, blade=x>W*.7&&y>H*.55, head=x>W*.56&&x<W*.685&&y>H*.17&&y<H*.355;
      const put=k=>{ const o=ids[k].data; o[i]=r; o[i+1]=g; o[i+2]=b; o[i+3]=d[i+3]; };
      if(cyan&&!blade&&!head&&(y<H*.5)&&(x<W*.56||x>W*.68||y<H*.17)) put('wing');
      else { put('base'); if(cyan) put('glow'); if(head&&!cyan) put('head'); } }
    for(const k in lay) lay[k].getContext('2d').putImageData(ids[k],0,0);
    MA.L=lay; MA.W=W; MA.H=H; MA.cv=mk(); MA.c=MA.cv.getContext('2d'); MA.c.imageSmoothingEnabled=false; MECHTEX.image=MA.cv; MECHTEX.needsUpdate=true; MA.ok=true; }catch(e){ MA.bad=1; } }
function maDraw(){ if(!MA.ok) return; const c=MA.c, L=MA.L, W=MA.W, H=MA.H, t=performance.now()/1000;
  const N=typeof NAT!=='undefined'?NAT:null, nb=typeof NB!=='undefined'&&NB&&NB.alive?NB:null;
  const atk=N&&N.atk?Math.sin(Math.min(1,N.atk.t/.3)*Math.PI):0, busy=nb&&nb.gen?1:0, rage=nb&&nb.red?1:0;
  c.clearRect(0,0,W,H);
  // body: breathing squash from the feet, a lean into slashes
  const br=(Math.sin(t*2.1)+1)/2, sh=Math.round(br*3), lean=atk*.07;
  c.save(); c.translate(W/2,H); c.rotate(lean); c.drawImage(L.base,-W/2,-H+sh,W,H-sh);
  // head bob
  const hx=Math.round(Math.sin(t*.9)), hy=Math.round(Math.sin(t*1.7))-Math.round(br*2); c.drawImage(L.head,-W/2+hx,-H+sh+hy,W,H-sh);
  // lights and blade throb (and flare on a slash)
  c.globalCompositeOperation='lighter'; c.globalAlpha=Math.min(1,.25+.25*Math.sin(t*6)+atk*.9+rage*.2); c.drawImage(L.glow,-W/2,-H+sh,W,H-sh);
  if(atk>.2){ c.globalAlpha=atk*.6; c.drawImage(L.glow,-W/2+2,-H+sh,W,H-sh); c.drawImage(L.glow,-W/2-2,-H+sh,W,H-sh); }
  c.restore();
  // energy wings: pulse from the back, flicker, jitter, an extra burning layer while attacking
  const ax=W*.62, ay=H*.3, ps=1+.035*Math.sin(t*5.3)+(busy||atk>.2?.04:0), jx=(MA.t++%3===0)?Math.round(rnd(-1,1)):MA.jx||0; MA.jx=jx;
  c.save(); c.globalAlpha=.78+.22*Math.random(); c.translate(ax+jx,ay+sh*.6); c.scale(ps,ps); c.drawImage(L.wing,-ax,-ay);
  if(busy||rage||atk>.2){ c.globalCompositeOperation='lighter'; c.globalAlpha=.25+.2*Math.random(); c.scale(1.05,1.05); c.drawImage(L.wing,-ax,-ay); }
  c.restore(); c.globalAlpha=1; c.globalCompositeOperation='source-over';
  MECHTEX.needsUpdate=true; }
// sparks shed from the wings in the world
function maSparks(){ const nb=typeof NB!=='undefined'&&NB&&NB.alive?NB:null; if(nb&&nb.mesh&&nb.mesh.visible&&Math.random()<.5){ const p=nb.mesh.position; FX.spawn(p.x-nb.face*rnd(.5,2),p.y+rnd(2,4.5),p.z+rnd(-.3,.3),-nb.face*rnd(.5,2),rnd(-.5,1),0,rnd(.3,.6),Math.random()<.5?0x3ff4ff:0xbff8ff,rnd(.12,.22),-1,true); } }
(function(){ const ds=drawSprites; drawSprites=function(){ const r=ds.apply(this,arguments); try{ if(MECHTEX){ maInit(); const on=(typeof NAT!=='undefined'&&NAT)||(typeof NB!=='undefined'&&NB&&NB.alive); if(on){ maDraw(); maSparks(); } } }catch(e){} return r; }; })();
