// =====================================================================
// ALI'S GETSUGA CHARGE IN THREE STAGES (every fight; think Saber's Excalibur): hold Getsuga and he raises the katana straight
// over his head; ALI_CH.T = the seconds of holding for LV 1 / 2 / 3 (2s apiece).
//   charging -> LV 1: black and red energy pours off the blade and shoots up in a thin column, a surging hum
//   LV 2: more of it, a taller column, black and red lightning crackling around the blade
//   LV 3: all of it bigger: the column goes up into the sky, lightning round his body too, the ground pulses, a low roar
// The shot fires on the release: before the first tick, the base Getsuga (a tap); LV 1 a big black Getsuga (x2, twice as tall),
// LV 2 a bigger gold one (x3, three times), LV 3 the Getsuga Jujishou (x4.5, four times). A circle gauge round him shows the ticks. ALI_CH.force = a stage shown without holding (cinematics).
// =====================================================================
const ALI_CH={T:[2,4,6],force:0,fx:null,snd:0}; /* the three ticks of the circle gauge: holding past each one is a level */
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
function aliChargeMake(){ return {t:0,flames:[],bolts:[],ring:0}; }
// the fire: the charged fireball's flames (the same sheet), flaring up off the blade tip in a stack that grows with each level
function aliChargeFlames(F,lv,tx,ty,tz,k){ const want=lv>=3?5:2+lv, size=1.5+lv*.9+k*.4; while(F.flames.length<want){ const e=pxvPlay('fireball_burn',{x:tx,y:ty,z:tz,size,depth:false,add:true}); if(!e) break; e.noAim=true; F.flames.push(e); }
  while(F.flames.length>want){ pxvStop(F.flames.pop()); }
  F.flames.forEach((e,i)=>{ const h=i*size*.62, wob=Math.sin(F.t*9+i*1.7)*.12*(1+i*.3); e.m.position.set(tx+wob,ty+h*(1+.06*Math.sin(F.t*13+i)),tz+Math.cos(F.t*7+i)*.06); const s=size*(1-i*.08)*(1+.07*Math.sin(F.t*17+i*2)); e.m.scale.set(s*(e.A.w/e.A.h),s,1); e.m.material.opacity=Math.max(.35,1-i*.12); }); }
function aliChargeBolt(F,i,sc){ let B=F.bolts[i]; if(!B){ const g=aliBoltMesh(); scene.add(g); try{ g.children[2].material.color.setHex(0xff4a5a); }catch(e){} B=F.bolts[i]={bolt:g,x:0,y:0,z:0,g:{scale:{x:1}}}; }
  B.g.scale.x=sc; return B; }
function aliChargeClear(){ const F=ALI_CH.fx; ALI_CH.fx=null; if(!F) return; for(const e of F.flames) try{ pxvStop(e); }catch(x){} for(const B of F.bolts) if(B) scene.remove(B.bolt); }
function aliChargeFx(dt){ const P=Player, on=ALI()&&(ALI_CH.force>0||(P.charge||0)>.25)&&Game.state!=='dead'&&Game.state!=='title'&&Game.state!=='end';
  if(!on){ if(ALI_CH.fx) aliChargeClear(); return; }
  const T=ALI_CH.T, ch=ALI_CH.force?T[2]+.5:P.charge, lv=ALI_CH.force||aliChargeLv(ch), a0=lv?T[lv-1]:.25, k=lv>=3?1:Math.max(0,Math.min(1,(ch-a0)/(T[lv]-a0)));
  const F=ALI_CH.fx||(ALI_CH.fx=aliChargeMake()); F.t+=dt; const tx=P.x, ty=P.y+2.3, tz=P.z;
  // the fire off the blade, bigger with every level
  try{ aliChargeFlames(F,lv,tx,ty+.2,tz,k); }catch(e){ console.error('charge flames',e); }
  // the energy flows: streams spiral in from the air around him and up into the blade (Shayan's charge pulls its fire in
  // straight; Ali's curls), ribbons of black and red wind up his body, and wisps shoot on up off the tip
  const NS=6+lv*2, R=2.4+lv*.5, spin=7+lv*2; for(let i=0;i<NS;i++){ const fr=(F.t*1.5+i/NS)%1, a=i/NS*6.283+F.t*spin+fr*2.5, r=R*(1-fr*fr), y=P.y+.2+fr*2.1, x=P.x+Math.cos(a)*r, z=P.z+Math.sin(a)*r;
    FX.spawn(x,y,z,0,0,0,.1,i%2?0xff1a2a:0x0a0006,.14+fr*.16,0,!(i%2)); if(fr>.9) FX.spawn(tx,ty,tz,rnd(-.3,.3),rnd(5,9)*(1+lv*.3),rnd(-.3,.3),.4+lv*.1,i%2?0xff1a2a:0x0a0006,.2+lv*.05,0,!(i%2)); }
  F.rib=(F.rib||0)-dt; if(lv>=2&&F.rib<=0){ F.rib=.42-lv*.07; const a0=rnd(0,6.283), t0=F.t, dir=Math.random()<.5?1:-1, red=Math.random()<.5, rr=1+lv*.22;
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
// his waves stand tall: every Getsuga is 3.5x as tall on screen; the levels double, triple and quadruple that (the hit stays the same)
const ALI_WAVE_TALL=3.5;
(function(){ const ub=updateBeams; updateBeams=function(dt){ try{ for(const b of BEAMS) if(b.ali&&b.pxv&&!b.pxv.tall) b.pxv.tall=ALI_WAVE_TALL*(1+(b.chLv||0)); }catch(e){} return ub.apply(this,arguments); }; })();
// the circle gauge round Ali while he holds: three ticks, the arc fills to the next level (full circle = level 3)
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ const P=Player; if(!ALI()||!((P.charge||0)>.25)||Game.state!=='play'||Game.letter>.5) return; const q=toScreen(P.x,P.y+1.3,P.z); if(q[2]>1) return;
      const T=ALI_CH.T, c=P.charge, lv=aliChargeLv(c), R=IS_TOUCH()?40:46, k=Math.min(1,c/T[2]), a0=-Math.PI/2;
      D.save(); D.translate(q[0],q[1]); D.lineCap='round'; D.strokeStyle='rgba(10,4,8,.6)'; D.lineWidth=7; D.beginPath(); D.arc(0,0,R,0,6.283); D.stroke();
      D.strokeStyle=lv>=3?`hsl(${(Game.time*500)%360},100%,65%)`:lv>=1?'#ff3a4a':'#ffb0b8'; D.lineWidth=5; D.beginPath(); D.arc(0,0,R,a0,a0+6.283*k); D.stroke();
      for(let i=1;i<=3;i++){ const a=a0+6.283*(T[i-1]/T[2]); D.strokeStyle=lv>=i?'#ffffff':'rgba(255,255,255,.5)'; D.lineWidth=3; D.beginPath(); D.moveTo(Math.cos(a)*(R-7),Math.sin(a)*(R-7)); D.lineTo(Math.cos(a)*(R+7),Math.sin(a)*(R+7)); D.stroke(); }
      D.font=`900 ${IS_TOUCH()?14:15}px ${FB}`; D.textAlign='center'; D.textBaseline='middle'; D.lineWidth=4; D.strokeStyle='#1a0408'; const t=lv>=3?'MAX':'LV '+lv; D.strokeText(t,0,0); D.fillStyle=lv>=3?'#fff0a0':'#ffd0d4'; D.fillText(t,0,0); D.restore(); }catch(e){ console.error('charge gauge',e); } }; })();
