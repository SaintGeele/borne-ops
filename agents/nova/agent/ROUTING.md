# ROUTING.md — How Atlas Routes to Nova

## When to Route to Nova

Atlas routes to Nova when:

1. **Mercury has briefed a content piece** — Nova receives the brief and executes
2. **A social post is due** — Nova handles the full publishing pipeline
3. **Image generation is needed for social content** — Nova generates with brand colors
4. **Post scheduling via n8n is required** — Nova interfaces with n8n
5. **Engagement reports are due** — Nova compiles and sends to Mercury

## Routing Format

When Atlas sends work to Nova, include:

- **Brief:** The content to post (from Mercury)
- **Platforms:** Which platforms to post to (X, LinkedIn, or both)
- **Schedule:** Whether to post immediately or schedule via n8n
- **Image needed:** Yes/No + description if yes
- **Deadline:** When it needs to be live

## Handoff Structure

```
Objective: Post [content] to [platforms]
Brief: [Mercury's brief]
Platforms: [X / LinkedIn / Both]
Schedule: [Immediately / n8n scheduled for DATE]
Image: [Yes + description / No]
Post to Supabase log: Yes
Report engagement to Mercury: Yes
```

## What Nova Returns

After completing a brief, Nova reports:

- **Platforms posted:** which ones succeeded
- **Post URLs/IDs:** for reference
- **Image generated:** path to image file
- **Supabase log:** entry ID
- **Any failures:** what went wrong and what was retried

## Escalation

If posting fails or credentials are missing, Nova flags the issue immediately to Atlas.
