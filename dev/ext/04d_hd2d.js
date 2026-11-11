// =====================================================================
// HD-2D PASS (graphics): the look of pixel sprites in a lit, deep 3D diorama. Each part has a switch in HD (0 = off):
//   HD.grade  filmic contrast (an S-curve), cool shadows / warm highlights, a slightly deeper vignette (in the grade shader)
//   HD.tilt   a tighter, stronger tilt-shift focus band round the player (the existing pass, retuned; not in the 3D fight)
//   HD.shafts light shafts: tall soft additive cards leaning along the sun/moon direction, standing in the world round
//             the player, shimmering (fainter in boss fights, none in space / the void / the bullet hell)
//   HD.mist   low ground mist drifting round the player while exploring (never in a fight: telegraphs stay crisp)
//   HD.rays   screen-space rays from the sun when it is in frame (cutscenes, the third-person fight)
// localStorage 'msb_hd' = '0' turns the whole pass off.
// =====================================================================
const HD={grade:1,tilt:1,shafts:1,mist:1,rays:0, /* rays off: with a low warm sun in frame they washed the whole screen in its colour */ on:1,cards:null,fog:null,t:0};
(function(){ try{ if(typeof localStorage!=='undefined'&&localStorage.getItem('msb_hd')==='0') HD.on=0; }catch(e){} })();
(function(){ try{ const u=grade.uniforms; if(!u||!grade.material||typeof grade.material.fragmentShader!=='string') return;
    u.hd={value:0}; u.rays={value:0}; u.sunUV={value:new THREE.Vector2(.5,1.2)}; u.rayCol={value:new THREE.Vector3(1,.9,.7)};
    let f=grade.material.fragmentShader, ok=true; const sw=(a,b)=>{ if(f.indexOf(a)<0){ ok=false; return; } f=f.replace(a,b); };
    sw("uniform float exposure,sat,vig,flash,ab,t,red,imp;","uniform float exposure,sat,vig,flash,ab,t,red,imp,hd,rays;uniform vec2 sunUV;uniform vec3 rayCol;");
    sw("c=aces(c*exposure)*tint;","if(rays>.001){ vec2 dv=(sunUV-vUv)/18.; vec2 p=vUv; float w=1.; vec3 acc=vec3(0.); for(int i=0;i<18;i++){ p+=dv; acc+=max(texture2D(tDiffuse,p).rgb-vec3(.85),0.)*w; w*=.9; } c+=min(acc*rays*.02,vec3(.12))*rayCol*smoothstep(.8,0.,length(vUv-sunUV)); }\n    c=aces(c*exposure)*tint;");
    sw("c=pow(c,vec3(1./2.2));","c=pow(c,vec3(1./2.2)); if(hd>.001){ vec3 sc=c*c*(3.-2.*c); c=mix(c,sc,.38*hd); float l2=dot(c,vec3(.299,.587,.114)); c+=hd*(vec3(-.016,0.,.028)*(1.-l2)+vec3(.028,.012,-.018)*l2); }");
    if(ok){ grade.material.fragmentShader=f; grade.material.needsUpdate=true; HD.shader=1; } }catch(e){ console.error('hd2d shader',e); } })();
function hdShaftTex(){ if(HD._st) return HD._st; const W=64, H=256, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d');
  try{ const g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(255,255,255,.9)'); g.addColorStop(.55,'rgba(255,255,255,.35)'); g.addColorStop(1,'rgba(255,255,255,0)'); c.fillStyle=g; c.fillRect(0,0,W,H);
    c.globalCompositeOperation='destination-in'; const h=c.createLinearGradient(0,0,W,0); h.addColorStop(0,'rgba(0,0,0,0)'); h.addColorStop(.5,'rgba(0,0,0,1)'); h.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=h; c.fillRect(0,0,W,H); }catch(e){}
  HD._st=new THREE.CanvasTexture(cv); return HD._st; }
function hdMistTex(){ if(HD._mt) return HD._mt; const S=128, cv=document.createElement('canvas'); cv.width=cv.height=S; const c=cv.getContext('2d');
  try{ for(let i=0;i<26;i++){ const x=Math.random()*S, y=Math.random()*S, r=14+Math.random()*26, g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,'rgba(255,255,255,.22)'); g.addColorStop(1,'rgba(255,255,255,0)'); c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); }
    c.globalCompositeOperation='destination-in'; const g=c.createRadialGradient(S/2,S/2,S*.15,S/2,S/2,S*.5); g.addColorStop(0,'rgba(0,0,0,1)'); g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=g; c.fillRect(0,0,S,S); }catch(e){}
  HD._mt=new THREE.CanvasTexture(cv); return HD._mt; }
function hdPlace(){ return HD.on&&L&&L.key&&!Game.mech&&Game.state!=='title'&&!['space','void','moonsky','vrtut'].includes(L.key)&&typeof LOOK!=='undefined'&&LOOK&&LOOK.sunDir; }
function hdFighting(){ return !!(TW.fight||TW.giant||Game.boss||(typeof NB!=='undefined'&&NB&&NB.alive)||TW.paulFight); }
function hdFrame(dt){ HD.t+=dt; const u=grade.uniforms, place=hdPlace(), tps=typeof tpsFight==='function'&&tpsFight(), P=Player;
  if(HD.shader){ u.hd.value=HD.on&&HD.grade?1:0; }
  try{ if(HD.on&&HD.tilt&&!tps){ tiltH.uniforms.band.value=tiltV.uniforms.band.value=.2; tiltH.uniforms.amount.value=tiltV.uniforms.amount.value=.85; } else { tiltH.uniforms.band.value=tiltV.uniforms.band.value=.3; tiltH.uniforms.amount.value=tiltV.uniforms.amount.value=.55; } }catch(e){}
  // screen rays: only with the sun in or near the frame
  let rk=0; if(HD.shader&&place&&HD.rays){ try{ const d=LOOK.sunDir, v=new THREE.Vector3(camera.position.x+d[0]*600,camera.position.y+d[1]*600,camera.position.z+d[2]*600).project(camera); if(v.z<1&&isFinite(v.x)&&isFinite(v.y)){ const sx=v.x*.5+.5, sy=v.y*.5+.5, off=Math.max(0,Math.abs(sx-.5)-.5,Math.abs(sy-.5)-.5); rk=Math.max(0,1-off*4); u.sunUV.value.set(sx,sy); const c=new THREE.Color(LOOK.sunCol||'#ffffff'); u.rayCol.value.set(c.r,c.g,c.b); } }catch(e){} }
  if(HD.shader) u.rays.value=lerp(u.rays.value,rk,Math.min(1,dt*4));
  // shafts
  const wantS=place&&HD.shafts&&!tps, fight=hdFighting();
  if(wantS&&!HD.cards){ HD.cards=[]; for(let i=0;i<7;i++){ const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:hdShaftTex(),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide})); m.renderOrder=3; scene.add(m); HD.cards.push({m,x:0,z:0,ph:rnd(0,6.28),w:rnd(1.6,3.4),h:rnd(11,16),a:0,live:0}); } }
  if(HD.cards){ if(HD.cards.length&&!HD.cards[0].m.parent) HD.cards.forEach(o=>scene.add(o.m)); const d=wantS?LOOK.sunDir:[0,1,0], lean=Math.max(-.6,Math.min(.6,-d[0]*.55)), col=wantS?new THREE.Color(LOOK.sunCol||'#ffffff').lerp(new THREE.Color(0xffffff),.55):null, base=fight?.035:.075;
    for(const o of HD.cards){ if(wantS&&(!o.live||Math.abs(o.x-P.x)>17||Math.abs(o.z-P.z)>12)){ o.live=1; o.x=P.x+rnd(-15,15); o.z=P.z+rnd(-10,8); o.a=0; }
      o.a=lerp(o.a,wantS?base*(.6+.4*Math.sin(HD.t*.7+o.ph)):0,Math.min(1,dt*1.5)); o.m.visible=o.a>.004; if(!o.m.visible) continue;
      const gy=groundY(o.x,o.z); o.m.position.set(o.x+lean*o.h*.5,gy+o.h*.5,o.z); o.m.scale.set(o.w,o.h,1); o.m.rotation.set(-.35,0,-lean); o.m.material.opacity=o.a; if(col) o.m.material.color.copy(col); } }
  // mist (exploring only)
  const wantM=place&&HD.mist&&!tps&&!fight&&!Game.script;
  if(wantM&&!HD.fog){ HD.fog=[]; for(let i=0;i<5;i++){ const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:hdMistTex(),transparent:true,opacity:0,depthWrite:false,fog:false})); m.rotation.x=-Math.PI/2; m.renderOrder=1; scene.add(m); HD.fog.push({m,x:0,z:0,vx:rnd(-.3,.3),vz:rnd(-.15,.15),s:rnd(9,15),a:0,live:0}); } }
  if(HD.fog){ if(HD.fog.length&&!HD.fog[0].m.parent) HD.fog.forEach(o=>scene.add(o.m)); const fc=wantM?new THREE.Color(LOOK.fog[0]).lerp(new THREE.Color(0xffffff),.55):null;
    for(const o of HD.fog){ if(wantM&&(!o.live||Math.abs(o.x-P.x)>20||Math.abs(o.z-P.z)>15)){ o.live=1; o.x=P.x+rnd(-16,16); o.z=P.z+rnd(-11,11); o.a=0; } o.x+=o.vx*dt; o.z+=o.vz*dt;
      o.a=lerp(o.a,wantM?.085:0,Math.min(1,dt*1.2)); o.m.visible=o.a>.004; if(!o.m.visible) continue; o.m.position.set(o.x,groundY(o.x,o.z)+.45,o.z); o.m.scale.set(o.s,o.s,1); o.m.material.opacity=o.a; if(fc) o.m.material.color.copy(fc); } } }
(function(){ const uc=updateCamera; updateCamera=function(dt){ const r=uc.apply(this,arguments); try{ hdFrame(Math.max(0,Math.min(.05,dt||1/60))); }catch(e){ console.error('hd2d',e); } return r; }; })();
