#!/bin/bash
# tailscale.sh — Launch agent wrapper for Tailscale in userspace-networking mode.
# Managed by launchd; logs to ~/Library/Logs/tailscale.log
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

SOCKET="$HOME/Library/Application Support/tailscale/tailscaled.sock"
STATE="$HOME/Library/Application Support/tailscale/state"
mkdir -p "$(dirname "$SOCKET")" "$STATE"

exec /opt/homebrew/opt/tailscale/bin/tailscaled \
  --tun=userspace-networking \
  --statedir="$STATE" \
  --socket="$SOCKET"
