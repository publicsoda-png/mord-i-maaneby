#!/usr/bin/env python3
"""variant(song, transpose, tempo, swap={73:98}) → the same song, wrong. Operates on compose.py Song objects (re-composes
with patched parameters). Usage: venv/bin/python variant.py <out_dir> <name>  — names: titel_nat plads_c_cursed credits fyrv_loop2 fyrv_loop3"""
import sys, os
import compose as C

def variant(builder, transpose=0, tempo=1.0, swap=None, vel=1.0, drop=None, drop_perc=None, tail_note=False):
    """drop = set of channels whose notes are silenced (instrument-drop); drop_perc = set of GM drum notes to silence."""
    swap = swap or {}; drop = drop or set(); drop_perc = drop_perc or set()
    orig_prog, orig_note, orig_tempo = C.Song.prog, C.Song.note, C.Song.__init__
    def init(self, t, root=60, beats_per_bar=4): orig_tempo(self, round(t * tempo), root + transpose, beats_per_bar)
    def prog(self, ch, program): orig_prog(self, ch, swap.get(program, program))
    def note(self, ch, pitch, t, d, v=90):
        if ch in drop or (ch == 9 and pitch in drop_perc): return
        orig_note(self, ch, pitch, t, d, max(1, min(127, int(v * vel))))
    C.Song.__init__, C.Song.prog, C.Song.note = init, prog, note
    try: s, L = builder()
    finally: C.Song.__init__, C.Song.prog, C.Song.note = orig_tempo, orig_prog, orig_note
    if tail_note:
        # one very quiet pizz note on the last beat so render.sh's silence-trim keeps the full loop length
        orig_note(s, 3, s.root - 24, L - 1, 1, 14)
    return s, L

VARIANTS = {
    'titel_nat': lambda: variant(C.titel_b, transpose=-2, tempo=0.92, swap={C.FLUTE: C.SYNSTR}),
    'plads_c_cursed': lambda: variant(C.plads_c, transpose=-2, tempo=0.92, swap={C.FLUTE: C.CRYSTAL}),
    'credits': lambda: variant(C.titel_b, swap={C.FLUTE: C.CRYSTAL}),
    'fyrv_loop2': lambda: variant(C.fyrvaerkeri, transpose=-1, tempo=0.95),
    'fyrv_loop3': lambda: variant(C.fyrvaerkeri, transpose=-2, tempo=0.90),
    'byen_morgen': lambda: variant(lambda: C.byen(12), vel=0.6),
    # Instrument-drop ladder for the "Byg videre"-loop hub (LYDPLAN §3): each round one layer less, same song.
    # byen channels: 0 piano chords, 1 music box intro, 2 vibes answer, 3 pizz bass, 9 perc (82 shaker, 37 rim)
    'byen_minus1': lambda: variant(lambda: C.byen(11), drop={2}),                                  # no vibes answer
    'byen_minus2': lambda: variant(lambda: C.byen(11), drop={2}, drop_perc={37}),                  # no rim
    'byen_minus3': lambda: variant(lambda: C.byen(11), drop={2}, drop_perc={37, 82}),              # no percussion at all
    'byen_minus4': lambda: variant(lambda: C.byen(11), drop={2, 3}, drop_perc={37, 82}),           # no bass
    'byen_minus5': lambda: variant(lambda: C.byen(11), drop={2, 3}, drop_perc={37, 82}, transpose=-1, tempo=0.96),
    'byen_minus6': lambda: variant(lambda: C.byen(11), drop={0, 2, 3}, drop_perc={37, 82}, transpose=-1, tempo=0.92, tail_note=True),  # only the 11-note intro, then 64 beats of (almost) nothing
    'byen_minus7': lambda: variant(lambda: C.byen(11), drop={0, 2, 3}, drop_perc={37, 82}, transpose=-2, tempo=0.85, swap={C.MUSICBOX: C.CRYSTAL}, tail_note=True),
}
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for n in (sys.argv[2:] or list(VARIANTS)):
        s, L = VARIANTS[n](); s.save(os.path.join(out, n + '.mid')); print(n, f'{L * 60 / s.tempo:.1f}s')
