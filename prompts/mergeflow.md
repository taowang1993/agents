---
description: Merge green PRs, update main, resolve conflicts, and sync clean worktrees to main
---

Execute the steps below manually for the current repo.

1. Find open PRs that are ready: not draft, checks green, mergeable, and approved when review is required.

2. Merge ready PRs with merge commits only. Never squash merge. After each merge, re-check remaining PRs. If a previously ready PR becomes conflicted because `main` moved, update that PR branch, resolve the merge conflicts, run the smallest relevant checks, push the fix, wait for checks to pass, then merge it with a merge commit.

3. Pull `main` with `git pull --ff-only`.

4. For each existing worktree whose working tree is clean, sync its checked-out branch to `origin/main`:
   - Try `git merge --ff-only origin/main` first.
   - If it cannot fast-forward, run `git merge origin/main`, resolve conflicts, run the smallest relevant checks, commit the merge, and push.

5. Stop and report anything blocked by failing checks, dirty worktrees, conflicts you cannot resolve confidently, or missing permission.
