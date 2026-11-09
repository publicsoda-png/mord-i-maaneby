# Lyduniverset — Mord i Måneby
*Plan 09-11-2026. Supplerer PLAN.md §5 (stemme & lyd) og følger kurven i §2 / research B3. Intet her er lavet endnu — alt er forslag til fase 3 "Lyd-lås".*

## 0. Idéen i én sætning
Lyden er ét venligt 2005-cd-rom-lydbillede (GM Wavetable, 22 kHz-samples, teatralsk fortæller), som **aldrig får nye lyde** — det får kun *de samme lyde forkert*: for sent, for få, i anden toneart, uden mund, uden rum. Mordet sidder i musikken: **Fnug-temaet har 12 toner, og fra minut 28 har det 11.**

## 1. Fem principper
1. **Samme, men ikke.** Horror-versioner er altid varianter af baseline-filer (`variant()`), aldrig nye kompositioner. Spilleren skal *genkende* det, der er galt.
2. **Stilhed er den dyreste lyd.** Musik der udebliver, mund uden stemme, cd-spin uden resultat. Stilhed bruges 5 gange i alt og aldrig to gange inden for 5 min.
3. **Æra-ægte, ikke chiptune.** 22 kHz 8/16-bit samples, let for høj volumen, let clipping, GM-patches. Ingen moderne horror-lyd (ingen risers, ingen skrig, ingen sub-drops) — kun ét clippet 22 kHz-knæk ved jump scaren.
4. **Autoriteten lyver med rolig stemme.** Skole-IT-popups og hjælperen bliver aldrig højere, kun tættere (telefonfilter) eller fjernere (rum uden musik).
5. **Ét jump scare.** Alt andet er dread. Efter min 68 må lyden kun blive *stillere*.

## 2. Signalkæde (udvidelse af `src/core/audio.js`)

> **Rettet efter QC 10-11:** niveauerne i tabellen er *indholdsniveauer* for filerne (render.sh/tts.sh normaliserer musik til −18 LUFS og stemme til −16 LUFS). `mix.js` lægger dem IKKE oveni igen: bus-gains er relative dB (0 = som masteret, amb −10…−20 rel.). Ambience-loops er wrap-paddet 1 s i hver ende og looper mellem `loopStart=1` og `duration−1`, så codec-kanterne aldrig høres.
Eksisterende busser: `music / voice / sfx / amb → master`. Tilføjes:

| Node | Hvor | Bruges til |
|---|---|---|
| **Bitcrusher** (WaveShaper, 8-bit trin + sample-hold) | på `voice` (fast) og `sfx` (fast, mild) | 22 kHz/8-bit-fornemmelse — hele spillet |
| **Telefonfilter** (BP 300–3400 Hz + crush 11 kHz) | `voice`, slås til fra min 68 | hjælperen "ringer" fra et andet sted |
| **Convolver "edb-lokale"** (syntetisk IR 0,6 s, lille hårdt rum) | `voice` + `sfx`, kun i nat-scener og Feberdrøm II | stemmen får pludselig et *rum* = den er ikke længere "i programmet" |
| **Convolver "tomt"** (IR 2,5 s, ingen early reflections) | Feberdrøm I (Regnerummet) | ternet testgulv uden vægge |
| **Master-clipper** (soft-clip tanh) | master | æra-ægte "lidt for højt"; kun jump scaren rammer hård clip |
| **Ducking** | `music` −6 dB når `voice` spiller | standard cd-rom-mix; i akt 3 holder ducking op med at virke (musik overdøver stemmen = wrongness) |
| **Page Visibility** | master | akt 1–2: mute i baggrund; akt 3: stemmen fortsætter 10 s, så mute |

Niveauer (baseline): musik −14 dBFS loop-RMS, stemme −12, UI-sfx −10 (bevidst 2 dB for højt), ambience −30. Volumen-slideren i Indstillinger styrer `music`+`sfx` — fra min 38 **ikke** `voice` (`volume_dead`, findes allerede i wrongness.js).

## 3. Soundtrack
**Lyd:** GM-MIDI (Python `midiutil`) → `fluidsynth` + GeneralUser GS → 22 050 Hz mono → OGG q1 (+ M4A). Alle loops 8 eller 16 takter, tempo 96–118, dur-tonearter, loopbare uden klip (sidste node holder ind i første).

**Palette (hele spillet):** Acoustic Grand (1), Music Box (11), Vibraphone (12), Nylon Guitar (25), Flute (74), Pizzicato (46), Warm Pad (90) sparsomt, Standard Kit på kanal 10 (kun rim/hi-hat/shaker). Forbudt i baseline: alle strygerpatches, Choir, FX-patches — de er reserveret til de forkerte versioner.

**Leitmotiver**
- **Fnug-tema:** 12 toner, pentaton, music box. Spilles som intro-figur i alle byggeplads-numre. Fra min 28 har den **11 toner** (den sjette udelades, pausen beholdes). Ingen siger det; ved min 68 spiller telefonfilter-hjælperen den med fløjte, og bagefter mangler to.
- **Hjælper-tema:** fire langsomme toner, nylon guitar, altid før han taler første gang i en scene. I nat-sæt: kun den første tone.
- **Minus-motiv:** faldende lille sekund (det eneste faldende interval i hele soundtracket). Høres første gang i Logrummet, når minus-tasten tegner sig; i "stille morgen" er det blevet en del af Fnug-temaet, som så igen har 12 toner.

**Kildeliste (8 kompositioner → ~17 filer, ~2,2 MB)**

| # | Fil | Hvor | Karakter | Varianter |
|---|---|---|---|---|
| 1 | `titel` | titelskærm, setup | Council C5: **A** Weyse "I østen stiger solen op" (PD, salmebogsarrangement i GM) eller **B** eget tema i samme morgen-salmetone. Anbefaling: **B**, fordi 12→11-tricket kræver eget materiale | `titel_nat` (−2 halvtoner, 92 %, fløjte→Synth Strings 51) |
| 2 | `byen` | hub dag | 16 takter, piano+vibrafon+shaker, 108 BPM, Fnug-tema som intro | `byen_11` (11-tone-intro, fra min 28) · `byen_nat` bruges IKKE — natten har ingen musik |
| 3 | `plads_a` | Landingspladsen, Kraterbageriet | let, hoppende, pizzicato+music box, 112 BPM | `plads_a_sen` (loop-start forsinket 20 s er runtime, ikke fil) |
| 4 | `plads_b` | Isværket, Stjernekikkerten | køligere, vibrafon+pad, 100 BPM | `plads_b_vakl` (ét instrument −3 cent-drift via `detune`, runtime) |
| 5 | `plads_c` | Kraterskolen, Kridtgruben | skolegårdsagtig, piano+fløjte, 118 BPM | `plads_c_cursed` (−2, 92 %, fløjte→FX Crystal 99; Kridtgruben om natten) |
| 6 | `raadhus` | Rådhuset (akt 3) | samme akkorder som `byen`, men kun pad og én hi-hat; aldrig hørt i dagslys | — |
| 7 | `fyrvaerkeri` | falsk slutning + loop-grenen | fanfare, 8 takter, alle patches | `fyrvaerkeri_loop2/3` (hver runde −1 halvtone og 95 %, Byg videre-grenen) |
| 8 | `credits` | ægte credits | `titel` i rigtig toneart og tempo, men patch 74 → 99 FX Crystal | — |

**Regler for musik i tid** (matcher PLAN §2): min 0–28 altid musik · 28–30 `byen` starter 20 s for sent · 30–50 musikken fortsætter, men loop-punktet "hakker" én gang pr. scene (runtime: `node.loopEnd −= 0.25` efter 2. gennemløb) · 50–55 fanfare · **55–84 ingen musik** (kun ambience, §5) · 84–88 `byen` i rigtig toneart, men −8 dB og uden Fnug-intro · 88–90 `credits`.

## 4. Lydeffekter
Kildeformat for samples: syntetiseret i Python/ffmpeg eller Web Audio runtime (som nu), derefter **nedsamplet til 22 050 Hz 8-bit og tilbage** så artefakterne sidder i filen. Alle UI-lyde ≤ 120 ms.

**A. OS-krom (fake Win2000)** — egne lyde, aldrig Microsofts: `startup` (egen 4 s GM-chime, Warm Pad + Music Box) · `cd_spin` (findes, synth) · `cd_eject` · `ding_info` / `ding_fejl` (to-tone sinus, egen) · `klik_knap` (findes) · `print` (nålemattrix 3 s, til Ctrl+P) · `alert_stilhed` = ingen lyd (ægte `alert()` dræber Web Audio-tråden; det ER effekten).

**B. Program-UI (Director-følelse)** — `tick` (tekst-fremskrivning, findes) · `boble_aaben` (pop) · `ok` / `good` / `bad` (findes; `bad` må aldrig lyde "farlig" — dur-terts nedad, som et børneprogram) · `sticker` (findes) · `bygning_op` (3 trin: planke-slag, klokke, fanfare-stump 1 takt) · `hub_klik` (hul plastik-klik, som Director-knapper).

**C. Minispil (pr. plads, 2–4 lyde hver)** — Landingspladsen: kasse-dump, tælle-bip · Bageriet: dej-klask, ovn-ding, højreklik = 5× klask i hurtig følge · Isværket: rør-klik, vand-gurgle, ventil-hvæs · Stjernekikkerten: kikkert-drej (servo), stjerne-pling · Kraterskolen: tastatur-klik (ægte mekanisk 22 kHz), kridt, skoleklokke · Kridtgruben: bold-boing, krystal-knæk, blok-dunk · Rådhuset: slider-rasle (kun denne lyd, intet andet) · Fyrtårnet: lys-drej (tung metal), morse-bip 800 Hz (S-Y-V) · Logrummet: skovl i jord, ét "lag" = papir der rives.

**D. Wrongness-lyde (alle er baseline-lyde forkert)**
| Min | Hændelse | Lyd |
|---|---|---|
| 15 | "Godt klaret klaret" | `good` afspilles to gange, 90 ms forskudt |
| 28 | bænk væk | ingen ny lyd; `byen` 20 s for sent |
| 32 | "Gemt!" lyver | `ok` spilles, men 1 halvtone for lavt (`detune −100`) |
| 35 | 7-tasten mangler | tastatur-klik uden tast; hjælperens 5 s pause: `tick` fortsætter uden tekst |
| 38 | volumen død | slider ændrer intet på `voice` |
| 42 | "Indsæt CD 2" | `cd_spin` 1,6 s → 0,5 s stilhed → `ding_fejl`; [Gentag] → palette-flash med **ét 8-bit knæk** (1 sample fuldt udslag) |
| 45 | "Klokken er 15:40" | ingen musik-duck; stemmen og musikken kæmper |
| 50 | falsk slutning | fanfare, fyrværkeri-knald (filtret, som gennem en væg) |
| 55 | nat | `crtOff` → 3 s sort → `crtHum` + ventilation fader ind over 8 s |
| 60 | mund uden stemme | mund-data fra ægte replik afspilles, `voice`-bus −∞ |
| 65 | tælleren dirrer 30 s | kun hum; hvert klik = ingenting (ikke engang `click`) |
| **68** | jump scare | ≤300 ms: hvid støj + 1 kHz firkant, hård clip, 22 kHz-alias; derefter **alt** muted inkl. hum — mindst 3 s, og lyden kommer først tilbage ved spillerens næste klik/tast (council 10-11: ingen automatisk fade-in) |
| 68+ | telefon-hjælper | `voice` → telefonfilter; `tick` bliver til telefon-knitren |
| 72 | Skole-IT-popup | `ding_info` korrekt — den *eneste* lyd i akt 3 der lyder helt normal |
| 75 | fyrtårn S-Y-V | morse 800 Hz, 3 gentagelser, så stilhed |
| 78 | Byg videre-loop | fanfare hver runde −1 halvtone; 144 Fnugger: `tick`-lyde fra alle sider (stereo-spredning, første gang stereo bruges) |
| 80 | Lær ham minus | minus-motiv, nylon guitar, første faldende interval |
| 84 | stille morgen | ventilation slukker (ægte stilhed 4 s), så `byen` −8 dB. "Udmærket." = sidste stemmefil. Hjælp-knappen: kun `tick` |

## 5. Ambience pr. fase
| Fase | Lag | Niveau |
|---|---|---|
| Dag (0–50) | næsten ingen: let "rumkoloni-brum" (filtreret brun støj 60–200 Hz) så stilhed senere føles som tab | −34 dBFS |
| Nat (55–84) | `crtHum` (findes: 50 Hz sav + 7,8 kHz hvin) + **ventilation** (brun støj BP 200–600 Hz, langsom LFO 0,07 Hz) + hvert 40–70 s ét **radiator-tik** | −26 dBFS, aldrig lavere end stemmen −14 |
| Feberdrøm I (Regnerummet) | ingen hum; kridt på tavle i løs rytme fra alle Fnugger; lang IR | −28 |
| Feberdrøm II (edb-lokalet) | ventilation tæt på, 15" CRT-hvin kraftigere, rullegardin-flap; SLUK SKÆRM = `crtOff` + 3 s ægte stilhed + CRT-afladnings-knitren | −24 |
| Feberdrøm III (division) | hub-ambience, men dubleret og 7 cent forskudt (to lag der svæver) | −26 |
| Nattevagten (kl. 22–05) | lommelygte-klik, nøgleknippe én gang, gulvknirk; pedellen taler i edb-lokale-IR | −28 |
| Logrummet | dyb hum 40 Hz, jord, ingen CRT (vi er ikke i programmet længere) | −24 |
| Stille morgen | **intet.** Ventilationen slukker hørbart. Ingen fugle (det er Månen). Kun musik −8 dB | — |
| Ægte credits | ingen ambience | — |

## 6. Stemme (jf. PLAN §5 — uændret, præciseret)
- `say -v Sara` → `tools/voice/tts.sh`: `highpass 120, lowpass 7000, acompressor, aresample 22050, pcm_u8` → OGG q1 mono + M4A. RMS pr. 80 ms → `voice/<id>.json`.
- **Fire stemmetrin:** 0 baseline (ovenstående) · 1 "vakler" (min 30+: tilfældige 40–120 ms stilhedshuller klippet ind i 1 af 6 replikker) · 2 telefon (min 68+: runtime-filter) · 3 brud (min 78+: live `speechSynthesis`, browserens egen danske stemme, ufiltreret — hvis ingen dansk stemme: trin 2 med 11 kHz).
- Prosodi skrives ind i teksten (kommaer, "…", korte sætninger). Hjælperen bruger aldrig udråbstegn efter min 50.
- Mumle (replikker uden lyd): `tick` 12 ms/tegn — i nat: 12 ms/tegn uden tekst (det er wrongness #35 og #60).
- Budget: ~12 min nøglereplikker ≈ 3–4 MB. Artifact-demo (akt 1): maks 4 min stemme.

## 7. Minut-for-minut lydpartitur (sammenfatning)
```
 0– 2  startup-chime · cd_spin · loader-tick · "Klik for at indsætte cd'en" = AudioContext.resume()
 2–15  titel → byen (12-tone-intro) → plads_a/b · fuld UI-sfx · stemme trin 0 · ambience −34
15–17  good ×2 forskudt
17–28  byen · plads_b · plads_c · alt normalt (hvile)
28–30  byen starter 20 s for sent · 11-tone-intro fra nu
30–40  loop-hak · ok −1 halvtone · tick uden tekst · stemme trin 1 · volume_dead
40–45  cd_spin → stilhed → ding_fejl · palette-knæk
45–50  ingen ducking (musik og stemme kæmper)
50–55  fyrvaerkeri · knald gennem væg
55–65  crtOff → NAT: ingen musik · hum + ventilation · mund uden stemme · plads_c_cursed i Kridtgruben
65–68  30 s kun hum · klik = intet
68     JUMP: 300 ms clip · 3 s total mute
68–78  telefon-stemme · ding_info (normal!) · morse S-Y-V · raadhus-pad
78–84  Byg videre: fanfare −1/runde, stereo-ticks  |  Lær ham minus: minus-motiv
84–88  ventilation slukker · byen −8 dB uden intro · "Udmærket." · hjælp = tick
88–90  credits (titel, rigtig toneart, patch 74→99)
```

## 8. Pipeline og filer
```
tools/music/compose.py      midiutil: 8 sange som funktioner, fælles motiv-bibliotek (fnug12, fnug11, hjaelper, minus)
tools/music/variant.py      variant(song, transpose, tempo, swap={74:99}, drop_note=6)
tools/music/render.sh       fluidsynth -ni sf2/GeneralUser-GS.sf2 X.mid -F X.wav -r 22050 → ffmpeg → ogg q1 mono + m4a
tools/sfx/make.py           syntetiske samples (numpy) → 22050/8-bit-rundtur → assets/sfx/*.ogg(+m4a)
tools/sfx/ir.py             to syntetiske impulsresponser (edb-lokale 0,6 s · tomt 2,5 s) → assets/sfx/ir_*.wav
tools/voice/tts.sh, rms.py  (jf. PLAN §5)
src/core/audio.js           + crusher(), phone(on), room(name), duck(on), clipper, stereoTicks(), loopHak()
src/core/mix.js             fase → busniveauer/ambience-lag (data-drevet, læser save.minute + save.night)
assets/music/  ~17 ogg      assets/sfx/ ~55 ogg      assets/voice/ ~90 ogg+json
```
Samlet lydbudget Pages: musik 2,2 MB + sfx 0,8 MB + stemme 3,5 MB ≈ **6,5 MB**. Artifact (akt 1): ≈ 2 MB.

## 9. Fase 3 "Lyd-lås" — rækkefølge og godkendelser
1. **Dag 1 fm:** `compose.py` med `titel A`, `titel B`, `byen` (12- og 11-tone-intro), `plads_a` + nat-variant · render · **lyt-artifact** med A/B-knapper (titel A vs. B, 12 vs. 11, dag vs. nat).
2. **Dag 1 em:** `tts.sh` med Sara i trin 0/1/2 på tre replikker (intro1, "…vi går videre.", "Der mangler én.") + mund-JSON · i samme lyt-artifact.
3. **Council C5** (kun Claude-linser, no_gpt+no_gemini, maks 10 agenter): titeltema A/B · er 11-tone-tricket hørbart uden at være påfaldende · stemmetrin-kæden · jump-scare-lydens længde (200 vs. 300 ms).
4. **Frederik lytter og siger Ja** → resten af sangene og sfx-kataloget bygges i batches (plads-sange sammen med de minispil de hører til, fase 4).
5. Jump scare-lyden og 3 s-mute testes separat (må aldrig overraske Frederik selv i review — sendes med advarsel i artifacten).

## 10. Åbne spørgsmål (ikke blokerende)
- `midiutil`: ikke installeret endnu — hvilken python (brew-python eller venv i tools/)? `/usr/bin/python3` er Pillow-reserveret.
- Safari: OGG Vorbis-afspilning via `decodeAudioData` virker i Safari ≥ 14 for Vorbis? Usikkert → M4A leveres parallelt (allerede i planen); test i fase 6.
- Stereo: hele spillet er mono indtil min 78 (144 Fnugger). Skal det være mono også i credits? (Anbefaling: ja.)
- Midsommervisen (23. juni-egg) og nissehue-december: PD-melodier som GM, 8 takter hver — laves sidst, kun hvis tid.

## 11. Må ikke
Ingen Bitfrost-musik, -stemmer eller -lydklip · ingen Windows-start-/fejllyde (egne chimes) · ingen Endacopia-lyd · ingen moderne horror-sfx-biblioteker · stemme kun Sara (OS) eller browserens egen · GeneralUser GS (fri licens) eneste soundfont · Higgsfield bruges ikke til lyd i dette projekt (alt er GM/synth/TTS, det er pointen).
