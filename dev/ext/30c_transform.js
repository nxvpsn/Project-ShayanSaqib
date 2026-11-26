// =====================================================================
// THE SOLO TWINS' TRANSFORMATIONS, staged (30_solo's transition script calls these in place of its old "wait, burst, card"):
//  caoMagical(T)   Caotan I->II  a magical-girl sequence: he rises spinning in white on a pink sunburst, three beats
//                  (rings + hearts, each from a new angle), then the flash and the hero shot in the new form
//  caoUnchained(T) Caotan II->III four chains hold him to the ground; they snap one by one; a pillar of light; the new form
//  omDarkness(T)   Omar I->II    feathers of shadow pour into him, a black cocoon closes, cracks of violet light,
//                  it bursts: wings out, black against the moon
// Everything they put in the scene is theirs to remove (st.dead); meshes carry userData.tw so a retry clears them too.
// =====================================================================
function tfSunTex(a,b){ return twTex('tfsun'+a+b,96,96,c=>{ c.clearRect(0,0,96,96); for(let i=0;i<16;i++){ c.fillStyle=i%2?a:b; c.globalAlpha=i%2?.9:.55; c.beginPath(); c.moveTo(48,48); c.arc(48,48,47,i/16*6.2832,(i+.62)/16*6.2832); c.closePath(); c.fill(); } c.globalAlpha=1; c.globalCompositeOperation='destination-out'; const g=c.createRadialGradient(48,48,30,48,48,48); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,1)'); c.fillStyle=g; c.fillRect(0,0,96,96); c.globalCompositeOperation='source-over'; },false); }
function tfMoonDir(T){ const SM=L.skyMoon; let dx=(SM?SM.position.x:T.x-20)-T.x, dz=(SM?SM.position.z:T.z-90)-T.z; const d=Math.hypot(dx,dz)||1; return [dx/d,dz/d]; }
function* caoMagical(T){ const gy=groundY(T.x,T.z), st={t:0,dead:0,k:0,spin:0,white:0}, sun=twBB(tfSunTex('#ff6ab0','#ffd0ec'),30,30,{add:true,op:0}), disc=twGlow(0xff6ab0,1); sun.userData.tw=1; const lf=T.lockF; T.lockF=1;
  Game.fxUpd.push(dt=>{ try{ if(st.dead){ scene.remove(sun); scene.remove(disc); return false; } dt=Math.max(0,dt||1/60); st.t+=dt; sun.position.set(T.x,T.y+1.6,T.z-3.5); sun.quaternion.copy(camera.quaternion); sun.rotateZ(st.t*.9); sun.material.opacity=Math.max(0,st.k)*.8;
      disc.position.set(T.x,T.y+1.6,T.z-1.2); disc.scale.setScalar(5+st.k*9); disc.material.opacity=Math.max(0,st.k)*.45; if(st.spin) T.f=Math.sin(st.t*st.spin)>0?1:-1; if(st.white) T.flash=.2;
      if(st.k>.2) for(let i=0;i<2;i++){ const a=st.t*8+i*3.14, h=(st.t*2.6+i*1.7)%3.8; FX.spawn(T.x+Math.cos(a)*1.4,T.y-.2+h,T.z+Math.sin(a)*1.4,0,.5,0,.55,i?0xffffff:0xff6ab0,.34,0,true); FX.spawn(T.x+rnd(-5,5),T.y+rnd(-1,5),T.z-2+rnd(-2,1),0,rnd(1,3),0,.7,0xffd0ec,.22,0,true); } return true; }catch(e){ console.error('caoMagical',e); return false; } });
  Sound.sfx('sparkle'); Sound.sfx('choir'); grade.uniforms.tint.value.set(1.12,.9,1.06); cineSet(T.x+.8,gy+.7,T.z+8,T.x,gy+3.4,T.z); st.spin=12; st.white=1;
  yield tween(st,{k:1},.5); yield tween(T,{hy:3.1},.8,t=>{ t=Math.min(1,t); return t*(2-t); });
  const shots=[[2.8,2.6,5.4],[-3.4,5.2,4.6],[.4,7.6,3.6]];
  for(let i=0;i<3;i++){ const s=shots[i]; cineSet(T.x+s[0],gy+s[1],T.z+s[2],T.x,T.y+1.3,T.z); for(let k=0;k<2;k++) FX.ring(T.x,T.y+.3+i*1.1,T.z,k?'#ffffff':'#ff6ab0',2.2+k*1.2,.45);
    for(let k=0;k<26;k++){ const a=rnd(0,6.28); FX.spawn(T.x,T.y+.4+i*1.1,T.z,Math.cos(a)*rnd(2,6),rnd(-1,3),Math.sin(a)*rnd(2,6),rnd(.4,.8),k%2?0xff6ab0:0xffd0ec,.3,3,true); }
    Sound.sfx('ting'); Sound.sfx('kyun'); impactFrame([[2,1],[1,1]]); shake(.3); st.spin=14+i*8; yield wait(.42); }
  st.spin=46; cineSet(T.x,gy+2.4,T.z+6.5,T.x,T.y+1.3,T.z); yield wait(.35);
  FX.flash=1; grade.uniforms.flashCol.value.set(1,.85,.95); impactFrame([[1,2],[3,2],[2,2]]); Sound.sfx('crossboom'); Sound.sfx('sparkle'); shake(.9); T.form=2; T.tint=0xffe8f4; st.spin=0; st.white=0; T.f=1; T.cast=2.5;
  FX.burst(T.x,T.y+1.5,T.z,90,0xff6ab0,9,.5); FX.burst(T.x,T.y+1.5,T.z,60,0xffffff,7,.4); for(let k=0;k<3;k++) FX.ring(T.x,gy+.1,T.z,k%2?'#ffffff':'#ff6ab0',5+k*3,.6+k*.15); twHeartBurst(T.x,T.z,60);
  cineSet(T.x-1.4,gy+.9,T.z+5.6,T.x,T.y+1.5,T.z); yield cineTo([T.x+.9,gy+1.4,T.z+8.6],[T.x,gy+2.9,T.z],1.3,t=>{ t=Math.min(1,t); return t*(2-t); });
  yield tween(T,{hy:1.3},.5,t=>{ t=Math.min(1,t); return t*t; }); yield tween(st,{k:0},.4); st.dead=1; T.lockF=lf||0; }
function* caoUnchained(T){ const gy=groundY(T.x,T.z), st={t:0,dead:0,on:[0,0,0,0],pil:0,strain:0}, ch=[], an=[[-3.4,-1.2],[3.4,-1.2],[-2.6,1.6],[2.6,1.6]]; const lf=T.lockF; T.lockF=1;
  for(let i=0;i<4;i++){ const b=beamMesh(i%2?0xff8ac0:0xffffff,.13); /* bright: dark chains vanished against the night sky on film */ b.userData.tw=1; b.visible=false; scene.add(b); ch.push(b); } const pil=[beamMesh(0xff3a8a,1),beamMesh(0xffffff,.45)]; pil.forEach(m=>{ m.userData.tw=1; m.visible=false; scene.add(m); });
  Game.fxUpd.push(dt=>{ try{ if(st.dead){ ch.forEach(b=>scene.remove(b)); pil.forEach(m=>scene.remove(m)); return false; } dt=Math.max(0,dt||1/60); st.t+=dt; const jx=st.strain?rnd(-.05,.05)*st.strain:0;
      ch.forEach((b,i)=>{ b.visible=!!st.on[i]; if(!b.visible) return; const a=an[i]; twBeamTo(b,T.x+a[0],gy,T.z+a[1],T.x+(a[0]>0?.5:-.5)+jx,T.y+(i<2?1.9:.9),T.z,1+.2*Math.sin(st.t*40+i)); if(Math.random()<.3) FX.spawn(T.x+a[0]*rnd(.2,1),lerp(gy,T.y+1.4,rnd(0,1)),T.z+a[1]*rnd(.2,1),0,.4,0,.3,0xff3a8a,.16,0,true); });
      pil.forEach((m,i)=>{ m.visible=st.pil>.01; if(m.visible) twBeamTo(m,T.x,gy,T.z,T.x,gy+46,T.z,Math.max(.01,st.pil*(i?1:2.4)*(1+.08*Math.sin(st.t*60)))); }); if(st.strain) T.push=.2; if(Cam.cine&&st.follow) Cam.cine.ly=T.y+1.5; return true; }catch(e){ console.error('caoUnchained',e); return false; } });
  st.follow=1; Sound.sfx('doki'); cineSet(T.x-4,gy+1.6,T.z+9.5,T.x,T.y+1.5,T.z); yield tween(T,{hy:2.6},.9,t=>{ t=Math.min(1,t); return t*(2-t); });
  // the chains bite
  cineSet(T.x,gy+1.4,T.z+11.5,T.x,T.y+.6,T.z); st.follow=0; for(let i=0;i<4;i++){ st.on[i]=1; Sound.sfx('crash'); shake(.35); FX.burst(T.x+an[i][0],gy+.2,T.z+an[i][1],16,0x7a1838,4,.3,false); yield wait(.13); }
  yield wait(.3); st.strain=1; Sound.sfx('doki'); yield cineTo([T.x+.6,gy+1.6,T.z+6.2],[T.x,T.y+1.4,T.z],.9,t=>{ t=Math.min(1,t); return t*t; }); st.strain=2.2; Sound.sfx('doki'); yield wait(.35);
  // and break, one by one
  const cams=[[-4.5,3.4,6.2],[4.6,2.6,6.4],[-3,1.6,7.4],[0,3.6,9]];
  for(let i=0;i<4;i++){ const a=an[i], c=cams[i]; cineSet(T.x+c[0],gy+c[1],T.z+c[2],T.x,T.y+1.3,T.z); st.on[i]=0; Sound.sfx('shatter'); Sound.sfx('ting'); impactFrame([[2,1],[1,1]]); shake(.5); FX.hitstop=Math.max(FX.hitstop,.05);
    for(let k=0;k<22;k++){ const u=Math.random(); FX.spawn(T.x+a[0]*u,lerp(gy,T.y+1.4,1-u),T.z+a[1]*u,rnd(-4,4),rnd(1,6),rnd(-3,3),rnd(.4,.8),k%2?0x7a1838:0xff3a8a,.24,12,false); } FX.ring(T.x,T.y+1.2,T.z,'#ff3a8a',2.4+i*.6,.4); yield wait(i<3?.24:.4); }
  st.strain=0; yield* twGlint(T,2,.12,1);
  // the pillar
  cineSet(T.x-1.2,gy+1,T.z+11,T.x,gy+5,T.z); FX.flash=.9; grade.uniforms.flashCol.value.set(1,.4,.6); impactFrame([[3,2],[1,2],[2,2],[1,1]]); Sound.sfx('crossboom'); Sound.sfx('beam'); shake(1.3); T.form=3; T.tint=0xffd8f0; T.cast=2.5; T.scale=1.35;
  for(let k=0;k<90;k++){ const a=rnd(0,6.28); FX.spawn(T.x,T.y+1.4,T.z,Math.cos(a)*rnd(3,10),rnd(-2,8),Math.sin(a)*rnd(3,10),rnd(.5,1.1),k%3?0xff3a8a:0xffffff,.3,6,true); } for(let k=0;k<3;k++) FX.ring(T.x,gy+.1,T.z,k%2?'#ffffff':'#ff3a8a',6+k*4,.6+k*.15);
  yield tween(st,{pil:1},.16); yield wait(.5); yield tween(st,{pil:0},.5,t=>{ t=Math.min(1,t); return t*t; }); yield tween(T,{scale:1},.4); st.dead=1; T.lockF=lf||0; }
function* omDarkness(T){ const gy=groundY(T.x,T.z), [dx,dz]=tfMoonDir(T), st={t:0,dead:0,pull:0,coc:0,cr:0}, crk=[], HY=gy+3+2.3, cam=d=>[T.x-dx*d,HY-d*.114,T.z-dz*d], far=[T.x+dx*40,HY+40*.114,T.z+dz*40]; /* lens, his head and the sky's moon in one line: the moon is his halo in every shot */
  const coc=new THREE.Mesh(new THREE.SphereGeometry(1,18,14),new THREE.MeshBasicMaterial({color:0x05030a,fog:false})); coc.userData.tw=1; coc.visible=false; scene.add(coc);
  for(let i=0;i<7;i++){ const b=beamMesh(i%2?0xb06aff:0xffffff,.045); b.userData.tw=1; b.visible=false; scene.add(b); const a=rnd(0,6.28), e=rnd(-.9,.9); crk.push({b,v:[Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e)]}); }
  Game.fxUpd.push(dt=>{ try{ if(st.dead){ scene.remove(coc); crk.forEach(c=>scene.remove(c.b)); return false; } dt=Math.max(0,dt||1/60); st.t+=dt; const cy=T.y+1.7;
      if(st.pull>0) for(let i=0;i<Math.round(9*st.pull);i++){ const a=rnd(0,6.28), r=rnd(7,11), h=rnd(-1,6), sp=rnd(7,11); FX.spawn(T.x+Math.cos(a)*r,cy+h,T.z+Math.sin(a)*r*.7,-Math.cos(a)*sp,-h*.9,-Math.sin(a)*sp*.7,.95,i%4?0x0a0410:0x5a2a9a,rnd(.3,.5),0,false); }
      coc.visible=st.coc>.01; if(coc.visible){ const s=1.75*st.coc*(1+.03*Math.sin(st.t*50)); coc.position.set(T.x,cy,T.z); coc.scale.set(s*.85,s,s*.85); }
      crk.forEach((c,i)=>{ c.b.visible=i<st.cr; if(c.b.visible) twBeamTo(c.b,T.x,cy,T.z,T.x+c.v[0]*2.7,cy+c.v[1]*2.7,T.z+c.v[2]*2.7,1+.4*Math.sin(st.t*70+i)); }); return true; }catch(e){ console.error('omDarkness',e); return false; } });
  // the moon behind him; the dark comes in from everywhere
  cineSet(...cam(16),...far); Sound.sfx('howl'); Sound.sfx('void'); st.pull=.5; yield tween(T,{hy:3},1,t=>{ t=Math.min(1,t); return t*(2-t); }); st.pull=1; shake(.4);
  yield cineTo(cam(11),far,.9,t=>{ t=Math.min(1,t); return t*t*(3-2*t); });
  // the cocoon
  Sound.sfx('suck'); yield tween(st,{coc:1},.32,t=>{ t=Math.min(1,t); return t*t; }); T.hide=1; st.pull=0; shake(.5); impactFrame([[1,1]]); yield wait(.55);
  for(let i=0;i<7;i++){ st.cr=i+1; Sound.sfx('ting'); if(i%2) Sound.sfx('shatter'); shake(.2+i*.06); FX.flash=Math.max(FX.flash,.1+i*.03); grade.uniforms.flashCol.value.set(.7,.4,1); yield wait(i<4?.16:.09); }
  yield wait(.25);
  // it bursts
  cineSet(...cam(9.5),...far); st.coc=0; st.cr=0; T.hide=0; T.form=2; T.cast=2.5; FX.flash=.85; grade.uniforms.flashCol.value.set(.6,.3,1); impactFrame([[2,2],[3,2],[1,2]]); Sound.sfx('crossboom'); Sound.sfx('howl'); shake(1.3); FX.hitstop=Math.max(FX.hitstop,.08);
  for(let k=0;k<150;k++){ const a=rnd(0,6.28), e=rnd(-.4,1.2), sp=rnd(4,13); FX.spawn(T.x,T.y+1.7,T.z,Math.cos(a)*Math.cos(e)*sp,Math.sin(e)*sp,Math.sin(a)*Math.cos(e)*sp*.7,rnd(.6,1.3),k%4?0x0a0410:0x8a3aff,rnd(.3,.55),k%4?5:0,k%4===0); }
  for(let k=0;k<3;k++) FX.ring(T.x,gy+.1,T.z,k%2?'#1a0a2a':'#8a3aff',7+k*4,.7+k*.15);
  yield wait(.5); yield* twGlint(T,2,.14,1); yield cineTo(cam(13),far,1.2,t=>{ t=Math.min(1,t); return t*(2-t); });
  yield tween(T,{hy:1.3},.45,t=>{ t=Math.min(1,t); return t*t; }); st.dead=1; }
