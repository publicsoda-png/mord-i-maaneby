// Fyrtårnet: angles. The lamp starts at 0° (pointing right); turn it in 15° steps and press "Lys" when it points at
// the asked angle. Three tasks from opg('angle'). A protractor arc with ticks helps reading the angle.
// Night: nobody steers — the lamp blinks morse S-Y-V (··· —·—— ···—) with 800 Hz blips, three times, then silence.
import { opg, seeded } from '../../opg.js';

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
    const LX = 210, LY = 230, LEN = 176; // lamp position and beam length

    // ---- tower
    a.spr(LX, 345, 72, 230, (g) => {
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
        const t = -d * Math.PI / 180, big = d % 45 === 0;
        const x0 = cx + Math.cos(t) * R0, y0 = cy + Math.sin(t) * R0, x1 = cx + Math.cos(t) * (R0 + (big ? 12 : 6)), y1 = cy + Math.sin(t) * (R0 + (big ? 12 : 6));
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      }
    }, { top: LY - LEN - 30 + 'px' });
    if (!night) {
      // angle labels as DOM text so they stay crisp
      [[0, LX + LEN + 22, LY - 10], [45, LX + (LEN + 36) * 0.707 + 6, LY - (LEN + 36) * 0.707 - 16], [90, LX - 12, LY - LEN - 42], [135, LX - (LEN + 36) * 0.707 - 36, LY - (LEN + 36) * 0.707 - 16], [180, LX - LEN - 30, LY + 4]]
        .forEach(([d, x, y]) => a.text(d + '°', x, y, { fontSize: '13px', fontFamily: FONT }));
    }
    // ---- beam (canvas line in its own sprite, redrawn per angle)
    let angle = 0, lit = false;
    const beam = a.spr(LX, LY, 2 * LEN + 8, 2 * LEN + 8, (g, mode) => {
      const c = LEN + 4, t = -angle * Math.PI / 180;
      const ex = c + Math.cos(t) * LEN, ey = c + Math.sin(t) * LEN;
      const dx = -Math.sin(t), dy = Math.cos(t), hw = mode === 2 ? 22 : 12; // half-width at the far end
      g.fillStyle = mode === 2 ? (night ? 'rgba(255,240,170,.9)' : 'rgba(255,236,150,.95)') : (night ? 'rgba(120,120,140,.45)' : 'rgba(255,236,150,.55)');
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
        a.after(at, () => { beam.style.visibility = 'visible'; beam.redraw(2); a.sfx.blip(800, dur / 1000, 0.06, 'sine'); });
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
      angle = next; a.sfx.blip(140, 0.08, 0.1, 'square', 90); // heavy metal turn
      show();
    };
    const bl = a.btn('◄ 15°', PX, 258, () => turn(15), { width: '88px', textAlign: 'center', fontSize: '14px', padding: '7px 0' });
    const br = a.btn('15° ►', PX + 104, 258, () => turn(-15), { width: '88px', textAlign: 'center', fontSize: '14px', padding: '7px 0' });
    a.text('(mod venstre drejer tallet op)', PX, 292, { fontSize: '11px', color: '#ddd', fontFamily: FONT });
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
    }, { width: '192px', textAlign: 'center', fontSize: '16px', padding: '8px 0' });
    show();
  },
};
