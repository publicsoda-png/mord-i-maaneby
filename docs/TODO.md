# Måneby to do

Status 10-11-2026 ca. 03:00. Retningen "Regnskabet" er merget i master, live på
https://publicsoda-png.github.io/mord-i-maaneby/ og republiceret i demo-artifactet
(https://claude.ai/artifact/6sKCTCbDutE5ejoRGierRK). Alt herunder er PAUSET på Frederiks ord.

## Venter på Frederik
- [ ] Review af retningen, 15 skærme, Ja/Måske/Nej: https://claude.ai/artifact/3No1m5SAokVQpusGEsRrmp
- [ ] Review fra bygge-sessionen (sprites/polish): https://claude.ai/artifact/8E5bcHNr1sZix6oVEwkuUN

## Jump-motivet (kort 10 i reviewet) — council C6
- [ ] Higgsfield-renders assets/raw/jump/hall_1–5.png viser en lodden kugle, ikke Syv
      (Syv = celle 6 i assets/sprites/aliens.png, den grønne slim-alien). hall_6–8 med den
      grønne Syv er bestilt hos bygge-sessionen (samme pose/lys som hall_1).
- [ ] Når de ligger klar: retro-konvertér med `/usr/bin/python3 tools/art/retro.py <in> <out> --mode bg`,
      kør design-council C6 (kun Claude-linser, no_gpt + no_gemini, precheck ≥ 8 GB fri RAM)
      mod den procedurelle fallback (drawHall i src/scenes/acts.js).
- [ ] Vinder → assets/photos/jump_hall.png → `bash tools/deploy.sh` → artifact-republish.
- [ ] Commit eller ryd op i de ucommittede rå renders (assets/raw/jump/hall_*.png, assets/raw/bld/*_deco_1.png).

## Deploy/synk
- [ ] f0f0d22 (WP1: bagte nat-sprites i placeholder.js + main.js) er committet på master men
      endnu ikke deployet/republiceret — bygge-sessionen har sagt ja til at tage den med.
- [ ] portrait.js linje 19 bruger stadig et canvas-filter (fallback-portræt, lav prioritet, WP1).
- [ ] Worktree ~/Documents/mord-i-maaneby-retning (branch retning) kan fjernes når alt er i master
      (`git worktree remove`), retning er allerede merget.

## Kvalitet (fra QUALITY-PLAN/QC-POLISH-PLAN, ikke retning)
- [ ] WP1 palette-lås, WP8 nat, pacing-council (se memory mord-i-maaneby-qc-polish-nat).
- [ ] Gates G1–G3 og QC3 hos b8/a0-sessionerne; tools/test har lokale ændringer fra b8 i hovedcheckoutet.
