# RETNING 09-11-2026 — "Regnskabet": alt inde i Måneby

Frederiks afgørelse: intet uhyggeligt må komme fra figurer eller ting uden for Måneby-universet. Ingen elev07/B., ingen Skole-IT, intet edb-lokale, intet Win2000-skrivebord, ingen cd-ikon, intet fra spillerens verden (ægte klokke/ugedag, første navn, browser-TTS, sprog, vinduesstørrelse, kalender, pedel på rigtig tid). Krater Multimedie ApS er ren død krom (ident, titelfod, credits) og bærer aldrig historie. Council 09-11 (7 agenter): koncept "Regnskabet" vandt 8,00. Denne fil er kontrakten for bygget på branch `retning`. Planen i fuld længde: `~/.claude/plans/encapsulated-tinkering-pond.md`.

## 1. Historien (siges aldrig ligeud)
Fnuggerne hedder det tal, hjælperen talte dem til (Én, To, … Tolv). Måneby har én regel: *vi trækker ikke fra*. Dag 20 besluttede hjælperen, at Rådhuset skulle tælle for ham. **Syv** sad på Rådhusets grund hele dag 31; dag 32 talte han "143 sten og Syv, lagt sammen: 144", og Rådhuset blev færdigt. Hun blev *lagt sammen*. Siden står der 11 på sletten og 12 på skiltet — og begge tal er rigtige (11 Fnugger + 1 Rådhus = 12). Hjælperen har ledt efter en morder i 40 dage i et regnskab han selv har ført, og han kan ikke læse det, for det kræver minus. Han har mistænkt bageren, isværket og kridtgruben. Spilleren er vidnet, der kan regne baglæns. Hjertet: bogføringens melankoli — alt stemmer, og alligevel mangler én. Bageriet bager 12 boller hver morgen; én bliver til overs.

Hårde regler: H1 intet uden for Måneby · H2 spilleren er aldrig morder · H3 ingen Bitfrost/Endacopia-kopi · H4 præcis én jump scare · H5 æra-regler (QUALITY-PLAN) · H6 hjælperen siger aldrig "minus"; nærmest: "Så det var ikke mord. Det var bare … mindre."

## 2. Beats (ændringer; alt andet i PLAN.md §2 står)
| Min | Beat |
|---|---|
| 0–2 | Sort → **ident** (Krater Multimedie-chime 3 s, egen GM) → loader "Henter Måneby…" m. ryk → "Klik for at begynde" (= ensureAudio) → **title** → **setup** (tomt navnefelt; "Byggetrin 1–6"; 7× klik på 6 → "Byggetrin 7" = kun opgaver med svaret 7). Intet skrivebord/cd/computer. |
| 2 | Ny intro-linje efter intro3: L.intro4 "Fnuggerne hedder det, de blev talt til. Én, To, Tre … og så videre. Det er nemmest." |
| 18 | `name_syv`: "Flot, Syv." (hub-HUD viser "Syv" i stedet for navnet, som name_B gjorde) |
| 17–28 | Kraterskolens opslagstavle (school.js hint-tekst): "Dagens tælling: 12" |
| 35 | `taeller_hoejt` (deniable): hjælperen tæller højt på hubben og springer 7 over: "Én, to, tre, fire, fem, seks … otte, ni, ti, elleve, tolv. Det passer." |
| 40 | `fuld` (shock, erstatter cd2): program-dialog "Måneby er fuld. Fjern noget, og tryk Gentag." [Gentag][Annuller], 10 s ulukkelig; Gentag → bzzt + paletteFlash; derefter replik "Fjerne? Det gør vi ikke." |
| 43 | `director_err` beholdes (Handler not defined #traekFra) |
| 44 | `tretten` (erstatter english_line): hub_back-linjen "Fnuggerne venter på dig. Alle tretten." (han kan kun tælle op) |
| 45 | `byen_taeller` (erstatter knows_time): dynamisk tekst uden stemme: "Du har klikket på mig {help} gange. Svaret forkert {wrong} gange. Kigget på Rådhuset {q} gange. Jeg lægger det sammen: {sum}." |
| 47 | `raa_render` (shock, erstatter photo1): 2,6 s rå render — hub-baggrunden gennem grå flat-LUT uden himmel, 12 flade grå Fnug-silhuetter, den tolvte står halvt inde i Rådhusets volumen som z-sorteringsfejl. INGEN gennemsigtig kasse, ingen tydelig Fnug-i-mur (det gemmes til jump). |
| 48 | `peeked`: requires `meta.qClicks >= 3` ("?"-klik på Rådhuset) — én Fnug kigger i kameraet |
| 50–55 | falseEnd: rulletekst = Krater-navne + "Fnuggerne: Én, To, Tre, Fire, Fem, Seks, Otte, Ni, Ti, Elleve, Tolv" + "Bygmester: {navn}". Intet Skole-IT, intet "B." |
| 55–65 | Nat. fever2 = **"Hjelmene"** (scene-id `fever2` beholdes): "> du står på sletten. det er nat." / "> ved bageriet står 12 hjelme på række. 11 har nogen under sig." SE → "> den tomme hjelm er bulet. den er for lille." / "> på bageriets disk ligger én bolle. den er kold." GÅ → "> rådhuset er låst. der er ikke mere at lægge til." SLUK LYSET → sort 3 s → hub med ét vindue tændt (Rådhusets). **Natvagt**: Fnuggen Elleve med lygte efter 30 s inaktivitet (spilletid, `this.idleT`) om natten: går til Rådhusdøren, lygtekeglen viser et kridt-7 på døren. Ingen replik. Erstatter pedellen. |
| 58 | `night_cursor` beholdes |
| 65–68 | `silence_counter` beholdes. Herefter er Rådhusets "?" en **dør** (`save.flags.hall_door = true`) |
| 68 | `jump`: klik på døren (eller eventet) → ≤300 ms Rådhus-interiør: mørk sal med søjler, i bagvæggen en Fnug presset ind i mørtlen, bulet hjelm på skrå, to åbne øjne, det sædvanlige lille smil. Procedurel tegning i acts.js er standard; `assets/raw/jump/`-render bruges kun hvis `assets/photos/jump_hall.png` findes. Derefter sort til næste klik (audio.jump-gate). |
| 68–78 | afterJump: "Der mangler én. Nogen har … jeg kender ikke ordet." → "Vi byggede ovenpå. Det plejer at hjælpe." → `raadhus_melder` (erstatter skole_it): program-boks "Rådhuset melder" / "12 bor i Måneby.\n11 står på sletten.\nByen stemmer." [Luk] noop, [OK] — bærer det normale ding_info. `stemme_rum` (erstatter tts_leak): hjælperens næste linje afspilles med `audio.room('tomt')` + replik "Jeg har mistænkt bageren. Og isværket. Og kridtgruben. Ikke dig. Du kom først bagefter." Fyrtårn S-Y-V, Rådhus-skyder → 11 → "Ja. Elleve." → fever1 (uændret) → "Der er ét sted til. Nedenunder." |
| 78–84 | Valget uændret. Knap på hubben hedder **"Nedenunder"** → scene `logroom` (id beholdes), overskrift **"Regnskabet"**, rummet kaldes Tællerummet i tekst. |
| 84–88 | morning: byen som dag 31 — alle bygninger trin 1, Rådhuset kun grund (stage 0 + grund-rektangel), **Syv** sidder på grunden (mindre, bulet hjelm), 12 Fnugger på sletten, bænken er tilbage. "Udmærket." og aldrig mere. BLINES: landing "12 kasser. Alle talt." · bakery "12 boller. Én til hver." · ice "Isen holder." · scope "Man kan se hele sletten herfra." · school "Dagens tælling: 12" · quarry "Man må gerne grave." · hall "Ikke endnu." · light "Lyset er til at finde hjem efter." |
| 88–90 | credits: Krater-navne (ingen "Afprøvet i 4.b", intet Skole-IT), "Tak til Fnuggerne: Én, To, Tre, Fire, Fem, Seks, Syv, Otte, Ni, Ti, Elleve, Tolv", disclaimer-linjer beholdes, sidste lille linje "Mord i Måneby". |

**Regnskabets 7 lag** (LOG i acts.js, øverst nyest, ≤56 tegn, tallet = 12−n for lag n):
1. `Dag 40. 11 på sletten. Rådhuset: 1. Lagt sammen: 12.`
2. `Dag 33. Rådhuset færdigt. 10 sov. Døren låst.`
3. `Dag 32. Sidste lag. 9 bar sten. Syv talt med: 144.`
4. `Dag 31. 8 byggede. Syv sad på grunden. Blev siddende.`
5. `Dag 20. 7 lagde grund. Rådhuset skal tælle for mig.`
6. `Dag 7. 6 navne. Så talte jeg igen: Seks, Syv, Otte.`
7. `Dag 1. 5 landede først. Så 7 til. Vi trækker ikke fra.`

**2. gennemspilning (byen husker — `meta.ending` sat):** starter som DAG (ikke nat). Minus-tast på Kraterskolens stentastatur fra start og 7-tasten tilbage (`seven_missing` kræver `!meta.ending`). Rådhuset klikbart fra min 0. Første hub-linje: "Du har været her før. Det kan jeg tælle." (ingen navne-hukommelse). **Skjult slutning** `trueEnd`: gennemfør uden nogensinde at svare på Rådhusets "Hvor mange Fnugger bor i Måneby?" (flag `hall_answer` aldrig sat) → fyrværkeri med 12 på sletten, rulletekst med alle tolv, Byggebevis "Fnugger: 12 (12)", ingen nat, direkte credits. `meta.ending = 'tolv'`.

## 3. Navne (kontrakt — brug præcis disse)
Wrongness-id'er: behold `counter_11, klaret_klaret, fnug_fringe, bench_gone, save_lies, progress_back, director_err, false_end, night_cursor, silence_counter, jump`. Nye/omdøbte: `name_syv` (18), `taeller_hoejt` (35), `fuld` (40, shock), `tretten` (44), `byen_taeller` (45), `raa_render` (47, shock), `peeked` (48, requires meta.qClicks>=3), `raadhus_melder` (69), `stemme_rum` (70). Slettet: `name_B, english_line, cd2, knows_time, photo1, skole_it, tts_leak, first_name, volume_dead`.

gameApi (game.js): `byenTaeller()`, `raaRender()`, `fuld()`, `raadhusMelder()`, `directorError()`, `falseEnding()`, `cursorDrift()`, `silence()`, `jumpScare()`, `flagText(id)`, `hud`, `musicDelay`.

save.flags: `name_syv, taeller_hoejt_said, fuld_said, tretten, tretten_said, byen_taeller, raa_render_done, peeked, hall_door, hall_open, hall_answer, stemme_rum, stemme_rum_said, fever1, fever2, fever_madpakke, log_open, minusDrawn, morning, jumped, phone, silence_on, cursor_drift, musicDelayMs, fnugShown, klaret_klaret, fnug_fringe, bench_gone, save_lies, progress_back`. Nye tællere: `save.wrongCount` (forkerte svar i minispil; task.js/engine onWrong), `meta.qClicks` ("?"-klik på låst Rådhus), `meta.helpClicks` (findes).

state.js: `SAVE_VERSION = 2`; ved ældre/ingen version i gemt save ELLER meta → ryd meta-felterne `firstName, names, peeked, deletedLog` (fjern helt fra meta-objektet) og nulstil save. `meta` = `{ starts, lastSeen, resets, helpClicks, qClicks, ending, finishedTowns, version }`.

Scener: `ident` (ny, boot.js) → `title` → `setup` → `hub`. `desktop` findes ikke mere; alle `goto('desktop')` → `goto('title')`. Scene-id'er `fever1, fever2, jump, logroom, morning, credits, falseEnd` beholdes (mix.js PHASES er låst til dem). Ny scene `trueEnd` (acts.js).

Hjælper-replikker (eksakt tekst = voicemap-nøgle). **Beholdes (32 klip):** intro1–3, hub_first, hub_back1–3, help1–3, landing_intro, landing_ok, landing_ok_kk, wrong1–2, sticker, fyrv_venter, ikke_endnu, gemt, gemt_lyver, hvor_mange, godt_faerre, et_sted_til, ja_hende, grav, det_tegn, faerre_ja, ikke_mord, mangler_en, udmaerket, videre. **Slettes (5 klip + filer):** name_b, hjaelp400, pedel1, pedel2, knows_time. **Nye (indtales med tts.sh, baseline trin 0 medmindre andet):**
| id | tekst | trin |
|---|---|---|
| intro4 | Fnuggerne hedder det, de blev talt til. Én, To, Tre … og så videre. Det er nemmest. | 0 |
| name_syv | Flot, Syv. | 0 |
| taeller_hoejt | Én, to, tre, fire, fem, seks … otte, ni, ti, elleve, tolv. Det passer. | 0 |
| fjerne | Fjerne? Det gør vi ikke. | 0 |
| tretten | Fnuggerne venter på dig. Alle tretten. | 0 |
| hjaelp400 | Fire hundrede gange. Jeg tæller stadig. Det er det eneste, jeg kan. | 0 |
| idle_dag | Bygmester? Fnuggerne venter. | 0 |
| syv_navn | Det navn bruger vi ikke mere. | 0 |
| ord_kender | Det ord kender jeg ikke. | 0 |
| vaeret_her | Du har været her før. Det kan jeg tælle. | 0 |
| ovenpaa | Vi byggede ovenpå. Det plejer at hjælpe. | 2 |
| mistaenkt | Jeg har mistænkt bageren. Og isværket. Og kridtgruben. Ikke dig. Du kom først bagefter. | 2 |
| ja_elleve | Ja. Elleve. | 2 |
Kun tekst (ingen klip): byen_taeller-linjen, Hjelmene-teksten, Regnskabets lag, BLINES, "Rådhuset melder", "Måneby er fuld".

Eggs: Esc×3 [Ja][Nej][Hende] beholdes ("Ja. Hende." = Syv). Ctrl+P = skærm-Byggebevis fra Krater Multimedie, INGEN printertekst; akt 3: "Rådhuset ✕ · Fnugger: 12 (11)"; efter trueEnd: "Fnugger: 12 (12)". Tast `SYV` på hubben → syv_navn. Tast `MINUS` på hubben før Regnskabet → ord_kender. Idle 2 min: dag → idle_dag; nat → ingen linje, én Fnug drejer hovedet ét step (flag `save.flags.idle_look` sættes 1 s). 20 klik "Hold op." beholdes. Slettes: resize, navigator.language, kalender (season), document.title-drift, CD2.

Lyd: `assets/music/ident.ogg/.m4a` (3 s GM-chime, egen komposition, tools/music), `raadhus_melder` → `play('ding_info')` (findes som sfx-navn? ellers `sfx.ok`), natvagt → `play('nv_lygte_klik')` + `play('nv_uld_sten')` (nye i tools/sfx/make.py), pedel-sfx fjernes. LYDPLAN §5-tabel: pedel-rækken → natvagt.

## 4. Ejerskab (disjunkte filer, samme worktree)
- **A krom/state:** src/scenes/boot.js, src/main.js, src/core/state.js, src/core/os.js (fjern `desktop()`/elev01 hvis ubrugt). school.js ejes af session c8 (polish) — rør den IKKE; 2. gennemspilning sender `minus_known` via save.flags.
- **B kurve/eggs:** src/wrongness.js, src/game.js, src/eggs.js.
- **C akter:** src/scenes/acts.js.
- **D hub/art:** src/scenes/hub.js, src/art/placeholder.js, src/scenes/task.js (wrongCount). Fjern den procedurelle bænk (hub.js ~l.121) — renderen har bænken indbagt ca. x 525–625, y 310–425; bench_gone dækker den med en kopi af overfladen fra this.bgc (fx drawImage af x 400–500 samme y). Behold justBuilt-linjen (l.47) og bg()-løkkens drawBuilding-kald genkendelige (c8 bytter dem til fx.js efter mergen). mix.js-signalerne save.night, flags.phone, flags.scene, flags.ending skal bevares.
- **E tekst/lyd:** src/script.js, src/voicemap.js, tools/voice/batch2.sh (+ kør den), assets/voice (slet 5, lav 13), tools/music (ident), tools/sfx/make.py (2 nye), docs/LYDPLAN.md.
- **F docs/test:** docs/PLAN.md, docs/DECISIONS.md, README.md, tools/test/flow.mjs, tools/test/shots.mjs (desktop → ident), docs/QUALITY-PLAN.md (kun id-referencer).
Ingen committer; orkestratoren committer samlet. Ingen kører flow.mjs/polish.mjs (Chrome) — kun `node --check`.

## 5. Grep-gate før merge (src/ skal være tom for)
`elev07|elev01|Skole-IT|SKOLE-IT|edb|speechSynthesis|navigator\.language|getHours\(|getDay\(|getMonth\(|firstName|deletedLog|'desktop'|Afprøvet i 4\.b|pedel|Jylland|hendes fil|CD 2|Måneby i Verden|17 11 2005|B\.'` (undtagen "2005" i krom-tekst, Date.now i state.js, og de tekniske lydnavne `room: 'edb'`/`amb_edb`/`ir_edb` = "lille hårdt rum", som aldrig vises for spilleren).
