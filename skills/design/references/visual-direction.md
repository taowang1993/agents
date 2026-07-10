# Visual Direction

Use this reference to establish or critique visual direction without defaulting to generic AI aesthetics or novelty for its own sake.

## Make a Design Read

Infer direction from evidence:

- Product type and user expectations
- Brand assets and existing recognition
- Content and imagery
- Usage frequency and desired emotional tone
- Competitive context and named references
- Accessibility, trust, and regulatory needs
- Platform conventions

Describe the result in one line:

> **Design Read:** [surface] for [audience/job], using [visual character] to support [goal], within [constraints].

When two plausible directions would produce materially different systems, ask one concrete either/or question. Otherwise state the read and proceed.

## Translate References into Principles

Do not copy a reference's visible style as a package. Extract the underlying decisions: hierarchy, density, grid, type contrast, material, imagery, and motion. Connect each borrowed principle to this product's content or behavior, then recombine it with the product's own brand assets and constraints.

Ground brand expression in the category, audience, product action, emotional promise, trust requirements, and one useful core metaphor. Test whether that idea remains recognizable across UI, imagery, copy, and physical or campaign applications rather than relying on a logo alone.

Run a distinctiveness check: remove the logo and product name from the proposed direction. If the result could represent several unrelated competitors unchanged, strengthen the direction with product-specific content structure, interaction evidence, visual assets, or brand behavior rather than arbitrary novelty.

## Reference-First Direction

When references can reduce ambiguity, use them as design evidence rather than decoration:

1. Create or collect a legible reference for each materially different surface or composition.
2. Inspect visible text, hierarchy, type relationships, spacing, grid, component geometry, imagery, palette, and state cues.
3. Extract the repeated rules into a compact system contract before implementation.
4. Generate or request a focused detail when text, controls, or spacing cannot be read confidently; do not infer from a compressed board or distorted crop.
5. Compare the rendered implementation against the reference at the intended viewport and fix drift in hierarchy, spacing, type, color, imagery, and component treatment.

Preserve the reference's logic, not accidental rendering artifacts. An authoritative project system, real behavior, accessibility, and content meaning still take precedence.

## Separate Product UI from Marketing

### Product UI

Optimize repeated product workflows for:

- Immediate response and predictable placement
- Clear state, focus, selection, and recovery
- Scannable density matched to the task
- Stable shells and navigation
- Complete data, loading, empty, and error behavior
- Tables and charts optimized for comparison, not decoration
- Editors and command surfaces with stable focus and keyboard behavior
- Progressive disclosure that keeps advanced detail available without flattening hierarchy
- Low-cost motion that aids continuity
- Reusable primitives and semantic patterns

Do not force expressive asymmetry, large whitespace, cinematic scrolling, or image-heavy composition into a tool users operate all day.

### Marketing and Editorial Surfaces

Optimize occasional narrative surfaces for:

- A clear value proposition and content sequence
- Distinctive art direction grounded in the brand
- Strong typography and real visual assets
- Compositional variety without losing rhythm
- Focused calls to action
- Responsive storytelling and fast loading

Do not make every section a new visual language. One page should still feel like one system.

For marketing surfaces, give the sequence a conversion spine: establish the value, explain how it works, provide credible evidence, and make the next action clear. Each section should advance one of those jobs rather than exist only to vary the layout. Use one product-specific narrative or visual metaphor as a subtle thread, plus at most one secondary “second-read” motif that rewards attention without obscuring the first read.

## Define a Multi-Surface Contract

Before directing several routes, screens, or generated references, lock the decisions that must remain stable:

- Dominant platform mode and navigation model
- Palette roles and contrast behavior
- Typography families, roles, and scale relationships
- Spacing, grid, container, radius, and elevation logic
- Icon and illustration language
- Image crops, grade, texture, and framing
- Component states and motion character
- Voice, CTA intent, and content density

Allow composition, emphasis, and visual tempo to vary by surface while preserving this contract. Track the composition anchor and background treatment used on each marketing section so repetition is deliberate rather than an unnoticed template loop.

## Control the Main Dials

Reason about three independent qualities instead of copying a style:

- **Variation:** symmetrical and predictable ↔ asymmetric and expressive
- **Motion:** static and immediate ↔ cinematic and choreographed
- **Density:** spacious and editorial ↔ compact and operational

Infer each dial from the brief. Do not use high variation or high motion merely to signal design sophistication.

## Avoid Generic Output Contextually

Investigate these patterns when they appear without a product reason:

- Centered hero, gradient blob, and two generic calls to action
- Three equal feature cards repeated across sections
- Glass treatment on every container
- Large rounded cards around content that needs no boundary
- Excessive pills, eyebrow labels, status dots, and tiny metadata
- Purple/blue gradients used only to imply technology
- Oversized headings compensating for weak copy
- Fake dashboards built from decorative rectangles
- Placeholder brand names, fabricated metrics, and vague marketing verbs
- Motion on every element without hierarchy or purpose
- Different layout families that do not share typography, color, or spacing logic

Do not ban the pattern itself. Ask whether it communicates content, behavior, or brand. Keep it when the answer is specific and convincing.

## Typography Direction

Choose typography by voice and use:

- Neutral sans families support utility, density, and broad language coverage.
- Distinctive sans families can carry a brand without sacrificing product clarity.
- Serif families suit genuinely editorial, literary, luxury, or heritage contexts.
- Monospace belongs to code, technical data, and deliberate brand expression, not every metadata label.

Use one primary family and add another only when the contrast has a defined role. Verify available weights, italics, language coverage, loading cost, and rendering before committing.

Do not swap a typeface simply because it is common. Common can be appropriate; unconsidered is the problem.

## Color Direction

Build the palette from:

1. Brand or product identity
2. Neutral surface hierarchy
3. Primary action emphasis
4. Semantic states
5. Data visualization needs

Keep the strongest chroma scarce enough to carry meaning. Maintain consistent neutral temperature and test the palette in actual component states.

Avoid “premium” palette recipes that make unrelated products look alike. Beige and brass, monochrome and neon, or purple and blue are all valid only when they belong to this product.

## Layout Direction

Choose layouts from content structure:

- Use list/detail when selection and comparison matter.
- Use tables when users compare values across consistent columns.
- Use cards when items are independent objects or boundaries matter.
- Use split layouts when two regions have persistent, related roles.
- Use asymmetric marketing compositions when they create emphasis or narrative.
- Use a focused single column when reading or one dominant action matters.

Vary marketing section composition enough to avoid repetition, but preserve a shared grid, container, and rhythm. Keep product workflows more predictable.

## Material and Depth

Pick a material language and make it coherent:

- Flat layers with borders
- Soft elevation with restrained shadows
- Dense utility plates
- Translucent layered surfaces
- Editorial whitespace with minimal chrome

Define when boundaries, elevation, and radius change. Do not stack visual effects to compensate for unclear structure.

Use texture, noise, mesh, or photographic atmosphere only when it supports the brand. Keep large scrolling effects cheap and provide contrast fallbacks for translucency.

## Images and Product Representation

Use real brand assets, product screenshots, generated art direction, or clearly labeled placeholders.

- Define one coherent photography or illustration language: subject, lighting, palette, perspective, texture, and level of realism.
- Match aspect ratio, crop, focal point, and visual weight to the placement.
- Sequence images so they advance the story rather than repeat the same composition.
- Reserve dimensions to prevent layout shift.
- Use meaningful alt text for informative images.
- Avoid decorative fake product interfaces that could misrepresent functionality.
- Keep social proof truthful and visually subordinate to the main message.
- Do not invent precise metrics or customer claims.

A text-led direction can be valid. Require imagery when it serves the story, not to satisfy a quota.

## Content Discipline

Give each section one job. Keep primary actions distinct from secondary exploration.

- Use concrete headlines and verbs.
- Remove repeated labels that add no information.
- Keep call-to-action language consistent for the same intent.
- Move dense detail into the appropriate route, disclosure, or comparison component.
- Let real product information determine component choice.

Do not disguise missing content with decorative microcopy.

## Responsive Direction

Design the narrow layout intentionally:

- Preserve content and action priority.
- Collapse multi-column composition in a meaningful order.
- Keep navigation operable without wrapping unpredictably.
- Use dynamic viewport units for full-height mobile regions.
- Prevent overflow from long words, localized labels, and user content.
- Keep touch interactions separate from hover-only effects.

A desktop composition is not complete until its narrow behavior is specified.

## Produce a Semantic Handoff

When the deliverable is direction rather than code, document decisions by purpose so another designer or implementation agent can apply them without copying a screenshot blindly:

```markdown
# Design Direction

## Design Read
[Audience, job, character, platform, and constraints]

## Brand and Product Spine
[Emotional promise, core metaphor, narrative or conversion sequence]

## System Contract
[Color roles, typography, grid, spacing, shape, material, imagery, and icons]

## Components and States
[Shared patterns, hierarchy, interaction states, and content behavior]

## Responsive and Accessibility Behavior
[Reflow, input modes, contrast, focus, zoom, and preference fallbacks]

## Motion
[Purpose, frequency, spatial model, tokens, and reduced-motion behavior]

## Evidence, Open Decisions, and Prohibitions
[References inspected, unresolved choices, and context-specific patterns to avoid]
```

Use semantic roles and relationships before raw values. Include exact values when approved or measured, but do not fabricate a token system from a mood alone.

## Direction Review

When critiquing a direction, explain:

1. What character it currently communicates
2. Which choices reinforce that character
3. Which choices feel borrowed, generic, or contradictory
4. What should be preserved
5. The smallest set of changes that would make the direction coherent
6. Which alternative directions require explicit brand approval

Offer one strong recommendation before presenting optional alternatives. Too many equal directions transfer design judgment back to the user.
