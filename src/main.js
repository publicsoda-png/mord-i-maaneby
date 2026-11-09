// Boot: load state, register scenes, dev params, go.
import './core/stage.js';
import './core/cursor.js';
import { goto } from './core/scene.js';
import { loadState, save } from './core/state.js';
import { gameApi } from './game.js';
import './scenes/boot.js';
import './scenes/hub.js';
import './scenes/task.js';
import { ensureAudio } from './core/audio.js';
import { showOS } from './core/os.js';
import { showCursor } from './core/cursor.js';

const q = new URLSearchParams(location.search);
await loadState();
if (q.has('min')) gameApi.devMin = +q.get('min');
if (q.has('nat')) save.night = true;
if (q.has('name')) save.name = q.get('name');
if (q.has('reset')) { localStorage.clear(); }

window.MB = { save, gameApi, goto };
if (q.has('dev') && q.get('scene')) {
  // Skip the desktop chrome in dev: first click starts audio
  showOS(false); document.getElementById('app').style.visibility = 'visible'; showCursor(true);
  addEventListener('pointerdown', () => ensureAudio(), { once: true });
  const { PLOTS } = await import('./scenes/hub.js');
  const plot = q.get('plot') && PLOTS.find((p) => p.id === q.get('plot'));
  goto(q.get('scene'), plot || { first: q.has('first') });
} else goto('desktop');
