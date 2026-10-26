// =====================================================================
// ESC MENU EXTRAS + CONTROLS CARD
// The volume and Unstuck buttons move off the top right of the screen into the Esc timeline's left panel
// (Controls + Unstuck, then a big volume slider, above "Checkpoints cleared"). Controls opens a keys + mechanics
// card (centered from the menu, far right in town after Hamza drops in; the X closes it). Every key on it except
// movement can be rebound by clicking it and pressing a key or mouse button.
// Secret keys (numpad 1, 2, 3) stay out of it.
// =====================================================================
try{ const st=document.createElement('style'); st.textContent='#volBtn,#volPop,#unstuck{display:none!important}'; document.head.appendChild(st); }catch(e){}

// ---------- key bindings: one key (or mouse button) per action, rebindable from the card. WASD / arrows stay fixed ----------
const BIND_DEF={jump:'Space',attack:'Mouse0',block:'Mouse2',dash:'ShiftLeft',special:'KeyQ',confirm:'KeyE',ff:'KeyF',pause:'KeyP',voices:'KeyV',mute:'KeyM',menu:'Escape'};
const BIND=Object.assign({},BIND_DEF);
try{ const sv=SAVE.settings.binds; if(sv&&typeof sv==='object') for(const k in BIND_DEF) if(typeof sv[k]==='string') BIND[k]=sv[k]; }catch(e){}
const BIND_FIXED=/^(Key[WASD]|Arrow(Up|Down|Left|Right)|Numpad[0-5])$/;
const BIND_TWIN={ShiftLeft:'ShiftRight',ControlLeft:'ControlRight',AltLeft:'AltRight',MetaLeft:'MetaRight'};
function twBindNorm(c){ for(const k in BIND_TWIN) if(BIND_TWIN[k]===c) return k; return c; }
function twBound(act,code){ return BIND[act]===twBindNorm(code); }
function twRebinding(){ return CT.listen!=null; }
function twKeyName(c){ if(!c) return '?'; const M={Mouse0:'Left click',Mouse1:'Middle click',Mouse2:'Right click',Mouse3:'Mouse 4',Mouse4:'Mouse 5',Space:'Space',Escape:'Esc',ShiftLeft:'Shift',ControlLeft:'Ctrl',AltLeft:'Alt',MetaLeft:'Meta',Enter:'Enter',Backspace:'Backspace',Tab:'Tab',CapsLock:'Caps Lock',Backquote:'`',Minus:'-',Equal:'=',BracketLeft:'[',BracketRight:']',Backslash:'\\',Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/'};
  if(M[c]) return M[c]; let m=c.match(/^Key(.)$/); if(m) return m[1]; m=c.match(/^Digit(.)$/); if(m) return m[1]; m=c.match(/^Numpad(.+)$/); if(m) return 'Num '+m[1]; return c; }
function K(act){ return twKeyName(BIND[act]); }
// rebuild KEYMAP from the table (movement and Enter = talk stay as they are)
function twApplyBinds(){ for(const c of Object.keys(KEYMAP)) if(!/^(Key[WASD]|Arrow(Up|Down|Left|Right))$/.test(c)) delete KEYMAP[c];
  KEYMAP.Enter='confirm'; if(!KEYMAP[BIND.menu]) KEYMAP[BIND.menu]='pause'; // the menu key still pauses wherever the timeline can't open (as Esc always did)
  for(const a of ['jump','attack','block','dash','special','confirm','ff','pause','mute']){ const c=BIND[a]; if(!c||c.startsWith('Mouse')) continue; KEYMAP[c]=a; if(BIND_TWIN[c]) KEYMAP[BIND_TWIN[c]]=a; } }
function twMouse(btn,down){ const c='Mouse'+btn; let a=null; for(const k of ['jump','attack','block','dash','special','confirm','ff','pause','mute']) if(BIND[k]===c){ a=k; break; }
  if(!a) return; if(down) press(a); else release(a); }
twApplyBinds();
function twSetBind(act,code){ code=twBindNorm(code); if(BIND_FIXED.test(code)||(code.startsWith('Mouse')&&(act==='menu'||act==='voices'))){ Sound.sfx('block'); return false; }
  const old=BIND[act]; for(const k in BIND) if(k!==act&&BIND[k]===code) BIND[k]=old; // whoever had that key takes this one's old key
  BIND[act]=code; for(const k in held) held[k]=false; clearHits(); twApplyBinds(); SAVE.settings.binds=Object.assign({},BIND); saveWrite(); Sound.sfx('select'); return true; }
// while waiting for a key, nothing else sees it
addEventListener('keydown',e=>{ if(!twRebinding()) return; e.preventDefault(); e.stopImmediatePropagation(); if(e.repeat) return; if(twSetBind(CT.listen,e.code)) CT.listen=null; },true);
addEventListener('keyup',e=>{ if(twRebinding()){ e.preventDefault(); e.stopImmediatePropagation(); } },true);

// ---------- the controls card ----------
const CT={open:false,fromMenu:false,rects:[],listen:null,focus:null,drop:null,dropSel:0,drects:[],hoverId:null};
function twControlsShow(fromMenu){ CT.open=true; CT.fromMenu=!!fromMenu; CT.listen=null; CT.drop=null; CT.focus='mode:'+PAD.mode; }
function twControlsHide(){ CT.open=false; CT.fromMenu=false; CT.listen=null; CT.drop=null; }
function twControlsRows(){ const ali=ALI();
  const keys=[['Move',null,'WASD or arrow keys (aim with the mouse)'],['Jump','jump',''],['Attack','attack',''],[ali?'Guard':'Fireball','block',''],[ali?'Teleport':'Dash','dash',''],['Special','special',''],['Talk / advance','confirm',''],['Fast-forward','ff',' (hold in dialogue)'],['Pause','pause',' (toggle)'],['Voices','voices',' (toggle)'],['Mute','mute',' (toggle)'],['Menu / timeline','menu','']];
  const mech=ali?[['High Jump','Ali jumps twice as high. Hold '+K('jump')+' to float down'],['Getsuga Tenshou',K('attack')+' fires a Getsuga where you aim'],['Black Getsuga','Hold '+K('attack')+' to charge. Release when it turns red to fire it, or wait until it is full and release for a stronger one'],['Guard','Hold '+K('block')+' to block and parry everything in front of you'],['Parry','Attack right before a melee hit lands'],['Judgement Cut','Land 5 parries, then attack to unleash it'],['Teleport',K('dash')+' blinks you through attacks'],['Special',K('special')+' when the blue gauge is full'],['Auto-mantle','In town, run into a roof, tree, stall, fence or fountain to climb it']]
    :[['Double Jump','Press '+K('jump')+' twice'],['Glide','Hold '+K('jump')+' after the double jump'],['Combo','Press '+K('attack')+' three times for a 3-hit combo'],['Getsuga Tenshou','Hold '+K('attack')+' to charge. Release when it turns red to fire it, or wait until it is full and release for a stronger one'],['Charged Fireball','Hold '+K('block')+' until it is fully charged, then release: a huge fireball, and your sword catches fire. Basic attacks do double damage while it burns'],['Parry','Attack right before a melee hit lands'],['Ranged Parry','Attack an incoming projectile to send it back'],['Full Counter','Land 5 parries, then attack to unleash it'],['Dash',K('dash')+' dashes through attacks (you can\'t be hit mid-dash)'],['Special',K('special')+' when the blue gauge is full'],['Auto-mantle','In town, run into a roof, tree, stall, fence or fountain to climb it']];
  return {keys,mech}; }
// the frame, the title and the close X (shared with the controller view in 99b_gamepad.js)
function twCtShell(x,y,w,h){ D.fillStyle='rgba(12,10,20,.95)'; D.fillRect(x,y,w,h); D.strokeStyle='#c9a24a'; D.lineWidth=2; D.strokeRect(x+4,y+4,w-8,h-8);
  D.textAlign='left'; D.font=`700 22px ${FD}`; D.fillStyle='#f3dfae'; D.fillText('Controls',x+18,y+34);
  const cx=x+w-44, cy=y+12; D.fillStyle='rgba(60,30,30,.9)'; D.fillRect(cx,cy,30,30); D.strokeStyle=twCtFocused('x')?'#ffffff':'#e8c070'; D.lineWidth=2; D.strokeRect(cx+1,cy+1,28,28);
  D.strokeStyle='#ffe6b0'; D.lineWidth=3; D.beginPath(); D.moveTo(cx+9,cy+9); D.lineTo(cx+21,cy+21); D.moveTo(cx+21,cy+9); D.lineTo(cx+9,cy+21); D.stroke(); CT.rects.push({x:cx-4,y:cy-4,w:38,h:38,id:'x'}); }
function twDrawControls(){ if(!CT.open) return; if(Game.state==='title'||Game.state==='end'){ twControlsHide(); return; }
  if(PAD.mode==='pad') return twDrawPadControls();
  const {keys,mech}=twControlsRows(), w=440, pad=18, tw=w-pad*2; CT.rects=[];
  D.save(); D.font=`500 13px ${FB}`; const mLines=mech.map(([a,b])=>wrap(a+': '+b,tw)); const h0=96+17+16+keys.length*18+6+17+mLines.reduce((s,l)=>s+l.length*15+3,0)-2;
  // from the Esc menu it sits in the middle of the screen; in town it hugs the right edge
  const h=Math.min(UH-24,h0), x=CT.fromMenu?Math.round((UW-w)/2):UW-w-16, y=CT.fromMenu?Math.max(12,Math.round((UH-h)/2)):Math.min(64,UH-h-12);
  twCtShell(x,y,w,h); twCtModeRow(x+pad,y+50,tw);
  let yy=y+96; D.font=`700 11px ${FB}`; D.fillStyle='#a8906a'; D.fillText('KEYS',x+pad,yy); D.font=`italic 500 12px ${FB}`; D.fillText(CT.listen?'Press a key or mouse button  ·  click the row again to cancel':'Click a key to rebind it',x+pad+48,yy); yy+=17+4;
  const t=performance.now()/1000;
  for(const [a,act,suf] of keys){ const ry=yy-13, on=act&&CT.listen===act;
    if(act){ const hov=CT.hover===act; if(on||hov){ D.fillStyle=on?`rgba(232,192,112,${.25+.12*Math.sin(t*8)})`:'rgba(232,192,112,.1)'; D.fillRect(x+pad-6,ry,w-pad*2+12,18); } CT.rects.push({x:x+pad-6,y:ry,w:w-pad*2+12,h:18,id:'bind:'+act}); }
    D.font=`700 13px ${FB}`; D.fillStyle='#d8b46a'; D.fillText(a,x+pad,yy);
    if(!act){ D.font=`500 13px ${FB}`; D.fillStyle='#9a9080'; D.fillText(suf,x+pad+150,yy); }
    else if(on){ D.font=`700 13px ${FB}`; D.fillStyle='#ffffff'; D.fillText('Press a key...',x+pad+150,yy); }
    else { const kn=K(act); D.font=`700 13px ${FB}`; D.fillStyle='#ffe6b0'; D.fillText('['+kn+']',x+pad+150,yy); const kw=D.measureText('['+kn+']').width; D.font=`500 13px ${FB}`; D.fillStyle='#efe8d6'; D.fillText(suf,x+pad+150+kw,yy); }
    yy+=18; }
  yy+=6; D.font=`700 11px ${FB}`; D.fillStyle='#a8906a'; D.fillText('MECHANICS',x+pad,yy); yy+=17;
  mech.forEach(([a],i)=>{ D.font=`500 13px ${FB}`; mLines[i].forEach((ln,j)=>{ if(yy>y+h-4) return;
      if(j===0){ const lab=a+':'; D.font=`700 13px ${FB}`; D.fillStyle='#d8b46a'; D.fillText(lab,x+pad,yy); const lw=D.measureText(lab+' ').width; D.font=`500 13px ${FB}`; D.fillStyle='#efe8d6'; D.fillText(ln.slice(lab.length+1),x+pad+lw,yy); }
      else { D.fillStyle='#efe8d6'; D.fillText(ln,x+pad,yy); } yy+=15; }); yy+=3; });
  D.restore(); CT.box={x,y,w,h}; }
(function(){ const du=drawUI; drawUI=function(){ du(); try{ twDrawControls(); }catch(e){ console.error('controls',e); } }; })();
// clicks: the X closes it, anything else on the card is swallowed so it never becomes an attack or a timeline pick
addEventListener('pointerdown',e=>{ if(!CT.open||!CT.box) return; const [x,y]=tlPt(e), B=CT.box, r=CT.rects.find(q=>x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h);
  if(CT.listen){ e.preventDefault(); e.stopImmediatePropagation(); if(r&&r.id==='bind:'+CT.listen){ CT.listen=null; Sound.sfx('blip'); return; }
    if(e.pointerType==='mouse'&&twSetBind(CT.listen,'Mouse'+e.button)) CT.listen=null; return; }
  // the controller drop-down: pick an option, or click anywhere else to close it
  if(CT.drop!=null){ e.preventDefault(); e.stopImmediatePropagation(); const d=CT.drects.find(q=>x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h); if(d) twCardActivate(d.id); else { CT.drop=null; Sound.sfx('blip'); } return; }
  if(x<B.x||x>B.x+B.w||y<B.y||y>B.y+B.h) return;
  e.preventDefault(); e.stopImmediatePropagation(); if(!r) return; CT.focus=r.id; twCardActivate(r.id); },true);
addEventListener('pointermove',e=>{ if(!CT.open||!CT.box) return; const [x,y]=tlPt(e), r=CT.rects.find(q=>x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h); CT.hover=r&&r.id.startsWith('bind:')?r.id.slice(5):null; CT.hoverId=r?r.id:null;
  if(CT.drop!=null){ const d=CT.drects.findIndex(q=>x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h); if(d>=0) CT.dropSel=d; } },true);
// it pops up in town once Hamza has dropped in (the old corner hint box would only repeat it)
(function(){ const intro=SCR.intro; const f=function*(){ yield* intro.apply(this,arguments); Game.hintT=0; twControlsShow(false); }; SCR.intro=f; SCR_BASE.intro=f;
  const ng=newGame; newGame=function(){ twControlsHide(); return ng.apply(this,arguments); };
  const tt=toTitle; toTitle=function(){ twControlsHide(); return tt.apply(this,arguments); }; })();

// ---------- Esc timeline: Controls button, volume slider, one-click Unstuck ----------
const TLV={drag:false,lines:0,box:{x:44,y:486,w:246,h:30}};
function twVolNow(){ return Sound.muted?0:Sound.vol; }
function twVolSet(px){ const B=TLV.box, v=clamp((px-B.x)/B.w,0,1); Sound.unlock(); Sound.setVol(Math.round(v*100)/100); try{ if(window.syncVolUI) syncVolUI(); }catch(e){} }
(function(){ const dt=twDrawTimeline; twDrawTimeline=function(){ dt(); if(!TLM.open) return; D.save();
    // below the checkpoint text: room for the longest description there is (Paul's), so nothing ever overlaps it
    D.font=`500 15px ${FB}`; const n=TLV.lines||(TLV.lines=Math.max(4,wrap(TL_BY.paul.desc,250).length)), top=Math.min(486,366+(n-1)*21+12);
    tlBtn(44,top,TLM.esc?121:246,28,'Controls',CT.open,'controls');
    // Unstuck only makes sense from the Esc menu (not when Paul is showing you his timeline mid-conversation)
    if(TLM.esc) tlBtn(169,top,121,28,'Unstuck',false,'unstuck');
    // volume: a wide slider
    TLV.box.y=top+36; const B=TLV.box, v=twVolNow(), ty=B.y+22; D.font=`700 13px ${FB}`; D.fillStyle='#a8906a'; D.textAlign='left'; D.fillText('VOLUME',B.x,B.y+8); D.textAlign='right'; D.fillStyle='#ffe6b0'; D.fillText(v<=0?'Muted':Math.round(v*100)+'%',B.x+B.w,B.y+8); D.textAlign='left';
    D.fillStyle='rgba(10,8,12,.9)'; D.fillRect(B.x,ty-5,B.w,10); D.fillStyle='#c9a24a'; D.fillRect(B.x,ty-5,B.w*v,10); D.strokeStyle='#8a6a3a'; D.lineWidth=1.5; D.strokeRect(B.x,ty-5,B.w,10);
    D.fillStyle=TLV.drag?'#fff4d6':'#e8c070'; D.beginPath(); D.arc(B.x+B.w*v,ty,9,0,7); D.fill(); D.strokeStyle='#3a2410'; D.lineWidth=2; D.stroke();
    D.restore(); };
  const ta=tlActivate; tlActivate=function(id){
    if(id==='controls'){ if(CT.open) twControlsHide(); else twControlsShow(true); Sound.sfx('blip'); return; }
    if(id==='unstuck'){ if(!TLM.esc) return; Sound.sfx('select'); twTimelineClose(null); unstuck(); try{ ui.focus(); }catch(e){} return; }
    return ta(id); };
  // a card opened from the menu goes away with the menu
  const tc=twTimelineClose; twTimelineClose=function(){ if(CT.fromMenu) twControlsHide(); return tc.apply(this,arguments); };
  const ttl=tlActivate; tlActivate=function(id){ if(id==='title') twControlsHide(); return ttl(id); }; })();
// the slider is dragged, so it listens on the window ahead of the timeline's own click handler
addEventListener('pointerdown',e=>{ if(!TLM.open) return; const [x,y]=tlPt(e), B=TLV.box; if(x<B.x-10||x>B.x+B.w+10||y<B.y-8||y>B.y+B.h) return;
  e.preventDefault(); e.stopImmediatePropagation(); TLV.drag=true; twVolSet(x); },true);
addEventListener('pointermove',e=>{ if(!TLV.drag) return; if(!TLM.open){ TLV.drag=false; return; } twVolSet(tlPt(e)[0]); },true);
addEventListener('pointerup',()=>{ if(TLV.drag){ TLV.drag=false; Sound.sfx('blip'); } },true);
