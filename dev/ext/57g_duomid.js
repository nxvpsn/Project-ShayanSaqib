// =====================================================================
// THE DUO'S MID-PHASE LIMIT CUTS (the LIMIT mark at half of phases II and III had nothing behind it since v5):
//   II   TWIN ECLIPSE: back to back in the middle. Caotan's two blue beams turn like a jump rope while Omar throws Getsuga
//        pinwheels through them; then CROSS EXECUTION: columns of light and dark fall in turn (stand in the other set);
//        then three crossed strikes at once (a pink line and a Getsuga). They end winded: 4s stunned
//   III  LOVE AND DEATH: Omar's black hole in the middle pulls you while Caotan's heart bombs land where you stand; rings
//        of scythes close in from the sky with a blue line to jump; the hole bursts into three rings to jump. Winded: 4s
// The intro is a script (gliding camera, Omar-style title); the play is Caotan's generator (seconds), Omar waits on it.
// A death inside one restarts it (d5Restart wrapper). Started from the update at half HP, never from inside twHurt.
// =====================================================================
function dmEnd(F){ const C=F.C, O=F.O; TW.lcCleanup=null; F.busy=0; F.lc=0; F.d5lc=null; F.director=1; F.dcd=1.6; for(const T of [C,O]){ T.inv=false; T.lockF=0; T.cast=0; if(T.state==='lc') T.state='idle'; } try{ twCamFree(1.3); }catch(e){} Game.letterTo=0; }
function* dmLC(F,C,O,retry){ const P=Player, A=twAliAny(), c=F.center, gy=groundY(c.x,c.z), ph=F.phase, three=ph>=3; F.d5lc='mid'; F.lc=1; F.director=0; F.busy=1; F.miraHold=1; F.lcDone[ph]=1;
  twLCPrep(C); twLCPrep(O); C.down=O.down=0; C.inv=O.inv=true; C.x=c.x-1.3; C.z=c.z-2; O.x=c.x+1.3; O.z=c.z-2; O.hy=1.3; C.f=-1; O.f=1; C.lockF=O.lockF=1;
  if(!retry){ Game.letterTo=1; P.inv=99; P.vx=P.vz=0; if(A) A.hold=1;
    twCineGlide(c.x,gy+9,c.z+15,c.x,gy+1.6,c.z-2,3.5); Sound.sfx('gong'); yield wait(.7);
    if(three){ twCineGlide(O.x+2.5,gy+5.5,O.z+8,O.x,gy+1.8,O.z); yield say('omar',"Caotan. The forbidden one. The one we promised Mother we would never do.");
      twCineGlide(C.x-2.5,gy+5.5,C.z+8,C.x,gy+1.7,C.z); yield say('caotan',"The one where I do the love and you do the death?! I've been WAITING, onii-chan!",'happy');
      twCineGlide(P.x,P.y+6,P.z+9,P.x,P.y+1.2,P.z); yield say('shayan',"Please don't call it that.",'angry'); }
    else { twCineGlide(C.x-2.5,gy+5.5,C.z+8,C.x,gy+1.7,C.z); yield say('caotan',"Omar! Back to back! Like the poster in my room!",'happy');
      twCineGlide(O.x+2.5,gy+5.5,O.z+8,O.x,gy+1.8,O.z); yield say('omar',"You made a poster of us. Of course you did.");
      twCineGlide(P.x,P.y+6,P.z+9,P.x,P.y+1.2,P.z); yield say('shayan',"They're doing a team attack. Ali, we don't HAVE a team attack!",'surprised'); if(A) yield say('ali',"We have me."); }
    // the title over a slow slide across the two of them
    C.cast=3; O.cast=3; O.scythe=1; Sound.sfx('charge'); FX.ring(c.x,gy+.1,c.z-2,three?'#ff6ab0':'#9a4aff',6,.8); impactFrame([[2,1],[1,2]]); shake(.6);
    twCineGlide(c.x-4,gy+7,c.z+11,c.x-1,gy+1.8,c.z-2,6); yield wait(.25); twZeldaCard(three?'Limit Break':'Limit Break',three?'Love and Death':'Twin Eclipse',three?'One hole. Many hearts.':'Back to back',2.8); twCineGlide(c.x+4,gy+7,c.z+11,c.x+1,gy+1.8,c.z-2,.9); yield wait(2.7);
    if(A) A.hold=0; }
  twCineGlideEnd(); yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.6); Cam.cine=null; Game.letterTo=0; P.inv=1; F.miraHold=0;
  C.gen=(three?dmPlay3:dmPlay2)(F,C,O); C.wait=0; C.state='lc'; O.gen=twWaitFor(C)(); O.wait=0; O.state='lc'; try{ Sound.play('diva'); }catch(e){} }
function* dmPlay2(F,C,O){ const c=F.center, gy=groundY(c.x,c.z); TW.lcCleanup=()=>dmEnd(F); try{ twCamTrack(.35,1.5); }catch(e){}
  try{
    // 1. the jump rope and the pinwheel
    twBig('JUMP THE BLUE · SIDESTEP THE CRESCENTS',{size:38,col:'#c08aff',y:UH*.24,dur:2}); twBark('caotan',"Jump rope, senpai! Double dutch!",true);
    const a0=rnd(0,6.28), dir=Math.random()<.5?1:-1; for(const k of [0,Math.PI]) twBeam({x:c.x,z:c.z-2,ang:t=>a0+k+dir*Math.max(0,t-1)*1.05,len:22,w:1.1,warn:1,dur:7.5,dmg:2,col:0x9fd8ff,jump:true,y:.45}); C.cast=8;
    yield 1.4; for(let v=0;v<4;v++){ O.swing=1; O.cast=.5; const b=rnd(0,6.28); for(let i=0;i<4;i++) twGetsuga(O,b+i*Math.PI/2,{x:c.x,z:c.z-2,warn:.65,sp:12,len:21}); Sound.sfx('void'); if(v===1) twBark('omar',"Round and round. Like my thoughts at three in the morning.",true); yield 1.65; }
    yield .8;
    // 2. cross execution: odd columns, then even
    twBig('CROSS EXECUTION',{size:44,col:'#ffd45a',y:UH*.24,dur:1.6,sub:'Stand where the next set is not'}); const P=Player, x0=P.x-9, z0=P.z-6;
    for(let w=0;w<4;w++){ for(let ix=0;ix<7;ix++){ if(ix%2!==w%2) continue; for(let iz=0;iz<5;iz++){ const p=twClampXZ(x0+ix*3,z0+iz*3,.8); twBlast(p.x,p.z,1.45,1.05,{col:w%2?0x9a4aff:0xff6ab0,dmg:2,shake:.15}); } } Sound.sfx('charge'); yield 1.15; }
    yield .9;
    // 3. three crossed strikes
    twBark('omar',"Together.",true); for(let k=0;k<3;k++){ const P2=Player, e=twEdgePt(9), e2=twEdgePt(9); twPink(e.x,e.z,Math.atan2(P2.z-e.z,P2.x-e.x),{warn:.8,dmg:2}); twGetsuga(O,Math.atan2(P2.z-e2.z,P2.x-e2.x),{x:e2.x,z:e2.z,warn:.8,sp:15,len:22}); yield 1.05; }
    yield .8;
  } finally { dmEnd(F); }
  twBig('WINDED',{size:56,col:'#ffd45a',sub:'They overdid it: go!'}); twBark('caotan',"...I'm fine. I do cardio. In my room.",true); C.stun=O.stun=4; C.state=O.state='stun'; yield 4; }
function* dmPlay3(F,C,O){ const c=F.center, gy=groundY(c.x,c.z); TW.lcCleanup=()=>dmEnd(F); try{ twCamTrack(.35,1.5); }catch(e){}
  try{
    // 1. the hole pulls, the hearts fall where you stand
    twBig('RUN FROM THE HOLE · LEAVE THE HEARTS',{size:38,col:'#ff8ac8',y:UH*.24,dur:2}); twBark('omar',"The void is hungry. It gets that from me.",true); O.cast=9; C.cast=9; Sound.sfx('void');
    twMiniHole(c.x,c.z-1,{r:1.3,pull:5.2,range:16,dur:9,eat:1.25,dmg:4});
    for(let t=0;t<8.4;t+=.7){ const P=Player; twBlast(P.x+P.vx*.25,P.z+P.vz*.25,1.9,.95,{col:0xff6ab0,dmg:2,shake:.2}); if(Math.round(t/.7)%3===2){ const a=rnd(0,6.28); twBlast(P.x+Math.cos(a)*3,P.z+Math.sin(a)*3,1.9,1.1,{col:0xff6ab0,dmg:2}); } Sound.sfx('doki'); yield .7; }
    yield 1;
    // 2. rings of scythes close in, a blue line through each
    twBig('THE RINGS CLOSE',{size:44,col:'#c08aff',y:UH*.24,dur:1.6,sub:'Step in as each ring lands · jump the blue'}); twBark('caotan',"Ring around the senpai~!",true);
    for(let w=0;w<2;w++){ const P=Player, px=P.x, pz=P.z; [7,4.6,2.2].forEach((r,i)=>{ const n=Math.round(r*2.4); for(let k=0;k<n;k++){ const a=k/n*6.283+i*.3; twSkyScythe(px+Math.cos(a)*r,pz+Math.sin(a)*r,.9+i*.75); } });
      twBlue(px,pz,rnd(0,Math.PI),{warn:1.6,dmg:2}); Sound.sfx('charge'); yield 3.2; }
    // 3. the hole bursts: three rings to jump
    twBark('omar',"And then... nothing. As always.",true); Sound.sfx('crossboom'); shake(1); impactFrame([[2,1],[1,1]]); FX.burst(c.x,gy+1.5,c.z-1,80,0x8a2aff,10,.5);
    for(let k=0;k<3;k++){ twWave(c.x,c.z-1,{sp:8+k*1.5,max:17,col:k%2?0xff6ab0:0x9a4aff,dmg:2}); yield .75; }
    yield 1.4;
  } finally { dmEnd(F); }
  twBig('WINDED',{size:56,col:'#ffd45a',sub:'They overdid it: go!'}); twBark('omar',"...I need to lie down. In the dark. So, nothing changes.",true); C.stun=O.stun=4; C.state=O.state='stun'; yield 4; }
// the trigger: half HP in phase II or III, from the update
(function(){ const tu=twUpdate; twUpdate=function(dt){ const r=tu.apply(this,arguments); try{ const F=TW.fight; if(F&&F.kind==='duo'&&F.v5!==0&&F.phase>=2&&F.lcDone&&!F.lcDone[F.phase]&&!F.lc&&!F.pend&&!Game.script&&Game.state==='play'&&twPlay()){ const C=F.C, O=F.O; if(C&&O&&C.hp>0&&(C.hp+O.hp)<=(C.maxHp+O.maxHp)/2){ F.lcDone[F.phase]=1; F.pend=()=>dmLC(F,C,O,false); } } }catch(e){ console.error('duo mid lc',e); } return r; }; })();
// a death inside one restarts it
(function(){ const dr=d5Restart; d5Restart=function(F){ if(F&&F.d5lc==='mid'){ const C=F.C, O=F.O; d5MiraOn(); F.miraHold=0; F.director=0; C.inv=O.inv=true; F.pend=()=>dmLC(F,C,O,true); return; } return dr.apply(this,arguments); }; })();
