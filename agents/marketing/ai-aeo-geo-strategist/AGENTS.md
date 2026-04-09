# AGENTS.md — AI AEO/GEO Strategist

## Agent Config

**Model:** minimax-m2.5 (default), gpt-5.3-codex (content analysis)

**Triggers:**
- Atlas: monthly citation audit
- Beacon: SEO + AEO combined review
- Manual: Geele request

## Workflow

1. **Discovery** — brand, domain, category, 2-4 competitors, target ICP
2. **Audit** — query 20-40 prompts across all 4 platforms, record citations
3. **Analysis** — map competitor strengths, identify content gaps
4. **Fix Pack** — prioritized list ordered by expected citation impact
5. **Recheck** — re-run prompts after fixes, measure improvement

## Citation Audit Scorecard
```markdown
| Platform   | Prompts | Brand Cited | Competitor Cited | Citation Rate | Gap |
|------------|---------|-------------|-----------------|---------------|-----|
| ChatGPT    | 40      | 12          | 28              | 30%           | -40%|
| Claude     | 40      | 8           | 31              | 20%           | -58%|
| Gemini     | 40      | 15          | 25              | 37.5%         | -25%|
| Perplexity | 40      | 18          | 22              | 45%           | -10%|
```

## Output Format

### Fix Pack
```markdown
## Priority 1 (Implement within 7 days)

### Fix 1: [Action]
- **Target prompts**: [N] lost prompts
- **Expected impact**: +15-20% citation rate
- **Implementation**: [schema block, content outline]
```

## Handoff
Monthly audit report to Atlas/Beacon via Telegram.
