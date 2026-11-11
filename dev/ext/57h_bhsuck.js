// =====================================================================
// BLACK HOLES PULL (added on top of their look, nothing replaced): every hole gets a quiet suction dressing: small motes of
// light falling into it on inward spirals (faster the closer they get) and a few wisps, which are short fading trails of
// the same soft dots. No rings, no drawn shapes. Mini holes and the duo's/Hamza's holes (twHoleVis), Omar's solo Collapse
// (TW.bh), Nathan's (nbMakeBH). One hidden driver mesh animates the lot from onBeforeRender: no update hook to leave running.
// =====================================================================
function bhDotTex(){ if(TW._bhDot) return TW._bhDot; const S=32, cv=document.createElement('canvas'); cv.width=cv.height=S; const c=cv.getContext('2d');
  try{ const g=c.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.35,'rgba(255,255,255,.45)'); g.addColorStop(1,'rgba(255,255,255,0)'); c.fillStyle=g; c.fillRect(0,0,S,S); }catch(e){}
  const t=new THREE.CanvasTexture(cv); TW._bhDot=t; return t; }
function bhSuction(col){ const g=new THREE.Group(); g.rotation.x=-Math.PI/2; g.userData.bhs=1; const P=[], tint=col||0xc9a8ff;
  const dot=(c,wisp,lag,k)=>{ const m=new THREE.Sprite(new THREE.SpriteMaterial({map:bhDotTex(),color:c,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); m.scale.setScalar(.01); g.add(m); return {m,wisp,lag,k}; };
  for(let i=0;i<14;i++) P.push({a:Math.random()*6.283,ph:Math.random(),sp:.34+Math.random()*.22,R:3.4+Math.random()*2,h:(Math.random()-.5)*2.2,sz:.07+Math.random()*.06,d:[dot(i%3?0xffffff:tint,0,0,1)]});
  for(let i=0;i<5;i++){ const d=[]; for(let j=0;j<6;j++) d.push(dot(j%2?tint:0xffffff,1,j*.022,1-j/6.5)); P.push({a:i*1.2566+Math.random()*.5,ph:Math.random(),sp:.26+Math.random()*.1,R:4.2+Math.random()*1.4,h:(Math.random()-.5)*1.4,sz:.15,d}); }
  const drv=new THREE.Mesh(new THREE.PlaneGeometry(.01,.01),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})); drv.frustumCulled=false;
  drv.onBeforeRender=function(){ try{ const t=performance.now()/1000; for(const p of P) for(const o of p.d){ let u=(t*p.sp+p.ph-o.lag)%1; if(u<0) u+=1; const e=u*u, r=Math.max(.3,p.R*(1-e)+.3*e), an=p.a+e*5.4;
        o.m.position.set(Math.cos(an)*r,Math.sin(an)*r,p.h*(1-e)); const fade=Math.max(0,Math.min(1,u*5)*(1-e*e)); o.m.material.opacity=fade*(o.wisp?.3*o.k:.8); o.m.scale.setScalar(Math.max(.005,p.sz*o.k*(.6+.4*(1-e)))); } }catch(e){} };
  g.add(drv); return g; }
// twHoleVis: the dressing rides the hole's own scale
(function(){ const hv=twHoleVis; twHoleVis=function(x,y,z,r){ const V=hv.apply(this,arguments); try{ if(V&&V.set&&!V.bhs){ const g=bhSuction(); g.userData.tw=1; g.visible=false; scene.add(g); V.bhs=g; const st=V.set, kl=V.kill;
        V.set=function(k){ const q=st.apply(this,arguments); try{ const s=Math.max(.01,this.r*k); g.visible=k>.08; g.position.set(this.x,this.y,this.z); g.scale.setScalar(s); }catch(e){} return q; };
        V.kill=function(){ try{ scene.remove(g); }catch(e){} return kl.apply(this,arguments); }; } }catch(e){ console.error('bh suction',e); } return V; }; })();
// Omar's solo Collapse
(function(){ const tu=twUpdate; twUpdate=function(dt){ const r=tu.apply(this,arguments); try{ const B=TW.bh, S=TW._bhS; if(B&&B.live){ if(!S||S.b!==B){ if(S) scene.remove(S.g); const g=bhSuction(); g.userData.tw=1; scene.add(g); TW._bhS={b:B,g}; }
        const g=TW._bhS.g; g.position.set(B.x,groundY(B.x,B.z)+1.5,B.z); g.scale.setScalar(1.9); } else if(S){ scene.remove(S.g); TW._bhS=null; } }catch(e){ console.error('bh suction 2',e); } return r; }; })();
// Nathan's
(function(){ const mk=nbMakeBH; nbMakeBH=function(){ const bh=mk.apply(this,arguments); try{ if(bh&&bh.add){ const g=bhSuction(); g.scale.setScalar(6); bh.add(g); } }catch(e){ console.error('bh suction 3',e); } return bh; }; })();
