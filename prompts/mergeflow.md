---
description: Merge green PRs, update main, and sync clean worktrees to main
---

1. Find open PRs that are ready: not draft, checks green, mergeable, and approved when review is required.

2. Merge ready PRs with merge commits only. Never squash merge. After each merge, re-check remaining PRs. If a previously ready PR becomes conflicted because `main` moved, update that PR branch, resolve the merge conflicts, run the smallest relevant checks on `HEAD`, push the fix, then re-check the full readiness criteria before merging.

3. Switch to `main` only if the current working tree is clean; otherwise stop and report. Pull `main` with `git pull --ff-only`.

4. Sync every existing linked worktree to `origin/main`. Preserve all worktree directories; do not create, remove, or prune worktrees.
   - Skip and report dirty worktrees, detached worktrees, and worktrees whose branch cannot be identified.
   - For each clean worktree branch, try `git merge --ff-only origin/main` first.
   - If it cannot fast-forward, run `git merge origin/main`. Resolve conflicts only when you can do so confidently, run the smallest relevant checks on `HEAD`, then commit the merge.
   - Push only branches that already have an upstream. For branches without an upstream, leave the local sync committed and report it.
   - If conflicts cannot be resolved confidently, abort the merge and report the blocked worktree.

5. Stop and report anything blocked by failing checks, dirty worktrees, unresolved conflicts, missing upstreams, or missing permission.
