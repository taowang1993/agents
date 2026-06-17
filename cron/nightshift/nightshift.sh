#!/bin/bash
# Night Shift — Launch a coding agent in non-interactive mode for scheduled maintenance.
#
# Usage:
#   nightshift.sh [--orchestrate] [timeout_min]
#       Run one Pi parent session that orchestrates all dirty review scopes with
#       subagents and updates the dynamic clean-state ledger in review.md.
#
#   nightshift.sh <slot-index> [timeout_min]
#       Legacy/manual compatibility mode: run one static phase (slot 0-8).
#       Launchd should not use this mode anymore.
#
# Environment (override in $SCRIPT_DIR/.env):
#   NIGHT_SHIFT_ENABLED              — "true" to run, anything else skips (default: false)
#   NIGHT_SHIFT_AGENT                — agent to use: "pi", "claude", or "codex" (default: pi)
#                                      Orchestrator mode requires "pi" because it uses Pi subagents.
#   NIGHT_SHIFT_PROJECT              — project directory to run in (default: ~/projects/tockbot)
#   NIGHT_SHIFT_TIMEOUT              — legacy slot timeout in minutes (default: 45)
#   NIGHT_SHIFT_ORCHESTRATOR_TIMEOUT — one-session orchestrator timeout in minutes (default: 300)
#
# Phases and dynamic clean-state ledger are read from review.md (same directory
# as this script). The orchestrator mode treats review.md as mutable state: clean
# scopes should update their ledger rows so future runs skip unchanged code.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Load .env ───────────────────────────────────────────────
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  set -a; source "$SCRIPT_DIR/.env"; set +a
fi

# ── Parse mode ──────────────────────────────────────────────
MODE="orchestrate"
TIMEOUT_MIN="${NIGHT_SHIFT_ORCHESTRATOR_TIMEOUT:-300}"
HOUR_INDEX=""
TASK_N=""

if [[ "${1:-}" == "--all" ]]; then
  echo "[$(date '+%H:%M:%S')] ERROR: --all mode is disabled. Use --orchestrate for the single Pi parent session." >&2
  exit 64
elif [[ $# -eq 0 ]]; then
  MODE="orchestrate"
elif [[ "${1:-}" == "--orchestrate" ]] || [[ "${1:-}" == "orchestrate" ]]; then
  MODE="orchestrate"
  TIMEOUT_MIN="${2:-${NIGHT_SHIFT_ORCHESTRATOR_TIMEOUT:-300}}"
else
  MODE="slot"
  HOUR_INDEX="$1"
  TIMEOUT_MIN="${2:-${NIGHT_SHIFT_TIMEOUT:-45}}"
  if ! [[ "$HOUR_INDEX" =~ ^[0-8]$ ]]; then
    echo "[$(date '+%H:%M:%S')] ERROR: slot index must be 0-8; got '$HOUR_INDEX'. Use --orchestrate for the single-session Night Shift." >&2
    exit 64
  fi
  TASK_N=$((HOUR_INDEX + 1))
fi

if ! [[ "$TIMEOUT_MIN" =~ ^[0-9]+$ ]] || [[ "$TIMEOUT_MIN" -lt 1 ]]; then
  echo "[$(date '+%H:%M:%S')] ERROR: timeout must be a positive integer; got '$TIMEOUT_MIN'." >&2
  exit 64
fi

PROJECT_DIR="${NIGHT_SHIFT_PROJECT:-$HOME/projects/tockbot}"
LOG_DIR="$HOME/.cron-logs"
LOG_FILE="$LOG_DIR/nightshift-$(date +%Y%m%d).log"
TASK_FILE="$SCRIPT_DIR/review.md"
AGENT="${NIGHT_SHIFT_AGENT:-pi}"

mkdir -p "$LOG_DIR"

notify() {
  local title="$1"
  local message="$2"
  local sound="${3:-Pop}"
  title="${title//\"/\\\"}"
  message="${message//\"/\\\"}"
  osascript -e "display notification \"$message\" with title \"$title\" sound name \"$sound\"" 2>/dev/null || true
}

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
if [[ "$MODE" == "orchestrate" ]] && [[ "$AGENT" != "pi" ]]; then
  echo "[$(date '+%H:%M:%S')] ERROR: orchestrator mode requires NIGHT_SHIFT_AGENT=pi because it uses Pi subagents; got '$AGENT'." | tee -a "$LOG_FILE"
  exit 64
fi

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
if [[ "$MODE" == "orchestrate" ]]; then
  RUN_SESSION_DIR="$SESSION_ROOT/$RUN_DATE/orchestrator"
else
  RUN_SESSION_DIR="$SESSION_ROOT/$RUN_DATE/slot-$HOUR_INDEX"
fi
mkdir -p "$RUN_SESSION_DIR"

# ── Resolve task file ────────────────────────────────────────
if [[ ! -f "$TASK_FILE" ]]; then
  echo "[$(date '+%H:%M:%S')] ERROR: Review file not found: $TASK_FILE" | tee -a "$LOG_FILE"
  exit 1
fi

# ── Build prompt ─────────────────────────────────────────────
if [[ "$MODE" == "orchestrate" ]]; then
  TASK_ONELINE="Single Pi parent orchestration using review.md ledger"
  REVIEW_DOC="$(< "$TASK_FILE")"
  FULL_PROMPT="You are running in an unattended overnight batch as the single Pi Night Shift parent orchestrator. Work autonomously.

Review standard and dynamic clean-state ledger:

$REVIEW_DOC

---

Your task: run the entire Night Shift as one parent session, using Pi subagents for scoped work instead of running nine independent top-level sessions.

Orchestration contract:
- This is a fresh, isolated parent session. Do not rely on earlier chat context.
- Work efficiently; you have ~${TIMEOUT_MIN} minutes before you are terminated.
- Read review.md's Dynamic Clean-State Ledger first. Use each row's Path filter and Clean through commit to decide which scopes reopened.
- If a scope's Path filter did not change since its Clean through commit and its cheapest relevant validation has no High Finding or failure, skip deep review for that scope.
- If a scope is pending, dirty, or has failing validation, triage that scope only. Do not browse unrelated clean directories just in case.
- Use Pi subagents for fanout when useful: run read-only triage/review subagents in fresh context and in parallel. Before using subagents, list available agents/chains. Keep this parent session in charge of orchestration and final decisions.
- Do not run parallel writers in the active worktree. If code changes are needed, apply them with exactly one writer at a time in the parent session or a single worker child, unless you deliberately use isolated worktrees and merge safely.
- Find High Findings and fix them directly. Do NOT write standalone reports — just fix the code and maintain the review.md clean-state ledger.
- If a scope has no High Findings after triage, update its review.md ledger row with the clean commit/date/evidence so future agents skip unchanged clean code.
- Make small, frequent commits with clear messages. Commit only changes made by this Night Shift run; never stage, revert, delete, or clean up unrelated user/concurrent changes.
- After completing the orchestration, commit and push all fixes and required review.md ledger updates to the current branch.
- If you hit a blocker you can't resolve, move on — do not document it unless a durable blocker is essential to prevent repeated wasted work.
- Do NOT open interactive prompts or ask questions — you are running headless.
- At the end, summarize scopes skipped, scopes triaged, fixes committed, ledger rows updated, validations run, and any residual risks."
else
  # Legacy/manual one-slot compatibility path.
  PREAMBLE="$(awk '
    /^## Phase 1$/ { exit }
    { print }
  ' "$TASK_FILE")"

  TASK="$(awk -v n="$TASK_N" '
    /^## Phase [0-9]+/         { in_task=0 }
    $0 ~ "^## Phase " n "$"   { in_task=1; next }
    in_task && /^## Phase /    { exit }
    in_task                   { print }
  ' "$TASK_FILE")"

  TASK="$(echo "$TASK" | awk '
    /[^[:space:]]/ { if (!first) first=NR; last=NR }
    { lines[NR]=$0 }
    END { for (i=first; i<=last; i++) print lines[i] }
  ')"

  if [[ -z "$TASK" ]]; then
    echo "[$(date '+%H:%M:%S')] Slot $HOUR_INDEX (Phase $TASK_N): no phase defined — skipping." | tee -a "$LOG_FILE"
    exit 0
  fi

  TASK_ONELINE="$(echo "$TASK" | head -1)"
  FULL_PROMPT="You are running in an unattended overnight batch. Work autonomously.

$PREAMBLE

---

Your task (legacy Phase $TASK_N, scheduled slot $HOUR_INDEX): $TASK

Guidelines:
- This is a fresh, isolated legacy phase. Do not rely on earlier phase chat context.
- Work efficiently; you have ~${TIMEOUT_MIN} minutes before you are terminated.
- Use the high-finding triage gate and Dynamic Clean-State Ledger in review.md.
- If a scope has no High Findings, update its review.md ledger row so future agents skip unchanged clean code.
- Find issues and fix them directly. Do NOT write standalone reports — just fix the code and maintain the review.md clean-state ledger.
- Make small, frequent commits with clear messages.
- After completing this phase, commit and push all fixes and any required review.md ledger updates to the current branch.
- If you hit a blocker you can't resolve, move on — do not document it.
- Do NOT open interactive prompts or ask questions — you are running headless.
- At the end, summarize what you fixed."
fi

# ── Log header ───────────────────────────────────────────────
echo "" >> "$LOG_FILE"
echo "══════════════════════════════════════════════════════════════" >> "$LOG_FILE"
if [[ "$MODE" == "orchestrate" ]]; then
  echo "  Night Shift — Orchestrator ($(date '+%Y-%m-%d %H:%M:%S'))" >> "$LOG_FILE"
else
  echo "  Night Shift — Legacy Slot $HOUR_INDEX ($(date '+%Y-%m-%d %H:%M:%S'))" >> "$LOG_FILE"
fi
echo "  Agent:   $AGENT_LABEL" >> "$LOG_FILE"
echo "  Project: $PROJECT_DIR" >> "$LOG_FILE"
echo "  Session: $RUN_SESSION_DIR" >> "$LOG_FILE"
echo "  Task:    $TASK_ONELINE" >> "$LOG_FILE"
echo "  Timeout: ${TIMEOUT_MIN}m" >> "$LOG_FILE"
echo "══════════════════════════════════════════════════════════════" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

if [[ "$MODE" == "orchestrate" ]]; then
  notify "🌙 $AGENT_LABEL Night Shift Started" "Orchestrator: $TASK_ONELINE" "Pop"
else
  notify "🌙 $AGENT_LABEL Night Shift Started" "Phase $TASK_N: $TASK_ONELINE" "Pop"
fi

# ── Run agent ────────────────────────────────────────────────
cd "$PROJECT_DIR"

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

(
  exec caffeinate -t "$((TIMEOUT_MIN * 60 + 300))" \
    "${AGENT_CMD[@]}" \
    "$FULL_PROMPT" \
    2>&1
) &
AGENT_PID=$!

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

kill -TERM "$WATCHDOG_PID" 2>/dev/null || true
wait "$WATCHDOG_PID" 2>/dev/null || true

# ── Log result ───────────────────────────────────────────────
echo "" >> "$LOG_FILE"
RUN_LABEL="orchestrator"
if [[ "$MODE" == "slot" ]]; then
  RUN_LABEL="slot $HOUR_INDEX"
fi

if [[ $AGENT_EXIT -eq 0 ]]; then
  echo "[$(date '+%H:%M:%S')] ✅ Night Shift $RUN_LABEL completed successfully." | tee -a "$LOG_FILE"
  notify "✅ $AGENT_LABEL Night Shift Done" "Night Shift $RUN_LABEL completed" "Glass"
elif [[ $AGENT_EXIT -eq 143 ]] || [[ $AGENT_EXIT -eq 137 ]]; then
  echo "[$(date '+%H:%M:%S')] ⏰ Night Shift $RUN_LABEL timed out after ${TIMEOUT_MIN}m (exit $AGENT_EXIT)." | tee -a "$LOG_FILE"
  notify "⏰ $AGENT_LABEL Night Shift Timeout" "Night Shift $RUN_LABEL timed out" "Basso"
else
  echo "[$(date '+%H:%M:%S')] ❌ Night Shift $RUN_LABEL failed with exit code $AGENT_EXIT." | tee -a "$LOG_FILE"
  notify "❌ $AGENT_LABEL Night Shift Failed" "Night Shift $RUN_LABEL failed (exit $AGENT_EXIT)" "Basso"
fi

echo "" >> "$LOG_FILE"

exit 0
