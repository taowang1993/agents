---
name: react-doctor
description: Use when finishing a feature, fixing a bug, before committing React code, or when the user wants to improve code quality or clean up a codebase. Checks for score regression. Covers lint, dead code, accessibility, bundle size, architecture diagnostics.
version: "1.0.0"
---

# React Doctor

Scans React codebases for security, performance, correctness, and architecture issues. Outputs a 0–100 health score.

## Pre-flight: auto-update (run once per session)

```bash
pnpm add -g react-doctor@latest
```

## After making React code changes:

Run `npx -y react-doctor@latest . --verbose --diff` and check the score did not regress.

If the score dropped, fix the regressions before committing.

## For general cleanup or code improvement:

Run `npx -y react-doctor@latest . --verbose` (without `--diff`) to scan the full codebase. Fix issues by severity — errors first, then warnings.

## Triage before fixing

Treat findings as candidates, not commands. Before editing, classify each warning as:

- **Real, safe fix**: small behavior-preserving change with a runnable check.
- **Needs triage**: ordering, transactions, async sequencing, security boundaries, filesystem paths, raw SQL, or migration-scale rules.
- **False positive / accepted tradeoff**: document why and leave it alone.

Scope migration-scale findings by package or feature area. Do not sweep broad rules repo-wide, do not globally disable rules, and do not change sequencing-sensitive code just to satisfy React Doctor. Prefer one small section, verify it, then continue.

## Command

```bash
npx -y react-doctor@latest . --verbose --diff
```

| Flag        | Purpose                                       |
| ----------- | --------------------------------------------- |
| `.`         | Scan current directory                        |
| `--verbose` | Show affected files and line numbers per rule |
| `--diff`    | Only scan changed files vs base branch        |
| `--score`   | Output only the numeric score                 |
