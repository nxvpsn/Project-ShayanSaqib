// =====================================================================
// THE GATE FIGHT (both twins, before Grimmaw): gentler versions of their moves. The later solo and duo fights keep the full ones.
// Longer gaps between attacks, hits do half (rounded up), and when one twin falls the other does NOT get its phase II moves here.
// =====================================================================
TWPOOL.caotan.gate=['gooG','glintG','lettersG'];
TWPOOL.omar.gate=['scythesG','reapG','handsG'];
const twGate=()=>!!TW.fight&&TW.fight.kind==='gate';
// goo: the phase I volleys only
TWK.caotan.gooG=function*(T){ yield* TWK.caotan.goo(T,1); };
// one glint, a clear beat, he blinks in, an arrow, then the slash: parry it or step away
TWK.caotan.glintG=function*(T){ yield* twGlint(T,1,.01); yield .5;
  twBlinkTo(T,'front',1.4,0xffb0e0); FX.burst(T.x,T.y+1.4,T.z,16,0xff8ac8,4,.3); T.parried=0; twBark('caotan',"Senpai Snipe!");
  const P=Player, a=Math.atan2(P.z-T.z,P.x-T.x); T.lockF=1; T.f=Math.cos(a)>0?1:-1; FX.line(T.x,T.z,a,2.7,2.6,0xff6ab0,.35); yield .35;
  twSlash(T,2,2.7,{n:2,onParry:()=>{ T.parried=1; }});
  if(T.parried){ T.stun=Math.max(T.stun,1.6); twBark('caotan',"Y-you saw that coming?!",true); }
  yield .5; T.swing=0; T.lockF=0; yield .3; };
// four phones, and a swatted one hits him straight away (he does not catch it and throw it back here)
TWK.caotan.lettersG=function*(T){ twBark('caotan',"Pick up, senpai! It's your waifu calling!"); T.cast=.6; const st={caught:true,busy:false};
  for(let i=0;i<4;i++){ const P=Player, a=rnd(0,6.28), r=i===0?0:rnd(1,3.6), p=twClampXZ(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,.6); T.fire=.15; Sound.sfx('swing'); twPhone(T,p.x,p.z,1.1,st,1); yield .3; }
  yield 1.2; };
// three scythes that hover by him and launch straight at you, one at a time: deflect them back into him
TWK.omar.scythesG=function*(T){ if(Math.random()<.5) twBark('omar',"Rise, my scythes."); T.cast=.8; T.scythe=0;
  for(let i=0;i<3;i++){ const a=rnd(0,6.28), hx=T.x+Math.cos(a)*1.6, hy=T.y+rnd(1.6,3.1), hz=T.z+Math.sin(a)*.8;
    twBolt(T,{kind:'scythe',x:hx,y:hy,z:hz,vx:0,vz:0,delay:.7+i*.35,spd:9.5,col:0x8a3aff,dmg:2,life:4}); FX.burst(hx,hy,hz,10,0x7a2acc,2.5,.25); }
  Sound.sfx('charge'); yield 1.9; };
// two reaps with a long, readable tell (no strict timing here)
TWK.omar.reapG=function*(T){ twBark('omar',"Behind you. Always behind you.");
  for(let i=0;i<2;i++){ const P=Player, a=(P.ang||0)+Math.PI+rnd(-.6,.6), p=twClampXZ(P.x+Math.cos(a)*2.1,P.z+Math.sin(a)*2.1,.6); FX.marker(p.x,p.z,1,0x8a3aff,.5);
    FX.burst(T.x,T.y+1.4,T.z,22,0x140a1a,4,.45,false); T.hide=1; Sound.sfx('dash'); yield .45; T.x=p.x; T.z=p.z; T.y=groundY(p.x,p.z)+T.hy; T.hide=0; FX.burst(T.x,T.y+1.4,T.z,22,0x140a1a,4,.45,false);
    T.scythe=1; T.swing=0; const P2=Player, aa=Math.atan2(P2.z-T.z,P2.x-T.x); T.lockF=1; T.f=Math.cos(aa)>0?1:-1; T.parried=0; FX.line(T.x,T.z,aa,2.8,2.6,0xb06aff,.6); yield .6;
    T.swing=1; Sound.sfx('swing'); FX.arc(T.x,groundY(T.x,T.z),T.z,aa,0,true); twReapHit(T.x,T.z,aa,2.8,T); yield .4; T.lockF=0; T.scythe=0; if(T.parried) return; }
  yield .6; };
// hands: the phase I chasing hands only
TWK.omar.handsG=function*(T){ yield* TWK.omar.hands(T,1); };
// more breathing room between attacks, and every hit does half, rounded up (not the one-shots)
(function(){ const sg=twStartGate; twStartGate=function(){ const r=sg.apply(this,arguments); const F=TW.fight; if(F&&F.kind==='gate'){ const cd=F.cd; F.cd=T=>cd(T)*1.35; } return r; }; })();
(function(){ const hp=hurtPlayer; hurtPlayer=function(d,...a){ if(twGate()&&d<50) d=Math.max(1,Math.ceil(d*.5)); return hp.call(this,d,...a); }; })();
