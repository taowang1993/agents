---
name: maestro
description: E2E UI testing with Maestro for iOS, Android, Flutter, React Native, and Web. Use whenever the user needs to write, run, debug, or fix Maestro flows (.yaml); configure Maestro CLI, Maestro Studio, Maestro Cloud, or Maestro MCP; set up workspaces (`config.yaml`), selectors, permissions, devices, reports, or CI; or automate mobile/web UI testing with Maestro.
---

## Pre-flight: auto-update (run once per session)

```bash
brew upgrade maestro
```

## When to use

Use this skill whenever the user is:

- Writing, editing, or debugging Maestro test flows (`.yaml` files)
- Setting up Maestro CLI, `JAVA_HOME`, or troubleshooting installation
- Using Maestro Studio (the desktop app) for visual authoring/debugging
- Configuring a Maestro workspace (`config.yaml` or `.maestro/` directory)
- Creating selectors for iOS, Android, Flutter, React Native, or Web
- Running `maestro test`, `maestro cloud`, `maestro record`, `maestro mcp`, or related CLI commands
- Choosing devices, sharding locally, or configuring Cloud device models / OS versions
- Handling permissions, system alerts, deep links, or platform-specific behavior
- Inspecting artifacts, reports, screenshots, videos, or AI analysis output
- Setting up CI/CD pipelines with Maestro or debugging flaky E2E runs
- Integrating coding agents with the Maestro MCP server
- Detecting Maestro at runtime in app code via launch arguments or `window.maestro`

## How to use this skill

This skill is organized into focused reference files. Read the ones relevant to the task.

### Core

- **[rules/installation.md](rules/installation.md)** — Install/update Maestro CLI on macOS, Linux, Windows, and WSL; Java 17+ and `JAVA_HOME`
- **[rules/cli-reference.md](rules/cli-reference.md)** — CLI subcommands, global options, `test` / `cloud` / `record` flags, env vars
- **[rules/test-structure.md](rules/test-structure.md)** — Flow YAML structure, tags, env variables, `config.yaml`, sequential execution
- **[rules/commands.md](rules/commands.md)** — High-level reference for Maestro YAML commands and common examples
- **[rules/selectors.md](rules/selectors.md)** — Text/id/css/point selectors, relational selectors, traits, state selectors, dimensions
- **[rules/assertions.md](rules/assertions.md)** — `assertVisible`, `assertNotVisible`, `assertTrue`, AI assertions, screenshot assertions, AI text extraction
- **[rules/interactions.md](rules/interactions.md)** — `tapOn`, `inputText`, `scroll`, `scrollUntilVisible`, `swipe`, `pressKey`, keyboard handling
- **[rules/permissions.md](rules/permissions.md)** — Launch-time and mid-flow permissions, iOS vs Android differences, custom permissions

### Flow Control

- **[rules/advanced/conditions.md](rules/advanced/conditions.md)** — `when:` conditions: visible, notVisible, platform, JavaScript expressions
- **[rules/advanced/nested-flows.md](rules/advanced/nested-flows.md)** — `runFlow`, reusable subflows, inline flows, parameter passing
- **[rules/advanced/parameters.md](rules/advanced/parameters.md)** — CLI params, shell env vars, `${}` syntax, defaults, scope, built-ins
- **[rules/advanced/javascript.md](rules/advanced/javascript.md)** — `evalScript`, `runScript`, `output`, HTTP requests, `faker`
- **[rules/advanced/repeat-retry.md](rules/advanced/repeat-retry.md)** — `repeat`, `retry`, `onlyIf`, loop patterns
- **[rules/advanced/waiting.md](rules/advanced/waiting.md)** — `extendedWaitUntil`, `waitForAnimationToEnd`, timeout guidance

### Lifecycle, Devices, and Detection

- **[rules/hooks.md](rules/hooks.md)** — `onFlowStart` / `onFlowComplete` hooks for setup and teardown
- **[rules/detect-maestro.md](rules/detect-maestro.md)** — Detect Maestro in app code with launch arguments or `window.maestro`
- **[rules/devices-and-sharding.md](rules/devices-and-sharding.md)** — `start-device`, `list-devices`, `--device`, local sharding, screenshot naming

### Platforms

- **[rules/platforms/android.md](rules/platforms/android.md)** — ADB, Android dialogs, emulators, Compose IDs, Android-specific commands
- **[rules/platforms/ios.md](rules/platforms/ios.md)** — Simulators, iOS permission behavior, keychain, English-language requirement, limitations
- **[rules/platforms/flutter.md](rules/platforms/flutter.md)** — `Semantics.identifier`, `semanticsLabel`, widget patterns, why Keys do not work
- **[rules/platforms/react-native.md](rules/platforms/react-native.md)** — `testID`, `accessibilityLabel`, Expo, component patterns
- **[rules/platforms/web.md](rules/platforms/web.md)** — Chromium-based web testing, `url`, CSS selectors, headless mode, state handling

### Operations

- **[rules/debugging.md](rules/debugging.md)** — CLI debugging, `maestro hierarchy`, verbose logs, debug artifacts, common failure patterns
- **[rules/maestro-studio.md](rules/maestro-studio.md)** — Maestro Studio desktop app, environments, cloud runs, web/mobile visual inspection
- **[rules/screenshots.md](rules/screenshots.md)** — `takeScreenshot`, `startRecording`, `stopRecording`, `maestro record --local`, output behavior
- **[rules/reporting-and-analysis.md](rules/reporting-and-analysis.md)** — JUnit/HTML reports, `--test-output-dir`, `--debug-output`, AI analysis, artifact layout
- **[rules/ci-integration.md](rules/ci-integration.md)** — GitHub Actions, GitLab CI, Maestro Cloud, report uploads, CI-friendly patterns
- **[rules/mcp.md](rules/mcp.md)** — Maestro MCP server setup, agent configuration, available MCP tools
- **[rules/best-practices.md](rules/best-practices.md)** — Semantic IDs, atomic tests, project structure, naming, maintainability

## Quick reference: common workflows

### Create a new test flow
```yaml
appId: com.example.app
---
- launchApp:
    clearState: true
- tapOn: "Get Started"
- assertVisible: "Dashboard"
```

### Run tests locally
```bash
maestro test flow.yaml
maestro test --include-tags=smoke e2e/
maestro test --format junit --output report.xml e2e/
```

### Run on Maestro Cloud
```bash
maestro cloud --app-file app.apk --flows e2e/
```

### Debug a failing test
```bash
maestro hierarchy
maestro test --verbose flow.yaml
maestro test --debug-output=./debug flow.yaml
```

### Visual authoring / inspection
- Open the **Maestro Studio** desktop app and connect a device or browser session

### Record a demo video
```bash
maestro record --local flow.yaml
```
