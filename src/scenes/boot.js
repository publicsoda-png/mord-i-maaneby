// Krom: fake Win2000 desktop → double-click CD icon → cd spin → Shockwave-ish loader → title → setup.
import { register, goto, button, lock } from '../core/scene.js';
import { ctx, W, H, drawText, preload } from '../core/stage.js';
import { showOS, desktop, progressBox, fakeProgress, msgBox, sleep } from '../core/os.js';
import { ensureAudio, sfx, music } from '../core/audio.js';
import { save, meta, persist, persistMeta } from '../core/state.js';
import { bg } from '../art/placeholder.js';
import { showCursor } from '../core/cursor.js';

const cdSvg = `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#cfd8e8" stroke="#56627a"/><circle cx="16" cy="16" r="13" fill="url(#g)"/><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#e8f0ff"/><stop offset=".5" stop-color="#9fb6e0"/><stop offset="1" stop-color="#f3dffb"/></linearGradient></defs><circle cx="16" cy="16" r="4" fill="#3a6ea5" stroke="#223"/></svg>`;
const folderSvg = `<svg viewBox="0 0 32 32"><path d="M2 8h10l3 3h15v16H2z" fill="#f7d774" stroke="#8a6d1a"/><path d="M2 12h28v15H2z" fill="#fce79a" stroke="#8a6d1a"/></svg>`;
const docSvg = `<svg viewBox="0 0 32 32"><path d="M6 2h14l6 6v22H6z" fill="#fff" stroke="#667"/><path d="M20 2v6h6" fill="#dde" stroke="#667"/><path d="M9 12h14M9 16h14M9 20h10" stroke="#89a" /></svg>`;

register({
  id: 'desktop',
  async enter() {
    showCursor(false);
    showOS(true);
    document.getElementById('app').style.visibility = 'hidden';
    desktop({
      icons: [
        { x: 16, y: 16, label: 'Denne computer', svg: `<svg viewBox="0 0 32 32"><rect x="3" y="4" width="26" height="18" fill="#dfe6f3" stroke="#445"/><rect x="6" y="7" width="20" height="12" fill="#3a6ea5"/><rect x="10" y="24" width="12" height="4" fill="#99a"/></svg>` },
        { x: 16, y: 86, label: 'Mine dokumenter', svg: folderSvg },
        { x: 16, y: 156, label: 'elev07', svg: folderSvg, onOpen: async () => {
          meta.peeked.elev07 = true; persistMeta();
          if (!meta.ending) { msgBox({ title: 'elev07', icon: 'err', msg: 'Mappen er tom.\n\nAdgang nægtet af administrator (Skole-IT).', buttons: [{ label: 'OK', value: 'ok', def: true }] }); return; }
          // second playthrough: the folder has the file. Deleting it is the one thing the game answers.
          const r = await msgBox({ title: 'elev07', icon: 'info', w: 340, msg: meta.deletedLog ? '(tom)' : 'elev07.txt        2 KB   17-11-2005 16:04\n\n1 objekt', buttons: meta.deletedLog ? [{ label: 'Luk', value: 'x', def: true }] : [{ label: 'Åbn', value: 'open', def: true }, { label: 'Slet', value: 'del' }, { label: 'Luk', value: 'x' }] });
          if (r === 'del') { meta.deletedLog = true; persistMeta(); await msgBox({ title: 'Regn med Måneby', icon: 'warn', msg: 'Du prøvede at slette hende.', buttons: [{ label: 'OK', value: 'ok', def: true }] }); }
          else if (r === 'open') await msgBox({ title: 'elev07.txt - Notesblok', icon: 'info', w: 360, msg: '17-11-2005 15:40  elev07 logget ind\n15:41  Rådhuset: "Rådhuss" (skrevet af bruger)\n15:44  hjælp ×38\n15:52  Landingspladsen: 12 kasser. svar: 11\n15:58  "hvor mange bor her" — intet svar\n16:03  hjælp ×400 i alt\n16:04  tilbage om lidt', buttons: [{ label: 'Luk', value: 'x', def: true }] });
        } },
        { x: 16, y: 226, label: 'REGN MED MÅNEBY (E:)', svg: cdSvg, onOpen: start },
        { x: 100, y: 16, label: 'Sluk skærmen efter brug.txt', svg: docSvg, onOpen: () => msgBox({ title: 'Sluk skærmen efter brug.txt - Notesblok', icon: 'info', msg: 'Husk at slukke skærmen efter brug.\nLog af med Ctrl+Alt+Delete.\nSpørg en voksen, hvis noget ikke virker.\n\n– Skole-IT, Teknisk Forvaltning', w: 320, buttons: [{ label: 'Luk', value: 'ok', def: true }] }) },
      ],
    });
    // hint: a gentle tooltip after a while if nobody double-clicks
    setTimeout(() => { const el = document.querySelector('#os .desk-icon:nth-child(4) span'); if (el && document.getElementById('app').style.visibility === 'hidden') el.style.outline = '1px dotted #fff'; }, 6000);
  },
});

async function start() {
  ensureAudio();
  sfx.cdSpin(2.4);
  await sleep(900);
  const box = progressBox({ title: 'Regn med Måneby', text: 'Henter data fra cd-rom…' });
  // real preload runs underneath the dramatised bar
  const assets = []; // PNG8 renders will be listed here
  preload(assets);
  await fakeProgress(box, { ms: 2600 });
  box.text('Starter Shockwave-afspiller…');
  await sleep(700);
  box.close();
  showOS(false);
  document.getElementById('app').style.visibility = 'visible';
  showCursor(true);
  goto('title');
}

register({
  id: 'title',
  async enter() {
    lock(false);
    const b = bg('hub');
    this.t0 = performance.now();
    music(save.night ? 'assets/music/titel_nat.ogg' : 'assets/music/titel_b.ogg', { fade: 1.2 });
    button('Start', 280, 400, () => { sfx.click(); goto('setup'); }, { w: 80 });
    if (save.name) button('Fortsæt', 280, 436, () => { sfx.click(); goto('hub'); }, { w: 80 });
    this.bgc = b;
  },
  bg(g, dt, t) {
    g.drawImage(this.bgc, 0, 0);
    // title logo: big kid-font with hard shadow (placeholder for the real logo render)
    const bob = 0; // era rule: no continuous motion on the title
    drawText('REGN MED', 320, 70 + bob, { align: 'center', font: '700 34px "Comic Neue","Comic Sans MS",sans-serif', color: '#ffd21f', outline: '#5a3a00' });
    drawText('MÅNEBY', 320, 108 + bob, { align: 'center', font: '700 58px "Comic Neue","Comic Sans MS",sans-serif', color: '#ffd21f', outline: '#5a3a00' });
    drawText('Krater Multimedie ApS, Valby · 2005 · Afprøvet i 4.b', 320, 456, { align: 'center', font: '11px Tahoma, sans-serif', color: '#ccc' });
    drawText('Ver. 1.3.63', 8, 464, { font: '11px Tahoma, sans-serif', color: '#aaa' });
  },
});

register({
  id: 'setup',
  async enter() {
    const ui = document.getElementById('ui');
    const inp = document.createElement('input');
    inp.className = 'input'; inp.maxLength = 14; inp.style.left = '220px'; inp.style.top = '150px'; inp.style.width = '200px';
    inp.value = save.name || (meta.starts === 1 ? 'B' : ''); // first ever start: pre-filled with one letter
    ui.appendChild(inp);
    setTimeout(() => inp.focus(), 50);
    const chips = [];
    let grade = save.grade || 3, sixClicks = 0;
    for (let i = 1; i <= 6; i++) {
      const c = document.createElement('div'); c.className = 'chip' + (grade === i ? ' on' : ''); c.textContent = i + '.';
      c.style.left = 200 + (i - 1) * 42 + 'px'; c.style.top = '240px';
      c.addEventListener('pointerdown', (e) => {
        e.stopPropagation(); sfx.pop();
        if (i === 6) { sixClicks++; if (sixClicks === 7 && !chips[6]) { const s = document.createElement('div'); s.className = 'chip'; s.textContent = '7.'; s.style.left = '452px'; s.style.top = '240px'; s.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); grade = 7; chips.forEach((x) => x && x.classList.remove('on')); s.classList.add('on'); sfx.bzzt(); }); ui.appendChild(s); chips[6] = s; } } else sixClicks = 0;
        grade = i; chips.forEach((x) => x && x.classList.remove('on')); c.classList.add('on');
      });
      ui.appendChild(c); chips.push(c);
    }
    button('OK', 300, 330, () => {
      const name = inp.value.trim() || 'Bygmester';
      save.name = name; save.grade = grade;
      if (meta.ending) { save.night = true; save.flags.hall_open = true; } // second playthrough starts at 15:40, in the night
      if (!meta.firstName) meta.firstName = name;
      if (!meta.names.includes(name)) meta.names.push(name);
      persistMeta(); persist(true);
      sfx.ok();
      goto('hub', { first: !Object.keys(save.buildings).length });
    }, { w: 60 });
    this.bgc = bg('hub');
  },
  bg(g) {
    g.drawImage(this.bgc, 0, 0);
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(150, 100, 340, 280);
    drawText('Skriv dit navn:', 220, 124, { font: '700 16px "Comic Neue","Comic Sans MS",sans-serif', color: '#fff' });
    drawText('Hvilken klasse går du i?', 220, 212, { font: '700 16px "Comic Neue","Comic Sans MS",sans-serif', color: '#fff' });
  },
});
