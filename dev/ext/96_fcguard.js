// =====================================================================
// SHAYAN'S FULL COUNTER: it stuns the boss for a second and cancels the move in progress (no more attacks right behind it), every clone
// within its reach shatters (with the parry sound), and while it swings (0.3s, no i-frames, no blinking) any melee rush, clone or
// teleport strike that reaches him is parried. Its press, and any press in those 0.3s, never counts toward a timed parry.
// (Outermost playerHit wrapper: it has to run before the strict-timing and i-frame checks.)
// =====================================================================
const SH_FC_GUARD=.3, SH_FC_STUN=1;
(function(){ const cs=twCounterSlash; twCounterSlash=function(){ const r=cs.apply(this,arguments), P=Player; P.fcT0=Game.time-.05; P.fcGuardT=Game.time+SH_FC_GUARD; try{ twFcStun(); }catch(e){ console.error('fc stun',e); }
    try{ for(const c of TW._clones||[]){ if(c.gone||c.res||c.st==='wait') continue; if(Math.hypot(c.x-P.x,c.z-P.z)<7.5){ c.res=Game.time; c.hit=true; c.st='dash'; c.d0=99; c.dist=0; Game.dmgNums.push({x:c.x,y:groundY(c.x,c.z)+3,z:c.z,n:'SHATTER',t:0,col:'#d0a0ff'}); Sound.sfx('parry'); Sound.sfx('deflect'); FX.burst(c.x,groundY(c.x,c.z)+1.4,c.z,18,0xd0a0ff,4,.3); } } }catch(e){ console.error('fc clones',e); }
    return r; }; })();
// the Full Counter's press and every press during the guard don't count toward timed parries
(function(){ const sf=twStrictFirst; twStrictFirst=function(from){ const P=Player; if(!(P.fcT0>0)) return sf.apply(this,arguments); for(const p of TW.presses||[]) if(p.t>from&&!(p.t>=P.fcT0&&p.t<=P.fcGuardT)) return p; return null; }; })();
(function(){ const ph=playerHit; playerHit=function(dmg,sx,sz,opt){ const P=Player;
    if(P.fcGuardT>Game.time&&opt&&opt.melee&&!opt.pierce&&Game.state==='play'){ try{ const mx=lerp(P.x,sx,.45), mz=lerp(P.z,sz,.45); FX.spark(mx,P.y+1.1,mz); FX.spark(mx,P.y+1.4,mz); Sound.sfx('parry'); if(opt.onParry) opt.onParry(); }catch(e){ console.error('fc guard',e); } return 'parry'; }
    return ph.apply(this,arguments); }; })();
// the boss reels for a second: its move stops (outside limit cuts and scripted moments)
function twFcStun(){ const t=SH_FC_STUN, F=TW.fight;
  if(F&&TW.foes&&!F.lc&&!Game.script){ for(const T of TW.foes){ if(!T||T.hp<=0||T.gone||T.inv||T.state==='lc'||T.state==='cut') continue; T.gen=null; T.stun=Math.max(T.stun||0,t); T.state='stun'; T.lockF=0; T.swing=0; T.cast=0; T.mv=null; T.flash=.3; if(T.hide) T.hide=0; }
    if(F.kind==='duo'){ F.busy=0; F.kick=null; } }
  const G=TW.giant; if(G&&G.hp>0&&!G.inv&&!G.lc){ G.gen=null; G.stun=Math.max(G.stun||0,t); }
  const b=Game.boss; if(b&&b.hp>0&&!b.inv&&typeof stagger==='function') stagger(b,t);
  if(typeof NB!=='undefined'&&NB&&NB.alive&&!NB.inv&&!NB.stunned&&typeof nbStunned==='function'){ NB.gen=nbStunned(t); NB.wait=0; NB.busyAtk=1; }
  Game.dmgNums.push({x:Player.x,y:Player.y+3.6,z:Player.z,n:'STUNNED',t:0,col:'#ffd45a'}); }
// its own stun doesn't boost its own hit (stunned twins take 1.6x): the Full Counter keeps its damage
(function(){ const th=twHurt; twHurt=function(T,d,src){ const A=Player.atk; if(src==='melee'&&A&&A.big&&T&&T.stun>0&&!ALI()) d=d/1.6; return th.call(this,T,d,src); }; })();
