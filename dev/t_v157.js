// v1.57: Kojima's new basics, Hamza's side dishes, Nathan's pressure, the duo's crossfire
const B=require('./bot2.js'); const R=B.R, H=B.H; const out=[];
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; twUnlockAll(true); NBS.ok=true; NBS.img={};");
const bot="if(Game.state==='play'&&!Game.dlg){ const k=Math.floor(Game.time*1.3)%4; held.left=k===0; held.right=k===1; held.up=k===2; held.down=k===3; if(Math.random()<.15) hit.attack=true; if(Math.random()<.02) hit.dash=true; if(Math.random()<.03) hit.jump=true; }";
function drive(sec,js){ for(let i=0;i<sec*60;i++){ R(`(function(){ const P=Player; if(P.hp<4) P.hp=P.maxHp; if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; } if(Game.state==='dead'&&Game.deadT>1.3) hit.confirm=true; ${js||''} })()`); H.frames(1); } }
function warp(id,ok){ R(`Game.script=null; Game.dlg=null; Game.flags.ali=${/^al_/.test(id)?1:0}; Object.assign(SCR,${/^al_/.test(id)?'SCRA':'SCR_BASE'}); run(function*(){ yield* twWarp('${id}'); })`); for(let i=0;i<400;i++){ drive(.25); if(R(ok)) return true; } return false; }
// Kojima
out.push('kojima '+warp('sh_cao_g',"!!Game.boss&&Game.state==='play'&&!Game.script&&Game.boss.state!=='intro'"));
for(const k of ['sender','nap','deadline','beat','fineprint']){ for(const mode of ['bot','still']){ R(`(function(){ const K=Game.boss; K.hp=K.maxHp; K.state='kj'; K.st=0; K.last='${k}'; K.kjg=KJM.${k}(K,3); K.kjw=0; })()`); let n=0; for(;n<40&&R("Game.boss&&Game.boss.state==='kj'");n++) drive(.5,mode==='bot'?bot:'held.left=held.right=held.up=held.down=false;'); out.push(' '+k+' ('+mode+') '+(n/2)+'s state='+R("Game.boss&&Game.boss.state")+' hz='+R('TW.hz.length')+' errs='+B.errs.length); drive(2); } }
// nap: hitting him wakes the tantrum; sender: two returns land on him
R("(function(){ const K=Game.boss; K.state='kj'; K.last='nap'; K.kjg=KJM.nap(K,1); K.kjw=0; })()"); drive(.5); const h0=R('Game.boss.hp'); R("Player.swingT=Game.time; damageBoss(5)"); out.push(' nap hit: hp same '+(R('Game.boss.hp')===h0)+' napHit '+R('Game.boss.napHit')); drive(4);
// Hamza
out.push('hamza '+warp('sh_both_f',"!!TW.giant&&Game.state==='play'&&!Game.script")); R("TW.giant.sideT=.1"); let sides=0; for(let i=0;i<40;i++){ const n0=R('TW.giant.sideN||0'); drive(.5,bot); if(R('TW.giant.sideN||0')>n0) sides++; } out.push(' sides in 20s (I): '+sides+' cd '+R('TW.giant.cd.toFixed(2)')+' errs='+B.errs.length);
R("hzgHurt(9999,'test')"); for(let s=0;s<160&&!R("!!TW.giant&&TW.giant.phase===2&&Game.state==='play'&&!Game.script");s++) drive(.5); sides=0; for(let i=0;i<40;i++){ const n0=R('TW.giant.sideN||0'); drive(.5,bot); if(R('TW.giant.sideN||0')>n0) sides++; } out.push(' sides in 20s (II): '+sides+' errs='+B.errs.length);
// Nathan
out.push('nathan '+warp('al_nathan',"typeof NB!=='undefined'&&!!NB&&NB.alive&&Game.state==='play'&&!Game.script&&np1On()"));
for(const ph of [2,3]){ R(`NP1.ckPh=${ph}; np1Reset(); np1Start(); NP1.prT=.2; globalThis.__sc=0; if(!globalThis.__w){ globalThis.__w=1; const f=npStarCircle; npStarCircle=function(){ __sc++; return f.apply(this,arguments); }; }`); drive(20,bot); out.push(' phase '+ph+': gold circles in 20s '+R('__sc')+' errs='+B.errs.length); }
// duo
out.push('duo '+warp('sh_duo',"Game.state==='play'&&!Game.script&&!!TW.fight&&TW.fight.kind==='duo'")); R("TW.god=true; TW.fight.chT=.2;"); let hzmax=0; for(let i=0;i<50;i++){ drive(.5,bot); hzmax=Math.max(hzmax,R('TW.hz.length')); } out.push(' 25s phase '+R('TW.fight.phase')+' max hazards '+hzmax+' hint '+R('!!TW.fight.chHint')+' errs='+B.errs.length);
console.log(out.join('\n')); console.log('ERRORS',B.errs.length); [...new Set(B.errs)].slice(0,10).forEach(e=>console.log(' !',e));
