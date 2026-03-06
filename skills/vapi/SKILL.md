---
name: vapi
description: Voice AI platform for phone calls. Use to create AI receptionists, outbound calling, voice agents.
author: Geele
version: 1.0.0
triggers:
  - "voice"
  - "phone"
  - "call"
  - "receptionist"
metadata: {"openclaw":{"emoji":"📞"}}
---

# VAPI - Voice AI

VAPI enables AI-powered phone calls. Use for AI receptionists, outbound calling, voice agents.

## Setup

API keys stored in: `~/.openclaw/credentials/vapi.json`
```json
{
  "vapi": {
    "private_key": "xxx",
    "public_key": "xxx"
  }
}
```

## Usage

### Create outbound call
```bash
python3 {baseDir}/scripts/make_call.py --to "+1XXXXXXXXXX" --assistant-name "receptionist"
```

### Test assistant
```bash
python3 {baseDir}/scripts/test_assistant.py
```

### List assistants
```bash
python3 {baseDir}/scripts/list_assistants.py
```

## For Carson Aesthetics

Create an AI receptionist that:
1. Answers the phone professionally
2. Captures caller name and phone number
3. Takes a message or schedules callback
4. Never misses a lead

## API Reference

- Base URL: https://api.vapi.ai
- Endpoints:
  - POST /call/phone - Make outbound call
  - GET /assistant - List assistants
  - POST /assistant - Create assistant
