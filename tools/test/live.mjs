// Opens the live Pages URL (or argv[2]) in headless Chrome, clicks the cd icon, and fails on page errors.
import puppeteer from 'puppeteer-core';
const url = process.argv[2] || 'https://publicsoda-png.github.io/mord-i-maaneby/';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--mute-audio'] });
const p = await b.newPage(); const errors = []; const failed = [];
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
p.on('requestfailed', (r) => failed.push(r.url()));
p.on('response', (r) => r.status() >= 400 && failed.push(r.status() + ' ' + r.url()));
await p.setViewport({ width: 1280, height: 960 });
await p.goto(url, { waitUntil: 'networkidle0' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(800);
// double-click the cd icon (4th desktop icon)
const icon = await p.$('#os .desk-icon:nth-child(4)');
if (icon) { await icon.click({ clickCount: 2 }); } else errors.push('no cd icon');
await sleep(6000);
const title = await p.evaluate(() => document.title);
const scene = await p.evaluate(() => window.MB && window.MB.save.scene);
await p.screenshot({ path: new URL('./shots/live.png', import.meta.url).pathname });
await b.close();
console.log(JSON.stringify({ url, title, scene, errors, failed }, null, 1));
process.exit(errors.length || failed.length ? 1 : 0);
