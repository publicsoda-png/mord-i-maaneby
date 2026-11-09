// Screenshots of scenes via dev params. Usage: node tools/test/shots.mjs "dev&scene=title" "dev&scene=hub&first" ...
// Serves the repo with python http.server on a random port, uses system Chrome (headless, muted, low priority).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const out = path.join(here, 'shots');
fs.mkdirSync(out, { recursive: true });
const port = 4900 + Math.floor(Math.random() * 90);
const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 100; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) break; } catch {} await sleep(120); }
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const errors = [];
const queries = process.argv.slice(2);
if (!queries.length) queries.push('dev&scene=title', 'dev&scene=setup', 'dev&scene=hub&first&name=Test', 'dev&scene=hub&nat&name=Test');
try {
  for (const q of queries) {
    const p = await b.newPage();
    p.on('pageerror', (e) => errors.push(q + ': ' + e.message));
    p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(q + ': ' + m.text()));
    await p.setViewport({ width: 1280, height: 960 });
    await p.goto(`http://127.0.0.1:${port}/?${q}`, { waitUntil: 'networkidle0' });
    await sleep(600);
    await p.mouse.click(640, 480); // audio gesture + advance a dialog
    await sleep(1800);
    const name = q.replace(/[^a-z0-9]+/gi, '_');
    await p.screenshot({ path: path.join(out, name + '.png') });
    // click through a few dialogs and shoot again
    for (let i = 0; i < 4; i++) { await p.mouse.click(300, 40); await sleep(500); }
    await p.screenshot({ path: path.join(out, name + '_b.png') });
    await p.close();
  }
} finally { await b.close(); srv.kill(); }
console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'no errors');
process.exit(errors.length ? 1 : 0);
