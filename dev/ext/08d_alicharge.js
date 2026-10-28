// =====================================================================
// ALI'S GETSUGA CHARGE IN THREE STAGES (every fight; think Saber's Excalibur): hold Getsuga and he raises the katana straight
// over his head; ALI_CH.T = the seconds of holding for LV 1 / 2 / 3 (2s apiece).
//   charging -> LV 1: black and red energy pours off the blade and shoots up in a thin column, a surging hum
//   LV 2: more of it, a taller column, black and red lightning crackling around the blade
//   LV 3: all of it bigger: the column goes up into the sky, lightning round his body too, the ground pulses, a low roar
// Release: LV 1 a big black Getsuga (x2), LV 2 a bigger gold one (x3), LV 3 the Getsuga Jujishou (x4.5). Under 2s: nothing
// (the tap already fired its Getsuga). ALI_CH.force = a stage shown without holding (cinematics).
// =====================================================================
const ALI_CH={T:[2,4,6],force:0,fx:null,snd:0};
function aliChargeLv(c){ const T=ALI_CH.T; return c>=T[2]?3:c>=T[1]?2:c>=T[0]?1:0; }
// the hold timer crossing its marks
function aliChargeTick(b,a){ const T=ALI_CH.T;
  if(b<.25&&a>=.25){ Sound.sfx('charge'); Sound.hiss(700,.6,.12,'bandpass'); Sound.tone('sawtooth',70,260,.6,.05); } /* the energy starts to come out */
  for(let i=0;i<3;i++) if(b<T[i]&&a>=T[i]) aliChargeUp(i+1); }
function aliChargeUp(lv){ const P=Player, x=P.x, y=P.y, z=P.z;
  Game.dmgNums.push({x,y:y+3.2,z,n:lv>=3?'LV 3: MAX':'LV '+lv,t:0,big:lv>=3,col:lv>=3?'#ff3a4a':'#ff8a9a'});
  FX.burst(x,y+2.3,z,16+lv*14,0xff1a2a,4+lv*2,.35); FX.burst(x,y+2.3,z,10+lv*10,0x0a0006,3+lv*2,.4,false); FX.ring(x,y+.1,z,'#ff2a3a',1.5+lv,.4); shake(.15+lv*.15);
  // the ignition: a whoomp of air, a rising surge and a crackle, bigger each tier
  Sound.hiss(280+lv*110,.45+lv*.15,.3+lv*.12,'lowpass'); Sound.tone('sawtooth',55+lv*10,380+lv*220,.4+lv*.1,.1+lv*.035); Sound.hiss(1800+lv*600,.2+lv*.08,.12+lv*.05,'bandpass'); Sound.tone('square',90,30,.18+lv*.06,.05+lv*.02);
  if(lv===2) Sound.sfx('ready'); if(lv>=3){ Sound.sfx('crossboom'); FX.flash=Math.max(FX.flash,.35); grade.uniforms.flashCol.value.set(1,.15,.2); } }
// the release: the stage decides the shot
function aliChargeRelease(lv){ const P=Player, n0=BEAMS.length;
  if(lv>=3) aliGetsuga(true); else { TW._aliRC=1; try{ aliGetsuga(false); } finally{ TW._aliRC=0; } }
  const b=BEAMS.length>n0?BEAMS[BEAMS.length-1]:null; if(!b) return null;
  b.chLv=lv; b.mul=[1,2,3,4.5][lv]; const k=[1,1.6,2.1,1.7][lv];
  try{ if(b.pxv){ if(lv===2&&pxvOk('getsuga_gold')){ const sz=b.pxv.sz; pxvStop(b.pxv); b.pxv=pxvAttach('getsuga_gold',b.g,sz*k); if(b.pxv) b.pxv.dir=b; } else b.pxv.sz*=k; } }catch(e){ console.error('charged getsuga',e); }
  FX.flash=Math.max(FX.flash,.2+lv*.12); grade.uniforms.flashCol.value.set(1,.2,.25); shake(.3+lv*.25); Sound.sfx('crossboom'); if(lv>=2) Sound.sfx('slam');
  FX.burst(P.x,P.y+1.6,P.z,20*lv,0xff1a2a,5+lv*2,.35); FX.burst(P.x,P.y+1.6,P.z,14*lv,0x0a0006,4+lv*2,.4,false);
  if(lv>=3) Game.dmgNums.push({x:P.x,y:P.y+3,z:P.z,n:'GETSUGA JUJISHOU',t:0,big:true,col:'#ff3a4a'});
  return b; }
// ---------- the pose: the katana raised straight up over his head in both hands (the blade-less stance + arms + blade) ----------
function aliOverhead(c,cx,by,d,t,lv){ const feet=(ALS.feet[18]||[])[d]||79; alPaint(c,cx,by,18,d,{});
  const side=d===0||d===4?0:(AL_FX[d]||1), gx=48+side*2, gy=12; /* the grip, over the crown of the hat (96px cell pixels) */
  c.save(); c.translate(Math.round(cx-48),Math.round(by-1-feet));
  const arm=(x0,y0)=>{ for(let i=0;i<=8;i++){ const u=i/8, x=Math.round(lerp(x0,gx,u)), y=Math.round(lerp(y0,gy+2,u)); c.fillStyle='#14141c'; c.fillRect(x-1,y,3,2); c.fillStyle='#2c2e3c'; c.fillRect(x,y,1,1); } };
  if(side===0){ arm(40,22); arm(56,22); } else { arm(gx-side*7,22); arm(gx+side*4,23); }
  c.fillStyle='#3a2a24'; c.fillRect(gx-2,gy,5,3);
  const col=lv>=3?(Math.floor(t*16)%2?'#ff2a3a':'#2a0408'):lv>=1?(Math.floor(t*12)%2?'#ff5a6a':'#ffd0d4'):'#dfe6ee';
  alBlade(c,gx,gy,-Math.PI/2,1,22,col,0,true); c.restore(); SHA.drawn=true; }
(function(){ const da=drawAliHD; drawAliHD=function(c,cx,by,f,s){ const P=Player;
    if(s&&s.anim==='charge'&&!s.old&&ALS.ok&&ALS.img&&P&&ALI()&&s.t===P.t&&s.anim===P.anim){ try{
        let d=f>0?2:6; if(Game.state==='play'&&!P.cineFly&&!P.scripted){ const ang=P.ang||0, cs=Math.cos(ang); if(!(Math.abs(cs)>.3&&Math.sign(cs)!==Math.sign(f||1))) d=shDirIdx(ang); }
        aliOverhead(c,cx,by,d,s.t||0,ALI_CH.force||aliChargeLv(P.charge||0)); return; }catch(e){ console.error('ali overhead',e); } }
    return da.apply(this,arguments); }; })();
// ---------- the energy: a column off the blade tip, rising wisps, lightning from LV 2, the sky pillar at LV 3 ----------
function aliChargeMake(){ const red=beamMesh(0xff1a2a,1), g=new THREE.CylinderGeometry(.5,.5,1,10,1,true); g.rotateX(Math.PI/2); g.translate(0,0,.5);
  const dark=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x0a0004,transparent:true,opacity:.85,depthWrite:false,fog:false})); scene.add(dark);
  red.userData.temp=1; dark.userData.temp=1; return {t:0,red,dark,bolts:[],ring:0}; }
function aliChargeBolt(F,i,sc){ let B=F.bolts[i]; if(!B){ const g=aliBoltMesh(); scene.add(g); try{ g.children[2].material.color.setHex(0xff4a5a); }catch(e){} B=F.bolts[i]={bolt:g,x:0,y:0,z:0,g:{scale:{x:1}}}; }
  B.g.scale.x=sc; return B; }
function aliChargeClear(){ const F=ALI_CH.fx; ALI_CH.fx=null; if(!F) return; for(const m of [F.red,F.dark]){ scene.remove(m); try{ m.geometry.dispose(); }catch(e){} } for(const B of F.bolts) if(B) scene.remove(B.bolt); }
function aliChargeFx(dt){ const P=Player, on=ALI()&&(ALI_CH.force>0||(P.charge||0)>.25)&&Game.state!=='dead'&&Game.state!=='title'&&Game.state!=='end';
  if(!on){ if(ALI_CH.fx) aliChargeClear(); return; }
  const T=ALI_CH.T, ch=ALI_CH.force?T[2]+.5:P.charge, lv=ALI_CH.force||aliChargeLv(ch), a0=lv?T[lv-1]:.25, k=lv>=3?1:Math.max(0,Math.min(1,(ch-a0)/(T[lv]-a0)));
  const F=ALI_CH.fx||(ALI_CH.fx=aliChargeMake()); F.t+=dt; const tx=P.x, ty=P.y+2.3, tz=P.z;
  // the column: thin and short while charging, the sky at LV 3
  const len=lv>=3?Math.min(140,8+F.t*60):[4*k,7+5*k,18+6*k][lv], w=[.06+.04*k,.13,.24,.6][lv]*(1+.18*Math.sin(F.t*31)+.08*Math.sin(F.t*53));
  for(const m of [F.red,F.dark]){ m.position.set(tx,ty,tz); m.lookAt(tx,ty+10,tz+1e-4); m.scale.set(Math.max(.01,w),Math.max(.01,w),Math.max(.01,len)); }
  F.red.material.opacity=lv?.9:.5+.4*k; F.dark.material.opacity=lv?.85:.5;
  // the energy flows: streams spiral in from the air around him and up into the blade (Shayan's charge pulls its fire in
  // straight; Ali's curls), ribbons of black and red wind up his body, and wisps shoot on up off the tip
  const NS=6+lv*2, R=2.4+lv*.5, spin=7+lv*2; for(let i=0;i<NS;i++){ const fr=(F.t*1.5+i/NS)%1, a=i/NS*6.283+F.t*spin+fr*2.5, r=R*(1-fr*fr), y=P.y+.2+fr*2.1, x=P.x+Math.cos(a)*r, z=P.z+Math.sin(a)*r;
    FX.spawn(x,y,z,0,0,0,.1,i%2?0xff1a2a:0x0a0006,.14+fr*.16,0,!(i%2)); if(fr>.9) FX.spawn(tx,ty,tz,rnd(-.3,.3),rnd(5,9)*(1+lv*.3),rnd(-.3,.3),.4+lv*.1,i%2?0xff1a2a:0x0a0006,.2+lv*.05,0,!(i%2)); }
  F.rib=(F.rib||0)-dt; if(F.rib<=0){ F.rib=.42-lv*.07; const a0=rnd(0,6.283), t0=F.t, dir=Math.random()<.5?1:-1, red=Math.random()<.5, rr=1+lv*.22;
    twGash({life:.55,rev:.08,fade:.25,w:8+lv*2,op:.75,sparks:0,col:red?0xff1a2a:0x140008,pts:()=>{ const t=F.t-t0; return twArcPts(P.x,P.y+.5+t*2.6,P.z,Math.cos(a0+t*6*dir),Math.sin(a0+t*6*dir),rr,-1,1,6,true); }}); }
  const n=[0,1,2,4][lv]; for(let i=0;i<n;i++){ const r=rnd(.1,.3)*(1+lv*.4), a=rnd(0,6.283); FX.spawn(tx+Math.cos(a)*r,ty+rnd(-.9,.2),tz+Math.sin(a)*r,rnd(-.4,.4),rnd(6,11)*(1+lv*.35),rnd(-.4,.4),.45+lv*.1,i%2?0x0a0006:0xff1a2a,.22+lv*.07,0,!(i%2)); }
  if(lv>=3){ const a=rnd(0,6.283), r=rnd(3,5); FX.spawn(P.x+Math.cos(a)*r,P.y+rnd(.2,2.5),P.z+Math.sin(a)*r,-Math.cos(a)*r*2.2,rnd(1,3),-Math.sin(a)*r*2.2,.45,Math.random()<.5?0xff1a2a:0x0a0006,.25,0,true); /* the air pulled in */
    F.ring-=dt; if(F.ring<=0){ F.ring=.45; FX.ring(P.x,P.y+.1,P.z,'#ff2a3a',3,.45); } FX.shake=Math.max(FX.shake||0,.05); }
  // black and red lightning from LV 2: round the blade, at LV 3 round his body too
  const bolts=lv>=3?[[ty,1.3],[P.y+1,1.15]]:lv>=2?[[ty,.75]]:[];
  for(let i=0;i<F.bolts.length;i++) if(F.bolts[i]) F.bolts[i].bolt.visible=i<bolts.length;
  bolts.forEach(([y,sc],i)=>{ const B=aliChargeBolt(F,i,sc); B.x=tx; B.y=y; B.z=tz; aliBoltUpdate(B,1); B.bolt.quaternion.copy(camera.quaternion); });
  // the hum, crackle and roar
  ALI_CH.snd-=dt; if(ALI_CH.snd<=0){ ALI_CH.snd=.28; Sound.hiss(250+lv*350,.32,.03+lv*.025,'bandpass'); if(lv>=2&&Math.random()<.7) Sound.hiss(5200,.06,.05+lv*.02,'highpass'); if(lv>=3) Sound.tone('sawtooth',48,54,.3,.05); } }
(function(){ const up=updatePlayer; updatePlayer=function(dt){ const r=up.apply(this,arguments); try{ aliChargeFx(dt); }catch(e){ console.error('ali charge fx',e); } return r; }; })();
// his waves stand tall: every Getsuga and Jujishou is 3.5x as tall on screen (the hit stays the same)
const ALI_WAVE_TALL=3.5;
(function(){ const ub=updateBeams; updateBeams=function(dt){ try{ for(const b of BEAMS) if(b.ali&&b.pxv&&!b.pxv.tall) b.pxv.tall=ALI_WAVE_TALL; }catch(e){} return ub.apply(this,arguments); }; })();
