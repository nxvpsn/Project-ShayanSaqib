// =====================================================================
// NATHAN'S STARBREAKER (phase I on Ali's road, move 'excal'): he blinks 22 units away and raises his laser sword; it
// charges in three levels, 2s each (a meter over the screen: CHARGING, LEVEL 1, 2, 3), the blade growing each level, and
// at level 3 it reaches straight up into the sky (the planet-cutter). Then a RAINBOW glint: from the glint on, for
// NPX.win, a LEVEL 3 Getsuga (08d_alicharge.js, 6s of holding: start when he starts) or Ali's Q answers it. Either one
// clashes with the blade for a moment, then a dense explosion staggers him for 4s. Released before the glint, the level 3
// Getsuga is swatted away (TOO EARLY). No answer: the blade comes down along a line locked on the glint (a dark strip on the
// ground). Out of the line it only cuts the ground, leaving a black ravine for the rest of the fight: walk into it and you
// fall to your death (floating or jumping over is fine). In the line: a huge hit that throws you clear of the cut.
// The Q answer (my cinematic): time stops, a low shot up Ali's black-and-red sky column, a colossal Jujishou, the clash.
// =====================================================================
const NPX={L:[3.5,9,24,260],W:[.16,.32,.6,1.3],hold:.5,win:.9,half:1.3,rav:[],fall:null};
// ---------- the move ----------
NP1M.excal=function*(){ const E=npxStart();
  twBark('nathan',"Stand still, wanderer. This one cuts planets.",true);
  np1Hint('excal','RAINBOW GLINT: answer with a LEVEL 3 Getsuga (hold '+K('block')+' 6s, let go on the glint) or '+K('special')+', or get out of its line');
  while(E.t<6+NPX.hold){ E.beat=E.clock; const dt=NP1.dt; E.t+=dt; const lv=Math.min(3,Math.floor(E.t/2)); if(lv>E.lv){ E.lv=lv; npxLevel(E,lv); } yield dt; }
  // the rainbow glint: the line locks on Ali
  const [dx,dz]=np1Dir(); E.ux=dx; E.uz=dz; E.phase='window'; npxGlint(NB.x,NB.y+2.9,NB.z); npxGlint(NB.x,NB.y+14,NB.z); npxLine(E);
  for(let w=0;w<NPX.win;){ E.beat=E.clock; if(E.phase!=='window') return; const dt=NP1.dt; w+=dt; E.ang=lerp(0,-.3,Math.min(1,w/NPX.win)); yield dt; }
  // the swing: down onto the line
  E.phase='swing'; if(typeof NBS!=='undefined'){ NBS.fixRow=null; nbsSlash(.32,.4); } Sound.sfx('swing'); Sound.sfx('beam'); Sound.tone('sawtooth',400,60,.4,.12);
  const hy=NB.y+2.9, P=Player, D=Math.max(6,(P.x-NB.x)*E.ux+(P.z-NB.z)*E.uz), th0=E.ang, th1=Math.atan2(D,-(hy-groundY(NB.x+E.ux*D,NB.z+E.uz*D)));
  for(let s=0;s<.22;){ E.beat=E.clock; const dt=NP1.dt; s+=dt; const u=Math.min(1,s/.22); E.ang=lerp(th0,th1,u*u); yield dt; }
  E.ang=th1; E.phase='cut'; npxImpact(E);
  for(let s=0;s<.8;){ E.beat=E.clock; const dt=NP1.dt; s+=dt; E.fade=Math.max(0,1-s/.8); yield dt; }
  NP1.ex=null; yield .6; };
// he blinks far off (on the far side of where he was, so he stays in front of the camera) and raises the blade
function npxStart(){ const P=Player, [dx,dz]=np1Dir();
  FX.burst(NB.x,NB.y+2,NB.z,30,0x9ff8ff,6,.35); nbAfterimage(NB.x,NB.y,NB.z); NB.dsh=null; NB.x=P.x-dx*22; NB.z=P.z-dz*22; NP1.alt=null;
  FX.burst(NB.x,NB.y+2,NB.z,30,0xffffff,6,.35); Sound.sfx('qbRoar'); Sound.tone('sine',1800,300,.3,.08);
  if(typeof NBS!=='undefined') NBS.fixRow=3; /* the sword raised */
  const E={t:0,lv:-1,phase:'charge',nx:NB.x,nz:NB.z,ang:0,len:NPX.L[0],w:NPX.W[0],dl:NPX.L[0],ux:dx,uz:dz,beat:0,clock:0,fade:1,pulse:0,pulseUI:0,snap:0};
  NP1.ex=E; npxSword(E); return E; }
function npxLevel(E,lv){ E.pulse=1; if(lv<1) return; E.len=NPX.L[lv]; E.w=NPX.W[lv]; E.pulseUI=1;
  const hx=NB.x, hy=NB.y+2.9, hz=NB.z; FX.burst(hx,hy,hz,20+lv*15,0x9ff8ff,5+lv*2,.4); FX.burst(hx,hy,hz,15+lv*10,0xffffff,4+lv*2,.3); FX.ring(hx,groundY(hx,hz)+.1,hz,'#3ff4ff',2+lv*1.5,.5); shake(.2+lv*.2);
  Sound.tone('sawtooth',120+lv*60,600+lv*300,.5,.1); Sound.hiss(2000+lv*1000,.4,.15+lv*.05,'bandpass');
  if(lv===3){ Sound.sfx('choir'); Sound.sfx('crossboom'); FX.flash=Math.max(FX.flash,.4); grade.uniforms.flashCol.value.set(.5,.95,1); twBark('nathan',"Level three. Look up.",true); }
  Game.dmgNums.push({x:hx,y:hy+2,z:hz,n:'LEVEL '+lv,t:0,big:true,col:'#9ff8ff'}); }
// ---------- his blade: cyan with a white core inside a dark sheath (it reads against the bright sky) ----------
function npxSword(E){ const outer=beamMesh(0x3ff4ff,1), core=beamMesh(0xffffff,.42), g=new THREE.CylinderGeometry(1.7,1.7,1,10,1,true); g.rotateX(Math.PI/2); g.translate(0,0,.5);
  const dark=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x041030,transparent:true,opacity:.5,depthWrite:false,fog:false})); scene.add(dark);
  E.ms=[dark,outer,core]; for(const m of E.ms) m.userData.temp=1;
  np1Obj({upd(dt){ if(NP1.ex!==E) return false; npxDraw(E,dt); return true; },
    kill(){ for(const m of E.ms){ scene.remove(m); try{ m.geometry.dispose(); }catch(e){} } if(typeof NBS!=='undefined') NBS.fixRow=null; if(NP1.ex===E) NP1.ex=null; }}); }
function npxDraw(E,dt){ E.clock+=dt; if(Game.script) E.beat=E.clock;
  if(E.phase!=='clash'&&E.clock-E.beat>.3){ NP1.ex=null; return; } /* the move was cut short (a stagger, a Full Counter, a retry) */
  if(E.phase!=='clash'){ NB.x=E.nx; NB.z=E.nz; NB.dsh=null; if(NB.mesh){ NB.mesh.position.x=NB.x; NB.mesh.position.z=NB.z; } }
  E.dl=E.snap?E.len:lerp(E.dl,E.len,1-Math.exp(-dt*(E.lv>=3?4:10))); E.pulse=Math.max(0,E.pulse-dt*3);
  const hx=NB.x, hy=NB.y+2.9, hz=NB.z, s=Math.sin(E.ang), c=Math.cos(E.ang), dx=E.ux*s, dy=c, dz=E.uz*s, w=Math.max(.01,E.w*(1+.1*Math.sin(E.clock*40)+.5*E.pulse)*E.fade);
  for(const m of E.ms){ m.position.set(hx,hy,hz); m.lookAt(hx+dx,hy+dy,hz+dz+1e-4); m.scale.set(w,w,Math.max(.01,E.dl)); }
  if(E.fade>.5) for(let i=0;i<2+Math.max(0,E.lv)*2;i++){ const u=Math.random()*Math.min(E.dl,40); FX.spawn(hx+dx*u+rnd(-.3,.3)*w,hy+dy*u,hz+dz*u+rnd(-.3,.3)*w,rnd(-1,1),rnd(1,4),rnd(-1,1),.4,Math.random()<.5?0x3ff4ff:0xffffff,.25,0,true); }
  if(E.lv>=3&&E.phase==='charge') FX.shake=Math.max(FX.shake||0,.05); }
// ---------- the rainbow glint ----------
function npxGlint(x,y,z){ const mk=()=>{ const g=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xffffff,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); g.userData.temp=1; scene.add(g); return g; };
  const streak=mk(), star=mk(), halo=mk(), k={t:0}, c=new THREE.Color();
  np1Obj({upd(dt){ k.t+=dt; const u=k.t/.9, a=Math.max(0,1-u); c.setHSL((k.t*2.2)%1,1,.6); streak.material.color.copy(c); c.setHSL((k.t*2.2+.33)%1,1,.65); halo.material.color.copy(c);
      for(const g of [streak,star,halo]) g.position.set(x,y,z); streak.scale.set(14*(1+u),1.6*(1+u)*a+.01,1); star.scale.setScalar(5*a+.01); halo.scale.setScalar(8*(.5+u));
      halo.material.opacity=.7*a; streak.material.opacity=a; star.material.opacity=a; return u<1; },
    kill(){ scene.remove(streak); scene.remove(star); scene.remove(halo); }});
  [1046,1318,1568,2093,2637].forEach((f,i)=>Sound.tone(i%2?'sine':'triangle',f,f*1.01,.6+i*.08,.06)); Sound.sfx('ting'); FX.flash=Math.max(FX.flash,.25); grade.uniforms.flashCol.value.set(1,1,1); }
// ---------- a strip on the ground along a line (the telegraph, the ravine): jag = how ragged its edges are ----------
function npxStrip(x0,z0,ux,uz,len,half,jag,dy,mat){ const N=Math.max(2,Math.ceil(len/1.5)), px=-uz, pz=ux, pos=[], idx=[];
  for(let i=0;i<=N;i++){ const d=i*len/N, cx=x0+ux*d, cz=z0+uz*d, wl=half*(1+rnd(-jag,jag)), wr=half*(1+rnd(-jag,jag));
    const lx=cx+px*wl, lz=cz+pz*wl, rx=cx-px*wr, rz=cz-pz*wr; pos.push(lx,groundY(lx,lz)+dy,lz, rx,groundY(rx,rz)+dy,rz); if(i<N) idx.push(2*i,2*i+1,2*i+2, 2*i+1,2*i+3,2*i+2); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3)); g.setIndex(idx);
  const m=new THREE.Mesh(g,mat); m.userData.temp=1; scene.add(m); return m; }
// the line it will cut: a dark strip, pulsing, until the blade lands
function npxLine(E){ const m=npxStrip(NB.x+E.ux,NB.z+E.uz,E.ux,E.uz,140,NPX.half,0,.06,new THREE.MeshBasicMaterial({color:0x0a0420,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide})), k={t:0};
  np1Obj({upd(dt){ k.t+=dt; m.material.opacity=.45+.2*Math.sin(k.t*18); return NP1.ex===E&&(E.phase==='window'||E.phase==='swing'); }, kill(){ scene.remove(m); m.geometry.dispose(); }}); }
// ---------- the blade lands ----------
function npxImpact(E){ const P=Player, x0=NB.x, z0=NB.z, ux=E.ux, uz=E.uz;
  shake(1.4); FX.flash=Math.max(FX.flash,.5); grade.uniforms.flashCol.value.set(.6,.95,1); impactFrame([[1,1],[3,1]]); Sound.sfx('crossboom'); Sound.sfx('slam'); Sound.tone('sawtooth',80,30,.9,.25); Sound.hiss(500,1,.3,'lowpass');
  // Ali in its line: a huge hit, and he's thrown clear of the cut
  const rx=P.x-x0, rz=P.z-z0, al=rx*ux+rz*uz, pe=-rx*uz+rz*ux;
  if(al>-1&&Math.abs(pe)<NPX.half+.35&&P.inv<=0&&!P.cineFly){ const sg=pe>=0?1:-1, out=NPX.half+1.2-Math.abs(pe); twHitP(8,P.x+uz*sg,P.z-ux*sg,{ub:true,heavy:true}); P.x+=-uz*sg*out; P.z+=ux*sg*out; P.y=Math.max(P.y,groundY(P.x,P.z)); }
  npxRavine(x0+ux*1.5,z0+uz*1.5,ux,uz,140);
  for(let i=0;i<40;i++){ const d=rnd(2,40), x=x0+ux*d, z=z0+uz*d, y=groundY(x,z); FX.spawn(x+rnd(-1,1),y+.2,z+rnd(-1,1),rnd(-2,2),rnd(3,9),rnd(-2,2),.8,i%3?0x6a6050:0x9ff8ff,.5,8,i%3===0); } }
// ---------- the ravine: a black gash with glowing lips that cool to scorched dark; falling in kills ----------
function npxRavine(x0,z0,ux,uz,len){ const lip=new THREE.MeshBasicMaterial({color:0xffb060,side:THREE.DoubleSide}), pit=new THREE.MeshBasicMaterial({color:0x000000,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const a=npxStrip(x0,z0,ux,uz,len,NPX.half+.35,.2,.03,lip), b=npxStrip(x0,z0,ux,uz,len,NPX.half,.15,.07,pit);
  NPX.rav.push({x0,z0,ux,uz,len,half:NPX.half,ms:[a,b],lip,t:0}); }
function npxRavClear(){ for(const R of NPX.rav) for(const m of R.ms){ scene.remove(m); try{ m.geometry.dispose(); }catch(e){} } NPX.rav.length=0; npxFallEnd(); }
function npxRavUpd(dt){ const P=Player;
  for(const R of NPX.rav){ R.t+=dt; const k=Math.min(1,R.t/4); R.lip.color.setRGB(lerp(1,.16,k),lerp(.69,.04,k),lerp(.38,.03,k));
    if(R.t<6&&Math.random()<.5){ const d=rnd(0,Math.min(R.len,50)), x=R.x0+R.ux*d, z=R.z0+R.uz*d; FX.spawn(x+rnd(-.8,.8),groundY(x,z)+.2,z+rnd(-.8,.8),0,rnd(1,2.5),0,1.4,0x1a1418,.7,0,false); } }
  if(NPX.fall||!NPX.rav.length||P.cineFly||!P.onGround||NP1.seq||Game.state!=='play'||P.hurt>0) return;
  for(const R of NPX.rav){ const rx=P.x-R.x0, rz=P.z-R.z0, al=rx*R.ux+rz*R.uz, pe=Math.abs(-rx*R.uz+rz*R.ux); if(al>0&&al<R.len&&pe<R.half*.8){ npxFall(R,pe,-rx*R.uz+rz*R.ux); return; } } }
// over the edge: he drops into the dark, then it's a death (Infinite HP puts him back on the near lip)
function npxFall(R,pe,sp){ const P=Player; NPX.fall={t:0,vy:0,sx:P.x,sz:P.z,R,sg:sp>=0?1:-1,pe};
  P.cineFly=true; P.cineAnim='fall'; P.aliAtk=null; P.charge=0; P.vx=P.vz=P.vy=0; P.inv=99;
  Sound.tone('sine',700,90,1.2,.14); Sound.sfx('whoosh'); Game.dmgNums.push({x:P.x,y:P.y+2.5,z:P.z,n:'FELL IN',t:0,big:true,col:'#ff6a6a'});
  np1Obj({upd(dt){ const F=NPX.fall; if(!F) return false; F.t+=dt; F.vy+=dt*30; P.y-=F.vy*dt; P.x=F.sx; P.z=F.sz;
      if(F.t>1.1){ const out=R.half+1-F.pe; npxFallEnd(); P.hp=0; Game.onDeath();
        if(Game.state!=='dead'){ P.x+=-R.uz*F.sg*out; P.z+=R.ux*F.sg*out; P.y=groundY(P.x,P.z); P.inv=1; } return false; }
      return true; }, kill(){ npxFallEnd(); }}); }
function npxFallEnd(){ const P=Player; if(!NPX.fall) return; NPX.fall=null; P.cineFly=false; P.cineAnim=null; P.inv=0; }
// ---------- the clash: a level 3 Getsuga (b) or the Q (b made here) against the blade, then the explosion ----------
function* npxCamTo(B,dur){ const A=Object.assign({},NP1.cam), t0=Game.time; for(let u=0;u<1;){ yield wait(0); u=Math.min(1,(Game.time-t0)/dur); const e=u*(2-u); for(const k in B) NP1.cam[k]=lerp(A[k],B[k],e); } }
function* npxClash(kind,b){ const E=NP1.ex, P=Player; if(!E) return; E.phase='clash'; E.snap=1; NP1.gen=null; NP1.lunge=0;
  P.cineFly=true; P.inv=99; P.vx=P.vz=P.vy=0; P.aliAtk=null; P.charge=0; Game.letterTo=.5;
  const d0=Math.hypot(NB.x-P.x,NB.z-P.z)||1, ux=(NB.x-P.x)/d0, uz=(NB.z-P.z)/d0, px=-uz, pz=ux, gy=groundY(P.x,P.z);
  P.ang=Math.atan2(uz,ux); P.f=ux>=0?1:-1; E.ux=-ux; E.uz=-uz; /* his blade comes down toward Ali */
  if(kind==='q'){ P.sp=0; P.cineAnim='charge'; ALI_CH.force=3; zwStart(); Voice.stop();
    Game.dmgNums.push({x:P.x,y:P.y+3.4,z:P.z,n:'GETSUGA TENSHOU',t:0,big:true,col:'#ff3a4a'});
    // low behind Ali, looking up his black-and-red column at the sky blade, then pulling out
    NP1.cam={x:P.x-ux*3.5+px*2,y:gy+.8,z:P.z-uz*3.5+pz*2,lx:P.x+ux*3,ly:gy+5,lz:P.z+uz*3};
    yield* npxCamTo({x:P.x-ux*7+px*5,y:gy+3,z:P.z-uz*7+pz*5,lx:lerp(P.x,NB.x,.5),ly:gy+9,lz:lerp(P.z,NB.z,.5)},1.1);
    Voice.bark('aliGetsugaBig'); yield wait(.5); zwEnd(); ALI_CH.force=0;
    const n0=BEAMS.length; aliGetsuga(true); b=BEAMS.length>n0?BEAMS[BEAMS.length-1]:null; if(b){ if(b.pxv) b.pxv.sz*=2.6; b.g.scale.multiplyScalar(2); }
    FX.flash=.8; grade.uniforms.flashCol.value.set(1,.1,.15); shake(1.2); Sound.sfx('slam'); FX.burst(P.x,P.y+1.6,P.z,80,0xff1a2a,10,.45); FX.burst(P.x,P.y+1.6,P.z,60,0x0a0006,9,.5,false); }
  else Game.dmgNums.push({x:P.x,y:P.y+3.4,z:P.z,n:'CLASH!',t:0,big:true,col:'#ffffff'});
  if(b){ b.hit.add(NB); b.mul=0; }
  P.cineAnim='beam'; if(typeof NBS!=='undefined'){ NBS.fixRow=null; nbsSlash(.4,.3); } Sound.sfx('swing'); Sound.sfx('beam');
  // side-on, the whole duel in frame
  const mx=lerp(P.x,NB.x,.4), mz=lerp(P.z,NB.z,.4), R0=Math.max(16,d0*.75); NP1.cam={x:mx+px*R0,y:gy+5,z:mz+pz*R0,lx:mx,ly:gy+4.5,lz:mz};
  const H=()=>[NB.x,NB.y+2.9,NB.z], aim=(q)=>{ const [hx,hy,hz]=H(), h=(q.x-hx)*E.ux+(q.z-hz)*E.uz; return [Math.atan2(h,q.y-hy),Math.hypot(q.x-hx,q.y-hy,q.z-hz)]; };
  // the blade comes down onto it
  const th0=E.ang, L0=E.len, q0=b?{x:b.x,y:b.y,z:b.z}:{x:lerp(P.x,NB.x,.3),y:gy+1.6,z:lerp(P.z,NB.z,.3)};
  for(let t0=Game.time,u=0;u<1;){ yield wait(0); u=Math.min(1,(Game.time-t0)/.42); const q=b||q0, [th,L]=aim(q); E.ang=lerp(th0,th,u*u); E.len=lerp(L0,L,Math.sqrt(u)); if(b) b.life=Math.max(b.life,1); }
  // locked: they grind, Ali's side slowly winning
  const q=b||q0, c0={x:q.x,y:q.y,z:q.z}; if(b) b.sp=0; let tick=0;
  for(let t0=Game.time,s=0;s<1.8;){ yield wait(0); const nt=Game.time-t0, dt=nt-s; s=nt; const push=Math.min(1.5,s*.9)+Math.sin(s*23)*.15;
    q.x=c0.x+ux*push; q.z=c0.z+uz*push; q.y=c0.y; if(b){ b.life=Math.max(b.life,1); b.g.position.set(q.x,q.y,q.z); }
    const [th,L]=aim(q); E.ang=th; E.len=L;
    for(let i=0;i<4;i++) FX.spawn(q.x,q.y,q.z,rnd(-6,6),rnd(-2,8),rnd(-6,6),.3,[0xffffff,0x3ff4ff,0xff2a3a,0xffd45a][i],.3,6,true);
    tick-=dt; if(tick<=0){ tick=.09; FX.burst(q.x,q.y,q.z,10,Math.random()<.5?0x3ff4ff:0xff2a3a,6,.25); Sound.hiss(900,.1,.12,'bandpass'); Sound.tone('square',rnd(300,600),rnd(150,300),.08,.04); shake(.3);
      const cy=Math.random()<.5; FX.flash=Math.max(FX.flash,.15); grade.uniforms.flashCol.value.set(cy?.4:1,cy?.95:.2,cy?1:.25); if(Math.random()<.25) impactFrame([[3,1]]); }
    NP1.cam.x=lerp(NP1.cam.x,mx+px*R0*.8,dt*.8); NP1.cam.z=lerp(NP1.cam.z,mz+pz*R0*.8,dt*.8); }
  // the explosion; the blade shatters; he's staggered
  npxBoom(q.x,q.y,q.z,kind==='q'?1.3:1); if(b) b.life=0;
  { const [hx,hy,hz]=H(); for(let i=0;i<60;i++){ const u=rnd(0,1), x=lerp(hx,q.x,u), y=lerp(hy,q.y,u), z=lerp(hz,q.z,u); FX.spawn(x,y,z,rnd(-4,4),rnd(-1,5),rnd(-4,4),.6,i%2?0x3ff4ff:0xffffff,.3,6,true); } }
  NP1.ex=null; nbDamage(kind==='q'?36:28,'np1'); if(!NP1.done) np1Stun(4,'OVERPOWERED');
  yield wait(1.1);
  NP1.cam=null; Game.letterTo=0; P.cineFly=false; P.cineAnim=null; P.inv=.8; ALI_CH.force=0; }
// the dense explosion: a white flash ball, a red shell and a black core swelling and collapsing, rings and debris
function npxBoom(x,y,z,s){ s=s||1; const gy=groundY(x,z);
  FX.hitstop=Math.max(FX.hitstop,.28); FX.flash=1; grade.uniforms.flashCol.value.set(1,1,1); JC.flash=1; impactFrame([[1,2],[3,2],[2,2],[1,1]]); shake(1.8*s);
  Sound.sfx('crossboom'); Sound.sfx('slam'); Sound.tone('sawtooth',90,24,1.4,.32); Sound.hiss(300,1.6,.4,'lowpass'); Sound.hiss(3000,.5,.25,'bandpass');
  const sph=(col,add,op)=>{ const m=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false,fog:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending})); m.position.set(x,y,z); m.userData.temp=1; scene.add(m); return m; };
  const white=sph(0xffffff,true,1), red=sph(0xff1a2a,true,.9), black=sph(0x050004,false,.95), k={t:0};
  np1Obj({upd(dt){ k.t+=dt; const t=k.t;
      white.scale.setScalar(Math.max(.01,s*9*Math.min(1,t/.18))); white.material.opacity=Math.max(0,1-t/.45);
      red.scale.setScalar(Math.max(.01,s*7.5*Math.min(1,t/.3))); red.material.opacity=Math.max(0,.9*(1-t/1.1));
      black.scale.setScalar(Math.max(.01,s*6*Math.min(1,t/.35)*(1+.04*Math.sin(t*50)))); black.material.opacity=Math.max(0,.95*(1-Math.max(0,t-.6)/.9));
      if(t<.9) for(let i=0;i<5;i++){ const a=rnd(0,6.283), e=rnd(-.6,1); FX.spawn(x,y,z,Math.cos(a)*18*s,e*12*s,Math.sin(a)*18*s,.5,[0xffffff,0xff1a2a,0x0a0006,0x3ff4ff][i%4],.4,4,i%4!==2); }
      return t<1.5; }, kill(){ for(const m of [white,red,black]){ scene.remove(m); m.geometry.dispose(); } }});
  FX.ring(x,gy+.1,z,'#ffffff',14*s,.6); FX.ring(x,gy+.12,z,'#ff2a3a',10*s,.8);
  FX.burst(x,y,z,90,0xffffff,16*s,.5); FX.burst(x,y,z,70,0xff1a2a,13*s,.7); FX.burst(x,y,z,60,0x0a0006,11*s,.8,false); FX.burst(x,y,z,40,0x3ff4ff,14*s,.5); }
// ---------- hooks ----------
// the answers: a level 3 release or Q, inside the window
(function(){ const cr=aliChargeRelease; aliChargeRelease=function(lv){ const E=NP1.ex;
    if(lv>=3&&E&&E.phase==='window'&&np1On()&&!Game.script){ const b=cr.apply(this,arguments); run(function*(){ yield* npxClash('getsuga',b); }); return b; }
    return cr.apply(this,arguments); }; })();
(function(){ const au=aliUltimate; aliUltimate=function*(){ const E=NP1.ex; if(E&&E.phase==='window'&&np1On()){ yield* npxClash('q',null); return; } yield* au.apply(this,arguments); }; })();
// a level 3 Getsuga released before the glint is swatted away by the blade
(function(){ const ub=updateBeams; updateBeams=function(dt){ try{ const E=NP1.ex; if(E&&E.phase!=='clash'&&NB&&np1On()) for(const b of BEAMS){ if(!b.ali||(b.chLv||0)<3||b.hit.has(NB)) continue;
        if(Math.hypot(NB.x-b.x,NB.z-b.z)<4){ b.hit.add(NB); b.life=0; FX.burst(b.x,b.y,b.z,30,0x9ff8ff,7,.35); Sound.sfx('deflect'); Game.dmgNums.push({x:NB.x,y:NB.y+4.5,z:NB.z,n:'TOO EARLY',t:0,big:true,col:'#9ff8ff'}); } } }catch(e){ console.error('npx early',e); }
    return ub.apply(this,arguments); }; })();
// no Full Counter while he charges it: the press is a plain swing
(function(){ const mj=twMiniJC; twMiniJC=function(){ if(np1On()&&NP1.ex){ const P=Player; if(!P.aliAtk&&!NP1.seq&&!P.cineFly) aliCombo(P.comboT>0?((P.combo||0)+1)%3:0); return; } return mj.apply(this,arguments); }; })();
(function(){ const nu=np1Update; np1Update=function(dt){ const r=nu.apply(this,arguments); try{ npxRavUpd(dt); }catch(e){ console.error('npx ravine',e); } return r; }; })();
(function(){ const nc=np1Clear; np1Clear=function(){ NP1.ex=null; return nc.apply(this,arguments); }; })();
(function(){ const ns=np1Start; np1Start=function(){ npxRavClear(); return ns.apply(this,arguments); }; })();
(function(){ const nr=np1Reset; np1Reset=function(){ npxRavClear(); return nr.apply(this,arguments); }; })();
// the meter: his three levels over the screen (and Ali's own charge under it while he holds)
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ const E=NP1.ex; if(E&&np1On()&&Game.letter<=.5) npxUI(E); }catch(e){ console.error('npx ui',e); } }; })();
function npxUI(E){ const bw=Math.min(UW*.5,420), bx=(UW-bw)/2, by=50, k=Math.min(1,E.t/6), seg=(y,f,lv,on,off)=>{ for(let i=0;i<3;i++){ const x=bx+i*(bw/3)+2, w=bw/3-4, u=Math.max(0,Math.min(1,f*3-i));
      D.fillStyle='rgba(4,10,24,.75)'; D.fillRect(x,y,w,10); D.fillStyle=lv>i?on:off; D.fillRect(x,y,w*u,10); D.strokeStyle='rgba(255,255,255,.55)'; D.lineWidth=1; D.strokeRect(x+.5,y+.5,w-1,9); } };
  E.pulseUI=Math.max(0,E.pulseUI-1/20); D.save(); seg(by,k,E.lv,'#ffffff','#3ff4ff');
  const lab=E.phase==='charge'?(E.lv>=1?'LEVEL '+E.lv:'CHARGING'):E.phase==='window'?'NOW!':'', pu=1+.35*E.pulseUI;
  if(lab){ D.font=`900 ${Math.round(18*pu)}px ${FB}`; D.textAlign='center'; D.textBaseline='bottom'; D.lineWidth=4; D.strokeStyle='#04101e'; D.strokeText('STARBREAKER  ·  '+lab,UW/2,by-4);
    D.fillStyle=E.phase==='window'?`hsl(${(Game.time*600)%360},100%,65%)`:'#9ff8ff'; D.fillText('STARBREAKER  ·  '+lab,UW/2,by-4); }
  const P=Player; if((P.charge||0)>.25&&E.phase!=='clash'){ const y2=by+18, alv=aliChargeLv(P.charge); seg(y2,Math.min(1,P.charge/ALI_CH.T[2]),alv,'#ff3a4a','#a01828');
    D.font=`800 16px ${FB}`; D.textAlign='center'; D.textBaseline='top'; D.lineWidth=4; D.strokeStyle='#1a0408'; const t='GETSUGA  LV '+alv; D.strokeText(t,UW/2,y2+14); D.fillStyle='#ffb0b8'; D.fillText(t,UW/2,y2+14); }
  D.restore(); }
