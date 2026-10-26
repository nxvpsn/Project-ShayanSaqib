// cast overhaul + Shayan extras + VFX: every new draw path and effect runs without errors (headless)
const B=require('./bot2.js'); const R=B.R, H=B.H;
let fails=0; const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c) fails++; };
R("Game.state='cut'; newGame();"); H.frames(30); R("Game.script=null; Game.dlg=null; Game.wait=null; Game.state='play';");
// every character in every pose, with a fake 2D context
R(`globalThis.__fc={fillStyle:'',globalAlpha:1,fillRect(){},save(){},restore(){},beginPath(){},ellipse(){},fill(){},stroke(){},moveTo(){},lineTo(){},arc(){},drawImage(){},translate(){},rotate(){},scale(){},clearRect(){},quadraticCurveTo(){},closePath(){},bezierCurveTo(){},strokeRect(){},fillText(){}}`);
const n0=B.errs.length;
R(`(function(){ const c=__fc, A=['idle','run','jump','fall','glide','dash','attack','charge','beam','block','hurt','dead','pray','howl','windup','slash','leapPrep','winded','charge'];
  for(const t of [0,.4,1.3,2.7]) for(const a of A) for(const f of [1,-1]){
    drawAliHD(c,32,62,f,{t,anim:a,ap:.5,flash:t>2?1:0,old:t>1}); drawMiraHD(c,32,62,f,{t,anim:a,blush:1}); drawGrimmawHD(c,64,126,f,{t,anim:a,ap:.4,flash:0});
    drawVillagerHD(c,32,62,f,{t,moving:t>1,flee:t>2?1:0,who:'elder'},{cloth:'#6a5a8a',beard:1,hat:'#4a6a8a',staff:1,robe:1}); drawVillagerHD(c,32,62,f,{t},PAUL_LOOK); drawVillagerHD(c,32,62,f,{t},TUT_LOOK); drawVillagerHD(c,32,62,f,{t},{kid:1,hat:'chef',apron:1});
    drawNathanPilot(c,32,62,f,{t,frost:t/3,jacket:t>1?1:0,scarf:.5,closed:t>2,still:t>2});
    drawCaotanBoss(c,64,126,f,{t,form:Math.floor(t),fire:a==='attack'?1:0,push:a==='beam'?1:0,glintT:.2,noGlasses:a==='block',maid:a==='pray',heartEyes:a==='pray',nose:1,cracked:1,down:a==='dead'?1:0,stun:a==='hurt'?1:0,state:'atk'});
    drawCaotanHD(c,64,126,f,{t}); const o={t,form:Math.floor(t),cast:a==='charge'?1:0,scythe:a==='attack'||a==='slash'?1:0,swing:a==='slash'?1:0,down:a==='dead'?1:0,stun:a==='hurt'?1:0}; drawOmarBoss(c,64,126,f,o); drawOmarHD(c,64,126,f,{t});
    drawCaomar(c,64,126,f,{t,glintT:.3}); drawHamzaFairy(c,20,38,f,t,0); drawGiantPig(c,80,126,f,{t,mouth:t%1,front:0,drip:1,flash:0}); drawGiantPig(c,80,126,f,{t,front:1}); } })()`);
ok(B.errs.length===n0,'all cast draws run');
// talking: mouth flaps while a line types
R("Game.dlg={type:'say',who:'caotan',text:'hello there',shown:2,t:.5}"); ok(R("cTalk('caotan')>0&&cTalk('omar')===0"),'talk detection'); R("Game.dlg=null");
// Shayan extras: force the atlas path on
R("SHA.ok=true; SHA.img=SHA.img||{}; Player.anim='attack';");
for(const n of [0,1,2]){ R(`startAtk(${n}); Player.atk.t=.1; drawShayanHD(__fc,32,62,1,{t:Player.t,anim:Player.anim,ap:.5,combo:${n}})`); }
ok(B.errs.length===n0,'three slashes draw');
R("Player.atk=null; Player.onGround=true; Player.jumps=1"); H.frames(5);
R("Player.y+=3; Player.onGround=false; Player.vy=2; Player.jumps=1; hit.jump=true; held.jump=true"); H.frames(2); console.log('    djT',R("Player.djT"),'jumps',R("Player.jumps"));
R("Player.djT=.2; Player.anim='jump'; drawShayanHD(__fc,32,62,1,{t:Player.t,anim:'jump'}); Player.anim='glide'; drawShayanHD(__fc,32,62,1,{t:Player.t,anim:'glide'})");
R("Player.counter=5; startAtk(0)"); ok(R("Player.fcT>0&&Player.atk&&Player.atk.big"),'full counter timer + big hitbox attack'); for(let i=0;i<6;i++){ R("drawShayanHD(__fc,32,62,1,{t:Player.t,anim:'attack'})"); H.frames(5); }
ok(B.errs.length===n0,'shayan extras ran clean');
// getsuga trails + boss lasers + mech
R("fireBeam(true)"); H.frames(20);
R("twBeam({x:Player.x+3,z:Player.z,ang:0,len:10,warn:.1,dur:.4,col:0x7ac8ff}); twBeam({x:Player.x,z:Player.z+3,ang:1,len:10,warn:.1,dur:.4,col:0xffa0d8})"); H.frames(40);
ok(B.errs.length===n0,'beams + lasers run');
R("MECHTEX=MECHTEX||{image:{width:10}}; maInit(); maDraw()"); H.frames(3);
console.log('errors',B.errs.length,[...new Set(B.errs)].slice(0,6)); console.log(fails||B.errs.length?'FAILED':'ALL OK');
