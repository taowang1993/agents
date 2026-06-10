# Cron Manager

This directory is the source-of-truth workspace for Max's user-created launchd jobs.

## Layout

```text
~/.agents/cron/
├── jobs.json                 # Managed job inventory
├── manage.sh                 # CLI manager
├── cleanup-processes/
├── nightshift/
│   └── launchagents/
├── update-packages/
└── update-repos/
```

## Versioned LaunchAgents

The canonical plist files live in this directory so they can be versioned with the scripts:

```text
~/.agents/cron/cleanup-processes/com.max.cleanup-processes.plist
~/.agents/cron/nightshift/launchagents/com.max.nightshift-0.plist
~/.agents/cron/update-packages/com.max.update-packages.plist
~/.agents/cron/update-repos/com.max.update-repos.plist
```

`~/Library/LaunchAgents/com.max.*.plist` files are symlinks back to these canonical plist files. Edit/version the files under `~/.agents/cron`, then use `manage.sh reload <job>` to refresh launchd.

## Commands

```bash
~/.agents/cron/manage.sh list
~/.agents/cron/manage.sh status
~/.agents/cron/manage.sh status nightshift-3
~/.agents/cron/manage.sh doctor
~/.agents/cron/manage.sh logs update-repos
~/.agents/cron/manage.sh run cleanup-processes
~/.agents/cron/manage.sh enable update-repos
~/.agents/cron/manage.sh disable nightshift-7
~/.agents/cron/manage.sh reload update-packages
```

`enable`, `disable`, and `reload` call `launchctl` for the current user's `gui/$UID` domain through the symlinked `~/Library/LaunchAgents` plist path. `run` executes the script directly outside launchd.

## Notes

- Night Shift is configured by `nightshift/.env` and `nightshift/review.md`.
- `nightshift/review.md` is the active phase file and currently symlinks to `/Users/max/projects/tockbot/.agents/reference/review.md`.
- Night Shift skip sentinel: `nightshift/.night-shift-skip`.
- Use `doctor` after edits to catch missing scripts, broken LaunchAgent symlinks, label mismatches, executable-bit issues, and missing Night Shift config/phase files.
