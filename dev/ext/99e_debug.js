// =====================================================================
// DEBUG MODE (secret, numpad 5): a sandbox in the flower field for playtesting bosses.
// One panel (Tab, or the bar / the touch Debug button) that PAUSES the game while it is open: Setup (hero, cheats, boss),
// Boss (AI mode, HP, kill) and Mechanics grouped in phase tabs (each tab: that phase's limit cuts / phase changes,
// then the moves of that phase's pool). Picking a mechanic closes the panel and plays it; the bar at the bottom left
// stays up during play: Again (R) repeats the last mechanic, Loop (T) toggles repeating it, Panel (Tab) reopens it. Esc closes the panel.
// The AI starts idle (the boss stands still until you run a mechanic).
// Final defeats never advance the story here: the boss just leaves and can be spawned again.
//
// DBG_NEW lists what the latest patch added or changed; those rows (and their boss) show a NEW tag.
// RULE FOR EVERY PATCH (see CLAUDE.md): replace DBG_PATCH and DBG_NEW with the mechanics that patch
// touched, as 'boss:move' keys ('boss:*' tags a whole boss). Boss ids: caotan, omar, duo, hamza, nathan, mech.
// =====================================================================
const DBG_PATCH="v1.19 (Oct 28): his melee moves (combo, grab, the meteor's end) happen at Ali's level (the ground unless Ali is airborne; he floats only between moves); his air-tear on a slash and the rush's cut are cyan, not red; his charge line and the overflow slashes are single clean blades; Ali's parry swings no longer count toward his kick";
const DBG_NEW=['nathan:*'];
const DBG={on:false,open:false,tab:'moves',mph:0,last:null,autoClose:true,boss:null,mode:'idle',move:null,rects:[],hov:null,ali:false,slow:false,blade:true,msg:null};
const DBG_BOSSES=[['caotan','Caotan'],['omar','Omar'],['duo','Twins (duo)'],['hamza','Big Back Hamza'],['nathan','Nathan'],['mech','Cosmic Hamza'],['grimmaw','Kojima ↗'],['paul','Paul ↗']];
// whose road each boss is on: Ali only fights Kojima and Nathan (his Nathan is the third-person phase I of 59v_nbp1.js)
const DBG_ROUTE={shayan:['caotan','omar','duo','hamza','mech','grimmaw','nathan','paul'],ali:['grimmaw','nathan']};
function dbgBossList(){ const ok=DBG_ROUTE[DBG.ali?'ali':'shayan']; return (DBG.ali?ok.map(id=>DBG_BOSSES.find(q=>q[0]===id)):DBG_BOSSES.filter(q=>ok.includes(q[0]))).map(q=>DBG.ali&&q[0]==='nathan'?[q[0],'Nathan (phase I)']:q); } /* Ali's in route order */
function dbgNP1(){ return DBG.boss==='nathan'&&DBG.ali&&typeof NP1!=='undefined'; }
function dbgNew(b,k){ return DBG_NEW.includes(b+':*')||(k?DBG_NEW.includes(b+':'+k):DBG_NEW.some(x=>x.startsWith(b+':'))); }
function dbgName(k){ const S=[...(TH_SPELLS[1]||[]),...(TH_SPELLS[2]||[])].find(s=>s[2]===k); if(DBG.boss==='mech'&&S){ const m=S[0].match(/「(.*)」/); return m?m[1]:S[0]; }
  return String(k).replace(/([a-z])([A-Z0-9])/g,'$1 $2').replace(/^./,c=>c.toUpperCase()); }
function dbgSay(t){ DBG.msg={t,at:performance.now()}; }

// ---------- what is on the field ----------
function dbgKJ(){ return DBG.boss==='grimmaw'&&Game.boss&&Game.boss.state!=='dead'?Game.boss:null; }
function dbgSolo(){ return TW.fight&&TW.fight.kind==='solo'?TW.foes[0]:null; }
function dbgDuo(){ return TW.fight&&TW.fight.kind==='duo'?TW.fight:null; }
function dbgPhases(){ if(dbgNP1()) return 1; return {caotan:3,omar:3,duo:3,hamza:2,nathan:4,mech:2,grimmaw:3}[DBG.boss]||0; }
function dbgPhase(){ const b=DBG.boss; if(b==='caotan'||b==='omar'){ const T=dbgSolo(); return T?T.phase:0; } if(b==='duo'){ const F=dbgDuo(); return F?F.phase:0; }
  if(b==='hamza') return TW.giant?TW.giant.phase:0; if(b==='nathan') return NB?(dbgNP1()?1:NB.phase):0; if(b==='mech') return Game.mech?Game.mech.phase:0; if(b==='grimmaw'){ const K=dbgKJ(); return K?K.phase||1:0; } return 0; }
function dbgHP(){ const b=DBG.boss; let h=null,m=1; if(b==='caotan'||b==='omar'){ const T=dbgSolo(); if(T){ h=T.hp; m=T.maxHp; } } else if(b==='duo'){ const F=dbgDuo(); if(F){ h=F.C.hp+F.O.hp; m=F.C.maxHp+F.O.maxHp; } }
  else if(b==='hamza'&&TW.giant){ h=TW.giant.hp; m=TW.giant.maxHp; } else if(b==='nathan'&&NB&&dbgNP1()){ h=NP1.hp; m=NP1.max; } else if(b==='nathan'&&NB){ const p=NB.phase, top=NB_PHASES[p-1], bot=NB_PHASES[p]!=null?NB_PHASES[p]:0; h=NB.bars-bot; m=top-bot; } else if(b==='mech'&&Game.mech&&Game.mech.boss){ h=Game.mech.boss.hp; m=Game.mech.boss.maxHp; } else if(b==='grimmaw'&&dbgKJ()){ h=Game.boss.hp; m=Game.boss.maxHp||1; }
  return h==null?null:clamp(h/m,0,1); }
// the pool of one phase (what the boss can pick there), in a stable order
function dbgPool(ph){ const b=DBG.boss, u=a=>[...new Set(a||[])];
  if(b==='caotan'||b==='omar') return u(TWPOOL[b][ph]).filter(k=>TWK[b][k]); if(b==='duo') return u((DUO3_POOL[ph]||[]).concat(ph===3?['scytheRain']:[])).filter(k=>DUO[k]);
  if(b==='hamza') return u(HZG_POOL[ph]).filter(k=>HZG[k]); if(b==='nathan') return dbgNP1()?Object.keys(NP1M):u(NB_POOL[ph]); if(b==='mech') return (TH_SPELLS[ph]||[]).map(s=>s[2]);
  if(b==='grimmaw') return u((KJ_POOL[ph]||[]).concat(['rush'])); return []; }
function dbgMoves(){ const b=DBG.boss, uniq=a=>[...new Set(a)]; if(b==='grimmaw') return uniq([1,2,3].flatMap(dbgPool));
  if(b==='caotan'||b==='omar') return uniq([1,2,3].flatMap(p=>TWPOOL[b][p]||[])).filter(k=>TWK[b][k]);
  if(b==='duo') return uniq([1,2,3].flatMap(p=>DUO3_POOL[p]||[]).concat(['scytheRain'])).filter(k=>DUO[k]);
  if(b==='hamza') return uniq(HZG_POOL[1].concat(HZG_POOL[2])).filter(k=>HZG[k]);
  if(b==='nathan') return dbgNP1()?Object.keys(NP1M):uniq([1,2,3,4].flatMap(p=>NB_POOL[p]||[]));
  if(b==='mech') return TH_SPELLS[1].concat(TH_SPELLS[2]).map(s=>s[2]); return []; }
// limit cuts, phase changes and finales, by the phase they belong to: [label, kind, phase]
function dbgLCs(){ if(dbgNP1()) return []; return {caotan:[['Limit cut (at 50%)','lc',2],['Limit cut (at 50%)','lc',3]],omar:[['Limit cut (at 50%)','lc',2],['Limit cut (at 50%)','lc',3]],
  duo:[['Phase change I → II (Getsuga clash)','kill',1],['Omar LC: Kuroi Kaimon','omarlc',2],['Caotan LC: Hikari Supernova','caolc',3],['Burnout → ending','burnout',3]],
  hamza:[['Buffet (limit cut)','buffet',2],['Frenzy (finale)','frenzy',2]],nathan:[['Storm (limit cut)','storm',2],['Heaven (limit cut)','heaven',3],['Overdrive (finale)','over',4]],mech:[],
  grimmaw:[['Airdrop → Crimson Moon (I → II)','kjsp',1],['Hydra clash → Garden of Stars (II → III)','kjsp',2],['Armor dome (III, 50%)','kjdome',3],['Frenzy (finale)','kjsp',3]]}[DBG.boss]||[]; }

// ---------- actions ----------
function dbgToggle(){ if(TLM.open) twTimelineClose(null); if(DBG.on){ dbgOpen(false); DBG.on=false; dbgSay(''); return false; } DBG.on=true; DBG.tab=DBG.boss?'moves':'setup'; DBG.wantOpen=1; DBG.ali=ALI(); if(TW.god==null) TW.god=true; TW.god=true; dbgArena(null); return true; }
function dbgArena(then){ Object.assign(Game,{script:null,wait:null,dlg:null,timeScale:1,slowT:0,banner:null,card:null,evaCard:null}); Voice.stop(); Cam.cine=null; Game.letterTo=0;
  // already in the field as the right hero: just clear it (instant respawns); otherwise reload it
  if(L&&L.key==='flowers'&&!Game.mech&&ALI()===DBG.ali){ twEndFight(); TW.giant=null; if(typeof hzgClearBabies==='function') hzgClearBabies(); nbRemove(); twClearAllies(); Game.boss=null; Game.bossBar=0; JC.lines=[]; Game.fxUpd=[];
    Game.state='play'; Game.arena=null; Cam.focus=null; Cam.zoom=1; Player.hidden=false; if(!DBG.ali&&DBG.blade) Game.flags.aliSword=1; if(then) then(); return; }
  run(function*(){ twWarpReset(DBG.ali); yield* twWarpFlowers({noHamza:1}); Game.state='play'; Game.arena=null; Cam.zoom=1; if(!DBG.ali&&DBG.blade) Game.flags.aliSword=1; if(then) then(); }); }
function dbgSpawn(id){ if(!DBG_ROUTE[DBG.ali?'ali':'shayan'].includes(id)){ dbgSay("Not on "+(DBG.ali?"Ali's":"Shayan's")+' road'); return; } DBG.boss=id; DBG.move=null;
  if(id==='grimmaw'||id==='paul'){ dbgSay(id==='paul'?'Warping (with its intro cutscene)':'Warping to Kojima (his intro plays; the controls work once he is on the field)'); Object.assign(Game,{script:null,wait:null,dlg:null}); run(function*(){ yield* twWarp(id==='paul'?'paul':(DBG.ali?'al_kj':'sh_cao_g')); }); return; }
  if(id==='mech'){ Object.assign(Game,{script:null,wait:null,dlg:null}); run(function*(){ twWarpReset(false); yield fadeOut(); enterMech(); NAT.x=-14; NAT.y=0; NAT.show=1; Game.mech.st='fight'; Game.mech._resp=1; Game.fade=1; Game.fadeTo=0; startMechPhase(1); dbgApplyMode(); }); return; }
  dbgArena(()=>{ const c=L.zone?{x:L.zone.x,z:L.zone.z}:{x:Player.x,z:Player.z};
    if(id==='caotan'||id==='omar'){ const T=twStartSolo(id); T.cd=1.2; }
    else if(id==='duo'){ const F=twDuoStart(c.x-3,c.z-4,c.x+3,c.z-4); F.director=1; F.dcd=1.2; Game.state='play'; Sound.play('diva'); }
    else if(id==='hamza'){ hzgStart(); TW.giant.inv=false; }
    else if(id==='nathan'){ nbMake(c.x,c.z-6); NB.bars=NB.hp=NB_PHASES[0]; run(function*(){ yield* nbBeginPhase(1); }); }
    resetPlayer({x:c.x,z:c.z+5},true); Player.hp=Player.maxHp; dbgApplyMode(); }); }
function dbgDespawn(){ DBG.move=null; if(Game.mech||DBG.boss==='grimmaw'||DBG.boss==='paul') dbgArena(null); else { twEndFight(); TW.giant=null; if(typeof hzgClearBabies==='function') hzgClearBabies(); nbRemove(); Game.arena=null; Cam.focus=null; Cam.zoom=1; Game.bossBar=0; } }
// the AI mode is enforced every frame in dbgTick; this just cancels what the boss is doing when you pick Idle
function dbgApplyMode(){ if(DBG.mode!=='idle') return; const T=dbgSolo(), F=dbgDuo(); if(T){ T.gen=null; T.state='idle'; } if(F){ F.C.gen=F.O.gen=null; F.busy=0; } if(TW.giant) TW.giant.gen=null; if(NB){ NB.gen=null; NB.busyAtk=0; } if(dbgNP1()){ NP1.gen=null; np1Clear(); } twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; });
  const Tm=Game.mech&&Game.mech.th; if(Tm){ Tm.gen=null; Tm.eb=[]; Tm.spell=null; } const K=dbgKJ(); if(K&&['kj','twcombo'].includes(K.state)){ K.kjg=null; K.twg=null; K.state='recover'; K.st=0; } }
function dbgRun(k,ph){ const b=DBG.boss; if(ph&&b!=='grimmaw'&&dbgPhase()&&dbgPhase()!==ph) dbgSetPhase(ph); DBG.move=k; DBG.last={a:'move',k,ph}; twClearHz(); BOLTS.forEach(x=>{ if(!x.friendly) x.dead=1; });
  if(b==='caotan'||b==='omar'){ const T=dbgSolo(); if(!T||!TWK[b][k]) return; T.stun=0; T.state='atk'; T.last=k; T.gen=TWK[b][k](T,T.phase); T.wait=0; }
  else if(b==='duo'){ const F=dbgDuo(); if(!F) return; F.lc=0; F.busy=0; F.C.stun=F.O.stun=0; if(k==='scytheRain'&&!TW.planted.length) dbgSay('Scythe Rain needs planted scythes: run Volley first'); twDuo3Begin(F,k); }
  else if(b==='hamza'){ const G=TW.giant; if(!G) return; G.mv=null; G.gen=HZG[k](G,G.phase); G.wait=0; }
  else if(b==='nathan'&&dbgNP1()){ if(!NB||!NP1M[k]) return; np1Clear(); NP1.stunT=0; NB.stunned=0; if(NP1.done){ NP1.done=0; NP1.hp=NP1.max; } NP1.gen=NP1M[k](); NP1.wait=0; }
  else if(b==='nathan'){ if(!NB) return; NB.gen=nbPattern(k); NB.wait=0; NB.busyAtk=1; }
  else if(b==='mech'){ const T=Game.mech&&Game.mech.th; if(!T) return; T.dbgSpell=k; T.gen=null; T.wait=0; T.eb=[]; T.spell=null; }
  else if(b==='grimmaw'){ const K=dbgKJ(); if(!K||['rain','clash','frenzy','special','dome','dome_in','intro'].includes(K.state)){ dbgSay('Kojima is busy (a phase change or cutscene)'); return; } K.kjg=null; K.twg=null; K.vanish=0; if(K.spr) K.spr.show(true); K.vx=K.vz=0;
    const q=ph||K.phase||1; if(k==='rush'){ K.state='twcombo'; K.st=0; K.twg=grimRush(K); K.tww=0; } else if(KJM[k]){ K.state='kj'; K.st=0; K.kjg=KJM[k](K,q); K.kjw=0; } else { K.chain=k==='slash'?Math.min(2,q):1; if(k==='blink'){ K.chain=1; K.rush=0; } K.state=k+'_w'; K.st=0; } }
  dbgSay('Running: '+dbgName(k)+(ph?'  (phase '+['','I','II','III','IV'][ph]+')':'')); }
function dbgSetPhase(n){ const b=DBG.boss; if(b==='grimmaw'){ dbgSay("Kojima's phases change arenas: use his phase-change buttons"); return; } DBG.move=null; twClearHz(); BOLTS.forEach(x=>{ if(!x.friendly) x.dead=1; });
  if(b==='caotan'||b==='omar'){ const T=dbgSolo(); if(!T) return; const hp=twHPFor(n,b); Object.assign(T,{phase:n,hp,maxHp:hp,form:n,gen:null,state:'idle',inv:false,stun:0,bag:[],down:0,dying:0,cd:1}); T.lcDone[n]=0; twMeta(T); Sound.play(TW_MUSIC[b][n]); }
  else if(b==='duo'){ const F=dbgDuo(); if(!F) return; F.phase=n; F.lc=0; F.lcDone[n]=0; F.bag=[]; F.busy=0; F.pend=null; for(const T of [F.C,F.O]) Object.assign(T,{phase:n,hp:DUO_HP[n],maxHp:DUO_HP[n],form:n,down:0,inv:false,stun:0,gen:null,state:'idle',bag:[]}); }
  else if(b==='hamza'){ const G=TW.giant; if(!G) return; Object.assign(G,{phase:n,hp:HZG_HP[n],maxHp:HZG_HP[n],bag:[],lcDone:0,inv:false,gen:null,pend:null,frenzied:0}); }
  else if(b==='nathan'&&dbgNP1()){ np1Clear(); NP1.hp=NP1.max; NP1.done=0; NP1.stunT=0; NP1.gen=null; }
  else if(b==='nathan'){ if(!NB) return; NB.bars=NB.hp=NB_PHASES[n-1]; NB.alive=true; NB.lcA=n>2?1:0; NB.lcB=n>3?1:0; NB.over=0; NB.pend=null; nbClear(); run(function*(){ yield* nbBeginPhase(n); }); }
  else if(b==='mech'){ if(!Game.mech) return; Game.mech._resp=1; startMechPhase(n); }
  dbgSay('Phase '+['','I','II','III','IV'][n]); }
function dbgSetHP(k){ const b=DBG.boss; if(b==='caotan'||b==='omar'){ const T=dbgSolo(); if(T) T.hp=Math.max(.1,T.maxHp*k); } else if(b==='duo'){ const F=dbgDuo(); if(F) for(const T of [F.C,F.O]){ T.hp=Math.max(.1,T.maxHp*k); T.down=0; T.inv=false; } }
  else if(b==='hamza'&&TW.giant){ TW.giant.hp=Math.max(.1,TW.giant.maxHp*k); } else if(b==='nathan'&&NB&&dbgNP1()){ NP1.hp=Math.max(.1,NP1.max*k); NP1.done=0; } else if(b==='nathan'&&NB){ const p=NB.phase, top=NB_PHASES[p-1], bot=NB_PHASES[p]!=null?NB_PHASES[p]:0; NB.bars=NB.hp=bot+(top-bot)*Math.max(.01,k); }
  else if(b==='mech'&&Game.mech&&Game.mech.boss){ const B=Game.mech.boss; B.hp=Math.max(.1,B.maxHp*k); } else if(b==='grimmaw'&&dbgKJ()){ const K=Game.boss; K.hp=Math.max(.1,(K.maxHp||1)*k); } }
// kill = deal exactly the bar's remaining HP through the normal damage path, so phase changes play as in the game
function dbgKill(){ const b=DBG.boss, ot=TW.otk; TW.otk=false;
  try{ if(b==='caotan'||b==='omar'){ const T=dbgSolo(); if(T){ T.lcDone[T.phase]=1; T.inv=false; T.state='idle'; twHurt(T,T.hp+1,'test'); } }
    else if(b==='duo'){ const F=dbgDuo(); if(F){ F.lcDone[F.phase]=1; for(const T of [F.C,F.O]){ T.inv=false; if(T.hp>0) twHurt(T,T.hp+1,'test'); } } }
    else if(b==='hamza'&&TW.giant){ const G=TW.giant; G.lcDone=1; G.inv=false; hzgHurt(G.hp+1,'test'); }
    else if(b==='nathan'&&NB&&dbgNP1()){ np1Clear(); nbDamage(NP1.hp+1,'np1'); }
    else if(b==='nathan'&&NB){ NB.lcA=NB.lcB=1; NB.inv=false; const p=NB.phase, bot=NB_PHASES[p]!=null?NB_PHASES[p]:0; nbDamage(NB.bars-bot+.01); }
    else if(b==='mech'&&Game.mech&&Game.mech.boss){ const B=Game.mech.boss, T=Game.mech.th; if(T){ T.tick=thTicks(T.ph).length; T.finDone=1; } B.vuln=true; mechDamage(B.hp+1,0,0,0,true); }
    else if(b==='grimmaw'&&dbgKJ()){ const K=Game.boss; if(K.state==='dome'){ K.armor=0; damageBoss(1); } else { K.inv=false; if(['kj','twcombo'].includes(K.state)){ K.state='idle'; K.kjg=K.twg=null; } damageBoss(K.hp+1); } } } finally{ TW.otk=ot; } }
function dbgLC(kind,ph){ const b=DBG.boss; DBG.last={a:'lc',k:kind,ph}; if(kind==='kill'){ if(dbgPhase()!==ph) dbgSetPhase(ph); dbgKill(); dbgSay('Phase change'); return; }
  if(b==='grimmaw'){ dbgKJLC(kind,ph); return; }
  if(dbgPhase()!==ph&&kind!=='frenzy'&&kind!=='over') dbgSetPhase(ph); twClearHz(); BOLTS.forEach(x=>{ if(!x.friendly) x.dead=1; });
  if(b==='caotan'||b==='omar'){ const T=dbgSolo(); if(!T) return; T.hp=T.maxHp/2; T.state='lc'; T.lcDone[ph]=1; T.gen=TWK[b]['lc'+(ph-1)](T); T.wait=0; }
  else if(b==='duo'){ const F=dbgDuo(); if(!F) return; const C=F.C, O=F.O; if(F.d5) d5OmarLCClean(F); if(F.d5c) d5CaoLCClean(F); TW.lcCleanup=null; F.director=0; F.busy=1; C.gen=O.gen=null;
    if(kind==='omarlc') run(function*(){ yield* d5OmarLCIntro(F,C,O,true); });
    else if(kind==='caolc'){ F.caoLC=0; run(function*(){ yield* d5CaoLCIntro(F,C,O,true); }); }
    else if(kind==='burnout'){ F.caoLC=1; F.burned=0; C.hp=O.hp=0; twBurnoutGo(F,C,O); } }
  else if(b==='hamza'){ const G=TW.giant; if(!G) return; if(kind==='buffet'){ G.lcDone=1; G.inv=true; G.mv=null; G.gen=hzgBuffet(G); G.wait=0; } else { G.frenzied=1; G.gen=null; run(function*(){ yield* hzgFrenzy(G); if(TW.giant===G){ G.inv=false; G.hp=Math.max(G.hp,G.maxHp*.2); Game.state='play'; Game.letterTo=0; Cam.cine=null; } }); } }
  else if(b==='nathan'){ if(!NB) return; if(kind==='over'){ NB.over=1; run(function*(){ yield* nbOverdrive(); if(NB){ NB.alive=true; yield* nbBeginPhase(NB.phase); } }); }
    else { if(kind==='storm') NB.lcA=1; else NB.lcB=1; NB.inv=true; nbClear(); NB.pend=kind==='storm'?nbStorm:nbHeaven; nbPend(); } }
  dbgSay('Running: '+((dbgLCs().find(q=>q[1]===kind&&q[2]===ph)||[kind])[0])); }
// Kojima's phase changes run his real scripts (they also move him to the next arena)
function dbgKJLC(kind,ph){ const K=dbgKJ(); if(!K){ dbgSay('Kojima is not on the field yet'); return; } twClearHz(); BOLTS.forEach(x=>{ if(!x.friendly) x.dead=1; }); K.kjg=K.twg=null;
  if(kind==='kjdome'){ if(K.phase!==3){ dbgSay('The dome is phase III (Garden of Stars): use the II → III change first'); return; } if(K.domeDone){ dbgSay('The dome already broke this fight'); return; } K.state='idle'; K.hp=Math.min(K.hp,K.maxHp/2); startDome(K); }
  else { if((K.phase||1)!==ph){ dbgSay('That change starts from phase '+['','I','II','III'][ph]+'; he is in phase '+['','I','II','III'][K.phase||1]); return; } K.state='idle'; startSpecial(K); }
  dbgSay('Running: '+((dbgLCs().find(q=>q[1]===kind&&q[2]===ph)||[kind])[0])); }

// ---------- every frame: enforce the AI mode, loop the chosen mechanic, slow-mo ----------
function dbgBusy(){ const b=DBG.boss; if(b==='caotan'||b==='omar'){ const T=dbgSolo(); return !T||!!T.gen||T.stun>0||T.state==='lc'||!!TW.fight.pend||(b==='caotan'&&(impBusy()||IMP.list.length>0)); } if(b==='duo'){ const F=dbgDuo(); return !F||F.busy||!!F.C.gen||!!F.O.gen||F.lc||!!F.pend; }
  if(b==='hamza'){ const G=TW.giant; return !G||!!G.gen||G.inv||!!G.pend; } if(b==='nathan'&&dbgNP1()) return !NB||!!NP1.gen||!!NP1.seq||NP1.stunT>0||NP1.done; if(b==='nathan') return !NB||!!NB.gen||NB.inv||!!NB.pend; if(b==='grimmaw'){ const K=dbgKJ(); return !K||K.state!=='idle'; } return true; }
function dbgTick(){ if(!DBG.on) return; if(DBG.wantOpen&&Game.state==='play'&&!Game.script&&!Game.dlg){ DBG.wantOpen=0; dbgOpen(true); } const idle=DBG.mode==='idle', loop=DBG.mode==='loop'&&DBG.move; const F=TW.fight;
  if(F&&F.kind==='solo') F.noAttack=idle||loop; if(F&&F.kind==='duo'&&!F.lc&&!F.pend) F.director=(idle||loop)?0:1; if(TW.giant) TW.giant.noAttack=idle||loop;
  if(NB&&(idle||loop)){ NB.cd=Math.max(NB.cd,.5); NB.dodgeCd=Math.max(NB.dodgeCd||0,.5); if(dbgNP1()) NP1.cd=Math.max(NP1.cd,.5); }
  const K=dbgKJ(); if(K&&(idle||loop)&&K.state==='idle') K.cd=Math.max(K.cd||0,.5);
  const Tm=Game.mech&&Game.mech.th; if(Game.mech) Game.mech.dbgIdle=idle; if(Tm&&DBG.boss==='mech') Tm.dbgLoop=DBG.mode==='loop';
  if(loop&&Game.state==='play'&&!Game.script&&DBG.boss!=='mech'&&!dbgBusy()){ DBG.loopT=(DBG.loopT||0)+1/60; if(DBG.loopT>.6){ DBG.loopT=0; dbgRun(DBG.move,DBG.last&&DBG.last.a==='move'?DBG.last.ph:0); } } else DBG.loopT=0;
  if(DBG.slow&&Game.state==='play') Game.timeScale=Math.min(Game.timeScale||1,.5); }
(function(){ const uw=updateWorld; updateWorld=function(dt){ const r=uw.apply(this,arguments); try{ dbgTick(); }catch(e){ console.error('debug',e); } return r; }; })();
// final defeats leave the story alone here
function* dbgDefeated(){ twEndFight(); TW.giant=null; if(typeof hzgClearBabies==='function') hzgClearBabies(); nbRemove(); if(Game.mech) exitMech();
  if(!L||L.key!=='flowers'){ yield* twWarpFlowers({noHamza:1}); } Game.state='play'; Game.letterTo=0; Cam.cine=null; Cam.focus=null; Cam.zoom=1; Game.arena=null; Player.inv=1; Player.hidden=false;
  twBig('DEFEATED',{size:56,col:'#ffd45a',sub:'Debug: pick a boss to spawn it again'}); }
(function(){ const wrapEnd=(get,set)=>{ const f=get(); set(function*(){ if(DBG.on){ yield* dbgDefeated(); return; } yield* f.apply(this,arguments); }); };
  wrapEnd(()=>twSoloDefeat,f=>twSoloDefeat=f); wrapEnd(()=>hzgFinale,f=>hzgFinale=f); wrapEnd(()=>twDuoEnding,f=>twDuoEnding=f); wrapEnd(()=>nbFinale,f=>nbFinale=f);
  // the bullet hell: skip its long cutscenes, go straight to the next phase (or end)
  const sb=soulburn; soulburn=function*(){ if(DBG.on){ Game.letterTo=0; startMechPhase(2); return; } yield* sb.apply(this,arguments); };
  const cb=cosmicBlade; cosmicBlade=function*(){ if(DBG.on){ yield* dbgDefeated(); return; } yield* cb.apply(this,arguments); }; })();

// ---------- the panel (pauses the game) and the bar (always on screen while debugging) ----------
// open/close: Tab (or numpad 4), the bar's Panel button, the touch Debug button; Esc closes. Again: R (or numpad 6).
function dbgOpen(on){ if(on===!!DBG.open||!DBG.on) return; if(typeof releaseTouchKeys==='function') releaseTouchKeys(); clearHits();
  if(on){ DBG.prev=Game.state==='paused'?(Game.prev||'play'):Game.state; Game.prev=DBG.prev; Game.state='paused'; DBG.open=true; DBG.mph=0; DBG.sc=0; }
  else { DBG.open=false; if(Game.state==='paused') Game.state=DBG.prev||'play'; } }
// T: loop the last mechanic on/off (off goes back to the AI mode you had, idle by default)
function dbgLoopToggle(){ if(DBG.mode==='loop'){ DBG.mode=DBG.prevMode&&DBG.prevMode!=='loop'?DBG.prevMode:'idle'; dbgSay('Loop off'); } else { DBG.prevMode=DBG.mode; DBG.mode='loop'; const L=DBG.last; if(L&&L.a==='move') DBG.move=L.k; dbgSay(DBG.move?'Looping: '+dbgName(DBG.move):'Loop on: run a mechanic and it repeats'); } dbgApplyMode(); Sound.sfx('blip'); }
function dbgAgain(){ const L=DBG.last; if(!L){ dbgSay('Nothing to repeat yet: pick a mechanic in the panel'); return; } if(L.a==='move') dbgRun(L.k,L.ph); else dbgLC(L.k,L.ph); }
const DBK={k:1,bh:24,fs:12,oy:0};   // scale and sizes: bigger on touch (phone-first)
function dbgBtn(x,y,w,h,label,id,o){ o=o||{}; const hov=DBG.hov===id; uRR(x,y,w,h,6); D.fillStyle=o.on?'rgba(227,182,90,.9)':o.red?'rgba(255,74,122,.22)':hov?'rgba(255,255,255,.14)':'rgba(255,255,255,.06)'; D.fill(); D.strokeStyle=o.on?UIC.acc:o.red?'#ff4a7a':UIC.line2; D.lineWidth=1; D.stroke();
  const fs=o.fs||DBK.fs; D.font=`700 ${fs}px ${FB}`; let t=label; const room=w-(o.nw?44:14); while(D.measureText(t).width>room&&t.length>3) t=t.slice(0,-2)+'…';
  uText(t,o.left||o.nw?x+8:x+w/2,y+h/2+fs*.36,`700 ${fs}px ${FB}`,o.on?'#1a1408':o.dim?UIC.dim:UIC.text,o.left||o.nw?'left':'center');
  if(o.nw){ uRR(x+w-38,y+h/2-8,32,16,8); D.fillStyle='#ff4a7a'; D.fill(); uText('NEW',x+w-22,y+h/2+4,`900 9px ${FB}`,'#fff','center'); }
  const k=DBK.k, oy=DBK.oy||0; DBG.rects.push({x:x*k,y:(y-oy)*k,w:w*k,h:h*k,id}); }
function dbgChk(x,y,on,label,id,w){ const s=DBK.bh>24?18:14; uRR(x,y,s,s,3); D.fillStyle=on?UIC.acc:'rgba(0,0,0,.4)'; D.fill(); D.strokeStyle=UIC.line2; D.stroke(); if(on){ D.strokeStyle='#1a1408'; D.lineWidth=2; D.beginPath(); D.moveTo(x+s*.22,y+s*.54); D.lineTo(x+s*.43,y+s*.75); D.lineTo(x+s*.78,y+s*.28); D.stroke(); }
  uText(label,x+s+6,y+s*.8,`600 ${DBK.fs}px ${FB}`,on?UIC.text:UIC.mut); const k=DBK.k, oy=DBK.oy||0; DBG.rects.push({x:(x-2)*k,y:(y-4-oy)*k,w:(w||150)*k,h:(s+12)*k,id}); }
function dbgCtl(){ const b=DBG.boss; return !!b&&b!=='paul'; }
function dbgBossName(){ const q=DBG_BOSSES.find(q=>q[0]===DBG.boss); return q?q[1].replace(' ↗',''):''; }
function dbgSecSetup(x,y,w){ const bh=DBK.bh;
  uCaps('PLAYER',x,y,UIC.dim,10); y+=8; dbgBtn(x,y,w/2-3,bh,'Shayan','ali:0',{on:!DBG.ali}); dbgBtn(x+w/2+3,y,w/2-3,bh,'Ali','ali:1',{on:DBG.ali}); y+=bh+8;
  const r=DBK.bh>24?30:22; dbgChk(x,y,!!TW.god,'Infinite HP','t:god',w/2-4); dbgChk(x+w/2,y,!!TW.otk,'One-hit kill','t:otk',w/2); y+=r; dbgChk(x,y,!!TW.infFC,ALI()?'Infinite JC':'Infinite Full Counter','t:fc',w/2-4); dbgChk(x+w/2,y,DBG.slow,'Slow-mo ½','t:slow',w/2); y+=r;
  if(!ALI()){ dbgChk(x,y,!!Game.flags.aliSword,"Ali's blade (10× Nathan)",'t:blade',w); y+=r; }
  const b3=(w-12)/3; dbgBtn(x,y,b3,bh,'Heal','heal'); dbgBtn(x+b3+6,y,b3,bh,'Full meter','meter'); dbgBtn(x+2*b3+12,y,b3,bh,'Clear hazards','clear'); y+=bh+12;
  uCaps(DBG.ali?"SPAWN A BOSS · ALI'S ROAD":'SPAWN A BOSS',x,y,UIC.dim,10); y+=8; dbgBossList().forEach(([id,nm],i)=>{ const col=i%2, bw=w/2-3; dbgBtn(x+col*(bw+6),y,bw,bh,nm,'boss:'+id,{on:DBG.boss===id,nw:dbgNew(id)}); if(col) y+=bh+4; }); return y+8; }
function dbgSecBoss(x,y,w){ const b=DBG.boss, bh=DBK.bh;
  if(!b){ uText('Spawn a boss first (Setup).',x,y+4,`italic 600 ${DBK.fs}px ${FB}`,UIC.mut); return y+20; }
  if(!dbgCtl()){ uText("Paul's raid is the real fight: no controls here.",x,y+4,`italic 600 ${DBK.fs}px ${FB}`,UIC.mut); return y+20; }
  const ph=dbgPhase(), hp=dbgHP(); uText(dbgBossName()+(ph?'  ·  phase '+['','I','II','III','IV'][ph]:'  ·  not on the field yet'),x,y+4,`700 ${DBK.fs+1}px ${FB}`,UIC.accL); if(hp!=null) uText(Math.round(hp*100)+'%',x+w,y+4,`700 ${DBK.fs+1}px ${FB}`,UIC.text,'right'); y+=12;
  if(hp!=null){ uRR(x,y,w,5,2); D.fillStyle='rgba(255,255,255,.08)'; D.fill(); uRR(x,y,Math.max(3,w*hp),5,2); D.fillStyle='#ff4a7a'; D.fill(); } y+=14;
  uCaps('AI',x,y,UIC.dim,10); y+=8; [['idle','Idle'],['active','Active'],['loop','Loop last']].forEach(([m,l],i)=>dbgBtn(x+i*(w/3+1),y,w/3-3,bh,l,'mode:'+m,{on:DBG.mode===m})); y+=bh+4;
  uText(DBG.mode==='idle'?'He stands still until you run a mechanic.':DBG.mode==='loop'?(DBG.move?'Looping: '+dbgName(DBG.move):'Run a mechanic and it repeats.'):'He fights normally.',x,y+11,`500 ${DBK.fs-1}px ${FB}`,UIC.mut); y+=22;
  if(b!=='grimmaw'){ uCaps('JUMP TO PHASE',x,y,UIC.dim,10); y+=8; const n=dbgPhases(); for(let i=1;i<=n;i++) dbgBtn(x+(i-1)*(w/n),y,w/n-4,bh,['','I','II','III','IV'][i],'phase:'+i,{on:ph===i}); y+=bh+8; }
  uCaps('BOSS HP',x,y,UIC.dim,10); y+=8; [['100%',1],['50%',.5],['10%',.1]].forEach(([l,k],i)=>dbgBtn(x+i*(w/4),y,w/4-4,bh,l,'hp:'+k)); dbgBtn(x+3*(w/4),y,w/4,bh,'Kill bar','kill',{red:1}); y+=bh+4;
  uText('Kill bar plays the real phase change / finale.',x,y+11,`500 ${DBK.fs-1}px ${FB}`,UIC.mut); y+=22;
  dbgBtn(x,y,w,bh,'Despawn boss','despawn'); return y+bh+6; }
// mechanics, grouped by phase: tabs, then that phase's limit cuts / phase changes, then its moves
function dbgSecMoves(x,y,w,cols){ const b=DBG.boss, bh=DBK.bh;
  if(!b||!dbgCtl()){ uText(b?'':'Spawn a boss first (Setup).',x,y+4,`italic 600 ${DBK.fs}px ${FB}`,UIC.mut); return y; }
  const n=dbgPhases(), cur=dbgPhase(), sel=Math.min(n,DBG.mph||cur||1);
  for(let i=1;i<=n;i++){ const tw=(w-(n-1)*6)/n, lbl='Phase '+['','I','II','III','IV'][i]+(cur===i?'  ●':''); dbgBtn(x+(i-1)*(tw+6),y,tw,bh+4,lbl,'mph:'+i,{on:sel===i,nw:dbgPool(i).some(k=>dbgNew(b,k))&&!DBG_NEW.includes(b+':*')}); } y+=bh+14;
  const lcs=dbgLCs().filter(q=>q[2]===sel);
  if(lcs.length){ uCaps('LIMIT CUTS · PHASE CHANGES',x,y,UIC.dim,10); y+=8; lcs.forEach(([l,k,p],i)=>{ const col=i%2, bw=(w-6)/2; dbgBtn(x+col*(bw+6),y,bw,bh,l,'lc:'+k+':'+p,{nw:dbgNew(b,k),left:1,red:1}); if(col||i===lcs.length-1) y+=bh+4; }); y+=8; }
  const pool=dbgPool(sel); uCaps('MOVES IN THIS PHASE ('+pool.length+')',x,y,UIC.dim,10); y+=8;
  const nc=cols||3, cw=(w-(nc-1)*6)/nc; pool.forEach((k,i)=>{ const col=i%nc, row=Math.floor(i/nc); dbgBtn(x+col*(cw+6),y+row*(bh+4),cw,bh,dbgName(k),'move:'+k+':'+sel,{on:DBG.move===k,nw:dbgNew(b,k),left:1}); });
  y+=Math.ceil(pool.length/nc)*(bh+4)+10;
  if(b==='duo') { uText('Scythe Rain needs planted scythes: run Volley first.',x,y+4,`500 ${DBK.fs-1}px ${FB}`,UIC.dim); y+=18; }
  if(sel!==cur&&cur&&b!=='grimmaw'){ uText('Picking a move here switches the boss to phase '+['','I','II','III','IV'][sel]+' first.',x,y+4,`500 ${DBK.fs-1}px ${FB}`,UIC.dim); y+=18; }
  return y; }
function dbgHead(x,y,w){ const bh=DBK.bh; uText('DEBUG MODE',x,y,`900 ${DBK.fs+4}px ${FB}`,'#ff8aa8');
  dbgBtn(x+w-250,y-bh+6,140,bh,'Leave debug','off',{red:1}); dbgBtn(x+w-104,y-bh+6,104,bh,'Close  ✕','close',{on:1});
  y+=18; uText(DBG_PATCH,x,y,`600 ${DBK.fs-1}px ${FB}`,UIC.mut); return y+16; }
function dbgPanel(){ const tch=IS_TOUCH(), k=tch?2:1; DBK.k=k; DBK.bh=tch?34:24; DBK.fs=tch?14:12; DBK.oy=0; const W=UW/k, H=UH/k;
  D.save(); D.fillStyle='rgba(3,4,10,.55)'; D.fillRect(0,0,UW,UH); D.scale(k,k);
  const pw=tch?W-16:Math.min(W-40,880), x=(W-pw)/2, y=tch?6:20, ph=H-(tch?12:40), ix=x+18, iw=pw-36; uPanel(x,y,pw,ph,'rgba(10,12,22,.97)',UIC.line2,12);
  let yy=dbgHead(ix,y+30,iw);
  dbgChk(ix,yy,DBG.autoClose,'Close the panel when a mechanic starts','t:auto',iw/2); yy+=DBK.bh>24?30:24;
  if(tch){ // phones: three tabs
    [['setup','Setup'],['boss','Boss'],['moves','Mechanics']].forEach(([t,l],i)=>dbgBtn(ix+i*(iw/3),yy,iw/3-6,DBK.bh,l,'tab:'+t,{on:DBG.tab===t})); yy+=DBK.bh+10;
    // the tab's content scrolls (drag it); only what is inside the window can be tapped
    const top=yy, bot=y+ph-34, n0=DBG.rects.length, sc=DBG.sc||0; D.save(); D.beginPath(); D.rect(x,top,pw,bot-top); D.clip(); D.translate(0,-sc); DBK.oy=sc;
    const end=DBG.tab==='setup'?dbgSecSetup(ix,top+6,iw):DBG.tab==='boss'?dbgSecBoss(ix,top+6,iw):dbgSecMoves(ix,top+6,iw,2); D.restore(); DBK.oy=0;
    const max=Math.max(0,end-bot+10); DBG.scMax=max; if(sc>max) DBG.sc=max; DBG.clip={y0:top*k,y1:bot*k};
    DBG.rects=DBG.rects.filter((q,i)=>i<n0||(q.y+q.h/2>=top*k&&q.y+q.h/2<=bot*k));
    if(max>0){ const th=(bot-top)*(bot-top)/(bot-top+max), ty=top+(bot-top-th)*(sc/max); uRR(x+pw-8,ty,4,th,2); D.fillStyle='rgba(255,255,255,.35)'; D.fill(); uText(sc<max?'drag for more ▾':'',x+pw-14,bot+14,`600 ${DBK.fs-2}px ${FB}`,UIC.dim,'right'); } }
  else { // desktop: setup + boss on the left, mechanics on the right
    const lw=300; let ly=dbgSecSetup(ix,yy,lw); D.fillStyle=UIC.line2; D.fillRect(ix,ly-2,lw,1); dbgSecBoss(ix,ly+14,lw);
    D.fillStyle=UIC.line2; D.fillRect(ix+lw+18,yy-6,1,ph-(yy-y)-30); const mx=ix+lw+38, mw=iw-lw-38; uText('Mechanics',mx,yy+8,`900 ${DBK.fs+4}px ${FB}`,UIC.accL); dbgSecMoves(mx,yy+20,mw,3); }
  uText(DBG.msg&&DBG.msg.t&&performance.now()-DBG.msg.at<4000?DBG.msg.t:'',ix,y+ph-26,`700 ${DBK.fs}px ${FB}`,'#9ff8ff');
  uText(tch?'The game is paused while this is open.':'Paused while open  ·  Tab opens/closes  ·  R repeats the last mechanic  ·  Esc closes  ·  Numpad 5 leaves debug',ix,y+ph-10,`500 ${DBK.fs-1}px ${FB}`,UIC.dim);
  D.restore(); }
// the bar: what is running, Again, Panel (bottom left on desktop, top centre on phones)
function dbgBar(){ const tch=IS_TOUCH(), k=tch?2:1; DBK.k=k; DBK.bh=tch?30:24; DBK.fs=tch?13:12; DBK.oy=0; D.save(); D.scale(k,k);
  const W=UW/k, H=UH/k, loop=DBG.mode==='loop'&&DBG.move, L=DBG.last, bw=tch?300:420, bx=tch?(W-bw)/2:12, by=tch?6:H-12-62;
  uPanel(bx,by,bw,62,'rgba(10,12,22,.82)','#ff8aa8',10); const ph=dbgPhase(), hp=dbgHP();
  uText('DEBUG',bx+10,by+17,`900 11px ${FB}`,'#ff8aa8'); uText(DBG.boss?dbgBossName()+(ph?' · '+['','I','II','III','IV'][ph]:'')+(hp!=null?' · '+Math.round(hp*100)+'%':''):'no boss',bx+58,by+17,`700 12px ${FB}`,UIC.text);
  const lt=L?(L.a==='move'?dbgName(L.k):((dbgLCs().find(q=>q[1]===L.k&&q[2]===L.ph)||[L.k])[0])):'—'; uText((loop?'Looping: ':'Last: ')+lt+'  ·  AI '+DBG.mode,bx+bw-10,by+17,`500 11px ${FB}`,UIC.mut,'right');
  const n=3, gw=(bw-20-(n-1)*6)/n; dbgBtn(bx+10,by+26,gw,DBK.bh,tch?'Again':'Again  (R)','again',{on:!!L}); dbgBtn(bx+10+gw+6,by+26,gw,DBK.bh,tch?'Panel':'Panel  (Tab)','open');
  dbgBtn(bx+10+2*(gw+6),by+26,gw,DBK.bh,(DBG.mode==='loop'?'Loop on':'Loop off')+(tch?'':'  (T)'),'looptoggle',{on:DBG.mode==='loop'});
  D.restore(); }
function dbgDraw(){ DBG.rects=[]; if(!DBG.on||Game.state==='title'||TLM.open){ return; }
  if(DBG.open&&Game.state!=='paused') DBG.open=false; /* something else resumed the game */
  try{ if(DBG.open) dbgPanel(); else dbgBar(); }catch(e){ console.error('debug ui',e); DBK.k=1; } DBK.k=1; }
(function(){ const du=drawUI; drawUI=function(){ du(); try{ dbgDraw(); }catch(e){ console.error('debug ui',e); } };
  const dp=drawPause; drawPause=function(){ if(DBG.open) return; return dp.apply(this,arguments); }; })();
// which clicks close the panel (when "close the panel when a mechanic starts" is on)
const DBG_CLOSE=/^(move|lc|kill|boss)$/;
function dbgAct(id){ Sound.sfx('blip'); const [a,v,w]=id.split(':');
  if(a==='looptoggle'){ dbgLoopToggle(); return; } if(a==='open'){ dbgOpen(true); return; } if(a==='close'){ dbgOpen(false); return; } if(a==='again'){ dbgAgain(); return; }
  if(a==='tab'){ DBG.tab=v; DBG.sc=0; return; } if(a==='mph'){ DBG.mph=+v; return; }
  if(a==='off'){ dbgOpen(false); dbgToggle(); twCheatToast('DEBUG MODE: OFF',false); return; }
  if(a==='ali'){ DBG.ali=v==='1'; if(DBG.boss&&!DBG_ROUTE[DBG.ali?'ali':'shayan'].includes(DBG.boss)){ DBG.boss=null; DBG.last=null; DBG.move=null; dbgSay("Ali's road: Kojima and Nathan only"); } dbgArena(()=>{ if(DBG.boss&&DBG.boss!=='grimmaw'&&DBG.boss!=='paul'&&DBG.boss!=='mech') dbgSpawn(DBG.boss); }); return; }
  if(a==='t'){ if(v==='god') TW.god=!TW.god; else if(v==='otk') TW.otk=!TW.otk; else if(v==='auto') DBG.autoClose=!DBG.autoClose; else if(v==='fc'){ TW.infFC=!TW.infFC; if(!TW.infFC) Player.counter=0; } else if(v==='slow'){ DBG.slow=!DBG.slow; if(!DBG.slow) Game.timeScale=1; } else if(v==='blade'){ DBG.blade=!Game.flags.aliSword; if(DBG.blade) Game.flags.aliSword=1; else delete Game.flags.aliSword; } return; }
  if(a==='heal'){ const P=Player; P.hp=P.maxHp; if(NAT){ NAT.ap=NAT.maxAp; if(Game.mech&&Game.mech.th) Game.mech.th.lives=TH.LIVES; } return; }
  if(a==='meter'){ Player.sp=20; if(NAT) NAT.sp=100; return; } if(a==='clear'){ twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); if(Game.mech&&Game.mech.th) Game.mech.th.eb=[]; return; }
  if(a==='despawn'){ dbgDespawn(); DBG.boss=null; DBG.last=null; return; } if(a==='mode'){ DBG.mode=v; dbgApplyMode(); return; }
  if(a==='phase'){ dbgSetPhase(+v); DBG.mph=+v; return; } if(a==='hp'){ dbgSetHP(+v); return; }
  const closing=DBG.open&&DBG.autoClose&&DBG_CLOSE.test(a); if(closing) dbgOpen(false);
  if(a==='boss'){ DBG.last=null; DBG.tab='moves'; dbgSpawn(v); return; } if(a==='kill'){ DBG.last={a:'lc',k:'kill',ph:dbgPhase()}; dbgKill(); return; }
  if(a==='lc'){ dbgLC(v,+w); return; } if(a==='move'){ dbgRun(v,+w||0); return; } }
// clicks: the open panel takes every click (the game is paused); the closed bar only takes its own buttons
function dbgHit(x,y){ return DBG.rects.find(q=>x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h); }
ui.addEventListener('pointerdown',e=>{ if(!DBG.on||TLM.open||Game.state==='title') return; const [x,y]=tlPt(e), r=dbgHit(x,y);
  if(!r&&!DBG.open) return; e.preventDefault(); e.stopImmediatePropagation();
  if(DBG.open&&e.pointerType!=='mouse'){ DBG.drag={y,sc:DBG.sc||0,moved:false,x}; return; } if(r) dbgAct(r.id); },true);
ui.addEventListener('pointermove',e=>{ if(!DBG.on) return; const [x,y]=tlPt(e);
  if(DBG.drag){ const dy=y-DBG.drag.y; if(Math.abs(dy)>10) DBG.drag.moved=true; if(DBG.drag.moved) DBG.sc=clamp(DBG.drag.sc-dy/(DBK.k||1),0,DBG.scMax||0); e.preventDefault(); return; }
  const r=dbgHit(x,y); DBG.hov=r?r.id:null; },true);
ui.addEventListener('pointerup',e=>{ const g=DBG.drag; if(!g) return; DBG.drag=null; e.preventDefault(); e.stopImmediatePropagation(); if(g.moved) return; const r=dbgHit(g.x,g.y); if(r) dbgAct(r.id); },true);
ui.addEventListener('pointercancel',()=>{ DBG.drag=null; },true);
// keys while debugging: Tab / numpad 4 = panel, R / numpad 6 = again, Esc closes the panel
window.addEventListener('keydown',e=>{ if(!DBG.on||Game.state==='title'||TLM.open||e.repeat) return; const c=e.code;
  if(c==='Tab'||c==='Numpad4'){ e.preventDefault(); e.stopImmediatePropagation(); dbgOpen(!DBG.open); Sound.sfx('blip'); return; }
  if(DBG.open&&c==='Escape'){ e.preventDefault(); e.stopImmediatePropagation(); dbgOpen(false); return; }
  if(!DBG.open&&(c==='Numpad6'||(c==='KeyR'&&!Object.values(BIND).includes('KeyR')))){ e.preventDefault(); e.stopImmediatePropagation(); dbgAgain(); return; }
  if(c==='KeyT'&&!Object.values(BIND).includes('KeyT')){ e.preventDefault(); e.stopImmediatePropagation(); dbgLoopToggle(); } },true);
