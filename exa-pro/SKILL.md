---
name: exa-pro
description: Web search, content extraction, and deep research via Exa API. Use for searching documentation, facts, company info, news, academic papers, or any web content. Supports highlights, full text, LLM summaries, structured outputs, and multi-step deep research. More powerful than brave-search for complex queries.
---

# Exa Search

Web search and content extraction using the Exa API. Supports highlights (default), full page text, LLM summaries, structured outputs, and deep multi-step research.

## Search

```bash
{baseDir}/search.js "query"                              # Basic search with highlights (5 results)
{baseDir}/search.js "query" -n 10                       # More results (max 100)
{baseDir}/search.js "query" --text                      # Full page text as markdown
{baseDir}/search.js "query" --summary                   # LLM-generated summaries
{baseDir}/search.js "query" --type deep                 # Multi-step deep research
{baseDir}/search.js "query" --category news             # News articles only
{baseDir}/search.js "query" --category company          # Company research
{baseDir}/search.js "query" --category "research paper" # Academic papers
```

### Options

**Results:**
- `-n <num>` — Number of results (default: 5, max: 100)

**Search type:**
- `--type <type>` — `auto` (default), `fast`, `instant`, `deep-lite`, `deep`, `deep-reasoning`
  - `auto` — Balanced speed and quality (~1s)
  - `fast` — Lower latency, good relevance (~450ms)
  - `deep` — Multi-step search with reasoning (4-15s)
  - `deep-reasoning` — Maximum reasoning depth (12-40s)

**Content mode:**
- `--highlights` — Key excerpts relevant to query (default)
- `--text` — Full page text as markdown
- `--summary` — LLM-generated summary

**Filters:**
- `--category <cat>` — `company`, `people`, `research paper`, `news`, `personal site`, `financial report`
- `--include-domains <d1,d2>` — Only results from these domains
- `--exclude-domains <d1,d2>` — Exclude these domains
- `--start-date <ISO>` — Only results published after this date (e.g. `2025-01-01`)
- `--end-date <ISO>` — Only results published before this date
- `--country <code>` — Two-letter country code (e.g. `US`, `DE`)
- `--max-age <hours>` — Max age of cached content (`0` = always livecrawl)

**Structured output:**
- `--output-schema <json>` — JSON schema for structured output (e.g. `'{"type":"object","properties":{"name":{"type":"string"}}}'`)
- `--system-prompt <text>` — Instructions guiding search and synthesis

## Extract Page Content

```bash
{baseDir}/content.js https://example.com/article
```

Fetches a URL and extracts text/highlights via Exa's `/contents` endpoint. Returns markdown.

## Output Format

**With highlights (default):**
```
--- Result 1 ---
Title: Page Title
Link: https://example.com/page
Published: Jan 15, 2025
Author: Author Name
Highlights:
  • Key excerpt from the page relevant to your query...
  • Another relevant excerpt...

--- Result 2 ---
...
```

**With deep search / output schema:**
```
=== Synthesized Output ===
AI-generated answer synthesizing results...

--- Sources ---
  [high confidence] Source Title: https://...
```

## Exa vs Brave Search

| Feature | Exa | Brave |
|---------|-----|-------|
| Highlights (query-relevant excerpts) | ✅ Default | ❌ |
| Full page text | ✅ | Only with separate content fetch |
| LLM summaries | ✅ | ❌ |
| Deep multi-step research | ✅ | ❌ |
| Structured JSON output | ✅ | ❌ |
| Company/people/news filters | ✅ | ❌ |
| Academic paper search | ✅ | ❌ |
| Latency | ~1s (auto) | ~500ms |
| Free tier | No (paid) | Yes (2000 queries/mo) |
| Cost | Per query (~$0.005) | Free |

**Use Exa when** you need highlights, deep research, structured outputs, or content filters. **Use Brave when** you need a free, fast, simple search.

## When to Use

- Research requiring synthesized answers across multiple sources
- Company or people lookups
- Academic paper search
- News with domain/date filtering
- Structured data extraction from web pages
- Any task where query-relevant highlights are more useful than raw snippets
