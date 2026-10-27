// duo v5: the new mixes, the mega rain, Ali's gib/revive, Mira, both new limit cuts (tree climb + drill, Hikari), Burnout, the ending
const B=require('./bot2.js'); const R=B.R, H=B.H; const ONLY=process.env.ONLY;
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; twUnlockAll(true);");
function warp(id){ R(`run(function*(){ yield* twWarp('${id}'); })`); for(let i=0;i<900;i++){ R("if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; }"); H.frames(15); if(R("Game.state==='play'&&!Game.script&&!!TW.fight&&TW.fight.kind==='duo'")) break; } }
// a sloppy human; in Omar's limit cut it climbs the tree (teleports up) and fires the drill
function drive(sec,god){ for(let i=0;i<sec*60;i++){ R(`(function(){ const P=Player, F=TW.fight; ${god!==false?"if(P.hp<4) P.hp=P.maxHp;":""} if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; }
  if(Game.state==='dead'&&Game.deadT>1.3) hit.confirm=true;
  if(TW.caoSafe){ P.x=TW.caoSafe.x; P.z=TW.caoSafe.z; }
  if(F&&F.d5&&F.d5.climb&&F.d5.tree&&!F.d5.done&&Game.state==='play'&&!Game.script){ const T=F.d5.tree; P.x=T.ix0+.1; P.z=T.iz0+.1; P.y=T.H; P.vy=0; }
  if(F&&F.drillReady&&Game.state==='play'&&!Game.script){ hit.special=true; return; }
  if(TW.mash) hit.attack=Math.random()<.5;
  if(Game.state==='play'&&!Game.dlg){ const k=Math.floor(Game.time*1.3)%4; held.left=k===0; held.right=k===1; held.up=k===2; held.down=k===3; if(Math.random()<.2) hit.attack=true; if(Math.random()<.02) hit.dash=true; if(Math.random()<.03) hit.jump=true; } })()`); H.frames(1); } }
const out=[]; const st=()=>R("JSON.stringify({st:Game.state,ph:TW.fight&&TW.fight.phase,lc:TW.fight&&TW.fight.lc,d5lc:TW.fight&&TW.fight.d5lc,busy:TW.fight&&TW.fight.busy,hp:TW.fight&&TW.fight.C?Math.round(TW.fight.C.hp):null,php:Player.hp,scr:!!Game.script,mira:!!TW.d5mira,bolts:BOLTS.length,hz:TW.hz.length})");
warp('sh_duo'); out.push('start '+st()+' mira='+R("JSON.stringify(Game.mira&&{x:+Game.mira.x.toFixed(1),vis:Game.mira.vis})"));
function force(k,ph,secs){ R(`(function(){ const F=TW.fight; F.phase=${ph}; for(const T of [F.C,F.O]){ T.phase=${ph}; T.hp=T.maxHp; T.stun=0; T.down=0; T.gen=null; T.inv=false; } F.kick=null; F.busy=0; F.lc=0; twDuo3Begin(F,'${k}'); F.kick=null; F.guard=null; })()`);
  let n=0; for(let s=0;s<(secs||20)*2;s++){ drive(.5); n++; if(R("!TW.fight||(!TW.fight.busy&&!Game.script)")) break; } out.push(`${k}@${ph}: ${n/2}s ${st()} errs=${B.errs.length}`); console.log(out[out.length-1]); drive(.5); }
if(!ONLY||ONLY==='moves'){ const m0=R("JSON.stringify([Game.mira.x,Game.mira.z])"); for(const ph of [1,2,3]) for(const k of ['laserMix','omarMix','duoMix']) force(k,ph); out.push('mira moved '+(m0!==R("JSON.stringify([Game.mira.x,Game.mira.z])")));
  R("twDuoSeed(60)"); drive(1); force('scytheRain',3,60); }
if(!ONLY||ONLY==='ali'){ R("(function(){ const A=twAliAny(); A.hp=1; twAllyHurt(A,5); })()"); drive(1); out.push('ali gib '+R("JSON.stringify({gib:!!twAliAny().gib,hid:twAliAny().hidden})")); drive(6); out.push('ali back '+R("JSON.stringify({gib:!!twAliAny().gib,hp:twAliAny().hp,hid:twAliAny().hidden})")); }
if(!ONLY||ONLY==='flow'){ R("TW.god=true"); R("twHurt(TW.fight.C,9999,'test')"); for(let s=0;s<160&&R("TW.fight&&TW.fight.phase")===1;s++) drive(.5); out.push('after I->II '+st());
  drive(2); R("twHurt(TW.fight.C,9999,'test')"); drive(1); R("twHurt(TW.fight.C,9999,'test')");
  for(let s=0;s<400&&R("TW.fight&&TW.fight.phase")===2;s++){ drive(.5); if(s%20===0) console.log('LC1',s/2,st(),R("JSON.stringify(TW.fight&&TW.fight.d5&&{c:TW.fight.d5.climb,dr:TW.fight.drillReady,mash:TW.mash&&TW.mash.v})")); if(R("TW.fight&&TW.fight.lc===0&&TW.fight.phase===2&&!Game.script")) R("twHurt(TW.fight.C,9999,'test')"); }
  out.push('after II (Omar LC) '+st()+' grid ok='+R("TW._mantle===0||!TW._mantle"));
  drive(2); R("twHurt(TW.fight.C,9999,'test')"); drive(1); R("twHurt(TW.fight.C,9999,'test')");
  for(let s=0;s<400&&!R("TW.fight&&TW.fight.caoLC")&&R("!!TW.fight");s++){ drive(.5); if(s%20===0) console.log('LC2',s/2,st()); if(R("TW.fight&&TW.fight.lc===0&&!Game.script&&!TW.fight.burnCk&&!TW.fight.caoLC")) R("twHurt(TW.fight.C,9999,'test')"); }
  out.push('after Cao LC '+st());
  for(let s=0;s<200&&!R("TW.fight&&TW.fight.burned")&&R("!!TW.fight");s++) drive(.5); out.push('burnout '+st());
  for(let s=0;s<300&&R("Game.state")!=='end';s++) drive(.5); out.push('end '+R("Game.state")); }
console.log(out.join('\n')); console.log('ERRORS',B.errs.length); [...new Set(B.errs)].slice(0,12).forEach(e=>console.log(' !',e));
