## Progress (`.agents/progress/`)

| File | Description | Created by |
| --- | --- | --- |
| `features.json` | Default-scope compatibility mirror for the current feature manifest | Initializer |
| `scopes/index.json` | Multi-scope feature-manifest index with default-scope selection | Initializer |
| `init.sh` | Bootstrap — cleanup, start dev/test environment, and verify the canonical runtime path | Initializer |
| `progress.log` | Append-only multi-scope session log with task/scope ids | Coding agent |
| `session-ledger.json` | Machine-readable ledger derived from `progress.log` | Coding agent |
| `progress.json` | Canonical gap inventory | Either mode |
| `QUALITY.md` | Repo-wide quality grades for cleanup prioritization | Maintenance |
| `plan.md` | Working summary derived from execution plans | Either mode |
| `report.md` | Gap analysis report | Either mode |

## Plans (`.agents/plans/`)

| Directory | Purpose |
| --- | --- |
| `active/` | Execution plans for current tasks |
| `completed/` | Completed plans with decision logs |

## Reference (`.agents/reference/`)

| Doc | Description |
| --- | --- |
| `architecture.md` | System map and trust boundaries |
| `observability.md` | Launch contracts, runtime evidence, and audit outputs |
| `review.md` | Review playbook for implementation and adversarial review lanes |
| `test.md` | Test suite contract and verification standards |

## Key conventions

- **Agent legibility:** prefer repo-local, versioned artifacts over external references.
- **Knowledge split:** `.agents/reference/**` is canonical for agent-facing docs; `/docs/**` should hold longer human/mixed SOPs and point back instead of forking.
- **Execution plans are first-class:** multi-session or architecture-relevant work belongs in `.agents/plans/**`.
- **Workflow skill first:** read `.agents/skills/workflow/SKILL.md` before autonomous loops, branch creation, or PR work.
