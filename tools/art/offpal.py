# tools/art/offpal.py — hvilke pixels i et skærmbillede ligger UDEN FOR masterpaletten? (c8, WP1-diagnose; offline-udgave af ?dev&pal)
# Brug: ~/Documents/tools/pyimg/bin/python -I tools/art/offpal.py <shot.png> <assets/pal/dag.png|nat.png> <mask_out.png>
# Skriver maske (palette-pixels = mørkegrå, off-palette = cyan) og lister de hyppigste off-farver med bounding box.
import sys
from PIL import Image
shot, palp, outp = sys.argv[1:4]
pal = Image.open(palp); cols = pal.getpalette(); PAL = {tuple(cols[i:i + 3]) for i in range(0, 768, 3)}
im = Image.open(shot).convert('RGB'); W, H = im.size
px = im.load(); mask = Image.new('RGB', im.size, (40, 40, 40)); mp = mask.load()
off = {}
for y in range(H):
    for x in range(W):
        c = px[x, y]
        if c not in PAL:
            mp[x, y] = (0, 255, 255)
            e = off.setdefault(c, [0, x, y, x, y]); e[0] += 1
            e[1] = min(e[1], x); e[2] = min(e[2], y); e[3] = max(e[3], x); e[4] = max(e[4], y)
mask.save(outp)
tot = sum(e[0] for e in off.values())
print(f'{shot}: {len(set(im.getdata()))} farver i alt, {len(off)} off-palette farver, {tot} off-pixels ({100*tot/(W*H):.2f} %)')
for c, e in sorted(off.items(), key=lambda kv: -kv[1][0])[:25]:
    print(f'  #{c[0]:02x}{c[1]:02x}{c[2]:02x}  {e[0]:6d} px  box x{e[1]}-{e[3]} y{e[2]}-{e[4]}')
