// Easter eggs and global keys (PLAN §4, let meta — no speedrun references).
import { save, meta, touch, persistMeta } from './core/state.js';
import { say } from './core/dialog.js';
import { msgBox, showOS } from './core/os.js';
import { current, locked } from './core/scene.js';
import { sfx } from './core/audio.js';

const osLayer = document.getElementById('os');
const onPages = location.hostname.endsWith('github.io');
const inHub = () => current && current.id === 'hub' && !locked;

async function osBox(opts) {
  showOS(true); osLayer.style.background = 'transparent'; osLayer.innerHTML = '';
  const r = await msgBox({ parent: osLayer, ...opts });
  showOS(false);
  return r;
}

export function installEggs() {
  // document.title / favicon drift — only on Pages, only after the night has started
  if (onPages && save.night) document.title = 'Mord i Måneby';

  // Esc ×3 → the close dialog (third button only at night, after the jump)
  let esc = 0, escT = 0;
  addEventListener('keydown', async (e) => {
    if (e.key === 'Escape') {
      const now = performance.now(); esc = now - escT < 1500 ? esc + 1 : 1; escT = now;
      if (esc >= 3 && inHub()) { esc = 0; window.MB?.luk?.(); }
    }
    // Ctrl+P → Byggebevis
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault(); sfx.click();
      const built = Object.keys(save.buildings).length;
      const akt3 = save.night || save.flags.morning;
      await osBox({ title: 'Udskriv', icon: 'info', w: 330, msg: akt3
        ? `BYGGEBEVIS\n\nRådhuss  ✕\n\nBygmester: ${meta.ending ? 'B.' : save.name}\nDato: 17-11-2005\n\nPrinteren "SKOLE-IT_04" svarer ikke.`
        : `BYGGEBEVIS\n\nHermed bevidnes, at ${save.name} har bygget ${built} ${built === 1 ? 'bygning' : 'bygninger'} i Måneby.\n\nKrater Multimedie ApS, Valby\n\nPrinteren "SKOLE-IT_04" svarer ikke.`,
        buttons: [{ label: 'OK', value: 'ok', def: true }] });
    }
    // typed CD2 on the hub → bonus room (a second-disc leftover)
    typed = (typed + e.key.toUpperCase()).slice(-3);
    if (typed === 'CD2' && inHub() && !save.flags.cd2room) { save.flags.cd2room = true; touch(); await say('Der er ingen cd 2. Der skulle have været en. Den hed "Måneby i Verden".', { auto: 2600, noPortrait: true }); }
  });
  let typed = '';

  // idle 2 min → "Er du der stadig?" ; 20 fast clicks → "Hold op."
  let lastInput = performance.now(), clicks = [];
  addEventListener('pointerdown', () => {
    lastInput = performance.now();
    clicks.push(lastInput); clicks = clicks.filter((t) => lastInput - t < 2500);
    if (clicks.length >= 20 && inHub()) { clicks = []; say('Hold op.', { auto: 1200, noPortrait: true }); }
  });
  addEventListener('keydown', () => (lastInput = performance.now()));
  setInterval(() => {
    if (performance.now() - lastInput > 120000 && inHub() && !save.flags.morning) { lastInput = performance.now(); say(save.night ? 'Er du der stadig?' : 'Er du der stadig?', { auto: 2200 }); }
  }, 5000);

  // window too small → "Det hjælper ikke."
  let smallSaid = false;
  addEventListener('resize', () => { if (innerWidth < 640 && !smallSaid && inHub()) { smallSaid = true; say('Det hjælper ikke.', { auto: 1500, noPortrait: true }); } });

  // not Danish → "Du er ikke herfra." (once, at first hub visit)
  if (!/^da/i.test(navigator.language) && !meta.notFromHere) { meta.notFromHere = true; persistMeta(); setTimeout(() => inHub() && say('Du er ikke herfra.', { auto: 1800, noPortrait: true }), 20000); }

  // calendar eggs (reading real date — deniable as "the program knows the clock")
  const d = new Date();
  save.flags.season = d.getMonth() === 11 ? 'jul' : d.getMonth() === 5 && d.getDate() === 23 ? 'sankthans' : null;
  save.flags.lateNight = d.getHours() >= 22 || d.getHours() < 5;
}
