---
name: automation
description: Create, inspect, and update Codex automation directories for scheduled Codex runs, using automation.toml plus instructions.md and tasks.md. Use whenever the user mentions Codex automations, automation.toml, scheduled or cron Codex tasks, recurring jobs, RRULE schedules, or says "<project> automation task". Treat "tockbot automation task" as editing /Users/max/.codex/automations/tockbot/tasks.md. Default new automations to model gpt-5.5, reasoning_effort xhigh, local execution, and cwds ["/Users/max/projects/tockbot"].
---

# Codex Automation

Use this skill to create small, safe Codex automation directories under `~/.codex/automations/<id>/`.

## Directory Setup

Create or maintain this layout:

```text
~/.codex/automations/<id>/
├── automation.toml
├── instructions.md
└── tasks.md
```

- Keep `automation.toml` as machine config only.
- Set the TOML `prompt` to a short pointer to `instructions.md` so the Codex app cannot flatten a long multiline prompt into unreadable TOML.
- Put reusable operating rules in `instructions.md`.
- Put mutable work items, schedules, queues, and per-task goals in `tasks.md`.

## Default Config

Use these defaults for new automations unless the user explicitly asks otherwise:

```toml
status = "PAUSED"
model = "gpt-5.5"
reasoning_effort = "xhigh"
execution_environment = "local"
cwds = ["/Users/max/projects/tockbot"]
```

`status` can be `"PAUSED"` or `"ACTIVE"`. Default `status` to `"PAUSED"` so a new automation does not start running before the user reviews it.

## Workflow

1. Read any existing automation the user names before editing it.
2. For new automations, choose a lowercase kebab-case `id` and create `~/.codex/automations/<id>/`.
3. Create or update `automation.toml`, `instructions.md`, and `tasks.md`.
4. In `automation.toml`, set `version = 1`, keep `id` equal to the directory name, and use `kind = "cron"` for scheduled recurring runs.
5. Write a short human `name` in Title Case.
6. Set `prompt = "Read `/Users/max/.codex/automations/<id>/instructions.md` and follow it exactly."`.
7. Set `rrule` to an RFC 5545 recurrence string such as `RRULE:FREQ=DAILY;BYHOUR=2;BYMINUTE=0`. For a 30-minute all-day timeline, use `RRULE:FREQ=DAILY;BYHOUR=0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23;BYMINUTE=0,30`.
8. Set `created_at` and `updated_at` to the current Unix timestamp in milliseconds. Preserve `created_at` when updating an existing automation.
9. Keep `instructions.md` stable and narrow enough for one scheduled run.
10. Put the actual changing task content in `tasks.md`.
11. After writing, read the files back or run a TOML parse check if one is available.

## Project Automation Task Requests

When the user says `"<project> automation task"`, treat `<project>` as the automation id and edit that automation's `tasks.md`.

Examples:

- `"tockbot automation task"` means `/Users/max/.codex/automations/tockbot/tasks.md`.
- `"create a tockbot automation task"` means add task content to `/Users/max/.codex/automations/tockbot/tasks.md`, not create a new automation.

Use this flow:

1. Normalize the project name to lowercase kebab-case unless an exact automation directory already exists.
2. Resolve the automation directory as `/Users/max/.codex/automations/<project>/`.
3. Read `automation.toml`, `instructions.md`, and `tasks.md` before editing so you follow the existing task format and selection rules.
4. If the automation directory is missing, ask whether to create the automation unless the user explicitly asked to create the automation itself.
5. If `tasks.md` is a timeline and the user did not specify a slot or placement rule, ask which slot to use instead of guessing.
6. Add or update only the selected task entry; preserve all other tasks.
7. Put review/audit goals in `tasks.md`, not `instructions.md`.

## automation.toml Template

```toml
version = 1
id = "example-automation"
kind = "cron"
name = "Example Automation"
prompt = "Read `/Users/max/.codex/automations/example-automation/instructions.md` and follow it exactly."
status = "PAUSED"
rrule = "RRULE:FREQ=DAILY;BYHOUR=2;BYMINUTE=0"
model = "gpt-5.5"
reasoning_effort = "xhigh"
execution_environment = "local"
cwds = ["/Users/max/projects/tockbot"]
created_at = 1780000000000
updated_at = 1780000000000
```

## instructions.md

Use `instructions.md` for stable run logic. Include only the steps every run needs:

- State the exact objective for one invocation.
- Tell Codex to read `tasks.md` for the task source.
- Define selection rules when the job processes one item from a queue or schedule.
- Tell Codex to stop cleanly when there is no matching task.
- For time-slot automations, tell Codex to determine the local time once, round down to the current slot, extract only the exact matching heading, and stop if that slot is missing or empty.
- Forbid catch-up behavior: do not inspect, backfill, preview, or implement tasks from other slots.
- Tell Codex to stop if the selected task asks it to run a past, future, different, or all-slots task.
- Tell Codex when to edit, commit, push, or avoid doing so.
- Define the smallest relevant validation.
- End with the exact summary you want back.

Example:

```markdown
# Example Automation Instructions

Read `/Users/max/.codex/automations/example-automation/tasks.md` and execute only the matching task.

Hard rule: if the selected task is empty, stop immediately; do not implement another task.

1. Select exactly one task using the rules in `tasks.md`.
2. If no task matches, stop without editing files.
3. Implement only the selected task.
4. Do not backfill, preview, or implement any other queued or scheduled task.
5. Run the smallest relevant validation.
6. End with: task selected, changes made, validation run, and remaining risks.
```

For a current-time 30-minute timeline, use this logic in `instructions.md`:

```markdown
1. Determine the current local time once at startup in 24-hour `HH:MM` format.
2. Round down to the current 30-minute slot: minutes 00–29 use `HH:00`; minutes 30–59 use `HH:30`.
3. Read only this automation's `tasks.md` as the task source.
4. Extract only the content under the exact heading `## <slot>` until the next `##` heading.
5. If the exact current slot heading is missing or empty, stop without editing files. Do not choose another slot.
6. Do not inspect, backfill, catch up, preview, or implement tasks from any other time slot.
7. If the current slot asks you to run a different slot, all slots, a past slot, or a future slot, stop and report that the task does not match the current time.
```

## tasks.md

Use `tasks.md` for the work that changes over time: timeline slots, queues, checklists, or task-specific goals.

For a 30-minute timeline, use headings like:

```markdown
# Tasks

## 00:00

## 00:30

## 01:00
```

When a task is about review or audit, put these goals in that task entry or in a `tasks.md` section that applies to those review/audit tasks:

- Findings: reach 0 blockers.
- Test Coverage: aim for 100% test coverage; fall back to ensuring all important behavior has tests when full coverage is not practical.
- Design System: keep the work consistent with the project's design system.
- Docs: keep documentation up-to-date and accurate.

Skip speculative retry systems, extra progress files, or broad audits unless the user asks for them.

## Minimal Checks

Use one of these cheap checks after editing:

```bash
python3 - <<'PY'
import tomllib
from pathlib import Path
path = Path('/Users/max/.codex/automations/example-automation/automation.toml')
tomllib.loads(path.read_text())
print('ok')
PY
```

Or use a project-local formatter/parser if the repository already has one installed. Do not add dependencies just to parse TOML.
