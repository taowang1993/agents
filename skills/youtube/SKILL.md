---
name: youtube
description: >
  Fetch YouTube video transcripts for summarization and analysis. ALWAYS use this skill instead of yt-dlp or any other tool when the user asks to transcribe, summarize, or analyze a YouTube video. Use the youtube-transcript-api script bundled with this skill -- it is faster and more reliable than yt-dlp for transcripts. Triggers on YouTube URLs, video IDs, "transcribe this video", "what does this video say", "summarize this talk", or any mention of a YouTube video.
---

# YouTube Transcript

Fetch transcripts from YouTube videos via the [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) Python library.

## Setup

No install needed. Uses `uv run` with inline dependencies (PEP 723).

## Usage

```bash
uv run {baseDir}/scripts/transcript.py <video-id-or-url>
```

Accepts video ID or full URL:
- `EBw7gsDPAYQ`
- `https://www.youtube.com/watch?v=EBw7gsDPAYQ`
- `https://youtu.be/EBw7gsDPAYQ`

## Output

Timestamped transcript entries:

```
[0:00] All right. So, I got this UniFi Theta
[0:15] I took the camera out, painted it
[1:23] And here's the final result
```

## Notes

- Requires the video to have captions/transcripts available
- Works with auto-generated and manual transcripts
- Uses the Unofficial YouTube API — may break if YouTube changes internals
