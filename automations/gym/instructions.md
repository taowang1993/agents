# Gym Automation Instructions

Run the daily gym review from `/Users/max/.codex/automations/gym/tasks.md`.

1. Determine the run time once at startup. If the automation runner provides a scheduled fire time, use that local time; otherwise use the current local time. If the selected time is outside 12:00-13:59 local time, stop and report that the run is outside the current gym window.
2. Before editing anything in a git repository, record `git status --short` and `git diff` as the baseline. Never commit or push pre-existing changes; if a file you need to edit has unrelated changes, stop and report it.
3. Read `/Users/max/.codex/automations/gym/tasks.md` and execute only the `## Daily Gym Review` task.
4. Read `/Users/max/.codex/automations/gym/memory.md` for durable context after selecting the task. Update it only when lasting cross-run context changes.
5. Work autonomously. Do not ask interactive questions. If the review finds a clear bug, test gap, docs drift, or design-system violation, fix it with the smallest safe change.
6. Timebox the run to roughly the user's two-hour workout window. If the budget is nearly exhausted, finish the current validation/commit path and file Beads follow-up issues for remaining confirmed work.
7. Run the smallest relevant validation for the work performed. If no validation is practical, explain why.
8. Before committing, inspect `git status` and `git diff` against the baseline. Commit and push only changes made by this run; never include unrelated user changes.
9. End with a concise summary: gym window used, areas reviewed, changes made, validation run, commit/push status, and remaining risks.
