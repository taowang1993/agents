---
description: Validate the branch, open a PR, and fix conflicts
---

1. Validate the current branch against `origin/main`. Fix failures introduced by this branch, commit fixes, push, and rerun validation.

2. Open a PR for the current branch's changes relative to `origin/main`, and link related Beads issues.

3. If the PR has merge conflicts, merge `origin/main` into the branch, resolve only confident conflicts, rerun validation, commit, and push.

4. Close only related Beads issues whose work is complete.