#!/usr/bin/env python3
"""variant(song, transpose, tempo, swap={73:98}) → the same song, wrong. Operates on compose.py Song objects (re-composes
with patched parameters). Usage: venv/bin/python variant.py <out_dir> <name>  — names: titel_nat plads_c_cursed credits fyrv_loop2 fyrv_loop3"""
import sys, os
import compose as C

def variant(builder, transpose=0, tempo=1.0, swap=None, vel=1.0):
    swap = swap or {}
    orig_prog, orig_note, orig_tempo = C.Song.prog, C.Song.note, C.Song.__init__
    def init(self, t, root=60, beats_per_bar=4): orig_tempo(self, round(t * tempo), root + transpose, beats_per_bar)
    def prog(self, ch, program): orig_prog(self, ch, swap.get(program, program))
    def note(self, ch, pitch, t, d, v=90): orig_note(self, ch, pitch if ch == 9 else pitch, t, d, max(1, min(127, int(v * vel))))
    C.Song.__init__, C.Song.prog, C.Song.note = init, prog, note
    try: return builder()
    finally: C.Song.__init__, C.Song.prog, C.Song.note = orig_tempo, orig_prog, orig_note

VARIANTS = {
    'titel_nat': lambda: variant(C.titel_b, transpose=-2, tempo=0.92, swap={C.FLUTE: C.SYNSTR}),
    'plads_c_cursed': lambda: variant(C.plads_c, transpose=-2, tempo=0.92, swap={C.FLUTE: C.CRYSTAL}),
    'credits': lambda: variant(C.titel_b, swap={C.FLUTE: C.CRYSTAL}),
    'fyrv_loop2': lambda: variant(C.fyrvaerkeri, transpose=-1, tempo=0.95),
    'fyrv_loop3': lambda: variant(C.fyrvaerkeri, transpose=-2, tempo=0.90),
    'byen_morgen': lambda: variant(lambda: C.byen(12), vel=0.6),
}
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for n in (sys.argv[2:] or list(VARIANTS)):
        s, L = VARIANTS[n](); s.save(os.path.join(out, n + '.mid')); print(n, f'{L * 60 / s.tempo:.1f}s')
