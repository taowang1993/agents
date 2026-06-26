---
description: Review unmerged changes, fix issues, commit, and push
---
Use this prompt as a workflow shortcut, not a shell command. Do not look for, install, or run a `reviewflow` binary. Execute the steps below manually for the current repo.

1. Inspect the current branch, `git status`, and all unmerged/uncommitted changes.

2. Review for correctness, security, performance, tests, and needless complexity.

3. Fix clear issues with the smallest safe diff. Do not touch unrelated user changes.

4. Run the smallest relevant quality gates for touched code.

5. Update relevant docs if needed. 

6. Commit the reviewed fixes and push the current branch.

7. Report what changed, what ran, and any remaining blockers.
