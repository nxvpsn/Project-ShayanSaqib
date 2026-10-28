// controller support: a fake pad drives gameplay, the Esc timeline, the Controls card + drop-down, aim, glyphs, rumble
const B=require('./bot2.js'); const R=B.R, H=B.H, C=H.ctx;
const GP={id:'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)',connected:true,timestamp:1,axes:[0,0,0,0],buttons:[...Array(17)].map(()=>({pressed:false,value:0})),
  vibrationActuator:{n:0,playEffect(){ this.n++; return {catch(){}}; }}};
C.navigator.getGamepads=()=>[GP];
let fails=0; const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c) fails++; };
const btn=(i,v)=>{ GP.buttons[i]={pressed:!!v,value:v?1:0}; GP.timestamp++; };
const play=()=>R("Game.script=null; Game.dlg=null; Game.wait=null; Game.state='play'; Player.x=0; Player.z=0;");
const tap=i=>{ btn(i,1); H.frames(1); btn(i,0); H.frames(1); };
R("Game.state='cut'; newGame();"); H.frames(30);
R("Game.script=null; Game.dlg=null; Game.wait=null; Game.state='play'; twControlsHide();"); H.frames(5);
// keyboard mode: pad ignored
btn(5,1); H.frames(2); ok(!R("held.attack"),'kbm mode ignores the pad'); btn(5,0); H.frames(2);
R("PAD.mode='pad'");
btn(5,1); H.frames(1); ok(R("held.attack"),'R1 holds attack'); btn(5,0); H.frames(1); ok(!R("held.attack"),'R1 release');
btn(7,1); H.frames(1); ok(R("held.block"),'R2 holds magic (block)'); btn(7,0); H.frames(1);
btn(6,1); H.frames(1); ok(R("held.special"),'L2 special'); btn(6,0); H.frames(1);
play(); btn(1,1); R("twPadPoll()"); ok(R("held.dash"),'Circle dash'); btn(1,0); R("twPadPoll()"); ok(!R("held.dash"),'Circle up');
btn(10,1); H.frames(1); ok(R("held.ff"),'L3 ff'); btn(10,0); H.frames(1);
{ const a0=R("PAD.aimAssist"); btn(11,1); H.frames(1); btn(11,0); H.frames(1); ok(R("PAD.aimAssist")===!a0,'R3 toggles fireball aim assist'); btn(11,1); H.frames(1); btn(11,0); H.frames(1); }
btn(3,1); btn(2,1); btn(4,1); btn(10,1); H.frames(1); ok(!R("['attack','block','dash','special','jump','confirm'].some(a=>held[a])"),'triangle/square/L1/L3 do nothing'); [3,2,4,10].forEach(i=>btn(i,0)); H.frames(1);
play(); GP.axes=[.9,0,0,0]; H.frames(1); ok(R("Stick.x")>.8&&R("inputVec()[0]")>.8,'left stick moves'); GP.axes=[0,0,0,0]; H.frames(1); ok(R("Stick.x")===0,'stick released');
play(); btn(13,1); H.frames(1); ok(R("held.down"),'dpad down'); btn(13,0); H.frames(1); ok(!R("held.down"),'dpad up');
// aim
R("Game.state='play'; Game.mech=null; Game.paulLock=false;");
ok(R("twAimAng()")===null,'no right stick: old aim');
GP.axes=[0,0,0,-1]; H.frames(1); const a=R("twAimAng()"); ok(a!==null&&Math.abs(a+Math.PI/2)<.01,'right stick aims up ('+a+')'); GP.axes=[0,0,0,0]; H.frames(30); ok(R("twAimAng()")===null,'right stick let go: aim off');
// glyphs + text
ok(R("K('attack')")==='R1'&&R("K('block')")==='R2'&&R("K('jump')")==='✕','K glyphs PS: '+R("[K('attack'),K('block'),K('jump'),K('confirm'),K('menu')].join(',')"));
ok(R("twPadTx('Click or press E to rise again')")==='Press ✕ to rise again','death prompt');
ok(R("twPadTx('MASH LEFT CLICK')")==='MASH R1','mash prompt');
console.log('   ',R("twPadTx('WASD  move    Space  jump (again: double jump, hold: glide)')"),'|',R("twPadTx('Shift  dash    Q  special    E  talk    P  pause')"));
R("PAD.glyph='xb'; twPadSave()"); ok(R("K('attack')")==='RB'&&R("twPadTx('MASH LEFT CLICK')")==='MASH RB','xbox glyphs');
R("PAD.glyph='ps'; twPadSave()");
// Options opens the timeline, pad navigates it
tap(9); ok(R("TLM.open"),'Options opens the Esc timeline'); ok(!R("held.pause"),'no stray pause');
const t0=R("TLM.tab"); tap(5); ok(R("TLM.tab")===(t0+1)%3,'R1 switches tab'); tap(4);
tap(3); ok(R("CT.open&&CT.fromMenu"),'Triangle opens Controls'); ok(R("twPadCtx()")==='card','card has focus');
H.frames(2); console.log('    focus',R("CT.focus"),'rects',R("CT.rects.length"));
// navigate down to the first button row and open its drop-down
let guard=0; while(R("!String(CT.focus).startsWith('pbtn:')")&&guard++<10){ btn(13,1); H.frames(1); btn(13,0); H.frames(1); }
ok(R("String(CT.focus).startsWith('pbtn:')"),'D-pad reaches a button row: '+R("CT.focus"));
const bi=R("+CT.focus.slice(5)"); tap(0); ok(R("CT.drop")===bi,'Cross opens the drop-down');
tap(13); tap(13); const sel=R("CT.dropSel"); tap(0); ok(R("CT.drop")===null&&R(`PAD.map[${bi}]`)===R(`PAD_ACTS[${sel}]`),'pick sets button '+bi+' -> '+R(`PAD.map[${bi}]`));
R("twCardActivate('pbtn:0'); twCardActivate('popt:0')"); ok(R("PAD.map[0]")==='','Cross set to Nothing');
R("twCardActivate('preset')"); ok(R("PAD.map.join()")===R("PAD_DEF.join()"),'defaults');
tap(1); ok(!R("CT.open")&&R("TLM.open"),'Circle closes card, back to timeline');
tap(1); ok(!R("TLM.open"),'Circle closes timeline'); ok(R("Game.state")!=='paused','game resumed: '+R("Game.state"));
H.frames(5);
// mode toggle through the card
R("twControlsShow(true); twCardActivate('mode:kbm')"); ok(R("PAD.mode")==='kbm','toggle to KB/M'); R("twCardActivate('mode:pad'); twControlsHide()"); ok(R("PAD.mode")==='pad','toggle to Controller');
// draw both card views
R("twControlsShow(true)"); H.frames(2); R("PAD.mode='kbm'"); H.frames(2); R("PAD.mode='pad'; twControlsHide()"); H.frames(2);
// rumble on stun + full counter
const n0=R("GP_N=0"); C.GPV=GP.vibrationActuator; const v0=GP.vibrationActuator.n;
R("TW.foes.push({stun:0}); twPadStuns(); TW.foes[TW.foes.length-1].stun=2; twPadStuns();"); ok(GP.vibrationActuator.n===v0+1,'stun rumbles'); R("twPadStuns()"); ok(GP.vibrationActuator.n===v0+1,'once'); R("TW.foes.pop()");
R("twMiniJC=twMiniJC"); const v1=GP.vibrationActuator.n; R("Player.atk={big:true,boomed:1}; try{ meleeHits(0,0,0,0,0,0,0,new Set()); }catch(e){}"); ok(GP.vibrationActuator.n===v1+1,'full counter rumbles');
R("Player.atk=null");
// death screen: Cross confirms
R("Game.state='dead'; Game.deadT=2"); tap(0); H.frames(2); ok(R("Game.state")!=='dead','Cross rises from death: '+R("Game.state"));
console.log('errors',B.errs.length,[...new Set(B.errs)].slice(0,5)); console.log(fails?'FAILED '+fails:'ALL OK');
// Special hints follow the binding (pad and keyboard)
R("PAD.mode='pad'; PAD.map=PAD_DEF.slice(); twPadSave()");
ok(R("twPadTx('SPECIAL READY · Q')")==='SPECIAL READY · L2','pad special hint: '+R("twPadTx('SPECIAL READY · Q')"));
R("PAD.map[6]=''; PAD.map[3]='special'; twPadSave()"); ok(R("twPadTx('TRUE DRILL READY · Q')")==='TRUE DRILL READY · △','rebound to triangle: '+R("twPadTx('TRUE DRILL READY · Q')"));
ok(R("twPadTx('Full meter (Q): Za Warudo + Judgement Cut')").startsWith('Full meter (△)'),'ali meter hint');
R("twPadSetMode('kbm'); twSetBind('special','KeyR')"); ok(R("twPadTx('SPECIAL READY · Q')")==='SPECIAL READY · R','keyboard rebind: '+R("twPadTx('SPECIAL READY · Q')"));
ok(R("twPadTx('Q  True Heavenly Drill of Annihilation')")==='R  True Heavenly Drill of Annihilation','mech help');
R("twSetBind('special','KeyQ'); PAD.map=PAD_DEF.slice(); twPadSave()");
console.log(fails?'FAILED '+fails:'ALL OK');
