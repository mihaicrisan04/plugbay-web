#!/bin/sh
# Rebuilds the four dark-theme stipple masks from the light masks. Run from the repo root.
# The light masks are read only. Settings are per plate; see darken.py and relight.py for what
# each one does. Both end by clearing every lit pixel outside the object's solid lit surfaces
# and by smoothing the silhouette where the light mask's outline is dotted, so do not tidy the
# output by hand: a rerun would undo it. Change the settings or the scripts instead.
set -e
here=scripts/dark-masks
# Review sheets (light, dark before, dark after) and step images land here, untracked.
out=.shots/dark-masks
mkdir -p "$out"
run() { uv run -q --with numpy --with pillow --with scipy python "$here/darken.py" "$@"; }
# The hero and the key ring keep the light mask's own drawing: see relight.py and the two .json files.
relight() { uv run -q --with numpy --with pillow --with scipy python "$here/relight.py" "$@"; }
sheet() { uv run -q --with numpy --with pillow --with scipy python "$here/sheet.py" "$@"; }

run src/assets/sockets.png src/assets/sockets-dark.png "$out/sockets-steps.png" \
  '{"scale":0.86,"holes":[[54,56,9,9],[424.5,56,9,9],[55,358,9,9],[424.5,358.5,9,9]]}'
run src/assets/figures/stack/plate.png src/assets/figures/stack/plate-dark.png "$out/plate-steps.png" \
  '{"scale":0.66,"clear":400,"toe":0.3,"mass_level":0.1,"mass_sigma":3,"holes":[[56,50,9,12.5]]}'

relight src/assets/patch-bay.png src/assets/patch-bay-dark.png "$here/patch-bay.json"
relight src/assets/key-ring.png src/assets/key-ring-dark.png "$here/key-ring.json"

sheet src/assets/patch-bay.png src/assets/patch-bay-dark.png "$out/patch-bay.png" 1
sheet src/assets/sockets.png src/assets/sockets-dark.png "$out/sockets.png" 1
sheet src/assets/key-ring.png src/assets/key-ring-dark.png "$out/key-ring.png" 1
sheet src/assets/figures/stack/plate.png src/assets/figures/stack/plate-dark.png "$out/plate.png" 2

# Each mask carries a note saying where it came from. A rebuild writes new files, so write it again.
impeccable=.claude/skills/impeccable/scripts/impeccable
if [ -x "$impeccable" ]; then
  origin=$(mktemp)
  echo "Origin: derived, not generated. Dark-theme mask computed from the light mask beside it (same name without -dark) by scripts/dark-masks/build.sh, which relights the drawing inside its silhouette. No image model was used for this file." > "$origin"
  for mask in src/assets/patch-bay-dark.png src/assets/key-ring-dark.png src/assets/sockets-dark.png src/assets/figures/stack/plate-dark.png; do
    "$impeccable" embed-prompt "$mask" --prompt-file "$origin" > /dev/null
  done
  rm "$origin"
fi
