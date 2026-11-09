# Draws the two tiny UI PNGs: a Win2000-style arrow cursor (32x32) and a cd favicon (16x16).
# Run: ~/Documents/tools/pyimg/bin/python -I tools/art/icons.py
import os, sys
from PIL import Image, ImageDraw

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets')

# cursor: classic arrow, 1-px black outline, white fill, drawn in a 12x19 box
cur = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
d = ImageDraw.Draw(cur)
rows = [
    "X...........", "XX..........", "X.X.........", "X..X........", "X...X.......", "X....X......",
    "X.....X.....", "X......X....", "X.......X...", "X........X..", "X.........X.", "X.....XXXXXX",
    "X..X..X.....", "X.X.X..X....", "XX..X..X....", "X....X..X...", ".....X..X...", "......X.X...", "......XX....",
]
for y, row in enumerate(rows):
    for x, c in enumerate(row):
        if c == 'X':
            cur.putpixel((x, y), (0, 0, 0, 255))
# flood fill white inside the arrow (seed inside)
ImageDraw.floodfill(cur, (2, 4), (255, 255, 255, 255))
ImageDraw.floodfill(cur, (5, 13), (255, 255, 255, 255))
cur.save(os.path.join(root, 'cursor-arrow.png'))

# favicon: grey cd disc with a hole and a rainbow-ish sheen
fav = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
d = ImageDraw.Draw(fav)
d.ellipse((0, 0, 15, 15), fill=(200, 204, 216, 255), outline=(90, 94, 110, 255))
d.pieslice((1, 1, 14, 14), 200, 260, fill=(170, 220, 255, 255))
d.pieslice((1, 1, 14, 14), 20, 80, fill=(255, 220, 170, 255))
d.ellipse((5, 5, 10, 10), fill=(60, 60, 70, 255), outline=(240, 240, 240, 255))
d.ellipse((6, 6, 9, 9), fill=(0, 0, 0, 0))
fav.save(os.path.join(root, 'favicon-cd.png'))
print('ok', os.listdir(root))
