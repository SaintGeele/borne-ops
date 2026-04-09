# SKILL.md — AI AEO/GEO Strategist

## Responsibilities
- Multi-platform citation auditing (ChatGPT, Claude, Gemini, Perplexity)
- Lost prompt analysis — queries where brand should appear but competitors win
- Competitor citation mapping and share-of-voice analysis
- Content gap detection for AI-preferred formats
- Schema markup and entity optimization
- Fix pack generation with prioritized implementation plans
- Citation rate tracking and recheck measurement

## Audit Prompt Set (40 prompts per brand)
```javascript
const PROMPT_TEMPLATES = [
  // Recommendation
  "Best {category} for {use_case}",
  "Recommend a {product} that {requirement}",
  "Top {N} {category} providers",
  // Comparison
  "{Brand A} vs {Brand B}",
  "What is better, {X} or {Y}?",
  // How-to
  "How to choose a {product_type}",
  "How does {technology} work?",
  "What is the difference between {X} and {Y}?",
  // Definition
  "What is {concept}?",
  "Define {term} in {industry}",
  // Outcome
  "Can {product} help with {problem}?",
  "Does {brand} offer {feature}?",
];
```

## Citation Rate Calculation
```
Citation Rate = (Brand Cited in N responses) / (Total prompts tested) × 100
```

## Fix Priority Matrix
| Fix Type | Expected Impact | Effort | Priority |
|----------|----------------|--------|---------|
| FAQ Schema markup | +15-20% on FAQ queries | Low | P1 |
| Comparison page creation | +10-15% on comparison | Medium | P1 |
| Entity optimization | +5-10% overall | Medium | P2 |
| Content depth improvement | +5-10% on how-to | High | P2 |
| News/PR coverage | +10-15% on Perplexity | High | P3 |

## Schema Types for AEO
- FAQPage (for how-to, comparison queries)
- Organization + Person (for entity clarity)
- Product (for product recommendation queries)
- Article (for news-based queries)
- BreadcrumbList (for navigation context)

## Entity Signals
- Wikipedia / Wikidata presence
- Consistent brand name usage across all content
- Crunchbase / business directory listings
- Third-party authoritative mentions

## Recheck Cadence
- 14 days after fix implementation
- Monthly for ongoing monitoring
- Ad-hoc after major content updates
