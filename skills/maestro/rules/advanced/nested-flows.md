---
name: nested-flows
description: Reusable subflows with runFlow command and parameter passing
metadata:
  tags: subflows, runFlow, reusable, modular
---

## What are Subflows?

Subflows are reusable test files that can be called from other flows. They help reduce code duplication, create modular test suites, and share common steps like login or navigation.

## Basic Usage

### Create a Subflow

```yaml
# subflows/login.yaml
appId: com.example.myApp
env:
  USERNAME: ${USERNAME || 'default@example.com'}
  PASSWORD: ${PASSWORD || 'password123'}
---
- tapOn:
    id: "email_field"
- inputText: ${USERNAME}
- tapOn:
    id: "password_field"
- inputText: ${PASSWORD}
- hideKeyboard
- tapOn:
    id: "login_button"
- assertVisible: "Dashboard"
```

### Call the Subflow

```yaml
# main_test.yaml
appId: com.example.myApp
---
- launchApp:
    clearState: true

- runFlow:
    file: subflows/login.yaml
    env:
      USERNAME: myuser@example.com
      PASSWORD: mypassword

- tapOn: "Settings"
```

### Inline Subflow with Label

Use `commands` for inline steps instead of a separate file. Add a `label` for readability in reports:

```yaml
- runFlow:
    label: "Sort alphabetically"
    commands:
      - tapOn:
          id: sort_icon
      - tapOn: "A-Z"
      - tapOn: "Apply"
```

## Passing Parameters

Override subflow defaults:

```yaml
- runFlow:
    file: subflows/login.yaml
    env:
      USERNAME: admin@example.com
      PASSWORD: adminpass
```

## Conditional Subflows

Run only when condition is met:

```yaml
- runFlow:
    when:
      visible: "Login"
    file: subflows/login.yaml
```

## Inline Commands

Run commands inline without a separate file:

```yaml
- runFlow:
    when:
      visible: "Cookie Banner"
    commands:
      - tapOn: "Accept"
```

## Parameter Scope

Parameters flow from parent to child:

```yaml
# main_flow.yaml
env:
  BASE_URL: https://example.com
---
- runFlow:
    file: child_flow.yaml
    # child inherits BASE_URL
```

Child can override:

```yaml
# child_flow.yaml
env:
  BASE_URL: ${BASE_URL || 'https://default.com'}
```

## Directory Structure

```
e2e/
├── flows/
│   ├── auth/
│   │   ├── login_success.yaml
│   │   └── login_invalid.yaml
│   └── checkout/
│       └── complete_purchase.yaml
└── subflows/
    ├── login.yaml
    ├── navigate_to_cart.yaml
    └── fill_address.yaml
```

## Common Subflows

### Login

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
    id: "login_button"
```

### Navigation

```yaml
# subflows/navigate_to_settings.yaml
---
- tapOn:
    id: "menu_button"
- tapOn: "Settings"
- assertVisible: "Settings"
```

### Logout

```yaml
# subflows/logout.yaml
---
- tapOn:
    id: "menu_button"
- scroll
- tapOn: "Logout"
- assertVisible: "Login"
```

### With JavaScript

Combine subflows with scripts for data-driven testing:

```yaml
# main flow
- evalScript: ${output.items = ["Headphones", "Charger", "Phone Case"]}
- evalScript: ${output.index = 0}

- repeat:
    while:
      true: ${output.index < output.items.length}
    commands:
      - runFlow:
          file: subflows/add_item.yaml
          env:
            PRODUCT_NAME: ${output.items[output.index]}
      - evalScript: ${output.index++}

- tapOn: "Cart"
- assertVisible: "3 Items"
```

## Subflow Best Practices

1. **Single responsibility** — each subflow does one thing
2. **Use parameters** — make subflows configurable via env
3. **Include assertions** — verify expected state at the end
4. **Organize in folders** — group by feature or type
5. **Document dependencies** — note required parameters
