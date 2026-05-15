---
name: cli-reference
description: Maestro CLI subcommands, global options, key flags for test/cloud/record, and supported environment variables
metadata:
  tags: cli, commands, options, subcommands, environment, variables
---

## Usage pattern

```bash
maestro [global options] [subcommand] [subcommand options]
```

Example:

```bash
maestro --verbose test my-flow.yaml --include-tags=smoke
```

## Global options

| Flag | Description |
|---|---|
| `-h`, `--help` | Show help |
| `-v`, `--version` | Show installed CLI version |
| `--verbose` | Enable verbose logging |
| `-p`, `--platform=<platform>` | Select `ios`, `android`, or `web` |
| `--udid`, `--device=<id>` | Target a specific device ID |
| `--[no-]ansi`, `--[no-]color` | Enable / disable ANSI color output |

## Primary subcommands

| Subcommand | Description |
|---|---|
| `test` | Run flows locally on a simulator, emulator, physical device, or web session |
| `cloud` | Upload an app + flows to Maestro Cloud |
| `record` | Render an MP4 video from a flow |
| `start-device` | Launch a supported local simulator / emulator |
| `list-devices` | List supported local device models / OS versions |
| `list-cloud-devices` | List supported Maestro Cloud device models / OS versions |
| `download-samples` | Download sample apps and flows |
| `login` | Log into Maestro Cloud |
| `logout` | Log out of Maestro Cloud |
| `mcp` | Start the Maestro MCP server |
| `chat` | Use Maestro GPT documentation help |
| `bugreport` | Send a bug report |
| `driver-setup` | Set up Maestro drivers for a device |

## Other documented CLI tools

The current Maestro docs also reference:

```bash
maestro hierarchy
```

Use it for terminal-based UI hierarchy inspection even though it is not called out in the main commands table.

## `test` options

| Option | Description |
|---|---|
| `<flowFiles>...` | One or more flow files or folders |
| `-e`, `--env=<KEY=VALUE>` | Inject environment variables |
| `--include-tags=<tags>` | Run only flows with these tags |
| `--exclude-tags=<tags>` | Skip flows with these tags |
| `-c`, `--continuous` | Re-run tests on file changes |
| `-s`, `--shards=<count>` | Number of parallel shards |
| `--shard-all=<count>` | Run the full suite on N connected devices |
| `--shard-split=<count>` | Split the suite across N connected devices |
| `--format=<format>` | Report format: `JUNIT`, `HTML`, or `NOOP` |
| `--output=<path>` | Report output file |
| `--config=<file>` | Explicit workspace config file |
| `--test-output-dir=<dir>` | Artifact directory for screenshots and test artifacts |
| `--debug-output=<dir>` | Debug log output directory |
| `--flatten-debug-output` | Do not create timestamped subfolders for debug output |
| `--test-suite-name=<name>` | Override test suite name in reports |
| `--analyze` | Run AI Insights analysis |
| `--api-key=<key>` | Beta API key flag for analysis / services |
| `--api-url=<url>` | Beta API base URL override |
| `--headless` | Web only: run browser without a visible window |
| `--screen-size=<width>x<height>` | Web only: set headless browser dimensions |

## `cloud` options

| Option | Description |
|---|---|
| `--app-file=<path>` | App binary to upload |
| `--flows=<path>` | Flow file or workspace folder to upload |
| `--api-key=<key>` | Maestro Cloud API key |
| `--api-url=<url>` | Cloud API base URL |
| `--app-binary-id=<id>` | Reuse a previously uploaded app binary |
| `-e`, `--env=<KEY=VALUE>` | Inject environment variables |
| `--include-tags=<tags>` | Run only flows with these tags |
| `--exclude-tags=<tags>` | Skip flows with these tags |
| `--format=<format>` | Report format |
| `--output=<path>` | Report output file |
| `--config=<file>` | Explicit workspace config file |
| `--name=<name>` | Upload name |
| `--device-model=<model>` | Cloud device model |
| `--device-os=<os>` | Cloud device OS version |
| `--device-locale=<locale>` | Device locale such as `de_DE` |
| `--branch=<name>` | Git branch name |
| `--commit-sha=<sha>` | Git commit SHA |
| `--repo-name=<name>` | Repository name |
| `--repo-owner=<owner>` | Repository owner |
| `--pull-request-id=<id>` | Pull request ID |
| `--project-id=<id>` | Maestro project ID |
| `--mapping=<path>` | dSYM or Proguard mapping file |
| `--async` | Return immediately after upload |
| `--test-suite-name=<name>` | Override suite name |

## `record` options

| Option | Description |
|---|---|
| `<flowFile>` | Flow to record |
| `[<outputFile>]` | Optional output file for local rendering |
| `--local` | Use local rendering (recommended) |
| `--config=<file>` | Explicit workspace config file |
| `--debug-output=<dir>` | Debug output directory |
| `-e`, `--env=<KEY=VALUE>` | Inject environment variables |
| `--apple-team-id=<id>` | Apple Team ID |
| `--output=<path>` | Report output file |
| `--repo-name=<name>` | Repository name |
| `--repo-owner=<owner>` | Repository owner |

## `start-device` options

| Option | Description |
|---|---|
| `--platform=<platform>` | `android`, `ios`, or `web` |
| `--device-model=<model>` | Local supported device model |
| `--device-os=<os>` | Local supported device OS |
| `--device-locale=<locale>` | Locale such as `de_DE` |
| `--force-create` | Recreate the device if it already exists |
| `--os-version=<version>` | Deprecated; prefer `--device-os` |

## `list-devices` / `list-cloud-devices`

| Option | Description |
|---|---|
| `--platform=<platform>` | Filter by `ios`, `android`, or `web` |

## Environment variables

| Variable | Type | Default | Description |
|---|---|---|---|
| `JAVA_HOME` | String | — | Path to a Java 17+ installation |
| `MAESTRO_CLOUD_API_KEY` | String | not set | Cloud authentication token |
| `MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED` | Boolean | `false` | Hide `Analyzing Flow...` notification |
| `MAESTRO_CLI_LOG_PATTERN_CONSOLE` | String | `%highlight([%5level]) %msg%n` | Console log format |
| `MAESTRO_CLI_LOG_PATTERN_FILE` | String | `%d{HH:mm:ss.SSS} [%5level] %logger.%method: %msg%n` | File log format |
| `MAESTRO_CLI_NO_ANALYTICS` | Boolean | `false` | Disable Maestro analytics collection |
| `MAESTRO_DISABLE_UPDATE_CHECK` | Boolean | `false` | Skip update checks |
| `MAESTRO_DRIVER_STARTUP_TIMEOUT` | Number | `15000` | Driver startup timeout in milliseconds |

## Named parameters vs positional parameters

For `maestro cloud`, prefer named parameters because order does not matter:

```bash
maestro cloud --app-file app.apk --flows ./tests
```

Positional usage works only when the order is correct:

```bash
maestro cloud app.apk ./tests      # OK
maestro cloud ./tests app.apk      # Fails
```

## Important note about Studio

**Maestro Studio is a separate desktop application.** Do not invent a `maestro studio` subcommand.
