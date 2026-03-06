---
name: supadata
description: Fetch transcripts from YouTube, Twitter, Instagram, and TikTok using Supadata API. Use when you need to analyze video content, summarize videos, or extract information from social media.
author: Geele
version: 1.0.0
triggers:
  - "watch youtube"
  - "get transcript"
  - "video transcript"
  - "analyze video"
  - "youtube summary"
  - "tiktok transcript"
  - "twitter transcript"
metadata: {"openclaw":{"emoji":"📺"}}
---

# Supadata - Video Transcript Fetcher

Fetch transcripts from YouTube, Twitter, Instagram, and TikTok videos using the Supadata API.

## Usage

### Get Transcript from YouTube

```bash
python3 {baseDir}/scripts/get_transcript.py "https://www.youtube.com/watch?v=VIDEO_ID"
```

### Get Transcript from TikTok

```bash
python3 {baseDir}/scripts/get_transcript.py "https://www.tiktok.com/@user/video/ID"
```

### Get Transcript from Twitter/X

```bash
python3 {baseDir}/scripts/get_transcript.py "https://twitter.com/user/status/ID"
```

## Examples

**Summarize a video:**

1. Get the transcript:
   ```bash
   python3 {baseDir}/scripts/get_transcript.py "https://www.youtube.com/watch?v=ISb0nrlNoKQ"
   ```
2. Read the output and summarize it for the user.

**Find specific information:**

1. Get the transcript
2. Search the text for keywords or answer the user's question based on the content

## Notes

- Requires API key stored in credentials/supadata.json
- Returns JSON with timestamped segments
- Use text=true query param for plain text output
