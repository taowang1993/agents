# Tailscale Launch Agent

Userspace-networking Tailscale daemon for the `com.max.codex-relay` server.

## Why userspace-networking

The Tailscale cask (GUI app) requires a kernel extension and sudo to install.
The CLI formula (`brew install tailscale`) can run in userspace-networking mode
without kernel privileges — the WireGuard tunnel is handled entirely in userspace.

## Socket

The daemon uses a custom socket at
`~/Library/Application Support/tailscale/tailscaled.sock`. The `tailscale` CLI
at `/opt/homebrew/bin/tailscale` is a wrapper that passes `--socket`. The
original binary was renamed to `/opt/homebrew/bin/tailscale.real`.

If `brew upgrade tailscale` overwrites the wrapper, recreate it:
```bash
mv /opt/homebrew/bin/tailscale /opt/homebrew/bin/tailscale.real
cat > /opt/homebrew/bin/tailscale << 'SCRIPT'
#!/bin/bash
exec /opt/homebrew/bin/tailscale.real --socket="$HOME/Library/Application Support/tailscale/tailscaled.sock" "$@"
SCRIPT
chmod +x /opt/homebrew/bin/tailscale
```

## Files

| Path                                                    | Purpose                        |
| ------------------------------------------------------- | ------------------------------ |
| `~/.agents/cron/tailscale/tailscale.sh`                 | Wrapper script                 |
| `~/.agents/cron/tailscale/com.max.tailscale.plist`      | launchd plist (canonical)      |
| `~/Library/LaunchAgents/com.max.tailscale.plist`        | Symlink to canonical plist     |
| `~/Library/Logs/tailscale.log`                          | Daemon stdout/stderr           |
| `~/Library/Application Support/tailscale/`              | State and socket               |
