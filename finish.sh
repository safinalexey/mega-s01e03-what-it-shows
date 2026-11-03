#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
if [[ "${1:-}" != "--publish" ]]; then
  echo 'Review the engineering outcome in src/routes/kb/incidents/4471-investigation/+page.svx.'
  echo 'To approve pushing the updated KB and closing issues #1 (completed) and #2 (not planned), run:'
  echo '  bash finish.sh --publish'
  exit 0
fi
repo='safinalexey/mega-s01e03-what-it-shows'
origin=$(git remote get-url origin)
case "$origin" in
  "https://github.com/$repo.git"|"https://github.com/$repo"|"git@github.com:$repo.git") ;;
  *) echo "Unexpected origin: $origin. Stopping."; exit 1 ;;
esac
npm run build
git add README.md src/routes/kb/incidents/4471-investigation/+page.svx build analysis issues finish.sh
if ! git diff --cached --quiet; then
  git commit -m 'Record engineering dispositions for #4471'
fi
git push origin HEAD:main
gh issue close 1 --repo "$repo" --reason completed \
  --comment 'The course engineering update reports #4471 closed on 5 October 2026. Parser FIXED: fix(dates): parse dd/mm for eu locales. Closing this 379-report parser ticket as completed. Source: https://hq.mega.dev/challenges/what-it-shows . The KB records this as an engineering report, not independent production verification.'
gh issue close 2 --repo "$repo" --reason 'not planned' \
  --comment 'The course engineering update reports #4471 closed on 5 October 2026. Hint WON’T FIX: booking-v3 form retired. Closing this 33-report hint ticket as not planned because the affected form was retired; this is not a claim that its code was fixed. Source: https://hq.mega.dev/challenges/what-it-shows .'
gh issue list --repo "$repo" --state closed --json number,title,state,url
