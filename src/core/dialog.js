// Narrator text box: typewriter + tick, click to skip/advance, big helper sprite bottom-left with beard-sync, optional voice.
// Text is rasterised 1-bit on the 640 grid (canvas), never DOM text.
import { sfx, voice as playVoice } from './audio.js';
import { drawPortrait } from '../art/portrait.js';
import { sprite } from '../art/placeholder.js';
import { meta, persistMeta } from './state.js';
import { text1bit } from './stage.js';
import { voiceFor } from '../voicemap.js';

const box = document.getElementById('dialog');
const more = document.getElementById('dmore');
const tc = document.getElementById('dtextc').getContext('2d');
const hc = document.getElementById('helper');
const pc = hc.getContext('2d');
pc.imageSmoothingEnabled = false; tc.imageSmoothingEnabled = false;
const FONT = '700 15px "Comic Neue","Comic Sans MS",sans-serif';

export const helper = { present: true, mood: 'calm', night: false, mouth: 0, silentMouth: false, visible: false };
let waiting = null;
let skipping = false;
let sayGen = 0; // an older auto-say must never hide a newer one (QC: hourglass forever when answering during "Prøv igen")

box.addEventListener('pointerdown', (e) => { e.stopPropagation(); advance(); });
box.addEventListener('contextmenu', (e) => e.preventDefault());
document.getElementById('app').addEventListener('pointerdown', () => { if (!box.hidden) advance(); });
function advance() { if (waiting) { const w = waiting; waiting = null; w(); } else skipping = true; }

/** Word-wrap and rasterise text 1-bit onto the dialog canvas. */
let wrapW = 596;
function renderText(str) {
  tc.clearRect(0, 0, 600, 60);
  const words = str.split(' '); const lines = []; let line = '';
  for (const w of words) { const test = line ? line + ' ' + w : w; if (text1bit(test, FONT).width > wrapW && line) { lines.push(line); line = w; } else line = test; }
  if (line) lines.push(line);
  lines.slice(0, 3).forEach((l, i) => tc.drawImage(text1bit(l, FONT, '#fff', '#000'), 0, i * 20));
}

let raf = null;
function animateHelper(mouthFn) {
  cancelAnimationFrame(raf);
  const loop = () => { helper.mouth = mouthFn ? mouthFn() : 0; drawHelper(); raf = requestAnimationFrame(loop); };
  loop();
}
// WP8: the empty rocking chair (same chair, same pixel position as frame 0) when the helper is gone at night
// WP1 (era rule, no canvas filters): night versions are baked PNG8 files (tools/art/nightlut.py) — *_nat.png
const load = (src) => { const i = new Image(); i.onload = () => drawHelper(); i.src = src; return i; };
const chairImg = load('assets/sprites/helper_chair.png'), chairNat = load('assets/sprites/helper_chair_nat.png'), helperNat = load('assets/sprites/helper_nat.png');
const ok = (i) => i.complete && i.naturalWidth > 0;
export function drawHelper() {
  pc.clearRect(0, 0, 130, 250);
  hc.classList.toggle('hidden', !helper.visible);
  if (!helper.visible) return;
  const im = sprite('helper');
  if (im && !helper.present && ok(chairImg)) {
    const ch = helper.night && ok(chairNat) ? chairNat : chairImg;
    const fw = im.width / Math.max(1, Math.round(im.width / (im.height / 2)));
    const k = Math.min(130 / fw, 250 / im.height), w = Math.round(ch.width * k), h = Math.round(ch.height * k);
    pc.imageSmoothingEnabled = false; pc.drawImage(ch, Math.round((130 - w) / 2), 250 - h, w, h);
    return;
  }
  if (im && helper.present) {
    // rendered full-body helper: sheet of mouth frames side by side (frames ~1:2), contained in 130×250, bottom-anchored
    const src = helper.night && ok(helperNat) && helperNat.width === im.width ? helperNat : im;
    const n = Math.max(1, Math.round(im.width / (im.height / 2))), fw = im.width / n, f = Math.min(n - 1, helper.mouth || 0);
    const k = Math.min(130 / fw, 250 / im.height), w = Math.round(fw * k), h = Math.round(im.height * k);
    pc.imageSmoothingEnabled = false; pc.drawImage(src, f * fw, 0, fw, im.height, Math.round((130 - w) / 2), 250 - h, w, h);
    return;
  }
  // portrait.js draws 96×112; scale ×1.35 and sit it at the bottom of the 130×250 sprite box
  pc.save(); pc.translate(0, 98); pc.scale(1.354, 1.354); drawPortrait(pc, helper, true); pc.restore();
}
export function showHelper(v) { helper.visible = v; drawHelper(); }
export function hideDialog() { box.hidden = true; cancelAnimationFrame(raf); drawHelper(); }

/** say(text, opts): voice, mouth, cps, hold, auto, noPortrait, pauseAt, keep */
export async function say(text, opts = {}) {
  if (!opts.voice && !opts.noPortrait) { const v = voiceFor(text); if (v) opts = { ...opts, ...v }; }
  const gen = ++sayGen;
  if (waiting) { const w = waiting; waiting = null; w(); } // release an older say() that is waiting for a click
  box.hidden = false;
  // keep the text clear of DOM buttons sitting in the box's zone (hub's Gem/Luk top-left) — QC: lines were clipped under them
  const inBox = [...document.querySelectorAll('#ui .btn')].filter((b) => parseFloat(b.style.top) < 76);
  const inset = inBox.length ? Math.max(...inBox.map((b) => parseFloat(b.style.left) + b.offsetWidth)) + 12 : 12;
  box.style.paddingLeft = inset + 'px'; wrapW = 620 - inset;
  renderText('');
  more.style.visibility = 'hidden';
  skipping = false;
  let v = null, vAt = 0;
  // the typewriter starts at once; the voice joins when its buffer is ready (QC: text used to wait seconds for the load on live)
  const vp = opts.voice ? playVoice(opts.voice, opts.mouth, { silent: !!opts.silent }).then((r) => { v = r; vAt = performance.now(); return r; }) : null; // silent = real mouth data, no sound (min 60)
  const msPerChar = 1000 / (opts.cps ?? 28);
  const pace = () => { // once the voice is in: spread the remaining characters over the remaining voice time
    if (!v || !v.dur) return msPerChar;
    const left = v.dur * 1000 - (performance.now() - vAt), chars = Math.max(1, text.length - shown);
    return Math.max(msPerChar, left / chars);
  };
  const talking = !opts.noPortrait && helper.present;
  let shown = 0;
  animateHelper(() => (!talking ? 0 : v ? v.mouth() : helper.silentMouth || (shown < text.length ? 1 + ((shown >> 1) % 3) : 0)));
  let lastTick = 0;
  while (shown < text.length) {
    if (gen !== sayGen) { if (v && v.stop) v.stop(); return; } // a newer say() took over the box
    if (skipping) { shown = text.length; renderText(text); break; }
    shown++;
    renderText(text.slice(0, shown));
    const ch = text[shown - 1];
    if (!v && !opts.silent && ch !== ' ' && performance.now() - lastTick > 38) { sfx.tick(); lastTick = performance.now(); }
    let d = pace();
    if (opts.pauseAt && opts.pauseAt[shown]) d = opts.pauseAt[shown];
    else if (ch === '…') d = 420; else if (/[.!?]/.test(ch)) d = 260; else if (ch === ',') d = 120;
    await sleep(d);
  }
  if (vp) { await vp; if (gen !== sayGen) { if (v && v.stop) v.stop(); return; } }
  if (v) { if (skipping && v.stop) v.stop(); else await v.done; }
  if (gen !== sayGen) return; // superseded while talking
  animateHelper(null);
  if (opts.hold) await sleep(opts.hold);
  if (opts.auto) { await sleep(opts.auto); if (gen === sayGen && opts.keep !== true) hideDialog(); return; }
  if (gen !== sayGen) return;
  more.style.visibility = 'visible';
  skipping = false;
  await new Promise((r) => (waiting = r));
  if (gen !== sayGen) return;
  more.style.visibility = 'hidden';
  if (opts.keep !== true) hideDialog();
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export function countHelpClick() { meta.helpClicks++; persistMeta(); return meta.helpClicks; }
drawHelper();
