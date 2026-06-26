---
description: Audit and close Tockbot sandboxing gaps against Codex
---

1. Clone `https://github.com/openai/codex` into `tmp/codex`.

2. Review `.agents/research/codex-sandbox.md` against the Codex source code. Update it if it is outdated or missing important details.

3. Read `.agents/reference/architecture.md` and `.agents/reference/sandbox.md` to understand how Tockbot implements sandboxing.

4. Write a report documenting any gaps between Tockbot and Codex sandboxing.

5. Write a plan for closing any gaps, then implement it.

6. Update `.agents/reference/sandbox.md` if needed. Then, commit and push the changes.

7. Remove `tmp/codex`.
