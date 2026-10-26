// =====================================================================
// VOICE CLIPS AS FILES: VOICES only lists which clips exist ({key:1}); each clip is audio/v/<key>.mp3,
// fetched and decoded the first time its line plays, then cached (decoded) for the session.
// build_voices.py writes the files and audio/v/manifest.json; build.py embeds the manifest.
// =====================================================================
Voice.pend={};
Voice.buf=async function(key){ if(this.cache[key]) return this.cache[key]; if(!(typeof VOICES!=='undefined'&&VOICES[key])||!Sound.ctx) return null;
  if(!this.pend[key]) this.pend[key]=fetch('audio/v/'+key+'.mp3').then(r=>r.ok?r.arrayBuffer():null).then(ab=>ab?Sound.ctx.decodeAudioData(ab):null).catch(()=>null);
  const b=await this.pend[key]; delete this.pend[key]; if(b) this.cache[key]=b; return b; };
// the old prewarm decoded every embedded clip; with files that would download them all, so clips load on first use
Voice.prewarm=function(){};
