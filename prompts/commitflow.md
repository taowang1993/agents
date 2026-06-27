---
description: Commit and push dirty git changes
argument-hint: "[files/globs/instructions]"
---

When the user says "Commit all changes", they mean **ALL CHANGES** in scope: modified, deleted, renamed, and untracked files, including changes that existed before this turn. Do not exclude files as "pre-existing", "unrelated", or "user changes".

## Scope

1. Identify the target git repo. If the user names a path, use that repo. Otherwise use the current working repo.
2. Interpret `$ARGUMENTS`:
   - File paths or globs limit the commit to those paths.
   - Freeform text guides the commit scope, subject, and body.
   - If the text says "all changes", "everything", or equivalent, include every dirty path in the target repo.
3. Inspect `git status --short --branch` and `git diff --stat` for the selected scope.
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

1. Stage the selected scope with `git add -A` plus pathspecs when paths/globs were provided; for "all changes", use plain `git add -A`.
2. Commit with `git commit -m "<subject>"` and optional extra `-m "<body>"`.
3. If there is nothing to commit, say so and continue to push only if local commits are ahead.
4. Push the current branch. If it has no upstream, set upstream to `origin/<branch>` unless the user said otherwise.
5. Verify with `git status --short --branch`. The repo must be clean and up to date with its upstream before reporting success.
6. Report the commit hash, push target, and final clean status.
