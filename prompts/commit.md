---
description: Commit and push all dirty git changes.
---

Commit **ALL CHANGES** in the current git repo and push the current branch.

ALL CHANGES means every dirty path in the repo: modified, deleted, renamed, and untracked files, including changes that existed before this prompt. Do not exclude files as "pre-existing", "unrelated", or "user changes".

## Scope

1. Use the current working git repo.
2. Inspect `git status --short --branch` and `git diff --stat`.
3. Treat every dirty path as intentionally in scope.
4. If committing would obviously leak secrets, include huge generated/dependency artifacts, or cross into another nested git repo, stop and report the exact blocker. Otherwise continue.

## Commit Format

Use a concise Conventional Commits-style subject:

`<type>(<scope>): <summary>`

- `type` is required: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, or `perf`.
- `scope` is optional: a short noun for the affected area.
- `summary` is required: imperative, <= 72 chars, no trailing period.
- Body is optional. If useful, add a blank line after the subject and short paragraphs.
- Do not add breaking-change footers or `Signed-off-by`.
- Optionally run `git log -n 50 --pretty=format:%s` to reuse common scopes.

## Steps

1. Stage everything with `git add -A`.
2. Commit with `git commit -m "<subject>"` and optional extra `-m "<body>"`.
3. If there is nothing to commit, say so and continue to push only if local commits are ahead.
4. Push the current branch. If it has no upstream, set upstream to `origin/<branch>`.
5. Verify with `git status --short --branch`. The repo must be clean and up to date with its upstream before reporting success.
6. Report the commit hash, push target, and final clean status.
