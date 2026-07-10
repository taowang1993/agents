# Design-System Audit

Use this reference to review, rebuild, or migrate an existing design system. Audit both the declared system and the product that actually renders from it.

## Establish Authority and Scope

Find the current sources of truth before evaluating taste:

- Brand guidelines and product principles
- Design-system documentation
- Token and theme files
- Primitive and component libraries
- Shared recipes, templates, and layout shells
- Accessibility and design lint rules
- Visual tests, Storybook stories, screenshots, or browser evidence
- Compatibility zones and platform-specific exceptions

Record which source wins when documentation and code disagree. Project rules override generic preferences. If no authority exists, report that as a governance gap instead of silently choosing one.

Choose representative surfaces rather than attempting to inspect every file first:

- A high-frequency workflow
- A dense settings or data surface
- A form with validation
- A dialog, menu, tooltip, or popover
- A loading, empty, and error state
- A narrow viewport
- Each supported theme
- One expressive or marketing surface, when present

## Inventory the System

Map the design system through these layers.

### Foundations

- Brand palette and semantic color roles
- Typography families, roles, weights, line heights, and numeric treatment
- Spacing and sizing scales
- Radius, border, shadow, and elevation scales
- Motion durations, easing, and reduced-motion behavior
- Icon family and sizing
- Breakpoints, containers, safe areas, and shell dimensions
- Z-index or overlay layers

### Components

- Buttons, links, toggles, and icon actions
- Inputs, labels, validation, and field composition
- Menus, selects, dialogs, drawers, popovers, and tooltips
- Tabs, navigation, breadcrumbs, and sidebars
- Tables, charts, comparison views, lists, cards, badges, and status indicators
- Editors, command surfaces, progressive disclosure, and other dense-workflow controls
- Empty, loading, error, unavailable, and destructive states
- Typography and content primitives

### Composition

- Route or page templates
- Content containers and shared alignment boundaries
- Product shells and navigation grammar
- Form, settings, list/detail, dashboard, conversation, and catalog patterns
- Responsive behavior and density modes
- Product-specific exceptions

### Governance

- Token or hardcoded-value audits
- Accessibility checks
- Visual regression or screenshot coverage
- Component documentation
- Ownership and change process
- Deprecation and migration strategy

## Trace Real Usage

Search for evidence of drift:

- Raw colors, font sizes, spacing, radii, shadows, or z-index values
- Duplicate primitives or feature-local copies
- Page-specific hover, focus, or disabled states
- Multiple names for the same semantic role
- Tokens that exist but are bypassed
- Components with variants that have no recurring semantic purpose
- Shared classes overridden repeatedly by local specificity
- Theme values that are not wired at boot or in portals
- Responsive behavior implemented differently for equivalent surfaces

Do not count a raw value as drift when the system explicitly permits it for data visualization, authored content, vendor parity, canvas rendering, or another documented exception.

## Evaluate Along Eight Axes

### 1. Purpose and Character

Determine whether the system expresses a recognizable product character without obstructing the user's work. Check whether different products or routes feel related.

### 2. Hierarchy and Rhythm

Review heading order, action priority, density, whitespace, alignment, content measure, and scanning. Find places where every element has equal emphasis or where decorative containers replace hierarchy.

### 3. Semantic Consistency

Verify that tokens and variants describe purpose rather than appearance. Confirm that primary, neutral, selected, warning, destructive, success, and informational states retain stable meanings.

### 4. Component Completeness

Check interaction states, edge content, accessibility, theme behavior, and composition APIs. A visually polished default state does not make an incomplete component mature.

### 5. Cross-Surface Coherence

Compare equivalent controls and layouts across representative routes. Look for shared decisions implemented locally, or product-specific decisions leaking into global primitives.

### 6. Accessibility and Input Modes

Review semantics, labels, focus, contrast, keyboard order, touch targets, zoom/reflow, screen reader cues, reduced motion, and non-color status communication.

### 7. Performance and Stability

Inspect layout shift, image sizing, expensive effects, large repeated lists, animation properties, font loading, and responsiveness under actual content.

### 8. Governance and Change Safety

Assess whether the system can prevent regression: named sources of truth, deterministic audits, visual evidence, documented exceptions, and a migration path.

## Classify Findings Correctly

Use these classes:

| Class | Meaning | Example |
| --- | --- | --- |
| Defect | Objective usability, accessibility, responsive, or correctness failure | Focus is invisible on a menu item |
| Drift | Implementation bypasses an established system rule | Feature-local hardcoded border duplicates a semantic token |
| Coherence weakness | The system is valid but feels inconsistent or poorly prioritized | Three action families compete in one toolbar |
| Direction proposal | A legitimate alternative requiring product or brand approval | Replace the type family or change the primary accent |

Use impact levels:

- **Critical:** Blocks a task, causes data loss, or creates a severe accessibility failure
- **High:** Affects a common workflow or a shared primitive across many surfaces
- **Medium:** Creates repeated inconsistency or meaningful friction
- **Low:** Local polish with limited user impact

Do not inflate aesthetic preferences into high-severity findings.

## Identify the Governing Layer

For each finding, choose the smallest correct owner:

| Layer | Use When |
| --- | --- |
| Brand/primitive token | The raw palette, type, or metric itself is wrong |
| Semantic token | The purpose mapping is wrong across multiple components |
| Component token/primitive | One component family has the wrong contract or state |
| Recipe/template | A recurring composition or surface pattern is wrong |
| Feature composition | The primitive is sound but this arrangement lacks hierarchy |
| Local exception | A one-off behavior is legitimate and should remain scoped |

Recommend fixes in dependency order so downstream migration benefits automatically.

## Review System Maturity

Describe maturity without reducing taste to one score:

- **Ad hoc:** Visual decisions live mainly in feature code; little shared vocabulary or enforcement.
- **Documented:** Tokens and components exist, but usage and exceptions drift.
- **Governed:** Sources of truth, semantic layers, audits, and migration practices align.
- **Adaptive:** The system supports multiple products, themes, densities, and platforms without fragmenting.

State evidence for the maturity level and identify the next useful step. Do not recommend “adaptive” complexity to a product that only needs one stable mode.

## Rebuild Without Losing the Product

Distinguish three modes:

### Targeted Evolution

Use when information architecture, components, and brand are fundamentally sound. Improve foundations, spacing, hierarchy, states, and governance without changing the product model.

### System Refactor

Use when tokens, primitives, and recipes are duplicated or poorly layered. Preserve product behavior while migrating foundations and components behind stable interfaces.

### Full Visual Rebuild

Use when the product has an approved new brand or interaction direction. Preserve routes, semantics, analytics, content meaning, accessibility behavior, and migration compatibility unless separately authorized.

If the user says “rebuild” but the desired outcome is unclear, ask whether they mean a new visual language, a new system architecture, or both.

Before migration, record a preservation contract for critical workflows, public component APIs, routes and deep links, navigation hierarchy, form behavior, analytics events, supported platforms, and validated accessibility behavior. Use it as a before/after regression contract, not as a reason to preserve known defects.

## Rebuild Sequence

Plan work in this dependency order:

1. Define product principles, supported modes, success evidence, and the preservation contract.
2. Inventory current decisions and consumers; mark preserve, evolve, replace, or retire.
3. Define old-to-new mappings, reversible migration batches, and rollback triggers.
4. Define primitive and semantic tokens.
5. Stabilize typography, icon, focus, motion, and layout foundations.
6. Rebuild shared primitives with complete state models.
7. Define recipes and route templates for recurring compositions.
8. Migrate representative surfaces, validate the direction, and check the preservation contract.
9. Migrate remaining surfaces incrementally and add deterministic audits plus rendered regression evidence.
10. Remove deprecated paths only after usage reaches zero and rollback risk is retired.

Avoid a flag day when an incremental compatibility layer can keep the product working. Keep each shared-token or primitive batch reversible until representative consumers pass their regression contract.

## Review Output

For every finding, include:

- Specific evidence: file, token, component, route, screenshot region, or interaction
- User or system impact
- Principle being violated
- Correct governing layer
- Minimum recommendation
- Verification needed
- Evidence limitations and unverified surfaces, states, platforms, or behavior

Begin with strengths to preserve. End with optional art-direction ideas clearly separated from required corrections.

A useful review makes the next change safer. It does not merely prove that the reviewer has preferences.
