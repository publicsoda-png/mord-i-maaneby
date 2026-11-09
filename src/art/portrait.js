// Placeholder helper portrait (procedural "Morfar Måne" — half-moon face in a rocking chair). Replaced by renders later.
// helper = {mouth 0..3, mood, night, present}
export function drawPortrait(g, h, transparent = false) {
  const W = 96, H = 112;
  g.clearRect(0, 0, W, H);
  if (!transparent) { g.fillStyle = h.night ? '#0a0a14' : '#1a1230'; g.fillRect(0, 0, W, H); }
  if (!h.present) {
    // empty rocking chair
    g.strokeStyle = '#6b4a2a'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(22, 100); g.quadraticCurveTo(48, 112, 74, 100); g.stroke();
    g.strokeRect(30, 56, 36, 44);
    return;
  }
  // moon face (crescent-ish)
  g.fillStyle = '#efe7c2';
  g.beginPath(); g.arc(50, 50, 34, 0, Math.PI * 2); g.fill();
  g.save(); g.globalCompositeOperation = transparent ? 'destination-out' : 'source-over'; g.fillStyle = h.night ? '#0a0a14' : '#1a1230';
  g.beginPath(); g.arc(70, 40, 26, 0, Math.PI * 2); g.fill(); g.restore();
  // craters
  g.fillStyle = '#d9cf9f';
  [[32, 36, 4], [40, 62, 3], [28, 56, 2], [46, 28, 2]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
  // pince-nez eye
  g.fillStyle = '#fff'; g.beginPath(); g.arc(36, 44, 6, 0, 7); g.fill();
  g.fillStyle = h.mood === 'off' ? '#000' : '#2a2a3a'; g.beginPath(); g.arc(h.mood === 'stare' ? 38 : 37, 45, 2.6, 0, 7); g.fill();
  g.strokeStyle = '#444'; g.lineWidth = 1; g.beginPath(); g.arc(36, 44, 7.5, 0, 7); g.stroke();
  // beard = mouth (moves instead of the mouth)
  const m = h.mouth || 0;
  g.fillStyle = '#f4f4f4';
  g.beginPath();
  g.moveTo(22, 62);
  g.quadraticCurveTo(32, 86 + m * 4, 46, 90 + m * 5);
  g.quadraticCurveTo(52, 80, 48, 64);
  g.closePath(); g.fill();
  // moustache
  g.fillStyle = '#e8e8e8';
  g.beginPath(); g.ellipse(36, 60 + m, 12, 4 + m * 0.8, 0, 0, 7); g.fill();
  // cardigan
  g.fillStyle = '#6b3a2a'; g.fillRect(14, 86, 56, 26);
  g.fillStyle = '#c99'; g.fillRect(40, 88, 4, 22);
  g.fillStyle = '#ffd'; [92, 100, 108].forEach((y) => g.fillRect(41, y, 2, 2));
}
