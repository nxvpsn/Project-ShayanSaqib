"""Nathan's mech in 8 directions: a small 3D model (signed distance fields: armour plates, joints, the energy blade and
jagged energy wings), ray-marched orthographically at the game's camera elevation and cut into pixel art (hard light
bands in the original sprite's palette, a 1px dark outline, inner lines where depth jumps). Saved as an indexed PNG.
Columns: facings S, SE, E, NE, N, NW, W, SW (same order as Shayan's and Ali's sheets). Rows: ANIMS below, in order.
Usage: python3 nathan_sprite.py ../img/nathan/nathan.png [--preview out.png] [--only idle0]"""
import sys, math, random
import numpy as np
from PIL import Image

CW, CH, S = 176, 192, 31.0          # cell size (px), pixels per model unit
FOOT = CH - 6                        # pixel row of the feet
ELEV = math.radians(20)              # camera elevation
ANIMS = ['idle0', 'idle1', 'idle2', 'idle3', 'dash0', 'dash1', 'slash0', 'slash1', 'slash2', 'hurt']

def hx(s): return tuple(int(s[i:i + 2], 16) for i in (1, 3, 5))
# material ramps, dark -> light (from the original sprite)
RAMP = {
    'white': ['#3a2a38', '#605058', '#8e8794', '#b8b8b0', '#e4e8e8', '#f8f8f8'],
    'slate': ['#141a30', '#232c4a', '#384468', '#506080', '#7888b0', '#9eaed4'],
    'navy': ['#0c1024', '#141c34', '#1c2a44', '#284058', '#3a5674', '#4e6c8c'],
    'joint': ['#100010', '#1c0814', '#280010', '#482028', '#684858', '#806070'],
    'foot': ['#2a1a22', '#402830', '#5a4048', '#605058', '#8a7a80', '#b0a8a8'],
}
GLOW = ['#1a5a78', '#287898', '#30e0e8', '#00f8f8', '#9ef8f8', '#e8ffff']
OUT = hx('#100010'); OUTG = hx('#0a3448')
MATS = ['white', 'slate', 'navy', 'joint', 'foot', 'glow']
MI = {m: i for i, m in enumerate(MATS)}

def nrm(v): v = np.asarray(v, float); return v / (np.linalg.norm(v) or 1)
def rot_x(a): c, s = math.cos(a), math.sin(a); return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
def rot_y(a): c, s = math.cos(a), math.sin(a); return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
def frame_y(d):  # a rotation whose local Y axis is d
    y = nrm(d); x = np.cross(y, [0, 0, 1.0]);
    if np.linalg.norm(x) < 1e-3: x = np.array([1.0, 0, 0])
    x = nrm(x); z = np.cross(x, y); return np.stack([x, y, z], 1)

# ---------- primitives: (kind, material, params) ----------
def sd_cap(p, a, b, ra, rb):
    pa = p - a; ba = b - a; h = np.clip((pa @ ba) / (ba @ ba), 0, 1)
    return np.linalg.norm(pa - h[:, None] * ba, axis=1) - (ra + (rb - ra) * h)
def sd_ell(p, c, r, R):
    q = (p - c) @ R; k0 = np.linalg.norm(q / r, axis=1); k1 = np.linalg.norm(q / (r * r), axis=1)
    return k0 * (k0 - 1) / np.maximum(k1, 1e-6)
def sd_box(p, c, h, R, rr):
    q = np.abs((p - c) @ R) - (h - rr)
    return np.linalg.norm(np.maximum(q, 0), axis=1) + np.minimum(q.max(1), 0) - rr

class Model:
    def __init__(s): s.prims = []
    def cap(s, m, a, b, ra, rb=None): s.prims.append(('c', MI[m], np.array(a, float), np.array(b, float), ra, ra if rb is None else rb))
    def ell(s, m, c, r, R=None): s.prims.append(('e', MI[m], np.array(c, float), np.array(r, float), np.eye(3) if R is None else R))
    def box(s, m, c, h, R=None, rr=.05): s.prims.append(('b', MI[m], np.array(c, float), np.array(h, float), np.eye(3) if R is None else R, rr))
    def sdf(s, p, want_mat=False):
        d = np.full(len(p), 1e9); mat = np.zeros(len(p), np.int8)
        for pr in s.prims:
            if pr[0] == 'c': di = sd_cap(p, pr[2], pr[3], pr[4], pr[5])
            elif pr[0] == 'e': di = sd_ell(p, pr[2], pr[3], pr[4])
            else: di = sd_box(p, pr[2], pr[3], pr[4], pr[5])
            if want_mat: m = di < d; mat[m] = pr[1]
            d = np.minimum(d, di)
        return (d, mat) if want_mat else d

# ---------- the poses ----------
# per anim: lean (upper body pitch about the hips), blade arm (upper, fore, blade dirs), big arm (upper, fore),
# legs (thigh, shin per side), head pitch, breath (y), wing spread
P = {
 'idle': dict(lean=.04, aL=[(.14, -1, .06), (.06, -.85, .5), (.32, -.55, .78)], aR=[(-.1, -1, .06), (-.02, -1, .18)],
              legs=[[(.07, -1, .1), (0, -1, -.16)], [(-.07, -1, .1), (0, -1, -.16)]], head=0, wing=1.0),
 'dash': dict(lean=.42, aL=[(.25, -.6, -.7), (.12, -.35, -.93), (.1, -.25, -1)], aR=[(-.25, -.55, -.75), (-.1, -.35, -.95)],
              legs=[[(.05, -.75, -.6), (0, -.45, -.9)], [(-.05, -.8, -.5), (0, -.5, -.85)]], head=-.25, wing=1.2),
 'slash0': dict(lean=-.12, aL=[(.35, .55, -.45), (.05, .95, -.25), (-.25, .35, -.9)], aR=[(-.1, -.55, .8), (.25, -.15, 1)],
              legs=[[(.15, -.9, .38), (0, -1, -.3)], [(-.15, -.9, -.2), (0, -1, -.1)]], head=.1, wing=1.1),
 'slash1': dict(lean=.3, aL=[(-.15, -.1, 1), (-.65, -.1, .75), (-1, -.04, .25)], aR=[(-.2, -.7, -.6), (-.1, -.6, -.8)],
              legs=[[(.1, -.8, .55), (0, -1, -.2)], [(-.1, -.85, -.45), (0, -.9, -.4)]], head=.05, wing=1.3),
 'slash2': dict(lean=.2, aL=[(-.45, -.55, .6), (-.75, -.6, .2), (-.55, -.7, -.35)], aR=[(-.15, -.9, -.2), (-.05, -.95, .1)],
              legs=[[(.1, -.85, .5), (0, -1, -.2)], [(-.1, -.9, -.35), (0, -.95, -.3)]], head=0, wing=1.1),
 'hurt': dict(lean=-.35, aL=[(.9, .15, .1), (.8, .55, 0), (.45, .88, -.1)], aR=[(-.9, .25, 0), (-.75, .6, 0)],
              legs=[[(.12, -1, -.25), (0, -1, .25)], [(-.12, -1, -.2), (0, -1, .2)]], head=-.45, wing=.7),
}

def build(anim, k):
    pose = P['idle' if anim.startswith('idle') else 'dash' if anim.startswith('dash') else anim]
    M = Model(); rng = random.Random(hash((anim, k)) & 0xffff)
    breath = .035 * math.sin(k / 4 * 2 * math.pi) if anim.startswith('idle') else 0
    hip = np.array([0, 2.12, 0]); U = rot_x(pose['lean'])
    up = lambda v: hip + U @ (np.array(v, float) - hip) + np.array([0, breath, 0])   # upper-body point
    # legs (hovering: they hang from the hips)
    for side, (t1, t2) in zip((1, -1), pose['legs']):
        h = np.array([.3 * side, 2.04, 0]); kn = h + nrm(t1) * .78; an = kn + nrm(t2) * .95
        M.ell('joint', h, (.2, .2, .2)); M.cap('navy', h, kn, .25, .19); M.ell('white', (h + kn) / 2 + np.array([.04 * side, 0, .1]), (.2, .3, .17), frame_y(kn - h))
        M.cap('white', kn, an, .2, .15); M.cap('navy', kn + np.array([0, 0, -.08]), an + np.array([0, .1, -.08]), .15, .11)
        fz = nrm(np.cross([1.0, 0, 0], nrm(t2)) * -1); R = np.stack([np.array([1.0, 0, 0]), nrm(np.cross(fz, [1.0, 0, 0])), fz], 1)
        M.ell('white', kn + fz * .12, (.21, .25, .18), frame_y(t2)); M.ell('joint', an, (.13, .13, .13)); M.ell('glow', kn + fz * .3, (.06, .06, .05))
        M.box('foot', an - nrm(t2) * .14 + fz * .14, (.17, .11, .3), R, .06)
    # pelvis, waist, belly, chest, back
    M.box('navy', up((0, 2.12, 0)), (.43, .16, .26), U, .08); M.box('white', up((0, 2.0, .2)), (.13, .13, .08), U, .04)
    M.cap('joint', up((0, 2.2, 0)), up((0, 2.6, 0)), .22)
    M.box('slate', up((0, 2.5, .12)), (.27, .15, .2), U, .07)
    M.box('white', up((0, 2.98, .02)), (.47, .4, .3), U, .14)
    for s in (1, -1): M.cap('navy', up((.3 * s, 3.26, .29)), up((0, 2.8, .33)), .045)
    M.ell('glow', up((0, 3.06, .31)), (.085, .085, .06), U)
    M.box('navy', up((0, 3.0, -.36)), (.36, .38, .2), U, .1)
    # head: neck, helmet, visor, the crest arch
    H = U @ rot_x(pose['head'])
    hc = up((0, 3.74, .05)); M.cap('joint', up((0, 3.36, 0)), up((0, 3.56, .03)), .12)
    M.box('white', hc, (.2, .23, .21), H, .09); M.box('joint', hc + H @ np.array([0, -.08, .12]), (.12, .07, .1), H, .03)
    M.box('glow', hc + H @ np.array([0, .04, .22]), (.15, .05, .04), H, .02)
    arc = [hc + H @ np.array([.3 * math.cos(a), .2 + .32 * math.sin(a), -.06]) for a in np.linspace(.25, math.pi - .25, 7)]
    for a, b in zip(arc, arc[1:]): M.cap('white', a, b, .055)
    # shoulders: the big pauldron (his right), the small one, horns
    M.ell('slate', up((-.8, 3.33, 0)), (.4, .33, .38), U); M.ell('navy', up((-.84, 3.18, 0)), (.42, .14, .4), U)
    M.cap('white', up((-.92, 3.55, 0)), up((-1.18, 3.95, -.06)), .09, .02)
    M.ell('slate', up((.7, 3.3, 0)), (.3, .27, .3), U); M.ell('glow', up((-.8, 3.3, .38)), (.07, .07, .05), U); M.ell('glow', up((.7, 3.3, .29)), (.06, .06, .05), U); M.cap('white', up((.78, 3.5, 0)), up((.98, 3.8, -.04)), .07, .02)
    # the big arm (his right): upper arm, elbow, the round gauntlet, fist
    sR = up((-.85, 3.15, 0)); eR = sR + U @ nrm(pose['aR'][0]) * .55; dR = U @ nrm(pose['aR'][1])
    M.cap('navy', sR, eR, .18); M.ell('joint', eR, (.16, .16, .16)); M.ell('slate', eR + dR * .42, (.31, .42, .31), frame_y(dR))
    M.ell('navy', eR + dR * .3, (.33, .12, .33), frame_y(dR)); M.ell('joint', eR + dR * .86, (.19, .19, .19))
    # the blade arm (his left): upper arm, forearm, hand, hilt, the energy blade
    sL = up((.74, 3.12, 0)); eL = sL + U @ nrm(pose['aL'][0]) * .6; hL = eL + U @ nrm(pose['aL'][1]) * .6; bd = U @ nrm(pose['aL'][2])
    M.cap('navy', sL, eL, .16); M.ell('joint', eL, (.14, .14, .14)); M.cap('white', eL, hL, .16, .13); M.ell('joint', hL, (.13, .13, .13))
    M.cap('navy', hL - bd * .12, hL + bd * .2, .06); M.cap('glow', hL + bd * .2, hL + bd * 2.0, .065, .04)
    # the energy wings: jagged spikes off the backpack, flickering
    sp = pose['wing'] * (1 + (.06 * math.sin(k * 2.1) if anim.startswith('idle') else 0))
    spikes = [(.5, .85, .5, 2.1, .2), (.9, .45, .5, 2.0, .2), (1, .0, .45, 1.6, .17), (.25, 1, .55, 1.6, .16), (.85, -.4, .4, 1.15, .14)]
    for side in (1, -1):
        root = up((.2 * side, 3.25, -.52))
        for i, (a, b, c, L, r) in enumerate(spikes):
            d = U @ nrm((a * side, b, -c)); L = L * sp * (1 + rng.uniform(-.07, .07)); perp = nrm(np.cross(d, [0, 0, 1.0]))
            m1 = root + d * L * .35 + perp * rng.uniform(-.1, .1); m2 = root + d * L * .7 + perp * rng.uniform(-.16, .16); tip = root + d * L
            M.cap('glow', root, m1, r * .7, r); M.cap('glow', m1, m2, r, r * .55); M.cap('glow', m2, tip, r * .55, .015)
            for m, f in ((m1, .45), (m2, .3)):   # jagged side shards
                sd = rng.choice((-1, 1)); M.cap('glow', m, m + nrm(d * .6 + perp * sd + np.array([0, .25, -.2])) * L * f, r * .45, .01)
    return M

# ---------- rendering ----------
FWD = np.array([0, -math.sin(ELEV), -math.cos(ELEV)]); RIGHT = np.array([1.0, 0, 0]); UP = np.array([0, math.cos(ELEV), -math.sin(ELEV)])
LIGHT = nrm((-.55, .75, .55))   # from the upper left, toward the camera (fixed in view space)

def render(M, yaw):
    R = rot_y(-yaw)   # world -> model
    cols, rows = np.meshgrid(np.arange(CW) + .5, np.arange(CH) + .5)
    sx = (cols - CW / 2) / S; sy = (FOOT - rows) / S
    org = sx[..., None] * RIGHT + sy[..., None] * UP; org = org.reshape(-1, 3); d = FWD
    C = np.array([0, 2.7, 0]); tc = (C - org) @ d; dist = np.linalg.norm(org + tc[:, None] * d - C, axis=1)
    live = np.where(dist < 4.3)[0]; t = tc[live] - 4.3; hit = np.zeros(len(org), bool); T = np.full(len(org), 1e9)
    idx = live.copy(); tt = t.copy()
    for _ in range(90):
        if not len(idx): break
        p = (org[idx] + tt[:, None] * d) @ R.T
        dd = M.sdf(p); h = dd < .004; hit[idx[h]] = True; T[idx[h]] = tt[h]
        far = tt > tc[idx] + 4.3; keep = ~h & ~far; idx = idx[keep]; tt = tt[keep] + dd[keep] * .9
    hi = np.where(hit)[0]; P0 = (org[hi] + T[hi, None] * d) @ R.T
    _, mat = M.sdf(P0, True); e = .01; n = np.zeros_like(P0)
    for a in range(3):
        o = np.zeros(3); o[a] = e; n[:, a] = M.sdf(P0 + o) - M.sdf(P0 - o)
    n = n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-9); nw = n @ R   # model -> world normals
    lam = np.clip(nw @ LIGHT, 0, 1); facing = np.clip(-(nw @ FWD), 0, 1)
    img = np.zeros((len(org), 4), np.uint8); depth = np.full(len(org), 1e9); depth[hi] = T[hi]; mats = np.full(len(org), -1); mats[hi] = mat
    for mi, mname in enumerate(MATS):
        sel = mat == mi
        if not sel.any(): continue
        if mname == 'glow': v = .25 + .75 * facing[sel] ** 1.6; ramp = GLOW
        else: v = .08 + .78 * lam[sel] + .2 * facing[sel] ** 3; ramp = RAMP[mname]
        k = np.clip((v * len(ramp)).astype(int), 0, len(ramp) - 1); colv = np.array([hx(c) for c in ramp])[k]
        img[hi[sel], :3] = colv; img[hi[sel], 3] = 255
    img = img.reshape(CH, CW, 4); depth = depth.reshape(CH, CW); mats = mats.reshape(CH, CW)
    # inner lines: a pixel behind a nearer neighbour (depth jump) goes dark
    a = img[..., 3] > 0; out = img.copy()
    for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
        nd = np.roll(np.roll(depth, dy, 0), dx, 1); na = np.roll(np.roll(a, dy, 0), dx, 1)
        line = a & na & (depth - nd > .32) & (mats != MI['glow'])
        out[line, :3] = OUT
    # the silhouette outline (teal around the energy, dark around the armour)
    o = out.copy()
    for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
        na = np.roll(np.roll(a, dy, 0), dx, 1); nm = np.roll(np.roll(mats, dy, 0), dx, 1)
        edge = ~a & na & (o[..., 3] == 0)
        o[edge & (nm == MI['glow']), :3] = OUTG; o[edge & (nm != MI['glow']), :3] = OUT; o[edge, 3] = 255
    return o

def sheet(path, only=None, preview=None):
    anims = [only] if only else ANIMS; im = np.zeros((CH * len(anims), CW * 8, 4), np.uint8)
    for r, an in enumerate(anims):
        k = int(an[-1]) if an[-1].isdigit() else 0
        for c in range(8):
            im[r * CH:(r + 1) * CH, c * CW:(c + 1) * CW] = render(build(an, k), c * math.pi / 4)
        print(an, flush=True)
    rgba = Image.fromarray(im, 'RGBA')
    if preview: rgba.resize((rgba.width * 2 // 2, rgba.height * 2 // 2), Image.NEAREST).save(preview)
    if path:  # indexed, index 0 transparent
        alpha = im[..., 3] > 0; rgb = Image.fromarray(np.where(alpha[..., None], im[..., :3], 0).astype(np.uint8), 'RGB')
        q = rgb.quantize(colors=63, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE); pal = q.getpalette()[:63 * 3]
        idx = np.array(q, np.uint8) + 1; idx[~alpha] = 0; out = Image.fromarray(idx, 'P'); out.putpalette([0, 0, 0] + pal)
        out.info['transparency'] = 0; out.save(path, optimize=True, transparency=0)

if __name__ == '__main__':
    a = sys.argv[1:]; only = a[a.index('--only') + 1] if '--only' in a else None; prev = a[a.index('--preview') + 1] if '--preview' in a else None
    sheet(a[0] if a and not a[0].startswith('--') else None, only, prev)
