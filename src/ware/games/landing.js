// Landingspladsen: boxes land one by one; count them and pick the right number. Grade scales count & distractors.
// Night variant (opts.night): one box too many lands and refuses to be counted.
// Boxes fall on the 10 fps step clock (4 steps, no tween); with the rendered pad they land ON the pad, not over the render's own crates.
import { opg, choices, seeded } from '../../opg.js';
import { hasBg } from '../../art/placeholder.js';

export default {
  id: 'landing',
  setup(a) {
    const r = seeded(a.opts.seed ?? Date.now());
    const task = opg('count', a.opts.grade ?? 3, r);
    const n = task.n + (a.opts.night ? 1 : 0);
    const R = hasBg('landing');
    const boxes = [];
    const drawBox = (g, lit, cursed) => {
      g.fillStyle = cursed ? '#3a3328' : lit ? '#ffb347' : '#c98a3c'; g.fillRect(2, 6, 36, 30);
      g.fillStyle = cursed ? '#4a4234' : lit ? '#ffd27a' : '#e0a85a'; g.fillRect(2, 6, 36, 6);
      g.fillStyle = cursed ? '#1c1812' : '#6b4a1e'; g.fillRect(2, 20, 36, 2); g.fillRect(19, 6, 2, 30);
      g.fillStyle = cursed ? '#6a6356' : '#fff'; g.fillRect(6, 26, 10, 6);
    };
    // land boxes in a loose grid: on the render's pad surface, otherwise on the procedural pad lower down
    const slots = [];
    const GX = R ? 176 : 190, GY = R ? 196 : 350, DY = R ? 28 : 30;
    for (let i = 0; i < 24; i++) slots.push({ x: GX + (i % 8) * 36 + Math.round(r() * 10 - 5), y: GY + Math.floor(i / 8) * DY + Math.round(r() * 8 - 4) });
    for (let i = 24; i < 32; i++) slots.push({ x: GX + ((i - 24) % 8) * 36 + Math.round(r() * 10 - 5), y: GY + 3 * DY + Math.round(r() * 8 - 4) });
    slots.sort(() => r() - 0.5);
    let landed = 0;
    const land = (i) => {
      const s = slots[i];
      const y0 = -40;
      const b = a.spr(s.x, y0, 40, 40, (g) => drawBox(g, false, false));
      b.dataset.i = i;
      boxes.push(b);
      a.steps(4, (k, f) => b.at(s.x, Math.round(y0 + (s.y - y0) * f)), () => {
        a.play('kasse_dump', { gain: 0.8, pan: a.pan(s.x) }); landed++;
        if (a.opts.night && i === n - 1) { b.cursed = true; b.g.clearRect(0, 0, 40, 40); drawBox(b.g, false, true); }
        if (landed === n) ask();
      });
      // clicking a box lights it (counting aid), cursed box ignores you
      a.on(b, () => { if (b.cursed) { a.sfx.bzzt(); return; } b.lit = !b.lit; b.g.clearRect(0, 0, 40, 40); drawBox(b.g, b.lit, false); a.play('taelle_bip', { gain: 0.7, pan: a.pan(s.x) }); });
    };
    for (let i = 0; i < n; i++) a.after(200 + Math.floor(i / 2) * 100, () => land(i)); // two at a time: the whole cascade is over in ~2 s
    a.text(task.q, 0, R ? 110 : 262, { width: '640px', textAlign: 'center', fontSize: '17px' });
    function ask() {
      const opts = choices(task.n, r);
      opts.forEach((v, i) => {
        const b = a.btn(String(v), 150 + i * 90, 440, () => {
          if (v === task.n) { a.sfx.good(); a.done({ ok: true, stars: 3, answer: v, n: task.n }); }
          else { a.sfx.bad(); b.disable(); a.opts.onWrong && a.opts.onWrong(); }
        }, { width: '60px' });
      });
    }
  },
};
