// Web Audio: buses, loop music, voice with mouth data, synth SFX (ported from sophie-game sfx.js) and era noises.
let ctx = null;
const bus = {};
let current = null; // current music {src, node, gain}
const buffers = new Map();

export function audioCtx() { return ctx; }
export function ensureAudio() {
  if (ctx) { ctx.state !== 'running' && ctx.resume(); return ctx; }
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  bus.master = ctx.createGain();
  bus.master.connect(ctx.destination);
  for (const n of ['music', 'voice', 'sfx', 'amb']) {
    bus[n] = ctx.createGain();
    bus[n].connect(bus.master);
  }
  bus.music.gain.value = 0.55; bus.voice.gain.value = 1; bus.sfx.gain.value = 0.8; bus.amb.gain.value = 0.6;
  // "22 kHz" feel on the voice bus: lowpass + light crush
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6800;
  bus.voice.disconnect(); bus.voice.connect(lp).connect(bus.master);
  return ctx;
}
export const buses = () => bus;
export function setBus(name, v, t = 0.2) { if (ctx && bus[name]) bus[name].gain.setTargetAtTime(v, ctx.currentTime, t); }

async function load(src) {
  if (buffers.has(src)) return buffers.get(src);
  const p = fetch(src).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(src))).then((ab) => ctx.decodeAudioData(ab)).catch(() => null);
  buffers.set(src, p);
  return p;
}

/** Loop music. opts: {fade, rate, detune, startDelay} */
export async function music(src, opts = {}) {
  if (!ctx) return;
  if (current && current.src === src && !opts.restart) return;
  stopMusic(opts.fade ?? 0.4);
  if (!src) return;
  const buf = await load(src);
  if (!buf) return;
  const node = ctx.createBufferSource();
  node.buffer = buf; node.loop = true;
  node.playbackRate.value = opts.rate ?? 1;
  if (opts.detune) node.detune.value = opts.detune;
  const g = ctx.createGain();
  g.gain.value = 0;
  node.connect(g).connect(bus.music);
  const t0 = ctx.currentTime + (opts.startDelay ?? 0);
  node.start(t0);
  g.gain.setTargetAtTime(opts.gain ?? 1, t0, opts.fade ?? 0.5);
  current = { src, node, gain: g };
}
export function stopMusic(fade = 0.4) {
  if (!current) return;
  const { node, gain } = current;
  gain.gain.setTargetAtTime(0, ctx.currentTime, fade);
  setTimeout(() => { try { node.stop(); } catch {} }, fade * 1000 * 4 + 50);
  current = null;
}
export const musicPlaying = () => !!current;

/** Ambient loop on its own bus (CRT hum etc). */
let amb = null;
export async function ambient(src, gain = 1) {
  if (!ctx) return;
  if (amb) { try { amb.stop(); } catch {} amb = null; }
  if (!src) return;
  const buf = await load(src);
  if (!buf) return;
  amb = ctx.createBufferSource(); amb.buffer = buf; amb.loop = true;
  const g = ctx.createGain(); g.gain.value = gain;
  amb.connect(g).connect(bus.amb); amb.start();
}

/** Play a voice clip; returns {done: Promise, mouth(t)→0..3}. Mouth data = JSON array of 0..3 per 80 ms. */
export async function voice(src, mouthJson) {
  if (!ctx) return { done: Promise.resolve(), mouth: () => 0, dur: 0 };
  const [buf, mouth] = await Promise.all([load(src), mouthJson ? fetch(mouthJson).then((r) => (r.ok ? r.json() : null)).catch(() => null) : null]);
  if (!buf) return { done: Promise.resolve(), mouth: () => 0, dur: 0 };
  const node = ctx.createBufferSource(); node.buffer = buf;
  node.connect(bus.voice);
  const t0 = ctx.currentTime;
  node.start(t0);
  const done = new Promise((r) => (node.onended = r));
  return { done, dur: buf.duration, stop: () => { try { node.stop(); } catch {} }, mouth: () => {
    const t = ctx.currentTime - t0;
    if (mouth) return mouth[Math.floor(t / 0.08)] ?? 0;
    return t < buf.duration ? 1 + Math.floor((Math.sin(t * 19) + 1) * 1.49) : 0;
  } };
}

// ---------- synth SFX ----------
function ready() { return ctx && ctx.state === 'running'; }
export function blip(f, dur = 0.05, gain = 0.06, type = 'square', f1 = f, to = 'sfx') {
  if (!ready()) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f1 !== f) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(bus[to]);
  o.start(t); o.stop(t + dur + 0.02);
}
/** Brown-ish noise burst through a sweeping bandpass — CD-ROM spin-up. */
export function cdSpin(dur = 2.2) {
  if (!ready()) return;
  const t = ctx.currentTime;
  const n = noiseBuf(dur + 0.5);
  const s = ctx.createBufferSource(); s.buffer = n;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.5;
  f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(1800, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.3); g.gain.setValueAtTime(0.25, t + dur - 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(bus.sfx); s.start(t); s.stop(t + dur + 0.1);
  // seek clicks
  for (let i = 0; i < 6; i++) setTimeout(() => blip(90 + Math.random() * 60, 0.012, 0.18, 'square'), 350 + i * (180 + Math.random() * 240));
}
export function crtHum(on = true) {
  if (!ready()) return;
  if (crtHum.node) { try { crtHum.node.stop(); } catch {} crtHum.node = null; }
  if (!on) return;
  const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sawtooth'; o.frequency.value = 50; o2.type = 'sine'; o2.frequency.value = 15625 / 2; // half line frequency whine
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
  g.gain.value = 0.0001; g.gain.setTargetAtTime(0.035, ctx.currentTime, 1.5);
  const g2 = ctx.createGain(); g2.gain.value = 0.006;
  o.connect(f).connect(g).connect(bus.amb); o2.connect(g2).connect(bus.amb);
  o.start(); o2.start();
  crtHum.node = { stop: () => { o.stop(); o2.stop(); } };
}
export function crtOff() {
  if (!ready()) return;
  blip(3200, 0.18, 0.12, 'sine', 40);
  setTimeout(() => blip(60, 0.4, 0.08, 'triangle', 20), 120);
}
function noiseBuf(sec) {
  const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * sec), ctx.sampleRate);
  const d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; d[i] = last = (last + 0.02 * w) / 1.02; d[i] *= 3.5; }
  return b;
}
export const sfx = {
  tick: () => blip(1900, 0.012, 0.035, 'square'),
  click: () => { blip(1200, 0.02, 0.12, 'square', 600); },
  ok: () => { blip(660, 0.08, 0.1, 'triangle'); setTimeout(() => blip(990, 0.12, 0.1, 'triangle'), 90); },
  good: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.14, 0.11, 'triangle'), i * 90)); },
  bad: () => { blip(300, 0.2, 0.1, 'sawtooth', 120); },
  pop: () => blip(500, 0.05, 0.1, 'sine', 900),
  thud: () => blip(110, 0.15, 0.16, 'triangle', 50),
  sticker: () => { blip(1300, 0.05, 0.08, 'square'); setTimeout(() => blip(1800, 0.09, 0.08, 'square'), 60); },
  bzzt: () => { blip(70, 0.1, 0.25, 'square', 55); },
  cdSpin, crtHum, crtOff, blip,
};
