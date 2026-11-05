// Giant Hamza and Nathan remasters: every new move, the grabs, the limit cuts, the frenzy/overdrive and the finales
const B=require('./bot2.js'); const R=B.R, H=B.H; const ONLY=process.env.ONLY;
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; twUnlockAll(true);");
function warp(id,ok){ R(`run(function*(){ yield* twWarp('${id}'); })`); for(let i=0;i<800;i++){ R("if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; }"); H.frames(15); if(R(ok)) break; } }
function drive(sec,god){ for(let i=0;i<sec*60;i++){ R(`(function(){ const P=Player; ${god!==false?"if(P.hp<4) P.hp=P.maxHp;":""} if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; }
  if(Game.state==='dead'&&Game.deadT>1.3) hit.confirm=true;
  if(Game.state==='play'&&!Game.dlg){ const k=Math.floor(Game.time*1.3)%4; held.left=k===0; held.right=k===1; held.up=k===2; held.down=k===3; if(Math.random()<.2) hit.attack=true; if(Math.random()<.02) hit.dash=true; if(Math.random()<.03) hit.jump=true; } })()`); H.frames(1); } }
const out=[];
if(!ONLY||ONLY==='hamza'){ warp('sh_both_f',"!!TW.giant&&Game.state==='play'&&!Game.script"); out.push('hamza start '+R("JSON.stringify({hp:TW.giant&&TW.giant.hp,st:Game.state,ph:TW.giant&&TW.giant.phase})"));
  // one phase (round 5): every move in his pool, then the swallow
  const pool=JSON.parse(R("JSON.stringify(HZG_POOL[1])")); for(const k of [...new Set(pool)]){ R(`(function(){ const G=TW.giant; G.stun=0; G.gen=HZG.${k}(G,1); G.wait=0; })()`); let n=0; for(;n<40&&R("!!TW.giant&&!!TW.giant.gen");n++) drive(.5); out.push(k+' '+(n/2)+'s st='+R("Game.state")+' errs='+B.errs.length); }
  R("(function(){ const G=TW.giant; Player.x=G.x+1; Player.z=G.z; G.gen=HZG.bigBite(G,1); G.wait=0; })()"); drive(8); out.push('big bite '+R("JSON.stringify({st:Game.state,php:Player.hp,ph:TW.giant&&TW.giant.phase})"));
  // phase I at zero: KAWAII BULK, then phase II's moves, MUKBANG LIVE at half, then at zero the twins kill him
  for(let s=0;s<120&&!R("Game.state==='play'&&!Game.script");s++) drive(.5); R("hzgHurt(9999,'test')"); for(let s=0;s<120&&!(R("!!TW.giant&&TW.giant.phase===2&&Game.state==='play'&&!Game.script"));s++) drive(.5); out.push('phase II '+R("JSON.stringify({ph:TW.giant&&TW.giant.phase,hp:TW.giant&&TW.giant.hp,st:Game.state})"));
  for(const k of ['kawaiiStomp','meteor','bigBite']){ R(`(function(){ const G=TW.giant; G.stun=0; G.gen=HZG.${k}(G,2); G.wait=0; })()`); let n=0; for(;n<40&&R("!!TW.giant&&!!TW.giant.gen");n++) drive(.5); out.push(k+'@2 '+(n/2)+'s errs='+B.errs.length); }
  for(let s=0;s<120&&!R("Game.state==='play'&&!Game.script");s++) drive(.5); R("(function(){ const G=TW.giant; G.stun=0; G.hp=G.maxHp*.55; hzgHurt(G.maxHp*.1,'test'); })()"); out.push('mukbang started '+R("!!TW.giant.gen&&TW.giant.inv"));
  for(let s=0;s<120&&!R("TW.giant&&TW.giant.stun>0&&!TW.lcCleanup");s++) drive(.5); out.push('food coma '+R("JSON.stringify({stun:TW.giant&&+TW.giant.stun.toFixed(1),hg:!!TW.hg,lcDone:TW.giant&&TW.giant.lcDone,st:Game.state})"));
  for(let s=0;s<120&&!R("Game.state==='play'&&!Game.script");s++) drive(.5);
  for(let s=0;s<120&&!R("Game.state==='play'&&!Game.script");s++) drive(.5); R("hzgHurt(9999,'test')"); let gone=-1; for(let s=0;s<240;s++){ drive(.5); if(gone<0&&!R("!!TW.giant")) gone=s/2; if(R("!!TW.fight&&TW.fight.kind==='duo'&&Game.state==='play'&&!Game.script")) break; }
  out.push('finale: giant gone at '+gone+'s, fight='+R("TW.fight&&TW.fight.kind")+' st='+R("Game.state")+' lc/hg='+R("!!TW.hg")); }
if(!ONLY||ONLY==='nathan'){ R("Game.flags.ali=1; Object.assign(SCR,SCRA);"); warp('al_nathan',"typeof NB!=='undefined'&&!!NB&&NB.alive&&!NB.inv&&Game.state==='play'&&!Game.script"); out.push('nathan start '+R("JSON.stringify({bars:NB&&NB.bars,ali:ALI()})"));
  for(const [k,ph] of [['railgun',1],['funnels',2],['starDash',2],['memoryRain',2],['singularity',3],['grapple',2],['carousel',2],['bitWall',2],['hexagram',3],['afterimage',2],['swarm',3],['phantom',2]]){ R(`(function(){ NB.phase=${ph}; NB.stunned=0; NB.gen=nbPattern('${k}'); NB.wait=0; })()`); let n=0; for(let s=0;s<40;s++){ drive(.25); n++; if(R("!NB||(!NB.gen&&!Game.script)")) break; } out.push(`nathan.${k}@${ph}: ${n/4}s php=${R("Player.hp")} errs=${B.errs.length}`); }
  R("run(function*(){ yield* nbGrabCine(); })"); for(let i=0;i<8*60;i++){ H.frames(1); } out.push('grapple '+R("JSON.stringify({st:Game.state,php:Player.hp})"));
  // phases: let the cinematics run, then each limit cut
  R("nbDamage(401)"); for(let s=0;s<200&&R("NB&&NB.phase")<2;s++) drive(.5); out.push('nb phase '+R("NB.phase")+' bars '+R("NB.bars"));
  R("nbDamage(210)"); for(let s=0;s<120&&!(R("NB.lcA")&&R("!Game.script"));s++) drive(.5); drive(4); out.push('storm done lcA='+R("NB.lcA")+' st='+R("Game.state")+' deaths='+R("Game.deaths")+' errs='+B.errs.length);
  R("nbDamage(600)"); for(let s=0;s<300&&R("NB&&NB.phase")<3;s++) drive(.5); out.push('nb phase '+R("NB.phase")+' deaths='+R("Game.deaths"));
  R("nbDamage(160)"); for(let s=0;s<120&&!(R("NB.lcB")&&R("!Game.script"));s++) drive(.5); drive(4); out.push('heaven done lcB='+R("NB.lcB")+' errs='+B.errs.length);
  R("nbDamage(400)"); for(let s=0;s<400&&R("NB&&NB.phase")<4;s++) drive(.5); out.push('nb phase '+R("NB&&NB.phase"));
  R("nbDamage(200)"); for(let s=0;s<400&&R("Game.state")!=='end'&&R("typeof NB!=='undefined'&&!!NB");s++) drive(.5); out.push('nathan end: '+R("Game.state")+' NB='+R("!!NB")+' over='+R("NB&&NB.over")); }
console.log(out.join('\n')); console.log('ERRORS',B.errs.length); [...new Set(B.errs)].slice(0,12).forEach(e=>console.log(' !',e));
