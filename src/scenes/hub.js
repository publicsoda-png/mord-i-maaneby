// Bykortet: 9 byggepladser, Fnugger, helper portrait corner, HUD. Fires wrongness events between tasks.
import { register, goto, button, lock } from '../core/scene.js';
import { drawText } from '../core/stage.js';
import { bg, drawFnug, drawBuilding } from '../art/placeholder.js';
import { say, helper, countHelpClick, hideDialog, sleep, showHelper } from '../core/dialog.js';
import { save, meta, persist, persistMeta, touch } from '../core/state.js';
import { music, sfx, crtHum } from '../core/audio.js';
import { applyMix } from '../core/mix.js';
import { msgBox, showOS } from '../core/os.js';
import { t } from '../script.js';
import { checkWrongness } from '../wrongness.js';
import { gameApi } from '../game.js';
import { cur } from '../core/cursor.js';

/** The browser's own voice slips through (the break): live speechSynthesis, Danish if present, else the telephone filter line. */
async function leak(text) {
  const synth = window.speechSynthesis;
  const v = synth && synth.getVoices().find((x) => /^da/i.test(x.lang));
  if (!synth || !v) return say(text, { hold: 600 });
  const u = new SpeechSynthesisUtterance(text); u.voice = v; u.rate = 0.95; u.pitch = 0.9;
  const done = new Promise((r) => { u.onend = r; u.onerror = r; });
  synth.speak(u);
  await Promise.all([say(text, { silent: true, auto: 1, keep: true }), done]);
  hideDialog();
}

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
const FNUG_POS = [[190, 440], [300, 395], [420, 360], [560, 420], [170, 370], [240, 280], [470, 300], [360, 440], [250, 450], [600, 290], [520, 460]]; // 11 visible, sign says 12

register({
  id: 'hub',
  async enter(arg = {}) {
    this.bgc = bg('hub', save.night);
    showHelper(true); applyMix();
    music(save.night ? null : `assets/music/${save.flags.bench_gone ? 'byen_11' : 'byen'}.ogg`, { fade: 1.5, startDelay: (save.flags.musicDelayMs || 0) / 1000 });
    save.flags.musicDelayMs = 0;
    button('Gem', 8, 8, async () => { sfx.click(); persist(true); await say(save.flags.save_lies ? 'Gemt!' : 'Dit byggeri er gemt.', { auto: 900, noPortrait: true }); }, { w: 60 });
    const luk = async () => {
      sfx.click();
      const os = document.getElementById('os'); showOS(true); os.style.background = 'transparent'; os.innerHTML = '';
      const r = await msgBox({ title: 'Regn med Måneby', icon: 'warn', msg: save.flags.morning ? 'Byen er ikke gemt.\nLuk alligevel?' : 'Vil du afslutte?', buttons: [{ label: 'Ja', value: 'y' }, { label: 'Nej', value: 'n', def: true }, ...(save.night && save.flags.jumped ? [{ label: 'Hende', value: 'h' }] : [])], parent: os });
      showOS(false);
      if (r === 'y') goto('desktop'); else if (r === 'h') { save.flags.hall_open = true; touch(); await say('Ja. Hende.', { auto: 1500 }); }
    };
    button('Luk', 76, 8, luk, { w: 60 });
    window.MB && (window.MB.luk = luk);
    if (save.flags.log_open) button('Logrummet', 540, 8, () => { sfx.click(); goto('logroom'); }, { w: 92 });
    lock(false);
    helper.night = save.night;
    if (save.night) { if (!save.flags.jumped) helper.present = false; }
    else helper.present = true;
    this.idleT = performance.now();
    if (arg.first) { await say(t('intro1'), { voice: 'assets/voice/intro1.ogg', mouth: 'assets/voice/intro1.json' }); await say(t('intro2')); await say(t('intro3')); await say(t('hub_first')); }
    else if (arg.nightIntro) { await sleep(2500); /* nobody says anything */ }
    else if (arg.afterJump) { helper.present = true; await say('Der mangler én. Nogen har … jeg kender ikke ordet.', { voice: 'assets/voice/mangler_en.ogg', mouth: 'assets/voice/mangler_en.json', hold: 600 }); save.flags.hall_open = true; save.flags.hallHint = 'Rådhuset er åbent.'; touch(); }
    else if (save.flags.hall_answer && !save.flags.fever1) { goto('fever1'); return; }
    else if (save.flags.fever1 && !save.flags.morning) { await say('Der er ét sted til. Nedenunder.', { hold: 400 }); save.flags.log_open = true; touch(); }
    else if (save.flags.fever_madpakke && !save.flags.fever2) { save.flags.fever_madpakke = false; goto('fever2'); return; }
    else if (arg.back) {
      // Between tasks: let the curve speak, otherwise a normal line
      const fired = await checkWrongness(gameApi);
      applyMix();
      if (fired) return;
      if (save.flags.english_line && !save.flags.english_said) { save.flags.english_said = true; touch(); await say('Well done. What shall we build next?', { auto: 2000, silent: true }); }
      else if (save.flags.first_name && !save.flags.first_name_said) { save.flags.first_name_said = true; touch(); await say(`Velkommen tilbage, ${meta.firstName}.`, { hold: 500, silent: true }); }
      else if (save.flags.tts_leak && !save.flags.tts_leaked) { save.flags.tts_leaked = true; touch(); await leak('Er du der stadig? Jeg kan ikke høre dig.'); }
      else await say(t('hub_back'), { auto: 1600 });
    }
  },
  exit() { showHelper(false); },
  hotspots() {
    const locked = (p) => p.locked && !save.flags.hall_open && !meta.ending;
    const hs = PLOTS.map((p) => ({ x: p.x - 34, y: p.y - 44, w: 68, h: 54, label: locked(p) ? '?' : p.name + (save.buildings[p.id] ? ` (${save.buildings[p.id]}/3)` : ''), cursor: 'hand', on: () => this.pick(p, locked(p)) }));
    hs.push({ x: 6, y: 226, w: 130, h: 250, label: 'Hjælp', on: () => this.help() });
    return hs;
  },
  async pick(p, isLocked) {
    this.idleT = performance.now();
    if (isLocked) { sfx.bzzt(); await say(save.flags.hallHint || 'Ikke endnu.', { auto: 1200, noPortrait: true }); return; }
    if (p.special) {
      const built = Object.values(save.buildings).filter((v) => v >= 2).length;
      if (built >= 5 && !save.night) { sfx.click(); goto('falseEnd'); return; }
      await say('Fyrværkeriet venter, til byen er færdig.', { auto: 1500 }); return;
    }
    sfx.click();
    goto('task', p);
  },
  async help() {
    const n = countHelpClick();
    sfx.click();
    await say(n === 400 ? 'Fire hundrede gange. Det var også det, hun nåede.' : t('help'));
  },
  bg(g, dt, tm) {
    g.drawImage(this.bgc, 0, 0);
    for (const p of PLOTS) {
      if (p.special) continue;
      drawBuilding(g, p.x, p.y, save.buildings[p.id] || 0, p.kind, save.night);
      if (p.locked) drawText('?', p.x, p.y - 60, { align: 'center', font: '700 28px "Comic Neue","Comic Sans MS",sans-serif', color: '#ffd21f', outline: '#000' });
    }
    // fnugger stand STILL (era rule) — one of them takes a single step every few seconds
    const stepper = Math.floor(tm / 3200) % FNUG_POS.length, stepPhase = (tm % 3200) < 400 ? 1 : 0;
    FNUG_POS.forEach(([x, y], i) => {
      drawFnug(g, x, y, 1, { id: i, frame: i === stepper ? stepPhase : 0, back: save.flags.fnug_fringe && i === 4, fringe: save.flags.fnug_fringe && i === 4, night: save.night });
      if (save.flags.peeked && i === 6) { g.fillStyle = '#111'; g.fillRect(x - 4, y - 16, 3, 3); g.fillRect(x + 3, y - 16, 3, 3); } // one of them looks into the camera
      if (save.flags.season === 'jul') { g.fillStyle = '#c22'; g.beginPath(); g.moveTo(x - 8, y - 20); g.lineTo(x + 8, y - 20); g.lineTo(x + 2, y - 32); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.fillRect(x + 1, y - 34, 3, 3); }
    });
    // bench (disappears at bench_gone)
    if (!save.flags.bench_gone) { g.fillStyle = save.night ? '#2a2a2a' : '#6b4a2a'; g.fillRect(400, 455, 40, 5); g.fillRect(403, 460, 4, 8); g.fillRect(433, 460, 4, 8); }
    // Feberdrøm IV: nattevagten — only real local time 22–05, at night, after 30 s without input
    const h = new Date().getHours();
    if (save.night && (h >= 22 || h < 5) && tm - this.idleT > 30000) {
      g.fillStyle = '#2a2a33'; g.fillRect(520, 300, 26, 80); g.fillStyle = '#d9c9a8'; g.fillRect(523, 284, 20, 18); g.fillStyle = '#000'; g.fillRect(528, 290, 3, 3); g.fillRect(536, 290, 3, 3);
      g.fillStyle = 'rgba(255,240,180,.35)'; g.beginPath(); g.moveTo(520, 330); g.lineTo(380, 300); g.lineTo(380, 380); g.closePath(); g.fill();
      if (!this.pedelSaid) { this.pedelSaid = true; say('Jeg lukker kl. 16. Hvorfor er du her?', { noPortrait: true, hold: 1500 }).then(() => say('Den sidste linje i hendes fil var: "tilbage om lidt".', { noPortrait: true, auto: 3000 })); }
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
    drawText(save.flags.name_B ? 'B.' : save.name, 150, 458, { font: '700 14px "Comic Neue","Comic Sans MS",sans-serif', color: '#fff', outline: '#000' });
  },
});
