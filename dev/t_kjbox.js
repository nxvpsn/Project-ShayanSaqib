// Kojima's box hunt: ten boxes in one cluster near you; hitting the real one ends it
const B=require('./bot2.js'); const R=B.R, H=B.H; const out=[];
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; twUnlockAll(true);");
function step(s){ for(let i=0;i<s*60;i++){ R("if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=(Game.dlg.opts.some(o=>/friends/.test(o.t))?1:0); hit.confirm=true; } Player.hp=Player.maxHp;"); H.frames(1); } }
R("run(function*(){ yield* twWarp('sh_cao_g'); })"); for(let i=0;i<200&&!R("!!Game.boss&&Game.state==='play'&&!Game.script&&Game.boss.state!=='intro'");i++) step(.5);
for(let run=0;run<5;run++){ R("(function(){ const K=Game.boss; K.domeDone=0; K.state='idle'; kjBoxesStart(K); })()"); step(1.2);
  out.push(R(`(function(){ const L2=KJB.list, P=Player, n=L2.length, cx=L2.reduce((s,q)=>s+q.x,0)/n, cz=L2.reduce((s,q)=>s+q.z,0)/n; let far=0, near=99, minGap=99, maxPair=0;
    for(const q of L2){ far=Math.max(far,Math.hypot(q.x-cx,q.z-cz)); near=Math.min(near,Math.hypot(q.x-P.x,q.z-P.z)); for(const o of L2) if(o!==q){ const d=Math.hypot(o.x-q.x,o.z-q.z); minGap=Math.min(minGap,d); maxPair=Math.max(maxPair,d); } }
    return 'boxes '+n+' real '+L2.filter(q=>q.real).length+' spread(max pair) '+maxPair.toFixed(1)+' min gap '+minGap.toFixed(1)+' nearest to you '+near.toFixed(1)+' cluster centre from you '+Math.hypot(cx-P.x,cz-P.z).toFixed(1); })()`));
  R("(function(){ const q=KJB.list.find(q=>q.real); kjBoxHit(q); })()"); step(.3); out.push('  found -> state '+R("Game.boss.state")+' list '+R("!!KJB.list")); step(4); }
console.log(out.join('\n')); console.log('ERRORS',B.errs.length); [...new Set(B.errs)].slice(0,5).forEach(e=>console.log(' !',e));
