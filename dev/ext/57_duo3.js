// =====================================================================
// THE DOUBLE FIGHT, REMASTERED (1/2): toolkit, director, synergy patterns
//   Shared bar. Every entry is one choreographed duo move (both twins scripted together).
//   The Graveyard: Omar's scythes stick in the ground (volleys, deflects, cutscenes); at 50 he calls SCYTHE RAIN.
//   Caotan: new laser patterns (Senpai Cage, Glint Ricochet, Hikari Refraction) on the blue = jump / pink = wall rule.
//   Omar: Getsuga Tenshou (dash through it or sidestep), black holes. Grabs: TWIN EXECUTION (57b).
//   Limit cuts, transitions, Burnout and the ending live in 57b_duo3cine.js; Ali's assists in 58_aliassist.js.
// =====================================================================
const DUO3={hp:[0,230,260,290],gap:[0,.95,.75,.6],rain:50,seed:[0,0,20,30]};
for(const k of [1,2,3]) DUO_HP[k]=DUO_SHARED_HP[k]=DUO3.hp[k];
const DUO3_POOL={1:['glompReap','crossfire','cage','volley','tagTeam','sentenceSnipe'],
  2:['glompReap','crossfire','cage','volley','tagTeam','sentenceSnipe','prism','horizon','getsugaLaser','ricochet'],
  3:['glompReap','cage','volley','sentenceSnipe','prism','horizon','getsugaLaser','ricochet','hikariGetsuga','tearRift']};
// ranged moves Ali may cut short (the twin he kicks)
const DUO3_RANGED={crossfire:'caotan',cage:'caotan',volley:'omar',sentenceSnipe:'omar',prism:'caotan',getsugaLaser:'omar',ricochet:'caotan',hikariGetsuga:'omar'};

// ---------- small animation helpers (several at once, beside a script) ----------
function twAnim(o,props,dur,ez,delay){ const from={}, s={t:-(delay||0)}; ez=ez||(t=>t*(2-t));
  Game.fxUpd.push(dt=>{ if(s.dead) return false; s.t+=dt; if(s.t<0) return true; if(!s.init){ s.init=1; for(const k in props) from[k]=o[k]; } const u=Math.min(1,s.t/Math.max(.001,dur)), e=ez(u); for(const k in props) o[k]=lerp(from[k],props[k],e); return u<1; }); return s; }
const twEIO=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2, twEOut3=t=>1-Math.pow(1-t,3), twEIn2=t=>t*t;
// a camera that follows something every frame until stopped: fn() -> [px,py,pz,lx,ly,lz]
function twCamFollow(fn){ const s={}; Game.fxUpd.push(()=>{ if(s.dead) return false; const v=fn(); if(v) cineSet(v[0],v[1],v[2],v[3],v[4],v[5]); return true; }); return s; }
// AI Ali (never the co-op friend)
function twAliAI(){ if(TW.coop) return null; return TW.allies.find(a=>a.who==='ali'&&!a.remote&&!a.gone)||null; }
function twAliAny(){ return TW.allies.find(a=>a.who==='ali'&&!a.gone)||null; }
// an ally held in place for a cutscene (A.hold); A.air lifts him, A.holdAnim poses him
(function(){ const ua=twUpdateAlly; twUpdateAlly=function(A,dt,play){ if(A.hold&&!A.remote){ A.t+=dt; A.flash=Math.max(0,A.flash-dt); A.inv=Math.max(0,A.inv-dt); const gy=groundY(A.x,A.z);
    A.y=lerp(A.y,(gy>-50?gy:Player.y)+(A.air||0),Math.min(1,dt*10)); A.anim=A.holdAnim||'idle'; if(A.face!=null) A.f=A.face; return; } return ua.apply(this,arguments); }; })();

// ---------- every hazard and bolt a duo move makes is tagged with that move (so Ali can cut it short) ----------
TW._mid=null;
function* twMidGen(mid,g){ for(;;){ const pv=TW._mid; TW._mid=mid; let r; try{ r=g.next(); } finally{ TW._mid=pv; } if(r.done) return; yield r.value; } }
(function(){ const hz=twHz; twHz=function(h){ if(TW._mid&&h.mid==null) h.mid=TW._mid; return hz.apply(this,arguments); };
  const sp=spawnProj; spawnProj=function(o){ const b=sp.apply(this,arguments); if(b&&TW._mid) b.mid=TW._mid; return b; };
  const bl=twBlast; twBlast=function(x,z){ const h=bl.apply(this,arguments); if(h){ h._x=x; h._z=z; } return h; };
  const th=twThrow; twThrow=function(o){ const h=th.apply(this,arguments); if(h&&o){ h._x=o.tx; h._z=o.tz; } return h; };
  const zn=twZone; twZone=function(x,z){ const h=zn.apply(this,arguments); if(h){ h._x=x; h._z=z; } return h; };
  const wv=twWave; twWave=function(x,z){ const h=wv.apply(this,arguments); if(h){ h._x=x; h._z=z; } return h; };
  const bm=twBeam; twBeam=function(o){ const h=bm.apply(this,arguments); if(h&&o&&typeof o.x==='number'&&typeof o.z==='number'){ const a=typeof o.ang==='number'?o.ang:0, l=Math.min(o.len||8,8)*.5; h._x=o.x+Math.cos(a)*l; h._z=o.z+Math.sin(a)*l; } return h; }; })();

// ---------- Omar's Getsuga Tenshou: a black crescent that runs along the ground. Too tall to jump: step aside or dash through it ----------
function twGetsugaMesh(s,col){ const g=new THREE.Group();
  const mA=new THREE.Mesh(new THREE.PlaneGeometry(s,s),new THREE.MeshBasicMaterial({map:CRESC,color:col||0x9a4aff,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false,blending:THREE.AdditiveBlending}));
  const mD=new THREE.Mesh(new THREE.PlaneGeometry(s*.82,s*.82),new THREE.MeshBasicMaterial({map:CRESC,color:0x05010a,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false})); mD.position.z=.02;
  const mB=mA.clone(); mB.rotation.y=Math.PI/2; mB.scale.set(.75,1,1); g.add(mA,mD,mB); g.userData.tw=1; g.userData.mats=[mA.material,mD.material]; scene.add(g); return g; }
function twGetsuga(T,a,o){ o=Object.assign({sp:14,warn:.55,dmg:3,w:1.45,len:22,s:3.4,col:0x9a4aff},o||{}); const sx=o.x!=null?o.x:T.x, sz=o.z!=null?o.z:T.z, b={x:sx,z:sz,t:0,trav:0,hit:false,on:false}, g=twGetsugaMesh(o.s,o.col);
  g.visible=false; g.rotation.y=-a; if(o.warn>0) FX.line(sx,sz,a,o.len,o.w*2,0x9a4aff,o.warn);
  const h=twHz({upd(dt,play){ if(play) b.t+=dt; if(b.t<o.warn) return true;
      if(!b.on){ b.on=true; g.visible=true; Sound.sfx('beam'); Sound.sfx('swing'); shake(.25); if(T&&T.who==='omar'){ T.swing=1; T.scythe=1; } FX.burst(sx,groundY(sx,sz)+1.5,sz,18,0x8a3aff,5,.35); }
      if(play){ const st=o.sp*dt; b.x+=Math.cos(a)*st; b.z+=Math.sin(a)*st; b.trav+=st; }
      const gy=groundY(b.x,b.z), k=Math.min(1,(o.len-b.trav)*.6); g.position.set(b.x,gy+o.s*.42,b.z); g.userData.mats.forEach(m=>m.opacity=Math.max(0,k)); h._x=b.x; h._z=b.z;
      for(let i=0;i<3;i++) FX.spawn(b.x+rnd(-.6,.6),gy+rnd(.2,o.s*.8),b.z+rnd(-.6,.6),-Math.cos(a)*3,rnd(-.4,.4),-Math.sin(a)*3,.4,i%2?0x8a3aff:0x0a0010,.4,0,i%2===1);
      if(play&&!b.hit){ const P=Player, px=P.x-b.x, pz=P.z-b.z, al=px*Math.cos(a)+pz*Math.sin(a), pe=Math.abs(px*Math.sin(a)-pz*Math.cos(a));
        if(al>-.9&&al<.9&&pe<o.w&&P.y<gy+o.s*.85){ if(twHitP(o.dmg,b.x,b.z,{ub:true})!=='none') b.hit=true; } twAllyLine(b.x-Math.cos(a)*.9,b.z-Math.sin(a)*.9,Math.cos(a),Math.sin(a),1.8,o.w,2); }
      return b.trav<o.len; }, kill(){ scene.remove(g); }});
  h._x=sx; h._z=sz; return h; }

// ---------- black holes ----------
function twHoleVis(x,y,z,r,disk){ const core=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:0x000000})); core.userData.tw=1; scene.add(core); const halo=twGlow(0x8a2aff,1); let dk=null;
  if(disk){ TW._bhd=TW._bhd||bhDiskTex(); dk=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:TW._bhd,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false,color:0xc080ff})); dk.rotation.x=-1.25; dk.userData.tw=1; scene.add(dk); }
  return {x,y,z,r,k:0,t:0,set(k){ this.k=k; const s=Math.max(.01,this.r*k); core.scale.setScalar(s); core.position.set(this.x,this.y,this.z); halo.position.copy(core.position); halo.scale.setScalar(Math.max(.01,s*4+Math.sin(this.t*20)*.3*k)); if(dk){ dk.position.copy(core.position); dk.scale.setScalar(Math.max(.01,s*7)); dk.rotation.z+=.02; }
      if(k>.1) for(let i=0;i<3;i++){ const a=rnd(0,6.28), rr=rnd(1.5,4)*Math.max(1,this.r); FX.spawn(this.x+Math.cos(a)*rr,this.y+rnd(-1,1),this.z+Math.sin(a)*rr,-Math.cos(a)*rr*1.6,0,-Math.sin(a)*rr*1.6,.5,i%2?0x8a2aff:0x1a0a2a,.3,0,i%2===0); } },
    kill(){ scene.remove(core); scene.remove(halo); if(dk) scene.remove(dk); }}; }
// eaten by a black hole: hurt, then spat out toward the most open side
function twHoleEat(x,z,dmg){ const P=Player; P.inv=0; P.dash=0; FX.burst(P.x,P.y+1,P.z,50,0x8a2aff,7,.4); Sound.sfx('chomp'); Sound.sfx('crossboom'); shake(.9);
  Game.dmgNums.push({x:P.x,y:P.y+2.6,z:P.z,n:'EATEN',t:0,big:true,col:'#c08aff'}); const B=twBounds(); let best=-1, ba=0;
  for(let k=0;k<8;k++){ const a=k*Math.PI/4, ux=Math.cos(a), uz=Math.sin(a), room=Math.min(ux>1e-3?(B.x1-P.x)/ux:ux<-1e-3?(B.x0-P.x)/ux:1e9,uz>1e-3?(B.z1-P.z)/uz:uz<-1e-3?(B.z0-P.z)/uz:1e9); if(room>best){ best=room; ba=a; } }
  hurtPlayer(dmg,x,z); if(P.cineFly) return; const air=.8; P.vx=Math.cos(ba)*7/air; P.vz=Math.sin(ba)*7/air; P.vy=9.4; P.onGround=false; P.hurt=air; P.bhLaunch=Game.time+air; }
// a small black hole that pulls (none while dashing) and eats on contact; it can drift and bounce off the walls
function twMiniHole(x,z,o){ o=Object.assign({r:.7,pull:4.5,range:5.5,dur:6,eat:.95,dmg:5,vx:0,vz:0,h:1.1},o||{}); const V=twHoleVis(x,groundY(x,z)+o.h,z,o.r,o.disk), s={x,z,t:0,ate:0};
  const h=twHz({upd(dt,play){ if(play){ s.t+=dt; s.x+=o.vx*dt; s.z+=o.vz*dt; const c=twClampXZ(s.x,s.z,1.4); if(c.x!==s.x) o.vx*=-1; if(c.z!==s.z) o.vz*=-1; s.x=c.x; s.z=c.z; if(s.ate>0) s.ate-=dt; }
      const k=Math.min(1,s.t*2.5)*Math.min(1,Math.max(0,(o.dur-s.t)*3)); V.x=s.x; V.z=s.z; V.y=groundY(s.x,s.z)+o.h; V.t=s.t; V.set(k); h._x=s.x; h._z=s.z;
      const P=Player; if(play&&k>.5&&!P.hidden&&P.dash<=0&&!P.cineFly&&!(P.bhLaunch>Game.time)&&!(P.bhPause>Game.time)){ const dx=s.x-P.x, dz=s.z-P.z, d=Math.hypot(dx,dz)||1;
        if(d<o.range&&d>.2){ const f=o.pull*(1-d/o.range*.5), q=twClampXZ(P.x+dx/d*f*dt,P.z+dz/d*f*dt,.3); P.x=q.x; P.z=q.z; }
        if(d<o.eat&&P.y<groundY(s.x,s.z)+2.2&&s.ate<=0){ s.ate=1.5; twHoleEat(s.x,s.z,o.dmg); } }
      return s.t<o.dur; }, kill(){ V.kill(); }});
  h._x=x; h._z=z; h.hole=s; return h; }

// ---------- Hikari-chan (a body pillow, any size) ----------
function twHikari(x,z,s){ const m=twBB(texPillow(),.95*s,2.6*s); const H={x,z,y:groundY(x,z)+1.3*s,s,m,spin:0,gone:false,
    put(){ m.position.set(this.x,this.y,this.z); m.rotation.z=this.spin; },
    kill(){ if(!this.gone){ this.gone=true; scene.remove(m); } }}; H.put(); return H; }
function twHikariBurst(x,y,z){ for(let i=0;i<3;i++) FX.burst(x,y,z,24,i%2?0xff8ac8:0xffffff,5,.35); twHeartBurst(x,z,24); Sound.sfx('kyun'); }

// Caotan's aimed beams: pink = tall wall (move), blue = low (jump)
function twPink(x,z,a,o){ const w=twRayWall(x,z,Math.cos(a),Math.sin(a)); return twBeam(Object.assign({x,z,ang:a,len:Math.max(4,w.t),w:1.05,warn:.6,dur:.22,dmg:3,col:0xffa0d8,jump:false},o||{})); }
function twBlue(x,z,a,o){ return twBeam(Object.assign({x:x-Math.cos(a)*15,z:z-Math.sin(a)*15,ang:a,len:30,w:1.2,warn:.5,dur:.18,dmg:3,col:0x9fd8ff,jump:true,y:.45},o||{})); }

// =====================================================================
// THE GRAVEYARD: planted scythes stay for the whole duo fight (a retry wipes them). 50 = SCYTHE RAIN.
// =====================================================================
twPlantOn=function(b){ const F=TW.fight; return !!F&&(F.kind==='solo'||F.kind==='duo')&&b.kind==='scythe'&&!b.rally&&!b.storm&&!b.rain&&!!b.src&&b.src.who==='omar'; };
(function(){ const ch=twClearHz; twClearHz=function(){ const F=TW.fight; if(F&&F.kind==='duo'&&!TW._wipe){ const pv=TW._lcPrep; TW._lcPrep=1; try{ return ch.apply(this,arguments); } finally{ TW._lcPrep=pv; } } return ch.apply(this,arguments); }; })();
// plant a scythe somewhere (it falls from the sky and sticks in, no damage): used by volleys, cutscenes and phase seeds
function twPlantDrop(x,z,delay,instant){ const m=twScytheMesh(true), gy=groundY(x,z), s={t:instant?.35:-(delay||0)}; m.visible=false;
  twHz({upd(dt){ s.t+=dt; if(s.t<0) return true; m.visible=true; const u=Math.min(1,s.t/.35); m.position.set(x,gy+.45+(1-u)*9,z); m.rotation.z=u<1?s.t*20:2.3; if(u>=1){ m.rotation.set(0,rnd(0,6.28),2.3+rnd(-.3,.3)); m.userData.tw=0; m.userData.plant=1;
      FX.burst(x,gy+.2,z,10,0x2a1a30,3,.3,false); Sound.sfx('hit'); TW.planted.push({x,y:gy+.45,z,m}); return false; } return true; }, kill(){ if(s.t<.35) scene.remove(m); }}); }
function twDuoSeed(n){ const A=twBounds(); let k=0; for(let i=TW.planted.length;i<n;i++){ twPlantDrop(rnd(A.x0+1.5,A.x1-1.5),rnd(A.z0+1.5,A.z1-1.5),k*.05); k++; } }
// the count under the bar; the planted blades hum purple near 50
function twDrawGraveyard(){ const F=TW.fight; if(!F||F.kind!=='duo'||F.noBar||Game.state==='title'||!F.C) return; const n=Math.min(DUO3.rain,TW.planted.length), hot=n>=DUO3.rain*.8, t=performance.now()/1000;
  const x=UW/2-326, y=UH-38-Game.letter*70; D.save(); D.textAlign='right'; D.font=`900 ${hot?17+Math.sin(t*10)*2:15}px ${FB}`; D.lineWidth=4; D.strokeStyle='#0a0612'; const s=TW.storming?'⚔ SCYTHE RAIN':'⚔ '+n+' / '+DUO3.rain;
  D.strokeText(s,x,y); D.fillStyle=TW.storming?'#ff5a6a':hot?'#d08aff':'#a89ac0'; D.fillText(s,x,y); D.restore();
  if(hot) for(const o of TW.planted) if(Math.random()<.04) FX.spawn(o.x+rnd(-.3,.3),o.y+rnd(0,.8),o.z,0,rnd(.5,1.2),0,.5,0x9a3aff,.25,0,true); }
(function(){ const dh=drawHUD; drawHUD=function(){ dh(); try{ twDrawGraveyard(); }catch(e){ console.error('graveyard',e); } }; })();

// =====================================================================
// THE DIRECTOR (replaces the old pre): one duo move at a time, Scythe Rain forced at 50
// =====================================================================
(function(){ const ds=twDuoStart; twDuoStart=function(cx,cz,ox,oz){ const F=ds(cx,cz,ox,oz); F.v3=1; F.heals=0; F.pre=function(dt,play){ twDuo3Pre(F,dt,play); }; return F; }; })();
function twDuo3Pre(F,dt,play){ const C=F.C, O=F.O; if(!C||!O) return; if(typeof twDuo3Assist==='function') twDuo3Assist(F,dt,play); if(!play||!F.director||F.lc) return;
  if(F.busy){ if(!C.gen&&!O.gen){ F.busy=0; F.mid=null; } else return; }
  if(C.stun>0||O.stun>0||C.down||O.down) return; F.dcd-=dt; if(F.dcd>0) return;
  let k; if(TW.planted.length>=DUO3.rain&&!TW.storming&&F.phase>=2) k='scytheRain';
  else { if(!F.bag.length||F.bagPh!==F.phase){ F.bag=DUO3_POOL[F.phase].slice().sort(()=>Math.random()-.5); F.bagPh=F.phase; if(F.bag[0]===F.lastK) F.bag.push(F.bag.shift()); } k=F.bag.shift(); }
  twDuo3Begin(F,k); }
function twDuo3Begin(F,k){ const C=F.C, O=F.O, mid=(F.midN=(F.midN||0)+1); F.mid=mid; F.lastK=k; F.busy=1; F.guard=null; F.kick=null;
  C.gen=twMidGen(mid,DUO[k](C,O,F.phase)); C.wait=0; C.state='duo'; O.gen=twWaitFor(C)(); O.wait=0; O.state='duo';
  if(typeof twDuo3Roll==='function') twDuo3Roll(F,k,mid); F.dcd=DUO3.gap[F.phase]*(TW.coop?.8:1); }
// run Omar's own generator alongside Caotan's, tagged with the same move
function twDuoAlso(T,g){ const F=TW.fight; T.gen=twMidGen(F&&F.mid,g); T.wait=0; T.state='duo'; }

// =====================================================================
// SHARED PIECES
// =====================================================================
// Caotan blinks out (about 9 units away), glints, then glomps along a pink arrow. Strict parry on contact (the window is wide);
// dodge out of the arrow or dash through. Getting glomped = TWIN EXECUTION (the grab). K: a shared combo counter.
function* twDuoGlomp(C,sp,tell,K){ const F=TW.fight, p=twTsunFar(C); twBlink(C,p.x,p.z); yield .14;
  const P=Player, a=Math.atan2(P.z-C.z,P.x-C.x), d=Math.min(15,Math.hypot(P.x-C.x,P.z-C.z)+3), ux=Math.cos(a), uz=Math.sin(a);
  C.heartEyes=1; C.push=.3; C.glintT=.4; Sound.sfx('ting'); Sound.sfx('doki'); FX.line(C.x,C.z,a,d,2.6,0xff6ab0,tell); C.lockF=1; C.f=ux>0?1:-1; twBark('caotan',"Senpai GLOMP!",true);
  const from=Game.time+TW_STRICT.grace; yield tell;
  const s={t:0,res:null,dur:d/17}; Sound.sfx('dash'); C.parried=0;
  twHz({upd(dt,play){ if(!play) return true; s.t+=dt; C.x+=ux*17*dt; C.z+=uz*17*dt; const c=twClampXZ(C.x,C.z,.5); C.x=c.x; C.z=c.z; FX.spawn(C.x,C.y+1.4,C.z,0,0,0,.35,0xff8ac8,.6,0,true);
    const P2=Player; if(!s.res&&Math.hypot(P2.x-C.x,P2.z-C.z)<TW_DASH_R&&Math.abs(P2.y-groundY(C.x,C.z))<2.4){
      const r=twStrictDo(from,()=>twHitP(0,C.x,C.z,{melee:true,heavy:true,win:TW_DASH_WIN,onParry:()=>{ C.parried=1; if(K) twComboTick(K); }})); if(r!=='none') s.res=r; }
    return s.t<s.dur&&!C.parried&&s.res!=='hit'; }});
  let w=0; while(w<s.dur+.1&&!C.parried&&s.res!=='hit'){ yield .016; w+=.016; }
  C.lockF=0;
  if(s.res==='hit'&&F&&F.kind==='duo'&&Game.state==='play'){ C.heartEyes=1; run(function*(){ yield* twTwinExecution(F); }); yield .1; C.heartEyes=0; return 'grab'; }
  C.heartEyes=0; if(C.parried){ C.stun=Math.max(C.stun,1.2); C.flash=.3; twBark('caotan',"Rejected... at point blank range...",true); } return s.res||'miss'; }
// Omar teleports behind you and reaps on a steady beat (strict parry)
function* twDuoReap(O,sp,K){ const from=Game.time+TW_STRICT.grace, P=Player, a=(P.ang||0)+Math.PI+rnd(-.6,.6), p=twClampXZ(P.x+Math.cos(a)*2.1,P.z+Math.sin(a)*2.1,.6); FX.marker(p.x,p.z,1,0x8a3aff,.45/sp);
  FX.burst(O.x,O.y+1.4,O.z,22,0x140a1a,4,.45,false); O.hide=1; Sound.sfx('dash'); yield .4/sp; O.x=p.x; O.z=p.z; O.y=groundY(p.x,p.z)+O.hy; O.mv=null; O.hide=0; FX.burst(O.x,O.y+1.4,O.z,22,0x140a1a,4,.45,false);
  O.scythe=1; O.swing=0; const P2=Player, aa=Math.atan2(P2.z-O.z,P2.x-O.x), tell=.45/sp; O.lockF=1; O.f=Math.cos(aa)>0?1:-1; FX.line(O.x,O.z,aa,2.8,2.6,0xb06aff,tell); yield tell;
  O.swing=1; Sound.sfx('swing'); FX.arc(O.x,groundY(O.x,O.z),O.z,aa,0,true); let par=false; const P3=Player, d=Math.hypot(P3.x-O.x,P3.z-O.z);
  if(d<2.8&&(d<.8||angDiff(Math.atan2(P3.z-O.z,P3.x-O.x),aa)<1.15)&&Math.abs(P3.y-groundY(O.x,O.z))<2.2) twStrictDo(from,()=>twHitP(2,O.x,O.z,{heavy:true,melee:true,onParry:()=>{ par=true; O.flash=.3; }}));
  if(par&&K) twComboTick(K); yield .3/sp; O.lockF=0; O.scythe=0; O.swing=0; return par; }
function twDuoBroken(C,O,K,t){ if(K.par<K.n) return false; for(const T of [C,O]){ T.stun=Math.max(T.stun,t||3); T.state='stun'; T.flash=.5; T.lockF=0; } twComboBroken((C.x+O.x)/2,(C.z+O.z)/2); return true; }
// the Senpai Cage: four pink walls in a # around you (stay in the middle cell), then a blue beam through the cell: jump it
function* twCage(C,sp,cx,cz){ const P=Player; cx=cx!=null?cx:P.x; cz=cz!=null?cz:P.z; const a=rnd(0,Math.PI/2), h=1.65, warn=.85/sp, dur=1.35;
  C.push=.4; C.glintT=.5; Sound.sfx('ting'); FX.ring(cx,groundY(cx,cz)+.1,cz,'#ff9ad8',2.4,.5);
  for(const b of [a,a+Math.PI/2]){ const ux=Math.cos(b), uz=Math.sin(b), vx=-uz, vz=ux; for(const s of [-1,1]){ const ox=cx+vx*s*h, oz=cz+vz*s*h; twBeam({x:ox-ux*15,z:oz-uz*15,ang:b,len:30,w:.75,warn,dur,dmg:3,col:0xff9ad8,jump:false}); } }
  yield warn+.3; const b=Math.random()<.5?a:a+Math.PI/2; C.push=.3; C.glintT=.3; Sound.sfx('ting'); twBlue(cx,cz,b,{warn:.45/sp}); yield .45/sp+.45; }

// =====================================================================
// THE MOVES (each is a generator on Caotan; Omar waits, or runs his own part through twDuoAlso)
// =====================================================================
// LOVE-HATE SANDWICH: Caotan glomps, Omar reaps behind you (twice in phase II+). Parry them all: both stunned.
DUO.glompReap=function*(C,O,ph){ const sp=twSp(C), K={n:ph>=2?3:2,par:0}; twBark('caotan',"Love-Hate Sandwich! I hug, he stabs!",true);
  const r=yield* twDuoGlomp(C,sp,[0,.62,.52,.46][ph],K); if(r==='grab') return; yield .25;
  for(let i=0;i<K.n-1;i++){ if(i===0) twBark('omar',"I am the bread. The sad bread.",true); yield* twDuoReap(O,sp,K); yield .12; }
  if(twDuoBroken(C,O,K,3.2)) twBark('omar',"You ate the whole sandwich. Rude.",true); yield .3; };
// CROSSFIRE: two blue beams cross in an X on you (jump), then Omar's scythes curve in from both sides (deflect: they stick in the ground)
DUO.crossfire=function*(C,O,ph){ const sp=twSp(C); yield* twGlint(C,2,.13); twBark('caotan',"Crossfire! Omar, flank him!",true);
  for(let r=0;r<(ph>=3?2:1);r++){ const P=Player, a=Math.atan2(P.z-C.z,P.x-C.x), cx=P.x, cz=P.z, w1=ph>=3?.32:.38; C.push=.3; Sound.sfx('ting');
    for(const k of [-.62,.62]) twBlue(cx,cz,a+k,{warn:w1}); yield w1+.12;
    O.cast=.6; for(const s of [-1,1]){ const hx=O.x+s*1.4, hz=O.z, P2=Player, y=groundY(hx,hz)+1.1, aa=Math.atan2(P2.z-hz,P2.x-hx), d=Math.max(3,Math.hypot(P2.x-hx,P2.z-hz)), off=.95*s, v=10*sp;
      twBolt(O,{kind:'scythe',x:hx,y,z:hz,vx:Math.cos(aa+off)*v,vz:Math.sin(aa+off)*v,curl:-2*off*v/(d*1.1),dmg:2,life:d*1.25/v+1,col:0x8a3aff}); Sound.sfx('swing'); }
    yield .55; if(ph>=2){ const P3=Player; C.push=.3; Sound.sfx('ting'); twBlue(P3.x,P3.z,a,{warn:ph>=3?.42:.5}); yield .7; } }
  yield .4; };
// SENPAI CAGE (Caotan's new laser pattern): walls in a #, a blue beam through your cell. Phase II+: Omar's hands chase you after. Phase III: a second cage.
DUO.cage=function*(C,O,ph){ const sp=twSp(C); yield* twGlint(C,3,.12); twBark('caotan',"Senpai Cage! You're not leaving until you LOVE me!",true);
  yield* twCage(C,sp); if(ph>=3){ twBark('caotan',"Encore cage!",true); yield* twCage(C,sp); }
  if(ph>=2){ twBark('omar',"The graveyard would like a word.",true); O.cast=.6; yield* twHandChase(O,sp); } yield .4; };
// GRAVEYARD VOLLEY: Omar throws a ring of scythes onto marked spots (they stay planted: +8/+10/+12). Caotan lobs goo in between.
DUO.volley=function*(C,O,ph){ const sp=twSp(O), n=[0,8,10,12][ph]; twBark('omar',"Graveyard Volley. Every blade I throw... stays. Like regret.",true); O.cast=1; O.scythe=0;
  const P=Player; for(let i=0;i<n;i++){ const a=i*6.283/n+rnd(-.2,.2), r=i===0?0:rnd(1.8,3.8), p=twClampXZ(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,1), m=twScytheMesh(false);
    twThrow({x:O.x,y:O.y+2.2,z:O.z,tx:p.x,tz:p.z,dur:.95/sp,h:4,mesh:m,spin:16,r:.95,col:0x8a3aff,trail:0x8a3aff,onLand(x,z,play){ Sound.sfx('hit'); FX.burst(x,groundY(x,z)+.3,z,14,0x8a3aff,4,.3);
      if(play&&twInR(x,z,.95,2)) twHitP(2,x,z,{ub:true}); twPlantDrop(x,z,0,true); }}); Sound.sfx('swing'); yield .11/sp;
    if(i===3||i===7){ C.fire=.25; for(const k of [-1,0,1]) twAimBolt(C,'goo',C.x+C.f*.3,C.y+.95,C.z,9.5*sp,k*.2,{col:0xffffff}); Sound.sfx('squelch'); } }
  yield 1.2; };
// SENTENCED TO SENPAI: the Death Sentence hovers over you; on every count Caotan fires a pink wall at you. At 0 it drops (one-shot): move.
DUO.sentenceSnipe=function*(C,O,ph){ const sp=twSp(C); twBark('omar',"Your sentence is death. Caotan will read it out.",true); Sound.sfx('gong');
  const S=TW.sentence={n:3,pulse:1}, hs=[twHoverScythe()]; if(ph>=3) hs.push(twHoverScythe());
  for(let n=3;n>=1;n--){ S.n=n; S.pulse=1; Sound.sfx('tick'); if(n===3) twBark('caotan',"Ahem. Count one: you're cute.",true); if(n===2) twBark('caotan',"Count two: you're DEAD.",true);
    yield .25/sp; const P=Player; C.push=.3; C.glintT=.3; Sound.sfx('ting'); twPink(C.x,C.z,Math.atan2(P.z+P.vz*.15-C.z,P.x+P.vx*.15-C.x),{warn:.55/sp}); yield .7/sp; }
  S.n=0; Sound.sfx('gong'); hs[0].drop(); if(hs[1]){ yield .6; hs[1].drop(); twBark('omar',"Objection overruled.",true); } yield .9; TW.sentence=null; };
// HIKARI REFRACTION (phase II+): Caotan throws Hikari-chan out and fires a pink beam into her. She splits it into a blue fan (jump),
// then spins two blue beams. Omar blinks behind her and Getsugas her straight at you (jump her or dash through her).
DUO.prism=function*(C,O,ph){ const sp=twSp(C), P=Player; twBark('caotan',"Hikari-chan! Prism formation! ♡",true);
  const a0=Math.atan2(P.z-C.z,P.x-C.x)+rnd(-.9,.9), dd=clamp(Math.hypot(P.x-C.x,P.z-C.z)*.55,3,6), hp=twClampXZ(C.x+Math.cos(a0)*dd,C.z+Math.sin(a0)*dd,2), H=twHikari(C.x,C.z,1.15); let landed=false;
  twHz({upd(dt){ this.t+=dt; const u=Math.min(1,this.t/.6); H.x=lerp(C.x,hp.x,u); H.z=lerp(C.z,hp.z,u); H.y=groundY(H.x,H.z)+1.5+Math.sin(u*Math.PI)*3; H.spin+=dt*12*(1-u); H.put(); if(u>=1&&!landed){ landed=true; Sound.sfx('crash'); H.spin=0; } return !H.gone&&!H.free; }, kill(){ H.kill(); }});
  yield .7; C.push=.4; C.glintT=.5; Sound.sfx('ting'); const ha=Math.atan2(H.z-C.z,H.x-C.x); twBeam({x:C.x,z:C.z,ang:ha,len:Math.hypot(H.x-C.x,H.z-C.z),w:1,warn:.45/sp,dur:.5,dmg:3,col:0xff9ad8,jump:false}); yield .45/sp;
  twHikariBurst(H.x,H.y,H.z); const P2=Player, b0=Math.atan2(P2.z-H.z,P2.x-H.x); for(const k of [-.64,-.32,0,.32,.64]) twBeam({x:H.x,z:H.z,ang:b0+k,len:20,w:1.1,warn:.55/sp,dur:.2,dmg:3,col:0x9fd8ff,jump:true,y:.45});
  yield .55/sp+.35; if(ph>=3){ const P3=Player, b1=Math.atan2(P3.z-H.z,P3.x-H.x); for(const k of [-.48,-.16,.16,.48]) twBeam({x:H.x,z:H.z,ang:b1+k,len:20,w:1.1,warn:.5/sp,dur:.2,dmg:3,col:0x9fd8ff,jump:true,y:.45}); yield .5/sp+.3; }
  const dir=Math.random()<.5?1:-1, s0=rnd(0,6.28), spin=1.5*sp; twBark('caotan',"Spin, Hikari-chan!",true); for(let k=0;k<2;k++) twBeam({x:H.x,z:H.z,ang:t=>s0+k*Math.PI+Math.max(0,t-.6)*spin*dir,len:16,w:1,warn:.6,dur:2,dmg:3,col:0xbfe4ff});
  twHz({upd(dt){ this.t+=dt; if(H.free) return false; H.spin+=dt*spin*dir; H.put(); return this.t<2.6; }}); yield 2.65;
  // Omar's follow-through: a Getsuga straight through her, toward you
  const P4=Player, ga=Math.atan2(P4.z-H.z,P4.x-H.x), bx=H.x-Math.cos(ga)*1.4, bz=H.z-Math.sin(ga)*1.4; FX.burst(O.x,O.y+1.4,O.z,22,0x140a1a,4,.45,false); twBlink(O,bx,bz); O.scythe=1; O.lockF=1; O.f=Math.cos(ga)>0?1:-1;
  twBark('omar',"Fly, pillow. Be free.",true); FX.line(H.x,H.z,ga,18,2,0xff6ab0,.5); yield .5; O.swing=1; Sound.sfx('swing'); Sound.sfx('beam'); FX.arc(O.x,groundY(O.x,O.z),O.z,ga,0,true); H.free=1;
  const s={x:H.x,z:H.z,t:0,hit:false}; twHz({upd(dt,play){ if(!play) return true; s.t+=dt; s.x+=Math.cos(ga)*17*dt; s.z+=Math.sin(ga)*17*dt; const gy=groundY(s.x,s.z); H.x=s.x; H.z=s.z; H.y=gy+1.5; H.spin+=dt*20; H.put(); FX.spawn(s.x,gy+1.4,s.z,0,.5,0,.35,0xffd0ec,.3,0,true);
      const Pp=Player; if(!s.hit&&Math.hypot(Pp.x-s.x,Pp.z-s.z)<1.15&&Pp.y<gy+.9){ if(twHitP(3,s.x,s.z)!=='none') s.hit=true; } const A=twBounds(); return s.t<1.6&&s.x>A.x0-1&&s.x<A.x1+1&&s.z>A.z0-1&&s.z<A.z1+1; }, kill(){ H.kill(); }});
  if(ph>=2) twBark('caotan',"HIKARI-CHAAAN!",true); yield .9; O.scythe=0; O.lockF=0; O.swing=0; yield .3; };
// EVENT HORIZON GLOMP (phase II+): Omar opens a black hole behind you; Caotan glomps you from the far side, toward it.
// Parry him and he flies into the hole (it chokes on him and closes: both stunned). Dash against the pull between glomps.
DUO.horizon=function*(C,O,ph){ const sp=twSp(C), P=Player, K={n:3,par:0}; twBark('omar',"Collapse. Brother, deliver him.",true);
  let c=null; const A=twBounds(); for(let k=0;k<16&&!c;k++){ const a=(P.ang||0)+Math.PI+(k%2?1:-1)*Math.ceil(k/2)*Math.PI/8, x=P.x+Math.cos(a)*7.5, z=P.z+Math.sin(a)*7.5; if(x>A.x0+1.5&&x<A.x1-1.5&&z>A.z0+1.5&&z<A.z1-1.5) c={x,z}; }
  c=c||twClampXZ(P.x+4,P.z,1.5); O.cast=2; O.scythe=1; twBig('DASH!',{size:56,col:'#c08aff',y:UH*.26,dur:1.1,sub:'Keep out of the hole. Parry Caotan to feed HIM to it.'}); Sound.sfx('void');
  const hole=twMiniHole(c.x,c.z,{r:1.2,pull:ph>=3?8.6:7.6,range:16,dur:14,eat:1.1,dmg:6,disk:1,h:1.3}); TW.duoHole=hole;
  try{
    yield .8; for(let i=0;i<3;i++){ const r=yield* twDuoGlomp(C,sp,[0,.62,.55,.48][ph],K); if(r==='grab') return;
      if(C.parried){ // he flies into the hole
        Sound.sfx('chomp'); Sound.sfx('crossboom'); shake(.8); FX.flash=.5; grade.uniforms.flashCol.value.set(.7,.3,1); twBlink(C,c.x,c.z); C.stun=Math.max(C.stun,2.6); C.state='stun'; O.stun=Math.max(O.stun,2.6); O.state='stun';
        twBark('caotan',"OMAR! YOUR HOLE IS EATING ME!",true); Game.dmgNums.push({x:c.x,y:4,z:c.z,n:'FED TO THE VOID',t:0,big:true,col:'#ffd45a'}); twHurt(C,6,'bolt'); FX.burst(c.x,groundY(c.x,c.z)+1.4,c.z,60,0xffffff,8,.5,true); twHeartBurst(c.x,c.z,30);
        hole.t=99; hole.upd=()=>false; yield .8; twBark('omar',"It spat you out. Even the void has standards.",true); return; }
      yield .45; }
  } finally { if(TW.duoHole===hole){ hole.upd=()=>false; TW.duoHole=null; } O.cast=0; O.scythe=0; }
  yield .3; };
// GETSUGA × DOUBLE TAKE (phase II+): three Getsugas fanned at you (sidestep or dash through), then Caotan's blue X
DUO.getsugaLaser=function*(C,O,ph){ const sp=twSp(O); twBark('omar',"Getsuga... Tenshou. The edgy version. It has a hood.",true); O.scythe=1; O.cast=.5;
  for(const off of ph>=3?[0,.45,-.45,0]:[0,.42,-.42]){ const P=Player, a=Math.atan2(P.z-O.z,P.x-O.x)+off; O.lockF=1; O.f=Math.cos(a)>0?1:-1; O.swing=0; twGetsuga(O,a,{warn:.55/sp,sp:14*sp}); yield .5/sp; }
  O.lockF=0; yield .3; yield* twGlint(C,2,.12); twBark('caotan',"Double take!",true); const P=Player, a=Math.atan2(P.z-C.z,P.x-C.x); for(const k of [-.62,.62]) twBlue(P.x,P.z,a+k,{warn:.4}); yield .6;
  const P2=Player; twBlue(P2.x,P2.z,a,{warn:.45}); yield .8; O.scythe=0; O.swing=0; };
// GLINT RICOCHET (phase II+): a pink beam at you that bounces off the wall as a blue one; Omar's scythes (and his red rally scythe) at the same time
DUO.ricochet=function*(C,O,ph){ const sp=twSp(C); twBark('caotan',"Glint Ricochet! I did the geometry homework!",true); twDuoAlso(O,TWK.omar.scythes(O,ph));
  for(let r=0;r<3;r++){ yield* twGlint(C,1,.05); const P=Player, a=Math.atan2(P.z+P.vz*.2-C.z,P.x+P.vx*.2-C.x), ux=Math.cos(a), uz=Math.sin(a), w=twRayWall(C.x,C.z,ux,uz), len=Math.max(4,w.t);
    twBeam({x:C.x,z:C.z,ang:a,len,w:1.05,warn:.55/sp,dur:.22,dmg:3,col:0xffa0d8,jump:false});
    const hx=C.x+ux*len, hz=C.z+uz*len, ra=w.ax==='x'?Math.atan2(uz,-ux):Math.atan2(-uz,ux); twBeam({x:hx,z:hz,ang:ra,len:twRayWall(hx,hz,Math.cos(ra),Math.sin(ra)).t,w:1.2,warn:.75/sp,dur:.2,dmg:3,col:0x9fd8ff,jump:true,y:.45});
    yield .95/sp; }
  yield .4; };
// HIKARI GETSUGA (phase III): Omar Getsugas Hikari-chan off the walls; she bounces three times (each new line flashes first). Jump her or dash through.
DUO.hikariGetsuga=function*(C,O,ph){ const sp=twSp(C), P=Player; twBark('caotan',"Omar! The forbidden serve!",true); O.scythe=1;
  const H=twHikari(C.x,C.z,1.3); let u=0; while(u<.7){ u+=.05; H.x=lerp(C.x,O.x,u/.7); H.z=lerp(C.z,O.z,u/.7); H.y=groundY(H.x,H.z)+1.6+Math.sin(u/.7*Math.PI)*4; H.spin+=.6; H.put(); yield .05; }
  twBark('omar',"Hikari-chan. Getsuga... SERVE.",true); let a=Math.atan2(P.z-O.z,P.x-O.x); O.lockF=1; O.f=Math.cos(a)>0?1:-1; FX.line(O.x,O.z,a,20,2.4,0xff6ab0,.55); yield .55; O.swing=1; Sound.sfx('beam'); Sound.sfx('swing'); FX.arc(O.x,groundY(O.x,O.z),O.z,a,0,true);
  const s={x:O.x,z:O.z,a,t:0,b:0,hit:0,v:17*sp,stop:0,warn:0}; const A=twLock();
  twHz({upd(dt,play){ if(!play) return true; s.t+=dt; if(s.stop>0){ s.stop-=dt; H.spin+=dt*6; H.put(); return true; } s.x+=Math.cos(s.a)*s.v*dt; s.z+=Math.sin(s.a)*s.v*dt; const gy=groundY(s.x,s.z);
      let bounced=false; if(s.x<A.x0+1||s.x>A.x1-1){ s.a=Math.atan2(Math.sin(s.a),-Math.cos(s.a)); bounced=true; } if(s.z<A.z0+1||s.z>A.z1-1){ s.a=Math.atan2(-Math.sin(s.a),Math.cos(s.a)); bounced=true; } s.x=clamp(s.x,A.x0+1,A.x1-1); s.z=clamp(s.z,A.z0+1,A.z1-1);
      if(bounced){ s.b++; Sound.sfx('crash'); shake(.3); twHeartBurst(s.x,s.z,10); if(s.b<3){ FX.line(s.x,s.z,s.a,24,2.4,0xff6ab0,.45); s.stop=.45; } }
      H.x=s.x; H.z=s.z; H.y=gy+1.6; H.spin+=dt*22; H.put(); FX.spawn(s.x,gy+1.4,s.z,0,.5,0,.35,0xffd0ec,.3,0,true);
      const Pp=Player; if(s.hit<=0&&Math.hypot(Pp.x-s.x,Pp.z-s.z)<1.25&&Pp.y<gy+.95){ if(twHitP(3,s.x,s.z)!=='none') s.hit=.8; } if(s.hit>0) s.hit-=dt;
      return s.b<3; }, kill(){ H.kill(); }});
  twBark('caotan',"HIKARI-CHAAAAAN!",true); let w=0; while(w<7&&!H.gone){ yield .1; w+=.1; } O.lockF=0; O.scythe=0; O.swing=0; twBark('caotan',"She's okay! She's memory foam!",true); yield .4; };
// THE TEAR (phase III): Omar opens the sky rift and his six scars; Caotan snipes in the meantime
DUO.tearRift=function*(C,O,ph){ if(TW.tear){ yield* DUO.cage(C,O,ph); return; } twDuoAlso(O,TWK.omar.tear(O,3)); yield 1.2;
  twBark('caotan',"While he rips the sky, I'll rip your HEART!",true); yield* TWK.caotan.glint1(C,3); yield .5; yield* TWK.caotan.glint2(C,2); };
