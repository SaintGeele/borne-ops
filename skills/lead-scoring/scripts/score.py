#!/usr/bin/env python3
"""
Lead Scoring System
Score leads based on fit, budget, seriousness, and trust
"""

import sys
import json
import argparse

ICP_INDUSTRIES = ['real estate', 'law', 'finance', 'med spa', 'contractor', 'consulting', 'healthcare']
STATES = ['ct', 'ny', 'nj', 'ma', 'connecticut', 'new york', 'new jersey', 'massachusetts']

def score_industry(industry):
    """Score based on industry fit"""
    if not industry:
        return 0
    industry_lower = industry.lower()
    for icp in ICP_INDUSTRIES:
        if icp in industry_lower:
            return 15
    return 0

def score_size(size):
    """Score based on company size"""
    size_lower = size.lower() if size else ""
    if 'small' in size_lower or '1-10' in size_lower or '1-20' in size_lower:
        return 10
    elif 'medium' in size_lower or '11-50' in size_lower:
        return 10
    elif 'large' in size_lower or '50+' in size_lower:
        return 5
    return 5  # Default

def score_budget(budget):
    """Score based on budget indication"""
    budget_lower = budget.lower() if budget else ""
    if 'high' in budget_lower:
        return 25
    elif 'medium' in budget_lower:
        return 15
    elif 'low' in budget_lower:
        return 5
    # Check for implicit budget signals
    if '$' in budget_lower or 'budget' in budget_lower:
        return 15
    return 10

def score_seriousness(seriousness):
    """Score based on seriousness indicators"""
    serious_lower = seriousness.lower() if seriousness else ""
    score = 0
    
    if 'high' in serious_lower:
        return 25
    elif 'medium' in serious_lower:
        return 15
    elif 'low' in serious_lower:
        return 5
    
    # Check for signals
    if 'demo' in serious_lower or 'call' in serious_lower:
        score += 10
    if 'interested' in serious_lower or 'want' in serious_lower:
        score += 10
    if 'ask' in serious_lower or 'question' in serious_lower:
        score += 5
    
    return min(score, 25)

def score_trust(trust):
    """Score based on company trust factors"""
    trust_lower = trust.lower() if trust else ""
    
    if 'high' in trust_lower:
        return 20
    elif 'medium' in trust_lower:
        return 12
    elif 'low' in trust_lower:
        return 5
    
    score = 0
    if 'website' in trust_lower:
        score += 5
    if 'established' in trust_lower or 'years' in trust_lower:
        score += 10
    if 'social' in trust_lower:
        score += 5
    
    return min(score, 20)

def get_grade(score):
    """Get letter grade and action"""
    if score >= 80:
        return "A", "Hot", "Priority follow-up within 24h"
    elif score >= 60:
        return "B", "Warm", "Qualify, schedule call"
    elif score >= 40:
        return "C", "Cool", "Nurture with content"
    else:
        return "D", "Cold", "Polite decline or remove"

def score_lead(company, industry="", size="", budget="", seriousness="", trust=""):
    """Score a lead"""
    
    fit_score = score_industry(industry) + score_size(size)
    budget_score = score_budget(budget)
    serious_score = score_seriousness(seriousness)
    trust_score = score_trust(trust)
    
    total_score = fit_score + budget_score + serious_score + trust_score
    grade, category, action = get_grade(total_score)
    
    return {
        "company": company,
        "total": total_score,
        "grade": grade,
        "category": category,
        "action": action,
        "breakdown": {
            "fit": {"score": fit_score, "max": 30},
            "budget": {"score": budget_score, "max": 25},
            "seriousness": {"score": serious_score, "max": 25},
            "trust": {"score": trust_score, "max": 20}
        }
    }

def format_output(result):
    """Format the scoring result"""
    output = []
    output.append("=" * 60)
    output.append(f"LEAD SCORE: {result['company']}")
    output.append("=" * 60)
    
    output.append(f"\n### SCORE: {result['total']}/100 ({result['grade']} - {result['category']})")
    output.append(f"**Action:** {result['action']}")
    
    output.append("\n### BREAKDOWN")
    breakdown = result['breakdown']
    for category, data in breakdown.items():
        bar = "█" * (data['score'] * 10 // data['max']) + "░" * (10 - data['score'] * 10 // data['max'])
        output.append(f"  {category.title():15} {bar} {data['score']}/{data['max']}")
    
    output.append("\n" + "=" * 60)
    
    return "\n".join(output)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Lead Scoring")
    parser.add_argument("company", help="Company name")
    parser.add_argument("--industry", "-i", default="", help="Industry")
    parser.add_argument("--size", "-s", default="medium", help="Company size (small/medium/large)")
    parser.add_argument("--budget", "-b", default="medium", help="Budget (low/medium/high)")
    parser.add_argument("--seriousness", "-sr", default="medium", help="Seriousness (low/medium/high)")
    parser.add_argument("--trust", "-t", default="medium", help="Trust factors (low/medium/high)")
    parser.add_argument("--raw", "-r", action="store_true", help="Raw JSON output")
    
    args = parser.parse_args()
    
    result = score_lead(
        args.company,
        args.industry,
        args.size,
        args.budget,
        args.seriousness,
        args.trust
    )
    
    if args.raw:
        print(json.dumps(result, indent=2))
    else:
        print(format_output(result))