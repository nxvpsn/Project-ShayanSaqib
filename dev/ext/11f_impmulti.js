// =====================================================================
// IMPREGNATE, TWO OR THREE SPERM (phases II-III, 11b): each sperm that gets you = one clone, picked at random (no repeats) from the
// FIREBALL clone (11c), the SPAZ and the DRILL clone; three = all of them. Phase I is always the fireball clone.
// SPAZ (lasts 30s, then melts): dash-jumps at random within half a screen of you (IMPX.leash; farther and he hops back at you), spamming swings (they can hurt you, and you can parry them). One hit kills him (green bar), but a
//   swing or a fireball that lands while he is mid-swing gets parried by accident. Getsugas always hit.
//   Anything of Caotan's or the other clones' (blasts, lasers, waves, bolts, goo lobs, the fireball clone's fireball and rush,
//   the drill clone's AoE) kills him outright. Ultimates kill him too (11d).
// DRILL: two jump dashes away, then chants the Heavenly Drill for 10s (the words over his head, a half-size drill growing above
//   him; he parries anything you throw at him; with the rush clone also out, your drill splits in two, impDrillBoth). Then the drill flies at where you stand: a huge unjumpable circle you can run
//   out of; he explodes after. Your own Drill, while his is out, goes only for his drill and destroys it (he fizzles).
//   No time freeze, no slow-mo, no screen chant: it all happens while you keep fighting.
// =====================================================================
const IMPX={leash:9, spazLife:30, spazHp:1, chant:10, drillR:4.6, drillFly:1.3, drillDmg:4};
function impMkClone(kind,x,z){ const spr=new Sprite3D(96,96); spr.show(false);
  const C={kind,x,z,y:groundY(x,z),gy:groundY(x,z),ang:0,st:'emerge',t:0,k:0,n:0,spr,al:ALI(),anim:'idle',swU:1,swN:0,sw:.2,lastSw:Player.swingT||0,wasSw:false,sayT:0,emerge:0,ek:0,dead:false,flash:0};
  IMP.extra.push(C);
  twHz({upd(dt,play){ try{ if(play) (kind==='spaz'?impSpazUpd:impDrillUpd)(C,dt); impCloneDraw(C); }catch(e){ console.error('goo clone '+kind,e); C.dead=true; } if(C.dead){ impExtraEnd(C); return false; } return true; },
    kill(){ impExtraEnd(C); }});
  return C; }
function impExtraEnd(C){ if(C.ended) return; C.ended=1; try{ C.spr.dispose(); }catch(e){} if(C.drill){ C.drill.dead=1; scene.remove(C.drill.g); C.drill=null; } const i=IMP.extra.indexOf(C); if(i>=0) IMP.extra.splice(i,1); }
// squeezing out of you while you're down; true once you're up
function impEmerge(C,dt){ const P=Player; C.ang=Math.atan2(P.z-C.z,P.x-C.x); C.anim='idle';
  if(!C.emerge&&C.t>.55){ C.emerge=1; const a=C.slot!=null?C.slot:rnd(0,6.28), q=twClampXZ(P.x+Math.cos(a)*1.5,P.z+Math.sin(a)*1.5,1); C.x=q.x; C.z=q.z; C.gy=groundY(C.x,C.z); C.y=C.gy;
    Sound.sfx('squelch'); FX.burst(P.x,P.y+.8,P.z,24,0xffffff,5,.35,false); FX.burst(C.x,C.y+1,C.z,20,0xf4f0e6,3,.3,false); }
  if(C.emerge) C.ek=Math.min(1,C.ek+dt/.45);
  return !IMP.down; }
// ---------- the spaz ----------
function impSpaz(x,z){ const C=impMkClone('spaz',x,z); C.hp=IMPX.spazHp; return C; }
function impSpazUpd(C,dt){ const P=Player; C.t+=dt; C.k+=dt; C.gy=groundY(C.x,C.z); C.swU=Math.min(1,C.swU+dt/.12); C.flash=Math.max(0,C.flash-dt); C.sayT-=dt;
  if(C.st==='emerge'){ if(C.t>.75&&!C.said){ C.said=1; if(C.al) twBark('gooali',"WAAAGH! Which one of you is the real one?! I'll just hit EVERYONE!",true); else twBark('gooshayan',"WAAAGH! Which one of you is the real one?! I'll just hit EVERYONE!",true); }
    if(impEmerge(C,dt)){ C.emerge=1; C.ek=1; C.st='go'; C.k=0; C.life=IMPX.spazLife; } return; }
  C.life-=dt; if(C.life<=0){ impSpazKill(C,'time'); return; } /* he only lasts 30s, then melts */
  // dash-jumps at random (toward you, away, sideways...) but never more than half a screen (IMPX.leash) from you: too far and he hops back at you
  if(!C.hop){ const L=IMPX.leash, dP=Math.hypot(P.x-C.x,P.z-C.z); let tx, tz;
    if(dP>L){ const a=Math.atan2(P.z-C.z,P.x-C.x)+rnd(-.5,.5), r=Math.min(dP-L*.4,rnd(5,8)); tx=C.x+Math.cos(a)*r; tz=C.z+Math.sin(a)*r; }
    else { const a=rnd(0,6.283), r=rnd(2.5,7); tx=C.x+Math.cos(a)*r; tz=C.z+Math.sin(a)*r; const e=Math.hypot(tx-P.x,tz-P.z); if(e>L){ tx=P.x+(tx-P.x)*L/e; tz=P.z+(tz-P.z)*L/e; } }
    const q=twClampXZ(tx,tz,1.2);
    C.hop={sx:C.x,sz:C.z,tx:q.x,tz:q.z,t:0,dur:Math.max(.25,Math.hypot(q.x-C.x,q.z-C.z)/14),rest:rnd(.05,.3)}; Sound.sfx('djump'); }
  const H=C.hop; H.t+=dt; const u=Math.min(1,H.t/H.dur); C.x=lerp(H.sx,H.tx,u); C.z=lerp(H.sz,H.tz,u); C.y=C.gy+Math.sin(u*Math.PI)*1.4; if(H.dur>0&&u<1) C.ang=Math.atan2(H.tz-H.sz,H.tx-H.sx);
  if(u<1&&Math.random()<.6) FX.spawn(C.x,C.y+rnd(.3,1.3),C.z,0,0,0,.25,0xffffff,.28,0,true);
  if(u>=1){ C.y=C.gy; C.ang=Math.atan2(P.z-C.z,P.x-C.x); if(H.t>H.dur+H.rest) C.hop=null; }
  // swing spam: one every .16s, wherever he is (they only land up close; parryable)
  C.sw-=dt; if(C.sw<=0){ C.sw=.16; C.swU=0; C.swN++; if(Math.random()<.6) Sound.sfx('swing'); try{ pxvSlash('sh_slash',C.x,C.y,C.z,C.ang+rnd(-1,1),C.swN%2,1.8); }catch(e){}
    const d=Math.hypot(P.x-C.x,P.z-C.z); if(d<1.9&&Math.abs(P.y-C.y)<1.8){ const r=twHitP(1,C.x,C.z,{melee:true}); if(r==='parry'){ C.flash=.2; C.hop=null; C.sw=.5; } } }
  C.atkOn=C.swU<.45; C.anim=C.atkOn?'swing':(u<1?'jump':'run');
  if(Math.random()<.25) FX.spawn(C.x+rnd(-.4,.4),C.y+rnd(.3,1.4),C.z,0,-1.5,0,.5,0xf4f0e6,.14,6,false);
  impSpazHits(C); }
// your hits on him: slashes and fireballs (parried by accident mid-swing), Getsugas (always), and anything hostile (instant death)
function impSpazHits(C){ const P=Player, s=impSwinging(), sw=P.swingT||0, start=sw!==C.lastSw||(s&&!C.wasSw); C.lastSw=sw; C.wasSw=s;
  if(start){ const d=Math.hypot(P.x-C.x,P.z-C.z), big=!!(P.atk&&P.atk.big), reach=big?7:ALI()?3.8:2.4;
    if(d<reach&&Math.abs(P.y-C.y)<2.2&&(d<1||angDiff(Math.atan2(C.z-P.z,C.x-P.x),P.ang||0)<1.4)){ if(C.atkOn&&!big) impSpazParry(C,lerp(C.x,P.x,.4),C.y+1.1,lerp(C.z,P.z,.4)); else impSpazHurt(C,1); if(C.dead) return; } }
  for(const f of TW.fb||[]){ if(f.life<=0||f.hit.has(C)) continue; if(Math.hypot(f.x-C.x,f.z-C.z)<f.r+.7&&Math.abs(f.y-(C.y+1))<1.8){ f.hit.add(C); if(!f.big) f.life=0;
      if(C.atkOn) impSpazParry(C,f.x,f.y,f.z); else { twFireballHit(f,f.x,f.y,f.z); impSpazHurt(C,1); } if(C.dead) return; } }
  for(const b of (typeof BEAMS!=='undefined'?BEAMS:[])||[]){ if(!b||b.dead||!b.hit||b.hit.has(C)) continue; if(Math.hypot(b.x-C.x,b.z-C.z)<1.6){ b.hit.add(C); impSpazHurt(C,2); if(C.dead) return; } }
  for(const b of BOLTS){ if(b.dead||b.friendly||b.delay>0) continue; if(Math.hypot(b.x-C.x,b.z-C.z)<.85&&Math.abs(b.y-(C.y+1))<1.6){ b.dead=1; impSpazKill(C,'friendly'); return; } } }
function impSpazParry(C,x,y,z){ Sound.sfx('parry'); FX.spark(x,y,z); FX.ring(x,C.gy+.1,z,'#ffffff',1.4,.3); C.swU=0; Game.dmgNums.push({x:C.x,y:C.y+2.6,z:C.z,n:'PARRIED?!',t:0,col:'#ffffff'});
  if(C.sayT<=0){ C.sayT=5; if(C.al) twBark('gooali',"I MEANT TO DO THAT!"); else twBark('gooshayan',"I MEANT TO DO THAT!"); } }
function impSpazHurt(C,n){ if(C.dead) return; C.hp-=n; C.flash=.25; Sound.sfx('hit'); FX.burst(C.x,C.y+1.1,C.z,14,0xffffff,4,.25,false); C.hop=null;
  const P=Player, a=Math.atan2(C.z-P.z,C.x-P.x), q=twClampXZ(C.x+Math.cos(a)*1.2,C.z+Math.sin(a)*1.2,1); C.x=q.x; C.z=q.z;
  if(C.hp<=0) impSpazKill(C,'you'); else Game.dmgNums.push({x:C.x,y:C.y+2.6,z:C.z,n:C.hp+'/'+IMPX.spazHp,t:0,col:'#ffffff'}); }
function impSpazKill(C,by){ if(C.dead) return; C.dead=true; C.hp=0; Sound.sfx('squelch'); Sound.sfx('gore'); shake(.35); FX.burst(C.x,C.y+1,C.z,40,0xffffff,6,.35,false); FX.ring(C.x,C.gy+.1,C.z,'#ffffff',2.2,.35);
  Game.dmgNums.push({x:C.x,y:C.y+3,z:C.z,n:'SPLAT',t:0,big:true,col:'#ffffff'}); twZone(C.x,C.z,1.1,999,{splat:1,op:.95,col:0xfaf6ff});
  if(by==='friendly') twBark('caotan',"Oops! Sorry, Junior! Friendly fire builds character!",true);
  else if(by==='time'){ if(C.al) twBark('gooali',"Too much... spazzing... I'm... melting...",true); else twBark('gooshayan',"Too much... spazzing... I'm... melting...",true); }
  else if(C.al) twBark('gooali',"Worth it! Totally worth it! Bleeeegh!",true); else twBark('gooshayan',"Worth it! Totally worth it! Bleeeegh!",true); }
// the spaz dies to anything of Caotan's or the other clones': hooks on the hazards' ally checks (blasts, lasers, waves) and goo lobs
function impSpazArea(test){ for(const c of IMP.extra.slice()) if(c.kind==='spaz'&&!c.dead&&c.st!=='emerge'&&test(c)) impSpazKill(c,'friendly'); }
(function(){ const ao=twAllyAoE; twAllyAoE=function(x,z,r){ try{ impSpazArea(c=>Math.hypot(c.x-x,c.z-z)<r+.3); }catch(e){ console.error('spaz aoe',e); } return ao.apply(this,arguments); };
  const al=twAllyLine; twAllyLine=function(x,z,ux,uz,len,hw){ try{ impSpazArea(c=>{ const px=c.x-x, pz=c.z-z, a=px*ux+pz*uz; return a>-.3&&a<len&&Math.abs(px*uz-pz*ux)<hw; }); }catch(e){ console.error('spaz line',e); } return al.apply(this,arguments); };
  const ar=twAllyRing; twAllyRing=function(x,z,r){ try{ impSpazArea(c=>c.y<c.gy+.5&&Math.abs(Math.hypot(c.x-x,c.z-z)-r)<.45); }catch(e){ console.error('spaz ring',e); } return ar.apply(this,arguments); };
  const th=twThrow; twThrow=function(o){ const ol=o.onLand; o.onLand=function(x,z,play){ try{ if(play) impSpazArea(c=>Math.hypot(c.x-x,c.z-z)<(o.r||.9)); }catch(e){ console.error('spaz lob',e); } if(ol) return ol.apply(this,arguments); }; return th.apply(this,arguments); }; })();
// ---------- the drill clone ----------
function impDrillClone(x,z){ return impMkClone('drill',x,z); }
function impDrillUpd(C,dt){ const P=Player, toP=Math.atan2(P.z-C.z,P.x-C.x), away=toP+Math.PI; C.t+=dt; C.gy=groundY(C.x,C.z); C.swU=Math.min(1,C.swU+dt/.18); C.sayT-=dt; if(!C.held) C.k+=dt;
  if(C.st==='emerge'){ if(C.t>2.6&&!C.said){ C.said=1; if(C.al) twBark('gooali',"Hold on, let me find a quiet spot. This chant is LONG.",true); else twBark('gooshayan',"Hold on, let me find a quiet spot. This chant is LONG.",true); }
    if(impEmerge(C,dt)){ C.emerge=1; C.ek=1; impGo(C,'hops'); } return; }
  if(C.st==='hops'){ // two jump dashes away from you
    if(C.n>=2){ C.y=C.gy; impGo(C,'chant'); return; }
    const u=Math.min(1,C.k/.38); if(C.hopA==null){ C.hopA=away+rnd(-.6,.6); Sound.sfx('djump'); FX.ring(C.x,C.gy+.05,C.z,'#ffffff',1.2,.3); }
    C.ang=C.hopA; C.anim='jump'; const q=twClampXZ(C.x+Math.cos(C.hopA)*13*dt,C.z+Math.sin(C.hopA)*13*dt,1.2); C.x=q.x; C.z=q.z; C.y=C.gy+Math.sin(u*Math.PI)*1.8;
    if(u>=1){ C.y=C.gy; C.n++; C.k=0; C.hopA=null; } return; }
  if(C.st==='chant'){ C.ang=toP; C.anim='charge'; C.y=C.gy; impAutoParry(C);
    if(!C.drill){ const d=makeDrill(); d.x=C.x; d.y=C.gy+4.2; d.z=C.z; d.s=.05; d.spin=10; d.fire=.3; d.dir.set(0,-1,0); C.drill=d; Sound.sfx('charge'); }
    const k=Math.min(1,C.k/IMPX.chant), d=C.drill; C.chantK=k; d.s=.05+.45*k; /* half the size of yours */ d.spin=10+k*40; d.fire=.3+k*1.4; d.x=C.x; d.z=C.z; d.y=C.gy+4.2+k*.8;
    if(Math.random()<.3) FX.spawn(C.x+rnd(-.6,.6),C.y+rnd(.4,1.8),C.z,0,1.4,0,.5,0xff5a2a,.2,0,true);
    if(k>=1){ C.tx=P.x; C.tz=P.z; C.sx=d.x; C.sy=d.y; C.sz=d.z; impGo(C,'fire'); Sound.sfx('beam'); shake(.4);
      if(C.al) twBark('gooali',"HEAVENLY DRILL OF ETERNAL ANNIHILATION!",true); else twBark('gooshayan',"HEAVENLY DRILL OF ETERNAL ANNIHILATION!",true);
      const tx=C.tx, tz=C.tz; twBlast(tx,tz,IMPX.drillR,IMPX.drillFly,{col:0xff3a2a,dmg:IMPX.drillDmg,h:99,shake:1.1,sfx:'slam',onBoom(){ const gy=groundY(tx,tz); impactFrame([[1,2],[2,2]]); Sound.sfx('crossboom');
        FX.burst(tx,gy+.6,tz,70,0xff4a10,9,.4); FX.burst(tx,gy+.6,tz,30,0x1a0a0c,6,.45,false); for(let i=0;i<3;i++) FX.ring(tx,gy+.1,tz,i?'#ff3a2a':'#ffd0a0',IMPX.drillR*(.6+i*.3),.45); }}); }
    return; }
  if(C.st==='fire'){ const d=C.drill, u=Math.min(1,C.k/IMPX.drillFly), e=u*u, ty=groundY(C.tx,C.tz)+.4; C.anim='shoot';
    if(d){ d.x=lerp(C.sx,C.tx,e); d.y=lerp(C.sy,ty,e)+Math.sin(u*Math.PI)*1.2; d.z=lerp(C.sz,C.tz,e); d.dir.set(C.tx-C.sx,ty-C.sy,C.tz-C.sz); d.spin=70; d.fire=2.2; }
    if(u>=1){ if(d){ d.fire=0; d.dead=1; scene.remove(d.g); C.drill=null; } impGo(C,'spent'); } return; }
  if(C.st==='spent'||C.st==='fizzle'){ C.anim='idle'; if(C.k>.6){ impDrillPop(C,C.st==='fizzle'); C.dead=true; } } }
function impDrillPop(C,fizzled){ Sound.sfx('squelch'); Sound.sfx('gore'); Sound.sfx('slam'); shake(.5); FX.burst(C.x,C.y+1,C.z,60,0xffffff,7,.4,false); FX.ring(C.x,C.gy+.1,C.z,'#ffffff',2.6,.4);
  Game.dmgNums.push({x:C.x,y:C.y+3,z:C.z,n:'SPLAT',t:0,big:true,col:'#ffffff'}); twZone(C.x,C.z,1.2,999,{splat:1,op:.95,col:0xfaf6ff});
  if(fizzled){ if(C.al) twBark('gooali',"My drill! You drilled my drill?! That's not even allowed!",true); else twBark('gooshayan',"My drill! You drilled my drill?! That's not even allowed!",true); }
  else if(C.al) twBark('gooali',"Worth... every... syllable...",true); else twBark('gooshayan',"Worth... every... syllable...",true); }
// your Drill while his is out: it goes only for his drill and destroys it
function* impDrillVsDrill(C){ const P=Player, gy=P.y; let d=null; C.held=1;
  try{ P.sp=0; P.inv=99; P.atk=null; P.charge=0; P.vx=P.vz=0; P.cineFly=true; P.cineAnim='jump'; Sound.sfx('djump');
    yield tween(P,{y:gy+2},.3,t=>1-Math.pow(1-t,3)); P.cineAnim='charge';
    d=makeDrill(); d.x=P.x; d.y=gy+5.2; d.z=P.z; d.s=.1; d.spin=20; d.fire=.6; d.dir.set(0,-1,0); Sound.sfx('charge');
    for(let w=0;w<1;w+=.08){ d.s=.1+w*.8; d.spin=20+w*50; d.fire=.6+w*1.6; yield wait(.04); }
    const E=C.drill; if(!E||E.dead||C.dead) return;
    const sx=d.x, sy=d.y, sz=d.z; Sound.sfx('beam');
    for(let u=0;u<=1.001;u+=.125){ const k=u*u; d.x=lerp(sx,E.x,k); d.y=lerp(sy,E.y,k); d.z=lerp(sz,E.z,k); d.dir.set(E.x-sx,E.y-sy,E.z-sz); yield wait(.03); }
    const x=E.x, y=E.y, z=E.z; impactFrame([[1,3],[2,3],[3,2]]); shake(1.1); FX.hitstop=.12; Sound.sfx('slam'); Sound.sfx('crossboom');
    FX.burst(x,y,z,70,0xffffff,10,.4,false); FX.burst(x,y,z,60,0xff3a1a,9,.35); for(let i=0;i<3;i++) FX.ring(x,groundY(x,z)+.1,z,i?'#ffffff':'#ff3a2a',2.5+i*1.5,.4+i*.1);
    Game.dmgNums.push({x,y,z,n:'DRILL DESTROYED',t:0,big:true,col:'#ffd45a'});
    E.dead=1; scene.remove(E.g); C.drill=null; d.dead=1; scene.remove(d.g); d=null; try{ fxLights[1].intensity=0; }catch(err){}
    if(!C.dead) impGo(C,'fizzle'); yield wait(.4);
  } finally { if(d){ d.dead=1; scene.remove(d.g); } C.held=0; P.cineFly=false; P.cineAnim=null; P.inv=.8; P.vy=-2; } }
// both clones out: your drill splits in two; one breaks the drill clone's drill, the other meets the rush clone's own drill (he drills back)
function* impDrillBoth(DC,FC){ const P=Player, gy=P.y, pin=typeof drPin==='function'?drPin():null; let d=null, a=null, b=null, e=null; DC.held=1;
  try{ P.sp=0; P.inv=99; P.atk=null; P.charge=0; P.vx=P.vz=0; P.cineFly=true; P.cineAnim='jump'; Sound.sfx('djump'); impGo(FC,'drill'); if(FC.fb) FC.fb.dead=true;
    if(FC.al) twBark('gooali',"Oh, you're doing the drill? I'm doing the drill.",true); else twBark('gooshayan',"Oh, you're doing the drill? I'm doing the drill.",true);
    yield tween(P,{y:gy+2},.3,t=>1-Math.pow(1-t,3)); P.cineAnim='charge';
    d=makeDrill(); d.x=P.x; d.y=gy+5.2; d.z=P.z; d.s=.1; d.spin=20; d.fire=.6; d.dir.set(0,-1,0);
    e=makeDrill(); e.x=FC.x; e.y=FC.gy+5.2; e.z=FC.z; e.s=.1; e.spin=10; e.fire=.4; e.dir.set(0,-1,0); Sound.sfx('charge');
    for(let w=0;w<1;w+=.08){ d.s=.1+w*.8; d.spin=20+w*50; d.fire=.6+w*1.6; e.s=.1+w*.55; e.spin=10+w*40; FC.y=lerp(FC.y,FC.gy+2,.25); yield wait(.04); }
    // the split
    const sx=d.x, sy=d.y, sz=d.z; d.dead=1; scene.remove(d.g); d=null; Sound.sfx('crossboom'); shake(.6); FX.burst(sx,sy,sz,50,0xff4a1a,8,.35); FX.burst(sx,sy,sz,30,0xffd060,8,.25);
    Game.dmgNums.push({x:sx,y:sy+.6,z:sz,n:'DRILL SPLIT!',t:0,big:true,col:'#ffd45a'});
    a=makeDrill(); b=makeDrill(); for(const [q,o] of [[a,-1],[b,1]]){ q.x=sx+o*.9; q.y=sy; q.z=sz; q.s=.6; q.spin=60; q.fire=2; q.gold=1.02; }
    const E=DC.drill&&!DC.drill.dead?DC.drill:null, mx=(sx+e.x)/2, my=Math.max(sy,e.y)+.4, mz=(sz+e.z)/2; e.dir.set(mx-e.x,my-e.y,mz-e.z); e.spin=55; e.fire=2.2;
    Sound.sfx('beam'); yield wait(.15);
    const a0=[a.x,a.y,a.z], b0=[b.x,b.y,b.z], e0=[e.x,e.y,e.z];
    for(let u=0;u<=1.001;u+=.125){ const k=u*u;
      if(E){ a.x=lerp(a0[0],E.x,k); a.y=lerp(a0[1],E.y,k); a.z=lerp(a0[2],E.z,k); a.dir.set(E.x-a0[0],E.y-a0[1],E.z-a0[2]); }
      b.x=lerp(b0[0],mx,k*.92); b.y=lerp(b0[1],my,k*.92); b.z=lerp(b0[2],mz,k*.92); b.dir.set(mx-b0[0],my-b0[1],mz-b0[2]); e.x=lerp(e0[0],mx,k*.92); e.y=lerp(e0[1],my,k*.92); e.z=lerp(e0[2],mz,k*.92); yield wait(.03); }
    impactFrame([[1,3],[2,3],[3,2]]); shake(1.3); FX.hitstop=.14; Sound.sfx('slam'); Sound.sfx('crossboom');
    if(E){ const x=E.x, y=E.y, z=E.z; FX.burst(x,y,z,70,0xffffff,10,.4,false); FX.burst(x,y,z,50,0xff3a1a,9,.35); FX.ring(x,groundY(x,z)+.1,z,'#ff3a2a',3,.4); Game.dmgNums.push({x,y,z,n:'DRILL DESTROYED',t:0,big:true,col:'#ffd45a'});
      E.dead=1; scene.remove(E.g); DC.drill=null; if(!DC.dead) impGo(DC,'fizzle'); }
    FX.burst(mx,my,mz,70,0xffffff,10,.4,false); FX.burst(mx,my,mz,50,0xff3a1a,9,.35); FX.ring(mx,groundY(mx,mz)+.1,mz,'#ffffff',3.5,.45); Game.dmgNums.push({x:mx,y:my,z:mz,n:'DRILL CANCELLED',t:0,big:true,col:'#ffffff'});
    for(const q of [a,b,e]){ q.dead=1; scene.remove(q.g); } a=b=e=null; try{ fxLights[1].intensity=0; }catch(err){}
    yield wait(.45);
  } finally { for(const q of [d,a,b,e]) if(q){ q.dead=1; scene.remove(q.g); } DC.held=0; P.cineFly=false; P.cineAnim=null; P.inv=.8; P.vy=-2; if(pin) pin.dead=1; if(!FC.dead&&FC.st==='drill'){ FC.y=FC.gy; impGo(FC,'charge'); } } }
// ---------- over their heads: the drill clone's chant (under his drill) and how far along it is, the spaz's health bar ----------
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ if(Game.state!=='play') return;
    for(const C of IMP.extra){ if(C.dead||!C.emerge) continue; const q=toScreen(C.x,C.y+(C.kind==='drill'?2.6:2.15),C.z); /* the drill clone's chant sits under his drill; the spaz's bar right on top of his head */ if(!(q[2]<1)) continue;
      if(C.kind==='drill'&&C.st==='chant'){ const k=C.chantK||0, i=Math.min(3,Math.floor(k*4)), ph=PHRASES[i], sub=(k*4-i), shown=ph.slice(0,Math.max(1,Math.ceil(ph.length*Math.min(1,sub*1.6))));
        D.save(); D.font=`900 18px ${FB}`; D.textAlign='center'; D.lineWidth=4; D.strokeStyle='#1a0408'; D.strokeText(shown,q[0],q[1]); D.fillStyle=i===3?'#ffd45a':'#ff6a4a'; D.fillText(shown,q[0],q[1]); D.restore();
        D.fillStyle='rgba(0,0,0,.6)'; D.fillRect(q[0]-50,q[1]+8,100,7); D.fillStyle='#ff4a2a'; D.fillRect(q[0]-49,q[1]+9,Math.max(0,98*k),5); }
      if(C.kind==='spaz'){ const k=Math.max(0,C.hp/IMPX.spazHp); C.hpShow=C.hpShow==null?k:lerp(C.hpShow,k,.2); const w=64, x=Math.round(q[0]-w/2), y=Math.round(q[1]);
        D.fillStyle='#0a140c'; D.fillRect(x-2,y-2,w+4,12); D.fillStyle='#173a20'; D.fillRect(x,y,w,8); D.fillStyle='#d8ffd8'; D.fillRect(x,y,Math.round(w*C.hpShow),8); D.fillStyle='#3ad35a'; D.fillRect(x,y,Math.round(w*k),8); D.fillStyle='rgba(255,255,255,.35)'; D.fillRect(x,y,Math.round(w*k),2); } } }catch(e){ console.error('goo clone ui',e); } }; })();
