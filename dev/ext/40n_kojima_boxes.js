// =====================================================================
// THE BOX HUNT (replaces the laser dome at 50% of phase III): Kojima vanishes and twenty cardboard boxes drop around the arena.
// One has him in it and shakes a little; hit it and he's out and staggered for 3.2s. Every wrong box blows up (2 damage within 2.3).
// After 22 seconds he climbs out on his own. Hits count from the sword (meleeHits: Shayan's and Ali's), Getsugas (BEAMS) and friendly bolts.
// =====================================================================
const KJB={list:null,t:0,geo:null,mat:null,dur:22};
function kjBoxesStart(b){ const P=Player; clearBossFx(b); b.domeDone=1; b.state='boxes'; b.st=0; b.vx=b.vz=0; b.inv=true; b.armor=0; P.charge=0; b.kjg=null; b.twg=null;
  bossSmoke(b); b.vanish=1; b.spr.show(false); Sound.sfx('dash'); Sound.sfx('howl'); kjBoxesClear();
  const T=kjTex(); KJB.geo=KJB.geo||new THREE.BoxGeometry(1.3,1,1.3); KJB.mat=KJB.mat||new THREE.MeshLambertMaterial({map:T.box}); const A=L.arena||twBounds(), pts=[], real=Math.floor(Math.random()*20);
  for(let i=0;i<20;i++){ let x=0,z=0,ok=false; for(let k=0;k<240&&!ok;k++){ const gap=k<80?2.3:k<160?1.8:1.4; x=rnd(A.x0+1.5,A.x1-1.5); z=rnd(A.z0+1.5,A.z1-1.5); ok=Math.hypot(x-P.x,z-P.z)>2.4&&pts.every(q=>Math.hypot(q.x-x,q.z-z)>gap)&&cellH(x,z)<500; } if(!ok) continue; /* the spacing relaxes until all twenty fit */
    const m=new THREE.Mesh(KJB.geo,KJB.mat); m.userData.tw=1; m.rotation.y=rnd(0,6.28); const gy=groundY(x,z); m.position.set(x,gy+9,z); scene.add(m); pts.push({m,x,z,gy,real:pts.length===real,ph:rnd(0,6.28),drop:rnd(0,.6),t:0,landed:0}); }
  if(!pts.some(q=>q.real)&&pts.length) pts[0].real=true; KJB.list=pts; KJB.t=0;
  Game.banner={name:'Which box?',sub:'Hit the box he is in: the real one shakes. Every wrong one blows up.',t:0}; twBark('grimmaw',"Twenty boxes. One genius. Choose wrong and it goes on YOUR insurance.",true); Game.slowT=.4; shake(.4); }
function kjBoxesClear(){ if(!KJB.list) return; for(const q of KJB.list) if(!q.dead) scene.remove(q.m); KJB.list=null; }
function kjBoxPop(q,wrong,hurt){ if(q.dead) return; q.dead=1; scene.remove(q.m); const P=Player;
  if(wrong){ FX.burst(q.x,q.gy+.6,q.z,30,0xff6a3a,6,.35); FX.burst(q.x,q.gy+.6,q.z,16,0xc8a064,4,.4,false); FX.ring(q.x,q.gy+.1,q.z,'#ff8a5a',2.6,.3); Sound.sfx('crash'); shake(.5); if(hurt&&Math.hypot(P.x-q.x,P.z-q.z)<2.3) twHitP(2,q.x,q.z,{ub:true}); Game.dmgNums.push({x:q.x,y:q.gy+2,z:q.z,n:'WRONG',t:0,col:'#ff8a5a'}); }
  else { FX.burst(q.x,q.gy+.6,q.z,30,0xf6f4ee,5,.4,false); FX.burst(q.x,q.gy+.6,q.z,16,0xc8a064,4,.4,false); } }
function kjBoxesEnd(b,found){ const list=KJB.list||[], real=list.find(q=>q.real); let hurtOnce=1;
  for(const q of list){ if(q.dead) continue; if(q===real) kjBoxPop(q,false); else { kjBoxPop(q,!found,hurtOnce); if(!found&&Math.hypot(Player.x-q.x,Player.z-q.z)<2.3) hurtOnce=0; } }
  KJB.list=null; if(!b) return; if(real){ b.x=real.x; b.z=real.z; b.y=real.gy; } b.vanish=0; b.spr.show(true); b.inv=false; bossSmoke(b); b.vy=0;
  if(found){ b.state='stagger'; b.st=0; b.stagT=3.2; b.flash=.4; Sound.sfx('secret'); Sound.sfx('glass'); shake(.6); twBig('FOUND HIM',{size:54,col:'#ffd45a',y:UH*.26,dur:1.1,sub:'He is staggered. Go!'}); twBark('grimmaw',"How?! That box had my NAME on it! ...Oh.",true); }
  else { b.state='recover'; b.st=0; twBark('grimmaw',"Nobody checks the box. That is the whole point of the box.",true); } }
function kjBoxHit(q){ const b=Game.boss; if(!b||b.state!=='boxes'||!KJB.list||q.dead||!q.landed) return false; if(q.real) kjBoxesEnd(b,true); else kjBoxPop(q,true,true); return true; }
// the dome's trigger (base: phase III at half HP) starts the hunt instead
startDome=function(b){ kjBoxesStart(b); };
(function(){ const ub=updateBoss; updateBoss=function(dt){ const b=Game.boss; const r=ub.apply(this,arguments);
    try{ if(KJB.list&&(!b||b.state!=='boxes')){ kjBoxesClear(); return r; } if(!b||b.state!=='boxes'||Game.state!=='play') return r;
      b.vx=b.vz=0; b.inv=true; KJB.t+=dt; const P=Player;
      for(const q of KJB.list){ if(q.dead) continue; q.t+=dt; const u=Math.max(0,q.t-q.drop); if(u<.45){ const k=u/.45; q.m.position.y=q.gy+.5+8.5*(1-k)*(1-k); } else { if(!q.landed){ q.landed=1; FX.burst(q.x,q.gy+.3,q.z,8,0xc8a064,3,.25,false); if(Math.random()<.35) Sound.sfx('block'); } q.m.position.y=q.gy+.5; }
        if(q.real&&q.landed){ q.m.position.x=q.x+Math.sin(q.t*37)*.045; q.m.position.z=q.z+Math.cos(q.t*29)*.03; q.m.rotation.z=Math.sin(q.t*41)*.035; } /* the real one shakes a little */ }
      for(const bm of BEAMS){ if(bm.life<=0) continue; for(const q of KJB.list){ if(q.dead||!q.landed) continue; if(Math.hypot(bm.x-q.x,bm.z-q.z)<1.4){ bm.life=Math.min(bm.life,.06); if(kjBoxHit(q)) break; } } }
      for(const bo of BOLTS){ if(bo.dead||!bo.friendly) continue; for(const q of KJB.list||[]){ if(q.dead||!q.landed) continue; if(Math.hypot(bo.x-q.x,bo.z-q.z)<1.2){ bo.dead=1; kjBoxHit(q); break; } } }
      if(KJB.list&&KJB.t>KJB.dur) kjBoxesEnd(b,false); }catch(e){ console.error('box hunt',e); try{ kjBoxesEnd(b,false); }catch(x){} } return r; }; })();
(function(){ const mh=meleeHits; meleeHits=function(x,z,y,rad,ang,arc,dmg,set){ let any=mh.apply(this,arguments); try{ const b=Game.boss; if(b&&b.state==='boxes'&&KJB.list) for(const q of KJB.list){ if(q.dead||!q.landed||(set&&set.has(q))) continue; const d=Math.hypot(q.x-x,q.z-z);
        if(d<rad+.9&&(d<1.3||angDiff(Math.atan2(q.z-z,q.x-x),ang)<arc)){ if(set) set.add(q); if(kjBoxHit(q)){ any=true; break; } } } }catch(e){ console.error('box hit',e); } return any; }; })();
