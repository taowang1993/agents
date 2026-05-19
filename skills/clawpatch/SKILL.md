---
name: clawpatch
description: Automated code review that maps a repo into semantic feature slices, reviews each slice with an AI provider, persists findings, and can run an explicit fix loop for one finding at a time. Use this skill whenever the user wants to review code, audit a codebase for bugs or security issues, find test gaps, clean up AI-generated slop, run automated code fixes, or mentions clawpatch, code review, automated review, deslopify, or finding/fix loops.
---

# clawpatch

Automated code review that lands fixes. Maps a repo into semantic feature slices, reviews each slice with an AI provider, persists findings, and runs an explicit fix loop for one finding at a time.

Never commits, pushes, opens PRs, or lands changes automatically. All state is project-local JSON under `.clawpatch/`.

## When to use clawpatch

Use clawpatch when the user asks for:

- A code review sweep across the repo ("review my codebase", "audit for bugs")
- Finding test gaps or missing coverage
- Cleaning up AI-generated slop (`--mode deslopify`)
- Running an automated fix for a specific finding
- Checking whether previous findings are still valid (revalidate)
- A structured report of code quality issues

Do **not** use clawpatch for quick, single-file linting or formatting — use the project's existing lint/format commands for that.

## Core workflow

```bash
clawpatch init        # Detect project, write config
clawpatch map          # Build semantic feature slices
clawpatch review       # Review features with AI provider
clawpatch report       # Print or write findings report
clawpatch fix          # Apply repairs for one finding
clawpatch revalidate   # Verify findings or patch attempts
```

Always run these in order the first time on a repo. After initialization, `map` and `review` are the most common commands.

### Quick audit flow

```bash
clawpatch init
clawpatch map
clawpatch review --limit 3 --jobs 3
clawpatch report
```

### Deslopify (AI slop cleanup)

```bash
clawpatch review --mode deslopify --limit 5
```

This mode finds only locally provable slop patterns: semantic duplication, useless wrappers, dead legacy paths, cargo-cult defensive code, tautological tests, and type/build silencing hacks. It skips general bug/security review.

## Commands reference

### `clawpatch init`

Creates `.clawpatch/` with `config.json` and `project.json`. Detects languages, frameworks, package manager, and build/test/lint/format commands. Idempotent unless `--force`.

### `clawpatch map`

Runs 17 deterministic mappers to build feature records. Each feature is a semantic slice (CLI command, route, service, UI flow, library, etc.) with owned files, context files, tests, and trust boundaries.

Key mappers: Node/TypeScript workspaces, Turborepo tasks, Next.js routes, React components, Express/Fastify/Hono routes, Go packages, Python (Flask/FastAPI/Django), Ruby/Rails, Elixir/Phoenix, Rust/Cargo, C/C++, SwiftPM, Java/Kotlin/Gradle, C#/.NET, Laravel/PHP.

Flags:

- `--source heuristic|auto|agent` — use agent mapper when deterministic mapping is too shallow
- `--dry-run` — preview without writing
- `--force` — rebuild all features

### `clawpatch review`

Reviews pending feature slices with the configured AI provider. Runs features in parallel (up to 32 jobs). Each feature gets its owned files + context files sent to the provider with a strict JSON schema.

Flags:

- `--feature <id>` — review one specific feature
- `--limit <n>` — cap number of features reviewed
- `--jobs <n>` — parallel review jobs (default 10, max 32)
- `--mode deslopify` — review only for AI-slop cleanup patterns
- `--since <ref>` — review only features touched since git ref
- `--provider <name>` — override provider (codex, pi, opencode, grok, acpx)
- `--model <name>` — override model
- `--reasoning-effort <level>` — none, minimal, low, medium, high, xhigh
- `--prompt-file <path>` — append custom reviewer guidance
- `--dry-run` — preview without running
- `--export-tribunal-ledger <path>` — emit findings as JSONL

### `clawpatch report`

Generates a markdown or JSON report of findings, grouped by severity, category, and feature.

Flags:

- `--severity <level>` — filter by severity
- `--status <status>` — filter by status (open, fixed, false-positive, etc.)
- `-o <path>` — write to file
- `--json` — JSON output

### `clawpatch show`

Inspect one finding with full evidence, reasoning, recommendation, and suggested validation commands.

```bash
clawpatch show --finding <id>
```

### `clawpatch next`

Print the next actionable (open) finding, ordered by severity then confidence.

```bash
clawpatch next
clawpatch next --status open
```

### `clawpatch triage`

Mark a finding's status with an optional note.

```bash
clawpatch triage --finding <id> --status false-positive --note "covered by tests"
```

Valid statuses: `open`, `false-positive`, `fixed`, `wont-fix`, `uncertain`.

### `clawpatch fix`

Run the explicit patch loop for one finding. The provider edits files in the worktree, then clawpatch runs configured validation commands (format, lint, typecheck, test).

**Safety rules:**

- Refuses dirty worktree by default (set `requireCleanWorktreeForFix: false` in config to override)
- Never commits, pushes, or switches branches
- Only edits files within the feature's owned/context scope
- Records all changed files and command results in `.clawpatch/patches/`

```bash
clawpatch fix --finding <id>
clawpatch fix --finding <id> --dry-run   # plan only, no edits
```

### `clawpatch revalidate`

Re-check findings against current code. Confirms whether evidence still exists and updates status to fixed, open, false-positive, or uncertain.

```bash
clawpatch revalidate --finding <id>
clawpatch revalidate --all --status open
clawpatch revalidate --all --since main
```

### `clawpatch doctor`

Check environment: Node version, provider availability, config validity. Never prints secrets.

### `clawpatch clean-locks`

Clear stale feature locks from crashed or interrupted runs.

## Providers

clawpatch supports multiple AI providers. The default is `codex`.

| Provider   | CLI Tool              | Notes                                                                                                  |
| ---------- | --------------------- | ------------------------------------------------------------------------------------------------------ |
| `codex`    | Codex CLI             | Default. Uses `codex exec` with strict JSON schemas.                                                   |
| `pi`       | Pi coding agent       | Uses `pi -p --no-session --no-skills --no-extensions`. Read-only for review/revalidate, write for fix. |
| `opencode` | OpenCode CLI          | Uses `opencode run --format json`.                                                                     |
| `grok`     | Grok Build CLI        | Uses `grok --output-format json`.                                                                      |
| `acpx`     | ACP-compatible agents | Routes through any ACP agent (Codex, Claude, Pi, Gemini).                                              |

### Using the pi provider

```bash
clawpatch review --provider pi --limit 3
```

The pi provider runs in non-interactive print mode with `--no-session --no-context-files --no-skills --no-extensions`. Review and revalidate use `--tools read` for safety. Fix mode allows writes.

Environment variables for pi:

- `CLAWPATCH_PI_TIMEOUT_MS` — timeout in ms (default 180000)
- `CLAWPATCH_PROVIDER_TIMEOUT_MS` — fallback timeout for all providers

### Provider selection precedence

1. `--provider` CLI flag
2. `CLAWPATCH_PROVIDER` env var
3. `.clawpatch/config.json` `provider.name`
4. Default: `codex`

## State layout

All state lives in `.clawpatch/` at the repo root:

```
.clawpatch/
  config.json          # Provider, commands, review settings
  project.json         # Detected languages, frameworks, git info
  features/*.json      # Semantic feature slices
  findings/*.json      # Review findings
  patches/*.json       # Fix patch attempts
  runs/*.json          # Run records
  reports/*.md         # Generated markdown reports
  locks/               # Feature claim locks
```

Add to `.gitignore`:

```gitignore
.clawpatch/runs/
.clawpatch/findings/
.clawpatch/patches/
.clawpatch/reports/
.clawpatch/locks/
```

## Finding categories and severities

Categories:

- `bug` — correctness bugs
- `security` — security issues
- `performance` — performance problems
- `concurrency` — race conditions, deadlocks
- `api-contract` — API contract mismatches
- `data-loss` — data loss or corruption
- `test-gap` — missing or weak tests
- `docs-gap` — missing documentation
- `build-release` — build or release hazards
- `maintainability` — maintainability risks with concrete impact

Severities: `critical`, `high`, `medium`, `low`

Confidence: `high`, `medium`, `low`

## Configuration

Config file at `.clawpatch/config.json`:

```json
{
  "schemaVersion": 1,
  "stateDir": ".clawpatch",
  "include": ["**/*"],
  "exclude": ["node_modules/**", "dist/**", "build/**", ".git/**", ".clawpatch/**"],
  "provider": {
    "name": "pi",
    "model": null,
    "reasoningEffort": null
  },
  "commands": {
    "typecheck": "pnpm run typecheck",
    "lint": "pnpm run lint",
    "format": "pnpm run format",
    "test": "pnpm run test"
  },
  "review": {
    "maxContextFiles": 24,
    "maxOwnedFiles": 12,
    "maxFindingsPerFeature": 10,
    "minConfidenceToFix": "medium"
  },
  "git": {
    "requireCleanWorktreeForFix": true,
    "commit": false,
    "openPr": false
  }
}
```

## Integration with monorepos

clawpatch understands:

- **Turborepo** — reads `turbo.json` task pipelines for validation commands and feature context
- **pnpm workspaces** — discovers packages from `pnpm-workspace.yaml`
- **Nx** — reads `project.json` for project-scoped validation targets

For a Turborepo + pnpm project like tockbot, `clawpatch init` automatically detects `pnpm run typecheck`, `pnpm run lint`, and `pnpm run test` as validation commands. Each package under `apps/*` and `packages/*` becomes its own feature slice.

## Exit codes

| Code | Meaning                           |
| ---- | --------------------------------- |
| 0    | Success                           |
| 1    | Runtime failure                   |
| 2    | Invalid usage or config           |
| 3    | Dirty worktree blocks operation   |
| 4    | Provider auth/config failure      |
| 5    | Provider quota/rate-limit failure |
| 6    | Tests/validation failed           |
| 7    | Lock conflict                     |
| 8    | Malformed provider output         |

## Tips

- Run `clawpatch doctor` first to verify the environment before any review or fix work.
- Start reviews small (`--limit 3`) to validate provider and prompt quality before scaling up.
- Use `--dry-run` on `fix` to see the plan before applying changes.
- After a fix, always run `clawpatch revalidate --finding <id>` to confirm the issue is resolved.
- When the provider produces malformed JSON (exit code 8), try again — transient parsing failures happen.
- For large repos, use `--since <ref>` to focus reviews on recently changed code.
- The `deslopify` mode is useful after heavy AI-assisted development to find duplicated or over-engineered patterns.
