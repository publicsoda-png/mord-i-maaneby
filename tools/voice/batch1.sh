#!/bin/bash
# Batch 1: alle nøglereplikker. Trin 0 = baseline, trin 2 = telefonfilter (efter jump scare).
cd "$(dirname "$0")"
T=./tts.sh
$T intro2 "Fnuggerne vil så gerne bygge en by, men de kan ikke regne. Det kan du. Så hjælper I hinanden."
$T intro3 "Klik på en byggeplads på kortet, så går vi i gang. Hvis du mangler hjælp, så klik på mig."
$T hub_first "Lad os begynde med Landingspladsen. Der er landet en masse kasser med byggesten."
$T hub_back1 "Godt. Hvad skal vi bygge nu?"
$T hub_back2 "Udmærket. Vælg en ny byggeplads."
$T hub_back3 "Fnuggerne venter på dig."
$T help1 "Klik på en byggeplads, så fortæller jeg, hvad der skal regnes ud."
$T help2 "Rigtige svar giver flotte huse. Forkerte svar giver skæve huse. Men man kan altid prøve igen."
$T help3 "I Måneby lægger vi sammen og ganger. Det er alt, hvad man behøver."
$T landing_intro "Kasserne lander ét ad gangen. Tæl dem, og klik på det rigtige tal. Du må gerne klikke på kasserne imens."
$T landing_ok "Godt klaret! Nu kan Fnuggerne bygge en rigtig landingsplads."
$T landing_ok_kk "Godt klaret klaret! Nu kan Fnuggerne bygge en rigtig landingsplads."
$T wrong1 "Hov, det går ikke. Tæl en gang til."
$T wrong2 "Det var ikke helt rigtigt. Prøv igen."
$T sticker "Du har fået et klistermærke til dit byggekort!"
$T name_b "Flot, B."
$T fyrv_venter "Fyrværkeriet venter, til byen er færdig."
$T ikke_endnu "Ikke endnu."
$T gemt "Dit byggeri er gemt."
$T gemt_lyver "Gemt!"
$T hjaelp400 "Fire hundrede gange. Det var også det, hun nåede."
$T knows_time "Det er torsdag. Klokken er femten fyrre. Det var den også dengang."
$T hvor_mange "Hvor mange bor her?"
$T godt_faerre "Godt. Nu er der færre."
$T et_sted_til "Der er ét sted til. Nedenunder." 2
$T ja_hende "Ja. Hende." 2
$T grav "Her ligger det, vi ikke har talt med. Grav." 2
$T det_tegn "Det tegn … det kender jeg ikke. Vis mig." 2
$T faerre_ja "Nå. Så bliver der … færre. Ja." 2
$T ikke_mord "Så det var ikke mord. Det var bare … mindre." 2
$T pedel1 "Jeg lukker klokken seksten. Hvorfor er du her?" 2
$T pedel2 "Den sidste linje i hendes fil var: tilbage om lidt." 2
rm -rf tmp 2>/dev/null || true
