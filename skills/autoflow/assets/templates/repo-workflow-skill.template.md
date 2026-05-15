---
name: workflow
description: Run a full autonomous development loop for this repo using a two-mode split: Initializer Mode (first session — sets up scope-aware progress artifacts and the bootstrap contract) and Coding Mode (subsequent sessions — make incremental progress, verify, and leave structured handoff artifacts). Use this whenever the user wants autonomous implementation, workflow hardening, parity closure, review/fix loops, or long-running agent work in this repo.
---

# Workflow

## Session architecture

- **Initializer mode**: create/update `.agents/progress/**`, initialize the current scope manifest, and seed the append-only progress log.
- **Coding mode**: orient through `progress.log`, `git log`, the active scope manifest, and the bootstrap contract; close one item at a time.

## Artifacts

Use `.agents/progress/scopes/index.json` when it exists. Keep `.agents/progress/features.json` synchronized as the default-scope mirror.

## Coding mode orientation

1. `pwd`
2. read `.agents/progress/progress.log`
3. read recent `git log`
4. select the relevant scope manifest from `.agents/progress/scopes/index.json` or fall back to `.agents/progress/features.json`
5. run `.agents/progress/init.sh`
6. verify the canonical runtime path before new work

## Core loop

- work on one failing item at a time
- update plans before large changes
- verify immediately
- append to `progress.log`
- refresh `session-ledger.json`
- keep the default-scope mirror synchronized if scope manifests are enabled
- leave the repo in a clean state

## Closure rule

Passing `functional` and `visual` items require authoritative verification. Structural or integration-only evidence is not enough for those categories.

## Required audits

Run the repo’s equivalents of:

- doc freshness
- workflow harness
- review coverage
- critical authoritative verification
- doc gardening / maintenance
