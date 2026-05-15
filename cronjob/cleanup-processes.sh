#!/bin/bash
# cleanup-stale.sh — Kill orphaned/zombie user processes that outlived their purpose.
# Safe to run daily via launchd. Logs to ~/Library/Logs/cleanup-processes.log

set -euo pipefail
LOG="$HOME/Library/Logs/cleanup-processes.log"
mkdir -p "$(dirname "$LOG")"

exec >>"$LOG" 2>&1
echo "=== $(date) ==="

KILLED=0
declare -a PIDS_TO_KILL=()

# ── 1. Superset orphans (crashpad_handler, terminal-host, host-service, pty-daemon)
#    PPID=1 means the parent Superset.app is gone. Kill if >1 hour old.
while read -r pid etime cmd; do
    # etime format: "DD-HH:MM:SS" or "HH:MM:SS"
    days=$(echo "$etime" | awk -F'[-:]' '{if (NF==4) print $1; else print 0}')
    if [ "$days" -ge 0 ]; then
        # For Superset orphans, 1+ hour is already stale
        hours=$(echo "$etime" | awk -F'[-:]' '{if (NF==4) print $2; else print $1}')
        if [ "${hours:-0}" -ge 1 ] || [ "$days" -ge 1 ]; then
            PIDS_TO_KILL+=("$pid")
            echo "  SUPERSET ORPHAN: pid=$pid age=$etime cmd=$cmd"
        fi
    fi
done < <(ps -eo pid,ppid,etime,command | \
    awk '$2==1 && /Superset/ && /(crashpad_handler|terminal-host|host-service|pty-daemon)/ {print $1, $3, substr($0, index($0,$4))}')

# ── 2. Stale dev servers: Node processes listening on localhost, >3 days
while read -r pid etime cmd; do
    days=$(echo "$etime" | awk -F'[-:]' '{if (NF==4) print $1; else print 0}')
    if [ "$days" -ge 3 ]; then
        # Double-check it's listening on a port
        if lsof -p "$pid" -i TCP -s TCP:LISTEN 2>/dev/null | grep -q LISTEN; then
            PIDS_TO_KILL+=("$pid")
            echo "  STALE DEV SERVER: pid=$pid age=$etime cmd=$cmd"
        fi
    fi
done < <(ps -eo pid,ppid,etime,command | \
    awk '$2==1 && /node/ && /listen|server|--port|\.listen\(/ {print $1, $3, substr($0, index($0,$4))}')

# ── 3. Zombie caffeinate >1 day (caffeinate -t 3600 should exit in 1 hour)
while read -r pid etime cmd; do
    days=$(echo "$etime" | awk -F'[-:]' '{if (NF==4) print $1; else print 0}')
    if [ "$days" -ge 1 ]; then
        PIDS_TO_KILL+=("$pid")
        echo "  ZOMBIE CAFFEINATE: pid=$pid age=$etime cmd=$cmd"
    fi
done < <(ps -eo pid,ppid,etime,command | awk '$2==1 && /caffeinate/ {print $1, $3, substr($0, index($0,$4))}')

# ── 4. Orphaned app helpers/subsystems (PPID=1, known-leaky patterns only, >3 days)
#    We target crashpad handlers, updaters, autoupdaters — not the main apps themselves.
while read -r pid etime cmd; do
    days=$(echo "$etime" | awk -F'[-:]' '{if (NF==4) print $1; else print 0}')
    if [ "$days" -ge 3 ]; then
        PIDS_TO_KILL+=("$pid")
        echo "  ORPHANED HELPER: pid=$pid age=$etime cmd=$cmd"
    fi
done < <(ps -eo pid,ppid,etime,command | \
    awk '$2==1 && /\/Applications\// && /(crashpad_handler|Autoupdate|Updater|Sparkle|Helper\(Renderer\))/ && !/Microsoft Edge\.app/ && !/Visual Studio Code/ && !/Warp/ {print $1, $3, substr($0, index($0,$4))}')

# ── Kill phase
if [ ${#PIDS_TO_KILL[@]} -eq 0 ]; then
    echo "Nothing to kill."
    exit 0
fi

# Deduplicate
UNIQUE_PIDS=($(printf '%s\n' "${PIDS_TO_KILL[@]}" | sort -nu))

echo "Killing ${#UNIQUE_PIDS[@]} stale process(es): ${UNIQUE_PIDS[*]}"
for pid in "${UNIQUE_PIDS[@]}"; do
    if kill "$pid" 2>/dev/null; then
        echo "  ✓ killed $pid"
        ((KILLED++))
    else
        echo "  ✗ failed to kill $pid (already gone?)"
    fi
done

echo "Done. Killed $KILLED process(es)."
echo ""
