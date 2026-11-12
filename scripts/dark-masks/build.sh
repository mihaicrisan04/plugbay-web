#!/bin/sh
# Rebuilds the dark-theme stipple mask from its light mask. Run from the repo root.
# The light mask is read only. Settings are per plate; see relight.py (and darken.py, whose
# parts it uses) for what they do. It ends by clearing every lit pixel outside the object's solid lit surfaces
# and by smoothing the silhouette where the light mask's outline is dotted, so do not tidy the
# output by hand: a rerun would undo it. Change the settings or the scripts instead.
set -e
here=scripts/dark-masks
# Review sheets (light, dark before, dark after) and step images land here, untracked.
out=.shots/dark-masks
mkdir -p "$out"
# The hero keeps the light mask's own drawing: see relight.py and patch-bay.json.
relight() { uv run -q --with numpy --with pillow --with scipy python "$here/relight.py" "$@"; }
sheet() { uv run -q --with numpy --with pillow --with scipy python "$here/sheet.py" "$@"; }

relight src/assets/patch-bay.png src/assets/patch-bay-dark.png "$here/patch-bay.json"

sheet src/assets/patch-bay.png src/assets/patch-bay-dark.png "$out/patch-bay.png" 1

# The mask carries a note saying where it came from. A rebuild writes a new file, so write it again.
impeccable=.claude/skills/impeccable/scripts/impeccable
if [ -x "$impeccable" ]; then
  origin=$(mktemp)
  echo "Origin: derived, not generated. Dark-theme mask computed from the light mask beside it (same name without -dark) by scripts/dark-masks/build.sh, which relights the drawing inside its silhouette. No image model was used for this file." > "$origin"
  "$impeccable" embed-prompt src/assets/patch-bay-dark.png --prompt-file "$origin" > /dev/null
  rm "$origin"
fi
