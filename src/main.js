// Boot: load state, register scenes, dev params, go.
import './core/stage.js';
import './core/cursor.js';
import { goto } from './core/scene.js';
import { loadState, save } from './core/state.js';
import { gameApi } from './game.js';
import './scenes/boot.js';
import './scenes/hub.js';
import { loadGames } from './scenes/task.js';
import './scenes/acts.js';
import { ensureAudio } from './core/audio.js';
import { showCursor } from './core/cursor.js';
import { installEggs } from './eggs.js';
import { loadBgs, loadSprites } from './art/placeholder.js';

const q = new URLSearchParams(location.search);
await loadState();
await loadGames();
await loadBgs(['hub', 'landing', 'bakery', 'ice', 'scope', 'school', 'quarry', 'hall', 'light', 'title']);
await loadSprites(['aliens', 'helper', 'bld_pad', 'bld_dome', 'bld_tower', 'bld_box', 'bld_pit', 'bld_hall']);
if (q.has('min')) { gameApi.devMin = +q.get('min'); globalThis.MB_DEV_MIN = gameApi.devMin; if (q.has('dev') && !q.has('allev')) { const { EVENTS } = await import('./wrongness.js'); for (const e of EVENTS) if (e.min < gameApi.devMin && !(e.id in save.seen)) save.seen[e.id] = 1; } } // mix.js reads MB_DEV_MIN so ?min= drives the sound phase too
if (q.has('nat')) save.night = true;
if (q.has('name')) save.name = q.get('name');
if (q.has('reset')) { localStorage.clear(); }
// WP4 dev: ?dev&scene=hub&built=bakery:2 → plot starts at step 1 and the buildSwap reward animation to step 2 runs at enter
// (window.MB.devSwap() re-runs it). Hub-owner: hub.js itself calls buildSwap from justBuilt — see src/art/fx.js header.
let devBuilt = null;
if (q.has('built')) { const [plot, st] = q.get('built').split(':'); const step = Math.max(1, Math.min(3, +st || 1)); devBuilt = { plot, step }; save.buildings[plot] = step - 1; }

window.MB = { save, gameApi, goto, devBuilt };
installEggs();
if (q.has('dev') && q.get('scene')) {
  // Dev: spring identen over — første klik tænder lyden
  showCursor(true);
  addEventListener('pointerdown', () => ensureAudio(), { once: true });
  const { PLOTS } = await import('./scenes/hub.js');
  const plot = q.get('plot') && PLOTS.find((p) => p.id === q.get('plot'));
  if (q.get('scene') !== 'desktop' && q.get('scene') !== 'ident') { const { showOS } = await import('./core/os.js'); showOS(false); } // #os ligger over #app (z 40) og slås normalt fra af boot.js — ved dev-start direkte i en scene dækkede det hele spillet med blåt
  await goto(q.get('scene'), plot || { first: q.has('first') });
  if (devBuilt) {
    const { buildSwap } = await import('./art/fx.js');
    const { bg } = await import('./art/placeholder.js');
    const p = PLOTS.find((x) => x.id === devBuilt.plot);
    window.MB.devSwap = async () => { if (!p) return; save.buildings[p.id] = devBuilt.step - 1; await buildSwap(p, devBuilt.step - 1, devBuilt.step, { night: save.night, bg: bg('hub', save.night), onShow: () => { save.buildings[p.id] = devBuilt.step; } }); };
    if (q.get('scene') === 'hub') window.MB.devSwap();
  }
} else goto('ident');
