// Easter eggs and global keys (PLAN §4, RETNING 09-11). Nothing reads the player's world: no clock, no calendar, no language, no window size.
import { save, meta, touch } from './core/state.js';
import { say } from './core/dialog.js';
import { msgBox, showOS } from './core/os.js';
import { current, locked } from './core/scene.js';
import { sfx } from './core/audio.js';

const osLayer = document.getElementById('os');
const inHub = () => current && current.id === 'hub' && !locked;

async function osBox(opts) {
  showOS(true); osLayer.style.background = 'transparent'; osLayer.innerHTML = '';
  const r = await msgBox({ parent: osLayer, ...opts });
  showOS(false);
  return r;
}

export function installEggs() {
  // Esc ×3 → the close dialog [Ja][Nej][Hende] (hub.js owns the dialog)
  let esc = 0, escT = 0, typed = '';
  addEventListener('keydown', async (e) => {
    if (e.key === 'Escape') {
      const now = performance.now(); esc = now - escT < 1500 ? esc + 1 : 1; escT = now;
      if (esc >= 3 && inHub()) { esc = 0; window.MB?.luk?.(); }
    }
    // Ctrl+P → Byggebevis on screen (from Krater Multimedie; no printer line)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault(); sfx.click();
      const built = Object.keys(save.buildings).length;
      const akt3 = save.night || save.flags.morning;
      const tolv = meta.ending === 'tolv';
      await osBox({ title: 'Udskriv', icon: 'info', w: 330, msg: akt3 || tolv
        ? `BYGGEBEVIS\n\nRådhuset  ✕\nFnugger: 12 (${tolv ? 12 : 11})\n\nBygmester: ${save.name}`
        : `BYGGEBEVIS\n\nHermed bevidnes, at ${save.name} har bygget ${built} ${built === 1 ? 'bygning' : 'bygninger'} i Måneby.\n\nKrater Multimedie ApS, Valby`,
        buttons: [{ label: 'OK', value: 'ok', def: true }] });
      return;
    }
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toUpperCase()).slice(-5);
    // typed SYV on the hub → "Det navn bruger vi ikke mere." (once)
    if (typed.slice(-3) === 'SYV' && inHub() && !save.flags.syv_said) { save.flags.syv_said = true; touch(); await say('Det navn bruger vi ikke mere.', { auto: 2200 }); return; }
    // typed MINUS on the hub before the morning → "Det ord kender jeg ikke." (once)
    if (typed === 'MINUS' && inHub() && !save.flags.morning && !save.flags.minus_said) { save.flags.minus_said = true; touch(); await say('Det ord kender jeg ikke.', { auto: 2000 }); }
  });

  // idle 2 min: day → "Bygmester? Fnuggerne venter." ; night → no line, one Fnug turns its head (hub.js reads save.flags.idle_look)
  // 20 fast clicks → "Hold op."
  let lastInput = performance.now(), clicks = [];
  addEventListener('pointerdown', () => {
    lastInput = performance.now();
    clicks.push(lastInput); clicks = clicks.filter((t) => lastInput - t < 2500);
    if (clicks.length >= 20 && inHub()) { clicks = []; say('Hold op.', { auto: 1200, noPortrait: true }); }
  });
  addEventListener('keydown', () => (lastInput = performance.now()));
  setInterval(() => {
    if (performance.now() - lastInput > 120000 && inHub() && !save.flags.morning) {
      lastInput = performance.now();
      if (save.night) { save.flags.idle_look = performance.now(); touch(); }
      else say('Bygmester? Fnuggerne venter.', { auto: 2200 });
    }
  }, 5000);
}
