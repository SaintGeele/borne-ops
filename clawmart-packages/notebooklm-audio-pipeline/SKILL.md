# SKILL.md - NotebookLM Audio Pipeline

## Description
Transform your documents, notes, and content into AI-generated podcast discussions. Uses NotebookLM to create Audio Overviews programmatically - turn any content into engaging podcast-style audio.

## What It Does

### Document Processing
- Upload PDFs, Google Docs, URLs, YouTube videos
- Extract text from multiple sources
- Create source notebooks automatically

### Audio Generation
- Generate AI podcast discussions (Audio Overviews)
- Two-host format (styled as podcast hosts)
- Customizable length and focus

### Pipeline Integration
- Connect to Notion for note sourcing
- Send audio to Telegram/Discord
- Schedule automatic generation

## Use Cases

### Content Creators
- Turn blog posts into podcast episodes
- Create audio versions of articles
- Generate content for social media

### Students & Researchers
- Convert study materials to audio
- Summarize research papers
- Create audio summaries of notes

### Businesses
- Turn reports into audio briefings
- Create audio newsletters
- Generate podcast from documentation

## Commands
- "Create audio overview from [document]"
- "Generate podcast from [URL]"
- "List available sources"
- "Check audio status"
- "Download audio file"

## Setup Options

### Option 1: NotebookLM Enterprise API
Requires Google Cloud project with NotebookLM Enterprise enabled.

### Option 2: NotebookLM Podcast Automator (Open Source)
Self-hosted solution using the GitHub project:
- https://github.com/israelbls/notebooklm-podcast-automator
- FastAPI + Playwright based
- Free alternative

### Option 3: Manual (for testing)
1. Create notebook at notellm.google.com
2. Add sources manually
3. Generate Audio Overview
4. Download audio

## Integration
- Notion: Pull notes as sources
- Telegram/Discord: Send completed audio
- Storage: Save audio to S3/Backblaze

## Requirements
- Google Cloud account (for Enterprise API) OR
- Self-hosted Automator instance
- Optional: Notion API, Telegram bot

## Pricing Note
- NotebookLM Enterprise: Part of Gemini Enterprise ($60+/user)
- Self-hosted Automator: Free, runs on your server

## Output
- Audio file (MP3)
- Summary transcript
- Source list