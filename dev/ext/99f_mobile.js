// =====================================================================
// MOBILE (touch devices, IS_TOUCH()): a phone-first UI, drawn on small virtual canvases and scaled up so the
// smallest text is ~16 CSS px and every tap target is at least ~44 CSS px.
// - Esc menu: a side rail (Resume, Timeline, Controls, Options); the timeline is a row of big checkpoint cards you
//   swipe through, with the selected one and a Warp button below; Options are big rows and toggles; Controls scroll.
//   Taps act on release (drag to scroll without tapping); the menu fades out on Resume, and the phone's follow-up
//   "click" is swallowed so it can't land on the Menu button and reopen the menu (that was the flash on Resume).
// - Pause card with Resume / Menu buttons (taps elsewhere do nothing). The game pauses itself and its audio goes
//   silent when the page is hidden (another app, tab, or the screen locks), on phones and desktop alike.
// - Dialogue: bigger text, tall reply rows you tap once to answer, and hold anywhere to fast-forward (like holding F).
// - Title: big New Game / Continue buttons. No full-screen button: the game goes full screen when you start, leaves
//   it when you turn the phone upright, and goes back in on your next tap after you turn it sideways again.
// - Cheats pop-up; Debug Mode as a paused, paged pop-up (the joystick area would swallow taps on a side panel).
// =====================================================================
const MOB={k:2,cheats:false,dbgBtn:null,sx:[0,0,0],sy:[0,0],ct:0,drag:null,fade:0,ghost:0,prects:[],full:false,lastSel:null,strip:null,list:null,bgPaused:false};
function mobRects(list,k){ for(const r of list){ r.x*=k; r.y*=k; r.w*=k; r.h*=k; } }
function mobTouchRows(){ const ali=ALI();
  return [['◎','Left thumb','Drag anywhere on the left half to move'],['⚔','Sword',ali?'Tap: 3-cut combo (slash, double cut, spin)':'Tap: 3-hit combo · hold, release: Getsuga'],
    ['↑','Jump',ali?'Jumps high · hold: ride a Getsuga':'Again in the air: double jump · hold: glide'],['☾',ali?'Getsuga':'Fireball',ali?'Tap: Getsuga Tenshou · hold, release: Black Getsuga':'Tap: fireball · hold until full: huge fireball + flaming sword'],
    ...(ali?[['⚔☾','Rhythm','Sword, Getsuga, Sword, Getsuga: each Getsuga after a cut hits harder']]:[]),
    ['»',ali?'Teleport':'Dash','Dodge through attacks'],['✦','Special','When the blue gauge is full'],['!','Parry','Attack right before a hit lands (5 = '+(ali?'Judgement Cut':'Full Counter')+'). A silver slash can always be parried'],
    ['…','Talk / Next','Talk to people, advance dialogue'],['☰','Menu','Top right: timeline, controls, options, cheats']]; }
const mobIn=(r,x,y)=>!!r&&x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;
// phone-sized widgets (virtual px; rects go to TLM.rects and are scaled to UI px after drawing)
function mobToggle(x,y,on,id){ const w=56,h=30; uRR(x,y,w,h,15); D.fillStyle=on?UIC.acc:'rgba(255,255,255,.14)'; D.fill();
  D.fillStyle=on?'#1a1408':'#e2e5ee'; D.beginPath(); D.arc(on?x+w-15:x+15,y+15,11,0,7); D.fill(); TLM.rects.push({x:x-10,y:y-10,w:w+20,h:h+20,id}); }
function mobSeg(x,y,w,h,items,cur){ const n=items.length, bw=w/n; uRR(x,y,w,h,10); D.fillStyle='rgba(255,255,255,.05)'; D.fill(); D.strokeStyle=UIC.line2; D.lineWidth=1; D.stroke();
  items.forEach(([id,l],i)=>{ const on=id===cur, bx=x+i*bw; if(on){ uRR(bx+3,y+3,bw-6,h-6,8); D.fillStyle=UIC.acc; D.fill(); }
    uText(l,bx+bw/2,y+h/2+6,`800 16px ${FB}`,on?'#1a1408':UIC.text,'center'); TLM.rects.push({x:bx,y,w:bw,h,id}); }); }
function mobFit(t,w){ while(D.measureText(t).width>w&&t.length>2) t=t.slice(0,-2)+'…'; return t; }

// ---------- the Esc menu ----------
function mobRail(H){ const x=8, w=128; uBtn(x,8,w,52,TLM.esc?'Resume':'Close',{kind:'primary',id:'mob:resume',icon:TLM.esc?'play':'close',size:17});
  if(!TLM.esc) return;
  [['road','Timeline','htab:'+TLM.tab],['controls','Controls','htab:3'],['options','Options','htab:4']].forEach(([s2,l,id],i)=>{ const y=72+i*58, on=HUB.sec===s2;
    uRR(x,y,w,50,10); D.fillStyle=on?UIC.accD:'rgba(255,255,255,.04)'; D.fill(); D.strokeStyle=on?UIC.acc:UIC.line; D.lineWidth=on?1.5:1; D.stroke();
    if(on){ D.fillStyle=UIC.acc; D.fillRect(x,y+10,4,30); } uText(l,x+18,y+31,`800 16px ${FB}`,on?UIC.accL:UIC.text); TLM.rects.push({x,y,w,h:50,id}); }); }
const MOBC={w:136,h:108,gap:10};
function mobNodes(){ return TL.filter(m=>m.tab===TLM.tab).sort((a,b)=>a.col-b.col||a.row-b.row); }
function mobLock(x,y,c){ D.save(); D.strokeStyle=c; D.fillStyle=c; D.lineWidth=2.5; D.beginPath(); D.arc(x,y-5,6,Math.PI,0); D.stroke(); uRR(x-9,y-4,18,14,3); D.fill(); D.restore(); }
function mobRoad(x0,cw,H){ mobSeg(x0,8,cw,42,[['htab:0','Shayan'],['htab:1','Ali'],['htab:2','Misc']],'htab:'+TLM.tab);
  const ns=mobNodes(), sy=60, sh=MOBC.h, step=MOBC.w+MOBC.gap, tot=ns.length*step-MOBC.gap, max=Math.max(0,tot-cw), tb=TLM.tab;
  if(MOB.lastSel!==TLM.sel+'/'+tb){ MOB.lastSel=TLM.sel+'/'+tb; const i=ns.findIndex(m=>m.id===TLM.sel); if(i>=0){ const cx=i*step; if(cx<MOB.sx[tb]) MOB.sx[tb]=cx-MOBC.gap; if(cx+MOBC.w>MOB.sx[tb]+cw) MOB.sx[tb]=cx+MOBC.w-cw+MOBC.gap; } }
  const so=MOB.sx[tb]=clamp(MOB.sx[tb],0,max); MOB.strip={x:x0,y:sy,w:cw,h:sh};
  D.save(); D.beginPath(); D.rect(x0,sy-4,cw,sh+8); D.clip();
  ns.forEach((m,i)=>{ const x=x0+i*step-so; if(x>x0+cw||x+MOBC.w<x0) return; const op=twNodeOpen(m), sel=m.id===TLM.sel, ah=sh-32;
    D.save(); uRR(x,sy,MOBC.w,sh,9); D.clip(); D.fillStyle='#0b0d16'; D.fillRect(x,sy,MOBC.w,sh); D.imageSmoothingEnabled=false; D.drawImage(op?twArt(m.id):twArtLocked(),x,sy,MOBC.w,ah);
    if(!op){ D.fillStyle='rgba(8,9,16,.55)'; D.fillRect(x,sy,MOBC.w,ah); mobLock(x+MOBC.w/2,sy+ah/2,'rgba(235,233,242,.75)'); } D.fillStyle=sel?'rgba(60,48,24,.97)':'rgba(18,21,34,.97)'; D.fillRect(x,sy+ah,MOBC.w,32); D.restore();
    uRR(x,sy,MOBC.w,sh,9); D.strokeStyle=sel?UIC.acc:op?'rgba(227,182,90,.35)':UIC.line2; D.lineWidth=sel?3:1; D.stroke();
    D.font=`800 13px ${FB}`; uText(mobFit(op?m.name:'Locked',MOBC.w-14),x+MOBC.w/2,sy+sh-11,`800 13px ${FB}`,op?(sel?UIC.accL:UIC.text):UIC.dim,'center');
    if(op&&!m.root&&(m.final?TWS.paulDone:TWS.done[m.id])){ D.fillStyle=UIC.good; D.beginPath(); D.arc(x+MOBC.w-13,sy+13,9,0,7); D.fill(); D.strokeStyle='#0b2416'; D.lineWidth=2.5; D.beginPath(); D.moveTo(x+MOBC.w-17.5,sy+13); D.lineTo(x+MOBC.w-14,sy+16.5); D.lineTo(x+MOBC.w-8.5,sy+9.5); D.stroke(); }
    const rx=Math.max(x,x0); TLM.rects.push({x:rx,y:sy,w:Math.min(x+MOBC.w,x0+cw)-rx,h:sh,id:'mob:card:'+m.id}); });
  D.restore();
  // more to swipe: soft edges with arrow tabs (tappable too)
  for(const [on,dir] of [[so>2,-1],[so<max-2,1]]) if(on){ const ex=dir<0?x0:x0+cw-34, g=D.createLinearGradient(ex,0,ex+34,0); g.addColorStop(dir<0?0:1,'rgba(5,6,12,.95)'); g.addColorStop(dir<0?1:0,'rgba(5,6,12,0)');
    D.fillStyle=g; D.fillRect(ex,sy,34,sh); D.strokeStyle=UIC.accL; D.lineWidth=3; D.lineCap='round'; D.beginPath(); const ax=ex+17, ay=sy+sh/2-8; D.moveTo(ax-4*dir,ay-9); D.lineTo(ax+4*dir,ay); D.lineTo(ax-4*dir,ay+9); D.stroke();
    TLM.rects.push({x:ex,y:sy,w:34,h:sh,id:'mob:scroll:'+dir}); }
  // the selected checkpoint
  const n=TL_BY[TLM.sel]||ns[0]; if(!n) return; const open=twNodeOpen(n), py=sy+sh+10, ph=H-py-8; uPanel(x0,py,cw,ph,UIC.panel,UIC.line,12);
  const st=n.root?['START',UIC.blue]:n.final?(TWS.paulDone?['DEFEATED',UIC.good]:open?['READY',UIC.acc]:['LOCKED',UIC.dim]):TWS.done[n.id]?['CLEARED',UIC.good]:open?['UNLOCKED',UIC.acc]:['LOCKED',UIC.dim];
  const bw=150, bx=x0+cw-16-bw, tw=bx-x0-32; uCaps(st[0],x0+16,py+24,st[1],12); uWrap(open?n.name:'???',x0+16,py+50,tw,22,`800 20px ${FD}`,UIC.accL,1);
  const unl=TW.unlockMode&&hubCheatable(n); uWrap(open?n.desc:(n.final?'Clear every checkpoint, then talk to Paul.':'Reach this point in the story to unlock it.'),x0+16,py+74,tw,18,`500 14px ${FB}`,UIC.text,unl?2:3);
  if(unl){ mobToggle(x0+16,py+ph-44,open,'chk:'+n.id); uText('Unlocked',x0+82,py+ph-23,`700 14px ${FB}`,UIC.text); }
  if(TW.unlockMode){ const ch=TL.filter(hubCheatable), all=ch.length>0&&ch.every(twNodeOpen); uBtn(bx,py+14,bw,38,all?'Lock all':'Unlock all',{id:'chk:all',size:14,on:all}); }
  if(open) uBtn(bx,py+ph-16-54,bw,54,n.root?'Start here':n.final?'Face Paul':'Warp here',{kind:'primary',id:'warp',size:17});
  else { mobLock(bx+bw/2,py+ph-56,UIC.dim); uText('Locked',bx+bw/2,py+ph-26,`700 15px ${FB}`,UIC.dim,'center'); } }
function mobOptions(x0,cw,H){ let y=8;
  // sound: the four sliders in one card (2 x 2); 50 is the normal mix
  uRR(x0,y,cw,112,10); D.fillStyle='rgba(255,255,255,.04)'; D.fill(); const cwc=(cw-30)/2;
  MIX_KEYS.forEach(([k,l],i)=>{ const cx0=x0+10+(i%2)*(cwc+10), cy0=y+6+Math.floor(i/2)*52, v=Sound.muted&&k==='all'?0:MIX[k];
    uText(l,cx0+6,cy0+18,`800 15px ${FB}`,UIC.text); uText(v<=0?'Off':String(v),cx0+cwc-6,cy0+18,`800 15px ${FB}`,v===50?UIC.text:UIC.accL,'right');
    mixSlider(k,cx0+12,cy0+36,cwc-24,{th:4,r:11,hh:18}); });
  y+=118;
  const rows=[['voices','Voice acting','Spoken dialogue'],['mute','Mute','Silence everything'],['input','Play with','Touch, or a connected controller']];
  for(const [k,l,sub] of rows){ uRR(x0,y,cw,48,10); D.fillStyle='rgba(255,255,255,.04)'; D.fill(); uText(l,x0+16,y+21,`800 16px ${FB}`,UIC.text); uText(sub,x0+16,y+39,`500 12px ${FB}`,UIC.mut); const cx=x0+cw-16, cy=y+24;
    if(k==='voices') mobToggle(cx-56,cy-15,!!Voice.on,'opt:voices'); else if(k==='mute') mobToggle(cx-56,cy-15,!!Sound.muted,'opt:mute');
    else { const sw=200, sx=cx-sw; uRR(sx,cy-18,sw,36,10); D.fillStyle='rgba(255,255,255,.05)'; D.fill(); D.strokeStyle=UIC.line2; D.lineWidth=1; D.stroke();
      [['opt:input:kbm','Touch'],['opt:input:pad','Controller']].forEach(([id,lb],i)=>{ const on=id==='opt:input:'+PAD.mode, bx2=sx+i*sw/2; if(on){ uRR(bx2+3,cy-15,sw/2-6,30,8); D.fillStyle=UIC.acc; D.fill(); }
        uText(lb,bx2+sw/4,cy+5,`800 14px ${FB}`,on?'#1a1408':UIC.text,'center'); TLM.rects.push({x:bx2,y:cy-22,w:sw/2,h:44,id}); }); }
    y+=52; }
  // Cheats and Debug as a pair on the left, the destructive Exit to Title set apart on the right
  const acts=[['Cheats','mob:cheats',null,'ghost'],['Debug','mob:debug',null,DBG.on?'primary':'ghost'],['Exit to Title','title','exit','danger']], bw=(cw-24)/3;
  acts.forEach(([l,id,ic,kind],i)=>uBtn(x0+i*(bw+6)+(i===2?12:0),y,bw,46,l,{id,kind,size:14})); }
function mobControls(x0,cw,H){ mobSeg(x0,8,cw,42,[['mob:ct:0','Touch controls'],['mob:ct:1','How to play']],'mob:ct:'+MOB.ct);
  const top=60, vh=H-top-8, c=MOB.ct; MOB.list={x:x0,y:top,w:cw,h:vh}; uPanel(x0,top,cw,vh,UIC.well,UIC.line,12);
  D.save(); D.beginPath(); D.rect(x0,top+1,cw,vh-2); D.clip(); const y0=top+12; let y=y0-MOB.sy[c];
  if(c===0) for(const [ic,nm,ds] of mobTouchRows()){ D.beginPath(); D.arc(x0+32,y+20,17,0,7); D.fillStyle='rgba(255,255,255,.08)'; D.fill(); D.strokeStyle=UIC.line2; D.lineWidth=1; D.stroke();
      uText(ic,x0+32,y+26,`800 16px ${FB}`,UIC.accL,'center'); uText(nm,x0+62,y+17,`800 15px ${FB}`,UIC.text); const n=uWrap(ds,x0+62,y+37,cw-78,17,`500 13px ${FB}`,UIC.mut,3); y+=Math.max(48,26+n*17)+8; }
  else { const mech=twControlsRows().mech.concat([['Hamza bullet hell','Shooting and the Power Shot are automatic: just move · hold Focus to slow down and show your hitbox · blue button: Heavenly Drill']]);
    for(const [a2,b2] of mech){ uText(a2,x0+16,y+16,`800 15px ${FB}`,UIC.accL); const n=uWrap(b2,x0+16,y+36,cw-32,17,`500 13px ${FB}`,'#cfd2de'); y+=26+n*17+12; } }
  D.restore(); const max=Math.max(0,y+MOB.sy[c]-y0-vh+20); MOB.sy[c]=clamp(MOB.sy[c],0,max);
  if(max>0){ const bh=Math.max(30,vh*vh/(vh+max)), by=top+4+(vh-8-bh)*(MOB.sy[c]/max); uRR(x0+cw-7,by,4,bh,2); D.fillStyle='rgba(255,255,255,.3)'; D.fill(); } }
function mobCheats(W,H){ TLM.rects.push({x:0,y:0,w:W,h:H,id:'mob:block'}); D.fillStyle='rgba(3,4,10,.75)'; D.fillRect(0,0,W,H);
  const w=440, h=318, x=(W-w)/2, y=(H-h)/2; uPanel(x,y,w,h,UIC.panel2,UIC.line2,14); uText('Cheats',x+22,y+38,`800 22px ${FD}`,UIC.accL);
  const rows=[['god','Infinite HP','Hits still land; your HP refills',!!TW.god],['fc',ALI()?'Infinite Judgement Cut':'Infinite Full Counter','Every attack is the counter',!!TW.infFC],['otk','One-hit kill','Empties a health bar; skips limit cuts',!!TW.otk],['unl','Timeline unlock','Unlock switches on locked checkpoints',!!TW.unlockMode]];
  let yy=y+52; for(const [k,l,s2,on] of rows){ uText(l,x+22,yy+20,`800 16px ${FB}`,UIC.text); uText(s2,x+22,yy+38,`500 12px ${FB}`,UIC.mut); mobToggle(x+w-22-56,yy+8,on,'mob:ch:'+k); yy+=50; }
  uBtn(x+22,y+h-62,236,46,'Unlock every checkpoint',{id:'mob:unlockall',size:15}); uBtn(x+w-22-130,y+h-62,130,46,'Done',{kind:'primary',id:'mob:chclose',size:16}); }
function mobHub(alpha){ const k=MOB.k, W=UW/k, H=UH/k; TLM.rects=[];
  if(CT.open&&CT.fromMenu){ CT.open=false; CT.fromMenu=false; CT.listen=null; } // the touch Controls page is drawn here
  if(HUB.sec!=='road'&&!TLM.esc) HUB.sec='road';
  D.save(); D.globalAlpha=alpha; D.fillStyle='rgba(5,6,12,.97)'; D.fillRect(0,0,UW,UH); TLV.box.x=-9999; TLV.mix={}; D.scale(k,k);
  mobRail(H); const x0=144, cw=W-x0-8; if(HUB.sec==='road') mobRoad(x0,cw,H); else if(HUB.sec==='options') mobOptions(x0,cw,H); else mobControls(x0,cw,H); if(MOB.cheats) mobCheats(W,H);
  D.restore(); mobRects(TLM.rects,k); if(TLV.box.x>-9000){ const B=TLV.box; B.x*=k; B.y*=k; B.w*=k; B.h*=k; } for(const q in TLV.mix){ const B=TLV.mix[q]; B.x*=k; B.y*=k; B.w*=k; B.h*=k; } }
function mobTap(id){ if(!id) return; const tb=TLM.tab;
  if(id==='mob:resume'){ twTimelineClose(null); mobFullAgain(); return; }
  if(id.startsWith('mob:card:')){ const nid=id.slice(9); if(TLM.sel!==nid){ TLM.sel=nid; Sound.sfx('blip'); } return; }
  if(id.startsWith('mob:scroll:')){ MOB.sx[tb]+=(+id.slice(11))*(MOBC.w+MOBC.gap)*2; Sound.sfx('blip'); return; }
  if(id.startsWith('mob:ct:')){ MOB.ct=+id.slice(7); Sound.sfx('blip'); return; }
  tlActivate(id); }
(function(){ const dt=twDrawTimeline; twDrawTimeline=function(){ if(!IS_TOUCH()) return dt(); if(!TLM.open) return; TLM.t+=1/60; try{ mobHub(Math.min(1,TLM.t*8)); }catch(e){ console.error('mobile hub',e); } };
  const tc=twTimelineClose; twTimelineClose=function(){ const was=TLM.open; MOB.cheats=false; MOB.drag=null; const r=tc.apply(this,arguments); if(was&&!TLM.open&&IS_TOUCH()){ MOB.fade=1; MOB.ghost=performance.now()+600; } return r; };
  const ta=tlActivate; tlActivate=function(id){ if(id&&id.startsWith('mob:')){ const k=id.slice(4);
      if(k==='block') return; if(k==='cheats'){ MOB.cheats=true; Sound.sfx('blip'); return; } if(k==='chclose'){ MOB.cheats=false; Sound.sfx('blip'); return; }
      if(k==='debug'){ MOB.cheats=false; const on=dbgToggle(); twCheatToast('DEBUG MODE: '+(on?'ON':'OFF'),on); return; }
      if(k==='unlockall'){ twUnlockAll(true); twCheatToast('ALL CHECKPOINTS UNLOCKED',true); return; }
      if(k.startsWith('ch:')){ const c=k.slice(3); let on=false; if(c==='god') on=TW.god=!TW.god; else if(c==='fc'){ on=TW.infFC=!TW.infFC; if(!on) Player.counter=0; } else if(c==='otk') on=TW.otk=!TW.otk; else if(c==='unl') on=TW.unlockMode=!TW.unlockMode;
        twCheatToast(({god:'INFINITE HP',fc:ALI()?'INFINITE JUDGEMENT CUT':'INFINITE FULL COUNTER',otk:'ONE-HIT KILL',unl:'TIMELINE UNLOCK'})[c]+': '+(on?'ON':'OFF'),on); return; } return; }
    if(MOB.cheats&&IS_TOUCH()) return; return ta(id); }; })();

// ---------- pause card on touch ----------
function twDrawPauseTouch(){ if(TLM.open) return; const k=2, W=UW/k, H=UH/k, w=320, h=214, x=(W-w)/2, y=(H-h)/2; D.save(); D.scale(k,k); uPanel(x,y,w,h,UIC.panel,UIC.line2,16);
  D.fillStyle=UIC.acc; D.fillRect(x+24,y+26,28,2); uText('Paused',x+24,y+60,`900 28px ${FD}`,UIC.accL); uText(MOB.bgPaused?'Paused while you were away':'Take a breather',x+24,y+84,`500 13px ${FB}`,UIC.mut);
  MOB.prects=[]; uBtn(x+24,y+100,w-48,54,'Resume',{kind:'primary',icon:'play',size:18,id:'p:resume',rects:MOB.prects}); uBtn(x+24,y+162,w-48,40,'Menu',{size:15,id:'p:menu',rects:MOB.prects});
  D.restore(); mobRects(MOB.prects,k); }
function mobResume(){ if(Game.state!=='paused') return; Game.state=Game.prev||'play'; MOB.bgPaused=false; MOB.ghost=performance.now()+600; releaseTouchKeys(); clearHits(); Sound.unlock(); Sound.sfx('blip'); mobFullAgain(); }

// ---------- dialogue on touch: bigger text, tall reply rows answered with one tap ----------
function mobDialog(){ const d=Game.dlg; if(!d) return; const t=performance.now()/1000, ch=d.type==='choice', nO=ch?d.opts.length:0, bx=28, bw=UW-56, bh=ch?Math.max(206,92+nO*64):206, by=UH-14-bh; frame(bx,by,bw,bh);
  const who=ch?HERO():d.who, narr=d.type==='say'&&!d.who; let tx=bx+34;
  if(!narr){ const pc=portrait(who,ch?'normal':d.ex); D.save(); D.fillStyle='rgba(40,36,70,.9)'; D.fillRect(bx+22,by+22,148,148); D.imageSmoothingEnabled=false; D.drawImage(pc,0,0,56,56,bx+18,by+16,156,156); D.restore();
    D.strokeStyle='rgba(216,180,106,.8)'; D.lineWidth=2; D.strokeRect(bx+22,by+22,148,148); tx=bx+196;
    D.font=`700 26px ${FD}`; const nm=NAMES[who]||''; const nw=D.measureText(nm).width+40; frame(bx+184,by-30,nw,46,.95); D.fillStyle='#f3dfae'; D.fillText(nm,bx+204,by+2);
    if(Voice.speaking&&!ch){ for(let i=0;i<4;i++){ const h=6+Math.abs(Math.sin(t*14+i*1.7))*12; D.fillStyle='#d8b46a'; D.fillRect(bx+194+nw+i*6,by-7-h/2,3,h); } } }
  const maxW=bx+bw-tx-34;
  if(!ch){ D.font=`${narr?'italic ':''}500 31px ${FB}`; D.fillStyle=narr?'#d9d2ff':'#efe8d6'; const lines=wrap(d.text,maxW); let left=Math.floor(d.shown);
    lines.forEach((ln,i)=>{ if(left<=0) return; const s2=ln.slice(0,left); left-=ln.length+1; D.fillText(s2,tx,by+58+i*40); });
    if(!held.ff){ D.globalAlpha=.55; uText('Hold to fast-forward',bx+bw-60,by+bh-18,`600 17px ${FB}`,'#b8a888','right'); D.globalAlpha=1; }
    if(d.shown>=d.text.length){ D.fillStyle='#d8b46a'; const yy=by+bh-26+Math.sin(t*6)*3; D.beginPath(); D.moveTo(bx+bw-46,yy); D.lineTo(bx+bw-30,yy); D.lineTo(bx+bw-38,yy+9); D.fill(); } }
  else { D.font=`italic 500 21px ${FB}`; D.fillStyle='#b8a888'; D.fillText('Tap a reply',tx,by+42);
    Game.dlgRows=[]; d.opts.forEach((o,i)=>{ const ry=by+60+i*64, sel=i===d.sel; Game.dlgRows.push([tx-14,ry,maxW+20,56]);
      uRR(tx-14,ry,maxW+20,56,10); D.fillStyle=sel?'rgba(216,180,106,.18)':'rgba(255,255,255,.05)'; D.fill(); D.strokeStyle=sel?'rgba(216,180,106,.7)':'rgba(255,255,255,.12)'; D.lineWidth=1.5; D.stroke();
      D.font=`${sel?700:500} 27px ${FB}`; D.fillStyle=o.lock?(sel?'#8a8496':'#5e5a6a'):sel?'#fff4d6':'#e2dccb'; D.fillText(wrap((o.lock?'🔒 ':'')+(o.act?o.t:'“'+o.t+'”'),maxW-20)[0],tx+4,ry+37); }); } }
(function(){ const dd=drawDialog; drawDialog=function(){ if(!IS_TOUCH()) return dd(); try{ mobDialog(); }catch(e){ console.error('mob dialog',e); return dd(); } }; })();

// ---------- title on touch: big buttons ----------
(function(){ const dt=drawTitle; drawTitle=function(){ if(!IS_TOUCH()) return dt(); try{ mobTitle(); }catch(e){ console.error('mob title',e); return dt(); } }; })();
function mobTitle(){ const k=1.8, W=UW/k, H=UH/k, x=36; D.save(); D.scale(k,k);
  const g=D.createLinearGradient(0,0,W*.75,0); g.addColorStop(0,'rgba(4,5,12,.92)'); g.addColorStop(.6,'rgba(4,5,12,.55)'); g.addColorStop(1,'rgba(4,5,12,0)'); D.fillStyle=g; D.fillRect(0,0,W,H);
  uCaps('A SHAYAN SAQIB TALE',x,56,UIC.acc,12);
  D.save(); D.shadowColor='rgba(0,0,0,.7)'; D.shadowBlur=16; const tg=D.createLinearGradient(0,70,0,150); tg.addColorStop(0,'#fff1c8'); tg.addColorStop(1,'#d9a64a'); D.font=`900 40px ${FD}`; D.fillStyle=tg;
  D.fillText("The Moonsinger's",x-2,102); D.fillText('Bell',x-2,146); D.restore(); D.fillStyle=UIC.acc; D.fillRect(x,162,48,2);
  if(TM.sel>=TM_OPTS.length) TM.sel=0; TM.rows=[];
  TM_OPTS.forEach((o,i)=>{ const y=184+i*68, on=TM.sel===i&&!HUB.modal, dis=o.id==='cont'&&!saveHas(), w=310, h=58; TM.rows.push({x,y,w,h});
    uRR(x,y,w,h,12); D.fillStyle=on?'rgba(227,182,90,.16)':'rgba(255,255,255,.05)'; D.fill(); D.strokeStyle=on?UIC.acc:UIC.line2; D.lineWidth=on?2:1; D.stroke();
    uText(o.t,x+18,y+27,`800 22px ${FD}`,dis?UIC.dim:on?UIC.accL:'#e6e3ef'); uText(twTitleSub(o),x+18,y+46,`500 12px ${FB}`,on?'#d9cfb4':UIC.mut); });
  D.restore();
  for(const r of TM.rows){ r.x*=k; r.y*=k; r.w*=k; r.h*=k; } twDrawModal(); }

// ---------- full screen: no button; leave it when the phone turns upright, go back in on the next tap sideways ----------
function mobLandscape(){ return innerWidth>innerHeight; }
function mobFullAgain(){ try{ if(!IS_TOUCH()||!MOB.full||!mobLandscape()||inFull()) return; MOB.full=false; const el=document.documentElement;
  if(el.requestFullscreen||el.webkitRequestFullscreen) toggleFull(); else { document.body.classList.add('pseudofs'); syncFull(); } }catch(e){} }
addEventListener('resize',()=>{ try{ if(IS_TOUCH()&&!mobLandscape()&&inFull()){ MOB.full=true; toggleFull(); } }catch(e){} });
addEventListener('touchend',()=>{ if(MOB.full&&Game.state!=='title') mobFullAgain(); },{passive:true});

// ---------- the page goes to the background: pause the game and silence it ----------
document.addEventListener('visibilitychange',()=>{ try{ if(document.hidden){ if(Sound.ctx&&Sound.ctx.state==='running') Sound.ctx.suspend();
      if((Game.state==='play'||Game.state==='cut')&&!TLM.open){ Game.prev=Game.state; Game.state='paused'; MOB.bgPaused=true; if(typeof releaseTouchKeys==='function') releaseTouchKeys(); clearHits(); } }
    else if(Sound.ctx&&Sound.ctx.state==='suspended'){ const p=Sound.ctx.resume(); if(p&&p.catch) p.catch(()=>{}); } }catch(e){} });
addEventListener('pagehide',()=>{ try{ if(Sound.ctx&&Sound.ctx.state==='running') Sound.ctx.suspend(); }catch(e){} });

// ---------- touch input for all of the above: taps act on release, drags scroll ----------
addEventListener('pointerdown',e=>{ if(!IS_TOUCH()||e.target!==ui) return; const [ux,uy]=tlPt(e);
  if(TLM.open){ e.preventDefault(); e.stopImmediatePropagation(); const k=MOB.k, vx=ux/k, vy=uy/k, zone=MOB.cheats?null:HUB.sec==='road'&&mobIn(MOB.strip,vx,vy)?'strip':HUB.sec==='controls'&&mobIn(MOB.list,vx,vy)?'list':null;
    MOB.drag={id:e.pointerId,x:vx,y:vy,moved:false,hit:tlHit(ux,uy),zone,s0:zone==='strip'?MOB.sx[TLM.tab]:MOB.sy[MOB.ct]}; return; }
  if(Game.state==='paused'&&!DBG.open){ e.preventDefault(); e.stopImmediatePropagation(); const r=MOB.prects.find(q=>ux>=q.x&&ux<=q.x+q.w&&uy>=q.y&&uy<=q.y+q.h); if(!r) return;
    if(r.id==='p:resume') mobResume(); else { mobResume(); if(twEscOk()) twEscOpen(); } return; }
  const d=Game.dlg; if(d&&d.type==='choice'&&Game.dlgRows){ const i=Game.dlgRows.findIndex(([rx,ry,rw,rh])=>ux>=rx&&ux<=rx+rw&&uy>=ry&&uy<=ry+rh); if(i>=0){ e.preventDefault(); e.stopImmediatePropagation(); d.sel=i; Sound.unlock(); tapKey('confirm'); } } },true);
addEventListener('pointermove',e=>{ const g=MOB.drag; if(!g||e.pointerId!==g.id) return; if(!TLM.open){ MOB.drag=null; return; } const [ux,uy]=tlPt(e), dx=ux/MOB.k-g.x, dy=uy/MOB.k-g.y;
  if(!g.moved&&Math.hypot(dx,dy)>7) g.moved=true; if(g.moved&&g.zone==='strip') MOB.sx[TLM.tab]=g.s0-dx; else if(g.moved&&g.zone==='list') MOB.sy[MOB.ct]=g.s0-dy; if(g.moved) e.preventDefault(); },true);
addEventListener('pointerup',e=>{ const g=MOB.drag; if(!g||e.pointerId!==g.id) return; MOB.drag=null; if(!g.moved&&TLM.open){ try{ mobTap(g.hit); }catch(er){ console.error('mob tap',er); } } },true);
addEventListener('pointercancel',()=>{ MOB.drag=null; },true);
// hold a finger anywhere on the screen (or on Next) during dialogue to fast-forward it, like holding F
addEventListener('pointerdown',e=>{ if(!IS_TOUCH()||TLM.open||!Game.dlg||Game.dlg.type!=='say'||MOB.ffP!=null) return; MOB.ffP=e.pointerId; MOB.ffT=performance.now(); },true);
const mobFFEnd=e=>{ if(MOB.ffP==null||(e&&e.pointerId!==MOB.ffP)) return; MOB.ffP=null; if(MOB.ffOn){ MOB.ffOn=false; held.ff=false; } };
addEventListener('pointerup',mobFFEnd,true); addEventListener('pointercancel',mobFFEnd,true);
// the click a phone sends after a tap that closed a menu must not land on a button that just reappeared underneath
addEventListener('click',e=>{ if(performance.now()<MOB.ghost){ e.preventDefault(); e.stopImmediatePropagation(); } },true);
// the menu fades out after Resume instead of cutting straight to the game
(function(){ const du=drawUI; drawUI=function(){ if(MOB.ffP!=null&&!MOB.ffOn&&performance.now()-MOB.ffT>320&&Game.dlg){ MOB.ffOn=true; held.ff=true; } if(MOB.ffOn&&(!Game.dlg||TLM.open)){ MOB.ffOn=false; MOB.ffP=null; held.ff=false; }
    du(); if(MOB.fade>0&&!TLM.open){ MOB.fade=Math.max(0,MOB.fade-1/60*7); if(MOB.fade>0) try{ mobHub(MOB.fade); TLM.rects=[]; }catch(e){ MOB.fade=0; } } }; })();

// ---------- the touch Menu button (was ESC: "restart game") opens the Esc menu ----------
(function(){ try{ const old=document.getElementById('tbPause'); if(!old||!old.replaceWith||!old.cloneNode) return; const b=old.cloneNode(false); b.id='tbPause'; b.className='tb'; b.setAttribute('aria-label','Menu');
  b.innerHTML='<svg viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h14"/></svg><span>Menu</span>'; old.replaceWith(b);
  b.addEventListener('pointerdown',e=>e.stopPropagation()); b.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
  b.addEventListener('click',e=>{ e.stopPropagation(); Sound.unlock(); if(Game.state==='title') return; if(DBG.open){ dbgOpen(false); return; } if(TLM.open){ twTimelineClose(null); return; } if(Game.state==='paused'&&!TLM.open) mobResume(); if(twEscOk()) twEscOpen(); }); }catch(e){} })();

// ---------- Debug Mode on touch: the Debug button opens the shared panel (99e_debug.js), which pauses the game ----------
(function(){ try{ const T=document.getElementById('touch'); if(!T||!T.appendChild) return; const b=document.createElement('button'); b.className='tb'; b.id='tbDebug'; b.textContent='Debug'; b.hidden=true; T.appendChild(b);
  const st=document.createElement('style'); st.textContent='#tbDebug{top:calc(22% + env(safe-area-inset-top,0px));left:calc(10px + env(safe-area-inset-left,0px));width:auto;height:40px;border-radius:20px;padding:0 16px;font:800 14px var(--body);border-color:#ff8aa8;color:#ffd0dc}'
    +'body.hubopen #tbPause,body.hubopen #tbFull{display:none!important}'
    +'body.touch #tbFull{display:none!important}'
    +'#tbPause{width:auto!important;height:44px!important;border-radius:22px!important;padding:0 16px 0 12px!important;gap:6px;font:800 15px var(--body)!important;letter-spacing:0!important}#tbPause svg{width:20px;height:20px}'
    +'body.mobchoice #tbNext{display:none!important}'; document.head.appendChild(st);
  b.addEventListener('pointerdown',e=>e.stopPropagation()); b.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
  b.addEventListener('click',e=>{ e.stopPropagation(); Sound.unlock(); dbgOpen(!DBG.open); Sound.sfx('blip'); }); MOB.dbgBtn=b; }catch(e){} })();
// every frame: the Debug button shows only in debug mode; the corner buttons hide while the Esc menu (with its own Resume) is open
(function(){ const du=drawUI; drawUI=function(){ du(); try{ if(MOB.dbgBtn) MOB.dbgBtn.hidden=!(DBG.on&&IS_TOUCH()&&Game.state!=='title'&&!TLM.open);
    const on=!!TLM.open; if(MOB.hub!==on){ MOB.hub=on; document.body.classList.toggle('hubopen',on); }
    const chs=!!(Game.dlg&&Game.dlg.type==='choice'&&IS_TOUCH()); if(MOB.chs!==chs){ MOB.chs=chs; document.body.classList.toggle('mobchoice',chs); } }catch(e){} }; })();
