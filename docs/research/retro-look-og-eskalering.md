# RESEARCH REPORT — "Forbandet cd-rom-spil" (craft)

> Skrevet 09-11-2026 i plan mode (kun denne fil måtte skrives). Tiltænkt placering: `/private/tmp/claude-501/-Users-frederikjensen/559efee9-d52f-4282-9480-3a3d82a622e3/scratchpad/research/craft/REPORT.md` — kopiér hertil når plan mode slås fra. Alt markeret **[gæt]** er fra hukommelse/erfaring og ikke bekræftet af en kilde i dag.

---

## DEL A — Autentisk Director/CD-ROM-look (2000–2006) i browser

### A1. Opløsning, letterbox, opskalering

- **Native canvas: 640×480** (den kanoniske Director/Shockwave-stage; Pixeline/Magnus & Myggen-æraen). 800×600 var "stort" og mest til Windows-fullscreen-titler. Vælg 640×480 — det giver også mindre assets.
- Lås canvas i 4:3; **letterbox på sort** (ikke mørkegrå — CRT-sort er sort). Alternativ: letterbox på et fake "Windows 2000-skrivebord" (se A5), hvilket gør kantområdet til en del af fiktionen.
- Skalér kun i **heltal** når det kan lade sig gøre (1×, 2×, 3×) med `image-rendering: pixelated` + `ctx.imageSmoothingEnabled = false`. Ved ikke-heltal: render til offscreen 640×480 → tegn op med nearest. Browser-fallback: `image-rendering: crisp-edges` (Firefox).
- **Hvorfor ikke blur:** æraens charme er *skarpe* pixel-kanter oven på *bløde* pre-renderede gradienter. Bilineær opskalering udvisker dither-mønstre og JPEG-blokke, og så ligner det bare et dårligt moderne billede. Dither + nearest = "signal"; dither + blur = "mudder".
- Director brugte **Comic-Sans-æraens anti-aliasing = ingen**: tekst renderet uden AA (eller med 1-bit). I canvas: render tekst i en offscreen-kontekst og threshold'er alfa (>128 → 255, ellers 0), eller brug en bitmap-font. Det er den enkelte største "det-føles-rigtigt"-detalje. **[erfaring]**
- CRT-emulering: **nej** til scanlines (det er 80'er/arkade-kode). Skolecomputer-skærme 2000–2006 var 15-17" CRT'er med let bloom/geometrifejl. Højst: 1–2 % vignettering + svag barrel-distortion på fullscreen-glitch-øjeblikke, aldrig konstant.

### A2. Pre-renderet 3D-tegnefilmslook (Bryce / 3D Studio MAX R3 / Poser 4)

**Hvad det var:** Phong/Blinn-shading uden GI, 1–2 punktlys + ambient, raytracede hårde skygger (eller shadow-maps med synlig aliasing), stærk plastik-specular (hvid highlight-plet på *alt*, også stof), mætttede flade farver, "procedural texture"-træ/marmor (Bryce), hul-i-geometrien-fejl, let forkert perspektiv fordi baggrund og karakter er renderet hver for sig og sat sammen i Photoshop 5/Director. Ingen depth of field. Himmel = Bryce-gradient med perfekt-runde volumetriske skyer. Vand = reflekterende bump-plan.

**Prompt-ordforråd til billedgenerering** (Nano Banana Pro / FLUX; brug 5–10 af dem, ikke alle):
```
1998 pre-rendered 3D CGI, Bryce 3D render, 3D Studio MAX R3 render, Poser 4 character,
low-poly geometry, Phong shading, plastic specular highlights, hard raytraced shadows,
no global illumination, saturated primary colors, procedural marble/wood texture,
CD-ROM edutainment game screenshot, children's educational software, 640x480,
256-color palette, dithered, slight JPEG artifacts, Macromedia Director,
Windows 98 era, scanned from a PC Gamer magazine 1999, flat fluorescent lighting,
checkerboard floor, gradient sky with cotton clouds, isolated 3D mascot character
with big eyes, Pixar-knockoff mascot, clip-art, software box art
```
Negativ/undgå: `photorealistic, global illumination, subsurface scattering, depth of field, film grain, cinematic lighting, 4k, raytracing reflections, Pixar quality, Unreal Engine`.

Tips: (1) Generér **baggrund og karakter separat** (karakter på neutral grøn/magenta, fritlæg) og komponér med en lille perspektivfejl — det er æra-autentisk. (2) Bed om "sprite sheet, 8 frames, same character, turnaround" til gang-cyklusser; vær forberedt på at håndrette. (3) Bed om *lavere* kvalitet end modellen vil give: "unfinished render, test render, low anti-aliasing". (4) Til "fake Poser-menneske": "Poser 4 default figure, stiff pose, mannequin-like, dead eyes, 1999 clip art" — det giver uncanny gratis og er hjemme i horror-delen. (5) Higgsfield: nano_banana_2 = Pro-alias, ægte NB2 = nano_banana_flash (jf. CLAUDE.md); brug Unlimited.

**Post-processing (det der sælger looket):**

Pillow — findes KUN i `/usr/bin/python3` (system) eller venv `~/Documents/tools/pyimg/`; brew-`python3` har ikke PIL (bekræftet i dag). Pillow har `quantize(colors, method, kmeans, palette, dither)` med `Quantize.MEDIANCUT | MAXCOVERAGE | FASTOCTREE | LIBIMAGEQUANT` og `Dither.NONE | FLOYDSTEINBERG`. **Ingen native ordered/Bayer-dither i Pillow** — skriv den selv (4×4/8×8-matrix, numpy) eller brug ImageMagick.

```python
# /usr/bin/python3  — "director_look.py"
from PIL import Image, ImageEnhance
im = Image.open("scene.png").convert("RGB").resize((640,480), Image.LANCZOS)
# 1) let farvedrift (Director/Win98-gamma: lidt lysere mellemtoner, grønstik)
im = ImageEnhance.Color(im).enhance(1.12)
r,g,b = im.split(); g = g.point(lambda v: min(255,int(v*1.03))); im = Image.merge("RGB",(r,g,b))
# 2) JPEG-rundtur (Director importerede ofte JPEG q=60-75 i "Standard"-kompression)
im.save("/tmp/tmp.jpg", quality=65, subsampling=2); im = Image.open("/tmp/tmp.jpg").convert("RGB")
# 3) 8-bit adaptiv palette m. Floyd–Steinberg (brug 256 til baggrunde, 64 til "billig" look)
p = im.quantize(colors=256, method=Image.Quantize.MEDIANCUT, kmeans=2, dither=Image.Dither.FLOYDSTEINBERG)
p.save("scene_8bit.png", optimize=True)          # PNG8, typisk 80–200 KB ved 640×480
```

Ordered Bayer-dither i numpy (ser mere "Windows 256-color"-agtigt ud end F-S; F-S ser mere "Mac/Photoshop-agtigt" ud):
```python
import numpy as np
B4 = np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]])/16.0 - 0.5
a = np.asarray(im).astype(float)
t = np.tile(B4, (480//4, 640//4))[...,None] * (255/ (levels-1))   # levels=6 → 6x6x6 web-palette
a = np.clip(a + t, 0, 255)
q = np.round(a/255*(levels-1))*(255/(levels-1))
Image.fromarray(q.astype(np.uint8)).save("scene_bayer.png")
```

ImageMagick (installeret: `/opt/homebrew/bin/magick`):
```bash
magick scene.png -resize 640x480! -quality 65 jpg:- | magick - -colors 256 -dither FloydSteinberg PNG8:scene.png
magick scene.png -ordered-dither o8x8,6 PNG8:scene_bayer.png        # 6 niveauer pr. kanal ~ web-safe
magick scene.png +dither -colors 64 PNG8:scene_cheap.png           # ingen dither = "banding"-look
magick scene.png -remap win256.png PNG8:scene_win.png              # fast systempalette (lav win256.png én gang)
magick scene.png -posterize 6 scene_post.png
```
(Kommandoerne er standard-IM-syntaks; `-ordered-dither o8x8,N` niveau-syntaksen er fra IM-dokumentationen — IM-Usage-siden gav 402 i dag, så verificér lokalt med et testbillede.)

**Directors "palette flash":** I 8-bit-tilstand har hele skærmen én palette. Når et nyt billede med sin egen palette blev vist uden at paletten var sat (puppetPalette/palette-kanalen), blev de nye pixels fortolket med den *gamle* palette i 1–2 frames → psykedelisk forkert-farvet flash, eller hvid blink ved palette-fade. Kilder i dag bekræftede mekanikken (8-bit = index i aktuel palette; puppetPalette persisterer til den nulstilles), ikke navnet. **Emulering:** hold to paletter (gammel/ny) som 256-entry LUT'er; i 1–3 frames tegn det nye indekserede billede med den gamle LUT. Kræver at scener gemmes som indeksbillede + palette (fx PNG8 → læs palette via Pillow → gem `scene.idx.bin` + `scene.pal.json`, eller gør det runtime via `getImageData` og nærmeste-farve-opslag én gang ved load). Brug det *bevidst* som horror-signal i Del B (det ligner en fejl — det er præcis pointen).

Andre drift-detaljer: 1 px hvid/sort kant omkring fritlagte sprites ("fringe" fra dårlig alpha), JPEG-blokke på 8×8 synlige i himmelgradienter, en enkelt forkert farve i paletten så ét objekt er lidt magenta.

### A3. UI-konventioner

- **Knapper:** 2-px bevel (lys top/venstre `#fff`, mørk bund/højre `#808080`, yderkant `#404040`), flade gradient-fyld, afrundede "pille"-knapper med hvid specular-streg i toppen (Director-"3D-button"-Xtra-look), hover = lysere + 1 px løft, tryk = inverteret bevel. Store børnespil: cirkulære "boble"-knapper med ikon.
- **Fonter:** Comic Sans MS (dialog/børn), Arial Black (titler), Tahoma 11 px (Windows-UI), Verdana, Trebuchet MS, Impact (minigame-score). Til fake-OS: Tahoma 8 pt (Win2000) / Tahoma 8 pt bold i titellinjen (XP, Trebuchet i XP's titellinje). Webfonts: Comic Neue (gratis Comic Sans-klon), "Archivo Black" ≈ Arial Black, Tahoma findes på de fleste systemer — fallback til `font-family: Tahoma, "DejaVu Sans", sans-serif`.
- **Cursor:** CSS `cursor: url(hand.png) 6 0, auto` med 32×32 PNG. Æra-look: sort pil med 1 px hvid kontur, pegefinger-hånd (Director "fingerCursor") med hvid handske og sort outline. Egen sprite-cursor (canvas-tegnet) lader dig *hijacke* cursoren senere (Del B) — tegn den selv og sæt `cursor: none` på canvas. Husk: `cursor: none` + egen sprite giver 1 frame lag; det er æra-autentisk.
- **Klik-for-videre-narration:** talende figur i hjørnet, mund-sprite med 3–4 frames (lukket/halvåben/åben/"oo") drevet af amplitude i lydfilen (beregn offline: RMS pr. 80 ms → JSON-array). Tekst skrives frem bogstav for bogstav med "tik"-lyd (10–14 ms pr. tegn), klik = spring til slut, klik igen = næste. Ikon "▼" blinker i hjørnet af tekstboksen.
- **"Den kloge hjælper"-stemme:** rolig, langsom, lidt for mange pauser, siger spillerens handling højt ("Godt klaret! Du fandt nøglen."). Børne-cd-rom'er brugte voksne stemmeskuespillere med let teatralsk diktion. Den stemme er din vigtigste horror-aktør senere.
- **SFX:** 8-bit-agtige "boing/pop/ding", men æra-korrekt er faktisk **22 kHz 8/16-bit samplede lyde** fra lydbiblioteker (Hollywood Edge-agtige), ikke chip-lyde. Mix: korte, med lidt for høj volumen, let clipping.
- **Musik: General MIDI gennem Windows' "Microsoft GS Wavetable SW Synth"** (Roland-licenseret 3 MB sæt) — det er *den* lyd. Rendér MIDI → WAV/OGG offline:

  ```bash
  # fluidsynth er IKKE installeret (brew install fluid-synth ville kræves).
  fluidsynth -ni -g 0.8 -r 22050 -F out.wav GeneralUser_GS.sf2 song.mid
  ffmpeg -i out.wav -ar 22050 -ac 1 -c:a libvorbis -q:a 2 song.ogg   # ffmpeg ER installeret
  ```
  Frie GM-soundfonts: **GeneralUser GS v2.0.1** (S. Christian Collins; licens tillader fri brug inkl. kommerciel — bekræftet via ScanCode-licensdb; ~30 MB **[gæt]**), **FluidR3_GM** (MIT-agtig, ~140 MB, mere "pænt"), **Arachno SoundFont** (gratis, SC-55-agtig), **SGM-V2.01**, Trevor0402's **SC-55 soundfont** (tættest på Roland-lyden, samplet fra ægte SC-55 — gratis, men juridisk gråzone **[gæt]**), **Timbres of Heaven**. Ingen .sf2 fundet på Mac'en i dag. Alternativ uden fluidsynth: Godot 4 har ingen MIDI-afspiller; i browser kan **js-synthesizer (FluidSynth-WASM)** eller **spessasynth** afspille .mid + .sf2 live — men soundfont fylder MB'er; rendér offline til OGG i stedet.
  Komposition: 100–120 BPM, GM-patch 1 (Acoustic Grand), 12 (Vibraphone), 73 (Flute), 25 (Nylon Guitar), 11 (Music Box), perkussion kanal 10 med "Standard Kit". 8–16 takters loops. Til horror: samme MIDI, men transponér ned 2 halvtoner, tempo 92 %, skift ét patch til 50 (Synth Strings) eller 99 (FX Crystal) — "det samme, men ikke".
- **Lavopløst stemme (22 kHz / 8-bit):**
  ```bash
  # ffmpeg (installeret). Båndbegræns FØR nedsampling og bit-reduktion.
  ffmpeg -i voice.wav -af "highpass=f=120,lowpass=f=7000,acompressor=threshold=-18dB:ratio=3,volume=1.5" \
         -ar 22050 -ac 1 -c:a pcm_u8 voice_22k8.wav
  # web-levering: tilbage til 16-bit ogg men behold artefakterne
  ffmpeg -i voice_22k8.wav -ar 22050 -c:a libvorbis -q:a 1 voice.ogg
  # "11 kHz-telefon-fortæller" (ekstra grim):  -af "lowpass=f=3400,highpass=f=300" -ar 11025 -c:a pcm_u8
  # Bitcrush-alternativ uden pcm_u8: -af "acrusher=bits=8:mode=lin:mix=1"
  ```
  sox er ikke installeret; ville være `sox in.wav -r 22050 -b 8 -e unsigned-integer out.wav lowpass 7000 dither`.

### A4. Fake Shockwave/Director-krom

- **Loading-bar:** grå ramme, blå (#000080→#1084d0) fyld der hopper i ujævne ryk (ikke lineært — simulér med tilfældige trin 2–11 % og pauser 100–700 ms), tekst "Indlæser… 47 %" i Tahoma 8 pt, Shockwave-æra: roterende logo-boble. Læg et "Henter data fra cd-rom…"-step. Faktisk preload af assets kan køre bagved, så baren er ægte men "dramatiseret".
- **Windows 2000-vindue:** titellinje gradient `#0a246a → #a6caf0`, Tahoma 8 pt bold hvid, knapper `_ □ ×` 16×14 px bevel; klientbaggrund `#d4d0c8`. **XP (Luna):** blå titel `#0054e3` m. rundede hjørner, knapper med rød × , Trebuchet MS 10 pt. Vælg Win2000 til "skolens edb-lokale 2003" (kommuner opgraderede sent). Lav begge i ren CSS/canvas — ingen billeder nødvendige.
- **Dialogbokse:** "Fejl: Kunne ikke finde cd-rom'en. Indsæt CD 2 og tryk Gentag." med ikon (gul trekant/rød cirkel-X), knapper [Gentag] [Annuller] (Win2000 havde "Prøv igen"). Dansk Windows 2000 brugte "Annuller", "Ja", "Nej", "Luk". Director-projektorens egen fejl: **"Script error: Handler not defined #mouseUp"** i et simpelt vindue — ægte Director-fejlformat, meget genkendeligt for de få, uhyggeligt-teknisk for alle.
- **Cd-rom-spin:** 1,5–3 s stigende "whirr" + klik-seek-lyde + 0,5 s stilhed før noget loader. Kan syntetiseres: brun støj gennem bandpass der glider 300→1800 Hz over 2 s + klik (kort impuls gennem lowpass). Eller optag en ekstern dvd-drev-lyd. Brug den som **pause-våben** (se B).
- **"Indsæt CD 2":** klassisk 2-disc-oplevelse. Horror-brug: der *er* ingen cd 2. Dialogen kan ikke lukkes. Eller: cd 2 "findes" og indeholder noget andet.
- Andre: Shockwave-"Made with Macromedia"-splash; "Dette program er designet til 800×600, 16-bit farver"; "Tryk F11 for fuld skærm"; Dansk-lokaliserede UI-strenge med engelske rester ("Loading…" midt i dansk — æra-ægte).

### A5. Tooling på denne Mac (tjekket i dag, intet installeret)

| Værktøj | Status |
|---|---|
| `magick` / `convert` | **OK** `/opt/homebrew/bin/` (ImageMagick) |
| `ffmpeg` | **OK** `/opt/homebrew/bin/ffmpeg` (+ `lame`) |
| `python3` | `/opt/homebrew/bin/python3` **uden PIL**; Pillow findes i `/usr/bin/python3` og venv `~/Documents/tools/pyimg/` (memory-note 09-10) |
| `godot` | **OK** `/opt/homebrew/bin/godot` + `/Applications/Godot.app` |
| `node` | **OK** v24.19.0 (fnm); `pnpm`, `deno` i brew |
| `fluidsynth` | **MANGLER** (`brew install fluid-synth`) |
| `sox` | **MANGLER** (`brew install sox`) — ffmpeg dækker det meste |
| `timidity` | mangler (ikke nødvendigt hvis fluidsynth) |
| Soundfonts | **ingen .sf2** fundet (`/opt/homebrew/share/soundfonts` findes ikke) — GeneralUser GS skal hentes (~30 MB) |
| Andet relevant i brew | `potrace`, `poppler`, `sdl2/sdl3`, `ggml` (whisper), `cliclick` |

Skal installeres for fuld pipeline: `fluid-synth` + én soundfont. Resten er der.

### A6. Engine-anbefaling (1–1,5 t point-and-click + minispil, én webside, ≤16 MB artifact eller GitHub Pages)

**Anbefaling: ren HTML5 canvas + vanilla JS (ESM, ingen bundler-krav), evt. med et mikro-eget scene-/dialog-system. Ikke Godot, ikke Phaser.**

Begrundelse:
- **Godot 4 web:** tom eksport er ~40 MB .wasm ukomprimeret / ~5 MB brotli / ~9 MB gzip (Godot progress report maj 2024 + blogs; tallene varierer 2×). Flere filer (.html/.js/.wasm/.pck/.png) — ikke "én side". **claude.ai-artifact:** 16 MB pr. fil, ingen kontrol over headers → kun single-threaded eksport (standard fra 4.3) ville fungere, og wasm'en alene spiser halvdelen af budgettet *ukomprimeret* (artifact-serveren komprimerer måske ikke). **GitHub Pages:** OK med thread-support slået fra (ingen COOP/COEP nødvendig), gzip on-the-fly. Godot giver dig til gengæld intet, du behøver her: ingen fysik, ingen 3D, og fake-OS-effekter (DOM-dialoger, cursor-hijack, fullscreen-flash) er *sværere* fra Godot's canvas end fra DOM. Godot's web-audio i "Sample"-mode mangler effekter (reverb osv.) — dårligt til horror-lyd.
- **Phaser 3/4:** ~1,2 MB min.js **[gæt]**, fin til minispil, men er en runtime oven på canvas, og dialog/UI-arbejdet er lige så manuelt. Overhead uden stor gevinst for et point-and-click; tilføj kun hvis minispillene bliver arcade-tunge (fysik, mange sprites). Kan hentes fra cdnjs (tilladt i artifacts).
- **Vanilla canvas:** 0 kB runtime, fuld kontrol over nearest-neighbour, palette-LUT'er, egen cursor, DOM-overlays til fake Windows-dialoger, Web Audio API fuldt (bitcrusher via `WaveShaperNode`/AudioWorklet, reverb via `ConvolverNode`). Alt det "forkerte" (UI der lyver, elementer der ikke må kunne lukkes) er trivielt i DOM.

**Asset-budget (artifact ≤16 MB i alt pr. side; supporting files op til 16 MB hver, 255 filer pr. publish):**
- 640×480 PNG8 pre-renderet scene: **80–250 KB** (dithered; F-S komprimerer dårligere end ordered — ordered Bayer ~30 % mindre **[erfaring]**). → ~40–60 scener på 10 MB. Realistisk 1,5-timers spil: 25–35 scener + 100–200 sprites (små) ≈ 6–8 MB billeder.
- Lyd: OGG Vorbis q1–2 mono 22 kHz ≈ 20–25 KB/s → 40 min stemme ≈ **50–60 MB — for meget**. Løsning: (a) kun 8–12 min nøgle-replikker som lyd, resten tekst + "mumle-lyd" (æra-ægte: mange danske cd-rom'er havde kun delvis tale), (b) Opus i WebM-container ved 24 kbps ≈ 3 KB/s → 40 min ≈ 7 MB (Safari ≥17 kan Opus i WebM/ogg? — **[gæt]**: Safari understøtter Opus i CAF/MP4, ikke pålideligt i .ogg; test, eller lever både .ogg og .m4a/AAC-HE), (c) GitHub Pages har intet 16 MB-loft — brug Pages til fuld version og artifact til demo/kapitel 1.
- Musik: 6–8 MIDI-loops renderet til OGG 22 kHz mono q1, 60–90 s hver ≈ 1,5–2 MB. Eller afspil MIDI live via en 2–4 MB mini-soundfont (sf3/ogg-komprimeret) med spessasynth — sparer plads hvis mange numre, og gør "forkert patch"-tricket gratis runtime.
- Kode: 100–300 KB.
- Konklusion: **artifact-version = komplet men stemme-let**; **GitHub Pages = fuld stemme**. Byg assets i mapper så `files` i publish kan bære dem.

**Save-state:** `localStorage` (5 MB) til JSON-state; wrap i try/catch (artifacts: private vinduer/thumbnail-capture kan kaste). Gem *også* "meta-hukommelse" (antal starter, sidste besøgstidspunkt, om spilleren prøvede at slette) — det er B-del-ammunition. Spilleren kan slette localStorage; gem en skygge-kopi i IndexedDB og i et cookie-frit `name`-fri sted… realistisk: IndexedDB + localStorage dobbelt, og accepter at en hård sletning vinder (kan endda honoreres narrativt: "Du slettede mig.").

**Audio autoplay:** Chrome/Safari kræver user gesture; `AudioContext` oprettet før gestus er `suspended` → kald `resume()` i første klik. Design: start-skærmen *er* gestussen ("Klik for at indsætte cd'en"). Mediaelementer: tjek `play()`-promise. Konsekvens for horror: **du kan ikke starte lyd uden klik, men efter første klik kan du spille hvad som helst når som helst** — inkl. mens spilleren tror spillet er pauset/i baggrund (Page Visibility API: vælg bevidst om spillet "fortsætter" når fanen er væk — uhyggeligt hvis stemmen taler mens spilleren er på en anden fane; mute efter 10 s så det ikke bare er irriterende).

**Fake-OS-glitch-muligheder i browser (alt er muligt inden for sidens rektangel):**
- Fullscreen-flash: `requestFullscreen()` kun i gesture-handler (klik) — så planlæg at det "store" øjeblik sker på et klik. Uden fullscreen: canvas-overlay der dækker hele viewporten med hvid/sort/forkert palette i 1–3 frames.
- Fake dialogbokse: DOM-elementer stylet som Win2000. **Ægte `alert()`** er muligt og *ægte* system-chrome — brug højst én gang, sent; den blokerer tråden (stilhed, lyd stopper = effekt). Browsere viser "forhindre flere dialoger" efter 2. gang — så kun én.
- Cursor-hijack: `cursor: none` + egen sprite → du kan få den til at drive, blive forsinket, "trække" mod noget, eller vise en anden cursor (gammel pil → hånd der peger på spilleren). `Pointer Lock API` kan fange musen helt (kræver gesture, viser browser-banner — brug ikke).
- Titel/favicon: `document.title` og favicon kan ændres ("Pixelskolen 2.0" → "pixelskolen" → "hvor er du"). Virker også i artifact-iframe? **[gæt: nej — iframe-titel ses ikke]**; virker på GitHub Pages.
- Vibration (mobil), `speechSynthesis` (dansk TTS-stemme fra OS — en robot-stemme der pludselig taler med systemets egen stemme = analog-horror-TTS gratis), `Notification` (kræver tilladelse — nej).
- Kan IKKE: ændre OS-cursor uden for canvas, åbne/ændre filer, lave ægte vinduer, læse brugerens navn (men `navigator.language`, lokal tid, skærmstørrelse, batteriniveau (Chrome) kan bruges: "Klokken er 23:41. Du burde sove.").
- Tilbage/luk-knap: `beforeunload`-prompt er ægte browser-UI ("Vil du forlade siden?") — en enkelt gang som "spillet vil ikke lukkes" er stærkt.

---

## DEL B — Horror-eskalering i et "børnespil der bliver forbandet"

### B1. Referencer — hvad de konkret gør

**Petscop** (2017–19, Tony Domenico): Baseline = klodset PS1-Let's-Play; første off-note er *tekst*: skilte der er lidt forkerte ("we have failed to remove all of the Pets from their homes", trofæ til et dyr der nægter at forlade buret). Den første video ender allerede med den skjulte verden (Newmaker Plane) — så baseline er kort (~10 min), men *forklaringen* udskydes 24 afsnit. Principper: alt tekst er skrevet af nogen ("Everything is there because somebody decided to put it there"); dør der kun dukker op efter minutters idle; "keep watching the windmill" → kun fundamentet er der; skjulte billeder i loading-screens som fortælleren ikke bemærker; spejl-soveværelse hvor spejlbilledet kommer ud af sync *mens musikken fortsætter*; title-screen-demoer der afspiller tidligere sessioners input (spillet "husker" og genafspiller spilleren); dates/kalendere der viser et år; Domenico: "dread, not shock", "not a puzzle to be solved", "operating on a foreign set of rules", en forklaringsside vist *for lille til at læse* var "den perfekte mængde detalje".

**DDLC** (2017): 2–3 timers *ægte* dating-sim før noget sker (lang baseline, men poems lækker lidt). Meta: `characters/*.chr`-filer der er billeder/lyd/kode når man dekoder dem; spillet detekterer sletning af `monika.chr`; save-slet efter akt 1 ("ny start" der ikke er ny); menuer korrumperet (Sayori klippet ud af titelskærm, knapper der ikke virker, cursor der nægter at vælge andre end Monika); digte med glitch-tegn; fake crash. Teknik: *agency-tyveri* ("metalepsis") — horror når spillet tager kontrollen fra dig. Browserækvivalent: localStorage-"filer" spilleren kan "slette" i et fake Stifinder-vindue; falsk crash med Director-fejlboks; menupunkt der mangler når man kommer tilbage.

**Inscryption** (2021, Mullins): Horror fra "uncanny mood, low-fi visuals, disturbing soundscape" (Mullins). Lov-brud: du kan rejse dig fra bordet; kortene taler til dig og husker dig; genre-switch (3D-hytte → GBC-pixel → 3D) som struktur; OLD_DATA; fake kameraoptagelser (Luke Carder) som ramme; slut: spillet "sletter sig selv". Lære: **giv spilleren én forbudt handling** (rejs dig, kig bag dig) tidligt — den er sjov, og senere er den den eneste vej ud.

**Baldi's Basics** (2018, McGonigal): "Things are off" før man ved hvad man skal frygte; inkonsistent 2D/3D-kollage som i Reader Rabbit/Reading Blaster; blank mimik → langsomt smil-til-rynke ved forkert svar; **tredje opgave er uløselig** → fejl er uundgåelig → horror begynder; Baldi accelererer pr. fejl; ingen forklaring af rigtige svar. Lære: lad *pædagogikken* selv blive fjendtlig (en opgave der ikke kan løses, en lærer der ikke accepterer det rigtige svar).

**Amanda the Adventurer** (2022): Børne-tv-format (Dora-agtigt) på VHS; Amanda stiller spørgsmål direkte og venter på spillerens *indtastede* svar; forkerte svar → hun bliver vred; Wooly (fåret) er bange og advarer; rammen (loft, bånd) er tryg-utryg. Lære: **call-and-response-formatet fra børne-tv er en perfekt horror-maskine**: "Kan du sige det? … Nej. Sig det."

**Frog Fractions** (2012): 5 minutter brøker, så genre-skift for hvert "kedeligt" øjeblik. Lære: baseline *skal* være spilbar og lidt sjov på egne præmisser; skiftet skal belønne nysgerrighed (du *vælger* at svømme ned).

**Omori** (2020): Pastel-Headspace ↔ Black Space; "Something" (et øje i skygger) der er sødt-og-forkert; horror i korte stød med lange rolige stræk; monstre med forkert materialitet (blyant, fotorealistiske lemmer, ler) → "hører ikke til i verdenen". Lære: **én asset i et andet medie** (et fotografi i en pre-renderet 3D-verden; en håndtegnet blyantstreg) er stærkere end et monster.

**Analog horror** — Local58 (Straub): "stillness, distrust of safety warnings, misuse of mass perception"; falske nød-udsendelser; retraktion der afslører at truslen var ægte (Contingency); GPS der leder forkert (fastest route); børnecartoon der bliver dystert (Show for Children); subliminale ansigter + direkte instruktioner (Real Sleep); mediet selv bryder sammen (Digital Transition). Mandela Catalogue (Kister): instruktionsvideoer fra myndigheden; Alternates skal *inviteres ind*; TTS-stemme; ansigter forvrænget til kæmpe-øjne-og-grin; "hold børn væk fra audiovisuelle medier". Lære: **autoritetens stemme (kommunen, Undervisningsministeriet, "systemadministratoren") som den der lyver; instruktioner til seeren; ro frem for støj.**

### B2. PRINCIPPER (destilleret)

1. **Uskyldsbaseline: 15–20 % af spilletiden helt ren** (12–18 min af 90). Den skal være *god* edutainment: 2–3 sjove minispil, en hjælper man kan lide. Ingen blink, ingen "hint". Spilleren skal have stolet på hjælperen og lært dens stemme. (Petscop: kort; DDLC: lang — til 90 min er 15 min rigtigt, mere og folk falder fra.)
2. **Første off-note skal kunne afvises som en fejl**: en stavefejl i en tekstboks der ellers er perfekt; hjælperen siger spillerens *forkerte* navn én gang; en tæller der står på 1 selvom det er første gang; en skygge der peger forkert vej i ét render. Aldrig kommenteret af spillet.
3. **Upålideligt UI før upålidelig verden**: knapper der skifter plads, "Gem"-knap der siger "Gemt" men der er ikke noget gemt, en loading-bar der går *tilbage*, volumen-slider der ikke virker. UI er spillerens krop i spillet — angrib den først, forsigtigt.
4. **Gentagelse med én ændring**: genbrug præcis samme scene (samme PNG) men med ét objekt ændret/fjernet/for meget. Billigst og stærkest. Gør det 3 gange: første gang bemærker 30 %, anden gang 80 %, tredje gang ved de at *lede* — og så ændrer du i stedet lyden.
5. **Pseudo-glitches skal være æra-korrekte**: palette-flash, JPEG-blokke, sprite-fringe, Director-script-fejl, "Indsæt CD 2" — ikke moderne datamosh/VHS-static (det er en anden æra og signalerer "produceret horror"). Hold hver under 400 ms. Brug glitches max 4–6 gange i hele spillet.
6. **Wrongness i tekst**: typos i *hjælperens* linjer (ikke i systemtekst), sætninger der stopper midt i, "……" for lange pauser med tik-lyd der fortsætter uden tekst, forkert navn, andet sprog (engelsk linje i dansk flow — æra-ægte og uhyggeligt), gentaget ord ("Godt klaret klaret"), instruktioner i anden person der ikke handler om spillet ("Er du alene?"). Petscop-reglen: *nogen* har skrevet det — lad det være muligt at ane hvem.
7. **Stilhed som våben**: musik-loop der *ikke* starter igen efter en scene; stemme der venter 4–6 s længere end normalt; cd-rom-spin uden resultat; mund-sprite der bevæger sig uden lyd. Horror bor i den pause, hvor spilleren venter på at spillet gør noget og det ikke gør.
8. **Lad spilleren vælge at kigge**: forbudte/mærkelige hotspots (en dør der ikke er i opgaven, "Lærerværelse", et ikon på skrivebordet der ikke hører til). Det *værste* må aldrig påtvinges — det skal klikkes på. Men: det, der blev set, skal have konsekvenser i hovedsporet (hjælperen ved du kiggede).
9. **NPC-bevidsthed i tre trin**: (a) hjælperen reagerer på spilleradfærd der *ikke* er spil (idle i 2 min: "Er du der stadig?"; klik 20 gange hurtigt: "Hold op."); (b) hjælperen kender ting udefra (klokkeslæt, at det er weekend, at vinduet er lille); (c) hjælperen taler om sig selv som fange/eksisterende ("Jeg er her også når du lukker."). Hold trin (c) til sidste tredjedel.
10. **Falske slutninger**: en "Tillykke! Du har gennemført Pixelskolen!"-skærm efter ~55 min med credits i Comic Sans — der *ikke* kan afsluttes, eller som genstarter til en version af spillet der er lidt mørkere. Max 2 falske slutninger; den første bør komme hvor en ægte børne-cd-rom ville slutte.
11. **Dag/nat-skift**: samme 3D-renders med nat-belysning (gen-generér "same scene, night, fluorescent lights off, one monitor glowing"). Skolen efter lukketid = liminal gratis. Overgangen bør ske uden forklaring, midt i et minispil.
12. **"Spillet husker"**: localStorage-meta: antal gange startet ("Velkommen tilbage. Det er 3. gang."), om spilleren prøvede at slette/genstarte ("Du prøvede at starte forfra."), hvad de kiggede på, deres indtastede navn fra første session (og så bruges et andet). Gem i både localStorage og IndexedDB. Petscop/DDLC/Inscryption/Undertale-kernen: **konsekvens på tværs af den grænse spilleren troede var sikker (reset).**
13. **Autoritet lyver**: fake "Meddelelse fra kommunens IT-afdeling", "Undervisningsministeriet anbefaler…", "Systemadministrator: skolen lukker nu" — Local58/Mandela-greb. Instruktioner til spilleren der er lidt forkerte ("Luk øjnene i 10 sekunder").
14. **Materiale-brud (Omori-reglen)**: én gang i spillet: et *rigtigt fotografi* (skolegang, tomt edb-lokale, 2003-digitalkamera-look 640×480 med dato-stempel i gult) inde i den pre-renderede verden. Stærkere end noget monster. Max 2–3 i hele spillet.
15. **Medfølelse i hjælperen**: det bliver bedre horror hvis hjælperen *også* er offer (Wooly/Sayori/Monika-aksen) — spilleren skal i tvivl om de skal frygte eller redde den.
16. **Jump scares — hvor de hjælper vs. skader**: Hjælper: *én* gang, ~70–75 % inde, efter den længste stilhed, og *kort* (≤300 ms, et ansigt i forkert medie, lyd clippet 22 kHz) — den frigør spænding og giver tilladelse til at sidste akt kan være *stille* igen. Skader: alt før 50 % (slår innocence-kontrakten i stykker, resten læses som "haunted game"-skabelon), mere end 2 i alt, og alle der bruger moderne skrig-lyd. Bedste "jump scare" i dette format er faktisk **et ægte OS-element**: `alert()` eller `beforeunload` — fordi det bryder rammen *ægte*.
17. **Afslutning**: enten (a) "sletning" — spillet ryddes selv (localStorage wiped, titel ændret, kan ikke startes igen uden hård reload → "Spillet er fjernet fra cd'en"), eller (b) stille — tilbage til dag-udgaven, alt normalt, men hjælperen siger ikke længere noget. (b) er mere Petscop, (a) mere DDLC/Inscryption. Vælg ét; ikke begge.

### B3. Pacing-kurve for 60–90 min (forslag, minut-for-minut, 90-min-version; skalér ×0,67 for 60)

| Min | Fase | Hvad sker | Intensitet 0–10 |
|---|---|---|---|
| 0–2 | Krom | Win2000-skrivebord, dobbeltklik på cd-ikon, cd-spin, Shockwave-loading, logo, "Klik for at starte" (audio-gesture) | 0 |
| 2–15 | Ren baseline | Hjælper præsenterer sig, 1. minispil (stave/tal), 2. minispil, 1. belønning (klistermærke). God musik. | 0 |
| 15–17 | Første off-note | Én stavefejl i hjælperens boble; ét sprite-fringe. Ikke kommenteret. | 1 |
| 17–28 | Baseline fortsætter | 3. minispil, udforskning af skolen (6–8 scener). Spilleren *kan* finde en dør der ikke hører til (B2 #8). | 1 |
| 28–30 | Gentagelse #1 | Tilbage i klasselokalet: ét objekt er væk. Musik-loop starter ikke igen i 20 s. | 2 |
| 30–40 | UI vakler | "Gem"-knap lyver; loading-bar går tilbage; minispil #4 har en opgave der *ikke* kan løses (Baldi). Hjælperen bliver ikke vred — bare stille 5 s. | 3 |
| 40–45 | Fake-fejl | "Indsæt CD 2" (kan annulleres efter 10 s). Palette-flash ved genstart. Tekst er på engelsk i én boble. | 4 |
| 45–50 | Spillet kender dig | Klokkeslæt/ugedag nævnes. Hvis spiller tidligere kiggede på den forbudte dør: "Du så det godt." Første fotografi (materiale-brud). | 5 |
| 50–55 | Falsk slutning #1 | "Tillykke!"-credits i Comic Sans. Credits indeholder et navn for meget. Skærm kan ikke lukkes → klik → nat. | 5 |
| 55–65 | Nat / liminal | Samme scener, nat-renders. Ingen musik, kun ventilation/CRT-hum. Hjælperen mangler fra sit hjørne; stemme kommer uden mund-sprite. Minispil #5 = en af de tidlige, men instruktionerne er forkerte. Cursor begynder at drive 1–2 px. | 6 |
| 65–68 | Stilhed | Længste pause: 25–40 s hvor intet sker undtagen hum og en tæller der tæller ned fra et tal der ikke giver mening. Spilleren kan klikke; intet. | 7 (spænding) |
| 68 | ÉN jump scare | ≤300 ms: hjælperens ansigt i et andet medie (foto/blyant) + clippet 22 kHz-lyd. Derefter fuldstændig stilhed 3 s. | 10 (peak) |
| 68–78 | Afsløring / medfølelse | Hjælperen taler ærligt (TTS-stemme eller 11 kHz). Hvad den er. Hvad den vil. Spilleren får et valg (hjælp/forlad). Meddelelse fra "IT-afdelingen" der lyver. | 6 |
| 78–84 | Valgets konsekvens | Minispil #6 omskrevet som ritual/afsked. Spillet-husker-greb: dit navn fra 1. session bruges. | 7 |
| 84–88 | Slutning | (a) sletning eller (b) stille morgen. `beforeunload`-prompt hvis man prøver at lukke før credits (én gang). | 5→2 |
| 88–90 | Ægte credits | Æra-korrekt rulletekst, GM-musik i korrekt toneart igen — men ét patch er stadig forkert. | 1 |

Regler for kurven: aldrig to "stød" i træk uden ≥5 min hvile; intensitet må falde *under* forrige plateau efter hvert stød (horror trækker vejret); 60–70 % af al "wrongness" skal kunne overses af en uopmærksom spiller.

### B4. Danske kultur-hooks (liminal 2000'er skolecomputer)

**Sikre (generiske institutioner, egne tekster, periodeagtig stil — ingen logoer/figurer):**
- *Edb-lokalet*: Compaq/Fujitsu-Siemens-beige kasser (skriv "FUJITSU SIEMENS" ikke; brug generisk "COMPUTER"), 15" CRT, rullegardiner, ventilationslyd, "Sluk skærmen efter brug"-laminat, elevlogin "elev01".
- *Morgensang* — brug *traditionelle/public domain* salmer og sange: "I østen stiger solen op" (Ingemann 1837, Weyse-melodi — PD), "Nu titte til hinanden" (Ingemann/Weyse — PD), "Jeg ved en lærkerede" (Harald Bergstedt tekst 1921 — **ophavsret til 2035**, melodi Carl Nielsen død 1931 — PD; undgå teksten), "Lille Peter Edderkop" (**[gæt]** tekst ukendt ophav → brug ikke ordret). En GM-MIDI af en Weyse-morgensang er det perfekte baseline-tema.
- *Ugebrev* fra klasselæreren (generisk — tekst du selv skriver: "Husk svømning tirsdag", "Lejrskole uge 36", "Edb-lokalet er lukket pga. opdatering"), *lektiebog*, *klassens time*, *skolemælk*, *frikvarterspatrulje*, *madpakke-rummet*, *lejrskole*, *pædagogisk dag (fri)*, *sidste skoledag*.
- *Kommunens IT-afdeling / UNI-C-agtig instans* — brug fiktivt navn ("Skole-IT, Teknisk Forvaltning"), aldrig UNI-C's logo. **SkoleKom** (UNI-C; lukket 31-12-2019 — bekræftet) kan *nævnes* som historisk fakta/sætning ("Tjek din SkoleKom"), men ikke efterlignes grafisk. Samme for UNI-Login/ElevIntra/ForældreIntra. Lav din egen "SkolePost".
- *Andelsboligforening* (opslagstavle, "Husorden", vaskeri-tavle med nål), *Falck-abonnement*, *boligblok i gule mursten*, *Netto-pose* (undgå logo), *rutebil*, *S-tog* (DSB-logo er varemærke; tog uden logo er ok), *fjernvarme*, *vejrudsigten på tekst-tv* (lav din egen — "Tekst-TV" generisk er ok; DR/TV2's sidelayout er ikke beskyttet som sådan, men undgå logo).
- *Tove Ditlevsen-ish melankoli*: tonen (Vesterbro, baggård, "barndommens gade") er fri; Ditlevsen døde 1976 → værker beskyttet til 2047. Citér ikke; skriv i ånden. Alternativ PD-stemme: **Johannes V. Jensen** (død 1950 → PD fra 2021), **Herman Bang** (PD), **H.C. Andersen** (PD — "Den lille pige med svovlstikkerne" som dansk børnetema er *meget* brugbart), Grundtvig/Ingemann-salmer.
- *Troldspejlet-agtig anmelderstemme* (ikke navnet — men "anmelder i fjernsynet gav 5 ud af 6" som in-world artefakt).
- Æra-sprog: "edb", "diskette", "internettet", "chatte på MSN" (nævn generisk "chat"), "Jubii" (søgemaskine; nævn? varemærke — brug "Søg"), "modem-lyd" (PD-lyd kan syntetiseres), "cd-rom-drev E:", "Windows-skrivebord med Bliss-tapet" (Bliss-billedet er Microsofts — lav din egen grønne bakke i Bryce-stil, som *er* æraen).

**Beskyttet IP — undgå at gengive (navn kan nævnes i omtale, ikke figurer/logo/lyd/figurdesign):**
- **Pixeline** (Krea Medie/K.E. Media) — figuren, lyden "Piiixeline", stilen med hendes rum er beskyttet. Du må lave *din egen* 3D-pige-maskot med andet navn og design.
- **Magnus & Myggen** (Ivanoff Interactive, 1996–2013) — figurer/stemmer beskyttet.
- **Hugo** (Interactive Television Entertainment / Hugo Games) — troldens design, "Hugo-telefonen" (TV2) beskyttet.
- **Bamse & Kylling / Bamses Billedbog** (DR), **Ramasjang** (DR, startet 2009 — *uden for* 2000–06-æraen alligevel; brug DR1's børnetid-vibe i stedet, "Fjernsyn for dig").
- **Nordisk Film-isbjørnen** (Egmont/Nordisk Film) — lav et eget forlagslogo med en anden polar-agtig figur i stil ("Isbjørnen" med andet dyr).
- **TV2 Zulu** (TV2; 2000) — logo/jingle. Æra-korrekt, men lav et fiktivt kanalnavn.
- **Gummi-Tarzan** (Ole Lund Kirkegaard, død 1979 → beskyttet til 2050; filmen Nordisk Film 1981) — temaet "dreng der ikke passer ind" er frit, navnet/Ivan Olsen ikke.
- **Kaj & Andrea** (DR), **Anders And** (Disney), **LEGO**, **Nissebanden/Pyrus** (TV2-julekalendere), **Bølle-Bob**, **Søren Ryge** (person), **Jakob Stegelmann** (person).
- Microsoft-UI (Win2000/XP-look) er funktionelt/stil-efterligning — generelt accepteret i parodi/fiktion, men brug ikke Windows-logo-flaget, Bliss-fotoet, Tahoma-indlejring (brug system-Tahoma eller fri klon), startlyden (komponér egen 4-sekunders "startup-chime" i GM).
- Comic Sans MS er Microsofts font — ikke indlejr .ttf; brug Comic Neue (OFL) eller system-fallback.

**Overblik over tonen der virker på dansk:** ikke amerikansk "Mandela County"-myndighed, men *kommunal* venlig-bureaukratisk ("Kære elev. Grundet opdatering vil Pixelskolen være lukket i perioden…"), *Weyse-morgensang gennem GS Wavetable*, *gule mursten, november kl. 15:40, mørkt*, *ventilationen i edb-lokalet*, *hjælperen der siger "flot" med voksen stemmeskuespiller-diktion*.

---

## Kilder (udvalg brugt i dag)
- Petscop: blogs.tuni.fi/playlab (Petscop feature); egmnow.com/theres-something-hiding-in-petscop; Wikipedia Petscop; Medium "Is Petscop real"
- DDLC: Press Start (Glasgow) metalepsis-paper; Princeton "Cute as Uncanny"-abstract
- Inscryption: gamerant.com Mullins-interview (RPS kunne ikke hentes)
- Baldi: gamedeveloper.com "How Baldi's Basics taps into the real horror of 90s edutainment"; itch.io dev-interview; Wikipedia
- Omori: rpgamer, hardcoregaming101, pcgamer reviews
- Analog horror: Wikipedia Local 58 (Straub-temaer); dreadcentral; Mandela Catalogue wiki/Wendigoon
- Frog Fractions: Wikipedia; Falmouth-essay (Summerley)
- Godot web: docs.godotengine.org exporting_for_web; Godot progress report maj 2024 (40 MB/5 MB brotli); popcar.bearblog minify
- Chrome autoplay: developer.chrome.com/blog/autoplay
- Pillow: pillow.readthedocs.io Image.quantize/convert
- FluidSynth: ryanfb gist, manpages; GeneralUser GS-licens via scancode-licensedb
- SkoleKom: da.wikipedia.org/wiki/SkoleKom
- Director palette: Director FAQ (bak.spc.org), director-online color-artikel
