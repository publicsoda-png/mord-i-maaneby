# Beslutninger (councils og faste valg)

## C1 + C4 — slutning og titel-afsløring (09-11-2026, plan-council, 3 Claude-linser, 4 agenter)
**Vinder: "Stille morgen"** (8,5) foran "Valget" (5,5) og "Sletningen" (4,5). Ingen vetoer. *(Tillæg 09-11: B./skole-sporet i dette afsnit er udgået med C7 — se C7 "Tillæg til C1/C4" for den gældende morgen, titel og 2. gennemspilning.)*

Låst:
- Efter Logrummet løses 7 opgaver baglæns; hvert rigtigt svar fjerner én bygning (hårdt klip gennem sort) og musikken mister ét instrument (7 præ-renderede varianter: `byen_minus1..7`). Ved 12→11 står skærmen stille i 4 s.
- Dag-renders igen: B.'s skæve by ("Rådhuss"), 12 Fnugger, en lille med rød hue ved bænken. Hjælperen siger "Udmærket." og derefter aldrig mere (hjælp = tik). 2 min fri gang; hver bygning har én linje fra B.'s logfil. Credits efter inaktivitet eller klik på fyrværkeripladsen (én raket der ikke går af).
- Eksplicithed: hjælperen siger aldrig "minus" — "det ord, du lærte mig"; én gang i Logrummet: "Så det var ikke mord. Det var bare … mindre." Resten bæres af spor inde i Måneby (fra 09-11: "Rådhuset melder"-boksen + Regnskabets 7 lag, se C7). Intet forklarer sammenhængen.
- Titel: cd og titelskærm hedder "Regn med Måneby" hele vejen. Ved overgangen falsk slutning → nat: bogstaverne i logoet falder og lander skævt (2 frames), ikke "M RD". Fuld titel kun i `document.title`/favicon ved nattens start (**kun GitHub Pages**, ikke artifact) og som sidste lille linje i credits.
- Studie: Krater Multimedie ApS, Valby (1999–2006) · "Ver. 1.3.63" · **"Afprøvet i 4.b"** (ikke "Godkendt til folkeskolen" — må ikke ligne en myndighed).

Rettelser fra dommerne, anvendt:
1. `beforeunload` kan ikke vise egen tekst → "Byen er ikke gemt. Luk alligevel?" vises som fake Win2000-dialog ved in-game Luk; browserens standardprompt er kun bagstopper.
2. Minus-tasten "tegner sig selv" bygger på den manglende 7-tast fra Kraterskolen (samme tastatur-UI).
3. Instrument-drop-varianter noteret i LYDPLAN §3.

Fra de tabende pakker tages med som eggs (ikke slutninger): Dymo-klistermærket afvist (titlen må ikke være elevens hærværk — det gør B. til gerningsmand); "aldrig svar på Fnugger"-slutningen forbliver 2. gennemspilnings belønning jf. PLAN §2.

## C7 — Retning: alt inde i Måneby (09-11-2026, plan-council, 3 linser isolation/dramaturgi/gennemførlighed, 7 agenter)
**Frederiks afgørelse** (ordret): *"mord i måneby burde bare være hele spillet og hele historien, ikke alt muligt som foregår i spillerens rigtige univers."* Tre valg: (1) Win2000-rammen fjernes helt, (2) intet fra spillerens verden (klokke, ugedag, første navn, browser-stemme, sprog, vindue, kalender), (3) kernen beholdes — hjælperen kender kun plus/gange og kalder én-mindre for mord — men den manglende er en Måneby-figur med in-universe årsag. Kontrakt: `docs/RETNING.md`.

**Vinder: "Regnskabet"** (fable) **8,00** > "Syv tæller ned" (opus) 7,83 > "Hullet under Rådhuset" (sonnet) 6,00. Ingen vetoer. Tre blindede koncepter, Opus-chair.

**Kernen:** Fnuggerne hedder det tal, hjælperen talte dem til (Én … Tolv). Dag 20 skulle Rådhuset tælle for ham; **Syv** sad på grunden dag 31, og dag 32 blev hun talt med i sidste lag ("143 sten og Syv, lagt sammen: 144") — hun blev **lagt sammen**. 11 på sletten + 1 Rådhus = 12; regnskabet stemmer, og alligevel mangler én. Hjælperen har i 40 dage ledt efter en morder i et regnskab han selv har ført og ikke kan læse (det kræver minus). Spilleren er vidnet, der kan regne baglæns. Krater Multimedie ApS = død krom (ident, titelfod, credits), bærer aldrig historie.

**Chairens 4 rettelser (anvendt):**
1. Setup: "Hvilken klasse går du i?" → **"Byggetrin 1–6"**; 7× klik på 6 → "Byggetrin 7" (kun opgaver med svaret 7).
2. Rå-render (min 47) skal være **tvetydig**: 12 flade grå silhuetter, den tolvte står blot forkert, halvt inde i Rådhusets volumen som z-sorteringsfejl. Det entydige billede (Fnug i muren) gemmes til jump scaren.
3. Jump-billedet laves **procedurelt først** i acts.js (mørk sal, søjler, Fnug-form i bagvæg med hjelm på skrå, åbne øjne, smil); render-council C6 senere.
4. Regnskabets 7 lag **≤56 tegn** pr. linje (logroom tegner 12 px mono i 440 px).

**6 podninger fra taberne (anvendt):**
- Hjælperen tæller højt i 30–40-fasen og springer 7 over (`taeller_hoejt`, min 35).
- Regnskabets lag skrives, så tallet i linjen ER resultatet af lagets opgave 12−n (11, 10, 9 … 5).
- Replikker: "Jeg har mistænkt bageren. Og isværket. Og kridtgruben. Ikke dig. Du kom først bagefter." (68–78) og "Vi byggede ovenpå. Det plejer at hjælpe." (Rådhus-åbning).
- `SAVE_VERSION = 2` + `meta` ryddes ved versionsskift (felterne `firstName, names, peeked, deletedLog` fjernes), så gamle flag ikke lækker.
- fever2 "Hjelmene" får 12/11-strukturen ("12 hjelme på række, 11 har nogen under sig").
- Kraterbageriet bager 12 boller hver morgen, én bliver til overs (morgen-linje + bageri-detalje).

**Udgår** (udgået med C7, må ikke optræde i src/ — grep-gate i RETNING §5 og flow.mjs):
- Win2000-skrivebord, cd-ikon, "Indsæt CD 2", Shockwave-cd-krom, scenen `desktop` (→ ny scene `ident`).
- elev07 / "B." / elevlogfiler (`elev01.txt …`), Skole-IT / Teknisk Forvaltning, edb-lokalet, 2005-skolen, SFO-tiden 15:40, ugebrevet, Jylland, pedellen, 17-11-2005-fotoet, "Måneby i Verden"-engelsklinjen.
- Ægte ugedag/klokke (`getHours/getDay/getMonth`), første navn fra sidst (`meta.firstName/names`), `speechSynthesis`, `navigator.language`, vinduesstørrelse-egg, kalender-eggs (sankthans/december), `document.title`/favicon-drift, `CD2`-tastekode, Fake-Stifinder "Logs", volume_dead.
- Wrongness-id'er: `name_B, english_line, cd2, knows_time, photo1, skole_it, tts_leak, first_name, volume_dead` → erstattet af `name_syv, tretten, fuld, byen_taeller, raa_render, raadhus_melder, stemme_rum` (+ nye `taeller_hoejt`, `peeked` kræver `meta.qClicks>=3`).
- Stemmeklip: `name_b, hjaelp400 (gammel), pedel1, pedel2, knows_time`.

**Tillæg til C1/C4 (overstyrer ovenstående hvor de strider):**
- **"Afprøvet i 4.b" udgår** (skole-reference). Titelfod/credits: Krater Multimedie ApS, Valby (1999–2006) · "Ver. 1.3.63" — ingen klasse, ingen myndighed.
- Titlen **"Mord i Måneby" vises kun som sidste lille credits-linje**. Ingen `document.title`-/favicon-drift, heller ikke på Pages. Logo-bogstaverne der falder ved falsk slutning → nat beholdes.
- **Krater Multimedie = død krom.** Ident (3 s chime), titelfod, credits-navne. Aldrig historie, aldrig popup fra "studiet".
- Stille morgen: byen som **dag 31** (alle bygninger trin 1, Rådhuset kun grund, Syv på grunden, 12 på sletten, bænken tilbage) i stedet for "B.'s skæve by/Rådhuss". BLINES er byens egne tællelinjer, ikke logfil-linjer. "Udmærket." og aldrig mere beholdes. Ugebrev + Skole-IT-popup erstattes af "Rådhuset melder"-boksen og Regnskabets 7 lag.
- **2. gennemspilning er dag** (ikke nat): minus-tast fra start, 7-tast tilbage, Rådhuset klikbart fra min 0, "Du har været her før. Det kan jeg tælle." Ingen navne-hukommelse.
- **Skjult slutning `trueEnd`** (`meta.ending = 'tolv'`): svar aldrig på "Hvor mange Fnugger bor i Måneby?" → fyrværkeri med 12, rulletekst med alle tolv, Byggebevis "Fnugger: 12 (12)", ingen nat. Erstatter "B.'s navn på Ctrl+P-printet".
- Fever II "edb-lokalet" → **"Hjelmene"** (sletten om natten, SE/GÅ/SLUK LYSET). Fever IV pedel på rigtig tid → **Natvagten Fnuggen Elleve** efter 30 s spilletid om natten, kridt-7 på Rådhusdøren, ingen replik.
- Jump scare: blyantstegning på ternet papir → **Rådhus-interiør med Fnug i mørtlen** (procedurel; render kun hvis `assets/photos/jump_hall.png` findes).

## Faste valg uden council
- Referencemåling (session b8, 09-11): hubben i originalen står STILLE (0,02–0,8 % pixelændring/250 ms), alle sceneskift går gennem helt sort (0,2–0,5 s), ingen crossfades. → Ingen idle-bob på figurer; kun step-animationer; `goto()` klipper gennem sort.
- Lyd: `docs/LYDPLAN.md` (session a0) er grundlag for fase 3.

## Udgivelse 10-11-2026 (nat, uden Frederik — ordre: kør alle faser igennem)
- Fuld version LIVE: https://publicsoda-png.github.io/mord-i-maaneby/ (repo publicsoda-png/mord-i-maaneby, gh-pages = dist/ via `tools/deploy.sh`).
- Akt-1-demo som artifact: https://claude.ai/artifact/6sKCTCbDutE5ejoRGierRK — `build.mjs --artifact` sætter `window.MB_DEMO`, så den falske slutning bliver demoens slutning med link til Pages. (`document.title`-drift udgik 09-11 med C7: titlen vises kun som sidste credits-linje.)
- Render-baggrunde: `assets/bg/<navn>.png` (PNG8, retro.py) vinder over procedurel placeholder; `<navn>_nat.png` hvis den findes, ellers mørklagt dagsrender. Hub-renders med indbagte stilladser dur ikke (bygninger tegnes af koden på PLOTS) → tom slette bestilt.
- Udeladt med vilje: volumen-slider (ingen lyd-UI i spillet → volume_dead-eventet udgår), Comic Neue ikke linket (systemets Comic Sans/Chalkboard). (Eventet med ægte ugedag udgik 09-11 med C7 → `byen_taeller`.)
