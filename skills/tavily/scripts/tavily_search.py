#!/usr/bin/env python3
"""
Tavily Search API
Search the web using Tavily - optimized for AI agents
"""

import sys
import json
import os
import argparse
import urllib.request
import urllib.parse

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

def search(query, include_answer=False, max_sources=5, search_depth="basic"):
    """Search using Tavily API (POST method)"""
    api_key = load_api_key()
    if not api_key:
        print("Error: No API key. Add to ~/.openclaw/credentials/tavily.json", file=sys.stderr)
        sys.exit(1)
    
    payload = json.dumps({
        "query": query,
        "api_key": api_key,
        "max_results": max_sources,
        "search_depth": search_depth
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
            
            if "detail" in data and "error" in data:
                print(f"Tavily Error: {data['detail']['error']}", file=sys.stderr)
                sys.exit(1)
            
            return data
            
    except urllib.error.HTTPError as e:
        error_body = json.loads(e.read().decode())
        print(f"HTTP {e.code}: {error_body.get('detail', {}).get('error', str(error_body))}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

def format_results(data, show_answer=True, show_sources=True):
    """Format search results for display"""
    output = []
    
    # AI Answer if available
    if show_answer and data.get("answer"):
        output.append("=" * 40)
        output.append("ANSWER:")
        output.append(data["answer"])
        output.append("=" * 40)
        output.append("")
    
    # Results
    if show_sources and data.get("results"):
        output.append("SOURCES:")
        for i, result in enumerate(data["results"], 1):
            title = result.get("title", "No title")
            url = result.get("url", "")
            content = result.get("content", "")
            
            output.append(f"\n{i}. {title}")
            output.append(f"   {url}")
            if content:
                # Truncate long content
                if len(content) > 200:
                    content = content[:200] + "..."
                output.append(f"   {content}")
    
    return "\n".join(output)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tavily Search")
    parser.add_argument("query", help="Search query")
    parser.add_argument("--answer", "-a", action="store_true", help="Include AI answer")
    parser.add_argument("--sources", "-s", type=int, default=5, help="Number of sources")
    parser.add_argument("--depth", "-d", choices=["basic", "advanced", "fast", "ultra-fast"], default="basic", help="Search depth")
    parser.add_argument("--raw", "-r", action="store_true", help="Raw JSON output")
    
    args = parser.parse_args()
    
    data = search(args.query, include_answer=args.answer, max_sources=args.sources, search_depth=args.depth)
    
    if args.raw:
        print(json.dumps(data, indent=2))
    else:
        print(format_results(data, show_answer=args.answer, show_sources=True))
