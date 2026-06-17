---
name: night-shift
description: >-
  Manage the Pi Night Shift system end-to-end — review overnight results,
  create/update/delete/reorder phases, skip a night, and change the target
  project. Use whenever the user mentions night shift in any context:
  reviewing logs ("what did night shift do?"), managing phases ("add a
  phase to night shift", "update night shift phase 3", "remove phase 4"),
  skipping ("skip night shift tonight"), configuration ("change night
  shift project"), or asking about the system ("how is night shift
  configured?", "show night shift phases").
---

# Night Shift

You are the interface to the user's Pi Night Shift system — one nightly launchd job that runs a single headless Pi parent orchestrator against a project. The parent reads `review.md`, uses the Dynamic Clean-State Ledger to skip unchanged clean scopes, and delegates dirty-scope triage/fixes to Pi subagents when useful.

## Key files

| File | Purpose |
|------|---------|
| `~/.agents/cron/nightshift/nightshift.sh` | The runner script |
| `~/.agents/cron/nightshift/review.md` | Phase definitions plus Dynamic Clean-State Ledger. Symlink to `<project>/.agents/reference/review.md`. |
| `~/.agents/cron/nightshift/.env` | Project config (`NIGHT_SHIFT_PROJECT`, `NIGHT_SHIFT_AGENT`, `NIGHT_SHIFT_ENABLED`, optional `NIGHT_SHIFT_ORCHESTRATOR_TIMEOUT`) |
| `~/.agents/cron/nightshift/.night-shift-skip` | Sentinel — if present, the nightly orchestrator skips |
| `~/.cron-logs/nightshift-YYYYMMDD.log` | Combined daily status log |
| `~/.cron-logs/nightshift-orchestrator.log` | Full stdout/stderr log for the single orchestrator job |
| `~/.agents/cron/nightshift/launchagents/com.max.nightshift.plist` | Versioned launchd job definition for the single orchestrator |
| `~/Library/LaunchAgents/com.max.nightshift.plist` | Symlink to the active orchestrator launchd definition |

When the user refers to a "phase number," they mean the `## Phase N` heading number in `review.md`. The active launchd setup no longer schedules separate slots per phase; one parent Pi session owns all dirty phases/scopes for the night. Legacy slot mode (`nightshift.sh <slot-index>`) remains supported by the script for manual fallback, but no per-slot launchd jobs are installed or versioned.

## Operations

Determine which operation the user wants, then follow the corresponding section below. Always confirm destructive actions (delete, skip) before executing.

### 1. Review logs

Read and summarize what the night shift did.

- **Finding the log:** Default to today (`date +%Y%m%d`). If today's log doesn't exist or is empty, fall back to yesterday (`date -v-1d +%Y%m%d`). Respect explicit dates ("Tuesday", "May 12").
  - The combined log: `~/.cron-logs/nightshift-YYYYMMDD.log` — summary status for the orchestrator run.
  - Full orchestrator output: `~/.cron-logs/nightshift-orchestrator.log`.
  - Legacy per-slot logs may still exist as `~/.cron-logs/nightshift-<SLOT>.log`; read them only for older runs or manual slot-mode invocations.
- **Extracting the project:** The run header has a `Project:` line. Use that path for blockers and git checks. If missing (older logs), fall back to the project from `.env`.
- **Parsing:** Current logs use an `Orchestrator` header and a final status line like `Night Shift orchestrator completed/timed out/failed`. Legacy logs may contain slot blocks (`Slot N` or `Hour N`). Extract orchestrator result first; only build a slot table for old logs that actually contain slot blocks. An incomplete block/header with no result means "interrupted."
- **Supporting evidence:**
  1. `<project>/.pi/night-shift-blockers.md` — if modified since the night shift ran, read it.
  2. `git -C <project> log --since="YYYY-MM-DD 00:00" --until="YYYY-MM-DD 05:00" --oneline` — drop `--author` if no results.

**Report template:**

```
# Night Shift Report — [date]

## Summary
[One sentence: orchestrator completed/timed out/failed/skipped; include dirty scopes/fixes if visible in logs.]

## Results

| Run | Scope | Result |
|-----|-------|--------|
| orchestrator | all dirty ledger scopes | ✅ completed |

For legacy logs, use the old slot table only when slot blocks are present.

## Commits Made
[list, or "No commits found."]

## Blockers
[list, or "No blockers documented."]
```

If the orchestrator was skipped because `NIGHT_SHIFT_ENABLED=false` or `.night-shift-skip` exists, say so directly. If a legacy slot log says `no phase defined`, say "Night shift legacy slot was skipped — no phase was defined."

### 2. List phases

Read the phase file (resolve the `review.md` symlink first) and display the current roster:

```
# Night Shift Phases

| # | Phase |
|---|-------|
| 1 | [first ~60 chars] |
| 2 | [first ~60 chars] |
| ... | ... |
```

If the file has no phase content under any `## Phase N` heading, say "No phases defined."

### 3. Add a phase

Append a new `## Phase N` section to the phase file (resolve the `review.md` symlink to find the real file), where N is the next number after the last existing phase. Use the user's description as the content — keep it as-is (they may include specific commands or instructions).

Always re-read the file before appending to confirm the current highest phase number.

**Important:** Preserve the preamble (everything before `## Phase 1`) and the Dynamic Clean-State Ledger — the orchestrator sends the full document as context to the parent agent. Do not remove or overwrite it.

### 4. Update a phase

Replace the content under a specific `## Phase N` heading with the user's new description. Read the file, locate the heading, replace everything between it and the next `## Phase` heading (or end of file), then write back.

### 5. Delete a phase

Remove a `## Phase N` section entirely. After deletion, **renumber** all subsequent phases so there are no gaps. For example, deleting Phase 3 from an 8-phase roster renumbers phases 4→3, 5→4, ..., 8→7.

Always confirm with the user before deleting.

### 6. Skip / unskip a night

- **Skip:** `touch ~/.agents/cron/nightshift/.night-shift-skip`
- **Unskip:** `rm ~/.agents/cron/nightshift/.night-shift-skip`

Tell the user what you did. If the sentinel already exists and the user asks to skip, confirm they still want it (it may be from a previous skip).

### 7. Change project

Read `~/.agents/cron/nightshift/.env`, update the `NIGHT_SHIFT_PROJECT` line, and write back. Confirm the new path exists and is a git repo. Warn if it isn't.

### 8. Show configuration

Read `~/.agents/cron/nightshift/.env` and display the current settings:

```
# Night Shift Configuration

NIGHT_SHIFT_AGENT=pi
NIGHT_SHIFT_ENABLED=false
NIGHT_SHIFT_PROJECT=~/projects/tockbot
NIGHT_SHIFT_ORCHESTRATOR_TIMEOUT=300
```
