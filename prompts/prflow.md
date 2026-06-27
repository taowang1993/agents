---
description: Validate the branch, open a PR, and fix conflicts
---

1. Inspect status and identify the intended PR changes only. Do not discard or include unrelated user changes; if unexpected dirty files exist, stop and ask.

2. Run PR validation and fix all failures. Commit intended fixes only. Rerun validation on `HEAD`, then push.

3. Open a PR for the intended branch commits and link related Beads issues.

4. If the PR has conflicts, resolve them, commit the conflict fixes, rerun PR validation on `HEAD`, then push.

5. After the PR is open and validated, close only completed related Beads issues. Do not close epics unless all child work is complete.