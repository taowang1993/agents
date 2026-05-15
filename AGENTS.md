# AGENTS.md

If a file looks different after your work, it means the user modified it. Never delete, revert, undo, or recreate files or directories the user created, changed, or removed between your turns — even if they conflict with your mental model of the desired state. If you notice something the user did that you didn't, ask before touching it.

When updating a skill against the upstream, only update the content below the frontmatter and never overwrite the frontmatter.

After creating or modifing an agent skill, use the skill-validator skill to audit it.

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
| `cmake`             | Build system                   |
| `cmux`              | Terminal multiplexer           |
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
| `ffmpeg`            | Audio/video processing         |
| `firecrawl`         | Web scraping CLI               |
| `forge`             | _(unknown)_                    |
| `fzf`               | Fuzzy finder                   |
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
| `jscpd`             | Copy-paste detector            |
| `kilo`              | KiloCode AI coding agent       |
| `kiro-cli`          | Kiro CLI                       |
| `kiro-cli-chat`     | Kiro chat mode                 |
| `kiro-cli-term`     | Kiro terminal mode             |
| `knip` / `knip-bun` | Unused code analyzer           |
| `kubectl`           | Kubernetes CLI                 |
| `livekit-cli`       | LiveKit real-time audio        |
| `maestro`           | Mobile E2E testing             |
| `mcporter`          | MCP server manager             |
| `mitmproxy`         | HTTPS proxy & debugger         |
| `ngrok`             | Tunnel / ingress               |
| `npm` / `npx`       | Node.js package manager        |
| `opencode`          | OpenCode CLI                   |
| `opencode-desktop`  | OpenCode desktop app           |
| `orb` / `orbctl`    | OrbStack Docker alternative    |
| `pandoc`            | Document converter             |
| `pi`                | Pi coding agent                |
| `playwright-cli`    | browser automation & testing   |
| `pm2`               | Node.js PM (daemon)            |
| `pm2-dev`           | PM2 development mode           |
| `pm2-docker`        | PM2 Docker integration         |
| `pm2-runtime`       | PM2 container runtime          |
| `pnpm` / `pnpx`     | Fast, disk-efficient PM        |
| `prettier`          | Code formatter                 |
| `python3`           | Python 3.13 runtime            |
| `qwen`              | Qwen Code AI coding agent      |
| `react-doctor`      | React code quality checker     |
| `ripgrep` (`rg`)    | Fast grep                      |
| `rust-analyzer`     | Rust LSP server                |
| `rustc`             | Rust compiler                  |
| `rustdoc`           | Rust doc generator             |
| `rustfmt`           | Rust formatter                 |
| `rustup`            | Rust toolchain manager         |
| `semgrep`           | Multi-lang SAST & code scanner |
| `skill-validator`   | Agent skill package validator  |
| `add-skill`         | Install an agent skill         |
| `skills`            | Agent skill manager            |
| `stripe`            | Stripe CLI                     |
| `swift`             | Apple Swift compiler           |
| `terminal-notifier` | macOS notification sender      |
| `tldx`              | Domain name checker            |
| `tokei`             | Code line counter              |
| `tree`              | Directory tree viewer          |
| `tree-sitter`       | Parser generator               |
| `trufflehog`        | Secret scanner                 |
| `uv` / `uvx`        | Python package & PM            |
| `vercel` / `vc`     | Vercel deployment CLI          |
| `wrangler`          | Cloudflare Workers CLI         |
| `mise`              | Polyglot runtime manager       |

## Launch Agents

| Agent                       | Script                                 |
| --------------------------- | -------------------------------------- |
| `com.max.cleanup-processes` | `.agents/cronjob/cleanup-processes.sh` |
| `com.max.update-repos`      | `.agents/cronjob/update-repos.sh`      |
| `com.max.update-packages`   | `.agents/cronjob/update-packages.sh`   |
