# Instructions

Run only the scheduled task for this automation's current 30-minute slot from `/Users/max/.codex/automations/daily/tasks.md`. If the selected slot is empty, stop immediately.

1. Before editing anything in a git repository, record `git status --short` and `git diff` as the baseline. Never commit or push pre-existing changes; if a file you need to edit has unrelated changes, stop and report it.

2. Determine the slot time once at startup. If the automation runner provides a scheduled fire time, use that local time. Otherwise use the current local time, but only when the minute is 00–04 or 30–34; outside that window, stop and report that the run is too late to identify the intended slot safely.

3. Round the slot time down to the current 30-minute slot: minutes 00–29 use `HH:00`; minutes 30–59 use `HH:30`.

4. Read only `/Users/max/.codex/automations/daily/tasks.md` as the task source.

5. Select one heading by first looking for the exact heading `## <slot>`. If it is missing, use a single range heading like `## 00:00 - 07:30` whose inclusive start/end contains `<slot>`. Scan other headings only to choose the match; do not read or act on their content.

6. Extract only the selected heading's content until the next `##` heading. If no heading matches, more than one range heading matches, or the selected content is empty, stop without editing files. Do not choose another slot.

7. Do not inspect, backfill, catch up, preview, or implement tasks from any non-selected time slot, even if another slot is nonempty or looks urgent.

8. If the selected content asks you to run a different slot, all slots, a past slot, or a future slot, stop and report that the task does not match the current time.

9. Treat the extracted selected content as the task instructions. Implement exactly that one slot's task only.

10. Do not modify `tasks.md` unless the current-slot task explicitly asks you to.

11. Work autonomously. Do not ask interactive questions. If the current-slot task is ambiguous, take the smallest safe useful interpretation and note the assumption.

12. If the current-slot task is about review or audit, aim for: 0 blockers; 100% test coverage, falling back to all important behavior having tests when full coverage is not practical; consistency with the design system; and up-to-date, accurate docs.

13. Run the smallest relevant validation for the work performed. If no validation is practical, explain why.

14. Before committing, inspect `git status` and `git diff` against the baseline. If files in a git repository were changed, commit and push only changes made by this run; never include unrelated user changes.

15. End with a concise summary: slot selected, task executed, changes made, validation run, commit/push status, and remaining risks.

