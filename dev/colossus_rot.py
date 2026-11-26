"""The Rotting Colossus: Lanternbrook's horizon (img/colossus_dusk.png). A brand-new painting (owner, Nov 26 2026:
"very disgusting / rotten / ominous"), not the bound god of colossus.py: the carcass of a cat the size of a mountain
range, slumped on its side. Yellowed bone under sheets of black-red flesh that hang off the ribs in strips, green rot
and pale fungus, ichor running out of the ribcage in long threads, a dislocated jaw full of fangs, one socket still lit
a sick green, clouds of flies and a few carrion birds, a green-yellow miasma behind it against the dusk.
Painted at 2x, saved as a 1024x512 indexed PNG that keeps its transparency.
Usage: python3 colossus_rot.py ../img/colossus_dusk.png"""
import sys, math, random
from PIL import Image, ImageDraw, ImageFilter

S = 2
W, H = 1024 * S, 512 * S
rnd = random.Random(13)
BONE, BONE_S, BONE_D, BONE_H = (205, 191, 152), (140, 122, 88), (58, 44, 42), (236, 226, 190)
FLESH, FLESH_D, FLESH_H = (92, 30, 38), (48, 16, 24), (140, 52, 50)
ROT, ROT_H, ICHOR, GLOW = (84, 98, 40), (140, 156, 58), (38, 48, 18), (190, 232, 80)
FUNGUS, MAGGOT, FLY = (214, 204, 170), (242, 236, 206), (16, 12, 14)


BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def P(pts): return [(x * S, y * S) for x, y in pts]
def layer(): return Image.new('RGBA', (W, H), (0, 0, 0, 0))
def blur(im, r): return im.filter(ImageFilter.GaussianBlur(r * S))
def lerp(a, b, k): return a + (b - a) * k


def bez(p0, p1, p2, n=24):
    return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]) for t in [i / n for i in range(n + 1)]]


def bone(d, pts, w, tone=1.0):
    """a bone: dark outline, shaded body, a lit upper edge"""
    q = P(pts); d.line(q, fill=BONE_D + (255,), width=int((w + 4) * S), joint='curve')
    d.line(q, fill=tuple(int(c * tone) for c in BONE_S) + (255,), width=int(w * S), joint='curve')
    d.line([(x, y - w * S * .18) for x, y in q], fill=tuple(int(c * tone) for c in BONE) + (255,), width=max(1, int(w * S * .55)), joint='curve')
    d.line([(x, y - w * S * .34) for x, y in q], fill=tuple(int(c * tone) for c in BONE_H) + (255,), width=max(1, int(w * S * .16)), joint='curve')
    for x, y in (q[0], q[-1]):
        r = (w * .72 + 2) * S; d.ellipse([x - r, y - r, x + r, y + r], fill=BONE_D + (255,)); r = w * .62 * S; d.ellipse([x - r, y - r, x + r, y + r], fill=tuple(int(c * tone) for c in BONE_S) + (255,))
        r2 = w * .4 * S; d.ellipse([x - r2, y - r - 0 + (r - r2) * .2, x + r2, y - r + r2 * 2], fill=tuple(int(c * tone) for c in BONE) + (255,))


def blob(d, cx, cy, rx, ry, col, n=14, jag=.28, seed=0):
    r = random.Random(seed); pts = []
    for i in range(n):
        a = i / n * math.tau; k = 1 + r.uniform(-jag, jag); pts.append((cx + math.cos(a) * rx * k, cy + math.sin(a) * ry * k))
    d.polygon(P(pts), fill=col + (255,))


def drip(d, x, y, ln, w, col):
    d.line(P([(x, y), (x + rnd.uniform(-2, 2), y + ln)]), fill=col + (255,), width=max(1, int(w * S)))
    r = w * 1.3 * S; d.ellipse([x * S - r, (y + ln) * S - r, x * S + r, (y + ln) * S + r * 1.6], fill=col + (255,))


def main(out):
    im = layer()
    # the miasma behind it: a sick light, and darker smoke climbing
    g = layer(); d = ImageDraw.Draw(g)
    d.ellipse(P([(120, 90), (900, 470)]), fill=GLOW + (70,)); d.ellipse(P([(160, 140), (470, 400)]), fill=(226, 250, 120, 110)); d.ellipse(P([(560, 120), (880, 380)]), fill=(120, 150, 50, 60))
    im.alpha_composite(blur(g, 34))
    g = layer(); d = ImageDraw.Draw(g)
    for i in range(9):
        x = 250 + i * 70 + rnd.uniform(-20, 20); pts = bez((x, 300), (x + rnd.uniform(-70, 70), 170), (x + rnd.uniform(-110, 110), 20), 16)
        d.line(P(pts), fill=(30, 38, 20, 44), width=int(rnd.uniform(14, 30) * S), joint='curve')
    im.alpha_composite(blur(g, 12))
    d = ImageDraw.Draw(im)
    # the mound it lies on, soaked
    d.polygon(P([(40, 512), (90, 440), (190, 410), (330, 398), (520, 384), (700, 392), (850, 410), (960, 446), (1000, 512)]), fill=(34, 26, 30, 255))
    d.polygon(P([(120, 512), (200, 450), (360, 430), (560, 420), (760, 432), (900, 470), (930, 512)]), fill=(24, 18, 22, 255))
    for i in range(26): blob(d, rnd.uniform(160, 880), rnd.uniform(430, 500), rnd.uniform(12, 44), rnd.uniform(4, 10), ICHOR, 10, .3, 100 + i)
    for i in range(10): blob(d, rnd.uniform(200, 840), rnd.uniform(440, 496), rnd.uniform(8, 22), rnd.uniform(3, 6), ROT, 9, .3, 140 + i)
    # the spine: skull at the left, an arch over the ribcage, down to the pelvis, the tail trailing off to the right
    spine = bez((258, 262), (430, 110), (640, 176), 30) + bez((640, 176), (720, 200), (776, 262), 12)[1:]
    tail = bez((776, 262), (880, 300), (930, 400), 14) + bez((930, 400), (950, 446), (900, 470), 8)[1:]
    # the far side: hind leg and far ribs, darker
    bone(d, bez((760, 270), (830, 330), (800, 400), 10), 15, .62); bone(d, bez((800, 400), (760, 440), (700, 446), 8), 12, .62)
    for i in range(9):
        k = .12 + i * .09; sx, sy = spine[int(k * (len(spine) - 1))]; ln = 150 + math.sin(i * .9) * 26
        bone(d, bez((sx + 8, sy + 6), (sx + 46, sy + ln * .55), (sx + 16, sy + ln), 12), 6, .55)
    # what is left of the belly: a sagging sheet of flesh, torn open
    belly = [(300, 286), (380, 250), (500, 236), (620, 246), (720, 276), (760, 330), (730, 392), (640, 424), (520, 432), (410, 420), (330, 384), (296, 330)]
    d.polygon(P(belly), fill=FLESH_D + (255,))
    for i in range(22): blob(d, rnd.uniform(330, 720), rnd.uniform(270, 410), rnd.uniform(16, 46), rnd.uniform(10, 26), [FLESH, FLESH_D, (70, 22, 30), FLESH_H][i % 4], 11, .34, 200 + i)
    for i in range(16): blob(d, rnd.uniform(330, 720), rnd.uniform(280, 415), rnd.uniform(10, 30), rnd.uniform(6, 16), [ROT, ICHOR, ROT_H][i % 3], 10, .36, 240 + i)
    # the holes: you can see the dark inside, and the far ribs through it
    for cx, cy, rx, ry in [(450, 330, 52, 34), (590, 320, 44, 38), (690, 350, 26, 24), (370, 350, 24, 20)]:
        blob(d, cx, cy, rx, ry, (14, 8, 12), 13, .22, int(cx)); blob(d, cx - 2, cy - 3, rx * .8, ry * .7, (8, 4, 8), 11, .2, int(cy))
    for i in range(5):
        k = .2 + i * .13; sx, sy = spine[int(k * (len(spine) - 1))]
        d.line(P(bez((sx + 10, 300), (sx + 30, 340), (sx + 14, 372), 8)), fill=(96, 84, 60, 255), width=5 * S)
    # the near ribs: nine, two snapped, strips of flesh still hanging between them
    ribs = []
    for i in range(9):
        k = .1 + i * .095; sx, sy = spine[int(k * (len(spine) - 1))]; ln = 176 + math.sin(i * .8 + .4) * 34; brk = i in (3, 6)
        pts = bez((sx, sy + 4), (sx - 58 + i * 3, sy + ln * .5), (sx - 12, sy + ln * (.56 if brk else 1)), 14); ribs.append(pts)
        if i < 8 and i not in (2, 5):
            nx, ny = spine[int((k + .095) * (len(spine) - 1))]; hang = rnd.uniform(60, 130)
            strip = [(sx - 4, sy + 10), (nx - 4, ny + 10), (nx - 30, ny + hang * .7), (lerp(sx, nx, .5) - 34 + rnd.uniform(-8, 8), lerp(sy, ny, .5) + hang), (sx - 34, sy + hang * .6)]
            d.polygon(P(strip), fill=[FLESH, (74, 24, 32), FLESH_D][i % 3] + (255,))
            blob(d, lerp(sx, nx, .5) - 26, lerp(sy, ny, .5) + hang * .55, 12, 16, [ROT, FLESH_H, ICHOR][i % 3], 9, .3, 300 + i)
            for j in range(3): drip(d, lerp(sx, nx, rnd.random()) - 30, lerp(sy, ny, .5) + hang * rnd.uniform(.7, 1), rnd.uniform(20, 70), 1.6, [ICHOR, FLESH_D, ROT][j])
    for pts in ribs: bone(d, pts, 9)
    for i in (3, 6):                                   # the snapped ends, splintered
        x, y = ribs[i][-1]; d.polygon(P([(x - 7, y - 4), (x + 7, y - 4), (x + 3, y + 12), (x - 1, y + 5), (x - 5, y + 14)]), fill=BONE_S + (255,)); d.line(P([(x - 5, y - 2), (x - 5, y + 13)]), fill=BONE_D + (255,), width=S)
    # vertebrae along the spine and the tail, each with its spur
    for i, (x, y) in enumerate(spine[1::2]):
        r = 12 - abs(i - 9) * .25; d.polygon(P([(x - 5, y - r), (x, y - r - 14 - (i % 3) * 3), (x + 6, y - r)]), fill=BONE_D + (255,)); d.polygon(P([(x - 3, y - r), (x, y - r - 11 - (i % 3) * 3), (x + 4, y - r)]), fill=BONE_S + (255,))
        d.ellipse(P([(x - r - 2, y - r - 2), (x + r + 2, y + r + 2)]), fill=BONE_D + (255,)); d.ellipse(P([(x - r, y - r), (x + r, y + r)]), fill=BONE_S + (255,)); d.ellipse(P([(x - r * .7, y - r), (x + r * .5, y + r * .1)]), fill=BONE + (255,)); d.ellipse(P([(x - r * .5, y - r * .9), (x + r * .1, y - r * .45)]), fill=BONE_H + (255,))
    for i, (x, y) in enumerate(tail[1::2]):
        r = max(3, 9 - i * .55); d.ellipse(P([(x - r - 2, y - r - 2), (x + r + 2, y + r + 2)]), fill=BONE_D + (255,)); d.ellipse(P([(x - r, y - r), (x + r, y + r)]), fill=BONE_S + (255,)); d.ellipse(P([(x - r * .6, y - r), (x + r * .5, y)]), fill=BONE + (255,))
    # scraps of hide on the back, mould on top of it
    for i in range(7):
        x, y = spine[4 + i * 4]; blob(d, x + rnd.uniform(-10, 10), y + 14, rnd.uniform(18, 30), rnd.uniform(9, 14), [FLESH_D, (60, 46, 40), FLESH][i % 3], 10, .36, 400 + i)
        if i % 2 == 0: blob(d, x, y + 8, 12, 5, ROT_H, 8, .3, 420 + i)
    # pelvis and the near hind leg, folded
    blob(d, 776, 268, 34, 26, BONE_D, 12, .16, 31); blob(d, 774, 265, 30, 22, BONE_S, 12, .16, 32); blob(d, 768, 258, 20, 12, BONE, 10, .2, 33); blob(d, 782, 274, 9, 8, (20, 12, 16), 9, .2, 34)
    bone(d, bez((784, 280), (858, 318), (846, 392), 10), 17); bone(d, bez((846, 392), (800, 436), (736, 452), 9), 13); bone(d, [(736, 452), (690, 462)], 9)
    for k in range(4): d.polygon(P([(690 - k * 9, 456), (676 - k * 9, 470), (694 - k * 9, 466)]), fill=BONE_H + (255,))
    # shoulder and the near foreleg, stretched out towards us
    blob(d, 318, 270, 30, 24, BONE_D, 11, .18, 41); blob(d, 316, 267, 26, 20, BONE_S, 11, .18, 42); blob(d, 310, 260, 16, 10, BONE, 9, .2, 43)
    bone(d, bez((318, 286), (282, 350), (300, 410), 10), 16); bone(d, bez((300, 410), (262, 440), (204, 452), 9), 12); bone(d, [(204, 452), (160, 458)], 9)
    for k in range(4): d.polygon(P([(162 - k * 9, 452), (146 - k * 9, 468), (164 - k * 9, 463)]), fill=BONE_H + (255,))
    # the skull: turned to us, the jaw off its hinge
    sk = layer(); e = ImageDraw.Draw(sk)
    def sb(pts, col): e.polygon(P(pts), fill=col + (255,))
    sb([(118, 250), (120, 180), (150, 138), (208, 122), (262, 134), (292, 178), (296, 250), (280, 300), (236, 322), (176, 322), (134, 300)], BONE_D)
    sb([(124, 248), (126, 184), (154, 144), (208, 129), (258, 140), (286, 182), (290, 248), (275, 295), (234, 316), (178, 316), (139, 295)], BONE_S)
    sb([(132, 240), (134, 186), (158, 150), (206, 136), (250, 146), (270, 176), (262, 204), (220, 190), (176, 196), (150, 222)], BONE)
    sb([(150, 182), (166, 156), (204, 144), (230, 150), (212, 164), (176, 170)], BONE_H)
    # ears: what is left of them, hide in rags with holes
    for bx, tip, bx2 in [(126, (104, 92), 166), (246, (300, 86), 284)]:
        sb([(bx, 168), tip, (bx2, 150)], FLESH_D); sb([(bx + 6, 164), (tip[0] + (6 if tip[0] < 200 else -8), tip[1] + 16), (bx2 - 6, 152)], (70, 40, 40)); blob(e, lerp(bx, bx2, .5), 140, 7, 9, (14, 8, 12), 8, .3, bx)
        e.line(P([tip, (tip[0] + (-6 if tip[0] < 200 else 8), tip[1] + 30)]), fill=FLESH_D + (255,), width=3 * S)
    # sockets: one empty and wet, one still lit
    blob(e, 166, 222, 26, 24, (10, 6, 10), 12, .12, 51); blob(e, 250, 222, 25, 23, (10, 6, 10), 12, .12, 52)
    blob(e, 166, 226, 15, 12, (40, 14, 20), 10, .2, 53); blob(e, 250, 224, 9, 9, (120, 170, 40), 10, .15, 54); blob(e, 250, 223, 5, 5, (220, 255, 120), 8, .1, 55); blob(e, 249, 222, 2, 2, (255, 255, 230), 6, .1, 56)
    e.polygon(P([(196, 250), (208, 232), (220, 250), (212, 272), (204, 272)]), fill=(12, 8, 12, 255)); e.line(P([(208, 236), (208, 270)]), fill=BONE_S + (255,), width=2 * S)
    e.line(P([(150, 150), (176, 190), (168, 214)]), fill=BONE_D + (255,), width=2 * S); e.line(P([(176, 190), (196, 196)]), fill=BONE_D + (255,), width=S); e.line(P([(262, 160), (252, 188)]), fill=BONE_D + (255,), width=2 * S)
    # upper teeth and the two long fangs
    for i in range(8):
        x = 152 + i * 16; ln = 34 if i in (1, 6) else 12 + (i % 2) * 4; e.polygon(P([(x - 6, 312), (x + 6, 312), (x + (2 if i < 4 else -2), 312 + ln)]), fill=BONE_D + (255,)); e.polygon(P([(x - 4, 312), (x + 4, 312), (x + (1 if i < 4 else -1), 308 + ln)]), fill=BONE_H + (255,))
    # the lower jaw, hanging off to one side by a strip of flesh
    jaw = [(136, 356), (160, 392), (214, 408), (268, 398), (300, 362), (306, 330), (290, 336), (276, 366), (236, 382), (196, 384), (166, 370), (152, 344)]
    sb(jaw, BONE_D); sb([(142, 356), (164, 386), (214, 401), (264, 392), (294, 360), (298, 340), (290, 344), (278, 370), (238, 388), (194, 390), (162, 376), (150, 352)], BONE_S); sb([(150, 358), (168, 380), (212, 392), (252, 386), (270, 372), (236, 386), (196, 388), (166, 374)], BONE)
    for i in range(7):
        x = 170 + i * 16; ln = 22 if i in (1, 5) else 10; e.polygon(P([(x - 5, 384 - abs(i - 3) * 2), (x + 5, 384 - abs(i - 3) * 2), (x, 384 - abs(i - 3) * 2 - ln)]), fill=BONE_H + (255,))
    e.polygon(P([(284, 300), (296, 300), (304, 336), (292, 340)]), fill=FLESH + (255,)); e.polygon(P([(130, 300), (140, 302), (148, 350), (138, 352)]), fill=FLESH_D + (255,))
    # the tongue, black, and what runs out of the mouth
    e.polygon(P([(190, 372), (232, 370), (246, 396), (240, 436), (224, 458), (212, 436), (204, 400)]), fill=(46, 14, 26, 255)); e.polygon(P([(200, 376), (226, 376), (234, 398), (228, 428), (220, 404)]), fill=(84, 26, 40, 255))
    for x, ln in [(176, 60), (200, 96), (228, 50), (256, 84), (270, 40)]: drip(e, x, 404, ln, 2, ICHOR)
    # rot and fungus on the bone, cracks
    for i in range(9): blob(e, rnd.uniform(130, 286), rnd.uniform(150, 300), rnd.uniform(6, 16), rnd.uniform(4, 9), [ROT, ROT_H, ICHOR][i % 3], 9, .34, 500 + i)
    for cx, cy in [(134, 262), (288, 268), (236, 142)]:
        for j in range(4): e.ellipse(P([(cx - 9 + j * 4, cy + j * 6 - 3), (cx + 9 + j * 3, cy + j * 6 + 3)]), fill=FUNGUS + (255,)); e.line(P([(cx - 8 + j * 4, cy + j * 6 + 3), (cx + 8 + j * 3, cy + j * 6 + 3)]), fill=(140, 130, 100, 255), width=S)
    im.alpha_composite(sk); d = ImageDraw.Draw(im)
    # neck: three vertebrae from the skull to the shoulder, flesh between
    blob(d, 286, 268, 26, 18, FLESH_D, 10, .3, 61); blob(d, 292, 262, 14, 9, FLESH, 9, .3, 62)
    # ichor falling out of the ribcage in threads, and pooling
    for i in range(22): drip(d, rnd.uniform(340, 720), rnd.uniform(380, 424), rnd.uniform(18, 80), rnd.uniform(1.2, 2.6), [ICHOR, FLESH_D, ROT][i % 3])
    # maggots in the wounds
    for cx, cy in [(450, 356), (590, 350), (372, 362), (690, 368), (220, 300), (520, 420)]:
        for j in range(26): x, y = cx + rnd.gauss(0, 15), cy + rnd.gauss(0, 7); d.ellipse(P([(x - 2, y - 1), (x + 2, y + 1)]), fill=MAGGOT + (255,))
    # flies: three clouds; carrion birds on the wing and two sitting on the spine
    for cx, cy, n, sp in [(220, 90, 150, 60), (520, 120, 220, 90), (760, 180, 130, 60)]:
        for j in range(n): x, y = cx + rnd.gauss(0, sp), cy + rnd.gauss(0, sp * .55); r = rnd.choice([1, 1, 1.5]); d.ellipse(P([(x - r, y - r), (x + r, y + r)]), fill=FLY + (230,))
    for x, y, s in [(400, 70, 1.3), (470, 44, 1), (640, 80, 1.2), (700, 54, .8), (860, 110, 1), (330, 40, .8)]:
        d.line(P([(x - 12 * s, y - 5 * s), (x, y), (x + 12 * s, y - 6 * s)]), fill=FLY + (255,), width=int(2.4 * S)); d.ellipse(P([(x - 2 * s, y - 2 * s), (x + 2 * s, y + 3 * s)]), fill=FLY + (255,))
    for x, y in [(486, 138), (640, 150)]:
        d.ellipse(P([(x - 7, y - 16), (x + 7, y + 2)]), fill=FLY + (255,)); d.ellipse(P([(x - 4, y - 24), (x + 5, y - 14)]), fill=FLY + (255,)); d.polygon(P([(x + 4, y - 20), (x + 14, y - 17), (x + 4, y - 16)]), fill=(60, 50, 30, 255)); d.polygon(P([(x - 7, y - 4), (x - 16, y + 8), (x - 3, y + 2)]), fill=FLY + (255,))
    # ground haze over its feet, so it sits in the land
    g = layer(); e = ImageDraw.Draw(g)
    e.ellipse(P([(60, 410), (980, 540)]), fill=(60, 74, 34, 150)); e.ellipse(P([(140, 400), (900, 520)]), fill=(96, 112, 50, 110))
    im.alpha_composite(blur(g, 14))
    # fade the bottom and the side edges out
    im = im.resize((1024, 512), Image.LANCZOS); px = im.load()
    for y in range(512):
        for x in range(1024):
            r, g2, b, a = px[x, y]
            if a:
                k = min(1, (512 - y) / 46) * min(1, x / 40) * min(1, (1024 - x) / 40); a = int(a * k)
                # soft edges become a pixel stipple (ordered dither): an indexed PNG bands a smooth alpha into rings
                a = 255 if a >= 250 else (255 if a / 255 > (BAYER[y & 3][x & 3] + .5) / 16 else 0)
                px[x, y] = (r, g2, b, a) if a else (0, 0, 0, 0)
    q = im.quantize(255, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    q.save(out, optimize=True); print('wrote', out, q.size, q.mode)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'colossus_dusk.png')
