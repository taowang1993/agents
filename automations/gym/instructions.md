# Gym Automation Instructions

Run the gym review from `/Users/max/.codex/automations/gym/tasks.md` whenever this automation is triggered.

1. Before editing anything in a git repository, record `git status --short` and `git diff` as the baseline. Never commit or push pre-existing changes; if a file you need to edit has unrelated changes, stop and report it.
2. Read `/Users/max/.codex/automations/gym/tasks.md`, select exactly one task file using the slot map, then read only that selected file.
3. Work autonomously. Do not ask interactive questions. If the review finds a clear bug, test gap, docs drift, or design-system violation, fix it with the smallest safe change.
4. If the run cannot safely finish all confirmed work, finish the current validation/commit path and file Beads follow-up issues for the remainder.
5. Run the smallest relevant validation for the work performed. If no validation is practical, explain why.
6. Before committing, inspect `git status` and `git diff` against the baseline. Commit and push only changes made by this run; never include unrelated user changes.
7. End with a concise summary: task file selected, areas reviewed, changes made, validation run, commit/push status, and remaining risks.
