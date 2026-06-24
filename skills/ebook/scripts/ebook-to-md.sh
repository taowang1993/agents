#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: ebook-to-md.sh INPUT [--out DIR] [--force] [-- EPUB2MD_ARGS...]

Examples:
  ebook-to-md.sh book.epub
  ebook-to-md.sh book.mobi --out book-markdown
  ebook-to-md.sh book.epub -- --autocorrect
EOF
}

force=0
out=""
input=""
extra=()

while [ "$#" -gt 0 ]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --force)
      force=1
      shift
      ;;
    -o|--out)
      [ "$#" -ge 2 ] || { echo "--out needs a directory" >&2; exit 2; }
      out="$2"
      shift 2
      ;;
    --)
      shift
      extra+=("$@")
      break
      ;;
    *)
      if [ -z "$input" ]; then
        input="$1"
      else
        extra+=("$1")
      fi
      shift
      ;;
  esac
done

[ -n "$input" ] || { usage >&2; exit 2; }
[ -f "$input" ] || { echo "Input file not found: $input" >&2; exit 1; }

command -v npx >/dev/null || { echo "Missing npx. Install Node.js/npm." >&2; exit 1; }

input_dir="$(cd "$(dirname "$input")" && pwd -P)"
file="$(basename "$input")"
stem="${file%.*}"
ext="$(printf '%s' "${file##*.}" | tr '[:upper:]' '[:lower:]')"
out="${out:-$input_dir/$stem}"

if [ -e "$out" ]; then
  if [ "$force" -eq 1 ]; then
    rm -rf "$out"
  else
    echo "Output already exists: $out (use --force to replace)" >&2
    exit 1
  fi
fi

tmp="$(mktemp -d /tmp/ebook-to-md.XXXXXX)"
trap 'rm -rf "$tmp"' EXIT
work_epub="$tmp/$stem.epub"

case "$ext" in
  epub)
    cp "$input" "$work_epub"
    ;;
  mobi|azw|azw3)
    command -v ebook-convert >/dev/null || {
      echo "Missing ebook-convert. Install Calibre: brew install --cask calibre" >&2
      exit 1
    }
    ebook-convert "$input" "$work_epub"
    ;;
  *)
    echo "Unsupported ebook type: .$ext (expected epub, mobi, azw, azw3)" >&2
    exit 2
    ;;
esac

if command -v epub2md >/dev/null; then
  runner=(epub2md)
else
  runner=(npx -y epub2md@latest)
fi

(
  cd "$tmp"
  if [ "${#extra[@]}" -gt 0 ]; then
    "${runner[@]}" "$work_epub" "${extra[@]}"
  else
    "${runner[@]}" "$work_epub"
  fi
)

produced="$tmp/$stem"
[ -d "$produced" ] || { echo "epub2md did not create expected folder: $produced" >&2; exit 1; }
mkdir -p "$(dirname "$out")"
mv "$produced" "$out"

md_count="$(find "$out" -maxdepth 1 -name '*.md' -type f | wc -l | tr -d ' ')"
image_count="$(find "$out/images" -type f 2>/dev/null | wc -l | tr -d ' ')"
printf 'output=%s\nmarkdown_files=%s\nimage_files=%s\n' "$out" "$md_count" "$image_count"
