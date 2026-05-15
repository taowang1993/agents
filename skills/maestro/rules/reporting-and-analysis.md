---
name: reporting-and-analysis
description: Test reports, output directories, artifacts, screenshots, logs, and AI analysis
metadata:
  tags: reports, artifacts, junit, html, debug-output, analyze, ai
---

## Output directories

Maestro stores screenshots, logs, metadata, and AI artifacts for each run.

### Default CLI artifact locations

- **macOS / Linux:** `~/.maestro/tests`
- **Windows:** `%userprofile%\\.maestro\\tests`

### Override artifact location

With the CLI:

```bash
maestro test --test-output-dir=build/maestro-results ./e2e
```

Or in `config.yaml`:

```yaml
testOutputDir: build/maestro-results
```

CLI flags override `config.yaml`.

## `--test-output-dir` vs `--debug-output`

These flags do not capture the same files.

| Artifact | `--test-output-dir` | `--debug-output` |
|---|---:|---:|
| Screenshots / videos | ✅ | ❌ |
| `commands-*.json` | ✅ | ✅ |
| AI reports | ✅ | ✅ |
| `maestro.log` | ❌ | ✅ |

Behavior when both are used:

- **Same directory:** everything is consolidated there
- **Different directories:** `maestro.log` goes to `--debug-output`, and screenshots/videos/commands/AI reports go to `--test-output-dir`

## Report formats

### JUnit XML

Best for CI systems:

```bash
maestro test --format junit --output build/report.xml ./e2e
```

If `--output` is omitted, Maestro writes `report.xml` in the current working directory.

### HTML reports

```bash
maestro test --format html --output build/report.html ./e2e
maestro test --format html-detailed --output build/detailed-report.html ./e2e
```

Use `html-detailed` when the user wants step-level detail.

## Flow metadata in reports

Flows can add custom properties that appear in JUnit output:

```yaml
appId: com.example.app
name: Login Flow
properties:
  testCaseId: "TC-101"
  priority: "High"
---
- launchApp
```

## AI analysis (`--analyze`)

Use AI Insights when the user wants help detecting layout issues, spelling errors, or internationalization problems.

```bash
maestro test login_flow.yaml --analyze
```

If Maestro finds issues, it writes an HTML insights report and prints a local file path in the terminal.

## Authentication for AI features

AI commands and AI analysis route through Maestro’s backend.

Use one of:

```bash
maestro login
```

or

```bash
export MAESTRO_CLOUD_API_KEY=<your_key>
```

Notes:

- AI features require a Maestro account
- A free account is enough for AI commands / analysis
- Running tests on Maestro Cloud itself still requires a Cloud plan

## AI artifacts

AI-related commands such as `assertWithAI`, `assertNoDefectsWithAI`, and `extractTextWithAI` generate HTML / JSON artifacts in the run directory. These are useful when a user wants visual evidence or wants to review why an AI check passed or failed.

## Common debugging commands

```bash
maestro test --verbose flow.yaml
maestro test --debug-output=build/debug flow.yaml
maestro test --test-output-dir=build/artifacts flow.yaml
```

## Best practices

1. Use `junit` for CI and `html` / `html-detailed` for human review
2. Upload both `report.xml` and the artifact folder in CI
3. Use `--debug-output` when debugging JavaScript logs or driver issues
4. Use `--test-output-dir` when the user mainly needs screenshots, videos, and AI artifacts
5. Keep artifact paths stable in CI to simplify uploads and retention rules
