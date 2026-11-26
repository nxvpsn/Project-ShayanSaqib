// =====================================================================
// NATHAN, PHASE II: "MOONLESS SKY", REBUILT AROUND MOVEMENT (owner, Nov 26 2026: phases II and III felt the same, both
// were strings of red parry beats; II should use the 3D field, like a Kingdom Hearts data fight).
// Phase II is now the machine's phase and the answer to almost everything in it is where you are, not when you press:
//   ringfall   he climbs, marks a spot and falls on it (leave the mark); three shockwaves roll out along the ground: JUMP each
//   lattice    six funnels cross the field with three beams through one centre and turn them like spokes, then turn them
//              back faster: walk with them, or BLINK through one. The middle, where they cross, is never safe
//   mirage     he splits in four around you and all four take aim: get to the real one (your lock-on knows him) and cut him
//              before they fire = INTERCEPT, he is stunned. Too late: four beams cross on where you stood
//   circus     (kept) leave each lock-on ring; the one RED missile is the phase's one parry
//   buster     (kept) a sweeping beam: blink through it, jump it, get behind him
//   tackle     (kept) two boost charges: step off the line, or parry
// Gone from phase II: strafe (red beat shots: that is phase III's gun kata), the funnel grab, the grab and the sword combo.
// Phase III stays the duel on foot: every answer there is a parry, a counter or a blink at arm's length.
// Limit cut (50%): FULL BURST = circus, the lattice at speed, two ringfalls back to back, the buster; then OVERHEAT.
// =====================================================================
NP_POOLS[2]=['ringfall','lattice','circus','mirage','buster','tackle','ringfall','lattice','mirage','circus'];
NP_FIRST[2]=['ringfall','lattice','mirage','circus','buster'];
function npsHurt(dmg,x,z){ const P=Player; if(P.inv>0||P.dash>0||P.cineFly||Game.state!=='play') return false; hurtPlayer(dmg,x,z); return true; }
// ---------- RINGFALL ----------
// one shockwave: a low wall of light rolling out from (x,z); it hurts once if it passes you on the ground
function npsRing(x,z,sp,maxR,dmg){ const gy=groundY(x,z), S={R:.5,hit:0,done:0};
  const mk=(geo,col,op)=>{ const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false,side:THREE.DoubleSide,fog:false,blending:THREE.AdditiveBlending})); m.userData.temp=1; scene.add(m); return m; };
  const flat=mk(new THREE.RingGeometry(.94,1,72),0x9ff8ff,.95), core=mk(new THREE.RingGeometry(.975,1,72),0xffffff,1), wall=mk(new THREE.CylinderGeometry(1,1,1,72,1,true),0x3ff4ff,.4);
  flat.rotation.x=core.rotation.x=-Math.PI/2; flat.position.set(x,gy+.1,z); core.position.set(x,gy+.14,z); wall.position.set(x,gy+.35,z);
  np1Obj({bit:1,upd(dt){ if(S.done) return false; const r0=S.R; S.R+=sp*dt; const R=S.R, fade=Math.max(0,Math.min(1,(maxR-R)/5)); flat.scale.set(R,R,1); core.scale.set(R,R,1); wall.scale.set(R,.7,R); flat.material.opacity=.95*fade; core.material.opacity=fade; wall.material.opacity=.4*fade;
      for(let k=0;k<5;k++){ const a=rnd(0,6.283); FX.spawn(x+Math.cos(a)*R,gy+rnd(.1,.9),z+Math.sin(a)*R,Math.cos(a)*2,rnd(1,4),Math.sin(a)*2,.35,k%2?0x9ff8ff:0xffffff,.2,6,true); }
      const P=Player, d=Math.hypot(P.x-x,P.z-z); if(!S.hit&&d>=r0-.45&&d<=R+.45&&P.y<groundY(P.x,P.z)+.9){ if(npsHurt(dmg,x,z)) S.hit=1; }
      return R<maxR; }, kill(){ S.done=1; for(const m of [flat,core,wall]){ scene.remove(m); try{ m.geometry.dispose(); m.material.dispose(); }catch(e){} } }}); return S; }
// one fall: mark, climb, drop on the mark, n shockwaves
function* npsFall(nRings,gap){ const P=Player, L=npcLock(P.x,P.z,3.4,.95), gy=groundY(L.x,L.z); Game.dmgNums.push({x:L.x,y:gy+2.8,z:L.z,n:'INCOMING',t:0,col:'#ffb04a'});
  nbBoost(L.x,L.z); NB.hov=12; Sound.sfx('charge'); for(let t=0;t<.95;t+=NP1.dt){ NB.hov=12; NB.y=lerp(NB.y,gy+12,Math.min(1,NP1.dt*9)); yield NP1.dt; }
  // the drop: straight down, fast
  { const y0=NB.y; Sound.sfx('dash'); for(let t=0;t<.2;t+=NP1.dt){ const u=Math.min(1,t/.2); NB.hov=lerp(12,.5,u*u); NB.y=lerp(y0,gy+.5,u*u); FX.spawn(NB.x+rnd(-.6,.6),NB.y+3,NB.z+rnd(-.6,.6),0,6,0,.3,0x3ff4ff,.4,0,true); yield NP1.dt; } NB.hov=.5; NB.y=gy+.5; }
  L.done=1; npcBoom(L.x,gy+.5,L.z,3.4); impactFrame([[2,1],[1,1]]); shake(1); FX.hitstop=Math.max(FX.hitstop,.05); { const P2=Player; if(Math.hypot(P2.x-L.x,P2.z-L.z)<3.4&&P2.y<gy+3) npsHurt(3,L.x,L.z); }
  for(let i=0;i<nRings;i++){ npsRing(L.x,L.z,12.5+i*1.5,30,2); Sound.sfx('slam'); Sound.sfx('quickboost'); if(i===0) Game.dmgNums.push({x:Player.x,y:Player.y+2.8,z:Player.z,n:'JUMP',t:0,big:true,col:'#9ff8ff'}); for(let t=0;t<gap;t+=NP1.dt){ NB.hov=.5; yield NP1.dt; } } }
NP1M.ringfall=function*(){ NP1.cur='ringfall'; twBark('nathan',"Orbital drop. Mind your ankles.",true); np1Hint('ringfall','RINGFALL: leave the mark before he lands. Then JUMP each shockwave ('+K('jump')+')');
  yield* npsFall(3,.55); yield .9; NB.hov=1.4; np1Open(1.8); yield .2; };
// ---------- LATTICE ----------
function* npsLattice(w1,w2,T){ const P=Player, cx=P.x, cz=P.z, gy=groundY(cx,cz), R=9.5, LEN=24, S={a:rnd(0,6.283),w:0,on:0,done:0,cd:0,t:0}, bits=[], beams=[];
  nbBoost(cx,cz); NB.hov=7; const hub=new THREE.Mesh(new THREE.CircleGeometry(1.7,28),new THREE.MeshBasicMaterial({color:0x2a0608,transparent:true,opacity:.6,depthWrite:false,fog:false})), hubR=new THREE.Mesh(new THREE.RingGeometry(1.55,1.7,28),new THREE.MeshBasicMaterial({color:0xff5a2a,transparent:true,opacity:1,depthWrite:false,side:THREE.DoubleSide,fog:false})); for(const m of [hub,hubR]){ m.rotation.x=-Math.PI/2; m.position.set(cx,gy+.07,cz); m.userData.temp=1; scene.add(m); } hubR.position.y+=.01; /* where the spokes cross: marked, never safe */
  for(let i=0;i<6;i++){ const b=nbBit(NB.x,NB.y+2,NB.z); bits.push(b); }
  for(let i=0;i<3;i++){ const pair=[beamMesh(0x3ff4ff,.55),beamMesh(0xffffff,.24)]; pair.forEach(m=>{ m.userData.temp=1; }); beams.push(pair); }
  np1Obj({bit:1,upd(dt){ if(S.done) return false; S.t+=dt; S.cd-=dt; S.a+=S.w*dt; NB.hov=7; const P2=Player; let hit=false;
      bits.forEach((b,i)=>{ const a=S.a+i*Math.PI/3, tx=cx+Math.cos(a)*R, tz=cz+Math.sin(a)*R, k=Math.min(1,dt*7); b.x=lerp(b.x,tx,k); b.y=lerp(b.y,gy+1.3,k); b.z=lerp(b.z,tz,k); b.m.position.set(b.x,b.y,b.z); b.m.lookAt(cx,gy+1.3,cz); });
      beams.forEach((pair,i)=>{ const a=S.a+i*Math.PI/3, ux=Math.cos(a), uz=Math.sin(a); pair.forEach((m,mi)=>{ m.position.set(cx-ux*LEN,gy+1.1,cz-uz*LEN); m.lookAt(cx+ux*LEN,gy+1.1,cz+uz*LEN+1e-4); const j=S.on?1+Math.sin(S.t*46+i)*.1:(mi?.22:.0001); m.scale.set(j,j,LEN*2); m.visible=S.on||mi===1; });
        if(S.on){ for(let k=0;k<3;k++){ const u=rnd(-LEN,LEN); FX.spawn(cx+ux*u,gy+rnd(.6,1.6),cz+uz*u,0,rnd(.5,2),0,.25,k%2?0x3ff4ff:0xffffff,.18,0,true); }
          const rx=P2.x-cx, rz=P2.z-cz; if(Math.abs(rx*uz-rz*ux)<.6&&Math.abs(rx*ux+rz*uz)<LEN&&P2.y<groundY(P2.x,P2.z)+2.3) hit=true; } });
      if(hit&&S.cd<=0){ if(npsHurt(2,cx,cz)) S.cd=1; } hub.material.opacity=.4+.25*(Math.floor(S.t*8)%2); return true; },
    kill(){ S.done=1; bits.forEach(b=>{ if(!b.gone){ b.gone=1; nbKillBit(b); } }); beams.forEach(pair=>pair.forEach(m=>scene.remove(m))); scene.remove(hub); scene.remove(hubR); }});
  try{ Sound.sfx('charge'); Game.dmgNums.push({x:cx,y:gy+2.8,z:cz,n:'GET OUT OF THE MIDDLE',t:0,col:'#ffb04a'}); yield 1.3;    /* the sights: thin lines, where the beams will be */
    for(const [w,dur] of [[w1,T],[w2,T]]){ S.on=1; Sound.sfx('beam'); shake(.4); for(let t=0;t<dur;t+=NP1.dt){ S.w=w*Math.min(1,t/.7); yield NP1.dt; } S.on=0; S.w=0; if(w===w1){ Sound.sfx('ting'); Game.dmgNums.push({x:Player.x,y:Player.y+2.8,z:Player.z,n:'REVERSING',t:0,col:'#9ff8ff'}); yield .7; } } }
  finally{ S.done=1; } }
NP1M.lattice=function*(){ NP1.cur='lattice'; twBark('nathan',"Funnels. Lattice formation. Keep up.",true); np1Hint('lattice','LATTICE: the beams turn like spokes. Walk with them or BLINK through one ('+K('dash')+'). Stay out of the middle');
  yield* npsLattice(.55,-.9,3.2); NB.hov=1.4; yield .5; np1Open(1.7); yield .2; };
// ---------- MIRAGE: INTERCEPT ----------
NP1M.mirage=function*(){ NP1.cur='mirage'; twBark('nathan',"Mirage formation. Four of me. One of you.",true); np1Hint('mirage','MIRAGE: four take aim. Reach the real one (your lock-on follows him) and cut him before they fire');
  const P=Player, a0=Math.atan2(NB.z-P.z,NB.x-P.x), real=Math.floor(Math.random()*4), pts=[], clones=[], sights=[], S={done:0,lock:null,t:0}, T_AIM=1.9, T_FIRE=.42;
  for(let i=0;i<4;i++){ const a=a0+(i-1.5)*.62; /* a fan ahead of you, never behind: one right at the camera filled the screen */ pts.push([P.x+Math.cos(a)*11,P.z+Math.sin(a)*11]); }
  nbBoost(pts[real][0],pts[real][1]); NB.hov=1.6; yield .12;
  for(let i=0;i<4;i++){ if(i!==real) clones.push(npClone(pts[i][0],pts[i][1])); const m=beamMesh(0xff2a3a,.05); m.userData.temp=1; sights.push(m); }
  const src=i=>i===real?[NB.x,NB.y+1.8,NB.z]:[pts[i][0],NB.y+1.8,pts[i][1]];
  np1Obj({bit:1,upd(dt){ if(S.done) return false; S.t+=dt; const P2=Player, tg=S.lock||[P2.x,P2.y+1,P2.z]; sights.forEach((m,i)=>{ const s=src(i); m.position.set(s[0],s[1],s[2]); m.lookAt(tg[0],tg[1],tg[2]+1e-4); const w=S.lock?2.2+Math.sin(S.t*60):1; m.scale.set(w,w,Math.hypot(tg[0]-s[0],tg[1]-s[1],tg[2]-s[2])); }); return true; },
    kill(){ S.done=1; sights.forEach(m=>scene.remove(m)); }});
  const shat=C=>{ if(C.dead) return; C.dead=1; FX.burst(C.x,C.y+1.6,C.z,34,0x9ff8ff,7,.4); Sound.sfx('glass'); };
  const sw0=Player.swingT||-9; let caught=false; Sound.sfx('charge');
  try{ for(let t=0;t<T_AIM;t+=NP1.dt){ const P2=Player; if((P2.swingT||-9)>sw0+1e-6&&Math.hypot(P2.x-NB.x,P2.z-NB.z)<3.8){ caught=true; break; } if(Math.floor(t*5)!==Math.floor((t-NP1.dt)*5)) Sound.tone('square',900+t*500,900+t*500,.04,.05); yield NP1.dt; }
    if(caught){ clones.forEach(shat); twBig('INTERCEPTED',{size:44,col:'#ffd45a',y:UH*.26,dur:1.2,sub:'The real one never fired'}); impactFrame([[2,1],[1,1]]); try{ npPosture(30,'INTERCEPT'); }catch(e){} S.done=1; np1Stun(2.6,'INTERCEPT'); return; }
    // too late: the aim locks where you stand, a beat, four beams
    { const P2=Player; S.lock=[P2.x,P2.y+1,P2.z]; np1Glint(P2.x,P2.y+1.2,P2.z,0xffffff,5); Sound.sfx('ting'); Game.dmgNums.push({x:P2.x,y:P2.y+2.8,z:P2.z,n:'MOVE',t:0,big:true,col:'#ff8a9a'}); }
    for(let t=0;t<T_FIRE;t+=NP1.dt) yield NP1.dt;
    { const tg=S.lock, P2=Player; let hit=false; Sound.sfx('beam'); Sound.sfx('crossboom'); shake(.8); for(let i=0;i<4;i++){ const s=src(i), ex=tg[0]+(tg[0]-s[0])*.9, ez=tg[2]+(tg[2]-s[2])*.9; np1Beam(s[0],s[1],s[2],ex,tg[1]-.4,ez,0x3ff4ff,.4,.22); /* thin and short: four fat beams meeting at the camera whited the screen out for half a second (seen on film) */
        const vx=ex-s[0], vz=ez-s[2], L2=vx*vx+vz*vz||1, u=Math.max(0,Math.min(1,((P2.x-s[0])*vx+(P2.z-s[2])*vz)/L2)); if(Math.hypot(P2.x-(s[0]+vx*u),P2.z-(s[2]+vz*u))<1.1&&P2.y<groundY(P2.x,P2.z)+2.4) hit=true; }
      npcBoom(tg[0],tg[1],tg[2],1.1); if(hit) npsHurt(3,tg[0],tg[2]); }
    S.done=1; yield .25; clones.forEach(shat); np1Open(1.1); yield .2; }
  finally{ S.done=1; for(const C of clones) if(!C.dead){ try{ C.dead=1; }catch(e){} } } };
// ---------- the limit cut ----------
npLCEclipse=function*(){ NP1.cur='lc'; NP1.lcInv=1; twCutin('nathan','FULL BURST','Limit Break  ·  every weapon at once','#1a8aff',1.8); twBark('nathan',"Full burst. Everything I have. Don't take it personally.",true); Sound.sfx('secret');
  try{ { const [dx,dz]=np1Dir(), P=Player; nbBoost(P.x-dx*12,P.z-dz*12); } NB.hov=4.5; yield 1.5; twBig('FULL BURST',{size:46,col:'#9ff8ff',y:UH*.24,dur:1.8,sub:'Leave the rings · blink the spokes · jump the waves · run from the beam'});
    yield* npCircus(4,4); yield .4; yield* npsLattice(.8,-1.15,2.8); NB.hov=1.4; yield .4; yield* npsFall(2,.45); yield .15; yield* npsFall(3,.42); yield .7; NB.hov=1.4; { const [dx,dz]=np1Dir(), P=Player; nbBoost(P.x-dx*9,P.z-dz*9); } yield .3; yield* npBuster(3.4,1.6); yield .3; }
  finally{ npLCEnd(); }
  twBark('nathan',"Heat... critical. Vent... venting...",true); for(let i=0;i<5;i++) FX.burst(NB.x,NB.y+rnd(1,3),NB.z,16,0xc8d4e0,5,.5,false); np1Stun(5,'OVERHEAT'); };
// a limit-cut banner clears a move tip that is still up (seen in the rig: the ringfall tip sat under FULL BURST's cut-in)
(function(){ const f=twCutin; twCutin=function(){ try{ if(typeof NP1!=='undefined'&&NP1) NP1.hint=null; }catch(e){} return f.apply(this,arguments); }; })();
