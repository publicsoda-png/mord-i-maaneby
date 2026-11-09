# MORD I MÅNEBY — plan

## Kontekst
Frederik vil lave et super poleret, cursed browser-spil (1–1,5 time) der starter som et uskyldigt dansk matematik-børnespil fra 2005 (Director/CD-ROM-æstetik) og langsomt bliver creepy, bizart og feberdrøm-agtigt i Endacopia-ånd. Nostalgisk for folk der spillede *Matematik i Måneby*, men **originalt**: kun genrens grammatik (måneby der vokser via regneopgaver, hub-kort, ældre fortæller, minispilsarketyper, fyrværkeri-finale, setup med navn+klassetrin). Ingen kopi af Bitfrosts figurer, bygningsnavne, opgavetekster, musik, logo — og intet fra Endacopias figurer/historie.

Frederiks valg (09-11): titel **Mord i Måneby** · GitHub Pages (fuld) + claude.ai-artifact-demo · dansk retro-TTS-stemme · horror-toppen må nå **Endacopia-niveau** (grotesk/body horror tilladt i sidste tredjedel) · **spilleren er IKKE morderen** · **let meta** (tæller/nulstilling ok, ingen speedrun-referencer) · planlagt med Opus + Fable, smådetaljer afgøres af **councils** (kun Claude-linser, maks 10 agenter, `no_gpt`+`no_gemini`).

Research (færdig, ligger i agent-planfiler, kopieres til projektet i fase 0):
- Måneby-dossier: `~/.claude/plans/parsed-frolicking-yao-agent-a5f207987a0394333.md`
- Endacopia-analyse: `~/.claude/plans/parsed-frolicking-yao-agent-a3576ff9590dcb34e.md`
- Retro-look + eskaleringskurve (B3) + IP-liste (B4) + engine: `~/.claude/plans/parsed-frolicking-yao-agent-a7ec7423817328e2d.md`

---

## 1. Præmis — "mordet er en regnefejl"
**Overfladen (2005):** cd-rom'en *"Regn med Måneby"* fra det fiktive *Krater Multimedie ApS, Valby* (lukket 2006). Spilleren er bygmester, hjælper tolv små byggevæsner (**Fnuggerne**, uldgrå totter med hjelme — originalt design) med at bygge en by på Månen. Fortælleren er en gammel, venlig hjælper (design → council: *Morfar Måne* (halvmåne-mand i gyngestol, skægget bevæger sig i stedet for munden) eller *Hr. Regnar* (månekortograf, Poser-stiv, lidt for stor mund)).

**Den skjulte historie (rekonstrueres via spor):**
- Hjælperen kender kun **plus og gange**. "Vi trækker ikke fra i Måneby." Byen kan kun vokse. Minus-tasten findes ikke på spillets tastatur.
- Dette er **skolens eksemplar**: det skrev logfiler pr. elev (`elev01.txt … elev24.txt`). **elev07** ("B.") spillede hver dag i efteråret 2005 kl. 15:40 (SFO-tiden), byggede byen *skævt med vilje* ("Rådhuss"), klikkede hjælp 400 gange — det eneste sted nogen svarede. Sidste session 17-11-2005, afbrudt.
- 01-12-2005 nulstillede **Skole-IT, Teknisk Forvaltning** maskinerne. elev07.txt blev slettet. Fnug-tælleren gik fra 12 til 11 (hendes Fnug — "Syv" — var bundet til hendes save).
- Hjælperen kan ikke forstå subtraktion. Det eneste ord han har for "én mindre" er det, han har hørt i børne-tv: **mord**. Derfor spillets "rigtige" titel. Han har i 20 år ledt efter en morder — og mistænker på skift pedellen, IT-afdelingen, dig.
- **Sandheden** (sidste akt, aldrig sagt ligeud): ingen blev myrdet. En pige flyttede (ugebrevet: "Vi siger farvel til B. der flytter til Jylland"), en kommune slettede en fil, et program kunne ikke regne baglæns. Melankolien er, at byen blev ved med at vente. Spilleren er *vidnet*, ikke morderen.
- **Finalen:** spilleren lærer hjælperen **minus**. Opgaverne løses baglæns, byen skrumper til dens stand kl. 15:40 den 17-11-2005, og B.'s skæve by gendannes fra logfil-fragmenter.

Hvorfor det er klogt: titlen er en løgn spillet fortæller sig selv; alle "glitches" er hjælperens forsøg på at regne med et tal han ikke har; horroren er bogstaveliggjort matematik (se §3), og hjertet er dansk 2005-melankoli (edb-lokalet, 15:40, november, kommunal tone).

## 2. Struktur (90 min, følger research-kurve B3)
**Hub:** bykort. 9 byggepladser (originale navne) + fyrværkeriplads. Hver bygning 3 trin (vaklende/normal/flot), kan altid spilles igen. Setup: navn + klassetrin 1–6 → opgavegenerator skalerer.

| # | Plads | Minispil-arketype | Status |
|---|---|---|---|
| 1 | Landingspladsen | tæl/aflæs kasser | ren |
| 2 | Kraterbageriet | opskrift-klik (højreklik = 5 ad gangen) | ren |
| 3 | Isværket | rørføring med brøkventiler | ren |
| 4 | Stjernekikkerten | koordinater → stjernebillede | vakler (tegner et ansigt) |
| 5 | Kraterskolen | call-and-response-quiz m. tastatur | vakler (svaret er 7, 7-tasten mangler) |
| 6 | Kridtgruben | breakout: slå krystaller der "går op" | vakler → cursed om natten |
| 7 | Rådhuset | søjlediagram-slider (Fnug-statistik) | cursed ("?"-bygning, ufærdig-trope) |
| 8 | Fyrtårnet | vinkler: drej lyset | cursed (blinker morse) |
| 9 | Logrummet / "elev07" | grav dig ned, løs lag-opgaver baglæns (minus) | skjult finale |

| Min | Fase | Nøglebeats |
|---|---|---|
| 0–2 | Krom | Fake Win2000-skrivebord (`elev01` logget ind), cd-ikon "REGN MED MÅNEBY (E:)", cd-spin, Shockwave-loader m. ryk. "Klik for at indsætte cd'en" = audio-gestus. Setup (navnefeltet er forudfyldt med ét bogstav: "B"). |
| 2–15 | Ren baseline | Plads 1–3. Weyse-morgensang i GM. Klistermærker. Statuslinje: "Fnugger: 12" men 11 på skærmen (ingen bemærker). |
| 15–17 | Første off-note | "Godt klaret klaret"; én Fnug med 1 px magenta-fringe står med ryggen til. |
| 17–28 | Baseline fortsætter | Plads 4–5. Skolen: opslagstavle med ugebrev. Dør "Lærerværelse — adgang forbudt" (virker ikke endnu). Rådhuset har kun "?" (tooltip: "Ikke endnu."). |
| 28–30 | Gentagelse #1 | Samme hub-PNG, én bænk mangler. Musikloop starter 20 s for sent. |
| 30–40 | UI vakler | "Gemt!" lyver (reload = én bygning mindre). Loading-bar 71 % → 44 %. Skolen: svaret er 7, 7-tasten mangler; hjælperen tier 5 s: "…vi går videre." Uløselig opgave: "Hvor mange Fnugger bor i Måneby?" Volumen-slider virker ikke på stemmen. |
| 40–45 | Fake-fejl | **"Indsæt CD 2"** (ulukkelig 10 s). [Gentag] → palette-flash, og i de 2 frames er hubben tom. Director-fejl: `Script error: Handler not defined #traekFra`. Én boble på engelsk (ufærdig engelsk udgave — æra-ægte). |
| 45–50 | Spillet kender dig | "Det er torsdag. Klokken er 15:40. Det var den også dengang." (ægte ugedag, altid 15:40). **Materiale-brud #1:** ægte-lignende 640×480-digitalfoto af tomt edb-lokale, gult stempel 17 11 2005. Hvis du prøvede Lærerværelset: en Fnug kigger i kameraet. |
| 50–55 | **Falsk slutning** | Fyrværkeri, "Tillykke, [navn]!", Comic-Neue-credits med 13 navne ("Bygmester: B."). Kan ikke lukkes → klik → **nat**. |
| 55–65 | **Nat / liminal** | Alle scener som nat-renders. Ingen musik; CRT-hum + ventilation. Hjælperens hjørne tomt, skægget/munden animerer uden lyd. Kridtgruben vendt: slå de *forkerte* krystaller. Feberdrøm I–II (§3). Cursor driver 1–2 px mod Rådhuset. |
| 65–68 | Stilhed | 30 s: tæller "Fnugger: 12 → 11" står og dirrer. Klik gør intet. |
| **68** | **Jump scare (den eneste)** | ≤300 ms: hjælperens ansigt som **blyantstegning på ternet papir** (B.'s tegning af ham) + clippet 22 kHz-lyd. 3 s total stilhed. |
| 68–78 | Afsløring | Hjælperen i 11 kHz-telefonfilter: "Der mangler én. Nogen har … jeg kender ikke ordet." Popup fra Skole-IT: "Grundet opdatering slettes elevdata 1/12. Kære elev: luk programmet." [Luk] virker ikke. Fyrtårnet blinker **S-Y-V**. Logrummet åbner. |
| 78–84 | Valget | "Byg videre" (fyrværkeri igen; byen vokser; loop, hver runde mørkere, Fnugger ganges op → se §3) eller **"Lær ham minus"** (Logrummet: minus-tasten tegner sig selv på tastaturet). |
| 84–88 | Slutning | **Stille morgen** (anbefalet, → council): dagsrenders, B.'s skæve by m. "Rådhuss", 12 Fnugger, hjælperen siger ét ord: "Udmærket." og derefter aldrig mere; hjælp-knappen giver kun "tik". Én `beforeunload`-prompt hvis man lukker før credits. |
| 88–90 | Ægte credits | Rigtig toneart, men fløjte-patch 73 er blevet FX Crystal 99. "Testet af 4.b" · "Fan-inspireret, ikke tilknyttet Bitfrost Interactive eller maaneby.dk." |

**2. gennemspilning** (spillet husker via localStorage + IndexedDB-spejl; `meta` kun i IDB så "Start forfra" ikke rammer den): starter kl. 15:40 i nat; hilser med dit *første* navn; Rådhuset klikbart fra minut 0; Fake-Stifinder "Logs" viser elev07.txt (slet den → "Du prøvede at slette hende."); ny skjult slutning: gennemfør uden nogensinde at svare på "hvor mange Fnugger" → hjælperen beholder alle 12 og B.'s navn står på Ctrl+P-printet.

## 3. Feberdrøm-sekvenser (bogstaveliggjort matematik — her må det blive Endacopia-grotesk)
- **I. Regnerummet bag Rådhuset** (nat): scene uden baggrundsrender — kun Bryce-gradienthimmel og ternet testgulv. Alle Fnugger står i rækker og regner på tavler på "Hvor mange bor her?". Spilleren giver tal; hvert *rigtigt* tal får én til at forsvinde (hjælperen klapper); forkerte tal: de kigger. Lektionen: rigtige svar trækker fra.
- **II. Bageriet skifter genre**: opskrift-minispillet bliver efter 3 ingredienser til en håndskrevet madpakkeseddel → kameraet zoomer ud → tekst-adventure (grøn bitmap-skrift): "> du er i edb-lokalet. rullegardinerne er nede." Kommandoer SE / GÅ / SLUK SKÆRM (ægte sort canvas 3 s + CRT-afladning) → tilbage til hub med ét vindue tændt.
- **III. Division** (loop-grenen): "Del Fnuggerne i to hold" — de deles bogstaveligt (hjelme i halve, uldtotter trevlet, stadig smilende). Multiplikation: 12 → 144 Fnugger fylder hubben og stirrer; "Hold da op, hvor er her blevet fuldt."
- **IV. Nattevagten** (kun ægte lokal tid 22–05): pedel-figur (Poser-4-stiv, døde øjne) med lommelygte på hubben; taler kun efter 30 s uden input: "Jeg lukker kl. 16. Hvorfor er du her?" Giver det ene spor der ikke findes om dagen: logfilens sidste linje.

## 4. Wrongness-katalog og easter eggs
Fables 30 øjeblikke + Opus' 15 eggs samles i `src/wrongness.js` som tidsstyret tabel (`minute, phase, deniable, requires`). Alt der nævner speedruns/gravlund/any% **udgår** (let meta). Beholdes bl.a.: 7× klik på "6. klasse" → "7. klasse" (kun opgaver med svaret 7); navnet "Syv"/"elev07" i setup; tekst-tv side 777 (eget layout); ugebrev på tavlen (nat: "Husk Syv"); Ctrl+P printer Byggebevis (akt 3: Rådhusets tegning med kryds); kl. 22+: "Burde du ikke sove?"; 23. juni sankthans + Midsommervisen (PD); december nissehuer + svovlstikkepige-ekko; `CD2` tastet på hubben → bonusrum; idle 2 min "Er du der stadig?"; 20 hurtige klik "Hold op."; `document.title`/favicon-drift (kun Pages); `navigator.language≠da` → "Du er ikke herfra."; vindue <640 px → "Det hjælper ikke."; Esc×3 → [Ja][Nej][Hende] (tredje knap kun om natten). IP-filter: kun research B4's sikre liste; aldrig Pixeline/Hugo/M&M/DR-figurer/Bliss/Windows-logo.

## 5. Stemme & lyd
- **Hjælper = dansk OS-TTS** (`say -v` dansk stemme på Mac, renderet offline) → ffmpeg-kæde `highpass 120, lowpass 7000, acompressor, 22050 Hz, pcm_u8` → OGG q1 mono (+ M4A-fallback til Safari). Baseline-varme skabes med langsomt tempo, for mange pauser og "voksen teatralsk diktion"-prosodi i teksten. Horror-trin: samme stemme i 11 kHz telefonfilter; sent i spillet slipper **live `speechSynthesis`** igennem (browserens egen stemme = bruddet). Mund-/skæg-sync via offline RMS → `voice/*.json`. Resten: tekst + "mumle"-stavelser (12 ms/tegn, tik-lyd).
- **Musik:** egne GM-MIDI-kompositioner (Python `midiutil`), renderet med `fluidsynth` + GeneralUser GS (fri licens) → 22 kHz mono OGG. `variant(song, transpose=-2, tempo=.92, swap={73:99})` laver nat/cursed-versioner. Titeltema: Weyse/Ingemann "I østen stiger solen op" (PD) **eller** eget tema → council. 8 kilder, ~16 OGG, ~2 MB.
- **SFX:** sophie-games `sfx.js`-synth udvidet med cd-spin (brun støj → bandpass-sweep 300→1800 Hz), seek-klik, palette-"bzzt", CRT-hum, ventilation. 22 kHz, let clipping.
- Skal installeres: `brew install fluid-synth` + hent GeneralUser GS (~30 MB). ffmpeg/magick findes. Pillow kun i `/usr/bin/python3` eller venv `~/Documents/tools/pyimg/`.

## 6. Teknisk arkitektur
Nyt repo `~/Documents/mord-i-maaneby/` (git; GitHub-repo oprettes med `gh` før første publicering — Frederik spørges før push). **Vanilla ESM canvas + DOM, ingen bundler i dev** (`python3 -m http.server`); `tools/build.mjs` → `dist/` (hash, artifact-variant = akt 1).

```
index.html style.css
src/main.js            boot, 640×480 offscreen → heltals-nearest, letterbox sort, imageSmoothing off
src/core/stage.js      lag (bg/sprites/fx), palette-LUT-flash, 1-bit-tekst (alfa-threshold)
src/core/scene.js      scener som data {bg, bgNight, hotspots[poly], onEnter}
src/core/script.js     kommando-VM: say wait set if goto mini glitch music photo os
src/core/dialog.js     tekstboks, skrivemaskine+tik, ▼, skæg-sync
src/core/state.js      save (localStorage⇄IDB) + meta (kun IDB), alt i try/catch, kører uden storage
src/core/cursor.js     cursor:none + egen 32×32 sprite (drift/forsinkelse/træk)
src/core/os.js         fake Win2000: skrivebord, vinduer (#d4d0c8, titel #0a246a→#a6caf0), dialoger, Director-fejlboks, Stifinder
src/core/audio.js      Web Audio: busser music/voice/sfx/amb, bitcrusher (WaveShaper), Convolver, resume() ved første klik, Page Visibility-regel
src/wrongness.js       tidsstyret event-tabel (minute/phase/deniable/requires)
src/opg.js             opgavegenerator opg(type, klassetrin, seed)
src/ware/engine.js     porteret fra ~/Documents/sophie-game/src/ware/engine.js (api.add/spr/on/every/after/done, playOne() som Promise)
src/ware/games/*.js    9 minispil + fyrværkeri-rytme
SCRIPT.md → tools/script-md.mjs → src/script.js   (Frederik retter replikker i markdown; flags @nat @husker:… @klassetrin>=3)
assets/bg (PNG8) sprites music voice sfx photos
tools/art/retro.py tools/music/*.py tools/voice/{tts.sh,rms.py} tools/test/{flow,acts,meta,shots}.mjs
```
Nøglegreb: palette-LUT-flash (PNG8-palette → indeks ved load; 1–3 frames med gammel LUT; maks 6 gange i spillet) · én ægte `alert()` og én `beforeunload` · fullscreen kun i klik-handler · Page Visibility: i akt 3 fortsætter stemmen 10 s i baggrundsfanen og muter så.

**Asset-budget:** Pages ~25–30 MB (33 baggrunde à ~150 KB Bayer-PNG8, 9×3 bygningstrin + nat, hjælper ~12 frames, 12 Fnugger × 3 poser, ~60 minispil-sprites ≈ 8 MB; musik 2 MB; TTS-stemme 12 min ≈ 3–4 MB). Artifact = akt 1 (≤16 MB) med "fortsæt på …"-link.

## 7. Asset-pipeline (Higgsfield **Nano Banana Pro på Unlimited** via webapp/playwriter — egen fane, tjek switch før hvert submit; aldrig credits uden at spørge)
- Baggrund: `1999 pre-rendered 3D CGI, Bryce 3D render, children's educational CD-ROM screenshot, [SCENE], Phong shading, plastic specular highlights, hard raytraced shadows, no global illumination, saturated primary colors, gradient sky, 4:3, no text, no characters` · negativ: `photorealistic, global illumination, depth of field, cinematic, 4k, Unreal Engine, Pixar quality`.
- Nat-par: image-edit på dagbilledet, samme session: `same scene, same camera, night, all lights off except one window, cold blue ambient, unchanged geometry`.
- Figurer: `Poser 4 / 3D Studio MAX R3 mascot, [beskrivelse], isolated on flat #00FF00, stiff pose, big eyes, plastic shading, sprite sheet 4 frames` → chroma-key, behold 1 px fringe.
- Bygningstrin: "unfinished scaffolding, leaning" / "plain" / "decorated with flags and lights".
- Foto (materiale-brud): `2005 compact digital camera photo, 640x480, flash, empty Danish school computer room, beige CRT monitors, yellow date stamp 17 11 2005` (genereret, ikke ægte personer).
- Prompts nævner **aldrig** Måneby/Bitfrost/Endacopia og bruger ingen referencebilleder derfra.
- `tools/art/retro.py` (`/usr/bin/python3 -I`): resize 640×480 LANCZOS → farvedrift (sat 1.12, grøn ×1.03) → JPEG q65-rundtur → ordered Bayer (baggrunde) / Floyd–Steinberg 256 (figurer) → PNG8 + `.pal.json` → kontaktark.
- Jump scare-billedet (blyant på ternet papir) og nat-pakken godkendes separat.

## 8. Faser og godkendelser (billedreview = artifact med Ja/Måske/Nej pr. billede, fast regel)
| Fase | Indhold | Frederik godkender |
|---|---|---|
| 0. Bibel (½ dag) | Kopiér research til `docs/research/`, kør de udskudte video-trin (yt-dlp frames/subs/kommentarer fra agent-planfilerne) kun som reference; skjult tidslinje (2005-datoer), spor-kort over alle "Syv"-ledetråde, SCRIPT.md v0 | historie + slutning (council C1) |
| 1. Lodret skive (2–3 d) | Kerne-moduler, krom → setup → hub → plads 1 med placeholder-art, `flow.mjs` grøn | spil-feel (skalering, tekst-tik, knapper) |
| 2. Stil-lås (1–2 d) | Higgsfield-test: 3 baggrunde × 3 retro-varianter, 4 hjælper-designs, 3 Fnug-designs, titelskærm-varianter | review-artifact + councils C2–C4 |
| 3. Lyd-lås (1 d) | fluidsynth-setup, titeltema ×3 + nat-variant, TTS-stemmetest (3 stemmer × filterkæde) | lyt-artifact + council C5 |
| 4. Akt 1 (3–4 d) | Plads 1–5, 5 minispil, opgavegenerator m. tests pr. klassetrin, baggrunde i batches à 6 | spilbar build |
| 5. Akt 2–3 (4–5 d) | wrongness-tabel, falsk slutning, nat-sæt, feberdrømme I–IV, jump scare, Logrummet, slutninger, husker-greb | nat-par-review; jump scare separat; council C6 |
| 6. Polering/QA (2 d) | easter eggs, `acts/meta`-tests, Safari-lyd, 2 uforberedte testspillere måler "hvornår opdagede du noget" | playtest-feedback |
| 7. Deploy | GitHub Pages (ét link) + akt-1-artifact | endeligt Ja |

## 9. Councils (council-skill, `mode:"plan"` eller `design`, 3 Claude-linser: *Nostalgi-ægthed*, *Horror-dramaturgi*, *IP-afstand*; `no_gpt`+`no_gemini`; precheck først; maks 10 agenter pr. kørsel)
- **C1** Slutning: stille morgen vs. sletning vs. valg — og hvor eksplicit "mord"-misforståelsen må siges.
- **C2** Hjælperens navn + design (Morfar Måne / Hr. Regnar / 2 nye) — design-mode på renders.
- **C3** Fnug-design (afstand til Grønling-lighed måles af IP-linsen).
- **C4** Titelskærm: afsløres "MORD I MÅNEBY" fra start, ved den falske slutning, eller først i nat? + fiktivt studie-/produktnavn.
- **C5** Musiktema: Weyse-salme vs. egen komposition; TTS-stemme-valg.
- **C6** Jump scare-medie (blyant/foto/ler) og om division-sekvensen er for grotesk.
Besluttes uden council: 640×480, vanilla JS, Win2000 (ikke XP), PNG8/Bayer, GeneralUser GS, localStorage+IDB, minispil-arketyper, hotkeys, testsetup, alle wrongness-tider ±3 min.

## 10. Risici
- **Titel/IP:** "Måneby" er Bitfrosts navn; spillet læses som hyldest/parodi. Afbødning: eget logo/typografi, fiktivt produktnavn på cd'en, disclaimer i credits, ingen Bitfrost-assets eller -prompts, IP-linse i hvert council. Lav men ikke nul risiko [gæt]; genovervej titlen hvis spillet bliver stort.
- **Omfang:** akt 1 (~30 min) leveres som selvstændig milepæl; akt 2–3 genbruger scener via dag/nat-par.
- **Tokens/tid:** assets i batches med kontaktark; data-drevne scener; minispil som parallelle agenter i worktrees (maks 10).
- **Lyd:** autoplay løst med "indsæt cd"-klik; Safari OGG/Opus usikkert → lever OGG + M4A; dansk `speechSynthesis` findes ikke overalt → fallback 11 kHz-filter.
- **16 MB artifact:** kun akt 1, stemme-let.
- **Storage i iframe/privat vindue:** husker-greb falder stille tilbage; testes.
- **Dosering:** for tidlige glitches ødelægger tilliden → B3-reglerne (aldrig to stød uden ≥5 min hvile; 60–70 % af wrongness skal kunne overses) håndhæves i `wrongness.js` og måles i playtest.

## Verifikation
- `tools/test/flow.mjs` (puppeteer-core + system-Chrome, portet fra sophie-game): spiller hele vejen med `?dev&akt=N&nat=1&seed=7`; konsolfejl = fail.
- `acts.mjs`: screenshot af hver scene dag/nat → kontaktark til review-artifact.
- `meta.mjs`: start → navngiv → reload → nyt navn → tjek "Du hed … sidst"; slet localStorage → meta i IDB overlever; privat vindue → ingen crash.
- `opg`-tests: 1.000 genererede opgaver pr. klassetrin har entydige heltalssvar; skolens "7"-opgave er umulig uden 7-tast.
- Timing: dev-overlay viser minuttal vs. B3-kurven; to uforberedte testspillere noterer første "noget er galt"-øjeblik (mål: 15–30 min).
- Lyd: alle OGG/M4A afspilles i Chrome + Safari; TTS-filterkæde A/B-lyttes i artifact.
- Deploy: Pages-link åbnes i frisk profil; artifact ≤16 MB; `files`-publish af `dist/`.
