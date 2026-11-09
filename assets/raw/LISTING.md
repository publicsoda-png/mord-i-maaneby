# assets/raw — stiltest-billeder (Higgsfield, Nano Banana Pro, Unlimited, 09-11-2026)

Format: `fil` — prompt-kortnavn — bemærkning. Alle 4:3 = 2400×1792 med mindre andet er nævnt.
Ingen prompts nævner eksisterende spil eller figurer; alle prompts bad om "no text".

## bg/ (baggrunde, 4:3) — GODKENDT som retning
- `hub_1.png` — bg:hub — måneslette med bænk; HAR indbagte stilladser/flag (bruges ikke som tom hub).
- `hub_2.png` — bg:hub — samme, flere bygninger indbagt.
- `hubempty_1.png` — bg:hubempty — UBRUGELIG: falsk UI-ramme + tekst i billedet.
- `hubempty_2.png` — bg:hubempty — REN tom måneslette (kratere, horisont, Jorden, bænk nederst midt-højre). Brug denne.
- `landing_1.png` / `landing_2.png` — bg:landing — landingsplads; begge rene.
- `bakery_1.png` / `bakery_2.png` — bg:bakery — bageri-interiør; begge rene.
- `school_1.png` / `school_2.png` — bg:school — klasselokale; begge rene.
- `quarry_1.png` / `quarry_2.png` — bg:quarry — stenbrud; begge rene.
- `light_1.png` — bg:light — fyrtårn; HAR falsk UI-ramme + tekst (ubrugelig).
- `light_2.png` — bg:light — fyrtårn; ren.
- Natversioner af hub/skole blev IKKE genereret (ikke bedt om igen efter omprioriteringen).

## bld/ (bygningstrin, 2:3, #00FF00, jordlinje i bund)
- `pad_scaffold_1.png` — bld:pad-scaffold — rent; betonplade med stillads.
- `pad_plain_1.png` — bld:pad-plain — rent (kuppel-bygning på pad).
- `pad_deco_1.png` — bld:pad-deco — rent, flag + lyskæder.
- `dome_scaffold_1.png` — bld:dome-scaffold — rent (sen rendering af tidligere submit).
- `dome_plain_1.png` — bld:dome-plain — rent, hvid kuppel.
- `dome_deco_1.png` — bld:dome-deco — rent, let grøn-støj øverst (keyer fint).
- `tower_scaffold_1.png` — bld:tower-scaffold — rent.
- `tower_plain_1.png` — bld:tower-plain — rent, hvid raket-tårn.
- `tower_deco_1.png` — bld:tower-deco — rent.
- `box_scaffold_1.png` — bld:box-scaffold (formentlig; sen rendering, kubisk stillads på pad) — rent.
- `box_plain_1.png` — bld:box-plain — cel-shaded sorte outlines (stilbrud; brug _2).
- `box_plain_2.png` — bld:box-plain — rent, Phong.
- `box_deco_1.png` — bld:box-deco — rent.
- `pit_scaffold_1.png` — bld:pit-scaffold — rent (løst rækværk svæver øverst — beskær).
- `pit_plain_1.png` — bld:pit-plain — rent.
- `pit_deco_1.png` — bld:pit-deco (genkørsel) — blå rund grube med flag + lyskæder; en løs dublet-talje svæver øverst (beskær væk, baggrund er ren grøn).
- `rejected/hall_deco_1.png` — bld:hall-deco — AFVIST: grå baggrund + andre bygninger i billedet.
- `hall_deco_1.png` — bld:hall-deco (genkørsel, "ONLY this single building … green edge to edge") — rent, lang rød hal med flag/lys, isometrisk.
- `hall_scaffold_1.png` — bld:hall-scaffold — rent.
- `hall_plain_1.png` — bld:hall-plain — rent.

## helper/ (hjælpere)
- `moonman_1.png` / `moonman_2.png` — helper:moonman — 4:3 enkeltfigur, tidlige tests.
- `cartographer_1.png` / `cartographer_2.png` — helper:cartographer — 4:3 enkeltfigur.
- `robot_1.png` / `robot_2.png` — helper:robot — 4:3 enkeltfigur.
- `rockgran_1.png` — helper:rockgran — UBRUGELIG: liggende format + skyggeplade.
- `rockgran_2.png` — helper:rockgran — dubleret figur.
- `moonman_sheet_1.png` / `_2.png` — hsheet:moonman — 16:9, 4 mundframes på grøn; frame 1 klippet i venstre kant.
- `moonman_sheet_3.png` — hsheet:moonman — rammelinjer + gradient (dårligere).
- `cartographer_sheet_1.png` / `_2.png` — hsheet:cartographer — hvide celle-baggrunde (kan ikke keyes).
- `cartographer_sheet_3.png` — hsheet:cartographer — rent grøn, 4 frames, skaldet mand med rulle. Brug denne.
- `robot_sheet_1.png` — hsheet:robot — rent grøn, 4 mundframes.
- `robot_sheet_2.png` — hsheet:robot — rammelinjer (dårligere).
- `robot_sheet_3.png` — hsheet:robot — rent grøn, 4 frames.
- `rockgran_sheet_1.png` — hsheet:rockgran — tynde mørke rammelinjer, lanterne.
- `rockgran_sheet_2.png` — hsheet:rockgran — rent grøn, 4 frames. Brug denne.
- `rockgran_sheet_3.png` — hsheet:rockgran — 2 rækker × 4 (8 frames), rent grøn.
- `chair_empty_1.png` / `chair_empty_2.png` — chair (image-edit af moonman_sheet_2 frame 2) — 9:16, tom gyngestol på grøn, samme vinkel; begge rene.

## aliens/ (fnug = retro-aliens, 1:1, 3×3)
- `aliens_1.png` — aliens:1 — 9 arter, mønstre (prikker/striber/tern); mørke gitterlinjer mellem celler.
- `aliens_2.png` — aliens:2 — 9 arter, øjne/antenner-varianter; rene celler.
- `aliens_3.png` — aliens:3 — 9 arter, skæve kroppe; rene celler.
- `contact.png` — (koordinators kontaktark, ikke genereret her)

## fnug/ — FRAVALGT af Frederik (gule hjelm-æg virker ikke)
- `frizzy_1.png`, `frizzy_2.png`, `plastic_1.png`, `plastic_2.png`, `scarf_1.png`, `scarf_2.png` — fnug:* — 4:3 enkeltfigurer.
- `frizzy_sheet_front_1..3.png`, `frizzy_sheet_back_1..3.png`, `plastic_sheet_front_1.png`, `plastic_sheet_back_1.png` — fsheet:* — 21:9, mørke rammekanter. Fravalgt.

## jump/ (jump scares)
- `jump_1.png` / `jump_2.png` / `jump_3.png` — jump2 — blyantstegning af halvmåne-gammel mand med ét stort øje; jump_2 ligger på træbord (dårligere).
- `jump_smile_1.png` / `jump_smile_2.png` — jump — tidlig smil-tegning (oprindelig batch F).
- `rejected/hall_1.png` — hall:1 (første prompt) — AFVIST: "ADVENTURE TOWN"-skilt + tegnet musepil.
- `hall_1.png` — hall:1 + "no UI/title bar/cursor/text" — variant 1 halvt indemuret, blå uldfnug i stenvæg, rent, ingen UI.
- `hall_2.png` — hall:2 + no-UI — variant 2 kun hovedet ud, rødblå fnug, rent.
- `hall_3.png` — hall:3 + no-UI — variant 3 (prompt "næsten fri"), lilla fnug med varmt dørlys fra venstre; rent — men væsnet sidder stadig i væggen.
- `hall_4.png` — hall:2 (første prompt, uden no-UI-sætning) — kun hovedet, lyserød fnug, rent (ingen UI opstod).
- `hall_5.png` — hall:3 (første prompt) — næsten fri, orange fnug med krop synlig; rent, bedste "fri"-variant.

## photo/ og photos/
- `photo/photo_1.png` — photo — 2005-kompaktkamera-stil; ren.
- `photo/photo_2.png` — photo — har kameradato-stempel.
- `photos/edb_1.png` / `edb_2.png` — edb — dansk skole-edb-lokale 2005; rene.
- `photos/edb_3.png` — edb — kameradato-stempel.

## Fejlede/manglende
- Første pit-deco-submit (04:23 UTC) kom aldrig i galleriet (droppet af serveren); genkørsel lykkedes.
- Natversioner (hub/skole) ikke genereret.
- Ingen credits brugt: alle 129 submits var på UNLIMITED.

## title/
- `title_1.png` / `title_2.png` — title — titelskærm-baggrund uden tekst; begge rene.
