const B=require('./bot2.js'); const R=B.R, H=B.H;
const st=()=>R("JSON.stringify([Game.state,L&&L.key,!!Game.script,TW.fight&&TW.fight.kind,Game.boss?'grim'+Game.boss.phase:'',TW.allies.map(a=>a.who).join('+'),TLM.open])");
const adv=(n)=>{ for(let i=0;i<n;i++){ R("if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=0; hit.confirm=true; }"); H.frames(30); } };
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; TWS.done={}; twUnlockAll(true);");
// 1. warp into a Grimmaw fight via the Esc menu from free play
R("Game.state='play'"); console.log('can open',R("twEscOk()")); R("twEscOpen()"); console.log('open', st(), 'tab', R("TLM.tab"));
R("twTimelineClose(null)"); console.log('closed', st());
R("twEscOpen(); twTimelineClose('sh_cao_g')"); adv(40); console.log('after warp sh_cao_g', st());
// 2. open mid-fight, close without picking -> resume
for(let i=0;i<10&&R("Game.state")!=='play';i++) adv(5);
const s0=st(); R("twEscOpen()"); H.frames(60); R("twTimelineClose(null)"); console.log('mid-fight resume', s0, '->', st());
// 4. during a cutscene, open & close -> script continues
R("run(SCR.paul)"); H.frames(10); const c0=st(); R("twEscOpen()"); R("twTimelineClose(null)"); console.log('cutscene resume', c0, '->', st());
adv(10); console.log('paul talk menu', st(), 'tab', R("TLM.tab"), 'sel', R("TLM.sel"));
R("TWS.paulDone=0; if(TLM.open) twTimelineClose(null)"); adv(5);
// 5. key toggles
R("TW.god=false;TW.otk=false;"); console.log('errors',B.errs.length,[...new Set(B.errs)].slice(0,5));
