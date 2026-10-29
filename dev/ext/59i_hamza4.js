// =====================================================================
// BIG BACK HAMZA, ROUND 4: the fight makes sense again
// - a real arena: 26 x 20 around his center (it was the whole field, so Pork Roll bounced off the map's edges and Belly Slide ran
//   50 units and left him a 20-second walk away). The babies, the slide and the edge drops all use it (twBounds).
// - the silent contact hit (2 damage every 0.9s for standing near him) is gone: when you stay on his snout he does a SNOUT SHOVE
//   with a tell (a pink ring, a grunt, .45s), parryable (silver slash), a stagger when parried.
// - he never trudges after you at 2.2 u/s any more: 9.5+ away, he hops back to 4 units in front of you (a small shadow, 2 damage).
// - Debug Mode: the pig himself exists (newHamza) and the twins join, as in the story fight.
// - the twins: Caotan alternates his ray with a three-ball goo volley, Omar his cut with a thrown crescent; both shoot the babies
//   on sight (piglets within 7); cooldowns are shorter (07_allies) and they talk more.
// =====================================================================
function hzgArena(c){ return {x0:Math.max(3,c.x-13),x1:Math.min(L.w-3,c.x+13),z0:Math.max(3,c.z-10),z1:Math.min(L.d-3,c.z+10)}; }
(function(){ const hs=hzgStart; hzgStart=function(){ if(!Game.hamza&&typeof newHamza==='function'){ try{ newHamza(); }catch(e){ console.error('hamza fairy',e); } } /* Debug Mode warps in without him */
    const r=hs.apply(this,arguments); try{ const G=TW.giant, c=G.center, lock=hzgArena(c); G.lock=lock; if(TW.fight) TW.fight.lock=lock; Game.arena={lock};
      const gr=TW.giantRespawn; TW.giantRespawn=function(){ const q=gr.apply(this,arguments); Game.arena={lock}; return q; };
      if(typeof DBG!=='undefined'&&DBG.on&&!TW.allies.length&&typeof twSetParty==='function') twSetParty('both'); }catch(e){ console.error('hamza arena',e); } return r; }; })();
// the snout shove (close) and the hop back (far)
HZG.shove=function*(G,ph){ const P=Player; G.mouth=1; Sound.sfx('pigrumble'); FX.ring(G.x,groundY(G.x,G.z)+.1,G.z,'#ff6a9a',3.4,.45); const from=Game.time+TW_STRICT.grace; yield .45;
  const a=Math.atan2(Player.z-G.z,Player.x-G.x); Sound.sfx('swing'); Sound.sfx('oink'); G.mv={sx:G.x,sz:G.z,x:G.x+Math.cos(a)*1.1,z:G.z+Math.sin(a)*1.1,t:0,dur:.12}; FX.burst(G.x+Math.cos(a)*2.2,G.y+1.2,G.z+Math.sin(a)*2.2,16,0xffb0c8,4,.25);
  const s={t:0,hit:false}; twHz({upd(dt,play){ if(!play) return true; s.t+=dt; if(!s.hit) twRushTell(G,a,1.4); const Pp=Player;
      if(!s.hit&&Math.hypot(Pp.x-G.x,Pp.z-G.z)<3.6&&Pp.y<G.y+2){ if(twStrictDo(from,()=>twHitP(2,G.x,G.z,{heavy:true,melee:true,win:TW_DASH_WIN,onParry:()=>{ G.stun=Math.max(G.stun,1.2); Game.dmgNums.push({x:G.x,y:G.y+4,z:G.z,n:'STAGGERED',t:0,col:'#ffd45a'}); }}))!=='none') s.hit=true; }
      return s.t<.22; }}); yield .4; G.mouth=0; };
HZG.hop=function*(G,ph){ const P=Player, a=Math.atan2(P.z-G.z,P.x-G.x); yield* hzgLeap(G,P.x-Math.cos(a)*4,P.z-Math.sin(a)*4,.7,5,2.4,2,0,false); yield .25; };
(function(){ const hu=hzgUpdate; hzgUpdate=function(dt,play){ const G=TW.giant; if(G) G.touchT=1; /* the base contact hit stays off */ const r=hu.apply(this,arguments);
    try{ if(!G||!play||G.hp<=0||G.inv||G.noAttack||G.gen||G.stun>0||G.pend||Game.script||Game.state!=='play'){ if(G) G.nearT=0; return r; }
      const P=Player, d=Math.hypot(P.x-G.x,P.z-G.z);
      if(d<2.9){ G.nearT=(G.nearT||0)+dt; if(G.nearT>.5){ G.nearT=0; G.gen=HZG.shove(G,G.phase); G.wait=0; } }
      else { G.nearT=0; if(d>9.5&&G.cd>.4){ G.gen=HZG.hop(G,G.phase); G.wait=0; } } }catch(e){ console.error('hamza 4',e); } return r; }; })();
// the twins against the babies and with a second move each
function hzgPigletNear(A,r){ let best=null, bd=r; for(const m of MOBS){ if(m.type!=='piglet'||m.hp<=0) continue; const d=Math.hypot(m.x-A.x,m.z-A.z); if(d<bd){ bd=d; best=m; } } return best; }
(function(){ const ua=twUpdateAlly; twUpdateAlly=function(A,dt,play){ try{ const G=TW.giant; if(play&&G&&G.hp>0&&TW.fight&&TW.fight.kind==='giant'&&(A.who==='caotan'||A.who==='omar')&&!(A.down>0)&&!A.hold&&!Player.hidden&&Game.state==='play'&&!Game.script&&A.cd-dt<=0){
        const m=hzgPigletNear(A,7);
        if(m){ A.cd=1.1; const ang=Math.atan2(m.z-A.z,m.x-A.x); if(A.who==='caotan'){ A.glintT=.3; Sound.sfx('ting'); twAllyRay(A.x,A.y+1.9,A.z,m.x,m.y+.6,m.z,0xffb0e0); } else { A.cast=.3; FX.arc(m.x,m.y,m.z,ang,0,true); FX.cut(m.x,m.y+.8,m.z); Sound.sfx('swing'); }
          damageMob(m,4,ang); twBark(A.who,A.who==='caotan'?["Not the babies! ...Okay, the babies.","Pew! Sorry, piglet. Senpai comes first."][Math.floor(Math.random()*2)]:["Small pig. Small problem.","Back to the void, little one."][Math.floor(Math.random()*2)],true); return ua.apply(this,arguments); }
        A.alt=!A.alt; if(A.alt){ const tg=twAllyTarget(); if(tg&&tg.o===G){ const o=G;
          if(A.who==='caotan'){ A.cd=rnd(2.4,3); A.push=.4; A.glintT=.4; Sound.sfx('beam'); A.anim='beam'; for(let i=0;i<3;i++) twAllyShot(A,o,tg,0xff8ab0,.9,'ball',i*.16); twBark('caotan',["Goo volley! For senpai!","Triple shot! I never miss! ...twice."][Math.floor(Math.random()*2)]); }
          else { A.cd=rnd(2.8,3.4); A.cast=.4; Sound.sfx('swing'); A.anim='beam'; twAllyShot(A,o,tg,0x9a4aff,2.2,'crescent',0); twBark('omar',["A crescent. Catch.","I throw these at my problems. You are a problem, pig."][Math.floor(Math.random()*2)]); }
          return ua.apply(this,arguments); } } } }catch(e){ console.error('hamza allies',e); } return ua.apply(this,arguments); }; })();
