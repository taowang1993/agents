---
name: pi-provider
description: >
  Add an OpenAI-compatible LLM provider (custom API endpoint, e.g. Sail Research,
  OpenRouter-style gateways, self-hosted servers) to the Pi coding agent by editing
  /Users/max/.pi/agent/models.json and /Users/max/.pi/agent/auth.json. Use whenever the
  user asks to add, register, connect, or test a new AI provider or model API in Pi, or
  asks whether some OpenAI-compatible API works with Pi. Make sure to use this skill
  instead of reading Pi docs or creating an extension for OpenAI-compatible providers.
---

# Pi Provider

Add an OpenAI-compatible provider to Pi through two config files. Never create an
extension for this — extensions are only for OAuth/SSO flows, non-standard APIs,
dynamic model discovery, or custom error handling.

## Files

- `/Users/max/.pi/agent/models.json` — provider + model definitions
- `/Users/max/.pi/agent/auth.json` — API keys, format `{"<provider>": {"type": "api_key", "key": "sk-..."}}`

Both are plain JSON outside git. Read, merge, and write back with `indent=2` — never
replace the whole file or touch entries for other providers.

## Steps

1. **Check what the API serves.** If unsure about the model id, query the endpoint's
   `/v1/models` with the key. The list can be incomplete: if the user names a model not
   in the list (e.g. `moonshotai/Kimi-K3` on Sail), try it anyway — some providers
   serve models without listing them.

2. **Add the provider to `models.json`** under `providers`:

   ```json
   "<provider>": {
     "baseUrl": "https://api.example.com/v1",
     "api": "openai-completions",
     "models": [
       {
         "id": "<model-id>",
         "name": "<display name>",
         "reasoning": true,
         "input": ["text"],
         "contextWindow": 256000,
         "maxTokens": 65536,
         "cost": { "input": 0.3, "output": 1.2, "cacheRead": 0.06, "cacheWrite": 0.3 }
       }
     ]
   }
   ```

   Only `id` is required. Defaults: `reasoning` false, `input` ["text"],
   `contextWindow` 128000, `maxTokens` 16384, `cost` all zeros. Set `reasoning: true`
   when the model supports extended thinking. Use known pricing when the provider
   publishes it; otherwise use zeros or approximate values.

3. **Put the API key in `auth.json`** as `"<provider>": {"type": "api_key", "key": "..."}`.
   Never write the key into `models.json`, and never leave it in a git-tracked file.
   Do not use env-var references when the user gives you a literal key.

4. **Test through pi** in print mode, not just curl:

   ```bash
   pi --model <provider>/<model-id> -p "Reply with exactly one word: pong"
   ```

   Then verify tool calling works (pi always sends tools):

   ```bash
   pi --model <provider>/<model-id> -p "Use the bash tool to run: echo <provider>-ok"
   ```

   "No API key found for <provider>" means auth is missing or malformed.

5. **Fix compat errors as they appear** — see table below. Set `compat` at provider
   level to apply to all its models, or per model to override.

## Compat flags (openai-completions)

| Error or behavior | Fix |
|---|---|
| `store=false is not supported` / rejects `store` | `"compat": { "supportsStore": false }` |
| Server rejects `max_completion_tokens` | `"compat": { "maxTokensField": "max_tokens" }` |
| Server rejects `developer` role in messages | `"compat": { "supportsDeveloperRole": false }` |
| Server rejects `reasoning_effort` | `"compat": { "supportsReasoningEffort": false }` |
| Server rejects `stream_options.include_usage` | `"compat": { "supportsUsageInStreaming": false }` |
| DeepSeek-style thinking needs a toggle | `"compat": { "thinkingFormat": "deepseek" }` |

Reasoning models stream `reasoning_content`/`reasoning` deltas and pi parses them
automatically. When a request fails, read the error body pi prints — it names the
unsupported field, which maps to a compat flag.

## Rules

- Providers appear in `/model` and `--list-models` only once auth exists. Test after
  writing auth.json.
- If a provider already exists in `models.json`, merge new models into its `models`
  array; do not redefine it.
- `api: "openai-completions"` covers the vast majority of OpenAI-compatible APIs.
- After editing both files, the provider works immediately in a new pi invocation —
  no restart or reload needed.
