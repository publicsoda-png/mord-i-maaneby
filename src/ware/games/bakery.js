// Kraterbageriet: opskrift. "Hver Fnug skal have A boller, der er B Fnugger" → klik boller ind i bakken (venstre = 1,
// højre = 5) og tryk "Bag". Nat: tre ingredienser → bakken bliver til en håndskrevet madpakkeseddel (fever:'madpakke').
import { opg, seeded } from '../../opg.js';
import { hasBg } from '../../art/placeholder.js';

const KID = '"Comic Neue","Comic Sans MS",sans-serif';
let wrongIdx = 0;
const WRONG = [
  'Hm. Det passer ikke helt. Tæl en gang til.',
  'Næsten. Husk: boller pr. Fnug gange antal Fnugger.',
  'Prøv igen. Hvor mange boller skal der være i alt?',
];

export default {
  id: 'bakery',
  lines: {
    bakery_intro: 'Velkommen i Kraterbageriet. Fnuggerne er sultne, så vi bager boller. Klik på dejen for én bolle, højreklik for fem ad gangen.',
    bakery_ok: 'Mmm. Præcis nok boller til alle. Fnuggerne bygger videre.',
    bakery_wrong: () => WRONG[wrongIdx++ % WRONG.length],
  },
  setup(a) {
    const r = seeded(a.opts.seed ?? 1);
    const night = a.opts.night === true;
    const grade = a.opts.grade ?? 3;
    const R = hasBg('bakery'); // rendered bakery: the counting tray sits on the render's own tray spot, smaller buns

    // ---------- shared drawing ----------
    const bolle = (g, x, y, baked, s = 1) => {
      const w = Math.round(12 * s), h = Math.round(10 * s);
      g.fillStyle = baked ? '#6b3a12' : '#8a5a2a'; g.fillRect(x + 2, y + 3, w, h);          // hard shadow
      g.fillStyle = baked ? '#b8742a' : '#e9b65f'; g.fillRect(x, y, w, h);
      g.fillStyle = baked ? '#e3a24e' : '#f7d58d'; g.fillRect(x + 2, y, w - 4, 3);           // 2-step highlight
    };
    const trayBase = (g, w, h) => {
      g.fillStyle = night ? '#141210' : '#4a2c12'; g.fillRect(6, 6, w - 6, h - 6);              // shadow
      g.fillStyle = night ? '#3a3330' : '#8e8e96'; g.fillRect(0, 0, w - 6, h - 6);              // metal tray
      g.fillStyle = night ? '#2a2522' : '#6e6e78'; g.fillRect(0, 0, w - 6, 6); g.fillRect(0, 0, 6, h - 6);
      g.fillStyle = night ? '#4a423e' : '#b4b4bc'; g.fillRect(6, h - 16, w - 16, 4);
    };

    // ---------- NIGHT: three ingredients → lunchbox note ----------
    if (night) {
      a.text('Opskrift: mel, vand og gær.', 0, 92, { width: '640px', textAlign: 'center', fontSize: '17px', color: '#cfd3e0' });
      const ING = [
        { name: 'Mel', col: '#d8d4c8', dark: '#8a877c' },
        { name: 'Vand', col: '#5f8fc4', dark: '#2d4f78' },
        { name: 'Gær', col: '#c9a86a', dark: '#7a6238' },
      ];
      const added = [];
      const TW = 300, TH = 150;
      const tray = a.spr(390, 300, TW, TH, (g, mode) => {
        if (mode === 'note') return drawNote(g, TW, TH);
        trayBase(g, TW, TH);
        added.forEach((i, k) => {
          const x = 30 + k * 90, y = 50;
          g.fillStyle = ING[i].dark; g.fillRect(x + 3, y + 4, 50, 40);
          g.fillStyle = ING[i].col; g.fillRect(x, y, 50, 40);
        });
      });
      const bowls = ING.map((ing, i) => {
        const b = a.spr(120, 190 + i * 80, 100, 64, (g, used) => {
          g.fillStyle = '#0c0b0a'; g.fillRect(14, 24, 80, 36);
          g.fillStyle = used ? '#2b2724' : '#3d3733'; g.fillRect(10, 20, 80, 36);
          g.fillStyle = used ? '#2b2724' : ing.dark; g.fillRect(16, 14, 68, 10);
          g.fillStyle = used ? '#2b2724' : ing.col; g.fillRect(16, 10, 68, 8);
          a.draw(g, ing.name, 50, 44, { size: 13, color: '#e4e0d4', align: 'center' });
        });
        a.on(b, () => {
          if (b.used || added.length >= 3) return;
          b.used = true; b.redraw(true); added.push(i); tray.redraw();
          a.play('dej_klask', { gain: 0.8, pan: a.pan(120) });
          if (added.length === 3) a.after(700, becomeNote);
        });
        return b;
      });
      function drawNote(g, w, h) {
        // squared paper with pencil handwriting
        g.fillStyle = '#17150f'; g.fillRect(8, 8, w - 8, h - 8);
        g.fillStyle = '#f1eee2'; g.fillRect(0, 0, w - 8, h - 8);
        g.fillStyle = '#b9cbe3';
        for (let x = 16; x < w - 8; x += 16) g.fillRect(x, 0, 1, h - 8);
        for (let y = 16; y < h - 8; y += 16) g.fillRect(0, y, w - 8, 1);
        g.fillStyle = '#d98a8a'; g.fillRect(40, 0, 2, h - 8);
        ['madpakke', '1 rugbrød', '1 æble', '1 …'].forEach((s, i) => a.draw(g, s, 52, 14 + i * 28, { font: 'italic 700 17px ' + KID, color: '#3b3f55' }));
      }
      function becomeNote() {
        bowls.forEach((b) => (b.style.visibility = 'hidden'));
        tray.redraw('note');
        
        a.after(2800, () => a.done({ ok: true, fever: 'madpakke', night: true }));
      }
      return;
    }

    // ---------- DAY: recipe ----------
    const task = opg('mul', grade, r);
    const [per, n] = task.parts;
    const target = per * n;
    let count = 0, locked = false;

    a.text(`Hver Fnug skal have ${per} boller.`, 0, 86, { width: '640px', textAlign: 'center', fontSize: '17px' });
    a.text(`Der er ${n} Fnugger. Hvor mange boller skal der bages i alt?`, 0, 108, { width: '640px', textAlign: 'center', fontSize: '17px' });

    // the Fnugger in a row (counting aid)
    a.spr(320, 150, 360, 36, (g) => {
      const step = 34, x0 = 180 - (n * step) / 2;
      for (let i = 0; i < n; i++) {
        const x = x0 + i * step;
        g.fillStyle = '#5a5e6a'; g.fillRect(x + 3, 12, 24, 18);           // shadow
        g.fillStyle = '#c3c6d0'; g.fillRect(x, 9, 24, 18);                // tuft
        g.fillStyle = '#e8b623'; g.fillRect(x - 1, 4, 26, 7);             // helmet
        g.fillStyle = '#c48d10'; g.fillRect(x - 1, 9, 26, 2);
        g.fillStyle = '#111'; g.fillRect(x + 6, 15, 3, 3); g.fillRect(x + 15, 15, 3, 3);
      }
    });

    const TW = R ? 250 : 300, TH = R ? 90 : 150, PITCH = R ? 10 : 16, BS = R ? 0.6 : 1, COLS = Math.floor((TW - 18) / PITCH), ROWS = Math.floor((TH - 18) / PITCH);
    const tray = a.spr(R ? 365 : 400, R ? 328 : 290, TW, TH, (g, baked) => {
      trayBase(g, TW, TH);
      const shown = Math.min(count, COLS * ROWS);
      for (let i = 0; i < shown; i++) bolle(g, 10 + (i % COLS) * PITCH, 10 + Math.floor(i / COLS) * PITCH, baked, BS);
    });
    const counter = a.text('Boller i bakken: 0', R ? 240 : 256, R ? 380 : 376, { fontSize: '17px' });
    const setCount = (c) => { count = Math.max(0, c); counter.textContent = `Boller i bakken: ${count}`; tray.redraw(false); };

    // dough bowl: left click = 1, right click = 5 (five quick klasks)
    const bowl = a.spr(130, 300, 120, 100, (g, squish) => {
      g.fillStyle = '#4a2c12'; g.fillRect(16, 60, 100, 36);
      g.fillStyle = '#c9553a'; g.fillRect(10, 54, 100, 36);
      g.fillStyle = '#e07a5f'; g.fillRect(10, 54, 100, 6);
      const dy = squish ? 6 : 0;
      g.fillStyle = '#c99a5a'; g.fillRect(24, 26 + dy, 76, 34 - dy);
      g.fillStyle = '#f2d9a8'; g.fillRect(20, 20 + dy, 76, 34 - dy);
      g.fillStyle = '#fbeccb'; g.fillRect(28, 20 + dy, 40, 6);
      a.draw(g, 'DEJ', 60, 82, { size: 13, color: '#fff', align: 'center' });
    });
    a.text('Klik: 1  ·  Højreklik: 5', 72, 358, { fontSize: '13px', color: '#ffe9b0' });
    const klask = () => { a.play('dej_klask', { gain: 0.8, pan: a.pan(130) }); bowl.redraw(true); a.after(a.STEP, () => bowl.redraw(false)); };
    a.on(bowl, (e, p, button) => {
      if (locked) return;
      if (button === 2) { for (let i = 0; i < 5; i++) a.after(i * a.STEP, () => { klask(); setCount(count + 1); }); }
      else { klask(); setCount(count + 1); }
    });

    a.btn('Tøm bakken', 262, 414, () => { if (locked) return; setCount(0); });
    a.btn('Bag', 470, 414, () => {
      if (locked) return;
      locked = true;
      if (count === target) {
        a.play('ovn_ding', { gain: 0.9, pan: a.pan(470) });
        tray.redraw(true);
        a.after(900, () => a.done({ ok: true, stars: 3, answer: count, target }));
      } else {
        a.sfx.bad(); a.opts.onWrong && a.opts.onWrong();
        a.after(700, () => { setCount(0); locked = false; });
      }
    }, { width: '70px' });
  },
};
