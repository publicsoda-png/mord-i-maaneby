// A6 lyd/billede-sync (QUALITY-PLAN §3A.6 + §3B loudness) = gate G3. Køres af QC-agenten, ikke bygge-agenten.
// Metode: CDP-screencast (billedsiden) krydses med et hook på AudioBufferSourceNode.start (lydsiden, tagget med URL via fetch→decodeAudioData).
// Brug: node tools/test/sync.mjs   → tools/test/qc-sync/sync-report.json
import puppeteer from 'puppeteer-core';
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const G = JSON.parse(fs.readFileSync(path.join(here, 'gates.json'), 'utf8')).A6_timing;
const out = path.join(here, 'qc-sync');
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const magick = (...a) => execFileSync('magick', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const AE = (a, b, fuzz = 8) => { try { execFileSync('magick', ['compare', '-metric', 'AE', '-fuzz', fuzz + '%', a, b, 'null:'], { stdio: ['ignore', 'pipe', 'pipe'] }); return 0; } catch (e) { return parseFloat(String(e.stderr).trim().split(' ')[0]) || 0; } };
const gitHash = (() => { try { return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim() + (execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' }).trim() ? '+dirty' : ''); } catch { return '?'; } })();
const report = { when: new Date().toISOString(), git: gitHash, gates: G, tests: {}, pass: {}, notes: [] };

// ---------- offline: mund-JSON mod ogg-RMS, loudness ----------
{
  const vdir = path.join(root, 'assets/voice');
  const oggs = fs.readdirSync(vdir).filter((f) => f.endsWith('.ogg'));
  const agree = [];
  for (const f of oggs) {
    const j = path.join(vdir, f.replace('.ogg', '.json')); if (!fs.existsSync(j)) continue;
    const mouth = JSON.parse(fs.readFileSync(j, 'utf8'));
    const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(vdir, f), '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], { maxBuffer: 1 << 28 });
    const win = 1280; const rms = [];
    for (let i = 0; i + 2 <= pcm.length; i += win * 2) { let s = 0, n = 0; for (let k = i; k < Math.min(pcm.length - 1, i + win * 2); k += 2) { const v = pcm.readInt16LE(k) / 32768; s += v * v; n++; } rms.push(Math.sqrt(s / Math.max(1, n))); }
    const peak = Math.max(...rms) || 1; let ok = 0; const n = Math.min(rms.length, mouth.length);
    for (let i = 0; i < n; i++) ok += ((rms[i] / peak >= 0.08) === (mouth[i] > 0)) ? 1 : 0;
    agree.push({ clip: f, frames: n, json_frames: mouth.length, rms_frames: rms.length, agreement: +(ok / Math.max(1, n)).toFixed(3) });
  }
  const bad = agree.filter((a) => a.agreement < G.json_rms_agreement_min || Math.abs(a.json_frames - a.rms_frames) > 2);
  report.tests.mouth_json_vs_rms = { clips: agree.length, min_agreement: Math.min(...agree.map((a) => a.agreement)), failing: bad };
  report.pass.A6_mouth_json = bad.length === 0 && agree.length > 0;

  const lufs = (file) => { const o = String(spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr); const sum = o.slice(o.lastIndexOf('Summary:')); const I = +(sum.match(/I:\s+(-?[\d.]+)\s+LUFS/) || [])[1]; const P = +(sum.match(/Peak:\s+(-?[\d.]+)\s+dBFS/) || [])[1]; if (Number.isNaN(I)) throw new Error('ebur128-parse fejlede for ' + file + '\n' + o.slice(-600)); return { I, peak: P }; };
  const voice = oggs.map((f) => ({ clip: f, ...lufs(path.join(vdir, f)) }));
  const mdir = path.join(root, 'assets/music');
  const music = fs.readdirSync(mdir).filter((f) => f.endsWith('.ogg')).map((f) => ({ clip: f, ...lufs(path.join(mdir, f)) }));
  const wlSrc = ['src/core/wrongness.js', 'src/wrongness.js'].map((f) => path.join(root, f)).filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const whitelist = new Set([...wlSrc.matchAll(/qc-whitelist:\s*([^\n—]+)/g)].flatMap((m) => m[1].trim().split(/[\s,]+/)).filter(Boolean));
  const wl = (v) => whitelist.has(v.clip.replace(/\.ogg$/, ''));
  report.tests.loudness_whitelist = [...whitelist];
  voice.forEach((v) => { v.whitelisted = wl(v); }); music.forEach((v) => { v.whitelisted = wl(v); });
  const vBad0 = voice.filter((v) => Math.abs(v.I - G.voice_lufs) > G.lufs_tolerance || v.peak > G.true_peak_max_dbfs);
  const mBad0 = music.filter((v) => Math.abs(v.I - G.music_lufs) > G.lufs_tolerance || v.peak > G.true_peak_max_dbfs);
  const vBad = vBad0.filter((v) => !v.whitelisted), mBad = mBad0.filter((v) => !v.whitelisted);
  report.tests.loudness_whitelisted_deviations = [...vBad0, ...mBad0].filter((v) => v.whitelisted);
  report.tests.loudness = { voice_n: voice.length, voice_I_range: [Math.min(...voice.map((v) => v.I)), Math.max(...voice.map((v) => v.I))], music_n: music.length, music_I_range: [Math.min(...music.map((v) => v.I)), Math.max(...music.map((v) => v.I))], voice_failing: vBad, music_failing: mBad };
  report.pass.A6_loudness_voice = vBad.length === 0; report.pass.A6_loudness_music = mBad.length === 0;
  console.log(`offline: mund-JSON ≥ ${report.tests.mouth_json_vs_rms.min_agreement} enighed (${agree.length} klip) · stemme ${voice.length} klip I ${report.tests.loudness.voice_I_range} · musik ${music.length} spor I ${report.tests.loudness.music_I_range}`);
}

// ---------- browser ----------
const port = 4900 + Math.floor(Math.random() * 90);
const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
for (let i = 0; i < 100; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) break; } catch {} await sleep(120); }
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--window-size=700,560'] });
const HOOK = `(() => {
  window.__audio = []; const urlOf = new WeakMap(); const bufUrl = new WeakMap();
  const of = window.fetch; window.fetch = async function (u, ...r) { const res = await of.call(this, u, ...r); const url = typeof u === 'string' ? u : u.url; const ab = res.arrayBuffer.bind(res); res.arrayBuffer = async () => { const a = await ab(); urlOf.set(a, url); return a; }; return res; };
  const od = AudioContext.prototype.decodeAudioData; AudioContext.prototype.decodeAudioData = function (ab, ok, err) { const p = od.call(this, ab, ok, err); const url = urlOf.get(ab) || '?'; if (p && p.then) p.then((buf) => bufUrl.set(buf, url)); return p; };
  const oo = OscillatorNode.prototype.start; OscillatorNode.prototype.start = function (when, ...r) { const ctxNow = this.context.currentTime; const delay = Math.max(0, (when || 0) - ctxNow); window.__audio.push({ t: Date.now() / 1000 + delay, dur: 0, url: 'synth:osc' }); return oo.call(this, when, ...r); };
  const os = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (when, ...r) { const ctxNow = this.context.currentTime; const delay = Math.max(0, (when || 0) - ctxNow); window.__audio.push({ t: Date.now() / 1000 + delay, dur: this.buffer ? this.buffer.duration : 0, url: this.buffer ? (bufUrl.get(this.buffer) || '?') : '?' }); return os.call(this, when, ...r); };
})();`;
async function open(q) {
  const p = await b.newPage();
  await p.evaluateOnNewDocument(HOOK);
  await p.setViewport({ width: 640, height: 480, deviceScaleFactor: 1 });
  await p.goto(`http://127.0.0.1:${port}/?${q}`, { waitUntil: 'networkidle0' });
  await sleep(500); await p.mouse.click(600, 100); await sleep(400);
  for (let i = 0; i < 5; i++) { await p.mouse.click(300, 40); await sleep(350); }
  await p.mouse.move(636, 476); await p.evaluate(() => { const c = document.getElementById('cursor'); if (c) c.style.display = 'none'; });
  await sleep(800); return p;
}
async function record(p, dir, run, ms) {
  fs.mkdirSync(dir, { recursive: true });
  const cdp = await p.target().createCDPSession(); const frames = [];
  cdp.on('Page.screencastFrame', async (ev) => { frames.push({ t: ev.metadata.timestamp, data: ev.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch {} });
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: 640, maxHeight: 480 });
  await sleep(400); await run(); await sleep(ms); await cdp.send('Page.stopScreencast');
  const rows = frames.map((f, i) => { const file = path.join(dir, `f_${String(i).padStart(3, '0')}.png`); fs.writeFileSync(file, Buffer.from(f.data, 'base64')); return { i, t: f.t, file }; });
  const audio = await p.evaluate(() => window.__audio);
  return { rows, audio };
}
const crop = (file, geom, dst) => { magick(file, '-crop', geom, '+repage', dst); return dst; };
const HELPER = '130x250+6+226', TEXT = '616x60+12+8';

try {
  // ---- T1: mund vs. stemme (intro1, 5,8 s) ----
  {
    const p = await open('dev&scene=hub&name=Test');
    const text = 'Velkommen til Måneby, lille bygmester. Her er stille. Alt for stille, hvis du spørger mig.';
    const { rows, audio } = await record(p, path.join(out, 't1'), () => p.evaluate(async (txt) => { const d = await import('/src/core/dialog.js'); d.say(txt, { voice: 'assets/voice/intro1.ogg', mouth: 'assets/voice/intro1.json', auto: 400 }); }, text), 8500);
    const v = audio.find((a) => /voice\/intro1/.test(a.url));
    const ref = crop(rows[0].file, HELPER, path.join(out, 't1', 'helper_ref.png'));
    const open_ = rows.map((r) => { const c = crop(r.file, HELPER, r.file.replace('.png', '_h.png')); const d = AE(ref, c); return { t: r.t, open: d > G.mouth_open_min_px, d }; });
    let bad = 0, inVoiceOpen = 0, inVoiceN = 0; const tol = G.mouth_tolerance_ms / 1000;
    for (const o of open_) { const inV = v && o.t >= v.t - tol && o.t <= v.t + v.dur + tol; if (o.open && !inV) bad++; if (v && o.t >= v.t && o.t <= v.t + v.dur) { inVoiceN++; if (o.open) inVoiceOpen++; } }
    // mundskift pr. sekund (step-ur ≤ 12,5 Hz)
    let changes = 0; for (let i = 1; i < rows.length; i++) if (AE(rows[i - 1].file.replace('.png', '_h.png'), rows[i].file.replace('.png', '_h.png')) > 0) changes++;
    const span = rows.at(-1).t - rows[0].t;
    const firstOpen = open_.find((o) => o.open)?.t, lastOpen = [...open_].reverse().find((o) => o.open)?.t;
    report.tests.mouth_vs_voice = { voice_found: !!v, voice_start: v?.t, voice_dur: v?.dur, frames: rows.length, open_outside_voice_frames: bad, open_during_voice_pct: +(100 * inVoiceOpen / Math.max(1, inVoiceN)).toFixed(1), helper_changes_per_s: +(changes / span).toFixed(1), mouth_first_open_ms_after_voice: v && firstOpen ? Math.round((firstOpen - v.t) * 1000) : null, mouth_last_open_ms_after_voice_end: v && lastOpen ? Math.round((lastOpen - (v.t + v.dur)) * 1000) : null, audio_events: audio.map((a) => ({ url: a.url.replace(/^.*\/(assets\/)/, '$1'), dur: +a.dur.toFixed(2) })) };
    report.pass.A6_mouth_only_during_voice = !!v && bad === 0;
    report.pass.A6_mouth_moves_during_voice = !!v && report.tests.mouth_vs_voice.open_during_voice_pct >= G.mouth_open_during_voice_min_pct;
    report.pass.A6_helper_steprate = report.tests.mouth_vs_voice.helper_changes_per_s <= G.helper_frames_per_s_max;
    console.log(`T1 mund/stemme: voice ${v ? v.dur.toFixed(2) + ' s' : 'IKKE FUNDET'} · åben uden for stemme ${bad} frames · åben under stemme ${report.tests.mouth_vs_voice.open_during_voice_pct}% · ${report.tests.mouth_vs_voice.helper_changes_per_s} skift/s · første åben +${report.tests.mouth_vs_voice.mouth_first_open_ms_after_voice} ms · sidste åben ${report.tests.mouth_vs_voice.mouth_last_open_ms_after_voice_end} ms efter slut`);
    await p.close();
  }
  // ---- T2: tekst-tempo uden stemme ----
  {
    const p = await open('dev&scene=hub&name=Test');
    const text = 'Kvalitetskontrol af tekstens tempo her i Måneby, tak skal du have.'; // ikke i voicemap
    const { rows } = await record(p, path.join(out, 't2'), () => p.evaluate(async (txt) => { const d = await import('/src/core/dialog.js'); d.say(txt, { auto: 300 }); }, text), 4500);
    const crops = rows.map((r) => crop(r.file, TEXT, r.file.replace('.png', '_t.png')));
    const changeT = []; for (let i = 1; i < rows.length; i++) if (AE(crops[i - 1], crops[i], 0) > 0) changeT.push(rows[i].t);
    // tekstens første N−1 skift er tegn (sidste skift = boksen lukker); forventede pauser: '.'/'!'/'?' 260, ',' 120 (ud over tegnets egen tid)
    const chars = text.length; const pauses = [...text].reduce((s, ch) => s + (/[.!?]/.test(ch) ? 260 : ch === ',' ? 120 : 0), 0) / 1000;
    // changeT[0] = boksen vises (+1. tegn), changeT[sidste] = boksen lukker (auto). Tegnene ligger imellem → brug kendt tegnantal, ikke antal fangede frames.
    const typing = changeT.length >= 3 ? changeT[changeT.length - 2] - changeT[0] : 0;
    const visibleChars = chars;
    const cps = typing > 0 ? (chars - 1) / Math.max(0.001, typing - pauses) : 0;
    report.tests.text_cps = { chars, visible_changes: changeT.length, change_times_rel: changeT.map((t) => +(t - changeT[0]).toFixed(3)), typing_s: +typing.toFixed(2), pauses_s: pauses, cps_measured: +cps.toFixed(1), note: 'screencast fanger ikke nødvendigvis hvert tegn ved 60 Hz → cps er en nedre grænse hvis visible_changes < chars' };
    report.pass.A6_cps_visual = cps >= G.cps_min - 2 && cps <= G.cps_max + 2;
    console.log(`T2 tekst: ${changeT.length} synlige skift af ${chars} tegn på ${typing.toFixed(2)} s → ${cps.toFixed(1)} cps`);
    await p.close();
  }
  // ---- T3: pling mod bygnings-swap (hub genindtræder med justBuilt) ----
  {
    const p = await open('dev&scene=hub&name=Test');
    const { rows, audio } = await record(p, path.join(out, 't3'), () => p.evaluate(() => { const s = window.MB.save; s.buildings.landing = 1; s.flags.justBuilt = { id: 'landing', stage: 1 }; window.MB.goto('hub', { back: false }); }), 2500);
    const lum = rows.map((r) => +magick(r.file, '-colorspace', 'Gray', '-format', '%[fx:mean*255]', 'info:'));
    let swapIdx = -1; for (let i = 1; i < rows.length; i++) if (lum[i - 1] < 8 && lum[i] >= 8) { swapIdx = i; break; }
    const pling = audio.find((a) => /ui_bygning_op/.test(a.url));
    const delta = swapIdx >= 0 && pling ? Math.round((pling.t - rows[swapIdx].t) * 1000) : null;
    report.tests.pling_vs_swap = { swap_frame: swapIdx, swap_t: rows[swapIdx]?.t, pling_found: !!pling, pling_url: pling?.url?.replace(/^.*\/(assets\/)/, '$1'), delta_ms: delta, black_frames: lum.filter((l) => l < 8).length };
    report.pass.A6_pling_sync = delta !== null && Math.abs(delta) <= G.sfx_sync_tolerance_ms;
    console.log(`T3 pling: swap-frame ${swapIdx} · pling ${pling ? 'fundet' : 'IKKE FUNDET'} · Δ ${delta} ms (gate ±${G.sfx_sync_tolerance_ms})`);
    await p.close();
  }
  // ---- T4: klik-latens (pointerdown → første frame >0,5 % diff) + lyd inden 400 ms ----
  {
    const p = await open('dev&scene=hub&name=Test');
    const cdp = await p.target().createCDPSession();
    let downT = 0;
    const { rows, audio } = await record(p, path.join(out, 't4'), async () => { downT = Date.now() / 1000; await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 38, y: 20, button: 'left', clickCount: 1 }); await sleep(120); await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 38, y: 20, button: 'left', clickCount: 1 }); }, 1500);
    const before = rows.filter((r) => r.t < downT).at(-1) || rows[0];
    const first = rows.find((r) => r.t > downT && AE(before.file, r.file, 0) > 640 * 480 * (G.click_visual_min_pct / 100)); // fuzz 0: dialogboks over mørk himmel er under 8 %-fuzz
    const sfx = audio.find((a) => a.t >= downT - 0.02 && a.t <= downT + 0.4);
    report.tests.click_latency = { down_t: downT, first_frame: first?.i, before_frame: before.i, first_visual_ms: first ? Math.round((first.t - downT) * 1000) : null, sfx_ms: sfx ? Math.round((sfx.t - downT) * 1000) : null, sfx_url: sfx?.url, frames: rows.length };
    report.pass.A6_click_visual_latency = first !== undefined && (first.t - downT) * 1000 <= G.click_latency_max_ms;
    report.pass.A6_click_has_sfx = !!sfx;
    console.log(`T4 klik: første visuelle respons ${report.tests.click_latency.first_visual_ms} ms · lyd ${report.tests.click_latency.sfx_ms} ms (${sfx?.url})`);
    await p.close();
  }
} finally { await b.close(); srv.kill(); }

report.G3 = Object.entries(report.pass).map(([gate, pass]) => ({ gate, pass }));
report.G3_pass = report.G3.every((g) => g.pass);
fs.writeFileSync(path.join(out, 'sync-report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(here, 'qc-sync-report.json'), JSON.stringify(report, null, 2));
console.log('\nG3: ' + report.G3.map((g) => `${g.gate}=${g.pass ? 'OK' : 'FEJL'}`).join(' · '));
console.log('G3 ' + (report.G3_pass ? 'BESTÅET' : 'IKKE BESTÅET') + ' — ' + path.join(out, 'sync-report.json'));
process.exit(report.G3_pass ? 0 : 1);
