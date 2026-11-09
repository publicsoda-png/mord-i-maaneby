# Regn med Måneby

Et dansk matematik-cd-rom-spil fra 2005, udgivet af Krater Multimedie ApS, Valby. Afprøvet i 4.b.

Spil: https://publicsoda-png.github.io/mord-i-maaneby/ — åbn i Chrome eller Safari, 640×480, lyd kræver ét klik på cd-ikonet.

Demo (akt 1) som claude.ai-artifact: https://claude.ai/artifact/6sKCTCbDutE5ejoRGierRK

## Udvikling

```
python3 -m http.server 4873          # dev-server i mappen
open "http://127.0.0.1:4873/?dev&scene=hub&first&name=Test"
node tools/test/shots.mjs            # screenshots + konsolfejl
node tools/test/flow.mjs             # gennemspilning: alle scener, minispil, hele wrongness-kurven
node tools/test/polish.mjs           # æra-gates (docs/QUALITY-PLAN.md)
node tools/build.mjs [--artifact]    # dist/ (Pages) eller dist-artifact/ (demo ≤16 MB)
tools/deploy.sh                      # build + push til gh-pages
```

Dev-parametre: `?dev&scene=<id>` · `&plot=<landing|bakery|ice|scope|school|quarry|hall|light>` · `&nat` · `&min=45` (spilletid i minutter, styrer kurven) · `&name=X` · `&reset`.

Dokumentation: `docs/PLAN.md`, `docs/DECISIONS.md`, `docs/QUALITY-PLAN.md`, `docs/LYDPLAN.md`, `docs/MINISPIL-SPEC.md`.

Fan-inspireret hyldest til genren. Ikke tilknyttet Bitfrost Interactive eller maaneby.dk. Alle figurer, steder og personer er opdigtede.
