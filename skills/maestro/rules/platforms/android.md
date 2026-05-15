---
name: android
description: Android-specific Maestro guidance for ADB, dialogs, emulators, Compose IDs, and device actions
metadata:
  tags: android, adb, emulator, dialogs, permissions
---

## Package IDs

Android app IDs are package names such as:

```yaml
appId: com.example.my_app
```

Find installed packages with:

```bash
adb shell pm list packages | grep example
```

## ADB basics

Maestro relies on ADB for Android device communication.

```bash
adb devices
```

Use this first when Maestro cannot see the device.

## Permission dialogs

Unlike iOS, Android system dialogs can usually be automated with normal Maestro commands.

```yaml
- launchApp:
    permissions:
      camera: deny

- tapOn:
    id: "request_permission_button"

- tapOn: "While using the app"
```

Typical dialog text varies by Android version:

| Version family | Common options |
|---|---|
| Android 10 | `Allow`, `Deny` |
| Android 11+ | `While using the app`, `Only this time`, `Don't allow` |

## Emulator management

### Start supported devices with Maestro

```bash
maestro start-device --platform=android --device-model=pixel_7 --device-os=android-34
```

### List supported devices

```bash
maestro list-devices
```

### Use a manually managed emulator

```bash
emulator -avd Pixel_4_API_31
```

## UI hierarchy inspection

```bash
maestro hierarchy
```

Use this to discover visible text, IDs, and accessibility structure.

## Android-specific device actions

### Back navigation

```yaml
- back
# or
- pressKey: back
```

### Airplane mode

```yaml
- setAirplaneMode:
    enabled: true
- toggleAirplaneMode
```

### Mock location

```yaml
- setLocation:
    latitude: 37.7749
    longitude: -122.4194
```

## Jetpack Compose

Compose test tags are not exposed as Maestro IDs by default. Enable them:

```kotlin
Modifier.semantics { testTagsAsResourceId = true }
```

Then a tag like `login_button` becomes addressable with:

```yaml
- tapOn:
    id: "login_button"
```

## Custom Android permissions

Use the full permission string when needed:

```yaml
permissions:
  com.android.voicemail.permission.ADD_VOICEMAIL: allow
```

## Troubleshooting

### App not found

```bash
adb shell pm list packages | grep com.example
adb install -r app.apk
```

### Permission dialog did not appear

Reset state and retry:

```yaml
- launchApp:
    clearState: true
```

### Device not found

```bash
adb kill-server
adb start-server
adb devices
```
