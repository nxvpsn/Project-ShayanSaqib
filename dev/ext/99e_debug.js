// =====================================================================
// DEBUG MODE (secret, numpad 5): a sandbox in the flower field for playtesting bosses.
// Left panel: character, cheats, which boss to spawn, AI mode (Idle / Active / Loop the chosen
// mechanic), phase, boss HP, limit cuts. Right panel: every mechanic of that boss; click one to run it.
// Final defeats never advance the story here: the boss just leaves and can be spawned again.
//
// DBG_NEW lists what the latest patch added or changed; those rows (and their boss) show a NEW tag.
// RULE FOR EVERY PATCH (see CLAUDE.md): replace DBG_PATCH and DBG_NEW with the mechanics that patch
// touched, as 'boss:move' keys ('boss:*' tags a whole boss). Boss ids: caotan, omar, duo, hamza, nathan, mech.
// =====================================================================
const DBG_PATCH='Oct 26: bullet-hell Cosmic Hamza';
const DBG_NEW=['mech:*'];
const DBG={on:false,hide:false,boss:null,mode:'active',move:null,rects:[],hov:null,ali:false,slow:false,blade:true,msg:null};
const DBG_BOSSES=[['caotan','Caotan'],['omar','Omar'],['duo','Twins (duo)'],['hamza','Big Back Hamza'],['nathan','Nathan'],['mech','Cosmic Hamza'],['grimmaw','Grimmaw ↗'],['paul','Paul ↗']];
function dbgNew(b,k){ return DBG_NEW.includes(b+':*')||(k?DBG_NEW.includes(b+':'+k):DBG_NEW.some(x=>x.startsWith(b+':'))); }
function dbgName(k){ const S=[...(TH_SPELLS[1]||[]),...(TH_SPELLS[2]||[])].find(s=>s[2]===k); if(DBG.boss==='mech'&&S){ const m=S[0].match(/「(.*)」/); return m?m[1]:S[0]; }
  return String(k).replace(/([a-z])([A-Z0-9])/g,'$1 $2').replace(/^./,c=>c.toUpperCase()); }
function dbgSay(t){ DBG.msg={t,at:performance.now()}; }

// ---------- what is on the field ----------
function dbgSolo(){ return TW.fight&&TW.fight.kind==='solo'?TW.foes[0]:null; }
function dbgDuo(){ return TW.fight&&TW.fight.kind==='duo'?TW.fight:null; }
function dbgPhases(){ return {caotan:3,omar:3,duo:3,hamza:2,nathan:4,mech:2}[DBG.boss]||0; }
function dbgPhase(){ const b=DBG.boss; if(b==='caotan'||b==='omar'){ const T=dbgSolo(); return T?T.phase:0; } if(b==='duo'){ const F=dbgDuo(); return F?F.phase:0; }
  if(b==='hamza') return TW.giant?TW.giant.phase:0; if(b==='nathan') return NB?NB.phase:0; if(b==='mech') return Game.mech?Game.mech.phase:0; return 0; }
function dbgHP(){ const b=DBG.boss; let h=null,m=1; if(b==='caotan'||b==='omar'){ const T=dbgSolo(); if(T){ h=T.hp; m=T.maxHp; } } else if(b==='duo'){ const F=dbgDuo(); if(F){ h=F.C.hp+F.O.hp; m=F.C.maxHp+F.O.maxHp; } }
  else if(b==='hamza'&&TW.giant){ h=TW.giant.hp; m=TW.giant.maxHp; } else if(b==='nathan'&&NB){ const p=NB.phase, top=NB_PHASES[p-1], bot=NB_PHASES[p]!=null?NB_PHASES[p]:0; h=NB.bars-bot; m=top-bot; } else if(b==='mech'&&Game.mech&&Game.mech.boss){ h=Game.mech.boss.hp; m=Game.mech.boss.maxHp; }
  return h==null?null:clamp(h/m,0,1); }
function dbgMoves(){ const b=DBG.boss, uniq=a=>[...new Set(a)];
  if(b==='caotan'||b==='omar') return uniq([1,2,3].flatMap(p=>TWPOOL[b][p]||[])).filter(k=>TWK[b][k]);
  if(b==='duo') return uniq([1,2,3].flatMap(p=>DUO3_POOL[p]||[]).concat(['scytheRain'])).filter(k=>DUO[k]);
  if(b==='hamza') return uniq(HZG_POOL[1].concat(HZG_POOL[2])).filter(k=>HZG[k]);
  if(b==='nathan') return uniq([1,2,3,4].flatMap(p=>NB_POOL[p]||[]));
  if(b==='mech') return TH_SPELLS[1].concat(TH_SPELLS[2]).map(s=>s[2]); return []; }
function dbgLCs(){ return {caotan:[['Limit cut · II','lc',2],['Limit cut · III','lc',3]],omar:[['Limit cut · II','lc',2],['Limit cut · III','lc',3]],duo:[['Waltz · II','lc',2],['Fusion · III','lc',3]],
  hamza:[['Buffet · II','buffet',2],['Frenzy (finale)','frenzy',2]],nathan:[['Storm · II','storm',2],['Heaven · III','heaven',3],['Overdrive (finale)','over',4]],mech:[]}[DBG.boss]||[]; }

// ---------- actions ----------
function dbgToggle(){ if(TLM.open) twTimelineClose(null); if(DBG.on){ DBG.on=false; dbgSay(''); return false; } DBG.on=true; DBG.hide=false; DBG.ali=ALI(); if(TW.god==null) TW.god=true; TW.god=true; dbgArena(null); return true; }
function dbgArena(then){ Object.assign(Game,{script:null,wait:null,dlg:null,timeScale:1,slowT:0,banner:null,card:null,evaCard:null}); Voice.stop(); Cam.cine=null; Game.letterTo=0;
  // already in the field as the right hero: just clear it (instant respawns); otherwise reload it
  if(L&&L.key==='flowers'&&!Game.mech&&ALI()===DBG.ali){ twEndFight(); TW.giant=null; if(typeof hzgClearBabies==='function') hzgClearBabies(); nbRemove(); twClearAllies(); Game.boss=null; Game.bossBar=0; JC.lines=[]; Game.fxUpd=[];
    Game.state='play'; Game.arena=null; Cam.focus=null; Cam.zoom=1; Player.hidden=false; if(!DBG.ali&&DBG.blade) Game.flags.aliSword=1; if(then) then(); return; }
  run(function*(){ twWarpReset(DBG.ali); yield* twWarpFlowers({noHamza:1}); Game.state='play'; Game.arena=null; Cam.zoom=1; if(!DBG.ali&&DBG.blade) Game.flags.aliSword=1; if(then) then(); }); }
function dbgSpawn(id){ DBG.boss=id; DBG.move=null;
  if(id==='grimmaw'||id==='paul'){ dbgSay('Warping (with its intro cutscene)'); Object.assign(Game,{script:null,wait:null,dlg:null}); run(function*(){ yield* twWarp(id==='paul'?'paul':(DBG.ali?'al_cao_g':'sh_cao_g')); }); return; }
  if(id==='mech'){ Object.assign(Game,{script:null,wait:null,dlg:null}); run(function*(){ twWarpReset(false); yield fadeOut(); enterMech(); NAT.x=-14; NAT.y=0; NAT.show=1; Game.mech.st='fight'; Game.mech._resp=1; Game.fade=1; Game.fadeTo=0; startMechPhase(1); dbgApplyMode(); }); return; }
  dbgArena(()=>{ const c=L.zone?{x:L.zone.x,z:L.zone.z}:{x:Player.x,z:Player.z};
    if(id==='caotan'||id==='omar'){ const T=twStartSolo(id); T.cd=1.2; }
    else if(id==='duo'){ const F=twDuoStart(c.x-3,c.z-4,c.x+3,c.z-4); F.director=1; F.dcd=1.2; Game.state='play'; Sound.play('diva'); }
    else if(id==='hamza'){ hzgStart(); TW.giant.inv=false; }
    else if(id==='nathan'){ nbMake(c.x,c.z-6); NB.bars=NB.hp=NB_PHASES[0]; run(function*(){ yield* nbBeginPhase(1); }); }
    resetPlayer({x:c.x,z:c.z+5},true); Player.hp=Player.maxHp; dbgApplyMode(); }); }
function dbgDespawn(){ DBG.move=null; if(Game.mech||DBG.boss==='grimmaw'||DBG.boss==='paul') dbgArena(null); else { twEndFight(); TW.giant=null; if(typeof hzgClearBabies==='function') hzgClearBabies(); nbRemove(); Game.arena=null; Cam.focus=null; Cam.zoom=1; Game.bossBar=0; } }
// the AI mode is enforced every frame in dbgTick; this just cancels what the boss is doing when you pick Idle
function dbgApplyMode(){ if(DBG.mode!=='idle') return; const T=dbgSolo(), F=dbgDuo(); if(T){ T.gen=null; T.state='idle'; } if(F){ F.C.gen=F.O.gen=null; F.busy=0; } if(TW.giant) TW.giant.gen=null; if(NB){ NB.gen=null; NB.busyAtk=0; } twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; });
  const Tm=Game.mech&&Game.mech.th; if(Tm){ Tm.gen=null; Tm.eb=[]; Tm.spell=null; } }
function dbgRun(k){ const b=DBG.boss; DBG.move=k; twClearHz(); BOLTS.forEach(x=>{ if(!x.friendly) x.dead=1; });
  if(b==='caotan'||b==='omar'){ const T=dbgSolo(); if(!T||!TWK[b][k]) return; T.stun=0; T.state='atk'; T.last=k; T.gen=TWK[b][k](T,T.phase); T.wait=0; }
  else if(b==='duo'){ const F=dbgDuo(); if(!F) return; F.lc=0; F.busy=0; F.C.stun=F.O.stun=0; if(k==='scytheRain'&&!TW.planted.length) dbgSay('Scythe Rain needs planted scythes: run Volley first'); twDuo3Begin(F,k); }
  else if(b==='hamza'){ const G=TW.giant; if(!G) return; G.mv=null; G.gen=HZG[k](G,G.phase); G.wait=0; }
  else if(b==='nathan'){ if(!NB) return; NB.gen=nbPattern(k); NB.wait=0; NB.busyAtk=1; }
  else if(b==='mech'){ const T=Game.mech&&Game.mech.th; if(!T) return; T.dbgSpell=k; T.gen=null; T.wait=0; T.eb=[]; T.spell=null; }
  dbgSay('Running: '+dbgName(k)); }
function dbgSetPhase(n){ const b=DBG.boss; DBG.move=null; twClearHz(); BOLTS.forEach(x=>{ if(!x.friendly) x.dead=1; });
  if(b==='caotan'||b==='omar'){ const T=dbgSolo(); if(!T) return; const hp=twHPFor(n,b); Object.assign(T,{phase:n,hp,maxHp:hp,form:n,gen:null,state:'idle',inv:false,stun:0,bag:[],down:0,dying:0,cd:1}); T.lcDone[n]=0; twMeta(T); Sound.play(TW_MUSIC[b][n]); }
  else if(b==='duo'){ const F=dbgDuo(); if(!F) return; F.phase=n; F.lc=0; F.lcDone[n]=0; F.bag=[]; F.busy=0; F.pend=null; for(const T of [F.C,F.O]) Object.assign(T,{phase:n,hp:DUO_HP[n],maxHp:DUO_HP[n],form:n,down:0,inv:false,stun:0,gen:null,state:'idle',bag:[]}); }
  else if(b==='hamza'){ const G=TW.giant; if(!G) return; Object.assign(G,{phase:n,hp:HZG_HP[n],maxHp:HZG_HP[n],bag:[],lcDone:0,inv:false,gen:null,pend:null,frenzied:0}); }
  else if(b==='nathan'){ if(!NB) return; NB.bars=NB.hp=NB_PHASES[n-1]; NB.alive=true; NB.lcA=n>2?1:0; NB.lcB=n>3?1:0; NB.over=0; NB.pend=null; nbClear(); run(function*(){ yield* nbBeginPhase(n); }); }
  else if(b==='mech'){ if(!Game.mech) return; Game.mech._resp=1; startMechPhase(n); }
  dbgSay('Phase '+['','I','II','III','IV'][n]); }
function dbgSetHP(k){ const b=DBG.boss; if(b==='caotan'||b==='omar'){ const T=dbgSolo(); if(T) T.hp=Math.max(.1,T.maxHp*k); } else if(b==='duo'){ const F=dbgDuo(); if(F) for(const T of [F.C,F.O]){ T.hp=Math.max(.1,T.maxHp*k); T.down=0; T.inv=false; } }
  else if(b==='hamza'&&TW.giant){ TW.giant.hp=Math.max(.1,TW.giant.maxHp*k); } else if(b==='nathan'&&NB){ const p=NB.phase, top=NB_PHASES[p-1], bot=NB_PHASES[p]!=null?NB_PHASES[p]:0; NB.bars=NB.hp=bot+(top-bot)*Math.max(.01,k); }
  else if(b==='mech'&&Game.mech&&Game.mech.boss){ const B=Game.mech.boss; B.hp=Math.max(.1,B.maxHp*k); } }
// kill = deal exactly the bar's remaining HP through the normal damage path, so phase changes play as in the game
function dbgKill(){ const b=DBG.boss, ot=TW.otk; TW.otk=false;
  try{ if(b==='caotan'||b==='omar'){ const T=dbgSolo(); if(T){ T.lcDone[T.phase]=1; T.inv=false; T.state='idle'; twHurt(T,T.hp+1,'test'); } }
    else if(b==='duo'){ const F=dbgDuo(); if(F){ F.lcDone[F.phase]=1; for(const T of [F.C,F.O]){ T.inv=false; if(T.hp>0) twHurt(T,T.hp+1,'test'); } } }
    else if(b==='hamza'&&TW.giant){ const G=TW.giant; G.lcDone=1; G.inv=false; hzgHurt(G.hp+1,'test'); }
    else if(b==='nathan'&&NB){ NB.lcA=NB.lcB=1; NB.inv=false; const p=NB.phase, bot=NB_PHASES[p]!=null?NB_PHASES[p]:0; nbDamage(NB.bars-bot+.01); }
    else if(b==='mech'&&Game.mech&&Game.mech.boss){ const B=Game.mech.boss; B.vuln=true; mechDamage(B.hp+1,0,0,0,true); } } finally{ TW.otk=ot; } }
function dbgLC(kind,ph){ const b=DBG.boss; if(dbgPhase()!==ph&&kind!=='frenzy'&&kind!=='over') dbgSetPhase(ph); twClearHz(); BOLTS.forEach(x=>{ if(!x.friendly) x.dead=1; });
  if(b==='caotan'||b==='omar'){ const T=dbgSolo(); if(!T) return; T.hp=T.maxHp/2; T.state='lc'; T.lcDone[ph]=1; T.gen=TWK[b]['lc'+(ph-1)](T); T.wait=0; }
  else if(b==='duo'){ const F=dbgDuo(); if(!F) return; const C=F.C, O=F.O; F.lcDone[ph]=1; F.lc=1; F.busy=1; twLCPrep(C); twLCPrep(O); C.down=O.down=0; C.gen=(ph===2?DUO.waltz:DUO.fusion)(C,O); C.wait=0; O.gen=twWaitFor(C)(); O.wait=0; }
  else if(b==='hamza'){ const G=TW.giant; if(!G) return; if(kind==='buffet'){ G.lcDone=1; G.inv=true; G.mv=null; G.gen=hzgBuffet(G); G.wait=0; } else { G.frenzied=1; G.gen=null; run(function*(){ yield* hzgFrenzy(G); if(TW.giant===G){ G.inv=false; G.hp=Math.max(G.hp,G.maxHp*.2); Game.state='play'; Game.letterTo=0; Cam.cine=null; } }); } }
  else if(b==='nathan'){ if(!NB) return; if(kind==='over'){ NB.over=1; run(function*(){ yield* nbOverdrive(); if(NB){ NB.alive=true; yield* nbBeginPhase(NB.phase); } }); }
    else { if(kind==='storm') NB.lcA=1; else NB.lcB=1; NB.inv=true; nbClear(); NB.pend=kind==='storm'?nbStorm:nbHeaven; nbPend(); } }
  dbgSay('Limit cut: '+kind); }

// ---------- every frame: enforce the AI mode, loop the chosen mechanic, slow-mo ----------
function dbgBusy(){ const b=DBG.boss; if(b==='caotan'||b==='omar'){ const T=dbgSolo(); return !T||!!T.gen||T.stun>0||T.state==='lc'||!!TW.fight.pend; } if(b==='duo'){ const F=dbgDuo(); return !F||F.busy||!!F.C.gen||!!F.O.gen||F.lc||!!F.pend; }
  if(b==='hamza'){ const G=TW.giant; return !G||!!G.gen||G.inv||!!G.pend; } if(b==='nathan') return !NB||!!NB.gen||NB.inv||!!NB.pend; return true; }
function dbgTick(){ if(!DBG.on) return; const idle=DBG.mode==='idle', loop=DBG.mode==='loop'&&DBG.move; const F=TW.fight;
  if(F&&F.kind==='solo') F.noAttack=idle||loop; if(F&&F.kind==='duo'&&!F.lc&&!F.pend) F.director=(idle||loop)?0:1; if(TW.giant) TW.giant.noAttack=idle||loop;
  if(NB&&(idle||loop)){ NB.cd=Math.max(NB.cd,.5); NB.dodgeCd=Math.max(NB.dodgeCd||0,.5); }
  const Tm=Game.mech&&Game.mech.th; if(Game.mech) Game.mech.dbgIdle=idle; if(Tm&&DBG.boss==='mech') Tm.dbgLoop=DBG.mode==='loop';
  if(loop&&Game.state==='play'&&!Game.script&&DBG.boss!=='mech'&&!dbgBusy()){ DBG.loopT=(DBG.loopT||0)+1/60; if(DBG.loopT>.6){ DBG.loopT=0; const k=DBG.move; dbgRun(k); } } else DBG.loopT=0;
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

// ---------- the panels ----------
const DBP={L:{x:12,y:12,w:316},R:{x:UW-12-300,y:12,w:300}};
function dbgBtn(x,y,w,h,label,id,o){ o=o||{}; const hov=DBG.hov===id; uRR(x,y,w,h,6); D.fillStyle=o.on?'rgba(227,182,90,.9)':hov?'rgba(255,255,255,.14)':'rgba(255,255,255,.06)'; D.fill(); D.strokeStyle=o.on?UIC.acc:UIC.line2; D.lineWidth=1; D.stroke();
  D.font=`700 12px ${FB}`; let t=label; while(D.measureText(t).width>w-(o.nw?44:14)&&t.length>3) t=t.slice(0,-2)+'…'; if(t!==label&&!t.endsWith('…')) t+='…';
  uText(t,o.nw?x+8:x+w/2,y+h/2+4,`700 12px ${FB}`,o.on?'#1a1408':o.dim?UIC.dim:UIC.text,o.nw?'left':'center');
  if(o.nw){ uRR(x+w-38,y+h/2-8,32,16,8); D.fillStyle='#ff4a7a'; D.fill(); uText('NEW',x+w-22,y+h/2+4,`900 9px ${FB}`,'#fff','center'); }
  DBG.rects.push({x,y,w,h,id}); }
function dbgChk(x,y,on,label,id){ uRR(x,y,14,14,3); D.fillStyle=on?UIC.acc:'rgba(0,0,0,.4)'; D.fill(); D.strokeStyle=UIC.line2; D.stroke(); if(on){ D.strokeStyle='#1a1408'; D.lineWidth=2; D.beginPath(); D.moveTo(x+3,y+7.5); D.lineTo(x+6,y+10.5); D.lineTo(x+11,y+4); D.stroke(); }
  uText(label,x+20,y+11,`600 12px ${FB}`,on?UIC.text:UIC.mut); DBG.rects.push({x:x-2,y:y-3,w:140,h:20,id}); }
// the sections: the desktop shows two side panels (setup + boss on the left, moves on the right); phones show one paged panel (99f_mobile.js)
function dbgHead(x,y,w,closeId){ uText('DEBUG MODE',x,y,`900 16px ${FB}`,'#ff8aa8'); if(closeId) dbgBtn(x+w-62,y-16,28,22,'–','hide'); dbgBtn(x+w-30,y-16,30,22,'✕',closeId||'off');
  y+=16; uText(DBG_PATCH,x,y,`600 11px ${FB}`,UIC.mut); uRR(x+w-38,y-11,32,15,7); D.fillStyle='#ff4a7a'; D.fill(); uText('NEW',x+w-22,y,`900 9px ${FB}`,'#fff','center'); return y+20; }
function dbgSecSetup(x,y,w){ uCaps('PLAYER',x,y,UIC.dim,10); y+=8; dbgBtn(x,y,w/2-3,24,'Shayan','ali:0',{on:!DBG.ali}); dbgBtn(x+w/2+3,y,w/2-3,24,'Ali','ali:1',{on:DBG.ali}); y+=32;
  dbgChk(x,y,!!TW.god,'Infinite HP','t:god'); dbgChk(x+w/2,y,!!TW.otk,'One-hit kill','t:otk'); y+=22; dbgChk(x,y,!!TW.infFC,ALI()?'Infinite JC':'Infinite Full Counter','t:fc'); dbgChk(x+w/2,y,DBG.slow,'Slow-mo ½','t:slow'); y+=22;
  if(!ALI()){ dbgChk(x,y,!!Game.flags.aliSword,"Ali's blade (10× Nathan)",'t:blade'); y+=22; }
  dbgBtn(x,y,(w-12)/3,24,'Heal','heal'); dbgBtn(x+(w-12)/3+6,y,(w-12)/3,24,'Full meter','meter'); dbgBtn(x+2*(w-12)/3+12,y,(w-12)/3,24,'Clear hazards','clear'); y+=34;
  uCaps('SPAWN A BOSS',x,y,UIC.dim,10); y+=8; DBG_BOSSES.forEach(([id,nm],i)=>{ const col=i%2, bw=w/2-3; dbgBtn(x+col*(bw+6),y,bw,24,nm,'boss:'+id,{on:DBG.boss===id,nw:dbgNew(id)}); if(col) y+=28; }); return y+6; }
function dbgCtl(){ const b=DBG.boss; return b&&b!=='grimmaw'&&b!=='paul'; }
function dbgSecBoss(x,y,w){ const b=DBG.boss;
  if(!b){ uText('Spawn a boss first.',x,y+4,`italic 600 12px ${FB}`,UIC.mut); return y+20; }
  if(!dbgCtl()){ uText('Warped to the real fight (intro included).',x,y+4,`italic 600 12px ${FB}`,UIC.mut); return y+20; }
  const ph=dbgPhase(), hp=dbgHP(); uText(DBG_BOSSES.find(q=>q[0]===b)[1]+(ph?'  ·  phase '+['','I','II','III','IV'][ph]:'  ·  not on the field'),x,y+4,`700 13px ${FB}`,UIC.accL); if(hp!=null) uText(Math.round(hp*100)+'%',x+w,y+4,`700 13px ${FB}`,UIC.text,'right'); y+=12;
  if(hp!=null){ uRR(x,y,w,5,2); D.fillStyle='rgba(255,255,255,.08)'; D.fill(); uRR(x,y,Math.max(3,w*hp),5,2); D.fillStyle='#ff4a7a'; D.fill(); } y+=14;
  uCaps('AI',x,y,UIC.dim,10); y+=8; [['idle','Idle'],['active','Active'],['loop','Loop move']].forEach(([m,l],i)=>dbgBtn(x+i*(w/3+1),y,w/3-3,24,l,'mode:'+m,{on:DBG.mode===m})); y+=30;
  if(DBG.mode==='loop') { uText(DBG.move?'Looping: '+dbgName(DBG.move):'Pick a mechanic to loop it',x,y+4,`italic 600 11px ${FB}`,UIC.mut); y+=16; }
  uCaps('PHASE',x,y,UIC.dim,10); y+=8; const n=dbgPhases(); for(let i=1;i<=n;i++) dbgBtn(x+(i-1)*(w/n),y,w/n-4,24,['','I','II','III','IV'][i],'phase:'+i,{on:ph===i}); y+=30;
  uCaps('BOSS HP',x,y,UIC.dim,10); y+=8; [['100%',1],['50%',.5],['10%',.1]].forEach(([l,k],i)=>dbgBtn(x+i*(w/4),y,w/4-4,24,l,'hp:'+k)); dbgBtn(x+3*(w/4),y,w/4,24,'Kill bar','kill'); y+=30;
  const lcs=dbgLCs(); if(lcs.length){ uCaps('LIMIT CUTS',x,y,UIC.dim,10); y+=8; lcs.forEach(([l,k,p],i)=>{ const col=i%2, bw=w/2-3; dbgBtn(x+col*(bw+6),y,bw,24,l,'lc:'+k+':'+p,{nw:dbgNew(b,k)}); if(col||i===lcs.length-1) y+=28; }); y+=2; }
  dbgBtn(x,y,w,24,'Despawn boss','despawn'); return y+30; }
function dbgSecMoves(x,y,w,cols){ const b=DBG.boss, moves=dbgMoves(); if(!moves.length){ uText(dbgCtl()?'':'Spawn a boss first.',x,y+4,`italic 600 12px ${FB}`,UIC.mut); return y; }
  uText(DBG.mode==='loop'?'tap one to loop it':'tap one to run it now',x,y,`600 11px ${FB}`,UIC.mut); y+=12;
  const ph=dbgPhase(), inPool=k=>{ if(b==='caotan'||b==='omar') return (TWPOOL[b][ph]||[]).includes(k); if(b==='duo') return (DUO3_POOL[ph]||[]).includes(k)||k==='scytheRain'; if(b==='hamza') return (HZG_POOL[ph]||[]).includes(k); if(b==='nathan') return (NB_POOL[ph]||[]).includes(k); if(b==='mech') return (TH_SPELLS[ph]||[]).some(s=>s[2]===k); return true; };
  const nc=cols||(moves.length>22?2:1), cw=(w-(nc-1)*6)/nc, rh=nc>1?24:26; moves.forEach((k,i)=>{ const col=i%nc, row=Math.floor(i/nc); dbgBtn(x+col*(cw+6),y+row*(rh+3),cw,rh,dbgName(k),'move:'+k,{on:DBG.move===k,nw:dbgNew(b,k),dim:!inPool(k)}); });
  const rows=Math.ceil(moves.length/nc); y+=rows*(rh+3)+16; uText('Dimmed = not in this phase\'s pool (still runnable)',x,y,`500 11px ${FB}`,UIC.dim); return y; }
function dbgDraw(){ if(!DBG.on||Game.state==='title'||TLM.open) return; DBG.rects=[]; D.save();
  if(DBG.hide){ dbgBtn(12,12,128,26,'DEBUG ▸ show','show'); D.restore(); return; }
  const Lp=DBP.L, x=Lp.x+14, w=Lp.w-28; uPanel(Lp.x,Lp.y,Lp.w,UH-24,'rgba(10,12,22,.9)',UIC.line2,10);
  let y=dbgHead(x,Lp.y+26,w,null); y=dbgSecSetup(x,y,w); dbgSecBoss(x,y,w);
  y=UH-12-58; uText(DBG.msg&&DBG.msg.t&&performance.now()-DBG.msg.at<4000?DBG.msg.t:'',x,y,`700 12px ${FB}`,'#9ff8ff');
  uText('Numpad 5 leaves debug mode · Esc menu still works',x,y+22,`500 11px ${FB}`,UIC.dim); uText('Hidden numpad: 0 HP · 1 FC · 2 OHK · 3 timeline',x,y+38,`500 11px ${FB}`,UIC.dim);
  if(dbgCtl()){ const Rp=DBP.R, rx=Rp.x+12, rw=Rp.w-24; uPanel(Rp.x,Rp.y,Rp.w,UH-24,'rgba(10,12,22,.9)',UIC.line2,10); uText('Mechanics',rx,Rp.y+26,`900 16px ${FB}`,UIC.accL); dbgSecMoves(rx,Rp.y+42,rw); }
  D.restore(); }
(function(){ const du=drawUI; drawUI=function(){ du(); try{ dbgDraw(); }catch(e){ console.error('debug ui',e); } }; })();
function dbgAct(id){ Sound.sfx('blip'); const [a,v,w]=id.split(':');
  if(a==='show'){ DBG.hide=false; return; } if(a==='hide'){ DBG.hide=true; return; } if(a==='off'){ dbgToggle(); twCheatToast('DEBUG MODE: OFF',false); return; }
  if(a==='ali'){ DBG.ali=v==='1'; dbgArena(()=>{ if(DBG.boss&&DBG.boss!=='grimmaw'&&DBG.boss!=='paul'&&DBG.boss!=='mech') dbgSpawn(DBG.boss); }); return; }
  if(a==='t'){ if(v==='god') TW.god=!TW.god; else if(v==='otk') TW.otk=!TW.otk; else if(v==='fc'){ TW.infFC=!TW.infFC; if(!TW.infFC) Player.counter=0; } else if(v==='slow'){ DBG.slow=!DBG.slow; if(!DBG.slow) Game.timeScale=1; } else if(v==='blade'){ DBG.blade=!Game.flags.aliSword; if(DBG.blade) Game.flags.aliSword=1; else delete Game.flags.aliSword; } return; }
  if(a==='heal'){ const P=Player; P.hp=P.maxHp; if(NAT){ NAT.ap=NAT.maxAp; if(Game.mech&&Game.mech.th) Game.mech.th.lives=TH.LIVES; } return; }
  if(a==='meter'){ Player.sp=20; if(NAT) NAT.sp=100; return; } if(a==='clear'){ twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); if(Game.mech&&Game.mech.th) Game.mech.th.eb=[]; return; }
  if(a==='boss'){ dbgSpawn(v); return; } if(a==='despawn'){ dbgDespawn(); DBG.boss=null; return; }
  if(a==='mode'){ DBG.mode=v; dbgApplyMode(); return; } if(a==='phase'){ dbgSetPhase(+v); return; } if(a==='hp'){ dbgSetHP(+v); return; } if(a==='kill'){ dbgKill(); return; }
  if(a==='lc'){ dbgLC(v,+w); return; } if(a==='move'){ dbgRun(v); return; } }
ui.addEventListener('pointerdown',e=>{ if(!DBG.on||TLM.open||Game.state==='title') return; const [x,y]=tlPt(e), r=DBG.rects.find(q=>x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h);
  const inL=!DBG.hide&&x<DBP.L.x+DBP.L.w&&y<UH-12, inR=!DBG.hide&&dbgMoves().length&&x>DBP.R.x&&y<UH-12; if(!r&&!inL&&!inR) return; e.preventDefault(); e.stopImmediatePropagation(); if(r) dbgAct(r.id); },true);
ui.addEventListener('pointermove',e=>{ if(!DBG.on) return; const [x,y]=tlPt(e), r=DBG.rects.find(q=>x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h); DBG.hov=r?r.id:null; },true);
