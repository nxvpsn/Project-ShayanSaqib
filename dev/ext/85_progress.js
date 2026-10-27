// =====================================================================
// PAUL'S TIMELINE: saved progress, a branching route map, and warps
// Every checkpoint shows ??? until you clear it in the story. Cleared ones
// show their art, a checkmark, and can be warped to. Saved in localStorage,
// so it survives endings and new games.
// =====================================================================
const PAUL_LOOK={cloth:'#3a3f4a',clothS:'#2a2e36',skin:'#d8a882',hair:'#1a1410',hood:'#4b5160',pants:'#26262c',pantsS:'#1c1c22'};
const TWS=(function(){ const p=saveHas()?SAVE.progress:{done:{}}; if(!p.unl||typeof p.unl!=='object') p.unl={}; delete p.all; return p; })();
function twSave(){ SAVE.progress=TWS; saveWrite(); }
// cleared in the story, or unlocked with the timeline cheat's checkbox
function twDone(id){ return !!(TWS.done[id]||TWS.unl[id]); }
function twMark(id){ if(!id) return; TWS.last=id; if(TWS.done[id]){ twSave(); return; } TWS.done[id]=Date.now(); twSave(); const n=TL_BY[id]; if(n) Game.banner={name:'Timeline updated',sub:n.name+'  ✓',t:0,small:1}; }
// unlock (or relock) every card the way the timeline cheat's 'Unlock all' does; used by the tests too
function twUnlockAll(on){ TL.forEach(n=>{ if(n.root) return; if(on) TWS.unl[n.id]=1; else delete TWS.unl[n.id]; }); twSave(); return !!on; }
function twRP(){ return ALI()?'al':'sh'; }
function twAllyKey(){ const a=Game.flags.twinAlly; return a==='both'?'both':a==='omar'?'omar':a==='caotan'?'cao':null; }

// ---------- the map ----------
const TL=[
  // Shayan's road (each "twin stays" panel plays the choice, then the fight with He's Day Old Kojima at Day Old Keep)
  {id:'sh_root',tab:0,col:0,row:1,root:1,name:"Shayan's Road",desc:"A blacksmith, a fairy pig and a catgirl apothecary walk into a festival. A very rich baby wants the catgirl for his collection."},
  {id:'sh_twins',tab:0,col:1,row:1,par:['sh_root'],name:'The Gatekeeper Twins',desc:"A laser weeb with a body pillow and an edgelord with a scythe guard the baby's gate. Twins. Do not ask."},
  {id:'sh_dec',tab:0,col:2,row:1,par:['sh_twins'],name:'Pick a Twin',desc:"Both on their knees, blaming each other. Kill one. The nice option stays gray until you beat both betrayals on this road."},
  {id:'sh_omar',tab:0,col:3,row:0,par:['sh_dec'],name:'Edgelord & Baby',desc:"Caotan eats a Getsuga. Omar joins you to storm Day Old Keep against He's Day Old Kojima: a baby in a suit with lawyers."},
  {id:'sh_cao',tab:0,col:3,row:1,par:['sh_dec'],name:'Weeb & Baby',desc:"Omar is gone. Caotan and Hikari-chan join you against He's Day Old Kojima, his sneaking soldiers and a Hydra of Solid Snacks."},
  {id:'sh_both',tab:0,col:3,row:2,par:['sh_dec'],name:'The Group Chat vs. The Baby',desc:"Nobody dies. Both twins join, the squad beats up a rich baby and Mira gets rescued. Nobody likes the group chat."},
  {id:'sh_omar_f',tab:0,col:4,row:0,par:['sh_omar'],name:'Bankai: Moon Eater',desc:"Among the white flowers, Omar turns on you: Bankai, black snow, a scythe you can send back. He eats the moon."},
  {id:'sh_cao_f',tab:0,col:4,row:1,par:['sh_cao'],name:'Domain Expansion: Senpai',desc:"Caotan turns on you. A stained-glass Hikari domain, glints, lasers and the Megane Supernova. Parry the feelings."},
  {id:'sh_both_f',tab:0,col:4,row:2,par:['sh_both'],name:'Big Back Hamza',desc:"Your pig fairy gets planet-hungry. The twins help you fight a giant flying pig with a halo and a buffet."},
  {id:'sh_hamza',tab:0,col:5,row:0.5,par:['sh_omar_f','sh_cao_f'],name:'Eight Billion Lullabies',desc:"The pig ate the world. Nathan flies his mech into its sky: a bullet hell, four gundam bits, a cockpit on fire."},
  {id:'sh_duo',tab:0,col:5,row:2,par:['sh_both_f'],name:'The Other Way',desc:"The twins turn. A samurai cuts Mira free. Black holes, a tree of Judgement Cuts, a drill, a pillow the size of the sky."},
  // Ali's road
  {id:'al_root',tab:1,col:0,row:1,root:1,name:"Ali's Road",desc:"Shayan hit the wrong man. Ali kicked him to the moon, cut the moon to pieces and took over. He counts to ten. Slowly."},
  {id:'al_twins',tab:1,col:1,row:1,par:['al_root'],name:'Butter Knives in Coats',desc:"The gatekeeper twins try very hard to stop the samurai. The samurai tries very little."},
  {id:'al_dec',tab:1,col:2,row:1,par:['al_twins'],name:'Hm.',desc:"Two twins on their knees, one sword, zero patience. The nice option stays gray until Ali beats both betrayals himself."},
  {id:'al_omar',tab:1,col:3,row:0,par:['al_dec'],name:'Ten Seconds, Infant',desc:"Caotan is gone. Omar follows Ali into Day Old Keep. The baby got a ten-second head start. It did not help."},
  {id:'al_cao',tab:1,col:3,row:1,par:['al_dec'],name:'Uwu & the Baby',desc:"Omar is gone. Caotan follows Ali to Day Old Keep like a lost puppy with glasses. The baby wet himself when he heard Ali counting."},
  {id:'al_both',tab:1,col:3,row:2,par:['al_dec'],name:'Emotional Support Twins',desc:"Two weaklings are better than zero weaklings. Barely. Ali, two twins and one very rich baby with a Hydra of Solid Snacks."},
  {id:'al_omar_f',tab:1,col:4,row:0,par:['al_omar'],name:'Butter Knife Betrayal',desc:"Omar studied Ali's moveset. He read the wiki. He went Bankai. It did not help either."},
  {id:'al_cao_f',tab:1,col:4,row:1,par:['al_cao'],name:'Friendzoned by a Samurai',desc:"Caotan's dating sim, Domain Expansion edition, except the love interest only says 'Hm.'"},
  {id:'al_nathan',tab:1,col:5,row:0.5,par:['al_omar_f','al_cao_f'],name:'Your Tragic Arc Was Mid',desc:"Nathan the Nasty crosses timelines to save the world from the pig. Ali already cut the pig in half. So Nathan fights Ali instead."},
  {id:'al_nathan_both',tab:1,col:4.5,row:2,par:['al_both'],name:'Reply All',desc:"Nathan the Nasty versus Ali and two twins who will not stop talking. The mech has funnels. The twins have opinions."},
  // oddities
  {id:'sh_nathan',tab:2,col:1,row:1,root:0,par:[],name:'Wrong Turn',desc:"Paul's shortcut drops Shayan in front of Nathan's mech. This was never supposed to happen. Paul loves it."},
  {id:'paul',tab:2,col:4,row:1,par:[],final:1,name:'Paul Extreme: Code Review',desc:"Paul's own raid. Everyone loses their powers. Opens once every other checkpoint is cleared, or with the timeline cheat."}];
const TL_BY={}; TL.forEach(n=>TL_BY[n.id]=n);
const TL_CHECKS=TL.filter(n=>!n.root&&!n.final).map(n=>n.id);
function twAllDone(){ return TL_CHECKS.every(twDone); }
function twNodeOpen(n){ return n.root||(n.final?(twAllDone()||!!TWS.unl[n.id]):twDone(n.id)); }

// ---------- checkpoint hooks ----------
(function(){ const td=SCR_BASE.twinsDown; const wrapDown=function*(){ const r=twRP(); twMark(r+'_twins'); twMark(r+'_dec'); yield* td.call(this); };
  twSetScr('twinsDown',wrapDown);
  const ex=twExecute; twExecute=function*(V,S){ yield* ex(V,S); twMark(twRP()+'_'+(S.who==='omar'?'omar':'cao')); };
  const pt=twPactTalk; twPactTalk=function*(C,O){ yield* pt(C,O); twMark(twRP()+'_both'); };
  const sd=twSoloDefeat; twSoloDefeat=function*(F,T){ twMark(twRP()+'_'+(T.who==='omar'?'omar':'cao')+'_f'); yield* sd(F,T); };
  const hf=hzgFinale; hzgFinale=function*(){ twMark('sh_both_f'); yield* hf(); };
  const de=twDuoEnding; twDuoEnding=function*(F,C,O){ twMark('sh_duo'); yield* de(F,C,O); };
  const bh=blackHoleFinale; blackHoleFinale=function*(){ if(!ALI()) twMark('sh_hamza'); yield* bh(); };
  const nf=nbFinale; nbFinale=function*(){ if(ALI()) twMark(Game.flags.twinPact?'al_nathan_both':'al_nathan'); else twMark('sh_nathan'); yield* nf(); }; })();

function twMarkGrimmaw(){ const k=twAllyKey(); if(k) twMark(twRP()+'_'+k+'_g'); } // the Grimmaw/Kojima win (no panel any more; kept for old saves)
// ---------- warps ----------
function twWarpReset(ali){ const P=Player; Voice.stop(); if(Game.mech) exitMech(); nbRemove(); twEndFight(); twClearAllies(); TW.giant=null; TW.giantRespawn=null; clearGibs(); endClash();
  if(Game.boss&&Game.boss.spr) Game.boss.spr.dispose(); Game.boss=null; Game.bossBar=0; if(Game.zw) zwEnd(); JC.lines=[]; Game.arena=null; Game.fxUpd=[]; twSweep(false); clearTwins();
  const aff=Math.max(Game.aff||0,6); Game.flags={metMira:1,bellMemory:1,twinsDone:0}; if(ali){ Game.flags.ali=1; Game.flags.moonCut=1; Object.assign(SCR,SCRA); } else Object.assign(SCR,SCR_BASE);
  Game.aff=aff; Game.aliOld=0; Game.aliHintT=0; Game.mira=null; if(mSprite) mSprite.show(false); Object.assign(P,{sp:0,counter:0,cineFly:false,cineAnim:null,hidden:false,scripted:null,atk:null,charge:0}); P.maxHp=12; P.hp=P.maxHp;
  newHamza(); Game.hamza.mode='follow'; Game.paulLock=false; }
function* twWarpTwinsDown(){ yield fadeOut(); loadLevel('twins',{keepHP:1}); resetPlayer({x:9.5,z:9.2},true); twStartGate(); TW.fight.frame=false; TW.fight.noAttack=true;
  for(const T of TW.foes){ T.down=1; T.hp=0; T.inv=true; } Game.fade=1; yield fadeIn(); }
function* twWarpFlowers(o){ o=o||{}; yield fadeOut(); const fl=Game.flags, aff=Game.aff; loadLevel('flowers',{keepHP:1}); Game.flags=fl; Game.aff=aff; const P=Player, z=L.zone||{x:58,z:60};
  resetPlayer({x:z.x,z:z.z+3},true); P.hp=P.maxHp; if(o.cage){ const cg=L.spots.mira; addActor('cage',cg.x,cg.z,cg.y!=null?cg.y:groundY(cg.x,cg.z)); }
  if(o.mira){ Game.mira={x:P.x+1.4,y:P.y,z:P.z+.4,f:-1,anim:'idle',t:0,follow:false,vis:true}; makeMiraSprite(); if(mSprite) mSprite.show(true); }
  if(o.noHamza){ Game.hamza=null; if(hSprite) hSprite.show(false); } Game.fade=1; yield fadeIn(); }
function twSetParty(k){ Game.flags.twinsDone=1; if(k==='both'){ Game.flags.twinAlly='both'; Game.flags.twinPact=1; twAddAlly('caotan'); twAddAlly('omar'); } else { Game.flags.twinAlly=k==='cao'?'caotan':'omar'; Game.flags.twinPact=0; twAddAlly(Game.flags.twinAlly); } }
function* twWarp(id){ const n=TL_BY[id]; if(!n&&!/_g$/.test(id)) return; /* '_g' (straight to Grimmaw) has no panel, Debug Mode still uses it */ const ali=id.startsWith('al_'); const parts=id.split('_'); twWarpReset(ali); const P=Player;
  if(id==='sh_nathan'){ yield* paulWarp(false,'nathan'); return; }
  if(id==='paul'){ yield* twPaulIntro(); return; }
  const step=parts[1], k=parts[1], tail=parts[2];
  if(id==='al_root'){ yield fadeOut(); Game.state='cut'; yield* aliLanding(Game.flags,Game.aff,Game.kills||0,Game.hamza); return; } // Ali's road: he falls from the moon and takes over
  if(step==='root'){ yield fadeOut(); newGame(); run(twIntroSkipped); return; } // Shayan's road: the village, right after the talk with Hamza and Elder Hamid
  if(step==='twins'){ yield* SCR.twinsGate(); return; }
  if(step==='dec'){ yield* twWarpTwinsDown(); yield* SCR.twinsDown(); return; }
  if(['omar','cao','both'].includes(k)&&!tail){ yield* twWarpTwinsDown(); const C=TW.foes.find(T=>T.who==='caotan'), O=TW.foes.find(T=>T.who==='omar'); twMark(twRP()+'_dec');
    if(k==='both') yield* twPactTalk(C,O); else yield* twExecute(k==='omar'?C:O,k==='omar'?O:C); Game.flags.twinsDone=1; twEndFight(); Game.arena=null; Cam.focus=null; yield* SCR.keepGate(); return; }
  if(tail==='g'){ twSetParty(k); yield* SCR.keepGate(); return; }
  if(tail==='f'&&k!=='both'){ twSetParty(k); yield* twWarpFlowers({cage:1}); Game.boss=null; yield* twBetrayal(); return; }
  if(id==='sh_both_f'){ twSetParty('both'); yield* twWarpFlowers({mira:1}); yield* twPactHamza(); return; }
  if(id==='sh_duo'){ twSetParty('both'); yield* twWarpFlowers({mira:1,noHamza:1}); yield* twTwinsTurn(); return; }
  if(id==='sh_hamza'){ yield fadeOut(); Game.mira=null; yield* nathanIntro(); return; }
  if(id==='al_nathan'||id==='al_nathan_both'){ if(id==='al_nathan_both') twSetParty('both'); yield* twWarpFlowers({mira:1,noHamza:1}); yield* nathanArrives(); return; } }

// warping to the very beginning skips the Hamza / Elder Hamid intro (and the controls card): Hamza is already tagging along
function* twIntroSkipped(){ const H=Game.hamza, P=Player; if(H){ H.mode='follow'; H.f=-1; H.x=P.x-1.2; H.z=P.z+.4; H.y=P.y; } Cam.focus=null; Game.hintT=0; yield wait(.2); yield fadeIn(); }

// ---------- card art: little painted scenes made from the game's own sprites ----------
const TL_ART={}; const ART_W=192, ART_H=108;
function artChar(c,fn,x,y,s,size){ size=size||128; const [cv,cc]=mkCanvas(size,size); try{ fn(cc,size/2,size-2); }catch(e){} outlinePass(cc,size,size,OUT); c.drawImage(cv,Math.round(x-size/2*s),Math.round(y-(size-2)*s),Math.round(size*s),Math.round(size*s)); }
function artBG(c,top,bot,ground){ const g=c.createLinearGradient(0,0,0,ART_H); g.addColorStop(0,top); g.addColorStop(1,bot); c.fillStyle=g; c.fillRect(0,0,ART_W,ART_H);
  for(let i=0;i<30;i++){ c.fillStyle=`rgba(255,255,255,${.2+hash(i,7)*.5})`; c.fillRect(hash(i,3)*ART_W|0,hash(3,i)*ART_H*.5|0,1,1); } c.fillStyle=ground; c.fillRect(0,ART_H-22,ART_W,22); }
const SH_=(c,x,y,s,f,anim)=>artChar(c,(cc,cx,by)=>drawShayanHD(cc,cx,by,f||1,{t:1,anim:anim||'idle',ap:1,combo:0}),x,y,s,64);
const AL_=(c,x,y,s,f,anim)=>artChar(c,(cc,cx,by)=>drawAliHD(cc,cx,by,f||1,{t:1,anim:anim||'idle'}),x,y,s,64);
const CA_=(c,x,y,s,f,o)=>artChar(c,(cc,cx,by)=>drawCaotanBoss(cc,cx,by,f||-1,Object.assign({t:1},o||{})),x,y,s);
const OM_=(c,x,y,s,f,o)=>artChar(c,(cc,cx,by)=>drawOmarBoss(cc,cx,by,f||-1,Object.assign({t:1},o||{})),x,y,s);
const GR_=(c,x,y,s,f,a)=>artChar(c,(cc,cx,by)=>drawGrimmawHD(cc,cx,by,f||-1,{t:1,anim:a||'howl'}),x,y,s);
const MI_=(c,x,y,s,f)=>artChar(c,(cc,cx,by)=>drawMiraHD(cc,cx,by,f||-1,{t:1,anim:'idle',blush:1}),x,y,s,64);
const HZ_=(c,x,y,s)=>artChar(c,(cc,cx,by)=>drawHamzaFairy(cc,cx,by,1,1,0),x,y,s,40);
const PIG_=(c,x,y,s,m)=>artChar(c,(cc,cx,by)=>drawGiantPig(cc,cx,by,1,{t:1,mouth:m||0,front:0}),x,y,s,160);
const NA_=(c,x,y,s,f)=>artChar(c,(cc,cx,by)=>drawNathanPilot(cc,cx,by,f||-1,{t:1}),x,y,s,64);
const PA_=(c,x,y,s,f)=>artChar(c,(cc,cx,by)=>drawVillagerHD(cc,cx,by,f||-1,{t:1},PAUL_LOOK),x,y,s,64);
function artText(c,txt,x,y,col){ c.font='bold 13px sans-serif'; c.lineWidth=3; c.strokeStyle='#14001a'; c.strokeText(txt,x,y); c.fillStyle=col||'#fff'; c.fillText(txt,x,y); }
function artHearts(c,n){ for(let i=0;i<n;i++){ const x=hash(i,11)*ART_W, y=hash(11,i)*ART_H*.7; c.fillStyle='#ff6ab0'; c.fillRect(x,y,3,2); c.fillRect(x+4,y,3,2); c.fillRect(x+1,y+2,5,2); c.fillRect(x+2,y+4,3,1); } }
function artBeam(c,x0,y0,x1,y1,col,w){ c.strokeStyle=col; c.lineWidth=w||4; c.beginPath(); c.moveTo(x0,y0); c.lineTo(x1,y1); c.stroke(); c.strokeStyle='#fff'; c.lineWidth=(w||4)/3; c.stroke(); }
// the little pictures on each panel
const KJ_=(c,x,y,s,f,a)=>artChar(c,(cc,cx,by)=>drawKojimaCast(cc,cx,by,f||-1,{t:1,anim:a||'idle'}),x,y,s);
const SN_=(c,x,y,s,f,arch,a)=>artChar(c,(cc,cx,by)=>drawSoldierCast(cc,cx,by,f||-1,{t:1,anim:a||'idle'},arch),x,y,s,48);
function artPillow(c,x,y,h,rot){ try{ const t=texPillow(), im=t.image; if(!im) return; c.save(); c.translate(x,y); c.rotate(rot||0); c.drawImage(im,-h*.18,-h/2,h*.36,h); c.restore(); }catch(e){} }
function artHole(c,x,y,r){ const g=c.createRadialGradient(x,y,r*.2,x,y,r*2.2); g.addColorStop(0,'rgba(160,80,255,.9)'); g.addColorStop(.45,'rgba(90,30,180,.45)'); g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=g; c.beginPath(); c.arc(x,y,r*2.2,0,7); c.fill();
  c.fillStyle='#000'; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.strokeStyle='#c08aff'; c.lineWidth=1.5; c.beginPath(); c.ellipse(x,y,r*1.8,r*.45,-.3,0,7); c.stroke(); }
function artMoon(c,x,y,r,cut){ c.fillStyle='#e8e4f6'; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.fillStyle='rgba(160,150,190,.6)'; c.beginPath(); c.arc(x-r*.3,y-r*.2,r*.25,0,7); c.fill(); c.beginPath(); c.arc(x+r*.35,y+r*.3,r*.18,0,7); c.fill();
  if(cut){ c.strokeStyle='#ff2a3a'; c.lineWidth=1.5; for(let i=0;i<5;i++){ const a=i*.7; c.beginPath(); c.moveTo(x-Math.cos(a)*r*1.4,y-Math.sin(a)*r*1.4); c.lineTo(x+Math.cos(a)*r*1.4,y+Math.sin(a)*r*1.4); c.stroke(); } } }
function artJC(c,n,col){ c.strokeStyle=col||'#ff2a3a'; for(let i=0;i<n;i++){ c.lineWidth=i%3?1:2; const a=hash(i,4)*Math.PI, x=hash(4,i)*ART_W, y=hash(i,8)*ART_H*.8; c.beginPath(); c.moveTo(x-Math.cos(a)*70,y-Math.sin(a)*70); c.lineTo(x+Math.cos(a)*70,y+Math.sin(a)*70); c.stroke(); } }
function artMech(c,x,y,w,h){ if(MECHTEX&&MECHTEX.image){ try{ c.drawImage(MECHTEX.image,x,y,w,h); }catch(e){} } }
function artBullets(c,n){ for(let i=0;i<n;i++){ const x=hash(i,13)*ART_W, y=hash(13,i)*ART_H*.85; c.fillStyle=i%3?'#ff6ab0':'#ffffff'; c.fillRect(x|0,y|0,3,3); c.fillStyle=i%2?'#3ff4ff':'#ff2a3a'; c.fillRect((x|0)+1,(y|0)+1,1,1); } }
function artLantern(c,n){ for(let i=0;i<n;i++){ const x=hash(i,21)*ART_W, y=10+hash(21,i)*ART_H*.45; c.fillStyle='rgba(255,180,90,.35)'; c.beginPath(); c.arc(x,y,4,0,7); c.fill(); c.fillStyle='#ffc070'; c.fillRect(x-1,y-2,3,4); } }
const ART={
  sh_root(c){ artBG(c,'#2a2d66','#c06a86','#3a4a2a'); artLantern(c,10); SH_(c,52,96,1.15,1); HZ_(c,80,58,1.2); MI_(c,124,96,1.05,-1); KJ_(c,172,62,.32,-1,'howl'); artHearts(c,3); artText(c,'MINE.',150,22,'#ffd45a'); },
  al_root(c){ artBG(c,'#05060f','#3a1020','#2a2a30'); artMoon(c,150,32,16,true); AL_(c,90,98,1.4,1); SH_(c,160,26,.35,-1,'hurt'); artText(c,'HE HIT ME TWICE.',4,18,'#ff9aa8'); },
  sh_twins(c){ artBG(c,'#010309','#0e1c44','#2a3550'); CA_(c,74,100,.55,1,{glintT:.5}); artPillow(c,54,74,30,.2); OM_(c,130,100,.55,-1,{scythe:1}); SH_(c,26,100,.85,1,'attack'); artText(c,"WE DON'T TALK",96,18,'#bfe4ff'); artText(c,'ABOUT IT.',116,32,'#bfe4ff'); },
  al_twins(c){ artBG(c,'#010309','#0e1c44','#2a3550'); CA_(c,96,100,.5,1,{down:1}); OM_(c,146,100,.5,-1,{down:1}); AL_(c,40,100,.9,1); artJC(c,4); artText(c,'BUTTER KNIVES.',70,20,'#ff9aa8'); },
  sh_dec(c){ artBG(c,'#100818','#2a1030','#2a2030'); CA_(c,62,100,.5,1,{down:1,heartEyes:1}); OM_(c,130,100,.5,-1,{down:1}); artText(c,'KILL HIM!',8,20,'#ff9ad8'); artText(c,'NO, HIM.',122,20,'#c08aff'); artText(c,'[LOCKED] THE NICE ONE',8,104,'#8a8496'); },
  sh_omar(c){ artBG(c,'#1a0a10','#5a1018','#2a1418'); KJ_(c,150,100,.62,-1,'slash'); SN_(c,112,100,1,-1); OM_(c,70,100,.5,1,{scythe:1}); SH_(c,34,100,.85,1,'attack'); artText(c,'VS. A BABY',8,18,'#ffd45a'); },
  sh_cao(c){ artBG(c,'#1a0a10','#5a1018','#2a1418'); KJ_(c,150,100,.62,-1,'howl'); CA_(c,74,100,.5,1,{glintT:.5}); SH_(c,34,100,.85,1,'attack'); artBeam(c,82,62,140,56,'#ffa0d8',3); artText(c,'SIGN HERE!',96,18,'#ffd45a'); },
  sh_both(c){ artBG(c,'#20103a','#6a3a6a','#2a2030'); KJ_(c,162,100,.55,-1,'winded'); CA_(c,62,100,.45,1,{heartEyes:1}); OM_(c,98,100,.45,1); SH_(c,26,100,.8,1,'attack'); artText(c,'SQUAD VS. INFANT',8,18,'#ffd45a'); },
  sh_omar_f(c){ artBG(c,'#03030c','#2a2050','#e8eef8'); for(let i=0;i<40;i++){ c.fillStyle='#f6f8ff'; c.fillRect(hash(i,31)*ART_W|0,hash(31,i)*ART_H|0,1,1); } c.fillStyle='#000'; c.beginPath(); c.arc(150,26,14,0,7); c.fill(); c.strokeStyle='#c08aff'; c.beginPath(); c.arc(150,26,16,0,7); c.stroke(); OM_(c,118,100,.6,-1,{form:3,scythe:1}); SH_(c,40,100,.9,1,'attack'); artText(c,'BANKAI.',6,18,'#c08aff'); artText(c,'(HE ATE THE MOON)',6,32,'#c08aff'); },
  sh_cao_f(c){ artBG(c,'#03030c','#5a2050','#141a36'); c.globalAlpha=.55; artPillow(c,150,52,90,0); c.globalAlpha=1; artHearts(c,14); CA_(c,118,100,.6,-1,{form:3,glintT:.6}); SH_(c,40,100,.9,1); artText(c,'DOMAIN EXPANSION',6,18,'#ffd0ec'); },
  sh_both_f(c){ artBG(c,'#03030c','#2a2050','#141a36'); PIG_(c,122,102,.6,1); SH_(c,30,100,.8,1); CA_(c,62,90,.35,1); OM_(c,82,90,.35,1); artText(c,'ITADAKIMASU',94,18,'#ffb0c8'); },
  sh_hamza(c){ const g=c.createRadialGradient(140,40,4,140,40,90); g.addColorStop(0,'#3a1020'); g.addColorStop(1,'#000'); c.fillStyle=g; c.fillRect(0,0,ART_W,ART_H); for(let i=0;i<50;i++){ c.fillStyle='#fff'; c.fillRect(hash(i,1)*ART_W|0,hash(1,i)*ART_H|0,1,1); }
    c.fillStyle='#f09ab6'; c.beginPath(); c.arc(146,40,28,0,7); c.fill(); c.fillStyle='#ff2a3a'; c.fillRect(132,32,7,5); c.fillRect(152,32,7,5); c.fillStyle='#3a0010'; c.fillRect(134,50,24,8); artBullets(c,40);
    artMech(c,30,52,40,48); c.strokeStyle='#ff2a2a'; c.lineWidth=1.5; for(const [x,y] of [[22,60],[78,60],[26,90],[74,90]]){ c.beginPath(); c.moveTo(x,y); c.lineTo(146,44); c.stroke(); } artText(c,'BULLET HELL',90,102,'#3ff4ff'); },
  sh_duo(c){ artBG(c,'#03030c','#3a2060','#141a36'); artHole(c,150,24,9); c.globalAlpha=.7; artPillow(c,172,56,80,.15); c.globalAlpha=1; CA_(c,110,100,.48,-1,{form:3}); OM_(c,146,100,.48,-1,{form:3}); SH_(c,34,100,.8,1,'attack'); AL_(c,64,100,.8,1); MI_(c,10,100,.6,1); artJC(c,3); artText(c,'THE OTHER WAY',8,18,'#ffd45a'); },
  al_dec(c){ artBG(c,'#100818','#2a1030','#2a2030'); CA_(c,62,100,.5,1,{down:1}); OM_(c,130,100,.5,-1,{down:1}); AL_(c,172,100,.7,-1); artText(c,'...HM.',80,20,'#ff9aa8'); artText(c,'[LOCKED] THE NICE ONE',8,104,'#8a8496'); },
  al_omar(c){ artBG(c,'#1a0a10','#5a1018','#2a1418'); KJ_(c,150,100,.6,-1,'winded'); OM_(c,96,100,.48,1); AL_(c,44,100,.9,1); artText(c,'10... 9... 8...',8,18,'#ff9aa8'); },
  al_cao(c){ artBG(c,'#1a0a10','#5a1018','#2a1418'); KJ_(c,152,100,.6,-1,'winded'); CA_(c,96,100,.48,1,{heartEyes:1}); AL_(c,44,100,.9,1); artHearts(c,6); artText(c,'ALI-KUN ♡',8,18,'#ffd0ec'); },
  al_both(c){ artBG(c,'#20103a','#6a3a6a','#2a2030'); KJ_(c,166,100,.52,-1,'howl'); CA_(c,90,100,.42,1,{heartEyes:1}); OM_(c,122,100,.42,1); AL_(c,40,100,.9,1); artText(c,'WEAKLINGS (2) + BABY',6,18,'#ffd45a'); },
  al_omar_f(c){ artBG(c,'#03030c','#2a2050','#e8eef8'); OM_(c,118,100,.6,-1,{form:3,scythe:1}); AL_(c,40,100,.9,1); artJC(c,5); artText(c,'HE READ THE WIKI',6,18,'#c08aff'); },
  al_cao_f(c){ artBG(c,'#03030c','#5a2050','#141a36'); c.globalAlpha=.5; artPillow(c,150,52,90,0); c.globalAlpha=1; artHearts(c,12); CA_(c,118,100,.6,-1,{form:2,heartEyes:1}); AL_(c,40,100,.9,1); artText(c,'"Hm."',20,22,'#ffffff'); },
  al_nathan(c){ artBG(c,'#03030c','#141030','#1a2040'); artMech(c,96,18,84,86); AL_(c,44,100,.9,1); artJC(c,3,'#3ff4ff'); artText(c,'ARC: MID',8,18,'#3ff4ff'); },
  al_nathan_both(c){ artBG(c,'#03030c','#141030','#1a2040'); artMech(c,110,22,74,80); AL_(c,30,100,.8,1); CA_(c,64,96,.36,1); OM_(c,88,96,.36,1); artText(c,'REPLY ALL',8,18,'#3ff4ff'); },
  sh_nathan(c){ artBG(c,'#03030c','#141030','#1a2040'); artMoon(c,30,28,10,false); artMech(c,96,18,84,86); SH_(c,44,100,.9,1); PA_(c,14,100,.6,1); artText(c,'WRONG TURN',56,18,'#3ff4ff'); },
  paul(c){ c.fillStyle='#000'; c.fillRect(0,0,ART_W,ART_H); c.font='10px monospace'; for(let i=0;i<60;i++){ c.fillStyle=`rgba(80,255,120,${hash(i,5)})`; c.fillText(hash(i,2)>.5?'1':'0',hash(i,9)*ART_W,hash(9,i)*ART_H); }
    PA_(c,96,100,1.4,-1); c.fillStyle='rgba(255,0,60,.35)'; c.fillRect(60,40,80,6); artText(c,'ERROR: TOO MANY BOSSES',20,20,'#ff4a6a'); }
};
function twArt(id){ if(TL_ART[id]) return TL_ART[id]; const [cv,c]=mkCanvas(ART_W,ART_H); c.imageSmoothingEnabled=false; try{ (ART[id]||ART.sh_root)(c); }catch(e){ console.error('art',id,e); } TL_ART[id]=cv; return cv; }
function twArtLocked(){ if(TL_ART.__lock) return TL_ART.__lock; const [cv,c]=mkCanvas(ART_W,ART_H); const g=c.createLinearGradient(0,0,0,ART_H); g.addColorStop(0,'#1a1620'); g.addColorStop(1,'#0a080e'); c.fillStyle=g; c.fillRect(0,0,ART_W,ART_H);
  c.font='bold 40px serif'; c.fillStyle='rgba(216,180,106,.35)'; c.textAlign='center'; c.fillText('???',ART_W/2,ART_H/2+14); TL_ART.__lock=cv; return cv; }

// ---------- leaving a cutscene midway (warp, title) never leaves its overlays behind ----------
// the "GG." glass card, cracks, shards, fist, white flashes, title cards, captions, the chant, letterbox, slow-mo, JC lines
function twClearCine(){ Object.assign(OV,{cr:null,sh:[],card:null,fist:null,white:0,wfade:0,meter:0,cap:null});
  Object.assign(Game,{evaCard:null,caption:null,chant:null,impSeq:null,split:null,moonCut:null,cineMark:null,card:null,banner:null,subtitle:null,eclipse:0,letterTo:0,letter:0,timeScale:1,slowT:0,mechTip:0});
  if(Game.zw) zwEnd(); JC.lines=[]; FX.flash=0; FX.hitstop=0; }
(function(){ const wr=twWarpReset; twWarpReset=function(){ twClearCine(); return wr.apply(this,arguments); };
  const tt=toTitle; toTitle=function(){ twClearCine(); return tt.apply(this,arguments); }; })();
