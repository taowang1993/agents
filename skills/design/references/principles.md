# Design Principles

Use these principles to reason about design quality. Apply them contextually; do not turn them into a fixed aesthetic.

## Start with the Experience

Design the user's sequence of attention and action, not a collection of attractive components.

Ask:

- What should the user notice first?
- What should they understand next?
- What action should feel obvious?
- What information can remain quiet until needed?
- What will they repeat dozens of times?
- What can go wrong, and how will they recover?

A coherent flow matters more than any isolated screenshot. Check whether the experience gives people predictability, understanding, a credible path to achievement, and appropriate moments of joy; delight should emerge from the first three rather than compensate for their absence.

## Build Hierarchy Before Decoration

Create hierarchy with this order of operations:

1. Content order and information architecture
2. Typography and scale
3. Space and grouping
4. Alignment and layout
5. Color and contrast
6. Borders, shadows, effects, and motion

If everything is emphasized, nothing is. Use one dominant element per decision context and let supporting information become quieter without becoming unreadable.

Prefer whitespace, alignment, and type hierarchy before adding cards. Add a boundary only when it communicates containment, selection, elevation, interaction, or a semantic state.

## Make the System Coherent

Every decision should reinforce nearby decisions:

- Typography should match the product's density and voice.
- Radius, border, and shadow treatments should describe one material language.
- Icons should share a family, optical size, and stroke character.
- Motion should match the product's personality and usage frequency.
- Controls with the same role should have the same states and geometry.
- Product-specific expression should sit on shared foundations rather than fork them.

Consistency does not mean uniformity. Build a clear rule for variation: container versus control radius, primary versus neutral action, dense utility surface versus expressive marketing surface.

## Treat Taste as Reasoned Specificity

Replace “this looks better” with a concrete explanation:

- “The title and metadata compete because their weight and contrast are nearly equal.”
- “The primary action is visually weaker than three secondary controls.”
- “The card border duplicates the spacing boundary and adds noise.”
- “The popover appears from its center even though the trigger establishes an origin.”
- “The page introduces a second neutral palette, so shared components no longer feel related.”

Reference strong products to study principles, not to copy their surface styling wholesale.

## Typography

Use typography to express order, rhythm, and voice.

- Choose typefaces from the brand and product context, not from a generic ban or trend.
- Keep a small semantic scale with named roles.
- Use weight, size, line height, and contrast together; do not make size carry the entire hierarchy.
- Use optical sizing when the chosen variable font supports it, and verify the rendered result.
- Tune tracking and leading by text role and size rather than applying one value across the scale; large display type often needs tighter spacing than small utility text.
- Let user-controlled text scaling reflow the layout; prefer relative units where they preserve that behavior.
- Keep body measure readable, commonly around 45–75 characters depending on context.
- Balance or prettify display copy when supported, but preserve natural reading order.
- Use tabular figures where changing numeric widths would cause jitter or harm scanning.
- Keep metadata quieter than body text while maintaining contrast.
- Test real content, localization, long labels, and user-generated text.

Do not replace an established font merely to make the interface feel “premium.” A font change is a brand and performance decision.

## Spacing and Layout

Build rhythm from a limited spacing scale and intentional relationships.

- Use proximity to show relationship before drawing a box.
- Align shared edges across headings, content, controls, and empty states.
- Prefer container-owned alignment over one-off margins on children.
- Let dense workflows remain dense when speed and comparison matter.
- Give marketing and reading surfaces more breathing room when attention and narrative matter.
- Use grid for two-dimensional structure and flex for one-dimensional alignment.
- Collapse complex compositions deliberately on narrow screens.
- Account for safe areas, dynamic viewport units, zoom, and content growth.

Optical alignment can differ slightly from mathematical alignment. Apply corrections sparingly and document reusable ones in the component or token that owns them.

## Color and Contrast

Use color semantically and consistently.

- Begin with brand, neutral, and semantic roles rather than isolated hex values.
- Reserve the strongest accent for the most important actions and states.
- Keep success, warning, destructive, and informational meanings distinct from brand decoration.
- Maintain one coherent neutral temperature unless contrast between families is intentional.
- Pair color with text, shape, iconography, or position for status communication.
- Test contrast in the rendered context, including hover, disabled, placeholder, overlay, and dark-theme states.

Do not reject purple, blue, beige, gradients, or monochrome by category. Reject an unmotivated palette that could belong to any product.

## Surfaces and Material

Use material cues to explain structure.

- Borders define adjacency and containment.
- Shadows communicate elevation and separation.
- Background changes establish regions and hierarchy.
- Blur and translucency imply layered material and require contrast plus reduced-transparency fallbacks.
- Radius communicates softness and component family.

Keep lighting direction and elevation levels coherent. Avoid stacking border, shadow, gradient, and blur when one cue would suffice.

## Components and States

A component is not complete until its state model is complete.

Review:

- Default, hover, active, focus-visible, selected, and disabled
- Loading, pending, success, warning, error, and destructive confirmation
- Empty and no-results states
- Long content, missing content, and localization
- Keyboard, touch, coarse pointer, and screen reader behavior
- Theme and density variants the product actually supports

Use good defaults instead of exposing options for every visual decision. Add variants only when a recurring semantic need exists. For shared components, keep the common path easy to adopt and handle lifecycle, interruption, content, and input edge cases inside the component when that ownership is safe and predictable.

## Content and Copy

Design copy as interface material.

- Use specific verbs and concrete nouns.
- Keep labels concise while preserving meaning out of context.
- Make errors explain what happened and what the user can do next.
- Avoid fabricated precision and generic placeholder brands in final evaluations.
- Keep one voice per product unless a surface has a deliberate editorial role.
- Preserve legal, consent, and safety wording unless explicitly authorized to change it.

Do not rewrite product meaning as a side effect of visual redesign.

## Preserve Agency, Familiarity, and Responsibility

Keep people in control and build on behavior they can predict:

- Provide undo or recovery for reversible mistakes; reserve confirmation dialogs for genuinely destructive or difficult-to-reverse actions.
- Keep wayfinding clear: show where people are, what is available, where they can go, and how they can leave.
- Place controls near what they affect and make their arrangement map to the result.
- Honor platform conventions unless a tested alternative materially improves the task.
- Request permissions and sensitive information when the need is clear, collect only what the task requires, and explain consequences plainly.
- Adapt interaction depth to the platform and context rather than forcing one layout or input model everywhere.
- Treat safety, privacy, and foreseeable misuse as design constraints, especially when automated or AI-generated output can affect people.

Simplicity is not hiding everything. Show the common path first, keep advanced capability discoverable, and add context when it reduces uncertainty.

## Accessibility Is Craft

Treat accessibility as part of quality, not a compliance pass.

- Preserve semantic elements and native behavior.
- Provide visible keyboard focus and logical focus order.
- Label controls and icon-only actions.
- Meet contrast requirements without relying on color alone.
- Keep touch targets usable without making every desktop control visually oversized.
- Support zoom, reflow, reduced motion, and forced-colors where relevant.
- Avoid blocking paste, selection, or platform accessibility features.

The most polished interaction is the one users can operate without fighting it.

## Performance Shapes Perception

Design choices affect speed and stability.

- Reserve image and media dimensions to prevent layout shift.
- Keep above-the-fold assets intentional and optimized.
- Avoid continuous visual effects that repaint large scrolling regions.
- Virtualize or contain large repeated collections when measurements justify it.
- Keep feedback immediate even when the underlying operation is asynchronous.
- Prefer transform and opacity for frequent motion; measure other effects in context.

Perceived speed cannot compensate for blocked input or unstable layout.

## Review the Whole, Then the Details

Evaluate at three distances:

1. **Whole product:** Does it feel like one system across representative routes?
2. **Surface:** Is hierarchy clear and does the workflow fit its use frequency?
3. **Detail:** Are states, alignment, timing, copy, and edge cases resolved?

Polish details only after the whole and the surface are sound. Invisible details compound, but they cannot rescue the wrong information architecture. When a gesture, transition, or responsive adaptation defines the experience, prototype it interactively and test it in context; a static frame cannot prove behavior.
