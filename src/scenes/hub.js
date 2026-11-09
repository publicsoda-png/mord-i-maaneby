// Bykortet: 9 byggepladser, Fnugger, helper portrait corner, HUD. Fires wrongness events between tasks.
import { register, goto, button, lock } from '../core/scene.js';
import { drawText } from '../core/stage.js';
import { bg, drawFnug, drawBuilding } from '../art/placeholder.js';
import { say, helper, countHelpClick, hideDialog } from '../core/dialog.js';
import { save, meta, persist, persistMeta, touch } from '../core/state.js';
import { music, sfx } from '../core/audio.js';
import { t } from '../script.js';
import { checkWrongness } from '../wrongness.js';
import { gameApi } from '../game.js';

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
const FNUG_POS = [[190, 440], [300, 395], [420, 360], [560, 420], [90, 370], [240, 280], [470, 300], [360, 440], [130, 440], [600, 290], [40, 420]]; // 11 visible, sign says 12

register({
  id: 'hub',
  async enter(arg = {}) {
    this.bgc = bg('hub', save.night);
    document.getElementById('hud').hidden = false;
    document.getElementById('hudname').textContent = save.name;
    this.updateHud();
    music(save.night ? null : 'assets/music/byen.ogg', { fade: 1.5, startDelay: (save.flags.musicDelayMs || 0) / 1000 });
    save.flags.musicDelayMs = 0;
    button('Gem', 8, 8, async () => { sfx.click(); persist(true); await say(save.flags.save_lies ? 'Gemt!' : 'Dit byggeri er gemt.', { auto: 900, noPortrait: true }); }, { w: 60 });
    lock(false);
    if (arg.first) { await say(t('intro1')); await say(t('intro2')); await say(t('intro3')); await say(t('hub_first')); }
    else if (arg.back) {
      // Between tasks: let the curve speak, otherwise a normal line
      const fired = await checkWrongness(gameApi);
      if (!fired) await say(t('hub_back'), { auto: 1600 });
    }
  },
  updateHud() {
    const shown = save.flags.fnugShown ?? 12;
    document.getElementById('hudfnug').textContent = `Fnugger: ${shown}`;
  },
  hotspots() {
    const hs = PLOTS.map((p) => ({ x: p.x - 34, y: p.y - 44, w: 68, h: 54, label: p.locked ? '?' : p.name + (save.buildings[p.id] ? ` (${save.buildings[p.id]}/3)` : ''), cursor: 'hand', on: () => this.pick(p) }));
    hs.push({ x: 560, y: 60, w: 70, h: 90, label: 'Hjælp', on: () => this.help() });
    return hs;
  },
  async pick(p) {
    if (p.locked) { sfx.bzzt(); await say(save.flags.hallHint || 'Ikke endnu.', { auto: 1200, noPortrait: true }); return; }
    if (p.special) { await say('Fyrværkeriet venter, til byen er færdig.', { auto: 1500 }); return; }
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
    // fnugger: idle bob; one may show its back / magenta fringe after the first off-note
    FNUG_POS.forEach(([x, y], i) => {
      const f = Math.floor((tm / 400 + i) % 3);
      drawFnug(g, x, y + Math.sin(tm / 300 + i) * 1.5, 1, { frame: f, back: save.flags.fnug_fringe && i === 4, fringe: save.flags.fnug_fringe && i === 4, night: save.night });
    });
    // bench (disappears at bench_gone)
    if (!save.flags.bench_gone) { g.fillStyle = save.night ? '#2a2a2a' : '#6b4a2a'; g.fillRect(400, 455, 40, 5); g.fillRect(403, 460, 4, 8); g.fillRect(433, 460, 4, 8); }
    // helper corner marker (portrait lives in the dialog; here a small chair)
    drawText('?', 595, 70, { align: 'center', font: '700 22px "Comic Neue","Comic Sans MS",sans-serif', color: '#fff', outline: '#000' });
  },
});
