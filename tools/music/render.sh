#!/bin/bash
# Render tools/music/mid/*.mid → assets/music/*.ogg (+ .m4a) at 22 050 Hz mono via fluidsynth + GeneralUser GS.
# Usage: tools/music/render.sh [name ...]   (no names = all .mid)
set -e
cd "$(dirname "$0")"
SF=sf2/GeneralUser-GS.sf2
OUT=../../assets/music
mkdir -p wav "$OUT"
names=("$@"); [ ${#names[@]} -eq 0 ] && names=($(ls mid | sed 's/\.mid$//'))
# Loudness (QUALITY-PLAN §3B): music −18 LUFS integrated, true peak −1 dBTP. Deliberate offsets (dB) per file:
offset() { case "$1" in
  byen_morgen) echo -8 ;;          # "stille morgen": −8 dB, LYDPLAN §3
  raadhus) echo -6 ;;              # pad only, never meant to carry
  byen_minus1) echo -1 ;; byen_minus2) echo -2 ;; byen_minus3) echo -3 ;; byen_minus4) echo -4 ;;
  byen_minus5) echo -5 ;; byen_minus6) echo -6 ;; byen_minus7) echo -7 ;;   # the ladder gets quieter too
  *) echo 0 ;; esac; }
for n in "${names[@]}"; do
  nice -n 10 fluidsynth -ni -q -g 0.8 -r 44100 -F "wav/$n.wav" "$SF" "mid/$n.mid" >/dev/null 2>&1
  # trim trailing fluidsynth tail below -50 dB so the loop is seamless, then 2-pass loudnorm to −18 LUFS + offset
  TRIM="areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse"
  nice -n 10 ffmpeg -y -loglevel error -i "wav/$n.wav" -af "$TRIM" -ac 1 "wav/$n.trim.wav"
  M=$(nice -n 10 ffmpeg -hide_banner -nostats -i "wav/$n.trim.wav" -af "loudnorm=I=-18:TP=-1:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/{/,/}/p')
  II=$(echo "$M" | sed -n 's/.*"input_i" *: *"\([^"]*\)".*/\1/p'); TP=$(echo "$M" | sed -n 's/.*"input_tp" *: *"\([^"]*\)".*/\1/p')
  LRA=$(echo "$M" | sed -n 's/.*"input_lra" *: *"\([^"]*\)".*/\1/p'); TH=$(echo "$M" | sed -n 's/.*"input_thresh" *: *"\([^"]*\)".*/\1/p'); OFF=$(echo "$M" | sed -n 's/.*"target_offset" *: *"\([^"]*\)".*/\1/p')
  TARGET=$(( -18 + $(offset "$n") ))
  LN="loudnorm=I=$TARGET:TP=-1:LRA=11:measured_I=$II:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:offset=$OFF:linear=true"
  nice -n 10 ffmpeg -y -loglevel error -i "wav/$n.trim.wav" -af "$LN,aresample=22050" -ac 1 -c:a libopus -b:a 40k "$OUT/$n.ogg"
  nice -n 10 ffmpeg -y -loglevel error -i "wav/$n.trim.wav" -af "$LN,aresample=22050" -ac 1 -c:a aac -b:a 48k "$OUT/$n.m4a"
  rm -f "wav/$n.trim.wav"
  printf '%-16s %s  in %s LUFS → %s\n' "$n" "$(du -h "$OUT/$n.ogg" | cut -f1)" "$II" "$TARGET"
done
