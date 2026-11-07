// Kojima's skins stay in his moves: a tape/shredder move cut short leaves twBeam/twHoleVis clean for the next fight
const B=require('./bot2.js'); const R=B.R, H=B.H; const out=[];
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; twUnlockAll(true);");
function step(s){ for(let i=0;i<s*60;i++){ R("if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; } Player.hp=Player.maxHp;"); H.frames(1); } }
R("run(function*(){ yield* twWarp('sh_cao_g'); })"); for(let i=0;i<200&&!R("!!Game.boss&&Game.state==='play'&&!Game.script&&Game.boss.state!=='intro'");i++) step(.5);
out.push('kojima '+R("!!Game.boss"));
// count skin visuals: a tape vis adds meshes without userData.tw; count calls instead
R("globalThis.__tape=0; const tv=kjTapeVis; kjTapeVis=function(){ __tape++; return tv.apply(this,arguments); }; globalThis.__shred=0; const sv=kjShredVis; kjShredVis=function(){ __shred++; return sv.apply(this,arguments); };");
for(const k of ['tape','shredder']){ R(`(function(){ const K=Game.boss; K.state='kj'; K.st=0; K.kjg=KJM.${k}(K,K.phase||1); K.kjw=0; })()`); step(1.2); out.push(k+' in move: tape '+R('__tape')+' shred '+R('__shred'));
  // cut short: a stagger takes the move (its finally never runs)
  R("(function(){ const K=Game.boss; K.kjg=null; K.state='idle'; })()"); step(.2); }
// after: a plain beam and a plain hole outside his move are not skinned
const t0=R('__tape'), s0=R('__shred'); R("twBeam({x:Player.x,z:Player.z,ang:0,len:10,warn:.3,dur:.2}); twHoleVis(Player.x,1,Player.z,1).kill();"); step(.3);
out.push('outside his move: new tape '+(R('__tape')-t0)+' new shred '+(R('__shred')-s0)+' skin flag '+R('KJS.skin'));
console.log(out.join('\n')); console.log('ERRORS',B.errs.length); [...new Set(B.errs)].slice(0,5).forEach(e=>console.log(' !',e));
