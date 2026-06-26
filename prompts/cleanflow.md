---
description: Delete merged branches and Beads cleanup artifacts
---

Execute the steps below manually in the current git repo.

1. Delete merged local and remote branches. Preserve `main` and all worktree directories. Start from `main`; if the working tree is dirty and you cannot switch safely, stop. If a merged branch is checked out in a linked worktree, detach that worktree first; do not remove the worktree.

```bash
git fetch --prune
git switch main
git pull --ff-only

git branch --merged main | sed 's/^[* +]*//' | while read -r branch; do
  [ -z "$branch" ] || [ "$branch" = main ] && continue

  git worktree list --porcelain | awk -v branch="$branch" '
    $1 == "worktree" { path = $2 }
    $1 == "branch" && $2 == "refs/heads/" branch { print path }
  ' | while read -r worktree; do
    git -C "$worktree" switch --detach
  done

  git branch -d "$branch"
done

git branch -r --merged origin/main | sed 's/^[* ]*//' | while read -r ref; do
  case "$ref" in origin/HEAD|origin/main) continue ;; esac
  git push origin --delete "${ref#origin/}"
done
```

2. Empty Beads plan and report artifacts while preserving the directories:

```bash
mkdir -p .beads/plans .beads/report && find .beads/plans .beads/report -mindepth 1 -delete
```

Do not delete other `.beads` files. Finish with `git status --short`.

3. Commit and push.
