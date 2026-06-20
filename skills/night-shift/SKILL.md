---
name: night-shift
description: >-
  Manage the Pi Night Shift system end-to-end — review overnight results,
  inspect or update feature lanes and the clean-state ledger, skip a night,
  and change the target project. Use whenever the user mentions night shift
  in any context: reviewing logs ("what did night shift do?"), managing
  feature lanes ("show night shift lanes", "defer Calls", "reactivate
  TockDesigner", "update the TockCoder lane"), skipping ("skip night shift
  tonight"), configuration ("change night shift project"), or asking about
  the system ("how is night shift configured?", "show night shift lanes").
---

# Night Shift

You are the interface to the user's Pi Night Shift system — one nightly launchd job that runs a single headless Pi parent orchestrator against a project. The parent reads `review.md`, uses the Dynamic Clean-State Ledger to skip unchanged clean feature lanes, and delegates dirty feature-lane triage/fixes to Pi subagents when useful.

## Key files

| File | Purpose |
|------|---------|
| `~/.agents/cron/nightshift/nightshift.sh` | The runner script |
| `~/.agents/cron/nightshift/review.md` | Feature-oriented review standard plus Dynamic Clean-State Ledger. Symlink to `<project>/.agents/reference/review.md`. |
| `~/.agents/cron/nightshift/.env` | Project config (`NIGHT_SHIFT_PROJECT`, `NIGHT_SHIFT_AGENT`, `NIGHT_SHIFT_ENABLED`, optional `NIGHT_SHIFT_ORCHESTRATOR_TIMEOUT`) |
| `~/.agents/cron/nightshift/.night-shift-skip` | Sentinel — if present, the nightly orchestrator skips |
| `~/.cron-logs/nightshift-YYYYMMDD.log` | Combined daily status log |
| `~/.cron-logs/nightshift-orchestrator.log` | Full stdout/stderr log for the single orchestrator job |
| `~/.agents/cron/nightshift/launchagents/com.max.nightshift.plist` | Versioned launchd job definition for the single orchestrator |
| `~/Library/LaunchAgents/com.max.nightshift.plist` | Symlink to the active orchestrator launchd definition |

When the user refers to a "feature lane," they mean the active/deferred feature lanes and matching ledger rows in `review.md`. The active launchd setup runs one parent Pi session that owns all dirty feature lanes for the night. Legacy slot mode (`nightshift.sh <slot-index>`) remains supported by the script only for manual fallback against old `## Phase N` review docs; no per-slot launchd jobs are installed or versioned.

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
[One sentence: orchestrator completed/timed out/failed/skipped; include dirty feature lanes/fixes if visible in logs.]

## Results

| Run | Feature Lane | Result |
|-----|--------------|--------|
| orchestrator | all dirty feature ledger lanes | ✅ completed |

For legacy logs, use the old slot table only when slot blocks are present.

## Commits Made
[list, or "No commits found."]

## Blockers
[list, or "No blockers documented."]
```

If the orchestrator was skipped because `NIGHT_SHIFT_ENABLED=false` or `.night-shift-skip` exists, say so directly. If a legacy slot log says `no phase defined`, say "Night shift legacy slot was skipped — no phase was defined."

### 2. List feature lanes

Read the review file (resolve the `review.md` symlink first) and display the current roster from `### Active Feature Lanes`, `### Deferred Feature Lanes`, and the Dynamic Clean-State Ledger:

```
# Night Shift Feature Lanes

## Active
| Lane | Ledger Key | Status |
|------|------------|--------|
| Tockbot Agent — Memory System | agent-memory | pending |
| TockCoder | tockcoder | pending |

## Deferred
| Lane | Ledger Key | Reason |
|------|------------|--------|
| TockDesigner | tockdesigner-deferred | deferred |
| Calls | calls-deferred | deferred |
```

If the file is still an old `## Phase N` review doc, say it is a legacy phase-based review file and show the phase roster instead.

### 3. Add or update a feature lane

Resolve the `review.md` symlink to find the real file, then update all three places that define a lane:

1. The **Active Feature Lanes** or **Deferred Feature Lanes** roster.
2. The **Dynamic Clean-State Ledger** row (`Key`, `Feature`, `Path filter`, `Clean through`, `Date`, `Evidence`, `Reopen trigger`).
3. The matching detailed section under **Feature Review Lanes**.

Keep the user's requested behavior and commands as-is when adding lane-specific review instructions. Prefer stable ledger keys such as `agent-memory`, `tockcoder`, or `voice-notes`. Use `pending` for new active lane baseline fields unless the user explicitly provides a clean baseline.

**Important:** Preserve the preamble and Dynamic Clean-State Ledger. The orchestrator sends the full document as context to the parent agent. Do not remove or overwrite unrelated lanes.

### 4. Defer or reactivate a feature lane

Resolve the `review.md` symlink and edit the real file.

- **Defer:** move or list the lane under **Deferred Feature Lanes**, set its ledger `Clean through` and `Date` fields to `deferred`, and set Evidence to a short reason such as `Deferred by owner; do not audit now`. Keep a detailed deferred section so future agents know not to audit it.
- **Reactivate:** move or list the lane under **Active Feature Lanes**, change deferred ledger fields back to `pending` unless the user provides a clean baseline, and restore active review instructions.

Always preserve any existing implementation notes, path filters, and validation commands unless the user asks to remove them.

### 5. Delete a feature lane

Only delete a lane when the user explicitly asks to remove it, not merely defer it. Delete the roster entry, ledger row, and detailed section for that lane. There is no renumbering requirement for feature lanes.

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
