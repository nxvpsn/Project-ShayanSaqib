// ---------- the stun meter: a thin yellow line that runs out over a stunned boss (the sperm's own timer in 11b), on every boss ----------
// twStunTrack(o,key) remembers the stun's full length in o._smx (reset once it ends) and returns the fraction left; twStunMeter draws it at screen coords,
// twStunMeterAt over a world point. Foes (Caotan, Omar, the duo, Kojima) and Hamza's giant are drawn here; Nathan on Ali's road (59y) calls these. Not the bullet hell (the owner's call).
function twStunTrack(o,key){ const left=o[key]||0; if(!(left>0)){ o._smx=0; return 0; } o._smx=Math.max(o._smx||0,left); return Math.max(0,Math.min(1,left/o._smx)); }
function twStunMeter(o,key,sx,sy,w,label){ const lt=twStunTrack(o,key); if(!(o[key]>0)) return; const x=Math.round(sx-w/2), y=Math.round(sy);
  D.save(); D.fillStyle='rgba(0,0,0,.6)'; D.fillRect(x-1,y-1,w+2,5); D.fillStyle=lt<.3&&Math.floor(Game.time*10)%2?'#fff6c0':'#ffd23a'; D.fillRect(x,y,Math.round(w*lt),3); /* the last stretch blinks */
  if(label!==false){ D.font=`800 10px ${FB}`; D.textAlign='center'; D.textBaseline='bottom'; D.lineWidth=3; D.strokeStyle='rgba(0,0,0,.6)'; D.strokeText(label||'STUNNED',sx,y-3); D.fillStyle='#ffd23a'; D.fillText(label||'STUNNED',sx,y-3); } D.restore(); }
function twStunMeterAt(o,key,wx,wy,wz){ if(!(o[key]>0)){ o._smx=0; return; } const q=toScreen(wx,wy,wz); if(q[2]>1||q[0]<-60||q[0]>UW+60||q[1]<-20||q[1]>UH+20) return; twStunMeter(o,key,q[0],q[1],IS_TOUCH()?72:96); }
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ if(Game.state!=='play'||Game.letter>.5) return;
    for(const T of TW.foes||[]) if(T.hp>0&&!T.hide&&!T.gone) twStunMeterAt(T,'stun',T.x,T.y+3.6*(T.scale||1),T.z);
    const G=TW.giant; if(G&&G.hp>0) twStunMeterAt(G,'stun',G.x,G.y+5.8,G.z);
    const b=Game.boss; if(b){ b._stunLeft=b.hp>0&&b.state==='stagger'?Math.max(0,(b.stagT||1.4)-(b.st||0)):0; if(b._stunLeft>0) twStunMeterAt(b,'_stunLeft',b.x,b.y+(b.hover||0)+4.4,b.z); } /* Kojima's stagger */ }catch(e){ console.error('stun meter',e); } }; })();
