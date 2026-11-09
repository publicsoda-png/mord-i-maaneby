// Fake Windows 2000 layer: desktop, windows, message boxes, progress dialogs, Director script-error box.
import { play } from './audio.js';
const os = document.getElementById('os');
export const osEl = os;
let z = 10;

export function showOS(on) { os.classList.toggle('off', !on); }

export function desktop({ user = 'elev01', icons = [] } = {}) {
  os.innerHTML = '';
  os.style.background = '#3a6ea5';
  for (const ic of icons) {
    const d = document.createElement('div');
    d.className = 'desk-icon';
    d.style.left = ic.x + 'px'; d.style.top = ic.y + 'px';
    d.innerHTML = `<div class="ico" style="${ic.style || ''}">${ic.svg || ''}</div><span>${ic.label}</span>`;
    let clicks = 0, tmr;
    d.addEventListener('pointerdown', () => {
      os.querySelectorAll('.desk-icon.sel').forEach((x) => x.classList.remove('sel'));
      d.classList.add('sel');
      clicks++; clearTimeout(tmr); tmr = setTimeout(() => (clicks = 0), 450);
      if (clicks >= 2) { clicks = 0; ic.onOpen && ic.onOpen(); }
    });
    os.appendChild(d);
  }
  const tb = document.createElement('div');
  tb.className = 'taskbar';
  const t = new Date();
  tb.innerHTML = `<div class="start"><i></i>Start</div><div class="tray">${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}</div>`;
  os.appendChild(tb);
  return { user };
}

/** Generic window. Returns element + close(). */
export function win({ title = '', x = 160, y = 140, w = 300, body = '', closable = true, onClose = null, parent = os }) {
  const d = document.createElement('div');
  d.className = 'win';
  d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.width = w + 'px'; d.style.zIndex = ++z;
  d.innerHTML = `<div class="title"><b>${title}</b>${closable ? '<span class="x">×</span>' : ''}</div><div class="content">${body}</div>`;
  const close = () => { d.remove(); onClose && onClose(); };
  if (closable) d.querySelector('.x').addEventListener('click', close);
  parent.appendChild(d);
  return { el: d, close, content: d.querySelector('.content') };
}

/**
 * Message box. icon: warn|err|info. buttons: [{label, value, disabled, def}].
 * opts.lockMs: buttons stay disabled for that long (the "Indsæt CD 2" trick). Resolves with value.
 */
export function msgBox({ title, msg, icon = 'warn', buttons = [{ label: 'OK', value: 'ok', def: true }], x = 190, y = 170, w = 280, lockMs = 0, parent = os, silent = false }) {
  if (!silent) play(icon === 'err' || icon === 'warn' ? 'os_ding_fejl' : 'os_ding_info'); // the one "normal" sound left in act 3
  return new Promise((res) => {
    const iconHtml = icon === 'err' ? '<div class="ico err">×</div>' : icon === 'info' ? '<div class="ico info">i</div>' : '<div class="ico warn"></div>';
    const b = `<div class="body">${iconHtml}<div class="msg">${msg}</div></div><div class="btns">${buttons.map((bt, i) => `<button class="wbtn${bt.def ? ' def' : ''}" data-i="${i}" ${bt.disabled || lockMs ? 'disabled' : ''}>${bt.label}</button>`).join('')}</div>`;
    const { el, close } = win({ title, x, y, w, body: b, closable: false, parent });
    el.querySelectorAll('.wbtn').forEach((btn) => btn.addEventListener('click', () => { const bt = buttons[+btn.dataset.i]; if (bt.noop) return; close(); res(bt.value); }));
    if (lockMs) setTimeout(() => el.querySelectorAll('.wbtn').forEach((btn, i) => (btn.disabled = !!buttons[i].disabled)), lockMs);
  });
}

/** Loading dialog with a progress bar that moves in jerks. set(p) 0..1, text(s), close(). */
export function progressBox({ title = 'Indlæser…', text = 'Henter data fra cd-rom…', x = 170, y = 190, w = 300, parent = os } = {}) {
  const { el, close } = win({ title, x, y, w, body: `<div class="msg" style="padding:8px 12px 0">${text}</div><div class="progress"><i></i></div><div class="msg" style="padding:0 12px 10px;text-align:right" data-pct>0 %</div>`, closable: false, parent });
  const bar = el.querySelector('.progress i'), pct = el.querySelector('[data-pct]'), msg = el.querySelector('.msg');
  return { el, close, set(p) { bar.style.width = Math.round(p * 100) + '%'; pct.textContent = Math.round(p * 100) + ' %'; }, text(s) { msg.textContent = s; } };
}
/** Dramatised progress: jerky steps, pauses, optional backwards step. */
export async function fakeProgress(box, { ms = 2600, back = false } = {}) {
  let p = 0; const t0 = performance.now();
  while (p < 1) {
    await sleep(80 + Math.random() * 500);
    const el = (performance.now() - t0) / ms;
    p = Math.min(1, Math.max(p, el) + Math.random() * 0.09);
    if (back && p > 0.6 && p < 0.8 && Math.random() < 0.5) { box.set(0.44); await sleep(600); }
    box.set(p);
  }
  await sleep(250);
}

/** Director projector style script error. */
export function directorError(handler = 'mouseUp', opts = {}) {
  return msgBox({ title: 'Script Error', icon: 'err', msg: `Script error: Handler not defined\n#${handler}`, buttons: [{ label: 'Debug', value: 'debug', disabled: true }, { label: 'Continue', value: 'continue', def: true }], w: 300, ...opts });
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
