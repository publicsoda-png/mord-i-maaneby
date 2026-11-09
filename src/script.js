// All helper lines live here (Danish). Keys are used by scenes; variants chosen by flags (klaret_klaret, name_syv …).
// TODO: compile from SCRIPT.md (tools/script-md.mjs) once Frederik has edited the bible.
import { save } from './core/state.js';

export const L = {
  intro1: 'Velkommen til Måneby, lille bygmester. Her er stille. Alt for stille, hvis du spørger mig.',
  intro2: 'Fnuggerne vil så gerne bygge en by, men de kan ikke regne. Det kan du. Så hjælper I hinanden.',
  intro3: 'Klik på en byggeplads på kortet, så går vi i gang. Hvis du mangler hjælp, så klik på mig.',
  intro4: 'Fnuggerne hedder det, de blev talt til. Én, To, Tre, og så videre. Det er nemmest.',
  hub_first: 'Lad os begynde med Landingspladsen. Der er landet en masse kasser med byggesten.',
  hub_back: () => pick(['Godt. Hvad skal vi bygge nu?', 'Udmærket. Vælg en ny byggeplads.', 'Fnuggerne venter på dig.']),
  help: () => pick(['Klik på en byggeplads, så fortæller jeg, hvad der skal regnes ud.', 'Rigtige svar giver flotte huse. Forkerte svar giver skæve huse. Men man kan altid prøve igen.', 'I Måneby lægger vi sammen og ganger. Det er alt, hvad man behøver.']),
  landing_intro: 'Kasserne lander ét ad gangen. Tæl dem, og klik på det rigtige tal. Du må gerne klikke på kasserne imens.',
  landing_ok: () => (save.flags.klaret_klaret ? 'Godt klaret klaret! Nu kan Fnuggerne bygge en rigtig landingsplads.' : 'Godt klaret! Nu kan Fnuggerne bygge en rigtig landingsplads.'),
  landing_wrong: () => pick(['Hov, det passer ikke. Tæl en gang til.', 'Det var ikke helt rigtigt. Prøv igen.']),
  sticker: 'Du har fået et klistermærke til dit byggekort!',
  setup_name: 'Skriv dit navn:',
  setup_grade: 'Hvilken klasse går du i?',
};
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const t = (k, ...args) => (typeof L[k] === 'function' ? L[k](...args) : L[k]);
