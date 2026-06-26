---
description: Audit and close Tockbot sandboxing gaps against Codex
---

1. Clone `https://github.com/openai/codex` into `tmp/codex`.

2. Review `.agents/research/codex-sandbox.md` against the cloned Codex source code. Update it if it is outdated or missing important details.

3. Read `.agents/reference/architecture.md` and `.agents/reference/sandbox.md` to understand how Tockbot implements sandboxing.

4. Write a report documenting any gaps between Tockbot and Codex sandboxing.

5. Write a plan for closing any gaps, then implement it.

6. Update `.agents/reference/sandbox.md` if needed.

7. Remove the cloned `tmp/codex` repository.

8. Verify the changes with the smallest relevant tests or checks available in the repository. If verification cannot be run, explain why.

9. Commit and push.
