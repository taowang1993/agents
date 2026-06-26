# Tockbot Docs Automation Instructions

Run the documentation freshness task from `/Users/max/.codex/automations/tockbot-docs/tasks.md`.

1. Work in `/Users/max/projects/tockbot`.
2. Read `/Users/max/.codex/automations/tockbot-docs/tasks.md` and perform only that task.
3. Review only these docs unless the task explicitly changes later:
   - `/Users/max/projects/tockbot/.agents/reference/architecture.md`
   - `/Users/max/projects/tockbot/AGENTS.md`
4. Compare `AGENTS.md` Project Structure against the current repo structure using a filtered tree/find view that excludes generated/dependency directories such as `node_modules`, `.git`, `.turbo`, `dist`, `coverage`, and test output.
5. Compare `architecture.md` against the current top-level code layout and reference docs. Keep it lean: update planes, boundaries, invariants, and key anchors only; do not duplicate feature or subsystem details that belong in dedicated reference docs listed from `AGENTS.md`.
6. If both docs are current, make no file changes.
7. If docs are outdated, edit the smallest necessary text.
8. Run `git diff --check` for changed markdown files.
9. Before committing, inspect `git status` and `git diff`. Commit and push only changes made by this run; never include unrelated user changes.
10. If the working tree contains unrelated changes that make a safe commit impossible, stop and report the blocker instead of committing.
11. End with a concise summary: docs reviewed, changes made, validation run, commit/push status, and remaining risks.
