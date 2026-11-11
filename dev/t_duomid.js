const B=require('./bot2.js'); const R=B.R, H=B.H; const ONLY=process.env.ONLY;
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; twUnlockAll(true);");
function warp(id){ R(`run(function*(){ yield* twWarp('${id}'); })`); for(let i=0;i<900;i++){ R("if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; }"); H.frames(15); if(R("Game.state==='play'&&!Game.script&&!!TW.fight&&TW.fight.kind==='duo'")) break; } }
function step(s,js){ for(let i=0;i<s*60;i++){ R(`(function(){ const P=Player, F=TW.fight; if(P.hp<4) P.hp=P.maxHp; if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; } if(Game.state==='dead'&&Game.deadT>1.3) hit.confirm=true; if(TW.caoSafe){ P.x=TW.caoSafe.x; P.z=TW.caoSafe.z; }
  if(Game.state==='play'&&!Game.dlg){ const k=Math.floor(Game.time*1.3)%4; held.left=k===0; held.right=k===1; held.up=k===2; held.down=k===3; if(Math.random()<.1) hit.attack=true; if(Math.random()<.03) hit.jump=true; } ${js||''} })()`); H.frames(1); } }
warp('sh_duo'); const st=()=>R("JSON.stringify({st:Game.state,ph:TW.fight.phase,lc:TW.fight.lc,d5lc:TW.fight.d5lc,dir:TW.fight.director,busy:TW.fight.busy,done:TW.fight.lcDone,hp:Math.round(TW.fight.C.hp),inv:TW.fight.C.inv,stun:+(TW.fight.C.stun||0).toFixed(1),scr:!!Game.script,cine:!!Cam.cine,hz:TW.hz.length})");
for(const ph of [2,3]){ R(`(function(){ const F=TW.fight; F.phase=${ph}; F.lcDone[${ph}]=0; F.lc=0; F.busy=0; F.director=1; F.pend=null; for(const T of [F.C,F.O]){ T.phase=${ph}; T.maxHp=DUO_HP[${ph}]; T.hp=T.maxHp*.45; T.inv=false; T.gen=null; T.stun=0; T.down=0; T.state='idle'; } twClearHz(); })()`);
  let started=false; for(let i=0;i<40&&!started;i++){ step(.25); started=R("TW.fight.d5lc==='mid'"); } console.log('phase',ph,'started',started,st());
  for(let i=0;i<200&&!R("TW.fight.C.gen&&TW.fight.C.state==='lc'&&!Game.script");i++) step(.25); console.log(' playing',st());
  // die inside it once: it restarts
  if(ph===2){ step(4); R("TW.god=false; Player.inv=0; Player.hp=0; Game.onDeath();"); for(let i=0;i<80&&!R("Game.state==='play'&&!Game.script&&TW.fight&&TW.fight.C.gen");i++) step(.5); console.log(' after death',st()); R("TW.god=true"); }
  for(let i=0;i<240&&R("TW.fight.lc");i++) step(.25); console.log(' ended',st()); step(5); console.log(' 5s later',st(),'errs',B.errs.length); }
console.log('ERRORS',B.errs.length); [...new Set(B.errs)].slice(0,8).forEach(e=>console.log(' !',e));
