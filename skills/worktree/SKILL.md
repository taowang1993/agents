---
name: worktree
description: Use git worktrees for isolated parallel development. Create a separate checkout of any branch inside ~/projects/worktrees/ to work on multiple features simultaneously without cloning or stashing. Use whenever the user wants to work on a different branch in isolation, compare branches, test changes without affecting the main workspace, merge multiple branches back to main, or mentions "worktree", "work tree", "parallel branch", or "side workspace". Also use when the user asks to make changes that should go through PR review before touching main.
---

# Git Worktree Skill

This skill covers the full worktree lifecycle: creation, parallel development across multiple worktrees, and merging everything back to main.

Pi operates in one of two roles. Detect which role you are at startup before taking any action.

## Role Detection

**Run this first** to determine your role:

```bash
git worktree list | grep "$(pwd)"
```

### Master Pi

You are the Master if `git worktree list` shows your CWD as the **main working tree** (the line without `(detached HEAD)` and with a named branch, typically `[main]`).

As Master, you:
- Create and manage worktrees
- Assign branches and tasks to worktrees
- Merge completed work back to main
- Clean up worktrees
- Never do feature work yourself (delegate to worktree Pis)

### Worktree Pi

You are a Worktree Pi if your CWD is under `~/projects/worktrees/` OR if `git worktree list` shows your directory as a secondary worktree.

As a Worktree Pi, you:
- Focus only on your assigned branch
- Commit and push to THAT branch ONLY
- **Never merge to main, never push to main, never touch main**
- Signal completion clearly to the user so they can return to the Master Pi

## Conventions

- **All worktrees** live under `~/projects/worktrees/<name>`
- **Naming**: `<repo>-<task-slug>`. Extract the repo name from `basename $(pwd)` (e.g., `harness`), then append a short hyphenated slug derived from the task (e.g., `fix-readme`, `add-ci`, `update-deps`). Examples: `harness-fix-readme`, `harness-add-ci`, `harness-update-deps`. Never use bare slugs without the repo prefix.
- **Branch names** use the task slug only (no repo prefix): `fix-readme`, `add-ci`, `update-deps`.
- **Remote** is `taowang1993` — the user's only remote. Never add or use `origin`.
- **`gh` CLI** is authenticated as `taowang1993` — use it for PR creation and merging.
- **VS Code** is configured: the `~/projects/worktrees/` folder is in the sidebar. New worktrees appear automatically.

---

## Three-Phase Lifecycle

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: START (Master Pi)                          │
│ Create N worktrees, assign branches, give the plan  │
├─────────────────────────────────────────────────────┤
│ PHASE 2: CODE (Worktree Pis, one per worktree)      │
│ Each Pi: code → commit → push to its branch → done  │
├─────────────────────────────────────────────────────┤
│ PHASE 3: END (Master Pi)                            │
│ Fetch all branches → merge sequentially → push main │
│ → clean up worktrees → loop closed                  │
└─────────────────────────────────────────────────────┘
```

---

## PHASE 1 — Master Pi: Create Worktrees

When the user asks to create worktrees for multiple tasks:

### Step 1: Derive names from the user's list

The user will provide a list of things to work on (e.g., "fix README typos, add CI step, update deps"). For each item:

1. **Extract the repo name**: `REPO=$(basename $(pwd))` (e.g., `harness`, `tockbot`)
2. **Create a task slug**: Lowercase, hyphenated, 2–4 words max. Strip verbs like "fix", "add", "update" from the slug when they're implied by context — prefer nouns. Good: `readme-typos`, `ci-step`, `npm-deps`. Bad: `fix-all-the-readme-typos-urgent`.
3. **Worktree name** = `<repo>-<slug>` (e.g., `harness-readme-typos`)
4. **Branch name** = `<slug>` only (e.g., `readme-typos`)

Present the plan before creating anything:

```
I'll create 3 worktrees from your list:

1. harness-readme-typos  → branch readme-typos  → Fix all README typos
2. harness-ci-step       → branch ci-step       → Add CI validation step
3. harness-npm-deps      → branch npm-deps      → Update npm dependencies
```

Wait for the user to confirm, then create them all.

### Step 2: Create them all

```bash
git worktree add ~/projects/worktrees/<name> main
cd ~/projects/worktrees/<name>
git checkout -b <branch-name>
```

If `main` is already checked out (it will be), use `--detach`:

```bash
git worktree add --detach ~/projects/worktrees/<name> main
cd ~/projects/worktrees/<name> && git checkout -b <branch-name>
```

### Step 3: Tell the user

Summarize what was created and where. The user will then open each worktree in a VS Code terminal and launch a Pi session inside it.

---

## PHASE 2 — Worktree Pi: Code

When you detect you're in a worktree:

### Startup check

Run this to confirm your role and branch:

```bash
echo "Worktree: $(pwd)"
git branch --show-current
git worktree list | grep "$(pwd)"
```

If the current branch is `main`, **stop and tell the user**. You should never work directly on `main` in a worktree — ask them to create a feature branch first.

### What you do

- Make changes, commit them, push to YOUR branch
- Use descriptive commit messages referencing the task

```bash
git add -A
git commit -m "feat: <description>"
git push taowang1993 <your-branch>
```

### What you NEVER do

- **Never** checkout `main`
- **Never** merge any branch into `main`
- **Never** push to `main`
- **Never** run `git worktree remove` or `git worktree prune`
- **Never** add or remove remotes

### Signaling completion

When your task is done, tell the user clearly:

> ✅ **Done.** Branch `fix-typos` pushed to `taowang1993`. Return to the Master Pi to merge.

The user switches back to the Master Pi session and says "merge everything."

---

## PHASE 3 — Master Pi: Merge and Clean Up

When the user says to merge, merge branches **one at a time, sequentially**. This lets you catch conflicts early and pinpoint failures.

### Step 1: Fetch all branches

```bash
git fetch taowang1993
```

### Step 2: Merge each branch into main, one by one

```bash
git checkout main
git merge taowang1993/<branch-1>
# Resolve conflicts if any → git add . → git commit
git merge taowang1993/<branch-2>
# Resolve conflicts if any → git add . → git commit
git merge taowang1993/<branch-3>
# ...
```

If a merge conflict occurs, resolve it immediately before moving to the next branch. Do not batch-conflict and try to resolve later.

### Step 3: Push the final main

```bash
git push taowang1993 main
```

### Step 4: Clean up worktrees

```bash
git worktree remove ~/projects/worktrees/<name>
# Repeat for each worktree
git worktree prune
```

### Step 5: Delete remote branches (optional)

```bash
git push taowang1993 --delete <branch-1> <branch-2> <branch-3>
```

### Step 6: Report

Tell the user the loop is closed:

> ✅ All 3 branches merged to main, pushed, worktrees removed, remote branches deleted.

---

## Single Worktree PR Workflow

If the user wants a single worktree merged via PR (for CI checks and audit trail):

```bash
# In the worktree:
git checkout -b <branch-name>
git add -A && git commit -m "<message>"
git push taowang1993 <branch-name>
gh pr create --title "<title>" --body "<description>" --base main
gh pr merge --squash --delete-branch

# In the main repo:
git pull taowang1993 main
git worktree remove ~/projects/worktrees/<name>
git worktree prune
```

---

## Quick Reference

### Master Pi commands

```bash
# Create worktrees
git worktree add --detach ~/projects/worktrees/<name> main
cd ~/projects/worktrees/<name> && git checkout -b <branch>

# List all
git worktree list

# Merge sequentially
git fetch taowang1993
git merge taowang1993/<branch>

# Cleanup
git worktree remove ~/projects/worktrees/<name>
git worktree prune
```

### Worktree Pi commands

```bash
# Confirm you're a worktree
git worktree list | grep "$(pwd)"

# Work and push
git add -A
git commit -m "feat: <description>"
git push taowang1993 <your-branch>
```

---

## Important Reminders

- **Same branch twice**: Git won't let two worktrees check out the same branch. Use `--detach` and create a new branch.
- **Port conflicts**: Multiple dev servers need per-worktree `.env` files with different ports.
- **VS Code sidebar**: The `~/projects/worktrees/` parent folder is already added. New worktrees appear automatically. Do not run `code --add`.
- **Remote name**: Always push to `taowang1993`, never add or use `origin`.
- **Stale entries**: If a worktree folder is deleted manually, run `git worktree prune` to clean the reference.
- **Worktree Pi context**: A Pi session launched inside a worktree loads that directory's `AGENTS.md` and `.pi/` config. This is the same as the main repo (same files), so the Worktree Pi has full project context — it just needs this skill to know it's a worker, not the master.
