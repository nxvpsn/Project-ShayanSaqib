// ---------- the caged cursor: in the top-down game a click locks the pointer inside the game, where it is drawn as a crosshair that can't leave the canvas ----------
// (a second monitor or the black bars beside the game used to catch it). Holding Alt lets it out until the next click; menus, dialogue, cutscenes and
// touch release it. Ali's Nathan fight keeps its own lock (59t: mouse-look, no cursor); this one stays out of it (tpsFight). The aim (08_aim) reads the caged point.
const CUR={x:0,y:0,on:0,alt:0};
function curCageOn(){ return !IS_TOUCH()&&Game.state==='play'&&!Game.script&&!Game.dlg&&!(typeof tpsFight==='function'&&tpsFight())&&!(typeof twPadOn==='function'&&twPadOn()); }
function curCageLocked(){ return CUR.on&&document.pointerLockElement===ui; }
function curCageLock(){ try{ if(curCageOn()&&!CUR.alt&&!document.pointerLockElement&&ui.requestPointerLock){ const r=ui.getBoundingClientRect(); CUR.x=AIM.x*r.width; CUR.y=AIM.y*r.height; CUR.want=1; ui.requestPointerLock(); } }catch(e){} }
function curCageFree(){ try{ if(curCageLocked()&&document.exitPointerLock) document.exitPointerLock(); }catch(e){} }
(function(){ try{
  document.addEventListener('pointerlockchange',()=>{ CUR.on=document.pointerLockElement===ui&&CUR.want?1:0; CUR.want=0; });
  document.addEventListener('mousemove',e=>{ if(!curCageLocked()) return; const r=ui.getBoundingClientRect(); CUR.x=Math.max(0,Math.min(r.width,CUR.x+(e.movementX||0))); CUR.y=Math.max(0,Math.min(r.height,CUR.y+(e.movementY||0))); });
  document.addEventListener('mousedown',e=>{ if(curCageOn()) curCageLock(); },{capture:true});
  document.addEventListener('keydown',e=>{ if(e.key==='Alt'&&curCageLocked()){ CUR.alt=1; curCageFree(); e.preventDefault(); } },{capture:true});
  document.addEventListener('keyup',e=>{ if(e.key==='Alt') CUR.alt=0; },{capture:true}); window.addEventListener('blur',()=>{ CUR.alt=0; });
  const ap=twAimPt; twAimPt=function(e){ if(curCageLocked()){ const r=ui.getBoundingClientRect(); AIM.x=CUR.x/Math.max(1,r.width); AIM.y=CUR.y/Math.max(1,r.height); AIM.on=true; return; } return ap.apply(this,arguments); }; /* under the lock the event's clientX is frozen: the caged point is the cursor */
  const du=drawUI; drawUI=function(){ du.apply(this,arguments); try{ if(!curCageLocked()) return; if(!curCageOn()){ curCageFree(); return; } twAimPt(null); AIM.t=performance.now();
      const x=AIM.x*UW, y=AIM.y*UH; D.save(); D.lineCap='round'; for(const [w,c] of [[4,'rgba(0,0,0,.7)'],[2,'#ffffff']]){ D.strokeStyle=c; D.lineWidth=w; D.beginPath(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ D.moveTo(x+dx*4,y+dy*4); D.lineTo(x+dx*11,y+dy*11); } D.stroke(); } D.restore(); }catch(e){ console.error('cursor cage',e); } };
}catch(e){ console.error('cursor cage setup',e); } })();
