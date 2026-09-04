---
name: ssh
description: SSH into either of Max's MacBooks and perform remote commands, inspect files, install or check services, compare local and remote state, or transfer files with scp or rsync. Use this skill whenever the user asks to work on Tao's MacBook Air, taowang's MacBook Pro, either other Mac, or any remote Mac over SSH.
---

# SSH to Known Macs

Use the target mapping below before connecting. Treat the computer name and login account as separate values.

## Target Mapping

### MacBook Air

- Login: `tao`
- Home: `/Users/tao`
- Primary command: `ssh tao@MacBookAir.lan`
- mDNS name: `Tao.local`
- Current fallback IP: `192.168.1.71`
- Hostname observed over SSH: `MacBookAir.lan`

Use this target when the user says Tao, MacBook Air, `MacBookAir`, or `/Users/tao`.

### MacBook Pro

- Login: `taowang`
- Home: `/Users/taowang`
- Remote Login command: `ssh taowang@MacBook-Pro`
- Hostnames observed over SSH: `MacBook-Pro.lan` and later `Taos-MBP.lan`
- Last known fallback IP: `192.168.1.243` (may change; never use the MacBook Air IP)
- Direct fallback: `ssh -o HostKeyAlias=MacBook-Pro taowang@192.168.1.243`
- SSH service name when awake: `Tao’s MacBook Pro`
- Current ED25519 host-key fingerprint: `SHA256:kNutRVXp6KP1S9Vis5VU23m9tx2TQgKqmZMo79ITubI`

Use this target when the user says taowang, MacBook Pro, `MacBook-Pro`, or `/Users/taowang`.

### Max's MacBook Air

- Login: `max`
- Home: `/Users/max`
- Primary command: `ssh max@Max.local`
- Hostname observed locally: `Mac.lan`
- Current fallback IP: `192.168.1.118`
- Current ED25519 host-key fingerprint: `SHA256:71DTN6YGbLhuIwAYoVndzwBSf80rpwwQU1UbCbT2mvw`

Use this target when the user says Max, Max's Mac, `Max.local`, or `/Users/max`.

If the user does not identify which Mac to use, ask before running commands.

## Connect and Verify

Run a non-interactive identity check before doing remote work:

```bash
ssh -o BatchMode=yes -o ConnectTimeout=10 tao@MacBookAir.lan 'hostname; whoami; pwd'
ssh -o BatchMode=yes -o ConnectTimeout=10 taowang@MacBook-Pro 'hostname; whoami; pwd'
ssh -o BatchMode=yes -o ConnectTimeout=10 max@Max.local 'hostname; whoami; pwd'
```

Use `BatchMode=yes` so an unavailable key or host fails promptly instead of waiting for a password. The current SSH key is authorized for Max's account.

When a new host asks for host-key confirmation, verify its fingerprint or have the user complete the normal first interactive connection. Do not disable host-key checking or use `StrictHostKeyChecking=no`.

If the MacBook Air hostname fails, retry `tao@192.168.1.71`. If the MacBook Pro hostname fails, retry `taowang@192.168.1.243` with `HostKeyAlias=MacBook-Pro`. If Max's hostname fails, retry `max@192.168.1.118` with `HostKeyAlias=Max.local`. Ask the user for a current IP if the matching last-known address also fails.

## Run Remote Commands

Keep remote commands non-interactive and clear:

```bash
ssh -o BatchMode=yes tao@MacBookAir.lan 'ls -la "$HOME"'
ssh -o BatchMode=yes taowang@MacBook-Pro 'ls -la "$HOME"'
ssh -o BatchMode=yes max@Max.local 'ls -la "$HOME"'
```

Use `$HOME` on the remote Mac; do not hard-code `/Users/max` there. For multi-line remote Python, pass the script on stdin to avoid quoting errors:

```bash
ssh -o BatchMode=yes taowang@MacBook-Pro 'python3 -' <<'PY'
from pathlib import Path
print(Path.home())
PY
```

Before modifying a remote file, use strict shell mode and create a timestamped backup:

```bash
ssh -o BatchMode=yes taowang@MacBook-Pro 'bash -s' <<'SH'
set -euo pipefail
file="$HOME/.zshrc"
cp "$file" "$file.pi-backup-$(date +%Y%m%d-%H%M%S)"
# Make the requested edit here.
SH
```

Do not use `sudo` in non-interactive commands unless the user explicitly requested it and arranged password entry. If a command needs Full Disk Access or a GUI permission, tell the user exactly which setting to grant.

## Copy Files

Prefer `rsync` for directories and repeatable transfers. Use `scp` for one-off files:

```bash
rsync -av ./path/ tao@MacBookAir.lan:~/path/
rsync -av ./path/ taowang@MacBook-Pro:~/path/
rsync -av taowang@MacBook-Pro:~/path/ ./path/
```

State clearly whether each result came from the local Mac, the Air, or the Pro.

## Find a Name or IP

Have the user run these commands in Terminal on the intended MacBook when its address is unknown:

```bash
whoami
scutil --get LocalHostName
hostname
ipconfig getifaddr en0
ipconfig getifaddr en1
```

Use the exact SSH command shown in **System Settings → General → Sharing → Remote Login**. Keep both Macs on the same network for `.local` names and private IP addresses. If authentication fails, check that Remote Login allows the named account and that this Mac's public key is in the account's `~/.ssh/authorized_keys`; do not ask the user to send a password in chat.
