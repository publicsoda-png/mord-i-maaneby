// Narrator text box: typewriter + tick, click to skip/advance, portrait with mouth/beard frames, optional voice.
import { sfx, voice as playVoice } from './audio.js';
import { drawPortrait } from '../art/portrait.js';
import { meta, persistMeta } from './state.js';

const box = document.getElementById('dialog');
const txt = document.getElementById('dtext');
const more = document.getElementById('dmore');
const pc = document.getElementById('portrait').getContext('2d');
pc.imageSmoothingEnabled = false;

export const helper = { present: true, mood: 'calm', night: false, mouth: 0, silentMouth: false };
let waiting = null; // resolver for "click to continue"
let skipping = false;

box.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (waiting) { const w = waiting; waiting = null; w(); } else skipping = true; });
box.addEventListener('contextmenu', (e) => e.preventDefault());
document.getElementById('app').addEventListener('pointerdown', () => { if (waiting) { const w = waiting; waiting = null; w(); } else if (!box.hidden) skipping = true; });

let portraitTimer = null;
function animatePortrait(mouthFn) {
  cancelAnimationFrame(portraitTimer);
  const loop = () => {
    helper.mouth = mouthFn ? mouthFn() : 0;
    drawPortrait(pc, helper);
    portraitTimer = requestAnimationFrame(loop);
  };
  loop();
}
export function hideDialog() { box.hidden = true; cancelAnimationFrame(portraitTimer); }

/**
 * say(text, opts): opts.voice (ogg path), opts.mouth (json), opts.cps (chars per sec), opts.hold (ms to wait before
 * ▼ appears), opts.auto (ms: auto-advance), opts.noPortrait, opts.pauseAt ({index: ms}) for "……" dread pauses.
 */
export async function say(text, opts = {}) {
  box.hidden = false;
  box.querySelector('.portrait').style.visibility = opts.noPortrait || !helper.present ? 'hidden' : 'visible';
  txt.textContent = '';
  more.style.visibility = 'hidden';
  skipping = false;
  let v = null;
  if (opts.voice) v = await playVoice(opts.voice, opts.mouth);
  const msPerChar = 1000 / (opts.cps ?? 28);
  // if a voice clip exists, pace the text to the clip
  const pace = v && v.dur ? Math.max(msPerChar, (v.dur * 1000) / Math.max(1, text.length)) : msPerChar;
  animatePortrait(() => (v ? v.mouth() : helper.silentMouth || (txt.textContent.length < text.length ? 1 + ((txt.textContent.length >> 1) % 3) : 0)));
  let i = 0, lastTick = 0;
  while (i < text.length) {
    if (skipping) { txt.textContent = text; break; }
    i++;
    txt.textContent = text.slice(0, i);
    const ch = text[i - 1];
    if (!v && ch !== ' ' && performance.now() - lastTick > 38) { sfx.tick(); lastTick = performance.now(); }
    let d = pace;
    if (opts.pauseAt && opts.pauseAt[i]) d = opts.pauseAt[i];
    else if (ch === '…') d = 420; else if (/[.!?]/.test(ch)) d = 260; else if (ch === ',') d = 120;
    await sleep(d);
  }
  if (v) { v.stop && skipping && v.stop(); if (!skipping) await v.done; }
  animatePortrait(null);
  if (opts.hold) await sleep(opts.hold);
  if (opts.auto) { await sleep(opts.auto); return; }
  more.style.visibility = 'visible';
  skipping = false;
  await new Promise((r) => (waiting = r));
  more.style.visibility = 'hidden';
  if (opts.keep !== true) hideDialog();
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Count help-clicks across sessions (B. clicked 400 times). */
export function countHelpClick() { meta.helpClicks++; persistMeta(); return meta.helpClicks; }
