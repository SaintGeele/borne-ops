#!/usr/bin/env python3
"""
Market Research Tool
Crawl competitor websites for documentation, pricing, and market intelligence
"""

import sys
import json
import os
import argparse
import urllib.parse
import re

def extract_domain(url):
    """Extract domain from URL"""
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    parsed = urllib.parse.urlparse(url)
    return parsed.netloc.replace('www.', ''), url

def fetch_page(url):
    """Fetch page using curl"""
    import subprocess
    
    try:
        result = subprocess.run([
            'curl', '-s', '-L', 
            '-H', 'User-Agent: Mozilla/5.0 (compatible; MarketResearchBot/1.0)',
            url
        ], capture_output=True, text=True, timeout=30)
        
        return result.stdout
    except Exception as e:
        return f"Error fetching {url}: {e}"

def analyze_pricing(content):
    """Extract pricing information"""
    pricing_signs = []
    
    # Look for common pricing patterns
    price_patterns = [
        r'\$[\d,]+/?(?:mo|month)?',
        r'\$[\d,]+/?(?:yr|year)?',
        r'USD\s*[\d,]+',
        r'per\s*(?:user|month|year|seat)',
        r'free\s*tier',
        r'enterprise',
        r'pricing',
        r'cost',
        r'fee'
    ]
    
    content_lower = content.lower()
    
    for pattern in price_patterns:
        matches = re.findall(pattern, content_lower, re.IGNORECASE)
        if matches:
            pricing_signs.extend(matches[:3])
    
    # Look for tier keywords
    tiers = []
    if 'starter' in content_lower or 'basic' in content_lower:
        tiers.append('Starter/Basic')
    if 'pro' in content_lower or 'professional' in content_lower:
        tiers.append('Pro')
    if 'enterprise' in content_lower:
        tiers.append('Enterprise')
    if 'business' in content_lower:
        tiers.append('Business')
    
    return {
        'signals': list(set(pricing_signs))[:5],
        'tiers': tiers
    }

def analyze_features(content):
    """Extract feature information"""
    features = []
    
    # Look for feature lists
    feature_patterns = [
        r'(?:\d+\.\s*|\•\s*|\-\s*)([A-Z][a-zA-Z\s]{3,50})',
    ]
    
    # Common feature keywords
    feature_keywords = [
        'automation', 'ai', 'machine learning', 'integration',
        'analytics', 'dashboard', 'reporting', 'security',
        'encryption', 'sso', 'api', 'webhook', 'workflow',
        'templates', 'custom', 'mobile', 'cloud', 'on-premise'
    ]
    
    content_lower = content.lower()
    found = []
    for kw in feature_keywords:
        if kw in content_lower:
            found.append(kw)
    
    return list(set(found))[:10]

def analyze_company(content, url):
    """Extract company information"""
    info = {
        'description': '',
        'founded': '',
        'employees': '',
        'target': ''
    }
    
    # Look for founded year
    founded_match = re.search(r'(?:founded|established|started)\s+(?:in\s+)?(\d{4})', content, re.IGNORECASE)
    if founded_match:
        info['founded'] = founded_match.group(1)
    
    # Look for employee count
    emp_match = re.search(r'(\d+[\d,]*)\s*(?:employees|workers|team members)', content, re.IGNORECASE)
    if emp_match:
        info['employees'] = emp_match.group(1)
    
    # Look for description (first paragraph)
    paragraphs = content.split('\n\n')
    for p in paragraphs[:5]:
        if len(p) > 100 and len(p) < 500:
            info['description'] = p.strip()[:300]
            break
    
    return info

def search_tavily_about(company):
    """Get additional context from Tavily"""
    import urllib.request
    
    cred_path = os.path.expanduser("~/.openclaw/credentials/tavily.json")
    try:
        with open(cred_path, "r") as f:
            data = json.load(f)
            api_key = data.get("tavily", "")
    except:
        return None
    
    if not api_key:
        return None
    
    try:
        payload = json.dumps({
            "query": f"{company} company about overview",
            "api_key": api_key,
            "max_results": 3,
            "search_depth": "basic"
        }).encode('utf-8')
        
        req = urllib.request.Request(
            "https://api.tavily.com/search",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        
        with urllib.request.urlopen(req, timeout=20) as response:
            return json.loads(response.read().decode())
    except:
        return None

def format_output(company_name, domain, content, pricing, features, company_info, tavily_data):
    """Format research output"""
    output = []
    output.append("=" * 60)
    output.append(f"MARKET RESEARCH: {company_name}")
    output.append("=" * 60)
    
    # Company Overview
    output.append("\n### COMPANY OVERVIEW")
    if company_info['description']:
        output.append(company_info['description'])
    if company_info['founded']:
        output.append(f"\n• Founded: {company_info['founded']}")
    if company_info['employees']:
        output.append(f"• Employees: {company_info['employees']}")
    
    # From Tavily if available
    if tavily_data and tavily_data.get('answer'):
        output.append(f"\n• {tavily_data['answer'][:200]}...")
    
    # Pricing
    output.append("\n" + "=" * 60)
    output.append("### PRICING")
    if pricing['tiers']:
        output.append(f"**Tiers found:** {', '.join(pricing['tiers'])}")
    if pricing['signals']:
        output.append("**Pricing signals:**")
        for s in pricing['signals'][:5]:
            output.append(f"  • {s}")
    else:
        output.append("No explicit pricing found")
    
    # Features
    output.append("\n" + "=" * 60)
    output.append("### FEATURES")
    if features:
        output.append("**Detected features:**")
        for f in features:
            output.append(f"  • {f}")
    else:
        output.append("No specific features detected")
    
    # Market Position
    output.append("\n" + "=" * 60)
    output.append("### MARKET POSITION")
    if company_info['target']:
        output.append(f"**Target market:** {company_info['target']}")
    
    # Opportunities
    output.append("\n" + "=" * 60)
    output.append("### OPPORTUNITIES FOR BORNE")
    output.append("**Potential differentiators:**")
    output.append("  • Price undercutting (if SMB focus)")
    output.append("  • Better automation ease-of-use")
    output.append("  • Superior security focus")
    output.append("  • Better integration ecosystem")
    
    output.append("\n" + "=" * 60)
    output.append(f"Research source: {domain}")
    
    return "\n".join(output)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Market Research Tool")
    parser.add_argument("target", help="Competitor URL or name")
    parser.add_argument("--focus", "-f", choices=["pricing", "features", "docs"], default="all", help="Focus area")
    parser.add_argument("--compare", "-c", action="store_true", help="Compare multiple (comma-separated)")
    parser.add_argument("--raw", "-r", action="store_true", help="Raw content only")
    
    args = parser.parse_args()
    
    if args.compare:
        # Handle multiple competitors
        targets = [t.strip() for t in args.target.split(',')]
        for t in targets:
            domain, url = extract_domain(t)
            print(f"\nResearching {domain}...")
            content = fetch_page(url)
            
            pricing = analyze_pricing(content)
            features = analyze_features(content)
            company_info = analyze_company(content, url)
            tavily_data = search_tavily_about(domain.split('.')[0])
            
            print(format_output(domain.split('.')[0], domain, content, pricing, features, company_info, tavily_data))
    else:
        domain, url = extract_domain(args.target)
        
        # Append focus to URL if specified
        if args.focus != 'all' and args.focus not in url:
            url = url.rstrip('/')
            if args.focus == 'pricing':
                url += '/pricing'
            elif args.focus == 'features':
                url += '/features'
        
        print(f"Researching {domain}...")
        content = fetch_page(url)
        
        pricing = analyze_pricing(content)
        features = analyze_features(content)
        company_info = analyze_company(content, url)
        tavily_data = search_tavily_about(domain.split('.')[0])
        
        if args.raw:
            print(content[:5000])
        else:
            print(format_output(domain.split('.')[0], domain, content, pricing, features, company_info, tavily_data))
