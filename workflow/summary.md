# Summary: Dex Horthy — Advanced Context Engineering for Coding Agents

**Source:** YouTube — [Dex Horthy talk](https://www.youtube.com/watch?v=rmvDxxNubIg)
**Transcript saved:** `/Users/max/.agents/workflow/dex-horthy.md`

---

## Core Thesis

AI coding agents produce too much rework and "slop" in brownfield codebases today. The key to making them effective is **context engineering** — deliberately managing the LLM's context window so every token in produces the best possible token out. This talk distills Dex and his team's practical findings after rewiring their entire development workflow around context management.

---

## The Problem

- A survey of 100,000+ developers shows most AI-assisted coding involves heavy rework and codebase churn.
- Greenfield / small projects work great; 10-year-old Java monoliths are a different story.
- Naive use: ask → correct → re-steer → iterate until context fills up or you give up.

## Key Concepts

### Context Is Everything

LLMs are stateless. Every tool call, file read, test output, and prior turn fills the context window. The only lever for better LLM output is **better input tokens**.

### The Dumb Zone

- Context window ≈ 168,000 tokens (varies by model).
- Around **40% utilization**, diminishing returns kick in — you enter the "dumb zone."
- Too many MCP tools dumping JSON and UUIDs into context push you squarely into the dumb zone.
- **Principle (Jeff Huntley):** the more context window you use, the worse the outcomes.

### Trajectory Matters

If the conversation history is a pattern of "agent does wrong → human yells → agent does wrong → human yells," the LLM will predict the next token should continue that pattern. **Mind your trajectory.** Incorrect information is the worst; then missing information; then noise.

## Techniques

### 1. Intentional Compaction

When a context window becomes saturated, ask the agent to compress everything into a markdown file. Review it, tag it, and start a fresh context window. The new agent skips all the searching and codebase discovery and gets straight to work.

**What to compact:** exact files and line numbers that matter — not entire repos or raw MCP dumps.

### 2. Sub-agents (For Context Control, Not Role-Play)

Sub-agents are **not** for anthropomorphizing roles (frontend agent, QA agent, etc.). They are for **forking context**. A sub-agent explores a codebase area in its own context window and returns a single succinct result to the parent — e.g., "the file you want is here."

### 3. Research → Plan → Implement (RPI / Frequent Intentional Compaction)

A three-phase workflow that stays in the "smart zone" throughout:

| Phase | Purpose |
|-------|---------|
| **Research** | Understand how the system works. Find the right files. Stay objective. Output: a snapshot of the codebase "compressing truth." |
| **Plan** | Outline exact steps with file names and code snippets. Compression of intent. Includes explicit test steps after each change. |
| **Implement** | Execute the plan with low context. A solid plan means even "the dumbest model" can't screw it up. |

Prompts and plan templates are open-source and available on GitHub.

### 4. On-Demand Compressed Context (Over Static Docs)

Static onboarding files get stale. Documentation is where the most "lies" live in a codebase (the actual code is truth, comments and docs drift). Dex prefers:

- Steer the research agent toward the relevant part of the codebase.
- Use sub-agents to take vertical slices and build a **just-in-time research document** from the code itself (not stale docs).
- This is "progressive disclosure" — only pull in what you need, when you need it.

## Mental Alignment

The single most important purpose of code review is **mental alignment** — keeping the entire team on the same page about how the codebase is changing and why. Plans serve this purpose: a technical lead can review plans (not every line of code) and catch problems early while understanding system evolution.

## Don't Outsource the Thinking

AI amplifies the thinking you have done — **or the lack of thinking you have done.** There is no perfect prompt. You must:

- Read the research. A bad research line (misunderstanding how the system works) destroys everything downstream.
- Read the plan. A bad line in a plan can produce 100 bad lines of code.
- Keep the human in the loop at the highest-leverage points.

## "Spec-Driven Dev" Is Semantically Diffused

Citing Martin Fowler's 2006 observation about semantic diffusion, Dex argues the term "spec-driven development" is now meaningless — it means everything from "a detailed prompt" to "treating code like assembly." He warns against the same happening to "RPI" and emphasizes the substance (compaction + context engineering) over the label.

## Scope Calibration

Not every task needs the full research → plan → implement pipeline:

| Task Complexity | Approach |
|-----------------|----------|
| Button color change | Just tell the agent |
| Small feature | Light planning |
| Medium feature (cross-repo) | Research → plan |
| Hardest problems (brownfield, complex) | Full RPI with heavy compaction |

The ceiling on problem difficulty rises the more context engineering you're willing to do. It takes reps and you will get it wrong — pick one tool and practice.

## The Organizational Rift

- **Staff engineers** don't adopt AI because it doesn't make them much faster.
- **Junior/mid-level engineers** use AI heavily — it fills skill gaps but also produces slop.
- **Senior engineers** grow frustrated cleaning up AI slop shipped the previous week.

This isn't AI's fault or the mid-level engineers' fault. **Cultural change must come from the top.** Technical leaders must pick one tool, get reps, and lead the adaptation.

## One Takeaway

> A bad line of code is a bad line of code. A bad line in a plan could be a hundred bad lines of code. A bad line of research — a misunderstanding of how the system works — and your entire effort is hosed.
