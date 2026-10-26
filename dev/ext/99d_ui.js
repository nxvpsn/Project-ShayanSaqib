// =====================================================================
// UI: one clean look for the title screen, the pause screen, the Esc menu and the Controls card.
// The Esc menu is a single screen with no nested menus: a left rail (Resume / Unstuck / Exit to Title,
// progress, key hints) and five tabs on top: Shayan's Road · Ali's Road · Miscellaneous (the timeline),
// Controls and Options. Q / Tab (L1 / R1) switch tabs, arrows (D-pad) move, Enter picks, Esc resumes.
// Paul's own timeline uses the same screen with only the three road tabs.
// Input plumbing is the old one: TLM.rects + tlActivate for the menu, CT.rects + twCardActivate for the
// Controls tab (and the card that pops up in town), TLV.box for the volume slider.
// The secret timeline toggle (TW.unlockMode) adds an Unlock checkbox under every locked card, and Unlock all.
// =====================================================================
const UIC={panel:'rgba(16,19,31,.97)',panel2:'rgba(24,28,44,.97)',well:'rgba(9,11,20,.9)',line:'rgba(255,255,255,.08)',line2:'rgba(255,255,255,.18)',
  acc:'#e3b65a',accL:'#f6dca0',accD:'rgba(227,182,90,.14)',text:'#ebe9f2',mut:'#9097ad',dim:'#5f667c',good:'#6fdc9a',bad:'#ff7a86',blue:'#7ab8ff'};
const HUB={sec:'road',of:0,hov:null,modal:null};
const RAIL={x:24,y:24,w:232,h:627}, MAIN={x:272,y:24,w:904,h:627}, CONT={x:272,y:80,w:904,h:571}, MAP={x:272,y:80,w:904,h:378}, DET={x:272,y:470,w:904,h:181};

// ---------- drawing kit ----------
function uRR(x,y,w,h,r){ if(w<0){ x+=w; w=-w; } if(h<0){ y+=h; h=-h; } r=Math.max(0,Math.min(r,w/2,h/2)); D.beginPath(); D.moveTo(x+r,y); D.arcTo(x+w,y,x+w,y+h,r); D.arcTo(x+w,y+h,x,y+h,r); D.arcTo(x,y+h,x,y,r); D.arcTo(x,y,x+w,y,r); D.closePath(); }
function uPanel(x,y,w,h,fill,stroke,r){ uRR(x,y,w,h,r==null?10:r); D.fillStyle=fill||UIC.panel; D.fill(); D.strokeStyle=stroke||UIC.line; D.lineWidth=1; D.stroke(); }
function uText(t,x,y,font,col,al){ D.font=font; D.fillStyle=col; D.textAlign=al||'left'; D.fillText(t,x,y); D.textAlign='left'; }
function uCaps(t,x,y,col,size){ D.save(); try{ D.letterSpacing='2px'; }catch(e){} uText(t,x,y,`800 ${size||11}px ${FB}`,col||UIC.mut); D.restore(); }
function uWrap(t,x,y,w,lh,font,col,maxL){ D.font=font; D.fillStyle=col; let ls=wrap(t,w); if(maxL&&ls.length>maxL){ ls=ls.slice(0,maxL); ls[maxL-1]=ls[maxL-1].replace(/\s*\S*$/,'')+'…'; } ls.forEach((l,i)=>D.fillText(l,x,y+i*lh)); return ls.length; }
// a button; kind: 'primary' | 'ghost' | 'danger'. Registers its rect in `rects` (TLM.rects by default)
function uBtn(x,y,w,h,label,o){ o=o||{}; const id=o.id, hov=id&&(HUB.hov===id||CT.hoverId===id), foc=o.focus, k=o.kind||'ghost';
  const fill=k==='primary'?(hov?'#f0c870':UIC.acc):k==='danger'?(hov?'rgba(255,122,134,.22)':'rgba(255,122,134,.1)'):(o.on?UIC.accD:hov?'rgba(255,255,255,.09)':'rgba(255,255,255,.04)');
  uRR(x,y,w,h,8); D.fillStyle=fill; D.fill(); D.strokeStyle=foc?'#ffffff':o.on?UIC.acc:k==='danger'?'rgba(255,122,134,.5)':k==='primary'?UIC.acc:UIC.line2; D.lineWidth=foc?2:1; D.stroke();
  const tc=k==='primary'?'#1a1408':k==='danger'?UIC.bad:o.on?UIC.accL:UIC.text;
  if(o.icon){ uIcon(o.icon,x+16,y+h/2,tc); uText(label,x+36,y+h/2+5,`700 ${o.size||15}px ${FB}`,tc); } else uText(label,o.left?x+14:x+w/2,y+h/2+5,`700 ${o.size||15}px ${FB}`,tc,o.left?'left':'center');
  if(o.hint) uKey(o.hint,x+w-10,y+h/2,true,k==='primary');
  if(o.pad!=null&&twPadOn()) twPadBadge(o.pad,x+w-30,y+h/2+5);
  if(id) (o.rects||TLM.rects).push({x,y,w,h,id}); }
// a keycap chip, right-aligned when `right`; returns its width
function uKey(t,x,y,right,dark){ D.font=`700 12px ${FB}`; const w=Math.max(24,D.measureText(t).width+14), x0=right?x-w:x; uRR(x0,y-11,w,22,5); D.fillStyle=dark?'rgba(0,0,0,.18)':'rgba(255,255,255,.07)'; D.fill(); D.strokeStyle=dark?'rgba(0,0,0,.35)':UIC.line2; D.lineWidth=1; D.stroke();
  D.fillStyle=dark?'#1a1408':UIC.text; D.textAlign='center'; D.fillText(t,x0+w/2,y+4); D.textAlign='left'; return w; }
function uIcon(k,x,y,col){ D.save(); D.strokeStyle=col; D.fillStyle=col; D.lineWidth=2; D.lineCap='round'; D.lineJoin='round'; D.beginPath();
  if(k==='play'){ D.moveTo(x-4,y-6); D.lineTo(x+6,y); D.lineTo(x-4,y+6); D.closePath(); D.fill(); }
  else if(k==='redo'){ D.arc(x,y,6,-2.6,1.9); D.stroke(); D.beginPath(); D.moveTo(x-6.5,y-7); D.lineTo(x-5,y-2.4); D.lineTo(x-9.6,y-2); D.stroke(); }
  else if(k==='exit'){ D.moveTo(x+1,y-7); D.lineTo(x-6,y-7); D.lineTo(x-6,y+7); D.lineTo(x+1,y+7); D.moveTo(x-1,y); D.lineTo(x+8,y); D.moveTo(x+5,y-3); D.lineTo(x+8,y); D.lineTo(x+5,y+3); D.stroke(); }
  else if(k==='close'){ D.moveTo(x-5,y-5); D.lineTo(x+5,y+5); D.moveTo(x+5,y-5); D.lineTo(x-5,y+5); D.stroke(); }
  D.restore(); }
function uToggle(x,y,on,id,foc){ const w=46,h=24; uRR(x,y,w,h,12); D.fillStyle=on?UIC.acc:'rgba(255,255,255,.12)'; D.fill(); if(foc){ D.strokeStyle='#fff'; D.lineWidth=2; D.stroke(); }
  D.fillStyle=on?'#1a1408':'#d8dbe6'; D.beginPath(); D.arc(on?x+w-12:x+12,y+12,8,0,7); D.fill(); TLM.rects.push({x:x-4,y:y-4,w:w+8,h:h+8,id}); }
function uSeg(x,y,w,h,items,cur,foc,rects){ const n=items.length, bw=w/n; uRR(x,y,w,h,8); D.fillStyle='rgba(255,255,255,.04)'; D.fill(); D.strokeStyle=foc?'#fff':UIC.line2; D.lineWidth=foc?2:1; D.stroke();
  items.forEach(([id,lab],i)=>{ const on=id===cur, bx=x+i*bw, hov=HUB.hov===id||CT.hoverId===id||(twPadOn()&&CT.focus===id);
    if(on){ uRR(bx+3,y+3,bw-6,h-6,6); D.fillStyle=UIC.acc; D.fill(); } else if(hov){ uRR(bx+3,y+3,bw-6,h-6,6); D.fillStyle='rgba(255,255,255,.08)'; D.fill(); }
    if(twPadOn()&&CT.focus===id&&!on){ uRR(bx+3,y+3,bw-6,h-6,6); D.strokeStyle='#fff'; D.lineWidth=1.5; D.stroke(); }
    uText(lab,bx+bw/2,y+h/2+5,`700 14px ${FB}`,on?'#1a1408':UIC.text,'center'); (rects||TLM.rects).push({x:bx,y,w:bw,h,id}); }); }
function uCheck(x,y,on,label,id){ uRR(x,y,16,16,4); D.fillStyle=on?UIC.acc:'rgba(0,0,0,.35)'; D.fill(); D.strokeStyle=on?UIC.acc:UIC.line2; D.lineWidth=1.5; D.stroke();
  if(on){ D.strokeStyle='#1a1408'; D.lineWidth=2.2; D.beginPath(); D.moveTo(x+4,y+8.5); D.lineTo(x+7,y+11.5); D.lineTo(x+12.5,y+5); D.stroke(); }
  const w=label?D.measureText(label).width:0; if(label) uText(label,x+22,y+12.5,`700 12px ${FB}`,on?UIC.accL:UIC.mut); TLM.rects.push({x:x-3,y:y-3,w:28+(label?(D.font=`700 12px ${FB}`,D.measureText(label).width):0),h:22,id}); }

// ---------- title screen: New Game / Continue ----------
function twTitleSub(o){ if(o.id==='new') return 'Start the story from the beginning';
  if(!saveHas()) return 'No save on this device'; const n=TL_BY[TWS.last]; return n?'Resume at: '+(n.root?n.name:n.name):'Resume from the start of the story'; }
drawTitle=function(){ const t=performance.now()/1000, k=IS_TOUCH()?1.3:1, W=UW/k, H=UH/k, x=IS_TOUCH()?64:96; D.save(); D.scale(k,k);
  const g=D.createLinearGradient(0,0,W*.7,0); g.addColorStop(0,'rgba(4,5,12,.9)'); g.addColorStop(.6,'rgba(4,5,12,.5)'); g.addColorStop(1,'rgba(4,5,12,0)'); D.fillStyle=g; D.fillRect(0,0,W,H);
  uCaps('A SHAYAN SAQIB TALE',x,150,UIC.acc,13);
  D.save(); D.shadowColor='rgba(0,0,0,.7)'; D.shadowBlur=20; const tg=D.createLinearGradient(0,170,0,300); tg.addColorStop(0,'#fff1c8'); tg.addColorStop(1,'#d9a64a'); D.font=`900 58px ${FD}`; D.fillStyle=tg;
  D.fillText("The Moonsinger's",x-3,218); D.fillText('Bell',x-3,284); D.restore();
  D.fillStyle=UIC.acc; D.fillRect(x,312,56,2);
  if(TM.sel>=TM_OPTS.length) TM.sel=0; TM.rows=[];
  TM_OPTS.forEach((o,i)=>{ const y=372+i*78, on=TM.sel===i&&!HUB.modal, k=on?Math.min(1,(TM.selT=(TM.selT||0)+1/60)*6):0, dx=on?8:0;
    TM.rows.push({x:x-30,y:y-38,w:440,h:66});
    if(on){ uRR(x-30,y-38,440,66,10); D.fillStyle='rgba(227,182,90,.08)'; D.fill(); D.fillStyle=UIC.acc; D.fillRect(x-30,y-30,3,50); }
    uText(o.t,x+dx,y,`800 30px ${FD}`,on?UIC.accL:(o.id==='cont'&&!saveHas()?UIC.dim:'#d9d6e4'));
    uText(twTitleSub(o),x+dx,y+22,`500 14px ${FB}`,on?'#d9cfb4':UIC.mut); });
  const T=IS_TOUCH(); D.globalAlpha=.75; uText(T?'Tap an option':twPadOn()?'D-pad to choose  ·  '+twPadName(0)+' to select':'↑ ↓ or mouse to choose  ·  Enter or click to select',x,H-30,`600 14px ${FB}`,UIC.mut);
  uText('About 25 minutes  ·  Fully voiced  ·  Sound on',W-30,H-30,`600 14px ${FB}`,UIC.mut,'right'); D.globalAlpha=1; D.restore();
  for(const r of TM.rows){ r.x*=k; r.y*=k; r.w*=k; r.h*=k; }
  twDrawModal(); };
// the modal box (title screen confirmations)
function twModal(title,msg,btns,def){ HUB.modal={title,msg,btns,sel:def||0,rects:[],t:0}; TM.busy=true; Sound.sfx('blip'); }
function twModalClose(){ HUB.modal=null; TM.busy=false; clearHits(); }
function twModalPick(i){ const M=HUB.modal; if(!M) return; const b=M.btns[i]; twModalClose(); Sound.sfx('select'); if(b&&b.go) b.go(); }
function twDrawModal(){ const M=HUB.modal; if(!M) return; M.t+=1/60; const k=IS_TOUCH()?1.8:1; D.save(); D.globalAlpha=Math.min(1,M.t*8); D.fillStyle='rgba(3,4,10,.7)'; D.fillRect(0,0,UW,UH); D.scale(k,k);
  const w=500, h=214, x=(UW/k-w)/2, y=(UH/k-h)/2; uPanel(x,y,w,h,UIC.panel2,UIC.line2,14); D.fillStyle=UIC.acc; D.fillRect(x+28,y+28,28,2);
  uText(M.title,x+28,y+62,`800 24px ${FD}`,UIC.accL); uWrap(M.msg,x+28,y+96,w-56,21,`500 16px ${FB}`,UIC.text);
  M.rects=[]; let bx=x+w-28; for(let i=M.btns.length-1;i>=0;i--){ const b=M.btns[i]; D.font=`700 15px ${FB}`; const bw=Math.max(110,D.measureText(b.t).width+36); bx-=bw;
    uBtn(bx,y+h-66,bw,42,b.t,{kind:b.kind||'ghost',focus:M.sel===i,rects:M.rects,id:'m'+i}); bx-=10; }
  D.restore(); for(const r of M.rects){ r.x*=k; r.y*=k; r.w*=k; r.h*=k; } }
ui.addEventListener('pointerdown',e=>{ if(Game.state!=='title'||!HUB.modal) return; e.preventDefault(); e.stopImmediatePropagation(); const [x,y]=tlPt(e), r=HUB.modal.rects.find(q=>x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h); if(r) twModalPick(+r.id.slice(1)); },true);
ui.addEventListener('pointermove',e=>{ if(Game.state!=='title'||!HUB.modal) return; const [x,y]=tlPt(e), r=HUB.modal.rects.find(q=>x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h); HUB.hov=r?r.id:null; if(r) HUB.modal.sel=+r.id.slice(1); });
twTitleMenu=function(dt){ const M=HUB.modal;
  if(M){ const n=M.btns.length; if(consume('left')||consume('up')){ M.sel=(M.sel+n-1)%n; Sound.sfx('blip'); } if(consume('right')||consume('down')){ M.sel=(M.sel+1)%n; Sound.sfx('blip'); }
    if(consume('confirm')||consume('jump')||consume('attack')) twModalPick(M.sel); else if(consume('dash')||consume('menu')||consume('pause')){ twModalClose(); Sound.sfx('blip'); } return; }
  if(TM.busy||(Game.titleT||0)<.5){ clearHits(); return; }
  if(consume('up')||consume('left')){ TM.sel=(TM.sel+TM_OPTS.length-1)%TM_OPTS.length; TM.selT=0; Sound.sfx('blip'); }
  if(consume('down')||consume('right')){ TM.sel=(TM.sel+1)%TM_OPTS.length; TM.selT=0; Sound.sfx('blip'); }
  if(consume('confirm')||consume('attack')||consume('jump')) twTitlePick(); };
function twTitleNewAsk(){ if(!saveHas()){ twFreshStart(); return; }
  twModal('Start a new game?','Are you sure? This will override your local save.',[{t:'Cancel'},{t:'Yes, start over',kind:'danger',go:twFreshStart}],0); }
function twTitleContinue(){ if(!saveHas()){ twModal('Save file corrupted','Save file corrupted, please start a new game.',[{t:'Back'},{t:'New Game',kind:'primary',go:twFreshStart}],1); return; }
  savePersist(); const id=TWS.last; if(!(id&&TL_BY[id])){ twStartGame(); return; }
  twStartGame(); Object.assign(Game,{script:null,wait:null,dlg:null,timeScale:1,slowT:0,banner:null,card:null,evaCard:null}); Voice.stop(); Cam.cine=null; Game.letterTo=0; twControlsHide();
  run(function*(){ yield* twWarp(id); }); }
// remember where the player was: checkpoints reached (twMark) and warps
(function(){ const tw=twWarp; twWarp=function*(id){ if(TL_BY[id]){ TWS.last=id; twSave(); } yield* tw(id); };
  const tt=toTitle; toTitle=function(){ const r=tt.apply(this,arguments); TM.sel=saveHas()?1:0; TM.selT=0; HUB.modal=null; TM.busy=false; return r; }; })();
TM.sel=saveHas()?1:0;

// ---------- pause screen ----------
drawPause=function(){ D.fillStyle='rgba(4,5,12,.78)'; D.fillRect(0,0,UW,UH); if(IS_TOUCH()) return twDrawPauseTouch(); const w=820, h=470, x=(UW-w)/2, y=(UH-h)/2; uPanel(x,y,w,h,UIC.panel,UIC.line2,14);
  uText('Paused',x+36,y+58,`900 32px ${FD}`,UIC.accL); uText('Controls at a glance',x+36,y+84,`500 15px ${FB}`,UIC.mut);
  const ali=ALI(), rows=ali?[['Move','WASD / arrow keys'],['Jump',K('jump')+'  (hold: ride a Getsuga)'],['Attack',K('attack')+'  (3-cut combo)'],['Getsuga Tenshou',K('block')],['Black Getsuga','Hold '+K('block')+', release'],['Parry','Attack just before a hit'],['Teleport',K('dash')],['Special',K('special')+'  (full blue gauge)'],['Talk / advance',K('confirm')],['Fast-forward','Hold '+K('ff')],['Menu',K('menu')],['Voices · Mute',K('voices')+' · '+K('mute')]]
    :[['Move','WASD / arrow keys'],['Jump',K('jump')+'  (twice: double jump)'],['Glide','Hold '+K('jump')+' after the double jump'],['Attack',K('attack')+'  (3-hit combo)'],['Getsuga Tenshou','Hold '+K('attack')+', release'],['Fireball',K('block')+'  (hold for a big one)'],['Parry','Attack just before a hit'],['Dash',K('dash')],['Special',K('special')+'  (full blue gauge)'],['Talk / advance',K('confirm')],['Fast-forward','Hold '+K('ff')],['Menu · Voices · Mute',K('menu')+' · '+K('voices')+' · '+K('mute')]];
  const half=Math.ceil(rows.length/2); rows.forEach(([a,b],i)=>{ const col=i<half?0:1, r=i%half, cx=x+36+col*384, cy=y+130+r*44; uRR(cx,cy-24,364,36,8); D.fillStyle='rgba(255,255,255,.035)'; D.fill();
    uText(a,cx+14,cy,`700 15px ${FB}`,UIC.mut); uText(b,cx+350,cy,`700 15px ${FB}`,UIC.text,'right'); });
  uText(IS_TOUCH()?'Tap to resume':K('pause')+' to resume  ·  '+K('menu')+' for the menu',UW/2,y+h-26,`600 15px ${FB}`,UIC.mut,'center'); };

// ---------- the Esc menu ----------
function hubTabs(){ return TLM.esc?[[0,"Shayan's Road"],[1,"Ali's Road"],[2,'Miscellaneous'],[3,'Controls'],[4,'Options']]:[[0,"Shayan's Road"],[1,"Ali's Road"],[2,'Miscellaneous']]; }
function hubIdx(){ return HUB.sec==='road'?TLM.tab:HUB.sec==='controls'?3:4; }
function hubGo(i){ const n=hubTabs().length; i=((i%n)+n)%n;
  if(i<3){ const was=HUB.sec; HUB.sec='road'; if(CT.fromMenu) twControlsHide(); if(was==='road'&&TLM.tab===i) return; TLM.tab=i; const ns=TL.filter(m=>m.tab===i), o=ns.filter(m=>twNodeOpen(m)&&!m.root).pop()||ns[0]; TLM.sel=o.id; }
  else if(i===3){ HUB.sec='controls'; twControlsShow(true); }
  else { HUB.sec='options'; HUB.of=0; if(CT.fromMenu) twControlsHide(); }
  Sound.sfx('blip'); }
tlCardPos=function(n){ return {x:MAP.x+24+n.col*124,y:MAP.y+30+n.row*112,w:112,h:84}; };
function hubRail(){ const R=RAIL; uPanel(R.x,R.y,R.w,R.h,UIC.panel,UIC.line,12);
  uCaps("THE MOONSINGER'S BELL",R.x+20,R.y+34,UIC.dim,10); uText(TLM.esc?'Paused':'Timeline',R.x+20,R.y+70,`900 28px ${FD}`,UIC.accL);
  let y=R.y+96; const bw=R.w-40;
  uBtn(R.x+20,y,bw,44,TLM.esc?'Resume':'Close',{kind:'primary',id:'close',icon:TLM.esc?'play':'close',hint:twPadOn()?null:'Esc',pad:twPadOn()?1:null}); y+=54;
  if(TLM.esc){ uBtn(R.x+20,y,bw,40,'Unstuck',{id:'unstuck',icon:'redo',pad:twPadOn()?2:null}); y+=50;
    uBtn(R.x+20,y,bw,40,'Exit to Title',{id:'title',icon:'exit',kind:'danger',pad:twPadOn()?8:null}); y+=50; }
  // progress
  y+=14; D.fillStyle=UIC.line; D.fillRect(R.x+20,y,bw,1); y+=30; uCaps('PROGRESS',R.x+20,y,UIC.mut);
  const tot=TL_CHECKS.length, done=TL_CHECKS.filter(id=>TWS.done[id]).length; y+=30; uText(done+' / '+tot,R.x+20,y,`800 24px ${FB}`,UIC.text); uText('checkpoints cleared',R.x+20+D.measureText(done+' / '+tot).width+8,y,`500 13px ${FB}`,UIC.mut);
  y+=12; uRR(R.x+20,y,bw,6,3); D.fillStyle='rgba(255,255,255,.08)'; D.fill(); if(done){ uRR(R.x+20,y,Math.max(6,bw*done/tot),6,3); D.fillStyle=UIC.acc; D.fill(); }
  y+=28; for(const [lab,tab] of [["Shayan's Road",0],["Ali's Road",1]]){ const ids=TL.filter(n=>n.tab===tab&&!n.root).map(n=>n.id), d=ids.filter(id=>TWS.done[id]).length; uText(lab,R.x+20,y,`600 13px ${FB}`,UIC.mut); uText(d+' / '+ids.length,R.x+R.w-20,y,`700 13px ${FB}`,UIC.text,'right'); y+=22; }
  uText('Paul',R.x+20,y,`600 13px ${FB}`,UIC.mut); uText(TWS.paulDone?'Defeated':twAllDone()?'Waiting':'Locked',R.x+R.w-20,y,`700 13px ${FB}`,TWS.paulDone?UIC.good:UIC.text,'right');
  // key hints
  const P2=twPadOn(), hints=IS_TOUCH()?[['Tap','Select'],['Tap twice','Warp']]:P2?[[twPadName(4)+' '+twPadName(5),'Switch tab'],['D-pad','Move'],[twPadName(0),'Select'],[twPadName(1),'Resume']]:[['Q / Tab','Switch tab'],['Arrows','Move'],['Enter','Select'],['Esc','Resume']];
  let hy=R.y+R.h-20-(hints.length-1)*28; for(const [k,l] of hints){ uKey(k,R.x+20,hy-4,false); uText(l,R.x+R.w-20,hy+1,`600 13px ${FB}`,UIC.mut,'right'); hy+=28; } }
function hubTabBar(){ const tabs=hubTabs(), cur=hubIdx(); let x=MAIN.x+4; const y=MAIN.y;
  tabs.forEach(([i,lab])=>{ D.font=`700 16px ${FB}`; const w=D.measureText(lab).width+32, on=i===cur, id='htab:'+i, hov=HUB.hov===id;
    if(on||hov){ uRR(x,y,w,40,8); D.fillStyle=on?UIC.accD:'rgba(255,255,255,.05)'; D.fill(); }
    uText(lab,x+w/2,y+26,`700 16px ${FB}`,on?UIC.accL:hov?UIC.text:UIC.mut,'center'); if(on){ D.fillStyle=UIC.acc; D.fillRect(x+12,y+38,w-24,3); }
    TLM.rects.push({x,y,w,h:42,id}); x+=w+6; });
  D.fillStyle=UIC.line; D.fillRect(MAIN.x,y+44,MAIN.w,1); }
function hubCheatable(m){ return !m.root&&(m.final?!twAllDone():!TWS.done[m.id]); }
function hubRoad(){ const t=TLM.t, M=MAP; uPanel(M.x,M.y,M.w,M.h,UIC.well,UIC.line,12);
  // a faint grid behind the route
  D.save(); uRR(M.x,M.y,M.w,M.h,12); D.clip(); D.strokeStyle='rgba(255,255,255,.035)'; D.lineWidth=1; for(let gx=M.x+16;gx<M.x+M.w;gx+=32){ D.beginPath(); D.moveTo(gx,M.y); D.lineTo(gx,M.y+M.h); D.stroke(); } for(let gy=M.y+16;gy<M.y+M.h;gy+=32){ D.beginPath(); D.moveTo(M.x,gy); D.lineTo(M.x+M.w,gy); D.stroke(); } D.restore();
  const nodes=TL.filter(m=>m.tab===TLM.tab);
  for(const m of nodes) for(const pid of (m.par||[])){ const p=TL_BY[pid]; if(!p||p.tab!==TLM.tab) continue; const A=tlCardPos(p), B=tlCardPos(m), x0=A.x+A.w+3, y0=A.y+A.h/2, x1=B.x-3, y1=B.y+B.h/2, both=twNodeOpen(p)&&twNodeOpen(m), half=twNodeOpen(p);
    D.save(); D.lineWidth=both?3:2; D.strokeStyle=both?UIC.acc:half?'rgba(122,184,255,.7)':'rgba(255,255,255,.14)'; if(!half) D.setLineDash([5,6]); D.beginPath(); D.moveTo(x0,y0); D.bezierCurveTo(x0+36,y0,x1-36,y1,x1,y1); D.stroke(); D.restore(); }
  for(const m of nodes){ const R2=tlCardPos(m), op=twNodeOpen(m), sel=m.id===TLM.sel, hov=m.id===TLM.hover||HUB.hov==='node:'+m.id;
    if(sel){ D.save(); D.shadowColor='rgba(227,182,90,.7)'; D.shadowBlur=16+4*Math.sin(t*5); uRR(R2.x-3,R2.y-3,R2.w+6,R2.h+6,9); D.fillStyle=UIC.acc; D.fill(); D.restore(); }
    D.save(); uRR(R2.x,R2.y,R2.w,R2.h,7); D.clip(); D.fillStyle='#0b0d16'; D.fillRect(R2.x,R2.y,R2.w,R2.h); D.imageSmoothingEnabled=false; D.drawImage(op?twArt(m.id):twArtLocked(),R2.x,R2.y,R2.w,R2.h-22);
    if(!op){ D.fillStyle='rgba(8,9,16,.45)'; D.fillRect(R2.x,R2.y,R2.w,R2.h-22); }
    if(m.final&&op){ D.fillStyle=`rgba(255,0,60,${.12+.12*Math.random()})`; D.fillRect(R2.x+rnd(-3,3),R2.y,R2.w,R2.h-22); }
    D.fillStyle=op?'rgba(20,23,36,.96)':'rgba(14,16,26,.96)'; D.fillRect(R2.x,R2.y+R2.h-22,R2.w,22); D.restore();
    uRR(R2.x,R2.y,R2.w,R2.h,7); D.strokeStyle=sel?'#fff':hov?UIC.accL:op?'rgba(227,182,90,.45)':UIC.line2; D.lineWidth=sel?2:1; D.stroke();
    D.font=`700 11px ${FB}`; const nm=op?m.name:'???', ls=wrap(nm,R2.w-10); uText(ls[0]+(ls.length>1?'…':''),R2.x+R2.w/2,R2.y+R2.h-7,`700 11px ${FB}`,op?UIC.text:UIC.dim,'center');
    if(op&&!m.root&&(m.final?TWS.paulDone:TWS.done[m.id])){ D.fillStyle=UIC.good; D.beginPath(); D.arc(R2.x+R2.w-9,R2.y+9,8,0,7); D.fill(); D.strokeStyle='#0b2416'; D.lineWidth=2; D.beginPath(); D.moveTo(R2.x+R2.w-13,R2.y+9); D.lineTo(R2.x+R2.w-10,R2.y+12); D.lineTo(R2.x+R2.w-5,R2.y+6); D.stroke(); }
    TLM.rects.push({x:R2.x-3,y:R2.y-3,w:R2.w+6,h:R2.h+6,id:'node:'+m.id});
    if(TW.unlockMode&&hubCheatable(m)) uCheck(R2.x+R2.w/2-34,R2.y+R2.h+5,op,'Unlock','chk:'+m.id); }
  if(TW.unlockMode){ const ch=TL.filter(hubCheatable), all=ch.length>0&&ch.every(twNodeOpen); D.font=`700 12px ${FB}`; uCheck(M.x+M.w-112,M.y+7,all,'Unlock all','chk:all'); }
  // legend
  let lx=M.x+18; const ly=M.y+M.h-16; for(const [c2,l2,dash] of [[UIC.acc,'Cleared',false],['rgba(122,184,255,.8)','Next up',false],['rgba(255,255,255,.3)','Unknown',true]]){ D.save(); D.strokeStyle=c2; D.lineWidth=2.5; if(dash) D.setLineDash([5,5]); D.beginPath(); D.moveTo(lx,ly-4); D.lineTo(lx+22,ly-4); D.stroke(); D.restore(); uText(l2,lx+30,ly,`600 12px ${FB}`,UIC.mut); lx+=30+D.measureText(l2).width+22; }
  // details of the selected checkpoint
  const n=TL_BY[TLM.sel]||TL[0], open=twNodeOpen(n), Dt=DET; uPanel(Dt.x,Dt.y,Dt.w,Dt.h,UIC.panel,UIC.line,12);
  D.save(); uRR(Dt.x+16,Dt.y+16,265,149,8); D.clip(); D.imageSmoothingEnabled=false; D.drawImage(open?twArt(n.id):twArtLocked(),Dt.x+16,Dt.y+16,265,149); D.restore(); uRR(Dt.x+16,Dt.y+16,265,149,8); D.strokeStyle=UIC.line2; D.lineWidth=1; D.stroke();
  const tx=Dt.x+300, st=n.root?['START OF THE ROAD',UIC.blue]:n.final?(TWS.paulDone?['DEFEATED',UIC.good]:open?['READY',UIC.acc]:['LOCKED',UIC.dim]):TWS.done[n.id]?['CLEARED',UIC.good]:open?['UNLOCKED',UIC.acc]:['LOCKED',UIC.dim];
  D.font=`800 11px ${FB}`; const cw=D.measureText(st[0]).width+18; uRR(tx,Dt.y+18,cw,22,11); D.fillStyle='rgba(255,255,255,.06)'; D.fill(); uCaps(st[0],tx+9,Dt.y+33,st[1],10);
  uWrap(open?n.name:'???',tx,Dt.y+70,Dt.w-300-230,26,`800 22px ${FD}`,UIC.accL,1);
  uWrap(open?n.desc:(n.final?'Clear every checkpoint on every road. Then talk to Paul.':'Reach this point in the story to unlock it.'),tx,Dt.y+98,Dt.w-300-230,20,`500 15px ${FB}`,UIC.text,3);
  const bx=Dt.x+Dt.w-212;
  if(open) uBtn(bx,Dt.y+Dt.h-62,190,46,n.root?'Start here':n.final?'Face Paul':'Warp here',{kind:'primary',id:'warp',hint:twPadOn()||IS_TOUCH()?null:'Enter',pad:twPadOn()?0:null});
  else uText('Locked',bx+95,Dt.y+Dt.h-33,`italic 600 15px ${FB}`,UIC.dim,'center');
  uText('Warping replays a checkpoint',bx+95,Dt.y+34,`500 12px ${FB}`,UIC.dim,'center'); uText('from its start.',bx+95,Dt.y+50,`500 12px ${FB}`,UIC.dim,'center'); }
// options
function hubOptRows(){ return [{k:'vol',lab:'Volume',sub:'Music, voices and effects'},{k:'voices',lab:'Voice acting',sub:'Spoken dialogue during cutscenes'},{k:'mute',lab:'Mute',sub:'Silence everything'},{k:'full',lab:'Fullscreen',sub:'Fill the whole screen'},
  {k:'input',lab:'Input device',sub:'Keyboard and mouse, or a controller (USB or Bluetooth)'},{k:'glyph',lab:'Button prompts',sub:'How controller buttons are shown'}]; }
function hubOptions(){ const C=CONT, rows=hubOptRows(), x=C.x, w=C.w; uPanel(x,C.y,w,C.h,UIC.well,UIC.line,12); uCaps('OPTIONS',x+28,C.y+38,UIC.mut);
  const kb=!twPadOn()&&!IS_TOUCH(); let y=C.y+58;
  rows.forEach((r,i)=>{ const foc=(twPadOn()||HUB.kbFoc)&&HUB.of===i, rh=66; uRR(x+16,y,w-32,rh-8,10); D.fillStyle=foc?'rgba(227,182,90,.08)':'rgba(255,255,255,.03)'; D.fill(); if(foc){ D.strokeStyle='rgba(227,182,90,.6)'; D.lineWidth=1.5; D.stroke(); }
    uText(r.lab,x+40,y+26,`700 17px ${FB}`,UIC.text); uText(r.sub,x+40,y+46,`500 13px ${FB}`,UIC.mut); const cx=x+w-48, cy=y+(rh-8)/2;
    if(r.k==='vol'){ const B=TLV.box; B.x=cx-320; B.y=cy-15; B.w=260; B.h=30; const v=twVolNow(), ty=cy; uRR(B.x,ty-3,B.w,6,3); D.fillStyle='rgba(255,255,255,.1)'; D.fill(); if(v>0){ uRR(B.x,ty-3,B.w*v,6,3); D.fillStyle=UIC.acc; D.fill(); }
      D.fillStyle=TLV.drag?'#fff':UIC.accL; D.beginPath(); D.arc(B.x+B.w*v,ty,9,0,7); D.fill(); uText(v<=0?'Muted':Math.round(v*100)+'%',cx,ty+5,`700 15px ${FB}`,UIC.text,'right'); }
    else if(r.k==='voices') uToggle(cx-46,cy-12,!!Voice.on,'opt:voices',foc);
    else if(r.k==='mute') uToggle(cx-46,cy-12,!!Sound.muted,'opt:mute',foc);
    else if(r.k==='full') uToggle(cx-46,cy-12,!!inFull(),'opt:full',foc);
    else if(r.k==='input') uSeg(cx-300,cy-17,300,34,[['opt:input:kbm','Keyboard & Mouse'],['opt:input:pad','Controller']],'opt:input:'+PAD.mode,foc);
    else if(r.k==='glyph') uSeg(cx-300,cy-17,300,34,[['opt:glyph:ps','PlayStation'],['opt:glyph:xb','Xbox']],'opt:glyph:'+twPadSet(),foc);
    TLM.rects.unshift({x:x+16,y,w:w-32,h:rh-8,id:'orow:'+i}); y+=rh; });
  uText(kb?'Arrows choose a row and change it  ·  Enter toggles':'',x+28,C.y+C.h-22,`500 13px ${FB}`,UIC.dim); }
function hubOptAct(k,dir){ if(k==='vol'){ Sound.unlock(); Sound.setVol(clamp(Math.round((twVolNow()+(dir||1)*.05)*20)/20,0,1)); try{ if(window.syncVolUI) syncVolUI(); }catch(e){} Sound.sfx('blip'); return; }
  if(k==='voices'){ Voice.on=dir?dir>0:!Voice.on; if(!Voice.on) Voice.stop(); }
  else if(k==='mute'){ if(dir==null||(dir>0)!==!!Sound.muted) Sound.toggleMute(); }
  else if(k==='full'){ if(dir==null||(dir>0)!==!!inFull()) toggleFull(); }
  else if(k==='input') twPadSetMode(dir==null?(twPadOn()?'kbm':'pad'):dir>0?'pad':'kbm');
  else if(k==='glyph'){ PAD.glyph=dir==null?(twPadSet()==='ps'?'xb':'ps'):dir>0?'xb':'ps'; twPadSave(); }
  Sound.sfx('select'); }
twDrawTimeline=function(){ if(!TLM.open) return; TLM.t+=1/60; TLM.rects=[]; D.save(); D.globalAlpha=Math.min(1,TLM.t*6);
  D.fillStyle='rgba(4,5,11,.9)'; D.fillRect(0,0,UW,UH); TLV.box.x=-9999;
  if(HUB.sec!=='road'&&!TLM.esc) HUB.sec='road';
  if(HUB.sec==='controls'&&!CT.open) twControlsShow(true);
  hubRail(); hubTabBar();
  if(HUB.sec==='road') hubRoad(); else if(HUB.sec==='options') hubOptions(); else uPanel(CONT.x,CONT.y,CONT.w,CONT.h,UIC.well,UIC.line,12);
  D.restore(); };
(function(){ const tm=twTimelineMenu; twTimelineMenu=function(){ HUB.sec='road'; HUB.of=0; HUB.kbFoc=false; return tm.apply(this,arguments); };
  const ta=tlActivate; tlActivate=function(id){ if(!id) return;
    if(id.startsWith('htab:')){ hubGo(+id.slice(5)); return; }
    if(id.startsWith('chk:')){ const k=id.slice(4); if(k==='all'){ const ch=TL.filter(hubCheatable), all=ch.every(twNodeOpen); ch.forEach(m=>{ if(all) delete TWS.unl[m.id]; else TWS.unl[m.id]=1; }); }
      else { if(TWS.unl[k]) delete TWS.unl[k]; else TWS.unl[k]=1; } twSave(); Sound.sfx('select'); return; }
    if(id.startsWith('orow:')){ HUB.of=+id.slice(5); return; }
    if(id.startsWith('opt:')){ const p=id.split(':'); if(p[1]==='input') twPadSetMode(p[2]); else if(p[1]==='glyph'){ PAD.glyph=p[2]; twPadSave(); } else hubOptAct(p[1]); if(p.length>2) Sound.sfx('select'); return; }
    if(id==='warp'&&HUB.sec==='options'){ hubOptAct(hubOptRows()[HUB.of].k); return; }
    if(id==='warp'&&HUB.sec==='controls'){ if(CT.focus) twCardActivate(CT.focus); return; }
    if(id==='controls'){ hubGo(3); return; }
    return ta(id); };
  // Q / Tab and L1 / R1 call tlTab(TLM.tab ± 1): step through all five tabs instead
  tlTab=function(i){ hubGo(hubIdx()+(i-TLM.tab)); };
  const tm2=tlMove; tlMove=function(dx,dy){ if(HUB.sec==='options'){ HUB.kbFoc=true; const n=hubOptRows().length; if(dy){ HUB.of=(HUB.of+dy+n)%n; Sound.sfx('blip'); } else if(dx) hubOptAct(hubOptRows()[HUB.of].k,dx); return; }
    if(HUB.sec==='controls'){ twCardNav(dx,dy); return; } return tm2(dx,dy); };
  // the card's Back (pad ◯) leaves the Controls tab instead of leaving an empty page
  const ch=twControlsHide; twControlsHide=function(){ const r=ch.apply(this,arguments); if(TLM.open&&HUB.sec==='controls'&&!HUB.going){ HUB.sec='road'; } return r; };
  const pm=twPadMenu; twPadMenu=function(ctx,nav,dn){ if(ctx==='card'&&(dn(4)||dn(5))){ tlTab(TLM.tab+(dn(5)?1:-1)); return; } return pm(ctx,nav,dn); }; })();
// hubGo switches away from Controls on purpose: keep the tab it asked for
(function(){ const hg=hubGo; hubGo=function(i){ HUB.going=1; try{ return hg(i); } finally{ HUB.going=0; } }; })();
ui.addEventListener('pointermove',e=>{ if(!TLM.open) return; const [x,y]=tlPt(e); HUB.hov=tlHit(x,y); if(HUB.hov&&HUB.hov.startsWith('orow:')){ HUB.of=+HUB.hov.slice(5); } },true);

// ---------- the Controls page (Esc menu tab) and the card that pops up in town ----------
function twCtKeysList(x,y,w,keys){ for(const [a,act,suf] of keys){ const on=act&&CT.listen===act, id=act?'bind:'+act:null, f=id&&twCtFocused(id);
    uRR(x,y,w,30,7); D.fillStyle=on?`rgba(227,182,90,${.18+.08*Math.sin(performance.now()/120)})`:f?'rgba(255,255,255,.08)':'rgba(255,255,255,.03)'; D.fill(); if(f&&twPadOn()){ D.strokeStyle='#fff'; D.lineWidth=1.5; D.stroke(); }
    uText(a,x+12,y+20,`600 14px ${FB}`,UIC.text);
    if(!act) uText(suf.replace(/^\s*\(|\)\s*$/g,''),x+w-12,y+20,`600 13px ${FB}`,UIC.mut,'right');
    else if(on) uText('Press a key…',x+w-12,y+20,`700 13px ${FB}`,UIC.accL,'right');
    else { const kw=uKey(K(act),x+w-10,y+15,true); if(suf) uText(suf.trim(),x+w-18-kw,y+20,`500 12px ${FB}`,UIC.dim,'right'); }
    if(id) CT.rects.push({x,y,w,h:30,id}); y+=34; } return y; }
function twCtPadList(x,y,w){ const g=twPadGet(); uText(g?'● '+twPadShort(g.id)+' connected':'○ No controller yet: plug one in or pair it, then press any button',x,y,`600 13px ${FB}`,g?UIC.good:'#e8a060'); y+=14;
  for(const [a,b] of [['Left stick / D-pad','Move · menus'],['Right stick','Aim']]){ uRR(x,y,w,28,7); D.fillStyle='rgba(255,255,255,.03)'; D.fill(); uText(a,x+12,y+19,`600 13px ${FB}`,UIC.mut); uText(b,x+w-12,y+19,`600 13px ${FB}`,UIC.mut,'right'); y+=31; }
  for(let i=0;i<12;i++){ const id='pbtn:'+i, f=twCtFocused(id)||CT.drop===i; uRR(x,y,w,28,7); D.fillStyle=CT.drop===i?UIC.accD:f?'rgba(255,255,255,.08)':'rgba(255,255,255,.03)'; D.fill(); if(twPadOn()&&CT.focus===id){ D.strokeStyle='#fff'; D.lineWidth=1.5; D.stroke(); }
    twPadBadge(i,x+10,y+19); const a=PAD.map[i]; uText(twPadLabel(a),x+86,y+19,`700 13px ${FB}`,a?UIC.text:UIC.dim); uText('▾',x+w-12,y+19,`700 13px ${FB}`,UIC.mut,'right'); CT.rects.push({x,y,w,h:28,id}); y+=31; } return y; }
function twCtMech(x,y,w,yMax,mech){ for(const [a,b] of mech){ if(y>yMax) break; uText(a,x,y,`700 14px ${FB}`,UIC.accL); y+=18; const n=uWrap(b,x,y,w,17,`500 13px ${FB}`,'#c9ccd8'); y+=n*17+10; } }
function twCtPage(B,card){ const {keys,mech}=twControlsRows(), pad=twPadOn(); CT.rects=[];
  if(card){ // the card in town: one column, an X to close
    uPanel(B.x,B.y,B.w,B.h,UIC.panel,UIC.line2,12); uText('Controls',B.x+20,B.y+36,`800 20px ${FD}`,UIC.accL);
    const cx=B.x+B.w-46, cy=B.y+14; uRR(cx,cy,30,30,7); D.fillStyle=twCtFocused('x')?'rgba(255,255,255,.14)':'rgba(255,255,255,.06)'; D.fill(); uIcon('close',cx+15,cy+15,UIC.text); CT.rects.push({x:cx-4,y:cy-4,w:38,h:38,id:'x'});
    uSeg(B.x+20,B.y+54,B.w-40,32,[['mode:kbm','Keyboard & Mouse'],['mode:pad','Controller']],'mode:'+PAD.mode,false,CT.rects);
    let y=B.y+108; uCaps(pad?'BUTTONS':'KEYS',B.x+20,y,UIC.mut); uText(pad?'select one to change it':CT.listen?'press a key or mouse button':'click one to rebind it',B.x+B.w-20,y,`italic 500 12px ${FB}`,UIC.dim,'right'); y+=12;
    y=pad?twCtPadList(B.x+20,y+14,B.w-40):twCtKeysList(B.x+20,y,B.w-40,keys); y+=18; uCaps('HOW TO PLAY',B.x+20,y,UIC.mut); twCtMech(B.x+20,y+24,B.w-40,B.y+B.h-30,mech); return; }
  // the Esc menu tab: input switch on top, bindings on the left, how to play on the right
  uPanel(B.x,B.y,B.w,B.h,UIC.well,UIC.line,12); const L=B.x+28, top=B.y+26;
  uSeg(L,top,340,36,[['mode:kbm','Keyboard & Mouse'],['mode:pad','Controller']],'mode:'+PAD.mode,false,CT.rects);
  if(pad){ uSeg(L+356,top,240,36,[['glyph:ps','PlayStation'],['glyph:xb','Xbox']],'glyph:'+twPadSet(),false,CT.rects); uBtn(B.x+B.w-28-150,top,150,36,'Reset buttons',{id:'preset',rects:CT.rects,focus:twPadOn()&&CT.focus==='preset'}); }
  else uBtn(B.x+B.w-28-150,top,150,36,'Reset keys',{id:'kreset',rects:CT.rects});
  const lw=400, rx=L+lw+40; let y=top+70;
  uCaps(pad?'BUTTONS':'KEY BINDINGS',L,y,UIC.mut); uText(pad?(twPadName(0)+' changes · '+twPadName(1)+' back'):CT.listen?'Press a key or mouse button · click again to cancel':'Click a key to rebind it',L+lw,y,`italic 500 12px ${FB}`,UIC.dim,'right');
  if(pad) twCtPadList(L,y+22,lw); else twCtKeysList(L,y+12,lw,keys);
  D.fillStyle=UIC.line; D.fillRect(rx-20,top+60,1,B.h-100); uCaps('HOW TO PLAY',rx,y,UIC.mut); twCtMech(rx,y+28,B.x+B.w-28-rx,B.y+B.h-24,mech); }
twDrawControls=function(){ if(!CT.open) return; if(Game.state==='title'||Game.state==='end'){ twControlsHide(); return; }
  D.save(); let B;
  if(CT.fromMenu&&TLM.open) B={x:CONT.x,y:CONT.y,w:CONT.w,h:CONT.h};
  else { const {keys,mech}=twControlsRows(), w=400; D.font=`500 13px ${FB}`; const mh=mech.reduce((s,[a,b])=>s+18+wrap(b,w-40).length*17+10,0), lh=twPadOn()?14+2*31+12*31:keys.length*34;
    const h=Math.min(UH-24,108+12+lh+18+24+mh+10); B={x:CT.fromMenu?Math.round((UW-w)/2):UW-w-16,y:CT.fromMenu?Math.max(12,Math.round((UH-h)/2)):Math.min(64,UH-h-12),w,h}; }
  twCtPage(B,!(CT.fromMenu&&TLM.open)); D.restore(); CT.box=B; if(typeof twDrawPadDrop==='function') twDrawPadDrop(); };
twDrawPadControls=twDrawControls;
twDrawPadDrop=function(){ CT.drects=[]; if(CT.drop==null) return; const r=CT.rects.find(q=>q.id==='pbtn:'+CT.drop); if(!r){ CT.drop=null; return; }
  const n=PAD_ACTS.length, ih=26, dw=240, dh=n*ih+12, dx=r.x+r.w-dw; let dy=r.y+r.h+4; if(dy+dh>UH-8) dy=Math.max(8,r.y-dh-4);
  D.save(); D.shadowColor='rgba(0,0,0,.6)'; D.shadowBlur=18; uPanel(dx,dy,dw,dh,UIC.panel2,UIC.line2,10); D.restore(); D.save();
  PAD_ACTS.forEach((a,j)=>{ const oy=dy+6+j*ih, sel=CT.dropSel===j, cur=PAD.map[CT.drop]===a; if(sel){ uRR(dx+6,oy,dw-12,ih-2,6); D.fillStyle=UIC.accD; D.fill(); }
    uText((cur?'✓  ':'     ')+twPadLabel(a),dx+16,oy+17,`${cur?800:600} 13px ${FB}`,a?(sel?'#fff':UIC.text):UIC.mut); CT.drects.push({x:dx,y:oy,w:dw,h:ih,id:'popt:'+j}); });
  D.restore(); };
(function(){ const ca=twCardActivate; twCardActivate=function(id){ if(id==='kreset'){ Object.assign(BIND,BIND_DEF); twApplyBinds(); SAVE.settings.binds=Object.assign({},BIND); saveWrite(); for(const k in held) held[k]=false; clearHits(); Sound.sfx('select'); return; } return ca(id); }; })();

// ---------- top layer: cheat toasts, and voice on/off is remembered ----------
(function(){ if(SAVE.settings.voices===false) Voice.on=false;
  const du=drawUI; drawUI=function(){ du(); try{ const T=TW.cheatToast; if(T){ const age=(performance.now()-T.t)/1000; if(age>1.8) TW.cheatToast=null; else { D.save(); D.globalAlpha=Math.min(1,(1.8-age)*3,age*12); D.font=`800 18px ${FB}`; const w=D.measureText(T.text).width+56, x=(UW-w)/2, y=28;
          uRR(x,y,w,40,20); D.fillStyle='rgba(12,14,24,.94)'; D.fill(); D.strokeStyle=T.on?UIC.good:UIC.bad; D.lineWidth=2; D.stroke(); D.fillStyle=T.on?UIC.good:UIC.bad; D.beginPath(); D.arc(x+22,y+20,5,0,7); D.fill(); uText(T.text,x+36,y+26,`800 18px ${FB}`,UIC.text); D.restore(); } }
      if(SAVE.settings.voices!==!!Voice.on){ SAVE.settings.voices=!!Voice.on; saveWrite(); } }catch(e){ console.error('ui top',e); } }; })();

// ---------- dialogue choices: the mouse highlights the row under it, and clicking a row picks it ----------
function twChoiceAt(e){ const d=Game.dlg; if(!d||d.type!=='choice'||!Game.dlgRows||TLM.open) return -1; const [x,y]=tlPt(e); return Game.dlgRows.findIndex(([rx,ry,rw,rh])=>x>=rx&&x<=rx+rw&&y>=ry&&y<=ry+rh); }
ui.addEventListener('pointermove',e=>{ if(e.pointerType!=='mouse') return; const i=twChoiceAt(e); if(i>=0&&Game.dlg.sel!==i){ Game.dlg.sel=i; Sound.sfx('blip'); } });
ui.addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse'||e.button!==0) return; const i=twChoiceAt(e); if(i<0) return; e.preventDefault(); e.stopImmediatePropagation(); ui.focus(); Sound.unlock(); Game.dlg.sel=i; tapKey('confirm'); },true);
