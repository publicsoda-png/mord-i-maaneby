# Plan: Endacopia research → research/endacopia/REPORT.md

Working dir (only writes here): `/private/tmp/claude-501/-Users-frederikjensen/559efee9-d52f-4282-9480-3a3d82a622e3/scratchpad/research/endacopia/` (subdirs `subs/ comments/ frames/ video/ web/` already created before plan mode took effect).

## Status
- Step 1 (web) — DONE in read-only mode; findings compiled below (section "Web findings").
- Steps 2–3 (yt-dlp subs, Markiplier 480p + 12 frames, ~200 comments) — NOT RUN (plan mode blocks file writes). Exact commands below.
- Step 4 (REPORT.md) — NOT WRITTEN; outline and web-based content below, to be merged with video/comment findings.

## Execution steps once approved

### Step 2a — auto-subs (4 analysis videos)
```
cd <RESEARCH>/subs
for id in 4ezcK1ZAJPU XXjZDXAg7Og 3oCGYDwC-HA KAJH-rGv2RE; do
  /opt/homebrew/bin/yt-dlp --no-cache-dir --skip-download --write-auto-sub --sub-lang en \
    --sub-format vtt -o "%(id)s.%(ext)s" "https://www.youtube.com/watch?v=$id"
done
```
Then flatten VTT → plain text with a python -I script kept in `<RESEARCH>/scripts/vtt2txt.py` (strip timestamps, dedupe rolling lines). Read each txt (Game Theory 21 min, Doom Prophet 30 min, Issac Morgan 56 min, GamerSault 12 min) and extract: narrative structure, escalation timeline, motifs, humor, minigames, meta/save tricks, endings, fan obsessions.

### Step 2b — Markiplier video (d04t4_xKVcg, 5405 s = 90 min) at ≤480p, 12 frames
```
cd <RESEARCH>/video
/opt/homebrew/bin/yt-dlp --no-cache-dir -f "bv*[height<=480]+ba/b[height<=480]" --merge-output-format mp4 -o "mark.%(ext)s" "https://www.youtube.com/watch?v=d04t4_xKVcg"
cd <RESEARCH>/frames
for i in $(seq 1 12); do t=$(( i*5405/13 )); /opt/homebrew/bin/ffmpeg -loglevel error -ss $t -i ../video/mark.mp4 -frames:v 1 -q:v 3 "f$(printf %02d $i)_${t}s.jpg"; done
```
Read all 12 frames; describe art style, UI, palette, how the edutainment look is faked (resolution, outlines, fonts, cursor, textures), and how horror imagery enters visually. (Note: Markiplier facecam overlay will occupy part of the frame — describe game region only.)

### Step 3 — comments (~200 each)
```
cd <RESEARCH>/comments
for id in d04t4_xKVcg 0fAXKxmNGxA; do
  /opt/homebrew/bin/yt-dlp --no-cache-dir --skip-download --write-comments \
    --extractor-args "youtube:comment_sort=top;max_comments=200,all,0" \
    -o "%(id)s" "https://www.youtube.com/watch?v=$id"
done
```
Parse `*.info.json` with python -I → `comments/<id>.txt` (author, likes, text). Select 10–15 quotes explaining appeal (tone-switch, humor, nostalgia, art, Andy's animation history).

### Step 4 — write `<RESEARCH>/REPORT.md`
Sections: Premise · Structure & length · Escalation curve (concrete beats) · Humor/absurdism techniques · Visual faking of edutainment · Audio/voice · Meta tricks · Minigames catalogue · Endings/secrets design · Appeal thesis (principles) · What NOT to copy · Sources. Mark guesses as [GÆT].

---

## Web findings (step 1, verified via fetch 2026-11-09)

### Facts
- Dev/publisher: Andyland (solo; YouTube/Newgrounds animator "Andyl4nd", reportedly Andrés Guerrero, Puerto Rican; also made Olive's Art-venture; credited on Picayune Dreams). Music: Packtion.
- Release 27 Jul 2026, Steam €16.76, soundtrack DLC, free demo (itch.io since Kickstarter era). Kickstarter goal $20,000, Nov 25 (2023 [GÆT year]); then "a couple years" dev.
- Steam: Overwhelmingly Positive, 98 % of ~7,018 reviews. Metacritic user 9.0 (24 ratings); AGH 97 %, SteamHype 9/10, Wanderer 8.5/10 (page now 410).
- Tags: Point-and-click, Psychological Horror, Surreal, Dark, Cute, Comedy, Colorful, Multiple Endings, Nonlinear. Content warning: body horror, psychological horror, blood, violence, death, drugs, jump-scares.
- Length: AGH ~10 h; SteamHype "a little over six hours" first run; Steam reviewers 14–20 h incl. secrets.

### Premise
Mellow, a child with a spherical pre-rendered head, bug eyes on a blank face, baseball cap, disembodied hands/feet; illiterate, poor memory, loves his Computer and Soccer Ball. Trapped in a house with Henry (hulking lizard-ish beast who clubs him with a bat). A toilet tongue-creature pulls him down a chasm; he loses eyes, hands, mouth and must recover each sense in a different world. Verbs: Look / Touch / Talk (right-click cycles cursor), WASD movement + mouse. Hint system = Tip, a scribble-faced signpost who becomes a friend. Save point = sentient red floppy disk; ONE save file.

### Structure
- Prologue "Escape the Bedroom": computer, doors.exe, cheese+cockroach, Wall Bank password ("Cheshire"), plunger → toilet → tutorial boss Clocky/Clockey.
- Hub: grassy hills → three worlds, any order, freely revisitable:
  1. Misery Town (circus for depressed clowns) → Hands (Ferris wheel → clown head → strength tester → clown mouth; Crawling Zombie boss; invisible maze in B/W room). Main chapter: matchmaking quest, Blue Man's weakness, cannon-poster films → whack-a-mole, medical tent maze, bingo at the toilet, plushie, Jester, parkour in main tent. Boss: Trapezist (end by pulling cord).
  2. Corporation / The Office (brutalist concrete, credit economy) → Mouth (earn 50 credits via minigames, paywall, lever puzzle, zipline, dialogue choices). Main chapter: £100 elevator + employment assessment; gambling floor (dice), office floor (sunflower, water cooler, customer calls incl. coaching a client to hide a body, Core room), efficiency tasks, Rube Goldberg, heartbeat painting. Boss: the Core (whack-a-mole style). Reward: toilet chain.
  3. Timesville (Animal-Crossing-like animal town; time of day advances when entering/leaving buildings; serial killer stalks at night; giant shadow chases you) → Eyes (shed after sunset, hidden bridge, abandoned house / Mr. Bear sequence, graveyard, grave, thank the hand). Main: Mayor Mirianne (overworked monkey), Catthew hide-and-seek ×3 → fishing licence, aquarium 6 fish by time of day, Owl's party, telescope puzzle, bone puzzle → metal detector, Beartha & Nibbles, VHS day/night matching, waterfall keypad. Boss: Chameleon (puppet health, phases).
- House interludes between worlds (linear, backstory): doors.exe, pencil+flashlight, cave paper fragments, mannequin face, map; attic toy chest, Henry's figurines, floppy disk, passwords.txt, saw (box code 471).
- Finale: last doors.exe, last door, sacrifice scene; final boss Henry (guide his swing into a hanging uvula).

### Escalation beats (cute → horror)
1. Cute: edutainment room, click-gags everywhere, smiley faces behind doors.
2. Slapstick violence: Henry's bat (explains amnesia/illiteracy); toilet creature.
3. Body loss as puzzle gating (no eyes/hands/mouth) — horror as mechanic.
4. Deaths: unique, bloodless-but-brutal/funny cutscenes, then time rewinds.
5. Timesville night: serial killer + chasing shadow; "This game can get DARK. Especially in the Animal town."
6. Bright area → sudden room of screaming faces and pulsating organs.
7. Office: coach a caller through hiding a body (comedy-as-horror).
8. House quest reveals "a monstrous horror" behind a wall; "something long and eldritch".
9. Punch-Out boss fights "to the death"; sacrifice scene; Henry finale.
Critics: only ~1/5 reads as horror; rest comedy adventure; "genuinely heartfelt" (found family, workaholism, abusive relationships, not preachy).

### Humor
Absurd/slapstick; every screen has clickable loop animations; item pickup reveals + Mellow looks at camera; Surgeon sings when asked what he's doing; lovestruck mime; elevator robot; gibberish dialogue with occasional full voice/musical numbers (fully vocalized clown track); Tip is short-tempered; "I beat a boss by crashing the game"; skateboard, clown girls. Criticism: Mellow swings between 9-year-old and media-savvy.

### Visual
Mix: pixel-art 2D, pre-rendered mid-90s 3D (Mellow switches 2D/3D), photo-collage/image manipulation; "simple pre-rendered shapes"; Flash-animation influence (PC Gamer). Edutainment lineage: Putt-Putt, Pajama Sam, Fatty Bear, 3-D Body Adventure (Kotaku). [Detailed UI/font/cursor analysis pending frames.]

### Audio
Packtion OST: "happy-go-lucky infomercial music" → "horribly unsettling electronic soundscapes"; each boss has own composition; gibberish voices; selective full VO for gags/songs.

### Meta tricks (confirmed by guides)
- Windowed Mode required for Timesville secret (dollhouse window lock).
- Office secret: rotate your screen to read clues; wait 1 real minute under a staircase; phone number read via telescope → called from in-game "Jobs" app → Morse code.
- in-game phone camera to photograph a map.
- Title screen shows completed endings; one save file; post-game reload talks to Surgeon; hidden developer encounter ("The Yeti": talk with Andyland, rhythm minigame).
- doors.exe / passwords.txt fake-OS layer inside Mellow's computer.

### Minigames catalogue
Toy train jumping, whack-a-mole with clowns, fishing (18 species × time of day), stealth past spotlights, dice, bingo, strength tester, hide-and-seek, parkour, medical tent obstacle courses, call-center dialogue branches, Rube Goldberg, lever puzzles, invisible maze, memory-pair sequence, rhythm game (secret), Punch-Out bosses. Typically <1–2 min.

### Endings
A "Escape (Family!)" — Toy Saw to toilet/Roger. B "Return (Family?)" — Real Saw; bedtime story to sister. C "Stay (Family.)" true ending — A+B done, all three area secrets, return to Mellow's Room in Ch. III epilogue; Clockey rematch; Surgeon typed-question scene. Bonus: Surgeon Q&A on reload; Yeti/Andyland encounter. Requirements for C disputed across guides.

### Appeal thesis (draft, to be checked against comments/subs)
1. Trusted-genre camouflage: fidelity to edutainment grammar (click-gags, smiley rewards) earns trust that is then broken.
2. Unpredictable switch timing — horror punctuates, doesn't dominate (~20 %).
3. Density: every screen rewards curiosity (loop animations) → streamers/viewers keep clicking.
4. Horror as mechanic (missing senses gate puzzles), not just imagery.
5. Deaths as content (unique cutscenes) — fail state is a reward.
6. Non-linear hub prevents stalls; short minigames vary pace.
7. Hidden depth/ARG-like meta secrets (windowed mode, screen rotation, real-time wait) feed community theory culture (Game Theory 1.1M views).
8. Heart under the dread: found-family theme and a pet-like protagonist.
9. Creator-as-brand: years of animations built an audience before release; Markiplier 5.8M views.

### Not to copy
Mellow, Henry, Tip, Surgeon, toilet-chasm, saw choice, the three specific worlds, "Family!/?/." endings, Punch-Out boss format as-is.

### Sources
Steam store; adventuregamehotspot.com/review/7096; endacopia.net (/, /endings/, /gameplay/, /walkthrough/); treyexgaming.com walkthrough; grindnstrat.com endings; steamhype.com review; kotaku.com (Putt-Putt article); metacritic; Steam community top reviews; AGH Kickstarter announcement; gearvn.com (PC Gamer-based). Wanderer review (410), PC Gamer (truncated), Newgrounds wiki (402) not readable.
