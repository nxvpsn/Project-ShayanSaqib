// =====================================================================
// SHAYAN'S FULL COUNTER GUARD: for half a second after he fires it nothing touches him (no blinking), and any melee rush, clone or
// teleport strike that reaches him in that time is parried (clones shatter, rushes bounce off) instead of hitting or grabbing him.
// (Outermost playerHit wrapper: it has to run before the strict-timing and i-frame checks.)
// =====================================================================
const SH_FC_GUARD=.5;
(function(){ const cs=twCounterSlash; twCounterSlash=function(){ const r=cs.apply(this,arguments), P=Player; P.fcGuardT=Game.time+SH_FC_GUARD; P.inv=Math.max(P.inv||0,SH_FC_GUARD); P.parryIF=1; /* no blink */ return r; }; })();
(function(){ const ph=playerHit; playerHit=function(dmg,sx,sz,opt){ const P=Player;
    if(P.fcGuardT>Game.time&&opt&&opt.melee&&!opt.pierce&&Game.state==='play'){ try{ const mx=lerp(P.x,sx,.45), mz=lerp(P.z,sz,.45); FX.spark(mx,P.y+1.1,mz); FX.spark(mx,P.y+1.4,mz); Sound.sfx('parry'); if(opt.onParry) opt.onParry(); }catch(e){ console.error('fc guard',e); } return 'parry'; }
    return ph.apply(this,arguments); }; })();
