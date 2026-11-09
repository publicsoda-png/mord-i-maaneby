// Web Audio: buses, loop music, voice with mouth data, synth SFX (ported from sophie-game sfx.js), sampled SFX,
// era noises and the LYDPLAN §2 signal chain: bitcrusher, telephone filter, convolver rooms, ducking, master clipper.
let ctx = null;
const bus = {};
let current = null; // current music {src, node, gain}
const buffers = new Map();
const chain = {}; // signal-chain nodes we re-route at runtime

export function audioCtx() { return ctx; }
export function ensureAudio() {
  if (ctx) { ctx.state !== 'running' && ctx.resume(); return ctx; }
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state !== 'running') ctx.resume(); // Safari/iOS create it suspended even inside a gesture
  // master → soft clipper (era "slightly too loud") → destination
  bus.master = ctx.createGain();
  chain.clipper = ctx.createWaveShaper(); chain.clipper.curve = tanhCurve(1.6); chain.clipper.oversample = 'none';
  bus.master.connect(chain.clipper).connect(ctx.destination);
  for (const n of ['music', 'voice', 'sfx', 'amb']) bus[n] = ctx.createGain();
  bus.music.gain.value = 0.55; bus.voice.gain.value = 1; bus.sfx.gain.value = 0.8; bus.amb.gain.value = 0.6;
  bus.music.connect(bus.master); bus.amb.connect(bus.master);
  // voice: crusher (8-bit) → [phone BP, bypassed] → lowpass 6800 → dry/room → master
  chain.voiceCrush = ctx.createWaveShaper(); chain.voiceCrush.curve = crushCurve(8);
  chain.phoneHP = ctx.createBiquadFilter(); chain.phoneHP.type = 'highpass'; chain.phoneHP.frequency.value = 20;
  chain.phoneLP = ctx.createBiquadFilter(); chain.phoneLP.type = 'lowpass'; chain.phoneLP.frequency.value = 6800;
  chain.phoneCrush = ctx.createWaveShaper(); chain.phoneCrush.curve = crushCurve(16); // becomes 6-bit when phone is on
  bus.voice.connect(chain.voiceCrush).connect(chain.phoneHP).connect(chain.phoneLP).connect(chain.phoneCrush);
  chain.voiceOut = ctx.createGain(); chain.phoneCrush.connect(chain.voiceOut);
  // sfx: mild crusher
  chain.sfxCrush = ctx.createWaveShaper(); chain.sfxCrush.curve = crushCurve(10);
  chain.sfxOut = ctx.createGain(); bus.sfx.connect(chain.sfxCrush).connect(chain.sfxOut);
  // room: dry gains + convolver send (voice + sfx); dry/wet switched by room()
  chain.dry = ctx.createGain(); chain.dry.gain.value = 1;
  chain.wet = ctx.createGain(); chain.wet.gain.value = 0;
  chain.conv = ctx.createConvolver();
  chain.voiceOut.connect(chain.dry); chain.sfxOut.connect(chain.dry);
  chain.voiceOut.connect(chain.conv); chain.sfxOut.connect(chain.conv);
  chain.conv.connect(chain.wet);
  chain.dry.connect(bus.master); chain.wet.connect(bus.master);
  // ducking: music dips while voice plays (set by duck()/voice())
  chain.duckOn = true; chain.duckGain = ctx.createGain(); chain.duckGain.gain.value = 1;
  bus.music.disconnect(); bus.music.connect(chain.duckGain).connect(bus.master);
  return ctx;
}
export const buses = () => bus;
export function setBus(name, v, t = 0.2) { if (ctx && bus[name]) bus[name].gain.setTargetAtTime(v, ctx.currentTime, t); }

function tanhCurve(g, n = 2048) {
  const c = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; c[i] = Math.tanh(x * g) / Math.tanh(g); }
  return c;
}
function crushCurve(bits, n = 4096) {
  const c = new Float32Array(n), steps = Math.pow(2, bits) / 2;
  for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; c[i] = Math.round(x * steps) / steps; }
  return c;
}

async function load(src) {
  if (buffers.has(src)) return buffers.get(src);
  const alt = src.replace(/\.ogg$/, '.m4a');
  const p = fetch(src).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(src)))
    .then((ab) => ctx.decodeAudioData(ab))
    .catch(() => (alt !== src ? fetch(alt).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(alt))).then((ab) => ctx.decodeAudioData(ab)) : Promise.reject(src)))
    .catch(() => { buffers.delete(src); return null; }); // don't cache failures: a 404 at boot may be a race with the server
  buffers.set(src, p);
  return p;
}
let musicGen = 0, ambGen = 0, activeVoices = 0;
export const preload = (srcs) => (ctx ? Promise.all(srcs.map(load)) : Promise.resolve([]));

/** Loop music. opts: {fade, rate, detune, startDelay, gain, restart} */
export async function music(src, opts = {}) {
  if (!ctx) return;
  if (current && current.src === src && !opts.restart) return;
  stopMusic(opts.fade ?? 0.4);
  if (!src) return;
  const my = ++musicGen;
  const buf = await load(src);
  if (!buf || my !== musicGen) return; // a newer music() call won while we were loading
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
  current = { src, node, gain: g, loops: 0 };
}
export function stopMusic(fade = 0.4) {
  musicGen++; // also cancels a music() still loading
  if (!current) return;
  const { node, gain } = current;
  gain.gain.setTargetAtTime(0, ctx.currentTime, fade);
  setTimeout(() => { try { node.stop(); } catch {} }, fade * 1000 * 4 + 50);
  current = null;
}
export const musicPlaying = () => !!current;
/** Wrongness 30–50: the loop point "hakker" once — loop end moves 250 ms early (the music stutters, deniably). */
export function loopHak(ms = 250) {
  if (!current) return;
  const b = current.node.buffer; current.node.loopEnd = Math.max(1, (current.node.loopEnd || b.duration) - ms / 1000);
}
/** Detune the running music a few cents (plads_b_vakl). */
export function musicDetune(cents, t = 2) { if (current) current.node.detune.setTargetAtTime(cents, ctx.currentTime, t); }

// ---------- ambience ----------
let ambLayers = []; // [{src, node, gain}]
/** Replace all ambience layers with the given list [{src, gain}], crossfading over `fade` seconds. */
export async function ambientLayers(list, fade = 2) {
  if (!ctx) return;
  const gen = ++ambGen;
  const old = ambLayers; ambLayers = [];
  const tau = Math.max(0.05, fade / 3);
  for (const l of old) { l.gain.gain.setTargetAtTime(0, ctx.currentTime, tau); setTimeout(() => { try { l.node.stop(); } catch {} }, tau * 1000 * 6 + 100); } // ≥6τ so the stop is inaudible
  const bufs = await Promise.all(list.map((l) => load(l.src)));
  if (gen !== ambGen) return; // a newer ambientLayers() call owns the bus now
  list.forEach(({ src, gain }, i) => {
    const buf = bufs[i]; if (!buf) return;
    const node = ctx.createBufferSource(); node.buffer = buf; node.loop = true;
    const g = ctx.createGain(); g.gain.value = 0;
    node.connect(g).connect(bus.amb); node.start();
    g.gain.setTargetAtTime(gain, ctx.currentTime, tau);
    ambLayers.push({ src, node, gain: g });
  });
}
/** Backwards-compatible single ambient loop. */
export const ambient = (src, gain = 1) => ambientLayers(src ? [{ src, gain }] : [], 1);

// ---------- signal chain switches (driven by mix.js) ----------
/** Telephone filter on the helper's voice (LYDPLAN §6 trin 2): BP 300–3400 + 6-bit crush. */
export function phone(on) {
  if (!ctx) return;
  const t = ctx.currentTime;
  chain.phoneHP.frequency.setTargetAtTime(on ? 300 : 20, t, 0.5);
  chain.phoneLP.frequency.setTargetAtTime(on ? 3400 : 6800, t, 0.5);
  chain.phoneCrush.curve = crushCurve(on ? 6 : 16);
}
/** Room: null (dry, "inside the program"), 'edb' (small hard room), 'tomt' (long, no walls). */
export async function room(name) {
  if (!ctx) return;
  const t = ctx.currentTime;
  if (!name) { chain.wet.gain.setTargetAtTime(0, t, 0.3); chain.dry.gain.setTargetAtTime(1, t, 0.3); return; }
  const buf = await load(`assets/sfx/ir_${name}.wav`);
  if (!buf) return;
  chain.conv.buffer = buf;
  chain.wet.gain.setTargetAtTime(name === 'tomt' ? 0.9 : 0.55, t, 0.3);
  chain.dry.gain.setTargetAtTime(name === 'tomt' ? 0.5 : 0.8, t, 0.3);
}
/** Ducking on/off. When off (min 45+), music and voice fight. */
export function duck(on) { chain.duckOn = !!on; if (ctx && !on) chain.duckGain.gain.setTargetAtTime(1, ctx.currentTime, 0.3); }
function duckNow(on) { if (!ctx || !chain.duckOn) return; chain.duckGain.gain.setTargetAtTime(on ? 0.5 : 1, ctx.currentTime, on ? 0.08 : 0.4); }
/** Mute everything (incl. ambience) for ms — the 3 s after the jump scare. */
export function muteAll(ms) {
  if (!ctx) return;
  const t = ctx.currentTime;
  bus.master.gain.setValueAtTime(0, t);
  bus.master.gain.setValueAtTime(1, t + ms / 1000);
}

/** Play a voice clip; returns {done: Promise, mouth(t)→0..3}. Mouth data = JSON array of 0..3 per 80 ms.
 *  opts.silent: play the mouth data but no sound (night: mouth moves, no voice). */
export async function voice(src, mouthJson, opts = {}) {
  if (!ctx) return { done: Promise.resolve(), mouth: () => 0, dur: 0 };
  const [buf, mouth] = await Promise.all([load(src), mouthJson ? fetch(mouthJson).then((r) => (r.ok ? r.json() : null)).catch(() => null) : null]);
  if (!buf) return { done: Promise.resolve(), mouth: () => 0, dur: 0 };
  const node = ctx.createBufferSource(); node.buffer = buf;
  const g = ctx.createGain(); g.gain.value = opts.silent ? 0 : 1;
  node.connect(g).connect(bus.voice);
  const t0 = ctx.currentTime;
  node.start(t0);
  if (!opts.silent) { activeVoices++; duckNow(true); }
  let ended = false;
  const end = () => { if (ended) return; ended = true; if (!opts.silent && --activeVoices <= 0) { activeVoices = 0; duckNow(false); } };
  const done = new Promise((r) => (node.onended = () => { end(); r(); }));
  return { done, dur: buf.duration, stop: () => { end(); try { node.stop(); } catch {} }, mouth: () => {
    const t = ctx.currentTime - t0;
    if (mouth) return mouth[Math.floor(t / 0.08)] ?? 0;
    return t < buf.duration ? 1 + Math.floor((Math.sin(t * 19) + 1) * 1.49) : 0;
  } };
}

// ---------- sampled SFX (assets/sfx/*.ogg, m4a fallback) ----------
/** play('mg_bold_boing', {gain, detune, rate, pan, to:'sfx'|'amb'|'master'}) → source node (or null). */
export async function play(name, opts = {}) {
  if (!ready()) return null;
  const buf = await load(`assets/sfx/${name}.ogg`);
  if (!buf) return null;
  const s = ctx.createBufferSource(); s.buffer = buf;
  if (opts.detune) s.detune.value = opts.detune;
  if (opts.rate) s.playbackRate.value = opts.rate;
  const g = ctx.createGain(); g.gain.value = opts.gain ?? 1;
  let last = s.connect(g);
  if (opts.pan !== undefined && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = opts.pan; last = last.connect(p); }
  last.connect(bus[opts.to || 'sfx']);
  s.start(ctx.currentTime + (opts.delay || 0));
  return s;
}
/** The one jump scare (≤300 ms, hard clipped, bypasses the soft clipper) followed by total silence. */
export async function jump(silenceMs = 3000) {
  if (!ready()) return;
  const buf = await load('assets/sfx/wr_jump.ogg');
  const t = ctx.currentTime;
  if (buf) { const s = ctx.createBufferSource(); s.buffer = buf; const g = ctx.createGain(); g.gain.value = 1.0; s.connect(g).connect(ctx.destination); s.start(t); }
  bus.master.gain.setValueAtTime(0, t + 0.3);
  // Council 10-11 (alle tre dommere): lyden kommer IKKE tilbage af sig selv. Master forbliver mutet, indtil
  // spilleren selv gør noget (klik/tast) efter minimum-stilheden — one-shot gate; klik under stilheden ignoreres.
  jumpGate = true;
  const minUntil = Date.now() + 300 + silenceMs;
  const release = () => {
    if (!jumpGate || Date.now() < minUntil) return;
    jumpGate = false;
    window.removeEventListener('pointerdown', release, true); window.removeEventListener('keydown', release, true);
    bus.master.gain.setTargetAtTime(1, ctx.currentTime, 0.6);
  };
  window.addEventListener('pointerdown', release, true); window.addEventListener('keydown', release, true);
}
let jumpGate = false;
/** True while the post-jump-scare silence holds (scenes may draw the black frame meanwhile). */
export function jumpSilent() { return jumpGate; }
/** 144 Fnugger: text ticks from everywhere — the first time the game uses stereo. */
export function stereoTicks(n = 24, spreadMs = 1800) {
  if (!ready()) return;
  for (let i = 0; i < n; i++) {
    const pan = Math.sin(i * 2.399) ; // golden-angle spread
    setTimeout(() => blip(1700 + Math.random() * 500, 0.012, 0.035, 'square', undefined, 'sfx', pan), Math.random() * spreadMs);
  }
}

// ---------- synth SFX ----------
function ready() { return ctx && ctx.state === 'running'; }
export function blip(f, dur = 0.05, gain = 0.06, type = 'square', f1 = f, to = 'sfx', pan) {
  if (!ready()) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f1 !== f) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let last = o.connect(g);
  if (pan !== undefined && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; last = last.connect(p); }
  last.connect(bus[to]);
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
  for (let i = 0; i < 6; i++) setTimeout(() => blip(90 + Math.random() * 60, 0.012, 0.18, 'square'), 350 + i * (180 + Math.random() * 240));
}
export function crtHum(on = true) {
  if (!ready()) return;
  if (crtHum.node) { try { crtHum.node.stop(); } catch {} crtHum.node = null; }
  if (!on) return;
  const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sawtooth'; o.frequency.value = 50; o2.type = 'sine'; o2.frequency.value = 15625 / 2;
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
// Text tick: synth by default; mix.js switches it to the sampled telephone crackle once the helper phones in.
let tickKind = 'tick';
export function setTickSound(kind) { tickKind = kind; }
const synthTick = () => blip(1900, 0.012, 0.035, 'square');
export const sfx = {
  tick: () => (tickKind === 'telefon' ? play('wr_telefon_knitren', { gain: 0.5 }) : synthTick()),
  click: () => { blip(1200, 0.02, 0.12, 'square', 600); },
  ok: () => { blip(660, 0.08, 0.1, 'triangle'); setTimeout(() => blip(990, 0.12, 0.1, 'triangle'), 90); },
  /** ok, one semitone flat — "Gemt!" lies (min 32). */
  okFlat: () => { blip(623, 0.08, 0.1, 'triangle'); setTimeout(() => blip(934, 0.12, 0.1, 'triangle'), 90); },
  good: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.14, 0.11, 'triangle'), i * 90)); },
  /** "Godt klaret klaret": good twice, 90 ms apart (min 15). */
  goodGood: () => { sfx.good(); setTimeout(sfx.good, 90); },
  bad: () => { blip(300, 0.2, 0.1, 'sawtooth', 120); },
  pop: () => blip(500, 0.05, 0.1, 'sine', 900),
  thud: () => blip(110, 0.15, 0.16, 'triangle', 50),
  sticker: () => { blip(1300, 0.05, 0.08, 'square'); setTimeout(() => blip(1800, 0.09, 0.08, 'square'), 60); },
  bzzt: () => { blip(70, 0.1, 0.25, 'square', 55); },
  cdSpin, crtHum, crtOff, blip, play, jump, stereoTicks, muteAll,
};
