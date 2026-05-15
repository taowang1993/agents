---
name: knip
description: Knip unused-code analysis. Use when auditing JavaScript/TypeScript projects for unused files, dependencies, exports, or types; tuning knip configuration; or fetching Knip documentation.
---

# Knip

Use the native CLI directly. Load [references/knip-detailed.md](references/knip-detailed.md) for flag reference and common patterns.

## Pre-flight: auto-update (run once per session)

```bash
pnpm add -g knip@latest
```

## CLI

```bash
npx knip
```

The user may have a local `pnpm knip` script; prefer that when available. Otherwise `npx knip` (or `npx knip --reporter json` for automation).

## Key flags (quick reference)

| Flag | Purpose |
|------|---------|
| `--reporter json` | Structured output for parsing |
| `--production` | Exclude devDependencies, tests, stories |
| `--strict` | Isolate workspaces, direct deps only (implies `--production`) |
| `--include <types>` | Scope to specific issue types (e.g. `exports,types`) |
| `--exclude <types>` | Suppress issue types (e.g. `files`) |
| `--workspace <name>` | Target a single workspace |
| `--cache` | 10-40% faster repeat runs |
| `--no-gitignore` | Ignore `.gitignore` files |

**Issue types** for `--include`/`--exclude`: `files`, `dependencies`, `unlisted`, `unresolved`, `exports`, `nsExports`, `types`, `nsTypes`, `enumMembers`, `duplicates`

## Default workflow

1. `npx knip --reporter json` — get the full picture.
2. Triage by severity: files > dependencies > exports > types.
3. For false positives, iterate on `knip.json` entry/project patterns.
4. For docs: `curl -s https://knip.dev/reference/cli` or fetch `https://knip.dev/explanations/plugins`.

## Guardrails

- Always `--reporter json` when parsing output in automation.
- Set explicit `cwd` when not in the project root.
- Iterate config changes incrementally; rerun after each update.
- `knip` can report false positives for dynamic imports and convention-based loaders — treat findings as triage, not verdict.
