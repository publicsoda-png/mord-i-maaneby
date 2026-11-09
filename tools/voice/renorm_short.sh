#!/bin/bash
# Short clips never reach −16 LUFS through loudnorm (integrated measurement is unreliable under ~3 s).
# Fixed gain + hard limiter instead (a0's suggestion). Usage: tools/voice/renorm_short.sh name_b 2.7
set -e
cd "$(dirname "$0")/../.."
id="$1"; gain="${2:-2.7}"
src="assets/voice/$id.ogg"
tmp="tools/voice/tmp"; mkdir -p "$tmp"
ffmpeg -y -loglevel error -i "$src" -af "volume=${gain}dB,alimiter=limit=0.84:attack=1:release=50:level=false" -ar 22050 -ac 1 "$tmp/$id.wav"
ffmpeg -y -loglevel error -i "$tmp/$id.wav" -c:a libopus -b:a 24k "assets/voice/$id.ogg"
ffmpeg -y -loglevel error -i "$tmp/$id.wav" -c:a aac -b:a 32k "assets/voice/$id.m4a"
ffmpeg -loglevel info -i "assets/voice/$id.ogg" -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
