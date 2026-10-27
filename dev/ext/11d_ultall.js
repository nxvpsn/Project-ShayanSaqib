// =====================================================================
// ULTIMATES HIT EVERYTHING ON SCREEN. Shayan's Heavenly Drill splits into a swarm (the base drillSplit) whenever two or more
// enemies are on screen in any fight (twins, giant Hamza and his piglets, Nathan, Kojima and his minions, Caotan's pink sperm),
// one mini drill per enemy, each landing the drill's usual damage; with one enemy it stays the single big drill.
// Ali's ultimate (Judgement Cut) targets the same list. The pink sperm dies in one hit to either (burned by the drill, cut by Ali).
// The goo clone still drills back (11c), so the Drill with a clone out is the drill clash.
// =====================================================================
function ultList(){ const P=Player, on=o=>!!o&&Math.abs(o.x-P.x)<16&&Math.abs(o.z-P.z)<12, L=[];
  for(const T of TW.foes||[]) if(T.hp>0&&!T.gone&&!T.hide&&!T.inv&&on(T)) L.push(T);
  const G=TW.giant; if(G&&G.hp>0&&!G.inv&&on(G)) L.push(G);
  if(typeof NB!=='undefined'&&NB&&NB.alive&&!NB.inv&&on(NB)) L.push(NB);
  const B=Game.boss; if(B&&B.hp>0&&!B.inv&&!BLOCK_ST.includes(B.state)&&on(B)) L.push(B);
  if(Game.twins&&Game.twins.active) for(const T of Game.twins.list) if(T.hp>0&&on(T)) L.push(T);
  for(const m of MOBS) if(m.hp>0&&on(m)) L.push(m);
  for(const S of IMP.list) if(!S.dead&&S.st!=='burn'&&S.st!=='cut'&&on(S)) L.push(S);
  return L; }
// the drill's targets (base specialAttack, patched in build.py): outside fights every mob as before; in a fight, everyone when 2+
function ultFoes(){ const L=ultList(), fight=!!(Game.boss||TW.fight||TW.giant||(typeof NB!=='undefined'&&NB&&NB.alive)||(Game.twins&&Game.twins.active));
  if(!fight) return L.filter(m=>MOBS.includes(m)); if(L.length<2) return []; TW._dsplit=1; return L; }
// one mini drill lands (base drillSplit, patched): the same damage the single drill does to that kind of enemy
function ultHit(T,src){ const P=Player;
  if(IMP.list.includes(T)){ impKill(T,'burn'); return; }
  if(TW.foes.includes(T)){ const w=T.inv; T.inv=false; twHurt(T,16,'ult'); T.inv=w; return; }
  if(T===TW.giant){ hzgHurt(16,'ult'); return; }
  if(typeof NB!=='undefined'&&T===NB){ nbDamage(50,true); return; }
  if(T===Game.boss){ damageBoss(10); if(T.hp>0) stagger(T,1.6); return; }
  if(Game.twins&&Game.twins.list.includes(T)){ damageTwin(T,10); return; }
  if(T.hp>0) damageMob(T,10,Math.atan2(T.z-P.z,T.x-P.x)); }
// Ali's ultimate: everything on screen while it runs
(function(){ const au=aliUltimate; aliUltimate=function*(){ TW._ultAll=1; try{ yield* au.apply(this,arguments); } finally{ TW._ultAll=0; } };
  const at=aliTargets; aliTargets=function(){ if(TW._ultAll){ try{ const L=ultList(); if(L.length) return L; }catch(e){ console.error('ult targets',e); } } return at.apply(this,arguments); };
  const ah=aliHit; aliHit=function(T,d){ if(IMP.list.includes(T)){ impKill(T,'cut'); return; } return ah.apply(this,arguments); }; })();
