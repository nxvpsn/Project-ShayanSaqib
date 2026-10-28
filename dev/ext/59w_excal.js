// =====================================================================
// NATHAN'S STARBREAKER (phase I on Ali's road, move 'excal'): he blinks 22 units away and raises his laser sword; it
// charges in three levels, NPX.lvT each (a meter over the screen: CHARGING, LEVEL 1, 2, 3), a blue blade-line out of the hilt
// growing with it, and at level 3 it reaches straight up into the sky (the planet-cutter): the rainbow glint zig-zags up it
// as five impact frames, the sword flares (blue lines fanning off it), he holds NPX.flareT, then the DEEP RED with sparks is
// the parry's timing. From the rainbow on, a LEVEL 3 Getsuga (08d_alicharge.js) or Ali's Q answers it. Either one
// clashes with the blade for a moment, then a dense explosion staggers him for 4s. Released before the glint, the level 3
// Getsuga is swatted away (TOO EARLY). No answer: the blade comes down along a line locked on the glint (a dark strip on the
// ground). Out of the line it only cuts the ground, leaving a black ravine for the rest of the fight: walk into it and you
// fall to your death (floating or jumping over is fine). In the line: a huge hit that throws you clear of the cut.
// The Q answer (my cinematic): time stops, a low shot up Ali's black-and-red sky column, a colossal Jujishou, the clash.
// The clash, from over Ali's shoulder: the blade meets the Jujishou and it starts to give; Ali dashes in with the Full Counter
// and drives it into Nathan; on the brink he stops time (grey), blinks into the sky and watches the explosion from above.
// =====================================================================
const NPX={L:[3.5,9,24,260],W:[.16,.32,.6,1.3],lvT:2.8,flareT:1,swing:.12,half:1.3,mashT:4,rav:[],fall:null,spd:null}; /* flareT: his hold after the level 3 flare, before the deep red */
// ---------- the move ----------
NP1M.excal=function*(){ const E=npxStart();
  twBark('nathan',"Stand still, wanderer. This one cuts planets.",true);
  np1Hint('excal','STARBREAKER: hold '+K('block')+' from his first level and let the LEVEL 3 Getsuga go once his hits level 3 (the rainbow); or parry the DEEP RED and mash; or blink ('+K('dash')+') right before it lands');
  while(E.t<NPX.lvT*3){ E.beat=E.clock; const dt=NP1.dt; E.t+=dt; const lv=Math.min(3,Math.floor(E.t/NPX.lvT)); if(lv>E.lv){ E.lv=lv; npxLevel(E,lv); } yield dt; } /* slower than Ali's: his level 3 comes first */
  // level 3: the line locks onto Ali; the rainbow glint zig-zags up the blade as five impact frames
  { const [dx,dz]=np1Dir(); E.ux=dx; E.uz=dz; } E.phase='window'; E.lock=1; E.landT=Game.time+.4+NPX.flareT+NP1_TELL+NPX.swing;
  // five rainbow glints on the blade in the owner's order (upper-left, lower-right, lower-left, upper-right, the centre), each a Nakamura smear impact frame (npxSmear)
  for(let i=0;i<5;i++){ E.beat=E.clock; const px=-E.uz, pz=E.ux, side=NPX_GLINTS[i][0]*3, h=NB.y+2.9+NPX_GLINTS[i][1], gx=NB.x+px*side, gz=NB.z+pz*side; /* px,pz: Ali's screen-left */
    npxGlint(gx,h,gz); impactFrame([[1,3]]); npxSmearAt(gx,h,gz,3); FX.flash=.6; grade.uniforms.flashCol.value.set(1,1,1); FX.hitstop=Math.max(FX.hitstop,.03); Sound.tone('square',900+i*300,900+i*300,.05,.07); Sound.sfx(i===4?'crossboom':'deflect'); shake(.3+i*.08);
    for(let w=0;w<.08;){ const dt=NP1.dt; w+=dt; E.beat=E.clock; if(E.phase!=='window') return; yield dt; } }
  // the flare: a heavy sound, the sword charging even more: blue lines fanning off the blade, the blade pulsing wider
  npxFlare(E);
  for(let w=0;w<NPX.flareT;){ E.beat=E.clock; if(E.phase!=='window') return; const dt=NP1.dt; w+=dt; if(E.lock){ const [dx,dz]=np1Dir(); E.ux=dx; E.uz=dz; } yield dt; }
  // the deep red with sparks: the parry's timing; the line it will cut appears
  np1Tell('deep'); E.deep=1; E.landT=Game.time+NP1_TELL+NPX.swing; /* re-anchored: the impact frames' hitstops drift it */ npxSparks(E); npxLine(E);
  for(let w=0;w<NP1_TELL;){ E.beat=E.clock; if(E.phase!=='window') return; const dt=NP1.dt; w+=dt; if(E.lock){ const [dx,dz]=np1Dir(); E.ux=dx; E.uz=dz; } E.ang=lerp(0,-.3,Math.min(1,w/NP1_TELL)); yield dt; }
  // the swing: so fast there's no running out of it (NPX.swing); it unlocks halfway down
  E.phase='swing'; if(typeof NBS!=='undefined'){ NBS.fixRow=null; nbsSlash(.2,.4); } Sound.sfx('swing'); Sound.sfx('beam'); Sound.tone('sawtooth',400,60,.3,.14); Sound.hiss(1200,.2,.3,'bandpass');
  const hy=NB.y+2.9, th0=E.ang; let th1=0;
  for(let s=0;s<NPX.swing;){ E.beat=E.clock; const dt=NP1.dt; s+=dt; const u=Math.min(1,s/NPX.swing); if(u<.5&&E.lock){ const [dx,dz]=np1Dir(); E.ux=dx; E.uz=dz; }
    const P=Player, D=Math.max(6,(P.x-NB.x)*E.ux+(P.z-NB.z)*E.uz); th1=Math.atan2(D,-(hy-groundY(NB.x+E.ux*D,NB.z+E.uz*D))); E.ang=lerp(th0,th1,u*u); yield dt; }
  E.ang=th1; E.phase='cut'; if(npxImpact(E)==='mash') return; /* parried: the mash takes over */
  for(let s=0;s<.8;){ E.beat=E.clock; const dt=NP1.dt; s+=dt; E.fade=Math.max(0,1-s/.8); yield dt; }
  NP1.ex=null; yield .6; };
// he blinks far off (on the far side of where he was, so he stays in front of the camera) and raises the blade
function npxStart(){ const P=Player, [dx,dz]=np1Dir();
  FX.burst(NB.x,NB.y+2,NB.z,30,0x9ff8ff,6,.35); nbAfterimage(NB.x,NB.y,NB.z); NB.dsh=null; NB.x=P.x-dx*22; NB.z=P.z-dz*22; NP1.alt=null;
  FX.burst(NB.x,NB.y+2,NB.z,30,0xffffff,6,.35); Sound.sfx('qbRoar'); Sound.tone('sine',1800,300,.3,.08);
  if(typeof NBS!=='undefined') NBS.fixRow=3; /* the sword raised */
  const E={t:0,lv:-1,phase:'charge',nx:NB.x,nz:NB.z,ang:0,len:NPX.L[0],w:NPX.W[0],dl:NPX.L[0],ux:dx,uz:dz,beat:0,clock:0,fade:1,pulse:0,pulseUI:0,snap:0};
  NP1.ex=E; npxSword(E); return E; }
function npxLevel(E,lv){ E.pulse=1; if(lv<1) return; E.len=NPX.L[lv]; E.w=NPX.W[lv]; E.pulseUI=1; npxBladeLine(E,lv);
  const hx=NB.x, hy=NB.y+2.9, hz=NB.z; FX.burst(hx,hy,hz,20+lv*15,0x9ff8ff,5+lv*2,.4); FX.burst(hx,hy,hz,15+lv*10,0xffffff,4+lv*2,.3); FX.ring(hx,groundY(hx,hz)+.1,hz,'#3ff4ff',2+lv*1.5,.5); shake(.2+lv*.2);
  Sound.tone('sawtooth',120+lv*60,600+lv*300,.5,.1); Sound.hiss(2000+lv*1000,.4,.15+lv*.05,'bandpass');
  if(lv===3){ Sound.sfx('choir'); Sound.sfx('crossboom'); FX.flash=Math.max(FX.flash,.4); grade.uniforms.flashCol.value.set(.5,.95,1); twBark('nathan',"Level three. Look up.",true); }
  Game.dmgNums.push({x:hx,y:hy+2,z:hz,n:'LEVEL '+lv,t:0,big:true,col:'#9ff8ff'}); }
// the charge's light: the Assault Rush's blue Judgement Cut blade-line, out of the hilt along the blade, wider each level,
// following the blade's length and angle every frame until the cut
function npxBladeLine(E,lv){ if(E.gash) E.gash.life=0; E.gash=twGash({life:60,rev:.05,fade:.3,w:16+lv*10,op:.95,taper:.1,sparks:6+lv*6,blue:1,alive:()=>NP1.ex===E&&E.phase!=='cut'&&E.phase!=='clash',
    pts:()=>{ const s=Math.sin(E.ang), c=Math.cos(E.ang), dx=E.ux*s, dy=c, dz=E.uz*s, hx=NB.x, hy=NB.y+2.9, hz=NB.z, L=Math.min(E.dl,70); return np1LinePts(hx,hy,hz,hx+dx*L,hy+dy*L,hz+dz*L,1); }}); }
// the level 3 flare: six blue lines fanning out of the hilt beside the blade, the blade wider, the air shaking
const NPX_GLINTS=[[1,13],[-1,4],[1,4],[-1,13],[0,8.5]]; /* [screen side (+1 = Ali's left), height up the blade] in flash order */
function npxFlare(E){ const hx=NB.x, hy=NB.y+2.9, hz=NB.z, px=-E.uz, pz=E.ux; E.w=NPX.W[3]*1.45; E.pulse=1.5;
  Sound.sfx('crossboom'); Sound.sfx('choir'); Sound.tone('sawtooth',40,90,1.4,.3); Sound.hiss(250,1.6,.5,'lowpass'); Sound.hiss(4500,.5,.3,'bandpass'); shake(1.6); FX.flash=1; grade.uniforms.flashCol.value.set(.5,.95,1); impactFrame([[1,2],[3,2],[2,1]]); FX.hitstop=Math.max(FX.hitstop,.12);
  npxFlames(E);
  FX.burst(hx,hy+6,hz,80,0x3ff4ff,12,.5); FX.burst(hx,hy+6,hz,50,0xffffff,9,.4); FX.ring(hx,groundY(hx,hz)+.1,hz,'#3ff4ff',14,.9); FX.ring(hx,groundY(hx,hz)+.12,hz,'#ffffff',8,.7);
  for(let i=0;i<60;i++){ const a=rnd(0,6.283), d=rnd(2,12); FX.spawn(hx+Math.cos(a)*d,groundY(hx,hz)+.2,hz+Math.sin(a)*d,0,rnd(3,8),0,.9,i%2?0x9a9080:0x3ff4ff,.35,6,i%2===0); }
  if(typeof TPS!=='undefined'){ TPS.kick=.6; TPS.fovK=6; } twBark('nathan',"Now it's a star.",true); }
// the flare's body: Ali's charge flames in blue (fireball_burn_blue), six pairs fanning out and up off the blade's lower stretch, huge for his sword, and a stack climbing the blade;
// they live through the hold and the deep red and go out at the swing
function npxFlames(E){ const F={t:0,side:[],up:[]}; E.flames=F; const ns=6; if(!pxvOk('fireball_burn_blue')) return;
  for(let i=0;i<ns*2;i++){ const e=pxvPlay('fireball_burn_blue',{x:NB.x,y:NB.y+4,z:NB.z,size:3.2,depth:false,add:true}); if(!e) break; e.noAim=true; F.side.push(e); }
  for(let i=0;i<4;i++){ const e=pxvPlay('fireball_burn_blue',{x:NB.x,y:NB.y+4,z:NB.z,size:4.2,depth:false,add:true}); if(!e) break; e.noAim=true; F.up.push(e); }
  np1Obj({upd(dt){ F.t+=dt; const alive=NP1.ex===E&&E.phase==='window'; const hx=NB.x, hy=NB.y+2.9, hz=NB.z, px=-E.uz, pz=E.ux, grow=Math.min(1,F.t/.35);
      F.side.forEach((e,i)=>{ const sg=i%2?1:-1, j=Math.floor(i/2), u=j/(ns-1), y=hy+1.5+u*16, off=(1.4+u*2.8)*grow*(1+.1*Math.sin(F.t*11+i)); e.m.position.set(hx+px*off*sg,y+.4*Math.sin(F.t*9+i),hz+pz*off*sg); e.m.material.rotation=-sg*(.6+.1*Math.sin(F.t*7+i)); const sz=(3.2+u*2.2)*grow*(.8+.2*Math.sin(F.t*15+i*1.3)); e.m.scale.set(sz*(e.A.w/e.A.h),sz,1); e.m.material.opacity=.95; });
      F.up.forEach((e,i)=>{ const h=i*2.6, wob=Math.sin(F.t*9+i*1.7)*.25; e.m.position.set(hx+px*wob,hy+2+h*grow,hz+pz*wob); const sz=(4.2-i*.5)*grow*(1+.07*Math.sin(F.t*17+i*2)); e.m.scale.set(sz*(e.A.w/e.A.h),sz,1); e.m.material.opacity=Math.max(.4,1-i*.15); });
      return alive; }, kill(){ for(const e of F.side.concat(F.up)) try{ pxvStop(e); }catch(x){} } }); }
// the Nakamura smear: for a few frames, hand-drawn scribble lines streaking out from the glint over the black-and-white frame, a white core, black masses at the sides
function npxSmearAt(x,y,z,n){ NPX.smear={x,y,z,n,seed:Math.random()*1e4}; }
function npxSmear(){ const S=NPX.smear; if(!S||S.n<=0) return; S.n--; const q=toScreen(S.x,S.y,S.z); if(q[2]>1) return; const cx=Math.max(-UW*.2,Math.min(UW*1.2,q[0])), cy=Math.max(-UH*.2,Math.min(UH*1.2,q[1])), R=Math.hypot(UW,UH);
  let sd=S.seed+S.n*77; const rr=()=>{ sd=(sd*9301+49297)%233280; return sd/233280; };
  D.save(); D.lineCap='round';
  for(let i=0;i<260;i++){ const a=rr()*6.283, r0=60+rr()*90, len=R*(.25+rr()*.9), w=.6+rr()*rr()*4; D.strokeStyle=rr()<.12?'#ffffff':'#000000'; D.lineWidth=w; D.beginPath(); let px=cx+Math.cos(a)*r0, py=cy+Math.sin(a)*r0; D.moveTo(px,py);
    for(let k=1;k<=5;k++){ const t=k/5, jit=(rr()-.5)*8*t; px=cx+Math.cos(a)*(r0+len*t)+Math.cos(a+1.57)*jit; py=cy+Math.sin(a)*(r0+len*t)+Math.sin(a+1.57)*jit; D.lineTo(px,py); } D.stroke(); }
  for(let i=0;i<7;i++){ const a=rr()*6.283, r0=R*(.22+rr()*.3), sp=.18+rr()*.25; D.fillStyle='#000000'; D.beginPath(); D.moveTo(cx+Math.cos(a-sp)*r0,cy+Math.sin(a-sp)*r0); /* the black masses, scribble-edged */
    for(let k=0;k<=8;k++){ const b=a-sp+sp*2*k/8, rk=r0+(rr()-.5)*60; D.lineTo(cx+Math.cos(b)*rk,cy+Math.sin(b)*rk); } D.lineTo(cx+Math.cos(a+sp)*R,cy+Math.sin(a+sp)*R); D.lineTo(cx+Math.cos(a-sp)*R,cy+Math.sin(a-sp)*R); D.closePath(); D.fill(); }
  const g=D.createRadialGradient(cx,cy,0,cx,cy,110); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.55,'rgba(255,255,255,.9)'); g.addColorStop(1,'rgba(255,255,255,0)'); D.fillStyle=g; D.fillRect(cx-120,cy-120,240,240); D.restore(); }
// the deep red's sparks: steel grinding off the hilt and the ground cracking red
function npxSparks(E){ const hx=NB.x, hy=NB.y+2.9, hz=NB.z; for(let i=0;i<4;i++){ FX.spark(hx+rnd(-.4,.4),hy+rnd(-.3,.6),hz+rnd(-.4,.4)); } FX.burst(hx,hy,hz,40,0xff2a3a,8,.35); FX.burst(hx,hy,hz,20,0x5a0008,6,.4);
  for(let i=0;i<8;i++){ const a=i/8*6.283+rnd(-.2,.2); FX.line(hx+Math.cos(a)*1.2,hz+Math.sin(a)*1.2,a,rnd(2,5),.14,0xff2a3a,.9); } Sound.sfx('deflect'); Sound.tone('sawtooth',160,40,.5,.14); shake(.5); }
// ---------- his blade: cyan with a white core inside a dark sheath (it reads against the bright sky) ----------
function npxSword(E){ const outer=beamMesh(0x3ff4ff,1), core=beamMesh(0xffffff,.42), g=new THREE.CylinderGeometry(1.7,1.7,1,10,1,true); g.rotateX(Math.PI/2); g.translate(0,0,.5);
  const dark=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x041030,transparent:true,opacity:.5,depthWrite:false,fog:false})); scene.add(dark);
  E.ms=[dark,outer,core]; for(const m of E.ms) m.userData.temp=1;
  np1Obj({upd(dt){ if(NP1.ex!==E) return false; npxDraw(E,dt); return true; },
    kill(){ for(const m of E.ms){ scene.remove(m); try{ m.geometry.dispose(); }catch(e){} } if(typeof NBS!=='undefined') NBS.fixRow=null; if(NP1.ex===E) NP1.ex=null; }}); }
function npxDraw(E,dt){ E.clock+=dt; if(Game.script) E.beat=E.clock;
  if(E.phase!=='clash'&&E.phase!=='mash'&&E.clock-E.beat>.3){ NP1.ex=null; return; } /* the move was cut short (a stagger, a Full Counter, a retry) */
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
// the line it will cut: a dark strip, pulsing, swung round to follow Ali until the blade is halfway down
function npxLine(E){ const m=npxStrip(0,0,1,0,140,NPX.half,0,.06,new THREE.MeshBasicMaterial({color:0x0a0420,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide})), k={t:0};
  const gy=groundY(NB.x,NB.z); np1Obj({upd(dt){ k.t+=dt; m.material.opacity=.45+.2*Math.sin(k.t*18); m.position.set(NB.x+E.ux,gy-groundY(0,0),NB.z+E.uz); m.rotation.y=-Math.atan2(E.uz,E.ux); return NP1.ex===E&&(E.phase==='window'||E.phase==='swing'); }, kill(){ scene.remove(m); m.geometry.dispose(); }}); }
// the perfect dodge: a blink in the last NP1_WIN before it lands is a sideways dash out of the line, through near-frozen time
(function(){ const at=aliTeleport; aliTeleport=function(mx,mz){ try{ const E=NP1.ex; if(E&&(E.phase==='window'||E.phase==='swing')&&np1On()&&!NP1.seq){ const left=E.landT-Game.time; if(left<=NP1_WIN&&left>=-.05){ npxDodge(mx,mz); return; } } }catch(e){ console.error('npx dodge',e); } return at.apply(this,arguments); }; })();
function npxDodge(mx,mz){ const E=NP1.ex, P=Player, px=-E.uz, pz=E.ux; E.lock=0; /* the dodge beats the lock: the line stays where it was */ let sg=(mx||0)*px+(mz||0)*pz; if(Math.abs(sg)<.1){ const rx=P.x-NB.x, rz=P.z-NB.z; sg=(-rx*E.uz+rz*E.ux)>=0?1:-1; } sg=sg>=0?1:-1;
  NP1.seq={k:'xdodge',t:0,sx:P.x,sz:P.z,ex:P.x+px*sg*6,ez:P.z+pz*sg*6,gt:0}; P.cineFly=true; P.cineAnim='run'; P.aliAtk=null; P.charge=0; P.vx=P.vz=0; P.inv=99; P.ang=Math.atan2(pz*sg,px*sg);
  Game.slowT=1; np1PdLook(true); shake(.35); FX.flash=.45; grade.uniforms.flashCol.value.set(.45,.7,1); NPX.spd={t:0};
  Sound.tone('sine',2400,3800,.25,.14); Sound.tone('triangle',1200,1900,.22,.1); Sound.sfx('whoosh'); Sound.sfx('dash'); Sound.tone('sine',120,38,.4,.28); Sound.hiss(2600,.4,.14,'bandpass');
  try{ const g=aliGhost(P.x,P.y,P.z); if(g&&g.mesh){ g.mesh.material.color.setHex(0x6ab8ff); g.mesh.scale.multiplyScalar(1.25); } }catch(e){} FX.burst(P.x,P.y+1,P.z,40,0x3a8aff,7,.45); FX.ring(P.x,P.y+.1,P.z,'#6ab8ff',3,.35);
  Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'PERFECT DODGE',t:0,big:true,col:'#8fc4ff'}); }
function npxDodgeUpd(S,rdt){ const P=Player, u=Math.min(1,S.t/.26), e=u>=1?1:1-Math.pow(2,-10*u); P.x=lerp(S.sx,S.ex,e); P.z=lerp(S.sz,S.ez,e); P.y=groundY(P.x,P.z)+Math.sin(u*Math.PI)*.3; P.cineAnim=u<1?'run':'idle'; if(typeof TPS!=='undefined'&&TPS.f) P.f=TPS.f;
  S.gt-=rdt; if(u<1&&S.gt<=0){ S.gt=.016; try{ const g=aliGhost(P.x,P.y,P.z); if(g&&g.mesh) g.mesh.material.color.setHex(0x6ab8ff); }catch(e){} }
  if(u<1) for(let i=0;i<4;i++) FX.spawn(P.x+rnd(-.4,.4),P.y+rnd(.2,2),P.z+rnd(-.4,.4),(S.sx-S.ex)*rnd(1,3),rnd(-.3,.6),(S.sz-S.ez)*rnd(1,3),.4,i%2?0x3a8aff:0xffffff,.3,0,true);
  try{ if(typeof TPS!=='undefined'&&TPS.on){ camera.fov=S.t<.1?TPS.FOV+16*(S.t/.1):TPS.FOV+6+10*Math.exp(-(S.t-.1)*7); camera.updateProjectionMatrix(); } }catch(e){}
  if(S.t>=.75){ NP1.seq=null; np1PdLook(false); Game.slowT=0; P.cineFly=false; P.cineAnim=null; P.inv=.6; Sound.hiss(1800,.3,.12,'bandpass'); } }
// ---------- the blade lands ----------
function npxImpact(E){ const P=Player, x0=NB.x, z0=NB.z, ux=E.ux, uz=E.uz;
  shake(1.4); FX.flash=Math.max(FX.flash,.5); grade.uniforms.flashCol.value.set(.6,.95,1); impactFrame([[1,1],[3,1]]); Sound.sfx('crossboom'); Sound.sfx('slam'); Sound.tone('sawtooth',80,30,.9,.25); Sound.hiss(500,1,.3,'lowpass');
  // Ali in its line: a well-timed press parries it (the mash), a hit is huge and throws him clear of the cut
  const rx=P.x-x0, rz=P.z-z0, al=rx*ux+rz*uz, pe=-rx*uz+rz*ux;
  if(al>-1&&Math.abs(pe)<NPX.half+.35&&!P.cineFly){ const r=twHitP(8,P.x-ux*1.2,P.z-uz*1.2,{melee:true,heavy:true,win:NP1_WIN}); if(r==='parry'){ npxMash(E); return 'mash'; }
    if(r==='hit'){ const sg=pe>=0?1:-1, out=NPX.half+1.2-Math.abs(pe); P.x+=-uz*sg*out; P.z+=ux*sg*out; P.y=Math.max(P.y,groundY(P.x,P.z)); } }
  npxRavine(x0+ux*1.5,z0+uz*1.5,ux,uz,140);
  for(let i=0;i<40;i++){ const d=rnd(2,40), x=x0+ux*d, z=z0+uz*d, y=groundY(x,z); FX.spawn(x+rnd(-1,1),y+.2,z+rnd(-1,1),rnd(-2,2),rnd(3,9),rnd(-2,2),.8,i%3?0x6a6050:0x9ff8ff,.5,8,i%3===0); } }
// ---------- the parry: the blade stops on Ali's sword; mash to hold it, then cut it in half ----------
function npxMash(E){ const P=Player, [dx,dz]=np1Dir(), fx=-dx, fz=-dz, px=-fz, pz=fx; E.phase='mash'; NP1.gen=null; NP1.lunge=0; NP1.charging=0;
  NP1.seq={k:'xmash',t:0,m:.12,n:0,E,done:0,g:0}; P.cineFly=true; P.cineAnim='block'; P.aliAtk=null; P.charge=0; P.vx=P.vz=P.vy=0; P.inv=99; P.ang=Math.atan2(fz,fx); P.f=fx>=0?1:-1; Game.letterTo=.5;
  np1Hint('mash','MASH '+K('attack')+': hold the blade back and cut it in half'); if(typeof twBig==='function') twBig('MASH '+K('attack')+'!',{size:50,col:'#ffffff',y:UH*.3,dur:1});
  Sound.sfx('parry'); Sound.sfx('crossboom'); Sound.tone('sawtooth',80,30,.6,.2); FX.hitstop=Math.max(FX.hitstop,.22); impactFrame([[1,2],[3,2],[2,1]]); shake(1.2); FX.flash=.6; grade.uniforms.flashCol.value.set(1,1,1);
  npStar(P.x+fx*.9,P.y+1.6,P.z+fz*.9,0xffffff,2.6,.4); FX.burst(P.x+fx*.9,P.y+1.6,P.z+fz*.9,40,0xffffff,8,.3); FX.ring(P.x,P.y+.1,P.z,'#ffffff',4,.5);
  Game.dmgNums.push({x:P.x,y:P.y+3.2,z:P.z,n:'PARRIED!',t:0,big:true,col:'#ffffff'}); twBark('nathan',"You caught it?!",true);
  NP1.cam={x:P.x-fx*2.4+px*5.2,y:P.y+2.2,z:P.z-fz*2.4+pz*5.2,lx:P.x+fx*.8,ly:P.y+2.6,lz:P.z+fz*.8}; /* off to Ali's side: him holding the blade back, in profile */ }
function npxMashUpd(S,dt){ const P=Player, E=S.E, [dx,dz]=np1Dir(), fx=-dx, fz=-dz; if(!E||NP1.ex!==E){ npxMashEnd(S); return; }
  // the blade bears down on his sword; the meter pushes it back up
  const q={x:P.x+fx*.8,y:P.y+1.5+S.m*2.2,z:P.z+fz*.8}, hx=NB.x, hy=NB.y+2.9, hz=NB.z, h=(q.x-hx)*E.ux+(q.z-hz)*E.uz; E.ang=Math.atan2(h,q.y-hy); E.len=Math.hypot(q.x-hx,q.y-hy,q.z-hz)+6; E.snap=1;
  if(!S.done){ if(consume('attack')){ S.m=Math.min(1,S.m+.085); S.n++; FX.spark(q.x,q.y,q.z); FX.spark(q.x,q.y+.3,q.z); Sound.sfx(S.n%2?'deflect':'parry'); Sound.tone('square',rnd(900,1500),rnd(300,600),.06,.05); shake(.5); if(typeof TPS!=='undefined') TPS.kick=(TPS.kick||0)-.12; if(S.n%3===0) impactFrame([[3,1]]); P.cineAnim='aliS1'; S.sw=.1; if(S.m>=1){ S.done=1; S.cutT=S.t; npxCut(S,q); return; } }
    S.m=Math.max(0,S.m-dt*.2); S.sw=(S.sw||0)-dt; if(S.sw<=0) P.cineAnim='block';
    if(Math.random()<.7) FX.spawn(q.x+rnd(-.3,.3),q.y+rnd(-.2,.2),q.z+rnd(-.3,.3),rnd(-5,5),rnd(1,6),rnd(-5,5),.25,Math.random()<.5?0xfff0b0:0x3ff4ff,.16,12,true); /* steel grinding */
    FX.shake=Math.max(FX.shake||0,.12+S.m*.45); S.g-=dt; if(S.g<=0){ S.g=.1; Sound.hiss(1100,.1,.1,'bandpass'); const cy=Math.random()<.5; FX.flash=Math.max(FX.flash,.1); grade.uniforms.flashCol.value.set(cy?.4:1,cy?.95:1,1); }
    if(S.t>NPX.mashT){ S.done=2; S.cutT=S.t; npxCrush(S); } }
  else if(S.t-S.cutT>(S.done===1?.8:.3)) npxMashEnd(S); }
// the cut: a giant tear across the blade, it splits, the far half spins off and dissipates; a full Full Counter charge; he's down 5s
function npxCut(S,q){ const P=Player, E=S.E, [dx,dz]=np1Dir(), fx=-dx, fz=-dz, px=-fz, pz=fx;
  Game.slowT=Math.max(Game.slowT||0,.6); FX.hitstop=Math.max(FX.hitstop,.35); impactFrame([[1,3],[3,3],[2,2],[1,1]]); JC.flash=1; FX.flash=1; grade.uniforms.flashCol.value.set(1,1,1); shake(1.8);
  Sound.sfx('crossboom'); Sound.sfx('slam'); Sound.sfx('glass'); Sound.sfx('swing'); Sound.tone('sawtooth',70,18,1,.26); P.cineAnim='aliS2';
  twGash({life:1,rev:.05,fade:.4,w:60,op:1,sparks:60,pts:()=>twArcPts(q.x,q.y+.5,q.z,px,pz,4.5,-1.1,1.1,9)});
  try{ const sq=toScreen(q.x,q.y,q.z); JC.lines.push({x0:sq[0]-700,y0:sq[1]+40,x1:sq[0]+700,y1:sq[1]-40,t:0,ttl:.6}); }catch(e){}
  // the halves: the hilt end stays and fades on him, the far end tumbles away
  const hx=NB.x, hy=NB.y+2.9, hz=NB.z, L=Math.hypot(q.x-hx,q.y-hy,q.z-hz)||1, dir={x:(q.x-hx)/L,y:(q.y-hy)/L,z:(q.z-hz)/L}; for(const m of E.ms) m.visible=false;
  const near=beamMesh(0x3ff4ff,.9), far=beamMesh(0x3ff4ff,.9), farC=beamMesh(0xffffff,.35); for(const m of [near,far,farC]) m.userData.temp=1;
  near.position.set(hx,hy,hz); near.lookAt(hx+dir.x,hy+dir.y,hz+dir.z+1e-4); near.scale.set(1,1,L); const k={t:0}, FL=Math.max(30,E.len-L);
  np1Obj({upd(dt){ k.t+=dt; const u=k.t/1.3, a=Math.max(0,1-u); near.material.opacity=a*.9; near.scale.x=near.scale.y=Math.max(.01,a);
      const ox=q.x+px*k.t*9+dir.x*(FL/2)*(1+k.t*.3), oy=q.y+k.t*6-k.t*k.t*4+dir.y*(FL/2), oz=q.z+pz*k.t*9+dir.z*(FL/2)*(1+k.t*.3); for(const m of [far,farC]){ m.position.set(ox,oy,oz); m.rotation.z+=dt*4; m.scale.set(Math.max(.01,a*(m===far?1:1)),Math.max(.01,a),Math.max(.01,FL)); m.lookAt(ox+dir.x+px*k.t*1.5,oy+dir.y+k.t,oz+dir.z+pz*k.t*1.5); m.material.opacity=a*(m===far?.8:.5); }
      if(Math.random()<.8) FX.spawn(ox+rnd(-1,1),oy+rnd(-1,1),oz+rnd(-1,1),rnd(-3,3),rnd(-1,4),rnd(-3,3),.5,0x3ff4ff,.3,0,true); return u<1; },
    kill(){ for(const m of [near,far,farC]){ scene.remove(m); try{ m.geometry.dispose(); }catch(e){} } }});
  FX.burst(q.x,q.y,q.z,80,0xffffff,12,.4); FX.burst(q.x,q.y,q.z,50,0x3ff4ff,10,.5); FX.ring(P.x,P.y+.1,P.z,'#ffffff',10,.7);
  P.counter=5; TW.cReadyT=0; Sound.sfx('counter'); Sound.sfx('ready'); FX.ring(P.x,P.y+.1,P.z,'#3a8aff',3.4,.6); Game.dmgNums.push({x:P.x,y:P.y+3.6,z:P.z,n:'FULL COUNTER READY',t:0,big:true,col:'#8fc4ff'});
  if(typeof twBig==='function') twBig('BLADE CUT',{size:64,col:'#9ff8ff',y:UH*.28,dur:1.3}); twBark('nathan',"My... blade...",true); if(typeof TPS!=='undefined'){ TPS.kick=.7; TPS.fovK=-8; } }
// the mash ran out: the blade comes down on him
function npxCrush(S){ const P=Player, E=S.E; Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'CRUSHED',t:0,big:true,col:'#ff6a6a'}); hurtPlayer(8,NB.x,NB.z); P.inv=99; P.hurt=0; P.cineFly=true; P.cineAnim='hurt'; FX.hitstop=.2; shake(1.4); impactFrame([[1,2],[3,2]]); Sound.sfx('slam'); Sound.sfx('crossboom');
  const [dx,dz]=np1Dir(); E.phase='cut'; npxRavine(NB.x+E.ux*1.5,NB.z+E.uz*1.5,E.ux,E.uz,140); S.shove={sx:P.x,sz:P.z,dx:-E.uz*((P.x-NB.x)*-E.uz+(P.z-NB.z)*E.ux>=0?1:-1),dz:E.ux*((P.x-NB.x)*-E.uz+(P.z-NB.z)*E.ux>=0?1:-1)}; P.x+=S.shove.dx*3; P.z+=S.shove.dz*3; P.y=groundY(P.x,P.z); }
function npxMashEnd(S){ const P=Player, E=S.E; NP1.seq=null; NP1.cam=null; Game.letterTo=0; P.cineFly=false; P.cineAnim=null; P.inv=S.done===1?1:.6; Game.slowT=0; if(E&&NP1.ex===E) NP1.ex=null;
  if(S.done===1&&!NP1.done){ np1Stun(5,'BLADE CUT'); try{ if(typeof npPosture==='function') npPosture(50,'bladecut'); }catch(e){} const [dx,dz]=np1Dir(); nbBoost(NB.x-dx*2,NB.z-dz*2); } }
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
  const d0=Math.hypot(NB.x-P.x,NB.z-P.z)||1, ux=(NB.x-P.x)/d0, uz=(NB.z-P.z)/d0, px=-uz, pz=ux, gy=groundY(P.x,P.z), gN=groundY(NB.x,NB.z);
  P.ang=Math.atan2(uz,ux); P.f=ux>=0?1:-1; E.ux=-ux; E.uz=-uz; /* his blade comes down toward Ali */
  // Ali's point of view: over his shoulder, down the line at the blade
  const pov=(back,up,side,ahead,lh)=>({x:P.x-ux*back+px*side,y:P.y+up,z:P.z-uz*back+pz*side,lx:P.x+ux*ahead,ly:P.y+lh,lz:P.z+uz*ahead});
  const follow=(B,k)=>{ for(const key in B) NP1.cam[key]=lerp(NP1.cam[key],B[key],k); }, fov=v=>{ try{ camera.fov=v; camera.updateProjectionMatrix(); }catch(e){} };
  const edge=(cy,a)=>{ FX.flash=Math.max(FX.flash,a); grade.uniforms.flashCol.value.set(cy?.4:1,cy?.95:.2,cy?1:.25); };
  if(kind==='q'){ P.sp=0; P.cineAnim='charge'; ALI_CH.force=3; zwStart(); Voice.stop();
    Game.dmgNums.push({x:P.x,y:P.y+3.4,z:P.z,n:'GETSUGA TENSHOU',t:0,big:true,col:'#ff3a4a'});
    NP1.cam={x:P.x-ux*3.5+px*2,y:gy+.8,z:P.z-uz*3.5+pz*2,lx:P.x+ux*3,ly:gy+5,lz:P.z+uz*3}; fov(62);
    yield* npxCamTo({x:P.x-ux*7+px*5,y:gy+3,z:P.z-uz*7+pz*5,lx:lerp(P.x,NB.x,.5),ly:gy+9,lz:lerp(P.z,NB.z,.5)},1.1);
    Voice.bark('aliGetsugaBig'); yield wait(.5); zwEnd(); ALI_CH.force=0;
    const n0=BEAMS.length; aliGetsuga(true); b=BEAMS.length>n0?BEAMS[BEAMS.length-1]:null; if(b){ if(b.pxv) b.pxv.sz*=2.6; b.g.scale.multiplyScalar(2); }
    FX.flash=.8; grade.uniforms.flashCol.value.set(1,.1,.15); shake(1.2); Sound.sfx('slam'); FX.burst(P.x,P.y+1.6,P.z,80,0xff1a2a,10,.45); FX.burst(P.x,P.y+1.6,P.z,60,0x0a0006,9,.5,false); }
  else { Game.dmgNums.push({x:P.x,y:P.y+3.4,z:P.z,n:'CLASH!',t:0,big:true,col:'#ffffff'}); NP1.cam=pov(5,2.2,1.4,8,3.2); fov(62); }
  if(b){ b.hit.add(NB); b.mul=0; }
  P.cineAnim='beam'; if(typeof NBS!=='undefined'){ NBS.fixRow=null; nbsSlash(.4,.3); } Sound.sfx('swing'); Sound.sfx('beam');
  const H=()=>[NB.x,NB.y+2.9,NB.z], aim=(q)=>{ const [hx,hy,hz]=H(), h=(q.x-hx)*E.ux+(q.z-hz)*E.uz; return [Math.atan2(h,q.y-hy),Math.hypot(q.x-hx,q.y-hy,q.z-hz)]; };
  const sparks=(q,n,sp)=>{ for(let i=0;i<n;i++) FX.spawn(q.x,q.y,q.z,rnd(-sp,sp),rnd(-2,sp+2),rnd(-sp,sp),.3,[0xffffff,0x3ff4ff,0xff2a3a,0xffd45a][i%4],.3,6,true); };
  let tick=0; const grind=(q,dt,hard)=>{ tick-=dt; if(tick>0) return; tick=hard?.05:.08; FX.burst(q.x,q.y,q.z,hard?18:10,Math.random()<.5?0x3ff4ff:0xff2a3a,hard?8:6,.25); Sound.hiss(900,.1,.12,'bandpass'); Sound.tone('square',rnd(300,600),rnd(150,300),.08,.04); shake(hard?.55:.3);
    edge(Math.random()<.5,hard?.25:.15); if(Math.random()<(hard?.4:.2)) impactFrame([[3,1]]); if(typeof TPS!=='undefined') TPS.kick=(TPS.kick||0)+(hard?.12:.06)*(Math.random()<.5?1:-1); };
  // 1. his blade comes down onto the Jujishou: the contact is a frozen white instant
  const th0=E.ang, L0=E.len, q0=b?{x:b.x,y:b.y,z:b.z}:{x:lerp(P.x,NB.x,.3),y:gy+1.6,z:lerp(P.z,NB.z,.3)};
  for(let t0=Game.time,u=0;u<1;){ yield wait(0); u=Math.min(1,(Game.time-t0)/.36); const q=b||q0, [th,L]=aim(q); E.ang=lerp(th0,th,u*u); E.len=lerp(L0,L,Math.sqrt(u)); if(b) b.life=Math.max(b.life,1); follow(pov(5,2.2,1.4,8,3.2),.2); }
  const q=b||q0, c0={x:q.x,y:q.y,z:q.z}; if(b) b.sp=0;
  const put=()=>{ if(b){ b.life=Math.max(b.life,1); b.x=q.x; b.y=q.y; b.z=q.z; b.g.position.set(q.x,q.y,q.z); } const [th,L]=aim(q); E.ang=th; E.len=L; };
  npStar(q.x,q.y,q.z,0xffffff,3,.5); FX.burst(q.x,q.y,q.z,60,0xffffff,11,.3); FX.burst(q.x,q.y,q.z,40,0x3ff4ff,9,.35); FX.burst(q.x,q.y,q.z,40,0xff2a3a,9,.35); FX.ring(q.x,groundY(q.x,q.z)+.1,q.z,'#ffffff',9,.5);
  Sound.sfx('parry'); Sound.sfx('crossboom'); Sound.sfx('slam'); Sound.tone('sawtooth',70,20,.8,.25); shake(1.6); FX.flash=1; grade.uniforms.flashCol.value.set(1,1,1); JC.flash=Math.max(JC.flash||0,.8); FX.hitstop=Math.max(FX.hitstop,.28); impactFrame([[1,2],[3,2],[2,1],[1,1]]);
  NP1.cam=pov(3.6,1.5,1.1,9,3.1); fov(58); if(typeof TPS!=='undefined') TPS.kick=.5;
  // 2. it holds, then starts to give: the Jujishou shoved back toward Ali, the ground under it tearing
  for(let t0=Game.time,s=0;s<.5;){ yield wait(0); const nt=Game.time-t0, dt=nt-s; s=nt; const k=s/.5; q.x=c0.x-ux*.9*k; q.z=c0.z-uz*.9*k; q.y=c0.y; put(); sparks(q,5,7); grind(q,dt); follow(pov(3.6,1.5,1.1,9,3.1),.15); fov(lerp(camera.fov,64,dt*3));
    if(Math.random()<.5) FX.spawn(q.x+rnd(-.6,.6),groundY(q.x,q.z)+.2,q.z+rnd(-.6,.6),-ux*3,rnd(1,3),-uz*3,.6,0x8a8070,.4,0,false); }
  twBark('nathan',"Kneel.",true);
  // 3. Ali dashes in behind it: the Full Counter
  { const sx=P.x, sz=P.z, ex=q.x-ux*1.5, ez=q.z-uz*1.5; let gt=0; NPX.spd={t:0}; P.cineAnim='dash';
    Sound.sfx('dash'); Sound.sfx('whoosh'); Sound.hiss(2600,.24,.32,'bandpass'); Sound.tone('sawtooth',160,1700,.2,.08); Sound.tone('sine',2400,3800,.18,.1); twBark('ali',"Not today.",true);
    for(let t0=Game.time,u=0;u<1;){ yield wait(0); const nt=Math.min(1,(Game.time-t0)/.14), e=1-Math.pow(1-nt,3); u=nt; P.x=lerp(sx,ex,e); P.z=lerp(sz,ez,e); P.y=groundY(P.x,P.z);
      gt--; if(gt<=0){ gt=1; try{ const g=aliGhost(P.x,P.y,P.z); if(g&&g.mesh) g.mesh.material.color.setHex(0xff3a4a); }catch(e){} }
      for(let i=0;i<5;i++) FX.spawn(P.x+rnd(-.4,.4),P.y+rnd(.2,2),P.z+rnd(-.4,.4),-ux*rnd(8,16),rnd(-.3,.6),-uz*rnd(8,16),.3,i%2?0xff3a4a:0xffffff,.3,0,true);
      follow(pov(3.8,1.7,1.0,7,3),.6); fov(TPS.FOV+22*Math.sin(u*Math.PI/2)); }
    P.ang=Math.atan2(uz,ux); P.cineAnim='aliS1'; shFullCounterFX(); Sound.sfx('slam'); Sound.sfx('crossboom'); FX.hitstop=Math.max(FX.hitstop,.3); impactFrame([[3,2],[1,2],[2,1]]); JC.flash=1; shake(1.5); fov(TPS.FOV+6); if(typeof TPS!=='undefined') TPS.kick=.7;
    npStar(q.x,q.y,q.z,0xff3a4a,3.5,.5); FX.burst(q.x,q.y,q.z,70,0xffffff,12,.35); FX.ring(q.x,groundY(q.x,q.z)+.1,q.z,'#ff3a4a',10,.5); }
  // 4. together they drive it into him: the ground rips open along the way, the shake climbing
  { const qs={x:q.x,z:q.z}, qe={x:NB.x-ux*1.6,z:NB.z-uz*1.6}; let scor=0;
    for(let t0=Game.time,s=0;s<1.1;){ yield wait(0); const nt=Game.time-t0, dt=nt-s; s=nt; const k0=Math.min(1,s/1.1), k=k0*k0*(3-2*k0), j=Math.sin(s*34)*.14;
      q.x=lerp(qs.x,qe.x,k)+px*j; q.z=lerp(qs.z,qe.z,k)+pz*j; q.y=c0.y; put(); P.x=q.x-ux*1.4; P.z=q.z-uz*1.4; P.y=groundY(P.x,P.z); P.cineAnim=Math.floor(s*8)%2?'aliS1':'aliS2';
      sparks(q,7,9); grind(q,dt,true); FX.spawn(P.x,P.y+.1,P.z,-ux*4+rnd(-1,1),rnd(.5,2),-uz*4+rnd(-1,1),.5,0x8a8070,.4,0,false); FX.shake=Math.max(FX.shake||0,.2+k0*.5);
      scor-=dt; if(scor<=0){ scor=.07; FX.line(q.x,q.z,Math.atan2(uz,ux),1.6,.5,0xff2a3a,1.4); for(let i=0;i<4;i++) FX.spawn(q.x+rnd(-.8,.8),groundY(q.x,q.z)+.2,q.z+rnd(-.8,.8),rnd(-3,3),rnd(2,6),rnd(-3,3),.7,i%2?0x3a3030:0xff2a3a,.35,8,i%2===1); }
      follow(pov(3.4,1.6,1.1,6,3),.2); fov(lerp(camera.fov,TPS.FOV+8,dt*4)); } }
  twBark('nathan',"No... NO!",true);
  // 5. on the brink: a white instant, time stops (grey), Ali blinks up into the sky and the shot sits on his shoulder, looking down at Nathan
  FX.flash=1; grade.uniforms.flashCol.value.set(1,1,1); FX.hitstop=Math.max(FX.hitstop,.15); impactFrame([[1,2],[3,1]]); zwStart(); Sound.sfx('secret'); Sound.tone('sine',60,30,1,.22);
  try{ aliGhost(P.x,P.y,P.z); }catch(e){} FX.burst(P.x,P.y+1,P.z,16,0x0c0814,4,.3,false);
  P.x=NB.x-ux*6+px*2.5; P.z=NB.z-uz*6+pz*2.5; P.y=gN+8; P.ang=Math.atan2(NB.z-P.z,NB.x-P.x); P.f=Math.cos(P.ang)>=0?1:-1; P.cineAnim='glide'; Sound.sfx('swing');
  { const vx=NB.x-P.x, vz=NB.z-P.z, vl=Math.hypot(vx,vz)||1, bx=vx/vl, bz=vz/vl, sx=-bz, sz=bx; NP1.cam={x:P.x-bx*2.8+sx*1.1,y:P.y+1.2,z:P.z-bz*2.8+sz*1.1,lx:NB.x,ly:gN+1.6,lz:NB.z}; fov(60);
    for(let t0=Game.time,s=0;s<.95;){ yield wait(0); s=Game.time-t0; NP1.cam.x=P.x-bx*(2.8-s*.6)+sx*1.1; NP1.cam.z=P.z-bz*(2.8-s*.6)+sz*1.1; NP1.cam.y=P.y+1.2-s*.3; P.y=gN+8+Math.sin(s*3)*.1;
      if(b){ const jj=1+.08*Math.sin(s*60); b.g.scale.setScalar(2*jj); } if(Math.random()<.4){ FX.spawn(q.x+rnd(-1,1),q.y+rnd(-1,1),q.z+rnd(-1,1),rnd(-2,2),rnd(-2,2),rnd(-2,2),.2,0xffffff,.3,0,true); } if(s>.5&&!NP1.cam.beat){ NP1.cam.beat=1; Sound.tone('sine',52,30,.4,.2); } } }
  // 6. time resumes into the explosion, watched from the sky: a long freeze, a white-out, the camera thrown back
  zwEnd(); npxBoom(q.x,q.y,q.z,kind==='q'?2.6:2.2); if(b) b.life=0; FX.hitstop=Math.max(FX.hitstop,.42); impactFrame([[1,3],[3,3],[2,2],[1,2],[3,1]]);
  { const [hx,hy,hz]=H(); for(let i=0;i<80;i++){ const u=rnd(0,1), x=lerp(hx,q.x,u), y=lerp(hy,q.y,u), z=lerp(hz,q.z,u); FX.spawn(x,y,z,rnd(-5,5),rnd(-1,6),rnd(-5,5),.7,i%2?0x3ff4ff:0xffffff,.3,6,true); } }
  NP1.ex=null; nbDamage(kind==='q'?36:28,'np1'); try{ if(typeof npPosture==='function') npPosture(100,'clash'); else if(!NP1.done) np1Stun(5,'OVERPOWERED'); }catch(e){ if(!NP1.done) np1Stun(5,'OVERPOWERED'); }
  { const c1=Object.assign({},NP1.cam), wo={t:0}; Game.fxUpd.push(dt=>{ wo.t+=dt; FX.flash=Math.max(FX.flash,Math.max(0,1-wo.t/.7)); grade.uniforms.flashCol.value.set(1,1,1); return wo.t<.7; });
    for(let t0=Game.time,s=0;s<1.6;){ yield wait(0); s=Game.time-t0; const k=Math.min(1,s/.35), e=1-Math.pow(1-k,3), kb=Math.min(1,s/1.6); NP1.cam.x=c1.x-ux*3.5*e+ux*1.2*kb; NP1.cam.z=c1.z-uz*3.5*e+uz*1.2*kb; NP1.cam.y=c1.y+2*e-1.2*kb; FX.shake=Math.max(FX.shake||0,1.6*Math.max(0,1-s/1.2)); P.y=gN+8+Math.sin(s*3)*.15;
      if(s<1.2&&Math.random()<.7){ const a=rnd(0,6.283), r=rnd(2,14); FX.spawn(q.x+Math.cos(a)*r,q.y+rnd(6,14),q.z+Math.sin(a)*r,rnd(-1,1),-rnd(1,3),rnd(-1,1),rnd(.6,1.2),i2c(),.3,10,false); } } }
  // 7. he drops back down; the fight's camera takes over from where this one sits
  { const y0=P.y; P.cineAnim='fall'; Sound.sfx('whoosh');
    for(let t0=Game.time,u=0;u<1;){ yield wait(0); u=Math.min(1,(Game.time-t0)/.45); P.y=lerp(y0,groundY(P.x,P.z),u*u); follow(pov(6,2.6,1.4,8,2.6),.3); }
    P.y=groundY(P.x,P.z); FX.burst(P.x,P.y+.2,P.z,20,0x8a8070,4,.4,false); FX.ring(P.x,P.y+.1,P.z,'#ffffff',2,.3); Sound.sfx('slam'); shake(.5); P.cineAnim='idle'; if(typeof TPS!=='undefined') TPS.kick=-.2; }
  { const yaw=Math.atan2(NB.z-P.z,NB.x-P.x), fx=Math.cos(yaw), fz=Math.sin(yaw), py=Math.max(P.y,groundY(P.x,P.z)), want={x:P.x-fx*8,y:py+3.5,z:P.z-fz*8,lx:lerp(P.x,NB.x,.35),ly:py+1.3,lz:lerp(P.z,NB.z,.35)};
    for(let t0=Game.time,u=0;u<1;){ yield wait(0); u=Math.min(1,(Game.time-t0)/.4); follow(want,.25); fov(lerp(camera.fov,TPS.FOV,.25)); } if(typeof TPS!=='undefined') TPS.yaw=yaw; }
  fov(TPS.FOV); NP1.cam=null; Game.letterTo=0; P.cineFly=false; P.cineAnim=null; P.inv=.8; ALI_CH.force=0; }
function i2c(){ return [0x3a3030,0x8a8070,0x3ff4ff,0x1a1216][Math.floor(Math.random()*4)]; }
// the dash's speed lines (the clash's Full Counter run-up)
function npxSpeedLines(){ const S=NPX.spd; if(!S) return; S.t+=1/60; if(S.t>.4){ NPX.spd=null; return; } const k=S.t<.16?1:Math.max(0,1-(S.t-.16)/.24), cx=UW/2, cy=UH*.5, R0=Math.hypot(UW,UH)*.55;
  if(!S.L){ S.L=[]; for(let i=0;i<54;i++) S.L.push({a:rnd(0,6.283),r:rnd(.5,1),w:rnd(1,4),sp:rnd(.8,1.5)}); }
  D.save(); for(const l of S.L){ const a=l.a+rnd(-.015,.015), r1=R0*l.r, r0=r1*(1-.55*Math.min(1,S.t*l.sp*9)); D.strokeStyle=`rgba(${l.w>3?'255,170,185':'255,255,255'},${.8*k})`; D.lineWidth=l.w; D.beginPath(); D.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1); D.lineTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0); D.stroke(); } D.restore(); }
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
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ npxSpeedLines(); }catch(e){ console.error('npx lines',e); } try{ npxSmear(); }catch(e){ console.error('npx smear',e); } try{ const E=NP1.ex; if(E&&np1On()&&Game.letter<=.5) npxUI(E); }catch(e){ console.error('npx ui',e); } }; })();
function npxUI(E){ const bw=Math.min(UW*.5,420), bx=(UW-bw)/2, by=50, k=Math.min(1,E.t/(NPX.lvT*3)), seg=(y,f,lv,on,off)=>{ for(let i=0;i<3;i++){ const x=bx+i*(bw/3)+2, w=bw/3-4, u=Math.max(0,Math.min(1,f*3-i));
      D.fillStyle='rgba(4,10,24,.75)'; D.fillRect(x,y,w,10); D.fillStyle=lv>i?on:off; D.fillRect(x,y,w*u,10); D.strokeStyle='rgba(255,255,255,.55)'; D.lineWidth=1; D.strokeRect(x+.5,y+.5,w-1,9); } };
  E.pulseUI=Math.max(0,E.pulseUI-1/20); D.save(); seg(by,k,E.lv,'#ffffff','#3ff4ff');
  const lab=E.phase==='charge'?(E.lv>=1?'LEVEL '+E.lv:'CHARGING'):E.phase==='window'?(E.deep?'PARRY!':'LEVEL 3: GETSUGA NOW'):'', pu=1+.35*E.pulseUI;
  if(lab){ D.font=`900 ${Math.round(18*pu)}px ${FB}`; D.textAlign='center'; D.textBaseline='bottom'; D.lineWidth=4; D.strokeStyle='#04101e'; D.strokeText('STARBREAKER  ·  '+lab,UW/2,by-4);
    D.fillStyle=E.phase==='window'?`hsl(${(Game.time*600)%360},100%,65%)`:'#9ff8ff'; D.fillText('STARBREAKER  ·  '+lab,UW/2,by-4); }
  D.restore(); } /* Ali's own charge shows on the circle gauge round him (08d) */
