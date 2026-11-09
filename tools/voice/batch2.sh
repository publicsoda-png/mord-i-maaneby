#!/bin/bash
# Batch 2 (RETNING 09-11 "Regnskabet"): de 13 nye replikker. Trin 0 = baseline, trin 2 = telefonfilter (efter jump scare).
# Kør: tools/voice/batch2.sh  — sletter først de 5 udgåede klip (name_b, gammel hjaelp400, pedel1, pedel2, knows_time).
cd "$(dirname "$0")"
T=./tts.sh
for id in name_b hjaelp400 pedel1 pedel2 knows_time; do rm -f ../../assets/voice/$id.{ogg,m4a,json}; done
$T intro4 "Fnuggerne hedder det, de blev talt til. Én, To, Tre, og så videre. Det er nemmest."
$T name_syv "Flot, Syv."
$T taeller_hoejt "Én, to, tre, fire, fem, seks ... otte, ni, ti, elleve, tolv. Det passer."
$T fjerne "Fjerne? Det gør vi ikke."
$T tretten "Fnuggerne venter på dig. Alle tretten."
$T hjaelp400 "Fire hundrede gange. Jeg tæller stadig. Det er det eneste, jeg kan."
$T idle_dag "Bygmester? Fnuggerne venter."
$T syv_navn "Det navn bruger vi ikke mere."
$T ord_kender "Det ord kender jeg ikke."
$T vaeret_her "Du har været her før. Det kan jeg tælle."
$T ovenpaa "Vi byggede ovenpå. Det plejer at hjælpe." 2
$T mistaenkt "Jeg har mistænkt bageren. Og isværket. Og kridtgruben. Ikke dig. Du kom først bagefter." 2
$T ja_elleve "Ja. Elleve." 2
rm -rf tmp 2>/dev/null || true
