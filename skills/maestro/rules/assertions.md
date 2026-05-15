---
name: assertions
description: Visibility assertions, JavaScript assertions, AI-powered assertions, screenshot comparisons, and AI text extraction
metadata:
  tags: assertions, assert, visible, not-visible, ai, screenshot
---

## `assertVisible`

`assertVisible` is Maestro’s default way to wait for UI content. If the element is not visible yet, Maestro retries for up to **7 seconds** before failing.

```yaml
- assertVisible: "Welcome"

- assertVisible:
    id: "dashboard_header"

- assertVisible:
    text: "Loading complete"
    enabled: true
```

Use `extendedWaitUntil` first when the user expects the wait to exceed the default 7-second window.

## `assertNotVisible`

`assertNotVisible` also retries for up to **7 seconds**, which makes it ideal for waiting for spinners, banners, or modals to disappear.

```yaml
- assertNotVisible: "Loading..."

- assertNotVisible:
    id: "loading_spinner"
```

## `assertTrue`

Use `assertTrue` for custom logic that is easier to express in JavaScript.

```yaml
- assertTrue: ${count > 0}
```

Expanded form:

```yaml
- assertTrue:
    condition: ${output.viewA == output.viewB}
    label: "View A and View B show the same text"
```

## AI-powered assertions

These commands are **experimental** and use Maestro-managed AI services.

### Important default behavior

For AI commands, `optional` defaults to **`true`**. If the user wants the flow to fail when the AI check fails, set `optional: false` explicitly.

### `assertWithAI`

Use natural language to describe the expected screen state:

```yaml
- assertWithAI:
    assertion: "The shopping cart shows 3 items"
```

Force failure on mismatch:

```yaml
- assertWithAI:
    assertion: "A six-digit two-factor code prompt is visible"
    optional: false
```

### `assertNoDefectsWithAI`

Use this as a visual smoke test for overlap, truncation, spacing, or obvious layout defects:

```yaml
- assertNoDefectsWithAI
```

Make it strict if needed:

```yaml
- assertNoDefectsWithAI:
    optional: false
```

## `assertScreenshot`

Use `assertScreenshot` for visual regression testing against a saved reference image.

```yaml
- assertScreenshot: splash.png
```

Expanded form:

```yaml
- assertScreenshot:
    path: dashboard.png
    cropOn:
      id: main_content
    thresholdPercentage: 98
    label: "Verify dashboard layout"
```

## `extractTextWithAI`

This command extracts a requested value from the current screen.

### Default output variable

If you do not specify `outputVariable`, Maestro stores the result in **`aiOutput`**.

```yaml
- extractTextWithAI: CAPTCHA value
- inputText: ${aiOutput}
```

### Custom output variable

```yaml
- extractTextWithAI:
    query: "What is the total price shown?"
    outputVariable: "totalPrice"
    optional: false
- inputText: ${totalPrice}
```

## Authentication for AI features

AI assertions and AI extraction require Maestro authentication.

Use either:

```bash
maestro login
```

or:

```bash
export MAESTRO_CLOUD_API_KEY=<your_key>
```

## AI artifacts

AI commands generate HTML / JSON artifacts in the run output directory. These are useful when the user wants to inspect what the AI saw or why a check failed.

## Practical patterns

### Wait for loading to finish, then assert content

```yaml
- assertVisible: "Loading..."
- assertNotVisible: "Loading..."
- assertVisible: "Dashboard"
```

### Store copied UI text, then assert on it

```yaml
- copyTextFrom:
    id: "price_label"
- evalScript: ${output.price = maestro.copiedText}
- assertTrue:
    condition: ${output.price.startsWith("$")}
    label: "Price starts with a dollar sign"
```

### Use screenshot assertions on a focused region only

```yaml
- assertScreenshot:
    path: banner.png
    cropOn:
      id: promo_banner
```

## Best practices

1. Prefer normal selectors before AI when stable IDs or text exist
2. Use `optional: false` for AI checks only when the user truly wants them to gate the run
3. Use `assertVisible` / `assertNotVisible` as the default waiting strategy
4. Use `assertTrue` when comparing copied text, output variables, or computed values
5. Use cropped screenshot assertions to reduce flaky full-screen comparisons
