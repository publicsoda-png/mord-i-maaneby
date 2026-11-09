#!/usr/bin/env python3
"""Compose all songs as GM MIDI (midiutil). Usage: venv/bin/python compose.py [out_dir] [song ...]
Songs: ident titel_a titel_b byen byen_11 plads_a plads_b plads_c raadhus fyrvaerkeri credits (+ variants via variant.py).
Motifs: fnug12 (12-tone pentatonic music box), fnug11 (6th omitted, rest kept), hjaelper (4 slow nylon notes),
minus (falling minor second — the only falling interval in the baseline score)."""
import sys, os
from midiutil import MIDIFile

# GM programs (0-based)
PIANO, MUSICBOX, VIBES, NYLON, FLUTE, PIZZ, PAD, CRYSTAL, SYNSTR = 0, 10, 11, 24, 73, 45, 89, 98, 50
CELESTA, MARIMBA = 8, 12

# ---------- motif library (semitone offsets from root, (beat, dur)) ----------
# Pentatonic major: 0 2 4 7 9
FNUG12 = [(0, 0.5), (2, 0.5), (4, 0.5), (7, 0.5), (9, 0.5), (12, 0.5), (9, 0.5), (7, 0.5), (4, 0.5), (7, 0.5), (2, 0.5), (0, 1.0)]
def fnug(n_notes=12):
    """Return [(beat, pitch_offset, dur)] — 11-note version drops the 6th note but keeps its rest."""
    out, t = [], 0.0
    for i, (p, d) in enumerate(FNUG12):
        if not (n_notes == 11 and i == 5):
            out.append((t, p, d))
        t += d
    return out, t
HJAELPER = [(0, 0, 2), (2, 4, 2), (4, 7, 2), (6, 5, 2)]            # I – iii – V – IV-ish, slow
MINUS = [(0, 1, 1.5), (1.5, 0, 2.5)]                              # falling minor second

# Chord vocabulary (degree → semitone triads over root)
CH = {'I': [0, 4, 7], 'ii': [2, 5, 9], 'iii': [4, 7, 11], 'IV': [5, 9, 12], 'V': [7, 11, 14], 'vi': [9, 12, 16], 'V7': [7, 11, 14, 17]}

class Song:
    def __init__(self, tempo, root=60, beats_per_bar=4):
        self.m = MIDIFile(1, deinterleave=False)
        self.m.addTempo(0, 0, tempo)
        self.root = root; self.bpb = beats_per_bar; self.tempo = tempo
        self.ch_used = set()
    def prog(self, ch, program): self.m.addProgramChange(0, ch, 0, program)
    def note(self, ch, pitch, t, d, vel=90): self.m.addNote(0, ch, pitch, t, d, vel)
    def motif(self, ch, notes, t0, octave=0, vel=84):
        for (t, p, d) in notes: self.note(ch, self.root + p + 12 * octave, t0 + t, d, vel)
    def chord(self, ch, name, t, d, octave=-1, vel=60, arp=0.0):
        for i, p in enumerate(CH[name]): self.note(ch, self.root + p + 12 * octave, t + i * arp, d - i * arp, vel)
    def bass(self, ch, name, t, d, vel=70): self.note(ch, self.root + CH[name][0] - 24, t, d, vel)
    def hat(self, t, vel=40): self.note(9, 42, t, 0.25, vel)       # closed hi-hat
    def rim(self, t, vel=55): self.note(9, 37, t, 0.25, vel)       # side stick
    def shaker(self, t, vel=38): self.note(9, 82, t, 0.25, vel)
    def save(self, path):
        with open(path, 'wb') as f: self.m.writeFile(f)

# ---------- songs ----------
def titel_a():
    """Weyse-style morning hymn (public-domain melody 'I østen stiger solen op', GM hymnal arrangement)."""
    s = Song(84, root=62)  # D major
    s.prog(0, PIANO); s.prog(1, FLUTE); s.prog(2, PAD)
    # Melody (D major, simplified from the hymn), one note per beat-ish
    mel = [2, 2, 4, 6, 7, 7, 6, 4, 2, 6, 4, 2, 1, 2]  # scale degrees 1-based-ish offsets in semitones from D: use scale map
    scale = [0, 2, 4, 5, 7, 9, 11, 12]
    seq = [(1, 1), (1, 1), (2, 1), (3, 1), (4, 2), (4, 1), (3, 1), (2, 1), (1, 1), (3, 1), (2, 1), (1, 1), (7, 1), (1, 2), (3, 1), (3, 1), (4, 1), (5, 1), (6, 2), (5, 1), (4, 1), (3, 1), (2, 1), (4, 1), (3, 1), (2, 1), (1, 3)]
    t = 0.0
    for deg, d in seq:
        p = scale[deg - 1] if deg <= 8 else scale[deg - 8] + 12
        if deg == 7: p = -1  # leading tone below root
        s.note(1, s.root + p + 12, t, d * 0.98, 80); s.note(0, s.root + p, t, d, 60); t += d
    chords = ['I', 'I', 'IV', 'I', 'V', 'I', 'IV', 'V', 'I', 'vi', 'IV', 'V', 'I', 'I']
    for i, c in enumerate(chords): s.chord(0, c, i * 2, 2, octave=-1, vel=50); s.chord(2, c, i * 2, 2, octave=0, vel=28)
    return s, t
def titel_b():
    """Own morning-hymn-like theme, built so the fnug motif is its intro (needed for the 12→11 trick)."""
    s = Song(88, root=60)  # C major
    s.prog(0, PIANO); s.prog(1, MUSICBOX); s.prog(2, PAD); s.prog(3, FLUTE)
    notes, L = fnug(12); s.motif(1, notes, 0, octave=1, vel=78)
    t = L  # 6.5 beats → round to 8
    t = 8
    prog = ['I', 'vi', 'IV', 'V', 'I', 'iii', 'IV', 'V', 'vi', 'IV', 'I', 'V', 'IV', 'V', 'I', 'I']
    mel = [7, 9, 7, 4, 2, 4, 0, -1, 0, 4, 7, 12, 9, 7, 4, 7, 5, 4, 2, 0, -1, 0, 2, 4, 0, 0]
    for i, c in enumerate(prog):
        s.chord(0, c, t + i * 2, 2, octave=-1, vel=52); s.chord(2, c, t + i * 2, 2, octave=0, vel=26); s.bass(0, c, t + i * 2, 2, 60)
    tt = t
    for i, p in enumerate(mel):
        d = 1.5 if i % 4 == 3 else 1.0 if i % 2 else 1.25
        s.note(3, s.root + p + 12, tt, d * 0.95, 82); tt += d
    end = t + 32
    s.motif(1, HJAELPER, end - 8, octave=1, vel=50)
    return s, end
def byen(n=12):
    s = Song(108, root=65)  # F major
    s.prog(0, PIANO); s.prog(1, MUSICBOX); s.prog(2, VIBES); s.prog(3, PIZZ)
    notes, L = fnug(n); s.motif(1, notes, 0, octave=1, vel=80)
    t = 8
    prog = ['I', 'IV', 'vi', 'V', 'I', 'IV', 'ii', 'V', 'I', 'iii', 'IV', 'I', 'ii', 'V', 'I', 'I']
    for i, c in enumerate(prog):
        b = t + i * 4
        s.chord(0, c, b, 2, octave=-1, vel=55, arp=0.0); s.chord(0, c, b + 2, 2, octave=-1, vel=45)
        s.bass(3, c, b, 1, 68); s.bass(3, c, b + 2.5, 0.5, 60)
        for k in range(8): s.shaker(b + k * 0.5, 40 if k % 2 == 0 else 28)
        if i % 2 == 1: s.rim(b + 2, 50)
        # vibes answer
        s.note(2, s.root + CH[c][1] + 12, b + 1.5, 1, 58); s.note(2, s.root + CH[c][2] + 12, b + 3, 1, 52)
    return s, t + 64
def plads_a():
    s = Song(112, root=67)  # G
    s.prog(0, PIZZ); s.prog(1, MUSICBOX); s.prog(2, PIANO)
    prog = ['I', 'IV', 'I', 'V', 'I', 'IV', 'V', 'I']
    for i, c in enumerate(prog):
        b = i * 4
        for k in range(4): s.note(0, s.root + CH[c][k % 3] - 12, b + k, 0.5, 72 if k == 0 else 58)
        s.note(1, s.root + CH[c][0] + 12, b + 0.5, 0.5, 66); s.note(1, s.root + CH[c][2] + 12, b + 1.5, 0.5, 60); s.note(1, s.root + CH[c][1] + 12, b + 2.5, 1, 62)
        s.chord(2, c, b, 4, octave=-1, vel=38)
        for k in range(8): s.hat(b + k * 0.5, 34)
    return s, 32
def plads_b():
    s = Song(100, root=64)  # E
    s.prog(0, VIBES); s.prog(1, PAD); s.prog(2, PIZZ)
    prog = ['I', 'vi', 'IV', 'V', 'I', 'vi', 'ii', 'V']
    for i, c in enumerate(prog):
        b = i * 4
        s.chord(1, c, b, 4, octave=0, vel=26)
        for k, p in enumerate(CH[c]): s.note(0, s.root + p + 12, b + k * 1.25, 1.5, 60)
        s.bass(2, c, b, 2, 60); s.bass(2, c, b + 3, 1, 50)
    return s, 32
def plads_c():
    s = Song(118, root=62)  # D
    s.prog(0, PIANO); s.prog(1, FLUTE)
    prog = ['I', 'V', 'vi', 'IV', 'I', 'V', 'IV', 'I']
    mel = [0, 2, 4, 7, 9, 7, 4, 2, 4, 5, 7, 4, 2, 0, 2, 4, 7, 9, 12, 9, 7, 4, 5, 4, 2, 0, -1, 0, 2, 4, 0, 0]
    for i, c in enumerate(prog):
        b = i * 4
        s.chord(0, c, b, 1, octave=-1, vel=58); s.chord(0, c, b + 2, 1, octave=-1, vel=50); s.bass(0, c, b, 4, 60)
        s.rim(b + 1, 48); s.rim(b + 3, 48)
        for k in range(8): s.hat(b + k * 0.5, 30)
    for i, p in enumerate(mel): s.note(1, s.root + p + 12, i, 0.9, 78)
    return s, 32
def raadhus():
    s = Song(108, root=65)  # same chords as byen, only pad + one hat
    s.prog(0, PAD)
    prog = ['I', 'IV', 'vi', 'V', 'I', 'IV', 'ii', 'V', 'I', 'iii', 'IV', 'I', 'ii', 'V', 'I', 'I']
    for i, c in enumerate(prog): s.chord(0, c, i * 4, 4, octave=0, vel=30); s.hat(i * 4 + 2, 26)
    return s, 64
def fyrvaerkeri():
    s = Song(120, root=60)
    for ch, p in enumerate([PIANO, FLUTE, VIBES, PIZZ, PAD]): s.prog(ch, p)
    prog = ['I', 'IV', 'V', 'I', 'IV', 'V', 'V7', 'I']
    for i, c in enumerate(prog):
        b = i * 4
        for ch in range(5): s.chord(ch, c, b, 4 if ch == 4 else 1.5, octave=0 if ch else -1, vel=70 if ch < 4 else 36)
        s.note(1, s.root + CH[c][2] + 12, b + 2, 0.5, 90); s.note(1, s.root + CH[c][0] + 24, b + 2.5, 1.5, 92)
        s.note(9, 49, b, 1, 70)  # crash
        for k in range(4): s.rim(b + k, 55)
    return s, 32
def ident():
    """Krater Multimedie-ident (3 s): fire egne toner celesta + marimba (C G A E, stigende, ikke en kendt melodi) over en lav
    Warm Pad (C2+G2). Ren krom — bærer ingen historie (RETNING §0). 80 bpm × 4 beats = 3,0 s."""
    s = Song(80, root=60)
    s.prog(0, CELESTA); s.prog(1, MARIMBA); s.prog(2, PAD)
    s.note(2, s.root - 24, 0, 4, 44); s.note(2, s.root - 17, 0, 4, 36)             # lav pad, hele varigheden
    for k, p in enumerate([0, 7, 9, 16]):                                           # C5 G5 A5 E6
        s.note(0, s.root + p + 12, k * 0.5, 2.5 - k * 0.5, 86 - k * 4)             # celesta ringer ud til slut
        s.note(1, s.root + p, k * 0.5, 0.5, 70)                                     # marimba-anslag en oktav under
    return s, 4
def credits():
    s, L = titel_b(); return s, L

SONGS = {'ident': ident, 'titel_a': titel_a, 'titel_b': titel_b, 'byen': lambda: byen(12), 'byen_11': lambda: byen(11), 'plads_a': plads_a, 'plads_b': plads_b, 'plads_c': plads_c, 'raadhus': raadhus, 'fyrvaerkeri': fyrvaerkeri, 'credits': credits}

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), 'mid')
    os.makedirs(out, exist_ok=True)
    names = sys.argv[2:] or list(SONGS)
    for n in names:
        s, L = SONGS[n]()
        s.save(os.path.join(out, n + '.mid'))
        print(n, f'{L} beats @ {s.tempo} = {L * 60 / s.tempo:.1f}s')
