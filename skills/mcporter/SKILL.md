---
name: mcporter
description: List, configure, authenticate, call, and inspect MCP servers/tools with mcporter over HTTP or stdio.
metadata:
  homepage: http://mcporter.dev
  openclaw-emoji: "📦"
  openclaw-bins: "mcporter"
---

# mcporter

Use `mcporter` to work with MCP servers directly. mcporter auto-discovers MCP servers
configured in Cursor, Claude Code/Desktop, Codex, Windsurf, OpenCode, and VS Code
(plus local `config/mcporter.json`). Run instantly via `npx` — no installation required.

## Pre-flight: auto-update (run once per session)

```bash
npx --yes mcporter@latest --version
```

This primes the npm cache with the latest version so subsequent `npx mcporter`
commands skip the install prompt and use the freshest release.

## Quick start

```bash
npx mcporter list                          # all configured servers
npx mcporter list <server>                 # TypeScript-style signatures + doc comments
npx mcporter list <server> --schema        # full JSON schema
npx mcporter list <server> --brief         # compact signatures only
npx mcporter list <server> --json          # machine-readable output
npx mcporter list <server> --verbose       # show which config source registered each name
```

## Call syntax

Three equivalent styles — pick whichever fits the context:

### Function-call (recommended for complex args)

```bash
npx mcporter call 'linear.create_issue(issueId: "ENG-123", body: "Looks good!")'
npx mcporter call 'context7.resolve_library_id("React hooks docs", "react")'
```

### Colon-delimited flags (shell-friendly)

```bash
npx mcporter call linear.create_issue issueId:ENG-123 body:'Looks good!'
```

### Positional values with `--` separator

```bash
npx mcporter call server.tool -- --raw-value
```

### JSON payload

```bash
npx mcporter call <server.tool> --args '{"limit":5}'
```

### Full URL / stdio

```bash
npx mcporter call https://mcp.linear.app/mcp.list_issues assignee=me
npx mcporter call shadcn.io/api/mcp.getComponent component=vortex   # protocol optional
npx mcporter call --stdio "bun run ./server.ts" scrape url=https://example.com
```

Useful call flags:

- `--output text|markdown|json|raw` — control result rendering
- `--save-images <dir>` — persist image content blocks to files
- `--raw-strings` — disable numeric coercion for flag-style and positional values
- `--no-coerce` — keep all `key=value` and positional values as raw strings
- `--tail-log` — stream tail output when the tool returns log handles
- `--timeout <ms>` — override call timeout (default 30 s; env: `MCPORTER_CALL_TIMEOUT`)

## Shorthand tricks

- **Skip the verb:** `npx mcporter firecrawl` → auto-runs `list firecrawl`
- **Dotted tokens:** `npx mcporter linear.list_issues` → auto-dispatch to `call`
- **Auto-correct:** `npx mcporter linear.listIssues` → corrects `listIssues` to `list_issues`
  (edit-distance heuristic; see docs for tuning)

## Ad-hoc connections (no config editing)

```bash
# Point at any HTTP MCP server
npx mcporter list --http-url https://mcp.linear.app/mcp --name linear

# Run a local stdio MCP via Bun
npx mcporter call --stdio "bun run ./local-server.ts" --name local-tools

# Persist for future runs
npx mcporter list --http-url https://mcp.example.com/mcp --name mytool --persist config/mcporter.local.json
```

- Add `--env KEY=value` to inject/override env vars (stdio inherits shell env by default)
- Add `--cwd <dir>` to set the working directory
- Add `--allow-http` if you must hit a cleartext endpoint
- `mcporter auth <url>` works with ad-hoc servers too

## Auth and OAuth

```bash
# OAuth login for protected servers
npx mcporter auth vercel
npx mcporter auth <server> --reset          # force re-login

# Register an OAuth server
npx mcporter config add notion https://mcp.notion.com/mcp --auth oauth
npx mcporter auth notion
```

### Headless OAuth (pre-seeded tokens)

```bash
npx mcporter vault set hubspot --tokens-file ./tokens.json
npx mcporter vault set hubspot --stdin < tokens.json
npx mcporter vault clear hubspot
```

The JSON payload is `{ "tokens": { ... }, "clientInfo": { ... } }` (`tokens` required).

### Static OAuth clients

For providers that don't support dynamic client registration, configure in JSON:

```jsonc
{
  "mcpServers": {
    "hubspot": {
      "baseUrl": "https://mcp.hubspot.com/mcp",
      "auth": "oauth",
      "oauthClientId": "your-client-id",
      "oauthClientSecretEnv": "HUBSPOT_CLIENT_SECRET",
      "oauthTokenEndpointAuthMethod": "client_secret_post",
      "oauthRedirectUrl": "http://127.0.0.1:3434/callback"
    }
  }
}
```

## Config management

Manage `config/mcporter.json` (JSONC — comments and trailing commas allowed):

```bash
npx mcporter config list                     # local entries only
npx mcporter config list --source import     # entries from editor imports
npx mcporter config list --json              # machine-readable
npx mcporter config get <server>             # show one entry
npx mcporter config add <name> <url>         # add HTTP server
npx mcporter config add <name> <command>     # add stdio server (anything with spaces)
npx mcporter config add <name> <url> --auth oauth
npx mcporter config remove <name>
npx mcporter config import cursor --copy     # pull editor entries into local config
npx mcporter config login|logout <server>
```

### Config resolution order

1. `--config <path>` flag (or `configPath` in API)
2. `MCPORTER_CONFIG` env var
3. `<root>/config/mcporter.json` (project-local)
4. `~/.mcporter/mcporter.json[c]` or `$XDG_CONFIG_HOME/mcporter/` (home)

### Import precedence

```jsonc
{
  "mcpServers": { /* ... */ },
  "imports": ["cursor", "claude-code", "claude-desktop", "codex", "windsurf", "opencode", "vscode"]
}
```

Imports follow array order. Omit `imports` to use the default list above. mcporter
auto-expands `${VAR}`, `${VAR:-fallback}`, and `$env:VAR` placeholders at runtime.

## Daemon

Stateful stdio servers (chrome-devtools, mobile-mcp, etc.) auto-start a per-login
daemon on first call so sessions stay alive across invocations.

```bash
npx mcporter daemon start                          # pre-warm
npx mcporter daemon start --log                    # tee stdout/stderr
npx mcporter daemon start --log-file /tmp/daemon.log
npx mcporter daemon start --log-servers chrome-devtools   # trace specific MCP
npx mcporter daemon status                         # which servers are connected
npx mcporter daemon stop
npx mcporter daemon restart
```

Opt in/out per server:

```jsonc
{ "lifecycle": "keep-alive" }    // daemon-managed
{ "lifecycle": "ephemeral" }     // per-process only
```

Env overrides: `MCPORTER_KEEPALIVE=<name>` or `MCPORTER_DISABLE_KEEPALIVE=<name>`.

## Resources

List and read MCP resources (added in 0.10.0):

```bash
npx mcporter resource <server>            # list resources
npx mcporter resource <server> <uri>      # read a specific resource
npx mcporter resource <server> <uri> --output json
```

## Codegen

### Generate a standalone CLI

```bash
npx mcporter generate-cli --command https://mcp.context7.com/mcp
npx mcporter generate-cli --command "npx -y chrome-devtools-mcp@latest"
npx mcporter generate-cli linear --bundle dist/linear.js         # from config
npx mcporter generate-cli linear --compile dist/linear            # Bun binary
```

Key flags:
- `--server <name>` | `--command <url|command>` — server source
- `--output <path>` — template output path
- `--bundle <path>` — emit Node/Bun bundle (Rolldown or Bun)
- `--compile <path>` — Bun-compiled binary (implies `--runtime bun`)
- `--include-tools a,b` | `--exclude-tools c,d` — subset of tools
- `--from <artifact>` — regenerate existing CLI from embedded metadata

Inspect an artifact:
```bash
npx mcporter inspect-cli dist/context7.js       # human-readable
npx mcporter inspect-cli dist/context7.js --json
```

### Generate typed TypeScript clients

```bash
# Types-only interface
npx mcporter emit-ts linear --out types/linear-tools.d.ts

# Client wrapper (proxy factory + .d.ts)
npx mcporter emit-ts linear --mode client --out clients/linear.ts

# Include all optional parameters
npx mcporter emit-ts linear --include-optional --out types/linear-full.d.ts
```

## Tool filtering

Hide or block specific tools per server:

```jsonc
{
  "mcpServers": {
    "slack-readonly": {
      "baseUrl": "https://example.com/slack/mcp",
      "allowedTools": ["channels_list", "conversations_history"]
    },
    "filesystem-safe": {
      "command": "npx -y @modelcontextprotocol/server-filesystem ~/Downloads",
      "blockedTools": ["write_file", "delete_file", "move_file"]
    }
  }
}
```

`allowedTools` = allowlist (empty array blocks everything).
`blockedTools` = blocklist. Choose one mode per server.

## Notes

- Config default: `./config/mcporter.json` (override with `--config <path>` or `--root <dir>`).
- Prefer `--output json` for machine-readable results.
- All commands that fail with auth/offline/http errors emit structured `{ server, tool, issue }` envelopes when using `--output json` or `--json`.
- Timeout env vars: `MCPORTER_LIST_TIMEOUT`, `MCPORTER_CALL_TIMEOUT` (default 30 s).
- OAuth browser timeout: `--oauth-timeout <ms>` or `MCPORTER_OAUTH_TIMEOUT_MS` (default 5 min).
- Log level: `--log-level <debug|info|warn|error>` or `MCPORTER_LOG_LEVEL`.
