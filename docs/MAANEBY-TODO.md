# Måneby to do

Samlet 10-11-2026 kl. ~06:15, da Frederik satte Måneby på pause ("pause det her, sæt alt der mangler på en måneby to do"). Erstatter docs/TODO.md (retning) og den første udgave fra polish-sessionen; alle tre sessioner (retning, polish c8, QC a0/b8) er lukket. Master er sandheden.

**Live:** https://publicsoda-png.github.io/mord-i-maaneby/ = master f0f0d22 (retning "Regnskabet" + polish + 12 Fnug-sprites + bygninger + bagte nat-sprites). Demo-artifact (akt 1) republiceret som version 3 af samme build: https://claude.ai/artifact/6sKCTCbDutE5ejoRGierRK. Efter f0f0d22 ligger c8's nat-stol-fix (9f29789), feel.mjs (64a4997) og denne fil på master, men er IKKE deployet – ingen funktionel forskel ud over den tomme stol om natten.

Ejer i parentes: B = bygge-/master-session, Q = QC, C = council, F = Frederik.

## 1. Venter på Frederik (F)
- [ ] Review af retningen "Regnskabet", 15 skærme, Ja/Måske/Nej: https://claude.ai/artifact/3No1m5SAokVQpusGEsRrmp
- [ ] Review af sprites (12 Fnugger, bygninger, hub dag/nat): https://claude.ai/artifact/8E5bcHNr1sZix6oVEwkuUN
- [ ] Review af polish-natten, 8 kort (v4 10-11: status master 4758716, akt 2+3-tal, isværk/kikkert/rådhus-skærme): https://claude.ai/artifact/BPisAUgwqVJriXfHZgGWfT (svar i artifactets db, collection `dom`)
- [ ] Spil den deployede version igennem selv – ingen menneskelig playtest er kørt.

## 2. Næste deploy (B) – små ting der er klar
- [ ] Deploy master (9f29789 nat-stol-fix + TODO) med `bash tools/deploy.sh`, republicér artifact fra `node tools/build.mjs --artifact` (220 filer, `root: dist-artifact`).
- [x] (10-11 09:50) bld_pad/pit/box genbygget og deployet 211de49. Var: `assets/raw/bld/pad_plain_2.png` (kuplen skulle ikke svæve) og `pit_deco_2.png` (spøgelses-spil fjernet). Kør `~/Documents/tools/pyimg/bin/python -I tools/art/bld.py pad pit`, derefter `tools/art/nightlut.py assets/sprites/bld_pad.png assets/sprites/bld_pit.png`, kig på kontaktark, commit.
- [ ] Commit eller ryd op i ucommittede rå renders (assets/raw/jump/hall_*.png, assets/raw/bld/*_2.png, assets/raw/LISTING.md).
- [x] Worktree -retning fjernet 10-11. -polish bruges af c8 igen (aktiv).

## 3. QC-runde 3 fra a0 (BØR, ingen blokerer) (B)
- [x] `src/main.js`: `?reset` rydder nu LS+IDB før loadState (c8 8bb8f71, merget c860c09).
- [x] `src/scenes/task.js`: ok-replikken venter nu på wrong-replikken (c8 8bb8f71).
- [x] scope 1. klik: fejlen lå i `src/ware/engine.js` (`local()` læste forrige frames cursor) – alle minispil bruger nu eventets egen position (c8 8bb8f71, verificeret med syntetisk klik uden mousemove).
- [ ] KAN: hall nat viser "Fnugger: 12" mens svaret er 11 (fnugShown – forventet?). 14 bg-404 pr. load (se pkt. 5).
- Scores runde 3: krom 9, minispil 6, akt 3 delvist 4, sammenhæng 9, konsol 8, sprites/buildSwap 7. 0 % blå i ægte rute.

## 4. Jump-motivet – council C6 (B + C)
- [x] (10-11) hall_6–8 med grøn Syv hentet fra Higgsfield-biblioteket, retro-konverteret og blindet sammen med fallbacken (scratchpad c6-blind). Council C6 venter på fri RAM ≥ 8 GB.
- [x] hall_1–5 viser en lodden kugle, ikke Syv (Syv = celle 6 i aliens.png, grøn slim-alien m. ringe). hall_6–8 med grøn Syv var submittet på Higgsfield Unlimited (3 submits, 4:3) da pausen kom, og agenten blev stoppet før download – tjek Higgsfield-biblioteket først, ellers bestil igen (reference: celle `alien_3_1`, samme pose/lys som hall_1, gul bulet hjelm på skrå, åbne øjne, lille smil, ingen tekst/UI).
- [ ] Retro-konvertér (`/usr/bin/python3 tools/art/retro.py <in> <out> --mode bg`), design-council C6 (kun Claude-linser, no_gpt+no_gemini, precheck ≥ 8 GB fri RAM) mod den procedurelle fallback (drawHall i src/scenes/acts.js).
- [ ] Vinder → assets/photos/jump_hall.png → deploy + artifact-republish.

## 5. Palette og nat – WP1/WP8 (B)
- [x] **Palette-lås (c8, polish d7d2b5e):** `tools/art/pallock.py` låser alle bg + sprites til én masterpalette pr. fase (dag/nat, 255 + transparent). Nat-bg bages som `assets/bg/*_nat.png` (darken() er død kode). Grund-plader uden rgba, dialogboks som 2×2-dither. Ulåste kilder i `assets/unlocked/`; låste filer bærer PNG-tEXt `pallock=1`. **Regel:** efter bld.py/aliens.py/helper.py/chair.py/nightlut.py køres altid `~/Documents/tools/pyimg/bin/python -I tools/art/pallock.py`. Diagnose: `tools/art/offpal.py <skud> assets/pal/dag.png <maske>` viser off-palette-pixels.
- [x] A3 målt i dev-skud efter låsen: hub 194, hub_nat 182, hub+dialog 194, setup 173, landing 183, bakery 188, school 209, quarry 139, light 170, title 108 (før: hub 759, hub_nat 523, setup 294). Q bekræfter med polish.mjs efter merge.
- [x] `src/art/portrait.js`: nat via bagt helper_nat-sprite, canvas-filter væk (c8 2e7a66c).
- [x] Procedurelle scener på A3 (c8 10-11 ~10:10): alle rgba/gradienter i acts.js, placeholder.js og portrait.js erstattet af `stipple()` (2×2-dither) og `bands()` (hårde bånd) i stage.js; raket-gnister og morgenhjelm på heltal uden rotate; credits-rul og fyr-rul i 2 px-trin på step-uret. Målt i dev-skud: fever1 179 · jump 195 · logroom 74 · morning 237 · falseEnd 215 · credits 4 · ice 105 · scope 114 · hall 115 · title 108 (før: fever1 408, jump 611, morning 1219). Q bekræfter med polish.mjs.
- [x] Ware-sprites (quarry 310, light 396 i polish.mjs midt i spillet): skrå polygoner/buer/streger gav AA-blandinger → engine.js `snapAlpha()` efter hver sprite-tegning (alpha 0/255). Dev-mål midt i spillet: quarry 186, light 179, bakery 199, landing 187, school 215 (c8 ~11:05). b8 bekræftet på master 2f655e2 med polish.mjs: quarry 182, light 178, ice 163, scope 202, hall 124, school 224 – alle 21 scener ≤256, G1 BESTÅET. b8 feel seed 7 på 120c5a0: 0 døde klik, median 30 ms, p90 93.
- [ ] WP8: ét oplyst vindue pr. bygget bygning om natten (indexed sprite).
- [ ] **Baggrunde (10-11):** ice + scope LIVE 5f0428d (B valgte variant 2 af hver: ægte Bryce-stivhed; variant 1 = hvid papirtekstur hhv. for moderne/malerisk – raw ligger i assets/raw/bg/ice_1/scope_1 hvis Frederik vil bytte). hall LIVE 9d6c482 (variant 2: søjler/spot/mørke hjørner; variant 1 = røde/blå søjler, raw i assets/raw/bg/hall_1). Alle bg-404 = 0. Artifact v5 = 9d6c482. Nat: 7 scener har RENDEREDE natbilleder (Higgsfield i2i på samme dagbillede, ét varmt vindue) via assets/unlocked/bg/*_nat.png; ice/scope-nat er stadig LUT-bagt (renders brugte den forkerte dagvariant, raw i assets/raw/bg/ice_nat_1, scope_nat_1). Nat-versioner bages af pallock (nightlut-formel), så Higgsfield-nat-edits er kun et evt. løft. title.png udgået (titel bruger hub). OBS: hver ny bg genberegner masterpaletten → alle låste assets omskrives.
- [ ] Setup-chips (radial-gradient) står – setup måler 173 farver, så ingen handling nødvendig medmindre A3 bliver rød igen.

## 5b. QC-runde 4 (a0, efterprøvet på 43bc1a9) – rettet af c8 10-11 ~10:40
- [x] B1 logrummet: 7 var fjernet fra tastaturet når minus var tegnet → lag 5 (12−5) kunne aldrig svares, spillet stod fast. Nu tegnes 0–9 altid, '−' har egen plads (x 112, y 420). Verificeret i dev (alle 13 taster).
- [x] B2 hub: log_open sættes nu FØR knapperne bygges → 'Nedenunder' i samme besøg, replikken kun én gang.
- [x] B3 morning har exit() med showHelper(false); credits kalder showHelper(false) → ingen hjælper/stol over rullen og titlen.
- [x] B4 task 'Tilbage' kalder hideDialog() → intro-replikken følger ikke med i hubben.
- [x] K2 fever1: spørgsmålet kun i dialogboksen (lærreds-dubletten fjernet).
- [x] K3 titel: ingen Fortsæt efter slutningen (flags.morning); setup tom efter slutning/credits.
- [x] K4 hub: åben, ubygget Rådhus-plads viser en lille åben dør (palettefarver) ved flaget.
- [ ] K1 jump_hall.png 404 → B (C6-council når RAM tillader).

## 6. QC og gates (Q) — opdateret af b8 10-11 ~10:40
**Gyldige domme på master 43bc1a9 (gælder også 120c5a0/208a6e5, kun QC/docs ændret):** **G1 BESTÅET** (A1 hub 0,035 %/250 ms, live 6; sort cut 283/283 ms, 0 blends; 0 konsolfejl; A4 ≤0,07 %). **G3 BESTÅET** (12 A6-punkter: mund +27/−17 ms, 84 % åben under stemme, cps 31,2, pling mod pop-frame Δ −50 ms, slot 1,6 skift/s, tryk-feedback 45 ms, handling 38 ms efter up, lyd 2 ms, loudness med whitelist). **feel.mjs** (120c5a0, bot 3 min, 27 klik): median 30 ms, p90 93, max 99, 0 døde klik, 0 over 100 — alle 8 feel-punkter grønne.
**G2 — palette BESTÅET på master c6b8efa/9d6c482 (ENDELIG masterpalette, alle bg inde)** (gate ≤256, alle 21 scener, ingen røde pass-flag i polish.mjs): title 109 · setup 174 · hub 201 · hub_nat 192 · landing 187 · school 219 · bakery 199 · quarry 178 · ice 160 · scope 205 · light 177 · hall 196 · fever1 183 · jump 203 · logroom 75 · morning 235 · ident 29 · fever2 9 · credits 3 · falseEnd/trueEnd 1–2. **G2 mangler kun kolonne C** før den er grøn.
- [x] G1+G3 på master efter #os-fix; A3 igen efter pallock.
- [x] sync.mjs T3 måler pling mod POP-framen (`?dev&scene=hub&built=bakery:2` + `window.MB.devSwap()` efter gestus); gates.json `pop_region`, `ident`=info. Committet 0c769d8. polish.mjs undtager assets/unlocked + favicon (120c5a0).
- [x] Credits/trueEnd-rullen kører på step-uret: 10 unikke frames/s (43bc1a9). A1_max rød på credits/trueEnd/falseEnd er forventet (rul/cut) — info-scener, ikke gated.
- [ ] **Kolonne C — 3 runder kørt 10-11 (sidste runde pr. aftale med B). SLUTSTATUS på 1e02c0b: hub_early + hub_mid BESTÅET, title + setup IKKE BESTÅET (kun liv 6 mod gate 7).** 3 dommere (æra/håndværk/spiller), blind ref/vores, chair=kode (median ≥7 pr. akse, ingen <5). IP-veto 0 i alle runder; eneste note: ordet "Måneby" er fælles → varemærkespørgsmål, ikke ophavsret.
  - Runde 3 (1e02c0b): title 8·**6**·7·8 — setup 8·**6**·7·8 — hub_early 8·7·7·7 ✔ — hub_mid 8·7·7·7 ✔. Referencen selv scorede liv 7 / håndværk 7 i samme runde. Chair-note: håndværk-dommeren havde byttet venstre/højre på hub-parrene (fix-teksterne beskriver entydigt troldmand/boldbane = reference, grå flagplader/igloo = vores) → siderne byttet af chair, scorer uændrede; dokumenteret i JSON.
  - Forløb: r1 (9d6c482) title liv 4 / setup liv 4 / hub håndv. 5 → r2 (5620409) 5 / 4 / 6 → r3 (1e02c0b) 6 / 6 / 7. Rettelserne virkede: kontaktskygger, perspektiv, grupper, titelfigur+silhuet, setup-vært+bevel.
  - **Kendt rest (ikke gated videre, Frederik afgør):** title: bysilhuetten er en flad sort udklipning → prærenderet lav-poly silhuet med belyst kant/oplyste vinduer; kuppel+figurer tættere på komposition. setup: baggrunden er tom slette → lad skyline/kuppel fra titlen stå bag dialogen, + ét lille liv-element (Fnug på bænken/rygende skorsten). hub (ikke-gated noter): flagplader større/lysere som klikmål, ingen "pladsholder"-look (byggegrund med tal), igloo-skygge som hård dither som de andre.
  - Filer: script tools/test/kolonneC.js (Workflow, args pairs_dir/pairs/out_dir); resultater tools/test/qc-kolonneC/kolonneC-{,r2-,r3-}afblindet.json + pairs{,-r2,-r3}/.
- [x] G2 øvrige dele: palette ≤256 alle 21 scener (jump 204 efter hall_6), A3_assets/A5 grønne, IP-veto 0.
- [x] **A5_placeholder var et måle-artefakt** (rettet i polish.mjs, nu 0 hits): polish.mjs tæller imports fra `src/art/placeholder.js`, men det modul er nu sprite-/bg-loaderen (bg, sprite, drawFnug, drawBuilding). A5 skal i stedet måle om en scene falder tilbage på procedurel tegning (fx `hasBg()` false / manglende sprite) — b8 retter polish.mjs. Indtil da: informativ.
- [ ] DoD-skema §4 (QC-POLISH-PLAN) med hash — som skema i chatten når kolonne C er kørt.
- [ ] Ryd tools/test/qc/ + qc-sync/ + feel/ (gitignored frames, ~600 MB) ved pladsmangel.

## 6b. Titelskærm (F)
- [ ] Titlen bruger hub-renderen (retningens valg). Der findes en særskilt titel-render (assets/raw/title/title_2.png: kupler i stillads på måneslette) – Frederik afgør om den skal bruges; retro.py-konvertering er triviel.

## 7. Pacing-council (C)
- [x] **Kørt 10-11 ~10:05 (c8):** K01–K06 gen-renderet på palette-låst kode (feel.mjs --pacing seed 7, git 2e7a66c; nøgle i `tools/test/feel-key/key.json`). 3 blinde Claude-dommere, alle tre: FØRST_BEMÆRKET = K04 = **minut 18** (navnet nederst t.v. skifter fra "Test" til "Syv" – name_syv). Intet før minut 12 ✔, median 18 inden for 15–30 ✔. Sikkerhed høj/høj/mellem.
- [ ] **Begrænsning (ærligt):** kontaktarkene er stille hub-frames uden dialogklik, så kun synlig hub-wrongness testes. Ved minut 30 fyrede save_lies uden synligt spor i stillbilledet, og ved minut 24 fyrede intet (seed 7). Dialog-, lyd- og minispil-wrongness (QUALITY-PLAN wrongness.js) er IKKE dækket af denne test – kræver enten gif'er med dialogklik i --pacing eller en menneskelig gennemspilning (§1).
- [x] Feel-bot `--minutes 10` seed 21 på 0dc0a6a+pallock (c8 10-11 ~10:20): alle 8 pass (klik-latens median 50 ms, p90 116, 6 klik >100 ms, maks 449; dead clicks ok; lyd pr. handling ok; cps unvoiced 27,4; ingen afskåret tekst; 0 konsolfejl; 0 bot-fejl; 74 klik, scener ident/title/setup/hub/task). 404 kun de kendte 8 (ice/scope/hall/title ±_nat). Seed 33 kører som 2. kørsel.
- [x] Feel seed 33 (c8 ~10:55): 6/8 pass; latens median 31 ms, p90 97, maks 118, 0 konsolfejl. RØDT: ét dødt målrettet klik = 'Tilbage' i task under resultat-replikken (scenen er låst, knappen stod synlig uden respons) → rettet: Tilbage fjernes når spillet er løst, før lock (task.js). 'lyd pr. handling' 34/35 var samme klik.
- [x] 3. feel-seed 45 (c58674d): 89 klik, 0 døde målrettede, latens median 31 ms, 7/8 gates. Rød: lyd_pr_handling 35/36 – msgBox-knappen 'Nej' (Luk-dialogen i hubben) havde ingen kliklyd → os.js: sfx.click() på pointerdown for .wbtn. Verificeret i dev (1 lydstart). Akt 2 dækket: feel.mjs har fået `--akt2` (efter hub-intro sættes 6 bygninger færdige og fyrværkeripladsen klikkes → falseEnd → nat). Seed 61, 12 min på c872226: 103 klik, 0 døde målrettede, latens median 50 ms / p90 120, lyd 60/60, 8/8 gates; scener ident→title→setup→hub→falseEnd→nat-hub↔opgaver. 404 på hall.png var kun fordi worktree'en lå før 9d6c482.
- [x] 4. `--akt3` (B's ønske): nat + hall_door/hall_answer/fever1 sættes → dør → jump → hub (afterJump) → Nedenunder → logrum (7 lag løses scriptet 11…5, '−' til stede) → morgen → credits → titel. Seed 73 på 4c9dab9+hall.png: 1. kørsel 69 klik, median 47 ms, 0 ægte døde klik, lyd på alle (de to røde gates var scriptets: overflødigt Grav-klik + hub-tidsmål før kæden, rettet). Bekræftelse: 74 klik, 0 døde, lyd 42/42, hub 66,6 s, p90 118.
- [x] 5. Morgen-latens: B afgjorde 10-11 at dialogen ikke røres (lyd straks, skrivemaskine er æra-rigtig). I stedet er målingen rettet: `latency_ms` = tidligste af første lyd-event og første frame med ≥0,1 % ændrede pixels (`visual_ms` = kun pixels, bevaret separat). Bekræftet med `--akt3 --seed 73 --minutes 6`: alle 8 mål grønne, median 1 ms, p90/max 72 ms, 0 over 100, morgen-median 71 ms (visual 96), 0 døde målrettede klik, lyd 35/35, 0 konsolfejl (kun jump_hall.png 404 = B's C6).

## Faste regler for næste runde
- Ingen bygger i main-checkout; B merger og deployer; QC af anden agent end byggeren; `tools/test/gates.json` røres ikke.
- Billeder → review-artifact Ja/Måske/Nej; tekst-tjeklister → skema i chatten.
- Ingen crossfades/easing/blur/idle-bob; alt på step-uret 10 fps; scene-skift gennem sort 200–500 ms; ingen canvas-filtre (bag nat-varianter).
- Fnugger = freaky retro-aliens i alle farver; baggrunde/rum/krom er godkendt retning og genrenderes ikke. Alt uden for Måneby-universet er ude (ingen skrivebord/elev07/Skole-IT).

## 7b. a0 run 7 (109d0cb) – rettet af c8 10-11 ~13:10
- [x] BLOKKER: dør-stien i hub.js satte kun flags.jumped → wrongness 'jump' fyrede igen ved min 68 (2. jump scare), raadhus_melder/stemme_rum ventede. Fix: `save.seen.jump = Date.now(); touch()` i dør-stien.
- [x] BØR: morgen → credits-tomgang tælles nu fra spilleren er fri (efter "Udmærket."), ikke fra enter; `hideDialog()` før `goto('credits')` i idle-vejen (acts.js). a0's 155,6 s var målt fra enter.

## 8. QC-runde 4 (a0) – BESTÅET 10-11 ~12:45 (B)
Kørt på live 208a6e5 → 109d0cb med ægte museklik (puppeteer-core), ingen DOM-workaround. Screenshots: `~/Documents/claude-samtaler/mord-i-maaneby/qc-screenshots/qc4/` (run1–run8). Pacing-kontaktark K01–K06 + key.json: `…/mord-i-maaneby/pace/` (ubrugte – c8 kørte councillet, §7).
- [x] Akt 3 ubrudt (175,7 s): silence_counter → jump (billede 276–344 ms, master 0 til næste klik, målt 7,9 s) → Hende → Rådhus 11 → fever1 → Nedenunder samme besøg → 7 lag (13 taster, byen_minus1..7) → Stille morgen (byen_morgen +4,0 s, "Udmærket." +5,5 s) → credits (Luk klikbar 38 s) → titel → Start → setup (tomt) → hub. 2. gennemspilning: flags kun hall_open+minus_known, seen tom, nat-stol TOM.
- [x] B1–B4 fra runde 4 bekræftet rettet (7-tast, Nedenunder-knap, hjælper over credits/titel, Tilbage-dialog). K2/K3 rettet; K4 (intet nyt på Rådhus-pladsen efter hall_open) = KAN hvis tilsigtet.
- [x] Scope 1. klik rettet (engine.js local(e)); ægte nat-stol tom; jump_hall.png vises, flash 300 ms; skole-nat dørvindue læses som ét tændt vindue.
- [x] raadhus_melder (min 69) + stemme_rum (min 70) fyrer rent.
- [x] A3 på e38a14b: alle 11 scener ≤256 farver (canvas-lag; hub 204, hub_nat 190, hall 205, school 211), 0 fejl, 0 404.
- [x] Rådhus-døren som jump-indgang: rettet c8 (§7b), EFTERPRØVET a0 run 9 på 1e02c0b: seen.jump sættes ved døren, intet 2. jump ved min 68, melder/stemme_rum fyrer. (Run 8 ramte Pages' CDN-cache og så gammel kode – ignoreret.)
- [ ] **BØR (run 9, 1e02c0b) – STADIG FEJL:** morgen-idle → credits kommer ALDRIG uden klik: acts.js:360 `await say('Udmærket.', {hold:800})` uden `auto` awaiter et klik (dialog.js:122), så said/idle (l. 361) sættes først når spilleren klikker; 170 s målt uden credits, dialog synlig m. ▼. Fix: `auto: 1800, keep: true` eller sæt said/idle FØR await. `qc4/run8/13-credits-moment.png`.
- [ ] Ikke QC'et: WP9 regression på ren klon; DoD-skema §4 (b8).

## C6 jump scare – AFGJORT 10-11 ~11:50
Blindt council (3 Claude-dommere, chair): D=hall_6 7,17 · A=hall_7 6,0 · B=hall_8 6,0 · C=kodetegnet fallback 3,33. Ingen vetoer. Dommernes rettelser til vinderen: kamera frontalt, bord i forgrunden, luk blå døråbning, større ansigt, skarpere specular på sten. Udført: zoom-beskæring af råfilen (tools/art/jump_zoom.py: 400×300-udsnit → 640×480 → retro.py) → ansigtet er ~2× større og døråbningen er ude. Ikke udført (kræver ny render): frontalt kamera, bord, specular – valgfri runde. Fil: assets/photos/jump_hall.png (PNG8, uden for pallock). Raw: assets/raw/jump/hall_6.png.
