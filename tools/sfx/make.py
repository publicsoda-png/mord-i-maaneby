#!/usr/bin/env python3
"""Synthetic 2005-cd-rom sample catalogue (LYDPLAN §4–5). Every sound is synthesised with numpy, then forced through a
22 050 Hz / 8-bit round-trip so the era artefacts live in the file, then encoded by ffmpeg to .ogg (opus) + .m4a.
Usage: <venv>/bin/python tools/sfx/make.py [name ...]      (no names = all)
Groups: os_* ui_* mg_* (minispil) wr_* (wrongness) amb_* (loops) ir_* (impulsresponser, wav only)."""
import sys, os, subprocess, math
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100          # synthesis rate
OUT_SR = 22050      # era rate
rng = np.random.default_rng(2005)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', '..', 'assets', 'sfx'))

# ---------------- primitives ----------------
def t_(dur): return np.arange(int(SR * dur)) / SR
def sine(f, dur, f1=None, phase=0.0):
    t = t_(dur)
    if f1 is None: return np.sin(2 * np.pi * f * t + phase)
    k = np.log(f1 / f) / dur if f1 != f else 0.0
    ph = 2 * np.pi * f * (np.expm1(k * t) / k if k else t)
    return np.sin(ph + phase)
def square(f, dur, f1=None): return np.sign(sine(f, dur, f1) + 1e-9)
def saw(f, dur):
    t = t_(dur); return 2 * ((f * t) % 1.0) - 1
def tri(f, dur, f1=None): return 2 / np.pi * np.arcsin(sine(f, dur, f1))
def white(dur): return rng.uniform(-1, 1, int(SR * dur))
def brown(dur):
    x = np.cumsum(white(dur)); x -= np.linspace(x[0], x[-1], len(x)); return x / (np.abs(x).max() + 1e-9)
def env(dur, a=0.002, d=0.05, s=0.0, r=0.05, curve=4.0):
    n = int(SR * dur); e = np.zeros(n)
    na, nd, nr = int(SR * a), int(SR * d), int(SR * r)
    na = max(1, min(na, n)); e[:na] = np.linspace(0, 1, na)
    nd = min(nd, n - na)
    if nd > 0: e[na:na + nd] = 1 - (1 - s) * (1 - np.exp(-curve * np.linspace(0, 1, nd))) / (1 - math.exp(-curve))
    e[na + nd:] = s
    nr = min(nr, n); e[n - nr:] *= np.linspace(1, 0, nr)
    return e
def decay(dur, k=8.0): return np.exp(-k * t_(dur))
def lp(x, fc, order=2): b, a = signal.butter(order, fc / (SR / 2), 'low'); return signal.lfilter(b, a, x)
def hp(x, fc, order=2): b, a = signal.butter(order, fc / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def bp(x, lo, hi, order=2): b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def fit(x, n): return np.pad(x, (0, max(0, n - len(x))))[:n]
def mix(*parts):
    n = max(len(p) for p in parts); return sum(fit(p, n) for p in parts)
def at(x, dur_total, start):
    n = int(SR * dur_total); s = int(SR * start); return fit(np.pad(x, (s, 0)), n)
def norm(x, peak=0.9): return x / (np.abs(x).max() + 1e-9) * peak
def seq(*items):
    end = max(s + len(a) / SR for s, a in items); return mix(*[at(a, end, s) for s, a in items])
def warm(x, s=1.0):
    """Drop the first s seconds: a butter filter starts from zero state, so a filtered periodic signal has a warm-up ramp
    that would otherwise sit at the loop point (QC 10-11: amb_crt/amb_edb seam jump 0.3)."""
    return x[int(SR * s):]

def loopable(x, xf=0.5):
    """Crossfade the tail into the head so the loop point is seamless."""
    n = int(SR * xf); head, tail = x[:n].copy(), x[-n:].copy()
    w = np.linspace(0, 1, n)
    out = x[:-n].copy(); out[:n] = head * w + tail * (1 - w); return out

# ---------------- catalogue ----------------
S = {}
def snd(name):
    def deco(f): S[name] = f; return f
    return deco

# --- OS chrome (own sounds, never Microsoft's) ---
@snd('os_startup')
def _():
    pad = sum(0.25 * sine(f, 4.0) * env(4.0, 0.6, 1.5, 0.5, 1.5) for f in [130.8, 196.0, 329.6, 523.3])
    pad = lp(pad, 1800)
    arp = seq(*[(0.3 + i * 0.35, 0.35 * sine(f, 1.2) * decay(1.2, 5)) for i, f in enumerate([1046.5, 1318.5, 1568, 2093, 1568, 1318.5])])
    return norm(mix(pad, arp), 0.8)
@snd('os_cd_eject')
def _(): return norm(mix(bp(white(0.4), 400, 1400) * decay(0.4, 12), at(lp(square(120, 0.03), 2000) * decay(0.03, 40), 0.4, 0.3)), 0.7)
@snd('os_ding_info')
def _(): return norm(seq((0, sine(880, 0.5) * decay(0.5, 6)), (0.12, sine(1320, 0.7) * decay(0.7, 5))), 0.75)
@snd('os_ding_fejl')
def _(): return norm(seq((0, tri(440, 0.35) * decay(0.35, 7)), (0.18, mix(tri(330, 0.6) * decay(0.6, 5), 0.3 * lp(square(110, 0.6), 600) * decay(0.6, 7)))), 0.8)
@snd('os_print')
def _():
    out = np.zeros(int(SR * 3.2))
    for line in range(7):
        s = 0.1 + line * 0.42
        burst = bp(white(0.3), 1500, 6000) * (0.5 + 0.5 * square(60, 0.3)) * env(0.3, 0.01, 0.05, 0.8, 0.03)
        out += at(burst, 3.2, s)
        out += at(lp(tri(90, 0.05), 400) * decay(0.05, 30) * 0.6, 3.2, s + 0.33)
    return norm(out, 0.7)
@snd('os_crt_aflad')
def _():
    whine = sine(3200, 0.25, 40) * decay(0.25, 10)
    n = int(SR * 2.5); cr = np.zeros(n)
    idx = rng.integers(0, n, 160); keep = idx < n * (1 - np.linspace(0, 0.9, 160)); idx = idx[keep]
    cr[idx] = rng.uniform(0.2, 1.0, len(idx)) * np.sign(rng.uniform(-1, 1, len(idx)))
    cr = lp(cr, 5000) * decay(2.5, 2)
    return norm(mix(whine, at(cr, 2.5, 0.1)), 0.7)

# --- Program UI (Director feel) ---
@snd('ui_boble')
def _(): return norm(sine(500, 0.06, 900) * decay(0.06, 30), 0.6)
@snd('ui_hub_klik')
def _(): return norm(mix(lp(white(0.02), 3000) * decay(0.02, 150), sine(700, 0.03, 300) * decay(0.03, 60)), 0.7)
@snd('ui_bygning_op1')
def _(): return norm(mix(lp(brown(0.18), 900) * decay(0.18, 18), 0.4 * tri(180, 0.12, 90) * decay(0.12, 20)), 0.8)
@snd('ui_bygning_op2')
def _(): return norm(mix(sine(1760, 1.2) * decay(1.2, 3), 0.5 * sine(2640, 1.0) * decay(1.0, 5), 0.3 * sine(4400, 0.5) * decay(0.5, 8)), 0.7)
@snd('ui_bygning_op3')
def _():
    stab = lambda fs, d: lp(sum(saw(f, d) for f in fs) * env(d, 0.005, 0.1, 0.4, 0.08), 3500) / len(fs)
    return norm(seq((0, stab([523, 659, 784], 0.25)), (0.25, stab([523, 659, 784], 0.25)), (0.5, stab([784, 1047, 1319], 0.7))), 0.8)

# --- Minispil ---
@snd('mg_kasse_dump')
def _(): return norm(mix(lp(brown(0.25), 500) * decay(0.25, 14), 0.3 * bp(white(0.08), 800, 3000) * decay(0.08, 40)), 0.8)
@snd('mg_taelle_bip')
def _(): return norm(square(1200, 0.045) * env(0.045, 0.002, 0.02, 0.6, 0.01), 0.45)
@snd('mg_dej_klask')
def _(): return norm(mix(lp(white(0.12), 1200) * decay(0.12, 25), 0.5 * sine(140, 0.1, 60) * decay(0.1, 20)), 0.7)
@snd('mg_ovn_ding')
def _(): return norm(mix(sine(2093, 0.9) * decay(0.9, 4), 0.4 * sine(3136, 0.6) * decay(0.6, 6)), 0.6)
@snd('mg_roer_klik')
def _(): return norm(mix(lp(white(0.015), 4000) * decay(0.015, 200), sine(2400, 0.02, 1200) * decay(0.02, 80)), 0.6)
@snd('mg_vand_gurgle')
def _():
    t = t_(0.7); f = 300 + 250 * np.sin(2 * np.pi * 7 * t) + 120 * np.sin(2 * np.pi * 2.3 * t)
    g = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0.7, 0.02, 0.3, 0.5, 0.2)
    return norm(lp(mix(g, 0.4 * bp(white(0.7), 300, 1200) * env(0.7, 0.05, 0.3, 0.4, 0.2)), 2500), 0.6)
@snd('mg_ventil_hvaes')
def _(): return norm(bp(white(0.5), 2000, 7000) * env(0.5, 0.01, 0.2, 0.5, 0.2), 0.5)
@snd('mg_kikkert_drej')
def _():
    t = t_(0.45); f = 70 + 20 * np.sin(2 * np.pi * 3 * t)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
    return norm(lp(x, 1500) * (0.6 + 0.4 * square(38, 0.45)) * env(0.45, 0.02, 0.1, 0.8, 0.08), 0.5)
@snd('mg_stjerne_pling')
def _(): return norm(mix(sine(2637, 0.6) * decay(0.6, 6), 0.5 * sine(3951, 0.5) * decay(0.5, 9)), 0.55)
@snd('mg_tast_klik')
def _(): return norm(mix(lp(white(0.012), 5000) * decay(0.012, 250), 0.6 * lp(white(0.065), 1500) * at(decay(0.02, 150), 0.065, 0.045)), 0.7)
@snd('mg_kridt')
def _(): return norm(bp(white(0.22), 2500, 6500) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 23 * t_(0.22)))) * env(0.22, 0.01, 0.1, 0.7, 0.05), 0.4)
@snd('mg_skoleklokke')
def _():
    ring = sum(0.3 * sine(f, 1.6) * decay(1.6, 2) for f in [1780, 2370, 3560])
    return norm(ring * (0.75 + 0.25 * square(17, 1.6)), 0.7)
@snd('mg_bold_boing')
def _(): return norm(sine(420, 0.18, 180) * decay(0.18, 14), 0.7)
@snd('mg_krystal_knaek')
def _(): return norm(mix(hp(white(0.09), 3000) * decay(0.09, 40), sum(0.3 * sine(f, 0.4) * decay(0.4, 10) for f in [3200, 4100, 5300])), 0.7)
@snd('mg_blok_dunk')
def _(): return norm(mix(lp(brown(0.3), 300) * decay(0.3, 12), 0.4 * sine(90, 0.25, 45) * decay(0.25, 12)), 0.85)
@snd('mg_slider_rasle')
def _(): return norm(bp(white(0.09), 1500, 5000) * (0.5 + 0.5 * square(90, 0.09)) * decay(0.09, 30), 0.5)
@snd('mg_lys_drej')
def _(): return norm(lp(mix(saw(42, 0.8) * 0.5, brown(0.8) * 0.6), 400) * env(0.8, 0.05, 0.3, 0.7, 0.2), 0.7)
@snd('mg_morse_bip')
def _(): return norm(sine(800, 0.12) * env(0.12, 0.004, 0.02, 1.0, 0.01), 0.5)
@snd('mg_skovl')
def _(): return norm(mix(bp(white(0.35), 300, 2500) * env(0.35, 0.02, 0.1, 0.6, 0.15), 0.5 * lp(brown(0.2), 400) * decay(0.2, 15)), 0.7)
@snd('mg_papir_riv')
def _():
    t = t_(0.5)
    return norm(bp(white(0.5), 900, 7000) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 60 * t * (1 + t)))) * env(0.5, 0.01, 0.2, 0.7, 0.05), 0.55)

# --- Wrongness ---
@snd('wr_palette_knaek')
def _():
    # one full-scale 8-bit "knæk": three 22 kHz samples (6 at synthesis rate) so it survives the decimation
    x = np.zeros(int(SR * 0.05)); x[0:6] = [1.0, 1.0, -1.0, -1.0, 1.0, 1.0]; return x
@snd('wr_jump')
def _():
    x = mix(white(0.3), 0.9 * square(1000, 0.3, 1400)) * env(0.3, 0.001, 0.05, 0.8, 0.02)
    return np.clip(x * 4, -1, 1)
@snd('wr_knald_vaeg')
def _(): return norm(lp(mix(brown(1.2) * decay(1.2, 4), 0.6 * sine(55, 1.0, 30) * decay(1.0, 5)), 220), 0.8)
@snd('wr_radiator_tik')
def _(): return norm(mix(lp(white(0.01), 2500) * decay(0.01, 300), 0.5 * sine(1800, 0.06, 900) * decay(0.06, 50)), 0.5)
@snd('wr_telefon_knitren')
def _(): return norm(bp(white(0.025), 1200, 3200) * decay(0.025, 120), 0.4)
@snd('wr_morse_syv')
def _():
    code = '... -.-- ...-'; unit = 0.08; items = []; t = 0.0
    for ch in code:
        if ch == '.': items.append((t, sine(800, unit) * env(unit, 0.003, 0.01, 1, 0.005))); t += 2 * unit
        elif ch == '-': items.append((t, sine(800, 3 * unit) * env(3 * unit, 0.003, 0.01, 1, 0.005))); t += 4 * unit
        else: t += 2 * unit
    return norm(seq(*items), 0.5)

# --- Ambience loops (seamless) ---
@snd('amb_dag')
def _(): return norm(loopable(bp(brown(14.0), 60, 200), 1.0), 0.5)
@snd('amb_ventilation')
def _():
    L = 16.0; xf = 1.5; x = bp(white(L), 200, 600); lfo = 0.8 + 0.2 * np.sin(2 * np.pi * (1 / (L - xf)) * t_(L))  # LFO-periode = loop-længde, så niveauet er ens ved sømmen
    return norm(loopable(x * lfo, xf), 0.6)
@snd('amb_crt')
def _():
    x = warm(lp(saw(50, 13.5), 900)) * 0.6 + 0.08 * sine(7812.5, 12.5) + 0.05 * warm(lp(white(13.5), 300))
    return norm(loopable(x, 0.5), 0.5)  # 12.5 − 0.5 s crossfade = 12.0 s = 600 hele 50 Hz-perioder
@snd('amb_kridt')
def _():
    out = np.zeros(int(SR * 14.0))
    for _ in range(26):
        s = rng.uniform(0, 13.5); d = rng.uniform(0.15, 0.45)
        out += at(bp(white(d), 2500, 6500) * env(d, 0.01, 0.1, 0.7, 0.05) * rng.uniform(0.3, 0.8), 14.0, s)
    return norm(loopable(out, 0.3), 0.45)
@snd('amb_edb')
def _():
    vent = bp(white(15.0), 150, 700) * 0.7; whine = 0.12 * sine(15625 / 2, 15.0); hum = 0.25 * warm(lp(saw(50, 16.0), 400))  # 15 − 1 s = 14.0 s = 700 perioder
    flap = at(bp(white(0.3), 300, 2000) * decay(0.3, 10) * 0.5, 15.0, 9.2)
    return norm(loopable(mix(vent, whine, hum, flap), 1.0), 0.6)
@snd('amb_log')
def _():
    hum = 0.6 * sine(40, 16.0) + 0.2 * sine(80, 16.0)
    out = np.zeros(int(SR * 16.0))
    for _ in range(7):
        s = rng.uniform(0, 15.0); out += at(lp(brown(0.4), 350) * decay(0.4, 8) * rng.uniform(0.2, 0.5), 16.0, s)
    return norm(loopable(mix(hum, out), 1.0), 0.6)
@snd('amb_svaev')
def _():
    a = bp(brown(14.0), 60, 200); b = signal.resample(a, int(len(a) / 2 ** (7 / 1200)))
    return norm(loopable(mix(a, b), 1.0), 0.5)

# --- Impulse responses (wav only, 22 050 Hz float, not 8-bit) ---
IR = {}
def ir(name):
    def deco(f): IR[name] = f; return f
    return deco
@ir('ir_edb')
def _():
    x = lp(white(0.6) * decay(0.6, 9), 5000)
    for d, g in [(0.004, 0.7), (0.011, 0.5), (0.019, 0.4), (0.027, 0.3)]: x += at(np.array([g]), 0.6, d)
    return norm(x, 0.8)
@ir('ir_tomt')
def _(): return norm(lp(white(2.5) * decay(2.5, 2.2), 3500), 0.7)

# ---------------- render ----------------
def era(x, loop=False):
    """22 050 Hz / 8-bit round trip: decimate, quantise to 256 levels, back to float.
    loop=True: wrap-pad before decimating so the anti-alias filter sees a continuous signal across the loop point
    (QC 10-11: the filter's edge ramp made amb_crt/amb_edb click every loop)."""
    if loop:
        pad = 4096; xp = np.concatenate([x[-pad:], x, x[:pad]])
        y = signal.resample_poly(xp, 1, 2)[pad // 2: -(pad // 2)]
    else:
        y = signal.resample_poly(x, 1, 2)
    y = np.clip(y, -1, 1)
    q = np.round((y + 1) * 127.5).astype(np.uint8)
    return q.astype(np.float32) / 127.5 - 1.0

def main():
    names = sys.argv[1:] or list(S) + list(IR)
    wav_dir = os.path.join(HERE, 'wav'); os.makedirs(wav_dir, exist_ok=True); os.makedirs(OUT, exist_ok=True)
    total = 0
    for n in names:
        if n in IR:
            y = signal.resample_poly(IR[n](), 1, 2).astype(np.float32)
            wavfile.write(os.path.join(OUT, n + '.wav'), OUT_SR, y); print(f'{n:22s} ir  {len(y) / OUT_SR:.2f}s'); continue
        loop = n.startswith('amb_')
        y = era(S[n](), loop)
        if loop:  # 1 s wrap-padding on both sides: opus/aac damage the first/last ~30 ms, so audio.js loops loopStart=1 … duration−1
            P = OUT_SR; y = np.concatenate([y[-P:], y, y[:P]])
        w = os.path.join(wav_dir, n + '.wav'); wavfile.write(w, OUT_SR, (y * 32767).astype(np.int16))
        for ext, codec in [('ogg', ['-c:a', 'libopus', '-b:a', '32k' if loop else '40k', '-application', 'audio']), ('m4a', ['-c:a', 'aac', '-b:a', '48k'])]:
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', w, *codec, os.path.join(OUT, f'{n}.{ext}')], check=True)
        kb = os.path.getsize(os.path.join(OUT, n + '.ogg')) // 1024; total += kb
        print(f'{n:22s} {len(y) / OUT_SR:5.2f}s {kb:4d} KB  peak {np.abs(y).max():.2f}')
    print('total ogg', total, 'KB')

if __name__ == '__main__': main()
