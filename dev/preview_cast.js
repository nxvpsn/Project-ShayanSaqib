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
function Ctx(w,h){ const d=new Uint8ClampedArray(w*h*4); let fs='#000', ga=1; const st=[];
  const self={canvas:{width:w,height:h},width:w,height:h,data:d,imageSmoothingEnabled:false,lineWidth:1,strokeStyle:'#000',font:'',textAlign:'left',globalCompositeOperation:'source-over',
    get fillStyle(){ return fs; }, set fillStyle(v){ fs=v; }, get globalAlpha(){ return ga; }, set globalAlpha(v){ ga=v; },
    fillRect(x,y,ww,hh){ const [r,g,b,a0]=parseCol(fs), a=a0*ga; if(ww<0){ x+=ww; ww=-ww; } if(hh<0){ y+=hh; hh=-hh; }
      const x0=Math.max(0,Math.round(x)), y0=Math.max(0,Math.round(y)), x1=Math.min(w,Math.round(x+ww)), y1=Math.min(h,Math.round(y+hh));
      for(let yy=y0;yy<y1;yy++) for(let xx=x0;xx<x1;xx++){ const i=(yy*w+xx)*4, da=d[i+3]/255, oa=a+da*(1-a); if(oa<=0) continue;
        d[i]=(r*a+d[i]*da*(1-a))/oa; d[i+1]=(g*a+d[i+1]*da*(1-a))/oa; d[i+2]=(b*a+d[i+2]*da*(1-a))/oa; d[i+3]=oa*255; } },
    clearRect(){ d.fill(0); }, save(){ st.push([fs,ga]); }, restore(){ const s=st.pop(); if(s){ fs=s[0]; ga=s[1]; } },
    beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, fill(){}, arc(){}, ellipse(){}, closePath(){}, fillText(){}, strokeText(){}, measureText(){ return {width:0}; }, drawImage(){}, translate(){}, rotate(){}, scale(){}, setTransform(){},
    getImageData(){ return {data:new Uint8ClampedArray(d),width:w,height:h}; }, putImageData(id){ d.set(id.data); }, createLinearGradient(){ return {addColorStop(){}}; }, createRadialGradient(){ return {addColorStop(){}}; } };
  return self; }
C.__Ctx=Ctx;
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
