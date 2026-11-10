// Krom: sort → Krater Multimedie-ident → loader "Henter Måneby…" → "Klik for at begynde" (= ensureAudio) → title → setup.
// Alt krom er død: intet skrivebord, ingen computer, intet fra spillerens verden (docs/RETNING.md).
import { register, goto, button, lock } from '../core/scene.js';
import { W, H, drawText } from '../core/stage.js';
import { showOS, osEl, progressBox, fakeProgress, sleep } from '../core/os.js';
import { ensureAudio, audioCtx, sfx, music, stopMusic, preload as preloadAudio } from '../core/audio.js';
import { save, meta, persist, persistMeta, resetSave } from '../core/state.js';
import { bg, drawFnug, drawBuilding } from '../art/placeholder.js';
import { stipple } from '../core/stage.js';
import { helper, showHelper } from '../core/dialog.js';
import { helperShadow } from './hub.js';
import { showCursor } from '../core/cursor.js';

const IDENT_MUSIC = 'assets/music/ident.ogg';
const KROM_FONT = '700 12px Tahoma, "DejaVu Sans", Verdana, sans-serif';
const app = document.getElementById('app');

/** Studie-chime: ident.ogg hvis den findes (agent E), ellers krom-støj. Kræver en kørende AudioContext. */
async function chime() {
  if (!audioCtx()) return false;
  try {
    const [buf] = await preloadAudio([IDENT_MUSIC]);
    if (buf) { music(IDENT_MUSIC, { restart: true, fade: 0.05 }); setTimeout(() => stopMusic(0.2), 3200); } // 3 s chime, ikke loop
    else sfx.cdSpin(2.4);
  } catch { sfx.cdSpin(2.4); }
  return true;
}

register({
  id: 'ident',
  async enter() {
    lock(true);
    showCursor(false);
    showOS(false);
    app.style.visibility = 'visible';
    this.phase = 'ident'; this.going = false; // ident | black | loader | click
    this.t0 = performance.now();
    this.chimed = false;
    // Et tidligt klik (fx dev) tænder lyden, så chimen kan høres under identen. Ellers tændes den ved "Klik for at begynde".
    const early = () => { ensureAudio(); };
    addEventListener('pointerdown', early, { once: true });
    this.chimed = await chime();
    await sleep(3000); // identen: sort → 2 hårde trin → hold (tegnes i bg())
    // hårdt cut gennem sort til loader-boksen
    this.phase = 'black';
    await sleep(300);
    this.phase = 'loader';
    osEl.innerHTML = ''; osEl.style.background = '#000';
    showOS(true); app.style.visibility = 'hidden';
    const box = progressBox({ title: 'Mord i Måneby', text: 'Henter Måneby…' });
    await fakeProgress(box, { ms: 2600 }); // beholder det koreograferede ryk
    await sleep(300);
    box.close();
    showOS(false); app.style.visibility = 'visible';
    removeEventListener('pointerdown', early);
    this.phase = 'click';
    this.t1 = performance.now();
    showCursor(true);
    lock(false);
  },
  async click() {
    if (this.phase !== 'click' || this.going) return;
    this.going = true;
    ensureAudio(); // første pointerdown: her tændes lyden (ellers tavshed hele vejen)
    lock(true);
    if (!this.chimed) { this.phase = 'ident'; this.t0 = performance.now() - 1400; this.chimed = await chime(); await sleep(1400); } // ingen lyd under identen → chimen høres nu, kort
    goto('title');
  },
  bg(g, dt, t) {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    if (this.phase === 'ident') {
      const step = Math.floor((t - this.t0) / 700); // 0 = sort, 1 = navn, 2+ = navn + undertekst (hårde trin, ingen tween)
      if (step >= 1) {
        const f1 = '700 44px Tahoma, "DejaVu Sans", Verdana, sans-serif';
        drawText('KRATER MULTIMEDIE', 323, 203, { align: 'center', font: f1, color: '#4a4a4a' }); // hård skygge
        drawText('KRATER MULTIMEDIE', 320, 200, { align: 'center', font: f1, color: '#fff' });
      }
      if (step >= 2) {
        g.fillStyle = '#4a4a4a'; g.fillRect(222, 263, 200, 2);
        g.fillStyle = '#fff'; g.fillRect(220, 261, 200, 2);
        drawText('Valby · 2005', 320, 274, { align: 'center', font: KROM_FONT, color: '#bbb' });
      }
    } else if (this.phase === 'click') {
      const on = Math.floor((t - this.t1) / 500) % 2 === 0; // 500/500 ms blink som ▼
      if (on) {
        const f = '700 22px Tahoma, "DejaVu Sans", Verdana, sans-serif';
        drawText('Klik for at begynde', 322, 232, { align: 'center', font: f, color: '#4a4a4a' });
        drawText('Klik for at begynde', 320, 230, { align: 'center', font: f, color: '#fff' });
      }
      drawText('Krater Multimedie ApS, Valby · 2005', 320, 456, { align: 'center', font: '11px Tahoma, sans-serif', color: '#666' });
    }
  },
});

register({
  id: 'title',
  async enter() {
    lock(false);
    const b = bg('hub');
    this.t0 = performance.now();
    music(save.night ? 'assets/music/titel_nat.ogg' : 'assets/music/titel_b.ogg', { fade: 1.2 });
    const BF = { w: 124, h: 30, font: '700 16px "Comic Neue","Comic Sans MS",sans-serif' }; // større/mere kontrast (kolonne C r3)
    button('Start', 258, 392, () => { sfx.click(); goto('setup'); }, BF);
    if (save.name && !save.flags.morning) button('Fortsæt', 258, 430, () => { sfx.click(); goto('hub'); }, BF); // QC r4 K3: ingen Fortsæt efter slutningen
    this.bgc = b;
  },
  bg(g, dt, t) {
    g.drawImage(this.bgc, 0, 0);
    // title logo: big kid-font with hard shadow (placeholder for the real logo render)
    const bob = 0; // era rule: no continuous motion on the title
    // Kolonne C (b8 10-11): logoet rykket mod højre, så Jorden (x 205–265) står fri af "REGN"
    drawText('REGN MED', 400, 56 + bob, { align: 'center', font: '700 34px "Comic Neue","Comic Sans MS",sans-serif', color: '#ffd21f', outline: '#5a3a00' });
    drawText('MÅNEBY', 400, 92 + bob, { align: 'center', font: '700 58px "Comic Neue","Comic Sans MS",sans-serif', color: '#ffd21f', outline: '#5a3a00' });
    // liv på titlen (kolonne C r2+r3): by-silhuet som anker i horisonten (dither-sort, kun rektangler, dobbelt størrelse),
    // mellemgrund = kuppel til venstre + Fnug nr. 2 på bænken, forgrund = Fnug ved bænken med projiceret skygge
    g.fillStyle = stipple('#000000', 3);
    g.fillRect(84, 163, 8, 28); g.fillRect(80, 159, 16, 5); g.fillRect(116, 179, 72, 12); g.fillRect(128, 171, 48, 8); g.fillRect(140, 165, 24, 6); g.fillRect(196, 175, 20, 16); g.fillRect(204, 167, 4, 8); g.fillRect(222, 183, 30, 8);
    drawBuilding(g, 118, 326, 3, 'dome', save.night, 0.9);
    drawFnug(g, 505, 388, 0.9, { id: 7, night: save.night, shadow: false }); // sidder/står på bænken – skyggen ville falde på sædet
    drawFnug(g, 398, 452, 1.15, { id: 3, night: save.night });
    drawText('Krater Multimedie ApS, Valby · 2005', 320, 468, { align: 'center', font: '11px Tahoma, sans-serif', color: '#ccc' });
    drawText('Ver. 1.3.63', 8, 464, { font: '11px Tahoma, sans-serif', color: '#aaa' });
  },
});

register({
  id: 'setup',
  async enter() {
    const ui = document.getElementById('ui');
    const inp = document.createElement('input');
    inp.className = 'input'; inp.maxLength = 14; inp.style.left = '212px'; inp.style.top = '150px'; inp.style.width = '200px';
    inp.value = save.flags.morning || meta.ending ? '' : save.name || ''; // QC r4 K3: tomt efter slutningen; save.name kun ved fortsat spil
    ui.appendChild(inp);
    setTimeout(() => { inp.focus(); inp.select(); }, 50);
    const chips = [];
    let grade = save.grade || 3, sixClicks = 0;
    for (let i = 1; i <= 6; i++) {
      const c = document.createElement('div'); c.className = 'chip' + (grade === i ? ' on' : ''); c.textContent = String(i); c.title = 'Byggetrin ' + i;
      c.style.left = 192 + (i - 1) * 38 + 'px'; c.style.top = '240px'; // panelet er 280 bredt (kolonne C), 7. kugle ender på 420
      c.addEventListener('pointerdown', (e) => {
        e.stopPropagation(); sfx.pop();
        if (i === 6) { sixClicks++; if (sixClicks === 7 && !chips[6]) { const s = document.createElement('div'); s.className = 'chip'; s.textContent = '7'; s.title = 'Byggetrin 7'; s.style.left = '420px'; s.style.top = '240px'; s.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); grade = 7; chips.forEach((x) => x && x.classList.remove('on')); s.classList.add('on'); sfx.bzzt(); }); ui.appendChild(s); chips[6] = s; } } else sixClicks = 0;
        grade = i; chips.forEach((x) => x && x.classList.remove('on')); c.classList.add('on');
      });
      ui.appendChild(c); chips.push(c);
    }
    helper.present = true; helper.night = save.night; showHelper(true); // vært ved panelet (kolonne C r3)
    button('OK', 290, 318, () => {
      const name = inp.value.trim() || 'Bygmester';
      if (meta.ending || save.flags.morning || save.flags.log_open) resetSave(); // nyt spil efter credits: rent save (a0 QC 09-11)
      if (meta.ending) { save.flags.hall_open = true; save.flags.minus_known = true; } // 2. gennemspilning: rent save, DAG, byen husker (Rådhus åbent, minus-tast kendt)
      save.name = name; save.grade = grade;
      persistMeta(); persist(true);
      sfx.ok();
      goto('hub', { first: !Object.keys(save.buildings).length });
    }, { w: 60 });
    this.bgc = bg('hub');
  },
  exit() { showHelper(false); },
  bg(g) {
    g.drawImage(this.bgc, 0, 0);
    helperShadow(g, save.night);
    // opaque Director-style panel (no alpha blend over the render → ≤256). Kolonne C r3: ægte 2005-stenramme som knapperne (.btn-farver) om det mørkeblå felt, 280×264
    const px = 180, py = 100, pw = 280, ph = 264, fr = 8;
    g.fillStyle = '#2a2824'; g.fillRect(px + 2, py + 2, pw, ph); // hård slagskygge som .btn
    g.fillStyle = '#c9c3b3'; g.fillRect(px, py, pw, ph); // sten
    g.fillStyle = '#f4f1ea'; g.fillRect(px, py, pw, 2); g.fillRect(px, py, 2, ph); // ydre bevel lys
    g.fillStyle = '#5e5a52'; g.fillRect(px, py + ph - 2, pw, 2); g.fillRect(px + pw - 2, py, 2, ph); // ydre bevel mørk
    g.fillStyle = '#5e5a52'; g.fillRect(px + fr - 2, py + fr - 2, pw - 2 * fr + 4, 2); g.fillRect(px + fr - 2, py + fr - 2, 2, ph - 2 * fr + 4); // indre bevel (nedsænket felt)
    g.fillStyle = '#f4f1ea'; g.fillRect(px + fr - 2, py + ph - fr, pw - 2 * fr + 4, 2); g.fillRect(px + pw - fr, py + fr - 2, 2, ph - 2 * fr + 4);
    g.fillStyle = '#1a1230'; g.fillRect(px + fr, py + fr, pw - 2 * fr, ph - 2 * fr); // feltet
    drawText('Skriv dit navn:', 212, 124, { font: '700 16px "Comic Neue","Comic Sans MS",sans-serif', color: '#fff' });
    drawText('Hvilket byggetrin?', 212, 212, { font: '700 16px "Comic Neue","Comic Sans MS",sans-serif', color: '#fff' });
  },
});
