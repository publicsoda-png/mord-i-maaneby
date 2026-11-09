// Stjernekikkerten: koordinater. Gitter 0–7 × 0–5 (grade>4: negative). Klik på stjernen i (x,y) fire gange → stjerne-
// billede tegnes med linjer. "Vakler" (save.flags.scope_face) og nat: de fire stjerner danner et ansigt; nat: pupiller
// følger cursoren.
import { opg, seeded } from '../../opg.js';

const KID = '"Comic Neue","Comic Sans MS",sans-serif';
let wrongIdx = 0;
const WRONG = [
  'Ikke den stjerne. Første tal er til siden, andet tal er op.',
  'Hm, kikkerten peger forkert. Prøv igen.',
  'Næsten. Find først x, så y.',
];

export default {
  id: 'scope',
  lines: {
    scope_intro: 'Her står Stjernekikkerten. Find stjernerne ud fra deres koordinater, så tegner vi et stjernebillede. Første tal er til siden, andet tal er op.',
    scope_ok: 'Se. Et helt nyt stjernebillede over Måneby. Fnuggerne bygger videre.',
    scope_wrong: () => WRONG[wrongIdx++ % WRONG.length],
  },
  setup(a) {
    const r = seeded(a.opts.seed ?? 1);
    const night = a.opts.night === true;
    const grade = a.opts.grade ?? 3;
    const face = night || !!(a.opts.save && a.opts.save.flags && a.opts.save.flags.scope_face);
    const neg = grade > 4;
    const minX = neg ? -5 : 0, maxX = 7, minY = neg ? -5 : 0, maxY = 5;
    const nx = maxX - minX + 1, ny = maxY - minY + 1;
    const cw = Math.floor(440 / (nx - 1)), ch = Math.floor(272 / (ny - 1));
    const GW = cw * (nx - 1), GH = ch * (ny - 1);
    const gx0 = Math.round(330 - GW / 2), gy0 = 118;              // field coords of (minX, maxY) — y grows upward
    const px = (x) => gx0 + (x - minX) * cw, py = (y) => gy0 + (maxY - y) * ch;

    // targets: face = fixed, otherwise 4 distinct coord tasks
    const targets = [];
    if (face) targets.push([2, 4], [5, 4], [2, 2], [5, 2]);
    else {
      let guard = 0;
      while (targets.length < 4 && guard++ < 100) { const t = opg('coord', grade, r).a; if (!targets.some((p) => p[0] === t[0] && p[1] === t[1])) targets.push(t); }
    }
    const found = [];
    let locked = false;

    const col = { grid: night ? '#2a2e44' : '#4a4f78', axis: night ? '#6a7098' : '#9aa0d0', star: night ? '#cfd3e0' : '#fff', gold: night ? '#e8e2c0' : '#ffd34a', line: night ? '#cfd3e0' : '#ffe9a0', label: night ? '#a9aec6' : '#dfe3ff' };

    // grid + all stars + constellation lines, one canvas; redraw()
    const PAD = 28;
    const grid = a.spr(gx0 + GW / 2, gy0 + GH / 2, GW + PAD * 2, GH + PAD * 2, (g) => {
      const lx = (x) => PAD + (x - minX) * cw, ly = (y) => PAD + (maxY - y) * ch;
      // kikkert-felt: flad mørk himmel bag gitteret med hård skygge
      g.fillStyle = night ? '#000008' : '#0a0a2a'; g.fillRect(PAD - 10 + 5, PAD - 10 + 5, GW + 20, GH + 20);
      g.fillStyle = night ? '#090a14' : '#1c1a3e'; g.fillRect(PAD - 10, PAD - 10, GW + 20, GH + 20);
      g.fillStyle = col.grid;
      for (let x = minX; x <= maxX; x++) g.fillRect(lx(x), PAD, 1, GH);
      for (let y = minY; y <= maxY; y++) g.fillRect(PAD, ly(y), GW, 1);
      g.fillStyle = col.axis; g.fillRect(lx(0), PAD, 2, GH); g.fillRect(PAD, ly(0), GW, 2);
      g.font = '700 11px ' + KID; g.fillStyle = col.label; g.textAlign = 'center';
      for (let x = minX; x <= maxX; x++) g.fillText(String(x), lx(x), PAD + GH + 16);
      g.textAlign = 'right';
      for (let y = minY; y <= maxY; y++) g.fillText(String(y), PAD - 8, ly(y) + 4);
      // small stars at every node
      g.fillStyle = col.star;
      for (let x = minX; x <= maxX; x++) for (let y = minY; y <= maxY; y++) { g.fillRect(lx(x) - 1, ly(y) - 1, 3, 3); }
      // lines between found stars
      g.strokeStyle = col.line; g.lineWidth = 2;
      if (face) {
        if (found.length === 4) {
          // head outline + mouth
          g.beginPath(); g.ellipse(lx(3.5), ly(3.1), cw * 2.6, ch * 2.9, 0, 0, Math.PI * 2); g.stroke();
          g.beginPath(); g.moveTo(lx(2), ly(2)); g.quadraticCurveTo(lx(3.5), ly(1.1), lx(5), ly(2)); g.stroke();
        }
      } else {
        g.beginPath();
        found.forEach((p, i) => (i ? g.lineTo(lx(p[0]), ly(p[1])) : g.moveTo(lx(p[0]), ly(p[1]))));
        if (found.length === 4) g.closePath();
        g.stroke();
      }
      // found stars: 4-point gold stars (eyes bigger in face mode)
      found.forEach((p, i) => {
        const x = lx(p[0]), y = ly(p[1]);
        const eye = face && i < 2;
        const s = eye ? 9 : 6;
        g.fillStyle = '#000'; g.fillRect(x - s + 2, y, s * 2, 3); g.fillRect(x + 1, y - s + 2, 3, s * 2);
        g.fillStyle = eye ? '#fff' : col.gold; g.fillRect(x - s, y - 1, s * 2, 3); g.fillRect(x - 1, y - s, 3, s * 2);
        g.fillRect(x - 3, y - 3, 6, 6);
        if (eye) { g.fillStyle = '#fff'; g.fillRect(x - 5, y - 5, 10, 10); }
      });
    });

    // night pupils (appear once both eyes are found)
    const pupils = night ? [0, 1].map(() => { const p = a.spr(-50, -50, 6, 6, (g) => { g.fillStyle = '#0a0a12'; g.fillRect(0, 0, 6, 6); }); p.style.visibility = 'hidden'; return p; }) : [];
    let cursor = { x: 320, y: 240 };
    const placePupils = () => {
      if (found.length < 2) return;
      pupils.forEach((p, i) => {
        const ex = px(targets[i][0]), ey = py(targets[i][1]);
        const dx = cursor.x - ex, dy = cursor.y - ey, len = Math.hypot(dx, dy) || 1;
        const k = Math.min(3, len / 60);
        p.style.visibility = 'visible'; p.at(ex + Math.round((dx / len) * k), ey + Math.round((dy / len) * k));
      });
    };
    if (night) a.move((e, p) => { cursor = p; placePupils(); }, true);

    // reticle (kikkerten)
    const ret = a.spr(gx0 + GW / 2, gy0 + GH / 2, 44, 44, (g) => {
      g.fillStyle = '#000'; g.fillRect(4, 21, 36, 2); g.fillRect(21, 4, 2, 36);
      g.strokeStyle = '#000'; g.lineWidth = 4; g.beginPath(); g.arc(23, 23, 15, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = night ? '#9fb0d0' : '#ff8a3c'; g.lineWidth = 2; g.beginPath(); g.arc(22, 22, 15, 0, Math.PI * 2); g.stroke();
      g.fillStyle = night ? '#9fb0d0' : '#ff8a3c'; g.fillRect(2, 21, 14, 2); g.fillRect(28, 21, 14, 2); g.fillRect(21, 2, 2, 14); g.fillRect(21, 28, 2, 14);
    });
    ret.style.pointerEvents = 'none';
    let rx = gx0 + GW / 2, ry = gy0 + GH / 2;
    const moveRet = (x, y) => {
      a.anim(ret, [{ transform: `translate(${rx - x}px,${ry - y}px)` }, { transform: 'translate(0,0)' }], { duration: 240, easing: 'steps(4)' });
      ret.at(x, y); rx = x; ry = y;
      if (!night) a.sfx.blip(220, 0.12, 0.05, 'sawtooth', 320); // servo
    };

    const q = a.text(targets[0] ? `Find stjernen i (${targets[0][0]}, ${targets[0][1]})` : '', 0, 86, { width: '640px', textAlign: 'center', fontSize: '18px' });
    const prog = a.text('Stjerne 1 af 4', 470, 436, { fontSize: '14px', color: col.label });

    a.on(grid, (e, p) => {
      if (locked || found.length >= 4) return;
      // nearest node
      const gx = Math.round((p.x - gx0) / cw) + minX, gy = maxY - Math.round((p.y - gy0) / ch);
      if (gx < minX || gx > maxX || gy < minY || gy > maxY) return;
      const nxp = px(gx), nyp = py(gy);
      if (Math.hypot(p.x - nxp, p.y - nyp) > Math.min(cw, ch) * 0.45) { a.sfx.tick(); return; }
      moveRet(nxp, nyp);
      const t = targets[found.length];
      if (gx === t[0] && gy === t[1]) {
        locked = true;
        a.after(260, () => {
          found.push(t); grid.redraw();
          a.sfx.blip(1600, 0.12, 0.08, 'sine', 2400); // stjerne-pling
          placePupils();
          if (found.length === 4) {
            q.textContent = face ? '' : 'Stjernebilledet er tegnet.';
            prog.textContent = '';
            a.after(night ? 2600 : 1400, () => a.done({ ok: true, stars: 3, face, night }));
          } else {
            const n = targets[found.length];
            q.textContent = `Find stjernen i (${n[0]}, ${n[1]})`;
            prog.textContent = `Stjerne ${found.length + 1} af 4`;
            locked = false;
          }
        });
      } else {
        a.sfx.bad(); a.opts.onWrong && a.opts.onWrong();
      }
    });
  },
};
