---
description: Review unmerged changes, fix issues, commit, and push
---

1. Check branch and `git status`. If dirty or untracked files exist, stop and ask.

2. Use `origin/main` if available, otherwise `main`; compute the merge base, commit count/log, and changed-file list for `<merge-base>..HEAD`.

3. Review every commit and changed file in that range. No sampling or latest-only review; if too large, stop and ask to split or delegate.

4. Fix scoped findings, then run the smallest relevant quality gates.

5. Commit fixes only, push when clean, and report main branch, merge base, reviewed counts/range, fixes, gates, push result, and blockers.
