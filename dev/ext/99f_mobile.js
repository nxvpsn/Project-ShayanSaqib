// =====================================================================
// MOBILE (touch devices, IS_TOUCH()): the menus in a phone layout, drawn on a smaller virtual canvas
// and scaled up so text and tap targets stay readable.
// - The touch "ESC" button becomes Menu (it used to offer a full restart) and opens the Esc menu.
// - Esc menu: tabs + Resume along the top; the timeline full width with the selected checkpoint below;
//   Options with Unstuck / Exit to Title / Cheats / Debug Mode; Controls shows the touch controls.
// - Cheats: a pop-up with every toggle the numpad keys give on a keyboard.
// - Debug Mode: a Debug button opens the debug panel as a paused, paged pop-up (Setup / Boss / Moves),
//   because the joystick area would swallow taps on a side panel.
// - Pause screen lists the touch controls. (Title and pop-up scaling live in 99d_ui.js.)
// =====================================================================
const MOB={k:1.6,cheats:false,dbgBtn:null};
function mobRects(list,k){ for(const r of list){ r.x*=k; r.y*=k; r.w*=k; r.h*=k; } }
function mobTouchRows(){ const ali=ALI();
  return [['◎','Left thumb','Drag anywhere on the left half to move'],['⚔','Sword',ali?'Tap: Getsuga Tenshou · hold, release: Black Getsuga':'Tap: 3-hit combo · hold, release: Getsuga'],
    ['↑','Jump',ali?'Jumps high · hold to float down':'Again in the air: double jump · hold: glide'],['⛨',ali?'Guard':'Fireball',ali?'Hold to guard and parry':'Tap: fireball · hold until full: huge fireball + flaming sword'],
    ['»',ali?'Teleport':'Dash','Dodge through attacks'],['✦','Special','When the blue gauge is full'],['!','Parry','Attack right before a hit lands (5 = '+(ali?'Judgement Cut':'Full Counter')+')'],
    ['…','Talk / Next','Talk to people, advance dialogue'],['☰','Menu','Top right: timeline, options, cheats']]; }
function mobCardPos(n,W){ const span=(W-16-28-92)/6; return {x:22+n.col*span,y:68+n.row*74,w:92,h:62}; }

// ---------- the Esc menu, phone layout ----------
function mobTop(W){ const tabs=TLM.esc?[[0,'Shayan'],[1,'Ali'],[2,'Misc'],[3,'Controls'],[4,'Options']]:[[0,'Shayan'],[1,'Ali'],[2,'Misc']], cur=hubIdx(); let x=10; const y=8;
  for(const [i,l] of tabs){ D.font=`800 15px ${FB}`; const w=D.measureText(l).width+28, on=i===cur, id='htab:'+i; uRR(x,y,w,40,9); D.fillStyle=on?UIC.accD:'rgba(255,255,255,.05)'; D.fill(); if(on){ D.strokeStyle=UIC.acc; D.lineWidth=1.5; D.stroke(); }
    uText(l,x+w/2,y+26,`800 15px ${FB}`,on?UIC.accL:UIC.text,'center'); TLM.rects.push({x,y,w,h:40,id}); x+=w+6; }
  uBtn(W-10-116,y,116,40,TLM.esc?'Resume':'Close',{kind:'primary',id:'close',icon:TLM.esc?'play':'close'}); }
function mobRoad(W,H){ const t=TLM.t, M={x:8,y:56,w:W-16,h:244}, P=n=>mobCardPos(n,W); uPanel(M.x,M.y,M.w,M.h,UIC.well,UIC.line,12);
  const nodes=TL.filter(m=>m.tab===TLM.tab);
  for(const m of nodes) for(const pid of (m.par||[])){ const p=TL_BY[pid]; if(!p||p.tab!==TLM.tab) continue; const A=P(p), B=P(m), x0=A.x+A.w+2, y0=A.y+A.h/2, x1=B.x-2, y1=B.y+B.h/2, both=twNodeOpen(p)&&twNodeOpen(m), half=twNodeOpen(p);
    D.save(); D.lineWidth=both?2.5:1.5; D.strokeStyle=both?UIC.acc:half?'rgba(122,184,255,.7)':'rgba(255,255,255,.14)'; if(!half) D.setLineDash([4,5]); D.beginPath(); D.moveTo(x0,y0); D.bezierCurveTo(x0+24,y0,x1-24,y1,x1,y1); D.stroke(); D.restore(); }
  for(const m of nodes){ const R2=P(m), op=twNodeOpen(m), sel=m.id===TLM.sel;
    if(sel){ D.save(); D.shadowColor='rgba(227,182,90,.7)'; D.shadowBlur=12+3*Math.sin(t*5); uRR(R2.x-3,R2.y-3,R2.w+6,R2.h+6,8); D.fillStyle=UIC.acc; D.fill(); D.restore(); }
    D.save(); uRR(R2.x,R2.y,R2.w,R2.h,6); D.clip(); D.fillStyle='#0b0d16'; D.fillRect(R2.x,R2.y,R2.w,R2.h); D.imageSmoothingEnabled=false; D.drawImage(op?twArt(m.id):twArtLocked(),R2.x,R2.y,R2.w,R2.h-18);
    if(!op){ D.fillStyle='rgba(8,9,16,.45)'; D.fillRect(R2.x,R2.y,R2.w,R2.h-18); } D.fillStyle='rgba(18,21,34,.96)'; D.fillRect(R2.x,R2.y+R2.h-18,R2.w,18); D.restore();
    uRR(R2.x,R2.y,R2.w,R2.h,6); D.strokeStyle=sel?'#fff':op?'rgba(227,182,90,.45)':UIC.line2; D.lineWidth=sel?2:1; D.stroke();
    D.font=`700 10px ${FB}`; const ls=wrap(op?m.name:'???',R2.w-8); uText(ls[0]+(ls.length>1?'…':''),R2.x+R2.w/2,R2.y+R2.h-5,`700 10px ${FB}`,op?UIC.text:UIC.dim,'center');
    if(op&&!m.root&&(m.final?TWS.paulDone:TWS.done[m.id])){ D.fillStyle=UIC.good; D.beginPath(); D.arc(R2.x+R2.w-8,R2.y+8,7,0,7); D.fill(); D.strokeStyle='#0b2416'; D.lineWidth=2; D.beginPath(); D.moveTo(R2.x+R2.w-11.5,R2.y+8); D.lineTo(R2.x+R2.w-9,R2.y+10.5); D.lineTo(R2.x+R2.w-4.5,R2.y+5.5); D.stroke(); }
    TLM.rects.push({x:R2.x-4,y:R2.y-4,w:R2.w+8,h:R2.h+8,id:'node:'+m.id});
    if(TW.unlockMode&&hubCheatable(m)) uCheck(R2.x+R2.w/2-30,R2.y+R2.h+3,op,'Unlock','chk:'+m.id); }
  // the selected checkpoint
  const n=TL_BY[TLM.sel]||TL[0], open=twNodeOpen(n), Dt={x:8,y:306,w:W-16,h:H-314}; uPanel(Dt.x,Dt.y,Dt.w,Dt.h,UIC.panel,UIC.line,12);
  const aw=Math.round((Dt.h-20)*16/9); D.save(); uRR(Dt.x+10,Dt.y+10,aw,Dt.h-20,7); D.clip(); D.imageSmoothingEnabled=false; D.drawImage(open?twArt(n.id):twArtLocked(),Dt.x+10,Dt.y+10,aw,Dt.h-20); D.restore();
  const tx=Dt.x+aw+24, tw=Dt.w-aw-24-176, st=n.root?['START',UIC.blue]:n.final?(TWS.paulDone?['DEFEATED',UIC.good]:open?['READY',UIC.acc]:['LOCKED',UIC.dim]):TWS.done[n.id]?['CLEARED',UIC.good]:open?['UNLOCKED',UIC.acc]:['LOCKED',UIC.dim];
  uCaps(st[0],tx,Dt.y+24,st[1],10); uWrap(open?n.name:'???',tx,Dt.y+48,tw,20,`800 17px ${FD}`,UIC.accL,1);
  uWrap(open?n.desc:(n.final?'Clear every checkpoint, then talk to Paul.':'Reach this point in the story to unlock it.'),tx,Dt.y+68,tw,15,`500 12px ${FB}`,UIC.text,3);
  const bx=Dt.x+Dt.w-166; if(open) uBtn(bx,Dt.y+Dt.h-54,156,44,n.root?'Start here':n.final?'Face Paul':'Warp here',{kind:'primary',id:'warp'}); else uText('Locked',bx+78,Dt.y+Dt.h-28,`italic 700 14px ${FB}`,UIC.dim,'center');
  if(TW.unlockMode){ const ch=TL.filter(hubCheatable), all=ch.length>0&&ch.every(twNodeOpen); uCheck(bx+8,Dt.y+14,all,'Unlock all','chk:all'); }
  else uText('Tap a card, then Warp',bx+78,Dt.y+26,`600 11px ${FB}`,UIC.dim,'center'); }
function mobOptions(W,H){ const C={x:8,y:56,w:W-16,h:H-64}; uPanel(C.x,C.y,C.w,C.h,UIC.well,UIC.line,12);
  const rows=[['vol','Volume','Music, voices and effects'],['voices','Voice acting','Spoken dialogue'],['mute','Mute','Silence everything'],['full','Fullscreen','Fill the whole screen'],['input','Input device','Touch, or a connected controller']];
  let y=C.y+8; for(const [k,l,sub] of rows){ uRR(C.x+8,y,C.w-16,44,9); D.fillStyle='rgba(255,255,255,.03)'; D.fill(); uText(l,C.x+22,y+20,`800 15px ${FB}`,UIC.text); uText(sub,C.x+22,y+36,`500 11px ${FB}`,UIC.mut); const cx=C.x+C.w-20, cy=y+22;
    if(k==='vol'){ const B=TLV.box; B.x=cx-310; B.y=cy-15; B.w=250; B.h=30; const v=twVolNow(); uRR(B.x,cy-3,B.w,6,3); D.fillStyle='rgba(255,255,255,.1)'; D.fill(); if(v>0){ uRR(B.x,cy-3,B.w*v,6,3); D.fillStyle=UIC.acc; D.fill(); }
      D.fillStyle=TLV.drag?'#fff':UIC.accL; D.beginPath(); D.arc(B.x+B.w*v,cy,11,0,7); D.fill(); uText(v<=0?'Muted':Math.round(v*100)+'%',cx,cy+5,`700 14px ${FB}`,UIC.text,'right'); }
    else if(k==='voices') uToggle(cx-46,cy-12,!!Voice.on,'opt:voices'); else if(k==='mute') uToggle(cx-46,cy-12,!!Sound.muted,'opt:mute'); else if(k==='full') uToggle(cx-46,cy-12,!!inFull(),'opt:full');
    else if(k==='input') uSeg(cx-260,cy-16,260,32,[['opt:input:kbm','Touch'],['opt:input:pad','Controller']],'opt:input:'+PAD.mode,false);
    y+=48; }
  y+=8; const acts=[['Unstuck','unstuck','redo','ghost'],['Exit to Title','title','exit','danger'],['Cheats','mob:cheats',null,'ghost'],['Debug Mode','mob:debug',null,DBG.on?'primary':'ghost']], bw=(C.w-16-18)/4;
  acts.forEach(([l,id,ic,kind],i)=>uBtn(C.x+8+i*(bw+6),y,bw,46,l,{id,icon:ic,kind})); }
function mobControls(W,H){ const C={x:8,y:56,w:W-16,h:H-64}; uPanel(C.x,C.y,C.w,C.h,UIC.well,UIC.line,12); const lx=C.x+16, lw=C.w/2-24; let y=C.y+24; uCaps('TOUCH CONTROLS',lx,y,UIC.mut); y+=10;
  for(const [ic,nm,ds] of mobTouchRows()){ D.beginPath(); D.arc(lx+13,y+15,13,0,7); D.fillStyle='rgba(255,255,255,.08)'; D.fill(); D.strokeStyle=UIC.line2; D.lineWidth=1; D.stroke();
    uText(ic,lx+13,y+20,`800 13px ${FB}`,UIC.accL,'center'); uText(nm,lx+34,y+13,`800 13px ${FB}`,UIC.text); uWrap(ds,lx+34,y+27,lw-34,12,`500 10.5px ${FB}`,UIC.mut,1); y+=34; }
  const rx=C.x+C.w/2+8, rw=C.w/2-24, bot=C.y+C.h-10; let ry=C.y+24; uCaps('HOW TO PLAY',rx,ry,UIC.mut); ry+=20; D.fillStyle=UIC.line; D.fillRect(C.x+C.w/2-4,C.y+16,1,C.h-32);
  const mech=twControlsRows().mech.concat([['Hamza bullet hell','Shoot fires by itself · hold Shoot for a Power Shot · hold Focus to slow down and show your hitbox · blue button: Heavenly Drill']]);
  for(const [a,b] of mech){ if(ry>bot-14) break; uText(a,rx,ry,`800 12px ${FB}`,UIC.accL); ry+=14; const n=uWrap(b,rx,ry,rw,13,`500 10.5px ${FB}`,'#c9ccd8',Math.max(1,Math.floor((bot-ry)/13))); ry+=n*13+7; } }
function mobCheats(W,H){ TLM.rects.push({x:0,y:0,w:W,h:H,id:'mob:block'}); D.fillStyle='rgba(3,4,10,.72)'; D.fillRect(0,0,W,H);
  const w=460, h=320, x=(W-w)/2, y=(H-h)/2; uPanel(x,y,w,h,UIC.panel2,UIC.line2,14); uText('Cheats',x+24,y+40,`800 22px ${FD}`,UIC.accL);
  const rows=[['god','Infinite HP','Hits still land; your HP refills',!!TW.god],['fc',ALI()?'Infinite Judgement Cut':'Infinite Full Counter','Every attack is the counter',!!TW.infFC],['otk','One-hit kill','Empties a health bar; skips limit cuts',!!TW.otk],['unl','Timeline unlock','Unlock checkboxes under every ??? card',!!TW.unlockMode]];
  let yy=y+58; for(const [k,l,s,on] of rows){ uText(l,x+24,yy+18,`800 15px ${FB}`,UIC.text); uText(s,x+24,yy+34,`500 11px ${FB}`,UIC.mut); uToggle(x+w-24-46,yy+8,on,'mob:ch:'+k); yy+=46; }
  uBtn(x+24,y+h-60,220,44,'Unlock every checkpoint',{id:'mob:unlockall'}); uBtn(x+w-24-120,y+h-60,120,44,'Done',{kind:'primary',id:'mob:chclose'}); }
function mobHub(){ if(!TLM.open) return; TLM.t+=1/60; TLM.rects=[]; const k=MOB.k, W=UW/k, H=UH/k;
  if(CT.open&&CT.fromMenu){ CT.open=false; CT.fromMenu=false; CT.listen=null; } // the touch Controls tab is drawn here
  if(HUB.sec!=='road'&&!TLM.esc) HUB.sec='road';
  D.save(); D.globalAlpha=Math.min(1,TLM.t*6); D.fillStyle='rgba(4,5,11,.95)'; D.fillRect(0,0,UW,UH); TLV.box.x=-9999; D.scale(k,k);
  mobTop(W); if(HUB.sec==='road') mobRoad(W,H); else if(HUB.sec==='options') mobOptions(W,H); else mobControls(W,H); if(MOB.cheats) mobCheats(W,H);
  D.restore(); mobRects(TLM.rects,k); if(TLV.box.x>-9000){ const B=TLV.box; B.x*=k; B.y*=k; B.w*=k; B.h*=k; } }
(function(){ const dt=twDrawTimeline; twDrawTimeline=function(){ if(!IS_TOUCH()) return dt(); try{ mobHub(); }catch(e){ console.error('mobile hub',e); } };
  const tc=twTimelineClose; twTimelineClose=function(){ MOB.cheats=false; return tc.apply(this,arguments); };
  const ta=tlActivate; tlActivate=function(id){ if(id&&id.startsWith('mob:')){ const k=id.slice(4);
      if(k==='block') return; if(k==='cheats'){ MOB.cheats=true; Sound.sfx('blip'); return; } if(k==='chclose'){ MOB.cheats=false; Sound.sfx('blip'); return; }
      if(k==='debug'){ MOB.cheats=false; const on=dbgToggle(); twCheatToast('DEBUG MODE: '+(on?'ON':'OFF'),on); return; }
      if(k==='unlockall'){ twUnlockAll(true); twCheatToast('ALL CHECKPOINTS UNLOCKED',true); return; }
      if(k.startsWith('ch:')){ const c=k.slice(3); let on=false; if(c==='god') on=TW.god=!TW.god; else if(c==='fc'){ on=TW.infFC=!TW.infFC; if(!on) Player.counter=0; } else if(c==='otk') on=TW.otk=!TW.otk; else if(c==='unl') on=TW.unlockMode=!TW.unlockMode;
        twCheatToast(({god:'INFINITE HP',fc:ALI()?'INFINITE JUDGEMENT CUT':'INFINITE FULL COUNTER',otk:'ONE-HIT KILL',unl:'TIMELINE UNLOCK'})[c]+': '+(on?'ON':'OFF'),on); return; } return; }
    if(MOB.cheats&&IS_TOUCH()) return; return ta(id); }; })();

// ---------- pause screen on touch ----------
function twDrawPauseTouch(){ const k=1.5, W=UW/k, H=UH/k, x=30, y=24, w=W-60, h=H-48; D.save(); D.scale(k,k); uPanel(x,y,w,h,UIC.panel,UIC.line2,14);
  uText('Paused',x+24,y+40,`900 26px ${FD}`,UIC.accL); uText('Tap to resume',x+w-24,y+38,`700 14px ${FB}`,UIC.mut,'right');
  mobTouchRows().forEach(([ic,nm,ds],i)=>{ const col=i<5?0:1, r=i%5, cx=x+20+col*(w/2-10), cy=y+62+r*62, cw=w/2-30; uRR(cx,cy,cw,54,9); D.fillStyle='rgba(255,255,255,.04)'; D.fill();
    D.beginPath(); D.arc(cx+24,cy+27,15,0,7); D.fillStyle='rgba(255,255,255,.08)'; D.fill(); uText(ic,cx+24,cy+32,`800 14px ${FB}`,UIC.accL,'center'); uText(nm,cx+48,cy+22,`800 14px ${FB}`,UIC.text); uWrap(ds,cx+48,cy+39,cw-56,12,`500 11px ${FB}`,UIC.mut,1); });
  D.restore(); }

// ---------- the touch Menu button (was ESC: "restart game") opens the Esc menu ----------
(function(){ try{ const old=document.getElementById('tbPause'); if(!old||!old.replaceWith||!old.cloneNode) return; const b=old.cloneNode(false); b.id='tbPause'; b.className='tb'; b.setAttribute('aria-label','Menu');
  b.innerHTML='<svg viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h14"/></svg>'; old.replaceWith(b);
  b.addEventListener('pointerdown',e=>e.stopPropagation()); b.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
  b.addEventListener('click',e=>{ e.stopPropagation(); Sound.unlock(); if(Game.state==='title') return; if(DBG.topen){ dbgTouch(false); return; } if(TLM.open){ twTimelineClose(null); return; } if(twEscOk()) twEscOpen(); }); }catch(e){} })();

// ---------- Debug Mode on touch: a Debug button opens the panel as a paused pop-up ----------
function dbgTouch(open){ if(open===!!DBG.topen) return; releaseTouchKeys(); clearHits();
  if(open){ DBG.tprev=Game.state==='paused'?(Game.prev||'play'):Game.state; Game.prev=DBG.tprev; Game.state='paused'; DBG.topen=true; DBG.page=DBG.page||0; }
  else { DBG.topen=false; if(Game.state==='paused') Game.state=DBG.tprev||'play'; } }
function mobDebug(){ const k=1.6, W=UW/k, H=UH/k; D.save(); D.fillStyle='rgba(3,4,10,.6)'; D.fillRect(0,0,UW,UH); D.scale(k,k);
  const w=600, h=H-16, x=(W-w)/2, y=8, ix=x+20, iw=w-40; uPanel(x,y,w,h,'rgba(10,12,22,.97)',UIC.line2,12);
  let yy=dbgHead(ix,y+28,iw,'tclose'); ['Setup','Boss','Moves'].forEach((l,i)=>dbgBtn(ix+i*(iw/3),yy,iw/3-6,30,l,'tpage:'+i,{on:(DBG.page||0)===i})); yy+=42;
  const pg=DBG.page||0; if(pg===0) dbgSecSetup(ix,yy,iw); else if(pg===1) dbgSecBoss(ix,yy,iw); else dbgSecMoves(ix,yy,iw,3);
  uText(DBG.msg&&DBG.msg.t&&performance.now()-DBG.msg.at<4000?DBG.msg.t:'',ix,y+h-12,`700 12px ${FB}`,'#9ff8ff');
  D.restore(); mobRects(DBG.rects,k); }
(function(){ const dd=dbgDraw; dbgDraw=function(){ if(!IS_TOUCH()) return dd(); DBG.rects=[]; if(!DBG.on){ DBG.topen=false; return; } if(!DBG.topen||Game.state==='title'||TLM.open) return; mobDebug(); };
  const da=dbgAct; dbgAct=function(id){ if(!IS_TOUCH()) return da(id);
    if(id==='tclose'||id==='hide'){ dbgTouch(false); Sound.sfx('blip'); return; } if(id.startsWith('tpage:')){ DBG.page=+id.slice(6); Sound.sfx('blip'); return; }
    const closeAfter=/^(boss|move|lc|kill|despawn|off)/.test(id); const r=da(id); if(closeAfter&&DBG.topen) dbgTouch(false); return r; };
  const dp=drawPause; drawPause=function(){ if(DBG.topen&&IS_TOUCH()) return; return dp.apply(this,arguments); }; })();
(function(){ try{ const T=document.getElementById('touch'); if(!T||!T.appendChild) return; const b=document.createElement('button'); b.className='tb'; b.id='tbDebug'; b.textContent='Debug'; b.hidden=true; T.appendChild(b);
  const st=document.createElement('style'); st.textContent='#tbDebug{top:calc(22% + env(safe-area-inset-top,0px));left:calc(10px + env(safe-area-inset-left,0px));width:auto;height:40px;border-radius:20px;padding:0 16px;font:800 14px var(--body);border-color:#ff8aa8;color:#ffd0dc}'
    +'body.hubopen #tbPause,body.hubopen #tbFull{display:none!important}'; document.head.appendChild(st);
  b.addEventListener('pointerdown',e=>e.stopPropagation()); b.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
  b.addEventListener('click',e=>{ e.stopPropagation(); Sound.unlock(); dbgTouch(!DBG.topen); Sound.sfx('blip'); }); MOB.dbgBtn=b; }catch(e){} })();
// every frame: the Debug button shows only in debug mode; the corner buttons hide while the Esc menu (with its own Resume) is open
(function(){ const du=drawUI; drawUI=function(){ du(); try{ if(MOB.dbgBtn) MOB.dbgBtn.hidden=!(DBG.on&&IS_TOUCH()&&Game.state!=='title'&&!TLM.open);
    const on=!!TLM.open; if(MOB.hub!==on){ MOB.hub=on; document.body.classList.toggle('hubopen',on); } }catch(e){} }; })();
