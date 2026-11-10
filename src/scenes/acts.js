// Akt 2–3: falsk slutning → nat → feberdrømme → jump scare → Rådhus/Regnerum → Regnskabet → Stille morgen → credits (+ skjult trueEnd).
// Art is procedural until renders land. All timing is driven from wrongness.js / hub.js; these scenes are self-contained.
import { register, goto, button, lock, cutBlack } from '../core/scene.js';
import { ctx, W, H, drawText, paletteFlash, rng, proc, stipple, bands } from '../core/stage.js';
import { bg, hasBg, drawFnug, drawBuilding } from '../art/placeholder.js';
import { say, helper, hideDialog, showHelper } from '../core/dialog.js';
import { save, meta, touch, persist, persistMeta, playMin } from '../core/state.js';
import { music, stopMusic, sfx, ambient, crtHum, crtOff, blip, jump as jumpSfx, jumpSilent } from '../core/audio.js';
import { applyMix, enterNight, stilleMorgen } from '../core/mix.js';
import { cur, showCursor } from '../core/cursor.js';
import { msgBox, showOS, sleep } from '../core/os.js';
import { PLOTS } from './hub.js';

const KID = '700 16px "Comic Neue","Comic Sans MS",sans-serif';
const KIDBIG = '700 34px "Comic Neue","Comic Sans MS",sans-serif';
const osLayer = document.getElementById('os');

// ------------------------------------------------------------------ fyrværkeri (fælles for falseEnd + trueEnd)
// Krater-krom only: the roll never carries story. The last entry gets save.name appended.
const NAMES13 = ['Idé og manuskript: Krater Multimedie', 'Programmering: J. Krøyer', 'Grafik: Mette L. Hansen', 'Musik: Torben Vang', 'Fortæller: Sara', 'Pædagogisk konsulent: Kirsten Møller', 'Produktion: Valby Multimediecenter', 'Lyd: Valby Lydstudie', 'Fnuggerne: Én, To, Tre, Fire, Fem, Seks,', 'Otte, Ni, Ti, Elleve, Tolv', 'Tak for hjælpen!', '', 'Bygmester: '];
const NAMES_TOLV = ['Idé og manuskript: Krater Multimedie', 'Programmering: J. Krøyer', 'Grafik: Mette L. Hansen', 'Musik: Torben Vang', 'Fortæller: Sara', 'Pædagogisk konsulent: Kirsten Møller', 'Produktion: Valby Multimediecenter', 'Lyd: Valby Lydstudie', 'Fnuggerne: Én, To, Tre, Fire, Fem, Seks, Syv,', 'Otte, Ni, Ti, Elleve, Tolv', 'Tak for hjælpen!', '', 'Bygmester: '];

function fyrEnter(sc) {
  sc.bgc = bg('hub'); sc.t0 = performance.now(); sc.r = rng(99);
  sc.rockets = []; sc.scroll = 0; sc.clicks = 0; sc.gone = false; sc.fall = 0;
  music('assets/music/fyrvaerkeri.ogg', { fade: 0.3, restart: true });
  lock(false);
  sc.hs = [{ x: 0, y: 0, w: W, h: H, cursor: 'arrow', on: () => sc.click() }];
  for (let i = 0; i < 9; i++) setTimeout(() => { if (!sc.gone) { sfx.thud(); sc.rockets.push({ x: 80 + sc.r() * 480, y: 60 + sc.r() * 120, t: performance.now(), c: ['#ff5a5a', '#ffd21f', '#5ad1ff', '#ff9bff'][i % 4] }); } }, 600 + i * 900);
}
/** town + n Fnugger + step-based fireworks (4 frames) */
function fyrBg(g, t, sc, n) {
  g.drawImage(sc.bgc, 0, 0);
  for (const p of PLOTS) if (!p.special) drawBuilding(g, p.x, p.y, Math.max(2, save.buildings[p.id] || 2), p.kind);
  const r = rng(7); for (let i = 0; i < n; i++) drawFnug(g, 60 + r() * 520, 300 + r() * 150, 1, { id: i, frame: Math.floor(t / 250) % 2 });
  for (const k of sc.rockets) {
    const age = (t - k.t) / 1000; if (age > 2.4) continue;
    const f = Math.floor(age * 4) % 4; const R = 10 + f * 14;
    g.fillStyle = k.c;
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillRect(Math.round(k.x + Math.cos(a) * R) - 2, Math.round(k.y + Math.sin(a) * R) - 2, 4, 4); } // heltal: ingen AA-kanter (A3)
  }
}
/** headline band + rolling credits (last entry gets the player's name) */
function fyrRoll(g, dt, sc, names, sub) {
  g.fillStyle = stipple('#000', 2); g.fillRect(0, 150, W, 90);
  if (!sc.fall) {
    drawText(`Tillykke, ${save.name}!`, 320, 160, { align: 'center', font: KIDBIG, color: '#ffd21f', outline: '#5a4610' });
    drawText(sub, 320, 206, { align: 'center', font: KID, color: '#fff' });
  } else {
    // letters fallen: crooked, lower (2 frames)
    const s = 'TILLYKKE'; let x = 200;
    for (let i = 0; i < s.length; i++) { const dy = (i * 37) % 23 - 5 + sc.fall * 14; drawText(s[i], x, 160 + dy, { font: KIDBIG, color: '#ffd21f', outline: '#5a4610' }); x += 30 + (i % 3) * 4; }
  }
  sc.scroll += dt * 22; const sy = Math.floor(sc.scroll / 2) * 2; // rullen i 2 px-trin (step-ur)
  g.fillStyle = stipple('#000', 2); g.fillRect(0, 250, W, 230);
  const last = names.length - 1;
  names.forEach((n, i) => { const y = 480 - sy + i * 26; if (y > 250 && y < 470) drawText(i === last ? n + save.name : n, 320, y, { align: 'center', font: KID, color: '#efeeee' }); });
  if (sc.clicks > 0 && sc.clicks < 3) drawText('(klik igen for at lukke)', 320, 460, { align: 'center', font: '11px Tahoma', color: '#83888d' });
}

// ------------------------------------------------------------------ falsk slutning (min ~50)
register({
  id: 'falseEnd',
  async enter() { fyrEnter(this); },
  hotspots() { return this.hs; },
  async click() {
    this.clicks++;
    if (this.clicks < 3) return; // "kan ikke lukkes"
    if (this.gone) return; this.gone = true;
    lock(true);
    if (window.MB_DEMO) {
      // artifact demo = akt 1 only
      stopMusic(0.5); const os = document.getElementById('os'); showOS(true); os.style.background = 'transparent'; os.innerHTML = '';
      await msgBox({ title: 'Regn med Måneby', icon: 'info', w: 340, parent: os, msg: 'Demoen slutter her.\n\nResten af spillet (og natten) ligger på:\n' + window.MB_DEMO, buttons: [{ label: 'Åbn', value: 'open', def: true }, { label: 'Luk', value: 'x' }] }).then((r) => { if (r === 'open') window.open(window.MB_DEMO, '_blank'); });
      showOS(false); this.gone = false; lock(false); this.clicks = 0; return;
    }
    stopMusic(0.05);
    // the logo letters fall and land crooked — 2 frames — then CRT off → night
    this.fall = 1; await sleep(90); this.fall = 2; await sleep(90);
    crtOff();
    save.act = 3; save.flags.nightStartMin = playMin(); touch();
    const black = cutBlack(3000);
    await enterNight(); // CRT off → 3 s nothing → hum + ventilation fade in (mix.js); sets save.night
    await black; persist(true);
    goto('hub', { back: false, nightIntro: true }, { black: 0 });
  },
  bg(g, dt, t) {
    fyrBg(g, t, this, 11);
    fyrRoll(g, dt, this, NAMES13, 'Måneby er færdig. Fnuggerne takker dig.');
  },
});

// ------------------------------------------------------------------ skjult slutning (2. gennemspilning, hall_answer aldrig sat)
register({
  id: 'trueEnd',
  async enter() { fyrEnter(this); },
  hotspots() { return this.hs; },
  async click() {
    this.clicks++;
    if (this.clicks < 3) return;
    if (this.gone) return; this.gone = true;
    lock(true); stopMusic(0.8);
    meta.ending = 'tolv'; persistMeta();
    save.flags.morning = true; save.night = false; touch(); persist(true);
    await cutBlack(1200);
    goto('credits', {}, { black: 0 }); // ingen nat
  },
  bg(g, dt, t) {
    fyrBg(g, t, this, 12);
    fyrRoll(g, dt, this, NAMES_TOLV, 'Måneby er færdig. Alle er her.');
  },
});

// ------------------------------------------------------------------ Feberdrøm I: Regnerummet (bag Rådhuset)
register({
  id: 'fever1',
  async enter() {
    lock(false); stopMusic(0.2); applyMix({ flags: { ...save.flags, scene: 'feber1' } });
    this.fn = Array.from({ length: 11 }, (_, i) => ({ x: 110 + (i % 6) * 90, y: 300 + Math.floor(i / 6) * 90, gone: false, look: 0 }));
    this.right = 0; this.ask();
    await say('Hvor mange bor her?', { noPortrait: true, auto: 1400 });
  },
  ask() {
    const ui = document.getElementById('ui');
    ui.querySelectorAll('.chip').forEach((c) => c.remove());
    const left = this.fn.filter((f) => !f.gone).length;
    const opts = [left, left + 1, 12, left - 1].filter((v, i, a) => v >= 0 && a.indexOf(v) === i).sort(() => 0.5 - rng(left)());
    opts.forEach((v, i) => {
      const c = document.createElement('div'); c.className = 'chip'; c.textContent = v; c.style.left = 200 + i * 60 + 'px'; c.style.top = '424px';
      c.addEventListener('pointerdown', (e) => { e.stopPropagation(); this.answer(v, left); }); ui.appendChild(c);
    });
  },
  async answer(v, left) {
    if (v === left) {
      // the lesson: right answers subtract
      blip(880, 0.08, 0.05, 'triangle'); setTimeout(() => blip(1320, 0.1, 0.05, 'triangle'), 100);
      const alive = this.fn.filter((f) => !f.gone); alive[alive.length - 1].gone = true;
      this.right++;
      if (this.right >= 3) { lock(true); await sleep(1200); await say('Godt. Nu er der færre.', { noPortrait: true, auto: 1500 }); save.flags.fever1 = true; touch(); goto('hub', { back: false }); return; }
    } else { this.fn.forEach((f) => (f.look = 1)); sfx.bzzt(); setTimeout(() => this.fn.forEach((f) => (f.look = 0)), 2500); }
    this.ask();
  },
  bg(g, dt, t) {
    bands(g, 0, 0, W, H, ['#0b0620', '#4a1d4f'], 8);
    // checker test floor in perspective-ish rows
    for (let y = 0; y < 6; y++) for (let x = -2; x < 20; x++) { g.fillStyle = (x + y) % 2 ? '#c8c8d8' : '#55556a'; const s = 24 + y * 10; g.fillRect(320 + (x - 9) * s, 250 + y * 38, s, 38); }
    for (const f of this.fn) {
      if (f.gone) continue;
      g.fillStyle = '#1b3a26'; g.fillRect(f.x - 22, f.y - 70, 44, 30); g.strokeStyle = '#8b6b3a'; g.lineWidth = 2; g.strokeRect(f.x - 22, f.y - 70, 44, 30);
      drawText('?', f.x, f.y - 66, { align: 'center', font: '700 18px "Comic Neue",sans-serif', color: '#fff' });
      drawFnug(g, f.x + (f.look ? (cur.x - f.x) * 0.01 : 0), f.y, 1, { id: this.fn.indexOf(f), frame: 0, night: true });
      if (f.look) { g.fillStyle = '#111'; g.fillRect(f.x - 4 + Math.sign(cur.x - f.x) * 1.5, f.y - 15, 2, 2); g.fillRect(f.x + 4 + Math.sign(cur.x - f.x) * 1.5, f.y - 15, 2, 2); }
    }
  },
});

// ------------------------------------------------------------------ Feberdrøm II: "Hjelmene" — tekst-adventure på sletten om natten
const MONO = '700 15px "Lucida Console", Menlo, monospace';
register({
  id: 'fever2',
  async enter() {
    lock(false); stopMusic(0.2); applyMix({ flags: { ...save.flags, scene: 'feber2' } });
    this.seen = 0;
    this.lines = ['> du står på sletten. det er nat.', '> ved bageriet står 12 hjelme på række. 11 har nogen under sig.'];
    this.cmds = ['SE', 'GÅ', 'SLUK LYSET'];
    this.mk();
  },
  mk() {
    const ui = document.getElementById('ui'); ui.querySelectorAll('.btn').forEach((b) => b.remove());
    this.cmds.forEach((c, i) => button(c, 40 + i * 160, 430, () => this.cmd(c), { w: 140 }));
  },
  async cmd(c) {
    sfx.tick();
    if (c === 'SE') {
      this.seen++;
      this.lines.push(this.seen === 1 ? '> den tomme hjelm er bulet. den er for lille.' : this.seen === 2 ? '> på bageriets disk ligger én bolle. den er kold.' : '> der er ikke mere at se.');
    } else if (c === 'GÅ') this.lines.push('> rådhuset er låst. der er ikke mere at lægge til.');
    else if (c === 'SLUK LYSET') {
      lock(true); crtOff(); crtHum(false);
      save.flags.fever2 = true; touch();
      await cutBlack(3000);
      goto('hub', { back: false }, { black: 0 }); return;
    }
    if (this.lines.length > 9) this.lines.shift();
  },
  bg(g) {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#00140a'; for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, 1);
    this.lines.forEach((l, i) => drawText(l, 24, 40 + i * 26, { font: MONO, color: '#4dff7a' }));
    if (Math.floor(performance.now() / 500) % 2) drawText('> _', 24, 40 + this.lines.length * 26, { font: MONO, color: '#4dff7a' });
  },
});

// ------------------------------------------------------------------ Jump scare (min 68, den eneste)
/** Rådhusets sal i flash-lys fra døren (venstre): perspektivgulv, 4 søjler, stenvæg — og i væggen en indemuret Fnug. */
export function drawHall(g) {
  const r = rng(68);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  // back wall: big stones, 1 px mortar, lit from the left
  const WALL_T = 40, WALL_B = 330;
  g.fillStyle = '#111114'; g.fillRect(0, WALL_T, W, WALL_B - WALL_T);
  const rowH = 44;
  for (let row = 0, y = WALL_T; y < WALL_B; row++, y += rowH) {
    let x = row % 2 ? -36 : 0;
    while (x < W) {
      const w = 60 + Math.floor(r() * 36);
      const lit = Math.max(0, 1 - x / W);
      const v = Math.round((34 + lit * 70 + (r() * 10 - 5)) / 8) * 8; // 8-trins grå (A3)
      g.fillStyle = `rgb(${v},${v},${v + 4})`; g.fillRect(x + 1, y + 1, w - 1, Math.min(rowH, WALL_B - y) - 1);
      x += w;
    }
  }
  // floor: three hard-perspective steps toward the back wall
  const steps = [[WALL_B, 480, '#1c1c20', '#2a2a30'], [WALL_B + 40, 480, '#26262c', '#36363e'], [WALL_B + 95, 480, '#303036', '#44444c']];
  const vx = 320;
  for (let i = 0; i < 3; i++) {
    const [y] = steps[i];
    const ins = (480 - y) * 0.45; // edges converge toward vx
    g.fillStyle = steps[i][2];
    g.beginPath(); g.moveTo(-40 + ins * 0.4, y); g.lineTo(W + 40 - ins * 0.4, y); g.lineTo(W + 40, H); g.lineTo(-40, H); g.closePath(); g.fill();
    g.fillStyle = steps[i][3]; g.fillRect(0, y, W, 2); // riser edge
  }
  // flash light wedge from the door (left) across the floor
  g.fillStyle = '#5c5c64';
  g.beginPath(); g.moveTo(0, WALL_B + 6); g.lineTo(150, WALL_B + 6); g.lineTo(560, H); g.lineTo(0, H); g.closePath(); g.fill();
  g.fillStyle = '#7a7a84';
  g.beginPath(); g.moveTo(0, WALL_B + 20); g.lineTo(90, WALL_B + 20); g.lineTo(330, H); g.lineTo(0, H); g.closePath(); g.fill();
  for (const s of steps) { g.fillStyle = s[3]; g.fillRect(0, s[0], W, 2); } // edges stay crisp over the light
  // 4 columns, lit edge left / dark right
  for (const cx of [90, 230, 410, 550]) {
    const lit = Math.max(0, 1 - cx / W);
    const v = Math.round((50 + lit * 90) / 8) * 8;
    g.fillStyle = `rgb(${v},${v},${v + 6})`; g.fillRect(cx - 17, 0, 34, WALL_B + 12);
    g.fillStyle = `rgb(${v + 40},${v + 40},${v + 44})`; g.fillRect(cx - 17, 0, 6, WALL_B + 12);
    g.fillStyle = '#0c0c10'; g.fillRect(cx + 9, 0, 8, WALL_B + 12);
    g.fillStyle = `rgb(${v + 20},${v + 20},${v + 24})`; g.fillRect(cx - 22, WALL_B + 4, 44, 10); // base
    g.fillRect(cx - 22, 0, 44, 10); // capital
  }
  // the Fnug, pressed into the mortar — right of centre, head height
  const fx = 372, fy = 252;
  drawFnug(g, fx, fy, 2.2, { frame: 0, id: 6, night: false });
  // two stones laid OVER the tot so it reads as walled in
  g.fillStyle = '#3c3c42'; g.fillRect(fx - 72, fy - 96, 58, 42); g.fillStyle = '#111114'; g.fillRect(fx - 72, fy - 96, 58, 1); g.fillRect(fx - 15, fy - 96, 1, 42);
  g.fillStyle = '#34343a'; g.fillRect(fx + 18, fy - 56, 64, 44); g.fillStyle = '#111114'; g.fillRect(fx + 18, fy - 56, 64, 1); g.fillRect(fx + 18, fy - 56, 1, 44);
  // dented helmet, askew
  g.save(); g.translate(fx + 2, fy - 92); g.rotate(-0.35);
  g.fillStyle = '#d9b31a'; g.beginPath(); g.ellipse(0, 0, 24, 11, 0, Math.PI, 2 * Math.PI); g.fill(); g.fillRect(-28, -1, 56, 5);
  g.fillStyle = '#8a7010'; g.fillRect(6, -9, 9, 5); // the dent
  g.restore();
  // two black open eyes with a 1 px glint
  g.fillStyle = '#000'; g.fillRect(fx - 13, fy - 66, 7, 7); g.fillRect(fx + 6, fy - 66, 7, 7);
  g.fillStyle = '#fff'; g.fillRect(fx - 12, fy - 65, 1, 1); g.fillRect(fx + 7, fy - 65, 1, 1);
  // the usual small smile
  g.strokeStyle = '#222'; g.lineWidth = 2; g.beginPath(); g.moveTo(fx - 4, fy - 52); g.lineTo(fx + 4, fy - 52); g.stroke();
}
register({
  id: 'jump',
  async enter() {
    lock(true); hideDialog(); stopMusic(0.01); crtHum(false); showCursor(false); // ingen timeglas over salen
    const img = new Image(); img.src = 'assets/photos/jump_hall.png'; await new Promise((r) => { img.onload = r; img.onerror = r; });
    // ≤300 ms: the hall + the one clipped knæk (audio.js jump: master stays muted until the player acts)
    jumpSfx(3000);
    this.img = img.naturalWidth ? img : null; this.show = true;
    await sleep(280);
    this.show = false;
    await cutBlack(3000); // total silence
    while (jumpSilent()) { await sleep(100); } // black holds until the player clicks or types
    save.flags.phone = true; save.flags.jumped = true; touch(); persist(true);
    showCursor(true); goto('hub', { back: false, afterJump: true }, { black: 0 });
  },
  bg(g) {
    if (!this.show) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); return; }
    if (this.img) g.drawImage(this.img, 0, 0, W, H);
    else drawHall(g);
  },
});

// ------------------------------------------------------------------ Regnskabet (Tællerummet): lær ham minus (7 lag, baglæns)
const LOG = ['Dag 40. 11 på sletten. Rådhuset: 1. Lagt sammen: 12.', 'Dag 33. Rådhuset færdigt. 10 sov. Døren låst.', 'Dag 32. Sidste lag. 9 bar sten. 143 og Syv: 144.', 'Dag 31. 8 byggede. Syv sad på grunden hele dagen.', 'Dag 20. 7 lagde grund. Rådhuset skal tælle for mig.', 'Dag 7. 6 fik navne. Så talte jeg videre: Syv, Otte.', 'Dag 1. 5 landede. Så 7 mere. Vi trækker ikke fra.'];
register({
  id: 'logroom',
  async enter() {
    lock(false); stopMusic(0.3); hideDialog(); helper.present = true; helper.mood = 'calm'; showHelper(true);
    applyMix({ flags: { ...save.flags, scene: 'logrum' } });
    this.layer = 0; this.task = null; this.input = '';
    // no music until the first layer is dug (LYDPLAN: silence 55–84); each solved layer = byen with one instrument less
    await say('Her ligger det, vi ikke har talt med. Grav.', { noPortrait: false, hold: 300 });
    this.hs = [{ x: 160, y: 120, w: 440, h: 308, label: 'Grav', on: () => this.dig() }];
  },
  exit() { showHelper(false); },
  hotspots() { return this.task ? [] : this.hs || []; },
  async dig() {
    sfx.thud(); blip(140, 0.2, 0.1, 'sawtooth', 60);
    if (this.layer >= 7) { await this.finish(); return; }
    // one task solved backwards: the forbidden operation
    const a = 12, b = this.layer + 1;
    this.task = { q: `${a} − ${b} = ?`, a: a - b };
    this.keys();
    if (this.layer === 0) { await say('Det tegn … det kender jeg ikke. Vis mig.', { hold: 200 }); }
  },
  keys() {
    const ui = document.getElementById('ui'); ui.querySelectorAll('.btn,.chip').forEach((b) => b.remove());
    for (let i = 0; i <= 9; i++) {
      button(String(i), 170 + (i % 5) * 56, 380 + Math.floor(i / 5) * 40, () => this.key(String(i)), { w: 48 });
    }
    button('Svar', 460, 380, () => this.key('ok'), { w: 80 });
    button('Slet', 460, 420, () => this.key('del'), { w: 80 });
    setTimeout(() => { if (!save.flags.minusDrawn) { save.flags.minusDrawn = true; touch(); sfx.sticker(); this.keys(); } }, 2500);
    if (save.flags.minusDrawn) button('−', 112, 420, () => {}, { w: 48, cls: 'minus' }); // egen plads til venstre for rækken: 7 skal kunne tastes (lag 5 kræver 12−5=7) – QC r4 B1
  },
  async key(k) {
    sfx.click();
    if (k === 'del') this.input = this.input.slice(0, -1);
    else if (k === 'ok') {
      if (+this.input === this.task.a) {
        // one building goes: hard cut through black
        const built = PLOTS.filter((p) => !p.special && save.buildings[p.id]);
        if (built.length) { const p = built[built.length - 1]; delete save.buildings[p.id]; touch(); }
        this.layer++; this.task = null; this.input = '';
        document.getElementById('ui').querySelectorAll('.btn,.chip').forEach((b) => b.remove());
        await cutBlack(260);
        music(`assets/music/byen_minus${Math.min(7, this.layer)}.ogg`, { fade: 0.3, restart: true });
        if (this.layer === 7) { await say('Så det var ikke mord. Det var bare … mindre.', { hold: 600 }); await this.finish(); }
        else if (this.layer === 1) await say('Nå. Så bliver der … færre. Ja.', { auto: 1800 });
      } else { sfx.bad(); this.input = ''; }
    } else if (this.input.length < 3) this.input += k;
  },
  async finish() {
    lock(true); stopMusic(1);
    await sleep(4000); // 12→11 still
    save.flags.morning = true; save.night = false; save.act = 4; touch(); persist(true);
    meta.ending = 'stille-morgen'; persistMeta();
    await cutBlack(1200);
    goto('morning', {}, { black: 0 });
  },
  bg(g) {
    g.fillStyle = '#120d0a'; g.fillRect(0, 0, W, H);
    // dug layers (newest on top; the number in layer n is 12−n)
    for (let i = 0; i < 7; i++) { g.fillStyle = i < this.layer ? '#0a0806' : ['#5a3d22', '#4b321c', '#3f2a18', '#352314', '#2c1d10', '#24170d', '#1c110a'][i]; g.fillRect(160, 120 + i * 44, 440, 44); if (i < this.layer) drawText(LOG[i], 172, 134 + i * 44, { font: '12px "Lucida Console", Menlo, monospace', color: '#cfc3a8' }); }
    drawText('Regnskabet', 160, 96, { font: '700 14px Tahoma', color: '#cfc3a8' });
    if (this.task) {
      g.fillStyle = stipple('#000', 3); g.fillRect(120, 330, 400, 40);
      drawText(`${this.task.q.replace('?', this.input || '_')}`, 320, 338, { align: 'center', font: '700 22px "Comic Neue",sans-serif', color: '#fff' });
    }
  },
});

// ------------------------------------------------------------------ Stille morgen (byen som dag 31) + credits
const BLINES = { landing: '12 kasser. Alle talt.', bakery: '12 boller. Én til hver. Én bliver kold.', ice: 'Isen holder.', scope: 'Man kan se hele sletten herfra.', school: 'Dagens tælling: 12', quarry: 'Man må gerne grave.', hall: 'Ikke endnu.', light: 'Lyset er til at finde hjem efter.', fire: '' };
register({
  id: 'morning',
  async enter() {
    lock(false); save.night = false;
    this.bgc = bg('hub'); this.t0 = performance.now(); this.said = false; this.free = false; this.idle = performance.now();
    showHelper(true);
    await stilleMorgen(); // ventilation switches off audibly, 4 s of nothing, then the morning theme (mix.js)
    music('assets/music/byen_morgen.ogg', { fade: 3 });
    await sleep(1500);
    helper.present = true; helper.mood = 'calm';
    this.free = true; this.idle = performance.now(); // a0 run 9: say() uden auto venter på ▼-klik, så timeren skal starte FØR replikken – ellers kommer credits aldrig uden klik
    await say('Udmærket.', { voice: 'assets/voice/udmaerket.ogg', mouth: 'assets/voice/udmaerket.json', hold: 800 });
    this.said = true;
    this.hs = PLOTS.map((p) => ({ x: p.x - 34, y: p.y - 44, w: 68, h: 54, cursor: 'hand', on: () => this.look(p) }));
    this.hs.push({ x: 6, y: 226, w: 130, h: 250, on: () => sfx.tick() }); // help = tick, where the helper stands
  },
  exit() { showHelper(false); }, // QC r4 B3: hjælper + stol må ikke stå over credits/titel
  hotspots() { return this.said ? this.hs : []; },
  async look(p) {
    this.idle = performance.now(); sfx.click();
    if (p.special) { this.rocket = performance.now(); sfx.thud(); await sleep(2500); goto('credits'); return; }
    await say(BLINES[p.id] || '…', { noPortrait: true, auto: 1800 });
  },
  tick() { if (this.free && performance.now() - this.idle > 120000) { this.idle = Infinity; hideDialog(); goto('credits'); } }, // a0 run 7/9: 120 s fra "Udmærket." vises, ingen replik synlig over credits
  bg(g, dt, t) {
    g.drawImage(this.bgc, 0, 0);
    // day 31: every building stage 1; the hall is only a plot — a flat light plateau with Syv sitting on it
    for (const p of PLOTS) {
      if (p.special) continue;
      if (p.id === 'hall') {
        g.fillStyle = '#cdcdce'; g.fillRect(p.x - 44, p.y - 12, 88, 16); // dag-palettefarver (A3)
        g.fillStyle = '#d6d5d7'; g.fillRect(p.x - 44, p.y - 12, 88, 3);
        drawBuilding(g, p.x, p.y, 0, p.kind);
        drawFnug(g, p.x, p.y - 6, 0.75, { frame: 0, id: 6 });
        // small dented helmet, askew (~-15°)
        const hx = p.x + 1, hy = p.y - 38; g.fillStyle = '#ffd21f'; // pixelhjelm, skæv (bremmen hælder mod højre), kun heltals-rekter: ingen rotate/AA (A3)
        g.fillRect(hx - 5, hy - 6, 11, 2); g.fillRect(hx - 8, hy - 4, 16, 3); g.fillRect(hx - 10, hy - 1, 20, 2); g.fillRect(hx + 7, hy + 1, 5, 1);
        g.fillStyle = '#c9a516'; g.fillRect(hx + 2, hy - 5, 4, 2); // the dent
        continue;
      }
      drawBuilding(g, p.x, p.y, 1, p.kind);
    }
    const r = rng(12); for (let i = 0; i < 12; i++) drawFnug(g, 60 + r() * 520, 300 + r() * 150, 1, { id: i, frame: 0 });
    // the bench is back: the render has it baked in; only the procedural bg needs it drawn
    if (!hasBg('hub')) { g.fillStyle = '#6b4a2a'; g.fillRect(400, 455, 40, 5); g.fillRect(403, 460, 4, 8); g.fillRect(433, 460, 4, 8); }
    if (this.rocket) { const a = (t - this.rocket) / 1000; g.fillStyle = '#ddd'; g.fillRect(318, 440 - Math.min(60, a * 80), 4, 12); }
  },
});

const CREDITS = ['REGN MED MÅNEBY', '', 'Idé og manuskript: Krater Multimedie ApS, Valby', 'Programmering: J. Krøyer', 'Grafik: Mette L. Hansen', 'Musik: Torben Vang (GM Wavetable)', 'Fortæller: Sara', 'Pædagogisk konsulent: Kirsten Møller', 'Produktion: Valby Multimediecenter', '', 'Tak til Fnuggerne:', 'Én, To, Tre, Fire, Fem, Seks, Syv,', 'Otte, Ni, Ti, Elleve, Tolv', '', 'Fan-inspireret hyldest. Ikke tilknyttet Bitfrost Interactive eller maaneby.dk.', 'Alle figurer, steder og personer er opdigtede.', '', '', '', 'Mord i Måneby'];
register({
  id: 'credits',
  async enter() {
    lock(true); hideDialog(); showHelper(false); applyMix({ flags: { ...save.flags, scene: 'credits' } });
    music('assets/music/credits.ogg', { fade: 1, restart: true });
    this.t0 = performance.now();
    setTimeout(() => { lock(false); button('Luk', 290, 440, () => goto('title'), { w: 60 }); }, 38000);
  },
  bg(g, dt, t) {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    const y0 = 480 - Math.floor((t - this.t0) / 100) * 2; // 10 trin/s à 2 px (step-ur), ikke glidende
    CREDITS.forEach((l, i) => { const y = y0 + i * 28; if (y > -30 && y < H) drawText(l, 320, y, { align: 'center', font: i === CREDITS.length - 1 ? '11px Tahoma' : i === 0 ? KIDBIG : KID, color: i === CREDITS.length - 1 ? '#666' : i === 0 ? '#ffd21f' : '#ddd' }); });
  },
});
