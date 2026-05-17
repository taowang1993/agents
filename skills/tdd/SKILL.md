---
name: tdd
description: Test-driven development with red-green-refactor loop using Playwright for behavioral E2E tests. Use when the user wants to build features or fix bugs using TDD, mentions "red-green-refactor", "test-first", wants E2E or integration tests, or asks for test-driven development. Use this skill for ANY feature work — it is the default development workflow. When a feature request arrives, write a failing behavioral test BEFORE writing any implementation code. Do NOT write tests after the code.
---

# Test-Driven Development

## Philosophy

**Core principle**: Tests should verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't.

**Good tests** are integration-style: they exercise real code paths through public APIs. They describe _what_ the system does, not _how_ it does it. A good test reads like a specification - "user can checkout with valid cart" tells you exactly what capability exists. These tests survive refactors because they don't care about internal structure.

**Bad tests** are coupled to implementation. They mock internal collaborators, test private methods, or verify through external means (like querying a database directly instead of using the interface). The warning sign: your test breaks when you refactor, but behavior hasn't changed. If you rename an internal function and tests fail, those tests were testing implementation, not behavior.

See [tests.md](references/tests.md) for examples and [mocking.md](references/mocking.md) for mocking guidelines.

## Feature-Triggered TDD

In the age of AI agents, the trigger for writing a test is **not** adding a new method to a class — it is receiving a **feature request**. When a feature request arrives (from the user, a task, or a spec):

1. Immediately write a failing behavioral test that describes the feature.
2. Run the AI to generate minimal code to make the test pass.
3. Then **you** (the human/agent reviewer) focus on the refactor phase — improving the generated code's quality.

AI makes the RED and GREEN phases fast. The REFACTOR phase is where developers should spend the most time, reviewing and improving the AI-generated code.

## Playwright for Behavioral E2E Tests

Use Playwright for browser-based behavioral E2E testing. Set up Playwright agents before writing tests:

```bash
npx playwright init-agents --loop=vscode
```

This creates three agent definitions that work with coding agents:

| Agent | Purpose |
|---|---|
| **Planner** | Explores the app and writes a markdown test plan in `specs/` |
| **Generator** | Converts the plan into Playwright test files in `tests/` |
| **Healer** | Runs failing tests and auto-repairs locators and waits |

Use a `seed.spec.ts` to bootstrap the test context with auth, fixtures, and setup. Every generated test references this seed file.

### Commit Before Healing

Before letting the healer agent fix failing tests, **commit your current code first**. The healer may make destructive changes, and you need a checkpoint to revert to if the healing goes wrong.

### One Feature, One Test File

Generate one test file per feature, not a bulk test suite. Each feature test should describe a complete user scenario from start to finish.

### Screenshots in PRs

Playwright captures screenshots during test runs. Attach these screenshots to your PR description as visual evidence that the feature works correctly.

### Avoid Self-Affirming Tests

AI-generated unit tests can pass while the system behavior is broken. This happens when tests assert on the shape of code rather than user-visible behavior. Prefer behavioral E2E tests that simulate real user interactions: navigating to pages, clicking buttons, typing input, and asserting on visible outcomes.

## AI-Assisted TDD in Practice

1. **Feature request arrives** → the user describes a UI feature.
2. **RED**: Write a Playwright test that navigates to the route, interacts with the component, and asserts the expected behavior. Run it — it fails because the feature doesn't exist yet.
3. **GREEN**: Let the AI agent generate the minimal implementation to make the test pass. Do not worry about code quality in this phase — focus on speed.
4. **REFACTOR**: Review the AI-generated code. Extract duplication, deepen modules, apply design tokens. Run the test after each refactor to confirm behavior is preserved.
5. **COMMIT**: Commit before running the healer on any remaining failures.

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is "horizontal slicing" - treating RED as "write all tests" and GREEN as "write all code."

This produces **crap tests**:

- Tests written in bulk test _imagined_ behavior, not _actual_ behavior
- You end up testing the _shape_ of things (data structures, function signatures) rather than user-facing behavior
- Tests become insensitive to real changes - they pass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding the implementation

**Correct approach**: Vertical slices via tracer bullets. One test → one implementation → repeat. Each test responds to what you learned from the previous cycle. Because you just wrote the code, you know exactly what behavior matters and how to verify it.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

## Workflow

### 1. Planning

When a feature request arrives, **start by reading any specs or design docs** relevant to the feature. Use the project's domain glossary so that test names and interface vocabulary match the project's language, and respect ADRs in the area you're touching.

Before writing any code:

- [ ] Read the feature request or spec in full
- [ ] Confirm with user what interface changes are needed
- [ ] Confirm with user which behaviors to test (prioritize)
- [ ] Identify opportunities for [deep modules](references/deep-modules.md) (small interface, deep implementation)
- [ ] Design interfaces for [testability](references/interface-design.md)
- [ ] List the behaviors to test as user scenarios ("user can X" → "user sees Y")
- [ ] Set up Playwright agents if not already installed: `npx playwright init-agents --loop=vscode`
- [ ] Get user approval on the plan

Ask: "What should the public interface look like? Which user scenarios are most important to test?"

**You can't test everything.** Confirm with the user exactly which behaviors matter most. Focus testing effort on critical user flows and complex logic, not every possible edge case.

### 2. RED Phase — Write the Failing Test

Write ONE behavioral test that describes ONE user scenario. For UI features, write a **Playwright E2E test**:

- Navigate to the route or surface being tested
- Interact with the component (click, type, select)
- Assert on the visible outcome (text, visibility, state)

Run the test — it must fail because the feature doesn't exist yet. A passing test at this stage means the test is not actually testing the new feature.

### 3. GREEN Phase — Make It Pass

Write the minimal implementation to make the test pass. Use AI agents to generate code quickly in this phase. Do not optimize for code quality — optimize for speed. The goal is to see the test turn green with the least amount of code possible.

Rules during GREEN:
- One test at a time
- Only enough code to pass the current test
- Don't anticipate future tests
- Don't refactor yet — just make it work
- **Commit your code after GREEN** before moving to REFACTOR

### 4. REFACTOR Phase — Improve Quality

After the test passes and code is committed, look for [refactor candidates](references/refactoring.md):

- [ ] Replace AI-generated patterns with project design tokens and shared recipes
- [ ] Extract duplication
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural
- [ ] Consider what new code reveals about existing code
- [ ] Run the test after each refactor step to confirm behavior is preserved

**Never refactor while RED.** Get to GREEN and commit first.

### 5. HEAL — Fix Remaining Issues

If tests still fail after implementation, use the Playwright healer agent to auto-repair locators and waits. **Always commit before healing** so you can revert if the healer makes destructive changes.

## Checklist Per Cycle

```
[ ] Feature request or spec has been read in full
[ ] Test describes user-visible behavior, not implementation
[ ] Test uses public interface or browser interactions only
[ ] Test would survive internal refactor (rename functions, move files)
[ ] Code is minimal for this test — no speculative features
[ ] Committed after GREEN, before REFACTOR
[ ] Committed before running the healer agent
[ ] Screenshots attached to PR if using Playwright
[ ] Refactored to use project design tokens and shared recipes
```
