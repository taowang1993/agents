---
name: skill-validator
description: Validate and score Agent Skill packages for spec compliance and quality. Use whenever the user needs to validate a skill directory, check structure or frontmatter, verify links resolve, analyze content quality or cross-language contamination, count tokens, run LLM-as-judge scoring, compare scores across models, set up CI validation, or iterate on a skill during development.
license: MIT
metadata:
  author: agent-ecosystem
  homepage: https://github.com/agent-ecosystem/skill-validator
---

# Skill Validator

A CLI tool that validates and scores [Agent Skill](https://agentskills.io) packages. Goes beyond spec compliance: checks that links resolve, reports token counts, analyzes content quality metrics, detects cross-language contamination, and offers LLM-as-judge scoring across dimensions like clarity, actionability, and novelty.

## Pre-flight: auto-update (run once per session)

```bash
brew upgrade skill-validator
```

## When to Use

- Validating a skill directory for spec compliance (`validate structure`)
- Checking all links in a skill resolve (`validate links`)
- Analyzing content quality of skill instructions (`analyze content`)
- Detecting cross-language contamination in code examples (`analyze contamination`)
- Running all checks in one pass (`check`)
- LLM scoring of skill quality (`score evaluate`)
- Comparing scores across different LLM models (`score report`)
- Setting up CI validation for skills
- Iterating on a skill during development

## CLI Commands

| Development stage | Command | What it answers |
|---|---|---|
| Scaffolding | `validate structure` | Does it conform to the spec and can agents use it? |
| Writing content | `analyze content` | Is the instruction quality good? |
| Adding examples | `analyze contamination` | Am I introducing cross-language contamination? |
| Review | `validate links` | Do external links still resolve? |
| Quality scoring | `score evaluate` | How does an LLM judge rate this skill? |
| Comparing models | `score report` | How do scores compare across different LLM providers? |
| Pre-publish | `check` | Run everything (except LLM scoring) |

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Clean pass (no errors, no warnings) |
| `1` | Validation errors present |
| `2` | Warnings present, no errors |
| `3` | CLI/usage error (bad flags, missing args) |

## Output Formats

All commands accept `-o text` (default), `-o json`, or `-o markdown` for output format. Use `-o json` for machine-readable output (parse with `jq`). Use `-o markdown` with `>> $GITHUB_STEP_SUMMARY` in CI. Use `--emit-annotations` to surface errors/warnings as GitHub Actions inline annotations.

## Common Workflows

### Quick all-in-one check

```bash
skill-validator check <path-to-skill>
skill-validator check --strict <path-to-skill>  # treat warnings as errors
skill-validator check --per-file <path-to-skill>  # per-file reference analysis
```

Runs structure + links + content + contamination.

### Check only specific groups

```bash
skill-validator check --only structure,links <path>
skill-validator check --skip contamination <path>
```

Valid groups: `structure`, `links`, `content`, `contamination`.

### Validate structure with allowances

```bash
# Allow non-standard directories (e.g., evals/, testing/)
skill-validator validate structure --allow-dirs=evals,testing <path>

# Allow flat layouts (files at skill root alongside SKILL.md)
skill-validator validate structure --allow-flat-layouts <path>

# Suppress orphan file warnings
skill-validator validate structure --skip-orphans <path>

# Allow non-spec frontmatter fields
skill-validator validate structure --allow-extra-frontmatter <path>
```

### Validate external links

```bash
skill-validator validate links <path>
```

HTTP/HTTPS links are verified with HEAD requests (10s timeout, concurrent). Template URLs (RFC 6570 syntax like `https://github.com/{OWNER}/{REPO}`) are skipped. HTTP 403 responses are reported as `info` — many sites block automated HEAD requests while working fine in browsers.

### Analyze content quality

```bash
skill-validator analyze content <path>
skill-validator analyze content --per-file <path>
```

Reports word count, code block ratio, imperative ratio, information density, instruction specificity, section/list/code block counts.

### Analyze cross-language contamination

```bash
skill-validator analyze contamination <path>
skill-validator analyze contamination --per-file <path>
```

Detects when code examples in one language could cause incorrect generation in another context. Reports contamination level (high/medium/low), language mismatches, multi-interface tool detection, and scope breadth.

### LLM scoring

```bash
# Anthropic (default)
export ANTHROPIC_API_KEY=your-key
skill-validator score evaluate <path>

# OpenAI / compatible
export OPENAI_API_KEY=your-key
skill-validator score evaluate --provider openai <path>
skill-validator score evaluate --provider openai --model gpt-5.2 <path>
skill-validator score evaluate --provider openai --base-url http://localhost:11434/v1 <path>

# Claude CLI (no API key needed if authenticated)
skill-validator score evaluate --provider claude-cli <path>

# Score specific parts
skill-validator score evaluate --skill-only <path>    # only SKILL.md
skill-validator score evaluate --refs-only <path>      # only references
skill-validator score evaluate path/to/references/file.md  # single file

# Fresh rescore (bypass cache)
skill-validator score evaluate --rescore <path>

# Send full content (no truncation at 8000 chars)
skill-validator score evaluate --full-content <path>
```

**SKILL.md dimensions** (1-5 each): Clarity, Actionability, Token Efficiency, Scope Discipline, Directive Precision, Novelty.

**Reference dimensions** (1-5 each): Clarity, Instructional Value, Token Efficiency, Novelty, Skill Relevance.

Results are cached in `.score_cache/` inside the skill directory. When a skill/file scores ≥3 on novelty, a follow-up call identifies which specific details are novel (proprietary APIs, internal conventions, unpublished workflows).

**Troubleshooting token parameter errors:** If you see `Unsupported parameter: 'max_tokens'`, use `--max-tokens-style`:

```bash
# Error says to use max_completion_tokens
skill-validator score evaluate --provider openai --model o3 --max-tokens-style max_completion_tokens <path>

# Some openai-compatible providers need max_tokens
skill-validator score evaluate --provider openai --max-tokens-style max_tokens <path>
```

### View and compare scores

```bash
skill-validator score report <path>           # most recent scores
skill-validator score report --list <path>    # tabular summary of all cached entries
skill-validator score report --compare <path> # side-by-side comparison across models
skill-validator score report --model claude-sonnet-4-5-20250929 <path>  # filter by model
```

### Multi-skill directories

If the path doesn't contain a `SKILL.md` but has subdirectories that do, the validator automatically detects and validates each skill independently:

```bash
skill-validator check skills/
```

## Important Flags Reference

| Flag | Applies to | Effect |
|---|---|---|
| `--strict` | `check`, `validate structure` | Treat warnings as errors (exit 1 instead of 2) |
| `--skip-orphans` | `check`, `validate structure` | Suppress unreferenced file warnings |
| `--allow-extra-frontmatter` | `check`, `validate structure` | Suppress warnings for non-spec frontmatter fields |
| `--allow-flat-layouts` | `check`, `validate structure` | Allow files at skill root without warnings |
| `--allow-dirs=dir1,dir2` | `check`, `validate structure` | Accept specific non-standard directories |
| `--per-file` | `check`, `analyze content`, `analyze contamination` | Show per-file breakdown |
| `--only X,Y` | `check` | Comma-separated list of check groups to run |
| `--skip X,Y` | `check` | Comma-separated list of check groups to skip |
| `--emit-annotations` | all | Emit GitHub Actions workflow annotations |
| `-o json`, `-o markdown` | all | Output format override |

## CI Integration

Example GitHub Actions workflow:

```yaml
name: Validate Skills
on:
  pull_request:
    paths:
      - "skills/**"

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install skill-validator
        run: brew install agent-ecosystem/tap/skill-validator

      - name: Validate skills
        run: |
          skill-validator check --strict --emit-annotations skills/
          skill-validator check --strict -o markdown skills/ >> "$GITHUB_STEP_SUMMARY"
```

## What It Checks

**Structure validation** (`validate structure`):
- SKILL.md existence and frontmatter (name, description required; optional: license, compatibility, metadata, allowed-tools)
- Directory structure (only `scripts/`, `references/`, `assets/` recognized)
- Token counts and limits (SKILL.md body warns at 5k, references warn at 25k)
- Markdown integrity (unclosed code fences are errors)
- Internal link validity (relative links resolve to existing files)
- Orphan file detection (unreferenced files in scripts/, references/, assets/)
- Extraneous file detection (README.md, CHANGELOG.md, AGENTS.md at root)
- Keyword stuffing detection in descriptions

**Link validation** (`validate links`): HTTP/HTTPS link resolution with 10s timeout.

**Content analysis** (`analyze content`): word count, code block count/ratio, sentence count, imperative ratio, information density, instruction specificity, section/list counts.

**Contamination analysis** (`analyze contamination`): multi-interface tool detection, language mismatch across code blocks, scope breadth, contamination score/level.

## Instructions

1. **Identify the task**: Determine whether the user wants to validate, score, or both.
2. **Choose the right command**: Use `check` for all-in-one validation, individual commands for targeted analysis, `score evaluate` for LLM scoring.
3. **Pick output format**: Use `-o json` when you need to parse results programmatically. Use `-o markdown` for human-readable reports.
4. **Report results clearly**: Summarize errors, warnings, token counts, and scores. Highlight actionable issues.

For full CLI documentation, see the [upstream README](https://github.com/agent-ecosystem/skill-validator).
