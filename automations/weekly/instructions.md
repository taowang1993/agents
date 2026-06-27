# Instructions

Run only the scheduled weekly task for this automation's current hourly slot from `/Users/max/.codex/automations/weekly/tasks.md`. If the selected slot is empty, stop immediately.

1. Before editing anything in a git repository, record `git status --short` and `git diff` as the baseline. Never commit or push pre-existing changes; if a file you need to edit has unrelated changes, stop and report it.

2. Determine the slot time once at startup. If the automation runner provides a scheduled fire time, use that local time. Otherwise use the current local time, but only when it is Monday and the minute is 00–04; outside that window, stop and report that the run is too late or not on the scheduled day.

3. Format the slot as `HH:00`.

4. Read only `/Users/max/.codex/automations/weekly/tasks.md` as the task source.

5. Extract only the content under the exact heading `## <slot>` until the next `##` heading.

6. If the exact current slot heading is missing or empty, stop without editing files. Do not choose another slot.

7. Do not inspect, backfill, catch up, preview, or implement tasks from any other time slot, even if another slot is nonempty or looks urgent.

8. If the current slot's content asks you to run a different slot, all slots, a past slot, or a future slot, stop and report that the task does not match the current time.

9. Treat the extracted current-slot content as the task instructions. Implement exactly that one slot's task only.

10. Do not modify `tasks.md` unless the current-slot task explicitly asks you to.

11. Work autonomously. Do not ask interactive questions. If the current-slot task is ambiguous, take the smallest safe useful interpretation and note the assumption.

12. Run the smallest relevant validation for the work performed. If no validation is practical, explain why.

13. Before committing, inspect `git status` and `git diff` against the baseline. If files in a git repository were changed, commit and push only changes made by this run; never include unrelated user changes.

14. End with a concise summary: slot selected, task executed, changes made, validation run, commit/push status, and remaining risks.