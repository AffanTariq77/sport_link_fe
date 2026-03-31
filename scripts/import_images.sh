#!/usr/bin/env bash
# Copies images from a source folder into project's assets/images directory.
# Usage: ./scripts/import_images.sh /path/to/stitch_splash_screen

set -euo pipefail
SRC=${1:-}
if [[ -z "$SRC" ]]; then
  echo "Usage: $0 /full/path/to/stitch_splash_screen"
  exit 1
fi
if [[ ! -d "$SRC" ]]; then
  echo "Source folder does not exist: $SRC"
  exit 2
fi
DST="$(pwd)/assets/images"
mkdir -p "$DST"
echo "Copying images from $SRC to $DST ..."
# Copy images (common image extensions)
shopt -s nullglob
count=0
for ext in jpg jpeg png webp gif svg; do
  for f in "$SRC"/**/*.$ext; do
    if [[ -f "$f" ]]; then
      cp -v "$f" "$DST/"
      count=$((count+1))
    fi
  done
done
if [[ $count -eq 0 ]]; then
  echo "No image files found in $SRC (searched jpg/jpeg/png/webp/gif/svg)."
else
  echo "Imported $count image(s) to $DST"
fi
echo "Done. Run 'flutter pub get' if you added new files and then rebuild the app."