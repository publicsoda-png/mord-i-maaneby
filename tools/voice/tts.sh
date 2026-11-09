#!/bin/bash
# Render one helper line: tts.sh <id> "<text>" [step]   step: 0 baseline (default) | 2 phone
# → assets/voice/<id>.ogg + .m4a + .json (mouth 0..3 per 80 ms). Loudness: 2-pass loudnorm to −16 LUFS (QUALITY-PLAN §3B).
set -e
cd "$(dirname "$0")"
ID="$1"; TXT="$2"; STEP="${3:-0}"
OUT=../../assets/voice; mkdir -p "$OUT" tmp
say -v Sara -r 165 -o "tmp/$ID.aiff" "$TXT"
if [ "$STEP" = "2" ]; then
  AF="highpass=f=300,lowpass=f=3400,acompressor=threshold=-20dB:ratio=4,volume=1.6,aresample=11025,aresample=22050"
else
  AF="highpass=f=120,lowpass=f=7000,acompressor=threshold=-18dB:ratio=3,volume=1.5,aresample=22050"
fi
ffmpeg -y -loglevel error -i "tmp/$ID.aiff" -af "$AF" -ac 1 "tmp/$ID.pre.wav"
M=$(ffmpeg -hide_banner -nostats -i "tmp/$ID.pre.wav" -af "loudnorm=I=-16:TP=-1:LRA=7:print_format=json" -f null - 2>&1 | sed -n '/{/,/}/p')
II=$(echo "$M" | sed -n 's/.*"input_i" *: *"\([^"]*\)".*/\1/p'); TP=$(echo "$M" | sed -n 's/.*"input_tp" *: *"\([^"]*\)".*/\1/p')
LRA=$(echo "$M" | sed -n 's/.*"input_lra" *: *"\([^"]*\)".*/\1/p'); TH=$(echo "$M" | sed -n 's/.*"input_thresh" *: *"\([^"]*\)".*/\1/p'); OFF=$(echo "$M" | sed -n 's/.*"target_offset" *: *"\([^"]*\)".*/\1/p')
LN="loudnorm=I=-16:TP=-1:LRA=7:measured_I=$II:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:offset=$OFF:linear=true"
ffmpeg -y -loglevel error -i "tmp/$ID.pre.wav" -af "$LN,aresample=22050" -ac 1 -c:a pcm_u8 "tmp/$ID.wav"
ffmpeg -y -loglevel error -i "tmp/$ID.wav" -c:a libopus -b:a 24k "$OUT/$ID.ogg"
ffmpeg -y -loglevel error -i "tmp/$ID.wav" -c:a aac -b:a 32k "$OUT/$ID.m4a"
/usr/bin/python3 -I rms.py "tmp/$ID.wav" > "$OUT/$ID.json"
printf '%-16s %s  in %s LUFS → -16\n' "$ID" "$(du -h "$OUT/$ID.ogg" | cut -f1)" "$II"
