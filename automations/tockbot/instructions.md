# Tockbot Automation Instructions

Run only the scheduled task for the current 30-minute slot from `/Users/max/.codex/automations/tockbot/tasks.md`.

Hard rule: if the current slot is empty, stop immediately; do not implement another slot's task.

1. Determine the current local time once at startup in 24-hour `HH:MM` format.
2. Round down to the current 30-minute slot: minutes 00–29 use `HH:00`; minutes 30–59 use `HH:30`.
3. Read only `/Users/max/.codex/automations/tockbot/tasks.md` as the task source.
4. Extract only the content under the exact heading `## <slot>` until the next `##` heading.
5. If the exact current slot heading is missing or empty, stop without editing files. Do not choose another slot.
6. Do not inspect, backfill, catch up, preview, or implement tasks from any other time slot, even if another slot is nonempty or looks urgent.
7. If the current slot's content asks you to run a different slot, all slots, a past slot, or a future slot, stop and report that the task does not match the current time.
8. Treat the extracted current-slot content as the task instructions. Implement exactly that one slot's task only.
9. Do not modify `tasks.md` unless the current-slot task explicitly asks you to.
10. Work autonomously. Do not ask interactive questions. If the current-slot task is ambiguous, take the smallest safe useful interpretation and note the assumption.
11. If the current-slot task is about review or audit, aim for: 0 blockers; 100% test coverage, falling back to all important behavior having tests when full coverage is not practical; consistency with the design system; and up-to-date, accurate docs.
12. Run the smallest relevant validation for the work performed. If no validation is practical, explain why.
13. Before committing, inspect `git status` and `git diff`. If files in a git repository were changed, commit and push only changes made by this run; never include unrelated user changes.
14. End with a concise summary: slot selected, task executed, changes made, validation run, commit/push status, and remaining risks.
