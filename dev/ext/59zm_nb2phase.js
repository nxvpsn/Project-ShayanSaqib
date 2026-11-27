// =====================================================================
// NATHAN ON ALI'S ROAD IN TWO PHASES (v1.88, the owner's call: "phase 1 against the mech, phase 2 the humanoid Nathan; have the
// phase 2 transition be the limit cut in phase 1").
//   I   the mech (340 HP): phase I's moves at phase I's pace, plus the sky moves (ringfall, lattice, mirage, buster, tackle).
//       At 0 he does not go down: he fires FULL BURST, his limit cut. Surviving it IS the phase change: he overheats, the
//       armour comes off (the armour-off cutscene) and
//   II  Nathan on foot (260 HP): gun, blade and bare hands, his own limit cut (LAST ROUND) at half, then the finale and the choice.
// Inside the code the pilot is still phase 3 (`NP1.ph`/`npPh()`), so every `>=3` check keeps meaning "on foot"; the old middle
// phase (2) is never entered. `npShown()` is the number the player sees.
// NP1.lcFinal: 0 none | 1 Full Burst is due | 2 it is running | 3 it is over (go to the cutscene).
// A death during Full Burst retries from Full Burst (NP1.ckLC), not from the start of the phase.
// =====================================================================
NP_HP[1]=340; /* the two mech phases were 220 and 240 (59zg); one mech phase that ends in a limit cut sits between one and both */
NP_POOLS[1]=['combo','ringfall','meteor','grab','lattice','bits','mirage','cage','combo','buster','excal','grab','tackle','ringfall'];
NP_FIRST[1]=['combo','bits','ringfall','grab','meteor','lattice','mirage'];
function npShown(){ return npPh()>=3?2:1; }
function npFinalLC(){ NP1.lcFinal=1; NP1.ckLC=1; NP1.hp=1; NP1.done=0; NP1.lcDone=1; NP1.lcPend=1; }
// the phase change is the armour-off cutscene, whichever one the old code asks for
npCine12=function*(){ yield* npCine23(); };
(function(){ const nd=np1Down; np1Down=function(){ try{ if(npPh()<3){
        if(TW.otk&&!TW._ally) NP1.lcFinal=3; /* the one-hit-kill cheat skips limit cuts */
        if(!NP1.lcFinal){ npFinalLC(); Sound.sfx('crossboom'); shake(.8); FX.flash=.5; grade.uniforms.flashCol.value.set(1,.6,.5); return; } /* no banner: Full Burst's own cut-in follows at once */
        if(NP1.lcFinal===1){ NP1.hp=1; return; } /* due, not started yet (one of Ali's sequences is still playing): he holds at 1 */
        NP1.lcFinal=3; } }catch(e){ console.error('np 2phase down',e); }
    return nd.apply(this,arguments); }; })();
(function(){ const nu=np1Update; np1Update=function(dt){ const r=nu.apply(this,arguments);
    try{ if(typeof npOn==='function'&&npOn()&&NP1.lcFinal&&npPh()<3&&!NP1.done){
        if(NP1.lcFinal===1){ if(!NP1.lcPend&&(NP1.cur==='lc'||NP1.lcInv)){ NP1.lcFinal=2; NP1.lcT=0; } else if(NP1.hp<1) NP1.hp=1; }
        else if(NP1.lcFinal===2){ NP1.lcT+=dt; if(NP1.lcT>1.5&&!NP1.lcInv&&NP1.cur!=='lc'&&!NP1.seq&&!NP1.cam&&!Game.script&&!Cam.cine&&NB&&NB.alive){ NP1.lcFinal=3; NP1.hp=0; np1Down(); } } } }catch(e){ console.error('np 2phase',e); }
    return r; }; })();
// a phase starts clean; a retry of phase I after dying in Full Burst goes straight back into it
(function(){ const sp=npSetPhase; npSetPhase=function(n,fresh){ const r=sp.apply(this,arguments); try{ NP1.lcFinal=0; NP1.lcT=0; if(n>=3) NP1.ckLC=0; }catch(e){} return r; }; })();
(function(){ const nm=nbMake; nbMake=function(){ try{ NP1.ckLC=0; NP1.lcFinal=0; }catch(e){} return nm.apply(this,arguments); }; })();
(function(){ const ns=np1Start; np1Start=function(){ const lc=(NP1.ckPh||1)<3&&NP1.ckLC, r=ns.apply(this,arguments); try{ if(lc){ npFinalLC(); Game.banner={name:'Full Burst',sub:'Again, from the limit cut',t:0,small:1}; } }catch(e){ console.error('np 2phase start',e); } return r; }; })();
// what the player reads
(function(){ const zc=twZeldaCard; twZeldaCard=function(a){ if(a==='Phase III'&&typeof npOn==='function'&&npOn()){ const q=[].slice.call(arguments); q[0]='Phase II'; return zc.apply(this,q); } return zc.apply(this,arguments); }; })();
