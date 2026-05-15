---
name: repeat-retry
description: Repeat and retry patterns, including smart loops (times + while combined)
metadata:
  tags: repeat, retry, loop, flaky, smart-loop
---

## repeat

Execute commands multiple times:

### Fixed Iterations

```yaml
- repeat:
    times: 3
    commands:
      - tapOn: "Next"
      - takeScreenshot: "slide_${maestro.repeating.index}"
```

### Access Index

Use `${maestro.repeating.index}` (0-based):

```yaml
- repeat:
    times: 5
    commands:
      - tapOn:
          id: "item_${maestro.repeating.index}"
```

### While Visible

Repeat until element disappears:

```yaml
- repeat:
    while:
      visible: "Load More"
    commands:
      - tapOn: "Load More"
      - extendedWaitUntil:
          notVisible: "Loading..."
          timeout: 5000
```

### While Not Visible

Repeat until element appears:

```yaml
- repeat:
    while:
      notVisible: "Empty State"
    commands:
      - tapOn:
          id: "delete_item"
      - waitForAnimationToEnd
```

### While JavaScript Condition

```yaml
- evalScript: ${output.attempt = 0}
- repeat:
    while:
      true: ${output.attempt < 3}
    commands:
      - tapOn: "Refresh Data"
      - evalScript: ${output.attempt++}
```

### Smart Loop (times + while combined)

Safety net: loop terminates when condition is met OR max iterations reached:

```yaml
- repeat:
    times: 10
    while:
      visible: "Update available"
    commands:
      - tapOn: "Dismiss"
      - assertNotVisible: "Dismiss"
```

## retry

Retry a block of commands on failure (`maxRetries` must be 0–3, defaults to 1):

```yaml
- retry:
    maxRetries: 3
    commands:
      - tapOn: "Retry Connection"
      - extendedWaitUntil:
          visible: "Connected"
          timeout: 5000
```

You can also reference an external flow file instead of inline commands:

```yaml
- retry:
    maxRetries: 2
    file: subflows/retry_logic.yaml
```

### With Condition

```yaml
- retry:
    maxRetries: 3         # maxRetries is 0–3 (official limit)
    onlyIf:
      visible: "Error"
    commands:
      - tapOn: "Try Again"
```

## Common Patterns

### Clear All Notifications

```yaml
- repeat:
    while:
      visible: "Notification"
    commands:
      - swipe:
          direction: RIGHT
          element: "Notification"
```

### Delete All Items

```yaml
- repeat:
    while:
      visible: "Delete"
    commands:
      - tapOn: "Delete"
      - tapOn: "Confirm"
      - waitForAnimationToEnd
```

### Retry Network Operation

```yaml
- retry:
    maxRetries: 3
    commands:
      - tapOn: "Fetch Data"
      - extendedWaitUntil:
          visible: "Data Loaded"
          timeout: 10000
```

### Pagination Loop

```yaml
- repeat:
    while:
      visible: "Next Page"
    commands:
      - tapOn: "Next Page"
      - waitForAnimationToEnd
```

## Combining repeat and retry

```yaml
- repeat:
    times: 5
    commands:
      - retry:
          maxRetries: 2
          commands:
            - tapOn:
                id: "item_${maestro.repeating.index}"
            - assertVisible: "Item Details"
      - back
```

## Best Practices

1. **Set reasonable limits** — prevent infinite loops with max iterations
2. **Add waits in loops** — allow UI to update between iterations
3. **Use `while: { visible: ... }` for dynamic content** — adapts to changing UI state
4. **Use smart loops** — combine `times` + `while` for safety
5. **Take screenshots in loops** — debug issues visually
6. **Add waitForAnimationToEnd in fast loops** — ensure UI stability
