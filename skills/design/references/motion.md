# Motion and Interaction

Use motion to make interfaces feel responsive, spatially coherent, and understandable. Treat motion as behavior, not garnish.

## Decide Whether to Animate

Evaluate four questions in order.

### 1. How Often Does the User See It?

Frequency changes the acceptable cost:

- **Constant or keyboard-driven:** Keep activation immediate. Avoid motion that delays input or repeatedly demands attention.
- **Frequent navigation and hover:** Use subtle state feedback, often 80–180ms.
- **Occasional overlays and state changes:** Use brief transitions that explain origin and continuity, often 150–300ms.
- **Rare onboarding or celebratory moments:** Allow more expression when it does not block progress.

Do not ban all motion on keyboard actions. Preserve instant response, then use non-blocking continuity only when it helps orientation.

### 2. What Does It Communicate?

Use motion for a specific purpose:

- **Feedback:** Confirm that input was received.
- **Continuity:** Connect old and new states.
- **Spatial explanation:** Show where an overlay or object came from and where it went.
- **Hierarchy:** Direct attention in a controlled sequence.
- **State change:** Make insertion, removal, progress, or completion legible.
- **Perceived performance:** Keep the interface responsive while work continues.

Remove motion whose only rationale is novelty.

### 3. What Is the Spatial Model?

Match direction and origin to the interface:

- Anchor popovers and menus to their trigger.
- Keep centered modals centered unless they visibly grow from another object.
- Enter and exit from compatible directions.
- Preserve velocity when a gesture reverses.
- Make shared elements travel between states rather than disappear and respawn.
- Start scale entrances near their final size; avoid making normal UI emerge from `scale(0)`.

The transition should explain the layout, not contradict it.

### 4. What Is the Cost?

Keep interaction responsive under realistic load. Prefer compositor-friendly transform and opacity for high-frequency motion. Use `clip-path`, filter, masks, and layout animation when they materially improve the result, then measure on target browsers and devices.

Do not claim that a library shorthand or all CSS animation is automatically hardware accelerated. Scheduling, property choice, layer promotion, browser behavior, and surrounding work all matter.

## Choose Timing and Easing

Use ranges as starting points, then tune in context:

| Interaction | Typical Range | Notes |
| --- | --- | --- |
| Press feedback | 80–160ms | Immediate and subtle |
| Tooltip or small popover | 100–200ms | Respect the product's delay policy |
| Menu or select | 140–240ms | Fast initial response |
| Toast or inline insertion | 180–320ms | Keep reading stable |
| Modal or drawer | 200–400ms | Distance and size justify duration |
| Large explanatory sequence | Contextual | Never block the task unnecessarily |

Choose easing by behavior:

- **Entering or exiting:** Use a strong ease-out so motion responds immediately.
- **Moving or morphing on-screen:** Use ease-in-out for acceleration and deceleration.
- **Hover and color changes:** Use a restrained ease.
- **Constant-rate progress or marquee:** Use linear.
- **Direct manipulation:** Follow the pointer, then use a spring or deceleration after release.

Make exits slightly faster when the user's intent is to dismiss. Avoid ease-in for short UI entrances because its slow start can feel unresponsive.

Prefer project motion tokens. Add a token only when the timing or curve represents a recurring semantic pattern.

## Choose the Mechanism

### CSS Transitions

Use transitions for state changes that can reverse or retarget rapidly: hover, press, open/closed attributes, and dynamic collections.

List the properties instead of using `transition: all` in shared or high-churn components.

### CSS Keyframes and `@starting-style`

Use keyframes for predetermined sequences and named system animations. Use `@starting-style` for entry transitions when browser support and fallback requirements allow it.

Do not use keyframes for interactions that need to reverse smoothly from their current state unless the implementation handles interruption.

### Web Animations API

Use WAAPI when you need programmatic control without a framework dependency. Keep cleanup, cancellation, and reduced-motion behavior explicit.

### Springs

Use springs for interruptible, velocity-bearing interactions:

- Drag and swipe gestures
- Sheets and drawers
- Shared elements that reverse mid-flight
- Decorative pointer response where momentum is part of the character

Keep bounce restrained in utility software. Tune by feel on real hardware, not from a copied preset alone.

### Motion Libraries

Use an installed motion library when it already owns layout transitions, gestures, or orchestration. Isolate client-side animation code where the framework requires it. Do not add a dependency for a transition CSS can express clearly.

Use scroll-timeline or an established scroll library for intentional scroll storytelling. Avoid React state updates on every scroll or pointer frame.

## Component Details

### Buttons and Pressables

Provide immediate pressed feedback without shifting surrounding layout. A small scale or one-pixel visual depression can work when it matches the material language. Do not apply hover lift universally; dense utility interfaces often benefit from color or border feedback instead.

Gate hover-only effects behind hover-capable pointers. Keep focus-visible styling independent from hover.

### Popovers and Menus

Use the trigger-aware transform origin supplied by the primitive when available. Keep open and close motion short. Preserve keyboard focus movement and do not delay command execution until animation finishes.

### Tooltips

Follow the product's tooltip policy. Some systems require an initial intent delay followed by instant adjacent tooltips; others require immediate display for discoverability. Never let animation or delay hide keyboard focus help.

### Lists

Animate insertion, removal, and reordering only when the movement helps track identity. Keep the collection interactive during the transition. Avoid long cascades in frequently updated lists.

### Modals and Drawers

Use opacity plus restrained transform or scale. Keep modals spatially centered unless another origin is explicit. Make drawers follow their edge and gesture direction. Restore focus after dismissal.

### Crossfades and Morphs

Align geometry before adding effects. If two states still read as separate objects during a crossfade, a small amount of blur can bridge them, but measure paint cost and preserve text readability.

## Gesture Craft

For drag and swipe interactions:

- Capture the active pointer so the gesture survives leaving the element.
- Ignore additional pointers unless multi-touch is designed.
- Combine distance and velocity when deciding dismissal.
- Apply resistance past natural boundaries instead of a sudden hard stop.
- Preserve direction and velocity when the gesture is interrupted.
- Keep a keyboard and non-gesture path to the same action.
- Test on physical touch hardware when the gesture matters.

Prefer platform-native scrolling. Replace it only when the experience genuinely requires a controlled narrative and accessibility remains intact.

## Reduced Motion

Reduced motion means reduce vestibular movement and unnecessary travel, not necessarily remove every transition.

- Remove parallax, large translation, zoom, spinning, and scroll hijacking.
- Keep brief opacity or color feedback when it aids comprehension.
- Avoid auto-playing motion that cannot be stopped.
- Ensure the final state appears immediately and remains operable.
- Test the actual reduced-motion mode rather than assuming a conditional exists.

## Performance Review

Check:

- Which properties animate and how much of the screen repaints
- Whether animation continues when hidden or offscreen
- Whether pointer or scroll updates trigger framework renders
- Whether filters, blur, shadows, or masks affect large scrolling surfaces
- Whether layout measurement is batched and cleaned up
- Whether content loading causes the animation target to move
- Whether lower-end hardware preserves responsiveness

Use the browser's performance and animation tools when motion is important. Do not optimize from folklore alone.

## Debugging

Review motion in four ways:

1. Play it at normal speed to judge responsiveness.
2. Slow it down to inspect origin, overlap, and property synchronization.
3. Interrupt it repeatedly to expose restarts and broken velocity.
4. Test keyboard, touch, reduced motion, background-tab, and busy-main-thread conditions.

Review again after a break. Fresh eyes catch timing and optical issues that repeated playback normalizes.
