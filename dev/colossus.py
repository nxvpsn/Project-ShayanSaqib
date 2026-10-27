"""The Sleeping Colossus (the cat-god skeleton on the horizon of Lanternbrook and Starfall Ridge), painted at 2x and
saved as an indexed PNG: a bound god asleep on a mountain, its ribs pouring waterfalls, crystals growing out of its
spine, a temple on its hip, chains from its horns into the sky, a rune halo behind its head and light breaking behind it.
Usage: python3 colossus.py day|dusk out.png"""
import sys, math, random
from PIL import Image, ImageDraw, ImageFilter

PAL = {
    'day': dict(bone=(244, 239, 226), shade=(184, 178, 164), dark=(84, 86, 108), glow=(143, 240, 255), halo=(255, 242, 192),
                rock=(92, 108, 150), rockD=(64, 76, 112), moss=(104, 150, 96), haze=(170, 195, 235), ray=(255, 250, 225), lamp=(255, 200, 110)),
    'dusk': dict(bone=(240, 220, 203), shade=(184, 154, 144), dark=(90, 66, 80), glow=(255, 176, 224), halo=(255, 216, 160),
                 rock=(110, 84, 128), rockD=(78, 58, 96), moss=(150, 120, 110), haze=(220, 140, 170), ray=(255, 220, 190), lamp=(255, 190, 120)),
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
        d.polygon(P([(x - s, y), (x + s, y), (x + s * .7, y - s * .25), (x - s * .8, y - s * .2)]), fill=C['moss'] + (230,))
        d.line(P([(x + s * .3, y + s * .6), (x + s * .3, y + s * 3.5)]), fill=(235, 245, 255, 110), width=2 * S)
    comp(blur(isl, .6))
    # far mountains behind it
    mt = layer(); d = ImageDraw.Draw(mt)
    far = [(0, 512)] + [(x, 300 + 50 * math.sin(x / 120 + 1) + 22 * math.sin(x / 41)) for x in range(0, 1025, 12)] + [(1024, 512)]
    d.polygon(P(far), fill=C['rock'] + (150,))
    comp(blur(mt, 1.5))

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
    for i in range(1400):
        x, y = rnd.uniform(60, 960), rnd.uniform(40, 470)
        if a.getpixel((int(x * S), int(y * S))) > 0:
            dd.rectangle([x * S, y * S, (x + rnd.uniform(1, 3)) * S, (y + 1) * S], fill=C['shade'] + (140,))
    comp(sk)

    # ---- moss, little trees and a staircase of lanterns along the spine; crystals breaking out of the bone
    gr = layer(); d = ImageDraw.Draw(gr)
    for i in range(420):
        x, y = rnd.uniform(60, 960), rnd.uniform(40, 470)
        if a.getpixel((int(x * S), int(y * S))) > 0 and rnd.random() < .5:
            d.ellipse([(x - 3) * S, (y - 1.4) * S, (x + 4) * S, (y + 1.4) * S], fill=C['moss'] + (200,))
    for i in range(30):
        t = .03 + i * .032; x, y = sp(t); y -= 6
        d.polygon(P([(x - 4, y), (x, y - 12 - rnd.uniform(0, 8)), (x + 4, y)]), fill=(46, 82, 58, 255))
    comp(gr)
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
        d.polygon(P([(x - 6, y + 2), (x, y - 14 - rnd.uniform(0, 10)), (x + 6, y + 2)]), fill=(40, 70, 56, 255))
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
