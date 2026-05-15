#!/bin/bash
# Auto-update all git repositories in /Users/max/projects/resources
# Logs output with timestamps

LOG_DIR="$HOME/.cron-logs"
LOG_FILE="$LOG_DIR/update-repos-$(date +%Y%m%d).log"
PROJECTS_DIR="/Users/max/projects/resources"

mkdir -p "$LOG_DIR"

echo "=== Git Pull Started: $(date) ===" >> "$LOG_FILE"

# Find all directories that contain a .git folder (git repos)
# -mindepth 2: don't include the base projects directory itself
# -not -path: exclude build/checkout directories that may have corrupt refs
find -P "$PROJECTS_DIR" -type d -name ".git" -mindepth 2 \
    -not -path "*/.build/*" \
    -not -path "*/node_modules/*" \
    -not -path "*/target/*" | while read gitdir; do
    repo_dir=$(dirname "$gitdir")
    repo_name=$(basename "$repo_dir")
    
    # Check for valid remote before attempting pull
    if ! git -C "$repo_dir" remote get-url origin >/dev/null 2>&1; then
        echo "    ⚠ No remote configured" >> "$LOG_FILE"
        continue
    fi
    
    echo "" >> "$LOG_FILE"
    echo ">>> Updating: $repo_name ($repo_dir)" >> "$LOG_FILE"
    
    # Prune stale remote refs first (prevents file/directory ref conflicts
    # when a branch is renamed to a prefix, e.g. "copilot" → "copilot/*")
    git -C "$repo_dir" remote prune origin 2>&1 >> "$LOG_FILE"
    
    # Run git pull and capture output
    git -C "$repo_dir" pull --prune --quiet 2>&1 >> "$LOG_FILE"
    result=$?
    
    if [ $result -eq 0 ]; then
        echo "    ✓ Success" >> "$LOG_FILE"
    else
        echo "    ✗ Failed (exit code: $result)" >> "$LOG_FILE"
    fi
done

echo "=== Git Pull Completed: $(date) ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Repair dangling skill symlinks (e.g., if upstream moved a skill folder)
REPAIR_SCRIPT="$HOME/.local/bin/skills-repair-symlinks.sh"
if [ -x "$REPAIR_SCRIPT" ]; then
    LOG_FILE_OVERRIDE="$LOG_FILE" "$REPAIR_SCRIPT"
else
    echo ">>> Skill symlink repair: script not found at $REPAIR_SCRIPT" >> "$LOG_FILE"
fi
