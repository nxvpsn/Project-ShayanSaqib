// =====================================================================
// SKIES (paintings in img/, made by dev/skyart.py and dev/colossus.py):
// - one night sky for Starfall Ridge, Boxwood Ruins and the flower field (every fight there, every timeline):
//   a blue Milky Way with a thin pink glow on the horizon (img/milkyway.png, drawn additively over a navy dome),
//   extra stars, the moon (`skyMoon`: cut into fragments by contApply once the moon is cut), black hills;
// - Starfall Ridge turns night (moonlit lighting), its colossus is the bare-bone night painting (colossus_night.png);
// - Lanternbrook keeps its dusk: rim-lit snow mountains in three layers (vmtn_far/mid/near.png, the near hills carry
//   pines and village lights), gold-edged clouds, sky lanterns drifting up, a few first stars.
// Images load async; until then (and in the harness) the plane is hidden.
// =====================================================================
function skImg(G,src,w,h,x,y,z,o){ if(typeof Image==='undefined') return null; let m=null;
  try{ const img=new Image(), t=new THREE.Texture(img); t.encoding=THREE.sRGBEncoding; t.minFilter=THREE.LinearFilter; t.generateMipmaps=false;
    img.onload=()=>{ t.needsUpdate=true; if(m) m.visible=true; }; img.src=src; m=farPlane(G,t,w,h,x,y,z,o); if(!(img.complete&&img.naturalWidth)) m.visible=false; }catch(e){ console.error('sky img',e); }
  return m; }
const SK_NIGHT={sky:['#030820','#12308a','#3a40a8'],sunDir:[-.2,.03,-1],sunCol:'#3a2a6a',sunSize:4000};
Object.assign(LOOKS.meadow,SK_NIGHT,{hemi:[0x9aaae8,0x2a2a48,.82],sun:[0xc8d4ff,1.15,[-12,11,9]],fog:[0x141c48,60,420],exp:1.05,bloom:[.95,.6,.7],tint:[.96,.98,1.1],sat:1.08});
Object.assign(LOOKS.ruins,SK_NIGHT); Object.assign(LOOKS.flowers,SK_NIGHT);
// o: {x: the level's centre, moon: add the moon (Starfall Ridge has none of its own), stars: how many extra}
function nightSky(G,o){ o=o||{}; const x=o.x||30;
  G.milky=skImg(G,'img/milkyway.png',1100,550,x+40,200,-330,{ro:-9,add:true});
  if(o.stars) { stars(G,o.stars,0xffffff,1.5); stars(G,Math.round(o.stars/4),0xa8c8ff,2.2); }
  if(o.moon) G.skyMoon=farPlane(G,moonTex('#e8eefc','200,215,255'),56,56,x-80,74,-270,{ro:-8,add:true});
  return G; }
mpWrap('ruins',G=>nightSky(G,{x:30,stars:400}));

// ---------- Lanternbrook at dusk ----------
function skLanternTex(){ if(skLanternTex.t) return skLanternTex.t; const [cv,c]=mkCanvas(16,16), R2=(x,y,w,h,col)=>{ c.fillStyle=col; c.fillRect(x,y,w,h); };
  R2(3,2,10,12,'rgba(255,120,40,.25)'); R2(5,3,6,10,'#ff8a3a'); R2(6,4,4,8,'#ffc070'); R2(7,6,2,4,'#fff0c0'); R2(5,3,6,1,'#7a3a1a'); R2(5,12,6,1,'#7a3a1a');
  return skLanternTex.t=tex(cv); }
function villageSky(G){
  skImg(G,'img/vmtn_far.png',780,146,20,-16,-245,{ro:-7}); skImg(G,'img/vmtn_mid.png',640,100,20,-20,-190,{ro:-6}); skImg(G,'img/vmtn_near.png',520,66,20,-22,-140,{ro:-5});
  for(let i=0;i<6;i++) farPlane(G,cloudTex(i+40,['255,214,170','150,90,150']),100+i*14,38,-150+i*62,52+hash(i,7)*26,-236+i*5,{ro:-8,op:.8});
  const st=stars(G,260,0xffe8f0,1.3); st.material.opacity=.5;
  const mat=new THREE.MeshBasicMaterial({map:skLanternTex(),transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending}), LS=[];
  for(let i=0;i<34;i++){ const s=1.2+hash(i,3)*1.6, m=new THREE.Mesh(new THREE.PlaneGeometry(s,s),mat); m.position.set(-90+hash(i,1)*230,-8+hash(1,i)*80,-70-hash(i,2)*130); m.renderOrder=-4; G.root.add(m);
    LS.push({m,v:.5+hash(i,4)*.7,ph:hash(i,5)*6}); }
  G.anim.push(dt=>{ try{ const t=performance.now()/1000; for(const q of LS){ const p=q.m.position; p.y+=q.v*dt; p.x+=Math.sin(t*.4+q.ph)*.15*dt; if(p.y>78) p.y=-10; } }catch(e){ console.error('sky lanterns',e); } });
  return G; }
// the first village of a session was built before this file ran: swap its old backdrop now
try{ if(typeof L!=='undefined'&&L&&L.key==='village'&&L.oldSky){ for(const m of L.oldSky) L.root.remove(m); L.oldSky=null; villageSky(L); } }catch(e){ console.error('village sky swap',e); }
