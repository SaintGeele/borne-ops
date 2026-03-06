---
name: lead-capture
description: Embeddable lead capture widget for business websites. Captures leads and sends to Notion CRM automatically.
author: Geele
version: 1.0.0
triggers:
  - "lead capture"
  - "contact form"
  - "widget"
metadata: {"openclaw":{"emoji":"📝"}}
---

# Lead Capture Widget

Embeddable form that captures leads directly to Notion.

## Quick Start

### 1. Generate widget for a client
```bash
python3 {baseDir}/scripts/generate_widget.py "Client Name" "client-website.com"
```

### 2. Embed the code
Add the generated HTML to client's website:
```html
<script src="https://borne-lead-capture.js"></script>
<borne-lead-form business="client-name"></borne-lead-form>
```

### 3. Leads go to Notion
Automatically adds to Leads database with status "New"

## Features
- Embeddable on any website
- Customizable colors to match client brand
- Spam protection (basic honeypot)
- Auto-adds to Notion Leads database
- Sends confirmation email to lead
- Mobile responsive

## Customization
- Primary color
- Button text
- Form fields

## Output
Leads database: https://notion.so/c51fc61f-c494-4000-8296-088e42f5e626

## Pricing
- Free for testing
- $19/mo for unlimited widgets
- White-label option: $49/mo