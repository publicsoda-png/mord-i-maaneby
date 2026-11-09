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

def cell(path):
    k = key(Image.open(path)); bb = k.getchannel('A').getbbox()
    if bb: k = k.crop(bb)
    k.thumbnail((CW - 8, CH - 8), Image.LANCZOS)
    out = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); out.paste(k, ((CW - k.width) // 2, CH - 4 - k.height), k)
    return out

def build(kind):
    paths = []; last = None
    for s in STAGES:
        p = pick(kind, s)
        if not p: print(f'  {kind}: no {s} render → reusing previous'); p = last
        if not p: print(f'  {kind}: nothing to build'); return
        paths.append(p); last = p
    out = Image.new('RGBA', (3 * CW, CH), (0, 0, 0, 0))
    for i, p in enumerate(paths): c = cell(p); out.paste(c, (i * CW, 0), c)
    rgb = out.convert('RGB').quantize(255, dither=Image.Dither.FLOYDSTEINBERG).convert('RGB')
    alpha = out.getchannel('A').point(lambda v: 255 if v > 100 else 0)
    final = Image.merge('RGBA', (*rgb.split(), alpha)); os.makedirs(DST, exist_ok=True)
    dst = os.path.join(DST, f'bld_{kind}.png'); final.save(dst, optimize=True); print(dst, [os.path.basename(p) for p in paths])

kinds = sys.argv[1:] or sorted({os.path.basename(f).split('_')[0] for f in glob.glob(os.path.join(RAW, '*_scaffold_*.png'))})
for k in kinds: build(k)
