// =====================================================================
// HE'S DAY OLD KOJIMA: THE FIGHT (the old Grimmaw state machine, his phase changes kept: the soldier drop, the Hydra
// clash, the armor dome, the final burnout). He is the boss that teaches the others: every move is an easy,
// one-dimensional version of something Caotan or Omar does later, skinned as paperwork and feet.
//   paper     a fan of contract sheets (Caotan's pillow fan)            deflect them back by attacking
//   slash     the gold-pen swing (melee, silver slash)                    parry; mashing works, he never punishes it
//   blink     teleport + swing (Omar's blink)                             same, lenient
//   charge    a dash across the arena (Caotan's rush)                     parry it, mashing works
//   stomp     a red circle, then a giant foot (Omar's drop)               step out of the circle
//   feet      two feet curving in from the sides (Omar's curve scythes)   watch both sides
//   memos     circles of falling memos (Omar's sky scythes)               keep moving
//   tape      one blue line (Caotan's blue beam)                          jump it
//   wall      one pink line (Caotan's pink beam)                          step off it
//   shredder  a small black hole with a gentle pull (the twins' holes)    walk out of the pull
//   ring      a ring of sheets closing in, two gaps (Omar's ring)         stand in a gap
// The hard Grimmaw moves (blades, spokes, clones, lances, cages, meteors) are gone from his pool.
// =====================================================================
const KJ={tex:null, cd:[0,1.5,1.2,1]};
function kjTex(){ if(KJ.tex) return KJ.tex; const mk=(w,h,f)=>{ const [cv,c]=mkCanvas(w,h); f(c); const t=tex(cv); t.magFilter=t.minFilter=THREE.NearestFilter; return t; };
  KJ.tex={
    paper:mk(16,20,c=>{ c.fillStyle='#2a2a34'; c.fillRect(0,0,16,20); c.fillStyle='#f6f4ee'; c.fillRect(1,1,14,18); c.fillStyle='#d8d4ca'; c.fillRect(11,1,4,4); c.fillStyle='#b8b4aa'; for(let i=0;i<6;i++) c.fillRect(3,4+i*2,i%3===2?6:10,1);
      c.fillStyle='#c8202e'; c.fillRect(3,16,2,1); c.fillRect(5,15,2,1); c.fillRect(7,16,3,1); c.fillRect(10,15,2,1); }),
    foot:mk(22,14,c=>{ const P=(x,y,w,h,col)=>{ c.fillStyle=col; c.fillRect(x,y,w,h); }; P(1,5,16,8,'#2a1a14'); P(2,6,15,6,'#f0c4a0'); P(14,3,7,9,'#2a1a14'); P(15,4,5,7,'#f0c4a0');
      for(let i=0;i<5;i++){ P(15+i,1+(i%2),2,3,'#2a1a14'); P(15+i,2+(i%2),1,2,'#f8d8b8'); } P(3,11,13,1,'#d8a07c'); P(4,7,6,2,'#ffe0c8'); P(1,9,2,3,'#d8a07c'); })};
  return KJ.tex; }
// a projectile that looks like a sheet of paper or a foot (an orb underneath: it can be deflected like any other)
function kjProj(kind,x,y,z,vx,vz,o){ const T=kjTex(), b=spawnProj(Object.assign({kind:'orb',col:0xffffff,x,y,z,vx,vz,src:Game.boss,dmg:1,life:5},o||{}));
  if(b.core) b.core.visible=false; if(b.gl) b.gl.visible=false; const m=kind==='foot'?twBB(T.foot,1.3,.85):twBB(T.paper,.75,.95); b.m.add(m); b.kjSpr=m; b.kjKind=kind; return b; }
// papers flutter and spin, feet point where they walk
twHz({upd(){ try{ for(const b of BOLTS){ if(!b.kjSpr||b.dead) continue; if(b.kjKind==='paper') b.kjSpr.rotation.z=b.t*9; else { b.kjSpr.rotation.z=Math.atan2(-b.vz,b.vx)*.35; b.kjSpr.scale.x=b.vx<0?-1:1; } } }catch(e){ console.error('kj spin',e); } return true; }});
(function(){ const ch=twClearHz; twClearHz=function(){ const r=ch.apply(this,arguments); twHz({upd(){ try{ for(const b of BOLTS){ if(!b.kjSpr||b.dead) continue; if(b.kjKind==='paper') b.kjSpr.rotation.z=b.t*9; else b.kjSpr.scale.x=b.vx<0?-1:1; } }catch(e){} return true; }}); return r; }; })();

const KJ_BARK=["Do you know who I AM? I'm in the credits TWICE.","My lawyers have lawyers. Their lawyers have catgirls.","A He's Day Old Kojima Production. Directed by me. Starring me.",
  "I was a genius before I could walk. I still can't walk well. Genius.","You are not a protagonist. You are a playable demo.","Kneel. I'll allow you to kiss the pen.",
  "This fight has a twelve-minute cutscene after it. You'll love it.","I own the rights to your face now. It's in the fine print.","Stop hitting me! I'm forty-three days old!"];
function kjBark(){ if(Math.random()<.4) twBark('grimmaw',KJ_BARK[Math.floor(Math.random()*KJ_BARK.length)]); }
const KJM={
  *paper(b,ph){ b.anim='windup'; const P=Player, n=ph>=3?5:3; FX.line(b.x,b.z,Math.atan2(P.z-b.z,P.x-b.x),9,2.2,0xffffff,.7); yield .75; b.anim='slash'; b.ap=.2;
    const a0=Math.atan2(Player.z-b.z,Player.x-b.x); for(let i=0;i<n;i++){ const a=a0+(i-(n-1)/2)*.32; kjProj('paper',b.x+Math.cos(a),b.y+1.3,b.z+Math.sin(a),Math.cos(a)*5.5,Math.sin(a)*5.5); } Sound.sfx('swing'); yield .5; b.ap=null; },
  *stomp(b,ph){ b.anim='howl'; const P=Player, x=P.x, z=P.z, gy=groundY(x,z); twBlast(x,z,1.9,1.2,{col:0xff2a3a,burst:0xf0c4a0,ring:'#ff6a5a',dmg:2,shake:.6,sfx:'slam'});
    const T=kjTex(), m=twBB(T.foot,5,3.2); m.position.set(x,gy+12,z); m.userData.tw=1; scene.add(m); const s={t:0};
    twHz({upd(dt,play){ if(play) s.t+=dt; const u=Math.min(1,Math.max(0,(s.t-.75)/.45)); m.position.y=gy+1.5+(1-u*u)*10.5; if(s.t>1.2) m.scale.y=Math.max(.2,1-(s.t-1.2)*2); return s.t<1.7; }, kill(){ scene.remove(m); }});
    yield 1.6; },
  *feet(b,ph){ b.anim='windup'; yield .5; for(let r=0;r<(ph>=3?2:1);r++){ b.anim='slash'; b.ap=.3; for(const sd of [-1,1]){ const P=Player, hx=b.x+sd*1.4, hz=b.z, y=groundY(hx,hz)+.9, aa=Math.atan2(P.z-hz,P.x-hx), d=Math.max(3,Math.hypot(P.x-hx,P.z-hz)), off=.85*sd, v=6.5;
        kjProj('foot',hx,y,hz,Math.cos(aa+off)*v,Math.sin(aa+off)*v,{curl:-2*off*v/(d*1.1),life:d*1.3/v+1.2}); } Sound.sfx('whoosh'); yield .9; } b.ap=null; yield .3; },
  *memos(b,ph){ b.anim='howl'; const n=ph>=3?6:4; for(let i=0;i<n;i++){ const P=Player, a=rnd(0,6.28), r=i?rnd(1,2.6):0, x=P.x+Math.cos(a)*r, z=P.z+Math.sin(a)*r, gy=groundY(x,z);
      twBlast(x,z,.9,1.1,{col:0xff2a3a,burst:0xffffff,ring:'#ffffff',dmg:1,quiet:i>0,sfx:'hit',shake:.1});
      const m=twBB(kjTex().paper,1.1,1.4), s={t:0}; m.position.set(x,gy+9,z); m.userData.tw=1; scene.add(m);
      twHz({upd(dt,play){ if(play) s.t+=dt; const u=Math.min(1,Math.max(0,(s.t-.6)/.5)); m.position.y=gy+.7+(1-u)*8.3; m.rotation.z=s.t*6; return s.t<1.5; }, kill(){ scene.remove(m); }}); yield .35; } yield 1; },
  *tape(b,ph){ b.anim='windup'; const P=Player; twBlue(P.x,P.z,rnd(0,Math.PI),{warn:1,dmg:2}); yield 1.4; },
  *wall(b,ph){ b.anim='windup'; const P=Player; twPink(b.x,b.z,Math.atan2(P.z-b.z,P.x-b.x),{warn:1,dmg:2}); yield 1.3; },
  *shredder(b,ph){ b.anim='howl'; const P=Player, a=rnd(0,6.28), p=twClampXZ(P.x+Math.cos(a)*3,P.z+Math.sin(a)*3,1.5); twMiniHole(p.x,p.z,{r:.5,pull:2.2,range:4,dur:4.5,eat:.6,dmg:2}); Sound.sfx('void');
    yield .8; for(let i=0;i<3;i++){ const P2=Player, aa=Math.atan2(P2.z-b.z,P2.x-b.x); kjProj('paper',b.x,b.y+1.3,b.z,Math.cos(aa)*5,Math.sin(aa)*5); Sound.sfx('swing'); yield .7; } yield .6; },
  *ring(b,ph){ b.anim='howl'; const P=Player, n=12, R=7, gap=Math.floor(Math.random()*n); for(let i=0;i<n;i++){ if(i===gap||i===(gap+1)%n||i===(gap+6)%n||i===(gap+7)%n) continue; const a=i*6.283/n, x=P.x+Math.cos(a)*R, z=P.z+Math.sin(a)*R;
      kjProj('paper',x,groundY(x,z)+1.1,z,-Math.cos(a)*4.2,-Math.sin(a)*4.2,{life:3}); } Sound.sfx('swing'); yield 2; }};
// the pool by phase (the classic slash / blink / charge / leap stay, lenient: no strict parry judging here)
const KJ_POOL=[[],['slash','slash','blink','charge','paper','paper','stomp'],['slash','blink','charge','leap','paper','stomp','feet','feet','memos','tape'],
  ['slash','blink','charge','paper','stomp','feet','memos','tape','wall','wall','shredder','shredder','ring','ring']];
function kjStart(b){ const o=KJ_POOL[Math.min(3,b.phase||1)]; let k=o[Math.floor(Math.random()*o.length)]; if(k===b.last&&Math.random()<.7) k=o[Math.floor(Math.random()*o.length)]; b.last=k; kjBark();
  if(KJM[k]){ b.state='kj'; b.st=0; b.kjg=KJM[k](b,b.phase||1); b.kjw=0; b.vx=b.vz=0; return; }
  b.chain=k==='slash'?Math.min(2,b.phase):1; if(k==='blink'){ b.chain=1; b.rush=b.phase>=3?1:0; } b.state=k+'_w'; b.st=0; }
(function(){ const ub=updateBoss; updateBoss=function(dt){ const b=Game.boss;
    try{ if(b&&Game.state==='play'){
        if(b.state==='idle'&&(b.cd||0)-dt<=0){ kjStart(b); }
        if(b.state==='kj'&&b.kjg){ b.vx*=.8; b.vz*=.8; b.ang=Math.atan2(Player.z-b.z,Player.x-b.x); b.kjw-=dt; let n=0;
          while(b.kjw<=0&&n++<20){ const r=b.kjg.next(); if(r.done){ b.kjg=null; b.ap=null; b.state='recover'; b.st=0; break; } b.kjw+=r.value||.1; } }
        else if(b.state!=='kj') b.kjg=null; } }
    catch(e){ console.error('kojima',e); b.kjg=null; b.state='recover'; b.st=0; }
    const r=ub.apply(this,arguments);
    // a longer breather after every move: he is the tutorial boss
    if(b&&b.state==='idle'&&b._kjPrev==='recover') b.cd=Math.max(b.cd||0,KJ.cd[Math.min(3,b.phase||1)]); if(b) b._kjPrev=b.state; return r; }; })();
// the pixel VFX now play in his fight too (they used to stay off while Game.boss was on the field, and Shayan's Getsuga fell
// back to the old glowing beam: a huge fuzzy glow under the Crimson Moon's red grade). His parryable hits show the silver slash.
pxvLegacy=function(){ return false; };
function kjPxv(fn){ const L0=pxvLegacy; pxvLegacy=()=>false; try{ return fn(); } finally{ pxvLegacy=L0; } }
(function(){ const mt=pxvMeleeTell; pxvMeleeTell=function(){ const a=arguments; return Game.boss?kjPxv(()=>mt.apply(this,a)):mt.apply(this,a); };
  const ub=updateBoss; updateBoss=function(dt){ const r=ub.apply(this,arguments), b=Game.boss; try{ if(b&&b.state==='charge'&&Game.state==='play'&&typeof twRushTell==='function') kjPxv(()=>twRushTell(b,b.ang)); }catch(e){ console.error('kj rush',e); } return r; }; })();
// no more dog howls while he is on the field: a smug baby giggle instead
(function(){ const sf=Sound.sfx; Sound.sfx=function(n){ if(n==='howl'&&Game.boss&&this.ctx&&!this.muted){ for(let i=0;i<5;i++){ this.tone('square',820-i*35,620-i*35,.08,.07,i*.11); this.tone('triangle',1640-i*70,1240-i*70,.06,.03,i*.11); } return; } return sf.apply(this,arguments); }; })();
