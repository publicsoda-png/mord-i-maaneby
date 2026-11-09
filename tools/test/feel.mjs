// WP7 — blind "nybegynder-bot" der måler spil-feel (QC-POLISH-PLAN §3). Køres af en ANDEN agent end bygge-agenten.
// Brug:  node tools/test/feel.mjs [--minutes 3] [--port 4963] [--seed 7]     → tools/test/feel/feel-report.json + kontakt.png + GIF'er
//        node tools/test/feel.mjs --pacing [--port 4963] [--seed 7]           → tools/test/feel/pacing-<M>.png + feel/pacing-judge/K0N.{png,gif} + feel-key/key.json
// Kræver: puppeteer-core + system-Chrome, python3 (http.server), ImageMagick (magick), ffmpeg.
// Målemetode (justeret af QC 10-11): klik-latens = pointerdown (sidens eget tidsstempel) → første screencast-frame med
// >0,1 % pixeldiff ved fuzz 0 mod et screenshot taget umiddelbart før klikket; cursor-spritens 40×40-felt omkring
// klikpunktet maskeres, så et cursorskift ikke tæller som spilrespons. Dead click = ingen diff OG ingen lyd inden 400 ms.
// Lyd hookes udefra (evaluateOnNewDocument) på AudioBufferSourceNode.prototype.start + OscillatorNode.prototype.start → window.__sfxLog.
import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const PACING = argv.includes('--pacing');
const MINUTES = +arg('--minutes', 3);
const PORT = +arg('--port', 4963);
const SEED = +arg('--seed', 7);
const out = path.join(here, 'feel');
const keyDir = path.join(here, 'feel-key');
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const magick = (...a) => execFileSync('magick', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const gitHash = (() => { try { return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim() + (execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' }).trim() ? '+dirty' : ''); } catch { return '?'; } })();
const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
// seeded PRNG (mulberry32) — bot-adfærd og pacing-shuffle er reproducerbare pr. --seed
let seedState = SEED >>> 0;
const rnd = () => { seedState = (seedState + 0x6d2b79f5) >>> 0; let t = seedState; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// Mål (QC-POLISH-PLAN §3 + QUALITY-PLAN §2)
const TARGETS = { latency_ms_max: 100, diff_pct_min: 0.1, diff_fuzz: 0, dead_window_ms: 400, sound_window_ms: 150, cps_min: 24, cps_max: 32, max_lines: 3, time_to_hub_s_max: 90, pacing_min: [0, 6, 12, 18, 24, 30] };

// ---------- server ----------
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
let up = false;
for (let i = 0; i < 100; i++) { try { if ((await fetch(`http://127.0.0.1:${PORT}/`)).ok) { up = true; break; } } catch {} await sleep(120); }
if (!up) { srv.kill(); console.error('server kom ikke op på port ' + PORT); process.exit(2); }
const URL0 = `http://127.0.0.1:${PORT}/`;

// ---------- hooks (ingen ændringer i spillets kildekode) ----------
const HOOK = `(() => {
  const now = () => performance.timeOrigin + performance.now();
  window.__sfxLog = []; window.__downLog = []; window.__textLog = []; window.__waitMs = 0; window.__lockSamples = 0;
  const abs = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (when, ...r) { try { const d = Math.max(0, ((when || 0) - this.context.currentTime) * 1000); window.__sfxLog.push({ t: now() + d, kind: 'buffer', dur: this.buffer ? +this.buffer.duration.toFixed(3) : 0 }); } catch {} return abs.call(this, when, ...r); };
  const osc = OscillatorNode.prototype.start;
  OscillatorNode.prototype.start = function (when, ...r) { try { const d = Math.max(0, ((when || 0) - this.context.currentTime) * 1000); window.__sfxLog.push({ t: now() + d, kind: 'osc', f: this.frequency ? +this.frequency.value.toFixed(0) : 0 }); } catch {} return osc.call(this, when, ...r); };
  window.addEventListener('pointerdown', (e) => window.__downLog.push({ t: now(), x: e.clientX, y: e.clientY, trusted: e.isTrusted }), true);
  // dialog-tekst: renderText() i dialog.js = clearRect + ét drawImage pr. linje på #dtextc
  const cr = CanvasRenderingContext2D.prototype.clearRect, di = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.clearRect = function (...a) { if (this.canvas && this.canvas.id === 'dtextc') window.__textLog.push({ t: now(), lines: 0, w: 0 }); return cr.apply(this, a); };
  CanvasRenderingContext2D.prototype.drawImage = function (im, ...a) { if (this.canvas && this.canvas.id === 'dtextc') { const l = window.__textLog[window.__textLog.length - 1]; if (l) { l.lines++; l.w = im && im.width || 0; } } return di.call(this, im, ...a); };
  // wait-cursor (= lock) summeret pr. frame
  let last = performance.now();
  const loop = (t) => { const c = document.getElementById('cursor'); if (c && c.classList.contains('wait')) window.__waitMs += t - last; last = t; requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
})();`;

// ---------- browser ----------
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--window-size=700,560'] });
const newContext = () => (browser.createBrowserContext ? browser.createBrowserContext() : browser.createIncognitoBrowserContext());
const errors = [];
async function openPage(ctxB, url) {
  const p = await ctxB.newPage();
  p.on('pageerror', (e) => errors.push({ kind: 'pageerror', msg: e.message, url }));
  p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push({ kind: 'console', msg: m.text(), url }));
  p.on('response', (r) => r.status() === 404 && errors.push({ kind: 'console', msg: '404 ' + r.url().replace(/^https?:\/\/[^/]+\//, ''), url, is404: true }));
  await p.setViewport({ width: 640, height: 480, deviceScaleFactor: 1 });
  await p.evaluateOnNewDocument(HOOK);
  return p;
}
// Pixel-diff i en hjælper-fane (canvas): hurtigere end magick pr. frame. fuzz 0 = enhver kanalforskel; mask = [x,y,w,h] udelades.
async function makeDiffer(ctxB) {
  const h = await ctxB.newPage();
  await h.setContent('<canvas id=a></canvas><canvas id=b></canvas>');
  await h.evaluate(() => {
    const dec = async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0); return g.getImageData(0, 0, c.width, c.height); };
    window.__base = null;
    window.__setBase = async (b64) => { window.__base = await dec(b64); return [window.__base.width, window.__base.height]; };
    window.__diff = async (b64, fuzz, mask) => {
      const B = window.__base; if (!B) return -1; const F = await dec(b64);
      if (F.width !== B.width || F.height !== B.height) return 100;
      const th = Math.round(255 * fuzz / 100); const a = B.data, b = F.data; let n = 0; const W = B.width;
      for (let i = 0; i < a.length; i += 4) {
        if (mask) { const px = (i >> 2) % W, py = (i >> 2) / W | 0; if (px >= mask[0] && px < mask[0] + mask[2] && py >= mask[1] && py < mask[1] + mask[3]) continue; }
        if (Math.abs(a[i] - b[i]) > th || Math.abs(a[i + 1] - b[i + 1]) > th || Math.abs(a[i + 2] - b[i + 2]) > th) n++;
      }
      return (100 * n) / (W * B.height);
    };
  });
  return { setBase: (buf) => h.evaluate((b) => window.__setBase(b), buf.toString('base64')), diff: (b64, fuzz, mask) => h.evaluate((b, f, m) => window.__diff(b, f, m), b64, fuzz, mask), close: () => h.close() };
}
// Screencast-ringbuffer (seneste ~3 s)
async function startCast(p, keepMs = 3000) {
  const cdp = await p.target().createCDPSession();
  const ring = []; let total = 0;
  cdp.on('Page.screencastFrame', async (ev) => { total++; ring.push({ t: ev.metadata.timestamp * 1000, data: ev.data }); const cut = ev.metadata.timestamp * 1000 - keepMs; while (ring.length && ring[0].t < cut) ring.shift(); try { await cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch {} });
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: 640, maxHeight: 480 });
  return { ring, cdp, frames: () => total, stop: () => cdp.send('Page.stopScreencast').catch(() => {}) };
}
const gif = (dir, file, fps = 10) => { try { execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', String(fps), '-pattern_type', 'glob', '-i', path.join(dir, '*.png'), '-vf', 'split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=none', file], { stdio: 'ignore' }); return file; } catch (e) { return null; } };

// =====================================================================================
// MODE A: nybegynder-bot
// =====================================================================================
async function runBot() {
  fs.rmSync(path.join(out, 'clicks'), { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'clicks'), { recursive: true });
  fs.mkdirSync(path.join(out, 'scener'), { recursive: true });
  const ctxB = await newContext();
  const differ = await makeDiffer(ctxB); // hjælper-fanen FØRST — ellers bliver spil-fanen baggrundsfane og screencast'en standser
  const p = await openPage(ctxB, URL0);
  await p.bringToFront();
  const cast = await startCast(p);
  const clicks = []; const sceneShots = new Map(); const events = [];
  const T0 = Date.now();
  const elapsedMin = () => (Date.now() - T0) / 60000;
  const note = (s) => { events.push({ t: +((Date.now() - T0) / 1000).toFixed(1), s }); console.log(`[${((Date.now() - T0) / 1000).toFixed(0).padStart(3)}s] ${s}`); };
  let firstHubFreeClick = null; let wbtnDead = 0, forcedWbtn = 0;

  const state = () => p.evaluate(() => {
    const os = document.getElementById('os'); const osOn = os && !os.classList.contains('off');
    const dlg = document.getElementById('dialog'); const more = document.getElementById('dmore');
    const cur = document.getElementById('cursor');
    return { scene: window.MB && window.MB.save ? window.MB.save.scene : null, osOn, wbtns: osOn ? [...os.querySelectorAll('.wbtn:not([disabled])')].map((b) => { const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, def: b.classList.contains('def'), label: b.textContent.trim() }; }) : [], dialog: !!dlg && !dlg.hidden, more: !!more && getComputedStyle(more).visibility === 'visible', wait: !!cur && cur.classList.contains('wait'), appVisible: document.getElementById('app').style.visibility !== 'hidden' };
  });
  const sceneName = async () => { const s = await state(); return s.scene || (s.osOn ? 'desktop' : '?'); };

  /** Klik med rigtig mus + måling. kind = hvad botten tror den klikker på. */
  async function click(x, y, kind, label = '', { dbl = false } = {}) {
    x = Math.max(1, Math.min(638, Math.round(x))); y = Math.max(1, Math.min(478, Math.round(y)));
    await p.mouse.move(x, y); await sleep(160); // cursor-sprite + hover-label skal være faldet til ro før baseline
    const st = await state();
    const scene = st.scene || (st.osOn ? 'desktop' : '?');
    const base = await p.screenshot({ clip: { x: 0, y: 0, width: 640, height: 480 } });
    await differ.setBase(base);
    const nDown = await p.evaluate(() => window.__downLog.length);
    const nSfx = await p.evaluate(() => window.__sfxLog.length);
    await p.mouse.down(); await sleep(70); await p.mouse.up();
    if (dbl) { await sleep(110); await p.mouse.down(); await sleep(60); await p.mouse.up(); } // dobbeltklik: 2. tryk inden 450 ms (os.js)
    await sleep(TARGETS.dead_window_ms + 150);
    const info = await p.evaluate((nd, ns) => ({ down: window.__downLog[nd] || null, sfx: window.__sfxLog.slice(ns), lockAfter: document.getElementById('cursor')?.classList.contains('wait') }), nDown, nSfx);
    const tDown = info.down ? info.down.t : Date.now() - TARGETS.dead_window_ms - 220;
    const after = cast.ring.filter((f) => f.t > tDown && f.t <= tDown + TARGETS.dead_window_ms + 100);
    const mask = [x - 10, y - 10, 44, 44]; // egen cursor-sprite (32 px + hand-offset) skal ikke tælle som respons
    let firstVisual = null, firstAny = null, maxDiff = 0; const diffs = [];
    for (const f of after) { const d = await differ.diff(f.data, TARGETS.diff_fuzz, mask); diffs.push({ dt: Math.round(f.t - tDown), pct: +d.toFixed(3) }); maxDiff = Math.max(maxDiff, d); if (firstAny === null && d > 0) firstAny = f.t - tDown; if (firstVisual === null && d >= TARGETS.diff_pct_min) { firstVisual = f.t - tDown; } }
    const snd = info.sfx.filter((s) => s.t >= tDown - 30).sort((a, b) => a.t - b.t);
    const firstSound = snd.length ? Math.max(0, snd[0].t - tDown) : null;
    const dead = firstVisual === null && (firstSound === null || firstSound > TARGETS.dead_window_ms);
    const rec = { i: clicks.length, t_s: +((Date.now() - T0) / 1000).toFixed(1), scene, kind, label, x, y, latency_ms: firstVisual === null ? null : Math.round(firstVisual), any_diff_ms: firstAny === null ? null : Math.round(firstAny), sound_ms: firstSound === null ? null : Math.round(firstSound), sounds: snd.length, max_diff_pct: +maxDiff.toFixed(3), frames_in_window: after.length, dead, trusted: info.down ? info.down.trusted : null };
    if (dead || (firstVisual !== null && firstVisual > TARGETS.latency_ms_max)) {
      const dir = path.join(out, 'clicks', `c${String(rec.i).padStart(3, '0')}_${dead ? 'dead' : 'slow'}_${scene}`); fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'f000_base.png'), base);
      after.slice(0, 40).forEach((f, k) => fs.writeFileSync(path.join(dir, `f${String(k + 1).padStart(3, '0')}.png`), Buffer.from(f.data, 'base64')));
      // markør på klikpunktet
      magick(path.join(dir, 'f000_base.png'), '-fill', 'none', '-stroke', dead ? '#ff2a2a' : '#ffb000', '-strokewidth', '3', '-draw', `circle ${x},${y} ${x + 14},${y}`, path.join(dir, 'marked.png'));
      rec.shot = path.relative(here, path.join(dir, 'marked.png'));
      if (after.length > 1 && clicks.filter((c) => c.gif).length < 8) { rec.gif = path.relative(here, gif(dir, path.join(dir, 'klik.gif'), 10) || ''); }
    }
    clicks.push(rec);
    if (!sceneShots.has(scene)) { const f = path.join(out, 'scener', `${String(sceneShots.size).padStart(2, '0')}_${scene}.png`); fs.writeFileSync(f, base); sceneShots.set(scene, f); }
    return rec;
  }

  /** Læs al dialogtekst: vent på ▼ (eller at boksen lukker selv), klik så på boksen. Returnerer antal klik. */
  async function readDialogs(maxMs = 25000) {
    let n = 0; const t0 = Date.now();
    while (Date.now() - t0 < maxMs) {
      const s = await state();
      if (s.osOn && s.wbtns.length) {
        const b = s.wbtns.find((x) => x.def) || s.wbtns[0];
        const covered = await p.evaluate((x, y) => { const el = document.elementFromPoint(x, y); return el ? (el.closest('.wbtn') ? null : (el.id || el.className || el.tagName)) : 'ingen'; }, b.x, b.y);
        const rec = await click(b.x, b.y, 'wbtn', b.label); n++;
        if (covered) rec.covered_by = covered;
        if (rec.dead) { wbtnDead++; if (wbtnDead >= 2) { note(`msgBox-knap "${b.label}" kan ikke rammes (dækket af ${covered || '?'}) — tvinger .click() for at komme videre`); await p.evaluate(() => { const b = document.querySelector('#os .wbtn.def:not([disabled])') || document.querySelector('#os .wbtn:not([disabled])'); b && b.click(); }); forcedWbtn++; wbtnDead = 0; } } else wbtnDead = 0;
        continue;
      }
      if (!s.dialog) return n;
      if (s.more) { await sleep(250 + rnd() * 400); await click(300 + rnd() * 80, 30 + rnd() * 30, 'dialog', '▼'); n++; }
      else await sleep(120);
    }
    return n;
  }
  const waitScene = async (id, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if ((await state()).scene === id) return true; await sleep(100); } return false; };
  const waitFree = async (ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const s = await state(); if (!s.wait && !s.dialog && !(s.osOn && s.wbtns.length)) return true; if (s.dialog || s.wbtns.length) await readDialogs(8000); else await sleep(100); } return false; };

  /** Find klikbart: DOM-elementer med pointer-events + raster-scan 16×12 for 'hand'-cursor. */
  async function scanTargets() {
    const dom = await p.evaluate(() => {
      const seen = new Set(); const res = [];
      for (let gy = 0; gy < 12; gy++) for (let gx = 0; gx < 16; gx++) {
        const x = gx * 40 + 20, y = gy * 40 + 20;
        for (const el of document.elementsFromPoint(x, y)) {
          if (!el.matches || !el.matches('.btn, .chip, .input, #field .o, .wbtn, .desk-icon, #field')) continue;
          if (getComputedStyle(el).pointerEvents === 'none' && !el.matches('.desk-icon')) continue;
          if (seen.has(el)) continue; seen.add(el);
          const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
          res.push({ kind: el.matches('.btn') ? 'button' : el.matches('#field') ? 'field' : 'dom', label: el.dataset.label || el.textContent.trim().slice(0, 24) || el.className.slice(0, 24), x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height });
        }
      }
      return res;
    });
    const hand = [];
    const appVisible = (await state()).appVisible;
    if (appVisible) {
      for (let gy = 0; gy < 12; gy++) for (let gx = 0; gx < 16; gx++) {
        const x = gx * 40 + 20, y = gy * 40 + 20;
        await p.mouse.move(x, y); await sleep(45);
        const cls = await p.evaluate(() => document.getElementById('cursor')?.className || '');
        if (cls === 'hand') hand.push({ kind: 'hotspot', label: `raster ${gx},${gy}`, x, y });
      }
    }
    return { dom, hand };
  }

  try {
    // ---- 1. desktop/krom ----
    await p.goto(URL0, { waitUntil: 'networkidle0' });
    note('load');
    await sleep(800 + rnd() * 800);
    const icons = await p.evaluate(() => [...document.querySelectorAll('#os .desk-icon')].map((d) => { const r = d.getBoundingClientRect(); return { label: d.textContent.trim(), x: r.x + r.width / 2, y: r.y + 20 }; }));
    const other = icons.filter((i) => !/REGN/.test(i.label));
    if (other.length) { const ic = other[Math.floor(rnd() * other.length)]; await click(ic.x, ic.y, 'desk-icon', ic.label); } // nybegynder: ét forkert klik først
    const cd = icons.find((i) => /REGN/.test(i.label));
    if (!cd) throw new Error('cd-ikon ikke fundet på skrivebordet');
    await click(cd.x, cd.y, 'desk-icon', 'cd dobbeltklik', { dbl: true });
    note('dobbeltklik på cd');
    await waitScene('title', 20000);
    note('title nået');
    await readDialogs(3000);
    // ---- 2. title → setup ----
    let { dom } = await scanTargets();
    const start = dom.find((d) => d.label === 'Start');
    if (start) await click(start.x, start.y, 'button', 'Start'); else await click(320, 410, 'blind', 'start?');
    await waitScene('setup', 8000); note('setup');
    await sleep(600);
    ({ dom } = await scanTargets());
    const inp = dom.find((d) => d.kind === 'dom' && /input/.test(d.label) || d.h > 20 && d.w > 150);
    if (inp) { await click(inp.x, inp.y, 'dom', 'input'); await p.keyboard.type('Bo', { delay: 140 + rnd() * 100 }); }
    const chips = dom.filter((d) => /^\d\.$/.test(d.label));
    if (chips.length) { const c = chips[Math.floor(rnd() * chips.length)]; await click(c.x, c.y, 'dom', 'klasse ' + c.label); }
    const ok = dom.find((d) => d.label === 'OK');
    if (ok) await click(ok.x, ok.y, 'button', 'OK'); else await click(330, 341, 'blind', 'ok?');
    await waitScene('hub', 8000); note('hub');
    // ---- 3. intro læses ----
    await readDialogs(60000);
    await waitFree(15000);
    // ---- 4. fri leg ----
    const cache = new Map(); let lastScene = null; let taskEnter = 0; let taskClicks = 0;
    while (elapsedMin() < MINUTES) {
      const s = await state();
      const scene = s.scene || (s.osOn ? 'desktop' : '?');
      if (s.osOn && s.wbtns.length) { await readDialogs(5000); continue; }
      if (s.dialog) { await readDialogs(20000); continue; }
      if (s.wait) { await sleep(150); continue; }
      if (scene === 'desktop') { // botten lukkede spillet — start igen
        const ic = (await p.evaluate(() => [...document.querySelectorAll('#os .desk-icon')].map((d) => { const r = d.getBoundingClientRect(); return { label: d.textContent.trim(), x: r.x + r.width / 2, y: r.y + 20 }; }))).find((i) => /REGN/.test(i.label));
        if (ic) { await click(ic.x, ic.y, 'desk-icon', 'cd igen', { dbl: true }); await waitScene('title', 20000); }
        continue;
      }
      if (scene === 'title') { const t = (await scanTargets()).dom.find((d) => /Start|Fortsæt/.test(d.label)); if (t) await click(t.x, t.y, 'button', t.label); continue; }
      if (scene !== lastScene) { note('scene ' + scene); lastScene = scene; if (scene === 'task') { taskEnter = Date.now(); taskClicks = 0; } }
      if (firstHubFreeClick === null && scene === 'hub') firstHubFreeClick = (Date.now() - T0) / 1000;
      // opgave: efter ~45 s eller 14 klik → Tilbage (nybegynder giver op / er færdig)
      if (scene === 'task' && (Date.now() - taskEnter > 45000 || taskClicks > 14)) {
        const t = (await scanTargets()).dom.find((d) => d.label === 'Tilbage');
        if (t) { await click(t.x, t.y, 'button', 'Tilbage'); await waitScene('hub', 6000); cache.delete('task'); continue; }
      }
      let targets = cache.get(scene);
      if (!targets || scene === 'task' || rnd() < 0.15) { const sc = await scanTargets(); targets = shuffle([...sc.dom.filter((d) => d.kind !== 'field'), ...sc.hand]); cache.set(scene, targets); note(`${scene}: ${sc.dom.length} DOM-mål, ${sc.hand.length} hand-punkter`); }
      let tgt = targets.length && rnd() > 0.2 ? targets[Math.floor(rnd() * targets.length)] : { kind: 'blind', label: 'tilfældigt punkt', x: 20 + rnd() * 600, y: 20 + rnd() * 440 };
      if (tgt.label === 'Luk' && rnd() < 0.7) tgt = targets.find((t) => t.label !== 'Luk') || tgt; // "Luk" trykkes sjældent af en nybegynder
      const rec = await click(tgt.x, tgt.y, tgt.kind, tgt.label);
      if (scene === 'task') taskClicks++;
      if (tgt.kind === 'blind' && !rec.dead && rnd() < 0.5) { /* fik respons på et blindt klik → prøv igen tæt på */ await click(tgt.x + (rnd() - 0.5) * 40, tgt.y + (rnd() - 0.5) * 40, 'blind', 'nabo-punkt'); }
      await sleep(200 + rnd() * 600);
    }
    note('tid brugt');
  } catch (e) { errors.push({ kind: 'bot', msg: e.stack || String(e) }); console.error('bot-fejl:', e.message); }

  // ---- målinger ----
  const page = await p.evaluate(() => ({ waitMs: Math.round(window.__waitMs), textLog: window.__textLog, sfx: window.__sfxLog.length, downs: window.__downLog.length }));
  // cps: gruppér renderText-kald i replikker (gab > 1500 ms); pr. replik: tegn = renders med linjer, tick = median afstand
  const utter = []; let cur = null;
  // ny replik = renderText('') (clearRect uden drawImage) efter en ikke-tom render, eller gab > 1500 ms
  for (const r of page.textLog) { if (!cur || r.t - cur.last > 1500 || (r.lines === 0 && cur.renders.length && cur.lastNonEmpty)) { cur = { t0: r.t, last: r.t, renders: [], maxLines: 0, lastW: 0, lastNonEmpty: false }; utter.push(cur); } cur.last = r.t; cur.lastNonEmpty = r.lines > 0; if (r.lines) { cur.renders.push(r.t); cur.maxLines = Math.max(cur.maxLines, r.lines); cur.lastW = r.w; } }
  const cpsRows = utter.filter((u) => u.renders.length >= 8).map((u) => { const iv = []; for (let i = 1; i < u.renders.length; i++) iv.push(u.renders[i] - u.renders[i - 1]); const med = median(iv); return { chars: u.renders.length, span_s: +((u.last - u.t0) / 1000).toFixed(2), tick_ms_median: +med.toFixed(1), cps_tick: +(1000 / med).toFixed(1), cps_incl_pauses: +((u.renders.length - 1) / ((u.renders[u.renders.length - 1] - u.renders[0]) / 1000)).toFixed(1), lines: u.maxLines, skipped: iv.some((x) => x < 5) }; });
  // afskæring: statisk — alle replikker i src/ ombrydes med spillets egen text1bit-måling (samme algoritme som dialog.js renderText)
  let clipped = [];
  try {
    const strings = new Set();
    const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const fp = path.join(d, f.name); if (f.isDirectory()) walk(fp); else if (/\.js$/.test(fp)) { const src = fs.readFileSync(fp, 'utf8'); for (const m of src.matchAll(/(?:say\(|_intro:|_ok:|_wrong:|\bintro\d:|hub_\w+:|help:|sticker:|name_B:)\s*(?:\(\)\s*=>\s*)?(?:\(?save\.flags\.\w+\s*\?\s*)?(['"`])((?:\\.|(?!\1).){12,})\1/g)) strings.add(m[2].replace(/\\'/g, "'").replace(/\$\{[^}]*\}/g, 'Bygmester')); for (const m of src.matchAll(/pick\(\[([^\]]+)\]\)/g)) for (const s of m[1].matchAll(/'((?:\\.|[^'])+)'/g)) strings.add(s[1]); } } };
    walk(path.join(root, 'src'));
    clipped = await p.evaluate(async (list) => {
      const { text1bit } = await import('/src/core/stage.js');
      const FONT = '700 15px "Comic Neue","Comic Sans MS",sans-serif';
      const res = [];
      for (const str of list) { const words = str.split(' '); const lines = []; let line = ''; for (const w of words) { const test = line ? line + ' ' + w : w; if (text1bit(test, FONT).width > 596 && line) { lines.push(line); line = w; } else line = test; } if (line) lines.push(line); if (lines.length > 3) res.push({ lines: lines.length, text: str.slice(0, 90) }); }
      return res;
    }, [...strings]);
    page.textStringsChecked = strings.size;
  } catch (e) { errors.push({ kind: 'bot', msg: 'statisk ombrydning fejlede: ' + e.message }); }

  await cast.stop(); await differ.close();
  const shotsDir = path.join(out, 'scener');
  // kontaktark: dead/slow-klik (markeret) + én frame pr. scene
  const sheet = [...clicks.filter((c) => c.shot).map((c) => path.join(here, c.shot)), ...[...sceneShots.values()]].slice(0, 24);
  if (sheet.length) { try { const rows = []; for (let i = 0; i < sheet.length; i += 4) rows.push(sheet.slice(i, i + 4)); const args = []; for (const r of rows) args.push('(', ...r.flatMap((f) => ['(', f, '-resize', '320x240', '-bordercolor', '#222', '-border', '4', ')']), '+append', ')'); execFileSync('magick', [...args, '-background', '#222', '-append', path.join(out, 'kontakt.png')], { stdio: 'ignore' }); } catch (e) { errors.push({ kind: 'bot', msg: 'kontaktark fejlede: ' + e.message }); } }

  const targeted = clicks.filter((c) => c.kind !== 'blind');
  const lat = targeted.filter((c) => c.latency_ms !== null).map((c) => c.latency_ms);
  const sfxEligible = targeted.filter((c) => ['button', 'hotspot', 'dom', 'wbtn'].includes(c.kind) && c.label !== 'input' && !/^cd /.test(c.label));
  const withSound = sfxEligible.filter((c) => c.sound_ms !== null && c.sound_ms <= TARGETS.sound_window_ms);
  const deadT = targeted.filter((c) => c.dead), deadB = clicks.filter((c) => c.kind === 'blind' && c.dead);
  const cpsTick = cpsRows.filter((r) => !r.skipped).map((r) => r.cps_tick);
  const report = {
    when: new Date().toISOString(), git: gitHash, mode: 'bot', minutes: MINUTES, seed: SEED, port: PORT, targets: TARGETS,
    method: 'klik-latens = pointerdown (sidens tidsstempel) → første screencast-frame med ≥0,1 % ændrede pixels (fuzz 0, cursor-felt 44×44 maskeret) mod screenshot taget lige før klik. Lyd = hook på AudioBufferSourceNode/OscillatorNode.start. cps = median tegn-interval i renderText-kald på #dtextc (tick) og inkl. pauser. Afskæring = statisk ombrydning af alle replik-strenge i src/ med text1bit (dialog.js slice(0,3)).',
    summary: {
      clicks_total: clicks.length, clicks_targeted: targeted.length, clicks_blind: clicks.length - targeted.length,
      latency_ms_median: median(lat), latency_ms_p90: lat.length ? [...lat].sort((a, b) => a - b)[Math.floor(lat.length * 0.9)] : null, latency_ms_max: lat.length ? Math.max(...lat) : null, latency_over_100: lat.filter((x) => x > TARGETS.latency_ms_max).length,
      dead_targeted: deadT.length, dead_blind: deadB.length,
      sound_eligible: sfxEligible.length, sound_within_150ms: withSound.length, sound_share: sfxEligible.length ? +(withSound.length / sfxEligible.length).toFixed(3) : null,
      cps_tick_median: median(cpsTick), cps_incl_pauses_median: median(cpsRows.map((r) => r.cps_incl_pauses)), utterances_measured: cpsRows.length, clipped_strings: clipped.length, strings_checked: page.textStringsChecked || 0,
      time_to_first_free_hub_click_s: firstHubFreeClick === null ? null : +firstHubFreeClick.toFixed(1), wait_cursor_total_s: +(page.waitMs / 1000).toFixed(1), wait_share: +(page.waitMs / 1000 / (MINUTES * 60)).toFixed(3),
      forced_msgbox_clicks: forcedWbtn, scenes_visited: [...sceneShots.keys()], screencast_frames: cast.frames(), sfx_events_total: page.sfx,
      console_errors: errors.filter((e) => e.kind !== 'bot' && !e.is404).length, console_404: errors.filter((e) => e.is404).length, missing_404_unique: [...new Set(errors.filter((e) => e.is404).map((e) => e.msg.slice(4)))], bot_errors: errors.filter((e) => e.kind === 'bot').length,
    },
    pass: {},
    dead_clicks: [...deadT, ...deadB].map((c) => ({ i: c.i, scene: c.scene, kind: c.kind, label: c.label, x: c.x, y: c.y, shot: c.shot, gif: c.gif })),
    slow_clicks: targeted.filter((c) => c.latency_ms !== null && c.latency_ms > TARGETS.latency_ms_max).map((c) => ({ i: c.i, scene: c.scene, kind: c.kind, label: c.label, x: c.x, y: c.y, latency_ms: c.latency_ms, shot: c.shot, gif: c.gif })),
    cps: cpsRows, clipped, clicks, events, errors,
    files: { kontakt: 'feel/kontakt.png', scener: 'feel/scener/', clicks: 'feel/clicks/' },
  };
  report.pass.klik_latens_median = report.summary.latency_ms_median !== null && report.summary.latency_ms_median <= TARGETS.latency_ms_max;
  report.pass.dead_clicks_maal = deadT.length === 0;
  report.pass.lyd_pr_handling = report.summary.sound_share === 1;
  report.pass.cps_24_32 = report.summary.cps_tick_median !== null && report.summary.cps_tick_median >= TARGETS.cps_min && report.summary.cps_tick_median <= TARGETS.cps_max;
  report.pass.ingen_afskaaret_tekst = clipped.length === 0;
  report.pass.tid_til_hub_90s = firstHubFreeClick !== null && firstHubFreeClick <= TARGETS.time_to_hub_s_max;
  report.pass.ingen_konsolfejl = report.summary.console_errors === 0;
  report.pass.script_koerte_igennem = report.summary.bot_errors === 0;
  try { const prev = JSON.parse(fs.readFileSync(path.join(out, 'feel-report.json'), 'utf8')); if (prev.pacing) report.pacing = prev.pacing; } catch {} // --pacing-resultat bevares
  fs.writeFileSync(path.join(out, 'feel-report.json'), JSON.stringify(report, null, 2));
  console.log('\n' + Object.entries(report.pass).map(([k, v]) => `${k}=${v ? 'OK' : 'FEJL'}`).join(' · '));
  console.log(JSON.stringify(report.summary, null, 1));
  await ctxB.close();
  return report;
}

// =====================================================================================
// MODE B: pacing — wrongness ved minut M, blinde dommer-filer
// =====================================================================================
async function runPacing() {
  const judge = path.join(out, 'pacing-judge');
  fs.rmSync(judge, { recursive: true, force: true }); fs.mkdirSync(judge, { recursive: true }); fs.mkdirSync(keyDir, { recursive: true });
  const rows = [];
  for (const M of TARGETS.pacing_min) {
    const ctxB = await newContext();
    const p = await openPage(ctxB, URL0 + `?dev&scene=hub&name=Test&min=${M}`); await p.bringToFront();
    const dir = path.join(out, `pacing-${M}`); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const row = { min: M, fired: [], shots: [], dialog_clicks: 0 };
    try {
      await p.goto(URL0 + `?dev&scene=hub&name=Test&min=${M}&reset`, { waitUntil: 'networkidle0' });
      await sleep(500); await p.mouse.click(600, 100); await sleep(300); // audio-gestus
      const clickThrough = async (ms = 12000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const s = await p.evaluate(() => { const d = document.getElementById('dialog'), m = document.getElementById('dmore'), os = document.getElementById('os'); return { dlg: d && !d.hidden, more: m && getComputedStyle(m).visibility === 'visible', wb: [...(os && !os.classList.contains('off') ? os.querySelectorAll('.wbtn:not([disabled])') : [])].map((b) => { const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }) }; }); if (s.wb.length) { await p.mouse.click(s.wb[0].x, s.wb[0].y); row.dialog_clicks++; await sleep(300); continue; } if (!s.dlg) return; if (s.more) { await p.mouse.click(320, 40); row.dialog_clicks++; } await sleep(150); } };
      await clickThrough();
      // Spilleren ved minut M har været i hub'en mellem opgaver flere gange → lad kurven fyre alt, der er forfaldent (checkWrongness via goto hub {back:true})
      for (let k = 0; k < 8; k++) {
        const before = await p.evaluate(() => Object.keys(window.MB.save.seen));
        await p.evaluate(() => window.MB.goto('hub', { back: true }, { black: 0 }));
        await sleep(700); await clickThrough();
        const after = await p.evaluate(() => Object.keys(window.MB.save.seen));
        const nw = after.filter((x) => !before.includes(x)); row.fired.push(...nw);
        if (!nw.length) break;
      }
      await p.mouse.move(636, 476); await sleep(600);
      for (let i = 0; i < 3; i++) { const f = path.join(dir, `still_${i}.png`); await p.screenshot({ path: f, clip: { x: 0, y: 0, width: 640, height: 480 } }); row.shots.push(f); await sleep(1000); }
      const cast = await startCast(p, 4000); await sleep(3000); await cast.stop();
      const fdir = path.join(dir, 'cast'); fs.mkdirSync(fdir, { recursive: true });
      // 10 fps: vælg nærmeste frame pr. 100 ms
      const fr = cast.ring; let n = 0;
      if (fr.length) { const t0 = fr[0].t; for (let t = t0; t <= t0 + 3000 && n < 30; t += 100) { let best = fr[0]; for (const f of fr) if (Math.abs(f.t - t) < Math.abs(best.t - t)) best = f; fs.writeFileSync(path.join(fdir, `g${String(n++).padStart(3, '0')}.png`), Buffer.from(best.data, 'base64')); } }
      row.cast_frames = fr.length; row.gif_frames = n;
      row.gif = n ? gif(fdir, path.join(dir, 'cast.gif'), 10) : null;
      execFileSync('magick', [...row.shots, '+append', path.join(out, `pacing-${M}.png`)], { stdio: 'ignore' });
      row.contact = path.join(out, `pacing-${M}.png`);
      row.flags = await p.evaluate(() => Object.keys(window.MB.save.flags).filter((k) => window.MB.save.flags[k] === true));
      console.log(`min ${M}: fyret ${JSON.stringify(row.fired)} · ${row.cast_frames} cast-frames · ${row.dialog_clicks} dialogklik`);
    } catch (e) { row.error = e.message; errors.push({ kind: 'bot', msg: `pacing ${M}: ` + e.message }); console.error(`pacing ${M} fejl:`, e.message); }
    await ctxB.close();
    rows.push(row);
  }
  // blind rækkefølge: K01…K06 uden minuttal i dommer-mappen; nøglen ligger UDENFOR
  const order = shuffle(rows.map((r) => r.min));
  const manifest = []; const key = { when: new Date().toISOString(), git: gitHash, seed: SEED, map: {} };
  order.forEach((M, i) => {
    const k = `K${String(i + 1).padStart(2, '0')}`; const r = rows.find((x) => x.min === M);
    if (r.contact) fs.copyFileSync(r.contact, path.join(judge, `${k}.png`));
    if (r.gif) fs.copyFileSync(r.gif, path.join(judge, `${k}.gif`));
    manifest.push({ id: k, png: `${k}.png`, gif: r.gif ? `${k}.gif` : null });
    key.map[k] = { min: M, fired: r.fired, flags: r.flags || [], error: r.error || null };
  });
  fs.writeFileSync(path.join(judge, 'manifest.json'), JSON.stringify({ instruks: 'Se billederne i rækkefølgen K01→K06. Svar kun: ved hvilket billede bemærkede du først noget mærkeligt? Mål: median minut 15–30, intet før minut 12 (nøgle ligger uden for mappen).', items: manifest }, null, 2));
  fs.writeFileSync(path.join(keyDir, 'key.json'), JSON.stringify(key, null, 2));
  const report = { when: new Date().toISOString(), git: gitHash, mode: 'pacing', seed: SEED, minutes_tested: TARGETS.pacing_min, rows: rows.map((r) => ({ ...r, shots: r.shots.map((s) => path.relative(here, s)), contact: r.contact && path.relative(here, r.contact), gif: r.gif && path.relative(here, r.gif) })), judge_dir: path.relative(here, judge), key: path.relative(here, path.join(keyDir, 'key.json')), order_hidden: true, errors, note: 'Dommerne får kun feel/pacing-judge/ (K01–K06). Hub åbnes direkte med ?min=M; checkWrongness kaldes via goto hub {back:true} indtil intet nyt fyrer, så billedet svarer til en spiller der har været i hub\'en mellem opgaver ved minut M.' };
  const prev = fs.existsSync(path.join(out, 'feel-report.json')) ? JSON.parse(fs.readFileSync(path.join(out, 'feel-report.json'), 'utf8')) : {};
  prev.pacing = report;
  fs.writeFileSync(path.join(out, 'feel-report.json'), JSON.stringify(prev, null, 2));
  fs.writeFileSync(path.join(out, 'pacing-report.json'), JSON.stringify(report, null, 2));
  console.log('pacing: dommer-mappe ' + judge + ' · nøgle ' + path.join(keyDir, 'key.json'));
  return report;
}

try { if (PACING) await runPacing(); else await runBot(); }
finally { await browser.close(); srv.kill(); }
const fatal = errors.filter((e) => e.kind === 'bot');
if (fatal.length) { console.log('script-fejl:\n' + fatal.map((e) => e.msg).join('\n')); }
process.exit(fatal.length ? 1 : 0);
