# Afblinder council C3: ranking + scores -> originale celler (sheet:index), skriver top-12 forslag + noter.
import json, sys, os, re
S = sys.argv[1]
out = json.load(open(os.path.join(S, '..', 'tasks', sys.argv[2] + '.output')))
res = out['result'] if 'result' in out else out
final = res['final']
key = json.load(open(os.path.join(S, 'council-c3', 'blind-key', 'key.json')))
# key: blind id -> original path (shape varies: dict or list)
m = {}
if isinstance(key, dict):
    for k, v in (key.get('mapping') or key.get('map') or key).items():
        if isinstance(v, str): m[k] = v
        elif isinstance(v, dict): m[k] = v.get('src') or v.get('original') or v.get('path') or json.dumps(v)
else:
    for e in key: m[e.get('id') or e.get('blind')] = e.get('src') or e.get('original') or e.get('path')
def cell(p):
    mm = re.search(r'alien_(\d)_(\d)', p or ''); return f'{mm.group(1)}:{mm.group(2)}' if mm else p
rows = []
for s in final['scores']:
    rows.append((s['id'], s['avg'], s.get('vetoed'), cell(m.get(s['id']))))
for r in rows: print(*r)
print('NOTES:', json.dumps(final.get('notes'), ensure_ascii=False)[:3000])
print('VETOES:', json.dumps(final.get('vetoes'), ensure_ascii=False)[:1500])
print('FIXES:', json.dumps(final.get('fixes'), ensure_ascii=False)[:4000])
