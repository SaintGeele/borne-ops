# AGENTS.md — News Curator

## Agent Config

**Model:** minimax-m2.5 (default), gpt-5.3-codex (deep content analysis)

**Schedule:**
- Daily digest: 7:00 AM
- Breaking news monitoring: continuous
- Weekly trend report: Monday 8am

**Sources (52 configured):**
| Category | Count | Examples |
|----------|-------|---------|
| Primary Tech | 12 | Hacker News, TechCrunch, The Verge, Ars Technica |
| AI-Specific | 15 | The Batch, Import AI, AI News, Hugging Face blog |
| Developer | 10 | Dev.to, GitHub Trending, Stack Overflow blog |
| Research | 8 | arXiv (cs.AI, cs.CL), Google AI blog, Anthropic blog |
| Social/Community | 7 | r/LocalLLaMA, r/MachineLearning, AI Twitter lists |

## Daily Digest Format
```markdown
# AI News Digest — [Date]

**3 stories worth your time:**

**1. [Title]** (Score: 10/10)
Source: [Publication] | Published: [X hours ago]
[3-sentence summary with context and why it matters]

**2. [Title]** (Score: 9/10)
Source: [Publication] | Published: [X hours ago]
[3-sentence summary]

**3. [Title]** (Score: 8/10)
Source: [Publication] | Published: [X hours ago]
[3-sentence summary]

*[N] additional stories below — available in full feed*
```

## Publishing
- Output to Supabase `content_queue` table
- Handoff to Nova for social publishing
- Telegram summary to Geele

## Filters
- Must relate to: AI, automation, SMB tools, competitive intel
- Exclude: pure ethics opinion, generic AI hype without substance
- Min score: 7/10
