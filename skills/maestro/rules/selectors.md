---
name: selectors
description: Core selectors, relational selectors, traits, state selectors, and dimension matchers for stable Maestro element targeting
metadata:
  tags: selectors, id, text, css, point, relational, traits, dimensions
---

## Core selectors

### `text`

`text` matches visible text (and accessibility labels where applicable). `text` is regex-based by default.

```yaml
- tapOn: "Login"
- tapOn:
    text: ".*Continue.*"
- assertVisible: Submit
```

### `id`

Use `id` for technical identifiers such as `resource-id` or `accessibilityIdentifier`. `id` is also regex-based.

```yaml
- tapOn:
    id: "login_button"
- assertVisible:
    id: "header_icon"
```

### `index`

Use `index` when multiple elements match the same selector. It is 0-based.

```yaml
- tapOn:
    id: "buy_button"
    index: 2
```

### `css` (web only)

```yaml
- tapOn:
    css: ".secondaryButton"
- assertVisible:
    css: "#main-header"
```

### `point`

```yaml
- tapOn:
    point: "50%, 50%"
- tapOn:
    point: "100, 250"
```

## Compound selectors

Multiple selector properties use **AND** logic.

```yaml
- tapOn:
    id: "submit_button"
    enabled: true
    below: Password
```

## Relational selectors

### Positional selectors

```yaml
# Below another element
- tapOn:
    below: Email

# Above another element
- tapOn:
    above: Checkout

# Left / right of an anchor
- tapOn:
    leftOf: "I agree to the terms"

- tapOn:
    rightOf:
      id: "input_text"
```

These selectors work from screen bounds, so combine them with `id`, `text`, or state selectors when the screen has many similar elements.

### Parent / child selectors

```yaml
# Match a parent with a direct child
- tapOn:
    containsChild:
      text: "Order 12345"

# Match a child inside a specific parent
- tapOn:
    text: Delete
    childOf:
      id: basket_container

# Match a container containing multiple descendants
- assertVisible:
    id: list_item
    containsDescendants:
      - text: Wireless Headphones
      - text: "$99.99"
```

## Traits

Traits are useful when text or IDs are not enough.

| Trait | Meaning |
|---|---|
| `traits: text` | Any element containing text |
| `traits: long-text` | An element with at least 200 characters |
| `traits: square` | An element whose width/height are within ~3% |

Examples:

```yaml
- tapOn:
    traits: text
```

```yaml
- assertVisible:
    traits: long-text
```

```yaml
- tapOn:
    traits: square
    rightOf: Home
```

## State selectors

| Selector | Meaning |
|---|---|
| `enabled` | Element is interactive |
| `checked` | Checkbox / switch / radio state |
| `focused` | Element currently has keyboard focus |
| `selected` | Selected tab / item / segmented control |

Examples:

```yaml
- assertVisible:
    id: login_button
    enabled: false
```

```yaml
- tapOn:
    text: Profile
    selected: true
```

## Dimension matchers

Use dimensions when an element is best identified by size.

| Selector | Meaning |
|---|---|
| `width` | Exact width in pixels |
| `height` | Exact height in pixels |
| `tolerance` | Allowed variance in pixels |

```yaml
- assertVisible:
    id: settings_icon
    width: 48
    height: 48
    tolerance: 2
```

## Platform-specific ID sources

| Platform | ID source |
|---|---|
| Flutter | `Semantics.identifier` or `semanticsLabel` |
| React Native | `testID` or `accessibilityLabel` |
| iOS native | `accessibilityIdentifier` |
| Android native | `resource-id` |
| Android Compose | `Modifier.semantics { testTagsAsResourceId = true }` |
| Web | `data-testid` or `id` attribute |

## Important note about `optional`

`optional` is a **command attribute**, not a selector type. Use it on commands like `tapOn`, `assertVisible`, `assertWithAI`, etc. to let a flow continue when that command fails.

## Best practices

1. Prefer user-visible `text` for readability when the content is stable
2. Prefer `id` for localized apps, icons, or dynamic content
3. Use relational selectors when the target has no stable unique identifier
4. Add state selectors like `enabled: true` when timing matters
5. Use traits / dimensions sparingly and combine them with other selectors for stability
