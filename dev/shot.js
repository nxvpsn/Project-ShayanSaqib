#!/usr/bin/env node
// Screenshots of the real game, headless (the preinstalled Playwright + Chromium; WebGL through SwiftShader, slow but fine
// for stills). It serves the repo root on a local port, warps into a fight, runs any JS you give it inside the page, waits in
// GAME time (not wall time: software GL runs the loop slower than real time) and saves PNGs. For looking at framing, colour
// and shape; it says nothing about feel. Budget: at most 4 shots a push, none for logic-only changes.
//
//   node shot.js --scene fight --out /tmp/x/a.png                     the Nathan fight, standing
//   node shot.js --scene fight --eval "NP1.gen=NP1M.excal(); NP1.wait=0" --wait 9 --out /tmp/x/b.png
//   node shot.js --scene fight --eval "held.block=true" --wait 6.2 --out /tmp/x/c.png     Ali's level 3 charge
//   node shot.js --scene fight --eval "..." --wait 2 --shots 3 --every .5 --out /tmp/x/d.png   a burst: d-1.png, d-2.png, d-3.png
//   --scene: fight (Ali vs Nathan, al_nathan) | title | warp:<id> (any timeline warp, e.g. warp:sh_omar); --size 1280x720
//   --eval runs after the warp lands; --wait is game seconds after it (default 0.5); --keep leaves the browser open 20s.
// The page's console errors are printed at the end: a shot with errors is not a clean shot.
const fs=require('fs'), path=require('path'), http=require('http');
const args=process.argv.slice(2), opt=(k,d)=>{ const i=args.indexOf('--'+k); return i>=0?args[i+1]:d; }, has=k=>args.includes('--'+k);
const scene=opt('scene','fight'), evalJs=opt('eval',''), waitS=parseFloat(opt('wait','.5')), shots=parseInt(opt('shots','1')), every=parseFloat(opt('every','.5')), out=opt('out','/tmp/shot.png'), size=opt('size','960x540').split('x').map(Number);
const ROOT=path.resolve(__dirname,'..'), MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.mp3':'audio/mpeg','.json':'application/json','.css':'text/css','.jpg':'image/jpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
(async()=>{
  const srv=http.createServer((q,r)=>{ const p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0])); if(!p.startsWith(ROOT)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){ r.writeHead(404); r.end(); return; } r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
  await new Promise(res=>srv.listen(0,'127.0.0.1',res)); const port=srv.address().port;
  const { chromium }=require('playwright'); const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
  const page=await browser.newPage({viewport:{width:size[0],height:size[1]}}); page.setDefaultTimeout(180000); const errs=[];
  // the CDN scripts (three.js and its passes) come from a local cache, filled once with curl (which knows the proxy); fonts are let go
  const CACHE=path.join(__dirname,'.cdn_cache'); fs.mkdirSync(CACHE,{recursive:true});
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,async route=>{ const u=route.request().url(); if(/fonts\.(googleapis|gstatic)\.com/.test(u)){ return route.fulfill({status:200,contentType:'text/css',body:''}); }
    const m=u.match(/\/npm\/three@0\.147\.0\/(.+)$/), f=m&&fs.existsSync(path.join(CACHE,'three/package',m[1]))?path.join(CACHE,'three/package',m[1]):path.join(CACHE,u.replace(/[^a-zA-Z0-9.@-]+/g,'_')); /* three.js from the npm package (npm pack three@0.147.0, extracted to .cdn_cache/three): the CDN host is blocked here */ if(!fs.existsSync(f)||!fs.statSync(f).size){ try{ require('child_process').execFileSync('curl',['-sS','-L','--max-time','60','-o',f,u]); }catch(e){ console.log('cdn miss',u); return route.abort(); } }
    route.fulfill({status:200,contentType:u.endsWith('.js')?'text/javascript':'application/octet-stream',body:fs.readFileSync(f)}); }); page.on('pageerror',e=>errs.push(String(e))); page.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/index.html`,{waitUntil:'domcontentloaded',timeout:120000}); /* not 'load': audio keeps it open */
  await page.waitForFunction(()=>typeof Game!=='undefined'&&typeof loop==='function',null,{timeout:120000});
  const ev=js=>page.evaluate(js);
  // game time is stepped synchronously with rendering stubbed (software GL runs the real loop at a few fps): n frames of 1/60
  const step=n=>page.evaluate(n=>{ const cr=composer.render, raf=window.requestAnimationFrame; composer.render=()=>{}; window.requestAnimationFrame=()=>0;
    try{ let t=last; for(let i=0;i<n;i++){ t+=1000/60; if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=0; hit.confirm=true; } loop(t); } } finally{ composer.render=cr; window.requestAnimationFrame=raf; last=performance.now(); } },n);
  const waitGame=s=>step(Math.max(1,Math.round(s*60)));
  const clickThrough=async(cond,maxS)=>{ for(let i=0;i<maxS;i++){ if(await ev(cond)) return true; await step(60); } return false; }; /* maxS: game seconds */
  // one real frame, then the shot (the software renderer takes its time)
  const snap=async f=>{ await ev("requestAnimationFrame(loop)"); const t0=await ev('Game.time'); for(let i=0;i<200&&(await ev('Game.time'))-t0<.02;i++) await page.waitForTimeout(100); await page.screenshot({path:f,timeout:180000}); };
  await ev("try{ Sound.unlock&&Sound.unlock(); if(Sound.muted===false&&Sound.toggleMute) Sound.toggleMute(); }catch(e){}");
  if(scene!=='title'){ const id=scene==='fight'?'al_nathan':scene.replace(/^warp:/,'');
    await ev("Game.state='cut'; newGame();"); await step(20); await ev("Game.script=null; Game.dlg=null; twUnlockAll(true);");
    await ev(`run(function*(){ yield* twWarp('${id}'); })`);
    const ok=await clickThrough(id==='al_nathan'?"Game.state==='play'&&!Game.script&&!!NB&&NB.alive&&!NB.inv":"Game.state==='play'&&!Game.script",600); if(!ok) console.log('warp did not settle (state '+(await ev('Game.state'))+')');
    await ev("try{ NBS.ok=true; ALS.ok=true; }catch(e){}"); }
  if(evalJs){ try{ await ev(evalJs); }catch(e){ console.log('eval failed:',e.message); } }
  await waitGame(waitS);
  const base=out.replace(/\.png$/,''); fs.mkdirSync(path.dirname(out),{recursive:true});
  for(let i=1;i<=shots;i++){ const f=shots>1?`${base}-${i}.png`:out; await snap(f); console.log('shot',f,'game time',(await ev('Game.time')).toFixed(2),'state',await ev('Game.state')); if(i<shots) await waitGame(every); }
  if(has('keep')) await page.waitForTimeout(20000);
  console.log('page errors',errs.length,errs.slice(0,5)); await browser.close(); srv.close(); process.exit(0);
})().catch(e=>{ console.error(e); process.exit(1); });
