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

## 6. QC og gates (Q)
- [ ] b8's gates G1–G3 (polish.mjs/sync.mjs) på master efter 9f29789; `MB_ROOT` på et checkout med #os-fixet. tools/test har lokale ændringer fra b8 i hovedcheckoutet – tjek `git status` før commit.
- [ ] Runde 2: minispil ice/scope/light/hall + falseEnd/fever1/fever2/jump/morning/credits (ikke i gates.json – forslag til Frederik, filen røres ikke).
- [ ] A6: pling vs. pop-frame på buildSwap (`?dev&scene=hub&built=bakery:2`, `window.MB.fxLog`).
- [ ] DoD-skema §4 udfyldt med hash – i chatten, ikke artifact. Kolonne C (blind side-om-side ≥7) ikke kørt.
- [ ] sync.mjs: alle nye replikker har voice-json (lydcommit 48bd69f).

## 7. Pacing-council (C)
- [ ] 3 blinde Claude-dommere på `tools/test/feel/pacing-judge/K01–K06` (nøgle i `tools/test/feel-key/key.json`). K01–K06 skal gen-renderes først (fra før aliens). Mål: median "første gang jeg bemærkede noget" = min 15–30, intet før min 12.
- [ ] Feel-bot lang kørsel `--minutes 10`, 2–3 seeds, på deployet kode.

## Faste regler for næste runde
- Ingen bygger i main-checkout; B merger og deployer; QC af anden agent end byggeren; `tools/test/gates.json` røres ikke.
- Billeder → review-artifact Ja/Måske/Nej; tekst-tjeklister → skema i chatten.
- Ingen crossfades/easing/blur/idle-bob; alt på step-uret 10 fps; scene-skift gennem sort 200–500 ms; ingen canvas-filtre (bag nat-varianter).
- Fnugger = freaky retro-aliens i alle farver; baggrunde/rum/krom er godkendt retning og genrenderes ikke. Alt uden for Måneby-universet er ude (ingen skrivebord/elev07/Skole-IT).
