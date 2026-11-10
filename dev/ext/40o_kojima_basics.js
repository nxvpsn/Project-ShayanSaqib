// =====================================================================
// KOJIMA'S NEW BASICS: five more easy first versions of what the twins do later, each with his own paperwork look
// (nothing borrowed from Caotan's lasers or Omar's scythes):
//   sender    RETURN TO SENDER (Omar's rally scythe): a red envelope floats at you; hit it back, he bats it back once
//             (twice in III), hit it again and it lands on him: damage + a stagger
//   nap       NAP TIME (Omar's parry stance): he sleeps for 3s. Hit him and he wakes into a tantrum ring (jump it or
//             back off); leave him be and he wakes groggy: a free stagger
//   deadline  DEADLINE (Omar's sentence): 3, 2, 1 over your head, a shadow follows you until "1", then a filing cabinet
//             lands on it: step off at the end, not before
//   beat      PAPER CUTS (Omar's clones on a beat): three paper planes dash in from three sides, one per beat, each with
//             a glint: parry each (no punish for an early press here)
//   fineprint FINE PRINT (Omar's monologue pockets): the floor fills with paperwork except two APPROVED stamps: stand on one
// =====================================================================
function kjHint(k,name,sub){ KJ.seen=KJ.seen||{}; if(KJ.seen[k]) return; KJ.seen[k]=1; Game.banner={name,sub,t:0}; }
function kjDisc(r,col,op,rim){ const g=new THREE.Group(), d=new THREE.Mesh(new THREE.CircleGeometry(r,40),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false})), e=new THREE.Mesh(new THREE.RingGeometry(r-.12,r,40),new THREE.MeshBasicMaterial({color:rim,transparent:true,opacity:.95,depthWrite:false,side:THREE.DoubleSide}));
  g.add(d); g.add(e); g.rotation.x=-Math.PI/2; g.userData.tw=1; g.userData.d=d; g.userData.e=e; scene.add(g); return g; }
KJM.sender=function*(b,ph){ b.anim='windup'; kjHint('sender','Return to sender','Hit the red envelope back. He returns it: hit it again'); twBark('grimmaw',"A complaint? Return to sender. I never read my mail.",true);
  const T=kjTex(), m=twBB(T.paper,1.5,1.9,{col:0xff6a6a}); m.userData.tw=1; scene.add(m); const E={x:b.x,z:b.z,dir:1,n:0,sp:5.5,done:0,cd:.4,t:0}, back=ph>=3?2:1; yield .5; b.anim='slash'; b.ap=.3; Sound.sfx('swing');
  twHz({upd(dt,play){ if(E.done||Game.boss!==b||b.hp<=0||b.state!=='kj') return false; if(!play) return true; E.t+=dt; E.cd-=dt; const P=Player, tg=E.dir>0?P:b, dx=tg.x-E.x, dz=tg.z-E.z, d=Math.hypot(dx,dz)||1, st=Math.min(d,E.sp*dt); E.x+=dx/d*st; E.z+=dz/d*st;
      const y=groundY(E.x,E.z)+1.3+Math.sin(E.t*6)*.15; m.position.set(E.x,y,E.z); m.quaternion.copy(camera.quaternion); m.rotation.z+=Math.sin(E.t*9)*.2; if(Math.random()<.5) FX.spawn(E.x,y,E.z,0,.3,0,.3,0xffb0b0,.18,0,false);
      if(E.dir>0){ if(d<2.3&&E.cd<=0&&Game.time-(P.swingT||-9)<.16){ E.dir=-1; E.sp+=3; E.cd=.35; Sound.sfx('deflect'); FX.spark(E.x,y,E.z); shake(.2); Game.dmgNums.push({x:E.x,y:y+1,z:E.z,n:'RETURNED',t:0,col:'#ffd45a'}); }
        else if(d<.7){ if(P.inv<=0&&P.dash<=0) hurtPlayer(1,b.x,b.z,true); FX.burst(E.x,y,E.z,16,0xffffff,4,.3,false); E.done=1; } }
      else if(d<1.3){ if(E.n<back){ E.n++; E.dir=1; E.sp+=2; E.cd=.3; b.anim='slash'; b.ap=.3; Sound.sfx('swing'); FX.spark(E.x,y,E.z); Game.dmgNums.push({x:b.x,y:b.y+3,z:b.z,n:'NOT MY DEPARTMENT',t:0,col:'#ff8a8a'}); }
        else { E.done=1; FX.burst(E.x,y,E.z,30,0xffffff,6,.4,false); Sound.sfx('slam'); shake(.5); Game.dmgNums.push({x:b.x,y:b.y+3.4,z:b.z,n:'DELIVERED',t:0,big:true,col:'#ffd45a'}); damageBoss(6); if(Game.boss===b&&b.hp>0) stagger(b,2); } }
      return !E.done&&E.t<14; }, kill(){ E.done=1; scene.remove(m); }});
  for(let t=0;t<14&&!E.done;t+=.1) yield .1; b.ap=null; yield .3; };
KJM.nap=function*(b,ph){ b.anim='howl'; kjHint('nap','Nap time',"Don't hit a sleeping baby. Wait: he wakes up groggy"); twBark('grimmaw',"Nap time. My lawyers will see you after.",true); b.napHit=0; b.napT=Game.time+3.2; const g=twGlow(0x9fd0ff,2.6); g.userData.tw=1;
  twHz({upd(){ const on=Game.boss===b&&b.napT>Game.time&&!b.napHit&&b.state==='kj'; g.visible=on; g.position.set(b.x,b.y+2.4,b.z); g.scale.setScalar(2.4+Math.sin(Game.time*3)*.4); return on; }, kill(){ scene.remove(g); }});
  for(let t=0;t<3.2&&!b.napHit;t+=.1){ if(Math.round(t*10)%8===0) Game.dmgNums.push({x:b.x+rnd(-.4,.4),y:b.y+2.6,z:b.z,n:'Z',t:0,col:'#bfe0ff'}); yield .1; }
  b.napT=0; if(b.napHit){ b.napHit=0; b.anim='howl'; twBark('grimmaw',"WAAAH! You woke the BABY!",true); Sound.sfx('howl'); shake(.5); const d=kjDisc(4.6,0x2a0808,.6,0xff5a5a); d.position.set(b.x,groundY(b.x,b.z)+.07,b.z);
    yield .7; scene.remove(d); FX.burst(b.x,b.y+.4,b.z,50,0xffe0b0,8,.4,false); FX.ring(b.x,groundY(b.x,b.z)+.1,b.z,'#ffd0a0',4.6,.35); Sound.sfx('slam'); shake(.8);
    const P=Player; if(Math.hypot(P.x-b.x,P.z-b.z)<4.6&&P.y<groundY(P.x,P.z)+1.1&&P.inv<=0&&P.dash<=0) hurtPlayer(2,b.x,b.z); yield .5; }
  else { Game.dmgNums.push({x:b.x,y:b.y+3.2,z:b.z,n:'GROGGY',t:0,big:true,col:'#ffd45a'}); if(Game.boss===b&&b.hp>0) stagger(b,1.8); } };
(function(){ const db=damageBoss; damageBoss=function(d,o){ const b=Game.boss; if(b&&b.napT>Game.time&&b.state==='kj'&&!b.napHit){ if(TW._ally||Game.time-(Player.swingT||-9)>.7){ FX.spark(b.x,b.y+1.5,b.z); return; } /* only your own attack (a swing in the last .7s) wakes him: allies bounce off */ b.napHit=1; FX.spark(b.x,b.y+1.5,b.z); Sound.sfx('block'); return; } return db.apply(this,arguments); }; })();
KJM.deadline=function*(b,ph){ b.anim='howl'; kjHint('deadline','Deadline','A cabinet lands where the shadow is at zero: step off on "1"'); twBark('grimmaw',"Your deadline is in three seconds. No extensions.",true);
  const P=Player, d=kjDisc(1.9,0x140c04,.62,0xffc23a), T=kjTex(), cab=new THREE.Mesh(new THREE.BoxGeometry(1.7,2.8,1.3),new THREE.MeshLambertMaterial({map:T.box})); cab.userData.tw=1; cab.visible=false; scene.add(cab); let x=P.x, z=P.z; const S={on:1};
  twHz({upd(){ if(!S.on||Game.boss!==b) return false; d.position.set(x,groundY(x,z)+.07,z); return true; }, kill(){ scene.remove(d); scene.remove(cab); }});
  try{ for(let n=3;n>=1;n--){ Sound.sfx('tick'); Game.dmgNums.push({x:Player.x,y:Player.y+3,z:Player.z,n:String(n),t:0,big:true,col:'#ffc23a'}); for(let t=0;t<.7;t+=1/30){ if(n>1){ x=lerp(x,Player.x,.2); z=lerp(z,Player.z,.2); } yield 1/30; } }
    cab.visible=true; const gy=groundY(x,z); for(let t=0;t<.16;t+=1/60){ cab.position.set(x,gy+1.4+9*(1-t/.16),z); yield 1/60; } cab.position.set(x,gy+1.4,z); Sound.sfx('slam'); shake(.8); FX.burst(x,gy+.3,z,30,0xc8a064,6,.4,false); FX.ring(x,gy+.1,z,'#ffc23a',2.2,.3);
    const P2=Player; if(Math.hypot(P2.x-x,P2.z-z)<1.9&&P2.inv<=0&&P2.dash<=0) hurtPlayer(2,x,z); yield .6; } finally{ S.on=0; scene.remove(d); scene.remove(cab); } };
KJM.beat=function*(b,ph){ b.anim='windup'; kjHint('beat','Paper cuts','Three planes, one per beat: attack as each one reaches you'); twBark('grimmaw',"Paper cuts. Three of them. On the beat.",true); const T=kjTex(), a0=rnd(0,6.28);
  for(let i=0;i<3;i++){ const P=Player, a=a0+i*2.094, o={x:P.x+Math.cos(a)*8,z:P.z+Math.sin(a)*8}, m=twBB(T.paper,1.2,1.5,{col:0xffe08a}); m.userData.tw=1; scene.add(m); const gl=twGlow(0xffffff,2); gl.userData.tw=1;
    try{ for(let t=0;t<.45;t+=1/60){ const y=groundY(o.x,o.z)+1.2; m.position.set(o.x,y,o.z); m.quaternion.copy(camera.quaternion); gl.position.set(o.x,y,o.z); gl.material.opacity=Math.max(0,1-t/.3); yield 1/60; } Sound.sfx('ting');
      const sx=o.x, sz=o.z; Sound.sfx('whoosh'); for(let t=0;t<.3;t+=1/60){ const u=Math.min(1,(t+1/60)/.3), P2=Player, dx=P2.x-sx, dz=P2.z-sz, d=Math.hypot(dx,dz)||1; o.x=sx+dx/d*Math.max(0,d-.9)*u; o.z=sz+dz/d*Math.max(0,d-.9)*u; const y=groundY(o.x,o.z)+1.2; m.position.set(o.x,y,o.z); m.quaternion.copy(camera.quaternion); twRushTell(o,Math.atan2(dz,dx)); FX.spawn(o.x,y,o.z,0,0,0,.2,0xffe08a,.2,0,false); yield 1/60; }
      const r=twHitP(1,o.x,o.z,{melee:true,onParry:()=>{ Game.dmgNums.push({x:o.x,y:groundY(o.x,o.z)+2.4,z:o.z,n:'SHREDDED',t:0,col:'#ffd45a'}); }}); FX.burst(o.x,groundY(o.x,o.z)+1.2,o.z,14,0xffffff,4,.3,false); }
    finally{ scene.remove(m); scene.remove(gl); } yield .35; }
  yield .3; };
KJM.fineprint=function*(b,ph){ b.anim='howl'; kjHint('fineprint','Fine print','The floor fills with paperwork: stand on an APPROVED stamp'); twBark('grimmaw',"Read the fine print. All of it. It's on the floor.",true); Sound.sfx('charge');
  const P=Player, cx=P.x, cz=P.z, big=kjDisc(9,0x1a1408,.1,0xe8dcc0), safe=[]; big.position.set(cx,groundY(cx,cz)+.05,cz); const a=rnd(0,6.28);
  for(const k of [0,1]){ const aa=a+k*Math.PI+rnd(-.5,.5), q=twClampXZ(cx+Math.cos(aa)*rnd(3,4.5),cz+Math.sin(aa)*rnd(3,4.5),1.5), s=kjDisc(1.7,0x0c3a14,.75,0x6aff8a); s.position.set(q.x,groundY(q.x,q.z)+.09,q.z); safe.push({x:q.x,z:q.z,m:s}); Game.dmgNums.push({x:q.x,y:groundY(q.x,q.z)+1.6,z:q.z,n:'APPROVED',t:0,col:'#6aff8a'}); }
  try{ for(let t=0;t<1.8;t+=1/30){ big.userData.d.material.opacity=.1+.5*(t/1.8); if(Math.random()<.6){ const aa=rnd(0,6.28), r=rnd(0,9); FX.spawn(cx+Math.cos(aa)*r,groundY(cx,cz)+rnd(2,5),cz+Math.sin(aa)*r,0,-3,0,.6,0xf4ecd8,.25,0,false); } yield 1/30; }
    Sound.sfx('slam'); shake(.6); FX.ring(cx,groundY(cx,cz)+.1,cz,'#f4ecd8',9,.35); for(let i=0;i<40;i++){ const aa=rnd(0,6.28), r=rnd(0,9); FX.spawn(cx+Math.cos(aa)*r,groundY(cx,cz)+.3,cz+Math.sin(aa)*r,rnd(-1,1),rnd(2,5),rnd(-1,1),.6,0xf4ecd8,.3,6,false); }
    const P2=Player, ok=safe.some(s=>Math.hypot(P2.x-s.x,P2.z-s.z)<1.8); if(!ok&&Math.hypot(P2.x-cx,P2.z-cz)<9&&P2.inv<=0&&P2.dash<=0) hurtPlayer(2,cx,cz); else if(ok) Game.dmgNums.push({x:P2.x,y:P2.y+2.6,z:P2.z,n:'SIGNED',t:0,col:'#6aff8a'}); yield .5; }
  finally{ scene.remove(big); safe.forEach(s=>scene.remove(s.m)); } };
KJ_POOL[1].push('sender','nap'); KJ_POOL[2].push('sender','nap','deadline','beat'); KJ_POOL[3].push('sender','nap','deadline','beat','fineprint','fineprint');
