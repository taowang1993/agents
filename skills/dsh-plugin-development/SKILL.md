---
name: dsh-plugin-development
description: Build, port, configure, test, package, or publish DeepSeek Harness plugins using Cordis. Make sure to use this skill whenever work mentions DSH plugins, DeepSeek Harness extensions, cordis.yml or cordis.patch.yml, apply(ctx), DSH tools, Cordis services or events, capability seams, plugin lifecycle, HMR, installable DSH bundles, profile composition, or migrating a feature into TockTeam or another DSH distribution.
---

# DSH Plugin Development

Build the smallest plugin that owns one coherent capability. Verify every API against the target DSH checkout instead of relying on memory.

## Locate the Authoritative Checkout

Resolve `DSH_ROOT` in this order:

1. Use `$DSH_ROOT` when it points to a DeepSeek Harness checkout.
2. Use the current repository when it contains `docs/user/develop/basic/index.md`.
3. Use `/Users/max/projects/resources/.harness/dsh` on Max's machine.
4. Ask for the checkout path if none of these exists.

Confirm the documentation exists before coding:

```sh
test -f "$DSH_ROOT/docs/user/develop/basic/index.md"
```

When targeting TockTeam or another distribution, inspect its pinned DSH revision and active profile layers first. Implement against the target's installed API, not merely the newest source checkout.

## Read Only the Relevant Documentation

Read each selected page completely and follow its task-relevant links. Treat the checkout as the source of truth.

| Task | Read |
| --- | --- |
| Create a plugin | `docs/user/develop/basic/index.md` |
| Register a model-callable tool | `docs/user/develop/basic/tool.md`, then `docs/cookbook/adding-a-tool.md` for nontrivial tools |
| Accept configuration | `docs/user/develop/basic/config.md` |
| Package or install a plugin | `docs/user/develop/basic/publish.md` |
| Diagnose loading, unloading, or HMR | `docs/user/develop/framework/index.md` |
| Provide or consume a service | `docs/user/develop/framework/service.md` |
| Communicate through events | `docs/user/develop/framework/events.md` |
| Design a replaceable capability | `docs/user/develop/practice/index.md`, then `docs/capability-seams.md` |
| Implement an LLM provider | `docs/user/develop/practice/llm-adapter.md` and both shipped adapter implementations |
| Look up built-in services or events | `docs/subsystems/core.md` and the exported TypeScript interfaces |
| Confirm profile, layer, or CLI behavior | `apps/cli/reference/README.md` |

Do not read every page by default. Expand only when the current task crosses that boundary.

## Choose the Smallest Plugin Shape

Use a function plugin unless the capability itself must be exposed as a Cordis service:

```ts
import type { Context } from '@deepseek-ai/cordis'

export const name = 'my-plugin'

export function apply(ctx: Context) {
  // Register the capability here.
}
```

Use an object only when it improves package ergonomics. Extend `Service` only when other plugins need to inject the capability.

Keep one package when definition, provider, and consumer share the same dependencies, permissions, lifecycle, and release cadence. Split them only when a provider must be replaceable, a consumer can evolve independently, or a trust/runtime boundary requires separation.

## Implement Through Cordis

1. Declare required services in `inject`; let Cordis wait instead of adding readiness polling.
2. Use `ctx.get()` only for genuinely optional integrations.
3. Register tools, listeners, adapters, and child plugins through `ctx` so disposal removes them automatically.
4. Wrap sockets, processes, watchers, timers, and other external resources in `ctx.effect()` and return one complete disposer.
5. Put order-dependent asynchronous cleanup in one disposer and await its steps serially.
6. Export both a TypeScript `Config` type and a same-named Schemastery schema when deployments need configuration.
7. Put defaults and self-contained validation in the schema; fail plugin loading on invalid configuration.
8. Use typed Cordis declaration merging for public services and events.
9. Inspect the current tool, service, event, and adapter types before writing their contracts.
10. For tools, return the declared canonical value, render it separately, propagate the execution `AbortSignal`, and confirm the active tools mode exposes the intended call path.
11. Enforce authorization, path confinement, and read-only or network restrictions inside the provider that performs the operation. Treat every loaded host plugin as trusted same-process code; agent permission presets do not sandbox arbitrary plugin code.
12. When adding a built-in DSH capability family, regenerate and verify the repository-owned capability-seam catalog required by its documentation tooling.

Avoid manual cleanup for registrations Cordis already owns. Avoid polling for injected dependencies. Avoid splitting every feature into its own package.

## Develop Locally

Start with a source overlay before packaging:

```yaml
- insert:
    - id: my-plugin
      name: '/absolute/path/to/plugin/src/index.ts'
```

Run the relevant surface with the overlay, for example:

```sh
pnpm dsh web --patch /absolute/path/to/plugin/cordis.yml
```

Use absolute paths in scratch overlays because a patch does not change the profile's module-resolution directory. Inspect the composed configuration when row ordering or overrides matter.

## Package Only After the Capability Works

Package user-installable behavior as a bundle with the exact nested manifest shape below. Keep profiles separate: a bundle contributes a layer, while a profile orders bundles and boots the composition.

```json
{
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" }
  }
}
```

Verify bundle precedence in this order:

1. Profile bundle patches in declared order.
2. The profile's `cordis.patch.yml`.
3. `$DSH_HOME/cordis.patch.yml`.
4. Command-line `--patch` overlays in argument order.

Restate the entire row configuration when overriding a row because later `config` values replace rather than deep-merge earlier values.

For Git installs, ship a self-contained `prepare` build and explain pnpm's `allowBuilds` requirement. When pnpm blocks the build, copy the exact package key it reports into the profile's `pnpm-workspace.yaml` under `allowBuilds`, then rerun the install. Treat the allowance as permission to execute install-time code and pin a reviewed commit. Prefer prebuilt npm packages or tarballs when install-time execution is unnecessary.

Restart the profile after adding, removing, or updating a bundle.

## Verify the Lifecycle

Follow the target repository's test-first and quality-gate rules. Leave the smallest runnable regression check for nontrivial behavior.

Verify the applicable cases:

- Dump the composed configuration and confirm the expected bundle and row.
- Start the target surface and use its available diagnostics or lifecycle evidence to confirm the plugin loaded successfully.
- Exercise the registered tool, service, event, adapter, or UI contribution through its real consumer.
- Supply invalid configuration and confirm loading fails with an actionable error.
- Unload, disable, or hot-replace the plugin and confirm registrations and external resources disappear.
- Remove a required service and confirm the dependent plugin disposes; restore it and confirm reactivation.
- Install and remove the bundle from a disposable profile when distribution is in scope.
- Run the target repository's typecheck, focused tests, and required security checks.

Do not claim success from startup logs alone.

## Report the Result

Report:

- Plugin shape and why it is not split further.
- Services injected or provided.
- Configuration and trust boundaries.
- Exact verification commands and results.
- Any target-version constraint or remaining distribution risk.
