---
description: Plan TockDriver evolution from the Pi SDK and Tockbot architecture
---

Evolve TockDriver as Tockbot's generalist daily-driver agent. Use the Pi SDK docs and Tockbot architecture as the source of truth.

1. Read the Pi SDK docs from the installed Pi package:

   - Start with `docs/sdk.md`.
   - Selectively read these docs when relevant to the evolution plan:
     - `docs/rpc.md`
     - `docs/session-format.md`
     - `docs/sessions.md`
     - `docs/settings.md`
     - `docs/providers.md`
     - `docs/models.md`
     - `docs/custom-provider.md`
     - `docs/extensions.md`
     - `docs/skills.md`
     - `docs/prompt-templates.md`
     - `docs/packages.md`
     - `docs/security.md`
     - `docs/containerization.md`
     - `docs/compaction.md`
     - `docs/json.md`
   - Skip TUI, theme, keybinding, and platform setup docs unless the plan touches Pi UI or platform setup.

2. Read `.agents/reference/architecture.md` and `.agents/reference/subagent.md`.

3. Inspect the current TockDriver/Pi integration, especially `packages/agent-service/src/service.ts`, `packages/agent-service/src/pi-runtime/run.ts`, and nearby runtime/session/subagent files.

4. Write a concise evolution report in `.beads/report/` covering current capabilities, robustness gaps, generalist-agent opportunities, architecture constraints, and the smallest useful next steps.

5. Write a plan for high-confidence follow-up work.