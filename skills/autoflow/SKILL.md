---
name: autoflow
description: Scaffold or upgrade a repo to a long-running agent workflow harness. Use this whenever the user asks to set up an autonomous coding loop, agent harness, initializer/coding-agent workflow, `.agents` folder, `features.json`, `progress.log`, `init.sh`, `QUALITY.md`, execution plans, workflow audits, or CI-backed agent memory for a new or existing project — especially if they want to install a long-running workflow into another repo, even if they only say “bootstrap the workflow”, “set up autonomous loops”, or “add long-running agent scaffolding.”
version: "1.0.0"
---

# Autoflow

Scaffold a full long-running workflow harness into a new or existing project.

Your job is not to add one file. Your job is to install a **coherent operating system for long-running coding agents**:

- repo map in `AGENTS.md`
- repo-local reference docs in `.agents/reference/**`
- repo-local workflow skill in `.agents/skills/workflow/SKILL.md`
- scope-aware progress artifacts in `.agents/progress/**`
- execution plans in `.agents/plans/**`
- mechanical audits in `scripts/audit/**`
- CI jobs that enforce the workflow continuously

Use this skill for **new repos** and **existing repos**. For existing repos, integrate carefully instead of overwriting working automation.

## What “done” means

When you use this skill successfully, the target repo should have:

1. a short `AGENTS.md` that acts as a map, not a giant manual
2. a canonical `.agents/reference/**` layer
3. a repo-local workflow skill that teaches initializer + coding mode
4. scope-aware feature manifests under `.agents/progress/scopes/**`
5. a default-scope compatibility mirror at `.agents/progress/features.json`
6. append-only `progress.log` + derived `session-ledger.json`
7. an `init.sh`-style bootstrap contract with deterministic artifacts
8. workflow audits (`doc-freshness`, `workflow-harness`, `review-coverage`, `critical-authoritative-verification`, `doc-gardening`)
9. CI jobs + scheduled maintenance enforcing the setup
10. a first initialized scope for the current task or project bootstrap

## First: classify the target repo

Before writing files, inspect the repo and classify it on three axes.

### 1. Repo topology

- single-package app/library
- monorepo
- polyrepo subproject inside a larger workspace

### 2. Runtime shape

- Electron / desktop app
- browser web app
- backend / API / worker
- CLI / library
- mixed system

### 3. Native scripting/tooling surface

Prefer the repo’s existing scripting runtime for audits and task wiring.

- If the repo is already Node-first, prefer `scripts/audit/*.mjs` plus `package.json` scripts.
- If the repo is Python-first and has no Node task runner, recreate the same contracts in Python and wire them into the native task runner.
- If the repo is mixed, use the dominant root automation language.

Node is a common runtime for `.mjs` audits. Replicate behavior, not the file extension at all costs.

## Exact installation workflow

### Step 1 — inspect current state

Read, at minimum:

- root repo map files (`AGENTS.md`, `README*`, root task config)
- CI config
- package/task runner config
- any existing agent docs (`.agents/**`, `.context/**`, `docs/**`, `AGENTS.md`)

Decide whether you are:

- bootstrapping from nothing
- upgrading a partial workflow setup
- migrating from another doc/progress scheme

### Step 2 — choose parity mode

There are two supported modes.

#### A. Exact-parity mode
Use this when the user explicitly wants **long-running workflow parity**.

Read `references/source-parity-map.md` and, when the source repo is available, adapt the source files listed there.

#### B. Template mode
Use this when the source repo is unavailable or the user wants the workflow pattern but not literal parity.

Use the bundled templates in `assets/templates/**` plus the contracts in the reference docs.

### Step 3 — create the workflow skeleton

Create or update these paths:

- `AGENTS.md`
- `.agents/skills/workflow/SKILL.md`
- `.agents/progress/`
- `.agents/progress/scopes/`
- `.agents/progress/verification/`
- `.agents/plans/active/`
- `.agents/plans/completed/`
- `.agents/reference/`
- `scripts/audit/`
- CI workflow files or equivalent scheduler config

Read `references/workflow-contract.md` before writing the full scaffold.

### Step 4 — install the progress system

At minimum install these progress artifacts:

- `.agents/progress/features.json` — default-scope mirror
- `.agents/progress/scopes/index.json`
- `.agents/progress/scopes/<scope_id>/features.json`
- `.agents/progress/init.sh` (or repo-native equivalent)
- `.agents/progress/progress.log`
- `.agents/progress/session-ledger.json`
- `.agents/progress/progress.json`
- `.agents/progress/plan.md`
- `.agents/progress/report.md`
- `.agents/progress/QUALITY.md`

Use these bundled templates as the starting point when in template mode:

- `assets/templates/features.template.json`
- `assets/templates/scopes.index.template.json`
- `assets/templates/progress-log.initializer.template.md`
- `assets/templates/QUALITY.template.md`

### Step 5 — install the repo-local workflow skill

Create `.agents/skills/workflow/SKILL.md` in the target repo.

It should teach:

- initializer mode
- coding mode orientation
- incremental one-item workflow
- scope-aware manifests
- progress-log / session-ledger sync
- verification ladder
- review lane
- commit / merge expectations

Use `assets/templates/repo-workflow-skill.template.md` as a starter, then adapt it to the target repo’s runtime commands, CI commands, and trust boundaries.

### Step 6 — install the knowledge-base layer

At minimum create or update:

- `.agents/reference/architecture.md`
- `.agents/reference/observability.md`
- `.agents/reference/review.md`
- `.agents/reference/test.md`

If `/docs/**` also exists:

- keep `.agents/reference/**` canonical for agent-facing contracts
- keep `/docs/**` for human/mixed SOPs and deep dives
- if topics overlap, make `/docs/**` a short compatibility pointer

### Step 7 — install audits

Install equivalents of these audit lanes:

- `doc-freshness`
- `workflow-harness`
- `review-coverage`
- `critical-authoritative-verification`
- `doc-gardening`
- helpers for scope mirrors / session-ledger sync

In Node-first repos, prefer:

- `scripts/audit/_workflow-scopes.mjs`
- `scripts/audit/doc-freshness.mjs`
- `scripts/audit/workflow-harness.mjs`
- `scripts/audit/review-coverage.mjs`
- `scripts/audit/critical-authoritative-verification.mjs`
- `scripts/audit/doc-gardening.mjs`
- `scripts/audit/sync-session-ledger.mjs`
- `scripts/audit/sync-feature-scope-mirror.mjs`

Read `references/source-parity-map.md` for exact source files to mirror in exact-parity mode.

### Step 8 — wire task-runner commands

Add task-runner commands so a fresh agent can run the workflow checks with one-step commands.

At minimum wire equivalents of:

- workflow harness audit
- doc freshness audit
- review coverage audit
- critical authoritative verification
- doc gardening audit
- session-ledger sync
- feature-scope mirror sync

Use the repo’s native task runner. Do not force `package.json` into a Python repo or `Makefile` into a pnpm monorepo unless the repo already uses it.

### Step 9 — wire CI and scheduling

Integrate the workflow into CI without replacing unrelated jobs.

At minimum add:

- workflow/doc audit job(s) on push + PR
- critical authoritative-verification job
- runtime/bootstrap smoke job when the repo has a user-facing runtime
- scheduled doc-gardening / maintenance job with safe autofix flow if the platform supports it

For GitHub Actions, mirror the reference repo's shape and adapt commands. For other CI systems, preserve the same responsibilities.

### Step 10 — initialize the first scope honestly

Do **not** leave the repo with empty placeholders that claim to be a live workflow.

Initialize a real first scope:

- choose `task_id`
- choose `scope_id`
- create the scope-local manifest
- create the default-scope mirror
- seed `progress.log` with the initializer session
- generate `session-ledger.json`
- set an initial `QUALITY.md`
- write a first verification note if any setup verification was actually run

## Non-negotiable invariants

These are the important parts. Preserve them even when adapting the implementation language.

1. **`AGENTS.md` is a map, not an encyclopedia.**
2. **Agent-facing canonical docs live in-repo.**
3. **Feature manifests are scope-aware.**
4. **`.agents/progress/features.json` mirrors the default scope.**
5. **`progress.log` is append-only.**
6. **`session-ledger.json` is derived and kept in sync.**
7. **Passing `functional` / `visual` items require authoritative verification.**
8. **Workflow claims are mechanically linted.**
9. **The bootstrap contract is machine-readable.**
10. **CI re-runs a critical lane instead of trusting evidence files by shape alone.**
11. **Scheduled maintenance exists.**
12. **Existing repos are patched carefully, not bulldozed.**

## New repo vs existing repo rules

### New repo

- create the full skeleton directly
- keep starter docs compact and true
- avoid inventing product-domain hotspot grades unless the product actually has those domains yet

### Existing repo

- integrate into existing CI, don’t wipe it
- shorten an oversized `AGENTS.md` into a TOC and move long content into `.agents/reference/**`
- migrate stale `.context/**` references into tracked repo-local docs
- preserve existing docs by converting duplicates into compatibility pointers where possible
- keep legacy paths working when cheap, but make canonical ownership explicit

## Runtime-specific smoke guidance

Read `references/adaptation-matrix.md` after repo classification.

Quick rule:

- **Electron / desktop**: bootstrap should check cleanup, startup, automation attach contract, and at least one canonical product route.
- **Web app**: bootstrap should start the app, hit a canonical route, and leave deterministic runtime artifacts.
- **Backend / CLI / library**: bootstrap should still emit a contract and prove the canonical dev/test/health path, even if there is no browser route.

Do not fake browser-specific smoke in non-browser repos.

## Output standard

When you finish scaffolding, report:

- what files were created/updated
- what commands were wired
- what CI jobs were added/updated
- what verification actually ran
- what still needs manual repo-specific follow-up

If you could not install a full parity lane because the target repo lacked prerequisites, say so explicitly and leave a concrete follow-up in the initialized scope manifest.

## Read these bundled resources

Read as needed:

- `references/workflow-contract.md` — exact scaffold and invariants
- `references/adaptation-matrix.md` — runtime/topology adaptation rules
- `references/source-parity-map.md` — how to mirror the reference implementation exactly
- `assets/templates/**` — starter file shapes for template mode

## Do not

- do not claim harness parity while omitting the audits or CI wiring
- do not leave `features.json` and scope manifests out of sync
- do not create a long `AGENTS.md` that duplicates all reference docs
- do not mark feature items passing without real verification
- do not overwrite working CI or docs without preserving intent
- do not hardcode Electron/browser assumptions into backend-only repos
