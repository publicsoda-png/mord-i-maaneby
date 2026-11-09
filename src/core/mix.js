// Data-driven mix: play-phase → bus levels, ambience layers, voice chain, ducking (LYDPLAN §2, §5, §7).
// Scenes do not set levels themselves; they call applyMix() on enter and the hub calls it after each wrongness event.
// Phase is derived from save.playMs / save.night / save.flags, so a reload lands in the right soundscape.
import { save, playMin } from './state.js';
import { setBus, ambientLayers, phone, room, duck, setTickSound, stopMusic, play, audioCtx } from './audio.js';

// dBFS → gain
const dB = (x) => Math.pow(10, x / 20);

/** Ordered phase table: first row whose `when` matches wins. Levels are dBFS bus gains (LYDPLAN §2 baseline).
 *  amb: list of [file, dB] layers (seamless loops in assets/sfx/amb_*.ogg). room: null | 'edb' | 'tomt'. */
export const PHASES = [
  { id: 'logrum',      when: (m, f) => f.scene === 'logrum',                         music: -14, voice: -12, sfx: -10, amb: [['amb_log', -24]],                     room: null,  phone: true,  duck: false, tick: 'telefon' },
  { id: 'feber1',      when: (m, f) => f.scene === 'feber1',                         music: -99, voice: -12, sfx: -10, amb: [['amb_kridt', -28]],                   room: 'tomt', phone: false, duck: false, tick: 'tick' },
  { id: 'feber2',      when: (m, f) => f.scene === 'feber2',                         music: -99, voice: -12, sfx: -10, amb: [['amb_edb', -24]],                     room: 'edb', phone: false, duck: false, tick: 'tick' },
  { id: 'feber3',      when: (m, f) => f.scene === 'feber3',                         music: -99, voice: -12, sfx: -10, amb: [['amb_svaev', -26]],                   room: null,  phone: true,  duck: false, tick: 'telefon' },
  { id: 'credits',     when: (m, f) => f.scene === 'credits',                        music: -14, voice: -12, sfx: -10, amb: [],                                     room: null,  phone: false, duck: true,  tick: 'tick' },
  { id: 'morgen',      when: (m, f) => f.ending === 'morgen',                        music: -22, voice: -12, sfx: -10, amb: [],                                     room: null,  phone: false, duck: true,  tick: 'tick' },
  { id: 'nat_telefon', when: (m, f, night) => night && m >= 68,                      music: -99, voice: -12, sfx: -10, amb: [['amb_crt', -26], ['amb_ventilation', -26]], room: 'edb', phone: true, duck: false, tick: 'telefon' },
  { id: 'nat',         when: (m, f, night) => night,                                 music: -99, voice: -12, sfx: -10, amb: [['amb_crt', -26], ['amb_ventilation', -26]], room: 'edb', phone: false, duck: false, tick: 'tick' },
  { id: 'kamp',        when: (m) => m >= 45,                                         music: -14, voice: -12, sfx: -10, amb: [['amb_dag', -34]],                     room: null,  phone: false, duck: false, tick: 'tick' },   // no ducking: music and voice fight
  { id: 'dag',         when: () => true,                                             music: -14, voice: -12, sfx: -10, amb: [['amb_dag', -34]],                     room: null,  phone: false, duck: true,  tick: 'tick' },
];

let currentId = null;
export function currentPhase() { return currentId; }

/** Resolve the phase for the current state (or an override for dev/tests). */
export function resolvePhase({ min, night, flags } = {}) {
  const m = min ?? playMin();
  const n = night ?? save.night;
  const f = flags ?? save.flags;
  return PHASES.find((p) => p.when(m, f, n));
}

/** Apply bus levels, ambience, room and voice chain for the resolved phase. Idempotent; safe to call often. */
export function applyMix(opts = {}) {
  const p = resolvePhase(opts);
  if (!p) return null;
  const changed = p.id !== currentId;
  currentId = p.id;
  setBus('music', p.music <= -90 ? 0 : dB(p.music), changed ? 1.5 : 0.3);
  setBus('voice', dB(p.voice));
  setBus('sfx', dB(p.sfx));
  if (changed) {
    ambientLayers(p.amb.map(([file, lvl]) => ({ src: `assets/sfx/${file}.ogg`, gain: dB(lvl) })), opts.ambFade ?? (p.id.startsWith('nat') ? 8 : 2));
    room(p.room);
    phone(p.phone);
    duck(p.duck);
    setTickSound(p.tick);
    if (p.music <= -90) stopMusic(1.2);
    radiator(p.id.startsWith('nat'));
  }
  return p;
}

// Night: one radiator tick every 40–70 s (LYDPLAN §5).
let radiatorTimer = null;
function radiator(on) {
  clearTimeout(radiatorTimer); radiatorTimer = null;
  if (!on) return;
  const tick = () => { play('wr_radiator_tik', { gain: 0.6, pan: Math.random() * 0.6 - 0.3 }); radiatorTimer = setTimeout(tick, 40000 + Math.random() * 30000); };
  radiatorTimer = setTimeout(tick, 40000 + Math.random() * 30000);
}

// Page Visibility (PLAN §6): akt 1–2 mute at once in a background tab; akt 3 the voice keeps going 10 s, then mutes.
let visTimer = null;
document.addEventListener('visibilitychange', () => {
  const ctx = audioCtx(); if (!ctx) return;
  clearTimeout(visTimer);
  if (document.hidden) {
    const delay = save.act >= 3 || save.night ? 10000 : 0;
    visTimer = setTimeout(() => setBus('master', 0, 0.2), delay);
  } else setBus('master', 1, 0.3);
});

/** "Stille morgen": ventilation switches off audibly, 4 s of nothing, then the hub theme at −8 dB. */
export async function stilleMorgen() {
  ambientLayers([], 0.6);
  room(null); phone(false); duck(true); setTickSound('tick');
  await new Promise((r) => setTimeout(r, 4000));
  save.flags.ending = 'morgen';
  applyMix();
}

/** Night entry: CRT off → 3 s black silence → hum + ventilation fade in over 8 s. Caller draws the black frame. */
export async function enterNight() {
  stopMusic(0.1);
  ambientLayers([], 0.1);
  await new Promise((r) => setTimeout(r, 3000));
  save.night = true;
  applyMix({ ambFade: 8 });
}
