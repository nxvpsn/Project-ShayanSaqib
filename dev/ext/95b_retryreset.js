// =====================================================================
// RETRY = A CLEAN FIGHT: after a death, every boss fight restarts from its default state. Before the boss's own restart
// (each fight's respawn still runs after this), everything a run left behind is cleared: hazards, every projectile and
// beam (reflected ones too), Nathan's phase I objects and sequences, the slow-mo, impact frames, hit-stop and ZA WARUDO,
// and the player's meters: the special meter, the Full Counter / parry pips, charges, slows and roots.
// =====================================================================
function twRetryReset(){ const P=Player;
  try{ twClearHz(); }catch(e){ console.error('retry hz',e); }
  try{ BOLTS.forEach(b=>{ b.dead=1; }); for(const b of BEAMS){ scene.remove(b.g); if(b.bolt) scene.remove(b.bolt); } BEAMS=[]; }catch(e){ console.error('retry shots',e); }
  try{ if(typeof NP1!=='undefined'&&NP1.live){ np1PdLook(false); np1Clear(); Object.assign(NP1,{seq:null,cam:null,ex:null,alt:null,openT:0,lunge:0,grabLand:0,charging:0,pdDone:0,pdFx:null}); } }catch(e){ console.error('retry np1',e); }
  try{ if(typeof NPX!=='undefined'){ NPX.smear=null; NPX.spd=null; } }catch(e){}
  TW._harvest=null; TW.hzChat=null; TW.cReadyT=0; Game.fxUpd=[]; JC.lines=[]; JC.flash=0; Game.impSeq=null; Game.slowT=0; Game.timeScale=1; FX.hitstop=0; FX.flash=0; FX.shake=0;
  try{ if(Game.zw) zwEnd(); }catch(e){}
  try{ if(typeof ALI_CH!=='undefined') ALI_CH.force=0; }catch(e){}
  Object.assign(P,{sp:0,counter:0,charge:0,chargeLv:0,atk:null,aliAtk:null,block:false,parryFlash:0,soulSlowT:0,goopT:0,rootT:0,alFlipT:null,cineFly:false,cineAnim:null,scripted:null,vx:0,vy:0,vz:0,dash:0,gliding:false}); }
(function(){ const rs=respawn; respawn=function(){ try{ if(TW.fight||TW.giant||(typeof NB!=='undefined'&&NB&&NB.alive)||Game.boss||Game.mech||TW.paulFight) twRetryReset(); }catch(e){ console.error('retry reset',e); } return rs.apply(this,arguments); }; })();
// the player can't hold a NaN: if a position, velocity or facing ever goes non-finite (one bad division anywhere), it is put
// back to the last good frame instead of freezing the game in the map lookup (seen once in a real-browser run of Nathan III)
const PL_SAFE={k:['x','y','z','vx','vy','vz','ang'],last:null,warned:0};
function plSane(){ const P=Player; if(!P) return; let bad=null;
  try{ if(typeof NB!=='undefined'&&NB){ for(const k of ['x','y','z']) if(!Number.isFinite(NB[k])){ NB[k]=k==='y'?groundY(P.x||0,P.z||0)+1.4:(P[k]||0)+(k==='x'?5:0); console.warn('nathan '+k+' was not finite: restored'); } }
    if(typeof TPS!=='undefined'&&TPS.yaw!=null&&!Number.isFinite(TPS.yaw)){ TPS.yaw=(typeof NB!=='undefined'&&NB&&Number.isFinite(NB.x))?Math.atan2(NB.z-(P.z||0),NB.x-(P.x||0)):0; console.warn('tps yaw was not finite: restored'); } }catch(e){} for(const k of PL_SAFE.k){ if(typeof P[k]==='number'&&!Number.isFinite(P[k])){ bad=k; break; } }
  if(bad){ const L0=PL_SAFE.last; for(const k of PL_SAFE.k) if(typeof P[k]==='number'&&!Number.isFinite(P[k])) P[k]=L0&&Number.isFinite(L0[k])?L0[k]:(k==='y'?groundY(P.x||0,P.z||0):0);
    if(!PL_SAFE.warned){ PL_SAFE.warned=1; console.warn('player '+bad+' was not finite: restored'); } return; }
  const L1=PL_SAFE.last||(PL_SAFE.last={}); for(const k of PL_SAFE.k) L1[k]=P[k]; }
(function(){ const up=updatePlayer; updatePlayer=function(dt){ try{ plSane(); }catch(e){} const r=up.apply(this,arguments); try{ plSane(); }catch(e){} return r; }; })();
(function(){ const uw=updateWorld; updateWorld=function(dt){ try{ plSane(); }catch(e){} return uw.apply(this,arguments); }; })();
// the map lookups never throw on a NaN position (the one freeze seen in a real-browser run was cellH reading L.H[NaN]):
// a non-finite x or z reads as open ground at height 0 for that call, and plSane puts the position back next frame
(function(){ const gy=groundY; groundY=function(x,z){ if(!Number.isFinite(x)||!Number.isFinite(z)) return 0; return gy.apply(this,arguments); };
  const ch=cellH; cellH=function(x,z){ if(!Number.isFinite(x)||!Number.isFinite(z)) return 0; return ch.apply(this,arguments); }; })();
