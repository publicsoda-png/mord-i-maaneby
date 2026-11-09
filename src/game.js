// The api the wrongness table drives: small, named effects that scenes read via flags or that run directly.
// RETNING 09-11 "Regnskabet": every effect comes from inside Måneby (no clock, no camera photo, no second disc, no school IT).
import { save, meta, touch } from './core/state.js';
import { say, helper } from './core/dialog.js';
import { msgBox, directorError as dirErr, sleep, showOS } from './core/os.js';
import { paletteFlash, ctx, W, H } from './core/stage.js';
import { sfx, stopMusic } from './core/audio.js';
import { goto } from './core/scene.js';
import { bg } from './art/placeholder.js';

const osLayer = document.getElementById('os');
// Same positions as hub.js FNUG_POS (11 on the plain) + the twelfth, half inside the Rådhus volume (x≈320, y≈262).
const FNUG_RAW = [[190, 440], [300, 395], [420, 360], [560, 420], [170, 370], [240, 280], [470, 300], [360, 440], [250, 450], [600, 290], [520, 460], [320, 262]];
const HALL = { x: 320, y: 255 }; // PLOTS 'hall'

function osOpen() { showOS(true); osLayer.style.background = 'transparent'; osLayer.innerHTML = ''; }

export const gameApi = {
  devMin: undefined,
  hud({ shown }) { save.flags.fnugShown = shown; touch(); },
  flagText(id) { save.flags[id] = true; touch(); },
  musicDelay(ms) { save.flags.musicDelayMs = ms; touch(); },

  /** min 40 — "Måneby er fuld." A program dialog that cannot be closed for 10 s; Gentag → bzzt + palette flash; hub then says "Fjerne? Det gør vi ikke." */
  async fuld() {
    osOpen();
    const r = await msgBox({ title: 'Regn med Måneby', icon: 'warn', msg: 'Måneby er fuld.\nFjern noget, og tryk Gentag.', buttons: [{ label: 'Gentag', value: 'retry', def: true }, { label: 'Annuller', value: 'cancel' }], lockMs: 10000, parent: osLayer });
    showOS(false);
    if (r === 'retry') { sfx.bzzt(); await paletteFlash(2, 'rot'); }
    save.flags.fuld_said = false;
    save.flags.fjerne = true; // hub.js: say('Fjerne? Det gør vi ikke.') once, then clear the flag
    touch();
  },

  async directorError(handler) {
    osOpen();
    await dirErr(handler, { parent: osLayer });
    showOS(false);
  },

  /** min 45 — the town adds up what you did. Text + tick only, no voice. */
  async byenTaeller() {
    const h = meta.helpClicks || 0, w = save.wrongCount || 0, q = meta.qClicks || 0;
    save.flags.byen_taeller = true; touch();
    await say(`Du har klikket på mig ${h} gange. Svaret forkert ${w} gange. Kigget på Rådhuset ${q} gange. Jeg lægger det sammen: ${h + w + q}.`, { hold: 900, silent: true });
  },

  /** min 47 — 2.6 s raw render: the hub background through a flat grey LUT (no sky), 12 flat grey Fnug silhouettes,
   *  the twelfth half inside the Rådhus box (box drawn after it = z-sorting error). Hard cut in and out, no crossfade. */
  async raaRender() {
    const src = bg('hub', false);
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const g = off.getContext('2d');
    g.drawImage(src, 0, 0, W, H);
    try {
      const id = g.getImageData(0, 0, W, H), d = id.data, skyTo = Math.floor(H * 0.4);
      const LUT = [0x3a, 0x5c, 0x7e, 0xa0]; // 4 grey steps
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        let v;
        if (y < skyTo) v = 0x6e; // sky: fully flat
        else { const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; v = LUT[Math.min(3, Math.floor(l / 64))]; }
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
      }
      g.putImageData(id, 0, 0);
    } catch (e) { g.fillStyle = '#6e6e6e'; g.fillRect(0, 0, W, H); g.fillStyle = '#5c5c5c'; g.fillRect(0, Math.floor(H * 0.4), W, H); }
    // flat grey silhouettes — body + head, no faces, no details
    const sil = (x, y) => { g.fillStyle = '#4a4a4a'; g.beginPath(); g.ellipse(x, y - 12, 11, 14, 0, 0, Math.PI * 2); g.fill(); g.fillRect(x - 7, y - 4, 14, 8); g.beginPath(); g.ellipse(x, y - 30, 8, 8, 0, 0, Math.PI * 2); g.fill(); };
    FNUG_RAW.forEach(([x, y]) => sil(x, y));
    // the Rådhus volume, drawn AFTER the twelfth so its lower half is clipped (z-sorting error). Opaque. No window, no text.
    g.fillStyle = '#8a8a8a'; g.fillRect(HALL.x - 30, HALL.y - 46, 60, 50);
    g.fillStyle = '#5c5c5c'; g.fillRect(HALL.x - 30, HALL.y - 46, 60, 6);
    const t0 = performance.now();
    await new Promise((res) => {
      const f = () => { ctx.drawImage(off, 0, 0); if (performance.now() - t0 < 2600) requestAnimationFrame(f); else res(); };
      f();
    });
    save.flags.raa_render_done = true; touch();
  },

  async falseEnding() { goto(meta.ending && save.flags.hall_answer === undefined ? 'trueEnd' : 'falseEnd'); }, // 2. gennemspilning uden svar på Rådhuset → skjult slutning
  cursorDrift() { save.flags.cursor_drift = true; touch(); },

  /** min 65 — the counter goes silent for ms; afterwards the Rådhus "?" is a door. */
  async silence(ms) {
    stopMusic(0.1); helper.present = false; save.flags.silence_on = true;
    const { lock } = await import('./core/scene.js');
    lock(true); await sleep(ms); lock(false);
    save.flags.silence_on = false;
    save.flags.hall_door = true;
    touch();
  },

  async jumpScare() { goto('jump'); },

  /** min 69 — "Rådhuset melder": the normal info dialog with the normal ding (msgBox plays os_ding_info for icon 'info'). [Luk] does nothing. */
  async raadhusMelder() {
    osOpen();
    await msgBox({ title: 'Rådhuset melder', icon: 'info', msg: '12 bor i Måneby.\n11 står på sletten.\nByen stemmer.', buttons: [{ label: 'Luk', value: 'x', noop: true, def: true }, { label: 'OK', value: 'ok' }], parent: osLayer, w: 320 });
    showOS(false);
  },
};
