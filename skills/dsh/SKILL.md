---
name: dsh
description: Build, port, configure, test, package, or publish DeepSeek Harness plugins using Cordis. Make sure to use this skill whenever work mentions DSH plugins, DeepSeek Harness extensions, cordis.yml or cordis.patch.yml, apply(ctx), DSH tools, Cordis services or events, capability seams, plugin lifecycle, HMR, installable DSH bundles, profile composition, or migrating a feature into TockTeam or another DSH distribution.
---

# DSH Plugin Development

Build the smallest plugin that owns one coherent capability. Verify every API against the target DSH checkout instead of relying on memory.

## Locate the Authoritative Checkout

Resolve `DSH_ROOT` in this order:

1. Use `$DSH_ROOT` when it points to a DeepSeek Harness checkout.
2. Use the target or current repository when it contains `docs/user/develop/basic/index.md`.
3. Otherwise, create a disposable shallow checkout:

```sh
DSH_ROOT="$(mktemp -d)/deepseek-harness"
git clone --depth 1 --filter=blob:none \
  https://github.com/deepseek-ai/deepseek-harness "$DSH_ROOT"
```

Confirm the documentation exists before coding:

```sh
test -f "$DSH_ROOT/docs/user/develop/basic/index.md"
```

Remove the disposable checkout after the task. When the target pins a DSH revision, inspect or fetch that revision instead of assuming the latest default branch is compatible.

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

## Set Up a New DSH Plugin Project

Complete the repository setup below whenever the user asks you to create a DSH plugin project. Do not make the user separately request agent instructions, Beads, or references.

Treat that explicit create-project request as authorization for new local files plus local Git and Beads state. Ask before deleting or replacing existing content, configuring a remote, pushing, or writing credentials.

Resolve contradictions in the requested project name or path before creating a lasting compatibility name. Otherwise, derive the path and a short stable Beads prefix as routine setup.

### Initialize the Repository and Beads

1. Inspect instructions in the target directory and its parents before writing.
2. Refuse to overwrite an existing non-empty project. Inspect and extend it instead.
3. Create the directory and initialize Git when needed:

```sh
mkdir -p /absolute/path/to/project
cd /absolute/path/to/project
git init -b main
```

4. Derive a short unique Beads prefix from the project name. Use the globally installed Beads skill and skip Beads-generated agent files:

```sh
bd init --non-interactive --prefix <prefix> --skip-agents
bd prime
bd where
test ! -e .agents/skills
```

Do not create, copy, or install a project-local skill during setup. Keep the Beads initialization as its own small commit when repository policy permits commits.

### Create Project Agent Instructions

Create project-specific `AGENTS.md` guidance with:

- the product contract and explicit non-goals;
- the authoritative target distribution and pinned DSH revision;
- source-of-truth and provenance paths;
- Host, client, trust, lifecycle, and package boundaries;
- local code style and test-first workflow;
- focused, full-gate, packaged, and real-consumer verification;
- Beads claim, handoff, and repository Git policy.

Keep the instructions client-neutral. Point agents to `bd prime` and the globally installed Beads skill instead of embedding or installing another skill. Create `CLAUDE.md` as a short pointer to `AGENTS.md`.

### Create Project Knowledge

Create `.agents/references/` and write only references with real project-specific content:

- `architecture.md` for capability ownership, plugin shape, service seams, and compatibility direction;
- `target-runtime.md` for the target distribution, pinned DSH checkout, profile composition, and verification commands;
- `source-map.md` when porting behavior from another product or repository;
- `security.md` when the plugin crosses filesystem, network, credential, process, mutation, or other trust boundaries.

Keep `.agents/` limited to these project references. Add a project-local skill later only when the user explicitly requests one.

### Verify and Commit the Setup

Run:

```sh
test ! -e .agents/skills
bd lint
git diff --check
git status --short --branch
```

Confirm that local Markdown links and authoritative external paths resolve. Commit project instructions and references as a second small commit when repository policy permits commits. Report the final path, Beads prefix, validation results, commits, and missing remote configuration.

Stop after this setup when the user requested only project creation. Do not invent plugin APIs or add placeholder runtime code to make the repository look complete. When the request also requires a buildable plugin scaffold, add only the package manifest, target-compatible TypeScript configuration, Cordis entry point, patch manifest, and smallest Loader-based lifecycle test required by the pinned DSH documentation.

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

### Run Mandatory Real-Consumer Verification

Verify every new or changed plugin yourself through a real DSH consumer. Do not hand verification to the user, and do not treat unit tests, packaging, `--dump-config`, or startup logs as sufficient evidence.

Use the preconfigured DeepSeek credential without printing or embedding it:

1. Read it indirectly through `DEEPSEEK_API_KEY` from `${DSH_HOME:-$HOME/.dsh}/.env`; the default machine location is `~/.dsh/.env`.
2. Require the credential file to exist with owner-only permissions before the model-driven run. If it is absent, ask the user to configure it; never place a literal key in a repository, fixture, command, report, or skill.
3. Copy the credential file with mode `600` into a disposable `DSH_HOME` when isolation is needed, and delete that home after the run. Let DSH load the credential rather than parsing or echoing it.
4. Use the target distribution's pinned DSH executable and profile shape. For model-callable tools, initialize the disposable `headless` profile; for UI or host integrations, boot the actual target surface.
5. Package a fresh artifact, install it into the disposable profile, and dump the composed configuration to confirm the expected bundle and row.
6. Create non-guessable fixtures, then run a real agent task that must invoke every new or changed capability and return exact fixture-derived values. Inspect the actual tool or surface evidence, including failure paths relevant to permissions and trust boundaries.
7. Treat any load, schema, registration, execution, rendering, or cleanup failure as a plugin defect. Add the smallest regression check, fix it, rebuild the artifact, reinstall it, and repeat the real-consumer run until it passes.
8. Remove the plugin and disposable profile, fixture, and package after verification. Keep the configured credential file untouched.

A tool-plugin verification should follow this shape, adapting paths and assertions to the plugin:

```sh
SOURCE_DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
SOURCE_ENV="$SOURCE_DSH_HOME/.env"
test -r "$SOURCE_ENV"

TEST_HOME="$(mktemp -d)"
TEST_FIXTURE="$(mktemp -d)"
TEST_PACK="$(mktemp -d)"
trap 'rm -rf "$TEST_HOME" "$TEST_FIXTURE" "$TEST_PACK"' EXIT
install -m 600 "$SOURCE_ENV" "$TEST_HOME/.env"
export DSH_HOME="$TEST_HOME"

pnpm test
pnpm pack --pack-destination "$TEST_PACK"
dsh plugin --profile headless add "$TEST_PACK"/*.tgz
dsh --profile headless --dump-config
# Build the task from the plugin contract. Require real capability calls and
# exact non-guessable values from TEST_FIXTURE; never include those values in the task.
dsh --profile headless "<agent task that exercises every changed capability>"
dsh plugin --profile headless remove <package-name>
```

Also verify the applicable lifecycle cases:

- Supply invalid configuration and confirm loading fails with an actionable error.
- Unload, disable, or hot-replace the plugin and confirm registrations and external resources disappear.
- Remove a required service and confirm the dependent plugin disposes; restore it and confirm reactivation.
- Run the target repository's typecheck, focused tests, and required security checks.

## Report the Result

Report:

- Plugin shape and why it is not split further.
- Services injected or provided.
- Configuration and trust boundaries.
- Exact verification commands and results.
- Any target-version constraint or remaining distribution risk.
