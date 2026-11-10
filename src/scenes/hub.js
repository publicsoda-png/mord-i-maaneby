// Bykortet: 9 byggepladser, Fnugger, helper portrait corner, HUD. Fires wrongness events between tasks.
import { register, goto, button, lock } from '../core/scene.js';
import { drawText } from '../core/stage.js';
import { bg, drawFnug } from '../art/placeholder.js';
import { buildSwap, drawPlot } from '../art/fx.js';
import { say, helper, countHelpClick, hideDialog, sleep, showHelper } from '../core/dialog.js';
import { save, meta, persist, persistMeta, touch } from '../core/state.js';
import { music, sfx, crtHum, play, room } from '../core/audio.js';
import { applyMix } from '../core/mix.js';
import { msgBox, showOS } from '../core/os.js';
import { t } from '../script.js';
import { checkWrongness } from '../wrongness.js';
import { gameApi } from '../game.js';
import { cur } from '../core/cursor.js';

export const PLOTS = [
  { id: 'landing', name: 'Landingspladsen', x: 150, y: 400, kind: 'pad', open: true },
  { id: 'bakery', name: 'Kraterbageriet', x: 250, y: 330, kind: 'dome' },
  { id: 'ice', name: 'Isværket', x: 380, y: 300, kind: 'tower' },
  { id: 'scope', name: 'Stjernekikkerten', x: 520, y: 260, kind: 'dome' },
  { id: 'school', name: 'Kraterskolen', x: 110, y: 310, kind: 'box' },
  { id: 'quarry', name: 'Kridtgruben', x: 460, y: 410, kind: 'pit' },
  { id: 'hall', name: 'Rådhuset', x: 320, y: 255, kind: 'hall', locked: true },
  { id: 'light', name: 'Fyrtårnet', x: 590, y: 340, kind: 'tower' },
  { id: 'fire', name: 'Fyrværkeripladsen', x: 320, y: 450, kind: 'pad', special: true },
];
export const FNUG_POS = [[190, 440], [300, 395], [420, 360], [560, 420], [170, 370], [240, 280], [470, 300], [360, 440], [250, 450], [600, 290], [520, 460]]; // 11 visible, sign says 12

// Rådhusets dør (tegnes i stedet for "?" når save.flags.hall_door) — på pladsens grundlinje
const HALL = PLOTS.find((p) => p.id === 'hall');
const DOOR = { x: HALL.x - 9, y: HALL.y - 34, w: 18, h: 32 };
// Natvagten (Fnuggen Elleve, id 10): tre faste trin, bageriet → midtvejs → Rådhusdøren. Ingen tween.
const NV_STEPS = [[262, 332], [284, 296], [300, 258]];
const NV_WAIT = 30000, NV_STEP_MS = 1200;

/** Rådhusets lukkede dør: mørkt blad, lysere karm, 1 px kridt-7 i midten når natvagten har været der. */
function drawDoor(g, night) {
  const { x, y, w, h } = DOOR;
  g.fillStyle = night ? '#5a5d6a' : '#9aa0b4'; g.fillRect(x - 2, y - 2, w + 4, h + 2); // karm
  g.fillStyle = night ? '#111318' : '#2a2d3a'; g.fillRect(x, y, w, h); // blad
  g.fillStyle = night ? '#3a3d4a' : '#6b7088'; g.fillRect(x + w - 5, y + Math.floor(h / 2), 2, 2); // håndtag
  if (save.flags.chalk7) { g.fillStyle = '#e8e4d8'; const cx = x + Math.floor(w / 2) - 2, cy = y + 9; g.fillRect(cx, cy, 5, 1); g.fillRect(cx + 4, cy + 1, 1, 2); g.fillRect(cx + 3, cy + 3, 1, 2); g.fillRect(cx + 2, cy + 5, 1, 2); }
}

register({
  id: 'hub',
  async enter(arg = {}) {
    this.bgc = bg('hub', save.night);
    helper.night = save.night;
    if (save.night) { if (!save.flags.jumped) helper.present = false; } else helper.present = true; // FØR showHelper: ellers tegnes månemanden i stolen om natten (drawHelper kaldes ikke igen når present ændres)
    showHelper(true); applyMix();
    music(save.night ? null : `assets/music/${save.flags.bench_gone ? 'byen_11' : 'byen'}.ogg`, { fade: 1.5, startDelay: (save.flags.musicDelayMs || 0) / 1000 });
    save.flags.musicDelayMs = 0;
    const jb = save.flags.justBuilt; if (jb) { delete save.flags.justBuilt; touch(); } // belønningen køres efter knapperne er sat (buildSwap spiller selv ui_bygning_opN på pop-framen)
    // QC r4 B2: Nedenunder-knappen skal med i SAMME hub-besøg som replikken, og replikken kun én gang
    const sayNeden = save.flags.fever1 && !save.flags.morning && !save.flags.log_open; if (sayNeden) { save.flags.log_open = true; touch(); }
    button('Gem', 8, 8, async () => { (save.flags.save_lies ? sfx.okFlat : sfx.ok)(); persist(true); await say(save.flags.save_lies ? 'Gemt!' : 'Dit byggeri er gemt.', { auto: 900, noPortrait: true }); }, { w: 60 });
    const luk = async () => {
      const os = document.getElementById('os'); showOS(true); os.style.background = 'transparent'; os.innerHTML = '';
      const r = await msgBox({ title: 'Regn med Måneby', icon: 'warn', msg: save.flags.morning ? 'Byen er ikke gemt.\nLuk alligevel?' : 'Vil du afslutte?', buttons: [{ label: 'Ja', value: 'y' }, { label: 'Nej', value: 'n', def: true }, ...(save.night && save.flags.jumped ? [{ label: 'Hende', value: 'h' }] : [])], parent: os });
      showOS(false);
      if (r === 'y') goto('title'); else if (r === 'h') { save.flags.hall_open = true; touch(); await say('Ja. Hende.', { auto: 1500 }); }
    };
    button('Luk', 76, 8, luk, { w: 60 });
    window.MB && (window.MB.luk = luk);
    if (save.flags.log_open) button('Nedenunder', 540, 8, () => goto('logroom'), { w: 92 });
    lock(false);
    this.idleT = performance.now(); this.nvArmed = null; this.nvDone = false;
    if (jb) { const p = PLOTS.find((x) => x.id === jb.id); if (p) await buildSwap(p, Math.max(0, jb.stage - 1), jb.stage, { night: save.night }); } // støv → pop + pling → stjerner på step-uret (fx.js)
    if (arg.first) {
      await say(t('intro1'), { voice: 'assets/voice/intro1.ogg', mouth: 'assets/voice/intro1.json' }); await say(t('intro2')); await say(t('intro3')); await say(t('intro4')); await say(t('hub_first'));
      // 2. gennemspilning: han kan tælle besøg
      if (meta.ending && !save.flags.vaeret_her_said) { save.flags.vaeret_her_said = true; touch(); await say('Du har været her før. Det kan jeg tælle.', { hold: 500 }); }
    }
    else if (arg.nightIntro) { await sleep(2500); /* nobody says anything */ }
    else if (arg.afterJump) {
      helper.present = true;
      await say('Der mangler én. Nogen har … jeg kender ikke ordet.', { voice: 'assets/voice/mangler_en.ogg', mouth: 'assets/voice/mangler_en.json', hold: 600 });
      await say('Vi byggede ovenpå. Det plejer at hjælpe.', { hold: 500 });
      save.flags.hall_open = true; save.flags.hallHint = 'Rådhuset er åbent.'; touch();
    }
    else if (save.flags.hall_answer !== undefined && !save.flags.fever1) { goto('fever1'); return; } // 0 is an answer too
    else if (sayNeden) { await say('Der er ét sted til. Nedenunder.', { hold: 400 }); }
    else if (save.flags.fever_madpakke && !save.flags.fever2) { save.flags.fever_madpakke = false; goto('fever2'); return; }
    else if (arg.back) {
      // Between tasks: let the curve speak, otherwise a normal line
      const fired = await checkWrongness(gameApi);
      applyMix();
      if (fired === 'loud') return; // stille flag-events sluger ikke hub_back-replikken (a0 K1)
      if (save.flags.name_syv && !save.flags.name_syv_said) { save.flags.name_syv_said = true; touch(); await say('Flot, Syv.', { auto: 1400 }); }
      else if (save.flags.fjerne) { delete save.flags.fjerne; touch(); await say('Fjerne? Det gør vi ikke.', { hold: 500 }); }
      else if (save.flags.taeller_hoejt && !save.flags.taeller_hoejt_said) { save.flags.taeller_hoejt_said = true; touch(); await say('Én, to, tre, fire, fem, seks ... otte, ni, ti, elleve, tolv. Det passer.', { hold: 600 }); }
      else if (save.flags.tretten && !save.flags.tretten_said) { save.flags.tretten_said = true; touch(); await say('Fnuggerne venter på dig. Alle tretten.', { auto: 1600 }); }
      else if (save.flags.stemme_rum && !save.flags.stemme_rum_said) {
        save.flags.stemme_rum_said = true; touch();
        try { await room('tomt'); } catch (e) { /* no audio yet */ }
        await say('Jeg har mistænkt bageren. Og isværket. Og kridtgruben. Ikke dig. Du kom først bagefter.', { hold: 700 });
        try { await room(null); } catch (e) { /* ignore */ }
      }
      else await say(t('hub_back'), { auto: 1600 });
    }
  },
  exit() { showHelper(false); },
  hotspots() {
    const locked = (p) => p.locked && !save.flags.hall_open && !meta.ending;
    const door = (p) => p.id === 'hall' && locked(p) && save.flags.hall_door && save.night && !save.flags.jumped;
    const hs = PLOTS.map((p) => ({ x: p.x - 34, y: p.y - 44, w: 68, h: 54, label: locked(p) ? '?' : p.name + (save.buildings[p.id] ? ` (${save.buildings[p.id]}/3)` : ''), cursor: 'hand', on: () => this.pick(p, locked(p)) }));
    if (PLOTS.some(door)) hs.push({ x: DOOR.x - 4, y: DOOR.y - 4, w: DOOR.w + 8, h: DOOR.h + 8, label: '?', cursor: 'hand', on: () => this.pick(HALL, true) });
    hs.unshift({ x: 6, y: 226, w: 130, h: 250, label: 'Hjælp', on: () => this.help() }); // unshift: hit() tester bagfra, så pladserne (Kraterskolen) vinder over Hjælp (a0 QC 09-11)
    return hs;
  },
  async pick(p, isLocked) {
    this.idleT = performance.now();
    if (isLocked) {
      if (p.id === 'hall' && save.flags.hall_door && save.night && !save.flags.jumped) { sfx.click(); goto('jump'); return; } // døren
      meta.qClicks = (meta.qClicks || 0) + 1; persistMeta();
      sfx.bzzt(); await say(save.flags.hallHint || 'Ikke endnu.', { auto: 1200, noPortrait: true }); return;
    }
    if (p.special) {
      const built = Object.values(save.buildings).filter((v) => v >= 2).length;
      if (built >= 5 && !save.night) { sfx.click(); goto(meta.ending && save.flags.hall_answer === undefined ? 'trueEnd' : 'falseEnd'); return; }
      await say('Fyrværkeriet venter, til byen er færdig.', { auto: 1500 }); return;
    }
    play('ui_hub_klik');
    goto('task', p);
  },
  async help() {
    this.idleT = performance.now();
    const n = countHelpClick();
    if (save.night && !save.flags.jumped) { sfx.tick(); return; } // the chair is empty: nobody answers
    sfx.click();
    await say(n === 400 ? 'Fire hundrede gange. Jeg tæller stadig. Det er det eneste, jeg kan.' : t('help'));
  },
  /** Natvagten: trin 0..2 efter 30 s stilhed om natten (spilletid), ellers -1. */
  nvStep(tm) {
    if (!save.night || save.flags.morning) return -1;
    const idle = tm - this.idleT;
    if (idle < NV_WAIT) { if (this.nvArmed !== null) { this.nvArmed = null; this.nvDone = false; } return -1; }
    const step = Math.min(NV_STEPS.length - 1, Math.floor((idle - NV_WAIT) / NV_STEP_MS));
    if (this.nvArmed === null) { this.nvArmed = this.idleT; try { play('nv_lygte_klik'); } catch (e) { /* lyd mangler endnu */ } }
    if (step === NV_STEPS.length - 1 && !this.nvDone) { this.nvDone = true; if (!save.flags.chalk7) { save.flags.chalk7 = true; touch(); } try { play('nv_uld_sten'); } catch (e) { /* lyd mangler endnu */ } }
    return step;
  },
  bg(g, dt, tm) {
    g.drawImage(this.bgc, 0, 0);
    // bench_gone: renderens bænk (x 416–639, y 310–443) dækkes med overfladen ved siden af, spejlet så sømmen passer
    if (save.flags.bench_gone) { g.save(); g.translate(640, 0); g.scale(-1, 1); g.drawImage(this.bgc, 188, 306, 226, 140, 0, 306, 226, 140); g.restore(); }
    const showDoor = save.flags.hall_door && save.night && !save.flags.jumped && !save.flags.hall_open && !meta.ending;
    for (const p of PLOTS) {
      if (p.special) continue;
      drawPlot(g, p, save.buildings[p.id] || 0, save.night);
      if (p.locked && !save.flags.hall_open && !meta.ending) {
        if (showDoor) drawDoor(g, save.night);
        else drawText('?', p.x, p.y - 60, { align: 'center', font: '700 28px "Comic Neue","Comic Sans MS",sans-serif', color: '#ffd21f', outline: '#000' });
      } else if (p.locked && !save.buildings[p.id]) {
        // QC r4 K4: Rådhuset er åbent men ikke bygget – en åben dør på pladsen (palettefarver, heltal)
        g.fillStyle = save.night ? '#5a4610' : '#ffbf2f'; g.fillRect(p.x - 7, p.y - 24, 14, 20); g.fillStyle = '#15171f'; g.fillRect(p.x - 5, p.y - 22, 10, 18);
      }
    }
    const nv = this.nvStep(tm);
    const il = save.flags.idle_look, lookOn = !!il && save.night && (il === true || Math.abs(performance.now() - il) < 1000);
    // fnugger stand STILL (era rule) — one of them takes a single step every few seconds
    const stepper = Math.floor(tm / 3200) % FNUG_POS.length, stepPhase = (tm % 3200) < 400 ? 1 : 0;
    FNUG_POS.forEach(([x, y], i) => {
      if (nv >= 0 && i === 10) return; // Elleve er på vagt
      const frame = lookOn && i === 1 ? 2 : (i === stepper ? stepPhase : 0);
      drawFnug(g, x, y, 1, { id: i, frame, back: save.flags.fnug_fringe && i === 4, fringe: save.flags.fnug_fringe && i === 4, night: save.night });
      if (save.flags.peeked && i === 6) { g.fillStyle = '#111'; g.fillRect(x - 4, y - 16, 3, 3); g.fillRect(x + 3, y - 16, 3, 3); } // one of them looks into the camera
    });
    // Natvagt: Fnuggen Elleve med lygte, tre faste trin, flad lyskegle (ingen alpha over renderen — hård farve)
    if (nv >= 0) {
      const [x, y] = NV_STEPS[nv], atDoor = nv === NV_STEPS.length - 1;
      const tx = atDoor ? DOOR.x + DOOR.w / 2 : NV_STEPS[nv + 1][0], ty = atDoor ? DOOR.y + DOOR.h / 2 : NV_STEPS[nv + 1][1] - 20;
      g.fillStyle = '#6a5a28';
      g.beginPath(); g.moveTo(x + 6, y - 18); g.lineTo(tx + 10, ty - 14); g.lineTo(tx + 10, ty + 14); g.closePath(); g.fill();
      if (atDoor) { drawDoor(g, false); } // døren står i lyset
      drawFnug(g, x, y, 1, { id: 10, frame: nv % 2, night: true });
      g.fillStyle = '#ffe9a0'; g.fillRect(x + 5, y - 20, 4, 5); g.fillStyle = '#333'; g.fillRect(x + 6, y - 23, 2, 3); // lygten
    }
  },
  tick(dt, tm) {
    // nat: cursor drifts toward the town hall after night_cursor; the counter shivers during silence
    if (save.flags.cursor_drift && save.night && !save.flags.morning) { cur.lag = 0.12; cur.pull = { x: 320, y: 255 }; cur.pullK = 0.015; } else { cur.lag = 0; cur.pull = null; }
  },
  draw(g, dt, tm) {
    // counter as outlined text in the scene (no HUD bar — era rule). Sign says 12 while 11 stand on the plain.
    const n = save.flags.silence_on ? (Math.floor(tm / 180) % 2 ? 12 : 11) : (save.flags.fnugShown ?? 12);
    drawText(`Fnugger: ${n}`, 630, 458, { align: 'right', font: '700 14px "Comic Neue","Comic Sans MS",sans-serif', color: '#fff', outline: '#000' });
    drawText(save.flags.name_syv ? 'Syv' : save.name, 150, 458, { font: '700 14px "Comic Neue","Comic Sans MS",sans-serif', color: '#fff', outline: '#000' });
  },
});
