// Landingspladsen: boxes land one by one; count them and pick the right number. Grade scales count & distractors.
// Night variant (opts.night): one box too many lands and refuses to be counted.
import { opg, choices, seeded } from '../../opg.js';

export default {
  id: 'landing',
  setup(a) {
    const r = seeded(a.opts.seed ?? Date.now());
    const task = opg('count', a.opts.grade ?? 3, r);
    const n = task.n + (a.opts.night ? 1 : 0);
    const boxes = [];
    const drawBox = (g, lit) => {
      g.fillStyle = lit ? '#ffb347' : '#c98a3c'; g.fillRect(2, 6, 36, 30);
      g.fillStyle = lit ? '#ffd27a' : '#e0a85a'; g.fillRect(2, 6, 36, 6);
      g.fillStyle = '#6b4a1e'; g.fillRect(2, 20, 36, 2); g.fillRect(19, 6, 2, 30);
      g.fillStyle = '#fff'; g.fillRect(6, 26, 10, 6);
    };
    // land boxes in a loose grid on the pad
    const slots = [];
    for (let i = 0; i < 24; i++) slots.push({ x: 190 + (i % 8) * 36 + (r() * 10 - 5), y: 350 + Math.floor(i / 8) * 30 + (r() * 8 - 4) });
    slots.sort(() => r() - 0.5);
    let landed = 0;
    const land = (i) => {
      const s = slots[i];
      const b = a.spr(s.x, -40, 40, 40, (g) => drawBox(g, false));
      b.dataset.i = i;
      boxes.push(b);
      a.anim(b, [{ transform: 'translateY(0)' }, { transform: `translateY(${s.y + 40}px)` }], { duration: 650 + r() * 300, easing: 'cubic-bezier(.3,.9,.6,1.2)', fill: 'forwards' }).onfinish = () => {
        a.sfx.thud(); landed++;
        if (a.opts.night && i === n - 1) { b.style.filter = 'brightness(.35) saturate(.2)'; b.cursed = true; }
        if (landed === n) ask();
      };
      // clicking a box lights it (counting aid), cursed box ignores you
      a.on(b, () => { if (b.cursed) { a.sfx.bzzt(); return; } b.lit = !b.lit; b.redraw(); b.g.clearRect(0, 0, 40, 40); drawBox(b.g, b.lit); a.sfx.pop(); });
    };
    for (let i = 0; i < n; i++) a.after(400 + i * 420, () => land(i));
    a.text(task.q, 150, 262, { fontSize: '17px' });
    function ask() {
      const opts = choices(task.n, r);
      opts.forEach((v, i) => {
        const b = a.btn(String(v), 150 + i * 90, 440, () => {
          if (v === task.n) { a.sfx.good(); a.done({ ok: true, stars: 3, answer: v, n: task.n }); }
          else { a.sfx.bad(); b.style.opacity = .4; b.style.pointerEvents = 'none'; a.opts.onWrong && a.opts.onWrong(); }
        }, { padding: '6px 18px', fontSize: '18px' });
        b.className = 'o btn';
      });
    }
  },
};
