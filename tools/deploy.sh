#!/bin/bash
# Build dist/ and publish it to the gh-pages branch (GitHub Pages). First run creates the repo.
set -e
cd "$(dirname "$0")/.."
REPO="${REPO:-publicsoda-png/mord-i-maaneby}"
node tools/build.mjs
if ! gh repo view "$REPO" >/dev/null 2>&1; then
  gh repo create "$REPO" --public --source=. --remote=origin --description "Regn med Måneby — et dansk matematik-cd-rom-spil fra 2005 (fan-inspireret hyldest, Krater Multimedie ApS)" --push
fi
git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$REPO.git"
git push -q origin HEAD:main
WT=.gh-pages-wt
rm -rf "$WT" 2>/dev/null || true
git worktree prune
if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  git fetch -q origin gh-pages
  git worktree add -q "$WT" gh-pages
else
  git worktree add -q --detach "$WT"
  (cd "$WT" && git checkout -q --orphan gh-pages && git rm -rfq . >/dev/null 2>&1 || true)
fi
find "$WT" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R dist/. "$WT"/
(cd "$WT" && git add -A && git -c user.name="deploy" -c user.email="deploy@local" commit -q -m "deploy $(git -C .. rev-parse --short HEAD)" --allow-empty && git push -q -f origin gh-pages)
git worktree remove -f "$WT"
gh api -X POST "repos/$REPO/pages" -f build_type=legacy -f 'source[branch]=gh-pages' -f 'source[path]=/' >/dev/null 2>&1 || true
echo "https://$(echo "$REPO" | cut -d/ -f1).github.io/$(echo "$REPO" | cut -d/ -f2)/"
