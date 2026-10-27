// =====================================================================
// VOLUME MIXER: All Sound, Music, SFX, Voices (0-100). 50 is the baseline the game is tuned to (each slider is a gain
// of value/50 on top of the game's own levels, so 100 doubles it). Saved in SAVE.settings.mix; the Options page and the
// phone menu draw the four sliders (mixSlider), controllers/arrows step them by 5, Enter resets one to 50.
// Music = the synth tracks and the boss songs (mp3s); SFX = every effect; Voices = spoken lines.
// =====================================================================
const MIX={all:50,music:50,sfx:50,voice:50}, MIX_KEYS=[['all','All Sound'],['music','Music'],['sfx','SFX'],['voice','Voices']];
(function(){ const m=SAVE.settings.mix; if(m&&typeof m==='object') for(const k in MIX){ const v=m[k]; if(typeof v==='number'&&isFinite(v)) MIX[k]=clamp(Math.round(v),0,100); } })();
function mixGain(k){ return MIX[k]/50; }
function mixApply(){ Sound.vol=mixGain('all'); if(!Sound.ctx) return; const t=Sound.ctx.currentTime;
  if(Sound.musicVol) Sound.musicVol.gain.setTargetAtTime(mixGain('music'),t,.05); if(Sound.sfxVol) Sound.sfxVol.gain.setTargetAtTime(mixGain('sfx'),t,.05); if(Sound.voiceVol) Sound.voiceVol.gain.setTargetAtTime(mixGain('voice'),t,.05);
  Sound.applyVol(); }
function mixSet(k,v){ MIX[k]=clamp(Math.round(v),0,100); if(k==='all'&&MIX.all>0&&Sound.muted){ Sound.muted=false; } SAVE.settings.mix=Object.assign({},MIX); SAVE.settings.vol=mixGain('all'); saveWrite(); mixApply(); try{ if(window.syncVolUI) syncVolUI(); }catch(e){} }
// the game's three buses each get a user gain stage before the master (the music's echo is rebuilt after its stage)
(function(){ const ul=Sound.unlock; Sound.unlock=function(){ const r=ul.apply(this,arguments); try{ if(this.ctx&&!this.musicVol){ const c=this.ctx;
      this.musicVol=c.createGain(); this.sfxVol=c.createGain(); this.voiceVol=c.createGain();
      this.music.disconnect(); this.music.connect(this.musicVol); this.musicVol.connect(this.master);
      const dl=c.createDelay(); dl.delayTime.value=.23; const fb=c.createGain(); fb.gain.value=.28; const wet=c.createGain(); wet.gain.value=.22; this.musicVol.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(this.master);
      this.sfxBus.disconnect(); this.sfxBus.connect(this.sfxVol); this.sfxVol.connect(this.master);
      this.voiceBus.disconnect(); this.voiceBus.connect(this.voiceVol); this.voiceVol.connect(this.master);
      this.musicVol.gain.value=mixGain('music'); this.sfxVol.gain.value=mixGain('sfx'); this.voiceVol.gain.value=mixGain('voice'); mixApply(); } }catch(e){ console.error('mix',e); } return r; };
  // the old single volume (base slider, 0-1) is All Sound
  Sound.setVol=function(v){ mixSet('all',clamp(v,0,1)*100); };
  Sound.vol=mixGain('all'); })();
// one slider row: label, track, value. Registers its track in TLV.mix[k] for dragging; foc = keyboard/controller focus
function mixSlider(k,x,y,w,o){ o=o||{}; const v=Sound.muted&&k==='all'?0:MIX[k]/100, B=TLV.mix[k]={x,y:y-(o.hh||16),w,h:(o.hh||16)*2};
  uRR(x,y-(o.th||3),w,(o.th||3)*2,o.th||3); D.fillStyle='rgba(255,255,255,.1)'; D.fill(); if(v>0){ uRR(x,y-(o.th||3),w*v,(o.th||3)*2,o.th||3); D.fillStyle=UIC.acc; D.fill(); }
  D.fillStyle='rgba(255,255,255,.35)'; D.fillRect(Math.round(x+w*.5)-1,y-(o.th||3)-4,2,(o.th||3)*2+8); /* the 50 baseline tick */
  D.fillStyle=TLV.mixDrag===k?'#fff':UIC.accL; D.beginPath(); D.arc(x+w*v,y,o.r||9,0,7); D.fill(); return B; }
(function(){ const sx=k=>{ const B=TLV.mix&&TLV.mix[k]; return B; };
  addEventListener('pointerdown',e=>{ if(!TLM.open||!TLV.mix) return; const [x,y]=tlPt(e); for(const k in TLV.mix){ const B=TLV.mix[k]; if(x>=B.x-12&&x<=B.x+B.w+12&&y>=B.y&&y<=B.y+B.h){ e.preventDefault(); e.stopImmediatePropagation(); Sound.unlock(); TLV.mixDrag=k; mixSet(k,(x-B.x)/B.w*100); return; } } },true);
  addEventListener('pointermove',e=>{ const k=TLV.mixDrag; if(!k) return; if(!TLM.open){ TLV.mixDrag=null; return; } const B=sx(k); if(B) mixSet(k,(tlPt(e)[0]-B.x)/B.w*100); },true);
  addEventListener('pointerup',()=>{ if(TLV.mixDrag){ TLV.mixDrag=null; Sound.sfx('blip'); } },true); })();
