# SKILL.md - Job Application System

## Description
End-to-end job search automation. Manages resumes, cover letters, applications, and follow-ups in Notion with AI-powered tailoring.

## Features

### Resume Management
- Multiple resume versions
- ATS-optimized formatting
- Keyword optimization
- Version history

### Cover Letter Generation
- AI-powered tailoring to job posts
- Multiple tones (professional, casual, confident)
- Company-specific customization
- Template library

### Application Tracking
- Notion pipeline (Applied > Phone > Interview > Offer > Rejected)
- Company research notes
- Salary tracking
- Follow-up reminders

### Auto-Tailoring
- Extract requirements from job posting
- Match resume keywords
- Generate custom cover letter
- Quality score before sending

## Commands
- "Add job application to [company]"
- "Tailor resume for [job posting]"
- "Generate cover letter for [role]"
- "Show application pipeline"
- "Follow up with [company]"

## Notion Database
- Company (name, url, industry)
- Position (title, salary, location)
- Status (Applied, Phone, Interview, Offer, Rejected)
- Notes (research, contacts, salary)
- Follow-up dates

## Workflow
1. User provides job URL
2. AI extracts requirements
3. Tailors resume keywords
4. Generates cover letter
5. Logs to Notion pipeline
6. Sets follow-up reminder

## Requirements
- Notion API
- Web search/fetch