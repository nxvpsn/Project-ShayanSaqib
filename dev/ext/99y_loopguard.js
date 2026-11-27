// =====================================================================
// THE FRAME LOOP'S SAFETY NET (v1.89). The base loop re-arms itself on its last line, so one exception anywhere in a frame ended
// the game for good: a frozen picture (the owner hit this on the Kill ending's last card). Now a frame that throws is logged,
// the UI is still drawn (so a cutscene's film and dialogue keep going), and the next frame is asked for all the same.
// A line at the bottom of the screen names the error for a few seconds so it can be reported.
// =====================================================================
const LG={n:0,last:'',t:-1e9};
(function(){ const lp=loop; loop=function(){ try{ return lp.apply(this,arguments); }catch(e){ LG.n++; LG.last=String((e&&e.stack)||e).split('\n').slice(0,2).join(' ').slice(0,180); LG.t=performance.now(); try{ console.error('frame',e); }catch(e2){}
      try{ drawUI(); }catch(e2){} try{ clearHits(); }catch(e2){} requestAnimationFrame(loop); } }; })();
(function(){ const du=drawUI; drawUI=function(){ const r=du.apply(this,arguments); try{ if(LG.n&&performance.now()-LG.t<8000){ D.save(); D.setTransform(RW/UW,0,0,RH/UH,0,0); D.globalAlpha=.8; D.font='500 12px monospace'; D.textAlign='left'; D.fillStyle='#000'; D.fillRect(0,UH-18,Math.min(UW,D.measureText(LG.last).width+90),18); D.fillStyle='#ff9a8a'; D.fillText('frame error ('+LG.n+'): '+LG.last,6,UH-5); D.restore(); } }catch(e){} return r; }; })();
