# Minispil-spec (til agenter der bygger `src/ware/games/<id>.js`)

Læs først: `src/ware/engine.js` (api), `src/ware/games/landing.js` (eksempel), `src/opg.js` (opgavegenerator), `docs/PLAN.md` §2–3, `docs/LYDPLAN.md` §4C (lyde pr. plads), `docs/DECISIONS.md`.

## Kontrakt
```js
export default {
  id: 'bakery',
  lines: { bakery_intro: '…', bakery_ok: '…', bakery_wrong: () => pick([...]) },   // dansk, hjælperens stemme, ingen udråbstegn-overflod
  setup(a) { … a.done({ ok: true, stars: 3 }) }
}
```
- `a.opts` = `{ grade 1..6, seed, night, save, say, onWrong }`. Kald `a.opts.onWrong()` ved forkert svar (task.js tæller og vælger bygningstrin). Afslut altid med `a.done({ok:true})` — spillet skal kunne gennemføres af alle, også efter fejl (børnespil: man kan altid prøve igen).
- Brug `seeded(a.opts.seed)` fra opg.js til alt tilfældigt (determinisme til test).
- Kun DOM-sprites via `a.spr/a.add/a.text/a.btn` i `#field` (640×480, origin øverst venstre). Tegn med canvas-API i `spr`-callbacks: flade farver, hårde skygger, ingen gradients ud over 2-trins, ingen anti-aliasing-fornemmelse (brug `imageSmoothingEnabled=false`, hele pixels).
- Lyd: kun `a.sfx.*` fra `src/core/audio.js` (`tick click ok good bad pop thud sticker bzzt blip(f,dur,gain,type,f1)`). Ingen nye filer.
- **Stil-regler (målt på 2005-originalen):** intet konstant idle-bob; animationer er step-baserede (2–4 frames) eller korte Web Animations (`a.anim`) med `easing: 'steps(n)'` eller linear; sceneskift sker udenfor (task.js klipper gennem sort).
- Tekstbokse ovenpå: hjælperen taler via `a.opts.say(text, {auto: ms})` — brug sparsomt (1–2 gange pr. spil).
- `a.opts.night === true`: **nat-variant** af samme spil (jf. PLAN §2/§3) — samme kode, anden adfærd. Ingen nye lyde om natten, kun færre.
- Svartyper: tal → altid flervalg (4 knapper, `choices()` fra opg.js) ELLER klik på objekter. Tastatur kun i Kraterskolen (se nedenfor).
- Ingen tekst i billeder på engelsk. Ingen referencer til eksisterende spil/figurer.
- Rør KUN din egen fil `src/ware/games/<id>.js`. Ingen ændringer i engine/task/script/hub. Ingen git-commits. Test med `node tools/test/shots.mjs "dev&scene=task&plot=<id>&name=Test"` (og `&nat`) — 0 konsolfejl er krav; se skærmbilleder i `tools/test/shots/`.

## Pladserne

| id | Navn | Arketype (dag) | Nat / wrongness |
|---|---|---|---|
| bakery | Kraterbageriet | Opskrift: "Fnuggerne skal have 3 boller hver, der er N Fnugger" → klik boller ind i bakke (venstreklik = 1, **højreklik = 5**); tjek med knap "Bag" | Efter 3 ingredienser (nat) bliver bakken til en håndskrevet madpakkeseddel (canvas-tekst på ternet papir: "1 rugbrød, 1 æble, 1 … ") → `a.done({ok:true, fever:'madpakke'})` (Feberdrøm II udløses af task.js senere — bare returnér flaget) |
| ice | Isværket | Rørføring: 3 ventiler med brøker (fx 1/2, 1/4, 3/4); drej dem så der løber præcis X liter (opg 'frac'); vand animeres i steps | Nat: en fjerde ventil uden tal; drejes den, løber vandet opad |
| scope | Stjernekikkerten | Koordinater: gitter 0–7 × 0–5 (grade>4: negative), klik på stjernen i (x,y) 4 gange → stjernebillede tegnes med linjer | Dag fra min 17 ("vakler" — `a.opts.save.flags.scope_face`): de 4 stjerner danner et ansigt. Nat: ansigtet kigger (pupil-sprite følger cursor) |
| school | Kraterskolen | Call-and-response-quiz med **tastatur-UI på skærmen** (tal 0–9 som sten-taster, tegnet i DOM, klikbare + ægte keydown). 5 spørgsmål fra `opg('add'|'mul')`. | Fra `save.flags.seven_missing` (min 35): 5. spørgsmål er `sevenTask()` (svar 7) og **7-tasten mangler** på tastaturet (hul i rækken). Spilleren kan ikke svare; efter 5 s stilhed siger hjælperen "… Vi går videre." (`a.opts.say`) og spillet slutter `ok:true, skipped:true`. Nat: 7-tasten er der, men trykkes den, står der "Handler not defined" (bare tekst, ingen OS-dialog) |
| quarry | Kridtgruben | Breakout: padle nederst, bold, krystaller med tal øverst; opgave "slå alle krystaller der går op i 12" (grade-skaleret divisor); forkert krystal → `onWrong`, bolden fortsætter | Nat (`cursed`): "slå de **forkerte**" — krystaller med rigtige svar må ikke rammes; rammes de, bliver de til små grå Fnug-silhuetter der står tilbage i bunden. Musikken er `plads_c_cursed` (task.js styrer) |
| light | Fyrtårnet | Vinkler: lampen peger 0°; "Drej lyset 90°" → klik på drej-knapper (+15°/−15°) og "Lys"; stråle tegnes; 3 opgaver (`opg('angle')`) | Nat: lampen blinker selv i morse **S-Y-V** (··· —·—— ···—) med 800 Hz `blip`, 3 gentagelser, så stilhed; spilleren kan kun klikke "Tilbage" (returnér `ok:true, morse:true` efter 3 gentagelser) |
| hall | Rådhuset (kun akt 3) | Søjlediagram-slider: "Hvor mange Fnugger bor i Måneby?" — én slider 0–20, vis søjle; svar 12 → hjælperen tier (ingen ok-lyd), svar 11 → hjælperen siger "Ja. Elleve." `a.done({ok:true, answer})`. Ingen forkerte svar. Kun lyden "slider-rasle" (`blip(200,0.02,0.05,'square')` pr. trin) | Samme |

Stjerner/trin: task.js beregner trin ud fra antal `onWrong`. Returnér ekstra felter frit (`fever`, `skipped`, `morse`, `answer`) — de gemmes af task.js senere.
