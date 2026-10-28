// =====================================================================
// THE CHANTLESS DRILL: beat He's Day Old Kojima on Shayan's road and a "CHANTLESS DRILL LEARNED!" card pops up. From then on
// (every fight after him: the betrayal solos, Giant Hamza, the duo; the wrong-turn Nathan fight; anything in Debug Mode) the
// Heavenly Drill keeps its rise, freeze and spin-up but charges in 1s, and Shayan only shouts the last line (build.py patches
// specialAttack with twChantless()). The gate twins and Kojima himself still get the full chant.
// =====================================================================
const SH_DRILL_LINE=['shayan',"Heavenly Drill of Eternal Annihilation!"];
function twChantless(){ if(ALI()) return false;
  try{ if(typeof DBG!=='undefined'&&DBG.on&&DBG.boss) return true; }catch(e){}
  if(Game.flags&&Game.flags.kjDone) return true;
  const F=TW.fight; if(F&&F.kind!=='gate'&&F.kind!=='tut') return true;
  if(TW.giant) return true; if(typeof NB!=='undefined'&&NB&&NB.alive) return true; return false; }
// the Kojima win on Shayan's road teaches it
const CHL={t:-1};
(function(){ const mg=twMarkGrimmaw; twMarkGrimmaw=function(){ try{ if(!ALI()){ if(!Game.flags.kjDone){ CHL.t=0; Sound.sfx('secret'); Sound.sfx('ready'); } Game.flags.kjDone=1; } }catch(e){ console.error('chantless',e); } return mg.apply(this,arguments); }; })();
// the pop-up card (drawn over everything, cutscene included)
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ if(CHL.t<0) return; CHL.t+=1/60; const T=4; if(CHL.t>T){ CHL.t=-1; return; }
    const k=CHL.t, a=Math.min(1,k*4)*Math.min(1,(T-k)*2.5), s=1+.25*Math.max(0,1-k*5), cx=UW/2, cy=UH*.24;
    D.save(); D.globalAlpha=a; D.translate(cx,cy); D.scale(s,s);
    D.fillStyle='rgba(12,6,10,.85)'; D.fillRect(-250,-46,500,92); D.fillStyle='#ff4a2a'; D.fillRect(-250,-46,500,3); D.fillRect(-250,43,500,3);
    D.textAlign='center'; D.font=`900 34px ${FB}`; D.lineWidth=5; D.strokeStyle='#1a0408'; D.strokeText('CHANTLESS DRILL LEARNED!',0,4); D.fillStyle='#ffd45a'; D.fillText('CHANTLESS DRILL LEARNED!',0,4);
    D.font=`700 17px ${FB}`; D.fillStyle='#ffd0c0'; D.fillText('The Heavenly Drill now fires in one second ('+K('special')+')',0,32); D.restore(); }catch(e){ console.error('chantless card',e); } }; })();
