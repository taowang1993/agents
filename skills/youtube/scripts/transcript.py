#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.9"
# dependencies = ["youtube-transcript-api"]
# ///

"""Fetch a YouTube transcript and print timestamped entries."""

import re
import sys
from html import unescape

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    CouldNotRetrieveTranscript,
    InvalidVideoId,
    VideoUnavailable,
    TranscriptsDisabled,
    NoTranscriptFound,
    RequestBlocked,
    IpBlocked,
)


def extract_video_id(raw: str) -> str:
    """Extract an 11-char video ID from a raw ID or full YouTube URL."""
    if re.fullmatch(r"[a-zA-Z0-9_-]{11}", raw):
        return raw
    m = re.search(r"(?:v=|youtu\.be/|/embed/|/v/|/shorts/)([a-zA-Z0-9_-]{11})", raw)
    if m:
        return m.group(1)
    raise InvalidVideoId(raw)


def format_timestamp(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: transcript.py <video-id-or-url>", file=sys.stderr)
        print("Example: transcript.py EBw7gsDPAYQ", file=sys.stderr)
        print(
            "Example: transcript.py https://www.youtube.com/watch?v=EBw7gsDPAYQ",
            file=sys.stderr,
        )
        sys.exit(1)

    raw = sys.argv[1]
    try:
        video_id = extract_video_id(raw)
    except InvalidVideoId:
        print(f"Error: invalid YouTube video ID or URL: {raw}", file=sys.stderr)
        sys.exit(1)

    try:
        ytt = YouTubeTranscriptApi()
        transcript = ytt.fetch(video_id)
    except (VideoUnavailable, TranscriptsDisabled) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except (RequestBlocked, IpBlocked) as e:
        print(f"Error: YouTube blocked the request — {e}", file=sys.stderr)
        sys.exit(1)
    except NoTranscriptFound:
        print(f"Error: no transcript found for video {video_id}", file=sys.stderr)
        sys.exit(1)
    except CouldNotRetrieveTranscript as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    for snippet in transcript:
        ts = format_timestamp(snippet.start)
        text = unescape(snippet.text)
        print(f"[{ts}] {text}")


if __name__ == "__main__":
    main()
