#!/bin/bash
# Pi Night Shift — Launch pi in non-interactive mode for a focused task.
#
# Usage: pi-night-shift.sh <hour-index> [timeout_minutes]
#   hour-index:     0-7 (maps to ## Task N in pi-night-tasks.md)
#   timeout_minutes: optional, default 45
#
# Environment (override in $SCRIPT_DIR/.env):
#   NIGHT_SHIFT_PROJECT — project directory to run in (default: ~/projects/tockbot)
#   PI_NIGHT_SHIFT_TIMEOUT  — timeout in minutes (default: 45)
#
# Tasks are read from pi-night-tasks.md (same directory as this script).
# Format: markdown with ## Task N headings. Content between headings
# is the task description. If the task file is missing or the task is
# empty, the script exits cleanly.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOUR_INDEX="${1:?Usage: $0 <hour-index> [timeout_minutes]}"
TIMEOUT_MIN="${2:-45}"
PROJECT_DIR="${NIGHT_SHIFT_PROJECT:-$HOME/projects/tockbot}"
SESSION_DIR="$HOME/.pi/agent/sessions-night"
LOG_DIR="$HOME/.cron-logs"
LOG_FILE="$LOG_DIR/pi-night-shift-$(date +%Y%m%d).log"
TASK_FILE="$SCRIPT_DIR/pi-night-tasks.md"
PI_BIN="$(which pi)"

mkdir -p "$LOG_DIR" "$SESSION_DIR"

# ── Load .env ─────────────────────────────────────────────────
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  set -a; source "$SCRIPT_DIR/.env"; set +a
fi

# ── Skip sentinel ────────────────────────────────────────────
SKIP_FILE="$SCRIPT_DIR/.night-shift-skip"
if [[ -f "$SKIP_FILE" ]]; then
  echo "[$(date '+%H:%M:%S')] Night shift skipped (sentinel present)." | tee -a "$LOG_FILE"
  exit 0
fi

# ── Resolve task ──────────────────────────────────────────────
if [[ ! -f "$TASK_FILE" ]]; then
  echo "[$(date '+%H:%M:%S')] ERROR: Task file not found: $TASK_FILE" | tee -a "$LOG_FILE"
  exit 1
fi

TASK_N=$((HOUR_INDEX + 1))
TASK="$(awk -v n="$TASK_N" '
  /^## Task [0-9]+/         { in_task=0 }
  $0 ~ "^## Task " n "$"   { in_task=1; next }
  in_task && /^## Task /    { exit }
  in_task                   { print }
' "$TASK_FILE")"

# Trim leading and trailing blank lines (macOS-compatible, no tac)
TASK="$(echo "$TASK" | awk '
  /[^[:space:]]/ { if (!first) first=NR; last=NR }
  { lines[NR]=$0 }
  END { for (i=first; i<=last; i++) print lines[i] }
')"

if [[ -z "$TASK" ]]; then
  echo "[$(date '+%H:%M:%S')] Hour $HOUR_INDEX (Task $TASK_N): no task defined — skipping." | tee -a "$LOG_FILE"
  exit 0
fi

# One-line summary for notifications/log headers
TASK_ONELINE="$(echo "$TASK" | head -1)"

echo "" >> "$LOG_FILE"
echo "══════════════════════════════════════════════════════════════" >> "$LOG_FILE"
echo "  Pi Night Shift — Hour $HOUR_INDEX ($(date '+%Y-%m-%d %H:%M:%S'))" >> "$LOG_FILE"
echo "  Project: $PROJECT_DIR" >> "$LOG_FILE"
echo "  Task: $TASK_ONELINE" >> "$LOG_FILE"
echo "  Timeout: ${TIMEOUT_MIN}m" >> "$LOG_FILE"
echo "══════════════════════════════════════════════════════════════" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# ── Notify start ──────────────────────────────────────────────
osascript -e "display notification \"Task $TASK_N: $TASK_ONELINE\" with title \"🌙 Pi Night Shift Started\" sound name \"Pop\"" 2>/dev/null || true

# ── Build the prompt ──────────────────────────────────────────
# We wrap the task in instructions that encourage focused, committed work.
FULL_PROMPT="You are running in an unattended overnight batch. Work autonomously.
Your task: $TASK

Guidelines:
- Work efficiently; you have ~${TIMEOUT_MIN} minutes before you are terminated.
- Make small, frequent commits with clear messages.
- After completing meaningful work, commit and push to the current branch.
- If you hit a blocker you can't resolve, document it in .pi/night-shift-blockers.md and move on.
- Do NOT open interactive prompts or ask questions — you are running headless.
- At the end, summarize what you accomplished."

# ── Run Pi ────────────────────────────────────────────────────
cd "$PROJECT_DIR"

# macOS doesn't have `timeout`; use perl-based timeout wrapper.
# We run pi in a background process and wait with a deadline.
(
  caffeinate -t "$((TIMEOUT_MIN * 60 + 300))" \
    "$PI_BIN" \
      --print \
      --session-dir "$SESSION_DIR" \
      --continue \
      --thinking xhigh \
      "$FULL_PROMPT" \
      2>&1
) &
PI_PID=$!

# Wait with timeout using a sleeper killer
(
  sleep "$((TIMEOUT_MIN * 60))"
  kill -TERM "$PI_PID" 2>/dev/null || true
  sleep 5
  kill -KILL "$PI_PID" 2>/dev/null || true
) &
WATCHDOG_PID=$!

set +e
wait "$PI_PID"
PI_EXIT=$?
set -e

# Clean up watchdog
kill -TERM "$WATCHDOG_PID" 2>/dev/null || true
wait "$WATCHDOG_PID" 2>/dev/null || true

# ── Log result ────────────────────────────────────────────────
echo "" >> "$LOG_FILE"
if [[ $PI_EXIT -eq 0 ]]; then
  echo "[$(date '+%H:%M:%S')] ✅ Hour $HOUR_INDEX completed successfully." | tee -a "$LOG_FILE"
  osascript -e "display notification \"Hour $HOUR_INDEX completed\" with title \"✅ Pi Night Shift Done\" sound name \"Glass\"" 2>/dev/null || true
elif [[ $PI_EXIT -eq 143 ]] || [[ $PI_EXIT -eq 137 ]]; then
  echo "[$(date '+%H:%M:%S')] ⏰ Hour $HOUR_INDEX timed out after ${TIMEOUT_MIN}m (exit $PI_EXIT)." | tee -a "$LOG_FILE"
  osascript -e "display notification \"Hour $HOUR_INDEX timed out\" with title \"⏰ Pi Night Shift Timeout\" sound name \"Basso\"" 2>/dev/null || true
else
  echo "[$(date '+%H:%M:%S')] ❌ Hour $HOUR_INDEX failed with exit code $PI_EXIT." | tee -a "$LOG_FILE"
  osascript -e "display notification \"Hour $HOUR_INDEX failed (exit $PI_EXIT)\" with title \"❌ Pi Night Shift Failed\" sound name \"Basso\"" 2>/dev/null || true
fi

echo "" >> "$LOG_FILE"

exit 0
