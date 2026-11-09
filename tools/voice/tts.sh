#!/bin/bash
# Render one helper line: tts.sh <id> "<text>" [step]   step: 0 baseline (default) | 2 phone
# → assets/voice/<id>.ogg + .m4a + .json (mouth 0..3 per 80 ms)
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
ffmpeg -y -loglevel error -i "tmp/$ID.aiff" -af "$AF" -ac 1 -c:a pcm_u8 "tmp/$ID.wav"
ffmpeg -y -loglevel error -i "tmp/$ID.wav" -c:a libopus -b:a 24k "$OUT/$ID.ogg"
ffmpeg -y -loglevel error -i "tmp/$ID.wav" -c:a aac -b:a 32k "$OUT/$ID.m4a"
/usr/bin/python3 -I rms.py "tmp/$ID.wav" > "$OUT/$ID.json"
printf '%s  %s\n' "$ID" "$(du -h "$OUT/$ID.ogg" | cut -f1)"
