// =====================================================================
// CHARACTER SHADING (v1.68): every sprite drawn through Sprite3D except Shayan and Ali (their own sheets) gets volume in
// the same pass that draws its outline: a lit edge on top and on the left (the low sun), a cooler, darker edge underneath
// and on the right, and a soft second step inside both. Flat-coloured limbs read as round. The mech Nathan is not a
// Sprite3D and is untouched. This shades the existing art; it does not redraw it. localStorage 'msb_sp'='0' turns it off.
// =====================================================================
const VHS={on:1,skip:0};
(function(){ try{ if(typeof localStorage!=='undefined'&&localStorage.getItem('msb_sp')==='0') VHS.on=0; }catch(e){} })();
function vhsPass(c,w,h,col){ const id=c.getImageData(0,0,w,h); id.data.set(vhsData(id.data,w,h,col)); c.putImageData(id,0,0); }
function vhsData(d,w,h,col){ const n=w*h, A=new Uint8Array(n); for(let i=0;i<n;i++) A[i]=d[i*4+3]>40?1:0; const o=new Uint8ClampedArray(d), [r,g,b]=col;
  const op=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&A[y*w+x]===1;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const i=(y*w+x)*4;
    if(!A[y*w+x]){ if(op(x+1,y)||op(x-1,y)||op(x,y+1)||op(x,y-1)){ o[i]=r; o[i+1]=g; o[i+2]=b; o[i+3]=255; } continue; }
    let f=0; if(!op(x,y-1)) f+=.2; else if(!op(x,y-2)) f+=.07; if(!op(x-1,y)) f+=.09;
    let k=0; if(!op(x,y+1)) k+=.22; else if(!op(x,y+2)) k+=.08; if(!op(x+1,y)) k+=.12;
    if(f>0&&k===0){ o[i]=d[i]+(255-d[i])*f; o[i+1]=d[i+1]+(250-d[i+1])*f*.92; o[i+2]=d[i+2]+(225-d[i+2])*f*.8; }
    else if(k>0&&f===0){ o[i]=d[i]*(1-k); o[i+1]=d[i+1]*(1-k*1.05); o[i+2]=Math.min(255,d[i+2]*(1-k*.8)+6); } }
  return o; }
(function(){ const dr=Sprite3D.prototype.draw; Sprite3D.prototype.draw=function(fn,outline){ if(!VHS.on||outline===false||(typeof pSprite!=='undefined'&&this===pSprite)) return dr.apply(this,arguments);
    this.c.clearRect(0,0,this.w,this.h); VHS.skip=0; fn(this.c,this.w/2,this.h-2); try{ if(VHS.skip) outlinePass(this.c,this.w,this.h,OUT); else vhsPass(this.c,this.w,this.h,OUT); }catch(e){ try{ outlinePass(this.c,this.w,this.h,OUT); }catch(e2){} } this.t.needsUpdate=true; }; })();
// Shayan and Ali wherever they are drawn (the player, the ally, co-op, cutscene doubles) keep their sheets as they are
(function(){ const a=drawAliHD; drawAliHD=function(){ VHS.skip=1; return a.apply(this,arguments); }; })();
(function(){ const a=drawShayanHD; drawShayanHD=function(){ VHS.skip=1; return a.apply(this,arguments); }; })();
