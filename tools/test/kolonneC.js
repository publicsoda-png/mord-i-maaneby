export const meta = {
  name: 'maaneby-kolonne-c',
  description: 'Kolonne C: blind side-om-side (reference vs. vores) på 4 akser + IP-linse, 3 Claude-dommere, chair = kode',
  phases: [{ title: 'Judges', detail: '3 linser scorer venstre og højre side blindt' }],
}
// args: { pairs_dir, pairs: [{id, file}], out_dir }
const OUT = args.out_dir
const SAFETY = `SIKKERHED (ufravigeligt): Rør ikke Adobe-programmer (ingen MCP-kald, intet osascript). Ingen ændringer i ~/Documents eller ClickUp; skriv kun i ${OUT}. Ingen tunge jobs. Svar på dansk.`
const CTX = `OPGAVE: Du ser ${args.pairs.length} billeder. Hvert billede er to skærmbilleder side om side (venstre 640×480, højre 640×480) fra to forskellige danske edutainment-spil i 2005-stil (prærenderet 3D, 640×480, Director-æraen). Du ved IKKE hvilket der er det gamle originalspil og hvilket der er et nyt spil, og du skal ikke gætte eller lede efter det. Bedøm HVER SIDE for sig, 1–10 pr. akse:
- aera: æra-ægthed — ligner det et ægte 2005-cd-rom-spil (prærenderet 3D, hårde pixelkanter, ingen moderne glat UI, ingen moderne typografi/gradients/blur)?
- liv: rigtig MÆNGDE liv — en scene fra den æra er mest stille stills med få tydelige elementer; for lidt (dødt/tomt uden komposition) og for meget (moderne travlhed) trækker begge ned.
- haandvaerk: skygger, kanter, fringe, konsistent lys og perspektiv, teksturer, at figurer og baggrund sidder i samme verden.
- laesbarhed: kan man straks se hvad man skal, læse tekst og knapper, finde hotspots.
IP-LINSE (ufravigelig, måles samtidig): de to spil må ikke dele ophavsretligt beskyttede udtryk. ip_veto = true KUN hvis én side tydeligt kopierer den andens konkrete figurdesign (fx samme rumvæsen-/troldmandsfigur), samme logo/titelskrift, samme bygningsnavne eller samme prærenderede baggrund. Fælles genre-træk (måne, kratere, rumvæsner generelt, stenknapper, Comic-agtig skrift) er IKKE veto. Begrund kort.
Giv pr. billede og pr. side én konkret rettelse ("fix") der ville løfte den laveste akse — kun ud fra det du ser.`
const LENSES = [
  { key: 'aera', model: 'opus', role: 'Din linse: ÆRA-ÆGTHED og helhed. Du har spillet og set hundredvis af danske cd-rom-spil fra 1998–2007 (Pixeline, Magnus & Myggen, Hugo, Måneby-typen) og ved præcis hvordan de så ud, inklusive deres fejl og charme.' },
  { key: 'haandvaerk', model: 'fable', role: 'Din linse: HÅNDVÆRK og rendering. Du er 3D-/pixelartist og kigger på kanter, fringe, skygger, specular, lysretning, perspektiv, dithering, PNG8-paletter og om lagene sidder sammen.' },
  { key: 'spil', model: 'sonnet', role: 'Din linse: SPILLEREN (8–11 år, 2005) og LÆSBARHED/LIV. Du kigger på om scenen inviterer, om man ser hvad man kan klikke på, om der er passende mængde liv, og om tekst/knapper læses straks.' },
]
const SCORE = {
  type: 'object',
  properties: {
    results: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' },
      left: { type: 'object', properties: { aera: { type: 'number' }, liv: { type: 'number' }, haandvaerk: { type: 'number' }, laesbarhed: { type: 'number' }, fix: { type: 'string' } }, required: ['aera', 'liv', 'haandvaerk', 'laesbarhed', 'fix'] },
      right: { type: 'object', properties: { aera: { type: 'number' }, liv: { type: 'number' }, haandvaerk: { type: 'number' }, laesbarhed: { type: 'number' }, fix: { type: 'string' } }, required: ['aera', 'liv', 'haandvaerk', 'laesbarhed', 'fix'] },
      ip_veto: { type: 'boolean' }, ip_why: { type: 'string' },
    }, required: ['id', 'left', 'right', 'ip_veto', 'ip_why'] } },
  },
  required: ['results'],
}
phase('Judges')
const files = args.pairs.map(p => `- ${p.id}: ${args.pairs_dir}/${p.file}`).join('\n')
const judged = await parallel(LENSES.map(l => () => agent(
  `${SAFETY}\n\n${l.role}\n\n${CTX}\n\nBILLEDER (åbn hvert med Read og se dem i fuld størrelse; brug gerne 'magick <fil> -crop 640x480+0+0' / '+640+0' til ${OUT}/ for at se én side ad gangen i 100 %):\n${files}\n\nReturnér results med ét element pr. id, med venstre og højre side hver for sig.`,
  { label: `judge:${l.key}`, phase: 'Judges', model: l.model, schema: SCORE })))
// Chair = kode: median pr. akse pr. side, min-score, veto-tælling
const AX = ['aera', 'liv', 'haandvaerk', 'laesbarhed']
const med = a => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }
const table = args.pairs.map(p => {
  const rows = judged.map((j, i) => ({ lens: LENSES[i].key, r: (j.results || []).find(x => x.id === p.id) })).filter(x => x.r)
  const side = s => {
    const o = { median: {}, min: 99, fixes: rows.map(x => `${x.lens}: ${x.r[s].fix}`) }
    for (const a of AX) { const v = rows.map(x => Number(x.r[s][a])).filter(Number.isFinite); o.median[a] = med(v); o.min = Math.min(o.min, ...v) }
    o.pass = AX.every(a => o.median[a] >= 7) && o.min >= 5
    return o
  }
  return { id: p.id, left: side('left'), right: side('right'), ip_vetoes: rows.filter(x => x.r.ip_veto).map(x => `${x.lens}: ${x.r.ip_why}`), ip_notes: rows.filter(x => !x.r.ip_veto).map(x => `${x.lens}: ${x.r.ip_why}`), raw: rows.map(x => ({ lens: x.lens, left: x.r.left, right: x.r.right })) }
})
return { table, lenses: LENSES.map(l => l.key) }
