// Giant Hamza and Nathan remasters: every new move, the grabs, the limit cuts, the frenzy/overdrive and the finales
const B=require('./bot2.js'); const R=B.R, H=B.H; const ONLY=process.env.ONLY;
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; twUnlockAll(true);");
function warp(id,ok){ R(`run(function*(){ yield* twWarp('${id}'); })`); for(let i=0;i<800;i++){ R("if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; }"); H.frames(15); if(R(ok)) break; } }
function drive(sec,god){ for(let i=0;i<sec*60;i++){ R(`(function(){ const P=Player; ${god!==false?"if(P.hp<4) P.hp=P.maxHp;":""} if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=0; hit.confirm=true; }
  if(Game.state==='dead'&&Game.deadT>1.3) hit.confirm=true;
  if(Game.state==='play'&&!Game.dlg){ const k=Math.floor(Game.time*1.3)%4; held.left=k===0; held.right=k===1; held.up=k===2; held.down=k===3; if(Math.random()<.2) hit.attack=true; if(Math.random()<.02) hit.dash=true; if(Math.random()<.03) hit.jump=true; } })()`); H.frames(1); } }
const out=[];
if(!ONLY||ONLY==='hamza'){ warp('sh_both_f',"!!TW.giant&&Game.state==='play'&&!Game.script"); out.push('hamza start '+R("JSON.stringify({hp:TW.giant&&TW.giant.hp,st:Game.state})"));
  R('0'); for(const [k,ph] of [['bounce',1],['flop',1],['stampede',1],['babies',1],['quake',1],['roll',1],['meteor',2],['babyRain',2],['belly',2],['stampede',2],['vacuum',1]]){ R(`(function(){ const G=TW.giant; G.phase=${ph}; G.stun=0; G.gen=HZG.${k}(G,${ph}); G.wait=0; })()`); let n=0; for(let s=0;s<40;s++){ drive(.25); n++; if(R("!TW.giant||(!TW.giant.gen&&!Game.script)")) break; } out.push(`hamza.${k}@${ph}: ${n/4}s php=${R("Player.hp")} babies=${R("hzgBabies().length")} errs=${B.errs.length}`); }
  // force the swallow
  R("(function(){ const G=TW.giant; Player.x=G.x+1; Player.z=G.z; G.gen=HZG.vacuum(G,2); G.wait=0; })()"); drive(8); R('TW.giant.phase=1'); out.push('swallow '+R("JSON.stringify({st:Game.state,php:Player.hp,stun:TW.giant.stun})"));
  // phase II via the transition, then the buffet
  R("hzgHurt(9999,'test')"); for(let s=0;s<80&&R("TW.giant&&TW.giant.phase")===1;s++) drive(.5); drive(2); out.push('hamza phase '+R("TW.giant&&TW.giant.phase")+' '+R("Game.state"));
  for(let s=0;s<60&&!R("Game.state==='play'&&!Game.script");s++) drive(.5); R("(function(){ const G=TW.giant; G.hp=G.maxHp*.55; hzgHurt(G.maxHp*.1,'test'); })()"); out.push('buffet started lc='+R("TW.giant&&TW.giant.lcDone")); for(let s=0;s<80&&!R("TW.giant&&TW.giant.stun>0&&TW.giant.lcDone&&!TW.giant.gen");s++) drive(.5); out.push("buffet done "+R("JSON.stringify(TW.giant?{lc:TW.giant.lcDone,stun:TW.giant.stun,st:Game.state}:{gone:1,st:Game.state})")+' errs='+B.errs.length);
  drive(5); R("hzgHurt(9999,'test')"); for(let s=0;s<120&&R("!!TW.giant");s++) drive(.5); out.push('after frenzy+finale: giant='+R("!!TW.giant")+' fight='+R("TW.fight&&TW.fight.kind")+' st='+R("Game.state")); }
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
