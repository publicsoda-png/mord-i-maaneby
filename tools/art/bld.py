# Builds assets/sprites/bld_<kind>.png (3 stages side by side, 2:3 cells) from assets/raw/bld/<kind>_{scaffold,plain,deco}_N.png.
# Usage: ~/Documents/tools/pyimg/bin/python -I tools/art/bld.py [kind ...]      (default: all kinds that have a scaffold render)
# Missing stage → previous stage is reused (and reported), so the sprite is always complete.
import os, sys, glob
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
RAW = os.path.join(ROOT, 'assets', 'raw', 'bld'); DST = os.path.join(ROOT, 'assets', 'sprites')
CW, CH = 160, 240  # 2:3 cell; drawBuilding scales to h=72 → ~48 px wide on stage
STAGES = ['scaffold', 'plain', 'deco']

def key(im, tol=80):
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if g > 140 and g - max(r, b) > tol: px[x, y] = (0, 255, 0, 0)
            elif g > 120 and g - max(r, b) > tol // 2: px[x, y] = (r, g, b, 120)
    return im

def pick(kind, stage):
    fs = sorted(glob.glob(os.path.join(RAW, f'{kind}_{stage}_*.png')))
    return fs[-1] if fs else None

def cell(path, filt=True):
    k = key(Image.open(path)); bb = k.getchannel('A').getbbox()
    if bb: k = k.crop(bb)
    k.thumbnail((CW - 8, CH - 8), Image.LANCZOS)
    if filt: k = largest(k)  # floating duplicates (pit_deco's ghost winch, pit_scaffold's ghost railing) are disconnected → drop them
    bb = k.getchannel('A').getbbox()
    if bb: k = k.crop(bb)
    out = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); out.paste(k, ((CW - k.width) // 2, CH - 4 - k.height), k)
    return out

def largest(im):
    px = im.load(); w, h = im.size; lab = [0] * (w * h); n = 0; sizes = []
    for y0 in range(h):
        for x0 in range(w):
            if px[x0, y0][3] > 60 and not lab[y0 * w + x0]:
                n += 1; st = [(x0, y0)]; lab[y0 * w + x0] = n; c = 0
                while st:
                    x, y = st.pop(); c += 1
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and not lab[ny * w + nx] and px[nx, ny][3] > 60: lab[ny * w + nx] = n; st.append((nx, ny))
                sizes.append(c)
    if n <= 1: return im
    keep = sizes.index(max(sizes)) + 1
    for y in range(h):
        for x in range(w):
            l = lab[y * w + x]
            if l and l != keep and sizes[l - 1] < max(sizes) * 0.25: px[x, y] = (0, 0, 0, 0)
    return im

def build(kind):
    paths = []; last = None
    for s in STAGES:
        p = pick(kind, s)
        if not p: print(f'  {kind}: no {s} render → reusing previous'); p = last
        if not p: print(f'  {kind}: nothing to build'); return
        paths.append(p); last = p
    out = Image.new('RGBA', (3 * CW, CH), (0, 0, 0, 0))
    for i, p in enumerate(paths): c = cell(p, 'pad_plain' not in p); out.paste(c, (i * CW, 0), c)  # pad_plain: the dome hovers above the pad in the render; dropping it leaves an empty pad
    rgb = out.convert('RGB').quantize(255, dither=Image.Dither.FLOYDSTEINBERG).convert('RGB')
    alpha = out.getchannel('A').point(lambda v: 255 if v > 100 else 0)
    final = Image.merge('RGBA', (*rgb.split(), alpha)); os.makedirs(DST, exist_ok=True)
    dst = os.path.join(DST, f'bld_{kind}.png'); final.save(dst, optimize=True); print(dst, [os.path.basename(p) for p in paths])

kinds = sys.argv[1:] or sorted({os.path.basename(f).split('_')[0] for f in glob.glob(os.path.join(RAW, '*_scaffold_*.png'))})
for k in kinds: build(k)
