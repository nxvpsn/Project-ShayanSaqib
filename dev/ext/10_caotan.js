// =====================================================================
// CAOTAN CUMMASTER: glasses, glints, body pillows and catastrophic rizz
// =====================================================================
const TWK={caotan:{},omar:{},caomar:{}};
const TWPOOL={
  caotan:{gate:['goo','glint1','letters'],1:['goo','glint1','letters','pillow','glint2'],2:['goo','glint1','letters','pillow','glint2','tsun','nose'],3:['goo','glint1','letters','pillow','glint2','tsun','nose','maid','rain']},
  omar:{gate:['scythes','reap','hands'],1:['scythes','reap','hands','orbs','sentence'],2:['scythes','reap','hands','orbs','sentence','clones','monologue'],3:['scythes','reap','hands','orbs','sentence','clones','monologue','tear','harvest']}};
const CAO_BARK=["Senpai, notice me!","My reserves are ENDLESS!","Don't look at me like that... unless?","I'm not blushing, it's the moonlight!","Uwu. That was a threat.","Let me push up my glasses at you.","Ara ara~"];
// something thrown in an arc that lands on a marked spot
function twThrow(o){ const s={x:o.x,y:o.y,z:o.z}, gy=groundY(o.tx,o.tz), mk=o.mark!==false?FX.marker(o.tx,o.tz,o.r||.9,o.col||0xff6ab0,o.dur+.05):null; let tt=0;
  return twHz({upd(dt,play){ if(play) tt+=dt; const u=Math.min(1,tt/o.dur); const x=lerp(s.x,o.tx,u), z=lerp(s.z,o.tz,u), y=lerp(s.y,gy+(o.endY||.4),u)+Math.sin(u*Math.PI)*(o.h||3);
    if(o.mesh){ o.mesh.position.set(x,y,z); o.mesh.rotation.z+=dt*(o.spin||8); } if(o.trail&&Math.random()<.6) FX.spawn(x,y,z,0,0,0,.3,o.trail,.22,0,true);
    if(u>=1){ if(o.onLand) o.onLand(o.tx,o.tz,play); return o.keep?o.keep():false; } return true; },
    kill(){ if(o.mesh&&!o.keepMesh) scene.remove(o.mesh); if(mk) scene.remove(mk.m); }}); }
function twHeartBurst(x,z,n){ const gy=groundY(x,z); for(let i=0;i<(n||14);i++){ const a=rnd(0,6.28); FX.spawn(x,gy+.5,z,Math.cos(a)*rnd(2,6),rnd(2,6),Math.sin(a)*rnd(2,6),rnd(.4,.8),i%2?0xff6ab0:0xffd0ec,.32,8,true); } }

TWK.caotan.goo=function*(T,ph){ const sp=twSp(T); if(Math.random()<.5) twBark('caotan',ph>=2?"Overflow mode! I'm DRIPPING with power!":"I never run dry!");
  for(let v=0;v<(ph>=2?1:3);v++){ T.fire=.25; for(const k of [-1,0,1]) twAimBolt(T,'goo',T.x+T.f*.3,T.y+.95,T.z,9.5*sp,k*.18,{col:0xffffff}); Sound.sfx('squelch'); yield .42/sp; }
  if(ph<2) return; const P=Player;
  for(let i=0;i<(ph>=3?8:6);i++){ const a=rnd(0,6.28), r=i===0?0:rnd(1.2,3.4), p=twClampXZ(P.x+P.vx*.5+Math.cos(a)*r,P.z+P.vz*.5+Math.sin(a)*r,.6);
    const m=new THREE.Group(); m.userData.tw=1; scene.add(m); twSperm(m,1.5); T.fire=.2; Sound.sfx('squelch');
    twThrow({x:T.x,y:T.y+1,z:T.z,tx:p.x,tz:p.z,dur:.85/sp,h:3.5,mesh:m,r:1.1,col:0xffffff,trail:0xffffff,onLand(x,z,play){ Sound.sfx('squelch'); FX.burst(x,groundY(x,z)+.2,z,14,0xffffff,3,.3,false);
      twZone(x,z,1.15,4.5,{slow:.55,col:0xfaf6ff,op:.95,fx:.05,splat:1}); if(play&&twInR(x,z,.95,1.2)) twHitP(1,x,z,{ub:true}); }}); yield .13; }
  yield .45; };
function twRayWall(x,z,ux,uz){ const A=twLock(); let tx=1e9,tz=1e9; if(ux>1e-4) tx=(A.x1-x)/ux; else if(ux<-1e-4) tx=(A.x0-x)/ux; if(uz>1e-4) tz=(A.z1-z)/uz; else if(uz<-1e-4) tz=(A.z0-z)/uz; return tx<tz?{t:tx,ax:'x'}:{t:tz,ax:'z'}; }
TWK.caotan.glint1=function*(T,ph){ const sp=twSp(T); yield* twGlint(T,1); twBark('caotan',ph>=2?"Senpai Snipe: Ricochet Edition!":"Senpai Snipe!");
  for(let r=0;r<(ph>=2?3:2);r++){ const P=Player, a=Math.atan2(P.z+P.vz*.2-T.z,P.x+P.vx*.2-T.x), ux=Math.cos(a), uz=Math.sin(a), w=twRayWall(T.x,T.z,ux,uz), len=Math.max(4,w.t);
    T.push=.3; T.glintT=.3; Sound.sfx('ting'); twBeam({x:T.x,z:T.z,ang:a,len,w:1.05,warn:.55/sp,dur:.22,dmg:3,col:0x9fd8ff});
    if(ph>=2){ const hx=T.x+ux*len, hz=T.z+uz*len, ra=w.ax==='x'?Math.atan2(uz,-ux):Math.atan2(-uz,ux); twBeam({x:hx,z:hz,ang:ra,len:twRayWall(hx,hz,Math.cos(ra),Math.sin(ra)).t,w:1.05,warn:.7/sp,dur:.22,dmg:3,col:0xffb0e0}); }
    yield .75/sp; }
  yield* twGlomp(T,sp); yield .3; };
TWK.caotan.letters=function*(T,ph){ const sp=twSp(T); twBark('caotan',ph>=2?"Sealed with a kiss! Mwah! Mwah! MWAH!":"I wrote these for you! ...All of them!"); T.cast=.6;
  const n=ph>=3?10:ph>=2?8:6; for(let i=0;i<n;i++){ const P=Player, a=rnd(0,6.28), r=i===0?0:rnd(1,3.6), p=twClampXZ(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,.6);
    const m=twBB(texLetter(),.9,.6); T.fire=.15; Sound.sfx('swing');
    twThrow({x:T.x,y:T.y+1.5,z:T.z,tx:p.x,tz:p.z,dur:.95/sp,h:3,mesh:m,spin:10,r:.95,col:0xff3a7a,trail:0xff8ac8,onLand(x,z,play){ Sound.sfx('kyun'); twHeartBurst(x,z,12); FX.ring(x,groundY(x,z),z,'#ff6ab0',1.6,.35);
      if(play&&twInR(x,z,.95,1.8)) twHitP(2,x,z,{ub:true}); if(ph>=2) twWave(x,z,{sp:6,max:4.2,col:0xff6ab0}); }}); yield .16/sp; }
  yield .7; };
TWK.caotan.pillow=function*(T,ph){ const sp=twSp(T);
  // the tell: he shouts it, and the pillow flies the moment the line ends (fixed beat when voices are off)
  if(ph>=2) twBark('caotan',"Hikari, Sakura, GO!",true); else twBark('caotan',"Hikari-chan attack!",true);
  { let w=0; while(!Voice.speaking&&w<.6&&Voice.on){ yield .05; w+=.05; } if(Voice.speaking){ let v=0; while(Voice.speaking&&v<3){ yield .05; v+=.05; } } else yield Math.max(0,.9-w); }
  T.cast=.5;
  // Hikari-chan cannot be parried: jump her or dash through her
  const P=Player, a0=Math.atan2(P.z-T.z,P.x-T.x), offs=ph>=2?[-.42,.42]:[0]; T.cast=.5; Sound.sfx('whoosh');
  for(const off of offs){ const m=twBB(texPillow(),.95,2.6), s={x:T.x,z:T.z,a:a0+off,v:15*sp,out:true,t:0,hit:false}, curl=ph>=2?(off<0?1.1:-1.1):0;
    twHz({upd(dt,play){ if(!play) return true; s.t+=dt; const gy=groundY(s.x,s.z);
      if(s.out){ s.a+=curl*dt; s.v-=15*dt*sp; s.x+=Math.cos(s.a)*Math.max(0,s.v)*dt; s.z+=Math.sin(s.a)*Math.max(0,s.v)*dt; if(s.v<=0) s.out=false; }
      else { const dx=T.x-s.x, dz=T.z-s.z, d=Math.hypot(dx,dz)||1, v=Math.min(16,(s.t-.9)*14+4); s.x+=dx/d*v*dt; s.z+=dz/d*v*dt; if(d<.8) return false; }
      const c=twClampXZ(s.x,s.z,.2); s.x=c.x; s.z=c.z; m.position.set(s.x,gy+1.1,s.z); m.rotation.z+=dt*14; if(Math.random()<.5) FX.spawn(s.x,gy+1,s.z,0,.5,0,.4,0xffd0ec,.25,0,true);
      const P2=Player; if(!s.hit&&Math.hypot(P2.x-s.x,P2.z-s.z)<1&&P2.y<gy+.9){ const r=twHitP(2,s.x,s.z); if(r!=='none') s.hit=true; }
      return s.t<5; }, kill(){ scene.remove(m); }}); }
  yield 2.2/sp; };
TWK.caotan.glint2=function*(T,ph){ const sp=twSp(T); yield* twGlint(T,2); twBark('caotan',ph>=2?"Double Take... AND SPIN!":"Double Take!");
  const rounds=ph>=2?1:2; for(let r=0;r<rounds;r++){ const P=Player, cx=P.x, cz=P.z, a0=Math.PI/4+r*Math.PI/8;
    for(const k of [0,Math.PI/2]){ const base=a0+k; if(ph>=2){ const dir=Math.random()<.5?1:-1, w=1.05/sp, A=t=>base+Math.max(0,t-w)*.75*dir;
        twBeam({x:t=>cx-Math.cos(A(t))*15,z:t=>cz-Math.sin(A(t))*15,ang:A,len:30,w:1,warn:w,dur:1.7,dmg:3,col:0xffa0d8}); }
      else twBeam({x:cx-Math.cos(base)*15,z:cz-Math.sin(base)*15,ang:base,len:30,w:1.1,warn:.8/sp,dur:.3,dmg:3,col:0x9fd8ff}); }
    T.push=.3; Sound.sfx('ting'); yield (ph>=2?2.4:1.1)/sp; }
  if(ph>=2){ yield* twGlint(T,2,.15); const P=Player; for(const k of [0,Math.PI/2]){ const b=k+rnd(0,.8); twBeam({x:P.x-Math.cos(b)*15,z:P.z-Math.sin(b)*15,ang:b,len:30,w:1.1,warn:.7/sp,dur:.3,dmg:3,col:0x9fd8ff}); } yield 1; } };
TWK.caotan.tsun=function*(T,ph){ const sp=twSp(T); T.heartEyes=1; twBark('caotan',"I-it's not like I WANTED to hit you! B-baka!!",true); Sound.sfx('doki');
  for(let i=0;i<3;i++){ const P=Player, a=Math.atan2(P.z-T.z,P.x-T.x), d=Math.min(15,Math.hypot(P.x-T.x,P.z-T.z)+3.5); FX.line(T.x,T.z,a,d,1.5,0xff6ab0,.5/sp); T.lockF=1; T.f=Math.cos(a)>0?1:-1; yield .5/sp;
    const s={t:0,hit:false,dur:d/17}; Sound.sfx('dash'); T.parried=0;
    twHz({upd(dt,play){ if(!play) return true; s.t+=dt; T.x+=Math.cos(a)*17*dt; T.z+=Math.sin(a)*17*dt; const c=twClampXZ(T.x,T.z,.5); T.x=c.x; T.z=c.z; FX.spawn(T.x,T.y+1.4,T.z,0,0,0,.35,0xff8ac8,.6,0,true);
      const P2=Player; if(!s.hit&&Math.hypot(P2.x-T.x,P2.z-T.z)<TW_DASH_R&&Math.abs(P2.y-groundY(T.x,T.z))<2.4){ const r=twHitP(2,T.x,T.z,{heavy:true,melee:true,win:TW_DASH_WIN,onParry:()=>{ T.parried=1; T.stun=Math.max(T.stun,1.6); twBark('caotan',"Y-you parried me?! ...Kyaa!",true); }}); if(r!=='none') s.hit=true; }
      return s.t<s.dur&&!T.parried; }}); yield s.dur+.08; if(T.parried){ T.heartEyes=0; T.lockF=0; return; } }
  T.lockF=0; twBark('caotan',"*SLAP*",true); twBlast(T.x,T.z,2.4,.35,{col:0xff3a7a,dmg:3,shake:.5,h:.45}); twWave(T.x,T.z,{sp:8,max:9,col:0xff6ab0,delay:.35,r0:2.4}); /* the ring starts at the slap's edge, so one jump clears whichever reaches you */ yield .9; T.heartEyes=0; };
TWK.caotan.nose=function*(T,ph){ const sp=twSp(T); T.nose=1; twBark('caotan',"I'm NOT looking at anything lewd! ...*nosebleed*",true); Sound.sfx('squelch');
  for(let i=0;i<(ph>=3?10:8);i++){ const P=Player, p=twClampXZ(P.x+P.vx*.3,P.z+P.vz*.3,.5);
    twBlast(p.x,p.z,1,.62/sp,{col:0xff1a3a,burst:0xd0102a,ring:'#ff4a5a',dmg:2,sfx:'squelch',shake:.12,onBoom(x,z){ const gy=groundY(x,z); for(let k=0;k<26;k++) FX.spawn(x+rnd(-.3,.3),gy+.2,z+rnd(-.3,.3),rnd(-1,1),rnd(9,15),rnd(-1,1),rnd(.6,1.1),k%3?0xc0081e:0xff3a4a,rnd(.25,.45),16,false); }}); yield .27/sp; }
  yield .3; twBark('caotan',"...Okay that one was a LOT of blood.",true); const gx=T.x, gz=T.z; twBlast(gx,gz,2.6,.85,{col:0xff1a3a,burst:0xd0102a,dmg:3,onBoom(x,z){ const gy=groundY(x,z); for(let k=0;k<60;k++) FX.spawn(x+rnd(-.6,.6),gy+.2,z+rnd(-.6,.6),rnd(-2,2),rnd(12,20),rnd(-2,2),rnd(.8,1.4),k%3?0xc0081e:0xff3a4a,rnd(.3,.55),18,false); }});
  yield 1.1; T.nose=0; };
TWK.caotan.maid=function*(T,ph){ const sp=twSp(T); twBark('caotan',"Welcome home, Master~! Moe moe... KYUN! ♡",true); Sound.sfx('kyun'); const P=Player, a0=rnd(0,6.28), maids=[];
  for(let i=0;i<4;i++){ const a=a0+i*Math.PI/2, p=twClampXZ(P.x+Math.cos(a)*6.5,P.z+Math.sin(a)*5,1); const s=new Sprite3D(128,128,28); maids.push({x:p.x,z:p.z,s,ph:i*.8,f:1}); FX.burst(p.x,groundY(p.x,p.z)+1.6,p.z,24,0xff8ac8,4,.35); }
  let tt=0, rot=0; const h=twHz({upd(dt,play){ if(play) tt+=dt; for(const m of maids){ const gy=groundY(m.x,m.z); m.f=Player.x>m.x?1:-1; m.s.draw((c,cx,by)=>drawCaotanBoss(c,cx,by,m.f,{t:tt+m.ph,maid:1,heartEyes:1,flash:0}));
      m.s.place(m.x,gy+1.2+Math.sin(tt*3+m.ph)*.2,m.z,gy); m.s.glow(.25); }
    return tt<3.6/sp+.3; }, kill(){ maids.forEach(m=>{ FX.burst(m.x,groundY(m.x,m.z)+1.6,m.z,20,0xffd0ec,4,.3); m.s.dispose(); }); }});
  for(let k=0;k<Math.floor(3.4/sp/.26);k++){ rot+=.42; for(const m of maids){ for(let j=0;j<2;j++){ const a=rot+j*Math.PI+m.ph; twBolt(T,{kind:'orb',col:0xff6ab0,x:m.x,y:groundY(m.x,m.z)+1.3,z:m.z,vx:Math.cos(a)*4.4*sp,vz:Math.sin(a)*4.4*sp,dmg:2,life:4}); } }
    if(k%4===0) Sound.sfx('kyun'); yield .26; }
  yield .5; };
TWK.caotan.rain=function*(T,ph){ const sp=twSp(T); twBark('caotan',"It's raining waifus! Hallelujah!",true);
  for(let w=0;w<3;w++){ const P=Player, cs=2.3, safe=[Math.floor(rnd(0,12)),Math.floor(rnd(0,12))];
    for(let i=0;i<12;i++){ if(safe.includes(i)) continue; const gx=(i%4)-1.5, gz=Math.floor(i/4)-1, p=twClampXZ(P.x+gx*cs+rnd(-.3,.3),P.z+gz*cs+rnd(-.3,.3),.5);
      const m=twBB(texPillow(),.9,2.5); m.visible=false; const fall={t:0}, gy=groundY(p.x,p.z);
      twBlast(p.x,p.z,1.15,1/sp,{col:0xff8ac8,dmg:2,sfx:'crash',shake:.15,onBoom(){ scene.remove(m); }});
      twHz({upd(dt,play){ if(play) fall.t+=dt; const u=clamp((fall.t-(1/sp-.45))/.45,0,1); m.visible=u>0; m.position.set(p.x,gy+1.3+(1-u*u)*12,p.z); m.rotation.z=(1-u)*3; return fall.t<1/sp+.05; }, kill(){ scene.remove(m); }}); }
    Sound.sfx('whoosh'); yield 1.05/sp; }
  yield .4; };

// ---------- LIMIT CUT I: Doki Doki Execution Club (dating-sim) ----------
const CAO_VN={shayan:[["D-do you like my glasses? I polished them for you.",["They're... nice?","I only love my sword.","*push up your own glasses*"]],
  ["Want to share a body pillow? Her name is Hikari-chan.",["Absolutely not.","Is it... washed?","Only if I get the left side."]],
  ["Say it. Say 'Senpai'. Just once.",["Senpai.","S-senpai... >///<","I'd rather fight the Dog Lord again."]]],
  ali:[["A-Ali-kun... do you like my glasses?",["Hm.","They're adequate.","Take them off. Fight me properly."]],
  ["Want to share a body pillow? Her name is Hikari-chan.",["I sleep standing up.","Wash her first.","Hm."]],
  ["Say it. Say 'Senpai'. Just once.",["No.","...Senpai.","I am everyone's senpai."]]]};
function twLCPrep(T){ T.inv=true; T.state='lc'; T.stun=0; T.hide=0; T.nose=0; T.heartEyes=0; T.lockF=0; T.mv=null; twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); }
TWK.caotan.lc1=function*(T){ twLCPrep(T); const c=twCenter(), A=twLock(), Pl=Player; yield twMoveTo(T,c.x,A.z0+2.2,.6);
  Game.letterTo=.35; twCutin('caotan','DOKI DOKI EXECUTION CLUB','Limit Break  ·  ♡ Dating Sim Route ♡','#ff6ab0',2.2); Sound.sfx('doki'); grade.uniforms.tint.value.set(1.18,.92,1.06);
  twBark('caotan',"Senpai... it's time we took this relationship to the NEXT LEVEL.",true); TW.spot=null; yield 1.6; twBig('WRONG ANSWER = DEATH',{size:50,col:'#ff4a6a',y:UH*.3,dur:2,sub:'Stand in the right circle before the timer runs out'}); yield .8;
  const V=TW.vn={aff:0,opts:[],q:null,qt:0,timer:null,speaker:'Caotan-senpai ♡'}; const set=CAO_VN[ALI()?'ali':'shayan'];
  twHz({upd(dt){ if(TW.vn) TW.vn.qt+=dt; return !!TW.vn; }});
  for(let r=0;r<3;r++){ const [q,opts]=set[r]; V.q=q; V.qt=0; Sound.sfx('vnblip'); Voice.play('caotan',q); const right=Math.floor(Math.random()*3), dur=[5.2,4.6,4][r]/twSp(T)*1.05;
    const spots=[[c.x-6.4,c.z+.8],[c.x,c.z+3.6],[c.x+6.4,c.z+.8]].sort(()=>Math.random()-.5);
    V.opts=opts.map((txt,i)=>{ const [x,z]=spots[i], p=twClampXZ(x,z,2.3), m=new THREE.Mesh(new THREE.RingGeometry(2,2.25,48),new THREE.MeshBasicMaterial({color:0xff8ac8,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
      m.rotation.x=-Math.PI/2; m.position.set(p.x,groundY(p.x,p.z)+.07,p.z); m.userData.tw=1; scene.add(m); const fl=new THREE.Mesh(new THREE.CircleGeometry(2,40),new THREE.MeshBasicMaterial({color:0xff6ab0,transparent:true,opacity:.12,depthWrite:false,blending:THREE.AdditiveBlending})); fl.rotation.x=-Math.PI/2; fl.position.copy(m.position); fl.userData.tw=1; scene.add(fl);
      return {text:txt,x:p.x,z:p.z,m,fl,right:i===right,glint:false}; });
    let tt=0, hr=0, glinted=false; V.timer=1;
    while(tt<dur){ const dt=.1; tt+=dt; hr-=dt; V.timer=1-tt/dur; for(const o of V.opts){ o.m.material.opacity=.6+.4*Math.sin(tt*10+o.x); }
      if(!glinted&&tt>dur*.32){ glinted=true; yield* twGlint(T,1,.05); const o=V.opts.find(o=>o.right); o.glint=true; o.fl.material.color.setHex(0xffffff); o.fl.material.opacity=.22; twBark('caotan',["*glances meaningfully*","My glasses are pointing at the RIGHT answer. Obviously.","Hint hint. Glint glint."][r],true); tt+=.05; }
      if(hr<=0){ hr=.34/twSp(T); const a=rnd(0,6.28), rr=rnd(0,4), p=twClampXZ(Pl.x+Math.cos(a)*rr,Pl.z+Math.sin(a)*rr,.5), m=twBB(texHeart('#ff4a8a'),.8,.8); const gy=groundY(p.x,p.z), f={t:0};
        twBlast(p.x,p.z,.85,.75,{col:0xff4a8a,dmg:2,sfx:'kyun',shake:.06,onBoom(){ scene.remove(m); }}); twHz({upd(d2,play){ if(play) f.t+=d2; m.position.set(p.x,gy+.6+Math.max(0,.75-f.t)*14,p.z); return f.t<.8; }, kill(){ scene.remove(m); }}); }
      yield dt; }
    V.timer=0; const inO=V.opts.find(o=>Math.hypot(Pl.x-o.x,Pl.z-o.z)<2.25);
    for(const o of V.opts){ o.res=o.right?'right':'wrong'; if(!o.right){ FX.burst(o.x,groundY(o.x,o.z)+.5,o.z,40,0xff2a5a,7,.4); FX.ring(o.x,groundY(o.x,o.z),o.z,'#ff2a5a',3,.45); } else twHeartBurst(o.x,o.z,30); }
    Sound.sfx('crossboom'); shake(.5);
    if(inO&&inO.right){ V.aff++; V.flash='♡ CORRECT ♡'; V.flashCol='#7affb0'; V.flashT=1.3; Sound.sfx('right'); twBark('caotan',["Y-you noticed my glint... *swoon*","She's... your type too? Our love is FORBIDDEN.","...Kyaaa! Say it again! No wait don't!"][r],true); }
    else { V.flash=inO?'REJECTED':'...SILENCE'; V.flashCol='#ff4a6a'; V.flashT=1.3; Sound.sfx('wrong'); twQuizDeath(); twBark('caotan',inO?"Wrong answer, senpai. The heart wants what it wants. And it wants to EXPLODE.":"Ignoring me? That's... that's actually kind of hot.",true); }
    yield 1.1; V.opts.forEach(o=>{ scene.remove(o.m); scene.remove(o.fl); }); V.opts=[];
    if(r<2){ V.q=null; T.fire=.4; for(let k=-3;k<=3;k++) twAimBolt(T,'orb',T.x,T.y+1.2,T.z,7*twSp(T),k*.16,{col:0xff6ab0}); Sound.sfx('kyun'); yield 1.1; } }
  V.q=null; const end=V.aff>=3?'TRUE END: FRIENDZONED':V.aff>=1?'NORMAL END: FRIENDZONED':'BAD END: STILL FRIENDZONED';
  twBig(end,{size:60,col:'#ffd0ec',dur:2.4,sub:V.aff>=3?'♡♡♡ Perfect score. He has no idea how to handle this.':'Affection '+V.aff+' / 3'});
  twBark('caotan',V.aff>=3?"You... got every answer right... and you STILL don't want me?!":"Rejected. Again. Like every Valentine's Day since birth.",true); Sound.sfx('shatter');
  yield 1; TW.vn=null; T.inv=false; T.stun=V.aff>=3?3:2.25; T.state='stun'; Game.letterTo=0; applyLook(L.look); twBig('PUNISH HIM',{size:46,y:UH*.62,col:'#ffd45a',dur:1.2});
  T.lcDone[2]=1; yield T.stun; };

// ---------- LIMIT CUT II: Megane Supernova (glint x10) ----------
TWK.caotan.lc2=function*(T){ twLCPrep(T); const c=twCenter(), Pl=Player; yield twMoveTo(T,c.x,c.z-1.5,.6);
  T.showN=1; Game.letterTo=.35; twCutin('caotan','MEGANE SUPERNOVA','Limit Break  ·  Glint ×10','#9fd8ff',2.2); grade.uniforms.tint.value.set(1.02,1.04,1.16); twBark('caotan',"Ten glints. No one has ever survived ten glints. Mostly because no one has tried.",true); yield 1.7;
  for(let i=1;i<=10;i++){ T.push=.4; T.glintN=i; T.glintT=.7; Sound.sfx('ting'); FX.flash=.15+i*.03; grade.uniforms.flashCol.value.set(1,1,1); twBig('✦ '+i+' ✦',{size:50+i*5,y:UH*.2,dur:.75,col:i===10?'#ffffff':'#bfe4ff'}); shake(.1+i*.03);
    const g=twGlow(0xffffff,3+i*.5); g.position.set(T.x,T.y+2,T.z+.4); twHz({upd(dt){ this.t+=dt; g.material.opacity=Math.max(0,1-this.t/.5); return this.t<.5; }, kill(){ scene.remove(g); }});
    // every glint stacks patterns: aimed fans, crosshatch snaps, spinning (jumpable) beams, body pillow volleys and nosebleed geysers
    if(i===4) twBark('caotan',"Lasers AND pillows AND blood! It's called a balanced breakfast!",true);
    if(i===7) twBark('caotan',"Spin, Hikari-chan! SPIN FOR SENPAI!",true);
    if(i<=3){ const a0=Math.atan2(Pl.z-T.z,Pl.x-T.x); for(const k of [-.8,-.4,0,.4,.8]){ const a=a0+k+(i===2?.2:0); twBeam({x:T.x,z:T.z,ang:a,len:Math.max(4,twRayWall(T.x,T.z,Math.cos(a),Math.sin(a)).t),w:1.1,warn:.6,dur:.2,dmg:3,col:k?0xffa0d8:0x9fd8ff}); }
      for(const k of [-1.1,1.1]) twCaoPillowShot(T,a0+k,10); twCaoNose(Pl.x+Pl.vx*.4,Pl.z+Pl.vz*.4,.7); yield .45; twCaoNose(Pl.x+Pl.vx*.3,Pl.z+Pl.vz*.3,.6); yield .5; }
    else if(i<=6){ for(const k of [0,Math.PI/4,Math.PI/2,Math.PI*.75]){ const b=Math.PI/8+k+i*.3; twBeam({x:Pl.x-Math.cos(b)*15,z:Pl.z-Math.sin(b)*15,ang:b,len:30,w:1.1,warn:.75,dur:.28,dmg:3,col:0xffa0d8}); }
      const dir=i%2?1:-1, b0=rnd(0,6.28); for(let k=0;k<2;k++) twBeam({x:T.x,z:T.z,ang:t=>b0+k*Math.PI+Math.max(0,t-.7)*1.1*dir,len:18,w:1,warn:.7,dur:1.3,dmg:3,col:0xbfe4ff});
      const a0=rnd(0,6.28); for(let k=0;k<4;k++) twCaoPillowShot(T,a0+k*Math.PI/2,8.5); yield .5;
      for(let k=0;k<3;k++){ const a=rnd(0,6.28); twCaoNose(Pl.x+Math.cos(a)*1.6*(k?1:0),Pl.z+Math.sin(a)*1.6*(k?1:0),.65); } yield .75; }
    else if(i<=9){ const dir=i%2?1:-1, b0=rnd(0,6.28), n=i-3; for(let k=0;k<n;k++){ const B=t=>b0+k*6.283/n+Math.max(0,t-.8)*.95*dir; twBeam({x:T.x,z:T.z,ang:B,len:18,w:1,warn:.8,dur:1.6,dmg:3,col:0xbfe4ff}); }
      const a0=Math.atan2(Pl.z-T.z,Pl.x-T.x); for(const k of [-.35,.35]) twCaoPillowShot(T,a0+k,11); yield .55;
      const b=rnd(0,Math.PI); for(const k of [0,Math.PI/2]) twBeam({x:Pl.x-Math.cos(b+k)*15,z:Pl.z-Math.sin(b+k)*15,ang:b+k,len:30,w:1.1,warn:.7,dur:.25,dmg:3,col:0xffa0d8});
      for(let k=0;k<2;k++){ twCaoNose(Pl.x+Pl.vx*.35,Pl.z+Pl.vz*.35,.6); yield .3; } yield .35; }
    else { twBark('caotan',"TEN. MEGANE... SUPERNOVAAAA!",true); yield .3;
      // he yeets Hikari-chan. she is the only cover in the world.
      const a=Math.atan2(Pl.z-T.z,Pl.x-T.x)+rnd(-.7,.7), r=clamp(Math.hypot(Pl.x-T.x,Pl.z-T.z)*.8,3.5,6.5), p=twClampXZ(T.x+Math.cos(a)*r,T.z+Math.sin(a)*r,2.4), m=twBB(texPillow(),1.3,3.4), ux=(p.x-T.x)/Math.hypot(p.x-T.x,p.z-T.z), uz=(p.z-T.z)/Math.hypot(p.x-T.x,p.z-T.z), s={x:p.x+ux*1.5,z:p.z+uz*1.5};
      const safe=FX.marker(s.x,s.z,1.5,0x5ab0ff,3.1); TW.caoSafe=s; let landed=false; twThrow({x:T.x,y:T.y+1.5,z:T.z,tx:p.x,tz:p.z,dur:.7,h:4,mesh:m,spin:12,r:.6,col:0xffffff,keepMesh:true,onLand(){ landed=true; m.rotation.z=0; Sound.sfx('crash'); FX.burst(p.x,groundY(p.x,p.z)+.5,p.z,20,0xffffff,4,.3); }});
      yield .75; twBig('HIDE BEHIND HIKARI-CHAN!',{size:54,col:'#bfe4ff',dur:2.2,y:UH*.62}); Sound.sfx('drone'); Sound.sfx('choir');
      const ch={t:0}; twHz({upd(dt){ ch.t+=dt; FX.flash=Math.min(.7,ch.t*.35); grade.uniforms.flashCol.value.set(.85,.95,1); for(let k=0;k<6;k++){ const aa=rnd(0,6.28), rr=rnd(1,10); FX.spawn(T.x+Math.cos(aa)*rr,T.y+rnd(0,4),T.z+Math.sin(aa)*rr,-Math.cos(aa)*rr*1.4,0,-Math.sin(aa)*rr*1.4,.6,0xffffff,.35,0,true); } return ch.t<2.2; }});
      yield 2.2; impactFrame([[1,3],[2,2],[1,2],[3,2]]); FX.flash=1; Sound.sfx('crossboom'); Sound.sfx('skyopen'); shake(1.4); FX.hitstop=.12;
      const bm=[beamMesh(0xbfe4ff,3.5),beamMesh(0xffffff,1.6)]; bm.forEach(o=>{ o.userData.tw=1; o.position.set(T.x,T.y+2,T.z); o.lookAt(T.x,T.y+30,T.z); o.scale.set(1,1,40); });
      twHz({upd(dt){ this.t+=dt; const k=Math.max(0,1-this.t/1.2); bm.forEach(o=>{ o.scale.x=o.scale.y=Math.max(.01,k*(1+Math.sin(this.t*50)*.1)); }); return this.t<1.2; }, kill(){ bm.forEach(o=>scene.remove(o)); }});
      for(let k=0;k<5;k++) FX.ring(T.x,groundY(T.x,T.z)+.1,T.z,k%2?'#ffffff':'#9fd8ff',6+k*4,.6+k*.1);
      if(Math.hypot(Pl.x-s.x,Pl.z-s.z)>1.6){ TW.caoSafe=null; Pl.inv=0; Pl.dash=0; hurtPlayer(99,T.x,T.z); /* Megane Supernova: no cover = dead */ twBark('caotan',"Should've hugged the pillow, senpai.",true); } else { TW.caoSafe=null; Game.dmgNums.push({x:Pl.x,y:Pl.y+2.4,z:Pl.z,n:'SHIELDED BY WAIFU',t:0,big:true,col:'#bfe4ff'}); twBark('caotan',"You... used Hikari-chan as a SHIELD?! She's seen worse. But still!",true); }
      yield 1.2; scene.remove(m); } }
  T.cracked=1; T.glintN=0; T.showN=0; Sound.sfx('glass'); twBark('caotan',"My glasses... MY GLASSES! I can't see! Everything is so... blurry and beautiful...",true); twBig('LENS CRACKED',{size:52,col:'#ffd45a',sub:'Caotan is wide open'});
  Game.letterTo=0; applyLook(L.look); T.inv=false; T.stun=2.75; T.state='stun'; T.lcDone[3]=1; yield T.stun; };

// Caotan's lasers read the same everywhere: blue = low, jump it; pink = tall wall, you cannot jump it
const TW_CAO_COLS=[0x9fd8ff,0xbfe4ff,0xffa0d8,0xffb0e0,0xff9ad8,0xff6ab0];
(function(){ const tb=twBeam; twBeam=function(o){ if(o&&TW_CAO_COLS.includes(o.col)){ const jump=o.jump!=null?!!o.jump:typeof o.ang==='function'; o=Object.assign({},o,{col:jump?0x7ac8ff:0xff7ac8,wall:!jump}); } return tb(o); }; })();
// Megane Supernova helpers: a nosebleed geyser on a marked spot, and a body pillow flung in a straight line
function twCaoNose(x,z,warn){ const p=twClampXZ(x,z,.5); twBlast(p.x,p.z,1.1,warn,{col:0xff1a3a,burst:0xd0102a,ring:'#ff4a5a',dmg:2,sfx:'squelch',shake:.1,onBoom(x,z){ const gy=groundY(x,z); for(let k=0;k<22;k++) FX.spawn(x+rnd(-.3,.3),gy+.2,z+rnd(-.3,.3),rnd(-1,1),rnd(9,15),rnd(-1,1),rnd(.6,1.1),k%3?0xc0081e:0xff3a4a,rnd(.25,.45),16,false); }}); }
function twCaoPillowShot(T,a,v){ const m=twBB(texPillow(),.8,2.2), s={x:T.x,z:T.z,t:0,hit:false}; Sound.sfx('whoosh');
  twHz({upd(dt,play){ if(!play) return true; s.t+=dt; s.x+=Math.cos(a)*v*dt; s.z+=Math.sin(a)*v*dt; const gy=groundY(s.x,s.z), A=twBounds(); m.position.set(s.x,gy+1.1,s.z); m.rotation.z+=dt*16;
      if(Math.random()<.5) FX.spawn(s.x,gy+1,s.z,0,.5,0,.35,0xffd0ec,.22,0,true);
      const P=Player; if(!s.hit&&Math.hypot(P.x-s.x,P.z-s.z)<.95&&P.y<gy+.9){ const r=twHitP(2,s.x,s.z); if(r!=='none') s.hit=true; }
      return s.t<3.5&&s.x>A.x0-1&&s.x<A.x1+1&&s.z>A.z0-1&&s.z<A.z1+1; }, kill(){ scene.remove(m); }}); }
// a dash straight at you with a ground arrow first: parry bait (a wide body and a roomy parry window so it parries from any angle)
var TW_DASH_R=1.9, TW_DASH_WIN=.36;
function* twGlomp(T,sp){ const P=Player, a=Math.atan2(P.z-T.z,P.x-T.x), d=Math.min(14,Math.hypot(P.x-T.x,P.z-T.z)+3); twBark('caotan',"Senpai GLOMP!",true); FX.line(T.x,T.z,a,d,2.6,0xff6ab0,.55/sp); T.lockF=1; T.f=Math.cos(a)>0?1:-1; yield .55/sp;
  const s={t:0,hit:false,dur:d/17}; Sound.sfx('dash'); T.parried=0;
  twHz({upd(dt,play){ if(!play) return true; s.t+=dt; T.x+=Math.cos(a)*17*dt; T.z+=Math.sin(a)*17*dt; const c=twClampXZ(T.x,T.z,.5); T.x=c.x; T.z=c.z; FX.spawn(T.x,T.y+1.4,T.z,0,0,0,.35,0xffd0ec,.6,0,true);
    const P2=Player; if(!s.hit&&Math.hypot(P2.x-T.x,P2.z-T.z)<TW_DASH_R&&Math.abs(P2.y-groundY(T.x,T.z))<2.4){ const r=twHitP(2,T.x,T.z,{heavy:true,melee:true,win:TW_DASH_WIN,onParry:()=>{ T.parried=1; T.stun=Math.max(T.stun,1.4); twBark('caotan',"Rejected... at point blank range...",true); }}); if(r!=='none') s.hit=true; }
    return s.t<s.dur&&!T.parried; }}); yield s.dur+.1; T.lockF=0; }

// ---------- Caotan's white goo: sperm-shaped pellets (a head and a wriggling tail, pointing where they fly) and goo splats where they land ----------
const TW_SPERM=[], TW_SPLAT=[];
function twSpermTex(f){ if(TW_SPERM[f]) return TW_SPERM[f]; const W=48, H=18, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d');
  try{ c.lineCap='round'; const pts=[]; for(let i=0;i<=14;i++){ const u=i/14; pts.push([33-u*31,H/2+Math.sin(u*8.5-f*1.5708)*u*4.2]); }
    for(const [w,col] of [[4.4,'#7c7e94'],[2.4,'#f6f6fc']]) for(let i=0;i<14;i++){ c.strokeStyle=col; c.lineWidth=Math.max(.9,w*(1-i/14*.75)); c.beginPath(); c.moveTo(pts[i][0],pts[i][1]); c.lineTo(pts[i+1][0],pts[i+1][1]); c.stroke(); }
    const el=(x,y,rx,ry,col)=>{ c.fillStyle=col; c.beginPath(); c.ellipse(x,y,rx,ry,0,0,7); c.fill(); };
    el(38,H/2,9,7,'#7c7e94'); el(38,H/2,7.6,5.8,'#fbfbff'); el(36.5,H/2+2.2,5.5,2.4,'#d6d8e6'); el(40.5,H/2-2.4,2.4,1.4,'#ffffff'); }catch(e){}
  const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.encoding=THREE.sRGBEncoding; return TW_SPERM[f]=t; }
// a sperm sprite on par (a projectile's group): it turns to the direction par moves on screen and wriggles its tail
function twSperm(par,size){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:twSpermTex(0),transparent:true,alphaTest:.1,depthWrite:false,fog:false})); s.scale.set(size,size*18/48,1); s.renderOrder=5; par.add(s);
  const last=new THREE.Vector3(), cur=new THREE.Vector3(); par.updateMatrixWorld(); par.getWorldPosition(last); let f=0, ft=0;
  Game.fxUpd.push(dt=>{ try{ let o=par; while(o.parent) o=o.parent; if(o!==scene) return false; ft+=dt; if(ft>.055){ ft=0; f=(f+1)%4; s.material.map=twSpermTex(f); }
      par.getWorldPosition(cur); const a=toScreen(last.x,last.y,last.z), b=toScreen(cur.x,cur.y,cur.z), dx=b[0]-a[0], dy=b[1]-a[1]; if(dx*dx+dy*dy>.04) s.material.rotation=Math.atan2(-dy,dx); last.copy(cur); return true; }catch(e){ console.error('sperm',e); return false; } });
  return s; }
// white goo bolts (Caotan's volleys) become sperm instead of glowing orbs
(function(){ const sp=spawnProj; spawnProj=function(o){ const b=sp.apply(this,arguments); try{ if(b&&b.kind==='goo'&&o&&o.col===0xffffff&&b.m){ if(b.core) b.core.visible=false; if(b.gl) b.gl.visible=false; twSperm(b.m,1.3); } }catch(e){ console.error('goo sperm',e); } return b; }; })();
// a white goo splat for slowing puddles: a wobbly blob with droplets around it
function twSplatTex(v){ if(TW_SPLAT[v]) return TW_SPLAT[v]; const S=64, cv=document.createElement('canvas'); cv.width=cv.height=S; const c=cv.getContext('2d');
  try{ const blob=(cx,cy,r,col,j)=>{ c.fillStyle=col; c.beginPath(); for(let i=0;i<=40;i++){ const a=i/40*6.2832, rr=r*(1+.16*Math.sin(a*5+v*1.9+j)+.08*Math.sin(a*11+v*3.3)); const x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr; if(i) c.lineTo(x,y); else c.moveTo(x,y); } c.fill(); };
    const drops=[]; for(let i=0;i<9;i++){ const a=i/9*6.2832+v, d=19+((i*7+v*5)%9); drops.push([S/2+Math.cos(a)*d,S/2+Math.sin(a)*d,2+((i+v)%3)]); }
    for(const [x,y,r] of drops){ c.fillStyle='#9a9cb2'; c.beginPath(); c.arc(x,y,r+1,0,7); c.fill(); } blob(S/2,S/2,17.5,'#9a9cb2',0);
    for(const [x,y,r] of drops){ c.fillStyle='#f2f2fa'; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); } blob(S/2,S/2,16,'#f2f2fa',0); blob(S/2+2,S/2+2,10,'#dcdcea',.6); blob(S/2-5,S/2-5,4.5,'#ffffff',1.3); }catch(e){}
  const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.encoding=THREE.sRGBEncoding; return TW_SPLAT[v]=t; }
