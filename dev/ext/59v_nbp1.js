// =====================================================================
// NATHAN, PHASE I (Ali's road, the third-person fight of 59t_tps): a real fight on top of the training dummy.
// Three phases are planned; only phase I exists: at 0 HP he stops dead and the fight goes no further (NP1.done).
// Colour language: a RED flash = parry it (attack just before it lands) or dodge it (blink); a BLUE flash = a grab,
// only a blink timed at the last moment beats it (a perfect dodge, and attacking during it is a dodge counter).
//   combo    Assault Boost combo: 3-4 slashes, each after 1-2 quickboosts around you; parry them all = stagger
//   bits     Funnel Snipe: bits hang in the sky around you; each shines red, then its laser is instant
//   cage     Funnel Cage: six bits ring you and fire in a quick rhythm; parry all six = they burst and he staggers
//   meteor   Meteor Rush (the auto-parry combo): from far up in the sky, 12 fast zig-zag quickboosts down to you, then a
//            DEEP RED strike; parry it and Ali rides out five clashes in ~2s (np1Auto5), the 5th shoving him back
//   grab     Grapple Lock (BLUE): zig-zags in, the hand goes up with the flash; blink on the parry beat = perfect dodge
// Getsugas fly until they reach him (infinite range), aimed by the lock-on; Ali's sword hurts him here.
// =====================================================================
const NP1={live:0,done:0,hp:350,max:350,lunge:0,pdPending:0,gen:null,wait:0,cd:2.2,last:null,order:null,stunT:0,objs:[],seq:null,cam:null,
  blinkT:-9,grabLand:0,alt:null,pdT:-9,pdFrom:-9,pdDone:0,sat0:null,ts0:null,pdFx:null,hint:null,seen:{},dt:1/60,bar:0};
// one beat for every red slash and blue grab: the flash, then it lands NP1_TELL later; a parry (red) or a blink (blue) counts
// inside the last NP1_WIN of that (the melee parry window)
const NP1_TELL=.45, NP1_WIN=.3;
const NP1_POOL=['combo','combo','meteor','bits','cage','grab','grab'];
const NP1_FIRST=['combo','bits','grab','meteor','cage'];
function np1On(){ return typeof tpsFight==='function'&&tpsFight()&&NP1.live; }
function np1Reset(){ np1Clear(); Object.assign(NP1,{live:0,done:0,hp:NP1.max,gen:null,wait:0,cd:2.2,last:null,order:null,stunT:0,seq:null,cam:null,pdT:-9,pdFrom:-9,hint:null,bar:0}); }
function np1Start(){ np1Clear(); Object.assign(NP1,{live:1,done:0,hp:NP1.max,gen:null,wait:0,cd:2.2,last:null,order:NP1_FIRST.slice(),stunT:0,seq:null,cam:null,pdT:-9,hint:null});
  if(NB){ NB.barShow=0; NB.hov=1.4; NB.stunned=0; } }
function np1Clear(){ for(const o of NP1.objs){ try{ o.kill&&o.kill(); }catch(e){} } NP1.objs.length=0; try{ if(typeof NBC!=='undefined'&&NBC) endNBClash(); }catch(e){}
  const P=Player; if(P&&NP1.seq){ P.cineFly=false; P.cineAnim=null; P.inv=Math.min(P.inv,1); } NP1.seq=null; NP1.cam=null; NP1.lunge=0; NP1.pdPending=0; NP1.pdDone=0; NP1.alt=null; np1PdLook(false); if(typeof TPS!=='undefined') TPS.fast=null; if(typeof NBS!=='undefined') NBS.fixRow=null; if(NB){ NB.stunned=0; NB.hov=1.4; if(NB.mesh) NB.mesh.visible=true; } Game.letterTo=0; }
function np1Obj(o){ NP1.objs.push(o); return o; }
function np1Hint(key,text){ if(NP1.seen[key]) return; NP1.seen[key]=1; NP1.hint={text,t:0,dur:2.6}; }
function np1Dir(){ const P=Player, dx=P.x-NB.x, dz=P.z-NB.z, d=Math.hypot(dx,dz)||1; return [dx/d,dz/d,d]; }
// a glint: a bright star that pops and fades (red = parry/dodge, blue = grab, white = cinematic)
function np1Glint(x,y,z,col,s){ if(col===0xff2a3a||col===0xc0001c) NP1.redEnd=Game.time+NP1_TELL+.12; /* a red strike is on its way: presses are parries */ const g=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:col,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); g.userData.temp=1; scene.add(g);
  const st=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xffffff,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); st.userData.temp=1; scene.add(st); const k={t:0}; s=s||3;
  np1Obj({upd(dt){ k.t+=dt; const u=k.t/.42, a=Math.max(0,1-u); g.position.set(x,y,z); st.position.set(x,y,z); g.scale.set(s*(1+u)*1.6,s*(1+u)*.35,1); st.scale.setScalar(s*.7*a+.01); g.material.opacity=a; st.material.opacity=a; return u<1; },
    kill(){ scene.remove(g); scene.remove(st); }}); Sound.sfx('ting'); }
// a laser: a coloured beam with a white core, from a to b, fading out
function np1Beam(ax,ay,az,bx,by,bz,col,w,life){ const m1=beamMesh(col,w), m2=beamMesh(0xffffff,w*.4); for(const m of [m1,m2]){ m.userData.temp=1; m.position.set(ax,ay,az); m.lookAt(bx,by,bz+1e-4); m.scale.set(1,1,Math.max(.01,Math.hypot(bx-ax,by-ay,bz-az))); }
  const k={t:0}; np1Obj({upd(dt){ k.t+=dt; const a=Math.max(0,1-k.t/life); for(const m of [m1,m2]){ m.scale.x=m.scale.y=Math.max(.01,a); } return k.t<life; }, kill(){ scene.remove(m1); scene.remove(m2); }}); }
// staggered: he hangs there, open, and takes 1.5x
function np1Stun(t,why){ NP1.gen=null; NP1.stunT=Math.max(NP1.stunT,t); NB.stunned=1; NB.dsh=null; Sound.sfx('glass'); shake(.4); FX.burst(NB.x,NB.y+2.2,NB.z,30,0x9ff8ff,6,.35);
  Game.dmgNums.push({x:NB.x,y:NB.y+4.4,z:NB.z,n:why||'STAGGERED',t:0,big:true,col:'#9ff8ff'}); for(const o of NP1.objs) if(o.bit&&!o.dead){ try{ o.kill(); }catch(e){} o.dead=1; } NB.mesh.visible=true; Game.letterTo=0; }
// the player's hit test: red attacks are parryable (melee rules, the silver slash shows at the contact point near you)
// the tell: a big glint on him, a light edge flash in its colour, its own sound (red: a sharp falling ping; blue: a rising chime)
function np1Tell(red){ if(red==='deep'){ /* the meteor's: Shayan's charged-fireball crimson, heavier and lower */ np1Glint(NB.x,NB.y+2.9,NB.z,0xc0001c,5.2); np1Glint(NB.x,NB.y+2.9,NB.z,0x5a0008,3.4);
    FX.flash=Math.max(FX.flash,.28); grade.uniforms.flashCol.value.set(.6,0,.08); FX.ring(NB.x,groundY(NB.x,NB.z)+.1,NB.z,'#8a0014',3,NP1_TELL); FX.burst(NB.x,NB.y+2.6,NB.z,26,0x8a0014,5,.4);
    Sound.tone('sawtooth',320,80,.35,.12); Sound.tone('square',1100,500,.15,.06); shake(.2); return; }
  const col=red?0xff2a3a:0x3a8aff; np1Glint(NB.x,NB.y+2.9,NB.z,col,red?4:4.8); FX.flash=Math.max(FX.flash,.16); grade.uniforms.flashCol.value.set(red?1:.3,red?.25:.55,red?.3:1);
  FX.ring(NB.x,groundY(NB.x,NB.z)+.1,NB.z,red?'#ff2a3a':'#3a8aff',2.4,NP1_TELL); if(red) Sound.tone('square',1500,600,.14,.07); else { Sound.tone('sine',420,1500,.32,.12); Sound.tone('triangle',840,2400,.28,.06); } }
function np1HitRed(dmg,fx,fz,onParry){ const P=Player, dx=fx-P.x, dz=fz-P.z, d=Math.hypot(dx,dz)||1; return twHitP(dmg,P.x+dx/d*1.2,P.z+dz/d*1.2,{melee:true,win:NP1_WIN,onParry}); }
// ---------- moves ----------
const NP1M={
  // Assault Boost combo: around you, around you, in, SLASH; parry every slash and he staggers
  *combo(){ const n=Math.random()<.5?3:4; let par=0; if(Math.random()<.5) twBark('nathan',"Assault boost. Try to keep up.",true);
    np1Hint('red','RED flash: parry ('+K('attack')+') just before it lands, or blink ('+K('dash')+')');
    for(let i=0;i<n;i++){ const hops=1+(Math.random()<.5?1:0);
      for(let h=0;h<hops;h++){ const P=Player, a=Math.atan2(NB.z-P.z,NB.x-P.x)+(h%2?1:-1)*rnd(.9,1.6)*(i%2?1:-1), r=rnd(4.5,6.5); nbBoost(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r); yield .16; }
      // the last boost in carries the tell: the red flash, then the slash lands NP1_TELL later (the trail peaks on it)
      { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*1.7,P.z-dz*1.7); } np1Tell(true); if(typeof nbsSlash==='function') nbsSlash(NP1_TELL*2,0); yield NP1_TELL;
      Sound.sfx('swing'); const P=Player, [dx,dz,d]=np1Dir();
      if(d<3.4){ const r=np1HitRed(2,NB.x,NB.z,()=>{ par++; FX.burst(NB.x,NB.y+2,NB.z,12,0xffffff,4,.2); }); if(r==='parry'){ nbBoost(NB.x-dx*2.2,NB.z-dz*2.2); } }
      yield .22; }
    if(par>=n){ np1Stun(2.6,'FULL PARRY'); return; } yield .3; },
  // Funnel Snipe: bits in the sky; each shines red, then fires at once
  *bits(){ const P=Player, n=5, bs=[]; twBark('nathan',"Funnels. Look up, wanderer.",true); Sound.sfx('charge'); np1Hint('red','RED flash: parry ('+K('attack')+' as it lands) or blink ('+K('dash')+')');
    for(let i=0;i<n;i++){ const a=rnd(0,6.28), r=rnd(5,9), b=nbBit(NB.x,NB.y+2,NB.z); b.tx=P.x+Math.cos(a)*r; b.tz=P.z+Math.sin(a)*r; b.ty=groundY(b.tx,b.tz)+rnd(4,7); b.ph=rnd(0,6.28); bs.push(b);
      np1Obj({bit:1,upd(dt){ if(b.gone) return false; b.x=lerp(b.x,b.tx+Math.sin(Game.time*1.3+b.ph)*.6,Math.min(1,dt*4)); b.y=lerp(b.y,b.ty+Math.sin(Game.time*2+b.ph)*.3,Math.min(1,dt*4)); b.z=lerp(b.z,b.tz,Math.min(1,dt*4)); b.m.position.set(b.x,b.y,b.z); b.m.lookAt(Player.x,Player.y+1,Player.z); return true; }, kill(){ if(!b.gone){ b.gone=1; nbKillBit(b); } }}); }
    yield 1;
    for(let k=0;k<6;k++){ const live=bs.filter(b=>!b.gone); if(!live.length) break; const b=live[Math.floor(Math.random()*live.length)];
      b.m.children.forEach(c=>c.material.color.setHex(0xff2a3a)); np1Glint(b.x,b.y,b.z,0xff2a3a,2.4); yield .45;
      if(b.gone) continue; const P2=Player, ty=P2.y+1; np1Beam(b.x,b.y,b.z,P2.x+(P2.x-b.x)*.6,ty+(ty-b.y)*.6,P2.z+(P2.z-b.z)*.6,0xff2a3a,.14,.22); Sound.sfx('mechshot');
      const r=np1HitRed(2,b.x,b.z); if(r==='parry'){ b.gone=1; nbKillBit(b); Game.dmgNums.push({x:P2.x,y:P2.y+3,z:P2.z,n:'BIT DOWN',t:0,col:'#ff8a9a'}); }
      else b.m.children.forEach(c=>c.material.color.setHex(0x9ff8ff));
      yield Math.random()<.35?.2:.55; }
    for(const b of bs) if(!b.gone){ b.gone=1; nbKillBit(b); } yield .4; },
  // Funnel Cage: six bits ring you and fire in rhythm; parry all six and they burst
  *cage(){ const P=Player, n=6, a0=rnd(0,6.28), bs=[]; let par=0; twBark('nathan',"Six funnels. Six chances to fail.",true); Sound.sfx('charge');
    for(let i=0;i<n;i++){ const a=a0+i*6.283/n, b=nbBit(NB.x,NB.y+2,NB.z); b.a=a; bs.push(b);
      np1Obj({bit:1,upd(dt){ if(b.gone) return false; const P2=Player, tx=P2.x+Math.cos(b.a)*5, tz=P2.z+Math.sin(b.a)*5, ty=P2.y+2.2; b.x=lerp(b.x,tx,Math.min(1,dt*6)); b.y=lerp(b.y,ty,Math.min(1,dt*6)); b.z=lerp(b.z,tz,Math.min(1,dt*6)); b.a+=dt*.5; b.m.position.set(b.x,b.y,b.z); b.m.lookAt(P2.x,P2.y+1,P2.z); return true; }, kill(){ if(!b.gone){ b.gone=1; nbKillBit(b); } }}); }
    yield 1.1;
    for(let i=0;i<n;i++){ const b=bs[i]; if(b.gone) continue; b.m.children.forEach(c=>c.material.color.setHex(0xff2a3a)); np1Glint(b.x,b.y,b.z,0xff2a3a,2.2); yield .32;
      if(b.gone) continue; const P2=Player; np1Beam(b.x,b.y,b.z,P2.x,P2.y+1,P2.z,0xff2a3a,.12,.18); Sound.sfx('mechshot');
      if(np1HitRed(1,b.x,b.z)==='parry'){ par++; b.gone=1; nbKillBit(b); } yield .12; }
    for(const b of bs) if(!b.gone){ b.gone=1; nbKillBit(b); }
    if(par>=n){ np1Stun(2.2,'CAGE BROKEN'); return; } yield .4; },
  // Meteor Rush (the auto-parry combo): up and far away, then 12 fast zig-zag quickboosts down to you; the DEEP RED flash on
  // arrival, the strike NP1_TELL later. Parry it and np1Auto5 takes over (five clashes, the 5th shoves Ali back)
  *meteor(){ const P=Player; twBark('nathan',"Meteor drive. Catch me if you can.",true); np1Hint('meteor','DEEP RED: parry it and ride out the whole flurry');
    const a0=Math.atan2(NB.z-P.z,NB.x-P.x)+rnd(-.5,.5), sx=P.x+Math.cos(a0)*24, sz=P.z+Math.sin(a0)*24, sy=groundY(sx,sz)+11;
    FX.burst(NB.x,NB.y+2,NB.z,24,0x9ff8ff,6,.3); Sound.sfx('qbRoar'); NB.dsh=null; NB.x=sx; NB.z=sz; NP1.alt=sy; yield .5;
    const N=12, side=Math.random()<.5?1:-1;
    for(let i=1;i<=N;i++){ const P2=Player, k=i/N, ux=Math.cos(a0), uz=Math.sin(a0), r=lerp(24,2,k), off=i<N?side*(i%2?1:-1)*3.2*(1-k*.6):0;
      const tx=P2.x+ux*r-uz*off, tz=P2.z+uz*r+ux*off, ty=lerp(sy,groundY(tx,tz)+1.4,k*k), fx=NB.x, fz=NB.z, fy=NP1.alt;
      if(typeof NBS!=='undefined'){ NBS.boostT=.2; NBS.bdir=Math.atan2(tz-fz,tx-fx); } Sound.sfx(i%3?'quickboost':'qbRoar'); nbAfterimage(NB.x,NB.y,NB.z);
      for(let t=0;t<.085;){ t+=NP1.dt; const u=Math.min(1,t/.085); NB.x=lerp(fx,tx,u); NB.z=lerp(fz,tz,u); NP1.alt=lerp(fy,ty,u); if(Math.random()<.8) FX.spawn(NB.x,NP1.alt+rnd(.5,3),NB.z,0,0,0,.3,0x3ff4ff,.4,0,true); yield NP1.dt; } }
    NP1.alt=null; np1Tell('deep'); if(typeof nbsSlash==='function') nbsSlash(NP1_TELL*2,0); yield NP1_TELL;
    Sound.sfx('swing'); const [ex,ez,d]=np1Dir();
    if(d<3.6&&np1HitRed(3,NB.x,NB.z)==='parry'){ np1Auto5(); yield .1; return; }
    nbBoost(NB.x-ex*4,NB.z-ez*4); yield .6; },
  // Grapple Lock: BLUE. He locks on hard and boosts in; a blink at the last moment is a perfect dodge
  // Grapple Lock (BLUE): he zig-zags in on quickboosts; on the last one he raises his hand with the blue flash, and the grab
  // lands NP1_TELL later, the same beat as a red slash: blink inside the last NP1_WIN of it (where you'd parry a red one)
  *grab(){ twBark('nathan',"Got you.",true); np1Hint('blue','BLUE flash: blink ('+K('dash')+') just before he grabs (same timing as a parry)');
    const hops=2+(Math.random()<.5?1:0), side=Math.random()<.5?1:-1;
    for(let i=0;i<hops;i++){ const P=Player, [dx,dz,d]=np1Dir(), last=i===hops-1, dd=last?2:Math.max(3.4,d*(1-(i+1)/(hops+.5))), off=last?0:side*(i%2?-1:1)*rnd(2,3);
      nbBoost(P.x-dx*dd-dz*off,P.z-dz*dd+dx*off);
      if(last){ np1Tell(false); if(typeof NBS!=='undefined') NBS.fixRow=4; /* the hand raised */ NP1.grabLand=Game.time+NP1_TELL; NP1.lunge=1; NP1.pdDone=0; }
      else yield .22; }
    while(Game.time<NP1.grabLand&&!NP1.pdDone) yield NP1.dt;
    if(NP1.pdDone){ NP1.lunge=0; NP1.pdDone=0; if(typeof NBS!=='undefined') NBS.fixRow=null; yield .5; return; } /* the perfect dodge carries him on past you */
    NP1.lunge=0; if(typeof NBS!=='undefined'){ NBS.fixRow=null; nbsSlash(.45,.45); }
    const P=Player, [dx,dz,d]=np1Dir();
    if(d<3.6&&P.inv<=0&&!P.cineFly){ nbAfterimage(NB.x,NB.y,NB.z); NB.x=P.x-dx*.9; NB.z=P.z-dz*.9; NB.dsh=null; Sound.sfx('quickboost'); np1Grabbed(); yield 1.2; return; }
    // out of reach (you blinked early and got away): he lunges through empty air
    nbBoost(NB.x+dx*3.5,NB.z+dz*3.5); Game.dmgNums.push({x:NB.x,y:NB.y+4,z:NB.z,n:'MISS',t:0,col:'#9fd0ff'}); yield .7; } };
// ---------- the perfect dodge and the dodge counter ----------
// the perfect dodge (ZZZ-style): a blink while his lunge is about to land becomes a short visible dodge slide with blue
// afterimages; the world drops into heavy slow motion (desaturated, blue-tinted, the lens widening) while he sails past;
// a COUNTER prompt holds for ~1s: attack = the dodge counter, otherwise time snaps back. ux,uz = the slide direction
function np1PdLook(on){ try{ const g=grade.uniforms; if(on){ if(NP1.sat0==null&&g.sat) NP1.sat0=g.sat.value; if(g.sat) g.sat.value=.3; if(NP1.ts0==null) NP1.ts0=Game.timeScale||1; Game.timeScale=.4; }
    else { if(NP1.sat0!=null){ if(g.sat) g.sat.value=NP1.sat0; NP1.sat0=null; } if(NP1.ts0!=null){ Game.timeScale=NP1.ts0; NP1.ts0=null; } NP1.pdFx=null; if(typeof TPS!=='undefined'&&TPS.on){ camera.fov=TPS.FOV; camera.updateProjectionMatrix(); } } }catch(e){} }
// the perfect dodge (ZZZ-style): a long snappy dash with a blue afterimage trail and a big silhouette left behind, the lens
// punching wide, speed lines rushing in, then the world near-frozen (0.12x, desaturated, blue vignette) while he sails past;
// COUNTER holds ~1s: attack = the dodge counter, otherwise time snaps back with a reverse whoosh. ux,uz = the dash direction
function np1PerfectDodge(ux,uz){ const P=Player, l=Math.hypot(ux,uz)||1; ux/=l; uz/=l; NP1.pdDone=1; NP1.lunge=0; NP1.pdPending=0;
  const [nx,nz]=np1Dir(); let D=5.5, ex=P.x+ux*D, ez=P.z+uz*D; for(;D>1&&Math.abs(groundY(ex,ez)-P.y)>2;D-=.5){ ex=P.x+ux*D; ez=P.z+uz*D; }
  NP1.seq={k:'pdodge',t:0,sx:P.x,sz:P.z,ex,ez,gt:0,nx,nz}; /* he carries on through where you were */ P.cineFly=true; P.cineAnim='run'; P.aliAtk=null; P.vx=P.vz=0; P.inv=99; P.ang=Math.atan2(uz,ux);
  Game.slowT=1.1; np1PdLook(true); shake(.35); FX.flash=.45; grade.uniforms.flashCol.value.set(.45,.7,1);
  Sound.tone('sine',2400,3800,.25,.14); Sound.tone('triangle',1200,1900,.22,.1); Sound.sfx('whoosh'); Sound.sfx('dash'); Sound.tone('sine',120,38,.4,.28); Sound.hiss(2600,.4,.14,'bandpass'); /* shing, whoosh, thump */
  try{ const g=aliGhost(P.x,P.y,P.z); if(g&&g.mesh){ g.mesh.material.color.setHex(0x6ab8ff); g.mesh.scale.multiplyScalar(1.25); } }catch(e){} /* the silhouette left where you stood */
  FX.burst(P.x,P.y+1,P.z,46,0x3a8aff,7,.45); FX.burst(P.x,P.y+1,P.z,22,0xffffff,5,.3); FX.ring(P.x,P.y+.1,P.z,'#6ab8ff',3,.35);
  const L=[]; for(let i=0;i<46;i++) L.push({a:rnd(0,6.283),r:rnd(.55,1),w:rnd(1,3.5),sp:rnd(.8,1.4)}); NP1.pdFx={t:0,L};
  Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'PERFECT DODGE',t:0,big:true,col:'#8fc4ff'}); }
function np1PdUpd(S,rdt,wdt){ const P=Player; /* rdt: real time (Ali's dash, the window), wdt: world time (near-frozen) */
  const u=Math.min(1,S.t/.26), e=u>=1?1:1-Math.pow(2,-10*u); P.x=lerp(S.sx,S.ex,e); P.z=lerp(S.sz,S.ez,e); P.y=groundY(P.x,P.z)+Math.sin(u*Math.PI)*.3;
  P.cineAnim=u<1?'run':'idle'; /* a dash on his run cycle (side-on in the third-person view), not a teleport pose */ if(typeof TPS!=='undefined'&&TPS.f) P.f=TPS.f; /* the afterimages face the same way he runs */ S.gt-=rdt; if(u<1&&S.gt<=0){ S.gt=.016; try{ const g=aliGhost(P.x,P.y,P.z); if(g&&g.mesh) g.mesh.material.color.setHex(Math.random()<.5?0x3a8aff:0x8fd0ff); }catch(e){} }
  if(u<1){ for(let i=0;i<3;i++) FX.spawn(P.x+rnd(-.2,.2),P.y+rnd(.3,1.3),P.z+rnd(-.2,.2),0,0,0,.25,0x8fd3ff,.3,0,true); } /* Shayan's dash streak */
  if(u<1) for(let i=0;i<4;i++) FX.spawn(P.x+rnd(-.4,.4),P.y+rnd(.2,2),P.z+rnd(-.4,.4),(S.sx-S.ex)*rnd(1,3),rnd(-.3,.6),(S.sz-S.ez)*rnd(1,3),.4,i%2?0x3a8aff:0xffffff,.3,0,true);
  else if(Math.random()<.6) FX.spawn(P.x+rnd(-.6,.6),P.y+rnd(.2,2.2),P.z+rnd(-.6,.6),0,rnd(.3,1),0,.6,0x6ab8ff,.22,0,true);
  // the lens: punches wide on the dash, settles a little wide through the slow-mo
  try{ if(typeof TPS!=='undefined'&&TPS.on){ camera.fov=S.t<.1?TPS.FOV+16*(S.t/.1):TPS.FOV+6+10*Math.exp(-(S.t-.1)*7); camera.updateProjectionMatrix(); } }catch(e){}
  if(NP1.pdFx) NP1.pdFx.t=S.t;
  // he sails on past, near-frozen
  if(S.t<1.1){ NB.x+=S.nx*26*wdt; NB.z+=S.nz*26*wdt; } if(typeof NBS!=='undefined'){ NBS.boostT=Math.max(NBS.boostT,.1); NBS.bdir=Math.atan2(S.nz,S.nx); }
  // the counter window
  if(S.t>.1&&S.t<1.1&&consume('attack')){ np1PdLook(false); np1Counter(); return; }
  if(S.t>=1.1){ NP1.seq=null; np1PdLook(false); Game.slowT=0; P.cineFly=false; P.cineAnim=null; P.inv=.35; Sound.hiss(1800,.3,.12,'bandpass'); Sound.tone('sine',90,420,.25,.12); /* time snaps back */ } }
// the counter: Ali zips past him, the camera snaps round to face Ali (Nathan behind him), judgement cuts rain on Nathan; 1.6s
function np1Counter(){ const P=Player, [dx,dz]=np1Dir(), fx=-dx, fz=-dz; /* from Ali through Nathan */
  P.aliAtk=null; P.cineFly=true; P.cineAnim='dash'; P.inv=99; P.vx=P.vz=0; Game.slowT=0; NP1.pdT=-9; NP1.gen=null; NB.dsh=null;
  NP1.seq={k:'counter',t:0,sx:P.x,sz:P.z,ex:NB.x+fx*3.4,ez:NB.z+fz*3.4,fx,fz,cuts:0}; Sound.sfx('dash'); Sound.sfx('whoosh'); FX.flash=.3; grade.uniforms.flashCol.value.set(1,.2,.3); }
function np1SeqUpd(dt){ const S=NP1.seq, P=Player; if(S.k==='fc'){ S.t+=dt; np1FcUpd(S,dt); return; } if(S.k==='auto5'){ S.t+=dt; np1Auto5Upd(S,dt); return; } if(S.k==='pdodge'){ const rdt=Math.min(.05,dt/((Game.slowT>0?.3:1)*(Game.timeScale||1))); S.t+=rdt; np1PdUpd(S,rdt,dt); return; } S.t+=dt;
  if(S.k==='counter'){ const u=Math.min(1,S.t/.14); P.x=lerp(S.sx,S.ex,u); P.z=lerp(S.sz,S.ez,u); P.y=groundY(P.x,P.z); P.ang=Math.atan2(S.fz,S.fx);
    if(u<1){ if(Math.random()<.9) FX.spawn(P.x,P.y+rnd(.3,1.6),P.z,0,0,0,.25,Math.random()<.5?0xff2a3a:0x3a8aff,.4,0,true); return; }
    if(!S.snap){ S.snap=1; P.cineAnim='aliIai'; NB.stunned=1; NP1.cam={x:P.x+S.fx*4.6,y:P.y+1.7,z:P.z+S.fz*4.6,lx:P.x,ly:P.y+1.4,lz:P.z}; Sound.sfx('secret'); }
    // judgement cuts across Nathan, one every .07s
    while(S.cuts<12&&S.t>.2+S.cuts*.07){ S.cuts++; const q=toScreen(NB.x,NB.y+2.2,NB.z), a=rnd(0,Math.PI), L0=rnd(220,420), mx=q[0]+rnd(-60,60), my=q[1]+rnd(-80,60);
      JC.lines.push({x0:mx-Math.cos(a)*L0/2,y0:my-Math.sin(a)*L0/2,x1:mx+Math.cos(a)*L0/2,y1:my+Math.sin(a)*L0/2,t:0}); if(JC.lines.length>16) JC.lines.shift();
      Sound.sfx(S.cuts%2?'swing':'hit'); FX.spark(NB.x+rnd(-.7,.7),NB.y+rnd(1,3.2),NB.z); shake(.08); nbDamage(1.6,false); if(NP1.done) break; }
    if(!S.boom&&S.t>1.1){ S.boom=1; JC.flash=1; impactFrame([[3,2],[1,1]]); Sound.sfx('crossboom'); shake(.7); FX.burst(NB.x,NB.y+2,NB.z,40,0xff2a3a,7,.35); FX.burst(NB.x,NB.y+2,NB.z,20,0x0c0814,5,.4,false); }
    if(S.t>1.6){ NP1.seq=null; NP1.cam=null; P.cineFly=false; P.cineAnim=null; P.inv=.6; if(!NP1.done) np1Stun(1.2,'COUNTERED'); } return; }
  if(S.k==='grab'){ const u=S.t; if(u<.45){ P.x=lerp(P.x,NB.x+S.fx*.6,.3); P.z=lerp(P.z,NB.z+S.fz*.6,.3); P.y=groundY(P.x,P.z)+u*4; }
    else if(u<.6){ P.y=Math.max(groundY(P.x,P.z),P.y-dt*30); }
    else if(!S.slam){ S.slam=1; P.y=groundY(P.x,P.z); Sound.sfx('slam'); shake(.8); FX.burst(P.x,P.y+.3,P.z,30,0x3a8aff,6,.35); FX.ring(P.x,P.y+.1,P.z,'#3a8aff',3,.4); }
    if(u>.75){ NP1.seq=null; P.cineFly=false; P.cineAnim=null; P.inv=0; P.dash=0; hurtPlayer(4,NB.x,NB.z); } } }
// the auto-parry: Ali is locked in place (no move, no dash) and parries five swings in ~2s, swinging his sword-draw cut on
// each; the 5th is a heavy blow: a long hit-stop, then he's shoved back ~5 units with his blade dragging on the ground
// (sparks, dust, a scorch line), or, in the air, thrown back and up in a backflip. Then Nathan is staggered.
const NP1_A5=[0,.3,.56,.8,1.32]; /* clash times (the 1st is the parry that started it) */
function np1Auto5(){ const P=Player, [dx,dz]=np1Dir(), gy=groundY(P.x,P.z); NP1.gen=null;
  NP1.seq={k:'auto5',t:0,n:1,dx,dz,air:P.y>gy+.4,swU:0,lat:0}; P.cineFly=true; P.cineAnim='aliS1'; P.inv=99; P.aliAtk=null; P.vx=P.vz=P.vy=0; Game.slowT=0; FX.hitstop=.05;
  Game.dmgNums.push({x:P.x,y:P.y+3.2,z:P.z,n:'AUTO PARRY',t:0,big:true,col:'#ff6a7a'}); }
function np1Auto5Upd(S,dt){ const P=Player, [ux,uz]=[S.dx,S.dz], T=NP1_A5;
  if(!S.kb){ P.ang=Math.atan2(NB.z-P.z,NB.x-P.x);
    // Nathan in front of Ali, stepping side to side between swings; before the 5th he pulls back and up for the big one
    const big=S.n>=4&&S.t>T[3]+.12, back=big?3.2-Math.max(0,(S.t-(T[4]-.12))/.12)*1.4:1.9, lat=Math.sin(S.n*2.1)*.7;
    NB.dsh=null; NB.x=lerp(NB.x,P.x-ux*back-uz*lat,.35); NB.z=lerp(NB.z,P.z-uz*back+ux*lat,.35); NP1.alt=S.air?P.y-.3+(big?.8:0):(big?groundY(NB.x,NB.z)+2.2:null);
    // Ali's swing for the nearest clash
    let sw=null; for(let i=0;i<5;i++){ const ct=T[i]; if(S.t>=ct-.14&&S.t<=ct+.12) sw=(S.t-(ct-.14))/.26; } S.swU=sw; P.cineAnim=S.n%2?'aliS1':'aliS2';
    while(S.n<5&&S.t>=T[S.n]){ S.n++; Sound.sfx('swing'); if(typeof nbsSlash==='function') nbsSlash(.3,.45);
      if(S.n<5){ twMeleeParry(NB.x,NB.z,{}); FX.hitstop=.05; Game.slowT=0; shake(.25); }
      else { // the 5th: heavy
        twMeleeParry(NB.x,NB.z,{}); FX.hitstop=.22; Game.slowT=0; shake(1.1); FX.flash=.7; grade.uniforms.flashCol.value.set(1,.3,.3); impactFrame([[1,2],[3,2],[2,1]]); Sound.sfx('crossboom'); Sound.sfx('slam');
        FX.burst(lerp(P.x,NB.x,.5),P.y+1.2,lerp(P.z,NB.z,.5),50,0xffffff,8,.35); FX.burst(lerp(P.x,NB.x,.5),P.y+1.2,lerp(P.z,NB.z,.5),30,0xff3a4a,7,.4);
        Game.dmgNums.push({x:P.x,y:P.y+3.4,z:P.z,n:'PARRY ×5',t:0,big:true,col:'#ffffff'}); S.kb={t:0,sx:P.x,sz:P.z,sy:P.y}; P.cineAnim=S.air?'aliBackflip':'aliDrag'; S.swU=null; } }
    return; }
  // the shove: ~5 units straight back (in the air: back and up), easing out
  const K=S.kb; K.t+=dt; const u=Math.min(1,K.t/.55), e=1-Math.pow(1-u,3); P.x=K.sx+ux*5*e; P.z=K.sz+uz*5*e; P.ang=Math.atan2(-uz,-ux);
  if(S.air) P.y=K.sy+2.5*e; else { P.y=groundY(P.x,P.z);
    // the blade drags on the ground at his side: sparks, dust and a scorch line
    if(u<1){ const yaw=typeof TPS!=='undefined'&&TPS.yaw!=null?TPS.yaw:Math.atan2(-uz,-ux), rx=-Math.sin(yaw), rz=Math.cos(yaw), tx=P.x+rx*.75, tz=P.z+rz*.75, ty=groundY(tx,tz)+.05;
      for(let i=0;i<3;i++) FX.spawn(tx,ty+.1,tz,rnd(-1,1)+ux*3,rnd(1,3),rnd(-1,1)+uz*3,rnd(.2,.4),i%2?0xffd27a:0xffffff,.14,6,true);
      if(Math.random()<.5) FX.spawn(tx,ty+.2,tz,ux*2,rnd(.3,1),uz*2,.7,0x8a8070,.4,0,false);
      if(!K.last||Math.hypot(tx-K.last[0],tz-K.last[1])>.25){ const q=new THREE.Mesh(new THREE.PlaneGeometry(.12,.32),new THREE.MeshBasicMaterial({color:0x14100c,transparent:true,opacity:.75,depthWrite:false})); q.userData.temp=1;
        q.rotation.set(-Math.PI/2,0,Math.atan2(ux,uz)); q.position.set(tx,ty,tz); scene.add(q); K.last=[tx,tz]; const g={t:0}; np1Obj({upd(dt){ g.t+=dt; q.material.opacity=.75*Math.max(0,1-g.t/2.5); return g.t<2.5; }, kill(){ scene.remove(q); }}); } } }
  if(u>=1&&K.t>.6){ NP1.seq=null; NP1.alt=null; P.cineFly=false; P.cineAnim=null; P.inv=.6; P.vy=0; nbBoost(NB.x-ux*3,NB.z-uz*3); np1Stun(3,'PARRIED ×5'); } }
function np1Grabbed(){ const P=Player, [dx,dz]=np1Dir(); NP1.seq={k:'grab',t:0,fx:dx,fz:dz}; P.cineFly=true; P.cineAnim='hurt'; P.aliAtk=null; P.vx=P.vz=P.vy=0; P.inv=99;
  Sound.sfx('punch'); Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'GRABBED',t:0,big:true,col:'#8fc4ff'}); twBark('nathan',"Down you go.",true); }
// ---------- the per-frame brain ----------
function np1Update(dt){ const P=Player; NP1.dt=dt; if(!NP1.live) np1Start();
  NB.barShow=0; NP1.bar=Math.min(1,NP1.bar+dt*1.5);
  for(let i=NP1.objs.length-1;i>=0;i--){ const o=NP1.objs[i]; let keep=false; if(!o.dead){ try{ keep=o.upd(dt)!==false; }catch(e){ console.error('np1 obj',e); } } if(!keep){ try{ o.kill&&o.kill(); }catch(e){} NP1.objs.splice(i,1); } }
  if(NP1.seq) np1SeqUpd(dt);
  if(NP1.alt!=null&&NB){ NB.y=NP1.alt; NB.mesh.position.y=NB.y; } /* the meteor's altitude */
  if(NP1.seq) return;
  if(NP1.done||!tpsOn()) return; /* no moves in cutscenes */
  // a perfect dodge: an attack inside its window is a dodge counter
  if(NP1.stunT>0){ NP1.stunT-=dt; if(NP1.stunT<=0){ NB.stunned=0; NP1.cd=.6; } return; }
  if(NP1.gen){ NP1.wait-=dt; while(NP1.gen&&NP1.wait<=0){ const r=NP1.gen.next(); if(r.done){ NP1.gen=null; NP1.cd=rnd(.7,1.2); } else NP1.wait+=r.value; } return; }
  NP1.cd-=dt; const [,,d]=np1Dir();
  if(d>15&&!NB.dsh){ const a=Math.atan2(NB.z-P.z,NB.x-P.x); nbBoost(P.x+Math.cos(a)*rnd(6,8),P.z+Math.sin(a)*rnd(6,8)); NP1.cd=Math.max(NP1.cd,.3); return; }
  if(NP1.cd<=0){ let k=NP1.order&&NP1.order.length?NP1.order.shift():NP1_POOL[Math.floor(Math.random()*NP1_POOL.length)]; if(k===NP1.last) k=NP1_POOL[Math.floor(Math.random()*NP1_POOL.length)];
    NP1.last=k; NP1.gen=NP1M[k](); NP1.wait=0; return; }
  if(!NB.dsh&&Math.random()<dt*.9){ const a=rnd(0,6.28); nbBoost(P.x+Math.cos(a)*rnd(5,8),P.z+Math.sin(a)*rnd(5,8)); } }
function np1Down(){ const P=Player; NP1.done=1; NP1.hp=0; NP1.gen=null; NP1.stunT=0; NB.mesh.visible=true; if(!NP1.seq){ P.cineFly=false; P.cineAnim=null; } for(const o of NP1.objs){ try{ o.kill&&o.kill(); }catch(e){} } NP1.objs.length=0; try{ if(NBC) endNBClash(); }catch(e){}
  NB.stunned=1; NB.dsh=null; NB.hov=.7; Game.letterTo=0; Sound.sfx('crossboom'); shake(1); FX.flash=.6; grade.uniforms.flashCol.value.set(1,1,1); impactFrame([[1,2],[3,2]]);
  twBark('nathan',"Phase one... was the warm-up, wanderer.",true); Game.banner={name:'Phase I cleared',sub:'Phase II is not built yet: the fight stops here',t:0}; }
// ---------- hooks ----------
(function(){ const un=updateNB; updateNB=function(dt){ const r=un.apply(this,arguments); try{ if(tpsFight()) np1Update(dt); }catch(e){ console.error('nathan phase 1',e); } return r; }; })();
// damage: phase I's own HP; staggered he takes 1.5x; the ultimate is scaled down for this phase
(function(){ const nd=nbDamage; nbDamage=function(d,ult){ if(!tpsFight()||!NP1.live) return nd.apply(this,arguments); if(!NB||!NB.alive) return;
    if(NP1.done){ FX.spark(NB.x,NB.y+2,NB.z); return; } if(ult&&ult!=='np1') d*=d>=25?.3:.5; if(NP1.melee) d*=.4; /* ultimates and the mini Judgement Cut are scaled for this phase */ /* his sword is fast at 3x run speed */ if(NP1.stunT>0||NB.stunned) d*=1.5;
    NP1.hp=Math.max(0,NP1.hp-d); NB.flash=.07; FX.spark(NB.x+rnd(-.6,.6),NB.y+rnd(1,3),NB.z+.3); Game.dmgNums.push({x:NB.x,y:NB.y+4,z:NB.z,n:'-'+(Math.round(d*100)/100),t:0,big:!!ult,col:'#9ff8ff'}); addSP(ult?0:.18);
    if(NP1.hp<=0) np1Down(); }; })();
// Ali's sword reaches him here (the base game only lets Shayan's)
(function(){ const mh=meleeHits; meleeHits=function(x,z,y,rad,ang,arc,dmg,set){ let any=mh.apply(this,arguments);
    try{ if(tpsFight()&&NP1.live&&ALI()&&NB&&NB.alive&&!set.has(NB)&&NB.y-y<3.6){ const d=Math.hypot(NB.x-x,NB.z-z); if(d<rad+1.3&&(d<1.6||angDiff(Math.atan2(NB.z-z,NB.x-x),ang)<arc)){ set.add(NB); any=true; NP1.melee=1; try{ nbDamage(dmg); } finally{ NP1.melee=0; } Sound.sfx('hit'); FX.hitstop=Math.max(FX.hitstop,.04); } } }catch(e){ console.error('np1 melee',e); }
    return any; }; })();
// Getsugas: always aimed at him, and they fly until they reach him (life topped up until they pass him)
(function(){ const fb=fireBeam; fireBeam=function(big,quiet,o){ if(tpsFight()&&o&&o.ali&&NB){ const P=Player; P.ang=Math.atan2(NB.z-P.z,NB.x-P.x); } return fb.apply(this,arguments); }; })();
(function(){ const ub=updateBeams; updateBeams=function(dt){ try{ if(tpsFight()&&NB) for(const b of BEAMS){ if(!b.ali||b.hit.has(NB)) continue; b.trav=(b.trav||0)+b.sp*dt; const ahead=(NB.x-b.x)*b.dx+(NB.z-b.z)*b.dz; if(ahead>-1&&b.trav<90) b.life=Math.max(b.life,.5); } }catch(e){ console.error('np1 getsuga',e); } return ub.apply(this,arguments); }; })();
// ---------- Ali's Full Counter in this fight (5 banked parries + attack) ----------
// Every bit on the field is cut down at once, Nathan is pinned where he is (ground or air: he shudders in place), Ali rockets
// to him in NP1_FC.dash from any distance (speed lines, a rising whoosh, red afterimages, the lens punching wide, the camera
// riding right behind him) and lands Shayan's Full Counter on him (the title, the torn crescents, the flash); in the air he
// leaps up to him and drops after the cut. Nathan reels 1.2s after. A press while a red strike is on its way stays a plain
// parry swing (the Full Counter keeps for a free press); never during the perfect dodge, the auto-parry or a grab.
const NP1_FC={dash:.16,hold:.62,dmg:16};
(function(){ const mj=twMiniJC; twMiniJC=function(){ if(!np1On()||!NB||!NB.alive||NP1.done) return mj.apply(this,arguments);
    const P=Player; if(NP1.seq) return;
    if(Game.time<(NP1.redEnd||0)){ if(!P.aliAtk) aliCombo(P.comboT>0?((P.combo||0)+1)%3:0); return; }
    try{ np1FullCounter(); }catch(e){ console.error('np1 full counter',e); } }; })();
function np1FullCounter(){ const P=Player, gy=groundY(NB.x,NB.z), ny=NP1.alt!=null?NP1.alt:NB.y, air=ny>gy+1.2, [dx,dz]=np1Dir();
  P.counter=0; P.aliAtk=null; P.cineFly=true; P.cineAnim='dash'; P.inv=99; P.vx=P.vz=P.vy=0; Game.slowT=0;
  NP1.gen=null; NP1.lunge=0; NP1.redEnd=0; NB.dsh=null; NB.stunned=1; if(typeof NBS!=='undefined'){ NBS.fixRow=null; NBS.slashA=null; NBS.boostT=0; }
  const ex=NB.x+dx*1.7, ez=NB.z+dz*1.7, L=[]; for(let i=0;i<54;i++) L.push({a:rnd(0,6.283),r:rnd(.5,1),w:rnd(1,4),sp:rnd(.8,1.5)});
  NP1.seq={k:'fc',t:0,sx:P.x,sy:P.y,sz:P.z,ex,ez,ey:air?ny:groundY(ex,ez),nx:NB.x,ny,nz:NB.z,air,gt:0,hit:0,hitT:0,swU:null,L}; NP1.alt=ny;
  // every bit on the field, cut down in one stroke
  let n=0; for(const b of NBB.slice()){ n++; b.gone=1; try{ const q=toScreen(b.x,b.y,b.z), a=rnd(0,Math.PI); JC.lines.push({x0:q[0]-Math.cos(a)*170,y0:q[1]-Math.sin(a)*170,x1:q[0]+Math.cos(a)*170,y1:q[1]+Math.sin(a)*170,t:0,ttl:.3}); if(JC.lines.length>16) JC.lines.shift(); }catch(e){}
    FX.cut(b.x,b.y,b.z); FX.burst(b.x,b.y,b.z,14,0xff2a3a,5,.3); nbKillBit(b); }
  if(n){ JC.flash=Math.max(JC.flash||0,.4); Sound.sfx('swing'); Sound.sfx('glass'); Game.dmgNums.push({x:P.x,y:P.y+3.6,z:P.z,n:n>1?n+' BITS DOWN':'BIT DOWN',t:0,col:'#ff8a9a'}); }
  // the pin on him, the launch
  np1Glint(NB.x,ny+2.4,NB.z,0xffffff,4.6); FX.ring(NB.x,gy+.1,NB.z,'#ff3a4a',2.6,.4); FX.flash=Math.max(FX.flash,.4); grade.uniforms.flashCol.value.set(1,.3,.4); FX.hitstop=Math.max(FX.hitstop,.05); shake(.5);
  Sound.sfx('counter'); Sound.sfx('dash'); Sound.sfx('whoosh'); Sound.hiss(2600,.24,.32,'bandpass'); Sound.hiss(6000,.16,.14,'highpass'); Sound.tone('sawtooth',160,1700,.2,.08); Sound.tone('sine',2400,3800,.18,.1);
  FX.burst(P.x,P.y+1,P.z,30,0xff3a4a,7,.35); FX.ring(P.x,P.y+.1,P.z,'#ffffff',2.4,.3);
  if(typeof TPS!=='undefined') TPS.fast=34; /* the camera rides right behind him */ }
function np1FcUpd(S,dt){ const P=Player, F=NP1_FC;
  // Nathan stays pinned where he was
  NB.x=S.nx; NB.z=S.nz; NB.dsh=null; NP1.alt=S.ny; if(!NP1.done) NB.stunned=1; if(NB.mesh){ NB.mesh.position.x=S.nx; NB.mesh.position.z=S.nz; } if(typeof NBS!=='undefined') NBS.boostT=0;
  const u=Math.min(1,S.t/F.dash), e=1-Math.pow(1-u,3), ty=S.air?S.ey:groundY(P.x,P.z);
  P.x=lerp(S.sx,S.ex,e); P.z=lerp(S.sz,S.ez,e); P.y=Math.max(groundY(P.x,P.z),lerp(S.sy,ty,e)+(S.air?Math.sin(u*Math.PI)*.5:0)); P.ang=Math.atan2(S.nz-P.z,S.nx-P.x);
  if(!S.hit){ P.cineAnim='dash'; S.gt-=dt; if(S.gt<=0){ S.gt=.018; try{ const g=aliGhost(P.x,P.y,P.z); if(g&&g.mesh) g.mesh.material.color.setHex(0xff3a4a); }catch(e){} }
    const bx=S.sx-S.ex, bz=S.sz-S.ez, bl=Math.hypot(bx,bz)||1; for(let i=0;i<5;i++) FX.spawn(P.x+rnd(-.4,.4),P.y+rnd(.2,2),P.z+rnd(-.4,.4),bx/bl*rnd(6,14),rnd(-.3,.6),bz/bl*rnd(6,14),.3,i%2?0xff3a4a:0xffffff,.3,0,true);
    if(!S.air&&Math.random()<.7) FX.spawn(P.x,groundY(P.x,P.z)+.15,P.z,bx/bl*3,rnd(.5,1.5),bz/bl*3,.5,0x8a8070,.35,0,false); /* dust kicked up */
    try{ if(typeof TPS!=='undefined'&&TPS.on){ camera.fov=TPS.FOV+18*Math.sin(u*Math.PI/2); camera.updateProjectionMatrix(); } }catch(e){} }
  // arrival: Shayan's Full Counter, point blank
  if(u>=1&&!S.hit){ S.hit=1; S.hitT=S.t; S.swU=0; P.cineAnim='aliS1'; if(typeof TPS!=='undefined') TPS.fast=null;
    try{ if(typeof TPS!=='undefined'&&TPS.on){ camera.fov=TPS.FOV+6; camera.updateProjectionMatrix(); } }catch(e){}
    shFullCounterFX(); nbDamage(F.dmg,'np1'); Sound.sfx('slam'); Sound.sfx('hit'); FX.hitstop=Math.max(FX.hitstop,.12); shake(1.1);
    FX.burst(NB.x,S.ny+2,NB.z,46,0xffffff,8,.35); FX.burst(NB.x,S.ny+2,NB.z,30,0xff2a3a,7,.4); FX.burst(NB.x,S.ny+2,NB.z,16,0x0c0814,5,.4,false); }
  if(S.hit){ S.swU=Math.min(1,(S.t-S.hitT)/.24); try{ if(typeof TPS!=='undefined'&&TPS.on){ camera.fov=lerp(camera.fov,TPS.FOV,Math.min(1,dt*6)); camera.updateProjectionMatrix(); } }catch(e){} }
  if(S.t>F.dash+F.hold){ NP1.seq=null; NP1.alt=null; P.cineFly=false; P.cineAnim=null; P.inv=.5; P.vy=0; if(typeof TPS!=='undefined'){ TPS.fast=null; if(TPS.on){ camera.fov=TPS.FOV; camera.updateProjectionMatrix(); } }
    if(!NP1.done) np1Stun(1.2,'FULL COUNTER'); } }
// the blink: its time, for the perfect dodge
(function(){ const at=aliTeleport; aliTeleport=function(mx,mz){ NP1.blinkT=Game.time;
    try{ const left=NP1.grabLand-Game.time; if(NP1.lunge&&NB&&!NP1.seq&&left<=NP1_WIN&&left>=-.05){ /* inside the grab's parry-timed window */ const P=Player, [dx,dz]=np1Dir(); let ux=mx||0, uz=mz||0;
        if(Math.hypot(ux,uz)<.1||(ux*dx+uz*dz)<-.6*Math.hypot(ux,uz)){ ux=-dz; uz=dx; } /* no input (or straight into him): sidestep */ np1PerfectDodge(ux,uz); return; } }catch(e){ console.error('np1 dodge',e); }
    return at.apply(this,arguments); }; })(); /* a blink in the grab's window = the perfect dodge, not a teleport; earlier is a plain blink (he still grabs you if you stay in reach) */
// retries and leaving the fight start phase I over
(function(){ const nr=nbRespawn; nbRespawn=function(){ np1Reset(); return nr.apply(this,arguments); }; })();
(function(){ const rm=nbRemove; nbRemove=function(){ np1Reset(); return rm.apply(this,arguments); }; })();
// the counter's camera: in front of Ali, looking back at him, Nathan behind him; flat sprites face it
(function(){ const uc=updateCamera; updateCamera=function(dt){ const C=NP1.cam; if(!C||!tpsFight()) return uc.apply(this,arguments);
    try{ camera.position.set(C.x,C.y,C.z); camera.lookAt(C.lx,C.ly,C.lz); TPS.p=[C.x,C.y,C.z]; TPS.l=[C.lx,C.ly,C.lz];
      for(const s of SPRITES) if(s&&s.mesh) s.mesh.quaternion.copy(camera.quaternion); if(NB&&NB.mesh){ NB.mesh.quaternion.copy(camera.quaternion); NB.mesh.scale.x=1; } }catch(e){ console.error('np1 camera',e); return uc.apply(this,arguments); } }; })();
// his phase I bar and the hints
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ if(!tpsFight()||!NP1.live||Game.letter>.5) return;
      const TT=IS_TOUCH(), bw=Math.min(UW*.6,560), bx=(UW-bw)/2, by=6, /* his bar: a thin line along the very top edge */ k=Math.max(0,NP1.hp/NP1.max), a=NP1.bar;
      D.save(); D.globalAlpha=a; D.fillStyle='rgba(10,18,28,.7)'; D.fillRect(bx,by,bw,4); D.fillStyle=NP1.done?'#ffd45a':NB&&NB.stunned?'#ffffff':'#3ff4ff'; D.fillRect(bx,by,bw*k,4);
      D.font=`800 11px ${FB}`; D.textAlign='right'; D.textBaseline='middle'; D.lineWidth=3; D.strokeStyle='rgba(0,0,0,.6)'; D.strokeText('NATHAN',bx-6,by+2); D.fillStyle='#bfefff'; D.fillText('NATHAN',bx-6,by+2); D.restore();
      const Fc=NP1.seq&&NP1.seq.k==='fc'?NP1.seq:null; if(Fc&&Fc.L){ const k2=Fc.t<NP1_FC.dash?1:Math.max(0,1-(Fc.t-NP1_FC.dash)/.2); if(k2>0){ const cx=UW/2, cy=UH*.5, R0=Math.hypot(UW,UH)*.55; D.save(); /* speed lines rushing in on the dash */
          for(const l of Fc.L){ const a=l.a+rnd(-.015,.015), r1=R0*l.r, r0=r1*(1-.55*Math.min(1,Fc.t*l.sp*9)); D.strokeStyle=`rgba(${l.w>3?'255,170,185':'255,255,255'},${.8*k2})`; D.lineWidth=l.w; D.beginPath(); D.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1); D.lineTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0); D.stroke(); }
          D.restore(); } }
      const F=NP1.pdFx; if(F&&NP1.seq&&NP1.seq.k==='pdodge'){ const cx=UW/2, cy=UH/2, R0=Math.hypot(UW,UH)*.55, k=Math.max(0,1-F.t/.45); D.save();
        // the blue vignette through the slow-mo
        const vg=D.createRadialGradient(cx,cy,R0*.35,cx,cy,R0); vg.addColorStop(0,'rgba(40,90,200,0)'); vg.addColorStop(1,`rgba(30,80,200,${.38*Math.min(1,F.t*8)*Math.min(1,(1.1-F.t)*5)})`); D.fillStyle=vg; D.fillRect(0,0,UW,UH);
        // speed lines rushing in from the edges on the dash
        if(k>0) for(const l of F.L){ const r1=R0*l.r, r0=r1*(1-.45*Math.min(1,F.t*l.sp*6)); D.strokeStyle=`rgba(${l.w>2.5?'200,230,255':'255,255,255'},${.75*k})`; D.lineWidth=l.w; D.beginPath(); D.moveTo(cx+Math.cos(l.a)*r1,cy+Math.sin(l.a)*r1); D.lineTo(cx+Math.cos(l.a)*r0,cy+Math.sin(l.a)*r0); D.stroke(); }
        D.restore(); }
      const Q=NP1.seq; if(Q&&Q.k==='pdodge'&&Q.t>.1&&Q.t<1.1){ const pu=1+.08*Math.sin(Q.t*28), al=Math.min(1,(1.1-Q.t)*5); D.save(); D.globalAlpha=al; D.translate(UW/2,UH*.62); D.scale(pu,pu); D.font=`900 ${TT?34:40}px ${FB}`; D.textAlign='center'; D.lineWidth=7; D.strokeStyle='#06101c'; D.strokeText('COUNTER',0,0); D.fillStyle='#9fd0ff'; D.fillText('COUNTER',0,0);
        D.font=`800 ${TT?18:18}px ${FB}`; D.lineWidth=4; D.strokeText(K('attack'),0,30); D.fillStyle='#ffffff'; D.fillText(K('attack'),0,30); D.restore(); }
      const H=NP1.hint; if(H){ H.t+=1/60; if(H.t>H.dur) NP1.hint=null; else { const al=Math.min(1,H.t*4,(H.dur-H.t)*3); D.save(); D.globalAlpha=al; D.font=`800 ${TT?20:22}px ${FB}`; D.textAlign='center'; D.lineWidth=5; D.strokeStyle='#06101c'; D.strokeText(H.text,UW/2,UH*.22); D.fillStyle='#e8f6ff'; D.fillText(H.text,UW/2,UH*.22); D.restore(); } }
    }catch(e){ console.error('np1 ui',e); } }; })();
// Ali's iaido for the dodge counter (img/ali/ali_iai.png: 96px cells, columns = facings S..SW, 18 rows = the sword draw,
// cut and re-sheathe): he faces the camera, draws and cuts as he lands, holds while the cuts rain, sheathes on the boom
const ALI_IAI={img:null,ok:false,off:null,N:18,feet:77};
(function(){ try{ const im=new Image(); im.onload=()=>{ ALI_IAI.ok=im.width>0; }; im.src='img/ali/ali_iai.png?v=2'; ALI_IAI.img=im; }catch(e){} })();
function aliIaiFrame(t){ const k=t<.14?.1:t<.45?.1+(t-.14)/.31*.25:t<.95?.35+(t-.45)/.5*.25:t<1.15?.6+(t-.95)/.2*.3:Math.min(1,.9+(t-1.15)*.4); return Math.min(ALI_IAI.N-1,Math.floor(k*ALI_IAI.N)); }
function aliIaiPaint(c,cx,by,col,row){ if(!ALI_IAI.off) ALI_IAI.off=mkCanvas(96,96); const [ocv,oc]=ALI_IAI.off; oc.clearRect(0,0,96,96); oc.imageSmoothingEnabled=false;
  oc.drawImage(ALI_IAI.img,col*96,row*96,96,96,0,0,96,96); c.save(); c.imageSmoothingEnabled=false; c.translate(Math.round(cx),Math.round(by-1)); c.drawImage(ocv,-48,-ALI_IAI.feet,96,96); c.restore(); SHA.drawn=true; }
// the sword draw is also his real swing (every fight): his 1st and 2nd cuts and the Getsuga release play its draw-and-cut rows
// (3-10) in the facing of the swing (relative to the camera in the third-person fight); the spin keeps its whirl
function aliIaiSwing(s){ const P=Player; if(!ALI_IAI.ok||!ALI()||s.t!==P.t||s.anim!==P.anim) return -1; const Q=NP1.seq;
  if(Q&&Q.k==='auto5'&&!Q.kb&&(s.anim==='aliS1'||s.anim==='aliS2')) return Q.swU!=null?3+Math.min(7,Math.floor(Q.swU*8)):10; /* the auto-parry's swings, holding the follow-through between them */
  if(Q&&Q.k==='fc'&&Q.swU!=null&&(s.anim==='aliS1'||s.anim==='aliS2')) return 3+Math.min(7,Math.floor(Q.swU*8)); /* the Full Counter's cut */
  if(P.cineFly) return -1;
  if((s.anim==='aliS1'||s.anim==='aliS2')&&P.aliAtk) return 3+Math.min(7,Math.floor(P.aliAtk.u*8));
  if(s.anim==='beam'&&P.beamPose>0) return 4+Math.min(6,Math.floor((1-P.beamPose/.3)*7)); return -1; }
// the 5th clash's poses: dragging the blade (the blade-less stance, katana angled down to the ground at his side) and the
// backflip (the Front Flip rows played in reverse), both in his camera-relative facing
function aliPoseDir(){ const P=Player; let a=P.ang||0; if(typeof tpsOn==='function'&&tpsOn()&&TPS.p) a=a-Math.atan2(TPS.l[2]-TPS.p[2],TPS.l[0]-TPS.p[0])-Math.PI/2; return shDirIdx(a); }
(function(){ const da=drawAliHD; drawAliHD=function(c,cx,by,f,s){ const P=Player;
    if(s&&(s.anim==='aliDrag'||s.anim==='aliBackflip')&&s.anim===P.anim&&ALS.ok){ try{ const Q=NP1.seq, u=Q&&Q.kb?Math.min(1,Q.kb.t/.55):1, d=aliPoseDir(); /* he keeps facing Nathan as he's shoved back */
        if(s.anim==='aliDrag'){ const g=ALS.guard[d]||[48,44], fx=AL_FX[d]||1; alPaint(c,cx,by,18,d,{blade:(oc)=>alBlade(oc,g[0],g[1],1.12,fx>=0?1:-1,40,null,u<1?.35:0)}); }
        else alPaint(c,cx,by,1+d,5-Math.min(5,Math.floor(u*6)));
        return; }catch(e){ console.error('ali pose',e); } }
    return da.apply(this,arguments); }; })();
(function(){ const da=drawAliHD; drawAliHD=function(c,cx,by,f,s){
    if(s&&s.anim!=='aliIai'){ const r=aliIaiSwing(s); if(r<0) return da.apply(this,arguments);
      try{ const P=Player; let a=P.aliAtk&&P.aliAtk.ang!=null?P.aliAtk.ang:(P.ang||0); if(typeof tpsOn==='function'&&tpsOn()&&TPS.p){ a=a-Math.atan2(TPS.l[2]-TPS.p[2],TPS.l[0]-TPS.p[0])-Math.PI/2; }
        aliIaiPaint(c,cx,by,shDirIdx(a),r); return; }catch(e){ console.error('ali iai swing',e); return da.apply(this,arguments); } }
    if(!s) return da.apply(this,arguments);
    if(!ALI_IAI.ok){ return da.call(this,c,cx,by,f,Object.assign({},s,{anim:'charge'})); }
    try{ const S=NP1.seq; aliIaiPaint(c,cx,by,0,aliIaiFrame(S?S.t:2)); /* column 0: facing the camera */
    }catch(e){ console.error('ali iai',e); return da.call(this,c,cx,by,f,Object.assign({},s,{anim:'charge'})); } }; })();
