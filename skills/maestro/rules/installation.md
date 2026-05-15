---
name: installation
description: Installing and updating Maestro CLI on macOS, Linux, Windows, and WSL with Java requirements
metadata:
  tags: install, setup, java, brew, curl, windows, wsl
---

## Prerequisites

Maestro CLI requires **Java 17 or higher**.

Verify Java first:

```bash
java -version
```

If `JAVA_HOME` is not set, Maestro may fail with errors like **Unable to locate a Java Runtime**.

## Install Java

Use any Java 17+ distribution the user prefers, such as:

- Oracle JDK
- Temurin JDK
- SDKMAN
- Homebrew OpenJDK on macOS

### macOS with Homebrew

```bash
brew install openjdk@21
```

Add Java to the shell profile:

```bash
export JAVA_HOME="$(brew --prefix openjdk@21)/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
```

For Intel Macs, Homebrew prefixes are usually under `/usr/local` instead of `/opt/homebrew`.

If Java is already installed on macOS and the user needs the detected home:

```bash
/usr/libexec/java_home -V
```

## Install Maestro CLI

### macOS

#### Homebrew

```bash
brew tap mobile-dev-inc/tap
brew install mobile-dev-inc/tap/maestro
```

#### Curl installer

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

Also ensure Xcode and Xcode Command Line Tools are installed for iOS workflows.

### Linux

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

Then ensure the binary is on `PATH`:

```bash
export PATH="$PATH:$HOME/.maestro/bin"
```

### Windows

#### Curl installer

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

#### Manual zip install

1. Download the latest `maestro.zip` from GitHub releases
2. Extract it to a stable folder such as `C:\maestro`
3. Add `C:\maestro\bin` to `PATH`
4. Restart the terminal

PowerShell example:

```powershell
setx PATH "%PATH%;C:\maestro\bin"
```

### WSL2

WSL is supported but not the preferred setup. Use it only when necessary.

Basic WSL setup:

```bash
sudo apt update
sudo apt install openjdk-17-jdk
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

Then add:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
export PATH=$PATH:$HOME/.maestro/bin
```

For Android testing in WSL, the emulator usually runs on the Windows host, so users often need ADB bridging and a host IP configuration.

## Verify installation

```bash
maestro --version
maestro --help
```

## Update Maestro CLI

### Curl-based install

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

### Homebrew install

```bash
brew update
brew upgrade mobile-dev-inc/tap/maestro
```

### Pin a specific version

```bash
export MAESTRO_VERSION=1.39.0
curl -Ls "https://get.maestro.mobile.dev" | bash
```

## Troubleshooting

### `Unable to locate a Java Runtime`

- install Java 17+
- verify `java -version`
- ensure `JAVA_HOME` points to that installation

### `maestro: command not found`

Add the Maestro bin directory to the shell profile:

```bash
echo 'export PATH="$PATH:$HOME/.maestro/bin"' >> ~/.zshrc
source ~/.zshrc
```

Use `~/.bashrc` instead of `~/.zshrc` when appropriate.

### Slow CI or driver startup timeouts

```bash
export MAESTRO_DRIVER_STARTUP_TIMEOUT=180000
```

### Need the full Maestro path for Studio / MCP / Desktop apps

```bash
which maestro
```
