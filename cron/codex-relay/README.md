# Codex Relay Launch Agent

Persistent background server for the Codex Relay mobile client. Runs the published
`npx --yes codex-relay@latest` server under launchd with `KeepAlive` — if it crashes,
launchd restarts it. Listens on port 8787. State (pairings, server identity,
approval secret) lives in `~/Library/Application Support/codex-relay/`.

## Dependencies

- **Tailscale** (`com.max.tailscale`, userspace-networking mode) — required for
  remote access. The relay advertises Tailscale candidates via
  `tailscale status --json`.
- **Node** v22.22.0 must be allowed in the macOS firewall:
  System Settings → Network → Firewall → Options →
  add `/Users/max/.nvm/versions/node/v22.22.0/bin/node`.

## `tailscale` Wrapper

`getTailscaleStatus()` in codex-relay calls `tailscale status --json`, but the
userspace-networking daemon uses a custom socket. The real binary is renamed to
`/opt/homebrew/bin/tailscale.real` and a wrapper script at
`/opt/homebrew/bin/tailscale` passes `--socket`. If Tailscale is reinstalled,
the wrapper must be recreated.

## Pairing a Mobile Device

1. The server auto-starts on login. Both Tailscale and codex-relay must be
   running. To get the QR: `npx --yes codex-relay@latest qr`
2. Scan the QR from the mobile app.
3. The mobile app shows an approval code. Approve it:
   `npx --yes codex-relay@latest approve <code>`
4. In the mobile app, go to Settings → Connected Computer and tap the
   **Tailscale** row to switch to remote access. The Tailscale DNS row may
   not resolve; use the IP row instead.

## Remote Access (Gym, Coffee Shop, etc.)

1. Ensure Tailscale is connected on both Mac and phone.
2. The mobile app should be using the Tailscale server address
   (`100.x.x.x:8787`).
3. Works from anywhere — traffic is peer-to-peer WireGuard, no relay costs.

## Lifecycle

| Action                               | Command                                              |
| ------------------------------------ | ---------------------------------------------------- |
| Start / enable                       | `~/.agents/cron/manage.sh enable codex-relay`        |
| Stop / disable                       | `~/.agents/cron/manage.sh disable codex-relay`       |
| Reload after editing the plist       | `~/.agents/cron/manage.sh reload codex-relay`        |
| Check status                         | `~/.agents/cron/manage.sh status codex-relay`        |
| View logs                            | `~/.agents/cron/manage.sh logs codex-relay`          |
| One-shot run (outside launchd)       | `~/.agents/cron/manage.sh run codex-relay`           |

### What to Tell Pi

- "disable codex-relay" — stops and disables the server
- "enable codex-relay" — re-enables and starts it
- "restart codex-relay" — reloads the launch agent
- "check codex-relay status" — shows whether it's running
- "approve <code>" — approves a mobile pairing request

## Files

| Path                                                      | Purpose                        |
| --------------------------------------------------------- | ------------------------------ |
| `~/.agents/cron/codex-relay/codex-relay.sh`               | Wrapper script                 |
| `~/.agents/cron/codex-relay/com.max.codex-relay.plist`    | launchd plist (canonical)      |
| `~/Library/LaunchAgents/com.max.codex-relay.plist`        | Symlink to canonical plist     |
| `~/Library/Logs/codex-relay.log`                          | Server stdout/stderr           |
| `~/Library/Application Support/codex-relay/`              | Server state (auth DB, keys)   |
| `/opt/homebrew/bin/tailscale`                             | Wrapper → `tailscale.real`     |
