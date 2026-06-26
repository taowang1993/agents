---
description: Validate the branch, open a PR, and fix conflicts
---
Use this prompt as a workflow shortcut, not a shell command. Do not look for, install, or run a `prflow` binary. Execute the steps below manually for the current repo.

1. Confirm the current branch is not a protected branch like `main`.

2. Inspect status and include all intended commits for this branch. Do not discard user changes.

3. Run PR validation using the repo's documented commands. Fix failures with the smallest safe diff and commit fixes.

4. Push the branch and open or update one PR for all branch commits.

5. If the PR has conflicts, resolve them without rewriting shared history unless explicitly requested, rerun validation, commit, and push.

6. Close beads epics and issues that are related to the PR. 

7. Report the PR URL, validation results, and any blockers.
