#!/usr/bin/env node
// Playtest rig: the real game in headless Chromium, driven by a scenario file. Three ways to look, cheapest first:
//   probe  : numbers read out of the running game every few frames (camera, what is visible, HP, leftovers). Text only.
//   strip  : N frames of a cutscene or attack tiled into ONE labelled image (motion and camera for the price of one shot).
//   shot   : a single full-size frame.
// Time is stepped (1/60 per frame, rendering stubbed between looks), and a look renders exactly one more 1/60 frame, so
// what is on the image is what the game state says. Same owner rule as shot.js: images only with "use screenshot method".
//
//   node play.js scenario.js [--size 960x540] [--out dir]
// scenario.js:  module.exports=async function(g){ await g.warp('sh_omar'); await g.ev("..."); await g.run(2);
//                 const rows=await g.probe("({m:FX.flash,cam:[camera.position.x,camera.position.y]})",3,.25);
//                 await g.strip('moon',9,.5); await g.shot('end'); };
// g.ev(js) g.run(sec) g.until(cond,maxSec) g.probe(js,sec,every) g.shot(name) g.strip(name,n,every,{cols,cell}) g.film(name,{until,every,max,min}) g.warp(id)
// g.log(...) ; dialogue is clicked through automatically while running (g.auto=false stops that).
const fs=require('fs'), path=require('path'), http=require('http'), cp=require('child_process');
const args=process.argv.slice(2), opt=(k,d)=>{ const i=args.indexOf('--'+k); return i>=0?args[i+1]:d; };
const scen=path.resolve(args[0]||''), size=opt('size','960x540').split('x').map(Number), OUT=path.resolve(opt('out',path.dirname(scen)));
const ROOT=path.resolve(__dirname,'..'), MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.mp3':'audio/mpeg','.json':'application/json','.css':'text/css','.jpg':'image/jpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
(async()=>{
  const srv=http.createServer((q,r)=>{ const p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0])); if(!p.startsWith(ROOT)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){ r.writeHead(404); r.end(); return; } r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
  await new Promise(res=>srv.listen(0,'127.0.0.1',res)); const port=srv.address().port;
  const { chromium }=require('playwright'); const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
  const page=await browser.newPage({viewport:{width:size[0],height:size[1]}}); page.setDefaultTimeout(300000); const errs=[];
  const CACHE=path.join(__dirname,'.cdn_cache'); fs.mkdirSync(CACHE,{recursive:true});
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,async route=>{ const u=route.request().url(); if(/fonts\.(googleapis|gstatic)\.com/.test(u)){ return route.fulfill({status:200,contentType:'text/css',body:''}); }
    const m=u.match(/\/npm\/three@0\.147\.0\/(.+)$/), f=m&&fs.existsSync(path.join(CACHE,'three/package',m[1]))?path.join(CACHE,'three/package',m[1]):path.join(CACHE,u.replace(/[^a-zA-Z0-9.@-]+/g,'_')); if(!fs.existsSync(f)||!fs.statSync(f).size){ try{ cp.execFileSync('curl',['-sS','-L','--max-time','60','-o',f,u]); }catch(e){ console.log('cdn miss',u); return route.abort(); } }
    route.fulfill({status:200,contentType:u.endsWith('.js')?'text/javascript':'application/octet-stream',body:fs.readFileSync(f)}); });
  page.on('pageerror',e=>errs.push(String(e))); page.on('response',r=>{ try{ if(r.status()>=400) errs.push('HTTP '+r.status()+' '+r.url().replace(/^https?:\/\/127\.0\.0\.1:\d+/,'')); }catch(e){} }); page.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/index.html`,{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>typeof Game!=='undefined'&&typeof loop==='function',null,{timeout:120000});
  const g={auto:true,errs}; g.ev=js=>page.evaluate(js); g.log=(...a)=>console.log(...a);
  // stop the real loop for good: from here on only stepped frames run
  await page.evaluate(()=>{ window.__raf=window.requestAnimationFrame.bind(window); window.requestAnimationFrame=()=>0;
    window.__step=function(n,auto,probe,every){ const cr=composer.render, rows=[]; composer.render=()=>{}; let pf=null; if(probe) pf=new Function('return ('+probe+');');
      try{ for(let i=0;i<n;i++){ if(auto&&Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; }
          if(auto&&i%4===0){ try{ if(Game.clash||(TW&&TW.mash)||(typeof NBC!=='undefined'&&NBC&&!NBC.res)) hit.attack=true; }catch(e){} } /* clashes need mashing to end */
          loop(last+1000/60); if(pf&&i%every===0){ let v; try{ v=pf(); }catch(e){ v='ERR '+e.message; } rows.push([+Game.time.toFixed(2),v]); } } } finally{ composer.render=cr; }
      return rows; };
    window.__frame=function(){ return new Promise(res=>window.__raf(()=>{ loop(last+1000/60); window.__raf(()=>res(Game.time)); })); }; });
  g.run=async s=>{ let n=Math.max(1,Math.round(s*60)); while(n>0){ const k=Math.min(n,600); await page.evaluate(([k,a])=>{ window.__step(k,a); },[k,g.auto]); n-=k; } };
  g.until=async(cond,maxS)=>{ for(let i=0;i<(maxS||60)*4;i++){ if(await g.ev(cond)) return true; await g.run(.25); } return false; };
  g.probe=async(js,s,every)=>{ const rows=await page.evaluate(([n,a,js,e])=>window.__step(n,a,js,e),[Math.max(1,Math.round(s*60)),g.auto,js,Math.max(1,Math.round((every||.25)*60))]); return rows; };
  g.table=rows=>{ for(const [t,v] of rows) console.log('  t='+t.toFixed(2),typeof v==='string'?v:JSON.stringify(v)); };
  const frame=async f=>{ const t=await page.evaluate(()=>window.__frame()); await page.screenshot({path:f,timeout:300000}); return t; };
  g.shot=async name=>{ const f=path.join(OUT,name+'.png'); fs.mkdirSync(OUT,{recursive:true}); const t=await frame(f); console.log('shot',f,'t='+t.toFixed(2)); return f; };
  g.strip=async(name,n,every,o)=>{ o=o||{}; fs.mkdirSync(OUT,{recursive:true}); const tmp=[], lab=[];
    for(let i=0;i<n;i++){ const f=path.join(OUT,`.${name}-${i}.png`); const t=await frame(f); tmp.push(f); lab.push('t='+t.toFixed(2)+(o.labels&&o.labels[i]?' '+o.labels[i]:'')); if(i<n-1) await g.run(Array.isArray(every)?every[i]:every); }
    const f=path.join(OUT,name+'.png'), cols=o.cols||Math.ceil(Math.sqrt(n)), cw=o.cell||480;
    cp.execFileSync('python3',['-c',`
import sys,json
from PIL import Image,ImageDraw
fs=json.loads(sys.argv[1]); lab=json.loads(sys.argv[2]); cols=int(sys.argv[3]); cw=int(sys.argv[4]); out=sys.argv[5]
ims=[Image.open(f).convert('RGB') for f in fs]; ch=int(cw*ims[0].height/ims[0].width); rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(cols*cw+(cols-1)*2,rows*ch+(rows-1)*2),(255,0,255))
for i,im in enumerate(ims):
    im=im.resize((cw,ch),Image.LANCZOS); d=ImageDraw.Draw(im); d.rectangle([0,0,8+7*len(lab[i]),14],fill=(0,0,0)); d.text((3,2),lab[i],fill=(255,255,0))
    S.paste(im,((i%cols)*(cw+2),(i//cols)*(ch+2)))
S.save(out)`,JSON.stringify(tmp),JSON.stringify(lab),String(cols),String(cw),f]); tmp.forEach(t=>fs.unlinkSync(t)); console.log('strip',f,lab.join(' | ')); return f; };
  // film: watch a stretch of the game and keep a frame whenever the picture has changed (new dialogue line, camera moved,
  // or `every` seconds passed); ends when `until` is true (checked after `min` seconds) or after `max` seconds. Tiles of 12.
  g.film=async(name,o)=>{ o=o||{}; fs.mkdirSync(OUT,{recursive:true}); const every=o.every||1.5, max=o.max||90, per=o.per||12, files=[], lab=[]; let sig='', since=99, t=0, part=0; const outs=[];
    const SIG="(function(){ const c=camera.position, q=Cam.cine; return [Math.round(c.x/2.5),Math.round(c.y/2.5),Math.round(c.z/2.5),q?Math.round(q.lx/3)+','+Math.round(q.ly/3)+','+Math.round(q.lz/3):'',Game.state,Game.card?1:0,(typeof L!=='undefined'&&L&&(L.id||L.key))||'',Game.fadeTo>.5?1:0].join('|'); })()", gap=o.gap||.5;
    const flush=async()=>{ if(!files.length) return; const f=path.join(OUT,name+(part?'_'+part:'')+'.png'); part++; await g.tile(files.splice(0),lab.splice(0),f,o.cols||4,o.cell||480); outs.push(f); };
    for(;t<max;t+=.25){ const s=await g.ev(SIG); if((s!==sig&&since>=gap)||since>=every){ const f=path.join(OUT,`.${name}-${files.length}-${part}.png`); const gt=await frame(f); const d=await g.ev("(function(){ const d=Game.dlg; if(!d) return Game.script?'':'[play]'; let w='',t=''; for(const k in d){ const v=d[k]; if(typeof v==='string'){ if(v.length>t.length) t=v; else if(!w&&v.length<14) w=v; } } return w+': '+t.slice(0,40); })()"); files.push(f); lab.push('t='+gt.toFixed(1)+(d?' '+d:'')); sig=s; since=0; if(files.length>=per) await flush(); }
      await g.run(.25); since+=.25; if(o.until&&t>=(o.min||1)&&await g.ev(o.until)) break; }
    await flush(); console.log('film',name,'game s',t.toFixed(1),'->',outs.join(' ')); return outs; };
  g.tile=async(files,lab,f,cols,cw)=>{ cp.execFileSync('python3',['-c',`
import sys,json
from PIL import Image,ImageDraw
fs=json.loads(sys.argv[1]); lab=json.loads(sys.argv[2]); cols=int(sys.argv[3]); cw=int(sys.argv[4]); out=sys.argv[5]
ims=[Image.open(f).convert('RGB') for f in fs]; ch=int(cw*ims[0].height/ims[0].width); rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(cols*cw+(cols-1)*2,rows*ch+(rows-1)*2),(255,0,255))
for i,im in enumerate(ims):
    im=im.resize((cw,ch),Image.LANCZOS); d=ImageDraw.Draw(im); d.rectangle([0,0,min(cw,8+6*len(lab[i])),13],fill=(0,0,0)); d.text((3,1),lab[i],fill=(255,255,0))
    S.paste(im,((i%cols)*(cw+2),(i//cols)*(ch+2)))
S.save(out)`,JSON.stringify(files),JSON.stringify(lab),String(cols),String(cw),f]); files.forEach(t=>{ try{ fs.unlinkSync(t); }catch(e){} }); };
  g.warp=async(id,film)=>{ await g.ev("Game.state='cut'; newGame();"); await g.run(.35); await g.ev("Game.script=null; Game.dlg=null; twUnlockAll(true);"); await g.ev(`run(function*(){ yield* twWarp('${id}'); })`);
    if(film){ await g.film(film,{until:"Game.state==='play'&&!Game.script",every:2.5,max:400,min:1,per:20,cols:5,cell:384}); await g.ev("try{ NBS.ok=true; ALS.ok=true; }catch(e){}"); return true; }
    const ok=await g.until(id==='al_nathan'?"Game.state==='play'&&!Game.script&&!!NB&&NB.alive&&!NB.inv":"Game.state==='play'&&!Game.script",600); if(!ok) console.log('warp did not settle (state '+(await g.ev('Game.state'))+')'); await g.ev("try{ NBS.ok=true; ALS.ok=true; }catch(e){}"); return ok; };
  await g.ev("try{ Sound.unlock&&Sound.unlock(); if(Sound.muted===false&&Sound.toggleMute) Sound.toggleMute(); }catch(e){}");
  await g.ev("try{ Voice.play=()=>{}; Voice.bark=()=>{}; Voice.stop=()=>{}; Voice.prewarm=()=>{}; Object.defineProperty(Voice,'speaking',{get:()=>false,configurable:true}); Sound.play=()=>{}; }catch(e){ console.error('stub',e); }");
  let code=0; try{ await require(scen)(g); }catch(e){ console.error('scenario failed:',e); code=1; }
  console.log('page errors',errs.length,[...new Set(errs)].slice(0,6)); await browser.close(); srv.close(); process.exit(code);
})().catch(e=>{ console.error(e); process.exit(1); });
