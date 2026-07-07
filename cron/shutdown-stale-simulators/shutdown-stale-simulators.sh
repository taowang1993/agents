#!/bin/bash
# Shut down booted iOS simulators after they sit unattended for 30 minutes.
# "Unattended" means Simulator is not frontmost and no xcodebuild, Maestro, or Detox process is active.

set -euo pipefail

PATH="/usr/bin:/bin:/usr/sbin:/sbin:/Applications/Xcode.app/Contents/Developer/usr/bin"
STAMP="$HOME/Library/Caches/shutdown-stale-simulators.first-seen"
THRESHOLD_SECONDS="${STALE_SIMULATOR_THRESHOLD_SECONDS:-1800}"
NOW="$(date +%s)"

booted_json="$(xcrun simctl list devices --json 2>/dev/null || true)"
if [ -z "$booted_json" ]; then
  echo "$(date): simctl unavailable; skipping."
  exit 0
fi

booted_udids="$(printf '%s' "$booted_json" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
for devices in data.get("devices", {}).values():
    for device in devices:
        if device.get("state") == "Booted":
            print(device.get("udid", ""))
')"

if [ -z "$booted_udids" ]; then
  if [ -f "$STAMP" ]; then
    echo "$(date): no booted simulators; clearing stale timer."
    rm -f "$STAMP"
  fi
  exit 0
fi

active_tools=()
frontmost_app="$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true' 2>/dev/null || true)"
[ "$frontmost_app" = "Simulator" ] && active_tools+=(Simulator-frontmost)
pgrep -x xcodebuild >/dev/null 2>&1 && active_tools+=(xcodebuild)
pgrep -f '(^|/)maestro([[:space:]]|$)' >/dev/null 2>&1 && active_tools+=(maestro)
pgrep -f '(^|/)detox([[:space:]]|$)' >/dev/null 2>&1 && active_tools+=(detox)

if [ ${#active_tools[@]} -gt 0 ]; then
  if [ -f "$STAMP" ]; then
    echo "$(date): simulator tooling active (${active_tools[*]}); resetting stale timer."
    rm -f "$STAMP"
  fi
  exit 0
fi

if [ ! -f "$STAMP" ]; then
  echo "$NOW" > "$STAMP"
  echo "$(date): booted simulators unattended; starting 30m timer: $(echo "$booted_udids" | tr '\n' ' ')"
  exit 0
fi

first_seen="$(cat "$STAMP" 2>/dev/null || echo "$NOW")"
age=$((NOW - first_seen))
if [ "$age" -lt "$THRESHOLD_SECONDS" ]; then
  exit 0
fi

echo "$(date): shutting down stale simulators after ${age}s unattended: $(echo "$booted_udids" | tr '\n' ' ')"
xcrun simctl shutdown all
rm -f "$STAMP"
