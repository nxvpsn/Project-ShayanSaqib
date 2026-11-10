// =====================================================================
// BIG BACK HAMZA: SIDE DISHES. Like the twins' solo fights, things now overlap: while he bounces, rolls and flops, a side
// dish arrives every few seconds (faster in phase II) and stays in play through his next move:
//   gravy   gravy boats lobbed at and round you: brown puddles that slow you (marked circles)
//   bacon   sizzling strips across the ground through where you stand: a dark strip, then fire: JUMP it or step off
//   snot    three green shots aimed at you: hit them back and they hurt him
// Not during cutscenes, his limit cut or while he is stunned. He also waits less between his own moves.
// =====================================================================
const HZS={gap:[0,5.2,3.4],cd:[0,.7,.45]};
function hzsGravy(G,n){ const P=Player; twBark('hamza',"Gravy! For the blacksmith! Extra thick!"); for(let i=0;i<n;i++){ const a=rnd(0,6.28), r=i?rnd(1.5,4):0, p=twClampXZ(P.x+P.vx*.4+Math.cos(a)*r,P.z+P.vz*.4+Math.sin(a)*r,.8);
    const m=new THREE.Mesh(new THREE.SphereGeometry(.38,8,6),new THREE.MeshLambertMaterial({color:0x7a4a1c})); m.userData.tw=1; scene.add(m);
    twThrow({x:G.x,y:G.y+3,z:G.z,tx:p.x,tz:p.z,dur:.95+i*.12,h:4.5,mesh:m,r:1.2,col:0xc88a3a,trail:0xa86a2a,fence:true,onLand(x,z,play){ Sound.sfx('squelch'); FX.burst(x,groundY(x,z)+.2,z,14,0x8a5a24,3,.3,false); twZone(x,z,1.25,5,{slow:.5,col:0x6a3e14,op:.85,fx:.05}); if(play&&twInR(x,z,1.05,99)) twHitP(1,x,z,{ub:true}); }}); } Sound.sfx('oink'); }
function hzsBacon(G,n){ const P=Player; twBark('hamza',"BACON! Crispy! Do not step on my bacon!"); for(let i=0;i<n;i++){ const ang=rnd(0,Math.PI), x=P.x+rnd(-1,1)*i, z=P.z+rnd(-1,1)*i, L=18, W=2, gy=groundY(x,z);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0x3a0a06,transparent:true,opacity:.72,depthWrite:false})), e=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xff7a3a,transparent:true,opacity:.9,depthWrite:false}));
    for(const q of [m,e]){ q.rotation.x=-Math.PI/2; q.rotation.z=-ang; q.userData.tw=1; scene.add(q); } m.position.set(x,gy+.06,z); m.scale.set(L,W,1); e.position.set(x,gy+.07,z); e.scale.set(L,.12,1);
    const S={t:-i*.25,hit:0,warn:.95,dur:.55}, ux=Math.cos(ang), uz=Math.sin(ang);
    twHz({upd(dt,play){ if(play) S.t+=dt; const act=S.t>=S.warn; m.material.color.setHex(act?0xff5a1a:0x3a0a06); m.material.opacity=act?.85:.5+.22*(Math.floor(Math.max(0,S.t)*12)%2); e.scale.y=act?W:.12+Math.max(0,S.t)/S.warn*W*.9; e.material.opacity=act?.35:.9;
        if(act&&play){ if(!S.snd){ S.snd=1; Sound.sfx('beam'); shake(.2); } for(let k=0;k<4;k++){ const u=rnd(-L/2,L/2); FX.spawn(x+ux*u,gy+.2,z+uz*u,rnd(-.5,.5),rnd(2,5),rnd(-.5,.5),.4,k%2?0xff7a1a:0xffd27a,.28,-1,true); }
          const P2=Player, rx=P2.x-x, rz=P2.z-z, al=rx*ux+rz*uz, pe=Math.abs(rx*uz-rz*ux); if(!S.hit&&Math.abs(al)<L/2&&pe<W/2+.2&&P2.y<groundY(P2.x,P2.z)+1&&P2.inv<=0&&P2.dash<=0){ S.hit=1; hurtPlayer(2,x-ux,z-uz); } }
        return S.t<S.warn+S.dur; }, kill(){ scene.remove(m); scene.remove(e); }}); } Sound.sfx('charge'); }
function hzsSnot(G){ twBark('hamza',"Achoo! Bismillah. Excuse me. ACHOO!"); for(const k of [-1,0,1]) twAimBolt(G,'goo',G.x,G.y+2.6,G.z,9.5,k*.22,{col:0x9aff6a,dmg:1}); Sound.sfx('squelch'); G.mouth=1; }
function hzsTick(G,dt){ if(!G||G.hp<=0||G.inv||G.pend||G.stun>0||G.noBar||TW.lcCleanup||Game.script||Game.state!=='play'||G.noAttack) return; const ph=Math.min(2,G.phase||1);
  if(!G.gen&&G.cd>HZS.cd[ph]) G.cd=HZS.cd[ph]; G.sideT=(G.sideT==null?HZS.gap[ph]*.8:G.sideT)-dt; if(G.sideT>0) return; G.sideT=HZS.gap[ph]*rnd(.85,1.2);
  if(!TW.hzsHint){ TW.hzsHint=1; twBig('SIDE DISHES',{size:44,col:'#ffb050',y:UH*.24,dur:1.6,sub:'Gravy slows · jump the bacon · hit the snot back'}); }
  const k=(G.sideN=(G.sideN||0)+1)%3; if(k===1) hzsGravy(G,ph>=2?5:3); else if(k===2) hzsBacon(G,ph>=2?3:2); else hzsSnot(G); }
(function(){ const hu=hzgUpdate; hzgUpdate=function(dt,play){ const r=hu.apply(this,arguments); try{ if(play) hzsTick(TW.giant,dt); }catch(e){ console.error('hamza sides',e); } return r; }; })();
