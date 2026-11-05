// cutscene camera sanity for the new transitions: above ground, not inside anyone, aimed at something 1.5+ away
const B=require('./bot2.js'); const R=B.R, H=B.H;
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; twUnlockAll(true);");
R(`globalThis.__camBad=[]; globalThis.__camN=0; globalThis.__camChk=function(tag){ const c=Cam.cine; if(!c) return; __camN++; const gy=groundY(c.px,c.pz), d=Math.hypot(c.px-c.lx,c.py-c.ly,c.pz-c.lz);
  const ins=[]; if(typeof NB!=='undefined'&&NB) ins.push(['NB',NB.x,NB.z,1.0]); ins.push(['P',Player.x,Player.z,.6]); if(TW.giant) ins.push(['G',TW.giant.x,TW.giant.z,2.2*((TW.giant.gs||.55)/.55)]);
  let why=''; if(c.py<gy+.3) why='below ground '+(c.py-gy).toFixed(2); else if(d<1.5) why='aim too close '+d.toFixed(2); else for(const [n,x,z,r] of ins){ if(Math.hypot(c.px-x,c.pz-z)<r&&c.py<groundY(x,z)+4.5){ why='inside '+n; break; } }
  if(why&&__camBad.length<12) __camBad.push(tag+': '+why); };`);
function drive(sec,tag){ for(let i=0;i<sec*60;i++){ R(`(function(){ const P=Player; if(P.hp<4) P.hp=P.maxHp; if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; } __camChk('${tag}'); })()`); H.frames(1); } }
// Nathan: I->II, II->III
R("Game.flags.ali=1; Object.assign(SCR,SCRA); NBS.ok=true; NBS.img={}; run(function*(){ yield* twWarp('al_nathan'); })"); for(let i=0;i<400;i++){ drive(.25,'intro'); if(R("typeof NB!=='undefined'&&!!NB&&NB.alive&&Game.state==='play'&&!Game.script&&np1On()")) break; }
R("__camBad=[]; __camN=0;"); R("nbDamage(9999,'np1')"); for(let s=0;s<160&&!R("NP1.ph===2&&Game.state==='play'&&!Game.script");s++) drive(.25,'np12'); 
R("NP1.lcDone=1; nbDamage(9999,'np1')"); for(let s=0;s<160&&!R("NP1.ph===3&&Game.state==='play'&&!Game.script");s++) drive(.25,'np23');
console.log('nathan transitions: frames',R('__camN'),'bad',R('JSON.stringify(__camBad)'));
// Hamza: I->II, the finale
R("Game.flags.ali=0; Object.assign(SCR,SCR_BASE); run(function*(){ yield* twWarp('sh_both_f'); })"); for(let i=0;i<400;i++){ drive(.25,'hintro'); if(R("!!TW.giant&&Game.state==='play'&&!Game.script")) break; }
R("__camBad=[]; __camN=0;"); R("hzgHurt(9999,'test')"); for(let s=0;s<160&&!R("!!TW.giant&&TW.giant.phase===2&&Game.state==='play'&&!Game.script");s++) drive(.25,'hz12');
R("hzgHurt(9999,'test')"); for(let s=0;s<200&&!R("!!TW.fight&&TW.fight.kind==='duo'");s++) drive(.25,'hzfin');
console.log('hamza: frames',R('__camN'),'bad',R('JSON.stringify(__camBad)')); console.log('ERRORS',B.errs.length);
