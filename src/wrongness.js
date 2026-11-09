// The curve. Each event: {id, min (play-minutes earliest), phase, deniable, requires(ctx)→bool, once, run(ctx)}.
// run() receives the game api. Events fire from the hub between tasks (checkWrongness) so timing feels incidental.
// RETNING 09-11 "Regnskabet": everything stays inside Måneby — no clock, no name memory, no school IT, no second disc.
import { save, meta, playMin } from './core/state.js';

// Loudness exceptions, declared before the gate runs (G3 anti-cheat rule). Everything else must sit at voice −16 / music −18 LUFS.
// qc-whitelist: byen_minus1 byen_minus2 byen_minus3 byen_minus4 byen_minus5 byen_minus6 byen_minus7 — Logrummet: each layer down is quieter on purpose (the staircase)
// qc-whitelist: byen_morgen — Stille morgen plays under the end; it is meant to be far away
// qc-whitelist: raadhus — the "?"-building has no proper music, only a thin far loop
// qc-whitelist: gemt_lyver — "Gemt!" with no voice at all: the helper lies silently (min 30+)
// qc-whitelist: faerre_ja — a whisper by design ("Nå. Så bliver der … færre. Ja.")

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
ev({ id: 'name_syv', min: 18, phase: 1, deniable: 'variabel-fejl', run: (c) => c.flagText('name_syv') }); // "Flot, Syv." — HUD shows Syv once instead of the name
ev({ id: 'bench_gone', min: 28, phase: 1, deniable: 'preload-hak', run: (c) => { c.flagText('bench_gone'); c.musicDelay(20000); } });

// ---------------- Akt 2 (30–55): UI vakler, fake errors, the town counts ----------------
ev({ id: 'save_lies', min: 30, phase: 2, deniable: 'save-bug', run: (c) => c.flagText('save_lies') });
ev({ id: 'progress_back', min: 33, phase: 2, deniable: 'progress-bug', run: (c) => c.flagText('progress_back') });
ev({ id: 'taeller_hoejt', min: 35, phase: 2, deniable: 'tælle-fejl', run: (c) => c.flagText('taeller_hoejt') }); // he counts aloud on the hub and skips seven
ev({ id: 'seven_missing', min: 35, phase: 2, deniable: 'manglende tast', requires: () => !meta.ending, run: (c) => c.flagText('seven_missing') });
ev({ id: 'fuld', min: 40, phase: 2, shock: true, deniable: 'plads-fejl', run: (c) => c.fuld() }); // "Måneby er fuld." → Gentag → bzzt + paletteFlash → "Fjerne? Det gør vi ikke."
ev({ id: 'director_err', min: 43, phase: 2, deniable: 'lingo-fejl', run: (c) => c.directorError('traekFra') });
ev({ id: 'tretten', min: 44, phase: 2, deniable: 'tælle-fejl', run: (c) => c.flagText('tretten') }); // hub_back: "Fnuggerne venter på dig. Alle tretten."
ev({ id: 'byen_taeller', min: 45, phase: 2, deniable: 'statistik', run: (c) => c.byenTaeller() });
ev({ id: 'raa_render', min: 47, phase: 2, shock: true, deniable: 'render-cache', run: (c) => c.raaRender() });
ev({ id: 'peeked', min: 48, phase: 2, deniable: 'random-sprite', requires: () => (meta.qClicks || 0) >= 3, run: (c) => c.flagText('peeked') });
ev({ id: 'false_end', min: 50, phase: 2, shock: true, requires: () => Object.values(save.buildings).filter((v) => v >= 2).length >= 5, run: (c) => c.falseEnding() });

// ---------------- Akt 3 (55–90): night, silence, jump, revelation, choice ----------------
ev({ id: 'night_cursor', min: 58, phase: 3, requires: () => save.night, run: (c) => c.cursorDrift(1.5, { x: 420, y: 300 }) });
ev({ id: 'silence_counter', min: 65, phase: 3, shock: true, requires: () => save.night, run: (c) => c.silence(30000) }); // afterwards the "?" is a door (c.silence sets save.flags.hall_door)
ev({ id: 'jump', min: 68, phase: 3, shock: true, requires: () => save.night && save.seen.silence_counter, run: (c) => c.jumpScare() });
ev({ id: 'raadhus_melder', min: 69, phase: 3, requires: () => save.seen.jump, run: (c) => c.raadhusMelder() });
ev({ id: 'stemme_rum', min: 70, phase: 3, requires: () => save.seen.jump, run: (c) => c.flagText('stemme_rum') }); // next helper line through audio.room('tomt')
