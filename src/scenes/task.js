// A building plot: intro line → minigame → result → building stage → back to hub.
import { register, goto, lock, button } from '../core/scene.js';
import { bg } from '../art/placeholder.js';
import { say } from '../core/dialog.js';
import { save, touch, persist } from '../core/state.js';
import { music, sfx } from '../core/audio.js';
import { t } from '../script.js';
import { playGame, stopGame } from '../ware/engine.js';
import landing from '../ware/games/landing.js';

const GAMES = { landing };

register({
  id: 'task',
  async enter(p) {
    this.p = p;
    this.bgc = bg(p.id, save.night);
    music(`assets/music/${p.id}.ogg`, { fade: 1 });
    button('Tilbage', 8, 448, () => { stopGame(); sfx.click(); goto('hub', { back: true }); }, { w: 90 });
    const G = GAMES[p.id];
    if (!G) { await say(`${p.name} er ikke bygget endnu i denne udgave.`, { auto: 1500 }); goto('hub', { back: true }); return; }
    await say(t(p.id + '_intro') || 'Løs opgaven, så bygger Fnuggerne.');
    let wrong = 0;
    const res = await playGame(G, { grade: save.grade, seed: Date.now(), night: save.night, onWrong: () => { wrong++; say(t(p.id + '_wrong') || 'Prøv igen.', { auto: 1000 }); } });
    if (res.aborted) return;
    const stage = Math.max(1, 3 - Math.min(2, wrong));
    const prev = save.buildings[p.id] || 0;
    if (stage > prev) save.buildings[p.id] = stage;
    touch(); persist(true);
    lock(true);
    sfx.good();
    await say(t(p.id + '_ok') || 'Udmærket!');
    if (stage === 3 && !save.stickers.includes(p.id)) { save.stickers.push(p.id); sfx.sticker(); await say(t('sticker')); }
    lock(false);
    goto('hub', { back: true });
  },
  bg(g) { g.drawImage(this.bgc, 0, 0); },
});
