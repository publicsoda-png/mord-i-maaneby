# TODO — QC (a0, sat på pause af Frederik 10-11-2026 ca. 07:00)

Status for QC-sporet (QUALITY-PLAN §3, QC af anden agent end bygge-agenten). Tre runder kørt på live, fjerde afbrudt.
Rapporter/screenshots lå i a0's scratchpad (`…/153b977c…/scratchpad/qc-shots`, `qc2/`, `qc3/`) — kopiér dem hertil hvis de skal bevares.

## Gjort (alt sendt til 94079/79879 og rettet, medmindre andet står)
- Lyd: dobbelt-dæmpning, nat_kridt, loop-sømme, jump-gate, visibility, ?min= → `lyd-qc` merget 8a29413. Lyd-smoke på 9270c40 grøn; 3 klip renormaliseret 48bd69f.
- Historie/tekst/IP: 4 BLOKERER + 9 BØR rettet b23b424. IP-veto: ingen fund.
- Spilbarhed 1: døde DOM-knapper + say()-hæng rettet 82ae23f (tools/test/mouse.mjs).
- Spilbarhed 2: Tilbage-race, hjælp-hotspot over Kraterskolen, madpakke-fallthrough, resetSave ved setup → rettet på `retning`, merget 9270c40.
- Council C2 (hjælper): vinder moonman_sheet_2 (7,83) → helper.png + tom gyngestol (WP8).
- Spilbarhed 3 på 2bdf12b: 0 BLOKERER. Krom 9, sammenhæng 9 (0 rester af gammelt koncept), Fnug-sprites/buildSwap OK.

## Mangler — ikke verificeret af QC
1. **Akt 3 fra jump og frem** (QC4 afbrudt): jump scare fyrer? master-lyd gated til næste klik/tast i praksis? Nedenunder/Logrummet 7 lag med mus+tastatur, byen_minus1..7 hørbare, Stille morgen-timing (ventilation ud → 4 s → hub-tema −8 dB), credits-rul + Luk klikbar, **ægte 2. gennemspilning** (flags nulstillet, natten starter rent). Dev-vej: `?dev&scene=hub&nat&min=65` + `MB.save.seen` forudfyldt (wrongness.js:58-59 kræver silence_counter set).
2. **Ægte nat-hub** (ikke `&nat`): står gyngestolen tom? Ved `?dev&scene=hub&min=58&nat` sad månemanden i stolen (qc3/p7-04). helper_chair_nat/helper_nat var 404 på live (f0f0d22 ikke deployet på det tidspunkt).
3. **scope** dag+nat: 1. klik på rigtig stjerne registreres ikke, 2. gør; bagefter "Ikke den stjerne" på korrekt felt (scope.js:122-128, `local()` vs gx0=113/cw=62/ch=54). Kræver et menneske-klik.
4. **ui_bygning_op** hørbarhed på swap-framen (kun request logget, ikke lyd målt). Læben i hjælper-frame 1 (lukket mund) læsbar i 640×480? (council-rettelse 3, ikke anvendt).
5. **WP7 pacing-council** (QC-POLISH-PLAN §3 pkt. 5): kontaktark fra `?min=` 0–30 i 5 spring, 3 blinde dommere "ved hvilket billede bemærkede du først noget?" — mål median min 15–30, intet før 12. Ikke startet (feel.mjs manglede).
6. **Polish-DoD-skema** (QC-POLISH-PLAN §4) ikke udfyldt. Regression på ren klon (WP9) ikke kørt af QC.
7. Småting sendt men ikke bekræftet rettet: `?reset` kører efter loadState (main.js:17/24); quarry dag ok-replik oven i wrong-replik (task.js:50/62); hub_back-replik sluges af hvert deniable event ved min 45 (hub.js:62); `?min=` forudfylder ikke `seen`; hall nat viser "Fnugger: 12" ved svar 11; 14 bg-404 pr. load (prober, forsvinder med renders).
8. Mindre lyd-ting fra lyd-dommeren, ikke gjort: mg_*-lydkort i minispil (c8/G4), ur-tick til 'telefon' i Logrummet verificeret i praksis, LYDPLAN §5 dag-brum-niveau (dommerne uenige, beholdt).
