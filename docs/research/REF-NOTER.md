# Referenceframes — Matematik i Måneby (dansk speedrun-video BPb8mlsPx8c, 640×480, 30 fps)
Mappe: docs/research/ref-frames/ (udvalg; fuld sæt lå i scratchpad 09-11). Kun måle-reference — aldrig Higgsfield-input. Vigtige filer:
- frames/f_0005.png — titel/setup: logo "Matematik i Måneby+" i orange Comic-agtig fed skrift med sort kontur over prærenderet månelandskab (orange Bryce-terræn, lilla/sort stjernetåge-himmel, blå planet). Setup-dialog = afrundet mørkegrå halvtransparent boks, hvidt input-felt, grå bevel-knapper "Fortryd"/"OK" (Tahoma-lignende). Figurer i forgrunden: Poser-stive 3D-rumvæsner med store øjne + vismand med skæg og stav. Små hjørnetekster "Version: MiM Plus" / "Copyright 2006 Bitfrost Interactive" i kursiv.
- sc/s_000212.png — hub TIDLIGT: tom orange måneslette, kun byggepladser (stilladser, små redskaber, plader) og ca. 12 figurer stående stille. Vismand står STOR i venstre side (ca. 130×250 px, nederste venstre hjørne). To stenplade-knapper nederst: "GENTAG" og "VIDERE" med indhugget skrift (grå sten-bevel).
- sc/s_034412.png — hub MIDT: 8–10 hvide/grå runde moduler med Phong-specular og hårde skygger, radiomast, antenner. Figurer samme steder.
- sc/s_066053.png — hub SENT (OBS: sc/s_039911.png er et SORT cut-frame, brug det ikke): hele byen; grå asfaltvej snor sig mellem bygninger, rød bro, røde skilte-bygninger, blå scene/legeplads, flagstænger, lygtepæle, blomsterbed med farvede prikker. Bygningerne er pladsfaste "slots" der skifter sprite pr. trin.
- sc/s_036986.png — tom slette uden figurer (scene-baggrund før komposition — baggrund og figurer er separate lag).
- frames/f_0040…f_0300 — Drypstenshule-minispil: sort grotte med grå klippekant, prærenderede drypsten, hvide kugler, cyan ligninger i Arial, HUD-tekst "Diamanter: 0  Tid: 149" i rød/sort fed skrift øverst, grøn minearbejder-sprite i bunden.
- sidebyside_hub.png / sidebyside_setup.png — reference (venstre) vs. vores build (højre).
- ours_title/setup/hub/task.png — vores nuværende build.

## Bevægelse målt (magick compare, fuzz 8 %, 4–5 fps)
- Hub i hvile: 0,02–0,8 % af pixels ændrer sig pr. 250 ms (= cursor + evt. et enkelt sprite-step). Byen står STILLE. Ingen konstant idle-bob på figurer i de målte vinduer.
- Opgave-scene (Drypstenshule) under spil: 0,1 % i hvile, 2–10 % når bolden/kugler flytter sig, 25 % ved HUD/ligningsskift.
- Sceneskift: hvert hub↔opgave-skift går via et HELT SORT frame (cut to black, oftest 0,2–0,5 s) — 58 sceneskift på 37 min, næsten alle med sort imellem. Ingen crossfades set.

Konklusion: 2005-polish er IKKE konstant bevægelse. Det er (1) rige prærenderede stills med dybde, specular og skygger, (2) få men tydelige step-animationer (bygning dukker op, bold flyver, figur reagerer), (3) hårde cuts gennem sort, (4) oplæst stemme + musikloop der bærer "livet". Moderne glidende easing ville bryde illusionen.

## Rettelse til briefet (fundet 09-11 03:20)
- dialog.js HAR tekst-tik (28 cps med pauser) og procedurel mund; hub.js HAR konstant Fnug-bob (sin-bob 1,5 px + 3-frame-cyklus hver 400 ms). Briefets "ingen tekst-tik" er forkert; bobben er omvendt MERE liv end referencen.
- Dialog-tekst er DOM oven på canvas og renderes i enhedsopløsning (skarp 2×), ikke på 640-gitteret.
