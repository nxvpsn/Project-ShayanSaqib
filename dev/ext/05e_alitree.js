// =====================================================================
// ALI'S TREE: in Lanternbrook, Ali (still the NPC, on Shayan's road) waits on top of a towering sacred tree that grows
// out of his stone platform. Paper talismans with red characters hang all around the trunk on straw ropes, and black
// katanas are driven into it. His hit box stays at the foot of the tree (hit the trunk to hit him, as before); only
// his sprite sits on top (`n.perch`). Near the tree the camera eases up and out so he stays in frame.
// In aliAwaken he drops from the top (41_moon.js). On Ali's own road the tree stands empty.
// =====================================================================
const ALT_TREE={x:35.1,z:16.6,h:6.2,k:0};
function aliTreeY(){ const L0=L; return (L0&&L0.aliTree?L0.aliTree.top:3+ALT_TREE.h+.2); }
function atBarkTex(){ if(atBarkTex.t) return atBarkTex.t; const [cv,c]=mkCanvas(32,64); c.fillStyle='#4a3424'; c.fillRect(0,0,32,64);
  for(let i=0;i<26;i++){ const x=Math.floor(hash(i,3)*30), y=Math.floor(hash(3,i)*58), h=4+Math.floor(hash(i,4)*14); c.fillStyle=i%3?'#2e2016':'#5e4430'; c.fillRect(x,y,1+(i%2),h); }
  for(let i=0;i<10;i++){ c.fillStyle='rgba(120,150,90,.5)'; c.fillRect(Math.floor(hash(i,6)*30),Math.floor(hash(6,i)*62),2,1); }
  const t=tex(cv,1); t.repeat.set(3,4); return atBarkTex.t=t; }
const AT_KANJI=['封','魔','滅','斬','神','鬼','呪','月','刀','闇','護','急','妖','禁','雷','霊','死','龍','罰','邪'];
function atTalismanTex(i){ const k='at'+i; if(atTalismanTex[k]) return atTalismanTex[k]; const [cv,c]=mkCanvas(16,44);
  c.fillStyle='#eee4c8'; c.fillRect(0,0,16,44); c.fillStyle='#d8cca8'; for(let y=0;y<44;y+=3) c.fillRect(0,y,16,1);
  c.fillStyle='#b8141c'; c.fillRect(0,0,16,2); c.fillRect(0,42,16,2); c.fillRect(1,2,1,40); c.fillRect(14,2,1,40);
  c.font='bold 11px serif'; c.textAlign='center'; c.textBaseline='middle';
  for(let j=0;j<3;j++){ c.fillText(AT_KANJI[Math.floor(hash(i,j+11)*AT_KANJI.length)],8,9+j*12); }
  c.beginPath(); c.arc(8,38,2.5,0,7); c.fill();
  const t=tex(cv); t.magFilter=THREE.NearestFilter; return atTalismanTex[k]=t; }
function atKatana(G,x,y,z,ang,tilt){ const g=new THREE.Group(), blk=new THREE.MeshPhongMaterial({color:0x0c0c12,specular:0x5a5a78,shininess:60}), edge=new THREE.MeshBasicMaterial({color:0x3a3a4a}),
    gold=new THREE.MeshLambertMaterial({color:0x4a3414}), wrap=new THREE.MeshLambertMaterial({color:0x1a0a0e}), dia=new THREE.MeshLambertMaterial({color:0x8a1420});
  const b=new THREE.Mesh(new THREE.BoxGeometry(.035,.09,1.15),blk); b.position.z=.15; g.add(b); const e=new THREE.Mesh(new THREE.BoxGeometry(.04,.012,1.1),edge); e.position.set(0,-.045,.15); g.add(e);
  const ts=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.03,10),gold); ts.rotation.x=Math.PI/2; ts.position.z=.74; g.add(ts);
  const hd=new THREE.Mesh(new THREE.BoxGeometry(.05,.06,.34),wrap); hd.position.z=.93; g.add(hd);
  for(let k=0;k<4;k++){ const d=new THREE.Mesh(new THREE.BoxGeometry(.055,.03,.03),dia); d.position.set(0,.03,.8+k*.07); g.add(d); }
  const out=new THREE.Vector3(Math.cos(ang),Math.sin(tilt),Math.sin(ang)); g.position.set(x,y,z); g.lookAt(x+out.x,y+out.y,z+out.z); g.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); G.root.add(g); return g; }
function aliTreeBuild(G){ const X=ALT_TREE.x, Z=ALT_TREE.z, y0=groundY(X,Z), H=ALT_TREE.h, bark=new THREE.MeshLambertMaterial({map:atBarkTex(),flatShading:true});
  const rAt=y=>lerp(.62,.3,clamp((y-y0)/H,0,1)), lean=y=>Math.sin((y-y0)*.5)*.12;
  // trunk: stacked tapered segments with a slight wander, flared roots
  const N=7; for(let i=0;i<N;i++){ const ya=y0+i*H/N, yb=ya+H/N, m=new THREE.Mesh(new THREE.CylinderGeometry(rAt(yb),rAt(ya),H/N+.05,9),bark); m.position.set(X+lean(ya+H/N/2),ya+H/N/2,Z); m.castShadow=true; G.root.add(m); }
  for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+.3, r=new THREE.Mesh(new THREE.ConeGeometry(.22,1.2,5),bark); r.position.set(X+Math.cos(a)*.62,y0+.18,Z+Math.sin(a)*.62); r.rotation.set(0,0,0); r.lookAt(X+Math.cos(a)*2,y0-.5,Z+Math.sin(a)*2); r.rotateX(Math.PI/2); G.root.add(r); }
  // a few gnarled branches and a crown he stands on
  for(let i=0;i<5;i++){ const a=i*1.3+.4, yy=y0+H*(.55+i*.08), br=new THREE.Mesh(new THREE.CylinderGeometry(.06,.13,1.4,6),bark); br.position.set(X+Math.cos(a)*.55,yy+.3,Z+Math.sin(a)*.55); br.lookAt(X+Math.cos(a)*2,yy+1.2,Z+Math.sin(a)*2); br.rotateX(Math.PI/2); G.root.add(br); }
  const lv=[0x24502a,0x2e6232,0x1c4024].map(c=>new THREE.MeshLambertMaterial({color:c,flatShading:true})), top=y0+H;
  [[0,.1,0,1.25],[.9,-.25,.3,.9],[-.85,-.3,-.2,.95],[.2,-.45,.85,.8],[-.3,-.4,-.85,.85],[.75,-.6,-.6,.7],[-.7,-.65,.6,.7]].forEach(([dx,dy,dz,s],i)=>{ const m=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),lv[i%3]); m.position.set(X+dx+lean(top),top+dy,Z+dz); m.scale.y=.62; m.castShadow=true; G.root.add(m); });
  // straw ropes with the talismans hanging from them all around the trunk
  const rope=new THREE.MeshLambertMaterial({color:0xc8a860}), tal=[];
  for(const ry of [y0+1.3,y0+2.9,y0+4.5]){ const r=rAt(ry)+.05, t=new THREE.Mesh(new THREE.TorusGeometry(r,.06,6,18),rope); t.rotation.x=Math.PI/2; t.position.set(X+lean(ry),ry,Z); G.root.add(t);
    const n=14; for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+ry, px=X+lean(ry)+Math.cos(a)*(r+.04), pz=Z+Math.sin(a)*(r+.04);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(.2,.55),new THREE.MeshLambertMaterial({map:atTalismanTex(Math.floor(hash(i,Math.round(ry*10))*12)),side:THREE.DoubleSide,emissive:0x221810}));
      m.geometry.translate(0,-.275,0); const g=new THREE.Group(); g.position.set(px,ry-.02,pz); g.lookAt(X+lean(ry)+Math.cos(a)*5,ry-.02,Z+Math.sin(a)*5); g.add(m); m.rotation.x=-.12; G.root.add(g); tal.push({m,ph:hash(i,7)*6,a0:(hash(7,i)-.5)*.2}); } }
  // black katanas driven into the trunk
  for(let i=0;i<9;i++){ const a=i*2.1+.5, yy=y0+.9+hash(i,21)*(H-1.6), r=rAt(yy); atKatana(G,X+lean(yy)+Math.cos(a)*(r-.12),yy,Z+Math.sin(a)*(r-.12),a,(hash(21,i)-.5)*.9); }
  G.B[Math.floor(Z)][Math.floor(X)]=false; G.H[Math.floor(Z)][Math.floor(X)]=top+.42; /* the trunk is a climb: push into it from his platform and you mantle up to the crown, where he stands (97_mantle) */
  const T=G.aliTree={x:X,z:Z,y0,top:top+.42,tal,shake:0};
  G.anim.push(dt=>{ try{ const t=performance.now()/1000; T.shake=Math.max(0,T.shake-dt*1.5);
      for(const n of NPCS) if(n.who==='ali'){ if(n.perch===undefined) n.perch=1; if(n.perch) n.y=Player.y>y0+3?T.top:y0; } /* his hit box: at the foot while you're down there (talking), up on the crown once you've climbed (the swing's height check) */ for(const q of tal) q.m.rotation.z=q.a0+Math.sin(t*1.6+q.ph)*(.05+T.shake*.35);
      // keep Ali in frame while he is up there: the camera eases up and out near the tree
      const n=NPCS.find(o=>o.who==='ali'&&o.perch), d=Math.hypot(Player.x-X,Player.z-Z), want=n&&Game.state!=='title'?clamp((10-d)/5,0,1):0;
      ALT_TREE.k+=(want-ALT_TREE.k)*Math.min(1,dt*2); if(G.cam){ if(G.cam.up0==null) G.cam.up0=G.cam.up; G.cam.up=G.cam.up0+3*ALT_TREE.k; }
      if(ALT_TREE.k>.001||T.zoomed){ Cam.zoom=1+.35*ALT_TREE.k; T.zoomed=ALT_TREE.k>.001; } }catch(e){ console.error('ali tree',e); } });
  return T; }
(function(){ const vb=LEVELDEF.village; LEVELDEF.village=function(){ const G=vb.apply(this,arguments);
    try{ aliTreeBuild(G); const e=G.ents.find(o=>o.type==='npc'&&o.who==='ali'); if(e){ e.x=ALT_TREE.x; e.z=ALT_TREE.z; e.perch=1; }
      const h=G.pick.find(p=>p.kind==='heart'&&Math.abs(p.x-34.8)<.3&&Math.abs(p.z-16.4)<.3); if(h){ h.x=33.9; h.z=17.9; } }catch(e){ console.error('ali tree',e); }
    return G; }; })();
// up there he can only be struck from up there: a swing or a shot from the foot of the tree does nothing but tell you where he is
(function(){ const hn=hitNPC; hitNPC=function(n,dmg,ang){ try{ if(n&&n.who==='ali'&&n.perch&&L&&L.aliTree&&Math.abs(Player.y-L.aliTree.top)>1.6){ Sound.sfx('block'); FX.spark(n.x,L.aliTree.top+1.2,n.z); if(!(n.upHintT>Game.time-2)){ n.upHintT=Game.time; Game.dmgNums.push({x:n.x,y:L.aliTree.top+2.4,z:n.z,n:"HE'S UP THERE",t:0,col:'#9a9aa8'}); } return; } }catch(e){ console.error('ali up there',e); } return hn.apply(this,arguments); }; })();
// the NPC entry carries `perch` over to the spawned NPC
(function(){ const ds=drawSprites; drawSprites=function(){ ds.apply(this,arguments); try{ for(const n of NPCS){ if(n.who!=='ali') continue;
      
      if(n.perch&&L&&L.aliTree) n.spr.place(n.x,L.aliTree.top,n.z,L.aliTree.top); } }catch(e){ console.error('ali perch',e); } }; })();
// hitting the trunk shakes the talismans
(function(){ const as=aliStruck; aliStruck=function(n){ const r=as.apply(this,arguments); try{ if(L&&L.aliTree){ L.aliTree.shake=1; } }catch(e){} return r; }; })();
