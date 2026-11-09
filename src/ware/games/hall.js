// Rådhuset (act 3 only): one slider 0–20 and one bar. "Hvor mange Fnugger bor i Måneby?" There are no wrong answers.
// 12 → the helper says nothing. 11 → "Ja. Elleve." Only one sound: the slider rattle (mg_slider_rasle per step); buttons are silent.
// Night: the same.
const FONT = '"Comic Neue","Comic Sans MS","Chalkboard SE",cursive';
let lastAnswer = null;

export default {
  id: 'hall',
  lines: {
    hall_intro: 'Rådhuset vil gerne vide det. Hvor mange Fnugger bor der i Måneby? Træk i skyderen, og tryk Svar.',
    hall_ok: () => (lastAnswer === 12 ? '…' : lastAnswer === 11 ? 'Ja. Elleve.' : 'Så mange. Det skriver vi.'),
    hall_wrong: '…',
  },
  setup(a) {
    const night = a.opts.night === true;
    lastAnswer = null;
    const MAX = 20;
    // chart paper: 280×290 at (180..460, 108..398)
    const PX = 180, PY = 108, PW = 280, PH = 290, BASE = PY + PH - 36, TOP = PY + 28;
    const paper = a.spr(PX + PW / 2, PY + PH / 2, PW, PH, (g, v) => {
      g.fillStyle = night ? '#1b1e29' : '#5e5a52'; g.fillRect(4, 4, PW - 4, PH - 4);          // hard shadow
      g.fillStyle = night ? '#2a2e3c' : '#f4f1ea'; g.fillRect(0, 0, PW - 4, PH - 4);          // paper
      g.strokeStyle = night ? '#3a3f52' : '#d4d0c8'; g.lineWidth = 1;
      for (let i = 0; i <= MAX; i += 2) { const y = Math.round(BASE - PY - (i / MAX) * (BASE - TOP)) + 0.5; g.beginPath(); g.moveTo(40, y); g.lineTo(PW - 16, y); g.stroke(); }
      g.fillStyle = night ? '#9aa0b8' : '#111';
      g.fillRect(40, TOP - PY - 6, 2, BASE - TOP + 8); g.fillRect(40, BASE - PY, PW - 56, 2); // axes
      // bar
      const h = Math.round((v / MAX) * (BASE - TOP));
      const bx = 120, bw = 72;
      g.fillStyle = night ? '#0f1119' : '#5a1f1a'; g.fillRect(bx + 4, BASE - PY - h + 4, bw, h);
      g.fillStyle = night ? '#4a4f60' : '#c9352b'; g.fillRect(bx, BASE - PY - h, bw, h);
      g.fillStyle = night ? '#6a7088' : '#e86a5a'; g.fillRect(bx, BASE - PY - h, 10, h);
    });
    // axis labels (1-bit canvas text)
    for (let i = 0; i <= MAX; i += 4) a.text(String(i), PX + 14, BASE - (i / MAX) * (BASE - TOP) - 9, { fontSize: '12px', color: night ? '#9aa0b8' : '#111', textShadow: 'none', width: '22px', textAlign: 'right', fontFamily: FONT });
    const value = a.text('0', PX + 120, TOP - 26, { fontSize: '26px', color: night ? '#e0e3ee' : '#111', textShadow: 'none', width: '72px', textAlign: 'center', fontFamily: FONT });
    a.text('Fnugger', PX + 180, BASE - 2, { fontSize: '13px', color: night ? '#9aa0b8' : '#333', textShadow: 'none', fontFamily: FONT });
    a.text('Hvor mange Fnugger bor i Måneby?', 0, 78, { width: '640px', textAlign: 'center', fontSize: '19px', fontFamily: FONT });

    // ---- Win2000-style slider (DOM range input; stopPropagation keeps the engine from eating the drag)
    const style = document.createElement('style');
    style.textContent = `
      #field input.mb-slider { -webkit-appearance: none; appearance: none; position: absolute; pointer-events: auto; margin: 0; height: 22px; background: transparent; outline: none; }
      #field input.mb-slider::-webkit-slider-runnable-track { height: 6px; background: ${night ? '#0f1119' : '#808080'}; border: 1px solid; border-color: ${night ? '#000 #3a3f52 #3a3f52 #000' : '#404040 #fff #fff #404040'}; }
      #field input.mb-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 22px; margin-top: -9px; background: ${night ? '#2a2e3c' : '#d4d0c8'}; border: 2px solid; border-color: ${night ? '#4a4f60 #000 #000 #4a4f60' : '#fff #404040 #404040 #fff'}; box-shadow: 1px 1px 0 #000; }
      #field input.mb-slider::-moz-range-track { height: 6px; background: ${night ? '#0f1119' : '#808080'}; border: 1px solid #404040; }
      #field input.mb-slider::-moz-range-thumb { width: 14px; height: 22px; border-radius: 0; background: ${night ? '#2a2e3c' : '#d4d0c8'}; border: 2px solid #404040; }
    `;
    a.field.appendChild(style);
    const SX = PX, SY = 414, SW = PW;
    a.spr(SX + SW / 2, SY + 11, SW + 16, 34, (g) => { g.fillStyle = night ? '#1b1e29' : '#d4d0c8'; g.fillRect(0, 0, SW + 16, 34); g.fillStyle = night ? '#000' : '#fff'; g.fillRect(0, 0, SW + 16, 2); g.fillRect(0, 0, 2, 34); g.fillStyle = night ? '#3a3f52' : '#404040'; g.fillRect(0, 32, SW + 16, 2); g.fillRect(SW + 14, 0, 2, 34); });
    // tick marks under the slider
    a.spr(SX + SW / 2, SY + 28, SW, 6, (g) => { g.fillStyle = night ? '#6a7088' : '#404040'; const inner = SW - 14; for (let i = 0; i <= MAX; i++) g.fillRect(Math.round(7 + (i / MAX) * inner) - 1, 0, 1, i % 5 ? 3 : 6); });
    const input = document.createElement('input');
    input.type = 'range'; input.min = '0'; input.max = String(MAX); input.step = '1'; input.value = '0';
    input.className = 'o mb-slider';
    Object.assign(input.style, { left: SX + 'px', top: SY + 'px', width: SW + 'px' });
    ['pointerdown', 'pointerup', 'pointermove'].forEach((ev) => input.addEventListener(ev, (e) => e.stopPropagation()));
    a.field.appendChild(input);
    let cur = 0;
    const setVal = (v) => {
      v = Math.max(0, Math.min(MAX, v | 0));
      if (v === cur) return;
      const steps = Math.abs(v - cur);
      cur = v; input.value = String(v);
      value.textContent = String(v); paper.redraw(v);
      // the one sound: slider rattle, one tick per step (capped so a fast drag doesn't buzz)
      for (let i = 0; i < Math.min(steps, 4); i++) a.after(i * 18, () => a.play('slider_rasle', { gain: 0.6, pan: a.pan(SX + (v / MAX) * SW) }));
    };
    input.addEventListener('input', () => setVal(+input.value));
    // small stone arrows as a clickable alternative to dragging
    a.btn('◄', SX - 44, SY - 2, () => setVal(cur - 1), { width: '32px', silent: true });
    a.btn('►', SX + SW + 20, SY - 2, () => setVal(cur + 1), { width: '32px', silent: true });

    let done = false;
    a.btn('Svar', 486, 300, () => {
      if (done) return; done = true;
      lastAnswer = cur;
      input.disabled = true;
      // no ok-sound of our own; the helper's reply (or silence) comes from lines.hall_ok
      a.after(cur === 12 ? 900 : 300, () => a.done({ ok: true, answer: cur, silent: cur === 12 }));
    }, { width: '110px', silent: true });
  },
};
