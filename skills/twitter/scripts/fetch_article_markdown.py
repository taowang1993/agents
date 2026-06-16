#!/usr/bin/env python3
"""Fetch a Twitter/X Article and write it as Markdown.

This script can use the local Starchild twitter skill (`exports.twitter_get_article`)
for structured article data, optionally supplement body/media extraction with Jina,
and download embedded images to a local attachments folder.

Usage:
    python3 scripts/fetch_article_markdown.py <tweet-or-article-url-or-id> [output_dir]
    python3 scripts/fetch_article_markdown.py <url> --output-file article.md
    python3 scripts/fetch_article_markdown.py <url> --input-json raw_article.json --no-jina
"""
from __future__ import annotations

import argparse
import json
import mimetypes
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Iterable

TweetArticleFetcher = Callable[[str], dict[str, Any]]

URL_ID_RE = re.compile(r"/(?:status|article)/(\d+)")
LONG_ID_RE = re.compile(r"\b(\d{10,})\b")
IMAGE_URL_RE = re.compile(r"https?://[^\s)'\"<>]+", re.IGNORECASE)
TWIMG_MEDIA_RE = re.compile(r"https://pbs\.twimg\.com/media/[^\s)'\"<>]+", re.IGNORECASE)

TEXT_KEYS = (
    "markdown",
    "articleMarkdown",
    "articleText",
    "fullText",
    "full_text",
    "body",
    "content",
    "text",
    "description",
)
BLOCK_KEYS = ("blocks", "contentBlocks", "articleBlocks", "components", "children")
TITLE_KEYS = ("articleTitle", "title", "headline")
DATE_KEYS = ("createdAtLocal", "created_at", "createdAt", "date", "published_at", "publishedAt")
AUTHOR_KEYS = ("author", "user", "creator")
USERNAME_KEYS = ("screenName", "userName", "username", "handle")
NAME_KEYS = ("name", "displayName")
METRIC_KEYS = {
    "likes": ("likes", "like_count", "favorite_count", "favoriteCount"),
    "retweets": ("retweets", "retweet_count", "retweetCount"),
    "replies": ("replies", "reply_count", "replyCount"),
    "quotes": ("quotes", "quote_count", "quoteCount"),
    "bookmarks": ("bookmarks", "bookmark_count", "bookmarkCount"),
    "views": ("views", "view_count", "viewCount", "impressions"),
}


class ArticleMarkdownError(RuntimeError):
    """Raised when an article cannot be converted to Markdown."""


def extract_tweet_id(source: str) -> str:
    """Extract a tweet/article ID from an X/Twitter URL or return a numeric ID."""
    source = source.strip()
    if source.isdigit():
        return source

    match = URL_ID_RE.search(source)
    if match:
        return match.group(1)

    match = LONG_ID_RE.search(source)
    if match:
        return match.group(1)

    raise ArticleMarkdownError(
        "Could not extract a tweet/article ID. Use a URL like "
        "https://x.com/user/status/123 or pass the numeric ID."
    )


def canonical_source_url(source: str, tweet_id: str) -> str:
    """Return the original URL when present, otherwise a stable X status URL."""
    if source.startswith(("https://x.com/", "https://twitter.com/")):
        return source
    return f"https://x.com/i/status/{tweet_id}"


def fetch_article_with_skill(tweet_id: str) -> dict[str, Any]:
    """Fetch structured article data through local exports, with twitter-cli fallback."""
    skill_root = Path(__file__).resolve().parents[1]
    if str(skill_root) not in sys.path:
        sys.path.insert(0, str(skill_root))

    try:
        from exports import twitter_get_article  # type: ignore  # imported lazily for offline tests

        return twitter_get_article(tweet_id)
    except ModuleNotFoundError as exc:
        if exc.name != "core":
            raise
    except Exception:
        # Fall back to twitter-cli below. The CLI can use the local authenticated
        # Twitter session when the Starchild sc-proxy runtime is unavailable.
        pass

    command = ["uv", "run", "--with", "twitter-cli", "twitter", "article", tweet_id, "--json"]
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        raise ArticleMarkdownError(result.stderr.strip() or "twitter-cli article failed")
    data = json.loads(result.stdout)
    if not data.get("ok", True):
        message = data.get("error", {}).get("message") or "twitter-cli article returned an error"
        raise ArticleMarkdownError(message)
    return data


def request_text(url: str, headers: dict[str, str] | None = None, timeout: int = 30) -> str:
    """Fetch a URL as text with urllib so the script has no third-party deps."""
    req_headers = {"User-Agent": "twitter-skill-article-markdown/1.0"}
    if headers:
        req_headers.update(headers)
    request = urllib.request.Request(url, headers=req_headers)
    with urllib.request.urlopen(request, timeout=timeout) as response:  # noqa: S310 - user requested URL fetch
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="replace")


def fetch_jina_markdown(source_url: str) -> str:
    """Fetch Markdown from Jina's reader endpoint. Return empty string on failure."""
    jina_url = f"https://r.jina.ai/{source_url}"
    headers: dict[str, str] = {}
    api_key = os.getenv("JINA_API_KEY")
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    try:
        content = request_text(jina_url, headers=headers)
    except (urllib.error.URLError, TimeoutError, OSError):
        return ""

    marker = "Markdown Content:"
    marker_index = content.find(marker)
    if marker_index != -1:
        return content[marker_index + len(marker) :].lstrip()
    return content.strip()


def load_json(path: str | Path) -> dict[str, Any]:
    """Load a JSON article response from disk."""
    with Path(path).open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ArticleMarkdownError("Input JSON must be an object")
    return data


def iter_values(obj: Any) -> Iterable[Any]:
    """Yield nested values from dicts/lists depth-first."""
    if isinstance(obj, dict):
        for value in obj.values():
            yield value
            yield from iter_values(value)
    elif isinstance(obj, list):
        for value in obj:
            yield value
            yield from iter_values(value)


def find_first_mapping(obj: Any, keys: tuple[str, ...]) -> dict[str, Any] | None:
    """Find the first nested mapping stored under any of the given keys."""
    if isinstance(obj, dict):
        for key in keys:
            value = obj.get(key)
            if isinstance(value, dict):
                return value
        for value in obj.values():
            found = find_first_mapping(value, keys)
            if found:
                return found
    elif isinstance(obj, list):
        for value in obj:
            found = find_first_mapping(value, keys)
            if found:
                return found
    return None


def find_first_value(obj: Any, keys: tuple[str, ...]) -> Any:
    """Find the first non-empty nested value stored under any of the given keys."""
    if isinstance(obj, dict):
        for key in keys:
            value = obj.get(key)
            if value not in (None, "", [], {}):
                return value
        for value in obj.values():
            found = find_first_value(value, keys)
            if found not in (None, "", [], {}):
                return found
    elif isinstance(obj, list):
        for value in obj:
            found = find_first_value(value, keys)
            if found not in (None, "", [], {}):
                return found
    return None


def value_to_text(value: Any) -> str:
    """Convert a scalar/list/dict value to Markdown-ish text."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        parts = [value_to_text(item) for item in value]
        return "\n\n".join(part for part in parts if part)
    if isinstance(value, dict):
        return block_to_markdown(value)
    return str(value).strip()


def block_to_markdown(block: Any) -> str:
    """Convert common article block shapes to Markdown."""
    if isinstance(block, str):
        return block.strip()
    if isinstance(block, list):
        parts = [block_to_markdown(item) for item in block]
        return "\n\n".join(part for part in parts if part)
    if not isinstance(block, dict):
        return value_to_text(block)

    kind = str(block.get("type") or block.get("kind") or "").lower()

    image_url = first_image_url(block)
    if image_url and any(token in kind for token in ("image", "photo", "media", "cover")):
        alt = value_to_text(block.get("alt") or block.get("caption") or "image") or "image"
        return f"![{alt}]({image_url})"

    for key in ("markdown", "text", "plainText", "plain_text", "value"):
        value = block.get(key)
        text = value_to_text(value)
        if text:
            break
    else:
        text = ""

    child_parts: list[str] = []
    for key in BLOCK_KEYS:
        value = block.get(key)
        child_text = block_to_markdown(value)
        if child_text:
            child_parts.append(child_text)

    if child_parts:
        text = "\n\n".join([part for part in (text, *child_parts) if part])

    if not text and image_url:
        text = f"![image]({image_url})"

    if not text:
        return ""

    if "heading" in kind or kind in {"h1", "h2", "h3"}:
        level = 2
        if kind in {"h1", "heading1"}:
            level = 1
        elif kind in {"h3", "heading3"}:
            level = 3
        return f"{'#' * level} {text.lstrip('# ').strip()}"

    if "quote" in kind:
        return "\n".join(f"> {line}" if line else ">" for line in text.splitlines())

    if "list" in kind and not text.lstrip().startswith(("- ", "1. ")):
        return "\n".join(f"- {line}" for line in text.splitlines() if line.strip())

    return text.strip()


def extract_body_markdown(article_data: dict[str, Any], jina_markdown: str = "") -> str:
    """Extract article body Markdown from raw API data, preferring Jina if useful."""
    if jina_markdown:
        return jina_markdown.strip()

    blocks = find_first_value(article_data, BLOCK_KEYS)
    block_text = block_to_markdown(blocks)
    if block_text:
        return block_text.strip()

    body = find_first_value(article_data, TEXT_KEYS)
    body_text = value_to_text(body)
    if body_text:
        return body_text.strip()

    return ""


def is_probable_image_url(url: str) -> bool:
    """Return true if a URL appears to point at an image resource."""
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return False
    lower_path = parsed.path.lower()
    if "pbs.twimg.com/media/" in parsed.netloc + parsed.path:
        return True
    if lower_path.endswith((".jpg", ".jpeg", ".png", ".gif", ".webp")):
        return True
    query = urllib.parse.parse_qs(parsed.query.lower())
    return query.get("format", [""])[0] in {"jpg", "jpeg", "png", "gif", "webp"}


def normalize_image_url(url: str) -> str:
    """Normalize Twitter image URLs so downloads get a large image when possible."""
    cleaned = url.rstrip(".,;]")
    parsed = urllib.parse.urlparse(cleaned)
    if parsed.netloc == "pbs.twimg.com" and parsed.path.startswith("/media/") and not parsed.query:
        return urllib.parse.urlunparse(parsed._replace(query="format=jpg&name=large"))
    return cleaned


def extract_image_urls_from_text(text: str) -> list[str]:
    """Extract probable image URLs from Markdown/text."""
    urls: list[str] = []
    for match in TWIMG_MEDIA_RE.findall(text):
        urls.append(normalize_image_url(match))
    for match in IMAGE_URL_RE.findall(text):
        url = normalize_image_url(match)
        if is_probable_image_url(url):
            urls.append(url)
    return dedupe(urls)


def first_image_url(obj: Any) -> str:
    """Find a single image URL in a nested value."""
    urls = collect_image_urls(obj)
    return urls[0] if urls else ""


def collect_image_urls(obj: Any) -> list[str]:
    """Collect image URLs from raw article data and embedded Markdown."""
    urls: list[str] = []

    if isinstance(obj, str):
        return extract_image_urls_from_text(obj)

    if isinstance(obj, dict):
        for key, value in obj.items():
            lowered_key = key.lower()
            if isinstance(value, str):
                if any(skip in lowered_key for skip in ("profileimage", "profile_image", "avatar")):
                    continue
                normalized = normalize_image_url(value)
                extracted = extract_image_urls_from_text(value)
                if extracted:
                    urls.extend(extracted)
                elif is_probable_image_url(normalized) or (
                    normalized.startswith(("http://", "https://"))
                    and any(hint in lowered_key for hint in ("image", "photo", "media", "thumbnail", "cover"))
                ):
                    urls.append(normalized)
            else:
                urls.extend(collect_image_urls(value))
    elif isinstance(obj, list):
        for value in obj:
            urls.extend(collect_image_urls(value))

    return dedupe(urls)


def dedupe(values: Iterable[str]) -> list[str]:
    """Deduplicate values while preserving order."""
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value and value not in seen:
            seen.add(value)
            result.append(value)
    return result


def sanitize_filename(name: str, fallback: str = "twitter-article") -> str:
    """Sanitize text for macOS/Linux-friendly filenames."""
    cleaned = re.sub(r"[^\w\s\-\u4e00-\u9fff]", "", name or "")
    cleaned = re.sub(r"\s+", "-", cleaned.strip())
    cleaned = cleaned.strip("-_")
    return (cleaned or fallback)[:80]


def parse_date(value: Any) -> str:
    """Parse an API date-ish value into YYYY-MM-DD where possible."""
    if not value:
        return datetime.now().strftime("%Y-%m-%d")
    text = str(value).strip()
    if re.match(r"^\d{4}-\d{2}-\d{2}", text):
        return text[:10]
    for fmt in (
        "%a %b %d %H:%M:%S %z %Y",
        "%Y-%m-%d %H:%M:%S",
        "%Y/%m/%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%S.%f%z",
    ):
        try:
            return datetime.strptime(text.replace("Z", "+0000"), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return text[:10] if len(text) >= 10 else datetime.now().strftime("%Y-%m-%d")


def yaml_scalar(value: Any) -> str:
    """Render a safe single-line YAML scalar."""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return str(value)
    if value in (None, ""):
        return '""'
    return json.dumps(str(value), ensure_ascii=False)


def metric_value(article_data: dict[str, Any], metric_name: str) -> int | str:
    """Find a metric value either under metrics or at the top level."""
    keys = METRIC_KEYS[metric_name]
    metrics = find_first_mapping(article_data, ("metrics", "public_metrics", "stats")) or {}
    value = find_first_value(metrics, keys)
    if value in (None, "", [], {}):
        value = find_first_value(article_data, keys)
    return value if value not in (None, "", [], {}) else 0


def article_metadata(article_data: dict[str, Any], source_url: str, tweet_id: str) -> dict[str, Any]:
    """Build normalized metadata for Markdown frontmatter and filenames."""
    author = find_first_mapping(article_data, AUTHOR_KEYS) or {}
    title = find_first_value(article_data, TITLE_KEYS) or f"Twitter Article {tweet_id}"
    username = find_first_value(author, USERNAME_KEYS) or find_first_value(article_data, USERNAME_KEYS) or ""
    author_name = find_first_value(author, NAME_KEYS) or find_first_value(article_data, NAME_KEYS) or username
    date = parse_date(find_first_value(article_data, DATE_KEYS))

    metadata: dict[str, Any] = {
        "source": source_url,
        "tweet_id": tweet_id,
        "title": str(title),
        "author": author_name or "",
        "username": str(username).lstrip("@") if username else "",
        "date": date,
    }
    for metric_name in METRIC_KEYS:
        metadata[metric_name] = metric_value(article_data, metric_name)
    return metadata


def image_extension(url: str, content_type: str = "") -> str:
    """Choose an image file extension from URL/query/content-type."""
    parsed = urllib.parse.urlparse(url)
    query = urllib.parse.parse_qs(parsed.query.lower())
    fmt = (query.get("format") or [""])[0]
    if fmt:
        if fmt == "jpeg":
            return ".jpg"
        if fmt in {"jpg", "png", "gif", "webp"}:
            return f".{fmt}"

    guessed = Path(parsed.path).suffix.lower()
    if guessed in {".jpg", ".jpeg", ".png", ".gif", ".webp"}:
        return ".jpg" if guessed == ".jpeg" else guessed

    if content_type:
        ext = mimetypes.guess_extension(content_type.split(";", 1)[0].strip())
        if ext in {".jpg", ".jpeg", ".png", ".gif", ".webp"}:
            return ".jpg" if ext == ".jpeg" else ext

    return ".jpg"


def download_images(image_urls: list[str], attachments_dir: Path, quiet: bool = False) -> dict[str, str]:
    """Download images and return a map from remote URL to relative Markdown path."""
    if not image_urls:
        return {}

    attachments_dir.mkdir(parents=True, exist_ok=True)
    mapping: dict[str, str] = {}

    for index, url in enumerate(image_urls, 1):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "twitter-skill-article-markdown/1.0"})
            with urllib.request.urlopen(request, timeout=30) as response:  # noqa: S310 - image URL from article data
                content = response.read()
                ext = image_extension(url, response.headers.get("content-type", ""))
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            if not quiet:
                print(f"  ✗ Failed: {url} ({exc})", file=sys.stderr)
            continue

        filename = f"{index:02d}-image{ext}"
        filepath = attachments_dir / filename
        filepath.write_bytes(content)
        mapping[url] = f"attachments/{attachments_dir.name}/{filename}"
        if not quiet:
            print(f"  ✓ {filename}", file=sys.stderr)

    return mapping


def replace_remote_images(markdown: str, remote_to_local: dict[str, str]) -> str:
    """Replace remote image URLs with local attachment paths."""
    for remote_url, local_path in remote_to_local.items():
        markdown = markdown.replace(remote_url, local_path)
        base_url = remote_url.split("?", 1)[0]
        if base_url != remote_url:
            markdown = markdown.replace(base_url, local_path)
    return markdown


def render_markdown_document(
    article_data: dict[str, Any],
    source_url: str,
    tweet_id: str,
    jina_markdown: str = "",
    remote_to_local_images: dict[str, str] | None = None,
) -> tuple[str, dict[str, Any], list[str]]:
    """Render raw article data as a Markdown document."""
    metadata = article_metadata(article_data, source_url, tweet_id)
    body = extract_body_markdown(article_data, jina_markdown=jina_markdown)
    if not body:
        raise ArticleMarkdownError("Article response did not contain readable body text")

    image_urls = dedupe(collect_image_urls(article_data) + extract_image_urls_from_text(body))
    if remote_to_local_images:
        body = replace_remote_images(body, remote_to_local_images)

    frontmatter_lines = ["---"]
    for key in ("source", "tweet_id", "title", "author", "username", "date"):
        frontmatter_lines.append(f"{key}: {yaml_scalar(metadata.get(key, ''))}")
    for key in METRIC_KEYS:
        frontmatter_lines.append(f"{key}: {yaml_scalar(metadata.get(key, 0))}")
    frontmatter_lines.append("---")

    title = str(metadata.get("title") or f"Twitter Article {tweet_id}").strip()
    markdown = "\n".join(frontmatter_lines) + f"\n\n# {title}\n\n{body.strip()}\n"
    return markdown, metadata, image_urls


def create_article_markdown(
    source: str,
    output_dir: str | Path = ".",
    output_file: str | Path | None = None,
    input_data: dict[str, Any] | None = None,
    fetcher: TweetArticleFetcher | None = None,
    use_jina: bool = True,
    download_embedded_images: bool = True,
    write_file: bool = True,
    quiet: bool = False,
) -> dict[str, Any]:
    """Fetch/convert an X Article and optionally write a Markdown file.

    Returns a summary with the Markdown path, image counts, and generated content.
    The `markdown` field is included so callers from exports.py can consume the
    rendered document without reading the file back.
    """
    tweet_id = extract_tweet_id(source)
    source_url = canonical_source_url(source, tweet_id)

    article_data = input_data
    if article_data is None:
        fetch = fetcher or fetch_article_with_skill
        article_data = fetch(tweet_id)

    jina_markdown = fetch_jina_markdown(source_url) if use_jina else ""

    # First render without local replacements so we know every image URL.
    markdown, metadata, image_urls = render_markdown_document(
        article_data,
        source_url=source_url,
        tweet_id=tweet_id,
        jina_markdown=jina_markdown,
    )

    output_dir = Path(output_dir)
    date_part = sanitize_filename(str(metadata.get("date") or datetime.now().strftime("%Y-%m-%d")))
    author_part = sanitize_filename(str(metadata.get("username") or metadata.get("author") or "unknown"), "unknown")
    title_part = sanitize_filename(str(metadata.get("title") or f"twitter-article-{tweet_id}"))

    attachments_dir = output_dir / "attachments" / f"{date_part}-{author_part}-{title_part[:40]}"
    remote_to_local: dict[str, str] = {}
    if download_embedded_images and image_urls:
        if not quiet:
            print(f"Downloading {len(image_urls)} image(s)...", file=sys.stderr)
        remote_to_local = download_images(image_urls, attachments_dir, quiet=quiet)
        if remote_to_local:
            markdown = replace_remote_images(markdown, remote_to_local)

    markdown_path: Path | None = None
    if write_file:
        if output_file:
            markdown_path = Path(output_file)
            markdown_path.parent.mkdir(parents=True, exist_ok=True)
        else:
            output_dir.mkdir(parents=True, exist_ok=True)
            markdown_path = output_dir / f"{date_part}-{title_part}.md"
        markdown_path.write_text(markdown, encoding="utf-8")

    return {
        "tweet_id": tweet_id,
        "source": source_url,
        "markdown_path": str(markdown_path) if markdown_path else "",
        "attachments_dir": str(attachments_dir) if remote_to_local else "",
        "image_count": len(image_urls),
        "downloaded_images": len(remote_to_local),
        "metadata": metadata,
        "markdown": markdown,
    }


def build_parser() -> argparse.ArgumentParser:
    """Build the CLI parser."""
    parser = argparse.ArgumentParser(description="Fetch a Twitter/X Article and write Markdown")
    parser.add_argument("source", help="x.com/twitter.com article or status URL, or a numeric tweet ID")
    parser.add_argument("output_dir", nargs="?", default=".", help="Output directory (default: current directory)")
    parser.add_argument("--output-file", help="Write to this Markdown file instead of deriving a filename")
    parser.add_argument("--input-json", help="Read raw twitter_get_article JSON from this file instead of fetching")
    parser.add_argument("--no-jina", action="store_true", help="Do not supplement article body/media with Jina reader Markdown")
    parser.add_argument("--no-download-images", action="store_true", help="Keep remote image URLs instead of saving local attachments")
    parser.add_argument("--stdout", action="store_true", help="Print Markdown to stdout instead of writing a file")
    parser.add_argument("--json", action="store_true", help="Print a JSON summary to stdout")
    return parser


def main(argv: list[str] | None = None) -> int:
    """CLI entry point."""
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        input_data = load_json(args.input_json) if args.input_json else None
        summary = create_article_markdown(
            source=args.source,
            output_dir=args.output_dir,
            output_file=args.output_file,
            input_data=input_data,
            use_jina=not args.no_jina,
            download_embedded_images=not args.no_download_images,
            write_file=not args.stdout,
            quiet=args.json or args.stdout,
        )
    except ArticleMarkdownError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:  # noqa: BLE001 - CLI should surface unexpected integration errors
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    if args.stdout:
        print(summary["markdown"], end="")
    elif args.json:
        printable = {key: value for key, value in summary.items() if key != "markdown"}
        print(json.dumps(printable, ensure_ascii=False))
    else:
        print(f"✓ Saved: {summary['markdown_path']}")
        if summary["downloaded_images"]:
            print(f"✓ Images: {summary['attachments_dir']} ({summary['downloaded_images']} downloaded)")
        elif summary["image_count"]:
            print(f"Images found: {summary['image_count']} (not downloaded)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
