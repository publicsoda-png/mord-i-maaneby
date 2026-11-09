// Procedural placeholder backgrounds in a "Bryce render" spirit (grey-blue moon, Earth, dark nebula sky).
// They stand in until Higgsfield PNG8 renders land in assets/bg; API stays the same: bg(name, night) → canvas.
import { proc, rng, W, H } from '../core/stage.js';

function sky(g, night, r) {
  const grd = g.createLinearGradient(0, 0, 0, 220);
  if (night) { grd.addColorStop(0, '#02020a'); grd.addColorStop(1, '#0a0618'); }
  else { grd.addColorStop(0, '#0b0620'); grd.addColorStop(0.6, '#2a1140'); grd.addColorStop(1, '#4a1d4f'); }
  g.fillStyle = grd; g.fillRect(0, 0, W, 240);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.65})`; g.fillRect(Math.floor(r() * W), Math.floor(r() * 200), 1 + (r() < 0.1 ? 1 : 0), 1); }
  // Earth
  g.fillStyle = night ? '#1b3a66' : '#3f7fd0';
  g.beginPath(); g.arc(560, 60, 26, 0, 7); g.fill();
  g.fillStyle = night ? '#21513a' : '#49a05a';
  g.beginPath(); g.ellipse(552, 56, 9, 13, 0.5, 0, 7); g.fill(); g.beginPath(); g.ellipse(570, 70, 7, 5, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(566, 48, 10, 3, -0.4, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(548, 50, 8, 0, 7); g.fill();
}
function terrain(g, night, r, { craters = 14, band = 0 } = {}) {
  const top = 180 + band;
  const grd = g.createLinearGradient(0, top, 0, H);
  if (night) { grd.addColorStop(0, '#2a2e3c'); grd.addColorStop(1, '#0f1119'); }
  else { grd.addColorStop(0, '#b9bccb'); grd.addColorStop(0.5, '#8d93a8'); grd.addColorStop(1, '#5f6478'); }
  g.fillStyle = grd;
  g.beginPath(); g.moveTo(0, top + 30);
  for (let x = 0; x <= W; x += 40) g.lineTo(x, top + 24 * Math.sin(x / 70) + r() * 14);
  g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  // far ridge
  g.fillStyle = night ? '#1a1d28' : '#6e7389';
  g.beginPath(); g.moveTo(0, top + 36);
  for (let x = 0; x <= W; x += 24) g.lineTo(x, top + 20 + 22 * Math.abs(Math.sin(x / 41)) * (0.6 + r() * 0.8));
  g.lineTo(W, top + 70); g.lineTo(0, top + 70); g.closePath(); g.fill();
  for (let i = 0; i < craters; i++) {
    const cx = r() * W, cy = top + 70 + r() * (H - top - 90), rr = 8 + r() * 36;
    g.fillStyle = night ? 'rgba(0,0,0,.45)' : 'rgba(60,64,84,.55)';
    g.beginPath(); g.ellipse(cx, cy, rr, rr * 0.45, 0, 0, 7); g.fill();
    g.fillStyle = night ? 'rgba(90,96,120,.35)' : 'rgba(230,232,240,.75)';
    g.beginPath(); g.ellipse(cx, cy - rr * 0.1, rr * 0.9, rr * 0.3, 0, Math.PI, 2 * Math.PI); g.fill();
    g.fillStyle = night ? 'rgba(20,22,30,.6)' : 'rgba(80,84,104,.6)';
    g.beginPath(); g.ellipse(cx, cy + rr * 0.08, rr * 0.75, rr * 0.3, 0, 0, Math.PI); g.fill();
  }
  // hard "raytraced" shadow of the frame edge, Bryce style
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, top + 20, W, 6);
}
// Rendered backgrounds (assets/bg/<name>.png, <name>_nat.png — PNG8 from tools/art/retro.py) win over the procedural ones.
const IMGS = new Map();
export function loadBgs(names) {
  return Promise.all(names.flatMap((n) => [n, n + '_nat']).map((key) => new Promise((res) => {
    const im = new Image(); im.onload = () => { IMGS.set(key, im); res(true); }; im.onerror = () => res(false); im.src = `assets/bg/${key}.png`;
  })));
}
export const hasBg = (name, night = false) => IMGS.has(name + (night ? '_nat' : ''));
export function bg(name, night = false) {
  const im = IMGS.get(name + (night ? '_nat' : '')) || (night && IMGS.get(name) && darken(name));
  if (im) return im;
  return proc(name + (night ? '@n' : ''), (g) => {
    const r = rng(name.length * 977 + 13);
    sky(g, night, r);
    switch (name) {
      case 'hub': terrain(g, night, r, { craters: 16 }); break;
      case 'landing': terrain(g, night, r, { craters: 5, band: 40 });
        // landing pad
        g.fillStyle = night ? '#23262f' : '#c9ccd8'; g.beginPath(); g.ellipse(320, 390, 190, 48, 0, 0, 7); g.fill();
        g.strokeStyle = night ? '#4b4f60' : '#ffd34a'; g.lineWidth = 4; g.beginPath(); g.ellipse(320, 390, 150, 34, 0, 0, 7); g.stroke();
        g.fillStyle = night ? '#3c3f4c' : '#ff8a3c'; g.fillRect(312, 352, 16, 16);
        break;
      case 'bakery': terrain(g, night, r, { craters: 3, band: 60 });
        g.fillStyle = night ? '#2a2420' : '#d9b48a'; g.fillRect(120, 150, 400, 250);
        g.fillStyle = night ? '#1b1816' : '#8a5a3a'; g.fillRect(120, 150, 400, 20); g.fillRect(120, 380, 400, 100);
        break;
      case 'school': terrain(g, night, r, { craters: 2, band: 80 });
        g.fillStyle = night ? '#1c1c1c' : '#e4e1d6'; g.fillRect(0, 120, W, 300);
        g.fillStyle = night ? '#0a2a1a' : '#234d2b'; g.fillRect(60, 150, 320, 150); // chalkboard
        g.strokeStyle = night ? '#4a3a1a' : '#8b6b3a'; g.lineWidth = 8; g.strokeRect(60, 150, 320, 150);
        g.fillStyle = night ? '#141414' : '#c7b89a'; g.fillRect(420, 160, 190, 130); // notice board
        break;
      default: terrain(g, night, r);
    }
  });
}
/** Night fallback when no _nat render exists: the day render, cold and dark, one window left lit (cached). */
function darken(name) {
  return proc(name + '@dark', (g) => {
    g.drawImage(IMGS.get(name), 0, 0);
    g.fillStyle = 'rgba(6,8,24,.72)'; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'saturation'; g.fillStyle = '#334'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
  });
}
/** Fnug: fluffy grey tuft with a helmet; frame 0..2 pose; back=true shows its back. */
// Rendered sprites (assets/sprites/<name>.png, chroma-keyed PNG8 from retro.py --mode sprite). Fnug sheet = frames side by side, each frame square-ish.
const SPR = new Map();
export function loadSprites(names) {
  return Promise.all(names.map((n) => new Promise((res) => {
    const im = new Image(); im.onload = () => { SPR.set(n, im); res(true); }; im.onerror = () => res(false); im.src = `assets/sprites/${n}.png`;
  })));
}
export const sprite = (name) => SPR.get(name);
/** Fnug = one of a flock of different retro aliens: assets/sprites/aliens.png is a grid (3×3 per sheet, several sheets stacked
 *  vertically or side by side); `id` picks the species. frame 1 = step (1 px up), frame 2 = look (flipped). */
export function drawFnug(g, x, y, s = 1, { frame = 0, back = false, fringe = false, night = false, id = 0 } = {}) {
  const im = SPR.get('aliens');
  if (im) {
    // sheet is always 3 columns of square cells, any number of rows (sheets stacked vertically by tools/art/aliens.py)
    const cols = 3, cw = im.width / cols, rows = Math.max(1, Math.round(im.height / cw)), ch = im.height / rows, cells = cols * rows;
    const c = ((id % cells) + cells) % cells, sx = (c % cols) * cw, sy = Math.floor(c / cols) * ch;
    const h = 48 * s, w = h * cw / ch, dy = frame === 1 ? -1 : 0;
    g.save();
    if (night) g.filter = 'brightness(.45) saturate(.6)';
    if (back || frame === 2) { g.translate(x, y); g.scale(-1, 1); g.translate(-x, -y); }
    g.drawImage(im, sx, sy, cw, ch, Math.round(x - w / 2), Math.round(y - h) + dy, Math.round(w), Math.round(h));
    g.restore();
    if (fringe) { g.strokeStyle = '#ff00ff'; g.lineWidth = 1; g.strokeRect(Math.round(x - w / 2) + 0.5, Math.round(y - h) + 0.5, Math.round(w) - 1, Math.round(h) - 1); }
    return;
  }
  g.save(); g.translate(x, y); g.scale(s, s);
  if (fringe) { g.fillStyle = '#ff00ff'; g.beginPath(); g.arc(0, -14, 15, 0, 7); g.fill(); }
  g.fillStyle = night ? '#55585f' : '#b9b7ae';
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; g.beginPath(); g.arc(Math.cos(a) * 8, -14 + Math.sin(a) * 8, 7, 0, 7); g.fill(); }
  g.beginPath(); g.arc(0, -14, 11, 0, 7); g.fill();
  // helmet
  g.fillStyle = night ? '#9a7a16' : '#ffd21f'; g.beginPath(); g.arc(0, -22, 10, Math.PI, 2 * Math.PI); g.fill(); g.fillRect(-12, -22, 24, 3);
  if (!back) {
    g.fillStyle = '#fff'; g.beginPath(); g.arc(-4, -14, 3.2, 0, 7); g.arc(4, -14, 3.2, 0, 7); g.fill();
    g.fillStyle = '#111'; g.beginPath(); g.arc(-4 + (frame === 2 ? 1 : 0), -14, 1.5, 0, 7); g.arc(4 + (frame === 2 ? 1 : 0), -14, 1.5, 0, 7); g.fill();
    g.strokeStyle = '#333'; g.lineWidth = 1; g.beginPath(); g.arc(0, -9, 3, 0.2, Math.PI - 0.2); g.stroke();
  }
  // feet
  g.fillStyle = '#333'; g.fillRect(-7, -2 + (frame === 1 ? -2 : 0), 5, 3); g.fillRect(2, -2 + (frame === 1 ? 2 : 0), 5, 3);
  g.restore();
}
/** Building sprite by stage 0..3 (0 = empty plot, 1 wobbly, 2 plain, 3 fine). */
export function drawBuilding(g, x, y, stage, kind, night = false) {
  // rendered building: assets/sprites/bld_<kind>.png = 3 stages side by side (2:3 cells), ground line at the bottom
  const im = stage > 0 && SPR.get('bld_' + kind);
  if (im) {
    const fw = im.width / 3, fh = im.height, h = 72, w = Math.round(h * fw / fh), f = Math.min(2, stage - 1);
    g.save(); if (night) g.filter = 'brightness(.4) saturate(.5)';
    g.drawImage(im, f * fw, 0, fw, fh, Math.round(x - w / 2), y - h + 4, w, h); g.restore();
    return;
  }
  g.save(); g.translate(x, y);
  const base = night ? '#2c2f3a' : '#dfe1ea', dark = night ? '#15171f' : '#8d93a8', accent = night ? '#5a4610' : '#ffbf2f';
  if (stage === 0) {
    g.fillStyle = night ? 'rgba(40,44,56,.9)' : 'rgba(120,124,140,.8)'; g.fillRect(-26, -4, 52, 10);
    g.fillStyle = night ? '#555' : '#fff'; g.fillRect(-2, -22, 4, 18); g.fillStyle = accent; g.fillRect(2, -22, 14, 9);
    g.restore(); return;
  }
  const lean = stage === 1 ? -0.12 : 0;
  g.rotate(lean);
  const h = 26 + stage * 10, w = 40 + stage * 6;
  g.fillStyle = dark; g.fillRect(-w / 2 + 3, -h + 4, w, h);
  g.fillStyle = base; g.fillRect(-w / 2, -h, w, h);
  if (kind === 'dome' || stage >= 2) { g.fillStyle = base; g.beginPath(); g.arc(0, -h, w / 2, Math.PI, 2 * Math.PI); g.fill(); g.fillStyle = dark; g.beginPath(); g.arc(0, -h, w / 2, Math.PI * 1.1, Math.PI * 1.5); g.lineTo(0, -h); g.fill(); }
  g.fillStyle = night ? '#ffd58a' : '#3b4a7a';
  for (let i = 0; i < stage + 1; i++) g.fillRect(-w / 2 + 6 + i * 12, -h + 10, 7, 9);
  if (stage === 1) { g.strokeStyle = '#6b5a3a'; g.lineWidth = 2; g.strokeRect(-w / 2 - 4, -h - 6, w + 8, h + 6); }
  if (stage === 3) { g.fillStyle = '#e33'; g.fillRect(-2, -h - 16, 2, 16); g.fillRect(0, -h - 16, 10, 6); }
  g.restore();
}
