// Kridtgruben: a small breakout. Paddle follows the mouse, a ball knocks crystals with numbers out of the quarry wall.
// Task: hit every crystal whose number "går op i" T (divides T). Wrong crystal → onWrong, ball keeps going.
// Night (cursed): hit the WRONG ones instead; hitting a correct crystal turns it into a small grey Fnug silhouette
// that stays standing along the bottom. Max 60 s per round; a lost ball respawns after 1.5 s.
import { seeded } from '../../opg.js';

const FONT = '"Comic Neue","Comic Sans MS","Chalkboard SE",cursive';
const wrongLines = ['Den gik ikke op. Lad bolden flyve videre.', 'Hov, den passede ikke. Videre.', 'Ikke den krystal. Prøv en anden.'];

export default {
  id: 'quarry',
  lines: {
    quarry_intro: 'Kridtgruben. Styr skovlen med musen, og slå kun de krystaller løs, der passer. Bolden kommer altid tilbage.',
    quarry_ok: 'Gruben er tømt. Fnuggerne slæber kridtet hjem.',
    quarry_wrong: () => wrongLines[Math.floor(Math.random() * wrongLines.length)],
  },
  setup(a) {
    const r = seeded(a.opts.seed ?? Date.now());
    const grade = Math.max(1, Math.min(6, a.opts.grade ?? 3));
    const night = a.opts.night === true;
    const ri = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };

    // ---- the number T and 12 crystal numbers (6 divisors, 6 non-divisors)
    const T = [[6, 8, 10], [10, 12, 20], [12, 18, 24], [24, 30, 36], [36, 48, 60], [48, 72, 84]][grade - 1][ri(0, 2)];
    const divs = []; for (let d = 1; d <= T; d++) if (T % d === 0) divs.push(d);
    const good = shuffle(divs.slice()).slice(0, 6);
    while (good.length < 6) good.push(good[good.length % divs.length]); // small T: repeats are fine
    const bad = []; const cap = Math.max(13, T + 3);
    let guard = 0;
    while (bad.length < 6 && guard++ < 400) { const n = ri(2, cap); if (T % n !== 0 && !bad.includes(n)) bad.push(n); }
    while (bad.length < 6) bad.push(T + 1 + bad.length);
    const numbers = shuffle([...good.map((n) => ({ n, hits: true })), ...bad.map((n) => ({ n, hits: false }))]);
    // targets: by day the divisors, by night the non-divisors
    const isTarget = (c) => (night ? !c.hits : c.hits);

    // ---- arena
    const X0 = 100, X1 = 540, Y0 = 100, Y1 = 436;
    const AW = X1 - X0, AH = Y1 - Y0;
    a.spr((X0 + X1) / 2, (Y0 + Y1) / 2, AW, AH, (g) => {
      g.fillStyle = night ? '#171a24' : '#c9c3b2'; g.fillRect(0, 0, AW, AH);            // chalk floor
      g.fillStyle = night ? '#0c0e15' : '#8f8976'; g.fillRect(0, 0, AW, 4); g.fillRect(0, 0, 4, AH); // wall shadow
      g.fillStyle = night ? '#2a2e3c' : '#ebe6d8'; g.fillRect(AW - 4, 0, 4, AH); g.fillRect(0, AH - 4, AW, 4);
      g.fillStyle = night ? '#1f2330' : '#b7b09e';
      for (let i = 0; i < 26; i++) g.fillRect(12 + ((i * 97) % (AW - 30)), 60 + ((i * 53) % (AH - 90)), 6, 3); // chalk flecks
    });
    const title = a.text(night ? `Slå kun de krystaller, der IKKE går op i ${T}` : `Slå alle krystaller, der går op i ${T}`, 0, 74, { width: '640px', textAlign: 'center', fontSize: '17px', fontFamily: FONT });
    const clock = a.text('60', 556, 104, { fontSize: '18px', color: '#fff', fontFamily: FONT });
    a.text('sek.', 556, 126, { fontSize: '12px', fontFamily: FONT });
    const left = a.text('', 556, 160, { fontSize: '13px', width: '80px', whiteSpace: 'normal', lineHeight: '1.2', fontFamily: FONT });

    // ---- crystals: 6 × 2, 64×36, gap 8
    const CW = 64, CH = 36, GAP = 8, CX0 = X0 + 8 + CW / 2, CY0 = 128;
    const crystals = numbers.map((c, i) => {
      const col = i % 6, row = Math.floor(i / 6);
      const cx = CX0 + col * (CW + GAP), cy = CY0 + row * (CH + GAP);
      const hue = [['#7fd0ff', '#2f8fc9', '#d7f1ff'], ['#ffd27a', '#c98a3c', '#fff0c8'], ['#c9a4ff', '#7a4fc0', '#ece0ff'], ['#9ef0a0', '#3f9a4a', '#dbffdc']][(col + row) % 4];
      const s = a.spr(cx, cy, CW, CH, (g) => {
        const [face, dark, light] = night ? ['#3a3f52', '#1b1e29', '#565c74'] : hue;
        g.fillStyle = dark; g.beginPath(); g.moveTo(4, 14); g.lineTo(16, 3); g.lineTo(CW - 6, 3); g.lineTo(CW - 1, 14); g.lineTo(CW - 1, CH - 1); g.lineTo(4, CH - 1); g.closePath(); g.fill();
        g.fillStyle = face; g.beginPath(); g.moveTo(1, 12); g.lineTo(13, 1); g.lineTo(CW - 9, 1); g.lineTo(CW - 4, 12); g.lineTo(CW - 4, CH - 4); g.lineTo(1, CH - 4); g.closePath(); g.fill();
        g.fillStyle = light; g.fillRect(6, 6, 8, 3); g.fillRect(6, 9, 3, 8);
      });
      const t = document.createElement('div');
      t.textContent = String(c.n);
      t.style.cssText = `position:absolute;left:0;top:0;width:${CW}px;height:${CH}px;display:flex;align-items:center;justify-content:center;font:700 20px ${FONT};color:${night ? '#cfd3e0' : '#111'};text-shadow:${night ? 'none' : '1px 1px 0 rgba(255,255,255,.6)'};pointer-events:none;user-select:none`;
      s.appendChild(t);
      return { ...c, x: cx, y: cy, w: CW, h: CH, node: s, alive: true };
    });
    const targetsLeft = () => crystals.filter((c) => c.alive && isTarget(c)).length;
    const updateLeft = () => { left.textContent = `${targetsLeft()} tilbage`; };
    updateLeft();

    // ---- paddle & ball
    const PW = 84, PH = 10, PY = 424;
    let px = (X0 + X1) / 2;
    const paddle = a.spr(px, PY, PW, PH, (g) => {
      g.fillStyle = night ? '#111' : '#3a2a16'; g.fillRect(0, 2, PW, PH - 2);
      g.fillStyle = night ? '#4a4f60' : '#c98a3c'; g.fillRect(0, 0, PW - 2, PH - 3);
      g.fillStyle = night ? '#6a7088' : '#ffd27a'; g.fillRect(2, 0, PW - 6, 3);
    });
    const R = 6, SPEED = 230;
    const ball = a.spr(px, PY - 20, R * 2 + 2, R * 2 + 2, (g) => {
      g.fillStyle = night ? '#9aa0b8' : '#fff'; g.fillRect(2, 0, R * 2 - 2, R * 2 + 1); g.fillRect(0, 2, R * 2 + 2, R * 2 - 2);
      g.fillStyle = night ? '#555c74' : '#b9b3a4'; g.fillRect(R + 1, R + 1, R - 1, R - 1); g.fillRect(R + 2, R - 2, 3, 2);
    });
    let bx = px, by = PY - 20, vx = 0, vy = 0, live = false, respawnAt = 0, lost = false;
    const launch = () => {
      bx = px; by = PY - 20;
      const ang = (-90 + (r() < 0.5 ? -1 : 1) * (25 + r() * 25)) * Math.PI / 180;
      vx = Math.cos(ang) * SPEED; vy = Math.sin(ang) * SPEED; live = true; lost = false;
      ball.style.visibility = 'visible';
    };
    a.move((e, p) => { px = Math.max(X0 + PW / 2 + 2, Math.min(X1 - PW / 2 - 2, p.x)); }, true);

    // ---- Fnug silhouettes (night): grey tufts standing along the bottom wall
    let ghosts = 0;
    const ghost = () => {
      const gx = X0 + 18 + ghosts * 26; ghosts++;
      a.spr(gx, Y1 - 14, 22, 24, (g) => {
        g.fillStyle = '#3b3e48';
        for (let i = 0; i < 7; i++) { const t = (i / 7) * Math.PI * 2; g.fillRect(8 + Math.round(Math.cos(t) * 5), 9 + Math.round(Math.sin(t) * 5), 6, 6); }
        g.fillRect(6, 6, 10, 10); g.fillRect(5, 2, 12, 3); g.fillRect(6, 18, 3, 5); g.fillRect(13, 18, 3, 5);
      });
    };

    // ---- round clock
    let tLeft = 60, over = false, hits = 0, wrongs = 0;
    const finish = (how) => {
      if (over) return; over = true; live = false;
      a.after(600, () => a.done({ ok: true, hits, wrongs, cursed: night, timeout: how === 'time', T }));
    };
    a.every(1000, () => {
      if (over) return;
      tLeft--; clock.textContent = String(Math.max(0, tLeft));
      if (tLeft <= 0) {
        // time is up: the remaining target crystals crumble by themselves so the round always ends
        crystals.forEach((c) => { if (c.alive && isTarget(c)) { c.alive = false; c.node.style.visibility = 'hidden'; } });
        updateLeft(); a.sfx.thud(); finish('time');
      }
    });

    const hit = (c) => {
      c.alive = false; c.node.style.visibility = 'hidden';
      if (isTarget(c)) { hits++; if (!night) a.sfx.pop(); else a.sfx.tick(); }
      else {
        wrongs++;
        if (night) { ghost(); a.sfx.bzzt(); }
        else a.sfx.bad();
        a.opts.onWrong && a.opts.onWrong();
      }
      updateLeft();
      if (targetsLeft() === 0) { if (!night) a.sfx.good(); finish('clear'); }
    };

    // ---- main loop
    a.frame((dt, t) => {
      paddle.at(px, PY);
      if (over) return;
      if (!live) {
        if (!lost) { bx = px; by = PY - 20; ball.at(bx, by); if (t > 0.9) launch(); } // rest on paddle, launch after a beat
        else if (t >= respawnAt) launch();
        return;
      }
      bx += vx * dt; by += vy * dt;
      // walls
      if (bx - R < X0 + 4) { bx = X0 + 4 + R; vx = Math.abs(vx); a.sfx.tick(); }
      if (bx + R > X1 - 4) { bx = X1 - 4 - R; vx = -Math.abs(vx); a.sfx.tick(); }
      if (by - R < Y0 + 4) { by = Y0 + 4 + R; vy = Math.abs(vy); a.sfx.tick(); }
      // paddle
      if (vy > 0 && by + R >= PY - PH / 2 && by - R <= PY + PH / 2 && Math.abs(bx - px) <= PW / 2 + R) {
        by = PY - PH / 2 - R;
        const off = (bx - px) / (PW / 2);                   // -1..1 → angle
        const ang = (-90 + off * 55) * Math.PI / 180;
        vx = Math.cos(ang) * SPEED; vy = Math.sin(ang) * SPEED;
        a.sfx.thud();
      }
      // crystals
      for (const c of crystals) {
        if (!c.alive) continue;
        const dx = bx - c.x, dy = by - c.y;
        const ox = c.w / 2 + R - Math.abs(dx), oy = c.h / 2 + R - Math.abs(dy);
        if (ox > 0 && oy > 0) {
          if (ox < oy) { vx = dx < 0 ? -Math.abs(vx) : Math.abs(vx); bx += dx < 0 ? -ox : ox; }
          else { vy = dy < 0 ? -Math.abs(vy) : Math.abs(vy); by += dy < 0 ? -oy : oy; }
          hit(c);
          break;
        }
      }
      // never let the ball crawl sideways forever
      if (Math.abs(vy) < SPEED * 0.3) { vy = (vy < 0 ? -1 : 1) * SPEED * 0.3; const k = SPEED / Math.hypot(vx, vy); vx *= k; vy *= k; }
      // lost
      if (by - R > Y1) { live = false; lost = true; respawnAt = t + 1.5; ball.style.visibility = 'hidden'; a.sfx.thud(); return; }
      ball.at(Math.round(bx), Math.round(by));
    });
  },
};
