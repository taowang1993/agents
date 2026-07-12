#!/bin/bash
set -euo pipefail

export HOME="/Users/max"
export PATH="/Users/max/.nvm/versions/node/v22.22.0/bin:/Users/max/Library/pnpm:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export PI_SKIP_VERSION_CHECK=1
export PI_TELEMETRY=0

JOB_DIR="/Users/max/.agents/cron/tockspeaker-feature-port"
VOICE_DIR="/Users/max/projects/resources/.voice"
FEATURES_FILE="$VOICE_DIR/features.md"
LOG_DIR="$HOME/.cron-logs/tockspeaker-feature-port"
LOG_FILE="$LOG_DIR/run-$(date +%Y%m%d).log"
LOCK_DIR="/tmp/com.max.tockspeaker-feature-port.lock"

mkdir -p "$LOG_DIR" "$LOG_DIR/sessions"
exec >> "$LOG_FILE" 2>&1

echo "=== TockSpeaker Feature Port Started: $(date) ==="

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Another run is already active; skipping."
  echo "=== TockSpeaker Feature Port Skipped: $(date) ==="
  exit 0
fi
trap 'rm -rf "$LOCK_DIR"' EXIT

if [ ! -f "$FEATURES_FILE" ]; then
  echo "Missing features file: $FEATURES_FILE"
  exit 1
fi

missing=0
for dir in handy omnivoice openwhispr voicebox; do
  if [ ! -d "$VOICE_DIR/$dir" ]; then
    echo "Missing source directory: $VOICE_DIR/$dir"
    missing=1
  fi
done
if [ "$missing" -ne 0 ]; then
  exit 1
fi

cd "$VOICE_DIR"

/usr/local/bin/pi \
  --no-context-files \
  --no-extensions \
  --no-skills \
  --no-prompt-templates \
  --no-approve \
  --tools read,bash,edit,write \
  --session-dir "$LOG_DIR/sessions" \
  --name "TockSpeaker Feature Port" \
  -p "$(cat "$JOB_DIR/prompt.md")"

status=$?
echo "=== TockSpeaker Feature Port Completed ($status): $(date) ==="
exit "$status"
