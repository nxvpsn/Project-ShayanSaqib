// =====================================================================
// THE DUO, HARD PASS (v1.65)
// A twin's move that is dropped (a Full Counter stun, a retry, a limit cut starting) never ran its `finally`: the Falling
// Moon's landing disc stayed on the ground, the mega rain left TW.storming set, a mid limit cut never ended. In the duo
// fight the move a twin was running last frame and is no longer running is closed here (return() runs its finally blocks).
// Also in this pass (57d): the tree is built from the Judgement Cut tear itself (d5TearMat), the climb's only threat is the
// void (no sniping scythes, no sky scythes, no leftover holes; the void is a soft tide that stays under the top), and
// Omar's portals are the rifts from his own fight.
// =====================================================================
(function(){ const tu=twUpdate; twUpdate=function(dt){ const F=TW.fight, duo=F&&F.kind==='duo';
    try{ if(duo) for(const T of TW.foes||[]){ if(T&&T._g&&T._g!==T.gen){ const g=T._g; T._g=null; try{ g.return(); }catch(e){} } } }catch(e){ console.error('duo drop',e); }
    const r=tu.apply(this,arguments); try{ if(duo) for(const T of TW.foes||[]) if(T) T._g=T.gen; }catch(e){} return r; }; })();
