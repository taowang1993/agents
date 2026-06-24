---
name: beads
description: >
  Dolt-powered issue tracker for multi-session work with dependencies and persistent
  memory across conversation compaction. Use when work spans sessions, has blockers,
  or needs context recovery after compaction. Trigger with "write a plan", "create task",
  "what's ready", "track this work", "resume after compaction". Make sure to use this skill
  whenever managing multi-session work, tracking dependencies, or recovering context.
allowed-tools: "Read,Write,Bash(bd:*),Bash(mkdir:*)"
version: "0.60.0"
author: "Steve Yegge <steve.yegge@gmail.com>"
license: "MIT"
compatible-with: [claude-code, codex]
tags: [issue-tracking, task-management, multi-session, dependencies]
---

# Beads - Persistent Task Memory for AI Agents

Graph-based issue tracker that survives conversation compaction. Provides persistent memory for multi-session work with complex dependencies.

## bd vs TodoWrite

**Decision test**: "Will I need this context in 2 weeks?" YES = bd, NO = TodoWrite.

| bd (persistent) | TodoWrite (ephemeral) |
|-----------------|----------------------|
| Multi-session, dependencies, compaction survival | Single-session linear tasks |
| Dolt-backed team sync | Conversation-scoped |

See [BOUNDARIES.md](resources/BOUNDARIES.md) for detailed comparison.

## Prerequisites

```bash
bd --version  # Requires v0.60.0+
```

- **bd CLI** installed and in PATH
- **Git repository** (optional — use `BEADS_DIR` + `--stealth` for git-free operation)
- **Initialization**: `bd init` run once (humans do this, not agents)

## CLI Reference

**Run `bd prime`** for AI-optimized workflow context (auto-loaded by hooks).
**Run `bd <command> --help`** for specific command usage.

Essential commands: `bd ready`, `bd create`, `bd show`, `bd update`, `bd close`, `bd dolt push`

## Session Protocol

1. `bd ready` — Find unblocked work
2. `bd show <id>` — Get full context
3. `bd update <id> --claim` — Claim and start work atomically
4. Add notes as you work (critical for compaction survival)
5. `bd close <id> --reason "..."` — Complete task
6. `bd dolt push` — Push to Dolt remote (if configured)

## Planning Protocol

When the user asks you to "write a plan", create both artifacts:

1. A markdown plan file in the repository's `.beads/plans/` directory. For Tockbot, use `/Users/max/projects/tockbot/.beads/plans/`.
2. A beads epic plus child issues that mirror the plan's vertical-slice work breakdown.

Read [planning.md](references/planning.md) before drafting any non-trivial plan.

Use a stable filename: `YYYY-MM-DD-short-slug.md`. Create `.beads/plans/` if it is missing. Synthesize from the existing conversation and codebase context first; ask only blocking questions. Keep the plan practical: problem, solution, non-goals, implementation/testing decisions, vertical slices, acceptance checks, risks, and the beads epic/issue IDs.

Each child issue should be a tracer-bullet slice: a narrow, demoable path through the necessary layers, not a horizontal "database/API/UI" chunk. Publish blockers before dependents so their IDs can be referenced in dependent issues.

After creating the epic, attach the plan path if the CLI supports it (`--spec-id .beads/plans/<file>.md` in current bd versions), or include the plan path in the epic description/notes.

Skip the plan file only for tiny single-session tasks where an epic would also be overkill; say so explicitly.

## Output

Append `--json` to any command for structured output. Use `bd show <id> --long` for extended metadata. Status icons: `○` open `◐` in_progress `●` blocked `✓` closed `❄` deferred.

## Error Handling

| Error | Fix |
|-------|-----|
| `database not found` | `bd init <prefix>` in project root |
| `not in a git repository` | `git init` first |
| `disk I/O error (522)` | Move `.beads/` off cloud-synced filesystem |
| Status updates lag | Use server mode: `bd dolt start` |

See [TROUBLESHOOTING.md](resources/TROUBLESHOOTING.md) for full details.

## Examples

**Track a multi-session feature:**
```bash
bd create "OAuth integration" -t epic -p 1 --json
bd create "Token storage" -t task --deps blocks:oauth-id --json
bd ready --json                    # Shows unblocked work
bd update <id> --claim --json      # Claim and start
bd close <id> --reason "Implemented with refresh tokens" --json
```

**Recover after compaction:** `bd list --status in_progress --json` then `bd show <id> --long`

**Discover work mid-task:** `bd create "Found bug" -t bug -p 1 --deps discovered-from:<current-id> --json`

## Advanced Features

| Feature | CLI | Resource |
|---------|-----|----------|
| Molecules (templates) | `bd mol --help` | [MOLECULES.md](resources/MOLECULES.md) |
| Chemistry (pour/wisp) | `bd pour`, `bd wisp` | [CHEMISTRY_PATTERNS.md](resources/CHEMISTRY_PATTERNS.md) |
| Agent beads | `bd agent --help` | [AGENTS.md](resources/AGENTS.md) |
| Async gates | `bd gate --help` | [ASYNC_GATES.md](resources/ASYNC_GATES.md) |
| Worktrees | `bd worktree --help` | [WORKTREES.md](resources/WORKTREES.md) |

## Resources

| Category | Files |
|----------|-------|
| **Getting Started** | [BOUNDARIES.md](resources/BOUNDARIES.md), [CLI_REFERENCE.md](resources/CLI_REFERENCE.md) (live reference pointers), [WORKFLOWS.md](resources/WORKFLOWS.md) |
| **Core Concepts** | [DEPENDENCIES.md](resources/DEPENDENCIES.md), [ISSUE_CREATION.md](resources/ISSUE_CREATION.md), [PATTERNS.md](resources/PATTERNS.md) |
| **Resilience** | [RESUMABILITY.md](resources/RESUMABILITY.md), [TROUBLESHOOTING.md](resources/TROUBLESHOOTING.md) |
| **Planning** | [planning.md](references/planning.md) |
| **Advanced** | [MOLECULES.md](resources/MOLECULES.md), [CHEMISTRY_PATTERNS.md](resources/CHEMISTRY_PATTERNS.md), [AGENTS.md](resources/AGENTS.md), [ASYNC_GATES.md](resources/ASYNC_GATES.md), [WORKTREES.md](resources/WORKTREES.md) |
| **Reference** | [STATIC_DATA.md](resources/STATIC_DATA.md), [INTEGRATION_PATTERNS.md](resources/INTEGRATION_PATTERNS.md) |

## Validation

If `bd --version` reports newer than `0.60.0`, this skill may be stale. Run `bd prime` for current CLI guidance — it auto-updates with each bd release and is the canonical source of truth ([ADR-0001](adr/0001-bd-prime-as-source-of-truth.md)).
