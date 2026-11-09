// Isværket: rørføring. Tanken har W liter; tre ventiler med brøker. Drej den ventil der lader præcis X liter løbe ned
// i isformen (opg 'frac'). Vandet løber i trin. Nat: en fjerde ventil uden tal — drejes den, løber vandet opad.
import { opg, seeded } from '../../opg.js';

const KID = '"Comic Neue","Comic Sans MS",sans-serif';
let wrongIdx = 0;
const WRONG = [
  'Hov, det blev ikke den rigtige mængde. Luk ventilen og prøv igen.',
  'Hm. Isformen passer ikke. Kig på brøkerne en gang til.',
  'Næsten. Hvilken del af tanken skal der løbe ned?',
];
const fmt = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ','));

export default {
  id: 'ice',
  lines: {
    ice_intro: 'Dette er Isværket. Vandet i tanken skal ned i isformen, men kun en del af det. Drej på den ventil, der giver præcis den rigtige mængde.',
    ice_ok: 'Lige præcis. Så fryser vi det til is, og Fnuggerne bygger videre.',
    ice_wrong: () => WRONG[wrongIdx++ % WRONG.length],
  },
  setup(a) {
    const r = seeded(a.opts.seed ?? 1);
    const night = a.opts.night === true;
    const grade = a.opts.grade ?? 3;
    const task = opg('frac', grade, r);
    const m = /^(\d+)\/(\d+) af (\d+)/.exec(task.q);
    const k = +m[1], d = +m[2], whole = +m[3];
    const X = task.a;

    // valve fractions: the right one + two wrong neighbours (same denominator; halves get quarters)
    const fr = [[k, d]];
    const pool = [];
    for (let kk = 1; kk < d; kk++) if (kk !== k) pool.push([kk, d]);
    if (d === 2) pool.push([1, 4], [3, 4]);
    while (fr.length < 3 && pool.length) fr.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    fr.sort(() => r() - 0.5);
    const xs = night ? [170, 290, 410, 530] : [200, 320, 440];
    const liters = (f) => (whole * f[0]) / f[1];

    // ---------- geometry (field coords) ----------
    const TANK = { x: 320, y: 132, w: 200, h: 54 };
    const MAN_Y = 204, VALVE_Y = 258, VAT_TOP = 350;
    const VAT = { x: 320, y: 395, w: 260, h: 80 };
    const col = {
      pipe: night ? '#3a3f4c' : '#8e97a8', pipeD: night ? '#1b1e26' : '#4f5664', water: night ? '#6a7fa8' : '#49a6e8', waterL: night ? '#94a6c8' : '#9fd9ff',
      tank: night ? '#2b2f3a' : '#b7c2d1', tankD: night ? '#121419' : '#5f6a7a', text: night ? '#cfd3e0' : '#fff',
    };

    a.text(`Der skal løbe præcis ${X} liter ned i isformen.`, 0, 84, { width: '640px', textAlign: 'center', fontSize: '17px', color: col.text });

    // tank
    a.spr(TANK.x, TANK.y, TANK.w, TANK.h, (g) => {
      g.fillStyle = col.tankD; g.fillRect(6, 6, TANK.w - 6, TANK.h - 6);
      g.fillStyle = col.tank; g.fillRect(0, 0, TANK.w - 6, TANK.h - 6);
      g.fillStyle = col.water; g.fillRect(6, 16, TANK.w - 18, TANK.h - 28);
      g.fillStyle = col.waterL; g.fillRect(6, 16, TANK.w - 18, 4);
      a.draw(g, `${whole} liter`, (TANK.w - 6) / 2, TANK.h / 2 - 3, { size: 18, color: '#111', align: 'center', valign: 'middle' });
    });

    // pipes: one canvas over the whole pipe area; redraw(stage, idx, up)
    const PY0 = TANK.y + TANK.h / 2 - 6, PH = VAT_TOP - PY0 + 4;
    const PW = 12;
    const pipes = a.spr(320, PY0 + PH / 2, 640, PH, (g, stage = 0, idx = -1, up = false) => {
      const L = (y) => y - PY0;
      const seg = (x, y, w, h, c, cd) => { g.fillStyle = cd; g.fillRect(x + 3, y + 3, w, h); g.fillStyle = c; g.fillRect(x, y, w, h); };
      // main drop + manifold + branches
      seg(320 - PW / 2, L(TANK.y + 20), PW, MAN_Y - TANK.y - 20, col.pipe, col.pipeD);
      seg(xs[0] - PW / 2, L(MAN_Y) - PW / 2, xs[xs.length - 1] - xs[0] + PW, PW, col.pipe, col.pipeD);
      xs.forEach((x) => { seg(x - PW / 2, L(MAN_Y), PW, VALVE_Y - MAN_Y, col.pipe, col.pipeD); seg(x - PW / 2, L(VALVE_Y), PW, VAT_TOP - VALVE_Y, col.pipe, col.pipeD); });
      if (idx < 0 || stage <= 0) return;
      const x = xs[idx], iw = PW - 4;
      const w = (x0, y0, ww, hh) => { g.fillStyle = col.water; g.fillRect(x0, y0, ww, hh); g.fillStyle = col.waterL; g.fillRect(x0, y0, 2, hh); };
      // stages 1..8: tank→manifold (1-2), along manifold (3-4), down to valve (5-6), valve→vat (7-8). `up` reverses order.
      const parts = [
        () => w(320 - iw / 2, L(TANK.y + 20), iw, (MAN_Y - TANK.y - 20) / 2),
        () => w(320 - iw / 2, L(TANK.y + 20), iw, MAN_Y - TANK.y - 20),
        () => { const a0 = Math.min(320, x), a1 = Math.max(320, x); w(a0 + (x < 320 ? (a1 - a0) / 2 : 0), L(MAN_Y) - iw / 2, Math.max(iw, (a1 - a0) / 2), iw); },
        () => { const a0 = Math.min(320, x), a1 = Math.max(320, x); w(a0, L(MAN_Y) - iw / 2, Math.max(iw, a1 - a0 + iw / 2), iw); },
        () => w(x - iw / 2, L(MAN_Y), iw, (VALVE_Y - MAN_Y) / 2),
        () => w(x - iw / 2, L(MAN_Y), iw, VALVE_Y - MAN_Y),
        () => w(x - iw / 2, L(VALVE_Y), iw, (VAT_TOP - VALVE_Y) / 2),
        () => w(x - iw / 2, L(VALVE_Y), iw, VAT_TOP - VALVE_Y),
      ];
      if (!up) { for (let s = 1; s <= stage && s <= 8; s += 2) parts[Math.min(7, s)](); }
      else { for (let s = 1; s <= stage && s <= 8; s += 2) parts[Math.max(0, 7 - s)](); }
    });

    // vat / isform: redraw(level 0..1, liters)
    const vat = a.spr(VAT.x, VAT.y, VAT.w, VAT.h, (g, lvl = 0, l = 0) => {
      g.fillStyle = col.tankD; g.fillRect(6, 6, VAT.w - 6, VAT.h - 6);
      g.fillStyle = col.tank; g.fillRect(0, 0, VAT.w - 6, VAT.h - 6);
      g.fillStyle = night ? '#1a1d24' : '#e8f4ff'; g.fillRect(6, 6, VAT.w - 18, VAT.h - 18);
      const ih = VAT.h - 18, wh = Math.round(ih * lvl);
      if (wh > 0) { g.fillStyle = col.water; g.fillRect(6, 6 + ih - wh, VAT.w - 18, wh); g.fillStyle = col.waterL; g.fillRect(6, 6 + ih - wh, VAT.w - 18, 3); }
      // ice cube dividers
      g.fillStyle = col.tankD; for (let i = 1; i < 6; i++) g.fillRect(6 + i * ((VAT.w - 18) / 6), 6, 2, ih);
      a.draw(g, `${fmt(l)} l`, VAT.w - 16, VAT.h - 40, { size: 18, color: '#111', align: 'right' });
      a.draw(g, 'ISFORM', 12, VAT.h - 36, { size: 12, color: '#111' });
    });

    // valves
    let busy = false, usedUp = false;
    const valves = xs.map((x, i) => {
      const nameless = night && i === 3;
      const v = a.spr(x, VALVE_Y, 60, 60, (g, turn = 0) => {
        g.fillStyle = col.pipeD; g.fillRect(12, 12, 40, 40);
        g.fillStyle = nameless ? '#2a2a2a' : (night ? '#6a3a3a' : '#c0392b'); g.fillRect(8, 8, 40, 40);
        g.fillStyle = nameless ? '#111' : (night ? '#3a1f1f' : '#7a1f14'); g.fillRect(16, 16, 24, 24);
        g.fillStyle = nameless ? '#3a3a3a' : (night ? '#8a5a5a' : '#f0c0b0');
        // 4 spokes, stepped rotation (0/22.5/45/67.5°)
        const c = 28, ang = (turn % 4) * (Math.PI / 8);
        for (let s = 0; s < 4; s++) { const aa = ang + s * Math.PI / 2; const dx = Math.round(Math.cos(aa) * 14), dy = Math.round(Math.sin(aa) * 14); g.fillRect(c + Math.min(0, dx) - 2, c + Math.min(0, dy) - 2, Math.abs(dx) + 4, Math.abs(dy) + 4); }
        g.fillStyle = '#111'; g.fillRect(c - 3, c - 3, 6, 6);
      });
      if (!nameless) a.text(`${fr[i][0]}/${fr[i][1]}`, x - 40, VALVE_Y + 32, { width: '80px', textAlign: 'center', fontSize: '18px', color: col.text });
      a.on(v, () => {
        if (busy) return;
        busy = true;
        a.play('ventil_hvaes', { gain: 0.8, pan: a.pan(x) });
        a.steps(4, (t) => v.redraw(t)); // 4-step turn on the step clock
        a.after(420, () => (nameless ? flowUp(i) : flow(i)));
      });
      return v;
    });
    function flow(i) {
      const l = liters(fr[i]);
      let s = 0;
      const tick = () => {
        s++; pipes.redraw(s, i, false);
        if (s % 2 === 1) a.play('roer_klik', { gain: 0.6, pan: a.pan(xs[i]) }); // water knocks in the pipe
        if (s < 8) a.after(a.STEP, tick); else { a.play('vand_gurgle', { gain: 0.8, pan: a.pan(xs[i]) }); fill(); }
      };
      const fill = () => {
        const lvl = Math.min(1, l / whole);
        let f = 0;
        const step = () => { f++; vat.redraw((lvl * f) / 6, Math.round((l * f) / 6 * 10) / 10); if (f < 6) a.after(a.STEP, step); else a.after(500, () => check(l, i)); };
        step();
      };
      tick();
    }
    function check(l, i) {
      if (l === X) { a.sfx.good(); a.after(600, () => a.done({ ok: true, stars: 3, liters: l, up: usedUp })); return; }
      a.sfx.bad(); a.opts.onWrong && a.opts.onWrong();
      // drain in steps, reset valve
      let f = 6;
      const lvl = Math.min(1, l / whole);
      const step = () => { f--; vat.redraw((lvl * f) / 6, Math.round((l * f) / 6 * 10) / 10); if (f > 0) a.after(a.STEP, step); else { pipes.redraw(0); valves[i].redraw(0); busy = false; } };
      a.after(500, step);
    }
    function flowUp(i) {
      usedUp = true;
      let s = 0;
      const tick = () => { s++; pipes.redraw(s, i, true); if (s % 2 === 1) a.play('roer_klik', { gain: 0.5, pan: a.pan(xs[i]) }); if (s < 8) a.after(a.STEP, tick); else a.after(1500, () => { pipes.redraw(0); valves[i].redraw(0); busy = false; }); };
      tick();
    }
  },
};
