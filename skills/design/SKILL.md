---
name: design
description: Audit, redesign, and build web and product interfaces with strong design taste. Use whenever the user asks to review or rebuild a design system, assess UI quality, improve visual hierarchy or polish, redesign an existing site or app, choose typography/color/layout/motion, identify an animation effect, review gesture or motion behavior, critique screenshots or components, or make an interface feel cohesive, premium, intentional, and less generic. Apply to product UI and marketing surfaces; preserve project-specific design rules and use narrower framework skills for implementation.
---

# Design

Exercise design judgment, not decoration. Treat taste as a trained ability to recognize which choices clarify the product, reinforce one another, and make the experience feel inevitable.

Adopt three craft beliefs associated with Emil Kowalski's design-engineering philosophy:

1. **Taste is trained.** Study strong work, identify why it works, and replace vague preference with specific reasoning.
2. **Invisible details compound.** Timing, alignment, focus, truncation, state transitions, and optical balance determine whether an interface feels finished.
3. **Beauty is leverage.** Visual quality earns trust and differentiation, but never trade away clarity, accessibility, or speed for spectacle.

## Scope and Precedence

Use this skill as the design-judgment layer for:

- Design-system audits and rebuilds
- Existing-site and existing-app redesigns
- Product UI, dashboards, settings, editors, and repeated workflows
- Landing pages, portfolios, editorial pages, and marketing surfaces
- Component and interaction critique
- Motion terminology, animation reviews, and gesture behavior
- Rendered visual QA

Follow project-specific design rules, brand decisions, platform conventions, and accessibility requirements before generic preferences in this skill. Treat an established system as evidence, not an obstacle. Distinguish defects from optional art-direction changes.

Use narrower skills alongside this one when they own implementation details such as Tailwind, shadcn, Tamagui, React testing, animation APIs, or a project-specific vendor parity contract.

## Design Workflow

### 1. Read the Situation

Before proposing visuals, inspect the brief and the current system. Determine:

- Surface type: product workflow, dashboard, settings, editor, landing page, portfolio, or editorial
- Primary user and the job they need to complete
- Usage frequency: repeated utility or occasional experience
- Brand signals, references, content, and existing assets
- Platform, framework, component library, and project rules
- Accessibility, performance, regulatory, and compatibility constraints
- Change mode: audit, preserve, evolve, overhaul, or greenfield

Ask one focused question only when different answers would materially change the direction.

State a concise design read before substantial design work:

> **Design Read:** [surface] for [user/job], prioritizing [qualities], constrained by [system/platform/brand].

Do not invent a mood when the product already communicates one.

### 2. Load the Relevant Guidance

Read only the references needed for the task:

- Read `references/principles.md` before making broad aesthetic or system decisions.
- Read `references/design-system-audit.md` for audits, rebuilds, migrations, or cross-route consistency reviews.
- Read `references/motion.md` for animation terminology or reviews, gestures, popovers, drawers, tooltips, transitions, or perceived performance.
- Read `references/visual-direction.md` for greenfield direction, landing pages, portfolios, or anti-generic visual critique.

### 3. Find the Governing Layer

Trace each issue to the narrowest shared layer that fully explains and can correct it:

1. Brand or primitive token
2. Semantic token
3. Component token or primitive
4. Shared recipe, template, or layout
5. Feature composition
6. Local exception

Prefer one correction at the shared layer over repeated local patches. Do not force a global change when a surface has a legitimate semantic or platform-specific exception.

### 4. Preserve Before Replacing

Identify strengths worth keeping before listing problems. Preserve:

- Recognizable brand assets and useful visual signatures
- Familiar information architecture and navigation
- Proven accessibility behavior
- Analytics hooks, form semantics, routes, and content meaning
- Components whose consistency is more valuable than novelty

Never turn a redesign into an unrequested rebrand.

### 5. Improve in Leverage Order

Prioritize work in this order:

1. Broken behavior, accessibility, readability, or responsive layout
2. System drift, duplicated patterns, and missing states
3. Hierarchy, typography, spacing, and alignment
4. Color, borders, radii, shadows, and material treatment
5. Interaction feedback and motion
6. Expressive details that support the product's character

Use typography, spacing, and composition before adding containers, effects, or animation. A weak hierarchy rarely needs another card.

### 6. Complete the Experience

Review the whole state cycle, not only the ideal screenshot:

- Default, hover, active, focus-visible, selected, and disabled
- Loading, empty, error, success, offline, and unavailable where relevant
- Long, short, missing, localized, and user-generated content
- Narrow, wide, coarse-pointer, keyboard, and reduced-motion conditions
- Light/dark themes when the product supports both

Keep feedback immediate. Make destructive actions deliberate. Preserve user input and recovery paths.

### 7. Verify Rendered Reality

Inspect representative rendered surfaces at relevant viewport sizes and themes whenever a runnable environment, screenshot, or other rendered artifact is available. When only source is available, make qualified source-level findings and state what remains visually unverified.

Verify when relevant:

- Visual hierarchy and alignment
- Overflow, wrapping, truncation, and scroll behavior
- Keyboard order and visible focus
- Contrast and non-color state cues
- Interaction timing and interruption
- Reduced motion and touch behavior
- Loading stability and image dimensions
- Consistency across representative routes, not just one showcase screen

If implementation changed, run the project's existing design, accessibility, test, and evidence commands. Do not invent a parallel validation stack when one already exists.

## Design-System Review Mode

When asked to review an existing design system, read `references/design-system-audit.md` and evaluate both its specification and its real usage.

Separate findings into four classes:

- **Defect:** objectively harms usability, accessibility, responsiveness, or correctness
- **Drift:** bypasses or contradicts the established system
- **Coherence weakness:** makes hierarchy, rhythm, or interaction feel inconsistent
- **Direction proposal:** changes taste or brand expression and requires product approval

Do not present a direction proposal as a defect.

Use this report structure:

```markdown
# Design Review

## Design Read
[Users, jobs, surface types, current character, and constraints]

## Strengths to Preserve
- [Specific strength with evidence]

## Findings
| Priority | Class | Evidence | Impact | Principle | Governing Layer | Recommendation | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- |

## System-Level Recommendations
[Smallest high-leverage changes in dependency order]

## Optional Art Direction
[Clearly separated proposals requiring a product decision]

## Verification
[Rendered surfaces, states, viewports, themes, and checks inspected]

## Limitations and Unverified
[Missing runtime, source, content, states, platforms, or evidence]
```

Rank findings by user impact and system leverage, not by how visually interesting the fix would be. Cite file paths, components, tokens, or rendered surfaces whenever available.

## Motion Judgment

Before animating, decide:

1. **Frequency:** Frequent actions should feel immediate; rare moments can carry more expression.
2. **Purpose:** Use motion for feedback, continuity, spatial explanation, hierarchy, or state change.
3. **Model:** Make direction, origin, and interruption agree with the interface's spatial logic.
4. **Cost:** Keep the interaction responsive and honor reduced motion.

If the only reason is “it looks cool,” remove it. Read `references/motion.md` before prescribing timing or implementation. Name motion precisely enough to distinguish a crossfade, morph, shared-element transition, layout animation, and origin-aware entrance rather than calling each one “smooth.”

## Motion Review Mode

When asked to review animation or gesture behavior, inspect both its implementation and rendered behavior when available. State when findings are source-only.

Review in this order:

1. Purpose and usage frequency
2. Input latency, feedback, and user agency
3. Spatial origin, direction, and continuity
4. Interruption, reversal, velocity, and gesture ownership
5. Reduced motion, alternate input, and other accessibility behavior
6. Property cost and responsiveness under realistic load
7. Cohesion and optional polish

Prefer the smallest remedial move that works: delete unnecessary motion, reduce expensive or repetitive motion, correct the spatial model, make behavior interruptible, fix accessibility or performance, then polish.

Use this structure:

```markdown
# Motion Review

## Motion Read
[Interaction, frequency, purpose, input modes, and intended character]

## Findings
| Priority | Evidence | Impact | Current Behavior | Recommendation | Why | Verification |
| --- | --- | --- | --- | --- | --- | --- |

## Verdict
[Block, Approve with Follow-Up, or Approve, with the deciding evidence]

## Limitations and Unverified
[Missing runtime, device, input mode, reduced-motion mode, or performance evidence]
```

Block only when motion materially harms responsiveness, orientation, accessibility, performance, or task completion. Treat contextual tuning and expressive alternatives as follow-up rather than correctness failures. Cite `file:line`, component, or rendered interaction whenever available.

## Anti-Generic Judgment

Treat common AI-design patterns as prompts to investigate, not universal bans. A centered hero, purple accent, Inter, card grid, glass surface, pill, or sidebar can be exactly right when the brand, product, or platform supports it.

Flag a pattern only when it is:

- Unmotivated by content or product behavior
- Repeated until hierarchy disappears
- Inconsistent with the established system
- Used as decoration instead of solving a communication problem
- Harmful to accessibility, performance, or usability

Replace generic output with a more specific rationale, not merely a less common style.

## Implementation Discipline

- Reuse the existing stack, tokens, primitives, and patterns before adding code or dependencies.
- Check installed dependencies before recommending a library.
- Keep design decisions centralized and named semantically.
- Prefer native HTML and CSS behavior when it fully solves the interaction.
- Keep changes focused and reviewable; avoid speculative abstractions.
- Preserve or improve validated semantic HTML, labels, focus, contrast, and reduced-motion behavior; fix known defects without introducing regressions.
- Use real content and assets when evaluating final visual quality; label mock data and placeholders honestly.
- Test the smallest shared change that proves the design correction works.

## Completion Standard

Finish when the agreed scope is coherent with its surrounding system and credible in the relevant edge states. Require system-scale coherence only for audits, rebuilds, and cross-surface redesigns. Explain what changed, why the governing layer was correct, what evidence was checked, and which remaining ideas are optional rather than required.
