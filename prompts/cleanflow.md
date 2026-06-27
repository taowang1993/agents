---
description: Delete merged branches and Beads cleanup artifacts
---

1. Delete merged local and remote branches. Preserve `main` and all worktrees. 

- If the working tree is dirty and you cannot switch safely, stop and report the situation.

- If a merged branch is checked out in a linked worktree, detach that worktree first.

2. Empty Beads plan and report artifacts while preserving the directories:

3. Commit and push all changes. 
