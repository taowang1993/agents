---
name: commands
description: High-level reference for Maestro YAML commands with accurate examples for lifecycle, interaction, assertions, flow control, and device actions
metadata:
  tags: commands, api, reference, launchApp, tapOn, runFlow
---

## App lifecycle

| Command | Description | Example |
|---|---|---|
| `launchApp` | Launch the current app, another app, or the current web `url` | `- launchApp` |
| `stopApp` | Stop the app but keep it in memory | `- stopApp` |
| `killApp` | Kill the app process completely | `- killApp` |
| `clearState` | Reset app/browser state | `- clearState` |
| `clearKeychain` | Clear iOS keychain | `- clearKeychain` |

### `launchApp` example

```yaml
- launchApp:
    clearState: true
    clearKeychain: true          # iOS only
    stopApp: false               # bring a backgrounded app to foreground
    permissions:
      all: deny
      camera: allow
    arguments:
      isMaestro: true
      env: staging
```

Launch a different app by ID:

```yaml
- launchApp: "com.other.app"
```

## Core interactions

| Command | Description | Example |
|---|---|---|
| `tapOn` | Tap an element or point | `- tapOn: "Login"` |
| `doubleTapOn` | Double-tap an element | `- doubleTapOn: "Image"` |
| `longPressOn` | Long-press an element | `- longPressOn: "Item"` |
| `inputText` | Type text | `- inputText: "hello@example.com"` |
| `eraseText` | Delete text from the focused field | `- eraseText` or `- eraseText: 10` |
| `pasteText` | Paste clipboard contents | `- pasteText` |
| `hideKeyboard` | Dismiss the mobile keyboard | `- hideKeyboard` |
| `pressKey` | Press a hardware / virtual key | `- pressKey: enter` |

### Random input helpers

Maestro also supports:

- `inputRandomEmail`
- `inputRandomPersonName`
- `inputRandomNumber`
- `inputRandomText`
- `inputRandomCityName`
- `inputRandomCountryName`
- `inputRandomColorName`

## Navigation and motion

| Command | Description | Example |
|---|---|---|
| `scroll` | Simple vertical scroll | `- scroll` |
| `scrollUntilVisible` | Scroll until an element is visible | `- scrollUntilVisible: { element: "Footer" }` |
| `swipe` | Swipe by direction, coordinates, or from an element | `- swipe: { direction: LEFT }` |
| `back` | Android back / browser back | `- back` |
| `openLink` | Open a URL or deep link | `- openLink: "myapp://settings"` |

### `openLink` example

```yaml
- openLink:
    link: https://example.com
    autoVerify: true   # Android only
    browser: true      # Android only
```

## Assertions and AI commands

| Command | Description | Example |
|---|---|---|
| `assertVisible` | Assert that an element is visible | `- assertVisible: "Welcome"` |
| `assertNotVisible` | Assert that an element is not visible | `- assertNotVisible: "Spinner"` |
| `assertTrue` | Evaluate a JS condition | `- assertTrue: ${count > 0}` |
| `assertWithAI` | Natural-language UI assertion | `- assertWithAI: { assertion: "The cart shows 3 items" }` |
| `assertNoDefectsWithAI` | Check for visual defects | `- assertNoDefectsWithAI` |
| `assertScreenshot` | Compare against a baseline screenshot | `- assertScreenshot: baseline_dashboard.png` |
| `extractTextWithAI` | Extract text from the current screen | `- extractTextWithAI: CAPTCHA value` |

### `extractTextWithAI` example

```yaml
- extractTextWithAI:
    query: "CAPTCHA value"
    outputVariable: "theCaptchaValue"
    optional: false
- inputText: ${theCaptchaValue}
```

## Flow control and scripting

| Command | Description | Example |
|---|---|---|
| `runFlow` | Run a subflow file or inline commands | `- runFlow: { file: "login.yaml" }` |
| `runScript` | Run an external JavaScript file | `- runScript: { file: "scripts/setup.js" }` |
| `evalScript` | Run inline JavaScript | `- evalScript: ${output.ready = true}` |
| `repeat` | Loop a block of commands | `- repeat: { times: 3, commands: [...] }` |
| `retry` | Retry a block after failure | `- retry: { maxRetries: 2, commands: [...] }` |
| `extendedWaitUntil` | Wait longer than assertion defaults | `- extendedWaitUntil: { visible: "Done", timeout: 30000 }` |
| `waitForAnimationToEnd` | Wait for the UI to stop moving | `- waitForAnimationToEnd` |

### `runFlow` examples

```yaml
- runFlow:
    file: subflows/login.yaml
    env:
      USER_ROLE: admin
```

```yaml
- runFlow:
    label: Accept cookie banner if needed
    commands:
      - tapOn: "Accept"
```

## Device, media, and clipboard

| Command | Description | Example |
|---|---|---|
| `setPermissions` | Change permissions mid-flow | `- setPermissions: { permissions: { camera: allow } }` |
| `setLocation` | Apply a mock GPS location | `- setLocation: { latitude: 52.3599976, longitude: 4.8830301 }` |
| `travel` | Simulate moving along a route | `- travel: { points: [...], speed: 150000 }` |
| `setAirplaneMode` | Enable / disable airplane mode | `- setAirplaneMode: { enabled: true }` |
| `toggleAirplaneMode` | Toggle airplane mode | `- toggleAirplaneMode` |
| `setOrientation` | Change device orientation | `- setOrientation: { orientation: LANDSCAPE }` |
| `setClipboard` | Set clipboard contents | `- setClipboard: "test@example.com"` |
| `copyTextFrom` | Copy text from an element | `- copyTextFrom: { id: "price_label" }` |
| `addMedia` | Add images / videos to the device gallery | `- addMedia: ["./assets/foo.png", "./assets/foo.mp4"]` |
| `takeScreenshot` | Save a PNG screenshot | `- takeScreenshot: LoginScreen` |
| `startRecording` | Start recording the current flow | `- startRecording: onboarding` |
| `stopRecording` | Stop the current recording | `- stopRecording` |

### `copyTextFrom` usage

```yaml
- copyTextFrom:
    id: "userName"
- inputText: ${'Hello ' + maestro.copiedText}
```

### `travel` example

```yaml
- travel:
    points:
      - "48.8578065, 2.295188"
      - "46.2276, 5.9900"
      - "43.7230, 10.3966"
      - "41.8902, 12.4922"
    speed: 150000
    timeout: 15000
```

## Notes worth remembering

- `scroll` is intentionally simple; use `scrollUntilVisible` or `swipe` for more control
- `copyTextFrom` writes to `maestro.copiedText`
- AI commands are experimental and default to safer behavior with `optional: true`
- Use named options like `--app-file` and `--flows` for Cloud CLI commands
