#!/usr/bin/env python3
"""Reopen BrowserOS windows after Syncthing receives remote bookmark updates."""

from __future__ import annotations

import argparse
import json
import subprocess
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

FOLDER_ID = "browseros-bookmarks"
BOOKMARKS_FILE = "Bookmarks"
SYNCTHING_CONFIG = Path.home() / "Library/Application Support/Syncthing/config.xml"
LOCAL_BOOKMARKS = Path.home() / "Library/Application Support/BrowserOS/Default/Bookmarks"
EVENT_TYPES = "RemoteChangeDetected,ItemFinished"


def log(message: str) -> None:
    print(f"{time.strftime('%Y-%m-%d %H:%M:%S')} {message}", flush=True)


def syncthing_gui() -> tuple[str, str]:
    root = ET.parse(SYNCTHING_CONFIG).getroot()
    gui = root.find("gui")
    if gui is None:
        raise RuntimeError(f"missing <gui> in {SYNCTHING_CONFIG}")

    address = gui.findtext("address", "127.0.0.1:8384")
    api_key = gui.findtext("apikey", "")
    if not api_key:
        raise RuntimeError("missing Syncthing GUI API key")

    if address.startswith(("http://", "https://")):
        base = address.rstrip("/")
    else:
        scheme = "https" if gui.attrib.get("tls") == "true" else "http"
        base = f"{scheme}://{address}"
    return base, api_key


def api_get(base: str, api_key: str, path: str, **params: str | int) -> object:
    url = f"{base}{path}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"X-API-Key": api_key})
    with urllib.request.urlopen(req, timeout=75) as response:
        return json.load(response)


def latest_event_id(base: str, api_key: str) -> int:
    events = api_get(base, api_key, "/rest/events", events=EVENT_TYPES, limit=1, timeout=1)
    if isinstance(events, list) and events:
        return int(events[-1].get("id", 0))
    return 0


def is_bookmark_update(event: dict[str, object]) -> bool:
    data = event.get("data")
    if not isinstance(data, dict):
        return False
    folder = data.get("folder") or data.get("folderID")
    path = data.get("path") or data.get("item")
    if folder != FOLDER_ID or path != BOOKMARKS_FILE:
        return False
    if data.get("error"):
        return False
    return event.get("type") in {"RemoteChangeDetected", "ItemFinished"}


def close_browseros_windows() -> str:
    script = r'''
tell application "System Events"
    if not (exists process "BrowserOS") then return "not running"
    tell process "BrowserOS"
        set windowCount to count windows
        if windowCount is 0 then return "no windows"
        repeat windowCount times
            try
                click button 1 of window 1
                delay 0.2
            on error errMsg
                return "close failed: " & errMsg
            end try
        end repeat
    end tell
end tell
return "closed"
'''
    proc = subprocess.run(
        ["osascript", "-e", script],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=15,
    )
    output = (proc.stdout or proc.stderr).strip()
    if proc.returncode != 0:
        raise RuntimeError(output or f"osascript exited {proc.returncode}")
    return output


def refresh_browseros() -> None:
    result = close_browseros_windows()
    if result != "closed":
        log(f"BrowserOS refresh skipped: {result}")
        return
    time.sleep(0.7)
    subprocess.run(["open", "-a", "BrowserOS"], check=False, timeout=10)
    log("BrowserOS window reopened after remote bookmark update")


def run() -> int:
    while True:
        try:
            base, api_key = syncthing_gui()
            since = latest_event_id(base, api_key)
            break
        except Exception as exc:
            log(f"startup wait: {exc}")
            time.sleep(15)

    last_refresh = 0.0
    log(f"watching Syncthing folder {FOLDER_ID} for remote {BOOKMARKS_FILE} updates")

    while True:
        try:
            events = api_get(base, api_key, "/rest/events", events=EVENT_TYPES, since=since, timeout=60)
            if not isinstance(events, list):
                continue
            for event in events:
                if not isinstance(event, dict):
                    continue
                since = max(since, int(event.get("id", since)))
                if is_bookmark_update(event) and time.monotonic() - last_refresh > 3:
                    last_refresh = time.monotonic()
                    refresh_browseros()
        except Exception as exc:
            log(f"watch error: {exc}")
            time.sleep(15)
            try:
                base, api_key = syncthing_gui()
            except Exception:
                pass


def check() -> int:
    base, _ = syncthing_gui()
    print(f"Syncthing GUI: {base}")
    print(f"Bookmarks file exists: {LOCAL_BOOKMARKS.exists()} ({LOCAL_BOOKMARKS})")
    print(f"Starting after event id: {latest_event_id(*syncthing_gui())}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="verify config and exit")
    args = parser.parse_args()
    return check() if args.check else run()


if __name__ == "__main__":
    raise SystemExit(main())
