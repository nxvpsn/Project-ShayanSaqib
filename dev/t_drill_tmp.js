const B=require('./bot2.js'); const R=B.R, H=B.H;
R("Game.state='cut'; newGame();"); H.frames(20); R("Game.script=null; Game.dlg=null; Game.state='play'; Game.hamza.mode='follow';");
R("for(const n in PXV_ATLAS){ PXV.tex[n]=new THREE.Texture(); PXV.ready[n]=1; }");
function go(label){ R("Player.sp=100; run(specialAttack)"); let maxL=0, kinds=new Set(), peeSeen=0, smears=0;
  for(let i=0;i<60*14&&R("!!Game.script");i++){ H.frames(1); maxL=Math.max(maxL,R("PXV.list.length")); R("PXV.list.forEach(e=>{ for(const k in PXV_ATLAS) if(PXV_ATLAS[k]===e.A) (globalThis.__k=globalThis.__k||new Set()).add(k); })"); if(R("PXV.list.some(e=>e.A===PXV_ATLAS.pee_stream)")) peeSeen++; if(R("PXV.list.some(e=>e.fade)")) smears++; }
  console.log(label,'max sprites',maxL,'kinds',R("[...globalThis.__k].join(',')"),'pee frames',peeSeen,'smear frames',smears,'script',R("!!Game.script")); R("globalThis.__k=new Set()"); H.frames(90); console.log(' left',R("PXV.list.length")); }
R("MOBS.length=0"); go('single');
R("for(let i=0;i<3;i++){ const m=makeMob('hound',Player.x+3+i,Player.z+1); MOBS.push(m); }"); go('swarm');
console.log('errors',B.errs.length,[...new Set(B.errs)].slice(0,5));
