// List every 404 the game requests on a given query (default: landing task). Usage: node tools/test/404s.mjs "dev&scene=hub"
import puppeteer from 'puppeteer-core';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = process.env.MB_URL || 'http://localhost:4873/';
const q = process.argv[2] || 'dev&scene=task&plot=landing&name=Test';
const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const p = await b.newPage();
const u = new Set();
p.on('response', (r) => { if (r.status() === 404) u.add(r.url().replace(base, '')); });
await p.goto(base + '?' + q, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 3000));
console.log([...u].join('\n') || 'no 404s');
await b.close();
