---
name: tdd
description: Test-driven development with a red-green-refactor loop. Use when the user asks for TDD, test-first, red-green-refactor, E2E or integration tests, or when implementing a non-trivial feature or bug fix that needs a regression check. Aim for 100% meaningful coverage of touched behavior with the smallest useful test type, then verify the finished work yourself before handoff.
---

# Test-Driven Development

## Philosophy

Use tests to buy confidence, not coverage theater. Verify behavior through public interfaces, not implementation details. Good tests describe what the system does and survive refactors; bad tests know private methods, mocks, or file shapes that users never see.

See [tests.md](references/tests.md) for examples and [mocking.md](references/mocking.md) for mocking guidelines.

## Default Stance

Start with the smallest test that can fail for the behavior you are changing:

1. Use a unit or pure-function test for isolated logic.
2. Use a component or integration test when behavior crosses modules, hooks, storage, API handlers, or UI state.
3. Use an end-to-end or real-app check only when the public app boundary matters: routing, auth, forms, navigation, persistence, accessibility-visible flows, or a bug that only reproduces end-to-end.
4. Skip a new test for docs-only changes, config-only changes, generated files, mechanical renames, or trivial one-liners; say why in one sentence.

Do not add a new test framework unless the project already uses it or the user asks. Prefer the existing test stack.

## Coverage Policy

Aim for 100% meaningful coverage of the behavior you touch. This means changed lines, branches, and user-visible paths should be protected by tests unless they are non-behavioral, generated, unreachable, or defensive code that would require brittle tests.

Use coverage to find gaps after behavior is protected. Add tests for:

- Changed behavior
- Regressions from reported bugs
- Critical user flows
- Error paths that can lose data, money, security, or accessibility
- Complex branching logic that is easy to break

Do not interpret 100% as "write E2E tests for everything" or "clean up the whole repo's historical coverage." Keep the scope to the touched feature/package unless the user or CI asks for broader coverage. If coverage tooling is unavailable or too slow, approximate it by listing the changed branches and paths and covering each meaningful one.

## Red-Green-Refactor Loop

Work in vertical slices. Do not write all tests first and all implementation later.

1. **RED**: Write one failing behavior test for one scenario.
2. **GREEN**: Write the minimum code that makes that test pass.
3. **REFACTOR**: Improve the code while keeping the test green.
4. Repeat only for the next meaningful behavior.

If you cannot run the test, still leave the smallest runnable check and report the exact command you would run.

## Planning

Before coding, read the relevant spec, issue, or design note. If requirements are ambiguous, ask the minimum question needed to choose the public behavior. Otherwise proceed.

List only the scenarios you intend to cover now. Keep it short:

- Main happy path
- One important failure/edge path, if risky
- Known regression, if fixing a bug

Do not ask the user to approve a full test matrix unless the task is large or ambiguous.

## Red Phase — Write the Failing Test

Write one test that would fail before the change:

- Name the test as a user-visible behavior: `user can save edited profile`, `rejects invalid invite token`.
- Exercise public APIs, rendered UI, CLI commands, or browser interactions.
- Assert visible outcomes, returned values, persisted effects, or emitted errors.
- Avoid assertions on private functions, internal call counts, generated component trees, or incidental class names.

Run the narrowest command for that test. A passing RED test means the test does not prove the new behavior; tighten it or skip TDD with a note if the behavior already exists.

## Green Phase — Make It Pass

Write the least code needed for the current test:

- Handle only the tested scenario.
- Do not add speculative options, abstractions, or future-proofing.
- Use existing project helpers and patterns.
- Run the same narrow test until it passes.

Commit after GREEN when the repo workflow expects checkpoints or before any risky automated healing/refactor step.

## Refactor Phase — Improve Quality

After the test passes, improve the implementation without changing behavior:

- Remove duplication.
- Deepen modules behind small interfaces; see [deep-modules.md](references/deep-modules.md).
- Adjust interfaces for testability; see [interface-design.md](references/interface-design.md).
- Replace awkward AI-generated code with project idioms.
- Re-run the narrow test after each meaningful refactor.

See [refactoring.md](references/refactoring.md) for refactor candidates.

## Verification Before Handoff

Before claiming done:

- Re-run the narrow checks after the final code change.
- Run the required type, lint, or build check for the touched package when the project expects it.
- Verify your own work through the smallest public interface that would catch a wrong implementation: rendered UI, CLI command, API request, persisted file or state, or app flow.
- If verification is impossible, say exactly why and give the exact command or action that remains.
- Report exact commands or actions and results; do not say "should work" after code changes.

## End-to-End When Needed

Use an end-to-end or real-app check only when the public interface or app boundary matters.

Good E2E targets:

- Sign-in, checkout, onboarding, or other critical flows
- Route transitions and browser navigation
- Form validation visible to users
- Client/server integration that cannot be trusted with a smaller test
- Reproductions of bugs observed only in the app

Avoid E2E for pure formatting, isolated utilities, simple component rendering, or logic that a fast integration/unit test covers.

Use the project's existing command or the smallest real-app check that exercises the public behavior. Do not add or install a new E2E stack from this skill.

## Checklist Per Cycle

```text
[ ] One behavior is selected for this slice
[ ] The chosen test level is the smallest useful one
[ ] The test fails before implementation, or you explained why TDD is not useful here
[ ] The test uses public behavior, not implementation details
[ ] The implementation is minimal for this test
[ ] The narrow test command passes
[ ] Refactor kept the test green
[ ] You verified your own final work through the smallest public interface that can catch the failure
[ ] Handoff includes exact commands or actions and results
[ ] Touched behavior has 100% meaningful coverage, or uncovered code is explicitly justified
```
