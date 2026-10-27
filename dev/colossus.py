"""The Sleeping Colossus (the cat-god skeleton on the horizon of Lanternbrook and Starfall Ridge), painted at 2x and
saved as an indexed PNG: a bound god asleep on a mountain, no plants on it: bare carved bone with glowing runes and
gold-mended cracks, a broken titan's sword driven through its ribs, stone stakes and chains pinning it to the ground,
a crystal heart still beating inside the ribcage, crystals breaking out of its spine, its ribs pouring waterfalls,
a temple on its back, chains from its horns into the sky, a rune halo behind its head and light breaking behind it.
Usage: python3 colossus.py dusk|night out.png   (dusk: Lanternbrook, night: Starfall Ridge)"""
import sys, math, random
from PIL import Image, ImageDraw, ImageFilter

PAL = {
    'night': dict(bone=(200, 212, 240), shade=(122, 136, 182), dark=(34, 38, 76), glow=(120, 200, 255), halo=(186, 206, 255),
                  rock=(40, 48, 96), rockD=(20, 24, 54), haze=(34, 50, 124), ray=(214, 226, 255), lamp=(255, 196, 110), steel=(170, 190, 230), gold=(255, 206, 120)),
    'dusk': dict(bone=(240, 220, 203), shade=(184, 154, 144), dark=(90, 66, 80), glow=(255, 176, 224), halo=(255, 216, 160),
                 rock=(110, 84, 128), rockD=(78, 58, 96), haze=(220, 140, 170), ray=(255, 220, 190), lamp=(255, 190, 120), steel=(214, 196, 210), gold=(255, 210, 130)),
}
S = 2
W, H = 1024 * S, 512 * S
rnd = random.Random(7)


def P(pts): return [(x * S, y * S) for x, y in pts]


def layer(): return Image.new('RGBA', (W, H), (0, 0, 0, 0))


def blur(im, r): return im.filter(ImageFilter.GaussianBlur(r * S))


def main(mode, out):
    C = PAL[mode]
    base = layer()

    def comp(im):
        nonlocal base
        base = Image.alpha_composite(base, im)

    HX, HY = 560, 150  # the light breaks behind the top of its back
    # ---- light behind: god rays and the halo glow
    rays = layer(); d = ImageDraw.Draw(rays)
    for i in range(9):
        a = -2.6 + i * .32 + rnd.uniform(-.06, .06); w = .05 + rnd.uniform(0, .05); L = 900
        d.polygon(P([(HX, HY), (HX + math.cos(a - w) * L, HY + math.sin(a - w) * L), (HX + math.cos(a + w) * L, HY + math.sin(a + w) * L)]), fill=C['ray'] + (34,))
    comp(blur(rays, 6))
    gl = layer(); d = ImageDraw.Draw(gl)
    for r, a in [(230, 26), (170, 40), (115, 60)]:
        d.ellipse([(HX - r) * S, (HY - r) * S, (HX + r) * S, (HY + r) * S], fill=C['halo'] + (a,))
    comp(blur(gl, 18))
    # the rune ring
    ring = layer(); d = ImageDraw.Draw(ring)
    for r, wd in [(150, 5), (166, 2)]:
        d.ellipse([(HX - r) * S, (HY - r * .8) * S, (HX + r) * S, (HY + r * .8) * S], outline=C['halo'] + (150,), width=wd * S)
    for i in range(36):
        a = i / 36 * math.tau; x, y = HX + math.cos(a) * 158, HY + math.sin(a) * 158 * .8
        if i % 3: d.rectangle([(x - 3) * S, (y - 2) * S, (x + 3) * S, (y + 2) * S], fill=C['halo'] + (210,))
        else: d.polygon(P([(x, y - 5), (x + 4, y), (x, y + 5), (x - 4, y)]), fill=C['glow'] + (230,))
    comp(Image.alpha_composite(blur(ring, 3), ring))

    # ---- floating islands, far
    isl = layer(); d = ImageDraw.Draw(isl)
    for (x, y, s) in [(70, 110, 24), (980, 80, 30), (930, 250, 16), (150, 40, 12), (700, 50, 14)]:
        d.polygon(P([(x - s, y), (x + s, y), (x + s * .5, y + s * .9), (x, y + s * 1.6), (x - s * .6, y + s * .8)]), fill=C['rockD'] + (230,))
        d.polygon(P([(x - s, y), (x + s, y), (x + s * .7, y - s * .25), (x - s * .8, y - s * .2)]), fill=C['rock'] + (240,))
        d.line(P([(x + s * .3, y + s * .6), (x + s * .3, y + s * 3.5)]), fill=(235, 245, 255, 110), width=2 * S)
    comp(blur(isl, .6))
    # far mountains behind it
    mt = layer(); d = ImageDraw.Draw(mt)
    far = [(0, 512)] + [(x, 300 + 50 * math.sin(x / 120 + 1) + 22 * math.sin(x / 41)) for x in range(0, 1025, 12)] + [(1024, 512)]
    d.polygon(P(far), fill=C['rock'] + (150,))
    comp(blur(mt, 1.5))

    hrt = layer(); dh = ImageDraw.Draw(hrt)
    for r, a in [(70, 50), (46, 90), (26, 150)]:
        dh.ellipse([(585 - r) * S, (372 - r) * S, (585 + r) * S, (372 + r) * S], fill=C['glow'] + (a,))
    comp(blur(hrt, 14)); hrt = layer(); dh = ImageDraw.Draw(hrt)
    for (x, y, h, ang) in [(585, 396, 54, 0), (566, 398, 36, -.45), (604, 398, 40, .4), (576, 400, 24, -.9), (596, 400, 26, .85)]:
        w = h * .3; tip = (x + math.sin(ang) * h, y - math.cos(ang) * h); l = (x - w * math.cos(ang), y - w * math.sin(ang)); r = (x + w * math.cos(ang), y + w * math.sin(ang))
        dh.polygon(P([l, tip, r]), fill=C['glow'] + (255,)); dh.polygon(P([l, tip, ((l[0] + r[0]) / 2, (l[1] + r[1]) / 2)]), fill=tuple(min(255, v + 80) for v in C['glow']) + (255,))
    comp(hrt)

    # a titan's broken sword driven down through its spine (drawn before the bones: they cover the buried blade)
    sw = layer(); ds = ImageDraw.Draw(sw)
    ang = 2.27; ca, sa = math.cos(ang), math.sin(ang); bx, by = 800, 138
    def at(u, v): return (bx + ca * u - sa * v, by + sa * u + ca * v)
    blade = [at(0, -11), at(250, -11), at(262, -3), at(254, 2), at(268, 8), at(0, 11)]
    ds.polygon(P([at(-4, -15), at(254, -15), at(268, -3), at(258, 2), at(274, 12), at(-4, 15)]), fill=C['dark'] + (255,))
    ds.polygon(P(blade), fill=C['steel'] + (255,)); ds.polygon(P([at(0, -11), at(250, -11), at(256, -4), at(0, -2)]), fill=tuple(min(255, v + 40) for v in C['steel']) + (255,))
    ds.line(P([at(10, 0), at(240, 0)]), fill=C['dark'] + (200,), width=2 * S)
    for u in (40, 110, 180): ds.line(P([at(u, -10), at(u + 6, -4), at(u + 2, 4)]), fill=C['dark'] + (230,), width=S)
    ds.polygon(P([at(-6, -46), at(6, -46), at(6, 46), at(-6, 46)]), fill=C['dark'] + (255,)); ds.polygon(P([at(-3, -42), at(3, -42), at(3, 42), at(-3, 42)]), fill=C['gold'] + (255,))
    ds.polygon(P([at(-60, -6), at(-6, -6), at(-6, 6), at(-60, 6)]), fill=(60, 40, 48, 255))
    for u in range(-56, -8, 8): ds.line(P([at(u, -6), at(u + 4, 6)]), fill=C['dark'] + (255,), width=S)
    px, py = at(-68, 0); ds.ellipse([(px - 9) * S, (py - 9) * S, (px + 9) * S, (py + 9) * S], fill=C['gold'] + (255,)); ds.ellipse([(px - 4) * S, (py - 4) * S, (px + 4) * S, (py + 4) * S], fill=C['glow'] + (255,))
    comp(sw)
    sk = layer(); d = ImageDraw.Draw(sk)
    def seg(pts, w, col):
        d.line(P(pts), fill=col, width=max(1, int(w * S)), joint='curve')
        for x, y in pts: r = w / 2; d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=col)
    def bone(pts, w, far=False):
        k = .72 if far else 1
        dk = tuple(int(v * k) for v in C['dark']) + (255,); sh = tuple(int(v * k) for v in C['shade']) + (255,); bn = tuple(int(v * k) for v in C['bone']) + (255,)
        seg(pts, w + 5, dk); seg(pts, w, sh); seg([(x, y - w * .18) for x, y in pts], w * .55, bn)
        seg([(x, y - w * .34) for x, y in pts], max(1, w * .16), C['ray'] + (255,))  # back-light rim
    def knob(x, y, r, far=False):
        k = .72 if far else 1
        d.ellipse([(x - r - 2.5) * S, (y - r - 2.5) * S, (x + r + 2.5) * S, (y + r + 2.5) * S], fill=tuple(int(v * k) for v in C['dark']) + (255,))
        d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=tuple(int(v * k) for v in C['shade']) + (255,))
        d.ellipse([(x - r * .85) * S, (y - r * .95) * S, (x + r * .45) * S, (y + r * .15) * S], fill=tuple(int(v * k) for v in C['bone']) + (255,))
        d.arc([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], 200, 320, fill=C['ray'] + (255,), width=max(1, int(r * .2 * S)))
    # spine: from the neck up over the back and down to the hip (it lies down; ribs reach the ground)
    sp = lambda t: (330 + t * 520, 290 - math.sin(t * math.pi) * 120 + t * 10)
    # far legs (darker)
    bone([(820, 310), (780, 400), (860, 430)], 22, True); bone([(400, 300), (330, 400), (200, 418)], 16, True)
    # tail curling along the ground in front
    for i in range(30):
        u = i / 29; x = 880 + 60 * math.sin(u * 2.2) - u * 380; y = 330 + u * 100 + 18 * math.sin(u * 7)
        knob(x, y, 13 - u * 8)
    # ribs: cathedral arches down to the ground
    ribs = []
    for i in range(14):
        t = .1 + i * .058; x, y = sp(t); gy = 420 + 6 * math.sin(i)
        pts = [(x, y), (x - 34, y + (gy - y) * .35), (x - 30, y + (gy - y) * .7), (x - 8, gy)]
        bone(pts[:2], 13); bone(pts[1:3], 10); bone(pts[2:], 7); ribs.append((x - 26, y + (gy - y) * .45))
    # spine with tall dorsal spikes
    for i in range(34):
        t = i / 33; x, y = sp(t); hh = 22 + math.sin(t * math.pi) * 34
        bone([(x, y), (x + 8, y - hh)], 6); knob(x, y, 13 - abs(t - .45) * 8)
    # pelvis and the folded hind leg
    d.ellipse([790 * S, 258 * S, 900 * S, 330 * S], fill=C['dark'] + (255,)); d.ellipse([794 * S, 261 * S, 896 * S, 325 * S], fill=C['shade'] + (255,)); d.ellipse([802 * S, 264 * S, 870 * S, 296 * S], fill=C['bone'] + (255,))
    bone([(850, 300), (930, 380), (870, 430), (930, 440)], 24); knob(930, 380, 16)
    # the near front leg stretched out, the head resting on it
    bone([(380, 300), (300, 410), (120, 440)], 20); knob(300, 410, 14)
    for k in range(5): bone([(120, 440), (92, 428 + k * 7)], 6)
    # scapula
    d.polygon(P([(360, 250), (440, 236), (400, 330)]), fill=C['dark'] + (255,)); d.polygon(P([(366, 255), (432, 244), (400, 320)]), fill=C['shade'] + (255,))
    # the skull, low, cheek on the paw
    hx, hy = 210, 350; horns = []
    d.ellipse([(hx - 96) * S, (hy - 80) * S, (hx + 96) * S, (hy + 64) * S], fill=C['dark'] + (255,))
    d.polygon(P([(hx - 80, hy + 6), (hx - 150, hy + 30), (hx - 146, hy + 70), (hx - 60, hy + 80)]), fill=C['dark'] + (255,))
    d.ellipse([(hx - 90) * S, (hy - 74) * S, (hx + 90) * S, (hy + 58) * S], fill=C['shade'] + (255,))
    d.polygon(P([(hx - 76, hy + 8), (hx - 142, hy + 32), (hx - 138, hy + 64), (hx - 62, hy + 74)]), fill=C['shade'] + (255,))
    d.ellipse([(hx - 74) * S, (hy - 66) * S, (hx + 64) * S, (hy + 10) * S], fill=C['bone'] + (255,))
    d.arc([(hx - 90) * S, (hy - 74) * S, (hx + 90) * S, (hy + 58) * S], 200, 330, fill=C['ray'] + (255,), width=3 * S)
    # two great curved horns (its ears, turned to bone) and a small circlet between them
    for sd in (-1, 1):
        bx = hx + sd * 34; pts = [(bx + sd * 64 * u * u + sd * 10 * math.sin(u * 3), hy - 62 - 130 * u) for u in [i / 12 for i in range(13)]]
        for i in range(len(pts) - 1):
            w = 26 * (1 - i / 12) + 3; seg([pts[i], pts[i + 1]], w + 5, C['dark'] + (255,))
        for i in range(len(pts) - 1):
            w = 26 * (1 - i / 12) + 3; seg([pts[i], pts[i + 1]], w, C['shade'] + (255,)); seg([(pts[i][0] - sd * 2, pts[i][1]), (pts[i + 1][0] - sd * 2, pts[i + 1][1])], w * .5, C['bone'] + (255,))
            if i % 3 == 1: seg([(pts[i][0] - w / 2, pts[i][1]), (pts[i][0] + w / 2, pts[i][1])], 1.5, C['dark'] + (255,))
        horns.append(pts[-1])
    for k in (-1, 0, 1):
        d.polygon(P([(hx + k * 16 - 7, hy - 64), (hx + k * 16, hy - 92 - (10 if k == 0 else 0)), (hx + k * 16 + 7, hy - 64)]), fill=C['halo'] + (255,))
    d.ellipse([(hx - 146) * S, (hy + 34) * S, (hx - 124) * S, (hy + 52) * S], fill=(18, 14, 20, 255))
    seg([(hx - 140, hy + 74), (hx - 60, hy + 92), (hx + 40, hy + 60)], 14, C['dark'] + (255,)); seg([(hx - 140, hy + 72), (hx - 60, hy + 90), (hx + 40, hy + 58)], 9, C['shade'] + (255,))
    for (x, y, h) in [(hx - 136, hy + 64, 30), (hx - 120, hy + 70, 18), (hx - 104, hy + 74, 12)]: d.polygon(P([(x, y), (x + 5, y + h), (x + 10, y)]), fill=C['bone'] + (255,))
    d.ellipse([(hx - 60) * S, (hy - 30) * S, (hx - 6) * S, (hy + 18) * S], fill=(18, 14, 20, 255))
    d.ellipse([(hx + 30) * S, (hy - 22) * S, (hx + 66) * S, (hy + 4) * S], fill=(18, 14, 20, 255))
    # broken chains from the horn tips into the sky: a god someone tied down
    for (x0, y0), x1 in zip(horns, (90, 330)):
        n = 14
        for i in range(n):
            u = i / n; x = x0 + (x1 - x0) * u; y = y0 - (y0 + 30) * u + math.sin(u * math.pi) * 14
            if i % 2: d.ellipse([(x - 8) * S, (y - 5) * S, (x + 8) * S, (y + 5) * S], outline=C['dark'] + (255,), width=3 * S)
            else: d.ellipse([(x - 5) * S, (y - 8) * S, (x + 5) * S, (y + 8) * S], outline=C['shade'] + (255,), width=3 * S)
    # cracks and weathering speckles on every bone
    a = sk.split()[3]; dd = ImageDraw.Draw(sk)
    def crack(x, y, n, col, w=1.2):
        pts = [(x, y)]
        for i in range(n):
            x += rnd.uniform(-5, 5); y += rnd.uniform(2, 6)
            if a.getpixel((int(min(W / S - 1, max(0, x)) * S), int(min(H / S - 1, max(0, y)) * S))) == 0: break
            pts.append((x, y))
        if len(pts) > 1: dd.line(P(pts), fill=col, width=max(1, int(w * S)))
    for (x, y) in ribs: crack(x + rnd.uniform(-6, 6), y - 20, 6, C['dark'] + (255,))
    for i in range(70):
        x, y = rnd.uniform(100, 940), rnd.uniform(200, 450)
        if a.getpixel((int(x * S), int(y * S))) > 0: crack(x, y, 4, C['dark'] + (220,), 1)
    for (x, y) in [(hx - 40, hy - 64), (hx + 10, hy - 60), (hx + 50, hy - 40), (hx - 70, hy - 20)]: crack(x, y, 7, C['gold'] + (255,), 1.6)
    for i in range(1400):
        x, y = rnd.uniform(60, 960), rnd.uniform(40, 470)
        if a.getpixel((int(x * S), int(y * S))) > 0:
            dd.rectangle([x * S, y * S, (x + rnd.uniform(1, 3)) * S, (y + 1) * S], fill=C['shade'] + (140,))
    comp(sk)

    # ---- crystals breaking out of the bone
    cr = layer(); dc = ImageDraw.Draw(cr)
    def crystal(x, y, h, ang):
        w = h * .26; tip = (x + math.sin(ang) * h, y - math.cos(ang) * h); l = (x - w * math.cos(ang), y - w * math.sin(ang)); r = (x + w * math.cos(ang), y + w * math.sin(ang))
        dc.polygon(P([l, tip, r]), fill=C['glow'] + (255,)); dc.polygon(P([l, tip, ((l[0] + r[0]) / 2, (l[1] + r[1]) / 2)]), fill=tuple(min(255, v + 70) for v in C['glow']) + (255,))
    for t, n in [(.18, 3), (.33, 4), (.5, 5), (.62, 3), (.78, 4)]:
        x, y = sp(t)
        for k in range(n): crystal(x + rnd.uniform(-14, 14), y - 6, rnd.uniform(18, 46), rnd.uniform(-.5, .5))
    for (x, y, n) in [(hx - 10, hy - 70, 4), (120, 440, 3), (930, 440, 3), (560, 425, 3)]:
        for k in range(n): crystal(x + rnd.uniform(-12, 12), y, rnd.uniform(16, 36), rnd.uniform(-.6, .6))
    comp(Image.alpha_composite(blur(cr, 6), cr))

    # ---- the temple on its back and lanterns along the spine
    tp = layer(); d = ImageDraw.Draw(tp)
    tx, ty = sp(.55); ty -= 26
    for k, (w, h) in enumerate([(56, 12), (44, 11), (32, 10), (20, 9)]):
        y = ty - k * 16
        d.rectangle([(tx - w * .35) * S, (y - 9) * S, (tx + w * .35) * S, y * S], fill=(60, 40, 48, 255))
        d.polygon(P([(tx - w / 2, y - 9), (tx + w / 2, y - 9), (tx + w * .3, y - 9 - h * .7), (tx - w * .3, y - 9 - h * .7)]), fill=(150, 40, 50, 255))
        d.rectangle([(tx - 2) * S, (y - 7) * S, (tx + 2) * S, (y - 2) * S], fill=C['lamp'] + (255,))
    d.line(P([(tx, ty - 74), (tx, ty - 96)]), fill=(60, 40, 48, 255), width=2 * S)
    lamps = layer(); dl = ImageDraw.Draw(lamps)
    for i in range(22):
        t = .05 + i * .043; x, y = sp(t); y -= 14 + math.sin(t * math.pi) * 6
        dl.ellipse([(x - 2) * S, (y - 2) * S, (x + 2) * S, (y + 2) * S], fill=C['lamp'] + (255,))
    for i in range(12):
        x, y = 440 + i * 30, 430 - (i % 3) * 3
        dl.ellipse([(x - 2) * S, (y - 2) * S, (x + 2) * S, (y + 2) * S], fill=C['lamp'] + (255,))
    comp(tp); comp(Image.alpha_composite(blur(lamps, 4), lamps))

    # ---- runes carved along the ribs, the legs and the brow
    rn = layer(); dr = ImageDraw.Draw(rn)
    def rune(x, y, k):
        g = [[(0, -6), (0, 6)], [(-4, -4), (4, 4)], [(-4, 4), (4, -4)], [(-4, -2), (4, -2)], [(-3, 4), (3, 4)], [(0, -6), (4, -2)]]
        for q in range(3 + k % 3): (p0, p1) = g[(k * 7 + q * 3) % len(g)]; dr.line(P([(x + p0[0], y + p0[1]), (x + p1[0], y + p1[1])]), fill=C['glow'] + (255,), width=int(1.5 * S))
    for k, (x, y) in enumerate(ribs[1::2]): rune(x + 4, y + 10, k)
    for k, (x, y) in enumerate([(330, 392), (240, 424), (900, 404), (880, 428), (hx - 20, hy - 46), (hx + 30, hy - 30)]): rune(x, y, k + 5)
    comp(Image.alpha_composite(blur(rn, 3), rn))
    # stone stakes in the ground with chains thrown over its bones
    ch = layer(); dch = ImageDraw.Draw(ch)
    for (sx, sy, tx2, ty2) in [(70, 452, 150, 430), (420, 452, 380, 304), (760, 452, 800, 300), (990, 452, 930, 384), (300, 456, 330, 370)]:
        dch.polygon(P([(sx - 9, sy), (sx - 6, sy - 46), (sx, sy - 54), (sx + 6, sy - 46), (sx + 9, sy)]), fill=C['rockD'] + (255,))
        dch.line(P([(sx - 3, sy - 44), (sx - 3, sy - 4)]), fill=C['rock'] + (255,), width=2 * S)
        n = 12
        for k in range(n + 1):
            u = k / n; x = sx + (tx2 - sx) * u; y = sy - 46 + (ty2 - sy + 46) * u + math.sin(u * math.pi) * 16
            if k % 2: dch.ellipse([(x - 6) * S, (y - 4) * S, (x + 6) * S, (y + 4) * S], outline=C['dark'] + (255,), width=3 * S)
            else: dch.ellipse([(x - 4) * S, (y - 6) * S, (x + 4) * S, (y + 6) * S], outline=C['shade'] + (255,), width=3 * S)
    comp(ch)

    # ---- the sleeping eye still glows
    ey = layer(); d = ImageDraw.Draw(ey)
    d.ellipse([(hx - 58) * S, (hy - 26) * S, (hx - 8) * S, (hy + 14) * S], fill=C['glow'] + (255,))
    comp(blur(ey, 10)); d2 = ImageDraw.Draw(base); d2.ellipse([(hx - 44) * S, (hy - 14) * S, (hx - 24) * S, (hy + 2) * S], fill=C['glow'] + (255,)); d2.ellipse([(hx - 38) * S, (hy - 11) * S, (hx - 32) * S, (hy - 5) * S], fill=(255, 255, 255, 255))

    # ---- waterfalls between the ribs into mist; near cliffs burying the feet
    wf = layer(); d = ImageDraw.Draw(wf)
    for k, (x, y) in enumerate(ribs[2:12:2]):
        for j in range(3):
            xx = x + j * 3 - 3; d.line(P([(xx, y), (xx + rnd.uniform(-2, 2), 440)]), fill=(235, 245, 255, 150 + j * 30), width=int((3 - j) * S))
    mist = layer(); dm = ImageDraw.Draw(mist)
    for i in range(60):
        x = rnd.uniform(380, 900); y = rnd.uniform(400, 445); r = rnd.uniform(14, 34)
        dm.ellipse([(x - r) * S, (y - r * .45) * S, (x + r) * S, (y + r * .45) * S], fill=(245, 250, 255, 70))
    comp(Image.alpha_composite(blur(wf, 1), wf)); comp(blur(mist, 6))
    nc = layer(); d = ImageDraw.Draw(nc)
    near = [(0, 512)] + [(x, 440 + 22 * math.sin(x / 55 + .5) + 12 * math.sin(x / 19) - (30 if 600 < x < 760 else 0)) for x in range(0, 1025, 8)] + [(1024, 512)]
    d.polygon(P(near), fill=C['rockD'] + (255,))
    for x in range(0, 1024, 26):
        y = 440 + 22 * math.sin(x / 55 + .5) + 12 * math.sin(x / 19) - (30 if 600 < x < 760 else 0)
        hh = 10 + rnd.uniform(0, 16); d.polygon(P([(x - 7, y + 2), (x - 2, y - hh), (x + 1, y - hh * .7), (x + 7, y + 2)]), fill=C['rockD'] + (255,))
        d.line(P([(x - 2, y - hh), (x - 5, y)]), fill=C['rock'] + (255,), width=S)
    comp(nc)

    # ---- birds
    bd = ImageDraw.Draw(base)
    for i in range(9):
        x, y = rnd.uniform(420, 980), rnd.uniform(60, 160)
        bd.line(P([(x - 5, y - 2), (x, y), (x + 5, y - 2)]), fill=C['dark'] + (200,), width=S)

    # ---- haze: the lower it is, the more it melts into the sky
    a = base.split()[3]
    hz = Image.new('RGBA', (W, H), C['haze'] + (0,)); px = hz.load()
    for y in range(H):
        k = int(255 * min(1, max(0, (y / H - .35) / .65)) * .72)
        for x in range(0, W): px[x, y] = C['haze'] + (k,)
    hz.putalpha(Image.composite(Image.new('L', (W, H), 0), hz.split()[3], Image.eval(a, lambda v: 255 - v)))
    base = Image.alpha_composite(base, hz)
    # far edges fade (no hard rectangle edge on the horizon)
    m = Image.new('L', (W, H)); m.putdata([int(255 * min(1, x / (60 * S), (W - 1 - x) / (60 * S), (H - 1 - y) / (50 * S))) for y in range(H) for x in range(W)])
    base.putalpha(Image.composite(base.split()[3], Image.new('L', (W, H), 0), m))
    im = base.resize((1024, 512), Image.LANCZOS)
    # indexed, transparency kept
    al = im.split()[3].point(lambda v: 0 if v < 8 else v)
    im.putalpha(al)
    q = im.quantize(colors=255, method=Image.Quantize.FASTOCTREE)
    q.save(out, optimize=True)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
