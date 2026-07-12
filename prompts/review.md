---
description: Review unmerged changes and fix bad code.
---

1. In the current worktree, fetch `origin`, then compute the merge base with `origin/main`.

2. Review changes introduced by the current worktree branch relative to `origin/main`'s merge base, including:
   - all commits in `<merge-base>..HEAD`
   - all files changed in `<merge-base>..HEAD`
   - any current staged, unstaged, or untracked changes

3. Fix only issues introduced by those worktree changes. Then, commit and push. 