// the safety net: a NaN put into the player / Nathan / the TPS yaw is restored the next frame (no crash)
const B=require('./bot2.js'); const R=B.R, H=B.H;
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; twUnlockAll(true); Game.flags.ali=1; Object.assign(SCR,SCRA); NBS.ok=true; NBS.img={}; run(function*(){ yield* twWarp('al_nathan'); })");
for(let i=0;i<400;i++){ R("if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; }"); H.frames(15); if(R("typeof NB!=='undefined'&&!!NB&&NB.alive&&Game.state==='play'&&!Game.script&&np1On()")) break; }
H.frames(30); R("Player.x=NaN; Player.vx=NaN; Player.ang=NaN; NB.z=NaN; TPS.yaw=NaN;"); H.frames(60);
console.log(R("JSON.stringify({x:Player.x,vx:Player.vx,ang:Player.ang,nbz:NB.z,yaw:TPS.yaw,st:Game.state})"),'ERRORS',B.errs.length,[...new Set(B.errs)].slice(0,3));
