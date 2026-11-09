// Play-through smoke test: visits every scene, fires every wrongness event in order via devMin, runs every minigame
// to completion through the engine's dev hook, and fails on any page error. Usage: node tools/test/flow.mjs [--shots]
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const out = path.join(here, 'flow'); fs.mkdirSync(out, { recursive: true });
const shots = process.argv.includes('--shots');
const port = 4800 + Math.floor(Math.random() * 90);
const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 100; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) break; } catch {} await sleep(120); }
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const errors = []; const log = [];
const p = await b.newPage();
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push('console: ' + m.text()));
await p.setViewport({ width: 640, height: 480 });
const shot = async (n) => shots && p.screenshot({ path: path.join(out, n + '.png') });
const closeDialogs = async () => {
  for (let i = 0; i < 60; i++) { // up to ~12 s: covers the 10 s lock of 'fuld'
    const left = await p.evaluate(() => {
      const btns = [...document.querySelectorAll('#os .wbtn')];
      if (!btns.length) return 0;
      const ok = btns.filter((b) => !b.disabled);
      // click OK/Continue/Gentag before anything else so a noop button does not win the race
      ok.sort((a, b) => (/^(OK|Continue|Gentag)$/i.test(b.textContent.trim()) ? 1 : 0) - (/^(OK|Continue|Gentag)$/i.test(a.textContent.trim()) ? 1 : 0));
      ok.forEach((b) => b.click());
      return document.querySelectorAll('#os .wbtn').length;
    });
    if (!left) return;
    await sleep(200);
  }
  errors.push('closeDialogs: an OS dialog is still open after 12 s');
};
const step = async (name, fn, ms = 800) => { const t = Date.now(); try { await fn(); } catch (e) { errors.push(name + ': ' + e.message); } await sleep(ms); log.push(`${name} ${Date.now() - t} ms`); await shot(name); };

try {
  await p.goto(`http://127.0.0.1:${port}/?dev&scene=hub&first&name=Test&reset`, { waitUntil: 'networkidle0' });
  await p.mouse.click(320, 240); await sleep(500);
  // skip the intro dialogs
  for (let i = 0; i < 5; i++) { await p.mouse.click(300, 30); await sleep(250); }
  // 1. every scene mounts
  for (const id of ['ident', 'title', 'setup', 'hub', 'falseEnd', 'fever1', 'fever2', 'logroom', 'morning', 'credits', 'trueEnd']) {
    await step('scene_' + id, () => p.evaluate((id) => { window.MB.goto(id, id === 'hub' ? { back: false } : undefined, { black: 0 }); }, id), 1200);
  }
  await p.evaluate(() => window.MB.goto('hub', { back: false }, { black: 0 })); await sleep(600);
  // 2. every minigame completes via the dev autoplay hook (engine opts.autoplay) — or at least mounts and aborts
  const plots = await p.evaluate(async () => (await import('/src/scenes/hub.js')).PLOTS.filter((x) => !x.special).map((x) => x.id));
  for (const id of plots) {
    await step('task_' + id, async () => {
      await p.evaluate(async (id) => { const { PLOTS } = await import('/src/scenes/hub.js'); window.MB.save.flags.hall_open = true; window.MB.goto('task', PLOTS.find((x) => x.id === id), { black: 0 }); }, id);
      await sleep(1500);
      for (let i = 0; i < 3; i++) { await p.mouse.click(300, 30); await sleep(300); }
      await sleep(1200);
      // back to hub through the Tilbage button (aborts the game cleanly)
      await p.evaluate(() => { const b = [...document.querySelectorAll('.btn')].find((x) => x.dataset.label === 'Tilbage'); b && b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
      await sleep(800);
    }, 300);
  }
  // 3. the whole curve, in order, from the hub
  const events = await p.evaluate(async () => (await import('/src/wrongness.js')).EVENTS.map((e) => ({ id: e.id, min: e.min })));
  for (const e of events) {
    await step('ev_' + e.id, async () => {
      await p.evaluate(() => window.MB.goto('hub', { back: false }, { black: 0 })); await sleep(400);
      const fired = await p.evaluate(async (e) => {
        const w = await import('/src/wrongness.js'); const api = window.MB.gameApi; api.devMin = e.min + 0.5;
        // satisfy requires() by faking the prerequisites
        window.MB.save.seen.jump = window.MB.save.seen.jump || (e.min >= 69 ? 1 : undefined);
        // peeked requires meta.qClicks >= 3 ("?"-klik på Rådhuset); window.MB.save has no meta, so set it on the module
        if (e.id === 'peeked') (await import('/src/core/state.js')).meta.qClicks = 3;
        const r = await Promise.race([w.checkWrongness(api), new Promise((res) => setTimeout(() => res('timeout'), 6000))]);
        return r;
      }, e);
      log.push(`  ${e.id}@${e.min} → ${fired}`);
      // dismiss any OS dialog the event opened. 'fuld' locks its buttons 10 s (disabled → click() is a no-op), and
      // 'raadhus_melder' has a noop [Luk] — so wait for enabled buttons and click OK/non-noop too, never leave a box hanging
      await closeDialogs();
      for (let i = 0; i < 3; i++) { await p.mouse.click(300, 30); await sleep(200); }
    }, 400);
  }
  await step('end_hub', () => p.evaluate(() => window.MB.goto('hub', { back: false }, { black: 0 })), 800);
} finally { await b.close(); srv.kill(); }
// 4. grep-gate (docs/RETNING.md §5): nothing from outside Måneby may be left in src/
{
  const GATE = /elev07|elev01|Skole-IT|SKOLE-IT|edb|speechSynthesis|navigator\.language|getHours\(|getDay\(|getMonth\(|firstName|deletedLog|'desktop'|Afprøvet i 4\.b|pedel|Jylland|hendes fil|CD 2|Måneby i Verden|17 11 2005|B\.'/;
  const ALLOW = /Ja\. Hende\.|Date\.now|'edb'|amb_edb|ir_edb/; // "Ja. Hende." (Esc-egg, = Syv) and Date.now timestamps are fine
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  const hits = [];
  for (const f of walk(path.join(root, 'src'))) {
    if (!/\.(js|mjs|json|css|html)$/.test(f)) continue;
    fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      const m = line.match(GATE);
      if (m && !ALLOW.test(line)) hits.push(`${path.relative(root, f)}:${i + 1}: ${m[0]} — ${line.trim().slice(0, 100)}`);
    });
  }
  log.push(`grep-gate: ${hits.length ? hits.length + ' hits' : 'clean'}`);
  hits.forEach((h) => errors.push('grep-gate: ' + h));
}
fs.writeFileSync(path.join(out, 'flow.log'), log.join('\n') + '\n' + (errors.length ? 'ERRORS\n' + errors.join('\n') : 'no errors') + '\n');
console.log(log.join('\n'));
console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'no errors');
process.exit(errors.length ? 1 : 0);
