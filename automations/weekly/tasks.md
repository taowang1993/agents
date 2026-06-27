# Tasks

## 00:00

1. Review `web.md` against the codebase to see if it is outdated or missing important details. Update it if needed. 

2. Review the entire design system using the design-system skill. Fix bad code if any. 

3. Update `web.md`. Then, commit and push. 

## 01:00

1. Review `native.md` against the codebase to see if it is outdated or missing important details. Update it if needed. 

2. Review the entire design system using the tamagui skill. Fix bad code if any. 

3. Update `native.md`. Then, commit and push. 

## 02:00

Use the clawpatch skill to review the entire codebase. Fix all the findings that are not false positive. Commit and push.

## 03:00

Run the weekly OpenClaw/Pi audit for TockDriver.

1. Review `/Users/max/projects/resources/.generalist/openclaw-pi.md` against `/Users/max/projects/resources/.generalist/openclaw`. 

2. Update `.agents/research/openclaw-pi.md` only if it is stale or missing important implementation details.

3. Read the Pi SDK docs, `.agents/reference/architecture.md`, and `.agents/reference/subagent.md`.

4. Write a concise audit report in `.beads/report/` covering OpenClaw changes, Pi SDK changes, TockDriver-relevant lessons, architecture fit/no-fit, and recommended follow-up work.

5. Do not implement runtime changes automatically. Use beads to create or update follow-up issues for high-confidence work.

6. Run the smallest relevant validation. Commit and push only audit, report, and task-tracking changes made by this run.