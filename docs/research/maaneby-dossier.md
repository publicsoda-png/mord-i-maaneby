# Plan: Design-dossier "Matematik i Måneby" (research/maaneby/REPORT.md + ~15 frames)

Status: Plan mode slog til midt i opgaven. Alt læsende research (web, YouTube-metadata, transcripts, kommentarer, speedrun.com-API) er GJORT og noteret herunder. Tilbage er kun de skrivende trin.

## Resterende trin (kræver at plan mode ophæves)

1. `mkdir -p .../scratchpad/research/maaneby/{web,video,subs,frames}` (R = `/private/tmp/claude-501/-Users-frederikjensen/559efee9-d52f-4282-9480-3a3d82a622e3/scratchpad/research/maaneby`).
   - OBS: dcg-hooken blokerede en for-løkke med `$(wc -c ...)`; skriv kommandoer uden kommando-substitution.
2. Subs: `yt-dlp --no-cache-dir --write-auto-sub --sub-lang da,en,sv --skip-download -o "$R/subs/%(id)s" hbFVRQBr-uI BPb8mlsPx8c` (3ODez7G30gg har INGEN auto-subs — konstateret; kommentarer hentet i stedet).
3. Video: `yt-dlp --no-cache-dir -f "bv*[height<=480]+ba/b[height<=480]" -o "$R/video/hbFVRQBr-uI.%(ext)s" hbFVRQBr-uI` (1h29, svensk udgave — samme grafik). Evt. også BPb8mlsPx8c (dansk, 37 min) til dansk UI-tekst.
4. Frames (ffmpeg → PNG): tæt i 0:00–3:12 (intro-animation, titel/setup-menu, bykort/hub) + et pr. kapitel fra beskrivelsen: 3:12 Blomsterrabatten, 6:30 Asteroidbältet, 10:34 Köket, 15:08 Droppstensgrottan, 36:58 Ökenslätten, 55:07 Spaltklippsdalen (diagram), 58:08 Byggstenslagret, 1:00:44 Kraftverket, 1:07:25 Lekplatsen, 1:09:10 De Rykande Bergens Dal, 1:23:08 Den Djupa Klyftan (bro), 1:28:31 slut/fyrværkeri. Navngiv `fXX_mmss_navn.png`.
5. Kig på frames med Read og beskriv (opløsning, palet m. hex-gæt, renderstil, UI-chrome, font, cursor, hub-layout, vismanden).
6. Skriv `$R/REPORT.md` efter strukturen nedenfor med alle fakta herfra. Kør python med `-I`.

## Indsamlede fakta (til REPORT.md)

### Fakta & historie (maaneby.dk/en/spillet, /historien, /om, /spil, tbh.dk, archive.org, folkeskolen.dk)
- Udvikler: Bitfrost Interactive I/S, Hvidovre, stiftet 5. aug 2004. Stiftere: Ole Steiness (producer, ex-spilanmelder 7+ år, tegnede Grønlingen; i dag Darkhill Games / Champions of Midgard), Minna Nørgaard (tegnede den vise mand + væsnerne), Simon Gjerløv (lead programmer, tegnede de fleste bygninger), Kim Riedel, Jakob Ivarsson, Christian Engelbrecht. 2005-team: 3 multimediedesignere, webmaster, programmør (biokemiker).
- Udgivet september 2005 (launch-event Merlin, Friheden, Hvidovre, fre. 9. sep 2005; hjemmeudgave ca. 200 kr., Merlins top 10). Skolelicens 2007: 2.650 kr. (>400 elever). Distribueret via UNI-C SkolePro, senere Mikro Værkstedet (Skole Aftale+ 2011–12, 1.–6. kl., DVD/download). Bitfrost lukkede 19. maj 2014.
- Teknologi: Macromedia Director + Lingo, ca. 300 MB, ~1.700 billeder, >2.500 lydklip. Kører i dag på dirplayer-rs (Rust→WASM, GPL-3.0) på maaneby.dk (Astro, Cloudflare Pages), vedligeholdt af Rasmus Kjær Damgaard, "Revived by TBH". Med tilladelse fra en Bitfrost-stifter, kan trækkes tilbage.
- Versioner: basis 2005 · Måneby+ 1.3.63 (2008-05-07, UNI-C SkolePro; archive.org ISO 326 MB, upl. Thor Bilsby 2023) · 1.4 (ISO) · Måneby+ 1.4.5.96 (ca. 2010). Speedrun-communityet skelner "2006" og "2010"-udgaven (bl.a. byggesten-opgaven helt anderledes, drypstenshule halvt så hurtig i 2010).
- 5 sprog på disken: dansk, engelsk ("MoonVille Math", aldrig udgivet, ufærdig tale), svensk, bokmål, nynorsk (svensk/norsk indtalt af skuespillere). Sprog via flag i Setup eller "Sprog"-linjen i BrugerT.txt.
- Ufærdige bygninger: Vandtårnet (vægt/ligningsscene, 10 byggetrin, opgave mangler) og Stjernehuset (kun "?" som emne).
- Folkeskolen (Steen Ehlers, nr. 41 2005; online 13-10-2011): 3.–6. kl.; "godt nyt til de matematiklærere, der har penge tilovers på fagkontoen"; kritiserer layout og fortællerstemmen hårdt; "Mon ikke elever i 5.-6. klasse er vokset fra layoutet"; sjovt og udfordrende selv for voksen.
- Programinfo.txt (fra soundtrack-beskrivelse): "børnene skal hjælpe rumvæsener med at opføre en by … bygningernes detaljeringsgrad afhænger af elevens opgavebesvarelse … De skrevne tekster oplæses af en vismandsfigur". Målgruppe indskoling + mellemtrin.
- Reddit: 25+ tråde 2017–2025, r/Denmark-nostalgitråd ~700 upvotes (2022); Wikipedia-artikel slettet 3. maj 2024; logoer på SteamGridDB; Game Jolt-upload ~4.800 views.
- Playright.dk: "Midlertidig nedetid" (ikke hentet). Everybodywiki: Cloudflare-blokeret (ikke hentet).

### Game loop & struktur
- Spilleren = "regnemesteren"/bygmesteren der hjælper rumvæsner (Grønlinger / "guloppene"/"gulhopperne" (ASR-usikkert), "håndværkerne") med at bygge Måneby på en øde måne. Intro-speak (svensk ASR): "Välkommen till Gulas planet … vackra berg, farliga klippskrevor, mystiska grottor och mullrande vulkaner … det är mer matematik i byggbranschen än man först tror".
- Setup før start: navn, klassetrin 1–6, opgavetyper, sprog-flag. Sværeste sværhedsgrad kræves i speedrun.
- Hub = bykort; klik på byggeplads → vismanden introducerer → minispil/opgave → resultat afgør bygningens størrelse/detaljering ("rigtige svar gør bygningerne flotte og solide, forkerte gør dem mindre eller vaklende"). Kan altid genspille for at forbedre. Ikke-lineært. Esc på kortet = gem/menu. Ctrl+P printer kort med navn, point, resultater. Logfil til lærer. Afslutning: fyrværkeri + "Hold da op, hvor er Måneby blevet flot … guloppene og håndværkerne … taknemmelige for det fine arbejde".
- Lokationer/opgaver (svensk kapitelliste + dansk ASR):
  - Blomsterbedet (×3): multiplikation; "2 dl vand per plante / hele bedet 4 dl om dagen, gartneren vander hver 5. dag".
  - Asteroidebæltet: talforståelse/brøker; kanon med begrænset energi skyder sten der truer fragtskibet.
  - Køkkenet: multiplikation/division; kokken, opskrift "fra dengang galaksen var ung", klik antal ingredienser (knækrødder, månebær, blå tomater, ørkenslanger…), højreklik = mange ad gangen.
  - Drypstenshulen: regnearter; skyd diamanter ned med minearbejderen (3 bolde, breakout-agtig), kun diamanter "i energibalance" (ligninger der stemmer), pas på klippeblokke. Kranen får energi.
  - Kraftværket: tabeller – samme drypstens-mekanik, "energi til turbinerne".
  - Ørkensletten syd for Måneby: udsagn/logik; kør bil (piletaster/mus, hop med mellemrum) og saml krystalsten efter udsagn ("sten med præcis en rød krystal og sten med over en blå"); giver radiohus/kommunikationscenter ("nu kan de følge med i vejrudsigten fra naboplaneterne").
  - Spaltekløftdalen: diagrammer; søjlediagram med +/− for kg materiale til sygehuset.
  - Byggestenslageret: former og figurer; match klods til tegning set ovenfra/fra siden → præsidentens villa.
  - Brandstationen (kun 2010?): sortering af klodser på transportbånd.
  - Asfaltvejen: 60 m vej, vægtforhold månefyld/småsten.
  - Lygtepæle: vinkler ("bakke der hælder 14 grader").
  - Legepladsen: multiplikation/areal; liter maling pr. meter væg.
  - De Rygende Bjerges Dal: lavasten fiskes med kran (ikke for store/små, størrelse i øverste højre hjørne), kabel knækker.
  - Den Dybe Kløft: bro; planker 120 cm, "hvor meget skal saves af".
- Hjælp: klik på den vise mand. Narrator-fraser der gentages: "Klik her for at påbegynde byggeriet. Håndværkerne kan sikkert bruge lidt hjælp", "Udmærket", "Hold da op, det var flot", "Det var fint", "Hov, det går ikke".

### Audio (4Unrt50_MHM Soundtrack Rip, Grat10 2020, 27 min, ~3.500 views)
- 15 spor (interne filnavne i parentes): Menuen (Main), Byen, Asfalt, Asteroide, Blomtrek, Broen (Broscene), Drypstens Grotten (Grotte), Klods, Køkkenet (Kok2), Lavefloden (Lava), Maler, Lysscene (mater), Kombi/Ørkensletten, Rullebånd (Rulle), Slut (Main). Hvert spor ca. 1 min loop; ripperen måtte skrue tempoet op (nogle "passer ikke helt").
- Kommentarer: "Har aldrig hørt noget bedre i mit liv", "NOSTALGI!", "lyden af gode skole timer", "Dette er en kæmpe tjeneste du har gjort for vores generation. Tak!", "tempoet er godt nok lidt 'off', hva?".
- Fortæller: ældre mandsstemme, langsom, "vismand"; Folkeskolen fandt den irriterende; en kommentar (3ODez7G30gg): "Lyder uhyggeligt … det er ham der fra Monster Inc uden mund". Instrumentkarakter: skal vurderes ved lyt (ikke gjort – kun metadata). GÆT: General MIDI-agtig synth, rolige loops.

### Nostalgi-citater (BPb8mlsPx8c, 2Mini22, 36:50 WR 2020, 21.749 views, 55 kommentarer)
- [52] "Aldrig har jeg set en bedre titel" · [22] "Ahhh... Nostalgi, elsker Matematik i Måneby. Helt klart et af mine yndlings matematik spil" · [9] 2Mini22: "Samfundet har brug for specialister" · "Kan du ikke lave et speedrun på pengeby?" · "Matematikken er lige i skabet, men er bange for stavningen er knap så god" · "Hvordan kan man få fat i spillet!???? Jeg fik det aldrig gennemført i folkeskolen!" · "holy fuck det er mange år siden jeg spillede det her i skolen" · "Du skal arbejde lidt med dit 'aim' i drypstenshulen" · "Er dette Minecraft?" · "11:12 Neeeeeeeeeej :'(" · "det hedder en grønling!!!" · "Det er faktisk 2010. Kan huske at jeg spillede det på skolecomputeren" · "de spil på computeren gav mig en kæmpe minde som betød meget for mig, og jeg savner det helt vildt".
- Mønster: skolecomputer-minder, Pengeby som søsterreference, speedrun-memes, savn/"hvor downloader man".

### Speedrun (speedrun.com k6qwo5m6 "Mathematics in Måneby+")
- Regler: timer fra "OK" efter navn → første fyrværkeri; 100 % = alle minispil komplet på højeste sværhedsgrad; separate boards for 2006- og 2010-udgaven.
- 2006 100 %: Icethorn21 26:45 (2022-10-01). 2010 100 %: ThatGuyGust 31:43 (2024), bjarkehp 33:48, marcus543211 34:55, RotationMaster720 36:20, emil_williams 37:02, Nymsan 38:00 (2026-10-04, "Jeg er ved at blive sindssyg"), Chocolatepenguin 40:00 ("especially at the lava lake and bridge"), Whackatron 41:55. Historik: 2Mini22 36:50 (okt 2020, "banebryderen"), Bob d. IV 35:12 (apr 2022).
- Any%: 2006 Republic_Duck 31 s; 2010 Axest 30,65 s, GadgaardWest 31,16, glizzygobler_1 31,53 ("final skip-strat" = fyrværkeri direkte).

### Visuelt sprog – skal udfyldes fra frames (trin 4–5)
- Kendt: titelskærm med logo over månelandskab; menu viser byen i baggrunden; bykort-hub; vismand (tegnet af Minna Nørgaard); Grønlingen (grøn figur, Ole Steiness); "Ojsan det har kommit fel"-fejlfigur. Design: 2005 Director, 4:3 (GÆT 800×600 eller 640×480), prærenderede/håndtegnede bitmaps.

### Tropes vi må bruge generisk vs. IP vi IKKE må kopiere
- Generisk (ok): øde måne/rumkoloni-by der vokser med præstation; hub-kort med byggepladser; ældre fortæller der læser alt op og kan klikkes for hjælp; 4:3 Director-æstetik, store hitbox-knapper, "klik her"-pile, loopende 1-min MIDI-spor; minispil-arketyper (breakout, kran-fiskeri, bil der samler ting, sortering på transportbånd, søjlediagram-slider, opskrift-klik); fyrværkeri-finale; navnefelt + klassetrin-setup; "Udmærket"/"Hold da op"-feedback-tone.
- IKKE kopiere: navnet Måneby/MoonVille Math og logoet; Grønlingen/"guloppene" og den vise mands konkrete design; bygningsnavne (Drypstenshulen, De Rygende Bjerges Dal, Ørkensletten syd for Måneby, Spaltekløftdalen, Byggestenslageret, Den Dybe Kløft); de konkrete opgavetekster/ingredienser (knækrødder, månebær, blå tomater); musikken; stemmeoptagelserne; Bitfrost-grafik (© Bitfrost Interactive 2005, hostet på nåde).

## Kilder
maaneby.dk/en/ · /en/spillet/ · /en/historien/ · /en/om/ · /en/laerer/ · /en/spil/ (fixes-liste) · tbh.dk/en/projekter/maaneby · folkeskolen.dk/matematik-i-maaneby/ · archive.org/details/matematik-i-maneby-1.3.63-pc · speedrun.com API · YouTube hbFVRQBr-uI, BPb8mlsPx8c, 3ODez7G30gg, 4Unrt50_MHM, 1Rqhbet7RA4, H2L4BS-MFXI, 2DHq81wVt_w, lhFMvgicGdk.
