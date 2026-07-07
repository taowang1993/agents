#!/usr/bin/env python3
import argparse
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo


ENDPOINT = "https://chatgpt.com/backend-api/wham/rate-limit-reset-credits"
ENV_TOKEN_NAMES = ("CHATGPT_BEARER_TOKEN", "OPENAI_BEARER_TOKEN", "CODEX_AUTH_TOKEN")


def read_token_from_auth_file(path):
    try:
        data = json.loads(path.read_text())
    except FileNotFoundError:
        return None
    except Exception as exc:
        raise SystemExit(f"Could not read auth file {path}: {exc}") from exc

    tokens = data.get("tokens") if isinstance(data, dict) else None
    if isinstance(tokens, dict):
        return tokens.get("access_token") or tokens.get("id_token")
    return None


def find_token(auth_file):
    for name in ENV_TOKEN_NAMES:
        value = os.environ.get(name)
        if value:
            return value

    paths = []
    if auth_file:
        paths.append(pathlib.Path(auth_file).expanduser())
    codex_home = os.environ.get("CODEX_HOME")
    if codex_home:
        paths.append(pathlib.Path(codex_home).expanduser() / "auth.json")
    paths.append(pathlib.Path.home() / ".codex" / "auth.json")

    seen = set()
    for path in paths:
        if path in seen:
            continue
        seen.add(path)
        token = read_token_from_auth_file(path)
        if token:
            return token
    return None


def fetch_credits(token):
    req = urllib.request.Request(
        ENDPOINT,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "User-Agent": "Codex skill codex-rate-limit-reset",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        raise SystemExit(f"Request failed with HTTP {exc.code}: {detail}") from exc
    except urllib.error.URLError as exc:
        raise SystemExit(f"Request failed: {exc.reason}") from exc


def parse_time(value):
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def format_time(value, tz):
    dt = parse_time(value)
    if not dt:
        return "null"
    return f"{dt.isoformat()} UTC / {dt.astimezone(tz).isoformat()}"


def main():
    parser = argparse.ArgumentParser(description="Check Codex rate limit reset credit expirations.")
    parser.add_argument("--auth-file", help="Path to a Codex/ChatGPT auth.json file.")
    parser.add_argument("--json", action="store_true", help="Print the raw endpoint response.")
    parser.add_argument("--timezone", help="IANA timezone for local display, e.g. America/Vancouver.")
    args = parser.parse_args()

    token = find_token(args.auth_file)
    if not token:
        raise SystemExit(
            "No bearer token found. Set CHATGPT_BEARER_TOKEN or log in so ~/.codex/auth.json exists."
        )

    data = fetch_credits(token)
    if args.json:
        print(json.dumps(data, indent=2, sort_keys=True))
        return

    tz = ZoneInfo(args.timezone) if args.timezone else datetime.now().astimezone().tzinfo
    credits = data.get("credits", [])
    print(f"available_count: {data.get('available_count', 0)}")
    if not credits:
        return

    for i, credit in enumerate(credits, 1):
        print(f"\ncredit {i}:")
        for key in ("status", "reset_type", "title"):
            if key in credit:
                print(f"  {key}: {credit[key]}")
        print(f"  granted_at: {format_time(credit.get('granted_at'), tz)}")
        print(f"  expires_at: {format_time(credit.get('expires_at'), tz)}")
        print(f"  redeemed_at: {format_time(credit.get('redeemed_at'), tz)}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
