// Checks for the reworked Caotan / Omar mechanics (timed parries, rally scythe, black hole, sentence, tear, Iai, moon match).
// REAL=1 node t_tw3.js ext.js   (ONLY=name to run one check)
if(process.env.SEED){ let sd=+process.env.SEED; Math.random=()=>{ sd=(sd*16807)%2147483647; return (sd-1)/2147483646; }; }
const B=require('./bot2.js'); const R=B.R, H=B.H; const ONLY=process.env.ONLY;
R("Game.state='cut'; newGame();"); H.frames(20); R("(function(){ const h=hurtPlayer; hurtPlayer=function(d,...a){ globalThis.__dmg=(globalThis.__dmg||0)+d; if(globalThis.__DBG) console.log('HURT',d,Game.time.toFixed(2),JSON.stringify((TW._clones||[]).map(c=>[c.i,c.st,c.res?+c.res.toFixed(2):0,c.decided?1:0,+(c.from||0).toFixed(2)])),new Error().stack.split('\\n').slice(2,6).join(' | ')); return h.call(this,0,...a); }; })()"); R("Game.script=null; Game.dlg=null; twUnlockAll(true);"); if(process.env.DBG) R('globalThis.__DBG=1');
function warp(id){ R(`run(function*(){ yield* twWarp('${id}'); })`); for(let i=0;i<400;i++){ R("if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=0; hit.confirm=true; }"); H.frames(15); if(R("Game.state==='play'&&!Game.script")) break; } }
// per-frame driver: js runs before each frame with P, T in scope
function drive(sec,js){ for(let i=0;i<Math.round(sec*60);i++){ R(`(function(){ const P=Player, T=TW.foes[0]; if(Game.dlg&&Game.dlg.t>.35){ if(Game.dlg.type==='choice') Game.dlg.sel=0; hit.confirm=true; } ${js||''} })()`); H.frames(1); } }
const out=[], fail=[]; function check(name,ok,info){ const l=(ok?'PASS ':'FAIL ')+name+(info?'  '+info:''); out.push(l); console.log(l); if(!ok) fail.push(name); }
function start(who,k,ph,o){ R(`(function(){ const T=TW.foes.find(t=>t.who==='${who}'); T.phase=${ph}; T.stun=0; T.hp=T.maxHp=500; T.inv=false; T.hide=0; T.state='atk'; T.last='${k}'; T.cd=99; T.noAttack=1; T.lcDone={2:1,3:1}; TW.fight.cd=()=>99;
  const P=Player, Bc=twBounds(); T.x=(Bc.x0+Bc.x1)/2; T.z=(Bc.z0+Bc.z1)/2-2.25; T.y=groundY(T.x,T.z)+T.hy; T.mv=null; P.hp=P.maxHp=12; globalThis.__dmg=0; P.inv=0; P.hurt=0; P.dash=0; P.rootT=0; P.counter=0; P.x=T.x; P.z=T.z+4.5; P.y=groundY(P.x,P.z); P.vx=P.vz=0; release('attack'); release('dash'); held.left=held.right=held.up=held.down=false; TW.god=false; TW.presses=[];
  twClearHz(); BOLTS.forEach(b=>b.dead=1); TW.bh=null; TW.dark=null; Game.dmgNums=[]; T.gen=TWK.${who}.${k}(T,${ph}); T.wait=0; globalThis.__t0=Game.time; ${o||''} })()`); }
const busy=who=>R(`!!(TW.foes.find(t=>t.who==='${who}')||{}).gen`);
const tap="if(held.attack) release('attack'); else if(globalThis.__want){ press('attack'); globalThis.__want=0; }";
const mash="if(held.attack) release('attack'); else if(Math.random()<.45) press('attack');";
const want=c=>`if(!globalThis.__w${c}&&(${c})){ globalThis.__w${c.length}=1; globalThis.__want=1; }`;
const run=(n,f)=>{ if(ONLY&&!ONLY.split(',').some(o=>n.startsWith(o))) return; try{ f(); }catch(e){ check(n,false,'threw '+e.message); } };

let __T=Date.now(); warp("sh_cao_f"); drive(1); console.log("warp cao",Date.now()-__T);
// --- Caotan Triple Rush ---
run('tsun.mash',()=>{ start('caotan','tsun',2); let early=0; for(let s=0;s<80&&busy('caotan');s++){ drive(.1,mash); if(R("Game.dmgNums.some(d=>d.n==='TOO EARLY')")) early=1; }
  check('tsun.mash',early&&R("TW.foes[0].stun<=0"),'early punish='+early); });
run('tsun.perfect',()=>{ start('caotan','tsun',2,"globalThis.__lx=T.x; globalThis.__lz=T.z; globalThis.__pressed=0;"); let st=0;
  for(let s=0;s<600&&busy('caotan');s++){ drive(1/60,`const mv=Math.hypot(T.x-__lx,T.z-__lz); __lx=T.x; __lz=T.z; if(held.attack) release('attack'); else if(T.lockF&&mv>.2&&Math.hypot(P.x-T.x,P.z-T.z)<TW_DASH_R+17*.12&&Game.time-(__pressed||0)>.5){ press('attack'); __pressed=Game.time; }`); if(R("TW.foes[0].stun>2")) st=1; }
  check('tsun.perfect',st&&!R("Game.dmgNums.some(d=>d.n==='TOO EARLY')"),'stun='+R("TW.foes[0].stun.toFixed(2)")); });
run('tsun.idle',()=>{ start('caotan','tsun',2); for(let s=0;s<60&&busy('caotan');s++) drive(.1); check('tsun.idle',R("__dmg")>0&&R("TW.foes[0].stun<=0")); });

__T=Date.now(); warp("sh_omar_f"); drive(1); console.log("warp omar",Date.now()-__T);
// --- Reap / Shadow Step: mashing never parries, a timed press does ---
const reapPerfect=`if(T.hide){ globalThis.__seen=0; } else if(T.scythe&&!T.swing&&!__seen){ __seen=Game.time; } if(held.attack) release('attack'); else if(__seen&&Game.time-__seen>=__tell-.12&&!__did){ press('attack'); __did=1; } if(T.hide) __did=0;`;
run('reap.mash',()=>{ start('omar','reap',1); for(let s=0;s<60&&busy('omar');s++) drive(.1,mash); check('reap.mash',!R("Game.dmgNums.some(d=>/parried the edge/.test(Game.subtitle&&Game.subtitle.text||''))")&&R("TW.foes[0].stun<=0")); });
run('reap.perfect',()=>{ start('omar','reap',1,"globalThis.__seen=0; globalThis.__did=0; globalThis.__tell=.45/twSp(T);"); let st=0; for(let s=0;s<200&&busy('omar');s++){ drive(1/60,reapPerfect); if(R("TW.foes[0].stun>1")) st=1; } check('reap.perfect',st); });
run('blink.mash',()=>{ start('omar','blinkcut',3); for(let s=0;s<60&&busy('omar');s++) drive(.1,mash); check('blink.mash',R("TW.foes[0].stun<=0")); });
// --- Clones: mash does not shatter them ---
run('clones.mash',()=>{ start('omar','clones',3); let grab=0; for(let s=0;s<120&&busy('omar');s++){ drive(.1,mash); if(R("Game.dmgNums.some(d=>d.n==='TOO EARLY')")) grab=1; } check('clones.mash',grab&&R("__dmg")>0&&!R("Player.cineFly"),'dmg '+R("__dmg")); });
run('clones.perfect',()=>{ start('omar','clones',3); let sh=0; for(let s=0;s<60*12&&busy('omar');s++){ drive(1/60,"if(held.attack) release('attack'); else if(globalThis.__DBG){ const c=(TW._clones||[])[4]; if(c&&c.st==='dash') console.log('C4',Game.time.toFixed(3),'d',Math.hypot(P.x-c.x,P.z-c.z).toFixed(2),'along',((P.x-c.x)*Math.cos(c.a)+(P.z-c.z)*Math.sin(c.a)).toFixed(2),'P',P.x.toFixed(2),P.z.toFixed(2),'slow',Game.slowT.toFixed(2),'hs',FX.hitstop.toFixed(2),'gl',c.glint); } for(const c of TW._clones||[]){ if(c.glint&&!c.__p){ c.__p=1; press('attack'); if(globalThis.__DBG&&0) console.log('PRESS',c.i,Game.time.toFixed(2),'from',c.from.toFixed(2),c.st,'hurt',P.hurt.toFixed(2),'inv',P.inv.toFixed(2),'cine',P.cineFly,'state',Game.state); break; } }"); sh=Math.max(sh,R("Game.dmgNums.filter(d=>d.n==='SHATTER').length")); }
  check('clones.perfect',R("__dmg")===0&&!R("Game.dmgNums.some(d=>d.n==='TOO EARLY')"),'dmg '+R("__dmg")+' shatters seen '+sh); });
run('clones.idle',()=>{ start('omar','clones',2); for(let s=0;s<60*12&&busy('omar');s++) drive(1/60); check('clones.idle',R("__dmg")>0&&!R("Game.dmgNums.some(d=>d.n==='TOO EARLY')"),'dmg '+R("__dmg")); });
run('bh.suck',()=>{ start('omar','scythes',3); drive(1.5); const before=R("BOLTS.filter(b=>!b.dead&&b.rally).length"); R("(function(){ const T=TW.foes[0]; T.gen=TWK.omar.orbs(T,3); T.wait=0; })()"); drive(.2); check('bh.suck',before===2&&R("BOLTS.filter(b=>!b.dead&&!b.friendly).length")===0,'rallies before '+before); for(let s=0;s<60*8&&busy('omar');s++) drive(1/60,"P.inv=99;"); R("Player.inv=0"); });
// --- Rally scythe: three returns, the 4th deflect hurts Omar; phase III last return fast ---
for(const ph of [1,3]) run('rally.p'+ph,()=>{ start('omar','scythes',ph,"P.x=T.x; P.z=T.z+6;"); let ret=0, hurt=0; const hp0=R("TW.foes[0].hp"); globalThis.__n=0;
  for(let s=0;s<60*30;s++){ drive(1/60,"for(const b of BOLTS){ if(b.rally&&!b.dead&&!b.friendly&&!(b.delay>0)&&Math.hypot(b.x-P.x,b.z-P.z)<1.6) reflectProj(b,'deflect'); else if(!b.rally&&!b.friendly&&!b.dead) b.dead=1; }");
    const n=R("(BOLTS.find(b=>b.rally&&!b.dead)||{rally:{n:-1}}).rally"); if(R("TW.foes[0].hp")<hp0){ hurt=1; break; } if(process.env.DBG&&s%20===0) console.log(R("JSON.stringify(BOLTS.filter(b=>b.rally&&!b.dead).map(b=>[b.rally.n,b.friendly,+b.x.toFixed(1),+b.z.toFixed(1),+Math.hypot(b.vx,b.vz).toFixed(1),+(b.delay||0).toFixed(2)]))+' P '+Player.x.toFixed(1)+','+Player.z.toFixed(1)+' T '+TW.foes[0].x.toFixed(1)+','+TW.foes[0].z.toFixed(1)+' '+Game.dmgNums.map(d=>d.n).join('|')")); if(s>60&&!R("BOLTS.some(b=>!b.dead&&b.kind==='scythe')")) break; }
  check('rally.p'+ph,hurt,'omar hp '+hp0+'->'+R("TW.foes[0].hp")); });
// --- Black hole: idle = eaten, 2 dashes a second away from it = safe ---
const away=`const H=TW.bh; if(H){ const dx=P.x-H.x, dz=P.z-H.z; held.right=dx>.3; held.left=dx<-.3; held.down=dz>.3; held.up=dz<-.3; if(Game.time-(globalThis.__dt||0)>=__gap){ hit.dash=true; __dt=Game.time; } globalThis.__md=Math.min(globalThis.__md==null?99:__md,Math.hypot(dx,dz)); globalThis.__ds=(globalThis.__ds||[]); __ds.push(Math.hypot(dx,dz)); }`;
for(const [name,gap,expect,par] of [['bh.idle',99,true,0],['bh.dash1',1,null,1],['bh.dash2',.5,false,1],['bh.dash2.noparry',.5,null,0]]) run(name,()=>{ start('omar','orbs',2,`P.x=T.x; P.z=T.z+5; globalThis.__gap=${gap}; globalThis.__dt=0; globalThis.__md=null; globalThis.__ds=[];`); let eaten=0;
  for(let s=0;s<60*8&&busy('omar');s++){ drive(1/60,away+(par?"if(held.attack) release('attack'); else if(T.rushEta&&Game.time>=T.rushEta-.15&&Game.time-(globalThis.__pp||0)>.5){ press('attack'); __pp=Game.time; }":"")); if(R("Game.dmgNums.some(d=>d.n==='EATEN')")) eaten=1; if(process.env.DBG&&s%6===0) console.log(R("(TW.bh?(Math.hypot(Player.x-TW.bh.x,Player.z-TW.bh.z).toFixed(2)+' t'+TW.bh.t.toFixed(2)):'-')+' dash'+Player.dash.toFixed(2)+' hurt'+Player.hurt.toFixed(2)+' '+Game.dmgNums.map(d=>d.n).join(',')")); }
  const ds=R("JSON.stringify(__ds.filter((d,i)=>i>90))"); const arr=JSON.parse(ds), avg=arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
  check(name,expect==null||!!eaten===expect,'eaten='+eaten+' avg dist '+avg.toFixed(2)); R("held.left=held.right=held.up=held.down=false;"); });
// --- Sentence: standing still is death; a dash after the drop starts saves you ---
run('sentence.stand',()=>{ start('omar','sentence',2); for(let s=0;s<60*6&&busy('omar');s++) drive(1/60); check('sentence.stand',R("__dmg")>=99); });
run('sentence.dodge',()=>{ start('omar','sentence',2,"globalThis.__d=0;"); 
  for(let s=0;s<60*6&&busy('omar');s++) drive(1/60,"const S=TW.sentence; if(S&&S.n===0&&!__d){ __d=Game.time; } if(__d&&(Math.abs(Game.time-__d-.08)<.009||Math.abs(Game.time-__d-.68)<.009)){ const Bd=twBounds(); held.right=P.x<(Bd.x0+Bd.x1)/2; held.left=!held.right; hit.dash=true; }"+(process.env.DBG?" if(__d&&Game.time-__d<1.2) console.log((Game.time-__d).toFixed(2),P.x.toFixed(2),P.z.toFixed(2),P.dash.toFixed(2),P.dashCd.toFixed(2),P.hurt.toFixed(2),__dmg,held.left,held.right);":""));
  R("held.left=held.right=false;"); check('sentence.dodge',R("__dmg")<99,'dmg '+R("__dmg")); });
// --- Tear: through the right scar, two slashes in one trip break the orb; one slash per trip takes two trips ---
for(const [name,slashes] of [['tear.skilled',2],['tear.casual',1]]) run(name,()=>{ start('omar','tear',3); let trips=0;
  for(let s=0;s<60*20;s++){ drive(1/60); if(R("!!(TW.tear&&TW.tear.orb&&TW.tear.linked&&!TW.foes[0].gen)")) break; }
  for(let trip=0;trip<4&&R("!!(TW.tear&&TW.tear.orb)");trip++){ trips++;
    R("(function(){ const R=TW.tear, s=R.scars.find(s=>s.link==='sky'), P=Player; P.x=s.x-.5; P.z=s.z; P.y=groundY(P.x,P.z); P.vx=P.vz=0; P.portalCd=0; held.right=true; hit.dash=true; P.ang=0; })()");
    let inSky=0; for(let i=0;i<40&&!inSky;i++){ drive(1/60); if(process.env.DBG&&i<6) console.log('F',i,R("(function(){ const P=Player,R=TW.tear; return JSON.stringify({P:[P.x,P.y,P.z].map(v=>+v.toFixed(2)),scars:R.scars.map(s=>[s.link,+Math.hypot(P.x-s.x,P.z-s.z).toFixed(2),+(P.y+.8-s.y).toFixed(2)]),cd:+((P.portalCd||0)-Game.time).toFixed(2),sc:!!Game.script,w:Game.wait&&Game.wait.type,dlg:Game.dlg&&Game.dlg.text,cine:!!Cam.cine,pend:!!(TW.fight&&TW.fight.pend),foe:TW.foes[0].hp+'/'+TW.foes[0].state,st:Game.state,dash:+P.dash.toFixed(2),hurt:+P.hurt.toFixed(2)}); })()")); inSky=R("Player.y>groundY(Player.x,Player.z)+3")?1:0; }
    if(slashes===2) drive(.6,"const O=TW.tear&&TW.tear.orb; if(O) P.ang=Math.atan2(O.z-P.z,O.x-P.x); if(held.attack) release('attack'); else press('attack'); if(Game.time-(globalThis.__j||0)>.25&&Player.vy<0){ hit.jump=true; __j=Game.time; }");
    else { if(process.env.DBG) console.log('TRIP',trip,R("(function(){ const R=TW.tear,O=R.orb,P=Player; return JSON.stringify({O:[O.x,O.y,O.z].map(v=>+v.toFixed(2)),Rx:[R.x,R.y,R.z].map(v=>+v.toFixed(2)),P:[P.x,P.y,P.z].map(v=>+v.toFixed(2)),v:[P.vx,P.vy,P.vz].map(v=>+v.toFixed(1)),dash:+P.dash.toFixed(2),script:!!Game.script,hp:O.hp}); })()")); for(let i=0;i<40;i++){ if(R("(function(){ const O=TW.tear&&TW.tear.orb, P=Player; return !!O&&Math.hypot(O.x-P.x,O.z-P.z)<1.6; })()")) break; drive(1/60); } R("press('attack')"); if(process.env.DBG) for(let i=0;i<14;i++){ drive(1/60); console.log(R("(function(){ const O=TW.tear&&TW.tear.orb,P=Player; return O?JSON.stringify({d:+Math.hypot(O.x-P.x,O.z-P.z).toFixed(2),dv:+(O.y-P.y-1).toFixed(2),atk:P.atk?+P.atk.t.toFixed(2):null,ang:+P.ang.toFixed(2),hp:O.hp}):'no orb'; })()")); } drive(.05); R("release('attack')"); drive(.6); }
    R("held.right=false;"); drive(1.4,"P.portalCd=Game.time+1;"); }
  check(name,!R("!!(TW.tear&&TW.tear.orb)")&&trips===(slashes===2?1:2),'trips='+trips); });
run('tear.fake',()=>{ start('omar','tear',3); for(let s=0;s<60*20;s++){ drive(1/60); if(R("!!(TW.tear&&TW.tear.linked&&!TW.foes[0].gen)")) break; }
  check('tear.count',R("TW.tear.scars.length")===6&&R("TW.tear.scars.filter(s=>s.link==='sky').length")===1);
  R("(function(){ const R=TW.tear, s=R.scars.find(s=>s.link==='fake'), P=Player; P.x=s.x; P.z=s.z; P.y=groundY(P.x,P.z); P.portalCd=0; globalThis.__fx=P.x; globalThis.__fz=P.z; })()"); drive(1/60); const sc=R("!!Game.script");
  let maxY=0; for(let i=0;i<60*12&&R("!!Game.script");i++){ drive(1/60); maxY=Math.max(maxY,R("Player.y-groundY(Player.x,Player.z)")); }
  drive(1.6); check('tear.fake',sc&&R("__dmg")>=6&&maxY>20&&!R("!!Cam.cine")&&R("Game.state")==='play'&&!R("Player.cineFly"),'dmg '+R("__dmg")+' top '+maxY.toFixed(1)+' landed '+R("Math.hypot(Player.x-__fx,Player.z-__fz).toFixed(1)")+' from the scar');
  drive(16,"P.portalCd=Game.time+1;"); check('tear.timeout',!R("!!TW.tear")); });
run('tear.laser',()=>{ start('omar','tear',3); drive(8,"P.portalCd=Game.time+1;"); if(process.env.DBG) console.log(R("JSON.stringify({orb:!!(TW.tear&&TW.tear.orb),t:TW.tear&&TW.tear.t,P:[Player.x,Player.y,Player.z]})")); check('tear.laser',R("__dmg")>0,'dmg '+R("__dmg")); drive(10); });
// --- Moon scythe: untouched for 3s it explodes and does not dye your moon ---
run('moon.explode',()=>{ start('omar','sentence',3,"T.gen=null; T.state='lc'; TW.moon={T,om:'w',pl:null,left:9,total:9,pulse:0}; twMoonScythe(T,'w',1,1.25);"); for(let i=0;i<220;i++) drive(1/60,"P.x=T.x+6; P.z=T.z+5; P.vx=P.vz=0; P.inv=99;"); R("Player.inv=0");
  check('moon.explode',R("TW.moon.pl")==null&&!R("TW.hz.length>3"),'pl='+R("TW.moon.pl")); R("TW.moon=null; TW.foes[0].state='idle';"); });
run('moon.dye',()=>{ start('omar','sentence',3,"T.gen=null; T.state='lc'; TW.moon={T,om:'w',pl:null,left:9,total:9,pulse:0}; twMoonScythe(T,'p',1,1.25);"); drive(2.4);
  check('moon.dye',R("TW.moon.pl")==='p','pl='+R("TW.moon.pl")); R("TW.moon=null; TW.foes[0].state='idle';"); });
// --- Iai: a perfect player clears 20 parries; swinging on red is death ---
const iaiBot="if(!globalThis.__p15&&Game.dmgNums.some(d=>d.n==='PARRY 15/15')) globalThis.__p15=Game.time; if(globalThis.__p15&&!TW.iai&&!globalThis.__iend) globalThis.__iend=Game.time; const g=TW.iai&&TW.iai.cur; if(held.attack) release('attack'); if(g&&g.real&&!(globalThis.__sd||(__sd={}))[g.t0]&&Game.time>=g.t0+.12){ __sd[g.t0]=1; P.ang=g.a; press('attack'); }";
run('iai.perfect',()=>{ start('omar','sentence',3,"T.gen=(function*(){ yield* twOmarIai(T); })(); T.state='lc'; globalThis.__sd={}; globalThis.__p15=0; globalThis.__iend=0;"); let t=0, died=0;
  for(;t<60*240&&R("!!TW.iai||!!TW.foes[0].gen");t++){ drive(1/60,iaiBot); if(R("Game.state==='dead'")){ died=1; break; } }
  const gapEnd=R("(Game.dmgNums.find(d=>d.n==='PARRY 15/15')||{t:99}).t"); check('iai.perfect',R("__dmg")===0&&!R("!!TW.iai")&&gapEnd<.1,'ended '+gapEnd.toFixed(3)+'s after parry 15, '+'took '+(t/60).toFixed(0)+'s, dmg '+R("__dmg")); });
run('moon.lc2',()=>{ start('omar','sentence',3,"TW.iaiCk=0; T.gen=TWK.omar.lc2(T); T.state='lc';"); let sent=0, matched=0, blackout=0, iai=0, hovers=0, t=0;
  for(;t<60*60&&!iai;t++){ drive(1/60,"P.inv=99; if(TW.moon&&TW.moon.om) TW.moon.pl=TW.moon.om;"); if(R("!!TW.sentence")) sent=1; hovers=Math.max(hovers,R("(TW.hovers||[]).filter(h=>h.st==='track').length")); if(R("!!TW.blackout")) blackout=1; if(R("!!TW.iai")) iai=1; }
  matched=R("Game.dmgNums.filter(d=>d.n==='MOON MATCHED').length"); R("Player.inv=0");
  check('moon.lc2',sent&&hovers>=2&&blackout&&iai&&R("__dmg")<99&&R("!Cam.cine")&&R("TW.dark&&TW.dark.k>.9"),'sentence loop '+sent+' (2 hovering: '+hovers+'), blackout '+blackout+', into the Iai '+iai+' after '+(t/60).toFixed(1)+'s');
  R("twClearHz(); TW.iai=null; TW.dark=null; TW.foes[0].gen=null; TW.foes[0].state='idle';"); });
run('moon.wrong',()=>{ start('omar','sentence',3,"TW.iaiCk=0; T.gen=TWK.omar.lc2(T); T.state='lc';"); let t=0; for(;t<60*30&&R("__dmg")<99;t++) drive(1/60,"P.inv=99; if(TW.moon&&TW.moon.om) TW.moon.pl=TW.moon.om==='w'?'p':'w';");
  check('moon.wrong',R("__dmg")>=99,'washed away after '+(t/60).toFixed(1)+'s'); R("Player.inv=0; twClearHz(); TW.moon=null; TW.dark=null; TW.foes[0].gen=null; TW.foes[0].state='idle';"); });
run('omar.hp3',()=>{ check('omar.hp3',R("twHPFor(3,'omar')")===R("twHPFor(3)")*1.4&&R("twHPFor(2,'omar')")===R("twHPFor(2)")&&R("twHPFor(3,'caotan')")===R("twHPFor(3)"),'omar p3 '+R("twHPFor(3,'omar')")+' vs '+R("twHPFor(3)")); });
run('moon.w2',()=>{ start('omar','sentence',3,"T.gen=null; T.state='lc'; TW.moon={T,om:null,pl:null,left:0,total:0,pulse:0}; TW._moonS=[]; T.gen=(function*(){ yield* twMoonRound(T,OM_WAVE23,[.15],2,1); })();");
  for(let i=0;i<60*2.2;i++) drive(1/60,"P.inv=99;"); const n=R("(function(){ const M=TW.moon; return [TW._moonS.length,TW._moonS.filter(s=>s.col===M.om).length]; })()");
  for(let i=0;i<60*3;i++) drive(1/60,"P.inv=99;"); R("Player.inv=0; TW.moon=null; TW.foes[0].gen=null; TW.foes[0].state='idle';"); check('moon.w2',n[0]===5&&n[1]===2,'scythes '+n[0]+', of his colour '+n[1]); });
run('moon.view',()=>{ start('omar','sentence',3,"T.gen=null; T.state='lc'; TW.moon={T,om:'w',pl:null,left:9,total:9,pulse:0}; globalThis.__out=0; for(let i=0;i<6;i++) twMoonScythe(T,i%2?'w':'p',i%2?1:-1,1.25);"); let out=0;
  for(let i=0;i<60*3.2;i++){ drive(1/60,"P.inv=99; P.x=T.x+3; P.z=T.z+7;"); out=Math.max(out,R("(function(){ const V=twViewBox(); let o=0; for(const m of TW._moonS||[]){ if(m.done) continue; o=Math.max(o,V.x0-m.px,m.px-V.x1,V.z0-m.pz,m.pz-V.z1); } return o; })()")); }
  R("Player.inv=0; TW.moon=null; TW.foes[0].state='idle';"); check('moon.view',out<.6,'furthest outside the view '+out.toFixed(2)); });
run('spiral',()=>{ start('omar','sentence',3,"T.gen=null; T.state='idle'; T.hp=T.maxHp=280; T.spiral=0;"); const said=[];
  for(const f of [.9,.8,.65,.45,.3,.2,.1,.03]){ R(`(function(){ const T=TW.foes[0]; T.state='idle'; twHurt(T,T.hp-T.maxHp*${f},'test'); })()`); said.push(R("Game.subtitle?Game.subtitle.text.slice(0,18):''")); }
  check('spiral',R("TW.foes[0].spiral")===7&&new Set(said).size>=7,said.join(' | ')); });
run('music',()=>{ R("Sound.play('mp3:omar'); Sound.play('mp3:caotan:12'); Sound.play('battle'); Sound.stop();"); check('music',R("TW_MUSIC.omar.slice(1).every(n=>n==='mp3:omar')")&&R("TW_SONG.omar")==='audio/omar.mp3'&&!R("'omar12' in TW_SONG")); });
run('gate',()=>{ R("(function(){ twGateRestart(); TW.fight.cd=()=>99; for(const T of TW.foes){ T.cd=99; T.noAttack=1; } })()"); drive(.5); const ok=[];
  for(const [who,k] of [['caotan','gooG'],['caotan','glintG'],['caotan','lettersG'],['omar','scythesG'],['omar','reapG'],['omar','handsG']]){
    R(`(function(){ const T=TW.foes.find(t=>t.who==='${who}'); T.state='atk'; T.gen=TWK.${who}.${k}(T,2); T.wait=0; globalThis.__dmg=0; })()`);
    for(let s=0;s<60*6&&R(`!!TW.foes.find(t=>t.who==='${who}').gen`);s++) drive(1/60,"if(Math.random()<.1){ if(held.attack) release('attack'); else press('attack'); }"); ok.push(k+':'+(R(`!TW.foes.find(t=>t.who==='${who}').gen`)?'ok':'stuck')+'/'+R("__dmg")); }
  const cdA=R("TW.fight.kind"); R("twHurt; globalThis.__dmg=0; hurtPlayer(2,Player.x,Player.z); hurtPlayer(3,Player.x,Player.z); hurtPlayer(99,Player.x,Player.z);");
  check('gate',ok.every(o=>/ok/.test(o))&&R("__dmg")===2+3+99&&R("twGate()"),ok.join(' ')+' | pools '+R("TWPOOL.caotan.gate.join(',')+' '+TWPOOL.omar.gate.join(',')")); warp('sh_omar_f'); drive(1); });
run('iai.mid',()=>{ start('omar','sentence',3,"T.gen=(function*(){ yield* twOmarIai(T); })(); T.state='lc'; globalThis.__sd={};"); let t=0;
  for(;t<60*120&&R("!!TW.iai||!!TW.foes[0].gen");t++) drive(1/60,"if(TW.iai) TW.iai.need=4; "+iaiBot);
  const g=R("(Game.dmgNums.find(d=>d.n==='PARRY 4/4')||{t:99}).t"); check('iai.mid',g<.1,'ended '+g.toFixed(3)+'s after the 4th parry (mid-combo)'); });
run('iai.red',()=>{ start('omar','sentence',3,"T.gen=(function*(){ yield* twOmarIai(T); })(); T.state='lc';"); let died=0;
  for(let t=0;t<60*90&&R("!!TW.iai||!!TW.foes[0].gen");t++){ drive(1/60,"const g=TW.iai&&TW.iai.cur; if(held.attack) release('attack'); if(g&&!g.real&&Game.time>=g.t0+.05){ press('attack'); }"); if(R("__dmg>=99")){ died=1; break; } }
  check('iai.red',died); R("TW.iai=null;"); });
// --- Lights Out: not found = no stun ---
run('lightsout.miss',()=>{ start('omar','lc1',2); for(let s=0;s<60*40&&busy('omar');s++) drive(1/60); check('lightsout.miss',R("TW.foes[0].stun<=0&&TW.foes[0].state!=='stun'")); });
run('sekiro.p3',()=>{ start('omar','sekiro',3); drive(.5); R("twHurt(TW.foes[0],1,'melee')"); drive(.2); R("twHurt(TW.foes[0],1,'melee')"); let bound=0; for(let s=0;s<60*6&&busy('omar');s++){ drive(1/60); if(R("TW.bound")) bound=1; } check('sekiro.p3',bound&&R("__dmg")>=9,'dmg '+R("__dmg")); });
run('hands.root',()=>{ start('omar','sentence',2,"T.gen=null;"); R("twHandRoot()"); const r0=R("Player.rootT"); drive(1); R("twHandRoot()"); check('hands.root',R("Player.rootT")===r0&&R("Player.hurt")<1.1&&R("Player.hurt")>.8,'rootT kept, hurt '+R("Player.hurt.toFixed(2)")); drive(1.2); });
run('lightsout.fake',()=>{ start('omar','lc1',2); for(let s=0;s<60*30&&busy('omar');s++){ drive(1/60,"const K=TW.dark; if(K&&K.eyes.some(e=>e.real)){ const e=K.eyes.find(e=>!e.real&&!e.dead); if(e){ P.x=e.x; P.z=e.z; P.atk={t:0,n:0,hit:new Set(),q:false}; } }"); if(R("__dmg")>=6) break; } check('lightsout.fake',R("__dmg")>=6,'dmg '+R("__dmg")); for(let s=0;s<60*20&&busy('omar');s++) drive(1/60,"P.atk=null;"); });
run('harvest.dodge',()=>{ start('omar','harvest',3); const hp0=R("TW.foes[0].hp"); for(let s=0;s<60*16;s++) drive(1/60,"P.inv=99;"); R("Player.inv=0"); check('harvest.dodge',R("TW.foes[0].hp")<hp0,'omar '+hp0+'->'+R("TW.foes[0].hp")); });
run('harvest.idle',()=>{ start('omar','harvest',3); for(let s=0;s<60*16;s++) drive(1/60); check('harvest.idle',R("__dmg")>0&&R("__dmg")<=12,'dmg '+R("__dmg")); });
run('plant',()=>{ start('omar','scythes',1); for(let s=0;s<60*4;s++) drive(1/60,"for(const b of BOLTS){ if(!b.dead&&!b.friendly&&!b.rally&&!(b.delay>0)&&Math.hypot(b.x-P.x,b.z-P.z)<2) reflectProj(b,'deflect'); else if(b.rally) b.dead=1; }");
  const n=R("TW.planted.length"); check('plant',n>=2&&!R("BOLTS.some(b=>b.friendly&&b.kind==='scythe'&&!b.dead)"),'planted '+n); });
for(const [name,mode] of [['storm.run',1],['storm.stand',0],['storm.deflect',2]]) run(name,()=>{ start('omar','sentence',3,"T.gen=null; T.state='idle';"); R("(function(){ const P=Player; for(let i=0;i<12;i++) twPlantFly(P.x+rnd(-5,5),groundY(P.x,P.z)+1,P.z+rnd(-4,4)); })()"); drive(1.5);
  const k=R("twPick(TW.foes[0])"); R("(function(){ const T=TW.foes[0]; T.state='atk'; T.last='storm'; T.gen=TWK.omar.storm(T,3); T.wait=0; })()"); const hp0=R("TW.foes[0].hp");
  for(let s=0;s<60*8&&busy('omar');s++) drive(1/60,mode===1?"const k=Math.floor(Game.time/.6)%4; held.left=k===0; held.up=k===1; held.right=k===2; held.down=k===3;":mode===2?"for(const b of BOLTS){ if(b.storm&&!b.dead&&!b.friendly&&Math.hypot(b.x-P.x,b.z-P.z)<2) reflectProj(b,'deflect'); }":"");
  R("held.left=held.up=held.right=held.down=false;"); const d=R("__dmg");
  check(name,k==='storm'&&(mode===0?d>=6:mode===1?d<6:R("TW.foes[0].hp")<hp0),'dmg '+d+' omar '+hp0+'->'+R("TW.foes[0].hp")+' planted left '+R("TW.planted.length")); });
run('harvest.bg',()=>{ start('omar','harvest',3); drive(1.5); const free=!busy('omar'), live=R("TW._harvest.filter(o=>o.st!=='gone').length");
  drive(5.6); const rushing=R("TW._harvest.filter(o=>o.st==='rush'||o.st==='tell').length"); R("(function(){ const T=TW.foes[0]; T.state='atk'; T.gen=TWK.omar.orbs(T,3); T.wait=0; })()"); drive(.1);
  check('harvest.bg',free&&live===12&&R("TW._harvest.every(o=>o.st==='gone')"),'omar free '+free+', souls '+live+', rushing when the hole opened '+rushing); for(let s=0;s<60*8&&busy('omar');s++) drive(1/60,"P.inv=99;"); R("Player.inv=0"); });
run('track',()=>{ start('omar','scythes',1); let tr=0; for(let s=0;s<60*6;s++){ drive(1/60,"P.inv=99; for(const b of BOLTS) if(b.rally) b.dead=1;"); tr=Math.max(tr,R("BOLTS.filter(b=>!b.dead&&b.track).length")); }
  const alive=R("BOLTS.filter(b=>!b.dead&&b.track).length"); for(let s=0;s<60*6&&R("BOLTS.some(b=>!b.dead&&b.track)");s++) drive(1/60,"P.inv=0; for(const b of BOLTS){ if(b.track&&!b.dead&&!(b.delay>0)&&Math.hypot(b.x-P.x,b.z-P.z)<2) reflectProj(b,'deflect'); }");
  drive(1.5); check('track',tr>=2&&alive>=2&&R("TW.planted.length")>=2,'tracking '+tr+', still chasing after 6s '+alive+', planted '+R("TW.planted.length")); });
run('track.lc',()=>{ start('omar','lc1',2); let tr=0; for(let s=0;s<60*20&&busy('omar');s++){ drive(1/60,"P.inv=99;"); tr=Math.max(tr,R("BOLTS.filter(b=>!b.dead&&b.track).length")); } R("Player.inv=0");
  check('track.lc',tr===0); });
run('plant.lc',()=>{ start('omar','sentence',2,"T.gen=null; T.state='idle';"); R("(function(){ const P=Player; for(let i=0;i<3;i++) twPlantFly(P.x+i,groundY(P.x,P.z)+1,P.z+2); })()"); drive(1.5);
  R("twLCPrep(TW.foes[0])"); const k=R("TW.planted.length"); R("TW.foes[0].state='idle'; TW.foes[0].inv=false; twClearHz();"); check('plant.lc',k===3&&R("TW.planted.length")===0,'kept through the limit cut '+k); });
// --- every new move runs clean in every phase ---
for(const k of ['scythes','reap','hands','orbs','sentence','clones','blinkcut','sekiro','harvest','tear','monologue']) for(const ph of [1,2,3]) run('smoke.'+k+ph,()=>{ start('omar',k,ph); for(let s=0;s<60*22&&busy('omar');s++) drive(1/60,"if(Math.random()<.2){ if(held.attack) release('attack'); else press('attack'); } if(Math.random()<.02) hit.dash=true;"); check('smoke.'+k+ph,!busy('omar')); R("twClearHz(); BOLTS.forEach(b=>b.dead=1);"); });
console.log('FAILED',fail.length,fail.join(' ')); console.log('errors',B.errs.length,[...new Set(B.errs)].slice(0,8));
