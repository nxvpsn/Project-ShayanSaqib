// =====================================================================
// MENUS: title screen (New Game / Continue; drawn in 99d_ui.js), Exit to Title on the Esc timeline,
// hold F to fast-forward dialogue, and the current controls on the pause screen.
// Secret keys (numpad 0-3) are deliberately left out of every on-screen list.
// =====================================================================
TL_TABS[2]='Miscellaneous';

// ---------- F fast-forwards dialogue (the fireball stays on right click and L) ----------
delete KEYMAP.KeyF; KEYMAP.KeyF='ff';
(function(){ const ud=updateDialog; updateDialog=function(dt){ const d=Game.dlg; if(d&&d.type==='say'&&held.ff){ d.shown=d.text.length; if(d.t>.1) hit.confirm=true; } return ud.apply(this,arguments); }; })();
function twDrawFF(){ if(!held.ff||!Game.dlg||Game.dlg.type!=='say') return; D.save(); D.font=`800 16px ${FB}`; D.textAlign='right'; D.fillStyle=Math.floor(performance.now()/200)%2?'#ffe6b0':'#d8b46a'; D.fillText('FAST-FORWARD  ▶▶',UW-30,UH-24); D.restore(); }

// ---------- title screen ----------
const TM={sel:0,busy:false,rows:[]};
const TM_OPTS=[{id:'new',t:'New Game'},{id:'cont',t:'Continue'}]; // drawn and handled in 99d_ui.js
function twHasProgress(){ return Object.keys(TWS.done||{}).length>0||!!TWS.paulDone; }
drawTitle=function(){ const t=performance.now()/1000; D.fillStyle='rgba(6,6,18,.3)'; D.fillRect(0,0,UW,UH); D.shadowColor='rgba(0,0,0,.8)'; D.shadowBlur=18;
  cText([['A Shayan Saqib Tale',`italic 500 26px ${FB}`,'#e9d6b0',190],["The Moonsinger's Bell",`900 72px ${FD}`,'#f6dfa6',270]]); D.shadowBlur=0; D.fillStyle='#d8b46a'; D.fillRect(UW/2-200,300,400,1.5);
  TM.rows=[]; TM_OPTS.forEach((o,i)=>{ const w=340, h=58, x=UW/2-w/2, y=332+i*72, on=TM.sel===i; TM.rows.push({x,y,w,h});
    D.fillStyle=on?'rgba(70,48,24,.92)':'rgba(20,14,10,.7)'; D.fillRect(x,y,w,h); D.strokeStyle=on?'#e8c070':'#8a6a3a'; D.lineWidth=on?3:2; D.strokeRect(x+2,y+2,w-4,h-4);
    D.textAlign='center'; D.font=`800 26px ${FD}`; D.fillStyle=on?'#fff4d6':'#d8c8a8'; D.fillText((on?'▸  ':'')+o.t+(on?'  ◂':''),UW/2,y+30);
    D.font=`500 14px ${FB}`; D.fillStyle=on?'#e9d6b0':'#a8906a'; D.fillText(o.sub,UW/2,y+49); D.textAlign='left'; });
  D.globalAlpha=.55+.3*Math.sin(t*3); cText([[IS_TOUCH()?'Tap an option':'W / S or mouse to choose  ·  E, Enter or click to start',`600 17px ${FB}`,'#fff4d6',500]]); D.globalAlpha=1;
  };
function twTitleHit(e){ const r=ui.getBoundingClientRect(), x=(e.clientX-r.left)/r.width*UW, y=(e.clientY-r.top)/r.height*UH; return TM.rows.findIndex(q=>x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h); }
ui.addEventListener('pointermove',e=>{ if(Game.state!=='title'||TM.busy) return; const i=twTitleHit(e); if(i>=0) TM.sel=i; });
ui.addEventListener('pointerdown',e=>{ if(Game.state!=='title'||TM.busy) return; const i=twTitleHit(e); e.preventDefault(); e.stopImmediatePropagation(); Sound.unlock(); if(i>=0&&(Game.titleT||0)>=.5){ TM.sel=i; twTitlePick(); } },true);
function twTitleMenu(dt){ if(TM.busy||(Game.titleT||0)<.5){ clearHits(); return; }
  if(consume('up')||consume('left')){ TM.sel=(TM.sel+TM_OPTS.length-1)%TM_OPTS.length; Sound.sfx('blip'); }
  if(consume('down')||consume('right')){ TM.sel=(TM.sel+1)%TM_OPTS.length; Sound.sfx('blip'); }
  if(consume('confirm')||consume('attack')||consume('jump')) twTitlePick(); }
function twStartGame(){ if(IS_TOUCH()&&!inFull()) toggleFull(); Sound.unlock(); Voice.prewarm(); Sound.sfx('select'); Game.state='cut'; newGame(); }
function twTitlePick(){ const o=TM_OPTS[TM.sel]; if(o.id==='new') twTitleNewAsk(); else twTitleContinue(); }
// New Game: everything starts over (checkpoints and every cheat toggle)
function twFreshStart(){ for(const k of Object.keys(TWS)) delete TWS[k]; TWS.done={}; TWS.unl={}; twSave(); savePersist(); TW.god=false; TW.otk=false; TW.infFC=false; TW.unlockMode=false; twStartGame(); }
// ---------- Esc timeline: Exit to Title Screen, top left ----------
(function(){ const dt=twDrawTimeline; twDrawTimeline=function(){ dt(); if(!TLM.open) return; D.save(); tlBtn(24,22,236,36,'Exit to Title Screen',false,'title'); D.restore(); };
  const ta=tlActivate; tlActivate=function(id){ if(id!=='title') return ta(id); Sound.sfx('select'); TLM.open=false; TLM.esc=null; Object.assign(Game,{script:null,wait:null,dlg:null,timeScale:1,slowT:0,banner:null,card:null,evaCard:null});
    Voice.stop(); if(typeof twLeavePaulFight==='function') twLeavePaulFight(); twEndFight(); twClearAllies(); Cam.cine=null; Game.letterTo=0; toTitle(); releaseTouchKeys(); for(const k in held) held[k]=false; clearHits(); }; })();

// ---------- pause screen: the current controls ----------
drawPause=function(){ D.fillStyle='rgba(6,6,18,.7)'; D.fillRect(0,0,UW,UH); frame(UW/2-360,60,720,560,.92); cText([['Paused',`900 44px ${FD}`,'#f3dfae',122]]);
  const T=IS_TOUCH(), rows=ALI()?[['Move','WASD or arrow keys'],['Jump',K('jump')+' (twice as high; hold to ride a Getsuga)'],['Attack',K('attack')+': 3-cut combo, slash · double cut · spin (aim with the mouse)'],['Getsuga Tenshou',K('block')+' (hold, release: Black Getsuga)'],['Parry','Attack right before a hit lands (5 parries = Judgement Cut)'],['Teleport',K('dash')],['Special',K('special')+' when the blue gauge is full'],['Talk / advance',K('confirm')],['Fast-forward','Hold '+K('ff')+' during dialogue'],['Timeline / warps',K('menu')+' (rebind keys under Controls)'],['Pause · Voices · Mute',K('pause')+' · '+K('voices')+' · '+K('mute')+' (toggle)']]
    :[['Move','WASD or arrow keys'],['Jump',K('jump')+' (again in the air to double jump)'],['Glide','Hold jump after the double jump'],['Attack',K('attack')+': three-hit combo (aim with the mouse)'],['Getsuga Tenshou','Hold attack, then release'],['Fireball',K('block')+' (hold until full: big fireball + flaming sword)'],['Parry','Attack right before a hit lands (5 parries = Full Counter)'],['Dash',K('dash')],['Special',K('special')+' when the blue gauge is full'],['Talk / advance',K('confirm')],['Fast-forward','Hold '+K('ff')+' during dialogue'],['Timeline / warps',K('menu')+' (rebind keys under Controls)'],['Pause · Voices · Mute',K('pause')+' · '+K('voices')+' · '+K('mute')+' (toggle)']];
  rows.forEach(([a,b],i)=>{ D.font=`700 19px ${FB}`; D.fillStyle='#d8b46a'; D.textAlign='right'; D.fillText(a,UW/2-110,170+i*31); D.textAlign='left'; D.font=`500 18px ${FB}`; D.fillStyle='#efe8d6'; D.fillText(b,UW/2-90,170+i*31); });
  cText([[T?'Tap to resume':K('pause')+' to resume',`italic 500 20px ${FB}`,'#b8a888',598]]); };
(function(){ const du=drawUI; drawUI=function(){ du(); try{ twDrawFF(); }catch(e){} }; })();
