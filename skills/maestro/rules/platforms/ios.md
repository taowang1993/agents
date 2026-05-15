---
name: ios
description: iOS-specific Maestro guidance for simulators, permission behavior, keychain reset, and platform limitations
metadata:
  tags: ios, simulator, dialogs, permissions, keychain
---

## Bundle IDs

iOS apps use bundle IDs such as:

```yaml
appId: com.example.myApp
```

Find installed apps on a booted simulator with:

```bash
xcrun simctl listapps booted | grep CFBundleIdentifier
```

## Simulator management

### List simulators

```bash
xcrun simctl list devices
```

### Boot a simulator manually

```bash
xcrun simctl boot "iPhone 15 Pro"
```

### Boot a supported simulator with Maestro

```bash
maestro start-device --platform=ios --device-model=iPhone-17-Pro --device-os=iOS-18-2
```

## Permission behavior on iOS

The safest strategy on iOS is to configure permissions explicitly instead of trying to tap system dialogs.

### Pre-grant permissions

```yaml
- launchApp:
    permissions:
      camera: allow
      location: allow
      notifications: allow
```

### Re-prompt for a permission

```yaml
- launchApp:
    permissions:
      camera: unset
```

If the app requests that permission on an **English-language simulator**, Maestro can auto-handle the system dialog.

## Important iOS constraints

- Auto-handled permission dialogs work reliably only on **English simulators**
- Physical iOS device execution is **not supported yet**
- Face ID / Touch ID are not supported test targets
- Apple Pay sheets are not supported

## Language requirement

Keep the simulator in English when relying on iOS permission auto-handling.

Typical manual path:

1. Settings → General → Language & Region
2. Set English
3. Restart the simulator

## iOS-specific permission values

### Location

```yaml
permissions:
  location: always
```

```yaml
permissions:
  location: inuse
```

```yaml
permissions:
  location: never
```

### Photos

```yaml
permissions:
  photos: limited
```

## Keychain reset

Clear iOS Keychain state when a test depends on stored credentials:

```yaml
- launchApp:
    clearKeychain: true
```

or:

```yaml
- clearKeychain
```

## Accessibility identifiers

### SwiftUI

```swift
Button("Login") { login() }
  .accessibilityIdentifier("login_button")
```

### UIKit

```swift
button.accessibilityIdentifier = "login_button"
```

## Troubleshooting

### Dialog was not auto-handled

1. Verify the simulator language is English
2. Prefer explicit permission setup with `permissions:`
3. Confirm the prompt is a system prompt and not a custom in-app dialog
