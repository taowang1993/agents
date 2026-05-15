---
name: mcp
description: Configure and use the Maestro MCP server from coding agents like Claude Code, Codex, Cursor, and Copilot
metadata:
  tags: mcp, maestro-mcp, agents, claude-code, codex, cursor, copilot
---

## What `maestro mcp` does

The Maestro MCP server ships inside the Maestro CLI and exposes Maestro authoring, device, and Cloud capabilities to MCP-compatible coding agents.

Use this file when the user wants to:

- configure Maestro for Claude Code, Codex, Cursor, Copilot, Gemini, etc.
- let an agent inspect screens, take screenshots, or run flows
- use Maestro Cloud from an MCP-enabled agent

## Generic MCP config

If the user’s agent accepts a generic stdio MCP definition, use:

```json
{
  "mcpServers": {
    "maestro": {
      "command": "maestro",
      "args": ["mcp"]
    }
  }
}
```

If `maestro` is not on `PATH`, use the full executable path instead.

## Common agent setup examples

### Claude Code

```bash
claude mcp add maestro -- maestro mcp
```

### Codex

```bash
codex mcp add maestro -- maestro mcp
```

### Cursor

Add a custom MCP using command:

```json
{
  "mcpServers": {
    "maestro": {
      "command": "maestro",
      "args": ["mcp"]
    }
  }
}
```

### Claude Desktop

Claude Desktop often needs the full binary path and `JAVA_HOME` explicitly because it launches from a minimal shell:

```json
{
  "mcpServers": {
    "maestro": {
      "command": "/full/path/to/maestro",
      "args": ["mcp"],
      "env": {
        "JAVA_HOME": "/full/path/to/JAVA_HOME"
      }
    }
  }
}
```

## Updating Maestro MCP

Because the MCP server is bundled with the Maestro CLI, updating the CLI updates the MCP server.

Typical flow:

1. Upgrade Maestro CLI
2. Reconnect / restart the MCP integration in the host agent

## MCP tools exposed by Maestro

| Tool | What it does |
|---|---|
| `list_devices` | Lists available local devices, including web |
| `inspect_screen` | Returns the current screen hierarchy in compact JSON |
| `take_screenshot` | Captures the current device screen |
| `run` | Runs Maestro flows from inline YAML, files, or a directory |
| `cheat_sheet` | Returns a Maestro command cheat sheet |
| `list_cloud_devices` | Lists valid Cloud device model / OS pairs |
| `run_on_cloud` | Submits a run to Maestro Cloud |
| `get_cloud_run_status` | Polls Cloud run status and per-flow results |

## Cloud auth for MCP tools

Cloud-related MCP tools require Cloud authentication. Use either:

```bash
maestro login
```

or

```bash
export MAESTRO_CLOUD_API_KEY=<your_key>
```

## Practical guidance for agentic workflows

- Call a device listing / inspection tool before targeting elements
- Re-inspect after each meaningful UI change
- Use inline YAML for quick exploratory flows
- Use directory-based runs when the workspace contains dependent subflows and `config.yaml`
- Use Cloud device listing before submitting Cloud runs so device model / OS strings are valid
