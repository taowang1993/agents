# Autoflow workflow contract

Use this file when installing the scaffold. It defines the **minimum complete harness** that counts as “long-running workflow parity.”

## 1. Required directory tree

Minimum expected tree:

```text
<repo>/
├── AGENTS.md
├── .agents/
│   ├── skills/
│   │   └── workflow/
│   │       └── SKILL.md
│   ├── progress/
│   │   ├── features.json
│   │   ├── init.sh
│   │   ├── progress.log
│   │   ├── session-ledger.json
│   │   ├── progress.json
│   │   ├── plan.md
│   │   ├── report.md
│   │   ├── QUALITY.md
│   │   ├── scopes/
│   │   │   ├── index.json
│   │   │   └── <scope-id>/features.json
│   │   └── verification/
│   ├── plans/
│   │   ├── active/
│   │   └── completed/
│   └── reference/
│       ├── architecture.md
│       ├── observability.md
│       ├── review.md
│       └── test.md
├── scripts/
│   └── audit/
│       ├── _workflow-scopes.*
│       ├── doc-freshness.*
│       ├── workflow-harness.*
│       ├── review-coverage.*
│       ├── critical-authoritative-verification.*
│       ├── doc-gardening.*
│       ├── sync-session-ledger.*
│       └── sync-feature-scope-mirror.*
└── .github/workflows/ci.yml
```

Adjust file extension / task-runner integration to the target repo’s scripting language, but preserve the responsibilities.

## 2. Artifact purposes

### `AGENTS.md`
Short table of contents.

It should map:

- project structure
- progress artifacts
- plans
- reference docs
- key conventions
- high-level commands

It should not become a 1000-line manual.

### `.agents/skills/workflow/SKILL.md`
Repo-local workflow operating manual for fresh sessions.

It should define:

- initializer mode
- coding mode orientation
- one-item incremental loop
- verification expectations
- review lane expectations
- artifact update rules

### `.agents/progress/features.json`
Compatibility mirror for the **default** scope manifest.

### `.agents/progress/scopes/index.json`
Machine-readable scope index.

Required fields:

- schema version
- `default_scope_id`
- list of scopes with:
  - `task_id`
  - `scope_id`
  - `status`
  - `manifest`

### `.agents/progress/scopes/<scope_id>/features.json`
Canonical manifest for a specific scope.

Required top-level fields:

- `_DO_NOT_REMOVE_OR_EDIT_ITEMS`
- `_SCHEMA_VERSION`
- `task_id`
- `scope_id`
- `task`
- `created`
- `last_updated`
- `session_count`
- `verification_policy`
- `items`

Required per-item fields:

- `id`
- `priority`
- `category`
- `description`
- `estimated_sessions`
- `slice_plan`
- `steps`
- `passes`
- `verified_by`
- `verification`
- `notes`

### `.agents/progress/progress.log`
Append-only session history.

Every session should record:

- session number / mode / timestamp
- task id
- scope id
- item
- result
- orientation
- verification
- base HEAD / recovery anchor
- git commit status
- remaining failing count

### `.agents/progress/session-ledger.json`
Machine-readable projection of `progress.log`.

### `.agents/progress/init.sh`
Bootstrap contract.

Must:

- expose a machine-readable contract
- create deterministic artifact paths
- support a smoke mode
- verify the canonical local runtime path
- exit non-zero on failure

### `.agents/progress/QUALITY.md`
Quality-grade sheet.

Must include:

- repository domains
- hotspot / product domains when applicable
- change log
- evidence column
- update rule

### `.agents/plans/**`
Versioned execution plans.

- `active/` for in-flight multi-session work
- `completed/` for archived plans with outcome + review evidence

### `.agents/reference/**`
Canonical agent-facing docs.

Minimum set:

- `architecture.md`
- `observability.md`
- `review.md`
- `test.md`

## 3. Required audit responsibilities

### Doc freshness
Must validate:

- `AGENTS.md` catalog integrity
- markdown links / headings / anchors
- metadata / canonical ownership on docs when the repo uses it
- stale `.context`-style references
- feature-scope mirror integrity when scope manifests are present
- tracked progress-artifact freshness

### Workflow harness
Must validate:

- feature manifest schema / ordering / verification rules
- progress log shape
- session-ledger parity
- scope counts and remaining counts
- plan shape / review evidence
- bootstrap contract shape
- progress mirror summaries

### Review coverage
Must validate:

- session-level review evidence
- completed-plan review evidence

### Critical authoritative verification
Must rerun a critical test lane derived from passing `functional` / `visual` items.

### Doc gardening
Must surface:

- degraded quality domains
- still-failing high-priority items
- other low-cost maintenance findings
- safe autofixes where possible

## 4. Required CI responsibilities

At minimum CI should:

- run workflow/doc audits on push + PR
- rerun the critical authoritative-verification lane
- run bootstrap/runtime smoke when the repo has a real runtime
- schedule doc gardening / maintenance
- preserve reports/artifacts where useful

## 5. Required invariants

These are the non-negotiables:

1. `AGENTS.md` stays short and navigational.
2. `.agents/reference/**` is canonical for agent-facing truth.
3. Scope manifests can coexist.
4. `features.json` mirrors the default scope exactly.
5. `progress.log` remains append-only.
6. `session-ledger.json` is derived and kept in sync.
7. Passing `functional` / `visual` items require authoritative verification.
8. Completed plans retain outcome + review evidence.
9. `init.sh` (or equivalent) is a real contract, not just a loose command note.
10. CI reruns at least one authoritative closure lane.
11. Scheduled maintenance exists.

If any of these are missing, the scaffold is incomplete.
