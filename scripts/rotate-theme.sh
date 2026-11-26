#!/usr/bin/env bash
# Puts this week's art theme in place as the homepage.
#   scripts/rotate-theme.sh            -> theme for the current week (see order below)
#   scripts/rotate-theme.sh miro       -> force a specific theme
# Prints the theme it used. The weekly GitHub Action (.github/workflows/weekly-theme.yml)
# runs this every Friday morning, then commits and pushes the result.
set -euo pipefail
cd "$(dirname "$0")/.."

THEMES=(modigliani miro kandinsky)   # rotation order
ANCHOR=2026-11-27                    # the Friday Modigliani goes live (week 0)

if [[ $# -ge 1 && -n "$1" ]]; then
  theme="$1"
else
  anchor=$(date -u -d "$ANCHOR 00:00:00" +%s 2>/dev/null || date -u -j -f "%Y-%m-%d %H:%M:%S" "$ANCHOR 00:00:00" +%s)
  now=$(date -u +%s)
  weeks=$(( (now - anchor) / 604800 ))
  (( weeks < 0 )) && weeks=0
  theme=${THEMES[$(( weeks % ${#THEMES[@]} ))]}
fi

src="themes/$theme.html"
[[ -f "$src" ]] || { echo "No theme file: $src" >&2; exit 1; }
cp "$src" index.html
# keep the sitemap's "last modified" date current
today=$(date -u +%Y-%m-%d)
sed -i.bak -E "s|<lastmod>[0-9-]+</lastmod>|<lastmod>$today</lastmod>|" sitemap.xml && rm -f sitemap.xml.bak
echo "$theme"
