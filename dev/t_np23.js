// Nathan phases II/III on Ali's road: every new move, both limit cuts, both transitions, a death retry, the 3D ultimate, the finale
const B=require('./bot2.js'); const R=B.R, H=B.H; const out=[];
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; twUnlockAll(true); Game.flags.ali=1; Object.assign(SCR,SCRA); NBS.ok=true; NBS.img={};");
function drive(sec,js){ for(let i=0;i<sec*60;i++){ R(`(function(){ const P=Player; if(P.hp<4) P.hp=P.maxHp; if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; }
  if(Game.state==='dead'&&Game.deadT>1.3) hit.confirm=true; ${js||''} })()`); H.frames(1); } }
const bot="if(Game.state==='play'&&!Game.dlg){ const k=Math.floor(Game.time*1.3)%4; held.left=k===0; held.right=k===1; held.up=k===2; held.down=k===3; if(Math.random()<.15) hit.attack=true; if(Math.random()<.02) hit.dash=true; if(Math.random()<.03) hit.jump=true; }";
R("run(function*(){ yield* twWarp('al_nathan'); })"); for(let i=0;i<400;i++){ drive(.25); if(R("typeof NB!=='undefined'&&!!NB&&NB.alive&&Game.state==='play'&&!Game.script&&np1On()")) break; }
const st=()=>R("JSON.stringify({st:Game.state,ph:NP1.ph,hp:Math.round(NP1.hp),max:NP1.max,done:NP1.done,lc:NP1.lcDone,inv:!!NB.inv,scr:!!Game.script,cine:!!Cam.cine,cam:!!NP1.cam,seq:NP1.seq&&NP1.seq.k,gen:!!NP1.gen,objs:NP1.objs.length,php:Player.hp})");
out.push('start '+st());
const E0=()=>B.errs.length;
function move(k){ R(`NP1.stunT=0; NB.stunned=0; np1Clear(); NP1.gen=NP1M.${k}(); NP1.wait=0;`); let n=0; for(;n<60&&R("!!NP1.gen||!!NP1.seq");n++) drive(.5,bot); drive(.5); out.push(k+' ph'+R('NP1.ph')+' '+(n/2)+'s objs='+R('NP1.objs.length')+' errs='+E0()); }
// phase I -> II
R("nbDamage(9999,'np1')"); for(let s=0;s<120&&!(R("NP1.ph===2&&Game.state==='play'&&!Game.script"));s++) drive(.5); out.push('after I: '+st());
for(const k of ['railgun','twinfang','sweep','combo']) move(k);
// the limit cut at half
R("NP1.stunT=0; NB.stunned=0; nbDamage(NP1.hp-NP1.max/2+1,'np1')"); drive(.2); out.push('lc pend '+R('NP1.lcPend')+' gen '+R('!!NP1.gen'));
for(let s=0;s<80&&R("NP1.cur==='lc'||!!NP1.seq");s++) drive(.25,bot); drive(1); out.push('after eclipse: '+st()+' errs='+E0());
// a death in phase II: retry stays in phase II
R("Player.hp=0; Game.onDeath();"); for(let s=0;s<40&&!(R("Game.state==='play'&&!Game.script&&np1On()"));s++) drive(.5); out.push('after death: '+st());
// the ultimate (3D)
R("NP1.stunT=0; NB.stunned=0; np1Clear(); Player.sp=20; hit.special=true;"); drive(.1); const hp0=R("NP1.hp"); for(let s=0;s<60&&R("!!Game.script");s++) drive(.25); out.push('ult: hp '+Math.round(hp0)+' -> '+Math.round(R("NP1.hp"))+' cam='+R('!!NP1.cam')+' zw='+R('Game.zw')+' cineFly='+R('Player.cineFly')+' errs='+E0());
// II -> III
R("NP1.stunT=0; NB.stunned=0; NP1.lcDone=1; nbDamage(9999,'np1')"); for(let s=0;s<120&&!(R("NP1.ph===3&&Game.state==='play'&&!Game.script"));s++) drive(.5); out.push('after II: '+st());
for(const k of ['blinkchain','starfall','twinfang','sweep']) move(k);
R("NP1.stunT=0; NB.stunned=0; nbDamage(NP1.hp-NP1.max/2+1,'np1')"); drive(.2); for(let s=0;s<120&&R("NP1.cur==='lc'||NP1.cur==='grab'||!!NP1.seq");s++) drive(.25,bot); drive(1); out.push('after suns: '+st()+' errs='+E0());
// a while of the real AI in phase III
drive(25,bot); out.push('ai 25s: '+st()+' errs='+E0());
// III -> the finale
R("NP1.stunT=0; NB.stunned=0; nbDamage(9999,'np1')"); for(let s=0;s<300&&R("typeof NB!=='undefined'&&!!NB")&&R("Game.state")!=='end';s++) drive(.5); out.push('finale: st='+R('Game.state')+' NB='+R("typeof NB!=='undefined'&&!!NB"));
console.log(out.join('\n')); console.log('ERRORS',B.errs.length); [...new Set(B.errs)].slice(0,12).forEach(e=>console.log(' !',e));
