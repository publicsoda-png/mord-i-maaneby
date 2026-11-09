// A building plot: intro line → minigame → result → building stage → back to hub.
import { register, goto, lock, button } from '../core/scene.js';
import { bg } from '../art/placeholder.js';
import { say, sleep } from '../core/dialog.js';
import { save, touch, persist, playMin } from '../core/state.js';
import { music, sfx, loopHak, musicDetune } from '../core/audio.js';
import { gameApi } from '../game.js';
import { progressBox, fakeProgress, showOS } from '../core/os.js';
import { applyMix } from '../core/mix.js';
import { t } from '../script.js';
import { playGame, stopGame } from '../ware/engine.js';
import landing from '../ware/games/landing.js';

// Each game module may export `lines` ({<id>_intro, <id>_ok, <id>_wrong, …}); task.js reads them so games stay self-contained.
const GAMES = { landing };
const MUSIC = { landing: 'plads_a', bakery: 'plads_a', ice: 'plads_b', scope: 'plads_b', school: 'plads_c', quarry: 'plads_c', hall: 'raadhus', light: 'plads_b' };
export async function loadGames() {
  for (const id of ['bakery', 'ice', 'scope', 'school', 'quarry', 'light', 'hall']) {
    try { const m = await import(`../ware/games/${id}.js`); GAMES[id] = m.default; } catch (e) { /* not built yet */ }
  }
}
const line = (G, key, fallback) => (G && G.lines && G.lines[key]) ? (typeof G.lines[key] === 'function' ? G.lines[key]() : G.lines[key]) : (t(key) || fallback);

register({
  id: 'task',
  async enter(p) {
    this.p = p; const tok = this.tok = (this.tok || 0) + 1; // Tilbage under introen må ikke lade playGame starte oven på hub'en (a0 QC 09-11)
    this.bgc = bg(p.id, save.night);
    applyMix({ scene: p.id });
    const cursed = save.night && p.id === 'quarry';
    music(`assets/music/${MUSIC[p.id] || 'plads_a'}${cursed ? '_cursed' : ''}.ogg`, { fade: 1 });
    const m = gameApi.devMin ?? playMin();
    if (m >= 30 && m < 50 && !save.night) { clearTimeout(this.hak); this.hak = setTimeout(() => loopHak(), 15000 + Math.random() * 20000); } // one loop stutter per visit (deniable)
    if (m >= 30 && (p.id === 'ice' || p.id === 'scope')) setTimeout(() => musicDetune(-3), 1200);
    button('Tilbage', 8, 448, () => { stopGame(); sfx.click(); goto('hub', { back: true }); }, { w: 90 });
    const G = GAMES[p.id];
    if (save.flags.progress_back && !save.flags.progress_back_shown) {
      // the loading bar goes 71 % → 44 % once (deniable: "it just reloaded something")
      save.flags.progress_back_shown = true; touch();
      const os = document.getElementById('os'); showOS(true); os.style.background = 'transparent'; os.innerHTML = '';
      const box = progressBox({ title: 'Regn med Måneby', text: 'Henter ' + p.name + '…', parent: os });
      await fakeProgress(box, { ms: 2400, back: true }); box.close(); showOS(false);
      if (this.tok !== tok) return;
    }
    if (!G) { await say(`${p.name} er ikke bygget endnu i denne udgave.`, { auto: 1500 }); goto('hub', { back: true }); return; }
    await say(line(G, p.id + '_intro', 'Løs opgaven, så bygger Fnuggerne.'));
    if (this.tok !== tok) return;
    let wrong = 0;
    const res = await playGame(G, { grade: save.grade, seed: Date.now(), night: save.night, save, say, minusKnown: !!save.flags.minus_known, onWrong: () => { wrong++; save.wrongCount = (save.wrongCount || 0) + 1; touch(); say(line(G, p.id + '_wrong', 'Prøv igen.'), { auto: 1000 }); } });
    if (res.aborted || this.tok !== tok) return;
    if (res.fever === 'madpakke') { save.flags.fever_madpakke = true; touch(); persist(true); goto('hub', { back: true }); return; } // nat-bageriet: ingen dag-ok-linje/bygning — hub sender videre til fever2 (a0 QC 09-11)
    if (p.id === 'hall' && res.answer !== undefined) { save.flags.hall_answer = res.answer; touch(); persist(true); lock(true); if (res.answer === 11) await say('Ja. Elleve.', { hold: 600 }); else await sleep(2500); lock(false); goto('hub', { back: false }); return; }
    if (res.morse) { save.flags.morse_seen = true; touch(); goto('hub', { back: true }); return; }
    const stage = Math.max(1, 3 - Math.min(2, wrong));
    const prev = save.buildings[p.id] || 0;
    if (stage > prev) { save.buildings[p.id] = stage; save.flags.justBuilt = { id: p.id, stage }; } // hub plays ui_bygning_opN on the swap frame
    touch(); persist(true);
    lock(true);
    (save.flags.klaret_klaret ? sfx.goodGood : sfx.good)();
    const okText = line(G, p.id + '_ok', 'Godt klaret!');
    await say(save.flags.klaret_klaret ? okText.replace(/^Godt klaret!/, 'Godt klaret klaret!') : okText); // the typo repeats on every plot from min 15
    if (stage === 3 && !save.stickers.includes(p.id)) { save.stickers.push(p.id); sfx.sticker(); await say(t('sticker')); }
    lock(false);
    goto('hub', { back: true });
  },
  exit() { this.tok = (this.tok || 0) + 1; clearTimeout(this.hak); }, // ugyldiggør ventende awaits i enter()
  bg(g) { g.drawImage(this.bgc, 0, 0); },
});
