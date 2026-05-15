# Exact workflow parity map

Use this file when the user explicitly wants the target repo to replicate the **current reference workflow setup** rather than a lighter conceptual copy.

## 1. Preferred source repo

When available on this machine, use:

- the reference implementation repo provided by the user (e.g., the repo they are already working in if it has a mature workflow)

Read and adapt these source files first.

## 2. Source-to-target mapping

| Source file in the reference implementation | Generic target responsibility |
| --- | --- |
| `AGENTS.md` | short repo map / TOC |
| `.agents/skills/workflow/SKILL.md` | repo-local workflow operating manual |
| `.agents/progress/init.sh` | bootstrap contract + smoke harness |
| `.agents/progress/QUALITY.md` | quality-grade sheet |
| `.agents/progress/progress.log` | append-only session history |
| `.agents/progress/session-ledger.json` | machine-readable progress projection |
| `.agents/progress/scopes/index.json` | scope registry |
| `.agents/progress/scopes/*/features.json` | scope-local feature manifests |
| `.agents/reference/observability.md` | runtime evidence contract |
| `scripts/audit/doc-freshness.mjs` | knowledge-base linter |
| `scripts/audit/workflow-harness.mjs` | workflow artifact linter |
| `scripts/audit/review-coverage.mjs` | review-evidence linter |
| `scripts/audit/critical-authoritative-verification.mjs` | critical rerun lane |
| `scripts/audit/doc-gardening.mjs` | scheduled maintenance audit |
| `scripts/audit/_workflow-scopes.mjs` | scope helpers |
| `scripts/audit/sync-session-ledger.mjs` | ledger sync utility |
| `scripts/audit/sync-feature-scope-mirror.mjs` | default-scope mirror sync utility |
| `.github/workflows/ci.yml` | CI wiring for the workflow jobs |

## 3. What to preserve exactly

Preserve these **behaviors** even when names/commands change:

1. `AGENTS.md` remains short and catalog-driven.
2. feature manifests are scope-aware and mirrored through `features.json`.
3. `progress.log` and `session-ledger` stay in sync.
4. functional/visual passing items need authoritative verification.
5. CI reruns a critical authoritative lane.
6. scheduled doc gardening exists.
7. runtime smoke leaves deterministic artifacts.
8. `.agents/reference/**` is canonical when overlapping with `/docs/**`.

## 4. What to adapt to the target repo

Adapt these carefully:

- package manager commands
- workspace names
- runtime startup commands
- route paths / healthcheck paths
- CI job names
- domain names inside `QUALITY.md`
- product hotspot names inside `QUALITY.md`
- scripting language of the audits if the target repo is not Node-first

Do **not** copy product-specific paths like `/tockcoder` unless the target repo truly has that surface.

## 5. Recommended read order for exact parity

1. `AGENTS.md`
2. `.agents/skills/workflow/SKILL.md`
3. `.agents/progress/init.sh`
4. `.agents/reference/observability.md`
5. `scripts/audit/_workflow-scopes.mjs`
6. `scripts/audit/doc-freshness.mjs`
7. `scripts/audit/workflow-harness.mjs`
8. `scripts/audit/review-coverage.mjs`
9. `scripts/audit/critical-authoritative-verification.mjs`
10. `scripts/audit/doc-gardening.mjs`
11. `.github/workflows/ci.yml`

## 6. Fallback when the source repo is unavailable

If the reference implementation repo is unavailable:

- fall back to `references/workflow-contract.md`
- fall back to `references/adaptation-matrix.md`
- use `assets/templates/**` for starter file shapes
- preserve the behaviors listed above even if your implementation is lighter
