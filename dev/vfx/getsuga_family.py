#!/usr/bin/env python3
"""Writes the Getsuga family of recipes (one look, four palettes): getsuga (Shayan / Ali, black crescent + red border),
getsuga_gold (Ali's chained 1.5x one, gold lining), getsuga_jj (Getsuga Jujishou, gold), getsuga_omar (Omar, violet). Violent energy: the blade's shape shifts every
frame ("vary"), lightning crawls over it and dark lightning arcs around it. Then: python3 vfx/build_vfx.py getsuga getsuga_gold getsuga_jj getsuga_omar
"""
import json, math, random, os
HERE = os.path.dirname(os.path.abspath(__file__))
PAL = {
  'getsuga':      dict(who="Shayan's Getsuga Tenshou", echo=["#2a0008","#5a0614","#8a0a1e"], body=["#000000","#07000a","#120012","#1e0418","#30061e"],
                       edge=["#a00a1e","#ff1a3a","#ff7a8a","#ffe0e6"], bolt=["#5a0010","#c0102a","#ff3a50","#ffd0d8"], dark=["#000000","#0c0006","#1e000c","#3a0616"], line="#ff1a3a"),
  'getsuga_jj':   dict(who="Ali's Getsuga Jujishou (rides the Judgement Cut crescent)", echo=["#2a1600","#5a3000","#8a5200"], body=["#000000","#0a0600","#160c02","#241404","#341e06"],
                       edge=["#8a5a00","#ffb020","#ffe070","#fff8d8"], bolt=["#6a4000","#e09a10","#ffe070","#ffffff"], dark=["#000000","#0a0004","#1a0008","#3a0010"], line="#ffb020"),
  'getsuga_gold': dict(who="Ali's Getsuga, second in an alternating chain (1.5x): red and black with the Jujishou's gold lining", echo=["#2a1600","#7a4a00","#c08a10"], body=["#000000","#07000a","#120012","#1e0418","#30061e"],
                       edge=["#a00a1e","#ff1a3a","#ffb020","#fff0b0"], bolt=["#6a4000","#e09a10","#ffe070","#ffffff"], dark=["#000000","#0c0006","#1e000c","#3a0616"], line="#ffb020"),
  'getsuga_omar': dict(who="Omar's Getsuga Tenshou", echo=["#14062a","#2a0a5a","#4a1a8a"], body=["#000000","#05010a","#0c0418","#160a2a","#22103a"],
                       edge=["#4a1a8a","#9a4aff","#d0a0ff","#f4e8ff"], bolt=["#3a0a7a","#8a3aff","#c890ff","#ffffff"], dark=["#000000","#05010a","#100420","#22083a"], line="#9a4aff"),
}
X = -0.32
def P(r, a): return round(X + r * math.cos(math.radians(a)), 3), round(r * math.sin(math.radians(a)), 3)
for name, c in PAL.items():
    random.seed(name)
    L = [
     {"type":"crescent","ramp":c['echo'],"r":0.9,"rIn":0.8,"off":0.3,"x":X,"gain":0.75,"blend":"under","note":"echo outside"},
     {"type":"crescent","ramp":c['body'],"r":0.82,"rIn":0.74,"off":0.36,"x":X,"note":"dark body: a crescent moon"},
     {"type":"crescent","ramp":c['edge'],"r":0.84,"rIn":0.8,"off":0.07,"x":X,"gain":1.1,"note":"bright rim along the outer edge"},
     {"type":"particles","ramp":c['edge'],"mode":"spray","count":22,"x":-0.05,"areaY":0.7,"areaX":0.12,"dir":180,"spread":30,"speed":[0.6,1.4],"life":[0.3,0.7],"shape":"streak","size":2},
    ]
    angs = [-74,-40,-8,24,56,78]
    for a, b in zip(angs, angs[1:]):
        (x0,y0),(x1,y1) = P(0.66,a), P(0.7,b)
        L.append({"type":"bolt","ramp":c['bolt'],"mode":"line","count":1,"x0":x0,"y0":y0,"x1":x1,"y1":y1,"jag":0.55,"depth":4,"branch":0.35,"hold":1,"flicker":0.3,"gain":0.95})
    for a, b in [(-82,-30),(-20,30),(40,84)]:
        (x0,y0),(x1,y1) = P(0.9,a), P(0.92,b)
        L.append({"type":"bolt","ramp":c['dark'],"mode":"line","count":1,"x0":x0,"y0":y0,"x1":x1,"y1":y1,"jag":0.7,"depth":4,"branch":0.5,"hold":1,"flicker":0.25,"gain":0.9})
    j = lambda s: round(random.uniform(-s, s), 3)
    vary = [{"seed":30+i*7,"layers":{"0":{"r":round(0.9+j(.025),3),"off":round(0.3+j(.03),3)},
             "1":{"r":round(0.82+j(.02),3),"off":round(0.36+j(.035),3),"x":round(X+j(.02),3)},
             "2":{"r":round(0.84+j(.02),3),"off":round(0.07+j(.02),3),"x":round(X+j(.02),3)}}} for i in range(8)]
    json.dump({"name":name,"note":c['who']+": camera-facing sprite riding the projectile (06c_pxvfx). Bulges to +x (travel). Written by vfx/getsuga_family.py.",
               "w":128,"h":128,"frames":8,"fps":18,"loop":True,"seed":9,"outline":"outside","outlineColor":c['line'],"pivot":[0.5,0.5],"layers":L,"vary":vary},
              open(os.path.join(HERE,'recipes',name+'.json'),'w'), indent=1)
print('wrote', ', '.join(PAL))
