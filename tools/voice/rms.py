#!/usr/bin/env python3 -I
"""RMS per 80 ms of a PCM WAV → JSON array of mouth frames 0..3 (stdout). Pure stdlib."""
import sys, wave, struct, json
w = wave.open(sys.argv[1], 'rb')
n, sw, sr = w.getnframes(), w.getsampwidth(), w.getframerate()
raw = w.readframes(n)
if sw == 1: samples = [(b - 128) / 128 for b in raw]
else: samples = [s / 32768 for s in struct.unpack('<%dh' % (len(raw) // 2), raw)]
win = int(sr * 0.08)
vals = []
for i in range(0, len(samples), win):
    chunk = samples[i:i + win]
    vals.append((sum(x * x for x in chunk) / max(1, len(chunk))) ** 0.5)
peak = max(vals) or 1
out = []
for v in vals:
    r = v / peak
    out.append(0 if r < 0.08 else 1 if r < 0.3 else 2 if r < 0.6 else 3)
print(json.dumps(out))
