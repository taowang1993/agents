---
name: maestro-studio
description: Maestro Studio desktop app for visual authoring, inspection, environments, and Cloud runs
metadata:
  tags: studio, desktop-app, visual, debugging, environments, cloud
---

## What Maestro Studio is

Maestro Studio is a **desktop app**, not a `maestro studio` CLI subcommand. Use it when the user wants visual authoring, point-and-click selector generation, step-by-step replay, or interactive inspection.

Studio is compatible with:

- Android and iOS device/simulator workflows
- Web testing in Chromium-based sessions
- Local debugging and Cloud-triggered runs

## Install Maestro Studio

Download the desktop app for the user’s OS:

- **Windows:** `MaestroStudio.exe`
- **macOS:** `MaestroStudio.dmg`
- **Linux:** `MaestroStudio.AppImage`

After installing:

1. Launch Maestro Studio
2. Create or open a workspace folder
3. Select a connected device / simulator / emulator
4. Create or open a Flow file

## What Studio is good at

### Visual test creation

- Right-click elements in the connected app to insert YAML commands
- Use editor autocomplete for commands, parameters, and live selectors
- Inspect the current screen visually instead of reading raw hierarchy output

### Local debugging

- Run flows step by step
- Replay a run and inspect where it failed
- Review recordings from prior runs

### Environments

Studio lets you define reusable environments containing:

- **Variables** — key/value pairs such as `BASE_URL`, `EMAIL`, `APP_ID`
- **Included / excluded tags** — so one environment can run only Android, smoke, or staging flows

Use environment variables anywhere `${}` expressions are supported:

```yaml
- inputText: ${email}
```

Use them in logic too:

```yaml
- runFlow:
    when:
      true: ${APP_ID == "com.example.android"}
    commands:
      - tapOn: "Start"
```

## Run tests from Studio

Typical workflow:

1. Open or create a workspace
2. Connect a device
3. Create a Flow file
4. Build commands visually or by editing YAML
5. Click **Run Test**

After a successful run, Studio stores the recording in the workspace’s `.maestro` directory.

## Run tests on Maestro Cloud from Studio

Studio can submit runs directly to Maestro Cloud.

Typical flow:

1. Open the **Cloud** tab
2. Choose **Run Test** or **Run All Tests**
3. Select:
   - app binary
   - device model / OS
   - optional environment
   - project
   - optional device locale
4. Start the run and monitor output in Studio
5. Open the Cloud dashboard for logs, recordings, and hierarchy details

## Important limitations / behavior

### `config.yaml`

Studio does **not** use `config.yaml` for local Studio execution the same way the CLI does. If the user is debugging workspace behavior such as discovery, execution order, or output directories, prefer CLI verification too.

However, when Studio uploads an entire workspace to Maestro Cloud, the configuration file is included in that upload.

### Web support

Studio is compatible with web testing, but the workflow is still Studio desktop app based. Do **not** invent a `maestro -p web studio` CLI command.

## When to prefer Studio vs CLI

### Prefer Studio when the user wants

- visual selector discovery
- point-and-click flow authoring
- step-by-step replay
- a GUI for environments and cloud submission

### Prefer CLI when the user wants

- CI/CD integration
- reproducible scripts
- report generation
- local sharding / explicit device flags
- terminal-first debugging

## Useful companion docs

When using Studio together with other Maestro features, also read:

- `rules/debugging.md` — CLI-side debugging and artifacts
- `rules/reporting-and-analysis.md` — report files and output directories
- `rules/platforms/web.md` — web-specific testing behavior
- `rules/mcp.md` — agent integration via `maestro mcp`
