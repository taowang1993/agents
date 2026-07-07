---
name: cleanmac
description: >-
  Find and safely clean large macOS developer/tooling junk: /private/var/folders code_sign_clone folders, pnpm store versions, Xcode/iOS simulator runtimes/devices/MobileAsset orphans, Android SDKs, sleepimage, and app caches. Make sure to use this skill whenever the user asks to free disk space on macOS, asks whether a large macOS folder is useful, cleans developer caches, removes simulator/runtime/device data, or asks “what is this big folder?”.
---

# Cleanmac

Use this skill to find and safely remove disk hogs on Max's Mac. Prefer tool-managed cleanup over `rm -rf`, and explain what each item is before deleting it.

## Safety Ladder

1. Print size and purpose first: use `du -sh`, `ls -ldO@`, and `plutil -p` when useful.
2. Check active use before deleting app temp clones: `lsof +D "$path"`.
3. Quit the owning app before deleting its temp files; do not force-kill unless the user asks.
4. Never delete these parent directories wholesale: `/private/var/folders`, `/System/Library/AssetsV2`, `~/Library/Developer/CoreSimulator/Devices`.
5. Use Apple tools for simulators: `xcrun simctl ...` and Xcode Settings → Platforms.
6. Treat SIP-protected assets as Recovery-only cleanup; do not promise that `sudo rm` will work.

## Quick Audit

Run the smallest useful set for the user's question:

```bash
user_var_root="$(dirname "$(getconf DARWIN_USER_TEMP_DIR)")"
du -sh "$user_var_root"/{T,C,X} 2>/dev/null
find "$user_var_root/X" -maxdepth 1 -mindepth 1 -type d -print 2>/dev/null | while read -r d; do du -sh "$d"; done

du -sh ~/Library/pnpm/store ~/Library/Android ~/Library/Developer/CoreSimulator/Devices 2>/dev/null
# pnpm store prune can remove package-manager binaries auto-installed by pnpm/Corepack.
# On Max's machine it broke the pinned pnpm 11.1.2 path used by npm/Codex updates on 2026-06-26.
corepack --version 2>/dev/null && echo "⚠️  Corepack active — skip pnpm store prune unless you will rehydrate and verify pnpm/npm afterward" || true
command -v pnpm npm 2>/dev/null
pnpm store path 2>/dev/null
du -sh /System/Library/AssetsV2/com_apple_MobileAsset_iOSSimulatorRuntime 2>/dev/null
xcrun simctl runtime list 2>/dev/null
xcrun simctl list devices --json 2>/dev/null
```

## Known Cleanup Targets

| Path or Pattern | What It Is | Safe Cleanup |
|---|---|---|
| `/private/var/folders/.../X/com.openai.codex.code_sign_clone` | Codex Desktop code-signing/app bundle clones. Removed 14GB on 2026-06-21. | Quit Codex, confirm `lsof +D` is empty, then `rm -rf` only this folder. |
| `/private/var/folders/.../X/com.microsoft.edgemac.code_sign_clone` | Microsoft Edge code-signing/app bundle clones. Removed 8.9GB on 2026-06-21. | Quit Edge with AppleScript, confirm `lsof +D` is empty, then `rm -rf` only this folder. |
| `~/Library/Application Support/{Caches/*-updater,web/{Cache,Code Cache,logs},Tockbot Dev/{Cache,Code Cache,logs},app_shell_cache_*}` plus old Edge updater versions/caches | Electron/Chromium caches, stale updater zips, app package caches, and old Edge updater app copies. Removed 3.4GB on 2026-06-21 from `/Users/max/Library/Application Support`. | Quit or verify no owning app has open files with `lsof`; delete only cache/log/update-version directories. Do not delete the Application Support parent, app profiles, settings, models, or current app runtimes. |
| `{/private/var/tmp,/private/var/folders/.../T}/SpeechModelCache` | macOS speech model cache/temp files. Removed 933MB on 2026-06-21. | Confirm `lsof +D` is empty; delete only the `SpeechModelCache` directories. Speech services may recreate them. |
| `/private/var/folders/.../T/node-compile-cache` | Node/Bun/Vitest compile cache under the user temp directory. Removed 457MB on 2026-06-30 while unblocking a push. | Delete only this cache directory; tools recreate it. |
| `/private/var/folders/.../T/tockspeaker-runtime-*` | TockSpeaker runtime smoke-test temp bundles/helpers. Removed 3.8GB on 2026-07-07 while unblocking an iOS smoke build. | Confirm no `tockspeaker`/`parakeet` processes are running; delete only these per-run temp directories. |
| `/private/var/tmp/com.apple.CoreSimulator.SimDevice.*` | Simulator temp logs left under `/private/var/tmp`. Removed 36MB on 2026-06-21. | Confirm `lsof +D` is empty; delete only stale per-device temp directories. |
| `/opt/homebrew` | Homebrew prefix and caches. Removed 114MB on 2026-06-21 via `brew autoremove`; removed 693MB on 2026-06-26 via `brew cleanup --prune=all`. | Use `/opt/homebrew/bin/brew autoremove` and `brew cleanup --prune=all -n` first; do not manually delete `Cellar`, `Caskroom`, or `var` data unless the formula/service is intentionally removed. |
| `~/Library/pnpm/store` | pnpm content-addressable package store. Store format dirs are not package versions. | Default to **skip `pnpm store prune`** on Max's machine. It removed the pinned pnpm 11.1.2 package-manager path under `~/Library/pnpm/store/v11/links/@/pnpm/...` on 2026-06-26, which broke the npm shim/Codex update flow. Remove old store dirs like `v3`/`v10` only when the active store is another dir. Removed `v3` 2.3GB and `v10` 10GB on 2026-06-21; `v11` pruned 2.8GB on 2026-06-26. If the user explicitly wants prune, warn first, then verify afterward from a pnpm-pinned project: `pnpm -v`, `/Users/max/Library/pnpm/pnpm -v`, and `npm -v`. |
| `~/.bun/install/cache`, `~/.npm/_cacache`, `~/.cache/uv`, `~/Library/Caches/pnpm`, `~/Library/Caches/ms-playwright` | Package manager and browser-test caches. Removed about 5.3GB on 2026-06-26. | Prefer tool cleanup where available: `npm cache clean --force`, `uv cache clean`; then delete only cache dirs such as Bun install cache, pnpm cache, and Playwright browser cache. Do **not** confuse `~/Library/Caches/pnpm` with `~/Library/pnpm/store`. |
| `~/Library/Android` | Android SDK, emulator, build tools, NDK, and system images. Removed 4.3GB on 2026-06-21. | If the user does not build or test Android apps, `rm -rf ~/Library/Android`. |
| `/System/Library/AssetsV2/com_apple_MobileAsset_iOSSimulatorRuntime` | Downloaded iOS Simulator runtime MobileAssets. Active runtime assets are useful; orphan assets can be huge. | Prefer Xcode Settings → Platforms or `xcrun simctl runtime delete`. Do not delete the whole folder. SIP-protected orphans may require Recovery. Current known orphan: `c0d3fd05106683ba0b3680d4d1afec65f098d700.asset`, iOS 18.5, about 8.3GB, protected by SIP. |
| `~/Library/Developer/CoreSimulator/Devices` | iOS simulator device instances and app data. Device count is less important than per-device size. | Use `xcrun simctl delete unavailable`; delete large individual devices by UUID with `xcrun simctl delete <UUID>`. Removed stale iOS 17.5 devices (~2.4GB) and two large iOS 26.5 devices (`C9E54A17-69D1-451B-A808-15C0FECC0FFE`, `95DC6B52-3B50-4D07-BF51-8F25E105A864`, ~3.5GB) on 2026-06-21. |
| `/Library/Developer/CoreSimulator/Caches` | System-wide CoreSimulator caches, especially dyld shared caches for installed simulator runtimes. Removed 6.6GB on 2026-06-21, including a stale iOS 18.5 cache and active iOS 26.5 cache; removed 3.0GB on 2026-06-26. | Prefer `xcrun simctl runtime dyld_shared_cache remove --all`; the cache may be regenerated next time a simulator runs. |
| `~/Library/Developer/Xcode/DerivedData` | Xcode build intermediates and indexes. | Safe to remove when Xcode is not building; Xcode recreates it. |
| Xcode Documentation Cache | Downloaded/generated Xcode documentation cache. | Safe to remove; Xcode recreates or redownloads it. |
| `~/.pi/agent/sessions`, `~/.pi/agent/sessions-night` | Pi session transcripts and logs. Removed old `~/.pi/agent/sessions` files older than 30 days, shrinking 4.2GB to 1.5GB on 2026-06-26. | Delete only old files, not the session root: `find ~/.pi/agent/sessions ~/.pi/agent/sessions-night -type f -mtime +30 -delete`; then remove empty dirs. Keep recent sessions for continuity/debugging. |
| `~/projects/tockbot/node_modules/.old_modules-*` | Stale package-manager backup folders under Tockbot `node_modules`. Removed 2.0GB on 2026-06-26. | Confirm `lsof +D` is empty, then delete only `.old_modules-*`. Do not delete active `node_modules` unless explicitly reinstalling dependencies. |
| `/private/var/vm/sleepimage` | macOS safe-sleep/hibernation image. Observed 2GB on 2026-06-21. | Usually skip. It may be recreated; disabling hibernation is not worth the reliability tradeoff unless the user explicitly insists. |

## Simulator Size Helper

Use this when simulator devices look suspiciously large:

```bash
python3 - <<'PY'
import json, os, subprocess
raw = subprocess.check_output(['xcrun', 'simctl', 'list', 'devices', '--json'])
data = json.loads(raw)
for runtime, devices in data.get('devices', {}).items():
    if 'iOS' not in runtime:
        continue
    for d in devices:
        path = os.path.expanduser(f'~/Library/Developer/CoreSimulator/Devices/{d["udid"]}')
        try:
            size = subprocess.check_output(['du', '-sh', path], stderr=subprocess.DEVNULL).decode().split()[0]
        except Exception:
            size = '?'
        print(f'{size}\t{d.get("name")}\t{runtime.rsplit(".", 1)[-1]}\t{d["udid"]}\t{d.get("state")}')
PY
```

## Auto-Update This Skill

When you remove a new cleanup target in a future session, update this `SKILL.md` in the same turn unless the user says not to.

Add one row to **Known Cleanup Targets** with:

- the exact path or a safe pattern,
- what the item is,
- the safe cleanup method,
- the observed size and date,
- any caveat such as “quit app first”, “recreated automatically”, or “Recovery/SIP required”.

If the item is user-specific, include the general pattern and the exact example. After editing, run:

```bash
skill-validator check /Users/max/.agents/skills/cleanmac
```
