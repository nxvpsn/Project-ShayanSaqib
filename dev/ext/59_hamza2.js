// =====================================================================
// GIANT HAMZA, REMASTERED ("Big Back Hamza", Shayan's pact route, the twins on your side)
//   New moves: Bismillah Bounce (three flops that chase you), Pork Roll (he rolls and bounces off the walls),
//   Holy Wind (a cone of gas from the wrong end), Bacon Rain, and ITADAKIMASU (the grab: he inhales; get sucked in
//   and you are swallowed; the twins cut you out).
//   Limit cut (phase II, 50%): BIG BACK BUFFET (he orders plates and lunges to each in order, belly drum rings,
//   then his inhale against Omar's black hole: stand in the calm between). At 0: FOOD COMA FRENZY, 15 seconds, then the finale.
// =====================================================================
for(const k of [1,2]) HZG_HP[k]=[0,150,180][k];
function hzgSp(G){ return G.phase>=2?1.15:1; }
function hzgAlly(who){ return TW.allies.find(a=>a.who===who&&!a.gone)||null; }
// ---------- BISMILLAH BOUNCE: three flops, each one chasing where you are going (the third leaves two jump rings) ----------
HZG.bounce=function*(G,ph){ const sp=hzgSp(G); twBark('hamza',"Bismillah... BOUNCE! Bismillah... BOUNCE!",true);
  for(let k=0;k<3;k++){ const P=Player, p=twClampXZ(P.x+P.vx*.5,P.z+P.vz*.5,2.2), up=(k?.75:.95)/sp; FX.marker(p.x,p.z,2.6,0xff6a9a,up+.05); Sound.sfx('pigroar'); G.mouth=.6; G.mv={sx:G.x,sz:G.z,x:p.x,z:p.z,t:0,dur:up};
    const u={t:0}; twHz({upd(dt){ u.t+=dt; G.air=Math.sin(Math.min(1,u.t/up)*Math.PI)*(k===2?7:4.5); return u.t<up; }, kill(){ G.air=0; }}); yield up+.03;
    Sound.sfx('slam'); Sound.sfx('crash'); shake(k===2?1.1:.6); FX.burst(G.x,groundY(G.x,G.z)+.4,G.z,40,0xd8c0c8,7,.45,false); FX.ring(G.x,groundY(G.x,G.z),G.z,'#ffb0c8',4.5,.5);
    if(twInR(G.x,G.z,2.6,1.5)) twHitP(3,G.x,G.z,{ub:true}); if(k===2){ twWave(G.x,G.z,{col:0xffb0c8,sp:8,max:12,r0:2.6}); twWave(G.x,G.z,{col:0xffb0c8,sp:8,max:12,delay:.5,r0:2.6}); } yield .2; }
  G.mouth=0; yield .7; };
// ---------- PORK ROLL: he curls up and rolls, bouncing off the walls (each new line flashes first). Dash through or get clear ----------
HZG.roll=function*(G,ph){ const sp=hzgSp(G); twBark('hamza',"Pork roll! I'm a sushi now!",true); Sound.sfx('pigrumble'); G.mouth=0;
  const P=Player, s={a:Math.atan2(P.z-G.z,P.x-G.x),b:0,stop:.6,hit:0,t:0}; FX.line(G.x,G.z,s.a,24,4.6,0xff6a9a,.6); const A=twLock(), n=ph>=2?4:3;
  const h=twHz({upd(dt,play){ if(!play) return true; s.t+=dt; if(s.stop>0){ s.stop-=dt; return true; } const v=17*sp; G.x+=Math.cos(s.a)*v*dt; G.z+=Math.sin(s.a)*v*dt; let bo=false;
      if(G.x<A.x0+2.4||G.x>A.x1-2.4){ s.a=Math.atan2(Math.sin(s.a),-Math.cos(s.a)); bo=true; } if(G.z<A.z0+2.4||G.z>A.z1-2.4){ s.a=Math.atan2(-Math.sin(s.a),Math.cos(s.a)); bo=true; } G.x=clamp(G.x,A.x0+2.4,A.x1-2.4); G.z=clamp(G.z,A.z0+2.4,A.z1-2.4);
      if(bo){ s.b++; Sound.sfx('crash'); shake(.5); FX.burst(G.x,G.y+1,G.z,30,0xd8c0c8,6,.4,false); if(s.b<n){ FX.line(G.x,G.z,s.a,24,4.6,0xff6a9a,.5); s.stop=.5; } }
      FX.spawn(G.x+rnd(-1.5,1.5),groundY(G.x,G.z)+.3,G.z+rnd(-1.5,1.5),rnd(-2,2),rnd(1,3),rnd(-2,2),.5,0xd8c0c8,.4,8,false);
      const Pp=Player; if(s.hit<=0&&Math.hypot(Pp.x-G.x,Pp.z-G.z)<2.3&&Pp.y<G.y+2){ if(twHitP(3,G.x,G.z,{ub:true})!=='none') s.hit=.8; } if(s.hit>0) s.hit-=dt; twAllyAoE(G.x,G.z,2.3,2);
      return s.b<n; }});
  let w=0; while(TW.hz.includes(h)&&w<9){ yield .1; w+=.1; } yield .6; };
// ---------- HOLY WIND: he turns around. A cone of green gas; the gas lingers (slow, chip damage) ----------
function twCone(x,z,a,r,half,warn,col){ const m=new THREE.Mesh(new THREE.CircleGeometry(r,28,-half,half*2),new THREE.MeshBasicMaterial({color:col||0x8aff6a,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
  m.rotation.x=-Math.PI/2; m.rotation.z=-a; m.position.set(x,groundY(x,z)+.07,z); m.userData.tw=1; scene.add(m); const k={t:0}; twHz({upd(dt){ k.t+=dt; m.material.opacity=.2+.25*(Math.floor(k.t*12)%2); return k.t<warn; }, kill(){ scene.remove(m); }}); }
HZG.wind=function*(G,ph){ const sp=hzgSp(G); twBark('hamza',"Bismillah. Excuse me. This one is... holy.",true); G.mouth=.2;
  for(let k=0;k<(ph>=2?2:1);k++){ const P=Player, a=Math.atan2(P.z-G.z,P.x-G.x)+(k?rnd(-.6,.6):0), R=9, half=.55, warn=.95/sp; twCone(G.x,G.z,a,R,half,warn); Sound.sfx('pigrumble'); yield warn;
    Sound.sfx('pee'); Sound.sfx('whoosh'); shake(.5); for(let i=0;i<40;i++){ const b=a+rnd(-half,half), d=rnd(1,R); FX.spawn(G.x+Math.cos(b)*d,groundY(G.x,G.z)+rnd(.3,2),G.z+Math.sin(b)*d,Math.cos(b)*4,rnd(.5,1.5),Math.sin(b)*4,1.2,i%2?0x8aff6a:0x5a9a3a,.6,0,false); }
    const P2=Player, d=Math.hypot(P2.x-G.x,P2.z-G.z); if(d<R&&angDiff(Math.atan2(P2.z-G.z,P2.x-G.x),a)<half&&P2.y<G.y+2.5) twHitP(3,G.x,G.z,{ub:true});
    for(let i=0;i<3;i++){ const dd=3+i*2.4; twZone(G.x+Math.cos(a)*dd,G.z+Math.sin(a)*dd,1.3,4,{slow:.4,dmg:1,every:.8,col:0x8aff6a,op:.45,fx:.12,fxCol:0x8aff6a}); }
    if(k===0) twBark('caotan',"MY GLASSES ARE FOGGING UP!",true); yield .5; }
  G.mouth=0; yield .5; };
// ---------- BACON RAIN: strips of bacon fall from the sky (circles first), a lane at a time ----------
HZG.bacon=function*(G,ph){ const sp=hzgSp(G); twBark('hamza',"It's raining... my cousins. I'm so sorry, cousins.",true);
  for(let w=0;w<(ph>=2?4:3);w++){ const P=Player, a=rnd(0,Math.PI), ux=Math.cos(a), uz=Math.sin(a), vx=-uz, vz=ux, side=w%2?1:-1;
    for(let k=-3;k<=3;k++) for(const s of [1.3,3.5]){ const x=P.x+ux*k*2+vx*s*side, z=P.z+uz*k*2+vz*s*side; twBlast(x,z,1.05,.85/sp,{col:0xff6a5a,burst:0xc0503a,ring:'#ffb0a0',dmg:2,quiet:k!==0,sfx:'crash',shake:.1}); }
    twBlast(P.x,P.z,1.05,1.05/sp,{col:0xff6a5a,dmg:2,sfx:'crash'}); yield .95/sp; }
  yield .5; };
// ---------- ITADAKIMASU: the inhale. Dash away (the pull stops while you dash). Reach his snout = swallowed ----------
HZG.vacuum=function*(G,ph){ const sp=hzgSp(G); twBark('hamza',"ITADAKIMASU!",true); G.mouth=1; Sound.sfx('suck'); twBig('DASH AWAY!',{size:58,col:'#ffb0c8',y:UH*.26,dur:1.3,sub:'He is inhaling. Do not touch the snout.'});
  const dur=(ph>=2?3.6:3)/1, st={t:0,ate:false}; let tick=0;
  twHz({upd(dt,play){ if(!play) return true; st.t+=dt; const P=Player; if(!P.hidden&&P.dash<=0&&!P.cineFly){ const dx=G.x-P.x, dz=G.z-P.z, d=Math.hypot(dx,dz)||1, k=(ph>=2?5.6:5)*Math.min(1,st.t*2); const q=twClampXZ(P.x+dx/d*k*dt,P.z+dz/d*k*dt,.3); P.x=q.x; P.z=q.z;
        if(d<2.5&&!st.ate&&Game.state==='play'){ st.ate=true; run(function*(){ yield* hzgSwallow(G); }); } }
      for(let i=0;i<4;i++){ const a=rnd(0,6.28), r=rnd(3,9); FX.spawn(G.x+Math.cos(a)*r,G.y+rnd(.3,2),G.z+Math.sin(a)*r,-Math.cos(a)*r*1.4,0,-Math.sin(a)*r*1.4,.5,i%2?0xffb0c8:0xffffff,.3,0,true); }
      return st.t<dur&&!st.ate; }});
  while(st.t<dur&&!st.ate){ tick-=.1; if(tick<=0&&ph>=2){ tick=.7; const P=Player, a=rnd(0,6.28), x=P.x+Math.cos(a)*7, z=P.z+Math.sin(a)*6, d=Math.hypot(G.x-x,G.z-z)||1; twBolt(G,{kind:'bone',x,y:groundY(x,z)+1,z,vx:(G.x-x)/d*7,vz:(G.z-z)/d*7,dmg:2,life:2}); } yield .1; }
  G.mouth=0; yield st.ate?.2:.6; };
function* hzgSwallow(G){ const P=Player, H=Game.hamza, C=hzgAlly('caotan'), O=hzgAlly('omar'), gy=groundY(G.x,G.z), dt=1/60, tint=grade.uniforms.tint.value.clone();
  P.inv=99; P.cineFly=true; P.cineAnim='hurt'; P.atk=null; P.charge=0; P.dash=0; P.vx=P.vz=P.vy=0; Game.letterTo=.5; G.mouth=1; for(const A of [C,O]) if(A){ A.hold=1; A.air=1.3; }
  // into the snout: the camera pushes in with you
  const sx=P.x, sz=P.z, mx=G.x+(P.x<G.x?-1:1)*1.2, my=gy+2.4; Sound.sfx('suck'); twBark('hamza',"Itadakimasu~",true);
  for(let t=0;t<.6;t+=dt){ const u=twEIn2(t/.6); P.x=lerp(sx,mx,u); P.z=lerp(sz,G.z+.4,u); P.y=lerp(gy,my,u); const cx=lerp(sx,mx,u*.8); cineSet(cx+(sx<G.x?-2.6:2.6)*(1-u*.6),my+.4,P.z+4.2-u*2,P.x,P.y+.6,P.z); yield wait(dt*.5); }
  // inside. it is warm. it is pink. it is dark.
  P.hidden=true; Sound.sfx('chomp'); shake(.8); impactFrame([[3,2],[1,2]]); grade.uniforms.tint.value.set(1.6,.45,.6); FX.flash=.5; grade.uniforms.flashCol.value.set(1,.4,.5);
  cineSet(G.x,gy+2,G.z+2.4,G.x,gy+2,G.z); const gut={on:1}; Game.fxUpd.push(()=>{ if(!gut.on) return false; for(let i=0;i<5;i++) FX.spawn(G.x+rnd(-2,2),gy+rnd(.5,3.5),G.z+rnd(-.5,1),rnd(-.5,.5),rnd(.5,2),0,.8,i%3?0x8aff6a:0xff6a8a,.35,0,true); return true; });
  twBark('shayan',"IT'S SO WARM IN HERE! WHY IS IT WARM?!",true); yield wait(1.4);
  cineSet(G.x+5,gy+2,G.z+9,G.x,gy+2.4,G.z); twBark('caotan',"SENPAI GOT EATEN! OMAR, DO SURGERY!",true); yield wait(1.3);
  // the twins cut him out: a glint laser and a scythe through the belly
  if(C){ C.x=G.x-5; C.z=G.z+2; C.push=.5; C.glintT=.6; Sound.sfx('ting'); twAllyRay(C.x,C.y+1.9,C.z,G.x,gy+2,G.z,0xff9ad8); } yield wait(.3);
  if(O){ FX.burst(O.x,O.y+1.4,O.z,22,0x140a1a,4,.45,false); O.x=G.x+1.6; O.z=G.z+1.2; O.cast=.6; Sound.sfx('swing'); FX.arc(G.x,gy,G.z,0,0,true); FX.cut(G.x,gy+2,G.z+.5); twBark('omar',"Surgery. I watched a video.",true); }
  JC.lines.push({x0:UW*.2,y0:UH*.65,x1:UW*.8,y1:UH*.35,t:0,ttl:.5}); impactFrame([[2,2],[1,1]]); Sound.sfx('gore'); Sound.sfx('crash'); shake(1); yield wait(.5);
  // hic. spat out across the field, the camera chasing you
  gut.on=0; grade.uniforms.tint.value.copy(tint); twBark('hamza',"*HIC* ...you taste like iron. Blacksmiths are crunchy.",true); Sound.sfx('chomp'); P.hidden=false;
  const B=twBounds(); let best=-1, ba=0; for(let k=0;k<8;k++){ const a=k*Math.PI/4, ux=Math.cos(a), uz=Math.sin(a), room=Math.min(ux>1e-3?(B.x1-G.x)/ux:ux<-1e-3?(B.x0-G.x)/ux:1e9,uz>1e-3?(B.z1-G.z)/uz:uz<-1e-3?(B.z0-G.z)/uz:1e9); if(room>best){ best=room; ba=a; } }
  const ex=G.x+Math.cos(ba)*Math.min(9,best-1), ez=G.z+Math.sin(ba)*Math.min(9,best-1), x0=G.x, z0=G.z;
  for(let t=0;t<.7;t+=dt){ const u=t/.7; P.x=lerp(x0,ex,u); P.z=lerp(z0,ez,u); P.y=groundY(P.x,P.z)+Math.sin(u*Math.PI)*5+lerp(2,0,u); FX.spawn(P.x,P.y+1,P.z,0,0,0,.3,0x8aff6a,.4,0,true); cineSet(P.x+1.5,P.y+1.5,P.z+6,P.x,P.y+.8,P.z); yield wait(dt*.5); }
  Sound.sfx('slam'); shake(.6); P.cineFly=false; P.cineAnim=null; P.inv=0; Cam.cine=null; Game.letterTo=0; G.mouth=0; for(const A of [C,O]) if(A){ A.hold=0; A.air=0; }
  Game.dmgNums.push({x:P.x,y:P.y+2.6,z:P.z,n:'DIGESTED',t:0,big:true,col:'#8aff6a'}); hurtPlayer(6,G.x,G.z); G.stun=Math.max(G.stun,2.2); Game.dmgNums.push({x:G.x,y:G.y+4.6,z:G.z,n:'INDIGESTION',t:0,big:true,col:'#ffd45a'}); }
HZG_POOL[1].push('bounce','roll','wind','vacuum'); HZG_POOL[2].push('bounce','roll','wind','vacuum','bacon','bacon');

// =====================================================================
// LIMIT CUT: BIG BACK BUFFET (phase II, 50%)
// =====================================================================
(function(){ const hh=hzgHurt; hzgHurt=function(d,src){ const r=hh.apply(this,arguments), G=TW.giant;
    if(G&&G.phase>=2&&!G.lcDone&&!G.inv&&G.hp>0&&G.hp<=G.maxHp/2){ G.lcDone=1; G.inv=true; G.gen=hzgBuffet(G); G.wait=0; G.air=0; G.mv=null; twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); }
    return r; }; })();
function texPlate(){ return twTex('plate',32,32,c=>{ const P=(x,y,w,h,k)=>R(c,x,y,w,h,k); P(2,10,28,14,'#f4f0e8'); P(4,12,24,10,'#e0d8cc'); P(8,8,16,9,'#c8782a'); P(10,6,12,4,'#e8a04a'); P(11,9,3,2,'#fff4d0'); P(17,10,3,2,'#fff4d0'); P(9,13,14,2,'#a85a1a'); }); }
function* hzgBuffet(G){ const c=G.center||twCenter(), A=twBounds(); G.inv=true; G.mouth=0;
  run(function*(){ yield* hzgBuffetIntro(G,c); }); yield .05; Game.letterTo=.35;
  const plates=[]; for(let i=0;i<6;i++){ const a=i*1.047+.3, p=twClampXZ(c.x+Math.cos(a)*7,c.z+Math.sin(a)*5.2,2), m=twBB(texPlate(),1.6,1.6); m.position.set(p.x,groundY(p.x,p.z)+.5,p.z); plates.push({x:p.x,z:p.z,m}); }
  const ding=(pl,n)=>{ Sound.sfx('ting'); FX.ring(pl.x,groundY(pl.x,pl.z)+.1,pl.z,'#ffd45a',2,.4); FX.burst(pl.x,groundY(pl.x,pl.z)+1,pl.z,16,0xffd45a,3,.3); Game.dmgNums.push({x:pl.x,y:groundY(pl.x,pl.z)+2.4,z:pl.z,n:String(n),t:0,big:true,col:'#ffd45a'}); };
  try{
    // a) orders: he names plates in order, then lunges to each one in that order
    for(let r=0;r<2;r++){ const n=r?5:3, ord=plates.slice().sort(()=>Math.random()-.5).slice(0,n); if(r) twBark('hamza',"FIVE. And keep them coming.",true); else twBark('hamza',"Waiter! Number one, number two, number three!",true); yield .6;
      for(let i=0;i<n;i++){ ding(ord[i],i+1); yield .42; } yield .4;
      for(const pl of ord){ const a=Math.atan2(pl.z-G.z,pl.x-G.x), d=Math.hypot(pl.x-G.x,pl.z-G.z); FX.line(G.x,G.z,a,d,3.4,0xff3a5a,.45); G.mouth=1; Sound.sfx('pigrumble'); yield .45;
        Sound.sfx('chomp'); Sound.sfx('dash'); const s={t:0,hit:false,dur:d/22,a}; twHz({upd(dt,play){ if(!play) return true; s.t+=dt; G.x+=Math.cos(s.a)*22*dt; G.z+=Math.sin(s.a)*22*dt; const c2=twClampXZ(G.x,G.z,2); G.x=c2.x; G.z=c2.z;
          const P=Player; if(!s.hit&&Math.hypot(P.x-G.x,P.z-G.z)<2.2){ if(twHitP(3,G.x,G.z,{ub:true})!=='none') s.hit=true; } twAllyAoE(G.x,G.z,2.2,2); return s.t<s.dur; }}); yield s.dur+.05; G.mouth=0; FX.burst(pl.x,groundY(pl.x,pl.z)+.6,pl.z,30,0xc8782a,5,.35); Sound.sfx('chomp'); }
      yield .5; }
    // b) belly drum: four rings in rhythm (jump), snot in between
    twBark('hamza',"Belly drum! Bismillah, the beat drops!",true); for(let k=0;k<4;k++){ G.mouth=.4; Sound.sfx('slam'); shake(.5); twWave(G.x,G.z,{col:0xffb0c8,sp:8.5,max:13,r0:2.2}); if(k%2){ for(let j=0;j<5;j++) twAimBolt(G,'goo',G.x,G.y+2.4,G.z,8,(j-2)*.2,{col:0x8aff6a}); Sound.sfx('squelch'); } yield .8; }
    G.mouth=0; yield .6;
    // c) his inhale against Omar's black hole: stand in the calm between them
    const O=hzgAlly('omar'), P=Player; let hx, hz; { const a=Math.atan2(P.z-G.z,P.x-G.x); const p=twClampXZ(G.x+Math.cos(a)*12,G.z+Math.sin(a)*9,2); hx=p.x; hz=p.z; }
    if(O){ O.x=hx+1.5; O.z=hz+1; O.cast=4; } twBark('omar',"Pig. Let us see whose hole is hungrier.",true); const V=twHoleVis(hx,groundY(hx,hz)+1.4,hz,1.3,true), hv={t:0,k:0,on:1}; Game.fxUpd.push(d=>{ hv.t+=d; hv.k=hv.on?Math.min(1,hv.k+d*2):Math.max(0,hv.k-d*3); V.t=hv.t; V.set(hv.k); if(!hv.on&&hv.k<=0){ V.kill(); return false; } return true; });
    const mx=(G.x+hx)/2, mz=(G.z+hz)/2, ring=new THREE.Mesh(new THREE.RingGeometry(2,2.25,48),new THREE.MeshBasicMaterial({color:0x7ac8ff,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.position.set(mx,groundY(mx,mz)+.08,mz); ring.userData.tw=1; scene.add(ring);
    twBig('STAND IN THE CALM',{size:52,col:'#bfe4ff',y:UH*.26,dur:1.6,sub:'Two pulls. The blue ring is the only place neither reaches.'}); G.mouth=1; Sound.sfx('suck'); Sound.sfx('void'); let tick=0;
    for(let t=0;t<5;t+=.05){ const P2=Player, inCalm=Math.hypot(P2.x-mx,P2.z-mz)<2.1; tick-=.05;
      if(!inCalm&&P2.dash<=0&&!P2.cineFly){ const toG=Math.hypot(P2.x-G.x,P2.z-G.z)<Math.hypot(P2.x-hx,P2.z-hz), tx=toG?G.x:hx, tz=toG?G.z:hz, dx=tx-P2.x, dz=tz-P2.z, d=Math.hypot(dx,dz)||1, q=twClampXZ(P2.x+dx/d*3.2*.05,P2.z+dz/d*3.2*.05,.3); P2.x=q.x; P2.z=q.z;
        if(tick<=0){ tick=.6; twHitP(1,tx,tz,{ub:true}); Game.dmgNums.push({x:P2.x,y:P2.y+2.4,z:P2.z,n:toG?'SLURPED':'SPAGHETTIFIED',t:0,col:'#ffb0c8'}); } }
      ring.material.opacity=.55+.35*Math.sin(t*12); for(let i=0;i<3;i++){ const a=rnd(0,6.28), r=rnd(2.5,6); FX.spawn(mx+Math.cos(a)*r,groundY(mx,mz)+rnd(.3,2),mz+Math.sin(a)*r,(Math.random()<.5?G.x-mx:hx-mx)*.6,0,(Math.random()<.5?G.z-mz:hz-mz)*.6,.5,i%2?0xffb0c8:0x8a2aff,.3,0,true); } yield .05; }
    // he swallows the black hole. it does not agree with him.
    Sound.sfx('chomp'); hv.on=0; scene.remove(ring); twBark('hamza',"...Hamza ate a black hole. Hamza regrets.",true); yield .6;
    Sound.sfx('crossboom'); FX.flash=.8; grade.uniforms.flashCol.value.set(.8,.4,1); impactFrame([[3,2],[1,2],[2,2]]); shake(1.4); FX.burst(G.x,G.y+2,G.z,90,0x8a2aff,9,.5); twBark('omar',"That was a family heirloom.",true);
  } finally { plates.forEach(p=>scene.remove(p.m)); Game.letterTo=0; G.mouth=0; }
  twBig('FOOD COMA',{size:60,col:'#ffd45a',sub:'Hamza is stunned. Go!'}); G.inv=false; G.stun=5; yield 5; }
function* hzgBuffetIntro(G,c){ const P=Player, C=hzgAlly('caotan'), O=hzgAlly('omar'), gy=groundY(G.x,G.z); Game.letterTo=.5; P.vx=P.vz=0; for(const A of [C,O]) if(A){ A.hold=1; A.air=1.3; }
  G.mv=null; G.x=c.x; G.z=c.z-1.5; cineSet(G.x+2,gy+1.4,G.z+9,G.x,gy+3,G.z); Sound.sfx('pigroar'); twBark('hamza',"Waiter! I'll have the buffet. All of it. Twice.",true); yield wait(1.6);
  for(let i=0;i<6;i++){ const a=i*1.047+.3, p=twClampXZ(c.x+Math.cos(a)*7,c.z+Math.sin(a)*5.2,2); FX.burst(p.x,groundY(p.x,p.z)+6,p.z,20,0xffd45a,4,.4); }
  yield cineTo([c.x,gy+9,c.z+13],[c.x,gy,c.z-1],1.2,twEIO); Sound.sfx('crash');
  cineSet(P.x+1.2,P.y+1.4,P.z+4,P.x,P.y+1.4,P.z); twBark('shayan',"There's no WAITER, Hamza!",true); yield wait(1.3);
  if(C){ cineSet(C.x+1,C.y+1.4,C.z+4,C.x,C.y+1.6,C.z); twBark('caotan',"...I'll be the waiter. For senpai.",true); yield wait(1.3); }
  twCutin('hamza','BIG BACK BUFFET','Limit Break  ·  he orders, you dodge','#ff6a9a',1.8); yield wait(1);
  yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.6); Cam.cine=null; for(const A of [C,O]) if(A){ A.hold=0; A.air=0; } }

// =====================================================================
// PHASE II TRANSITION: the twins try to finish him; he eats Omar's scythe; then the whole field
// =====================================================================
hzgPhase2=function*(){ const G=TW.giant, P=Player, C=hzgAlly('caotan'), O=hzgAlly('omar'), gy=groundY(G.x,G.z); Sound.stop(); Game.letterTo=1; P.inv=99; G.inv=true; G.mouth=.3; for(const A of [C,O]) if(A){ A.hold=1; A.air=1.3; }
  cineSet(G.x+2,gy+2,G.z+9,G.x,gy+2.6,G.z); yield wait(.4); yield say('hamza',"Oink... Hamza is... resting his eyes.");
  if(C&&O){ C.x=G.x-4.5; C.z=G.z+2.5; O.x=G.x+4.5; O.z=G.z+2.5; cineSet(G.x,gy+1.4,G.z+10,G.x,gy+2.4,G.z);
    yield say('caotan',"Now, senpai! I'll pin him, Omar cuts, you finish!",'angry');
    C.push=.5; C.glintT=.6; Sound.sfx('ting'); twAllyRay(C.x,C.y+1.9,C.z,G.x,gy+2.6,G.z,0xbfe4ff); yield wait(.4);
    FX.burst(O.x,O.y+1.4,O.z,22,0x140a1a,4,.45,false); O.x=G.x+1.8; O.z=G.z+1.4; O.cast=.6; Sound.sfx('swing'); cineSet(G.x+2.4,gy+2.4,G.z+5,G.x+.6,gy+2.6,G.z); yield wait(.25);
    // he catches the scythe in his teeth. crunch.
    G.mouth=1; Sound.sfx('chomp'); Sound.sfx('block'); impactFrame([[1,2],[2,1]]); shake(.7); FX.burst(G.x+1,gy+2.6,G.z+.8,30,0xb06aff,5,.35); yield wait(.4);
    yield say('omar',"...He bit my scythe."); Sound.sfx('chomp'); yield wait(.3); Sound.sfx('chomp'); yield say('omar',"He is EATING my scythe.");
    yield say('hamza',"Crunchy. Tastes like sadness. Needs salt."); yield say('omar',"...Gerald.",'angry'); }
  cineSet(G.x+2,gy+2,G.z+9,G.x,gy+3,G.z); yield say('hamza',"You think THIS is my final form? I haven't even had LUNCH.");
  Sound.sfx('suck'); Sound.sfx('chomp'); const fl={on:1}; Game.fxUpd.push(()=>{ if(!fl.on) return false; for(let i=0;i<8;i++){ const a=rnd(0,6.28), r=rnd(4,14), x=G.x+Math.cos(a)*r, z=G.z+Math.sin(a)*r; FX.spawn(x,groundY(x,z)+.2,z,(G.x-x)*1.4,rnd(.5,2),(G.z-z)*1.4,.7,i%2?0xffffff:0x306040,.3,0,false); } return true; });
  yield cineTo([G.x,gy+10,G.z+15],[G.x,gy+1,G.z],1.4,twEIO); yield say('',"Hamza inhaled every flower in the field. The field was, briefly, just a field."); fl.on=0;
  cineSet(G.x,gy+.5,G.z+11,G.x,gy+5,G.z); yield tween(G,{gs:.72},1.2,t=>1-Math.pow(1-t,3)); Sound.sfx('pigroar'); shake(1); impactFrame([[3,2],[1,2]]);
  evaCard(['PHASE II','SECOND BREAKFAST'],1.8,1); yield wait(1.8);
  if(C) yield say('caotan',"He got BIGGER?! That's not fair, I've been bulking for YEARS!",'angry');
  twCamP(6.2,1.2); yield say('shayan',"Hamza, buddy. Spit out the scythe. And the flowers. And the field.",'angry');
  G.phase=2; G.hp=G.maxHp=HZG_HP[2]; G.inv=false; G.pend=null; G.bag=[]; G.cd=1.2; G.mouth=0; G.lcDone=0; Sound.play('diva'); for(const A of [C,O]) if(A){ A.hold=0; A.air=0; }
  yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.7); Cam.cine=null; Game.letterTo=0; P.inv=1; };

// =====================================================================
// FOOD COMA FRENZY: at zero he does not stop eating. 15 seconds, everything faster. Then he falls asleep mid-chew.
// =====================================================================
(function(){ const hf=hzgFinale; hzgFinale=function*(){ const G=TW.giant; if(G&&!G.frenzied){ G.frenzied=1; G.frCk=1; yield* hzgFrenzy(G); if(TW.giant!==G) return; G.frCk=0; } yield* hf.apply(this,arguments); };
  const hs=hzgStart; hzgStart=function(){ const r=hs.apply(this,arguments), G=TW.giant, gr=TW.giantRespawn; TW.giantRespawn=function(){ gr.apply(this,arguments); const G2=TW.giant; if(!G2) return; G2.lcDone=0; G2.air=0; TW.hg=null; if(G2.frCk){ G2.hp=0; G2.inv=true; if(!Game.script){ G2.frenzied=0; G2.pend=hzgFinale; } } }; return r; }; })();
function* hzgFrenzy(G){ const P=Player, gy=groundY(G.x,G.z); G.inv=true; G.mouth=1; Game.letterTo=1;
  cineSet(G.x+2,gy+1.6,G.z+9,G.x,gy+3,G.z); for(let i=0;i<5;i++){ G.flash=i%2?.3:0; Sound.sfx('chomp'); yield wait(.12); }
  yield say('hamza',"Hamza is... still... HUNGRY!",'angry'); yield say('shayan',"He's at ZERO! How is he still eating?!",'surprised');
  yield say('omar',"Fifteen seconds. Even a stomach has limits."); evaCard(['FOOD COMA FRENZY','SURVIVE 15 SECONDS'],1.6,1); Sound.sfx('slam'); shake(1); yield wait(1.6);
  Cam.cine=null; Game.letterTo=0; Game.state='play'; Sound.play('diva'); P.inv=1; const H=TW.hg={left:15,total:15,label:'FOOD COMA · SURVIVE'};
  const plan=[[0,'bounce'],[3.2,'roll'],[6.4,'piglets'],[8.6,'bacon'],[11.6,'flop']], run2=[]; let k=0, sn=0;
  while(H.left>0){ yield wait(1/120); if(Game.state!=='play'||TW.giant!==G) continue; const dt=1/60; H.left=Math.max(0,H.left-dt); const el=15-H.left;
    while(k<plan.length&&el>=plan[k][0]){ run2.push({g:HZG[plan[k][1]](G,2),w:0}); k++; }
    sn-=dt; if(sn<=0&&el<13.5){ sn=1.1; for(let j=0;j<5;j++) twAimBolt(G,'goo',G.x,G.y+2.4,G.z,8.5,(j-2)*.18,{col:0x8aff6a}); Sound.sfx('squelch'); }
    for(const o of run2){ if(o.done) continue; o.w-=dt; let n=0; while(o.w<=0&&!o.done&&n++<40){ const r=o.g.next(); if(r.done) o.done=1; else o.w+=r.value; } } }
  TW.hg=null; twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); G.air=0; G.mouth=.4; Game.state='cut'; twBig('ZZZ',{size:80,col:'#ffd0ec',y:UH*.3,dur:1.4,sub:'He fell asleep mid-chew.'}); Sound.sfx('pigrumble'); yield wait(1.2); }
