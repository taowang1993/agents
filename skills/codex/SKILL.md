---
name: codex
description: Check ChatGPT/Codex rate limit reset credit expiration dates. Use when the user asks when Codex usage limit reset credits expire, asks to inspect Codex rate limit reset credits, or mentions the ChatGPT `/backend-api/wham/rate-limit-reset-credits` endpoint.
---

# Codex Rate Limit Reset

Use `scripts/check_reset_credits.py` to query the ChatGPT reset-credit endpoint with the user's local Codex/ChatGPT bearer token.

## Workflow

1. Run the bundled script:

```bash
python3 /Users/max/.codex/skills/codex-rate-limit-reset/scripts/check_reset_credits.py
```

2. Report only useful fields: `available_count`, `status`, `reset_type`, `granted_at`, `expires_at`, and `redeemed_at`.
3. Never print or quote bearer tokens, auth files, cookies, or raw authorization headers.

## Token Sources

The script checks these sources, in order:

- `CHATGPT_BEARER_TOKEN`
- `OPENAI_BEARER_TOKEN`
- `CODEX_AUTH_TOKEN`
- `$CODEX_HOME/auth.json`
- `~/.codex/auth.json`

`~/.codex/auth.json` usually contains `tokens.access_token`, which is preferred over `tokens.id_token`.

## Useful Options

```bash
python3 /Users/max/.codex/skills/codex-rate-limit-reset/scripts/check_reset_credits.py --json
python3 /Users/max/.codex/skills/codex-rate-limit-reset/scripts/check_reset_credits.py --timezone America/Vancouver
python3 /Users/max/.codex/skills/codex-rate-limit-reset/scripts/check_reset_credits.py --auth-file /path/to/auth.json
```
