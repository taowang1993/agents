#!/bin/bash
set -euo pipefail

AGENTS_MD="$HOME/.agents/AGENTS.md"
LOG="$HOME/Library/Logs/update-packages.log"
mkdir -p "$(dirname "$LOG")"
exec >>"$LOG" 2>&1
echo "=== $(date) ==="

# launchd runs with a minimal PATH, so include user-installed CLI locations.
export PATH="$HOME/Library/pnpm:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

BREW_BIN="$(command -v brew || true)"
PNPM_BIN="$(command -v pnpm || true)"

known=$(sed -n '/^## CLI Tools/,/^## Launch Agents/p' "$AGENTS_MD" \
    | grep '^| `' | sed 's/^| `//; s/`.*//; s/ \/.*//' | sort -u)
is_known() { echo "$known" | grep -qxF "$1"; }

added=0

# ── Upgrade all packages ────────────────────────────────────────────
echo "Upgrading brew..."
if [ -n "$BREW_BIN" ]; then
    "$BREW_BIN" upgrade --formula 2>&1 || true
else
    echo "brew not found; skipping."
fi

echo "Upgrading pnpm globals..."
if [ -n "$PNPM_BIN" ]; then
    # --latest is required for 0.x packages like @openai/codex; plain update
    # respects ^0.x ranges and can leave newer minor releases untouched.
    "$PNPM_BIN" update -g --latest 2>&1 || true
else
    echo "pnpm not found; skipping."
fi

# ── Brew: only primary binaries of explicitly-installed formulae ────
echo "Scanning brew for new tools..."
if [ -n "$BREW_BIN" ]; then
    brew_json=$("$BREW_BIN" info --json=v2 --installed 2>/dev/null || echo '{"formulae":[]}')

    while read -r formula; do
        [ -z "$formula" ] && continue
        # Check for primary binary (formula name == binary name) at /opt/homebrew/bin
        bin_path="/opt/homebrew/bin/$formula"
        [ -f "$bin_path" ] || continue
        # Verify it's a Cellar symlink
        target=$(readlink "$bin_path" 2>/dev/null || true)
        [[ "$target" == */Cellar/* ]] || continue
        is_known "$formula" && continue

        desc=$(echo "$brew_json" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for f in data.get('formulae', []):
    if f.get('name') == '$formula' or f.get('full_name') == '$formula':
        print(f.get('desc', ''))
        break
" 2>/dev/null)
        [ -z "$desc" ] && desc="(brew formula)"

        line="| \`$formula\` | $desc |"
        sed -i '' "/^## Launch Agents/i\\
$line\\
" "$AGENTS_MD"
        echo "  + brew: $formula  ($desc)"
        ((added++))
    done < <("$BREW_BIN" leaves 2>/dev/null || true)
else
    echo "brew not found; skipping scan."
fi

# ── pnpm: only top-level global packages with matching binaries ─────
echo "Scanning pnpm..."

if [ -n "$PNPM_BIN" ]; then
    "$PNPM_BIN" list -g --depth=0 --json 2>/dev/null | python3 -c "
import json, sys

with open('/dev/stdin') as f:
    data = json.load(f)

if not data:
    sys.exit(0)

root = data[0]
deps = root.get('dependencies', {})

for name, info in deps.items():
    # Extract short name from scoped packages
    short = name.split('/')[-1] if '/' in name else name
    bin_path = f'$HOME/Library/pnpm/{short}'
    print(f'{short}|{name}')
" 2>/dev/null | while IFS='|' read -r short pkg_name; do
        [ -z "$short" ] && continue
        is_known "$short" && continue
        bin_path="$HOME/Library/pnpm/$short"
        [ -f "$bin_path" ] || continue
        desc=$("$PNPM_BIN" view "$pkg_name" description 2>/dev/null || echo "(pnpm global)")

        line="| \`$short\` | $desc |"
        sed -i '' "/^## Launch Agents/i\\
$line\\
" "$AGENTS_MD"
        echo "  + pnpm: $short  ($desc)"
        ((added++))
    done
else
    echo "pnpm not found; skipping scan."
fi

echo "Done. Added $added new tool(s)."
echo ""
