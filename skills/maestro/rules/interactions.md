---
name: interactions
description: Accurate interaction guidance for tapOn, text input, scroll, scrollUntilVisible, swipe, pressKey, and keyboard handling
metadata:
  tags: tap, input, scroll, swipe, gestures, keyboard, pressKey
---

## Tap interactions

### `tapOn`

```yaml
# By text
- tapOn: "Login"

# By ID
- tapOn:
    id: "submit_button"

# Repeat tap with delay
- tapOn:
    id: "plus_button"
    repeat: 5
    delay: 200

# Retry if the UI did not react to the first tap
- tapOn:
    text: "Next"
    retryTapIfNoChange: true

# Reduce settle wait after the tap
- tapOn:
    text: "Next"
    waitToSettleTimeoutMs: 2000

# Tap a specific coordinate
- tapOn:
    point: "50%,50%"
```

#### Key `tapOn` options

| Parameter | Type | Description |
|---|---|---|
| `repeat` | Integer | Number of taps |
| `delay` | Integer | Delay between repeated taps. Default: `100` |
| `retryTapIfNoChange` | Boolean | Retry when the first tap caused no visible UI change |
| `waitToSettleTimeoutMs` | Integer | Best-effort post-action settle timeout |
| `point` | String | Absolute or percentage coordinate |

### `doubleTapOn`

```yaml
- doubleTapOn: "Image to zoom"
- doubleTapOn:
    id: "zoomable_view"
    delay: 200
```

### `longPressOn`

`longPressOn` accepts the same selectors as `tapOn`.

```yaml
- longPressOn: "Item to delete"
- longPressOn:
    id: "context_menu_trigger"
- longPressOn:
    text: "A text with a hyperlink"
    point: "90%,50%"
```

## Text input

### `inputText`

`inputText` can type even if no field is focused, but explicitly focusing the intended input is usually more reliable.

```yaml
# Simple text
- inputText: "john@example.com"

# Expanded syntax with a label
- inputText:
    text: "john@example.com"
    label: "Enter the login email"

# Use variables
- inputText: ${USERNAME}
```

### Random input commands

```yaml
- inputRandomEmail
- inputRandomPersonName
- inputRandomNumber:
    length: 6
- inputRandomText:
    length: 12
```

### `eraseText`

```yaml
# Default clear (up to 50 chars)
- eraseText

# Remove a specific number of characters
- eraseText: 10
```

### `hideKeyboard`

```yaml
- tapOn:
    id: "password_field"
- inputText: "secret123"
- hideKeyboard
- tapOn:
    id: "submit_button"
```

Notes:

- On web, `hideKeyboard` is a no-op
- If dismissing the keyboard is flaky, tap a safe non-input element such as a header

## Hardware keys

### `pressKey`

```yaml
- pressKey: enter
- pressKey: home
- pressKey: backspace
- pressKey: volume up
- pressKey: lock

# Android-only examples
- pressKey: back
- pressKey: power
- pressKey: tab
```

Android TV / remote keys are also supported.

## Scrolling

### `scroll`

`scroll` is a simple vertical scroll with no arguments.

```yaml
- scroll
```

Use `scrollUntilVisible` or `swipe` when the user needs direction, target element logic, or finer control.

### `scrollUntilVisible`

```yaml
- scrollUntilVisible:
    element: "Footer"

- scrollUntilVisible:
    element:
      id: "load_more_button"
    direction: DOWN
    speed: 40
    timeout: 5000

- scrollUntilVisible:
    element: "Item 6"
    visibilityPercentage: 50

- scrollUntilVisible:
    element: "Item 6"
    centerElement: true
```

| Parameter | Meaning |
|---|---|
| `element` | Required selector to find |
| `direction` | `DOWN`, `UP`, `LEFT`, or `RIGHT` |
| `timeout` | Max wait in ms. Default: `20000` |
| `speed` | Scroll speed `0-100`. Default: `40` |
| `visibilityPercentage` | How much of the element must be visible. Default: `100` |
| `centerElement` | Keep scrolling until the element is comfortably inside the viewport |

## Swipe gestures

### `swipe`

```yaml
# Swipe by direction
- swipe:
    direction: LEFT

# Swipe by coordinates
- swipe:
    start: 90%, 50%
    end: 10%, 50%

# Swipe from a specific element
- swipe:
    from:
      id: "swipeable_card"
    direction: UP

# Slow swipe
- swipe:
    direction: UP
    duration: 1000
```

| Parameter | Meaning |
|---|---|
| `direction` | `LEFT`, `RIGHT`, `UP`, `DOWN` |
| `start` / `end` | Absolute or relative coordinates |
| `from` | Element selector used as the swipe starting point |
| `duration` | Swipe duration in ms. Default: `400` |
| `waitToSettleTimeoutMs` | Best-effort settle timeout after swipe |

## Common patterns

### Form fill

```yaml
- tapOn:
    id: "email_field"
- inputText: ${EMAIL}

- tapOn:
    id: "password_field"
- inputText: ${PASSWORD}

- hideKeyboard
- tapOn:
    id: "submit_button"
```

### Search flow

```yaml
- tapOn:
    id: "search_field"
- inputText: "Maestro"
- pressKey: enter
- assertVisible: "Results"
```

### Carousel navigation

```yaml
- repeat:
    times: 3
    commands:
      - swipe:
          direction: LEFT
      - waitForAnimationToEnd
```

### Drag-like motion via swipe

```yaml
- swipe:
    start: 50%, 20%
    end: 50%, 80%
    duration: 500
```
