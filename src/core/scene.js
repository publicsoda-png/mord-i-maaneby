// Scene manager: scenes are objects {id, bg(ctx, state), hotspots:[{x,y,w,h | poly, cursor, label, on}], enter(g), exit(), tick(dt)}.
import { ctx, W, H, drawText } from './stage.js';
import { cur, setCursor, tickCursor } from './cursor.js';
import { save, tickClock } from './state.js';

const ui = document.getElementById('ui');
export const scenes = new Map();
export let current = null;
let hover = null;
const buttons = new Set();

export function register(s) { scenes.set(s.id, s); return s; }

export async function goto(id, arg) {
  const next = scenes.get(id);
  if (!next) throw new Error('no scene ' + id);
  if (current && current.exit) await current.exit();
  clearButtons();
  hover = null;
  current = next;
  save.scene = id;
  if (next.enter) await next.enter(arg);
}

function hit(p) {
  if (!current || !current.hotspots) return null;
  const list = typeof current.hotspots === 'function' ? current.hotspots() : current.hotspots;
  for (let i = list.length - 1; i >= 0; i--) {
    const h = list[i];
    if (h.hidden && h.hidden()) continue;
    if (h.poly) { if (inPoly(p, h.poly)) return h; }
    else if (p.x >= h.x && p.y >= h.y && p.x < h.x + h.w && p.y < h.y + h.h) return h;
  }
  return null;
}
function inPoly(p, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
export let locked = false;
export function lock(v) { locked = v; }
const app = document.getElementById('app');
app.addEventListener('pointerdown', (e) => {
  if (locked) return;
  if (e.target.closest('#dialog, .btn, .input, .chip, #field .o, .win')) return;
  const h = hit({ x: cur.x, y: cur.y });
  if (h && h.on) { e.preventDefault(); h.on(e.button, { x: cur.x, y: cur.y }); }
  else if (current && current.click) current.click({ x: cur.x, y: cur.y }, e.button);
});
app.addEventListener('contextmenu', (e) => e.preventDefault());

/** DOM button on the stage (stone slab). Returns element; auto-removed on scene change unless keep. */
export function button(label, x, y, on, opts = {}) {
  const b = document.createElement('div');
  b.className = 'btn' + (opts.cls ? ' ' + opts.cls : '');
  b.textContent = label;
  b.style.left = x + 'px'; b.style.top = y + 'px';
  if (opts.w) b.style.width = opts.w + 'px';
  b.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (!locked) on(e); });
  ui.appendChild(b);
  buttons.add(b);
  return b;
}
export function clearButtons() { buttons.forEach((b) => b.remove()); buttons.clear(); ui.querySelectorAll('.input,.chip').forEach((x) => x.remove()); }

// ---------- main loop ----------
let last = performance.now();
export const fx = []; // {draw(ctx,t), until}
function frame(t) {
  const dt = Math.min(0.05, (t - last) / 1000); last = t;
  tickClock();
  if (current) {
    if (current.bg) current.bg(ctx, dt, t);
    if (current.tick) current.tick(dt, t);
    if (current.draw) current.draw(ctx, dt, t);
    const h = locked ? null : hit({ x: cur.x, y: cur.y });
    if (h !== hover) { hover = h; }
    setCursor(h && h.on ? h.cursor || 'hand' : locked ? 'wait' : 'arrow');
    if (hover && hover.label && !locked) drawText(hover.label, Math.min(W - 10, cur.x + 14), Math.min(H - 20, cur.y + 18), { font: '700 12px "Comic Neue","Comic Sans MS",sans-serif', color: '#fff', outline: '#000' });
  }
  for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.draw(ctx, t); if (f.until && t > f.until) fx.splice(i, 1); }
  tickCursor();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
