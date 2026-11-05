// deaths inside Nathan's limit cuts: the retry is the same phase, clean (hurtable, no clones/funnels, camera and sky back)
const B=require('./bot2.js'); const R=B.R, H=B.H; const out=[];
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; twUnlockAll(true); Game.flags.ali=1; Object.assign(SCR,SCRA); NBS.ok=true; NBS.img={};");
function drive(sec){ for(let i=0;i<sec*60;i++){ R(`(function(){ if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; } if(Game.state==='dead'&&Game.deadT>1.3) hit.confirm=true; })()`); H.frames(1); } }
R("run(function*(){ yield* twWarp('al_nathan'); })"); for(let i=0;i<400;i++){ drive(.25); if(R("typeof NB!=='undefined'&&!!NB&&NB.alive&&Game.state==='play'&&!Game.script&&np1On()")) break; }
const st=()=>R("JSON.stringify({st:Game.state,ph:NP1.ph,hp:Math.round(NP1.hp),lcDone:NP1.lcDone,lcInv:NP1.lcInv,cur:NP1.cur,objs:NP1.objs.length,bits:NBB.length,cam:!!NP1.cam,letter:+Game.letterTo.toFixed(2),tint:grade.uniforms.tint.value.toArray().map(v=>+v.toFixed(2)),scr:!!Game.script,inv:!!NB.inv})");
for(const ph of [2,3]){ R(`NP1.ckPh=${ph}; np1Reset(); np1Start();`); drive(1); out.push('phase '+ph+' set '+st());
  R("NP1.stunT=0; NB.stunned=0; nbDamage(NP1.hp-NP1.max/2+1,'np1')"); drive(3); out.push(' in lc '+st());
  R("Player.inv=0; Player.hp=0; Game.onDeath();"); for(let s=0;s<40&&!R("Game.state==='play'&&!Game.script&&np1On()");s++) drive(.5); drive(1); out.push(' retry '+st());
  R("NP1.stunT=0; NB.stunned=0; nbDamage(5,'np1')"); out.push(' hurtable: hp '+R("Math.round(NP1.hp)")); }
console.log(out.join('\n')); console.log('ERRORS',B.errs.length); [...new Set(B.errs)].slice(0,8).forEach(e=>console.log(' !',e));
