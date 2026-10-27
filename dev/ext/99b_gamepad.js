// =====================================================================
// CONTROLLER SUPPORT (browser Gamepad API: USB or Bluetooth; PlayStation, Xbox and most pads in the "standard" layout)
// The Controls card has Keyboard / Mouse and Controller at the top; Controller turns the pad on (saved on this device).
// In the controller view every button (not the sticks or the D-pad) opens a drop-down of actions, Nothing included,
// and the bottom toggle switches PlayStation / Xbox glyphs. On-screen text names pad buttons through K() and twPadTx().
// Gameplay: buttons go through press()/release() like keys, the left stick feeds Stick (analog, like the touch stick),
// the right stick aims only while it is pushed (a reticle shows), otherwise facing / auto-aim applies as before.
// Menus (timeline, Controls card, drop-down, HTML panels) use fixed buttons: Cross/A picks, Circle/B goes back.
// Rumble: Full Counter / Judgement Cut, and whenever an enemy gets stunned.
// =====================================================================
// standard-layout button index -> action ('' = nothing). 0 Cross 1 Circle 2 Square 3 Triangle 4 L1 5 R1 6 L2 7 R2 8 Share 9 Options 10 L3 11 R3
const PAD_DEF=['jump','dash','','','','attack','special','block','','menu','','ff'];
const PAD_ACTS=['','jump','attack','block','dash','special','confirm','ff','pause','menu','voices','mute'];
const PAD_GLYPH={ps:['✕','◯','□','△','L1','R1','L2','R2','Share','Options','L3','R3'],xb:['A','B','X','Y','LB','RB','LT','RT','View','Menu','LS','RS']};
const PAD_COL={ps:['#7aa7ff','#ff6a6a','#e890d8','#4fd8a8'],xb:['#5fd86a','#ff5a5a','#5a9aff','#ffd040']};
const PAD={mode:'kbm',map:PAD_DEF.slice(),glyph:'',prev:[],as:[],dp:{},stick:false,nav:{},rep:{},rs:{ang:0,t:-1e9},last:-1e9,id:'',had:false,toast:null,hintT:-1e9,talk:false};
try{ const sp=SAVE.settings.pad||{}; if(sp.mode==='pad') PAD.mode='pad'; const sv=sp.map;
  if(Array.isArray(sv)&&sv.length===12) PAD.map=sv.map(a=>PAD_ACTS.includes(a)?a:''); const g=sp.glyph; if(g==='ps'||g==='xb') PAD.glyph=g; }catch(e){}
const PAD_TXC=new Map();
function twPadSave(){ SAVE.settings.pad={mode:PAD.mode,map:PAD.map.slice(),glyph:PAD.glyph||''}; saveWrite(); PAD_TXC.clear(); }
function twPadOn(){ return PAD.mode==='pad'; }
// glyphs: the toggle wins; until it is used, Xbox pads get Xbox names and everything else PlayStation ones
function twPadSet(){ return PAD.glyph||(/xbox|xinput|045e/i.test(PAD.id)?'xb':'ps'); }
function twPadName(i){ return PAD_GLYPH[twPadSet()][i]; }
function twPadLabel(a){ const ali=ALI(); return {'':'Nothing',jump:'Jump / confirm',attack:'Attack',block:ali?'Getsuga Tenshou':'Fireball (magic)',dash:ali?'Teleport':'Dash',special:'Special',confirm:'Talk / advance',ff:'Fast-forward (hold)',pause:'Pause',menu:'Menu / timeline',voices:'Voices on / off',mute:'Mute'}[a]; }
function twPadShort(id){ id=String(id||''); if(/dualsense/i.test(id)||/054c.*0ce6/i.test(id)) return 'DualSense (PS5)'; if(/054c/i.test(id)||/wireless controller/i.test(id)) return 'DualShock 4 (PS4)';
  if(/xbox|xinput|045e/i.test(id)) return 'Xbox controller'; return id.replace(/\s*\(.*$/,'').slice(0,40)||'Controller'; }
// K('act') names the pad button while the controller is on (Jump also talks, so Talk falls back to it)
(function(){ const k0=K; K=function(act){ if(!twPadOn()) return k0(act); const i=PAD.map.indexOf(act); if(i>=0) return twPadName(i);
    if(act==='confirm'){ const j=PAD.map.indexOf('jump'); if(j>=0) return twPadName(j); } return '—'; }; })();
function twPadToast(text){ PAD.toast={text,t:performance.now()}; }

// ---------- reading the pad ----------
function twPadGet(){ let gs=null; try{ gs=navigator.getGamepads?navigator.getGamepads():null; }catch(e){} if(!gs) return null; let best=null;
  for(const g of gs){ if(!g||g.connected===false||!g.buttons) continue; if(!best||(g.timestamp||0)>(best.timestamp||0)) best=g; } return best; }
function twPadBtn(g,i){ const b=g.buttons[i]; if(b==null) return false; if(typeof b!=='object') return b>.5; return !!b.pressed||(b.value||0)>(i===6||i===7?.3:.5); }
function twPadDz(x,y,d){ x=+x||0; y=+y||0; const m=Math.hypot(x,y); if(m<d) return [0,0,0]; const k=Math.min(1,(m-d)/(1-d)); return [x/m*k,y/m*k,k]; }
function twPadReleaseAll(){ for(let i=0;i<PAD.as.length;i++) if(PAD.as[i]) release(PAD.as[i]); PAD.as=[]; for(const d in PAD.dp) if(PAD.dp[d]){ release(d); PAD.dp[d]=false; }
  if(PAD.stick){ Stick.x=Stick.z=0; PAD.stick=false; } }
addEventListener('gamepadconnected',e=>{ try{ PAD.id=e.gamepad.id; PAD_TXC.clear(); twPadToast(twPadOn()?'🎮 '+twPadShort(PAD.id)+' connected':'🎮 Controller found · '+K('menu')+' → Controls → Controller to use it'); }catch(_){} });
addEventListener('gamepaddisconnected',()=>{ twPadReleaseAll(); if(twPadOn()) twPadToast('Controller disconnected'); });

// where the pad's buttons go right now
function twPadCtx(){ if(CT.open&&CT.drop!=null) return 'drop'; if(CT.open&&CT.fromMenu) return 'card'; if(TLM.open) return 'tl';
  if(typeof MP!=='undefined'&&MP.ui&&MP.ui.querySelectorAll) return 'dom'; return 'game'; }
function twPadPoll(){ const g=twPadGet(), now=performance.now();
  if(!g){ if(PAD.had){ PAD.had=false; twPadReleaseAll(); PAD.prev=[]; } return; }
  if(!PAD.had||g.id!==PAD.id){ PAD.had=true; if(g.id!==PAD.id){ PAD.id=g.id; PAD_TXC.clear(); } }
  const cur=[]; for(let i=0;i<16;i++) cur[i]=twPadBtn(g,i); const dn=i=>cur[i]&&!PAD.prev[i];
  if(!twPadOn()){ // keyboard mode: the pad does nothing, but say how to turn it on
    if(cur.some((c,i)=>c&&!PAD.prev[i])&&now-PAD.hintT>15000){ PAD.hintT=now; twPadToast('🎮 Controller found · '+K('menu')+' → Controls → Controller to use it'); }
    PAD.prev=cur; return; }
  const ax=g.axes||[], [lx,lz,lm]=twPadDz(ax[0],ax[1],.18), [rx,rz,rm]=twPadDz(ax[2],ax[3],.3);
  if(cur.some(Boolean)||lm>0||rm>0){ PAD.last=now; try{ if(ui.style.cursor!=='none') ui.style.cursor='none'; }catch(e){} }
  // menu steps from the D-pad or the left stick, repeating while held
  const want={up:cur[12]||lz<-.55,down:cur[13]||lz>.55,left:cur[14]||lx<-.55,right:cur[15]||lx>.55}, nav={};
  for(const d in want){ if(want[d]){ if(!PAD.nav[d]){ nav[d]=true; PAD.rep[d]=now+380; } else if(now>=PAD.rep[d]){ nav[d]=true; PAD.rep[d]=now+110; } } PAD.nav[d]=want[d]; }
  const ctx=twPadCtx();
  if(ctx!=='game'){ twPadReleaseAll(); PAD.rs.t=-1e9; twPadMenu(ctx,nav,dn); PAD.prev=cur; return; }
  // gameplay
  for(let i=0;i<12;i++){ if(dn(i)) twPadDown(i); else if(!cur[i]&&PAD.prev[i]) twPadUp(i); }
  const dirs=[['up',12],['down',13],['left',14],['right',15]];
  for(const [d,i] of dirs){ if(cur[i]&&!PAD.dp[d]){ press(d); PAD.dp[d]=true; } else if(!cur[i]&&PAD.dp[d]){ release(d); PAD.dp[d]=false; } }
  if(lm>0){ Stick.x=lx; Stick.z=lz; PAD.stick=true; for(const d of ['up','down','left','right']) if(nav[d]&&!cur[{up:12,down:13,left:14,right:15}[d]]) hit[d]=true; }
  else if(PAD.stick){ Stick.x=Stick.z=0; PAD.stick=false; }
  if(rm>0){ PAD.rs.ang=Math.atan2(rz,rx); PAD.rs.t=now; }
  twPadStuns();
  PAD.prev=cur; }
function twPadDown(i){ let a=PAD.map[i]; Sound.unlock();
  if(!a){ if(i===8&&TW.tut&&!TW.tut.leaving){ Sound.sfx('select'); twTutLeave(false); } return; } // an unbound Share leaves the tutorial (its button shows the glyph)
  if(a==='menu'){ if(twEscOk()) twEscOpen(); else { press('pause'); PAD.as[i]='pause'; } return; }
  if(a==='voices'){ Voice.on=!Voice.on; if(!Voice.on) Voice.stop(); Game.banner={name:Voice.on?'Voices on':'Voices off',sub:'',t:1.6,small:1}; return; }
  if(a==='jump'){ const st=Game.state; // Jump is also "confirm": on the pause / death / end screens, and next to someone to talk to
    if(st==='paused'||st==='dead'||st==='end') a='confirm';
    else if(st==='play'&&!Game.dlg&&!Game.script&&!Game.clash&&!Game.mech&&nearestTalk()) a='confirm'; }
  press(a); PAD.as[i]=a; }
function twPadUp(i){ const a=PAD.as[i]; if(a){ release(a); PAD.as[i]=null; } }

// ---------- menus ----------
function twPadMenu(ctx,nav,dn){
  if(ctx==='drop'){ const n=PAD_ACTS.length; if(nav.up){ CT.dropSel=(CT.dropSel+n-1)%n; Sound.sfx('blip'); } if(nav.down){ CT.dropSel=(CT.dropSel+1)%n; Sound.sfx('blip'); }
    if(dn(0)) twCardActivate('popt:'+CT.dropSel); else if(dn(1)||dn(9)){ CT.drop=null; Sound.sfx('blip'); } return; }
  if(ctx==='card'){ if(nav.up) twCardNav(0,-1); if(nav.down) twCardNav(0,1); if(nav.left) twCardNav(-1,0); if(nav.right) twCardNav(1,0);
    if(dn(0)&&CT.focus) twCardActivate(CT.focus); else if(dn(1)){ twControlsHide(); Sound.sfx('blip'); } else if(dn(9)){ twControlsHide(); if(TLM.open) twTimelineClose(null); } return; }
  if(ctx==='tl'){ if(nav.left) tlMove(-1,0); if(nav.right) tlMove(1,0); if(nav.up) tlMove(0,-1); if(nav.down) tlMove(0,1);
    if(dn(0)) tlActivate('warp');
    else if(dn(1)||dn(9)) twTimelineClose(null);
    else if(dn(3)){ if(CT.open&&!CT.fromMenu){ CT.fromMenu=true; CT.focus='mode:pad'; Sound.sfx('blip'); } else tlActivate('controls'); }
    else if(dn(4)||dn(5)) tlTab(TLM.tab+(dn(5)?1:-1));
    else if(dn(6)||dn(7)){ Sound.unlock(); mixSet('all',MIX.all+(dn(7)?5:-5)); Sound.sfx('blip'); }
    else if(dn(8)) tlActivate('title');
    return; }
  if(ctx==='dom'){ const d=MP.ui, els=[...d.querySelectorAll('button,input')]; if(!els.length) return; let i=els.indexOf(document.activeElement);
    const go=k=>{ i=(i<0?(k>0?-1:0):i)+k; i=(i+els.length)%els.length; try{ els[i].focus(); }catch(e){} Sound.sfx('blip'); };
    if(nav.down||nav.right) go(1); if(nav.up||nav.left) go(-1);
    if(dn(0)){ const el=els[Math.max(0,i)]; if(el.tagName==='INPUT') el.focus(); else el.click(); }
    else if(dn(1)){ const b=d.querySelector('#mpBack,#tmBack')||els.find(e=>/back|cancel|close/i.test(e.textContent||'')); if(b) b.click(); } } }
try{ const st=document.createElement('style'); st.textContent='#mpPanel button:focus,#mpPanel input:focus{outline:3px solid #ffe6b0;outline-offset:2px}'; document.head.appendChild(st); }catch(e){}

// ---------- the Controls card: shared pieces ----------
function twCtFocused(id){ return (twPadOn()&&CT.focus===id)||CT.hoverId===id; }
function twCtBtn(x,y,w,h,label,on,id){ const f=twCtFocused(id); D.fillStyle=on?'rgba(110,80,30,.95)':'rgba(30,22,16,.9)'; D.fillRect(x,y,w,h);
  D.strokeStyle=f?'#ffffff':on?'#e8c070':'#8a6a3a'; D.lineWidth=f?3:2; D.strokeRect(x+1.5,y+1.5,w-3,h-3);
  D.font=`700 14px ${FB}`; D.fillStyle=on?'#fff4d6':'#cdb48a'; D.textAlign='center'; D.fillText(label,x+w/2,y+h/2+5); D.textAlign='left'; CT.rects.push({x,y,w,h,id}); }
function twCtModeRow(x,y,w){ const bw=(w-10)/2; twCtBtn(x,y,bw,30,'Keyboard / Mouse',!twPadOn(),'mode:kbm'); twCtBtn(x+bw+10,y,bw,30,'🎮 Controller',twPadOn(),'mode:pad'); }
// a pad button drawn as a badge; returns its width
function twPadBadge(i,x,y){ const s=twPadSet(), t=PAD_GLYPH[s][i]; D.save(); D.font=`800 12px ${FB}`; D.textAlign='center';
  if(i<4){ D.fillStyle='rgba(20,18,30,.95)'; D.beginPath(); D.arc(x+10,y-4,10,0,7); D.fill(); D.strokeStyle=PAD_COL[s][i]; D.lineWidth=2; D.stroke(); D.fillStyle=PAD_COL[s][i]; D.fillText(t,x+10,y); D.restore(); return 20; }
  const w=Math.max(24,D.measureText(t).width+12); D.fillStyle='rgba(20,18,30,.95)'; D.fillRect(x,y-14,w,20); D.strokeStyle='#b8a888'; D.lineWidth=1.5; D.strokeRect(x+.5,y-13.5,w-1,19); D.fillStyle='#efe8d6'; D.fillText(t,x+w/2,y); D.restore(); return w; }
function twCardNav(dx,dy){ const R=CT.rects, cur=R.find(r=>r.id===CT.focus); if(!cur){ CT.focus=(R.find(r=>r.id==='mode:'+PAD.mode)||R[0]||{}).id||null; return; }
  const cx=cur.x+cur.w/2, cy=cur.y+cur.h/2; let best=null,bd=1e9;
  for(const r of R){ if(r===cur) continue; const vx=r.x+r.w/2-cx, vy=r.y+r.h/2-cy, along=vx*dx+vy*dy; if(along<=2) continue; const d=along+Math.abs(vx*dy-vy*dx)*(dy?.6:2.2); if(d<bd){ bd=d; best=r; } }
  if(best){ CT.focus=best.id; Sound.sfx('blip'); } }
function twPadSetMode(m){ if(PAD.mode===m) return; PAD.mode=m; twPadReleaseAll(); for(const k in held) held[k]=false; clearHits(); twPadSave(); CT.focus='mode:'+m; CT.drop=null;
  try{ ui.style.cursor='crosshair'; }catch(e){}
  twPadToast(m==='pad'?(twPadGet()?'🎮 Controller on · '+twPadShort(PAD.id):'🎮 Controller on · connect one (USB or Bluetooth) and press any button'):'Controller off · keyboard and mouse'); }
function twCardActivate(id){ if(!id) return;
  if(id==='x'){ twControlsHide(); Sound.sfx('blip'); return; }
  if(id.startsWith('bind:')){ CT.listen=id.slice(5); Sound.sfx('blip'); return; }
  if(id.startsWith('mode:')){ twPadSetMode(id.slice(5)); Sound.sfx('select'); return; }
  if(id.startsWith('glyph:')){ PAD.glyph=id.slice(6); twPadSave(); Sound.sfx('select'); return; }
  if(id.startsWith('pbtn:')){ const i=+id.slice(5); CT.drop=i; CT.dropSel=Math.max(0,PAD_ACTS.indexOf(PAD.map[i])); Sound.sfx('blip'); return; }
  if(id.startsWith('popt:')){ const i=CT.drop; if(i!=null){ PAD.map[i]=PAD_ACTS[+id.slice(5)]; twPadReleaseAll(); twPadSave(); } CT.drop=null; Sound.sfx('select'); return; }
  if(id==='preset'){ PAD.map=PAD_DEF.slice(); twPadReleaseAll(); twPadSave(); Sound.sfx('select'); return; } }

// ---------- the Controls card: controller view ----------
function twDrawPadControls(){ const {mech}=twControlsRows(), w=500, pad=18, tw=w-pad*2; CT.rects=[];
  D.save(); D.font=`500 13px ${FB}`; const mLines=mech.map(([a,b])=>wrap(a+': '+b,tw)), foot=50;
  const h0=96+22+20+14*19+8+17+mLines.reduce((s,l)=>s+l.length*15+3,0)+foot;
  const h=Math.min(UH-24,h0), x=CT.fromMenu?Math.round((UW-w)/2):UW-w-16, y=CT.fromMenu?Math.max(12,Math.round((UH-h)/2)):Math.min(64,UH-h-12);
  twCtShell(x,y,w,h); twCtModeRow(x+pad,y+50,tw);
  let yy=y+100; const g=twPadGet(); D.font=`600 12px ${FB}`; D.fillStyle=g?'#8fe0a0':'#e8a060';
  D.fillText(g?'● '+twPadShort(g.id)+' connected':'○ No controller yet. Plug one in or pair it by Bluetooth, then press any button.',x+pad,yy); yy+=22;
  D.font=`700 11px ${FB}`; D.fillStyle='#a8906a'; D.fillText('BUTTONS',x+pad,yy); D.font=`italic 500 12px ${FB}`;
  D.fillText(twPadOn()?'Select a button to change it  ·  '+twPadName(0)+' picks  ·  '+twPadName(1)+' back':'Click a button to change it',x+pad+66,yy);
  twCtBtn(x+w-pad-74,yy-14,74,19,'Defaults',false,'preset'); yy+=20;
  for(const [a,b] of [['Left stick / D-pad','Move  ·  navigate menus'],['Right stick','Aim (the cursor only shows while you push it)']]){ D.font=`700 13px ${FB}`; D.fillStyle='#d8b46a'; D.fillText(a,x+pad,yy); D.font=`500 13px ${FB}`; D.fillStyle='#9a9080'; D.fillText(b,x+pad+150,yy); yy+=19; }
  for(let i=0;i<12;i++){ const id='pbtn:'+i, ry=yy-14, f=twCtFocused(id)||CT.drop===i;
    if(f){ D.fillStyle=CT.drop===i?'rgba(232,192,112,.28)':'rgba(232,192,112,.13)'; D.fillRect(x+pad-6,ry,w-pad*2+12,19); if(twPadOn()&&CT.focus===id){ D.strokeStyle='#ffe6b0'; D.lineWidth=1.5; D.strokeRect(x+pad-6,ry,w-pad*2+12,19); } }
    CT.rects.push({x:x+pad-6,y:ry,w:w-pad*2+12,h:19,id}); twPadBadge(i,x+pad,yy);
    const a=PAD.map[i]; D.font=`700 13px ${FB}`; D.fillStyle=a?'#ffe6b0':'#7a7060'; D.fillText(twPadLabel(a),x+pad+150,yy); D.fillStyle='#a8906a'; D.textAlign='right'; D.fillText('▾',x+w-pad,yy); D.textAlign='left'; yy+=19; }
  yy+=8; D.font=`700 11px ${FB}`; D.fillStyle='#a8906a'; D.fillText('MECHANICS',x+pad,yy); yy+=17;
  mech.forEach(([a],i)=>{ D.font=`500 13px ${FB}`; mLines[i].forEach((ln,j)=>{ if(yy>y+h-foot) return;
      if(j===0){ const lab=a+':'; D.font=`700 13px ${FB}`; D.fillStyle='#d8b46a'; D.fillText(lab,x+pad,yy); const lw=D.measureText(lab+' ').width; D.font=`500 13px ${FB}`; D.fillStyle='#efe8d6'; D.fillText(ln.slice(lab.length+1),x+pad+lw,yy); }
      else { D.fillStyle='#efe8d6'; D.fillText(ln,x+pad,yy); } yy+=15; }); yy+=3; });
  // bottom: glyph style
  const by=y+h-foot+10, bw=(tw-80-10)/2; D.font=`700 11px ${FB}`; D.fillStyle='#a8906a'; D.fillText('GLYPHS',x+pad,by+19);
  twCtBtn(x+pad+80,by,bw,28,'PlayStation',twPadSet()==='ps','glyph:ps'); twCtBtn(x+pad+90+bw,by,bw,28,'Xbox',twPadSet()==='xb','glyph:xb');
  D.restore(); CT.box={x,y,w,h}; twDrawPadDrop(); }
function twDrawPadDrop(){ CT.drects=[]; if(CT.drop==null) return; const r=CT.rects.find(q=>q.id==='pbtn:'+CT.drop); if(!r){ CT.drop=null; return; }
  const n=PAD_ACTS.length, ih=21, dw=230, dh=n*ih+10, dx=r.x+r.w-dw; let dy=r.y+r.h+2; if(dy+dh>UH-8) dy=Math.max(8,r.y-dh-2);
  D.save(); D.fillStyle='rgba(18,14,10,.98)'; D.fillRect(dx,dy,dw,dh); D.strokeStyle='#e8c070'; D.lineWidth=2; D.strokeRect(dx+1,dy+1,dw-2,dh-2);
  PAD_ACTS.forEach((a,j)=>{ const oy=dy+5+j*ih, sel=CT.dropSel===j, cur=PAD.map[CT.drop]===a; if(sel){ D.fillStyle='rgba(232,192,112,.3)'; D.fillRect(dx+4,oy,dw-8,ih); }
    D.font=`${cur?800:600} 13px ${FB}`; D.fillStyle=a?(sel?'#ffffff':'#efe8d6'):'#a89a80'; D.fillText((cur?'✓ ':'   ')+twPadLabel(a),dx+12,oy+15); CT.drects.push({x:dx,y:oy,w:dw,h:ih,id:'popt:'+j}); });
  D.restore(); }

// ---------- on-screen text: name pad buttons instead of keys while the controller is on ----------
const PAD_TX=[
  [/^Click or press E to /,()=>'Press '+K('jump')+' to '],[/^(Esc|—) to resume$/,()=>'Press '+K('jump')+' to resume'],
  [/W \/ S or mouse to choose  ·  E, Enter or click to start/,()=>'D-pad or left stick to choose  ·  '+K('jump')+' to start'],
  [/\(W \/ S, then E or click\)/,()=>'(D-pad, then '+K('jump')+')'],[/Shift \/ K \/ C/,()=>K('dash')],
  [/WASD or arrow keys/,()=>'Left stick or D-pad'],[/aim with the mouse/,()=>'aim with the right stick'],
  [/^WASD  move    Space  jump/,()=>'Left stick  move    '+K('jump')+'  jump'],[/^WASD  fly/,()=>'Left stick  fly'],[/^Mouse  aim/,()=>'Right stick  aim'],
  [/^Shift  dash    Q  special    E  talk    P  pause$/,()=>K('dash')+'  dash    '+K('special')+'  special    '+K('confirm')+'  talk'],
  [/^Hold F  fast-forward dialogue    Esc  timeline$/,()=>'Hold '+K('ff')+'  fast-forward dialogue    '+K('menu')+'  timeline'],
  [/^Shift  quickboost/,()=>K('dash')+'  quickboost'],[/^Q  True/,()=>K('special')+'  True'],[/Shift: blink/,()=>K('dash')+': blink'],
  [/LEFT CLICK/g,()=>K('attack').toUpperCase()],[/RIGHT CLICK/g,()=>K('block').toUpperCase()],[/[Ll]eft click/g,()=>K('attack')],[/[Rr]ight click/g,()=>K('block')]];
// the Special hints were written with a fixed Q: they follow the Special binding (key or pad button) in both modes
const PAD_TXQ=[[/ · Q$/,()=>' · '+K('special')],[/^Full meter \(Q\)/,()=>'Full meter ('+K('special')+')'],[/^Q when the blue gauge/,()=>K('special')+' when the blue gauge'],
  [/    Q  special    /,()=>'    '+K('special')+'  special    '],[/^Q  True/,()=>K('special')+'  True']];
const PAD_QRE=/ · Q$|^Full meter \(Q\)|^Q when|    Q  special|^Q  True/;
function twPadTx(s){ let r=PAD_TXC.get(s); if(r!==undefined) return r; r=s;
  if(PAD.mode==='pad'&&/click|CLICK|WASD|Esc|Shift|Mouse|mouse|W \/ S|press E|^Q  |^Hold F|^— to/.test(s)) for(const [re,to] of PAD_TX) r=r.replace(re,to);
  if(PAD_QRE.test(r)) for(const [re,to] of PAD_TXQ) r=r.replace(re,to);
  if(PAD_TXC.size>3000) PAD_TXC.clear(); PAD_TXC.set(s,r); return r; }
(function(){ for(const m of ['fillText','strokeText']){ const f=D[m]; if(typeof f!=='function') continue;
    D[m]=function(s,x,y,mw){ if(typeof s==='string'&&(PAD.mode==='pad'||s.indexOf('Q')>=0)) s=PAD.talk&&s==='E'&&PAD.mode==='pad'?K('confirm'):twPadTx(s); return mw===undefined?f.call(this,s,x,y):f.call(this,s,x,y,mw); }; } })();
// a keyboard rebind changes K(), so cached hint text is stale
(function(){ const sb=twSetBind; twSetBind=function(){ PAD_TXC.clear(); return sb.apply(this,arguments); }; })();
(function(){ const tp=drawTalkPrompt; drawTalkPrompt=function(){ PAD.talk=true; try{ return tp.apply(this,arguments); } finally{ PAD.talk=false; } }; })();
// the timeline: a pad version of its key hint, and the button for each of its own buttons
(function(){ const tw0=tlWrap; tlWrap=function(text){ if(twPadOn()&&/^Arrows select/.test(text)){ const n=twPadName; text='D-pad selects · '+n(0)+' warps · '+n(4)+' / '+n(5)+' tab · '+n(6)+' / '+n(7)+' volume · '+n(3)+' controls · '+n(1)+' closes'; arguments[0]=text; } return tw0.apply(this,arguments); };
  const TLB={close:1,controls:3,title:8,warp:0};
  const tb=tlBtn; tlBtn=function(x,y,w,h,label,on,id){ tb.apply(this,arguments); if(twPadOn()&&TLB[id]!=null) twPadBadge(TLB[id],x-4,y+6); }; })();
// the tutorial's Leave button shows Share while Share is free
(function(){ const dt=twDrawTut; twDrawTut=function(){ dt.apply(this,arguments); if(twPadOn()&&TW.tut&&Game.state!=='title'&&!PAD.map[8]) twPadBadge(8,TUT_BTN.x-6,TUT_BTN.y+6); }; })();
// opening the menu tucks away the town copy of the card (the menu's own Controls button brings it back, focused)
(function(){ const eo=twEscOpen; twEscOpen=function(){ if(twPadOn()&&CT.open&&!CT.fromMenu&&PAD.last>performance.now()-500) twControlsHide(); return eo.apply(this,arguments); }; })();

// ---------- aim: the right stick only while it is pushed; otherwise the mouse (if it moved last) or the old facing / auto-aim ----------
(function(){ const aa=twAimAng; twAimAng=function(){ if(twPadOn()){ const now=performance.now();
      if(now-PAD.rs.t<300) return Game.mech||Game.paulLock||Game.state!=='play'?null:PAD.rs.ang;
      if(PAD.last>Math.max(AIM.t,AIM.click)) return null; }
    return aa.apply(this,arguments); }; })();
ui.addEventListener('pointermove',e=>{ if(e.pointerType==='mouse'&&twPadOn()) try{ if(ui.style.cursor==='none') ui.style.cursor='crosshair'; }catch(_){} });
function twDrawPadAim(){ if(!twPadOn()||Game.state!=='play'||Game.mech||TLM.open) return; const k=1-(performance.now()-PAD.rs.t)/300; if(k<=0) return;
  const P=Player, a=PAD.rs.ang, [sx,sy,z]=toScreen(P.x+Math.cos(a)*3.4,P.y+1,P.z+Math.sin(a)*3.4); if(!(z<1)) return;
  D.save(); D.globalAlpha=Math.min(1,k*2); D.strokeStyle='#ffe6b0'; D.lineWidth=2.5; D.beginPath(); D.arc(sx,sy,13,0,7); D.stroke();
  D.beginPath(); D.moveTo(sx-20,sy); D.lineTo(sx-7,sy); D.moveTo(sx+7,sy); D.lineTo(sx+20,sy); D.moveTo(sx,sy-20); D.lineTo(sx,sy-7); D.moveTo(sx,sy+7); D.lineTo(sx,sy+20); D.stroke(); D.restore(); }
function twDrawPadToast(){ const T=PAD.toast; if(!T) return; const age=(performance.now()-T.t)/1000; if(age>4){ PAD.toast=null; return; }
  D.save(); D.globalAlpha=Math.min(1,(4-age)*2); D.font=`700 15px ${FB}`; const w=D.measureText(T.text).width+40, x=(UW-w)/2, y=14;
  D.fillStyle='rgba(12,10,20,.92)'; D.fillRect(x,y,w,34); D.strokeStyle='#c9a24a'; D.lineWidth=2; D.strokeRect(x+1,y+1,w-2,32); D.fillStyle='#ffe6b0'; D.textAlign='center'; D.fillText(T.text,UW/2,y+22); D.restore(); }
(function(){ const du=drawUI; drawUI=function(){ du(); try{ twDrawPadAim(); twDrawPadToast(); }catch(e){ console.error('pad ui',e); } }; })();

// ---------- rumble: Full Counter, Judgement Cut, and every fresh stun ----------
function twRumble(ms,strong,weak){ if(!twPadOn()) return; const g=twPadGet(); if(!g) return;
  try{ const a=g.vibrationActuator; if(a&&a.playEffect){ const p=a.playEffect('dual-rumble',{startDelay:0,duration:ms,strongMagnitude:strong,weakMagnitude:weak}); if(p&&p.catch) p.catch(()=>{}); }
    else if(g.hapticActuators&&g.hapticActuators[0]&&g.hapticActuators[0].pulse) g.hapticActuators[0].pulse(strong,ms); }catch(e){} }
function twPadStuns(){ const L=[]; for(const T of TW.foes||[]) L.push([T,T.stun>0]); if(TW.giant) L.push([TW.giant,TW.giant.stun>0]);
  if(typeof NB!=='undefined'&&NB) L.push([NB,!!NB.stunned]); if(Game.boss) L.push([Game.boss,Game.boss.state==='stagger']);
  for(const [o,s] of L){ if(s&&!o._padSt) twRumble(420,.75,.55); o._padSt=s; } }
(function(){ const mh=meleeHits; meleeHits=function(){ const any=mh.apply(this,arguments), A=Player.atk; if(A&&A.big&&A.boomed&&!A._rum){ A._rum=1; twRumble(650,1,1); } return any; };
  const jc=twMiniJC; twMiniJC=function(){ twRumble(700,1,1); return jc.apply(this,arguments); }; })();

// ---------- every frame, before the game reads its input ----------
(function(){ const lp=loop; loop=function(){ try{ twPadPoll(); }catch(e){ console.error('pad',e); } return lp.apply(this,arguments); }; })();
