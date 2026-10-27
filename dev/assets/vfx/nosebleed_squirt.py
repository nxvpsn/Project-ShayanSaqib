"""Caotan's nosebleed as a liquid squirt (pixel art): two pulsing spurts of thin blood jets shoot up out of the ground, droplets arc out
and fall, a puddle spreads where they land. Same atlas as before (16 frames of 56x96, feet at row 88).
Usage: python3 nosebleed_squirt.py ../../../img/vfx/nosebleed.png [preview.png]"""
import sys, math, random
from PIL import Image, ImageDraw

W, H, N, GROUND, X0 = 56, 96, 16, 88, 28
DARK, BODY, MID, HI, OUT = (90, 0, 12), (150, 8, 22), (196, 20, 32), (255, 92, 96), (34, 0, 6)
rnd = random.Random(5)
G = 950.0       # gravity, px/s^2
DT = 1 / 20 / 4  # 4 substeps per frame

# the spurts: (frame it starts, how many frames it pumps, launch speed)
SPURTS = [(0, 4, 265), (5, 3, 215)]
drops, puddle, frames = [], [0.0], []
def emit(speed):
    for _ in range(5):
        a = math.radians(-90 + rnd.uniform(-12, 12))
        drops.append(dict(x=X0 + rnd.uniform(-1, 1), y=GROUND - 1, vx=math.cos(a) * speed * rnd.uniform(.85, 1.05) + rnd.uniform(-14, 14),
                          vy=math.sin(a) * speed * rnd.uniform(.8, 1.05), r=rnd.choice((0, 1, 1)), px=None, py=None))

for f in range(N):
    for s0, n, sp in SPURTS:
        if s0 <= f < s0 + n: emit(sp * (1 - .12 * (f - s0)))
    for _ in range(4):
        for d in drops:
            d['px'], d['py'] = d['x'], d['y']
            d['vy'] += G * DT; d['x'] += d['vx'] * DT; d['y'] += d['vy'] * DT
            if d['y'] >= GROUND and d['vy'] > 0: d['dead'] = True; puddle[0] = min(13, puddle[0] + .45 * (1 + d['r']))
        drops[:] = [d for d in drops if not d.get('dead')]
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dr = ImageDraw.Draw(im)
    pr = puddle[0] * (1 if f < 13 else 1 - (f - 12) * .12)
    if pr > .5:  # the puddle: a flat ellipse with a glossy rim
        dr.ellipse([X0 - pr, GROUND - pr * .32, X0 + pr, GROUND + pr * .32], fill=DARK)
        dr.ellipse([X0 - pr * .8, GROUND - pr * .25, X0 + pr * .6, GROUND + pr * .12], fill=BODY)
        dr.line([X0 - pr * .5, GROUND - pr * .18, X0 - pr * .1, GROUND - pr * .2], fill=HI)
    for d in drops:  # each drop as a streak along its motion (a jet when they're packed), with a bright core
        sp = math.hypot(d['vx'], d['vy']); x, y = d['x'], d['y']; tx, ty = d['x'] - d['vx'] * .022, d['y'] - d['vy'] * .022
        dr.line([tx, ty, x, y], fill=BODY if sp > 120 else MID, width=1 + d['r'])
        if d['r']: dr.ellipse([x - d['r'], y - d['r'], x + d['r'], y + d['r']], fill=MID)
        if d['r'] > 1: dr.point((x - .5, y - .5), fill=HI)
    if f < 9 and any(s0 <= f < s0 + n for s0, n, _ in SPURTS):  # the nozzle: a fat burst right at the ground while pumping
        dr.ellipse([X0 - 3, GROUND - 5, X0 + 3, GROUND + 1], fill=BODY); dr.point((X0 - 1, GROUND - 4), fill=HI)
    # 1px dark outline around everything
    px = im.load(); a = [[px[x, y][3] > 0 for y in range(H)] for x in range(W)]
    for x in range(W):
        for y in range(H):
            if not a[x][y] and any(0 <= x + dx < W and 0 <= y + dy < H and a[x + dx][y + dy] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): px[x, y] = OUT + (255,)
    frames.append(im)

sheet = Image.new('RGBA', (W * N, H), (0, 0, 0, 0))
for i, im in enumerate(frames): sheet.alpha_composite(im, (i * W, 0))
sheet.quantize(method=Image.Quantize.FASTOCTREE).save(sys.argv[1], optimize=True)
if len(sys.argv) > 2:
    bg = Image.new('RGBA', sheet.size, (200, 190, 220, 255)); bg.alpha_composite(sheet); bg.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST).save(sys.argv[2])
