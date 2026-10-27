// =====================================================================
// STORY: the gate fight, the choice (Shayan's road; on Ali's road he kills both: twAliKillsBoth), the party, the hooks into Grimmaw
// =====================================================================
function twSetScr(name,fn){ SCR[name]=fn; SCR_BASE[name]=fn; SCRA[name]=fn; }
function twWrapScr(name,pre){ for(const o of [SCR_BASE,SCRA]){ const orig=o[name]; if(!orig) continue; o[name]=function*(){ yield* pre(); yield* orig.call(this); }; } SCR[name]=(ALI()?SCRA:SCR_BASE)[name]; }
const TW_GATE_LOCK={x0:2.3,x1:23.6,z0:4.4,z1:13.5};
function twStartGate(){ twClearFoes(); const hp=ALI()?56:66;
  const C=twMake('caotan',13.4,7.3,{hp,maxHp:hp,phases:1,title:'Caotan Cummaster',sub:'Gatekeeper (left)',dist:6.2}), O=twMake('omar',14.4,11.2,{hp,maxHp:hp,phases:1,title:'Omar the Edge',sub:'Gatekeeper (right)',dist:4.2,dir:-1});
  C.cd=1.1; O.cd=2.1;
  const F=TW.fight={kind:'gate',lock:TW_GATE_LOCK,noLC:true,
    pool(T){ const other=TW.foes.find(o=>o!==T); if(other&&!other.down&&other.gen) return []; return TWPOOL[T.who].gate; },
    cd(T){ const other=TW.foes.find(o=>o!==T), solo=other&&other.down; return (solo?.7:1.2)*(ALI()?.85:1); },
    onHurt(T){ if(T.hp<=0&&!T.down){ T.down=1; T.inv=true; T.gen=null; T.hide=0; Voice.stop(); twBark(T.who,T.who==='caotan'?"Ugh! I'm tapped out!":"Brother... avenge my edge!",true); FX.burst(T.x,T.y+1.4,T.z,50,T.who==='caotan'?0xffffff:0x2a0a3a,7,.45,T.who==='caotan'); Sound.sfx('crash'); shake(.45);
        const other=TW.foes.find(o=>o!==T&&!o.down); if(other){ other.phase=2; other.tint=other.who==='caotan'?0xffe0f0:0xe0d0ff; setTimeout(()=>twBark(other.who,other.who==='caotan'?"OMAR! You'll pay for that! ...Gently! I'm sensitive!":"Caotan... I will finish this. Alone. As always.",true),900); }
        if(TW.foes.every(o=>o.down)&&!F.pend){ twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); F.pend=SCR.twinsDown; } } },
    respawn(){ twGateRestart(); }};
  Game.arena={lock:TW_GATE_LOCK}; Cam.zoom=1.08; Sound.play('battle'); }
function twGateRestart(){ twClearHz(); BOLTS.forEach(b=>{ if(!b.friendly) b.dead=1; }); TW.sentence=null; twStartGate(); resetPlayer({x:3.2,z:9},true); Player.hp=Player.maxHp; Player.ang=0; Player.f=1; Cam.cine=null; Cam.focus=null; Game.letterTo=0; Game.fade=1; Game.fadeTo=0; Game.state='play'; }
restartTwins=function(){ BOLTS.forEach(b=>b.dead=1); Voice.stop(); Game.subtitle=null; twGateRestart(); };

twSetScr('twinsGate',function*(){ const P=Player; yield fadeOut(); loadLevel('twins',{keepHP:1}); P.hp=P.maxHp; Game.fade=1; resetPlayer({x:3.2,z:9},true); P.ang=0; P.f=1; Game.flags.twinAlly=null; Game.flags.twinPact=0; Game.flags.twinBetrayDone=0; twClearAllies();
  twStartGate(); const TWL=TW.foes; TWL.forEach(T=>{ T.y=groundY(T.x,T.z)+16; T.hy=16; T.noAttack=1; T.inv=true; }); TW.fight.frame=false; Game.state='cut'; Sound.stop();
  Game.letterTo=1; cineSet(5,2.4,16,9,1.6,8.5); yield wait(.3); yield fadeIn(); Sound.sfx('drone');
  yield cineTo([7,3.2,17],[13,2,8.5],2.2,t=>t*(2-t));
  yield say(HERO(),ALI()?"Kennel Keep. Smaller than I imagined. Everything is.":"The gate to Kennel Keep. Hang on, Mira. I'm almost there.");
  Sound.sfx('howl'); shake(.5); cineSet(10,.8,15,14,5,9);
  // the twins drop in, one at a time, with a lot of unnecessary posing
  const C=TWL[0], O=TWL[1];
  const ride=(T,side)=>{ const r={on:1}; Game.fxUpd.push(()=>{ if(!r.on) return false; const gy=groundY(T.x,T.z); cineSet(T.x+side,Math.max(gy+3,T.y*.55+2.4),T.z+9.5,T.x,T.y+1.6,T.z); return true; }); return r; };
  let rd=ride(C,-2); yield wait(.5); yield tween(C,{hy:1.3},.75,t=>t*t); for(let k=0;k<90&&C.y-groundY(C.x,C.z)>1.6;k++) yield wait(1/60); rd.on=0; /* his height lags the tween: keep following until he lands */ Sound.sfx('slam'); shake(.6); FX.burst(C.x,groundY(C.x,C.z)+.3,C.z,40,0xffffff,7,.4,false); FX.ring(C.x,groundY(C.x,C.z),C.z,'#ffffff',4,.5);
  twCamT(C,7.5,-1.5); yield wait(.3);
  yield say('caotan',ALI()?"Not so fast, rice hat!":"Not so fast, little blacksmith!");
  yield* twGlint(C,1,.22,1); yield say('caotan',"I am Caotan Cummaster! My aim is legendary, my reserves are endless, and my glasses are... PRESCRIPTION.");
  O.hy=10; O.y=groundY(O.x,O.z)+10; rd=ride(O,1.6); yield wait(.35); yield tween(O,{hy:1.3},1,t=>1-Math.pow(1-t,3)); for(let k=0;k<90&&O.y-groundY(O.x,O.z)>1.6;k++) yield wait(1/60); rd.on=0; FX.burst(O.x,O.y+1.4,O.z,60,0x140a1a,6,.5,false); Sound.sfx('void');
  twCamT(O,7.5,1.4); O.scythe=1;
  yield say('omar',"And I am Omar the Edge. The darkness and I are on a first-name basis. It calls me 'Omar'. I call it... 'Darkness'.");
  O.scythe=0; twCamP(6.2,1.2);
  if(ALI()){ yield say('ali',"You call yourself the Edge?"); yield say('omar',"I... yes. I do."); yield say('ali',"I am the edge. You are a butter knife in a coat."); yield say('omar',"...Brother. I think he's edgier than me.",'angry'); }
  else { yield say('shayan',"Wait. Are you two twins? You look nothing alike."); yield say('caotan',"We don't talk about it."); yield say('omar',"We do not talk about it."); }
  yield say('caotan',ALI()?"Nobody is edgier than my brother! Get him!":"Enough talk! Prepare to be... OVERWHELMED.",'angry');
  if(Game.hamza) yield say('hamza',ALI()?"Oink oink! Ali, slice their projectiles right before they hit! Send them back!":"Oink oink! Shayan, swing at their projectiles! Send everything right back at them!",'happy');
  evaCard(['THE GATEKEEPER TWINS','CAOTAN & OMAR'],2,1); Sound.sfx('slam'); yield wait(2);
  Game.banner={name:'Caotan Cummaster & Omar the Edge',sub:ALI()?'The Gatekeeper Twins (outmatched)':'The Gatekeeper Twins',t:0};
  yield cineTo([10,7.2,25],[10,1.2,9],1.1); TWL.forEach(T=>{ T.noAttack=0; T.inv=false; }); TW.fight.frame=true; Cam.cine=null; Game.letterTo=0; Game.state='play'; Sound.play('battle'); });

twSetScr('twinsDown',function*(){ const P=Player, C=TW.foes.find(T=>T.who==='caotan'), O=TW.foes.find(T=>T.who==='omar'), H=HERO(); Sound.stop(); Game.slowT=.8; Game.letterTo=1; TW.fight.frame=false; TW.fight.noBar=true; Cam.focus=null;
  [C,O].forEach(T=>{ T.down=1; T.inv=true; T.gen=null; T.hy=1.3; });
  cineSet(P.x+3,2.6,P.z+7,15,2,9); yield cineTo([12.4,2.4,16],[14,1.2,9.2],1.4,t=>t*(2-t));
  yield say('caotan',ALI()?"How?! I didn't even get a single hit in!":"Impossible! I've been completely drained!");
  yield say('omar',ALI()?"I have been... out-edged.":"The edge... has been... dulled.");
  twCamP(6.8,.5); yield walkP(Math.min(P.x+1.5,11),9.2,2);
  yield say(H,ALI()?"Rest now. One of you, anyway. I'm feeling generous.":"Okay. It's over. Stay down, both of you.");
  twCam2(C,O,10,-1);
  yield say('caotan',"W-wait! Don't kill me! Kill HIM!",'surprised');
  yield say('omar',"Do not listen to him. Kill HIM. He uses my towels.");
  twCam2(C,O,9.5,1.5);
  yield say('caotan',"You use MY glasses cleaner!");
  yield say('omar',"To polish my SCYTHES. It's called being resourceful.",'angry');
  yield say('caotan',"I'm useful! I can carry heavy things! I have ENDLESS reserves!",'angry');
  yield say('omar',"I can be quiet. Very quiet. Like a shadow. ...Unless spoken to. Or ignored. Then I write poems.");
  yield say('caotan',"His poems rhyme 'darkness' with 'darkness'!");
  yield say('omar',"Because nothing ELSE rhymes with it, Caotan!",'angry');
  if(Game.hamza) yield say('hamza',"Bismillah, just pick one. We're burning moonlight.",'happy');
  // Ali's road has no decision: he kills both, then walks into Kojima's keep alone
  if(ALI()){ yield* twAliKillsBoth(C,O); Game.flags.twinsDone=1; Game.flags.twinAlly=null; Game.flags.twinPact=0; twEndFight(); Game.arena=null; Cam.focus=null; yield* SCR.keepGate(); return; }
  twCamP(6.8,-1.2);
  // the merciful option opens only once both twins' betrayal fights are beaten on this road; the twins notice when it does
  const pact=twPactOpen(), rk='sh'; TWS.pactSeen=TWS.pactSeen||{};
  if(pact&&!TWS.pactSeen[rk]){ TWS.pactSeen[rk]=1; twSave(); yield* twPactUnlockTalk(C,O); }
  else if(!pact&&!(TWS.pactTease||{})[rk]){ TWS.pactTease=TWS.pactTease||{}; TWS.pactTease[rk]=1; twSave(); twCam2(C,O,9.5,1.5); yield say('caotan',"Hey! Why is the nice option GRAY?! Who designed this?!",'angry'); yield say('omar',"Mercy is a premium feature, brother. It unlocks after two funerals. Ours.",'sad'); }
  const c=yield choose([{t:"Kill Caotan."},{t:"Kill Omar."},{act:1,t:"What if there was another way...",lock:!pact,why:"Locked: beat both twins' betrayal fights on Shayan's road first"}]);
  if(c===2){ yield* twPactTalk(C,O); }
  else { const V=c===0?C:O, S=c===0?O:C; yield* twExecute(V,S); }
  Game.flags.twinsDone=1; twEndFight(); Game.arena=null; Cam.focus=null;
  yield* SCR.keepGate(); });

// Ali's road: "one of you" turns out to mean both
function* twAliKillsBoth(C,O){ const P=Player;
  twCamP(6.8,-1.2); yield say('ali',"You both make excellent points.");
  twCam2(C,O,9.5,1.5); yield say('caotan',"So you'll pick ONE of us?!",'happy');
  twCamP(6.8,-1.2); yield say('ali',"Hm. Why not both?");
  twCam2(C,O,10,-1); yield say('omar',"...Brother. I believe we have been out-negotiated.",'sad');
  yield say('caotan',"WAIT! I have a body pillow at home! Who's gonna feed h-",'surprised');
  // one draw, two twins
  const mx=(C.x+O.x)/2, mz=(C.z+O.z)/2; zwStart(); Sound.sfx('dash'); aliGhost(P.x,P.y,P.z); P.x=mx; P.z=mz+.6; P.f=1; P.cineFly=true; P.cineAnim='idle'; cineSet(mx+.6,1.6,mz+7.5,mx,1.4,mz); yield wait(.6);
  yield say('ali',"Nothing personal. Twice.");
  Sound.sfx('secret'); zwEnd(); JC.lines=[]; for(let i=0;i<36;i++){ const a=rnd(0,Math.PI), x=UW/2+rnd(-160,160), y=UH/2+rnd(-100,100); JC.lines.push({x0:x-Math.cos(a)*340,y0:y-Math.sin(a)*340,x1:x+Math.cos(a)*340,y1:y+Math.sin(a)*340,t:1}); }
  JC.flash=1; impactFrame([[3,3],[1,2],[2,3]]); Sound.sfx('crossboom'); shake(1.4); P.cineFly=false; P.cineAnim=null;
  for(const V of [C,O]){ const vc=V.who==='caotan'; for(let i=0;i<3;i++) FX.burst(V.x,V.y+1.4,V.z,60,vc?0xffffff:0x1a0820,7+i*2,.5,vc); FX.burst(V.x,V.y+1.4,V.z,30,vc?0xfff0d0:0x8a3aff,10,.35); FX.ring(V.x,groundY(V.x,V.z)+.1,V.z,vc?'#ffffff':'#8a3aff',3,.5); }
  Sound.sfx('gore'); Sound.sfx('squelch'); twRemoveFoe(C); twRemoveFoe(O); yield wait(1.2);
  cineSet(P.x+1.4,1.4,P.z+4,P.x,1.4,P.z);
  yield say('',"The gatekeeper twins came apart in matching pieces. Even now, they did not look alike.");
  if(Game.hamza){ yield say('hamza',"Bismillah... Ali, that was two whole people."); yield say('ali',"It was two butter knives. Now it is four."); }
  yield say('ali',"Baby. You have ten seconds. Start running."); }
// both betrayal fights beaten on this road (the timeline cheat counts too)
function twPactOpen(){ return twDone('sh_omar_f')&&twDone('sh_cao_f'); }
function* twPactUnlockTalk(C,O){ twCam2(C,O,9.5,1.5); Sound.sfx('secret');
  { yield say('caotan',"Senpai. SENPAI. Do you see it? The third option! It's not gray anymore!",'happy');
    yield say('omar',"You killed us both. In separate timelines. We remember. We talk about it in the loading screens.",'sad');
    yield say('shayan',"...Are you two reading the MENU?",'surprised');
    yield say('caotan',"We've been reading it for a while. You hover over 'Kill Caotan' a LOT.",'sad');
    yield say('omar',"Pick the nice one. Or don't. Either way, we've already seen how it ends."); } }
function* twExecute(V,S){ const P=Player, H=HERO(), vc=V.who==='caotan';
  twCamT(V,7); yield say(V.who,vc?"Wait wait wait, I have a body pillow at home! Who's gonna feed her?!":"So be it. Tell my poems... I'm sorry.",vc?'surprised':'normal');
  { P.ang=Math.atan2(V.z-P.z,V.x-P.x); P.f=V.x>P.x?1:-1; P.charge=2; cineSet(P.x-P.f*2.4,1.3,P.z+3.4,P.x+P.f*1.2,1.5,P.z); yield wait(.3); yield say('shayan',"Sorry, man. Getsuga Tenshou!",'angry');
    twCamT(V,9,0); Game.timeScale=.3; fireBeam(true,true); P.charge=0; yield wait(.35); Game.timeScale=1; FX.flash=1; grade.uniforms.flashCol.value.set(1,.9,.95); shake(1); Sound.sfx('slam'); }
  for(let i=0;i<3;i++) FX.burst(V.x,V.y+1.4,V.z,60,vc?0xffffff:0x1a0820,7+i*2,.5,vc); FX.burst(V.x,V.y+1.4,V.z,30,vc?0xfff0d0:0x8a3aff,10,.35); FX.ring(V.x,groundY(V.x,V.z)+.1,V.z,vc?'#ffffff':'#8a3aff',3,.5); Sound.sfx('gore');
  twRemoveFoe(V); yield wait(1.2);
  twCamT(S,7);
  if(S.who==='omar'){ yield say('omar',"...Brother. He is gone. I feel... nothing. As is tradition."); yield say('omar',"...I feel a little something. Do not look at me."); yield say('omar',"Very well, swordsman. I will fight beside you. For now. The darkness is... patient."); }
  else { yield say('caotan',"OMAR! ...Okay. He's gone. That's... that's a lot."); yield say('caotan',"Hi! I'm your new party member! I do ranged DPS, emotional support, and I never, EVER run dry!",'happy'); }
  yield say(H,"...Great. Welcome to the team, I guess. Please stand where I can see you.");
  S.down=0; twAddAlly(S.who); const A=TW.allies[TW.allies.length-1]; A.x=S.x; A.z=S.z; A.y=S.y; twRemoveFoe(S); Game.flags.twinAlly=S.who; Game.flags.twinPact=0;
  Game.banner={name:(S.who==='caotan'?'Caotan':'Omar')+' joined your party',sub:'An AI ally. Totally, completely trustworthy.',t:0,small:1}; Sound.sfx('secret'); }

function* twPactTalk(C,O){ const P=Player, H=HERO(); Sound.play('romance');
  twCam2(C,O,10.5,.5); yield wait(.4);
  yield say('caotan',"...Another way?",'surprised'); yield say('omar',"There is no other way. There is only the edge. And the... other edge.");
  twCamP(6.2,1);
  { yield say('shayan',"The baby is the real problem. He's the one who took Mira. You guys just... guard a door.");
    yield say('shayan',"Help me save her, and you both walk away. Nobody has to die tonight. Except maybe the baby guy."); }
  twCam2(C,O,10,-1);
  yield say('caotan',"Like... a team? Like a FRIEND GROUP? With a group chat?!",'happy');
  yield say('omar',"I do not do friends. I do... allies of convenience.");
  yield say(H,"That's literally what friends are, man.");
  yield say('omar',"...Fine. But I am not smiling in the party photo.");
  yield say('caotan',"SQUAAAD!! Omar, group hug!",'happy'); yield say('omar',"Touch me and I will reap you."); yield say('caotan',"He's hugging back on the inside.",'happy');
  if(Game.hamza) yield say('hamza',"Bismillah. The party is now big enough for a tax return.",'happy');
  [C,O].forEach(T=>{ T.down=0; twAddAlly(T.who); const A=TW.allies[TW.allies.length-1]; A.x=T.x; A.z=T.z; A.y=T.y; FX.burst(T.x,T.y+1.4,T.z,24,T.who==='caotan'?0xffd0ec:0xa070ff,4,.35); });
  twRemoveFoe(C); twRemoveFoe(O); Game.flags.twinAlly='both'; Game.flags.twinPact=1; Sound.sfx('secret'); evaCard(['THE GATEKEEPER TWINS','HAVE JOINED YOUR PARTY'],2.2,1); yield wait(2.2); }

// ---------- the twins chime in during the Kojima fight (the old Grimmaw) ----------
function twAllySays(cao,om){ return function*(){ const has=w=>TW.allies.some(A=>A.who===w); if(has('caotan')&&cao) yield say('caotan',cao); if(has('omar')&&om) yield say('omar',om); }; }
twWrapScr('p1special',twAllySays("Soldiers falling out of the sky?! In BOXES?! Senpai, stay close!","It is raining men. In sneaking suits. The forecast did not mention this."));
twWrapScr('p2special',twAllySays("Nine of the same guy?! Is that a HYDRA of GRANDPAS?! Go, go, go!","Nine Solid Snacks. Nine mullets. One shared bandana. Respect."));
twWrapScr('p3special',twAllySays("The baby is on FIRE! Like, actually! Not in a hot way!","Let him burn. Fire is just loud darkness. And he is just a loud baby."));
function* twAllyReactHamza(){ const has=w=>TW.allies.some(A=>A.who===w);
  if(has('caotan')) yield say('caotan',"He just... he cut the PIG. In HALF. Without LOOKING.",'surprised');
  if(has('omar')) yield say('omar',"I want to be him when I grow up.");
  yield say('ali',"Get in line."); }
function twAllyLeave(){ if(!TW.allies.length) return; TW.allies.forEach(A=>{ FX.burst(A.x,A.y+1.4,A.z,30,A.who==='caotan'?0xffd0ec:0x2a0a3a,5,.4,A.who==='caotan'); }); twClearAllies(); }
// ---------- locked choices ({lock:true, why}): drawn grayed out; picking one only says why ----------
(function(){ const ud=updateDialog; updateDialog=function(dt){ const d=Game.dlg;
    if(d&&d.type==='choice'&&d.opts[d.sel]&&d.opts[d.sel].lock&&d.t>.3){ const tap=Game.pendTap&&performance.now()-Game.pendTap<1500;
      if(tap||consume('confirm')||consume('attack')||consume('jump')){ Game.pendTap=0; clearHits(); Sound.sfx('block'); shake(.1); Game.banner={name:'Locked',sub:d.opts[d.sel].why||'Not yet',t:0,small:1}; d.t+=dt; return; } }
    return ud.apply(this,arguments); }; })();
