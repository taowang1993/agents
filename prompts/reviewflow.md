---
description: Review unmerged changes, fix issues, commit, and push
---

1. Inspect the current branch and `git status`. If there are dirty or untracked files, stop and ask before reviewing, fixing, committing, or pushing.

2. Identify the main branch (`origin/main` if available, otherwise `main`) and compute the merge base. Compare the current worktree branch against that main branch:
   - `git merge-base <main> HEAD`
   - `git rev-list --count <merge-base>..HEAD`
   - `git log --oneline --reverse <merge-base>..HEAD`
   - `git diff --name-status <merge-base>..HEAD`

3. Review scope is **only the commits and files changed in this worktree branch since the merge base with main**. Do not broaden to unrelated PR history, another branch, dirty files, or untracked files.

4. Review **every commit** in `git log <merge-base>..HEAD` and **every changed file** in `git diff --name-only <merge-base>..HEAD`. Do not sample and do not only review the most recent commits. For each commit, inspect its patch or an equivalent grouped diff; for each changed file, inspect the final diff and relevant final source. If the range is too large to review completely in one pass, stop and ask whether to split the review or delegate subsystem reviews.

5. Review the scoped changes for correctness, security, performance, tests, and needless complexity. Record clear findings with file/line references.

6. Fix clear scoped issues with the smallest safe diff. Update relevant docs only when the reviewed change requires it. Do not modify out-of-scope user changes.

7. Run the smallest relevant quality gates on the final `HEAD`.

8. Commit reviewed fixes only. If there are no fixes, do not create a commit. Push the branch after reviewed fixes are committed and the worktree is clean.

9. Report the main branch, merge base, total commits reviewed, total files reviewed, reviewed commit range, fixes made, quality gates run, push result, and any remaining blockers or explicitly unreviewed scope.
