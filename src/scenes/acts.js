// Akt 2–3: falsk slutning → nat → feberdrømme → jump scare → Rådhus/Regnerum → Logrummet → Stille morgen → credits.
// Art is procedural until renders land. All timing is driven from wrongness.js / hub.js; these scenes are self-contained.
import { register, goto, button, lock, cutBlack } from '../core/scene.js';
import { ctx, W, H, drawText, paletteFlash, rng, proc } from '../core/stage.js';
import { bg, drawFnug, drawBuilding } from '../art/placeholder.js';
import { say, helper, hideDialog, showHelper } from '../core/dialog.js';
import { save, meta, touch, persist, persistMeta, playMin } from '../core/state.js';
import { music, stopMusic, sfx, ambient, crtHum, crtOff, blip, jump as jumpSfx, jumpSilent } from '../core/audio.js';
import { applyMix, enterNight, stilleMorgen } from '../core/mix.js';
import { cur } from '../core/cursor.js';
import { msgBox, showOS, sleep } from '../core/os.js';
import { PLOTS } from './hub.js';

const KID = '700 16px "Comic Neue","Comic Sans MS",sans-serif';
const KIDBIG = '700 34px "Comic Neue","Comic Sans MS",sans-serif';
const osLayer = document.getElementById('os');

// ------------------------------------------------------------------ falsk slutning (min ~50)
const NAMES13 = ['Idé og manuskript: Krater Multimedie', 'Programmering: J. Krøyer', 'Grafik: Mette L. Hansen', 'Musik: Torben Vang', 'Stemme: Sara', 'Pædagogisk konsulent: Kirsten Møller', 'Afprøvet i 4.b', 'Produktion: Valby Multimediecenter', 'Tak til Skole-IT, Teknisk Forvaltning', 'Lyd: Valby Lydstudie', 'Oversættelse (ufærdig): —', 'Bygmester: B.', 'Bygmester: '];
register({
  id: 'falseEnd',
  async enter() {
    this.bgc = bg('hub'); this.t0 = performance.now(); this.r = rng(99);
    this.rockets = []; this.scroll = 0; this.clicks = 0;
    music('assets/music/fyrvaerkeri.ogg', { fade: 0.3, restart: true });
    lock(false);
    
    this.hs = [{ x: 0, y: 0, w: W, h: H, cursor: 'arrow', on: () => this.click() }];
    for (let i = 0; i < 9; i++) setTimeout(() => { if (!this.gone) { sfx.thud(); this.rockets.push({ x: 80 + this.r() * 480, y: 60 + this.r() * 120, t: performance.now(), c: ['#ff5a5a', '#ffd21f', '#5ad1ff', '#ff9bff'][i % 4] }); } }, 600 + i * 900);
  },
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
    document.title = location.hostname.endsWith('github.io') ? 'Mord i Måneby' : document.title;
    const black = cutBlack(3000);
    await enterNight(); // CRT off → 3 s nothing → hum + ventilation fade in (mix.js); sets save.night
    await black; persist(true);
    goto('hub', { back: false, nightIntro: true }, { black: 0 });
  },
  bg(g, dt, t) {
    g.drawImage(this.bgc, 0, 0);
    for (const p of PLOTS) if (!p.special) drawBuilding(g, p.x, p.y, Math.max(2, save.buildings[p.id] || 2), p.kind);
    const r = rng(7); for (let i = 0; i < 11; i++) drawFnug(g, 60 + r() * 520, 300 + r() * 150, 1, { id: i, frame: Math.floor(t / 250) % 2 });
    // fireworks: step-based bursts (4 frames)
    for (const k of this.rockets) {
      const age = (t - k.t) / 1000; if (age > 2.4) continue;
      const f = Math.floor(age * 4) % 4; const R = 10 + f * 14;
      g.fillStyle = k.c;
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillRect(k.x + Math.cos(a) * R - 2, k.y + Math.sin(a) * R - 2, 4, 4); }
    }
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 150, W, 90);
    if (!this.fall) {
      drawText(`Tillykke, ${save.name}!`, 320, 160, { align: 'center', font: KIDBIG, color: '#ffd21f', outline: '#5a3a00' });
      drawText('Måneby er færdig. Fnuggerne takker dig.', 320, 206, { align: 'center', font: KID, color: '#fff' });
    } else {
      // letters fallen: crooked, lower
      const s = 'TILLYKKE'; let x = 200;
      for (let i = 0; i < s.length; i++) { const dy = (i * 37) % 23 - 5 + this.fall * 14; drawText(s[i], x, 160 + dy, { font: KIDBIG, color: '#ffd21f', outline: '#5a3a00' }); x += 30 + (i % 3) * 4; }
    }
    // rolling credits (13 names, the 13th is the player's)
    this.scroll += dt * 22;
    g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 250, W, 230);
    NAMES13.forEach((n, i) => { const y = 480 - this.scroll + i * 26; if (y > 250 && y < 470) drawText(i === 12 ? n + save.name : n, 320, y, { align: 'center', font: KID, color: i === 11 ? '#ffd21f' : '#eee' }); });
    if (this.clicks > 0 && this.clicks < 3) drawText('(klik igen for at lukke)', 320, 460, { align: 'center', font: '11px Tahoma', color: '#888' });
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
      const c = document.createElement('div'); c.className = 'chip'; c.textContent = v; c.style.left = 200 + i * 60 + 'px'; c.style.top = '220px';
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
    const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#0b0620'); grd.addColorStop(1, '#4a1d4f'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
    // checker test floor in perspective-ish rows
    for (let y = 0; y < 6; y++) for (let x = -2; x < 20; x++) { g.fillStyle = (x + y) % 2 ? '#c8c8d8' : '#55556a'; const s = 24 + y * 10; g.fillRect(320 + (x - 9) * s, 250 + y * 38, s, 38); }
    for (const f of this.fn) {
      if (f.gone) continue;
      g.fillStyle = '#1b3a26'; g.fillRect(f.x - 22, f.y - 70, 44, 30); g.strokeStyle = '#8b6b3a'; g.lineWidth = 2; g.strokeRect(f.x - 22, f.y - 70, 44, 30);
      drawText('?', f.x, f.y - 66, { align: 'center', font: '700 18px "Comic Neue",sans-serif', color: '#fff' });
      drawFnug(g, f.x + (f.look ? (cur.x - f.x) * 0.01 : 0), f.y, 1, { id: this.fn.indexOf(f), frame: 0, night: true });
      if (f.look) { g.fillStyle = '#111'; g.fillRect(f.x - 4 + Math.sign(cur.x - f.x) * 1.5, f.y - 15, 2, 2); g.fillRect(f.x + 4 + Math.sign(cur.x - f.x) * 1.5, f.y - 15, 2, 2); }
    }
    drawText(`Hvor mange bor her?`, 320, 180, { align: 'center', font: KID, color: '#fff', outline: '#000' });
  },
});

// ------------------------------------------------------------------ Feberdrøm II: tekst-adventure i edb-lokalet
register({
  id: 'fever2',
  async enter() {
    lock(false); stopMusic(0.2); applyMix({ flags: { ...save.flags, scene: 'feber2' } });
    this.lines = ['> du er i edb-lokalet. rullegardinerne er nede.', '> der er 12 skærme. 11 er slukket.'];
    this.cmds = ['SE', 'GÅ', 'SLUK SKÆRM'];
    this.mk();
  },
  mk() {
    const ui = document.getElementById('ui'); ui.querySelectorAll('.btn').forEach((b) => b.remove());
    this.cmds.forEach((c, i) => button(c, 40 + i * 160, 430, () => this.cmd(c), { w: 140 }));
  },
  async cmd(c) {
    sfx.tick();
    if (c === 'SE') { this.seen = (this.seen || 0) + 1; this.lines.push(this.seen === 1 ? '> en stol er trukket ud. der ligger en madpakke på bordet.' : '> på skærmen der er tændt står der: tilbage om lidt'); }
    else if (c === 'GÅ') this.lines.push('> døren er låst. det er efter 16.');
    else if (c === 'SLUK SKÆRM') {
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
    this.lines.forEach((l, i) => drawText(l, 24, 40 + i * 26, { font: '700 15px "Lucida Console", Menlo, monospace', color: '#4dff7a' }));
    if (Math.floor(performance.now() / 500) % 2) drawText('> _', 24, 40 + this.lines.length * 26, { font: '700 15px "Lucida Console", Menlo, monospace', color: '#4dff7a' });
  },
});

// ------------------------------------------------------------------ Jump scare (min 68, den eneste)
register({
  id: 'jump',
  async enter() {
    lock(true); hideDialog(); stopMusic(0.01); crtHum(false);
    const img = new Image(); img.src = 'assets/raw/jump/jump_1.png'; await new Promise((r) => { img.onload = r; img.onerror = r; });
    // ≤300 ms: pencil drawing + the one clipped knæk (audio.js jump: master stays muted until the player acts)
    jumpSfx(3000);
    this.img = img.naturalWidth ? img : null; this.show = true;
    await sleep(280);
    this.show = false;
    await cutBlack(3000); // total silence
    while (jumpSilent()) { await sleep(100); } // black holds until the player clicks or types
    save.flags.phone = true; save.flags.jumped = true; touch(); persist(true);
    goto('hub', { back: false, afterJump: true }, { black: 0 });
  },
  bg(g) {
    if (!this.show) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); return; }
    if (this.img) g.drawImage(this.img, 0, 0, W, H);
    else {
      // procedural: squared paper + scribbled moon face
      g.fillStyle = '#f4f1e6'; g.fillRect(0, 0, W, H); g.strokeStyle = '#b9c7e0'; g.lineWidth = 1;
      for (let x = 0; x < W; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.strokeStyle = '#333'; g.lineWidth = 3; g.beginPath(); g.arc(330, 230, 150, 0.3, 5.9); g.stroke();
      g.beginPath(); g.arc(280, 190, 18, 0, 7); g.stroke(); g.fillStyle = '#222'; g.beginPath(); g.arc(284, 192, 9, 0, 7); g.fill();
      g.beginPath(); g.moveTo(250, 290); g.quadraticCurveTo(330, 380, 410, 280); g.stroke();
      g.lineWidth = 2; for (let i = 0; i < 30; i++) { g.beginPath(); g.moveTo(230 + i * 5, 300 + (i % 3) * 8); g.lineTo(225 + i * 5, 360 + (i % 5) * 6); g.stroke(); }
    }
  },
});

// ------------------------------------------------------------------ Logrummet: lær ham minus (7 lag, baglæns)
const LOG = ['17-11-2005 15:40  elev07 logget ind', '15:41  Rådhuset: "Rådhuss" (skrevet af bruger)', '15:44  hjælp ×38', '15:52  Landingspladsen: 12 kasser. svar: 11', '15:58  "hvor mange bor her" — intet svar', '16:03  hjælp ×400 i alt', '16:04  tilbage om lidt'];
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
      if (i === 7 && !save.flags.minusDrawn) continue; // the hole where 7 was — the minus key draws itself here
      button(String(i), 170 + (i % 5) * 56, 380 + Math.floor(i / 5) * 40, () => this.key(String(i)), { w: 48 });
    }
    button('Svar', 460, 380, () => this.key('ok'), { w: 80 });
    button('Slet', 460, 420, () => this.key('del'), { w: 80 });
    setTimeout(() => { if (!save.flags.minusDrawn) { save.flags.minusDrawn = true; touch(); sfx.sticker(); this.keys(); } }, 2500);
    if (save.flags.minusDrawn) button('−', 170 + 2 * 56, 420, () => {}, { w: 48, cls: 'minus' }); // sits in the hole where 7 was
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
    // dug layers
    for (let i = 0; i < 7; i++) { g.fillStyle = i < this.layer ? '#0a0806' : ['#5a3d22', '#4b321c', '#3f2a18', '#352314', '#2c1d10', '#24170d', '#1c110a'][i]; g.fillRect(160, 120 + i * 44, 440, 44); if (i < this.layer) drawText(LOG[i], 172, 134 + i * 44, { font: '12px "Lucida Console", Menlo, monospace', color: '#cfc3a8' }); }
    drawText('elev07.txt', 160, 96,{ font: '700 14px Tahoma', color: '#cfc3a8' });
    if (this.task) {
      g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(120, 330, 400, 40);
      drawText(`${this.task.q.replace('?', this.input || '_')}`, 320, 338, { align: 'center', font: '700 22px "Comic Neue",sans-serif', color: '#fff' });
    }
  },
});

// ------------------------------------------------------------------ Stille morgen + credits
const BLINES = { landing: 'her skal man ikke regne', bakery: 'boller til alle (også syv)', ice: 'isen er til at glide på', scope: 'man kan se jylland herfra', school: 'skolen er lukket om lørdagen', quarry: 'man må gerne grave', hall: 'Rådhuss', light: 'lyset er til at finde hjem efter', fire: '' };
register({
  id: 'morning',
  async enter() {
    lock(false); save.night = false;
    this.bgc = bg('hub'); this.t0 = performance.now(); this.said = false; this.idle = performance.now();
    showHelper(true);
    await stilleMorgen(); // ventilation switches off audibly, 4 s of nothing, then the morning theme (mix.js)
    music('assets/music/byen_morgen.ogg', { fade: 3 });
    await sleep(1500);
    helper.present = true; helper.mood = 'calm';
    await say('Udmærket.', { voice: 'assets/voice/udmaerket.ogg', mouth: 'assets/voice/udmaerket.json', hold: 800 });
    this.said = true;
    this.hs = PLOTS.map((p) => ({ x: p.x - 34, y: p.y - 44, w: 68, h: 54, cursor: 'hand', on: () => this.look(p) }));
    this.hs.push({ x: 6, y: 226, w: 130, h: 250, on: () => sfx.tick() }); // help = tick, where the helper stands
  },
  hotspots() { return this.said ? this.hs : []; },
  async look(p) {
    this.idle = performance.now(); sfx.click();
    if (p.special) { this.rocket = performance.now(); sfx.thud(); await sleep(2500); goto('credits'); return; }
    await say(BLINES[p.id] || '…', { noPortrait: true, auto: 1800 });
  },
  tick() { if (this.said && performance.now() - this.idle > 120000) { this.idle = Infinity; goto('credits'); } },
  bg(g, dt, t) {
    g.drawImage(this.bgc, 0, 0);
    // B.'s skæve by: every building stage 1 (leaning) except hall which is "fine but misspelt"
    for (const p of PLOTS) {
      if (p.special) continue;
      drawBuilding(g, p.x, p.y, p.id === 'hall' ? 3 : 1, p.kind);
      if (p.id === 'hall') drawText('Rådhuss', p.x, p.y - 80, { align: 'center', font: '700 13px "Comic Neue",sans-serif', color: '#fff', outline: '#000' });
    }
    const r = rng(12); for (let i = 0; i < 12; i++) drawFnug(g, 60 + r() * 520, 300 + r() * 150, 1, { id: i, frame: 0 });
    // the small one with the red hat by the bench
    g.fillStyle = '#6b4a2a'; g.fillRect(400, 455, 40, 5); g.fillRect(403, 460, 4, 8); g.fillRect(433, 460, 4, 8);
    drawFnug(g, 452, 462, 0.75, { id: 6, frame: 0 }); g.fillStyle = '#d22'; g.beginPath(); g.arc(452, 446, 7, Math.PI, 2 * Math.PI); g.fill();
    if (this.rocket) { const a = (t - this.rocket) / 1000; g.fillStyle = '#ddd'; g.fillRect(318, 440 - Math.min(60, a * 80), 4, 12); }
  },
});

const CREDITS = ['REGN MED MÅNEBY', '', 'Idé og manuskript: Krater Multimedie ApS, Valby', 'Programmering: J. Krøyer', 'Grafik: Mette L. Hansen', 'Musik: Torben Vang (GM Wavetable)', 'Fortæller: Sara', 'Pædagogisk konsulent: Kirsten Møller', 'Afprøvet i 4.b', 'Tak til Skole-IT, Teknisk Forvaltning', '', 'Fan-inspireret hyldest. Ikke tilknyttet Bitfrost Interactive eller maaneby.dk.', 'Alle figurer, steder og personer er opdigtede.', '', '', '', 'Mord i Måneby'];
register({
  id: 'credits',
  async enter() {
    lock(true); hideDialog(); applyMix({ flags: { ...save.flags, scene: 'credits' } });
    music('assets/music/credits.ogg', { fade: 1, restart: true });
    this.t0 = performance.now();
    setTimeout(() => { lock(false); button('Luk', 290, 440, () => goto('desktop'), { w: 60 }); }, 38000);
  },
  bg(g, dt, t) {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    const y0 = 480 - ((t - this.t0) / 1000) * 20;
    CREDITS.forEach((l, i) => { const y = y0 + i * 28; if (y > -30 && y < H) drawText(l, 320, y, { align: 'center', font: i === CREDITS.length - 1 ? '11px Tahoma' : i === 0 ? KIDBIG : KID, color: i === CREDITS.length - 1 ? '#666' : i === 0 ? '#ffd21f' : '#ddd' }); });
  },
});
