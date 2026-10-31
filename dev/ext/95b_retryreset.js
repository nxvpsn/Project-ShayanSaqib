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
  TW._harvest=null; TW.cReadyT=0; Game.fxUpd=[]; JC.lines=[]; JC.flash=0; Game.impSeq=null; Game.slowT=0; Game.timeScale=1; FX.hitstop=0; FX.flash=0; FX.shake=0;
  try{ if(Game.zw) zwEnd(); }catch(e){}
  try{ if(typeof ALI_CH!=='undefined') ALI_CH.force=0; }catch(e){}
  Object.assign(P,{sp:0,counter:0,charge:0,chargeLv:0,atk:null,aliAtk:null,block:false,parryFlash:0,soulSlowT:0,goopT:0,rootT:0,alFlipT:null,cineFly:false,cineAnim:null,scripted:null,vx:0,vy:0,vz:0,dash:0,gliding:false}); }
(function(){ const rs=respawn; respawn=function(){ try{ if(TW.fight||TW.giant||(typeof NB!=='undefined'&&NB&&NB.alive)||Game.boss||Game.mech||TW.paulFight) twRetryReset(); }catch(e){ console.error('retry reset',e); } return rs.apply(this,arguments); }; })();
