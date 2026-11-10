# Måneby to do

Samlet 10-11-2026 kl. ~06:15, da Frederik satte Måneby på pause ("pause det her, sæt alt der mangler på en måneby to do"). Erstatter docs/TODO.md (retning) og den første udgave fra polish-sessionen; alle tre sessioner (retning, polish c8, QC a0/b8) er lukket. Master er sandheden.

**Live:** https://publicsoda-png.github.io/mord-i-maaneby/ = master f0f0d22 (retning "Regnskabet" + polish + 12 Fnug-sprites + bygninger + bagte nat-sprites). Demo-artifact (akt 1) republiceret som version 3 af samme build: https://claude.ai/artifact/6sKCTCbDutE5ejoRGierRK. Efter f0f0d22 ligger c8's nat-stol-fix (9f29789), feel.mjs (64a4997) og denne fil på master, men er IKKE deployet – ingen funktionel forskel ud over den tomme stol om natten.

Ejer i parentes: B = bygge-/master-session, Q = QC, C = council, F = Frederik.

## 1. Venter på Frederik (F)
- [ ] Review af retningen "Regnskabet", 15 skærme, Ja/Måske/Nej: https://claude.ai/artifact/3No1m5SAokVQpusGEsRrmp
- [ ] Review af sprites (12 Fnugger, bygninger, hub dag/nat): https://claude.ai/artifact/8E5bcHNr1sZix6oVEwkuUN
- [ ] Review af polish-natten, 7 kort: https://claude.ai/artifact/BPisAUgwqVJriXfHZgGWfT (svar i artifactets db, collection `dom`)
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
- [ ] WP8: ét oplyst vindue pr. bygget bygning om natten (indexed sprite).
- [ ] (10-11 bestilt hos Higgsfield-agenten: ice/scope/hall dag ×2 + nat-edit af alle 9) Baggrunde der mangler (404, procedurel fallback): `assets/bg/ice.png`, `scope.png`, `hall.png`, `title.png` + alle `*_nat.png`. Beslut: bestil renders eller behold fallback. Nye renders → retro.py → pallock.py.
- [ ] Setup-chips (radial-gradient) står – setup måler 173 farver, så ingen handling nødvendig medmindre A3 bliver rød igen.

## 6. QC og gates (Q) — opdateret 10-11 (genoptaget efter pause)
**Gyldige domme på master e56b61c:** **G1 BESTÅET** (gated scener: title/setup/hub/hub_nat/landing; hub 0,035 %/250 ms, live 6; sort cut 283/283 ms, 0 blends; 0 konsolfejl). **G3 BESTÅET** (12 A6-punkter: mund +27/−17 ms, 84 % åben under stemme, cps 31,2, pling mod pop-frame Δ −50 ms, slot 1,6 skift/s, tryk-feedback 45 ms, handling 38 ms efter up, lyd 2 ms, loudness med whitelist).
- [x] G1+G3 kørt på master efter #os-fix (e56b61c).
- [x] sync.mjs T3 måler nu pling mod POP-framen (`?dev&scene=hub&built=bakery:2` + `window.MB.devSwap()` efter gestus; pop = største slot-skift ±300 ms om plinget; fxLog kun krydstjek). gates.json: `pop_region` (bakery 206,230 88×112), `ident` markeret `info` (loader med koreograferet ryk, 6,97 %/250 ms er bevidst).
- [ ] **QC-filer ucommittede i master-checkoutet:** tools/test/sync.mjs + tools/test/gates.json (ovenstående). B committer.
- [ ] **G2 — palette (gate ≤256):** b8's tal er fra FØR pallock (e56b61c). c8 målte efter pallock (d7d2b5e, live 0dc0a6a): hub 194, hub_nat 182, setup 173, landing 183, bakery 188, school 209, quarry 139, light 170, title 108 – alle ≤256. b8 skal måle igen på 05aa0bb+ for at godkende G2. Gamle tal: title 228 ✔ · logroom 241 ✔ · landing 260 · school 265 · bakery 274 · setup 294 · fever1 408 · light 502 · quarry 507 · hub_nat 523 · jump 611 · hub 759 · scope 900 · hall 1025 · ice 1103 · morning 1219. Hub'en består af flere PNG8-filer med hver sin palette (bg + aliens.png + helper.png + bld_*) → sum >256. Kræver fælles masterpalette (WP1, B). Minispil ice/scope/hall/light: DOM/gradient-rester (P).
- [ ] Kolonne C (blind side-om-side council, IP-veto) — ikke kørt. Klar til at køre på title/setup/hub nu hvor sprites er inde; mod docs/research/ref-frames.
- [ ] DoD-skema §4 (QC-POLISH-PLAN) med hash — i chatten.
- [ ] feel.mjs igen på master (sidst b2b63a0: median 42 ms, p90 107).
- [ ] Info-scener (akter): falseEnd 1 farve/10 % spike (sort + cut), credits/trueEnd 15 frames/s rul med 2–3 farver — tjek at rullen kører på step-ur (10 fps), ikke 60 fps. fever2 9 farver.
- [ ] Ryd tools/test/qc/ + qc-sync/ (gitignored frames, ~600 MB) ved pladsmangel.

## 6b. Titelskærm (F)
- [ ] Titlen bruger hub-renderen (retningens valg). Der findes en særskilt titel-render (assets/raw/title/title_2.png: kupler i stillads på måneslette) – Frederik afgør om den skal bruges; retro.py-konvertering er triviel.

## 7. Pacing-council (C)
- [x] **Kørt 10-11 ~10:05 (c8):** K01–K06 gen-renderet på palette-låst kode (feel.mjs --pacing seed 7, git 2e7a66c; nøgle i `tools/test/feel-key/key.json`). 3 blinde Claude-dommere, alle tre: FØRST_BEMÆRKET = K04 = **minut 18** (navnet nederst t.v. skifter fra "Test" til "Syv" – name_syv). Intet før minut 12 ✔, median 18 inden for 15–30 ✔. Sikkerhed høj/høj/mellem.
- [ ] **Begrænsning (ærligt):** kontaktarkene er stille hub-frames uden dialogklik, så kun synlig hub-wrongness testes. Ved minut 30 fyrede save_lies uden synligt spor i stillbilledet, og ved minut 24 fyrede intet (seed 7). Dialog-, lyd- og minispil-wrongness (QUALITY-PLAN wrongness.js) er IKKE dækket af denne test – kræver enten gif'er med dialogklik i --pacing eller en menneskelig gennemspilning (§1).
- [ ] Feel-bot lang kørsel `--minutes 10` seed 21 kører på 0dc0a6a (c8, resultat i tools/test/feel/feel-report.json når den er færdig); 2.–3. seed mangler.

## Faste regler for næste runde
- Ingen bygger i main-checkout; B merger og deployer; QC af anden agent end byggeren; `tools/test/gates.json` røres ikke.
- Billeder → review-artifact Ja/Måske/Nej; tekst-tjeklister → skema i chatten.
- Ingen crossfades/easing/blur/idle-bob; alt på step-uret 10 fps; scene-skift gennem sort 200–500 ms; ingen canvas-filtre (bag nat-varianter).
- Fnugger = freaky retro-aliens i alle farver; baggrunde/rum/krom er godkendt retning og genrenderes ikke. Alt uden for Måneby-universet er ude (ingen skrivebord/elev07/Skole-IT).

## 8. QC-runde 4 (a0) – ikke verificeret
Se docs/TODO-QC.md (a0s egen status). Vigtigst: akt 3 fra jump → credits → ægte 2. gennemspilning er ALDRIG QC-et med mus; ægte nat-stol (falsk slutning → nat, ikke &nat); scope 1. klik. a0s rapporter/screenshots lå i a0s scratchpad og er væk ved genstart.
