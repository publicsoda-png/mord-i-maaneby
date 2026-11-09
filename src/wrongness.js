// The curve. Each event: {id, min (play-minutes earliest), phase, deniable, requires(ctx)→bool, once, run(ctx)}.
// run() receives the game api. Events fire from the hub between tasks (checkWrongness) so timing feels incidental.
import { save, meta, playMin } from './core/state.js';

export const EVENTS = [];
export const ev = (e) => (EVENTS.push(e), e);

export function due(ctx) {
  const m = ctx.devMin ?? playMin();
  return EVENTS.filter((e) => !save.seen[e.id] && m >= e.min && (!e.max || m <= e.max) && (!e.requires || e.requires(ctx)))
    .sort((a, b) => a.min - b.min);
}
/** Fire at most one due event (spacing rule: ≥ 3 min between "stød", 60–70 % must be ignorable). */
export async function checkWrongness(ctx) {
  const list = due(ctx);
  if (!list.length) return false;
  const e = list[0];
  const lastShock = save.flags.lastShockMin ?? -99;
  const m = ctx.devMin ?? playMin();
  if (e.shock && m - lastShock < 3) return false;
  save.seen[e.id] = Date.now();
  if (e.shock) save.flags.lastShockMin = m;
  await e.run(ctx);
  return true;
}

// ---------------- Akt 1 (0–30 min): decoration + first off-notes ----------------
ev({ id: 'klaret_klaret', min: 15, phase: 1, deniable: 'typo', run: (c) => c.flagText('klaret_klaret') });
ev({ id: 'scope_face', min: 17, phase: 1, deniable: 'tilfældigt mønster', run: (c) => c.flagText('scope_face') });
ev({ id: 'fnug_fringe', min: 16, phase: 1, deniable: 'alpha', run: (c) => c.flagText('fnug_fringe') });
ev({ id: 'name_B', min: 18, phase: 1, deniable: 'variabel-fejl', run: (c) => c.flagText('name_B') });
ev({ id: 'bench_gone', min: 28, phase: 1, deniable: 'preload-hak', run: (c) => { c.flagText('bench_gone'); c.musicDelay(20000); } });

// ---------------- Akt 2 (30–55): UI vakler, fake errors, the game knows you ----------------
ev({ id: 'save_lies', min: 30, phase: 2, deniable: 'save-bug', run: (c) => c.flagText('save_lies') });
ev({ id: 'progress_back', min: 33, phase: 2, deniable: 'progress-bug', run: (c) => c.flagText('progress_back') });
ev({ id: 'english_line', min: 38, phase: 2, deniable: 'lokaliseringsrest', run: (c) => c.flagText('english_line') });
ev({ id: 'cd2', min: 40, phase: 2, shock: true, deniable: '2-disc-fejl', run: (c) => c.cd2() });
ev({ id: 'director_err', min: 43, phase: 2, deniable: 'lingo-fejl', run: (c) => c.directorError('traekFra') });
ev({ id: 'knows_time', min: 45, phase: 2, deniable: 'ur-bug', run: (c) => c.knowsTime() });
ev({ id: 'photo1', min: 47, phase: 2, shock: true, deniable: 'scannet placeholder', requires: () => true, run: (c) => c.photo('edb') });
ev({ id: 'seven_missing', min: 35, phase: 2, deniable: 'manglende tast', run: (c) => c.flagText('seven_missing') });
ev({ id: 'peeked', min: 48, phase: 2, deniable: 'random-sprite', requires: () => !!(meta.peeked.teacher || meta.peeked.elev07), run: (c) => c.flagText('peeked') });
ev({ id: 'false_end', min: 50, phase: 2, shock: true, requires: () => Object.values(save.buildings).filter((v) => v >= 2).length >= 5, run: (c) => c.falseEnding() });

// ---------------- Akt 3 (55–90): night, silence, jump, revelation, choice ----------------
ev({ id: 'night_cursor', min: 58, phase: 3, requires: () => save.night, run: (c) => c.cursorDrift(1.5, { x: 420, y: 300 }) });
ev({ id: 'silence_counter', min: 65, phase: 3, shock: true, requires: () => save.night, run: (c) => c.silence(30000) });
ev({ id: 'jump', min: 68, phase: 3, shock: true, requires: () => save.night && save.seen.silence_counter, run: (c) => c.jumpScare() });
ev({ id: 'skole_it', min: 69, phase: 3, requires: () => save.seen.jump, run: (c) => c.skoleIT() });
ev({ id: 'tts_leak', min: 70, phase: 3, requires: () => save.seen.jump, run: (c) => c.flagText('tts_leak') });
ev({ id: 'first_name', min: 75, phase: 3, requires: () => meta.firstName && meta.firstName !== save.name, run: (c) => c.flagText('first_name') });
