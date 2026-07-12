# Cron Manager

This directory is the source-of-truth workspace for Max's user-created launchd jobs.

## Layout

```text
~/.agents/cron/
├── jobs.json                 # Managed job inventory
├── manage.sh                 # CLI manager
├── cleanup-processes/
├── codex-relay/
├── nightshift/
│   ├── .env
│   ├── progress.md
│   └── tasks/
├── shutdown-stale-simulators/
├── tailscale/
├── update-packages/
└── update-repos/
```

## Versioned LaunchAgents

The canonical plist files live in this directory so they can be versioned with the scripts:

```text
~/.agents/cron/cleanup-processes/com.max.cleanup-processes.plist
~/.agents/cron/codex-relay/com.max.codex-relay.plist
~/.agents/cron/nightshift/com.max.nightshift.plist
~/.agents/cron/shutdown-stale-simulators/com.max.shutdown-stale-simulators.plist
~/.agents/cron/tailscale/com.max.tailscale.plist
~/.agents/cron/update-packages/com.max.update-packages.plist
~/.agents/cron/update-repos/com.max.update-repos.plist
```

`~/Library/LaunchAgents/com.max.*.plist` files are symlinks back to these canonical plist files. Edit/version the files under `~/.agents/cron`, then use `manage.sh reload <job>` to refresh launchd.

## Commands

```bash
~/.agents/cron/manage.sh list
~/.agents/cron/manage.sh status
~/.agents/cron/manage.sh status nightshift
~/.agents/cron/manage.sh doctor
~/.agents/cron/manage.sh logs update-repos
~/.agents/cron/manage.sh run cleanup-processes
~/.agents/cron/manage.sh enable update-repos
~/.agents/cron/manage.sh disable nightshift
~/.agents/cron/manage.sh reload update-packages
```

`enable`, `disable`, and `reload` call `launchctl` for the current user's `gui/$UID` domain through the symlinked `~/Library/LaunchAgents` plist path. `run` executes the script directly outside launchd.

## Notes

- Nightshift is configured by `nightshift/.env`.
- `nightshift.sh` holds a lock and runs unfinished task files from `nightshift/tasks/*.md` back-to-back until the configured window closes.
- Progress is date-scoped in `nightshift/progress.md`.
- `shutdown-stale-simulators/` shuts down unattended booted iOS simulators after 30 minutes.
- `tailscale/` runs the userspace-networking daemon for remote Codex Relay access.
- `codex-relay/` runs the mobile Codex Relay server and depends on the Tailscale daemon for remote access.
- Use `doctor` after edits to catch missing scripts, broken LaunchAgent symlinks, label mismatches, executable-bit issues, and missing Nightshift config/task files.
