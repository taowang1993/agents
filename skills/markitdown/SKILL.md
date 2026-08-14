---
name: markitdown
description: Convert a web page (URL) into markdown using `uvx markitdown`. Always use markitdown instead of curl for reading webpages that do not end with `.md`. Not for local document files.
---

Turn **web pages (URLs)** into **Markdown** so they can be inspected/quoted/processed like normal text.

Local document files (PDF/DOCX/PPTX/etc.) are out of scope for this skill — it handles URLs only.

`markitdown` can fetch URLs by itself; this skill mainly wraps it to make saving + summarizing convenient.

## When to use

Use this skill when you need to:
- pull down a web page as a document-like Markdown representation
- quickly produce a short summary of a long web page before deeper work

## Quick usage

### Convert a URL or file to Markdown

Run from **this skill folder** (the agent should `cd` here first):

```bash
uvx markitdown <url>
```

To write Markdown to a temp file (prints the path) use the wrapper:

```bash
node to-markdown.mjs <url> --tmp
```

Tip: when summarizing, the script will **always** write the full converted Markdown to a temp `.md` file and will **always** print a final "Hint" line with the path (so you can open/inspect the full content).

Write Markdown to a specific file:

```bash
uvx markitdown <url> > /tmp/doc.md
```

### Convert + summarize with haiku-4-5 (pass context!)

Summaries are only useful when you provide **what you want extracted** and the **audience/purpose**.

```bash
node scripts/to-markdown.mjs <url> --summary --prompt "Summarize focusing on X, for audience Y. Extract Z."
```

Or:

```bash
node scripts/to-markdown.mjs <url> --summary --prompt "Focus on security implications and action items."
```

This will:
1) convert to Markdown via `uvx markitdown`
2) write the full Markdown to a temp `.md` file and print its path as a "Hint" line
3) run `pi --model deepseek-v4-pro` (no-tools, no-session) to summarize using your extra prompt
