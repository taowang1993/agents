---
name: parameters
description: Environment variables, external params with -e flag, ${} syntax, defaults, and parameter scope
metadata:
  tags: parameters, env, variables, external, cli, scope
---

## Inline Parameters

Define in the flow header:

```yaml
appId: com.example.myApp
env:
  USERNAME: test@example.com
  PASSWORD: secret123
  API_URL: https://api.example.com
---
- inputText: ${USERNAME}
```

## External Parameters (CLI)

Pass values when running tests:

```bash
maestro test -e USERNAME=john@example.com -e PASSWORD=mypassword flow.yaml
```

## Default Values

Use JavaScript logical OR for defaults:

```yaml
env:
  USERNAME: ${USERNAME || 'default@example.com'}
  TIMEOUT: ${TIMEOUT || 5000}
```

If `USERNAME` is passed via CLI, it's used. Otherwise, default applies.

## Shell Environment Variables

Variables prefixed with `MAESTRO_` are automatically available **when running through the Maestro CLI**:

```bash
export MAESTRO_API_KEY=abc123
# Accessible as ${MAESTRO_API_KEY} in flows
```

This CLI shell-environment behavior does **not** apply the same way inside Maestro Studio environments; Studio has its own environment management UI.

## Using Parameters

### In Text Input

```yaml
- inputText: ${USERNAME}
```

### In Assertions

```yaml
- assertVisible: "Welcome, ${USERNAME}"
```

### In JavaScript

```yaml
- evalScript: |
    const url = '${API_URL}/users';
    output.fullUrl = url;
```

### In Subflows

```yaml
- runFlow:
    file: login.yaml
    env:
      USERNAME: admin@example.com
      PASSWORD: admin123
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

## CI/CD Pattern

```yaml
# flow.yaml
appId: com.example.myApp
env:
  USERNAME: ${USERNAME}
  PASSWORD: ${PASSWORD}
  ENV: ${ENV || 'staging'}
---
# tests...
```

```bash
# CI pipeline
maestro test \
  -e USERNAME=$CI_TEST_USER \
  -e PASSWORD=$CI_TEST_PASSWORD \
  -e ENV=production \
  flow.yaml
```

## Built-in Parameters

Maestro provides these parameters automatically in all flows:

| Parameter | Description |
|---|---|
| `MAESTRO_FILENAME` | Filename of the current flow (e.g., `login.yaml`) |
| `MAESTRO_DEVICE_UDID` | Identifier for the device under test |
| `MAESTRO_SHARD_ID` | Shard number, 1-based (default: 1 when not sharding) |
| `MAESTRO_SHARD_INDEX` | Shard number, 0-based (default: 0 when not sharding) |

```yaml
- evalScript: ${output.flowName = MAESTRO_FILENAME}
- tapOn: "Run on ${MAESTRO_SHARD_ID}"
```

## Security

Never commit sensitive values in flow files:

```yaml
# ❌ Bad
env:
  API_KEY: sk_live_abc123

# ✅ Good
env:
  API_KEY: ${API_KEY}
```

Pass securely via CI secrets or environment variables.
