#!/bin/bash
# Render tools/music/mid/*.mid → assets/music/*.ogg (+ .m4a) at 22 050 Hz mono via fluidsynth + GeneralUser GS.
# Usage: tools/music/render.sh [name ...]   (no names = all .mid)
set -e
cd "$(dirname "$0")"
SF=sf2/GeneralUser-GS.sf2
OUT=../../assets/music
mkdir -p wav "$OUT"
names=("$@"); [ ${#names[@]} -eq 0 ] && names=($(ls mid | sed 's/\.mid$//'))
for n in "${names[@]}"; do
  nice -n 10 fluidsynth -ni -q -g 0.8 -r 44100 -F "wav/$n.wav" "$SF" "mid/$n.mid" >/dev/null 2>&1
  # trim the fluidsynth tail so the loop is seamless: keep exactly the MIDI length (printed by compose as seconds) is
  # not known here, so we trim trailing silence below -50 dB and add 20 ms fade.
  nice -n 10 ffmpeg -y -loglevel error -i "wav/$n.wav" -af "areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,aresample=22050,alimiter=limit=0.95" -ac 1 -c:a libopus -b:a 40k "$OUT/$n.ogg"
  nice -n 10 ffmpeg -y -loglevel error -i "wav/$n.wav" -af "areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,aresample=22050" -ac 1 -c:a aac -b:a 48k "$OUT/$n.m4a"
  printf '%s  %s\n' "$n" "$(du -h "$OUT/$n.ogg" | cut -f1)"
done
