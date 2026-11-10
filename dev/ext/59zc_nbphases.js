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
  for(let t=0;t<.12;t+=NP1.dt){ const u=Math.min(1,(t+NP1.dt)/.12), P2=Player, [ux,uz]=[P2.x-sx,P2.z-sz], d=Math.hypot(ux,uz)||1; o.x=sx+ux/d*Math.max(0,d-1.3)*u; o.z=sz+uz/d*Math.max(0,d-1.3)*u; o.row=1+Math.min(11,Math.floor(u*8)); twRushTell(o,Math.atan2(uz,ux)); o.place(); for(let q=0;q<3;q++) FX.spawn(o.x+rnd(-.3,.3),o.y+rnd(.4,3.2),o.z+rnd(-.3,.3),-ux/d*6,rnd(-.3,.3),-uz/d*6,.22,q%2?0x3ff4ff:0xffffff,.22,0,true); yield NP1.dt; }
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
    { const orb=twGlow(0xff3a4a,.3); orb.userData.temp=1; const ch={t:0}; np1Obj({bit:1,upd(dt){ ch.t+=dt; if(ch.t>.95) return false; const k=Math.min(1,ch.t/.5); orb.position.set(hx(),hy(),hz()); orb.scale.setScalar(.3+k*1.8+Math.sin(ch.t*50)*.15); orb.material.opacity=.9;
        if(ch.t<.5) for(let q=0;q<3;q++){ const a=rnd(0,6.28), b=rnd(-1.2,1.2), r=rnd(1.2,2.2), x=hx()+Math.cos(a)*r, y=hy()+b, z=hz()+Math.sin(a)*r; FX.spawn(x,y,z,(hx()-x)*4,(hy()-y)*4,(hz()-z)*4,.25,q%2?0xff2a3a:0xffffff,.14,0,true); } return true; }, kill(){ scene.remove(orb); }}); }
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
  const ms=[beamMesh(0x2a1a00,.3),beamMesh(0xffc23a,.2),beamMesh(0xffffff,.07)], tr=[0,1,2].map(()=>{ const m=beamMesh(0xffc23a,.16); m.material.transparent=true; m.material.blending=THREE.AdditiveBlending; m.material.depthWrite=false; return m; }); for(const m of [...ms,...tr]){ m.userData.temp=1; scene.add(m); }
  const S={a:Math.atan2(Player.z-NB.z,Player.x-NB.x)+Math.PI,prev:null,dir:Math.random()<.5?1:-1,t:0,hit:0}, sp=Math.PI*2/(npPh()>=3?1.1:1.4);
  const o=np1Obj({bit:1,upd(dt){ return !S.done; }, kill(){ S.done=1; for(const m of [...ms,...tr]) scene.remove(m); if(typeof NBS!=='undefined'&&NBS.fixRow===2) NBS.fixRow=null; }});
  try{ for(let k=0;k<turns;k++){ if(k){ S.dir=-S.dir; Sound.sfx('charge'); yield .25; } S.hit=0; let sw=0; Sound.sfx('beam'); Sound.sfx('whoosh');
      while(sw<Math.PI*2){ const dt=NP1.dt, da=sp*dt; S.prev=S.a; S.a+=S.dir*da; sw+=da; const y=gy()+.55, ux=Math.cos(S.a), uz=Math.sin(S.a);
        ms.forEach((m,i)=>{ m.position.set(NB.x,y,NB.z); m.lookAt(NB.x+ux,y,NB.z+uz); m.scale.set(1,1,L); }); tr.forEach((m,i)=>{ const b=S.a-S.dir*(i+1)*.09; m.position.set(NB.x,y,NB.z); m.lookAt(NB.x+Math.cos(b),y,NB.z+Math.sin(b)); m.scale.set(1,1,L); m.material.opacity=.4-i*.12; }); FX.spawn(NB.x+ux*L*Math.random(),y,NB.z+uz*L*Math.random(),0,rnd(.5,2),0,.3,Math.random()<.5?0xffd23a:0xffffff,.3,0,true);
        const P2=Player, pa=Math.atan2(P2.z-NB.z,P2.x-NB.x), pd=Math.hypot(P2.x-NB.x,P2.z-NB.z), crossed=Math.abs(angDiff(pa,S.a))<da*1.5+.06;
        if(!S.hit&&crossed&&pd<L+.4&&P2.y-groundY(P2.x,P2.z)<1.1&&P2.inv<=0&&!P2.cineFly&&P2.dash<=0){ S.hit=1; hurtPlayer(2,NB.x,NB.z); FX.burst(P2.x,P2.y+.6,P2.z,24,0xffd23a,5,.3); }
        else if(!S.hit&&crossed&&pd<L+.4){ S.hit=1; Game.dmgNums.push({x:P2.x,y:P2.y+2.6,z:P2.z,n:'CLEAR',t:0,col:'#ffd23a'}); }
        yield dt; } } }
  finally{ S.done=1; if(typeof NBS!=='undefined') NBS.fixRow=null; for(const m of [...ms,...tr]) scene.remove(m); }
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
  NP1.cam=null; Game.letterTo=0; npFaceNB(); twBig('PARRY EVERY SHADOW',{size:46,col:'#9ff8ff',y:UH*.24,dur:1.6,sub:'Each one flashes RED before it comes'});
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
  NP1.cam=null; Game.letterTo=0; npFaceNB(); twBig('SURVIVE THE SKY',{size:46,col:'#ffb02a',y:UH*.24,dur:1.6,sub:'RED funnels: parry or blink · GOLD circles: move'});
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
  NB.inv=false; NB.alive=true; NB.stunned=0; NB.hov=1.4; P.hp=P.maxHp; P.inv=1.2; P.cineFly=false; P.cineAnim=null; twCineGlideEnd(); npCineLens(false); Cam.cine=null; Game.letterTo=0; Game.state='play'; npFaceNB(); try{ Sound.play('diva'); }catch(e){} }
// the fight's camera picks up behind Ali, facing Nathan (not where it was looking before the cutscene)
function npFaceNB(){ try{ if(typeof TPS!=='undefined'&&NB){ const P=Player; TPS.yaw=Math.atan2(NB.z-P.z,NB.x-P.x); P.ang=TPS.yaw; } }catch(e){} }
// the cutscene camera glides (like the duo's grabs): every shot is a target, the camera eases to it from wherever it was
function twCineGlide(px,py,pz,lx,ly,lz,k){ const G=TW.glide; if(G&&!G.dead){ G.w=[px,py,pz,lx,ly,lz]; if(k) G.k=k; return G; }
  const c=Cam.cine, cp=camera.position, L0=Cam.look||{x:lx,y:ly,z:lz}, s0={w:[px,py,pz,lx,ly,lz],k:k||5,v:c?[c.px,c.py,c.pz,c.lx,c.ly,c.lz]:[+cp.x||px,+cp.y||py,+cp.z||pz,+L0.x||lx,+L0.y||ly,+L0.z||lz],dead:0}; TW.glide=s0;
  Game.fxUpd.push(dt=>{ try{ if(s0.dead||TW.glide!==s0||!Game.script) { s0.dead=1; if(TW.glide===s0) TW.glide=null; return false; } const e=1-Math.exp(-Math.max(0,dt||1/60)*s0.k); for(let i=0;i<6;i++) s0.v[i]=lerp(s0.v[i],s0.w[i],e); cineSet(...s0.v); return true; }catch(e){ console.error('glide',e); return false; } }); cineSet(...s0.v); return s0; }
function twCineGlideEnd(){ if(TW.glide){ TW.glide.dead=1; TW.glide=null; } }
// Shots for 2D sprites: always the gameplay camera's kind of angle (looking down about 25 degrees, never low and close, which
// shows a billboard as a flat card), 6+ units back on a longer lens; a shot changes by pushing in, pulling out or sliding.
const NP_CINE={pitch:.46,min:6,fov:42};
function npCineLens(on){ try{ camera.fov=on?NP_CINE.fov:(typeof TPS!=='undefined'?TPS.FOV:55); camera.updateProjectionMatrix(); }catch(e){} }
function npShotAt(x,z,ly,dist,side,ux,uz){ const d=Math.max(NP_CINE.min,dist), gy=groundY(x,z), px=-uz, pz=ux; twCineGlide(x+ux*d+px*side,gy+ly+d*NP_CINE.pitch,z+uz*d+pz*side,x,gy+ly,z,4); }
function npShotNB(dist,side,up,ly){ const [dx,dz]=np1Dir(); npShotAt(NB.x,NB.z,(ly||2.4),dist+2,side,dx,dz); } /* from Ali's side of him */
function npShotAli(dist,side,up){ const [dx,dz]=np1Dir(); npShotAt(Player.x,Player.z,1.4,dist+3,side,-dx*.25+(-dz)*.97*(side<0?-1:1),-dz*.25+dx*.97*(side<0?-1:1)); } /* from his side, Nathan's direction across the frame */
function npShotBoth(dist,side){ const P=Player, [dx,dz]=np1Dir(), mx=(P.x+NB.x)/2, mz=(P.z+NB.z)/2, sg=side<0?-1:1; npShotAt(mx,mz,1.8,dist,0,-dz*sg,dx*sg); } /* side on: both in frame, one left, one right */
// I -> II: MOONLESS SKY. He purges his armour; the sky goes dark
function* npCine12(){ const P=Player, mi=Game.mira; NB.inv=true; npCineLens(true); Game.letterTo=1; P.inv=99; P.cineFly=false; P.cineAnim=null; NP1.cam=null; P.vx=P.vz=0;
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
  if(mi){ twCineGlide(mi.x+1,groundY(mi.x,mi.z)+1.4,mi.z+3.4,mi.x,groundY(mi.x,mi.z)+1.2,mi.z); yield say('mira',"He's... kind of glowing. Is that allowed?!",'surprised'); }
  npShotBoth(13,1); twCutin('nathan','MOONLESS SKY','Phase II  ·  the first seal breaks','#1a4aff',1.8); yield wait(1.2);
  evaCard(['PHASE II','MOONLESS SKY'],1.8,1); Sound.sfx('slam'); yield wait(1.8);
  npShotNB(5,1,1.6,3); yield say('nathan',"Let's dance in the dark, Ali.");
  npShotAli(3,-1,1.5); yield say('ali',"I don't dance.");
  npShotNB(5,-1,1.6,3); yield say('nathan',"Everyone dances when the floor is on fire.",'angry');
  yield tween(NB,{hov:1.4},.4,twEIO); npBegin(2); }
// II -> III: LAST LIGHT. Every plate blows off, the funnels fall dead; a pistol in one hand, the laser sword in the other, on foot
function* npCine23(){ const P=Player, mi=Game.mira; NB.inv=true; npCineLens(true); Game.letterTo=1; P.inv=99; P.cineFly=false; P.cineAnim=null; NP1.cam=null; P.vx=P.vz=0;
  npShotNB(5,-1.2,1.3,2.2); NB.hov=.7; yield wait(.5);
  Sound.sfx('heartbeat'); yield say('nathan',"Warning. Reactor critical. Funnels offline. Armour integrity... zero.",'angry');
  npShotAli(3.4,1,1.5); yield say('ali',"Your machine is finished.");
  npShotNB(4.2,1,1.7,2.6); yield say('nathan',"The machine is. I'm not.",'angry');
  // the funnels drop out of the sky, dead
  npShotBoth(15,1); for(let i=0;i<6;i++){ const a=i*1.05, x=NB.x+Math.cos(a)*rnd(3,6), z=NB.z+Math.sin(a)*rnd(3,6), gy=groundY(x,z), b=nbBit(x,gy+7,z); b.m.children.forEach(c=>{ try{ c.material.color.setHex(0x4a5560); }catch(e){} });
    const f={t:0}; Game.fxUpd.push(dt=>{ f.t+=dt||1/60; const y=Math.max(gy+.3,gy+7-f.t*f.t*14); b.y=y; b.m.position.set(x,y,z); b.m.rotation.x+=.2; if(y<=gy+.31&&!f.hit){ f.hit=1; FX.burst(x,gy+.3,z,10,0x8a8f98,3,.3,false); Sound.sfx('block'); } if(f.t>2.2){ nbKillBit(b); return false; } return true; }); yield wait(.12); }
  yield wait(.5); yield say('nathan',"Purge it. All of it.");
  // the plates blow off one by one
  npShotNB(5,0,1.6,2.6); NB.hov=1.2; for(let i=0;i<9;i++){ const h=rnd(.8,3.8); FX.burst(NB.x+rnd(-.8,.8),NB.y+h,NB.z,26,i%2?0xe8eef4:0xb8c4d0,9,.6,false); FX.burst(NB.x,NB.y+h,NB.z,14,0xff5a2a,6,.4); NB.flash=.25; Sound.sfx(i%2?'crash':'slam'); shake(.35+i*.04); if(i%3===2) impactFrame([[1,1]]); yield wait(.11); }
  FX.flash=.9; grade.uniforms.flashCol.value.set(1,.5,.3); impactFrame([[3,2],[1,2],[2,2]]); Sound.sfx('crossboom'); try{ const g=grade.uniforms; g.tint.value.set(...NP_LOOK[3].tint); if(g.sat) g.sat.value=NP_LOOK[3].sat; }catch(e){} NB.red=1; if(NB.mat) NB.mat.color.setHex(0xffb4b0);
  yield tween(NB,{hov:.25},.5,twEIO); FX.ring(NB.x,groundY(NB.x,NB.z)+.1,NB.z,'#ffb07a',3,.4); Sound.sfx('slam'); shake(.5);
  npShotNB(4.5,1.2,1.5,2.2); yield say('nathan',"No armour. No funnels. One pistol. One sword. Two feet.");
  npShotAli(3.4,-1,1.4); yield say('ali',"That's more than you've had all fight.");
  if(mi){ twCineGlide(mi.x+1,groundY(mi.x,mi.z)+4,mi.z+6.5,mi.x,groundY(mi.x,mi.z)+1.2,mi.z); yield say('mira',"He took his robot OFF?! Ali, he's just a guy! A very angry guy!",'surprised'); }
  npShotBoth(12,-1); twCutin('nathan','LAST LIGHT','Phase III  ·  gun, blade and bare hands','#ff2a1a',1.8); yield wait(1.2);
  evaCard(['PHASE III','LAST LIGHT'],1.8,1); Sound.sfx('slam'); yield wait(1.8);
  npShotNB(5,1,1.6,2.2); yield say('nathan',"I learned to fight before I learned to fly, Ali. Come here.",'angry');
  npShotAli(3,1,1.5); yield say('ali',"Finally. Someone I can reach.");
  npBegin(3); NB.hov=.25; }
// ---------- ALI'S ULTIMATE, IN 3D (this fight only): THE WORLD + a cage of crescents round him, the camera orbiting ----------
// The 2D version hangs its Getsugas round the screen's centre; here time stops, Ali blinks to eight points on a sphere
// round Nathan (high and low), hangs a Jujishou at each, the camera circles; twenty cuts open round HIM on screen; time
// resumes, the cage collapses into him; then Ali drops on him from above with the final crescent. ~15% of the phase's HP.
function npUltOk(){ return tpsFight()&&NP1.live&&!NP1.done&&NB&&NB.alive&&!NB.inv; }
function* npUlt(){ const P=Player; P.sp=0; P.inv=99; P.hp=P.maxHp; Game.dmgNums.push({x:P.x,y:P.y+2.6,z:P.z,n:'FULL HP',t:0,big:true,col:'#8affb0'}); Sound.sfx('heart'); P.atk=null; P.aliAtk=null; P.charge=0; P.vx=P.vz=P.vy=0;
  np1Clear(); NP1.gen=null; NP1.stunT=Math.max(NP1.stunT,12); NB.stunned=1; NB.dsh=null; const cx=NB.x, cz=NB.z, g0=groundY(cx,cz), cy=NB.y+2, ox=P.x, oz=P.z, oy=P.y, a0=Math.atan2(oz-cz,ox-cx), amt=()=>NP1.max*.04;
  const hitNB=()=>{ const s=NB.stunned; NB.stunned=0; try{ nbDamage(amt(),'np1'); } finally{ NB.stunned=s; } };
  // one camera for the whole thing: W is where it wants to be, it eases there every frame (no cuts); time is stopped, so the script drives it
  const cp=camera.position, L0=(typeof TPS!=='undefined'&&TPS.l)||[cx,cy,cz], V=[+cp.x||ox,+cp.y||oy+3,+cp.z||oz,L0[0],L0[1],L0[2]]; let W=V.slice(), K=5;
  const orb=(a,r,h,lx,ly,lz)=>{ W=[cx+Math.cos(a)*r,g0+h,cz+Math.sin(a)*r,lx!=null?lx:cx,ly!=null?ly:cy,lz!=null?lz:cz]; };
  const tick=()=>{ const e=1-Math.exp(-K/60); for(let i=0;i<6;i++) V[i]=lerp(V[i],W[i],e); NP1.cam={x:V[0],y:V[1],z:V[2],lx:V[3],ly:V[4],lz:V[5]}; };
  const hold=function*(sec,fn){ for(let t=0;t<sec;t+=1/60){ if(fn) fn(Math.min(1,(t+1/60)/sec)); tick(); yield wait(1/60); } };
  const fov=v=>{ try{ camera.fov=v; camera.updateProjectionMatrix(); }catch(e){} }, F0=typeof TPS!=='undefined'?TPS.FOV:55;
  try{
    // 1. THE WORLD: the colour drains, a slow push in on Ali's face from his sword side
    Game.letterTo=.6; Voice.stop(); Voice.bark('aliZaWarudo'); zwStart(); P.cineFly=true; P.cineAnim='charge'; P.ang=Math.atan2(cz-oz,cx-ox);
    K=4; yield* hold(.9,u=>{ orb(a0+.5,Math.hypot(ox-cx,oz-cz)+2.2-u*.8,oy-g0+1.5,ox,oy+1.4,oz); fov(F0-10*u); });
    // 2. the cage: the camera pulls back and up in one long arc round him while Ali blinks from point to point, a crescent left at each
    const hung=[], N=8, el=[.15,.7,.35,.95,.2,.6,.45,.85]; K=3.2;
    for(let i=0;i<N;i++){ const a=a0+i/N*6.283, r=5, x=cx+Math.cos(a)*r*Math.cos(el[i]), z=cz+Math.sin(a)*r*Math.cos(el[i]), y=g0+.4+Math.sin(el[i])*r;
      aliGhost(P.x,P.y,P.z); P.x=x; P.z=z; P.y=y; P.ang=Math.atan2(cz-z,cx-x); P.cineAnim='beam'; FX.burst(x,y+1,z,12,0x0c0814,3,.25,false); FX.burst(x,y+1,z,8,0xff2a3a,3,.2); Sound.sfx('swing');
      hung.push({m:aliHungJJ(x,y+1.1,z,cx,cz),x,y:y+1.1,z}); yield* hold(.13,u=>{ const q=(i+u)/N; orb(a0+.5+q*2.4,6+q*6,2+q*6.5); fov(F0-10+q*14); }); }
    // 3. he lands in front of him, back turned; the camera settles high over Ali's shoulder as twenty cuts open round Nathan
    P.x=ox; P.z=oz; P.y=oy; P.ang=Math.atan2(cz-oz,cx-ox); P.cineAnim='charge'; FX.burst(ox,oy+1,oz,16,0x0c0814,3,.3,false); K=4.5;
    const sh=()=>{ const dx=Math.cos(a0), dz=Math.sin(a0); W=[ox+dx*3.4-dz*1.6,oy+2.6,oz+dz*3.4+dx*1.6,cx,cy+.4,cz]; }; yield* hold(.3,sh);
    JC.lines=[]; for(let i=0;i<20;i++){ const q=toScreen(cx,cy,cz), a=rnd(0,Math.PI), L1=rnd(380,760), mx=q[0]+rnd(-160,160), my=q[1]+rnd(-120,120);
      JC.lines.push({x0:mx-Math.cos(a)*L1/2,y0:my-Math.sin(a)*L1/2,x1:mx+Math.cos(a)*L1/2,y1:my+Math.sin(a)*L1/2,t:0}); if(JC.lines.length>24) JC.lines.shift(); Sound.sfx(i%2?'swing':'hit'); shake(.08); yield* hold(.045,sh); }
    yield* hold(.3,sh); Voice.bark('aliJudgement'); Sound.sfx('secret'); yield* hold(.3,u=>{ sh(); fov(F0+4-8*u); });
    // 4. time resumes: the cuts land, the lens punches out, the cage collapses into him
    zwEnd(); JC.flash=1; impactFrame([[3,2],[1,1],[2,2]]); Sound.sfx('crossboom'); shake(.9); FX.flash=.6; fov(F0+12); for(let k=0;k<4;k++) FX.burst(cx,cy,cz,24,k%2?0xffffff:0xb0182a,7,.3); hitNB();
    const from=hung.map(h=>({x:h.x,y:h.y,z:h.z})); Sound.sfx('beam'); K=5;
    yield* hold(.34,u=>{ const e=u*u; hung.forEach((h,i)=>h.m.position.set(lerp(from[i].x,cx,e),lerp(from[i].y,cy,e),lerp(from[i].z,cz,e))); orb(a0+1.9,9-u*2,2.4); fov(F0+12-12*u); });
    hung.forEach(h=>{ scene.remove(h.m); FX.burst(h.m.position.x,h.m.position.y,h.m.position.z,16,0xff3a4a,6,.3); }); hung.length=0; Sound.sfx('slam'); shake(.7); if(NB&&NB.alive&&!NP1.done) hitNB();
    // 5. the final cut: low behind Ali's back as he draws, the camera chases him through Nathan, and on the cut it whips round
    // to his front: Ali facing us mid-slash, Nathan split behind him (the flip counter's language)
    if(NB&&NB.alive&&!NP1.done){ Voice.bark('aliFinal'); const dx=Math.cos(a0), dz=Math.sin(a0), sx=cx+dx*7, sz=cz+dz*7, ex=cx-dx*5, ez=cz-dz*5, fa=Math.atan2(-dz,-dx);
      aliGhost(P.x,P.y,P.z); P.x=sx; P.z=sz; P.y=groundY(sx,sz); P.ang=fa; P.cineAnim='charge'; K=6; Sound.sfx('charge');
      yield* hold(.5,u=>{ W=[sx+dx*3.2-dz*1.7,g0+1.7,sz+dz*3.2+dx*1.7,cx,g0+2.2,cz]; fov(F0-6*u); if(Math.random()<.6) FX.spawn(P.x+rnd(-.4,.4),P.y+rnd(.2,1.8),P.z+rnd(-.4,.4),0,rnd(1,3),0,.4,0xff2a3a,.2,0,true); });
      try{ npStar(P.x,P.y+1.4,P.z,0xff2a3a,2.4,.3); }catch(e){} Sound.sfx('ting'); yield* hold(.12);
      P.cineAnim='dash'; Sound.sfx('dash'); Sound.sfx('whoosh'); K=10; let cut=0, gi=0; FX.line(sx,sz,fa,12,.6,0xff2a3a,.7);
      yield* hold(.2,u=>{ const e=u*u; P.x=lerp(sx,ex,e); P.z=lerp(sz,ez,e); P.y=groundY(P.x,P.z); if(gi++%2===0){ try{ const g=aliGhost(P.x,P.y,P.z); if(g&&g.mesh) g.mesh.material.color.setHex(0xff3a4a); }catch(e){} }
        for(let i=0;i<4;i++) FX.spawn(P.x+rnd(-.3,.3),P.y+rnd(.2,1.8),P.z+rnd(-.3,.3),dx*rnd(6,14),rnd(-.5,.5),dz*rnd(6,14),.3,i%2?0xff2a3a:0xffffff,.3,0,true);
        W=[P.x+dx*3.4-dz*2.1,g0+1.9,P.z+dz*3.4+dx*2.1,P.x-dx*2,g0+1.6,P.z-dz*2]; fov(F0-6+16*u);
        if(!cut&&(P.x-cx)*dx+(P.z-cz)*dz<0){ cut=1; twGash({life:1.2,rev:.04,fade:.4,w:46,sparks:50,pts:()=>twArcPts(cx,cy,cz,-dx,-dz,3.6,-1.25,1.25,8)}); twGash({life:1,rev:.05,fade:.35,w:26,sparks:20,pts:()=>np1LinePts(cx+dx*4,g0+1.2,cz+dz*4,cx-dx*4,g0+2.6,cz-dz*4,4)});
          try{ const q=toScreen(cx,cy,cz); for(let i=0;i<6;i++){ const a=rnd(-.5,.5), L1=rnd(500,900); JC.lines.push({x0:q[0]-Math.cos(a)*L1/2,y0:q[1]-Math.sin(a)*L1/2+rnd(-60,60),x1:q[0]+Math.cos(a)*L1/2,y1:q[1]+Math.sin(a)*L1/2+rnd(-60,60),t:0,ttl:.5}); } }catch(e){}
          impactFrame([[2,1],[1,2],[3,2],[2,1]]); FX.flash=1; grade.uniforms.flashCol.value.set(1,.2,.3); JC.flash=1; Sound.sfx('crossboom'); Sound.sfx('slam'); shake(1.6); FX.hitstop=.14; NB.flash=.4;
          FX.burst(cx,cy,cz,60,0xffffff,10,.4); FX.burst(cx,cy,cz,50,0xff2a3a,9,.5); for(let i=0;i<3;i++) FX.ring(cx,g0+.1,cz,i?'#ff3a4a':'#ffffff',3+i*2,.35+i*.1); hitNB(); } });
      // the whip: half a turn round him, from his back to his face, while he holds the follow-through
      P.x=ex; P.z=ez; P.y=groundY(ex,ez); P.cineAnim='aliIai'; K=8; Game.dmgNums.push({x:cx,y:cy+3,z:cz,n:'GETSUGA TENSHOU',t:0,big:true,col:'#ff6a7a'});
      yield* hold(.42,u=>{ const e=u*u*(3-2*u), ca=a0+Math.PI*e, r=lerp(3.4,3.1,e); W=[P.x+Math.cos(ca)*r,g0+lerp(1.6,1.25,e),P.z+Math.sin(ca)*r,lerp(P.x,cx,.25*e),g0+1.55,lerp(P.z,cz,.25*e)]; fov(F0+10-12*e); if(Math.random()<.7) FX.spawn(cx+rnd(-1,1),cy+rnd(-1.5,1.5),cz+rnd(-1,1),rnd(-3,3),rnd(-1,4),rnd(-3,3),.4,Math.random()<.5?0xff2a3a:0xffffff,.25,0,true); });
      // the held beat: Ali in front, sword out; Nathan frozen behind him, then he bursts
      Sound.sfx('heartbeat'); yield* hold(.45,u=>{ NB.flash=u>.5?.3:0; fov(F0-2-2*u); });
      FX.burst(cx,cy,cz,90,0xff2a3a,11,.55); FX.burst(cx,cy,cz,50,0x0a0006,9,.5,false); FX.burst(cx,cy,cz,40,0xffffff,8,.4); FX.ring(cx,g0+.1,cz,'#ff3a4a',7,.5); Sound.sfx('crossboom'); shake(1.2); JC.flash=.9; impactFrame([[1,1],[3,2]]); fov(F0+8);
      hitNB(); try{ npPosture(40,'ULTIMATE'); }catch(e){} yield* hold(.55,u=>fov(F0+8-8*u)); }
    // 6. back behind Ali: the camera glides to where the fight's camera will be, then lets go
    P.x=ox; P.z=oz; P.y=groundY(ox,oz); P.cineAnim=null; P.ang=Math.atan2(cz-oz,cx-ox); K=4;
    yield* hold(.85,u=>{ const dx=Math.cos(a0), dz=Math.sin(a0); if(u<.45) W=[cx-dz*7.5+dx*2,g0+5.5,cz+dx*7.5+dz*2,lerp(cx,ox,.4),cy,lerp(cz,oz,.4)]; /* round his side, never through him */ else W=[ox+dx*8,oy+3.5,oz+dz*8,lerp(ox,cx,.33),oy+1.3,lerp(oz,cz,.33)]; fov(F0); }); }
  finally{ if(Game.zw) zwEnd(); for(const h of hung0()) scene.remove(h); fov(F0); P.cineFly=false; P.cineAnim=null; P.inv=.8; NP1.cam=null; Game.letterTo=0; JC.lines=[]; npFaceNB(); }
  function hung0(){ return []; }
  if(NB&&NB.alive&&!NP1.done){ NP1.stunT=0; np1Stun(2.2,'SHATTERED'); } }
(function(){ const au=aliUltimate; aliUltimate=function*(){ const E=NP1.ex; if(npUltOk()&&!(E&&E.phase==='window')){ if(NP1.lcInv){ Game.dmgNums.push({x:Player.x,y:Player.y+2.6,z:Player.z,n:"HE'S UNTOUCHABLE",t:0,col:'#9ff8ff'}); return; } yield* npUlt(); return; } yield* au.apply(this,arguments); }; })();
