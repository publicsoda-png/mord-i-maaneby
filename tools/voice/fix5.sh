#!/bin/zsh
# Re-render the five clips a0's QC flagged (true peak > -1 dBTP or > 1.5 LU under target) with the TP=-1.5 + limiter chain.
set -e
cd "$(dirname "$0")"
T=./tts.sh
$T help2 "Rigtige svar giver flotte huse. Forkerte svar giver skæve huse. Men man kan altid prøve igen."
$T name_b "Flot, B."
$T ja_hende "Ja. Hende." 2
$T faerre_ja "Nå. Så bliver der … færre. Ja." 2
$T pedel2 "Den sidste linje i hendes fil var: tilbage om lidt." 2
for f in help2 name_b ja_hende faerre_ja pedel2; do
  ffmpeg -hide_banner -nostats -i "../../assets/voice/$f.ogg" -af "loudnorm=I=-16:TP=-1.5:print_format=summary" -f null - 2>&1 | grep -E "Input Integrated|Input True Peak" | tr '\n' ' '; echo " $f"
done
