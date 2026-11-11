// =====================================================================
// NATHAN, THE NEW PHASES II AND III (Ali's road; replaces 59zc's railgun/twinfang/sweep/blinkchain/starfall and both limit cuts)
//   II  MOONLESS SKY, the machine (240): missiles (cut them down; the last, red one is parried back into him), buster
//       (a thick beam down a marked lane that sweeps after you at 1.15 rad/s: blink through, jump, or get behind him), grid (laser lanes with one gap, three
//       times, the gap moves), funnelgrab (two red funnel dives: parry = Ali throws it back), tackle (a straight boost
//       charge, parry or sidestep, a burning trail left behind) + combo and grab. Limit cut at half: FULL BURST
//       (missiles, grids, the buster with missiles), then OVERHEAT: 5s down.
//   III LAST LIGHT, on foot (260): gunkata (shots and cuts on a changing rhythm, all red), martial (three fast
//       strikes, then a blue throw; parry all three and the string breaks), pointblank (blue: blink at the last moment),
//       iai (one huge deep-red cut after a still beat), stance (don't hit him: he counters; wait and his guard drops)
//       + combo and grab. Limit cut at half: LAST ROUND (eight beats of shots and cuts, then a deep-red lunge).
//   I   220 HP. Every phase: shorter waits between moves, the ultimate charges about three times as fast, the grab's
//       tell is longer and louder (a blue Nathan, a blue line on the ground). One-hit kill works here (it skips limit cuts).
// Limit cuts never take the camera (a cut-in only). In cutscenes on this field the sprites face the camera (side shots
// used to show them edge-on).
// =====================================================================
Object.assign(NP_HP,{1:220,2:240,3:260});
NP_POOLS[2]=['missiles','buster','grid','funnelgrab','tackle','combo','grab','missiles','grid','tackle'];
NP_POOLS[3]=['gunkata','martial','pointblank','iai','stance','gunkata','martial','combo','grab','iai'];
NP_FIRST[2]=['missiles','grid','tackle','buster']; NP_FIRST[3]=['gunkata','martial','stance','iai'];
const NP_BLUE=.62; /* a blue (blink) tell: longer than the red beat */
// ---------- shared pieces ----------
// the blue beat: glued to you, lands NP_BLUE later; a blink in the last NP1_WIN is the perfect dodge. Returns 'dodged' | 'hit' | 'miss'
function* npBlue(sp){ const keep=NP1.cur; NP1.cur='grab'; np1Tell(false); if(typeof NBS!=='undefined') NBS.fixRow=4; NP1.grabLand=Game.time+NP_BLUE; NP1.lunge=1; NP1.pdDone=0; try{ np1GrabTell(); }catch(e){}
  while(Game.time<NP1.grabLand&&!NP1.pdDone){ const [gx,gz]=np1Dir(), P=Player; np1Fly(NP1.dt,P.x-gx*1.9,P.z-gz*1.9,sp||20); yield NP1.dt; }
  NP1.lunge=0; if(typeof NBS!=='undefined') NBS.fixRow=null; NP1.cur=keep; if(NP1.pdDone){ NP1.pdDone=0; return 'dodged'; }
  np1Lunge(); const P=Player; return (P.inv<=0&&!P.cineFly&&P.dash<=0)?'hit':'miss'; }
// a lane on the ground: a dark strip (warn), then it burns for dur; o.col, o.jump (true = jumpable), o.dmg, o.tick (repeat hits)
function npLane(x,z,ang,L,W,warn,dur,o){ o=o||{}; const gy=groundY(x,z), ux=Math.cos(ang), uz=Math.sin(ang), cx=x+ux*L/2, cz=z+uz*L/2, col=o.col||0x3ff4ff;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0x04101c,transparent:true,opacity:.7,depthWrite:false})), e=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.9,depthWrite:false}));
  for(const q of [m,e]){ q.rotation.x=-Math.PI/2; q.rotation.z=-ang; q.userData.temp=1; scene.add(q); } m.position.set(cx,gy+.06,cz); m.scale.set(L,W,1); e.position.set(cx,gy+.07,cz); e.scale.set(L,.1,1);
  const S={t:0,cd:0,snd:0}; return np1Obj({bit:1,S,upd(dt){ S.t+=dt; S.cd-=dt; const act=S.t>=warn; m.material.color.setHex(act?col:0x04101c); m.material.opacity=act?.8:.45+.25*(Math.floor(S.t*12)%2); e.scale.y=act?W:.1+Math.min(1,S.t/warn)*W*.92; e.material.opacity=act?.3:.9;
      if(act){ if(!S.snd){ S.snd=1; Sound.sfx('beam'); } for(let k=0;k<3;k++){ const u=rnd(0,L); FX.spawn(x+ux*u,gy+.2,z+uz*u,rnd(-.4,.4),rnd(2,5),rnd(-.4,.4),.35,k%2?col:0xffffff,.24,-1,true); }
        const P=Player, rx=P.x-x, rz=P.z-z, al=rx*ux+rz*uz, pe=Math.abs(rx*uz-rz*ux); if(S.cd<=0&&al>0&&al<L&&pe<W/2+.15&&(!o.jump||P.y<groundY(P.x,P.z)+1)&&P.inv<=0&&P.dash<=0&&!P.cineFly){ S.cd=o.tick||99; hurtPlayer(o.dmg||2,x,z); } }
      return S.t<warn+dur; }, kill(){ scene.remove(m); scene.remove(e); }}); }
// a missile: homes on Ali; a sword swing or a Getsuga near it cuts it down. o.red: the parry one (np1HitRed), parried it flies back into him
function npMissile(sx,sy,sz,o){ o=o||{}; const g=new THREE.Group(), body=new THREE.Mesh(new THREE.ConeGeometry(.17,.75,6),new THREE.MeshBasicMaterial({color:o.red?0xff2a3a:0xe8eef4})); body.rotation.x=Math.PI/2; g.add(body);
  const gl=npSprite(o.red?0xff2a3a:0xffb04a,o.red?1.8:1); gl.userData.temp=0; g.add(gl); g.userData.temp=1; scene.add(g); const M={x:sx,y:sy,z:sz,vx:rnd(-3,3),vy:rnd(7,10),vz:rnd(-3,3),t:0,back:0,told:0,dead:0};
  const pop=(big,cut)=>{ FX.burst(M.x,M.y,M.z,big?30:14,o.red?0xff2a3a:0xffb04a,big?7:5,.3); FX.burst(M.x,M.y,M.z,8,0xffffff,4,.25); Sound.sfx(big?'crossboom':'hit');
    if(cut){ /* a cut missile goes off: a fireball, a ring, two halves spinning away, a short hit-stop and a camera kick; several in one swing count up */ const ch=NP1.cutT!=null&&Game.time-NP1.cutT<.5?(NP1.cutN=(NP1.cutN||1)+1):(NP1.cutN=1); NP1.cutT=Game.time;
      FX.burst(M.x,M.y,M.z,34,0xff8a2a,9,.4); FX.burst(M.x,M.y,M.z,16,0x2a2a30,5,.6,false); try{ npStar(M.x,M.y,M.z,0xffe0a0,1.8,.28); FX.ring(M.x,groundY(M.x,M.z)+.1,M.z,'#ffb04a',3.2,.35); }catch(e){}
      for(let h=0;h<2;h++){ const sg=h?1:-1; for(let k=0;k<6;k++) FX.spawn(M.x,M.y,M.z,M.vz*.25*sg+rnd(-1,1),rnd(2,5),-M.vx*.25*sg+rnd(-1,1),.6,k%2?0xe8eef4:0x8a8f98,.3,12,false); }
      Sound.sfx('crossboom'); Sound.sfx('slam'); Sound.tone('sawtooth',160,40,.25,.14); FX.hitstop=Math.max(FX.hitstop,.045); shake(.35+Math.min(.5,ch*.08)); if(typeof TPS!=='undefined') TPS.kick=Math.max(TPS.kick||0,.25); FX.flash=Math.max(FX.flash,.18); grade.uniforms.flashCol.value.set(1,.8,.5);
      Game.dmgNums.push({x:M.x,y:M.y+.6,z:M.z,n:ch>1?'CUT ×'+ch:'CUT',t:0,big:ch>=3,col:'#ffd27a'}); try{ addSP(.5); if(ch===4) npPosture(8,'missiles'); }catch(e){} } };
  np1Obj({bit:1,upd(dt){ if(M.dead) return false; M.t+=dt; const P=Player, tx=M.back?NB.x:P.x, ty=M.back?NB.y+2:P.y+1.1, tz=M.back?NB.z:P.z, dx=tx-M.x, dy=ty-M.y, dz=tz-M.z, d=Math.hypot(dx,dy,dz)||1, sp=M.back?28:(o.sp||9.5)+M.t*1.8, k=Math.min(1,dt*(M.back?14:M.t<.45?1:4.4));
      M.vx=lerp(M.vx,dx/d*sp,k); M.vy=lerp(M.vy,dy/d*sp,k); M.vz=lerp(M.vz,dz/d*sp,k); M.x+=M.vx*dt; M.z+=M.vz*dt; M.y=Math.max(groundY(M.x,M.z)+.3,M.y+M.vy*dt); g.position.set(M.x,M.y,M.z); g.lookAt(M.x+M.vx,M.y+M.vy,M.z+M.vz);
      if(Math.random()<.8) FX.spawn(M.x,M.y,M.z,0,0,0,.3,o.red?0xff5a4a:0xffd27a,.16,0,true);
      if(M.back){ if(d<1.7){ pop(true); shake(.5); NB.flash=.3; nbDamage(o.back||12,'np1'); try{ npPosture(15,'REFLECT'); }catch(e){} return false; } return M.t<8; }
      if(o.red){ if(!M.told&&d<6.5){ M.told=1; np1Glint(M.x,M.y,M.z,0xff2a3a,3.4); } if(d<1.5){ const r=np1HitRed(2,M.x,M.z); if(r==='parry'){ M.back=1; M.t=0; Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'RETURN TO SENDER',t:0,big:true,col:'#ffd45a'}); return true; } pop(true); return false; } return M.t<12; }
      if(Math.hypot(P.x-M.x,P.z-M.z)<2.5&&Math.abs(P.y+1-M.y)<2.6&&Game.time-(P.swingT||-9)<.15){ pop(false,true); return false; }
      for(const b of BEAMS){ if(b.ali&&b.life>0&&Math.hypot(b.x-M.x,b.z-M.z)<1.7&&Math.abs(b.y-M.y)<2.5){ pop(false,true); return false; } }
      if(d<.9){ pop(); if(P.inv<=0&&P.dash<=0&&!P.cineFly) hurtPlayer(1,M.x,M.z); return false; } return M.t<12; }, kill(){ M.dead=1; scene.remove(g); }}); return M; }
function* npVolley(n,red){ for(let i=0;i<n;i++){ const sd=i%2?1:-1, [dx,dz]=np1Dir(); npMissile(NB.x-dz*sd*1.1,NB.y+3.1,NB.z+dx*sd*1.1,{red:red&&i===n-1,sp:9+((NP1.ph||1)>=3?1:0)}); Sound.sfx('mechshot'); FX.burst(NB.x-dz*sd*1.1,NB.y+3.1,NB.z+dx*sd*1.1,8,0xffd27a,4,.25); NB.flash=.08; yield .09; } }
// the buster: a thick beam from him along the ground; the lane shows first and follows you, then the beam turns after you slowly
function* npBuster(dur,rate){ const L=34, W=2.6, S={a:Math.atan2(Player.z-NB.z,Player.x-NB.x),t:0,on:0,cd:0,done:0}, gy=()=>groundY(NB.x,NB.z);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0x04101c,transparent:true,opacity:.6,depthWrite:false})); m.rotation.x=-Math.PI/2; m.userData.temp=1; scene.add(m);
  const bm=[beamMesh(0x3ff4ff,1.1),beamMesh(0xffffff,.5)]; for(const b of bm){ b.userData.temp=1; b.visible=false; }
  np1Obj({bit:1,upd(dt){ if(S.done) return false; S.t+=dt; S.cd-=dt; const P=Player, want=Math.atan2(P.z-NB.z,P.x-NB.x); let da=want-S.a; da=Math.atan2(Math.sin(da),Math.cos(da)); S.a+=S.on?clamp(da,-rate*dt,rate*dt):da*Math.min(1,dt*8);
      const ux=Math.cos(S.a), uz=Math.sin(S.a), y=gy(); m.position.set(NB.x+ux*L/2,y+.06,NB.z+uz*L/2); m.rotation.z=-S.a; m.scale.set(L,S.on?W:W*(.3+.3*(Math.floor(S.t*12)%2)),1); m.material.color.setHex(S.on?0x3ff4ff:0x04101c); m.material.opacity=S.on?.35:.6;
      for(const b of bm){ b.visible=!!S.on; b.position.set(NB.x,NB.y+1.6,NB.z); b.lookAt(NB.x+ux*L,y+1.2,NB.z+uz*L); const j=1+Math.sin(S.t*50)*.08; b.scale.set(j,j,L); }
      if(S.on){ for(let k=0;k<4;k++){ const u=rnd(1,L); FX.spawn(NB.x+ux*u,y+rnd(.3,2),NB.z+uz*u,rnd(-1,1),rnd(1,4),rnd(-1,1),.3,k%2?0x3ff4ff:0xffffff,.26,0,true); } FX.shake=Math.max(FX.shake||0,.12);
        const rx=P.x-NB.x, rz=P.z-NB.z, al=rx*ux+rz*uz, pe=Math.abs(rx*uz-rz*ux); if(S.cd<=0&&al>.5&&al<L&&pe<W/2+.1&&P.y<groundY(P.x,P.z)+2.8&&P.inv<=0&&P.dash<=0&&!P.cineFly){ S.cd=.6; hurtPlayer(2,NB.x,NB.z); } }
      return true; }, kill(){ S.done=1; scene.remove(m); bm.forEach(b=>scene.remove(b)); }});
  try{ Sound.sfx('charge'); np1Glint(NB.x,NB.y+2.2,NB.z,0x3ff4ff,5); yield 1.05; S.on=1; Sound.sfx('beam'); Sound.sfx('crossboom'); shake(.6); if(typeof NBS!=='undefined') NBS.fixRow=13; for(let t=0;t<dur;t+=NP1.dt) yield NP1.dt; }
  finally{ S.done=1; if(typeof NBS!=='undefined'&&NBS.fixRow===13) NBS.fixRow=null; } }
// a grid volley: lanes across your spot along his line to you, one open; n volleys, the gap moves
function* npGrid(n,warn){ for(let v=0;v<n;v++){ const P=Player, [dx,dz]=np1Dir(), ang=Math.atan2(dz,dx), px=-dz, pz=dx, lanes=7, W=2.3, gap=Math.floor(Math.random()*5)+1, ox=P.x-dx*14, oz=P.z-dz*14;
    for(let i=0;i<lanes;i++){ if(i===gap) continue; const off=(i-(lanes-1)/2)*W; npLane(ox+px*off,oz+pz*off,ang,28,W-.25,warn,.5,{dmg:2}); } Sound.sfx('charge'); Game.dmgNums.push({x:P.x,y:P.y+2.8,z:P.z,n:'FIND THE GAP',t:0,col:'#9ff8ff'}); yield warn+.55; } }
// ---------- PHASE II MOVES ----------
NP1M.missiles=function*(){ NP1.cur='missiles'; twBark('nathan',"Missiles away. Cut them, if your arm is fast enough.",true); np1Hint('miss','MISSILES: cut them out of the air with your sword. The RED one: parry it back into him');
  { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*11,P.z-dz*11); } NB.hov=Math.max(NB.hov||1.4,3); yield .4; yield* npVolley(7,false); yield .7; yield* npVolley(7,false); yield .6; yield* npVolley(5,true); yield 3; np1Open(1); yield .3; };
NP1M.buster=function*(){ NP1.cur='buster'; twBark('nathan',"Buster cannon. Run in circles. It's funnier.",true); np1Hint('bust','BUSTER: the beam sweeps after you. Blink through it, jump it, or get in close and behind him');
  { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*9,P.z-dz*9); } yield .4; yield* npBuster(3.4,1.15); np1Open(1.6); yield .3; };
NP1M.grid=function*(){ NP1.cur='grid'; twBark('nathan',"Funnel grid. One gap. Find it.",true); np1Hint('grid','GRID: dark lanes are about to burn. Stand in the one lane that is not marked');
  { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*12,P.z-dz*12); } yield .35; yield* npGrid(3,1.05); np1Open(1); yield .3; };
NP1M.funnelgrab=function*(){ NP1.cur='funnelgrab'; twBark('nathan',"Funnels. Fetch.",true); np1Hint('fgrab','RED funnel dives: parry one and Ali throws it back');
  for(let i=0;i<2;i++){ const P=Player, b=nbBit(NB.x,NB.y+2.4,NB.z), a=rnd(0,6.28); b.x=P.x+Math.cos(a)*7; b.z=P.z+Math.sin(a)*7; b.y=P.y+5; const S={on:1};
    np1Obj({bit:1,upd(){ if(!S.on||b.gone) return false; b.m.position.set(b.x,b.y,b.z); b.m.lookAt(Player.x,Player.y+1,Player.z); return true; }, kill(){ if(!b.gone){ b.gone=1; nbKillBit(b); } }});
    yield .45; b.m.children.forEach(c=>{ try{ c.material.color.setHex(0xff2a3a); }catch(e){} }); np1Glint(b.x,b.y,b.z,0xff2a3a,3.2); yield NP1_TELL-.14;
    const sx=b.x, sy=b.y, sz=b.z; for(let t=0;t<.14;t+=NP1.dt){ const u=Math.min(1,(t+NP1.dt)/.14), P2=Player; b.x=lerp(sx,P2.x,u*.9); b.y=lerp(sy,P2.y+1,u*.9); b.z=lerp(sz,P2.z,u*.9); twRushTell(b,Math.atan2(P2.z-sz,P2.x-sx)); yield NP1.dt; }
    const r=np1HitRed(2,b.x,b.z); S.on=0;
    if(r==='parry'&&!b.gone){ Game.dmgNums.push({x:Player.x,y:Player.y+3,z:Player.z,n:'CAUGHT IT',t:0,big:true,col:'#ffd45a'}); const fx=b.x, fy=b.y, fz=b.z; for(let t=0;t<.2;t+=NP1.dt){ const u=Math.min(1,(t+NP1.dt)/.2); b.x=lerp(fx,NB.x,u); b.y=lerp(fy,NB.y+2,u); b.z=lerp(fz,NB.z,u); b.m.position.set(b.x,b.y,b.z); FX.spawn(b.x,b.y,b.z,0,0,0,.25,0xffd23a,.3,0,true); yield NP1.dt; }
      b.gone=1; nbKillBit(b); FX.burst(NB.x,NB.y+2,NB.z,40,0xffd23a,7,.35); Sound.sfx('crossboom'); impactFrame([[2,1],[1,1]]); nbDamage(10,'np1'); np1Stun(2.2,'FUNNEL RETURNED'); return; }
    if(!b.gone){ b.gone=1; nbKillBit(b); } yield i?.3:.25; }
  yield .3; };
NP1M.tackle=function*(){ NP1.cur='tackle'; twBark('nathan',"Boost tackle. Don't blink. Actually, do.",true); np1Hint('tack','TACKLE: a straight charge. Parry it, or step off the line (the trail burns)');
  { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*14,P.z-dz*14); yield .4; }
  const P=Player, ang=Math.atan2(P.z-NB.z,P.x-NB.x), ux=Math.cos(ang), uz=Math.sin(ang), sx=NB.x, sz=NB.z, L=24; FX.line(sx,sz,ang,L,2.2,0xff2a3a,.75); np1Tell('rush'); Sound.sfx('charge'); yield .5;
  Sound.sfx('qbRoar'); Sound.sfx('whoosh'); if(typeof NBS!=='undefined'){ NBS.boostT=.5; NBS.bdir=ang; } let hit=0;
  for(let t=0;t<.34;t+=NP1.dt){ const u=Math.min(1,(t+NP1.dt)/.34); NB.x=sx+ux*L*u; NB.z=sz+uz*L*u; NB.dsh=null; nbAfterimage(NB.x,NB.y,NB.z); twRushTell(NB,ang,1.4); if(typeof NBS!=='undefined') NBS.bdir=ang;
    const P2=Player; if(!hit&&Math.hypot(P2.x-NB.x,P2.z-NB.z)<2&&P2.y<NB.y+2.5){ hit=1; const r=np1HitRed(3,NB.x,NB.z); if(r==='parry'){ FX.burst(P2.x,P2.y+1.2,P2.z,40,0xffffff,8,.35); impactFrame([[1,2],[3,1]]); shake(1); Sound.sfx('crossboom'); np1Stun(2.6,'TACKLE STOPPED'); return; } if(r==='hit') np1Shove(6,.45,'hurt'); } yield NP1.dt; }
  npLane(sx,sz,ang,L,1.5,0,3,{col:0xff7a2a,dmg:1,tick:.7,jump:true}); np1Open(1.3); yield .3; };
// ---------- PHASE III MOVES (on foot) ----------
function npShot(dmg){ const P=Player, [dx,dz]=np1Dir(), hx=NB.x+dx*.9, hy=NB.y+2, hz=NB.z+dz*.9; np1Beam(hx,hy,hz,P.x+(P.x-hx)*.5,P.y+1.1,P.z+(P.z-hz)*.5,0xffd23a,.09,.14); FX.burst(hx,hy,hz,12,0xffd27a,6,.2); Sound.sfx('mechshot'); shake(.2); return np1HitRed(dmg,NB.x,NB.z); }
function* npBeatShot(dmg){ const [dx,dz]=np1Dir(); np1Glint(NB.x+dx*.9,NB.y+2,NB.z+dz*.9,0xff2a3a,3.6); np1Tell(true); if(typeof NBS!=='undefined') NBS.fixRow=13; yield NP1_TELL; if(typeof NBS!=='undefined') NBS.fixRow=null; return npShot(dmg); }
function* npBeatCut(dmg,tell){ np1Tell(true); if(typeof nbsSlash==='function') nbsSlash((tell||NP1_TELL)*2,0); yield* np1Glue(tell||NP1_TELL); Sound.sfx('swing'); np1Lunge(); return np1HitRed(dmg,NB.x,NB.z); }
NP1M.gunkata=function*(){ NP1.cur='gunkata'; twBark('nathan',"Gun kata. One bullet, one cut. Keep count.",true); np1Hint('kata','GUN KATA: shots and cuts are both RED. Parry every one: the rhythm changes');
  let par=0; const n=5; for(let i=0;i<n;i++){ const P=Player, shot=i%2===0?Math.random()<.7:Math.random()<.3, a=Math.atan2(NB.z-P.z,NB.x-P.x)+rnd(-1.2,1.2), r=shot?rnd(5,7):2.2; nbBoost(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r); yield .2;
    const res=shot?(yield* npBeatShot(1.5)):(yield* npBeatCut(2)); if(res==='parry') par++; yield [.12,.3,.18,.4,.15][i%5]; }
  if(par>=n){ Game.dmgNums.push({x:NB.x,y:NB.y+4.4,z:NB.z,n:'EVERY ROUND PARRIED',t:0,big:true,col:'#ffd45a'}); np1Stun(2.4,'OUT OF RHYTHM'); return; } np1Open(1.2); yield .3; };
NP1M.martial=function*(){ NP1.cur='martial'; twBark('nathan',"Hands, then. And feet. Mostly feet.",true); np1Hint('mart','MARTIAL ARTS: three fast RED strikes, then a BLUE throw: parry, parry, parry, BLINK');
  let par=0; for(let i=0;i<3;i++){ const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*1.8,P.z-dz*1.8); const res=yield* npBeatCut(1.5,.32); if(res==='parry'){ par++; FX.burst(NB.x,NB.y+1.6,NB.z,10,0xffffff,4,.2); } yield .1; }
  if(par>=3){ np1Stun(2.4,'STRING BROKEN'); return; }
  const r=yield* npBlue(22); if(r==='dodged'){ yield .5; return; } if(r==='hit'){ const P=Player; hurtPlayer(2,NB.x,NB.z); Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'THROWN',t:0,col:'#9fd0ff'}); FX.burst(P.x,P.y+1,P.z,30,0x3a8aff,6,.35); np1Shove(7,.5,'hurt'); }
  np1Open(1.2); yield .3; };
NP1M.pointblank=function*(){ NP1.cur='pointblank'; twBark('nathan',"Point blank. Say something clever. Quickly.",true); np1Hint('pb','POINT BLANK (BLUE): blink at the last moment, then counter');
  { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*2.2,P.z-dz*2.2); yield .22; }
  const r=yield* npBlue(24); if(r==='dodged'){ yield .5; return; } const P=Player, [dx,dz]=np1Dir(); FX.burst(NB.x+dx*.9,NB.y+2,NB.z+dz*.9,24,0xffd27a,8,.3); Sound.sfx('mechshot'); Sound.sfx('crossboom'); shake(.6);
  if(r==='hit'){ hurtPlayer(3,NB.x,NB.z); np1Shove(6,.45,'hurt'); } else Game.dmgNums.push({x:NB.x,y:NB.y+4,z:NB.z,n:'MISSED',t:0,col:'#9fd0ff'}); np1Open(1.5); yield .3; };
NP1M.iai=function*(){ NP1.cur='iai'; twBark('nathan',"...One cut.",true); np1Hint('iai','IAI: a still beat, then one DEEP RED cut. Parry it: it leaves him wide open');
  { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*7,P.z-dz*7); yield .35; } if(typeof NBS!=='undefined') NBS.fixRow=2; const g=grade.uniforms, s0=g.sat?g.sat.value:null; if(g.sat) g.sat.value=.25; Sound.sfx('heartbeat'); Game.slowT=Math.max(Game.slowT||0,.25);
  try{ const P=Player; FX.line(NB.x,NB.z,Math.atan2(P.z-NB.z,P.x-NB.x),Math.hypot(P.x-NB.x,P.z-NB.z)+4,.5,0xffffff,1); yield 1; np1Tell('deep'); yield NP1_TELL-.1;
    const sx=NB.x, sz=NB.z; Sound.sfx('whoosh'); for(let t=0;t<.1;t+=NP1.dt){ const u=Math.min(1,(t+NP1.dt)/.1), P2=Player, [dx,dz]=np1Dir(); NB.x=lerp(sx,P2.x-dx*1.6,u); NB.z=lerp(sz,P2.z-dz*1.6,u); NB.dsh=null; nbAfterimage(NB.x,NB.y,NB.z); twRushTell(NB,Math.atan2(P2.z-sz,P2.x-sx),1.5); yield NP1.dt; }
    if(typeof nbsSlash==='function'){ NBS.fixRow=null; nbsSlash(.3,.4); } Sound.sfx('swing'); Sound.sfx('crossboom'); JC.flash=.6; const P3=Player; twGash({life:.7,rev:.04,fade:.25,w:34,sparks:30,blue:1,pts:()=>twArcPts(P3.x,P3.y+1.3,P3.z,Math.cos(rnd(0,6.28)),0,3,-1.2,1.2,7)});
    const r=np1HitRed(4,NB.x,NB.z); if(r==='parry'){ impactFrame([[1,2],[3,2],[2,1]]); FX.hitstop=Math.max(FX.hitstop,.18); shake(1.1); Game.dmgNums.push({x:P3.x,y:P3.y+3.4,z:P3.z,n:'IAI PARRIED',t:0,big:true,col:'#ffd45a'}); try{ npPosture(30,'IAI'); }catch(e){} np1Open(2.6); }
    else { if(r==='hit') np1Shove(7,.5,'hurt'); np1Open(1.2); } }
  finally{ if(g.sat&&s0!=null) g.sat.value=s0; if(typeof NBS!=='undefined'&&NBS.fixRow===2) NBS.fixRow=null; }
  yield .3; };
NP1M.stance=function*(){ NP1.cur='stance'; twBark('nathan',"Come on, then. Hit me.",true); np1Hint('stance','COUNTER STANCE (gold ring): do NOT hit him. Wait: his guard drops');
  NP1.stance=Game.time+3; NP1.stanceHit=0; if(typeof NBS!=='undefined') NBS.fixRow=2; const ring=new THREE.Mesh(new THREE.RingGeometry(1.5,1.7,40),new THREE.MeshBasicMaterial({color:0xffd23a,transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.userData.temp=1; scene.add(ring);
  Game.dmgNums.push({x:NB.x,y:NB.y+4.4,z:NB.z,n:'COUNTER STANCE',t:0,big:true,col:'#ffd23a'});
  try{ for(let t=0;t<3&&!NP1.stanceHit;t+=NP1.dt){ ring.position.set(NB.x,groundY(NB.x,NB.z)+.08,NB.z); ring.scale.setScalar(1+.12*Math.sin(t*10)); yield NP1.dt; } }
  finally{ scene.remove(ring); NP1.stance=0; if(typeof NBS!=='undefined'&&NBS.fixRow===2) NBS.fixRow=null; }
  if(NP1.stanceHit){ NP1.stanceHit=0; const P=Player; twBark('nathan',"Predictable.",true); if(typeof nbsSlash==='function') nbsSlash(.25,.4); Sound.sfx('slam'); impactFrame([[2,1],[1,1]]); shake(.7); FX.burst(P.x,P.y+1.2,P.z,30,0xffd23a,7,.3); Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'COUNTERED',t:0,big:true,col:'#ffd23a'}); if(!P.cineFly){ P.inv=0; hurtPlayer(2,NB.x,NB.z); np1Shove(7,.45,'hurt'); } yield .6; return; }
  Game.dmgNums.push({x:NB.x,y:NB.y+4.4,z:NB.z,n:'GUARD DROPPED',t:0,big:true,col:'#ffffff'}); np1Open(2); yield .3; };
// ---------- LIMIT CUTS (no camera takeover) ----------
npLCEclipse=function*(){ NP1.cur='lc'; NP1.lcInv=1; twCutin('nathan','FULL BURST','Limit Break  ·  every weapon at once','#1a8aff',1.8); twBark('nathan',"Full burst. Everything I have. Don't take it personally.",true); Sound.sfx('secret');
  try{ { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*12,P.z-dz*12); } NB.hov=4; yield 1.5; twBig('FULL BURST',{size:46,col:'#9ff8ff',y:UH*.24,dur:1.6,sub:'Cut the missiles · find the gap · run from the beam'});
    yield* npVolley(9,false); yield .5; yield* npVolley(9,true); yield 2.6; yield* npGrid(3,.85); yield* npVolley(8,false); yield .5; yield* npBuster(3.6,1.3); yield .3; }
  finally{ npLCEnd(); }
  twBark('nathan',"Heat... critical. Vent... venting...",true); for(let i=0;i<5;i++) FX.burst(NB.x,NB.y+rnd(1,3),NB.z,16,0xc8d4e0,5,.5,false); np1Stun(5,'OVERHEAT'); };
npLCSuns=function*(){ NP1.cur='lc'; NP1.lcInv=1; twCutin('nathan','LAST ROUND','Limit Break  ·  eight beats and a blade','#ff3a1a',1.8); twBark('nathan',"Last magazine. Last round. Last dance, Ali.",true); Sound.sfx('secret');
  try{ yield 1.5; twBig('LAST ROUND',{size:46,col:'#ffb02a',y:UH*.24,dur:1.6,sub:'Eight RED beats: parry every shot and every cut'}); let par=0;
    for(let i=0;i<8;i++){ const P=Player, shot=Math.random()<.5, a=Math.atan2(NB.z-P.z,NB.x-P.x)+(i%2?1:-1)*rnd(.8,1.5), r=shot?rnd(4.5,6.5):2.2; nbBoost(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r); yield .16;
      const res=shot?(yield* npBeatShot(1.5)):(yield* npBeatCut(2,.38)); if(res==='parry') par++; yield .12; }
    twBark('nathan',"And the blade!",true); { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*6,P.z-dz*6); yield .3; } np1Tell('deep');
    for(let t=0;t<NP1_TELL;t+=NP1.dt){ const P4=Player, [ex,ez]=np1Dir(); np1Fly(NP1.dt,P4.x-ex*1.8,P4.z-ez*1.8,22); twRushTell(NB,Math.atan2(P4.z-NB.z,P4.x-NB.x)); yield NP1.dt; }
    Sound.sfx('swing'); np1Lunge(); NP1.lcInv=0; const r=np1HitRed(3,NB.x,NB.z);
    if(r==='parry'){ if(par>=8) Game.dmgNums.push({x:NB.x,y:NB.y+4.6,z:NB.z,n:'PERFECT ROUND',t:0,big:true,col:'#ffd45a'}); npLCEnd(); np1Auto5(); return; } if(r==='hit') np1Shove(6,.45,'hurt'); }
  finally{ npLCEnd(); }
  np1Stun(3,'EMPTY'); };
// ---------- systems ----------
// the stance: Ali's sword on a guarding Nathan is the trigger, not damage
(function(){ const nd=nbDamage; nbDamage=function(d,ult){ try{ if(tpsFight()&&NP1.live&&NP1.stance>Game.time&&!NP1.stanceHit&&(NP1.melee||!ult)){ NP1.stanceHit=1; FX.spark(NB.x,NB.y+2,NB.z); Sound.sfx('block'); return; } }catch(e){} return nd.apply(this,arguments); }; })();
// the ultimate charges about three times as fast here; one-hit kill ends the phase (and skips its limit cut)
(function(){ const nd=nbDamage; nbDamage=function(d,ult){ if(tpsFight()&&NP1.live&&!NP1.done&&NB&&NB.alive&&TW.otk&&!TW._ally&&!Game.script&&!NB.inv){ NP1.lcInv=0; NP1.lcDone=1; NP1.lcPend=0; NP1.stance=0; NP1.hp=0; np1Down(); return; }
    const h0=tpsFight()&&NP1.live?NP1.hp:null, r=nd.apply(this,arguments); try{ if(h0!=null&&NP1.hp<h0&&!ult) addSP(.36); }catch(e){} return r; }; })();
(function(){ const mp=twMeleeParry; twMeleeParry=function(){ const r=mp.apply(this,arguments); try{ if(typeof npOn==='function'&&npOn()) addSP(1); }catch(e){} return r; }; })();
// phase III is on foot: no drifting up between moves
(function(){ const nu=np1Update; np1Update=function(dt){ const r=nu.apply(this,arguments); try{ if(typeof npOn==='function'&&npOn()&&(NP1.ph||1)>=3&&!NP1.seq&&NP1.alt==null&&!NP1.done){ NP1.hovT=.25; NP1.hovC=9; NB.hov=lerp(NB.hov,.25,Math.min(1,dt*6)); } }catch(e){} return r; }; })();
// the gold circles of 59zf are gone (not readable enough); only the shorter waits stay, in every phase
NPR.cd=[0,.6,.45,.3];
nprTick=function(dt){ if(!(typeof npOn==='function'&&npOn())||NP1.done||!NB||!NB.alive||NB.inv||NP1.seq||NP1.lcInv||NP1.cur==='lc'||NP1.ex||NP1.stunT>0||Game.script) return; const ph=NP1.ph||1; if(!NP1.gen&&NP1.cd>NPR.cd[ph]&&NP1.cd<50) NP1.cd=NPR.cd[ph]; };
// the grab's tell, louder: he goes blue, a blue line runs from him to you
(function(){ const gt=np1GrabTell; np1GrabTell=function(){ const r=gt.apply(this,arguments); try{ const P=Player, c0=(NP1.ph||1)>=3?0xffb4b0:(NP1.ph||1)===2?0xdfe8ff:0xffffff; if(NB.mat) NB.mat.color.setHex(0x5a9aff); FX.line(NB.x,NB.z,Math.atan2(P.z-NB.z,P.x-NB.x),Math.hypot(P.x-NB.x,P.z-NB.z),1.1,0x3a8aff,NP_BLUE); Game.slowT=Math.max(Game.slowT||0,.12);
      np1Obj({upd(){ if(NP1.lunge&&!NP1.pdDone&&Game.time<NP1.grabLand+.05) return true; try{ if(NB.mat) NB.mat.color.setHex(c0); }catch(e){} return false; }, kill(){ try{ if(NB&&NB.mat) NB.mat.color.setHex(c0); }catch(e){} }}); }catch(e){ console.error('grab tell 2',e); } return r; }; })();
// in cutscenes on this field every sprite faces the camera (they only did during play: side shots showed them edge-on)
(function(){ const uc=updateCamera; updateCamera=function(dt){ const r=uc.apply(this,arguments); try{ if(typeof tpsFight==='function'&&tpsFight()&&Cam.cine&&!NP1.cam){ for(const s of SPRITES) if(s&&s.mesh) s.mesh.quaternion.copy(camera.quaternion); if(NB&&NB.mesh){ NB.mesh.quaternion.copy(camera.quaternion); NB.mesh.scale.x=1; } } }catch(e){ console.error('cine billboard',e); } return r; }; })();
// ---------- v1.65 ----------
// his blue tears never throw the pink Judgement Cut sparks (those are Ali's)
(function(){ const tg=twGash; twGash=function(o){ const r=tg.apply(this,arguments); try{ if(o&&o.blue) o.sparked=1; }catch(e){} return r; }; })();
// a red strike's parry window is never wider than the back half of its own tell: with a short tell (the funnels' 0.32-0.45s)
// the 0.3s window covered nearly all of it, so swinging at Nathan through the move parried every shot by accident
(function(){ const hr=np1HitRed; np1HitRed=function(dmg,fx,fz,onParry){ const P=Player, dx=fx-P.x, dz=fz-P.z, d=Math.hypot(dx,dz)||1, el=NP1.tellT!=null?Game.time-NP1.tellT:9, win=Math.max(.14,Math.min(NP1_WIN,el*.5));
    return twHitP(dmg,P.x+dx/d*1.2,P.z+dz/d*1.2,{melee:true,win,onParry}); }; })();
