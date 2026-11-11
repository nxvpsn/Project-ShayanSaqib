// =====================================================================
// BLACK HOLES PULL (added on top of their look, nothing replaced): every hole gets a suction dressing that animates itself:
// three thin rings that keep contracting into it (fading in at the rim, gone at the core) and a spiral of arms turning
// under them. Mini holes and the duo's/Hamza's holes (twHoleVis), Omar's solo Collapse (TW.bh), Nathan's (nbMakeBH).
// The meshes drive themselves from onBeforeRender, so no update hook can be left running.
// =====================================================================
function bhSpiralTex(){ if(TW._bhSp) return TW._bhSp; const S=128, cv=document.createElement('canvas'); cv.width=cv.height=S; const c=cv.getContext('2d');
  try{ c.lineCap='round'; for(let arm=0;arm<3;arm++){ for(let i=0;i<60;i++){ const u=i/60, a=arm*2.094+u*5.2, r=4+u*58, a2=arm*2.094+(u+1/60)*5.2, r2=4+(u+1/60)*58; c.strokeStyle='rgba(255,255,255,'+(.75*(1-u)).toFixed(2)+')'; c.lineWidth=1+3.5*(1-u);
        c.beginPath(); c.moveTo(S/2+Math.cos(a)*r,S/2+Math.sin(a)*r); c.lineTo(S/2+Math.cos(a2)*r2,S/2+Math.sin(a2)*r2); c.stroke(); } } }catch(e){}
  const t=new THREE.CanvasTexture(cv); TW._bhSp=t; return t; }
function bhSuction(col){ const g=new THREE.Group(); g.rotation.x=-Math.PI/2; g.userData.bhs=1;
  for(let i=0;i<3;i++){ const m=new THREE.Mesh(new THREE.RingGeometry(.93,1,48),new THREE.MeshBasicMaterial({color:i%2?0xffffff:(col||0xb06aff),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
    m.onBeforeRender=function(){ const u=((performance.now()/1000)*.9+i/3)%1, e=u*u; this.scale.setScalar(Math.max(.05,5.2-4.2*e)); this.material.opacity=Math.max(0,Math.min(1,u*4)*(1-e)*.7); }; g.add(m); }
  const sp=new THREE.Mesh(new THREE.PlaneGeometry(9,9),new THREE.MeshBasicMaterial({map:bhSpiralTex(),color:col||0xb06aff,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  sp.position.z=-.05; sp.onBeforeRender=function(){ this.rotation.z=-(performance.now()/1000)*3.2; const p=1+.06*Math.sin(performance.now()/90); this.scale.setScalar(p); }; g.add(sp); return g; }
// twHoleVis: the dressing rides the hole's own scale
(function(){ const hv=twHoleVis; twHoleVis=function(x,y,z,r){ const V=hv.apply(this,arguments); try{ if(V&&V.set&&!V.bhs){ const g=bhSuction(); g.userData.tw=1; g.visible=false; scene.add(g); V.bhs=g; const st=V.set, kl=V.kill;
        V.set=function(k){ const q=st.apply(this,arguments); try{ const s=Math.max(.01,this.r*k); g.visible=k>.08; g.position.set(this.x,this.y,this.z); g.scale.setScalar(s); }catch(e){} return q; };
        V.kill=function(){ try{ scene.remove(g); }catch(e){} return kl.apply(this,arguments); }; } }catch(e){ console.error('bh suction',e); } return V; }; })();
// Omar's solo Collapse
(function(){ const tu=twUpdate; twUpdate=function(dt){ const r=tu.apply(this,arguments); try{ const B=TW.bh, S=TW._bhS; if(B&&B.live){ if(!S||S.b!==B){ if(S) scene.remove(S.g); const g=bhSuction(); g.userData.tw=1; scene.add(g); TW._bhS={b:B,g}; }
        const g=TW._bhS.g; g.position.set(B.x,groundY(B.x,B.z)+1.5,B.z); g.scale.setScalar(1.9); } else if(S){ scene.remove(S.g); TW._bhS=null; } }catch(e){ console.error('bh suction 2',e); } return r; }; })();
// Nathan's
(function(){ const mk=nbMakeBH; nbMakeBH=function(){ const bh=mk.apply(this,arguments); try{ if(bh&&bh.add){ const g=bhSuction(); g.scale.setScalar(6); bh.add(g); } }catch(e){ console.error('bh suction 3',e); } return bh; }; })();
