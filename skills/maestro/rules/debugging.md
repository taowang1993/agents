---
name: debugging
description: CLI-first Maestro debugging with hierarchy inspection, verbose logs, artifacts, and common failure patterns
metadata:
  tags: debug, hierarchy, troubleshooting, logs, artifacts
---

## Start with the right debugging tool

- Use **Maestro Studio** for visual debugging and point-and-click inspection — see `rules/maestro-studio.md`
- Use this file for **CLI-first debugging**

## Inspect the current UI hierarchy

```bash
maestro hierarchy
```

Use this when:

- an element cannot be found
- text / IDs are not what you expected
- you need to see whether the element is actually present in the accessibility tree

You can also filter the output:

```bash
maestro hierarchy | grep "login"
```

## Run with more logging

```bash
maestro test --verbose flow.yaml
maestro test --debug-output=./debug flow.yaml
```

Use `--debug-output` when the user needs:

- `maestro.log`
- JavaScript `console.log` output
- command JSON metadata

## Common failure patterns

### Element not found

Checklist:

1. Run `maestro hierarchy`
2. Verify the selector text / ID exactly matches what Maestro sees
3. Confirm the element is actually on screen
4. Replace brittle coordinates with a stable selector if possible
5. Add a wait when the screen is still loading

Example:

```yaml
- extendedWaitUntil:
    visible: "Dashboard"
    timeout: 10000
- assertVisible: "Dashboard"
```

### Keyboard is blocking the target

```yaml
- inputText: "secret123"
- hideKeyboard
- tapOn:
    id: "submit_button"
```

If `hideKeyboard` is unreliable, tap a safe non-input area.

### Timing / ghost tap issues

Use the tools Maestro provides before adding arbitrary sleeps:

```yaml
- tapOn:
    text: "Next"
    retryTapIfNoChange: true

- waitForAnimationToEnd

- extendedWaitUntil:
    notVisible: "Loading..."
    timeout: 15000
```

### Permission dialog problems

- On **iOS**, prefer configuring permissions up front; dialogs are auto-handled only on English simulators
- On **Android**, interact with permission dialogs using normal Maestro commands such as `tapOn`

See:

- `rules/permissions.md`
- `rules/platforms/ios.md`
- `rules/platforms/android.md`

### Wrong app/browser state

Reset cleanly when a previous run polluted the environment:

```yaml
- launchApp:
    clearState: true
```

Or:

```yaml
- clearState
```

For web, `clearState` clears browser data for the current origin.

## Device sanity checks

```bash
# Android
adb devices

# iOS
xcrun simctl list devices booted
```

If Maestro cannot see the target device, verify it is actually connected / booted first.

## Artifacts worth checking

Use `rules/reporting-and-analysis.md` for the full artifact model, but the most important files are:

- `maestro.log` from `--debug-output`
- screenshots / recordings from `--test-output-dir`
- AI report files from AI assertions or `--analyze`

## Practical debug flow

1. Re-run with `--verbose`
2. Re-run with `--debug-output`
3. Inspect `maestro hierarchy`
4. Add a screenshot or recording around the failing step
5. Fix selectors / waits / permissions rather than papering over the issue

## Helpful debug snippets

### Add a screenshot before and after a risky action

```yaml
- takeScreenshot: before_submit
- tapOn: "Submit"
- takeScreenshot: after_submit
```

### Capture copied text for assertion debugging

```yaml
- copyTextFrom:
    id: "price_label"
- evalScript: ${console.log('Price: ' + maestro.copiedText)}
```
