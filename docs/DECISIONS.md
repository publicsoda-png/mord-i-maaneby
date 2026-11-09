# Beslutninger (councils og faste valg)

## C1 + C4 — slutning og titel-afsløring (09-11-2026, plan-council, 3 Claude-linser, 4 agenter)
**Vinder: "Stille morgen"** (8,5) foran "Valget" (5,5) og "Sletningen" (4,5). Ingen vetoer.

Låst:
- Efter Logrummet løses 7 opgaver baglæns; hvert rigtigt svar fjerner én bygning (hårdt klip gennem sort) og musikken mister ét instrument (7 præ-renderede varianter: `byen_minus1..7`). Ved 12→11 står skærmen stille i 4 s.
- Dag-renders igen: B.'s skæve by ("Rådhuss"), 12 Fnugger, en lille med rød hue ved bænken. Hjælperen siger "Udmærket." og derefter aldrig mere (hjælp = tik). 2 min fri gang; hver bygning har én linje fra B.'s logfil. Credits efter inaktivitet eller klik på fyrværkeripladsen (én raket der ikke går af).
- Eksplicithed: hjælperen siger aldrig "minus" — "det ord, du lærte mig"; én gang i Logrummet: "Så det var ikke mord. Det var bare … mindre." Ugebrev + Skole-IT-popup bærer resten. Intet forklarer sammenhængen.
- Titel: cd og titelskærm hedder "Regn med Måneby" hele vejen. Ved overgangen falsk slutning → nat: bogstaverne i logoet falder og lander skævt (2 frames), ikke "M RD". Fuld titel kun i `document.title`/favicon ved nattens start (**kun GitHub Pages**, ikke artifact) og som sidste lille linje i credits.
- Studie: Krater Multimedie ApS, Valby (1999–2006) · "Ver. 1.3.63" · **"Afprøvet i 4.b"** (ikke "Godkendt til folkeskolen" — må ikke ligne en myndighed).

Rettelser fra dommerne, anvendt:
1. `beforeunload` kan ikke vise egen tekst → "Byen er ikke gemt. Luk alligevel?" vises som fake Win2000-dialog ved in-game Luk; browserens standardprompt er kun bagstopper.
2. Minus-tasten "tegner sig selv" bygger på den manglende 7-tast fra Kraterskolen (samme tastatur-UI).
3. Instrument-drop-varianter noteret i LYDPLAN §3.

Fra de tabende pakker tages med som eggs (ikke slutninger): Dymo-klistermærket afvist (titlen må ikke være elevens hærværk — det gør B. til gerningsmand); "aldrig svar på Fnugger"-slutningen forbliver 2. gennemspilnings belønning jf. PLAN §2.

## Faste valg uden council
- Referencemåling (session b8, 09-11): hubben i originalen står STILLE (0,02–0,8 % pixelændring/250 ms), alle sceneskift går gennem helt sort (0,2–0,5 s), ingen crossfades. → Ingen idle-bob på figurer; kun step-animationer; `goto()` klipper gennem sort.
- Lyd: `docs/LYDPLAN.md` (session a0) er grundlag for fase 3.
