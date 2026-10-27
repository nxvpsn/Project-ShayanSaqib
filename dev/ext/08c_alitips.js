// =====================================================================
// ALI'S CHAIN TIP: Ali hits hardest when he alternates his swing and Getsuga Tenshou. The names follow the
// player's own controls (rebound keys, the controller's buttons, or the touch buttons):
//   aliKey('attack'|'block'), aliSeq(sep) = "Left click → Right click → Left click → Right click".
// In a fight, a small chip above the bottom of the screen shows that sequence and lights the press that comes
// next (gold under the Getsugas that grow: ×1.5, ×1.7). It goes once the player has landed 3 Jujishous, and comes
// back for a few seconds whenever they fire two Getsugas in a row (the slow, weak one).
// =====================================================================
function aliKey(a){ if(typeof IS_TOUCH==='function'&&IS_TOUCH()) return a==='attack'?'Sword':'Getsuga';
  if(typeof twPadOn==='function'&&twPadOn()){ const i=PAD.map.indexOf(a); if(i>=0) return twPadName(i); } return K(a); }
function aliSeq(sep){ const a=aliKey('attack'), b=aliKey('block'); return [a,b,a,b].join(sep); }
const ALT={jj:0,mash:0,al:0};
(function(){ const cg=aliChainGetsuga; aliChainGetsuga=function(){ const P=Player, t0=P.gT; const r=cg.apply(this,arguments);
    try{ if(P.gT!==t0){ if(P.gTier===3) ALT.jj++; else if(P.gTier===0) ALT.mash=4; } }catch(e){} return r; }; })();
// the press that comes next in the 4-step loop: 0 swing, 1 Getsuga ×1.5, 2 swing, 3 Getsuga ×1.7
function aliNextStep(){ const P=Player, live=Game.time-(P.gT!=null?P.gT:-9)<1.6||P.comboT>0, t=P.gTier||0;
  if(P.gAct==='b') return live&&t===2?3:1; if(P.gAct==='g'&&live) return t===2?2:0; return 0; }
function aliTipShow(){ if(!ALI()||Game.state!=='play'||Game.script||Game.dlg||Game.mech||(typeof TLM!=='undefined'&&TLM.open)||Game.paulLock) return false;
  const fight=!!Game.boss||!!TW.fight||!!TW.giant||(TW.foes&&TW.foes.length>0)||MOBS.some(m=>m&&!m.dead&&(m.hp==null||m.hp>0)); return fight&&(ALT.jj<3||ALT.mash>0); }
function drawAliTip(){ const dt=1/60; ALT.mash=Math.max(0,ALT.mash-dt); ALT.al=clamp(ALT.al+(aliTipShow()?dt*4:-dt*3),0,1); if(ALT.al<=0) return;
  const a=aliKey('attack'), b=aliKey('block'), keys=[a,b,a,b], nx=aliNextStep(), pulse=.5+.5*Math.sin(performance.now()/130);
  D.save(); D.globalAlpha=ALT.al; D.font=`800 16px ${FB}`; const ws=keys.map(k=>Math.max(44,D.measureText(k).width+22)), gap=30, kw=ws.reduce((s,w)=>s+w,0)+gap*3, W=kw+40, H=ALT.mash>0?100:80, x0=Math.round(UW/2-W/2), y0=UH-138-H;
  uRR(x0,y0,W,H,12); D.fillStyle='rgba(12,14,24,.86)'; D.fill(); D.strokeStyle=ALT.mash>0?'rgba(255,90,110,.7)':'rgba(255,212,90,.35)'; D.lineWidth=1.5; D.stroke();
  uCaps('ALTERNATE',x0+20,y0+21,'#ffd45a',13);
  let x=x0+20; const ky=y0+30;
  keys.forEach((k,i)=>{ const w=ws[i], on=i===nx; uRR(x,ky,w,30,7); D.fillStyle=on?`rgba(255,212,90,${.75+.25*pulse})`:'rgba(255,255,255,.08)'; D.fill(); D.strokeStyle=on?'#ffe9a8':'rgba(255,255,255,.22)'; D.lineWidth=1; D.stroke();
    uText(k,x+w/2,ky+21,`800 16px ${FB}`,on?'#1a1408':'#e9e2cf','center');
    if(i%2) uText(i===1?'×1.5':'×1.7',x+w/2,ky+46,`800 13px ${FB}`,'#ffd45a','center');
    if(i<3) uText('→',x+w+gap/2,ky+21,`800 16px ${FB}`,'#8f95ab','center'); x+=w+gap; });
  if(ALT.mash>0) uText('Two Getsugas in a row are weak: swing in between',UW/2,y0+H-6,`700 14px ${FB}`,'#ff8a9a','center');
  D.restore(); }
(function(){ const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ drawAliTip(); }catch(e){ console.error('ali tip',e); } }; })();
