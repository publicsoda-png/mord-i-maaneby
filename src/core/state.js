// Save (progress) in localStorage mirrored to IndexedDB; meta (what the game "remembers") only in IndexedDB.
// Everything is best-effort: the game must run with no storage at all (private window, artifact iframe).
// Meta remembers ONLY things inside Måneby (docs/RETNING.md): no names, no peeks, nothing from the player's world.
const LS_KEY = 'maaneby.save.v1';
const DB = 'maaneby', STORE = 'kv';
export const SAVE_VERSION = 2;

const saveDefaults = () => ({
  name: '', grade: 3, lang: 'da',
  buildings: {},      // id → 0..3 (0 = not built)
  stickers: [],
  playMs: 0,          // accumulated play time (drives the wrongness curve)
  flags: {},          // story flags
  act: 1, night: false,
  seen: {},           // wrongness ids fired
  wrongCount: 0,      // wrong answers in the minigames (task.js/engine onWrong) — read by byen_taeller
  version: SAVE_VERSION,
});
export const save = saveDefaults();
const metaDefaults = () => ({
  starts: 0, lastSeen: 0, resets: 0, helpClicks: 0, qClicks: 0, ending: null, finishedTowns: 11203, version: SAVE_VERSION,
});
export const meta = metaDefaults();
let dirty = false;
export const flag = (k, v) => { if (v === undefined) return save.flags[k]; save.flags[k] = v; dirty = true; };

function idb() {
  return new Promise((res) => {
    try {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(null);
    } catch { res(null); }
  });
}
async function idbGet(k) {
  const db = await idb(); if (!db) return null;
  return new Promise((res) => { try { const q = db.transaction(STORE).objectStore(STORE).get(k); q.onsuccess = () => res(q.result ?? null); q.onerror = () => res(null); } catch { res(null); } });
}
async function idbSet(k, v) {
  const db = await idb(); if (!db) return;
  try { db.transaction(STORE, 'readwrite').objectStore(STORE).put(JSON.parse(JSON.stringify(v)), k); } catch {}
}

export async function loadState() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch {}
  if (!s) s = await idbGet('save');
  if (s && typeof s === 'object') {
    if ((s.version | 0) >= SAVE_VERSION) Object.assign(save, s);
    else { // v1 save: nothing carried over — the town starts from scratch
      try { localStorage.removeItem(LS_KEY); } catch {}
      idbSet('save', null);
    }
  }
  const m = await idbGet('meta');
  if (m && typeof m === 'object') {
    Object.assign(meta, m);
    if ((m.version | 0) < SAVE_VERSION) { // v1 meta: drop every field v2 does not know (names, peeks, deleted files …)
      const keep = metaDefaults();
      for (const k of Object.keys(meta)) if (!(k in keep)) delete meta[k];
      meta.version = SAVE_VERSION;
    }
  }
  meta.starts++;
  meta.lastSeen = Date.now();
  await idbSet('meta', meta);
  return { save, meta };
}
export function persist(force = false) {
  if (!dirty && !force) return;
  dirty = false;
  try { localStorage.setItem(LS_KEY, JSON.stringify(save)); } catch {}
  idbSet('save', save);
}
export function persistMeta() { idbSet('meta', meta); }
export function touch() { dirty = true; }
/** "Start forfra" — wipes save but NOT meta (meta remembers that you did). */
export function resetSave() {
  meta.resets++; persistMeta();
  try { localStorage.removeItem(LS_KEY); } catch {}
  idbSet('save', null);
  Object.assign(save, saveDefaults()); // incl. wrongCount = 0 and version
  dirty = true; persist(true);
}
/** The ending wipes everything (ending b) — kept for later; not used by "stille morgen". */
export async function wipeAll() {
  try { localStorage.clear(); } catch {}
  const db = await idb(); if (db) try { db.transaction(STORE, 'readwrite').objectStore(STORE).clear(); } catch {}
}
// play clock
let last = performance.now();
export function tickClock() {
  const now = performance.now();
  if (document.visibilityState === 'visible') save.playMs += now - last;
  last = now;
}
export const playMin = () => save.playMs / 60000;
setInterval(() => { tickClock(); persist(); }, 5000);
addEventListener('beforeunload', () => persist(true));
