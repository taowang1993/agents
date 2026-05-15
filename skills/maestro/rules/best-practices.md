---
name: best-practices
description: Semantic identifiers, atomic tests, project structure, naming conventions
metadata:
  tags: best-practices, patterns, structure, naming
---

## Use Semantic Identifiers

Always add testable identifiers to UI elements — this is the most important practice for reliable tests.

### Flutter

```dart
Semantics(
  identifier: 'login_submit_button',
  child: ElevatedButton(...),
)
```

### React Native

```jsx
<TouchableOpacity testID="login_submit_button">
```

### iOS Native

```swift
button.accessibilityIdentifier = "login_submit_button"
```

### Android Native

```xml
android:contentDescription="login_submit_button"
```

### Web

```html
<button data-testid="login_submit_button">Submit</button>
```

## Naming Convention

Use snake_case with pattern: `{screen}_{element}_{type}`

```
login_email_field
login_password_field
login_submit_button
dashboard_profile_card
settings_logout_button
```

## Atomic Tests

Each test should be **independent** and **self-contained**:

```yaml
# ✅ Good - Independent, starts fresh
appId: com.example.app
---
- launchApp:
    clearState: true
- runFlow: subflows/login.yaml
- tapOn: "Settings"
- assertVisible: "Settings"

# ❌ Bad - Assumes app state from previous test
appId: com.example.app
---
- tapOn: "Settings"     # Assumes already logged in
```

## Use clearState

Always start with clean app state:

```yaml
- launchApp:
    clearState: true
```

## Project Structure

```
project/
├── .maestro/
│   └── config.yaml
├── e2e/
│   ├── flows/
│   │   ├── auth/
│   │   │   ├── login_success.yaml
│   │   │   ├── login_invalid.yaml
│   │   │   └── register.yaml
│   │   ├── checkout/
│   │   │   ├── add_to_cart.yaml
│   │   │   └── complete_purchase.yaml
│   │   └── profile/
│   │       └── update_profile.yaml
│   ├── subflows/
│   │   ├── login.yaml
│   │   ├── navigate_to_cart.yaml
│   │   └── fill_address.yaml
│   └── scripts/
│       ├── generate_user.js
│       └── cleanup_test_data.js
```

## Subflows for Reusability

Extract common patterns into subflows:

```yaml
# subflows/login.yaml
---
- tapOn:
    id: "email_field"
- inputText: ${USERNAME}
- tapOn:
    id: "password_field"
- inputText: ${PASSWORD}
- hideKeyboard
- tapOn:
    id: "submit_button"
- assertVisible: "Dashboard"
```

Use in flows:

```yaml
- runFlow:
    file: subflows/login.yaml
    env:
      USERNAME: test@example.com
```

## Always Hide Keyboard

Before tapping elements obscured by keyboard:

```yaml
- inputText: "password"
- hideKeyboard
- tapOn:
    id: "submit"
```

## Take Screenshots at Key Points

```yaml
- takeScreenshot: "01_before_action"
- tapOn: "Submit"
- takeScreenshot: "02_after_action"
```

## Use extendedWaitUntil for Async

```yaml
- tapOn: "Load Data"
- extendedWaitUntil:
    visible: "Data Loaded"
    timeout: 15000
```

## Handle Platform Differences

```yaml
- runFlow:
    when:
      platform: Android
    commands:
      - tapOn: "Allow"       # Android permission dialog
```

## Use Hooks for Setup/Teardown

```yaml
onFlowStart:
  - runFlow: subflows/login.yaml

onFlowComplete:
  - runFlow: subflows/reset.yaml
---
- launchApp
```

## Environment Variables for Secrets

```yaml
# Never hardcode credentials
env:
  USERNAME: ${USERNAME}
  PASSWORD: ${PASSWORD}
---
- inputText: ${USERNAME}
```

Pass via CLI:

```bash
maestro test -e USERNAME=test -e PASSWORD=secret flow.yaml
```

## Tag Your Tests

```yaml
tags:
  - smoke
  - auth
  - production_ready
```

Filter at runtime:

```bash
maestro test --include-tags=smoke e2e/
```

## Document Test Purpose

```yaml
# Test: Verify successful login with valid credentials
# Preconditions: None (uses clearState)
# Expected: User reaches Dashboard
appId: com.example.app
```

## Use config.yaml for Workspaces

```yaml
# .maestro/config.yaml
flows:
  - "e2e/**"
includeTags:
  - production_ready
excludeTags:
  - experimental
executionOrder:
  flowsOrder:
    - login_smoke
    - checkout_smoke
```

## Keep Flows Short

Each flow should test **one scenario**. Use subflows for shared steps, not as a way to cram multiple tests into one file.
