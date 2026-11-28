// =====================================================================
// BIGGER BOSS ROOMS (v1.94). The owner: "for the initial omar and caotan duo boss fight before kojima, make the boss room way bigger
// so that the player has room to move around... same thing with the first kojima phase 1 room... if you stood in the middle you
// couldn't see the edge of the room".
//   The Gatekeepers' Court was 26x15; it is 66x46. Everything that was in it sits BR.tw.ox further east, against the north wall,
//   under a gatehouse twice the size; the court runs away south and to both sides. The fight's box (TW_GATE_LOCK, which the twins'
//   moves are aimed inside) is no longer the room: it is 22x11.2 and follows the player, and the player is only held by the walls.
//   Day Old Keep was 20x17; it is 58x46. The throne, the cage and the first marks sit BR.kp.ox further east at the north end; the
//   hall has `zone` instead of `arena`, which is how the lake and the flower field already tell Kojima "the arena is wherever
//   the player is" (arenaCenter/arenaRad).
// Loads before 05c (which decorates the keep at the old coordinates: 05f moves what it added) and 40_story (the gate fight's marks).
// =====================================================================
const BR={tw:{ox:20,W:66,D:46},kp:{ox:19,W:58,D:46},lk:{cx:0,cz:0,init:0}};
LEVELDEF.twins=function(){ const ox=BR.tw.ox, W=BR.tw.W, D=BR.tw.D, G=newGrid(W,D,'twins'); G.tx=makeTileTextures('twins'); Object.assign(G,{key:'twins',look:'twins',music:null,name:"The Gatekeepers' Court",sub:'Before the gates of Day Old Keep',spawn:[3.2+ox,9],cam:{y:5.4,z:15.5,up:1.1}});
  boxT(G,0,0,W-1,D-1,'flag'); boxH(G,0,0,W-1,3,6,'brick'); boxH(G,0,0,1,D-1,6,'brick'); boxH(G,W-2,0,W-1,D-1,6,'brick'); boxH(G,0,D-1,W-1,D-1,.6,'brick'); boxH(G,26,0,40,3,11.5,'brick'); /* the gatehouse */
  blockB(G,0,0,W-1,3); blockB(G,0,0,1,D-1); blockB(G,W-2,0,W-1,D-1); blockB(G,0,D-1,W-1,D-1);
  for(let z=5;z<D-1;z++) for(let x=2;x<W-2;x++) if((x+z)%7===0||((x===31||x===34)&&z%2)) G.T[z][x]='cobble'; for(let z=4;z<D-1;z++){ G.T[z][32]='cobble'; G.T[z][33]='cobble'; } /* an avenue up to the gate */
  buildTerrain(G,G.tx);
  const blueLamp=(lamp)=>{ lamp.material.emissive.setHex(0x8ac8ff); const ls=G.lightSrc[G.lightSrc.length-1]; ls.col=0x7ab4ff; ls.i=2; ls.r=8; };
  const LP=[]; for(const z of [6,14,22,30,38]){ LP.push([2.6,z],[W-3.4,z]); } for(const x of [9,19,29,36.4,46,56]) LP.push([x,D-2.6]); for(const [x,z] of [[28.6,4.7],[37.4,4.7]]) LP.push([x,z]);
  for(const [x,z] of LP){ blueLamp(addLantern(G,x,z)); } /* thin posts along the walls: they block nothing (v1.95: no invisible squares to catch on in a fight) */
  /* two rows of broken columns down the sides, each with a lamp at its foot: they give the size of the place away */ for(const z of [10,20,30,40]) for(const x of [7,W-8]){ addPillar(G,x,z,z%20===0?4.4:3.2,z%20===0?0:1); G.B[z][Math.floor(x)]=true; G.lightSrc.push({x,y:2.2,z:z+.8,col:0x7ab4ff,i:1.5,r:8,flick:1}); }
  for(const x of [4,8,12,16,20,24,42,46,50,54,58,62]){ const y=3.4, m=new THREE.Mesh(new THREE.BoxGeometry(.36,.46,.36),new THREE.MeshLambertMaterial({color:0x1a2030,emissive:0x8ac8ff,emissiveIntensity:2.2})); m.position.set(x,y,4.25); G.root.add(m);
    const br=new THREE.Mesh(new THREE.BoxGeometry(.08,.5,.36),solidMat(0x2d2a30)); br.position.set(x,y+.45,4.12); G.root.add(br); G.lightSrc.push({x,y,z:4.6,col:0x7ab4ff,i:1.6,r:7,flick:1}); }
  // the great gate of Kennel Keep, twice the size it was, in a gatehouse that stands over the wall
  const [gc,gx]=mkCanvas(64,80); R(gx,0,0,64,80,'#1a1014'); for(let i=0;i<8;i++) R(gx,i*8,0,7,80,i%2?'#2a1a1e':'#24161a'); R(gx,0,18,64,4,'#8a6a2a'); R(gx,0,56,64,4,'#8a6a2a'); R(gx,30,0,4,80,'#0c0608');
  R(gx,22,34,8,8,'#c9a24a'); R(gx,34,34,8,8,'#c9a24a'); gx.fillStyle='#0a0406'; gx.beginPath(); gx.arc(32,0,32,0,Math.PI); gx.fill();
  const gate=new THREE.Mesh(new THREE.PlaneGeometry(8.8,11),new THREE.MeshLambertMaterial({map:tex(gc)})); gate.position.set(33,5.5,4.03); G.root.add(gate); G.lightSrc.push({x:33,y:6,z:6,col:0x9ac8ff,i:1.8,r:12});
  const [bc,bx]=mkCanvas(32,64); R(bx,0,0,32,64,'#14306a'); R(bx,0,0,32,3,'#c9d8ff'); R(bx,8,18,16,16,'#e8eeff'); R(bx,12,22,8,8,'#14306a'); for(let i=0;i<8;i++) R(bx,i*4,58+(i%2)*3,4,6,'#14306a');
  for(const x of [6,10,14,18,22,44,48,52,56,60]){ const b=new THREE.Mesh(new THREE.PlaneGeometry(1.4,2.8),new THREE.MeshLambertMaterial({map:tex(bc),transparent:true,alphaTest:.5})); b.position.set(x,3.8,4.02); G.root.add(b); }
  for(const x of [27.4,38.6]){ const b=new THREE.Mesh(new THREE.PlaneGeometry(2.2,6),new THREE.MeshLambertMaterial({map:tex(bc),transparent:true,alphaTest:.5})); b.position.set(x,7.6,4.02); G.root.add(b); }
  G.arena={x0:2.2,x1:W-2.2,z0:4.8,z1:D-1.7};
  G.root.add(skyDome(LOOKS.twins.sky,LOOKS.twins.sunDir,LOOKS.twins.sunCol,LOOKS.twins.sunSize)); stars(G,1100,0xbcd4ff,1.4);
  return G; };
// the gate fight's box follows the player (it eases after him, so a move aimed "inside the box" lands near where he is going)
(function(){ const uw=updateWorld; updateWorld=function(dt){ try{ const F=TW.fight; if(F&&F.kind==='gate'&&L&&L.key==='twins'&&L.arena&&typeof TW_GATE_LOCK!=='undefined'){ const P=Player, A=L.arena, hw=11, hd=5.6, K=BR.lk, tx=clamp(P.x,A.x0+hw,A.x1-hw), tz=clamp(P.z,A.z0+hd,A.z1-hd);
        if(!K.init||Game.state!=='play'){ K.cx=tx; K.cz=tz; K.init=1; } else { const k=Math.min(1,dt*2.5); K.cx+=(tx-K.cx)*k; K.cz+=(tz-K.cz)*k; }
        TW_GATE_LOCK.x0=K.cx-hw; TW_GATE_LOCK.x1=K.cx+hw; TW_GATE_LOCK.z0=K.cz-hd; TW_GATE_LOCK.z1=K.cz+hd; if(Game.arena&&Game.arena.lock===TW_GATE_LOCK) Game.arena.lock=A; } else BR.lk.init=0; }catch(e){ console.error('gate box',e); } return uw.apply(this,arguments); }; })();
LEVELDEF.keep=function(){ const ox=BR.kp.ox, W=BR.kp.W, D=BR.kp.D, cx=10+ox, G=newGrid(W,D,'keep'); G.tx=makeTileTextures('keep'); Object.assign(G,{key:'keep',look:'keep',music:null,name:'Day Old Keep',sub:'Studio of the Baby Auteur',spawn:[cx,14.4]});
  boxT(G,0,0,W-1,D-1,'flag'); boxH(G,0,0,W-1,3,6,'brick'); boxH(G,0,0,1,D-1,6,'brick'); boxH(G,W-2,0,W-1,D-1,6,'brick'); boxH(G,0,D-1,W-1,D-1,.6,'brick'); boxH(G,cx-6,0,cx+5,3,9,'brick'); blockB(G,0,0,W-1,3); blockB(G,0,0,1,D-1); blockB(G,W-2,0,W-1,D-1); blockB(G,0,D-1,W-1,D-1);
  buildTerrain(G,G.tx);
  const thr=new THREE.Group(); const red=solidMat(0x5b1d2a), dark=solidMat(0x2a2230), gold=new THREE.MeshLambertMaterial({color:0xc9a24a,emissive:0x3a2a08});
  [[2.4,4.2,.6,dark,0,0,0],[1.8,3,.3,red,0,.4,.2],[3,.8,1.4,dark,0,0,.6],[.4,.8,.4,gold,-1,4.2,0],[.4,.8,.4,gold,1,4.2,0],[.5,1,.5,gold,0,4.2,0]].forEach(([w,h,d,m,x,y,z])=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); b.position.set(x,y+h/2,z); b.castShadow=true; thr.add(b); });
  thr.position.set(cx,0,4.3); G.root.add(thr);
  for(const [x,z] of [[3.5+ox,5],[16.5+ox,5],[3.5+ox,13.5],[16.5+ox,13.5]]){ addBox(G,.9,1.1,.9,lam(G.tx.brick),x,0,z); G.B[Math.floor(z)][Math.floor(x)]=true; G.lightSrc.push({x,y:1.8,z,col:0xff7a3a,i:2.2,r:9,flick:1,fire:1}); }
  const [bc,bx]=mkCanvas(32,64); R(bx,0,0,32,64,'#5b1d2a'); R(bx,0,0,32,3,'#c9a24a'); R(bx,10,20,12,12,'#c9a24a'); R(bx,8,16,4,6,'#c9a24a'); R(bx,20,16,4,6,'#c9a24a'); for(let i=0;i<8;i++) R(bx,i*4,58+(i%2)*3,4,6,'#5b1d2a');
  for(const x of [4+ox,7+ox,13+ox,16+ox,6,10,14,W-15,W-11,W-7]){ const b=new THREE.Mesh(new THREE.PlaneGeometry(1.4,2.8),new THREE.MeshLambertMaterial({map:tex(bc),transparent:true,alphaTest:.5})); b.position.set(x,3.6,4.02); G.root.add(b); }
  for(const x of [5.5+ox,14.5+ox]){ const [wc,wx]=mkCanvas(32,64); R(wx,0,0,32,64,'#120408'); wx.fillStyle='#3a0a12'; wx.beginPath(); wx.arc(16,26,10,0,7); wx.fill(); R(wx,15,0,2,64,'#2a1a20'); R(wx,0,40,32,2,'#2a1a20');
    const w=new THREE.Mesh(new THREE.PlaneGeometry(1.6,3.2),new THREE.MeshBasicMaterial({map:tex(wc)})); w.position.set(x,4.2,4.03); G.root.add(w); G.winMats=(G.winMats||[]).concat(w.material); }
  { /* the hall beyond the dais: a red runner from the door to the throne, columns with fire bowls down both sides and across the south end */ const run=new THREE.Mesh(new THREE.PlaneGeometry(2.6,D-6.4),new THREE.MeshLambertMaterial({color:0x5b1d2a})); run.rotation.x=-Math.PI/2; run.position.set(cx,.03,(5.4+D-1)/2); G.root.add(run);
    for(const sx of [-1.36,1.36]){ const ed=new THREE.Mesh(new THREE.PlaneGeometry(.12,D-6.4),new THREE.MeshLambertMaterial({color:0xc9a24a,emissive:0x3a2a08})); ed.rotation.x=-Math.PI/2; ed.position.set(cx+sx,.04,(5.4+D-1)/2); G.root.add(ed); }
    const coal=new THREE.MeshLambertMaterial({color:0xff6a2a,emissive:0xff5a1a,emissiveIntensity:1.4}), iron=solidMat(0x2a2a30);
    for(const [x,z] of [[6,10],[6,21],[6,32],[W-7,10],[W-7,21],[W-7,32],[14,D-4],[cx-6,D-4],[cx+6,D-4],[W-15,D-4],[6,D-4],[W-7,D-4]]){ addPillar(G,x,z,2.2,0); G.B[Math.floor(z)][Math.floor(x)]=true; const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.6,.36,.32,10),iron); bowl.position.set(x,2.36,z); G.root.add(bowl); const em=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.05,10),coal); em.position.set(x,2.52,z); G.root.add(em); G.lightSrc.push({x,y:3,z,col:0xff7a3a,i:2.3,r:11,flick:1,fire:1});
      G.anim.push(()=>{ if(L===G&&Math.abs(Player.x-x)<26&&Math.random()<.25) FX.spawn(x+rnd(-.25,.25),2.6,z+rnd(-.25,.25),rnd(-.15,.15),rnd(.8,1.8),0,.5,Math.random()<.5?0xff8a3a:0xffd45a,.2,0,true); }); } }
  G.spots={boss:{x:cx,z:7.6},approach:{x:cx,z:12},cage:{x:cx,z:5.4,y:3.4}};
  G.zone={x:cx,z:9,r:8.6}; /* no fixed arena: Kojima's moves are aimed round the player, as on the lake and in the field */
  G.root.add(skyDome(LOOKS.keep.sky,LOOKS.keep.sunDir,LOOKS.keep.sunCol,LOOKS.keep.sunSize));
  G.kjBaseN=G.root.children.length; G.kjBaseL=G.lightSrc.length;
  return G; };
