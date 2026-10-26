// cells for preview_cast.js: [label, canvas w, canvas h, code drawing with (c,cx,by)]; CHAR env picks a set
const ch=process.env.CHAR||'ali', fn={ali:'drawAliCast'}[ch]||ch;
const W=+(process.env.CW||64), H=+(process.env.CH||64);
const poses=(process.env.POSES||'idle,run:0,run:.13,run:.26,run:.39,jump,fall,glide,dash,attack:0,attack:.4,attack:.8,charge,beam,block,hurt,dead,talk').split(',');
module.exports=poses.map(q=>{ const [a,u]=q.split(':'); const t=a==='run'?(+u||0):1.3;
  const pre=a==='talk'?"Game.dlg={type:'say',who:'"+(process.env.WHO||ch)+"',text:'hello there',shown:3,t:1};":"Game.dlg=null;";
  const an=a==='talk'?'idle':a; return [q,W,H,pre+fn+"(c,cx,by,1,{t:"+t+",anim:'"+an+"',ap:"+(u||0)+",flash:0})"]; });
