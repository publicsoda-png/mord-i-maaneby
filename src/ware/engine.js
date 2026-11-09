// Minigame runner, ported from sophie-game/src/ware/engine.js: a game is {setup(api)} building DOM sprites in #field;
// ends via api.done(result). No fuse/metronome here — Måneby tasks are untimed unless a game adds its own clock.
import { sfx } from '../core/audio.js';
import { cur } from '../core/cursor.js';

const field = document.getElementById('field');
let curG = null;

function finish(me, result) {
  if (me.done) return;
  me.done = true;
  me.iv.forEach(clearInterval); me.to.forEach(clearTimeout); me.anims.forEach((a) => a.pause());
  me.raf = false;
  field.innerHTML = ''; field.style.pointerEvents = 'none';
  me.resolve(result);
}
const local = () => ({ x: cur.x, y: cur.y });
field.addEventListener('pointerdown', (e) => { if (!curG || curG.done) return; e.preventDefault(); e.stopPropagation(); curG.down = local(); curG.tap && curG.tap(e, curG.down); });
field.addEventListener('pointermove', (e) => { if (!curG || curG.done || !curG.move) return; if (e.pointerType === 'mouse' && !e.buttons && !curG.hover) return; curG.move(e, local()); });
const up = (e) => { if (!curG || curG.done) return; curG.up && curG.up(e, local()); curG.down = null; };
field.addEventListener('pointerup', up); field.addEventListener('pointercancel', up);
field.addEventListener('contextmenu', (e) => e.preventDefault());

export function stopGame() { if (curG && !curG.done) finish(curG, { ok: false, aborted: true }); curG = null; }

/** Run a game; resolves with whatever the game passes to api.done(). */
export function playGame(G, opts = {}) {
  return new Promise((resolve) => {
    const me = (curG = { done: false, resolve, iv: [], to: [], anims: [], tap: null, move: null, up: null, down: null, hover: false, raf: true });
    field.innerHTML = ''; field.style.pointerEvents = 'auto';
    const api = {
      W: 640, H: 480, field, sfx, opts,
      add(cls, html = '', css = {}) { const d = document.createElement('div'); d.className = 'o ' + cls; d.innerHTML = html; Object.assign(d.style, css); field.appendChild(d); return d; },
      /** Sprite box centred at (cx,cy) with a canvas you draw into. */
      spr(cx, cy, w, h, draw, css = {}) {
        const d = api.add('', '', { width: w + 'px', height: h + 'px', left: cx - w / 2 + 'px', top: cy - h / 2 + 'px', ...css });
        const c = document.createElement('canvas'); c.width = w; c.height = h; c.style.cssText = 'width:100%;height:100%;image-rendering:pixelated';
        d.appendChild(c); d.g = c.getContext('2d'); d.g.imageSmoothingEnabled = false;
        d.redraw = (...a) => { d.g.clearRect(0, 0, w, h); draw(d.g, ...a); };
        d.at = (x, y) => { d.style.left = x - w / 2 + 'px'; d.style.top = y - h / 2 + 'px'; };
        d.redraw(0); return d;
      },
      text(str, x, y, css = {}) { return api.add('t', str, { left: x + 'px', top: y + 'px', font: '700 15px "Comic Neue","Comic Sans MS",sans-serif', color: '#fff', textShadow: '1px 1px 0 #000', whiteSpace: 'nowrap', ...css }); },
      btn(label, x, y, on, css = {}) { const b = api.add('btn', label, { left: x + 'px', top: y + 'px', position: 'absolute', ...css }); b.style.pointerEvents = 'auto'; b.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (!me.done) on(e); }); return b; },
      on(node, fn) { node.style.pointerEvents = 'auto'; node.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (curG === me && !me.done) fn(e, local(), e.button); }); },
      every(t, fn) { me.iv.push(setInterval(() => !me.done && fn(), t)); },
      after(t, fn) { me.to.push(setTimeout(() => !me.done && fn(), t)); },
      frame(fn) { let last = performance.now(); const t0 = last; const loop = (t) => { if (me.done || curG !== me) return; fn(Math.min(0.05, (t - last) / 1000), (t - t0) / 1000); last = t; requestAnimationFrame(loop); }; requestAnimationFrame(loop); },
      tap(fn) { me.tap = fn; }, move(fn, hover = false) { me.move = fn; me.hover = hover; }, up(fn) { me.up = fn; },
      anim(node, kf, opt) { const a = node.animate(kf, opt); me.anims.push(a); return a; },
      pos: local,
      done: (result) => finish(me, result),
      sleep: (ms) => new Promise((r) => me.to.push(setTimeout(r, ms))),
    };
    G.setup(api);
  });
}
