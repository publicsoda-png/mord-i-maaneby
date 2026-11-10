// Renders the procedural jump-hall fallback (drawHall in src/scenes/acts.js) to a 640×480 PNG for council C6.
// Usage: node tools/test/c6_fallback.mjs <out.png>
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = process.argv[2];
const port = 4900 + Math.floor(Math.random() * 90);
const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 100; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) break; } catch {} await sleep(120); }
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--mute-audio'] });
try {
  const p = await b.newPage();
  await p.goto(`http://127.0.0.1:${port}/?dev&scene=hub&name=Test`, { waitUntil: 'networkidle0' });
  await sleep(800);
  const url = await p.evaluate(async () => {
    const m = await import('./src/scenes/acts.js');
    const c = document.createElement('canvas'); c.width = 640; c.height = 480;
    m.drawHall(c.getContext('2d'));
    return c.toDataURL('image/png');
  });
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  console.log(out);
} finally { await b.close(); srv.kill(); }
