// Nathan on Ali's road, two phases (v1.88): the mech's moves, Full Burst as the phase change (also after a death in it, and skipped by the one-hit kill), the pilot's moves and limit cut, the 3D ultimate, the finale
const B=require('./bot2.js'); const R=B.R, H=B.H; const out=[];
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; twUnlockAll(true); Game.flags.ali=1; Object.assign(SCR,SCRA); NBS.ok=true; NBS.img={};");
function drive(sec,js){ for(let i=0;i<sec*60;i++){ R(`(function(){ const P=Player; if(P.hp<4) P.hp=P.maxHp; if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; }
  if(Game.state==='dead'&&Game.deadT>1.3) hit.confirm=true; ${js||''} })()`); H.frames(1); } }
const bot="if(Game.state==='play'&&!Game.dlg){ const k=Math.floor(Game.time*1.3)%4; held.left=k===0; held.right=k===1; held.up=k===2; held.down=k===3; if(Math.random()<.15) hit.attack=true; if(Math.random()<.02) hit.dash=true; if(Math.random()<.03) hit.jump=true; }";
R("run(function*(){ yield* twWarp('al_nathan'); })"); for(let i=0;i<400;i++){ drive(.25); if(R("typeof NB!=='undefined'&&!!NB&&NB.alive&&Game.state==='play'&&!Game.script&&np1On()")) break; }
const st=()=>R("JSON.stringify({st:Game.state,ph:NP1.ph,hp:Math.round(NP1.hp),max:NP1.max,done:NP1.done,lc:NP1.lcDone,inv:!!NB.inv,scr:!!Game.script,cine:!!Cam.cine,cam:!!NP1.cam,seq:NP1.seq&&NP1.seq.k,gen:!!NP1.gen,objs:NP1.objs.length,php:Player.hp})");
out.push('start '+st()); const sc0=R('scene.children.length');
const E0=()=>B.errs.length;
function move(k){ R(`NP1.stunT=0; NB.stunned=0; np1Clear(); NP1.gen=NP1M.${k}(); NP1.wait=0;`); let n=0; for(;n<60&&R("!!NP1.gen||!!NP1.seq");n++) drive(.5,bot); drive(.5); out.push(k+' ph'+R('NP1.ph')+' '+(n/2)+'s objs='+R('NP1.objs.length')+' errs='+E0()); }
const chk=(lab,ok)=>{ out.push((ok?'ok   ':'FAIL ')+lab); if(!ok) fails++; }; let fails=0;
chk('starts in phase I at 340', R("NP1.ph===1&&NP1.max===340"));
for(const k of ['combo','ringfall','lattice','mirage','buster','tackle','meteor','bits']) move(k);
// the ultimate (3D)
R("NP1.stunT=0; NB.stunned=0; np1Clear(); Player.sp=20; hit.special=true;"); drive(.1); const hp0=R("NP1.hp"); for(let s=0;s<60&&R("!!Game.script");s++) drive(.25); out.push('ult: hp '+Math.round(hp0)+' -> '+Math.round(R("NP1.hp"))+' cam='+R('!!NP1.cam')+' zw='+R('Game.zw')+' cineFly='+R('Player.cineFly')+' errs='+E0());
// 0 HP in phase I: no phase change yet, Full Burst is due
R("NP1.stunT=0; NB.stunned=0; np1Clear(); NP1.gen=null; nbDamage(9999,'np1')"); chk('at 0 he holds at 1 HP with Full Burst due', R("NP1.lcFinal===1&&NP1.hp===1&&!NP1.done&&NP1.ph===1"));
R("nbDamage(9999,'np1')"); chk('more damage before it starts changes nothing', R("NP1.lcFinal===1&&NP1.ph===1&&!NP1.done"));
drive(.5); chk('Full Burst starts', R("NP1.lcFinal===2&&(NP1.cur==='lc'||NP1.lcInv)"));
// a death in Full Burst: the retry goes back into Full Burst
drive(2,bot); R("Player.hp=0; Game.onDeath();"); for(let s=0;s<40&&!(R("Game.state==='play'&&!Game.script&&np1On()"));s++) drive(.5); chk('a death in it retries phase I with Full Burst due', R("NP1.ph===1&&NP1.lcFinal>=1&&NP1.hp<=1")); out.push('after death: '+st());
let t=0; for(;t<160&&!(R("NP1.ph===3&&Game.state==='play'&&!Game.script"));t++) drive(.5,bot); chk('Full Burst ends in the armour-off cutscene and phase II (the pilot) after '+(t/2)+'s', R("NP1.ph===3&&!!NP1.human&&!NP1.lcFinal")); out.push('after I: '+st()+' errs='+E0());
chk('the player reads phase II', R("npShown()===2"));
for(const k of ['gunkata','martial','pointblank','iai','stance','grab']) move(k);
R("NP1.stunT=0; NB.stunned=0; nbDamage(NP1.hp-NP1.max/2+1,'np1')"); drive(.2); chk('his own limit cut at half', R("NP1.lcDone===1")); for(let s=0;s<120&&R("NP1.cur==='lc'||NP1.cur==='grab'||!!NP1.seq");s++) drive(.25,bot); drive(1); out.push('after Last Round: '+st()+' errs='+E0());
// a death on foot: the retry stays on foot
R("Player.hp=0; Game.onDeath();"); for(let s=0;s<40&&!(R("Game.state==='play'&&!Game.script&&np1On()"));s++) drive(.5); chk('a death in phase II retries phase II', R("NP1.ph===3&&!!NP1.human"));
drive(25,bot); out.push('ai 25s: '+st()+' errs='+E0());
out.push('scene children start '+sc0+' now '+R('scene.children.length')+' (after np1Clear: '+R('(np1Clear(),scene.children.length)')+')');
R("NP1.stunT=0; NB.stunned=0; nbDamage(9999,'np1')"); for(let s=0;s<300&&R("typeof NB!=='undefined'&&!!NB")&&R("Game.state")!=='end';s++) drive(.5); out.push('finale: st='+R('Game.state')+' NB='+R("typeof NB!=='undefined'&&!!NB"));
// a fresh fight with the one-hit kill: Full Burst is skipped
R("Game.state='cut'; Game.script=null; Game.dlg=null; run(function*(){ yield* twWarp('al_nathan'); })"); for(let i=0;i<400;i++){ drive(.25); if(R("typeof NB!=='undefined'&&!!NB&&NB.alive&&Game.state==='play'&&!Game.script&&np1On()")) break; }
chk('a new fight starts clean in phase I', R("NP1.ph===1&&!NP1.lcFinal&&!NP1.ckLC"));
R("TW.otk=true; NP1.stunT=0; NB.stunned=0; np1Clear(); NP1.gen=null; nbDamage(1,'np1')"); chk('the one-hit kill skips Full Burst', R("NP1.lcFinal===3&&!!NP1.done")); R('TW.otk=false');
for(t=0;t<120&&!(R("NP1.ph===3&&Game.state==='play'&&!Game.script"));t++) drive(.5); chk('and goes straight to the pilot', R("NP1.ph===3"));
console.log(out.join('\n')); console.log('FAILS',fails,'ERRORS',B.errs.length); [...new Set(B.errs)].slice(0,12).forEach(e=>console.log(' !',e));
