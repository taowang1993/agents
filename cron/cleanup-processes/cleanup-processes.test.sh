#!/bin/bash
set -euo pipefail

DIR=$(cd "$(dirname "$0")" && pwd)
TMP=$(mktemp -d)
sleep 60 &
AUDIT_GROUP=$!
bash -c 'trap "" TERM; : >"$1"; while :; do :; done' _ "$TMP/audit-ready" &
AUDIT_CHILD=$!
while [ ! -e "$TMP/audit-ready" ]; do sleep 0.01; done
kill "$AUDIT_CHILD"
kill -0 "$AUDIT_CHILD"
export AUDIT_GROUP AUDIT_CHILD
trap 'kill -KILL "$AUDIT_GROUP" "$AUDIT_CHILD" 2>/dev/null || true; rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin" "$TMP/home"

cat >"$TMP/bin/ps" <<'EOF'
#!/bin/bash
case "$*" in
    '-eo pid,etime,command')
        printf '  PID     ELAPSED COMMAND\n'
        printf '%s       10:01 node /tmp/bin/pnpm audit --json\n' "$AUDIT_CHILD"
        printf '900006       09:59 node /tmp/bin/pnpm audit --json\n'
        printf '900007       40:00 node /tmp/bin/pnpm audit --json\n'
        ;;
    "-o pgid= -p $AUDIT_CHILD") echo "$AUDIT_GROUP" ;;
    '-o pgid= -p 900006') echo 900010 ;;
    '-o pgid= -p 900007') echo 900011 ;;
    "-o ppid= -p $AUDIT_GROUP") echo 1 ;;
    '-o ppid= -p 900010') echo 1 ;;
    '-o ppid= -p 900011') echo 42 ;;
    *)
        cat <<'PROCESSES'
  PID  PPID     ELAPSED COMMAND
900001     1       31:00 node /tmp/bin/pnpm --dir apps/web exec vitest run example.test.ts
900002 900001       31:00 node /tmp/node_modules/vitest/vitest.mjs run example.test.ts
900005 900002       31:00 node /tmp/node_modules/vitest/dist/workers/forks.js
900003     1       29:59 node /tmp/bin/pnpm --dir apps/web exec vitest run young.test.ts
900004    42    04:00:00 node /tmp/node_modules/vitest/vitest.mjs run attached.test.ts
PROCESSES
        ;;
esac
EOF

cat >"$TMP/bin/pgrep" <<'EOF'
#!/bin/bash
if [ "${1:-}" = -P ]; then
    case "${2:-}" in
        900001) echo 900002 ;;
        900002) echo 900005 ;;
        "$AUDIT_GROUP") echo "$AUDIT_CHILD" ;;
    esac
fi
EOF

cat >"$TMP/bin/lsof" <<'EOF'
#!/bin/bash
exit 1
EOF

chmod +x "$TMP/bin/ps" "$TMP/bin/pgrep" "$TMP/bin/lsof"
HOME="$TMP/home" PATH="$TMP/bin:/usr/bin:/bin:/usr/sbin:/sbin" /bin/bash "$DIR/cleanup-processes.sh"
LOG="$TMP/home/Library/Logs/cleanup-processes.log"

grep -q 'ORPHANED VITEST: pid=900001' "$LOG"
grep -q '900005 900002 900001' "$LOG"
if grep -qE 'pid=900003|pid=900004' "$LOG"; then exit 1; fi
grep -q "ORPHANED PNPM AUDIT: pid=$AUDIT_CHILD" "$LOG"
if grep -qE 'pid=900006|pid=900007' "$LOG"; then exit 1; fi
if kill -0 "$AUDIT_CHILD" 2>/dev/null; then exit 1; fi
if kill -0 "$AUDIT_GROUP" 2>/dev/null; then exit 1; fi
grep -q 'Done. Killed 2 process(es).' "$LOG"

echo "cleanup-processes test passed"
