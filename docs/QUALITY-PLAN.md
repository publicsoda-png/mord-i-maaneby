# QUALITY-PLAN — æstetik-match mod *Matematik i Måneby* + polish-gates

Vedtaget 09-11-2026 via council (plan-mode, 2 proposers Fable/Opus → 3 Claude-linser → chair). Vinder: den "sikre" plan (7,33) med alle dommernes rettelser indarbejdet. Referencemateriale og målinger: `docs/research/REF-NOTER.md` (kopi fra scratchpad) — frames fra den danske gameplay-video, ikke Bitfrost-assets, og de bruges KUN som måle-reference, aldrig som Higgsfield-input.

## 0. Hvad referencen faktisk gør (målt, ikke gættet)
- Polish = **dybde, ikke bevægelse**. Prærenderet 3D (Bryce-terræn, Phong-specular, hårde slagskygger), stor hjælperfigur i scenen, stemme + musikloop bærer livet.
- Hub i hvile: **0,02–0,8 %** af pixels ændrer sig pr. 250 ms (fuzz 8 %). Byen står stille; figurer står stille.
- **Alle sceneskift går gennem helt sort** (0,2–0,5 s). 58 skift på 37 min, ingen crossfades.
- Bygninger er pladsfaste slots, der skifter sprite pr. trin (stillads → modul → færdig med flag/lys). Vej og detaljer vokser med byen.
- UI: stenplade-knapper med indhugget tekst, ingen persistent HUD-bjælke, HUD-tal står som fed farvet tekst med kontur direkte i scenen. Setup-boks er afrundet og halvtransparent oven på et fuldt motiv, figurer skærer ind foran.

## 1. Gap pr. skærm (status 09-11, working tree)
| Skærm | Mangler | Prioritet |
|---|---|---|
| Titel | render-baggrund med dybde; logo med gradient + 2 px kontur + hård skygge; figurer i forgrunden; kursive hjørnetekster. Fjern `Math.sin`-bob på logoet i boot.js (bevægelse skal være step, ikke glid) | A |
| Setup | motiv bag boksen; afrundede hjørner (r≈8–10) + ~70 % alpha; dobbelt så stort inputfelt med blinkende markør (530 ms) | B |
| Loader/krom | koreograferet ryk (0→23 % / hold / spring til 71 % / hold / 100 %, 3–5 s), seek-klik synkront, 0,5 s stilhed før titel | C |
| Hub | hjælperen STOR i scenen (~130×250, nederst venstre) i stedet for topbjælke; sten-knapper; bygnings-slots med 3 trin + stillads-trin 0; hårde dropskygger; vej; HUD-bjælke væk | A |
| Opgave | prærenderet ramme/baggrund; HUD som fed tekst med kontur i scenen | A |
| Dialog/portræt | boksen væk; mund som 3 sprite-frames; øjenblink; **tekst skal rasteriseres på 640-gitteret** (DOM-tekst renderes i dag i enhedsopløsning og bryder pixel-looket) | A |
| Knapper | hover = kun cursorskift (ingen lysere gradient); tryk = inverteret bevel + tekst 1 px ned/højre; klik-lyd på pointerdown, handling på pointerup | B |
| Cursor | OK — behold 1 frame lag | — |

## 2. Polish-bibel (Director 2005) — det, gates måler
- **Step-ur 10 fps** for al sprite-animation (`step = floor(t/100)`); kun cursor tegnes ved 60 fps. Ingen interpolation, ingen easing.
- **Sceneskift:** hårdt cut via sort, 200–500 ms (findes: `goto()` holder 280 ms). Dissolve kun som Bayer-4×4 "pixels"-dissolve i 8 trin à 60 ms og kun ved fortællings-beats (falsk slutning, dag→nat), maks 3 gange i spillet.
- **Tekst-tik:** 28 cps (tilladt 24–32), tidsbaseret (findes). Pauser `.` 260 ms, `,` 120 ms, `…` 420 ms. ▼ blinker 500/500 ms.
- **Mund:** 3 frames (lukket/halv/åben) på step-uret, styret af voice-RMS (tærskler 0,08 / 0,2). Lukker senest 1 step efter replik. Blink hvert 3–6 s, 2 frames.
- **Fnug-idle:** ingen kontinuerlig bob. Hver 4–9 s én mikrohandling (3–4 frames) på én tilfældig Fnug, maks 2 ad gangen.
- **Bygning trin n→n+1:** gammel sprite 600 ms → støvsky 2 frames → ny sprite med 2-frame pop → pling på samme frame som ny sprite (±1 frame) → stjerner 600 ms → hjælperens replik +400 ms. Cursor = wait imens (1,2 s).
- **Forbudt:** `ease-*`, `cubic-bezier`, CSS `transition`, alfa-crossfade, blur, parallax, sub-pixel-glid, skalerings-tweens, bløde skygger.
- *Appendix (ønsket, ikke gated):* fyrværkeri (raket 40 px/step i 6 steps, 24–32 partikler 2×2 px, 8-farvers palette, 3 palettetrin-fade, burst hver 700–1200 ms), loader-forløb, "klik her"-pil (hopper 6 px, 2 frames ved 4 fps, efter 8 s inaktivitet).

## 3. Quality check — køres af en ANDEN agent end bygge-agenten
Tærskler ligger i `tools/test/gates.json`; bygge-agenten må ikke ændre dem. Rapport = `qc-report.json` + kontaktark + git-hash + md5 af frames.

**A. Automatisk (`tools/test/polish.mjs`, bygger videre på `shots.mjs` med viewport 640×480, `deviceScaleFactor:1`, cursor skjult):**
1. *Bevægelse:* 24 frames over 2 s pr. scene i hvile. Gate: **maks 0,8 % pr. 250 ms** (fuzz 8 %) **og** mindst ét ikke-nul step i et 10 s-vindue (så "dødt" også fejler). Ingen sprite-region over 12 unikke frames/s.
2. *Overgange:* CDP `Page.startScreencast` hen over hvert `goto`. Gate: ≥1 frame med middel-luminans < 8, sort-varighed 200–500 ms, 0 blandede frames uden for dissolve-listen. Statisk: 0 `goto(` uden for `core/scene.js`, 0 CSS `transition`.
3. *Palette:* alle PNG i `assets/` er PNG8 (color type 3, ≤256 farver); canvas-frames ≤256 unikke farver.
4. *Tekst-AA (separat let kørsel, 1 frame pr. scene ved `deviceScaleFactor:2`):* ≥99 % af 2×2-blokke ensfarvede → beviser at intet renderes under stage-pixel (fanger DOM-teksten).
5. *Placeholder:* fra fase 4: 0 import af `art/placeholder.js`, 0 `proc(`-kald i render; hver scene ≥1 billede fra `assets/bg`.
6. *Timing:* krydstjek sfx-start mod screencast-frames (A2-metoden), ikke selvrapporteret trace. Gates: pling ±83 ms fra bygnings-swap; mund ≠ lukket kun mens voice spiller; tekst 24–32 cps.
7. *Kode-grep:* `Math.sin` kun tilladt i allowlist (audio.js mund, placeholder.js statisk tegning); 0 i render-loops i `src/scenes/*.js`.

**B. Det stills ikke viser** (timing, step-rate, lyd/billede-sync, hover-respons, dissolve, loudness): screencast → `ffmpeg -r 10` GIF + kontaktark (1 frame/100 ms) til dommerne. Loudness: musik −18 LUFS, stemme −16 LUFS (ffmpeg `ebur128`). Frederik lytter i lyt-artifactet (fase 3).

**C. Blind side-om-side = council-skill design-mode** (`blind.py`, `no_gpt`+`no_gemini`, aldrig bygge-agenten): par af reference/vores, tilfældig side, uden filnavne; til bevægelse kontaktark af samme handling. Rubrik 1–10: æra-ægthed · liv (rigtig mængde, ikke maks) · håndværk (skygger, kanter, fringe) · læsbarhed. **IP-linse med veto måles samtidig** (dommerne ser Bitfrost-frames side om side — intet må ligne Grønling/vismand/bygningsnavne). Bestået: median ≥7 pr. akse, ingen enkeltscore <5.

**D. Polish-DoD pr. scene** i review-artifact med **Ja/Måske/Nej** pr. linje (krom, titel, setup, hub dag, hub nat, opgave, dialog): render-baggrund PNG8 · figurer med fringe · knapper 3 tilstande · overgang efter biblen · ≥1 step-animation · lyd på hver handling · tekst på gitteret · A1–A7 grønne · C ≥7. Rene tekst-tjeklister = skema i chatten.

Anti-snyd: gates er intervaller, horror-brud (fase 5) står på en whitelist i `wrongness.js` FØR kørsel, så den rene fase stadig skal bestå og polish ikke "retter" bruddene væk.

## 4. Rækkefølge (størst løft pr. time først)
1. **Verificér + commit + gate** (ikke byg): cut-to-black i `goto()` og stille Fnugger findes i working tree → commit, kør A1/A2 på placeholders. Fjern logo-bob i boot.js, hover-gradient i style.css, tekst på 640-gitteret, 3 knap-tilstande. (½ dag)
2. `polish.mjs` A1–A7 + `gates.json` + screencast→GIF. (½ dag) — før flere pixels laves.
3. Fase 2 stil-lås: titel- og hub-renders, hjælperen i scenen, bygnings-slots ×3 trin — **Nano Banana Pro på Unlimited (egen fane, tjek switch)**, retro.py-post. Største visuelle spring; palette-gaten begynder at bestå her. (1 dag)
4. Belønningsanimation, mund-sprites, blink, sten-knapper, HUD-bjælke væk. (½ dag)
5. Fase 3 lyd-sync (A6). 

## 5. Gates i PLAN.md §8 — afgøres af council (3 Claude-linser inkl. IP-veto); Frederiks artifact er override, ingen fase VENTER på ham
- **G1** (slut fase 1): A1, A2, A4, A6 grønne på placeholders; GIF'er af spil-feel i review-artifact (Ja/Måske/Nej pr. linje).
- **G2** (fase 2 stil-lås): C ≥7 på titel, setup, hub; A3 + A5 for godkendte assets; IP-veto = 0.
- **G3** (fase 3): A6 sync + lyt-artifact.
- **G4** (hver batch à 6 i fase 4): hele A + C + DoD; næste batch først når forrige er grøn.
- **G5** (fase 5): nat/horror mod samme gates; afvigelser whitelistet i `wrongness.js`.
- **G6** (fase 6): fuld regression (10 min videogennemspilning) + to testspillere.
