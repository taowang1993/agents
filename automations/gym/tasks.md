# Tasks

Each gym run executes exactly one task file.

## Slot Map

Use the scheduled fire time if available; otherwise use the local start time rounded down to the current 30-minute slot. If the slot is not listed, stop without editing.

- `05:00` — `task1.md`
- `05:30` — `task2.md`
- `06:00` — `task3.md`
- `06:30` — `task4.md`
- `07:00` — `task5.md`
- `07:30` — stop; reserved

If the selected task file is missing or empty, stop without editing. Read only the selected task file. Do not inspect, preview, or fix another task file unless the selected task directly leads there.

## Common Rules

- Review real source, not only docs. Use CodeGraph where available before editing symbols.
- Fix confirmed findings that are not false positives. Prefer deletion/reuse and one root-cause fix over caller-by-caller patches.
- Add the smallest useful regression test for non-trivial logic changes or missing coverage discovered during review.
- Update related `.agents/reference/*.md` only when behavior or ownership changes.
- Run React Doctor for affected React/TypeScript UI where applicable; otherwise run the smallest relevant validation.
- File Beads follow-up issues for confirmed work that cannot fit safely in the current run.
- Commit and push only changes made by the gym run.
