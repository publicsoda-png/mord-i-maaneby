// Real-mouse smoke test: START must react to a genuine page.mouse.click (QC: #ui > * killed pointer-events on every DOM button).
// Also: answer correctly while the "Prøv igen" auto-line is still showing → no eternal hourglass.
import puppeteer from 'puppeteer-core';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = process.env.MB_URL || 'http://localhost:4873/';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--autoplay-policy=no-user-gesture-required', '--window-size=640,480'] });
const page = await browser.newPage();
await page.setViewport({ width: 640, height: 480 });
const errs = [];
page.on('pageerror', (e) => errs.push('pageerror ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('console ' + m.text()); }); // optional-asset probes 404 by design
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (ok, msg) => { if (!ok) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); };

// 1. title → START by real click
await page.goto(base + '?dev&scene=title&name=', { waitUntil: 'networkidle0' });
await sleep(800);
const start = await page.$('.btn');
check(!!start, 'a .btn exists on the title screen');
if (start) {
  const pe = await page.evaluate((el) => getComputedStyle(el).pointerEvents, start);
  check(pe === 'auto', 'computed pointer-events on .btn = ' + pe);
  const b = await start.boundingBox();
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await sleep(900);
  const scene = await page.evaluate(() => globalThis.MB && globalThis.MB.scene ? globalThis.MB.scene() : document.querySelector('.input') ? 'setup' : '?');
  check(scene === 'setup' || !!(await page.$('.input')), 'real click on START reached setup (' + scene + ')');
}

// 2. landing: click every number button 300 ms apart (wrong ones first, the right one lands inside the "Prøv igen" auto-line)
//    → the ok-line must be VISIBLE afterwards (hang = box hidden while say() waits for a click)
await page.goto(base + '?dev&scene=task&plot=landing&name=Test', { waitUntil: 'networkidle0' });
await sleep(1200);
await page.mouse.click(320, 40); await sleep(400); await page.mouse.click(320, 40); // skip intro
const numSel = () => [...document.querySelectorAll('#field .o.btn')].filter((e) => /^\d+$/.test(e.textContent.trim()));
await page.waitForFunction((src) => eval(src)().length >= 2, { timeout: 40000 }, numSel.toString()).catch(() => {});
await sleep(400);
const nums = await page.$$eval('#field .o.btn', (els) => els.filter((e) => /^\d+$/.test(e.textContent.trim())).map((e) => { const r = e.getBoundingClientRect(); return { v: +e.textContent, x: r.x + r.width / 2, y: r.y + r.height / 2 }; }));
check(nums.length >= 2, 'number buttons present (' + nums.map((n) => n.v).join(',') + ')');
for (const n of nums) { await page.mouse.click(n.x, n.y); await sleep(300); }
await sleep(2500);
const st = await page.evaluate(() => ({ hidden: document.getElementById('dialog').hidden, field: document.querySelectorAll('#field .o').length }));
console.log('   after race →', JSON.stringify(st));
check(!st.hidden, 'ok-line visible after answering during "Prøv igen" (no eternal hourglass)');
await page.mouse.click(320, 40); await sleep(1500); // advance the ok-line → back to hub
const hubBtn = await page.$$eval('.btn', (els) => els.map((e) => e.dataset.label));
check(hubBtn.includes('Gem') || hubBtn.includes('Luk'), 'returned to hub after ok-line (' + hubBtn.join('/') + ')');

console.log(errs.length ? errs.join('\n') : 'no errors');
await browser.close();
process.exit(fails || errs.length ? 1 : 0);
