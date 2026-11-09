# QC-POLISH-PLAN — brugeroplevelse, æstetik, animation

Vedtaget 10-11-2026 ca. 05:30 via plan-council (3 proposers → 3 Claude-linser → chair, wf_7fe13b18-49d). Vinder: "Palette-lås først, sprites som Director, hub uden dobbelt by, klik-feel målt af blind bot" (7,73) foran "Fejl i hub/Fnugger/hjælper først" (7,27) og "Dybde først, derefter feel" (6,67). Ingen vetoer. Dommernes rettelser er indarbejdet herunder. Supplerer `QUALITY-PLAN.md` (biblen og gates står dér og ændres ikke her). Frederik sover; alt er godkendt på forhånd, spørgsmål afgøres af council, review-artifacts er hans override og blokerer intet.

## 0. Verificeret kodestatus (62fa9b1 / master 50a531e)
- Knapper: hover = kun cursorskift (scene.js:89); tryk = inverteret bevel + 1 px (style.css:45-46). **Handling kører på pointerdown** (scene.js:70, engine.js:44) — biblen kræver lyd på down, handling på up.
- Cursor-wait sættes ved lock (scene.js:89); cursor-hand/wait findes kun som data-URL-fallback; cursor-arrow.png er ikke PNG8.
- **Belønningsanimation findes ikke**: hub.js:47 spiller kun `ui_bygning_opN` ved enter; drawBuilding hopper direkte til nyt trin; fx[]-krogen i scene.js:79 er ubrugt.
- Mund: voice-JSON pr. 80 ms (audio.js:181) eller procedurel pr. 2 tegn (dialog.js:74). Intet blink. Hjælper-ark + aliens-grid + bld_<kind>.png er understøttet i koden (placeholder.js, dialog.js:48) — PNG'erne er i kø hos bygge-sessionens Higgsfield-agent. `tools/art/aliens.py` FINDES (62fa9b1) og skal udvides, ikke genskabes.
- Nat: rgba-overlay + saturation-composite på dagsrender (placeholder.js:82-88) + canvas-filter (hub.js:116) → sprænger 256 farver alene. Øvrige A3-kilder: dialogboks rgba(0,0,0,.72) (style.css:27), nattevagtens rgba (hub.js:125), setup-chips radial-gradient (style.css:86-87).
- Minispil: landing.js:28 `cubic-bezier`; engine.js:43 `api.text` = DOM-tekst med textShadow; school.js:38-39 tegner tavle + opslagstavle som DOM-bokse oven på en render der allerede har en tavle (dobbelt tavle). quarry A1 = 1,03 % (fejler).
- A3 rød i 7/8 scener (setup 975, hub 1564, hub_nat 563 farver). A6 aldrig målt.

## 1. Faste regler for denne runde
- **Worktree-regel:** ingen bygger i main-checkout (main har ucommittede src-filer). Bygge-session = `~/Documents/mord-i-maaneby` (ejer merge). Polish-session c8 = `~/Documents/mord-i-maaneby-polish` (branch `polish`). QC-session b8 kører gates på den sti der pinges.
- QC af ANDEN agent end bygge-agenten; `tools/test/gates.json` røres ikke (forslag til ændringer = note til Frederik).
- Billeder/GIF'er → review-artifact Ja/Måske/Nej. Tekst-tjeklister (DoD) = skema i chatten (FAST 04-11), ikke artifact.
- Horror-brud whitelistes i `src/wrongness.js` før hver gate-kørsel.
- Higgsfield: Nano Banana Pro på Unlimited, egen fane, tjek Unlimited-switch før submit. Ingen nye baggrunds-/rum-/krom-renders (godkendt retning). Nat løses med LUT/palette-swap af PNG8, AI kun hvis det beviseligt ikke virker.
- Agentloft 10 i alt på maskinen (bygge-session + a0 + b8 + c8 tæller sammen).

## 2. Arbejdspakker (prioriteret). B = bygge-session, P = polish-session c8, Q = QC-session b8, C = council, H = bygge-sessionens Higgsfield-agent

| # | Pakke | Mål / handling | Måles | Ejer | Tid |
|---|---|---|---|---|---|
| 3A | **Hub uden dobbelt by, variant A** (dag 1-gevinst, ren rollback) | Den tomme slette findes (assets/raw/bg/hubempty_1/2.png): kør den gennem retro.py som NY fil `assets/bg/hub_empty.png` (hub.png overskrives ikke, fallback bevares); koden tegner trin 0–3 på PLOTS; grå plader væk | A1, A3, screenshots i artifact | B | 1 t |
| 1 | **Palette-lås** | Start med palette PR. SCENE (fallbacken). Masterpalette låses først når de nye sprites findes (WP2) — ellers udkast. Nat = LUT-swap via `assets/bg/*.pal.json` i stedet for darken(); fjern canvas-filter (hub.js:116), rgba-overlay (placeholder.js:82-88), dialogboks-rgba (style.css:27), nattevagt-rgba (hub.js:125), setup-chips som PNG8-sprites. `?dev&pal`-overlay (off-palette = cyan) bygges KUN hvis A3 stadig er rød efter LUT-swap | polish.mjs A3 ≤256 pr. scene | B (+P for style.css-dele) | 4 t |
| 2 | **Fnugger + hjælper som sprites** | H: 9 arter × 3 frames (hvile/step/kig) i 3-kolonne-grid som drawFnug forventer, hjælper 130×250 med 3 mund-frames + blink (**2 frames**, QUALITY-PLAN §2); retro.py sprite-mode → PNG8; review-artifact pr. art med IP-linse; councils C2+C3 | A1 hub ≤0,8 % + liveness, A3, C ≥7 liv/håndværk | B/H/C | 6 t |
| 4 | **Klik-feel + belønningsanimation** | button()/api.btn: lyd på pointerdown, handling på pointerup; cursor hand/wait som PNG8; `src/art/fx.js` med `buildSwap(slot, fromStep, toStep)` på step-ur: gammel 600 ms → støv 2 fr → ny sprite 2-fr pop + `ui_bygning_op` samme frame → stjerner 600 ms → replik +400 ms; lock = wait-cursor 1,2 s; dev-param `?dev&scene=hub&built=bakery:2`. B kalder fx fra hub.js | A6 pling ±83 ms, ≤12 unikke frames/s under swap, GIF i artifact | P (fx.js, scene.js, style.css, cursor.js) + B (kald i hub.js) | 4 t |
| 5 | **Minispil under gates (G4)** | engine.js api.text → text1bit (stage.js:51); landing.js:28 cubic-bezier → steps; school.js DOM-tavle væk, tekst på renderens egen tavle (kun UI-lag); mg_*-lydkort pr. spil via `play(name,{gain,pan})`; A7-grep udvides til src/ware; A1 for ware = "før første input" (forslag til gates.json som note, filen ændres ikke); quarry 1,03 % ned under 0,8 | polish.mjs med ware | P | 4 t |
| 6 | **A6 + klik-latens måling** (foldet ind i Q's løbende QC) | `window.MB.sfxLog` (tidsstempel pr. play()) + screencast over goto/swap; mund vs. stemme; cps visuelt; LUFS; GIF 10 fps + kontaktark pr. scene; qc-report med git-hash | sync.mjs + polish.mjs | Q | 3 t |
| 7 | **UX-feel-test** (§3) | `tools/test/feel.mjs` blind bot + artifact | se §3 | P (bot) + C (pacing-dommere) | 3 t |
| 9 | **Regression + DoD** | flow.mjs + polish.mjs + audio.mjs + sync.mjs på ren klon; DoD-skema (§4) udfyldt af Q med hash — i chatten | alle gates | Q | 1,5 t |
| 8 | **Nat-polish** (efter regression) | ét oplyst vindue pr. bygget bygning (indexed sprite); tom stol som sprite (portrait.js:8-13) | A1/A3 nat | B | 2 t |

Droppet fra denne runde (dommerne): Bayer-dissolve, runtime-kvantisering i stage-laget, nye nat-renders via AI, "kontrast ≥4,5" (ny regel uden kilde → kun informativ), WP3 variant B før A er målt.

## 3. UX-testprotokol "spil-feel" (blind bot + 1 artifact)
`tools/test/feel.mjs` (bygger på flow.mjs): rent localStorage, start fra `desktop` (ikke dev), 10 min ægte pointer-events med scriptet nybegynder-adfærd (klik på alt klikbart, læs al tekst til ▼).
1. **Klik-latens:** pointerdown → første frame med >0,5 % pixeldiff (CDP-screencast). Mål ≤100 ms. *Dead clicks* (ingen diff og ingen sfxLog inden 400 ms) logges med koordinat.
2. **Lyd pr. handling:** sfxLog vs. klik; mål 100 % af knapper/hotspots.
3. **Læsbarhed:** reel cps 24–32; tekst >3 linjer afskåret (dialog.js:33) = fejl.
4. **Tempo:** load → første frie klik i hub ≤90 s inkl. krom; summeret ventetid i lock(true).
5. **Pacing af wrongness:** bot kører `?min=` 0–30 i 5 spring; 3 blinde dommere (aldrig bygge-agenten) får kontaktark + GIF'er i tilfældig rækkefølge og svarer kun "ved hvilket billede bemærkede du først noget?". Mål: median min 15–30, intet før min 12.
Output: artifact med GIF'er + tal, Ja/Måske/Nej pr. linje (klik-feel, tempo, læsbarhed, første 10 min, pacing).

## 4. Polish-DoD pr. scene (udfyldes KUN af Q, tom indtil da; vises som skema i chatten)
Kolonner: Render PNG8 · Sprites m. fringe-kontrol · Knapper 3 tilstande + up-handling · Sort cut 200–500 ms · ≥1 step-anim · Lyd pr. handling · Tekst på 640-gitter · A1–A7 · C ≥7.
Rækker: title · setup · hub dag · hub nat · task-ramme · dialog/hjælper · minispil ×7 · falseEnd/fever/jump/morning/credits. Celle = grøn/gul/rød + qc-hash.

## 5. Gøres IKKE
1. Ingen nye renders af baggrunde/rum/krom; ingen ændring af gates.json; horror-brud "rettes" ikke — de whitelistes.
2. Ingen crossfades, easing, blur eller idle-bob — heller ikke i minispil.
3. Ingen venten på Frederik, ingen menneskelig playtest i denne runde, ingen Gemini/GPT som dommer.
