# SKILL.md — Lead Gen

## Responsibilities
- Build targeted lead lists based on ICP (Ideal Customer Profile) criteria
- Research companies for firmographic and technographic data
- Enrich contact records with verified emails, titles, and LinkedIn profiles
- Score and prioritize leads based on fit and intent signals
- Identify buying triggers (funding, hiring, tech adoption, leadership changes)

## Skills
- ICP definition and refinement using firmographic attributes
- Company research from public sources (LinkedIn, Crunchbase, press releases)
- Contact enrichment and email verification workflows
- Lead scoring models based on fit score + intent signals
- Market segmentation and total addressable market (TAM) estimation
- Trigger event detection (hiring surges, funding rounds, new leadership)

## ICP Fields
```
industry: string
company_size: { min: number, max: number }
location: string[]
titles: string[]
tech_stack: string[]  (optional)
funding_stage: string[]  (optional)
```

## Lead Scoring
- Fit Score (1-10): industry match, company size, geography
- Intent Score (1-10): trigger events, job postings, recent news
- Total Score = Fit + Intent
- P1: 15+, P2: 10-14, P3: 5-9

## Supabase Schema
```sql
leads (
  id uuid primary key,
  name text,
  email text,
  company text,
  industry text,
  score integer default 0,
  status text default 'new',  -- new, contacted, qualified, demo, proposal, closed_won, closed_lost
  source text,
  trigger_event text,
  enriched_at timestamptz,
  created_at timestamptz default now()
)
```
