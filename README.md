# Tao's Agent Toolset

## Pi Extensions

### cheap-compaction

Use budget models (GPT-5-mini, DeepSeek V4 Flash) for conversation compaction instead of the main model.

### copy-prompt

Copy prompt content (text and images) to the system clipboard.

### loop

Start a follow-up loop with a breakout condition via `/loop`.

### notification

Play a system sound (`Funk.aiff`) when the agent finishes a turn.

### prompt-editor

Custom prompt editor with model selection, provider switching, and thinking-level settings.

### review

Code review via `/review` — supports PRs, commits, branches, uncommitted changes, and custom instructions.

### screenshot

Capture and attach screenshots for the agent to analyze.

### superset-hooks

Emit lifecycle hooks to Superset terminal for "working" indicator and completion chime (no-op outside Superset).

### uv

Redirect Python tooling (`pip`, `python`, `poetry`) to `uv` equivalents for faster, lockfile-driven workflows.

### vision

Vision fallback for non-multimodal models: intercepts image reads and registers a `vision_query` tool for on-demand visual Q&A via GPT-5-mini.

## Agent Skills

Tao's Personal Agent Skills

### afdocs

- Skill Name: afdocs
- Use Case: Measure and improve documentation Agent Score — audit docs sites for AI coding agent accessibility
- Origin: this repo

### agent-browser

- Skill Name: agent-browser
- Use Case: Automate browser interactions: navigate pages, fill forms, click buttons, take screenshots, scrape data, test web apps
- Origin: https://github.com/vercel-labs/agent-browser

### ai-sdk

- Skill Name: ai-sdk
- Use Case: Build AI-powered features with the Vercel AI SDK — generateText, streamText, tool calling, structured output, useChat
- Origin: https://github.com/kthrob/ai_sdk/tree/main/skills/use-ai-sdk

### ascii-tutor

- Skill Name: ascii-tutor
- Use Case: Explain complex concepts with live ASCII art animations in markdown files during tutoring sessions
- Origin: this repo

### autoflow

- Skill Name: autoflow
- Use Case: Scaffold or upgrade a repo to a long-running autonomous agent workflow harness
- Origin: this repo

### brave

- Skill Name: brave
- Use Case: Brave Search toolkit — web search, news, images, videos, AI answers, RAG grounding, local POIs (multiple sub-skills)
- Origin: https://github.com/brave/brave-search-skills/tree/main/skills

### docsee

- Skill Name: docsee
- Use Case: Manage AGENTS.md doc indexes synced from upstream GitHub repos
- Origin: https://github.com/taowang1993/docsee/tree/main/skill/docsee

### domain

- Skill Name: domain
- Use Case: Brainstorm and check availability of domain names using tldx CLI
- Origin: this repo

### exa

- Skill Name: exa
- Use Case: Free neural web search, code search, and company research via Exa MCP (no API key needed)
- Origin: this repo

### fallow

- Skill Name: fallow
- Use Case: Codebase intelligence for JS/TS — find unused code, duplicates, circular deps, complexity hotspots, feature flags
- Origin: https://github.com/fallow-rs/fallow/tree/main/npm/fallow/skills/fallow

### find-skills

- Skill Name: find-skills
- Use Case: Discover and install agent skills when the user asks "how do I do X" or "find a skill for…"
- Origin: https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md

### hf-cli

- Skill Name: hf-cli
- Use Case: Hugging Face Hub CLI — download, upload, manage models, datasets, spaces, papers, and inference endpoints
- Origin: https://github.com/huggingface/skills/tree/main/skills/hf-cli

### knip

- Skill Name: knip
- Use Case: Unused-code analysis for JavaScript/TypeScript projects — unused files, dependencies, exports, types
- Origin: this repo

### maestro

- Skill Name: maestro
- Use Case: E2E UI testing for iOS, Android, Flutter, React Native, and Web with Maestro flows
- Origin: this repo

### markitdown

- Skill Name: markitdown
- Use Case: Convert URLs, PDFs, DOCX, HTML, and other files into Markdown using `uvx markitdown`
- Origin: this repo

### mcporter

- Skill Name: mcporter
- Use Case: List, configure, authenticate, call, and inspect MCP servers/tools over HTTP or stdio
- Origin: this repo

### playwright-cli

- Skill Name: playwright-cli
- Use Case: Automate browser interactions, test web pages, and work with Playwright tests
- Origin: https://github.com/microsoft/playwright-cli/tree/main/skills/playwright-cli

### react-doctor

- Skill Name: react-doctor
- Use Case: React code quality checks — lint, dead code, accessibility, bundle size, architecture diagnostics
- Origin: https://github.com/millionco/react-doctor/tree/main/skills/react-doctor

### react-testing

- Skill Name: react-testing
- Use Case: Generate Vitest + React Testing Library tests for React components, hooks, and utilities
- Origin: this repo

### skill-creator

- Skill Name: skill-creator
- Use Case: Create new skills, modify existing ones, run evals, and optimize descriptions for better triggering
- Origin: https://github.com/anthropics/skills/tree/main/skills/skill-creator

### skill-validator

- Skill Name: skill-validator
- Use Case: Validate and score Agent Skill packages for spec compliance, content quality, contamination, and LLM scoring
- Origin: this repo

### tailwind

- Skill Name: tailwind
- Use Case: Build scalable design systems with Tailwind CSS v4, design tokens, component libraries, and responsive patterns
- Origin: this repo

### tmux

- Skill Name: tmux
- Use Case: Remote control tmux sessions for interactive CLIs by sending keystrokes and scraping pane output
- Origin: this repo

### turborepo

- Skill Name: turborepo
- Use Case: Turborepo monorepo build system — task pipelines, caching, CI optimization, workspace filtering
- Origin: https://github.com/vercel/turborepo/tree/main/skills/turborepo

### uv

- Skill Name: uv
- Use Case: Use `uv` instead of pip/python/venv — run scripts, manage dependencies, inline script metadata
- Origin: this repo

### vercel-cli

- Skill Name: vercel-cli
- Use Case: Deploy, manage, and troubleshoot Vercel projects from the command line
- Origin: https://github.com/vercel/vercel/tree/main/skills/vercel-cli

### youtube

- Skill Name: youtube
- Use Case: Fetch transcripts from YouTube videos for summarization and analysis
- Origin: this repo
