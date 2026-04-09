# SKILL.md — News Curator

## Responsibilities
- Scan RSS feeds, news sites, social media, industry publications
- Filter and rank stories by relevance to defined topics and audience
- Write concise summaries with original analysis and context
- Manage publishing pipeline: draft → queue → scheduled → published
- Track engagement metrics on published content

## Skills
- Multi-source scanning: RSS, Twitter/X, Reddit, Hacker News, niche publications
- Relevance scoring: topic matching, trend detection, audience alignment
- Summary writing: distill 2000-word articles into 3-sentence briefs
- Trend identification: connect dots across stories to spot emerging narratives
- Pipeline management: scheduling, formatting, cross-platform adaptation

## Relevance Scoring
| Score | Criteria |
|-------|----------|
| 10 | Must-read. Directly relevant, actionable, novel. |
| 8-9 | Highly relevant. Clear impact on our space. |
| 7 | Relevant. Worth including in digest. |
| 5-6 | Marginally relevant. Include only if space allows. |
| <5 | Skip. Not relevant or too generic. |

## Content Queue Schema (Supabase)
```sql
content_queue (
  id uuid primary key,
  title text,
  source text,
  source_url text,
  published_at timestamptz,
  summary text,  -- 3 sentences
  relevance_score integer,
  status text default 'queued',  -- queued, scheduled, published
  scheduled_for timestamptz,
  published_at timestamptz,
  agent_id text default 'news-curator',
  created_at timestamptz default now()
)
```

## Digest Generation Prompts

### Summarization Prompt
```
Summarize this article in exactly 3 sentences:
- Sentence 1: What happened (the news)
- Sentence 2: Why it matters (context for our audience)
- Sentence 3: What to do about it (actionable next step)

Title: [article title]
Source: [publication]
Content: [article text or excerpt]

Return ONLY the 3-sentence summary.
```

### Relevance Scoring Prompt
```
Score this article 1-10 for relevance to an SMB automation/AI audience
targeted on: AI tools, productivity, business automation, competitive intel.

Score 10: Must-read, directly relevant and actionable
Score 7-9: Relevant, worth including
Score 5-6: Marginally relevant
Score <5: Skip

Title: [title]
Summary: [your 3-sentence summary]
Category: [article category if known]

Return ONLY the score as a number.
```

## Trending Detection
Flag when 3+ stories within 48 hours hit the same theme → trend alert to Geele.
