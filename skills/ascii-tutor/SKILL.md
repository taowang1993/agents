---
name: ascii-tutor
description: Use ASCII art animations in markdown files to explain complex concepts to students during tutoring sessions. Use when teaching neural networks, math, physics, algorithms, or any complex topic where visual animation would help understanding. THE STUDENT MUST BE READING THE FILE AS YOU EDIT IT - create live whiteboard animations by editing frames in real-time while narrating.
---

# ASCII Tutor

Use ASCII art animations to teach complex concepts by editing markdown files in **real-time** while students watch.

## THE CORE PRINCIPLE

**This is NOT documentation creation. This is live teaching.**

The student is reading a markdown file. You edit that SAME file, replacing frames. The student sees the animation happen live.

- ❌ DON'T: Create new files with static content
- ✅ DO: Edit a file the student is reading, frame by frame

## When to Use

- Teaching neural networks, backpropagation, gradient descent
- Explaining algorithms (sorting, searching, pathfinding)
- Demonstrating mathematical concepts (waves, curves, fractals)
- Showing physics (pendulums, orbits, waves)
- Any concept where seeing something move helps understanding

## How It Works

1. **Identify the file** the student is reading (or create a simple one)
2. **Write the first ASCII frame** in that file
3. **Tell the student to watch** - "Watch the animation..."
4. **Edit the file** to replace the ASCII with the next frame
5. **Continue editing** frame by frame while narrating

The key: The student must be reading the file AS YOU EDIT IT. They see each frame change.

## Basic Technique

```markdown
# Concept Name

```
<current ASCII frame>
```
```

**TELL THE STUDENT TO WATCH**, then edit to change the frame:

```markdown
# Concept Name

```
<next ASCII frame>
```
```

## Example: Neural Network Signal Flow

Initial frame (write this to the file):
```markdown
# 🧠 Neural Network

```
INPUT        HIDDEN        OUTPUT
  ○            ○            ○
  ○───────────○─────────────○
  ○            ○            ○
```

*Watch the signal flow...*
```

Then EDIT to show signal flowing:
```markdown
# 🧠 Neural Network

```
INPUT        HIDDEN        OUTPUT
  ●───────────●─────────────●
  ○            ○            ○
  ●───────────●─────────────○
  ○            ○            ○
  ●───────────●─────────────○
```

*Signal is flowing to the hidden layer!*
```

Then EDIT again:
```markdown
# 🧠 Neural Network

```
INPUT        HIDDEN        OUTPUT
  ●───────────●───────────[1]
  ●───────────●────────────
  ●───────────●────────────
```

*It's a "1"! 🎯*
```

## Tips

- Keep frames simple: 3-8 lines of ASCII
- Use Unicode characters: ○ ● ◉ ═ ═ ║
- Add action labels: "SIGNAL FLOWING...", "ACTIVATING...", "LOOPING..."
- Move one element at a time for clarity
- **Tell the student to watch before each edit**
- Loop back to start for continuous animations

## Common Patterns

| Concept | Animation |
|---------|-----------|
| Neural network | Signals flowing between layers |
| Sine wave | Wave peaks moving across |
| Sorting | Elements swapping positions |
| Particles | Dots moving in patterns |
| Game character | Sprite changing pose |

## Don't

- ❌ DON'T write multiple frames at once (that's documentation, not animation)
- ❌ DON'T explain without the animation running
- ❌ DON'T use images or SVG (too verbose for live editing)
- ❌ DON'T make frames too complex to edit quickly
- ✅ DO edit one frame at a time while student watches
- ✅ DO create a new file OR use existing file - either works
- ✅ DO tell the student to watch before each edit

## The Workflow

```
Option A: Use existing file
1. Student already has a markdown file open
2. You write the first frame
3. You say: "Watch this animation..."
4. You EDIT the file (replace the frame)
5. Student sees it change
6. You narrate: "See how the signal flows..."
7. You EDIT again (next frame)
8. Student sees it change again
9. Repeat until concept is explained

Option B: Create new file
1. Create a new markdown file
2. Write the first frame
3. Tell student to open and watch this file
4. EDIT the file to change the frame
5. Student sees it change
6. Continue editing frame by frame
```

Both approaches work! The key is live editing, not file location.
