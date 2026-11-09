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
- [ ] Nye Higgsfield-renders ligger klar, ikke bygget ind: `assets/raw/bld/pad_plain_2.png` (kuplen skulle ikke svæve) og `pit_deco_2.png` (spøgelses-spil fjernet). Kør `~/Documents/tools/pyimg/bin/python -I tools/art/bld.py pad pit`, derefter `tools/art/nightlut.py assets/sprites/bld_pad.png assets/sprites/bld_pit.png`, kig på kontaktark, commit.
- [ ] Commit eller ryd op i ucommittede rå renders (assets/raw/jump/hall_*.png, assets/raw/bld/*_2.png, assets/raw/LISTING.md).
- [ ] Worktrees: `~/Documents/mord-i-maaneby-retning` (branch retning) og `~/Documents/mord-i-maaneby-polish` (branch polish) er begge merget – fjern med `git worktree remove`.

## 3. QC-runde 3 fra a0 (BØR, ingen blokerer) (B)
- [ ] `src/main.js`: `loadState()` kører FØR `localStorage.clear()` ved `?reset` → gammel save overlever. Byt rækkefølgen (dev-only, men ødelægger repro).
- [ ] `src/scenes/task.js` ca. linje 50/62: quarry dag – ok-replikken lander oven i en uafsluttet wrong-replik (auto:1000); to replikker klistrer. Annullér/afvent wrong-say før ok-say.
- [ ] `src/ware/games/scope.js` 122–128: rigtig stjerne registreres først ved 2. klik, derefter "Ikke den stjerne" på korrekt felt – muligvis kun testkoordinater; kræver et menneskeklik.
- [ ] KAN: hall nat viser "Fnugger: 12" mens svaret er 11 (fnugShown – forventet?). 14 bg-404 pr. load (se pkt. 5).
- Scores runde 3: krom 9, minispil 6, akt 3 delvist 4, sammenhæng 9, konsol 8, sprites/buildSwap 7. 0 % blå i ægte rute.

## 4. Jump-motivet – council C6 (B + C)
- [ ] hall_1–5 viser en lodden kugle, ikke Syv (Syv = celle 6 i aliens.png, grøn slim-alien m. ringe). hall_6–8 med grøn Syv var submittet på Higgsfield Unlimited (3 submits, 4:3) da pausen kom, og agenten blev stoppet før download – tjek Higgsfield-biblioteket først, ellers bestil igen (reference: celle `alien_3_1`, samme pose/lys som hall_1, gul bulet hjelm på skrå, åbne øjne, lille smil, ingen tekst/UI).
- [ ] Retro-konvertér (`/usr/bin/python3 tools/art/retro.py <in> <out> --mode bg`), design-council C6 (kun Claude-linser, no_gpt+no_gemini, precheck ≥ 8 GB fri RAM) mod den procedurelle fallback (drawHall i src/scenes/acts.js).
- [ ] Vinder → assets/photos/jump_hall.png → deploy + artifact-republish.

## 5. Palette og nat – WP1/WP8 (B)
- [ ] Gjort: aliens/bld/helper/stol har bagte `*_nat.png` (tools/art/nightlut.py), canvas-filtre fjernet i placeholder.js + dialog.js. Genbyg `*_nat.png` når et dag-sprite ændres.
- [ ] `src/art/portrait.js` linje 19 bruger stadig et canvas-filter (fallback-portræt, lav prioritet).
- [ ] A3 ≤256 farver i hub dag/nat – mål igen på f0f0d22 (sidst 1564/963 før sprites).
- [ ] Resten af WP1: dialogboks rgba(0,0,0,.72) (style.css), setup-chips radial-gradient, natvagtens farver.
- [ ] WP8: ét oplyst vindue pr. bygget bygning om natten (indexed sprite).
- [ ] Baggrunde der mangler (404, procedurel fallback): `assets/bg/ice.png`, `scope.png`, `hall.png`, `title.png` + alle `*_nat.png`. Beslut: bestil renders eller behold fallback.

## 6. QC og gates (Q) — opdateret af QC-sessionen b8 10-11 ~06:15 ved pause
**Sidst gyldige domme:** G1 BESTÅET på master 82ae23f/c70b76b og polish 025c02b (8 scener). G3 BESTÅET på master 82ae23f. Alt efter retning-mergen (9270c40 → c82f200) er IKKE gyldigt målt: dev-shots var blå (#os z-40) i master-checkoutet, så A1 0 %/A3 1–3 farver på falseEnd/credits/trueEnd/fever2 er artefakter, ikke resultater.
- [ ] **Kør G1+G3 på master c82f200+** (#os-fix er inde) fra master-checkoutet: `nice -n 10 node tools/test/polish.mjs && node tools/test/sync.mjs` (fnm node v24). Mod en anden worktree: `MB_ROOT=<sti> MB_OUT=<scratch>`.
- [ ] **QC-filer er ucommittede i master-checkoutet** (b8's seneste): tools/test/polish.mjs (MB_ROOT/MB_OUT, A7-sinus-grep dækker src/ware, assets/raw undtaget fra PNG8, `info`-scener filtreres fra gates), tools/test/sync.mjs (T4 splittet i tryk-feedback ≥150 px fra down + handling ≥0,1 % fra up, oscillator-hook, loudness-whitelist fra src/wrongness.js), tools/test/gates.json (21 scener: + ident, task_ice/scope/light/hall som `ware`, falseEnd/fever1/fever2/jump/logroom/morning/credits/trueEnd som `info`; A6: mouth_tolerance 100 ms, helper_frames ≤13, json_rms ≥0,85, LUFS −16/−18 ±1,5, TP ≤ −1, click ≤100 ms, press ≥150 px, visual ≥0,1 %). B committer dem (gates.json-ændringerne er b8's tilføjelser, ikke tærskelændringer — Frederik godkender ved at lade dem stå).
- [ ] **A6 T3 pling-sync fejler efter buildSwap** (målt på 9270c40 og polish 6634f5f): T3 måler pling mod første ikke-sorte hub-frame, men buildSwap spiller nu pling på POP-framen (støv → pop). Ret sync.mjs T3 til at måle mod pop-framen (slot-regionens sprite-skift eller `window.MB.fxLog.show`) via `?dev&scene=hub&built=bakery:2`. Først derefter kan G3 blive grøn igen.
- [ ] **G2 (palette + blind side-om-side) ikke kørt.** Sidste gyldige A3 (polish 6634f5f-basis, før blå-fejl kan udelukkes helt): title 228 ✔, setup 294, landing 262, school 265, bakery 274, logroom 241, quarry 508, hub 759, hub_nat 580, fever1 407, jump 576, scope 900, hall 1025, ice 1103, light 502–1671, morning 1529. Gate ≤256 — kun title består. Nat = LUT-swap, dialogboks-rgba og ware-DOM-rester er de kendte kilder (QC-POLISH-PLAN §0).
- [ ] Kolonne C: blind side-om-side via council design-mode (no_gpt+no_gemini, IP-veto) på title/setup/hub mod docs/research/ref-frames — ikke kørt på nogen scene. IP-veto på assets/sprites/aliens.png er kun kørt af bygge-sessionens C3, ikke af QC.
- [ ] Runde 2-scener (ident, 4 minispil, slutscener) er nu i gates.json som ware/info — kør dem og giv Frederik tallene; ident viste 6,97 %/250 ms (sandsynligvis blink/typing — tjek om det er step-ur).
- [ ] DoD-skema §4 (QC-POLISH-PLAN) fuldt udfyldt med hash — som skema i chatten. Sidste delvise version sendt til c8 på b2b63a0.
- [ ] feel.mjs igen efter merge (sidst: b2b63a0, median 42 ms, p90 107, 2 langsomme klik: setup OK 111 ms, hub-hotspot 107 ms).
- [ ] Ryd tools/test/qc/ og qc-sync/ (≈20–40 MB frames, gitignored) når der er brug for plads.

## 7. Pacing-council (C)
- [ ] 3 blinde Claude-dommere på `tools/test/feel/pacing-judge/K01–K06` (nøgle i `tools/test/feel-key/key.json`). K01–K06 skal gen-renderes først (fra før aliens). Mål: median "første gang jeg bemærkede noget" = min 15–30, intet før min 12.
- [ ] Feel-bot lang kørsel `--minutes 10`, 2–3 seeds, på deployet kode.

## Faste regler for næste runde
- Ingen bygger i main-checkout; B merger og deployer; QC af anden agent end byggeren; `tools/test/gates.json` røres ikke.
- Billeder → review-artifact Ja/Måske/Nej; tekst-tjeklister → skema i chatten.
- Ingen crossfades/easing/blur/idle-bob; alt på step-uret 10 fps; scene-skift gennem sort 200–500 ms; ingen canvas-filtre (bag nat-varianter).
- Fnugger = freaky retro-aliens i alle farver; baggrunde/rum/krom er godkendt retning og genrenderes ikke. Alt uden for Måneby-universet er ude (ingen skrivebord/elev07/Skole-IT).

## 8. QC-runde 4 (a0) – ikke verificeret
Se docs/TODO-QC.md (a0s egen status). Vigtigst: akt 3 fra jump → credits → ægte 2. gennemspilning er ALDRIG QC-et med mus; ægte nat-stol (falsk slutning → nat, ikke &nat); scope 1. klik. a0s rapporter/screenshots lå i a0s scratchpad og er væk ved genstart.
