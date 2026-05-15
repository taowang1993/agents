---
name: screenshots
description: Screenshots, in-flow recordings, and `maestro record --local` with accurate output-location guidance
metadata:
  tags: screenshot, recording, video, visual, record, mp4
---

## `takeScreenshot`

Use `takeScreenshot` to save a PNG image of the current screen.

### Shorthand

```yaml
- takeScreenshot: LoginScreen
```

### Expanded syntax

```yaml
- takeScreenshot:
    path: LoginScreen
    cropOn:
      id: LoginFormContainer
    label: "Capture login form"
```

### Important path behavior

- The `path` is relative to the **Maestro workspace**, not the flow file
- When using Maestro Studio, screenshots are stored in `.maestro/screenshots`
- CLI artifact directories can also be controlled with `--test-output-dir` or `testOutputDir`

## In-flow video recording

### `startRecording` / `stopRecording`

```yaml
- startRecording: onboarding
- launchApp
- tapOn: "Login"
- stopRecording
```

Expanded form:

```yaml
- startRecording:
    path: "recordings/user_onboarding"
    label: "Capture onboarding sequence"
    optional: true
```

Notes:

- `stopRecording` takes no arguments
- `startRecording.path` is relative to the **flow file directory**
- `stopRecording` does not fail if no recording is active

## `maestro record`

Use the CLI to render a stitched MP4 from a flow.

### Recommended mode

```bash
maestro record --local YourFlow.yaml
```

### Custom output file

```bash
maestro record --local YourFlow.yaml my_demo.mp4
```

### Important behavior

- Local rendering is the recommended mode
- Remote `maestro record` without `--local` is being deprecated
- Recordings are limited to **2 minutes**; longer flows stop recording automatically

## Default artifact locations for CLI runs

For CLI test / record artifacts, Maestro uses:

- **macOS / Linux:** `~/.maestro/tests`
- **Windows:** `%userprofile%\\.maestro\\tests`

Override with:

```bash
maestro test --test-output-dir=build/maestro-results e2e/
```

or:

```yaml
testOutputDir: build/maestro-results
```

## Practical examples

### Capture key checkpoints

```yaml
- launchApp
- takeScreenshot: "01_home"
- tapOn: "Login"
- takeScreenshot: "02_login_form"
- inputText: ${EMAIL}
- takeScreenshot: "03_email_entered"
```

### Crop before visual comparison

```yaml
- takeScreenshot:
    path: dashboard_panel
    cropOn:
      id: dashboard_panel
```

### Capture a whole user journey as video

```yaml
- startRecording: checkout_flow
- launchApp
- tapOn: "Cart"
- tapOn: "Checkout"
- stopRecording
```

## Best practices

1. Use meaningful screenshot names like `login_error_state` instead of `screen1`
2. Prefer `--local` for `maestro record`
3. Use `cropOn` when the user only cares about one region
4. Upload the artifact directory in CI when failures need visual debugging
5. When sharding, make screenshot names unique so files do not overwrite each other
