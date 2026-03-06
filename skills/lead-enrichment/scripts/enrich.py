#!/usr/bin/env python3
"""
Lead Enrichment Tool
Research company information using Tavily search
"""

import sys
import json
import os
import argparse
import urllib.request
import urllib.parse
import re

def load_api_key():
    """Load Tavily API key from credentials"""
    cred_path = os.path.expanduser("~/.openclaw/credentials/tavily.json")
    try:
        with open(cred_path, "r") as f:
            data = json.load(f)
            return data.get("tavily", "")
    except Exception as e:
        print(f"Error loading API key: {e}", file=sys.stderr)
        return None

def extract_company_name(input_str):
    """Extract company name from URL or use input as name"""
    # If it's a URL, extract domain
    if input_str.startswith(('http://', 'https://')):
        domain = input_str
        if '://' in input_str:
            domain = input_str.split('://')[1]
        # Remove www, get main domain
        domain = domain.replace('www.', '').split('/')[0]
        # Convert to company name (remove TLD, capitalize)
        company = domain.split('.')[0]
        return company.capitalize(), domain
    else:
        # Use input as company name
        return input_str, input_str.lower().replace(' ', '')

def search_tavily(query, include_answer=True, max_sources=5):
    """Search using Tavily API (POST method)"""
    api_key = load_api_key()
    if not api_key:
        print("Error: No Tavily API key. Add to ~/.openclaw/credentials/tavily.json", file=sys.stderr)
        sys.exit(1)
    
    payload = json.dumps({
        "query": query,
        "api_key": api_key,
        "max_results": max_sources,
        "search_depth": "basic"
    }).encode('utf-8')
    
    try:
        req = urllib.request.Request(
            "https://api.tavily.com/search",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        )
        
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            return data
            
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

def format_enrichment(company_name, domain, data, focus=""):
    """Format enrichment results"""
    output = []
    output.append("=" * 50)
    output.append(f"COMPANY ENRICHMENT: {company_name}")
    output.append("=" * 50)
    
    # AI Answer if available
    if data.get("answer"):
        output.append("\n### OVERVIEW")
        output.append(data["answer"])
    
    # Key findings from sources
    if data.get("results"):
        output.append("\n### KEY FINDINGS")
        
        # Extract key info from results
        descriptions = []
        news_items = []
        
        for result in data["results"][:5]:
            title = result.get("title", "")
            content = result.get("content", "")
            url = result.get("url", "")
            
            # Look for company description signals
            if any(x in content.lower() for x in ["company", "provides", "offers", "Founded", "employees", "team"]):
                if len(descriptions) < 3:
                    # Clean and truncate content
                    clean = content[:300].replace('\n', ' ').strip()
                    if clean:
                        descriptions.append(f"• {clean}")
            
            # Look for news
            if any(x in title.lower() for x in ["news", "ann", "launchounceses", "raises", "hires", "2024", "2025", "2026"]):
                news_items.append(f"• {title[:100]}")
        
        if descriptions:
            output.append("\n**Company Details:**")
            for d in descriptions[:3]:
                output.append(d)
        
        if news_items:
            output.append("\n**Recent News:**")
            for n in news_items[:3]:
                output.append(n)
    
    # Focus-specific search results
    if focus:
        focus_query = f"{domain} {focus}"
        focus_results = search_tavily(focus_query, max_sources=3)
        
        if focus_results.get("results"):
            output.append(f"\n### {focus.upper().replace('_', ' ')}")
            for result in focus_results["results"][:3]:
                title = result.get("title", "")
                content = result.get("content", "")[:150].replace('\n', ' ').strip()
                output.append(f"\n**{title}**")
                output.append(f"   {content}...")
    
    # Outreach suggestions
    output.append("\n" + "=" * 50)
    output.append("### OUTREACH SUGGESTIONS")
    output.append("=" * 50)
    
    suggestions = []
    if data.get("answer"):
        suggestions.append("• Reference their specific industry position in your intro")
    if len(news_items) > 0:
        suggestions.append("• Mention a recent news item to show research")
    suggestions.append("• Personalize value prop based on company size/needs")
    suggestions.append("• Lead with a specific pain point relevant to their business")
    
    for s in suggestions:
        output.append(s)
    
    output.append("\n" + "=" * 50)
    output.append(f"Sources: {len(data.get('results', []))} results found")
    
    return "\n".join(output)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Lead Enrichment Tool")
    parser.add_argument("company", help="Company name or website URL")
    parser.add_argument("--focus", "-f", type=str, default="", help="Focus area (decision_makers, news, tech)")
    parser.add_argument("--raw", "-r", action="store_true", help="Raw JSON output")
    
    args = parser.parse_args()
    
    company_name, domain = extract_company_name(args.company)
    
    # Build search query
    if args.focus:
        query = f"{domain} {args.focus} company about"
    else:
        query = f"{domain} company about description employees founded"
    
    data = search_tavily(query)
    
    if args.raw:
        print(json.dumps(data, indent=2))
    else:
        print(format_enrichment(company_name, domain, data, args.focus))
