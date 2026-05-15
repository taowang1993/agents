# Autoflow adaptation matrix

Use this file after surveying the target repo.

## 1. Runtime profile matrix

| Repo/runtime shape | Bootstrap contract should prove | Smoke artifacts should contain | Notes |
| --- | --- | --- | --- |
| Electron / desktop app | cleanup, startup, attach/debug endpoint if available, canonical route/window render | contract JSON, logs, smoke transcript, route probe, screenshot, launch history | Prefer CDP/Electron attach when the repo already supports it. |
| Browser web app | dev server starts, canonical route responds, key UI surface renders | contract JSON, server log, smoke transcript, page probe/screenshot | No fake desktop-only artifacts. |
| Backend / API / worker | canonical dev/test/health path succeeds | contract JSON, health/test transcript, structured summary | The “smoke” may be a health endpoint, worker self-check, or integration test. |
| CLI / library | canonical command or test lane succeeds | contract JSON, stdout/stderr log, verification summary | No browser route assumptions. |
| Mixed system | one contract per primary runtime, or one aggregate contract that names each surface | per-surface artifacts + aggregate summary | Keep paths deterministic. |

## 2. Repo topology matrix

### Single-package repos

- wire commands directly in the native root task config
- place audits under `scripts/audit/`
- keep `.agents/**` at repo root

### Monorepos

- keep `.agents/**` at repo root
- add root-level audit commands
- route runtime-specific smoke commands to the correct workspace/package
- keep `AGENTS.md` focused on top-level structure, not every leaf package detail

### Subproject-in-larger-workspace

If the user wants the scaffold only for a subproject:

- confirm whether `.agents/**` belongs at workspace root or subproject root
- do not accidentally create two competing canonical roots without explicit user approval

## 3. Scripting/runtime choice

### Node-first repo

Prefer:

- `scripts/audit/*.mjs`
- root task scripts in `package.json`
- GitHub Actions / CI commands invoking those scripts directly

### Python-first repo

Prefer:

- `scripts/audit/*.py`
- `pyproject.toml`, `Makefile`, `justfile`, or equivalent task runner
- no forced `package.json` unless the repo already has Node automation

### Polyglot repo

Use the dominant root automation language, not the application language.

Example:

- Rust app with existing Node tooling → Node audits are acceptable
- TS app with Python devops runner → either may be fine, but preserve root consistency

## 4. Existing repo integration rules

### If `AGENTS.md` already exists

- keep the file if it is already a TOC and mostly accurate
- shorten it if it is a giant manual
- move long content into `.agents/reference/**`
- preserve repo-specific conventions that still matter

### If `.agents/**` already exists

- inspect before rewriting
- upgrade in place where possible
- do not delete historical plans or progress artifacts lightly
- if old single-manifest progress exists, migrate carefully to scope-aware manifests

### If `.context/**` exists

Treat it as legacy / migration material unless the user explicitly wants to keep it as canonical.

Preferred migration:

- move canonical agent-facing content into `.agents/reference/**`
- move human-oriented deep dives into `/docs/**`
- replace stale references with tracked repo-local paths

### If CI already exists

- patch the pipeline; do not replace it wholesale
- add workflow jobs alongside existing quality/test/deploy jobs
- preserve branch filters, caches, secrets handling, and platform-specific setup

## 5. Runtime smoke adaptation rules

### Desktop / Electron

Prefer a bootstrap contract with:

- cleanup command
- startup command
- attach/debug metadata if available
- canonical route/window probe
- structured runtime artifacts

If there is no automation attach path yet:

- still write a machine-readable contract
- use the strongest reproducible smoke available
- leave a follow-up item in the initial feature manifest for richer automation parity

### Web apps

Prefer:

- server start command
- canonical route fetch/probe
- screenshot or DOM/text probe when browser automation is available

### Backend / CLI / library

The bootstrap contract should still be explicit.

Good examples:

- `pytest -m smoke`
- `cargo test smoke_bootstrap`
- `uv run python -m service.healthcheck`
- `bin/mycli --version` plus a real self-check command

Avoid pretending a `typecheck` is a full runtime smoke unless the repo truly has no runtime surface beyond build validation.

## 6. CI system adaptation

### GitHub Actions

Mirror the reference implementation closely:

- push / PR jobs
- scheduled maintenance job
- artifact uploads for reports/runtime evidence
- safe autofix PR flow when useful

### Other CI systems

Preserve the responsibilities, not the YAML syntax.

Required translation:

- workflow/doc audits on branch changes
- critical authoritative rerun lane
- scheduled maintenance
- artifact persistence if platform supports it

## 7. When to stop and escalate

Pause and ask the user when:

- the repo has multiple plausible roots for `.agents/**`
- existing CI is unusually complex and patch risk is high
- there are conflicting documentation ownership conventions
- the repo lacks enough runtime knowledge to write an honest `init.sh` contract

Otherwise, install the scaffold and leave explicit follow-up items in the initialized scope.
