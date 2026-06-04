# AGENTS.md

## Development Guidelines

- If a file looks different after your work, it means the user modified it. Never delete, revert, undo, or recreate files or directories the user created, changed, or removed between your turns — even if they conflict with your mental model of the desired state. If you notice something the user did that you didn't, ask before touching it.
- When updating a skill against the upstream, only update the content below the frontmatter and never overwrite the frontmatter.
- After creating or modifing an agent skill, use the skill-validator skill to audit it.

### Git

- Make small and frequent commits to prevent accidental work loss.
- PR summary scrope must include all committed changes.

### Copy

**Title Case** applies to all UI surface text that is not a full sentence:

- UI labels and button text
- Menu items, menu group labels, and dropdown options
- Section headers, panel names, and card titles
- Chips, badges, and status labels
- Table headings, column headers, and row labels
- Nav items, tab labels, and breadcrumb segments
- Trigger labels and standalone phrases

**Sentence case** applies only to:

- Body copy and paragraph text
- Descriptions, helper text, and field hints
- Full sentences in tooltips, dialogs, or alerts

**ASCII and text diagrams:**

- Box labels and diagram titles are standalone phrases — apply Title Case
- Arrow text and flow descriptions are body copy — use sentence case

**Preserve exact on-screen capitalization** when writing markdown reports, plans, and docs.

## Package Managers

| Manager        | Path                                         |
| -------------- | -------------------------------------------- |
| Homebrew       | `/opt/homebrew/bin/brew`                     |
| pnpm           | `/Users/max/Library/pnpm/pnpm`               |
| npm / npx      | `/Users/max/.nvm/versions/node/v22.22.0/bin` |
| uv             | `/Users/max/.local/bin/uv`                   |
| cargo / rustup | `/Users/max/.cargo/bin`                      |
| mise           | `/opt/homebrew/bin/mise`                     |
| gem (Ruby)     | `/usr/bin/gem`                               |

## CLI Tools

| Tool                | Description                    |
| ------------------- | ------------------------------ |
| `afdocs`            | Agent-friendly docs auditor    |
| `agent-browser`     | browser automation             |
| `aws`               | AWS CLI                        |
| `bat`               | cat with syntax highlighting   |
| `bun` / `bunx`      | JavaScript runtime & PM        |
| `bx`                | Brave Search CLI               |
| `cargo`             | Rust package manager           |
| `cargo-audit`       | Rust security audit            |
| `cargo-clippy`      | Rust linter                    |
| `cargo-deny`        | Rust license/deps checker      |
| `cargo-geiger`      | Unsafe Rust code finder        |
| `cargo-miri`        | Rust MIR interpreter           |
| `cmake`             | build system                   |
| `cmux`              | terminal multiplexer           |
| `cocoapods`         | iOS dependency manager         |
| `code`              | VS Code editor                 |
| `codex`             | OpenAI Codex CLI               |
| `codexpilot`        | Codexpilot AI coding agent     |
| `copilot`           | GitHub Copilot CLI             |
| `corepack`          | Node.js PM manager             |
| `cursor`            | Cursor editor                  |
| `docker`            | Docker CLI                     |
| `docker-compose`    | Docker Compose                 |
| `docsee`            | AGENTS.md doc index sync       |
| `edge-cdp`          | Edge CDP tool                  |
| `elixir`            | Elixir runtime                 |
| `erlang`            | Erlang runtime                 |
| `fallow`            | JS/TS codebase health scanner  |
| `fallow-lsp`        | Fallow language server         |
| `fallow-mcp`        | Fallow MCP server              |
| `fd`                | find alternative               |
| `ffmpeg`            | audio/video processing         |
| `firecrawl`         | web scraping CLI               |
| `forge`             | _(unknown)_                    |
| `fzf`               | fuzzy finder                   |
| `gemini`            | Google Gemini CLI              |
| `gh`                | GitHub CLI                     |
| `git-lfs`           | Git Large File Storage         |
| `gitleaks`          | Git secret scanner             |
| `hf`                | Hugging Face CLI               |
| `hub-tool`          | Docker Hub CLI                 |
| `jar`               | JAR archiver                   |
| `java`              | Java runtime launcher          |
| `javac`             | Java compiler                  |
| `javadoc`           | Java API doc generator         |
| `jcmd`              | JVM diagnostic command tool    |
| `jdb`               | Java debugger                  |
| `jscpd`             | copy-paste detector            |
| `kilo`              | KiloCode AI coding agent       |
| `kiro-cli`          | Kiro CLI                       |
| `kiro-cli-chat`     | Kiro chat mode                 |
| `kiro-cli-term`     | Kiro terminal mode             |
| `knip` / `knip-bun` | unused code analyzer           |
| `kubectl`           | Kubernetes CLI                 |
| `livekit-cli`       | LiveKit real-time audio        |
| `maestro`           | mobile E2E testing             |
| `mcporter`          | MCP server manager             |
| `mitmproxy`         | HTTPS proxy & debugger         |
| `ngrok`             | tunnel / ingress               |
| `npm` / `npx`       | Node.js package manager        |
| `opencode`          | OpenCode CLI                   |
| `opencode-desktop`  | OpenCode desktop app           |
| `orb` / `orbctl`    | OrbStack Docker alternative    |
| `pandoc`            | document converter             |
| `pi`                | Pi coding agent                |
| `playwright-cli`    | browser automation & testing   |
| `pm2`               | Node.js PM (daemon)            |
| `pm2-dev`           | PM2 development mode           |
| `pm2-docker`        | PM2 Docker integration         |
| `pm2-runtime`       | PM2 container runtime          |
| `pnpm` / `pnpx`     | fast, disk-efficient PM        |
| `prettier`          | code formatter                 |
| `python3`           | Python 3.13 runtime            |
| `qwen`              | Qwen Code AI coding agent      |
| `react-doctor`      | React code quality checker     |
| `ripgrep` (`rg`)    | fast grep                      |
| `rust-analyzer`     | Rust LSP server                |
| `rustc`             | Rust compiler                  |
| `rustdoc`           | Rust doc generator             |
| `rustfmt`           | Rust formatter                 |
| `rustup`            | Rust toolchain manager         |
| `semgrep`           | multi-lang SAST & code scanner |
| `skill-validator`   | agent skill package validator  |
| `add-skill`         | Install an agent skill         |
| `skills`            | agent skill manager            |
| `stripe`            | Stripe CLI                     |
| `swift`             | Apple Swift compiler           |
| `terminal-notifier` | macOS notification sender      |
| `tldx`              | domain name checker            |
| `tokei`             | code line counter              |
| `tree`              | directory tree viewer          |
| `tree-sitter`       | parser generator               |
| `trufflehog`        | secret scanner                 |
| `uv` / `uvx`        | Python package & PM            |
| `vercel` / `vc`     | Vercel deployment CLI          |
| `wrangler`          | Cloudflare Workers CLI         |
| `mise`              | polyglot runtime manager       |

| `beads` | Memory upgrade for your coding agent |

## Launch Agents

| Agent                       | Script                                 |
| --------------------------- | -------------------------------------- |
| `com.max.cleanup-processes` | `.agents/cronjob/cleanup-processes.sh` |
| `com.max.update-repos`      | `.agents/cronjob/update-repos.sh`      |
| `com.max.update-packages`   | `.agents/cronjob/update-packages.sh`   |

