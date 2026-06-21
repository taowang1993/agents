# Code Simplification Reference

Use this reference during review when code works but is harder to read, maintain, or extend than it should be. Recommend changes that preserve exact behavior while reducing conceptual load.

## Principles

1. **Preserve behavior exactly.** Check inputs, outputs, side effects, ordering, error behavior, and edge cases. Do not call something a simplification if tests must change to make it pass.
2. **Follow project conventions.** Match neighboring code, project instructions, naming style, import style, error handling, and type depth.
3. **Prefer clarity over cleverness.** Explicit control flow is better than dense one-liners when the dense version requires a mental pause.
4. **Maintain balance.** Do not inline a helper that gives an important concept a name. Do not merge unrelated functions just to reduce line count.
5. **Scope the critique.** Default to recently changed code. Avoid drive-by refactors unless the user asked for a snapshot or broad audit.

## Chesterton's Fence Questions

Before recommending removal or replacement, answer:

- What responsibility does this code own?
- What calls it, and what does it call?
- What edge cases and error paths does it handle?
- What tests define the behavior?
- Could performance, platform constraints, compatibility, or historical context explain this shape?
- Does git history or nearby code show why this abstraction exists?

If you cannot answer these questions, ask for more context or frame the finding as a risk to investigate.

## Simplification Signals

| Pattern | Review Signal | Better Direction |
|---|---|---|
| Deep nesting | Control flow requires a stack in the reader's head | Use guard clauses, named predicates, or extracted helpers |
| Long functions | One function owns multiple responsibilities | Split by responsibility and name the concepts |
| Nested ternaries | Conditions are compact but hard to scan | Use clear branching, a map, or a dispatcher |
| Boolean parameter flags | Calls like `doThing(true, false)` hide intent | Use options objects or separate named functions |
| Repeated conditionals | The same check appears across files or branches | Extract a predicate, policy, or model |
| Generic names | `data`, `result`, `temp`, `item` obscure meaning | Rename to domain-specific nouns |
| Misleading names | A function name hides mutation, I/O, or side effects | Rename or split query from command behavior |
| Comments explaining what | The comment repeats obvious code | Remove the comment or improve the code name |
| Comments explaining why | The code encodes non-obvious intent | Preserve or improve the explanation |
| Duplicated logic | Similar logic appears in multiple locations | Extract a shared helper or reuse a canonical utility |
| Dead code | Unused imports, exports, flags, branches, or files remain | Ask whether to remove after confirming reachability |
| Thin wrappers | A helper merely forwards with no clearer concept | Inline or replace with the canonical API |
| Speculative abstraction | A pattern supports only imagined future uses | Prefer the direct implementation now |
| Cast-heavy code | Types are being bypassed instead of modeled | Make the boundary explicit and typed |

## Review Guidance

When writing a simplification finding:

- State the behavior that must be preserved.
- Point to the changed location where complexity was introduced or made worse.
- Explain the reader cost: extra concepts, branches, states, or layers.
- Suggest the simpler model, not just a prettier local edit.
- Prefer deleting complexity over moving it into a different file.
- Recommend separate refactoring and feature work when a mixed diff becomes hard to review.

## Red Flags

- Simplification that weakens validation, error handling, authorization, or observability.
- A refactor that moves code around but preserves the same number of concepts.
- A one-line expression that is technically shorter but harder to understand.
- A renamed symbol that follows personal taste rather than project convention.
- A broad refactor batched with a feature or bug fix.
- Many unrelated simplifications in one change with no incremental verification.
- Deleted tests or changed expectations that hide a behavior change.

## Verification Checklist

Ask for or check:

- Existing tests pass without changing expected behavior.
- Build, typecheck, lint, and formatter still pass.
- The diff is reviewable and scoped.
- Error handling and security checks were not removed.
- Dead code introduced by the refactor was identified.
- The result is easier for a new maintainer or future agent to understand.
