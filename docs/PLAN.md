# MORD I MÅNEBY — plan

## Kontekst

### Retningsskifte 09-11-2026
Frederik: *"mord i måneby burde bare være hele spillet og hele historien, ikke alt muligt som foregår i spillerens rigtige univers."* Hans tre valg: **(1)** fjern Win2000-rammen helt (intet skrivebord, ingen cd, ingen computer uden om spillet); **(2)** intet fra spillerens egen verden (ingen ægte klokke/ugedag, intet første navn fra sidst, ingen browser-stemme, sprog, vinduesstørrelse eller kalender); **(3)** behold kernen — hjælperen kender kun plus og gange og kalder én-mindre for mord — men den manglende skal være en **Måneby-figur med en årsag inde i universet**. Alt uhyggeligt kommer fra Måneby selv. Krater Multimedie ApS er ren død krom (ident, titelfod, credits) og bærer aldrig historie.

Council 09-11 (7 agenter, 3 blindede koncepter, 3 linser isolation/dramaturgi/gennemførlighed, Opus-chair): vinder **"Regnskabet"** 8,00 > "Syv tæller ned" 7,83 > "Hullet under Rådhuset" 6,00. Ingen vetoer. Kontrakten for bygget (navne, flag, scener, grep-gate) står i `docs/RETNING.md`; council-detaljer i `docs/DECISIONS.md` C7. Denne plan er rettet til, så §1–§4 matcher RETNING.md 1:1.

### Baggrund
Frederik vil lave et super poleret, cursed browser-spil (1–1,5 time) der starter som et uskyldigt dansk matematik-børnespil fra 2005 (Director/CD-ROM-æstetik) og langsomt bliver creepy, bizart og feberdrøm-agtigt i Endacopia-ånd. Nostalgisk for folk der spillede *Matematik i Måneby*, men **originalt**: kun genrens grammatik (måneby der vokser via regneopgaver, hub-kort, ældre fortæller, minispilsarketyper, fyrværkeri-finale, setup med navn+trin). Ingen kopi af Bitfrosts figurer, bygningsnavne, opgavetekster, musik, logo — og intet fra Endacopias figurer/historie.

Frederiks valg (09-11): titel **Mord i Måneby** · GitHub Pages (fuld) + claude.ai-artifact-demo · dansk retro-TTS-stemme · horror-toppen må nå **Endacopia-niveau** (grotesk/body horror tilladt i sidste tredjedel) · **spilleren er IKKE morderen** · **let meta** (tæller/nulstilling ok, ingen speedrun-referencer) · planlagt med Opus + Fable, smådetaljer afgøres af **councils** (kun Claude-linser, maks 10 agenter, `no_gpt`+`no_gemini`).

Research (færdig, ligger i agent-planfiler, kopieres til projektet i fase 0):
- Måneby-dossier: `~/.claude/plans/parsed-frolicking-yao-agent-a5f207987a0394333.md`
- Endacopia-analyse: `~/.claude/plans/parsed-frolicking-yao-agent-a3576ff9590dcb34e.md`
- Retro-look + eskaleringskurve (B3) + IP-liste (B4) + engine: `~/.claude/plans/parsed-frolicking-yao-agent-a7ec7423817328e2d.md`

---

## 1. Præmis — "mordet er en regnefejl" (Regnskabet)
**Overfladen (2005):** cd-rom'en *"Regn med Måneby"* fra det fiktive *Krater Multimedie ApS, Valby* (lukket 2006). Spilleren er bygmester og hjælper tolv små byggevæsner (**Fnuggerne**, uldgrå totter med hjelme — originalt design) med at bygge en by på Månen. Fortælleren er en gammel, venlig hjælper (design → council C2). Krater Multimedie er kun krom: ident, titelfod, credits. Studiet bærer aldrig historie.

**Den skjulte historie (siges aldrig ligeud, rekonstrueres via spor):**
- Fnuggerne hedder det tal, hjælperen talte dem til: **Én, To, Tre … Tolv**. Det er nemmest.
- Måneby har én regel: *vi trækker ikke fra*. Hjælperen kender kun **plus og gange**. Byen kan kun vokse. Minus-tasten findes ikke på Kraterskolens stentastatur.
- Dag 20 besluttede hjælperen, at Rådhuset skulle tælle for ham. **Syv** sad på Rådhusets grund hele dag 31. Dag 32 talte han sidste lag sten: *"143 sten og Syv, lagt sammen: 144"* — og Rådhuset blev færdigt. Hun blev **lagt sammen**. I en by hvor man kun lægger sammen, kan intet skilles ad igen.
- Siden står der 11 på sletten og 12 på skiltet — og **begge tal er rigtige** (11 Fnugger + 1 Rådhus = 12). Regnskabet stemmer, og alligevel mangler én.
- Hjælperen har i 40 dage ledt efter en morder i et regnskab han selv har ført, og han kan ikke læse det, for det kræver minus. Det eneste ord han har for "én mindre" er **mord**. Han har mistænkt bageren, isværket og kridtgruben. Aldrig spilleren: *"Ikke dig. Du kom først bagefter."*
- **Sandheden** (sidste akt, aldrig sagt ligeud): ingen blev myrdet. En by lagde sammen, og én blev til en del af summen. Melankolien er bogføringens: alt stemmer, og der mangler én. Bageriet bager 12 boller hver morgen; én bliver til overs. Spilleren er *vidnet*, der kan regne baglæns.
- **Finalen:** spilleren lærer hjælperen **minus** i Tællerummet ("Regnskabet"). Opgaverne løses baglæns, lag for lag (12−n), byen skrumper til dag 31, og Syv sidder igen på Rådhusets grund.

Hårde regler (RETNING.md): **H1** intet uden for Måneby · **H2** spilleren er aldrig morder · **H3** ingen Bitfrost/Endacopia-kopi · **H4** præcis én jump scare · **H5** æra-regler (QUALITY-PLAN) · **H6** hjælperen siger aldrig "minus"; nærmest: *"Så det var ikke mord. Det var bare … mindre."*

Hvorfor det er klogt: titlen er en løgn spillet fortæller sig selv; alle "glitches" er hjælperens forsøg på at regne med et tal han ikke har; horroren er bogstaveliggjort matematik (se §3), og hjertet er bogføringens melankoli — alt kan tælles, intet kan trækkes fra.

## 2. Struktur (90 min, følger research-kurve B3)
**Hub:** bykort. 9 byggepladser (originale navne) + fyrværkeriplads. Hver bygning 3 trin (vaklende/normal/flot), kan altid spilles igen. Setup: navn (tomt felt) + **Byggetrin 1–6** → opgavegenerator skalerer. 7× klik på 6 → "Byggetrin 7" (kun opgaver med svaret 7).

| # | Plads | Minispil-arketype | Status |
|---|---|---|---|
| 1 | Landingspladsen | tæl/aflæs kasser | ren |
| 2 | Kraterbageriet | opskrift-klik (højreklik = 5 ad gangen) | ren |
| 3 | Isværket | rørføring med brøkventiler | ren |
| 4 | Stjernekikkerten | koordinater → stjernebillede | vakler (tegner et ansigt) |
| 5 | Kraterskolen | call-and-response-quiz m. stentastatur | vakler (svaret er 7, 7-tasten mangler) |
| 6 | Kridtgruben | breakout: slå krystaller der "går op" | vakler → cursed om natten |
| 7 | Rådhuset | søjlediagram-slider (Fnug-statistik) | cursed ("?"-bygning, ufærdig-trope; bliver en dør) |
| 8 | Fyrtårnet | vinkler: drej lyset | cursed (blinker morse) |
| 9 | Tællerummet / "Regnskabet" (scene-id `logroom`) | grav dig ned, løs lag-opgaver baglæns (minus) | skjult finale |

| Min | Fase | Nøglebeats |
|---|---|---|
| 0–2 | Krom | Sort → **ident** (Krater Multimedie-chime 3 s, egen GM) → loader "Henter Måneby…" m. ryk → "Klik for at begynde" (= audio-gestus) → **title** → **setup** (tomt navnefelt; "Byggetrin 1–6"). Intet skrivebord, ingen cd, ingen computer. |
| 2–15 | Ren baseline | Intro-linje 4: "Fnuggerne hedder det, de blev talt til. Én, To, Tre, og så videre. Det er nemmest." Plads 1–3. Weyse-morgensang i GM. Klistermærker. Statuslinje: "Fnugger: 12" men 11 på skærmen (ingen bemærker). |
| 15–17 | Første off-note | "Godt klaret klaret"; én Fnug med 1 px magenta-fringe står med ryggen til. |
| 17–28 | Baseline fortsætter | Plads 4–5. Kraterskolens opslagstavle: "Dagens tælling: 12". Min 18 `name_syv`: "Flot, Syv." (hub-HUD viser "Syv" i stedet for navnet, én gang). Rådhuset har kun "?" (tooltip: "Ikke endnu."); "?"-klik tælles i `meta.qClicks`. |
| 28–30 | Gentagelse #1 | Samme hub-PNG, bænken mangler. Musikloop starter 20 s for sent. |
| 30–40 | UI vakler | "Gemt!" lyver (reload = én bygning mindre). Loading-bar 71 % → 44 %. Min 35 `taeller_hoejt`: hjælperen tæller højt på hubben og springer 7 over: "Én, to, tre, fire, fem, seks ... otte, ni, ti, elleve, tolv. Det passer." Skolen: svaret er 7, 7-tasten mangler; hjælperen tier 5 s: "…vi går videre." Uløselig opgave: "Hvor mange Fnugger bor i Måneby?" |
| 40–45 | Fake-fejl | Min 40 `fuld` (shock): program-dialog **"Måneby er fuld. Fjern noget, og tryk Gentag."** [Gentag][Annuller], 10 s ulukkelig; Gentag → bzzt + palette-flash, og i de 2 frames er hubben tom; derefter "Fjerne? Det gør vi ikke." Min 43 `director_err`: `Script error: Handler not defined #traekFra` (Director-boks inde i 640×480). Min 44 `tretten`: hub_back "Fnuggerne venter på dig. Alle tretten." (han kan kun tælle op). |
| 45–50 | Byen tæller dig | Min 45 `byen_taeller` (dynamisk tekst, ingen stemme): "Du har klikket på mig {help} gange. Svaret forkert {wrong} gange. Kigget på Rådhuset {q} gange. Jeg lægger det sammen: {sum}." Min 47 `raa_render` (shock, **materiale-brud #1**): 2,6 s rå render — hub-baggrunden gennem grå flat-LUT uden himmel, 12 flade grå Fnug-silhuetter, den tolvte står halvt inde i Rådhusets volumen som z-sorteringsfejl. **Tvetydig**: ingen gennemsigtig kasse, ingen tydelig Fnug-i-mur (gemmes til jump). Min 48 `peeked` (kræver `meta.qClicks >= 3`): én Fnug kigger i kameraet. |
| 50–55 | **Falsk slutning** | Fyrværkeri, "Tillykke, [navn]!", Comic-Neue-rulletekst: Krater-navne + "Fnuggerne: Én, To, Tre, Fire, Fem, Seks, Otte, Ni, Ti, Elleve, Tolv" + "Bygmester: {navn}". Kan ikke lukkes → klik → **nat**. |
| 55–65 | **Nat / liminal** | Alle scener som nat-renders. Ingen musik; CRT-hum + ventilation. Hjælperens hjørne tomt, skægget/munden animerer uden lyd. Kridtgruben vendt: slå de *forkerte* krystaller. Feberdrøm I–II (§3). **Natvagten** (§3 IV): Fnuggen Elleve med lygte efter 30 s inaktivitet (spilletid). Min 58 `night_cursor`: cursor driver 1–2 px mod Rådhuset. |
| 65–68 | Stilhed | Min 65 `silence_counter`: 30 s, tæller "Fnugger: 12 → 11" står og dirrer. Klik gør intet. Herefter er Rådhusets "?" en **dør** (`save.flags.hall_door`). |
| **68** | **Jump scare (den eneste)** | Klik på døren (eller eventet) → ≤300 ms **Rådhus-interiør**: mørk sal med søjler, i bagvæggen en Fnug presset ind i mørtlen, bulet hjelm på skrå, to åbne øjne, det sædvanlige lille smil + clippet 22 kHz-lyd. Procedurel tegning i acts.js er standard; render fra `assets/raw/jump/` bruges kun hvis `assets/photos/jump_hall.png` findes (council C6). Derefter sort til næste klik. |
| 68–78 | Afsløring | "Der mangler én. Nogen har … jeg kender ikke ordet." → "Vi byggede ovenpå. Det plejer at hjælpe." Min 69 `raadhus_melder`: program-boks **"Rådhuset melder"** / "12 bor i Måneby. 11 står på sletten. Byen stemmer." [Luk] virker ikke (noop), [OK] — bærer det normale ding_info. Min 70 `stemme_rum`: hjælperens næste linje afspilles med convolver-rummet "tomt" + "Jeg har mistænkt bageren. Og isværket. Og kridtgruben. Ikke dig. Du kom først bagefter." Fyrtårnet blinker **S-Y-V**. Rådhus-skyder → 11 → "Ja. Elleve." → fever1 → "Der er ét sted til. Nedenunder." |
| 78–84 | Valget | "Byg videre" (fyrværkeri igen; byen vokser; loop, hver runde mørkere, Fnugger ganges op → §3 III) eller **"Nedenunder"** (Tællerummet, overskrift "Regnskabet": minus-tasten tegner sig selv på stentastaturet; 7 lag løses baglæns, se nedenfor). |
| 84–88 | Slutning | **Stille morgen**: byen som dag 31 — alle bygninger trin 1, Rådhuset kun grund (stage 0 + grund-rektangel), **Syv** sidder på grunden (mindre, bulet hjelm), 12 Fnugger på sletten, bænken er tilbage. Hjælperen siger "Udmærket." og derefter aldrig mere; hjælp-knappen giver kun "tik". Én linje pr. bygning (BLINES): Landingspladsen "12 kasser. Alle talt." · Bageriet "12 boller. Én til hver. Én bliver kold." · Isværket "Isen holder." · Stjernekikkerten "Man kan se hele sletten herfra." · Kraterskolen "Dagens tælling: 12" · Kridtgruben "Man må gerne grave." · Rådhuset "Ikke endnu." · Fyrtårnet "Lyset er til at finde hjem efter." Én `beforeunload`-prompt hvis man lukker før credits. |
| 88–90 | Ægte credits | Rigtig toneart, men fløjte-patch 73 er blevet FX Crystal 99. Krater-navne · "Tak til Fnuggerne: Én, To, Tre, Fire, Fem, Seks, Syv, Otte, Ni, Ti, Elleve, Tolv" · "Fan-inspireret, ikke tilknyttet Bitfrost Interactive eller maaneby.dk." · sidste lille linje: **"Mord i Måneby"** (eneste sted titlen vises). |

**Regnskabets 7 lag** (LOG i acts.js, øverst nyest, ≤56 tegn, tallet i linjen = svaret på lagets opgave 12−n; sumlinjer, aldrig "jeg gjorde"):
1. `Dag 40. 11 på sletten. Rådhuset: 1. Lagt sammen: 12.`
2. `Dag 33. Rådhuset færdigt. 10 sov. Døren låst.`
3. `Dag 32. Sidste lag. 9 bar sten. 143 og Syv: 144.`
4. `Dag 31. 8 byggede. Syv sad på grunden hele dagen.`
5. `Dag 20. 7 lagde grund. Rådhuset skal tælle for mig.`
6. `Dag 7. 6 fik navne. Så talte jeg videre: Syv, Otte.`
7. `Dag 1. 5 landede. Så 7 mere. Vi trækker ikke fra.`

**2. gennemspilning** (byen husker via `meta.ending`; `meta` kun i IDB så "Start forfra" ikke rammer den; `meta` indeholder kun Måneby-ting: `starts, lastSeen, resets, helpClicks, qClicks, ending, finishedTowns, version`): starter som **dag** (ikke nat). Minus-tast på Kraterskolens stentastatur fra start og 7-tasten tilbage (`seven_missing` kræver `!meta.ending`). Rådhuset klikbart fra minut 0. Første hub-linje: "Du har været her før. Det kan jeg tælle." (ingen navne-hukommelse). **Skjult slutning** `trueEnd`: gennemfør uden nogensinde at svare på Rådhusets "Hvor mange Fnugger bor i Måneby?" (flag `hall_answer` aldrig sat) → fyrværkeri med 12 på sletten, rulletekst med alle tolv, Byggebevis "Fnugger: 12 (12)", ingen nat, direkte credits. `meta.ending = 'tolv'`.

## 3. Feberdrøm-sekvenser (bogstaveliggjort matematik — her må det blive Endacopia-grotesk)
- **I. Regnerummet bag Rådhuset** (nat, scene `fever1`): scene uden baggrundsrender — kun Bryce-gradienthimmel og ternet testgulv. Alle Fnugger står i rækker og regner på tavler på "Hvor mange bor her?". Spilleren giver tal; hvert *rigtigt* tal får én til at forsvinde (hjælperen klapper); forkerte tal: de kigger. Lektionen: rigtige svar trækker fra.
- **II. Hjelmene** (scene-id `fever2` beholdes; udløses af bageriets madpakke-flag): opskrift-minispillet bliver efter 3 ingredienser til en håndskrevet seddel → kameraet zoomer ud → tekst-adventure (grøn bitmap-skrift): "> du står på sletten. det er nat." / "> ved bageriet står 12 hjelme på række. 11 har nogen under sig." Kommandoer **SE** → "> den tomme hjelm er bulet. den er for lille." / "> på bageriets disk ligger én bolle. den er kold." · **GÅ** → "> rådhuset er låst. der er ikke mere at lægge til." · **SLUK LYSET** → ægte sort canvas 3 s → tilbage til hub med ét vindue tændt (Rådhusets).
- **III. Division** (loop-grenen): "Del Fnuggerne i to hold" — de deles bogstaveligt (hjelme i halve, uldtotter trevlet, stadig smilende). Multiplikation: 12 → 144 Fnugger fylder hubben og stirrer; "Hold da op, hvor er her blevet fuldt."
- **IV. Natvagten** (kun om natten i spillet — ingen rigtig klokke): **Fnuggen Elleve** med lygte efter 30 s uden input (spilletid, `this.idleT` i hub.js). Går til Rådhusdøren; lygtekeglen viser et **kridt-7** på døren. Ingen replik. Lyd: lygte-klik + uld mod sten. Giver det ene spor der ikke findes om dagen.

## 4. Wrongness-katalog og easter eggs
Fables 30 øjeblikke + Opus' 15 eggs samles i `src/wrongness.js` som tidsstyret tabel (`minute, phase, deniable, requires`). Alt der nævner speedruns/gravlund/any% **udgår** (let meta). Alt der henter noget fra spillerens verden **udgår** (RETNING.md).

Wrongness-id'er (kontrakt): `klaret_klaret` 15 · `fnug_fringe` 16 · `scope_face` 17 · `name_syv` 18 · `bench_gone` 28 · `save_lies` 30 · `progress_back` 33 · `taeller_hoejt` 35 · `seven_missing` 35 · `fuld` 40 (shock) · `director_err` 43 · `tretten` 44 · `byen_taeller` 45 · `raa_render` 47 (shock) · `peeked` 48 (kræver `meta.qClicks >= 3`) · `false_end` 50 (shock) · `night_cursor` 58 · `silence_counter` 65 (shock) · `jump` 68 (shock) · `raadhus_melder` 69 · `stemme_rum` 70.

Eggs der beholdes: 7× klik på "Byggetrin 6" → "Byggetrin 7" (kun opgaver med svaret 7); navnet "Syv" i setup; tekst-tv side 777 (eget layout); Kraterskolens tavle "Dagens tælling: 12"; **Ctrl+P** = skærm-Byggebevis fra Krater Multimedie uden printertekst (akt 3: "Rådhuset ✕ · Fnugger: 12 (11)"; efter trueEnd: "Fnugger: 12 (12)"); tast `SYV` på hubben → "Det navn bruger vi ikke mere."; tast `MINUS` på hubben før Regnskabet → "Det ord kender jeg ikke."; idle 2 min: dag → "Bygmester? Fnuggerne venter.", nat → ingen linje, én Fnug drejer hovedet ét step (`save.flags.idle_look` 1 s); 20 hurtige klik → "Hold op."; Esc×3 → [Ja][Nej][Hende] (tredje knap kun om natten; "Ja. Hende." = Syv). IP-filter: kun research B4's sikre liste; aldrig Pixeline/Hugo/M&M/DR-figurer/Bliss/Windows-logo.

## 5. Stemme & lyd
- **Hjælper = dansk OS-TTS** (`say -v` dansk stemme på Mac, renderet offline) → ffmpeg-kæde `highpass 120, lowpass 7000, acompressor, 22050 Hz, pcm_u8` → OGG q1 mono (+ M4A-fallback til Safari). Baseline-varme skabes med langsomt tempo, for mange pauser og "voksen teatralsk diktion"-prosodi i teksten. Horror-trin: samme stemme i 11 kHz telefonfilter og convolver-rummet "tomt" (`stemme_rum`). Ingen browser-stemme: alt er præ-renderede klip (voicemap matcher eksakt tekst). Mund-/skæg-sync via offline RMS → `voice/*.json`. Resten: tekst + "mumle"-stavelser (12 ms/tegn, tik-lyd). Kun tekst uden klip: byen_taeller-linjen, Hjelmene-teksten, Regnskabets lag, BLINES, "Rådhuset melder", "Måneby er fuld".
- **Musik:** egne GM-MIDI-kompositioner (Python `midiutil`), renderet med `fluidsynth` + GeneralUser GS (fri licens) → 22 kHz mono OGG. `variant(song, transpose=-2, tempo=.92, swap={73:99})` laver nat/cursed-versioner. Ident-chime 3 s (`assets/music/ident.ogg/.m4a`, egen komposition). Titeltema → council C5. ~16 OGG, ~2 MB.
- **SFX:** sophie-games `sfx.js`-synth udvidet med seek-klik, palette-"bzzt", CRT-hum, ventilation, natvagtens lygte-klik + uld mod sten. 22 kHz, let clipping.
- Skal installeres: `brew install fluid-synth` + hent GeneralUser GS (~30 MB). ffmpeg/magick findes. Pillow kun i `/usr/bin/python3` eller venv `~/Documents/tools/pyimg/`.

## 6. Teknisk arkitektur
Nyt repo `~/Documents/mord-i-maaneby/` (git; GitHub-repo oprettes med `gh` før første publicering — Frederik spørges før push). **Vanilla ESM canvas + DOM, ingen bundler i dev** (`python3 -m http.server`); `tools/build.mjs` → `dist/` (hash, artifact-variant = akt 1).

```
index.html style.css
src/main.js            boot, 640×480 offscreen → heltals-nearest, letterbox sort, imageSmoothing off
src/core/stage.js      lag (bg/sprites/fx), palette-LUT-flash, 1-bit-tekst (alfa-threshold)
src/core/scene.js      scener som data {bg, bgNight, hotspots[poly], onEnter}
src/core/script.js     kommando-VM: say wait set if goto mini glitch music os
src/core/dialog.js     tekstboks, skrivemaskine+tik, ▼, skæg-sync
src/core/state.js      save (localStorage⇄IDB) + meta (kun IDB), alt i try/catch, kører uden storage
src/core/cursor.js     cursor:none + egen 32×32 sprite (drift/forsinkelse/træk)
src/core/os.js         program-dialoger i 2005-stil inde i 640×480 (#d4d0c8, titel #0a246a→#a6caf0), Director-fejlboks
src/core/audio.js      Web Audio: busser music/voice/sfx/amb, bitcrusher (WaveShaper), Convolver, resume() ved første klik, Page Visibility-regel
src/wrongness.js       tidsstyret event-tabel (minute/phase/deniable/requires)
src/opg.js             opgavegenerator opg(type, byggetrin, seed)
src/ware/engine.js     porteret fra ~/Documents/sophie-game/src/ware/engine.js (api.add/spr/on/every/after/done, playOne() som Promise)
src/ware/games/*.js    9 minispil + fyrværkeri-rytme
src/scenes/boot.js     ident → title → setup
src/scenes/acts.js     falseEnd, fever1, fever2, jump, logroom, morning, credits, trueEnd
SCRIPT.md → tools/script-md.mjs → src/script.js   (Frederik retter replikker i markdown; flags @nat @husker:… @byggetrin>=3)
assets/bg (PNG8) sprites music voice sfx photos
tools/art/retro.py tools/music/*.py tools/voice/{tts.sh,rms.py} tools/test/{flow,acts,meta,shots}.mjs
```
Nøglegreb: palette-LUT-flash (PNG8-palette → indeks ved load; 1–3 frames med gammel LUT; maks 6 gange i spillet) · én ægte `alert()` og én `beforeunload` · fullscreen kun i klik-handler · Page Visibility: i akt 3 fortsætter stemmen 10 s i baggrundsfanen og muter så.

**Asset-budget:** Pages ~25–30 MB (33 baggrunde à ~150 KB Bayer-PNG8, 9×3 bygningstrin + nat, hjælper ~12 frames, 12 Fnugger × 3 poser, ~60 minispil-sprites ≈ 8 MB; musik 2 MB; TTS-stemme 12 min ≈ 3–4 MB). Artifact = akt 1 (≤16 MB) med "fortsæt på …"-link.

## 7. Asset-pipeline (Higgsfield **Nano Banana Pro på Unlimited** via webapp/playwriter — egen fane, tjek switch før hvert submit; aldrig credits uden at spørge)
- Baggrund: `1999 pre-rendered 3D CGI, Bryce 3D render, children's educational CD-ROM screenshot, [SCENE], Phong shading, plastic specular highlights, hard raytraced shadows, no global illumination, saturated primary colors, gradient sky, 4:3, no text, no characters` · negativ: `photorealistic, global illumination, depth of field, cinematic, 4k, Unreal Engine, Pixar quality`.
- Nat-par: image-edit på dagbilledet, samme session: `same scene, same camera, night, all lights off except one window, cold blue ambient, unchanged geometry`.
- Figurer: `Poser 4 / 3D Studio MAX R3 mascot, [beskrivelse], isolated on flat #00FF00, stiff pose, big eyes, plastic shading, sprite sheet 4 frames` → chroma-key, behold 1 px fringe. Nye sprites: Syv (mindre, bulet hjelm; én bestemt art jf. retro-alien-retningen), lygte-Fnug (3 frames), Rådhus-dør-tilstand, kridt-7, Rådhusets grund-trin.
- Bygningstrin: "unfinished scaffolding, leaning" / "plain" / "decorated with flags and lights".
- Materiale-brud (`raa_render`, min 47): **laves i kode** — hub-baggrunden gennem grå flat-LUT + 12 silhuetter. Ingen genereret "foto". Jump-interiøret: procedurel tegning i acts.js er standard; evt. render-varianter (`assets/raw/jump/`) til council C6.
- Prompts nævner **aldrig** Måneby/Bitfrost/Endacopia og bruger ingen referencebilleder derfra.
- `tools/art/retro.py` (`/usr/bin/python3 -I`): resize 640×480 LANCZOS → farvedrift (sat 1.12, grøn ×1.03) → JPEG q65-rundtur → ordered Bayer (baggrunde) / Floyd–Steinberg 256 (figurer) → PNG8 + `.pal.json` → kontaktark.
- Jump scare-billedet og nat-pakken godkendes separat.

## 8. Faser og godkendelser (billedreview = artifact med Ja/Måske/Nej pr. billede, fast regel)
| Fase | Indhold | Frederik godkender |
|---|---|---|
| 0. Bibel (½ dag) | Kopiér research til `docs/research/`, kør de udskudte video-trin (yt-dlp frames/subs/kommentarer fra agent-planfilerne) kun som reference; skjult tidslinje (Måneby-dage 1–40), spor-kort over alle "Syv"-ledetråde, SCRIPT.md v0 | historie + slutning (council C1) |
| 1. Lodret skive (2–3 d) | Kerne-moduler, krom → setup → hub → plads 1 med placeholder-art, `flow.mjs` grøn | spil-feel (skalering, tekst-tik, knapper) |
| 2. Stil-lås (1–2 d) | Higgsfield-test: 3 baggrunde × 3 retro-varianter, 4 hjælper-designs, 3 Fnug-designs, titelskærm-varianter | review-artifact + councils C2–C4 |
| 3. Lyd-lås (1 d) | fluidsynth-setup, titeltema ×3 + nat-variant, TTS-stemmetest (3 stemmer × filterkæde) | lyt-artifact + council C5 |
| 4. Akt 1 (3–4 d) | Plads 1–5, 5 minispil, opgavegenerator m. tests pr. byggetrin, baggrunde i batches à 6 | spilbar build |
| 5. Akt 2–3 (4–5 d) | wrongness-tabel, falsk slutning, nat-sæt, feberdrømme I–IV, jump scare, Tællerummet, slutninger, husker-greb | nat-par-review; jump scare separat; council C6 |
| 6. Polering/QA (2 d) | easter eggs, `acts/meta`-tests, Safari-lyd, 2 uforberedte testspillere måler "hvornår opdagede du noget" | playtest-feedback |
| 7. Deploy | GitHub Pages (ét link) + akt-1-artifact | endeligt Ja |

## 9. Councils (council-skill, `mode:"plan"` eller `design`, 3 Claude-linser: *Nostalgi-ægthed*, *Horror-dramaturgi*, *IP-afstand*; `no_gpt`+`no_gemini`; precheck først; maks 10 agenter pr. kørsel)
- **C1** Slutning: stille morgen vs. sletning vs. valg — og hvor eksplicit "mord"-misforståelsen må siges. (Afgjort, se DECISIONS.)
- **C2** Hjælperens navn + design (Morfar Måne / Hr. Regnar / 2 nye) — design-mode på renders.
- **C3** Fnug-design (afstand til Grønling-lighed måles af IP-linsen).
- **C4** Titelskærm: afsløres "MORD I MÅNEBY" fra start, ved den falske slutning, eller først i nat? + fiktivt studie-/produktnavn. (Afgjort: kun sidste credits-linje, se C7.)
- **C5** Musiktema: Weyse-salme vs. egen komposition; TTS-stemme-valg.
- **C6** Jump scare-medie (procedurel sal vs. render-varianter) og om division-sekvensen er for grotesk.
- **C7** Retning: alt inde i Måneby — "Regnskabet". (Afgjort 09-11, se DECISIONS.) **C7-b**: Regnskabets endelige 7 linjer + nye replikker (tone/2005-fortæller). Evt. **C8** rå-render-variant.
Besluttes uden council: 640×480, vanilla JS, 2005-dialogstil (#d4d0c8), PNG8/Bayer, GeneralUser GS, localStorage+IDB, minispil-arketyper, hotkeys, testsetup, alle wrongness-tider ±3 min.

## 10. Risici
- **Titel/IP:** "Måneby" er Bitfrosts navn; spillet læses som hyldest/parodi. Afbødning: eget logo/typografi, fiktivt produktnavn, disclaimer i credits, ingen Bitfrost-assets eller -prompts, IP-linse i hvert council. Lav men ikke nul risiko [gæt]; genovervej titlen hvis spillet bliver stort.
- **Omfang:** akt 1 (~30 min) leveres som selvstændig milepæl; akt 2–3 genbruger scener via dag/nat-par.
- **Tokens/tid:** assets i batches med kontaktark; data-drevne scener; minispil som parallelle agenter i worktrees (maks 10).
- **Lyd:** autoplay løst med "Klik for at begynde"; Safari OGG/Opus usikkert → lever OGG + M4A. Alle replikker er præ-renderede klip; ændret tekst kræver nyt klip (voicemap matcher eksakt).
- **16 MB artifact:** kun akt 1, stemme-let.
- **Storage i iframe/privat vindue:** husker-greb falder stille tilbage; testes.
- **Dosering:** for tidlige glitches ødelægger tilliden → B3-reglerne (aldrig to stød uden ≥5 min hvile; 60–70 % af wrongness skal kunne overses) håndhæves i `wrongness.js` og måles i playtest.
- **Isolation:** uhyggen må kun komme fra Måneby. Grep-gaten i RETNING.md §5 kører i `flow.mjs` og fejler bygget ved læk (skole, klokke, browser-API'er).
- **45–50 skal bære sig på byens bogføring** (byen_taeller + rå render erstatter "spillet kender dig") — effekten er svagere end et brud ud i spillerens verden; **playtest** om øjeblikket stadig lander.

## Verifikation
- `tools/test/flow.mjs` (puppeteer-core + system-Chrome, portet fra sophie-game): spiller ident → titel → setup → hub → … → falsk slutning → nat → jump → Tællerummet → morgen → credits med `?dev&scene=…&min=N&nat&name=X`; alle wrongness-events i rækkefølge; konsolfejl = fail; grep-gate (RETNING §5) over `src/` = fail ved match.
- `shots.mjs`: screenshot af hver scene dag/nat → kontaktark til review-artifact.
- `meta.mjs`: start → gennemfør → `meta.ending` sat → 2. gennemspilning starter som dag med minus-tast; "Start forfra" rører ikke meta; slet localStorage → meta i IDB overlever; privat vindue → ingen crash; gammel save (version < 2) → meta-felterne `firstName, names, peeked, deletedLog` er væk.
- `opg`-tests: 1.000 genererede opgaver pr. byggetrin har entydige heltalssvar; skolens "7"-opgave er umulig uden 7-tast.
- Timing: dev-overlay viser minuttal vs. B3-kurven; to uforberedte testspillere noterer første "noget er galt"-øjeblik (mål: 15–30 min).
- Lyd: alle OGG/M4A afspilles i Chrome + Safari; TTS-filterkæde A/B-lyttes i artifact; voicemap-nøgler matcher eksakt tekst.
- Deploy: Pages-link åbnes i frisk profil (ingen skrivebord, titel "Regn med Måneby", `document.title` uændret hele vejen); artifact ≤16 MB; `files`-publish af `dist/`.
