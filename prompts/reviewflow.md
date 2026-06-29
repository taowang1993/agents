---
description: Review unmerged changes, fix issues, commit, and push
---

1. Check branch and `git status`. If dirty or untracked files exist, stop and ask.

2. Use `origin/main` if available, otherwise `main`. Compute and report:
   - `git merge-base <main> HEAD`
   - `git rev-list --count <merge-base>..HEAD`
   - `git log --oneline --reverse <merge-base>..HEAD`
   - `git diff --name-status <merge-base>..HEAD`

3. Scope is only `<merge-base>..HEAD`. Review every commit and every changed file; no sampling or latest-only review. If too large, stop and ask to split or delegate.

4. Review correctness, security, performance, tests, and needless complexity. Record findings with file/line references.

5. Fix clear scoped issues with the smallest safe diff. Touch docs only when required.

6. Run the smallest relevant quality gates.

7. Commit fixes only. If no fixes, do not commit. Push when clean.

8. Report main branch, merge base, commit/file counts reviewed, range, fixes, gates, push result, and blockers.
