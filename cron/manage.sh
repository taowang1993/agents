#!/usr/bin/env python3
"""Manage Max's user-created launchd cron jobs.

This file is intentionally dependency-free: it uses jobs.json plus macOS
launchctl/plistlib so it works in a minimal launchd-style environment.
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import plistlib
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
JOBS_FILE = ROOT / "jobs.json"
USER_DOMAIN = f"gui/{os.getuid()}"


@dataclass
class LaunchState:
    loaded: bool
    pid: str
    last_status: str
    disabled: bool


def load_config() -> dict[str, Any]:
    with JOBS_FILE.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def jobs() -> list[dict[str, Any]]:
    return load_config().get("jobs", [])


def expand_path(value: str) -> Path:
    expanded = os.path.expandvars(os.path.expanduser(value))
    path = Path(expanded)
    if not path.is_absolute():
        path = ROOT / path
    return path


def launch_agent_path(job: dict[str, Any]) -> Path:
    return Path.home() / "Library/LaunchAgents" / f"{job['label']}.plist"


def resolve_job(name: str) -> dict[str, Any]:
    matches = [
        job
        for job in jobs()
        if name in {job.get("id"), job.get("label"), job.get("group")}
    ]
    if not matches:
        raise SystemExit(f"Unknown job: {name}")
    if len(matches) > 1 and all(job.get("id") != name and job.get("label") != name for job in matches):
        ids = ", ".join(job["id"] for job in matches)
        raise SystemExit(f"{name!r} matches multiple jobs: {ids}")
    if len(matches) > 1:
        exact = [job for job in matches if name in {job.get("id"), job.get("label")}]
        if len(exact) == 1:
            return exact[0]
    return matches[0]


def run_capture(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def loaded_labels() -> dict[str, tuple[str, str]]:
    proc = run_capture(["launchctl", "list"])
    labels: dict[str, tuple[str, str]] = {}
    if proc.returncode != 0:
        return labels
    for line in proc.stdout.splitlines()[1:]:
        parts = line.split("\t")
        if len(parts) >= 3:
            labels[parts[2]] = (parts[0], parts[1])
    return labels


def disabled_labels() -> dict[str, bool]:
    proc = run_capture(["launchctl", "print-disabled", USER_DOMAIN])
    if proc.returncode != 0:
        return {}
    return {
        match.group(1): match.group(2) == "true"
        for match in re.finditer(r'"([^"]+)"\s*=>\s*(true|false)', proc.stdout)
    }


def launch_state(label: str) -> LaunchState:
    loaded = loaded_labels()
    disabled = disabled_labels()
    pid, status = loaded.get(label, ("-", "-"))
    return LaunchState(label in loaded, pid, status, disabled.get(label, False))


def read_plist(path: Path) -> dict[str, Any]:
    with path.open("rb") as fh:
        return plistlib.load(fh)


def schedule_from_plist(path: Path) -> str:
    try:
        data = read_plist(path)
    except Exception:
        return "unreadable"

    bits: list[str] = []
    if data.get("RunAtLoad"):
        bits.append("Run At Load")
    if "StartInterval" in data:
        seconds = data["StartInterval"]
        if seconds % 3600 == 0:
            bits.append(f"Every {seconds // 3600}h")
        elif seconds % 60 == 0:
            bits.append(f"Every {seconds // 60}m")
        else:
            bits.append(f"Every {seconds}s")

    calendar = data.get("StartCalendarInterval")
    if calendar:
        entries = calendar if isinstance(calendar, list) else [calendar]
        formatted: list[str] = []
        for entry in entries:
            if not isinstance(entry, dict):
                continue
            hour = entry.get("Hour", "*")
            minute = entry.get("Minute", "*")
            weekday = entry.get("Weekday")
            if isinstance(minute, int):
                minute = f"{minute:02d}"
            prefix = f"Weekday {weekday} " if weekday is not None else ""
            formatted.append(f"{prefix}{hour}:{minute}")
        if formatted:
            bits.append("Calendar " + ", ".join(formatted))

    if "KeepAlive" in data:
        bits.append("Keep Alive")

    return "; ".join(bits) if bits else "Manual/On Demand"


def newest_log(job: dict[str, Any]) -> Path | None:
    candidates: list[Path] = []
    for spec in job.get("logs", []):
        expanded = os.path.expandvars(os.path.expanduser(spec))
        matches = [Path(path) for path in glob.glob(expanded)] if any(ch in expanded for ch in "*?[") else [Path(expanded)]
        candidates.extend(path for path in matches if path.exists())
    if not candidates:
        return None
    return max(candidates, key=lambda p: p.stat().st_mtime)


def print_table(rows: list[list[str]], headers: list[str]) -> None:
    table = [headers] + rows
    widths = [max(len(row[i]) for row in table) for i in range(len(headers))]
    print("  ".join(headers[i].ljust(widths[i]) for i in range(len(headers))))
    print("  ".join("-" * widths[i] for i in range(len(headers))))
    for row in rows:
        print("  ".join(row[i].ljust(widths[i]) for i in range(len(headers))))


def cmd_list(_: argparse.Namespace) -> int:
    rows: list[list[str]] = []
    loaded = loaded_labels()
    disabled = disabled_labels()
    for job in jobs():
        label = job["label"]
        pid, last_status = loaded.get(label, ("-", "-"))
        state = "running" if pid != "-" else ("loaded" if label in loaded else "unloaded")
        if disabled.get(label, False):
            state = "disabled"
        rows.append([
            job["id"],
            state,
            schedule_from_plist(expand_path(job["plist"])),
            last_status,
            job.get("description", ""),
        ])
    print_table(rows, ["Job", "State", "Schedule", "Last", "Description"])
    return 0


def cmd_status(args: argparse.Namespace) -> int:
    selected = [resolve_job(args.job)] if args.job else jobs()
    for index, job in enumerate(selected):
        if index:
            print()
        plist = expand_path(job["plist"])
        script = expand_path(job["script"])
        state = launch_state(job["label"])
        log = newest_log(job)
        print(f"{job['id']} ({job['label']})")
        print(f"  Description: {job.get('description', '-')}")
        print(f"  Group:       {job.get('group', '-')}")
        print(f"  State:       {'disabled' if state.disabled else ('running' if state.pid != '-' else ('loaded' if state.loaded else 'unloaded'))}")
        print(f"  Loaded:      {state.loaded}")
        print(f"  PID:         {state.pid}")
        print(f"  Last Status: {state.last_status}")
        print(f"  Disabled:    {state.disabled}")
        launch_agent = launch_agent_path(job)
        print(f"  Schedule:    {schedule_from_plist(plist)}")
        print(f"  Script:      {script}")
        print(f"  Plist:       {plist}")
        print(f"  LaunchAgent: {launch_agent} -> {launch_agent.resolve() if launch_agent.exists() else 'missing'}")
        print(f"  Newest Log:  {log if log else 'none found'}")
    return 0


def launchctl(*parts: str, check: bool = False) -> int:
    proc = subprocess.run(["launchctl", *parts], text=True)
    if check and proc.returncode != 0:
        raise SystemExit(proc.returncode)
    return proc.returncode


def cmd_enable(args: argparse.Namespace) -> int:
    job = resolve_job(args.job)
    plist = launch_agent_path(job)
    label = job["label"]
    launchctl("enable", f"{USER_DOMAIN}/{label}", check=False)
    if not launch_state(label).loaded:
        launchctl("bootstrap", USER_DOMAIN, str(plist), check=False)
    print(f"Enabled {job['id']} ({label}).")
    return 0


def cmd_disable(args: argparse.Namespace) -> int:
    job = resolve_job(args.job)
    plist = launch_agent_path(job)
    label = job["label"]
    launchctl("disable", f"{USER_DOMAIN}/{label}", check=False)
    if launch_state(label).loaded:
        launchctl("bootout", USER_DOMAIN, str(plist), check=False)
    print(f"Disabled {job['id']} ({label}).")
    return 0


def cmd_reload(args: argparse.Namespace) -> int:
    job = resolve_job(args.job)
    plist = launch_agent_path(job)
    label = job["label"]
    launchctl("bootout", USER_DOMAIN, str(plist), check=False)
    rc = launchctl("bootstrap", USER_DOMAIN, str(plist), check=False)
    if disabled_labels().get(label, False):
        print(f"Reloaded {job['id']}, but it is still disabled. Run enable if needed.")
    else:
        print(f"Reloaded {job['id']} ({label}).")
    return rc


def cmd_run(args: argparse.Namespace) -> int:
    job = resolve_job(args.job)
    script = expand_path(job["script"])
    cmd = [str(script), *[str(arg) for arg in job.get("args", [])], *args.extra]
    print("Running:", " ".join(cmd))
    return subprocess.call(cmd, cwd=str(ROOT))


def cmd_logs(args: argparse.Namespace) -> int:
    job = resolve_job(args.job)
    log = newest_log(job)
    if not log:
        print(f"No logs found for {job['id']}.", file=sys.stderr)
        return 1
    print(f"==> {log} <==")
    proc = subprocess.run(["tail", "-n", str(args.lines), str(log)])
    return proc.returncode


def validate_job(job: dict[str, Any]) -> list[str]:
    issues: list[str] = []
    plist = expand_path(job["plist"])
    script = expand_path(job["script"])
    launch_agent = launch_agent_path(job)

    if not script.exists():
        issues.append(f"missing script: {script}")
    elif not os.access(script, os.X_OK):
        issues.append(f"script is not executable: {script}")

    if not plist.exists():
        issues.append(f"missing canonical plist: {plist}")
        return issues

    if not launch_agent.exists():
        issues.append(f"missing LaunchAgent symlink: {launch_agent}")
    elif not launch_agent.is_symlink():
        issues.append(f"LaunchAgent is not a symlink: {launch_agent}")
    elif launch_agent.resolve() != plist.resolve():
        issues.append(f"LaunchAgent symlink points to {launch_agent.resolve()}, expected {plist.resolve()}")

    try:
        data = read_plist(plist)
    except Exception as exc:
        issues.append(f"unreadable plist {plist}: {exc}")
        return issues

    if data.get("Label") != job["label"]:
        issues.append(f"plist label mismatch: expected {job['label']}, got {data.get('Label')}")

    if job.get("group") == "nightshift":
        for required in (ROOT / "nightshift/.env", ROOT / "nightshift/review.md"):
            if not required.exists():
                issues.append(f"missing Night Shift file: {required}")

    program = data.get("Program")
    program_args = data.get("ProgramArguments")
    target = program or (program_args[0] if isinstance(program_args, list) and program_args else None)
    if target and not Path(os.path.expandvars(os.path.expanduser(target))).exists():
        issues.append(f"plist program target missing: {target}")

    return issues


def cmd_doctor(_: argparse.Namespace) -> int:
    rows: list[list[str]] = []
    failed = False
    for job in jobs():
        issues = validate_job(job)
        state = launch_state(job["label"])
        status = "OK" if not issues else "ISSUE"
        if issues:
            failed = True
        rows.append([
            job["id"],
            status,
            "yes" if state.loaded else "no",
            "yes" if state.disabled else "no",
            "; ".join(issues) if issues else "-",
        ])
    print_table(rows, ["Job", "Check", "Loaded", "Disabled", "Details"])
    return 1 if failed else 0


def cmd_paths(_: argparse.Namespace) -> int:
    rows = []
    for job in jobs():
        rows.append([job["id"], str(expand_path(job["script"])), str(expand_path(job["plist"])), str(launch_agent_path(job))])
    print_table(rows, ["Job", "Script", "Plist", "LaunchAgent"])
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Manage ~/.agents/cron launchd jobs.")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("list", help="Show all managed jobs.")
    p.set_defaults(func=cmd_list)

    p = sub.add_parser("status", help="Show detailed status for all jobs or one job.")
    p.add_argument("job", nargs="?", help="Job id, label, or unambiguous group name.")
    p.set_defaults(func=cmd_status)

    p = sub.add_parser("enable", help="Enable and bootstrap one job.")
    p.add_argument("job")
    p.set_defaults(func=cmd_enable)

    p = sub.add_parser("disable", help="Disable and unload one job.")
    p.add_argument("job")
    p.set_defaults(func=cmd_disable)

    p = sub.add_parser("reload", help="Bootout/bootstrap one job after plist edits.")
    p.add_argument("job")
    p.set_defaults(func=cmd_reload)

    p = sub.add_parser("run", help="Run a job script now, outside launchd.")
    p.add_argument("job")
    p.add_argument("extra", nargs=argparse.REMAINDER, help="Extra args appended to the script command.")
    p.set_defaults(func=cmd_run)

    p = sub.add_parser("logs", help="Tail the newest log for a job.")
    p.add_argument("job")
    p.add_argument("-n", "--lines", type=int, default=80)
    p.set_defaults(func=cmd_logs)

    p = sub.add_parser("doctor", help="Validate scripts, plist symlinks, labels, and loaded state.")
    p.set_defaults(func=cmd_doctor)

    p = sub.add_parser("paths", help="Show canonical script and plist paths.")
    p.set_defaults(func=cmd_paths)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
