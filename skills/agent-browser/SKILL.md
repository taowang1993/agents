---
name: agent-browser
description: "Use ONLY when agent-browser's unique capabilities are needed; otherwise default to playwright-cli. Triggers: (1) browser-level config: proxy, User-Agent, headers, geo, device emulation, offline, dark/light mode, HTTP credentials, ignore HTTPS errors; (2) element introspection: `is` visible/enabled/checked, `get` attr/box/styles, `find` by role/text/label; (3) Electron desktop apps (VS Code, Slack, Discord, Figma, Notion, Spotify); (4) Slack automation (unreads, messages, search); (5) Vercel Sandbox or AWS Bedrock AgentCore cloud browsers. Always run `agent-browser doctor` at end of session to kill stale daemons."
allowed-tools: "Bash(agent-browser:*), Bash(npx agent-browser:*)"
hidden: true
---

# agent-browser

Fast browser automation CLI for AI agents. Chrome/Chromium via CDP with
accessibility-tree snapshots and compact `@eN` element refs.

Install: `npm i -g agent-browser && agent-browser install`

## Pre-flight: auto-update (run once per session)

Before using agent-browser, ensure it's on the latest version. This is a single
fast call that only installs if a newer version exists:

```bash
pnpm add -g agent-browser@latest
```

If already up to date, pnpm exits quickly with "already up to date".

## Start here

This file is a discovery stub, not the usage guide. Before running any
`agent-browser` command, load the actual workflow content from the CLI:

```bash
agent-browser skills get core             # start here — workflows, common patterns, troubleshooting
agent-browser skills get core --full      # include full command reference and templates
```

The CLI serves skill content that always matches the installed version,
so instructions never go stale. The content in this stub cannot change
between releases, which is why it just points at `skills get core`.

## Specialized skills

Load a specialized skill when the task falls outside browser web pages:

```bash
agent-browser skills get electron          # Electron desktop apps (VS Code, Slack, Discord, Figma, ...)
agent-browser skills get slack             # Slack workspace automation
agent-browser skills get dogfood           # Exploratory testing / QA / bug hunts
agent-browser skills get vercel-sandbox    # agent-browser inside Vercel Sandbox microVMs
agent-browser skills get agentcore         # AWS Bedrock AgentCore cloud browsers
```

Run `agent-browser skills list` to see everything available on the
installed version.

## Session Cleanup (MANDATORY)

**Always run this at the end of every session** to kill stale daemon processes and clean up leftover socket/pid/version sidecar files:

```bash
agent-browser doctor
```

Use `--fix` if the session had errors (also purges old state files, reinstalls Chrome if corrupt, generates missing encryption keys):

```bash
agent-browser doctor --fix
```

The daemon persists between commands and can leak processes if not cleaned up. Running `doctor` ensures no orphaned browsers or daemon processes remain.

## Observability Dashboard

The dashboard runs independently of browser sessions on port 4848 and can also be opened through a proxied or forwarded URL such as `https://dashboard.agent-browser.localhost`. Agents should stay on the dashboard origin: session tabs, status, and stream traffic are proxied internally, so session ports do not need to be exposed.
