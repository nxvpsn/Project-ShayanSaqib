// =====================================================================
// LANTERNBROOK, BIGGER (v1.92). The owner: "expand the size of the starting town... have the baker be near a bakery house, have
// the elder's house be bigger than others, have the VR tutorial guy next to a gaming arcade house... give every NPC and object
// some breathing room". The town was 40x24 with everything on one strip; it is 72x30 now, the same pieces spread out:
//   west   a cottage at the very end (the epilogue's "little house on the west end"), then the Elder's house (10x7, the tallest roof, a paved walk, banners, a little garden), the Elder, the straw dummy
//   then   the ARCADE (neon sign, two cabinets outside) with Kenji and his sign in front of it
//   middle the fountain square (Mira, Paul), wider than before
//   then   the BAKERY (awning, sign, bread baskets, the bread stall) with the baker beside it
//   east   a fourth house, the second stall, the old watchtower (the kid, Ali's tree), the arch out to Starfall Ridge
// This replaces the base LEVELDEF.village before the files that decorate it are loaded (05b lantern strings and house polish,
// 05e Ali's tree, 97 climbing, 98 Kenji): they work on whatever this builds. Places other files need are in G.spots
// (elder, trainer, tower) and G.lanternPosts. The cutscenes here are all relative to who is talking, so none of them moved.
// =====================================================================
const BT={W:72,D:30,pz:15,elder:{x:16.6,z:14.2},fount:{x:40,z:13.6},tower:{x:62,z:20}}; /* the old square's cutscene marks moved by +20,+3 (patched in build.py) */
function btSign(G,text,x,y,z,w,h,o){ o=o||{}; const [cv,c]=mkCanvas(o.cw||96,o.ch||28); R(c,0,0,cv.width,cv.height,o.bg||'#3a2416'); R(c,2,2,cv.width-4,cv.height-4,o.face||'#a8743e'); R(c,2,2,cv.width-4,2,o.hi||'#c89858'); c.font=o.font||'bold 16px monospace'; c.textAlign='center'; c.textBaseline='middle';
  if(o.glow){ c.fillStyle=o.glow; c.fillText(text,cv.width/2+1,cv.height/2+2); c.fillText(text,cv.width/2-1,cv.height/2); } c.fillStyle=o.ink||'#1a0e06'; c.fillText(text,cv.width/2,cv.height/2+1); if(o.paint) o.paint(c,cv);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),o.lit?new THREE.MeshBasicMaterial({map:tex(cv)}):new THREE.MeshLambertMaterial({map:tex(cv)})); m.position.set(x,y,z); G.root.add(m); return m; }
// an arcade cabinet: a dark box, a lit screen with a tiny game on it, a marquee, a control deck
function btCabinet(G,x,z,seed){ const body=solidMat([0x2a1f4a,0x1f3a4a][seed%2]), y=groundY(x,z); addBox(G,.7,1.55,.6,body,x,y,z); addBox(G,.74,.16,.3,solidMat(0x14101c),x,y+.78,z+.36);
  const [cv,c]=mkCanvas(24,20); R(c,0,0,24,20,'#060818'); if(seed%2){ for(let i=0;i<5;i++) R(c,3+i*4,3+(i%2),3,2,'#ff5a8a'); R(c,10,15,4,2,'#3ff4ff'); R(c,11,10,1,3,'#ffffff'); } else { R(c,0,14,24,6,'#2a6a3a'); R(c,4,10,3,4,'#ffd45a'); R(c,14,8,5,6,'#c84a3a'); R(c,20,3,2,2,'#ffffff'); R(c,8,4,2,2,'#ffffff'); }
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(.52,.44),new THREE.MeshBasicMaterial({map:tex(cv)})); scr.position.set(x,y+1.16,z+.31); G.root.add(scr);
  const [mc,mx]=mkCanvas(24,6); R(mx,0,0,24,6,seed%2?'#ff3a8a':'#3ff4ff'); R(mx,2,2,20,2,'#ffffff'); const mq=new THREE.Mesh(new THREE.PlaneGeometry(.66,.16),new THREE.MeshBasicMaterial({map:tex(mc)})); mq.position.set(x,y+1.47,z+.31); G.root.add(mq);
  G.lightSrc.push({x,y:y+1.2,z:z+.6,col:seed%2?0xff5a9a:0x5ad8ff,i:1.1,r:3.2,flick:1}); G.B[Math.floor(z)][Math.floor(x)]=true; }
LEVELDEF.village=function(){ const W=BT.W, D=BT.D, G=newGrid(W,D,'village'); G.tx=makeTileTextures('village'); Object.assign(G,{cam:{y:5.4,z:15.5,up:1.3},key:'village',look:'village',music:'village',name:'Lanternbrook',sub:'The Village of a Thousand Lanterns',spawn:[4,15.8]});
  blockB(G,0,0,W-1,4); blockB(G,0,D-2,W-1,D-1); blockB(G,0,0,0,D-1); blockB(G,W-1,0,W-1,D-1);
  boxT(G,0,15,W-1,16,'path'); const F=BT.fount; for(let z=0;z<D;z++) for(let x=0;x<W;x++) if(Math.hypot(x+.5-F.x,(z+.5-15.2)*1.15)<7) G.T[z][x]='cobble';
  /* paved walks from three doors down to the road */ for(const x of [15,16]) for(let z=12;z<15;z++) G.T[z][x]='cobble'; for(const x of [28,29]) for(let z=10;z<15;z++) G.T[z][x]='cobble'; for(const x of [50,51]) for(let z=10;z<15;z++) G.T[z][x]='cobble';
  const T=BT.tower; boxH(G,T.x,T.z,T.x+2,T.z+2,3,'flag'); boxH(G,T.x-2,T.z+1,T.x-1,T.z+1,1,'flag');
  buildTerrain(G,G.tx);
  // houses: the Elder's (the big one), the arcade, the bakery, a cottage
  const HS=[[2,5,6,4,3.2,15],[11,5,10,7,4.8,11],[25,5,8,5,3.8,12],[47,5,8,5,3.6,13],[59,5,7,5,3.3,14]]; HS.forEach(([x,z,w,d,h,s])=>destr(G,'house',[x,z,x+w,z+d,h+2],s===11?16:10,()=>addHouse(G,x,z,w,d,h,s)));
  destr(G,'fountain',[F.x-1.8,F.z-1.8,F.x+1.8,F.z+1.8],7,()=>addFountain(G,F.x,F.z));
  destr(G,'stall',[52,11,55,12,2.2],4,()=>addStall(G,52,11,'#c8423a')); destr(G,'stall',[53,21,56,22,2.2],4,()=>addStall(G,53,21,'#2e8a7e'));
  const LP=[[9,13.2],[23,13],[34.5,12.4],[45.5,12.4],[57,13.2],[67.5,13.2],[13,19.8],[30,21.2],[50,21],[68.5,18.6]]; LP.forEach(([x,z])=>destr(G,'lantern',[x-.2,z-.2,x+.7,z+.2,2.4],2,()=>addLantern(G,x,z))); G.lanternPosts=LP.slice(0,6);
  [[1.2,3,'oak'],[9.5,3,'blossom'],[23,2.8,'oak'],[34.5,3,'blossom'],[40,2.8,'oak'],[45.5,3,'blossom'],[57,2.8,'oak'],[67.5,3,'blossom'],[70.4,3.2,'oak'],[1.4,11,'oak'],[69.5,9,'blossom']].forEach(([x,z,k])=>destr(G,'tree',[x-.6,z-.4,x+.6,z+.4,4],3,()=>addTree(G,x,z,k,1.1)));
  [[36.2,9.6],[43.8,9.6]].forEach(([x,z])=>destr(G,'tree',[x-.6,z-.4,x+.6,z+.4,3.4],3,()=>{ addTree(G,x,z,'blossom',.85); G.B[Math.floor(z)][Math.floor(x)]=true; }));
  destr(G,'fence',[2,25.3,12,25.7,1],2,()=>addFence(G,2,12,25.5)); destr(G,'fence',[18,25.3,30,25.7,1],2,()=>addFence(G,18,30,25.5)); destr(G,'fence',[50,25.3,60,25.7,1],2,()=>addFence(G,50,60,25.5)); destr(G,'fence',[11,12.3,14,12.7,1],2,()=>addFence(G,11,14,12.5)); destr(G,'fence',[18,12.3,21,12.7,1],2,()=>addFence(G,18,21,12.5));
  [[6,22],[16,24],[24,22.6],[32,24.4],[48,24.6],[58,24],[1.5,19],[69,23],[66,25.4],[9.6,10.4]].forEach(([x,z])=>destr(G,'rock',[x-.4,z-.4,x+.4,z+.4,.6],2,()=>addRock(G,x,z,.35)));
  destr(G,'arch',[W-2.1,13.9,W-1.1,17.1,4],6,()=>addArch(G,W-1.6,15.5,0xffb24a));
  scatterTufts(G,0,[{kind:'grass',cols:['#4f8a32','#6dab45','#82bf52'],n:900,s:1},{kind:'flower',cols:['#f2c14e','#ec8fb0','#ffffff','#9fd0ff'],n:290,s:1},{kind:'tall',cols:['#3f7a2a','#5a9a3a'],n:160,s:1.3}],[1,5,W-1,D-2]);
  try{ // what makes each house its own place
    /* the Elder's: a crest over the door, two banners, a flower bed either side of the walk */ btSign(G,'ELDER HAMID',16,4.2,12.06,3.2,.7,{cw:120,ch:26,font:'bold 13px serif',face:'#6a5a8a',bg:'#2a2040',hi:'#9a8aba',ink:'#f2e6c8'});
    for(const bx of [12.4,19.6]){ const [bc,bx2]=mkCanvas(16,40); R(bx2,0,0,16,40,'#4a3a6a'); R(bx2,0,0,16,2,'#c9a24a'); R(bx2,5,10,6,6,'#e8d8a0'); R(bx2,7,12,2,2,'#4a3a6a'); for(let i=0;i<4;i++) R(bx2,i*4,36+(i%2)*2,4,4,'#4a3a6a'); const b=new THREE.Mesh(new THREE.PlaneGeometry(.8,2),new THREE.MeshLambertMaterial({map:tex(bc),transparent:true,alphaTest:.5})); b.position.set(bx,3.2,12.05); G.root.add(b); }
    for(const fx of [13.2,18.8]){ addBox(G,1.8,.22,.7,lam(G.tx.wood),fx,0,13.4,false); for(let i=0;i<5;i++) addBox(G,.16,.2,.16,solidMat([0xec8fb0,0xf2c14e,0xffffff,0x9fd0ff,0xe86a8a][i]),fx-.7+i*.35,.22,13.4+((i%2)-.5)*.2,false); }
    /* the arcade: neon over the door, two cabinets outside, a string of coloured bulbs */ btSign(G,'ARCADE',29,3.25,10.06,3,.8,{cw:96,ch:26,lit:1,bg:'#0a0818',face:'#14102a',hi:'#3ff4ff',ink:'#ff5a9a',glow:'#3ff4ff',font:'bold 18px monospace'});
    btCabinet(G,26.3,10.5,0); btCabinet(G,31.9,10.5,1); G.lightSrc.push({x:29,y:3.2,z:10.6,col:0xff5a9a,i:1.6,r:6,flick:1});
    for(let i=0;i<9;i++){ const m=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.12),new THREE.MeshBasicMaterial({color:[0x3ff4ff,0xff5a9a,0xffd45a][i%3]})); m.position.set(25.6+i*.85,2.7-Math.sin(i/8*Math.PI)*.25,10.1); G.root.add(m); }
    /* the bakery: a striped awning, the sign, baskets of bread by the door */ btSign(G,'BAKERY',51,3.1,10.06,2.8,.7,{cw:96,ch:26,face:'#e8d0a0',bg:'#6a3a1c',hi:'#fff0c8',ink:'#7a3a14',font:'bold 17px serif'});
    { const [ac,ax]=mkCanvas(48,12); for(let i=0;i<8;i++) R(ax,i*6,0,6,12,i%2?'#f2e6d0':'#c8423a'); for(let i=0;i<8;i++) R(ax,i*6+1,10,4,2,i%2?'#d8ccb6':'#a8322c'); const aw=new THREE.Mesh(new THREE.PlaneGeometry(4.4,1.1),new THREE.MeshLambertMaterial({map:tex(ac),side:THREE.DoubleSide})); aw.position.set(51,2.35,10.5); aw.rotation.x=-.9; G.root.add(aw); }
    for(const [bx,bz] of [[48.3,10.5],[49.2,10.6]]){ addBox(G,.6,.4,.5,lam(G.tx.wood),bx,0,bz,false); for(let i=0;i<3;i++) addBox(G,.42,.14,.18,solidMat(i%2?0xd8a05a:0xc8863a),bx+(i-1)*.06,.4+i*.12,bz+(i%2?.06:-.06),false); G.B[Math.floor(bz)][Math.floor(bx)]=true; }
  }catch(e){ console.error('town places',e); }
  const E=BT.elder; G.spots.elder={x:E.x,z:E.z}; G.spots.trainer={x:30.4,z:12.2}; G.spots.tower={x:T.x,z:T.z};
  G.ents.push({type:'npc',who:'elder',x:E.x,z:E.z,f:1,look:{cloth:'#6a5a8a',clothS:'#4a3a6a',skin:'#c99a78',hair:'#e8e4dc',beard:1,hat:'#4a6a8a',staff:1,robe:1}},
    {type:'dummy',x:20.6,z:19.6},{type:'npc',who:'baker',x:56.2,z:12.4,f:-1,look:{cloth:'#c87a4a',clothS:'#a05a30',skin:'#8a5a3e',hair:'#2a1d16',apron:1,hat:'chef'}},
    {type:'npc',who:'kid',x:T.x+1.2,z:T.z+1.4,f:-1,look:{cloth:'#d0a03a',clothS:'#a87a20',skin:'#d8a07a',hair:'#8a3a1e',kid:1}},{type:'mira',x:F.x+.4,z:F.z+2.5},
    {type:'npc',who:'villagerm',x:28,z:19,wander:1,look:{cloth:'#5a7a3a',clothS:'#40582a',skin:'#c48a5c',hair:'#3a2a1a'}},
    {type:'npc',who:'villagerf',x:47,z:19.6,wander:1,look:{cloth:'#a84a6a',clothS:'#803650',skin:'#f0c9a8',hair:'#8a4a2a',apron:1}},
    {type:'npc',who:'villagerm',x:58.5,z:14,wander:1,look:{cloth:'#4a5a8a',clothS:'#34406a',skin:'#8a5a3e',hair:'#1a1a1a',hat:'#6a4a2a'}},
    {type:'npc',who:'villagerf',x:60,z:18.4,wander:1,look:{cloth:'#d0a050',clothS:'#a87a30',skin:'#d8a07a',hair:'#2a1a10'}},
    {type:'npc',who:'villagerm',x:8,z:20.5,wander:1,look:{cloth:'#7a5a8a',clothS:'#5a406a',skin:'#e0b090',hair:'#c0a060'}});
  G.pick.push({kind:'heart',x:T.x-.1,z:T.z+2.4});
  if(!(Game.flags&&Game.flags.ali)) G.ents.push({type:'npc',who:'ali',x:T.x-.4,z:T.z+.6,f:-1,look:{}});
  if(!(Game.flags&&Game.flags.paulDead)) G.ents.push({type:'npc',who:'paul',x:F.x,z:F.z+5.4,wander:1,wr:8,look:{cloth:'#3a3f4a',clothS:'#2a2e36',skin:'#d8a882',hair:'#1a1410',hood:'#4b5160',pants:'#26262c',pantsS:'#1c1c22'}});
  try{ if(typeof ALT_TREE!=='undefined'){ ALT_TREE.x=T.x+1.1; ALT_TREE.z=T.z+.6; } }catch(e){} /* Ali's tree grows out of the watchtower, wherever that is */
  G.trig.push({x:W-2.4,id:'villageExit'});
  G.root.add(skyDome(LOOKS.village.sky,LOOKS.village.sunDir,LOOKS.village.sunCol,LOOKS.village.sunSize));
  colossusPlane(G,'dusk',{bone:'#f0dccb',shade:'#b89a90',dark:'#5a4250',halo:'#ffd8a0',glow:'#ffb0e0',hazeTop:'rgba(200,120,170,.42)',hazeBot:'rgba(255,170,150,.55)'},460,230,46,14,-300,{ro:-8});
  if(typeof villageSky==='function') villageSky(G); else { G.oldSky=[farPlane(G,ridgeTex(['#6a5a90','#9a7aa0'],2,3,0),620,150,32,-10,-210,{ro:-7}),farPlane(G,ridgeTex(['#4a3a68','#6a5080'],5,4,0),520,110,32,-14,-140,{ro:-6})];
    for(let i=0;i<7;i++) G.oldSky.push(farPlane(G,cloudTex(i,['255,210,200','220,150,170']),110+i*12,40,-128+i*55,30+hash(i,1)*30,-230+i*6,{ro:-6,op:.85})); }
  G.anim.push(dt=>{ if(Math.random()<.08){ FX.spawn(rnd(-20,92),rnd(-2,6),rnd(-60,-30),rnd(-.2,.2),rnd(.6,1),0,14,0xffb060,1.6,-0.02,true); } });
  return G; };
// the angry Elder reappears where the Elder stands now (the base asks for the old spot)
(function(){ const se=spawnElderMob; spawnElderMob=function(x,z){ try{ if(L&&L.key==='village'&&L.spots&&L.spots.elder&&x===7&&z===13.6){ x=L.spots.elder.x; z=L.spots.elder.z; } }catch(e){} return se.call(this,x,z); }; })();
