// =====================================================================
// THE TWINS DUO, v5 (on top of 57/57b/57c): every line of the fight's script, then the systems.
// Lines are ['speaker',"text"] pairs so the voice builder finds them; scenes play them with d5Say/d5Bark.
// =====================================================================
const D5={
  // the twins turn on Shayan after Hamza; Ali cuts Mira's cage open and stays
  intro:[['caotan',"Well, well, well. The pig is bacon, the baby is dead, and senpai is down to his last brain cell."],
    ['omar',"The throne of Day Old Keep has two seats. We counted. You are not a seat."],
    ['shayan',"Are you serious?! We literally just high-fived over a dead pig!"],
    ['caotan',"That was a TACTICAL high five, senpai. Like my love. Tactical. And a little sticky. ♡"],
    ['omar',"Betrayal is the only honest thing left in this world. That, and my poetry."],
    ['mira',"Can somebody PLEASE let me out of this cage before the next plot twist?!"],
    ['ali',"Two on one. Cowards."],
    ['ali',"Cage is open. Run, princess."],
    ['mira',"Run? Honey, I've been doing cardio in a CAGE all night. I'm staying. I'll dodge."],
    ['shayan',"Who even ARE you?!"],
    ['ali',"The guy who cut the moon. You're welcome for the moonlight."],
    ['caotan',"THE MOON CUTTER?! Omar, he's SO much hotter than his wanted poster!"],
    ['omar',"...I need to sit in a dark corner and reevaluate my brand."],
    ['ali',"Blacksmith. Glasses are yours. I'll take the emo."],
    ['omar',"I am not emo. I am emotionally... overclocked."],
    ['mira',"I'll be over here dodging! Professionally! Go get 'em, boys!"]],
  // fight barks: jokes, never the name of the move
  caoBark:[['caotan',"Pew pew! That's the sound of my heart, senpai!"],['caotan',"Hold still! I'm trying to laser your name onto my wall!"],
    ['caotan',"My glasses run at two hundred frames per second. You can't hide."],['caotan',"Is it hot in here or is it my lasers? It's my lasers."],
    ['caotan',"I did the math! The math said MORE LASERS!"],['caotan',"Every beam is a love letter! Some of them are restraining orders!"],
    ['caotan',"Hikari-chan is watching! Look cool, Caotan! LOOK COOL!"],['caotan',"I'm not crying! My glasses are just overheating!"],
    ['caotan',"Dodge this, senpai! No wait, don't dodge it, HOLD it!"],['caotan',"Lens flare! Lens flare! MORE LENS FLARE!"],
    ['caotan',"I practiced this in the mirror! The mirror lost!"],['caotan',"Ara ara, senpai, you're sweating! Let me help! With LASERS!"]],
  omarBark:[['omar',"The void called. It wants you back. It never wanted me."],['omar',"My scythes have names. You will learn them. Painfully."],
    ['omar',"Darkness is just light that gave up. Relatable."],['omar',"I wrote a haiku about your death. It is seventeen syllables of screaming."],
    ['omar',"Gerald. Phil. Kevin. Go."],['omar',"Even black holes have more friends than me. Watch them hug you."],
    ['omar',"I would smile, but my face does not do that."],['omar',"This is my emo era. It is also my only era."],
    ['omar',"Fall into the dark. It is comfy. I have pillows. Caotan's pillows. Do not ask."],['omar',"My mother says I am the edgiest boy in the basement."],
    ['omar',"I sharpened these on my own tears. They never dry."],['omar',"Every scythe I throw is a cry for help. You are the help. Die."]],
  banter:[['caotan',"Omar! Do the cool thing!"],['omar',"Everything I do is the cool thing."],
    ['caotan',"Omar, your hole is eating my LASERS!"],['omar',"My hole does not discriminate."],
    ['omar',"Brother. You lasered my cape."],['caotan',"It's a FASHION STATEMENT now!"],
    ['caotan',"Omar, high five!"],['omar',"I have told you. We do not touch."]],
  // Mira runs around the field dodging everything on her own
  mira:[['mira',"Nope!"],['mira',"Too slow, nerds!"],['mira',"Cardio queen coming through!"],['mira',"I've dodged worse at the farmers market!"],
    ['mira',"Missed me! Missed me again!"],['mira',"Is THAT all? My cage was scarier!"],['mira',"Ali, your hat is SO cool!"],
    ['mira',"Babe, you're getting hit a LOT!"],['mira',"Hikari-chan, sit! Good pillow!"],['mira',"Wheee! Do it again!"]],
  // Ali kicks a twin out of a move, or guards for Shayan
  aliKick:[['ali',"Nap time."],['ali',"Lie down. Think about what you did."],['ali',"Gravity says hi."],
    ['ali',"The floor is free. Use it."],['ali',"You dropped this. It's you."],['ali',"Stay down. It suits you."]],
  aliGuard:[['ali',"Lunch break's over."],['ali',"Behind me. Keep up."],['ali',"I'll send you the bill."],['ali',"Blink and you'd be dead. Don't blink."]],
  // Ali blows up into pieces, then cuts himself back together six seconds later
  aliGib:[['shayan',"ALI?! He just... EXPLODED?!"],['mira',"Is he okay?! He's in like nine pieces!"],['caotan',"Oops! Was that me? That was me! GG!"]],
  aliBack:[['ali',"Ow. Anyway."],['ali',"Death tried. Death got cut."],['ali',"I've been more dead than this. On a Tuesday."],
    ['ali',"Reassembled. In alphabetical order."],['ali',"That was a rehearsal."],['ali',"I cut my way back. Obviously."],
    ['ali',"My spleen is on backwards. It's fine."],['ali',"Note to self: don't do that again. Note to self: ignore note."],
    ['ali',"Did anyone see that? No? Good."],['ali',"Two of my fingers came back as someone else's. Lucky."]],
  // phase I -> II: the sync, then the Getsuga clash
  trans1:[['caotan',"Ow! OW! Omar, they're actually GOOD at this!"],['omar',"Then we stop playing. Brother... the sync."],
    ['caotan',"The SYNC?! In PUBLIC?!"],['omar',"Do it, or I tell everyone your body pillow's middle name."],
    ['caotan',"Her name is Hikari Rose and she is a PERSON!"],['shayan',"Ali, they're charging something!"],
    ['ali',"Then we charge harder. Together, blacksmith."],['shayan',"Together? Did the mysterious rival just say TOGETHER?!"],
    ['ali',"Don't make it weird."],['omar',"My crescent... my beautiful crescent... it had a NAME..."],
    ['caotan',"Was it Gerald?"],['omar',"...It was Gerald."],['mira',"Woo! Do it again! I wasn't looking!"]],
  // phase II ends in Omar's limit cut: KUROI KAIMON
  omarLC:[['omar',"Enough. You want to see the Edge? Then look UP."],
    ['caotan',"Ooh, he's doing the floaty thing! He only does the floaty thing when he's REALLY sad!"],
    ['omar',"I am not sad. I am... ascending."],['shayan',"He's FLYING?! Since WHEN can he FLY?!"],['ali',"Since he got sad enough."],
    ['omar',"Every tombstone has a name. None of them are mine. Yet."],
    ['omar',"Doors. Everywhere. All of them lead back to me. Like a bad relationship."],
    ['omar',"Little ones. Hungry ones. Say hello to your new gravity."],
    ['omar',"And now, the big one. The void eats the sky. The sky does not fight back. Neither will you."],
    ['shayan',"That is a REALLY big black hole!"],['mira',"Is it supposed to be eating the CLOUDS?!"],
    ['ali',"Hm. Out of reach. ...I'll cut a path up."],
    ['shayan',"Did you just carve a TREE out of SWORD SLASHES?!"],['ali',"Climb, blacksmith. Don't touch the sharp parts. They're all sharp parts."],
    ['omar',"You climbed. Cute. You still cannot reach me."],['ali',"He's right. Use your drill."],
    ['shayan',"My drill?! Against THAT?!"],['ali',"Your gauge is full. I may have cut it full."],
    ['ali',"Za Warudo. Let me give you a hand."],['ali',"There. Now it's sharp."],
    ['shayan',"DRILL! DRILL! DRIIIILL!"],['omar',"No. NO! You cannot drill a VOID!"],['shayan',"WATCH ME!"],
    ['omar',"My beautiful nothing..."],['caotan',"OMAR! INCOMING!"],['omar',"Catch me, brother!"],['caotan',"...No."],
    ['shayan',"We did it! We drilled a hole into a hole!"],['ali',"Don't say it like that."],['mira',"I'm writing that down!"],
    ['caotan',"Okay. OKAY. My turn. Nobody drills Omar's hole but ME!"],['omar',"Brother. PLEASE."]],
  // phase III ends in Caotan's limit cut: HIKARI SUPERNOVA
  caoLC:[['caotan',"Senpai... I didn't want it to come to this. Hikari-chan... wake up, baby."],['shayan',"Wake... UP?!"],
    ['caotan',"She's been charging. Eighteen hours a day. On my bed."],['mira',"The pillow is ALIVE?! And she's GROWING?!"],
    ['caotan',"Twenty glints. Twenty kisses. Count them with me, senpai!"],
    ['caotan',"FIVE! Is this what love feels like?!"],['caotan',"TEN! My glasses are melting and I LOVE IT!"],
    ['caotan',"FIFTEEN! Hikari-chan, you're so BIG! So BEAUTIFUL!"],['caotan',"TWENTY! MEGANE... SUPERNOVAAAA!"],
    ['omar',"It's raining blades. Hallelujah."],['omar',"Three hundred scythes. I ran out of names at Kevin Forty."],
    ['omar',"Brother. She is blocking my sunlight. I don't even LIKE sunlight."],['caotan',"She's PERFECT! Look at her, Omar! LOOK AT HER!"],
    ['omar',"I have seen enough of her."],['omar',"Collapse."],
    ['caotan',"No... NO! HIKARI-CHAN! She's being SPAGHETTIFIED!"],['omar',"Pasta is a valid state of matter."],
    ['omar',"Catch, blacksmith."],['shayan',"ALI!"],['ali',"Hm. Halves."],
    ['caotan',"You ate my waifu... and they CUT her in HALF..."],['omar',"She was holding us back."]],
  // zero percent: twenty seconds of spite
  burnIntro:[['caotan',"Zero HP... but I've still got SPITE! And six energy drinks!"],['omar',"Spite is my oldest friend. It is my only friend. Spite, attack."],
    ['shayan',"They're at ZERO! How are they still MOVING?!"],['ali',"Spite. Survive twenty seconds. They'll burn out."],['mira',"Babe! I'm SO good at surviving! Watch me!"]],
  burn:[['caotan',"I'M SEEING SOUNDS AND HEARING COLORS!"],['omar',"BLACK HOLES FOR EVERYONE! YOU GET A HOLE! AND YOU GET A HOLE!"],
    ['caotan',"ALL THE LASERS! EVEN THE LEGALLY QUESTIONABLE ONES!"],['omar',"RAIN, MY CHILDREN! RAIN ON THEIR PARADE!"],
    ['caotan',"I CAN'T FEEL MY FACE! I NEVER COULD!"],['omar',"I HAVE NO IMPULSE CONTROL AND I HAVE NEVER FELT MORE ALIVE!"]],
  // twenty seconds in: Caotan's laser misfires into Omar; then Hikari falls out of the sky
  burnEnd:[['caotan',"FINAL SPITE! EAT THIS— oh no. Oh no no no."],['omar',"...Brother?"],
    ['caotan',"OMAR!! I'M SO SORRY! I WAS AIMING AT SENPAI'S BUTT!"],['shayan',"WHAT?!"],
    ['mira',"Uh... why is the sky opening?"],['caotan',"Is that... Hikari-chan? HIKARI-CHAN! You came back for m—"],
    ['ali',"Hm. She melted."],['mira',"Into... white goop?"],['shayan',"I'm not going to think about that. I'm never going to think about that."]],
  ending:[['ali',"Not bad, blacksmith. You survived two idiots and a pillow."],['shayan',"Who ARE you, really?"],
    ['ali',"Ali. Next time, it's you and me."],['shayan',"...That's it? Just 'Ali'?!"],
    ['mira',"Babe. Your pig died, your friends betrayed you, one of them exploded, the other got crushed by his own waifu, and a samurai cut a tree out of the sky."],
    ['mira',"...Best date ever?"],['shayan',"Best date ever."],['mira',"Same time next eclipse. Fewer twins. More honey buns."]]};
function d5Pick(k){ const L=D5[k]; return L[Math.floor(Math.random()*L.length)]; }
function d5Bark(k,i,force){ const p=i!=null?D5[k][i]:d5Pick(k); if(p) twBark(p[0],p[1],force!==false); }
function d5Say(k,i,ex){ const p=D5[k][i]; return say(p[0],p[1],ex); }

// =====================================================================
// SETUP: the fight is v5; the old 50% limit cuts never fire (the new ones end phases II and III)
// =====================================================================
(function(){ const ds=twDuoStart; twDuoStart=function(){ const F=ds.apply(this,arguments); if(F){ F.v5=1; F.lcDone={2:1,3:1}; } return F; };
  const dr=twDuoRestart; twDuoRestart=function(F){ const r=dr.apply(this,arguments); try{ if(F&&F.v5){ F.lcDone={2:1,3:1}; d5Restart(F); } }catch(e){ console.error('d5 restart',e); } return r; }; })();
function d5F(){ const F=TW.fight; return F&&F.kind==='duo'&&F.v5?F:null; }
// ---------- barks: in this fight, only the script talks. Old move barks become jokes (or silence) ----------
const D5_OK=new Set(), D5_DROP=new Set(["...I'll allow it. Once.","I'm down! Revive me with the power of friendship! Or just wait seven seconds!","I have fallen. Briefly. Like the sun."]);
for(const k in D5) for(const p of D5[k]) D5_OK.add(p[1]);
try{ TW_REV_BARKS.forEach(r=>{ D5_OK.add(r[0][1]); D5_OK.add(r[1][1]); }); (ALLY_BARK.ali||[]).forEach(s=>D5_OK.add(s)); }catch(e){}
for(const s of ["He kicked me! In the GLASSES! Those were PRESCRIPTION!","I have been... grounded. Like when I was fourteen."]) D5_OK.add(s);
(function(){ const tb=twBark; twBark=function(who,text){ if(d5F()&&!D5_OK.has(text)&&(who==='caotan'||who==='omar'||who==='ali')){
      if(D5_DROP.has(text)||Math.random()<.55) return; const k=who==='caotan'?'caoBark':who==='omar'?'omarBark':(/^(Sit|No|Down)/.test(text)?'aliKick':'aliGuard'); const p=d5Pick(k); return tb.call(this,p[0],p[1],true); }
    return tb.apply(this,arguments); }; })();

// =====================================================================
// BLACK HOLES THAT PULL: you feel it (wind streaks toward the hole), you can walk out of the edge but not the middle; a dash still drags
// =====================================================================
function d5Suck(x,z,o,k,s,dt){ const P=Player; if(P.hidden||P.cineFly||P.bhLaunch>Game.time||P.bhPause>Game.time||P.y>groundY(P.x,P.z)+4) return; const dx=x-P.x, dz=z-P.z, d=Math.hypot(dx,dz)||1; if(d>o.range) return;
  const f=o.pull*1.3*k*(.45+.55*(1-d/o.range))*(P.dash>0?.45:1), q=twClampXZ(P.x+dx/d*f*dt,P.z+dz/d*f*dt,.3); P.x=q.x; P.z=q.z;
  if(Math.random()<.55) FX.spawn(P.x+rnd(-.5,.5),P.y+rnd(.2,1.7),P.z+rnd(-.5,.5),dx/d*f*1.8,0,dz/d*f*1.8,.3,Math.random()<.5?0x8a2aff:0x1a0a2a,.18,0,true);
  if(d<o.eat&&P.y<groundY(x,z)+2.2&&s.ate<=0){ s.ate=1.5; twHoleEat(x,z,o.dmg); } }
function twMiniHole(x,z,o){ o=Object.assign({r:.7,pull:4.5,range:5.5,dur:6,eat:.95,dmg:5,vx:0,vz:0,h:1.1},o||{}); const V=twHoleVis(x,groundY(x,z)+o.h,z,o.r,o.disk), s={x,z,t:0,ate:0};
  const h=twHz({upd(dt,play){ if(play){ s.t+=dt; s.x+=o.vx*dt; s.z+=o.vz*dt; const c=twClampXZ(s.x,s.z,1.4); if(c.x!==s.x) o.vx*=-1; if(c.z!==s.z) o.vz*=-1; s.x=c.x; s.z=c.z; if(s.ate>0) s.ate-=dt; }
      const k=Math.min(1,s.t*2.5)*Math.min(1,Math.max(0,(o.dur-s.t)*3)); V.x=s.x; V.z=s.z; V.y=groundY(s.x,s.z)+o.h; V.t=s.t; V.set(k); h._x=s.x; h._z=s.z;
      if(play&&k>.3) d5Suck(s.x,s.z,o,k,s,dt);
      // scythes that fly close get dragged into orbit and flung
      if(play&&o.grab) for(const b of BOLTS){ if(b.dead||b.friendly||b.kind!=='scythe') continue; const bx=s.x-b.x, bz=s.z-b.z, bd=Math.hypot(bx,bz)||1; if(bd<o.range*.7){ b.vx+=bx/bd*9*dt; b.vz+=bz/bd*9*dt; b.life=Math.max(b.life,b.t+.6); } }
      return s.t<o.dur; }, kill(){ V.kill(); }});
  h._x=x; h._z=z; h.hole=s; return h; }

// =====================================================================
// MIRA: out of the cage, running around the field and dodging everything on her own (she cannot be hit)
// =====================================================================
function d5MiraOn(){ let mi=Game.mira; if(!mi){ mi=Game.mira={x:Player.x-2,z:Player.z+1.5,y:Player.y,f:1,anim:'idle',t:0,follow:false,vis:true}; makeMiraSprite(); }
  mi.vis=true; mi.follow=false; const cage=Game.actors&&Game.actors.find(a=>a.kind==='cage'); if(cage) cage.open=1; TW.d5mira={tx:mi.x,tz:mi.z,cd:0,hop:0,vy:0,bark:rnd(5,9),dodge:0}; }
function d5MiraUpd(dt){ const S=TW.d5mira, mi=Game.mira, F=d5F(); if(!S||!mi||!F){ return; } if(Game.state!=='play'||F.miraHold) return;
  mi.t+=dt; S.cd-=dt; S.bark-=dt; S.dodge=Math.max(0,S.dodge-dt); const A=twBounds();
  // what is coming at her: enemy bolts and hazards close by
  let tx=null, tz=null; for(const b of BOLTS){ if(b.dead||b.friendly) continue; const d=Math.hypot(b.x-mi.x,b.z-mi.z); if(d<2.6&&S.dodge<=0){ const sx=-b.vz, sz=b.vx, sl=Math.hypot(sx,sz)||1, s=Math.random()<.5?1:-1; tx=mi.x+sx/sl*3*s; tz=mi.z+sz/sl*3*s; break; } }
  if(tx==null&&S.dodge<=0) for(const h of TW.hz){ if(h._x==null) continue; const d=Math.hypot(h._x-mi.x,h._z-mi.z); if(d<2.2){ const a=Math.atan2(mi.z-h._z,mi.x-h._x)+rnd(-.6,.6); tx=mi.x+Math.cos(a)*3.4; tz=mi.z+Math.sin(a)*3.4; break; } }
  if(tx!=null){ const c=twClampXZ(tx,tz,1.2); S.tx=c.x; S.tz=c.z; S.dodge=.7; S.hop=Math.max(S.hop,.01); S.vy=6.5; FX.burst(mi.x,mi.y+.2,mi.z,8,0xe8d8c0,3,.25,false); Sound.sfx('dash');
    if(S.bark<=0){ S.bark=rnd(7,12); d5Bark('mira'); } }
  else if(S.cd<=0||Math.hypot(S.tx-mi.x,S.tz-mi.z)<.3){ S.cd=rnd(1.2,2.4); const P=Player; let best=null, bd=-1; for(let k=0;k<6;k++){ const x=rnd(A.x0+1.5,A.x1-1.5), z=rnd(A.z0+1.5,A.z1-1.5), d=Math.min(Math.hypot(x-P.x,z-P.z),...TW.foes.map(T=>Math.hypot(x-T.x,z-T.z))); if(d>bd){ bd=d; best={x,z}; } } S.tx=best.x; S.tz=best.z;
    if(Math.random()<.25){ S.vy=5.5; S.hop=.01; } }
  const dx=S.tx-mi.x, dz=S.tz-mi.z, d=Math.hypot(dx,dz), sp=S.dodge>0?11:6.2; if(d>.05){ const k=Math.min(d,sp*dt)/d; mi.x+=dx*k; mi.z+=dz*k; mi.f=dx>=0?1:-1; }
  const gy=groundY(mi.x,mi.z); if(S.hop>0){ S.hop+=dt; S.vy-=22*dt; mi.y+=S.vy*dt; if(mi.y<=gy){ mi.y=gy; S.hop=0; S.vy=0; } } else mi.y=gy;
  mi.anim=S.hop>0?'jump':d>.1?'run':'idle'; }
(function(){ const uw=updateWorld; updateWorld=function(dt){ uw.apply(this,arguments); try{ d5MiraUpd(dt); }catch(e){ console.error('d5 mira',e); } }; })();

// =====================================================================
// ALI DIES: he blows up into pieces; six seconds later a storm of Judgement Cuts stitches him back together
// =====================================================================
(function(){ const ah=twAllyHurt; twAllyHurt=function(A,dmg){ const r=ah.apply(this,arguments); try{ if(A&&A.who==='ali'&&d5F()&&A.hp<=0&&!A.gib) d5AliGib(A); }catch(e){ console.error('d5 gib',e); } return r; };
  const ua=twUpdateAlly; twUpdateAlly=function(A,dt,play){ if(A&&A.gib){ try{ d5AliGibUpd(A,dt); }catch(e){ console.error('d5 gib upd',e); A.gib=null; A.hidden=false; } return; } return ua.apply(this,arguments); }; })();
function d5AliGib(A){ A.gib={t:0,jc:0}; A.down=99; A.hp=0; A.cmb=null; const S=twSprOf(A); try{ S.draw((c,cx,by)=>drawAliHD(c,cx,by,A.f,{t:A.t,anim:'hurt'})); gibsFromSprite(S,{cols:8,rows:7,n:44}); }catch(e){}
  A.hidden=true; S.show(false); const gy=groundY(A.x,A.z); for(let i=0;i<3;i++) FX.burst(A.x,gy+1.2,A.z,40,i%2?0x8a0a14:0xd01a2a,7+i*2,.5,false); Sound.sfx('gore'); Sound.sfx('squelch'); shake(.6);
  const F=d5F(); F.aliGibN=(F.aliGibN||0)+1; if(F.aliGibN===1) d5Bark('aliGib',0); else if(Math.random()<.6) d5Bark('aliGib',1+Math.floor(Math.random()*2)); }
function d5AliGibUpd(A,dt){ const G=A.gib; G.t+=dt; A.down=99; A.hidden=true; if(Game.state!=='play'&&Game.state!=='cut') return;
  if(G.t>5.2){ if(Math.random()<.6){ twTinyJC(A.x,A.y+1.1,A.z,rnd(60,140)); Sound.sfx(Math.random()<.5?'swing':'hit'); } JC.flash=Math.max(JC.flash||0,.15); if(Math.random()<.4) FX.cut(A.x,A.y+1,A.z); }
  if(G.t>=6){ A.gib=null; A.hidden=false; A.hp=A.maxHp; A.down=0; A.inv=1.5; const gy=groundY(A.x,A.z); A.y=gy; FX.burst(A.x,gy+1.2,A.z,40,0xff2a3a,6,.35); FX.ring(A.x,gy+.1,A.z,'#ff3a4a',3,.4); Sound.sfx('secret'); Sound.sfx('crossboom'); JC.flash=.4;
    const F=d5F(); if(F){ if(!F.aliBag||!F.aliBag.length) F.aliBag=D5.aliBack.map((_,i)=>i).sort(()=>Math.random()-.5); d5Bark('aliBack',F.aliBag.pop()); } } }

// =====================================================================
// CAOTAN: ten laser patterns, mixed and matched (blue = low, jump it; pink = a wall, move)
// =====================================================================
function d5Glint(C){ C.push=.3; C.glintT=.4; Sound.sfx('ting'); }
function d5Lane(x0,z0,a,len,w,warn,col){ twBeam({x:x0,z:z0,ang:a,len,w,warn,dur:.3,dmg:3,col:col||0xffa0d8,jump:false}); }
const D5CP={
  // two blue beams cross on you
  *x(C,sp){ const P=Player, a=rnd(0,Math.PI); d5Glint(C); for(const k of [0,Math.PI/2]) twBlue(P.x,P.z,a+k,{warn:.55/sp}); yield .75; },
  // blue beams spinning around him (two, three in phase III)
  *spin(C,sp,ph){ const n=ph>=3?3:2, dir=Math.random()<.5?1:-1, b0=rnd(0,6.28); d5Glint(C); for(let k=0;k<n;k++) twBeam({x:C.x,z:C.z,ang:t=>b0+k*6.283/n+Math.max(0,t-.8)*1.05*dir,len:18,w:1,warn:.8,dur:2.6,dmg:3,col:0xbfe4ff}); yield 1.2; },
  // a pink fan at you: stand in a gap
  *fan(C,sp,ph){ const P=Player, a0=Math.atan2(P.z-C.z,P.x-C.x), n=ph>=2?7:5; d5Glint(C); for(let i=0;i<n;i++) twPink(C.x,C.z,a0+(i-(n-1)/2)*.3,{warn:.6/sp}); yield .9; },
  // the Senpai Cage
  *cage(C,sp){ yield* twCage(C,sp); },
  // one slow blue sweep across the field
  *sweep(C,sp){ const P=Player, dir=Math.random()<.5?1:-1, b0=Math.atan2(P.z-C.z,P.x-C.x)-dir*1.3; d5Glint(C); twBeam({x:C.x,z:C.z,ang:t=>b0+Math.max(0,t-.8)*1.7*dir,len:30,w:1.2,warn:.8,dur:1.6,dmg:3,col:0xbfe4ff}); yield 1.3; },
  // pink lanes across the whole field, one lane safe
  *lanes(C,sp){ const B=twBounds(), vert=Math.random()<.5, n=7, safe=1+Math.floor(Math.random()*(n-2)), w=((vert?B.x1-B.x0:B.z1-B.z0)/n)*.82; d5Glint(C);
    for(let i=0;i<n;i++){ if(i===safe) continue; const f=(i+.5)/n; if(vert) d5Lane(lerp(B.x0,B.x1,f),B.z0-1,Math.PI/2,B.z1-B.z0+2,w,(.75+i*.05)/sp); else d5Lane(B.x0-1,lerp(B.z0,B.z1,f),0,B.x1-B.x0+2,w,(.75+i*.05)/sp); } yield 1.1; },
  // a pink beam that hits the wall and comes back blue
  *ricochet(C,sp){ const P=Player, a=Math.atan2(P.z-C.z,P.x-C.x), w=twRayWall(C.x,C.z,Math.cos(a),Math.sin(a)); d5Glint(C); twPink(C.x,C.z,a,{warn:.55/sp});
    const hx=C.x+Math.cos(a)*w.t, hz=C.z+Math.sin(a)*w.t, ra=w.ax==='x'?Math.atan2(Math.sin(a),-Math.cos(a)):Math.atan2(-Math.sin(a),Math.cos(a)); twBeam({x:hx,z:hz,ang:ra,len:twRayWall(hx,hz,Math.cos(ra),Math.sin(ra)).t,w:1.1,warn:.85/sp,dur:.22,dmg:3,col:0x9fd8ff,jump:true,y:.45}); yield 1; },
  // three quick snipes where you are going
  *snipe(C,sp){ for(let i=0;i<3;i++){ const P=Player, tx=P.x+P.vx*.35, tz=P.z+P.vz*.35, a=Math.atan2(tz-C.z,tx-C.x); d5Glint(C); twPink(C.x,C.z,a,{warn:.42/sp,w:.8}); yield .32; } yield .3; },
  // a star of blue beams through you, one after another
  *star(C,sp){ const P=Player, cx=P.x, cz=P.z, a0=rnd(0,6.28); d5Glint(C); for(let k=0;k<5;k++) twBlue(cx,cz,a0+k*Math.PI/5,{warn:(.5+k*.16)/sp}); yield 1.2; },
  // a grid: rows, then columns, offset half a cell
  *grid(C,sp){ const P=Player, cx=P.x, cz=P.z, s=3; d5Glint(C); for(let k=-2;k<=2;k++){ d5Lane(cx-16,cz+k*s,0,32,.8,.7/sp); } yield .55; d5Glint(C); for(let k=-2;k<=2;k++){ d5Lane(cx+k*s+s/2,cz-16,Math.PI/2,32,.8,.7/sp); } yield .9; }};
function* d5CaoMix(C,ph,n){ const keys=Object.keys(D5CP).sort(()=>Math.random()-.5).slice(0,n); if(Math.random()<.5) d5Bark('caoBark');
  for(const k of keys){ const sp=twSp(C)*(1+(ph-1)*.08); yield* D5CP[k](C,sp,ph); yield [0,.5,.32,.2][ph]; } }

// =====================================================================
// OMAR: scythe, Getsuga and black hole combos
// =====================================================================
function d5Portal(x,z,a,dur,col){ const g=new THREE.Group(), gy=groundY(x,z); const r1=new THREE.Mesh(new THREE.TorusGeometry(1.25,.13,6,32),new THREE.MeshBasicMaterial({color:col||0x9a4aff})), r2=new THREE.Mesh(new THREE.CircleGeometry(1.15,32),new THREE.MeshBasicMaterial({color:0x05010a,transparent:true,opacity:.85,side:THREE.DoubleSide}));
  g.add(r1,r2); g.position.set(x,gy+1.4,z); g.rotation.y=-a+Math.PI/2; g.userData.tw=1; scene.add(g); const s={t:0};
  twHz({upd(dt,play){ if(play) s.t+=dt; const k=Math.min(1,s.t*4)*Math.min(1,Math.max(0,(dur-s.t)*4)); g.scale.setScalar(Math.max(.01,k)); r1.rotation.z+=dt*3; if(Math.random()<.6){ const b=rnd(0,6.28); FX.spawn(x+Math.cos(b)*1.2*Math.sin(a),gy+1.4+Math.sin(b)*1.2,z-Math.cos(b)*1.2*Math.cos(a),0,0,0,.35,Math.random()<.5?0x9a4aff:0x1a0a2a,.25,0,true); } return s.t<dur; }, kill(){ scene.remove(g); }}); return g; }
const D5OC={
  // a ring of scythes closing in on you, one gap
  *ring(O,sp,ph){ const P=Player, n=ph>=3?16:12, R=7.5, gap=Math.floor(Math.random()*n); O.cast=.6; Sound.sfx('swing');
    for(let i=0;i<n;i++){ if(i===gap||i===(gap+1)%n) continue; const a=i*6.283/n, x=P.x+Math.cos(a)*R, z=P.z+Math.sin(a)*R; twBolt(O,{kind:'scythe',x,y:groundY(x,z)+1.1,z,vx:-Math.cos(a)*6*sp,vz:-Math.sin(a)*6*sp,dmg:2,life:2.6,col:0x8a3aff,storm:1}); } yield 1.4; },
  // two scythes curving in from both sides, twice
  *curve(O,sp){ for(let r=0;r<2;r++){ O.cast=.5; for(const s of [-1,1]){ const hx=O.x+s*1.4, hz=O.z, P=Player, y=groundY(hx,hz)+1.1, aa=Math.atan2(P.z-hz,P.x-hx), d=Math.max(3,Math.hypot(P.x-hx,P.z-hz)), off=.95*s, v=10*sp;
        twBolt(O,{kind:'scythe',x:hx,y,z:hz,vx:Math.cos(aa+off)*v,vz:Math.sin(aa+off)*v,curl:-2*off*v/(d*1.1),dmg:2,life:d*1.25/v+1,col:0x8a3aff}); } Sound.sfx('swing'); yield .6; } yield .3; },
  // a Getsuga fan from wherever he blinks to
  *fan(O,sp,ph){ const e=twEdgePt(8); twBlink(O,e.x,e.z); yield .2; const P=Player, a=Math.atan2(P.z-O.z,P.x-O.x), n=ph>=3?5:3; for(let i=0;i<n;i++) twGetsuga(O,a+(i-(n-1)/2)*.38,{warn:.6/sp}); yield 1.1; },
  // Getsugas from three edges, one after another
  *edges(O,sp){ for(let i=0;i<3;i++){ const e=twEdgePt(9); twBlink(O,e.x,e.z); const P=Player; twGetsuga(O,Math.atan2(P.z-O.z,P.x-O.x),{warn:.5/sp}); yield .55; } yield .5; },
  // a black hole next to you that swallows his scythes into orbit and flings them
  *hole(O,sp,ph){ const P=Player, a=rnd(0,6.28), x=P.x+Math.cos(a)*3.6, z=P.z+Math.sin(a)*3.6; twMiniHole(x,z,{r:.8,pull:4.2,range:6,dur:4.2,eat:1,dmg:4,grab:1});
    yield .6; for(let i=0;i<(ph>=2?6:4);i++){ const P2=Player; twAimBolt(O,'scythe',O.x,O.y+1.2,O.z,11*sp,rnd(-.25,.25),{col:0x8a3aff,dmg:2,life:3}); Sound.sfx('swing'); yield .35; } yield .6; },
  // a hole behind you, a Getsuga from the front: the pull drags you into the lane
  *holeLane(O,sp){ const P=Player, a=Math.atan2(O.z-P.z,O.x-P.x), hx=P.x-Math.cos(a)*4, hz=P.z-Math.sin(a)*4; twMiniHole(hx,hz,{r:.85,pull:4,range:6.5,dur:3.2,eat:1,dmg:4}); yield .7;
    const P2=Player; twGetsuga(O,Math.atan2(P2.z-O.z,P2.x-O.x),{warn:.75/sp}); yield .5; twGetsuga(O,Math.atan2(P2.z-O.z,P2.x-O.x)+rnd(-.3,.3),{warn:.75/sp}); yield 1; },
  // portals: a Getsuga goes in next to him and comes out somewhere else, at you
  *portal(O,sp,ph){ for(let r=0;r<(ph>=2?2:1);r++){ const P=Player, a1=Math.atan2(P.z-O.z,P.x-O.x), ex=twEdgePt(6.5), ea=Math.atan2(P.z-ex.z,P.x-ex.x);
      d5Portal(O.x+Math.cos(a1)*2,O.z+Math.sin(a1)*2,a1,2.2); d5Portal(ex.x,ex.z,ea,2.2); O.scythe=1; O.swing=1; Sound.sfx('void'); yield .35;
      twGetsuga(O,a1,{warn:0,len:2.2,sp:16}); yield .25; const P2=Player; twGetsuga(null,Math.atan2(P2.z-ex.z,P2.x-ex.x),{x:ex.x,z:ex.z,warn:.55/sp,sp:15}); yield .8; } },
  // the giant scythe drops where you stand
  *drop(O,sp){ for(let i=0;i<2;i++){ const P=Player; twBigScythe(P.x,P.z,.55); twBlast(P.x,P.z,1.7,.55,{col:0xff1a3a,burst:0x2a0010,ring:'#ff2a3a',dmg:4,dark:1,shake:.5,sfx:'crossboom'}); Sound.sfx('gong'); yield .75/sp; } yield .3; },
  // scythes from the sky onto you and around you
  *sky(O,sp){ O.cast=.8; for(let i=0;i<8;i++){ const P=Player, a=rnd(0,6.28), r=i%3?rnd(1,3):0; twSkyScythe(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,.75/sp,{quiet:i>0}); yield .16; } yield .8; },
  // the red rally scythe joins in
  *rally(O,sp){ if(typeof twRallySpawn==='function'&&!twRallyAlive('slow')) twRallySpawn(O,'slow'); yield* D5OC.curve(O,sp); }};
function* d5OmarMix(O,ph,n){ const keys=Object.keys(D5OC).sort(()=>Math.random()-.5).slice(0,n); if(Math.random()<.45) d5Bark('omarBark');
  for(const k of keys){ const sp=twSp(O)*(1+(ph-1)*.06); yield* D5OC[k](O,sp,ph); yield [0,.45,.3,.2][ph]; } O.scythe=0; O.swing=0; }
// the new moves: Caotan's lasers, Omar's combos, or both at once (Omar runs his part alongside)
DUO.laserMix=function*(C,O,ph){ yield* d5CaoMix(C,ph,[0,2,3,4][ph]); yield .3; };
DUO.omarMix=function*(C,O,ph){ twDuoAlso(O,d5OmarMix(O,ph,[0,2,3,3][ph])); yield .2; while(O.gen) yield .1; };
DUO.duoMix=function*(C,O,ph){ twDuoAlso(O,d5OmarMix(O,ph,[0,2,2,3][ph])); if(Math.random()<.3){ const i=2*Math.floor(Math.random()*D5.banter.length/2); d5Bark('banter',i); } yield* d5CaoMix(C,ph,[0,2,2,3][ph]); while(O.gen) yield .1; };
DUO3_POOL[1]=['glompReap','tagTeam','volley','sentenceSnipe','crossfire','cage','laserStorm','laserMix','omarMix','duoMix','duoMix'];
DUO3_POOL[2]=['glompReap','tagTeam','volley','prism','horizon','getsugaLaser','ricochet','scytheCyclone','getsugaGauntlet','laserMix','omarMix','duoMix','duoMix'];
DUO3_POOL[3]=['glompReap','volley','prism','horizon','getsugaLaser','hikariGetsuga','tearRift','pillowHoles','doubleCage','laserStorm','scytheCyclone','getsugaGauntlet','laserMix','omarMix','duoMix','duoMix'];
Object.assign(DUO3_RANGED,{laserMix:'caotan',omarMix:'omar',duoMix:'caotan'}); DUO3.gap=[0,.6,.45,.35];

// =====================================================================
// PHASES: I ends in the Getsuga clash, II ends in Omar's limit cut, III ends in Caotan's limit cut, then the Burnout.
// Every phase opens on a Zelda-style title.
// =====================================================================
twDuoPhaseCine=function*(F,C,O){ const P=Player; Sound.stop(); Game.letterTo=1; P.inv=99; FX.flash=.7; impactFrame([[2,2],[1,1]]); Sound.sfx('crash'); shake(.7); F.mid=null; F.guard=null; F.kick=null; TW.sentence=null; F.miraHold=1;
  if(F.phase===3){ if(!F.caoLC){ yield* d5CaoLCIntro(F,C,O); return; } if(!F.burned){ yield* twBurnoutIntro(F,C,O); return; } yield* twDuoEnding(F,C,O); return; }
  if(F.phase===2){ yield* d5OmarLCIntro(F,C,O); return; }
  yield* twDuo3Trans1(F,C,O); yield* d5PhaseStart(F,C,O); };
const D5_TITLE=['',["Phase I","Caotan & Omar","The Gatekeeper Twins"],["Phase II","Caotan & Omar","The Sibling Sync"],["Phase III","Caotan & Omar","Strangers Bound by Fate"]];
function* d5PhaseStart(F,C,O){ const P=Player, A=twAliAny(); F.phase++; const ph=F.phase; F.d5lc=null;
  for(const T of [C,O]) Object.assign(T,{phase:ph,hp:DUO_HP[ph],maxHp:DUO_HP[ph],down:0,inv:false,stun:0,gen:null,state:'idle',bag:[],hide:0,hy:1.3,lockF:0,scythe:0,swing:0,cast:0,mv:null});
  F.bag=[]; F.busy=0; F.dcd=1.8; F.director=0; F.lc=0; F.lcDone={2:1,3:1}; if(A){ A.hold=0; A.face=null; }
  if(F.bonusStun){ for(const T of F.bonusStun.who){ T.stun=F.bonusStun.t; T.state='stun'; } F.bonusStun=null; }
  Sound.play(['','boss','diva','seraph'][ph]); yield* d5Title(ph,C,O);
  yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.7); Cam.cine=null; Game.letterTo=0; P.inv=1; P.cineFly=false; P.cineAnim=null; F.director=1; F.miraHold=0; twDuoSeed(DUO3.seed[ph]||0); }
function* d5Title(ph,C,O,t){ const T=t||D5_TITLE[ph], mx=(C.x+O.x)/2, mz=(C.z+O.z)/2; twZeldaCard(T[0],T[1],T[2],2.8); yield* twZeldaPan({x:mx,z:mz},2.6); }

// I -> II: they argue about the sync, Shayan and Ali charge, a pillow and a scythe block them, then the Getsuga clash
function* twDuo3Trans1(F,C,O){ const P=Player, A=twAliAny(), c=F.center, gy=groundY(c.x,c.z), dt=1/60, mi=Game.mira;
  C.down=O.down=1; C.mv=O.mv=null; C.inv=O.inv=true; Object.assign(C,{x:c.x-1.5,z:c.z-1.6,lockF:1,f:1}); Object.assign(O,{x:c.x+1.6,z:c.z-1.6,lockF:1,f:-1});
  Object.assign(P,{x:c.x-3,z:c.z+5,vx:0,vz:0}); P.y=groundY(P.x,P.z); P.f=1; if(A){ A.hold=1; A.x=c.x+3; A.z=c.z+5.2; A.face=-1; } if(mi){ mi.x=c.x-7; mi.z=c.z+6; mi.y=groundY(mi.x,mi.z); mi.anim='idle'; mi.f=1; }
  // a slow push-in on the twins, down in the dirt
  cineSet(c.x,gy+.7,c.z+6,c.x,gy+1.1,c.z-1.6); yield cineTo([c.x,gy+1.4,c.z+3.4],[c.x,gy+1.2,c.z-1.6],1.4,twEIO);
  yield d5Say('trans1',0,'surprised'); cineSet(O.x+.9,gy+1.6,O.z+2.6,O.x,gy+1.6,O.z); yield d5Say('trans1',1); cineSet(C.x-.9,gy+1.6,C.z+2.6,C.x,gy+1.5,C.z); yield d5Say('trans1',2,'surprised');
  cineSet(O.x+.7,gy+1.5,O.z+2.2,O.x,gy+1.7,O.z); yield d5Say('trans1',3); C.down=O.down=0; cineSet(C.x-.6,gy+1.6,C.z+2,C.x,gy+1.6,C.z); shake(.3); yield d5Say('trans1',4,'angry');
  // the twins rise and start to glow; low angle on Shayan and Ali
  Sound.sfx('charge'); Sound.sfx('drone'); C.cast=2; O.cast=2; cineSet(P.x+1.5,P.y+.6,P.z+3,P.x+.6,P.y+1.6,P.z-2); yield d5Say('trans1',5,'surprised');
  if(A){ cineSet(A.x-1.2,A.y+.7,A.z+3,A.x-.4,A.y+1.6,A.z); yield d5Say('trans1',6); cineSet((P.x+A.x)/2,P.y+1.3,P.z+4.4,(P.x+A.x)/2,P.y+1.3,P.z); yield d5Say('trans1',7,'surprised'); yield d5Say('trans1',8); }
  // the charge: a tracking shot low behind Shayan, Ali blinking ahead in red afterimages
  P.cineFly=true; P.cineAnim='dash'; Sound.sfx('dash'); const p0={x:P.x,z:P.z}, tgt={x:C.x+.9,z:C.z+.9};
  for(let t=0;t<.75;t+=dt){ const u=twEIO(t/.75); P.x=lerp(p0.x,tgt.x,u); P.z=lerp(p0.z,tgt.z,u); P.y=groundY(P.x,P.z); cineSet(P.x-1.4,P.y+.8,P.z+3.2,P.x+.6,P.y+1.2,P.z-3);
    if(A&&Math.floor(t/.22)!==Math.floor((t-dt)/.22)){ aliGhost(A.x,A.y,A.z); const u2=Math.min(1,(t+dt)/.66); A.x=lerp(c.x+3,O.x-.9,u2); A.z=lerp(c.z+5.2,O.z+.9,u2); Sound.sfx('dash'); FX.burst(A.x,A.y+1,A.z,12,0xb0182a,3,.3); }
    if(Math.random()<.8) FX.spawn(P.x,P.y+.2,P.z,rnd(-1,1),rnd(.5,1.5),2,.4,0xd8c0c8,.25,0,false); yield wait(dt*.5); }
  // blocked: Hikari-chan takes Shayan's sword, Omar's scythe takes Ali's (freeze frame, then the shockwave)
  const H=twHikari((P.x+C.x)/2,(P.z+C.z)/2+.1,1); P.cineAnim='charge'; O.scythe=1; O.swing=1; impactFrame([[1,3],[2,2],[3,1]]); Sound.sfx('block'); Sound.sfx('clash'); shake(.9); FX.flash=.5; grade.uniforms.flashCol.value.set(1,1,1); FX.hitstop=.25;
  FX.burst(H.x,H.y,H.z,30,0xffffff,5,.35,false); if(A){ const mx=(A.x+O.x)/2, mz=(A.z+O.z)/2; for(let i=0;i<4;i++) FX.spark(mx,O.y+1.2,mz); }
  const m1=(P.x+C.x)/2; cineSet(m1+.4,gy+1.5,P.z+2.2,m1,gy+1.4,P.z-.3); yield wait(.55); if(A){ const mx=(A.x+O.x)/2, mz=(A.z+O.z)/2; cineSet(mx-.3,gy+1.5,mz+2.4,mx,gy+1.5,mz); Sound.sfx('clash'); yield wait(.5); }
  Sound.sfx('crossboom'); FX.flash=.7; grade.uniforms.flashCol.value.set(1,.7,.95); impactFrame([[3,2],[1,2]]); shake(1.2); for(let i=0;i<3;i++) FX.ring((C.x+O.x)/2,gy+.1,c.z-1.6,i%2?'#ff6ab0':'#8a3aff',5+i*3,.5);
  cineSet(c.x,gy+2.6,c.z+10,c.x,gy+1.3,c.z); P.cineAnim='hurt'; twAnim(P,{x:c.x-5,z:c.z+.4},.4,twEOut3); if(A) twAnim(A,{x:c.x-5.4,z:c.z-1.3},.4,twEOut3); H.kill(); yield wait(.55);
  P.cineFly=false; P.cineAnim=null; O.scythe=0; O.swing=0; C.lockF=O.lockF=0; C.cast=O.cast=0;
  yield* twGetsugaClash(F,C,O);
  // after the clash
  C.inv=O.inv=true; const mx=(C.x+O.x)/2, mz=(C.z+O.z)/2;
  if(F.bonusStun){ cineSet(O.x+.8,gy+1.4,O.z+3,O.x,gy+1.7,O.z); yield d5Say('trans1',9,'sad'); cineSet(mx,gy+1.8,mz+5,mx,gy+1.5,mz); yield d5Say('trans1',10); yield d5Say('trans1',11,'sad'); }
  if(mi){ cineSet(mi.x+1.2,mi.y+1.4,mi.z+3.6,mi.x,mi.y+1.2,mi.z); mi.anim='jump'; yield d5Say('trans1',12,'happy'); mi.anim='idle'; }
  C.form=O.form=2; C.tint=0xffe8f4; }

// ---------- the betrayal: the twins turn, time stops, Ali walks in and cuts Mira out of her cage ----------
function* twTwinsTurn(){ const P=Player, mi=Game.mira; Sound.stop(); Game.letterTo=1; P.inv=99; const C=TW.allies.find(a=>a.who==='caotan'), O=TW.allies.find(a=>a.who==='omar');
  const cx=C?C.x:P.x-2, cz=C?C.z:P.z-2, ox=O?O.x:P.x+2, oz=O?O.z:P.z-2, mx=(cx+ox)/2, mz=(cz+oz)/2, gy=P.y;
  // a crane shot down from the eclipse onto the two of them
  cineSet(mx,gy+11,mz+14,mx,gy+5,mz); yield cineTo([mx,gy+2.4,mz+7],[mx,gy+1.7,mz],2,twEIO);
  yield d5Say('intro',0,'happy'); cineSet(ox+.8,gy+1.7,oz+2.8,ox,gy+1.8,oz); yield d5Say('intro',1);
  cineSet(P.x-1,P.y+1.2,P.z+3,P.x,P.y+1.4,P.z); yield d5Say('intro',2,'angry');
  cineSet(cx-.8,gy+1.7,cz+2.6,cx,gy+1.7,cz); yield d5Say('intro',3,'happy'); cineSet(ox+.8,gy+1.4,oz+2.6,ox,gy+1.9,oz); yield d5Say('intro',4);
  const cage=Game.actors&&Game.actors.find(a=>a.kind==='cage'); if(mi){ cineSet(mi.x+1.4,mi.y+1.4,mi.z+3.4,mi.x,mi.y+1.2,mi.z); yield d5Say('intro',5,'angry'); }
  twClearAllies(); twDuoStart(cx,cz,ox,oz); const D=TW.fight; D.noAttack=true; Game.state='cut'; D.miraHold=1;
  for(const T of TW.foes){ T.inv=true; } yield wait(.3); Sound.sfx('charge'); Sound.sfx('drone');
  cineSet(P.x-2,P.y+.6,P.z+5,P.x,P.y+1.8,P.z-2); TW.foes.forEach(T=>{ T.cast=2; T.fire=2; }); yield wait(.8);
  // time stops. a red line crosses the screen. someone is standing next to Shayan.
  zwStart(); Sound.sfx('secret'); JC.flash=.5; yield wait(.6); twAddAlly('ali'); const A=TW.allies[TW.allies.length-1]; A.x=P.x+1.6; A.z=P.z+.8; A.y=groundY(A.x,A.z); A.hold=1; A.face=-1;
  FX.burst(A.x,A.y+1,A.z,40,0xb0182a,5,.35); cineSet(A.x+.6,A.y+.5,A.z+3.2,A.x,A.y+1.5,A.z); yield wait(.5); yield d5Say('intro',6);
  // he cuts the cage open without looking at it
  if(mi){ const cx2=cage?cage.x:mi.x, cz2=cage?cage.z:mi.z; aliGhost(A.x,A.y,A.z); A.x=cx2+1.2; A.z=cz2+.6; Sound.sfx('dash'); cineSet(cx2+.8,groundY(cx2,cz2)+1.6,cz2+4,cx2,groundY(cx2,cz2)+1.2,cz2); yield wait(.25);
    for(let i=0;i<5;i++){ twTinyJC(cx2,groundY(cx2,cz2)+1.2,cz2,160); Sound.sfx('swing'); yield wait(.06); } JC.flash=.4; if(cage) cage.open=1; Sound.sfx('shatter'); FX.burst(cx2,groundY(cx2,cz2)+1,cz2,30,0xb0a080,4,.4,false);
    yield d5Say('intro',7); zwEnd(); yield d5Say('intro',8,'happy'); aliGhost(A.x,A.y,A.z); A.x=P.x+1.6; A.z=P.z+.8; Sound.sfx('dash'); } else zwEnd();
  d5MiraOn(); D.miraHold=1; cineSet((P.x+A.x)/2,P.y+1.1,P.z+4.2,(P.x+A.x)/2,P.y+1.4,P.z); yield d5Say('intro',9,'surprised'); yield d5Say('intro',10);
  cineSet(cx-.6,gy+1.6,cz+2.4,cx,gy+1.6,cz); yield d5Say('intro',11,'surprised'); cineSet(ox+.6,gy+1.5,oz+2.4,ox,gy+1.8,oz); yield d5Say('intro',12,'sad');
  // the line-up: a low wide shot, both sides
  cineSet(P.x+.5,P.y+.5,P.z+4.5,mx,gy+1.8,mz); yield d5Say('intro',13); yield d5Say('intro',14,'angry'); if(Game.mira){ const m2=Game.mira; cineSet(m2.x+1,m2.y+1.3,m2.z+3.4,m2.x,m2.y+1.2,m2.z); yield d5Say('intro',15,'happy'); }
  yield* twCoopChoice(); A.hold=0; A.face=null;
  Sound.play('boss'); yield* d5Title(1,{x:cx,z:cz},{x:ox,z:oz});
  yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.7); TW.foes.forEach(T=>{ T.inv=false; }); D.noAttack=true; D.director=1; Cam.cine=null; Game.letterTo=0; P.inv=1; Game.state='play'; D.miraHold=0; }
// retries inside a limit cut go straight back into it
function d5Restart(F){ const C=F.C, O=F.O; d5MiraOn(); F.miraHold=0; if(F.d5lc==='omar'){ F.director=0; C.inv=O.inv=true; F.pend=()=>d5OmarLCIntro(F,C,O,true); } else if(F.d5lc==='cao'){ F.director=0; C.inv=O.inv=true; F.pend=()=>d5CaoLCIntro(F,C,O,true); } }

// =====================================================================
// OMAR'S LIMIT CUT: KUROI KAIMON (ends phase II)
// He floats up; tombstones rise that block his Getsugas (they crack and break, and your sword breaks them too); then
// portals send Getsugas and scythes at you from everywhere; then hungry black holes swallow his scythes into orbit.
// Caotan keeps spinning blue lasers, throwing goop and mixing patterns all the while. Then the void eats the sky:
// Ali cuts a tree out of Judgement Cuts, you climb it (it mantles like the town's roofs), and from the platform on top
// your Heavenly Drill (Ali stops time and sharpens it) drills the black hole apart while you mash.
// =====================================================================
const D5T={H:12.6};
// a generator run as a hazard (Caotan's side of a limit cut runs alongside Omar's)
function d5Run(g){ const s={w:0}; return twHz({upd(dt,play){ if(!play) return true; s.w-=dt; let n=0; while(s.w<=0&&n++<20){ let r; try{ r=g.next(); }catch(e){ console.error('d5 run',e); return false; } if(r.done) return false; s.w+=r.value||.1; } return true; }}); }
function d5Goops(C,n){ const P=Player; for(let i=0;i<n;i++){ const a=rnd(0,6.28), r=i?rnd(1.5,3.5):0, p=twClampXZ(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,.6), m=new THREE.Group(); m.userData.tw=1; scene.add(m); twSperm(m,1.5);
    twThrow({x:C.x,y:C.y+1,z:C.z,tx:p.x,tz:p.z,dur:.8,h:3.5,mesh:m,r:1.1,col:0xffffff,trail:0xffffff,onLand(x,z,play){ Sound.sfx('squelch'); twZone(x,z,1.15,4,{slow:.55,col:0xfaf6ff,op:.85,fx:.05,splat:1}); if(play&&twInR(x,z,.95,1.2)) twHitP(1,x,z,{ub:true}); }}); } C.fire=.3; }
function* d5CaoDriver(C,stop){ const keys=Object.keys(D5CP); for(let i=0;!stop();i++){ if(i%3===1) d5Goops(C,3); else if(i%3===0) yield* D5CP.spin(C,1.05,2); else yield* D5CP[keys[Math.floor(Math.random()*keys.length)]](C,1.08,2); if(Math.random()<.25) d5Bark('caoBark'); yield 1.5; } }
// ---------- tombstones: solid, block Getsugas, break ----------
function d5Tomb(x,z){ const gy=groundY(x,z), g=new THREE.Group(), mat=new THREE.MeshLambertMaterial({color:0x3e3850});
  const st=new THREE.Mesh(new THREE.BoxGeometry(1.6,2.6,.7),mat); st.position.y=1.3; const cap=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,.7,16,1,false,0,Math.PI),mat); cap.rotation.set(Math.PI/2,0,Math.PI/2); cap.position.y=2.6;
  const rune=new THREE.Mesh(new THREE.PlaneGeometry(.5,1.1),new THREE.MeshBasicMaterial({color:0xb06aff,transparent:true,opacity:.9})); rune.position.set(0,1.5,.36); g.add(st,cap,rune); g.position.set(x,gy-3,z); g.userData.tw=1; scene.add(g);
  const T={x,z,hp:3,g,rune,dead:false,cells:[],sw:-9}; for(const [ix,iz] of [[Math.floor(x-.5),Math.floor(z)],[Math.floor(x+.3),Math.floor(z)]]){ if(ix<0||iz<0||ix>=L.w||iz>=L.d||T.cells.some(c=>c[0]===ix&&c[1]===iz)) continue; T.cells.push([ix,iz,L.B[iz][ix]]); L.B[iz][ix]=true; }
  twAnim(g.position,{y:gy},.5,twEOut3); FX.burst(x,gy+.2,z,24,0x3a2a30,4,.4,false); Sound.sfx('crash'); return T; }
function d5TombHit(T,d){ if(T.dead) return; T.hp-=d; T.g.rotation.z=rnd(-.08,.08); FX.burst(T.x,groundY(T.x,T.z)+1.4,T.z,14,0x6a6080,4,.3,false); if(T.hp<=0) d5TombBreak(T); }
function d5TombBreak(T){ if(T.dead) return; T.dead=true; for(const [ix,iz,b] of T.cells) L.B[iz][ix]=b; T.cells=[]; scene.remove(T.g); const gy=groundY(T.x,T.z); for(let i=0;i<2;i++) FX.burst(T.x,gy+1.3,T.z,36,i?0x2a2438:0x6a6080,6,.5,false); Sound.sfx('shatter'); shake(.3); }
// your swings break them too
(function(){ const up=updatePlayer; updatePlayer=function(dt){ const r=up.apply(this,arguments); try{ const ts=TW.d5tombs, P=Player; if(ts&&ts.length&&Game.time-(P.swingT||-9)<.12) for(const T of ts){ if(!T.dead&&T.sw!==P.swingT&&Math.hypot(T.x-P.x,T.z-P.z)<2.4){ T.sw=P.swingT; d5TombHit(T,1); Sound.sfx('hit'); } } }catch(e){ console.error('d5 tomb',e); } return r; }; })();
// Omar's Getsuga, stopped by tombstones
function d5Getsuga(T,a,o){ o=Object.assign({sp:14,warn:.55,dmg:3,w:1.45,len:22,s:3.4,col:0x9a4aff},o||{}); const sx=o.x!=null?o.x:T.x, sz=o.z!=null?o.z:T.z, b={x:sx,z:sz,t:0,trav:0,hit:false,on:false}, g=twGetsugaMesh(o.s,o.col);
  g.visible=false; g.rotation.y=-a; if(o.warn>0) FX.line(sx,sz,a,o.len,o.w*2,0x9a4aff,o.warn);
  const h=twHz({upd(dt,play){ if(play) b.t+=dt; if(b.t<o.warn) return true;
      if(!b.on){ b.on=true; g.visible=true; Sound.sfx('beam'); shake(.2); if(T&&T.who==='omar'){ T.swing=1; T.scythe=1; } FX.burst(sx,groundY(sx,sz)+1.5,sz,18,0x8a3aff,5,.35); }
      if(play){ const st=o.sp*dt; b.x+=Math.cos(a)*st; b.z+=Math.sin(a)*st; b.trav+=st; }
      const gy=groundY(b.x,b.z), k=Math.min(1,(o.len-b.trav)*.6); g.position.set(b.x,gy+o.s*.42,b.z); g.userData.mats.forEach(m=>m.opacity=Math.max(0,k)); h._x=b.x; h._z=b.z;
      if(play) for(const t of (TW.d5tombs||[])){ if(!t.dead&&Math.hypot(t.x-b.x,t.z-b.z)<1.4){ d5TombHit(t,1.5); FX.burst(b.x,gy+1.5,b.z,40,0x8a3aff,6,.35); Sound.sfx('crash'); return false; } }
      if(play&&!b.hit){ const P=Player, px=P.x-b.x, pz=P.z-b.z, al=px*Math.cos(a)+pz*Math.sin(a), pe=Math.abs(px*Math.sin(a)-pz*Math.cos(a));
        if(al>-.9&&al<.9&&pe<o.w&&P.y<gy+o.s*.85){ if(twHitP(o.dmg,b.x,b.z,{ub:true})!=='none') b.hit=true; } twAllyLine(b.x-Math.cos(a)*.9,b.z-Math.sin(a)*.9,Math.cos(a),Math.sin(a),1.8,o.w,2); }
      return b.trav<o.len; }, kill(){ scene.remove(g); }});
  h._x=sx; h._z=sz; return h; }
// ---------- the sky hole: huge, a disk around it, drags the ground toward the tree and the loose things up ----------
function d5SkyHole(x,y,z){ const V=twHoleVis(x,y,z,4,true), S={x,y,z,k:0,t:0,crack:0,dead:false,V};
  Game.fxUpd.push(dt=>{ if(S.dead){ V.kill(); return false; } S.t+=dt; S.k=Math.min(1,S.k+dt*.6); V.t=S.t; V.set(S.k*(1+S.crack*.15*Math.sin(S.t*40)));
    for(let i=0;i<3;i++){ const a=rnd(0,6.28), r=rnd(4,14); FX.spawn(x+Math.cos(a)*r,y-rnd(4,12),z+Math.sin(a)*r,-Math.cos(a)*r*.6,rnd(4,9),-Math.sin(a)*r*.6,.8,i%2?0x8a2aff:0x1a0a2a,.35,0,i%2===0); } return true; }); return S; }
// ---------- Ali's tree: a spiral of steps around a trunk, a flat platform on top (it raises the field's height grid; undone after) ----------
function d5TreeBuild(cx,cz,H){ const ix0=Math.floor(cx), iz0=Math.floor(cz), saved=[], meshes=[], set=(ix,iz,h)=>{ if(ix<0||iz<0||ix>=L.w||iz>=L.d) return; saved.push([ix,iz,L.H[iz][ix],L.B[iz][ix]]); L.H[iz][ix]=h; L.B[iz][ix]=false; };
  const dark=new THREE.MeshBasicMaterial({color:0x12040a}), edge=new THREE.LineBasicMaterial({color:0xff3a4a,transparent:true,opacity:.95}), red=0xff2a3a;
  const slab=(x,z,w,d,y)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,.35,d),dark), e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),edge); m.add(e); m.position.set(x,y-.17,z); m.userData.tw=1; m.visible=false; scene.add(m); meshes.push(m); return m; };
  const blade=(x0,y0,z0,x1,y1,z1,w)=>{ for(const [col,ww] of [[red,w],[0xffffff,w*.35]]){ const b=beamMesh(col,ww); b.userData.tw=1; b.position.set(x0,y0,z0); b.lookAt(x1,y1,z1); b.scale.set(1,1,Math.hypot(x1-x0,y1-y0,z1-z0)); b.visible=false; meshes.push(b); } };
  const gy=groundY(cx,cz);
  // the trunk: three blades twisting up to the platform
  for(let k=0;k<3;k++){ const a=k*2.09; blade(ix0+Math.cos(a)*.5,gy,iz0+Math.sin(a)*.5,ix0+Math.cos(a+1.4)*.4,H,iz0+Math.sin(a+1.4)*.4,.5); }
  const ring=[[-1,1],[-2,1],[-2,0],[-2,-1],[-2,-2],[-1,-2],[0,-2],[1,-2],[1,-1],[1,0],[1,1],[0,1]], steps=[];
  ring.forEach(([bx,bz],k)=>{ const h=H*(k+1)/13; for(let a=0;a<2;a++) for(let b=0;b<2;b++) set(ix0+bx*2+a,iz0+bz*2+b,h); const sx=ix0+bx*2+1, sz=iz0+bz*2+1; steps.push(slab(sx,sz,2,2,h)); blade(ix0,h*.85,iz0,sx,h,sz,.22); });
  for(let a=-2;a<2;a++) for(let b=-2;b<2;b++) set(ix0+a,iz0+b,H); const plat=slab(ix0,iz0,4,4,H);
  return {ix0,iz0,H,meshes,steps,plat,saved,kill(){ for(let i=this.saved.length-1;i>=0;i--){ const [ix,iz,h,bl]=this.saved[i]; L.H[iz][ix]=h; L.B[iz][ix]=bl; } this.saved=[]; this.meshes.forEach(m=>scene.remove(m)); this.meshes=[]; }}; }
function d5OnPlatform(S){ const P=Player, T=S.tree; return T&&P.y>T.H-.5&&Math.abs(P.x-T.ix0)<2&&Math.abs(P.z-T.iz0)<2; }
function d5OmarLCClean(F){ const S=F.d5; if(!S) return; S.stop=1; (S.tombs||[]).forEach(d5TombBreak); TW.d5tombs=null; if(S.sky) S.sky.dead=true; if(S.tree) S.tree.kill(); if(S.drill){ S.drill.dead=1; scene.remove(S.drill.g); } if(S.rig) S.rig.dead=1; TW._mantle=0; if(TW.mash&&TW.mash.d5) TW.mash=null; S.cam=null; F.d5=null; F.drillReady=0; }

function* d5OmarLCIntro(F,C,O,retry){ const P=Player, A=twAliAny(), c=F.center, gy=groundY(c.x,c.z), B=twBounds(); F.d5lc='omar'; F.lc=1; F.director=0; F.busy=1; F.miraHold=1;
  twLCPrep(C); twLCPrep(O); C.down=O.down=0; C.inv=O.inv=true; const oz=Math.max(B.z0+1.5,c.z-8.5); Object.assign(O,{x:c.x,z:oz,lockF:1,f:1,hy:1.3}); Object.assign(C,{x:c.x-5,z:c.z-3,lockF:0});
  if(!retry){ Game.letterTo=1; cineSet(c.x,gy+.6,c.z+2,c.x,gy+2,oz); yield wait(.4);
    yield d5Say('omarLC',0,'angry'); Sound.sfx('void'); Sound.sfx('drone'); grade.uniforms.tint.value.set(.82,.74,1.05); twAnim(O,{hy:6},2.2,twEIO);
    yield cineTo([c.x+2,gy+1.2,c.z+6],[c.x,gy+6,oz],2.2,twEIO); cineSet(C.x+1,gy+1.6,C.z+3,C.x,gy+1.6,C.z); yield d5Say('omarLC',1,'happy');
    cineSet(O.x+1.2,gy+6.4,O.z+4,O.x,gy+7,O.z); yield d5Say('omarLC',2,'sad'); cineSet(P.x+1,P.y+.5,P.z+3,P.x,P.y+2.4,P.z-2); yield d5Say('omarLC',3,'surprised'); if(A) yield d5Say('omarLC',4);
    twCutin('omar','KUROI KAIMON','Limit Break  ·  The Black Gate','#3a0a6a',2.2); impactFrame([[2,2],[1,2]]); shake(.8); yield wait(1.6); }
  else { O.hy=6; grade.uniforms.tint.value.set(.82,.74,1.05); }
  yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.6); Cam.cine=null; Game.letterTo=0; P.inv=1; F.miraHold=0;
  C.gen=d5OmarLCPlay(F,C,O); C.wait=0; C.state='lc'; O.gen=twWaitFor(C)(); O.wait=0; O.state='lc'; Sound.play('diva'); }

function* d5OmarLCPlay(F,C,O){ const c=F.center, B=twBounds(), H=D5T.H, S=F.d5={tombs:[],stop:0}; TW.d5tombs=S.tombs; TW.lcCleanup=()=>d5OmarLCClean(F); twCamTrack(.35,1.6);
  d5Run(d5CaoDriver(C,()=>S.stop||!F.d5));
  // A) the tombstones
  for(let k=0;k<6;k++){ const x=c.x+(k-2.5)*3.1, z=c.z-1.8+(k%2?1.6:-1.2); S.tombs.push(d5Tomb(x,z)); yield .18; }
  d5Bark('omarLC',5); twBig('HIDE BEHIND THE GRAVES',{size:44,col:'#c08aff',y:UH*.24,dur:1.6,sub:'They stop his Getsugas, until they break'});
  for(let t=0;t<12;t+=1.2){ const P=Player, a=Math.atan2(P.z-O.z,P.x-O.x); twAnim(O,{x:clamp(c.x+rnd(-5,5),B.x0+2,B.x1-2)},.6,twEIO); d5Getsuga(O,a,{warn:.65,sp:13}); if(t>2.5) d5Getsuga(O,a+(Math.random()<.5?.45:-.45),{warn:.75,sp:13}); if(t>6) d5Getsuga(O,a+(Math.random()<.5?.9:-.9),{warn:.8,sp:13}); yield 1.2; }
  // B) the portals
  d5Bark('omarLC',6); twBig('THE DOORS ARE OPEN',{size:44,col:'#c08aff',y:UH*.24,dur:1.5,sub:'Watch where they come out'});
  for(let w=0;w<5;w++){ const n=w<2?2:3, P=Player; O.scythe=1; O.swing=1; Sound.sfx('void');
    for(let k=0;k<n;k++){ const ea=rnd(0,6.28), e=twClampXZ(P.x+Math.cos(ea)*6.5,P.z+Math.sin(ea)*6.5,1.5), a1=Math.atan2(P.z-O.z,P.x-O.x)+(k-(n-1)/2)*.5;
      d5Portal(O.x+Math.cos(a1)*1.6,O.z+Math.sin(a1)*1.6,a1,2.4); d5Portal(e.x,e.z,Math.atan2(P.z-e.z,P.x-e.x),2.4); twGetsuga(O,a1,{warn:0,len:1.6,sp:14});
      const ex=e.x, ez=e.z; twHz({upd(dt,play){ if(play) this.t+=dt; if(this.t<.45+k*.3) return true; const P2=Player, ea2=Math.atan2(P2.z-ez,P2.x-ex); d5Getsuga(null,ea2,{x:ex,z:ez,warn:.5,sp:15}); for(const s of [-.35,.35]) twBolt(O,{kind:'scythe',x:ex,y:groundY(ex,ez)+1.3,z:ez,vx:Math.cos(ea2+s)*9,vz:Math.sin(ea2+s)*9,dmg:2,life:2.5,col:0x8a3aff,storm:1}); return false; }}); }
    yield 2.6; }
  // C) the hungry holes
  d5Bark('omarLC',7); for(let k=0;k<3;k++){ const p=twRandIn(3), a=rnd(0,6.28); twMiniHole(p.x,p.z,{r:.85,pull:4.4,range:6.5,dur:12.5,eat:1,dmg:4,vx:Math.cos(a)*1.3,vz:Math.sin(a)*1.3,grab:1}); }
  for(let t=0;t<12;t+=.9){ const P=Player; O.cast=.4; for(const s of [-.3,0,.3]) twAimBolt(O,'scythe',O.x,O.y+1.2,O.z,11,s,{col:0x8a3aff,dmg:2,life:3}); Sound.sfx('swing'); if(Math.floor(t/.9)%3===2) d5Getsuga(O,Math.atan2(P.z-O.z,P.x-O.x),{warn:.6,sp:14}); yield .9; }
  // D) the sky gate (a cutscene), then the climb
  S.stop=1; F.pend=()=>d5SkyCine(F,C,O); while(!S.climb) yield .1;
  for(let t=0;!d5OnPlatform(S);t+=.1){ if(t%1.8<.1){ const P=Player; twAimBolt(O,'scythe',O.x,O.y+1.2,O.z,9,rnd(-.15,.15),{col:0x8a3aff,dmg:1,life:3.5}); Sound.sfx('swing'); } yield .1; }
  S.cam=null; F.pend=()=>d5PlatformCine(F,C,O); while(!S.done) yield .1; }

function* d5SkyCine(F,C,O){ const P=Player, A=twAliAny(), c=F.center, gy=groundY(c.x,c.z), H=D5T.H, S=F.d5, mi=Game.mira; F.miraHold=1; twCamFree(); Game.letterTo=.7; P.vx=P.vz=0;
  // he rises to eye level with where the platform will be; the void opens over him
  cineSet(c.x,gy+.8,c.z+9,O.x,O.y+2,O.z); twAnim(O,{hy:H+1.6,x:c.x},2.2,twEIO); yield cineTo([c.x+3,gy+2,c.z+13],[O.x,gy+H,O.z],2.2,twEIO);
  yield d5Say('omarLC',8,'angry'); S.sky=d5SkyHole(O.x,gy+H+9,O.z); Sound.sfx('void'); Sound.sfx('skyopen'); shake(1.2); impactFrame([[1,2],[3,2]]); FX.flash=.6; grade.uniforms.flashCol.value.set(.6,.3,1);
  for(const T of S.tombs) if(!T.dead){ const t0=T; twAnim(t0.g.position,{y:gy+H+6,x:O.x,z:O.z},1.6,twEIn2); t0.g.rotation.x=1; }
  yield cineTo([c.x,gy+.6,c.z+7],[O.x,gy+H+7,O.z],1.8,twEIO); S.tombs.forEach(d5TombBreak);
  cineSet(P.x+1.2,P.y+.6,P.z+3,P.x,P.y+3,P.z-3); yield d5Say('omarLC',9,'surprised');
  if(mi){ cineSet(mi.x+1,mi.y+.8,mi.z+3,mi.x,mi.y+2.4,mi.z-2); yield d5Say('omarLC',10,'surprised'); }
  // Ali: a path up
  const tx=c.x, tz=Math.min(c.z+1,twBounds().z1-5); if(A){ A.hold=1; aliGhost(A.x,A.y,A.z); A.x=tx-.5; A.z=tz+3.2; A.face=1; cineSet(A.x+1.2,A.y+.7,A.z+3,A.x,A.y+1.8,A.z); yield wait(.3); yield d5Say('omarLC',11); }
  // the tree, cut from the ground up, the camera tilting with it
  S.tree=d5TreeBuild(tx,tz,H); JC.flash=.5; Sound.sfx('secret'); const all=S.tree.meshes, n=all.length; cineSet(tx+1,gy+1,tz+11,tx,gy+1.5,tz);
  for(let i=0;i<n;i++){ all[i].visible=true; if(i%3===0){ twTinyJC(tx,gy+H*i/n,tz,220); Sound.sfx(i%2?'swing':'hit'); } if(i%4===0) cineSet(tx+1,gy+1+H*i/n*.7,tz+11+i*.05,tx,gy+1.5+H*i/n,tz); yield wait(.05); }
  JC.flash=.6; FX.flash=.4; grade.uniforms.flashCol.value.set(1,.4,.45); shake(.6); cineSet(tx+4,gy+3,tz+14,tx,gy+H*.55,tz); yield d5Say('omarLC',12,'surprised'); yield d5Say('omarLC',13);
  if(A){ A.hold=0; A.face=null; } TW._mantle=1; S.climb=1; Game.letterTo=0; P.inv=1; F.miraHold=0; Cam.cine=null;
  twBig('CLIMB THE TREE',{size:50,col:'#ff8a9a',y:UH*.24,dur:2,sub:'Run into each step to climb it'});
  // the climbing camera: behind and above you, looking at your feet
  const cam=S.cam={}; Game.fxUpd.push(()=>{ if(S.cam!==cam||!F.d5) return false; const P2=Player; cineSet(P2.x+2,P2.y+5.5,P2.z+11,P2.x,P2.y+1,P2.z-1); return true; }); }

function* d5PlatformCine(F,C,O){ const P=Player, A=twAliAny(), S=F.d5, T=S.tree, H=T.H; F.miraHold=1; Game.letterTo=.5; P.vx=P.vz=0;
  if(A){ A.hold=1; aliGhost(A.x,A.y,A.z); A.x=T.ix0+1.1; A.z=T.iz0+.6; A.y=H; A.face=-1; }
  // eye level: Omar across the gap, the void above him
  cineSet(P.x-1.2,H+1.8,P.z+4,O.x,O.y+3,O.z); yield wait(.4); cineSet(O.x+1.4,O.y+1.6,O.z+5,O.x,O.y+2,O.z); yield d5Say('omarLC',14);
  cineSet(P.x+1.5,H+1.6,P.z+3.2,P.x,H+1.5,P.z); if(A) yield d5Say('omarLC',15); yield d5Say('omarLC',16,'surprised'); if(A) yield d5Say('omarLC',17);
  P.sp=Math.max(P.sp,100); Sound.sfx('ready'); FX.burst(P.x,P.y+1,P.z,40,0xff6a3a,5,.35); F.drillReady=1;
  cineSet(P.x,H+2.4,P.z+6,O.x,O.y+4,O.z); Game.letterTo=0; P.inv=1; if(A){ A.hold=0; A.face=null; }
  twBig(K('special')+'  ·  HEAVENLY DRILL',{size:52,col:'#ffb04a',y:UH*.24,dur:3,sub:'Your gauge is full'}); }
// the drill on the platform: it flies, time stops, Ali turns it into a whirling Judgement Cut, then you mash it through the void
(function(){ const sa=specialAttack; specialAttack=function*(){ const F=d5F(); if(F&&F.drillReady&&F.d5){ yield* d5Drill(F); return; } yield* sa(); }; })();
function d5DrillRig(d){ const g=new THREE.Group(); for(let i=0;i<6;i++){ const a=i*Math.PI/3; for(const [col,w,len] of [[0xff2a3a,.5,4.2],[0xffffff,.18,4.2]]){ const b=beamMesh(col,w); b.position.set(Math.cos(a)*1.4,-1.6,Math.sin(a)*1.4); b.lookAt(Math.cos(a+1.2)*1.4,-4,Math.sin(a+1.2)*1.4); b.scale.set(1,1,len); g.add(b); } }
  d.g.add(g); const R={g,dead:0}; Game.fxUpd.push(dt=>{ if(R.dead||d.dead){ d.g.remove(g); return false; } g.rotation.y+=dt*16; return true; });
  twGash({life:60,rev:.1,fade:.2,w:16,sparks:30,alive:()=>!R.dead&&!d.dead,pts:()=>{ const pts=[], t=performance.now()/1000, base=d.g.position, dir=d.dir.clone().normalize(), up=Math.abs(dir.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0), u=new THREE.Vector3().crossVectors(dir,up).normalize(), v=new THREE.Vector3().crossVectors(dir,u);
    for(let i=0;i<10;i++){ const a=t*14+i*.7, r=1.5*d.s, q=base.clone().addScaledVector(dir,i*.45*d.s).addScaledVector(u,Math.cos(a)*r).addScaledVector(v,Math.sin(a)*r), s=toScreen(q.x,q.y,q.z); if(s[2]>=1) return null; pts.push([s[0],s[1]]); } return pts; }});
  return R; }
function* d5Drill(F){ const P=Player, A=twAliAny(), S=F.d5, O=F.O, C=F.C, sky=S.sky, H=S.tree.H; F.drillReady=0; P.sp=0; P.inv=99; P.cineFly=true; P.cineAnim='charge'; Game.letterTo=.5; F.miraHold=1; Sound.sfx('djump');
  const d=S.drill=makeDrill(); d.x=P.x; d.y=P.y+3.2; d.z=P.z; d.s=.12; d.spin=12; d.fire=.6; d.dir.set(sky.x-d.x,sky.y-d.y,sky.z-d.z).normalize();
  cineSet(P.x+2.2,P.y+1.4,P.z+4.4,P.x,P.y+3,P.z); yield tween(d,{s:.95},.7,twEOut3); impactFrame([[2,2],[1,2]]); Sound.sfx('slam'); shake(.5);
  const p0={x:d.x,y:d.y,z:d.z}, fly=u=>{ d.x=lerp(p0.x,sky.x,u); d.y=lerp(p0.y,sky.y,u); d.z=lerp(p0.z,sky.z,u); };
  for(let t=0;t<.55;t+=1/60){ fly(t/1.7); cineSet(d.x+3,d.y+1.5,d.z+7,d.x,d.y,d.z); yield wait(1/60); }
  // time stops; Ali gives it a hand
  zwStart(); Sound.sfx('secret'); if(A){ A.hold=1; aliGhost(A.x,A.y,A.z); A.x=d.x-1.8; A.z=d.z+.8; A.y=d.y-1.2; A.face=1; } cineSet(d.x+2.6,d.y+.6,d.z+5.4,d.x-.6,d.y,d.z); yield wait(.3);
  if(A) yield d5Say('omarLC',18);
  for(let i=0;i<12;i++){ const s=toScreen(d.x,d.y,d.z), a=rnd(0,Math.PI); if(s[2]<1) JC.lines.push({x0:s[0]-Math.cos(a)*380,y0:s[1]-Math.sin(a)*380,x1:s[0]+Math.cos(a)*380,y1:s[1]+Math.sin(a)*380,t:0,ttl:.6}); Sound.sfx(i%2?'swing':'hit'); yield wait(.05); }
  JC.flash=.7; S.rig=d5DrillRig(d); d.spin=30; d.fire=1.2; yield wait(.3); if(A) yield d5Say('omarLC',19); zwEnd(); if(A){ aliGhost(A.x,A.y,A.z); A.x=S.tree.ix0+1.1; A.z=S.tree.iz0+.6; A.y=H; A.hold=0; A.face=null; }
  for(let t=.55;t<1.7;t+=1/60){ fly(t/1.7); cineSet(d.x+3.4,d.y+1.6,d.z+8,d.x,d.y+1,d.z); yield wait(1/60); }
  // the mash: the drill bores into the void
  impactFrame([[1,3],[3,2]]); Sound.sfx('crossboom'); shake(1.2); FX.flash=.8; grade.uniforms.flashCol.value.set(1,.5,.3); sky.crack=1;
  const M=TW.mash={v:-.4,n:0,t:0,dur:8,shown:0,duoClash:1,d5:1,lbl:['DRILL','THE VOID']}; hit.attack=false; d5Bark('omarLC',20);
  cineSet(sky.x+5,sky.y-1.5,sky.z+12,sky.x,sky.y,sky.z);
  while(M.v<1){ const dt=1/30; yield wait(dt); M.t+=dt; const pushes=M.n; M.n=0; M.v=clamp(M.v+pushes*.075-dt*.16+(M.t>M.dur?dt*.4:0),-1,1); M.shown+=pushes;
    d.spin=30+pushes*6; d.x=sky.x+rnd(-.08,.08); d.y=sky.y-1.2-M.v*.8; if(pushes){ Sound.sfx('hit'); shake(.15); } if(Math.random()<.25) Sound.sfx('slam');
    for(let i=0;i<6;i++){ const a=rnd(0,6.28); FX.spawn(sky.x+Math.cos(a)*rnd(1,5),sky.y+rnd(-2,2),sky.z+Math.sin(a)*rnd(1,5),Math.cos(a)*rnd(4,10),rnd(-3,5),Math.sin(a)*rnd(4,10),.5,[0xffffff,0xff3a2a,0x8a2aff,0xffd45a][i%4],.4,0,true); }
    if(M.t>2.6&&!M.b1){ M.b1=1; d5Bark('omarLC',21); } if(M.t>5&&!M.b2){ M.b2=1; d5Bark('omarLC',22); } FX.flash=Math.max(FX.flash,.06); }
  TW.mash=null; hit.attack=false;
  // the void breaks
  FX.flash=1; grade.uniforms.flashCol.value.set(1,1,1); impactFrame([[1,3],[2,3],[3,3],[1,2]]); Sound.sfx('shatter'); Sound.sfx('crossboom'); Sound.sfx('skyopen'); shake(2); FX.hitstop=.2;
  for(let k=0;k<6;k++) FX.ring(sky.x,sky.y,sky.z,k%2?'#ffffff':'#ff3a4a',8+k*5,.6+k*.1); for(let i=0;i<4;i++) FX.burst(sky.x,sky.y,sky.z,80,[0xffffff,0x8a2aff,0xff3a2a,0x1a0a2a][i],14,.7);
  sky.dead=true; d.dead=1; scene.remove(d.g); S.drill=null; if(S.rig) S.rig.dead=1; yield wait(.6);
  cineSet(O.x+1.4,O.y+1.4,O.z+5,O.x,O.y+1.8,O.z); yield d5Say('omarLC',23,'sad');
  // the tree comes apart; everyone falls
  JC.flash=.5; Sound.sfx('shatter'); S.tree.meshes.forEach(m=>{ FX.burst(m.position.x,m.position.y,m.position.z,6,0xff3a4a,4,.3); }); S.tree.kill(); TW._mantle=0;
  const gy=groundY(P.x,P.z), A2=twAliAny(); P.cineAnim='fall'; twAnim(P,{y:gy},1,twEIn2); if(A2){ A2.hold=1; twAnim(A2,{y:groundY(A2.x,A2.z)},1,twEIn2); }
  const og=groundY(O.x,O.z); cineSet(O.x+3,og+5,O.z+12,O.x,og+H*.6,O.z); twAnim(O,{hy:H*.55},.6,twEIn2); yield d5Say('omarLC',24,'surprised'); yield d5Say('omarLC',25,'surprised');
  cineSet(C.x+1,groundY(C.x,C.z)+1.4,C.z+3.4,C.x,groundY(C.x,C.z)+1.5,C.z); yield d5Say('omarLC',26);
  twAnim(O,{hy:.3,x:C.x+1.4,z:C.z},.35,twEIn2); yield wait(.35); Sound.sfx('crash'); Sound.sfx('punch'); shake(1); FX.burst(O.x,og+.3,O.z,40,0x6a5a40,6,.4,false); cineSet(C.x+2,og+1.4,C.z+5,C.x+.7,og+.6,C.z); yield wait(.5); O.hy=1.3;
  P.y=groundY(P.x,P.z); P.cineFly=false; P.cineAnim=null; if(A2){ A2.hold=0; A2.y=groundY(A2.x,A2.z); }
  // on the ground
  twCamP(6.4,1); yield d5Say('omarLC',27,'happy'); if(A2) yield d5Say('omarLC',28); if(Game.mira){ const mi=Game.mira; cineSet(mi.x+1,mi.y+1.3,mi.z+3.2,mi.x,mi.y+1.2,mi.z); yield d5Say('omarLC',29,'happy'); }
  cineSet(C.x+1,groundY(C.x,C.z)+1.5,C.z+3.4,C.x,groundY(C.x,C.z)+1.5,C.z); yield d5Say('omarLC',30,'angry'); cineSet(O.x+.8,groundY(O.x,O.z)+1.4,O.z+3,O.x,groundY(O.x,O.z)+1.4,O.z); yield d5Say('omarLC',31,'angry');
  grade.uniforms.tint.value.set(1,1,1); S.done=1; TW.lcCleanup=null; d5OmarLCClean(F); twCamFree(1.3); C.gen=O.gen=null; F.busy=0; F.lc=0; F.d5lc=null;
  yield* d5PhaseStart(F,C,O); }

// =====================================================================
// OMAR'S MEGA RAIN: the halo rain (circles on the ground) plus two of his solo-fight rings diving straight at you,
// taking turns (about three hundred scythes in the limit cut). Scythe meshes share one geometry.
// =====================================================================
const D5G={};
function d5ScyMesh(){ if(!D5G.a){ D5G.a=new THREE.TorusGeometry(.6,.1,4,12,Math.PI*.95); D5G.b=new THREE.TorusGeometry(.68,.035,4,12,Math.PI*.95); D5G.p=new THREE.BoxGeometry(.07,1.2,.07);
    D5G.ma=new THREE.MeshBasicMaterial({color:0x0c0812}); D5G.mb=new THREE.MeshBasicMaterial({color:0xb06aff}); D5G.mp=new THREE.MeshBasicMaterial({color:0x2a1a30}); }
  const g=new THREE.Group(), piv=new THREE.Group(); g.add(piv); piv.add(new THREE.Mesh(D5G.a,D5G.ma)); piv.add(new THREE.Mesh(D5G.b,D5G.mb)); const pole=new THREE.Mesh(D5G.p,D5G.mp); pole.position.set(.6,-.55,0); piv.add(pole); g.userData.tw=1; scene.add(g); return g; }
// a ring of scythes that rises off Omar and hangs above you, turning
function d5DiveRing(O,n,R,h,dir){ const G={list:[],live:true,t:0}; for(let i=0;i<n;i++){ const m=d5ScyMesh(), a=i*6.283/n; G.list.push({m,x:O.x,y:O.y+1,z:O.z,sx:O.x+rnd(-1,1),sy:O.y+rnd(0,2),sz:O.z+rnd(-1,1),a,gone:0}); m.position.set(O.x,O.y+1,O.z); }
  twHz({upd(dt,play){ if(play) G.t+=dt; const P=Player, u=Math.min(1,G.t/1.1), e=u*(2-u), ty=groundY(P.x,P.z)+h;
      for(const o of G.list){ if(o.gone) continue; const a=o.a+G.t*.5*dir, tx=P.x+Math.cos(a)*R, tz=P.z+Math.sin(a)*R*.8; o.x=lerp(o.sx,tx,e); o.y=lerp(o.sy,ty,e)+Math.sin(G.t*3+o.a*3)*.15; o.z=lerp(o.sz,tz,e); o.m.position.set(o.x,o.y,o.z); o.m.rotation.z+=dt*(6+u*12)*dir; }
      return G.live&&G.list.some(o=>!o.gone); }, kill(){ G.list.forEach(o=>{ if(!o.gone){ o.gone=1; scene.remove(o.m); } }); }});
  Sound.sfx('howl'); return G; }
function* d5MegaRain(O,C,stop,o){ o=Object.assign({halo:100,per:100,sp:1,planted:[],waves:20},o||{}); const sp=o.sp, c=twCenter(), gy=groundY(c.x,c.z), list=o.planted.slice(0,o.halo);
  while(list.length<o.halo){ const m=d5ScyMesh(), x=O.x+rnd(-2.5,2.5), z=O.z+rnd(-2,2); m.position.set(x,groundY(x,z)+.3,z); list.push({m,x,y:groundY(x,z)+.3,z}); }
  list.forEach((s,i)=>{ s.m.userData.tw=1; s.m.userData.plant=0; s.sx=s.x; s.sy=s.y; s.sz=s.z; s.slot=i; s.st='rise'; });
  const halo={t:0,live:true}, slot=i=>{ const n=list.length, ring=i%3, a=i/n*6.283+halo.t*(ring===1?.35:-.25), r=[4.6,7,9.4][ring]; return {x:c.x+Math.cos(a)*r,y:gy+10.5+ring*1.2+Math.sin(halo.t*2+i)*.2,z:c.z+Math.sin(a)*r*.75}; };
  twHz({upd(dt){ halo.t+=dt; for(const s of list){ if(s.st!=='rise'&&s.st!=='halo') continue; const q=slot(s.slot); if(s.st==='rise'){ s.ru=(s.ru||0)+dt/(.9+s.slot*.006); const e=twEIO(Math.min(1,s.ru)); s.x=lerp(s.sx,q.x,e); s.y=lerp(s.sy,q.y,e)+Math.sin(e*Math.PI)*2; s.z=lerp(s.sz,q.z,e); if(s.ru>=1) s.st='halo'; }
        else { s.x=q.x; s.y=q.y; s.z=q.z; } s.m.position.set(s.x,s.y,s.z); s.m.rotation.set(0,0,halo.t*8+s.slot); } return halo.live&&list.some(s=>s.st!=='gone'); }, kill(){ list.forEach(s=>{ if(s.st!=='gone') scene.remove(s.m); }); }});
  O.cast=3; O.scythe=0; Sound.sfx('howl'); Sound.sfx('gong'); const rings=[]; yield 1.4;
  try{
    // the halo: circles on the ground, five at a time; the rings rise while it falls
    for(let w=0;w<o.waves&&!stop();w++){ const P=Player, warn=.8/sp, pts=[], a0=rnd(0,6.28), kind=w%3;
      if(kind===0){ pts.push([P.x,P.z]); for(let k=0;k<4;k++){ const a=a0+k*Math.PI/2; pts.push([P.x+Math.cos(a)*2.3,P.z+Math.sin(a)*2.3]); } }
      else if(kind===1){ for(let k=-2;k<=2;k++) pts.push([P.x+Math.cos(a0)*k*1.9,P.z+Math.sin(a0)*k*1.9]); }
      else { pts.push([P.x,P.z],[P.x+P.vx*.4,P.z+P.vz*.4],[P.x+P.vx*.8,P.z+P.vz*.8]); for(let k=0;k<2;k++){ const a=a0+k*Math.PI; pts.push([P.x+Math.cos(a)*2.6,P.z+Math.sin(a)*2.6]); } }
      const avail=list.filter(s=>s.st==='halo'||s.st==='rise'); if(!avail.length) break;
      pts.forEach(([x,z],k)=>{ const s=avail[k]; if(!s) return; s.st='gone'; twSkyScythe(x,z,warn,{mesh:s.m,fx:s.x,fy:s.y,fz:s.z,quiet:k>0}); });
      if(o.per&&w===Math.floor(o.waves*.4)) rings.push(d5DiveRing(O,o.per,4.6,7.5,1)); if(o.per&&w===Math.floor(o.waves*.7)) rings.push(d5DiveRing(O,o.per,6.4,9.5,-1));
      Sound.sfx('swing'); yield .55/sp; }
    while(rings.length<2&&o.per&&!stop()){ rings.push(d5DiveRing(O,o.per,rings.length?6.4:4.6,rings.length?9.5:7.5,rings.length?-1:1)); yield 1.1; }
    // the two rings dive at you in turn, one scythe after another
    for(let i=0;!stop()&&rings.some(G=>G.list.some(s=>!s.gone));i++){ const G=rings[i%rings.length], s=G.list.find(q=>!q.gone); if(!s) continue;
      const P=Player, dx=P.x-s.x, dy=(P.y+1.1)-s.y, dz=P.z-s.z, d=Math.hypot(dx,dy,dz)||1, v=22*sp; s.gone=1; scene.remove(s.m);
      const b=twBolt(O,{kind:'scythe',x:s.x,y:s.y,z:s.z,vx:dx/d*v,vy:dy/d*v,vz:dz/d*v,col:0x8a3aff,dmg:2,life:2}); b.storm=1; if(i%2) Sound.sfx('swing'); O.swing=1; yield .17/sp; }
  } finally { halo.live=false; rings.forEach(G=>G.live=false); TW.storming=0; O.cast=0; O.swing=0; } }
// the duo's own scythe rain (phase III) becomes the mega rain, with the planted scythes as the halo
DUO.scytheRain=function*(C,O,ph){ const F=TW.fight, list=TW.planted.splice(0,DUO3.rain); TW.storming=1; F.rains=(F.rains||0)+1; d5Bark('omarBark');
  yield* d5MegaRain(O,C,()=>!TW.fight,{planted:list,halo:Math.max(40,list.length),per:45,sp:twSp(O),waves:12});
  O.stun=Math.max(O.stun,2.6); O.state='stun'; twBig('OMAR IS EXHAUSTED',{size:44,col:'#ffd45a',y:UH*.3,dur:1.3}); yield 2.6; };

// =====================================================================
// CAOTAN'S LIMIT CUT: HIKARI SUPERNOVA (ends phase III)
// Hikari-chan stands on the field and grows with every glint, firing lasers from her eyes and hearts from her heart.
// Caotan glints twenty times, more patterns at once as he goes; Omar rains three hundred scythes and drops small
// black holes. When she's too big for the screen, Omar opens a black hole inside her and throws it at you.
// =====================================================================
function d5HikSize(H,s){ H.s=s; H.m.scale.set(s/H.s0,s/H.s0,1); H.y=groundY(H.x,H.z)+1.3*s; H.put(); }
function d5EyeRay(H,tx,tz,col){ const ey=groundY(H.x,H.z)+H.s*2.15, ty=groundY(tx,tz)+.3, ms=[]; for(const sd of [-1,1]){ const ex=H.x+sd*H.s*.17, ez=H.z+.3; for(const [cc,w] of [[col,.32+H.s*.03],[0xffffff,.12+H.s*.01]]){ const b=beamMesh(cc,w); b.userData.tw=1; b.position.set(ex,ey,ez); b.lookAt(tx,ty,tz); b.scale.set(1,1,Math.hypot(tx-ex,ty-ey,tz-ez)); ms.push(b); } }
  const s={t:0}; twHz({upd(dt){ s.t+=dt; return s.t<.32; }, kill(){ ms.forEach(m=>scene.remove(m)); }}); }
function d5HikLaser(H,off){ const P=Player, a=Math.atan2(P.z-H.z,P.x-H.x)+(off||0), len=34, warn=.8; twBeam({x:H.x,z:H.z+.4,ang:a,len,w:1,warn,dur:.3,dmg:3,col:0xff6ab0});
  const s={t:0}; twHz({upd(dt,play){ if(play) s.t+=dt; if(s.t<warn) return true; const d=Math.min(len,Math.max(4,Math.hypot(P.x-H.x,P.z-H.z))); d5EyeRay(H,H.x+Math.cos(a)*d,H.z+Math.sin(a)*d,0xff4aa0); Sound.sfx('beam'); return false; }}); }
function d5HikHearts(H,C,n){ const P=Player, gy=groundY(H.x,H.z), a0=Math.atan2(P.z-H.z,P.x-H.x); for(let i=0;i<n;i++){ const a=a0+(i-(n-1)/2)*.28; twBolt(C,{kind:'orb',x:H.x+Math.cos(a)*.8,y:gy+1.2,z:H.z+.6,vx:Math.cos(a)*6.5,vz:Math.sin(a)*6.5,col:0xff6ab0,dmg:2,life:5}); }
  twHeartBurst(H.x,H.z+.6,10); Sound.sfx('kyun'); }
function d5CaoLCClean(F){ const S=F.d5c; if(!S) return; S.stop=1; if(S.hik) S.hik.kill(); (S.v||[]).forEach(v=>v.kill()); S.v=[]; grade.uniforms.tint.value.set(1,1,1); F.d5c=null; }
function* d5CaoLCIntro(F,C,O,retry){ const P=Player, A=twAliAny(), c=F.center, gy=groundY(c.x,c.z), B=twBounds(); F.d5lc='cao'; F.lc=1; F.director=0; F.busy=1; F.miraHold=1;
  twLCPrep(C); twLCPrep(O); C.down=O.down=0; C.inv=O.inv=true; const hz=Math.max(B.z0+1.2,c.z-8); Object.assign(C,{x:c.x-2.6,z:hz+2.2,lockF:0,hy:1.3}); Object.assign(O,{x:c.x+5,z:hz+2.4,lockF:0,hy:1.3});
  if(F.d5c) d5CaoLCClean(F); const S=F.d5c={stop:0,v:[]}; S.hik=twHikari(c.x,hz,.5); S.hik.s0=.5; TW.lcCleanup=()=>d5CaoLCClean(F);
  if(!retry){ Game.letterTo=1; const H=S.hik; cineSet(C.x+1,gy+1.4,C.z+3.4,C.x,gy+1.6,C.z); yield wait(.3); yield d5Say('caoLC',0,'sad');
    // she stirs: a heart burst, the camera drops to her level
    twHikariBurst(H.x,H.y,H.z); cineSet(H.x+.6,gy+.6,H.z+2.6,H.x,gy+.8,H.z); yield wait(.4); P.y=groundY(P.x,P.z); cineSet(P.x+1,P.y+1.2,P.z+3,P.x,P.y+1.4,P.z); yield d5Say('caoLC',1,'surprised');
    cineSet(C.x-1,gy+1.4,C.z+3,C.x,gy+1.6,C.z); yield d5Say('caoLC',2,'happy'); if(Game.mira){ const mi=Game.mira; cineSet(mi.x+1,mi.y+1.3,mi.z+3.2,mi.x,mi.y+1.2,mi.z); yield d5Say('caoLC',3,'surprised'); }
    // she grows a little, right there, while he talks
    for(let t=0;t<1;t+=1/30){ d5HikSize(H,lerp(.5,1.4,twEIO(t))); yield wait(1/30); } Sound.sfx('kyun'); shake(.3);
    cineSet(c.x,gy+.8,hz+9,c.x,gy+2.2,hz); yield d5Say('caoLC',4,'happy');
    twCutin('caotan','HIKARI SUPERNOVA','Limit Break  ·  Twenty Glints','#ff3a8a',2.2); impactFrame([[2,2],[1,2]]); shake(.8); yield wait(1.6); }
  else d5HikSize(S.hik,1.4);
  grade.uniforms.tint.value.set(1.05,.9,1); yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.6); Cam.cine=null; Game.letterTo=0; P.inv=1; F.miraHold=0;
  C.gen=d5CaoLCPlay(F,C,O); C.wait=0; C.state='lc'; O.gen=twWaitFor(C)(); O.wait=0; O.state='lc'; Sound.play('seraph'); }
function* d5CaoLCPlay(F,C,O){ const S=F.d5c, H=S.hik, keys=Object.keys(D5CP).filter(k=>k!=='cage'); twCamTrack(.35,1.5);
  // she grows smoothly toward the size of the current glint
  S.size=H.s; Game.fxUpd.push(dt=>{ try{ if(F.d5c!==S||H.gone) return false; if(Math.abs(H.s-S.size)>.001) d5HikSize(H,H.s+(S.size-H.s)*Math.min(1,dt*1.5)); }catch(e){ console.error('d5 hik',e); return false; } return true; });
  // Omar: the mega rain, and small black holes every few seconds
  d5Run(d5MegaRain(O,C,()=>S.stop||F.d5c!==S,{sp:1.05}));
  d5Run((function*(){ yield 4; while(!S.stop&&F.d5c===S){ const P=Player, a=rnd(0,6.28), r=rnd(3,5), p=twClampXZ(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,1.5), b=rnd(0,6.28);
      twMiniHole(p.x,p.z,{r:.45,pull:3.6,range:4.5,dur:6.5,eat:.65,dmg:3,vx:Math.cos(b)*1.2,vz:Math.sin(b)*1.2}); Sound.sfx('void'); yield 3.2; } })());
  const say={5:5,10:6,15:7,20:8}, osay={3:9,8:10};
  for(let g=1;g<=20;g++){ const sp=twSp(C)*(1.05+g*.018), n=g<6?1:g<13?2:3; S.size=1.4+Math.pow(g/20,1.25)*10.6;
    if(say[g]!=null) d5Bark('caoLC',say[g]); else if(osay[g]!=null) d5Bark('caoLC',osay[g]);
    twBig(String(g),{size:40,col:'#ff8ac8',y:UH*.14,dur:.6}); Sound.sfx('ting'); C.heartEyes=g>=15?1:0;
    // Hikari: eye lasers every glint from the third, hearts every other glint
    if(g>=3){ const nl=1+Math.floor(g/8); for(let k=0;k<nl;k++) d5HikLaser(H,(k-(nl-1)/2)*.42); }
    if(g%2===0) d5HikHearts(H,C,g<10?5:7);
    const pick=keys.slice().sort(()=>Math.random()-.5).slice(0,n); if(g===10||g===20) pick[0]='cage';
    for(let k=1;k<pick.length;k++) d5Run(D5CP[pick[k]](C,sp,3));
    yield* D5CP[pick[0]](C,sp,3); yield Math.max(.2,.55-g*.015); }
  yield 1.4; S.stop=1; BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); F.pend=()=>d5CollapseCine(F,C,O); while(!S.done) yield .1; }

// she's too big for the screen: Omar blinks into the air in front of her, opens a black hole, eats her, throws it; Ali halves it
function* d5CollapseCine(F,C,O){ const P=Player, A=twAliAny(), S=F.d5c, H=S.hik, gy=groundY(H.x,H.z), mi=Game.mira; F.miraHold=1; twCamFree(); Game.letterTo=1; P.vx=P.vz=0; P.inv=99; twClearHz();
  d5HikSize(H,Math.max(H.s,12)); C.heartEyes=1;
  // low and wide: you only see the bottom half of her
  cineSet(H.x+2,gy+.8,H.z+15,H.x,gy+H.s*.9,H.z); yield cineTo([H.x-2,gy+1.2,H.z+13],[H.x,gy+H.s*1.1,H.z],1.6,twEIO);
  cineSet(O.x+.8,groundY(O.x,O.z)+1.5,O.z+3,O.x,groundY(O.x,O.z)+1.8,O.z); yield d5Say('caoLC',11);
  cineSet(C.x-.8,gy+1.2,C.z+3,C.x,gy+2.2,C.z); yield d5Say('caoLC',12,'happy');
  // the pan: across her, up to where Omar appears
  const my=H.s*1.25; yield cineTo([H.x+5,gy+my-1,H.z+12],[H.x,gy+my,H.z],1.2,twEIO);
  twBlink(O,H.x-2.2,H.z+1.6); O.x=H.x-2.2; O.z=H.z+1.6; O.hy=my; O.f=1; O.lockF=1; Sound.sfx('void'); FX.burst(O.x,gy+my+1.4,O.z,30,0x8a3aff,5,.4);
  cineSet(O.x+4.4,gy+my+1.6,O.z+7,O.x+1.6,gy+my+1.6,O.z); yield wait(.5); yield d5Say('caoLC',13);
  // a hand out; a small black ball
  O.cast=3; const hx=H.x+.2, hy=gy+my+1.4, hz=H.z+.9, V=twHoleVis(hx,hy,hz,3,true); S.v.push(V); V.t=0; Sound.sfx('charge');
  for(let t=0;t<.6;t+=1/30){ V.t+=1/30; V.set(lerp(.01,.07,t/.6)); yield wait(1/30); }
  cineSet(O.x+2.2,gy+my+1.5,O.z+3,O.x+.6,gy+my+1.7,O.z); impactFrame([[2,2],[1,2]]); Sound.sfx('gong'); yield d5Say('caoLC',14,'angry');
  // it grows and pulls her in: she stretches, thins and spirals into it
  cineSet(H.x,gy+my,H.z+20,hx,hy,hz); Sound.sfx('void'); Sound.sfx('skyopen'); const m=H.m, m0={x:m.position.x,y:m.position.y};
  for(let t=0;t<2.6;t+=1/30){ const u=t/2.6, e=twEIn2(u); V.t+=1/30; V.set(lerp(.07,.75,Math.min(1,u*1.6))); shake(.15);
    m.scale.set(H.s/H.s0*Math.max(.03,1-e),H.s/H.s0*(1+e*1.4),1); m.position.set(lerp(m0.x,hx,e),lerp(m0.y,hy,e),hz-.2); m.rotation.z=e*e*9;
    for(let i=0;i<4;i++){ const a=rnd(0,6.28), r=rnd(2,H.s*.9); FX.spawn(hx+Math.cos(a)*r,hy+Math.sin(a)*r,hz,-Math.cos(a)*r*1.4,-Math.sin(a)*r*1.4,0,.5,i%2?0xff8ac8:0xffffff,.35,0,true); }
    yield wait(1/30); }
  H.kill(); Sound.sfx('chomp'); FX.flash=.5; grade.uniforms.flashCol.value.set(.6,.3,1); impactFrame([[1,2],[3,2]]);
  cineSet(C.x-.6,groundY(C.x,C.z)+1.3,C.z+2.6,C.x,groundY(C.x,C.z)+1.8,C.z); C.heartEyes=0; yield d5Say('caoLC',15,'sad'); cineSet(O.x+2.4,gy+my+1.5,O.z+4,O.x+.8,gy+my+1.6,O.z); yield d5Say('caoLC',16);
  // the throw: the hole comes down at Shayan
  yield d5Say('caoLC',17,'angry'); O.swing=1; Sound.sfx('whoosh'); const p0={x:hx,y:hy,z:hz}, tgt={x:P.x,y:P.y+1.3,z:P.z};
  for(let t=0;t<.7;t+=1/60){ const u=twEIn2(t/1); V.x=lerp(p0.x,tgt.x,u); V.y=lerp(p0.y,tgt.y,u); V.z=lerp(p0.z,tgt.z,u); V.t+=1/60; V.set(.75-u*.25); cineSet(P.x-1.6,P.y+1.4,P.z+4.4,V.x,V.y,V.z); yield wait(1/60); }
  // time stops a step from his face
  zwStart(); Sound.sfx('secret'); cineSet(P.x+1.4,P.y+1.2,P.z+3.6,(P.x+V.x)/2,P.y+1.6,(P.z+V.z)/2); yield d5Say('caoLC',18,'surprised');
  if(A){ A.hold=1; aliGhost(A.x,A.y,A.z); A.x=(P.x+V.x)/2+.6; A.z=(P.z+V.z)/2+.4; A.y=groundY(A.x,A.z); A.face=1; Sound.sfx('dash'); FX.burst(A.x,A.y+1,A.z,20,0xb0182a,4,.3); yield wait(.25); }
  for(let i=0;i<6;i++){ const s=toScreen(V.x,V.y,V.z), a=i===0?Math.PI/2+.12:rnd(0,Math.PI); if(s[2]<1) JC.lines.push({x0:s[0]-Math.cos(a)*520,y0:s[1]-Math.sin(a)*520,x1:s[0]+Math.cos(a)*520,y1:s[1]+Math.sin(a)*520,t:0,ttl:.7}); Sound.sfx(i%2?'swing':'hit'); yield wait(.06); }
  JC.flash=.6; zwEnd(); impactFrame([[1,3],[3,2]]); Sound.sfx('crossboom'); shake(1); FX.flash=.6; grade.uniforms.flashCol.value.set(1,.4,.45);
  // two halves fly apart and fizzle
  const vx=V.x, vy=V.y, vz=V.z; V.kill(); S.v=[]; const halves=[-1,1].map(sd=>({sd,V:twHoleVis(vx,vy,vz,1.2,false)}));
  for(let t=0;t<1;t+=1/30){ for(const h of halves){ h.V.x=vx+h.sd*t*9; h.V.y=vy+t*3-t*t*4; h.V.z=vz-t*2; h.V.t=t; h.V.set(Math.max(.01,1-t)); } yield wait(1/30); }
  halves.forEach(h=>{ FX.burst(h.V.x,h.V.y,h.V.z,30,0x8a2aff,5,.35); h.V.kill(); }); Sound.sfx('shatter');
  if(A){ cineSet(A.x+1,A.y+1.4,A.z+3,A.x,A.y+1.5,A.z); yield d5Say('caoLC',19); }
  // Omar lands; Caotan is not okay
  O.hy=1.3; twBlink(O,C.x+2,C.z); O.x=C.x+2; O.z=C.z; O.cast=0; O.swing=0; O.lockF=0; const cg=groundY(C.x,C.z);
  cineSet(C.x+1,cg+1.4,C.z+4,C.x+1,cg+1.5,C.z); yield d5Say('caoLC',20,'sad'); yield d5Say('caoLC',21);
  if(A){ A.hold=0; A.face=null; } S.done=1; F.caoLC=1; TW.lcCleanup=null; d5CaoLCClean(F); C.gen=O.gen=null; F.lc=0; F.busy=0; F.d5lc=null; C.hp=O.hp=0;
  yield* twBurnoutIntro(F,C,O); }

// =====================================================================
// BURNOUT: twenty seconds of everything at once. At twenty seconds Caotan misfires into Omar (blood everywhere);
// a black hole opens in the sky and Hikari-chan falls out of it onto Caotan; she melts.
// =====================================================================
twBurnoutIntro=function*(F,C,O){ const P=Player, A=twAliAny(), c=F.center, gy=groundY(c.x,c.z), mi=Game.mira; F.miraHold=1; C.down=O.down=1; C.inv=O.inv=true; C.gen=O.gen=null; C.mv=O.mv=null; Game.letterTo=1;
  const mx=(C.x+O.x)/2, mz=(C.z+O.z)/2; cineSet(mx,gy+.5,mz+4,mx,gy+.9,mz); yield cineTo([mx,gy+.9,mz+6],[mx,gy+1.1,mz],1,twEIO);
  C.down=0; cineSet(C.x-.7,gy+1.2,C.z+2.6,C.x,gy+1.7,C.z); shake(.3); yield d5Say('burnIntro',0,'angry');
  O.down=0; cineSet(O.x+.7,gy+1.2,O.z+2.6,O.x,gy+1.8,O.z); yield d5Say('burnIntro',1,'angry');
  // they rise in a storm of their own colours
  const aura={on:1}; Game.fxUpd.push(()=>{ try{ if(!aura.on) return false; for(const T of [C,O]){ for(let i=0;i<4;i++){ const a=rnd(0,6.28), r=rnd(.6,1.6); FX.spawn(T.x+Math.cos(a)*r,T.y+rnd(0,3),T.z+Math.sin(a)*r,0,rnd(2,5),0,.6,T===C?(i%2?0xff3a8a:0xffffff):(i%2?0x8a3aff:0x050208),.35,0,T===C); } } }catch(e){ return false; } return true; });
  Sound.sfx('fuse'); Sound.sfx('howl'); twAnim(C,{hy:3},1.2,twEIO); twAnim(O,{hy:3},1.2,twEIO); yield cineTo([mx,gy+.4,mz+9],[mx,gy+3.6,mz],1.3,twEIO);
  impactFrame([[3,2],[1,2],[2,2]]); shake(1.2); Sound.sfx('slam'); FX.flash=.5; grade.uniforms.flashCol.value.set(1,.4,.7);
  cineSet(P.x+1,P.y+.7,P.z+3,P.x,P.y+2,P.z-2); yield d5Say('burnIntro',2,'surprised'); if(A){ cineSet(A.x-1,A.y+1.2,A.z+3,A.x,A.y+1.5,A.z); yield d5Say('burnIntro',3); }
  if(mi){ cineSet(mi.x+1,mi.y+1.2,mi.z+3,mi.x,mi.y+1.2,mi.z); mi.anim='jump'; yield d5Say('burnIntro',4,'happy'); mi.anim='idle'; }
  aura.on=0; twAnim(C,{hy:1.3},.4); twAnim(O,{hy:1.3},.4); yield* d5Title(4,C,O,["Final Phase","Caotan & Omar","Burnout"]);
  yield cineTo([P.x,P.y+8.2,P.z+15],[P.x,P.y,P.z],.6); Cam.cine=null; Game.letterTo=0; P.inv=1; F.miraHold=0; if(A){ A.hold=0; A.face=null; }
  twBurnoutGo(F,C,O); };
DUO.burnout=function*(C,O){ const F=TW.fight, H=TW.hg={left:20,total:20,label:'BURNOUT · SURVIVE'}, done=()=>!TW.hg||TW.fight!==F;
  twHz({upd(dt,play){ if(!TW.hg) return false; if(play) TW.hg.left=Math.max(0,TW.hg.left-dt); return true; }});
  const cKeys=Object.keys(D5CP).filter(k=>k!=='cage'), oKeys=Object.keys(D5OC).filter(k=>k!=='rally');
  // Caotan: a pattern every second, spinning beams under it all, goop
  d5Run((function*(){ for(let i=0;!done()&&H.left>1;i++){ const sp=1.25; if(i%4===0) d5Goops(C,3); if(i%5===0) d5Run(D5CP.spin(C,1.1,3)); yield* D5CP[cKeys[Math.floor(Math.random()*cKeys.length)]](C,sp,3); yield .25; } })());
  // Omar: a combo after another, small holes, sky orbs and a steady rain
  d5Run((function*(){ yield .6; for(let i=0;!done()&&H.left>1;i++){ yield* D5OC[oKeys[Math.floor(Math.random()*oKeys.length)]](O,1.2,3); yield .2; } O.scythe=0; O.swing=0; })());
  d5Run((function*(){ for(let k=0;k<3;k++){ const p=twRandIn(3); twSkyOrb(p.x,p.z,{dur:18-k*3,every:2.6,delay:k*.8}); yield 4; } })());
  d5Run((function*(){ yield 3; while(!done()&&H.left>1){ const P=Player, p=twClampXZ(P.x+rnd(-4,4),P.z+rnd(-4,4),1.5), b=rnd(0,6.28); twMiniHole(p.x,p.z,{r:.45,pull:3.6,range:4.5,dur:5,eat:.65,dmg:3,vx:Math.cos(b)*1.3,vz:Math.sin(b)*1.3}); yield 2.6; } })());
  d5Run((function*(){ yield 2; while(!done()&&H.left>1){ const P=Player, a=rnd(0,6.28), r=rnd(0,3); twSkyScythe(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,.8,{quiet:1}); yield H.left<10?.28:.45; } })());
  d5Run((function*(){ yield 6; while(!done()&&H.left>1){ const P=Player; twCaoNose(P.x+P.vx*.35,P.z+P.vz*.35,.65); yield 1.1; } })());
  let bi=0; const bt=[1,5,9,12.5,15.5,18]; try{
    while(H.left>0&&!done()){ const el=20-H.left; while(bi<bt.length&&el>=bt[bi]){ d5Bark('burn',bi%D5.burn.length); bi++; } yield .05; }
  } finally { TW.hg=null; }
  if(TW.fight!==F) return;
  F.burned=1; F.burnCk=0; twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); F.pend=()=>d5BurnEnd(F,C,O); };
function d5Blood(x,y,z,n){ for(let i=0;i<n;i++){ const a=rnd(0,6.28), v=rnd(2,9); FX.spawn(x,y,z,Math.cos(a)*v*.6,rnd(5,13),Math.sin(a)*v*.6,rnd(.6,1.2),i%3?0xb0101e:0x6a0610,rnd(.22,.4),22,false); } }
function d5Gib(T,n){ const S=twSprOf(T); try{ gibsFromSprite(S,{cols:8,rows:7,n:n||44}); }catch(e){} const gy=groundY(T.x,T.z); d5Blood(T.x,gy+1.4,T.z,120); for(let i=0;i<3;i++) FX.burst(T.x,gy+1.3,T.z,40,i%2?0x8a0a14:0xd01a2a,7+i*2,.5,false);
  twZone(T.x,T.z,1.8,999,{col:0x7a0a14,op:.85}); Sound.sfx('gore'); Sound.sfx('squelch'); twRemoveFoe(T); }
function* d5BurnEnd(F,C,O){ const P=Player, A=twAliAny(), mi=Game.mira, gy=groundY(C.x,C.z); F.miraHold=1; twCamFree(); Game.letterTo=1; P.inv=99; P.vx=P.vz=0; C.inv=O.inv=true; C.down=O.down=0; C.hy=O.hy=1.3;
  // Caotan winds up the last laser of his life
  cineSet(C.x-1.2,gy+1.2,C.z+3,C.x,gy+1.7,C.z); C.glintT=.6; C.push=.5; Sound.sfx('ting'); Sound.sfx('charge'); yield d5Say('burnEnd',0,'angry');
  const a0=Math.atan2(P.z-C.z,P.x-C.x), a1=Math.atan2(O.z-C.z,O.x-C.x), bm=[beamMesh(0xffa0d8,.9),beamMesh(0xffffff,.35)]; bm.forEach(b=>{ b.userData.tw=1; b.position.set(C.x,gy+1.3,C.z); }); Sound.sfx('beam'); shake(.5);
  // it slips off his hand and swings straight through his brother
  cineSet((C.x+O.x)/2,gy+2.4,(C.z+O.z)/2+8,(C.x+O.x)/2,gy+1.3,(C.z+O.z)/2);
  for(let t=0;t<.8;t+=1/60){ const a=a0+(((a1-a0+Math.PI*3)%(Math.PI*2))-Math.PI)*twEIO(Math.min(1,t/.6)); for(const b of bm){ b.lookAt(C.x+Math.cos(a)*20,gy+1.3,C.z+Math.sin(a)*20); b.scale.set(1,1,20); } FX.spawn(C.x,gy+1.3,C.z,rnd(-2,2),rnd(0,2),rnd(-2,2),.3,0xff8ac8,.3,0,true); yield wait(1/60); }
  bm.forEach(b=>scene.remove(b)); FX.flash=.4; impactFrame([[1,2]]); Sound.sfx('hit'); O.flash=.5;
  cineSet(O.x+.9,groundY(O.x,O.z)+1.5,O.z+2.6,O.x,groundY(O.x,O.z)+1.7,O.z); yield wait(.4); yield d5Say('burnEnd',1,'surprised');
  // pop
  impactFrame([[1,3],[2,3],[3,2]]); Sound.sfx('crossboom'); shake(1.4); FX.flash=.6; grade.uniforms.flashCol.value.set(1,.15,.2); const ox=O.x, oz=O.z; d5Gib(O,50);
  cineSet(ox,groundY(ox,oz)+3,oz+8,ox,groundY(ox,oz)+2,oz); yield wait(1.2);
  cineSet(C.x-.8,gy+1.3,C.z+2.6,C.x,gy+1.6,C.z); yield d5Say('burnEnd',2,'sad'); cineSet(P.x+1,P.y+1.2,P.z+3,P.x,P.y+1.4,P.z); yield d5Say('burnEnd',3,'surprised');
  // the camera tilts up: the sky tears open over Caotan
  const sy=gy+16; yield cineTo([C.x,gy+1,C.z+9],[C.x,sy,C.z],1.4,twEIO); const V=twHoleVis(C.x,sy,C.z,3,true); Sound.sfx('void'); Sound.sfx('skyopen'); shake(.6);
  for(let t=0;t<1;t+=1/30){ V.t+=1/30; V.set(twEOut3(t)); yield wait(1/30); }
  if(mi) yield d5Say('burnEnd',4,'surprised');
  // something pink is falling out of it
  const H=twHikari(C.x,C.z,3); H.s0=3; H.y=sy; H.put(); H.spin=.3; cineSet(C.x+1.5,gy+1,C.z+6,C.x,gy+5,C.z); C.heartEyes=1; yield d5Say('burnEnd',5,'happy');
  for(let t=0;t<.55;t+=1/60){ const u=twEIn2(t/.55); H.y=lerp(sy,gy+1.3*3,u); H.spin=.3*(1-u); H.put(); yield wait(1/60); }
  impactFrame([[1,3],[3,3],[2,2]]); Sound.sfx('crash'); Sound.sfx('slam'); shake(2); FX.flash=.7; grade.uniforms.flashCol.value.set(1,.3,.4); for(let k=0;k<3;k++) FX.ring(C.x,gy+.1,C.z,k%2?'#ff6ab0':'#ffffff',4+k*3,.5);
  d5Gib(C,50); twHikariBurst(H.x,gy+2,H.z); V.kill(); cineSet(C.x+2,gy+2,C.z+9,C.x,gy+2.4,C.z); yield wait(1.4);
  // she melts into a puddle
  Sound.sfx('squelch');
  for(let t=0;t<1.6;t+=1/30){ const u=t/1.6; H.m.scale.set(1+u*.6,Math.max(.03,1-u),1); H.y=gy+1.3*3*Math.max(.03,1-u); H.put(); if(Math.random()<.5) FX.spawn(H.x+rnd(-1.5,1.5),gy+.2,H.z+rnd(-1,1),rnd(-1,1),rnd(0,1),rnd(-1,1),.5,0xffffff,.3,0,false); yield wait(1/30); }
  H.kill(); twZone(H.x,H.z,2.6,999,{op:.92,splat:1}); twZone(H.x+1.4,H.z+.8,1.6,999,{op:.9,splat:1});
  if(A){ cineSet(A.x+1,A.y+1.4,A.z+3,A.x,A.y+1.5,A.z); yield d5Say('burnEnd',6); } if(mi){ cineSet(mi.x+1,mi.y+1.3,mi.z+3,mi.x,mi.y+1.2,mi.z); yield d5Say('burnEnd',7,'surprised'); }
  twCamP(6,.6); yield d5Say('burnEnd',8,'sad');
  yield* twDuoEnding(F,C,O); }
// the ending: no fight left to finish, just the walk home
twDuoEnding=function*(F,C,O){ const P=Player, A=twAliAny(), mi=Game.mira; if(!(F&&F.v5)) return;
  TW._wipe=1; try{ twEndFight(); } finally{ TW._wipe=0; } Game.arena=null; TW.d5mira=null;
  if(A){ A.hold=1; A.x=P.x+1.5; A.z=P.z+.4; A.y=groundY(A.x,A.z); A.face=-1; cineSet((P.x+A.x)/2,P.y+1.2,P.z+4.4,(P.x+A.x)/2,P.y+1.3,P.z); yield d5Say('ending',0); cineSet(P.x-.6,P.y+1.3,P.z+2.8,P.x,P.y+1.4,P.z); yield d5Say('ending',1,'surprised');
    cineSet(A.x+.6,A.y+1.5,A.z+2.6,A.x,A.y+1.5,A.z); yield d5Say('ending',2); Sound.sfx('dash'); aliGhost(A.x,A.y,A.z); twClearAllies(); yield wait(.6); twCamP(5.6,.4); yield d5Say('ending',3,'surprised'); }
  if(mi){ mi.vis=true; mi.x=P.x+1.2; mi.z=P.z+.3; mi.y=P.y; mi.f=-1; mi.anim='idle'; Sound.play('ending'); cineSet((P.x+mi.x)/2,P.y+1.2,P.z+4.2,(P.x+mi.x)/2,P.y+1.2,P.z);
    yield d5Say('ending',4,'happy'); yield d5Say('ending',5,'blush'); yield d5Say('ending',6,'happy'); yield d5Say('ending',7,'happy'); }
  Game.ending=5; yield cineTo([P.x,6,P.z+16],[P.x,6,P.z-20],3); yield wait(.4);
  twZeldaCard('Route Clear','The Gatekeeper Twins','The Other Way',3.2); yield wait(3.4); evaCard(['GG.'],2,3); yield wait(2.2); yield fadeOut(); Game.state='end'; Game.endT=0; Game.script=null; };
