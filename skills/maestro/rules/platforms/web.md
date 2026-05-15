---
name: web
description: Chromium-based web testing with Maestro using `url`, CSS selectors, headless mode, and browser-state handling
metadata:
  tags: web, browser, chromium, desktop, url, headless, css
---

## Web testing overview

Maestro supports desktop browser testing for web apps using the same YAML-style flows used for mobile. Web support is currently **Beta**.

Use `url` instead of `appId`:

```yaml
url: https://example.com
---
- launchApp
- tapOn: "Sign In"
- assertVisible: "Dashboard"
```

## Running web tests

```bash
# Standard
maestro test web_flow.yaml

# Explicit web platform
maestro -p web test web_flow.yaml

# Headless mode
maestro test --headless web_flow.yaml

# Headless with size
maestro test --headless --screen-size=1920x1080 web_flow.yaml
```

On first run, Maestro downloads a managed Chromium build automatically.

## Element targeting on web

### Text selectors

```yaml
- tapOn: "Login"
- assertVisible: "Welcome"
```

### Stable IDs / test attributes

```yaml
- tapOn:
    id: "login-button"
```

Typical HTML sources for stable IDs include `data-testid` and `id` attributes.

### CSS selectors

```yaml
- tapOn:
    css: "form input[type='email']"
- assertVisible:
    css: "#main-header"
```

## Browser state behavior

Browser state (cookies, local storage, etc.) is retained between flows in the same run unless it is cleared.

Use `clearState` to clear state by origin:

```yaml
- clearState
```

Or reset during launch:

```yaml
- launchApp:
    clearState: true
```

## Deep links and navigation

```yaml
- openLink: "https://example.com/dashboard"
- back
```

## Detecting Maestro in the app

Maestro injects `window.maestro` while a web test is running:

```javascript
if (window.maestro) {
  console.log('Running under Maestro');
}
```

## Maestro Studio and web

Use the **Maestro Studio desktop app** for visual web inspection and authoring. Do not invent a `maestro -p web studio` CLI command.

## Web-specific notes

- Browser engine: **Chromium only**
- Web support is still **Beta**
- Flutter Web usually needs semantics / accessibility setup to be discoverable
- `hideKeyboard` is effectively a no-op on web
- Chrome permissions are not controlled through Maestro’s mobile permission APIs

## Example flow

```yaml
url: https://demo.example.com
env:
  EMAIL: test@example.com
  PASSWORD: demo123
---
- launchApp
- tapOn: "Sign In"
- tapOn:
    css: "input[name='email']"
- inputText: ${EMAIL}
- tapOn:
    css: "input[name='password']"
- inputText: ${PASSWORD}
- tapOn:
    css: "button[type='submit']"
- assertVisible: "Dashboard"
```
