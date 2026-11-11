// =====================================================================
// NATHAN, PHASE II: BERSERK (v1.68; replaces the pool of 59zi). The rules Ali fights by are RED = parry, BLUE = blink, and
// "get out of the ring"; every move is one of those, at speed. Nothing draws a line on the ground and nothing asks for
// sword spam.
//   circus     ITANO CIRCUS: twelve missiles burst out of him in every direction on smoke trails, loop round the sky and
//              come down in three packs. Each pack locks the spot Ali stands on (a closing lock-on ring, 0.6s) and
//              lands there: move out. Then one big RED missile, alone, glinting: parry it back into him.
//   storm      FUNNEL STORM: six funnels swarm round Ali; one at a time turns red and fires (parry), on a broken
//              rhythm, the last two together. Parry every shot and they all burst: stagger.
//   mirage     three clones are left where he dashed; each turns red and rushes through you in turn (parry), then the
//              real one comes in BLUE (blink). Parry all three: the mirage breaks, stagger.
//   strafe     he circles you at speed between five RED rifle shots (parry)
//   buster     a laser sight from the muzzle, then the beam sweeps after you: blink through it, jump it or get behind him
//   tackle     two boost charges (RED rush): parry or sidestep
//   funnelgrab two red funnel dives: parry one and Ali throws it back
//   limit cut  FULL BURST: a four-pack circus, the storm, the buster; then OVERHEAT (5s down)
// =====================================================================
NP_POOLS[2]=['circus','storm','mirage','strafe','buster','tackle','circus','storm','mirage','funnelgrab','grab','combo'];
NP_FIRST[2]=['circus','storm','mirage','strafe','buster'];
npEscort=function(){}; /* the lane-burning escort is gone */
// ---------- the circus ----------
function npcMissile(red){ const g=new THREE.Group(), body=new THREE.Mesh(new THREE.ConeGeometry(red?.3:.17,red?1.3:.75,6),new THREE.MeshBasicMaterial({color:red?0xff2a3a:0xe8eef4})); body.rotation.x=Math.PI/2; g.add(body); const gl=npSprite(red?0xff2a3a:0xffb04a,red?2.6:1.1); gl.userData.temp=0; g.add(gl); g.userData.temp=1; scene.add(g); return g; }
function npcBoom(x,y,z,r){ FX.burst(x,y,z,46,0xff8a2a,r*3.2,.45); FX.burst(x,y,z,26,0xffe0a0,r*2.2,.3); FX.burst(x,y+.4,z,22,0x2a2a30,r*1.6,.9,false); try{ npStar(x,y,z,0xffe0a0,r*.9,.3); FX.ring(x,groundY(x,z)+.1,z,'#ffb04a',r*1.5,.4); }catch(e){} Sound.sfx('crossboom'); Sound.sfx('slam'); shake(.6); if(typeof TPS!=='undefined') TPS.kick=Math.max(TPS.kick||0,.3); }
// a lock-on: a ring closing on the spot for `t` seconds with a pillar of light over it; returns its state ({x,z,r,done})
function npcLock(x,z,r,t){ const gy=groundY(x,z), mk=(a,b,c,op)=>{ const m=new THREE.Mesh(new THREE.RingGeometry(a,b,40),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,depthWrite:false,side:THREE.DoubleSide,fog:false})); m.rotation.x=-Math.PI/2; m.position.set(x,gy+.07,z); m.userData.temp=1; scene.add(m); return m; };
  const fill=new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({color:0x2a0608,transparent:true,opacity:.5,depthWrite:false,fog:false})); fill.rotation.x=-Math.PI/2; fill.position.set(x,gy+.06,z); fill.scale.setScalar(r); fill.userData.temp=1; scene.add(fill);
  const rim=mk(r-.16,r,0xff5a2a,1), close=mk(.94,1,0xffffff,1), pil=beamMesh(0xff5a2a,.1); pil.userData.temp=1; pil.position.set(x,gy,z); pil.lookAt(x,gy+30,z+1e-4); pil.scale.set(1,1,30);
  const S={x,z,r,t:0,done:0}; Sound.tone('square',1700,1700,.05,.05); Sound.tone('square',2300,2300,.05,.04);
  np1Obj({bit:1,upd(dt){ S.t+=dt; const u=Math.min(1,S.t/t); close.scale.setScalar(Math.max(.05,r*(2.6-1.6*u))); close.material.opacity=.5+.5*u; fill.material.opacity=.3+.35*u*(Math.floor(S.t*16)%2?1:.6); pil.material.opacity=.35+.4*u; return !S.done&&S.t<t+.3; }, kill(){ S.done=1; for(const m of [fill,rim,close,pil]) scene.remove(m); }}); return S; }
// packs of white missiles: out on a random direction, round the sky, down on their lock at the same instant; then the red one
function* npCircus(packs,per){ const P=Player, R=3.1, T_LOCK=.62, all=[]; NB.hov=Math.max(NB.hov||1.4,4.5); NB.flash=.3; Sound.sfx('charge');
  for(let k=0;k<packs*per+1;k++){ const red=k===packs*per, a=rnd(0,6.283), el=red?1.2:rnd(.15,1.2), sp=red?9:rnd(15,22), M={g:npcMissile(red),x:NB.x,y:NB.y+3,z:NB.z,vx:Math.cos(a)*Math.cos(el)*sp,vy:Math.sin(el)*sp,vz:Math.sin(a)*Math.cos(el)*sp,red,pack:red?-1:k%packs,ph:0,t:0,curl:rnd(-2.5,2.5),dead:0}; all.push(M);
    FX.burst(M.x,M.y,M.z,6,0xffd27a,4,.2); if(k%3===0) Sound.sfx('mechshot'); }
  shake(.5); FX.burst(NB.x,NB.y+3,NB.z,40,0xffd27a,8,.35); Sound.sfx('crossboom');
  const fly=np1Obj({bit:1,upd(dt){ let live=0; for(const M of all){ if(M.dead) continue; live++; M.t+=dt;
        if(M.ph===0){ /* the burst: out, curling, slowing, drifting up */ const c=Math.cos(M.curl*dt), s=Math.sin(M.curl*dt), vx=M.vx*c-M.vz*s, vz=M.vx*s+M.vz*c; M.vx=vx*(1-dt*.9); M.vz=vz*(1-dt*.9); M.vy=M.vy*(1-dt*.9)+dt*3; M.x+=M.vx*dt; M.y=Math.max(groundY(M.x,M.z)+1.5,M.y+M.vy*dt); M.z+=M.vz*dt; }
        else if(M.ph===1){ /* the dive: a curve from where it was to its lock, landing exactly on time */ const u=Math.min(1,(Game.time-M.t0)/M.dur), e=u*u, q=1-e, tx=M.tgt?M.tgt.x:Player.x, ty=M.tgt?groundY(M.tgt.x,M.tgt.z)+.3:Player.y+1.1, tz=M.tgt?M.tgt.z:Player.z;
          M.x=q*q*M.p0[0]+2*q*e*M.c1[0]+e*e*tx; M.y=q*q*M.p0[1]+2*q*e*M.c1[1]+e*e*ty; M.z=q*q*M.p0[2]+2*q*e*M.c1[2]+e*e*tz; if(u>=1) M.hit=1; }
        else if(M.ph===2){ /* parried: back into him */ const dx=NB.x-M.x, dy=NB.y+2-M.y, dz=NB.z-M.z, d=Math.hypot(dx,dy,dz)||1, m=Math.min(d,34*dt); M.x+=dx/d*m; M.y+=dy/d*m; M.z+=dz/d*m; if(d<1.6){ M.dead=1; scene.remove(M.g); npcBoom(M.x,M.y,M.z,1.6); NB.flash=.3; nbDamage(14,'np1'); try{ npPosture(18,'REFLECT'); }catch(e){} continue; } }
        const px=M.g.position.x, py=M.g.position.y, pz=M.g.position.z; M.g.position.set(M.x,M.y,M.z); M.g.lookAt(M.x*2-px,M.y*2-py,M.z*2-pz);
        FX.spawn(M.x,M.y,M.z,rnd(-.3,.3),rnd(-.1,.5),rnd(-.3,.3),M.red?.9:.7,M.red?0x6a2a2a:0xb8b4b0,M.red?.5:.34,-.4,false); if(Math.random()<.7) FX.spawn(M.x,M.y,M.z,0,0,0,.2,M.red?0xff5a4a:0xffd27a,.22,0,true); }
      return live>0; }, kill(){ for(const M of all){ if(!M.dead){ M.dead=1; scene.remove(M.g); } } }});
  yield .85;
  for(let p=0;p<packs;p++){ if(fly.dead) return; const P2=Player, L=npcLock(P2.x,P2.z,R,T_LOCK); Game.dmgNums.push({x:P2.x,y:P2.y+2.8,z:P2.z,n:'LOCK ON',t:0,col:'#ffb04a'});
    for(const M of all) if(!M.dead&&M.pack===p){ M.ph=1; M.t0=Game.time; M.dur=T_LOCK; M.p0=[M.x,M.y,M.z]; M.c1=[(M.x+L.x)/2+M.vx*.5,Math.max(M.y,9)+4,(M.z+L.z)/2+M.vz*.5]; M.tgt={x:L.x+rnd(-.9,.9),z:L.z+rnd(-.9,.9)}; }
    for(let t=0;t<T_LOCK;t+=NP1.dt) yield NP1.dt;
    for(const M of all) if(!M.dead&&M.pack===p){ M.dead=1; scene.remove(M.g); FX.burst(M.x,M.y,M.z,14,0xff8a2a,6,.3); } npcBoom(L.x,groundY(L.x,L.z)+.6,L.z,R); L.done=1;
    { const P3=Player; if(Math.hypot(P3.x-L.x,P3.z-L.z)<R&&P3.y<groundY(L.x,L.z)+3.2&&P3.inv<=0&&P3.dash<=0&&!P3.cineFly){ hurtPlayer(2,L.x,L.z); } }
    yield .12; }
  // the red one: alone in the sky, it glints, then comes straight at you
  const M=all[all.length-1]; if(fly.dead||M.dead) return; yield .25; np1Glint(M.x,M.y,M.z,0xff2a3a,5); Game.dmgNums.push({x:Player.x,y:Player.y+2.8,z:Player.z,n:'RED: PARRY',t:0,col:'#ff8a9a'}); M.ph=1; M.t0=Game.time; M.dur=NP1_TELL; M.p0=[M.x,M.y,M.z]; M.c1=[(M.x+Player.x)/2,M.y+1,(M.z+Player.z)/2]; M.tgt=null;
  for(let t=0;t<NP1_TELL;t+=NP1.dt) yield NP1.dt; if(M.dead) return;
  const r=np1HitRed(3,M.x,M.z); if(r==='parry'){ M.ph=2; M.hit=0; Game.dmgNums.push({x:Player.x,y:Player.y+3,z:Player.z,n:'RETURN TO SENDER',t:0,big:true,col:'#ffd45a'}); yield .6; } else { M.dead=1; scene.remove(M.g); npcBoom(M.x,M.y,M.z,2); } }
NP1M.circus=function*(){ NP1.cur='circus'; twBark('nathan',"Itano circus. Do try to enjoy it.",true); np1Hint('circus','CIRCUS: get out of each LOCK ON ring before the missiles land. Then the big RED one: parry it back');
  { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*12,P.z-dz*12); } yield .3; yield* npCircus(3,4); np1Open(1.4); yield .2; };
// ---------- the storm ----------
NP1M.storm=function*(){ NP1.cur='storm'; twBark('nathan',"Funnels. All of them. Swarm.",true); np1Hint('storm','STORM: the funnels circle you. The one that turns RED fires: parry each shot');
  const n=6, bs=[], S={sp:2.2,t:0}; let par=0;
  for(let i=0;i<n;i++){ const b=nbBit(NB.x,NB.y+2,NB.z); b.a=i*6.283/n; b.h=2+(i%3)*1.1; b.hold=0; bs.push(b);
    np1Obj({bit:1,upd(dt){ if(b.gone) return false; const P2=Player; if(!b.hold) b.a+=dt*S.sp; const tx=P2.x+Math.cos(b.a)*6, tz=P2.z+Math.sin(b.a)*6, ty=P2.y+b.h+Math.sin(Game.time*3+i)*.3, k=Math.min(1,dt*9); b.x=lerp(b.x,tx,k); b.y=lerp(b.y,ty,k); b.z=lerp(b.z,tz,k); b.m.position.set(b.x,b.y,b.z); b.m.lookAt(P2.x,P2.y+1,P2.z); if(Math.random()<.5) FX.spawn(b.x,b.y,b.z,0,0,0,.2,0x3ff4ff,.14,0,true); return true; }, kill(){ if(!b.gone){ b.gone=1; nbKillBit(b); } }}); }
  yield .9;
  const fire=function*(list,tell){ for(const b of list){ b.hold=1; b.m.children.forEach(c=>{ try{ c.material.color.setHex(0xff2a3a); }catch(e){} }); } const f=list[0]; np1Glint(f.x,f.y,f.z,0xff2a3a,2.8); yield tell;
    const live=list.filter(b=>!b.gone); if(!live.length) return 'gone'; const P2=Player; for(const b of live){ np1Beam(b.x,b.y,b.z,P2.x+(P2.x-b.x)*.5,P2.y+1,P2.z+(P2.z-b.z)*.5,0xff2a3a,.13,.2); } Sound.sfx('mechshot');
    const r=np1HitRed(live.length>1?2:1.5,live[0].x,live[0].z); for(const b of live){ if(r==='parry'){ b.gone=1; nbKillBit(b); FX.burst(b.x,b.y,b.z,18,0xff8a2a,5,.3); } else { b.hold=0; b.m.children.forEach(c=>{ try{ c.material.color.setHex(0x9ff8ff); }catch(e){} }); } } return r; };
  const gaps=[.28,.12,.34,.12]; let shots=0;
  for(let i=0;i<4;i++){ const live=bs.filter(b=>!b.gone); if(!live.length) break; { const P=Player, a=rnd(0,6.283); nbBoost(P.x+Math.cos(a)*13,P.z+Math.sin(a)*13); } shots++; if((yield* fire([live[Math.floor(Math.random()*live.length)]],.42))==='parry') par++; yield gaps[i]; }
  { const live=bs.filter(b=>!b.gone); if(live.length>=2){ Game.dmgNums.push({x:Player.x,y:Player.y+2.8,z:Player.z,n:'CROSSFIRE',t:0,col:'#ff8a9a'}); shots++; if((yield* fire([live[0],live[Math.floor(live.length/2)]],.5))==='parry') par++; } }
  for(const b of bs) if(!b.gone){ b.gone=1; nbKillBit(b); }
  if(par>=shots&&shots>0){ Game.dmgNums.push({x:NB.x,y:NB.y+4.4,z:NB.z,n:'EVERY SHOT PARRIED',t:0,big:true,col:'#ffd45a'}); if(NP1.lcInv) return; /* inside the limit cut the stagger waits for the overheat */ np1Stun(2.4,'STORM BROKEN'); return; } if(NP1.lcInv) return; np1Open(1.3); yield .2; };
// ---------- the mirage ----------
npClone=function(x,z){ const C={x,y:NB.y,z,dead:0,t:0,red:0}; let m=null;
  try{ const src=(typeof nbhOn==='function'&&nbhOn())?NBH.cv:NBS.cv, cv=document.createElement('canvas'); cv.width=src.width; cv.height=src.height; cv.getContext('2d').drawImage(src,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false;
    m=new THREE.Mesh(NB.mesh.geometry,new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:.8,color:0x7fd8ff,depthWrite:false,side:THREE.DoubleSide,fog:false})); m.userData.temp=1; scene.add(m); }catch(e){ m=null; }
  FX.burst(x,C.y+2,z,16,0x3ff4ff,5,.3); np1Obj({bit:1,upd(dt){ if(C.dead) return false; C.t+=dt; if(m){ m.position.set(C.x,C.y,C.z); m.quaternion.copy(camera.quaternion); m.material.color.setHex(C.red?0xff5a6a:0x7fd8ff); m.material.opacity=C.red?.95:.55+.3*Math.sin(C.t*30); } return true; }, kill(){ C.dead=1; if(m){ scene.remove(m); try{ m.material.map.dispose(); }catch(e){} FX.burst(C.x,C.y+2,C.z,16,C.red?0xff8a2a:0x3ff4ff,6,.3); } }}); return C; };
NP1M.mirage=function*(){ NP1.cur='mirage'; twBark('nathan',"Mirage formation. Which one is me? All of them. Sort of.",true); np1Hint('mirage','MIRAGE: each clone turns RED and rushes you in turn: parry. The real one comes last, in BLUE: blink');
  const n=3, a0=rnd(0,6.283), cl=[]; let par=0; NB.hov=1.8;
  for(let i=0;i<n;i++){ const a=a0+i*6.283/n+rnd(-.3,.3), P2=Player; nbBoost(P2.x+Math.cos(a)*9,P2.z+Math.sin(a)*9); yield .18; cl.push(npClone(NB.x,NB.z)); }
  { const P2=Player, [dx,dz]=np1Dir(); nbBoost(P2.x-dx*13,P2.z-dz*13); } yield .25;
  for(const c of cl){ if(c.dead) continue; c.red=1; np1Glint(c.x,c.y+2.4,c.z,0xff2a3a,4); Sound.tone('square',1500,600,.14,.07); yield .42;
    const sx=c.x, sz=c.z, P2=Player, ang=Math.atan2(P2.z-sz,P2.x-sx); Sound.sfx('whoosh'); for(let t=0;t<.12;t+=NP1.dt){ const u=Math.min(1,(t+NP1.dt)/.12), P3=Player; c.x=lerp(sx,P3.x-Math.cos(ang)*1.2,u); c.z=lerp(sz,P3.z-Math.sin(ang)*1.2,u); twRushTell(c,ang,1.3); FX.spawn(c.x,c.y+rnd(.5,3),c.z,0,0,0,.25,0xff5a6a,.3,0,true); yield NP1.dt; }
    const r=np1HitRed(2,c.x,c.z); if(r==='parry'){ par++; FX.burst(c.x,c.y+2,c.z,24,0xffffff,7,.3); } c.dead=1; yield .16; }
  if(par>=n){ Game.dmgNums.push({x:NB.x,y:NB.y+4.4,z:NB.z,n:'MIRAGE BROKEN',t:0,big:true,col:'#ffd45a'}); np1Stun(2.4,'MIRAGE BROKEN'); return; }
  { const P2=Player, [dx,dz]=np1Dir(); nbBoost(P2.x-dx*2.4,P2.z-dz*2.4); yield .2; }
  const r=yield* npBlue(22); if(r==='dodged'){ yield .5; return; } if(r==='hit'){ const P=Player; hurtPlayer(2,NB.x,NB.z); FX.burst(P.x,P.y+1,P.z,30,0x3a8aff,6,.35); np1Shove(7,.5,'hurt'); } np1Open(1.3); yield .2; };
// ---------- the others, without lanes or sword-spam missiles ----------
NP1M.strafe=function*(){ NP1.cur='strafe'; twBark('nathan',"Strafing run. Try to keep up.",true); np1Hint('strafe','STRAFE: he circles you. Every RED shot: parry');
  const P=Player; let a=Math.atan2(NB.z-P.z,NB.x-P.x), dir=Math.random()<.5?1:-1, par=0; NB.hov=2.2;
  for(let i=0;i<5;i++){ const a1=a+dir*rnd(1.1,1.6); for(let t=0;t<.34;t+=NP1.dt){ const u=Math.min(1,(t+NP1.dt)/.34), aa=a+(a1-a)*u, P2=Player; np1Fly(NP1.dt,P2.x+Math.cos(aa)*9,P2.z+Math.sin(aa)*9,38); if(typeof NBS!=='undefined') NBS.boostT=Math.max(NBS.boostT,.1); if(Math.random()<.5) nbAfterimage(NB.x,NB.y,NB.z); yield NP1.dt; } a=a1;
    if((yield* npBeatShot(1.5))==='parry') par++; if(i===2) dir=-dir; yield [.05,.16,.05,.22,0][i]; }
  if(par>=5){ Game.dmgNums.push({x:NB.x,y:NB.y+4.4,z:NB.z,n:'EVERY SHOT PARRIED',t:0,big:true,col:'#ffd45a'}); np1Stun(2.2,'RUN BROKEN'); return; } np1Open(1.3); yield .2; };
npTackleOnce=function*(wind){ const P=Player, ang=Math.atan2(P.z-NB.z,P.x-NB.x), ux=Math.cos(ang), uz=Math.sin(ang), sx=NB.x, sz=NB.z, L=24; np1Tell('rush'); Sound.sfx('charge');
  for(let t=0;t<wind;t+=NP1.dt){ for(let k=0;k<3;k++) FX.spawn(NB.x-ux*1.2+rnd(-.4,.4),NB.y+1.6+rnd(-.6,.6),NB.z-uz*1.2+rnd(-.4,.4),-ux*rnd(8,16),rnd(-1,1),-uz*rnd(8,16),.25,k?0x3ff4ff:0xffffff,.3,0,true); yield NP1.dt; } /* the afterburner spools up behind him: that, the red glint and the silver slash are the tell (no line on the ground) */
  Sound.sfx('qbRoar'); Sound.sfx('whoosh'); if(typeof NBS!=='undefined'){ NBS.boostT=.5; NBS.bdir=ang; } let hit=0;
  for(let t=0;t<.3;t+=NP1.dt){ const u=Math.min(1,(t+NP1.dt)/.3); NB.x=sx+ux*L*u; NB.z=sz+uz*L*u; NB.dsh=null; nbAfterimage(NB.x,NB.y,NB.z); twRushTell(NB,ang,1.4); if(typeof NBS!=='undefined') NBS.bdir=ang;
    const P2=Player; if(!hit&&Math.hypot(P2.x-NB.x,P2.z-NB.z)<2&&P2.y<NB.y+2.5){ hit=1; const r=np1HitRed(3,NB.x,NB.z); if(r==='parry'){ FX.burst(P2.x,P2.y+1.2,P2.z,40,0xffffff,8,.35); impactFrame([[1,2],[2,1]]); shake(1); Sound.sfx('crossboom'); np1Stun(2.6,'TACKLE STOPPED'); return 'parry'; } if(r==='hit') np1Shove(6,.45,'hurt'); } yield NP1.dt; }
  return hit?'hit':'miss'; };
NP1M.tackle=function*(){ NP1.cur='tackle'; twBark('nathan',"Boost tackle. Twice. Don't blink. Actually, do.",true); np1Hint('tack','TACKLE: two straight charges (RED). Parry, or step off his line');
  for(let i=0;i<2;i++){ const P=Player, [dx,dz]=np1Dir(), sd=i?(Math.random()<.5?1:-1):0; nbBoost(P.x-dx*13-dz*sd*9,P.z-dz*13+dx*sd*9); yield .3; if((yield* npTackleOnce(i?.34:.4))==='parry') return; while(NP1.seq) yield NP1.dt; yield .12; }
  np1Open(1.5); yield .2; };
NP1M.buster=function*(){ NP1.cur='buster'; twBark('nathan',"Buster cannon. Run in circles. It's funnier.",true); np1Hint('bust','BUSTER: the thin laser sight shows where it will fire. The beam sweeps after you: blink through it, jump it, or get behind him');
  { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*9,P.z-dz*9); } yield .3; yield* npBuster(3.2,1.5); np1Open(2); yield .2; };
npLCEclipse=function*(){ NP1.cur='lc'; NP1.lcInv=1; twCutin('nathan','FULL BURST','Limit Break  ·  every weapon at once','#1a8aff',1.8); twBark('nathan',"Full burst. Everything I have. Don't take it personally.",true); Sound.sfx('secret');
  try{ { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*12,P.z-dz*12); } NB.hov=4.5; yield 1.5; twBig('FULL BURST',{size:46,col:'#9ff8ff',y:UH*.24,dur:1.6,sub:'Leave every lock-on ring · parry the red · run from the beam'});
    yield* npCircus(4,4); yield .4; yield* NP1M.storm(); NP1.cur='lc'; yield .3; yield* npBuster(3.4,1.6); yield .3; }
  finally{ npLCEnd(); }
  twBark('nathan',"Heat... critical. Vent... venting...",true); for(let i=0;i<5;i++) FX.burst(NB.x,NB.y+rnd(1,3),NB.z,16,0xc8d4e0,5,.5,false); np1Stun(5,'OVERHEAT'); };
// a phase always starts with Ali free: whatever sequence the last phase ended in (a fall, a shove), he is on his feet and hittable
(function(){ const nb=npBegin; npBegin=function(n){ const r=nb.apply(this,arguments); try{ const P=Player; P.cineFly=false; P.cineAnim=null; P.inv=Math.min(P.inv,1.5); if(typeof NPX!=='undefined') NPX.fall=null; }catch(e){} return r; }; })();
