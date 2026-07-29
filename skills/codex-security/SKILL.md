---
name: codex-security
description: Use the OpenAI Codex Security CLI to scan repositories or code changes for vulnerabilities, review scan coverage and findings, validate suspected issues, export results, compare saved scans, or configure security scanning in CI. Trigger when the user mentions Codex Security, codex-security, vulnerability scanning with Codex, security review of a repository or diff, or asks to interpret Codex Security artifacts.
---

# Codex Security

Use `codex-security` to find, validate, and report vulnerabilities in repositories the user owns or is authorized to assess.

## Inspect the Installed CLI

The CLI is beta, so prefer its live help over remembered flags:

```bash
codex-security --version
codex-security --llms
codex-security <command> --help
codex-security <command> --schema
```

Require Node.js 22+ and Python 3.10+. If `codex-security` is missing, ask before installing `@openai/codex-security` or use `npx --yes @openai/codex-security` for a user-approved one-off run.

## Authenticate

For interactive local scans, use stored ChatGPT credentials:

```bash
codex-security login
codex-security scan . --auth chatgpt
```

Use `codex-security login --device-auth` on a headless machine. In CI, use `OPENAI_API_KEY` and `--auth api-key`. Never print, persist, or place credentials in command arguments, repository files, reports, or chat output.

## Choose the Smallest Useful Scope

Inspect `git status` first. Match the scan to the request:

```bash
# Committed changes relative to the main branch
codex-security scan . --diff origin/main --head HEAD

# Staged and unstaged changes
codex-security scan . --working-tree --base HEAD

# Selected paths
codex-security scan . --path services/billing --path packages/auth

# Full repository
codex-security scan .

# Broader, more expensive analysis
codex-security scan . --mode deep
```

Default to a diff, working-tree, or path scan when that fully covers the request. Run a full-repository or deep scan only when the user requests that scope. These scans can take many minutes and incur substantial model cost; agree on a budget when cost matters and pass `--max-cost <usd>`.

Fetch the base revision before a diff scan when needed. The repository argument for diff and working-tree scans must be the Git worktree root.

## Prepare and Run

Keep results outside the repository because they can contain source excerpts and vulnerability details:

```bash
SCAN_DIR="$(mktemp -d "${TMPDIR:-/tmp}/codex-security.XXXXXX")"
codex-security scan . --output-dir "$SCAN_DIR" --dry-run
codex-security scan . --output-dir "$SCAN_DIR" --format json
```

Add the selected scope, authentication, knowledge base, model, or cost flags to both commands. Use `--knowledge-base <path>` for relevant architecture, threat-model, or security-policy documents.

A dry run validates local inputs but does not prove credentials or complete a security review. Do not report “no findings” from a cancelled, failed, partial, or dry-run scan.

## Review the Result

After a completed scan, read:

1. `report.md` for the readable assessment.
2. `findings.json` for canonical findings, severity, evidence, locations, and remediation.
3. `coverage.json` for completeness, exclusions, deferred surfaces, and open questions.
4. `scan-manifest.json` for scope, revisions, target, and artifact integrity.

Report the exact scope, completion status, finding counts by severity, coverage state, limitations, elapsed time, estimated cost when available, and scan directory. Treat `complete`, `partial`, and `unknown` coverage differently. Never imply repository-wide safety from a diff or path scan.

## Follow Up

Use live help before these commands because their interfaces may change:

```bash
# Validate candidate findings
codex-security validate <finding-or-file>

# Export a completed scan
codex-security export <scan-dir> --export-format sarif --output results.sarif

# Inspect scan history
codex-security scans list <repository>
codex-security scans show <scan-id>
codex-security scans rerun <scan-id>
codex-security scans match <before-id> <after-id>
codex-security scans compare <before-id> <after-id>
```

Run `codex-security patch <issue-or-file>` only after the user explicitly asks for fixes. Review and test generated patches like any other security-sensitive code change; do not apply them blindly.

For CI, use noninteractive API-key authentication, an explicit `--fail-on-severity` threshold, a private artifact location, and the repository's normal secret-management system. Do not install a pre-commit hook with `codex-security install-hook` unless the user requests it.
