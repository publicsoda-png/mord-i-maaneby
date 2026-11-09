# Builds assets/sprites/aliens.png from chosen cells of the 3×3 alien sheets.
# Usage: ~/Documents/tools/pyimg/bin/python -I tools/art/aliens.py <cell> [<cell> ...]   e.g. 1:0 1:4 2:7 3:2 ...
#   cell = <sheet>:<index 0..8> (row-major) in assets/raw/aliens/aliens_<sheet>.png
#   --contact assets/raw/aliens/contact.png  writes a numbered contact sheet of ALL cells instead (for the council)
# Each chosen cell is chroma-keyed, trimmed, bottom-aligned into a 96×96 cell, 3 columns, then Floyd–Steinberg 255 colours + alpha.
import os, sys
from PIL import Image, ImageDraw, ImageOps

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
RAW = os.path.join(ROOT, 'assets', 'raw', 'aliens')
CELL = 96

def key(im, tol=80):
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if g > 140 and g - max(r, b) > tol: px[x, y] = (0, 255, 0, 0)
            elif g > 120 and g - max(r, b) > tol // 2: px[x, y] = (r, g, b, 120)  # soft edge: keep a 1-px greenish fringe (era-true)
    # C3 fix: white/grey grid remnants at the cell edges (the sheet's separators) — flood from the border over
    # transparent or near-white pixels so only border-connected white goes, never the figure's own highlights
    seen = bytearray(w * h); stack = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    def bgish(p): return p[3] == 0 or (min(p[0], p[1], p[2]) > 200 and max(p[0], p[1], p[2]) - min(p[0], p[1], p[2]) < 28) or max(p[0], p[1], p[2]) < 48  # white separators + black grid lines
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x]: continue
        seen[y * w + x] = 1
        p = px[x, y]
        if not bgish(p): continue
        if p[3]: px[x, y] = (0, 255, 0, 0)
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return im

def cells(sheet):
    im = Image.open(os.path.join(RAW, f'aliens_{sheet}.png')).convert('RGB')
    w, h = im.size; cw, ch = w // 3, h // 3
    return [im.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)) for r in range(3) for c in range(3)]

def prep(cell, tol=80):
    k = key(cell, tol)
    bbox = k.getchannel('A').getbbox()
    if bbox: k = k.crop(bbox)
    k.thumbnail((CELL - 8, CELL - 6), Image.LANCZOS)
    out = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    out.paste(k, ((CELL - k.width) // 2, CELL - 2 - k.height), k)
    return out

def main():
    args = sys.argv[1:]
    if args and args[0] == '--contact':
        sheets = sorted(int(f.split('_')[1].split('.')[0]) for f in os.listdir(RAW) if f.startswith('aliens_') and f.endswith('.png'))
        allc = [(s, i, c) for s in sheets for i, c in enumerate(cells(s))]
        cols = 9; rows = (len(allc) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * 140, rows * 160), (40, 40, 40)); d = ImageDraw.Draw(sheet)
        for n, (s, i, c) in enumerate(allc):
            p = prep(c).resize((128, 128), Image.NEAREST)
            bg = Image.new('RGB', (128, 128), (90, 90, 110)); bg.paste(p, (0, 0), p)
            x, y = (n % cols) * 140 + 6, (n // cols) * 160 + 6
            sheet.paste(bg, (x, y)); d.text((x + 4, y + 132), f'{s}:{i}', fill=(255, 255, 255))
        sheet.save(args[1]); print(args[1], len(allc), 'cells'); return
    chosen = []
    for a in args:
        a, _, t = a.partition('@'); s, i = a.split(':'); chosen.append(prep(cells(int(s))[int(i)], int(t) if t else 80))  # 1:1@130 = looser key for green figures
    rows = (len(chosen) + 2) // 3
    out = Image.new('RGBA', (3 * CELL, rows * CELL), (0, 0, 0, 0))
    for n, c in enumerate(chosen): out.paste(c, ((n % 3) * CELL, (n // 3) * CELL), c)
    # PNG8 with alpha: quantize RGB to 255 colours, keep alpha as a binary-ish mask
    rgb = out.convert('RGB').quantize(255, dither=Image.Dither.FLOYDSTEINBERG).convert('RGB')
    alpha = out.getchannel('A').point(lambda v: 255 if v > 100 else 0)
    final = Image.merge('RGBA', (*rgb.split(), alpha))
    dst = os.path.join(ROOT, 'assets', 'sprites', 'aliens.png'); final.save(dst, optimize=True)
    print(dst, final.size, len(chosen), 'aliens')

main()
