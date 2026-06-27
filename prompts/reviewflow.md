---
description: Review unmerged changes, fix issues, commit, and push
---

1. Inspect the current branch, `git status`, and commits/files changed against the PR base. If the base is unclear, identify it first.

2. Identify the intended review scope. Do not discard, modify, commit, or push unrelated user changes; if unexpected dirty files or commits exist, stop and ask.

3. Review the intended changes for correctness, security, performance, tests, and needless complexity.

4. Fix clear issues with the smallest safe diff. Update relevant docs only when the reviewed change requires it.

5. Run the smallest relevant quality gates on the final `HEAD`.

6. Commit reviewed fixes only, confirm the branch commits are intended for review, then push.

7. Report what changed, what ran, and any remaining blockers.
