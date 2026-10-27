// Contact sheet of character sprites, rendered headless (no browser): node preview_cast.js ext.js OUT.png [filter]
// A fake 2D context rasterizes fillRect (all the pixel art uses it), the outline pass runs like Sprite3D.draw,
// and every cell is scaled 3x into one PNG. Edit CELLS below to choose poses.
const fs=require('fs'), zlib=require('zlib');
const H=require('./harness.js'); const R=H.run, C=H.ctx;
function parseCol(s){ s=String(s).trim(); let m;
  if(s[0]==='#'){ if(s.length===4) return [parseInt(s[1]+s[1],16),parseInt(s[2]+s[2],16),parseInt(s[3]+s[3],16),1]; return [parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16),1]; }
  if((m=s.match(/^rgba?\(([^)]+)\)/))){ const v=m[1].split(',').map(Number); return [v[0],v[1],v[2],v[3]==null?1:v[3]]; }
  if((m=s.match(/^hsla?\(([^)]+)\)/))){ const v=m[1].split(',').map(x=>parseFloat(x)); const h=v[0]/360,sat=v[1]/100,l=v[2]/100; const q=l<.5?l*(1+sat):l+sat-l*sat,p=2*l-q;
    const f=t=>{ t=(t%1+1)%1; return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p; }; return [f(h+1/3)*255,f(h)*255,f(h-1/3)*255,v[3]==null?1:v[3]]; }
  return [255,0,255,1]; }
function Ctx(w,h){ const d=new Uint8ClampedArray(w*h*4); let fs='#000', ga=1, M=[1,0,0,1,0,0], gco='source-over'; const st=[];
  const mul=(n)=>{ const [a,b,c,dd,e,f]=M; M=[a*n[0]+c*n[1],b*n[0]+dd*n[1],a*n[2]+c*n[3],b*n[2]+dd*n[3],a*n[4]+c*n[5]+e,b*n[4]+dd*n[5]+f]; };
  const self={canvas:{width:w,height:h},width:w,height:h,data:d,imageSmoothingEnabled:false,lineWidth:1,strokeStyle:'#000',font:'',textAlign:'left',
    get globalCompositeOperation(){ return gco; }, set globalCompositeOperation(v){ gco=v; },
    get fillStyle(){ return fs; }, set fillStyle(v){ fs=v; }, get globalAlpha(){ return ga; }, set globalAlpha(v){ ga=v; },
    fillRect(x,y,ww,hh){ const [r,g,b,a0]=parseCol(fs), a=a0*ga; if(ww<0){ x+=ww; ww=-ww; } if(hh<0){ y+=hh; hh=-hh; }
      const x0=Math.max(0,Math.round(x)), y0=Math.max(0,Math.round(y)), x1=Math.min(w,Math.round(x+ww)), y1=Math.min(h,Math.round(y+hh));
      for(let yy=y0;yy<y1;yy++) for(let xx=x0;xx<x1;xx++){ const i=(yy*w+xx)*4, da=d[i+3]/255; if(gco==='source-atop'){ if(!da) continue; d[i]=d[i]*(1-a)+r*a; d[i+1]=d[i+1]*(1-a)+g*a; d[i+2]=d[i+2]*(1-a)+b*a; continue; } const oa=a+da*(1-a); if(oa<=0) continue;
        d[i]=(r*a+d[i]*da*(1-a))/oa; d[i+1]=(g*a+d[i+1]*da*(1-a))/oa; d[i+2]=(b*a+d[i+2]*da*(1-a))/oa; d[i+3]=oa*255; } },
    clearRect(){ d.fill(0); }, save(){ st.push([fs,ga,M.slice(),gco]); }, restore(){ const s=st.pop(); if(s){ fs=s[0]; ga=s[1]; M=s[2]; gco=s[3]; } },
    // paths: only circles (arc) are filled; rect/clip/strokeRect are no-ops
    beginPath(){ self._p=[]; }, moveTo(){}, lineTo(){}, stroke(){}, rect(){}, clip(){}, strokeRect(){},
    arc(x,y,r){ (self._p=self._p||[]).push([x,y,r]); }, fill(){ const [a,b,c,dd,e,f]=M, k=Math.sqrt(Math.abs(a*dd-b*c)); for(const [x,y,r] of (self._p||[])){ const X=a*x+c*y+e, Y=b*x+dd*y+f, R=r*k; const m0=M; M=[1,0,0,1,0,0]; for(let yy=Math.floor(Y-R);yy<=Y+R;yy++){ const hw=Math.sqrt(Math.max(0,R*R-(yy+.5-Y)*(yy+.5-Y))); if(hw>0) self.fillRect(Math.round(X-hw),yy,Math.round(2*hw),1); } M=m0; } }, ellipse(){}, closePath(){}, fillText(){}, strokeText(){}, measureText(){ return {width:0}; },
    // drawImage with the current transform, nearest sampling; sources: another Ctx's canvas, or {rgba,width,height} (C.__imgs)
    drawImage(src,...q){ const S=src&&src.__ctx?{rgba:src.__ctx.data,width:src.width,height:src.height}:src; if(!S||!S.rgba) return; let sx=0,sy=0,sw=S.width,sh=S.height,dx,dy,dw,dh;
      if(q.length===2){ [dx,dy]=q; dw=sw; dh=sh; } else if(q.length===4){ [dx,dy,dw,dh]=q; } else { [sx,sy,sw,sh,dx,dy,dw,dh]=q; }
      const [a,b,c,dd,e,f]=M, det=a*dd-b*c; if(!det) return; const cr=[[dx,dy],[dx+dw,dy],[dx,dy+dh],[dx+dw,dy+dh]].map(([x,y])=>[a*x+c*y+e,b*x+dd*y+f]);
      const X0=Math.max(0,Math.floor(Math.min(...cr.map(p=>p[0])))), X1=Math.min(w,Math.ceil(Math.max(...cr.map(p=>p[0])))), Y0=Math.max(0,Math.floor(Math.min(...cr.map(p=>p[1])))), Y1=Math.min(h,Math.ceil(Math.max(...cr.map(p=>p[1]))));
      for(let Y=Y0;Y<Y1;Y++) for(let X=X0;X<X1;X++){ const px=X+.5-e, py=Y+.5-f, lx=(dd*px-c*py)/det, ly=(-b*px+a*py)/det; if(lx<dx||ly<dy||lx>=dx+dw||ly>=dy+dh) continue;
        const ix=Math.floor(sx+(lx-dx)/dw*sw), iy=Math.floor(sy+(ly-dy)/dh*sh); if(ix<0||iy<0||ix>=S.width||iy>=S.height) continue; const j=(iy*S.width+ix)*4, sa=S.rgba[j+3]/255*ga; if(sa<=0) continue;
        const i=(Y*w+X)*4, da=d[i+3]/255, oa=sa+da*(1-sa); for(let k=0;k<3;k++) d[i+k]=(S.rgba[j+k]*sa+d[i+k]*da*(1-sa))/oa; d[i+3]=oa*255; } },
    translate(x,y){ mul([1,0,0,1,x,y]); }, rotate(r){ const co=Math.cos(r), si=Math.sin(r); mul([co,si,-si,co,0,0]); }, scale(x,y){ mul([x,0,0,y,0,0]); }, setTransform(a,b,c,dd,e,f){ M=[a,b,c,dd,e,f]; },
    getImageData(){ return {data:new Uint8ClampedArray(d),width:w,height:h}; }, putImageData(id){ d.set(id.data); }, createLinearGradient(){ return {st:[],addColorStop(o,c){ this.st.push(c); },toString(){ return this.st[0]||'#000'; }}; }, createRadialGradient(){ return {st:[],addColorStop(o,c){ this.st.push(c); },toString(){ return this.st[0]||'#000'; }}; } };
  self.canvas.__ctx=self; self.canvas.getContext=()=>self; return self; }
C.__Ctx=Ctx;
// raw RGBA images for drawImage: IMG_RAW='name=file.rgba:w:h,...' (e.g. Ali's sheet, written by a script)
C.__imgs={}; for(const spec of (process.env.IMG_RAW||'').split(',').filter(Boolean)){ const [n,rest]=spec.split('='); const [f,iw,ih]=rest.split(':'); C.__imgs[n]={rgba:new Uint8ClampedArray(fs.readFileSync(f)),width:+iw,height:+ih}; }
function outline(d,w,h){ const o=new Uint8ClampedArray(d); for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const i=(y*w+x)*4; if(d[i+3]>40) continue; let n=false;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const xx=x+dx,yy=y+dy; if(xx<0||yy<0||xx>=w||yy>=h) continue; if(d[(yy*w+xx)*4+3]>40){ n=true; break; } }
    if(n){ o[i]=18; o[i+1]=12; o[i+2]=26; o[i+3]=255; } } d.set(o); }
function png(w,h,rgba){ const raw=Buffer.alloc((w*4+1)*h); for(let y=0;y<h;y++){ raw[y*(w*4+1)]=0; Buffer.from(rgba.buffer,y*w*4,w*4).copy(raw,y*(w*4+1)+1); }
  const crcT=[]; for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=c&1?0xedb88320^(c>>>1):c>>>1; crcT[n]=c>>>0; }
  const crc=b=>{ let c=0xffffffff; for(const x of b) c=crcT[(c^x)&255]^(c>>>8); return (c^0xffffffff)>>>0; };
  const chunk=(t,b)=>{ const L=Buffer.alloc(4); L.writeUInt32BE(b.length); const tb=Buffer.concat([Buffer.from(t),b]); const cb=Buffer.alloc(4); cb.writeUInt32BE(crc(tb)); return Buffer.concat([L,tb,cb]); };
  const ih=Buffer.alloc(13); ih.writeUInt32BE(w,0); ih.writeUInt32BE(h,4); ih[8]=8; ih[9]=6; ih[10]=0; ih[11]=0; ih[12]=0;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]); }
// cells: [label, canvas w, canvas h, js expression drawing with (c,cx,by)]
const CELLS=JSON.parse(process.env.CELLS||'null')||require('./preview_cells.js');
const OUTP=process.argv[3]||'preview.png', filt=process.argv[4]||''; const cells=CELLS.filter(x=>!filt||x[0].includes(filt));
const SC=+(process.env.SC||3), cols=Math.min(8,cells.length), cw=Math.max(...cells.map(x=>x[1])), ch=Math.max(...cells.map(x=>x[2])), rows=Math.ceil(cells.length/cols);
const W=cols*cw*SC, Hh=rows*ch*SC, out=new Uint8ClampedArray(W*Hh*4);
for(let i=0;i<W*Hh;i++){ const x=i%W, y=Math.floor(i/W), k=((x>>3)+(y>>3))&1; out[i*4]=k?70:58; out[i*4+1]=k?78:66; out[i*4+2]=k?70:58; out[i*4+3]=255; }
cells.forEach(([lab,w,h,expr],n)=>{ const c=Ctx(w,h); C.__c=c; try{ R(`(function(c,cx,by){ ${expr} })(__c,${w/2},${h-2});`); outline(c.data,w,h); }catch(e){ console.log('ERR',lab,e.message); }
  const ox=(n%cols)*cw*SC+Math.floor((cw-w)/2)*SC, oy=Math.floor(n/cols)*ch*SC+(ch-h)*SC;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const i=(y*w+x)*4, a=c.data[i+3]/255; if(!a) continue;
    for(let sy=0;sy<SC;sy++) for(let sx=0;sx<SC;sx++){ const j=((oy+y*SC+sy)*W+ox+x*SC+sx)*4; for(let q=0;q<3;q++) out[j+q]=out[j+q]*(1-a)+c.data[i+q]*a; } } });
fs.writeFileSync(OUTP,png(W,Hh,out)); console.log('wrote',OUTP,W+'x'+Hh,cells.map(c=>c[0]).join(' | '));
