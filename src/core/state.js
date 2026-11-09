// Save (progress) in localStorage mirrored to IndexedDB; meta (what the game "remembers") only in IndexedDB.
// Everything is best-effort: the game must run with no storage at all (private window, artifact iframe).
const LS_KEY = 'maaneby.save.v1';
const DB = 'maaneby', STORE = 'kv';

export const save = {
  name: '', grade: 3, lang: 'da',
  buildings: {},      // id → 0..3 (0 = not built)
  stickers: [],
  playMs: 0,          // accumulated play time (drives the wrongness curve)
  flags: {},          // story flags
  act: 1, night: false,
  seen: {},           // wrongness ids fired
};
export const meta = {
  starts: 0, firstName: '', names: [], lastSeen: 0, resets: 0, deletedLog: false, peeked: {}, helpClicks: 0, ending: null, finishedTowns: 11203,
};
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
  if (s && typeof s === 'object') Object.assign(save, s);
  const m = await idbGet('meta');
  if (m && typeof m === 'object') Object.assign(meta, m);
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
  Object.assign(save, { name: '', grade: 3, buildings: {}, stickers: [], playMs: 0, flags: {}, act: 1, night: false, seen: {} });
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
