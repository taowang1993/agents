---
name: domain
description: Domain name brainstorming and availability checking using tldx CLI. Use when the user wants to find available domain names, check domain availability, brainstorm domain ideas with prefixes/suffixes/TLDs, generate domain permutations, or search for domains matching patterns. Triggers on requests like "find me a domain", "is example.com available", "brainstorm domain names for my project", "check domain availability", or any domain name related query.
---

# tldx

CLI tool for brainstorming and checking domain name availability.

## Pre-flight: auto-update (run once per session)

```bash
brew upgrade tldx
```

## 🛠️ Usage

```sh
Usage:
  tldx [keywords] [flags]
  tldx [command]

Available Commands:
  completion       Generate the autocompletion script for the specified shell
  help             Help about any command
  show-tld-presets Show available TLD presets

Flags:
  -f, --format string           Format of output (text, json, json-stream, json-array, csv, grouped, grouped-tld) (default "text")
  -h, --help                    help for tldx
  -m, --max-domain-length int   Maximum length of domain name (default 64)
      --no-color                Disable colored output
  -a, --only-available          Show only available domains
  -p, --prefixes strings        Prefixes to add (e.g. get,my,use)
  -r, --regex                   Enable regex pattern matching for domain keywords
      --show-stats              Show statistics at the end of execution
  -s, --suffixes strings        Suffixes to add (e.g. ify,ly)
      --tld-preset string       Use a tld preset (e.g. popular, tech)
  -t, --tlds strings            TLDs to check (e.g. com,io,ai)
  -v, --verbose                 Show verbose output
      --version                 version for tldx
```


## 🔗 Examples

### Domain Availability

```sh
$ tldx google
❌ google.com is not available
```

```sh
$ tldx google youtube reddit
  ❌ reddit.com is not available
  ❌ google.com is not available
  ❌ youtube.com is not available
```

### Regex Domain Selection

Use regex patterns with the `--regex` flag to generate domain combinations based on patterns:

```sh
# Check all 3-letter .com domains
$ tldx '[a-z]{3}' --regex --tlds com --only-available
  ✔️  aaa.com is available
  ✔️  aab.com is available
  ✔️  xyz.com is available
  ...
```

```sh
# Check all 2-letter domains with specific TLDs
$ tldx '[a-z]{2}' --regex --tlds io,ai --only-available
  ✔️  qa.io is available
  ✔️  zx.ai is available
  ...
```

```sh
# Combine patterns with prefixes
$ tldx '[a-z]{2}' --regex --prefixes my,get --tlds app --only-available
  ✔️  myaa.app is available
  ✔️  getab.app is available
  ...
```

```sh
# Check domains starting with 'app'
$ tldx 'app[a-z]{2}' --regex --tlds dev,io --only-available
  ✔️  appxy.dev is available
  ✔️  appqz.io is available
  ...
```

**Note:** Regex patterns are validated for safety. Patterns generating more than 500,000 combinations will be skipped.

### Presets

You can use presets for tlds. For example:

```sh
$ tldx google --tld-preset popular
  ❌ google.com is not available
  ❌ google.co is not available
  ❌ google.io is not available
  ❌ google.net is not available
  ...
```

```sh
$ tldx google --tld-preset geo
  ❌ google.au is not available
  ❌ google.de is not available
  ❌ google.us is not available
  ❌ google.eu is not available
  ...
```


You can see all of the available presets:
```sh
$ tldx show-tld-presets

TLD Presets:

all                     (use all available TLDs)

cheap                   pw fun icu top xyz blog info shop site click
                        space store online website

popular                 ai me app com dev net org

tech                    io ai gg app dev tech codes tools cloud games
                        software digital network security systems
                        data technology
...

```

### Permutations

This permutates the keywords with the specified prefixes, suffixes, and TLDs, checking for availability:
```sh
$ tldx google --prefixes get,my --suffixes ly,hub --tlds com,io,ai
  ✔️  mygooglely.com is available
  ✔️  getgooglely.ai is available
  ❌  mygoogle.ai is not available
  ...
```


### Brace Expansion (macOS, Linux)

[Brace expansion](https://www.gnu.org/software/bash/manual/html_node/Brace-Expansion.html) is a built-in feature of most Unix shells (e.g., bash, zsh). You can use it like this:

```sh
tldx {get,use}{tldx,domains} {star,fork}ongithub
  ✔️ gettldx.com is available
  ✔️ starongithub.com is available
  ✔️ forkongithub.com is available
  ❌ getdomains.com is not available
  ✔️ usetldx.com is available
  ❌ usedomains.com is not available
```


### Show Only Available Domains

```sh
$ tldx google reddit facebook -p get,my -s ly,hub -t com,io,ai --only-available
  ✔️  getgooglely.ai is available
  ✔️  getreddithub.com is available
  ✔️  getreddit.ai is available
  ✔️  googlely.ai is available
  ✔️  getredditly.com is available
  ✔️  facebookly.io is available
  ...
```

### Output Formats

By default, output is human-readable (`text`). You can change it with the `--format` or `-f` flag:

#### JSON Array
```sh
$ tldx openai -p use -s ly -t io --format json
[
  {
    "domain": "openaily.io",
    "available": true
  },
  {
    "domain": "openai.io",
    "available": false
  },
  ...
]
```

#### JSON Stream
```sh
$ tldx openai -p use -s ly -t io --format json-stream
{"domain":"useopenaily.io","available":true}
{"domain":"openai.io","available":false}
...
```

#### CSV
```sh
$ tldx openai -p use -s ly -t io --format csv
domain,available,error
openaily.io,true,
openai.io,false,
...
```

#### Grouped by Keyword
Group and sort domains by their base keyword:

```sh
$ tldx openai google -p get,use -t com,io --format grouped

  google
  getgoogle.com
  getgoogle.io
  google.com
  google.io
  usegoogle.com
  usegoogle.io

  openai
  getopenai.com
  getopenai.io
  openai.com
  openai.io
  useopenai.com
  useopenai.io
```

#### Grouped by TLD
Group and sort domains by their top-level domain:

```sh
$ tldx openai google -p get,use -t com,io --format grouped-tld

  .com
  getgoogle.com
  getopenai.com
  google.com
  openai.com
  usegoogle.com
  useopenai.com

  .io
  getgoogle.io
  getopenai.io
  google.io
  openai.io
  usegoogle.io
  useopenai.io
```