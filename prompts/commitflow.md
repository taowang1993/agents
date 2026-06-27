---
description: Commit and push every dirty change in the selected repo
---

When the user says "Commit all changes", they mean **ALL CHANGES** in scope: modified, deleted, renamed, and untracked files, including changes that existed before this turn.

1. Identify the target git repo. If the user names a path, use that repo. Otherwise use the current working repo.

2. Inspect `git status --short --branch` and `git diff --stat`. Treat every dirty path as intentionally in scope. Do **not** exclude files as "pre-existing", "unrelated", or "user changes"; the command is explicit permission to commit them.

3. If committing would obviously leak secrets, include huge generated/dependency artifacts, or cross into another nested git repo, stop and report the exact blocker. Otherwise continue.

4. Stage everything in scope with `git add -A`, including deletions and untracked files.

5. Commit with a concise message that describes the aggregate change. If there is nothing to commit, say so and continue to push only if local commits are ahead.

6. Push the current branch. If the branch has no upstream, set the upstream to `origin/<branch>` unless the user said otherwise.

7. Verify with `git status --short --branch`. The repo must be clean and up to date with its upstream before reporting success.

8. Report the commit hash, push target, and final clean status.
