// the remastered duo fight: every move, both limit cuts, the rain, the grab, Burnout, Ali's assists
const B=require('./bot2.js'); const R=B.R, H=B.H; const ONLY=process.env.ONLY;
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; twUnlockAll(true);");
function warp(id){ R(`run(function*(){ yield* twWarp('${id}'); })`); for(let i=0;i<600;i++){ R("if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; }"); H.frames(15); if(R("Game.state==='play'&&!Game.script&&!!TW.fight&&TW.fight.kind==='duo'")) break; } }
// a sloppy human: moves, swings, jumps, dashes. god keeps HP up unless told otherwise
function drive(sec,god){ for(let i=0;i<sec*60;i++){ R(`(function(){ const P=Player; ${god!==false?"if(P.hp<4) P.hp=P.maxHp;":""} if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=0; hit.confirm=true; }
  if(Game.state==='dead'&&Game.deadT>1.3) hit.confirm=true;
  if(TW.caoSafe){ P.x=TW.caoSafe.x; P.z=TW.caoSafe.z; }
  if(Game.state==='play'&&!Game.dlg){ const k=Math.floor(Game.time*1.3)%4; held.left=k===0; held.right=k===1; held.up=k===2; held.down=k===3; if(Math.random()<.2) hit.attack=true; if(Math.random()<.02) hit.dash=true; if(Math.random()<.03) hit.jump=true; } })()`); H.frames(1); } }
const out=[]; const st=()=>R("JSON.stringify({st:Game.state,ph:TW.fight&&TW.fight.phase,lc:TW.fight&&TW.fight.lc,busy:TW.fight&&TW.fight.busy,hp:TW.fight&&TW.fight.C?Math.round(TW.fight.C.hp):null,php:Player.hp,pl:TW.planted.length,scr:!!Game.script})");
warp('sh_duo'); out.push('start '+st());
function force(k,ph,secs){ R(`(function(){ const F=TW.fight; F.phase=${ph}; for(const T of [F.C,F.O]){ T.phase=${ph}; T.hp=T.maxHp; T.stun=0; T.down=0; T.gen=null; T.inv=false; } F.kick=null; F.busy=0; F.lc=0; twDuo3Begin(F,'${k}'); F.kick=null; F.guard=null; })()`);
  console.log("start",k); let n=0; for(let s=0;s<(secs||20)*2;s++){ drive(.5); n++; if(R("!TW.fight||(!TW.fight.busy&&!Game.script)")) break; } out.push(`${k}@${ph}: ${n/2}s ${st()} errs=${B.errs.length}`); console.log(out[out.length-1]); drive(.5); }
const moves=['glompReap','crossfire','cage','volley','tagTeam','sentenceSnipe','prism','horizon','getsugaLaser','ricochet','hikariGetsuga','tearRift','laserStorm','scytheCyclone','getsugaGauntlet','pillowHoles','doubleCage'];
if(!ONLY||ONLY==='moves') for(const k of moves) force(k,['hikariGetsuga','tearRift','pillowHoles','doubleCage'].includes(k)?3:2);
if(!ONLY||ONLY==='rain'){ R("twDuoSeed(100)"); drive(1.5); out.push('seeded '+R("TW.planted.length")); force('scytheRain',2,35); }
if(!ONLY||ONLY==='grab'){ R("TW.god=false; Player.hp=Player.maxHp; run(function*(){ yield* twTwinExecution(TW.fight); })"); drive(8,false); out.push('grab '+st()); }
if(!ONLY||ONLY==='assist'){ // kick and guard and three revives
  R("(function(){ const F=TW.fight; F.busy=0; twDuo3Begin(F,'crossfire'); F.kick={mid:F.mid,who:'caotan',at:Game.time+.9}; F.guard={mid:F.mid,n:0}; })()"); drive(2.5); out.push('kick: cao down/stun '+R("TW.fight.C.down+'/'+TW.fight.C.stun.toFixed(1)")+' guard n='+R("TW.fight.guard?TW.fight.guard.n:'-'")+' jc lines '+R("JC.lines.length"));
  drive(3); out.push('jc lines after 3s '+R("JC.lines.length"));
  for(let i=0;i<4;i++){ R("TW.god=false; Player.inv=0; hurtPlayer(99,Player.x+1,Player.z)"); drive(6,false); out.push('death '+(i+1)+': heals='+R("TW.fight&&TW.fight.heals")+' '+st()); }
  drive(3); }
if(!ONLY||ONLY==='lc'){ R("TW.god=true"); warp('sh_duo'); R("(function(){ const F=TW.fight; F.phase=2; for(const T of [F.C,F.O]){ T.phase=2; T.hp=T.maxHp=DUO_HP[2]; } twHurt(F.C,DUO_HP[2]*.55,'test'); })()");
  for(let s=0;s<80&&!R("TW.fight&&TW.fight.lcDone[2]");s++) drive(.5); out.push('LC1 done '+st()+' errs='+B.errs.length+' cam '+R("JSON.stringify([!!Cam.cine,!!Cam.focus,Game.letterTo,Cam.zoom])"));
  R("(function(){ const F=TW.fight; F.phase=3; F.lc=0; for(const T of [F.C,F.O]){ T.phase=3; T.hp=T.maxHp=DUO_HP[3]; T.stun=0; } twHurt(F.C,DUO_HP[3]*.55,'test'); })()");
  for(let s=0;s<80&&!R("TW.fight&&TW.fight.lcDone[3]");s++) drive(.5); out.push('LC2 done '+st()+' errs='+B.errs.length+' cam '+R("JSON.stringify([!!Cam.cine,!!Cam.focus,Game.letterTo,Cam.zoom])")); }
if(!ONLY||ONLY==='trans'){ R("TW.god=true"); warp('sh_duo'); R("twHurt(TW.fight.C,9999,'test')"); for(let s=0;s<120&&R("TW.fight&&TW.fight.phase")===1;s++) drive(.5); out.push('after I->II '+st());
  drive(2); R("twHurt(TW.fight.C,9999,'test')"); drive(1); R("twHurt(TW.fight.C,9999,'test')"); for(let s=0;s<160&&R("TW.fight&&TW.fight.phase")===2;s++){ drive(.5); if(R("TW.fight&&TW.fight.lc===0&&TW.fight.phase===2&&!Game.script")) R("twHurt(TW.fight.C,9999,'test')"); } out.push('after II->III '+st());
  drive(2); R("twHurt(TW.fight.C,9999,'test')"); drive(1); for(let s=0;s<200&&!R("TW.fight&&TW.fight.burned")&&R("!!TW.fight");s++){ drive(.5); if(R("TW.fight&&TW.fight.lc===0&&!Game.script&&!TW.fight.burnCk")) R("twHurt(TW.fight.C,9999,'test')"); } out.push('burnout '+st()+' hg='+R("!!TW.hg"));
  for(let s=0;s<200&&R("Game.state")!=='end';s++) drive(.5); out.push('end '+R("Game.state")); }
console.log(out.join('\n')); console.log('ERRORS',B.errs.length); [...new Set(B.errs)].slice(0,12).forEach(e=>console.log(' !',e));
