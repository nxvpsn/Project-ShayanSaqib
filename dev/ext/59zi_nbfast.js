// =====================================================================
// NATHAN, PHASE II AT SPEED (v1.67): the machine never stands still and something is always in the air.
//   tempo     0.18s between moves (was 0.45), openings 35% shorter, missiles launch twice as fast and fly faster
//   escort    all phase long a funnel blinks in near you every 1.4s and burns a thin lane through where you are heading
//             (cyan, 0.65s warning: keep moving)
//   missiles  three waves (9, 9, 8: the last one red) while he boosts to a new side between waves
//   strafe    NEW: he circles you at speed; five red shots (parry each) with two missiles off his shoulders after each
//   mirage    NEW: he dashes to four points round you leaving a clone at each; the clones fire lanes at you one after
//             another, twice round; then the real one tackles
//   grid      four volleys with a shorter warning, missiles between them
//   buster    the beam sweeps at 1.5 rad/s with seven missiles launched while it burns
//   tackle    twice in a row, the second from a new angle, shorter wind-up
//   funnelgrab two dives, then a volley of five missiles from the side
// =====================================================================
NP_POOLS[2]=['missiles','strafe','mirage','grid','buster','tackle','strafe','funnelgrab','mirage','missiles','grab','combo'];
NP_FIRST[2]=['missiles','strafe','mirage','grid','buster'];
NPR.cd[2]=.18;
(function(){ const op=np1Open; np1Open=function(t){ const a=[].slice.call(arguments); try{ if(typeof npOn==='function'&&npOn()&&(NP1.ph||1)===2&&typeof a[0]==='number') a[0]*=.65; }catch(e){} return op.apply(this,a); }; })();
npVolley=function*(n,red){ const fast=(NP1.ph||1)>=2; for(let i=0;i<n;i++){ const sd=i%2?1:-1, [dx,dz]=np1Dir(); npMissile(NB.x-dz*sd*1.1,NB.y+3.1,NB.z+dx*sd*1.1,{red:red&&i===n-1,sp:fast?12.5:9}); Sound.sfx('mechshot'); FX.burst(NB.x-dz*sd*1.1,NB.y+3.1,NB.z+dx*sd*1.1,8,0xffd27a,4,.25); NB.flash=.08; yield fast?.055:.09; } };
// a still of him in cyan, standing where he was: it turns to face the camera and flickers
function npClone(x,z){ const y=NB.y, C={x,y,z,dead:0,t:0}; let m=null;
  try{ const src=(typeof nbhOn==='function'&&nbhOn())?NBH.cv:NBS.cv, cv=document.createElement('canvas'); cv.width=src.width; cv.height=src.height; cv.getContext('2d').drawImage(src,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false;
    m=new THREE.Mesh(NB.mesh.geometry,new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:.8,color:0x7fd8ff,depthWrite:false,side:THREE.DoubleSide,fog:false})); m.userData.temp=1; m.position.set(x,y,z); scene.add(m); }catch(e){ m=null; }
  FX.burst(x,y+2,z,16,0x3ff4ff,5,.3); np1Obj({bit:1,upd(dt){ if(C.dead) return false; C.t+=dt; if(m){ m.quaternion.copy(camera.quaternion); m.material.opacity=.55+.3*Math.sin(C.t*30); } return true; }, kill(){ C.dead=1; if(m){ scene.remove(m); try{ m.material.map.dispose(); }catch(e){} FX.burst(x,y+2,z,14,0x3ff4ff,5,.3); } }}); return C; }
// the escort: a funnel blinks in, marks a thin lane through where you are heading, burns it, goes
function npEscort(){ const P=Player, a=rnd(0,6.283), R=rnd(8,11), x=P.x+Math.cos(a)*R, z=P.z+Math.sin(a)*R, ang=Math.atan2(P.z+(P.vz||0)*.35-z,P.x+(P.vx||0)*.35-x), b=nbBit(x,groundY(x,z)+2.2,z); b.x=x; b.z=z; b.y=groundY(x,z)+2.2; const S={t:0};
  try{ b.m.position.set(b.x,b.y,b.z); b.m.lookAt(P.x,P.y+1,P.z); }catch(e){} Sound.tone('sine',1300,900,.08,.04);
  npLane(x,z,ang,20,1.05,.65,.2,{dmg:1}); np1Obj({bit:1,upd(dt){ S.t+=dt; if(b.gone) return false; return S.t<.95; }, kill(){ if(!b.gone){ b.gone=1; nbKillBit(b); } }}); }
(function(){ const nu=np1Update; np1Update=function(dt){ const r=nu.apply(this,arguments); try{ if(typeof npOn==='function'&&npOn()&&(NP1.ph||1)===2&&!NP1.done&&NB&&NB.alive&&!NB.inv&&!NB.stunned&&!(NP1.stunT>0)&&!NP1.seq&&!NP1.ex&&!Game.script&&Game.state==='play'){ NP1.escT=(NP1.escT==null?2.5:NP1.escT)-dt; if(NP1.escT<=0){ NP1.escT=NP1.cur==='lc'?2.2:1.4; npEscort(); } } }catch(e){ console.error('np escort',e); } return r; }; })();
NP1M.missiles=function*(){ NP1.cur='missiles'; twBark('nathan',"Missiles away. All of them. Cut fast.",true); np1Hint('miss','MISSILES: cut them out of the air with your sword. The RED one: parry it back into him');
  for(let w=0;w<3;w++){ const P=Player, [dx,dz]=np1Dir(), sd=w%2?1:-1; nbBoost(P.x-dx*10-dz*sd*7,P.z-dz*10+dx*sd*7); NB.hov=Math.max(NB.hov||1.4,3); yield .2; yield* npVolley(w===2?8:9,w===2); yield .2; }
  yield 1.5; np1Open(1); yield .2; };
NP1M.strafe=function*(){ NP1.cur='strafe'; twBark('nathan',"Strafing run. Try to keep up.",true); np1Hint('strafe','STRAFE: he circles you. Every RED shot: parry. The missiles after it: cut');
  const P=Player; let a=Math.atan2(NB.z-P.z,NB.x-P.x), dir=Math.random()<.5?1:-1, par=0; NB.hov=2.2;
  for(let i=0;i<5;i++){ const a1=a+dir*rnd(1,1.4); for(let t=0;t<.36;t+=NP1.dt){ const u=Math.min(1,(t+NP1.dt)/.36), aa=a+(a1-a)*u, P2=Player; np1Fly(NP1.dt,P2.x+Math.cos(aa)*9,P2.z+Math.sin(aa)*9,36); if(typeof NBS!=='undefined') NBS.boostT=Math.max(NBS.boostT,.1); yield NP1.dt; } a=a1;
    const res=yield* npBeatShot(1.5); if(res==='parry') par++; { const [dx,dz]=np1Dir(); for(const sd of [-1,1]) npMissile(NB.x-dz*sd*1.1,NB.y+3.1,NB.z+dx*sd*1.1,{sp:12.5}); Sound.sfx('mechshot'); }
    if(i===2) dir=-dir; }
  if(par>=5){ Game.dmgNums.push({x:NB.x,y:NB.y+4.4,z:NB.z,n:'EVERY SHOT PARRIED',t:0,big:true,col:'#ffd45a'}); np1Stun(2.2,'RUN BROKEN'); return; } np1Open(1); yield .2; };
function* npTackleOnce(wind){ const P=Player, ang=Math.atan2(P.z-NB.z,P.x-NB.x), ux=Math.cos(ang), uz=Math.sin(ang), sx=NB.x, sz=NB.z, L=24; FX.line(sx,sz,ang,L,2.2,0xff2a3a,wind+.2); np1Tell('rush'); Sound.sfx('charge'); yield wind;
  Sound.sfx('qbRoar'); Sound.sfx('whoosh'); if(typeof NBS!=='undefined'){ NBS.boostT=.5; NBS.bdir=ang; } let hit=0;
  for(let t=0;t<.3;t+=NP1.dt){ const u=Math.min(1,(t+NP1.dt)/.3); NB.x=sx+ux*L*u; NB.z=sz+uz*L*u; NB.dsh=null; nbAfterimage(NB.x,NB.y,NB.z); twRushTell(NB,ang,1.4); if(typeof NBS!=='undefined') NBS.bdir=ang;
    const P2=Player; if(!hit&&Math.hypot(P2.x-NB.x,P2.z-NB.z)<2&&P2.y<NB.y+2.5){ hit=1; const r=np1HitRed(3,NB.x,NB.z); if(r==='parry'){ FX.burst(P2.x,P2.y+1.2,P2.z,40,0xffffff,8,.35); impactFrame([[1,2],[2,1]]); shake(1); Sound.sfx('crossboom'); np1Stun(2.6,'TACKLE STOPPED'); return 'parry'; } if(r==='hit') np1Shove(6,.45,'hurt'); } yield NP1.dt; }
  npLane(sx,sz,ang,L,1.5,0,2.4,{col:0xff7a2a,dmg:1,tick:.7,jump:true}); return hit?'hit':'miss'; }
NP1M.tackle=function*(){ NP1.cur='tackle'; twBark('nathan',"Boost tackle. Twice. Don't blink. Actually, do.",true); np1Hint('tack','TACKLE: two straight charges. Parry, or step off the line (the trail burns)');
  for(let i=0;i<2;i++){ const P=Player, [dx,dz]=np1Dir(), sd=i?(Math.random()<.5?1:-1):0; nbBoost(P.x-dx*13-dz*sd*9,P.z-dz*13+dx*sd*9); yield .3; if((yield* npTackleOnce(i?.3:.36))==='parry') return; while(NP1.seq) yield NP1.dt; yield .12; }
  np1Open(1.2); yield .2; };
NP1M.mirage=function*(){ NP1.cur='mirage'; twBark('nathan',"Mirage formation. Which one is me? All of them. Sort of.",true); np1Hint('mirage','MIRAGE: each clone burns a lane at you in turn. Keep moving: the real one charges last');
  const P=Player, n=4, a0=rnd(0,6.283), cl=[]; NB.hov=1.8;
  for(let i=0;i<n;i++){ const a=a0+i*6.283/n+rnd(-.25,.25), P2=Player; nbBoost(P2.x+Math.cos(a)*10,P2.z+Math.sin(a)*10); yield .16; cl.push(npClone(NB.x,NB.z)); }
  { const P2=Player, [dx,dz]=np1Dir(); nbBoost(P2.x-dx*14,P2.z-dz*14); }
  for(let r=0;r<2;r++) for(const c of cl){ if(c.dead) continue; const P2=Player, ang=Math.atan2(P2.z+(P2.vz||0)*.25-c.z,P2.x+(P2.vx||0)*.25-c.x); npLane(c.x,c.z,ang,24,1.3,.5,.2,{dmg:2}); np1Glint(c.x,c.y+2.2,c.z,0x3ff4ff,3); yield r?.16:.22; }
  yield .55; for(const c of cl) c.dead=1;
  if((yield* npTackleOnce(.32))==='parry') return; while(NP1.seq) yield NP1.dt; np1Open(1.2); yield .2; };
NP1M.grid=function*(){ NP1.cur='grid'; twBark('nathan',"Funnel grid. One gap. Find it. Faster.",true); np1Hint('grid','GRID: dark lanes are about to burn. Stand in the one lane that is not marked');
  { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*12,P.z-dz*12); } yield .25; for(let v=0;v<4;v++){ yield* npGrid(1,.72); if(v%2===0) yield* npVolley(4,false); } np1Open(1); yield .2; };
NP1M.buster=function*(){ NP1.cur='buster'; twBark('nathan',"Buster cannon. With garnish.",true); np1Hint('bust','BUSTER: the beam sweeps after you. Blink through it, jump it, or get in close and behind him');
  { const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*9,P.z-dz*9); } yield .3;
  const M={t:0,n:0}; np1Obj({bit:1,upd(dt){ M.t+=dt; if(M.n<7&&M.t>1.3+M.n*.24){ M.n++; const sd=M.n%2?1:-1, [dx,dz]=np1Dir(); npMissile(NB.x-dz*sd*1.1,NB.y+3.1,NB.z+dx*sd*1.1,{sp:11}); Sound.sfx('mechshot'); } return M.n<7; }});
  yield* npBuster(3.2,1.5); np1Open(1.6); yield .2; };
NP1M.funnelgrab=(function(){ const old=NP1M.funnelgrab; return function*(){ yield* old.call(this); if(NP1.gen&&!NB.stunned&&!(NP1.stunT>0)){ NP1.cur='funnelgrab'; const P=Player, [dx,dz]=np1Dir(); nbBoost(P.x-dx*8-dz*5,P.z-dz*8+dx*5); yield .15; yield* npVolley(5,false); } }; })();
