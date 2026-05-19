# Matt

## Principles

_From "Software Fundamentals Matter More Than Ever" (~18 min talk)_

### Core Thesis

Software fundamentals matter **more than ever** in the AI age. The "specs-to-code" movement (write a spec, compile it to code via AI, never look at the code) is "vibe coding by another name" — it produces garbage because each iteration makes the codebase worse.

**Code is not cheap.** Bad code is the most expensive it's ever been, because AI in a bad codebase produces bad output. AI in a good codebase does really, really well.

### Six Failure Modes & Their Solutions

| # | Failure Mode | Root Cause | Solution | Book |
|---|-------------|-----------|----------|------|
| 1 | AI didn't do what I wanted | No shared design concept | **Grill Me skill** — interview relentlessly until aligned | _The Design of Design_ (Frederick P. Brooks) |
| 2 | AI is way too verbose | No shared language | **Ubiquitous Language skill** — markdown file of shared terminology | _Domain-Driven Design_ (Eric Evans) |
| 3 | AI built the right thing but it doesn't work | No feedback loops | **TDD, static types, browser access** — the rate of feedback is your speed limit | _The Pragmatic Programmer_ |
| 4 | Testing is really hard | Shallow modules (many tiny blobs) | **Deep Modules** — few large modules with simple interfaces, lots of functionality inside | _A Philosophy of Software Design_ (John Ousterhout) |
| 5 | Brain can't keep up with AI output | Too much cognitive load | **Design the interface, delegate the implementation** — treat modules as gray boxes; test from the outside | — |
| 6 | Codebase degrades over time | Not investing in design daily | **Invest in the design of the system every day** (Kent Beck); think about modules constantly | — |

### Key Concepts

- **Design Concept** (Brooks): The ephemeral, shared idea of what you're building — not an asset, not a markdown file. You need this with the AI.
- **Deep vs Shallow Modules** (Ousterhout): Deep modules hide lots of functionality behind a simple interface. Shallow modules expose complex interfaces with little functionality. AI unaided produces shallow module codebases.
- **Tactical vs Strategic**: AI is the tactical programmer (sergeant on the ground). You are the strategic thinker. This requires old-school software fundamentals.
- **Human Touch**: Automating everything (idea creation, QA, research, prototypes) produces apps that "lack taste." QA is where you impose your taste and opinions.

---

## Workflow

_From the ~1h36m workshop at a conference_

### LLM Constraints to Design Around

1. **Smart Zone → Dumb Zone**: LLMs do their best work in the first ~100K tokens. Attention relationships scale quadratically — every token strains it further. Size tasks to stay in the smart zone.
2. **Amnesia**: LLMs are "like the guy from Memento" — they forget. Matt prefers **clearing context** (resets to clean system prompt) over compacting (sediment accumulates).

### The Complete Pipeline

```
Idea ──→ Grill Me ──→ Write a PRD ──→ To Issues (Kanban) ──→ AFK Agent ──→ QA ──→ Team Review
  ↑                                                            │                │
  │                     (human in the loop)                    │                │
  └──────────────────── feedback / more issues ────────────────┘                │
                                                                                │
  Day Shift (Human)                                    Night Shift (AFK Agent)  │
```

### Phase 1: Grill Me (Alignment)

- Invoke the **grill-me** skill with the client brief
- AI asks 40–100+ questions, becoming an "adversary" to reach shared understanding
- This is **human-in-the-loop** — cannot be automated
- The conversation itself is the asset (not a plan document)
- Can also feed meeting transcripts into grilling sessions
- _Why not plan mode?_ Plan mode is eager to produce an asset; grilling produces alignment first.

### Phase 2: Write a PRD (Destination Document)

- Summarizes the design concept into: problem statement, solution, user stories, implementation decisions, testing decisions
- Specifies **proposed modules to modify** and their interfaces
- Matt does NOT read the PRD — LLMs are great at summarization; reading would only test summarization ability, not alignment
- Out-of-scope section acts as definition of done
- **Don't over-optimize the PRD** — the juice isn't worth the squeeze. Put the work into QA instead.

### Phase 3: To Issues / Kanban Board (Journey Document)

- Break the PRD into independently grabbable issues using **vertical slices (tracer bullets)**, NOT horizontal layers
- AI loves to code horizontally (DB layer first, then API, then frontend) — you get no feedback until the end
- Vertical slices cross all layers so each phase produces something testable
- Issues have **blocking relationships** forming a DAG — this enables parallelization
- Each issue is tagged as AFK or human-in-the-loop

### Phase 4: AFK Agent / Ralph Loop (Implementation)

- Bash script feeds all issues + last 5 commits + prompt into Claude Code with `--permission-mode accept-edits`
- The agent picks the next unblocked task, implements it with **TDD (red-green-refactor)**, runs feedback loops
- AI tends to cheat at tests (writes implementation first, then tests); TDD prevents this
- **Feedback loops are the ceiling** for AI output quality: type checking, tests, linting
- Runs in a Docker sandbox for isolation

### Phase 5: QA & Code Review

- **Human QA** imposes taste and opinions — without this you get slop
- Review tests first, then code
- AI can auto-review (use a fresh context so the reviewer is in the smart zone — implementation used up tokens)
- Matt uses **Sonnet for implementation, Opus for reviewing** (reviewing needs "the smarts")
- QA creates more issues → feeds back into the Kanban board

### Parallelization with Sandcastle

Matt built **Sandcastle**, a TypeScript library for running multi-agent loops:

```
Planner → picks parallelizable issues from Kanban
       → for each issue: creates sandbox → runs Implementer
       → if commits made: runs Reviewer (with coding standards pushed)
       → Merger merges branches, resolves conflicts
```

### Push vs Pull for Coding Standards

- **Pull**: Skills sit in the repo — the agent pulls them when needed (good for implementer)
- **Push**: Instructions pushed to every context (good for reviewer — push coding standards so it can compare)

### Frontend Workflow

- AI struggles with mature frontend codebases — needs human eyes
- Give AI browser tools (Playwright MCP, agent-browser) for feedback
- **Prototype approach**: Have AI generate 3 throwaway prototypes → human picks the best → feed back into grilling session
- Prototypes are for feedback, not production code

### Doc Rot

- Don't keep old PRDs in the repo — code changes, they rot, they mislead agents
- Use GitHub issues (closed = done) instead — visual indicator it's complete

---

## Skills

### Planning & Alignment
| Skill | Purpose |
|-------|---------|
| **grill-me** | Interview relentlessly about every aspect of a plan until shared understanding is reached |
| **grill-with-docs** | Variant of grill-me that works with existing documentation |
| **write-a-prd** (to-prd) | Create a Product Requirements Document from the grilling conversation |
| **to-issues** | Break a PRD into independently grabbable vertical-slice issues (tracer bullets) |
| **triage** | Triage incoming ideas/requests with agent brief and out-of-scope handling |
| **zoom-out** | Take a step back and review the bigger picture |

### Implementation & Architecture
| Skill | Purpose |
|-------|---------|
| **tdd** | Test-Driven Development with red-green-refactor loop; teaches AI to test-first |
| **improve-codebase-architecture** | Scan repo for shallow modules → propose deep module refactors |
| **diagnose** | Diagnose issues in the codebase with scripts |
| **prototype** | Generate throwaway prototypes (UI and logic variants) for feedback |

### Productivity & Meta
| Skill | Purpose |
|-------|---------|
| **caveman** | (productivity skill) |
| **handoff** | Hand off work between sessions or agents |
| **write-a-skill** | Create new agent skills |
| **setup-matt-pocock-skills** | Install and configure the skill suite (issue tracker setup, domain setup, triage labels) |

## Tools

| Tool | Description |
|------|-------------|
| **Claude Code** | Primary coding agent (uses it but "doesn't like it very much" — "democracy is the worst form of government except all the others") |
| **Sandcastle** | Matt's own TypeScript library for running AFK agent loops with Docker sandboxing, worktrees, planner/implementer/reviewer/merger pipeline |
| **GitHub Issues** | Backlog management; 744+ closed issues in his course-video-manager repo |
| **Playwright MCP** | Browser automation for frontend testing / visual feedback |
| **agent-browser** | Alternative browser tool for giving AI visual feedback |
| **Docker** | Sandboxing agents during AFK runs |
| **Slido** | Q&A tool used during workshops |
| **Vitest (npx vitest)** | Test runner used in the example repo |
| **TypeScript** | Static type checking as a feedback loop |

## Books Referenced

| Book | Author | Key Idea |
|------|--------|----------|
| _A Philosophy of Software Design_ | John Ousterhout | Deep vs shallow modules; complexity as anything that makes a system hard to change |
| _The Pragmatic Programmer_ | Hunt & Thomas | Software entropy, tracer bullets, outrunning your headlights, don't bite off more than you can chew |
| _The Design of Design_ | Frederick P. Brooks | Design concept, design tree, shared understanding between collaborators |
| _Domain-Driven Design_ | Eric Evans | Ubiquitous language — shared terminology between developers, domain experts, and code |
