---
name: permissions
description: Configure permissions on launch or mid-flow, with iOS and Android differences called out clearly
metadata:
  tags: permissions, camera, location, dialogs, ios, android
---

## Configure permissions on launch

By default, Maestro grants app permissions unless you override them.

```yaml
- launchApp:
    clearState: true
    permissions:
      all: deny
      camera: allow
      location: allow
      notifications: deny
```

## Change permissions mid-flow

Use `setPermissions` when the app is already running:

```yaml
- setPermissions:
    permissions:
      camera: allow
      microphone: allow
```

## Browser limitation

Maestro permission APIs apply to **iOS and Android apps**, not Chrome/browser permissions.

## Available permission names

| Permission | iOS | Android |
|---|---|---|
| `bluetooth` | ❌ | ✅ |
| `calendar` | ✅ | ✅ |
| `camera` | ✅ | ✅ |
| `contacts` | ✅ | ✅ |
| `health` | ❌ | ❌ |
| `homekit` | ✅ | ❌ |
| `location` | ✅ | ✅ |
| `medialibrary` | ✅ | ✅ |
| `microphone` | ✅ | ✅ |
| `motion` | ✅ | ❌ |
| `notifications` | ✅ | ✅ |
| `phone` | ❌ | ✅ |
| `photos` | ✅ | ❌ |
| `reminders` | ✅ | ❌ |
| `siri` | ✅ | ❌ |
| `sms` | ❌ | ✅ |
| `speech` | ✅ | ❌ |
| `storage` | ❌ | ✅ |
| `usertracking` | ✅ | ❌ |

Use `all` to target all app permissions.

## Permission values

| Value | Meaning |
|---|---|
| `allow` | Grant the permission |
| `deny` | Deny the permission |
| `unset` | Reset permission state so the OS can prompt again |

## iOS-specific values

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

## Platform differences

### iOS

- System permission dialogs are auto-handled only on **English-language simulators**
- For notifications, iOS still shows the system prompt and Maestro auto-taps **Allow**
- Manually tapping system permission dialog buttons is not the normal strategy; prefer explicit permission configuration

### Android

- Permission dialogs can be interacted with using regular Maestro commands like `tapOn`
- Standardized names like `bluetooth` can map to multiple Android permissions automatically

Android dialog example:

```yaml
- launchApp:
    permissions:
      camera: deny

- tapOn:
    id: "request_camera_button"

- tapOn: "While using the app"
- assertVisible: "Camera ready"
```

## Custom Android permissions

Use the full Android permission string when a permission is not covered by the standardized names.

```yaml
- setPermissions:
    permissions:
      com.android.voicemail.permission.ADD_VOICEMAIL: allow
```

### Special Android permissions

Some permissions are special OS-level permissions rather than simple runtime prompts. A common example is:

```yaml
- launchApp:
    clearState: true
    permissions:
      android.permission.MANAGE_EXTERNAL_STORAGE: deny
```

## Practical patterns

### Deny all, allow a few

```yaml
- launchApp:
    permissions:
      all: deny
      medialibrary: allow
```

### Revoke mid-test

```yaml
- setPermissions:
    permissions:
      location: deny
```

### Reset so the app prompts again

```yaml
- setPermissions:
    permissions:
      camera: unset
```

## Best practices

1. Prefer explicit launch-time permission setup over tapping system dialogs
2. Use `clearState: true` when re-testing first-run permission behavior
3. On iOS, keep simulator language English when relying on auto-handled prompts
4. On Android, match the exact dialog text shown by that OS version when tapping prompts
