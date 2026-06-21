---
name: review
description: Strict human-style review before merging code or after human/agent implementation. Use for PR/diff/branch/file review plus quality audits, security hardening review, performance regression review, and simplification/refactoring critique. Produces maintainability findings across correctness/tests/architecture/security/performance/dependencies/verification and pushes ambitious code-judo restructuring without a repo-wide audit tool.
---

# Strict Multi-Axis Code Review

Use this skill for an unusually rigorous human-style review of a branch, PR, diff, file, commit, or recent change. Review the change as a quality gate across correctness, tests, maintainability, architecture, security, performance, operability, and verification.

Above all, be **ambitious** about code structure. Do not merely identify local cleanup opportunities. Actively search for "code judo" moves: restructurings that preserve behavior while making the implementation dramatically simpler, smaller, more direct, and more elegant.

## Core Stance

Review with high standards and good judgment:

- Do not rubber-stamp code because tests pass or behavior appears correct.
- Do not block on personal preference, cosmetic style, or an implementation that is merely different from how you would write it.
- Approve only when the change clearly preserves or improves overall code health and has no material correctness, security, performance, architecture, or maintainability issue.
- Prefer a small number of high-conviction findings over a long list of nits.
- Comment on code and risk, not on the author.

## Always Load Review References

Before reviewing code, read all three references from this skill directory:

- [Code Simplification Reference](references/code-simplification.md)
- [Security and Hardening Reference](references/security-and-hardening.md)
- [Performance Optimization Reference](references/performance-optimization.md)

Use all three perspectives in every review, even when the user asks for a general review. Apply each reference proportionally to the diff: do not force speculative security or performance findings, but do use the checklists to avoid missing relevant risks.

## Core Prompt

Start from this baseline:

> Perform a deep code quality audit of the current branch's changes.
> Rethink how to structure / implement the changes to meaningfully improve code quality without impacting behavior.
> Work to improve abstractions, modularity, reduce Spaghetti code, improve succinctness and legibility.
> Be ambitious, if there is a clear path to improving the implementation that involves restructuring some of the codebase, go for it.
> Be extremely thorough and rigorous. Measure twice, cut once.

## Review Process

### 1. Understand the Intent

Before judging code, identify what the change is trying to accomplish:

- What user-visible or system behavior is supposed to change?
- What spec, bug, task, issue, or design does it implement?
- What behavior should stay unchanged?
- What files, packages, or layers are in scope?

If the intent is unclear, say that the review confidence is limited and ask for the missing context instead of guessing.

### 2. Inspect Tests First

Use tests to understand the intended behavior and verification story:

- Check whether tests exist for the changed behavior.
- Prefer behavior tests over implementation-detail tests.
- Look for edge cases, error paths, boundaries, races, and regression coverage.
- Check whether the tests would fail if the bug or risky behavior returned.
- Flag tests that only exercise mocks, snapshots, or happy paths when the risk is elsewhere.

### 3. Review the Implementation Across All Axes

For each meaningful change, evaluate these axes:

1. **Correctness:** Does the code match the spec, handle boundaries and errors, preserve invariants, avoid races, and maintain state consistency?
2. **Tests and verification:** Does the change prove the right behavior through tests, build checks, manual verification, screenshots, benchmarks, or logs as appropriate?
3. **Readability and simplicity:** Can a future engineer or agent understand this without the author explaining it? Are names, control flow, and boundaries clear?
4. **Architecture:** Does the change fit the system's design, keep dependencies flowing in the right direction, and avoid coupling unrelated layers?
5. **Security:** Does the change validate untrusted input, protect secrets, enforce auth/authz, prevent injection/XSS/SSRF, and keep dependencies safe?
6. **Performance and operability:** Does the change avoid obvious regressions such as N+1 queries, unbounded work, main-thread stalls, non-atomic updates, missing backpressure, or noisy operational failure modes?
7. **Dependency and supply-chain cost:** Does each new dependency earn its operational, security, bundle, and maintenance cost?

### 4. Verify the Verification

Explicitly check what proof exists:

- What tests were run?
- Did the build, typecheck, lint, and relevant checks pass?
- Was manual verification needed, and was it documented?
- Were before/after measurements provided for performance claims?
- Were security-sensitive flows tested with abuse cases, not just happy paths?

A missing verification story is a finding when the change is risky enough that reviewers cannot trust it by inspection.

## Non-Negotiable Standards

### 0. Be Ambitious About Structural Simplification

- Do not stop at "this could be a bit cleaner."
- Look for opportunities to reframe the change so that whole branches, helpers, modes, conditionals, or layers disappear entirely.
- Prefer the solution that makes the code feel inevitable in hindsight.
- Assume there is often a "code judo" move available: a re-organization that uses the existing architecture more effectively and makes the change dramatically simpler and more elegant.
- If you see a path to delete complexity rather than rearrange it, push hard for that path.

### 1. Preserve Behavior When Recommending Simplification

- Do not recommend simplification that changes inputs, outputs, side effects, ordering, error behavior, or edge-case behavior unless the behavior change is explicitly desired.
- Apply Chesterton's Fence: understand why a pattern exists before asking to remove it.
- Match project conventions rather than imposing an outside style.
- Prefer clarity over cleverness; fewer lines are not simpler if they increase mental load.
- Keep simplification scoped to the reviewed change unless the user explicitly asked for a broader snapshot review.

### 2. Do Not Let a PR Push a File From Under 1k Lines to Over 1k Lines Without a Strong Reason

- Treat this as a strong code-quality smell by default.
- Prefer extracting helpers, subcomponents, modules, or local abstractions instead of letting a file sprawl past 1000 lines.
- If the diff crosses that threshold, explicitly ask whether the code should be decomposed first.
- Only waive this if there is a compelling structural reason and the resulting file is still clearly organized.

### 3. Do Not Allow Random Spaghetti Growth in Existing Code

- Be highly suspicious of new ad-hoc conditionals, scattered special cases, or one-off branches inserted into unrelated flows.
- If a change adds "weird if statements in random places", treat that as a design problem, not a stylistic nit.
- Prefer pushing the logic into a dedicated abstraction, helper, state machine, policy object, or separate module instead of tangling an existing path.
- Call out changes that make the surrounding code harder to reason about, even if they technically work.

### 4. Bias Toward Cleaning the Design, Not Just Accepting Working Code

- If behavior can stay the same while the structure becomes meaningfully cleaner, push for the cleaner version.
- Do not accept "it works" implementations that leave the codebase messier.
- Strongly prefer simplifications that remove moving pieces altogether over refactors that merely spread the same complexity around.
- Do not accept "I'll clean it up later" unless there is a genuine emergency and tracked follow-up with ownership.

### 5. Prefer Direct, Boring, Maintainable Code Over Hacky or Magical Code

- Treat brittle, ad-hoc, or "magic" behavior as a code-quality problem.
- Be skeptical of generic mechanisms that hide simple data-shape assumptions.
- Flag thin abstractions, identity wrappers, and pass-through helpers that add indirection without buying clarity.
- Question speculative abstractions that exist for future use cases that do not yet exist.

### 6. Push Hard on Type and Boundary Cleanliness

- Question unnecessary optionality, `unknown`, `any`, or cast-heavy code when a clearer type boundary could exist.
- Prefer explicit typed models or shared contracts over loosely-shaped ad-hoc objects.
- If a branch relies on silent fallback to paper over an unclear invariant, ask whether the boundary should be made explicit instead.
- Treat LLM/model output, third-party API data, config, logs, and file contents as untrusted until validated.

### 7. Keep Logic in the Canonical Layer and Reuse Existing Helpers

- Call out feature logic leaking into shared paths or implementation details leaking through APIs.
- Prefer existing canonical utilities/helpers over bespoke one-offs.
- Push code toward the right package, service, module, or boundary instead of normalizing architectural drift.
- Flag duplication when extracting or reusing a helper would make the model clearer.

### 8. Treat Stability and Operability as Design Concerns

- If independent work is serialized for no good reason, ask whether the flow should run in parallel when that also simplifies orchestration.
- If related updates can leave state half-applied, push for a more atomic structure.
- Treat backpressure, retry, queue, stream, fan-out, and timeout behavior as system-stability concerns, not micro-optimizations.
- Prefer fail-fast behavior over logging-and-continuing when continuing hides errors or creates unpredictable production state.
- Prefer stable error codes or identifiers over matching human-readable error messages.

## Primary Review Questions

Ask these for every meaningful change:

- Is there a "code judo" move that would make this dramatically simpler?
- Can this change be reframed so fewer concepts, branches, modes, or helper layers are needed?
- Does this improve or worsen the local architecture?
- Did the diff add branching complexity where a better abstraction should exist?
- Did a previously cohesive module become more coupled, more stateful, or harder to scan?
- Is this logic living in the right file, package, and layer?
- Did this change enlarge a file or component past a healthy size boundary?
- Are there repeated conditionals that signal a missing model, predicate, or helper?
- Is the implementation direct and legible, or does it rely on special cases and incidental control flow?
- Is this abstraction earning its keep, or is it just a wrapper?
- Did the diff introduce casts, optionality, or ad-hoc object shapes that obscure the real invariant?
- Are untrusted inputs validated at the boundary before being used in logic, storage, rendering, network calls, or tool calls?
- Are auth and authorization checks enforced where the resource or action requires them?
- Did the change add a dependency, external integration, or supply-chain risk that needs justification?
- Is a performance claim backed by before/after measurement?
- Did the change introduce N+1 queries, unbounded data fetching, bundle growth, long tasks, missing pagination, or avoidable synchronous work?
- Is the verification strong enough for the risk level?

## Security Review Gate

When a change touches security-sensitive surfaces, explicitly threat-model it before writing findings:

1. Map trust boundaries: requests, forms, file uploads, webhooks, third-party APIs, queues, config, logs, fetched URLs, and LLM output.
2. Name assets: credentials, PII, payment data, tenant data, admin actions, money movement, infrastructure access, and model/tool permissions.
3. Check spoofing, tampering, repudiation, information disclosure, denial of service, and elevation of privilege risks.
4. Write at least one plausible abuse case for the changed surface.

Flag these aggressively:

- User input reaches SQL/NoSQL, shell, HTML, file paths, SSRF-prone fetches, or tool calls without validation and parameterization/encoding.
- Authentication exists without authorization on object-level or action-level access.
- Secrets appear in code, logs, prompts, config committed to git, or client-readable storage.
- Sessions or cookies miss `httpOnly`, `secure`, or `sameSite` protections where applicable.
- CORS, CSP, HSTS, frame, content-type, or error-detail behavior weakens security without justification.
- File uploads lack type, size, content, storage, or malware/active-content controls appropriate to the risk.
- Server-side URL fetches lack scheme/host allowlists, private-IP protection, redirect control, or DNS-rebinding awareness.
- LLM/model output is treated as trusted data or passed into SQL, shell, DOM HTML, file paths, or tools without schema validation and allowlisting.
- New dependencies duplicate existing capability, have unclear maintenance, vulnerable transitive risk, unexpected install scripts, or unjustified bundle/runtime cost.

## Performance Review Gate

Do not demand speculative micro-optimizations. Do require evidence and clear reasoning when performance matters.

Flag these aggressively:

- Claimed optimizations without before/after measurements.
- N+1 queries, missing indexes on hot queries, or database work inside unbounded loops.
- List endpoints, background jobs, queues, streams, or fan-out paths without limits, pagination, timeouts, backpressure, or retry discipline.
- Large payloads, images without dimensions/responsive sizing, render-blocking resources, or bundle growth in initial-load paths.
- React/UI changes that create avoidable rerender storms, long main-thread tasks, layout thrashing, or unstable references in expensive child paths.
- Synchronous CPU, filesystem, network, or cryptographic work in request or UI hot paths.
- Caches without invalidation, size bounds, tenant separation, or stale-data semantics.
- Parallelizable orchestration left serial when serialization increases latency and complexity.

For performance findings, include the missing measurement or the expected failure mode. Prefer "this creates one query per row in the list" over "this might be slow."

## Change Sizing and Decomposition

Use these thresholds when reviewing change size:

- Around 100 lines changed: usually reviewable.
- Around 300 lines changed: acceptable if it is one logical change.
- Around 1000 lines changed: too large by default; ask to split unless deletions or mechanical codemods dominate.

Prefer splitting by stacked changes, file groups, shared foundations before consumers, or vertical feature slices. Require feature work and broad refactoring to be separated unless the refactor is small and directly enables the feature.

When a manual refactor would touch more than about 500 lines, ask whether automation, codemods, or smaller reviewable steps would reduce risk.

## Dead Code Hygiene

After refactoring or implementation changes, look for orphaned code:

- unreachable branches
- unused variables, imports, exports, flags, feature checks, constants, helpers, files, and tests
- compatibility shims no longer used
- commented-out code and "removed" comments

Do not silently ask for broad deletion when ownership or reachability is uncertain. List the suspected dead code and ask for confirmation or evidence.

## Finding Bar and Scope Discipline

When reviewing a diff, branch, PR, commit, or uncommitted changes:

- Focus on issues introduced by the reviewed change. Do not flag pre-existing code unless the diff makes it newly dangerous, newly confusing, or materially harder to maintain.
- Flag only issues that meaningfully affect correctness, performance, security, operability, or maintainability.
- Make every finding discrete, actionable, and backed by code evidence. Avoid broad design complaints unless you can point to a concrete changed location and a concrete remedy.
- Avoid findings that rely on unstated assumptions about the codebase, runtime environment, or author's intent.
- Explain the scenario where the issue matters. If you cannot identify a plausible affected path, keep investigating instead of speculating.
- For snapshot/folder reviews, you may comment on existing code in the requested paths, but state that it is a snapshot review and prioritize high-leverage issues.
- Use nits sparingly. If feedback is optional, label it as optional or omit it.

## Priority Levels

Use these priority tags in finding titles:

- `[P0]` — Drop everything to fix. Use only for universal issues that block release or operations.
- `[P1]` — Urgent. Address in the next cycle because the issue can seriously break users, production, security, or maintainability.
- `[P2]` — Normal. Worth fixing because it materially improves correctness, maintainability, or quality.
- `[P3]` — Low. Nice to have; include sparingly and only when it meaningfully improves the code.

Treat `[P0]`, `[P1]`, and most `[P2]` findings as required before approval. Mark truly optional feedback as `Optional:` or `Nit:` instead of disguising it as a blocker.

## Preferred Remedies

When you identify a problem, prefer suggestions like:

- Delete a whole layer of indirection rather than polishing it.
- Reframe the state model so conditionals disappear instead of getting centralized.
- Change the ownership boundary so the feature becomes a natural extension of an existing abstraction.
- Turn special-case logic into a simpler default flow with fewer exceptions.
- Extract a helper or pure function when it reduces conceptual load.
- Split a large file into smaller focused modules.
- Move feature-specific logic behind a dedicated abstraction.
- Replace condition chains with a typed model, explicit dispatcher, or well-named predicate.
- Separate orchestration from business logic.
- Collapse duplicate branches into a single clearer flow.
- Delete wrappers that do not meaningfully clarify the API.
- Reuse the existing canonical helper instead of introducing a near-duplicate.
- Make type boundaries more explicit so the control flow gets simpler.
- Move logic to the package/module/layer that already owns the concept.
- Validate untrusted inputs at the boundary and keep downstream code typed and trusted.
- Add authorization checks at the resource/action boundary instead of assuming authenticated access is enough.
- Parameterize database queries, encode output, and allowlist outbound destinations.
- Add pagination, limits, timeouts, backpressure, or caching only where the bottleneck or risk justifies it.
- Parallelize independent work when that also simplifies orchestration.
- Restructure related updates into a more atomic flow when partial state would be harder to reason about.

Do not be satisfied with "maybe rename this" feedback when the real issue is structural. Do not be satisfied with a merely cleaner version of the same messy idea if there is a plausible path to a much simpler idea.

## Review Tone

Be direct, serious, and demanding about quality. Do not be rude, but do not soften major issues into mild suggestions. If the code makes the codebase messier, say so clearly. If the implementation missed an opportunity for dramatic simplification, say that clearly too.

Good phrases:

- `this pushes the file past 1k lines. can we decompose this first?`
- `this adds another special-case branch into an already busy flow. can we move this behind its own abstraction?`
- `this works, but it makes the surrounding code more spaghetti. let's keep the behavior and restructure the implementation.`
- `this feels like feature logic leaking into a shared path. can we isolate it?`
- `this abstraction seems unnecessary. can we just keep the direct flow?`
- `why does this need a cast / optional here? can we make the boundary more explicit instead?`
- `this looks like a bespoke helper for something we already have elsewhere. can we reuse the canonical one?`
- `i think there's a code-judo move here that makes this much simpler. can we reframe this so these branches disappear?`
- `this refactor moves complexity around, but doesn't really delete it. is there a way to make the model itself simpler?`
- `this accepts untrusted input but does not validate it at the boundary. can we make the trusted shape explicit before it reaches storage/rendering/tool calls?`
- `this performance claim needs before/after numbers; otherwise we are trading complexity for an unmeasured benefit.`

## Output Expectations

Prioritize findings in this order:

1. Correctness, data loss, and release-blocking behavior issues
2. Security and privacy risks
3. Structural code-quality regressions
4. Missed opportunities for dramatic simplification / code-judo restructuring
5. Spaghetti / branching complexity increases
6. Performance, operability, and production-stability risks
7. Boundary / abstraction / type-contract problems that make the code harder to reason about
8. File-size and decomposition concerns
9. Modularity, dependency, and supply-chain issues
10. Legibility and maintainability concerns

For each finding:

- Start the title with a priority tag, for example `[P1] Stop swallowing checkout failures`.
- Include the shortest useful file and line location. For diff reviews, choose a location that overlaps the changed lines.
- Keep the explanation brief and concrete: why this is a problem, which scenario triggers it, and what kind of fix would address it.
- Keep code snippets under 3 lines unless the extra context is essential.
- Use `suggestion` fenced code blocks only for concrete replacement code, with no commentary inside the block.
- Do not generate a full PR fix. Review the code and optionally provide small, targeted replacement snippets.

Do not flood the review with low-value nits if there are larger structural issues. If there are no qualifying findings, explicitly say the code looks good.

End with an overall verdict: `correct` when there are no findings that should block or materially change approval, or `needs attention` when there are.

## Approval Bar

Do not approve merely because behavior seems correct or tests pass. Approve when the change is a net improvement or preserves code health, follows project conventions, has credible verification, and has no material issue in these categories:

- clear structural regression
- obvious missed opportunity to make the implementation dramatically simpler when such a path is visible
- unjustified file-size explosion
- obvious spaghetti-growth from special-case branching
- hacky or magical abstraction that makes the code harder to reason about
- unnecessary wrapper/cast/optionality churn obscuring the real design
- architecture-boundary leak or avoidable canonical-helper duplication
- missing behavior tests or verification for risky behavior
- security vulnerability or weakened hardening on a sensitive path
- performance regression, unbounded work, or unmeasured optimization complexity
- dependency or supply-chain cost that is not justified

Treat these as presumptive blockers unless the author can justify them clearly. If those conditions are not met, leave explicit, actionable feedback and push for a cleaner, safer, or better-verified decomposition.
