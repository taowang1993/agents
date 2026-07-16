#!/bin/bash
set -euo pipefail

DIR=$(cd "$(dirname "$0")" && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin" "$TMP/home"

cat >"$TMP/bin/ps" <<'EOF'
#!/bin/bash
cat <<'PROCESSES'
  PID  PPID     ELAPSED COMMAND
900001     1    02:30:00 node /tmp/node_modules/vitest/vitest.mjs run example.test.ts
900002 900001    02:30:00 node /tmp/node_modules/vitest/dist/workers/forks.js
900003     1    01:59:59 node /tmp/node_modules/vitest/vitest.mjs run young.test.ts
900004    42    04:00:00 node /tmp/node_modules/vitest/vitest.mjs run attached.test.ts
PROCESSES
EOF

cat >"$TMP/bin/pgrep" <<'EOF'
#!/bin/bash
if [ "${1:-}" = -P ] && [ "${2:-}" = 900001 ]; then
    echo 900002
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
grep -q 'Killing 2 stale process(es): 900002 900001' "$LOG"
! grep -q 'pid=900003' "$LOG"
! grep -q 'pid=900004' "$LOG"

echo "cleanup-processes test passed"
