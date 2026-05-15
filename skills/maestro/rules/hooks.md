---
name: hooks
description: onFlowStart and onFlowComplete hooks for setup and teardown automation
metadata:
  tags: hooks, lifecycle, setup, teardown, before, after
---

## Overview

Hooks provide setup and teardown logic that runs automatically for every flow. Instead of manually adding `runFlow` to the start or end of every file, declare hooks in the flow header.

| Hook | When it runs | Use for |
|---|---|---|
| `onFlowStart` | Before every flow begins | Logging in, resetting state, handling permissions |
| `onFlowComplete` | After every flow finishes (pass or fail) | Logging out, clearing data, navigating to home |

## Basic Usage

Add hooks to the header section (above `---`):

```yaml
# flow.yaml
appId: com.example.app

onFlowStart:
  - runFlow: subflows/setup.yaml

onFlowComplete:
  - runFlow: subflows/teardown.yaml
---
- launchApp
# ... test steps
```

## Hook Subflows

Create reusable setup/teardown subflows:

```yaml
# subflows/setup.yaml
---
- launchApp:
    clearState: true
- runFlow:
    when:
      notVisible: "Dashboard"
    file: subflows/login.yaml
```

```yaml
# subflows/teardown.yaml
---
- runFlow:
    when:
      visible: "Dashboard"
    commands:
      - tapOn: "Logout"
- stopApp
```

## Passing Parameters to Hooks

Hooks support environment variables like any `runFlow`:

```yaml
appId: com.example.app

onFlowStart:
  runFlow:
    file: subflows/login.yaml
    env:
      ROLE: "admin"
      USERNAME: ${MAESTRO_TEST_USER}
---
- launchApp
```

## Conditional Cleanup

Use `when` to run hook steps only when needed:

```yaml
onFlowComplete:
  - runFlow:
      when:
        visible: "Dashboard"
      commands:
        - tapOn: "Menu"
        - tapOn: "Logout"
```

## Failure Behavior

| Scenario | Result |
|---|---|
| `onFlowStart` fails | Flow marked **Failed** immediately. Main body **skipped**. `onFlowComplete` still runs. |
| `onFlowComplete` fails | Flow marked **Failed**, even if the main body passed. |

This matches industry-standard frameworks like JUnit (`@Before`/`@After`) and XCTest (`setUp`/`tearDown`).

## Best Practices

1. **Keep hooks fast** — they run for every flow; a slow hook multiplies across the suite
2. **Avoid infinite loops** — don't call a flow from a hook that itself triggers the same hook
3. **Use platform conditions** — run platform-specific cleanup only when applicable
4. **Leave the app in a neutral state** — `onFlowComplete` should reset for the next test
5. **Handle missing elements gracefully** — use `optional: true` or `when: visible` in cleanup

## Common Patterns

### Always-login hook

```yaml
onFlowStart:
  - runFlow:
      file: subflows/login.yaml
      env:
        USERNAME: ${MAESTRO_TEST_USER || 'test@example.com'}
```

### Reset to home screen

```yaml
onFlowComplete:
  - runFlow:
      when:
        visible: "Back"
      commands:
        - repeat:
            while:
              visible: "Back"
            commands:
              - tapOn: "Back"
```

### Platform-specific cleanup

```yaml
onFlowComplete:
  - runFlow:
      when:
        platform: iOS
      commands:
        - clearKeychain
```

### API-based teardown

```yaml
onFlowComplete:
  - runScript:
      file: scripts/cleanup_test_data.js
```
