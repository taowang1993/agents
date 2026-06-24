# Planning and Task Breakdown

## Overview

Turn an existing request or conversation into a practical plan, then decompose the work into small, verifiable tasks with explicit acceptance criteria. Good task breakdown is the difference between an agent that completes work reliably and one that produces a tangled mess. Every task should be small enough to implement, test, and verify in a single focused session.

Call the artifact a plan. Do not introduce alternate product-document labels unless the user used them first.

## When to Use

- The user says "write a plan"
- You have a request, issue, prototype, or conversation that needs implementable units
- A task feels too large or vague to start
- Work needs to be parallelized across multiple agents or sessions
- You need to communicate scope to a human
- The implementation order is not obvious

**When NOT to use:** Single-file changes with obvious scope, or when the source already contains well-defined tasks.

## The Planning Process

### Step 1: Gather the Plan Source

Before writing any code, operate in read-only mode:

- Work from the existing conversation context first.
- If the user passes a beads issue ID or path, read the full body and comments/notes.
- Explore the repo enough to understand current behavior, domain vocabulary, ADRs, and existing patterns.
- Ask only blocking questions. If you can make a safe assumption, state it in the plan and continue.

**Do NOT write code during planning.** The output is a plan document plus beads issues, not implementation.

### Step 2: State the Problem, Solution, and Scope

Write the plan from the user's perspective:

- **Problem:** what the user is trying to fix or accomplish.
- **Solution:** the user-visible behavior you plan to deliver.
- **Out of scope:** adjacent work you are intentionally not doing.
- **Assumptions:** decisions you made because the conversation did not pin them down.
- **User stories:** include them only when they clarify coverage or slice boundaries.

### Step 3: Choose Testing Seams

Sketch where the feature will be tested before breaking down work:

- Prefer existing seams to new ones.
- Use the highest seam that verifies user-visible behavior.
- The fewer seams across the codebase, the better; one good seam is ideal.
- If a new seam is needed, propose it at the highest practical boundary.
- Include verification commands or manual checks for each slice.

For large, risky, or fuzzy plans, show the proposed seams and slice list to the user before creating child issues. For clear plans, create them directly and record assumptions.

### Step 4: Identify the Dependency Graph

Map what depends on what:

```text
Database schema
    │
    ├── API models/types
    │       │
    │       ├── API endpoints
    │       │       │
    │       │       └── Frontend API client
    │       │               │
    │       │               └── UI components
    │       │
    │       └── Validation logic
    │
    └── Seed data / migrations
```

Implementation order follows the dependency graph bottom-up: build foundations first.

### Step 5: Slice Vertically

Instead of building all the database, then all the API, then all the UI, build one complete feature path at a time.

**Bad (horizontal slicing):**

```text
Task 1: Build entire database schema
Task 2: Build all API endpoints
Task 3: Build all UI components
Task 4: Connect everything
```

**Good (vertical slicing):**

```text
Task 1: User can create an account (schema + API + UI for registration)
Task 2: User can log in (auth schema + API + UI for login)
Task 3: User can create a task (task schema + API + UI for creation)
Task 4: User can view task list (query + API + UI for list view)
```

Each vertical slice should be a tracer bullet:

- It delivers a narrow but complete path through the required layers.
- It is demoable or verifiable on its own.
- It includes its own acceptance checks.
- Any prefactoring that makes the slice easy should come first.

### Step 6: Check System Coherence

Before task breakdown, choose the smallest implementation that fits the surrounding system, not just the smallest local patch.

Answer briefly:

- What is the source of truth before and after this change?
- Which component owns the state, lifecycle, and side effects?
- What failure, retry, resume, and cleanup paths matter?
- Would a direct patch duplicate state, logic, or protocol decisions?
- Is there a more coherent existing boundary or abstraction for this work?

Expand scope only when it removes duplicated state, fragile coupling, lifecycle mismatch, or recurring complexity. Do not use this as permission to gold-plate.

### Step 7: Write Tasks and Beads Issues

Each task follows this structure:

```markdown
## Task [N]: [Short Descriptive Title]

**Description:** One paragraph explaining what this task accomplishes as an end-to-end behavior.

**Acceptance criteria:**
- [ ] [Specific, testable outcome]
- [ ] [Specific, testable outcome]

**Verification:**
- [ ] Tests pass: `npm test -- --grep "feature-name"`
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: [description of what to verify]

**Dependencies:** [Task numbers this depends on, or "None"]

**Files likely touched:** [Optional; include only when useful and reasonably stable]
- `src/path/to/file.ts`
- `tests/path/to/test.ts`

**Estimated scope:** [Small: 1-2 files | Medium: 3-5 files | Large: 5+ files]
```

When creating beads child issues, keep the issue body behavior-first:

```markdown
## Parent

[Parent epic ID or source issue, if any]

## What to Build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

Avoid brittle file paths or long code snippets. Exception: if a prototype produced a small snippet that captures a decision more precisely than prose can, inline only the decision-rich part and note that it came from a prototype.

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked By

- [Blocking beads issue ID]

Or "None - can start immediately" if no blockers.
```

Publish blockers before dependents so real issue IDs are available. Do not close or modify a parent issue just because you created children.

## Task Sizing Guidelines

| Size | Files | Scope | Example |
|------|-------|-------|---------|
| **XS** | 1 | Single function or config change | Add a validation rule |
| **S** | 1-2 | One component or endpoint | Add a new API endpoint |
| **M** | 3-5 | One feature slice | User registration flow |
| **L** | 5-8 | Multi-component feature | Search with filtering and pagination |
| **XL** | 8+ | **Too large — break it down further** | — |

If a task is L or larger, break it into smaller tasks. An agent performs best on S and M tasks.

**When to break a task down further:**

- It would take more than one focused session (roughly 2+ hours of agent work)
- You cannot describe the acceptance criteria in 3 or fewer bullet points
- It touches two or more independent subsystems (e.g., auth and billing)
- You find yourself writing "and" in the task title (a sign it is two tasks)

## Plan Quality Bar

Before defining tasks, map the files or modules likely involved and what each is responsible for. Follow existing codebase patterns; do not plan a broad restructure unless the task explicitly needs it.

Each task must be implementable without rereading the whole plan:

- Name likely files or modules when known.
- State the public interface it consumes or produces when another task depends on it.
- Include acceptance criteria and at least one verification command or manual check.
- Fold setup, config, migrations, and docs into the task whose deliverable needs them.
- Avoid placeholders: no `TBD`, `TODO`, "add appropriate handling", "write tests", or "similar to Task N" without specifics.

After drafting, self-review once:

1. Source coverage: every stated requirement maps to a task or a stated non-goal.
2. Placeholder scan: remove vague instructions and missing commands.
3. Interface consistency: names, types, routes, and file paths match across dependent tasks.
4. System coherence: source of truth, lifecycle, and boundaries are explicit.
5. Scope check: split XL tasks before creating beads children.

## Plan Document Template

```markdown
# Plan: [Feature/Project Name]

## Problem
[The problem from the user's perspective]

## Solution
[The solution from the user's perspective]

## User Stories
[Optional; include when useful]
1. As a [actor], I want [feature], so that [benefit].

## Implementation Decisions
- [Module, interface, schema, API, or interaction decision]
- [Architectural decision or trade-off]

## Testing Decisions
- Highest useful seam: [existing seam or proposed seam]
- Prior art: [similar tests or checks in the codebase]
- Verification: [commands or manual checks]

## Out of Scope
- [Explicit non-goal]

## Task List

### Phase 1: Foundation
- [ ] Task 1: ...
- [ ] Task 2: ...

### Checkpoint: Foundation
- [ ] Tests pass, builds clean

### Phase 2: Core Features
- [ ] Task 3: ...
- [ ] Task 4: ...

### Checkpoint: Core Features
- [ ] End-to-end flow works

### Phase 3: Polish
- [ ] Task 5: ...
- [ ] Task 6: ...

### Checkpoint: Complete
- [ ] All acceptance criteria met
- [ ] Ready for review

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk] | [High/Med/Low] | [Strategy] |

## Beads
- Epic: [ID]
- Child issues: [IDs]

## Further Notes
[Any useful context that helps future sessions resume]
```

## Parallelization Opportunities

When multiple agents or sessions are available:

- **Safe to parallelize:** Independent feature slices, tests for already-implemented features, documentation
- **Must be sequential:** Database migrations, shared state changes, dependency chains
- **Needs coordination:** Features that share an API contract (define the contract first, then parallelize)

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll figure it out as I go" | That's how you end up with a tangled mess and rework. 10 minutes of planning saves hours. |
| "The tasks are obvious" | Write them down anyway. Explicit tasks surface hidden dependencies and forgotten edge cases. |
| "Planning is overhead" | Planning is the task. Implementation without a plan is just typing. |
| "I can hold it all in my head" | Context windows are finite. Written plans survive session boundaries and compaction. |

## Red Flags

- Starting implementation without a written task list
- Tasks that say "implement the feature" without acceptance criteria
- No verification steps in the plan
- All tasks are XL-sized
- No checkpoints between tasks
- Dependency order isn't considered

## Verification

Before starting implementation, confirm:

- [ ] Every task has acceptance criteria
- [ ] Every task has a verification step
- [ ] Task dependencies are identified and ordered correctly
- [ ] No task touches more than ~5 files
- [ ] Checkpoints exist between major phases
- [ ] For large or risky plans, human review is requested; otherwise assumptions are stated
