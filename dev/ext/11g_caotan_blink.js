// =====================================================================
// CAOTAN BLINKS (his solo fight, every phase): before goo and Impregnate he blinks to a random 4-10 units from you, and while
// idle he blinks to a new spot every few seconds (twBlink: the same white burst at both ends). The gate and duo fights are unchanged.
// =====================================================================
const CAO_BLINK={dist:[4,10], every:[2.4,3.8]};
function caoSolo(T){ const F=TW.fight; return !!F&&F.kind==='solo'&&T&&T.who==='caotan'; }
// a spot about r from you, inside the arena (tries around you, keeps the farthest if the walls get in the way)
function caoBlinkSpot(r){ const P=Player, a0=rnd(0,6.283); let best=null, bd=-1;
  for(let k=0;k<12;k++){ const a=a0+k*.5236, p=twClampXZ(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,1), d=Math.hypot(p.x-P.x,p.z-P.z); if(d>=r-.5) return p; if(d>bd){ bd=d; best=p; } } return best; }
(function(){ for(const k of ['goo','impregnate']){ const f=TWK.caotan[k]; if(!f) continue;
    TWK.caotan[k]=function*(T,ph){ if(caoSolo(T)){ const p=caoBlinkSpot(rnd(CAO_BLINK.dist[0],CAO_BLINK.dist[1])); twBlink(T,p.x,p.z); T.blinkT=rnd(CAO_BLINK.every[0],CAO_BLINK.every[1]); yield .25; } yield* f.apply(this,arguments); }; } })();
// idle: a blink every few seconds (not mid-move, stunned, downed or in a limit cut)
(function(){ const uf=twUpdateFoe; twUpdateFoe=function(T,dt,play){ const r=uf.apply(this,arguments);
    try{ if(play&&caoSolo(T)&&!T.gen&&!(T.stun>0)&&!T.down&&T.hp>0&&T.state!=='lc'&&!T.hide&&!IMP.down&&Game.state==='play'&&!Game.script){
        if(T.blinkT==null) T.blinkT=rnd(CAO_BLINK.every[0],CAO_BLINK.every[1]); T.blinkT-=dt;
        if(T.blinkT<=0){ T.blinkT=rnd(CAO_BLINK.every[0],CAO_BLINK.every[1]); const p=caoBlinkSpot(rnd(CAO_BLINK.dist[0],CAO_BLINK.dist[1])); twBlink(T,p.x,p.z); } } }catch(e){ console.error('caotan blink',e); }
    return r; }; })();
