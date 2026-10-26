// =====================================================================
// OMAR'S AND CAOTAN'S SONGS: mp3s next to index.html (audio/), played through the game's master volume, so the volume slider and M still work.
// Omar: one song (Song of Healing, reversed) for the whole fight. Caotan: sections per phase (below).
// A track name 'mp3:<song>:<seconds>' starts that song at that point; any other track (or Sound.stop) fades it out.
// =====================================================================
const TW_SONG={omar:'audio/omar.mp3',caotan:'audio/caotan.mp3'};
const TW_SONG_VOL=.5; // the song's level under the game's master volume (was .75: too loud)
const MP3={el:null,g:null,name:null,want:null,seek:null};
function twMp3Ready(){ if(MP3.g) return true; if(!Sound.ctx||typeof Audio==='undefined') return false;
  try{ const el=new Audio(); el.loop=true; el.preload='auto'; const src=Sound.ctx.createMediaElementSource(el), g=Sound.ctx.createGain(); g.gain.value=0; src.connect(g); g.connect(Sound.master);
    el.addEventListener('loadedmetadata',()=>{ if(MP3.seek!=null){ try{ el.currentTime=MP3.seek; }catch(e){} MP3.seek=null; } }); MP3.el=el; MP3.g=g; }catch(e){ return false; } return true; }
function twMp3Play(name,at){ MP3.want={name,at}; if(!twMp3Ready()) return; const el=MP3.el, c=Sound.ctx, g=MP3.g.gain;
  if(MP3.name!==name){ MP3.name=name; MP3.seek=at||0; el.src=TW_SONG[name]; } else if(at!=null){ if(el.readyState>=1){ try{ el.currentTime=at; }catch(e){} } else MP3.seek=at; }
  const p=el.play(); if(p&&p.catch) p.catch(()=>{}); g.cancelScheduledValues(c.currentTime); g.setValueAtTime(g.value,c.currentTime); g.linearRampToValueAtTime(TW_SONG_VOL,c.currentTime+.6); }
function twMp3Stop(){ MP3.want=null; if(!MP3.g) return; const c=Sound.ctx, g=MP3.g.gain, el=MP3.el; g.cancelScheduledValues(c.currentTime); g.setValueAtTime(g.value,c.currentTime); g.linearRampToValueAtTime(0,c.currentTime+.6);
  setTimeout(()=>{ if(!MP3.want) el.pause(); },700); }
(function(){ const pl=Sound.play, st=Sound.stop;
  Sound.play=function(name,force){ if(typeof name==='string'&&name.indexOf('mp3:')===0){ const q=name.split(':'); st.call(this); this.want=name; twMp3Play(q[1],q[2]!=null?+q[2]:null); return; }
    twMp3Stop(); return pl.call(this,name,force); };
  Sound.stop=function(){ twMp3Stop(); return st.apply(this,arguments); }; })();
// Omar's song runs through every phase: it carries on where it was (a name with no time does not restart it)
TW_MUSIC.omar=['','mp3:omar','mp3:omar','mp3:omar'];
// Caotan's song: phase I from the start, phase II from the drop (0:12), phase III from 0:50; Megane Supernova restarts it at the drop
TW_MUSIC.caotan=['','mp3:caotan:0','mp3:caotan:12','mp3:caotan:50'];
(function(){ const c2=TWK.caotan.lc2; TWK.caotan.lc2=function*(T){ Sound.play('mp3:caotan:12'); yield* c2(T); }; })();

// =====================================================================
// PHASE III: the more you hurt him, the more unhinged and depressed he gets
// =====================================================================
const TW_OMAR_SPIRAL=[.85,.7,.6,.4,.28,.15,.06];
function twOmarSpiral(k){
  if(k===0) twBark('omar',"You think this hurts? I've been hurting since preschool. They made me share my crayons. They were all black.",true);
  else if(k===1) twBark('omar',"Every cut you make, I'm writing it down. In my diary. It has a lock. Nobody has ever tried to open it.",true);
  else if(k===2) twBark('omar',"My mom called. She asked if I'm eating. I said I'm eating the MOON, Mom. She said that's not a vegetable.",true);
  else if(k===3) twBark('omar',"Ha. Haha. HAHAHA. The void texted me back. It said, new phone, who dis.",true);
  else if(k===4) twBark('omar',"I'm not crying. The darkness is leaking out of my eyes. It does that when it's sad.",true);
  else if(k===5) twBark('omar',"Please. One more phase. I'll be good. I'll wear colours. I'll wear BEIGE.",true);
  else if(k===6) twBark('omar',"I can see the light. I hate it. It's so bright. Who designed this?",true); }
(function(){ const th=twHurt; twHurt=function(T,d,src){ const r=th.apply(this,arguments);
    if(r&&T&&T.who==='omar'&&T.phase===3&&TW.fight&&TW.fight.kind==='solo'&&T.state!=='lc'&&!T.dying&&T.hp>0){ const f=T.hp/T.maxHp; T.spiral=T.spiral||0;
      while(T.spiral<TW_OMAR_SPIRAL.length&&f<=TW_OMAR_SPIRAL[T.spiral]){ const k=T.spiral++; if(f>TW_OMAR_SPIRAL[T.spiral]||T.spiral>=TW_OMAR_SPIRAL.length){ twOmarSpiral(k); break; } } }
    return r; }; })();
// a retry of phase III starts his spiral over (from halfway if the retry starts in the Iai)
(function(){ const sr=twSoloRestart; twSoloRestart=function(F,T){ if(T) T.spiral=0; const r=sr.apply(this,arguments); if(T&&T.hp<=T.maxHp/2) T.spiral=3; return r; }; })(); // an Iai retry starts at half HP
