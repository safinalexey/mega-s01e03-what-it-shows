#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")"

if [[ "${1:-}" != "--publish" ]]; then
  echo 'Review README.md, issues/parser.md, issues/hint.md and build/kb/incidents/4471-investigation/index.html.'
  echo 'To approve creating safinalexey/mega-s01e03-what-it-shows publicly, pushing this folder, and opening its two issues:'
  echo '  bash publish.sh --publish'
  exit 0
fi

repo='safinalexey/mega-s01e03-what-it-shows'
account=$(gh api user --jq .login)
[[ "$account" == 'safinalexey' ]] || { echo "Expected safinalexey; signed in as $account. Stopping."; exit 1; }
[[ -f build/kb/incidents/4471-investigation/index.html ]] || { echo 'Run npm run build first.'; exit 1; }
node scripts/analyze.mjs

if [[ ! -d .git ]]; then
  git init -b main
fi
if git remote get-url origin >/dev/null 2>&1; then
  origin=$(git remote get-url origin)
  case "$origin" in
    "https://github.com/$repo.git"|"https://github.com/$repo"|"git@github.com:$repo.git") ;;
    *) echo "Unexpected origin: $origin. Stopping."; exit 1 ;;
  esac
fi
git add .
if ! git diff --cached --quiet; then
  git commit -m 'Investigate #4471 and render signed support KB pages'
fi
if git remote get-url origin >/dev/null 2>&1; then
  git push -u origin HEAD:main
else
  # Refuses an existing repo rather than adding files to an unrelated repository.
  gh repo create "$repo" --public --source=. --remote=origin --push \
    --description 'MEGA.dev S01E03: support ticket investigation and rendered knowledge base'
fi

mkdir -p .submission-state
for cause in parser hint; do
  title=$(sed -n '1s/^# //p' "issues/$cause.md")
  gh issue list --repo "$repo" --state all --limit 100 --json title,url > .submission-state/issues.json
  existing=$(node --input-type=module -e 'import fs from "node:fs"; const rows=JSON.parse(fs.readFileSync(process.argv[1])); console.log(rows.find(r=>r.title===process.argv[2])?.url??"")' .submission-state/issues.json "$title")
  if [[ -n "$existing" ]]; then
    echo "$existing"
  else
    gh issue create --repo "$repo" --title "$title" --body-file "issues/$cause.md"
  fi
done
echo "Ready for course submission: https://github.com/$repo"
