---
name: test-structure
description: YAML test structure, appId/env/tags, config.yaml workspace, sequential execution, and test discovery
metadata:
  tags: yaml, structure, appId, env, flow, config, workspace, tags, discovery
---

## Basic Flow Structure

Every Maestro flow is a YAML file with two sections separated by `---`:

```yaml
# Header section (metadata)
appId: com.example.myApp
name: Login Flow
env:
  USERNAME: test@example.com
  PASSWORD: secret123
tags:
  - smoke
  - auth
---
# Flow section (test steps)
- launchApp
- tapOn: "Login"
- assertVisible: "Dashboard"
```

## Header Properties

| Property | Description | Example |
|---|---|---|
| `appId` | Bundle ID for mobile apps | `com.example.myApp` |
| `url` | Starting URL for web tests | `https://example.com` |
| `name` | Flow name (display and sequential execution) | `"Login Flow"` |
| `env` | Environment variables with `${}` access | See below |
| `tags` | Categorization tags for filtering | `[smoke, auth]` |
| `properties` | Custom JUnit report metadata | `{ testCaseId: "TC-101" }` |
| `onFlowStart` | Hook: runs before the flow | See [hooks.md](../hooks.md) |
| `onFlowComplete` | Hook: runs after the flow | See [hooks.md](../hooks.md) |

## Tags

Add tags to categorize flows for selective execution:

```yaml
appId: com.example.app
tags:
  - smoke
  - registration
---
- launchApp
```

Filter at runtime:

```bash
# Run only smoke tests
maestro test --include-tags=smoke e2e/

# Skip WIP tests
maestro test --exclude-tags=wip e2e/

# OR logic within a flag (comma-separated)
maestro test --include-tags="auth,checkout" e2e/

# AND logic between flags
maestro test --include-tags=dev --exclude-tags=flaky e2e/
```

## Environment Variables

Define in header, access with `${VAR}` syntax:

```yaml
env:
  API_URL: https://api.example.com
  USERNAME: ${USERNAME || 'default@example.com'}  # Default with fallback
---
- inputText: ${USERNAME}
```

Pass externally:

```bash
maestro test -e USERNAME=john@example.com -e PASSWORD=secret flow.yaml
```

Shell env vars prefixed with `MAESTRO_` are automatically available:

```bash
export MAESTRO_API_KEY=abc123
# Accessible as ${MAESTRO_API_KEY} in flows
```

## Flow Naming Convention

Use descriptive, snake_case names:

```
{feature}_{action}.yaml

login_success.yaml
login_invalid_credentials.yaml
register_new_user.yaml
dashboard_navigation.yaml
checkout_complete_purchase.yaml
```

## config.yaml — Workspace Configuration

For projects with multiple flows, create a `config.yaml` at the root (or in `.maestro/`). This centralizes test discovery, filtering, ordering, and platform settings.

Note: Maestro Studio does not use `config.yaml` the same way the CLI does for local Studio execution, though Studio can include the file when uploading a full workspace to Maestro Cloud.

### Test Discovery

Use glob patterns to control which flow files are included:

```yaml
# config.yaml
flows:
  - "*"              # Default: only root-level .yaml files
  - "auth/*"         # All files in auth/ subfolder
  - "tests/**"       # Recursive: all files in tests/ and subfolders
```

### Global Tag Filters

Permanent include/exclude policies for the workspace:

```yaml
includeTags:
  - production_ready
excludeTags:
  - experimental
  - flaky
```

CLI flags override these global settings.

### Sequential Execution

Force specific flow ordering:

```yaml
executionOrder:
  continueOnFailure: false  # Stop if a step fails (default: true)
  flowsOrder:
    - signup_flow           # Run first
    - verify_email_flow     # Then this
    - complete_profile      # Then this
```

After the ordered sequence, remaining flows run in non-deterministic order.

### Platform Configuration

```yaml
platform:
  ios:
    snapshotKeyHonorModalViews: false  # Include background hierarchy
    disableAnimations: true            # (Cloud only) Reduce Motion
  android:
    disableAnimations: true            # (Cloud only) Disable system animations
```

### Cloud Configuration

```yaml
# config.yaml
baselineBranch: main
notifications:
  email:
    enabled: true
    recipients:
      - team@example.com
  slack:
    endpoint: https://hooks.slack.com/services/...
```

### Custom Output Directory

```yaml
testOutputDir: build/maestro-results
```

### Multiple Configs

Create different config files for different scenarios:

```bash
maestro test --config .maestro/ci-config.yaml tests/
maestro test --config .maestro/smoke-config.yaml tests/
```

### Full Example

```yaml
# config.yaml
flows:
  - "e2e/**"
includeTags:
  - production_ready
excludeTags:
  - experimental
executionOrder:
  continueOnFailure: false
  flowsOrder:
    - login_smoke
    - checkout_smoke
testOutputDir: build/maestro-results
baselineBranch: main
platform:
  ios:
    snapshotKeyHonorModalViews: false
  android:
    disableAnimations: true
```

## Multiple Flows in Directory

```bash
# Run all .yaml files (respects config.yaml discovery)
maestro test e2e/

# Run specific files
maestro test e2e/login.yaml e2e/signup.yaml
```

## Custom JUnit Properties

Add metadata to test reports:

```yaml
appId: com.example.app
name: Login Flow
properties:
    testCaseId: "TC-101"
    priority: "High"
    component: "Authentication"
---
- launchApp
```
