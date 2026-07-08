---
name: browseros
description: Manage Max and Tao's BrowserOS bookmark sync across Macs. Use whenever the user mentions BrowserOS bookmarks, Syncthing bookmark sync, the browseros launchd agent, stale or missing bookmarks between Macs, BrowserOS auto-refresh, or asks where BrowserOS stores/syncs bookmarks. Covers the exact file paths, Syncthing folder setup, launchd job, troubleshooting, and the rule to not sync cookies/passwords/sessions.
---

# BrowserOS Bookmark Sync

Use this skill for the BrowserOS bookmark sync workaround between Max's Mac and Tao's MacBook Air.

## Mental Model

Treat this as file sync, not native browser sync:

- BrowserOS stores bookmarks in Chromium's JSON file:
  ```text
  $HOME/Library/Application Support/BrowserOS/Default/Bookmarks
  ```
- Syncthing syncs only that file through folder id `browseros-bookmarks`.
- BrowserOS keeps bookmarks in memory. A page refresh is not enough after a remote file update; close the BrowserOS window and reopen it.
- The `browseros` launchd job automates that close/reopen on remote Syncthing updates.

Do not sync cookies, passwords, sessions, or the whole BrowserOS profile. Chrome/Edge can sync those safely because they own the sync and encryption layer; raw file sync does not.

## Syncthing Setup

Use this folder root on each Mac:

```text
$HOME/Library/Application Support/BrowserOS/Default
```

Use this `.stignore` in that folder:

```text
!/Bookmarks
*
```

Expected folder settings:

- Folder id: `browseros-bookmarks`
- Label: `BrowserOS Bookmarks`
- Type: `sendreceive`
- File watcher: enabled
- Ignore permissions: enabled
- Versioning: simple, keep `20`, cleanout days `0`

Check the local setup:

```bash
syncthing cli config folders browseros-bookmarks path get
syncthing cli config folders browseros-bookmarks devices list
syncthing cli config folders browseros-bookmarks versioning dump-json
```

Check sync status:

```bash
python3 - <<'PY'
import json, pathlib, urllib.parse, urllib.request, xml.etree.ElementTree as ET
key = ET.parse(pathlib.Path.home()/'Library/Application Support/Syncthing/config.xml').findtext('./gui/apikey')
url = 'http://127.0.0.1:8384/rest/db/status?' + urllib.parse.urlencode({'folder': 'browseros-bookmarks'})
req = urllib.request.Request(url, headers={'X-API-Key': key})
print(json.dumps(json.load(urllib.request.urlopen(req, timeout=10)), indent=2))
PY
```

## Launchd Auto-Refresh Job

The versioned job lives here:

```text
$HOME/.agents/cron/browseros/
```

The launchd label is:

```text
com.max.browseros
```

Install or repair the LaunchAgent symlink:

```bash
mkdir -p "$HOME/Library/LaunchAgents"
ln -sfn "$HOME/.agents/cron/browseros/com.max.browseros.plist" \
  "$HOME/Library/LaunchAgents/com.max.browseros.plist"
"$HOME/.agents/cron/manage.sh" enable browseros
```

Check it:

```bash
"$HOME/.agents/cron/manage.sh" status browseros
"$HOME/.agents/cron/manage.sh" logs browseros -n 50
```

The job listens for Syncthing `RemoteChangeDetected` / `ItemFinished` events for `Bookmarks`, then clicks BrowserOS window close buttons and runs `open -a BrowserOS`.

macOS may ask for Accessibility permission for `python3.13`. Grant it; the script is Python and uses AppleScript/System Events to click BrowserOS's red close button.

## Inspect Bookmarks

Read bookmark names without editing the JSON:

```bash
python3 - <<'PY'
import json, pathlib
p = pathlib.Path.home() / 'Library/Application Support/BrowserOS/Default/Bookmarks'
data = json.loads(p.read_text())
for node in data['roots']['bookmark_bar']['children']:
    print(f"{node.get('name')} — {node.get('url')}")
PY
```

Avoid manual JSON edits. Chromium stores a checksum and may reject or rewrite bad edits.

## Troubleshooting

If a bookmark exists in the file but not in BrowserOS, close the BrowserOS window and reopen it. `Cmd+R` only refreshes `chrome://bookmarks`, not the in-memory bookmark model.

If the other Mac does not receive bookmarks:

1. Check Syncthing device connection and folder completion.
2. Confirm both Macs use folder id `browseros-bookmarks` and the same folder root.
3. Confirm `.stignore` includes only `Bookmarks`.
4. Check for Syncthing conflict copies before overwriting anything.

If auto-refresh does not run:

1. Check `manage.sh status browseros`.
2. Check `~/Library/Logs/browseros.log` and `~/Library/Logs/browseros.err.log`.
3. Grant Accessibility permission if `osascript` or System Events errors appear.
4. Restart the job with `manage.sh reload browseros`.

Avoid adding bookmarks on both Macs at the same time. Syncthing can sync the file, but BrowserOS does not merge concurrent bookmark models.
