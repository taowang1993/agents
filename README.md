# Tao's Agent Toolset

## Pi Extensions

Extensions for the [Pi Coding Agent](https://github.com/vercel-labs/pi).

### copy-prompt

Copy prompt content (text and images) to the system clipboard.

### loop

Start a follow-up loop with a breakout condition via `/loop`.

### notification

Play a system sound (`Funk.aiff`) when the agent finishes a turn.

### prompt-editor

Custom prompt editor with model selection, provider switching, and thinking-level settings.

### screenshot

Capture and attach screenshots for the agent to analyze.

### uv

Redirect Python tooling (`pip`, `python`, `poetry`) to `uv` equivalents for faster, lockfile-driven workflows.

## Agent Skills

### agent-browser

Automate browser interactions: navigate pages, fill forms, click buttons, take screenshots, scrape data, test web apps. Supports proxy, headers, geo/device emulation, Electron apps, Slack automation, and cloud browsers.

Origin: https://github.com/vercel-labs/agent-browser/tree/main/skills/agent-browser

### ai-sdk

Build AI-powered features with the Vercel AI SDK — generateText, streamText, tool calling, structured output, useChat.

Origin: https://github.com/kthrob/ai_sdk/tree/main/skills/use-ai-sdk

### architect

Find deepening opportunities in a codebase, informed by the project's `architecture.md`. Use for improving architecture, finding refactoring opportunities, consolidating tightly-coupled modules, or making a codebase more testable and AI-navigable.

### ascii-tutor

Explain complex concepts with live ASCII art animations in markdown files during tutoring sessions.

### beads

Durable project task tracking with `bd` or Beads. Issue dependencies, blocker management, multi-session handoff, and shared work memory. Use for finding ready work, claiming/closing tasks, creating follow-up work, or planning features.

### bx

All-in-one web search for AI agents. Pre-extracted, token-budgeted web content, deep research, news, images, videos, places, and custom ranking. Uses Brave Search API.

### clawpatch

Automated code review that maps a repo into semantic feature slices, reviews each slice with an AI provider, persists findings, and can run explicit fix loops. Use for code review, auditing, test gap analysis, or cleaning up AI-generated slop.

### dedao

Use `dedao-dl` for 得到 App workflows — login, cookies, account switching, purchased courses, audiobooks, ebooks, articles, notes, search results, URL-to-ID mapping, downloads, JSON output for agents, and troubleshooting.

Origin: https://github.com/yann0917/dedao-dl/tree/main/skills

### diagnose

Disciplined diagnosis loop for hard bugs and performance regressions. Reproduce → minimise → hypothesise → instrument → fix → regression-test.

### docsee

Manage AGENTS.md doc indexes synced from upstream GitHub repos.

Origin: https://github.com/taowang1993/docsee/tree/main/skill/docsee

### domain

Brainstorm and check availability of domain names using tldx CLI.

### exa

Free neural web search, code search, and company research via Exa MCP (no API key needed).

### exa-pro

Web search, content extraction, and deep research via Exa API. Supports highlights, full text, LLM summaries, structured outputs, and multi-step deep research. More powerful than brave-search for complex queries.

### fallow

Codebase intelligence for JS/TS — find unused code, duplicates, circular deps, complexity hotspots, and feature flags.

Origin: https://github.com/fallow-rs/fallow/tree/main/npm/fallow/skills/fallow

### find-skills

Discover and install agent skills when the user asks "how do I do X" or "find a skill for…"

Origin: https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md

### gh-cli

Interact with GitHub using the `gh` CLI — issues, PRs, CI runs, and advanced queries.

### hf-cli

Hugging Face Hub CLI — download, upload, manage models, datasets, spaces, papers, and inference endpoints.

Origin: https://github.com/huggingface/skills/tree/main/skills/hf-cli

### knip

Unused-code analysis for JavaScript/TypeScript projects — unused files, dependencies, exports, types.

### maestro

E2E UI testing for iOS, Android, Flutter, React Native, and Web with Maestro flows.

### markitdown

Convert URLs, PDFs, DOCX, HTML, and other files into Markdown using `uvx markitdown`.

### mcporter

List, configure, authenticate, call, and inspect MCP servers/tools over HTTP or stdio.

### playwright-cli

Default browser automation tool. Page nav, click/type/fill, screenshots, snapshots, multi-tab, keyboard/mouse, drag-drop, file upload, dialogs. Sessions with state persistence. Network mocking. DevTools tracing and video. Test authoring and debugging.

Origin: https://github.com/microsoft/playwright-cli/tree/main/skills/playwright-cli

### react-doctor

React code quality checks — lint, dead code, accessibility, bundle size, architecture diagnostics.

Origin: https://github.com/millionco/react-doctor/tree/main/skills/react-doctor

### react-testing

Generate Vitest + React Testing Library tests for React components, hooks, and utilities.

### skill-creator

Create new skills, modify existing ones, run evals, and optimize descriptions for better triggering.

Origin: https://github.com/anthropics/skills/tree/main/skills/skill-creator

### skill-validator

Validate and score Agent Skill packages for spec compliance, content quality, contamination, and LLM scoring.

### surf

Chrome-only secondary browser CLI. Use for AI queries via browser cookies (ChatGPT, Gemini, Perplexity, Grok, AI Studio), multi-step workflows with loops/variables, iframe interaction, window isolation, and semantic locators.

### tailwind

Build scalable design systems with Tailwind CSS v4, design tokens, component libraries, and responsive patterns.

### tdd

Test-driven development with red-green-refactor loop using Playwright for behavioral E2E tests. The default development workflow — write failing tests before implementation.

### tmux

Remote control tmux sessions for interactive CLIs by sending keystrokes and scraping pane output.

### turborepo

Turborepo monorepo build system — task pipelines, caching, CI optimization, workspace filtering.

Origin: https://github.com/vercel/turborepo/tree/main/skills/turborepo

### uv

Use `uv` instead of pip/python/venv — run scripts, manage dependencies, inline script metadata.

### vercel-cli

Deploy, manage, and troubleshoot Vercel projects from the command line.

Origin: https://github.com/vercel/vercel/tree/main/skills/vercel-cli

### youtube

Fetch transcripts from YouTube videos for summarization and analysis.

## Cron Jobs (Launchd Agents)

Scheduled background jobs managed via macOS launchd (`~/Library/LaunchAgents/`).
Canonical scripts and plist files live in `~/.agents/cron/`; `~/Library/LaunchAgents/com.max.*.plist` symlinks point back to the versioned plist files in that directory.

Manage jobs with:

```bash
~/.agents/cron/manage.sh list
~/.agents/cron/manage.sh status <job>
~/.agents/cron/manage.sh doctor
~/.agents/cron/manage.sh logs <job>
~/.agents/cron/manage.sh reload <job>
```

### cleanup-processes

- **Label:** `com.max.cleanup-processes`
- **Schedule:** Daily at 4:00 AM
- **Script:** `~/.agents/cron/cleanup-processes/cleanup-processes.sh`
- **Plist:** `~/.agents/cron/cleanup-processes/com.max.cleanup-processes.plist`
- **Log:** `~/Library/Logs/cleanup-processes.log`
- **What it does:** Kills orphaned and zombie user processes that outlived their purpose.

### update-packages

- **Label:** `com.max.update-packages`
- **Schedule:** Mondays at 6:00 AM
- **Script:** `~/.agents/cron/update-packages/update-packages.sh`
- **Plist:** `~/.agents/cron/update-packages/com.max.update-packages.plist`
- **Log:** `~/Library/Logs/update-packages.log`
- **What it does:** Upgrades Homebrew formulae and pnpm global packages. Auto-discovers newly installed CLI tools and appends them to the CLI Tools table in `AGENTS.md`.

### update-repos

- **Label:** `com.max.update-repos`
- **Schedule:** Daily at 8:00 AM
- **Script:** `~/.agents/cron/update-repos/update-repos.sh`
- **Plist:** `~/.agents/cron/update-repos/com.max.update-repos.plist`
- **Log:** `~/.cron-logs/update-repos-YYYYMMDD.log`
- **What it does:** Runs `git pull --prune` on all repositories under `~/projects/resources/` and removes stale temporary git repos.

### nightshift

- **Labels:** `com.max.nightshift-0` through `com.max.nightshift-7`
- **Schedule:** Hourly from midnight through 7:00 AM (8 jobs, one phase per hour)
- **Script:** `~/.agents/cron/nightshift/nightshift.sh <hour-index> [timeout_minutes]`
- **Plists:** `~/.agents/cron/nightshift/launchagents/com.max.nightshift-*.plist`
- **Config:** `~/.agents/cron/nightshift/.env`
- **Phase File:** `~/.agents/cron/nightshift/review.md`
- **Logs:** `~/.cron-logs/nightshift-YYYYMMDD.log` and `~/.cron-logs/nightshift-<HOUR>.log`
- **What it does:** Launches the configured agent in non-interactive headless mode to autonomously work on a project overnight. Each hour maps to the matching `## Phase N` section in `review.md`.
- **Skip a Night:** Create `~/.agents/cron/nightshift/.night-shift-skip`; remove it to resume.

## Other

### exa-pro

Standalone Exa API search tool with content extraction, highlights, LLM summaries, and multi-step deep research.

### shortcuts

macOS Shortcuts integration (`due-screenshot`).

### vscode

VS Code workspace configuration.
