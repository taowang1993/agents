# Quality Grades

_Last updated: __DATE__

Grades track code health per domain/layer. Agents consult this before prioritizing cleanup work.

## Repository domains

| Domain | Scope | Grade | Trend | Issues | Evidence | Owner | Next review | Last audit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Agent Workflow | `.agents/**`, workflow skill, execution-plan loop | B | → | Fresh scaffold — keep audits and runtime contract aligned with reality | `.agents/skills/workflow/SKILL.md`, `scripts/audit/workflow-harness.*` | Coding agent | __NEXT_REVIEW__ | __DATE__ |
| Knowledge Base | `AGENTS.md`, `.agents/reference/**`, plan/index discoverability | B | → | Fresh scaffold — keep docs short, canonical, and linked | `AGENTS.md`, `scripts/audit/doc-freshness.*` | Coding agent | __NEXT_REVIEW__ | __DATE__ |
| CI & Audits | CI config, audit scripts, maintenance scheduling | B | → | Fresh scaffold — confirm jobs run on real infra and schedule is active | CI workflow/config, `scripts/audit/**` | Coding agent | __NEXT_REVIEW__ | __DATE__ |
| Documentation | repo-local process and strategy docs | B | → | Fresh scaffold — avoid duplicate contract bodies across `/docs/**` and `.agents/reference/**` | `.agents/reference/**`, `/docs/**` | Coding agent | __NEXT_REVIEW__ | __DATE__ |
| Core Product | primary product/runtime surface | B | → | Replace this with repo-specific product domains after the first real audit | repo-specific evidence | Coding agent | __NEXT_REVIEW__ | __DATE__ |
| Security | workflow posture, secrets, runtime boundaries | B | → | Keep secure boundaries and secret handling covered by normal repo checks | repo-specific security evidence | Coding agent | __NEXT_REVIEW__ | __DATE__ |

## Change log

| Date | Domain | Change | Reason |
| --- | --- | --- | --- |
| __DATE__ | Agent Workflow | new → B | Initial scaffold installed |
| __DATE__ | Knowledge Base | new → B | Initial scaffold installed |
| __DATE__ | CI & Audits | new → B | Initial scaffold installed |
| __DATE__ | Documentation | new → B | Initial scaffold installed |
| __DATE__ | Core Product | new → B | Initial scaffold installed |
| __DATE__ | Security | new → B | Initial scaffold installed |

**Update rule:** Agents update this file after each maintenance pass. Grade changes require evidence and a change-log entry.
