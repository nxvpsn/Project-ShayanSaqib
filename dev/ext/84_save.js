// =====================================================================
// SAVE: one versioned entry in localStorage ('msSave') holds everything:
//   {v, progress:{done,unl,paulDone,met,last}, settings:{vol,binds,pad}}
// progress is null until a game has been started (that is what Continue checks).
// Older builds kept separate keys (msTimeline, msVol, msBinds, msPadMode/Map/Glyph):
// they are folded in once, then removed. A future layout change bumps SAVE_V and
// adds one step to SAVE_MIG, so old saves are upgraded instead of lost.
// =====================================================================
const SAVE_KEY='msSave', SAVE_V=1, SAVE_OLD=['msTimeline','msVol','msBinds','msPadMode','msPadMap','msPadGlyph'];
const SAVE_MIG={ /* 1:o=>{ ...; o.v=2; return o; } */ };
const SAVE=(function(){ let s=null, bad=false;
  try{ const raw=localStorage.getItem(SAVE_KEY);
    if(raw){ let o=JSON.parse(raw); while(o&&typeof o==='object'&&o.v<SAVE_V&&SAVE_MIG[o.v]) o=SAVE_MIG[o.v](o);
      if(o&&typeof o==='object'&&o.v===SAVE_V){ s=o; if(s.progress&&!(s.progress.done&&typeof s.progress.done==='object')){ s.progress=null; bad=true; } } else bad=true; } }catch(e){ bad=true; }
  if(!s){ s={v:SAVE_V,progress:null,settings:{}}; let any=false;
    try{ const g=k=>localStorage.getItem(k);
      const tl=JSON.parse(g('msTimeline')||'null'); if(tl&&tl.done){ s.progress=tl; any=true; }
      const vol=parseFloat(g('msVol')); if(!isNaN(vol)){ s.settings.vol=vol; any=true; }
      const b=JSON.parse(g('msBinds')||'null'); if(b&&typeof b==='object'){ s.settings.binds=b; any=true; }
      const pm=g('msPadMode'), pmap=JSON.parse(g('msPadMap')||'null'), pg=g('msPadGlyph'); if(pm||pmap||pg){ s.settings.pad={mode:pm==='pad'?'pad':'kbm',map:pmap,glyph:pg||''}; any=true; }
    }catch(e){}
    if(any){ try{ localStorage.setItem(SAVE_KEY,JSON.stringify(s)); SAVE_OLD.forEach(k=>localStorage.removeItem(k)); }catch(e){} } }
  if(!s.settings||typeof s.settings!=='object') s.settings={};
  Object.defineProperty(s,'bad',{value:bad,writable:true,enumerable:false}); return s; })();
function saveWrite(){ try{ localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE)); }catch(e){} }
function saveHas(){ return !!(SAVE.progress&&SAVE.progress.done); }
// ask the browser not to clear this site's storage on its own (Chrome decides quietly; Safari may still evict)
function savePersist(){ try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persist().catch(()=>{}); }catch(e){} }
// volume lives in the save too (the base game wrote its own key)
(function(){ const v=SAVE.settings.vol; if(typeof v==='number'&&isFinite(v)) Sound.vol=clamp(v,0,1);
  const sv=Sound.setVol; Sound.setVol=function(v){ const r=sv.apply(this,arguments); try{ localStorage.removeItem('msVol'); }catch(e){} SAVE.settings.vol=this.vol; saveWrite(); return r; }; })();
