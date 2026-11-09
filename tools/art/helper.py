# Builds assets/sprites/helper.png from a 4-frame mouth sheet on #00FF00 (council C2 winner: moonman_sheet_2).
# Usage: ~/Documents/tools/pyimg/bin/python -I tools/art/helper.py assets/raw/helper/moonman_sheet_2.png [frames=4]
# Fixes from the judges: frames are aligned on the CHAIR (lower part of the figure, stable between frames) so the
# figure no longer drifts, and each frame is centred on its own bounding box. Output: frames side by side,
# 125×250 each (drawHelper() derives the frame count from width/(height/2)), PNG8-style 255 colours + 1-bit alpha.
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
FW, FH = 125, 250

def key(im, tol=80):
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if g > 140 and g - max(r, b) > tol: px[x, y] = (0, 255, 0, 0)
            elif g > 120 and g - max(r, b) > tol // 2: px[x, y] = (r, g, b, 120)
    return im

def main():
    src = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 4
    im = Image.open(src).convert('RGB'); w, h = im.size; cw = w // n
    frames = [key(im.crop((i * cw, 0, (i + 1) * cw, h))) for i in range(n)]
    # anchor = bbox of the lower 45 % (chair + legs): same object in every frame
    anchors = []
    for f in frames:
        a = f.getchannel('A'); low = a.crop((0, int(h * 0.55), cw, h)).getbbox()
        full = a.getbbox()
        anchors.append((low, full))
    # common crop box relative to the chair's bottom-centre
    cx = [ (lo[0] + lo[2]) // 2 for lo, _ in anchors ]; by = [ int(h * 0.55) + lo[3] for lo, _ in anchors ]
    left = max(cx[i] - fu[0] for i, (_, fu) in enumerate(anchors)); right = max(fu[2] - cx[i] for i, (_, fu) in enumerate(anchors))
    top = max(by[i] - fu[1] for i, (_, fu) in enumerate(anchors))
    half = max(left, right) + 6; bw, bh = 2 * half, top + 8
    out = Image.new('RGBA', (n * FW, FH), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        box = (cx[i] - half, by[i] - top - 4, cx[i] + half, by[i] + 4)
        c = f.crop(box)
        k = min(FW / bw, FH / bh); c = c.resize((max(1, round(bw * k)), max(1, round(bh * k))), Image.LANCZOS)
        out.paste(c, (i * FW + (FW - c.width) // 2, FH - c.height), c)
    rgb = out.convert('RGB').quantize(255, dither=Image.Dither.FLOYDSTEINBERG).convert('RGB')
    alpha = out.getchannel('A').point(lambda v: 255 if v > 100 else 0)
    final = Image.merge('RGBA', (*rgb.split(), alpha))
    dst = os.path.join(ROOT, 'assets', 'sprites', 'helper.png'); os.makedirs(os.path.dirname(dst), exist_ok=True); final.save(dst, optimize=True)
    print(dst, final.size, 'anchors', cx, by)

main()
