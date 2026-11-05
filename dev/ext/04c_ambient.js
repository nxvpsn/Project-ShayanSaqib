// =====================================================================
// AMBIENT MOTES (graphics pass): a few soft particles drifting round the player, by place: dusk dust and lantern sparks
// in Lanternbrook, fireflies on Starfall Ridge, petals and fireflies in the white flowers, spirit motes in the ruins,
// embers in the keep and the twins' gate, ash over the red lake. None in space, the void, the bullet hell, the title, or
// on Ali's road (its own pollen, 59x). One pool of 40 additive sprites, recycled; hidden when nothing fits.
// =====================================================================
const AMB={pool:null,key:null,N:40,
  kinds:{village:{cols:[0xffc68a,0xffe2b0,0xff8a4a],sz:[.08,.16],up:[.05,.25],drift:.35,blink:0,n:26},
         meadow:{cols:[0xc8ff7a,0xe8ff9a,0x9affc8],sz:[.1,.18],up:[-.05,.1],drift:.5,blink:1,n:30},
         flowers:{cols:[0xffffff,0xdfe8ff,0xbfefff],sz:[.08,.15],up:[-.15,.05],drift:.6,blink:.5,n:32},
         ruins:{cols:[0x8ab4ff,0xbfd8ff,0x6a8aff],sz:[.1,.2],up:[.05,.2],drift:.3,blink:.6,n:26},
         keep:{cols:[0xff6a3a,0xffb04a,0xff3a2a],sz:[.06,.13],up:[.4,1.1],drift:.4,blink:0,n:30},
         twins:{cols:[0x8ab4ff,0xffffff,0x5a8aff],sz:[.06,.12],up:[.2,.6],drift:.35,blink:.3,n:24},
         lake:{cols:[0xff5a4a,0x2a1414,0xff8a6a],sz:[.07,.14],up:[-.2,.2],drift:.5,blink:0,n:28}}};
function ambKind(){ if(!L||!L.key||Game.state==='title'||Game.mech) return null; if(typeof tpsFight==='function'&&tpsFight()) return null; return AMB.kinds[L.key]||null; }
function ambSpawn(o,K,P,fresh){ o.x=P.x+rnd(-14,14); o.z=P.z+rnd(-9,11); o.y=groundY(o.x,o.z)+(fresh?rnd(.3,4.5):(K.up[0]<0?rnd(3,5):rnd(.2,1))); o.vx=rnd(-1,1)*K.drift; o.vz=rnd(-1,1)*K.drift; o.vy=rnd(K.up[0],K.up[1]); o.t=0; o.life=rnd(4,9); o.ph=rnd(0,6.28);
  o.s=rnd(K.sz[0],K.sz[1]); o.g.material.color.setHex(K.cols[Math.floor(Math.random()*K.cols.length)]); }
function ambFrame(dt){ const K=ambKind(), P=Player; if(!AMB.pool){ if(!K) return; AMB.pool=[]; for(let i=0;i<AMB.N;i++){ const g=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xffffff,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false})); g.visible=false; scene.add(g); AMB.pool.push({g,dead:1}); } }
  if(!K){ for(const o of AMB.pool) o.g.visible=false; AMB.key=null; return; }
  if(AMB.key!==L.key){ AMB.key=L.key; AMB.pool.forEach((o,i)=>{ o.dead=i>=K.n; o.g.visible=false; if(!o.dead) ambSpawn(o,K,P,true); }); }
  if(!AMB.pool[0].g.parent) AMB.pool.forEach(o=>scene.add(o.g)); /* swept off the scene by a level change */
  for(let i=0;i<AMB.pool.length;i++){ const o=AMB.pool[i]; if(o.dead||i>=K.n){ o.g.visible=false; continue; } o.t+=dt;
    if(o.t>o.life||Math.abs(o.x-P.x)>16||Math.abs(o.z-P.z)>13) ambSpawn(o,K,P,false);
    o.x+=(o.vx+Math.sin(o.t*.9+o.ph)*K.drift*.5)*dt; o.z+=o.vz*dt; o.y+=o.vy*dt+Math.sin(o.t*1.7+o.ph)*.004;
    const fade=Math.min(1,o.t/.8,(o.life-o.t)/.8), bl=K.blink?(1-K.blink)+K.blink*Math.max(0,Math.sin(o.t*3+o.ph)):1, a=Math.max(0,fade*bl);
    o.g.visible=a>.02; o.g.position.set(o.x,o.y,o.z); o.g.scale.set(o.s,o.s,1); o.g.material.opacity=a*.85; } }
(function(){ const uw=updateWorld; updateWorld=function(dt){ const r=uw.apply(this,arguments); try{ ambFrame(Game.zw?0:dt); }catch(e){ console.error('ambient',e); } return r; }; })();
