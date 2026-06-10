# Path B Plan — Electron Cron Manager

## Goal

Build a small Electron app that provides a visual UI for the launchd cron jobs organized under `~/.agents/cron`.

## Product Scope

The app should read `~/.agents/cron/jobs.json` as its source of truth and use `~/.agents/cron/manage.sh` for state-changing operations. It should not duplicate launchd logic in the UI.

## MVP

1. **Job List**
   - Show all jobs from `jobs.json`.
   - Display job name, label, schedule, loaded state, disabled state, last exit status, and latest log path.

2. **Job Detail View**
   - Show script path, plist path, resolved symlink target, schedule, description, and latest log output.
   - Provide links/buttons to reveal files in Finder or open them in the default editor.

3. **Controls**
   - Enable job.
   - Disable job.
   - Reload job.
   - Run job now.
   - Tail latest logs.
   - Run doctor.

4. **Safety**
   - Confirm before disable, reload, or run.
   - Show the exact command before execution.
   - Surface stdout, stderr, and exit code for every operation.
   - Never edit LaunchAgents directly in the MVP.

5. **Night Shift Support**
   - Show Night Shift phases as grouped jobs.
   - Show `nightshift/.env` settings.
   - Show whether `.night-shift-skip` is present.
   - Add buttons for skip and unskip after the MVP controls are stable.

## Architecture

```text
Electron App
├── Main Process
│   ├── Runs manage.sh commands
│   ├── Watches jobs.json and job folders
│   └── Exposes safe IPC methods
├── Renderer
│   ├── Job List
│   ├── Job Detail
│   ├── Log Viewer
│   └── Doctor Panel
└── ~/.agents/cron
    ├── jobs.json
    ├── manage.sh
    └── grouped job folders
```

## Implementation Phases

### Phase 1 — Read-Only Viewer

- Create Electron scaffold.
- Load and render `jobs.json`.
- Call `manage.sh list`, `status`, and `doctor` from the main process.
- Display read-only job cards and detailed status.

### Phase 2 — Log Viewer

- Add latest-log discovery through `manage.sh logs`.
- Add tail refresh.
- Add copy path and open log actions.

### Phase 3 — Safe Controls

- Add enable, disable, reload, and run buttons.
- Add confirmation dialogs.
- Show stdout/stderr/exit code after each command.
- Disable buttons while commands are running.

### Phase 4 — Night Shift UX

- Add a grouped Night Shift panel.
- Display phase roster from `nightshift/review.md`.
- Show enabled/disabled/skip status.
- Add skip/unskip controls.

### Phase 5 — Scheduling Editor

- Add a read/write plist editor only after the command-backed MVP is stable.
- Validate schedules before writing.
- Require confirmation and automatic `manage.sh reload` after changes.

## Recommended Stack

- Electron + React + TypeScript
- Vite for renderer development
- Node `child_process.spawn` in the main process
- File watching with Node `fs.watch` or `chokidar`
- No database for MVP; use `jobs.json` and launchd as the source of truth

## Validation

- `manage.sh doctor` passes before app launch.
- Read-only UI matches `manage.sh list` and `manage.sh status` output.
- Each button shows the exact command it runs.
- Enable/disable/reload operations are reversible from the CLI.
- The app remains usable if a log file or symlink is missing.
