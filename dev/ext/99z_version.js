// =====================================================================
// THE BUILD'S VERSION, bottom right on every screen (so the owner can tell which build the live site is serving).
// Bump GAME_VERSION when asked.
// =====================================================================
const GAME_VERSION='v1.21';
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ D.save(); D.setTransform(RW/UW,0,0,RH/UH,0,0); D.font=`700 13px ${FB}`; D.textAlign='right'; D.textBaseline='alphabetic';
      D.lineWidth=3; D.strokeStyle='rgba(0,0,0,.6)'; D.strokeText(GAME_VERSION,UW-8,UH-7); D.fillStyle='rgba(255,255,255,.6)'; D.fillText(GAME_VERSION,UW-8,UH-7); D.restore(); }catch(e){} }; })();
