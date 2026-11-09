// The api the wrongness table drives: small, named effects that scenes read via flags or that run directly.
import { save, meta, touch, persist } from './core/state.js';
import { say, helper } from './core/dialog.js';
import { msgBox, directorError as dirErr, sleep, showOS } from './core/os.js';
import { paletteFlash, ctx, W, H } from './core/stage.js';
import { cur } from './core/cursor.js';
import { sfx, stopMusic, music } from './core/audio.js';
import { goto } from './core/scene.js';

const osLayer = document.getElementById('os');
export const gameApi = {
  devMin: undefined,
  hud({ shown }) { save.flags.fnugShown = shown; touch(); },
  flagText(id) { save.flags[id] = true; touch(); },
  musicDelay(ms) { save.flags.musicDelayMs = ms; touch(); },
  async cd2() {
    showOS(true); osLayer.style.background = 'transparent'; osLayer.innerHTML = '';
    sfx.cdSpin(1.6);
    const r = await msgBox({ title: 'Regn med Måneby', icon: 'warn', msg: 'Indsæt CD 2, og tryk på Gentag.', buttons: [{ label: 'Gentag', value: 'retry', def: true }, { label: 'Annuller', value: 'cancel' }], lockMs: 10000, parent: osLayer });
    showOS(false);
    if (r === 'retry') { sfx.bzzt(); await paletteFlash(2, 'rot'); }
  },
  async directorError(handler) {
    showOS(true); osLayer.style.background = 'transparent'; osLayer.innerHTML = '';
    await dirErr(handler, { parent: osLayer });
    showOS(false);
  },
  async knowsTime() {
    const days = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
    const d = new Date();
    await say(`Det er ${days[d.getDay()]}. Klokken er 15:40. Det var den også dengang.`, { hold: 800 });
  },
  async photo(which) {
    // Material break: a "real" 2005 compact-camera photo. Placeholder = dark room with date stamp until the render lands.
    const img = new Image(); img.src = `assets/photos/${which}.png`;
    await new Promise((r) => { img.onload = r; img.onerror = r; });
    const t0 = performance.now();
    await new Promise((res) => {
      const f = () => {
        ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W, H);
        if (img.naturalWidth) ctx.drawImage(img, 0, 0, W, H);
        else { ctx.fillStyle = '#2b2b2b'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#3c3c3c'; for (let i = 0; i < 4; i++) ctx.fillRect(60 + i * 140, 220, 110, 90); }
        ctx.fillStyle = '#ffb000'; ctx.font = '700 22px "Courier New", monospace'; ctx.fillText('17 11 2005', 470, 450);
        if (performance.now() - t0 < 2600) requestAnimationFrame(f); else res();
      };
      f();
    });
  },
  async falseEnding() { goto('falseEnd'); },
  cursorDrift(px, toward) { cur.lag = 0.15; cur.pull = toward; cur.pullK = 0.02; cur.drift = { x: px, y: 0 }; },
  async silence(ms) { stopMusic(0.1); helper.present = false; await sleep(ms); },
  async jumpScare() { goto('jump'); },
  async skoleIT() {
    showOS(true); osLayer.style.background = 'transparent'; osLayer.innerHTML = '';
    await msgBox({ title: 'Meddelelse fra Skole-IT', icon: 'info', msg: 'Grundet opdatering slettes elevdata den 1/12.\n\nKære elev: luk programmet.', buttons: [{ label: 'Luk', value: 'x', noop: true, def: true }, { label: 'OK', value: 'ok' }], parent: osLayer, w: 320 });
    showOS(false);
  },
};
