#!/usr/bin/env python3
"""
Supadata Transcript Fetcher
Fetches transcripts from YouTube, TikTok, Twitter, Instagram
"""

import sys
import json
import os

def load_api_key():
    """Load Supadata API key from credentials"""
    cred_path = os.path.expanduser("~/.openclaw/credentials/supadata.json")
    try:
        with open(cred_path, "r") as f:
            data = json.load(f)
            return data.get("supadata", "")
    except Exception as e:
        print(f"Error loading API key: {e}", file=sys.stderr)
        return None

def fetch_transcript(url: str, text_only: bool = False):
    """Fetch transcript using Supadata API"""
    import urllib.request
    import urllib.parse
    
    api_key = load_api_key()
    if not api_key:
        print("Error: No API key found. Add to ~/.openclaw/credentials/supadata.json", file=sys.stderr)
        sys.exit(1)
    
    # Build URL
    base_url = "https://api.supadata.ai/v1/youtube/transcript"
    if text_only:
        base_url += "?text=true"
    else:
        base_url += "?text=false"
    
    # Add URL parameter
    encoded_url = urllib.parse.quote(url, safe='')
    full_url = f"{base_url}&url={url}"
    
    # Make request
    req = urllib.request.Request(full_url)
    req.add_header("x-api-key", api_key)
    req.add_header("Accept", "application/json")
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            
            if text_only:
                # Return plain text
                if "content" in data:
                    text_parts = []
                    for item in data["content"]:
                        if isinstance(item, dict) and "text" in item:
                            text_parts.append(item["text"])
                        elif isinstance(item, str):
                            text_parts.append(item)
                    return "\n".join(text_parts)
                return str(data)
            else:
                # Return JSON
                return json.dumps(data, indent=2)
                
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.reason}", file=sys.stderr)
        try:
            error_body = json.loads(e.read().decode())
            print(json.dumps(error_body, indent=2), file=sys.stderr)
        except:
            pass
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 get_transcript.py <url> [text-only]", file=sys.stderr)
        print("Example: python3 get_transcript.py 'https://www.youtube.com/watch?v=VIDEO_ID'", file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    text_only = len(sys.argv) > 2 and sys.argv[2].lower() == "true"
    
    result = fetch_transcript(url, text_only)
    print(result)
