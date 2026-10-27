// =====================================================================
// SHAYAN'S FULL COUNTER GUARD: for a second after he fires it nothing touches him (no blinking), and any melee rush, clone or
// teleport strike that reaches him in that time is parried (clones shatter, rushes bounce off) instead of hitting or grabbing him.
// Every clone within its reach shatters at once, and neither the Full Counter's press nor any press during the guard counts toward a
// timed parry (they can't be judged 'too early' and get you grabbed).
// (Outermost playerHit wrapper: it has to run before the strict-timing and i-frame checks.)
// =====================================================================
const SH_FC_GUARD=1;
(function(){ const cs=twCounterSlash; twCounterSlash=function(){ const r=cs.apply(this,arguments), P=Player; P.fcT0=Game.time-.05; P.fcGuardT=Game.time+SH_FC_GUARD; P.inv=Math.max(P.inv||0,SH_FC_GUARD); P.parryIF=1; /* no blink */
    try{ for(const c of TW._clones||[]){ if(c.gone||c.res||c.st==='wait') continue; if(Math.hypot(c.x-P.x,c.z-P.z)<7.5){ c.res=Game.time; c.hit=true; c.st='dash'; c.d0=99; c.dist=0; Game.dmgNums.push({x:c.x,y:groundY(c.x,c.z)+3,z:c.z,n:'SHATTER',t:0,col:'#d0a0ff'}); FX.burst(c.x,groundY(c.x,c.z)+1.4,c.z,18,0xd0a0ff,4,.3); } } }catch(e){ console.error('fc clones',e); }
    return r; }; })();
// the Full Counter's press and every press during the guard don't count toward timed parries
(function(){ const sf=twStrictFirst; twStrictFirst=function(from){ const P=Player; if(!(P.fcT0>0)) return sf.apply(this,arguments); for(const p of TW.presses||[]) if(p.t>from&&!(p.t>=P.fcT0&&p.t<=P.fcGuardT)) return p; return null; }; })();
(function(){ const ph=playerHit; playerHit=function(dmg,sx,sz,opt){ const P=Player;
    if(P.fcGuardT>Game.time&&opt&&opt.melee&&!opt.pierce&&Game.state==='play'){ try{ const mx=lerp(P.x,sx,.45), mz=lerp(P.z,sz,.45); FX.spark(mx,P.y+1.1,mz); FX.spark(mx,P.y+1.4,mz); Sound.sfx('parry'); if(opt.onParry) opt.onParry(); }catch(e){ console.error('fc guard',e); } return 'parry'; }
    return ph.apply(this,arguments); }; })();
