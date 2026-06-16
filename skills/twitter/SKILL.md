---
name: twitter
version: 2.1.0
description: |
  Twitter/X data: fetch tweets, search, user profiles, followers, replies, trends, and convert X Articles to Markdown with images.

  Use for any x.com or twitter.com URL or lookup (e.g. summarize this tweet, recent posts by @vitalikbuterin, search $SOL min_faves:50).
delivery: script
metadata:
  starchild:
    emoji: "🐦"
    skillKey: twitter
    requires:
      env:
        - TWITTER_API_KEY

user-invocable: false
disable-model-invocation: false

---

# Twitter / X (script-mode)

Read-only access to twitterapi.io endpoints. 14 exports covering tweets,
users, followers, replies, threads, quotes, articles, trends, and article-to-Markdown archiving.

Core Twitter API requests go through sc-proxy via `core.http_client.proxied_get`. The
`TWITTER_API_KEY` env var is auto-injected server-side, no local key needed
on the agent machine. Article-to-Markdown mode can optionally call Jina for
clean Markdown extraction and can download `pbs.twimg.com` images to local attachments.

## Script Usage

Standard invocation pattern:

```bash
python3 - <<'EOF'
import sys, json
sys.path.insert(0, "/data/workspace/skills/twitter")
from exports import twitter_user_info, twitter_user_tweets

profile = twitter_user_info(username="vitalikbuterin")
print(json.dumps(profile, indent=2))

recent = twitter_user_tweets(username="vitalikbuterin")
print(f"got {len(recent.get('tweets', []))} tweets")
EOF
```

Article-to-Markdown archive pattern:

```bash
python3 /data/workspace/skills/twitter/scripts/fetch_article_markdown.py \
  https://x.com/USER/status/TWEET_ID \
  ./Clippings
```

This writes `YYYY-MM-DD-title.md` plus `attachments/YYYY-MM-DD-author-title/`
when embedded images are available. Use `--no-download-images` to keep remote
image URLs, `--no-jina` to rely only on twitterapi.io article data, or
`--output-file path/to/article.md` for an exact destination.

Programmatic wrapper:

```python
from exports import twitter_article_markdown
summary = twitter_article_markdown("https://x.com/USER/status/TWEET_ID", output_dir="./Clippings")
print(summary["markdown_path"])
```

Tweet ID extraction from URL: the last path segment of any
`x.com/{user}/status/{id}` or `twitter.com/{user}/status/{id}` URL is the
tweet ID. Pass it as a string (Python int will lose precision on long IDs).

## Function Reference (signatures)

Core data functions live in `exports.py`. Raw endpoint wrappers return dicts straight from
twitterapi.io — keys vary per endpoint, inspect once before scripting. The
`twitter_article_markdown` wrapper returns a summary dict with `markdown_path`,
metadata, image counts, and the rendered `markdown` string.

### Tweet endpoints

| Function | Description |
|---|---|
| `twitter_search_tweets(query, cursor=None)` | Advanced search. Operators: `from:user`, `to:user`, `#tag`, `$cashtag`, `lang:en`, `has:media`, `has:links`, `is:reply`, `min_faves:N`, `since:YYYY-MM-DD`, `until:YYYY-MM-DD`. |
| `twitter_get_tweets(tweet_ids)` | Fetch one or more tweets by ID. `tweet_ids` = list of strings (also accepts comma-string). |
| `twitter_tweet_replies(tweet_id, cursor=None)` | Replies to a tweet. |
| `twitter_tweet_retweeters(tweet_id, cursor=None)` | Users who retweeted. |
| `twitter_tweet_thread_context(tweet_id)` | Full thread context (parents + direct replies). |
| `twitter_tweet_quote(tweet_id, cursor=None)` | Quote tweets. |
| `twitter_get_article(tweet_id)` | Long-form X article body. |
| `twitter_article_markdown(source, output_dir=".", output_file=None, use_jina=True, download_images=True)` | Fetch an X Article URL/ID and write Markdown with optional local image attachments. |
| `twitter_get_trends(woeid=None, country=None, category=None, limit=None)` | Trending topics; all filters optional. |

### User endpoints

| Function | Description |
|---|---|
| `twitter_user_info(username)` | Profile: bio, follower/following counts, tweet count, verified. |
| `twitter_user_tweets(username, cursor=None)` | User's recent tweets. |
| `twitter_user_followers(username, cursor=None)` | Follower list. |
| `twitter_user_followings(username, cursor=None)` | Accounts followed. |
| `twitter_search_users(query, cursor=None)` | Search users by name/keyword. |

`username` is the handle WITHOUT `@` (e.g. `"elonmusk"`, not `"@elonmusk"`).
Pagination: when a response includes `next_cursor`, pass it back as `cursor`
on the next call.

## When to use this skill

- ANY `x.com/...` or `twitter.com/...` URL → start here, NOT `web_fetch`
  (Twitter blocks scrapers).
- Single tweet detail → `twitter_get_tweets([tweet_id])`.
- "Save this X Article as Markdown" / "turn this article into a note" → `scripts/fetch_article_markdown.py` or `twitter_article_markdown`.
- "What's @user been posting?" → `twitter_user_tweets`.
- KOL discovery / cashtag mentions → `twitter_search_tweets("$SOL min_faves:50")`.
- Trending topics → `twitter_get_trends`.

## Billing & cost control (READ before bulk/scheduled use)

twitterapi.io bills **per item actually returned**, not per request and NOT by
any "max_results" you ask for. sc-proxy charges = returned-item-count × unit
(tweets 45 / profiles 54 / followers 45 credits; 100k credits = $1; 3× upstream).
Min 1 item per request.

**The `last_tweets` / `user_tweets` trap:** the upstream
`/twitter/user/last_tweets` endpoint has **no page-size parameter** — it always
returns up to **20 tweets per page**. There is no `max_results` / `pageSize`
lever, and `twitter_user_tweets()` does not accept one. So "I only need 5" still
fetches and **bills for ~20**. Slicing the result client-side does NOT save
money — the charge is already counted at the proxy from the upstream response.

### ⭐ Polling for "new tweets from account X" → use search, NOT last_tweets

This is the biggest, most common waste. `twitter_user_tweets()` (upstream
`last_tweets`) has **no page-size param** and always bills a full ~20-tweet
page every call, even when nothing new was posted. The official twitterapi.io
guide recommends the **advanced_search** endpoint instead, which our skill
already exposes as `twitter_search_tweets()`:

```python
# Cheap polling pattern — bills only the tweets actually in the window.
# When NO new tweet exists, the call is billed as 1 item (not 20).
import time
since = int(last_check_unix)
until = int(time.time())
q = f"from:{handle} include:nativeretweets since_time:{since} until_time:{until}"
res = twitter_search_tweets(q)   # queryType defaults to Latest
```

Official pricing (upstream; our proxy bills 3×):
- tweets found → $0.00015 per returned tweet
- **no tweets found → $0.00015 for the whole call** (vs last_tweets' ~20× that)

Per-call cost in our billing makes the difference obvious:
- `last_tweets` → ~$0.009/call (20 tweets every time)
- `advanced_search` empty window → ~$0.00045/call (1 item) — **~20× cheaper**

Frequency vs monthly cost (single account, upstream): hourly $0.11 · 30min
$0.22 · 15min $0.43 · 5min $1.30 · 1min $6.48.

### Other cost levers
- **Use `get_tweets([ids])`** when IDs are known — pay only for those exact
  tweets, not a 20-item page.
- **Article-to-Markdown** performs one `get_article` call, then optional Jina
  reader and image downloads. Disable Jina with `--no-jina` or image downloads
  with `--no-download-images` when raw API article text is enough.
- **Followers/followings** bill per returned profile (default page 200 → 200
  billed). Only paginate as far as needed. For ID-only graph work use the
  bulk followers-IDs endpoint (lightweight).
- **Tighten search queries** (min_faves, since_time/until_time, lang) so fewer
  pages are needed.

> Note: twitterapi.io also sells a managed stream/webhook product. **We do NOT
> subscribe to it** — do not use the `/oapi/x_user_stream/*` or
> `/oapi/tweet_filter/*` endpoints. For any account-monitoring need, the
> advanced_search polling pattern above is the correct and only approach here.

## Error handling

- `402 Credits is not enough` → upstream proxy credits exhausted; tell user
  to top up. Don't retry.
- `429` → rate limited; surface to user, don't auto-retry.
- `404 user not found` → suggest verifying the handle spelling.

## Version Policy (hard rule)

This skill is **script-mode** (`delivery: script`). It does NOT register
runtime tools — agent must `read_file` SKILL.md and call functions via
`bash` + `python3`. The legacy `tools.py` / `__init__.py` files are kept
for backward compatibility but are no longer the preferred entry point.

Bump rules:
- Any signature change, env-var change, or sc-proxy contract change → MAJOR
- New function added, response schema clarified → MINOR
- Bug fix or doc-only change → PATCH
