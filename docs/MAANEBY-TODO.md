# Måneby to do

Skrevet 10-11-2026 kl. ~06:05 af polish-sessionen (c8), da Frederik satte arbejdet på pause. Status: polish 6634f5f er merget og deployet (master 2bdf12b → 4a2f611 → f0f0d22). Det her er alt, der mangler, samlet ét sted. Ejer i parentes: B = bygge-session (~/Documents/mord-i-maaneby, merger og deployer), P = polish-session (branch `polish`, ~/Documents/mord-i-maaneby-polish), Q = QC-session b8, C = council, F = Frederik.

## 1. Venter på merge (P → B)
- [ ] **polish 9f29789** (oven på master 4a2f611): `tools/test/feel.mjs` ident-start uden skrivebord + field-o verificeres i klikøjeblikket; `src/scenes/hub.js` nat-stol-fix (helper.present/night sættes FØR showHelper, ellers sidder månemanden i stolen om natten – reproduceret med rent save). Rebases på nyeste master før merge.

## 2. Frederiks dom (F)
- [ ] Review-artifact "Måneby polish-natten": https://claude.ai/artifact/BPisAUgwqVJriXfHZgGWfT – Ja/Måske/Nej på 7 kort (belønningsanimation, skole, bageri, kridtgrube, landingsplads, feel-tal, hub dag/nat). Svar ligger i artifactets db, collection `dom`. Intet er "godkendt" før han har svaret.
- [ ] Spil den deployede version igennem selv (publicsoda-png.github.io/mord-i-maaneby) – ingen menneskelig playtest er kørt i nat.

## 3. Palette og nat (B, WP1/WP8 fra QC-POLISH-PLAN.md §2)
- [ ] A3 ≤256 farver i hub dag/nat (sidst målt 1564/963 på b2b63a0 – før sprites og nat-sprites; mål igen på f0f0d22).
- [ ] Resten af WP1: dialogboks rgba(0,0,0,.72) (style.css), setup-chips radial-gradient, natvagtens farver, `?dev&pal`-overlay kun hvis A3 stadig rød.
- [ ] WP8: ét oplyst vindue pr. bygget bygning om natten (indexed sprite).
- [ ] Renders der mangler (404 i hver feel-kørsel, p.t. procedurel fallback): `assets/bg/ice.png`, `scope.png`, `hall.png`, `title.png` + alle `*_nat.png` for baggrunde. Beslut: bestil renders eller behold fallback.

## 4. QC og gates (Q)
- [ ] Gates (polish.mjs/sync.mjs) på master efter merge af 9f29789 – med `MB_ROOT` på et checkout hvor #os-fixet er inde (ellers blå dev-shots).
- [ ] Runde 2: minispil ice/scope/light/hall + falseEnd/fever1/fever2/jump/morning/credits (ikke i gates.json-scenelisten – forslag til Frederik, filen røres ikke).
- [ ] A6: pling vs. pop-frame på buildSwap (`?dev&scene=hub&built=bakery:2`, `window.MB.fxLog`).
- [ ] DoD-skema §4 fuldt udfyldt med hash – i chatten til Frederik, ikke artifact.
- [ ] Kolonne C (blind side-om-side ≥7) er ikke kørt på nogen scene.

## 5. Pacing-council (C, QC-POLISH-PLAN §3 pkt. 5)
- [ ] 3 blinde Claude-dommere på `tools/test/feel/pacing-judge/K01–K06` (+manifest; nøgle i `tools/test/feel-key/key.json`). Kør først når nat-sprites/LUT er inde og wrongness-visuals kan ses. Mål: median "første gang jeg bemærkede noget" = min 15–30, intet før min 12. Kør med `no_gpt`+`no_gemini`.

## 6. Feel-bot (P)
- [ ] Lang kørsel `--minutes 10` med 2–3 seeds på deployet kode (hidtil 3–5 min, alle 8 mål grønne i 5 kørsler).
- [ ] `--pacing`-tilstand gen-renderes efter nat-sprites (K01–K06 er fra før aliens).
- [ ] Kendt begrænsning: botten læser kun DOM-mål + hand-cursor-raster 16×12; små hotspots kan overses.

## 7. Retning-sessionens egne åbne punkter (se docs/RETNING.md + DECISIONS.md)
- [ ] jump_hall.png efter council C6 (retning sagde "evt.").
- [ ] Lydcommit 48bd69f (assets/voice) er inde; tjek at alle nye replikker har voice-json (sync.mjs mund vs. stemme).

## Faste regler for næste runde
- Worktree-regel: ingen bygger i main-checkout; B merger og deployer; QC af anden agent end byggeren; `tools/test/gates.json` røres ikke.
- Billeder → review-artifact Ja/Måske/Nej; tekst-tjeklister → skema i chatten.
- Ingen crossfades/easing/blur/idle-bob; alt på step-uret 10 fps; scene-skift gennem sort 200–500 ms.
- Fnugger = freaky retro-aliens i alle farver; baggrunde/rum/krom er godkendt retning og genrenderes ikke.
