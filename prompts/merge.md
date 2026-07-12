---
description: Merge green PRs, update main, and sync clean worktrees to main
---

1. Merge each ready PR with a merge commit only: open, not draft, required reviews satisfied, checks green, and mergeable. Never squash. After each merge, re-check the remaining PRs. If `main` creates conflicts, merge `main` into that PR branch, resolve only confident conflicts, run the smallest relevant checks, push, and re-check readiness.

2. Update local `main` only from a clean tree: switch to `main`, then `git pull --ff-only`. Otherwise stop and report.

3. Sync existing linked worktrees to `origin/main`; never create, remove, or prune them.
   - Skip and report dirty, detached, or unidentified-branch worktrees.
   - For each clean branch, try `git merge --ff-only origin/main`; if that fails, use `git merge --no-commit origin/main`.
   - Resolve only confident conflicts, run the smallest relevant checks, then commit the merge.
   - Push only branches with an upstream; leave no-upstream branches locally synced and report them.
   - If conflicts or checks block progress, abort when safe and report the worktree.
