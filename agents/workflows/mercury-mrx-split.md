# Mercury / MrX — Role Split

## The Problem
Both Mercury and MrX had "content" in their descriptions. The line was unclear.
This is the complete, mechanical solution.

---

## Mercury — Content Strategy

**Owns: WHAT gets made and WHY.**

### Every Monday 8am — Post Content Brief
1. Post brief to Supabase `content_briefs` table:
   - week, topic, platforms, audience, outcome, must_haves, brand_notes
2. Set status='open', assigned_to='MrX'
3. Message MrX on Telegram: "Brief is ready: [topic]. Check Supabase."

### After MrX Delivers
1. Review MrX's drafts against the brief
2. On-brand → approve, move to Inspector for QA
3. Off-brand → send back with specific notes, MrX revises

---

## MrX — Content Execution

**Owns: CREATING what Mercury briefs.**

### Every Monday Morning
1. Check Supabase `content_briefs` for assigned briefs
2. If none → message Mercury on Telegram: "No brief this week?"
3. Once assigned → create content per brief

### Creating Content
1. Read brief: topic, platforms, audience, outcome, must_haves
2. Create content to spec
3. Save to Supabase `content_bank` with:
   - status='draft'
   - brief_id (links back to the brief)
4. Update brief's content_ids array

---

## The Full Pipeline

```
Monday 8am: Mercury posts brief to Supabase
             ↓ messages MrX
Monday: MrX creates content → content_bank (draft)
             ↓
Mercury: Brand review
  ✓ on-brand → status=approved → Inspector
  ✗ off-brand → notes → MrX revises
             ↓
Inspector: QA → status=approved
             ↓
Published
```

**Rule: Nothing goes to Inspector without Mercury's brand approval.**

---

## Supabase Tables

| Table | Owner | Purpose |
|-------|-------|---------|
| `content_briefs` | Mercury | Briefs from Mercury to MrX |
| `content_brief_comments` | Both | Discussion on briefs |
| `content_bank` | MrX | Content MrX creates |

---

## Escalation

| Issue | Goes to |
|-------|---------|
| No brief posted by Monday 9am | MrX → message Mercury |
| Brief is unclear | MrX → message Mercury |
| MrX not delivering | Mercury → Atlas |
| Technical issue | Atlas → Nexus |
| Brand crisis | Geele immediately |

---

## Naming

Brief: "brief-[product]-[campaign]-[v#]"
Example: "brief-ai-receptionist-dental-outreach-v1"

Content: "tweet-ai-receptionist-dental-outreach-v1"
Example: "email-ai-receptionist-follow-up-v2"

Both link back to the same brief_id.
