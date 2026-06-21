---
name: dedao
description: "Guide dedao-dl workflows for the 得到 App. Use this skill when the user needs login/account help; library browsing; search and URL ID extraction; course/audiobook/ebook/article/note/topic/channel/free-content downloads; JSON automation; or auth/parameter/ffmpeg/wkhtmltopdf troubleshooting."
compatibility: Requires the dedao-dl CLI. Audio downloads require ffmpeg. PDF conversion requires wkhtmltopdf.
metadata:
  origin: https://github.com/yann0917/dedao-dl/tree/main/skills
  merged_from: dedao-dl-commands, dedao-dl-usage
---

# Dedao

Use `dedao-dl` to help the user log in to 得到, inspect their library, search resources, map URLs to command IDs, download content, and troubleshoot CLI errors.

## Operating Principles

- Start by clarifying the user's goal only when it is unclear: list resources, inspect details, download content, export notes, or troubleshoot an error.
- Give the shortest executable command first, then add optional flags.
- Use `dedao-dl --json <command> ...` by default when you are automating, scripting, or parsing output as an agent.
- Include `dedao-dl <command> -h` when the user asks about a specific subcommand or uncertain parameters.
- Distinguish numeric IDs from URL `id` strings (`enid` / `topic_id_str`). Numeric IDs usually require a prior list command to build a mapping; URL `id` strings can usually be passed directly.
- If the user is not logged in, start with `dedao-dl login -q` or `dedao-dl login -c "<cookie>"`, then verify with `dedao-dl who`.
- Explain `-t` download formats whenever you provide download commands.
- When the user asks for `每天听本书` book summaries, apply the book summary title spec below by default: exclude `大望局`, include Chinese book titles, English books, and book-like `章鱼书场` entries.
- When the user provides an error, restate the key error briefly, then give concrete checks and commands.

## Core Commands

### Help and JSON Output

```bash
dedao-dl -h
dedao-dl <command> -h
dedao-dl --json <command> ...
```

Use JSON for agent workflows:

```bash
dedao-dl --json who
dedao-dl --json recent
dedao-dl --json search --query "<关键词>" --type 0
dedao-dl --json course
dedao-dl --json article --id <courseID>
dedao-dl --json dl <courseID|courseEnid> -t 1
```

### Login and Accounts

```bash
dedao-dl login -q
dedao-dl login -c "<cookie>"
dedao-dl who
dedao-dl user
dedao-dl users
dedao-dl su <uid>
```

Use recent-learning and VIP checks when needed:

```bash
dedao-dl recent
dedao-dl recent -h
dedao-dl recent --page-size 20 --max-id 0
dedao-dl recent --product-type 66 --filter-product-type=true
dedao-dl recent --uid-hazy <uid_hazy>
dedao-dl vip-ebook
dedao-dl vip-odob
```

### Search

```bash
dedao-dl search --query "<关键词>" --type 0
```

Use `list[].list[].extra.enid` from search results for later commands. Treat `id` and `goods_id` as numeric identifiers; prefer `extra.enid` when continuing from search.

Map search results this way:

- `track_name=ebook` or `goods_type=2` -> `dedao-dl dle <extra.enid> -t <1|2|3|4>`
- `track_name=storytell` or `goods_type=13` -> `dedao-dl dlo <extra.enid> -t <1|2|3>`
- `goods_type=66` or course-like results -> `dedao-dl dl <extra.enid> -t <1|2|3>`

### Browse Library Content

```bash
dedao-dl cat
dedao-dl course
dedao-dl course --page <page> --limit <limit>
dedao-dl course --order <study|buy>
dedao-dl course --group-id <groupID>
dedao-dl course --group-id <groupID> --page <page> --limit <limit>
dedao-dl course -i <courseID>
dedao-dl ace
dedao-dl ace --group-id <groupID>
dedao-dl odob
dedao-dl odob --page <page> --limit <limit>
dedao-dl odob --group-id <groupID>
dedao-dl odob --group-id <groupID> --page <page> --limit <limit>
dedao-dl ebook
dedao-dl ebook --page <page> --limit <limit>
dedao-dl ebook --group-id <groupID>
dedao-dl ebook --group-id <groupID> --page <page> --limit <limit>
dedao-dl ebook -i <ebookID>
dedao-dl free
dedao-dl free <enid>
```

Pagination rules:

- Pass `--page` and `--limit` together.
- Omit both to fetch all content automatically.
- In paginated mode, expect the raw current page list without expanded groups.
- Use `course --order study` by default, or `course --order buy` for recent purchases.
- Use `odob --order study` and `ebook --order study`; these commands only support `study`.

### Articles, Topics, and Channels

```bash
dedao-dl article --id <courseID>
dedao-dl article --classEnID <classEnid>
dedao-dl article --id <courseID> --aid <articleID>
dedao-dl article --classEnID <classEnid> --aid <articleID>
dedao-dl article --articleEnID <articleEnid>
dedao-dl topic
dedao-dl topic -i <topicID>
dedao-dl channel info --id <channelID>
dedao-dl channel homepage --id <channelID>
dedao-dl channel vip --id <channelID>
```

Use `article --aid` only with a course ID or class enid. If the user has an article enid directly, use `article --articleEnID <articleEnid>`.

## Downloads

### Course Downloads

```bash
dedao-dl dl <courseID|courseEnid> -t 1
dedao-dl dl <courseID|courseEnid> -t 2
dedao-dl dl <courseID|courseEnid> -t 3
dedao-dl dl <courseID|courseEnid> -t 3 -m -c
dedao-dl dl <courseID|courseEnid> -t 1 -o
dedao-dl dl <courseID|courseEnid> -t 1 <articleID>
```

Explain formats:

- `dl -t 1`: mp3
- `dl -t 2`: PDF
- `dl -t 3`: Markdown
- `dl -m`: merge Markdown chapters
- `dl -c`: include popular comments in Markdown
- `dl -o`: prefix filenames with sequence numbers

### Audiobook Downloads

```bash
dedao-dl dlo <odobID|topic_id_str> -t 1
dedao-dl dlo <odobID|topic_id_str> -t 2
dedao-dl dlo <odobID|topic_id_str> -t 3
```

Explain formats:

- `dlo -t 1`: mp3
- `dlo -t 2`: PDF
- `dlo -t 3`: Markdown

Prefer the audioBook URL `id` (`topic_id_str`) for `dlo` when available.

### Ebook Downloads and Notes

```bash
dedao-dl dle <ebookID|ebookEnid> -t 1
dedao-dl dle <ebookID|ebookEnid> -t 2
dedao-dl dle <ebookID|ebookEnid> -t 3
dedao-dl dle <ebookID|ebookEnid> -t 4
dedao-dl ebook notes -i <ebookID>
```

Explain formats:

- `dle -t 1`: HTML
- `dle -t 2`: PDF
- `dle -t 3`: EPUB
- `dle -t 4`: Markdown notes

Use `dedao-dl ebook notes -i <ebookID>` before notes export when the user needs to inspect available notes.

### `每天听本书` Book Summary Title Spec

Apply this spec by default when the user asks to download `每天听本书` book summaries, `听书` summaries, or new book-summary Markdown after a marker title.

Include only these content types:

- Chinese book summaries: include titles containing Chinese book brackets, such as `《...》`.
- English book summaries: include titles marked `英文原版` or `英文新书`, and English-title entries that look like `<English Title> | <讲者>解读` or `<English Title>｜<讲者>解读`, such as `The Power Broker | 刘怡解读` or `Everest Inc. | 吴晨解读`.
- Book-like `章鱼书场` entries: include entries that clearly look like books, named works, or book/IP title discussions, such as `陈章鱼解读` book entries and `谭苗解读` entries like `沙丘与科幻电影`, `金庸小说与武侠片`, or `哈利·波特与魔幻类型电影`.

Exclude these content types:

- `播客大望局` / `大望局`, even when the title contains `《...》`.
- Interview, chat, special-topic, and numbered podcast-style entries that are not book summaries.

Use `id_out` as the preferred `dlo` ID when a prepared list contains it:

```bash
dedao-dl dlo <id_out> -t 3
```

For Max's resources workspace, prefer this prepared list when it exists:

```text
/Users/max/projects/resources/dedao/odob_download_list_no_dawangju_newer_than_xianfazhiren.json
```

When you regenerate a list from the public `每天听本书` catalog, keep the marker exclusive: stop before the marker title, do not include the marker itself, and save a download-ready JSON/CSV with `id_out`, `alias_id`, `name`, `date`, `article_title`, and the inclusion reason.

## URL to Command Mapping

Extract URL IDs and choose the command by path:

- Course detail: `https://www.dedao.cn/course/detail?id=<courseEnid>` -> `dedao-dl dl <courseEnid>`
- Course article: `https://www.dedao.cn/course/article?id=<id>` or `articleId=<articleId>` -> inspect article/course params, then use `article` or `dl`
- Audiobook detail: `https://www.dedao.cn/audioBook/detail?id=<topic_id_str>` -> `dedao-dl dlo <topic_id_str>`
- Ebook detail or reader: `https://www.dedao.cn/ebook/detail?id=<ebookEnid>` or `https://www.dedao.cn/ebook/reader?id=<ebookEnid>` -> `dedao-dl dle <ebookEnid>`
- Article enid: use `dedao-dl article --articleEnID <articleEnid>`

For a direct audiobook URL, offer all formats when the user asks to download everything:

```bash
dedao-dl dlo <topic_id_str> -t 1
dedao-dl dlo <topic_id_str> -t 2
dedao-dl dlo <topic_id_str> -t 3
```

## Numeric ID Rules

When the user supplies a numeric ID, build or verify the mapping first:

```bash
dedao-dl course   # course numeric IDs
dedao-dl odob     # audiobook numeric IDs
dedao-dl ebook    # ebook numeric IDs
```

Use JSON equivalents for automation:

```bash
dedao-dl --json course
dedao-dl --json odob
dedao-dl --json ebook
```

If the mapping is unavailable, prefer the URL `id` string (`courseEnid`, `topic_id_str`, or `ebookEnid`).

## Common Workflows

### First-Time Use

```bash
dedao-dl login -q
dedao-dl who
dedao-dl course
dedao-dl odob
dedao-dl ebook
```

### Download a Course as Markdown with Comments

```bash
dedao-dl dl <courseID|courseEnid> -t 3 -m -c
```

### Download an Audiobook in Every Format

```bash
dedao-dl dlo <odobID|topic_id_str> -t 1
dedao-dl dlo <odobID|topic_id_str> -t 2
dedao-dl dlo <odobID|topic_id_str> -t 3
```

### Download Ebook HTML, PDF, EPUB, and Notes

```bash
dedao-dl dle <ebookID|ebookEnid> -t 1
dedao-dl dle <ebookID|ebookEnid> -t 2
dedao-dl dle <ebookID|ebookEnid> -t 3
dedao-dl dle <ebookID|ebookEnid> -t 4
```

## Troubleshooting

### Login and Authentication

- If the CLI says to log in at `https://www.dedao.cn`, run `dedao-dl login -q` or `dedao-dl login -c "<cookie>"`.
- If QR login appears successful but commands fail, run `dedao-dl who`, then `dedao-dl users` and `dedao-dl su <uid>` if multiple accounts exist.
- If cookie login fails, make sure the cookie comes from `https://www.dedao.cn` and has not expired.

### Parameters and IDs

- If you see parameter errors, check whether the command expects a numeric ID or an enid string.
- If `article --aid` fails, provide a course ID/enid too; otherwise use `--articleEnID` when you have article enid.
- If `dlo` fails with a numeric ID, retry with the audioBook URL `id` (`topic_id_str`).

### Dependencies

- If audio download or merge fails, check `ffmpeg`:
  ```bash
  ffmpeg -version
  ```
- If PDF conversion fails, check `wkhtmltopdf`:
  ```bash
  wkhtmltopdf --version
  ```
- If Docker is used, remember the provided container may not include `wkhtmltopdf`, so PDF downloads may fail.

### Download Failures

- If PDF generation triggers `496 NoCertificate` or rate limits, slow down, retry later, and avoid rapid bulk PDF conversion.
- If content is unavailable, verify the logged-in account owns the course/book or has the required access.
- If terminal tables are too wide, rerun with `--json` and format the JSON output.

## Response Templates

When the user asks “how do I use dedao-dl?”, answer with:

```bash
dedao-dl login -q
dedao-dl who
dedao-dl course
dedao-dl odob
dedao-dl ebook
dedao-dl dl <courseID|courseEnid> -t 1
dedao-dl dlo <odobID|topic_id_str> -t 1
dedao-dl dle <ebookID|ebookEnid> -t 1
```

When the user provides `https://www.dedao.cn/audioBook/detail?id=Rv3lLYg5JjEB0jZMB0y6z4X89keKpV`, answer with:

```bash
dedao-dl dlo Rv3lLYg5JjEB0jZMB0y6z4X89keKpV -t 1
dedao-dl dlo Rv3lLYg5JjEB0jZMB0y6z4X89keKpV -t 2
dedao-dl dlo Rv3lLYg5JjEB0jZMB0y6z4X89keKpV -t 3
```

When the user asks about `dle -t 4`, answer that it exports ebook notes as Markdown and suggest:

```bash
dedao-dl ebook notes -i <ebookID>
dedao-dl dle <ebookID|ebookEnid> -t 4
```
