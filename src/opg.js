// Opgavegenerator: opg(type, grade 1..6, rnd) → {q, a, choices?, unit?}. Integer answers only. Deterministic with seed.
export function seeded(seed) { let s = seed >>> 0 || 7; return () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296); }
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));

export const TYPES = ['count', 'add', 'sub_hidden', 'mul', 'div', 'frac', 'area', 'angle', 'chart', 'coord'];

export function opg(type, grade, r = Math.random) {
  grade = Math.max(1, Math.min(6, grade | 0));
  switch (type) {
    case 'count': { const n = ri(r, grade < 3 ? 3 : 6, grade < 3 ? 9 : 10 + grade * 3); return { q: `Hvor mange kasser er der landet?`, a: n, n }; }
    case 'add': {
      const max = [10, 20, 100, 1000, 1000, 10000][grade - 1];
      const a = ri(r, 1, max / 2), b = ri(r, 1, max / 2);
      return { q: `${a} + ${b} = ?`, a: a + b };
    }
    case 'mul': {
      const t = grade < 3 ? [2, 5, 10] : grade < 5 ? [2, 3, 4, 5, 6, 10] : [3, 4, 6, 7, 8, 9, 12];
      const a = t[ri(r, 0, t.length - 1)], b = ri(r, 2, grade < 3 ? 5 : 10);
      return { q: `${a} · ${b} = ?`, a: a * b, parts: [a, b] };
    }
    case 'div': {
      const b = ri(r, 2, grade < 4 ? 5 : 9), q = ri(r, 2, grade < 4 ? 6 : 12);
      return { q: `${b * q} : ${b} = ?`, a: q };
    }
    case 'frac': {
      const d = [2, 2, 4, 4, 5, 10][grade - 1], k = ri(r, 1, d - 1), whole = d * ri(r, 1, grade < 4 ? 3 : 8);
      return { q: `${k}/${d} af ${whole} = ?`, a: (whole / d) * k };
    }
    case 'area': { const w = ri(r, 2, 4 + grade), h = ri(r, 2, 3 + grade); return { q: `En væg er ${w} m bred og ${h} m høj. Hvor mange m² skal males?`, a: w * h, unit: 'm²' }; }
    case 'angle': { const a = [30, 45, 60, 90, 120, 135, 150][ri(r, 0, 6)]; return { q: `Drej lyset ${a}°`, a }; }
    case 'chart': { const v = [ri(r, 1, 9), ri(r, 1, 9), ri(r, 1, 9)]; const i = ri(r, 0, 2); return { q: `Hvor mange kg beton blev der brugt ${['mandag', 'tirsdag', 'onsdag'][i]}?`, a: v[i], values: v }; }
    case 'coord': { const x = ri(r, grade > 4 ? -5 : 0, 7), y = ri(r, grade > 4 ? -5 : 0, 5); return { q: `Find stjernen i (${x}, ${y})`, a: [x, y] }; }
    case 'sub_hidden': {
      // The forbidden operation. The helper never generates it on purpose; used by the finale ("lær ham minus").
      const a = ri(r, 5, 12 + grade * 3), b = ri(r, 1, a - 1);
      return { q: `${a} − ${b} = ?`, a: a - b };
    }
  }
  throw new Error('opg type ' + type);
}

/** The school task whose answer is always 7 (the key that is missing). */
export function sevenTask(grade, r = Math.random) {
  const list = grade < 3
    ? [['3 + 4 = ?'], ['5 + 2 = ?'], ['Hvor mange dage har en uge?']]
    : grade < 5 ? [['42 : 6 = ?'], ['3 + 4 = ?'], ['Hvor mange Fnugger står tilbage?']] : [['49 : 7 = ?'], ['√49 = ?'], ['1 + 2 + 4 = ?']]; // never a minus sign before the Logroom
  const q = list[ri(r, 0, list.length - 1)][0];
  return { q, a: 7 };
}

/** Multiple-choice wrapper: 3 wrong neighbours. */
export function choices(answer, r = Math.random, n = 4) {
  const set = new Set([answer]);
  let guard = 0;
  while (set.size < n && guard++ < 50) { const d = ri(r, -5, 5); if (d && answer + d >= 0) set.add(answer + d); }
  return [...set].sort(() => r() - 0.5);
}
