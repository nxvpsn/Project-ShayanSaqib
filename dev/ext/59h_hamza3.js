// =====================================================================
// BIG BACK HAMZA, ROUND 3 (on top of 50/59): a fight about jumps, slams, rushes and babies
// - kept: the jumping stomps (Bismillah Bounce, Flop) and the Food Coma Frenzy at the end
// - new: Stampede (rushes that drop babies), Quake (center slam, cake debris), Meteor (sky flops that track you),
//   Baby Rain, Belly Slide; Pork Roll stays. The rest (snot, pee, wind, bacon, inhale, vacuum, lane piglets) is retired.
// - his babies are real mobs (type 'piglet'): they chase and bite; every one you swing at goes down. Leave one alive
//   for nine seconds and it waddles back to him to be eaten (+4% HP and a burp).
// - telegraphs are shadows, craters and frosting splats instead of plain circles
// - limit cut (phase II, 50%), BIG BACK BUFFET: six meteor flops on you (each lands a baby), a baby stampede you must
//   clear before snack time while he belly-slides, then a belly quake into cake debris. All of it around you, on camera.
// =====================================================================
HZG_POOL[1]=['bounce','flop','stampede','babies','quake','roll'];
HZG_POOL[2]=['bounce','flop','stampede','babies','quake','roll','meteor','babyRain','belly'];
for(const k of [1,2]) HZG_HP[k]=[0,170,210][k];

// ---------- the babies ----------
function hzgBaby(x,z,o){ o=o||{}; const m=makeMob('hound',x,z); m.type='piglet'; m.hp=m.maxHp=o.hp||3; m.state=o.drop?'drop':'chase'; m.st=0; m.cd=rnd(.6,1.2); m.age=0; m.snack=o.snack||9;
  if(o.drop){ m.y=groundY(x,z)+(o.h||7); m.vy=-1; } if(o.vx!=null){ m.vx=o.vx; m.vz=o.vz; m.vy=o.vy||6; m.onGround=false; } MOBS.push(m); return m; }
function hzgBabies(){ return MOBS.filter(m=>m.type==='piglet'&&m.hp>0); }
function hzgClearBabies(){ for(const m of MOBS) if(m.type==='piglet'&&m.hp>0){ m.hp=0; try{ m.spr.dispose(); }catch(e){} } MOBS=MOBS.filter(m=>m.hp>0); }
function hzgSnack(m){ const G=TW.giant; m.hp=0; try{ m.spr.dispose(); }catch(e){} if(!G) return; G.hp=Math.min(G.maxHp,G.hp+G.maxHp*.04); G.mouth=1; Sound.sfx('chomp');
  FX.burst(G.x,G.y+2.4,G.z,24,0xffb0c8,4,.35); Game.dmgNums.push({x:G.x,y:G.y+4.8,z:G.z,n:'SNACK +4%',t:0,big:true,col:'#ff8ab0'}); twWave(G.x,G.z,{col:0xffb0c8,sp:9,max:11,r0:2.4});
  if(Math.random()<.5) twBark('hamza',["*BURP* ...sorry, son.","Daddy's... hungry. Bismillah.","You were a good boy. A crunchy boy."][Math.floor(Math.random()*3)],true); setTimeout(()=>{ if(TW.giant) TW.giant.mouth=0; },400); }
(function(){ const um=updateMob; updateMob=function(m,dt){ if(m.type!=='piglet') return um.apply(this,arguments);
    const P=Player, G=TW.giant; m.t+=dt; m.flash=Math.max(0,m.flash-dt); m.st+=dt; m.cd-=dt; const play=Game.state==='play'; if(play) m.age+=dt;
    const dx=P.x-m.x, dz=P.z-m.z, dist=Math.hypot(dx,dz)||1;
    if(!play){ m.vx*=.8; m.vz*=.8; }
    else if(m.state==='drop'){ if(m.onGround){ m.state='chase'; m.st=0; FX.burst(m.x,m.y+.3,m.z,10,0xffb0c8,3,.25); Sound.sfx('oink'); } }
    else if(m.state==='stun'){ if(m.st>.35){ m.state='chase'; m.st=0; } }
    else if(m.state==='snack'){ if(!G){ m.state='chase'; } else { const gx=G.x-m.x, gz=G.z-m.z, d=Math.hypot(gx,gz)||1; m.vx=gx/d*4.2; m.vz=gz/d*4.2; m.ang=Math.atan2(gz,gx); if(d<2.6) hzgSnack(m); } }
    else { if(m.age>m.snack&&G&&!G.inv&&G.hp>0){ m.state='snack'; m.st=0; Game.dmgNums.push({x:m.x,y:m.y+1.6,z:m.z,n:'SNACK TIME',t:0,col:'#ffb0c8'}); }
      else if(m.state==='chase'){ const wob=Math.sin(m.t*6+m.hx)*.6; m.vx=dx/dist*3.4-dz/dist*wob; m.vz=dz/dist*3.4+dx/dist*wob; m.ang=Math.atan2(dz,dx); if(dist<1.9&&m.cd<=0){ m.state='tell'; m.st=0; m.vx=m.vz=0; m.la=m.ang; } }
      else if(m.state==='tell'){ m.vx=m.vz=0; if(m.st>.35){ m.state='lunge'; m.st=0; m.vx=Math.cos(m.la)*7.5; m.vz=Math.sin(m.la)*7.5; m.vy=3.2; m.onGround=false; Sound.sfx('oink'); } }
      else if(m.state==='lunge'){ if(m.st<.3&&Math.hypot(P.x-m.x,P.z-m.z)<.85&&Math.abs(P.y-m.y)<1.2){ const r=playerHit(1,m.x,m.z,{melee:true,onParry:()=>{ m.state='stun'; m.st=-.6; m.flash=.4; m.vx=-m.vx*.5; m.vz=-m.vz*.5; }}); if(r!=='none') m.st=Math.max(m.st,.3); }
        if(m.st>.35){ m.state='recover'; m.st=0; } }
      else if(m.state==='recover'){ m.vx*=.85; m.vz*=.85; if(m.st>.45){ m.state='chase'; m.st=0; m.cd=rnd(.7,1.3); } } }
    if(Math.cos(m.ang)>.2) m.f=1; else if(Math.cos(m.ang)<-.2) m.f=-1;
    m.vy-=G_ACC*dt; moveBody(m,dt,.3); { const c=twClampXZ(m.x,m.z,.6); m.x=c.x; m.z=c.z; }
    m.anim=m.state==='tell'?'tell':m.state==='lunge'?'lunge':Math.hypot(m.vx,m.vz)>.3?'run':'idle'; if(m.y<-8) m.hp=0; }; })();
// the piglet baby sprite (drawn by the mob loop through drawHoundHD)
function drawPigletBaby(c,cx,by,f,s){ const p=SH(c,cx,by,f), t=s.t||0, fl=s.flash>0, a=s.anim||'idle', hop=a==='run'?Math.round(Math.abs(Math.sin(t*14))*2):a==='lunge'?3:0, sq=a==='tell'?1:0;
  const PK=fl?'#fff':'#f4a6c0', PD=fl?'#fff':'#d8809e', PH=fl?'#fff':'#ffd0e0', y=-hop+sq;
  const lg=a==='run'?Math.round(Math.sin(t*14)*1.5):0; p(-6,-4+y,2,4-(lg>0?1:0),PD); p(-2,-4+y,2,4,PD); p(2,-4+y,2,4-(lg<0?1:0),PD); p(5,-4+y,2,4,PD); p(-6,-1+y,2,1,'#8a4a5a'); p(5,-1+y,2,1,'#8a4a5a');
  ell(c,cx,by-9+y,9,6,PD); ell(c,cx-1*f,by-10+y,8,5,PK); ell(c,cx-3*f,by-12+y,4,2,PH);
  ell(c,cx+8*f,by-11+y,5,5,PK); ell(c,cx+12*f,by-10+y,2.5,2,PD); p(12,-11+y,1,1,'#7a3a4a'); p(13,-9+y,1,1,'#7a3a4a');
  if(a==='tell'||a==='lunge'){ p(7,-13+y,3,1,'#1a1018'); p(7,-7+y,4,2,'#3a0a14'); p(8,-7+y,1,1,'#ffffff'); } else { p(7,-14+y,2,2,'#1a1018'); p(7,-14+y,1,1,'#ffffff'); }
  p(5,-17+y,3,3,PD); p(9,-17+y,2,3,PK); p(-10,-11+y+Math.round(Math.sin(t*10)),2,1,PD); p(-11,-12+y+Math.round(Math.sin(t*10)),1,2,PD);
  p(-2,-6+y,6,2,'#ffffff'); p(0,-5+y,2,1,'#ff8ab0'); // the bib
  c.fillStyle='#ffe680'; for(let i=0;i<10;i++){ const aa=i/10*6.283; c.fillRect(Math.round(cx+7*f+Math.cos(aa)*3),Math.round(by-20+y+Math.sin(aa)),1,1); } }
(function(){ const dh=drawHoundHD; drawHoundHD=function(c,cx,by,f,s,arch){ if(arch==='piglet') return drawPigletBaby(c,cx,by,f,s); return dh.apply(this,arguments); }; })();

// ---------- landing, leaping, shadows ----------
function hzgLand(G,r,dmg,rings){ const gy=groundY(G.x,G.z); Sound.sfx('slam'); Sound.sfx('crash'); shake(r>3?1.1:.7); FX.burst(G.x,gy+.4,G.z,50,0xd8c0c8,8,.45,false); FX.ring(G.x,gy,G.z,'#ffb0c8',r*1.6,.5);
  for(let i=0;i<16;i++){ const a=i/16*6.283; FX.spawn(G.x+Math.cos(a)*r,gy+.3,G.z+Math.sin(a)*r,Math.cos(a)*5,rnd(2,5),Math.sin(a)*5,.6,i%2?0xffb0c8:0x8a6a44,.35,12,false); }
  if(twInR(G.x,G.z,r,99)) twHitP(dmg,G.x,G.z,{ub:true}); for(let k=0;k<(rings||0);k++) twWave(G.x,G.z,{col:0xffb0c8,sp:8+k,max:13,delay:k*.45,r0:r}); }
function hzgDecalFade(d){ const k={t:0}; Game.fxUpd.push(dt=>{ k.t+=dt; d.material.opacity=Math.max(0,.8-k.t); if(k.t>.8){ scene.remove(d); d.geometry.dispose(); d.material.dispose(); return false; } return true; }); }
// a leap with a crater shadow; with track, the target follows Shayan until 65% of the way, then locks
function* hzgLeap(G,tx,tz,up,h,r,dmg,rings,track){ const sx=G.x, sz=G.z; let p=twClampXZ(tx,tz,2.2); const d=twDecal(p.x,p.z,r,'crater'), fe=twFence(p.x,p.z,r,0xffb050,up+.1); G.mouth=.6; Sound.sfx('pigroar');
  for(let t=0;t<up;t+=1/60){ const u=t/up; if(track&&u<.45){ const P=Player; p=twClampXZ(lerp(p.x,P.x+P.vx*.1,.07),lerp(p.z,P.z+P.vz*.1,.07),2.2); } /* a loose lock: it drifts after you for under half the leap, then it's committed */
    G.x=lerp(sx,p.x,twEIO(u)); G.z=lerp(sz,p.z,twEIO(u)); G.air=Math.sin(u*Math.PI)*h; d.position.set(p.x,groundY(p.x,p.z)+.05,p.z); d.scale.setScalar(Math.max(.01,r*(.4+.6*u))); d.material.opacity=.5+.4*u; fe.move(p.x,p.z); yield 1/60; }
  fe.kill(); G.x=p.x; G.z=p.z; G.air=0; hzgLand(G,r,dmg,rings); hzgDecalFade(d); G.mouth=0; }
const hzgSp2=G=>G.phase>=2?1.15:1;

// ---------- the moves ----------
HZG.bounce=function*(G,ph){ const sp=hzgSp2(G); twBark('hamza',"Bismillah... BOUNCE! Bismillah... BOUNCE!",true);
  for(let k=0;k<(ph>=2?4:3);k++){ const P=Player, last=k===(ph>=2?3:2); yield* hzgLeap(G,P.x+P.vx*.4,P.z+P.vz*.4,(k?.75:.95)/sp,last?7:4.5,2.6,3,last?2:0,true); yield .18; }
  yield .6; };
HZG.flop=function*(G,ph){ twBark('hamza',ph>=2?"DOUBLE FLOP. Bismillah.":"Belly flop! Oink!",true);
  for(let k=0;k<(ph>=2?2:1);k++){ const P=Player; yield* hzgLeap(G,P.x+P.vx*.4,P.z+P.vz*.4,1,7,3,3,ph>=2?2:1,true); yield .55; } };
HZG.stampede=function*(G,ph){ const sp=hzgSp2(G), n=ph>=2?4:3; twBark('hamza',"STAMPEDE! Children, hold on to Daddy!",true);
  for(let k=0;k<n;k++){ const P=Player, a=Math.atan2(P.z-G.z,P.x-G.x), d=Math.min(18,Math.hypot(P.x-G.x,P.z-G.z)+4); FX.line(G.x,G.z,a,d,3.4,0xff3a5a,.6/sp); G.mouth=1; Sound.sfx('pigrumble'); const from=Game.time+TW_STRICT.grace; yield .6/sp; /* strict, like every rush */
    Sound.sfx('dash'); Sound.sfx('pigroar'); const s={t:0,hit:false,dur:d/(20*sp),drop:ph>=2||k===1};
    twHz({upd(dt,play){ if(!play) return true; s.t+=dt; G.x+=Math.cos(a)*20*sp*dt; G.z+=Math.sin(a)*20*sp*dt; const c=twClampXZ(G.x,G.z,2); G.x=c.x; G.z=c.z; if(!s.hit) twRushTell(G,a,1.6); FX.spawn(G.x+rnd(-1,1),groundY(G.x,G.z)+.3,G.z+rnd(-1,1),rnd(-2,2),rnd(1,3),rnd(-2,2),.5,0xd8c0c8,.4,8,false);
      const P2=Player; if(!s.hit&&Math.hypot(P2.x-G.x,P2.z-G.z)<2.3&&P2.y<G.y+2){ if(twStrictDo(from,()=>twHitP(3,G.x,G.z,{heavy:true,melee:true,win:TW_DASH_WIN,onParry:()=>{ G.stun=Math.max(G.stun,1.4); Game.dmgNums.push({x:G.x,y:G.y+4,z:G.z,n:'STAGGERED',t:0,col:'#ffd45a'}); }}))!=='none') s.hit=true; }
      if(s.drop&&s.t>s.dur*.5){ s.drop=false; hzgBaby(G.x,G.z,{vx:-Math.cos(a)*3+rnd(-2,2),vz:-Math.sin(a)*3+rnd(-2,2),vy:6}); Sound.sfx('oink'); } return s.t<s.dur; }});
    yield d/(20*sp)+.25; G.mouth=0; shake(.4); }
  yield .5; };
HZG.babies=function*(G,ph){ const n=ph>=2?5:3; twBark('hamza',"Go, my children! My beautiful piglet children! Bite the blacksmith!",true); G.mouth=1; Sound.sfx('oink');
  for(let i=0;i<n;i++){ const P=Player, a=rnd(0,6.28), r=rnd(2.5,4.5), p=twClampXZ(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,1), d=Math.hypot(p.x-G.x,p.z-G.z)||1, T=.8;
    hzgBaby(G.x,G.z,{vx:(p.x-G.x)/T,vz:(p.z-G.z)/T,vy:G_ACC*T/2}); FX.burst(G.x,G.y+3,G.z,10,0xffb0c8,3,.3); yield .22; }
  G.mouth=0; twBig(n+' BABIES',{size:48,col:'#ffb0c8',y:UH*.26,dur:1.1,sub:'Take them out before they get back to Daddy'}); yield 1; };
HZG.quake=function*(G,ph){ const F=TW.fight, c=G.center||twCenter(); twBark('hamza',"Bismillah... BIG BACK QUAKE!",true);
  yield* hzgLeap(G,c.x,c.z,1.2,10,3.6,3,ph>=2?3:2,false); FX.flash=.3; grade.uniforms.flashCol.value.set(1,.7,.8);
  for(let i=0;i<(ph>=2?10:7);i++){ const P=Player, a=rnd(0,6.28), r=i===0?0:rnd(1.4,4.5), p=twClampXZ(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,.8); twBlast(p.x,p.z,1.15,.9,{skin:'frosting',col:0xff8ab0,ring:'#ffc0d8',dmg:2,quiet:i>0,sfx:'crash',n:12}); yield .12; }
  yield 1; };
HZG.meteor=function*(G,ph){ twBark('hamza',"Bismillah! I'm a METEOR! A BIG BACK METEOR!",true);
  for(let k=0;k<3;k++){ const P=Player; yield* hzgLeap(G,P.x,P.z,1.4,14,2.8,3,1,true); hzgBaby(G.x,G.z,{vx:rnd(-4,4),vz:rnd(-4,4),vy:7}); yield .3; } };
HZG.babyRain=function*(G,ph){ twBark('hamza',"It's raining... my children! Catch them! Or don't! They bite!",true); G.mouth=1;
  for(let i=0;i<6;i++){ const P=Player, a=rnd(0,6.28), r=rnd(1.5,4.5), p=twClampXZ(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,1);
    twBlast(p.x,p.z,1,.85,{skin:'frosting',col:0xff8ab0,ring:'#ffc0d8',dmg:2,quiet:i>0,sfx:'crash',n:10,onBoom(x,z){ const b=hzgBaby(x,z,{}); b.state='chase'; Sound.sfx('oink'); }}); yield .25; }
  G.mouth=0; yield 1.2; };
HZG.belly=function*(G,ph){ const sp=hzgSp2(G), A=twBounds(), P=Player; twBark('hamza',"BELLY SLIDE! Wheee! Bismillah!",true);
  const lane=Math.random()<.5?0:Math.PI/2, sx=lane===0?(G.x<(A.x0+A.x1)/2?A.x0+2.4:A.x1-2.4):P.x, sz=lane===0?P.z:(G.z<(A.z0+A.z1)/2?A.z0+2.4:A.z1-2.4), dir=lane===0?(sx<(A.x0+A.x1)/2?1:-1):(sz<(A.z0+A.z1)/2?1:-1);
  const a=lane+(dir<0?Math.PI:0), L0=lane===0?A.x1-A.x0-4.8:A.z1-A.z0-4.8; FX.burst(G.x,G.y+2,G.z,30,0xffb0c8,5,.4); G.x=sx; G.z=sz; FX.line(sx,sz,a,L0,4.4,0xff6a9a,.9/sp); Sound.sfx('pigrumble'); yield .9/sp;
  const s={t:0,hit:false,dur:L0/(22*sp),nz:0}; Sound.sfx('dash');
  twHz({upd(dt,play){ if(!play) return true; s.t+=dt; G.x+=Math.cos(a)*22*sp*dt; G.z+=Math.sin(a)*22*sp*dt; const c=twClampXZ(G.x,G.z,2); G.x=c.x; G.z=c.z; s.nz-=dt;
      if(s.nz<=0){ s.nz=.18; twZone(G.x,G.z,1.2,3,{slow:.45,col:0xff8ab0,op:.5,fx:.08,fxCol:0xffc0d8}); }
      const P2=Player; if(!s.hit&&Math.hypot(P2.x-G.x,P2.z-G.z)<2.4&&P2.y<G.y+1.6){ if(twHitP(3,G.x,G.z,{ub:true})!=='none') s.hit=true; } return s.t<s.dur; }});
  yield s.dur+.3; hzgLand(G,2.6,0,ph>=2?1:0); yield .5; };

// ---------- LIMIT CUT: BIG BACK BUFFET, all you can eat ----------
hzgBuffet=function*(G){ const c=G.center||twCenter(), P=Player, gy=groundY(c.x,c.z); G.inv=true; G.mouth=0; G.mv=null;
  const C=hzgAlly('caotan'), O=hzgAlly('omar'), cleanup=()=>{ Game.letterTo=0; G.mouth=0; G.air=0; TW.hg=null; P.inv=Math.min(P.inv,1); twCamFree(1.32); for(const A of [C,O]) if(A){ A.hold=0; A.air=0; } };
  TW.lcCleanup=cleanup;
  try{
    // the cinematic: wide, then very wide
    Game.letterTo=.4; P.inv=Math.max(P.inv,5); for(const A of [C,O]) if(A){ A.hold=1; A.air=1.3; }
    yield* twGenCam([G.x+3,gy+2.4,G.z+15],[G.x,gy+3,G.z],.7); Sound.sfx('pigroar'); shake(.6); twBark('hamza',"Waiter! The buffet. All of it. And my children will eat whatever is left. Which is YOU.",true); yield 1.4;
    if(C) twBark('caotan',"...I'll be the waiter. For senpai.",true);
    yield* twGenCam([c.x,gy+13,c.z+20],[c.x,gy+1,c.z],1.2); twCutin('hamza','BIG BACK BUFFET','Limit Break  ·  all you can eat  ·  you are on the menu','#ff6a9a',1.8); yield 1.1;
    Game.letterTo=0; twCamFree(1.55); P.inv=1.2; for(const A of [C,O]) if(A){ A.hold=0; A.air=0; }
    // A) six meteor flops on you; every landing drops a baby
    twBark('hamza',"Course one: ME. From the SKY.",true);
    for(let k=0;k<6;k++){ const Pp=Player; yield* hzgLeap(G,Pp.x,Pp.z,k<3?1.3:1.05,14,2.9,3,k%2,true); hzgBaby(G.x,G.z,{vx:rnd(-4,4),vz:rnd(-4,4),vy:7}); yield .2; }
    // B) BABY BOOM: ten more charge in from the edges; clear them before snack time while he belly-slides
    twBark('hamza',"Course two: the CHILDREN'S MENU!",true); for(let i=0;i<10;i++){ const e=twEdgePt(10); hzgBaby(e.x,e.z,{drop:1,h:6,snack:12}); }
    const H=TW.hg={left:12,total:12,label:'BABY BOOM · KILL THEM BEFORE SNACK TIME'}; let nb=2.2;
    while(H.left>0&&hzgBabies().length){ yield .05; H.left=Math.max(0,H.left-.05); nb-=.05; if(nb<=0){ nb=4; yield* HZG.belly(G,2); } }
    TW.hg=null; const left=hzgBabies().length; if(left) twBig('SNACK TIME',{size:56,col:'#ff8ab0',y:UH*.26,dur:1.2,sub:left+' left alive: Daddy eats them'}); else twBig('ALL BABIES DOWN',{size:52,col:'#ffd45a',y:UH*.26,dur:1.2,sub:'No snack for Daddy'});
    for(const m of hzgBabies()) m.age=99; yield 2;
    // C) BELLY QUAKE: he leaps to the middle and the whole buffet comes down
    twBark('hamza',"Course three: DESSERT! Bismillah... BELLY QUAKE!",true); twCamFree(1.7);
    yield* hzgLeap(G,c.x,c.z,1.3,12,4,4,4,false); FX.flash=.5; grade.uniforms.flashCol.value.set(1,.7,.8); impactFrame([[2,2],[1,2]]);
    for(let i=0;i<18;i++){ const Pp=Player, a=rnd(0,6.28), r=i%3===0?0:rnd(1.5,6), p=twClampXZ(Pp.x+Math.cos(a)*r,Pp.z+Math.sin(a)*r,.8); twBlast(p.x,p.z,1.15,.85,{skin:'frosting',col:0xff8ab0,ring:'#ffc0d8',dmg:2,quiet:i%4>0,sfx:'crash',n:10}); yield .14; }
    yield 1.2;
  } finally { TW.lcCleanup=null; cleanup(); }
  twBig('FOOD COMA',{size:60,col:'#ffd45a',sub:'Hamza is stunned. Go!'}); G.inv=false; G.stun=5; yield 5; };

// ---------- the Frenzy at zero, with the new moves (he still goes completely crazy) ----------
hzgFrenzy=function*(G){ const P=Player, gy=groundY(G.x,G.z); G.inv=true; G.mouth=1; Game.letterTo=1;
  cineSet(G.x+3,gy+2.4,G.z+13,G.x,gy+3,G.z); for(let i=0;i<5;i++){ G.flash=i%2?.3:0; Sound.sfx('chomp'); yield wait(.12); }
  yield say('hamza',"Hamza is... still... HUNGRY!",'angry'); yield say('shayan',"He's at ZERO! How is he still eating?!",'surprised');
  yield say('omar',"Fifteen seconds. Even a stomach has limits."); evaCard(['FOOD COMA FRENZY','SURVIVE 15 SECONDS'],1.6,1); Sound.sfx('slam'); shake(1); yield wait(1.6);
  Cam.cine=null; Game.letterTo=0; Game.state='play'; Sound.play('diva'); P.inv=1; const H=TW.hg={left:15,total:15,label:'FOOD COMA · SURVIVE'};
  const plan=[[0,'bounce'],[2.8,'stampede'],[5.6,'babyRain'],[8.2,'meteor'],[11.6,'flop']], run2=[]; let k=0, sn=0;
  while(H.left>0){ yield wait(1/120); if(Game.state!=='play'||TW.giant!==G) continue; const dt=1/60; H.left=Math.max(0,H.left-dt); const el=15-H.left;
    while(k<plan.length&&el>=plan[k][0]){ run2.push({g:HZG[plan[k][1]](G,2),w:0}); k++; }
    sn-=dt; if(sn<=0&&el<13.5){ sn=1.4; const Pp=Player; for(let j=0;j<3;j++){ const a=rnd(0,6.28), r=rnd(1.5,4), p=twClampXZ(Pp.x+Math.cos(a)*r,Pp.z+Math.sin(a)*r,.8); twBlast(p.x,p.z,1,.8,{skin:'frosting',col:0xff8ab0,ring:'#ffc0d8',dmg:2,quiet:j>0,sfx:'crash',n:8}); } }
    for(const o of run2){ if(o.done) continue; o.w-=dt; let n=0; while(o.w<=0&&!o.done&&n++<40){ const r=o.g.next(); if(r.done) o.done=1; else o.w+=r.value; } } }
  TW.hg=null; twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); hzgClearBabies(); G.air=0; G.mouth=.4; Game.state='cut'; twBig('ZZZ',{size:80,col:'#ffd0ec',y:UH*.3,dur:1.4,sub:'He fell asleep mid-chew.'}); Sound.sfx('pigrumble'); yield wait(1.2); };

// ---------- the babies don't outlive a retry, the finale or the fight ----------
(function(){ const hs=hzgStart; hzgStart=function(){ const r=hs.apply(this,arguments); const gr=TW.giantRespawn; TW.giantRespawn=function(){ twLcCleanupRun(); hzgClearBabies(); return gr.apply(this,arguments); }; return r; };
  const hp2=hzgPhase2; hzgPhase2=function*(){ hzgClearBabies(); yield* hp2.apply(this,arguments); };
  const hf=hzgFinale; hzgFinale=function*(){ hzgClearBabies(); yield* hf.apply(this,arguments); };
  const ef=twEndFight; twEndFight=function(){ if(TW.giant) hzgClearBabies(); return ef.apply(this,arguments); }; })();
