"""Backdrop paintings, saved as small indexed PNGs under img/:
  milkyway   the night sky over Starfall Ridge, Boxwood Ruins and the flower field: a diagonal Milky Way (blue at the top
             left, lavender in the middle, pink-white where it meets the horizon) over a magenta horizon glow, on black
             (it is drawn additively over the sky dome);
  vmtn_far / vmtn_mid / vmtn_near   Lanternbrook's dusk mountains (sun low on the left): rim-lit snow peaks, a violet
             range, and near hills with pines and the lights of far villages.
Usage: python3 skyart.py [names...]   (default: all)"""
import sys, os, math
import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'img')
R = np.random.default_rng(11)


def vnoise(w, h, cell, seed):
    """value noise in [0,1], smooth (cosine interpolated)"""
    g = np.random.default_rng(seed).random((h // cell + 2, w // cell + 2))
    ys, xs = np.mgrid[0:h, 0:w] / cell
    x0, y0 = xs.astype(int), ys.astype(int); fx, fy = xs - x0, ys - y0
    fx = (1 - np.cos(fx * math.pi)) / 2; fy = (1 - np.cos(fy * math.pi)) / 2
    a, b, c, d = g[y0, x0], g[y0, x0 + 1], g[y0 + 1, x0], g[y0 + 1, x0 + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def fbm(w, h, cell, seed, oct=5):
    s, a, t = np.zeros((h, w)), 1.0, 0.0
    for o in range(oct):
        s += vnoise(w, h, max(2, cell >> o), seed + o) * a; t += a; a *= .5
    return s / t


def save(arr, name, colors=200, alpha=None):
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGB')
    if alpha is not None:
        a = np.clip(alpha, 0, 255).astype(np.uint8); a[a < 10] = 0
        im = im.convert('RGBA'); im.putalpha(Image.fromarray(a, 'L'))
        q = im.quantize(colors=colors, method=Image.Quantize.FASTOCTREE)
    else:
        q = im.quantize(colors=colors, method=Image.Quantize.MEDIANCUT)
    p = os.path.join(OUT, name + '.png'); q.save(p, optimize=True); print(name, os.path.getsize(p), 'bytes')


def lerpc(cols, t):
    """piecewise colour ramp; cols = [(t, (r,g,b)), ...]"""
    out = np.zeros(t.shape + (3,))
    for (t0, c0), (t1, c1) in zip(cols, cols[1:]):
        m = (t >= t0) & (t <= t1); k = ((t - t0) / (t1 - t0))[m][:, None]
        out[m] = np.array(c0) * (1 - k) + np.array(c1) * k
    out[t < cols[0][0]] = cols[0][1]; out[t > cols[-1][0]] = cols[-1][1]
    return out


def milkyway():
    W, H = 1024, 512
    ys, xs = np.mgrid[0:H, 0:W].astype(float)
    # band axis: from the horizon right of centre up to the top left
    A, B = np.array([700., 540.]), np.array([-60., -40.])
    ax = (B - A) / np.linalg.norm(B - A); nx = np.array([-ax[1], ax[0]])
    rel_x, rel_y = xs - A[0], ys - A[1]
    t = np.clip((rel_x * ax[0] + rel_y * ax[1]) / np.linalg.norm(B - A), 0, 1)   # 0 at the horizon, 1 top left
    d = rel_x * nx[0] + rel_y * nx[1] + 18 * np.sin(t * 7) * (1 - t)
    wdt = 150 - 70 * t
    n1, n2, n3 = fbm(W, H, 64, 3), fbm(W, H, 24, 5), fbm(W, H, 10, 9)
    band = np.exp(-(d / wdt) ** 2) * (.45 + .9 * n1 * n2)
    core = np.exp(-(d / (wdt * .38)) ** 2) * np.exp(-((t - .22) / .2) ** 2) * (.6 + .8 * n2)
    # the dark rift down the middle (dust lanes)
    rift = np.exp(-((d - 14 * np.sin(t * 9) - 6) / (wdt * .16)) ** 2) * np.clip(n3 * 1.6 - .25, 0, 1) * (.55 + .4 * (t < .8))
    clumps = np.clip(n3 - .55, 0, 1) * 2.4 * np.exp(-(d / (wdt * 1.1)) ** 2)
    lum = np.clip(band * .5 + core * .55 + clumps * .45 - rift * .75, 0, 1.15)
    ramp = [(0, (236, 196, 245)), (.18, (214, 226, 255)), (.4, (140, 182, 255)), (.65, (84, 140, 255)), (1, (56, 100, 240))]
    col = lerpc(ramp, t) / 255.
    img = col * lum[..., None] * 230
    # magenta horizon glow, strongest left of the band's foot
    hg = np.exp(-((H - ys) / 60) ** 2) * (np.exp(-((xs - 520) / 300) ** 2) * .9 + .2)
    img += np.array([200, 80, 170]) * hg[..., None] * .42
    img += np.array([255, 170, 220]) * (np.exp(-((H - ys) / 40) ** 2) * np.exp(-((xs - 620) / 180) ** 2))[..., None] * .1
    # stars: many, denser in the band; a few bright ones with tiny crosses
    dens = .0022 + .022 * np.exp(-(d / (wdt * 1.2)) ** 2)
    pick = R.random((H, W)) < dens
    b = R.random((H, W)) ** 3
    tint = np.where(R.random((H, W))[..., None] < .25, np.array([190, 210, 255]), np.where(R.random((H, W))[..., None] < .1, np.array([255, 200, 230]), np.array([255, 255, 255])))
    img = np.where(pick[..., None], np.maximum(img, tint * (.35 + .65 * b[..., None])), img)
    for _ in range(46):
        x, y = int(R.integers(4, W - 4)), int(R.integers(4, H - 60))
        c = np.array([255, 255, 255]) if R.random() < .6 else np.array([180, 205, 255])
        img[y, x] = c; img[y, x - 1:x + 2] = np.maximum(img[y, x - 1:x + 2], c * .6); img[y - 1:y + 2, x] = np.maximum(img[y - 1:y + 2, x], c * .6)
    # soft edges (it is additive: black is "nothing")
    ex = np.clip(np.minimum(xs, W - 1 - xs) / 90, 0, 1); ey = np.clip(ys / 60, 0, 1) * np.clip((H - 1 - ys) / 6, 0, 1)
    img *= (ex * ey)[..., None]
    save(img, 'milkyway', 160)


def ridge(W, base, amp, n, seed, steep=(.55, 1.2)):
    """a range of n peaks (heights in pixels from the top), with fractal jaggies on top"""
    rng = np.random.default_rng(seed); xs = np.arange(W, dtype=float); h = np.full(W, float(base))
    for k in range(n):
        px = (k + rng.uniform(.1, .9)) * W / n; ph = base - amp * rng.uniform(.35, 1); sl, sr = rng.uniform(*steep), rng.uniform(*steep)
        h = np.minimum(h, ph + np.where(xs < px, (px - xs) * sl, (xs - px) * sr))
    det = np.zeros(W)
    for o, (cell, a) in enumerate([(64, 10), (24, 6), (9, 3), (4, 1.5)]):
        g = rng.uniform(-1, 1, W // cell + 2); det += np.interp(xs / cell, np.arange(len(g)), g) * a
    return h + det


def mountains(name, W, H, base, amp, n, seed, body, lit, shade, rim, snow=None, pines=None, lights=False, steep=(.55, 1.2)):
    h = ridge(W, base, amp, n, seed, steep)
    ys = np.mgrid[0:H, 0:W][0].astype(float)
    inside = ys >= h[None, :]
    face = -np.gradient(np.convolve(h, np.ones(5) / 5, 'same'))   # >0: this face looks left, at the low sun
    streak = np.repeat(fbm(W, H // 6 + 1, 6, seed + 7, 3), 6, axis=0)[:H]
    depth = ys - h[None, :]
    light = np.clip(.42 + np.clip(face, -1.6, 1.6)[None, :] * .38 + (streak - .5) * .55, 0, 1) * np.clip(1 - depth / (H * 1.2), .4, 1)
    col = np.array(shade) * (1 - light[..., None]) + np.array(lit) * light[..., None]
    col = col * .7 + np.array(body) * .3
    rimk = np.exp(-depth / 2.5) * np.clip(face * .8, 0, 1)[None, :]
    col = col * (1 - rimk[..., None]) + np.array(rim) * rimk[..., None]
    if snow:
        sl, scol = snow
        sm = (h[None, :] < sl) & (depth < (sl - h[None, :]) * .6 + (streak - .5) * 22)
        sk = np.clip(.5 + np.clip(face, -1.5, 1.5)[None, :] * .4, .12, 1)
        col = np.where(sm[..., None], np.array(scol) * sk[..., None] + np.array(shade) * (1 - sk[..., None]), col)
    alpha = np.where(inside, 255, 0).astype(float)
    img = col
    if pines:
        pc, every = pines; rng = np.random.default_rng(seed + 3)
        for x in range(0, W, every):
            x0 = min(W - 1, x + int(rng.integers(0, every))); hh = int(rng.integers(8, 22)); y0 = int(h[x0]) + 3
            for k in range(hh):
                half = int((k / hh) * hh * .32); yy = y0 - hh + k
                if 0 <= yy < H: img[yy, max(0, x0 - half):x0 + half + 1] = pc; alpha[yy, max(0, x0 - half):x0 + half + 1] = 255
    if lights:
        rng = np.random.default_rng(seed + 5)
        for _ in range(110):
            x = int(rng.integers(10, W - 10))
            if H - h[x] < 30: continue
            y = int(h[x] + rng.uniform(14, H - h[x] - 14)); c = np.array([255, 196, 110]) if rng.random() < .8 else np.array([255, 140, 90])
            img[y, x:x + 2] = c; alpha[y, x:x + 2] = 255
            if rng.random() < .3: img[y - 1, x] = c * .8; alpha[y - 1, x] = 255
    fade = np.clip((H - 1 - ys) / 18, 0, 1)
    save(img, name, 120, alpha * fade)


def village():
    mountains('vmtn_far', 2048, 384, 300, 260, 9, 21, body=(206, 150, 178), lit=(255, 200, 170), shade=(132, 100, 160), rim=(255, 232, 200),
              snow=(200, (255, 236, 226)), steep=(.7, 1.5))
    mountains('vmtn_mid', 2048, 320, 250, 170, 12, 33, body=(112, 72, 128), lit=(190, 116, 150), shade=(62, 44, 96), rim=(255, 180, 150),
              snow=(150, (232, 190, 206)), steep=(.6, 1.3))
    mountains('vmtn_near', 2048, 256, 200, 70, 16, 47, body=(44, 30, 64), lit=(84, 52, 92), shade=(30, 22, 50), rim=(220, 130, 130),
              pines=((22, 16, 36), 7), lights=True, steep=(.25, .6))


if __name__ == '__main__':
    names = sys.argv[1:] or ['milkyway', 'village']
    for n in names: globals()[n]()
