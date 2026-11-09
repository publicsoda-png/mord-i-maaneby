#!/usr/bin/env python3 -I
"""Retro-process Higgsfield renders → era-correct PNG8.
Usage: /usr/bin/python3 -I tools/art/retro.py <in.png> <out.png> [--mode bg|sprite] [--size 640x480] [--key] [--contact]
  bg:     resize LANCZOS → colour drift (sat 1.12, green ×1.03) → JPEG q65 round-trip → 256-colour ordered (Bayer 4×4) dither → PNG8
  sprite: same but Floyd–Steinberg, keeps alpha, --key chroma-keys flat green (#00FF00) with a 1 px fringe left on purpose
Writes <out>.pal.json (palette) next to the output. Needs Pillow in /usr/bin/python3."""
import sys, io, json, argparse
from PIL import Image, ImageEnhance, ImageOps

BAYER4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]

def drift(im):
    im = ImageEnhance.Color(im).enhance(1.12)
    r, g, b = im.split()
    g = g.point(lambda v: min(255, int(v * 1.03)))
    return Image.merge('RGB', (r, g, b))

def jpeg_round(im, q=65):
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=q, subsampling=2); buf.seek(0)
    return Image.open(buf).convert('RGB')

def ordered_dither(im, pal_img, strength=12):
    """Add a Bayer threshold pattern before nearest-palette quantisation (ordered dither look)."""
    w, h = im.size
    px = im.load()
    for y in range(h):
        row = BAYER4[y % 4]
        for x in range(w):
            t = (row[x % 4] / 16 - 0.5) * strength
            r, g, b = px[x, y]
            px[x, y] = (max(0, min(255, int(r + t))), max(0, min(255, int(g + t))), max(0, min(255, int(b + t))))
    return im.quantize(palette=pal_img, dither=Image.Dither.NONE)

def chroma_key(im, tol=90):
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if g > 150 and g - max(r, b) > tol: px[x, y] = (r, g, b, 0)
    return im

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('inp'); ap.add_argument('out')
    ap.add_argument('--mode', default='bg'); ap.add_argument('--size', default='640x480')
    ap.add_argument('--key', action='store_true'); ap.add_argument('--colors', type=int, default=256)
    a = ap.parse_args()
    im = Image.open(a.inp).convert('RGBA')
    if a.key: im = chroma_key(im)
    if a.size and a.size != 'keep':
        W, H = map(int, a.size.lower().split('x'))
        if a.mode == 'bg': im = ImageOps.fit(im, (W, H), Image.LANCZOS)
        else: im.thumbnail((W, H), Image.LANCZOS)
    alpha = im.split()[3]
    rgb = jpeg_round(drift(im.convert('RGB')))
    pal_src = rgb.quantize(colors=a.colors - (1 if a.mode == 'sprite' else 0), method=Image.Quantize.MEDIANCUT)
    if a.mode == 'bg':
        out = ordered_dither(rgb, pal_src)
    else:
        out = rgb.quantize(palette=pal_src, dither=Image.Dither.FLOYDSTEINBERG).convert('RGBA')
        out.putalpha(alpha.point(lambda v: 255 if v > 128 else 0))  # 1-bit alpha = Director sprite fringe
    out.save(a.out, optimize=True)
    pal = pal_src.getpalette()[: 3 * a.colors]
    with open(a.out + '.pal.json', 'w') as f: json.dump([pal[i:i + 3] for i in range(0, len(pal), 3)], f)
    print(a.out, out.size, out.mode)

if __name__ == '__main__': main()
