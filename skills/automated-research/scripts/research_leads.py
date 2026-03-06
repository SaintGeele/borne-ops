#!/usr/bin/env python3
"""
Automated Business Research v2
Find local businesses without websites using Tavily
"""

import json
import csv
import os
import argparse
from datetime import datetime
import urllib.request
import urllib.parse
import re

def load_api_key():
    cred_path = os.path.expanduser("~/.openclaw/credentials/tavily.json")
    try:
        with open(cred_path, "r") as f:
            data = json.load(f)
            return data.get("tavily", "")
    except:
        return None

def search_tavily(query, max_results=15):
    api_key = load_api_key()
    if not api_key:
        print("Error: No Tavily API key")
        return None
    
    payload = json.dumps({
        "query": query,
        "api_key": api_key,
        "max_results": max_results,
        "search_depth": "basic"
    }).encode('utf-8')
    
    try:
        req = urllib.request.Request(
            "https://api.tavily.com/search",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Search error: {e}")
        return None

def extract_business_name(title, url):
    """Extract clean business name from search result"""
    # Skip directories
    skip_words = ['yelp', 'google', 'facebook', 'linkedin', 'bbb', 'yellowpages', 
                 'houzz', 'angieslist', 'tripadvisor', 'zomato', 'opentable',
                 'directory', 'list', 'best', 'top', 'review']
    
    url_lower = url.lower()
    if any(word in url_lower for word in skip_words):
        return None
    
    # Clean up title
    name = title.split('|')[0].split('-')[0].split('—')[0].strip()
    name = re.sub(r'^\d+\.\s*', '', name)  # Remove "1. " prefix
    name = re.sub(r'\s*[-|]\s*.*$', '', name)
    
    if len(name) > 2 and len(name) < 80:
        return name
    return None

def check_for_website(business_name, area):
    """Check if business has a website"""
    query = f"{business_name} {area} official website"
    results = search_tavily(query, max_results=5)
    
    if not results:
        return {"has_website": "Unknown", "url": ""}
    
    for result in results.get("results", []):
        url = result.get("url", "").lower()
        title = result.get("title", "").lower()
        
        # Skip directories
        if any(d in url for d in ['yelp', 'google', 'facebook', 'linkedin', 'bbb', 'yellowpages', 'houzz']):
            continue
        
        # Look for website indicators
        if any(w in url for w in ['.com/', '.net/', '.org/', '.io/', '/website']):
            return {"has_website": "Yes", "url": result.get("url", "")}
        if 'official' in title or 'website' in title:
            return {"has_website": "Yes", "url": result.get("url", "")}
    
    return {"has_website": "No", "url": ""}

def research_area(area, industries):
    print(f"\n=== {area} ===")
    
    all_businesses = []
    
    for industry in industries:
        print(f"\n[{industry}]")
        
        # Better search queries
        queries = [
            f"{industry} in {area} phone address contact",
            f"{industry} {area} CT phone number",
        ]
        
        for query in queries:
            results = search_tavily(query, max_results=15)
            if not results:
                continue
            
            for result in results.get("results", []):
                name = extract_business_name(result.get("title", ""), result.get("url", ""))
                
                if name and name not in [b['Business Name'] for b in all_businesses]:
                    print(f"  → {name}")
                    
                    # Check for website
                    website = check_for_website(name, area)
                    
                    if website["has_website"] == "No":
                        all_businesses.append({
                            "Business Name": name,
                            "Industry": industry,
                            "Area": area,
                            "Source": result.get("url", "")[:50],
                            "Has Website": website["has_website"],
                            "Website": website["url"],
                            "Date": datetime.now().strftime("%Y-%m-%d"),
                            "Status": "New"
                        })
    
    return all_businesses

def save_to_csv(businesses, filename="local_leads.csv"):
    if not businesses:
        print("No businesses found")
        return
    
    fieldnames = ["Business Name", "Industry", "Area", "Source", "Has Website", "Website", "Date", "Status"]
    
    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(businesses)
    
    no_site = len([b for b in businesses if b["Has Website"] == "No"])
    print(f"\n✓ {len(businesses)} businesses → {no_site} without websites")
    return filename

AREAS = ["Milford CT", "New Haven CT", "Bridgeport CT", "Stamford CT", "Hartford CT"]
INDUSTRIES = ["restaurant", "auto repair", "hvac", "plumber", "salon", "barber", "pet grooming", "home cleaning"]

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--area", "-a", default="")
    parser.add_argument("--industry", "-i", default="")
    parser.add_argument("--full", "-f", action="store_true")
    parser.add_argument("--output", "-o", default="local_leads.csv")
    args = parser.parse_args()
    
    businesses = []
    
    if args.full:
        for area in AREAS:
            businesses.extend(research_area(area, INDUSTRIES))
    elif args.area:
        inds = args.industry.split(',') if args.industry else INDUSTRIES
        businesses = research_area(args.area, inds)
    else:
        businesses = research_area("Milford CT", ["restaurant"])
    
    if businesses:
        save_to_csv(businesses, args.output)