---
description: Review unmerged changes, fix issues, commit, and push
---

1. Inspect the current branch and `git status`. Identify the main branch (`origin/main` if available, otherwise `main`) and compute the merge base.

2. Review scope is **only commits and files changed in this worktree branch since the merge base with main** (`git log <merge-base>..HEAD` and `git diff <merge-base>..HEAD`). Do not broaden to unrelated PR history, another branch, dirty files, or untracked files.

3. If unexpected dirty files, untracked files, or out-of-scope commits exist, stop and ask. Do not discard, modify, commit, or push unrelated user changes.

4. Review the scoped changes for correctness, security, performance, tests, and needless complexity.

5. Fix clear scoped issues with the smallest safe diff. Update relevant docs only when the reviewed change requires it.

6. Run the smallest relevant quality gates on the final `HEAD`.

7. Commit reviewed fixes only, confirm the branch commits are intended for review, then push.

8. Report the merge base, reviewed commit range, what changed, what ran, and any remaining blockers.
