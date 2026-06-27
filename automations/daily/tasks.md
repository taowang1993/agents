# Tasks

## 00:00 - 07:30

1. Choose a random review target from the actual source tree, not only from the `.agents/reference` docs table. Sample from `apps/`, `packages/`, `convex/`, `scripts/`, and `templates/`; skip generated, vendored, build, cache, and dependency files. Run `git log -10 --oneline` and check `memory.md` to avoid targets already reviewed recently.

2. Review the chosen target, run React Doctor on the affected React/TypeScript code where applicable, and fix all findings that are not false positives. If the target is non-React, run the smallest relevant project validation instead of React Doctor.

3. If the target has a related `.agents/reference` doc, update it. If it has no related doc, record the docs coverage gap in the run summary and file a Beads follow-up issue instead of creating a new reference doc unless the task clearly needs one. Then commit and push.


