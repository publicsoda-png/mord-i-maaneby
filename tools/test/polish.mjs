// QC for QUALITY-PLAN §3A. Måler polish objektivt — køres af en ANDEN agent end den, der bygger.
// Brug: node tools/test/polish.mjs [--only hub,title] [--skip-transition]
// Kræver: puppeteer-core + system-Chrome, python3 (http.server), ImageMagick (magick).
// Output: tools/test/qc/qc-report.json + tools/test/qc/<scene>/… + tools/test/qc/kontakt.png
import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const G = JSON.parse(fs.readFileSync(path.join(here, 'gates.json'), 'utf8'));
const out = path.join(here, 'qc');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const argv = process.argv.slice(2);
const only = (argv.find((a) => a.startsWith('--only')) || '').split('=')[1]?.split(',');
const skipTrans = argv.includes('--skip-transition');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const magick = (...a) => execFileSync('magick', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const AE = (a, b, fuzz) => { try { execFileSync('magick', ['compare', '-metric', 'AE', '-fuzz', fuzz + '%', a, b, 'null:'], { stdio: ['ignore', 'pipe', 'pipe'] }); return 0; } catch (e) { return parseFloat(String(e.stderr).trim().split(' ')[0]) || 0; } };
const PX = 640 * 480;
const pct = (n, d = PX) => +((100 * n) / d).toFixed(4);
const gitHash = (() => { try { return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim() + (execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' }).trim() ? '+dirty' : ''); } catch { return '?'; } })();

const report = { when: new Date().toISOString(), git: gitHash, gates: G, scenes: {}, transition: null, static: {}, pass: {}, notes: [] };

// ---------- static checks (A5/A6/A7) ----------
function grepAll(dir, re, filter = () => true) {
  const hits = [];
  const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (filter(p)) fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => { if (re.test(l)) hits.push(`${path.relative(root, p)}:${i + 1}: ${l.trim().slice(0, 110)}`); }); } };
  walk(dir); return hits;
}
{
  const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
  const cssHits = G.A7_grep.css_forbidden.filter((k) => css.includes(k));
  // Kun TIDSDREVET sinus (bob/glid) i scener + core: Math.sin(t/600), Math.sin(tm*…), Math.sin(performance.now()…). Geometri (vinkler) er lovlig. Minispil (src/ware) tjekkes fra fase 4.
  const sinRe = new RegExp(G.A7_grep.sin_time_regex);
  const sinHits = grepAll(path.join(root, 'src'), sinRe, (p) => /\.js$/.test(p) && /src\/(scenes|core)\//.test(p) && !G.A7_grep.sin_allowlist.some((a) => p.endsWith(a)));
  const blackOverrides = grepAll(path.join(root, 'src'), /black:\s*0/, (p) => /\.js$/.test(p));
  const blackBad = blackOverrides.filter((h) => !G.A2_transition.black_override_allowlist.some((a) => h.startsWith(a)));
  const procHits = grepAll(path.join(root, 'src/scenes'), /\bproc\(|placeholder\.js/, (p) => /\.js$/.test(p));
  const cps = grepAll(path.join(root, 'src'), /cps\s*[:=]\s*\d+/, (p) => /\.js$/.test(p)).map((h) => +h.match(/cps\s*[:=]\s*(\d+)/)[1]);
  const defCps = (fs.readFileSync(path.join(root, 'src/core/dialog.js'), 'utf8').match(/opts\.cps\s*\?\?\s*(\d+)/) || [])[1];
  if (defCps) cps.push(+defCps);
  const cpsBad = cps.filter((v) => v < G.A6_timing.cps_min || v > G.A6_timing.cps_max);
  report.static = { A7_css_forbidden_hits: cssHits, A7_sin_outside_allowlist: sinHits, A2_black_overrides: blackOverrides, A2_black_overrides_outside_allowlist: blackBad, A5_placeholder_in_scenes: procHits.length, A6_cps_values: cps, A6_cps_out_of_range: cpsBad };
  report.pass.A7_css = cssHits.length === 0;
  report.pass.A7_sin = sinHits.length === 0;
  report.pass.A2_static = blackBad.length === 0;
  report.pass.A6_cps_static = cpsBad.length === 0 && cps.length > 0;
  report.pass.A5_placeholder = procHits.length <= G.A5_placeholder.max_proc_calls_in_scenes; // informativt før fase 4
  // A3 assets: alle PNG i assets/ skal være PNG8 (IHDR color type 3 = byte 25)
  const pngs = []; const walk = (d) => { if (!fs.existsSync(d)) return; for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (/\.png$/i.test(p)) pngs.push(p); } }; walk(path.join(root, 'assets'));
  const notPng8 = pngs.filter((p) => fs.readFileSync(p).readUInt8(25) !== 3).map((p) => path.relative(root, p));
  report.static.A3_assets_png_total = pngs.length; report.static.A3_assets_not_png8 = notPng8;
  report.pass.A3_assets = notPng8.length === 0;
}

// ---------- browser ----------
const port = 4900 + Math.floor(Math.random() * 90);
const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
for (let i = 0; i < 100; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) break; } catch {} await sleep(120); }
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--window-size=700,560'] });
const errors = [];

async function open(q, dsf = 1) {
  const p = await b.newPage();
  p.on('pageerror', (e) => errors.push(q + ': ' + e.message));
  p.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(q + ': ' + m.text()));
  await p.setViewport({ width: 640, height: 480, deviceScaleFactor: dsf });
  await p.goto(`http://127.0.0.1:${port}/?${q}`, { waitUntil: 'networkidle0' });
  await sleep(500);
  await p.mouse.click(600, 100); // audio-gestus i tom himmel
  await sleep(400);
  for (let i = 0; i < 5; i++) { await p.mouse.click(300, 40); await sleep(350); } // klik dialoger igennem
  await p.mouse.move(636, 476); // parkér cursoren i hjørnet
  await p.evaluate(() => { const c = document.getElementById('cursor'); if (c) c.style.display = 'none'; });
  await sleep(800);
  return p;
}
const shot = (p, file) => p.screenshot({ path: file, clip: { x: 0, y: 0, width: 640, height: 480 } });

try {
  const firsts = [];
  for (const sc of G.scenes) {
    if (only && !only.includes(sc.id)) continue;
    const dir = path.join(out, sc.id); fs.mkdirSync(dir, { recursive: true });
    const r = { id: sc.id, q: sc.q };
    const p = await open(sc.q);
    // A1: 40 frames à 250 ms = 10 s i hvile
    const A1 = G.A1_motion; const files = [];
    for (let i = 0; i < A1.frames; i++) { const f = path.join(dir, `m_${String(i).padStart(2, '0')}.png`); const t0 = Date.now(); await shot(p, f); files.push(f); await sleep(Math.max(0, A1.window_ms - (Date.now() - t0))); }
    const diffs = []; for (let i = 1; i < files.length; i++) diffs.push(pct(AE(files[i - 1], files[i], A1.fuzz_pct)));
    r.A1 = { change_pct_per_250ms: diffs, max: Math.max(...diffs), median: [...diffs].sort((a, b) => a - b)[diffs.length >> 1], nonzero_steps: diffs.filter((d) => d > A1.liveness_min_change_pct).length };
    // A1b: burst ~1 s → distinkte frames pr. sekund
    const burst = []; const tb = Date.now();
    for (let i = 0; i < 24; i++) burst.push(await p.screenshot({ clip: { x: 0, y: 0, width: 640, height: 480 } }));
    const dur = (Date.now() - tb) / 1000;
    const uniq = new Set(burst.map((buf) => execFileSync('md5', { input: buf, encoding: 'utf8' }).trim())).size;
    r.A1.unique_frames_per_s = +(uniq / dur).toFixed(1); r.A1.burst_frames = burst.length; r.A1.burst_s = +dur.toFixed(2);
    r.pass_A1_max = r.A1.max <= A1.max_change_pct;
    r.pass_A1_live = sc.liveness ? r.A1.nonzero_steps >= 1 : null;
    r.pass_A1_steprate = r.A1.unique_frames_per_s <= A1.unique_frames_per_s_max;
    // A3: unikke farver i første frame
    r.A3_unique_colors = +magick(files[0], '-format', '%k', 'info:');
    r.pass_A3 = r.A3_unique_colors <= G.A3_palette.max_unique_colors;
    await p.close();
    // A4: dsf 2 → ingen sub-stage-pixel-detaljer
    const p2 = await open(sc.q, G.A4_text_aa.device_scale_factor);
    const hi = path.join(dir, 'aa_dsf2.png'); await p2.screenshot({ path: hi, clip: { x: 0, y: 0, width: 640, height: 480 } });
    const lo = path.join(dir, 'aa_resampled.png'); magick(hi, '-sample', '50%', '-sample', '200%', lo);
    const aaDiff = AE(hi, lo, 0); r.A4_subpixel_diff_pct = pct(aaDiff, PX * 4);
    r.pass_A4 = r.A4_subpixel_diff_pct <= G.A4_text_aa.max_subpixel_diff_pct;
    await p2.close();
    firsts.push(files[0]);
    report.scenes[sc.id] = r;
    console.log(`${sc.id}: A1 max ${r.A1.max}% (median ${r.A1.median}%, live ${r.A1.nonzero_steps}) · ${r.A1.unique_frames_per_s} frames/s · A3 ${r.A3_unique_colors} farver · A4 ${r.A4_subpixel_diff_pct}% subpixel`);
  }
  if (firsts.length) magick(...firsts, '+append', path.join(out, 'kontakt.png'));

  // A2: cut-to-black hub → task → hub via CDP screencast
  if (!skipTrans && (!only || only.includes('hub'))) {
    const p = await open('dev&scene=hub&name=Test');
    const cdp = await p.target().createCDPSession();
    const frames = [];
    cdp.on('Page.screencastFrame', async (ev) => { frames.push({ t: ev.metadata.timestamp, data: ev.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch {} });
    await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: 640, maxHeight: 480 });
    await sleep(400);
    await p.evaluate(async () => { const m = await import('/src/scenes/hub.js'); window.MB.goto('task', m.PLOTS[0]); });
    await sleep(1600);
    await p.evaluate(() => window.MB.goto('hub', { back: false }));
    await sleep(1600);
    await cdp.send('Page.stopScreencast');
    const dir = path.join(out, 'transition'); fs.mkdirSync(dir, { recursive: true });
    const T = G.A2_transition; const rows = [];
    frames.forEach((f, i) => { const file = path.join(dir, `t_${String(i).padStart(3, '0')}.png`); fs.writeFileSync(file, Buffer.from(f.data, 'base64')); const luma = +magick(file, '-colorspace', 'Gray', '-format', '%[fx:mean*255]', 'info:'); rows.push({ i, t: f.t, file, luma: +luma.toFixed(1), black: luma < T.black_luma_max_255 }); });
    // sort-perioder
    const periods = []; let cur = null;
    for (const r of rows) { if (r.black) { if (!cur) cur = { from: r.t, to: r.t, n: 0 }; cur.to = r.t; cur.n++; } else if (cur) { cur.ms = Math.round((r.t - cur.from) * 1000); periods.push(cur); cur = null; } }
    if (cur) { cur.ms = Math.round((cur.to - cur.from) * 1000); periods.push(cur); }
    // blandede frames: ikke sort og hverken ligner frame før eller efter sort-perioden (>5 % forskel fra begge)
    let blends = 0; const blendList = [];
    for (const per of periods) {
      const bi = rows.findIndex((r) => r.t === per.from); const ei = rows.findIndex((r) => r.t === per.to);
      const before = rows[bi - 1], after = rows[ei + 1];
      if (!before || !after) continue;
      for (const r of rows.slice(0, bi).slice(-3).concat(rows.slice(ei + 1, ei + 4))) {
        if (r.black) continue;
        const dA = pct(AE(before.file, r.file, 8)), dB = pct(AE(after.file, r.file, 8));
        if (dA > T.blend_diff_pct && dB > T.blend_diff_pct) { blends++; blendList.push({ i: r.i, dA, dB }); }
      }
    }
    report.transition = { frames: rows.length, black_periods: periods, blend_frames: blends, blend_list: blendList, lumas: rows.map((r) => r.luma) };
    report.pass.A2_black_present = periods.length >= 2;
    report.pass.A2_black_duration = periods.length > 0 && periods.every((x) => x.ms >= T.black_min_ms && x.ms <= T.black_max_ms);
    report.pass.A2_no_blend = blends <= T.blend_frames_max;
    console.log(`transition: ${rows.length} frames, sort-perioder ${JSON.stringify(periods.map((x) => x.ms))} ms, blandede ${blends}`);
    await p.close();
  }
} finally { await b.close(); srv.kill(); }

// ---------- samlet ----------
// Minispil ("ware": true) er informative indtil fase 4 (G4) — tæller ikke i G1-gates.
const S = Object.values(report.scenes).filter((r) => !G.scenes.find((s) => s.id === r.id)?.ware);
report.pass.A1_max = S.every((r) => r.pass_A1_max);
report.pass.A1_liveness = S.filter((r) => r.pass_A1_live !== null).every((r) => r.pass_A1_live);
report.pass.A1_steprate = S.every((r) => r.pass_A1_steprate);
report.pass.A3_frames = S.every((r) => r.pass_A3);
report.pass.A4_text_aa = S.every((r) => r.pass_A4);
report.console_errors = errors;
report.pass.no_console_errors = errors.length === 0;
report.notes.push('A6 lyd/billede-sync (sfx vs. screencast) er IKKE målt i denne version — kun cps statisk. A5 er informativt før fase 4.');
report.notes.push('A1 steprate måles med screenshot-burst (ujævn samplerate) — vejledende, ikke præcis.');
// G1 = A1 (max+liveness), A2, A4, A6(cps), A7 + ingen konsolfejl
report.G1 = ['A1_max', 'A1_liveness', 'A2_black_present', 'A2_black_duration', 'A2_no_blend', 'A4_text_aa', 'A6_cps_static', 'A7_css', 'A7_sin', 'A2_static', 'no_console_errors'].map((k) => ({ gate: k, pass: report.pass[k] }));
report.G1_pass = report.G1.every((g) => g.pass !== false);
fs.writeFileSync(path.join(out, 'qc-report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(here, 'qc-report.json'), JSON.stringify(report, null, 2));
console.log('\nG1: ' + report.G1.map((g) => `${g.gate}=${g.pass === undefined ? '–' : g.pass ? 'OK' : 'FEJL'}`).join(' · '));
console.log('G1 ' + (report.G1_pass ? 'BESTÅET' : 'IKKE BESTÅET') + ' — ' + path.join(out, 'qc-report.json'));
if (errors.length) console.log('Konsolfejl:\n' + errors.join('\n'));
process.exit(report.G1_pass ? 0 : 1);
