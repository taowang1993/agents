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

You are the interface to the user's Pi Night Shift system — a set of 8 hourly launchd jobs (midnight–7 AM) that run `pi` headlessly against a project.

## Key files

| File | Purpose |
|------|---------|
| `~/.agents/cronjob/nightshift.sh` | The runner script |
| `~/.agents/cronjob/review.md` | Phase definitions (`## Phase N` headings). Symlink to `<project>/.agents/reference/review.md`. |
| `~/.agents/cronjob/.env` | Project config (`NIGHT_SHIFT_PROJECT`, `NIGHT_SHIFT_AGENT`, `NIGHT_SHIFT_ENABLED`) |
| `~/.agents/cronjob/.night-shift-skip` | Sentinel — if present, all jobs skip |
| `~/.cron-logs/nightshift-YYYYMMDD.log` | Combined daily log (status lines from all hours) |
| `~/.cron-logs/nightshift-<HOUR>.log` | Per-hour stdout log (full agent output for that hour) |
| `~/Library/LaunchAgents/com.max.nightshift-*.plist` | launchd job definitions (one per hour 0–7) |

When the user refers to a "phase number," they mean the `## Phase N` heading number, not the hour index. Phase 1 runs at midnight (hour 0), phase 2 at 1 AM, etc.

## Operations

Determine which operation the user wants, then follow the corresponding section below. Always confirm destructive actions (delete, skip) before executing.

### 1. Review logs

Read and summarize what the night shift did.

- **Finding the log:** Default to today (`date +%Y%m%d`). If today's log doesn't exist or is empty, fall back to yesterday (`date -v-1d +%Y%m%d`). Respect explicit dates ("Tuesday", "May 12").
  - The combined log: `~/.cron-logs/nightshift-YYYYMMDD.log` — summary status per hour.
  - Per-hour logs: `~/.cron-logs/nightshift-<HOUR>.log` — full agent output for that hour.
- **Extracting the project:** Each run header in the per-hour log has a `Project:` line. Use that path for blockers and git checks. If missing (older logs), fall back to the project from `.env`.
- **Parsing:** Each hour block in the combined log begins with a `═══` header or a status line like `[HH:MM:SS] Hour N …`. Extract hour number, phase one-liner (from header in per-hour log), and result (`✅` completed, `⏰` timed out, `❌` failed). An incomplete block (header but no result) means "interrupted."
- **Supporting evidence:**
  1. `<project>/.pi/night-shift-blockers.md` — if modified since the night shift ran, read it.
  2. `git -C <project> log --since="YYYY-MM-DD 00:00" --until="YYYY-MM-DD 08:00" --oneline` — drop `--author` if no results.

**Report template:**

```
# Night Shift Report — [date]

## Summary
[One sentence: X of Y phases completed, Z timed out, W failed.]

## Results

| Hour | Phase | Result |
|------|-------|--------|
| 0    | [first ~60 chars] | ✅ completed |
| ...  | ...   | ...    |

## Commits Made
[list, or "No commits found."]

## Blockers
[list, or "No blockers documented."]
```

If all phases were skipped (`no phase defined`), say "Night shift was skipped — no phases were defined."

### 2. List phases

Read the phase file (resolve the `review.md` symlink first) and display the current roster:

```
# Night Shift Phases

| # | Hour | Phase |
|---|------|-------|
| 1 | 0 (midnight) | [first ~60 chars] |
| 2 | 1 AM | [first ~60 chars] |
| ... | ... | ... |
```

If the file has no phase content under any `## Phase N` heading, say "No phases defined."

### 3. Add a phase

Append a new `## Phase N` section to the phase file (resolve the `review.md` symlink to find the real file), where N is the next number after the last existing phase. Use the user's description as the content — keep it as-is (they may include specific commands or instructions).

Always re-read the file before appending to confirm the current highest phase number.

**Important:** Preserve the preamble (everything before `## Phase 1`) — the script sends it as context to the agent. Do not remove or overwrite it.

### 4. Update a phase

Replace the content under a specific `## Phase N` heading with the user's new description. Read the file, locate the heading, replace everything between it and the next `## Phase` heading (or end of file), then write back.

### 5. Delete a phase

Remove a `## Phase N` section entirely. After deletion, **renumber** all subsequent phases so there are no gaps. For example, deleting Phase 3 from an 8-phase roster renumbers phases 4→3, 5→4, ..., 8→7.

Always confirm with the user before deleting.

### 6. Skip / unskip a night

- **Skip:** `touch ~/.agents/cronjob/.night-shift-skip`
- **Unskip:** `rm ~/.agents/cronjob/.night-shift-skip`

Tell the user what you did. If the sentinel already exists and the user asks to skip, confirm they still want it (it may be from a previous skip).

### 7. Change project

Read `~/.agents/cronjob/.env`, update the `NIGHT_SHIFT_PROJECT` line, and write back. Confirm the new path exists and is a git repo. Warn if it isn't.

### 8. Show configuration

Read `~/.agents/cronjob/.env` and display the current settings:

```
# Night Shift Configuration

NIGHT_SHIFT_AGENT=pi
NIGHT_SHIFT_ENABLED=false
NIGHT_SHIFT_PROJECT=~/projects/tockbot
```
