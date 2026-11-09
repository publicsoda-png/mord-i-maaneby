// Build dist/: copies the static site (no bundler), drops raw/dev material, writes a size report.
// Usage: node tools/build.mjs [--artifact]   (--artifact = akt-1 variant: m4a dropped, kept ≤ 16 MB for claude.ai)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifact = process.argv.includes('--artifact');
const dist = path.join(root, artifact ? 'dist-artifact' : 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const skip = (rel) => rel.startsWith('assets/raw') || rel.endsWith('.DS_Store') || rel.endsWith('.pal.json') || rel.endsWith('.txt') && rel.startsWith('assets/')
  || (artifact && rel.endsWith('.m4a'));
let total = 0; const rows = [];
function copy(rel) {
  const src = path.join(root, rel);
  const st = fs.statSync(src);
  if (st.isDirectory()) { for (const f of fs.readdirSync(src)) copy(path.join(rel, f)); return; }
  if (skip(rel)) return;
  const dst = path.join(dist, rel); fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst); total += st.size; rows.push([rel, st.size]);
}
for (const rel of ['index.html', 'style.css', 'src', 'assets']) if (fs.existsSync(path.join(root, rel))) copy(rel);
// .nojekyll so Pages serves everything as-is
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
const byDir = {};
for (const [rel, size] of rows) { const d = rel.split('/').slice(0, 2).join('/'); byDir[d] = (byDir[d] || 0) + size; }
const report = Object.entries(byDir).sort((a, b) => b[1] - a[1]).map(([d, s]) => `${(s / 1048576).toFixed(2).padStart(7)} MB  ${d}`).join('\n');
console.log(report + `\n${(total / 1048576).toFixed(2).padStart(7)} MB  TOTAL (${rows.length} files) → ${path.relative(root, dist)}`);
if (artifact && total > 16 * 1048576) { console.error('ARTIFACT TOO BIG'); process.exit(1); }
