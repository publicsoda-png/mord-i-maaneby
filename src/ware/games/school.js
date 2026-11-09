// Kraterskolen: call-and-response quiz with an on-screen stone keyboard (0–9, Slet, Svar). Clickable and real keydown.
// Five questions from opg('add'|'mul'). From save.flags.seven_missing: question 5 is sevenTask() and the 7-key is a hole;
// after 5 s of silence the helper says "… Vi går videre." and the game ends {ok, skipped}. Night: the 7-key exists but
// pressing it only prints "Handler not defined" (plain text, no dialog).
import { opg, sevenTask, seeded } from '../../opg.js';
import { hasBg } from '../../art/placeholder.js';

const FONT = '"Comic Neue","Comic Sans MS","Chalkboard SE",cursive';
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const wrongLines = ['Hm, tavlen siger noget andet. Prøv igen.', 'Næsten. Regn den en gang til.', 'Kridtet knækkede. Prøv igen.'];

export default {
  id: 'school',
  lines: {
    school_intro: 'Velkommen i Kraterskolen. Jeg spørger, du svarer. Tryk tallene på stenene, og tryk Svar.',
    school_ok: 'Fem spørgsmål. Fnuggerne bygger skolen færdig.',
    school_wrong: () => wrongLines[Math.floor(Math.random() * wrongLines.length)],
  },
  setup(a) {
    const r = seeded(a.opts.seed ?? Date.now());
    const grade = a.opts.grade ?? 3;
    const night = a.opts.night === true;
    const sevenMissing = !night && !!(a.opts.save && a.opts.save.flags && a.opts.save.flags.seven_missing);
    const minusKnown = a.opts?.save?.flags?.minus_known === true; // 2nd playthrough: a dead "−" key appears left of the 6, the 7 is normal
    const N = 5;

    // ---- questions (deterministic). When the 7-key is dead (night) or missing, questions 1–4 avoid answers with a 7.
    const no7 = night || sevenMissing;
    const qs = [];
    for (let i = 0; i < N; i++) {
      if (i === N - 1 && sevenMissing) { qs.push(sevenTask(grade, r)); break; }
      let t = opg(i % 2 ? 'mul' : 'add', grade, r), guard = 0;
      while (no7 && String(t.a).includes('7') && guard++ < 30) t = opg(i % 2 ? 'mul' : 'add', grade, r);
      qs.push(t);
    }

    // ---- texts go on the room's OWN chalkboard and notice board (render: board ≈ 340..528 × 130..233, cork ≈ 205..285 × 140..215;
    // procedural fallback: board 60..380 × 150..300, notice 420..610 × 160..290). Only the UI layer is drawn — never a second board.
    const R = hasBg('school');
    const ink = night ? '#cfd3e0' : '#f3f0e0', gold = night ? '#e8e2c0' : '#ffe9a8', paper = night ? '#cfd3e0' : '#2b2418';
    if (R) a.spr(434, 176, 180, 72, (g) => { g.fillStyle = night ? '#021a01' : '#043701'; g.fillRect(0, 0, 180, 72); }); // clean patch of the render's board (its own green) under the chalk text
    const qText = a.text('', R ? 350 : 80, R ? 144 : 168, { fontSize: R ? '19px' : '24px', color: ink, textShadow: 'none', width: R ? '170px' : '280px', whiteSpace: 'normal', lineHeight: '1.15', fontFamily: FONT });
    const ansText = a.text('', R ? 350 : 80, R ? 180 : 236, { fontSize: R ? '22px' : '28px', color: gold, textShadow: 'none', fontFamily: FONT });
    const progress = a.text('', R ? 210 : 432, R ? 148 : 170, { fontSize: R ? '12px' : '15px', color: paper, outline: R && !night ? '#e8dcc0' : undefined, textShadow: R ? undefined : 'none', fontFamily: FONT });
    const score = a.text('', R ? 210 : 432, R ? 166 : 194, { fontSize: R ? '12px' : '15px', color: paper, outline: R && !night ? '#e8dcc0' : undefined, textShadow: R ? undefined : 'none', fontFamily: FONT });
    const hint = a.text('', R ? 136 : 432, R ? 316 : 232, { fontSize: R ? '11px' : '13px', color: R ? '#fff' : '#5a4a30', textShadow: R ? undefined : 'none', width: R ? '300px' : '170px', whiteSpace: 'normal', lineHeight: '1.2', fontFamily: FONT });
    hint.textContent = 'Dagens tælling: 12 · Tastaturet virker også.'; // the town counts twelve Fnugger (Én…Tolv) — the number the story keeps coming back to

    // ---- stone keyboard: rows "1 2 3 4 5" / "6 7 8 9 0", 44×44 keys, 8 px gap; Slet/Svar to the right
    const KX = 136, KY = 334, KS = 44, GAP = 8;
    const drawKey = (g, pressed, dead, label) => {
      const w = KS, h = KS;
      g.fillStyle = '#5e5a52'; g.fillRect(0, 0, w, h);                 // hard shadow (bottom/right)
      g.fillStyle = pressed ? '#b9b3a4' : '#f4f1ea'; g.fillRect(0, 0, w - 3, h - 3); // highlight face
      g.fillStyle = pressed ? '#cfc9ba' : (dead ? '#a9a39a' : '#d9d3c4'); g.fillRect(3, 3, w - 6, h - 6); // stone
      g.fillStyle = pressed ? '#bdb7a8' : '#e9e4d6'; g.fillRect(6, 6, 10, 4); // chip highlight
      g.fillStyle = '#8c877c'; g.fillRect(w - 12, h - 10, 6, 3);        // chip shadow
      if (label) a.draw(g, label, (w - 3) / 2 + (pressed ? 1 : 0), (h - 3) / 2 + (pressed ? 1 : 0), { size: 22, fontFamily: FONT, color: dead ? '#3c3a36' : '#111', align: 'center', valign: 'middle' });
    };
    const keys = {};
    let root = null;
    const layout = [['1', '2', '3', '4', '5'], ['6', '7', '8', '9', '0']];
    layout.forEach((row, ri) => row.forEach((d, ci) => {
      const cx = KX + ci * (KS + GAP) + KS / 2, cy = KY + ri * (KS + GAP) + KS / 2;
      if (d === '7' && sevenMissing) {
        // the hole where the 7-key should be: darker floor, a little dust
        const hole = a.spr(cx, cy, KS, KS, (g) => { g.fillStyle = '#4a4740'; g.fillRect(2, 2, KS - 5, KS - 5); g.fillStyle = '#2e2c28'; g.fillRect(2, 2, KS - 5, 3); g.fillRect(2, 2, 3, KS - 5); g.fillStyle = '#8c877c'; g.fillRect(10, KS - 12, 14, 2); g.fillRect(28, 14, 6, 2); });
        if (!root) root = hole;
        return;
      }
      const dead = night && d === '7';
      const k = a.spr(cx, cy, KS, KS, (g, p) => drawKey(g, p === 1, dead, d));
      if (!root) root = k;
      keys[d] = k;
      a.on(k, () => press(d));
    }));
    if (minusKnown) {
      // the minus key nobody asked for: stone like the others, label "−", does nothing but click
      const cx = KX - (KS + GAP) + KS / 2, cy = KY + (KS + GAP) + KS / 2;
      const k = a.spr(cx, cy, KS, KS, (g, p) => drawKey(g, p === 1, true, '−'));
      a.on(k, () => { if (locked || ended) return; flash(k); a.play('tast_klik', { gain: 0.9 }); });
    }
    const bx = KX + 5 * (KS + GAP) + 10;
    const bSlet = a.btn('Slet', bx, KY + 8, () => press('Backspace'), { width: '84px', silent: true });
    const bSvar = a.btn('Svar', bx, KY + KS + GAP + 8, () => press('Enter'), { width: '84px', silent: true });

    // ---- state
    let qi = 0, typed = '', correct = 0, wrongs = 0, locked = false, lastInput = performance.now(), skipped = false, ended = false;
    const show = () => {
      const t = qs[qi];
      qText.textContent = t.q;
      ansText.textContent = typed.length ? '= ' + typed : '= _';
      progress.textContent = R ? `${qi + 1} af ${N}` : `Spørgsmål ${qi + 1} af ${N}`;
      score.textContent = `Rigtige: ${correct}`;
    };
    const flash = (k) => { if (!k) return; k.redraw(1); a.after(110, () => k.redraw(0)); };

    const end = (res) => {
      if (ended) return;
      ended = true;
      removeEventListener('keydown', onKey);
      a.done(res);
    };
    let errNote = null;
    const notDefined = () => {
      // Night: the 7-key has no handler. Plain Director-style error text, no OS dialog.
      a.sfx.bzzt();
      if (errNote) errNote.remove();
      errNote = a.text('Handler not defined', KX, KY - 26, { font: '11px Tahoma, "DejaVu Sans", Verdana, sans-serif', color: '#fff', textShadow: 'none', background: '#000', padding: '2px 6px' });
      a.after(1500, () => { if (errNote) { errNote.remove(); errNote = null; } });
    };

    function press(d) {
      if (locked || ended) return;
      lastInput = performance.now();
      if (/^[0-9]$/.test(d)) {
        if (d === '7' && sevenMissing) return;            // no key, no sound
        if (d === '7' && night) { flash(keys['7']); notDefined(); return; }
        if (typed.length >= 6) return;
        typed = typed === '0' ? d : typed + d;
        flash(keys[d]);
        a.play('tast_klik', { gain: 0.9 }); if (!night) a.play('kridt', { gain: 0.5, pan: 0.3 }); // stone key + a little chalk
        show();
        return;
      }
      if (d === 'Backspace') { typed = typed.slice(0, -1); a.play('tast_klik', { gain: 0.9 }); show(); return; }
      if (d === 'Enter') {
        if (!typed.length) { a.play('tast_klik', { gain: 0.9 }); return; }
        const t = qs[qi];
        if (+typed === t.a) {
          correct++; a.sfx.ok(); locked = true;
          ansText.textContent = '= ' + typed + '  ✓';
          a.after(650, () => {
            locked = false; typed = ''; qi++;
            if (qi >= N) { a.play('skoleklokke', { gain: 0.8 }); end({ ok: true, correct, wrongs }); return; }
            show(); lastInput = performance.now();
          });
        } else {
          wrongs++; a.sfx.bad(); typed = ''; show();
          a.opts.onWrong && a.opts.onWrong();
        }
      }
    }
    const onKey = (e) => {
      if (!root || !root.isConnected) { removeEventListener('keydown', onKey); return; } // engine cleared the field
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (/^[0-9]$/.test(k) || k === 'Backspace' || k === 'Enter') { e.preventDefault(); press(k); }
    };
    addEventListener('keydown', onKey);

    // the missing-seven silence: on the last question, 5 s without input → the helper gives up on it
    if (sevenMissing) {
      a.every(250, () => {
        if (qi !== N - 1 || locked || skipped || ended) return;
        if (performance.now() - lastInput < 5000) return;
        skipped = true; locked = true;
        bSvar.disable(); bSlet.disable();
        a.opts.say('… Vi går videre.', { auto: 1400 });
        a.after(2200, () => end({ ok: true, correct, wrongs, skipped: true }));
      });
    }
    show();
  },
};
