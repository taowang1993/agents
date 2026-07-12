---
description: Audit and close Tockbot sandboxing gaps against Codex.
---

1. Create a fresh temporary directory under `/tmp`, then clone `https://github.com/openai/codex` into it. Do not reuse or delete any pre-existing Codex checkout.

2. Review `/Users/max/projects/resources/.generalist/codex-sandbox.md` against the Codex source code. Update it if it is outdated or missing important details, and record the inspected Codex commit in the research update or report.

3. Read `.agents/reference/architecture.md` and `.agents/reference/sandbox.md` to understand how Tockbot implements sandboxing.

4. Write a report documenting any gaps between Tockbot sandboxing and Codex sandboxing.

5. Write a plan for closing any gaps, then implement it.

6. Update `.agents/reference/sandbox.md` if needed. Run the smallest relevant validation for the sandboxing changes.

7. Remove only the temporary directory created in step 1.

8. Commit and push only changes made by this run.
