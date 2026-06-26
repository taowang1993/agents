#!/bin/bash
# codex-relay.sh — Launch agent wrapper for the Codex Relay local server.
# Managed by launchd; logs to ~/Library/Logs/codex-relay.log
set -euo pipefail

export PATH="/Users/max/.nvm/versions/node/v22.22.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

exec npx --yes codex-relay@latest
