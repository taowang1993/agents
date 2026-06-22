#!/usr/bin/env python3
"""Nightshift launchd worker.

launchd starts this every few minutes. This script holds one lock, then runs
Nightshift tasks back-to-back until the configured time window closes.
"""

from __future__ import annotations

import argparse
import os
import random
import re
import shutil
import signal
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEFAULT_ENV = ROOT / ".env"
TRUE_VALUES = {"1", "true", "yes", "on"}
FALSE_VALUES = {"0", "false", "no", "off"}
CURRENT_PROC: subprocess.Popen[str] | None = None


def parse_env(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[len("export ") :].strip()
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        values[key] = value
    return values


def expand_path(value: str) -> Path:
    return Path(os.path.expandvars(os.path.expanduser(value))).resolve()


def bool_value(value: str, *, default: bool = False) -> bool:
    normalized = value.strip().lower()
    if normalized in TRUE_VALUES:
        return True
    if normalized in FALSE_VALUES:
        return False
    return default


def minute_of_day(value: str) -> int:
    match = re.fullmatch(r"(\d{1,2}):(\d{2})", value.strip())
    if not match:
        raise ValueError(f"Invalid time {value!r}; expected HH:MM")
    hour = int(match.group(1))
    minute = int(match.group(2))
    if not (0 <= hour <= 23 and 0 <= minute <= 59):
        raise ValueError(f"Invalid time {value!r}; expected HH:MM")
    return hour * 60 + minute


def current_minutes(now: datetime | None = None) -> int:
    now = now or datetime.now()
    return now.hour * 60 + now.minute


def inside_window(start: str, end: str, now: datetime | None = None) -> bool:
    start_m = minute_of_day(start)
    end_m = minute_of_day(end)
    now_m = current_minutes(now)
    if start_m == end_m:
        return True
    if start_m < end_m:
        return start_m <= now_m < end_m
    return now_m >= start_m or now_m < end_m


def shift_date(start: str, end: str, now: datetime | None = None) -> str:
    now = now or datetime.now()
    start_m = minute_of_day(start)
    end_m = minute_of_day(end)
    today = now.date()
    if start_m > end_m and current_minutes(now) < end_m:
        today -= timedelta(days=1)
    return today.isoformat()


def ensure_progress(path: Path) -> None:
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("# Nightshift Progress\n", encoding="utf-8")


def read_day_statuses(path: Path, day: str) -> dict[str, str]:
    if not path.exists():
        return {}
    statuses: dict[str, str] = {}
    in_day = False
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("## "):
            in_day = line.strip() == f"## {day}"
            continue
        if not in_day:
            continue
        match = re.match(r"-\s+([^:]+):\s*(\S+)", line)
        if match:
            statuses[match.group(1).strip()] = match.group(2).strip()
    return statuses


def mark_progress(path: Path, day: str, task_name: str, status: str) -> None:
    ensure_progress(path)
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines:
        lines = ["# Nightshift Progress"]

    heading = f"## {day}"
    try:
        start = lines.index(heading)
    except ValueError:
        if lines and lines[-1].strip():
            lines.append("")
        lines.extend([heading, f"- {task_name}: {status}"])
        path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
        return

    end = len(lines)
    for index in range(start + 1, len(lines)):
        if lines[index].startswith("## "):
            end = index
            break

    replacement = f"- {task_name}: {status}"
    for index in range(start + 1, end):
        if lines[index].startswith(f"- {task_name}:"):
            lines[index] = replacement
            break
    else:
        lines.insert(end, replacement)

    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def live_pid(pid: int) -> bool:
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    return True


class Lock:
    def __init__(self, path: Path):
        self.path = path
        self.owned = False

    def __enter__(self) -> "Lock":
        try:
            self.path.mkdir(parents=True)
        except FileExistsError:
            pid_file = self.path / "pid"
            pid = None
            if pid_file.exists():
                try:
                    pid = int(pid_file.read_text(encoding="utf-8").strip())
                except ValueError:
                    pid = None
            if pid and live_pid(pid):
                print(f"Nightshift already running with pid {pid}; exiting.")
                raise SystemExit(0)
            shutil.rmtree(self.path, ignore_errors=True)
            self.path.mkdir(parents=True)
        (self.path / "pid").write_text(str(os.getpid()), encoding="utf-8")
        self.owned = True
        return self

    def __exit__(self, *_: object) -> None:
        if self.owned:
            shutil.rmtree(self.path, ignore_errors=True)


def git_output(repo: Path, *args: str) -> str:
    return subprocess.check_output(["git", "-C", str(repo), *args], text=True, stderr=subprocess.STDOUT)


def git_status(repo: Path) -> str:
    return git_output(repo, "status", "--porcelain", "--untracked-files=all").strip()


def require_clean_repo(repo: Path) -> tuple[bool, str]:
    try:
        dirty = git_status(repo)
    except subprocess.CalledProcessError as exc:
        return False, exc.output.strip() or str(exc)
    if dirty:
        return False, f"Worktree is dirty:\n{dirty}"
    return True, "clean"


def tasks(task_dir: Path) -> list[Path]:
    if not task_dir.exists():
        return []
    return sorted(path for path in task_dir.glob("*.md") if path.is_file() and not path.name.startswith("_"))


def pick_task(task_dir: Path, progress: Path, day: str, retry_failed: bool) -> Path | None:
    statuses = read_day_statuses(progress, day)
    candidates = []
    for task in tasks(task_dir):
        status = statuses.get(task.name)
        if status == "done":
            continue
        if status == "failed" and not retry_failed:
            continue
        candidates.append(task)
    return random.choice(candidates) if candidates else None


def load_task_input(task: Path) -> str:
    return task.read_text(encoding="utf-8").strip()


def stop_child(signum: int, _: object) -> None:
    proc = CURRENT_PROC
    if proc and proc.poll() is None:
        try:
            os.killpg(proc.pid, signum)
            proc.wait(timeout=15)
        except ProcessLookupError:
            pass
        except subprocess.TimeoutExpired:
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
    raise SystemExit(128 + signum)


def run_pi(task: Path, repo: Path, progress: Path, cfg: dict[str, str]) -> bool:
    global CURRENT_PROC
    pi_bin = cfg.get("NIGHTSHIFT_PI_BIN") or shutil.which("pi") or "pi"
    cmd = [
        pi_bin,
        "--approve",
        "--print",
        "--name",
        f"Nightshift: {task.stem}",
        "--exclude-tools",
        "subagent",
    ]
    if model := cfg.get("NIGHTSHIFT_PI_MODEL"):
        cmd.extend(["--model", model])
    if thinking := cfg.get("NIGHTSHIFT_PI_THINKING"):
        cmd.extend(["--thinking", thinking])
    cmd.append(load_task_input(task))

    log_dir = expand_path(cfg.get("NIGHTSHIFT_LOG_DIR", "~/.cron-logs/nightshift"))
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / f"{datetime.now().strftime('%Y%m%d-%H%M%S')}-{task.stem}.log"

    print(f"Running {task.name}; log: {log_path}")
    env = os.environ.copy()
    env["NIGHTSHIFT_TASK"] = task.name
    env["NIGHTSHIFT_PROGRESS"] = str(progress)
    with log_path.open("w", encoding="utf-8") as log:
        proc = subprocess.Popen(
            cmd,
            cwd=str(repo),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            env=env,
            start_new_session=True,
        )
        CURRENT_PROC = proc
        try:
            assert proc.stdout is not None
            for line in proc.stdout:
                print(line, end="")
                log.write(line)
                log.flush()
            returncode = proc.wait()
        finally:
            CURRENT_PROC = None

    if returncode == 0:
        return True
    print(f"Nightshift task {task.name} failed. exit={returncode}")
    return False


def config(env_path: Path) -> dict[str, str]:
    cfg = {
        "NIGHTSHIFT_ENABLED": "true",
        "NIGHTSHIFT_START": "00:00",
        "NIGHTSHIFT_END": "08:00",
        "NIGHTSHIFT_RETRY_FAILED": "false",
        "NIGHTSHIFT_REQUIRE_CLEAN_REPO": "false",
        "NIGHTSHIFT_REPO": "/Users/max/projects/tockbot",
        "NIGHTSHIFT_TASK_DIR": str(ROOT / "tasks"),
        "NIGHTSHIFT_PROGRESS": str(ROOT / "progress.md"),
        "NIGHTSHIFT_LOCK_DIR": str(ROOT / ".nightshift.lock"),
        "NIGHTSHIFT_LOG_DIR": "~/.cron-logs/nightshift",
        "NIGHTSHIFT_PI_THINKING": "high",
    }
    cfg.update(parse_env(env_path))
    return cfg


def dry_run(cfg: dict[str, str], ignore_window: bool) -> int:
    start = cfg["NIGHTSHIFT_START"]
    end = cfg["NIGHTSHIFT_END"]
    day = shift_date(start, end)
    progress = expand_path(cfg["NIGHTSHIFT_PROGRESS"])
    task_dir = expand_path(cfg["NIGHTSHIFT_TASK_DIR"])
    retry_failed = bool_value(cfg.get("NIGHTSHIFT_RETRY_FAILED", "false"))
    require_clean = bool_value(cfg.get("NIGHTSHIFT_REQUIRE_CLEAN_REPO", "false"))
    inside = inside_window(start, end)
    selected = pick_task(task_dir, progress, day, retry_failed)
    print(f"enabled={cfg['NIGHTSHIFT_ENABLED']}")
    print(f"window={start}-{end} inside={inside} ignore_window={ignore_window}")
    print(f"require_clean_repo={require_clean}")
    print(f"shift_date={day}")
    print(f"repo={expand_path(cfg['NIGHTSHIFT_REPO'])}")
    print(f"task_dir={task_dir}")
    print(f"progress={progress}")
    print(f"selected={selected.name if selected else 'none'}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Nightshift tasks back-to-back inside the configured time window.")
    parser.add_argument("--env", default=str(DEFAULT_ENV), help="Path to Nightshift .env file.")
    parser.add_argument("--dry-run", action="store_true", help="Print the task that would run, then exit.")
    parser.add_argument("--ignore-window", action="store_true", help="Run even outside the configured time window.")
    parser.add_argument("--once", action="store_true", help="Run at most one selected task.")
    args = parser.parse_args()

    cfg = config(expand_path(args.env))
    if args.dry_run:
        return dry_run(cfg, args.ignore_window)
    if not bool_value(cfg.get("NIGHTSHIFT_ENABLED", "true"), default=True):
        print("Nightshift disabled by config.")
        return 0

    start = cfg["NIGHTSHIFT_START"]
    end = cfg["NIGHTSHIFT_END"]
    if not args.ignore_window and not inside_window(start, end):
        print(f"Outside Nightshift window {start}-{end}; exiting.")
        return 0

    repo = expand_path(cfg["NIGHTSHIFT_REPO"])
    task_dir = expand_path(cfg["NIGHTSHIFT_TASK_DIR"])
    progress = expand_path(cfg["NIGHTSHIFT_PROGRESS"])
    lock_dir = expand_path(cfg["NIGHTSHIFT_LOCK_DIR"])
    retry_failed = bool_value(cfg.get("NIGHTSHIFT_RETRY_FAILED", "false"))
    require_clean = bool_value(cfg.get("NIGHTSHIFT_REQUIRE_CLEAN_REPO", "false"))

    with Lock(lock_dir):
        while args.ignore_window or inside_window(start, end):
            day = shift_date(start, end)
            task = pick_task(task_dir, progress, day, retry_failed)
            if not task:
                print(f"No unfinished Nightshift tasks for {day}.")
                return 0

            if require_clean:
                ready, reason = require_clean_repo(repo)
                if not ready:
                    print(reason)
                    return 1

            mark_progress(progress, day, task.name, "started")
            ok = run_pi(task, repo, progress, cfg)
            if ok:
                mark_progress(progress, day, task.name, "done")
            else:
                mark_progress(progress, day, task.name, "failed")
                return 1

            if args.once:
                return 0 if ok else 1

    return 0


if __name__ == "__main__":
    signal.signal(signal.SIGINT, stop_child)
    signal.signal(signal.SIGTERM, stop_child)
    raise SystemExit(main())
