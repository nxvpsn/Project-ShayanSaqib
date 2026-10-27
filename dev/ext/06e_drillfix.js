// =====================================================================
// THE HEAVENLY DRILL ALWAYS LANDS: while Shayan's special runs, every foe (mobs, the boss, the twins, the giant pig,
// Nathan) is pinned where it stood when the chant began, so the drill (aimed at those spots) hits what it targets,
// moving or off screen. The pin lets go when the special ends (or after 15 s, whatever happens).
// =====================================================================
function drPin(){ const list=[], add=o=>{ if(o&&!list.some(q=>q.o===o)) list.push({o,x:o.x,z:o.z}); };
  for(const m of MOBS) if(m.hp>0) add(m); if(Game.boss&&Game.boss.hp>0) add(Game.boss);
  for(const T of (TW.foes||[])) if(T.hp>0) add(T); if(TW.giant&&TW.giant.hp>0) add(TW.giant); if(typeof NB!=='undefined'&&NB&&NB.alive) add(NB);
  const s={dead:0,t0:performance.now()};
  Game.fxUpd.push(()=>{ try{ if(s.dead||performance.now()-s.t0>15000) return false; for(const q of list){ const o=q.o; o.x=q.x; o.z=q.z; if(o.vx!=null) o.vx=0; if(o.vz!=null) o.vz=0; } return true; }catch(e){ console.error('drill pin',e); return false; } });
  return s; }
(function(){ const sa=specialAttack; specialAttack=function*(){ const pin=drPin(); try{ yield* sa.apply(this,arguments); } finally{ pin.dead=1; } }; })();
