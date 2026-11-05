// =====================================================================
// NATHAN, PHASES II AND III (Ali's road, the third-person fight). Phase I (59v-59z) now hands over instead of ending:
//   I   (350)  the foundation: combo, bits, cage, meteor, grab, Starbreaker
//   II  (420)  MOONLESS SKY: he purges his armour. Railgun (parry = reflect), Twin Fang (two afterimage clones), Moon Sweep
//              (a gold blade round the field: JUMP), plus phase I. Limit cut at 50%: LUNAR ECLIPSE (six clones through you
//              on a beat, then his DEEP RED: parry it = the five-clash flurry)
//   III (480)  LAST LIGHT: limiter off, red-hot. Blink Chain (red = parry, blue = blink, mixed), Starfall (gold circles:
//              MOVE), plus the rest. Limit cut at 50%: TEN THOUSAND SUNS (funnels + starfall from the sky, then LAST LIGHT,
//              a blue dive: blink at the last moment)
//   at 0 in III: the base finale (nbFinale)
// Colour language as phase I: RED = parry or blink, BLUE = blink at the last moment, GOLD = jump / move (not parryable).
// Cutscenes between phases are scripts (say/wait/cineTo); limit cuts and moves are NP1 generators (seconds).
// A death retries the current phase (NP1.ckPh); a fresh fight (nbMake) starts at phase I.
// Ali's ultimate here is its own 3D cinematic (npUlt): it orbits Nathan instead of the 2D screen-centred version.
// =====================================================================
const NP_HP={1:350,2:420,3:480};
const NP_POOLS={1:NP1_POOL.slice(),
  2:['combo','railgun','twinfang','grab','sweep','meteor','railgun','twinfang','bits','excal','sweep'],
  3:['blinkchain','railgun','twinfang','starfall','sweep','combo','blinkchain','grab','meteor','excal','starfall']};
const NP_FIRST={1:NP1_FIRST.slice(),2:['railgun','twinfang','sweep'],3:['blinkchain','starfall']};
const NP_LOOK={1:null,2:{tint:[.78,.84,1.1],sat:.85},3:{tint:[1.12,.84,.8],sat:1.05}};
function npPh(){ return NP1.ph||1; }
// switch to phase n (pools, HP, look); fresh=true also resets the limit cut
function npSetPhase(n,fresh){ NP1.ph=n; NP1.ckPh=n; NP1_POOL.length=0; NP1_POOL.push(...NP_POOLS[n]); NP1.max=NP_HP[n]; NP1.hp=NP1.max; NP1.order=NP_FIRST[n].slice(); if(fresh!==false) NP1.lcDone=0; NP1.lcPend=0; NP1.lcInv=0;
  try{ const g=grade.uniforms, Lk=NP_LOOK[n]; if(Lk){ g.tint.value.set(...Lk.tint); if(g.sat) g.sat.value=Lk.sat; } else if(typeof applyLook==='function'&&L&&L.look) applyLook(L.look); }catch(e){}
  if(NB){ NB.red=n>=3?1:0; try{ if(NB.mat) NB.mat.color.setHex(n>=3?0xffb4b0:n===2?0xdfe8ff:0xffffff); }catch(e){} } }
// a new fight starts at phase I; np1Start (also after a death) resumes the checkpoint phase
(function(){ const nm=nbMake; nbMake=function(){ NP1.ckPh=1; NP1.ph=1; NP1_POOL.length=0; NP1_POOL.push(...NP_POOLS[1]); NP1.max=NP_HP[1]; return nm.apply(this,arguments); }; })();
(function(){ const ns=np1Start; np1Start=function(){ const n=NP1.ckPh||1; NP1.max=NP_HP[n]; const r=ns.apply(this,arguments); npSetPhase(n,true); return r; }; })();

// ---------- the clones (Twin Fang, Lunar Eclipse): a copy of his sprite, its own little canvas, facing like he does ----------
function npClone(x,z,col){ const W=NBS.CW, H=NBS.CH, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d'); if(c) c.imageSmoothingEnabled=false;
  const tex=new THREE.CanvasTexture(cv); tex.magFilter=tex.minFilter=THREE.NearestFilter; tex.generateMipmaps=false;
  const geo=NBS.geo||(()=>{ const k=4.4/110, g=new THREE.PlaneGeometry(W*k,H*k); g.translate(0,H*k/2-29*k,0); return g; })();
  const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.3,depthWrite:false,color:col||0x8ff4ff,side:THREE.DoubleSide,fog:false})); m.userData.temp=1; scene.add(m);
  const gl=twGlow(col||0x3ff4ff,3.2); gl.userData.temp=1; gl.material.opacity=.35;
  const o={m,gl,x,z,y:groundY(x,z)+1.2,row:15,face:null,key:'',a:1,
    place(){ m.position.set(o.x,o.y,o.z); m.quaternion.copy(camera.quaternion); gl.position.set(o.x,o.y+1.8,o.z); m.material.opacity=o.a; gl.material.opacity=.35*o.a;
      if(!(NBS.ok&&NBS.img&&c)) return; const cp=camera.position, P=Player, a=o.face!=null?o.face:Math.atan2(P.z-o.z,P.x-o.x), ca=Math.atan2(cp.z-o.z,cp.x-o.x), d=((Math.round(-(a-ca)/(Math.PI/4))%8)+8)%8, key=d+','+o.row;
      if(key!==o.key){ o.key=key; c.clearRect(0,0,W,H); c.drawImage(NBS.img,d*W,o.row*H,W,H,0,0,W,H); tex.needsUpdate=true; } },
    kill(){ scene.remove(m); scene.remove(gl); try{ tex.dispose(); m.material.dispose(); }catch(e){} }};
  FX.burst(x,o.y+1.6,z,22,col||0x3ff4ff,5,.35); Sound.sfx('quickboost'); return o; }
function npCloneShatter(o){ FX.burst(o.x,o.y+1.6,o.z,40,0x9ff8ff,7,.4); FX.burst(o.x,o.y+1.6,o.z,20,0xffffff,5,.3); if(typeof npShock==='function') npShock(o.x,o.y+1.4,o.z,0,1,1.4); Sound.sfx('glass'); o.kill(); o.dead=1; }
// a clone's strike: its own red tell, NP1_TELL later it dashes through you (parryable: the silver slash rides the dash)
function* npCloneStrike(o,dmg,onParry){ const P=Player; o.row=0; np1Glint(o.x,o.y+2.6,o.z,0xff2a3a,4.2); Sound.tone('square',1500,600,.14,.07);
  for(let t=0;t<NP1_TELL-.12;t+=NP1.dt){ o.face=null; o.place(); yield NP1.dt; }
  const sx=o.x, sz=o.z; o.row=4; Sound.sfx('whoosh');
  for(let t=0;t<.12;t+=NP1.dt){ const u=Math.min(1,(t+NP1.dt)/.12), P2=Player, [ux,uz]=[P2.x-sx,P2.z-sz], d=Math.hypot(ux,uz)||1; o.x=sx+ux/d*Math.max(0,d-1.3)*u; o.z=sz+uz/d*Math.max(0,d-1.3)*u; o.row=1+Math.min(11,Math.floor(u*8)); twRushTell(o,Math.atan2(uz,ux)); o.place(); yield NP1.dt; }
  Sound.sfx('swing'); const r=np1HitRed(dmg,o.x,o.z,onParry); o.row=8; o.place(); return r; }

// ---------- PHASE II/III MOVES ----------
// Railgun: he backs off and fires three rail shots; each shines red, NP1_TELL later it is instant. Parry = REFLECT (it hits him)
NP1M.railgun=function*(){ NP1.cur='railgun'; twBark('nathan',npPh()>=3?"Rail cannon. Overclocked. Try to look surprised.":"Railgun. Stand still, it's more polite.",true);
  np1Hint('rail','RAILGUN: parry ('+K('attack')+') on the flash to send the shot back into him');
  { const P=Player, [dx,dz]=np1Dir(), tx=P.x-dx*10, tz=P.z-dz*10; nbBoost(tx,tz); yield .35; }
  const n=npPh()>=3?4:3;
  for(let i=0;i<n;i++){ const P=Player, [dx,dz]=np1Dir(); Sound.sfx('charge'); const sight={on:1}, hx=()=>NB.x+dx*.8, hy=()=>NB.y+2.3, hz=()=>NB.z+dz*.8;
    // the sight: a thin red line from his barrel to you while it charges
    const s1=beamMesh(0xff2a3a,.03), s2=beamMesh(0xffffff,.012); for(const m of [s1,s2]){ m.userData.temp=1; scene.add(m); }
    np1Obj({bit:1,upd(){ if(!sight.on) return false; const P2=Player; for(const m of [s1,s2]){ m.position.set(hx(),hy(),hz()); m.lookAt(P2.x,P2.y+1.2,P2.z+1e-4); m.scale.set(1,1,Math.max(.01,Math.hypot(P2.x-hx(),P2.y+1.2-hy(),P2.z-hz()))); } return true; }, kill(){ scene.remove(s1); scene.remove(s2); }});
    yield .5; np1Glint(hx(),hy(),hz(),0xff2a3a,5); np1Tell(true); if(typeof nbsSlash==='function') NBS.fixRow=13; yield NP1_TELL; sight.on=0;
    const P2=Player, ty=P2.y+1.2; np1Beam(hx(),hy(),hz(),P2.x+(P2.x-hx())*.4,ty,P2.z+(P2.z-hz())*.4,0xff2a3a,.24,.28); Sound.sfx('mechshot'); Sound.sfx('beam'); shake(.35); if(typeof NBS!=='undefined') NBS.fixRow=null;
    const r=np1HitRed(2,NB.x,NB.z,()=>{ Game.dmgNums.push({x:P2.x,y:P2.y+3,z:P2.z,n:'REFLECTED',t:0,big:true,col:'#ffd45a'}); });
    if(r==='parry'){ np1Beam(P2.x,ty,P2.z,NB.x,NB.y+2.2,NB.z,0xffd23a,.3,.3); FX.burst(NB.x,NB.y+2.2,NB.z,40,0xffd23a,7,.35); Sound.sfx('crossboom'); impactFrame([[2,1],[1,1]]); NB.flash=.3; nbDamage(12,'np1'); try{ npPosture(12,'REFLECT'); }catch(e){} }
    yield i<n-1?.35:.5; }
  np1Open(1); yield .3; };
// Twin Fang: two afterimage clones at your sides take turns (L, R, L, R); parry all four and they shatter, he staggers
NP1M.twinfang=function*(){ NP1.cur='twinfang'; twBark('nathan',"Twin Fang. Two of me. Twice the disappointment for you.",true); np1Hint('twin','TWIN FANG: each clone flashes RED before it dashes: parry each one');
  const yaw=typeof TPS!=='undefined'&&TPS.yaw!=null?TPS.yaw:0, P=Player, rx=-Math.sin(yaw), rz=Math.cos(yaw), cl=[npClone(P.x-rx*5,P.z-rz*5), npClone(P.x+rx*5,P.z+rz*5)];
  const keep=np1Obj({bit:1,upd(){ for(const o of cl) if(!o.dead) o.place(); return cl.some(o=>!o.dead); }, kill(){ for(const o of cl) if(!o.dead){ o.kill(); o.dead=1; } }});
  let par=0; const n=npPh()>=3?6:4;
  try{ yield .5;
    for(let i=0;i<n;i++){ const o=cl[i%2]; if(o.dead) break; const P2=Player, s=i%2?1:-1, yw=typeof TPS!=='undefined'&&TPS.yaw!=null?TPS.yaw:0; o.x=P2.x+(-Math.sin(yw))*s*5; o.z=P2.z+Math.cos(yw)*s*5; o.y=groundY(o.x,o.z)+1.2; FX.burst(o.x,o.y+1.6,o.z,14,0x3ff4ff,4,.3);
      const r=yield* npCloneStrike(o,1.5,()=>{ par++; });
      if(r==='parry'){ FX.burst(o.x,o.y+1.6,o.z,24,0xffffff,5,.3); } yield npPh()>=3?.12:.22; }
    if(par>=n){ for(const o of cl) if(!o.dead) npCloneShatter(o); np1Stun(2.6,'TWIN FANG BROKEN'); return; } }
  finally{ keep.kill(); for(const o of cl) o.dead=1; }
  yield .3; };
// Moon Sweep: his blade grows into a low gold line and sweeps round him; JUMP over it (not parryable)
NP1M.sweep=function*(){ NP1.cur='sweep'; twBark('nathan',npPh()>=3?"Full moon sweep! Twice! Hop, little rabbit!":"Moon sweep. Jump, or lose your ankles.",true); np1Hint('sweep','GOLD blade = JUMP ('+K('jump')+'). It can\'t be parried');
  { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*6,P.z-dz*6); yield .35; }
  const L=17, gy=()=>groundY(NB.x,NB.z), turns=npPh()>=3?2:1; Sound.sfx('charge'); if(typeof NBS!=='undefined') NBS.fixRow=2;
  // the tell: a gold ring on the ground at its reach, JUMP
  FX.ring(NB.x,gy()+.1,NB.z,'#ffd23a',L,.9); Game.dmgNums.push({x:Player.x,y:Player.y+2.8,z:Player.z,n:'JUMP!',t:0,big:true,col:'#ffd23a'}); np1Glint(NB.x,NB.y+2.4,NB.z,0xffd23a,4); yield .55;
  const ms=[beamMesh(0x2a1a00,.3),beamMesh(0xffc23a,.2),beamMesh(0xffffff,.07)]; for(const m of ms){ m.userData.temp=1; scene.add(m); }
  const S={a:Math.atan2(Player.z-NB.z,Player.x-NB.x)+Math.PI,prev:null,dir:Math.random()<.5?1:-1,t:0,hit:0}, sp=Math.PI*2/(npPh()>=3?1.1:1.4);
  const o=np1Obj({bit:1,upd(dt){ return !S.done; }, kill(){ S.done=1; for(const m of ms) scene.remove(m); if(typeof NBS!=='undefined'&&NBS.fixRow===2) NBS.fixRow=null; }});
  try{ for(let k=0;k<turns;k++){ if(k){ S.dir=-S.dir; Sound.sfx('charge'); yield .25; } S.hit=0; let sw=0; Sound.sfx('beam'); Sound.sfx('whoosh');
      while(sw<Math.PI*2){ const dt=NP1.dt, da=sp*dt; S.prev=S.a; S.a+=S.dir*da; sw+=da; const y=gy()+.55, ux=Math.cos(S.a), uz=Math.sin(S.a);
        ms.forEach((m,i)=>{ m.position.set(NB.x,y,NB.z); m.lookAt(NB.x+ux,y,NB.z+uz); m.scale.set(1,1,L); }); FX.spawn(NB.x+ux*L*Math.random(),y,NB.z+uz*L*Math.random(),0,rnd(.5,2),0,.3,Math.random()<.5?0xffd23a:0xffffff,.3,0,true);
        const P2=Player, pa=Math.atan2(P2.z-NB.z,P2.x-NB.x), pd=Math.hypot(P2.x-NB.x,P2.z-NB.z), crossed=Math.abs(angDiff(pa,S.a))<da*1.5+.06;
        if(!S.hit&&crossed&&pd<L+.4&&P2.y-groundY(P2.x,P2.z)<1.1&&P2.inv<=0&&!P2.cineFly&&P2.dash<=0){ S.hit=1; hurtPlayer(2,NB.x,NB.z); FX.burst(P2.x,P2.y+.6,P2.z,24,0xffd23a,5,.3); }
        else if(!S.hit&&crossed&&pd<L+.4){ S.hit=1; Game.dmgNums.push({x:P2.x,y:P2.y+2.6,z:P2.z,n:'CLEAR',t:0,col:'#ffd23a'}); }
        yield dt; } } }
  finally{ S.done=1; if(typeof NBS!=='undefined') NBS.fixRow=null; for(const m of ms) scene.remove(m); }
  np1Open(1.2); yield .3; };
// Blink Chain (III): he blinks round you five times; each blink is RED (parry) or BLUE (blink at the last moment)
NP1M.blinkchain=function*(){ NP1.cur='blinkchain'; twBark('nathan',"Red or blue, wanderer. Choose wrong.",true); np1Hint('chain','BLINK CHAIN: RED = parry, BLUE = blink ('+K('dash')+') at the last moment');
  for(let i=0;i<5;i++){ const P=Player, a=rnd(0,6.283), blue=i>0&&Math.random()<.4; nbAfterimage(NB.x,NB.y,NB.z); NB.x=P.x+Math.cos(a)*2.4; NB.z=P.z+Math.sin(a)*2.4; NB.dsh=null; Sound.sfx('quickboost'); FX.burst(NB.x,NB.y+2,NB.z,14,blue?0x3a8aff:0xff2a3a,4,.3);
    if(blue){ NP1.cur='grab'; np1Tell(false); if(typeof NBS!=='undefined') NBS.fixRow=4; NP1.grabLand=Game.time+NP1_TELL; NP1.lunge=1; NP1.pdDone=0; try{ np1GrabTell(); }catch(e){}
      while(Game.time<NP1.grabLand&&!NP1.pdDone){ const [gx,gz]=np1Dir(), P4=Player; np1Fly(NP1.dt,P4.x-gx*1.9,P4.z-gz*1.9,20); yield NP1.dt; }
      NP1.lunge=0; if(typeof NBS!=='undefined') NBS.fixRow=null; if(NP1.pdDone){ NP1.pdDone=0; NP1.cur='blinkchain'; yield .5; return; } /* the perfect dodge (and its counter) take it from here */
      np1Lunge(); const P5=Player; if(P5.inv<=0&&!P5.cineFly&&P5.dash<=0){ hurtPlayer(2,NB.x,NB.z); FX.burst(P5.x,P5.y+1,P5.z,30,0x3a8aff,6,.35); Game.dmgNums.push({x:P5.x,y:P5.y+3,z:P5.z,n:'CAUGHT',t:0,col:'#9fd0ff'}); } NP1.cur='blinkchain'; }
    else { np1Tell(true); if(typeof nbsSlash==='function') nbsSlash(NP1_TELL*2,0); yield* np1Glue(NP1_TELL); Sound.sfx('swing'); np1Lunge(); np1HitRed(2,NB.x,NB.z); }
    yield .2; }
  np1Open(1.4); yield .3; };
// Starfall (III): gold circles round you, then pillars of light from the sky; MOVE out (not parryable)
function npStarCircle(x,z,r,warn){ const gy=groundY(x,z), disc=new THREE.Mesh(new THREE.CircleGeometry(r,36),new THREE.MeshBasicMaterial({color:0x1a0c00,transparent:true,opacity:.6,depthWrite:false})), rim=new THREE.Mesh(new THREE.RingGeometry(r-.12,r,36),new THREE.MeshBasicMaterial({color:0xffb02a,transparent:true,opacity:.95,depthWrite:false,side:THREE.DoubleSide}));
  for(const m of [disc,rim]){ m.rotation.x=-Math.PI/2; m.position.set(x,gy+.06,z); m.userData.temp=1; scene.add(m); } const S={t:0,fired:0};
  np1Obj({upd(dt){ S.t+=dt; const k=Math.min(1,S.t/warn); rim.scale.setScalar(1+.06*Math.sin(S.t*30)); disc.material.opacity=.35+.35*k;
      if(!S.fired&&S.t>=warn){ S.fired=1; const p=[beamMesh(0xffb02a,.7),beamMesh(0xffffff,.28)]; for(const m of p){ m.userData.temp=1; m.position.set(x,gy+30,z); m.lookAt(x,gy,z+1e-4); m.scale.set(1,1,30); scene.add(m); } S.p=p; Sound.sfx('beam'); shake(.25); FX.burst(x,gy+.4,z,26,0xffb02a,6,.35); FX.ring(x,gy+.1,z,'#ffd27a',r*1.3,.3);
        const P=Player; if(Math.hypot(P.x-x,P.z-z)<r+.2&&P.inv<=0&&!P.cineFly&&P.dash<=0) hurtPlayer(2,x,z); }
      if(S.p){ const q=Math.max(0,1-(S.t-warn)/.3); for(const m of S.p) m.scale.set(q+.01,q+.01,30); }
      return S.t<warn+.3; }, kill(){ scene.remove(disc); scene.remove(rim); if(S.p) S.p.forEach(m=>scene.remove(m)); }}); }
NP1M.starfall=function*(){ NP1.cur='starfall'; twBark('nathan',"Starfall. Wish upon one. It won't help.",true); np1Hint('star','GOLD circles = MOVE out before the light falls');
  { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*8,P.z-dz*8); } NB.hov=Math.max(NB.hov||1.4,3); yield .3;
  for(let w=0;w<3;w++){ const P=Player, n=4+w; npStarCircle(P.x,P.z,2.1,1); for(let i=1;i<n;i++){ const a=rnd(0,6.28), r=rnd(2.5,6.5); npStarCircle(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,2.1,1+i*.05); } Sound.sfx('charge'); yield 1.15; }
  yield .4; np1Open(1); };

// ---------- LIMIT CUTS (II and III), at half HP; he can't be hurt until the stun at the end ----------
// LUNAR ECLIPSE (II): six clones ring you and dash through on a beat (each RED: parry), then the real one's DEEP RED from
// above; parry it = the five-clash flurry (np1Auto5) and a long stagger; all six clones parried too = ECLIPSE BROKEN
function* npLCEclipse(){ const P=Player, gy=groundY(P.x,P.z); NP1.cur='lc'; NP1.lcInv=1; let par=0;
  // the shot: low behind Ali, up at him as he rises
  Game.letterTo=.5; const [dx,dz]=np1Dir(); NP1.cam={x:P.x+dx*6,y:gy+1.2,z:P.z+dz*6,lx:NB.x,ly:NB.y+3,lz:NB.z};
  NB.hov=5; twBark('nathan',"Lunar Eclipse. The moon goes dark... and so do you.",true); twCutin('nathan','LUNAR ECLIPSE','Limit Break  ·  six shadows, one moon','#1a4aff',1.8); Sound.sfx('void'); grade.uniforms.tint.value.set(.6,.66,1.1); yield 1.6;
  NP1.cam=null; Game.letterTo=0; twBig('PARRY EVERY SHADOW',{size:46,col:'#9ff8ff',y:UH*.24,dur:1.6,sub:'Each one flashes RED before it comes'});
  const a0=rnd(0,6.28), cl=[]; for(let i=0;i<6;i++){ const a=a0+i*6.283/6; cl.push(npClone(P.x+Math.cos(a)*7,P.z+Math.sin(a)*7)); yield .08; }
  const keep=np1Obj({bit:1,upd(){ const P2=Player; cl.forEach((o,i)=>{ if(o.dead||o.busy) return; const a=a0+i*6.283/6+Game.time*.4; o.x=lerp(o.x,P2.x+Math.cos(a)*7,.08); o.z=lerp(o.z,P2.z+Math.sin(a)*7,.08); o.y=groundY(o.x,o.z)+1.2; o.row=15+(Math.floor(Game.time*14)%6); o.place(); }); return cl.some(o=>!o.dead); }, kill(){ cl.forEach(o=>{ if(!o.dead){ o.kill(); o.dead=1; } }); }});
  try{ yield .8;
    const order=[0,3,1,4,2,5]; for(const i of order){ const o=cl[i]; if(o.dead) continue; o.busy=1; const r=yield* npCloneStrike(o,1.5,()=>{ par++; }); if(r==='parry') npCloneShatter(o); else { o.kill(); o.dead=1; } yield .28; }
    // the real one, from above: DEEP RED
    const P3=Player; twBark('nathan',"And the moon itself!",true); NB.x=P3.x-dx*2; NB.z=P3.z-dz*2; NB.hov=7; NB.dsh=null; yield .3; np1Tell('deep');
    for(let t=0;t<NP1_TELL;t+=NP1.dt){ const P4=Player, [ex,ez]=np1Dir(); NB.x=lerp(NB.x,P4.x-ex*1.8,.2); NB.z=lerp(NB.z,P4.z-ez*1.8,.2); NB.hov=lerp(7,1.4,Math.min(1,t/NP1_TELL)); twRushTell(NB,Math.atan2(P4.z-NB.z,P4.x-NB.x)); yield NP1.dt; }
    NB.hov=1.4; Sound.sfx('swing'); np1Lunge(); NP1.lcInv=0; const r=np1HitRed(3,NB.x,NB.z);
    if(r==='parry'){ if(par>=6) Game.dmgNums.push({x:NB.x,y:NB.y+4.6,z:NB.z,n:'ECLIPSE BROKEN',t:0,big:true,col:'#ffd45a'}); npLCEnd(); keep.kill(); np1Auto5(); return; }
    if(r==='hit') np1Shove(6,.45,'hurt'); }
  finally{ keep.kill(); NP1.lcInv=0; NP1.cur=null; try{ const Lk=NP_LOOK[npPh()]; if(Lk) grade.uniforms.tint.value.set(...Lk.tint); }catch(e){} }
  np1Stun(2.5,'ECLIPSE ENDS'); }
// TEN THOUSAND SUNS (III): he climbs, funnels ring the sky and fire (RED: parry or blink) while starfall circles drop
// (GOLD: move); then LAST LIGHT: a blue dive from the sky, blink at the last moment (the perfect dodge and its counter)
function* npLCSuns(){ const P=Player, gy=groundY(P.x,P.z); NP1.cur='lc'; NP1.lcInv=1;
  Game.letterTo=.5; const [dx,dz]=np1Dir(); NP1.cam={x:P.x+dx*7,y:gy+1,z:P.z+dz*7,lx:NB.x,ly:NB.y+6,lz:NB.z};
  NB.hov=9; twBark('nathan',"If I burn out, I take the sky with me. TEN THOUSAND SUNS!",true); twCutin('nathan','TEN THOUSAND SUNS','Limit Break  ·  the sky is his','#ff3a1a',1.8); Sound.sfx('secret'); grade.uniforms.tint.value.set(1.2,.78,.66); yield 1.6;
  NP1.cam=null; Game.letterTo=0; twBig('SURVIVE THE SKY',{size:46,col:'#ffb02a',y:UH*.24,dur:1.6,sub:'RED funnels: parry or blink · GOLD circles: move'});
  const bs=[], n=8; for(let i=0;i<n;i++){ const b=nbBit(NB.x,NB.y+2,NB.z); b.a=i*6.283/n; bs.push(b);
    np1Obj({bit:1,upd(dt){ if(b.gone) return false; const P2=Player; b.a+=dt*.35; const tx=P2.x+Math.cos(b.a)*8, tz=P2.z+Math.sin(b.a)*8, ty=P2.y+6; b.x=lerp(b.x,tx,Math.min(1,dt*3)); b.y=lerp(b.y,ty,Math.min(1,dt*3)); b.z=lerp(b.z,tz,Math.min(1,dt*3)); b.m.position.set(b.x,b.y,b.z); b.m.lookAt(P2.x,P2.y+1,P2.z); return true; }, kill(){ if(!b.gone){ b.gone=1; nbKillBit(b); } }}); }
  try{ yield 1;
    for(let t=0,k=0;t<9;k++){ const live=bs.filter(b=>!b.gone); if(k%3===0){ const P2=Player; npStarCircle(P2.x,P2.z,2,1.05); for(let i=0;i<2;i++){ const a=rnd(0,6.28); npStarCircle(P2.x+Math.cos(a)*rnd(3,5),P2.z+Math.sin(a)*rnd(3,5),2,1.1); } }
      if(live.length){ const b=live[k%live.length]; b.m.children.forEach(c=>c.material.color.setHex(0xff2a3a)); np1Glint(b.x,b.y,b.z,0xff2a3a,2.6); yield NP1_TELL; t+=NP1_TELL;
        if(!b.gone){ const P2=Player; np1Beam(b.x,b.y,b.z,P2.x,P2.y+1,P2.z,0xff2a3a,.14,.2); Sound.sfx('mechshot'); if(np1HitRed(1.5,b.x,b.z)==='parry'){ b.gone=1; nbKillBit(b); } else b.m.children.forEach(c=>c.material.color.setHex(0x9ff8ff)); } }
      const w=Math.max(.25,.6-k*.03); yield w; t+=w; }
    for(const b of bs) if(!b.gone){ b.gone=1; nbKillBit(b); }
    // LAST LIGHT: the blue dive
    twBark('nathan',"LAST... LIGHT!",true); const P5=Player, [ex,ez]=np1Dir(); NB.x=P5.x-ex*3; NB.z=P5.z-ez*3; NB.dsh=null; yield .4;
    NP1.cur='grab'; np1Tell(false); if(typeof NBS!=='undefined') NBS.fixRow=4; NP1.grabLand=Game.time+NP1_TELL+.15; NP1.lunge=1; NP1.pdDone=0; try{ np1GrabTell(); }catch(e){}
    while(Game.time<NP1.grabLand&&!NP1.pdDone){ const P6=Player, [gx,gz]=np1Dir(); NB.hov=lerp(NB.hov,1.4,.12); np1Fly(NP1.dt,P6.x-gx*1.9,P6.z-gz*1.9,26); twRushTell(NB,Math.atan2(P6.z-NB.z,P6.x-NB.x)); yield NP1.dt; }
    NP1.lunge=0; NB.hov=1.4; if(typeof NBS!=='undefined') NBS.fixRow=null; NP1.lcInv=0;
    if(NP1.pdDone){ NP1.pdDone=0; Game.dmgNums.push({x:NB.x,y:NB.y+4.6,z:NB.z,n:'LAST LIGHT DODGED',t:0,big:true,col:'#9fd0ff'}); NP1.cur=null; yield .2; if(!NP1.seq) np1Stun(4,'BURNT OUT'); return; }
    np1Lunge(); const P7=Player; if(P7.inv<=0&&!P7.cineFly){ hurtPlayer(4,NB.x,NB.z); FX.burst(P7.x,P7.y+1,P7.z,50,0x3a8aff,8,.4); shake(1); np1Shove(7,.5,'hurt'); } }
  finally{ for(const b of bs) if(!b.gone){ b.gone=1; nbKillBit(b); } NP1.lcInv=0; NP1.lunge=0; NP1.cur=null; try{ const Lk=NP_LOOK[npPh()]; if(Lk) grade.uniforms.tint.value.set(...Lk.tint); }catch(e){} }
  np1Stun(2.5,'BURNT OUT'); }
// the end of a limit cut, however it ends (its own finally, a stun, the flurry taking its generator): hurtable, sky back
function npLCEnd(){ NP1.lcInv=0; if(NP1.cur==='lc') NP1.cur=null; try{ const Lk=NP_LOOK[npPh()]; if(Lk){ grade.uniforms.tint.value.set(...Lk.tint); if(grade.uniforms.sat) grade.uniforms.sat.value=Lk.sat; } }catch(e){} Game.letterTo=0; if(NP1.cam&&!NP1.seq) NP1.cam=null; }
(function(){ const nu=np1Update; np1Update=function(dt){ try{ if((NP1.lcInv||NP1.cur==='lc')&&!NP1.gen&&!Game.script) npLCEnd(); }catch(e){} return nu.apply(this,arguments); }; })();
// no posture during a limit cut (a posture break there would cut the limit cut short)
(function(){ const pp=npPosture; npPosture=function(){ if(NP1.lcInv||NP1.cur==='lc') return; return pp.apply(this,arguments); }; })();
// the limit cut starts from the update (never from inside a running generator): at half HP in II/III
(function(){ const nu=np1Update; np1Update=function(dt){ try{ if(NP1.lcPend&&NP1.live&&!NP1.done&&!NP1.seq&&NB&&NB.alive&&!Game.script&&!Cam.cine){ NP1.lcPend=0; np1Clear(); NP1.stunT=0; NB.stunned=0; NP1.gen=npPh()>=3?npLCSuns():npLCEclipse(); NP1.wait=0; NP1.cd=99; } }catch(e){ console.error('np lc',e); } return nu.apply(this,arguments); }; })();
// damage: invulnerable during a limit cut (until its last strike); the trigger at half HP
(function(){ const nd=nbDamage; nbDamage=function(d,ult){ if(tpsFight()&&NP1.live&&NP1.lcInv){ if(NB) FX.spark(NB.x,NB.y+2,NB.z); return; } const r=nd.apply(this,arguments);
    try{ if(tpsFight()&&NP1.live&&!NP1.done&&npPh()>=2&&!NP1.lcDone&&NP1.hp>0&&NP1.hp<=NP1.max/2){ NP1.lcDone=1; NP1.lcPend=1; } }catch(e){} return r; }; })();

// ---------- between phases: at 0 in I and II, a cutscene and the next phase; at 0 in III, the finale ----------
(function(){ const nd=np1Down; np1Down=function(){ if(npPh()>=3) return nd.apply(this,arguments);
    const P=Player; NP1.done=1; NP1.hp=0; NP1.gen=null; NP1.stunT=0; NP1.lcInv=0; for(const o of NP1.objs){ try{ o.kill&&o.kill(); }catch(e){} } NP1.objs.length=0; try{ if(NBC) endNBClash(); }catch(e){}
    if(!NP1.seq){ P.cineFly=false; P.cineAnim=null; } NB.stunned=1; NB.dsh=null; NB.hov=.7; Sound.sfx('crossboom'); shake(1); FX.flash=.6; grade.uniforms.flashCol.value.set(1,1,1); impactFrame([[1,2],[3,2]]);
    Game.banner={name:'Phase '+['','I','II'][npPh()]+' cleared',sub:npPh()===1?'His armour is cracking':'His limiter is screaming',t:0};
    try{ if(typeof npFinisher==='function'&&!NP1.cam&&!Game.script) npFinisher(); }catch(e){}
    const next=npPh()+1; NB.pend=function*(){ yield wait(1.8); yield* (next===2?npCine12():npCine23()); }; nbPend(); }; })();
// the end of a transition: the next phase, healed, the camera back behind Ali
function npBegin(n){ const P=Player; np1Clear(); NP1.cam=null; npSetPhase(n,true); NP1.done=0; NP1.stunT=0; NP1.gen=null; NP1.wait=0; NP1.cd=1.4; NP1.last=null;
  NB.inv=false; NB.alive=true; NB.stunned=0; NB.hov=1.4; P.hp=P.maxHp; P.inv=1.2; P.cineFly=false; P.cineAnim=null; Cam.cine=null; Game.letterTo=0; Game.state='play'; try{ Sound.play('diva'); }catch(e){} }
function npShotNB(dist,side,up,ly){ const P=Player, [dx,dz]=np1Dir(), px=-dz, pz=dx, gy=groundY(NB.x,NB.z); cineSet(NB.x+dx*dist+px*side,gy+up,NB.z+dz*dist+pz*side,NB.x,gy+(ly||2.4),NB.z); }
function npShotAli(dist,side,up){ const P=Player, [dx,dz]=np1Dir(), px=-dz, pz=dx, gy=groundY(P.x,P.z); cineSet(P.x-dx*dist+px*side,gy+up,P.z-dz*dist+pz*side,P.x,gy+1.5,P.z); }
// I -> II: MOONLESS SKY. He purges his armour; the sky goes dark
function* npCine12(){ const P=Player, mi=Game.mira; NB.inv=true; Game.letterTo=1; P.inv=99; P.cineFly=false; P.cineAnim=null; NP1.cam=null; P.vx=P.vz=0;
  npShotNB(5,1.4,1.4,2.2); NB.hov=.7; yield wait(.5);
  yield say('nathan',"...Not bad, wanderer. Not bad at all.",'angry');
  npShotAli(3.4,1,1.5); yield say('ali',"Get up. We're not done.");
  npShotNB(4.2,-1.2,1.8,2.6); yield say('nathan',"I held back. The moon was watching. I have an image to maintain.");
  npShotAli(3.4,-1,1.4); yield say('ali',"The moon is broken.");
  npShotNB(4.6,1,1.6,2.6); yield say('nathan',"...Exactly. Nobody's watching now.",'angry');
  // the purge: plates burst off him, the sky goes out
  Sound.sfx('charge'); NB.hov=1.4; yield tween(NB,{hov:3.2},.8,twEIO); yield say('nathan',"Armour purge.");
  for(let i=0;i<6;i++){ FX.burst(NB.x,NB.y+rnd(1,3.5),NB.z,30,i%2?0xffffff:0xc8d4e0,8,.5,false); FX.burst(NB.x,NB.y+2.2,NB.z,20,0x3ff4ff,6,.4); Sound.sfx(i%2?'crash':'slam'); shake(.4); yield wait(.09); }
  FX.flash=.8; grade.uniforms.flashCol.value.set(.6,.8,1); impactFrame([[2,2],[1,2],[3,1]]); try{ const g=grade.uniforms; g.tint.value.set(...NP_LOOK[2].tint); if(g.sat) g.sat.value=NP_LOOK[2].sat; }catch(e){} if(NB.mat) NB.mat.color.setHex(0xdfe8ff);
  npShotAli(3.6,1.2,1.3); yield say('ali',"You took your armour off to go faster.");
  npShotNB(4,-1,1.8,3.4); yield say('nathan',"I took it off to look cooler. Going faster is a side effect.");
  if(mi){ cineSet(mi.x+1,groundY(mi.x,mi.z)+1.4,mi.z+3.4,mi.x,groundY(mi.x,mi.z)+1.2,mi.z); yield say('mira',"He's... kind of glowing. Is that allowed?!",'surprised'); }
  npShotNB(7,0,1.2,3.6); twCutin('nathan','MOONLESS SKY','Phase II  ·  the first seal breaks','#1a4aff',1.8); yield wait(1.2);
  evaCard(['PHASE II','MOONLESS SKY'],1.8,1); Sound.sfx('slam'); yield wait(1.8);
  npShotNB(5,1,1.6,3); yield say('nathan',"Let's dance in the dark, Ali.");
  npShotAli(3,-1,1.5); yield say('ali',"I don't dance.");
  npShotNB(5,-1,1.6,3); yield say('nathan',"Everyone dances when the floor is on fire.",'angry');
  yield tween(NB,{hov:1.4},.4,twEIO); npBegin(2); }
// II -> III: LAST LIGHT. The limiter screams, he goes red-hot
function* npCine23(){ const P=Player, mi=Game.mira; NB.inv=true; Game.letterTo=1; P.inv=99; P.cineFly=false; P.cineAnim=null; NP1.cam=null; P.vx=P.vz=0;
  npShotNB(5,-1.2,1.3,2.2); NB.hov=.7; yield wait(.5);
  Sound.sfx('heartbeat'); yield say('nathan',"Warning. Core temperature... critical. Limiter... still on.",'angry');
  npShotAli(3.4,1,1.5); yield say('ali',"Then turn it off.");
  npShotNB(4.2,1,1.7,2.6); yield say('nathan',"...Are you giving ME advice? In MY boss fight?",'surprised');
  npShotAli(3.2,-1,1.4); yield say('ali',"You're bad at it.");
  npShotNB(4.6,0,1.4,2.8); yield say('nathan',"Limiter release. Second seal... broken.",'angry');
  NB.hov=1.4; Sound.sfx('secret'); yield tween(NB,{hov:3.6},.7,twEIO);
  for(let i=0;i<8;i++){ FX.burst(NB.x,NB.y+2.2,NB.z,26,i%2?0xff3a1a:0xffd27a,7,.45); NB.flash=i%2?.3:0; Sound.sfx(i%2?'charge':'slam'); shake(.35); yield wait(.08); }
  FX.flash=.9; grade.uniforms.flashCol.value.set(1,.4,.2); impactFrame([[3,2],[1,2],[2,2]]); try{ const g=grade.uniforms; g.tint.value.set(...NP_LOOK[3].tint); if(g.sat) g.sat.value=NP_LOOK[3].sat; }catch(e){} NB.red=1; if(NB.mat) NB.mat.color.setHex(0xffb4b0);
  npShotAli(3.6,1.2,1.3); yield say('ali',"How many seals do you have?");
  npShotNB(4,-1,1.8,3.6); yield say('nathan',"...Three. It's a trilogy.");
  if(mi){ cineSet(mi.x+1,groundY(mi.x,mi.z)+1.4,mi.z+3.4,mi.x,groundY(mi.x,mi.z)+1.2,mi.z); yield say('mira',"Ali, he's RED now! Red is bad, right?!",'surprised'); npShotAli(3.2,-1,1.4); yield say('ali',"Red means parry."); }
  npShotNB(7,0,1.2,3.8); twCutin('nathan','LAST LIGHT','Phase III  ·  limiter released','#ff2a1a',1.8); yield wait(1.2);
  evaCard(['PHASE III','LAST LIGHT'],1.8,1); Sound.sfx('slam'); yield wait(1.8);
  npShotNB(5,1,1.6,3.2); yield say('nathan',"This is my last light, Ali. Look at it. It's the last thing you'll see.",'angry');
  npShotAli(3,1,1.5); yield say('ali',"It's bright. That's all.");
  yield tween(NB,{hov:1.4},.4,twEIO); npBegin(3); }

// ---------- ALI'S ULTIMATE, IN 3D (this fight only): THE WORLD + a cage of crescents round him, the camera orbiting ----------
// The 2D version hangs its Getsugas round the screen's centre; here time stops, Ali blinks to eight points on a sphere
// round Nathan (high and low), hangs a Jujishou at each, the camera circles; twenty cuts open round HIM on screen; time
// resumes, the cage collapses into him; then Ali drops on him from above with the final crescent. ~15% of the phase's HP.
function npUltOk(){ return tpsFight()&&NP1.live&&!NP1.done&&NB&&NB.alive&&!NB.inv; }
function* npUlt(){ const P=Player; P.sp=0; P.inv=99; P.hp=P.maxHp; Game.dmgNums.push({x:P.x,y:P.y+2.6,z:P.z,n:'FULL HP',t:0,big:true,col:'#8affb0'}); Sound.sfx('heart'); P.atk=null; P.aliAtk=null; P.charge=0; P.vx=P.vz=P.vy=0;
  np1Clear(); NP1.gen=null; NP1.stunT=Math.max(NP1.stunT,9); NB.stunned=1; NB.dsh=null; const cx=NB.x, cz=NB.z, cy=NB.y+2, ox=P.x, oz=P.z, oy=P.y, a0=Math.atan2(oz-cz,ox-cx);
  const cam=(a,r,h,ly)=>{ NP1.cam={x:cx+Math.cos(a)*r,y:groundY(cx,cz)+h,z:cz+Math.sin(a)*r,lx:cx,ly:ly!=null?ly:cy,lz:cz}; };
  Game.letterTo=.6; Voice.stop(); Voice.bark('aliZaWarudo'); zwStart(); P.cineFly=true; P.cineAnim='charge';
  cam(a0+.25,4.5,1.6,P.y+1.4); NP1.cam.lx=P.x; NP1.cam.lz=P.z; yield wait(.9);
  // the cage: eight points on a sphere round him, the camera orbiting a full turn
  const hung=[], N=8;
  for(let i=0;i<N;i++){ const a=a0+i/N*6.283, el=[.15,.7,.35,.95,.2,.6,.45,.85][i], r=5, x=cx+Math.cos(a)*r*Math.cos(el), z=cz+Math.sin(a)*r*Math.cos(el), y=groundY(cx,cz)+.4+Math.sin(el)*r;
    aliGhost(P.x,P.y,P.z); P.x=x; P.z=z; P.y=y; P.ang=Math.atan2(cz-z,cx-x); P.cineAnim='beam'; FX.burst(x,y+1,z,12,0x0c0814,3,.25,false); FX.burst(x,y+1,z,8,0xff2a3a,3,.2); Sound.sfx('swing');
    hung.push({m:aliHungJJ(x,y+1.1,z,cx,cz),x,y:y+1.1,z}); cam(a+.9,9,2+Math.sin(i/N*6.283)*1.5); yield wait(.13); }
  // back in front of him; twenty cuts open round him on screen
  P.x=ox; P.z=oz; P.y=oy; P.ang=Math.atan2(cz-oz,cx-ox); P.cineAnim='charge'; FX.burst(ox,oy+1,oz,16,0x0c0814,3,.3,false);
  { const [dx,dz]=[Math.cos(a0),Math.sin(a0)]; NP1.cam={x:ox+dx*3.2-dz*1.1,y:oy+2,z:oz+dz*3.2+dx*1.1,lx:cx,ly:cy,lz:cz}; } yield wait(.25);
  JC.lines=[]; for(let i=0;i<20;i++){ const q=toScreen(cx,cy,cz), a=rnd(0,Math.PI), L0=rnd(380,760), mx=q[0]+rnd(-160,160), my=q[1]+rnd(-120,120);
    JC.lines.push({x0:mx-Math.cos(a)*L0/2,y0:my-Math.sin(a)*L0/2,x1:mx+Math.cos(a)*L0/2,y1:my+Math.sin(a)*L0/2,t:0}); if(JC.lines.length>24) JC.lines.shift(); Sound.sfx(i%2?'swing':'hit'); shake(.08); yield wait(.045); }
  yield wait(.3); Voice.bark('aliJudgement'); Sound.sfx('secret'); yield wait(.3);
  // time resumes: the cuts land, the cage collapses into him
  zwEnd(); JC.flash=1; impactFrame([[3,2],[1,1],[2,2]]); Sound.sfx('crossboom'); shake(.9); FX.flash=.6; for(let k=0;k<4;k++) FX.burst(cx,cy,cz,24,k%2?0xffffff:0xb0182a,7,.3);
  const amt=()=>NP1.max*.04, hitNB=()=>{ const s=NB.stunned; NB.stunned=0; try{ nbDamage(amt(),'np1'); } finally{ NB.stunned=s; } }; hitNB(); yield wait(.2);
  const fly={u:0}, from=hung.map(h=>({x:h.x,y:h.y,z:h.z})); Sound.sfx('beam'); Game.fxUpd.push(()=>{ if(fly.done) return false; hung.forEach((h,i)=>h.m.position.set(lerp(from[i].x,cx,fly.u),lerp(from[i].y,cy,fly.u),lerp(from[i].z,cz,fly.u))); return true; });
  cam(a0+2.2,8,1.2); yield tween(fly,{u:1},.32,t=>t*t); fly.done=1; hung.forEach(h=>{ scene.remove(h.m); FX.burst(h.m.position.x,h.m.position.y,h.m.position.z,16,0xff3a4a,6,.3); }); Sound.sfx('slam'); shake(.7); if(NB&&NB.alive&&!NP1.done) hitNB();
  // the final crescent: Ali drops on him from straight above
  if(NB&&NB.alive&&!NP1.done){ Voice.bark('aliFinal'); P.x=cx-Math.cos(a0)*.6; P.z=cz-Math.sin(a0)*.6; P.y=groundY(cx,cz)+7; P.cineAnim='beam'; aliGhost(ox,oy,oz);
    NP1.cam={x:cx+Math.cos(a0)*7,y:groundY(cx,cz)+.6,z:cz+Math.sin(a0)*7,lx:cx,ly:groundY(cx,cz)+4.5,lz:cz}; yield wait(.25);
    const y0=P.y; for(let t=0;t<.18;t+=1/60){ P.y=lerp(y0,groundY(cx,cz)+.2,t/.18); yield wait(1/60); }
    twGash({life:.9,rev:.05,fade:.3,w:40,sparks:40,pts:()=>np1LinePts(cx,groundY(cx,cz)+7,cz,cx,groundY(cx,cz)-.2,cz,6)});
    impactFrame([[1,2],[3,2],[2,1]]); FX.flash=1; grade.uniforms.flashCol.value.set(1,.2,.3); JC.flash=1; Sound.sfx('crossboom'); Sound.sfx('slam'); shake(1.4); FX.hitstop=.15;
    FX.burst(cx,cy,cz,80,0xff2a3a,10,.5); FX.burst(cx,cy,cz,40,0x0a0006,8,.5,false); FX.ring(cx,groundY(cx,cz)+.1,cz,'#ff3a4a',6,.5);
    Game.dmgNums.push({x:cx,y:cy+3,z:cz,n:'GETSUGA TENSHOU',t:0,big:true,col:'#ff6a7a'}); hitNB(); try{ npPosture(40,'ULTIMATE'); }catch(e){} yield wait(.6); }
  // back behind Ali
  P.x=ox; P.z=oz; P.y=groundY(ox,oz); P.cineFly=false; P.cineAnim=null; P.inv=.8; NP1.cam=null; Game.letterTo=0; JC.lines=[];
  if(NB&&NB.alive&&!NP1.done){ NP1.stunT=0; np1Stun(2.2,'SHATTERED'); } }
(function(){ const au=aliUltimate; aliUltimate=function*(){ const E=NP1.ex; if(npUltOk()&&!(E&&E.phase==='window')){ if(NP1.lcInv){ Game.dmgNums.push({x:Player.x,y:Player.y+2.6,z:Player.z,n:"HE'S UNTOUCHABLE",t:0,col:'#9ff8ff'}); return; } yield* npUlt(); return; } yield* au.apply(this,arguments); }; })();
