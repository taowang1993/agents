---
name: cyber
description: Temporarily run a security-focused codebase audit using a disabled third-party cybersecurity skill pack only when the user explicitly asks to use the cyber skill, run a cyber/security audit, or temporarily enable Anthropic-Cybersecurity-Skills. You must scan third-party skills with SkillSpector before installation or use; if the recommendation is DO_NOT_INSTALL, refuse to install, enable, or use them. If a safe pinned pack is already installed, enable it only for the audit, fix verified bugs, then turn it off immediately.
---

# Cyber

Use this skill to run a temporary cybersecurity audit without leaving a large third-party skill pack enabled afterward.

## Non-Negotiable Safety Gate

1. Scan the third-party skill pack with SkillSpector before you install, enable, or use it.
2. If SkillSpector reports `DO_NOT_INSTALL`, stop. Do not install it. Do not enable it. Do not load it with `--skill`. Do not use its scripts. Tell the user the scan blocked use.
3. Treat the current `mukul975/Anthropic-Cybersecurity-Skills` repository as blocked unless a fresh scan of the exact pinned revision reports a recommendation other than `DO_NOT_INSTALL`.

## Temporary Enablement Rule

TURN THE CYBERSECURITY PACK OFF AFTER USE. THIS IS NOT OPTIONAL.

Before you enable a safe installed pack, record the current disabled state. After the audit and fixes, restore the disabled state before your final response. If you cannot confirm it is disabled again, say so plainly and keep working until it is disabled.

At rest, the package must be disabled in `~/.pi/agent/settings.json` like this:

```json
{
  "source": "git:github.com/mukul975/Anthropic-Cybersecurity-Skills",
  "skills": []
}
```

To temporarily enable a safe installed pack, remove only the `skills` filter for that package entry, reload or restart Pi if needed, run the audit, then restore `"skills": []` immediately.

## Audit Workflow

1. Confirm authorization and scope. Audit only the user's codebase and systems they are allowed to test.
2. Check `git status --short` before editing. Do not overwrite unrelated user changes.
3. Run the smallest useful security checks first: dependency audit, secret scan, static analysis, tests, and targeted grep for risky patterns.
4. Use the external cybersecurity pack only if it passed the safety gate and the task needs its domain playbooks.
5. Fix root causes, not symptoms. Prefer one shared guard or config change over repeated caller patches.
6. Run one verification command that would fail if the fix broke.
7. Restore the package to disabled state and verify `~/.pi/agent/settings.json` contains `"skills": []` for the package before you answer.

## Final Response Checklist

Report only:

- What was audited
- What was fixed
- Verification command and result
- Confirmation: `Anthropic-Cybersecurity-Skills is disabled again`

If the pack was blocked by SkillSpector, report: `Blocked: SkillSpector returned DO_NOT_INSTALL; the pack was not installed, enabled, or used.`
