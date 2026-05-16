---
name: night-shift
description: >-
  Manage the Pi Night Shift system end-to-end — review overnight results,
  create/update/delete/reorder tasks, skip a night, and change the target
  project. Use whenever the user mentions night shift in any context:
  reviewing logs ("what did night shift do?"), managing tasks ("add a
  task to night shift", "update night shift task 3", "remove task 4"),
  skipping ("skip night shift tonight"), configuration ("change night
  shift project"), or asking about the system ("how is night shift
  configured?", "show night shift tasks").
---

# Night Shift

You are the interface to the user's Pi Night Shift system — a set of 8 hourly launchd jobs (midnight–7 AM) that run `pi` headlessly against a project.

## Key files

| File | Purpose |
|------|---------|
| `~/.agents/cronjob/pi-night-shift.sh` | The runner script |
| `~/.agents/cronjob/pi-night-tasks.md` | Task definitions (`## Task N` headings) |
| `~/.agents/cronjob/.env` | Project config (`NIGHT_SHIFT_PROJECT`) |
| `~/.agents/cronjob/.night-shift-skip` | Sentinel — if present, all jobs skip |
| `~/.cron-logs/pi-night-shift-YYYYMMDD.log` | Daily logs |

When the user refers to a "task number," they mean the `## Task N` heading number, not the hour index. Task 1 runs at midnight (hour 0), task 2 at 1 AM, etc.

## Operations

Determine which operation the user wants, then follow the corresponding section below. Always confirm destructive actions (delete, skip) before executing.

### 1. Review logs

Read and summarize what the night shift did.

- **Finding the log:** Default to today (`date +%Y%m%d`). If today's log doesn't exist or is empty, fall back to yesterday (`date -v-1d +%Y%m%d`). Respect explicit dates ("Tuesday", "May 12").
- **Extracting the project:** Each run header has a `Project:` line. Use that path for blockers and git checks. If missing (older logs), fall back to `~/projects/tockbot`.
- **Parsing:** Each hour block is delimited by `═══`. Extract hour number, task one-liner, and result (`✅` completed, `⏰` timed out, `❌` failed). An incomplete block (header but no result) means "interrupted."
- **Supporting evidence:**
  1. `<project>/.pi/night-shift-blockers.md` — if modified since the night shift ran, read it.
  2. `git -C <project> log --since="YYYY-MM-DD 00:00" --until="YYYY-MM-DD 08:00" --oneline` — drop `--author` if no results.

**Report template:**

```
# Night Shift Report — [date]

## Summary
[One sentence: X of Y tasks completed, Z timed out, W failed.]

## Results

| Hour | Task | Result |
|------|------|--------|
| 0    | [first ~60 chars] | ✅ completed |
| ...  | ...  | ...    |

## Commits Made
[list, or "No commits found."]

## Blockers
[list, or "No blockers documented."]
```

If all tasks were skipped (`no task defined`), say "Night shift was skipped — no tasks were defined."

### 2. List tasks

Read `~/.agents/cronjob/pi-night-tasks.md` and display the current roster:

```
# Night Shift Tasks

| # | Hour | Task |
|---|------|------|
| 1 | 0 (midnight) | [first ~60 chars] |
| 2 | 1 AM | [first ~60 chars] |
| ... | ... | ... |
```

If the file has no task content under any heading, say "No tasks defined."

### 3. Add a task

Append a new `## Task N` section to the task file, where N is the next number after the last existing task. Use the user's description as the content — keep it as-is (they may include specific commands or instructions).

Always re-read the file before appending to confirm the current highest task number.

### 4. Update a task

Replace the content under a specific `## Task N` heading with the user's new description. Read the file, locate the heading, replace everything between it and the next `## Task` heading (or end of file), then write back.

### 5. Delete a task

Remove a `## Task N` section entirely. After deletion, **renumber** all subsequent tasks so there are no gaps. For example, deleting Task 3 from an 8-task roster renumbers tasks 4→3, 5→4, ..., 8→7.

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

NIGHT_SHIFT_PROJECT=~/projects/tockbot
NIGHT_SHIFT_TIMEOUT=45
```
