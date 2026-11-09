// Fyrtårnet: angles. The lamp starts at 0° (pointing right); turn it in 15° steps and press "Lys" when it points at
// the asked angle. Three tasks from opg('angle'). A protractor arc with ticks helps reading the angle.
// Night: nobody steers — the lamp blinks morse S-Y-V (··· —·—— ···—) with 800 Hz blips, three times, then silence.
import { opg, seeded } from '../../opg.js';
import { hasBg } from '../../art/placeholder.js';

const FONT = '"Comic Neue","Comic Sans MS","Chalkboard SE",cursive';
const wrongLines = ['Lyset peger et andet sted hen. Drej lidt mere.', 'Ikke helt den vinkel. Kig på stregerne.', 'Tæt på. Et par klik endnu.'];

export default {
  id: 'light',
  lines: {
    light_intro: 'Fyrtårnet. Lampen peger på 0 grader. Drej den med knapperne, og tryk Lys, når den peger rigtigt.',
    light_ok: 'Tre gange lys på rette sted. Skibene kan se Måneby nu.',
    light_wrong: () => wrongLines[Math.floor(Math.random() * wrongLines.length)],
  },
  setup(a) {
    const r = seeded(a.opts.seed ?? Date.now());
    const grade = a.opts.grade ?? 3;
    const night = a.opts.night === true;
    // rendered lighthouse (assets/bg/light.png): the lamp sits at ≈(248,95), so only the beam + protractor are drawn, shorter so the arc stays on screen
    const HAS_BG = hasBg('light', night) || hasBg('light');
    const LX = HAS_BG ? 248 : 210, LY = HAS_BG ? 95 : 230, LEN = HAS_BG ? 62 : 176; // lamp position and beam length

    // ---- tower (procedural fallback only — the render has its own)
    if (!HAS_BG) a.spr(LX, 345, 72, 230, (g) => {
      const W = 72, H = 230;
      const red = night ? '#3a1a1a' : '#c9352b', white = night ? '#3c3f4c' : '#efe9dc', dark = night ? '#0d0f16' : '#5a1f1a';
      // body: slightly tapered, striped
      for (let i = 0; i < 6; i++) {
        const y = 30 + i * 30, t = i / 6, w0 = 40 + t * 22, w1 = 40 + ((i + 1) / 6) * 22;
        g.fillStyle = i % 2 ? red : white;
        g.beginPath(); g.moveTo(W / 2 - w0 / 2, y); g.lineTo(W / 2 + w0 / 2, y); g.lineTo(W / 2 + w1 / 2, y + 30); g.lineTo(W / 2 - w1 / 2, y + 30); g.closePath(); g.fill();
        g.fillStyle = dark; g.fillRect(W / 2 + w1 / 2 - 7, y, 6, 30); // hard shadow side
      }
      g.fillStyle = dark; g.fillRect(4, H - 22, W - 8, 22);           // base
      g.fillStyle = night ? '#141720' : '#8d93a8'; g.fillRect(4, H - 22, W - 8, 4);
      // gallery + lamp house
      g.fillStyle = dark; g.fillRect(8, 24, W - 16, 8);
      g.fillStyle = night ? '#1b1e29' : '#3a3f52'; g.fillRect(W / 2 - 16, 2, 32, 24);
      g.fillStyle = night ? '#4a4a2a' : '#ffe27a'; g.fillRect(W / 2 - 11, 6, 22, 16); // the lamp glass
      g.fillStyle = dark; g.fillRect(W / 2 - 4, 0, 8, 3);
    });
    // ---- protractor arc (ticks every 15°, labels every 45°)
    a.spr(LX, LY, 2 * (LEN + 30), LEN + 40, (g) => {
      const cx = LEN + 30, cy = LEN + 30, R0 = LEN + 8;
      g.strokeStyle = night ? '#3a3f52' : '#fff'; g.lineWidth = 2;
      g.beginPath(); g.arc(cx, cy, R0, Math.PI, 2 * Math.PI); g.stroke();
      g.fillStyle = night ? '#3a3f52' : '#fff';
      for (let d = 0; d <= 180; d += 15) {
        const rad = -d * Math.PI / 180, big = d % 45 === 0;
        const x0 = cx + Math.cos(rad) * R0, y0 = cy + Math.sin(rad) * R0, x1 = cx + Math.cos(rad) * (R0 + (big ? 12 : 6)), y1 = cy + Math.sin(rad) * (R0 + (big ? 12 : 6));
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      }
    }, { top: LY - LEN - 30 + 'px' });
    if (!night) {
      // angle labels (1-bit canvas text): outside the arc; with the render the lamp sits high, so labels go INSIDE the arc to stay on screen
      const RL = HAS_BG ? LEN - 18 : LEN + 36;
      [0, 45, 90, 135, 180].forEach((d) => {
        const rad = d * Math.PI / 180;
        const x = LX + Math.cos(rad) * RL, y = LY - Math.sin(rad) * RL + (d % 180 === 0 ? (HAS_BG ? 6 : -4) : -7);
        a.text(d + '°', Math.round(x - 20), Math.round(y), { fontSize: '13px', fontFamily: FONT, width: '40px', textAlign: 'center' });
      });
    }
    // ---- beam (canvas line in its own sprite, redrawn per angle)
    let angle = 0, lit = false;
    const beam = a.spr(LX, LY, 2 * LEN + 8, 2 * LEN + 8, (g, mode) => {
      const c = LEN + 4, rad = -angle * Math.PI / 180;
      const ex = c + Math.cos(rad) * LEN, ey = c + Math.sin(rad) * LEN;
      const dx = -Math.sin(rad), dy = Math.cos(rad), hw = mode === 2 ? 22 : 12; // half-width at the far end
      g.fillStyle = mode === 2 ? (night ? '#fff0aa' : '#ffec96') : (night ? '#4a4f60' : '#c9a84a'); // hard colours, no alpha
      g.beginPath(); g.moveTo(c, c); g.lineTo(ex + dx * hw, ey + dy * hw); g.lineTo(ex - dx * hw, ey - dy * hw); g.closePath(); g.fill();
      g.strokeStyle = night ? '#ffe9a8' : '#fff7d6'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(c, c); g.lineTo(ex, ey); g.stroke();
      g.fillStyle = '#fff7d6'; g.fillRect(c - 3, c - 3, 6, 6);
    });
    beam.redraw(1);

    if (night) {
      // ---- morse S-Y-V, 800 Hz, three repetitions, then silence. Beam points straight up.
      angle = 90; beam.redraw(0); beam.style.visibility = 'hidden';
      const U = 150; // ms per unit
      const letters = ['...', '-.--', '...-'];
      let t = 1200;
      const flashAt = (at, dur) => {
        a.after(at, () => { beam.style.visibility = 'visible'; beam.redraw(2); a.play('morse_bip', { gain: 0.7 }); });
        a.after(at + dur, () => { beam.style.visibility = 'hidden'; });
      };
      for (let rep = 0; rep < 3; rep++) {
        letters.forEach((L, li) => {
          [...L].forEach((s, si) => { const dur = s === '.' ? U : 3 * U; flashAt(t, dur); t += dur + (si < L.length - 1 ? U : 0); });
          t += li < letters.length - 1 ? 3 * U : 7 * U;
        });
      }
      a.after(t + 1800, () => a.done({ ok: true, morse: true }));
      return;
    }

    // ---- day: three angle tasks
    const tasks = [0, 1, 2].map(() => opg('angle', grade, r));
    let ti = 0, wrongs = 0, busy = false;
    const PX = 436;
    const qText = a.text('', PX, 150, { fontSize: '22px', width: '196px', whiteSpace: 'normal', lineHeight: '1.15', fontFamily: FONT });
    const now = a.text('', PX, 214, { fontSize: '16px', fontFamily: FONT });
    const prog = a.text('', PX, 404, { fontSize: '13px', fontFamily: FONT });
    const show = () => { qText.textContent = tasks[ti].q; now.textContent = `Lyset peger på ${angle}°`; prog.textContent = `Opgave ${ti + 1} af 3`; beam.redraw(1); };
    const turn = (d) => {
      if (busy) return;
      const next = Math.max(0, Math.min(180, angle + d));
      if (next === angle) { a.sfx.bzzt(); return; }
      angle = next; a.play('lys_drej', { gain: 0.8, pan: a.pan(LX) }); // heavy metal turn
      show();
    };
    const bl = a.btn('◄ 15°', PX, 258, () => turn(15), { width: '88px', silent: true });
    const br = a.btn('15° ►', PX + 104, 258, () => turn(-15), { width: '88px', silent: true });
    a.text('◄ gør vinklen større, ► gør den mindre', PX, 290, { fontSize: '11px', color: '#ddd', fontFamily: FONT, width: '196px', whiteSpace: 'normal', lineHeight: '1.2' });
    const lys = a.btn('Lys', PX, 330, () => {
      if (busy) return;
      if (angle === tasks[ti].a) {
        busy = true; beam.redraw(2); a.sfx.ok();
        a.after(700, () => {
          ti++;
          if (ti >= 3) { a.done({ ok: true, wrongs }); return; }
          angle = 0; busy = false; show();
        });
      } else {
        wrongs++; a.sfx.bad(); beam.redraw(0);
        a.after(250, () => !busy && beam.redraw(1));
        a.opts.onWrong && a.opts.onWrong();
      }
    }, { width: '192px' });
    show();
  },
};
