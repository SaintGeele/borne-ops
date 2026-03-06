---
name: local-leads
description: Find local businesses needing websites and Google Business Profile. Create outreach campaigns.
author: Geele
version: 1.0.0
triggers:
  - "local leads"
  - "find businesses"
  - "cold outreach"
metadata: {"openclaw":{"emoji":"📍"}}
---

# Local Lead Generation System

Find local businesses that need websites and Google Business Profile.

## Strategy

### 1. Find Businesses
- Search new business registrations
- Look for businesses without website icons on Google Maps
- Check local directories

### 2. Research & Qualify
- Business name, address, phone
- Industry/type
- Current online presence (if any)
- Owner/decision maker info

### 3. Create Assets
- Mock website draft
- Google Business Profile claim link

### 4. Outreach (VAPI)
- AI calls business
- Pitches website + GMB services
- Captures interest

## Research Areas
- Connecticut (CT)
- New York (NY)
- New Jersey (NJ)  
- Massachusetts (MA)

## Business Types to Target
- Restaurants
- Auto repair
- HVAC/Plumbing
- Salons/Barbers
- Pet services
- Home services
- Medical practices
- Law firms

## Process

### Manual Research
1. Go to Google Maps
2. Search: "[industry] near [city], [state]"
3. Look for businesses WITHOUT website link
4. Note: name, address, phone

### Tools to Use
- Tavily: Research business info
- VAPI: Cold call outreach
- here.now: Host mock websites

## VAPI Cold Call Script
See scripts/cold_call.py for the outreach assistant.

## Mock Website
See skills/lead-capture for website templates.