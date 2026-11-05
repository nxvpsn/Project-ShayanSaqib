// Debug Mode with Nathan's three phases (Ali's road) and Hamza's two
const B=require('./bot2.js'); const R=B.R, H=B.H; const out=[];
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; twUnlockAll(true); NBS.ok=true; NBS.img={};");
function step(s){ for(let i=0;i<s*60;i++){ R("if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; } Player.hp=Player.maxHp;"); H.frames(1); } }
function ready(c){ for(let i=0;i<160;i++){ step(.25); if(R(c)) return true; } return false; }
R("dbgToggle(); DBG.open=false; DBG.wantOpen=0; Game.state='play';"); step(1); R("dbgAct('ali:1')"); step(2);
R("dbgSpawn('nathan')"); out.push('nathan up '+ready("dbgNP1()&&!!NB&&np1On()&&Game.state==='play'&&!Game.script")); R("DBG.mode='idle'; dbgApplyMode();");
out.push('phases '+R("dbgPhases()")+' pool2 '+R("dbgPool(2).join(',')")+' lcs '+R("JSON.stringify(dbgLCs().map(q=>q[1]+q[2]))"));
for(const ph of [2,3]){ R(`dbgSetPhase(${ph})`); step(.5); out.push('set '+ph+' -> ph '+R("NP1.ph")+' hp '+R("NP1.hp")+' dbgPhase '+R("dbgPhase()"));
  for(const k of R(`JSON.stringify(dbgPool(${ph}))`).length?JSON.parse(R(`JSON.stringify(dbgPool(${ph}))`)):[]){ R(`dbgRun('${k}',${ph})`); let n=0; for(;n<40&&R("dbgBusy()");n++) step(.5); }
  out.push(' moves ok errs '+B.errs.length);
  R(`dbgLC('${ph===2?'eclipse':'suns'}',${ph})`); step(.3); out.push(' lc running '+R("NP1.cur")); for(let n=0;n<60&&R("NP1.cur==='lc'||NP1.cur==='grab'||!!NP1.gen||!!NP1.seq");n++) step(.5); out.push(' lc done errs '+B.errs.length+' inv '+R("NP1.lcInv")); }
R("dbgLC('kill',2)"); for(let s=0;s<120&&!R("NP1.ph===3&&Game.state==='play'&&!Game.script");s++) step(.5); out.push('kill phase II -> ph '+R("NP1.ph"));
R("dbgDespawn(); DBG.boss=null; dbgAct('ali:0')"); step(2); R("dbgSpawn('hamza')"); out.push('hamza up '+ready("!!TW.giant&&Game.state==='play'&&!Game.script")); R("DBG.mode='idle'; dbgApplyMode();");
out.push('hamza phases '+R("dbgPhases()")+' lcs '+R("JSON.stringify(dbgLCs().map(q=>q[1]))")); R("dbgSetPhase(2)"); step(.5); R("dbgRun('kawaiiStomp',2)"); for(let n=0;n<30&&R("dbgBusy()");n++) step(.5);
R("dbgLC('buffet',2)"); step(.5); out.push('mukbang '+R("!!TW.giant.gen")); for(let n=0;n<80&&!R("TW.giant&&TW.giant.stun>0&&!TW.lcCleanup");n++) step(.5); out.push(' food coma '+R("TW.giant&&TW.giant.stun>0"));
console.log(out.join('\n')); console.log('ERRORS',B.errs.length); [...new Set(B.errs)].slice(0,8).forEach(e=>console.log(' !',e));
