---
name: ssh-tao
description: SSH into Tao's MacBook Air and perform tasks on that machine. Use whenever the user asks to work on the other Mac, Tao Mac, MacBookAir, remote machine, run commands there, inspect files there, install or check services there, compare state between Macs, or use SSH/scp/rsync with Tao's machine. Covers hostnames, command patterns, remote paths, and safe non-interactive execution.
---

# SSH to Tao's Mac

Use this skill when you need to operate on Tao's MacBook Air from Max's Mac.

## Connection Facts

Use this host first:

```bash
ssh tao@MacBookAir.lan
```

Fallback if local DNS fails:

```bash
ssh tao@192.168.1.71
```

Known remote facts:

- User: `tao`
- Home: `/Users/tao`
- Hostname observed over SSH: `MacBookAir.lan`
- Max's SSH key is already authorized on Tao's Mac.
- Remote Login is enabled on Tao's Mac.

For agent-run checks, avoid password prompts and hangs:

```bash
ssh -o BatchMode=yes -o ConnectTimeout=10 tao@MacBookAir.lan 'hostname; whoami; pwd'
```

If that fails, retry the IP. If both fail, ask the user to confirm Tao's Mac is awake, on the same network, and has Remote Login enabled.

## Run Remote Commands

Keep remote commands non-interactive. Prefer one clear command at a time:

```bash
ssh -o BatchMode=yes tao@MacBookAir.lan 'ls -la "$HOME"'
```

For multi-line remote Python, pass the script on stdin to avoid quoting mess:

```bash
ssh -o BatchMode=yes tao@MacBookAir.lan 'python3 -' <<'PY'
from pathlib import Path
print(Path.home())
PY
```

For shell scripts that modify files, use strict mode and make backups first:

```bash
ssh -o BatchMode=yes tao@MacBookAir.lan 'bash -s' <<'SH'
set -euo pipefail
file="$HOME/.zshrc"
cp "$file" "$file.pi-backup-$(date +%Y%m%d-%H%M%S)"
# edits here
SH
```

Do not use `sudo` in non-interactive agent commands unless the user explicitly asked and arranged password entry. If a command needs Full Disk Access or a GUI permission, explain the exact setting the user should grant.

## Copy Files

Copy local to Tao's Mac:

```bash
rsync -av ./path/ tao@MacBookAir.lan:/Users/tao/path/
```

Copy Tao's Mac to local:

```bash
rsync -av tao@MacBookAir.lan:/Users/tao/path/ ./path/
```

Use `scp` only for one-off files; prefer `rsync` for directories and repeatable syncs.

## Common Checks

Check the BrowserOS bookmark refresh job on Tao's Mac:

```bash
ssh -o BatchMode=yes tao@MacBookAir.lan '$HOME/.agents/cron/manage.sh status browseros'
ssh -o BatchMode=yes tao@MacBookAir.lan 'tail -n 50 "$HOME/Library/Logs/browseros.log"; tail -n 50 "$HOME/Library/Logs/browseros.err.log"'
```

Check Syncthing and BrowserOS bookmark file on Tao's Mac:

```bash
ssh -o BatchMode=yes tao@MacBookAir.lan 'syncthing cli config folders browseros-bookmarks path get'
ssh -o BatchMode=yes tao@MacBookAir.lan 'python3 - <<"PY"
import json, pathlib
p = pathlib.Path.home() / "Library/Application Support/BrowserOS/Default/Bookmarks"
print(p, p.exists(), p.stat().st_size if p.exists() else 0)
if p.exists():
    data = json.loads(p.read_text())
    print([n.get("name") for n in data["roots"]["bookmark_bar"]["children"]])
PY'
```

## Safety Rules

- State clearly when a result comes from Tao's Mac versus the local Mac.
- Use `$HOME` on the remote machine; do not hard-code `/Users/max` there.
- Avoid destructive commands unless the user explicitly requested them.
- Back up remote files before editing them.
- Prefer `BatchMode=yes` for checks so failed auth returns quickly instead of hanging.
