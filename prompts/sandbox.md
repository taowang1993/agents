---
description: Audit and close Tockbot sandboxing gaps against Codex
---

1. Read `.agents/research/codex-sandbox.md` to understand how Codex implements sandboxing. Review it against `/Users/max/projects/resources/.harness/codex` and update the document if it is outdated or missing important details.

2. Read `.agents/reference/architecture.md` and `.agents/reference/sandbox.md` to understand how Tockbot implements sandboxing.

3. Write a report documenting any gaps between Tockbot and Codex sandboxing. 

4. Write a practical plan for closing any gaps and implement that plan.

5. Update `.agents/reference/sandbox.md` if needed.

6. Verify the changes with the smallest relevant tests or checks available in the repository. If verification cannot be run, explain why.