---
name: ci-integration
description: CI/CD patterns for Maestro CLI and Maestro Cloud, including reports, artifacts, and parallel execution guidance
metadata:
  tags: ci, cd, github-actions, gitlab, cloud, junit, artifacts
---

## CI goals with Maestro

In CI, users usually want one or more of these:

- run local simulator / emulator tests
- run web tests headlessly
- upload app + flows to Maestro Cloud
- publish JUnit / HTML reports
- retain screenshots, videos, logs, and AI artifacts

## GitHub Actions examples

### iOS on macOS

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH

      - name: Boot iOS Simulator
        run: |
          xcrun simctl boot "iPhone 16 Pro"
          xcrun simctl bootstatus "iPhone 16 Pro" -b

      - name: Run Tests
        run: maestro test --format junit --output report.xml e2e/

      - name: Upload Artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: maestro-results
          path: |
            report.xml
            ~/.maestro/tests/
```

### Android on Linux

```yaml
jobs:
  e2e-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH

      - name: Run Tests on Emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 34
          target: google_apis
          arch: x86_64
          script: maestro test --format junit --output report.xml e2e/
```

### Web in headless mode

```yaml
jobs:
  e2e-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH
      - name: Run Web Tests
        run: maestro test --headless --screen-size=1920x1080 --format junit --output report.xml e2e/
```

## Maestro Cloud in CI

Use Cloud when the user wants managed devices, easier parallelism, or richer dashboard artifacts.

```bash
export MAESTRO_CLOUD_API_KEY=<your_key>

maestro cloud \
  --app-file app.apk \
  --flows e2e/ \
  --format junit \
  --output report.xml
```

### Helpful Cloud flags in CI

- `--project-id` to avoid interactive project selection
- `--device-model` / `--device-os` to make runs reproducible
- `--branch`, `--commit-sha`, `--repo-name`, `--repo-owner`, `--pull-request-id` to enrich Cloud context

## Report formats

### JUnit

```bash
maestro test --format junit --output build/report.xml e2e/
```

### HTML

```bash
maestro test --format html --output build/report.html e2e/
maestro test --format html-detailed --output build/detailed-report.html e2e/
```

## Artifact strategy

At minimum, upload:

- `report.xml`
- the artifact directory (often `~/.maestro/tests/`)

If debugging is needed, also produce a dedicated debug directory:

```bash
maestro test --debug-output=build/debug --test-output-dir=build/artifacts e2e/
```

## Local parallel execution in CI

If the CI runner boots multiple local devices, use Maestro’s sharding flags:

```bash
maestro test --shard-all 3 .maestro
maestro test --shard-split 3 .maestro
```

Only use these when the required number of devices is already running.

For Cloud runs, Cloud handles device allocation and scaling; local sharding flags are usually unnecessary there.

## GitLab CI example

```yaml
e2e:
  image: mobile-dev-inc/maestro:latest
  script:
    - maestro test --format junit --output report.xml e2e/
  artifacts:
    when: always
    paths:
      - report.xml
      - ~/.maestro/tests/
    reports:
      junit: report.xml
```

## CI-specific tips

1. Prefer named parameters for `maestro cloud` (`--app-file`, `--flows`)
2. Set `MAESTRO_DRIVER_STARTUP_TIMEOUT=180000` on slower runners
3. Use `junit` for machine-readable results and HTML for human review
4. Keep artifact paths stable so uploads are simple
5. Break very long Cloud suites into smaller flows — Maestro Cloud has a **soft 15-minute limit** per test execution
