# tools/art/pallock.py — WP1 palette-lås (c8, 10-11-2026). QC-POLISH-PLAN §2 WP1 / QUALITY-PLAN §3 gate A3 (≤256 farver pr. frame).
#
# Én masterpalette pr. fase (dag / nat): 255 farver + ét transparent indeks (255). Alt spillet tegner fra assets/ i hub og
# opgavescener remappes til den, så en frame holder sig ≤256 farver uden runtime-kvantisering (council afviste runtime).
#   Dag : assets/bg/<navn>.png + assets/sprites/{aliens,helper,helper_chair,bld_*}.png + faste UI-farver (knapper, tekst, flag).
#   Nat : assets/bg/<navn>_nat.png BAGES her fra dag-bg'en med nat-LUT'en (samme formel som nightlut.py: lys 50 %, mætning 50 %,
#         kold drejning) og remappes sammen med assets/sprites/*_nat.png til nat-paletten. Dermed forsvinder darken()-fallbacken
#         (rgba + saturation-composite) og bg-404'erne for *_nat.png.
# Kør EFTER bld.py / aliens.py / helper.py / chair.py / nightlut.py — de skriver friske (ulåste) sprites; dette script låser dem.
# Paletterne gemmes som 16×16-swatches i assets/pal/{dag,nat}.png (dokumentation + ?dev&pal-overlay hvis det nogensinde bygges).
# Ulåste kilder gemmes i assets/unlocked/ (committes). Låste filer bærer PNG-tEXt pallock=1, så scriptet kan køres igen uden drift.
# Brug: ~/Documents/tools/pyimg/bin/python -I tools/art/pallock.py [--dry]      (Pillow; køres fra repo-roden)
import sys, os, glob, shutil
from PIL import Image, ImageEnhance, PngImagePlugin
UNL = 'assets/unlocked'  # ulåste kilder; en låst fil bærer tEXt-chunken pallock=1 og læses aldrig som kilde igen (idempotent)

def source(path):
    """Returnerer stien til den ULÅSTE kilde for path: en frisk (umarkeret) fil kopieres til assets/unlocked/ først."""
    u = os.path.join(UNL, os.path.relpath(path, 'assets'))  # assets/unlocked/bg/hub.png, assets/unlocked/sprites/aliens.png
    if 'pallock' not in Image.open(path).info: os.makedirs(os.path.dirname(u), exist_ok=True); shutil.copy2(path, u)
    elif not os.path.exists(u): raise SystemExit(f'{path} er låst, men {u} mangler – gendan kilden (git) før pallock')
    return u

DRY = '--dry' in sys.argv
BG_DIR, SPR_DIR, PAL_DIR = 'assets/bg', 'assets/sprites', 'assets/pal'
T = 255  # transparent index
# Faste UI-farver (style.css, hub.js, scene.js, fx.js, dialog.js) — skal ligge i paletten, ellers bliver krom/tekst off-palette.
UI = ['#000000', '#ffffff', '#404040', '#808080', '#f4f1ea', '#5e5a52', '#111111', '#0a246a', '#1b4fb0', '#ffd34a', '#ffd800',
      '#d4d0c8', '#dfe1ea', '#e8e4d8', '#c9c3b3', '#333333', '#2a2d3a', '#2c2f3a', '#3a3d4a', '#ffe9a0', '#ffd21f', '#d02020', '#ffbf2f', '#5a4610', '#2a2824', '#9aa0b4', '#6b7088', '#5a5d6a', '#15171f', '#8d93a8', '#3b4a7a', '#ffd58a', '#6a5a28', '#c9a516', '#e8e4d8']
UI = [tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for h in UI]

def nightlut(rgb):
    rgb = ImageEnhance.Color(rgb).enhance(0.5); rgb = ImageEnhance.Brightness(rgb).enhance(0.5)
    r, g, b = rgb.split(); b = b.point(lambda v: min(255, int(v * 1.06 + 6))); r = r.point(lambda v: int(v * 0.96))
    return Image.merge('RGB', (r, g, b))

def opaque_strip(im):
    """RGBA → RGB-strimmel af kun de uigennemsigtige pixels (så transparent ikke tæller med i paletten)."""
    px = [p[:3] for p in im.getdata() if p[3] > 100]
    if not px: return None
    w = 1024; h = (len(px) + w - 1) // w
    s = Image.new('RGB', (w, h), px[0]); s.putdata(px + [px[0]] * (w * h - len(px)))
    return s

def build_palette(rgb_images):
    """Mediancut over alle billeder → 255 - len(UI) farver + UI-farverne; indeks 255 = transparent (sort)."""
    h = sum(i.height for i in rgb_images); w = max(i.width for i in rgb_images)
    sheet = Image.new('RGB', (w, h)); y = 0
    for i in rgb_images: sheet.paste(i, (0, y)); y += i.height
    n = 255 - len(UI)
    q = sheet.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()[:n * 3]
    cols = [tuple(pal[i:i + 3]) for i in range(0, len(pal), 3)]
    for c in UI:
        if c not in cols: cols.append(c)
    while len(cols) < 255: cols.append((0, 0, 0))
    cols = cols[:255] + [(0, 0, 0)]  # 256 = transparent slot (sort; opaque sort går til et andet indeks, se remap)
    pimg = Image.new('P', (16, 16)); pimg.putpalette(sum(map(list, cols), []))
    pimg.putdata(list(range(256)))
    return pimg, cols

def remap(rgb, pimg, alpha=None, dither=Image.Dither.FLOYDSTEINBERG):
    """RGB (+ binær alpha) → P-billede på masterpaletten. Floyd-Steinberg som nightlut.py. Indeks 255 reserveres til transparent."""
    q = rgb.quantize(palette=pimg, dither=dither)
    data = list(q.getdata())
    black = next(i for i, c in enumerate(pimg.getpalette()[:765:3]) if True)  # indeks 0 bruges hvis 255 vælges for sort
    cols = pimg.getpalette(); blk = [i for i in range(255) if cols[i * 3:i * 3 + 3] == [0, 0, 0]]
    blk = blk[0] if blk else 0
    if alpha is not None:
        a = list(alpha.getdata())
        data = [T if a[i] <= 100 else (blk if v == T else v) for i, v in enumerate(data)]
    else:
        data = [blk if v == T else v for v in data]
    out = Image.new('P', rgb.size); out.putpalette(pimg.getpalette()); out.putdata(data)
    return out

def save(im, path, transparent):
    if DRY: print('  (dry)', path); return
    meta = PngImagePlugin.PngInfo(); meta.add_text('pallock', '1')
    if transparent: im.save(path, optimize=True, transparency=T, pnginfo=meta)
    else: im.save(path, optimize=True, pnginfo=meta)

def ncolors(path):
    im = Image.open(path).convert('RGBA'); return len({p for p in im.getdata() if p[3] > 0})

bgs = sorted(p for p in glob.glob(f'{BG_DIR}/*.png') if not p.endswith('_nat.png'))
sprs = sorted(p for p in glob.glob(f'{SPR_DIR}/*.png') if not p.endswith('_nat.png'))
sprs_nat = sorted(glob.glob(f'{SPR_DIR}/*_nat.png'))
print('bg:', [os.path.basename(p) for p in bgs]); print('sprites:', [os.path.basename(p) for p in sprs]); print('nat-sprites:', [os.path.basename(p) for p in sprs_nat])
os.makedirs(PAL_DIR, exist_ok=True)

for phase in ('dag', 'nat'):
    print(f'\n== {phase} ==')
    bg_rgb = {}
    for p in bgs:
        # nat: en RENDERET natkilde i assets/unlocked/bg/<navn>_nat.png (Higgsfield image-to-image, 10-11) vinder over LUT-bagningen
        natsrc = os.path.join(UNL, 'bg', os.path.basename(p)[:-4] + '_nat.png')
        if phase == 'nat' and os.path.exists(natsrc): bg_rgb[p] = Image.open(natsrc).convert('RGB'); print(f'  natkilde: {natsrc}'); continue
        im = Image.open(source(p)).convert('RGB'); bg_rgb[p] = nightlut(im) if phase == 'nat' else im
    spr_src = sprs if phase == 'dag' else sprs_nat
    spr_rgba = {p: Image.open(source(p)).convert('RGBA') for p in spr_src}
    samples = [im.resize((im.width // 3, im.height // 3), Image.Resampling.NEAREST) for im in bg_rgb.values()]  # bg vægtes ned (1/9)
    strips = [s for s in (opaque_strip(im) for im in spr_rgba.values()) if s is not None]
    samples += strips + strips  # sprites vægtes op (×2): små figurer tåler færre farver end baggrunde
    pimg, cols = build_palette(samples)
    if not DRY: pimg.save(f'{PAL_DIR}/{phase}.png')
    print(f'palette: {len(set(cols[:255]))} farver + transparent')
    for p, im in bg_rgb.items():
        dst = p if phase == 'dag' else p[:-4] + '_nat.png'
        before = ncolors(source(p)) if phase == 'dag' else None
        out = remap(im, pimg); save(out, dst, False)
        print(f'  {dst}: {before if before is not None else "(bagt)"} → {ncolors(dst) if not DRY else "?"}')
    for p, im in spr_rgba.items():
        a = im.getchannel('A'); rgb = im.convert('RGB')
        before = ncolors(source(p))
        out = remap(rgb, pimg, alpha=a, dither=Image.Dither.NONE); save(out, p, True)  # sprites uden dither: FS gav støj på små figurer
        print(f'  {p}: {before} → {ncolors(p) if not DRY else "?"}')
print('\nfærdig' + (' (dry run, intet skrevet)' if DRY else ''))
