---
name: waiting
description: extendedWaitUntil, waitForAnimationToEnd, timeout guidelines
metadata:
  tags: wait, timeout, animation, loading
---

## extendedWaitUntil

Wait for an element with custom timeout (default is ~5 seconds):

```yaml
# Wait for visible
- extendedWaitUntil:
    visible: "Dashboard"
    timeout: 15000                   # 15 seconds (in ms)

# Wait for not visible
- extendedWaitUntil:
    notVisible: "Loading..."
    timeout: 10000

# Optional — don't fail if timeout expires
- extendedWaitUntil:
    visible: "Optional Element"
    timeout: 5000
    optional: true
```

## waitForAnimationToEnd

Wait for all UI animations to complete before proceeding:

```yaml
- tapOn: "Animate"
- waitForAnimationToEnd
- assertVisible: "Animation Complete"

# With custom timeout
- waitForAnimationToEnd:
    timeout: 5000           # Max 5 seconds
```

Use after page transitions, modal open/close, loading spinners, content refresh.

## Common Patterns

### Wait for Loading

```yaml
- tapOn: "Load Data"
- extendedWaitUntil:
    visible: "Loading..."
    timeout: 3000
    optional: true          # May appear instantly
- extendedWaitUntil:
    notVisible: "Loading..."
    timeout: 30000          # Wait for it to finish
- assertVisible: "Data loaded"
```

### Wait and Assert

```yaml
- tapOn: "Submit"
- extendedWaitUntil:
    visible: "Success"
    timeout: 10000
- assertVisible: "Success"
```

### Slow Network Handling

```yaml
- launchApp
- extendedWaitUntil:
    visible: "Home"
    timeout: 30000          # Long timeout for slow networks
```

### After Navigation

```yaml
- tapOn: "Next Page"
- waitForAnimationToEnd
- extendedWaitUntil:
    visible: "Page Title"
    timeout: 5000
- assertVisible: "Page Title"
```

### In Loops

```yaml
- repeat:
    while:
      visible: "Load More"
    commands:
      - tapOn: "Load More"
      - extendedWaitUntil:
          notVisible: "Loading..."
          timeout: 5000
      - waitForAnimationToEnd
```

## Timeout Guidelines

| Scenario | Recommended Timeout |
|---|---|
| Page/navigation transition | 5,000–10,000 ms |
| API response | 10,000–15,000 ms |
| File upload | 30,000–60,000 ms |
| Login/Auth | 10,000–15,000 ms |
| App launch | 15,000–30,000 ms |

## Driver Startup Timeout (CLI)

If Maestro times out waiting for the driver on CI:

```bash
export MAESTRO_DRIVER_STARTUP_TIMEOUT=180000   # 3 minutes
```

Default: 15,000 ms.

## Best Practices

1. **Use reasonable timeouts** — too short = flaky, too long = slow
2. **Combine with assertions** — wait then verify
3. **Handle loading states** — wait for loading to appear AND disappear
4. **Use waitForAnimationToEnd** — after transitions, before interacting
5. **Use optional for non-critical waits** — prevents false failures
