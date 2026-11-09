// Audio smoke test: loads the game in headless Chrome, starts the AudioContext, then drives every phase in mix.js and
// every sampled sfx through the real signal chain. Fails on page errors or files that fail to decode.
// Usage: node tools/test/audio.mjs
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const port = 4900 + Math.floor(Math.random() * 90);
const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 100; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) break; } catch {} await sleep(120); }
const sfxNames = fs.readdirSync(path.join(root, 'assets/sfx')).filter((f) => f.endsWith('.ogg')).map((f) => f.replace('.ogg', ''));
const musicNames = fs.readdirSync(path.join(root, 'assets/music')).filter((f) => f.endsWith('.ogg')).map((f) => f.replace('.ogg', ''));
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const errors = [];
try {
  const p = await b.newPage();
  p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push('console: ' + m.text()));
  await p.goto(`http://127.0.0.1:${port}/?dev&scene=hub&first&name=Test`, { waitUntil: 'networkidle0' });
  await sleep(500);
  await p.mouse.click(640, 480);
  await sleep(500);
  const result = await p.evaluate(async ({ sfxNames, musicNames }) => {
    const A = await import('/src/core/audio.js');
    const M = await import('/src/core/mix.js');
    const out = { ctxState: null, phases: [], badSfx: [], badMusic: [], badIr: [] };
    const ctx = A.ensureAudio(); await ctx.resume(); out.ctxState = ctx.state;
    // every phase row resolves and applies without throwing
    const probes = [{ min: 5 }, { min: 46 }, { min: 60, night: true }, { min: 70, night: true }, { min: 80, flags: { scene: 'feber1' } }, { min: 80, flags: { scene: 'feber2' } }, { min: 80, flags: { scene: 'feber3' } }, { min: 82, flags: { scene: 'logrum' } }, { min: 85, flags: { ending: 'morgen' } }, { min: 89, flags: { scene: 'credits' } }];
    for (const pr of probes) { const ph = M.applyMix(pr); out.phases.push(ph && ph.id); await new Promise((r) => setTimeout(r, 60)); }
    // every sfx decodes and plays
    for (const n of sfxNames) { const s = await A.play(n, { gain: 0.1 }); if (!s) out.badSfx.push(n); }
    for (const n of ['edb', 'tomt']) { try { await A.room(n); } catch (e) { out.badIr.push(n + ': ' + e.message); } }
    // every music file decodes
    const bufs = await A.preload(musicNames.map((n) => `assets/music/${n}.ogg`));
    bufs.forEach((bf, i) => { if (!bf) out.badMusic.push(musicNames[i]); });
    A.loopHak(); A.stereoTicks(6, 200); A.phone(true); A.phone(false); A.duck(false); A.duck(true);
    await A.jump(100);
    await new Promise((r) => setTimeout(r, 400));
    out.durations = Object.fromEntries(musicNames.map((n, i) => [n, bufs[i] ? +bufs[i].duration.toFixed(2) : null]));
    return out;
  }, { sfxNames, musicNames });
  console.log(JSON.stringify(result, null, 1));
  if (result.ctxState !== 'running') errors.push('AudioContext not running: ' + result.ctxState);
  const expect = ['dag', 'kamp', 'nat', 'nat_telefon', 'feber1', 'feber2', 'feber3', 'logrum', 'morgen', 'credits'];
  if (result.phases.join() !== expect.join()) errors.push('phase order: ' + result.phases.join() + ' expected ' + expect.join());
  if (result.badSfx.length) errors.push('sfx failed to decode: ' + result.badSfx.join());
  if (result.badMusic.length) errors.push('music failed to decode: ' + result.badMusic.join());
  if (result.badIr.length) errors.push('ir: ' + result.badIr.join());
  await p.close();
} finally { await b.close(); srv.kill(); }
console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'audio: no errors');
process.exit(errors.length ? 1 : 0);
