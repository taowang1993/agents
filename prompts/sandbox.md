---
description: Audit and close Tockbot sandboxing gaps against Codex
---

1. Clone `https://github.com/openai/codex` to `tmp`.

2. Review `.agents/research/codex-sandbox.md` against Codex source code to see if it is outdated or missing important details. Update it if yes. 

3. Read `.agents/reference/architecture.md` and `.agents/reference/sandbox.md` to understand how Tockbot implements sandboxing.

4. Write a report documenting any gaps between Tockbot and Codex sandboxing. 

4. Write a plan for closing any gaps. Then, implement the plan.

5. Update `.agents/reference/sandbox.md` if needed. Then, commit and push. 