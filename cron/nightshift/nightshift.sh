#!/bin/bash
# Night Shift — Launch a coding agent in non-interactive mode for a scheduled task.
#
# Usage:
#   nightshift.sh <slot-index> [timeout_min]   Run one phase (0-8)
#   nightshift.sh --all                        Deprecated; exits without running
#
# Launchd should schedule nine independent jobs, one every 30 minutes:
#   com.max.nightshift-0 at 00:00 -> Phase 1
#   com.max.nightshift-1 at 00:30 -> Phase 2
#   com.max.nightshift-2 at 01:00 -> Phase 3
#   ...
#   com.max.nightshift-8 at 04:00 -> Phase 9
#
# Each phase runs in a fresh agent session directory. Do not use --continue:
# fresh context avoids cross-phase and cross-night context-window growth.
#
# Environment (override in $SCRIPT_DIR/.env):
#   NIGHT_SHIFT_ENABLED    — "true" to run, anything else skips (default: false)
#   NIGHT_SHIFT_AGENT      — agent to use: "pi", "claude", or "codex" (default: pi)
#   NIGHT_SHIFT_PROJECT    — project directory to run in (default: ~/projects/tockbot)
#   NIGHT_SHIFT_TIMEOUT    — timeout in minutes (default: 45)
#
# Phases are read from review.md (same directory as this script).
# Format: markdown with ## Phase N headings. Content between headings
# is the task description. If the task file is missing or the task is
# empty, the script exits cleanly.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Load .env ───────────────────────────────────────────────
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  set -a; source "$SCRIPT_DIR/.env"; set +a
fi

# ── Deprecated batch mode guard ─────────────────────────────
if [[ "${1:-}" == "--all" ]]; then
  echo "[$(date '+%H:%M:%S')] ERROR: --all mode is disabled. Use the half-hour launchd jobs (com.max.nightshift-0..8) or run a single slot index." >&2
  exit 64
fi

HOUR_INDEX="${1:?Usage: $0 <hour-index> [timeout_minutes]}"
TIMEOUT_MIN="${2:-${NIGHT_SHIFT_TIMEOUT:-45}}"

if ! [[ "$HOUR_INDEX" =~ ^[0-8]$ ]]; then
  echo "[$(date '+%H:%M:%S')] ERROR: slot index must be 0-8; got '$HOUR_INDEX'." >&2
  exit 64
fi

if ! [[ "$TIMEOUT_MIN" =~ ^[0-9]+$ ]] || [[ "$TIMEOUT_MIN" -lt 1 ]]; then
  echo "[$(date '+%H:%M:%S')] ERROR: timeout must be a positive integer; got '$TIMEOUT_MIN'." >&2
  exit 64
fi
PROJECT_DIR="${NIGHT_SHIFT_PROJECT:-$HOME/projects/tockbot}"
LOG_DIR="$HOME/.cron-logs"
LOG_FILE="$LOG_DIR/nightshift-$(date +%Y%m%d).log"
TASK_FILE="$SCRIPT_DIR/review.md"

# Default agent is pi
AGENT="${NIGHT_SHIFT_AGENT:-pi}"

mkdir -p "$LOG_DIR"

# ── Master toggle ─────────────────────────────────────────────
if [[ "${NIGHT_SHIFT_ENABLED:-false}" != "true" ]]; then
  echo "[$(date '+%H:%M:%S')] Night shift disabled (NIGHT_SHIFT_ENABLED not set to 'true')." | tee -a "$LOG_FILE"
  exit 0
fi

# ── Skip sentinel ─────────────────────────────────────────────
SKIP_FILE="$SCRIPT_DIR/.night-shift-skip"
if [[ -f "$SKIP_FILE" ]]; then
  echo "[$(date '+%H:%M:%S')] Night shift skipped (sentinel present)." | tee -a "$LOG_FILE"
  exit 0
fi

# ── Resolve agent binary ─────────────────────────────────────
case "$AGENT" in
  pi)
    AGENT_LABEL="Pi"
    AGENT_BIN="$(which pi 2>/dev/null || echo '')"
    SESSION_ROOT="$HOME/.pi/agent/sessions-night"
    if [[ -z "$AGENT_BIN" ]]; then
      echo "[$(date '+%H:%M:%S')] ERROR: pi not found in PATH" | tee -a "$LOG_FILE"
      exit 1
    fi
    ;;
  claude)
    AGENT_LABEL="Claude Code"
    AGENT_BIN="$(which claude 2>/dev/null || echo '')"
    SESSION_ROOT="$HOME/.claude/sessions-night"
    if [[ -z "$AGENT_BIN" ]]; then
      echo "[$(date '+%H:%M:%S')] ERROR: claude not found in PATH" | tee -a "$LOG_FILE"
      exit 1
    fi
    ;;
  codex)
    AGENT_LABEL="Codex"
    AGENT_BIN="$(which codex 2>/dev/null || echo '')"
    SESSION_ROOT="$HOME/.codex/sessions-night"
    if [[ -z "$AGENT_BIN" ]]; then
      echo "[$(date '+%H:%M:%S')] ERROR: codex not found in PATH" | tee -a "$LOG_FILE"
      exit 1
    fi
    ;;
  *)
    echo "[$(date '+%H:%M:%S')] ERROR: Unknown agent '$AGENT'. Valid: pi, claude, codex" | tee -a "$LOG_FILE"
    exit 1
    ;;
esac

RUN_DATE="$(date +%Y%m%d)"
RUN_SESSION_DIR="$SESSION_ROOT/$RUN_DATE/slot-$HOUR_INDEX"
mkdir -p "$RUN_SESSION_DIR"

# ── Resolve task ──────────────────────────────────────────────
if [[ ! -f "$TASK_FILE" ]]; then
  echo "[$(date '+%H:%M:%S')] ERROR: Phase file not found: $TASK_FILE" | tee -a "$LOG_FILE"
  exit 1
fi

# ── Extract preamble (everything before ## Phase 1) ───────────
PREAMBLE="$(awk '
  /^## Phase 1$/ { exit }
  { print }
' "$TASK_FILE")"
# Escape backticks to prevent command substitution in prompt
PREAMBLE="${PREAMBLE//\`/\\\`}"

TASK_N=$((HOUR_INDEX + 1))
TASK="$(awk -v n="$TASK_N" '
  /^## Phase [0-9]+/         { in_task=0 }
  $0 ~ "^## Phase " n "$"   { in_task=1; next }
  in_task && /^## Phase /    { exit }
  in_task                   { print }
' "$TASK_FILE")"

# Trim leading and trailing blank lines (macOS-compatible, no tac)
TASK="$(echo "$TASK" | awk '
  /[^[:space:]]/ { if (!first) first=NR; last=NR }
  { lines[NR]=$0 }
  END { for (i=first; i<=last; i++) print lines[i] }
')"
# Escape backticks to prevent command substitution in prompt
TASK="${TASK//\`/\\\`}"

if [[ -z "$TASK" ]]; then
  echo "[$(date '+%H:%M:%S')] Slot $HOUR_INDEX (Phase $TASK_N): no phase defined — skipping." | tee -a "$LOG_FILE"
  exit 0
fi

# One-line summary for notifications/log headers
TASK_ONELINE="$(echo "$TASK" | head -1)"

echo "" >> "$LOG_FILE"
echo "══════════════════════════════════════════════════════════════" >> "$LOG_FILE"
echo "  Night Shift — Slot $HOUR_INDEX ($(date '+%Y-%m-%d %H:%M:%S'))" >> "$LOG_FILE"
echo "  Agent:   $AGENT_LABEL" >> "$LOG_FILE"
echo "  Project: $PROJECT_DIR" >> "$LOG_FILE"
echo "  Session: $RUN_SESSION_DIR" >> "$LOG_FILE"
echo "  Phase:   $TASK_ONELINE" >> "$LOG_FILE"
echo "  Timeout: ${TIMEOUT_MIN}m" >> "$LOG_FILE"
echo "══════════════════════════════════════════════════════════════" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# ── Notify start ──────────────────────────────────────────────
osascript -e "display notification \"Phase $TASK_N: $TASK_ONELINE\" with title \"🌙 $AGENT_LABEL Night Shift Started\" sound name \"Pop\"" 2>/dev/null || true

# ── Build the prompt ──────────────────────────────────────────
# We wrap the task in instructions that encourage focused, committed work.
FULL_PROMPT="You are running in an unattended overnight batch. Work autonomously.

$PREAMBLE

---

Your task (Phase $TASK_N, scheduled slot $HOUR_INDEX): $TASK

Guidelines:
- This is a fresh, isolated phase. Do not rely on earlier phase chat context.
- Work efficiently; you have ~${TIMEOUT_MIN} minutes before you are terminated.
- Find issues and fix them directly. Do NOT write reports or document findings — just fix the code.
- Make small, frequent commits with clear messages.
- After completing this phase, commit and push all fixes to the current branch.
- If you hit a blocker you can't resolve, move on — do not document it.
- Do NOT open interactive prompts or ask questions — you are running headless.
- At the end, summarize what you fixed."

# ── Run Agent ─────────────────────────────────────────────────
cd "$PROJECT_DIR"

# Build agent-specific command
case "$AGENT" in
  pi)
    AGENT_CMD=(
      "$AGENT_BIN"
        --print
        --session-dir "$RUN_SESSION_DIR"
        --thinking xhigh
    )
    ;;
  claude)
    AGENT_CMD=(
      "$AGENT_BIN"
        --print
        --output-format json
        --max-turns 25
        --permission-mode bypassPermissions
        --append-system-prompt "You are running unattended. Work autonomously; do not ask questions or open interactive prompts. Commit frequently with clear messages."
    )
    ;;
  codex)
    AGENT_CMD=(
      "$AGENT_BIN" exec
        --json
        --sandbox workspace-write
        --ephemeral
    )
    ;;
esac

# Run agent with caffeinate (keep Mac awake) and timeout watchdog
(
  caffeinate -t "$((TIMEOUT_MIN * 60 + 300))" \
    "${AGENT_CMD[@]}" \
    "$FULL_PROMPT" \
    2>&1
) &
AGENT_PID=$!

# Wait with timeout using a sleeper killer
(
  sleep "$((TIMEOUT_MIN * 60))"
  kill -TERM "$AGENT_PID" 2>/dev/null || true
  sleep 5
  kill -KILL "$AGENT_PID" 2>/dev/null || true
) &
WATCHDOG_PID=$!

set +e
wait "$AGENT_PID"
AGENT_EXIT=$?
set -e

# Clean up watchdog
kill -TERM "$WATCHDOG_PID" 2>/dev/null || true
wait "$WATCHDOG_PID" 2>/dev/null || true

# ── Log result ────────────────────────────────────────────────
echo "" >> "$LOG_FILE"
if [[ $AGENT_EXIT -eq 0 ]]; then
  echo "[$(date '+%H:%M:%S')] ✅ Slot $HOUR_INDEX completed successfully." | tee -a "$LOG_FILE"
  osascript -e "display notification \"Slot $HOUR_INDEX completed\" with title \"✅ $AGENT_LABEL Night Shift Done\" sound name \"Glass\"" 2>/dev/null || true
elif [[ $AGENT_EXIT -eq 143 ]] || [[ $AGENT_EXIT -eq 137 ]]; then
  echo "[$(date '+%H:%M:%S')] ⏰ Slot $HOUR_INDEX timed out after ${TIMEOUT_MIN}m (exit $AGENT_EXIT)." | tee -a "$LOG_FILE"
  osascript -e "display notification \"Slot $HOUR_INDEX timed out\" with title \"⏰ $AGENT_LABEL Night Shift Timeout\" sound name \"Basso\"" 2>/dev/null || true
else
  echo "[$(date '+%H:%M:%S')] ❌ Slot $HOUR_INDEX failed with exit code $AGENT_EXIT." | tee -a "$LOG_FILE"
  osascript -e "display notification \"Slot $HOUR_INDEX failed (exit $AGENT_EXIT)\" with title \"❌ $AGENT_LABEL Night Shift Failed\" sound name \"Basso\"" 2>/dev/null || true
fi

echo "" >> "$LOG_FILE"

exit 0
