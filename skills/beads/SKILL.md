---
name: beads
description: Use when working in a repository that uses bd or Beads for durable project task tracking, issue dependencies, blocker management, multi-session handoff, or shared work memory. Trigger when the user asks to find ready work, claim or close tasks, create follow-up work, inspect blockers, recover project context, write a plan, create an implementation plan, plan a feature, make a task list, break down work into steps, split into tasks, produce a step-by-step implementation guide, or provides specifications or requirements for a multi-step task.
---

# Beads

Use Beads as the shared project task system. Local plans, scratch files, and personal memories are useful, but they are not the durable source of truth for project work.

## First Step

Run:

```bash
bd prime
```

If that prints nothing, check whether the repository has an active Beads workspace:

```bash
bd where
```

## Preferred Route

Use the `bd` CLI when shell access is available. It is the most compact and direct Beads interface.

## Planning

When asked to write a plan, create an implementation plan, plan a feature, make a task list, break down work into steps, or act on a spec — model the plan as a Beads issue graph, not a markdown checklist.

1. Run `bd prime` for context.

2. Create an EPIC for the overall goal:

```bash
bd create "<goal>" --type epic --priority 0 --description="What this plan covers and why."
```

3. Create child issues for each task:

```bash
# For each task in the plan:
bd create "<task title>" --parent <epic-id> --description="What needs to be done and why." --type task --priority 2
```

4. Wire dependencies to order the work:

```bash
bd dep add <blocked-child> <blocking-child>
# Use bd ready to verify: only unblocked tasks appear
```

5. If a separate design doc is needed, write it as a supplementary markdown file that references Bead IDs. The issue graph is the source of truth for status and ordering; the doc holds design rationale and detail.

## Implementation

1. Find work:

```bash
bd ready
bd list --status=open
bd list --status=in_progress
```

2. Inspect before editing:

```bash
bd show <id>
```

3. Claim work atomically:

```bash
bd update <id> --claim
```

4. Create durable follow-up work when implementation reveals new tasks:

```bash
bd create "Short title" --description="Why this exists and what needs to be done" --type=task --priority=2
```

5. Close completed work:

```bash
bd close <id> --reason="Completed"
```

## What Belongs In Beads

Use Beads for:

- shared project tasks
- blockers and dependencies
- discovered follow-up work
- work that must survive thread reset, compaction, or handoff
- status that another person or agent should be able to resume

Use agent-local planning tools only for the current turn's execution checklist. Do not treat them as shared project state.

## Rules

- Do not create markdown TODO files as the source of truth when Beads is available.
- Do not use `bd edit`; it opens an interactive editor. Use `bd update` flags instead.
- Prefer `--json` when parsing `bd` output programmatically.
- If hooks are installed, `bd prime` may already be injected. Run it manually when context is missing.
- Do not auto-close or mutate tasks unless the work is actually complete.
