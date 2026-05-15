---
name: detect-maestro
description: Detecting Maestro at runtime in app code via launch arguments or window.maestro
metadata:
  tags: detect, runtime, launch-arguments, window, bypass, test-mode
---

## Why Detect Maestro?

Detecting when your app is running under Maestro lets you:

- **Bypass 2FA** — use fixed codes instead of physical SIM/email
- **Switch environments** — point to staging/mock servers
- **Disable analytics** — keep production data clean
- **Disable custom animations** — prevent "ghost taps" from non-standard animations
- **Keep short-lived content visible** — extend banner durations so Maestro can interact

## Mobile (iOS and Android)

The recommended approach is **launch arguments**. This is reliable, explicit, and works in both local and Maestro Cloud environments.

### Step 1: Pass the argument in your flow

```yaml
- launchApp:
    appId: "com.example.app"
    arguments:
      isMaestro: "true"
      mockServer: "https://staging.example.com"
```

### Step 2: Detect in your code

**Android (Kotlin/Java):**
```kotlin
val isMaestro = intent.getStringExtra("isMaestro") == "true"
if (isMaestro) {
    // Disable analytics, use mock data, bypass 2FA
    analytics.disable()
    apiClient.setBaseUrl(intent.getStringExtra("mockServer"))
}
```

**iOS (Swift):**
```swift
if ProcessInfo.processInfo.arguments.contains("isMaestro") {
    // Apply test-only configurations
    Analytics.shared.disable()
}
```

**React Native:**
```javascript
import { LaunchArguments } from 'react-native-launch-arguments';

if (LaunchArguments.value().isMaestro === "true") {
    // Test mode
}
```

**Flutter:**
```dart
import 'package:flutter_launch_arguments/flutter_launch_arguments.dart';

final fla = FlutterLaunchArguments();
final isMaestro = await fla.getString('isMaestro');
if (isMaestro == 'true') {
    // Test mode
}
```

### Deprecated: Port Checking

Previously, developers checked if ports `7001` (Android) or `22087` (iOS) were open. **This is now deprecated** — it's unsupported in Maestro Cloud and may be removed. Use launch arguments instead.

## Web

Maestro automatically defines `window.maestro` while a test is running. Check for it anywhere in your frontend code:

```javascript
if (window.maestro) {
    console.log("Maestro test is running!");
    // Disable analytics, bypass auth, etc.
}
```

No setup required — `window.maestro` is injected automatically for web tests.
